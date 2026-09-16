// APEX Engine - Sistema de Sinergias de Escuadrón & Escalado de Raid Boss
import { detectSquadTagSynergies } from '../data/tagMechanicsSystem';

export const RAID_BOSS_TIERS = [
  { level: 1, multiplier: 1.20, label: 'Nivel I: Asalto Estándar', desc: 'HP x1.5 · AP +20% · Resistencia a impactos leves', badge: 'x1.20 Buff', color: 'from-amber-600 to-orange-600', aura: 'Aura Amarilla' },
  { level: 2, multiplier: 1.35, label: 'Nivel II: Titán de Asedio (Recomendado)', desc: 'HP x2.0 · AP +35% · Resistencia al aturdimiento y flanqueo', badge: 'x1.35 Buff', color: 'from-orange-600 to-red-600', aura: 'Aura Carmesí' },
  { level: 3, multiplier: 1.50, label: 'Nivel III: Monstruo Desatado', desc: 'HP x3.0 · AP +50% · Aura de presión cinética que ralentiza a la escuadra', badge: 'x1.50 Buff', color: 'from-red-600 to-rose-700', aura: 'Aura Volcánica' },
  { level: 4, multiplier: 2.00, label: 'Nivel IV: Dios de la Destrucción', desc: 'HP x5.0 · AP x2.0 · Crowd Control masivo y ataques en área destructivos', badge: 'x2.00 Buff', color: 'from-purple-600 to-fuchsia-700', aura: 'Aura Divina Púrpura' },
  { level: 5, multiplier: 3.00, label: 'Nivel V: Calamidad Cósmica', desc: 'HP x8.0 · AP x3.0 · Resistencia a la mayoría de Hax directos y daño colosal', badge: 'x3.00 Buff', color: 'from-indigo-600 to-cyan-600', aura: 'Aura de Vacío Cósmico' },
  { level: 6, multiplier: 5.00, label: 'Nivel VI: Entidad Omnipotente / World Boss', desc: 'HP x15.0 · AP x5.0 · Destrucción dimensional instantánea y regeneración titánica', badge: 'x5.00 Buff', color: 'from-yellow-400 via-rose-500 to-purple-600', aura: 'Aura Primordial' }
];

