/**
 * APEX ENGINE - Semantic & Concept Search Engine
 * Búsqueda inteligente por conceptos, habilidades hax, arquetipos y hazañas
 */

// Sinónimos y expansiones semánticas para matching avanzado
const CONCEPT_SYNONYMS = {
  'inmortal': ['inmortalidad', 'regeneracion', 'curacion', 'regenerar', 'revivir', 'indestructible', 'rubber', 'eternidad'],
  'tiempo': ['temporal', 'time stop', 'parar el tiempo', 'borrado de tiempo', 'time erasure', 'epitaph', 'reversión', 'speed force'],
  'espacio': ['espacial', 'dimension', 'portal', 'teletransporte', 'vacio', 'black hole', 'agujero negro', 'the hand', 'borrado'],
  'magia': ['hechizo', 'arcano', 'magico', 'mana', 'moro', 'cadenas', 'maldicion', 'energia maldita'],
  'fuego': ['llamas', 'calor', 'quemar', 'infierno', 'hellflame', 'prominence', 'explosion', 'ignicion'],
  'hielo': ['congelar', 'frio', 'escarcha', 'cero absoluto', 'glaciar'],
  'mente': ['telepatia', 'control mental', 'ilusion', 'memoria', 'kyoka suigetsu', 'psiquico', 'mente'],
  'destruccion': ['hakai', 'desintegracion', 'atomico', 'subatomico', 'erasure', 'aniquilacion', 'borrar'],
  'velocidad': ['luz', 'ftl', 'incalculable', 'infinita', 'godspeed', 'teleport', 'rayo', 'relampago'],
  'fuerza': ['fisica', 'muscular', 'aplastante', 'colosal', 'titular', 'baki', 'golpe'],
  'copia': ['adaptacion', 'copiar', 'aprender', 'sharingan', 'mimica', 'evolucion', 'reactiva']
};

function tokenize(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function expandQueryTokens(tokens = []) {
  const expanded = new Set(tokens);
  for (const t of tokens) {
    for (const [key, syns] of Object.entries(CONCEPT_SYNONYMS)) {
      if (t.includes(key) || key.includes(t)) {
        syns.forEach(s => expanded.add(s));
      }
      for (const s of syns) {
        if (t.includes(s) || s.includes(t)) {
          expanded.add(key);
          syns.forEach(other => expanded.add(other));
        }
      }
    }
  }
  return Array.from(expanded);
}

/**
 * Realiza una búsqueda semántica y de conceptos en el roster de personajes
 * @param {Array} roster - Lista de personajes
 * @param {string} query - Consulta en lenguaje natural
 * @param {Object} [options]
 * @returns {Array} Personajes rankeados con puntuación de relevancia
 */
export function searchCharactersByConcept(roster = [], query = '', options = {}) {
  if (!query || !query.trim()) return roster;

  const rawTokens = tokenize(query);
  if (rawTokens.length === 0) return roster;

  const expandedTokens = expandQueryTokens(rawTokens);
  const minScore = options.minScore || 0.1;

  const scored = roster.map(char => {
    let score = 0;
    const matches = [];

    // Construir corpus de búsqueda para este personaje
    const nameCorpus = (char.name || '') + ' ' + (char.version || '') + ' ' + (char.saga || '');
    const franchiseCorpus = (char.franchise || '') + ' ' + (char.universe || '');
    const tierCorpus = (char.tier || '') + ' ' + (char.tierExact || '');
    const combatCorpus = [
      char.ap || '',
      char.durability || '',
      char.speed || '',
      char.battleIQ || '',
      char.powerLevelReason || '',
      ...(Array.isArray(char.abilities) ? char.abilities.map(a => (a.name || '') + ' ' + (a.desc || '')) : []),
      ...(Array.isArray(char.passives) ? char.passives.map(p => (p.name || '') + ' ' + (p.desc || '')) : []),
      ...(Array.isArray(char.feats) ? char.feats.map(f => (f.name || '') + ' ' + (f.desc || '')) : []),
      ...(Array.isArray(char.forms) ? char.forms.map(f => (f.name || '') + ' ' + (f.description || '')) : [])
    ].join(' ');

    const nameTokens = tokenize(nameCorpus);
    const franchiseTokens = tokenize(franchiseCorpus);
    const combatTokens = tokenize(combatCorpus);
    const tierTokens = tokenize(tierCorpus);

    // Ponderación de pesos
    for (const token of expandedTokens) {
      const isExactUserWord = rawTokens.includes(token);
      const multiplier = isExactUserWord ? 2.0 : 1.0;

      // 1. Nombre y Versión (Peso 5.0)
      if (nameTokens.some(t => t.includes(token) || token.includes(t))) {
        score += 5.0 * multiplier;
        matches.push(`Nombre: ${token}`);
      }

      // 2. Habilidades, Lore, Hazañas y Combate (Peso 3.5)
      if (combatTokens.some(t => t.includes(token) || token.includes(t))) {
        score += 3.5 * multiplier;
        matches.push(`Habilidad/Lore: ${token}`);
      }

      // 3. Franquicia / Universo (Peso 2.5)
      if (franchiseTokens.some(t => t.includes(token) || token.includes(t))) {
        score += 2.5 * multiplier;
        matches.push(`Franquicia: ${token}`);
      }

      // 4. Tier (Peso 2.0)
      if (tierTokens.some(t => t === token)) {
        score += 2.0 * multiplier;
        matches.push(`Tier: ${token}`);
      }
    }

    return {
      character: char,
      score,
      matchHighlights: Array.from(new Set(matches))
    };
  });

  return scored
    .filter(item => item.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map(item => ({
      ...item.character,
      _searchScore: item.score,
      _matchHighlights: item.matchHighlights
    }));
}
