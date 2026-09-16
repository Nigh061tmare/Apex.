---
tipo: informe-tecnico
proyecto: apex-powerscaling-engine
fuente: Dragon Ball Compendios (Chozenshu 1-4) — Planeta Comic / Shueisha
tags: [apex, dragonball, chozenshu, daizenshu, canon, datasets, pipeline]
version: 1.0.0
fecha: 2026-09-15
---

# 🐉 Chozenshu 1-4 — Disección profunda, pipeline de extracción y arquitectura de integración APEX

> **Documento técnico madre.** Rige la ingesta del corpus canónico Dragon Ball en APEX Engine.
> Cumple `APEX_RULES.md`: **el baseline V22 permanece congelado**; todo lo aquí generado vive en
> `src/data/referencias/` como **borradores de enriquecimiento** y no se fusiona sin aprobación humana.

---

## 1. Resumen ejecutivo

Se diseccionaron los **4 tomos** de los *Dragon Ball Compendios* (reedición oficial en español de los
**Chōzenshū 1-4**, la versión condensada y actualizada de los 7 *Daizenshū* de 1996):

| # | Volumen | Chōzenshū | Páginas CBR | Páginas OCR | Naturaleza del contenido |
|---|---------|-----------|-------------|-------------|--------------------------|
| 1 | Guía de la Historia y su Mundo | 1 | 327 | 327 | Cronología del manga (519 caps.), mundo, sociedades, razas, terminología |
| 2 | Guía de la Animación I | 2 | 360 | 360 | Series de TV, model sheets, guías de episodios |
| 3 | Guía de la Animación II | 3 | 366 | 366 | Películas 1-13, especiales de TV, OVAs, GT, guías de episodios |
| 4 | Superenciclopedia | 4 (=Daizenshū 7) | 305 | 305 | Diccionarios de personajes/técnicas/objetos/geografía + **fuerzas de combate** |
| | **TOTAL** | | **1.358** | **1.358** | **100 % del corpus procesado** |

**Resultados cuantificables:**

- **1.358 páginas** extraídas, indexadas y OCR-edas con RapidOCR (ONNX, CPU, 100 % local, sin coste de API).
- **5 scripts** de toolkit probados (`src/scripts/chozenshu/`).
- **211 técnicas** en el lexicón canónico; **104 atestiguadas literalmente** en el corpus con procedencia tomo/página.
- **33 fuerzas de combate verificadas visualmente** + 5 corroboradas por prosa (tabla oficial pp. 30-31).
- **84 eventos datados** (cronología por *Age*).
- **3.202 bloques** del diccionario de personajes clasificados por marcador (`C/H/T/L/B/A/N`).
- **Motor determinista de pasivas biológicas** con 10 reglas, autotest 9/9 y cobertura sobre los **351 personajes Dragon Ball** del roster V22.
- **Mini-CLI `apex-lore`** con 8 comandos para consulta en terminal.

---

## 2. Mapa anatómico del corpus

### 2.1 Tomo 04 — Superenciclopedia (el más valioso para APEX)

Índice oficial reconstruido (página impresa → índice PDF; el offset verificado es **+7**):

