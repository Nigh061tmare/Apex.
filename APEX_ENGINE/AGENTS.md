# APEX Engine — instrucciones para agentes de IA (OpenCode, Antigravity, Claude)

Web React 19 + Vite 6 + Tailwind 4. Interfaz y textos en español. Ver `README.md` para la estructura.

## Antes de dar un cambio por terminado

```bash
npm run check   # validador del roster + tests del motor de combate + build
```

Los tres deben pasar. El CI de GitHub ejecuta lo mismo.

## Reglas del proyecto

- **El roster V26 es la base inmutable.** `src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json`,
  `tacticalProfiles.json` y `characters.js` no se editan sin que se pida; si se piden cambios,
  `npm run validate` debe seguir en PASS.
- `characters.js` pesa ~10 MB y se carga en diferido con `src/data/rosterLoader.js`;
  no lo importes de forma estática desde código del bundle inicial.
- Todas las claves de `localStorage` llevan prefijo `apex_`. Nunca uses `localStorage.clear()`:
  para reiniciar usa `softReset()` / `hardReset()` de `src/lib/appReset.js`.
- Si cambias archivos de `public/` que cachea el service worker, sube `CACHE_NAME` en `public/sw.js`.
- Las claves de API de los usuarios se guardan solo en su navegador. No añadas claves al código.
- `public/data/apex-codex*.json` se generan con `npm run codex`; no los edites a mano.

## Publicación

Un push a `main` publica en producción vía Vercel. Para cambios grandes, mejor rama + PR:
Vercel crea una URL de vista previa y el CI valida antes de fusionar.
