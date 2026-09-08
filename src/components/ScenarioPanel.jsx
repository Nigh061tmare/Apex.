import React, { useState, useEffect } from 'react';
import { 
  MapPin, Skull, Clock, Heart, Sliders, Zap, Shield, Globe, 
  Swords, AlertTriangle, Plus, Trash2, Flame, Thermometer, Compass, Sparkles, RefreshCw, FastForward,
  Wand2, Check, Copy
} from 'lucide-react';
import { SCENARIOS } from '../data/scenarios';
import { DYNAMIC_ARENAS, LEGENDARY_ARTIFACTS, RAID_BOSSES_PROFILES } from '../data/arenasArtifactsBosses';
import { SimulationEngine } from '../services/simulationEngine';
import { getTranslation } from '../services/i18n';
import { evaluateInterdimensionalModifiers, DEFAULT_BRIDGE_CONFIG } from '../lib/crossFranchiseBridge';

const STORAGE_KEY_CUSTOM_SCENARIOS = 'apex_custom_scenarios';

export default function ScenarioPanel({ 
  scenario, 
  setScenario, 
  modifiers, 
  setModifiers, 
  charA, 
  charB, 
  aiConfig, 
  matchMode = '1v1', 
  teamA = [], 
  teamB = [], 
  battleRoyale = [],
  lang = 'es'
}) {
  const t = (k) => getTranslation(lang, k);
  const [isGeneratingPremise, setIsGeneratingPremise] = useState(false);
  const [isRefiningPremise, setIsRefiningPremise] = useState(false);
  const [isGeneratingArena, setIsGeneratingArena] = useState(false);
  const [arenaSearch, setArenaSearch] = useState('');
  const [universeFilter, setUniverseFilter] = useState('Todos');
  const [showBridgePanel, setShowBridgePanel] = useState(false);
  const [customScenarios, setCustomScenarios] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_SCENARIOS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCreatingArena, setIsCreatingArena] = useState(false);
  const [newArena, setNewArena] = useState({
    name: '',
    universe: '',
    sensory: '',
    gravity: '1G (Tierra Estándar)',
    temperature: 'Templada (22°C)',
    terrainEffect: ''
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_SCENARIOS, JSON.stringify(customScenarios));
    } catch (e) {
      console.error(e);
    }
  }, [customScenarios]);

  // Arenas Legendarias & Dinámicas (compendio arenasArtifactsBosses.js) mapeadas
// al esquema de escenario jugable. Llevan reglas especiales (hazard, tags) que
// se inyectan en la descripción para que el motor de simulación las respete.
const LEGENDARY_ARENA_UNIVERSES = {
  'arena-torneo-del-poder': 'Dragon Ball Super',
  'arena-shibuya-ruinas': 'Jujutsu Kaisen',
  'arena-namek-colapso': 'Dragon Ball Z',
  'arena-camara-del-tiempo': 'Dragon Ball Z',
  'arena-metropolis-evacuacion': 'DC Comics',
  'arena-hueco-mundo': 'Bleach',
  'arena-valhalla-coliseo': 'Shuumatsu no Valkyrie (Record of Ragnarok)',
  'arena-kaioshin-jardin': 'Dragon Ball Super',
  'arena-z-city-colmena': 'One Punch Man',
  'arena-zona-cero-antimonitor': 'DC Comics'
};

const mapDynamicArenaToScenario = (arena) => {
  const tagLines = Object.entries(arena.tagInteractions || {})
    .map(([k, v]) => `• ${k}: ${v}`)
    .join('\n');
  return {
    id: arena.id,
    name: `⚡ ${arena.name}`,
    universe: LEGENDARY_ARENA_UNIVERSES[arena.id] || 'Arenas Legendarias APEX',
    isLegendary: true,
    desc: `${arena.type}. Rango: ${arena.tierRange}. ${arena.modifiers}`,
    sensory: `Condiciones: ${(arena.initialStates || []).join(', ') || 'Estándar'}.`,
    terrainEffect: `REGLAS ESPECIALES DE LA ARENA:\n• ${arena.hazardZone}\n• Riesgo colateral: ${arena.collateralRisk}\nInteracciones por arquetipo:\n${tagLines}\nContra-tags: ${(arena.counterTags || []).join(', ')}`,
    gravity: 'Variable (ver reglas de la arena)',
    temperature: 'Variable',
    civilians: false
  };
};

const legendaryScenarios = DYNAMIC_ARENAS.map(mapDynamicArenaToScenario);

// Artefactos legendarios jugables (se adjuntan a la premisa del combate)
const ARTIFACT_UNIVERSES_LABEL = '🧿 Artefacto Legendario';

