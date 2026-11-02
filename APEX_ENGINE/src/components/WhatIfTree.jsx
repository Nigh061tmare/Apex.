import React, { useState } from 'react';
import { 
  GitBranch, AlertOctagon, Globe, Skull, CheckCircle2, XCircle, 
  Sparkles, Flame, Dices, ChevronRight, Compass, ShieldAlert, Zap, 
  Wand2, RefreshCw, Copy, Check, ArrowRight, Layers
} from 'lucide-react';
import { SimulationEngine } from '../services/simulationEngine';

const WHATIF_PRESETS = [
  {
    title: '💥 Sacrificio Suicida de Última Hora',
    desc: 'El combatiente al borde de la muerte sobrecarga su núcleo existencial / energía vital para un ataque de aniquilación mutua.',
    divergence: 'Fase 4 (Clímax)'
  },
  {
    title: '🌑 Corrupción & Caída del Vencedor',
    desc: 'El esfuerzo sobrehumano de la victoria fractura la mente del vencedor, quien es poseído por la energía residual del campo de batalla.',
    divergence: 'Veredicto Final'
  },
  {
    title: '💥 Intervención de 3er Contendiente Canónico / Némesis',
    desc: 'Un 3er contendiente canónico de gran escala (ej. Broly, Metal Cooler, Bills, Sukuna, Thanos, Doomsday) irrumpe con nombre oficial completo desatando una guerra a 3 bandas.',
    divergence: 'Fase 3 (Giro Táctico)'
  },
  {
    title: '👥 Asalto Coordinado de un Dúo / Emboscada',
    desc: 'Dos guerreros aliados o rivales coordinados (ej. Androides 17 y 18 / Goku Black & Zamasu / Toji & Maki) tienden una emboscada 2v1 en el momento más crítico.',
    divergence: 'Fase 3 (Giro Táctico)'
  },
  {
    title: '🛡️ Respaldo de Emergencia de un Aliado / Mentor',
    desc: 'Un compañero de equipo legendario o mentor canónico (ej. Vegeta / Piccolo / Gojo / Thor) interviene en el último milisegundo para rescatar a su aliado.',
    divergence: 'Fase 3 (Giro Táctico)'
  },
  {
    title: '🪐 Aniquilación Mutua & Colapso Dimensional',
    desc: 'El choque de ataques finales desgarra el tejido de la realidad, borrando el escenario entero y enviando a ambos contendientes a un limbo temporal.',
    divergence: 'Fase 4 (Clímax)'
  },
  {
    title: '👑 Despertar Oculto & Segundo Aliento Divino',
    desc: 'Al recibir el golpe de gracia, un catalizador latente en su biología o linaje despierta una transformación oculta que invierte el curso del combate.',
    divergence: 'Fase 3 (Giro Táctico)'
  },
  {
    title: '🩸 Traición Interna de un Aliado Infiltrado',
    desc: 'Uno de los guerreros del equipo o un observador clave apuñala por la espalda a su compañero en el clímax para robar su técnica o esencia.',
    divergence: 'Fase 2 (Súper Ataques)'
  },
  {
    title: '🧬 Mutación Biomecánica & Pérdida de Hax',
    desc: 'El primer intercambio lesiona severamente un nervio o conducto vital de energía, bloqueando el acceso al Hax principal durante toda la batalla.',
    divergence: 'Fase 1 (Tanteo Inicial)'
  },
  {
    title: '⏳ Fractura Multiversal & Crossover Temporal',
    desc: 'Una fisura espacio-temporal absorbe a los combatientes y los traslada a una línea temporal devastada donde las leyes de la física están invertidas.',
    divergence: 'Fase 4 (Clímax)'
  }
];