export function calculateSquadSynergy(team = []) {
  const safeTeam = (team || []).filter(Boolean);
  if (safeTeam.length <= 1) {
    return {
      cohesion: 100,
      synergyTier: 'Individual',
      buffs: [],
      combos: []
    };
  }

  let baseCohesion = 65;
  const buffs = [];
  const combos = [];

  // 0. Sinergias y Combos Universales Basados en Tags (Nuevo Motor)
  const tagResults = detectSquadTagSynergies(safeTeam);
  if (tagResults.buffs.length > 0) {
    baseCohesion += tagResults.buffs.length * 5;
    buffs.push(...tagResults.buffs);
  }
  if (tagResults.combos.length > 0) {
    combos.push(...tagResults.combos);
  }

  // 1. Resonancia de Universo
  const universes = safeTeam.map(c => (c?.universe || '').toLowerCase().trim());
  const universeCounts = {};
  universes.forEach(u => {
    universeCounts[u] = (universeCounts[u] || 0) + 1;
  });

  const dominantUniverse = Object.entries(universeCounts).find(([u, count]) => count >= 2);
  if (dominantUniverse && dominantUniverse[0]) {
    baseCohesion += 15;
    buffs.push({
      icon: '🌌',
      name: `Resonancia de Universo (${dominantUniverse[0].toUpperCase()})`,
      desc: `+15% Sincronización de Ki/Energía y fluidez en tácticas combinadas.`
    });
  }

  // 2. Afinidad Específica por Lore
  const allNames = safeTeam.map(c => (c?.name || '').toLowerCase());
  const isSaiyanSquad = allNames.filter(n => n.includes('goku') || n.includes('vegeta') || n.includes('gohan') || n.includes('broly') || n.includes('bardock') || n.includes('trunks') || n.includes('vegetto') || n.includes('gogeta')).length >= 2;
  const isJjkSquad = allNames.filter(n => n.includes('gojo') || n.includes('sukuna') || n.includes('yuji') || n.includes('megumi') || n.includes('yuta') || n.includes('geto') || n.includes('toji')).length >= 2;
  const isShinobiSquad = allNames.filter(n => n.includes('naruto') || n.includes('sasuke') || n.includes('madara') || n.includes('itachi') || n.includes('kakashi') || n.includes('minato')).length >= 2;
  const isHeroSquad = allNames.filter(n => n.includes('superman') || n.includes('batman') || n.includes('flash') || n.includes('thor') || n.includes('iron man') || n.includes('hulk')).length >= 2;

  if (isSaiyanSquad) {
    baseCohesion += 10;
    buffs.push({
      icon: '⚡',
      name: 'Vínculo de Orgullo Saiyajin',
      desc: '+20% Impulso de Ataque cuando un compañero de equipo recibe daño crítico.'
    });
  }

  if (isJjkSquad) {
    baseCohesion += 10;
    buffs.push({
      icon: '👁️',
      name: 'Resonancia de Energía Maldita & Dominio',
      desc: '+25% Penetración de Barreras y sincronización de Destello Negro en cadena.'
    });
  }

  if (isShinobiSquad) {
    baseCohesion += 10;
    buffs.push({
      icon: '🍃',
      name: 'Formación Táctica Shinobi (Fuego Cruzado)',
      desc: '+15% Velocidad de Reacción en emboscadas y maniobras de distracción.'
    });
  }

  if (isHeroSquad) {
    baseCohesion += 10;
    buffs.push({
      icon: '🛡️',
      name: 'Protocolo de Cobertura de la Liga / Vengadores',
      desc: '+20% Mitigación de Daño y cobertura de puntos ciegos.'
    });
  }

  // 3. Arquetipos Complementarios (Tanque, DPS, Rápido, Hax)
  const hasRegen = team.some(c => (c.durability || '').toLowerCase().includes('regen') || (c.haxTags || []).some(h => (h || '').toLowerCase().includes('regen') || (h || '').toLowerCase().includes('inmortal')));
  const hasSpeedster = team.some(c => (c.speed?.combat || '').toLowerCase().includes('mftl') || (c.speed?.combat || '').toLowerCase().includes('inconmensurable') || (c.name || '').toLowerCase().includes('flash'));
  const hasSpaceHax = team.some(c => (c.haxTags || []).some(h => (h || '').toLowerCase().includes('espacial') || (h || '').toLowerCase().includes('temporal') || (h || '').toLowerCase().includes('dimens')));

  if (hasRegen && hasSpeedster) {
    baseCohesion += 10;
    buffs.push({
      icon: '⚔️',
      name: 'Táctica de Martillo y Yunque (Rush & Tank)',
      desc: 'El tanque absorbe el aggro frontal mientras el velocista ejecuta ataques críticos por la espalda.'
    });
  }

  if (hasSpaceHax) {
    baseCohesion += 10;
    buffs.push({
      icon: '🌀',
      name: 'Puente Dimensional & Emboscada Espacial',
      desc: 'Teletransporte y apertura de portales para disparar ataques definitivos a quemarropa.'
    });
  }

  // 4. Ataques Combinados Dinámicos (Dual / Team Finishers) & Sinergias Propias de Personaje
  team.forEach(c => {
    // 4.1 Extraer sinergias definidas en el personaje
    if (c.synergies && Array.isArray(c.synergies)) {
      c.synergies.forEach(syn => {
        // Verificar si la condición de la sinergia se cumple
        const partnerMatches = (syn.partnerTags || []).some(tag => 
          team.some(ally => ally.id !== c.id && (
            (ally.name || '').toLowerCase().includes(tag.toLowerCase()) || 
            (ally.haxTags || []).some(h => (h || '').toLowerCase() === tag.toLowerCase())
          ))
        );
        if (partnerMatches || !syn.partnerTags || syn.partnerTags.length === 0) {
          baseCohesion += 10;
          buffs.push({
            icon: '✨',
            name: `${syn.name} (${c.name})`,
            desc: syn.effect
          });
        }
      });
    }

    // 4.2 Extraer combos definidos en el personaje
    if (c.teamCombos && Array.isArray(c.teamCombos)) {
      c.teamCombos.forEach(combo => {
        const reqs = Array.isArray(combo.partnerRequirements) ? combo.partnerRequirements : [];
        const hasPartners = reqs.length > 0 && reqs.every(req => 
          team.some(ally => ally.id !== c.id && (ally.name || '').toLowerCase().includes(req.toLowerCase()))
        );
        if (hasPartners) {
          combos.push({
            pair: `${c.name} + ${reqs.join(' & ')}`,
            name: `«${combo.comboName || 'Ataque Combinado'}»`,
            desc: combo.description || ''
          });
        }
      });
    }
  });

  for (let i = 0; i < team.length; i++) {
    for (let j = i + 1; j < team.length; j++) {
      const c1 = team[i];
      const c2 = team[j];
      const n1 = (c1.name || '').split(' ')[0];
      const n2 = (c2.name || '').split(' ')[0];

      let comboName = `«Asalto Sincronizado: ${n1} & ${n2}»`;
      let comboDesc = `Ataque coordinado cruzando las energías insignia de ${c1.name} y ${c2.name}.`;

      const low1 = (c1.name || '').toLowerCase();
      const low2 = (c2.name || '').toLowerCase();

      let isHardcoded = false;
      if ((low1.includes('goku') && low2.includes('vegeta')) || (low2.includes('goku') && low1.includes('vegeta'))) {
        comboName = '«Resplandor Final Kamehameha»';
        comboDesc = 'Fusión de haz de energía azul y dorada concentrada que desintegra barreras cósmicas.';
        isHardcoded = true;
      } else if ((low1.includes('gojo') && low2.includes('sukuna')) || (low2.includes('gojo') && low1.includes('sukuna'))) {
        comboName = '«Murasaki Hueco con Cortes Desmantelar»';
        comboDesc = 'Materia imaginaria acelerada imbuida en cortes espaciales que parten la realidad.';
        isHardcoded = true;
      } else if ((low1.includes('naruto') && low2.includes('sasuke')) || (low2.includes('naruto') && low1.includes('sasuke'))) {
        comboName = '«Flecha de Indra Rasenshuriken»';
        comboDesc = 'Vórtice de viento y rayo negro inextinguible con poder de aniquilación continental.';
        isHardcoded = true;
      } else if ((low1.includes('broly') && low2.includes('cell')) || (low2.includes('broly') && low1.includes('cell'))) {
        comboName = '«Gigantic Solar Supernova»';
        comboDesc = 'Esfera verde esmeralda y dorada que devora materia atómica con regeneración.';
        isHardcoded = true;
      } else if ((low1.includes('gohan') && low2.includes('piccolo')) || (low2.includes('gohan') && low1.includes('piccolo'))) {
        comboName = '«Makankosappo Masenko Perforante»';
        comboDesc = 'Disparo doble de haz en espiral que neutraliza la durabilidad rival.';
        isHardcoded = true;
      }

      // Evitar duplicados si el combo ya fue añadido dinámicamente desde los personajes
      const comboExists = combos.some(c => c.name === comboName);
      if (!comboExists) {
        combos.push({
          pair: `${c1.name} + ${c2.name}`,
          name: comboName,
          desc: comboDesc
        });
      }
    }
  }

  const finalCohesion = Math.min(100, Math.max(50, baseCohesion));

  let synergyTier = 'Coordinación Básica';
  if (finalCohesion >= 95) synergyTier = 'Sincronía Absoluta (Perfecta)';
  else if (finalCohesion >= 85) synergyTier = 'Alta Cohesión Táctica';
  else if (finalCohesion >= 75) synergyTier = 'Buena Sincronía';

  return {
    cohesion: finalCohesion,
    synergyTier,
    buffs,
    // Asegurarse de no enviar demasiados combos al prompt
    combos: combos.slice(0, 6)
  };
}
