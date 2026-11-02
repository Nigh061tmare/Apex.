# Prompt de inicio para Antigravity / OpenCode

Pégalo al empezar cada sesión, antes de pedir cambios.

---

Antes de hacer nada, ponte en contexto. NO modifiques ningún archivo hasta que te dé instrucciones.

## Proyecto
APEX Engine: web de powerscaling y simulación de combates multiversales (775 personajes, 24 universos, torneos, fusiones, what-ifs, crónicas con IA, Códice Chōzenshū de Dragon Ball). Interfaz y textos en español.
Stack: React 19 + Vite 6 + Tailwind 4 (frontend) y Express (`server.cjs`, backend local opcional).

## Ubicación
- Repo git: `Z:\apex-powerscaling-engine` (unidad de red `\\192.168.1.85\Vault Obsidian`; es lenta, ten paciencia con installs y builds).
- **La web vive SOLO en `Z:\apex-powerscaling-engine\APEX_ENGINE\`. Trabaja únicamente ahí.**
- El resto de la raíz son otros proyectos (proxy Stable Diffusion, puente SillyTavern, mods de WorldBox, auditorías, cientos de backups). No los toques ni los uses como referencia.
- Si git da "dubious ownership", añade `-c safe.directory=*` a cada comando git.

## Estructura de APEX_ENGINE
- `src/App.jsx`, `src/main.jsx`: app y arranque.
- `src/components/`: modales y paneles (simulador, torneos, fusiones, crónicas...).
- `src/services/`: motores (simulación, scouter, sinergias, IA, i18n).
- `src/lib/`: sistema de tiers, imágenes, contratos de simulación, `appReset.js`.
- `src/data/`: roster V26 (`ROSTER_NIVELES_PODER_CORREGIDO_V26.json`, `tacticalProfiles.json`, `characters.js`), escenarios, imágenes; `referencias/` = corpus Chōzenshū.
- `src/scripts/`: validador del roster, tests del motor, generador del Códice.
- `public/`: manifest, service worker (`sw.js`), datasets del Códice.

## Reglas
Lee `APEX_ENGINE/AGENTS.md` y `APEX_ENGINE/README.md`; mandan sobre cualquier suposición tuya. Lo esencial:
- El roster V26 es la base inmutable: no edites sus archivos salvo que te lo pida.
- Nunca `localStorage.clear()`; usa `softReset()`/`hardReset()` de `src/lib/appReset.js`.
- No metas claves de API en el código.
- Antes de dar algo por terminado: `npm run check` dentro de `APEX_ENGINE` (validador + tests + build) debe pasar.

## Publicación
- GitHub: remoto `vercel-origin` → `github.com/Nigh061tmare/Apex.` (rama `main`). El remoto `origin` es un repo viejo abandonado: no lo uses.
- Vercel publica `APEX_ENGINE/` solo en cada push a `main` → https://apex-engine-six.vercel.app
- NO hagas commit ni push sin que te lo pida. Cuando te lo pida: `npm run check`, luego commit y `git push vercel-origin main` (o ejecuta `APEX_ENGINE/PUBLICAR.bat`).

## Primeros pasos (solo lectura)
1. `git -c safe.directory=* -C Z:\apex-powerscaling-engine fetch vercel-origin` y dime si mi copia local va por detrás de GitHub (puede que otra herramienta haya subido cambios). Si va por detrás, pregúntame antes de hacer pull.
2. `git status` acotado a `APEX_ENGINE/` y los últimos 5 commits: dime si hay cambios sin subir y de qué tratan.
3. Lee `AGENTS.md` y `README.md`.
4. Resúmeme en 5 líneas el estado y espera mis instrucciones.

---

**Solo Antigravity**, añade al final:
> Tienes abierta la carpeta `APEX_ENGINE`. Para comandos usa su terminal integrada; para publicar, el remoto es `vercel-origin`, nunca `origin`.

**Solo OpenCode**, añade al final:
> Si tu directorio de trabajo es la raíz `Z:\apex-powerscaling-engine`, haz `cd APEX_ENGINE` antes de cualquier comando npm. Ignora `.opencode/` y la configuración de la raíz para todo lo que sea la web.
