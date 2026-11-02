// src/scripts/calcPower.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPowerLevelFormulaBreakdown, calculateScouterReading } from '../services/scouterEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');
const EXPANSION_PATCHES_FILE = path.join(projectRoot, 'src/data/rosterExpansionPatches.json');

let _cachedExpansionPatches = null;
function loadExpansionPatches() {
  if (_cachedExpansionPatches) return _cachedExpansionPatches;
  if (fs.existsSync(EXPANSION_PATCHES_FILE)) {
    try {
      _cachedExpansionPatches = JSON.parse(fs.readFileSync(EXPANSION_PATCHES_FILE, 'utf8'));
      return _cachedExpansionPatches;
    } catch {
      return [];
    }
  }
  return [];
}

export function applyExpansionToChar(c) {
  if (!c) return c;
  const patches = loadExpansionPatches();
  const p = patches.find(patch => patch.charId === c.id);
  if (p) {
    if (p.addedSynergies && p.addedSynergies.length > 0) {
      const existingNames = new Set((c.synergies || []).map(s => s.name));
      const filtered = p.addedSynergies.filter(s => !existingNames.has(s.name));
      c.synergies = (c.synergies || []).concat(filtered);
    }
    if (p.addedPassives && p.addedPassives.length > 0) {
      const existingNames = new Set((c.passives || []).map(ps => ps.name));
      const filtered = p.addedPassives.filter(ps => !existingNames.has(ps.name));
      c.passives = (c.passives || []).concat(filtered);
    }
    if (p.addedTags && p.addedTags.length > 0) {
      const existingTags = new Set(c.haxTags || []);
      const filtered = p.addedTags.filter(t => !existingTags.has(t));
      c.haxTags = (c.haxTags || []).concat(filtered);
    }
  }
  return c;
}

function extraBuffMultiplier(c) {
  const extraCount = ((c.synergies?.length || 0) + (c.passives?.length || 0)) - (c._originalSynergyCount || 0);
  return 1 + 0.02 * Math.max(0, extraCount);
}

/**
 * Calcula de forma determinista y exhaustiva el nivel de poder de un personaje (Ki canónico y APEX-Ki)
 * a partir de sus estadísticas físicas, hazañas, velocidad, durabilidad, Hax, Battle IQ y formas.
 * Almacena el desglose en `powerScaling` y `numericStats`, preservando `originalApexKi` para auditoría.
 */
export function calcPower(character) {
  if (!character) return character;

  if (character.apexKi !== undefined && character.originalApexKi === undefined) {
    character.originalApexKi = character.apexKi;
  }

  // Aplicar parches de expansión si existen
  applyExpansionToChar(character);

  const breakdown = getPowerLevelFormulaBreakdown(character);
  const scouter = calculateScouterReading(character);

  const finalKi = breakdown?.finalPowerLevel || breakdown?.sourceKi || 0;
  const apexKiFormatted = breakdown?.apexKi || scouter?.formatted || '0 Ki';

  // Multiplicador armónico por sinergias/pasivas enriquecidas
  const buffMultiplier = extraBuffMultiplier(character);
  const adjustedKi = Math.round(finalKi * buffMultiplier);

  character.apexKiAdjusted = adjustedKi;
  if (character.tierExact !== undefined) {
    character.tierExactAdjusted = Math.round(character.tierExact * buffMultiplier * 100) / 100;
  }

  character.powerScaling = {
    ...(character.powerScaling || {}),
    apexKi: finalKi,
    apexKiAdjusted: adjustedKi,
    apexKiFormatted: apexKiFormatted,
    scouterKi: finalKi,
    scouterKiAdjusted: adjustedKi,
    scouterKiFormatted: scouter?.formatted || '0 Ki',
    rank: scouter?.rank || 'GUERRERO',
    isOverload: scouter?.isOverload || false,
    speedFactor: breakdown?.speedFactor || 1.0,
    durabilityFactor: breakdown?.durabilityFactor || 1.0,
    haxBiqFactor: breakdown?.haxBiqFactor || 1.0,
    featsStrengthFactor: breakdown?.featsStrengthFactor || 1.0,
    formulaExpression: breakdown?.formulaExpression || ''
  };

  character.numericStats = {
    ...(character.numericStats || {}),
    apexKi: finalKi,
    apexKiAdjusted: adjustedKi,
    scouterKi: finalKi,
    scouterKiAdjusted: adjustedKi,
    powerLevel: finalKi
  };

  // Limpiar campos hardcodeados legados
  delete character.apexKi;

  return character;
}
