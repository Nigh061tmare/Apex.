// APEX UX Feedback — sistema global de toasts.
// Reemplaza los alert() nativos por notificaciones elegantes sin tocar
// las ~40 llamadas existentes: se parchea window.alert al montar la app.

let toastSeq = 0;

export function apexNotify(message, type = 'info') {
  if (typeof window === 'undefined') return;
  const id = ++toastSeq;
  window.dispatchEvent(new CustomEvent('apex:toast', {
    detail: { id, message: String(message ?? ''), type }
  }));
}

export function apexNotifyError(message) {
  apexNotify(message, 'error');
}

export function apexNotifySuccess(message) {
  apexNotify(message, 'success');
}

// Parchea window.alert para que TODOS los alert existentes se muestren
// como toasts. Se llama una única vez desde main.jsx tras montar React.
export function patchNativeAlerts() {
  if (typeof window === 'undefined' || window.__apexAlertsPatched) return;
  window.__apexAlertsPatched = true;
  try {
    window.alert = (msg) => apexNotify(msg, 'info');
  } catch (e) { /* entorno sin permisos */ }
}