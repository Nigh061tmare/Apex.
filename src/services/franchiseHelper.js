// APEX Engine - Centralized Franchise & Universe Categorization Helper
// Auto-classifies any character dynamically based on universe, saga, version, and name.

export const FRANCHISE_GROUPS = [
  {
    id: 'fanmanga',
    label: '🔮 Fan Mangas & What-Ifs (Kakumei, Multiverse, New Hope, Brokoly)',
    keywords: ['fan manga', 'what if', 'what-if', 'multiverse', 'kakumei', 'new hope', 'db after', 'brokoly', 'af']
  },
  {
    id: 'oc',
    label: '✨ OC & Creaciones Propias (Rocky, Josh, Lore Propio)',
    keywords: ['oc', 'original character', 'lore propio', 'rocky', 'josh']
  },
  {
    id: 'shuumatsu',
    label: '⚔️ Shuumatsu no Valkyrie (Record of Ragnarok)',
    keywords: ['shuumatsu', 'valkyrie', 'ragnarok', 'record of ragnarok', 'adam', 'zeus', 'poseidon', 'sasaki', 'buddha', 'beelzebub', 'tesla', 'hades', 'qin']
  },
  {
    id: 'opm',
    label: '🥊 One Punch Man',
    keywords: ['one punch man', 'opm', 'saitama', 'garou', 'boros', 'tatsumaki', 'genos', 'blast', 'silver fang', 'bang']
  },
  {
    id: 'mha',
    label: '💥 My Hero Academia (Boku no Hero)',
    keywords: ['my hero academia', 'boku no hero', 'mha', 'bnha', 'deku', 'shigaraki', 'all might', 'bakugo', 'todoroki', 'endeavor', 'all for one', 'dabi']
  },
  {
    id: 'baki',
    label: '🥋 Baki the Grappler / Baki Hanma',
    keywords: ['baki', 'hanma', 'yujiro', 'grappler', 'jack hanma', 'pickle', 'oliva', 'hanayama', 'musashi']
  },
  {
    id: 'kimetsu',
    label: '🗡️ Demon Slayer (Kimetsu no Yaiba)',
    keywords: ['kimetsu', 'demon slayer', 'yaiba', 'tanjiro', 'muzan', 'kokushibo', 'akaza', 'yoriichi', 'doma', 'rengoku', 'giyu']
  },
  {
    id: 'jjk',
    label: '👁️ Jujutsu Kaisen',
    keywords: ['jujutsu', 'jjk', 'gojo', 'sukuna', 'itadori', 'megumi', 'yuta', 'toji', 'kenjaku', 'geto', 'kashimo', 'nanami', 'todo']
  },
  {
    id: 'hxh',
    label: '🏹 Hunter x Hunter',
    keywords: ['hunter x hunter', 'hxh', 'gon', 'killua', 'meruem', 'netero', 'hisoka', 'kurapika', 'chrollo', 'feitan']
  },
  {
    id: 'onepiece',
    label: '🏴‍☠️ One Piece',
    keywords: ['one piece', 'luffy', 'zoro', 'kaido', 'shanks', 'whitebeard', 'gear 5']
  },
  {
    id: 'naruto',
    label: '🍥 Naruto / Boruto',
    keywords: ['naruto', 'boruto', 'shippuden', 'sasuke', 'madara', 'itachi', 'kaguya', 'isshiki']
  },
  {
    id: 'bleach',
    label: '⚡ Bleach',
    keywords: ['bleach', 'ichigo', 'aizen', 'yhwach', 'yamamoto', 'zaraki', 'ulquiorra']
  },
  {
    id: 'dbs',
    label: '🐉 Dragon Ball Super',
    keywords: ['dragon ball super', 'dbs', 'super saiyan blue', 'ultra instinct', 'ultra ego', 'migatte', 'wagama', 'beerus', 'whis', 'jiren', 'goku black', 'zamasu', 'moro', 'granola', 'granolah', 'broly super', 'beast gohan', 'gohan beast', 'cell max', 'super hero', 'torneo del poder', 'tournament of power']
  },
  {
    id: 'dbz',
    label: '🐉 Dragon Ball Z',
    keywords: ['dragon ball z', 'dbz', 'super saiyan 1', 'super saiyan 2', 'super saiyan 3', 'majin buu', 'buutenks', 'buuhan', 'kid buu', 'cell perfecto', 'freezer', 'namek', 'saiyan saga', 'cell games', 'saga saiyans', 'rosat']
  },
  {
    id: 'db_classic_gt',
    label: '🐉 Dragon Ball (Clásico, GT, Daima, Películas Z)',
    keywords: ['dragon ball gt', 'daima', 'película', 'dragon ball clásico', 'dragon ball clasico', 'gt', 'ssj4', 'baby', 'omega shenron', 'super baby', 'gogeta ssj4', 'janemba', 'cooler', 'hildegarn']
  },
  {
    id: 'dc',
    label: '🦇 DC Comics',
    keywords: ['dc', 'dc comics', 'superman', 'batman', 'flash', 'darkseid', 'wonder woman', 'green lantern']
  },
  {
    id: 'marvel',
    label: '⚡ Marvel',
    keywords: ['marvel', 'avengers', 'thor', 'hulk', 'iron man', 'thanos', 'spider-man', 'spiderman']
  },
  {
    id: 'invincible_theboys',
    label: '🩸 Invincible & The Boys',
    keywords: ['invincible', 'omni-man', 'the boys', 'homelander', 'butcher']
  },
  {
    id: 'jojo',
    label: '⭐ JoJo\'s Bizarre Adventure',
    keywords: ['jojo', 'bizarre adventure', 'jotaro', 'dio', 'giorno', 'stand']
  },
  {
    id: 'chainsaw',
    label: '⛓️ Chainsaw Man',
    keywords: ['chainsaw', 'chainsaw man', 'denji', 'makima', 'pochita']
  },
  {
    id: 'spyxfamily',
    label: '🕵️ Spy x Family',
    keywords: ['spy x family', 'forger', 'twilight', 'thorn princess', 'loid', 'yor']
  },
  {
    id: 'other',
    label: '⚔️ Otros Universos / Custom',
    keywords: []
  }
];

