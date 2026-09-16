/**
 * APEX Chozenshu Codex Service
 * ============================
 * Capa de acceso perezoso al corpus canonico Dragon Ball (Chozenshu 1-4).
 *  - `apex-codex.json`      (~114 KB) se descarga UNA vez y se memoiza.
 *  - `apex-codex-deep.json` (~814 KB) solo al usar la busqueda profunda.
 *
 * Todo el consumo es OPCIONAL y tolerante a fallos: si el fetch falla,
 * la app sigue funcionando exactamente igual que antes.
 */
import { summarizePassivesForPrompt, resolvePassiveIds, PASSIVE_REGISTRY } from '../lib/biologicalPassives';

const CODEX_URL = '/data/apex-codex.json';
const DEEP_URL = '/data/apex-codex-deep.json';

let _codex = null;
let _codexPromise = null;
let _deep = null;
let _deepPromise = null;
let _idx = null;
let _dict = null;

/** Carga (memoizada) del bundle principal. Nunca lanza: devuelve null si falla. */
export function loadCodex() {
  if (_codex) return Promise.resolve(_codex);
  if (!_codexPromise) {
    _codexPromise = fetch(CODEX_URL, { cache: 'force-cache' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then((json) => { _codex = json; _idx = null; return json; })
      .catch((e) => { console.warn('[codex] no disponible:', e.message); _codexPromise = null; return null; });
  }
  return _codexPromise;
}

/** Carga (memoizada) del bundle profundo (dossier de personajes). */
export function loadCodexDeep() {
  if (_deep) return Promise.resolve(_deep);
  if (!_deepPromise) {
    _deepPromise = fetch(DEEP_URL, { cache: 'force-cache' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then((json) => { _deep = json; return json; })
      .catch((e) => { console.warn('[codex:deep] no disponible:', e.message); _deepPromise = null; return null; });
  }
  return _deepPromise;
}

/** Acceso sincrono al codex ya cargado (null si aun no esta). */
export function getCodexSync() { return _codex; }

/** Indices construidos una sola vez. */
function indices() {
  if (_idx) return _idx;
  if (!_codex) return { techById: new Map(), bpByChar: new Map(), tlByAge: new Map() };
  const techById = new Map(_codex.techniques.map((t) => [t.id, t]));
  const bpByChar = new Map();
  for (const r of _codex.battlePowers) {
    if (!r.c) continue;
    if (!bpByChar.has(r.c)) bpByChar.set(r.c, []);
    bpByChar.get(r.c).push(r);
  }
  const tlByAge = new Map();
  for (const e of _codex.timeline) {
    if (!tlByAge.has(e.a)) tlByAge.set(e.a, []);
    tlByAge.get(e.a).push(e);
  }
  _idx = { techById, bpByChar, tlByAge };
  return _idx;
}

// --------------------------------------------------------------------------
// Consultas sobre datos ya cargados (sincronas; devuelven [] si no hay codex)
// --------------------------------------------------------------------------

/** Tecnicas canonicas de un personaje (por id del roster). */
export function getTechniquesForCharacter(characterId) {
  if (!_codex || !characterId) return [];
  const ids = _codex.byCharacter?.[characterId] || [];
  const { techById } = indices();
  return ids.map((i) => techById.get(i)).filter(Boolean);
}

/** Fuerzas de combate canonicas registradas para un personaje. */
export function getBattlePowersForCharacter(characterId) {
  if (!_codex || !characterId) return [];
  return indices().bpByChar.get(characterId) || [];
}

/** Pasivas biologicas activas segun el motor determinista. */
export function getPassivesForCharacter(character) {
  const ids = resolvePassiveIds(character || {});
  return ids.map((id) => PASSIVE_REGISTRY.find((r) => r.id === id)).filter(Boolean);
}

/** Bloque de texto listo para inyectar en el prompt del LLM de simulacion. */
export function getPassivePromptBlock(character) {
  return summarizePassivesForPrompt(character || {});
}

/** Eventos de cronologia en un rango de Age. */
export function getTimeline({ from = 0, to = 99999, limit = 200 } = {}) {
  if (!_codex) return [];
  return _codex.timeline.filter((e) => e.a >= from && e.a <= to).slice(0, limit);
}

/** Busqueda global sincrona sobre el bundle principal. */
export function searchCodex(query, { limit = 40 } = {}) {
  if (!_codex || !query) return [];
  const q = String(query).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const hit = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q);
  const out = [];
  for (const t of _codex.techniques) {
    if (hit(t.es) || hit(t.ro) || hit(t.id) || (t.al || []).some(hit)) {
      out.push({ kind: 'technique', id: t.id, title: t.es, subtitle: t.ro, badge: t.ty, attested: t.at, hits: t.n, extra: t.de });
      if (out.length >= limit) return out;
    }
  }
  for (const r of _codex.battlePowers) {
    if (hit(r.n) || hit(r.c) || hit(r.a)) {
      out.push({ kind: 'power', id: `bp-${r.c || r.n}-${r.v}`, title: `${r.v.toLocaleString('es-ES')} u.`, subtitle: r.n, badge: r.a, extra: r.nt });
      if (out.length >= limit) return out;
    }
  }
  for (const p of _codex.passives) {
    if (hit(p.name) || hit(p.id) || hit(p.effect)) {
      out.push({ kind: 'passive', id: p.id, title: p.name, subtitle: p.cat, badge: 'pasiva', extra: p.effect });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

/** Busqueda profunda (dossier). Requiere loadCodexDeep(). */
export async function searchDossier(query, { limit = 60 } = {}) {
  const deep = await loadCodexDeep();
  if (!deep || !query) return [];
  const q = String(query).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const out = [];
  for (const b of deep.blocks) {
    if (String(b.x).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q)) {
      out.push(b);
      if (out.length >= limit) break;
    }
  }
  return out;
}

/** Metricas del corpus para cabeceras de UI. */
export function codexStats() {
  if (!_codex) return null;
  return _codex.meta;
}

/* ---------------------------------------------------------------------------
 * DICCIONARIO DE TECNICAS (Chozenshu 4, pp.135-176)
 * Entradas canonicas con capitulo (N), tipo (T), ejecutor (P) y descripcion (C).
 * ------------------------------------------------------------------------- */

function ensureDict() {
  if (_dict) return _dict;
  _dict = _codex?.techniqueDictionary || [];
  return _dict;
}

/** Todas las entradas del diccionario, ordenadas por capitulo. */
export function listTechniqueDictionary() {
  return ensureDict().map((x) => ({
    chapter: x.n,
    origin: x.o,
    type: x.t,
    performer: x.p,
    description: x.d,
    page: x.g
  }));
}

/** Busca en el diccionario por tipo (T), ejecutor (P) o descripcion (C). */
export function searchTechniqueDictionary(query = '', limit = 80) {
  const q = String(query || '').toLowerCase().trim();
  const all = ensureDict();
  if (!q) return listTechniqueDictionary().slice(0, limit);
  const out = [];
  for (const x of all) {
    const blob = `${x.t || ''} ${x.p || ''} ${x.d || ''}`.toLowerCase();
    if (blob.includes(q)) {
      out.push({
        chapter: x.n,
        origin: x.o,
        type: x.t,
        performer: x.p,
        description: x.d,
        page: x.g
      });
      if (out.length >= limit) break;
    }
  }
  return out;
}

/** Entradas del diccionario cuyo ejecutor coincide con el personaje dado. */
export function getTechniqueDictionaryForCharacter(character, limit = 60) {
  if (!character) return [];
  const tokens = String(character.name || character.id || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 4);
  if (!tokens.length) return [];
  const out = [];
  for (const x of ensureDict()) {
    const p = (x.p || '').toLowerCase();
    if (!p) continue;
    if (tokens.some((t) => p.includes(t))) {
      out.push({
        chapter: x.n,
        origin: x.o,
        type: x.t,
        performer: x.p,
        description: x.d,
        page: x.g
      });
      if (out.length >= limit) break;
    }
  }
  return out;
}

/** Limpia las caches en memoria (util en pruebas). */
export function resetCodexCache() {
  _codex = null;
  _deep = null;
  _dict = null;
  _idx = null;
}
