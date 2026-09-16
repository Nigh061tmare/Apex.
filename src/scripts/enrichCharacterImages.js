// APEX — Enriquecedor de imágenes oficiales (no IA)
// Fuentes: AniList GraphQL / Kitsu REST / Jikan (MyAnimeList) / Wikis oficiales
// Rate-limit: 30 req/min global + cache persistente en disco

import fs from 'fs';
import path from 'path';

const V26_PATH = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json';
const CACHE_DIR = 'src/data/_image_cache';
const OUT_PATH = 'src/data/characterImages.json';

const ANILIST_GQL = `
query ($search: String) {
  Character(search: $search) {
    id
    name { full native }
    image { large medium }
    media { id title { romaji english native } }
  }
}`;

const KITSU_URL = 'https://kitsu.io/api/edge/characters?filter[name]=';
const JIKAN_URL = 'https://api.jikan.moe/v4/characters?q=';

const FRANCHISE_WIKI = {
  'dragon ball': { wiki: 'dragonball.fandom.com', api: 'allimages' },
  'jujutsu kaisen': { wiki: 'jujutsu-kaisen.fandom.com' },
  'demon slayer': { wiki: 'kimetsu-no-yaiba.fandom.com' },
  'chainsaw man': { wiki: 'chainsaw-man.fandom.com' },
  'hunter x hunter': { wiki: 'hunterxhunter.fandom.com' },
  'jojo': { wiki: 'jojo.fandom.com' },
  'one punch man': { wiki: 'onepunchman.fandom.com' },
  'my hero academia': { wiki: 'myheroacademia.fandom.com' },
  'berserk': { wiki: 'berserk.fandom.com' },
  'bleach': { wiki: 'bleach.fandom.com' },
  'naruto': { wiki: 'naruto.fandom.com' },
  'one piece': { wiki: 'onepiece.fandom.com' },
  'chainsaw man': { wiki: 'chainsaw-man.fandom.com' },
  'spy x family': { wiki: 'spy-x-family.fandom.com' },
  'record of ragnarok': { wiki: 'recordofragnarok.fandom.com' },
  'baki': { wiki: 'baki.fandom.com' },
  'invincible': { wiki: 'invincible.fandom.com' },
  'the boys': { wiki: 'the-boys.fandom.com' },
  'spy x family': { wiki: 'spy-x-family.fandom.com' },
};

const DELAY_MS = 2500; // 2.5s entre requests (respetuoso)
const CONCURRENCY = 2;
const CACHE_FILE = 'src/data/_image_cache/enrichment_cache.json';

function loadCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch { return {}; }
}
function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithRetry(url, opts = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(url, { ...opts, signal: ctrl.signal });
      clearTimeout(t);
      if (res.status === 429) { await sleep(30000); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(5000 * (i + 1));
    }
  }
  return null;
}

// ---------- BÚSQUEDA POR FRANQUICIA ----------

// AniList GraphQL
async function searchAniList(name) {
  const q = `query($s:String){Character(search:$s){id name{full native}image{large medium}media{id title{romaji english native}}}}`;
  const res = await fetchWithRetry('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query: ANILIST_GQL, variables: { search: name } })
  });
  return res?.data?.Character;
}

// Kitsu REST
async function searchKitsu(name) {
  const url = KITSU_URL + encodeURIComponent(name);
  const res = await fetchWithRetry(url);
  return res?.data?.[0]?.attributes;
}

// Jikan (MyAnimeList)
async function searchJikan(name) {
  const url = JIKAN_URL + encodeURIComponent(name);
  const res = await fetchWithRetry(url);
  return res?.data?.[0];
}

// Wiki Fandom (allimages search)
async function searchFandomWiki(domain, prefix) {
  const url = `https://${domain}/api.php?action=query&list=allimages&aiprefix=${encodeURIComponent(prefix)}&ailimit=5&format=json`;
  const res = await fetchWithRetry(`https://${domain}/api.php?action=query&list=allimages&aiprefix=${encodeURIComponent(prefix)}&ailimit=8&aiprop=url|url&format=json`);
  return (d.query?.allimages || []).map(i => i.url);
}

// ---------- RESOLUCIÓN POR PERSONAJE ----------