const allScenarios = [...SCENARIOS, ...legendaryScenarios, ...customScenarios];

  const handleAddArena = (e) => {
    e.preventDefault();
    if (!newArena.name.trim()) return;

    const created = {
      id: `custom-${Date.now()}`,
      name: newArena.name.trim(),
      universe: newArena.universe.trim() || 'Universo Personalizado',
      desc: newArena.sensory.trim(),
      sensory: newArena.sensory.trim(),
      gravity: newArena.gravity,
      temperature: newArena.temperature,
      terrainEffect: newArena.terrainEffect.trim() || 'Sin peligros adicionales.',
      isCustom: true
    };

    setCustomScenarios(prev => [created, ...prev]);
    setScenario(created);
    setIsCreatingArena(false);
    setNewArena({
      name: '',
      universe: '',
      sensory: '',
      gravity: '1G (Tierra Estándar)',
      temperature: 'Templada (22°C)',
      terrainEffect: ''
    });
  };

  const handleDeleteCustomArena = (id, e) => {
    e.stopPropagation();
    setCustomScenarios(prev => prev.filter(s => s.id !== id));
    if (scenario.id === id) {
      setScenario(SCENARIOS[0]);
    }
  };

  const handleRefinePremise = async () => {
    if (!modifiers.customContext || !modifiers.customContext.trim()) {
      alert('Escribe primero una idea, borrador o condición en el recuadro para que la IA pueda pulirla, corregir faltas y detallarla sin alterar tu intención.');
      return;
    }
    setIsRefiningPremise(true);
    try {
      const refined = await SimulationEngine.refinePremiseWithAi(
        modifiers.customContext,
        charA || { name: 'Contendiente A' },
        charB || { name: 'Contendiente B' },
        scenario || { name: 'Arena Estándar' },
        aiConfig,
        matchMode,
        teamA,
        teamB,
        battleRoyale
      );
      setModifiers(prev => ({ ...prev, customContext: refined }));
    } catch (err) {
      alert(`Error al mejorar la premisa: ${err.message || err}`);
    } finally {
      setIsRefiningPremise(false);
    }
  };

  return (
    <div className="rounded-2xl glass-panel p-5 border border-slate-800/80 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            {t('scenarioTitle')}
          </h3>
        </div>
        <button
          onClick={() => setIsCreatingArena(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-mono transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('customArena')}</span>
        </button>
      </div>

      {/* Arena Selector Grid */}
      <div>
        <label className="block text-xs font-mono text-slate-300 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>{lang === 'en' ? 'Battlefield / Terrain:' : lang === 'ja' ? '戦場・地形ステージ:' : 'Campo de Batalla / Terreno:'}</span>
          </span>
          <span className="text-[10px] text-slate-500">
            {allScenarios.length} {lang === 'en' ? 'arenas available' : lang === 'ja' ? 'ステージ利用可能' : 'arenas disponibles'}
          </span>
        </label>

        {/* Universe Filter + Search */}
        <div className="flex gap-2 mb-2 flex-wrap">
          <input
            type="text"
            placeholder={t('searchArenaPlaceholder')}
            onChange={(e) => {
              const q = e.target.value.toLowerCase();
              setArenaSearch(q);
            }}
            className="flex-1 min-w-[120px] bg-slate-900/80 border border-slate-700 rounded-lg px-2 py-1 text-white text-[10px] placeholder-slate-500 focus:outline-none focus:border-red-500/60"
          />
          <select
            value={universeFilter}
            onChange={(e) => setUniverseFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-[10px] font-mono"
          >
            <option value="Todos">{t('allUniverses')}</option>
            <option value="Dragon Ball">🐉 Dragon Ball</option>
            <option value="Jujutsu">👁️ Jujutsu Kaisen</option>
            <option value="DC">🦇 DC Comics</option>
            <option value="Marvel">⚡ Marvel</option>
            <option value="Bleach">🌑 Bleach</option>
            <option value="Naruto">🍃 Naruto / Boruto</option>
            <option value="One Piece">☠️ One Piece</option>
            <option value="JoJo">🌀 JoJo's Bizarre Adventure</option>
            <option value="CSM">⛓️ Chainsaw Man</option>
            <option value="Invincible">🔴 Invincible</option>
            <option value="Berserk">⚔️ Berserk</option>
            <option value="AoT">🧱 Attack on Titan</option>
            <option value="Custom">⚙️ Personalizadas</option>
            <option value="Otros">🌀 Otros</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
          {allScenarios.filter(s => {
            const matchSearch = !arenaSearch || s.name.toLowerCase().includes(arenaSearch) || (s.universe || '').toLowerCase().includes(arenaSearch);
            const u = (s.universe || '').toLowerCase();
            const knownUniverses = ['dragon ball', 'jujutsu', 'dc', 'marvel', 'bleach', 'naruto', 'boruto', 'one piece', 'jojo', 'chainsaw', 'invincible', 'berserk', 'attack on titan', 'shingeki'];
            const matchUniverse = universeFilter === 'Todos' ||
              (universeFilter === 'Dragon Ball' && u.includes('dragon ball')) ||
              (universeFilter === 'Jujutsu' && u.includes('jujutsu')) ||
              (universeFilter === 'DC' && u.includes('dc')) ||
              (universeFilter === 'Marvel' && u.includes('marvel')) ||
              (universeFilter === 'Bleach' && u.includes('bleach')) ||
              (universeFilter === 'Naruto' && (u.includes('naruto') || u.includes('boruto') || u.includes('konoha'))) ||
              (universeFilter === 'One Piece' && (u.includes('one piece') || u.includes('pirata') || u.includes('marineford'))) ||
              (universeFilter === 'JoJo' && (u.includes('jojo') || u.includes('bizarre'))) ||
              (universeFilter === 'CSM' && (u.includes('chainsaw') || u.includes('motosierras'))) ||
              (universeFilter === 'Invincible' && u.includes('invincible')) ||
              (universeFilter === 'Berserk' && u.includes('berserk')) ||
              (universeFilter === 'AoT' && (u.includes('attack on titan') || u.includes('shingeki') || u.includes('marley'))) ||
              (universeFilter === 'Custom' && s.isCustom) ||
              (universeFilter === 'Otros' && !knownUniverses.some(k => u.includes(k)) && !s.isCustom);
            return matchSearch && matchUniverse;
          }).map((s) => {
            const active = scenario.id === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setScenario(s)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative group ${
                  active
                    ? 'bg-red-950/40 border-red-500/60 text-white shadow-md shadow-red-950/50'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="font-bold text-xs line-clamp-1">{s.name}</div>
                <div className="text-[10px] font-mono text-slate-400 line-clamp-1">{s.universe}</div>
                
                {s.isCustom && (
                  <button
                    onClick={(e) => handleDeleteCustomArena(s.id, e)}
                    className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    title="Eliminar arena personalizada"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Scenario Live Details Card */}
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold text-xs font-mono">{scenario?.name}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {scenario?.universe}
            </span>
          </div>
          
          <button
            onClick={() => setIsGeneratingArena(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono transition cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{lang === 'en' ? 'AI Auto-Generate Arena' : lang === 'ja' ? 'AIで新ステージ自動生成' : 'Generar Nueva con IA'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 italic leading-relaxed font-serif">
          "{scenario?.description}"
        </p>

        {/* Environmental Hazards Breakdown & Interactive Quick Customizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/60 text-[11px] font-mono">
          {/* Gravedad */}
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-bold text-cyan-400">
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span>{t('gravityLabel')}:</span>
              </span>
              <span className="text-[10px] text-cyan-300 font-bold">{scenario?.gravity || '1G'}</span>
            </div>
            <select
              aria-label="Gravedad del escenario"
              name="gravedad"
              value={scenario?.gravity || '1G (Tierra Estándar)'}
              onChange={(e) => setScenario(prev => ({ ...prev, gravity: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-[10px] font-mono cursor-pointer"
            >
              <option value="1G (Tierra Estándar)">1G (Tierra Estándar)</option>
              <option value="0G (Microgravedad / Espacio)">0G (Gravedad Cero / Espacio)</option>
              <option value="10G (Planeta Kaio)">10G (Planeta Kaio)</option>
              <option value="100G (Cámara de Gravedad)">100G (Cámara de Gravedad Saiyan)</option>
              <option value="500G (Gravedad Extrema)">500G (Gravedad Titánica)</option>
              <option value="1,000G+ (Núcleo de Agujero Negro)">1,000G+ (Hipergravitación Singular)</option>
            </select>
          </div>

          {/* Clima */}
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-bold text-orange-400">
                <Thermometer className="w-3.5 h-3.5 shrink-0" />
                <span>{t('climateLabel')}:</span>
              </span>
              <span className="text-[10px] text-orange-300 font-bold">{scenario?.climate || 'Templado'}</span>
            </div>
            <select
              aria-label="Clima del escenario"
              name="clima"
              value={scenario?.climate || 'Templada (22°C)'}
              onChange={(e) => setScenario(prev => ({ ...prev, climate: e.target.value, temperature: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-[10px] font-mono cursor-pointer"
            >
              <option value="Templada (22°C)">Templado (22°C - Neutro)</option>
              <option value="Tormenta Eléctrica / Iónica">Tormenta Eléctrica / Iónica</option>
              <option value="Frío Glacial Subcero (-150°C)">Frío Glacial Subcero (-150°C)</option>
              <option value="Infierno Volcánico (1,200°C)">Infierno Volcánico (1,200°C)</option>
              <option value="Vacío Espacial (Sin Oxígeno)">Vacío Espacial (Sin Oxígeno)</option>
              <option value="Atmósfera Venenosa / Miasma Tóxico">Miasma Tóxico / Gas Corrosivo</option>
            </select>
          </div>

          {/* Peligro */}
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-bold text-red-400">
                <Flame className="w-3.5 h-3.5 shrink-0" />
                <span>{t('dangerLabel')}:</span>
              </span>
              <span className="text-[10px] text-red-300 font-bold truncate max-w-[100px]">{scenario?.hazard || 'Ninguno'}</span>
            </div>
            <select
              aria-label="Peligro ambiental del escenario"
              name="peligro"
              value={scenario?.hazard || 'Sin peligros adicionales.'}
              onChange={(e) => setScenario(prev => ({ ...prev, hazard: e.target.value, terrainEffect: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200 text-[10px] font-mono cursor-pointer"
            >
              <option value="Sin peligros adicionales.">Ninguno (Terreno Limpio)</option>
              <option value="Magma Ascendente y Grietas Tectónicas">Magma Ascendente & Fuego</option>
              <option value="Radiación Cósmica Destructiva">Radiación Cósmica Destructiva</option>
              <option value="Drenaje Pasivo Continuo de Ki / Energía">Drenaje de Ki / Energía</option>
              <option value="Colapso Periódico del Suelo">Colapso Tectónico Periódico</option>
              <option value="Niebla de Ilusiones y Distorsión Óptica">Niebla de Ilusiones Sensoriales</option>
            </select>
          </div>
        </div>
      </div>

      {/* VS Battles Wiki Toggles & Rich Modifiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        {/* Bloodlust & Psique */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-200 font-bold">
              <Skull className="w-4 h-4 text-red-400" />
              <span>Psique / Moral</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              modifiers.bloodlustMode === 'bloodlust' || modifiers.bloodlust ? 'bg-red-600 text-white shadow-md' :
              modifiers.bloodlustMode === 'honor' ? 'bg-amber-600 text-white shadow-md' :
              modifiers.bloodlustMode === 'berserker' ? 'bg-purple-600 text-white shadow-md' :
              'bg-slate-800 text-slate-400'
            }`}>
              {modifiers.bloodlustMode === 'bloodlust' || modifiers.bloodlust ? 'BLOODLUST' :
               modifiers.bloodlustMode === 'honor' ? 'HONOR' :
               modifiers.bloodlustMode === 'berserker' ? 'BERSERKER' : 'CANON'}
            </span>
          </div>

          <select
            value={modifiers.bloodlustMode || (modifiers.bloodlust ? 'bloodlust' : 'canon')}
            onChange={(e) => {
              const val = e.target.value;
              setModifiers(prev => ({
                ...prev,
                bloodlustMode: val,
                bloodlust: val === 'bloodlust'
              }));
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-[10px] font-mono cursor-pointer"
          >
            <option value="canon">Fiel a su Psicología (Moral Canon)</option>
            <option value="bloodlust">Bloodlust Total (Sin Piedad · 100% Letal)</option>
            <option value="honor">Código de Honor Marcial (Duelo Limpio)</option>
            <option value="berserker">Furia Berserker (Ataque Ciego sin Defensa)</option>
          </select>

          <p className="text-[10px] text-slate-400 leading-tight">
            {modifiers.bloodlustMode === 'bloodlust' || modifiers.bloodlust ? 'Sin contención moral ni piedad; máxima letalidad desde el ms 0.' :
             modifiers.bloodlustMode === 'honor' ? 'No atacará a traición ni por la espalda; duelo con código de guerrero.' :
             modifiers.bloodlustMode === 'berserker' ? 'Ira desbocada sacrificando toda guardia para infligir daño crítico.' :
             'Opera con su personalidad, moral y diálogos canónicos.'}
          </p>
        </div>

        {/* Speed Equalized */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-200 font-bold">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Velocidad</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              modifiers.speedMode === 'equalized' || modifiers.speedEqualized ? 'bg-yellow-600 text-white shadow-md' :
              modifiers.speedMode === 'semi' ? 'bg-amber-600 text-white shadow-md' :
              'bg-slate-800 text-slate-400'
            }`}>
              {modifiers.speedMode === 'equalized' || modifiers.speedEqualized ? 'IGUALADA' :
               modifiers.speedMode === 'semi' ? 'SEMI-IGUAL' : 'CANON'}
            </span>
          </div>

          <select
            value={modifiers.speedMode || (modifiers.speedEqualized ? 'equalized' : 'canon')}
            onChange={(e) => {
              const val = e.target.value;
              setModifiers(prev => ({
                ...prev,
                speedMode: val,
                speedEqualized: val === 'equalized'
              }));
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-[10px] font-mono cursor-pointer"
          >
            <option value="canon">Velocidad Canon (Tiers Reales)</option>
            <option value="equalized">Velocidad Igualada 100% (Misma Velocidad)</option>
            <option value="semi">Semi-Igualada (Margen de Reflejos 10%)</option>
          </select>

          <p className="text-[10px] text-slate-400 leading-tight">
            {modifiers.speedMode === 'equalized' || modifiers.speedEqualized ? 'Velocidad de combate, desplazamiento y ataque idénticas.' :
             modifiers.speedMode === 'semi' ? 'Brecha de velocidad reducida; premia la anticipación y Battle IQ.' :
             'Velocidades originales por feats e historial canónico.'}
          </p>
        </div>

        {/* Stats Equalized */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-200 font-bold">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Stats Físicos</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              modifiers.statsMode === 'equalized' || modifiers.statsEqualized ? 'bg-blue-600 text-white shadow-md' :
              modifiers.statsMode === 'handicap' ? 'bg-indigo-600 text-white shadow-md' :
              'bg-slate-800 text-slate-400'
            }`}>
              {modifiers.statsMode === 'equalized' || modifiers.statsEqualized ? 'IGUALADOS' :
               modifiers.statsMode === 'handicap' ? 'HANDICAP' : 'CANON'}
            </span>
          </div>

          <select
            value={modifiers.statsMode || (modifiers.statsEqualized ? 'equalized' : 'canon')}
            onChange={(e) => {
              const val = e.target.value;
              setModifiers(prev => ({
                ...prev,
                statsMode: val,
                statsEqualized: val === 'equalized'
              }));
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-[10px] font-mono cursor-pointer"
          >
            <option value="canon">Stats de Tier Canon (Fuerza Real)</option>
            <option value="equalized">Stats Igualados (Puro Hax & IQ)</option>
            <option value="handicap">Handicap Progresivo (Desgaste Continuo)</option>
          </select>

          <p className="text-[10px] text-slate-400 leading-tight">
            {modifiers.statsMode === 'equalized' || modifiers.statsEqualized ? 'Fuerza y durabilidad idénticas; gana la técnica y estrategia.' :
             modifiers.statsMode === 'handicap' ? 'El contendiente de mayor tier sufre desgaste progresivo de potencia.' :
             'Potencia de ataque (AP) y resistencia física sin alteraciones.'}
          </p>
        </div>

        {/* Verse Equalization */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-200 font-bold">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Ecualización Energía</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              modifiers.verseMode === 'equalized' || modifiers.verseEqualization ? 'bg-emerald-600 text-white shadow-md' :
              modifiers.verseMode === 'asymmetric' ? 'bg-teal-600 text-white shadow-md' :
              'bg-slate-800 text-slate-400'
            }`}>
              {modifiers.verseMode === 'equalized' || modifiers.verseEqualization ? 'TOTAL' :
               modifiers.verseMode === 'asymmetric' ? 'ASIMÉTRICA' : 'AISLADA'}
            </span>
          </div>

          <select
            value={modifiers.verseMode || (modifiers.verseEqualization ? 'equalized' : 'isolated')}
            onChange={(e) => {
              const val = e.target.value;
              setModifiers(prev => ({
                ...prev,
                verseMode: val,
                verseEqualization: val === 'equalized'
              }));
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-[10px] font-mono cursor-pointer"
          >
            <option value="isolated">Sistemas Aislados (Sin Interacción)</option>
            <option value="equalized">Ecualización Total (Ki = Chakra = Magia = Haki)</option>
            <option value="asymmetric">Interacción Asimétrica (Haki vs Hax / Magia vs Ki)</option>
          </select>

          <p className="text-[10px] text-slate-400 leading-tight">
            {modifiers.verseMode === 'equalized' || modifiers.verseEqualization ? 'Ki = Magia = Chakra = Haki interactúan sin inmunidades absolutas.' :
             modifiers.verseMode === 'asymmetric' ? 'Haki/Ki puro resiste Hax intangible; Magia corrompe energía física.' :
             'Sistemas de energía independientes; no se interfieren mutuamente.'}
          </p>
        </div>
      </div>

      {/* APEX Cross-Franchise Scaling Bridge (Protocolo de Choque Interdimensional) */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/40 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowBridgePanel(!showBridgePanel)}>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-indigo-300 block">
                🌉 PROTOCOLO DE CHOQUE INTER-DIMENSIONAL (ARBITRAJE MULTIVERSAL)
              </span>
              <span className="text-[10px] text-slate-400">
                Reglas canónicas de Ki vs Hax conceptual, interacción con Stands e intangibilidad
              </span>
            </div>
          </div>
          <button
            type="button"
            className="px-2 py-1 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold"
          >
            {showBridgePanel ? 'Plegar Reglas ▲' : 'Configurar Arbitraje ▼'}
          </button>
        </div>

        {showBridgePanel && (
          <div className="pt-2 border-t border-indigo-950/60 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
              {/* Válvula de Ki vs Hax */}
              <label className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2 cursor-pointer hover:border-indigo-500/50">
                <input
                  type="checkbox"
                  checked={modifiers.bridgeConfig?.kiSupremacyOverHax ?? true}
                  onChange={(e) => setModifiers(prev => ({
                    ...prev,
                    bridgeConfig: { ...(prev.bridgeConfig || DEFAULT_BRIDGE_CONFIG), kiSupremacyOverHax: e.target.checked }
                  }))}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <span className="font-bold text-indigo-300 block">Válvula Ki vs Hax</span>
                  <span className="text-[10px] text-slate-400 leading-tight block">
                    Una brecha de ≥2 Tiers o Ki colosal atenúa en un 85% parálisis y control mental.
                  </span>
                </div>
              </label>

              {/* Stands & Espíritus */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="font-bold text-indigo-300 block text-[11px]">Interacción de Stands (JoJo)</span>
                <select
                  value={modifiers.bridgeConfig?.standInteraction || 'spiritual_equivalence'}
                  onChange={(e) => setModifiers(prev => ({
                    ...prev,
                    bridgeConfig: { ...(prev.bridgeConfig || DEFAULT_BRIDGE_CONFIG), standInteraction: e.target.value }
                  }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 text-[10px] font-mono"
                >
                  <option value="spiritual_equivalence">Equivalencia Espiritual (Perceptibles por Ki/Reiatsu)</option>
                  <option value="strict">Canon Estricto (Solo un Stand daña un Stand)</option>
                  <option value="ap_bleed">Daño por Onda Colateral (AP Bleed)</option>
                </select>
              </div>

              {/* Colapso de Intangibilidad */}
              <label className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start gap-2 cursor-pointer hover:border-indigo-500/50">
                <input
                  type="checkbox"
                  checked={modifiers.bridgeConfig?.dimensionalAoeVulnerability ?? true}
                  onChange={(e) => setModifiers(prev => ({
                    ...prev,
                    bridgeConfig: { ...(prev.bridgeConfig || DEFAULT_BRIDGE_CONFIG), dimensionalAoeVulnerability: e.target.checked }
                  }))}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 mt-0.5"
                />
                <div>
                  <span className="font-bold text-indigo-300 block">Colapso Dimensional AOE</span>
                  <span className="text-[10px] text-slate-400 leading-tight block">
                    Ataques cósmicos a escala masiva resquebrajan la intangibilidad convencional.
                  </span>
                </div>
              </label>
            </div>

            {/* Live Arbitrage Telemetry if charA and charB exist */}
            {charA && charB && (() => {
              const evalResult = evaluateInterdimensionalModifiers(charA, charB, modifiers.bridgeConfig || DEFAULT_BRIDGE_CONFIG);
              return (
                <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between text-indigo-300 font-bold">
                    <span>⚡ Arbitraje Táctico Activo:</span>
                    <span className="text-slate-400">Diferencia de Tiers: {evalResult.tierGap > 0 ? `+${evalResult.tierGap} a favor de ${charA.name}` : evalResult.tierGap < 0 ? `+${Math.abs(evalResult.tierGap)} a favor de ${charB.name}` : 'Tiers Paritarios'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-slate-300">
                    {[...(evalResult.modifiersA.rulesApplied || []), ...(evalResult.modifiersB.rulesApplied || [])].map((rule, rIdx) => (
                      <span key={rIdx} className="px-2 py-0.5 rounded bg-slate-900/90 border border-indigo-500/30 text-indigo-200">
                        ✦ {rule}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Narrative Presets Selector & Oracle Destinies */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" /> Selector de Filtro Narrativo & Estilo Literario (8 Estilos)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Preset Grimdark */}
          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, narrativePreset: 'Grimdark / Brutal' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.narrativePreset === 'Grimdark / Brutal'
                ? 'bg-red-950/60 border-red-500 text-white shadow-lg shadow-red-950/50 scale-[1.01]'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-red-400">
              <span>🩸</span>
              <span>Grimdark / Brutal</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Coste anatómico real, fracturas óseas, sangre, dolor biológico y degradación biomecánica explícita.
            </p>
          </button>

          {/* Preset Shonen */}
          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, narrativePreset: 'Shōnen Cinematográfico' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              (modifiers.narrativePreset === 'Shōnen Cinematográfico' || !modifiers.narrativePreset)
                ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-950/50 scale-[1.01]'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-amber-400">
              <span>⚡</span>
              <span>Shōnen Cinematográfico</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Coreografía épica, choques de energía, diálogos de convicción y superación dramática de límites.
            </p>
          </button>

          {/* Preset VS Battles */}
          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, narrativePreset: 'Análisis Técnico (VS Battles)' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.narrativePreset === 'Análisis Técnico (VS Battles)'
                ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-lg shadow-cyan-950/50 scale-[1.01]'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-cyan-400">
              <span>📐</span>
              <span>Análisis VS Battles</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Resolución matemática estricta: Joules, Mach, cálculo de Tiers y jerarquía de Hax basada en feats.
            </p>
          </button>

          {/* Preset Torneo Épico */}
          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, narrativePreset: 'Torneo Épico' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.narrativePreset === 'Torneo Épico'
                ? 'bg-yellow-950/60 border-yellow-500 text-white shadow-lg shadow-yellow-950/50 scale-[1.01]'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-yellow-400">
              <span>🏆</span>
              <span>Torneo Épico / Budokai</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Estilo arco de torneo shōnen con comentarista, marcador de ventaja, análisis de gradas y público.
            </p>
          </button>

          {/* Preset Cosmic Horror */}
          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, narrativePreset: 'Cosmic Horror / Lovecraftiano' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.narrativePreset === 'Cosmic Horror / Lovecraftiano'
                ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg shadow-purple-950/50 scale-[1.01]'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-purple-400">
              <span>🌌</span>
              <span>Cosmic Horror</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Atmósfera asfixiante de locura, distorsión dimensional, pérdida de cordura y entes cósmicos.
            </p>
          </button>

          {/* Preset Cerebral & Táctico */}
          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, narrativePreset: 'Cerebral & Táctico (Hunter x Hunter)' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.narrativePreset === 'Cerebral & Táctico (Hunter x Hunter)'
                ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-950/50 scale-[1.01]'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-indigo-400">
              <span>🧠</span>
              <span>Cerebral & Táctico (HxH)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Monólogos internos de alta velocidad, cálculo de probabilidades por segundo y contraestrategias.
            </p>
          </button>

          {/* Preset Narrador Clasico DB 90s */}
          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, narrativePreset: 'Narrador Clásico DB 90s (Voz Solemne)' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.narrativePreset === 'Narrador Clásico DB 90s (Voz Solemne)'
                ? 'bg-rose-950/60 border-rose-500 text-white shadow-lg shadow-rose-950/50 scale-[1.01]'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-rose-400">
              <span>🎙️</span>
              <span>Narrador Clásico 90s</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Tono solemne y épico de documental cósmico: ¡El destino de la Tierra y el universo pende de un hilo!
            </p>
          </button>

          {/* Preset Blockbuster IMAX */}
          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, narrativePreset: 'Blockbuster Cinemático IMAX' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.narrativePreset === 'Blockbuster Cinemático IMAX'
                ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-950/50 scale-[1.01]'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-400">
              <span>🎭</span>
              <span>Blockbuster Cinemático</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Planos de cámara dinámicos, slow-motion en puntos de impacto y atmósfera sonora inmersiva.
            </p>
          </button>

          {/* Preset Cantar Épico */}
          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, narrativePreset: 'Cantar Épico / Crónica Homérica' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.narrativePreset === 'Cantar Épico / Crónica Homérica'
                ? 'bg-rose-950/60 border-rose-500 text-white shadow-lg shadow-rose-950/50 scale-[1.01]'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-rose-400">
              <span>📜</span>
              <span>Crónica Mitológica</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Prosa arcaica y solemne de epopeya heroica relatando el choque como una leyenda para la eternidad.
            </p>
          </button>
        </div>

        {/* Oráculo: Eventos del Destino & Cisne Negro (Multi-Selección & Giros Expandidos) */}
        <div id="oracle-destiny-section" className="p-4 rounded-xl bg-slate-900/70 border border-fuchsia-900/50 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-fuchsia-400 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span>Oráculo: Evento Cisne Negro & Giros del Destino (Fase 3)</span>
                  {(() => {
                    const activeTwists = Array.isArray(modifiers.blackSwan) 
                      ? modifiers.blackSwan 
                      : (modifiers.blackSwan ? [modifiers.blackSwan === true ? 'map_collapse' : modifiers.blackSwan] : []);
                    const count = activeTwists.length + (modifiers.customOracleTwist?.trim() ? 1 : 0);
                    return count > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-fuchsia-600/30 border border-fuchsia-500 text-fuchsia-300 text-[10px] font-bold">
                        {count} {count === 1 ? 'Giro Activo' : 'Giros Activos Simultáneos'}
                      </span>
                    ) : null;
                  })()}
                </span>
                <span className="text-[10px] text-slate-400">
                  ¡Puedes activar múltiples giros a la vez! La IA integrará todos los eventos seleccionados durante el clímax de la Fase 3.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModifiers(prev => ({ ...prev, blackSwan: [] }))}
              className="text-[10px] text-slate-400 hover:text-red-400 underline cursor-pointer"
            >
              Desactivar Todos (Duelo Puro)
            </button>
          </div>

          {/* Presupuesto de Caos del Oráculo */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-fuchsia-900/40 text-[10px] font-mono">
            <span className="text-fuchsia-300 font-bold flex items-center gap-1.5">
              <span>⚖️ Presupuesto de Caos:</span>
            </span>
            <div className="flex gap-1">
              {[
                { id: 'unlimited', label: 'Sin Límite', desc: 'Todos los giros se ejecutan libremente' },
                { id: 'balanced', label: 'Equilibrado', desc: 'Prioriza coherencia narrativa y escala' },
                { id: 'curated', label: 'Curado (Máx 3)', desc: 'Máx 1 evento de poder, 1 de entorno y 1 de intervención' }
              ].map(b => {
                const currentBudget = modifiers.chaosBudget || 'unlimited';
                const isSelected = currentBudget === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setModifiers(prev => ({ ...prev, chaosBudget: b.id }))}
                    title={b.desc}
                    className={`px-2 py-0.5 rounded cursor-pointer transition ${
                      isSelected
                        ? 'bg-fuchsia-600 text-white font-bold shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 Familias del Oráculo V2 */}
          <div className="space-y-3">
            {[
              {
                familyId: 'environment',
                title: 'A. Entorno y Física',
                icon: '🌍',
                color: 'from-blue-900/40 to-cyan-950/40 border-cyan-800/40',
                events: [
                  { id: 'map_collapse', label: 'Colapso de Arena & Gravedad Cero', risk: 'Medio', desc: 'El mapa se destruye por completo; combate en caída libre con gravedad 0G.' },
                  { id: 'time_dilation', label: 'Dilatación Temporal Localizada', risk: 'Medio', desc: 'Zonas de tiempo alterado; desfase de iniciativa e intercambios desincronizados.' },
                  { id: 'dimensional_shift', label: 'Falla Espacio-Temporal', risk: 'Alto', desc: 'Ruptura del tejido dimensional; teleportación súbita a plano hostil.' },
                  { id: 'energy_supernova', label: 'Supernova de Ki Desbocado', risk: 'Catastrófico', desc: 'Detonación de energía cósmica ambiental que arrasa la geografía.' },
                  { id: 'miasma_corruption', label: 'Miasma de Corrupción / Berserk', risk: 'Alto', desc: 'Bruma maldita que fuerza letalidad extrema (+30% AP) sacrificando guardia.' }
                ]
              },
              {
                familyId: 'intervention',
                title: 'B. Intervención de Personajes',
                icon: '👥',
                color: 'from-amber-900/40 to-yellow-950/40 border-amber-800/40',
                events: [
                  { id: 'same_verse_reinforcement', label: 'Invasor del Mismo Verso (Canon)', risk: 'Medio', desc: 'Irrumpe un guerrero canónico compatible de la misma franquicia.' },
                  { id: 'multiverse_random_fighter', label: 'Guerrero Multiversal Sorpresa', risk: 'Alto', desc: 'Incursión dimensional imprevista de un combatiente de otro verso.' },
                  { id: 'third_party', label: 'Invasor de 3ra Facción / Titán Cósmico', risk: 'Catastrófico', desc: 'Kaiju o amenaza hostil a ambos bandos que impone un duelo a tres bandas.' },
                  { id: 'shadow_clone', label: 'Paradoja del Espejo (Doppelgänger)', risk: 'Alto', desc: 'Se manifiesta un clon oscuro temporal con arsenal idéntico y 50% de HP.' }
                ]
              },
              {
                familyId: 'evolution',
                title: 'C. Evolución y Poder',
                icon: '⚡',
                color: 'from-purple-900/40 to-fuchsia-950/40 border-fuchsia-800/40',
                events: [
                  { id: 'miracle_form_canon', label: 'Despertar Canónico (+1 Forma Lógica de Saga)', risk: 'Medio', desc: 'Ascenso temporal estricto a la forma inmediata posterior de su saga.' },
                  { id: 'miracle_form_transcendent', label: 'Despertar Trascendente (Forma Máxima / What-If)', risk: 'Alto', desc: 'Ruptura de límites de era hacia forma divina o suprema hipotética.' },
                  { id: 'miracle_technique_awakening', label: 'Despertar de Super Técnica / Finisher Prohibido', risk: 'Alto', desc: 'Liberación de técnica prohibida de Fase 3 con drenaje masivo de stamina.' },
                  { id: 'divine_blessing', label: 'Bendición Divina (Escudo 1 Uso)', risk: 'Bajo', desc: 'Amparo de deidad superior que anula un impacto letal decisivo.' },
                  { id: 'hax_failure', label: 'Anulación Catastrófica de Hax (30s)', risk: 'Alto', desc: 'Se apagan magias, dominios y hax conceptual; duelo puramente físico.' }
                ]
              },
              {
                familyId: 'fusion',
                title: 'D. Fusión, Absorción y Alteración',
                icon: '🧬',
                color: 'from-rose-900/40 to-pink-950/40 border-rose-800/40',
                events: [
                  { id: 'fusion_protocol_canon', label: 'Fusión Canónica en Batalla (Potara / Metamoru)', risk: 'Medio', desc: 'Fusión oficial con fórmula determinista única y arsenal combinado.' },
                  { id: 'fusion_protocol_whatif', label: 'Fusión What-If Híbrida', risk: 'Alto', desc: 'Unión hipotética inédita entre aliados con riesgo de inestabilidad.' },
                  { id: 'cell_bio_absorption', label: 'Absorción Anatómica de Cell', risk: 'Alto', desc: 'Bio-aguijón depredador para drenar Ki o asimilar biomasa/androides.' },
                  { id: 'buu_viscous_absorption', label: 'Absorción de Majin Buu', risk: 'Alto', desc: 'Envoltura de masa viscosa para asimilar técnicas y mente del rival.' },
                  { id: 'baby_tsufur_parasitism', label: 'Parasitación & Súbditos Tsufur de Baby', risk: 'Alto', desc: 'Infección líquida por incisiones para imponer control motor condicional.' }
                ]
              }
            ].map(fam => {
              const activeTwists = Array.isArray(modifiers.blackSwan) 
                ? modifiers.blackSwan 
                : (modifiers.blackSwan ? [modifiers.blackSwan === true ? 'map_collapse' : modifiers.blackSwan] : []);

              return (
                <div key={fam.familyId} className={`p-2.5 rounded-xl bg-gradient-to-r ${fam.color} border space-y-1.5`}>
                  <div className="flex items-center justify-between text-[11px] font-bold text-white font-mono">
                    <span className="flex items-center gap-1.5">
                      <span>{fam.icon}</span>
                      <span>{fam.title}</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-normal">Fase 3 · Solo esta simulación</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {fam.events.map(opt => {
                      const isActive = activeTwists.includes(opt.id) || (opt.id === 'miracle_form_canon' && (activeTwists.includes('miracle_awakening') || activeTwists.includes('miracle_form_awakening')));
                      const riskColor = opt.risk === 'Bajo' ? 'text-emerald-400' : opt.risk === 'Medio' ? 'text-amber-400' : opt.risk === 'Alto' ? 'text-orange-400' : 'text-red-400';

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            let updated;
                            if (isActive) {
                              updated = activeTwists.filter(x => x !== opt.id);
                            } else {
                              updated = [...activeTwists, opt.id];
                            }
                            setModifiers(prev => ({ ...prev, blackSwan: updated }));
                          }}
                          title={`${opt.desc}
• Riesgo: ${opt.risk}
• Persistencia: Solo esta simulación (Capa 2)
• Origen: Oráculo`}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-950/60 scale-[1.02] border border-fuchsia-400'
                              : 'bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span className={`text-[8px] font-mono px-1 py-0.2 rounded bg-black/40 ${riskColor}`}>
                            {opt.risk}
                          </span>
                          {isActive && <span className="text-[10px] font-black text-fuchsia-200">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panel de Interacciones Activas y Sinergias */}
          {(() => {
            const activeTwists = Array.isArray(modifiers.blackSwan) 
              ? modifiers.blackSwan 
              : (modifiers.blackSwan ? [modifiers.blackSwan === true ? 'map_collapse' : modifiers.blackSwan] : []);
            
            const synergies = [];
            if (activeTwists.includes('miracle_form_canon') && (activeTwists.includes('fusion_protocol_canon') || activeTwists.includes('fusion_protocol_whatif'))) {
              synergies.push('⚡ Despertar Canónico + Fusión: La fusión podrá desatar la evolución lógica posterior solo si ambos componentes son compatibles.');
            }
            if (activeTwists.includes('miracle_technique_awakening') && activeTwists.includes('fusion_protocol_whatif')) {
              synergies.push('🔥 Finisher Prohibido + Fusión What-If: Se habilita técnica suprema híbrida temporal, con riesgo de inestabilidad y desfusión forzada.');
            }
            if (activeTwists.includes('hax_failure') && activeTwists.includes('miasma_corruption')) {
              synergies.push('💀 Anulación de Hax + Miasma: Sin magia ni dominios, el combate se resolverá exclusivamente por impacto óseo y furia berserker.');
            }
            if (activeTwists.includes('multiverse_random_fighter') && activeTwists.includes('same_verse_reinforcement')) {
              synergies.push('🌌 Invasor Multiversal + Refuerzo Canónico: Múltiples entidades externas convergen simultáneamente alterando la balanza de equipos.');
            }

            if (synergies.length === 0) return null;

            return (
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-1 text-[10px] font-mono">
                <span className="text-purple-300 font-bold block flex items-center gap-1.5">
                  <span>✨ Interacciones Activas & Sinergias del Oráculo:</span>
                </span>
                {synergies.map((syn, sIdx) => (
                  <p key={sIdx} className="text-purple-200/90 leading-tight">
                    {syn}
                  </p>
                ))}
              </div>
            );
          })()}

          {/* Input de Giro Personalizado del Usuario */}
          <div className="pt-2 border-t border-fuchsia-900/30 space-y-1">
            <label className="text-[10px] text-fuchsia-300 font-bold block">
              ✍️ O escribe tu propio giro o condición impredecible adicional:
            </label>
            <input
              type="text"
              placeholder="Ej. Aparece Shenlong y concede un deseo, la gravedad aumenta x10.000, o una barrera mágica atrapa a ambos..."
              value={modifiers.customOracleTwist || ''}
              onChange={(e) => setModifiers(prev => ({ ...prev, customOracleTwist: e.target.value }))}
              className="w-full bg-slate-950 border border-fuchsia-900/50 rounded-lg p-2 text-fuchsia-200 text-xs font-mono placeholder:text-slate-600 focus:border-fuchsia-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Formato de Simulación: Fases vs Crónica vs Episódico */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <FastForward className="w-3.5 h-3.5" /> Modo de Narrativa y Ritmo de Simulación
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, simulationMode: 'fases' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              (modifiers.simulationMode || 'fases') === 'fases'
                ? 'bg-amber-950/50 border-amber-500 text-white shadow-md'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
              <span>⚡</span>
              <span>5 Fases + Veredicto APEX</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Estructura canónica APEX con barras biométricas de HP y Stamina en cada fase.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, simulationMode: 'cronica' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.simulationMode === 'cronica'
                ? 'bg-blue-950/50 border-blue-500 text-white shadow-md'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-blue-400 flex items-center gap-1.5">
              <span>📜</span>
              <span>Crónica Continua (Novela)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Relato fluido y cinematográfico con checkpoints biométricos por minutos de combate.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, simulationMode: 'episodico' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.simulationMode === 'episodico'
                ? 'bg-purple-950/50 border-purple-500 text-white shadow-md'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-purple-400 flex items-center gap-1.5">
              <span>🎬</span>
              <span>Modo Episódico / Por Actos</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Genera por partes con final abierto (Cliffhanger) para continuar a tu ritmo.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, simulationMode: 'epica_extendida' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.simulationMode === 'epica_extendida'
                ? 'bg-orange-950/50 border-orange-500 text-white shadow-md'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-orange-400 flex items-center gap-1.5">
              <span>🔥</span>
              <span>Épica Extendida (6 Fases)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Combate más largo y profundo: crisis, desgaste y desesperación antes del clímax.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, simulationMode: 'maraton' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.simulationMode === 'maraton'
                ? 'bg-red-950/50 border-red-500 text-white shadow-md'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-red-400 flex items-center gap-1.5">
              <span>🏃</span>
              <span>Maratón de Resistencia</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Combate de desgaste prolongado: gana el que resiste, no el que golpea más fuerte.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, simulationMode: 'novela_continua' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.simulationMode === 'novela_continua'
                ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-md'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
              <span>📖</span>
              <span>Novela Continua (Sin Fases)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Prosa literaria fluida, sin encabezados de fase; la pelea fluye como un capítulo.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, simulationMode: 'relampago' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.simulationMode === 'relampago'
                ? 'bg-yellow-950/50 border-yellow-500 text-white shadow-md'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-yellow-400 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Combate Relámpago</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              One-shot brutal decidido en segundos: un único intercambio decisivo.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, simulationMode: 'resistencia_infinita' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.simulationMode === 'resistencia_infinita'
                ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-md'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
              <span>♾️</span>
              <span>Resistencia Infinita</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Duelo sin límite de tiempo hasta el colapso total por agotamiento.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, simulationMode: 'ascension' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.simulationMode === 'ascension'
                ? 'bg-fuchsia-950/50 border-fuchsia-500 text-white shadow-md'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-fuchsia-400 flex items-center gap-1.5">
              <span>⬆️</span>
              <span>Ascensión de Poder</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Rondas de evolución: ambos escalan formas hasta la cúspide.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, simulationMode: 'oleadas' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.simulationMode === 'oleadas'
                ? 'bg-lime-950/50 border-lime-500 text-white shadow-md'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-lime-400 flex items-center gap-1.5">
              <span>🌊</span>
              <span>Asalto por Oleadas</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              La escuadra defiende contra hordas de enemigos cada vez más fuertes.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, simulationMode: 'psicologico' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.simulationMode === 'psicologico'
                ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-md'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-indigo-400 flex items-center gap-1.5">
              <span>🧠</span>
              <span>Guerra Psicológica</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Mente sobre músculo: mind games, lecturas y pocos golpes muy pesados.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModifiers(prev => ({ ...prev, simulationMode: 'sparring' }))}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              modifiers.simulationMode === 'sparring'
                ? 'bg-teal-950/50 border-teal-500 text-white shadow-md'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-xs text-teal-400 flex items-center gap-1.5">
              <span>🥊</span>
              <span>Sparring de Entrenamiento</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">
              Sin muerte, deportivo: técnica, aprendizaje mutuo y respeto.
            </p>
          </button>
        </div>
      </div>

      {/* ⚔️ Mecánicas Especiales de Combate — Senzu Beans & Peligro Ambiental */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3 font-mono">
        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <Flame className="w-3.5 h-3.5" /> Mecánicas de Combate Especiales
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Semillas Senzu / Curación Táctica */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-emerald-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                <span className="text-lg">🫘</span>
                <span>Semillas del Ermitaño</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                modifiers.senzuMode === 'critical' ? 'bg-emerald-600 text-white shadow-md' :
                modifiers.senzuMode === 'bag' ? 'bg-green-600 text-white shadow-md' :
                'bg-slate-800 text-slate-400'
              }`}>
                {modifiers.senzuMode === 'critical' ? '1 SENZU' :
                 modifiers.senzuMode === 'bag' ? 'BOLSA (x3)' : 'SIN SENZU'}
              </span>
            </div>

            <select
              aria-label="Modo de Semillas del Ermitaño"
              value={modifiers.senzuMode || 'none'}
              onChange={(e) => setModifiers(prev => ({ ...prev, senzuMode: e.target.value }))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-[10px] font-mono cursor-pointer"
            >
              <option value="none">Sin Senzus (Escasez / Supervivencia)</option>
              <option value="critical">1 Semilla Crítica (Momento Único & Dramático)</option>
              <option value="bag">Bolsa Completa (3 Senzus — Gestión Táctica)</option>
            </select>

            <p className="text-[10px] text-slate-400 leading-tight">
              {modifiers.senzuMode === 'critical' ? 'Hay una sola semilla disponible. Krilin o un aliado debe decidir cuándo y a quién usarla — puede cambiar el curso de la batalla.' :
               modifiers.senzuMode === 'bag' ? 'Hasta 3 curaciones tácticas. La IA narrará la gestión, el momento de usarlas y las consecuencias de desperdiciarlas o reservarlas.' :
               'Sin curación disponible. El daño acumulado es permanente y progresivo fase a fase.'}
            </p>
          </div>

          {/* Peligro Ambiental Activo */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-orange-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                <span className="text-lg">🌋</span>
                <span>Peligro Ambiental Activo</span>
              </span>
              <button
                type="button"
                onClick={() => setModifiers(prev => ({ ...prev, activeEnvironmentalHazard: !prev.activeEnvironmentalHazard }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${modifiers.activeEnvironmentalHazard ? 'bg-orange-500' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${modifiers.activeEnvironmentalHazard ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
              </button>
            </div>

            <select
              value={modifiers.environmentalHazardType || 'magma'}
              onChange={(e) => setModifiers(prev => ({ ...prev, environmentalHazardType: e.target.value, activeEnvironmentalHazard: true }))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200 text-[10px] font-mono cursor-pointer"
            >
              <option value="magma">🌋 Magma Ascendente (Quemaduras continuas sin escudo Ki)</option>
              <option value="radiation">☢️ Radiación de Ki Residual (Humanos sin Ki pierden HP/turno)</option>
              <option value="seismic">🪨 Colapso Tectónico Periódico (El suelo falla cada X turnos)</option>
              <option value="vacuum">🌌 Vacío Espacial (Sin oxígeno — solo sobreviven con escudo Ki)</option>
              <option value="miasma">🩸 Miasma Oscuro (Incrementa la furia y anula la piedad moral)</option>
            </select>

            <p className="text-[10px] text-slate-400 leading-tight">
              {modifiers.activeEnvironmentalHazard
                ? 'Peligro activo. La IA narrará sus efectos sobre combatientes sin escudo de energía (ej. humanos en cráteres de magma).'
                : 'Desactivado. El terreno es neutro aunque el escenario sea volcánico.'}
            </p>
          </div>
        </div>
      </div>

      {/* Custom Context / Premisa Inicial Personalizada */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 shrink-0">
            <span className="text-emerald-400 text-sm">✍️</span>
            <span>Premisa, Contexto Previo o Reglas Especiales:</span>
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={isGeneratingPremise || isRefiningPremise}
              onClick={handleRefinePremise}
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-95 text-white text-[11px] font-bold shadow-lg shadow-purple-950/60 transition cursor-pointer disabled:opacity-50 border border-purple-400/50"
              title="Mejora tu texto: corrige faltas de ortografía, añade detalle cinematográfico y expande la escena respetando 100% lo que quieres interpretar"
            >
              {isRefiningPremise ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-200 shrink-0" />
                  <span>Puliendo...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5 text-pink-200 shrink-0 animate-pulse" />
                  <span>🪄 Pulir Premisa con IA</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isGeneratingPremise || isRefiningPremise}
              onClick={async () => {
                setIsGeneratingPremise(true);
                try {
                  const generated = await SimulationEngine.generateQuickPremise(
                    charA || { name: 'Contendiente A' },
                    charB || { name: 'Contendiente B' },
                    scenario || { name: 'Arena Estándar' },
                    aiConfig,
                    matchMode,
                    teamA,
                    teamB,
                    battleRoyale
                  );
                  setModifiers(prev => ({ ...prev, customContext: generated }));
                } catch (err) {
                  alert(`Error al generar premisa: ${err.message || err}`);
                } finally {
                  setIsGeneratingPremise(false);
                }
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold shadow-md shadow-emerald-950/50 transition cursor-pointer disabled:opacity-50"
              title="Genera una premisa aleatoria desde cero adaptada a los personajes y el mapa actual"
            >
              {isGeneratingPremise ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                  <span>🎲 Generar Premisa con IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Desplegable Táctico de Premisas, Giros & 3er Contendiente */}
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-emerald-900/50 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-emerald-400" />
              <span>💥 Desplegable de Giros, 3er Contendiente & Premisas Especiales:</span>
            </span>
            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/60 flex items-center gap-1">
              <Check className="w-3 h-3 text-cyan-400" />
              <span>LEY CANÓNICA APEX ACTIVA</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <select
              className="sm:col-span-9 p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-emerald-400 focus:outline-none transition cursor-pointer"
              onChange={(e) => {
                if (e.target.value) {
                  setModifiers(prev => ({ ...prev, customContext: e.target.value }));
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>⚡ Selecciona una premisa, 3er contendiente o giro especial...</option>
              <option value="Irrumpe sorpresivamente un 3er contendiente canónico icónico y específico del universo del combate (con nombre oficial completo, ej. Metal Cooler, Broly, Cell Max, Bills, Hit, Freezer, Sukuna, Thor, Doomsday, Thanos) que interrumpe el duelo desatando un choque a tres bandas.">
                💥 [3er Contendiente Sorpresa] Villano Némesis / Rival Histórico del Universo
              </option>
              <option value="Irrumpe un villano némesis canónico legendario con sed de venganza (ej. Metal Cooler / Broly / Sukuna / Thanos / Darkseid) atacando a quemarropa a ambos contendientes.">
                😈 [Némesis Hostil] Asalto Inesperado de un Villano Supremo
              </option>
              <option value="Un aliado canónico de respaldo o mentor histórico (ej. Vegeta / Piccolo / Gojo / Thor / Superman) interviene en el último milisegundo para rescatar a su compañero y coordinar un contraataque 2v1.">
                🛡️ [Aliado de Respaldo] Intervención Heroica en el Milisegundo Crítico
              </option>
              <option value="Aparece un dúo de asalto coordinado (ej. Androides 17 y 18 / Goku Black & Zamasu / Toji & Maki) ejecutando una emboscada 2v1 de alta presión táctica.">
                👥 [Dúo / Emboscada] Asalto Coordinado de 2 Guerreros
              </option>
              <option value="Uno de los luchadores realiza una técnica de fusión de emergencia o metamorfosis prohibida para duplicar su poder a costa de un drenaje crítico de energía.">
                ⚡ [Fusión de Crisis] Protocolo de Fusión / Metamorfosis de Emergencia
              </option>
              <option value="Al recibir un impacto letal, un catalizador fisiológico o divino latente despierta una nueva transformación que invierte la balanza de poder.">
                👑 [Despertar Oculto] Desbloqueo de Nueva Transformación / Forma Latente
              </option>
              <option value="El contendiente inferior en estadísticas descifra el patrón de combate y logra copiar, anular o absorber temporalmente el Hax principal de su oponente.">
                🧬 [Robo de Técnica / Adaptación] Copia o Neutralización del Hax Rival
              </option>
              <option value="El clima y la física del escenario colapsan desatando una lluvia de meteoros cósmicos y tormentas de plasma que golpean a ambos luchadores.">
                🌧️ [Cataclismo Ambiental] Tormenta de Plasma y Lluvia de Meteoros
              </option>
              <option value="Una entidad cósmica suprema o árbitro divino (ej. Whis / Gran Patriarca / Anti-Monitor / Tribunal Viviente) irrumpe imponiendo una alteración de la realidad.">
                🌌 [Deidad Cósmica] Juicio de una Entidad Multiversal
              </option>
              <option value="El terreno de combate colapsa por la densidad del choque y ambos contendientes caen arrastrados a otra dimensión paralela hostil.">
                🌀 [Colapso Dimensional] Teletransportación a una Arena Hostil
              </option>
              <option value="El combatiente al borde de la derrota activa una técnica kamikaze de auto-destrucción total para forzar una aniquilación mutua.">
                🩸 [Ataque Kamikaze] Sacrificio Final de Auto-Destrucción
              </option>
            </select>

            <div className="sm:col-span-3 flex gap-1.5">
              <button
                type="button"
                onClick={() => setModifiers(prev => ({ 
                  ...prev, 
                  customContext: "Irrumpe sorpresivamente un 3er contendiente canónico icónico y específico del universo del combate (con nombre oficial completo, ej. Metal Cooler, Broly, Cell Max, Bills, Hit, Freezer, Sukuna, Thor, Doomsday, Thanos) que interrumpe el duelo desatando un choque a tres bandas." 
                }))}
                className="flex-1 py-1 px-2 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 text-[10px] font-bold border border-emerald-700/60 transition flex items-center justify-center gap-1"
                title="Cargar 3er contendiente canónico"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>3er Rival</span>
              </button>
              <button
                type="button"
                onClick={() => setModifiers(prev => ({ ...prev, customContext: '' }))}
                className="py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] border border-slate-700 transition"
                title="Limpiar texto"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Artefactos Legendarios — adjuntan sus reglas a la premisa del combate */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <span className="text-cyan-400">🧿</span>
              <span>Artefactos Legendarios (equipables):</span>
            </span>
            <span className="text-[10px] text-slate-500">Pulsa uno para añadir sus reglas a la premisa</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            {LEGENDARY_ARTIFACTS.map(art => (
              <button
                key={art.id}
                type="button"
                title={`${art.type} — ${art.effect}`}
                onClick={() => setModifiers(prev => ({
                  ...prev,
                  customContext: [
                    prev.customContext,
                    `\n🧿 ARTEFACTO EQUIPADO: ${art.name} (${art.type}).\nEFECTO: ${art.effect}\nLIMITACIONES: ${art.limitations}\nCONDICIÓN DE USO: ${art.useCondition}`
                  ].filter(Boolean).join('\n')
                }))}
                className="px-2 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/50 text-cyan-200 font-bold transition cursor-pointer"
              >
                🧿 {art.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setModifiers(prev => ({
                ...prev,
                customContext: (prev.customContext || '').replace(/\n🧿 ARTEFACTO EQUIPADO:.*$/s, '')
              }))}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 transition cursor-pointer"
              title="Quitar el último artefacto equipado"
            >
              ✕ Quitar
            </button>
          </div>
        </div>

        {/* Bosses Legendarios de Asedio — mecánicas de 3 fases inyectadas */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <span className="text-red-400">🐲</span>
              <span>Bosses Legendarios de Asedio (3 Fases):</span>
            </span>
            <span className="text-[10px] text-slate-500">Ideal para modo Raid — la IA respeta sus mecánicas</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            {RAID_BOSSES_PROFILES.map(boss => (
              <button
                key={boss.id}
                type="button"
                title={boss.structuralWeakness}
                onClick={() => setModifiers(prev => ({
                  ...prev,
                  customContext: [
                    prev.customContext,
                    `\n🐲 BOSS LEGENDARIO DE ASEDIO: ${boss.name}.\nRESISTENCIAS: ${Object.entries(boss.resistances || {}).map(([k, v]) => `${k} ${v}%`).join(', ')}\nDEBILIDAD ESTRUCTURAL: ${boss.structuralWeakness}\nFASES:\n• ${boss.phases?.phase1?.name} — ${boss.phases?.phase1?.mechanic}\n• ${boss.phases?.phase2?.name} (${boss.phases?.phase2?.trigger}) — ${boss.phases?.phase2?.mechanic} ${boss.phases?.phase2?.hazardZone ? `| ${boss.phases?.phase2?.hazardZone}` : ''}\n• ${boss.phases?.phase3?.name} (${boss.phases?.phase3?.trigger}) — ${boss.phases?.phase3?.buffs || ''} | FINISHER: ${boss.phases?.phase3?.finisher}\nCONTRATAQUES EFECTIVOS: ${(boss.phases?.phase3?.counterTags || []).join(', ')}`
                  ].filter(Boolean).join('\n')
                }))}
                className="px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-700/50 text-red-200 font-bold transition cursor-pointer"
              >
                🐲 {boss.name.split('—')[0].trim()}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setModifiers(prev => ({
                ...prev,
                customContext: (prev.customContext || '').replace(/\n🐲 BOSS LEGENDARIO DE ASEDIO:.*$/s, '')
              }))}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 transition cursor-pointer"
              title="Quitar el último boss equipado"
            >
              ✕ Quitar
            </button>
          </div>
        </div>

        {/* Quick Premise Chips */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <span className="text-amber-400">⚡</span>
              <span>Plantillas Rápidas del Modo ({matchMode === '1v1' ? '1v1 Duelo' : matchMode === '1vN' ? '1vN Raid Boss' : matchMode === 'teams' ? 'Equipos' : 'Battle Royale'}):</span>
            </span>
            <span className="text-[10px] text-slate-500">Pulsa una plantilla para cargarla al instante</span>
          </div>
          
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            {matchMode === '1vN' ? (
              <>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Raid Boss Implacable en ${scenario?.name || 'la arena'}: El Titán ${charA?.name || 'Boss'} entra en combate con su multiplicador de Raid activo. La alianza de ${teamB.map(c => c.name).join(' & ') || 'los asaltantes'} debe coordinar sus pasivas y hax combinados para quebrar su barrera colosal antes de que la arena colapse.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer font-medium"
                >
                  👹 Asalto al Titán Supremo
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Emboscada Táctica & Flanqueo: ${teamB.map(c => c.name).join(' & ') || 'El escuadrón'} ataca de forma escalonada usando distracciones y señuelos para aislar y penetrar la durabilidad de ${charA?.name || 'Boss'}.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  ⚔️ Emboscada Coordinada
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Furia Desatada (Fase 2 de Raid): ${charA?.name || 'Boss'} entra en cólera al recibir daño, multiplicando su velocidad de ataque e infligiendo daño continuo por presión de aura a toda la escuadra.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  🛡️ Furia Berserker (Fase 2)
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Sacrificio Heroico: Uno de los miembros de la escuadra retiene físicamente a ${charA?.name || 'Boss'} sufriendo daño crítico para permitir que sus aliados disparen su técnica combinada a quemarropa.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  ⏳ Sacrificio Táctico
                </button>
              </>
            ) : matchMode === 'teams' ? (
              <>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Guerra de Facciones en ${scenario?.name || 'el campo de batalla'}: El Equipo Alfa (${teamA.map(c => c.name).join(' & ') || 'Alfa'}) y el Equipo Beta (${teamB.map(c => c.name).join(' & ') || 'Beta'}) colisionan en un choque total donde los supervivientes de cada bando se reagrupan en ataques combinados.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  🛡️ Guerra de Facciones (Alfa vs Beta)
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Duelo de Capitanes & Cobertura: Los líderes de cada equipo se baten en duelo singular mientras sus respectivos compañeros libran escaramuzas tácticas de cobertura para brindar ventajas de flanqueo.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  ⚔️ Duelo de Capitanes
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Fusión o Técnica Combinada de Emergencia: Ante el poder abrumador del rival, ambos integrantes del equipo en desventaja ejecutan una sincronización energética al 100% para un asalto final unificado.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  🌀 Sincronía Combinada
                </button>
              </>
            ) : matchMode === 'battle_royale' ? (
              <>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Torneo de Supervivencia Máxima en ${scenario?.name || 'el Coliseo'}: Todos contra todos simultáneamente. El perímetro del mapa se reduce con radiación mortal cada 2 minutos obligando a los gladiadores a luchar en el centro.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  👑 Coliseo de Supervivencia (Zona Reducida)
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Alianza Traicionera: Dos gladiadores forjan un pacto tácito para eliminar al rival de mayor Tier, esperando el momento exacto para traicionarse a traición.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  🗡️ Alianza & Traición
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Cacería del Más Fuerte: Todos los combatientes fijan su objetivo inicial en el luchador con mayor nivel de poder para neutralizar su amenaza antes del combate individual.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  🎯 Cacería del Más Fuerte
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Torneo Épico de Artes Marciales en ${scenario?.name || 'la Arena'}: ${charA?.name || 'Contendiente A'} y ${charB?.name || 'Contendiente B'} miden sus poderes bajo el clamor de las gradas con árbitro oficial y marcador de impactos.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  🏆 Torneo Oficial (${charA?.name} vs ${charB?.name})
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Handicap por Fatiga Crítica: ${charA?.name || 'Contendiente A'} inicia el combate al 50% de su capacidad tras una batalla previa; ${charB?.name || 'Contendiente B'} debe aprovechar la ventaja sin confiarse.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  🩸 Handicap por Fatiga (-50% HP)
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Duelo a Contrareloj: La arena colapsará en 3 minutos debido a una supernova inminente; ambos contendientes deben desplegar sus ataques definitivos de forma inmediata sin fase de tanteo.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  ⏳ Duelo a Contrareloj (3 Min)
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Reglas de Budokai: Victoria por salida de ring (Ring-Out), noqueo de 10 segundos o sumisión técnica. Prohibido matar deliberadamente.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  ⚔️ Reglas de Budokai (Ring-Out)
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Guerra Multiversal sin Piedad: Moral completamente desactivada (Bloodlust Total). ${charA?.name} y ${charB?.name} desatan todas sus técnicas letales desde el microsegundo inicial sin contenerse.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  🌌 Guerra Multiversal (Bloodlust)
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Colisión de Universos: Ambas realidades están al borde del borrado cósmico. Solo la victoria total de uno de los contendientes restaurará la membrana dimensional.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  🔮 Colisión de Universos
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Irrumpe sorpresivamente un 3er contendiente canónico icónico del universo del combate (con nombre oficial completo, ej. Metal Cooler, Broly, Cell Max, Bills, Hit, Sukuna, Thanos) que interrumpe el duelo desatando un choque a tres bandas.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 transition cursor-pointer font-bold"
                >
                  💥 3er Contendiente Canónico
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Aparece un dúo de asalto coordinado (ej. Androides 17 y 18 / Goku Black & Zamasu / Toji & Maki) ejecutando una emboscada 2v1 de alta presión táctica.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 transition cursor-pointer font-bold"
                >
                  👥 Emboscada Dúo (2v1)
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Uno de los luchadores al borde de la aniquilación ejecuta una técnica de fusión de emergencia o metamorfosis prohibida para duplicar su poder a costa de un drenaje crítico de energía.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 transition cursor-pointer font-bold"
                >
                  ⚡ Fusión de Crisis
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Al recibir un golpe de gracia letal, un catalizador fisiológico o divino latente despierta una nueva transformación que invierte de golpe la balanza de poder.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-fuchsia-950/80 hover:bg-fuchsia-900 text-fuchsia-300 border border-fuchsia-700/60 transition cursor-pointer font-bold"
                >
                  👑 Despertar Oculto
                </button>
                <button
                  type="button"
                  onClick={() => setModifiers(prev => ({ 
                    ...prev, 
                    customContext: `Restricción de Transformaciones: Ambos combatientes tienen prohibido usar sus formas divinas o multiplicadores superiores, midiendo pura técnica marcial y Battle IQ en Estado Base.` 
                  }))}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-200 border border-slate-800 transition cursor-pointer"
                >
                  🥋 Duelo en Estado Base
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="text-purple-400 font-bold">💡 Consejo:</span>
            <span>Escribe tu idea con tus palabras (o borrador con faltas) y pulsa <strong className="text-purple-300">"🪄 Pulir & Detallar"</strong>.</span>
          </span>
          {modifiers.customContext && (
            <button
              type="button"
              onClick={() => setModifiers(prev => ({ ...prev, customContext: '' }))}
              className="text-slate-500 hover:text-red-400 transition underline cursor-pointer text-[10px]"
            >
              Borrar texto
            </button>
          )}
        </div>

        <textarea
          rows={3}
          value={modifiers.customContext || ''}
          onChange={(e) => setModifiers(prev => ({ ...prev, customContext: e.target.value }))}
          placeholder="Ej: 'Torneo del Infierno organizado por Janemba. Goku Super llega con el brazo herido tras enfrentar a Beerus, mientras Goku GT tiene prohibido usar la Genkidama...'"
          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-purple-500 focus:outline-none transition resize-y font-sans leading-relaxed placeholder:text-slate-600"
        />

        {/* Barra de Acciones Destacada para Móvil y Desktop */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
          <button
            type="button"
            disabled={isGeneratingPremise || isRefiningPremise}
            onClick={handleRefinePremise}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-purple-950/60 transition cursor-pointer disabled:opacity-50 border border-purple-400/40"
          >
            {isRefiningPremise ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-300" />
                <span>Puliendo & Detallando...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-pink-200 animate-pulse" />
                <span>🪄 Pulir & Detallar con IA (Mejorar Texto)</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isGeneratingPremise || isRefiningPremise}
            onClick={async () => {
              setIsGeneratingPremise(true);
              try {
                const generated = await SimulationEngine.generateQuickPremise(
                  charA || { name: 'Contendiente A' },
                  charB || { name: 'Contendiente B' },
                  scenario || { name: 'Arena Estándar' },
                  aiConfig,
                  matchMode,
                  teamA,
                  teamB,
                  battleRoyale
                );
                setModifiers(prev => ({ ...prev, customContext: generated }));
              } catch (err) {
                alert(`Error al generar premisa: ${err.message || err}`);
              } finally {
                setIsGeneratingPremise(false);
              }
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition cursor-pointer disabled:opacity-50"
          >
            {isGeneratingPremise ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>🎲 Generar Aleatoria</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal Creación de Arena */}
      {isCreatingArena && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" /> Creador de Arena / Escenario
              </h3>
              <button onClick={() => setIsCreatingArena(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddArena} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300">Nombre de la Arena:</label>
                  <button
                    type="button"
                    disabled={isGeneratingArena}
                    onClick={async () => {
                      if (!newArena.name.trim()) {
                        alert('Escribe un nombre de arena primero (ej: "Valle del Fin", "Dimensión del Espejo", "Núcleo de Namek").');
                        return;
                      }
                      setIsGeneratingArena(true);
                      try {
                        const data = await SimulationEngine.generateScenarioWithAi(
                          newArena.name,
                          newArena.universe,
                          aiConfig
                        );
                        setNewArena(prev => ({
                          ...prev,
                          ...data
                        }));
                      } catch (err) {
                        alert('Error al autocompletar arena con IA: ' + err.message);
                      } finally {
                        setIsGeneratingArena(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-[11px] font-bold shadow transition cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingArena ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Generando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>✨ Autocompletar con IA</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ej. Núcleo de Namek en Colapso"
                  value={newArena.name}
                  onChange={(e) => setNewArena(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Universo / Origen:</label>
                  <input
                    type="text"
                    placeholder="Ej. Dragon Ball Z"
                    value={newArena.universe}
                    onChange={(e) => setNewArena(p => ({ ...p, universe: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Gravedad:</label>
                  <input
                    type="text"
                    placeholder="Ej. 100G / Cero Gravedad"
                    value={newArena.gravity}
                    onChange={(e) => setNewArena(p => ({ ...p, gravity: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Temperatura / Clima:</label>
                  <input
                    type="text"
                    placeholder="Ej. 1500°C Magma / Cero Absoluto"
                    value={newArena.temperature}
                    onChange={(e) => setNewArena(p => ({ ...p, temperature: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Peligros Ambientales:</label>
                  <input
                    type="text"
                    placeholder="Ej. Erupciones y colapso en 5 min"
                    value={newArena.terrainEffect}
                    onChange={(e) => setNewArena(p => ({ ...p, terrainEffect: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Descripción Sensorial (Atmósfera):</label>
                <textarea
                  rows={2}
                  placeholder="Describe los olores, sonidos, iluminación y textura del entorno..."
                  value={newArena.sensory}
                  onChange={(e) => setNewArena(p => ({ ...p, sensory: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingArena(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer shadow-lg shadow-red-950/50"
                >
                  Guardar Arena
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