export default function WhatIfTree({ 
  modifiers = {}, 
  setModifiers, 
  charA, 
  charB, 
  scenario, 
  matchMode = '1v1', 
  teamA = [], 
  teamB = [], 
  battleRoyale = [],
  aiConfig 
}) {
  const isEnabled = modifiers?.butterflyEffect ?? true;
  const subToggles = modifiers?.whatIfSubToggles || {
    traumaMedical: true,
    geopoliticalCrisis: true,
    dormantAwakening: true,
    timelineBranching: true
  };
  const divergencePoint = modifiers?.divergencePoint || 'Fase 3 (Giro Táctico)';
  const customPremise = modifiers?.whatIfCustomPremise || '';

  const [activeBranchTab, setActiveBranchTab] = useState('alfa'); // 'alfa' | 'beta' | 'omega'
  const [isRefiningWhatIf, setIsRefiningWhatIf] = useState(false);
  const [isGeneratingWhatIf, setIsGeneratingWhatIf] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const nameA = charA?.name || 'Contendiente A';
  const nameB = charB?.name || 'Contendiente B';
  const arenaName = scenario?.name || 'la Arena';

  const toggleMain = () => {
    if (!setModifiers) return;
    setModifiers(prev => ({
      ...prev,
      butterflyEffect: !isEnabled
    }));
  };

  const toggleSub = (key) => {
    if (!setModifiers) return;
    setModifiers(prev => ({
      ...prev,
      whatIfSubToggles: {
        ...(prev.whatIfSubToggles || subToggles),
        [key]: !subToggles[key]
      }
    }));
  };

  const setDivergence = (point) => {
    if (!setModifiers) return;
    setModifiers(prev => ({
      ...prev,
      divergencePoint: point
    }));
  };

  const applyPreset = (preset) => {
    if (!setModifiers) return;
    setModifiers(prev => ({
      ...prev,
      butterflyEffect: true,
      divergencePoint: preset.divergence,
      whatIfCustomPremise: preset.desc
    }));
  };

  const setCustomText = (text) => {
    if (!setModifiers) return;
    setModifiers(prev => ({
      ...prev,
      whatIfCustomPremise: text
    }));
  };

  const handleGenerateWhatIf = async () => {
    setIsGeneratingWhatIf(true);
    try {
      const prompt = `[DIRECTIVA APEX ENGINE: GENERADOR WHAT-IF Y NEXUS DIVERGENTE]
Genera una premisa de realidad alternativa / What-If de 2-3 oraciones altamente original, tensa y visceral para el combate:
- Contendientes: ${nameA} vs ${nameB}
- Escenario: ${arenaName}
- Punto de divergencia: ${divergencePoint}
Condición: Especifica un giro dramático inesperado (trauma, despertar, traición, colapso de dimensión o secuela permanente). Devuelve ÚNICAMENTE el texto de la premisa sin comillas ni encabezados.`;

      const generated = await SimulationEngine.queryAiDirectly(prompt, aiConfig, false);
      if (generated && generated.trim().length > 20) {
        setCustomText(generated.trim().replace(/^["']|["']$/g, ''));
      } else {
        setCustomText(`Divergencia en ${divergencePoint} en ${arenaName}: ${nameA} sufre una fractura energética crítica mientras ${nameB} desata una resonancia oculta que altera el destino de la contienda.`);
      }
    } catch (e) {
      alert('Error al generar What-If: ' + e.message);
    } finally {
      setIsGeneratingWhatIf(false);
    }
  };

  const handleRefineWhatIf = async () => {
    if (!customPremise || !customPremise.trim()) {
      alert('Escribe primero una idea o borrador de premisa What-If para que la IA la detalle y pula.');
      return;
    }
    setIsRefiningWhatIf(true);
    try {
      const refined = await SimulationEngine.refinePremiseWithAi(
        customPremise,
        charA || { name: 'Contendiente A' },
        charB || { name: 'Contendiente B' },
        scenario || { name: 'Multiverso' },
        aiConfig,
        matchMode,
        teamA,
        teamB,
        battleRoyale
      );
      setCustomText(refined);
    } catch (e) {
      alert('Error al pulir la premisa What-If: ' + e.message);
    } finally {
      setIsRefiningWhatIf(false);
    }
  };

  const handleApplyToMainPremise = () => {
    if (!customPremise || !customPremise.trim()) {
      alert('Escribe o genera una premisa What-If primero.');
      return;
    }
    if (!setModifiers) return;
    setModifiers(prev => ({
      ...prev,
      customContext: `[DIVERGENCIA WHAT-IF - ${divergencePoint}]: ${customPremise.trim()}`
    }));
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  return (
    <div className={`rounded-2xl glass-panel p-6 border transition-all duration-300 shadow-2xl space-y-6 ${
      isEnabled 
        ? 'border-purple-600/50 bg-gradient-to-br from-purple-950/30 via-slate-900/60 to-fuchsia-950/30 shadow-[0_0_35px_rgba(168,85,247,0.2)]' 
        : 'border-slate-800 bg-slate-950/50 opacity-75'
    }`}>
      
      {/* Header & Main Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl border ${
            isEnabled 
              ? 'bg-gradient-to-br from-purple-600/40 to-fuchsia-600/30 text-purple-200 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}>
            <GitBranch className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-white font-cinzel tracking-wider">
                🌿 Multiverso & Efecto Mariposa Narrativo (Nexus What-If)
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-600/60 font-bold shadow-sm">
                MOTOR DIVERGENTE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Simulador de secuelas biomecánicas, colapso de poder cósmico y bifurcación de líneas temporales
            </p>
          </div>
        </div>

        {/* Master Switch */}
        <button
          type="button"
          onClick={toggleMain}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition cursor-pointer shrink-0 border shadow-lg ${
            isEnabled
              ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-fuchsia-500 text-white border-purple-400/70 shadow-[0_0_20px_rgba(168,85,247,0.5)]'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {isEnabled ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-purple-200" />
              <span>SISTEMA ACTIVADO (ON)</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-slate-500" />
              <span>SISTEMA APAGADO (OFF)</span>
            </>
          )}
        </button>
      </div>

      {isEnabled && (
        <div className="space-y-6 font-mono text-xs animate-in fade-in duration-300">
          
          {/* 4 Specialized Consequence Pillars */}
          <div>
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Pilares de Consecuencia Activos:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* 1. Medical & Biomechanics */}
              <button
                type="button"
                onClick={() => toggleSub('traumaMedical')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  subToggles.traumaMedical
                    ? 'bg-red-950/30 border-red-700/60 text-red-200 shadow-md shadow-red-950/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-red-300">
                    <Skull className="w-4 h-4 text-red-400" /> 1. Trauma Biomecánico
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${subToggles.traumaMedical ? 'bg-red-900/60 text-red-200' : 'bg-slate-800 text-slate-500'}`}>
                    {subToggles.traumaMedical ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-[10.5px] leading-relaxed text-slate-300">
                  Mutilaciones, pérdida de ojos/extremidades, fracturas irreversibles o degradación permanente de reservas de energía.
                </p>
              </button>

              {/* 2. Geopolitical & Cosmic Vacuum */}
              <button
                type="button"
                onClick={() => toggleSub('geopoliticalCrisis')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  subToggles.geopoliticalCrisis
                    ? 'bg-cyan-950/30 border-cyan-700/60 text-cyan-200 shadow-md shadow-cyan-950/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-cyan-300">
                    <Globe className="w-4 h-4 text-cyan-400" /> 2. Vacío Geopolítico
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${subToggles.geopoliticalCrisis ? 'bg-cyan-900/60 text-cyan-200' : 'bg-slate-800 text-slate-500'}`}>
                    {subToggles.geopoliticalCrisis ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-[10.5px] leading-relaxed text-slate-300">
                  Reacción de dioses/organizaciones, ruptura de tratados intergalácticos, rebelión de facciones y guerras sucesorias.
                </p>
              </button>

              {/* 3. Dormant Awakening */}
              <button
                type="button"
                onClick={() => toggleSub('dormantAwakening')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  subToggles.dormantAwakening
                    ? 'bg-amber-950/30 border-amber-700/60 text-amber-200 shadow-md shadow-amber-950/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Flame className="w-4 h-4 text-amber-400" /> 3. Amenazas Durmientes
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${subToggles.dormantAwakening ? 'bg-amber-900/60 text-amber-200' : 'bg-slate-800 text-slate-500'}`}>
                    {subToggles.dormantAwakening ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-[10.5px] leading-relaxed text-slate-300">
                  La energía cataclísmica liberada despierta deidades ancestrales, rompe prisiones cósmicas o convoca depredadores dimensionales.
                </p>
              </button>

              {/* 4. Timeline Branching */}
              <button
                type="button"
                onClick={() => toggleSub('timelineBranching')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  subToggles.timelineBranching
                    ? 'bg-purple-950/40 border-purple-600 text-purple-200 shadow-md shadow-purple-950/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-purple-300">
                    <Zap className="w-4 h-4 text-purple-400" /> 4. Paradoja Temporal
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${subToggles.timelineBranching ? 'bg-purple-900/60 text-purple-200' : 'bg-slate-800 text-slate-500'}`}>
                    {subToggles.timelineBranching ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-[10.5px] leading-relaxed text-slate-300">
                  Bifurcación en 3 líneas de tiempo alternativas (Alfa, Beta, Omega) proyectando las secuelas a 5, 10 y 100 años vista.
                </p>
              </button>

            </div>
          </div>

          {/* Divergence Point Selector */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Punto de Inflexión / Divergencia Temporal:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                'Fase 1 (Tanteo Inicial)',
                'Fase 2 (Súper Ataques)',
                'Fase 3 (Giro Táctico)',
                'Fase 4 (El Clímax)'
              ].map(pt => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setDivergence(pt)}
                  className={`p-2 rounded-lg border text-center font-bold text-[11px] transition cursor-pointer ${
                    divergencePoint === pt
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

          {/* Rapid What-If Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-fuchsia-300 uppercase tracking-wider flex items-center gap-1.5">
              <Dices className="w-3.5 h-3.5" /> Presets de Crisis & Paradoja Instantánea:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WHATIF_PRESETS.map((p, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/60 hover:bg-purple-950/20 transition-all text-left group cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-200 group-hover:text-purple-300">{p.title}</span>
                    <span className="text-[9px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 font-mono">
                      {p.divergence}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-relaxed group-hover:text-slate-300">
                    {p.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom What-If Premise Field with Dropdown Selector */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/50 space-y-3">
            
            {/* Selector Desplegable de Giros Tácticos & Intervenciones */}
            <div className="bg-slate-950/90 p-3 rounded-xl border border-fuchsia-900/50 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                <span className="font-bold text-fuchsia-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>🌀 Desplegable de Giros Argumentales & Intervenciones Canónicas:</span>
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60">
                  LEY CANÓNICA APEX ACTIVA
                </span>
              </div>

              <select
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-fuchsia-400 focus:outline-none transition cursor-pointer"
                onChange={(e) => {
                  if (e.target.value) {
                    setCustomText(e.target.value);
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>⚡ Elige un giro argumental o intervención canónica...</option>
                <option value="Irrumpe sorpresivamente un 3er contendiente canónico icónico y específico del universo del combate (con nombre oficial completo, ej. Metal Cooler, Broly, Cell Max, Bills, Hit, Freezer, Sukuna, Thor, Doomsday, Thanos) que interrumpe el duelo desatando un choque a tres bandas.">
                  💥 [3er Contendiente] Villano Némesis / Rival Histórico del Universo
                </option>
                <option value="Un aliado canónico de respaldo o mentor histórico (ej. Vegeta / Piccolo / Gojo / Thor / Superman) interviene en el último milisegundo para rescatar a su compañero y coordinar un contraataque 2v1.">
                  🛡️ [Aliado de Respaldo] Intervención Heroica en el Milisegundo Crítico
                </option>
                <option value="Aparece un dúo de asalto coordinado (ej. Androides 17 y 18 / Goku Black & Zamasu / Toji & Maki) ejecutando una emboscada 2v1 de alta presión táctica.">
                  👥 [Dúo / Emboscada] Asalto Coordinado de 2 Guerreros
                </option>
                <option value="Uno de los luchadores realiza una técnica de fusión de emergencia o metamorfosis prohibida para duplicar su poder a costa de un drenaje crítico de energía.">
                  ⚡ [Fusión de Crisis] Unión de Emergencia para Salvar la Vida
                </option>
                <option value="Al recibir un golpe letal, un catalizador fisiológico o divino latente despierta una forma oculta no prevista que invierte la balanza de poder.">
                  👑 [Despertar Oculto] Desbloqueo de Nueva Transformación / Forma Latente
                </option>
                <option value="El contendiente inferior en estadísticas descifra el patrón de combate y logra copiar, anular o absorber temporalmente el Hax principal de su oponente.">
                  🧬 [Robo de Técnica / Adaptación] Anulación Táctica del Hax Rival
                </option>
                <option value="El terreno de combate colapsa por la densidad de los impactos y ambos contendientes son succionados hacia otra arena cósmica hostil.">
                  🌀 [Colapso Dimensional] Teletransportación hacia una Arena Devastada
                </option>
                <option value="El combatiente al borde de la derrota activa una técnica kamikaze de auto-destrucción total para forzar una aniquilación mutua.">
                  🩸 [Ataque Kamikaze] Sacrificio Final de Auto-Destrucción
                </option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>✍️ Premisa Personalizada / Texto del Giro:</span>
              </label>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isGeneratingWhatIf || isRefiningWhatIf}
                  onClick={handleGenerateWhatIf}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold shadow-md shadow-emerald-950/50 transition cursor-pointer disabled:opacity-50"
                  title="Genera un escenario What-If original adaptado a los luchadores actuales"
                >
                  {isGeneratingWhatIf ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                      <span>🎲 Generar What-If con IA</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isGeneratingWhatIf || isRefiningWhatIf}
                  onClick={handleRefineWhatIf}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-[11px] font-bold shadow-lg shadow-purple-950/60 transition cursor-pointer disabled:opacity-50 border border-purple-400/40"
                  title="Pule tu idea, corrige ortografía y expande el impacto en el multiverso"
                >
                  {isRefiningWhatIf ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-200" />
                      <span>Puliendo What-If...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5 text-pink-200 animate-pulse" />
                      <span>🪄 Pulir & Detallar con IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              value={customPremise}
              onChange={e => setCustomText(e.target.value)}
              placeholder="Ej: ¿Qué ocurriría si Sukuna se apodera del Guantelete del Infinito en el clímax o si Goku es consumido por la energía oscura del mapa?"
              rows={3}
              className="w-full bg-slate-950 border border-purple-800/60 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-400 font-mono text-xs leading-relaxed"
            />

            {/* Quick Action to send to Main Combat Premise */}
            {customPremise && (
              <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                <span className="text-[10px] text-purple-400 font-medium">
                  {copiedSuccess ? '✅ ¡Inyectado con éxito en la premisa del combate principal!' : '💡 Puedes transferir este What-If al combate principal.'}
                </span>
                <button
                  type="button"
                  onClick={handleApplyToMainPremise}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-600/70 text-purple-200 text-[10px] font-bold transition cursor-pointer"
                >
                  {copiedSuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Layers className="w-3 h-3 text-purple-400" />}
                  <span>Aplicar al Combate Principal</span>
                </button>
              </div>
            )}
          </div>

          {/* Visual Timeline Branching Preview */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-purple-400" /> Previsualización del Árbol de Líneas Temporales ({divergencePoint})
              </span>
              <div className="flex items-center gap-1">
                {['alfa', 'beta', 'omega'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveBranchTab(tab)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition cursor-pointer ${
                      activeBranchTab === tab
                        ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Línea {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] space-y-2">
              {activeBranchTab === 'alfa' && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 block mb-0.5">🔹 Línea Alfa (+5 Años): Continuidad Canónica & Secuelas Médicas</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">Divergencia Mínima</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed mt-1">
                    {nameA} o el vencedor asume el mando con heridas imborrables y degradación del 15% de reservas de energía por trauma tisular. El multiverso asimila la caída de {nameB} y las organizaciones neutrales restablecen un nuevo tratado de no agresión bajo vigilancia estricta.
                  </p>
                </div>
              )}
              {activeBranchTab === 'beta' && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 block mb-0.5">🔸 Línea Beta (+10 Años): El Contraataque Desesperado & Guerra Asimétrica</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">Divergencia Media</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed mt-1">
                    Divergencia forzada en {divergencePoint}: el bando derrotado activa una reserva oculta de energía vital o invocación prohibida, hiriendo de muerte al líder rival y escapando por una grieta dimensional. Diez años después, una guerrilla multiversal inicia la reconquista.
                  </p>
                </div>
              )}
              {activeBranchTab === 'omega' && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-300 block mb-0.5">🔺 Línea Omega (+100 Años): Catástrofe de Extinción Cósmica & Colapso Universal</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-mono">Divergencia Crítica</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed mt-1">
                    El choque de máximas potencias desintegra la membrana existencial del escenario. Tanto {nameA} como {nameB} perecen en la singularidad cósmica generada. Cien años más tarde, las deidades supremas de otros universos sellan la zona como una 'Zona Muerta' prohibida para cualquier forma de vida.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
