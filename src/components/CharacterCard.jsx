import React, { useState, useEffect } from 'react';
import { Shield, Zap, Eye, Crosshair, AlertTriangle, Target, Sparkles, Flame, ShieldAlert, Edit3, Trash2, ArrowUpRight } from 'lucide-react';
import { getTranslation } from '../services/i18n';
import { resolveCombatState } from '../lib/combatStateResolver';
import CharacterAvatar from './CharacterAvatar';
import { getBodilyForms } from '../lib/externalEntityFramework';
import { SoundFX } from '../services/soundFx';
import { isCharacterInNeedsReview, getNeedsReviewWarningText } from '../services/needsReviewService';

import SearchableCharacterSelector from './SearchableCharacterSelector.jsx';

export default function CharacterCard({ character = {}, role = '', onInspect, onEdit, onDelete, onSelectChange, onExportCard, allCharacters = [], lang = 'es' }) {
  if (!character || !character.id) {
    return (
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 text-slate-400 font-mono text-xs text-center flex items-center justify-center min-h-[180px]">
        Selecciona un combatiente para este puesto...
      </div>
    );
  }

  const isSideA = role.includes('A') || role.includes('Alfa') || role.includes('Jefe') || role.includes('Boss') || role.includes('Rojo');
  const isRaichi = character.id === 'dr-raichi-dbm-u3';
  const bodilyForms = getBodilyForms(character);

  const resolveInitialFormId = () => {
    const rawId =
      character._activeFormId ||
      character.forms?.[character._activeFormIndex || 0]?.id ||
      character.forms?.[0]?.id ||
      'base';
    if (isRaichi && rawId === 'ghost-broly-unleashed') {
      return bodilyForms[0]?.id || 'base';
    }
    return rawId;
  };

  const [selectedFormId, setSelectedFormId] = useState(resolveInitialFormId);

  // Sync selector when character changes (Part D)
  useEffect(() => {
    setSelectedFormId(resolveInitialFormId());
  }, [character.id]);

  const activeIdx = bodilyForms.findIndex(f => f.id === selectedFormId);
  const currentForm = bodilyForms[activeIdx > -1 ? activeIdx : 0] || bodilyForms[0] || {};
  
  // Single Source of Truth — all UI reads from combatState
  const effectiveFormId = (isRaichi && selectedFormId === 'ghost-broly-unleashed')
    ? (bodilyForms[0]?.id || 'base')
    : selectedFormId;
  const combatState = resolveCombatState(character, effectiveFormId);
  const isTransformed = combatState.formMultiplier !== 1 || (activeIdx > 0);

  // Variants for the selector
  const baseName = (character.name || '').split('(')[0].split('—')[0].trim().toLowerCase();
  const variants = (allCharacters || []).filter(c => {
    const otherBase = (c?.name || '').split('(')[0].split('—')[0].trim().toLowerCase();
    return otherBase === baseName || (baseName.includes(otherBase) && otherBase.length >= 4) || (otherBase.includes(baseName) && baseName.length >= 4);
  });

  const [battleDamage, setBattleDamage] = useState(false);

  const cleanTier = (combatState.tierExact || character.tier || '').replace('Tier ', '').trim();
  const isCosmic = ['Low 1-C', '1-C', 'High 1-C', '1-B', 'High 1-B', 'Low 1-A', '1-A', 'High 1-A', '0'].includes(cleanTier);
  const isGodTier = ['Low 2-C', '2-C', '2-B', '2-A'].includes(cleanTier);
  const isSSJTier = ['Low 4-C', '4-C', 'High 4-C', '4-B', '4-A', '3-C', '3-B', '3-A', 'High 3-A'].includes(cleanTier);

  const formNameLower = (currentForm.name || '').toLowerCase();
  const charNameLower = (character.name || '').toLowerCase();

  let dynamicAura = 'shadow-xl';
  if (formNameLower.includes('ultra instinto') || formNameLower.includes('migatte') || formNameLower.includes('silver') || formNameLower.includes('angel')) {
    dynamicAura = 'aura-ultra-instinct ring-1 ring-slate-200/60';
  } else if (formNameLower.includes('hakaishin') || formNameLower.includes('destructor') || formNameLower.includes('ultra ego') || formNameLower.includes('hakai') || isCosmic) {
    dynamicAura = 'aura-hakaishin-purple ring-1 ring-purple-500/60';
  } else if (formNameLower.includes('blue') || formNameLower.includes('dios') || formNameLower.includes('god') || formNameLower.includes('ssj blue') || isGodTier) {
    dynamicAura = 'aura-god-blue ring-1 ring-cyan-400/60';
  } else if (formNameLower.includes('kaioken') || formNameLower.includes('kaiō-ken')) {
    dynamicAura = 'aura-kaioken-red ring-1 ring-red-500/70';
  } else if (formNameLower.includes('berserker') || formNameLower.includes('legendario') || formNameLower.includes('lssj') || charNameLower.includes('broly')) {
    dynamicAura = 'aura-legendary-green ring-1 ring-emerald-400/60';
  } else if (formNameLower.includes('demonio') || formNameLower.includes('majin') || formNameLower.includes('makaioshin') || formNameLower.includes('dark') || formNameLower.includes('moro')) {
    dynamicAura = 'aura-chaos-dark ring-1 ring-purple-700/80';
  } else if (isSSJTier || formNameLower.includes('super saiyan') || formNameLower.includes('super saiyajin') || formNameLower.includes('ssj')) {
    dynamicAura = 'aura-ssj-gold ring-1 ring-amber-400/60';
  }

  return (
    <div className={`relative flex flex-col rounded-2xl transition-all duration-300 ${
      isSideA ? 'glass-panel-danger border-red-500/30' : 'glass-panel-blue border-blue-500/30'
    } ${dynamicAura} p-5`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isSideA ? 'bg-red-500 animate-ping' : 'bg-blue-500 animate-ping'}`} />
          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isSideA ? 'text-red-400' : 'text-blue-400'}`}>
            {role}
          </span>
        </div>

        <div className="w-full sm:w-auto sm:min-w-[280px]">
          <SearchableCharacterSelector
            characters={allCharacters || []}
            value={character.id}
            onChange={onSelectChange}
            color={isSideA ? 'red' : 'blue'}
          />
        </div>
      </div>

      {/* Info & Form Selector */}
      <div className="flex items-start justify-between gap-3">
        <CharacterAvatar
          character={character}
          formId={effectiveFormId}
          alt={character.name}
          className={`group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-gradient-to-b ${
            isSideA ? 'from-red-950/80 via-slate-900 to-slate-950 border-red-500/40' : 'from-blue-950/80 via-slate-900 to-slate-950 border-blue-500/40'
          } border shadow-xl shrink-0`}
          imgClassName="rounded-xl transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-lg font-bold text-white tracking-tight truncate">{character.name}</h3>
            {isCharacterInNeedsReview(character.id) && (
              <span 
                className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] text-amber-300 font-mono cursor-help"
                title={`Backlog V22: ${getNeedsReviewWarningText(character.id)}`}
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>needsReview</span>
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1 mb-2">
            {battleDamage && (
              <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse flex items-center gap-1">
                <span>💥</span>
                <span>BATTLE DAMAGE</span>
              </span>
            )}
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shadow-sm ${
              character.dbTag === 'classic' || character.universe?.includes('Clásico') ? 'bg-orange-600/30 text-orange-400 border border-orange-500/50' :
              character.dbTag === 'z' || character.universe?.includes('DBZ') || character.universe?.includes('Z') ? 'bg-red-600/30 text-red-400 border border-red-500/50' :
              character.dbTag === 'super' || character.universe?.includes('Super') ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50' :
              character.dbTag === 'gt' || character.universe?.includes('GT') ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50' :
              character.dbTag === 'daima' || character.universe?.includes('Daima') ? 'bg-purple-600/30 text-purple-400 border border-purple-500/50' :
              'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {character.universe}
            </span>
            {(character.saga || character.version) && (
              <span className="px-2 py-0.5 rounded bg-slate-900/60 border border-slate-800 text-slate-400 text-[10px] truncate max-w-[150px]">
                {character.saga || character.version}
              </span>
            )}
          </div>
          {/* Quick Variants Selector if multiple versions exist */}
          {variants.length > 1 && (
            <div className="mb-2 p-1.5 rounded-lg bg-purple-950/30 border border-purple-800/40 space-y-0.5">
              <label className="text-[9.5px] text-purple-300 font-mono font-bold block">
                🔄 Variante / Saga ({variants.length} disponibles):
              </label>
              <select
                value={character.id}
                onChange={(e) => {
                  const chosen = allCharacters.find(c => c.id === e.target.value);
                  if (chosen) onSelectChange(chosen);
                }}
                className="bg-slate-950 border border-purple-500/50 text-purple-200 text-[11px] rounded px-2 py-1 focus:outline-none cursor-pointer w-full font-bold"
              >
                {variants.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.saga || v.version ? `${v.saga || v.version} (${v.tier})` : `${v.name} (${v.tier})`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Form Selector */}
          {bodilyForms && bodilyForms.length > 0 && (
            <div className="mb-2">
              <label className="text-[10px] text-amber-500/80 font-mono block mb-0.5">{getTranslation(lang, 'initialForm')}</label>
              <select 
                value={selectedFormId} 
                onChange={(e) => {
                  setSelectedFormId(e.target.value);
                  SoundFX?.playAuraBurst?.();
                  const idx = bodilyForms.findIndex(f => f.id === e.target.value);
                  onSelectChange({ ...character, _activeFormIndex: idx > -1 ? idx : 0, _activeFormId: e.target.value });
                }}
                className="bg-slate-950 border border-amber-500/40 text-amber-400 text-xs rounded-lg px-2 py-1 focus:outline-none cursor-pointer w-full font-bold shadow-[0_0_8px_rgba(245,158,11,0.15)]"
              >
                {bodilyForms.map((f, i) => (
                  <option key={i} value={f.id}>{f.name}</option>
                ))}
              </select>
              {currentForm?.stats && (
                <p className="text-[10px] text-amber-300/80 font-mono mt-1 italic px-1 line-clamp-1">
                  ⚡ {typeof currentForm.stats === 'object'
                    ? (currentForm.stats.ap || currentForm.stats.tier || Object.values(currentForm.stats).join(' | '))
                    : currentForm.stats}
                </p>
              )}

              {/* Form Progression Limit */}
              {bodilyForms.length > 1 && (
                <div className="mt-2 pt-2 border-t border-slate-800/80">
                  <label className="text-[9.5px] text-rose-400 font-mono block mb-1 font-bold">
                    {getTranslation(lang, 'formLimit')}
                  </label>
                  <select
                    value={character._formLimitIndex ?? 'none'}
                    onChange={(e) => {
                      const limitIdx = e.target.value === 'none' ? undefined : parseInt(e.target.value, 10);
                      onSelectChange({ ...character, _formLimitIndex: limitIdx });
                    }}
                    className="bg-slate-950 border border-rose-900/60 text-rose-300 text-[10px] rounded-lg px-2 py-1 focus:outline-none cursor-pointer w-full font-bold"
                  >
                    <option value="none">{getTranslation(lang, 'noLimit')}</option>
                    {bodilyForms.map((f, i) => (
                      <option key={i} value={i}>🔒 {lang === 'en' ? 'Cap at:' : lang === 'ja' ? '上限:' : 'Tope en:'} {f.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Active Tier */}
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1 ${
              isTransformed 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse' 
                : 'bg-slate-900 border border-amber-500/30 text-amber-300'
            }`}>
              {isTransformed && <ArrowUpRight className="w-3 h-3 text-yellow-300" />}
              <span>{combatState.tierExact || character.tier}</span>
            </span>

            {/* Universal APEX-Ki Badge */}
            <span
              className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 text-[11px] font-mono font-bold flex items-center gap-1 shadow-sm"
              title="Lectura APEX Ki"
            >
              <Zap className="w-3 h-3 text-indigo-400" />
              <span aria-label="Lectura APEX Ki">{combatState.apexKiDisplay}</span>
            </span>

            {/* Range */}
            {character.range && (
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                <Target className="w-3 h-3" /> {character.range}
              </span>
            )}

            {/* Form Multiplier */}
            {combatState.formMultiplier > 1 && (
              <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/50 text-[9.5px] font-mono font-black">
                {combatState.multiplierDisplay} Boost
              </span>
            )}

            {/* Warnings badge */}
            {combatState.warnings?.length > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[9px] font-mono flex items-center gap-0.5" title={(combatState.warnings || []).join('\n')}>
                <AlertTriangle className="w-2.5 h-2.5" /> Aviso
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: View, Edit, TCG Card, Delete */}
        {/* Action Buttons: Battle Damage, TCG Card, View, Edit, Delete */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setBattleDamage(!battleDamage)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              battleDamage
                ? 'bg-red-900/90 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Alternar Modo Battle Damage (Desgaste, Fracturas y Presión Máxima)"
          >
            <Flame className={`w-4 h-4 ${battleDamage ? 'text-red-200' : 'text-slate-400'}`} />
          </button>
          {onExportCard && (
            <button
              onClick={() => onExportCard(character)}
              className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 hover:text-white transition cursor-pointer"
              title="Generar Carta Coleccionable TCG (Holográfica PNG)"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>
          )}
          <button
            onClick={() => onInspect(character)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Ver Ficha Completa"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(character)}
            className="p-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 hover:text-white transition cursor-pointer"
            title="Editar Ficha / Transformaciones / Arsenal"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              onClick={() => {
                if (confirm(`¿Eliminar la ficha de "${character.name}"?`)) {
                  onDelete(character.id);
                }
              }}
              className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 hover:text-red-200 transition cursor-pointer"
              title="Eliminar Ficha"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid — Power Scaling Reactivo */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
        <div className={`p-2.5 rounded-xl border transition-colors ${
          isTransformed ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]' : 'bg-slate-900/70 border-slate-800/80'
        }`}>
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Zap className={`w-3.5 h-3.5 ${isTransformed ? 'text-yellow-300 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-[10px] uppercase font-bold">{isTransformed ? 'Attack Potency (Escalado)' : 'Attack Potency'}</span>
          </div>
          <p className={`line-clamp-2 text-[11px] font-bold ${isTransformed ? 'text-amber-200' : 'text-slate-200'}`}>
            {currentForm?.stats
              ? (typeof currentForm.stats === 'object'
                  ? (currentForm.stats.ap || currentForm.stats.tier || Object.values(currentForm.stats).join(' | '))
                  : currentForm.stats)
              : (typeof character.ap === 'object'
                  ? (character.ap?.text || character.ap?.ap || Object.values(character.ap).join(' | '))
                  : character.ap)}
          </p>
        </div>

        <div className={`p-2.5 rounded-xl border transition-colors ${
          isTransformed ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)]' : 'bg-slate-900/70 border-slate-800/80'
        }`}>
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] uppercase font-bold">{isTransformed ? 'Durabilidad (Forma)' : 'Durabilidad'}</span>
          </div>
          <p className="text-slate-200 line-clamp-2 text-[11px]">
            {isTransformed ? `Escalado a ${currentForm?.name || 'Forma'}` : (currentForm?.stats ? `Escalado a ${currentForm.name || 'Estado Base'}` : (typeof character.durability === 'object' ? (character.durability?.text || Object.values(character.durability).join(' | ')) : character.durability))}
          </p>
        </div>
      </div>

      {/* Stamina & Battle IQ */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono">
         <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/40">
           <span className="text-slate-500 block mb-0.5">Stamina:</span>
           <span className="text-slate-300 line-clamp-1">{typeof character.stamina === 'object' ? (character.stamina?.text || Object.values(character.stamina).join(' | ')) : (character.stamina || 'Desconocida')}</span>
         </div>
         <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/40">
           <span className="text-slate-500 block mb-0.5">Battle IQ:</span>
           <span className="text-slate-300 line-clamp-1">{typeof character.battleIQ === 'object' ? (character.battleIQ?.text || Object.values(character.battleIQ).join(' | ')) : (character.battleIQ || 'Desconocido')}</span>
         </div>
      </div>

      {/* Speed & Arsenal Badges */}
      <div className="mt-3 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800/60 text-[11px]">
          <span className="flex items-center gap-1"><Crosshair className="w-3.5 h-3.5 text-red-400" /> Vel. Combate:</span>
          <span className={`font-mono font-bold ${isTransformed ? 'text-yellow-300' : 'text-slate-200'}`}>
            {typeof character.speed === 'object' ? character.speed.combat : (character.speedCombate || character.speed || 'Nivel Canon')}
          </span>
        </div>

        {/* Ultimates / Finishers Badges */}
        {character.arsenal?.ultimateAttacks && character.arsenal.ultimateAttacks.length > 0 && (
          <div className="space-y-1">
            {character.arsenal.ultimateAttacks.map((ult, idx) => (
              <div key={idx} className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center justify-between text-[10px] font-mono">
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-red-400" /> Finisher:
                </span>
                <span className="text-red-200 font-bold truncate max-w-[170px]">
                  {typeof ult === 'object' && ult !== null ? (ult.name || ult.desc || 'Finisher') : String(ult)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Super Attacks, Passives & Actives Badges */}
        <div className="flex items-center gap-1 flex-wrap">
          {character.arsenal?.superAttacks?.map((s, idx) => (
            <span key={`super-${idx}`} className="px-2 py-0.5 rounded bg-orange-950/60 border border-orange-500/40 text-[9px] text-orange-300 font-mono flex items-center gap-1" title={typeof s === 'object' ? s.desc : ''}>
              <Flame className="w-2.5 h-2.5" /> {typeof s === 'object' && s !== null ? (s.name || s.desc || 'Técnica') : String(s)}
            </span>
          ))}
          {character.arsenal?.passives?.map((p, idx) => (
            <span key={`pass-${idx}`} className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-[9px] text-emerald-300 font-mono flex items-center gap-1" title={typeof p === 'object' ? p.desc : ''}>
              <ShieldAlert className="w-2.5 h-2.5" /> {typeof p === 'object' && p !== null ? (p.name || p.desc || 'Pasiva') : String(p)}
            </span>
          ))}
          {character.arsenal?.actives?.map((a, idx) => (
            <span key={`act-${idx}`} className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-[9px] text-cyan-300 font-mono flex items-center gap-1" title={typeof a === 'object' ? a.desc : ''}>
              <Sparkles className="w-2.5 h-2.5" /> {typeof a === 'object' && a !== null ? (a.name || a.desc || 'Activa') : String(a)}
            </span>
          ))}
        </div>

        {/* Legacy Summon Reference Card (Dr. Raichi) */}
        {isRaichi && (
          <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-500/40 text-amber-200">
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-300">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Invocación élite legacy: Fantasma de Broly LSSJ</span>
            </div>
            <p className="text-[10px] text-amber-300/80 italic mt-0.5">
              Referencia de invocación de Hatchiyack; no es una transformación ni un multiplicador corporal de Dr. Raichi.
            </p>
            <ul className="mt-1.5 space-y-0.5 text-[9.5px] text-slate-300 list-disc list-inside leading-normal">
              <li>La referencia legacy preserva el registro histórico de V25.</li>
              <li>El sistema futuro de Ghost Archive decidirá despliegue, resonancia, recarga y counterplay.</li>
              <li>No suma Ki ni multiplica las estadísticas personales de Raichi.</li>
              <li>Hatchiyack Manifest sigue como propuesta no activa.</li>
            </ul>
          </div>
        )}
      </div>

      {/* HaxTags — Conceptual Ability Badges */}
      {character.haxTags && character.haxTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {character.haxTags.slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 rounded-full bg-purple-900/60 text-purple-200 text-[9px] font-mono border border-purple-500/30 truncate max-w-[120px]"
              title={typeof tag === 'object' ? JSON.stringify(tag) : String(tag)}
            >
              🔮 {typeof tag === 'object' ? (tag.name || tag.tag || JSON.stringify(tag)) : String(tag)}
            </span>
          ))}
          {character.haxTags.length > 4 && (
            <span className="px-1.5 py-0.5 rounded-full bg-purple-950/40 text-purple-400 text-[9px] font-mono border border-purple-700/30">
              +{character.haxTags.length - 4} más
            </span>
          )}
        </div>
      )}

      {/* First Canonical Feat */}
      {character.feats && character.feats.length > 0 && (
        <div className="mt-2 px-2 py-1.5 rounded-lg bg-cyan-950/20 border-l-2 border-cyan-600/50">
          <p className="text-[10px] text-cyan-400/90 font-mono italic line-clamp-2">
            ⭐ {typeof character.feats[0] === 'object' ? (character.feats[0].name || character.feats[0].desc || JSON.stringify(character.feats[0])) : (character.feats[0] || 'Hazañas de combate registradas')}
          </p>
        </div>
      )}

      {/* Weakness */}
      <div className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-400">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <p className="line-clamp-1">
          <span className="text-slate-300 font-medium">Debilidad:</span>{' '}
          {Array.isArray(character.weaknesses)
            ? character.weaknesses.map(w => typeof w === 'object' ? (w.name || w.desc) : w).join(', ')
            : (typeof character.weaknesses === 'object' && character.weaknesses !== null
                ? (character.weaknesses.desc || character.weaknesses.name || 'Ninguna conocida.')
                : (character.weaknesses || 'Ninguna conocida.'))}
        </p>
      </div>
    </div>
  );
}
