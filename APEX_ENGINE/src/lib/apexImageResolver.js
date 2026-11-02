// ============================================================
// APEX — Resolutor visual determinista de personajes
// Cadena: 1) imagen por forma canónica → 2) avatar explícito →
//         3) imagen wiki por id → 4) imagen wiki por nombre →
//         5) placeholder temático SVG (local, sin red)
// SIN IA. SIN generación en runtime. 100% determinista.
// ============================================================

import characterImages from '../data/characterImages.json';
import formImageIndex from '../data/formImageIndex.json';
import {
  buildFranchisePlaceholder,
  buildUserPlaceholder,
  getFranchiseTheme,
  getInitials,
} from './apexImagePlaceholders';

/** Índice por nombre normalizado, para PNJ / variantes sin id exacto. */
const NAME_INDEX = (() => {
  const map = Object.create(null);
  for (const [id, url] of Object.entries(characterImages)) {
    if (!isUsable(url)) continue;
    // "son-goku-dragon-ball-cl-sico-986" → "son goku"
    const guess = id
      .replace(/-\d+$/, '')
      .replace(/-(dragon-ball|jujutsu-kaisen|demon-slayer|chainsaw-man|hunter-x-hunter|jojo|one-punch-man|my-hero-academia|baki|record-of-ragnarok|marvel|dc|invincible|the-boys|spy-x-family)[-a-z]*$/i, '')
      .replace(/-/g, ' ')
      .trim()
      .toLowerCase();
    if (guess && !map[guess]) map[guess] = url;
  }
  return map;
})();

export function isUsable(image) {
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

/**
 * Resuelve la imagen canónica de un personaje.
 * @param {object} char        Ficha del roster
 * @param {object} [options]
 * @param {string} [options.formId]    id de la forma activa (imagen por variante)
 * @param {string} [options.formName]  nombre de la forma activa
 * @param {boolean}[options.placeholder=true] permitir placeholder temático
 * @param {boolean}[options.forcePlaceholder=false] saltar arte real y devolver el placeholder
 * @returns {string|null} URL, data-URI o null
 */
export function resolveCharacterImage(char, options = {}) {
  if (!char) return null;
  const { formId, formName, placeholder = true, forcePlaceholder = false } = options;

  // 0. Degradación forzada (usado por los onError de <img>)
  if (forcePlaceholder) return placeholder ? buildFranchisePlaceholder(char) : null;

  // 1. Imagen específica de forma (soporta id de forma y nombre de forma)
  if (formId || formName) {
    const keys = [formId && `${char.id}::${formId}`, formName && `${char.id}::${formName}`].filter(Boolean);
    for (const k of keys) {
      const hit = formImageIndex[k];
      if (isUsable(hit)) return hit;
    }
  }

  // 2. Avatar / imagen explícita de la ficha
  if (isUsable(char.avatar)) return char.avatar;
  if (isUsable(char.image)) return char.image;

  // 3. Imagen wiki canónica por id
  const byId = characterImages[char.id];
  if (isUsable(byId)) return byId;

  // 4. Imagen wiki por nombre normalizado (variantes de saga)
  const byName = NAME_INDEX[normalizeName(char.name)];
  if (isUsable(byName)) return byName;

  // 5. Placeholder temático determinista (local)
  return placeholder ? buildFranchisePlaceholder(char) : null;
}

/** Como `resolveCharacterImage`, pero SIEMPRE devuelve algo pintable. */
export function resolveCharacterImageOrPlaceholder(char, options = {}) {
  return resolveCharacterImage(char, { ...options, placeholder: true }) || buildFranchisePlaceholder(char);
}

/** Imagen para PNJ de campaña (puede no existir en el roster). */
export function resolveNpcImage(npc) {
  if (!npc) return buildUserPlaceholder('npj');
  if (isUsable(npc.avatar)) return npc.avatar;
  if (npc.characterId && isUsable(characterImages[npc.characterId])) return characterImages[npc.characterId];
  const byName = NAME_INDEX[normalizeName(npc.name)];
  if (isUsable(byName)) return byName;
  return buildFranchisePlaceholder({ name: npc.name, id: npc.id || npc.name });
}

/** Avatar de cuenta de usuario (iniciales deterministas, sin robots). */
export function resolveUserAvatar(user) {
  if (!user) return buildUserPlaceholder('invitado');
  if (isUsable(user.avatar)) return user.avatar;
  return buildUserPlaceholder(user);
}

/** ¿Este personaje tiene arte real (no placeholder)? */
export function hasRealImage(char) {
  return resolveCharacterImage(char, { placeholder: false }) !== null;
}

/** Métricas de cobertura visual del roster. */
export function getImageCoverage(characters = []) {
  let real = 0;
  let placeholder = 0;
  for (const c of characters) {
    if (hasRealImage(c)) real++;
    else placeholder++;
  }
  const total = real + placeholder;
  return {
    total,
    real,
    placeholder,
    percentage: total ? Math.round((real / total) * 1000) / 10 : 0,
  };
}

export const IMAGE_INDEX_SIZE = Object.keys(characterImages).length;
export const FORM_IMAGE_INDEX_SIZE = Object.keys(formImageIndex).length;

export { getFranchiseTheme, getInitials, buildFranchisePlaceholder, buildUserPlaceholder };
