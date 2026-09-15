#!/usr/bin/env node
/* ============================================================
 * APEX — Auditoría de cobertura visual del roster (Módulo 1.9)
 *
 * Uso:  node src/scripts/auditCharacterImages.cjs [--json] [--missing]
 *
 * Reporta, sin modificar nada:
 *   • Total de combatientes del roster V26
 *   • Cuántos tienen arte real (wiki) y cuántos caen a placeholder
 *   • Desglose por universo/franquicia
 *   • Lista de los que NO tienen imagen real (candidatos a enriquecer)
 *
 * Salida JSON opcional en src/data/reports/imageCoverageReport.json
 * ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ROSTER_PATH = path.join(ROOT, 'src', 'data', 'ROSTER_NIVELES_PODER_CORREGIDO_V26.json');
const IMAGES_PATH = path.join(ROOT, 'src', 'data', 'characterImages.json');
const OUT_DIR = path.join(ROOT, 'src', 'data', 'reports');
const OUT_PATH = path.join(OUT_DIR, 'imageCoverageReport.json');

const FRANCHISE_TOKENS = [
  'dragon-ball', 'jujutsu-kaisen', 'demon-slayer', 'chainsaw-man', 'hunter-x-hunter',
  'jojo', 'one-punch-man', 'my-hero-academia', 'baki', 'record-of-ragnarok',
  'marvel', 'dc', 'invincible', 'the-boys', 'spy-x-family',
];

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

function guessNameFromId(id) {
  let guess = String(id).replace(/-\d+$/, '');
  const re = new RegExp(`-(${FRANCHISE_TOKENS.join('|')})[-a-z]*$`, 'i');
  guess = guess.replace(re, '').replace(/-/g, ' ').trim().toLowerCase();
  return guess;
}

function loadRoster() {
  const raw = JSON.parse(fs.readFileSync(ROSTER_PATH, 'utf8'));
  const chars = raw.characters;
  const list = Array.isArray(chars) ? chars : Object.values(chars || {});
  return { meta: raw.meta || {}, list };
}

function main() {
  const args = process.argv.slice(2);
  const wantJson = args.includes('--json');
  const wantMissing = args.includes('--missing');

  const { meta, list } = loadRoster();
  const images = JSON.parse(fs.readFileSync(IMAGES_PATH, 'utf8'));

  // Índice por nombre normalizado (misma heurística que apexImageResolver)
  const nameIndex = Object.create(null);
  for (const [id, url] of Object.entries(images)) {
    if (!isUsable(url)) continue;
    const guess = guessNameFromId(id);
    if (guess && !nameIndex[guess]) nameIndex[guess] = url;
  }

  const byUniverse = Object.create(null);
  const missing = [];
  let real = 0;
  let placeholder = 0;

  for (const c of list) {
    const universe = c.universe || '(sin universo)';
    if (!byUniverse[universe]) byUniverse[universe] = { total: 0, real: 0, placeholder: 0 };
    byUniverse[universe].total++;

    const hasReal =
      isUsable(c.avatar) ||
      isUsable(c.image) ||
      isUsable(images[c.id]) ||
      isUsable(nameIndex[normalizeName(c.name)]);

    if (hasReal) {
      real++;
      byUniverse[universe].real++;
    } else {
      placeholder++;
      byUniverse[universe].placeholder++;
      missing.push({ id: c.id, name: c.name, universe });
    }
  }

  const total = real + placeholder;
  const pct = total ? Math.round((real / total) * 1000) / 10 : 0;

  console.log('='.repeat(64));
  console.log('  APEX — COBERTURA VISUAL DEL ROSTER');
  console.log('='.repeat(64));
  console.log(`  Baseline            : ${meta.version || 'V26'} (${meta.totalCharacters || total} declarados)`);
  console.log(`  Combatientes        : ${total}`);
  console.log(`  Arte real (wiki)    : ${real}`);
  console.log(`  Placeholder temático: ${placeholder}`);
  console.log(`  Cobertura           : ${pct}%`);
  console.log('-'.repeat(64));
  console.log('  POR UNIVERSO (los 20 con más huecos):');
  const rows = Object.entries(byUniverse)
    .map(([u, s]) => ({ u, ...s, pct: s.total ? Math.round((s.real / s.total) * 100) : 0 }))
    .sort((a, b) => b.placeholder - a.placeholder)
    .slice(0, 20);
  for (const r of rows) {
    console.log(
      `    ${String(r.real).padStart(4)}/${String(r.total).padEnd(4)} ${String(r.pct).padStart(3)}%  ${r.u}  (faltan ${r.placeholder})`
    );
  }

  if (wantMissing) {
    console.log('-'.repeat(64));
    console.log(`  SIN ARTE REAL (${missing.length}):`);
    for (const m of missing) console.log(`    ${m.id}  |  ${m.name}  |  ${m.universe}`);
  }

  if (wantJson) {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    const report = {
      generatedAt: new Date().toISOString(),
      baseline: meta.version || 'V26',
      total,
      real,
      placeholder,
      coveragePercentage: pct,
      byUniverse,
      missing,
    };
    fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2), 'utf8');
    console.log('-'.repeat(64));
    console.log(`  Informe escrito en: ${path.relative(ROOT, OUT_PATH)}`);
  }

  console.log('='.repeat(64));
}

main();