/**
 * Agrupa un listado de personajes en las categorías oficiales del motor (Formato Objeto)
 */
export function groupCharactersByFranchise(characters = []) {
  const safeList = Array.isArray(characters) ? characters : [];
  const groups = {};
  FRANCHISE_GROUPS.forEach(g => {
    groups[g.label] = [];
  });

  safeList.forEach(c => {
    if (!c) return;
    const u = (c.universe || '').toLowerCase();
    const s = (c.saga || '').toLowerCase();
    const n = (c.name || '').toLowerCase();
    const v = (c.version || '').toLowerCase();
    const combined = `${u} ${s} ${n} ${v}`;

    let matched = false;
    for (const group of FRANCHISE_GROUPS) {
      if (group.id === 'other') continue;
      if (group.keywords.some(k => combined.includes(k))) {
        groups[group.label].push(c);
        matched = true;
        break;
      }
    }

    if (!matched) {
      if (combined.includes('dragon ball') || combined.includes('multiverse') || combined.includes('dbm')) {
        groups['🔮 Fan Mangas & What-Ifs (Kakumei, Multiverse, New Hope, Brokoly)'].push(c);
      } else {
        groups['⚔️ Otros Universos / Custom'].push(c);
      }
    }
  });

  return groups;
}

/**
 * Retorna las categorías como array con id, label y lista de personajes
 */
export function getFranchiseCategoriesList(characters = []) {
  const safeList = Array.isArray(characters) ? characters : [];
  const groupsMap = groupCharactersByFranchise(safeList);
  return FRANCHISE_GROUPS.map(g => ({
    id: g.id,
    label: g.label,
    characters: groupsMap[g.label] || []
  })).filter(g => g.characters.length > 0 || g.id === 'all');
}