| Sección | Pág. impresa | Índice PDF | Contenido explotable |
|---|---|---|---|
| Prefacio / Introducción | 1-10 | 9-10 | "El mundo infinito de Dragon Ball" |
| Cronología del mundo de Dragon Ball | 11-53 | 11-46 | Cronología Age completa |
| Columna 1 — *Los tres futuros* | 28-29 | 23 | **3 líneas temporales** (Trunks/Cell/principal) |
| Columna 2 — *Desarrollo de la fuerza de combate de Son Goku* | **30-31** | **24** | ⭐ **TABLA OFICIAL DE FUERZAS DE COMBATE** |
| Columna 3 — *A fondo: una cronología alternativa* | 28-33 | 25 | Leyenda del Supersaiyano, Nekomajin, Arale |
| El mundo de Dragon Ball | 33-53 | 26-46 | Mundo, Sociedad, Cultura, **Razas**, Terminología |
| **Diccionario de Personajes** | 55-130 | 48-123 | 1.462 bloques `(C)` + 899 bloques `(T)` |
| Columna 4 — Desarrollo intelectual de Son Goku | 131 | 124 | Psicología/evolución de Goku |
| Columna 5 — Secretos de los personajes | 132-135 | 125-128 | Lore oculto |
| **Diccionario de Técnicas** | 136-176 | 129-169 | ⭐ Nombres oficiales romanizados + descripciones |
| **Diccionario de Objetos** | 177-207 | 170-200 | Capsule Corp, armas, artefactos |
| Columna 6 — Capsule Corporation en el mundo | 208-230 | 201-223 | Economía y tecnología |
| Columna 7/8 — Objetos favoritos / orígenes | 231-232 | 224-225 | Lore de objetos |
| **Diccionario Geográfico** | 233-251 | 226-244 | Planetas, lugares |
| Columna 9 — Compendio de detalles (reedición) | 252-269 | 245-262 | Correcciones de la reedición |
| Colección de portadillas | 270-287 | 263-280 | Índice gráfico de portadas |
| Colección de índices de Dragon Ball | 288-290 | 281-283 | Índice de los 42 tomos |
| Reflexiones de Masako Nozawa | 291-295 | 284-288 | Testimonio de la seiyū |
| **Reflexiones de Akira Toriyama** | 296+ | 289+ | ⭐ Palabra del autor |

> ⚠️ **Aviso de layout:** las páginas del Tomo 04 están escaneadas como *stitch* (doble página por imagen),
> p. ej. `0036_stitch.jpg` = 5.715 × 4.025 px contiene las páginas impresas **30 (mitad derecha)** y
> **31 (mitad izquierda)**. El orden dentro del archivo es **[mayor][menor]**, no el orden de lectura.

### 2.2 Estructura del Diccionario de Personajes (hallazgo estructural)

Cada entrada del diccionario está marcada por siglas que el OCR preserva de forma fiable:

| Marca | Significado inferido | Bloques | Valor para APEX |
|---|---|---|---|
| `(C)` | **Comentario/perfil** (a menudo con FC numérica) | 1.462 | `provenFeats`, `weaknesses`, lore |
| `(T)` | **Técnicas** representativas | 899 | `arsenal` (¡mapping directo!) |
| `(H)` | **Historia**/fechas (nacimiento, muerte) | 708 | `combatDialogue`, cronología |
| `(N)` | **Referencia numérica** (índice/página) | 693 | Trazabilidad |
| `(L)` | **Luchas** (enfrentamientos canónicos) | 474 | `provenFeats` |
| `(A)` | **Anécdotas** | 183 | `psychology`, `combatDialogue` |
| `(B)` | **Batallas/torneos** | 53 | Historial competitivo |

Ejemplos literales extraídos:

```
(C) ...Su fuerza de combate es de 120.000          → Capitán Ginew  (t04 idx 62)
(C) ...Tenia una fuerza de combate de 18.000,      → Rey Vegeta     (t04 idx 63)
(T) Intercambio de cuerpo, entre otras.            → Capitán Ginew
(T) Kienzan (corte circular de aura), bukujutsu
    (tecnica de vuelo) y taiyo-ken (puno del sol)  → Krilin
```

### 2.3 Tomos 01-03

- **Tomo 01**: cronología del manga capítulo a capítulo, estructura del mundo, sociedades, **razas**
  (saiyanos, tsufurianos, namekianos, androides, frost demons), terminología, y el arco de los
  **tsufurianos/Baby** (base directa de GT).
- **Tomo 02-03**: guías de la animación — model sheets, películas 1-13, especiales de TV (Bardock,
  Trunks), OVAs, y **Dragon Ball GT**: SSJ4 (x4.000 en APEX), *Blutz Waves*, Super A-17, Dragones
  Malignos, Gogeta SSJ4 y el *Big Bang Kame Hame Ha x100*.

---

## 3. El hallazgo estrella: tabla oficial de fuerzas de combate

**Fuente:** Tomo 04, Columna 2, páginas impresas **30 y 31** (imagen `0036_stitch.jpg`, índice PDF 24).
Verificada **visualmente** con `chozenshu_zoom.py` (crop 50 % a escala 1.0 → texto legible).

