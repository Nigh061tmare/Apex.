// Cargador diferido del roster canónico APEX.
// characters.js pesa ~10 MB (770 fichas + perfiles tácticos). Para que el chunk
// inicial de la app sea ligero, este módulo lo importa de forma dinámica y
// cachea el resultado tras la primera carga.
//
// Uso:
//   import { loadRoster } from './data/rosterLoader';
//   loadRoster().then(({ list, deprecated }) => { ... });

let cache = null;
let promise = null;

export function loadRoster() {
  if (cache) return Promise.resolve(cache);
  if (!promise) {
    promise = import('./characters')
      .then((m) => {
        cache = {
          list: m.INITIAL_CHARACTERS || [],
          deprecated: m.DEPRECATED_RECORD_IDS || new Set()
        };
        return cache;
      })
      .catch((err) => {
        // Permite reintentar en un futuro intento si la carga falló
        promise = null;
        throw err;
      });
  }
  return promise;
}

// Acceso síncrono al roster ya cargado (devuelve [] si aún no está listo).
export function getRosterSync() {
  return cache ? cache.list : [];
}