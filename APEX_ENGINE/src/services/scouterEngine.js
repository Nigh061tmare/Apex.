import { calculateApexPL, calculateApexKiEquivalent, tierIndex, withinTierQuality, comparePL } from './apexPowerScalingCore.js';
/**
 * APEX UNIVERSAL SCOUTER & POWER LEVEL ESTIMATION ENGINE
 * Basado en la Escala Canónica de Niveles de Poder de Dragon Ball (Daizenshuu, Guías Oficiales, DAIMA & VS Battles Wiki)
 * Fórmula Universal: PL = BaseEnergy(Tier) × SpeedFactor × DurabilityMod × HaxBIQMod × FormMultiplier
 */

// Mapeo Canónico exacto de personajes conocidos de DB para máxima fidelidad
export const KNOWN_CANON_DB_LEVELS = [
  // 1. Dragon Ball Clásico & Daimaoh
  { pattern: /rey demonio piccolo|piccolo daimaoh|piccolo daimaho/i, base: 260, max: 330, name: 'Rey Demonio Piccolo' },
  { pattern: /piccolo jr|23.*torneo|23.*tenkaichi/i, base: 366, max: 1050, name: 'Piccolo Jr. (23º Torneo)' },
  { pattern: /^granjero|granjero con escopeta/i, base: 5, name: 'Granjero con escopeta' },
  { pattern: /^tortuga\b|^la tortuga\b|\bumigame\b/i, base: 0.1, name: 'Umigame (Tortuga)' },
  { pattern: /goku.*(23.*tenkaichi|23.*torneo)/i, base: 370, max: 480, name: 'Goku (23º Tenkaichi Budokai)' },
  { pattern: /goku.*(22.*tenkaichi|22.*torneo)/i, base: 180, max: 233, name: 'Goku (22º Tenkaichi Budokai)' },
  { pattern: /goku.*(red ribbon|tao pai|agua)/i, base: 260, max: 290, name: 'Goku (Saga Red Ribbon / Daimaoh)' },
  { pattern: /goku.*(niño|21.*tenkaichi|21.*torneo)/i, base: 80, oozaru: 800, name: 'Goku Niño (21º Torneo)' },
  { pattern: /roshi|jackie chun/i, base: 180, max: 270, name: 'Maestro Roshi' },
  { pattern: /krilin.*(22|23|tenkaichi|clásico|clasico|niño)/i, base: 200, name: 'Krilin (DB Clásico)' },
  { pattern: /yamcha.*(22|23|tenkaichi|clásico|clasico|desierto)/i, base: 172, name: 'Yamcha (DB Clásico)' },
  { pattern: /ten.*shin.*han.*(22|23|tenkaichi|clásico|clasico)/i, base: 240, max: 340, name: 'Tenshinhan (DB Clásico)' },
  { pattern: /chaos.*(clásico|clasico|niño)/i, base: 144, name: 'Chaos (DB Clásico)' },
  { pattern: /yajirobe.*(clásico|clasico|torneo|daimaoh)/i, base: 138, name: 'Yajirobe (DB Clásico)' },
  { pattern: /taopaipai|tao pai/i, base: 117, max: 201, name: 'Tao Pai Pai' },
  { pattern: /general blue/i, base: 115, name: 'General Blue' },
  { pattern: /mayor metallitron|metallitron/i, base: 94, name: 'Mayor Metallitron' },
  { pattern: /androide 8|eighter/i, base: 91, name: 'Androide 8' },
  { pattern: /comandante red/i, base: 88, name: 'Comandante Red' },
  { pattern: /coronel silver/i, base: 82, name: 'Coronel Silver' },
  { pattern: /coronel murasaki|murasaki/i, base: 67, name: 'Coronel Murasaki' },
  { pattern: /tambourine/i, base: 154, name: 'Tambourine' },
  { pattern: /cymbal/i, base: 148, name: 'Cymbal' },
  { pattern: /drum/i, base: 182, name: 'Drum' },
  { pattern: /piano/i, base: 3, name: 'Piano' },
  { pattern: /^(?!.*piccolo).*(?:kami-sama|kamisama)/i, base: 310, name: 'Kami-sama' },
  { pattern: /mr\. popo|popo/i, base: 1070, name: 'Mr. Popo' },
  { pattern: /gyumao|ox-king/i, base: 73, name: 'Gyumao (Ox-King)' },
  { pattern: /bora\b/i, base: 23, name: 'Bora' },
  { pattern: /upa\b/i, base: 6, name: 'Upa' },
  { pattern: /nam\b/i, base: 26, name: 'Nam' },
  { pattern: /giran/i, base: 29, name: 'Giran' },
  { pattern: /bacterian/i, base: 14, name: 'Bacterian' },
  { pattern: /ranfan/i, base: 8, name: 'Ranfan' },
  { pattern: /bulma\b/i, base: 4, name: 'Bulma' },
  { pattern: /launch.*mala/i, base: 7, name: 'Launch (Mala)' },
  { pattern: /launch/i, base: 3.5, name: 'Launch (Buena)' },
  { pattern: /oolong/i, base: 2, name: 'Oolong' },
  { pattern: /puar/i, base: 2, name: 'Puar' },
  { pattern: /abuelo gohan|son gohan.*abuelo/i, base: 150, name: 'Abuelo Gohan' },
  { pattern: /chichi.*(23|torneo|adolescente)/i, base: 130, name: 'Chi-Chi (23º Torneo)' },

  // 2. Variantes de Piccolo en DBZ, DBS, DAIMA y DBM
  { pattern: /piccolo.*(inicio.*saiyan|raditz|322|408)/i, base: 408, weighted: 322, max: 1480, name: 'Piccolo (Inicio Saga Saiyan / vs Raditz)' },
  { pattern: /piccolo.*(final.*saiyan|nappa|invasi[oó]n saiyan|3500|3\.5k|4k)/i, base: 3500, weighted: 1220, max: 4200, name: 'Piccolo (Final Saga Saiyan / vs Nappa)' },
  { pattern: /piccolo.*(saga saiyan)/i, base: 3500, weighted: 1220, max: 4200, name: 'Piccolo (Saga Saiyan)' },
  { pattern: /piccolo.*(saga namek|nail)/i, base: 1300000, name: 'Piccolo (Fusión con Nail)' },
  { pattern: /piccolo.*(kami|androide|cell)/i, base: 360000000, name: 'Super Namekian Piccolo (Saga Cell)' },
  { pattern: /piccolo.*(buu|finales.*z)/i, base: 800000000, name: 'Piccolo (Saga Buu / Finales Z)' },
  { pattern: /piccolo.*(new hope)/i, base: 158400000000, name: 'Piccolo (New Hope)' },
  { pattern: /orange piccolo|piccolo.*(orange|naranja|superhero|super hero)/i, base: 14000000000000, name: 'Orange Piccolo (DBS Super Hero)' },
  { pattern: /piccolo.*(daima mini|mini)/i, base: 110000000, name: 'Piccolo Mini (DAIMA)' },
  { pattern: /piccolo.*(saga super|dbs)/i, base: 12000000000, name: 'Piccolo (Saga Super)' },

  // 3. Saga Saiyan
  { pattern: /^raditz|\braditz\b(?!.*piccolo)(?!.*goku)/i, base: 1500, max: 1500, oozaru: 15000, name: 'Raditz' },
  { pattern: /saibaman|saibaimen/i, base: 1200, max: 2600, name: 'Saibaman' },
  { pattern: /yamcha.*(saiyan|kaio)/i, base: 1480, name: 'Yamcha (Saga Saiyan)' },
  { pattern: /chaos|chiaotzu/i, base: 660, max: 1980, name: 'Chaos' },
  { pattern: /ten.*shin.*han.*(saiyan|kaio)/i, base: 1830, max: 3450, name: 'Tenshinhan (Saga Saiyan)' },
  { pattern: /krilin.*(saiyan)/i, base: 1770, name: 'Krilin (Saga Saiyan)' },
  { pattern: /gohan.*(niño)/i, base: 1100, rage: 2800, oozaru: 11000, name: 'Gohan Niño' },
  { pattern: /^nappa|\bnappa\b(?!.*piccolo)/i, base: 4600, max: 7200, name: 'Nappa' },
  { pattern: /vegeta.*(llegada|tierra)/i, base: 18000, max: 24000, oozaru: 180000, name: 'Vegeta (Llegada a la Tierra)' },
  { pattern: /goku.*(llegada dbz|saiyan)/i, base: 8618, kaioken1: 13762, kaioken2: 18350, kaioken3: 27525, kaioken4: 36700, name: 'Goku (Saga Saiyan)' },

  // 4. Saga Namek
  { pattern: /^cui|\bcui\b/i, base: 18000, name: 'Cui' },
  { pattern: /^dodoria|\bdodoria\b/i, base: 21000, name: 'Dodoria' },
  { pattern: /^zarbon|\bzarbon\b/i, base: 22000, monster: 33000, name: 'Zarbon' },
  { pattern: /^nail|\bnail\b(?!.*piccolo)/i, base: 42000, name: 'Nail' },
  { pattern: /^guldo|\bguldo\b/i, base: 11500, name: 'Guldo' },
  { pattern: /^burter|\bburter\b/i, base: 43000, name: 'Burter' },
  { pattern: /^jeice|\bjeice\b/i, base: 44000, name: 'Jeice' },
  { pattern: /^recoome|\brecoome\b/i, base: 45000, name: 'Recoome' },
  { pattern: /^(capit[aá]n\s+)?ginyu\b|\bcapit[aá]n\s+ginyu\b/i, base: 120000, name: 'Capitán Ginyu' },
  { pattern: /vegeta.*(namek)/i, base: 385000, max: 490000, name: 'Vegeta (Namek Zenkai)' },
  { pattern: /freezer.*(1.*forma|primera)/i, base: 530000, name: 'Freezer (1ª Forma)' },
  { pattern: /freezer.*(2.*forma|segunda)/i, base: 1100000, name: 'Freezer (2ª Forma)' },
  { pattern: /freezer.*(3.*forma|tercera)/i, base: 2000000, name: 'Freezer (3ª Forma)' },
  { pattern: /freezer.*(final|100%)/i, base: 128000000, name: 'Freezer (Forma Final 100%)' },
  { pattern: /goku.*(namek|super saiyan)/i, base: 3000000, ssj: 150000000, name: 'Goku Super Saiyan (Namek)' },

  { pattern: /mecha freezer/i, base: 156000000, name: 'Mecha Freezer' },
  { pattern: /trunks.*(primer viaje|llegada|mecha freezer|ssj b[aá]sico)/i, base: 240000000, ssjGrade3: 2040000000, name: 'Trunks del Futuro (Llegada Androides)' },
  { pattern: /androide 19/i, base: 100000000, name: 'Androide 19' },
  { pattern: /androide 20|dr\. gero/i, base: 110000000, name: 'Dr. Gero (Androide 20)' },
  { pattern: /androide 17/i, base: 360000000, name: 'Androide 17' },
  { pattern: /androide 18/i, base: 350000000, name: 'Androide 18' },
  { pattern: /androide 16/i, base: 470000000, name: 'Androide 16' },
  { pattern: /cell.*(larva|incubaci[oó]n|embri[oó]n)/i, base: 800, name: 'Cell (Forma Larval)' },
  { pattern: /cell.*(imperfecto)/i, base: 390000000, max: 470000000, name: 'Cell Imperfecto' },
  { pattern: /cell.*(semi)/i, base: 940000000, name: 'Cell Semiperfecto' },
  { pattern: /cell.*(perfecto)/i, base: 3400000000, name: 'Cell Perfecto' },
  { pattern: /super perfect cell|cell super perfecto/i, base: 5500000000, name: 'Super Perfect Cell' },
  { pattern: /goku.*(cell games|fpssj)/i, base: 2700000000, name: 'Goku Full Power SSJ' },
  { pattern: /gohan.*(cell games|ssj2)/i, base: 2800000000, ssj2: 5600000000, max: 6200000000, name: 'Gohan SSJ2 (Cell Games)' },

  // 6. Saga Buu
  { pattern: /dabura/i, base: 3000000000, name: 'Dabura' },
  { pattern: /majin vegeta/i, base: 7500000000, finalExplosion: 23000000000, name: 'Majin Vegeta SSJ2' },
  { pattern: /goku.*(ssj3|buu)/i, base: 75000000, ssj3: 31200000000, name: 'Goku SSJ3' },
  { pattern: /majin buu.*(gordo|inocente)/i, base: 20000000000, name: 'Majin Buu Gordo' },
  { pattern: /super buu/i, base: 38000000000, name: 'Super Buu' },
  { pattern: /gotenks.*(ssj3)/i, base: 44000000000, name: 'Gotenks SSJ3' },
  { pattern: /gohan.*(místico|ultimate)/i, base: 80000000000, name: 'Gohan Místico / Ultimate' },
  { pattern: /buuhan/i, base: 96000000000, name: 'Super Buu (Gohan Absorbido)' },
  { pattern: /vegetto.*(z|super)/i, base: 100000000000, ssj: 5000000000000, name: 'Super Vegetto (Z)' },
  { pattern: /kid buu/i, base: 32000000000, name: 'Kid Buu' },

  // 7. Super & Películas
  { pattern: /beerus|bills/i, base: 820000000000, max: 8200000000000, name: 'Bills Dios de la Destrucción' },
  { pattern: /whis/i, base: 50000000000000, name: 'Whis' },
  { pattern: /golden freezer/i, base: 639000000000, name: 'Golden Freezer' },
  { pattern: /goku.*(ssg|god)/i, base: 524000000000, name: 'Goku SSG' },
  { pattern: /goku.*(blue|ssb)/i, base: 631000000000, ssbKaioken20: 6900000000000, name: 'Goku SSB' },
  { pattern: /goku.*(ultra instinto|ui)/i, base: 12300000000000, mui: 24600000000000, name: 'Goku Ultra Instinto Completo' },
  { pattern: /vegeta.*(blue evolution|ssbe)/i, base: 6200000000000, name: 'Vegeta Blue Evolution' },
  { pattern: /vegeta.*(ultra ego)/i, base: 24000000000000, name: 'Vegeta Ultra Ego' },
  { pattern: /jiren/i, base: 14000000000000, max: 25000000000000, name: 'Jiren (Máximo Poder)' },
  { pattern: /broly.*(lssj|super)/i, base: 18000000000, wrathful: 630000000000, lssj: 36000000000000, name: 'Broly LSSJ (Super)' },
  { pattern: /gogeta.*(blue)/i, base: 1247000000000000, name: 'Gogeta Blue' },
  { pattern: /gohan beast|gohan bestia/i, base: 77000000000000, name: 'Gohan Beast' },
  { pattern: /cell max/i, base: 22000000000000, name: 'Cell Max' },

  // 8. DAIMA (Compresión Mini ÷10)
  { pattern: /goku.*(daima.*mini|mini)/i, base: 10000000, ssj: 500000000, ssj3: 3000000000, name: 'Goku Mini (DAIMA)' },
  { pattern: /vegeta.*(daima.*mini|mini)/i, base: 9000000, ssj: 450000000, ssj3: 2700000000, name: 'Vegeta Mini (DAIMA)' },
  { pattern: /glorio/i, base: 2500000, name: 'Glorio' },
  { pattern: /gomah/i, base: 232, ojo: 11600000000, gigante: 116000000000, name: 'Rey Gomah' },
  { pattern: /majin duu/i, base: 550000000, full: 1100000000, ssj3: 3300000000, name: 'Majin Duu' },
  { pattern: /tamagami 1/i, base: 1060000000, name: 'Tamagami 1' },

  // 9. GT
  { pattern: /goku.*(ssj4|gt)/i, base: 560000000, ssj4: 2240000000000, name: 'Goku SSJ4 (GT)' },
  { pattern: /vegeta.*(ssj4|gt)/i, base: 550000000, ssj4: 2200000000000, name: 'Vegeta SSJ4 (GT)' },
  { pattern: /gogeta.*(ssj4)/i, base: 440000000000000, name: 'Gogeta SSJ4 (GT)' }
];

