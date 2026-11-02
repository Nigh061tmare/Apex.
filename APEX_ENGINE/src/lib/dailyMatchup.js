// Combate del Día — matchup diario determinista basado en fecha.
// Mismo día = mismo enfrentamiento para todos los usuarios (retención social).
// Puro y sin estado, fácil de testear.

export function getDailySeed(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return y * 10000 + m * 100 + d;
}

// Hash determinista sin dependencias (variante de xmur3 simplificada).
export function hashNumber(n) {
  let h = n >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h ^= h >>> 16;
  return h >>> 0;
}

export function dateLabel(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

// Devuelve { charA, charB, seed, dateLabel } o null si el roster es insuficiente.
export function getDailyMatchup(list, date = new Date()) {
  if (!Array.isArray(list) || list.length < 2) return null;
  const seed = getDailySeed(date);
  const iA = hashNumber(seed) % list.length;
  let iB = hashNumber(seed * 31 + 17) % list.length;
  if (iB === iA) iB = (iB + 1) % list.length;
  return {
    charA: list[iA],
    charB: list[iB],
    seed,
    dateLabel: dateLabel(date)
  };
}

// Construye una URL compartible para un matchup 1v1.
export function buildShareableUrl(charA, charB, mode = '1v1') {
  const params = new URLSearchParams();
  if (charA?.id) params.set('charA', charA.id);
  if (charB?.id) params.set('charB', charB.id);
  if (mode && mode !== '1v1') params.set('mode', mode);
  const qs = params.toString();
  const url = new URL(window.location.href);
  url.search = qs ? `?${qs}` : '';
  return url.toString();
}

// Parsea los parámetros ?charA=id&charB=id&mode=x devolviendo { charA, charB, mode }.
export function parseShareableUrl(search = window.location.search) {
  const params = new URLSearchParams(search);
  const charA = params.get('charA');
  const charB = params.get('charB');
  const mode = params.get('mode');
  if (!charA && !charB) return null;
  return { charA, charB, mode: mode || '1v1' };
}