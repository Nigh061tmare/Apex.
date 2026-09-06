import React, { useState } from 'react';
import { Shuffle, Zap, Sparkles, X, Globe, Swords, Target, Crosshair, Users, Crown, Flame, Shield } from 'lucide-react';
import { getRosterSync } from '../data/rosterLoader';
import { SCENARIOS } from '../data/scenarios';
import { getTranslation } from '../services/i18n';

// Normalizador estricto de franquicias para evitar confusiones de universo
const getFranchise = (u) => {
  const s = (u || '').toLowerCase();
  if (s.includes('shuumatsu') || s.includes('valkyrie') || s.includes('ragnarok')) return 'shuumatsu';
  if (s.includes('one punch') || s.includes('opm') || s.includes('saitama') || s.includes('garou')) return 'opm';
  if (s.includes('my hero') || s.includes('boku no hero') || s.includes('mha')) return 'mha';
  if (s.includes('baki') || s.includes('hanma') || s.includes('grappler')) return 'baki';
  if (s.includes('dragon ball') || s.includes('kakumei') || s.includes('new hope') || s.includes('brokoly') || s.includes('after') || s.includes('multiverse')) return 'dragon_ball';
  if (s.includes('jujutsu') || s.includes('jjk')) return 'jjk';
  if (s.includes('demon slayer') || s.includes('kimetsu') || s.includes('yaiba')) return 'kny';
  if (s.includes('hunter')) return 'hxh';
  if (s.includes('one piece')) return 'one_piece';
  if (s.includes('naruto') || s.includes('boruto')) return 'naruto';
  if (s.includes('bleach')) return 'bleach';
  if (s.includes('marvel')) return 'marvel';
  if (s.includes('dc') || s.includes('batman') || s.includes('superman')) return 'dc';
  if (s.includes('jojo')) return 'jojo';
  if (s.includes('chainsaw')) return 'csm';
  if (s.includes('invincible')) return 'invincible';
  if (s.includes('boys')) return 'the_boys';
  if (s.includes('zeppeli') || s.includes('josh') || s.includes('apex') || s.includes('rocky')) return 'apex_oc';
  return s;
};