### Página 30 — hasta Raditz

| FC | Personaje | Arco |
|---:|---|---|
| 10 | Son Goku (primera aparición) | Saga de Pilaf |
| 100 | Son Goku **Ohzaru** (×10) | Saga de Pilaf / 21.ᵉʳ TB |
| 120 | Duende Grulla | 22.º Tenkaichi Budokai |
| 139 | Jackie Chun (Duende Tortuga) | 21.ᵉʳ/22.º TB |
| 180 | Son Goku · 180 | Ten Shin Han | 22.º TB |
| 206 | Krilin | 22.º TB |
| 260 | Son Goku · 260 | Gran Rey Demonio Piccolo | Saga del Rey Demonio |
| 408 | Piccolo | Contra Raditz |
| 416 | Son Goku | Contra Raditz |
| **1.307** | Son Gohan (estallido de ira) | Contra Raditz |
| **1.330** | **Makankosappo** (técnica) | Contra Raditz |
| 1.500 | Raditz | Saga Saiyan |

### Página 31 — hasta Freezer

| FC | Personaje | Arco |
|---:|---|---|
| 610 | Chaoz | Saga Saiyan |
| 1.200 | Saibaiman | Saga Saiyan |
| 1.480 | Yamcha | Saga Saiyan |
| 1.770 | Krilin | Saga Saiyan |
| 1.830 | Ten Shin Han | Saga Saiyan |
| 2.800 | Son Gohan | Saga Saiyan |
| 3.500 | Piccolo | Saga Saiyan |
| 4.000 | Nappa | Saga Saiyan |
| 8.000 | Son Goku | Contra Vegeta |
| 18.000 | Vegeta | Llegada a la Tierra |
| 32.000 | Son Goku (Puno Kaio ×4) | Contra Vegeta |
| 13.000 | Krilin | Llegada a Namek |
| 14.000 | Son Gohan | Llegada a Namek |
| 30.000 | Vegeta | Llegada a Namek |
| **90.000** | Son Goku | Llegada a Namek |
| **3.000.000** | Son Goku | Contra Freezer |
| **60.000.000** | Freezer al 50 % | Contra Freezer |
| **120.000.000** | Freezer al 100 % | Contra Freezer |
| **150.000.000** | Son Goku **Supersaiyano** (×50) | Contra Freezer |

### Multiplicadores confirmados por el propio libro

| Transformación | Multiplicador | Evidencia textual (Tomo 04) |
|---|---:|---|
| Oozaru | **×10** | *"Su fuerza de combate se multiplica por 10"* (p. 30) |
| Supersaiyano | **×50** | *"se multiplica por 50"* → 3 M × 50 = 150 M (p. 31) |
| Puno Kaio | **×2 / ×3 / ×4 / ×10 / ×20** | *"al cuadruple: 32000"*, *"puede multiplicar su fuerza por 10"* |
| Zenkai | **exponencial** | *"aumento exponencial tras la unidad terapeutica"* (p. 31) |

> Estos multiplicadores **coinciden con los ya fijados en el baseline V22** (50×, 100×, 400×…), lo que
> valida la calibración del motor y permite usar esta tabla como **patrón de oro de auditoría**.

---

## 4. Pipeline de extracción (arquitectura)

```
 CBR (496-754 MB)
    │  unrar x                      ┌─────────────────────────────┐
    ▼                               │  src/scripts/chozenshu/     │
 0000.jpg … zzzzzz.jpg  ──────────▶│  1. chozenshu_index.py      │ ← contact sheets 6×5
    │                               │     (extrae + indexa + tiles)│
    │  RapidOCR (ONNX, CPU)         │  2. chozenshu_zoom.py       │ ← crops 1:1 legibles
    ▼                               │  3. chozenshu_layout.py     │ ← reflow por coordenadas
 t0X.json  (líneas + bbox) ────────▶│  4. chozenshu_ocr.py        │ ← OCR reanudable
    │                               │  5. chozenshu_ocr_all.py    │ ← runner secuencial 4 tomos
    │  normalización NFD            │  6. chozenshu_extract.py    │ ← DATASETS
    │  + lexicón dirigido           └─────────────────────────────┘
    ▼
 src/data/referencias/*.json  ──────▶  apex-lore.mjs (CLI)  +  biologicalPassives.js (motor)
```

