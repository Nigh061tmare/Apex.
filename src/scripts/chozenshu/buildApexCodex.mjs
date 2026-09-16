#!/usr/bin/env node
/**
 * APEX Codex Builder :: empaqueta los datasets Chozenshu para el navegador.
 * ---------------------------------------------------------------------------
 * Entrada : src/data/referencias/*.json  +  src/lib/biologicalPassives.js
 * Salida  : public/data/apex-codex.json        (~250 KB, se carga al abrir el Codice)
 *           public/data/apex-codex-deep.json   (~1 MB, solo busqueda profunda, lazy)
 *
 * Uso: node src/scripts/chozenshu/buildApexCodex.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');

// Import estatico del motor de pasivas (fuente unica de verdad de las reglas).
const passMod = await import(pathToFileURL(path.join(ROOT, 'src', 'lib', 'biologicalPassives.js')).href);
const REF = path.join(ROOT, 'src', 'data', 'referencias');
const OUT = path.join(ROOT, 'public', 'data');

const read = (f) => JSON.parse(fs.readFileSync(path.join(REF, f), 'utf8'));
const kb = (o) => (Buffer.byteLength(JSON.stringify(o)) / 1024).toFixed(1);

function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const moves = read('dragonball_canonical_moves.json');
  const bpCanon = read('dragonball_battle_powers_canon.json');
  const timeline = read('dragonball_timeline_events.json');
  const dossier = read('dragonball_character_dossier.json');
  const dictSrc = read('dragonball_technique_dictionary.json');
  const loreSrc = read('dragonball_world_lore.json');
  // Baseline activo = V26 (dict indexado por id). Se excluyen los registros deprecados.
  const rosterRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'ROSTER_NIVELES_PODER_CORREGIDO_V26.json'), 'utf8'));
  const deprecated = new Set(rosterRaw.deprecatedRecords || []);
  const roster = Object.values(rosterRaw.characters || {}).filter((c) => c && c.id && !deprecated.has(c.id));
  const rosterIds = new Set(roster.map((c) => c.id));
  // V26 no expone `franchise`: se deriva del universo/saga/nombre con la misma
  // regla que usa la app (franchiseHelper). Se excluyen fan-mangas y What-Ifs.
  const FAN = /fan manga|what.?if|multiverse|kakumei|new hope|brokoly|\baf\b|dbm|after/;
  const DB = /dragon ball|dbz|dbgt|\bdbs\b|daima|namek|saiyan|saiyajin|saiyano|freezer|cell|buu|majin|planet vegeta/;
  const dbChars = roster.filter((c) => {
    const blob = `${c.universe || ''} ${c.saga || ''} ${c.name || ''}`.toLowerCase();
    if (FAN.test(blob)) return false;
    return DB.test(blob);
  });
  const byId = new Map(roster.map((c) => [c.id, c]));

  // --- Diccionario de Tecnicas (Chozenshu 4, pp.135-176): campos (N)/(T)/(P)/(C) ---
  const techniqueDictionary = (dictSrc.entries || [])
    .filter((x) => x && (x.type || x.performer || x.description))
    .map((x) => ({
      n: x.chapter || null,
      o: x.origin || null,
      t: (x.type || '').slice(0, 170),
      p: (x.performer || '').slice(0, 170),
      d: (x.description || '').slice(0, 280),
      g: x.page || null
    }))
    .sort((a, b) => (a.n || 9999) - (b.n || 9999));

  // --- Mundo, razas, tecnologia y GT (Chozenshu 1 y 3) ---
  const worldLore = {
    races: (loreSrc.races || []).map((r) => ({
      id: r.id, name: r.name, t: r.tomo, p: r.page,
      traits: (r.traits || []).slice(0, 8),
      hooks: r.engineHooks || []
    })),
    technology: (loreSrc.technology || []).map((x) => ({
      id: x.id, name: x.name, t: x.tomo, p: x.page,
      desc: (x.desc || '').slice(0, 420),
      limit: x.limit || null, hook: x.engineHook || null
    })),
    planets: loreSrc.planets || [],
    gtArcs: loreSrc.gtArcs || [],
    darkDragons: loreSrc.darkDragons || [],
    multipliers: loreSrc.multipliers || []
  };
  const loreCount = worldLore.races.length + worldLore.technology.length +
    worldLore.gtArcs.length + worldLore.darkDragons.length + worldLore.multipliers.length;


  // --- Tecnicas: compactar ocurrencias a {tomo: {n, pages: primeros 8}} ---
  const techniques = moves.techniques.map((t) => {
    const occ = {};
    for (const [tomo, v] of Object.entries(t.occurrences || {})) {
      occ[tomo] = { n: v.hits, p: v.pages.slice(0, 8) };
    }
    return {
      id: t.id, es: t.nameEs, ro: t.romaji, ty: t.type,
      us: (t.users || []).filter((u) => rosterIds.has(u) || u === '*'),
      de: t.description, al: t.aliases || [],
      at: t.attestedInChozenshu, n: t.totalHits, occ
    };
  });

  // --- Indice inverso personaje -> tecnicas ---
  const byCharacter = {};
  for (const t of techniques) {
    for (const u of t.us) (byCharacter[u] ||= []).push(t.id);
  }
  // Heuristica: personajes DB sin tecnicas asignadas heredan las de su misma "familia" de id
  const familias = ['son-goku', 'vegeta', 'son-gohan', 'piccolo', 'krilin', 'tenshinhan', 'freezer', 'cell', 'trunks', 'goten'];
  for (const c of dbChars) {
    if (byCharacter[c.id]?.length) continue;
    for (const fam of familias) {
      if (c.id.startsWith(fam) || c.id.includes(fam)) {
        const donor = dbChars.find((x) => byCharacter[x.id]?.length && (x.id.startsWith(fam) || x.id.includes(fam)));
        if (donor) { byCharacter[c.id] = [...byCharacter[donor.id]]; break; }
      }
    }
  }

  // --- Fuerzas de combate (verificadas + prosa) ---
  const battlePowers = [
    ...(bpCanon.chart_verified || []).map((r) => ({
      v: r.value, n: r.name, c: r.characterId || null, a: r.arc,
      pg: r.printedPage, nt: r.notes || null, k: r.kind || 'power', src: 'verificado-visual'
    })),
    ...(bpCanon.prose_mined || []).map((r) => ({
      v: r.value, n: r.name || `Ref. ${r.source?.tomo} p.${r.source?.pdfIndex}`,
      c: r.characterId || null, a: r.arc || null, pg: null, nt: r.notes || null,
      k: 'power', src: 'prosa-minada', conf: r.confidence
    }))
  ].sort((x, y) => x.v - y.v);

  // --- Cronologia (dedupe por age+contexto corto) ---
  const seen = new Set();
  const timelineRows = [];
  for (const e of timeline.events) {
    if (/fechadepublicacion/.test(e.context)) continue;
    const key = `${e.age}|${e.context.slice(0, 40)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    timelineRows.push({ a: e.age, t: e.tomo, p: e.page, c: e.context.slice(0, 180) });
  }
  timelineRows.sort((x, y) => x.a - y.a);

  // --- Pasivas: resumen de reglas (sin funciones) ---
  const passives = passMod.PASSIVE_REGISTRY.map((r) => ({
    id: r.id, name: r.name, cat: r.category, effect: r.effect,
    counter: r.counterplay, source: r.source
  }));
  const passCoverage = {};
  for (const c of dbChars) {
    const ids = passMod.resolvePassiveIds(c);
    if (ids.length) passCoverage[c.id] = ids;
  }

  const codex = {
    meta: {
      version: '1.0.0',
      generated: new Date().toISOString(),
      source: 'Dragon Ball Compendios (Chozenshu 1-4) — Planeta Comic / Shueisha',
      counts: {
        techniques: techniques.length,
        attested: techniques.filter((t) => t.at).length,
        battlePowers: battlePowers.length,
        timeline: timelineRows.length,
        dictionary: techniqueDictionary.length,
        passives: passives.length,
        dbCharacters: dbChars.length,
        lore: loreCount
      }
    },
    techniques, battlePowers, timeline: timelineRows, techniqueDictionary, worldLore, passives, passCoverage, byCharacter
  };

  const deep = {
    meta: { version: '1.0.0', note: 'Bloques crudos del Diccionario de Personajes (busqueda profunda).' },
    blocks: dossier.blocks.map((b) => ({ t: b.tomo, p: b.page, m: b.marker, x: b.text.slice(0, 600) }))
  };

  const p1 = path.join(OUT, 'apex-codex.json');
  const p2 = path.join(OUT, 'apex-codex-deep.json');
  fs.writeFileSync(p1, JSON.stringify(codex));
  fs.writeFileSync(p2, JSON.stringify(deep));

  console.log('=== APEX CODEX BUILDER ===');
  console.log(`  apex-codex.json       ${kb(codex).padStart(8)} KB`);
  console.log(`  apex-codex-deep.json  ${kb(deep).padStart(8)} KB`);
  console.log('  ---');
  console.log(`  tecnicas        ${techniques.length} (${codex.meta.counts.attested} atestiguadas)`);
  console.log(`  fuerzas combate ${battlePowers.length}`);
  console.log(`  cronologia      ${timelineRows.length}`);
  console.log(`  diccionario     ${techniqueDictionary.length}`);
  console.log(`  mundo/lore      ${loreCount}`);
  console.log(`  pasivas         ${passives.length}  (cobertura ${Object.keys(passCoverage).length} personajes DB)`);
  console.log(`  personajes DB   ${dbChars.length}`);
  console.log(`  personajes con tecnicas mapeadas: ${Object.keys(byCharacter).length}`);
  return 0;
}

await main();