function normalizeName(name) {
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function buildSearchVariants(char) {
  const base = normalizeName(char.name);
  const saga = char.saga ? ` ${char.saga}` : '';
  const universe = char.universe || '';
  return [
    `${base}${saga}`,
    `${base} ${universe}`,
    base,
    // Variante sin "Son ", "Mr.", etc.
    base.replace(/^(Son|Mr\.?|Maestro|Gran|Señor|Reina|Príncipe)\s+/i, '').trim()
  ].filter(Boolean);
}

async // ---------- RESOLUCIÓN POR PERSONAJE ----------

function findBestImage(char, cache) {
  const cacheKey = `img::${char.id}`;
  if (cache[cacheKey]) return cache[cacheKey];

  const searchTerms = buildSearchVariants(char);
  const universe = (char.universe || '').toLowerCase();
  const wikiInfo = FRANCHISE_WIKI[universe] || (FRANCHISE_WIKI[Object.keys(FRANCHISE_WIKI).find(k => universe.includes(k))] || null);

  // 1. AniList (mejor cobertura anime/manga)
  for (const term of searchTerms) {
    const hit = await searchAniList(term);
    if (hit?.image?.large) {
      cache[cacheKey] = { url: hit.image.large, source: 'anilist' };
      return cache[cacheKey];
    }
    await sleep(500);
  }

  // 2. Kitsu (buen fallback)
  for (const term of searchTerms.slice(0, 3)) {
    const data = await searchKitsu(name);
    if (data?.image?.original) {
      cache[cacheKey] = { url: data.image.original, source: 'kitsu' };
      return cache[cacheKey];
    }
    await sleep(500);
  }

  // 3. Jikan (MyAnimeList)
  for (const term of searchTerms.slice(0, 3)) {
    const data = await searchJikan(name);
    if (data?.images?.jpg?.image_url) {
      cache[cacheKey] = { url: data.images.jpg.large_image_url, source: 'jikan' };
      return cache[cacheKey];
    }
    await sleep(500);
  }

  // 3b. Wiki de la franquicia (allimages prefix)
  if (wikiInfo) {
    for (const term of searchTerms.slice(0, 3)) {
      const urls = await searchFandomWiki(wikiInfo.wiki, term);
      if (urls.length) {
        cache[cacheKey] = { url: urls[0], source: `wiki:${wikiInfo.wiki}` };
        return cache[cacheKey];
      }
      await sleep(1000);
    }
  }

  cache[cacheKey] = { url: null, source: 'none' };
  return null;
}

// ---------- EJECUCIÓN PRINCIPAL ----------
async function enrichAll() {
  const v26 = JSON.parse(fs.readFileSync('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'utf8'));
  const chars = Object.values(v26.characters || v26);
  const imgs = JSON.parse(fs.readFileSync('src/data/characterImages.json', 'utf8'));

  const missing = Object.values(v26.characters || v26).filter(c => !imgs[c.id]);
  console.log(`🔍 ${missing.length} personajes sin imagen real`);

  const cache = loadCache();
  let enriched = 0, failed = 0;

  for (let i = 0; i < missing.length; i += CONCURRENCY) {
    const batch = missing.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (c) => {
      const res = await findBestImage(c, cache);
      if (res?.url) {
        imgs[c.id] = { url: c.id, url: res.url, source: res.source };
        enriched++;
      } else {
        failed++;
      }
    }));
    if (i % 20 === 0) {
      console.log(`Progreso: ${Math.min(i + CONCURRENCY, missing.length)}/${missing.length} | OK:${enriched} Fail:${failed}`);
      saveCache(cache);
    }
    await sleep(DELAY_MS * CONCURRENCY);
  }

  // Guardar
  fs.writeFileSync('src/data/characterImages.json', JSON.stringify({ ...imgs, ...Object.fromEntries(
    Object.entries(cache).filter(([k,v]) => v?.url)
  )}, null, 2));

  // Merge into V26 (inyectar avatar en cada ficha)
  const imgsFinal = JSON.parse(fs.readFileSync('src/data/characterImages.json', 'utf8'));
  for (const [id, data] of Object.entries(imgsFinal)) {
    if (v26.characters && v26.characters[id]) v26.characters[id].avatar = data.url;
    else if (Array.isArray(v26.characters)) {
      const idx = v26.characters.findIndex(c => c.id === id);
      if (idx >= 0) v26.characters[idx].avatar = imgsFinal[id]?.url || null;
    }
  }
  fs.writeFileSync('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', JSON.stringify(v26, null, 2));
  fs.writeFileSync('src/data/characterImages.json', JSON.stringify(imgsFinal, null, 2));
  console.log(`\n✅ Enriquecimiento completo: ${enriched} nuevas imágenes | Fallidos: ${failed}`);
}

enrichAll().catch(e => console.error('FATAL:', e));