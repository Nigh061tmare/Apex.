import React, { useState, useEffect } from 'react';
import { X, Zap, Swords, Flame, Sparkles, Activity, ShieldAlert, Award, RefreshCw, BarChart2 } from 'lucide-react';
import { SoundFX } from '../services/soundFx';

export default function BeamStruggleModal({ isOpen, onClose, charA, charB, scenario, simulationData }) {
  const sideAList = simulationData?.bossMinions && simulationData.bossMinions.length > 0
    ? [simulationData.charA, ...simulationData.bossMinions].filter(Boolean)
    : (simulationData?.teamA && simulationData.teamA.length > 0 ? simulationData.teamA : [charA].filter(Boolean));

  const sideBList = simulationData?.teamB && simulationData.teamB.length > 0
    ? simulationData.teamB
    : (simulationData?.battleRoyale && simulationData.battleRoyale.length > 0 ? simulationData.battleRoyale : [charB].filter(Boolean));

  const [selectedCharA, setSelectedCharA] = useState(charA || sideAList[0]);
  const [selectedCharB, setSelectedCharB] = useState(charB || sideBList[0]);

  const [techA, setTechA] = useState('');
  const [techB, setTechB] = useState('');
  const [powerA, setPowerA] = useState(85);
  const [powerB, setPowerB] = useState(80);
  const [staminaA, setStaminaA] = useState(70);
  const [staminaB, setStaminaB] = useState(75);
  const [rageA, setRageA] = useState(false);
  const [rageB, setRageB] = useState(false);

  const [isSimulating, setIsSimulating] = useState(false);
  const [clashProgress, setClashProgress] = useState(50);
  const [clashLog, setClashLog] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (sideAList.length > 0 && !selectedCharA) {
      setSelectedCharA(sideAList[0]);
    }
    if (sideBList.length > 0 && !selectedCharB) {
      setSelectedCharB(sideBList[0]);
    }
  }, [sideAList, sideBList]);

  useEffect(() => {
    if (selectedCharA) {
      setTechA(selectedCharA.arsenal?.ultimateAttacks?.[0]?.name || selectedCharA.arsenal?.superAttacks?.[0]?.name || 'Super Kamehameha');
    }
  }, [selectedCharA]);

  useEffect(() => {
    if (selectedCharB) {
      setTechB(selectedCharB.arsenal?.ultimateAttacks?.[0]?.name || selectedCharB.arsenal?.superAttacks?.[0]?.name || 'Kamehameha Solar / Final Flash');
    }
  }, [selectedCharB]);

  if (!isOpen) return null;

  const handleSimulateClash = () => {
    setIsSimulating(true);
    setResult(null);
    setClashLog([]);
    setClashProgress(50);
    SoundFX.playEnergyCharge?.();

    let curProg = 50;
    let step = 0;
    const logs = [];

    const effectiveA = powerA * (rageA ? 1.25 : 1.0) * (staminaA / 100);
    const effectiveB = powerB * (rageB ? 1.25 : 1.0) * (staminaB / 100);

    const diff = effectiveA - effectiveB;
    const joulesA = (powerA * 4.2e18).toExponential(2);
    const joulesB = (powerB * 4.2e18).toExponential(2);

    const interval = setInterval(() => {
      step++;
      const jitter = (Math.random() * 8 - 4);
      const shift = (diff > 0 ? -1 : 1) * (Math.abs(diff) * 0.12) + jitter;
      curProg = Math.max(5, Math.min(95, curProg + shift));
      setClashProgress(curProg);

      if (step === 1) {
        logs.push(`⚡ [T+0.0s] ¡COLISIÓN DE PLASMA EN EL EPICENTRO! ${techA} choca contra ${techB} generando una presión de ${Math.round(Math.max(powerA, powerB) * 1.5e6)} Megapascales.`);
      } else if (step === 3) {
        logs.push(`🌪️ [T+1.5s] El aire se ioniza y el suelo se vitrifica en un radio de 5 km. Fricción cinética: ${diff > 0 ? (selectedCharA?.name || 'Luchador A') : (selectedCharB?.name || 'Luchador B')} empieza a ganar terreno.`);
      } else if (step === 5) {
        logs.push(`💥 [T+3.0s] ¡Sobrecarga de Ki! La onda de choque deforma la gravedad del mapa.`);
      }

      setClashLog([...logs]);

      if (step >= 6) {
        clearInterval(interval);
        setIsSimulating(false);

        const winner = diff > 0 ? selectedCharA : selectedCharB;
        const loser = diff > 0 ? selectedCharB : selectedCharA;
        const finalWinnerProg = diff > 0 ? 0 : 100;
        setClashProgress(finalWinnerProg);

        const finalResult = {
          winner: winner?.name || 'Vencedor',
          loser: loser?.name || 'Perdedor',
          winnerTech: diff > 0 ? techA : techB,
          loserTech: diff > 0 ? techB : techA,
          margin: Math.abs(Math.round(diff * 1.5)),
          joules: diff > 0 ? joulesA : joulesB,
          summary: `${winner?.name || 'El vencedor'} rompe la resistencia de ${loser?.name || 'el oponente'} tras forzar el núcleo del choque con ${diff > 0 ? techA : techB}, engullendo su técnica y causando vaporización del 80% de su cuerpo.`
        };
        setResult(finalResult);
        SoundFX.playImpactHeavy?.();
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel border-2 border-amber-500/60 bg-[#0c101a] shadow-[0_0_50px_rgba(245,158,11,0.25)] p-6 overflow-hidden space-y-5 max-h-[90vh] overflow-y-auto font-mono text-xs text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white font-black shadow-lg shadow-red-950/60">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-300 font-cinzel tracking-wider flex items-center gap-2">
                Simulador de Choque de Rayos & Técnicas (Beam Struggle)
              </h2>
              <p className="text-[11px] text-slate-400">
                Cálculo de Física de Colisión, Joules, Presión de Ki y Desgaste Biomecánico
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Lado A */}
          <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-800/50 space-y-2.5">
            <div className="flex items-center justify-between">
              {sideAList.length > 1 ? (
                <select
                  value={selectedCharA?.id || ''}
                  onChange={(e) => {
                    const found = sideAList.find(c => (c.id || c.name) === e.target.value);
                    if (found) setSelectedCharA(found);
                  }}
                  className="bg-slate-950 border border-red-700/60 text-red-300 font-bold text-xs p-1 rounded max-w-[170px]"
                >
                  {sideAList.map((c, idx) => (
                    <option key={c.id || idx} value={c.id || c.name}>🔴 {c.name}</option>
                  ))}
                </select>
              ) : (
                <span className="font-bold text-red-400 text-xs font-cinzel">🔴 {selectedCharA?.name || 'Luchador A'}</span>
              )}
              <button
                type="button"
                onClick={() => setRageA(!rageA)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                  rageA ? 'bg-red-600 text-white border-red-400 shadow-[0_0_8px_red]' : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {rageA ? '🔥 FURIA (x1.25)' : 'Furia: OFF'}
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Técnica Definitiva:</label>
              <input
                type="text"
                value={techA}
                onChange={(e) => setTechA(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-red-300 font-bold text-xs"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Potencia de Ataque (AP):</span>
                <span className="text-red-400 font-bold">{powerA}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={powerA}
                onChange={(e) => setPowerA(parseInt(e.target.value, 10))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Stamina Restante:</span>
                <span className="text-amber-400 font-bold">{staminaA}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={staminaA}
                onChange={(e) => setStaminaA(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Lado B */}
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/50 space-y-2.5">
            <div className="flex items-center justify-between">
              {sideBList.length > 1 ? (
                <select
                  value={selectedCharB?.id || ''}
                  onChange={(e) => {
                    const found = sideBList.find(c => (c.id || c.name) === e.target.value);
                    if (found) setSelectedCharB(found);
                  }}
                  className="bg-slate-950 border border-blue-700/60 text-blue-300 font-bold text-xs p-1 rounded max-w-[170px]"
                >
                  {sideBList.map((c, idx) => (
                    <option key={c.id || idx} value={c.id || c.name}>🔵 {c.name}</option>
                  ))}
                </select>
              ) : (
                <span className="font-bold text-blue-400 text-xs font-cinzel">🔵 {selectedCharB?.name || 'Luchador B'}</span>
              )}
              <button
                type="button"
                onClick={() => setRageB(!rageB)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                  rageB ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_8px_blue]' : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                {rageB ? '🔥 FURIA (x1.25)' : 'Furia: OFF'}
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Técnica Definitiva:</label>
              <input
                type="text"
                value={techB}
                onChange={(e) => setTechB(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-blue-300 font-bold text-xs"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Potencia de Ataque (AP):</span>
                <span className="text-blue-400 font-bold">{powerB}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={powerB}
                onChange={(e) => setPowerB(parseInt(e.target.value, 10))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Stamina Restante:</span>
                <span className="text-cyan-400 font-bold">{staminaB}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={staminaB}
                onChange={(e) => setStaminaB(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Tug-of-War Beam Clash Visual Bar */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-red-400 flex items-center gap-1">
              <span>{techA}</span>
            </span>
            <span className="text-amber-400 animate-pulse">⚡ EPICENTRO DE COLISIÓN ⚡</span>
            <span className="text-blue-400 flex items-center gap-1">
              <span>{techB}</span>
            </span>
          </div>

          <div className="relative h-6 bg-slate-900 rounded-full overflow-hidden border-2 border-slate-700 p-0.5 flex items-center shadow-inner">
            {/* Haz Rojo A */}
            <div 
              className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-white transition-all duration-300 rounded-l-full shadow-[0_0_15px_red]" 
              style={{ width: `${100 - clashProgress}%` }}
            />
            {/* Spark Center */}
            <div className="w-2 h-full bg-white shadow-[0_0_15px_white] animate-ping shrink-0" />
            {/* Haz Azul B */}
            <div 
              className="h-full bg-gradient-to-l from-blue-600 via-cyan-400 to-white transition-all duration-300 rounded-r-full shadow-[0_0_15px_cyan]" 
              style={{ width: `${clashProgress}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleSimulateClash}
          disabled={isSimulating}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-black text-sm font-cinzel tracking-wider shadow-lg shadow-amber-950/60 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSimulating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>COLISIONANDO ENERGÍAS...</span>
            </>
          ) : (
            <>
              <Flame className="w-4 h-4 text-yellow-300 animate-bounce" />
              <span>DESATAR CHOQUE DE TÉCNICAS</span>
            </>
          )}
        </button>

        {/* Live Clash Telemetry Logs */}
        {clashLog.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-[11px] font-mono">
            {clashLog.map((log, idx) => (
              <p key={idx} className="text-slate-300 leading-snug">{log}</p>
            ))}
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-2 border-amber-400 text-amber-100 shadow-xl space-y-2 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-amber-500/40 pb-1.5">
              <span className="font-bold text-amber-300 font-cinzel text-xs flex items-center gap-1.5">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>VICTORIA EN EL CHOQUE: {result.winner}</span>
              </span>
              <span className="text-[10px] bg-amber-500/30 text-amber-200 border border-amber-400 px-2 py-0.5 rounded font-bold">
                +{result.margin}% VENTAJA DE ENERGÍA
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-200">{result.summary}</p>
            <div className="text-[10px] text-slate-400 font-mono">
              Energía liberada en la detonación: <strong className="text-cyan-300">{result.joules} Joules</strong>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
