// APEX Fase 7 v2 — Generador de imágenes REALES con VERIFICACIÓN DE PERTENENCIA.
// 1) Consulta la wiki Fandom correcta por franquicia.
// 2) Solo GUARDA la imagen si el nombre del archivo contiene el nombre del
//    personaje o un alias conocido (evita imágenes incorrectas).
// 3) Prueba variantes por saga/variante para que cada versión tenga su imagen.
// Uso: node src/scripts/generateCharacterImages.js [--reverify]
import fs from 'fs';

const ROSTER_PATH = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json';
const OUT_PATH = 'src/data/characterImages.json';
const CONCURRENCY = 6;
const REQ_TIMEOUT_MS = 9000;

const WIKI_RULES = [
  { domain: 'dragonball.fandom.com', match: /dragon ball|kakumei|multiverse|brokoly|new hope|db after|what-if|budokai|daima|gt/i },
  { domain: 'jujutsu-kaisen.fandom.com', match: /jujutsu/i },
  { domain: 'kimetsu-no-yaiba.fandom.com', match: /demon slayer|kimetsu/i },
  { domain: 'chainsawman.fandom.com', match: /chainsaw|motosierras/i },
  { domain: 'hunterxhunter.fandom.com', match: /hunter x hunter/i },
  { domain: 'jojo.fandom.com', match: /jojo|bizarre/i },
  { domain: 'onepunchman.fandom.com', match: /one punch|one-punch/i },
  { domain: 'myheroacademia.fandom.com', match: /my hero|boku no hero|hero academia/i },
  { domain: 'baki.fandom.com', match: /baki/i },
  { domain: 'shuumatsu-no-valkyrie.fandom.com', match: /shuumatsu|valkyrie|ragnarok/i },
  { domain: 'marvel.fandom.com', match: /marvel/i },
  { domain: 'dc.fandom.com', match: /dc comics|dc universe/i },
  { domain: 'invincible.fandom.com', match: /invincible/i },
  { domain: 'the-boys.fandom.com', match: /the boys/i },
  { domain: 'spy-x-family.fandom.com', match: /spy x family/i },
  { domain: 'bleach.fandom.com', match: /bleach/i },
  { domain: 'naruto.fandom.com', match: /naruto|boruto|konoha|shinobi/i },
  { domain: 'onepiece.fandom.com', match: /one piece|pirata|marineford/i },
  { domain: 'berserk.fandom.com', match: /berserk/i },
  { domain: 'attackontitan.fandom.com', match: /attack on titan|shingeki|marley/i }
];

function wikiFor(universe) {
  const u = (universe || '');
  for (const rule of WIKI_RULES) {
    if (rule.match.test(u)) return rule.domain;
  }
  return null;
}

// Aliases de nombres comunes (ES->EN / apodos) para BÚSQUEDA y VERIFICACIÓN
const NAME_ALIASES = [
  [/freezer/gi, 'Frieza'], [/krilin|kuririn/gi, 'Krillin'], [/célula|celula/gi, 'Cell'],
  [/majin boo/gi, 'Majin Buu'], [/androide n.?º/i, 'Android'], [/goku/gi, 'Goku'],
  [/piccolo/gi, 'Piccolo'], [/trunks/gi, 'Trunks'], [/gohan/gi, 'Gohan'],
  [/goten/gi, 'Goten'], [/broly/gi, 'Broly'], [/jiren/gi, 'Jiren'], [/beerus|bills/gi, 'Beerus'],
  [/zeno|zen-oh/gi, 'Zen-Oh'], [/saitama/gi, 'Saitama'], [/tanjiro/gi, 'Tanjiro'],
  [/gojo/gi, 'Gojo'], [/sukuna/gi, 'Sukuna'], [/itadori/gi, 'Itadori'], [/denji/gi, 'Denji'],
  [/makima/gi, 'Makima'], [/thanos/gi, 'Thanos'], [/superman/gi, 'Superman'],
  [/batman/gi, 'Batman'], [/wonder woman/gi, 'Wonder Woman'], [/flash/gi, 'Flash'],
  [/joker/gi, 'Joker'], [/deadpool/gi, 'Deadpool'], [/thor/gi, 'Thor'], [/iron man/gi, 'Iron Man'],
  [/hulk/gi, 'Hulk'], [/invincible|mark grayson/gi, 'Invincible'],
  [/tenshinhan/gi, 'Tien'], [/jackie chun/gi, 'Roshi'], [/enma daioh/gi, 'King Yemma'],
  [/tao pai pai/gi, 'Mercenary Tao'], [/muten roshi/gi, 'Roshi'], [/tenkaichi/gi, 'Tenkaichi'],
  [/kame senin|kame sen nin/gi, 'Roshi'], [/hercule|mr satan/gi, 'Mr. Satan'], [/mister satan/gi, 'Mr. Satan'],
  [/oozaru|grande mono/gi, 'Great Ape'], [/nappa/gi, 'Nappa'], [/raditz/gi, 'Raditz']
];

// Tokens de verificación: nombre + alias (>=3 chars para nombres cortos tipo Nam/Cui)
function verifyTokens(name) {
  const toks = new Set();
  const add = (s) => {
    const words = s.toLowerCase().replace(/\(.*\)/g, ' ').split(/[^a-z0-9ñáéíóúü]+/).filter(w => w.length >= 3);
    words.forEach(w => toks.add(w));
  };
  add(name);
  let aliased = name;
  for (const [re, repl] of NAME_ALIASES) aliased = aliased.replace(re, repl);
  add(aliased);
  return [...toks];
}

