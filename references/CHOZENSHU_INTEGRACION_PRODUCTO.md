---
tipo: informe-tecnico
proyecto: apex-powerscaling-engine
seccion: integracion-producto
tags: [apex, codex, chozenshu, integracion, react, motor-combate]
version: 1.0.0
fecha: 2026-09-15
---

# ⚙️ Integración del Códice Chōzenshū en APEX (Web + Motor de Juego)

> **Estado: DESPLEGADO Y VERIFICADO EN NAVEGADOR.**
> Pipeline: `corpus → datasets → bundle navegador → servicio → motor → UI`.

---

## 1. Arquitectura de la integración

```
┌──────────────────────────── PRECOMPILADO (Node, offline) ────────────────────────────┐
│  src/data/referencias/*.json  (7 datasets, 1,5 MB)                                   │
│            │                                                                          │
│            ▼   buildApexCodex.mjs  (parsea, compacta, indexa, mapea al roster)        │
│  public/data/apex-codex.json       114 KB   ← bundle principal (se carga al abrir)    │
│  public/data/apex-codex-deep.json  814 KB   ← dossier, lazy (solo al buscar)          │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────── RUNTIME (navegador) ──────────────────────────────────┐
│  src/services/chozenshuCodex.js   ← fetch memoizado + índices + búsqueda + tolerante  │
│            │                                                                          │
│            ├──► src/components/ChozenshuCodexModal.jsx   (Códice global, 5 pestañas)  │
│            ├──► src/components/CharacterCanonPanel.jsx   (pestaña por personaje)      │
│            └──► src/services/simulationEngine.js         (bloque de pasivas al LLM)   │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**Principio rector:** la integración es **aditiva y tolerante a fallos**. Si el bundle no existe
o el fetch falla, el modal muestra un aviso y **todo el resto de la app funciona igual**.

---

## 2. Archivos creados / modificados

| Acción | Archivo | Detalle |
|---|---|---|
| 🆕 | `src/scripts/chozenshu/buildApexCodex.mjs` | Empaqueta los datasets para el navegador |
| 🆕 | `src/services/chozenshuCodex.js` | Servicio de acceso (fetch + caché + índices) |
| 🆕 | `src/components/ChozenshuCodexModal.jsx` | Códice global, 5 pestañas |
| 🆕 | `src/components/CharacterCanonPanel.jsx` | Panel canónico dentro de la ficha |
| ✏️ | `src/services/simulationEngine.js` | Import + `formatCanonPassives()` + inyección |
| ✏️ | `src/components/CharacterModal.jsx` | Pestaña 9 «Códice Chōzenshū» |
| ✏️ | `src/components/Navbar.jsx` | Botón «Códice» + icono `BookMarked` |
| ✏️ | `src/App.jsx` | Lazy import + estado + render del modal |
| ✏️ | `server.cjs` | Ruta estática `/data` (dist + public) |

---

## 3. Capa de datos — bundle del navegador

```powershell
node src/scripts/chozenshu/buildApexCodex.mjs
```

```text
=== APEX CODEX BUILDER ===
  apex-codex.json         114.3 KB
  apex-codex-deep.json    814.2 KB
  tecnicas        211 (104 atestiguadas)
  fuerzas combate 38
  cronologia      75
  pasivas         10  (cobertura 347 personajes DB)
  personajes DB   351
  personajes con tecnicas mapeadas: 80