export const UNIVERSE_PRESETS = [
  {
    name: '🐉 Dragon Ball Super',
    dbTag: 'super',
    sagas: ['Torneo del Poder', 'Saga Moro', 'Saga Granola', 'Saga Black Goku', 'Saga Bills', 'Película Super Hero', 'Película Broly']
  },
  {
    name: '🐉 Dragon Ball Z',
    dbTag: 'z',
    sagas: ['Saga Saiyans', 'Saga Namek / Freezer', 'Saga Androides & Cell', 'Cell Games', 'Saga Majin Buu', 'Torneo del Otro Mundo']
  },
  {
    name: '🐉 Dragon Ball (Clásico, GT, Daima)',
    dbTag: 'gt',
    sagas: ['Dragon Ball GT', 'Daima', '21º Tenkaichi Budokai', '23º Tenkaichi Budokai', 'Películas Z']
  },
  {
    name: '🔮 Fan Mangas & What-Ifs',
    dbTag: 'custom',
    sagas: ['Dragon Ball Kakumei', 'Dragon Ball Multiverse (DBM)', 'Dragon Ball New Hope', 'Brokoly350 What-Ifs', 'Dragon Ball After']
  },
  {
    name: '✨ OC & Creaciones Propias',
    dbTag: 'oc',
    sagas: ['Lore Propio', 'Creación Original', 'Torneo Multiversal OC']
  },
  {
    name: '👁️ Jujutsu Kaisen',
    dbTag: 'custom',
    sagas: ['Incidente de Shibuya', 'Culling Game (Viaje a la Extinción)', 'Shinjuku Showdown', 'Jujutsu Kaisen 0']
  },
  {
    name: '🥊 One Punch Man',
    dbTag: 'custom',
    sagas: ['Asociación de Monstruos', 'Invasión Boros', 'Arco Cósmico Garou']
  },
  {
    name: '💥 My Hero Academia',
    dbTag: 'custom',
    sagas: ['Guerra Final', 'Frente de Liberación Paranormal', 'Shie Hassaikai', 'Kamino']
  },
  {
    name: '🗡️ Demon Slayer (Kimetsu)',
    dbTag: 'custom',
    sagas: ['Castillo Infinito', 'Distrito Rojo', 'Tren Infinito', 'Era Sengoku']
  },
  {
    name: '🏴‍☠️ One Piece',
    dbTag: 'custom',
    sagas: ['Wano (Gear 5 / Onigashima)', 'Egghead', 'Marineford', 'Dressrosa', 'Enies Lobby']
  },
  {
    name: '🍥 Naruto / Boruto',
    dbTag: 'custom',
    sagas: ['4ª Gran Guerra Ninja', 'Arco Pain', 'Boruto: Two Blue Vortex', 'Valle del Fin']
  },
  {
    name: '⚡ Bleach',
    dbTag: 'custom',
    sagas: ['Thousand-Year Blood War (TYBW)', 'Hueco Mundo / Espada', 'Sociedad de Almas']
  },
  {
    name: '🦇 DC Comics',
    dbTag: 'custom',
    sagas: ['Post-Crisis', 'New 52 / Rebirth', 'Infinite Frontier', 'Elseworlds']
  },
  {
    name: '⚡ Marvel',
    dbTag: 'custom',
    sagas: ['Tierra-616', 'MCU', 'Secret Wars', 'Infinity Gauntlet']
  },
  {
    name: '⭐ JoJo\'s Bizarre Adventure',
    dbTag: 'custom',
    sagas: ['Stardust Crusaders (Part 3)', 'Golden Wind (Part 5)', 'Stone Ocean (Part 6)', 'Steel Ball Run (Part 7)']
  },
  {
    name: '🩸 Invincible & The Boys',
    dbTag: 'custom',
    sagas: ['Guerra Viltrumita', 'Conquista de la Tierra', 'The Boys Comics']
  },
  {
    name: '⛓️ Chainsaw Man',
    dbTag: 'custom',
    sagas: ['Parte 1 (Demonios Primigenios)', 'Parte 2 (Guerra)']
  },
  {
    name: '🏹 Hunter x Hunter',
    dbTag: 'custom',
    sagas: ['Hormigas Quimera', 'Subasta de Yorkshin', 'Elección del Presidente']
  },
  {
    name: '🥋 Baki Hanma',
    dbTag: 'custom',
    sagas: ['Torneo Máximo', 'Condenados a Muerte', 'Saga Padre vs Hijo', 'Pickle Wars']
  },
  {
    name: '🕵️ Spy x Family',
    dbTag: 'custom',
    sagas: ['Operación Strix', 'Arco del Crucero', 'WISE vs Ostanian Secret Police']
  },
  {
    name: '⚔️ Shuumatsu no Valkyrie',
    dbTag: 'custom',
    sagas: ['Ragnarok Ronda 1-3', 'Ragnarok Ronda 4-6', 'Ragnarok Ronda 7-10']
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 🐉 PACKS DE DRAGON BALL — torneos temáticos rápidos.
// Agrupa las 358 fichas de Dragon Ball del roster por eras/sagas para rellenar
// brackets al instante (Todo, Clásico+Z, Sin Super/Daima, Sin GT, Fan-Mangas…).
// `matches(c)` recibe la ficha completa (universe + saga + name) y devuelve bool.
// ─────────────────────────────────────────────────────────────────────────────
export const DB_PACKS = [
  {
    id: 'db_todo',
    name: '🐉 Todo Dragon Ball',
    description: 'Las 358 fichas de todas las eras: Clásico, Z, GT, Super, Daima y fan-mangas',
    matches: (c) => /dragon ball/i.test(`${c.universe || ''} ${c.saga || ''} ${c.name || ''}`)
  },
  {
    id: 'db_clasico_z',
    name: '🐉 Clásico + Z',
    description: 'Era original + Z (incl. películas y OVAs) — sin GT, Super, Daima ni fan-mangas',
    matches: (c) => {
      const u = `${c.universe || ''} ${c.saga || ''}`;
      return /dragon ball/i.test(u) && /clásico|z — películas|dragon ball z|multi-era/i.test(u) && !/super|daima|gt|fan-manga|multiverse|what-?if/i.test(u);
    }
  },
  {
    id: 'db_sin_super',
    name: '🐉 Sin Super ni Daima',
    description: 'Todo Dragon Ball menos las eras de Super y Daima (Clásico, Z, GT y fan-mangas)',
    matches: (c) => {
      const u = `${c.universe || ''} ${c.saga || ''}`;
      return /dragon ball/i.test(u) && !/super|daima/i.test(u);
    }
  },
  {
    id: 'db_sin_gt',
    name: '🐉 Sin GT',
    description: 'Todo Dragon Ball menos la era GT',
    matches: (c) => {
      const u = `${c.universe || ''} ${c.saga || ''}`;
      return /dragon ball/i.test(u) && !/(^|\s)gt(\s|$)/i.test(u) && !/dragon ball gt/i.test(u);
    }
  },
  {
    id: 'db_z_super',
    name: '🐉 Z + Super + Daima',
    description: 'Las eras modernas más potentes (incl. películas Z y OVAs) — sin clásico, GT ni fan-mangas',
    matches: (c) => {
      const u = `${c.universe || ''} ${c.saga || ''}`;
      return /dragon ball/i.test(u) && /z|super|daima/i.test(u) && !/clásico|dragon ball gt|fan-manga|multiverse|what-?if/i.test(u);
    }
  },
  {
    id: 'db_fanmanga',
    name: '🔮 Fan-Mangas & What-Ifs',
    description: 'Kakumei, Multiverse, New Hope, Brokoly, After… (86 fichas)',
    matches: (c) => {
      const u = `${c.universe || ''} ${c.saga || ''}`;
      return /dragon ball/i.test(u) && /fan-manga|multiverse|what-?if|kakumei|new hope|brokoly|db after/i.test(u);
    }
  },
  {
    id: 'db_gt',
    name: '🐉 Solo GT',
    description: 'La era GT (20 fichas)',
    matches: (c) => /dragon ball gt/i.test(`${c.universe || ''} ${c.saga || ''}`)
  },
  {
    id: 'db_daima',
    name: '🐉 Solo Daima',
    description: 'La era Daima (15 fichas)',
    matches: (c) => /dragon ball daima/i.test(`${c.universe || ''} ${c.saga || ''}`)
  },
  {
    id: 'db_clasico',
    name: '🐉 Solo Clásico (Original)',
    description: 'La era original de Dragon Ball (29 fichas)',
    matches: (c) => /dragon ball \(clásico\)|dragon ball clásico/i.test(`${c.universe || ''} ${c.saga || ''}`)
  },
  {
    id: 'db_super',
    name: '🐉 Solo Super',
    description: 'La era Dragon Ball Super (79 fichas)',
    matches: (c) => /dragon ball super/i.test(`${c.universe || ''} ${c.saga || ''}`)
  }
];


