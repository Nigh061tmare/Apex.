import React, { useState, useEffect } from 'react';
import { Swords, Flame, Zap, Gamepad2 } from 'lucide-react';

export default function CombatArenaDevolution2D({
  charA,
  charB,
  phase = 'tanteo',
  winner = null,
  hpA = 100,
  hpB = 100,
  onOpenArcade
}) {
  const [shake, setShake] = useState(false);

  const getAuraColor = (char) => {
    const text = ((char?.name || '') + ' ' + (char?.tier || '')).toLowerCase();
    if (text.includes('blue') || text.includes('god') || text.includes('ssg') || text.includes('gojo')) return '#00d2ff';
    if (text.includes('ultra ego') || text.includes('hakai') || text.includes('beerus') || text.includes('bills')) return '#a855f7';
    if (text.includes('rose') || text.includes('black')) return '#ec4899';
    if (text.includes('broly') || text.includes('kale')) return '#22c55e';
    if (text.includes('ssj') || text.includes('super saiyan')) return '#eab308';
    if (text.includes('sukuna') || text.includes('kaioken')) return '#ef4444';
    return '#f97316';
  };

  const auraA = getAuraColor(charA);
  const auraB = getAuraColor(charB);

  useEffect(() => {
    if (phase === 'climax' || phase === 'giro') {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const nameA = charA?.name || 'Luchador 1';
  const nameB = charB?.name || 'Luchador 2';

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-950 shadow-2xl transition-all ${shake ? 'animate-bounce' : ''}`}>
      {/* Top HUD */}
      <div className="absolute top-0 inset-x-0 z-20 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-start justify-between gap-4 pointer-events-none">
        {/* P1 Bar */}
        <div className="flex-1 flex flex-col gap-1 max-w-[42%]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg overflow-hidden border-2 border-amber-400 bg-slate-900 shrink-0 shadow-md">
              <img 
                src={charA?.imageUrl || charA?.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${nameA}`} 
                alt={nameA} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="truncate">
              <div className="font-orbitron font-bold text-xs sm:text-sm text-white truncate drop-shadow">{nameA}</div>
              <div className="text-[10px] font-mono text-amber-300/80">{charA?.tier || 'Nivel APEX'}</div>
            </div>
          </div>
          <div className="w-full h-3 bg-slate-950/80 rounded-full border border-slate-700 overflow-hidden p-0.5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              style={{ width: `${Math.max(0, Math.min(100, hpA))}%` }}
            />
          </div>
          <div className="w-[85%] h-1.5 bg-slate-950/80 rounded-full border border-slate-800 overflow-hidden p-0.2">
            <div 
              className="h-full rounded-full transition-all duration-300 shadow-[0_0_6px_rgba(245,158,11,0.8)]"
              style={{ width: '90%', backgroundColor: auraA }}
            />
          </div>
        </div>

        {/* Center VS & Quick Play Button */}
        <div className="flex flex-col items-center gap-1 pointer-events-auto shrink-0">
          <div className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-600 to-orange-600 text-[10px] font-black tracking-widest text-slate-950 shadow-md font-orbitron">
            FASE {phase?.toUpperCase()}
          </div>
          {onOpenArcade && (
            <button
              onClick={onOpenArcade}
              className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/50 text-[11px] text-amber-300 font-bold transition shadow cursor-pointer font-sans"
              title="Abrir el juego completo para luchar tu mismo"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Jugar Combate</span>
            </button>
          )}
        </div>

        {/* P2 Bar */}
        <div className="flex-1 flex flex-col items-end gap-1 max-w-[42%] text-right">
          <div className="flex items-center justify-end gap-2 flex-row-reverse">
            <div className="w-9 h-9 rounded-lg overflow-hidden border-2 border-orange-500 bg-slate-900 shrink-0 shadow-md">
              <img 
                src={charB?.imageUrl || charB?.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${nameB}`} 
                alt={nameB} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="truncate">
              <div className="font-orbitron font-bold text-xs sm:text-sm text-white truncate drop-shadow">{nameB}</div>
              <div className="text-[10px] font-mono text-orange-400/80">{charB?.tier || 'Nivel APEX'}</div>
            </div>
          </div>
          <div className="w-full h-3 bg-slate-950/80 rounded-full border border-slate-700 overflow-hidden p-0.5 shadow-inner flex justify-end">
            <div 
              className="h-full bg-gradient-to-l from-emerald-500 to-teal-300 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              style={{ width: `${Math.max(0, Math.min(100, hpB))}%` }}
            />
          </div>
          <div className="w-[85%] h-1.5 bg-slate-950/80 rounded-full border border-slate-800 overflow-hidden p-0.2 flex justify-end">
            <div 
              className="h-full rounded-full transition-all duration-300 shadow-[0_0_6px_rgba(245,158,11,0.8)]"
              style={{ width: '85%', backgroundColor: auraB }}
            />
          </div>
        </div>
      </div>

      {/* Arena 2D Floor & Sky */}
      <div className="relative w-full h-[320px] sm:h-[380px] overflow-hidden bg-gradient-to-b from-[#1a233a] via-[#243354] to-[#121829] flex items-end justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,140,0,0.15),_transparent_70%)]" />
        <div className="absolute bottom-16 inset-x-0 h-32 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent pointer-events-none" />

        {/* Ring Floor */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#1b1f2b] to-[#2d3748] border-t-2 border-slate-600/60 shadow-[0_-4px_20px_rgba(0,0,0,0.8)]">
          <div className="w-full h-full opacity-30 bg-[linear-gradient(90deg,#000_1px,transparent_1px)] bg-[size:40px_100%]" />
        </div>

        {/* Fighter 1 (Left) */}
        <div className="absolute left-[20%] sm:left-[28%] bottom-16 flex flex-col items-center transition-all duration-300">
          <div 
            className="absolute -inset-4 rounded-full blur-md opacity-60 animate-pulse pointer-events-none"
            style={{ backgroundColor: auraA }}
          />
          <div className="relative w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center">
            <img 
              src={charA?.imageUrl || charA?.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${nameA}`} 
              alt={nameA} 
              className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transition-transform hover:scale-110" 
            />
          </div>
          <div className="w-12 h-2 bg-black/50 rounded-full blur-xs mt-1" />
        </div>

        {/* Center FX */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-24 flex items-center justify-center pointer-events-none">
          {phase === 'escalada' || phase === 'climax' ? (
            <div className="relative flex items-center justify-center">
              <div 
                className="w-24 sm:w-36 h-4 rounded-l-full shadow-lg animate-pulse"
                style={{ backgroundColor: auraA, boxShadow: `0 0 20px ${auraA}` }}
              />
              <div className="w-8 h-8 rounded-full bg-white animate-ping shadow-[0_0_30px_#fff]" />
              <div 
                className="w-24 sm:w-36 h-4 rounded-r-full shadow-lg animate-pulse"
                style={{ backgroundColor: auraB, boxShadow: `0 0 20px ${auraB}` }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1 opacity-70">
              <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
              <Swords className="w-6 h-6 text-white/80 animate-pulse" />
              <Flame className="w-5 h-5 text-orange-400 animate-bounce" />
            </div>
          )}
        </div>

        {/* Fighter 2 (Right) */}
        <div className="absolute right-[20%] sm:right-[28%] bottom-16 flex flex-col items-center transition-all duration-300">
          <div 
            className="absolute -inset-4 rounded-full blur-md opacity-60 animate-pulse pointer-events-none"
            style={{ backgroundColor: auraB }}
          />
          <div className="relative w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center scale-x-[-1]">
            <img 
              src={charB?.imageUrl || charB?.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${nameB}`} 
              alt={nameB} 
              className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transition-transform hover:scale-110" 
            />
          </div>
          <div className="w-12 h-2 bg-black/50 rounded-full blur-xs mt-1" />
        </div>
      </div>
    </div>
  );
}
