// APEX Fase 7 — Helper central de imágenes de personajes.
// Cadena de resolución: 1) avatar explícito del personaje, 2) imagen real de
// Fandom wiki (characterImages.json, 566 fichas), 3) DiceBear como fallback.
import characterImages from '../data/characterImages.json';

const dicebearStyle = 'bottts';

export function getCharacterImage(char) {
  if (!char) return null;
  // 1. Avatar explícito
  if (char.avatar && /^https?:\/\//i.test(char.avatar)) return char.avatar;
  // 2. Imagen Fandom por id
  const wiki = characterImages[char.id];
  if (wiki && /^https?:\/\//i.test(wiki)) return wiki;
  // 3. Fallback determinista
  return null;
}

export function getCharacterImageWithFallback(char) {
  const img = getCharacterImage(char);
  if (img) return img;
  const seed = encodeURIComponent(char?.name || char?.id || 'luchador');
  return `https://api.dicebear.com/7.x/${dicebearStyle}/svg?seed=${seed}`;
}

// Para PNJs y NPCs de campaña sin id de roster
export function getNpcImage(npc) {
  if (!npc) return null;
  if (npc.avatar && /^https?:\/\//i.test(npc.avatar)) return npc.avatar;
  if (npc.characterId && characterImages[npc.characterId]) return characterImages[npc.characterId];
  const seed = encodeURIComponent(npc.name || 'npj');
  return `https://api.dicebear.com/7.x/${dicebearStyle}/svg?seed=${seed}`;
}

// Cuántas imágenes reales hay disponibles
export const CHARACTER_IMAGES_COUNT = Object.keys(characterImages).length;