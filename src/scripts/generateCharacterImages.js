// APEX Fase 7 v3 — Generador de imágenes con VARIANTES ESPECÍFICAS.
// Cada versión del personaje (era/forma) busca SU PROPIA imagen:
//  1) allimages por prefijo de forma (Goku_SSG, Goku_GT, Kid_Goku...)
//  2) página directa de la forma
//  3) fallback: imagen canónica base verificada
// VERIFICACIÓN: el archivo debe contener el token base + token de la variante.
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

const NAME_ALIASES = [
  [/freezer/gi, 'Frieza'], [/krilin|kuririn/gi, 'Krillin'], [/célula|celula/gi, 'Cell'],
  [/majin boo/gi, 'Majin Buu'], [/androide n.?º/i, 'Android'], [/goku/gi, 'Goku'],
  [/piccolo/gi, 'Piccolo'], [/trunks/gi, 'Trunks'], [/gohan/gi, 'Gohan'], [/goten/gi, 'Goten'],
  [/broly/gi, 'Broly'], [/jiren/gi, 'Jiren'], [/beerus|bills/gi, 'Beerus'], [/zeno|zen-oh/gi, 'Zen-Oh'],
  [/saitama/gi, 'Saitama'], [/tanjiro/gi, 'Tanjiro'], [/gojo/gi, 'Gojo'], [/sukuna/gi, 'Sukuna'],
  [/itadori/gi, 'Itadori'], [/denji/gi, 'Denji'], [/makima/gi, 'Makima'], [/thanos/gi, 'Thanos'],
  [/superman/gi, 'Superman'], [/batman/gi, 'Batman'], [/wonder woman/gi, 'Wonder Woman'],
  [/flash/gi, 'Flash'], [/joker/gi, 'Joker'], [/deadpool/gi, 'Deadpool'], [/thor/gi, 'Thor'],
  [/iron man/gi, 'Iron Man'], [/hulk/gi, 'Hulk'], [/invincible|mark grayson/gi, 'Invincible'],
  [/tenshinhan/gi, 'Tien'], [/jackie chun/gi, 'Roshi'], [/enma daioh/gi, 'King Yemma'],
  [/tao pai pai/gi, 'Mercenary Tao'], [/muten roshi/gi, 'Roshi'], [/tenkaichi/gi, 'Tenkaichi'],
  [/kame senin|kame sen nin/gi, 'Roshi'], [/hercule|mr satan/gi, 'Mr. Satan'], [/mister satan/gi, 'Mr. Satan'],
  [/nappa/gi, 'Nappa'], [/raditz/gi, 'Raditz']
];

// ─────────────────────────────────────────────────────────────────────────────
// VARIANTES: mapea términos de saga/forma a prefijos de archivo de la wiki DB
// ─────────────────────────────────────────────────────────────────────────────
const VARIANT_PREFIXES = [
  [/ultra instinto|ultra instinct|ui dominado|mui/gi, ['Ultra Instinct', 'MUI', 'UI']],
  [/saiyan god|super saiyan god|ssg|dios saiyajin/gi, ['SSG', 'God']],
  [/saiyan blue|ssj blue|ssb|super saiyan blue/gi, ['Blue', 'SSGSS']],
  [/super saiyan 4|ssj4|saiyan 4/gi, ['Super Saiyan 4', 'SS4', '4']],
  [/super saiyan 3|ssj3|saiyan 3/gi, ['Super Saiyan 3', 'SS3']],
  [/super saiyan 2|ssj2|saiyan 2/gi, ['Super Saiyan 2', 'SS2']],
  [/super saiyan 1|super saiyan|ssj1|saiyajin|ssj/gi, ['Super Saiyan', 'SSJ', 'SS']],
  [/kaio ken|kaio-ken|kaioken/gi, ['Kaioken', 'Kaio-Ken']],
  [/ozaru|oozaru|grande mono|mono gigante/gi, ['Great Ape', 'Oozaru', 'Ape']],
  [/beast|bestia/gi, ['Beast']],
  [/gohan blanco|limit break/gi, ['Limit Break']],
  [/majin/gi, ['Majin']],
  [/fusion|fused|vegetto|gogeta|gotenks/gi, ['Fusion', 'Vegetto', 'Gogeta']]
];

