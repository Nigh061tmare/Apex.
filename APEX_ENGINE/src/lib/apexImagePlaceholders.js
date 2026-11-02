// ============================================================
// APEX — Placeholders SVG deterministas (SIN IA, SIN red)
// Genera avatares temáticos por franquicia: iniciales + paleta
// + glifo canónico. Puro, determinista y reproducible.
// ============================================================

const FRANCHISE_THEMES = {
  'Dragon Ball':                        { from: '#FF8A00', to: '#C62828', accent: '#FFD54F', glyph: '龍' },
  'Jujutsu Kaisen':                     { from: '#1B1B2F', to: '#6A1B9A', accent: '#00E5FF', glyph: '呪' },
  'Demon Slayer (Kimetsu no Yaiba)':    { from: '#0D47A1', to: '#00897B', accent: '#FF5252', glyph: '鬼' },
  'Chainsaw Man':                       { from: '#B71C1C', to: '#212121', accent: '#FFC107', glyph: '鋸' },
  'Hunter x Hunter':                    { from: '#2E7D32', to: '#00695C', accent: '#FFEB3B', glyph: '念' },
  "JoJo's Bizarre Adventure":           { from: '#6A1B9A', to: '#AD1457', accent: '#FFD600', glyph: '波' },
  'One Punch Man':                      { from: '#FDD835', to: '#F57F17', accent: '#D32F2F', glyph: '拳' },
  'My Hero Academia':                   { from: '#1565C0', to: '#009688', accent: '#FFEB3B', glyph: '個' },
  'Baki the Grappler':                  { from: '#37474F', to: '#212121', accent: '#E53935', glyph: '武' },
  'Record of Ragnarok':                 { from: '#4E342E', to: '#BF360C', accent: '#FFD54F', glyph: '神' },
  'Marvel Comics':                      { from: '#B71C1C', to: '#0D47A1', accent: '#FFD54F', glyph: 'M'  },
  'DC Comics':                          { from: '#0D47A1', to: '#1A237E', accent: '#FFC107', glyph: 'D'  },
  'Invincible':                         { from: '#F9A825', to: '#1565C0', accent: '#FFF176', glyph: 'I'  },
  'The Boys':                           { from: '#212121', to: '#455A64', accent: '#E53935', glyph: 'T'  },
  'Spy x Family':                       { from: '#AD1457', to: '#283593', accent: '#80DEEA', glyph: '間' },
  'APEX Original / Híbrido':            { from: '#7C4DFF', to: '#00B8D4', accent: '#FFD54F', glyph: 'A'  },
};

const DEFAULT_THEME = { from: '#37474F', to: '#1A237E', accent: '#FFD54F', glyph: 'A' };

/** Normaliza claves ("jojo's bizarre adventure" → canónica). */
function normalizeKey(raw) {
  if (!raw) return '';
  return String(raw).trim().toLowerCase().replace(/\s+/g, ' ');
}

const THEME_BY_LOWER = Object.fromEntries(
  Object.entries(FRANCHISE_THEMES).map(([k, v]) => [normalizeKey(k), v])
);

/**
 * Resuelve el tema visual de una franquicia. Acepta nombre exacto,
 * variantes en minúsculas o el campo `universe` como respaldo.
 */
export function getFranchiseTheme(franchise, universe) {
  const candidates = [franchise, universe].filter(Boolean).map(normalizeKey);
  for (const c of candidates) {
    if (THEME_BY_LOWER[c]) return THEME_BY_LOWER[c];
    // Coincidencia parcial ("dragon ball z" → dragon ball)
    const partial = Object.keys(THEME_BY_LOWER).find((k) => c.includes(k) || k.includes(c));
    if (partial) return THEME_BY_LOWER[partial];
  }
  return DEFAULT_THEME;
}

/** Iniciales limpias: «Son Goku (Ultra Instinto)» → «SG». */
export function getInitials(name) {
  if (!name) return '?';
  const clean = String(name)
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .trim();
  if (!clean) return '?';
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Escapa texto para incrustar en SVG. */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Hash determinista (FNV-1a) para rotar detalles visuales estables. */
export function hashString(str) {
  let h = 0x811c9dc5;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function toDataUri(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Placeholder temático de personaje. Determinista por `id`/`name`.
 * Devuelve un data-URI SVG (0 peticiones de red).
 */
export function buildFranchisePlaceholder(char, options = {}) {
  const name = char?.name || options.name || 'Desconocido';
  const seed = char?.id || name;
  const theme = getFranchiseTheme(char?.franchise, char?.universe);
  const initials = getInitials(name);
  const h = hashString(seed);

  // Rotación estable del anillo decorativo (0-360) según firma única
  const rot = h % 360;
  // Segunda letra/glifo de acento alterna según paridad del hash
  const ringOpacity = 0.18 + ((h % 5) * 0.05);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="${esc(name)}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.from}"/>
      <stop offset="100%" stop-color="${theme.to}"/>
    </linearGradient>
    <radialGradient id="v" cx="50%" cy="38%" r="72%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.35"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" fill="url(#g)"/>
  <rect width="200" height="200" fill="url(#v)"/>
  <g transform="rotate(${rot} 100 100)" opacity="${ringOpacity.toFixed(2)}">
    <polygon points="100,14 176,57 176,143 100,186 24,143 24,57" fill="none" stroke="${theme.accent}" stroke-width="4"/>
  </g>
  <text x="100" y="96" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="72" font-weight="800" fill="#ffffff" fill-opacity="0.94" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">${esc(initials)}</text>
  <text x="100" y="164" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="42" fill="${theme.accent}" fill-opacity="0.88" text-anchor="middle" dominant-baseline="middle">${esc(theme.glyph)}</text>
</svg>`;
  return toDataUri(svg);
}

/**
 * Placeholder de cuenta de usuario (iniciales, sin robots).
 */
export function buildUserPlaceholder(seedLike) {
  const label = seedLike?.displayName || seedLike?.email || seedLike?.name || 'Invitado';
  const h = hashString(label);
  const hue = h % 360;
  const hue2 = (hue + 42) % 360;
  const initials = getInitials(label.split('@')[0]);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="${esc(label)}">
  <defs>
    <linearGradient id="u" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue} 72% 46%)"/>
      <stop offset="100%" stop-color="hsl(${hue2} 68% 30%)"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="46" fill="url(#u)"/>
  <circle cx="100" cy="100" r="72" fill="#ffffff" fill-opacity="0.10"/>
  <text x="100" y="104" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="78" font-weight="800" fill="#ffffff" fill-opacity="0.95" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">${esc(initials)}</text>
</svg>`;
  return toDataUri(svg);
}

export { FRANCHISE_THEMES, DEFAULT_THEME };
