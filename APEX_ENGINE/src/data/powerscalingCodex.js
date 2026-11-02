// APEX Engine - Compendio Maestro de Power Scaling & VS Battles Wiki Official Standard
// Incorpora la totalidad del sistema de niveles, tabla de julios, cinemática, durabilidad y reglas de escalado.

export const POWERSCALING_TIERING_SYSTEM = [
  { tier: '11-C', name: 'Nivel Hipoverso Bajo', category: 'Nivel 11: Infinitesimal', desc: 'Construcciones 0-D infinitamente inferiores a la realidad convencional.', joules: '0 J' },
  { tier: '11-B', name: 'Nivel Hipoverso', category: 'Nivel 11: Infinitesimal', desc: 'Construcciones 1-D unidimensionales infinitamente inferiores.', joules: '0 J' },
  { tier: '11-A', name: 'Nivel Hipoverso Alto', category: 'Nivel 11: Infinitesimal', desc: 'Construcciones 2-D bidimensionales infinitamente inferiores.', joules: '0 J' },
  
  { tier: '10-C', name: 'Humano por Debajo del Promedio', category: 'Nivel 10: Humano', desc: 'Niños pequeños o personas enfermas.', joules: '0 a 60 J' },
  { tier: '10-B', name: 'Humano Promedio', category: 'Nivel 10: Humano', desc: 'Humanos normales, adolescentes o adultos sedentarios.', joules: '60 a 106 J' },
  { tier: '10-A', name: 'Nivel Atleta', category: 'Nivel 10: Humano', desc: 'Luchadores entrenados o atletas en buena forma física.', joules: '106 a 300 J' },
  
  { tier: '9-C', name: 'Nivel Calle', category: 'Nivel 9: Sobrehumano', desc: 'Luchadores callejeros de élite, artistas marciales olímpicos.', joules: '300 J a 15 kJ' },
  { tier: '9-B', name: 'Nivel Muro', category: 'Nivel 9: Sobrehumano', desc: 'Destruir o agrietar piedra, metal o muros estructurales.', joules: '15 kJ a 2.092x10^7 J (0.005 ton TNT)' },
  { tier: '9-A', name: 'Nivel Edificio Pequeño', category: 'Nivel 9: Sobrehumano', desc: 'Destruir habitaciones enteras, casas o cabañas.', joules: '2.092x10^7 a 1.046x10^9 J (0.25 ton TNT)' },
  
  { tier: '8-C', name: 'Nivel Edificio', category: 'Nivel 8: Urbano', desc: 'Destruir fábricas, almacenes o complejos comerciales.', joules: '1.046x10^9 a 8.368x10^9 J (2 ton TNT)' },
  { tier: 'High 8-C', name: 'Nivel Edificio Grande', category: 'Nivel 8: Urbano', desc: 'Destruir rascacielos o torres colosales.', joules: '8.368x10^9 a 4.602x10^10 J (11 ton TNT)' },
  { tier: '8-B', name: 'Nivel Manzana de la Ciudad', category: 'Nivel 8: Urbano', desc: 'Destruir una manzana urbana completa.', joules: '4.602x10^10 a 4.184x10^11 J (100 ton TNT)' },
  { tier: '8-A', name: 'Nivel Manzana Multiurbana', category: 'Nivel 8: Urbano', desc: 'Destruir varias manzanas de una metrópolis.', joules: '4.184x10^11 a 4.184x10^12 J (1 Kilotón TNT)' },
  
  { tier: 'Low 7-C', name: 'Nivel Pueblo Pequeño / Villa', category: 'Nivel 7: Nuclear', desc: 'Destruir un pueblo o asentamiento menor.', joules: '4.184x10^12 a 2.426x10^13 J (5.8 Kilotones)' },
  { tier: '7-C', name: 'Nivel Ciudad', category: 'Nivel 7: Nuclear', desc: 'Destruir una ciudad mediana como Hiroshima o Nagasaki.', joules: '2.426x10^13 a 4.184x10^14 J (100 Kilotones)' },
  { tier: 'High 7-C', name: 'Nivel Ciudad Grande', category: 'Nivel 7: Nuclear', desc: 'Destruir una gran ciudad metropolitana.', joules: '4.184x10^14 a 4.184x10^15 J (1 Megatón TNT)' },
  { tier: 'Low 7-B', name: 'Nivel Ciudad Pequeña (Megatones)', category: 'Nivel 7: Nuclear', desc: 'Impactos termonucleares de gran escala.', joules: '4.184x10^15 a 2.635x10^16 J (6.3 Megatones)' },
  { tier: '7-B', name: 'Nivel Ciudad++', category: 'Nivel 7: Nuclear', desc: 'Destrucción masiva de superciudades.', joules: '2.635x10^16 a 4.184x10^17 J (100 Megatones)' },
  { tier: '7-A', name: 'Nivel Montaña', category: 'Nivel 7: Nuclear', desc: 'Pulverizar o vaporizar una montaña geológica.', joules: '4.184x10^17 a 4.184x10^18 J (1 Gigatón TNT)' },
  { tier: 'High 7-A', name: 'Nivel Montaña Grande', category: 'Nivel 7: Nuclear', desc: 'Destruir montañas colosales tipo Everest.', joules: '4.184x10^18 a 1.799x10^19 J (4.3 Gigatones)' },
  
  { tier: '6-C', name: 'Nivel Isla', category: 'Nivel 6: Tectónico', desc: 'Destruir o hundir una isla en el océano.', joules: '1.799x10^19 a 4.184x10^20 J (100 Gigatones)' },
  { tier: 'High 6-C', name: 'Nivel Isla Grande', category: 'Nivel 6: Tectónico', desc: 'Destruir islas masivas tipo Groenlandia.', joules: '4.184x10^20 a 4.184x10^21 J (1 Teratón TNT)' },
  { tier: 'Low 6-B', name: 'Nivel País Pequeño', category: 'Nivel 6: Tectónico', desc: 'Destruir el territorio de un país pequeño.', joules: '4.184x10^21 a 2.928x10^22 J (7 Teratones)' },
  { tier: '6-B', name: 'Nivel País', category: 'Nivel 6: Tectónico', desc: 'Destruir países enteros de tamaño promedio.', joules: '2.928x10^22 a 4.184x10^23 J (100 Teratones)' },
  { tier: 'High 6-B', name: 'Nivel País Grande', category: 'Nivel 6: Tectónico', desc: 'Destruir países gigantescos tipo Estados Unidos o China.', joules: '4.184x10^23 a 3.179x10^24 J (760 Teratones)' },
  { tier: '6-A', name: 'Nivel Continental', category: 'Nivel 6: Tectónico', desc: 'Destruir una placa tectónica continental.', joules: '3.179x10^24 a 1.855x10^25 J (4.435 Petatones)' },
  { tier: 'High 6-A', name: 'Nivel Multicontinental', category: 'Nivel 6: Tectónico', desc: 'Destruir múltiples continentes o la corteza terrestre.', joules: '1.855x10^25 a 1.24x10^29 J (29.6 Exatones)' },
  
  { tier: '5-C', name: 'Nivel Lunar', category: 'Nivel 5: Subestelar', desc: 'Destruir la Luna de la Tierra.', joules: '1.24x10^29 a 1.81x10^30 J (433 Exatones)' },
  { tier: 'Low 5-B', name: 'Nivel Planeta Pequeño', category: 'Nivel 5: Subestelar', desc: 'Destruir planetas como Mercurio.', joules: '1.81x10^30 a 2.487x10^32 J (59.44 Zettatones)' },
  { tier: '5-B', name: 'Nivel Planetario', category: 'Nivel 5: Subestelar', desc: 'Destruir o desintegrar planetas rocosos como la Tierra.', joules: '2.487x10^32 a 1.59x10^34 J (3.8 Yottatones)' },
  { tier: '5-A', name: 'Nivel Planeta Grande', category: 'Nivel 5: Subestelar', desc: 'Destruir gigantes gaseosos como Júpiter, Urano o Neptuno.', joules: '1.59x10^34 a 6.906x10^37 J (16,512 Ronnatones)' },
  { tier: 'High 5-A', name: 'Nivel Enana Marrón', category: 'Nivel 5: Subestelar', desc: 'Destruir enanas marrones (fusión de deuterio).', joules: '6.906x10^37 a 3.139x10^40 J (7,505 Quettatones)' },
  
  { tier: 'Low 4-C', name: 'Nivel Estrella Pequeña', category: 'Nivel 4: Estelar', desc: 'Destruir enanas rojas como VB 10.', joules: '3.139x10^40 a 5.693x10^41 J (136,066 Quettatones)' },
  { tier: '4-C', name: 'Nivel Estrella', category: 'Nivel 4: Estelar', desc: 'Destruir una estrella común como el Sol.', joules: '5.693x10^41 a 3.182x10^42 J (760,516 Quettatones)' },
  { tier: 'High 4-C', name: 'Nivel Estrella Grande', category: 'Nivel 4: Estelar', desc: 'Destruir supergigantes masivas como Rigel o Betelgeuse.', joules: '3.182x10^42 a 2.923x10^45 J (29.23 Foe)' },
  { tier: '4-B', name: 'Nivel Sistema Solar', category: 'Nivel 4: Estelar', desc: 'Destruir un sistema solar completo en una explosión esférica.', joules: '2.923x10^45 a 2.008x10^57 J (20.08 TeraFoe)' },
  { tier: '4-A', name: 'Nivel Sistema Multisolar', category: 'Nivel 4: Estelar', desc: 'Destruir múltiples sistemas solares considerando la distancia interestelar.', joules: '2.008x10^57 a 1.053x10^66 J (10.53 ZettaFoe)' },
  
  { tier: '3-C', name: 'Nivel Galáctico', category: 'Nivel 3: Cósmico', desc: 'Destruir una galaxia espiral completa como la Vía Láctea.', joules: '1.053x10^66 a 8.593x10^68 J (8,593 YottaFoe)' },
  { tier: '3-B', name: 'Nivel Multigaláctico', category: 'Nivel 3: Cósmico', desc: 'Destruir múltiples galaxias considerando el vacío intergaláctico.', joules: '8.593x10^68 a 2.825x10^92 J (2,825 QuettaexaFoe)' },
  { tier: '3-A', name: 'Nivel Universo', category: 'Nivel 3: Cósmico', desc: 'Destruir toda la materia del universo observable en 3-D.', joules: '2.825x10^92 J a cualquier valor finito' },
  { tier: 'High 3-A', name: 'Nivel Universo Alto', category: 'Nivel 3: Cósmico', desc: 'Energía infinita en escala 3-D / Destruir espacio 3-D infinito.', joules: 'Energía Infinita 3-D' },
  
  { tier: 'Low 2-C', name: 'Nivel Universo+', category: 'Nivel 2: Multiversal', desc: 'Destruir o crear un continuo espacio-tiempo 4-D completo.', joules: 'Espacio-Tiempo 4-D' },
  { tier: '2-C', name: 'Nivel Multiverso Bajo', category: 'Nivel 2: Multiversal', desc: 'Destruir de 2 a 1,000 continuos espacio-temporales 4-D.', joules: '2 a 1,000 Espacio-Tiempos' },
  { tier: '2-B', name: 'Nivel Multiverso', category: 'Nivel 2: Multiversal', desc: 'Destruir de 1,001 a cualquier número finito de líneas temporales.', joules: '1,001+ Multiverso Finito' },
  { tier: '2-A', name: 'Nivel Multiverso+', category: 'Nivel 2: Multiversal', desc: 'Destruir un número infinito numerable de continuos espacio-tiempo.', joules: 'Infinito Numerable 4-D' },
  
  { tier: 'Low 1-C', name: 'Multiverso Complejo Bajo', category: 'Nivel 1: Infinito Superior', desc: 'Estructuras de 5 dimensiones espaciales reales (R^5).', joules: 'Espacio 5-D' },
  { tier: '1-C', name: 'Multiverso Complejo', category: 'Nivel 1: Infinito Superior', desc: 'Estructuras de 6 a 9 dimensiones espaciales reales (R^6 a R^9).', joules: 'Espacio 6-D a 9-D' },
  { tier: 'High 1-C', name: 'Multiverso Complejo Alto', category: 'Nivel 1: Infinito Superior', desc: 'Estructuras de 10 a 11 dimensiones espaciales reales (R^10 a R^11).', joules: 'Espacio 10-D a 11-D' },
  { tier: '1-B', name: 'Hiperverso', category: 'Nivel 1: Infinito Superior', desc: 'Estructuras finitas de 12 dimensiones a cualquier N finito (R^12+).', joules: 'Espacio 12-D a N-D Finito' },
  { tier: 'High 1-B', name: 'Hiperverso Alto', category: 'Nivel 1: Infinito Superior', desc: 'Estructuras de dimensión infinita (Espacio de Hilbert infinito).', joules: 'Espacio de Dimensión Infinita' },
  
  { tier: 'Low 1-A', name: 'Outerverse Bajo', category: 'Nivel 1: Infinito Superior', desc: 'Abarcar el Universo de Von Neumann y trascender todo espacio dimensional.', joules: 'Transdimensional' },
  { tier: '1-A', name: 'Outerverse', category: 'Nivel 1: Infinito Superior', desc: 'Superioridad puramente ontológica/cualitativa que trasciende la física.', joules: 'Trascendencia Cualitativa' },
  { tier: 'High 1-A', name: 'Outerverse Alto', category: 'Nivel 1: Infinito Superior', desc: 'Metacualidades infinitas y espacio de todos los mundos lógicamente posibles.', joules: 'Metacualitativo Absoluto' },
  
  { tier: 'Tier 0', name: 'Sin Límites (Boundless)', category: 'Nivel 0: Supremo', desc: 'Trascendencia absoluta, indivisible, inefable e insuperable más allá de toda ontología dimensional o metafísica.', joules: 'Omnipotencia / Trascendencia Absoluta' },
  { tier: 'Tier 9-C Físico', name: 'Tier 9-C Físico', category: 'Nivel 9: Sobrehumano', desc: 'Luchadores de élite física en combate cuerpo a cuerpo y artes marciales.', joules: '300 J a 15 kJ' },
  { tier: 'Tier 9-A Físico', name: 'Tier 9-A Físico', category: 'Nivel 9: Sobrehumano', desc: 'Fuerza física destructora de habitaciones o muros de hormigón.', joules: '2.092x10^7 a 1.046x10^9 J' },
  { tier: 'Tier 8-C Físico', name: 'Tier 8-C Físico', category: 'Nivel 8: Urbano', desc: 'Impacto cinético puro capaz de colapsar edificios y estructuras industriales.', joules: '1.046x10^9 a 8.368x10^9 J' },
  { tier: 'Tier 7-A Físico', name: 'Tier 7-A Físico', category: 'Nivel 7: Nuclear', desc: 'Fuerza física pura capaz de partir o pulverizar formaciones montañosas.', joules: '4.184x10^17 a 4.184x10^18 J' },
  { tier: 'Tier 7-B Base', name: 'Tier 7-B Base', category: 'Nivel 7: Nuclear', desc: 'Nivel destructivo de ciudad en estado base sin transformaciones.', joules: '2.635x10^16 a 4.184x10^17 J' },
  { tier: 'Tier High 6-A', name: 'Tier High 6-A', category: 'Nivel 6: Tectónico', desc: 'Devastación multicontinental de alta escala y fisuras en la corteza terrestre.', joules: '1.855x10^25 a 1.24x10^29 J' },
  { tier: 'Tier High 6-A a 5-C', name: 'Tier High 6-A a 5-C', category: 'Nivel 6-5: Tectónico a Lunar', desc: 'Rango de transición entre impacto multicontinental masivo y fragmentación lunar.', joules: '1.855x10^25 a 1.81x10^30 J' },
  { tier: 'Tier 6-A', name: 'Tier 6-A', category: 'Nivel 6: Tectónico', desc: 'Destrucción de placas tectónicas continentales completas.', joules: '3.179x10^24 a 1.855x10^25 J' },
  { tier: 'Tier 5-B', name: 'Tier 5-B', category: 'Nivel 5: Subestelar', desc: 'Destrucción de planetas rocosos similares a la Tierra.', joules: '2.487x10^32 a 1.59x10^34 J' },
  { tier: 'Tier 5-A', name: 'Tier 5-A', category: 'Nivel 5: Subestelar', desc: 'Destrucción de gigantes gaseosos masivos tipo Júpiter.', joules: '1.59x10^34 a 6.906x10^37 J' },
  { tier: 'Tier 4-B', name: 'Tier 4-B', category: 'Nivel 4: Estelar', desc: 'Destrucción completa de un sistema solar en onda expansiva esférica.', joules: '2.923x10^45 a 2.008x10^57 J' },
  { tier: 'Tier 3-B', name: 'Tier 3-B', category: 'Nivel 3: Cósmico', desc: 'Destrucción de múltiples galaxias y cúmulos galácticos en el vacío interestelar.', joules: '8.593x10^68 a 2.825x10^92 J' },
];