/**
 * Genera una varianza contextual determinística basada en la firma única del personaje.
 * Evita números planos o por defecto idénticos entre diferentes luchadores.
 */
export function getCharacterSignatureVariance(char) {
  if (!char) return 1.0;
  let hash = 0;
  const str = `${char.id || ''}_${char.name || ''}_${char.alias || ''}_${typeof char.speed === 'object' ? JSON.stringify(char.speed) : char.speed || ''}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const norm = Math.abs(hash % 1000) / 1000;
  return 0.88 + (norm * 0.36); // Genera una modulación natural entre 0.88x y 1.24x
}

/**
 * Mapeo de Energía Base (E_Tier) en Joules / Escala Logarítmica de Ki
 * Integra modulación de firma única por personaje para eliminar valores planos por defecto.
 */
export function getBaseEnergyFromTier(tierStr = '', character = null) {
  const low = (tierStr || '').toLowerCase().trim();
  const variance = character ? getCharacterSignatureVariance(character) : 1.0;

  // Tier 1 & 0: Trascendente
  if (low.includes('1-a') || low.includes('outer') || low.includes('tier 0') || low.includes('boundless')) {
    return { value: Infinity, label: '∞ Trascendente', joules: 'Infinito 1-A' };
  }
  if (low.includes('high 1-b') || low.includes('1-b') || low.includes('hyper')) {
    const val = Math.round(1e24 * variance);
    return { value: val, label: `${val.toExponential(2)} Ki`, joules: '10^24 Joules' };
  }
  if (low.includes('1-c') || low.includes('multiverso complejo')) {
    const val = Math.round(1e20 * variance);
    return { value: val, label: `${val.toExponential(2)} Ki`, joules: '10^20 Joules' };
  }

  // Tier 2: Multiversal
  if (low.includes('2-a') || low.includes('multiversal+')) {
    const val = Math.round(5e18 * variance);
    return { value: val, label: 'Multiversal+ (Countably Infinite)', joules: '10^18 Joules' };
  }
  if (low.includes('2-b') || low.includes('multiversal')) {
    // 50 Billones a 1500 Billones (Gohan Beast 77B, Gogeta Blue 1.25B)
    const val = Math.round(75000000000000 * variance);
    return { value: val, label: 'Multiversal (2-B)', joules: '10^16 Joules' };
  }
  if (low.includes('2-c') || low.includes('bajo multiverso')) {
    // 1 Billón a 50 Billones (Beerus 8.2B, Jiren 21B, Goku UI 24.6B, Broly LSSJ 36B)
    const val = Math.round(14000000000000 * variance);
    return { value: val, label: 'Bajo Multiverso (2-C)', joules: '10^15 Joules' };
  }
  if (low.includes('low 2-c') || low.includes('universal+')) {
    // 100 Mil Millones a 1 Billón (Super Vegetto SSJ 5B, Goku SSG 524M, Goku SSB 631M)
    const val = Math.round(500000000000 * variance);
    return { value: val, label: 'Universal+ 4D (Low 2-C)', joules: '10^14 Joules' };
  }

  // Tier 3: Cósmico / Universal 3D
  if (low.includes('high 3-a')) {
    // 30 Mil Millones a 100 Mil Millones (Goku SSJ3 31.2B, Kid Buu 32B, Gohan Místico 80B, Buuhan 96B)
    const val = Math.round(45000000000 * variance);
    return { value: val, label: 'Alto Universo (High 3-A)', joules: 'Infinito 3D' };
  }
  if (low.includes('3-a') || low.includes('universal')) {
    // 5 Mil Millones a 30 Mil Millones (Gohan SSJ2 5.6B, Super Perfect Cell 5.5B, Buu Gordo 20B)
    const val = Math.round(7500000000 * variance);
    return { value: val, label: 'Universo Finito (3-A)', joules: '2.8 × 10^44 J' };
  }
  if (low.includes('3-b') || low.includes('multi-galact')) {
    // 2.5 Mil Millones a 5 Mil Millones (Goku SSJ Cell 2.7B, Gohan SSJ 2.8B, Cell Perfecto 3.4B)
    const val = Math.round(3200000000 * variance);
    return { value: val, label: 'Multi-Galáctico (3-B)', joules: '10^42 J' };
  }
  if (low.includes('3-c') || low.includes('galact')) {
    // 1 Mil Millones a 2.5 Mil Millones (Super Vegeta SSJ G2 1.28B, Trunks USSJ 2.04B, Cell Perfecto inicial 2B)
    const val = Math.round(1500000000 * variance);
    return { value: val, label: 'Galáctico (3-C)', joules: '10^40 J' };
  }

  // Tier 4: Estelar / Sistema Solar
  if (low.includes('4-a') || low.includes('multi-solar')) {
    // 250M a 1,000M (Trunks SSJ 240M, Androides 17/18 360M, Cell Imperfecto 470M, Cell Semi 940M)
    const val = Math.round(380000000 * variance);
    return { value: val, label: 'Multi-Sistema Solar (4-A)', joules: '10^36 J' };
  }
  if (low.includes('4-b') || low.includes('solar')) {
    // 135M a 250M (Goku SSJ Namek 150M, Mecha Freezer 156M)
    const val = Math.round(160000000 * variance);
    return { value: val, label: 'Sistema Solar (4-B)', joules: '10^34 J' };
  }
  if (low.includes('high 4-c')) {
    // 70M a 135M (Freezer 100% 128M, Goku base Buu 75M)
    const val = Math.round(95000000 * variance);
    return { value: val, label: 'Gran Estrella (High 4-C)', joules: '10^33 J' };
  }
  if (low.includes('4-c') || low.includes('estrella') || low.includes('stellar')) {
    // 20M a 70M (Goku Kaio-ken x10 30M, Kaio-ken x20 60M, Freezer 50% 64M)
    const val = Math.round(45000000 * variance);
    return { value: val, label: 'Estelar (4-C)', joules: '10^32 J' };
  }
  if (low.includes('low 4-c')) {
    // 4M a 20M (King Cold 3.5M, Goku base regreso 5M)
    const val = Math.round(8000000 * variance);
    return { value: val, label: 'Estrella Pequeña (Low 4-C)', joules: '10^30 J' };
  }

  // Tier 5: Planetario / Subestelar
  if (low.includes('high 5-a')) {
    // 1.5M a 4M (Freezer 3ª forma 2M, Goku Zenkai 3M)
    const val = Math.round(2500000 * variance);
    return { value: val, label: 'Enana Marrón (High 5-A)', joules: '10^29 J' };
  }
  if (low.includes('5-a') || low.includes('planeta grande')) {
    // 600k a 1.5M (Freezer 2ª forma 1.1M, Piccolo Nail 1.3M)
    const val = Math.round(950000 * variance);
    return { value: val, label: 'Planeta Grande (5-A)', joules: '10^28 J' };
  }
  if (low.includes('low 5-a')) {
    // 350k a 600k (Freezer 1ª forma 530k, Vegeta Zenkai 3 385k)
    const val = Math.round(480000 * variance);
    return { value: val, label: 'Planeta Mediano (Low 5-A)', joules: '10^26 J' };
  }
  if (low.includes('high 5-b')) {
    // 150k a 350k (Freezer 1ª forma reprimido 150k, vs Nail 300k, Goku Kaio-ken x2 180k)
    const val = Math.round(220000 * variance);
    return { value: val, label: 'Planeta Sólido (High 5-B)', joules: '10^25 J' };
  }
  if (low.includes('5-b') || low.includes('planeta')) {
    // 70k a 150k (Goku Namek 90k, Capitán Ginyu 120k)
    const val = Math.round(105000 * variance);
    return { value: val, label: 'Planeta (5-B)', joules: '10^24 J' };
  }
  if (low.includes('low 5-b')) {
    // 30k a 70k (Goku Kaio-ken x3 25.8k, Kaio-ken x4 34.4k, Recoome 45k)
    const val = Math.round(42000 * variance);
    return { value: val, label: 'Planeta Pequeño (Low 5-B)', joules: '10^23 J' };
  }
  if (low.includes('5-c') || low.includes('luna') || low.includes('moon')) {
    // 18k a 30k (Vegeta Saiyan 18k, Galick Gun 24k, Dodoria 21k, Zarbon 22k)
    const val = Math.round(21000 * variance);
    return { value: val, label: 'Lunar (5-C)', joules: '10^21 J' };
  }

  // Tier 6: Continente / Isla
  if (low.includes('high 6-a')) {
    // 14k a 18k (Goku Kaio-ken x1 13.7k, Kaio-ken x2 18.3k)
    const val = Math.round(16000 * variance);
    return { value: val, label: 'Multi-Continental (High 6-A)', joules: '10^19 J' };
  }
  if (low.includes('6-a') || low.includes('continental')) {
    // 11.5k a 14k (Guldo 11.5k, Raditz Oozaru 13k)
    const val = Math.round(12500 * variance);
    return { value: val, label: 'Continental (6-A)', joules: '10^18 J' };
  }
  if (low.includes('high 6-b')) {
    // 9.5k a 11.5k (Goku en batalla 9175, Oozaru Gohan 11k)
    const val = Math.round(10500 * variance);
    return { value: val, label: 'Gran País (High 6-B)', joules: '10^17 J' };
  }
  if (low.includes('6-b') || low.includes('país') || low.includes('country')) {
    // 7.5k a 9.5k (Goku llegada 8618, Nappa blast 7200)
    const val = Math.round(8500 * variance);
    return { value: val, label: 'País (6-B)', joules: '10^16 J' };
  }
  if (low.includes('low 6-b')) {
    // 6k a 7.5k (Vegeta post-batalla 6k)
    const val = Math.round(6800 * variance);
    return { value: val, label: 'País Pequeño (Low 6-B)', joules: '10^15 J' };
  }
  if (low.includes('high 6-c')) {
    // 5k a 6k (Nappa full power 5500)
    const val = Math.round(5400 * variance);
    return { value: val, label: 'Gran Isla (High 6-C)', joules: '10^14.5 J' };
  }
  if (low.includes('6-c') || low.includes('isla') || low.includes('island')) {
    // 4k a 5k (Nappa reprimido 4600)
    const val = Math.round(4500 * variance);
    return { value: val, label: 'Isla (6-C)', joules: '10^14 J' };
  }

  // Tier 7: Montaña / Ciudad / Pueblo
  if (low.includes('high 7-a')) {
    // 3.5k a 4k (Kaio-sama 3600)
    const val = Math.round(3700 * variance);
    return { value: val, label: 'Gran Montaña (High 7-A)', joules: '10^13 J' };
  }
  if (low.includes('7-a') || low.includes('montaña') || low.includes('mountain')) {
    // 2.8k a 3.5k (Piccolo Saiyan 3000, Gohan rage 2800)
    const val = Math.round(3000 * variance);
    return { value: val, label: 'Montaña (7-A)', joules: '10^12 J' };
  }
  if (low.includes('high 7-b')) {
    // 2.2k a 2.8k (Saibaman suicidio 2600)
    const val = Math.round(2400 * variance);
    return { value: val, label: 'Gran Ciudad (High 7-B)', joules: '10^11 J' };
  }
  if (low.includes('7-b') || low.includes('ciudad') || low.includes('city')) {
    // 1.8k a 2.2k (Ten Shin Han Z 1830, Krilin Z 1770)
    const val = Math.round(1800 * variance);
    return { value: val, label: 'Ciudad (7-B)', joules: '10^10 J' };
  }
  if (low.includes('low 7-b')) {
    // 1.5k a 1.8k (Yamcha Z 1480, Piccolo Makankosappo 1480, Gohan rage Raditz 1485)
    const val = Math.round(1500 * variance);
    return { value: val, label: 'Ciudad Pequeña (Low 7-B)', joules: '10^9.5 J' };
  }
  if (low.includes('high 7-c')) {
    // 1.2k a 1.5k (Raditz 1300, Saibaman 1200)
    const val = Math.round(1250 * variance);
    return { value: val, label: 'Gran Pueblo (High 7-C)', joules: '10^9 J' };
  }
  if (low.includes('7-c') || low.includes('pueblo') || low.includes('town')) {
    // 950 a 1.2k (Gohan base Saiyan 1100, Mr. Popo 1040, Yajirobe 970)
    const val = Math.round(1050 * variance);
    return { value: val, label: 'Pueblo (7-C)', joules: '10^8 J' };
  }
  if (low.includes('low 7-c')) {
    // 750 a 950 (Chaos 660, Piccolo Jr gigante 732, Oozaru Goku 21º 800)
    const val = Math.round(800 * variance);
    return { value: val, label: 'Pueblo Pequeño (Low 7-C)', joules: '10^7.5 J' };
  }

  // Tier 8: Urbano / Edificio
  if (low.includes('8-a') || low.includes('multi-city block') || low.includes('multi-manzana')) {
    // 1000 a 1500 de Ki equivalente (Nivel Multi-City Block: Baki, Yujiro, Spider-Man, Raditz destructivo)
    const val = Math.round(1250 * variance);
    return { value: val, label: 'Multi-Bloque Urbano (8-A)', joules: '10^7 J' };
  }
  if (low.includes('8-b') || low.includes('city block') || low.includes('manzana')) {
    // 500 a 1000 de Ki equivalente (Bloque de ciudad)
    const val = Math.round(750 * variance);
    return { value: val, label: 'Bloque de Ciudad (8-B)', joules: '10^6 J' };
  }
  if (low.includes('high 8-c') || low.includes('large building') || low.includes('gran edificio')) {
    // 250 a 500 de Ki equivalente (Rascacielos: Rey Piccolo 270-330, Goku Agua Ultra 290, Roshi Kamehameha 270)
    const val = Math.round(310 * variance);
    return { value: val, label: 'Gran Edificio / Rascacielos (High 8-C)', joules: '10^5.5 J' };
  }
  if (low.includes('8-c') || low.includes('edificio') || low.includes('building')) {
    // 180 a 250 de Ki equivalente (Edificio: Roshi Max 216, Ten Shin Han 22º 240, Goku 22º 185)
    const val = Math.round(215 * variance);
    return { value: val, label: 'Edificio (8-C)', joules: '10^5 J' };
  }

  // Tier 9: Sobrehumano / Muro / Calle (CULMEN HUMANO Y UMBRAL SOBREHUMANO)
  if (low.includes('9-a') || low.includes('edificio pequeño') || low.includes('small building')) {
    // 100 a 180 de Ki equivalente (Sobrehumano medio: Tao Pai Pai 117, General Blue 115, Roshi serio 180)
    const val = Math.round(140 * variance);
    return { value: val, label: 'Edificio Pequeño (9-A)', joules: '10^4 J' };
  }
  if (low.includes('9-b') || low.includes('muro') || low.includes('wall')) {
    // 50 a 100 de Ki equivalente (Sobrehumano inicial: destruye muros y acero, Goku 21º 80, Roshi 83, Krilin 87, Eighter 91)
    const val = Math.round(75 * variance);
    return { value: val, label: 'Muro / Sobrehumano (9-B)', joules: '10^3 J' };
  }
  if (low.includes('9-c') || low.includes('calle') || low.includes('street')) {
    // 25 a 50 de Ki equivalente (CULMEN HUMANO ENTRENADO / Artes Marciales: Nam 26, Giran 29, Bora 23)
    const val = Math.round(35 * variance);
    return { value: val, label: 'Culmen Humano Entrenado (9-C)', joules: '500 J' };
  }

  // Tier 10: Humano
  if (low.includes('10-a') || low.includes('atleta') || low.includes('athlete')) {
    // 10 a 25 de Ki equivalente (Atleta entrenado / Humano en forma: Yamcha inicio 13, Ranfan 8)
    const val = Math.round(18 * variance);
    return { value: val, label: 'Humano Atleta (10-A)', joules: '250 J' };
  }
  if (low.includes('10-b') || low.includes('humano promedio') || low.includes('regular human')) {
    // 5 a 10 de Ki equivalente (Humano promedio: 5 unidades canónicas)
    const val = Math.round(7 * variance);
    return { value: val, label: 'Humano Promedio (10-B)', joules: '100 J' };
  }
  if (low.includes('10-c') || low.includes('humano inferior') || low.includes('below average')) {
    // 1 a 5 de Ki equivalente (Granjero con escopeta = 5, Bulma = 4, Tortuga = 0.1)
    const val = Math.max(1, Math.round(5 * variance));
    return { value: val, label: 'Humano Civil / Inferior (10-C)', joules: '50 J' };
  }

  // Fallback estándar (Humano promedio: 5 unidades)
  const val = Math.max(1, Math.round(5 * variance));
  return { value: val, label: `${val} Unidades`, joules: '100 J' };
}

/**
 * Extrae el coeficiente de velocidad M_Speed
 */
export function getSpeedFactor(speedStr = '') {
  const low = (typeof speedStr === 'object' ? (speedStr.combat || speedStr.attack || '') : (speedStr || '')).toLowerCase();
  if (low.includes('omnipresente') || low.includes('irrelevante') || low.includes('inconmensurable') || low.includes('infinita')) return { factor: 5.0, label: 'Infinita/Inconmensurable (x5.0)' };
  if (low.includes('mftl+') || low.includes('masivamente ftl+')) return { factor: 3.5, label: 'MFTL+ (x3.5)' };
  if (low.includes('mftl') || low.includes('masivamente ftl')) return { factor: 2.8, label: 'MFTL (x2.8)' };
  if (low.includes('ftl+') || low.includes('faster than light+')) return { factor: 2.2, label: 'FTL+ (x2.2)' };
  if (low.includes('ftl') || low.includes('lumínica') || low.includes('luz')) return { factor: 1.8, label: 'Velocidad de la Luz (x1.8)' };
  if (low.includes('relativista+') || low.includes('relativistic+')) return { factor: 1.5, label: 'Relativista+ (x1.5)' };
  if (low.includes('relativista') || low.includes('sub-relativista')) return { factor: 1.35, label: 'Sub-Relativista (x1.35)' };
  if (low.includes('hipersónico masivo') || low.includes('hypersonic massive')) return { factor: 1.25, label: 'Hipersónico Masivo (x1.25)' };
  if (low.includes('hipersónico') || low.includes('hypersonic')) return { factor: 1.15, label: 'Hipersónico (x1.15)' };
  if (low.includes('supersónico') || low.includes('supersonic')) return { factor: 1.05, label: 'Supersónico (x1.05)' };
  return { factor: 1.0, label: 'Estándar (x1.0)' };
}

/**
 * Extrae el coeficiente de durabilidad y regeneración M_Durability
 */
export function getDurabilityFactor(durabilityStr = '', haxTags = []) {
  const low = (durabilityStr || '').toLowerCase();
  let factor = 1.0;
  let reasons = [];

  if (low.includes('inmortal') || low.includes('invulnerable') || low.includes('conceptual')) {
    factor += 0.4;
    reasons.push('Inmortalidad/Invulnerabilidad (+40%)');
  }
  if (haxTags.some(h => h.toLowerCase().includes('regeneración') || h.toLowerCase().includes('regeneracion'))) {
    factor += 0.25;
    reasons.push('Regeneración Acelerada (+25%)');
  }
  if (low.includes('adaptación') || low.includes('reactiva')) {
    factor += 0.2;
    reasons.push('Adaptación (+20%)');
  }
  return { factor: Math.min(2.0, factor), label: reasons.length > 0 ? reasons.join(', ') : 'Resistencia Estándar (x1.0)' };
}

/**
 * Extrae el coeficiente de Hax y Battle IQ
 */
export function getHaxBiqFactor(battleIQStr = '', haxTags = []) {
  const low = (battleIQStr || '').toLowerCase();
  let factor = 1.0;

  // Battle IQ
  if (low.includes('genio') || low.includes('maestro') || low.includes('absoluto') || low.includes('omnisciente')) {
    factor += 0.3;
  } else if (low.includes('alto') || low.includes('veterano') || low.includes('experto')) {
    factor += 0.15;
  }

  // Hax Tag Count
  const count = (haxTags || []).length;
  if (count >= 8) factor += 0.4;
  else if (count >= 4) factor += 0.25;
  else if (count >= 1) factor += 0.1;

  return { factor: Math.min(2.2, factor), label: 'Hax (' + count + ') + IQ (' + factor.toFixed(2) + 'x)' };
}

/**
 * Extrae el coeficiente derivado de Hazañas (Feats), Fuerza de Golpe/Levantamiento y Arsenal Definitivo
 */
export function getFeatsAndStrengthFactor(feats = [], strength = {}, arsenal = {}) {
  let factor = 1.0;
  let reasons = [];

  // 1. Conteo y escala de Hazañas registradas
  const featList = Array.isArray(feats) ? feats : [];
  if (featList.length > 0) {
    const featCountBonus = Math.min(0.25, featList.length * 0.05);
    factor += featCountBonus;
    reasons.push(`${featList.length} Hazañas (+${Math.round(featCountBonus * 100)}%)`);

    const featsText = featList.map(f => typeof f === 'object' ? (f.desc || f.name || JSON.stringify(f)) : String(f)).join(' ').toLowerCase();
    if (featsText.includes('multiversal') || featsText.includes('espacio-tiempo') || featsText.includes('dimensional')) {
      factor += 0.3;
      reasons.push('Hazaña Multiversal (+30%)');
    } else if (featsText.includes('universal') || featsText.includes('universo') || featsText.includes('galact')) {
      factor += 0.2;
      reasons.push('Hazaña Cósmica (+20%)');
    } else if (featsText.includes('planeta') || featsText.includes('luna') || featsText.includes('estrella')) {
      factor += 0.15;
      reasons.push('Hazaña Planetaria (+15%)');
    } else if (featsText.includes('meteor') || featsText.includes('continente') || featsText.includes('montaña')) {
      factor += 0.1;
      reasons.push('Hazaña Tectónica (+10%)');
    }
  }

  // 2. Fuerza de Levantamiento / Impacto (Strength)
  const strText = (typeof strength === 'object' ? `${strength.striking || ''} ${strength.lifting || ''}` : String(strength || '')).toLowerCase();
  if (strText.includes('inconmensurable') || strText.includes('infinita') || strText.includes('universal')) {
    factor += 0.25;
    reasons.push('Fuerza Inconmensurable (+25%)');
  } else if (strText.includes('planetaria') || strText.includes('estelar') || strText.includes('yotta') || strText.includes('zetta')) {
    factor += 0.15;
    reasons.push('Fuerza Planetaria (+15%)');
  } else if (strText.includes('clase 100') || strText.includes('clase m') || strText.includes('clase g') || strText.includes('clase t')) {
    factor += 0.1;
    reasons.push('Fuerza Titánica (+10%)');
  }

  // 3. Ataques Definitivos
  const ultList = arsenal?.ultimateAttacks || [];
  if (Array.isArray(ultList) && ultList.length > 0) {
    factor += 0.1;
    reasons.push(`${ultList.length} Finishers (+10%)`);
  }

  return {
    factor: Math.min(2.5, factor),
    label: reasons.length > 0 ? reasons.join(', ') : 'Estándar (x1.0)'
  };
}

/**
 * DESGLOSE COMPLETO DE LA FÓRMULA MATEMÁTICA DE POWER SCALING
 */
export function getPowerLevelFormulaBreakdown(character, activeFormId) {
  if (!character) return null;

  const forms = character.forms || [];
  const activeForm = forms.find(f => f.id === activeFormId) || forms[0] || {};
  const formName = (activeForm.name || 'Base').toLowerCase();
  const formMultiplierStr = activeForm.multiplier || '';

  // 1. Energía Base por Tier (Cuerpo / Físico)
  const rawTier = activeForm.tierExact || activeForm.tier || character.physicalTier || character.tierExact || character.tier || '';
  const physTierPart = rawTier.includes('|') ? rawTier.split('|')[0].trim() : rawTier;
  const haxTierPart = rawTier.includes('|') ? rawTier.split('|')[1].trim() : (character.haxTier || null);
  let baseEnergy = getBaseEnergyFromTier(physTierPart, character);

  // Si el personaje o forma tiene sourceKi oficial canónico de Dragon Ball, usarlo como valor base auténtico
  const explicitKi = activeForm.sourceKi || character.sourceKi;
  if (explicitKi && typeof explicitKi === 'number' && explicitKi > 0) {
    baseEnergy = {
      value: explicitKi,
      label: `${explicitKi.toLocaleString('es-ES')} Unidades (Canónico DB)`,
      joules: baseEnergy.joules
    };
  }

  // 2. Modificador de Velocidad
  const speed = getSpeedFactor(character.speed);

  // 3. Modificador de Durabilidad & Regeneración
  const durability = getDurabilityFactor(character.durability, character.haxTags);

  // 4. Modificador de Hax & Battle IQ
  const haxBiq = getHaxBiqFactor(character.battleIQ, character.haxTags);

  // 5. Modificador de Hazañas & Fuerza Física
  const featsStrength = getFeatsAndStrengthFactor(character.feats, character.strength, character.arsenal);

  // 6. Multiplicador de Forma
  let formMult = 1.0;
  let formLabel = 'Forma Base (x1.0)';

  if (typeof activeForm.apexKiMultiplier === 'number' && activeForm.apexKiMultiplier > 0) {
    formMult = activeForm.apexKiMultiplier;
    formLabel = `${activeForm.name || 'Forma'} (${formMult}x)`;
  } else if (typeof activeForm.multiplier === 'number' && activeForm.multiplier > 0) {
    formMult = activeForm.multiplier;
    formLabel = `${activeForm.name || 'Forma'} (${formMult}x)`;
  } else {
    // Check multiplier string first (e.g. 50x, x50, x10, 1000000x, 2x, etc.)
    const xMatch = (formMultiplierStr || '').match(/(?:x\s*([0-9\.]+)|([0-9\.]+)\s*x)/i);
    if (xMatch) {
      const val = parseFloat(xMatch[1] || xMatch[2]);
      if (!isNaN(val) && val > 0) {
        formMult = val;
        formLabel = `Multiplicador (${val}x)`;
      }
    }
  }

  // If no explicit multiplier or default 1.0, detect from form name
  if (formMult === 1.0 && !formName.includes('base') && activeForm.id !== 'base') {
    if (formName.includes('beast') || formName.includes('bestia')) {
      formMult = 1000000;
      formLabel = 'Gohan Beast (x1,000,000)';
    } else if (formName.includes('ssj4') || formName.includes('super saiyan 4')) {
      formMult = 4000;
      formLabel = 'Super Saiyan 4 (x4000)';
    } else if (formName.includes('ssj3') || formName.includes('super saiyan 3')) {
      formMult = 400;
      formLabel = 'Super Saiyan 3 (x400)';
    } else if (formName.includes('ssj2') || formName.includes('super saiyan 2')) {
      formMult = 100;
      formLabel = 'Super Saiyan 2 (x100)';
    } else if (formName.includes('fssj') || formName.includes('false super saiyan') || formName.includes('pseudo')) {
      formMult = 25;
      formLabel = 'False Super Saiyan (x25)';
    } else if (formName.includes('ssj') || formName.includes('super saiyan') || formName.includes('super saiyajin')) {
      formMult = 50;
      formLabel = 'Super Saiyan (x50)';
    } else if (formName.includes('oozaru') || formName.includes('ohzaru') || formName.includes('mono') || formName.includes('simio')) {
      formMult = 10;
      formLabel = 'Gran Simio / Oozaru (x10)';
    } else if (formName.includes('kaioken x20') || formName.includes('kaio-ken x20')) {
      formMult = 20;
      formLabel = 'Kaiō-ken x20 (x20)';
    } else if (formName.includes('kaioken x10') || formName.includes('kaio-ken x10')) {
      formMult = 10;
      formLabel = 'Kaiō-ken x10 (x10)';
    } else if (formName.includes('kaioken x4') || formName.includes('kaio-ken x4')) {
      formMult = 4;
      formLabel = 'Kaiō-ken x4 (x4)';
    } else if (formName.includes('kaioken x3') || formName.includes('kaio-ken x3')) {
      formMult = 3;
      formLabel = 'Kaiō-ken x3 (x3)';
    } else if (formName.includes('kaioken x2') || formName.includes('kaio-ken x2')) {
      formMult = 2;
      formLabel = 'Kaiō-ken x2 (x2)';
    } else if (formName.includes('kaioken') || formName.includes('kaio-ken')) {
      formMult = 1.5;
      formLabel = 'Kaiō-ken (x1.5)';
    } else if (formName.includes('demon back') || formName.includes('espalda del demonio') || formName.includes('espalda demon')) {
      formMult = 2.5;
      formLabel = 'Espalda del Demonio (x2.5)';
    } else if (formName.includes('gear 5') || formName.includes('nika')) {
      formMult = 50;
      formLabel = 'Gear 5 Nika (x50)';
    } else if (formName.includes('gear 4')) {
      formMult = 10;
      formLabel = 'Gear 4 (x10)';
    } else if (formName.includes('gear 2')) {
      formMult = 3;
      formLabel = 'Gear 2 (x3)';
    } else if (formName.includes('bankai')) {
      formMult = 10;
      formLabel = 'Bankai (x10)';
    } else if (formName.includes('baryon')) {
      formMult = 100;
      formLabel = 'Modo Baryon (x100)';
    } else if (formName.includes('daima mini') || formName.includes('mini') || /\bdaima\b/i.test(formName)) {
      formMult = 0.1;
      formLabel = 'Compresión DAIMA (÷10)';
    }
  }

  // Comprobar si hay override estático canónico
  const fullName = ((character.name || '') + ' ' + (character.saga || '')).toLowerCase();
  let canonOverride = null;
  for (const item of KNOWN_CANON_DB_LEVELS) {
    if (item.pattern.test(fullName)) {
      canonOverride = item;
      break;
    }
  }

  // Si la forma activa ya tiene un apexKi explícito definido, respetarlo como fuente primaria
  let finalVal = 0;
  if (typeof activeForm.apexKi === 'number' && activeForm.apexKi > 0) {
    finalVal = activeForm.apexKi;
  } else if (canonOverride && !canonOverride.calculatedOnly) {
    finalVal = canonOverride.base;
    if (formMult !== 1.0) finalVal = Math.round(finalVal * formMult);
  } else if (typeof character.numericStats?.apexKi === 'number' && character.numericStats.apexKi > 0) {
    finalVal = Math.round(character.numericStats.apexKi * formMult);
  } else if (typeof character.apexKi === 'number' && character.apexKi > 0) {
    finalVal = Math.round(character.apexKi * formMult);
  } else {
    if (baseEnergy.value === Infinity) {
      finalVal = Infinity;
    } else {
      // APEX-Ki Físico Sostenido: NO se multiplica por speed.factor ni haxBiq.factor.
      // La velocidad y el Hax influyen en combatModifiers (iniciativa/esquiva) y habilidades, no en el AP base.
      const consistencyFactor = featsStrength?.factor ? Math.min(1.35, Math.max(0.70, featsStrength.factor)) : 1.0;
      finalVal = Math.round(baseEnergy.value * consistencyFactor * formMult);
    }
  }

  // Encontrar personaje canónico DB más cercano en poder
  let closestDb = KNOWN_CANON_DB_LEVELS[0];
  let minDiff = Infinity;
  for (const dbChar of KNOWN_CANON_DB_LEVELS) {
    const diff = Math.abs(dbChar.base - (finalVal > 1e20 ? 1e20 : finalVal));
    if (diff < minDiff) {
      minDiff = diff;
      closestDb = dbChar;
    }
  }

  // 6. Cálculo Invariante APEX Core (Escala Monotónica de Ki Universal)
  const profile = {
    id: character.id || 'char-id',
    tierExact: character.tierExact || character.tier,
    ap: (speed.factor / 5.0) * 0.8 + 0.2,
    speed: speed.factor / 5.0,
    durability: (durability.factor - 1.0) / 1.0,
    form: Math.min(1.0, formMult / 50.0),
    battleIQ: (haxBiq.factor - 1.0) / 1.2,
    haxReliability: (character.haxTags?.length || 0) / 10.0,
    formMult: formMult
  };

  const apexPLNum = calculateApexPL(profile);

  // Determinar si hay sourceKi histórico oficial de Dragon Ball
  let sourceKi = activeForm.sourceKi || character.sourceKi || (canonOverride && !canonOverride.calculatedOnly ? canonOverride.base : null);
  if (sourceKi && !activeForm.sourceKi && formMult !== 1.0) sourceKi = Math.round(sourceKi * formMult);

  const effectiveKi = sourceKi || finalVal;
  const scouter = formatScouterResult(effectiveKi, character.tier);

  // Calcular burstKi y durabilityKi dinámicos para la forma activa
  const formBurstKi = typeof activeForm.burstKi === 'number' && activeForm.burstKi > 0
    ? activeForm.burstKi
    : Math.round(effectiveKi * 1.35);
  const formDurabilityKi = typeof activeForm.durabilityKi === 'number' && activeForm.durabilityKi > 0
    ? activeForm.durabilityKi
    : Math.round(effectiveKi * (durability.factor || 1.0));

  return {
    characterName: character.name,
    activeFormName: activeForm.name || 'Forma Base',
    tier: activeForm.tier || character.tier,
    tierExact: activeForm.tierExact || character.tierExact || character.tier,
    apexPL: String(apexPLNum),
    apexKi: scouter.formatted,
    apexKiRaw: effectiveKi,
    sourceKi: sourceKi,
    sourceKiFormatted: sourceKi ? (sourceKi.toLocaleString('es-ES') + ' Unidades (Canon DB)') : null,
    baseEnergyValue: baseEnergy.value,
    speedFactor: speed.factor,
    speedLabel: speed.label,
    durabilityFactor: durability.factor,
    durabilityLabel: durability.label,
    haxBiqFactor: haxBiq.factor,
    haxBiqLabel: haxBiq.label,
    featsStrengthFactor: featsStrength.factor,
    featsStrengthLabel: featsStrength.label,
    formMultiplier: formMult,
    formLabel: formLabel,
    finalPowerLevel: effectiveKi,
    formattedKi: scouter.formatted,
    rank: scouter.rank,
    isOverload: scouter.isOverload,
    burstKi: formBurstKi,
    durabilityKi: formDurabilityKi,
    combatModifiers: {
      initiative: Number((speed.factor * 0.6 + 0.4).toFixed(2)),
      dodgeChance: Number((speed.factor * 0.4 + 0.6).toFixed(2)),
      hitChance: Number((haxBiq.factor * 0.5 + 0.5).toFixed(2))
    },
    formulaExpression: `APEX-Ki = BaseEnergy(${activeForm.tier || character.tier}) × Forma(${formMult}x) = ${scouter.formatted}` + (sourceKi ? (` | Oficial DB: ${sourceKi.toLocaleString('es-ES')} Unidades`) : ''),
    closestDbComparison: closestDb ? (closestDb.name + ' (' + closestDb.base.toLocaleString() + ' Ki)') : 'Desconocido'
  };
}

/**
 * Calcula y formatea el Nivel de Poder / Scouter de un personaje y su forma activa
 */
export function calculateScouterReading(character, activeFormId) {
  const breakdown = getPowerLevelFormulaBreakdown(character, activeFormId);
  if (!breakdown) return { rawValue: 0, formatted: '0', rank: 'Desconocido', isOverload: false };
  const valToFormat = breakdown.sourceKi || breakdown.finalPowerLevel;
  return formatScouterResult(valToFormat, character?.tier);
}

function formatScouterResult(num, tierFallback) {
  if (num === Infinity || isNaN(num) || num > 1e25) {
    return {
      rawValue: 999999999999999,
      formatted: '∞ TRASCENDENTE',
      numberDisplay: '999,999,999,999+',
      rank: 'DEIDAD / OMNIPRESENTE',
      isOverload: true,
      color: 'text-fuchsia-400'
    };
  }

  let numberDisplay = num.toLocaleString('es-ES');
  let formatted = numberDisplay + ' Ki';
  let rank = 'GUERRERO';
  let isOverload = num >= 1000000000000; // >= 1 Trillón explota scouter convencional

  if (num >= 1e12) {
    formatted = (num / 1e12).toFixed(2) + ' Billones de Ki';
    rank = 'RANGO DIOS DE LA DESTRUCCIÓN';
  } else if (num >= 1e9) {
    formatted = (num / 1e9).toFixed(2) + ' Mil Millones de Ki';
    rank = 'AMENAZA CÓSMICA / CELL & BUU';
  } else if (num >= 1e6) {
    formatted = (num / 1e6).toFixed(2) + ' Millones de Ki';
    rank = 'EMPERADOR GALÁCTICO / SUPER SAIYAN';
  } else if (num >= 18000) {
    formatted = numberDisplay + ' Unidades';
    rank = 'DESTRUCTOR PLANETARIO / ÉLITE SAIYAN';
  } else if (num >= 1000) {
    formatted = numberDisplay + ' Unidades';
    rank = 'GUERRERO DE ALTO RANGO';
  } else {
    formatted = numberDisplay + ' Unidades';
    rank = 'RANGO TERRESTRE';
  }

  return {
    rawValue: num,
    formatted,
    numberDisplay,
    rank,
    isOverload,
    color: isOverload ? 'text-red-400' : num >= 1e6 ? 'text-amber-400' : 'text-emerald-400'
  };
}
