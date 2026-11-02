import React, { useState } from 'react';
import { Swords, Users, Crown, Plus, Trash2, Shield, Flame, Sparkles, UserPlus, Zap, Sliders, Info, ShieldAlert, Award, RotateCcw } from 'lucide-react';
import { getTranslation } from '../services/i18n';
import CharacterCard from './CharacterCard';
import { RAID_BOSS_TIERS, calculateSquadSynergy } from '../services/synergyEngine';

// Subcomponente Visual de Sinergia y Ataques Combinados de Escuadra
function SquadSynergyCard({ team, title, accentColor = 'cyan' }) {
  const synergy = calculateSquadSynergy(team);
  const [expanded, setExpanded] = useState(false);

  if (!team || team.length <= 1) return null;

  const totalItems = (synergy.buffs?.length || 0) + (synergy.combos?.length || 0);

  return (
    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${accentColor === 'red' ? 'text-red-400' : 'text-cyan-400'} animate-pulse`} />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
            {title || 'Sinergia & Tácticas de Alianza'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
            synergy.cohesion >= 85 ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300' : 'bg-slate-800 text-slate-300'
          }`}>
            Cohesión: {synergy.cohesion}%
          </span>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-cyan-300 hover:text-white transition cursor-pointer flex items-center gap-1"
          >
            <span>{expanded ? '▲ Ocultar Sinergias' : `▼ Ver Sinergias & Combos (${totalItems})`}</span>
          </button>
        </div>
      </div>

      {/* Barra de Sincronía */}
      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
        <div 
          className={`h-full bg-gradient-to-r ${accentColor === 'red' ? 'from-red-600 to-amber-500' : 'from-cyan-500 to-blue-500'} transition-all duration-500`}
          style={{ width: `${synergy.cohesion}%` }}
        />
      </div>

      {/* Resumen Compacto cuando está colapsado */}
      {!expanded && totalItems > 0 && (
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <span>✨ {synergy.buffs?.length || 0} Buffs de Alianza Activos</span>
          <span>⚔️ {synergy.combos?.length || 0} Ataques Combinados</span>
        </div>
      )}

      {/* Contenido Expandible (Buffs y Combos) */}
      {expanded && (
        <div className="space-y-2.5 pt-1 animate-in fade-in">
          {/* Buffs Activos */}
          {synergy.buffs.length > 0 && (
            <div>
              <span className="font-bold text-amber-300 text-[10px] block mb-1.5">
                ✨ Buffs Activos de Escuadra ({synergy.buffs.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {synergy.buffs.map((b, i) => (
                  <div key={i} className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-1.5">
                    <span className="text-sm">{b.icon}</span>
                    <div className="leading-tight">
                      <span className="font-bold text-amber-300 text-[10px] block">{b.name}</span>
                      <span className="text-[9px] text-slate-400">{b.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ataques Combinados */}
          {synergy.combos.length > 0 && (
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/40 space-y-2">
              <span className="font-bold text-purple-300 text-[10px] flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-purple-400" />
                <span>Ataques Combinados Disponibles (Dual Finishers - {synergy.combos.length}):</span>
              </span>
              <div className="space-y-1.5">
                {synergy.combos.map((c, i) => (
                  <div key={i} className="p-1.5 rounded bg-black/40 border border-white/5 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 text-[11px]">{c.name}</span>
                      <span className="text-[9px] text-slate-400">{c.pair}</span>
                    </div>
                    <p className="text-[10px] text-slate-300">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TEAM_PALETTES = [
  { id: 'alfa', defaultName: 'Equipo Alfa', colorName: 'Rojo', bgGradient: 'from-red-950/80 to-slate-900', border: 'border-red-500/50', text: 'text-red-400', badgeBg: 'bg-red-600 hover:bg-red-500', accent: 'red', dot: 'bg-red-500', dotShadow: 'shadow-[0_0_8px_red]' },
  { id: 'beta', defaultName: 'Equipo Beta', colorName: 'Azul', bgGradient: 'from-blue-950/80 to-slate-900', border: 'border-blue-500/50', text: 'text-blue-400', badgeBg: 'bg-blue-600 hover:bg-blue-500', accent: 'cyan', dot: 'bg-blue-500', dotShadow: 'shadow-[0_0_8px_cyan]' },
  { id: 'gamma', defaultName: 'Equipo Gamma', colorName: 'Esmeralda', bgGradient: 'from-emerald-950/80 to-slate-900', border: 'border-emerald-500/50', text: 'text-emerald-400', badgeBg: 'bg-emerald-600 hover:bg-emerald-500', accent: 'emerald', dot: 'bg-emerald-500', dotShadow: 'shadow-[0_0_8px_emerald]' },
  { id: 'delta', defaultName: 'Equipo Delta', colorName: 'Dorado', bgGradient: 'from-amber-950/80 to-slate-900', border: 'border-amber-500/50', text: 'text-amber-400', badgeBg: 'bg-amber-600 hover:bg-amber-500', accent: 'amber', dot: 'bg-amber-500', dotShadow: 'shadow-[0_0_8px_amber]' },
  { id: 'epsilon', defaultName: 'Equipo Épsilon', colorName: 'Púrpura', bgGradient: 'from-purple-950/80 to-slate-900', border: 'border-purple-500/50', text: 'text-purple-400', badgeBg: 'bg-purple-600 hover:bg-purple-500', accent: 'purple', dot: 'bg-purple-500', dotShadow: 'shadow-[0_0_8px_purple]' }
];

export default function MultiFighterPanel({ 
  matchMode, 
  setMatchMode, 
  charA, 
  setCharA, 
  charB, 
  setCharB, 
  teamA, 
  setTeamA, 
  teamB, 
  setTeamB, 
  bossMinions = [],
  setBossMinions,
  multiTeams = [],
  setMultiTeams,
  battleRoyale, 
  setBattleRoyale, 
  allCharacters,
  modifiers = {},
  setModifiers,
  onInspect,
  onEdit,
  onDelete,
  onExportCard,
  onOpenAiMatchmaker,
  lang = 'es'
}) {
  const t = (k) => getTranslation(lang, k);

  const currentBossMult = modifiers.bossMultiplier || 1.35;
  const currentBossTier = RAID_BOSS_TIERS.find(b => b.multiplier === currentBossMult) || RAID_BOSS_TIERS[1];

  const handleSetBossMultiplier = (mult) => {
    if (setModifiers) {
      setModifiers(prev => ({ ...prev, bossMultiplier: mult }));
    }
  };

  // Boss Minions handlers
  const addBossMinion = () => {
    if (!setBossMinions) return;
    if (bossMinions.length >= 6) return alert('Máximo 6 esbirros/sub-jefes para el Boss.');
    const available = (allCharacters || []).find(c => c && c.id !== charA?.id && !(bossMinions || []).some(m => m && m.id === c.id)) || allCharacters[0];
    setBossMinions([...bossMinions, available]);
  };

  const removeBossMinion = (index) => {
    if (!setBossMinions) return;
    setBossMinions(bossMinions.filter((_, i) => i !== index));
  };

  const updateBossMinion = (index, updatedChar) => {
    if (!setBossMinions) return;
    const updated = [...bossMinions];
    updated[index] = updatedChar;
    setBossMinions(updated);
  };

  // Multi-Team dynamic handlers
  const cleanMultiTeams = (multiTeams && multiTeams.length >= 2)
    ? multiTeams.map((t, tIdx) => ({
        ...t,
        id: t?.id || `team-${tIdx}`,
        name: t?.name || `Equipo ${tIdx + 1}`,
        color: t?.color || 'blue',
        members: (t?.members || []).filter(Boolean).filter(m => m && (m.id || m.name))
      }))
    : [
        { id: 'alfa', name: 'Equipo Alfa', color: 'red', members: (teamA || []).filter(Boolean) },
        { id: 'beta', name: 'Equipo Beta', color: 'blue', members: (teamB || []).filter(Boolean) }
      ];

  const effectiveMultiTeams = cleanMultiTeams.length >= 2 ? cleanMultiTeams : [
    { id: 'alfa', name: 'Equipo Alfa', color: 'red', members: (teamA || []).filter(Boolean) },
    { id: 'beta', name: 'Equipo Beta', color: 'blue', members: (teamB || []).filter(Boolean) }
  ];

  const addMultiTeamFaction = () => {
    if (!setMultiTeams) return;
    if (effectiveMultiTeams.length >= 5) return alert('Máximo 5 equipos/facciones simultáneos.');
    const nextIdx = effectiveMultiTeams.length;
    const palette = TEAM_PALETTES[nextIdx] || TEAM_PALETTES[0];
    const available = (allCharacters || []).find(c => c && !effectiveMultiTeams.some(t => (t.members || []).some(m => m && m.id === c.id))) || allCharacters[0];
    
    const newTeam = {
      id: palette.id,
      name: palette.defaultName,
      color: palette.accent,
      members: [available]
    };
    setMultiTeams([...effectiveMultiTeams, newTeam]);
  };

  const removeMultiTeamFaction = (teamIndex) => {
    if (!setMultiTeams) return;
    if (effectiveMultiTeams.length <= 2) return alert('Debes mantener al menos 2 equipos para el modo equipos.');
    setMultiTeams(effectiveMultiTeams.filter((_, i) => i !== teamIndex));
  };

  const addMemberToMultiTeam = (teamIndex) => {
    if (!setMultiTeams) return;
    const team = effectiveMultiTeams[teamIndex];
    if (!team) return;
    if ((team.members || []).length >= 8) return alert('Máximo 8 luchadores por equipo.');
    const available = (allCharacters || []).find(c => c && !(team.members || []).some(m => m && m.id === c.id)) || allCharacters[0];
    
    const updatedTeams = [...effectiveMultiTeams];
    updatedTeams[teamIndex] = {
      ...team,
      members: [...(team.members || []).filter(Boolean), available]
    };
    setMultiTeams(updatedTeams);

    // Keep legacy teamA / teamB in sync
    if (teamIndex === 0 && setTeamA) setTeamA(updatedTeams[0].members);
    if (teamIndex === 1 && setTeamB) setTeamB(updatedTeams[1].members);
  };

  const removeMemberFromMultiTeam = (teamIndex, memberIndex) => {
    if (!setMultiTeams) return;
    const team = effectiveMultiTeams[teamIndex];
    if (team.members.length <= 1) return alert('Cada equipo debe tener al menos 1 luchador.');
    
    const updatedTeams = [...effectiveMultiTeams];
    updatedTeams[teamIndex] = {
      ...team,
      members: team.members.filter((_, i) => i !== memberIndex)
    };
    setMultiTeams(updatedTeams);

    if (teamIndex === 0 && setTeamA) setTeamA(updatedTeams[0].members);
    if (teamIndex === 1 && setTeamB) setTeamB(updatedTeams[1].members);
  };

  const updateMemberInMultiTeam = (teamIndex, memberIndex, updatedChar) => {
    if (!setMultiTeams) return;
    const team = effectiveMultiTeams[teamIndex];
    const updatedMembers = [...team.members];
    updatedMembers[memberIndex] = updatedChar;

    const updatedTeams = [...effectiveMultiTeams];
    updatedTeams[teamIndex] = {
      ...team,
      members: updatedMembers
    };
    setMultiTeams(updatedTeams);

    if (teamIndex === 0 && setTeamA) setTeamA(updatedMembers);
    if (teamIndex === 1 && setTeamB) setTeamB(updatedMembers);
  };

  // Add fighter to Team B (Raid Squad)
  const addRaidSquadMember = () => {
    if ((teamB || []).length >= 8) return alert('Máximo 8 combatientes en la escuadra asaltante.');
    const available = (allCharacters || []).find(c => c && !(teamB || []).some(t => t && t.id === c.id)) || allCharacters[1] || allCharacters[0];
    setTeamB([...(teamB || []).filter(Boolean), available]);
  };

  const removeRaidSquadMember = (index) => {
    if ((teamB || []).length <= 1) return alert('La escuadra asaltante debe tener al menos 1 luchador.');
    setTeamB((teamB || []).filter((_, i) => i !== index));
  };

  const updateRaidSquadMember = (index, updatedChar) => {
    const updated = [...(teamB || [])];
    updated[index] = updatedChar;
    setTeamB(updated);
  };

  // Battle Royale handlers
  const addRoyaleMember = () => {
    if ((battleRoyale || []).length >= 10) return alert('Máximo 10 luchadores en el Battle Royale.');
    const available = (allCharacters || []).find(c => c && !(battleRoyale || []).some(t => t && t.id === c.id)) || allCharacters[0];
    setBattleRoyale([...(battleRoyale || []).filter(Boolean), available]);
  };

  const removeRoyaleMember = (index) => {
    if ((battleRoyale || []).length <= 2) return alert('El Battle Royale debe tener al menos 2 luchadores.');
    setBattleRoyale((battleRoyale || []).filter((_, i) => i !== index));
  };

  const updateRoyaleMember = (index, updatedChar) => {
    const updated = [...(battleRoyale || [])];
    updated[index] = updatedChar;
    setBattleRoyale(updated);
  };

  // Clear / Reset handlers to restore default clean setups
  const handleResetBossRaid = () => {
    if (setBossMinions) setBossMinions([]);
    if (setTeamB && allCharacters.length >= 3) {
      setTeamB([allCharacters[1], allCharacters[2]]);
    }
    if (setModifiers) {
      setModifiers(prev => ({ ...prev, bossMultiplier: 1.35 }));
    }
  };

  const handleResetMultiTeams = () => {
    const tA = [allCharacters[0] || charA, allCharacters[1] || charB];
    const tB = [allCharacters[2] || allCharacters[0], allCharacters[3] || allCharacters[1]];
    if (setTeamA) setTeamA(tA);
    if (setTeamB) setTeamB(tB);
    if (setMultiTeams) {
      setMultiTeams([
        { id: 'alfa', name: 'Equipo Alfa', color: 'red', members: tA },
        { id: 'beta', name: 'Equipo Beta', color: 'blue', members: tB }
      ]);
    }
  };

  const handleResetBattleRoyale = () => {
    if (setBattleRoyale && allCharacters.length >= 4) {
      setBattleRoyale(allCharacters.slice(0, 4));
    }
  };

  const handleResetCurrentMode = () => {
    if (matchMode === '1vN') handleResetBossRaid();
    else if (matchMode === 'teams') handleResetMultiTeams();
    else if (matchMode === 'battle_royale') handleResetBattleRoyale();
  };

  return (
    <div className="space-y-6">
      
      {/* Mode Selector Header Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              {t('combatModeTitle')}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              {t('combatModeDesc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Clear / Reset Formation Button for Multi-Fighter Modes */}
          {matchMode !== '1v1' && (
            <button
              type="button"
              onClick={handleResetCurrentMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/50 font-bold transition cursor-pointer shadow-md text-xs font-mono"
              title="Limpiar esbirros/acumulación y restablecer la formación a los valores por defecto limpios"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400 animate-spin-reverse" />
              <span>🧹 Limpiar Formación</span>
            </button>
          )}

          {/* AI Matchmaker Prompt Button */}
          {onOpenAiMatchmaker && (
            <button
              type="button"
              onClick={onOpenAiMatchmaker}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-purple-600/30 hover:from-purple-600/50 hover:to-pink-600/50 text-purple-300 border border-purple-500/50 font-bold transition cursor-pointer shadow-md shadow-purple-950/40 text-xs font-mono"
              title="Pedir a la IA que configure cualquier combate con lenguaje natural"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>🪄 Match por Prompt IA</span>
            </button>
          )}

          {/* Segmented Mode Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-xs font-bold">
            <button
              type="button"
              onClick={() => setMatchMode('1v1')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                matchMode === '1v1'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>{t('mode1v1')}</span>
            </button>

            <button
              type="button"
              onClick={() => setMatchMode('1vN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                matchMode === '1vN'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Boss Raid (+ Aliados)</span>
            </button>

            <button
              type="button"
              onClick={() => setMatchMode('teams')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                matchMode === 'teams'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-300" />
              <span>Multi-Equipos ({effectiveMultiTeams.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setMatchMode('battle_royale')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                matchMode === 'battle_royale'
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-yellow-300" />
              <span>{t('modeRoyale')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── MODO 1 VS 1 CLÁSICO ─────────────────────────────────────────── */}
      {matchMode === '1v1' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CharacterCard
            character={charA}
            role="Contendiente A (Rojo)"
            onInspect={onInspect}
            onEdit={onEdit}
            onDelete={onDelete}
            onSelectChange={setCharA}
            onExportCard={onExportCard}
            allCharacters={allCharacters}
            lang={lang}
          />
          <CharacterCard
            character={charB}
            role="Contendiente B (Azul)"
            onInspect={onInspect}
            onEdit={onEdit}
            onDelete={onDelete}
            onSelectChange={setCharB}
            onExportCard={onExportCard}
            allCharacters={allCharacters}
            lang={lang}
          />
        </div>
      )}

      {/* ─── MODO 1 VS VARIOS (BOSS RAID ASIMÉTRICO + ALIADOS DEL BOSS) ──── */}
      {matchMode === '1vN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Columna Izquierda: El Jefe Supremo + Aliados / Esbirros del Boss (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/80 border border-red-500/60 space-y-3 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 font-cinzel font-bold text-red-400 text-sm">
                    <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                    <span>FACCIÓN DEL JEFE SUPREMO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-white font-mono text-[10px] font-black uppercase bg-gradient-to-r ${currentBossTier.color} shadow-md`}>
                      {currentBossTier.badge}
                    </span>
                    {bossMinions && bossMinions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setBossMinions && setBossMinions([])}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-mono font-bold text-[10px] shadow transition cursor-pointer"
                        title="Eliminar todos los esbirros/aliados del Boss"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>🧹 Limpiar Esbirros ({bossMinions.length})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={addBossMinion}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-[10px] shadow transition cursor-pointer"
                      title="Añadir un esbirro o sub-jefe como aliado al equipo del Boss"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>+ Aliado / Esbirro Boss</span>
                    </button>
                  </div>
                </div>

                {/* Selector de Nivel de Amenaza del Boss */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-amber-400" />
                      <span>Nivel de Amenaza & Multiplicador del Boss:</span>
                    </span>
                    <span className="text-amber-300 font-bold">{currentBossTier.label} ({currentBossTier.multiplier}x)</span>
                  </div>

                  {/* Botones Rápidos de Nivel */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                    {RAID_BOSS_TIERS.map(tier => (
                      <button
                        key={tier.level}
                        type="button"
                        onClick={() => handleSetBossMultiplier(tier.multiplier)}
                        className={`p-1.5 rounded-lg border text-center transition cursor-pointer text-[10px] font-bold ${
                          currentBossMult === tier.multiplier
                            ? 'bg-red-950/90 border-red-500 text-red-200 shadow-md shadow-red-950/60 scale-[1.02]'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Lv.{tier.level} ({tier.multiplier}x)
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 italic pt-0.5">
                    ⚡ {currentBossTier.desc} · <span className="text-amber-300">{currentBossTier.aura}</span>
                  </p>
                </div>
              </div>

              {/* Sinergia de la Facción del Boss (si tiene aliados) */}
              {bossMinions && bossMinions.length > 0 && (
                <SquadSynergyCard 
                  team={[charA, ...bossMinions]} 
                  title={`Sinergia del Dominio del Boss (1 Titán + ${bossMinions.length} Aliados)`} 
                  accentColor="red" 
                />
              )}

              {/* Carta del Boss Principal */}
              <div className="space-y-3">
                <CharacterCard
                  character={charA}
                  role={`Jefe Supremo Titán (${currentBossMult}x Buff)`}
                  onInspect={onInspect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSelectChange={setCharA}
                  onExportCard={onExportCard}
                  allCharacters={allCharacters}
                  lang={lang}
                />

                {/* Cartas de los Esbirros / Sub-Jefes del Boss */}
                {(bossMinions || []).filter(Boolean).map((minion, mIdx) => {
                  const minionId = minion?.id || minion?.name || `minion-${mIdx}`;
                  return (
                  <div key={`boss-minion-${mIdx}-${minionId}`} className="relative pl-3 border-l-2 border-red-500/40">
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        type="button"
                        onClick={() => removeBossMinion(mIdx)}
                        className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 cursor-pointer shadow transition"
                        title="Eliminar aliado del Boss"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <CharacterCard
                      character={minion}
                      role={`Aliado / Sub-Jefe del Boss #${mIdx + 1}`}
                      onInspect={onInspect}
                      onEdit={onEdit}
                      onDelete={() => removeBossMinion(mIdx)}
                      onSelectChange={(updatedChar) => updateBossMinion(mIdx, updatedChar)}
                      onExportCard={onExportCard}
                      allCharacters={allCharacters}
                      lang={lang}
                    />
                  </div>
                );})}
              </div>
            </div>

            {/* Columna Derecha: Escuadra Asaltante (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/50 flex items-center justify-between flex-wrap gap-2 shadow-xl">
                <div className="flex items-center gap-2 font-cinzel font-bold text-cyan-300 text-sm">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>ESCUADRA ASALTANTE ({(teamB || []).filter(Boolean).length} Luchadores)</span>
                </div>
                <div className="flex items-center gap-2">
                  {teamB && teamB.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setTeamB && setTeamB(teamB.slice(0, 2))}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-[10px] shadow transition cursor-pointer"
                      title="Reducir escuadra a 2 asaltantes"
                    >
                      <RotateCcw className="w-3 h-3 text-cyan-400" />
                      <span>🧹 Reset Asaltantes (2)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addRaidSquadMember}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Añadir Asaltante</span>
                  </button>
                </div>
              </div>

              {/* Panel Dinámico de Sinergias de la Escuadra */}
              <SquadSynergyCard team={teamB} title={`Sinergia de la Escuadra (${(teamB || []).filter(Boolean).length} Luchadores)`} accentColor="cyan" />

              <div className="space-y-4 max-h-[900px] overflow-y-auto pr-1">
                {(teamB || []).filter(Boolean).map((member, idx) => {
                  const memberId = member?.id || member?.name || `raid-${idx}`;
                  return (
                  <div key={`raid-${idx}-${memberId}`} className="relative">
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        type="button"
                        onClick={() => removeRaidSquadMember(idx)}
                        className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 cursor-pointer shadow transition"
                        title="Eliminar asaltante de la escuadra"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <CharacterCard
                      character={member}
                      role={`Asaltante #${idx + 1} (Escuadra)`}
                      onInspect={onInspect}
                      onEdit={onEdit}
                      onDelete={() => removeRaidSquadMember(idx)}
                      onSelectChange={(updatedChar) => updateRaidSquadMember(idx, updatedChar)}
                      onExportCard={onExportCard}
                      allCharacters={allCharacters}
                      lang={lang}
                    />
                  </div>
                );})}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── MODO GUERRA MULTI-EQUIPOS (HASTA 5 EQUIPOS / FACCIONES) ─────── */}
      {matchMode === 'teams' && (
        <div className="space-y-6">
          
          {/* Header de Gestión Multi-Equipos */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/40 flex items-center justify-between flex-wrap gap-2 font-mono">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Guerra Multi-Equipos ({effectiveMultiTeams.length} Facciones Simultáneas)
                </h4>
                <p className="text-[10px] text-slate-400">
                  Combate de múltiples bandos con fuego cruzado, alianzas tácticas y sinergias por facción.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetMultiTeams}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold text-xs shadow-md transition cursor-pointer"
                title="Restablecer a 2 equipos limpios (2 vs 2)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>🧹 Restablecer a 2 vs 2</span>
              </button>

              {effectiveMultiTeams.length < 5 && (
                <button
                  type="button"
                  onClick={addMultiTeamFaction}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Crear Equipo {effectiveMultiTeams.length + 1} ({TEAM_PALETTES[effectiveMultiTeams.length]?.colorName || 'Facción'})</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid de Equipos Dinámico */}
          <div className={`grid grid-cols-1 ${effectiveMultiTeams.length === 2 ? 'lg:grid-cols-2' : effectiveMultiTeams.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2 xl:grid-cols-2'} gap-6 items-start`}>
            {effectiveMultiTeams.map((team, tIdx) => {
              const palette = TEAM_PALETTES[tIdx] || TEAM_PALETTES[0];

              return (
                <div key={team.id || `team-${tIdx}`} className="space-y-4">
                  {/* Encabezado del Equipo */}
                  <div className={`p-3.5 rounded-xl bg-gradient-to-r ${palette.bgGradient} border ${palette.border} flex items-center justify-between flex-wrap gap-2 shadow-lg`}>
                    <div className="flex items-center gap-2 font-cinzel font-bold text-sm">
                      <span className={`w-3 h-3 rounded-full ${palette.dot} animate-pulse ${palette.dotShadow}`} />
                      <span className={palette.text}>{team.name.toUpperCase()} ({team.members.length})</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => addMemberToMultiTeam(tIdx)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${palette.badgeBg} text-white font-mono font-bold text-[10px] shadow transition cursor-pointer`}
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>+ Añadir</span>
                      </button>

                      {effectiveMultiTeams.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeMultiTeamFaction(tIdx)}
                          className="p-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 transition cursor-pointer"
                          title="Eliminar este equipo de la guerra"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sinergia del Equipo */}
                  <SquadSynergyCard 
                    team={(team?.members || []).filter(Boolean)} 
                    title={`Sinergia ${team.name} (${(team?.members || []).filter(Boolean).length} Luchadores)`} 
                    accentColor={palette.accent} 
                  />

                  {/* Lista de Personajes del Equipo */}
                  <div className="space-y-4 max-h-[850px] overflow-y-auto pr-1">
                    {(team?.members || []).filter(Boolean).map((member, mIdx) => {
                      const memberId = member?.id || member?.name || `m-${mIdx}`;
                      return (
                      <div key={`multiTeam-${tIdx}-${mIdx}-${memberId}`} className="relative">
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            type="button"
                            onClick={() => removeMemberFromMultiTeam(tIdx, mIdx)}
                            className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 cursor-pointer shadow transition"
                            title={`Eliminar del ${team.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <CharacterCard
                          character={member}
                          role={`${team.name} #${mIdx + 1}`}
                          onInspect={onInspect}
                          onEdit={onEdit}
                          onDelete={() => removeMemberFromMultiTeam(tIdx, mIdx)}
                          onSelectChange={(updatedChar) => updateMemberInMultiTeam(tIdx, mIdx, updatedChar)}
                          onExportCard={onExportCard}
                          allCharacters={allCharacters}
                          lang={lang}
                        />
                      </div>
                    );})}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── MODO BATTLE ROYALE (TODOS CONTRA TODOS) ────────────────────── */}
      {matchMode === 'battle_royale' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-fuchsia-950/80 border border-purple-500/50 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Crown className="w-5 h-5 text-yellow-300 animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-cinzel">
                  Coliseo Battle Royale ({battleRoyale.length} Gladiadores en Caos Total)
                </h4>
                <p className="text-[11px] text-purple-300 font-mono">
                  Todos contra todos simultáneamente. Cada luchador opera con su forma y arsenal seleccionados.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {battleRoyale && battleRoyale.length > 4 && (
                <button
                  type="button"
                  onClick={handleResetBattleRoyale}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold shadow transition cursor-pointer"
                  title="Restablecer a 4 gladiadores por defecto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>🧹 Restablecer a 4</span>
                </button>
              )}
              <button
                type="button"
                onClick={addRoyaleMember}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-mono text-xs font-bold shadow-lg shadow-purple-950/50 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Añadir Gladiador</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-h-[900px] overflow-y-auto pr-1">
            {(battleRoyale || []).filter(Boolean).map((gladiator, idx) => {
              const gladId = gladiator?.id || gladiator?.name || `royale-${idx}`;
              return (
              <div key={`royale-${idx}-${gladId}`} className="relative">
                <div className="absolute top-3 right-3 z-10">
                  <button
                    type="button"
                    onClick={() => removeRoyaleMember(idx)}
                    className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 cursor-pointer shadow transition"
                    title="Eliminar gladiador del Battle Royale"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <CharacterCard
                  character={gladiator}
                  role={`Gladiador #${idx + 1}`}
                  onInspect={onInspect}
                  onEdit={onEdit}
                  onDelete={() => removeRoyaleMember(idx)}
                  onSelectChange={(updatedChar) => updateRoyaleMember(idx, updatedChar)}
                  onExportCard={onExportCard}
                  allCharacters={allCharacters}
                  lang={lang}
                />
              </div>
            );})}
          </div>
        </div>
      )}

    </div>
  );
}