export const SPEED_SCALE_SYSTEM = [
  { rank: 'Inmóvil', mach: '0', description: 'Cero capacidad de movimiento.' },
  { rank: 'Humano Promedio', mach: '0.014 - 0.022 Mach', description: '18 a 27 km/h.' },
  { rank: 'Pico Humano', mach: '0.029 - 0.036 Mach', description: '37 a 44 km/h (Atletas olímpicos).' },
  { rank: 'Sobrehumano', mach: '0.036 - 0.1 Mach', description: '44 a 123 km/h.' },
  { rank: 'Subsónico (Más rápido que el ojo)', mach: '0.1 - 0.5 Mach', description: '123 a 617 km/h (FTE para humanos).' },
  { rank: 'Transónico', mach: '0.9 - 1.1 Mach', description: 'Barrera del sonido (1,110 a 1,358 km/h).' },
  { rank: 'Supersónico', mach: '1.1 - 2.5 Mach', description: '1,358 a 3,087 km/h (Balas de pistola/fusil).' },
  { rank: 'Hipersónico', mach: 'Mach 5 - 10', description: '6,174 a 12,348 km/h.' },
  { rank: 'Hipersónico Alto', mach: 'Mach 25 - 50', description: '30,870 a 61,740 km/h (Reentrada atmosférica).' },
  { rank: 'Hipersónico Masivo+', mach: 'Mach 1,000 - 8,810', description: '1% de la velocidad de la luz (Rayos naturales).' },
  { rank: 'Subrelativista', mach: '1% - 5% c', description: '3,000 a 15,000 km/s.' },
  { rank: 'Relativista+', mach: '50% - 100% c', description: '150,000 a 299,792 km/s.' },
  { rank: 'Velocidad de la Luz (c)', mach: 'Exacto 1.0c', description: '299,792,458 m/s.' },
  { rank: 'FTL (Faster Than Light)', mach: '1x a 10x c', description: 'Superlumínico básico.' },
  { rank: 'FTL+', mach: '10x a 100x c', description: 'Superlumínico interplanetario.' },
  { rank: 'MFTL (Masivamente FTL)', mach: '100x a 1,000x c', description: 'Viaje interestelar rápido.' },
  { rank: 'MFTL+', mach: '1,000x a Millones x c', description: 'Cruzar galaxias en segundos.' },
  { rank: 'Velocidad Infinita', mach: 'Distancia infinita en tiempo finito / Cualquier distancia en T=0', description: 'Moverse en tiempo cero sin teletransportación.' },
  { rank: 'Velocidad Inconmensurable', mach: 'S = D / T (Indefinido - Independiente del Tiempo)', description: 'Moverse libremente adelante y atrás en el tiempo lineal por pura velocidad.' },
  { rank: 'Omnipresente', mach: 'Estado cuántico omnipresente', description: 'Existe simultáneamente en todo el espacio/tiempo.' }
];

