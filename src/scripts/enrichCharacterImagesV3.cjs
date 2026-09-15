#!/usr/bin/env node
/* ============================================================
 * APEX — Enriquecedor de imágenes oficiales v3 (SIN IA)
 *
 * Mejoras sobre v2:
 *   • Limpieza de nombres del roster (metadatos "Db 23Tb", "Saga X")
 *   • Traducción ES→EN de términos comunes (Androide→Android, ...)
 *   • Búsqueda con varios candidatos (gsrlimit=5)
 *   • VALIDACIÓN ESTRICTA contra el título de la página:
 *     sin coincidencia fiable NO se asigna imagen (mejor placeholder
 *     que una imagen de otro personaje).
 *
 * Uso: node src/scripts/enrichCharacterImagesV3.cjs [--limit=N] [--dry]
 * ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ROSTER_PATH = path.join(ROOT, 'src', 'data', 'ROSTER_NIVELES_PODER_CORREGIDO_V26.json');
const IMAGES_PATH = path.join(ROOT, 'src', 'data', 'characterImages.json');
const CACHE_PATH = path.join(ROOT, 'src', 'data', 'reports', 'imageEnrichCacheV3.json');

const UA = 'APEX-PowerScaling-Engine/1.0 (https://apex-engine-six.vercel.app; contact: apex-engine@example.com)';
const DELAY_MS = 1000;
const THUMB_SIZE = 400;
const MAX_RETRIES = 2;

const WIKIS = [
  { match: /dragon ball/i, wiki: 'dragonball' },
  { match: /my hero academia|boku no hero/i, wiki: 'myheroacademia' },
  { match: /dc comics|\bdc\b/i, wiki: 'dc' },
  { match: /marvel/i, wiki: 'marvel' },
  { match: /jojo/i, wiki: 'jojo' },
  { match: /invincible/i, wiki: 'invincible' },
  { match: /baki/i, wiki: 'baki' },
  { match: /chainsaw man/i, wiki: 'chainsaw-man' },
  { match: /one punch man/i, wiki: 'onepunchman' },
  { match: /jujutsu kaisen/i, wiki: 'jujutsu-kaisen' },
  { match: /hunter x hunter/i, wiki: 'hunterxhunter' },
  { match: /demon slayer|kimetsu/i, wiki: 'kimetsu-no-yaiba' },
  { match: /record of ragnarok|shuumatsu/i, wiki: 'record-of-ragnarok' },
  { match: /the boys/i, wiki: 'the-boys' },
  { match: /spy x family/i, wiki: 'spy-x-family' },
];

/** Tokens que son metadatos de roster, no parte del nombre. */
const META_TOKENS = new Set([
  'db', 'dbz', 'dbs', 'dbgt', 'dbd', 'dbsuper', 'tb', '21tb', '22tb', '23tb',
  'saga', 'arc', 'base', 'forma', 'form', 'inicio', 'poder', 'completo', 'completa',
  'maximo', 'maxima', 'z', 'gt', 'super', 'clasico', 'pelicula', 'peliculas', 'ova', 'ovas',
  'manga', 'anime', 'what', 'if', 'version', 'v1', 'v2', 'v3',
]);

/** Traducción ES→EN de términos frecuentes en el roster. */
const ES_EN = {
  androide: 'android', androides: 'android', comandante: 'commander', coronel: 'colonel',
  emperador: 'emperor', emperatriz: 'empress', mayor: 'major', anciano: 'old', anciana: 'old',
  maestro: 'master', senor: 'mr', rey: 'king', reina: 'queen', principe: 'prince',
  dios: 'god', angel: 'angel', demonio: 'demon', ninos: 'kids', nino: 'kid',
  futuro: 'future', gran: 'grand', patriarca: 'elder', sacerdote: 'priest',
  norte: 'north', este: 'east', oeste: 'west', sur: 'south',
  freezer: 'frieza', guerreros: 'warriors',
  resurreccion: 'resurrection', llegada: 'arrival', tierra: 'earth',
  armadura: 'armor', espada: 'sword', del: '', de: '', la: '', el: '', los: '', las: '',
  con: '', y: '', en: '', a: '', al: '',
};

/** Títulos que NO son fichas de personaje. */
const BAD_TITLE = /\((chapter|episode|volume|manga chapter|disambiguation|gallery|category|image|images|song|soundtrack|ost|game|arc|film|movie|list|timeline)\)|\bvs\.?\b/i;

