import React, { useState, useMemo } from 'react';
import { 
  Scale, Zap, Shield, Battery, Brain, Sparkles, AlertOctagon, Swords, 
  Crosshair, BarChart3, Activity, Users, Crown, Flame, Trophy, Layers,
  Search, Filter, Check, Trash2, CheckCircle2, Star, RefreshCw, X
} from 'lucide-react';
import { ROSTER_IMAGES_MAP } from '../data/rosterImagesMap';
import { DB_PACKS } from '../services/franchiseHelper';

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

function getTierScore(tierString) {
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

// Radar Chart Component (SVG Hexagon)
function RadarChart({ nameA, nameB, colorA = '#ef4444', colorB = '#3b82f6', stats }) {
  const size = 260;
  const center = size / 2;
  const radius = 90;
  const angleStep = (Math.PI * 2) / stats.length;

  const getCoordinates = (index, value) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const polyA = stats.map((s, i) => {
    const pt = getCoordinates(i, s.valA);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  const polyB = stats.map((s, i) => {
    const pt = getCoordinates(i, s.valB);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  const levels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grids */}
        {levels.map((lvl, lIdx) => {
          const gridPoints = stats.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = lvl * radius;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(' ');
          return (
            <polygon
              key={lIdx}
              points={gridPoints}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray={lvl < 1 ? "3 3" : "none"}
            />
          );
        })}

        {/* Axis Lines & Labels */}
        {stats.map((stat, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const outerX = center + radius * Math.cos(angle);
          const outerY = center + radius * Math.sin(angle);
          const labelX = center + (radius + 22) * Math.cos(angle);
          const labelY = center + (radius + 18) * Math.sin(angle);

          return (
            <g key={i}>
              <line
                x1={center}
                y1={center}
                x2={outerX}
                y2={outerY}
                stroke="#1e293b"
                strokeWidth="1.5"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-slate-400 text-[9px] font-mono font-bold"
              >
                {stat.short}
              </text>
            </g>
          );
        })}

        {/* Side A Polygon */}
        <polygon
          points={polyA}
          fill={`${colorA}33`}
          stroke={colorA}
          strokeWidth="2"
        />
        {stats.map((s, i) => {
          const pt = getCoordinates(i, s.valA);
          return <circle key={`a-${i}`} cx={pt.x} cy={pt.y} r="3" fill={colorA} />;
        })}

        {/* Side B Polygon */}
        <polygon
          points={polyB}
          fill={`${colorB}33`}
          stroke={colorB}
          strokeWidth="2"
        />
        {stats.map((s, i) => {
          const pt = getCoordinates(i, s.valB);
          return <circle key={`b-${i}`} cx={pt.x} cy={pt.y} r="3" fill={colorB} />;
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-[11px] font-mono flex-wrap">
        <span className="flex items-center gap-1.5 font-bold" style={{ color: colorA }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorA }} /> {nameA}
        </span>
        <span className="flex items-center gap-1.5 font-bold" style={{ color: colorB }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorB }} /> {nameB}
        </span>
      </div>
    </div>
  );
}

export default function MatchupMatrix({ 
  charA, 
  charB, 
  modifiers = {}, 
  matchMode = '1v1', 
  teamA = [], 
  teamB = [], 
  battleRoyale = [],
  characters = []
}) {
  const [viewMode, setViewMode] = useState('radar'); // 'radar' | 'bars' | 'global'
  const [selectedForMatrix, setSelectedForMatrix] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [universeFilter, setUniverseFilter] = useState('Todos');
  const [dbPackFilter, setDbPackFilter] = useState('none'); // packs de Dragon Ball
  const [sagaFilter, setSagaFilter] = useState('Todos');
  const [tierFilter, setTierFilter] = useState('Todos');

  // Universe & Saga Extraction
  const allUniverses = useMemo(() => {
    return Array.from(new Set((characters || []).map(c => c.universe).filter(Boolean))).sort();
  }, [characters]);

  const allSagas = useMemo(() => {
    return Array.from(new Set((characters || []).map(c => c.saga).filter(Boolean))).sort();
  }, [characters]);

  // Filtered Characters for Matrix Search
  const filteredCharacters = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return (characters || []).filter(c => {
      const matchesSearch = !q || 
        c.name?.toLowerCase().includes(q) || 
        c.alias?.toLowerCase().includes(q) || 
        c.universe?.toLowerCase().includes(q) || 
        c.saga?.toLowerCase().includes(q) || 
        c.tier?.toLowerCase().includes(q);
      
      const matchesUniverse = (dbPackFilter !== 'none' && universeFilter === 'Todos')
        ? (DB_PACKS.find(p => p.id === dbPackFilter)?.matches(c) || false)
        : (universeFilter === 'Todos' || c.universe === universeFilter);
      const matchesSaga = sagaFilter === 'Todos' || c.saga === sagaFilter;
      
      const tLow = (c.tier || '').toLowerCase();
      const matchesTier = tierFilter === 'Todos' || (
        tierFilter === 'Tier 1-2' ? (tLow.includes('1-a') || tLow.includes('1-b') || tLow.includes('1-c') || tLow.includes('2-a') || tLow.includes('2-b') || tLow.includes('2-c') || tLow.includes('outer') || tLow.includes('hyper') || tLow.includes('multi')) :
        tierFilter === 'Tier 3-4' ? (tLow.includes('3-a') || tLow.includes('3-b') || tLow.includes('3-c') || tLow.includes('4-a') || tLow.includes('4-b') || tLow.includes('4-c') || tLow.includes('solar') || tLow.includes('galac') || tLow.includes('estelar')) :
        tierFilter === 'Tier 5-7' ? (tLow.includes('5-a') || tLow.includes('5-b') || tLow.includes('5-c') || tLow.includes('6-a') || tLow.includes('6-b') || tLow.includes('7-a') || tLow.includes('7-b') || tLow.includes('planet') || tLow.includes('ciud') || tLow.includes('contin')) :
        tierFilter === 'Tier 8-10' ? (tLow.includes('8-a') || tLow.includes('8-b') || tLow.includes('9-a') || tLow.includes('9-b') || tLow.includes('tier 10') || tLow.includes('muro') || tLow.includes('edific')) : true
      );

      return matchesSearch && matchesUniverse && matchesSaga && matchesTier;
    });
  }, [characters, searchQuery, universeFilter, dbPackFilter, sagaFilter, tierFilter]);

  // Quick Selection Helpers
  const handleSelectTop5 = () => {
    const sorted = [...filteredCharacters].sort((a, b) => getTierScore(b.tier) - getTierScore(a.tier));
    setSelectedForMatrix(sorted.slice(0, 5));
  };

  const handleSelectTop10 = () => {
    const sorted = [...filteredCharacters].sort((a, b) => getTierScore(b.tier) - getTierScore(a.tier));
    setSelectedForMatrix(sorted.slice(0, 10));
  };

  const handleClearSelection = () => {
    setSelectedForMatrix([]);
  };

  // --- Multi-Fighter Aggregators ---
  const activeFightersA = matchMode === 'teams' ? teamA : [charA].filter(Boolean);
  const activeFightersB = matchMode === '1vN' || matchMode === 'teams' ? teamB : [charB].filter(Boolean);

  const squadNameA = matchMode === '1vN' 
    ? `👹 Boss: ${charA?.name || 'Titán'}` 
    : matchMode === 'teams' 
      ? `🛡️ Equipo Alfa (${teamA.map(c => c.name).join(' + ') || 'Alfa'})` 
      : charA?.name || 'Contendiente A';

  const squadNameB = matchMode === '1vN' 
    ? `⚔️ Alianza: ${teamB.map(c => c.name).join(' + ') || 'Escuadrón'}` 
    : matchMode === 'teams' 
      ? `⚔️ Equipo Beta (${teamB.map(c => c.name).join(' + ') || 'Beta'})` 
      : charB?.name || 'Contendiente B';

  // Compute Squad Scores
  const maxScoreA = Math.max(...activeFightersA.map(c => getTierScore(c.tier)), 1);
  const maxScoreB = Math.max(...activeFightersB.map(c => getTierScore(c.tier)), 1);

  // Squad Synergy: extra fighters boost aggregated stamina, attack opportunities and hax pool
  const synergyBonusA = Math.min(25, (activeFightersA.length - 1) * 12);
  const synergyBonusB = Math.min(30, (activeFightersB.length - 1) * 15);

  // Union of all Unique Hax Tags across squad
  const allHaxA = Array.from(new Set(activeFightersA.flatMap(c => c.haxTags || [])));
  const allHaxB = Array.from(new Set(activeFightersB.flatMap(c => c.haxTags || [])));

  const tierDiff = Math.abs(maxScoreA - maxScoreB);
  const isMismatch = tierDiff >= 3 && !modifiers.statsEqualized && matchMode === '1v1';

  // 6-Axis Comparison Array
  const STATS_6_AXIS = [
    { 
      label: 'Potencia de Ataque (AP)', 
      short: 'AP',
      valA: Math.min(100, Math.max(15, maxScoreA * 8.5 + (matchMode === '1vN' ? 10 : synergyBonusA))), 
      valB: Math.min(100, Math.max(15, maxScoreB * 8.5 + synergyBonusB)), 
      icon: <Zap className="w-3 h-3 text-amber-400" /> 
    },
    { 
      label: 'Velocidad de Reacción & Desplazamiento', 
      short: 'VEL',
      valA: modifiers.speedEqualized ? 80 : Math.min(100, Math.max(20, maxScoreA * 8)), 
      valB: modifiers.speedEqualized ? 80 : Math.min(100, Math.max(20, maxScoreB * 8)), 
      icon: <Activity className="w-3 h-3 text-emerald-400" /> 
    },
    { 
      label: 'Durabilidad & Regeneración Combinada', 
      short: 'DUR',
      valA: Math.min(100, Math.max(20, maxScoreA * 8 + (matchMode === '1vN' ? 20 : synergyBonusA))), 
      valB: Math.min(100, Math.max(20, maxScoreB * 8 + synergyBonusB)), 
      icon: <Shield className="w-3 h-3 text-cyan-400" /> 
    },
    { 
      label: 'Battle IQ & Sinergia Táctica', 
      short: 'BIQ',
      valA: Math.min(100, 65 + (activeFightersA.some(c => c.battleIQ?.toLowerCase().includes('genio')) ? 25 : 0) + synergyBonusA), 
      valB: Math.min(100, 65 + (activeFightersB.some(c => c.battleIQ?.toLowerCase().includes('genio')) ? 25 : 0) + synergyBonusB), 
      icon: <Brain className="w-3 h-3 text-indigo-400" /> 
    },
    { 
      label: 'Alcance & Control del Escenario', 
      short: 'RNG',
      valA: Math.min(100, (activeFightersA.some(c => c.range?.toLowerCase().includes('universal') || c.range?.toLowerCase().includes('planet')) ? 95 : 60) + (matchMode === '1vN' ? 10 : 0)), 
      valB: Math.min(100, (activeFightersB.some(c => c.range?.toLowerCase().includes('universal') || c.range?.toLowerCase().includes('planet')) ? 95 : 60) + synergyBonusB), 
      icon: <Crosshair className="w-3 h-3 text-pink-400" /> 
    },
    { 
      label: 'Arsenal de Hax & Pasivas Totales', 
      short: 'HAX',
      valA: Math.min(100, 25 + allHaxA.length * 16), 
      valB: Math.min(100, 25 + allHaxB.length * 16), 
      icon: <Sparkles className="w-3 h-3 text-fuchsia-400" /> 
    }
  ];

  return (
    <div className="rounded-2xl glass-panel p-5 border border-slate-800/80 shadow-xl space-y-5 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-cinzel">
            Matriz de Matchup & Gráfico Radial
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
            {matchMode === '1vN' ? '👹 RAID BOSS (1 vs Varios)' : matchMode === 'teams' ? '🛡️ GUERRA DE EQUIPOS' : matchMode === 'battle_royale' ? '👑 BATTLE ROYALE' : '⚔️ DUELO 1v1'}
          </span>
        </div>
        
        {matchMode !== 'battle_royale' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setViewMode('radar')} className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${ viewMode === 'radar' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700' }`}>📊 Radar</button>
            <button onClick={() => setViewMode('bars')} className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${ viewMode === 'bars' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700' }`}>📊 Barras</button>
            <button onClick={() => setViewMode('global')} className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${ viewMode === 'global' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700' }`}>🌐 Matriz Global</button>
          </div>
        )}
      </div>

      {/* Battle Royale Dedicated View */}
      {matchMode === 'battle_royale' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {battleRoyale.map((char, idx) => {
              const tScore = getTierScore(char.tier);
              const threatPercent = Math.min(100, Math.round((tScore / 12) * 80 + (char.haxTags?.length || 0) * 5));
              return (
                <div key={char.id || idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-amber-500/50 transition shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs line-clamp-1">{char.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
                      {char.tier?.split('|')[0]?.trim() || 'Tier'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-1">
                    <p>⚡ Vel: <span className="text-slate-300">{char.speed?.combat || 'FTL'}</span></p>
                    <p>✨ Hax: <span className="text-amber-300 font-bold">{char.haxTags?.length || 0} técnicas</span></p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Índice de Amenaza:</span>
                      <span className="font-bold text-amber-400">{threatPercent}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-950 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full" style={{ width: `${threatPercent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'global' ? (
        <div className="space-y-4">
          {/* Top Search & Filter Bar */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="🔍 Buscar luchador por nombre, alias, saga, universo o tier..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 font-mono transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns and Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Universe Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold">Universo:</span>
                  <select
                    value={universeFilter}
                    onChange={e => setUniverseFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px] font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Todos">Todos ({allUniverses.length})</option>
                    {allUniverses.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                {/* DB Pack Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-orange-400 font-bold">🐉 Pack DB:</span>
                  <select
                    value={dbPackFilter}
                    onChange={e => { setDbPackFilter(e.target.value); if (e.target.value !== 'none') setUniverseFilter('Todos'); }}
                    className="bg-slate-900 border border-orange-700/50 rounded-lg px-2 py-1 text-white text-[11px] font-mono focus:border-orange-500 focus:outline-none max-w-[150px]"
                  >
                    <option value="none">Sin pack (todos)</option>
                    {DB_PACKS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Saga Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold">Saga:</span>
                  <select
                    value={sagaFilter}
                    onChange={e => setSagaFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px] font-mono focus:border-amber-500 focus:outline-none max-w-[140px] truncate"
                  >
                    <option value="Todos">Todas las Sagas</option>
                    {allSagas.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Tier Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold">Nivel Tier:</span>
                  <select
                    value={tierFilter}
                    onChange={e => setTierFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-[11px] font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Todos">Todos los Tiers</option>
                    <option value="Tier 1-2">Tier 1-2 (Cósmico / Multiversal)</option>
                    <option value="Tier 3-4">Tier 3-4 (Galáctico / Solar)</option>
                    <option value="Tier 5-7">Tier 5-7 (Planetario / Ciudad)</option>
                    <option value="Tier 8-10">Tier 8-10 (Urbano / Humano)</option>
                  </select>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleSelectTop5}
                  className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/50 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Star className="w-3 h-3 text-amber-400" /> Top 5
                </button>
                <button
                  type="button"
                  onClick={handleSelectTop10}
                  className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/50 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Crown className="w-3 h-3 text-purple-400" /> Top 10
                </button>
                {selectedForMatrix.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Limpiar ({selectedForMatrix.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Character Multi-Select Grid (up to 10) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-amber-400" />
                <span>Luchadores para la Matriz ({selectedForMatrix.length}/10):</span>
              </span>
              <span className="text-slate-400 text-[10px]">
                {filteredCharacters.length} disponibles
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pr-1 custom-scrollbar">
              {filteredCharacters.map(c => {
                const isSelected = selectedForMatrix.some(s => s.id === c.id);
                const avatarUrl = ROSTER_IMAGES_MAP[c.id] || c.avatar || c.image;
                const tierScore = getTierScore(c.tier);
                const isHighTier = tierScore >= 95;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedForMatrix(prev => prev.filter(s => s.id !== c.id));
                      } else if (selectedForMatrix.length < 10) {
                        setSelectedForMatrix(prev => [...prev, c]);
                      }
                    }}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer text-left transition-all relative overflow-hidden group select-none ${
                      isSelected 
                        ? 'bg-amber-950/50 border-amber-500/80 text-white shadow-md shadow-amber-950/50 ring-1 ring-amber-500/50' 
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Character Avatar */}
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt={c.name} 
                          className="w-full h-full object-contain object-center drop-shadow transition duration-200 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-500">
                          {c.name?.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Character Info */}
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-bold text-xs truncate leading-tight group-hover:text-amber-300 transition">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {c.universe || 'Canon'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-bold uppercase truncate max-w-[120px] ${
                          isHighTier ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                        }`}>
                          {c.tier?.split('|')[0]?.trim() || 'Tier'}
                        </span>
                        {c.haxTags?.length > 0 && (
                          <span className="text-[8.5px] text-slate-500 font-mono">
                            {c.haxTags.length} Hax
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Checkbox indicator */}
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                      isSelected ? 'bg-amber-500 border-amber-400 text-black' : 'border-slate-700 bg-slate-900'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}

              {filteredCharacters.length === 0 && (
                <div className="col-span-full p-6 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
                  No se encontraron personajes con los filtros aplicados.
                </div>
              )}
            </div>
          </div>

    {/* N x N Matrix Table */}
    {selectedForMatrix.length >= 2 && (() => {
      // Win counts
      const wins = Object.fromEntries(selectedForMatrix.map(c => [c.id, 0]));

      const getMatchupResult = (cA, cB) => {
        if (cA.id === cB.id) return 'self';
        const TIER_SCORE = (t) => {
          if (!t) return 10;
          const patterns = [
            [/High\s*1-A/i, 140], [/1-A/i, 130], [/1-B/i, 120], [/1-C/i, 115],
            [/2-A/i, 110], [/2-B/i, 105], [/2-C/i, 100],
            [/3-A/i, 95], [/3-B/i, 90], [/3-C/i, 85],
            [/4-A/i, 80], [/4-B/i, 75], [/4-C/i, 70],
            [/5-A/i, 65], [/5-B/i, 60], [/5-C/i, 55],
            [/6-A/i, 50], [/6-B/i, 45], [/6-C/i, 40],
            [/7-A/i, 35], [/7-B/i, 30], [/7-C/i, 25],
            [/8-A/i, 20], [/8-B/i, 16], [/8-C/i, 13],
            [/9-A/i, 10], [/9-B/i, 8], [/9-C/i, 6],
          ];
          for (const [p, s] of patterns) if (p.test(t)) return s;
          const m = t.match(/(\d+)/);
          return m ? Math.max(1, 80 - parseInt(m[1]) * 5) : 10;
        };
        const sa = TIER_SCORE(cA.tier) + (cA.haxTags?.length || 0) * 2;
        const sb = TIER_SCORE(cB.tier) + (cB.haxTags?.length || 0) * 2;
        const diff = sa - sb;
        if (Math.abs(diff) <= 4) return 'tie';
        return diff > 0 ? 'win' : 'loss';
      };

      // Count wins
      selectedForMatrix.forEach(cA => {
        selectedForMatrix.forEach(cB => {
          if (cA.id !== cB.id && getMatchupResult(cA, cB) === 'win') wins[cA.id]++;
        });
      });

      const maxWins = Math.max(...Object.values(wins));
      const champId = Object.entries(wins).find(([, w]) => w === maxWins)?.[0];
      const champ = selectedForMatrix.find(c => c.id === champId);

      return (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="text-[9px] font-mono min-w-full">
              <thead>
                <tr className="bg-slate-900">
                  <th className="p-2 text-slate-500 sticky left-0 bg-slate-900">⚔️</th>
                  {selectedForMatrix.map(c => (
                    <th key={c.id} className="p-2 text-slate-300 font-bold text-center min-w-[60px] truncate max-w-[60px]" title={c.name}>
                      {c.name.length > 8 ? c.name.slice(0, 8) + '…' : c.name}
                    </th>
                  ))}
                  <th className="p-2 text-amber-400 font-bold">Wins</th>
                </tr>
              </thead>
              <tbody>
                {selectedForMatrix.map(cA => (
                  <tr key={cA.id} className="border-t border-slate-800/50 hover:bg-slate-800/20">
                    <td className="p-2 text-slate-300 font-bold sticky left-0 bg-slate-950 max-w-[80px] truncate" title={cA.name}>
                      {cA.id === champId ? '🏆 ' : ''}{cA.name.length > 10 ? cA.name.slice(0, 10) + '…' : cA.name}
                    </td>
                    {selectedForMatrix.map(cB => {
                      const result = getMatchupResult(cA, cB);
                      return (
                        <td key={cB.id} className={`p-2 text-center font-bold ${
                          result === 'self' ? 'text-slate-600 bg-slate-900/40' :
                          result === 'win' ? 'text-emerald-400 bg-emerald-950/30' :
                          result === 'tie' ? 'text-yellow-400 bg-yellow-950/20' :
                          'text-red-400 bg-red-950/20'
                        }`}>
                          {result === 'self' ? '—' : result === 'win' ? '✓' : result === 'tie' ? '~' : '✗'}
                        </td>
                      );
                    })}
                    <td className="p-2 text-amber-300 font-bold text-center">{wins[cA.id]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {champ && (
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-700/50 flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-amber-300 font-bold text-sm">{champ.name}</p>
                <p className="text-amber-500 text-[10px]">{champ.tier} — {wins[champId]} victorias en la matriz</p>
              </div>
            </div>
          )}
        </div>
      );
    })()}

    {selectedForMatrix.length < 2 && (
      <div className="p-4 text-center text-slate-400 text-xs border border-dashed border-slate-700 rounded-xl">
        Selecciona al menos 2 personajes para activar la Matriz Global
      </div>
    )}
  </div>
) : (
        /* 1v1, 1vN Raid Boss & Teams View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Visualizer */}
          <div className="lg:col-span-6 flex justify-center">
            {viewMode === 'radar' ? (
              <RadarChart 
                nameA={squadNameA} 
                nameB={squadNameB} 
                colorA={matchMode === '1vN' ? '#dc2626' : '#ef4444'}
                colorB={matchMode === '1vN' ? '#10b981' : '#3b82f6'}
                stats={STATS_6_AXIS} 
              />
            ) : (
              <div className="w-full space-y-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
                {STATS_6_AXIS.map((stat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5">{stat.icon} {stat.label}</span>
                      <span>{stat.valA}% vs {stat.valB}%</span>
                    </div>
                    <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-900 border border-slate-800">
                      <div 
                        className="bg-red-500 transition-all duration-500" 
                        style={{ width: `${(stat.valA / (stat.valA + stat.valB)) * 100}%` }} 
                      />
                      <div 
                        className="bg-blue-500 transition-all duration-500" 
                        style={{ width: `${(stat.valB / (stat.valA + stat.valB)) * 100}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Side Fighter Cards & Squad Roster Breakdown */}
          <div className="lg:col-span-6 space-y-3">
            {/* Squad / Side A Card */}
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-400 text-xs flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> {squadNameA}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 font-bold">
                  {matchMode === '1vN' ? 'BUFF RAID BOSS' : activeFightersA[0]?.tier || 'Tier'}
                </span>
              </div>
              
              {/* Member Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeFightersA.map((c, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-300 border border-slate-700">
                    👤 {c.name} ({c.tier?.split('|')[0]?.trim()})
                  </span>
                ))}
              </div>

              <div className="text-[11px] text-slate-300 space-y-1 pt-1">
                <p>✨ <span className="text-slate-400">Hax Combinados ({allHaxA.length}):</span> {allHaxA.slice(0, 4).join(', ') || 'Fuerza bruta'}{allHaxA.length > 4 ? ` +${allHaxA.length - 4}` : ''}</p>
                <p>🎯 <span className="text-slate-400">Estrategia Clave:</span> {matchMode === '1vN' ? 'Destrucción masiva en área y control de masas.' : 'Presión individual y rupturas de guardia.'}</p>
              </div>
            </div>

            {/* Squad / Side B Card */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> {squadNameB}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-bold">
                  {activeFightersB.length} LUCHADORES
                </span>
              </div>

              {/* Member Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeFightersB.map((c, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-300 border border-slate-700">
                    ⚔️ {c.name} ({c.tier?.split('|')[0]?.trim()})
                  </span>
                ))}
              </div>

              <div className="text-[11px] text-slate-300 space-y-1 pt-1">
                <p>✨ <span className="text-slate-400">Hax Coordinados ({allHaxB.length}):</span> {allHaxB.slice(0, 4).join(', ') || 'Coordinación táctica'}{allHaxB.length > 4 ? ` +${allHaxB.length - 4}` : ''}</p>
                <p>🎯 <span className="text-slate-400">Estrategia Clave:</span> {matchMode === '1vN' ? 'Foco coordinado en debilidades anatómicas y distracción por flancos.' : 'Sincronía de relevos y combinación de finishers.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mismatch Alert */}
      {isMismatch && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-red-500 shrink-0 animate-pulse" />
          <div className="text-xs">
            <span className="text-red-400 font-bold block">⚠️ ADVERTENCIA: DESEQUILIBRIO EXTREMO (MISMATCH)</span>
            <p className="text-slate-300 text-[11px] mt-0.5">
              Existe una brecha colosal de escala ({charA.tier} vs {charB.tier}). Salvo anulación por Hax conceptual o activar <em>Stats Equalized</em>, la victoria se resolverá por Blitz o Stomp unilateral.
            </p>
          </div>
        </div>
      )}

      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
        <span className="text-amber-400 font-bold flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> Regla Anti-Inflación APEX:
        </span>
        <span className="text-slate-400">Las sinergias de escuadrón suman Hax y stamina coordinada sin inflar Tiers ficticios.</span>
      </div>
    </div>
  );
}