// Eras DB -> prefijos de era (para diferenciar Goku clásico/GT/Super/Daima)
const ERA_PREFIXES = [
  [/saga gt|adulto.*gt|gt/gi, ['GT']],
  [/daima/gi, ['Daima']],
  [/clásico|clasico|original|21tb|23 tenkaichi|tenkaichi|u18|niño|ni-o/gi, ['Kid']],
  [/saga super|super|dbs|torneo del poder/gi, ['Super', 'DBS']]
];

function fileSlugOf(url) {
  const m = (url || '').match(/images\/\w\/\w{2}\/([^\/?]+)/);
  return m ? decodeURIComponent(m[1].replace(/_/g, ' ').toLowerCase()) : '';
}

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

// Prefijos de variante específicos para este personaje (por su parentética)
function variantPrefixes(name) {
  const prefixes = [];
  const paren = (name.match(/\(([^)]+)\)/) || [])[1] || '';
  const lower = ` ${paren} ${name} `.toLowerCase();
  for (const [re, list] of VARIANT_PREFIXES) {
    if (re.test(lower)) prefixes.push(...list);
  }
  for (const [re, list] of ERA_PREFIXES) {
    if (re.test(lower)) prefixes.push(...list);
  }
  return [...new Set(prefixes)];
}

// Fetch con retry/backoff para evitar rate-limits de Fandom (429)
async function fetchWithRetry(url, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQ_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (res.status === 429) {
        // Fandom limita por ventana (~1 min). Espera larga y reintenta.
        await new Promise(r => setTimeout(r, 25000 * (i + 1)));
        continue;
      }
      return res;
    } catch {
      await new Promise(r => setTimeout(r, 1500 * (i + 1)));
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

// 1) Busca archivos por prefijo (allimages) — devuelve URLs de imágenes.
//    Fandom es intermitente con espacios en aiprefix: prueba espacio y guión bajo.
async function allImages(domain, prefix, limit = 10) {
  const variants = [prefix, prefix.replace(/ /g, '_')];
  const out = [];
  for (const p of variants) {
    const url = `https://${domain}/api.php?action=query&list=allimages&aiprefix=${encodeURIComponent(p)}&ailimit=${limit}&aiprop=url&format=json&formatversion=2`;
    try {
      const res = await fetchWithRetry(url);
      if (!res || !res.ok) continue;
      const data = await res.json();
      const found = (data?.query?.allimages || []).map(i => i.url).filter(u => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(u));
      out.push(...found);
    } catch { /* siguiente variante */ }
    if (out.length >= limit) break;
  }
  return [...new Set(out)];
}

async function pageImage(domain, title) {
  const url = `https://${domain}/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=320&redirects=1&formatversion=2`;
  try {
    const res = await fetchWithRetry(url);
    if (!res || !res.ok) return null;
    const data = await res.json();
    const page = (data?.query?.pages || []).find(p => p?.thumbnail?.source);
    return page ? page.thumbnail.source : null;
  } catch { return null; }
}

// Elige la mejor URL de una lista por orden de preferencia de tokens
function pickBest(urls, requiredTokens) {
  let best = null;
  let bestScore = -1;
  for (const url of urls) {
    const slug = fileSlugOf(url);
    if (!slug) continue;
    let score = 0;
    for (const t of requiredTokens) {
      if (slug.includes(t)) score += t.length >= 5 ? 2 : 1;
    }
    // Preferir no thumbnails raros (evitar "Blast", "Dreaming", "runs_out" etc.)
    if (/\b(blast|dreaming|runs out|episode|screencap|anime 2|reverts|jumping|flying|smiling)\b/i.test(slug)) score -= 4;
    if (score > bestScore) { bestScore = score; best = url; }
  }
  return bestScore > 0 ? best : null;
}

// Clave base limpia para prefijos de archivo (quita honoríficos y aplica alias)
// "Son Goku" -> "Goku", "Maestro Roshi" -> "Roshi", "Mr. Satan" -> "Mr. Satan"
function baseKey(name) {
  let b = name.replace(/\s*\(.*\)\s*$/, '').trim();
  b = b.replace(/^(Son|Mr\.?|Maestro|Gran|Señor|Reina|Príncipe|Rey|Saga|Estado|Forma|Poder|Adulto)\s+/gi, '').trim();
  for (const [re, repl] of NAME_ALIASES) b = b.replace(re, repl);
  return b;
}

// Tokens núcleo para prefijos: el primer token significativo ("Goku"), el segundo
// (para nombres tipo "The Joker" -> "Joker") y la clave completa como último recurso.
function coreCores(name) {
  const key = baseKey(name);
  const tokens = key.split(/\s+/).filter(Boolean);
  const STOPWORDS = /^(the|a|an|de|del|la|el|los|las|un|una|gran|san|santa|dr|doc|sir|lord|lady|king|queen)$/i;
  const candidates = [];
  for (const t of tokens) {
    if (t.length >= 3 && !STOPWORDS.test(t)) candidates.push(t);
  }
  candidates.push(key);
  return [...new Set(candidates)].filter(c => c.length >= 3);
}

async function processCharacter(char) {
  const domain = wikiFor(char.universe);
  if (!domain) return { id: char.id, url: null };
  const key = baseKey(char.name);
  const cores = coreCores(char.name);
  const baseTokens = verifyTokens(key);
  const prefixes = variantPrefixes(char.name);
  const isVariant = prefixes.length > 0;

  // VARIANTE: buscar por prefijos de forma/era (Goku SSG, Kid Goku, Goku GT...)
  if (isVariant) {
    const searchPrefixes = [];
    for (const core of cores) {
      for (const p of prefixes) {
        searchPrefixes.push(`${core} ${p}`);
        searchPrefixes.push(`${p} ${core}`);
      }
    }
    for (const p of prefixes) searchPrefixes.push(p);
    for (const sp of [...new Set(searchPrefixes)]) {
      const urls = await allImages(domain, sp, 8);
      if (urls.length === 0) continue;
      const best = pickBest(urls, baseTokens);
      if (!best) continue;
      const slug = fileSlugOf(best);
      // Verificación: debe contener un token base Y un token de variante
      const hasBase = baseTokens.some(t => slug.includes(t));
      const hasVariant = prefixes.some(p => p.toLowerCase().split(/\s+/).every(w => w.length >= 3 && slug.includes(w)));
      if (hasBase && hasVariant) return { id: char.id, url: best };
    }
  }

  // FALLBACK 1: página directa de la clave base (imagen canónica verificada)
  const pageUrl = await pageImage(domain, key);
  if (pageUrl) {
    const slug = fileSlugOf(pageUrl);
    if (slug && baseTokens.some(t => slug.includes(t))) return { id: char.id, url: pageUrl };
    if (!slug && /^https?:\/\//i.test(pageUrl)) return { id: char.id, url: pageUrl };
  }

  // FALLBACK 2: allimages por prefijo del primer token (recupera Nam, Cui, etc.)
  const prefix = cores[0];
  if (prefix && prefix.length >= 3) {
    const urls = await allImages(domain, prefix, 15);
    const best = pickBest(urls, baseTokens);
    if (best) return { id: char.id, url: best };
  }

  return { id: char.id, url: null };
}

async function main() {
  const reverify = process.argv.includes('--reverify');
  const variantsOnly = process.argv.includes('--variants-only');
  const raw = JSON.parse(fs.readFileSync(ROSTER_PATH, 'utf8'));
  const chars = Object.values(raw.characters || {});
  console.log(`🎯 Procesando ${chars.length} personajes${reverify ? ' (REVERIFICACIÓN TOTAL v3)' : ''}${variantsOnly ? ' (SOLO VARIANTES)' : ''}...`);

  let existing = {};
  try { existing = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8')); } catch {}
  if (reverify) existing = {};

  let queue;
  if (variantsOnly) {
    // Solo personajes con variantes (parentética con términos de forma/era)
    queue = chars.filter(c => variantPrefixes(c.name).length > 0);
    console.log(`   → Re-buscando imágenes específicas para ${queue.length} variantes...`);
  } else {
    queue = chars.filter(c => !existing[c.id]);
  }

  const results = { ...existing };
  let ok = 0, fail = 0, replaced = 0;
  const started = Date.now();

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const batch = queue.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(c => processCharacter(c)));
    for (const r of batchResults) {
      if (r.url) {
        if (existing[r.id]) replaced++;
        results[r.id] = r.url; ok++;
      } else fail++;
    }
    if ((i + batch.length) % 20 === 0 || i + batch.length >= queue.length) {
      console.log(`  [${Math.min(100, Math.round(((i + batch.length) / queue.length) * 100))}%] OK:${ok} FAIL:${fail} (reemplazadas:${replaced})`);
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 0), 'utf8');
  console.log(`\n✅ Completado en ${((Date.now() - started) / 1000).toFixed(1)}s — ${Object.keys(results).length} imágenes totales, ${fail} sin imagen, ${replaced} variantes reemplazadas.`);
}

main().catch(err => { console.error('ERROR FATAL:', err); process.exit(1); });