```

Optimizaciones aplicadas al bundle:
- Ocurrencias de técnicas **truncadas a 8 páginas por tomo** (procedencia suficiente, sin inflar el JSON).
- Campos renombrados a claves cortas (`es`, `ro`, `ty`, `occ`) → ~40 % menos bytes.
- **Índice inverso** `byCharacter` precalculado en build time (la UI no itera 211 técnicas por render).
- Cronología **filtrada**: se descartan las «fechas de publicación» que contaminaban el dataset crudo.
- El dossier (1,2 MB) queda **fuera del bundle principal**.

---

## 4. Servicio runtime — `chozenshuCodex.js`

| Función | Tipo | Descripción |
|---|---|---|
| `loadCodex()` | async | Fetch memoizado del bundle principal. Nunca lanza. |
| `loadCodexDeep()` | async | Fetch del dossier (solo al pulsar «Buscar en 3.202 bloques»). |
| `getTechniquesForCharacter(id)` | sync | Técnicas del personaje vía índice inverso |
| `getBattlePowersForCharacter(id)` | sync | FC canónicas del personaje |
| `getPassivesForCharacter(char)` | sync | Pasivas activas (motor determinista) |
| `getPassivePromptBlock(char)` | sync | Bloque de texto para el prompt del LLM |
| `searchCodex(q)` | sync | Búsqueda global en el bundle principal |
| `searchDossier(q)` | async | Búsqueda profunda en el corpus |

---

## 5. Motor de juego — inyección en el prompt de simulación

**Punto quirúrgico:** `src/services/simulationEngine.js`, dentro de `formatFullChar()`,
tras `${formatArsenal(char)}`.

```js
import { summarizePassivesForPrompt, resolvePassiveIds } from '../lib/biologicalPassives';

const formatCanonPassives = (char) => {
  try {
    const block = summarizePassivesForPrompt(char);
    if (!block) return '';
    const ids = resolvePassiveIds(char);
    return `\n\n${block}\n- IDs de pasiva activos: ${ids.join(', ')}\n- LEY: estas pasivas son
fisiológicas y deterministas; NO se negocian narrativamente. Cada una declara su contrajuego
explícito y debe poder ser anulada solo por ese contrajuego.`;
  } catch { return ''; }
};

// ... dentro del template de formatFullChar:
- Arsenal y Habilidades Completas:
${formatArsenal(char)}${formatCanonPassives(char)}`;
```

**Impacto:** el LLM recibe ahora, por cada luchador, sus reglas fisiológicas canónicas con
**contrajuego explícito** — convirtiendo las pasivas en mecánicas *negociables por el narrador*
en lugar de números estáticos.

---

## 6. UI — dos puntos de entrada

### 6.1 Códice global (Navbar → botón «Códice»)

5 pestañas:
1. **Técnicas** — buscador + filtro por tipo + toggle «solo atestiguadas» + procedencia por tomo.
2. **Fuerza de Combate** — tabla de 38 registros con columna de procedencia (`T04 p.30 ✓`).
3. **Cronología** — 75 eventos filtrables por rango de Age.
4. **Pasivas Biológicas** — 10 fichas con efecto, contrajuego y cita canónica.
5. **Buscador** — índice estructurado + búsqueda profunda en el dossier (lazy).

### 6.2 Panel canónico por personaje (ficha → pestaña 9 «Códice Chōzenshū»)

Muestra, para el personaje abierto:
- **Fuerza de Combate Canónica** (si existe entrada).
- **Técnicas Canónicas Atestiguadas** con nº de menciones y páginas.
- **Pasivas Biológicas** activas + contrajuego + fuente.
- Botón **«Ver bloque inyectado en el prompt de simulación»** (transparencia total).

---

## 7. Evidencia de verificación

### 7.1 Build de producción
```text
✓ built in 4m 32s
dist/assets/ChozenshuCodexModal-v9n1t22v.js   16.46 kB │ gzip: 5.00 kB
```
El modal entra como **chunk lazy** → cero impacto en el bundle inicial.

### 7.2 Bundle de producción contiene la inyección
```text
BUNDLE: index-*.js
  PASIVAS BIOLOGICAS CANONICAS   1
  IDs de pasiva activos          1
  Zenkai                         14
  Energia Perpetua Androide      1
  Regeneracion Namekiana         1
  NO se negocian narrativamente  1
```

### 7.3 Prueba en navegador real (Chromium headless, `vite preview`)
```text
INDEX HTTP: 200
CODEX HTTP: 200  bytes=117021

Botón navbar            ✓  title="Códice Chōzenshū — Canon oficial Dragon Ball (Compendios 1-4)"
Modal abre              ✓  h2 "CÓDICE CHŌZENSHŪ · CANON OFICIAL"
Stats renderizadas      ✓  211 / 104 / 38 / 75 / 10 / 351
Técnica "Super Saiyano" ✓  badge "✓ TOMOS · 1577" + t01..t04 páginas
Fuerza de combate       ✓  "10 · Son Goku" ... "✓ T04 p.30"
Pestaña en ficha        ✓  "Códice Chōzenshū" visible en CharacterModal
Pasiva de Androide 8    ✓  "Energia Perpetua Androide" + contrajuego + fuente
Errores de consola      ✓  0
```