// Extrae el nombre del archivo de la URL de Fandom
function fileSlugOf(url) {
  const m = (url || '').match(/images\/\w\/\w{2}\/([^\/?]+)/);
  return m ? decodeURIComponent(m[1].replace(/_/g, ' ').toLowerCase()) : '';
}

// Variantes de título, incluida la variante por saga (parentética)
function titleVariants(name = '') {
  const variants = [];
  const clean = (s) => s.replace(/\s+/g, ' ').trim();
  const base = clean(name.replace(/\s*\(.*\)\s*$/, ''));
  variants.push(base, clean(name.replace(/\(([^)]+)\)/g, '')));

  // Quitar honoríficos
  const compact = base.replace(/^(Son|Mr\.?|Maestro|Gran|Señor|Reina|Príncipe|Rey)\s+/i, '').trim();
  if (compact && compact !== base) variants.push(compact);

  // Contenido de la parentética como variante (nombre de la forma/saga)
  const paren = (name.match(/\(([^)]+)\)/) || [])[1];
  if (paren) {
    const pClean = clean(paren.replace(/saga|variante|era|estado|forma|power|máximo|maximo|oficial|teórico|teorico|inicial|final/gi, ''));
    if (pClean.length >= 3) variants.push(`${base} ${pClean}`, pClean);
  }

  // Aliases (Freezer->Frieza, etc.)
  let aliased = base;
  for (const [re, repl] of NAME_ALIASES) aliased = aliased.replace(re, repl);
  if (aliased && aliased !== base) variants.push(aliased);
  if (compact && compact !== aliased) {
    let aliasedCompact = compact;
    for (const [re, repl] of NAME_ALIASES) aliasedCompact = aliasedCompact.replace(re, repl);
    if (aliasedCompact && aliasedCompact !== compact) variants.push(aliasedCompact);
  }

  // Tokens: primeras 2 palabras
  const tokens = base.split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) variants.push(tokens.slice(0, 2).join(' '));

  return [...new Set(variants)].filter(Boolean).slice(0, 8);
}

async function fetchImage(domain, title) {
  const url = `https://${domain}/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=320&redirects=1&formatversion=2`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQ_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages || [];
    const page = pages.find(p => p?.thumbnail?.source);
    return page ? page.thumbnail.source : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Fallback: búsqueda de páginas por nombre (encuentra títulos aproximados)
async function searchImage(domain, title) {
  const url = `https://${domain}/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&srlimit=1&format=json&formatversion=2`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQ_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    const hit = data?.query?.search?.[0]?.title;
    if (!hit) return null;
    return await fetchImage(domain, hit);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function processCharacter(char) {
  const domain = wikiFor(char.universe);
  if (!domain) return { id: char.id, url: null };
  const tokens = verifyTokens(char.name);
  const tryVariants = [...titleVariants(char.name)];
  // Búsqueda aproximada como variante adicional (último recurso)
  tryVariants.push(`__search__:${char.name.replace(/\s*\(.*\)\s*$/, '').trim()}`);

  for (const variant of tryVariants) {
    const isSearch = variant.startsWith('__search__:');
    const term = isSearch ? variant.slice(11) : variant;
    const url = isSearch ? await searchImage(domain, term) : await fetchImage(domain, variant);
    if (!url) continue;
    // VERIFICACIÓN DE PERTENENCIA: el archivo debe contener un token del nombre/alias
    const slug = fileSlugOf(url);
    if (slug && tokens.some(t => slug.includes(t))) {
      return { id: char.id, url };
    }
    if (!slug && /^https?:\/\//i.test(url)) {
      return { id: char.id, url };
    }
  }
  return { id: char.id, url: null };
}

async function main() {
  const reverify = process.argv.includes('--reverify');
  const raw = JSON.parse(fs.readFileSync(ROSTER_PATH, 'utf8'));
  const chars = Object.values(raw.characters || {});
  console.log(`🎯 Procesando ${chars.length} personajes${reverify ? ' (REVERIFICACIÓN TOTAL)' : ''}...`);

  let existing = {};
  try { existing = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8')); } catch {}

  // Con --reverify se descarta el mapa previo y se reconstruye con verificación
  if (reverify) existing = {};

  const queue = chars.filter(c => !existing[c.id]);
  const results = { ...existing };
  let ok = 0, fail = 0;
  const started = Date.now();

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const batch = queue.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(c => processCharacter(c)));
    for (const r of batchResults) {
      if (r.url) { results[r.id] = r.url; ok++; }
      else fail++;
    }
    if ((i + batch.length) % 30 === 0 || i + batch.length >= queue.length) {
      console.log(`  [${Math.min(100, Math.round(((i + batch.length) / queue.length) * 100))}%] OK:${ok} FAIL:${fail}`);
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 0), 'utf8');
  console.log(`\n✅ Completado en ${((Date.now() - started) / 1000).toFixed(1)}s — ${Object.keys(results).length} imágenes VERIFICADAS, ${fail} sin imagen.`);
}

main().catch(err => { console.error('ERROR FATAL:', err); process.exit(1); });