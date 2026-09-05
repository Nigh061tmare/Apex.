import React, { useState, useMemo } from 'react';
import { 
  Scale, X, Zap, Shield, Sparkles, Play, RefreshCw, BarChart2, ChevronRight, 
  AlertCircle, Flame, Users, Skull, Swords, Crown, Trophy, Target, Search, Filter, Check, ArrowRight
} from 'lucide-react';
import { getFranchiseCategoriesList } from '../services/franchiseHelper';
import { calculateFormScaledStats, POWERSCALING_TIERING_SYSTEM, SPEED_SCALE_SYSTEM } from '../data/powerscalingCodex';
import { SoundFX } from '../services/soundFx';
import { calculateScouterReading, getPowerLevelFormulaBreakdown } from '../services/scouterEngine';
import { resolveCombatState } from '../lib/combatStateResolver';
import { getBodilyForms } from '../lib/externalEntityFramework';

// Full VS Battles tier scoring with sub-tiers A/B/C
const TIER_SCORE_MAP = [
  { pattern: /High\s*1-A/i, score: 140 },
  { pattern: /1-A/i, score: 130 },
  { pattern: /Low\s*1-A/i, score: 125 },
  { pattern: /1-B/i, score: 120 },
  { pattern: /1-C/i, score: 115 },
  { pattern: /2-A/i, score: 110 },
  { pattern: /2-B/i, score: 105 },
  { pattern: /2-C/i, score: 100 },
  { pattern: /3-A/i, score: 95 },
  { pattern: /3-B/i, score: 90 },
  { pattern: /3-C/i, score: 85 },
  { pattern: /4-A/i, score: 80 },
  { pattern: /4-B\+/i, score: 78 },
  { pattern: /4-B/i, score: 75 },
  { pattern: /4-C/i, score: 70 },
  { pattern: /5-A/i, score: 65 },
  { pattern: /5-B/i, score: 60 },
  { pattern: /5-C/i, score: 55 },
  { pattern: /6-A/i, score: 50 },
  { pattern: /6-B/i, score: 45 },
  { pattern: /6-C/i, score: 40 },
  { pattern: /7-A/i, score: 35 },
  { pattern: /7-B/i, score: 30 },
  { pattern: /7-C/i, score: 25 },
  { pattern: /8-A/i, score: 20 },
  { pattern: /8-B/i, score: 16 },
  { pattern: /8-C/i, score: 13 },
  { pattern: /9-A/i, score: 10 },
  { pattern: /9-B/i, score: 8 },
  { pattern: /9-C/i, score: 6 },
  { pattern: /Tier\s*10/i, score: 4 },
  { pattern: /Tier\s*11/i, score: 2 },
];

function parseTierScore(tierString) {
  if (!tierString) return 10;
  for (const { pattern, score } of TIER_SCORE_MAP) {
    if (pattern.test(tierString)) return score;
  }
  const low = tierString.toLowerCase();
  if (low.includes('outerversal')) return 140;
  if (low.includes('hyperversal')) return 130;
  if (low.includes('multiversal+')) return 110;
  if (low.includes('multiversal')) return 105;
  if (low.includes('universal+')) return 97;
  if (low.includes('universal')) return 95;
  if (low.includes('multi-galact')) return 90;
  if (low.includes('galact')) return 80;
  if (low.includes('estelar') || low.includes('stellar')) return 75;
  if (low.includes('solar')) return 68;
  if (low.includes('planeta') || low.includes('planet')) return 60;
  if (low.includes('luna') || low.includes('moon')) return 50;
  if (low.includes('isla') || low.includes('island')) return 40;
  if (low.includes('ciudad') || low.includes('city')) return 30;
  if (low.includes('edificio') || low.includes('building')) return 20;
  return 10;
}

// Speed tier scoring
const SPEED_TIERS = [
  { keywords: ['omnipresente', 'omnipresent'], score: 100 },
  { keywords: ['irrelevante', 'inapplicable', 'irrelevant'], score: 98 },
  { keywords: ['inconmensurable', 'immeasurable', 'tiempo 0', 'tiempo cero'], score: 97 },
  { keywords: ['infinita', 'infinite'], score: 95 },
  { keywords: ['mftl+', 'massively ftl+'], score: 92 },
  { keywords: ['mftl', 'massively ftl'], score: 86 },
  { keywords: ['ftl+'], score: 80 },
  { keywords: ['ftl', 'faster than light', 'velocidad de la luz', 'lumínica'], score: 75 },
  { keywords: ['relativista+', 'relativistic+'], score: 68 },
  { keywords: ['relativista', 'relativistic'], score: 62 },
  { keywords: ['sub-relativista+', 'subrelativista+', 'sub-relativistic+'], score: 56 },
  { keywords: ['sub-relativista', 'subrelativista', 'sub-relativistic'], score: 50 },
  { keywords: ['hipersónico masivo+', 'hypersonic massive+'], score: 46 },
  { keywords: ['hipersónico masivo', 'hypersonic massive'], score: 42 },
  { keywords: ['hipersónico alto', 'hypersonic high'], score: 38 },
  { keywords: ['hipersónico', 'hypersonic'], score: 34 },
  { keywords: ['supersónico+', 'supersonic+'], score: 28 },
  { keywords: ['supersónico', 'supersonic'], score: 24 },
  { keywords: ['transónico', 'transonic'], score: 18 },
  { keywords: ['subsónico', 'subsonic'], score: 14 },
  { keywords: ['peak human', 'sobrehumano', 'atleta'], score: 10 },
  { keywords: ['human', 'humano', 'normal'], score: 5 },
];

function parseSpeedScore(speedStr) {
  if (!speedStr) return 10;
  const low = speedStr.toLowerCase();
  for (const tier of SPEED_TIERS) {
    if (tier.keywords.some(k => low.includes(k))) return tier.score;
  }
  return 10;
}

// Hax Counter Map
const HAX_COUNTER_MAP = {
  'Regeneración': ['Nulificación de Regeneración', 'Hakai', 'Borrado', 'Corte de Alma', 'Fuego Eterno', 'Jacob\'s Ladder'],
  'Regeneración Celular': ['Nulificación de Regeneración', 'Hakai', 'Borrado de Existencia', 'Ataques Espirituales', 'Luz Solar'],
  'Teletransportación': ['Sellos de Espacio', 'Infinito', 'Fijación Espacial', 'Velocidad Infinita', 'Tesla Step'],
  'Invulnerabilidad': ['Hakai', 'Borrado de Existencia', 'Manipulación Causal', 'Ataques de Alma', 'Espada Corta-Almas'],
  'Manipulación del Tiempo': ['Resistencia Temporal', 'Inmunidad Temporal', 'Fijación Temporal', 'Velocidad Inconmensurable', 'Ojos del Señor'],
  'Parada en el Tiempo': ['Inmunidad Temporal', 'Consciencia Cuántica', 'Resistencia a Tiempo', 'TFTST'],
  'Absorción': ['Resistencia a Absorción', 'Anti-Absorción', 'Sobrecarga de Energía'],
  'Control Mental': ['Resistencia Mental', 'Dominio de Voluntad', 'Barrera Psíquica', 'Restricción Celestial'],
  'Manipulación Causal': ['Resistencia Causal', 'Inmunidad Conceptual'],
  'Borrado de Existencia': ['Resistencia al Borrado', 'Regeneración Conceptual'],
  'Hakai': ['Resistencia al Hakai', 'Poder Divino Superior', 'Inmortalidad Conceptual'],
  'Expansión de Dominio': ['Dominio Simple', 'Dominio sin Barrera', 'Infinito', 'Restricción Celestial 0', 'Escalera de Jacob'],
  'Infinito': ['Inversión del Infinito', 'Lanza Invertida del Cielo', 'Corte Espacial del Mundo', 'Giro Infinito', 'Espada Nirvana Cero'],
  'Ojos del Señor': ['Sobrecarga Neuronal', 'Ataques sin Alma', 'Chaos'],
  'Goma Bungee': ['Corte de Energía Cortante', 'Vaporización Térmica', 'Restricción de Zetsu']
};

