// Reinicio seguro de la app.
//
// "Limpiar caché" NO debe borrar los datos del usuario (historial, escenarios,
// campañas, monedas, claves de IA...). Lo que deja la app en una versión vieja
// es la caché del service worker, así que eso es lo que se purga, junto con el
// estado de UI efímero (selecciones y borradores) que puede quedar corrupto.

const VOLATILE_KEY_PREFIXES = ['apex_selected_'];
const VOLATILE_KEYS = ['apex_current_simulation_draft', 'apex_roster_version'];

async function purgeServiceWorkerCaches() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch (e) {
    console.warn('No se pudo purgar la caché del service worker:', e);
  }
}

function clearVolatileState() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (VOLATILE_KEYS.includes(key) || VOLATILE_KEY_PREFIXES.some((p) => key.startsWith(p))) {
        localStorage.removeItem(key);
      }
    }
    sessionStorage.clear();
  } catch (e) {}
}

// Purga caché + estado efímero y recarga. Conserva los datos del usuario.
export async function softReset() {
  clearVolatileState();
  await purgeServiceWorkerCaches();
  window.location.reload();
}

// Borra TODO lo guardado por la app en este navegador. Solo tras confirmación explícita.
export async function hardReset() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key.startsWith('apex_')) localStorage.removeItem(key);
    }
    sessionStorage.clear();
  } catch (e) {}
  await purgeServiceWorkerCaches();
  window.location.reload();
}