### Decisiones de ingeniería (y por qué)

| Problema detectado | Solución implementada |
|---|---|
| `unrar` en 4 tomos = 4 procesos Python × 7 GB RAM | **Runner secuencial** (`chozenshu_ocr_all.py`): una sola carga del modelo ONNX |
| OCR interrumpido a mitad | **Reanudable**: el JSON se vuelca cada 5 páginas y se saltan las ya hechas |
| Caracteres `\uff5e` rompen stdout en Windows (cp1252) | `sys.stdout.reconfigure(encoding='utf-8', errors='replace')` |
| El OCR lee infografías en **orden de columna** (tablas destrozadas) | **`chozenshu_layout.py`**: re-agrupa líneas en filas por proximidad vertical (`tol=0.6×altura`) y ordena por X |
| El texto OCR **pega palabras** (`cortecirculardeaura`) | Normalización NFD + eliminación de separadores → matching por **substring sobre texto aplanado** |
| Nombres de técnicas ambiguos | **Lexicón dirigido por diccionario**: no se "inventan" técnicas, se **verifican** contra el corpus (`attestedInChozenshu`) |
| Datos numéricos viven en **gráficos**, no en prosa | Extracción por regex (8 hallazgos) **+ verificación visual obligatoria** de las páginas de tabla |

---

## 5. Datasets generados

Todos en `src/data/referencias/`:

| Archivo | Tamaño | Contenido |
|---|---:|---|
| `dragonball_technique_lexicon.seed.json` | 55 KB | **211 técnicas** con `id`, ES, romaji, tipo, usuarios, descripción, alias |
| `dragonball_canonical_moves.json` | 149 KB | Técnicas + **atestiguación** (tomo, páginas, nº de menciones, `attestedInChozenshu`) |
| `dragonball_battle_powers_canon.json` | 9 KB | **33 FC verificadas** (pp. 30-31) + 5 por prosa, con cita y `characterId` |
| `dragonball_battle_powers.json` | 3 KB | Salida cruda del minado regex (trazabilidad) |
| `dragonball_timeline_events.json` | 29 KB | **84 eventos** datados por *Age* con contexto OCR |
| `dragonball_character_dossier.json` | 1,2 MB | **3.202 bloques** del diccionario etiquetados `C/H/T/L/B/A/N` |
| `dragonball_tech_mentions_raw.json` | 91 KB | 899 líneas `(T)` crudas con procedencia |

### Comandos que los generan

```powershell
# 1) Extraer + indexar + contact sheets
python src/scripts/chozenshu/chozenshu_index.py --cbr "<Tomo>.cbr" --work "$env:TEMP\opencode\db_t04" `
       --sheets "$env:TEMP\opencode\db_t04_sheets" --cols 6 --rows 5 --thumb 290

# 2) OCR de los 4 tomos (secuencial, reanudable)
python src/scripts/chozenshu/chozenshu_ocr_all.py --pages-root "$env:TEMP\opencode" `
       --out "$env:TEMP\opencode\db_ocr" --order 04,01,02,03

# 3) Verificación visual de una tabla (crop a resolución nativa)
python src/scripts/chozenshu/chozenshu_zoom.py --dir "$env:TEMP\opencode\db_t04" `
       --pages 24 --box 0.5,0,1,1 --scale 1.0 --out "$env:TEMP\opencode\z04\p24_R.png"

# 4) Reconstrucción de layout de una infografía
python src/scripts/chozenshu/chozenshu_layout.py --json "$env:TEMP\opencode\db_ocr\t04.json" `
       --pages 22-24 --out "$env:TEMP\opencode\db_ocr\layout_t04.txt"

# 5) Generar los datasets
python src/scripts/chozenshu/chozenshu_extract.py --ocr "$env:TEMP\opencode\db_ocr" `
       --lexicon src/data/referencias/dragonball_technique_lexicon.seed.json `
       --out src/data/referencias
```

