#!/usr/bin/env node
/* ============================================================
 * APEX — Enriquecedor de imágenes oficiales v2 (SIN IA)
 *
 * Fix del 403: el API de Fandom exige un User-Agent identificable.
 * Fuente: Fandom MediaWiki API (action=query + generator=search +
 *         prop=pageimages) → arte oficial del personaje.
 *
 * Uso: node src/scripts/enrichCharacterImagesV2.cjs [--limit=N] [--dry]
 * ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ROSTER_PATH = path.join(ROOT, 'src', 'data', 'ROSTER_NIVELES_PODER_CORREGIDO_V26.json');
const IMAGES_PATH = path.join(ROOT, 'src', 'data', 'characterImages.json');
const CACHE_PATH = path.join(ROOT, 'src', 'data', 'reports', 'imageEnrichCacheV2.json');

const UA = 'APEX-PowerScaling-Engine/1.0 (https://apex-engine-six.vercel.app; contact: apex-engine@example.com)';
const DELAY_MS = 1100;   // cortesía con el API
const THUMB_SIZE = 400;
const MAX_RETRIES = 2;

/** universo → subdominio de la wiki de Fandom */
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isUsable(image) {
  if (typeof image !== 'string') return false;
  const v = image.trim();
  if (!v || v === 'null' || v === 'undefined') return false;
  return /^(https?:\/\/|data:image\/|\/)/i.test(v);
}

function normalizeName(name) {
  return String(name || '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** "Goku (Super Saiyan 4)" → { base:'Goku', hint:'Super Saiyan 4' } */
function splitName(fullName) {
  const raw = String(fullName || '');
  const m = raw.match(/^([^(]+?)\s*\(([^)]+)\)\s*$/);
  if (m) return { base: m[1].trim(), hint: m[2].trim() };
  return { base: raw.trim(), hint: '' };
}

function wikiFor(universe) {
  for (const w of WIKIS) if (w.match.test(universe || '')) return w.wiki;
  return null;
}

async function fetchJson(url, attempt = 0) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      redirect: 'follow',
    });
    if (res.status === 429 || res.status >= 500) {
      if (attempt < MAX_RETRIES) {
        await sleep(2500 * (attempt + 1));
        return fetchJson(url, attempt + 1);
      }
      return { error: `HTTP ${res.status}` };
    }
    if (!res.ok) return { error: `HTTP ${res.status}` };
    return { data: await res.json() };
  } catch (e) {
    if (attempt < MAX_RETRIES) {
      await sleep(1500 * (attempt + 1));
      return fetchJson(url, attempt + 1);
    }
    return { error: e.message };
  }
}

/** Busca la imagen oficial del personaje en su wiki de Fandom. */
async function findOfficialImage(char) {
  const wiki = wikiFor(char.universe);
  if (!wiki) return { url: null, reason: 'sin-wiki-mapeada' };

  const { base, hint } = splitName(char.name);
  const terms = [];
  if (hint) terms.push(`${base} ${hint}`);
  terms.push(base);

  for (const term of terms) {
    const q = encodeURIComponent(term);
    const url =
      `https://${wiki}.fandom.com/api.php?action=query&generator=search` +
      `&gsrsearch=${q}&gsrlimit=1&prop=pageimages&piprop=thumbnail` +
      `&pithumbsize=${THUMB_SIZE}&format=json&redirects=1`;

    const { data, error } = await fetchJson(url);
    await sleep(DELAY_MS);
    if (error) return { url: null, reason: error };

    const pages = data?.query?.pages;
    if (!pages) continue;
    for (const p of Object.values(pages)) {
      const src = p?.thumbnail?.source;
      if (isUsable(src)) {
        return { url: src, reason: `wiki:${wiki}`, page: p.title };
      }
    }
  }
  return { url: null, reason: `sin-resultado:${wiki}` };
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

  const raw = JSON.parse(fs.readFileSync(ROSTER_PATH, 'utf8'));
  const charsRaw = raw.characters;
  const list = Array.isArray(charsRaw) ? charsRaw : Object.values(charsRaw || {});
  const images = JSON.parse(fs.readFileSync(IMAGES_PATH, 'utf8'));

  // Índice por nombre (para no repetir arte ya presente)
  const nameIndex = new Set();
  for (const [id, url] of Object.entries(images)) {
    if (isUsable(url)) nameIndex.add(normalizeName(id.replace(/-/g, ' ')));
  }

  const missing = list.filter((c) => !isUsable(images[c.id]) && !isUsable(c.avatar) && !isUsable(c.image));
  console.log(`🔍 ${missing.length} personajes sin imagen real`);

  let cache = {};
  if (fs.existsSync(CACHE_PATH)) {
    try { cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')); } catch { cache = {}; }
  }

  const todo = missing.filter((c) => !(c.id in cache)).slice(0, limit);
  console.log(`   pendientes en esta pasada: ${todo.length}${dry ? ' (DRY RUN)' : ''}`);

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < todo.length; i++) {
    const c = todo[i];
    const res = await findOfficialImage(c);
    if (res.url) {
      ok++;
      cache[c.id] = { url: res.url, source: res.reason, page: res.page || null };
      if (!dry) images[c.id] = res.url;
      console.log(`  [${String(i + 1).padStart(3)}/${todo.length}] ✅ ${c.name}  →  ${String(res.page).slice(0, 45)}`);
    } else {
      fail++;
      cache[c.id] = { url: null, source: res.reason };
      console.log(`  [${String(i + 1).padStart(3)}/${todo.length}] ❌ ${c.name}  (${res.reason})`);
    }
    if ((i + 1) % 25 === 0) {
      if (!fs.existsSync(path.dirname(CACHE_PATH))) fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
      fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8');
      if (!dry) fs.writeFileSync(IMAGES_PATH, JSON.stringify(images, null, 2), 'utf8');
    }
  }

  if (!fs.existsSync(path.dirname(CACHE_PATH))) fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8');
  if (!dry) fs.writeFileSync(IMAGES_PATH, JSON.stringify(images, null, 2), 'utf8');

  console.log(`\n✅ Encontradas: ${ok} | ❌ Sin resultado: ${fail} | Total índice: ${Object.keys(images).length}`);
}

main();