export default function RandomMatchmakerModal({ isOpen, onClose, onMatchReady, onAIGenerate, allCharacters, lang = 'es' }) {
  const [randomMode, setRandomMode] = useState('1v1'); // 1v1, 1vN, teams, br
  const [raidSize, setRaidSize] = useState(3); // 2, 3, 4, 5
  const [teamSize, setTeamSize] = useState(3); // 2, 3, 4, 5
  const [brSize, setBrSize] = useState(6); // 3 to 10
  const [universeFilter, setUniverseFilter] = useState('any'); 
  const [tierFilter, setTierFilter] = useState('fair'); // fair, chaos

  if (!isOpen) return null;

  const t = (k) => getTranslation(lang, k);
  const sourceChars = allCharacters && allCharacters.length > 0 ? allCharacters : getRosterSync();

  const getTierValue = (t) => {
    if (!t) return 40;
    if (t.includes('1-A') || t.includes('Outerversal')) return 100;
    if (t.includes('1-C') || t.includes('2-A') || t.includes('Multiversal')) return 85;
    if (t.includes('2-C') || t.includes('Universal')) return 75;
    if (t.includes('3-A') || t.includes('3-B') || t.includes('Galact')) return 65;
    if (t.includes('4-A') || t.includes('4-B') || t.includes('Sistema') || t.includes('Estelar')) return 50;
    if (t.includes('5-A') || t.includes('5-B') || t.includes('Planet')) return 35;
    if (t.includes('Luna')) return 25;
    return 15;
  };

  const handleRandomize = () => {
    let pool = [...sourceChars];

    // 1. Filtrar pool según el universo elegido
    if (universeFilter !== 'any' && universeFilter !== 'same' && universeFilter !== 'cross') {
      pool = pool.filter(c => getFranchise(c.universe) === universeFilter);
    }

    if (pool.length < 2) pool = [...sourceChars];

    // 2. Ejecutar según modo
    if (randomMode === '1v1') {
      const charA = pool[Math.floor(Math.random() * pool.length)];
      let validB = pool.filter(c => c.id !== charA.id);

      if (universeFilter === 'same') {
        const frA = getFranchise(charA.universe);
        validB = validB.filter(c => getFranchise(c.universe) === frA);
        if (validB.length === 0) validB = pool.filter(c => c.id !== charA.id);
      } else if (universeFilter === 'cross') {
        const frA = getFranchise(charA.universe);
        validB = validB.filter(c => getFranchise(c.universe) !== frA);
        if (validB.length === 0) validB = pool.filter(c => c.id !== charA.id);
      }

      if (tierFilter === 'fair') {
        const valA = getTierValue(charA.tier);
        const fairOps = validB.filter(c => Math.abs(getTierValue(c.tier) - valA) <= 15);
        if (fairOps.length > 0) validB = fairOps;
      }

      const charB = validB[Math.floor(Math.random() * validB.length)];
      const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];

      onMatchReady({
        matchMode: '1v1',
        charA,
        charB,
        scenarioId: scenario.id
      });
    } else if (randomMode === '1vN') {
      // Boss Raid
      const boss = pool[Math.floor(Math.random() * pool.length)];
      let validOpponents = pool.filter(c => c.id !== boss.id);

      if (universeFilter === 'same') {
        const frBoss = getFranchise(boss.universe);
        validOpponents = validOpponents.filter(c => getFranchise(c.universe) === frBoss);
      } else if (universeFilter === 'cross') {
        const frBoss = getFranchise(boss.universe);
        validOpponents = validOpponents.filter(c => getFranchise(c.universe) !== frBoss);
      }

      if (validOpponents.length < raidSize) validOpponents = pool.filter(c => c.id !== boss.id);

      const squad = [];
      for (let i = 0; i < raidSize; i++) {
        if (validOpponents.length === 0) break;
        const idx = Math.floor(Math.random() * validOpponents.length);
        squad.push(validOpponents[idx]);
        validOpponents.splice(idx, 1);
      }

      const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
      onMatchReady({
        matchMode: '1vN',
        charA: boss,
        charB: squad[0],
        teamB: squad,
        scenarioId: scenario.id
      });
    } else if (randomMode === 'teams') {
      // Guerra de Equipos
      const getSquad = (excludeIds, targetFranchise) => {
        let valid = pool.filter(c => !excludeIds.includes(c.id));
        if (targetFranchise) valid = valid.filter(c => getFranchise(c.universe) === targetFranchise);
        if (valid.length < teamSize) valid = pool.filter(c => !excludeIds.includes(c.id));

        const sq = [];
        for (let i = 0; i < teamSize; i++) {
          if (valid.length === 0) break;
          const idx = Math.floor(Math.random() * valid.length);
          sq.push(valid[idx]);
          excludeIds.push(valid[idx].id);
          valid.splice(idx, 1);
        }
        return sq;
      };

      const exclude = [];
      const teamA = getSquad(exclude);
      let targetFrB = null;

      if (universeFilter === 'same' && teamA.length > 0) {
        targetFrB = getFranchise(teamA[0].universe);
      }

      let teamB = getSquad(exclude, targetFrB);

      if (universeFilter === 'cross' && teamA.length > 0) {
        const frA = getFranchise(teamA[0].universe);
        teamB = pool.filter(c => !exclude.includes(c.id) && getFranchise(c.universe) !== frA).slice(0, teamSize);
      }

      const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
      onMatchReady({
        matchMode: 'teams',
        charA: teamA[0],
        charB: teamB[0] || pool[0],
        teamA,
        teamB: teamB.length > 0 ? teamB : [pool[1]],
        scenarioId: scenario.id
      });
    } else if (randomMode === 'br') {
      // Battle Royale
      let valid = [...pool];
      const br = [];
      for (let i = 0; i < brSize; i++) {
        if (valid.length === 0) break;
        const idx = Math.floor(Math.random() * valid.length);
        br.push(valid[idx]);
        valid.splice(idx, 1);
      }
      const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
      onMatchReady({
        matchMode: 'battle_royale',
        charA: br[0],
        charB: br[1] || br[0],
        battleRoyale: br,
        scenarioId: scenario.id
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-6 max-w-xl w-full shadow-[0_0_50px_rgba(217,119,6,0.25)] font-mono text-xs relative space-y-4 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer">
          <X className="w-5 h-5" />
        </button>
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-amber-300 flex items-center gap-2 font-cinzel">
            <Shuffle className="w-5 h-5 text-amber-400" />
            <span>Matchmaking Cuántico & Azar Pro</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Genera alineaciones aleatorias equilibradas, incursiones Boss Raid o guerras multiversales en 1 clic.
          </p>
        </div>

        {/* 1. Modalidad de Combate */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 font-cinzel">
            <Swords className="w-3.5 h-3.5 text-cyan-400" /> Modalidad de Combate
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: '1v1', label: '1v1 Duelo', icon: Swords },
              { id: '1vN', label: 'Boss Raid', icon: Flame },
              { id: 'teams', label: 'Equipos', icon: Users },
              { id: 'br', label: 'Battle Royale', icon: Crown }
            ].map(m => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setRandomMode(m.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    randomMode === m.id
                      ? 'bg-gradient-to-br from-cyan-950 to-slate-900 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/60'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-opciones de tamaño para Raid, Equipos y BR */}
        {randomMode === '1vN' && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-red-900/40 space-y-1.5">
            <span className="text-[10px] text-red-300 font-bold block">Tamaño del Escuadrón de Asalto (Raid):</span>
            <div className="flex gap-2">
              {[2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setRaidSize(s)}
                  className={`flex-1 py-1 rounded-lg font-bold text-[10px] border transition cursor-pointer ${
                    raidSize === s ? 'bg-red-600 text-white border-red-400 shadow' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  1 vs {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {randomMode === 'teams' && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-blue-900/40 space-y-1.5">
            <span className="text-[10px] text-blue-300 font-bold block">Formato de Guerra de Equipos:</span>
            <div className="flex gap-2">
              {[2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setTeamSize(s)}
                  className={`flex-1 py-1 rounded-lg font-bold text-[10px] border transition cursor-pointer ${
                    teamSize === s ? 'bg-blue-600 text-white border-blue-400 shadow' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {s} vs {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {randomMode === 'br' && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-900/40 space-y-1.5">
            <span className="text-[10px] text-purple-300 font-bold block">Número de Luchadores en Battle Royale:</span>
            <div className="flex gap-1.5 flex-wrap">
              {[3, 4, 5, 6, 8, 10].map(s => (
                <button
                  key={s}
                  onClick={() => setBrSize(s)}
                  className={`px-3 py-1 rounded-lg font-bold text-[10px] border transition cursor-pointer ${
                    brSize === s ? 'bg-purple-600 text-white border-purple-400 shadow' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {s} Fighters
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. Filtro de Universo & Franquicia */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5 font-cinzel">
            <Globe className="w-3.5 h-3.5 text-purple-400" /> Filtro de Universo & Franquicia
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
            {[
              { id: 'any', label: '🌐 Todo el Multiverso' },
              { id: 'same', label: '🔒 Mismo Verse' },
              { id: 'cross', label: '⚡ Cross-Verse Puro' },
              { id: 'shuumatsu', label: '⚔️ Shuumatsu no Valkyrie' },
              { id: 'opm', label: '🥊 One Punch Man' },
              { id: 'mha', label: '💥 My Hero Academia' },
              { id: 'baki', label: '🥋 Baki the Grappler' },
              { id: 'kny', label: '🗡️ Demon Slayer' },
              { id: 'jjk', label: '👁️ Jujutsu Kaisen' },
              { id: 'hxh', label: '🏹 Hunter x Hunter' },
              { id: 'dragon_ball', label: '🐉 Dragon Ball' },
              { id: 'one_piece', label: '🏴‍☠️ One Piece' },
              { id: 'naruto', label: '🍥 Naruto' },
              { id: 'bleach', label: '⚡ Bleach' },
              { id: 'marvel', label: '⚡ Marvel' },
              { id: 'dc', label: '🦇 DC Comics' },
              { id: 'jojo', label: '🌀 JoJo Bizarre' },
              { id: 'csm', label: '⛓️ Chainsaw Man' }
            ].map(u => (
              <button
                key={u.id}
                onClick={() => setUniverseFilter(u.id)}
                className={`p-2 rounded-xl border text-[10.5px] font-bold transition text-left truncate cursor-pointer ${
                  universeFilter === u.id
                    ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-md shadow-purple-950/60'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Nivel de Poder & Tier */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5 font-cinzel">
            <Target className="w-3.5 h-3.5 text-rose-400" /> Calibración de Poder (Power Scaling)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTierFilter('fair')}
              className={`p-2.5 rounded-xl border font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                tierFilter === 'fair'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-md shadow-rose-950/60'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5 text-rose-400" />
              <span>Equilibrado (Tier Match)</span>
            </button>
            <button
              onClick={() => setTierFilter('chaos')}
              className={`p-2.5 rounded-xl border font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                tierFilter === 'chaos'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-md shadow-amber-950/60'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Caos Total (Sin Límite)</span>
            </button>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="pt-2 space-y-2.5 border-t border-slate-800">
          <button
            onClick={handleRandomize}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/60 transition cursor-pointer tracking-wider font-cinzel"
          >
            <Shuffle className="w-4 h-4" /> Generar Match y Preparar Simulación
          </button>
          
          <button
            onClick={() => { onClose(); onAIGenerate(); }}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-fuchsia-500/40 text-fuchsia-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow"
          >
            <Sparkles className="w-4 h-4 text-fuchsia-400" /> Generar Personaje Sorpresa (IA Fichas)
          </button>
        </div>
      </div>
    </div>
  );
}