/** Frases compuestas del roster → nombre canónico en la wiki (prevalece sobre la traducción por tokens). */
const PHRASE_MAP = [
  [/\banciano\s+kaio\s*shin\b|\brou\s*kaioshin\b/, 'Old Kai'],
  [/\bkaio\s*sama\s*del\s*norte\b|\bkaio\s*del\s*norte\b|\bnorth\s*kai\b/, 'King Kai'],
  [/\bgran\s*patriarca\s*guru\b|\bpatriarca\s*guru\b/, 'Grand Elder Guru'],
  [/\bgran\s*sacerdote\b|\bdaishinkan\b/, 'Grand Priest'],
  [/\bgohan\s*(ultimate|mystic)\b|\b(ultimate|mystic)\s*gohan\b/, 'Gohan'],
  [/\bgohan\s*del\s*futuro\b|\bfuturo\s*gohan\b/, 'Future Gohan'],
  [/\btrunks\s*del\s*futuro\b|\bfuturo\s*trunks\b/, 'Future Trunks'],
  [/\btrunks\s*nino\b|\bnino\s*trunks\b/, 'Kid Trunks'],
  [/\bmecha\s*freezer\b|\bmecha\s*frieza\b/, 'Mecha Frieza'],
  [/\bshin\s*kaio\s*shin\s*del\s*este\b|\bkaio\s*shin\s*del\s*este\b/, 'East Supreme Kai'],
  [/\bvegeta\s*majin\b|\bmajin\s*vegeta\b/, 'Majin Vegeta'],
  [/\bbuuhan\b/, 'Buuhan'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isUsable(image) {
  if (typeof image !== 'string') return false;
  const v = image.trim();
  if (!v || v === 'null' || v === 'undefined') return false;
  return /^(https?:\/\/|data:image\/|\/)/i.test(v);
}

function normAlnum(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

function tokens(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter((t) => t.length >= 3);
}

function wikiFor(universe) {
  for (const w of WIKIS) if (w.match.test(universe || '')) return w.wiki;
  return null;
}

/** "Androide 17 (Saga Androides)" → "Android 17" */
function cleanName(fullName) {
  let s = String(fullName || '');
  s = s.replace(/\([^)]*\)/g, ' ');            // fuera paréntesis
  s = s.replace(/[/|,].*$/, ' ');              // fuera coletillas tras separador
  const flat = s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Frases compuestas canónicas (mayor prioridad)
  for (const [re, rep] of PHRASE_MAP) if (re.test(flat)) return rep;

  // 2. Limpieza token a token + traducción
  const words = flat.split(/\s+/).filter(Boolean);
  const kept = [];
  for (const w of words) {
    const k = normAlnum(w);
    if (!k) continue;
    if (META_TOKENS.has(k)) continue;
    kept.push(ES_EN[k] !== undefined ? ES_EN[k] : w);
  }
  return kept.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/** Rangos/títulos genéricos: nunca valen como término de búsqueda por sí solos. */
const GENERIC_TOKENS = new Set([
  'colonel', 'commander', 'emperor', 'empress', 'major', 'general', 'captain',
  'king', 'queen', 'prince', 'princess', 'lord', 'lady', 'master', 'doctor', 'mr', 'mrs',
  'grand', 'supreme', 'future', 'old', 'kid', 'android', 'demon', 'god', 'angel', 'sir',
]);

/** Puntuación de correspondencia: 3 exacta, 2 prefijo, 1 token distintivo, 0 rechazada. */
function matchScore(term, pageTitle) {
  if (!pageTitle || BAD_TITLE.test(pageTitle)) return 0;
  const a = normAlnum(term);
  const b0 = String(pageTitle).split('/')[0];   // "Chi-Chi/Dragonball Evolution" → "Chi-Chi"
  const baseNorm = normAlnum(b0);
  if (!a || !baseNorm) return 0;

  if (a === baseNorm) return 3;                                   // "Nam" ↔ "Nam"
  if (baseNorm.startsWith(a) || a.startsWith(baseNorm)) return 2; // "Piccolo" ↔ "Piccolo Jr."

  // Regla del token MÁS DISTINTIVO: el último token significativo del término
  // (habitualmente el nombre propio) debe aparecer en el título.
  const tTerm = tokens(term).filter((t) => t.length >= 4);
  if (tTerm.length === 0) return 0;
  const last = tTerm[tTerm.length - 1];
  return new Set(tokens(b0)).has(last) ? 1 : 0;
}

function isReliableMatch(term, pageTitle) {
  return matchScore(term, pageTitle) > 0;
}

async function fetchJson(url, attempt = 0) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, redirect: 'follow' });
    if (res.status === 429 || res.status >= 500) {
      if (attempt < MAX_RETRIES) { await sleep(2500 * (attempt + 1)); return fetchJson(url, attempt + 1); }
      return { error: `HTTP ${res.status}` };
    }
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return { data: await res.json() };
  } catch (e) {
    if (attempt < MAX_RETRIES) { await sleep(1500 * (attempt + 1)); return fetchJson(url, attempt + 1); }
    return { error: e.message };
  }
}

