// APEX Fase 7 — Generador de imágenes reales por personaje (API de Fandom wikis).
// Consulta prop=pageimages en la wiki correcta por franquicia y guarda el mapa
// en src/data/characterImages.json (id -> url). Los fallos se omiten (la app
// cae a dicebear). Uso: node src/scripts/generateCharacterImages.js
import fs from 'fs';

const ROSTER_PATH = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json';
const OUT_PATH = 'src/data/characterImages.json';
const CONCURRENCY = 6;
const REQ_TIMEOUT_MS = 9000;

// Mapeo universe -> dominio Fandom (orden de prioridad por substring)
const WIKI_RULES = [
  { domain: 'dragonball.fandom.com', match: /dragon ball|kakumei|multiverse|brokoly|new hope|db after|what-if|budokai|daima|gt/i },
  { domain: 'jujutsu-kaisen.fandom.com', match: /jujutsu/i },
  { domain: 'kimetsu-no-yaiba.fandom.com', match: /demon slayer|kimetsu/i },
  { domain: 'chainsawman.fandom.com', match: /chainsaw|motosierras/i },
  { domain: 'hunterxhunter.fandom.com', match: /hunter x hunter/i },
  { domain: 'jojo.fandom.com', match: /jojo|bizarre/i },
  { domain: 'onepunchman.fandom.com', match: /one punch|one-punch/i },
  { domain: 'myheroacademia.fandom.com', match: /my hero|boku no hero/i },
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
  { domain: 'attackontitan.fandom.com', match: /attack on titan|shingeki|marley/i },
  { domain: 'myheroacademia.fandom.com', match: /hero academia/i }
];

function wikiFor(universe) {
  const u = (universe || '');
  for (const rule of WIKI_RULES) {
    if (rule.match.test(u)) return rule.domain;
  }
  return null;
}

// Variantes de título para buscar (limpieza de sufijos de saga/versión)
const NAME_ALIASES = [
  [/freezer|frieza/gi, 'Frieza'],
  [/krilin|krillin|kuririn/gi, 'Krillin'],
  [/célula|celula|cell games/gi, 'Cell'],
  [/majin boo|majin buu/gi, 'Majin Buu'],
  [/androide n.?º|android/i, 'Android'],
  [/vegeta blue/gi, 'Vegeta'],
  [/goku/gi, 'Goku'],
  [/piccolo/gi, 'Piccolo'],
  [/trunks/gi, 'Trunks'],
  [/gohan/gi, 'Gohan'],
  [/goten/gi, 'Goten'],
  [/broly/gi, 'Broly'],
  [/jiren/gi, 'Jiren'],
  [/hit/gi, 'Hit'],
  [/beerus|bills/gi, 'Beerus'],
  [/whis/gi, 'Whis'],
  [/zeno|zen-oh/gi, 'Zen-Oh'],
  [/saitama/gi, 'Saitama'],
  [/tanjiro/gi, 'Tanjiro Kamado'],
  [/gojo/gi, 'Satoru Gojo'],
  [/sukuna/gi, 'Ryomen Sukuna'],
  [/itadori/gi, 'Yuji Itadori'],
  [/denji/gi, 'Denji'],
  [/makima/gi, 'Makima'],
  [/thanos/gi, 'Thanos'],
  [/superman/gi, 'Superman'],
  [/batman/gi, 'Batman'],
  [/wonder woman/gi, 'Wonder Woman'],
  [/flash/gi, 'Flash'],
  [/joker/gi, 'Joker'],
  [/deadpool/gi, 'Deadpool'],
  [/thor/gi, 'Thor'],
  [/iron man/gi, 'Iron Man'],
  [/hulk/gi, 'Hulk'],
  [/invincible|mark grayson/gi, 'Invincible']
];

function titleVariants(name = '') {
  const base = name.replace(/\s*\(.*\)\s*$/, '').trim();
  const variants = [base, name.replace(/\(([^)]+)\)/g, '').trim()];
  // Quitar "Son " / "Maestro " / títulos honoríficos que la wiki no usa
  const compact = base.replace(/^(Son|Mr\.?|Maestro|Gran|Señor|Reina|Príncipe)\s+/i, '').trim();
  if (compact && compact !== base) variants.push(compact);
  // Aplicar alias de nombres comunes (ES->EN / apodos)
  let aliased = base;
  for (const [re, repl] of NAME_ALIASES) {
    aliased = aliased.replace(re, repl);
  }
  if (aliased && aliased !== base) variants.push(aliased);
  // Tokens: nombre + apellido (primeras 2 palabras)
  const tokens = base.split(/\s+/).filter(Boolean);
  if (tokens.length >= 2) variants.push(tokens.slice(0, 2).join(' '));
  return [...new Set(variants)].filter(Boolean).slice(0, 6);
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

async function processCharacter(char) {
  const domain = wikiFor(char.universe);
  if (!domain) return { id: char.id, url: null };
  for (const variant of titleVariants(char.name)) {
    const url = await fetchImage(domain, variant);
    if (url) return { id: char.id, url };
  }
  return { id: char.id, url: null };
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(ROSTER_PATH, 'utf8'));
  const chars = Object.values(raw.characters || {});
  console.log(`🎯 Procesando ${chars.length} personajes...`);

  // Cargar resultados previos para no repetir (reanudable)
  let existing = {};
  try { existing = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8')); } catch {}

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
    const pct = Math.min(100, Math.round(((i + batch.length) / queue.length) * 100));
    console.log(`  [${pct}%] OK:${ok} FAIL:${fail} — ${results[idOf(batch[batch.length-1])]?.slice(0,50) || ''}`);
  }

  function idOf(c) { return c?.id; }

  fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 0), 'utf8');
  console.log(`\n✅ Completado en ${((Date.now() - started) / 1000).toFixed(1)}s — ${ok} imágenes obtenidas, ${fail} sin imagen.`);
  console.log(`📦 Guardado en ${OUT_PATH} (${Object.keys(results).length} entradas)`);
}

main().catch(err => { console.error('ERROR FATAL:', err); process.exit(1); });