function getHaxCounters(attackerHax, defenderHax) {
  const counters = [];
  for (const atkHax of (attackerHax || [])) {
    const counterList = HAX_COUNTER_MAP[atkHax] || [];
    const counterFound = (defenderHax || []).find(defHax =>
      counterList.some(c => defHax.toLowerCase().includes(c.toLowerCase()))
    );
    if (counterFound) counters.push({ attack: atkHax, counter: counterFound });
  }
  return counters;
}

function polarToCartesian(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildPolygonPath(stats, maxR, cx, cy) {
  const step = 360 / stats.length;
  return stats.map((v, i) => {
    const r = (v / 100) * maxR;
    const pt = polarToCartesian(cx, cy, r, i * step);
    return `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }).join(' ') + ' Z';
}

function computeEffectiveStats(character, selectedFormId) {
  if (!character) return null;
  const isRaichi = character.id === 'dr-raichi-dbm-u3';
  const forms = getBodilyForms(character);
  const effectiveFormId = (isRaichi && selectedFormId === 'ghost-broly-unleashed')
    ? (forms[0]?.id || 'base')
    : selectedFormId;
  const combatState = resolveCombatState(character, effectiveFormId);
  const scaled = calculateFormScaledStats(character, effectiveFormId);
  const form = forms.find(f => f.id === effectiveFormId) || forms[0] || { id: 'base', name: 'Forma Base', stats: character.tier };
  
  const effectiveTier = combatState.tierExact || scaled.currentTier || character.tier;
  const baseScore = parseTierScore(effectiveTier);

  let multiplierBonus = 0;
  if (combatState.formMultiplier > 1) {
    multiplierBonus = Math.min(30, Math.round(Math.log2(combatState.formMultiplier) * 2.8));
  } else {
    const formStatsStr = form.stats || '';
    if (/x([0-9]+)/i.test(formStatsStr)) {
      const m = parseInt(formStatsStr.match(/x([0-9]+)/i)[1], 10);
      multiplierBonus = Math.min(30, Math.round(Math.log2(m) * 2.8));
    }
  }

  const effectiveScore = Math.min(150, baseScore + multiplierBonus);

  const rawSpeed = typeof character.speed === 'object' ? (character.speed.combat || '') : (character.speed || '');
  let effectiveSpeedScore = parseSpeedScore(rawSpeed);
  const formStatsStr = form.stats || '';
  if (formStatsStr.toLowerCase().includes('velocidad') || formStatsStr.toLowerCase().includes('mftl') || formStatsStr.toLowerCase().includes('godspeed') || formStatsStr.toLowerCase().includes('tiempo 0')) {
    effectiveSpeedScore = Math.min(100, effectiveSpeedScore + 12);
  }

  let apScore = Math.min(98, Math.max(5, Math.round(effectiveScore * 0.65)));
  if (character.ap?.toLowerCase().includes('inconmensurable') || character.ap?.toLowerCase().includes('outerversal')) apScore = 98;

  let durScore = Math.min(98, Math.max(5, Math.round(effectiveScore * 0.63)));
  if (character.durability?.toLowerCase().includes('inmortal') || character.durability?.toLowerCase().includes('invulnerabilidad')) durScore = 96;

  const haxCount = character.haxTags?.length || 0;
  const haxScore = Math.min(98, haxCount * 10 + 25);

  let biqScore = 50;
  const biqText = (character.battleIQ || '').toLowerCase();
  if (biqText.includes('genio') || biqText.includes('maestro') || biqText.includes('absoluto') || biqText.includes('omnisciente') || biqText.includes('trascendente')) biqScore = 95;
  else if (biqText.includes('alto') || biqText.includes('veterano') || biqText.includes('experto')) biqScore = 80;
  else if (biqText.includes('medio') || biqText.includes('normal')) biqScore = 60;

  let rangeScore = 30;
  const rangeText = (character.range || '').toLowerCase();
  if (rangeText.includes('multiversal') || rangeText.includes('universal') || rangeText.includes('dimensional') || rangeText.includes('cósmic')) rangeScore = 95;
  else if (rangeText.includes('planetario') || rangeText.includes('estelar') || rangeText.includes('galact')) rangeScore = 80;
  else if (rangeText.includes('kilómetros') || rangeText.includes('km') || rangeText.includes('ciudad') || rangeText.includes('continental')) rangeScore = 60;
  else if (rangeText.includes('cuerpo a cuerpo') || rangeText.includes('metros')) rangeScore = 35;

  return {
    form,
    effectiveTier,
    effectiveScore,
    stats: [apScore, effectiveSpeedScore, durScore, haxScore, biqScore, rangeScore],
    speedDisplay: rawSpeed || 'Nivel Canónico',
    haxCount,
    multiplierBonus,
    scaled,
    combatState
  };
}

// Interactive Character Selector Dropdown / Search Modal Component
function CharacterSearchSelector({ characters = [], value, onChange, label, color = 'cyan' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState('all');

  const charList = Array.isArray(characters) ? characters : [];
  const franchiseList = useMemo(() => getFranchiseCategoriesList(charList), [charList]);

  const filteredCharacters = useMemo(() => {
    let pool = charList;
    if (selectedFranchise !== 'all') {
      const g = franchiseList.find(gr => gr.id === selectedFranchise);
      if (g && Array.isArray(g.characters)) pool = g.characters;
    }
    if (!search.trim()) return pool;
    const q = search.toLowerCase();
    return pool.filter(c => 
      c?.name?.toLowerCase().includes(q) ||
      (c?.alias || '').toLowerCase().includes(q) ||
      (c?.universe || '').toLowerCase().includes(q) ||
      (c?.saga || '').toLowerCase().includes(q) ||
      (c?.tier || '').toLowerCase().includes(q)
    );
  }, [charList, franchiseList, selectedFranchise, search]);

  const selectedChar = charList.find(c => c?.id === value);

  return (
    <div className="relative">
      {label && <label className={`text-[10px] font-bold text-${color}-400 mb-1 block`}>{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-900 border border-slate-700 hover:border-${color}-500/80 rounded-xl p-2 text-left flex items-center justify-between text-white font-bold text-xs transition cursor-pointer shadow-sm`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedChar?.avatar ? (
            <img src={selectedChar.avatar} alt="" className="w-5 h-5 rounded-full object-cover border border-slate-700" />
          ) : (
            <span className={`w-2.5 h-2.5 rounded-full bg-${color}-500`} />
          )}
          <span className="truncate">{selectedChar?.name || 'Seleccionar Luchador...'}</span>
          <span className="text-[10px] text-slate-400 font-normal truncate">({selectedChar?.saga || selectedChar?.universe})</span>
        </div>
        <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 shadow-2xl space-y-2 backdrop-blur-xl max-h-[380px] flex flex-col">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre, universo, saga o tier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              autoFocus
            />
          </div>

          {/* Franchise Filter Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar text-[9.5px]">
            <button
              type="button"
              onClick={() => setSelectedFranchise('all')}
              className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap cursor-pointer transition ${
                selectedFranchise === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              🌐 Todos ({charList.length})
            </button>
            {franchiseList.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedFranchise(g.id)}
                className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap cursor-pointer transition ${
                  selectedFranchise === g.id ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {g.label.split('(')[0]} ({g.characters.length})
              </button>
            ))}
          </div>

          {/* Character List */}
          <div className="overflow-y-auto space-y-1 flex-1 pr-1 custom-scrollbar max-h-[220px]">
            {filteredCharacters.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c);
                  setIsOpen(false);
                }}
                className={`w-full p-1.5 rounded-lg text-left flex items-center justify-between text-xs transition cursor-pointer ${
                  c.id === value ? 'bg-cyan-950/80 border border-cyan-500/80 text-cyan-200' : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {c.avatar ? (
                    <img src={c.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                  )}
                  <div className="truncate">
                    <span className="font-bold block truncate">{c.name}</span>
                    <span className="text-[9px] text-slate-400 truncate block">{c.saga || c.universe}</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 flex-shrink-0">
                  {c.tier?.split('|')[0] || c.tier}
                </span>
              </button>
            ))}
            {filteredCharacters.length === 0 && (
              <p className="text-[10px] text-slate-500 text-center py-4">No se encontraron luchadores</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Single Fighter Config Sub-Panel (with form selector, limiters, and live stats)
function FighterCardConfig({ 
  character, 
  onCharacterChange, 
  allCharacters, 
  selectedFormId, 
  onFormChange, 
  formLimit, 
  onFormLimitChange,
  color = 'red',
  title = 'Contendiente'
}) {
  const isRaichi = character?.id === 'dr-raichi-dbm-u3';
  const forms = getBodilyForms(character);
  const effectiveFormId = (isRaichi && selectedFormId === 'ghost-broly-unleashed')
    ? (forms[0]?.id || 'base')
    : selectedFormId;
  const allowedForms = formLimit !== null && formLimit !== undefined ? forms.slice(0, formLimit + 1) : forms;
  const effectiveForm = allowedForms.find(f => f.id === effectiveFormId) || allowedForms[0] || { id: 'base', name: 'Forma Base' };
  const eff = computeEffectiveStats(character, effectiveForm.id);

  return (
    <div className={`p-3.5 rounded-2xl bg-${color}-950/20 border border-${color}-800/50 space-y-2.5 shadow-lg`}>
      <div className="flex items-center justify-between">
        <label className={`text-${color}-400 font-bold flex items-center gap-1.5 text-xs font-cinzel`}>
          <span className={`w-2.5 h-2.5 rounded-full bg-${color}-500 animate-pulse`} /> {title}
        </label>
        <span className={`text-[10px] text-${color}-300 font-bold bg-${color}-950/80 px-2 py-0.5 rounded border border-${color}-700`}>
          {eff?.effectiveTier || character?.tier}
        </span>
      </div>

      <CharacterSearchSelector
        characters={allCharacters}
        value={character?.id}
        onChange={onCharacterChange}
        color={color}
      />

      {forms.length > 0 && (
        <div className={`pt-2 border-t border-${color}-900/40 space-y-1.5`}>
          <label className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" /> Forma / Transformación Activa:
          </label>
          <select
            value={effectiveForm.id}
            onChange={e => onFormChange(e.target.value)}
            className="w-full bg-slate-950 border border-amber-500/50 rounded-lg p-1.5 text-amber-300 font-bold text-xs cursor-pointer outline-none"
          >
            {allowedForms.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {effectiveForm.stats && (
            <p className="text-[9px] text-amber-300/90 italic px-1">
              ⚡ {typeof effectiveForm.stats === 'object'
                ? (effectiveForm.stats.ap || effectiveForm.stats.tier || Object.values(effectiveForm.stats).join(' | '))
                : effectiveForm.stats}
            </p>
          )}

          {forms.length > 1 && (
            <div className="pt-1.5 border-t border-slate-800 space-y-1">
              <label className="text-[9px] text-rose-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Condición: Límite de Transformación
              </label>
              <select
                value={formLimit ?? forms.length - 1}
                onChange={e => onFormLimitChange(e.target.value === 'none' ? null : parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-rose-700/50 rounded-lg p-1 text-rose-200 text-[10px] cursor-pointer outline-none"
              >
                <option value="none">🔓 Sin límite (hasta 100% de formas)</option>
                {forms.map((f, idx) => (
                  <option key={f.id} value={idx}>🔒 Tope en: {f.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Mini Stat Badges */}
      <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-300 pt-1">
        <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
          <span className="text-slate-400 block text-[8px]">AP Tier:</span>
          <span className="font-bold text-amber-400 truncate block">{eff?.effectiveTier?.split('|')[0] || 'Tier 7'}</span>
        </div>
        <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
          <span className="text-slate-400 block text-[8px]">Velocidad:</span>
          <span className="font-bold text-cyan-400 truncate block">{eff?.speedDisplay || 'Mach 5'}</span>
        </div>
        <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
          <span className="text-slate-400 block text-[8px]">Hax Total:</span>
          <span className="font-bold text-purple-400 block">{character?.haxTags?.length || 0} Hax</span>
        </div>
      </div>
    </div>
  );
}

function ScouterBattleHUD({ characterA, formAId, characterB, formBId }) {
  const [isScanning, setIsScanning] = useState(false);

  const combatStateA = useMemo(() => resolveCombatState(characterA, formAId), [characterA, formAId]);
  const combatStateB = useMemo(() => resolveCombatState(characterB, formBId), [characterB, formBId]);

  const breakdownA = useMemo(() => getPowerLevelFormulaBreakdown(characterA, formAId), [characterA, formAId]);
  const breakdownB = useMemo(() => getPowerLevelFormulaBreakdown(characterB, formBId), [characterB, formBId]);

  const scouterA = useMemo(() => calculateScouterReading(characterA, formAId), [characterA, formAId]);
  const scouterB = useMemo(() => calculateScouterReading(characterB, formBId), [characterB, formBId]);

  const handleScan = () => {
    setIsScanning(true);

    if (breakdownA?.isOverload || breakdownB?.isOverload) {
      SoundFX.playScouterExplosion();
    } else {
      SoundFX.playScouterBeep(8);
    }

    setTimeout(() => {
      setIsScanning(false);
    }, 450);
  };

  // Comparación Invariante y Monotónica APEX basada en combatState
  const keyA = combatStateA?.powerKey || breakdownA?.apexKiRaw || 1;
  const keyB = combatStateB?.powerKey || breakdownB?.apexKiRaw || 1;
  const isALeading = keyA >= keyB;
  const leaderName = isALeading ? characterA?.name : characterB?.name;

  const ratio = useMemo(() => {
    if (keyA <= 0 || keyB <= 0) return '1.0x';
    const rawRatio = keyA >= keyB ? keyA / Math.max(1, keyB) : keyB / Math.max(1, keyA);
    if (rawRatio >= 1e9) return '> 1.000.000.000x (Abismo Cósmico)';
    if (rawRatio >= 1e6) return (rawRatio / 1e6).toFixed(1) + 'M x';
    if (rawRatio >= 1e3) return (rawRatio / 1e3).toFixed(1) + 'k x';
    return rawRatio.toFixed(1) + 'x';
  }, [keyA, keyB]);

  const totalPower = keyA + keyB;
  const pctA = Math.min(98, Math.max(2, Math.round((keyA / totalPower) * 100)));
  const pctB = 100 - pctA;

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.15)] space-y-3 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base animate-pulse">⚡</span>
          <div>
            <h4 className="font-bold text-indigo-300 uppercase tracking-wider font-cinzel text-xs flex items-center gap-2">
              Telemetría Comparativa de Ki & APEX Energy
              {isScanning && <span className="text-red-400 text-[10px] animate-ping font-mono">ESCANEO ACTIVO...</span>}
            </h4>
            <p className="text-[10px] text-slate-400">
              Escala Universal Dual: APEX-Ki Monotónico (Cross-Verse) + Scouter Ki Canónico Oficial (Dragon Ball)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleScan}
          className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-500/40 border border-emerald-400 text-emerald-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)] self-start sm:self-auto select-none"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
          <span>Escanear Ki (Sonido Scouter)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Contendiente A */}
        <div className="p-3 rounded-xl border bg-slate-950/80 border-red-500/40 text-slate-200 space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-bold text-red-400 truncate">{characterA?.name}</span>
            <div className="flex items-center gap-1">
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 border border-red-800/60 text-red-300 font-bold">
                {combatStateA.tierExact || characterA.tier}
              </span>
              {combatStateA.formMultiplier > 1 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800/60 text-amber-300 font-bold">
                  {combatStateA.multiplierDisplay}
                </span>
              )}
            </div>
          </div>

          {/* APEX-Ki Badge */}
          <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <span className="text-[8.5px] text-indigo-300 uppercase font-bold block">APEX-Ki Universal:</span>
              <span className="text-base font-black font-cinzel text-white">
                {isScanning ? '888,888...' : combatStateA.apexKiDisplay}
              </span>
            </div>
            <span className="text-[8px] px-1 rounded bg-indigo-900/60 text-indigo-200 font-bold">CROSS-VERSE</span>
          </div>

          {/* Scouter Ki Canónico (si aplica) */}
          {(combatStateA.sourceKiDisplay || scouterA.formatted) && (
            <div className="p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-[9.5px]">
              <span className="text-emerald-400 font-bold">📟 Scouter Ki:</span>
              <span className="text-emerald-300 font-bold font-cinzel">
                {combatStateA.sourceKiDisplay || scouterA.formatted}
              </span>
            </div>
          )}

          {/* Physical vs Hax Tiers */}
          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
            <div className="p-1 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[8px]">Físico:</span>
              <span className="text-red-300 font-bold">{characterA.physicalTier || characterA.tier}</span>
            </div>
            <div className="p-1 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[8px]">Hax:</span>
              <span className="text-purple-300 font-bold">{characterA.haxTier || characterA.tier}</span>
            </div>
          </div>
        </div>

        {/* Contendiente B */}
        <div className="p-3 rounded-xl border bg-slate-950/80 border-blue-500/40 text-slate-200 space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-bold text-blue-400 truncate">{characterB?.name}</span>
            <div className="flex items-center gap-1">
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800/60 text-blue-300 font-bold">
                {combatStateB.tierExact || characterB.tier}
              </span>
              {combatStateB.formMultiplier > 1 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800/60 text-amber-300 font-bold">
                  {combatStateB.multiplierDisplay}
                </span>
              )}
            </div>
          </div>

          {/* APEX-Ki Badge */}
          <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <span className="text-[8.5px] text-indigo-300 uppercase font-bold block">APEX-Ki Universal:</span>
              <span className="text-base font-black font-cinzel text-white">
                {isScanning ? '888,888...' : combatStateB.apexKiDisplay}
              </span>
            </div>
            <span className="text-[8px] px-1 rounded bg-indigo-900/60 text-indigo-200 font-bold">CROSS-VERSE</span>
          </div>

          {/* Scouter Ki Canónico (si aplica) */}
          {(combatStateB.sourceKiDisplay || scouterB.formatted) && (
            <div className="p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-[9.5px]">
              <span className="text-emerald-400 font-bold">📟 Scouter Ki:</span>
              <span className="text-emerald-300 font-bold font-cinzel">
                {combatStateB.sourceKiDisplay || scouterB.formatted}
              </span>
            </div>
          )}

          {/* Physical vs Hax Tiers */}
          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
            <div className="p-1 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[8px]">Físico:</span>
              <span className="text-blue-300 font-bold">{characterB.physicalTier || characterB.tier}</span>
            </div>
            <div className="p-1 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[8px]">Hax:</span>
              <span className="text-purple-300 font-bold">{characterB.haxTier || characterB.tier}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra Dinámica de Dominio Cósmico (Tug-of-War Bar) */}
      <div className="p-2.5 rounded-xl bg-slate-950 border border-indigo-900/50 space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-red-400">{characterA?.name} ({pctA}%)</span>
          <span className="text-indigo-300 uppercase text-[9px]">⚡ Balance de Fuerza Cósmica ⚡</span>
          <span className="text-blue-400">{characterB?.name} ({pctB}%)</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden bg-slate-900 border border-slate-800 flex">
          <div className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-700" style={{ width: `${pctA}%` }} />
          <div className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 transition-all duration-700" style={{ width: `${pctB}%` }} />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[9.5px] text-slate-300">
          <div>
            <span className="text-amber-400 font-bold">Ventaja APEX-Ki: </span>
            <span className="text-white font-bold">{leaderName}</span> lidera con factor de <span className="text-emerald-300 font-bold">{ratio}</span>.
          </div>
          <div className="text-slate-400 text-[9px] italic">
            {ratio === '1.0x' || ratio.includes('1.')
              ? '⚔️ Paridad absoluta de energía. El combate se decidirá por Battle IQ y Hax.'
              : ratio.includes('Abismo Cósmico') || ratio.includes('INCONMENSURABLE')
              ? '💀 Disparidad dimensional extrema. Los ataques físicos ordinarios serán repelidos por aura pura.'
              : '🔥 Superioridad cinética notable. Riesgo inminente de Blitz si no se despliega Hax defensivo.'}
          </div>
        </div>
      </div>

      {/* Botón y Panel Desplegable: Fórmula Matemática Universal */}
      <div className="pt-1">
        <details className="group border border-emerald-900/40 rounded-xl bg-slate-950/60 overflow-hidden">
          <summary className="px-3 py-2 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center justify-between transition select-none">
            <span className="flex items-center gap-1.5">
              <span>📐</span>
              <span>Ver Ecuación y Desglose Matemático de Power Scaling (Fórmula Universal APEX)</span>
            </span>
            <span className="text-slate-500 group-open:rotate-90 transition-transform">▶</span>
          </summary>
          
          <div className="p-3 border-t border-emerald-950 space-y-2 text-[10px] text-slate-300 bg-slate-950">
            <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-mono space-y-1">
              <span className="font-bold block text-[11px] text-emerald-200">Ecuación Maestra Invariante de Power Scaling:</span>
              <code>PL_APEX = B^R(T) × [Q_min + (Q_max - Q_min) · q]</code>
              <div className="text-[9px] text-slate-400">
                Donde B=10⁶, R(T) es el índice exacto del sub-tier, y q es la calidad interna [0.62·AP + 0.12·Vel + 0.12·Def + 0.06·Forma + 0.05·IQ + 0.03·Hax].
              </div>
            </div>

            {/* Desglose Luchador A */}
            {(() => {
              const bA = getPowerLevelFormulaBreakdown(characterA, formAId);
              const bB = getPowerLevelFormulaBreakdown(characterB, formBId);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono">
                  {bA && (
                    <div className="p-2 rounded-lg bg-slate-900 border border-red-900/40 space-y-1">
                      <span className="text-red-400 font-bold block">{characterA?.name} ({bA.activeFormName})</span>
                      <p className="text-[9px] text-slate-400">• Base Tier: {bA.tier} ({bA.baseEnergyValue === Infinity ? 'Infinito' : bA.baseEnergyValue.toLocaleString()} Ki)</p>
                      <p className="text-[9px] text-slate-400">• Modificador Velocidad: {bA.speedLabel}</p>
                      <p className="text-[9px] text-slate-400">• Modificador Durabilidad: {bA.durabilityLabel}</p>
                      <p className="text-[9px] text-slate-400">• Modificador Hax/IQ: {bA.haxBiqLabel}</p>
                      <p className="text-[9px] text-slate-400">• Multiplicador Forma: {bA.formLabel}</p>
                      <p className="text-[9.5px] text-amber-300 font-bold pt-0.5">📟 Similar Canónico: {bA.closestDbComparison}</p>
                    </div>
                  )}

                  {bB && (
                    <div className="p-2 rounded-lg bg-slate-900 border border-blue-900/40 space-y-1">
                      <span className="text-blue-400 font-bold block">{characterB?.name} ({bB.activeFormName})</span>
                      <p className="text-[9px] text-slate-400">• Base Tier: {bB.tier} ({bB.baseEnergyValue === Infinity ? 'Infinito' : bB.baseEnergyValue.toLocaleString()} Ki)</p>
                      <p className="text-[9px] text-slate-400">• Modificador Velocidad: {bB.speedLabel}</p>
                      <p className="text-[9px] text-slate-400">• Modificador Durabilidad: {bB.durabilityLabel}</p>
                      <p className="text-[9px] text-slate-400">• Modificador Hax/IQ: {bB.haxBiqLabel}</p>
                      <p className="text-[9px] text-slate-400">• Multiplicador Forma: {bB.formLabel}</p>
                      <p className="text-[9.5px] text-amber-300 font-bold pt-0.5">📟 Similar Canónico: {bB.closestDbComparison}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </details>
      </div>
    </div>
  );
}

export default function StatComparatorModal({ 
  isOpen, 
  onClose, 
  characters = [], 
  initialCharA, 
  initialCharB,
  initialMatchMode = '1v1',
  teamA: teamAProp = [],
  teamB: teamBProp = [],
  battleRoyale: bRoyaleProp = [],
  lang = 'es'
}) {
  const [matchMode, setMatchMode] = useState(initialMatchMode || '1v1');
  const [selectedA, setSelectedA] = useState(initialCharA || characters[0]);
  const [selectedB, setSelectedB] = useState(initialCharB || characters[1] || characters[0]);
  const [selectedFormAId, setSelectedFormAId] = useState(initialCharA?.forms?.[0]?.id || 'base');
  const [selectedFormBId, setSelectedFormBId] = useState(initialCharB?.forms?.[0]?.id || 'base');
  const [formLimitA, setFormLimitA] = useState(null);
  const [formLimitB, setFormLimitB] = useState(null);

  // Teams and Multimodal States with Form configuration maps
  const [localTeamA, setLocalTeamA] = useState(teamAProp.length > 0 ? teamAProp : (initialCharA ? [initialCharA] : [characters[0]]));
  const [localTeamB, setLocalTeamB] = useState(teamBProp.length > 0 ? teamBProp : (initialCharB ? [initialCharB] : [characters[1] || characters[0]]));
  const [teamAForms, setTeamAForms] = useState({});
  const [teamBForms, setTeamBForms] = useState({});

  const [localBR, setLocalBR] = useState(bRoyaleProp.length > 0 ? bRoyaleProp : [initialCharA, initialCharB, characters[2], characters[3]].filter(Boolean));
  const [brForms, setBrForms] = useState({});

  const [simResults, setSimResults] = useState(null);
  const [isSimulating100, setIsSimulating100] = useState(false);

  // 1v1 computations
  const effA = computeEffectiveStats(selectedA, selectedFormAId) || { effectiveScore: 50, stats: [50,50,50,50,50,50], form: { name: 'Base' }, speedDisplay: 'Mach' };
  const effB = computeEffectiveStats(selectedB, selectedFormBId) || { effectiveScore: 50, stats: [50,50,50,50,50,50], form: { name: 'Base' }, speedDisplay: 'Mach' };

  const statsA = effA.stats;
  const statsB = effB.stats;
  const statLabels = ['AP (Potencia)', 'Velocidad', 'Durabilidad', 'Hax & Trucos', 'Battle IQ', 'Rango'];
  const statIcons = ['⚡', '💨', '🛡️', '✨', '🧠', '🎯'];

  const advantages = statsA.map((va, i) => {
    const diff = va - statsB[i];
    if (Math.abs(diff) <= 3) return 'tie';
    return diff > 0 ? 'A' : 'B';
  });

  const tierDiff = effA.effectiveScore - effB.effectiveScore;
  const tierGapLabel = Math.abs(tierDiff) === 0 ? 'Mismo Nivel Exacto'
    : Math.abs(tierDiff) <= 8 ? 'Diferencia Mínima'
    : Math.abs(tierDiff) <= 20 ? 'Ventaja Notable'
    : Math.abs(tierDiff) <= 45 ? 'Diferencia Crítica'
    : 'Tier-Stomp Brutal';
  const tierLeader = tierDiff > 0 ? `${selectedA.name} (${effA.form.name})` : tierDiff < 0 ? `${selectedB.name} (${effB.form.name})` : 'Empatados';

  const haxCountersAvsB = getHaxCounters(selectedA.haxTags, selectedB.haxTags);
  const haxCountersBvsA = getHaxCounters(selectedB.haxTags, selectedA.haxTags);
  const haxAdvA = (effA.haxCount - effB.haxCount) * 2;
  const speedAdv = (statsA[1] - statsB[1]) * 0.3;
  const probA = Math.min(98, Math.max(2, Math.round(50 + tierDiff * 0.55 + haxAdvA + speedAdv)));
  const probB = 100 - probA;

  // Boss Raid mode computations
  const raidBoss = selectedA;
  const raidSquad = localTeamB.length > 0 ? localTeamB : [selectedB];
  const bossScore = effA.effectiveScore * 1.35;
  const squadCombinedScore = raidSquad.reduce((acc, c) => {
    const cFormId = teamBForms[c.id] || getBodilyForms(c)[0]?.id || 'base';
    const cEff = computeEffectiveStats(c, cFormId);
    return acc + (cEff.effectiveScore * 0.7);
  }, 0) + (raidSquad.length * 6);
  const bossDiff = bossScore - squadCombinedScore;
  const bossProb = Math.min(95, Math.max(5, Math.round(50 + bossDiff * 0.45)));
  const squadProb = 100 - bossProb;

  // Teams mode computations
  const currentTeamA = localTeamA.length > 0 ? localTeamA : [selectedA];
  const currentTeamB = localTeamB.length > 0 ? localTeamB : [selectedB];
  const teamScoreA = currentTeamA.reduce((acc, c) => {
    const fId = teamAForms[c.id] || getBodilyForms(c)[0]?.id || 'base';
    return acc + (computeEffectiveStats(c, fId)?.effectiveScore || 50);
  }, 0) + (currentTeamA.length * 4);
  const teamScoreB = currentTeamB.reduce((acc, c) => {
    const fId = teamBForms[c.id] || getBodilyForms(c)[0]?.id || 'base';
    return acc + (computeEffectiveStats(c, fId)?.effectiveScore || 50);
  }, 0) + (currentTeamB.length * 4);
  const teamDiff = teamScoreA - teamScoreB;
  const teamProbA = Math.min(95, Math.max(5, Math.round(50 + teamDiff * 0.5)));
  const teamProbB = 100 - teamProbA;

  // Battle Royale FFA computations
  const currentBr = localBR.length >= 2 ? localBR : [selectedA, selectedB, characters[2] || characters[0], characters[3] || characters[0]].filter(Boolean);
  const brRankings = useMemo(() => {
    const scores = currentBr.map(c => {
      const fId = brForms[c.id] || getBodilyForms(c)[0]?.id || 'base';
      const eff = computeEffectiveStats(c, fId);
      return {
        ...c,
        form: eff?.form,
        score: eff?.effectiveScore || 50,
        effTier: eff?.effectiveTier || c.tier
      };
    });
    const totalScore = scores.reduce((acc, c) => acc + c.score, 0);
    return scores.map(c => ({
      ...c,
      winOdds: totalScore > 0 ? Math.round((c.score / totalScore) * 100) : 25,
      threat: c.score > 90 ? 'AMENAZA SUPREMA' : c.score > 60 ? 'ALTO PELIGRO' : 'SUPERVIVIENTE TÁCTICO'
    })).sort((a, b) => b.score - a.score);
  }, [currentBr, brForms]);

  const run100Simulations = () => {
    setIsSimulating100(true);
    setTimeout(() => {
      let winsA = 0, winsB = 0, draws = 0;
      const targetProb = matchMode === '1vN' ? bossProb : matchMode === 'teams' ? teamProbA : probA;
      for (let i = 0; i < 100; i++) {
        const variance = Math.random() * 18 - 9;
        const roll = Math.random() * 100;
        const adjProb = Math.min(98, Math.max(2, targetProb + variance * 0.3));
        if (roll < adjProb - 2) winsA++;
        else if (roll > adjProb + 2) winsB++;
        else draws++;
      }
      setSimResults({ winsA, winsB, draws });
      setIsSimulating100(false);
    }, 450);
  };

  if (!isOpen || !selectedA) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-950 border border-slate-700/80 rounded-2xl p-4 sm:p-6 max-w-6xl w-full max-h-[94vh] overflow-y-auto space-y-4 shadow-[0_0_60px_rgba(0,0,0,0.95)] font-mono text-xs custom-scrollbar">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase font-cinzel tracking-wider">
                ⚖️ Comparador APEX — Motor de Power Scaling Multimodal
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Análisis táctico con escalado cinético (VS Battles Wiki), multiplicadores de formas, Boss Raid y Battle Royale
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => { setMatchMode('1v1'); setSimResults(null); }}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                matchMode === '1v1' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" /> 1v1 Duelo
            </button>
            <button
              type="button"
              onClick={() => { setMatchMode('1vN'); setSimResults(null); }}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                matchMode === '1vN' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Skull className="w-3.5 h-3.5" /> Boss Raid
            </button>
            <button
              type="button"
              onClick={() => { setMatchMode('teams'); setSimResults(null); }}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                matchMode === 'teams' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Guerra de Equipos
            </button>
            <button
              type="button"
              onClick={() => { setMatchMode('battle_royale'); setSimResults(null); }}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                matchMode === 'battle_royale' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5" /> Battle Royale
            </button>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer self-end sm:self-auto"><X className="w-5 h-5" /></button>
        </div>

        {/* ─── 1. MODE: 1v1 DUEL ───────────────────────────────────────────────────────────── */}
        {matchMode === '1v1' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FighterCardConfig
                character={selectedA}
                onCharacterChange={c => { setSelectedA(c); setSelectedFormAId(getBodilyForms(c)[0]?.id || 'base'); setSimResults(null); }}
                allCharacters={characters}
                selectedFormId={selectedFormAId}
                onFormChange={fId => { setSelectedFormAId(fId); setSimResults(null); }}
                formLimit={formLimitA}
                onFormLimitChange={lim => { setFormLimitA(lim); setSimResults(null); }}
                color="red"
                title="🔴 Contendiente A (Rojo)"
              />
              <FighterCardConfig
                character={selectedB}
                onCharacterChange={c => { setSelectedB(c); setSelectedFormBId(getBodilyForms(c)[0]?.id || 'base'); setSimResults(null); }}
                allCharacters={characters}
                selectedFormId={selectedFormBId}
                onFormChange={fId => { setSelectedFormBId(fId); setSimResults(null); }}
                formLimit={formLimitB}
                onFormLimitChange={lim => { setFormLimitB(lim); setSimResults(null); }}
                color="blue"
                title="🔵 Contendiente B (Azul)"
              />
            </div>

            {/* Scouter Ki Measurement HUD */}
            <ScouterBattleHUD
              characterA={selectedA}
              formAId={selectedFormAId}
              characterB={selectedB}
              formBId={selectedFormBId}
            />

            {/* Tier Gap Banner */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
              Math.abs(tierDiff) > 40 ? 'bg-red-950/40 border-red-700/50 text-red-300'
              : Math.abs(tierDiff) > 20 ? 'bg-orange-950/40 border-orange-700/50 text-orange-300'
              : Math.abs(tierDiff) > 8 ? 'bg-yellow-950/40 border-yellow-700/50 text-yellow-300'
              : 'bg-slate-900/60 border-slate-700 text-slate-300'
            }`}>
              <span>📊 Brecha de Poder: <span className="text-white">{tierGapLabel}</span></span>
              <span className="truncate max-w-[280px]">Ventaja Global: <span className="text-white">{tierLeader}</span></span>
              <span className="text-slate-400">Δ {Math.abs(tierDiff)} pts</span>
            </div>

            {/* Radar + Probability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">📊 Radar Comparativo (6 Ejes con Formas)</span>
                <div className="relative w-64 h-64">
                  <svg viewBox="0 0 240 240" className="w-full h-full">
                    {[20,40,60,80,100].map(r => (
                      <circle key={r} cx="120" cy="120" r={r} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray={r===100?'0':'2,2'} />
                    ))}
                    {statLabels.map((lbl, i) => {
                      const pt = polarToCartesian(120, 120, 100, i * 60);
                      const tp = polarToCartesian(120, 120, 120, i * 60);
                      return (
                        <g key={i}>
                          <line x1="120" y1="120" x2={pt.x} y2={pt.y} stroke="#334155" strokeWidth="1" />
                          <text x={tp.x} y={tp.y+4}
                            fill={advantages[i]==='A'?'#f87171':advantages[i]==='B'?'#60a5fa':'#94a3b8'}
                            fontSize="7.5" fontWeight="bold" textAnchor="middle">
                            {statIcons[i]} {lbl}
                          </text>
                        </g>
                      );
                    })}
                    <path d={buildPolygonPath(statsA, 100, 120, 120)} fill="rgba(239,68,68,0.3)" stroke="#ef4444" strokeWidth="2" />
                    <path d={buildPolygonPath(statsB, 100, 120, 120)} fill="rgba(59,130,246,0.3)" stroke="#3b82f6" strokeWidth="2" />
                  </svg>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold mt-1">
                  <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 bg-red-500 rounded-full inline-block" /> {selectedA.name} ({effA.form.name})</span>
                  <span className="flex items-center gap-1 text-blue-400"><span className="w-2 h-2 bg-blue-500 rounded-full inline-block" /> {selectedB.name} ({effB.form.name})</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2 text-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-bold text-amber-400 uppercase block">⚖️ Probabilidad Teórica de Victoria</span>
                  <div className="flex justify-between text-xs font-bold px-1">
                    <span className="text-red-400">{selectedA.name}: {probA}%</span>
                    <span className="text-blue-400">{selectedB.name}: {probB}%</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden bg-slate-900 border border-slate-800 flex">
                    <div className="bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-700" style={{ width: `${probA}%` }} />
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-700" style={{ width: `${probB}%` }} />
                  </div>
                  <p className="text-[9px] text-slate-500 italic">
                    Ajustado por forma: {effA.effectiveTier} ({effA.form.name}) vs {effB.effectiveTier} ({effB.form.name})
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-purple-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-300 flex items-center gap-1"><BarChart2 className="w-3 h-3" /> Monte Carlo: 100 Encuentros con Varianza</span>
                    <button disabled={isSimulating100} onClick={run100Simulations}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[9px] cursor-pointer flex items-center gap-1 transition">
                      {isSimulating100 ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      <span>Simular 100</span>
                    </button>
                  </div>
                  {simResults ? (
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-[10px]">
                        <span className="text-red-400">{selectedA.name}: {simResults.winsA}V</span>
                        {simResults.draws > 0 && <span className="text-slate-400">{simResults.draws} emp.</span>}
                        <span className="text-blue-400">{selectedB.name}: {simResults.winsB}V</span>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden bg-slate-900 flex">
                        <div className="bg-red-500" style={{ width: `${simResults.winsA}%` }} />
                        <div className="bg-slate-600" style={{ width: `${simResults.draws}%` }} />
                        <div className="bg-blue-500" style={{ width: `${simResults.winsB}%` }} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-[9px] text-slate-400 italic">Incluye multiplicadores de estado, cisne negro y contrapartes de hax.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Hax Matrix with Counter Analysis */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-fuchsia-900/40 space-y-2">
              <div className="flex items-center justify-between font-bold text-xs border-b border-slate-800 pb-1.5">
                <span className="flex items-center gap-1.5 text-fuchsia-400"><Sparkles className="w-4 h-4" /> Arsenal Hax & Análisis de Contrapartes</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-red-400 font-bold">{selectedA.name} ({effA.haxCount} hax):</span>
                  <div className="flex flex-wrap gap-1">
                    {(selectedA.haxTags || []).map((h, i) => {
                      const isCountered = haxCountersBvsA.some(c => c.attack === h);
                      return (
                        <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${
                          isCountered ? 'bg-red-950 border-red-600 text-red-400 line-through opacity-60' : 'bg-red-950/60 border-red-800/60 text-red-200'
                        }`}>✨ {h}</span>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-blue-400 font-bold">{selectedB.name} ({effB.haxCount} hax):</span>
                  <div className="flex flex-wrap gap-1">
                    {(selectedB.haxTags || []).map((h, i) => {
                      const isCountered = haxCountersAvsB.some(c => c.attack === h);
                      return (
                        <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${
                          isCountered ? 'bg-blue-950 border-blue-600 text-blue-400 line-through opacity-60' : 'bg-blue-950/60 border-blue-800/60 text-blue-200'
                        }`}>✨ {h}</span>
                      );
                    })}
                  </div>
                </div>
              </div>
              {(haxCountersAvsB.length > 0 || haxCountersBvsA.length > 0) && (
                <div className="mt-2 p-2 bg-fuchsia-950/30 rounded-lg border border-fuchsia-800/40 space-y-1">
                  <span className="text-[10px] font-bold text-fuchsia-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Contrapartes de Hax detectadas:
                  </span>
                  {haxCountersAvsB.map((c, i) => (
                    <p key={`avb-${i}`} className="text-[9px] text-fuchsia-200">
                      🔴 <strong>{selectedA.name}</strong> tiene <em>{c.attack}</em> → anulado por <strong>{selectedB.name}</strong>: <em>{c.counter}</em>
                    </p>
                  ))}
                  {haxCountersBvsA.map((c, i) => (
                    <p key={`bva-${i}`} className="text-[9px] text-blue-200">
                      🔵 <strong>{selectedB.name}</strong> tiene <em>{c.attack}</em> → anulado por <strong>{selectedA.name}</strong>: <em>{c.counter}</em>
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Per-Axis Detailed Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5" /> Desglose Eje por Eje (Forma Activa)
              </h4>
              {[
                { label: 'Potencia de Ataque (AP)', icon: '⚡', vA: selectedA.ap, vB: selectedB.ap, axisIdx: 0 },
                { label: 'Velocidad de Combate', icon: '💨', vA: effA.speedDisplay, vB: effB.speedDisplay, axisIdx: 1 },
                { label: 'Durabilidad y Defensa', icon: '🛡️', vA: selectedA.durability, vB: selectedB.durability, axisIdx: 2 },
                { label: 'Arsenal Hax & Pasivas', icon: '✨', vA: `${effA.haxCount} habilidades`, vB: `${effB.haxCount} habilidades`, axisIdx: 3 },
                { label: 'Battle IQ / Experiencia', icon: '🧠', vA: selectedA.battleIQ, vB: selectedB.battleIQ, axisIdx: 4 },
                { label: 'Rango de Ataque', icon: '🎯', vA: selectedA.range, vB: selectedB.range, axisIdx: 5 },
              ].map(({ label, icon, vA, vB, axisIdx }, ri) => {
                const valA = statsA[axisIdx];
                const valB = statsB[axisIdx];
                const diff = valA - valB;
                const winner = Math.abs(diff) <= 3 ? 'tie' : diff > 0 ? 'A' : 'B';
                return (
                  <div key={ri} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">{icon} {label}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${
                        winner === 'A' ? 'bg-red-950/60 border-red-700 text-red-300' : winner === 'B' ? 'bg-blue-950/60 border-blue-700 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {winner === 'tie' ? '⚖️ Iguales' : winner === 'A' ? `▲ ${selectedA.name}` : `▼ ${selectedB.name}`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <span className="text-red-300"><span className="font-bold text-red-400">{selectedA.name}:</span> {vA || '—'}</span>
                      <span className="text-blue-300"><span className="font-bold text-blue-400">{selectedB.name}:</span> {vB || '—'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── 2. MODE: BOSS RAID (1vN) ────────────────────────────────────────────────────── */}
        {matchMode === '1vN' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-2">
                <Skull className="w-4 h-4 text-amber-400" /> Modo Asalto: 1 Jefe Supremo vs Escuadrón Cooperativo
              </span>
              <span className="text-[10px] bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded font-bold">
                Multiplicador Raid: x1.35 · Sinergia x{raidSquad.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Boss Config */}
              <FighterCardConfig
                character={raidBoss}
                onCharacterChange={c => { setSelectedA(c); setSelectedFormAId(getBodilyForms(c)[0]?.id || 'base'); }}
                allCharacters={characters}
                selectedFormId={selectedFormAId}
                onFormChange={setSelectedFormAId}
                formLimit={formLimitA}
                onFormLimitChange={setFormLimitA}
                color="red"
                title="👑 JEFE DE RAID (Boss Supremo)"
              />

              {/* Squad Config */}
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-bold flex items-center gap-1.5 font-cinzel">
                    <Users className="w-4 h-4 text-cyan-400" /> ESCUADRÓN ASALTANTE ({raidSquad.length} Guerreros):
                  </span>
                  <span className="text-blue-300 font-bold bg-blue-900/60 px-2 py-0.5 rounded text-[10px] border border-blue-700">
                    Poder Colectivo: {Math.round(squadCombinedScore)} pts
                  </span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {raidSquad.map((c, i) => {
                    const cFormId = teamBForms[c.id] || c.forms?.[0]?.id || 'base';
                    const cEff = computeEffectiveStats(c, cFormId);
                    return (
                      <div key={i} className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5 group">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                            <span className="text-cyan-400">•</span> {c.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-300 text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              {cEff?.effectiveTier?.split('|')[0] || c.tier}
                            </span>
                            {raidSquad.length > 1 && (
                              <button 
                                onClick={() => setLocalTeamB(prev => prev.filter(x => x.id !== c.id))} 
                                className="text-red-400 hover:text-red-300 transition cursor-pointer p-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {getBodilyForms(c).length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-amber-400 font-bold flex-shrink-0">Forma:</span>
                            <select
                              value={cFormId}
                              onChange={e => setTeamBForms(prev => ({ ...prev, [c.id]: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-[10px] text-amber-300 outline-none cursor-pointer"
                            >
                              {getBodilyForms(c).map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {raidSquad.length < 5 && (
                  <CharacterSearchSelector
                    characters={characters.filter(c => !raidSquad.find(s => s.id === c.id) && c.id !== raidBoss.id)}
                    value=""
                    onChange={c => setLocalTeamB(prev => [...prev, c])}
                    label="+ Reclutar Nuevo Asaltante para el Escuadrón"
                    color="blue"
                  />
                )}
              </div>
            </div>

            {/* Scouter Raid Summary */}
            <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">📟 Ki del Boss ({raidBoss.name}):</span>
                <span className="font-bold text-red-400 font-cinzel">
                  {calculateScouterReading(raidBoss, selectedFormAId).formatted}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">⚡ Asaltantes ({raidSquad.length}):</span>
                <span className="font-bold text-blue-300 truncate max-w-[280px]">
                  {raidSquad.map(s => `${s.name.split(' ')[0]} (${calculateScouterReading(s, teamBForms[s.id] || s.forms?.[0]?.id || 'base').formatted})`).join(', ')}
                </span>
              </div>
            </div>

            {/* Boss Raid Odds Banner */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-center">
              <span className="text-[11px] font-bold text-amber-400 uppercase block">⚖️ Probabilidad de Éxito de la Incursión (Raid Viability)</span>
              <div className="flex justify-between text-xs font-bold px-2">
                <span className="text-red-400">Victoria del Jefe ({raidBoss.name}): {bossProb}%</span>
                <span className="text-blue-400">Victoria del Escuadrón: {squadProb}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden bg-slate-950 border border-slate-800 flex">
                <div className="bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-700" style={{ width: `${bossProb}%` }} />
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-700" style={{ width: `${squadProb}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* ─── 3. MODE: TEAMS ──────────────────────────────────────────────────────────────── */}
        {matchMode === 'teams' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Team A */}
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-red-400 font-bold flex items-center gap-1.5 font-cinzel">
                    <Users className="w-4 h-4 text-red-400" /> EQUIPO ALFA ({currentTeamA.length} Combatientes)
                  </span>
                  <span className="text-red-300 font-bold text-[10px] bg-red-950 px-2 py-0.5 rounded border border-red-800">
                    Score: {Math.round(teamScoreA)}
                  </span>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                  {currentTeamA.map((c, i) => {
                    const fId = teamAForms[c.id] || c.forms?.[0]?.id || 'base';
                    const eff = computeEffectiveStats(c, fId);
                    return (
                      <div key={i} className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1 group">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white font-bold">{c.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-red-300 text-[10px]">{eff?.effectiveTier?.split('|')[0]}</span>
                            {currentTeamA.length > 1 && (
                              <button onClick={() => setLocalTeamA(prev => prev.filter(x => x.id !== c.id))} className="text-red-500 hover:text-red-400 cursor-pointer">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        {getBodilyForms(c).length > 0 && (
                          <select
                            value={fId}
                            onChange={e => setTeamAForms(prev => ({ ...prev, [c.id]: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-[10px] text-amber-300 outline-none cursor-pointer"
                          >
                            {getBodilyForms(c).map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
                {currentTeamA.length < 5 && (
                  <CharacterSearchSelector
                    characters={characters.filter(c => !currentTeamA.find(s => s.id === c.id))}
                    value=""
                    onChange={c => setLocalTeamA(prev => [...prev, c])}
                    label="+ Añadir Guerrero a Equipo Alfa"
                    color="red"
                  />
                )}
              </div>

              {/* Team B */}
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 font-bold flex items-center gap-1.5 font-cinzel">
                    <Users className="w-4 h-4 text-blue-400" /> EQUIPO OMEGA ({currentTeamB.length} Combatientes)
                  </span>
                  <span className="text-blue-300 font-bold text-[10px] bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                    Score: {Math.round(teamScoreB)}
                  </span>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                  {currentTeamB.map((c, i) => {
                    const fId = teamBForms[c.id] || getBodilyForms(c)[0]?.id || 'base';
                    const eff = computeEffectiveStats(c, fId);
                    return (
                      <div key={i} className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1 group">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white font-bold">{c.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-300 text-[10px]">{eff?.effectiveTier?.split('|')[0]}</span>
                            {currentTeamB.length > 1 && (
                              <button onClick={() => setLocalTeamB(prev => prev.filter(x => x.id !== c.id))} className="text-red-500 hover:text-red-400 cursor-pointer">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        {getBodilyForms(c).length > 0 && (
                          <select
                            value={fId}
                            onChange={e => setTeamBForms(prev => ({ ...prev, [c.id]: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-[10px] text-amber-300 outline-none cursor-pointer"
                          >
                            {getBodilyForms(c).map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
                {currentTeamB.length < 5 && (
                  <CharacterSearchSelector
                    characters={characters.filter(c => !currentTeamB.find(s => s.id === c.id))}
                    value=""
                    onChange={c => setLocalTeamB(prev => [...prev, c])}
                    label="+ Añadir Guerrero a Equipo Omega"
                    color="blue"
                  />
                )}
              </div>
            </div>

            {/* Team Victory Prob */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-center">
              <span className="text-[11px] font-bold text-purple-300 uppercase block">⚖️ Pronóstico de Guerra de Escuadrones</span>
              <div className="flex justify-between text-xs font-bold px-2">
                <span className="text-red-400">Equipo Alfa: {teamProbA}%</span>
                <span className="text-blue-400">Equipo Omega: {teamProbB}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden bg-slate-950 border border-slate-800 flex">
                <div className="bg-gradient-to-r from-red-600 to-amber-500" style={{ width: `${teamProbA}%` }} />
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${teamProbB}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* ─── 4. MODE: BATTLE ROYALE ──────────────────────────────────────────────────────── */}
        {matchMode === 'battle_royale' && (
          <div className="space-y-4">
            <div className="p-3 bg-red-950/30 border border-red-800/50 rounded-xl flex items-center justify-between">
              <span className="font-bold text-red-300 flex items-center gap-2 font-cinzel">
                <Crown className="w-4 h-4 text-amber-400" /> Matriz de Supervivencia: Todos Contra Todos
              </span>
              <span className="text-[10px] bg-red-900/60 text-red-200 px-2 py-0.5 rounded font-bold">
                {currentBr.length} Gladiadores en Arena
              </span>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
              {brRankings.map((c, idx) => {
                const fId = brForms[c.id] || c.forms?.[0]?.id || 'base';
                return (
                  <div key={c.id} className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 group ${
                    idx === 0 ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : idx === 1 ? 'bg-slate-900/80 border-slate-700'
                    : 'bg-slate-950/60 border-slate-800/80'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        idx === 0 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-xs flex items-center gap-2">
                          {c.name}
                          {currentBr.length > 2 && (
                            <button onClick={() => setLocalBR(prev => prev.filter(x => x.id !== c.id))} className="text-red-500 hover:text-red-400 cursor-pointer">
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {c.universe} · {c.effTier} · <span className="text-emerald-400 font-bold">📟 {calculateScouterReading(c, fId).formatted}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {getBodilyForms(c).length > 0 && (
                        <select
                          value={fId}
                          onChange={e => setBrForms(prev => ({ ...prev, [c.id]: e.target.value }))}
                          className="bg-slate-950 border border-slate-700 rounded p-1 text-[10px] text-amber-300 outline-none cursor-pointer max-w-[140px]"
                        >
                          {getBodilyForms(c).map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      )}
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold border hidden sm:block ${
                        idx === 0 ? 'bg-amber-900/60 border-amber-600 text-amber-200' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {c.threat}
                      </span>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-white text-xs block">{c.winOdds}%</span>
                        <span className="text-[9px] text-slate-500">Prob. Victoria</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {currentBr.length < 8 && (
              <CharacterSearchSelector
                characters={characters.filter(c => !currentBr.find(s => s.id === c.id))}
                value=""
                onChange={c => setLocalBR(prev => [...prev, c])}
                label="+ Añadir Gladiador al Battle Royale (Máx 8)"
                color="purple"
              />
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer font-bold transition">
            Cerrar Comparador
          </button>
        </div>
      </div>
    </div>
  );
}
