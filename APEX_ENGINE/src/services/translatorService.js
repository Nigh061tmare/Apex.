// APEX Engine - Motor de Traducción Automática de Fichas (Google Translate & AI Localization)
// Traduce instantáneamente campos estructurados, técnicas, formas, hax y biografías.

const translationCache = new Map();

/**
 * Traduce un texto individual usando la API pública y ultrarrápida de Google Translate (GTX)
 * No requiere API key y funciona sin límites de peticiones para uso del cliente.
 */
export async function translateWithGoogle(text, targetLang = 'en', sourceLang = 'auto') {
  if (!text || typeof text !== 'string' || text.trim() === '') return text;
  if (targetLang === 'es' && (sourceLang === 'es' || sourceLang === 'auto')) {
    // Si el objetivo es español y no parece otro idioma, retornar
    // pero si es claramente inglés o japonés se puede traducir
  }

  const cacheKey = `${sourceLang}_${targetLang}_${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Google Translate HTTP error: ${response.status}`);
    
    const data = await response.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0].map(item => item[0]).filter(Boolean).join('');
      translationCache.set(cacheKey, translated);
      return translated;
    }
    return text;
  } catch (err) {
    console.warn(`[APEX Translator] Fallback translate error for: "${text.slice(0, 30)}..."`, err);
    return text;
  }
}

/**
 * Traduce un array de strings en paralelo
 */
export async function translateArrayWithGoogle(arr, targetLang = 'en') {
  if (!Array.isArray(arr)) return [];
  return Promise.all(arr.map(item => {
    if (typeof item === 'string') return translateWithGoogle(item, targetLang);
    return item;
  }));
}

/**
 * Traduce una ficha de personaje completa de forma estructurada
 * Conserva IDs, valores numéricos, tiers y URLs de avatares intactos.
 */
export async function translateCharacterSheet(character, targetLang = 'en', onProgress) {
  if (!character) return character;
  if (targetLang === 'es') return character; // Retorna original si es español

  const translated = JSON.parse(JSON.stringify(character));
  
  if (onProgress) onProgress(10, 'Traduciendo estadísticas básicas...');

  // 1. Campos Básicos
  if (character.saga) translated.saga = await translateWithGoogle(character.saga, targetLang);
  if (character.version) translated.version = await translateWithGoogle(character.version, targetLang);
  if (character.range) translated.range = await translateWithGoogle(character.range, targetLang);
  if (character.ap) translated.ap = await translateWithGoogle(character.ap, targetLang);
  if (character.durability) translated.durability = await translateWithGoogle(character.durability, targetLang);
  if (character.stamina) translated.stamina = await translateWithGoogle(character.stamina, targetLang);
  if (character.intelligence) translated.intelligence = await translateWithGoogle(character.intelligence, targetLang);
  if (character.experience) translated.experience = await translateWithGoogle(character.experience, targetLang);
  if (character.tactics) translated.tactics = await translateWithGoogle(character.tactics, targetLang);
  if (character.weaknesses) translated.weaknesses = await translateWithGoogle(character.weaknesses, targetLang);
  if (character.psychology) translated.psychology = await translateWithGoogle(character.psychology, targetLang);
  if (character.equipment) translated.equipment = await translateWithGoogle(character.equipment, targetLang);
  if (character.subEntity && typeof character.subEntity === 'object') {
    translated.subEntity = {
      name: await translateWithGoogle(character.subEntity.name || '', targetLang),
      type: await translateWithGoogle(character.subEntity.type || '', targetLang),
      stats: await translateWithGoogle(character.subEntity.stats || '', targetLang)
    };
  }

  if (onProgress) onProgress(35, 'Traduciendo velocidad y fuerza...');

  // 2. Velocidad & Fuerza
  if (character.speed) {
    if (typeof character.speed === 'string') {
      translated.speed = await translateWithGoogle(character.speed, targetLang);
    } else if (typeof character.speed === 'object') {
      translated.speed = {
        combat: await translateWithGoogle(character.speed.combat || '', targetLang),
        reaction: await translateWithGoogle(character.speed.reaction || '', targetLang),
        travel: await translateWithGoogle(character.speed.travel || '', targetLang),
        attack: await translateWithGoogle(character.speed.attack || '', targetLang)
      };
    }
  }

  if (character.strength) {
    if (typeof character.strength === 'string') {
      translated.strength = await translateWithGoogle(character.strength, targetLang);
    } else if (typeof character.strength === 'object') {
      translated.strength = {
        striking: await translateWithGoogle(character.strength.striking || '', targetLang),
        lifting: await translateWithGoogle(character.strength.lifting || '', targetLang)
      };
    }
  }

  if (onProgress) onProgress(55, 'Traduciendo etiquetas de Hax y Hazañas...');

  // 3. HaxTags & Feats
  if (Array.isArray(character.haxTags)) {
    translated.haxTags = await translateArrayWithGoogle(character.haxTags, targetLang);
  }
  if (Array.isArray(character.feats)) {
    translated.feats = await translateArrayWithGoogle(character.feats, targetLang);
  }
  if (Array.isArray(character.abilities)) {
    translated.abilities = await translateArrayWithGoogle(character.abilities, targetLang);
  }

  if (onProgress) onProgress(75, 'Traduciendo formas y transformaciones...');

  // 4. Formas / Transformaciones
  if (Array.isArray(character.forms)) {
    translated.forms = await Promise.all(character.forms.map(async (f) => ({
      ...f,
      name: await translateWithGoogle(f.name || '', targetLang),
      stats: await translateWithGoogle(f.stats || '', targetLang),
      description: f.description ? await translateWithGoogle(f.description, targetLang) : undefined
    })));
  }

  if (onProgress) onProgress(90, 'Traduciendo arsenal de ataques y pasivas...');

  // 5. Arsenal Completo
  if (character.arsenal) {
    translated.arsenal = {
      basicAttacks: character.arsenal.basicAttacks ? await translateWithGoogle(character.arsenal.basicAttacks, targetLang) : '',
      superAttacks: Array.isArray(character.arsenal.superAttacks) 
        ? await Promise.all(character.arsenal.superAttacks.map(async (s) => ({
            name: await translateWithGoogle(s.name || '', targetLang),
            desc: await translateWithGoogle(s.desc || '', targetLang),
            cost: s.cost ? await translateWithGoogle(s.cost, targetLang) : ''
          })))
        : [],
      ultimateAttacks: Array.isArray(character.arsenal.ultimateAttacks)
        ? await Promise.all(character.arsenal.ultimateAttacks.map(async (u) => ({
            name: await translateWithGoogle(u.name || '', targetLang),
            desc: await translateWithGoogle(u.desc || '', targetLang),
            cost: u.cost ? await translateWithGoogle(u.cost, targetLang) : ''
          })))
        : [],
      passives: Array.isArray(character.arsenal.passives)
        ? await Promise.all(character.arsenal.passives.map(async (p) => ({
            name: await translateWithGoogle(p.name || '', targetLang),
            desc: await translateWithGoogle(p.desc || '', targetLang)
          })))
        : [],
      actives: Array.isArray(character.arsenal.actives)
        ? await Promise.all(character.arsenal.actives.map(async (a) => ({
            name: await translateWithGoogle(a.name || '', targetLang),
            desc: await translateWithGoogle(a.desc || '', targetLang)
          })))
        : []
    };
  }

  if (onProgress) onProgress(100, '¡Traducción completada con éxito!');
  return translated;
}