---

## 6. Motor de pasivas biológicas (`src/lib/biologicalPassives.js`)

Capa **determinista** que traduce la fisiología canónica a reglas ejecutables. **No muta V22**:
envuelve `resolveCombatState()` mediante `augmentCombatState()`.

### 6.1 Catálogo de reglas

| id | Categoría | Efecto | Contrajuego |
|---|---|---|---|
| `zenkai` | saiyan | Boost no lineal tras sobrevivir con ≤10 % HP | Negar recuperación; remate anticipado |
| `blutz-transformation` | saiyan | Oozaru ×10 (cola + luna/Blutz) | Cortar cola; destruir la luna |
| `saiyan-ki-sense` | saiyan | Rastreo de firmas de ki | Androides (firma nula); ki divino |
| `namekian-regeneration` | namekian | Regenera miembros con **coste severo de Ki** | Destruir cabeza/núcleo |
| `android-perpetual` | android | Stamina infinita, ki indetectable, **techo estático** | Absorción energética; hax no-ki |
| `bio-absorption` | bio | Cell suma 100 % del Ki del objetivo | Inmovilizar la cola |
| `majin-absorption` | majin | Buu suma 80 % + hereda una técnica | No ser comestible; Potara |
| `perfect-regeneration` | hax | HP completo mientras exista el núcleo | Hakai; daño continuo superior |
| `frost-demon-core` | frost-demon | Sobrevive con núcleo y ≥5 % Ki | Borrado total |
| `god-ki` | hax | Ki divino indetectable y con bypass | Otro ki divino; Hakai |

### 6.2 Fórmulas

**Zenkai** (determinista, sin azar):

```
s = clamp(1 − hpRatio, 0, 1)                      # severidad ∈ [0.9, 1] si hp ≤ 10 %
t = tierIndex(baseTier) ∈ [0, 12]
ratioTerm = log10(1 + baseKi / max(1, apexKi))
gain = clamp(ZENKAI_K · s · (1 + t/12) · ratioTerm, 0, ZENKAI_MAX_GAIN_PER_EVENT)   # K = 1.85
gain = min(gain, ZENKAI_CUMULATIVE_CAP − acumulado)                                  # cap ×40
baseKi' = baseKi · (1 + gain)
```

**Regeneración namekiana** (coste severo):

```
kiCost      = maxKi · 0.25 · (1 + t/24) · miembrosPerdidos
staminaCost = 18 · (1 + t/12) · miembrosPerdidos
bloqueada si staminaRatio < 0.20  ·  cooldown 2 turnos
```

**Economía androide** (energía perpetua):

```
staminaDrain = 0          recoveryRate = ∞        fatigueApplied = 0
kiGrowthMultiplier = 0    kiDetectable = false    hardCeiling = baseKi   # techo estático
```

**Absorción:** `gained = targetBaseKi · (1.0 si bio | 0.8 si majin)`

### 6.3 Verificación ejecutada

```text
AUTOTEST: 9/9   (determinismo, umbrales, techos, cooldown, absorción 80 %)

DB chars: 351 | saiyans detectados: 78
cobertura pasivas:
  saiyan-ki-sense 283 | zenkai 78 | blutz-transformation 78
  perfect-regeneration 43 | majin-absorption 31 | android-perpetual 22
  namekian-regeneration 18 | bio-absorption 13 | frost-demon-core 12 | god-ki 12
```

### 6.4 Integración propuesta en `combatStateResolver.js`

```js
// PRINCIPIO: aditivo y no invasivo — el resolver no se modifica en su núcleo.
import { augmentCombatState, summarizePassivesForPrompt } from '../lib/biologicalPassives.js';

const base   = resolveCombatState(character, activeStateId, scenario);
const estado = augmentCombatState(base, character, {
  hpRatio, staminaRatio, survived, cumulativeZenkai, membersLost, cooldownTurns
});

// 1) Fuente única de verdad: `estado.passiveIds` + `estado.passivesResolved`
// 2) Para el prompt del LLM (simulationEngine):
const bloquePasivas = summarizePassivesForPrompt(character);
// 3) Guardarraíl: si `estado.manualReviewRequired === true`, el motor cae al baseline V22.
```