export const DURABILITY_RULES = {
  thirdLaw: "Tercera Ley de Newton: Si un personaje ataca físicamente con cierta energía sin herirse, su durabilidad escala a su AP físico.",
  surfaceArea: "Concentración de Área: Los ataques cortantes o perforantes (espadas, agujas) concentran energía y pueden cortar a seres con durabilidad masiva sin tener su AP.",
  pressurePoints: "Puntos de Presión & Bypass: Golpear centros nerviosos o usar ondas sónicas/ácido anula la durabilidad externa.",
  tankingVsNoSelling: "Tanking (Cero Daño) vs No-Selling (No Reaccionar por tolerancia al dolor pero sufriendo daño acumulativo)."
};

export const UNIVERSAL_ENERGY_SYSTEMS = {
  universal: "Ki (Dragon Ball), Chakra (Naruto), Reiatsu (Bleach), Haki (One Piece), Magia de Combate.",
  rules: "En modo Ecualización, los sistemas interactúan limpiamente para evitar inmunidades ilógicas."
};

/**
 * Calcula en vivo el escalado de poder de una forma activa sobre el personaje base
 */
export function calculateFormScaledStats(character, formIndex = 0) {
  if (!character) return null;
  const forms = character.forms || [];
  const activeForm = forms[formIndex] || forms[0];

  let scaledTier = character.tier || 'Tier 7-B';
  let scaledAP = character.ap || 'Nivel Desconocido';
  let scaledSpeed = typeof character.speed === 'object' ? character.speed.combat : (character.speed || 'Desconocida');
  let scaledDurability = character.durability || 'Desconocida';
  let powerMultiplier = 1.0;

  if (activeForm && activeForm.stats) {
    const rawStats = typeof activeForm.stats === 'string'
      ? activeForm.stats
      : (typeof activeForm.stats === 'object' ? (activeForm.stats.ap || activeForm.stats.tier || JSON.stringify(activeForm.stats)) : String(activeForm.stats));
    const statsText = rawStats.toLowerCase();
    
    // 1. Detect Tier inside form stats
    if (activeForm.tierExact || activeForm.tier) {
      scaledTier = activeForm.tierExact || activeForm.tier;
    } else {
      const tierMatch = rawStats.match(/(Tier\s*[\w\-\+]+|High\s*[\w\-\+]+|Low\s*[\w\-\+]+)/i);
      if (tierMatch) {
        scaledTier = tierMatch[1];
      } else {
        // Check for level names strictly (avoiding mere location mentions like 'en el planeta Vampa')
        if (/\b(?:nivel\s+)?complejo\b|\b1-c\b/i.test(statsText)) scaledTier = 'Tier 1-C';
        else if (/\b(?:nivel\s+)?multivers(?:al|o)\b|\b2-[abc]\b/i.test(statsText)) scaledTier = 'Tier 2-C';
        else if (/\b(?:nivel\s+)?univers(?:al|o)\b|\b3-a\b/i.test(statsText)) scaledTier = 'Tier 3-A';
        else if (/\b(?:nivel\s+)?multigalax(?:ia|ico)\b|\b3-b\b/i.test(statsText)) scaledTier = 'Tier 3-B';
        else if (/\b(?:nivel\s+)?galax(?:ia|ico)\b|\b3-c\b/i.test(statsText)) scaledTier = 'Tier 3-C';
        else if (/\b(?:nivel\s+)?(?:sistema\s+solar|multi-solar)\b|\b4-[ab]\b/i.test(statsText)) scaledTier = 'Tier 4-B';
        else if (/\b(?:nivel\s+)?estrella\b|\b4-c\b/i.test(statsText)) scaledTier = 'Tier 4-C';
        else if (/\b(?:nivel\s+)?planet(?:ario|a)\b|\b5-[ab]\b/i.test(statsText) && !/en\s+el\s+planeta/i.test(statsText)) scaledTier = 'Tier 5-B';
        else if (/\b(?:nivel\s+)?lunar?\b|\b5-c\b/i.test(statsText)) scaledTier = 'Tier 5-C';
        else if (/\b(?:nivel\s+)?continent(?:al|e)\b|\b6-a\b/i.test(statsText)) scaledTier = 'Tier 6-A';
      }
    }

    // 2. Derive AP & Durability
    scaledAP = `${activeForm.name || 'Forma'}: ${rawStats}`;
    const splitPart = rawStats.includes('.') ? rawStats.split('.')[0] : rawStats;
    scaledDurability = `Escalado a ${activeForm.name || 'Forma'} (${splitPart})`;

    // 3. Multiplier heuristics
    if (statsText.includes('ssj3') || statsText.includes('x400') || statsText.includes('400')) powerMultiplier = 400;
    else if (statsText.includes('ssj2') || statsText.includes('x100') || statsText.includes('100')) powerMultiplier = 100;
    else if (statsText.includes('ssj') || statsText.includes('x50') || statsText.includes('50')) powerMultiplier = 50;
    else if (statsText.includes('kaioken x20') || statsText.includes('x20')) powerMultiplier = 20;
    else if (statsText.includes('kaioken x10') || statsText.includes('x10')) powerMultiplier = 10;
    else if (statsText.includes('god') || statsText.includes('blue') || statsText.includes('ultra') || statsText.includes('beast') || statsText.includes('lssj')) powerMultiplier = 5000;
    else if (formIndex > 0) powerMultiplier = Math.pow(2.5, formIndex);

    // 4. Scale Speed if form enhances velocity
    if (powerMultiplier >= 100) {
      scaledSpeed = `MFTL+ (Multiplicador ${powerMultiplier}x sobre base)`;
    } else if (powerMultiplier >= 10) {
      scaledSpeed = `MFTL (Potenciado por ${activeForm.name || 'Forma'})`;
    }
  }

  return {
    formName: activeForm?.name || 'Forma Base',
    formStatsDesc: activeForm?.stats || '',
    activeTier: scaledTier,
    activeAP: scaledAP,
    activeDurability: scaledDurability,
    activeSpeed: scaledSpeed,
    multiplier: powerMultiplier
  };
}