Capturas: `apex-codice-chozenshu` y `apex-ficha-codice-androide8`.

---

## 8. Cumplimiento constitucional

| Regla | Estado |
|---|---|
| V22 congelado | ✅ Solo se **lee**; ningún campo del baseline se muta |
| Campos permitidos | ✅ Se alimentan `arsenal` (vía prompt), `passives` y `weaknesses` (contrajuego) |
| Aislamiento de borradores | ✅ El bundle vive en `public/data/` como derivado de `src/data/referencias/` |
| Sin invención de números | ✅ Toda FC muestra su procedencia (`T04 p.30 ✓` vs `minado`) |
| Aprobación humana | ⏳ La escritura de datos al roster sigue pendiente de tu OK |

---

## 9. Siguientes pasos sugeridos (roadmap de producto)

1. **«Aplicar al arsenal»** — botón en el panel canónico que **pre-rellena** `arsenal` con las
   técnicas atestiguadas (borrador de enriquecimiento, revisable antes de guardar).
2. **Modo Torneo con datos canónicos** — usar la tabla de FC como ancla de auditoría de tiers en `TournamentModal`.
3. **Crónica enriquecida** — inyectar los eventos de la cronología (`Age`) como contexto temporal
   en `ChronicleViewer` para situar cada what-if.
4. **Badge «Canon verificado»** en `CharacterCard` para fichas con FC atestiguada en los tomos.
5. **i18n** — el Códice está en español; exponer `es`/`ro`/`en` con el mismo patrón de `translatorService`.
6. **Verificación visual del Diccionario de Técnicas (pp. 136-176)** → subir de 104 a ~300 técnicas atestiguadas.

---

## Enlaces

- Informe de disección: `references/CHOZENSHU_DISECCION_Y_HALLAZGOS.md`
- Hub Obsidian: `05 - Conocimiento/Contexto/Dragon Ball Compendios - Guia Canonica y Lore.md`
- Toolkit: `src/scripts/chozenshu/` · Servicio: `src/services/chozenshuCodex.js`
- Motor de pasivas: `src/lib/biologicalPassives.js`

---

## 🔁 Cierre del círculo: lectura → mecánica

### «Aplicar N técnicas al arsenal»
En la pestaña **Códice Chōzenshū** de la ficha, el botón `Aplicar N técnicas al arsenal` importa las técnicas canónicas **atestiguadas** como *borrador editable* del arsenal.

**Mapeo por tipo canónico (determinista):**

| Tipo canónico | Destino en `arsenal` | Stats aplicadas |
|---|---|---|
| `ki`, `martial` | `superAttacks` | `staminaCost: 30` · `tierBase: High 6-A` |
| `hax` | `specialMechanics` | `staminaCost: 40` · `tierBase: 5-A Hax` |
| `fusion`, `transformation` | `transformativeMechanics` | `staminaCost: 25` |
| `support`, `utility`, `defense` | `basicAttacks` | `staminaCost: 8` |

**Garantías de seguridad:**
1. **Deduplicación** por nombre normalizado (sin acentos, minúsculas) → nunca duplica.
2. **Sello de procedencia** en cada ítem: `[CÓDICE Chōzenshū T04 p.144 ✓]`.
3. **Es un borrador**: requiere pulsar *Guardar* en la ficha. Si se descarta, no persiste.
4. **Nunca toca V22**: solo muta el `formData` local del modal.
5. **Feedback** con contador `(añadidas, omitidas)` durante 6 s.

**Evidencia de verificación (navegador, `vite preview`):**
```
Contendiente: Son Goku 23º Tenkaichi Budokai
Botón: "Aplicar 4 técnicas al arsenal"        ← presente, con 5 técnicas listadas
Click → feedback: "✓ 4 técnica(s) añadida(s) al arsenal desde el Códice"
arsenal: [{ name: "Kamehameha", source: "[CÓDICE Chōzenshū T04 p.144 ✓]" }, ...]
consistencia: 1 técnica omitida (ya existía) → dedup funciona
```