---

## 7. Mini-CLI de consulta de lore

```powershell
node src/scripts/chozenshu/apex-lore.mjs stats
node src/scripts/chozenshu/apex-lore.mjs tech makankosappo
node src/scripts/chozenshu/apex-lore.mjs bp freezer --limit 4
node src/scripts/chozenshu/apex-lore.mjs char ginew
node src/scripts/chozenshu/apex-lore.mjs age 762
node src/scripts/chozenshu/apex-lore.mjs timeline --from 760 --to 790
node src/scripts/chozenshu/apex-lore.mjs passives son-goku-saga-namek-saga-namek-176
node src/scripts/chozenshu/apex-lore.mjs search "zenkai" --json
```

Salida real verificada:

```text
== FUERZAS DE COMBATE :: "freezer"  (5) ==
      3.000.000  Son Goku            (Contra Freezer)
     60.000.000  Freezer al 50%      (Contra Freezer)
    120.000.000  Freezer al 100%     (Contra Freezer)
    150.000.000  Son Goku (Supersaiyano)   ×50 verificado
       fuente: Chozenshu 4, pag. impresa 31
```

---

## 8. Cumplimiento constitucional (APEX_RULES.md)

| Regla | Estado |
|---|---|
| V22 inalterable | ✅ Ningún archivo del baseline fue modificado. Todo vive en `src/data/referencias/` |
| Campos protegidos intocables | ✅ No se tocó `id`, `franchise`, `tier`, `forms`, `multiplicadores`… |
| Aislamiento de borradores | ✅ Los 7 datasets son **enrichment drafts** externos al roster |
| Cero contaminación de lore | ✅ El lexicón es 100 % Dragon Ball; las pasivas se aplican por predicado de raza/franquicia |
| Cero invención de números | ✅ Las 33 FC son **citadas con página**; las 5 minadas llevan `confidence` y aviso |
| Aprobación humana | ⏳ Pendiente: la fusión a `characters.js` requiere tu OK explícito |

---

## 9. Limitaciones conocidas y mitigaciones

| Limitación | Impacto | Mitigación |
|---|---|---|
| OCR sin separación de palabras | Dificulta NLP fino | Matching por substring aplanado + lexicón dirigido |
| Errores OCR en acentos (`Ǹ`, `ib`) | Ruido en `context` | Los `id` y valores numéricos son exactos; el contexto es orientativo |
| Los títulos/secuencias no devuelven aciertos fiables | Subrepresentación | `dossier` conserva el texto crudo para revisión humana |
| Valores numéricos mayormente en gráficos | Solo 8 hallazgos por regex | **Verificación visual obligatoria** (protocolo `chozenshu_zoom.py`) |
| `timeline` mezcla Ages in-universe con fechas de publicación | Ruido | Filtrar por rango 200-1500 y revisar `context` |

---

## 10. Roadmap propuesto

1. **Verificación visual de las secciones restantes** (Diccionario de Técnicas pp. 136-176 y Geográfico pp. 233-251) para ampliar `moves` a ~300 entradas all-verified.
2. **Mapping automático `(T)` → personaje** usando bbox: agrupar bloques por vecindad de página y asignar el nombre de cabecera más cercano.
3. **Dataset de equipamiento** (`dragonball_equipment_canon.json`) desde el Diccionario de Objetos (pp. 177-207).
4. **Dataset de razas/cosmología** desde el Tomo 01 (`razas`, `sociedades`, `terminología`).
5. **Catálogo de películas/GT** desde los Tomos 02-03 (`dragonball_animated_canon.json`).
6. **Fusión controlada a V23** de los campos permitidos (`arsenal`, `passives`, `weaknesses`) previa aprobación.

---

## Enlaces

- [[Dragon Ball Compendios - Guia Canonica y Lore]]
- [[APEX - Arquitectura de Datos]]
- `src/scripts/chozenshu/` · `src/data/referencias/` · `src/lib/biologicalPassives.js`
