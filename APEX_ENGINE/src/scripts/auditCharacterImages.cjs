/**
 * APEX ENGINE – AUDITOR DE IMÁGENES DEL ROSTER (characterImages.json)
 *
 * Modos de ejecución:
 *   node src/scripts/auditCharacterImages.cjs
 *     Solo comprobaciones locales: cobertura, claves huérfanas, archivos
 *     compartidos entre personajes y formato de las URLs.
 *
 *   node src/scripts/auditCharacterImages.cjs --online
 *     Además consulta la API de cada wiki de Fandom para cada archivo:
 *     - MISSING: el archivo no existe en la wiki.
 *     - PATH_MISMATCH: el archivo existe pero la URL apunta a otra ruta
 *       (Fandom responde 404 y sirve su imagen gris genérica, así que el
 *       navegador no dispara onerror y nunca se usa el retrato IA).
 *     - SMALL: el original mide menos de 150 px de lado.
 *     - ASPECT: proporción de banner o tira, se recorta mal en la tarjeta.
 *
 *   node src/scripts/auditCharacterImages.cjs --online --fix
 *     Reescribe las URLs con la ruta canónica que devuelve la API y normaliza
 *     el tamaño a scale-to-width-down/400 (o sin escalar si el original es menor).
 *
 * Se consulta la API (no el CDN) porque static.wikia.nocookie.net responde con
 * un desafío de Cloudflare a las peticiones sin navegador.
 * Sale con código 1 si hay errores (cobertura, MISSING o PATH_MISMATCH sin corregir).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');
const ROSTER_FILE = path.join(ROOT, 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json');
const IMAGES_FILE = path.join(ROOT, 'src/data/characterImages.json');

// Ruta de la wiki en static.wikia.nocookie.net -> subdominio de su API en fandom.com
const WIKI_API_HOST = {
  dragonball: 'dragonball',
  dragonballmultiverse: 'dragonballmultiverse',
  'kimetsu-no-yaiba': 'kimetsu-no-yaiba',
  'jujutsu-kaisen': 'jujutsu-kaisen',
  'chainsaw-man': 'chainsaw-man',
  hunterxhunter: 'hunterxhunter',
  jjba: 'jojo',
  onepunchman: 'onepunchman',
  bokunoheroacademia: 'myheroacademia',
  baki: 'baki',
  'shuumatsu-no-valkyrie': 'record-of-ragnarok',
  marveldatabase: 'marvel',
  marvel_dc: 'dc',
  'spy-x-family9171': 'spy-x-family',
  'amazon-invincible': 'amazon-invincible',
  'amazons-the-boys': 'amazons-the-boys',
};

// Universos sin wiki: el retrato IA es el comportamiento esperado.
const AI_FALLBACK_UNIVERSES = new Set(['UNIVERSO HÍBRIDO (APEX ORIGINAL)']);

const TARGET_WIDTH = 400;
const MIN_SIDE = 150;
const MIN_REQUESTED_WIDTH = 150;

const args = new Set(process.argv.slice(2));
const ONLINE = args.has('--online');
const FIX = args.has('--fix');

const roster = JSON.parse(fs.readFileSync(ROSTER_FILE, 'utf8')).characters;
const images = JSON.parse(fs.readFileSync(IMAGES_FILE, 'utf8'));

const errors = [];
const warnings = [];

function parseWikiUrl(url) {
  const m = url.match(/^https:\/\/static\.wikia\.nocookie\.net\/([^/]+)\/(?:([a-z-]{2,5})\/)?images\/[0-9a-f]\/[0-9a-f]{2}\/([^/?]+)/);
  if (!m) return null;
  return { wiki: m[1], lang: m[2] || null, file: decodeURIComponent(m[3]) };
}

function requestedWidth(url) {
  const m = url.match(/scale-to-width-down\/(\d+)/);
  return m ? Number(m[1]) : null;
}

function normalizedUrl(canonical, originalWidth) {
  const base = canonical.replace(/\/revision\/latest.*$/, '/revision/latest');
  const cb = (canonical.match(/[?&]cb=(\d+)/) || [])[1];
  const scale = originalWidth > TARGET_WIDTH ? `/scale-to-width-down/${TARGET_WIDTH}` : '';
  return `${base}${scale}${cb ? `?cb=${cb}` : ''}`;
}

// ── 1. Comprobaciones locales ───────────────────────────────────────────────
const ids = Object.keys(roster);
for (const id of ids) {
  if (roster[id].avatar || images[id]) continue;
  if (AI_FALLBACK_UNIVERSES.has(roster[id].universe)) continue;
  errors.push(`SIN_IMAGEN ${id} (${roster[id].name}) cae en el retrato IA`);
}
for (const key of Object.keys(images)) {
  if (!roster[key]) warnings.push(`HUERFANA ${key} no existe en el roster`);
}

const byFile = new Map();
for (const [id, url] of Object.entries(images)) {
  if (!/^https:\/\/\S+$/.test(url)) errors.push(`FORMATO ${id}: URL no https o con espacios`);
  if (!/\.(png|jpe?g|webp|gif)(\/|\?|$)/i.test(url)) warnings.push(`FORMATO ${id}: sin extensión de imagen`);
  const w = requestedWidth(url);
  if (w !== null && w < MIN_REQUESTED_WIDTH) warnings.push(`MINIATURA ${id}: pide ${w}px de ancho`);
  const parsed = parseWikiUrl(url);
  if (!parsed) { warnings.push(`EXTERNA ${id}: no es una URL de Fandom, no se verifica online`); continue; }
  const key = `${parsed.wiki}/${parsed.file}`;
  if (!byFile.has(key)) byFile.set(key, []);
  byFile.get(key).push(id);
}
const shared = [...byFile.entries()].filter(([, v]) => v.length > 1);
for (const [file, list] of shared) {
  warnings.push(`COMPARTIDA ${file.split('/').pop()} → ${list.join(', ')}`);
}

// ── 2. Comprobación online contra la API de cada wiki ───────────────────────
async function fetchImageInfo(host, files) {
  const out = new Map();
  for (let i = 0; i < files.length; i += 50) {
    const batch = files.slice(i, i + 50);
    const titles = batch.map(f => `File:${f}`).join('|');
    const url = `https://${host}.fandom.com/api.php?action=query&prop=imageinfo&iiprop=url|size&redirects=1&format=json&titles=${encodeURIComponent(titles)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'APEX-Engine image audit (Node.js)' } });
    if (!res.ok) throw new Error(`${host}: HTTP ${res.status}`);
    const json = await res.json();
    const alias = new Map();
    for (const n of json.query?.normalized || []) alias.set(n.to, n.from);
    for (const r of json.query?.redirects || []) alias.set(r.to, alias.get(r.from) || r.from);
    for (const page of Object.values(json.query?.pages || {})) {
      const asked = (alias.get(page.title) || page.title).replace(/^File:/, '');
      out.set(asked.replace(/ /g, '_'), page.imageinfo ? page.imageinfo[0] : null);
    }
  }
  return out;
}

async function auditOnline() {
  const byWiki = new Map();
  for (const [id, url] of Object.entries(images)) {
    const parsed = parseWikiUrl(url);
    if (!parsed) continue;
    const host = WIKI_API_HOST[parsed.wiki];
    if (!host || parsed.lang) { warnings.push(`SIN_API ${id}: wiki "${parsed.wiki}${parsed.lang ? '/' + parsed.lang : ''}" sin host de API conocido`); continue; }
    if (!byWiki.has(host)) byWiki.set(host, []);
    byWiki.get(host).push({ id, url, file: parsed.file });
  }

  let fixed = 0;
  for (const [host, entries] of byWiki) {
    const info = await fetchImageInfo(host, [...new Set(entries.map(e => e.file))]);
    for (const { id, url, file } of entries) {
      const ii = info.get(file.replace(/ /g, '_'));
      if (!ii) { errors.push(`MISSING ${id}: el archivo "${file}" no existe en ${host}.fandom.com`); continue; }
      const samePath = url.split('/revision/')[0] === ii.url.split('/revision/')[0];
      if (Math.min(ii.width, ii.height) < MIN_SIDE) warnings.push(`SMALL ${id}: original ${ii.width}x${ii.height}`);
      const ratio = ii.width / ii.height;
      if (ratio > 2.2 || ratio < 1 / 3.2) warnings.push(`ASPECT ${id}: ${ii.width}x${ii.height}`);
      const target = normalizedUrl(ii.url, ii.width);
      if (!samePath) {
        if (FIX) { images[id] = target; fixed++; }
        else errors.push(`PATH_MISMATCH ${id}: la ruta no coincide con la de la wiki (404). Usa --fix`);
      } else if (FIX && url !== target) {
        images[id] = target;
        fixed++;
      }
    }
  }
  if (FIX && fixed) {
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(images, null, 2));
    console.log(`✏️  ${fixed} URLs reescritas en characterImages.json`);
  }
}

(async () => {
  if (FIX && !ONLINE) { console.error('--fix requiere --online'); process.exit(2); }
  if (ONLINE) await auditOnline();

  const order = ['SIN_IMAGEN', 'MISSING', 'PATH_MISMATCH', 'FORMATO', 'SMALL', 'ASPECT', 'MINIATURA', 'COMPARTIDA', 'HUERFANA', 'EXTERNA', 'SIN_API'];
  const sortByKind = list => list.sort((a, b) => order.indexOf(a.split(' ')[0]) - order.indexOf(b.split(' ')[0]));
  console.log(`\nAPEX – Auditoría de imágenes (${ids.length} personajes, ${Object.keys(images).length} URLs${ONLINE ? ', verificación online' : ''})`);
  for (const e of sortByKind(errors)) console.log(`  ❌ ${e}`);
  for (const w of sortByKind(warnings)) console.log(`  ⚠️  ${w}`);
  console.log(`\nRESULTADO: ${errors.length ? `❌ ${errors.length} errores` : '✅ sin errores'}, ${warnings.length} avisos${ONLINE ? '' : ' (ejecuta con --online para comprobar enlaces)'}`);
  process.exit(errors.length ? 1 : 0);
})().catch(err => { console.error(err); process.exit(2); });
