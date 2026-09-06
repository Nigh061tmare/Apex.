import React, { useState, useEffect } from 'react';
import { X, Sparkles, Zap, Shield, Flame, Atom, Save, ArrowRight, RefreshCw, Check, Swords, BookOpen } from 'lucide-react';
import SearchableCharacterSelector from './SearchableCharacterSelector.jsx';
import { FUSION_METHODS, fuseCharacters } from '../lib/apexFusionEngine.js';
import { formatApexKi } from '../lib/apexTierSystem.js';
import { SoundFX } from '../services/soundFx.js';

export default function FusionModal({ isOpen, onClose, allCharacters = [], onSaveFusion, onDeployToFighter1 }) {
  // IMPORTANTE: todos los hooks van ANTES de cualquier return condicional.
  // Antes este modal devolvía null con isOpen=false y luego montaba hooks al
  // abrirlo → React lanzaba "Rendered more hooks than during the previous render"
  // y la app caía a la pantalla de error. Ese era el fallo de "Fusiones no va".
  const [charAId, setCharAId] = useState(allCharacters[0]?.id || '');
  const [charBId, setCharBId] = useState(allCharacters[1]?.id || '');
  const [methodId, setMethodId] = useState('potara');
  const [areRivals, setAreRivals] = useState(false);
  const [isFusing, setIsFusing] = useState(false);
  const [fusedResult, setFusedResult] = useState(null);

  // Limpia el resultado previo cuando cambian los inputs (evita previsualización obsoleta)
  useEffect(() => {
    setFusedResult(null);
  }, [charAId, charBId, methodId, areRivals]);

  const charA = allCharacters.find(c => c.id === charAId) || allCharacters[0];
  const charB = allCharacters.find(c => c.id === charBId) || allCharacters[1];

  const handlePerformFusion = () => {
    if (!charA || !charB) return;
    setIsFusing(true);
    SoundFX?.playPowerUp?.();

    setTimeout(() => {
      try {
        const result = fuseCharacters(charA, charB, methodId, areRivals);
        setFusedResult(result);
        SoundFX?.playSuperAttack?.();
      } catch (err) {
        console.error('Error during fusion:', err);
      } finally {
        setIsFusing(false);
      }
    }, 600);
  };

  const handleSaveAndDeploy = () => {
    if (!fusedResult) return;
    if (onSaveFusion) onSaveFusion(fusedResult);
    if (onDeployToFighter1) onDeployToFighter1(fusedResult);
    SoundFX?.playLevelUp?.();
    onClose();
  };

  // Fusión aleatoria: elige dos luchadores al azar y ejecuta la sinergia
  const handleRandomFusion = () => {
    const list = Array.isArray(allCharacters) ? allCharacters : [];
    if (list.length < 2) return;
    const iA = Math.floor(Math.random() * list.length);
    let iB = Math.floor(Math.random() * (list.length - 1));
    if (iB >= iA) iB += 1;
    setCharAId(list[iA]?.id || '');
    setCharBId(list[iB]?.id || '');
    setIsFusing(true);
    SoundFX?.playPowerUp?.();
    setTimeout(() => {
      try {
        const result = fuseCharacters(list[iA], list[iB], methodId, areRivals);
        setFusedResult(result);
        SoundFX?.playSuperAttack?.();
      } catch (err) {
        console.error('Error durante fusión aleatoria:', err);
      } finally {
        setIsFusing(false);
      }
    }, 600);
  };

  const sameCharacter = charA?.id && charB?.id && charA.id === charB.id;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-950 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                APEX FUSION ENGINE — FORJA DE SINERGIAS
              </h2>
              <p className="text-xs font-mono text-amber-300/70">
                Fusión canónica y cuántica de guerreros multiversales con cálculo de Ki y artes marciales híbridas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Selectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fighter 1 */}
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 space-y-3">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-red-400">
                Combatiente Alfa (Base 1)
              </label>
              <SearchableCharacterSelector
                characters={allCharacters}
                value={charAId}
                onChange={(c) => setCharAId(c?.id || '')}
                color="red"
              />
              {charA && (
                <div className="text-xs text-slate-300 flex justify-between items-center pt-2 border-t border-red-500/20">
                  <span className="font-semibold text-white">{charA.name}</span>
                  <span className="px-2 py-0.5 rounded bg-red-900/60 font-mono text-red-300 border border-red-500/40">
                    {charA.tier || 'Tier 7-B'}
                  </span>
                </div>
              )}
            </div>

            {/* Fighter 2 */}
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-3">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                Combatiente Beta (Base 2)
              </label>
              <SearchableCharacterSelector
                characters={allCharacters}
                value={charBId}
                onChange={(c) => setCharBId(c?.id || '')}
                color="blue"
              />
              {charB && (
                <div className="text-xs text-slate-300 flex justify-between items-center pt-2 border-t border-blue-500/20">
                  <span className="font-semibold text-white">{charB.name}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-900/60 font-mono text-blue-300 border border-blue-500/40">
                    {charB.tier || 'Tier 7-B'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Fusion Method Tabs */}
          <div className="space-y-3">
            <label className="block text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
              Método de Enlace y Fusión
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.values(FUSION_METHODS).map((m) => {
                const isSelected = methodId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethodId(m.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/40 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${isSelected ? 'text-amber-200' : 'text-slate-300'}`}>
                        {m.name}
                      </span>
                      {isSelected && <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />}
                    </div>
                    <span className="text-[11px] text-slate-400 leading-tight">
                      {m.compatibilityRule}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400/80">
                      Multiplicador: x{m.multiplier} · {m.energyType}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Rivalry Checkbox */}
            {methodId === 'potara' && (
              <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-amber-300 font-mono">
                <input
                  type="checkbox"
                  checked={areRivals}
                  onChange={(e) => setAreRivals(e.target.checked)}
                  className="rounded border-amber-500/40 bg-slate-900 text-amber-500 focus:ring-amber-500"
                />
                <span>Bonus de Rivalidad Ancestral (+25% al Ki final por polaridad de voluntades)</span>
              </label>
            )}
          </div>

          {/* Fusion Trigger Button */}
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handlePerformFusion}
                disabled={isFusing || !charA || !charB || sameCharacter}
                className={`px-8 py-3 rounded-xl font-bold font-mono tracking-wider transition-all flex items-center gap-3 text-sm shadow-xl ${
                  isFusing
                    ? 'bg-amber-600/50 text-amber-200 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 hover:brightness-110 hover:scale-105 active:scale-95 shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                {isFusing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                    Sincronizando Entidades Multiversales...
                  </>
                ) : (
                  <>
                    <Atom className="w-5 h-5" />
                    ¡INICIAR SINERGIA DE FUSIÓN!
                  </>
                )}
              </button>
              <button
                onClick={handleRandomFusion}
                disabled={isFusing || allCharacters.length < 2}
                className="px-5 py-3 rounded-xl font-bold font-mono tracking-wider transition-all flex items-center gap-2 text-xs bg-gradient-to-r from-purple-600/40 to-fuchsia-600/40 text-purple-200 border border-purple-500/40 hover:brightness-125 hover:scale-105 active:scale-95 shadow-lg shadow-purple-950/40 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Elige dos luchadores al azar y fúndelos"
              >
                <Sparkles className="w-4 h-4" />
                FUSIÓN AL AZAR
              </button>
            </div>
            {sameCharacter && (
              <p className="text-[11px] font-mono text-red-400">
                ⚠️ No puedes fusionar a un luchador consigo mismo. Elige dos guerreros distintos.
              </p>
            )}
          </div>

          {/* Fused Character Card Preview */}
          {fusedResult && (
            <div className="p-5 rounded-2xl border border-amber-500/60 bg-gradient-to-br from-amber-950/30 via-slate-900 to-indigo-950/40 shadow-2xl space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/30">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {fusedResult.version}
                  </span>
                  <h3 className="text-2xl font-black text-white tracking-wide mt-1">
                    {fusedResult.name}
                  </h3>
                  <p className="text-xs text-amber-300/80 font-mono">
                    {fusedResult.universe}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block">TIER ALCANZADO</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      {fusedResult.tier}
                    </span>
                  </div>
                  <div className="text-right border-l border-slate-700 pl-3">
                    <span className="text-[10px] font-mono text-slate-400 block">KI TOTAL</span>
                    <span className="text-lg font-black text-yellow-300 font-mono">
                      {formatApexKi(fusedResult.ki)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desglose del cálculo de poder */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
                <span className="px-2 py-0.5 rounded bg-red-900/40 border border-red-500/30 text-red-300">
                  {fusedResult.fusionMeta?.parentA?.name?.split('(')[0].trim()}: {formatApexKi(fusedResult.fusionMeta?.parentA?.ki)}
                </span>
                <span className="text-slate-600">+</span>
                <span className="px-2 py-0.5 rounded bg-blue-900/40 border border-blue-500/30 text-blue-300">
                  {fusedResult.fusionMeta?.parentB?.name?.split('(')[0].trim()}: {formatApexKi(fusedResult.fusionMeta?.parentB?.ki)}
                </span>
                <span className="text-slate-600">→</span>
                <span className="px-2 py-0.5 rounded bg-amber-900/40 border border-amber-500/40 text-amber-300 font-bold">
                  {fusedResult.fusionMeta?.method}: {formatApexKi(fusedResult.ki)}
                  {fusedResult.fusionMeta?.areRivals ? ' (+25% Rivalidad)' : ''}
                </span>
              </div>

              {/* Arsenal Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono">
                    <Swords className="w-4 h-4" />
                    Técnica Híbrida Primaria
                  </div>
                  <p className="text-slate-200 font-semibold">
                    {fusedResult.arsenal.superAttacks[0]?.name}
                  </p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {fusedResult.arsenal.superAttacks[0]?.description}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-yellow-400 font-bold font-mono">
                    <Flame className="w-4 h-4" />
                    Ataque Conceptual Definitivo
                  </div>
                  <p className="text-slate-200 font-semibold">
                    {fusedResult.arsenal.ultimateAttacks[0]?.name}
                  </p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {fusedResult.arsenal.ultimateAttacks[0]?.description}
                  </p>
                </div>
              </div>

              {/* Hax Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {fusedResult.haxTags.slice(0, 8).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-amber-500/30 text-amber-200"
                  >
                    ✦ {tag}
                  </span>
                ))}
              </div>

              {/* Deployment Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={handleSaveAndDeploy}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold font-mono text-xs tracking-wider bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-110 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Save className="w-4 h-4" />
                  GUARDAR EN BÓVEDA & DESPLEGAR EN COMBATIENTE 1
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
