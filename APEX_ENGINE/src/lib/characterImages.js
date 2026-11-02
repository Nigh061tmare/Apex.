// ============================================================
// APEX — Helper central de imágenes de personajes.
// Delegado al resolutor determinista (SIN IA, SIN robots).
// Cadena: imagen de forma → avatar explícito → wiki por id →
//         wiki por nombre → placeholder temático SVG local.
// ============================================================
import characterImages from '../data/characterImages.json';
import {
  resolveCharacterImage,
  resolveCharacterImageOrPlaceholder,
  resolveNpcImage,
  resolveUserAvatar,
  hasRealImage,
  getImageCoverage,
  isUsable,
  IMAGE_INDEX_SIZE,
} from './apexImageResolver';

/** Imagen canónica o `null` si no existe arte real. */
export function getCharacterImage(char) {
  return resolveCharacterImage(char, { placeholder: false });
}

/** Imagen canónica o placeholder temático (nunca falla, nunca robot). */
export function getCharacterImageWithFallback(char, options = {}) {
  return resolveCharacterImageOrPlaceholder(char, options);
}

/** Para PNJs y NPCs de campaña sin id de roster. */
export function getNpcImage(npc) {
  return resolveNpcImage(npc);
}

/** Avatar de usuario (iniciales deterministas). */
export function getUserAvatar(user) {
  return resolveUserAvatar(user);
}

// Compatibilidad con la API previa
export const CHARACTER_IMAGES_COUNT = IMAGE_INDEX_SIZE;
export { characterImages, hasRealImage, getImageCoverage, isUsable };
