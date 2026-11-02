# APEX Engine — Web

Simulador de powerscaling y combates multiversales: 775 personajes, 24 universos,
torneos, fusiones, what-ifs, crónicas narradas por IA y el Códice Chōzenshū de Dragon Ball.

Esta carpeta contiene **solo la web** (frontend React + backend local), separada del
resto de herramientas del repositorio (proxy de Stable Diffusion, mods de WorldBox,
scripts de auditoría, copias de seguridad...).

## Arrancar

```bash
npm install
npm run dev        # web en http://localhost:5173
npm run server     # backend en http://localhost:3001 (opcional: Obsidian, IA, imágenes)
```

O doble clic en `INICIAR_APEX.bat`, que abre las dos cosas.

## Comandos

| Comando            | Qué hace                                                        |
|--------------------|-----------------------------------------------------------------|
| `npm run dev`      | Servidor de desarrollo Vite                                     |
| `npm run build`    | Compila la web a `dist/`                                        |
| `npm run preview`  | Sirve `dist/` para probar la versión compilada                  |
| `npm run server`   | Backend Express (lee `.env` si existe)                          |
| `npm run validate` | Validador canónico del roster V26                               |
| `npm run codex`    | Regenera `public/data/apex-codex*.json` desde `src/data/referencias` |
| `npm run check`    | `validate` + `build`                                            |

## Estructura

```
APEX_ENGINE/
├─ index.html            Entrada HTML (SEO, PWA, fuentes)
├─ vite.config.js        Vite + React + Tailwind 4; /api → localhost:3001 en dev
├─ vercel.json           Despliegue en Vercel (/api → backend en Render)
├─ server.cjs            Backend local: Obsidian vault, IA, imágenes, roster, cloud sync
├─ api/cloud/sync.js     Función serverless de Vercel para sincronización
├─ public/               manifest, service worker, icono y datasets del Códice
└─ src/
   ├─ main.jsx           Arranque + pantalla de recuperación de errores
   ├─ App.jsx            Aplicación principal
   ├─ components/        Modales y paneles (simulador, torneos, fusiones, crónicas...)
   ├─ services/          Motores: simulación, scouter, sinergias, IA, i18n, sonido
   ├─ lib/               Sistema de tiers, imágenes, contratos de simulación, reinicio seguro
   ├─ data/              Roster V26, perfiles tácticos, escenarios, imágenes
   │  └─ referencias/    Corpus Chōzenshū (fuente del Códice)
   └─ scripts/           Validador del roster, generador del Códice, utilidades del backend
```

## Configuración

Copia `.env.example` a `.env` si quieres usar el backend con una clave de OpenCode.
La web funciona sin ella: los proveedores de IA se configuran desde el propio modal de IA
y las claves se guardan solo en el navegador.

## Publicar

La web se publica sola: **cada push a `main` de GitHub se despliega en Vercel**
(https://apex-engine-six.vercel.app) y cada PR obtiene una URL de vista previa.

- Desde tu PC: doble clic en `PUBLICAR.bat` (comprueba todo y, si pasa, sube a GitHub).
- Desde Claude en la nube: conéctalo al repo de GitHub y pídele los cambios; al fusionar
  en `main`, Vercel publica.

### Configuración de Vercel (una sola vez)

En https://vercel.com → proyecto **apex-engine** → **Settings**:

1. **Build and Deployment → Root Directory**: escribe `APEX_ENGINE` y guarda.
2. **Git → Connect Git Repository**: elige GitHub → `Nigh061tmare/Apex.`
   (si GitHub pide permiso para la app de Vercel, concédelo solo para ese repo).
3. Comprueba que **Production Branch** es `main`.

Después, en **Deployments**, el siguiente push aparecerá solo. Si quieres forzar uno ya:
botón **Redeploy** sobre el último despliegue.

Recomendado (opcional): en GitHub, renombra el repo `Apex.` a `apex-engine`
(Settings → Repository name). GitHub redirige el nombre viejo y Vercel lo sigue solo;
luego actualiza el remoto local con
`git remote set-url vercel-origin https://github.com/Nigh061tmare/apex-engine.git`.

## Origen

Extraída de `apex-powerscaling-engine/` el 2026-11-02 con solo los archivos que la web
importa realmente (trazado de imports desde `src/main.jsx` y `server.cjs`). El repositorio
original queda intacto. `server.cjs` es la versión limpia del último commit, sin el puente
SillyTavern/ENI (`/v1/*`, `/api/sd/*`), que sigue disponible en el `server.cjs` de la raíz.