**Pipeline completo:** CBR → OCR → datasets → `buildApexCodex.mjs` → bundle → servicio → UI → arsenal editable → prompt de simulación.

---

## 🚀 Despliegue a producción (verificado)

```
Deployment ID : En57Wfr13q81bJwgXw7oErhzteY8
Preview       : https://apex-engine-olryv3mp2-pc-6a9b.vercel.app
Alias prod    : https://apex-engine-


[... Contenido de entrada archivado para ahorro de cuota ...]

```
Build Completed in /vercel/output [11s]
Production  https://apex-engine-olryv3mp2-pc-6a9b.vercel.app
Aliased     https://apex-engine-six.vercel.app
✓ Ready in 2m
```

---

## 🆕 Ronda 2 — Diccionario de Técnicas + Goku Black

### A. Diccionario de Técnicas (Chozenshu 4, pp. 135-176)

El corpus real del diccionario usa **4 campos oficiales**:
`(N)` nº de capítulo · `(T)` tipo · `(P)` ejecutor · `(C)` descripción
(+ `(A)` anime, `(S)` spin-off).

- **Herramientas nuevas**: `chozenshu_columns.py` (divisor de columnas por hueco X)
  y `chozenshu_techdict2.py` (parser N/T/P/C sobre texto ya separado en columnas).
- **Resultado**: `dragonball_technique_dictionary.json` con **193 entradas**
  (192 con tipo, 183 con ejecutor, 180 con descripción), capítulos 1-519.
- **Integración**: pestaña **«Diccionario (N/T/P/C)»** en el modal Códice, con
  buscador y cita `T04 p.NNN`. Selectores en el servicio:
  `listTechniqueDictionary()`, `searchTechniqueDictionary()`,
  `getTechniqueDictionaryForCharacter()`.

### B. Goku Black ampliado a 6 formas (V26)

Bug detectado en `ROSTER_NIVELES_PODER_CORREGIDO_V26.json`: Rosé estaba a `x50`
— **idéntico** a su SSJ — pero con un tier superior (incoherente), y faltaban los
escalones intermedios. Se alineó con la escalera oficial de Goku DBS
(`x1 / x50 / x100 / x400 / x6400 God / x7700 Blue|Rosé`):

| # | Forma | Mult | Tier |
|---|---|---|---|
| 1 | Estado Base / Zamasu en Cuerpo de Goku | x1 | 3-A |
| 2 | Super Saiyan (Fase 1) | x50 | 3-A |
| 3 | Super Saiyan 2 (Fase 2) | x100 | 3-A |
| 4 | Super Saiyan 3 (Fase 3) | x400 | Low 2-C |
| 5 | Super Saiyan God (Dios Rojo) | x6400 | Low 2-C |
| 6 | Super Saiyan Rosé (Ki Divino Malicioso) | x7700 | Low 2-C |

- Backup: `ROSTER_NIVELES_PODER_CORREGIDO_V26.json.bak-gokublack-forms`
- Diff acotado: **37 inserciones / 1 borrado**. Verificado con el loader real:
  775 personajes, 6 formas, 0 perfiles tácticos huérfanos.
- **El baseline activo es V26** (`characters.js` importa V26; V22 queda como histórico).

### C. Propagación de `franchise`

V26 **no expone** el campo `franchise`. El builder ahora lo deriva de
`universe / saga / name` (misma regla que `franchiseHelper`), excluyendo
fan-mangas y What-Ifs: **274 personajes Dragon Ball** detectados.

### D. Estado final del bundle en producción

`apex-codex.json` ≈ **184 KB** · 211 técnicas (104 atestiguadas) ·
**193 diccionario** · 38 fuerzas de combate · 75 eventos de cronología ·
10 pasivas biológicas · 274 personajes DB.

---

## 🏁 ESTADO FINAL DEL CORPUS CHŌZENSHŪ (cierre)

Corpus 1-4 completamente diseccionado, integrado, desplegado y versionado.

### Datasets (12 JSON en `src/data/referencias/`)

| Dataset | Contenido | Volumen | Origen |
|---|---|---|---|
| `dragonball_technique_lexicon.seed.json` | Técnicas curadas con ganchos de motor | 211 | Curado |
| `dragonball_canonical_moves.json` | Técnicas + atestiguación automática | 211 (104 atest.) | T01-T04 |
| `dragonball_battle_powers_canon.json` | Fuerzas de combate verificadas | 33 + 5 minadas | T04 |
| `dragonball_battle_powers.json` | Minería automática de FC | 8 filas | T01-T04 |
| `dragonball_timeline_events.json` | Eventos con Age | 75 | T01-T04 |
| `dragonball_character_dossier.json` | Bloques de dossier (bundle deep) | 3.202 | T01-T04 |
| `dragonball_technique_dictionary.json` | Diccionario oficial N/T/P/C | 193 | T04 pp.135-176 |
| `dragonball_world_lore.json` | Razas, tecnología, planetas, GT, películas, dragones | 47 bloques | T01, T03 |
| `dragonball_gt_episodes.json` | Sinopsis de episodios de GT | 41 | T03 pp.350-357 |
| `dragonball_dbz_episodes.json` | Sinopsis de episodios de DBZ | 155 | T03 pp.328-349 |
| `dragonball_scenarios.json` | Geografía/arenas de la Tierra | 11 regiones | T01 pp.244-258 |
| `dragonball_relations.json` | Grafo de relaciones + combos | 18 vínculos + 3 combos | T01 p.10 |
| `dragonball_character_library.json` | Biblioteca de personajes (deep) | 34 páginas | T03 pp.212-296 |

### Motor
- `src/lib/biologicalPassives.js` — 10 pasivas biológicas canónicas, autotest 9/9, cobertura 272 personajes DB de V26.
- `CANON_LIMITS` — Scouter antiguo tope **22.000** (T01 p.300), unidad terapéutica ~30 min, puñetazo de Mr. Satan **139**, Sixinglong **6.000 °C**.
- `readScouter()` — los modelos antiguos saturan a 22.000 según el canon.
- Inyección de pasivas en el prompt de simulación (`simulationEngine.js`).

### UI
Modal **Códice Chōzenshū** con 7 pestañas; la de *Mundo, Razas & GT* tiene **11 secciones**:
Razas · Tecnología · Arcos GT · Dragones Oscuros · Transformaciones GT · Películas ·
Sinopsis GT · Sinopsis DBZ · Escenarios · Relaciones · Multiplicadores.

Además: pestaña **Códice Chōzenshū** en cada ficha de personaje + botón **«Aplicar N técnicas al arsenal»**.

### Herramientas (10 scripts Python + 1 CLI Node)
`chozenshu_index` · `chozenshu_zoom` · `chozenshu_columns` · `chozenshu_ocr` ·
`chozenshu_ocr_all` · `chozenshu_extract` · `chozenshu_techdict` · `chozenshu_techdict2` ·
`chozenshu_gt_episodes` · `chozenshu_char_library` · `apex-lore.mjs`

### Despliegue
- Producción: https://apex-engine-six.vercel.app (HTTP 200)
- Bundle principal ~284 KB · bundle deep ~852 KB
- Repositorio: `vercel-origin` = https://github.com/Nigh061tmare/Apex. (al día)

### Limitaciones declaradas (no se inventan datos)
1. Los **números de episodio** del libro van en un rótulo gráfico no legible por OCR: `order` es el orden de aparición en el tomo.
2. La **cobertura de episodios** es parcial (DBZ 155; GT 41 de 64).
3. `dateEnBloque` corresponde por maquetación al episodio siguiente y se deja sin reasignar.
4. Los **nombres** de la biblioteca de personajes son detección automática de mayúsculas (puede haber ruido).
5. Todo el texto de origen es **OCR sin corrección ortográfica**.

### No extraído (valor bajo, decisión consciente)
- Vehículos, naves y robots (T01 pp.278-299): equipamiento sin impacto en combate.
- Biblioteca de diseños (T03 pp.8-34): model sheets.
- Staff, reparto y música: ya extraído lo útil.
- Superentrevista a Toriyama (T01 pp.310-320): intención de diseño, no mecánica.
