#!/usr/bin/env node
/**
 * APEX Lore CLI :: consulta rapida del corpus Chozenshu (terminal de OpenCode)
 * ============================================================================
 * Uso:
 *   node src/scripts/chozenshu/apex-lore.mjs tech kamehameha
 *   node src/scripts/chozenshu/apex-lore.mjs bp "freezer"
 *   node src/scripts/chozenshu/apex-lore.mjs char "ginew"
 *   node src/scripts/chozenshu/apex-lore.mjs age 762
 *   node src/scripts/chozenshu/apex-lore.mjs passives son-goku-saga-namek-saga-namek-176
 *   node src/scripts/chozenshu/apex-lore.mjs search "zenkai"
 *   node src/scripts/chozenshu/apex-lore.mjs stats
 *   node src/scripts/chozenshu/apex-lore.mjs timeline --from 760 --to 790
 * Opciones: --json (salida cruda)  --limit N
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const REF = path.join(ROOT, 'src', 'data', 'referencias');
const DATA = path.join(ROOT, 'src', 'data');

const F = {
  moves: path.join(REF, 'dragonball_canonical_moves.json'),
  bp: path.join(REF, 'dragonball_battle_powers_canon.json'),
  bpMined: path.join(REF, 'dragonball_battle_powers.json'),
  timeline: path.join(REF, 'dragonball_timeline_events.json'),
  dossier: path.join(REF, 'dragonball_character_dossier.json'),
  lexicon: path.join(REF, 'dragonball_technique_lexicon.seed.json'),
  roster: path.join(DATA, 'ROSTER_NIVELES_PODER_CORREGIDO_V22.json')
};

const load = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };
const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const has = (hay, needle) => norm(hay).includes(norm(needle));

const C = { r: '\x1b[0m', b: '\x1b[1m', dim: '\x1b[2m', cy: '\x1b[36m', gr: '\x1b[32m', ye: '\x1b[33m', mg: '\x1b[35m' };
const h = (t) => console.log(`\n${C.b}${C.cy}== ${t} ==${C.r}`);
const kv = (k, v) => console.log(`  ${C.dim}${k.padEnd(22)}${C.r}${v}`);

function argOpts(argv) {
  const o = { json: false, limit: 20, from: null, to: null, positional: [] };
  const valued = new Set(['--limit', '--from', '--to']);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') { o.json = true; continue; }
    if (valued.has(a)) {
      const v = parseInt(argv[i + 1], 10);
      o[a.slice(2)] = Number.isFinite(v) ? v : null;
      i++;
      continue;
    }
    if (a.startsWith('--')) continue;
    o.positional.push(a);
  }
  return o;
}

const out = (o, data) => { if (o.json) { console.log(JSON.stringify(data, null, 2)); return true; } return false; };

// ------------------------------- comandos ---------------------------------
function cmdTech(q, o) {
  const moves = load(F.moves);
  if (!moves) return console.error('Falta dragonball_canonical_moves.json (ejecuta chozenshu_extract.py)');
  const hits = moves.techniques.filter((t) =>
    has(t.id, q) || has(t.nameEs, q) || has(t.romaji, q) || (t.aliases || []).some((a) => has(a, q)));
  if (out(o, hits)) return;
  h(`TECNICAS :: "${q}"  (${hits.length})`);
  for (const t of hits.slice(0, o.limit)) {
    console.log(`\n ${C.b}${t.nameEs}${C.r} ${C.dim}(${t.romaji || t.id})${C.r}`);
    kv('tipo', t.type);
    kv('atestiguada en tomos', t.attestedInChozenshu ? `${C.gr}SI${C.r} — ${t.totalHits} menciones` : `${C.ye}no localizada${C.r}`);
    if (t.attestedInChozenshu) {
      kv('procedencia', Object.entries(t.occurrences).map(([k, v]) => `${k}: p.${v.pages.slice(0, 6).join(',')}${v.pages.length > 6 ? '…' : ''}`).join('  '));
    }
    kv('usuarios canonicos', (t.users || []).slice(0, 8).join(', ') || '-');
    if (t.description) console.log(`  ${C.dim}${t.description}${C.r}`);
  }
}

function cmdBP(q, o) {
  const canon = load(F.bp), mined = load(F.bpMined);
  const rows = [...(canon?.chart_verified || []), ...(canon?.prose_mined || [])]
    .filter((r) => !q || has(r.name, q) || has(r.characterId, q) || has(r.arc, q));
  if (out(o, rows)) return;
  h(`FUERZAS DE COMBATE :: "${q || '*'}"  (${rows.length})`);
  for (const r of rows.slice(0, o.limit)) {
    const val = r.value.toLocaleString('es-ES');
    console.log(`  ${C.gr}${String(val).padStart(15)}${C.r}  ${C.b}${r.name}${C.r} ${C.dim}(${r.arc || '-'})${C.r}`);
    if (r.notes) console.log(`  ${C.dim}${' '.repeat(17)}${r.notes}${C.r}`);
    const src = r.printedPage ? `Chozenshu 4, pag. impresa ${r.printedPage}` : (r.source ? `${r.source.tomo} idx ${r.source.pdfIndex}` : '');
    if (src) console.log(`  ${C.dim}${' '.repeat(17)}fuente: ${src}${C.r}`);
  }
  if (mined?.battlePowers?.length) {
    const f = mined.battlePowers.filter((r) => !q || has(r.raw, q) || has(r.context, q));
    if (f.length && !q) {
      h(`PROSA MINADA (regex OCR) :: ${f.length}`);
      for (const r of f.slice(0, 12)) console.log(`  ${String(r.value).padStart(12)}  ${C.dim}${r.tomo} idx ${r.page} — ${r.raw}${C.r}`);
    }
  }
}

function cmdChar(q, o) {
  const d = load(F.dossier);
  if (!d) return console.error('Falta dragonball_character_dossier.json');
  const hits = d.blocks.filter((b) => has(b.text, q));
  if (out(o, hits)) return;
  h(`DOSSIER DE PERSONAJES :: "${q}"  (${hits.length} bloques)`);
  const byMarker = {};
  for (const b of hits) (byMarker[b.marker] ||= []).push(b);
  for (const m of ['C', 'H', 'T', 'L', 'B', 'A', 'N']) {
    if (!byMarker[m]) continue;
    console.log(`\n ${C.mg}[${m}]${C.r} ${byMarker[m].length} bloques`);
    for (const b of byMarker[m].slice(0, Math.max(1, Math.floor(o.limit / 3)))) {
      console.log(`  ${C.dim}${b.tomo} idx ${b.page}${C.r} ${b.text.slice(0, 400)}`);
    }
  }
}

function cmdAge(n, o) {
  const t = load(F.timeline);
  if (!t) return console.error('Falta dragonball_timeline_events.json');
  let rows = t.events;
  if (n) rows = rows.filter((e) => e.age === parseInt(n, 10));
  if (o.from) rows = rows.filter((e) => e.age >= o.from);
  if (o.to) rows = rows.filter((e) => e.age <= o.to);
  if (out(o, rows)) return;
  h(`CRONOLOGIA :: ${n || `${o.from || '-'}..${o.to || '-'}`}  (${rows.length})`);
  for (const e of rows.slice(0, o.limit)) console.log(`  ${C.ye}Age ${e.age}${C.r} ${C.dim}[${e.tomo} idx ${e.page}]${C.r} ${e.context.slice(0, 220)}`);
}

async function cmdPassives(id, o) {
  const mod = await import(pathToFileUrl(path.join(ROOT, 'src', 'lib', 'biologicalPassives.js')));
  const roster = load(F.roster) || [];
  const c = roster.find((x) => x.id === id);
  const ids = mod.resolvePassiveIds(c || { id });
  if (out(o, { id, found: !!c, passives: ids, prompt: mod.summarizePassivesForPrompt(c || { id }) })) return;
  h(`PASIVAS BIOLOGICAS :: ${id}`);
  kv('en roster V22', c ? `${C.gr}si${C.r} — ${c.name} (${c.baseTier})` : `${C.ye}no${C.r}`);
  for (const pid of ids) {
    const r = mod.getPassive(pid);
    console.log(`\n ${C.b}${r.name}${C.r} ${C.dim}[${r.category}]${C.r}\n   ${r.effect}\n   ${C.dim}fuente: ${r.source}${C.r}\n   ${C.ye}contrajuego:${C.r} ${r.counterplay.join(' / ')}`);
  }
}

function pathToFileUrl(p) { return 'file:///' + p.replace(/\\/g, '/'); }

function cmdSearch(q, o) {
  const files = Object.entries(F).filter(([k]) => !['roster', 'lexicon'].includes(k));
  h(`BUSQUEDA GLOBAL :: "${q}"`);
  for (const [k, p] of files) {
    if (!fs.existsSync(p)) continue;
    const txt = fs.readFileSync(p, 'utf8');
    const n = (norm(txt).match(new RegExp(norm(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    console.log(`  ${n > 0 ? C.gr : C.dim}${String(n).padStart(6)}  ${k}${C.r}`);
  }
}

function cmdStats() {
  h('ESTADO DE LOS DATASETS CHOZENSHU');
  for (const [k, p] of Object.entries(F)) {
    if (!fs.existsSync(p)) { console.log(`  ${C.ye}${k.padEnd(10)} AUSENTE${C.r}  ${p}`); continue; }
    const kb = (fs.statSync(p).size / 1024).toFixed(1);
    const j = load(p);
    let n = '-';
    if (j?.techniques) n = `${j.techniques.length} tecnicas (${j.techniques.filter((t) => t.attestedInChozenshu).length} atestiguadas)`;
    else if (j?.chart_verified) n = `${j.chart_verified.length} verificadas + ${j.prose_mined?.length || 0} minadas`;
    else if (j?.events) n = `${j.events.length} eventos`;
    else if (j?.blocks) n = `${j.blocks.length} bloques`;
    else if (j?.battlePowers) n = `${j.battlePowers.length} filas`;
    console.log(`  ${C.cy}${k.padEnd(10)}${C.r} ${String(kb).padStart(8)} KB  ${n}`);
  }
}

const HELP = `APEX Lore CLI - corpus Dragon Ball Chozenshu 1-4
  tech <q>        busca tecnicas (lexicon + atestiguacion en tomos)
  bp [q]          fuerzas de combate canonicas verificadas
  char <q>        bloques del diccionario de personajes
  age <n>         eventos de la cronologia por Age
  timeline        todos los eventos (--from/--to)
  passives <id>   pasivas biologicas de un personaje del roster
  search <q>      conteo de coincidencias por dataset
  stats           estado de los datasets
  Opciones: --json --limit N`;

const [cmd = 'help', ...rest] = process.argv.slice(2);
const o = argOpts(rest);
const q = o.positional.join(' ');
try {
  if (cmd === 'tech') cmdTech(q, o);
  else if (cmd === 'bp') cmdBP(q, o);
  else if (cmd === 'char') cmdChar(q, o);
  else if (cmd === 'age') cmdAge(q, o);
  else if (cmd === 'timeline') cmdAge('', o);
  else if (cmd === 'passives') await cmdPassives(q, o);
  else if (cmd === 'search') cmdSearch(q, o);
  else if (cmd === 'stats') cmdStats();
  else console.log(HELP);
} catch (e) { console.error('ERROR:', e.message); process.exit(1); }