/** Busca la imagen oficial validando que la página sea del personaje. */
async function findOfficialImage(char) {
  const wiki = wikiFor(char.universe);
  if (!wiki) return { url: null, reason: 'sin-wiki-mapeada' };

  const cleaned = cleanName(char.name);
  if (!cleaned) return { url: null, reason: 'nombre-vacio-tras-limpiar' };

  const words = cleaned.split(' ');
  const terms = [cleaned];
  if (words.length > 2) terms.push(words.slice(0, 2).join(' '));
  const firstKey = normAlnum(words[0]);
  if (words.length > 1 && firstKey.length >= 3 && !GENERIC_TOKENS.has(firstKey)) terms.push(words[0]);

  const seen = new Set();
  let best = null;

  for (const term of terms) {
    if (seen.has(term)) continue;
    seen.add(term);
    const url =
      `https://${wiki}.fandom.com/api.php?action=query&generator=search` +
      `&gsrsearch=${encodeURIComponent(term)}&gsrlimit=5&prop=pageimages` +
      `&piprop=thumbnail&pithumbsize=${THUMB_SIZE}&format=json&redirects=1`;

    const { data, error } = await fetchJson(url);
    await sleep(DELAY_MS);
    if (error) return { url: null, reason: error };

    const pages = data?.query?.pages;
    if (!pages) continue;

    let termBest = null;
    // Un término de una sola palabra solo se acepta con coincidencia exacta (score 3):
    // evita asociar "Shen" → "Master Shen" (personaje distinto).
    const minScore = term.includes(' ') ? 1 : 3;
    for (const p of Object.values(pages)) {
      const src = p?.thumbnail?.source;
      if (!isUsable(src)) continue;
      const score = matchScore(term, p.title);
      if (score < minScore) continue;
      // mayor puntuación; a igualdad, título más corto (más canónico)
      if (!termBest || score > termBest.score || (score === termBest.score && p.title.length < termBest.title.length)) {
        termBest = { src, title: p.title, score };
      }
    }
    if (termBest && (!best || termBest.score > best.score)) best = termBest;
    if (best && best.score === 3) break; // coincidencia exacta: óptima
  }

  if (best) return { url: best.src, reason: `wiki:${wiki}`, page: best.title };
  return { url: null, reason: `sin-coincidencia-fiable:${wiki}` };
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const recheck = args.includes('--recheck');
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

  const raw = JSON.parse(fs.readFileSync(ROSTER_PATH, 'utf8'));
  const charsRaw = raw.characters;
  const list = Array.isArray(charsRaw) ? charsRaw : Object.values(charsRaw || {});
  const images = JSON.parse(fs.readFileSync(IMAGES_PATH, 'utf8'));

  const missing = list.filter((c) => !isUsable(images[c.id]) && !isUsable(c.avatar) && !isUsable(c.image));
  console.log(`🔍 ${missing.length} personajes sin imagen real`);

  let cache = {};
  if (fs.existsSync(CACHE_PATH)) {
    try { cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')); } catch { cache = {}; }
  }

  const todo = missing.filter((c) => recheck || !(c.id in cache)).slice(0, limit);
  console.log(`   pendientes en esta pasada: ${todo.length}${dry ? ' (DRY RUN)' : ''}\n`);

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < todo.length; i++) {
    const c = todo[i];
    const res = await findOfficialImage(c);
    const tag = `[${String(i + 1).padStart(3)}/${todo.length}]`;
    if (res.url) {
      ok++;
      cache[c.id] = { url: res.url, source: res.reason, page: res.page || null };
      if (!dry) images[c.id] = res.url;
      console.log(`${tag} ✅ ${c.name.padEnd(38)} → ${String(res.page).slice(0, 40)}`);
    } else {
      fail++;
      cache[c.id] = { url: null, source: res.reason };
      console.log(`${tag} ⛔ ${c.name.padEnd(38)} (${res.reason})`);
    }
    if ((i + 1) % 20 === 0) {
      fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
      fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8');
      if (!dry) fs.writeFileSync(IMAGES_PATH, JSON.stringify(images, null, 2), 'utf8');
    }
  }

  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8');
  if (!dry) fs.writeFileSync(IMAGES_PATH, JSON.stringify(images, null, 2), 'utf8');

  console.log(`\n✅ Validadas: ${ok} | ⛔ Rechazadas: ${fail} | Índice total: ${Object.keys(images).length}`);
}

main();
