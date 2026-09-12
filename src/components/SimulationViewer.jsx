import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, Download, Copy, Check, Sparkles, FileText, Swords, RefreshCw, RotateCcw,
  Heart, Zap, History, Trash2, ShieldAlert, Award, Compass, AlertTriangle, 
  Flame, Crosshair, Trophy, Volume2, VolumeX, Eye, FastForward, GitBranch,
  Coins, Dices, HelpCircle, PlayCircle, PauseCircle, BarChart3, Camera,
  Activity, Split, Sliders, Maximize2, X, ShoppingBag, Star, Gamepad2
} from 'lucide-react';
import { ObsidianBridge } from '../services/obsidianBridge';
import { SoundFX } from '../services/soundFx';
import MerchBanner from './MerchBanner';
import BeamStruggleModal from './BeamStruggleModal';
import ScriptExporterModal from './ScriptExporterModal';
import { getTranslation, translateCombatChronicle } from '../services/i18n';
import CombatArenaDevolution2D from './CombatArenaDevolution2D';

const STORAGE_KEY_COMBAT_HISTORY = 'apex_combat_history';
const STORAGE_KEY_ORACLE_COINS = 'apex_oracle_coins';

// Cuotas dinámicas de apuesta basadas en la diferencia real de poder (Tier).
// Probabilidad = scoreA/(scoreA+scoreB); cuota = 1.1/prob (mín 1.05, máx 10).
function computeFightOdds(charA, charB) {
  const tierScore = (t) => {
    const s = (t || '').toLowerCase();
    if (s.includes('high 1-a') || s.includes('outer')) return 140;
    if (s.includes('1-a') || s.includes('omni')) return 130;
    if (s.includes('low 1-a') || s.includes('hyper')) return 125;
    if (s.includes('1-b') || s.includes('2-a')) return 115;
    if (s.includes('1-c') || s.includes('2-b') || s.includes('2-c') || s.includes('multi')) return 105;
    if (s.includes('3-a') || s.includes('3-b') || s.includes('universal')) return 95;
    if (s.includes('3-c') || s.includes('4-a') || s.includes('galac')) return 80;
    if (s.includes('4-b') || s.includes('4-c') || s.includes('solar') || s.includes('estelar')) return 65;
    if (s.includes('5-a') || s.includes('5-b') || s.includes('planet')) return 50;
    if (s.includes('5-c') || s.includes('6-') || s.includes('7-a') || s.includes('contin')) return 35;
    if (s.includes('7-b') || s.includes('7-c') || s.includes('8-')) return 20;
    return 10;
  };
  const scoreA = tierScore(charA?.tier);
  const scoreB = tierScore(charB?.tier);
  const total = scoreA + scoreB || 2;
  const probA = Math.max(0.1, Math.min(0.9, scoreA / total));
  const probB = 1 - probA;
  const clamp = (o) => Math.max(1.05, Math.min(10, o));
  return { oddsA: clamp(Number((1.1 / probA).toFixed(2))), oddsB: clamp(Number((1.1 / probB).toFixed(2))), probA, probB };
}

// Degradado dinámico de barras biométricas: esmeralda (sano) → ámbar → rojo pulsante (crítico)
function hpBarClass(hp) {
  const v = Math.max(0, Math.min(100, hp));
  if (v <= 0) return 'bg-slate-800';
  if (v < 40) return 'bg-gradient-to-r from-red-700 via-red-500 to-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]';
  if (v < 70) return 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]';
  return 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]';
}
function stmBarClass(hp) {
  const v = Math.max(0, Math.min(100, hp));
  if (v <= 0) return 'bg-slate-800';
  if (v < 40) return 'bg-gradient-to-r from-orange-700 to-orange-500 rounded-full';
  if (v < 70) return 'bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full';
  return 'bg-gradient-to-r from-cyan-600 to-sky-400 rounded-full';
}

// Configuración visual por cada tipo de fase
const PHASE_STYLES = {
  'analisis': {
    theme: 'border-blue-500/50 bg-gradient-to-br from-blue-950/40 to-slate-900/40 text-blue-300 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]',
    badgeBg: 'bg-blue-600/40 text-blue-200 border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
    icon: <Compass className="w-4 h-4 text-blue-300" />,
    label: 'ANÁLISIS PREVIO & TÁCTICA'
  },
  'tanteo': {
    theme: 'border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 to-slate-900/40 text-emerald-300 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]',
    badgeBg: 'bg-emerald-600/40 text-emerald-200 border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    icon: <Crosshair className="w-4 h-4 text-emerald-300" />,
    label: 'FASE 1 · TANTEO CINÉTICO'
  },
  'escalada': {
    theme: 'border-amber-500/60 bg-gradient-to-br from-amber-950/40 to-orange-950/30 text-amber-300 shadow-[inset_0_0_25px_rgba(245,158,11,0.15)]',
    badgeBg: 'bg-gradient-to-r from-amber-600/40 to-orange-600/40 text-amber-200 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    icon: <Flame className="w-4 h-4 text-amber-400 animate-pulse" />,
    label: 'FASE 2 · ESCALADA & SÚPER ATAQUES'
  },
  'giro': {
    theme: 'border-fuchsia-500/60 bg-gradient-to-br from-fuchsia-950/40 to-purple-950/30 text-fuchsia-200 shadow-[0_0_25px_rgba(217,70,239,0.2),inset_0_0_25px_rgba(217,70,239,0.15)]',
    badgeBg: 'bg-gradient-to-r from-fuchsia-600/40 to-purple-600/40 text-fuchsia-200 border-fuchsia-400/60 shadow-[0_0_15px_rgba(217,70,239,0.5)]',
    icon: <AlertTriangle className="w-4 h-4 text-fuchsia-300 animate-pulse" />,
    label: 'FASE 3 · EL GIRO TÁCTICO / CISNE NEGRO'
  },
  'climax': {
    theme: 'border-red-500/70 bg-gradient-to-br from-red-950/50 to-rose-950/40 text-red-200 shadow-[0_0_35px_rgba(239,68,68,0.3),inset_0_0_30px_rgba(239,68,68,0.2)] scale-[1.01]',
    badgeBg: 'bg-gradient-to-r from-red-600/50 to-rose-600/50 text-red-100 border-red-400/70 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse',
    icon: <Swords className="w-4 h-4 text-red-300" />,
    label: 'FASE 4 · EL CLÍMAX ANATÓMICO (FINISHERS)'
  },
  'veredicto': {
    theme: 'border-yellow-400/70 bg-gradient-to-br from-yellow-950/50 to-amber-950/40 text-yellow-200 shadow-[0_0_40px_rgba(250,204,21,0.3),inset_0_0_40px_rgba(250,204,21,0.2)]',
    badgeBg: 'bg-gradient-to-r from-yellow-500/40 to-amber-500/40 text-yellow-100 border-yellow-300/70 shadow-[0_0_25px_rgba(250,204,21,0.6)]',
    icon: <Trophy className="w-5 h-5 text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />,
    label: 'VEREDICTO DEFINITIVO & ESTADO FINAL'
  },
  'mariposa': {
    theme: 'border-purple-500/70 bg-gradient-to-br from-purple-950/50 via-slate-900/50 to-fuchsia-950/40 text-purple-200 shadow-[0_0_35px_rgba(168,85,247,0.3),inset_0_0_30px_rgba(168,85,247,0.15)]',
    badgeBg: 'bg-gradient-to-r from-purple-600/40 to-fuchsia-600/40 text-purple-100 border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    icon: <GitBranch className="w-5 h-5 text-purple-300 animate-pulse" />,
    label: 'EFECTO MARIPOSA & CONSECUENCIAS (WHAT-IF)'
  },
  'acto': {
    theme: 'border-cyan-500/70 bg-gradient-to-br from-cyan-950/40 via-slate-900/50 to-blue-950/40 text-cyan-200 shadow-[0_0_35px_rgba(6,182,212,0.25),inset_0_0_30px_rgba(6,182,212,0.15)]',
    badgeBg: 'bg-gradient-to-r from-cyan-600/40 to-blue-600/40 text-cyan-100 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    icon: <FastForward className="w-5 h-5 text-cyan-300 animate-pulse" />,
    label: 'CONTINUACIÓN DE LA CRÓNICA · SIGUIENTE ACTO'
  },
  'cliffhanger': {
    theme: 'border-orange-400/80 bg-gradient-to-br from-orange-950/50 via-slate-900/60 to-amber-950/40 text-orange-100 shadow-[0_0_40px_rgba(251,146,60,0.35),inset_0_0_30px_rgba(251,146,60,0.2)]',
    badgeBg: 'bg-gradient-to-r from-orange-600/50 to-amber-600/50 text-orange-100 border-orange-400/70 shadow-[0_0_20px_rgba(251,146,60,0.6)] animate-pulse',
    icon: <PauseCircle className="w-5 h-5 text-orange-300 animate-pulse" />,
    label: '⏸️ CLIFFHANGER — CONTINUARÁ'
  }
};

function getPhaseStyle(title) {
  const t = title.toLowerCase();
  if (t.includes('cliffhanger') || t.includes('continuará') || t.includes('continuara') || t.includes('to be continued') || t.includes('次回へ続く') || t.includes('⏸')) return PHASE_STYLES.cliffhanger;
  if (t.includes('acto') || t.includes('act ') || t.includes('capítulo') || t.includes('capitulo') || t.includes('chapter') || t.includes('siguiente') || t.includes('continuación') || t.includes('continuacion')) return PHASE_STYLES.acto;
  if (t.includes('mariposa') || t.includes('butterfly') || t.includes('what-if') || t.includes('consecuencias') || t.includes('secuelas') || t.includes('バタフライ') || t.includes('多元宇宙')) return PHASE_STYLES.mariposa;
  if (t.includes('análisis') || t.includes('analisis') || t.includes('analysis') || t.includes('事前分析') || t.includes('hax')) return PHASE_STYLES.analisis;
  if (t.includes('fase 1') || t.includes('phase 1') || t.includes('第1') || t.includes('tanteo') || t.includes('probing')) return PHASE_STYLES.tanteo;
  if (t.includes('fase 2') || t.includes('phase 2') || t.includes('第2') || t.includes('escalada') || t.includes('escalation')) return PHASE_STYLES.escalada;
  if (t.includes('fase 3') || t.includes('phase 3') || t.includes('第3') || t.includes('giro') || t.includes('turning') || t.includes('cisne') || t.includes('swan')) return PHASE_STYLES.giro;
  if (t.includes('fase 4') || t.includes('phase 4') || t.includes('第4') || t.includes('clímax') || t.includes('climax') || t.includes('究極奥義')) return PHASE_STYLES.climax;
  if (t.includes('veredicto') || t.includes('verdict') || t.includes('estado final') || t.includes('final state') || t.includes('resultado') || t.includes('勝者') || t.includes('最終判定')) return PHASE_STYLES.veredicto;
  return PHASE_STYLES.tanteo;
}

// Renderizador visual enriquecido de texto de combate
function RichCombatText({ content, isStreamingLast, comicMode = false }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div aria-live="polite" className={`space-y-4 font-sans leading-relaxed text-[14px] text-slate-200 ${comicMode ? 'uppercase tracking-wide' : ''}`}>
      {lines.filter((line, i, arr) => line.trim() === '' || line.trim() !== arr[i - 1]?.trim()).map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lIdx} className="h-1.5" />;

        // Subtítulos tipo ## o **TITULO:**
        if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
          const titleText = trimmed.replace(/^#+\s*/, '');
          if (titleText.toLowerCase().includes('veredicto') || titleText.toLowerCase().includes('estado final')) {
            return (
              <div key={lIdx} className="my-6 p-1 rounded-xl bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-pulse">
                <div className="bg-slate-950 px-6 py-4 rounded-lg flex items-center justify-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <h4 className="text-xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-400 tracking-[0.2em] uppercase text-center">
                    {titleText}
                  </h4>
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
            );
          }
          return (
            <h4 key={lIdx} className="text-lg font-bold font-cinzel text-amber-300 pt-4 pb-2 border-b border-slate-700/60 tracking-wider shadow-[0_4px_10px_-6px_rgba(245,158,11,0.3)]">
              <span className="text-amber-500 mr-2">❖</span>{titleText}
            </h4>
          );
        }

        // Checkpoint Biométrico / Telemetría en Vivo (HP_A / HP_B / STM)
        const isTelemetryLine = trimmed.includes('TELEMETRÍA') || trimmed.includes('BIOMETRICS') || (trimmed.includes('HP_A:') && trimmed.includes('HP_B:')) || trimmed.includes('ESTADO EN VIVO') || trimmed.includes('🔴 BANDO A');
        
        // Skip rendering redundant telemetry lines since they are grouped
        if (trimmed.includes('ESTADO EN VIVO') || trimmed.includes('🔴 BANDO A') || trimmed.includes('🔵 BANDO B') || trimmed.match(/^\d+%\s*(HP|STM)$/)) {
          return null; // The telemetry widget captures this automatically via regex globally or we can ignore it since the Phase Biometrics header is caught
        }

        if (isTelemetryLine) {
          // Si es una línea que dispara el widget
          const nextLines = lines.slice(lIdx).join('\n');
          const hpAMatch = nextLines.match(/HP_A:\s*(\d+)%?/i) || nextLines.match(/BANDO A[^]*?(\d+)%\s*HP/i);
          const stmAMatch = nextLines.match(/STM_A:\s*(\d+)%?/i) || nextLines.match(/BANDO A[^]*?(\d+)%\s*STM/i);
          const hpBMatch = nextLines.match(/HP_B:\s*(\d+)%?/i) || nextLines.match(/BANDO B[^]*?(\d+)%\s*HP/i);
          const stmBMatch = nextLines.match(/STM_B:\s*(\d+)%?/i) || nextLines.match(/BANDO B[^]*?(\d+)%\s*STM/i);

          const hpAVal = hpAMatch ? parseInt(hpAMatch[1], 10) : 100;
          const stmAVal = stmAMatch ? parseInt(stmAMatch[1], 10) : 100;
          const hpBVal = hpBMatch ? parseInt(hpBMatch[1], 10) : 100;
          const stmBVal = stmBMatch ? parseInt(stmBMatch[1], 10) : 100;

          return (
            <div key={lIdx} className="my-5 p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.25)] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-2 font-bold text-cyan-300 tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping inline-block shadow-[0_0_8px_cyan]" />
                  <span>📡 TELEMETRÍA BIOMÉTRICA DE FASE</span>
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  ESTADO EN VIVO
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Contendiente A */}
                <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-900/40 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-red-400 font-bold">🔴 BANDO A</span>
                    <div className="flex gap-2">
                      <span className="text-red-400 font-bold">{hpAVal}% HP</span>
                      <span className="text-amber-400">{stmAVal}% STM</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div 
                      role="progressbar"
                      aria-valuenow={Math.max(0, Math.min(100, hpAVal))}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`HP Bando A: ${Math.max(0, Math.min(100, hpAVal))}%`}
                      className={`h-full ${hpBarClass(hpAVal)} transition-all duration-700`} 
                      style={{ width: `${Math.max(0, Math.min(100, hpAVal))}%` }} 
                    />
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
                    <div 
                      role="progressbar"
                      aria-valuenow={Math.max(0, Math.min(100, stmAVal))}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Stamina Bando A: ${Math.max(0, Math.min(100, stmAVal))}%`}
                      className={`h-full ${stmBarClass(stmAVal)} transition-all duration-700`} 
                      style={{ width: `${Math.max(0, Math.min(100, stmAVal))}%` }} 
                    />
                  </div>
                </div>

                {/* Contendiente B */}
                <div className="p-2.5 rounded-xl bg-blue-950/20 border border-blue-900/40 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-blue-400 font-bold">🔵 BANDO B</span>
                    <div className="flex gap-2">
                      <span className="text-cyan-400">{stmBVal}% STM</span>
                      <span className="text-blue-400 font-bold">{hpBVal}% HP</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 flex justify-end">
                    <div 
                      role="progressbar"
                      aria-valuenow={Math.max(0, Math.min(100, hpBVal))}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`HP Bando B: ${Math.max(0, Math.min(100, hpBVal))}%`}
                      className={`h-full ${hpBarClass(hpBVal)} transition-all duration-700`} 
                      style={{ width: `${Math.max(0, Math.min(100, hpBVal))}%` }} 
                    />
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60 flex justify-end">
                    <div 
                      role="progressbar"
                      aria-valuenow={Math.max(0, Math.min(100, stmBVal))}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Stamina Bando B: ${Math.max(0, Math.min(100, stmBVal))}%`}
                      className={`h-full ${stmBarClass(stmBVal)} transition-all duration-700`} 
                      style={{ width: `${Math.max(0, Math.min(100, stmBVal))}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        }

        // Autocompletado de asteriscos huérfanos (cierra la cursiva si la IA lo olvidó)
        let processedLine = trimmed;
        if (processedLine.startsWith('*') && !processedLine.startsWith('**') && !processedLine.endsWith('*') && processedLine.length > 5) {
          processedLine += '*';
        }

        // Bloque de diálogo entrecomillado "..." o raya de diálogo "—..." / "*—..."
        const isDialogue = processedLine.startsWith('"') || processedLine.startsWith('“') || processedLine.startsWith('¡"') || 
                           processedLine.startsWith('—') || processedLine.startsWith('*—') || processedLine.startsWith('*-');

        if (isDialogue && processedLine.length > 5) {
          return (
            <div key={lIdx} className="my-4 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-l-4 border-amber-400 text-amber-100 font-medium italic shadow-[0_8px_20px_-5px_rgba(0,0,0,0.5)] transform hover:scale-[1.01] transition-transform">
              <div className="flex gap-3">
                <span className="text-amber-500 font-bold not-italic text-lg drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]">💬</span>
                <p className="leading-snug">{parseInlineMarkdown(processedLine)}</p>
              </div>
            </div>
          );
        }

        // Vencedor y Dificultad
        if (trimmed.startsWith('**VENCEDOR:') || trimmed.startsWith('**VICTOR:') || trimmed.startsWith('**勝者:')) {
          return (
            <div key={lIdx} className="my-3 p-4 rounded-xl bg-gradient-to-r from-amber-900/60 to-transparent border-l-4 border-amber-500 flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <span className="text-xl font-black font-cinzel text-amber-400 drop-shadow-md">{parseInlineMarkdown(trimmed)}</span>
            </div>
          );
        }
        if (trimmed.startsWith('**DIFICULTAD:') || trimmed.startsWith('**DIFFICULTY:') || trimmed.startsWith('**難易度:')) {
          return (
            <div key={lIdx} className="my-2 p-3 rounded-xl bg-slate-900/60 border-l-4 border-red-500/50 flex items-center gap-3">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-bold text-red-400 uppercase tracking-widest">{parseInlineMarkdown(trimmed)}</span>
            </div>
          );
        }

        // Grito de Ataque / Finisher ¡...!
        if (trimmed.startsWith('¡') && trimmed.endsWith('!') && trimmed.length < 80) {
          return (
            <div key={lIdx} className="my-5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/40 via-amber-500/30 to-red-600/40 blur-md group-hover:blur-lg transition-all" />
              <div className="relative p-3 px-6 rounded-xl bg-gradient-to-r from-red-950/80 via-black to-red-950/80 border border-red-500/60 text-red-100 font-mono font-black text-center uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                <span className="text-amber-400 animate-pulse mr-2">⚡</span>
                {trimmed}
                <span className="text-amber-400 animate-pulse ml-2">⚡</span>
              </div>
            </div>
          );
        }

        // Sonidos de impacto biomecánico o cinético (CRACK, TONK, CRUNCH, CHAK, BOOM, etc.)
        const soundImpactMatch = trimmed.match(/^[\*\s]*(CRACK|CRUNCH|TONK|CHAK|SNAP|SMASH|SHHK|THUMP|BOOM|CLAP|BZZ+|THD+U+|KABOO+M|KRR+A+C+K+)[\.\!\*\s]*$/i);
        if (soundImpactMatch) {
          const soundText = soundImpactMatch[1].toUpperCase();
          return (
            <div key={lIdx} className="my-3 text-center">
              <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-red-950/80 via-red-900/60 to-black rounded-lg border border-red-500/50 font-mono font-black text-red-300 tracking-[0.25em] text-xs drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] skew-x-[-6deg]">
                ⚡ {soundText} ⚡
              </span>
            </div>
          );
        }

        // Monólogos o pensamientos internos genuinos entre asteriscos (*pensamiento*)
        const isStructuralNote = trimmed.startsWith('* ') || 
          trimmed.includes('Línea Alfa') || trimmed.includes('Línea Beta') || trimmed.includes('Línea Omega') ||
          trimmed.includes('Bando A') || trimmed.includes('Bando B') || trimmed.includes('Deseo:') || 
          trimmed.includes('HP Efectivo') || trimmed.includes('Daño Estético') || trimmed.includes('Nota:') ||
          trimmed.startsWith('* =') || trimmed.startsWith('* = ') || trimmed.startsWith('*=');

        if (!isStructuralNote && trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('**') && trimmed.length > 5) {
          return (
            <div key={lIdx} className="my-3 p-3 px-4 rounded-xl bg-purple-950/30 border-l-4 border-purple-400 text-purple-200 font-mono italic text-xs shadow-md">
              <span className="text-purple-400 font-bold not-italic mr-2">🧠 Monólogo Interno:</span>
              <span>{trimmed.slice(1, -1)}</span>
            </div>
          );
        }

        // Interceptor para Cartas de Veredicto (Magnitud Richter, Radiación, Estado Final)
        if (trimmed.startsWith('- **') || trimmed.startsWith('• **')) {
          const lower = trimmed.toLowerCase();
          if (lower.includes('magnitud richter')) {
            return (
              <div key={lIdx} className="my-2 p-3 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center gap-3">
                <span className="text-xl">🪨</span>
                <div className="flex-1">
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest block">Impacto Sísmico</span>
                  <div className="text-slate-200">{parseInlineMarkdown(trimmed.replace(/^[•\-\*]\s*/, ''))}</div>
                </div>
              </div>
            );
          }
          if (lower.includes('radio de destrucción') || lower.includes('radio de vitrificación')) {
            return (
              <div key={lIdx} className="my-2 p-3 rounded-xl bg-slate-900 border border-orange-500/30 flex items-center gap-3">
                <span className="text-xl">🌋</span>
                <div className="flex-1">
                  <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest block">Área Devastada</span>
                  <div className="text-slate-200">{parseInlineMarkdown(trimmed.replace(/^[•\-\*]\s*/, ''))}</div>
                </div>
              </div>
            );
          }
          if (lower.includes('irradiación') || lower.includes('radiación residual')) {
            return (
              <div key={lIdx} className="my-2 p-3 rounded-xl bg-slate-900 border border-green-500/30 flex items-center gap-3">
                <span className="text-xl">☢️</span>
                <div className="flex-1">
                  <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest block">Contaminación de Ki</span>
                  <div className="text-slate-200">{parseInlineMarkdown(trimmed.replace(/^[•\-\*]\s*/, ''))}</div>
                </div>
              </div>
            );
          }
          if (trimmed.match(/\*\*(.*?)\*\*.*?\b(HP|STM)\b/i) && !lower.includes('secuelas')) {
            // Tarjeta médica de Combatiente
            return (
              <div key={lIdx} className="my-3 p-3 rounded-xl bg-red-950/20 border-l-4 border-red-500/60 flex items-start gap-3">
                <span className="text-xl mt-1">🩸</span>
                <div className="flex-1 text-sm leading-relaxed text-red-100">
                  {parseInlineMarkdown(trimmed.replace(/^[•\-\*]\s*/, ''))}
                </div>
              </div>
            );
          }
        }

        // Elementos de lista numérica
        if (trimmed.match(/^\d+\.\s/)) {
          const match = trimmed.match(/^\d+\./);
          const cleanItem = trimmed.replace(/^\d+\.\s*/, '');
          return (
            <div key={lIdx} className="flex items-start gap-3 text-slate-300 pl-2 group my-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
              <span className="text-cyan-400 font-black text-sm mt-0.5">{match?.[0] || '•'}</span>
              <div className="flex-1 leading-relaxed text-[13px]">{parseInlineMarkdown(cleanItem)}</div>
            </div>
          );
        }

        // Elementos de lista o bullet points • o -
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const cleanItem = trimmed.replace(/^[•\-\*]\s*/, '');
          return (
            <div key={lIdx} className="flex items-start gap-3 text-slate-300 pl-2 group">
              <span className="text-amber-400 font-bold text-sm mt-1 transition-transform group-hover:scale-125">▹</span>
              <div className="flex-1 leading-relaxed">{parseInlineMarkdown(cleanItem)}</div>
            </div>
          );
        }

        // Párrafo estándar con formato inline
        return (
          <p key={lIdx} className="text-slate-300 leading-relaxed drop-shadow-sm">
            {parseInlineMarkdown(trimmed)}
          </p>
        );
      })}
      {isStreamingLast && (
        <span className="inline-block w-3 h-5 bg-gradient-to-t from-amber-500 to-amber-300 ml-1 animate-pulse rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
      )}
    </div>
  );
}

// Parsea negritas **texto**, cursivas *texto*, y marcas de tiempo T+X.X
function parseInlineMarkdown(text) {
  if (!text) return null;

  // Split by bold (**...**), italics (*...*), and timestamps (T+... or T-...)
  const parts = text.split(/(\[(?:ROSTER V26|ORÁCULO — [^\]]+|SIMULACIÓN — [^\]]+|CAMPAÑA — [^\]]+)\]|\*\*.*?\*\*|\*[^*]+\*|T[+\-]\d+\.?\d*s?:?)/g);

  return parts.map((part, idx) => {
    if (!part) return null;

    // APEX V2 Official Badges
    if (part.startsWith('[') && part.endsWith(']')) {
      const badgeText = part.slice(1, -1);
      let badgeStyle = "bg-slate-800 text-slate-300 border-slate-700";
      if (badgeText.includes('ROSTER V26')) badgeStyle = "bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-cyan-950/50";
      else if (badgeText.includes('DESPERTAR CANÓNICO')) badgeStyle = "bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-amber-950/50";
      else if (badgeText.includes('DESPERTAR TRASCENDENTE')) badgeStyle = "bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-purple-950/50";
      else if (badgeText.includes('FUSIÓN CANÓNICA')) badgeStyle = "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-emerald-950/50";
      else if (badgeText.includes('FUSIÓN WHAT-IF')) badgeStyle = "bg-violet-950/80 text-violet-300 border-violet-500/50 shadow-violet-950/50";
      else if (badgeText.includes('FINISHER LIBERADO')) badgeStyle = "bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-rose-950/50";
      else if (badgeText.includes('ENTIDAD TEMPORAL')) badgeStyle = "bg-blue-950/80 text-blue-300 border-blue-500/50 shadow-blue-950/50";
      else if (badgeText.includes('CAMPAÑA')) badgeStyle = "bg-yellow-950/80 text-yellow-300 border-yellow-500/50 shadow-yellow-950/50";
      else if (badgeText.includes('ORÁCULO')) badgeStyle = "bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/50 shadow-fuchsia-950/50";

      return (
        <span key={idx} className={`inline-flex items-center px-2 py-0.5 mx-1 rounded-full text-[10px] font-mono font-bold border shadow-sm ${badgeStyle}`}>
          🏷️ {badgeText}
        </span>
      );
    }

    // Bold text **...**
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldContent = part.slice(2, -2);
      
      // Resaltar palabras clave
      if (boldContent.includes('ANÁLISIS') || boldContent.includes('FASE') || boldContent.includes('VEREDICTO')) {
        return <strong key={idx} className="text-amber-400 font-bold uppercase tracking-wider">{boldContent}</strong>;
      }
      if (boldContent.includes('CRÍTICO') || boldContent.includes('MUERTE') || boldContent.includes('DESTRUIDO')) {
        return <strong key={idx} className="text-red-400 font-bold">{boldContent}</strong>;
      }
      if (boldContent.includes('TRANSFORMACIÓN') || boldContent.includes('ULTRA') || boldContent.includes('BLUE')) {
        return <strong key={idx} className="text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.6)]">{boldContent}</strong>;
      }
      return <strong key={idx} className="text-white font-bold drop-shadow-sm">{boldContent}</strong>;
    }

    // Italic text *...*
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      const italicContent = part.slice(1, -1);
      return <em key={idx} className="text-cyan-100 italic opacity-90">{italicContent}</em>;
    }

    // Timestamps T+0.0 / T-5.0
    if (part.match(/^T[+\-]\d+\.?\d*s?:?$/)) {
      return (
        <span key={idx} className="inline-block px-1.5 py-0.5 mx-1 rounded bg-slate-900 border border-amber-500/40 text-amber-400 font-mono text-[10px] font-bold">
          ⏱️ {part}
        </span>
      );
    }

    return part;
  });
}

// Motor Semántico de Biometría, Fases Inteligentes y Registro Crítico en Tiempo Real
const parseSimulation = (text, simulationData, activeTab = 'all', manualOverrides = {}) => {
  if (!text) return { phases: [], hpA: 100, stmA: 100, hpB: 100, stmB: 100, squadStats: [], squadStatsA: [], verdictInfo: null, criticalEvents: [] };

  // Helper: Name Tokenizer para evitar colisiones entre "Son Goku" y "Goku Black"
  const getNameTokens = (charObj, fallback) => {
    const rawName = (charObj?.name || fallback || '').toLowerCase();
    const clean = rawName.replace(/[\(\)\[\]\-_]/g, ' ');
    const parts = clean.split(/\s+/).filter(p => p.length >= 2);
    if (rawName.includes('goku') && (rawName.includes('gt') || rawName.includes('4'))) parts.push('goku', 'kakarot', 'kakarotto', 'ssj4', 'gt');
    else if (rawName.includes('goku') && !rawName.includes('black')) parts.push('goku', 'kakarot', 'kakarotto');
    if (rawName.includes('black')) parts.push('black', 'zamasu', 'rosé', 'rose');
    if (rawName.includes('vegeta')) parts.push('vegeta', 'príncipe');
    if (rawName.includes('gohan')) parts.push('gohan', 'beast');
    return Array.from(new Set(parts));
  };

  const tokensA = getNameTokens(simulationData?.charA, 'contendiente a');
  const tokensB = getNameTokens(simulationData?.charB, 'contendiente b');

  const hasSurvival = (tokens, targetText = text) => {
    if (!tokens || !Array.isArray(tokens)) return false;
    for (const token of tokens) {
      if (!token || token.length < 3) continue;
      const regex = new RegExp(`(?:${token}[^\\n\\r]{0,80}?\\b(?:SOBREVIVE|ESCAPA|HUYE|VIVO|SALVADO|CURADO|RECIBE SENZU|RESISTE|AGUANTA|VENCEDOR|GANADOR|VICTORIOSO|RETIRADA|SUPERVIVIENTE)\\b|\\b(?:SOBREVIVE|ESCAPA|HUYE|SUPERVIVIENTE|VIVO)\\b[^\\n\\r]{0,80}?${token})`, 'i');
      if (regex.test(targetText)) return true;
    }
    return false;
  };

  const hasFatality = (tokens, targetText = text) => {
    if (!tokens || !Array.isArray(tokens)) return false;
    if (hasSurvival(tokens, targetText)) return false; // Si explícitamente sobrevivió/escapó, NO es fatalidad

    for (const token of tokens) {
      if (!token || token.length < 3) continue;
      const regex = new RegExp(`(?:\\b${token}\\s+(?:es\\s+asesinad[oa]|es\\s+desintegrad[oa]|es\\s+aniquilad[oa]|es\\s+eliminad[oa]|cae\\s+muert[oa]|fallece|muere\\b|\\bMUERTO\\b|0%\\s*HP)|\\b(?:muerte\\s+de|fallecimiento\\s+de|asesinato\\s+de)\\s+${token}\\b)`, 'i');
      if (regex.test(targetText)) return true;
    }
    return false;
  };

  const hasExtremeIncapacity = (tokens, targetText = text) => {
    if (!tokens || !Array.isArray(tokens)) return false;
    for (const token of tokens) {
      const regex = new RegExp(`${token}[^\\n]{0,60}?\\b(INCAPACITADO|INCAPACITADA|CR[IÍ]TICO|SUPERVIVENCIA EXTREMA|FRACTURA GRAVE|AL BORDE DE LA MUERTE|INM[OÓ]VIL|INCONSCIENTE)\\b`, 'i');
      if (regex.test(targetText)) return true;
    }
    return false;
  };

  // Separador flexible multi-patrón de fases (soporta ###, ##, **FASE X**, FASE X ·, VEREDICTO, etc.)
  // Acepta \n previo O inicio de texto (^) para no perder la primera fase.
  const cleanText = text.replace(/\|\|BIOMETRICS\|[^|]+\|\|/g, '');
  const phaseSplitRegex = /(?=(?:^|\n)#{1,3}\s+(?:FASE|ANÁLISIS|VEREDICTO|ACTO|CAPÍTULO|ESTADO|EFECTO|CLÍMAX|TANTEO|ESCALADA|GIRO)|(?:^|\n)\*{0,2}FASE\s+\d+[\s\:\·]|(?:^|\n)\*{0,2}VEREDICTO\s+DEFINITIVO|(?:^|\n)\*{0,2}ANÁLISIS\s+PREVIO)/gi;

  let rawPhases = cleanText.split(phaseSplitRegex).map(p => p.trim()).filter(Boolean);
  if (rawPhases.length <= 1 && cleanText.includes('\n---\n')) {
    const hrParts = cleanText.split(/\n---\r?\n/g).map(p => p.trim()).filter(Boolean);
    if (hrParts.length > 1) rawPhases = hrParts;
  }
  if (rawPhases.length === 0) rawPhases = [cleanText];

  // Extractor de biometría por fragmento de texto
  const calculateBiometricsForChunk = (chunkText, isFinal = false) => {
    let curHpA = 100, curStmA = 100;
    let curHpB = 100, curStmB = 100;

    // 1. Tag directo si existe (soporta ||BIOMETRICS||, TELEMETRÍA EN VIVO, y formato libre HP_A/HP_B)
    const telemetryMatches = [...chunkText.matchAll(/(?:TELEMETR[IÍ]A|BIOMETRICS|HP_A)[\s\:\·\|]*HP_A:?\s*(\d+)%?(?:\s*\|?\s*STM_A:?\s*(\d+)%?)?[\s\:\·\|]*HP_B:?\s*(\d+)%?(?:\s*\|?\s*STM_B:?\s*(\d+)%?)?/gi)];
    if (telemetryMatches.length > 0) {
      const lastMatch = telemetryMatches[telemetryMatches.length - 1];
      const parsedHpA = parseInt(lastMatch[1], 10);
      const parsedStmA = lastMatch[2] ? parseInt(lastMatch[2], 10) : 100;
      const parsedHpB = parseInt(lastMatch[3], 10);
      const parsedStmB = lastMatch[4] ? parseInt(lastMatch[4], 10) : 100;

      if (!isNaN(parsedHpA) && !isNaN(parsedHpB)) {
        return {
          hpA: Math.max(0, Math.min(100, parsedHpA)),
          stmA: Math.max(0, Math.min(100, parsedStmA)),
          hpB: Math.max(0, Math.min(100, parsedHpB)),
          stmB: Math.max(0, Math.min(100, parsedStmB))
        };
      }
    }

    const simpleHpMatch = [...chunkText.matchAll(/HP_A:\s*(\d+)%?.*?HP_B:\s*(\d+)%?/gis)];
    if (simpleHpMatch.length > 0) {
      const last = simpleHpMatch[simpleHpMatch.length - 1];
      const pA = parseInt(last[1], 10);
      const pB = parseInt(last[2], 10);
      if (!isNaN(pA) && !isNaN(pB)) {
        return {
          hpA: Math.max(0, Math.min(100, pA)),
          stmA: Math.max(0, Math.min(100, Math.round(pA * 0.9))),
          hpB: Math.max(0, Math.min(100, pB)),
          stmB: Math.max(0, Math.min(100, Math.round(pB * 0.9)))
        };
      }
    }

    // 2. Detección de Veredicto Definitivo
    const verdictMatch = chunkText.match(/VENCEDOR:\s*([^\n\r]+)/i) || chunkText.match(/GANADOR:\s*([^\n\r]+)/i) || chunkText.match(/VICTORIA:\s*([^\n\r]+)/i);

    let winnerIsA = false;
    let winnerIsB = false;

    if (verdictMatch) {
      const winnerStr = verdictMatch[1].toLowerCase();
      const scoreA = tokensA.filter(t => winnerStr.includes(t)).length;
      const scoreB = tokensB.filter(t => winnerStr.includes(t)).length;

      if (scoreA > scoreB) winnerIsA = true;
      else if (scoreB > scoreA) winnerIsB = true;
      else if (tokensA.some(t => winnerStr.includes(t))) winnerIsA = true;
      else if (tokensB.some(t => winnerStr.includes(t))) winnerIsB = true;
    }

    if (winnerIsA) {
      curHpB = 0;
      curStmB = 0;
      if (hasExtremeIncapacity(tokensA, chunkText)) {
        curHpA = 8;
        curStmA = 4;
      } else {
        curHpA = 40;
        curStmA = 25;
      }
      return { hpA: curHpA, stmA: curStmA, hpB: curHpB, stmB: curStmB };
    }

    if (winnerIsB) {
      curHpA = 0;
      curStmA = 0;
      if (hasExtremeIncapacity(tokensB, chunkText)) {
        curHpB = 8;
        curStmB = 4;
      } else {
        curHpB = 40;
        curStmB = 25;
      }
      return { hpA: curHpA, stmA: curStmA, hpB: curHpB, stmB: curStmB };
    }

    // 3. Degradación dinámica EQUILIBRADA por fase si no hay veredicto aún.
    //    Antes el Bando B perdía 75% vs 55% del A (sesgo a favor de A). Ahora
    //    ambos sufren el mismo desgaste base; el que domina (tokens de ofensiva)
    //    conserva más HP.
    const progressRatio = Math.min(1, chunkText.length / Math.max(1, text.length));
    const severeHits = (chunkText.match(/(kamehameha|genkidama|ryūken|corte|espada|guadaña|fractura|impacto|explosión|desgarro|choque|colisión)/gi) || []).length;

    // Detectar dominio ofensivo por token de nombre (quién está más presente en el chunk)
    const chunkLower = chunkText.toLowerCase();
    const offA = tokensA.filter(t => t.length > 3 && chunkLower.includes(t)).length;
    const offB = tokensB.filter(t => t.length > 3 && chunkLower.includes(t)).length;
    const balanceA = offA + offB > 0 ? 0.5 + (offA - offB) * 0.06 : 0.5;
    const balanceB = 1 - balanceA;

    const baseDrain = progressRatio * 65 + severeHits * 4;
    curHpA = Math.max(8, Math.round(100 - baseDrain * (1.4 - balanceA)));
    curStmA = Math.max(5, Math.round(100 - baseDrain * 1.15 * (1.3 - balanceA)));
    curHpB = Math.max(8, Math.round(100 - baseDrain * (1.4 - balanceB)));
    curStmB = Math.max(5, Math.round(100 - baseDrain * 1.15 * (1.3 - balanceB)));

    return { hpA: curHpA, stmA: curStmA, hpB: curHpB, stmB: curStmB };
  };

  // Construir las fases formateadas y su telemetría acumulada
  let accumulatedProgressText = "";
  const phases = rawPhases.map((phaseRaw, index) => {
    accumulatedProgressText += "\n" + phaseRaw;
    let title = `Fase ${index + 1}`;
    let content = phaseRaw;

    const firstLineEnd = phaseRaw.indexOf('\n');
    const firstLine = firstLineEnd !== -1 ? phaseRaw.substring(0, firstLineEnd).trim() : phaseRaw;

    if (firstLine.match(/^(?:#{1,3}\s*)?(?:FASE|ANÁLISIS|VEREDICTO|ACTO|CAPÍTULO|ESTADO|EFECTO|CLÍMAX|TANTEO|ESCALADA|GIRO)/i) || firstLine.length < 80) {
      title = firstLine.replace(/^#+\s*/, '').replace(/^[*_\-]+/, '').replace(/[*_\-]+$/, '').trim();
      content = firstLineEnd !== -1 ? phaseRaw.substring(firstLineEnd + 1).trim() : '';
    }

    const biometrics = calculateBiometricsForChunk(accumulatedProgressText, index === rawPhases.length - 1);

    return {
      title: title || `Fase ${index + 1}`,
      content: content || phaseRaw,
      isLast: index === rawPhases.length - 1,
      biometrics
    };
  }).filter(p => p.title || p.content);

  // Determinar biometría final visible (según pestaña activa o total)
  let finalHpA = 100, finalStmA = 100, finalHpB = 100, finalStmB = 100;
  if (typeof activeTab === 'number' && phases[activeTab]) {
    finalHpA = phases[activeTab].biometrics.hpA;
    finalStmA = phases[activeTab].biometrics.stmA;
    finalHpB = phases[activeTab].biometrics.hpB;
    finalStmB = phases[activeTab].biometrics.stmB;
  } else {
    const overall = calculateBiometricsForChunk(text, true);
    finalHpA = overall.hpA;
    finalStmA = overall.stmA;
    finalHpB = overall.hpB;
    finalStmB = overall.stmB;
  }

  // Extracción del Veredicto para la Victory Card
  let verdictInfo = null;
  const vMatch = text.match(/VENCEDOR:\s*([^\n\r]+)/i);
  if (vMatch) {
    const winnerName = vMatch[1].replace(/[\*\_\[\]]/g, '').trim();
    const diffMatch = text.match(/DIFICULTAD:\s*([^\n\r]+)/i);
    const difficulty = diffMatch ? diffMatch[1].trim() : (finalHpA <= 15 || finalHpB <= 15 ? 'Extreme-Diff (Supervivencia Límite)' : 'Mid-Diff');

    const causeMatch = text.match(/(?:CAUSALIDAD|FACTOR DECISIVO|CAUSA)[:\s]*\n([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i);
    const decisiveText = causeMatch ? causeMatch[1].trim().split('\n')[0].replace(/^[\d\.\-\*]+\s*/, '') : 'Colisión de Ataques Definitivos';

    verdictInfo = {
      winner: winnerName,
      difficulty,
      decisiveText
    };
  }

  // Analizador Profundo de Eventos Críticos (Registro Crítico Dinámico y No-Alucinatorio)
  const criticalEvents = [];
  const lowerAll = text.toLowerCase();

  // Helper para verificar habilidades reales en el roster
  const allFighters = [
    simulationData?.charA,
    simulationData?.charB,
    ...(simulationData?.teamA || []),
    ...(simulationData?.teamB || []),
    ...(simulationData?.bossMinions || []),
    ...(simulationData?.battleRoyale || [])
  ].filter(Boolean);

  const rosterMoves = allFighters.flatMap(c => [
    ...(c.arsenal?.superAttacks?.map(s => s.name.toLowerCase()) || []),
    ...(c.arsenal?.ultimateAttacks?.map(u => u.name.toLowerCase()) || []),
    ...(c.arsenal?.passives?.map(p => p.name.toLowerCase()) || []),
    ...(c.haxTags?.map(h => h.toLowerCase()) || [])
  ]);

  const hasFighterSkill = (skillWord) => rosterMoves.some(m => m.includes(skillWord.toLowerCase()));

  if (lowerAll.includes('genkidama') && (hasFighterSkill('genkidama') || lowerAll.includes('**genkidama**'))) {
    criticalEvents.push({ icon: '🌌', label: 'Super Genkidama Universal' });
  }
  if ((lowerAll.includes('ryūken') || lowerAll.includes('ryuken')) && (hasFighterSkill('ryūken') || hasFighterSkill('ryuken') || lowerAll.includes('**ryūken**') || lowerAll.includes('**ryuken**'))) {
    criticalEvents.push({ icon: '🐉', label: 'Ryūken (Dragón Dorado)' });
  }
  if (lowerAll.includes('kamehameha x10') && (hasFighterSkill('kamehameha') || lowerAll.includes('**kamehameha x10**'))) {
    criticalEvents.push({ icon: '💥', label: 'Kamehameha x10' });
  } else if (lowerAll.includes('kamehameha') && (hasFighterSkill('kamehameha') || lowerAll.includes('**kamehameha**'))) {
    criticalEvents.push({ icon: '🌊', label: 'Kamehameha' });
  }
  if (lowerAll.includes('guadaña') && (hasFighterSkill('guadaña') || lowerAll.includes('**guadaña**'))) {
    criticalEvents.push({ icon: '⚡', label: 'Guadaña & Clones Dimensionales' });
  }
  if (lowerAll.includes('espada de ki') && (hasFighterSkill('espada de ki') || lowerAll.includes('**espada de ki**'))) {
    criticalEvents.push({ icon: '⚔️', label: 'Espada de Ki Rosé' });
  }
  if (lowerAll.includes('espada de la esperanza') && (hasFighterSkill('esperanza') || lowerAll.includes('**espada de la esperanza**'))) {
    criticalEvents.push({ icon: '🗡️', label: 'Espada de la Esperanza' });
  }
  if (lowerAll.includes('galick gun') && (hasFighterSkill('galick') || lowerAll.includes('**galick gun**'))) {
    criticalEvents.push({ icon: '💜', label: 'Galick Gun' });
  }
  if (lowerAll.includes('final flash') && (hasFighterSkill('final flash') || lowerAll.includes('**final flash**'))) {
    criticalEvents.push({ icon: '⚡', label: 'Final Flash del Príncipe' });
  }
  if (lowerAll.includes('big bang') && (hasFighterSkill('big bang') || lowerAll.includes('**big bang**'))) {
    criticalEvents.push({ icon: '💥', label: 'Big Bang Attack' });
  }
  if (lowerAll.includes('mafuba') && (hasFighterSkill('mafuba') || lowerAll.includes('**mafuba**'))) {
    criticalEvents.push({ icon: '🌀', label: 'Mafuba — Sello del Diablo' });
  }
  if (lowerAll.includes('hakai') && (hasFighterSkill('hakai') || lowerAll.includes('**hakai**'))) {
    criticalEvents.push({ icon: '💀', label: 'HAKAI — Erasión Existencial' });
  }
  if (lowerAll.includes('super ghost') && (hasFighterSkill('ghost') || hasFighterSkill('fantasma'))) {
    criticalEvents.push({ icon: '👻', label: 'Super Ghost Kamikaze Attack' });
  }
  if (lowerAll.includes('hollow purple') || lowerAll.includes('murasaki') || lowerAll.includes('morado hueco')) {
    if (hasFighterSkill('purple') || hasFighterSkill('murasaki') || hasFighterSkill('vacío')) {
      criticalEvents.push({ icon: '🟣', label: 'Murasaki — Hollow Purple' });
    }
  }
  if (lowerAll.includes('expansión de dominio') || lowerAll.includes('dominio maldito')) {
    if (hasFighterSkill('dominio') || hasFighterSkill('ryoiki')) {
      criticalEvents.push({ icon: '🔴', label: 'Ryōiki Tenkai — Expansión de Dominio' });
    }
  }
  if (lowerAll.includes('rasenshuriken') || (lowerAll.includes('rasengan') && hasFighterSkill('rasengan'))) {
    criticalEvents.push({ icon: '🌀', label: 'Rasenshuriken / Rasengan' });
  }
  if (lowerAll.includes('amaterasu') && hasFighterSkill('amaterasu')) {
    criticalEvents.push({ icon: '🔥', label: 'Amaterasu — Llamas Eternas' });
  }
  if (lowerAll.includes('zenkai') && hasFighterSkill('zenkai')) {
    criticalEvents.push({ icon: '🧬', label: 'Zenkai Activo' });
  }
  if (lowerAll.includes('fractura') || lowerAll.includes('costillas rotas') || lowerAll.includes('pulmón colapsado')) {
    criticalEvents.push({ icon: '🩸', label: 'Trauma Óseo & Pulmonar' });
  }
  if (lowerAll.includes('cráter') || lowerAll.includes('vitrificad') || lowerAll.includes('colapso tectónico')) {
    criticalEvents.push({ icon: '🌋', label: 'Cráter Vitrificado' });
  }
  if (lowerAll.includes('ultra instinto') && (hasFighterSkill('ultra instinto') || lowerAll.includes('**ultra instinto**'))) {
    criticalEvents.push({ icon: '✨', label: 'Ultra Instinto Activo' });
  }
  if (lowerAll.includes('ultra ego') && (hasFighterSkill('ultra ego') || lowerAll.includes('**ultra ego**'))) {
    criticalEvents.push({ icon: '💜', label: 'Ultra Ego Activo' });
  }
  if (lowerAll.includes('kaioken') || lowerAll.includes('kaiō-ken')) {
    if (hasFighterSkill('kaioken') || hasFighterSkill('kaiō-ken')) {
      criticalEvents.push({ icon: '🔴', label: 'Kaiō-ken Activo' });
    }
  }
  if (lowerAll.includes('black flash') || lowerAll.includes('destello negro')) {
    if (hasFighterSkill('black flash') || hasFighterSkill('destello')) {
      criticalEvents.push({ icon: '⚡', label: 'Black Flash — Destello Negro' });
    }
  }

  // Squad stats individualizados para modos Raid Boss, Equipos, Minions y Battle Royale
  const squadStats = [];
  const squadStatsA = [];
  const matchMode = simulationData?.matchMode || '1v1';

  // Helper para extraer biometría individual de un combatiente desde el texto
  const extractIndividualBiometrics = (member, fallbackHp, fallbackStm, chunkSource, fullSource, idx = 0) => {
    const memTokens = getNameTokens(member, member?.name || 'miembro');
    let memHp = fallbackHp;
    let memStm = fallbackStm;
    let found = false;

    // 0. Comprobación prioritaria de Anulación Manual (Clics de usuario)
    if (manualOverrides && (manualOverrides[member?.id] !== undefined || manualOverrides[member?.name] !== undefined)) {
      const val = manualOverrides[member?.id] !== undefined ? manualOverrides[member?.id] : manualOverrides[member?.name];
      return {
        hp: val,
        stm: val === 0 ? 0 : 25
      };
    }

    // 1. Búsqueda prioritaria de formato de lista estructurada: - **Son Gohan**: 12% HP | 5% STM | Vivo-Crítico
    for (const token of memTokens) {
      if (token.length < 3) continue;

      // Formato markdown de bloque de lista: - **Tagoma**: 0% HP | 0% STM o - Tagoma: 15% HP / 5% STM
      const regList = new RegExp(`(?:^|\\n)[•\\-\\*\\d\\.\\s]*\\*?\\*?[^\\n]*?${token}[^\\n]*?\\*?\\*?\\s*:\\s*(?:[A-ZÁÉÍÓÚÑa-záéíóúñ\\s\\(\\)\\-]+)?(\\d+)%?\\s*HP\\s*(?:[\\|\\/\\,]\\s*(\\d+)%?\\s*STM)?`, 'i');
      const mList = chunkSource.match(regList) || fullSource.match(regList);
      if (mList) {
        memHp = parseInt(mList[1], 10);
        memStm = mList[2] ? parseInt(mList[2], 10) : Math.max(0, Math.round(memHp * 0.6));
        found = true;
        break;
      }

      // Formato paréntesis: ▹ Son Goku: VIVO (15% HP / 2% STM) o Yamcha (22% HP / 15% STM)
      const regDetailed = new RegExp(`${token}[^\\n\\r]{0,90}?\\((\\d+)%?\\s*HP(?:\\s*[\\/\\|]\\s*(\\d+)%?\\s*STM)?\\)`, 'i');
      const m1 = chunkSource.match(regDetailed) || fullSource.match(regDetailed);
      if (m1) {
        memHp = parseInt(m1[1], 10);
        memStm = m1[2] ? parseInt(m1[2], 10) : Math.max(0, Math.round(memHp * 0.7));
        found = true;
        break;
      }

      // Formato de retirada o supervivencia crítica explícita: "Freezer (Retirada / Vivo-Crítico 8% HP)"
      const regRetreat = new RegExp(`${token}[^\\n\\r]{0,80}?\\b(?:RETIRAD[OA]|ESCAPA|SUPERVIVIENTE|VIVO-CR[IÍ]TICO)\\b[^\\n\\r]{0,30}?(\\d+)%?\\s*HP`, 'i');
      const mRetreat = chunkSource.match(regRetreat) || fullSource.match(regRetreat);
      if (mRetreat) {
        memHp = parseInt(mRetreat[1], 10);
        memStm = Math.max(0, Math.min(10, Math.round(memHp * 0.4)));
        found = true;
        break;
      }

      // Formato muerte confirmada: ▹ Chaos: MUERTO (0% HP) o Fallecido
      const regDead = new RegExp(`${token}[^\\n\\r]{0,60}?\\b(?:MUERTO|FALLECIDO|DESINTEGRADO|BORRADO EXISTENCIAL)\\b[^\\n\\r]{0,30}?\\(?0%?\\s*HP\\)?`, 'i');
      if (regDead.test(chunkSource) || regDead.test(fullSource)) {
        memHp = 0;
        memStm = 0;
        found = true;
        break;
      }
    }

    // 2. Si no hay número explícito en el texto, estimar con seguridad
    if (!found) {
      const isAlive = hasSurvival(memTokens, chunkSource) || (activeTab === 'all' && hasSurvival(memTokens, fullSource));
      const isDead = !isAlive && (hasFatality(memTokens, chunkSource) || (activeTab === 'all' && hasFatality(memTokens, fullSource)));

      if (isDead) {
        memHp = 0;
        memStm = 0;
      } else if (isAlive) {
        memHp = Math.max(18, Math.min(90, Math.max(fallbackHp, 25) + (idx % 8)));
        memStm = Math.max(10, Math.min(70, Math.max(fallbackStm, 15)));
      } else if (hasExtremeIncapacity(memTokens, chunkSource) || hasExtremeIncapacity(memTokens, fullSource)) {
        memHp = Math.max(6, Math.min(22, Math.round((fallbackHp || 30) * 0.35) + (idx % 6)));
        memStm = Math.max(0, Math.min(12, Math.round((fallbackStm || 20) * 0.2)));
      } else {
        const baseHp = fallbackHp > 0 ? fallbackHp : 25;
        const baseStm = fallbackStm > 0 ? fallbackStm : 15;
        const variation = ((member?.name?.charCodeAt(0) || 10) + idx * 7) % 15 - 7;
        memHp = Math.max(8, Math.min(100, baseHp + variation));
        memStm = Math.max(4, Math.min(100, baseStm + variation));
      }
    }

    return {
      hp: Math.max(0, Math.min(100, memHp)),
      stm: Math.max(0, Math.min(100, memStm))
    };
  };

  const activeTextSource = typeof activeTab === 'number' && phases[activeTab] 
    ? phases[activeTab].content 
    : text;

  if (matchMode === '1vN' || matchMode === 'teams' || matchMode === 'battle_royale') {
    const teamBList = matchMode === '1vN' || matchMode === 'teams' 
      ? (simulationData?.teamB || []) 
      : (simulationData?.battleRoyale || []);

    teamBList.forEach((member, mIdx) => {
      const { hp, stm } = extractIndividualBiometrics(member, finalHpB, finalStmB, activeTextSource, text, mIdx);
      squadStats.push({
        id: member.id || `member-b-${mIdx}`,
        name: member.name,
        hp,
        stm
      });
    });

    // Soporte para aliados / minions del Boss en Bando A
    const teamAList = simulationData?.bossMinions && simulationData.bossMinions.length > 0
      ? [simulationData?.charA, ...simulationData.bossMinions].filter(Boolean)
      : (matchMode === 'teams' && simulationData?.teamA && simulationData.teamA.length > 1 ? simulationData.teamA : []);

    if (teamAList.length > 1) {
      teamAList.forEach((member, mIdx) => {
        const { hp, stm } = extractIndividualBiometrics(member, finalHpA, finalStmA, activeTextSource, text, mIdx);
        squadStatsA.push({
          id: member.id || `member-a-${mIdx}`,
          name: member.name,
          hp,
          stm
        });
      });
    }
  }

  return { phases, hpA: finalHpA, stmA: finalStmA, hpB: finalHpB, stmB: finalStmB, squadStats, squadStatsA, verdictInfo, criticalEvents };
};

export default function SimulationViewer({ 
  simulationResult, 
  isSimulating, 
  progress, 
  onStartSimulation, 
  onContinueSimulation, 
  onLoadHistoryBattle,
  onClearSimulation,
  onContinueTimeline,
  simulationData,
  oracleCoins: propOracleCoins,
  setOracleCoins: propSetOracleCoins,
  lang = 'es',
  isVip = false,
  onOpenDevolutionArcade
}) {
  const [viewArena2D, setViewArena2D] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedToVault, setSavedToVault] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isImpactActive, setIsImpactActive] = useState(false);
  const [activePhaseTab, setActivePhaseTab] = useState('all'); // 'all' | phase index
  const [autoScroll, setAutoScroll] = useState(false); // Default to false so user can read freely without being dragged
  const [nextActionPrompt, setNextActionPrompt] = useState('');
  const [rpgDecisionsEnabled, setRpgDecisionsEnabled] = useState(true);
  const [manualHpOverrides, setManualHpOverrides] = useState({});

  const toggleFighterHpStatus = (idOrName, currentHp) => {
    setManualHpOverrides(prev => ({
      ...prev,
      [idOrName]: currentHp === 0 ? 35 : 0
    }));
  };
  const [comicMode, setComicMode] = useState(false);
  const [isPlayingAutoplay, setIsPlayingAutoplay] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [phaseIllustrations, setPhaseIllustrations] = useState({});
  const [generatingPhaseArt, setGeneratingPhaseArt] = useState({});
  const [customWhatIfText, setCustomWhatIfText] = useState('');

  const [battleArtwork, setBattleArtwork] = useState('');
  const [isGeneratingArtwork, setIsGeneratingArtwork] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showBeamStruggle, setShowBeamStruggle] = useState(false);
  const [showScriptExporter, setShowScriptExporter] = useState(false);
  const [showAnatomyMatrix, setShowAnatomyMatrix] = useState(false);
  const [isGeneratingAltEnding, setIsGeneratingAltEnding] = useState(false);
  const [showAltEndingModal, setShowAltEndingModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedTimelineFighterIds, setSelectedTimelineFighterIds] = useState([]);
  const [targetTimelineMode, setTargetTimelineMode] = useState('team'); // 'team' | '1v1' | 'raid' | 'battle_royale'
  const [targetTimelineSquad, setTargetTimelineSquad] = useState('A'); // 'A' | 'B' | 'boss'
  const [selectedArtStyle, setSelectedArtStyle] = useState('anime');
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');
  const [galleryArtworks, setGalleryArtworksRaw] = useState(() => {
    try { return JSON.parse(localStorage.getItem('apex_gallery_artworks') || '[]'); } catch { return []; }
  });

  const setGalleryArtworks = (updater) => {
    setGalleryArtworksRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('apex_gallery_artworks', JSON.stringify(next.slice(0, 30))); } catch {}
      return next;
    });
  };
  const [rpgChoices, setRpgChoices] = useState([
    { letter: '🅰️', color: 'red', label: 'Sobrecarga de Ataque / Forzar Límite', prompt: 'El personaje arriesga su integridad física canalizando toda su energía en un asalto frontal implacable para quebrar la guardia rival a costa de retroceso.' },
    { letter: '🅱️', color: 'blue', label: 'Replegarse al Entorno / Maniobra Táctica', prompt: 'Se repliega hacia los puntos ciegos y escombros del escenario, usando el magma/gravedad del mapa para ganar tiempo y recomponer su postura.' },
    { letter: '🅲', color: 'purple', label: 'Contramedida Hax / Técnica Secreta', prompt: 'Prepara en secreto su habilidad pasiva o técnica definitiva más peligrosa a distancia cero como contraataque definitivo.' },
    { letter: '🅳', color: 'amber', label: 'Despertar de Emergencia / Transformación de Crisis', prompt: 'Al borde de la derrota, libera una nueva forma latente, Zenkai o evolución reactiva que re-escala el combate.' },
    { letter: '🅴', color: 'emerald', label: 'Alianza / Refuerzo Aliado', prompt: 'Un aliado entra al campo de batalla para inclinar la balanza: cobertura, curación, fusión o distracción táctica.' },
    { letter: '🅵', color: 'pink', label: 'Manipulación del Escenario', prompt: 'Usa el entorno a su favor: gravedad, clima, terreno, estructuras colapsables o campos de energía para ganar ventaja posicional.' },
    { letter: '🅶', color: 'cyan', label: 'Arma o Artefacto Oculto', prompt: 'Desempolva un artefacto, arma, reliquia o equipo especial guardado en reserva con un efecto decisivo pero de uso limitado.' },
    { letter: '🅷', color: 'lime', label: 'Sacrificio / Autodestrucción Controlada', prompt: 'Paga un coste extremo (miembro, vida, memoria, alianza) por un estallido de poder que cambia el rumbo de la pelea.' }
  ]);

  // 🎭 Giros argumentales libres para el Modo Libro-Juego (continuación creativa)
  const [plotTwists, setPlotTwists] = useState([
    { letter: '1', color: 'orange', label: 'Intervención Divina / Deidad', prompt: 'Un ser superior (dios, ángel, entidad cósmica) observa o interfiere, alterando las reglas del combate o del escenario.' },
    { letter: '2', color: 'rose', label: 'Traición Inesperada', prompt: 'Un aliado cambia de bando, o un enemigo se revela como algo distinto de lo que parecía.' },
    { letter: '3', color: 'sky', label: 'Cláusula de Realidad Alterada', prompt: 'El escenario cambia bruscamente: otra dimensión, salto temporal, gravedad extrema o distorsión del espacio.' },
    { letter: '4', color: 'violet', label: 'Despertar de una Antigua Amenaza', prompt: 'Un ser dormido, un sello roto o una entidad ancestral se manifiesta en medio del combate.' },
    { letter: '5', color: 'stone', label: 'Regla del Torneo / Arbitraje', prompt: 'Un árbitro, juez o autoridad impone una regla nueva, pausa el combate o declara una condición de victoria alterada.' },
    { letter: '6', color: 'teal', label: 'Flashback / Recuerdo Poderoso', prompt: 'Un recuerdo del pasado despierta una técnica, un poder latente o una motivación que re-energiza al luchador.' },
    { letter: '7', color: 'slate', label: 'Refuerzo del Multiverso', prompt: 'Otra versión del luchador (o un aliado de otra línea temporal) cruza para unirse al conflicto.' }
  ]);

  const generateUniversalCombatArt = async (promptSubject, style = 'anime') => {
    // 1. Intentar endpoint local / servidor si está disponible
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/image/battle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charAName: simulationData?.charA?.name || 'Luchador A',
          charBName: simulationData?.charB?.name || 'Luchador B',
          scenarioName: `${simulationData?.scenario?.name || 'Arena'} - ${promptSubject}`,
          style
        })
      });
      const data = await res.json();
      if (data.imageUrl) return data.imageUrl;
    } catch (e) {
      // Fallback universal
    }

    // 2. Generador Directo Pollinations Flux (Funciona al 100% en Vercel y red local sin puertos)
    const stylePrompts = {
      anime: 'epic shonen anime battle clash, glowing ki energy aura, dynamic cinematic angle, 8k resolution, ufotable studio quality',
      manga: 'dark manga panel, high contrast black and white with golden glowing ki aura, ultra detailed action linework, shonen jump cover art',
      cyberpunk: 'cyberpunk neon illuminated titan clash, volumetric light, dark futuristic arena, unreal engine 5 render',
      grimdark: 'berserk dark fantasy style, blood splatters, raw brutal anatomical clash, heavy ink shading'
    };

    const styleText = stylePrompts[style] || stylePrompts.anime;
    const fullPrompt = `${simulationData?.charA?.name || 'Hero'} vs ${simulationData?.charB?.name || 'Villain'}, ${promptSubject}, ${simulationData?.scenario?.name || 'Cosmic Battlefield'}, ${styleText}`;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=576&seed=${Math.floor(Math.random() * 999999)}&nologo=true&enhance=true&model=flux`;
  };

  const handleGenerateBattleArt = async () => {
    setIsGeneratingArtwork(true);
    try {
      const imgUrl = await generateUniversalCombatArt('Colisión Máxima de Poder & Clímax Definitivo', selectedArtStyle);
      setBattleArtwork(imgUrl);
      setGalleryArtworks(prev => [{ id: Date.now(), url: imgUrl, title: 'Cartel de Batalla Oficial', style: selectedArtStyle }, ...prev]);
    } catch (err) {
      alert('Error generando ilustración de combate: ' + err.message);
    } finally {
      setIsGeneratingArtwork(false);
    }
  };

  const handleGeneratePhaseArt = async (phaseIdx, phaseTitle) => {
    setGeneratingPhaseArt(prev => ({ ...prev, [phaseIdx]: true }));
    try {
      const imgUrl = await generateUniversalCombatArt(phaseTitle, selectedArtStyle);
      setPhaseIllustrations(prev => ({ ...prev, [phaseIdx]: imgUrl }));
      setGalleryArtworks(prev => [{ id: Date.now(), url: imgUrl, title: `Viñeta: ${phaseTitle}`, style: selectedArtStyle }, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingPhaseArt(prev => ({ ...prev, [phaseIdx]: false }));
    }
  };

  const handleUploadCustomArt = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (typeof base64 === 'string') {
        setBattleArtwork(base64);
        setGalleryArtworks(prev => [{ id: Date.now(), url: base64, title: 'Ilustración Subida por el Usuario', style: 'custom' }, ...prev]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomUrl = () => {
    const url = (customImageUrlInput || '').trim();
    if (!url) return;
    // Validación anti-XSS: solo protocolos de imagen seguros (https/http)
    if (!/^https?:\/\//i.test(url)) {
      alert('Solo se permiten URLs de imagen válidas (https://...)');
      return;
    }
    setBattleArtwork(url);
    setGalleryArtworks(prev => [{ id: Date.now(), url, title: 'Arte Enlazado por URL', style: 'url' }, ...prev]);
    setCustomImageUrlInput('');
  };

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMBAT_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const outputEndRef = useRef(null);

  const [soundEnabled, setSoundEnabled] = useState(SoundFX.enabled);
  const [showOracleBet, setShowOracleBet] = useState(false);
  const [localOracleCoins, setLocalOracleCoins] = useState(() => {
    try {
      const c = localStorage.getItem(STORAGE_KEY_ORACLE_COINS);
      return c ? parseInt(c, 10) : 1000;
    } catch {
      return 1000;
    }
  });

  const oracleCoins = propOracleCoins !== undefined ? propOracleCoins : localOracleCoins;
  const setOracleCoins = propSetOracleCoins || setLocalOracleCoins;
  const [currentBet, setCurrentBet] = useState({
    winner: 'A',
    phase: 'climax',
    blackSwan: 'yes',
    amount: 100,
    placed: false,
    evaluated: false,
    winMsg: ''
  });

  const handlePlaceBet = () => {
    if (currentBet.amount > oracleCoins) {
      return alert('No tienes suficientes Monedas del Oráculo.');
    }
    const newBalance = oracleCoins - currentBet.amount;
    setOracleCoins(newBalance);
    localStorage.setItem(STORAGE_KEY_ORACLE_COINS, newBalance.toString());
    setCurrentBet(prev => ({ ...prev, placed: true, evaluated: false, winMsg: '' }));
    if (soundEnabled) SoundFX.playClick?.();
  };

  const rawOutput = simulationResult?.fullOutput || '';
  const fullOutput = translateCombatChronicle(rawOutput, lang);
  const hasOutput = fullOutput.trim().length > 0;
  
  // Memoización: parseSimulation ejecuta ~51 regex sobre texto largo. Solo se
  // recalcula cuando cambian sus entradas reales (antes corría en CADA render).
  const { phases, hpA, stmA, hpB, stmB, squadStats, squadStatsA, verdictInfo, criticalEvents } = useMemo(
    () => parseSimulation(fullOutput, simulationData, activePhaseTab, manualHpOverrides),
    [fullOutput, simulationData, activePhaseTab, manualHpOverrides]
  );

  // Evaluate Oracle Bets when battle completes
  useEffect(() => {
    if (!isSimulating && hasOutput && currentBet.placed && !currentBet.evaluated) {
      let winnerGuessed = false;
      if (verdictInfo?.winner) {
        const winnerLower = verdictInfo.winner.toLowerCase();
        if (simulationData?.matchMode === 'battle_royale') {
          if (winnerLower.includes(currentBet.winner.toLowerCase())) {
            winnerGuessed = true;
          }
        } else {
          const rawTokensA = (simulationData?.charA?.name || 'alfa').toLowerCase().split(/[\s\(\)]+/).filter(t => t.length > 2);
          const rawTokensB = (simulationData?.charB?.name || 'beta').toLowerCase().split(/[\s\(\)]+/).filter(t => t.length > 2);
          const aMatches = rawTokensA.some(t => winnerLower.includes(t)) || winnerLower.includes('alfa') || winnerLower.includes('boss');
          const bMatches = rawTokensB.some(t => winnerLower.includes(t)) || winnerLower.includes('beta') || winnerLower.includes('asaltante') || winnerLower.includes('escuadra');
          if (currentBet.winner === 'A' && aMatches) winnerGuessed = true;
          if (currentBet.winner === 'B' && bMatches) winnerGuessed = true;
        }
      }

      // Cuota dinámica según el poder real de cada bando (antes payout fijo x2.2)
      const { oddsA, oddsB } = computeFightOdds(simulationData?.charA, simulationData?.charB);
      let multiplier = winnerGuessed ? (currentBet.winner === 'A' ? oddsA : currentBet.winner === 'B' ? oddsB : 2.2) : 0;
      if (currentBet.blackSwan === 'yes' && fullOutput.toLowerCase().includes('cisne negro')) {
        multiplier += 0.5;
      }

      if (multiplier > 0) {
        const reward = Math.round(currentBet.amount * multiplier);
        const newTotal = oracleCoins + reward;
        setOracleCoins(newTotal);
        localStorage.setItem(STORAGE_KEY_ORACLE_COINS, newTotal.toString());
        setCurrentBet(prev => ({
          ...prev,
          evaluated: true,
          winMsg: `🎉 ¡PROFECÍA ACERTADA! Has ganado +${reward} Monedas del Oráculo.`
        }));
        if (soundEnabled) SoundFX.playBetWin();
      } else {
        setCurrentBet(prev => ({
          ...prev,
          evaluated: true,
          winMsg: `💀 El destino fue impredecible. Perdiste las ${currentBet.amount} Monedas apostadas.`
        }));
      }
    }
  }, [isSimulating, hasOutput, currentBet, oracleCoins, simulationData, soundEnabled, verdictInfo]);

  // Autoplay Spectator Mode Effect (Avanza de fase automáticamente con sonido y enfoque)
  useEffect(() => {
    let timer;
    if (isPlayingAutoplay && phases.length > 1) {
      timer = setInterval(() => {
        setActivePhaseTab(prev => {
          if (prev === 'all' || prev >= phases.length - 1) {
            setIsPlayingAutoplay(false);
            return 'all';
          }
          const next = typeof prev === 'number' ? prev + 1 : 0;
          if (soundEnabled) SoundFX.playCriticalHit?.();
          return next;
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlayingAutoplay, phases.length, soundEnabled]);

  // Atajos de teclado: Espacio = play/pausa espectador · 1-9 = saltar a fase · Esc = cerrar modal
  useEffect(() => {
    const onKeyDown = (e) => {
      // Ignorar si el usuario está escribiendo en un input/textarea/select
      const tag = (e.target?.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select', 'button'].includes(tag) || e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.code === 'Space' && hasOutput && phases.length > 1) {
        e.preventDefault();
        setIsPlayingAutoplay(prev => !prev);
        return;
      }
      if (e.key >= '1' && e.key <= '9' && phases.length > 1) {
        const target = Number(e.key) - 1;
        if (target < phases.length) {
          setActivePhaseTab(target);
        }
        return;
      }
      if (e.key === 'Escape' && activePhaseTab !== 'all') {
        setActivePhaseTab('all');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hasOutput, phases.length, activePhaseTab]);

  // Auto-scroll to bottom of timeline ONLY if user explicitly enabled it
  useEffect(() => {
    if (outputEndRef.current && isSimulating && autoScroll && activePhaseTab === 'all') {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [fullOutput, isSimulating, activePhaseTab, autoScroll]);

  // Critical Impact Pulse Detection & Sound SFX
  useEffect(() => {
    if (!isSimulating || !fullOutput) return;
    const recentChunk = fullOutput.slice(-90).toUpperCase();
    const criticalWords = ['IMPACTO CRÍTICO', 'DESMEMBRACIÓN', 'EXPLOSIÓN', 'FATAL', 'CLÍMAX', '★ ULTIMATE', 'DESGARRO', 'K.O.', 'VEREDICTO', 'BIG BOOM', 'KRRRAAAACCCCKKKK'];
    if (criticalWords.some(w => recentChunk.includes(w))) {
      setIsImpactActive(true);
      if (soundEnabled) SoundFX.playCriticalHit();
      const timer = setTimeout(() => setIsImpactActive(false), 700);
      return () => clearTimeout(timer);
    }
  }, [fullOutput, isSimulating, soundEnabled]);

  const matchMode = simulationData?.matchMode || '1v1';

  const getSideAName = () => {
    if (matchMode === '1vN') {
      const minionsCount = simulationData?.bossMinions?.length || 0;
      return `${simulationData?.charA?.name || 'Jefe Supremo'} ${minionsCount > 0 ? `(+${minionsCount} Aliados)` : '(Raid Boss)'}`;
    }
    if (matchMode === 'teams') {
      return `Equipo Alfa (${simulationData?.teamA?.length || 2} Guerreros)`;
    }
    if (matchMode === 'battle_royale') {
      return `Battle Royale (${simulationData?.battleRoyale?.length || 4} Luchadores)`;
    }
    return simulationData?.charA?.name || 'Luchador 1';
  };

  const getSideBName = () => {
    if (matchMode === '1vN') {
      return `Escuadrón Asaltante (${simulationData?.teamB?.length || 1} Guerreros)`;
    }
    if (matchMode === 'teams') {
      return `Equipo Beta (${simulationData?.teamB?.length || 2} Guerreros)`;
    }
    if (matchMode === 'battle_royale') {
      return 'Todos contra Todos';
    }
    return simulationData?.charB?.name || 'Luchador 2';
  };

  const nameA = getSideAName();
  const nameB = getSideBName();

  // Auto-save completed simulation to local history
  useEffect(() => {
    if (!isSimulating && hasOutput && simulationData) {
      const entry = {
        id: `fight-${Date.now()}`,
        date: new Date().toLocaleString(),
        charA: nameA,
        charB: nameB,
        matchMode: simulationData.matchMode || '1v1',
        scenario: simulationData.scenario?.name || 'Arena Estándar',
        narrative: fullOutput.replace(/\|\|BIOMETRICS\|[^|]+\|\|/g, ''),
        hpA,
        hpB
      };

      setHistory(prev => {
        const list = Array.isArray(prev) ? prev : [];
        if (list.length > 0 && list[0] && list[0].narrative === entry.narrative) return list;
        
        const favorites = list.filter(h => h && h.isFavorite);
        const normal = list.filter(h => h && !h.isFavorite);
        
        // Mantener infinitos favoritos, y hasta 40 normales
        const updatedNormal = [entry, ...normal].slice(0, 40);
        
        const updated = [...favorites, ...updatedNormal].sort((a, b) => {
          const idA = (a?.id || '').split('-')[1] || 0;
          const idB = (b?.id || '').split('-')[1] || 0;
          return idB - idA;
        });
        
        try {
          localStorage.setItem(STORAGE_KEY_COMBAT_HISTORY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    }
  }, [isSimulating, hasOutput, nameA, nameB]);

    const [copiedSnapshot, setCopiedSnapshot] = useState(false);
  const [savedCampaign, setSavedCampaign] = useState(false);

  const handleCopySnapshot = () => {
    const snapshotObj = {
      simulationId: `sim-v2-${Date.now()}`,
      createdAt: new Date().toISOString(),
      engineVersion: "2.0.0",
      rosterVersion: "V26",
      randomSeed: simulationData?.seed || Math.floor(Math.random() * 1000000),
      scenario: simulationData?.scenario || {},
      matchMode: simulationData?.matchMode || "1v1",
      participants: [
        { name: nameA, tier: simulationData?.charA?.tier, form: simulationData?.charA?.selectedFormName || 'Base' },
        { name: nameB, tier: simulationData?.charB?.tier, form: simulationData?.charB?.selectedFormName || 'Base' }
      ],
      oracleEvents: simulationData?.modifiers?.blackSwan || [],
      outcomePersistence: "simulation_only"
    };
    navigator.clipboard.writeText(JSON.stringify(snapshotObj, null, 2));
    setCopiedSnapshot(true);
    setTimeout(() => setCopiedSnapshot(false), 2000);
  };

  const handleSaveCampaign = () => {
    try {
      const campaignObj = {
        campaignId: `campaign-${Date.now()}`,
        name: `Campaña: ${nameA} vs ${nameB}`,
        baseRosterVersion: "V26",
        selectedBranch: "alfa",
        participants: [nameA, nameB],
        verdict: verdictInfo?.winner || nameA,
        savedAt: new Date().toISOString(),
        outcomePersistence: "campaign_saved",
        mutatesRoster: false
      };
      const existing = JSON.parse(localStorage.getItem('apex_campaigns') || '[]');
      existing.unshift(campaignObj);
      localStorage.setItem('apex_campaigns', JSON.stringify(existing.slice(0, 50)));
      setSavedCampaign(true);
      setTimeout(() => setSavedCampaign(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = () => {
    if (!fullOutput) return;
    const cleanOutput = fullOutput.replace(/\|\|BIOMETRICS\|[^|]+\|\|/g, '');
    navigator.clipboard.writeText(cleanOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    if (!fullOutput || !simulationData) return;
    const cleanOutput = fullOutput.replace(/\|\|BIOMETRICS\|[^|]+\|\|/g, '');
    const mdContent = `# APEX Batalla: ${nameA} vs ${nameB}\n\n**Modo:** ${simulationData.matchMode || '1v1'}\n**Escenario:** ${simulationData.scenario?.name || 'Arena Estándar'}\n\n${cleanOutput}`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `APEX_Sim_${nameA}_vs_${nameB}.md`.replace(/[\s\(\)\/]+/g, '_');
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveObsidian = async () => {
    if (!simulationResult || !simulationData) return;
    const cleanOutput = fullOutput.replace(/\|\|BIOMETRICS\|[^|]+\|\|/g, '');
    await ObsidianBridge.saveToVault({
      ...simulationData,
      title: `${nameA} vs ${nameB}`,
      narrative: cleanOutput,
      result: simulationResult.result
    });
    setSavedToVault(true);
    setTimeout(() => setSavedToVault(false), 3000);
  };

  const handleToggleFavorite = (id, e) => {
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, isFavorite: !h.isFavorite } : h);
      try {
        localStorage.setItem(STORAGE_KEY_COMBAT_HISTORY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleDeleteHistoryItem = (id, e) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY_COMBAT_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Lista unificada de todos los combatientes activos para matrices y modales
  const allActiveFighters = [];
  if (matchMode === '1v1') {
    if (simulationData?.charA) allActiveFighters.push({ ...simulationData.charA, side: 'A', hp: hpA, stm: stmA });
    if (simulationData?.charB) allActiveFighters.push({ ...simulationData.charB, side: 'B', hp: hpB, stm: stmB });
  } else if (matchMode === '1vN') {
    if (simulationData?.charA) allActiveFighters.push({ ...simulationData.charA, side: 'Boss', hp: squadStatsA?.[0]?.hp ?? hpA, stm: squadStatsA?.[0]?.stm ?? stmA });
    (simulationData?.bossMinions || []).forEach((m, idx) => {
      allActiveFighters.push({ ...m, side: 'Aliado Boss', hp: squadStatsA?.[idx + 1]?.hp ?? hpA, stm: squadStatsA?.[idx + 1]?.stm ?? stmA });
    });
    (simulationData?.teamB || []).forEach((m, idx) => {
      allActiveFighters.push({ ...m, side: 'Asaltante', hp: squadStats?.[idx]?.hp ?? hpB, stm: squadStats?.[idx]?.stm ?? stmB });
    });
  } else if (matchMode === 'teams') {
    (simulationData?.teamA || []).forEach((m, idx) => {
      allActiveFighters.push({ ...m, side: 'Equipo Alfa', hp: squadStatsA?.[idx]?.hp ?? hpA, stm: squadStatsA?.[idx]?.stm ?? stmA });
    });
    (simulationData?.teamB || []).forEach((m, idx) => {
      allActiveFighters.push({ ...m, side: 'Equipo Beta', hp: squadStats?.[idx]?.hp ?? hpB, stm: squadStats?.[idx]?.stm ?? stmB });
    });
  } else if (matchMode === 'battle_royale') {
    (simulationData?.battleRoyale || []).forEach((m, idx) => {
      allActiveFighters.push({ ...m, side: 'Battle Royale', hp: squadStats?.[idx]?.hp ?? hpB, stm: squadStats?.[idx]?.stm ?? stmB });
    });
  }

  const [selectedAnatomyFighterId, setSelectedAnatomyFighterId] = useState('all');

  const visiblePhases = activePhaseTab === 'all' 
    ? phases 
    : phases.filter((_, idx) => idx === activePhaseTab);

  return (
    <div className={`rounded-2xl glass-panel p-6 border shadow-2xl space-y-6 transition-all duration-300 relative overflow-hidden ${
      isImpactActive 
        ? 'border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.7)] scale-[1.01] bg-red-950/10' 
        : 'border-slate-800/80 bg-[#090d16]/95'
    }`}>
      {/* Background Animated Combat Grid Pattern */}
      <div className={`absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none transition-opacity duration-300 ${isImpactActive ? 'opacity-0' : 'opacity-100'}`} />
      
      {/* Red flash overlay on impact */}
      <div className={`absolute inset-0 bg-red-600/10 mix-blend-color-dodge pointer-events-none transition-opacity duration-150 ${isImpactActive ? 'opacity-100' : 'opacity-0'}`} />

      {/* Top Bar / Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            {isImpactActive && <div className="absolute inset-0 bg-red-500 blur-xl opacity-50 rounded-full animate-pulse" />}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-red-600/40 to-amber-600/30 text-red-300 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)] relative z-10">
              <Swords className={`w-5 h-5 ${isImpactActive ? 'animate-[spin_0.3s]' : ''}`} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white font-cinzel tracking-wider drop-shadow-md">
                Mesa de Simulación & Crónica APEX
              </h2>
              {isSimulating && (
                <span className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-red-800 text-white font-bold animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.9)] border border-red-400">
                  <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_5px_white] animate-ping" /> EN VIVO
                </span>
              )}
              {isImpactActive && (
                <span className="text-[11px] font-mono px-3 py-1 rounded bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black uppercase tracking-widest animate-[bounce_0.5s_infinite] shadow-[0_0_20px_rgba(245,158,11,1)] border border-yellow-300">
                  💥 IMPACTO CRÍTICO
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Consola de Combate Táctico y Renderizado Narrativo en 5 Fases
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto md:flex-wrap w-full md:w-auto pb-2 md:pb-0" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              const newVal = !soundEnabled;
              setSoundEnabled(newVal);
              SoundFX.setEnabled(newVal);
              if (newVal) SoundFX.playClick?.();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition cursor-pointer border shadow-md flex-shrink-0 ${
              soundEnabled 
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-bold' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-500'
            }`}
            title="Activar/Desactivar Efectos de Sonido Cinéticos (SFX)"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span>SFX: {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Arena 2D Devolution Toggle */}
          <button
            onClick={() => setViewArena2D(!viewArena2D)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition cursor-pointer border shadow-md flex-shrink-0 ${
              viewArena2D
                ? 'bg-gradient-to-r from-orange-600/30 to-amber-600/30 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)] font-bold'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
            }`}
            title="Alternar Arena Visual 2D Estilo Devolution"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Arena 2D: {viewArena2D ? 'ON' : 'OFF'}</span>
          </button>

          {/* Oracle Predictions & Bets Toggle */}
          <button
            onClick={() => setShowOracleBet(!showOracleBet)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition cursor-pointer border shadow-md flex-shrink-0 ${
              showOracleBet || currentBet.placed
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] font-bold'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
            }`}
            title="Abrir Minijuego de Predicciones del Oráculo de Combate"
          >
            <Coins className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
            <span>🪙 Oráculo ({oracleCoins})</span>
            {currentBet.placed && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-1" />}
          </button>

          {/* Auto-scroll Toggle Button */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition cursor-pointer border shadow-md flex-shrink-0 ${
              autoScroll 
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-bold' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
            title={autoScroll ? 'Desactivar auto-desplazamiento automático' : 'Activar auto-desplazamiento para seguir el texto en vivo'}
          >
            <FastForward className={`w-3.5 h-3.5 ${autoScroll ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <span>Auto-scroll: {autoScroll ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono transition cursor-pointer border border-slate-700/80 shadow-md flex-shrink-0"
            title="Ver combates anteriores"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Historial ({history.length})</span>
          </button>

          {hasOutput && !isSimulating && (
            <button
              onClick={() => {
                if (onClearSimulation) onClearSimulation();
              }}
              title="Limpiar la simulación actual y preparar un nuevo combate"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-300 text-xs font-mono font-bold transition cursor-pointer border border-slate-700 hover:border-red-500/50 shadow flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nueva Batalla</span>
            </button>
          )}

          <button
            onClick={() => onStartSimulation({ fresh: true })}
            disabled={isSimulating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white font-mono font-bold text-xs shadow-lg shadow-red-950/80 transition cursor-pointer disabled:opacity-50 flex-shrink-0"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>PROCESANDO...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{hasOutput ? getTranslation(lang, 'reSimulate') : getTranslation(lang, 'simulateBattle')}</span>
              </>
            )}
          </button>

          {hasOutput && !isSimulating && (
            <>
              <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition cursor-pointer border border-slate-700 shadow flex-shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '✓' : getTranslation(lang, 'copy')}</span>
              </button>
              <button onClick={handleSaveObsidian} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold shadow-lg shadow-purple-950/60 transition cursor-pointer flex-shrink-0">
                {savedToVault ? <Check className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}
                <span>Guardar Obsidian</span>
              </button>
              <button onClick={handleCopySnapshot} title="Copiar snapshot de simulación reproducible (JSON)" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-fuchsia-300 text-xs font-mono transition cursor-pointer border border-fuchsia-900/50 shadow flex-shrink-0">
                {copiedSnapshot ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnapshot ? 'Copiado' : 'Snapshot V2'}</span>
              </button>
              <button onClick={handleSaveCampaign} title="Guardar Línea Alfa como campaña persistente (aislado del Roster V26)" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 text-xs font-mono transition cursor-pointer border border-amber-700/50 shadow flex-shrink-0">
                {savedCampaign ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span>🏛️</span>}
                <span>{savedCampaign ? 'Guardada' : 'Guardar Campaña'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Barra de Herramientas Tácticas, Multimedia & Continuidad (Organizada por Categorías) */}
      {hasOutput && !isSimulating && (
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 shadow-md space-y-2 font-mono text-xs animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5 px-1">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>MÓDULOS TÁCTICOS, MULTIMEDIA & WHAT-IF</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Herramientas Especiales APEX</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Modo Espectador */}
            <button
              onClick={() => {
                if (isPlayingAutoplay) {
                  setIsPlayingAutoplay(false);
                } else {
                  setActivePhaseTab(0);
                  setIsPlayingAutoplay(true);
                  if (soundEnabled) SoundFX.playCriticalHit?.();
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer border shadow-sm ${
                isPlayingAutoplay
                  ? 'bg-red-600/30 border-red-500/80 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.5)] font-bold animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
              }`}
              title="Reproducir choque fase a fase como una película"
            >
              {isPlayingAutoplay ? (
                <>
                  <PauseCircle className="w-3.5 h-3.5 text-red-400" />
                  <span>{getTranslation(lang, 'pauseSpectator')}</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-3.5 h-3.5 text-red-400" />
                  <span>{getTranslation(lang, 'spectatorMode')}</span>
                </>
              )}
            </button>

            {/* Decisiones RPG */}
            <button
              onClick={() => {
                setRpgDecisionsEnabled(true);
                const el = document.getElementById('rpg-decision-board');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-mono font-bold transition cursor-pointer border border-cyan-700/50 shadow-sm"
              title="Ir al panel interactivo de Decisiones Tácticas RPG"
            >
              <FastForward className="w-3.5 h-3.5 text-cyan-400" />
              <span>🎲 Decisiones RPG</span>
            </button>

            {/* Métricas Tácticas */}
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer border shadow-sm ${
                showAnalytics
                  ? 'bg-cyan-500/20 border-cyan-500/70 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
              }`}
              title="Ver desglose táctico de DPS, Hax y Destrucción"
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{getTranslation(lang, 'metrics')}</span>
            </button>

            {/* Modo Cómic */}
            <button
              onClick={() => setComicMode(!comicMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer border shadow-sm ${
                comicMode
                  ? 'bg-orange-500/20 border-orange-500/60 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.3)] font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
              }`}
              title="Activar Modo Cómic Visual"
            >
              <Eye className="w-3.5 h-3.5 text-orange-400" />
              <span>{getTranslation(lang, 'comicMode')}</span>
            </button>

            {/* Galería & Arte */}
            <button
              onClick={() => setShowGallery(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-purple-300 text-xs font-mono transition cursor-pointer border border-purple-800/60 shadow-sm"
              title="Abrir Galería de Imágenes, Subir Ilustraciones y Generar Arte IA"
            >
              <Camera className="w-3.5 h-3.5 text-pink-400" />
              <span>{getTranslation(lang, 'gallery')}</span>
              {galleryArtworks.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-900 text-[10px] font-bold text-purple-200">
                  {galleryArtworks.length}
                </span>
              )}
            </button>

            {/* Poster Rápido */}
            <button
              onClick={handleGenerateBattleArt}
              disabled={isGeneratingArtwork}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono transition cursor-pointer border border-slate-700/80 shadow-sm disabled:opacity-50"
              title="Generar cartel visual rápido con IA"
            >
              {isGeneratingArtwork ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-400" />
                  <span>Pintando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>{getTranslation(lang, 'quickPoster')}</span>
                </>
              )}
            </button>

            {/* Choque de Rayos */}
            <button
              onClick={() => setShowBeamStruggle(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs font-mono transition cursor-pointer border border-amber-700/50 shadow-sm"
              title="Simulador de Choque de Rayos & Técnicas con Física de Joules"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
              <span>⚡ Choque de Rayos</span>
            </button>

            {/* Matriz Anatómica */}
            <button
              onClick={() => setShowAnatomyMatrix(!showAnatomyMatrix)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer border shadow-sm ${
                showAnatomyMatrix
                  ? 'bg-rose-500/20 border-rose-500/70 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.3)] font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
              }`}
              title="Ver Matriz de Daño Óseo, Pulmonar y Flujo de Ki"
            >
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>🩻 Matriz Anatómica</span>
            </button>

            {/* Guión TikTok */}
            <button
              onClick={() => setShowScriptExporter(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-pink-300 text-xs font-mono transition cursor-pointer border border-pink-800/60 shadow-sm"
              title="Exportar Guión para TikTok / YouTube Shorts / Reels"
            >
              <FileText className="w-3.5 h-3.5 text-pink-400" />
              <span>🎬 Guión TikTok</span>
            </button>

            {/* Continuar Línea Temporal */}
            <button
              onClick={() => {
                const defaultSurvivors = allActiveFighters.filter(f => f.hp > 0).map(f => f.id || f.name);
                setSelectedTimelineFighterIds(defaultSurvivors.length > 0 ? defaultSurvivors : allActiveFighters.map(f => f.id || f.name));
                setShowTimelineModal(true);
              }}
              title="Abrir panel de Continuidad de Línea Temporal (Resurrección, Supervivientes y Asignación de Escuadrones)"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 text-xs font-mono font-bold transition cursor-pointer border border-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
            >
              <GitBranch className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>🔮 Continuar Línea Temporal</span>
            </button>

            {/* What-If (Rama) */}
            <button
              onClick={() => setShowAltEndingModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 text-xs font-mono transition cursor-pointer border border-purple-700/50 shadow-sm"
              title="Generar rama divergente / Final Alternativo"
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              <span>🌿 What-If (Rama)</span>
            </button>

            {/* Exportar MD */}
            <button
              onClick={handleDownloadMd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono transition cursor-pointer border border-slate-700/80 shadow-sm"
              title="Descargar combate como Markdown"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>{getTranslation(lang, 'exportMd')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Oracle Betting Widget (Collapsible) */}
      {showOracleBet && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-950/80 border border-amber-500/50 shadow-2xl relative z-10 space-y-3 font-mono text-xs animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Dices className="w-4 h-4 text-yellow-400" />
              <h3 className="font-bold text-amber-300 font-cinzel text-sm">
                Oráculo de Predicciones & Apuestas de Combate
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 font-bold">🪙 Saldo: {oracleCoins} Monedas</span>
            </div>
          </div>

          {currentBet.winMsg && (
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/70 text-amber-200 font-bold text-center">
              {currentBet.winMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Pick Winner */}
            <div className="space-y-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <label className="text-[10px] text-slate-400 font-bold block">
                1. ¿Quién ganará? {simulationData?.charA && simulationData?.charB && (
                  <span className="text-amber-300">
                    (A x{computeFightOdds(simulationData.charA, simulationData.charB).oddsA} · B x{computeFightOdds(simulationData.charA, simulationData.charB).oddsB})
                  </span>
                )}
              </label>
              <select
                name="apuesta_ganador"
                aria-label="Quién ganará la apuesta"
                disabled={currentBet.placed && isSimulating}
                value={currentBet.winner}
                onChange={(e) => setCurrentBet({ ...currentBet, winner: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white font-bold text-xs"
              >
                {matchMode === 'battle_royale' && simulationData?.battleRoyale?.length > 0 ? (
                  simulationData.battleRoyale.map((c, idx) => (
                    <option key={c.id || idx} value={c.name}>⚔️ {c.name}</option>
                  ))
                ) : (
                  <>
                    <option value="A">🔴 {nameA}</option>
                    <option value="B">🔵 {nameB}</option>
                  </>
                )}
              </select>
            </div>

            {/* Cisne Negro */}
            <div className="space-y-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <label className="text-[10px] text-slate-400 font-bold block">2. ¿Cisne Negro? (+x0.8)</label>
              <select
                name="apuesta_cisne_negro"
                aria-label="¿Cisne Negro en la apuesta?"
                disabled={currentBet.placed && isSimulating}
                value={currentBet.blackSwan}
                onChange={(e) => setCurrentBet({ ...currentBet, blackSwan: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white font-bold text-xs"
              >
                <option value="yes">🦢 Sí, habrá un giro inesperado</option>
                <option value="no">🛡️ No, combate lineal</option>
              </select>
            </div>

            {/* Bet Amount */}
            <div className="space-y-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <label className="text-[10px] text-slate-400 font-bold block">3. Cantidad a apostar:</label>
              <div className="flex gap-1">
                {[50, 100, 250, 500].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    disabled={currentBet.placed && isSimulating}
                    onClick={() => setCurrentBet({ ...currentBet, amount: amt })}
                    className={`flex-1 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                      currentBet.amount === amt ? 'bg-amber-500 text-black' : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400">
              {currentBet.placed ? `✅ Apuesta de ${currentBet.amount} monedas fijada.` : 'Selecciona tu pronóstico antes de iniciar la batalla.'}
            </span>
            {!currentBet.placed ? (
              <button
                type="button"
                onClick={handlePlaceBet}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs cursor-pointer shadow-md shadow-amber-950/60"
              >
                🪙 Fijar Apuesta ({currentBet.amount} Monedas)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentBet({ ...currentBet, placed: false, evaluated: false, winMsg: '' })}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
              >
                Cambiar Apuesta
              </button>
            )}
          </div>
        </div>
      )}

      {/* Battle Clash Artwork Banner */}
      {battleArtwork && (
        <div className="relative rounded-2xl overflow-hidden border border-purple-500/50 shadow-2xl group my-2">
          <img
            src={battleArtwork}
            alt="Ilustración del Choque"
            className="w-full max-h-[360px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex items-end p-4 justify-between">
            <div className="space-y-0.5">
              <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 text-[10px] font-mono font-bold border border-purple-700/50">
                ARTE DE BATALLA OMNI-TITÁN
              </span>
              <h4 className="text-sm font-bold text-white font-cinzel">
                {nameA} VS {nameB}
              </h4>
            </div>
            <button
              onClick={() => setBattleArtwork('')}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-slate-400 hover:text-white border border-slate-700 text-xs cursor-pointer"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Cyberpunk HUD: Biometría Dual (HP + Stamina) */}
      {(hasOutput || isSimulating) && (
        <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800/90 shadow-2xl relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Fighter A / Squad A Biometrics */}
            {squadStatsA && squadStatsA.length > 1 ? (
              <div className="flex-1 w-full space-y-2 p-3 rounded-xl bg-gradient-to-r from-red-950/30 via-slate-900/40 to-slate-900/40 border border-red-900/40">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    👑 Bando Boss / Escuadrón A ({squadStatsA.length})
                  </span>
                  <span className="text-[10px] text-amber-300 font-mono font-bold">ALIANZA A</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {squadStatsA.map((member, mIdx) => {
                    const isDead = member.hp === 0;
                    const isCrit = member.hp > 0 && member.hp <= 20;
                    const isWounded = member.hp > 20 && member.hp <= 50;
                    return (
                      <div key={member.id || mIdx} className={`p-2 rounded-lg border transition-all ${
                        isDead ? 'bg-slate-950/80 border-slate-800/80 opacity-60' :
                        isCrit ? 'bg-red-950/30 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.2)]' :
                        'bg-slate-900/60 border-slate-800'
                      }`}>
                        <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                          <span className="text-slate-200 font-bold truncate max-w-[110px]" title={member.name}>{member.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleFighterHpStatus(member.id || member.name, member.hp)}
                            title="Clic para alternar estado de supervivencia (Vivo / Caído)"
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold cursor-pointer transition select-none ${
                              isDead ? 'bg-red-950 text-red-400 border border-red-900 hover:bg-emerald-950 hover:text-emerald-300' :
                              isCrit ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse hover:opacity-80' :
                              isWounded ? 'bg-amber-950 text-amber-300 border border-amber-800 hover:opacity-80' :
                              'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:opacity-80'
                            }`}
                          >
                            {isDead ? '💀 0%' : `${member.hp}%`}
                          </button>
                        </div>
                        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full transition-all duration-700 rounded-full ${
                              isDead ? 'bg-slate-700' : isCrit ? 'bg-red-500' : 'bg-gradient-to-r from-red-600 via-amber-500 to-red-500'
                            }`}
                            style={{ width: `${member.hp}%` }}
                          />
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-0.5 border border-slate-800/50">
                          <div 
                            className="h-full bg-amber-400/80 transition-all duration-700 rounded-full"
                            style={{ width: `${member.stm}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 w-full space-y-2 p-3.5 rounded-xl bg-gradient-to-r from-red-950/30 to-slate-900/40 border border-red-900/40">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse" />
                    <span className="text-sm font-bold text-red-400 uppercase tracking-wider font-cinzel">{nameA}</span>
                  </div>
                  <div className="text-xs font-mono flex items-center gap-3">
                    <span className="text-red-400 font-bold">{hpA}% HP</span>
                    <span className="text-amber-400 font-semibold">{stmA}% STM</span>
                  </div>
                </div>
                
                {/* HP Bar A */}
                <div className="space-y-1">
                  <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-500 transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                      style={{ width: `${hpA}%` }}
                    />
                  </div>
                  {/* Stamina Bar A */}
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
                    <div 
                      className="h-full bg-amber-400 transition-all duration-700 ease-out rounded-full"
                      style={{ width: `${stmA}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* VS Emblem & Battlefield Radar */}
            <div className="flex flex-col items-center justify-center shrink-0 px-2">
              <span className="text-slate-500 font-black text-2xl font-cinzel tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">VS</span>
              <span className="text-[10px] font-mono text-amber-400/90 font-bold max-w-[140px] truncate text-center mt-0.5">
                🏟️ {simulationData?.scenario?.name || 'Arena Estándar'}
              </span>
            </div>

            {/* Fighter B / Squad Biometrics */}
            {squadStats && squadStats.length > 1 ? (
              <div className="flex-1 w-full space-y-2 p-3 rounded-xl bg-gradient-to-l from-emerald-950/30 via-slate-900/40 to-slate-900/40 border border-emerald-900/40">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    ⚔️ Escuadrón Asaltante ({squadStats.length})
                  </span>
                  <span className="text-[10px] text-cyan-300 font-mono font-bold">ALIANZA B</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {squadStats.map((member, mIdx) => {
                    const isDead = member.hp === 0;
                    const isCrit = member.hp > 0 && member.hp <= 20;
                    const isWounded = member.hp > 20 && member.hp <= 50;
                    return (
                      <div key={member.id || mIdx} className={`p-2 rounded-lg border transition-all ${
                        isDead ? 'bg-slate-950/80 border-slate-800/80 opacity-60' :
                        isCrit ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.2)]' :
                        'bg-slate-900/60 border-slate-800'
                      }`}>
                        <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                          <span className="text-slate-200 font-bold truncate max-w-[110px]" title={member.name}>{member.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleFighterHpStatus(member.id || member.name, member.hp)}
                            title="Clic para alternar estado de supervivencia (Vivo / Caído)"
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold cursor-pointer transition select-none ${
                              isDead ? 'bg-red-950 text-red-400 border border-red-900 hover:bg-emerald-950 hover:text-emerald-300' :
                              isCrit ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse hover:opacity-80' :
                              isWounded ? 'bg-amber-950 text-amber-300 border border-amber-800 hover:opacity-80' :
                              'bg-teal-950 text-teal-300 border border-teal-800 hover:opacity-80'
                            }`}
                          >
                            {isDead ? '💀 0%' : `${member.hp}%`}
                          </button>
                        </div>
                        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full transition-all duration-700 rounded-full ${
                              isDead ? 'bg-slate-700' : isCrit ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-600 to-teal-400'
                            }`}
                            style={{ width: `${member.hp}%` }}
                          />
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-0.5 border border-slate-800/50">
                          <div 
                            className="h-full bg-cyan-400/80 transition-all duration-700 rounded-full"
                            style={{ width: `${member.stm}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 w-full space-y-2 p-3.5 rounded-xl bg-gradient-to-l from-blue-950/30 to-slate-900/40 border border-blue-900/40">
                <div className="flex justify-between items-end">
                  <div className="text-xs font-mono flex items-center gap-3">
                    <span className="text-cyan-400 font-semibold">{stmB}% STM</span>
                    <span className="text-blue-400 font-bold">{hpB}% HP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-blue-400 uppercase tracking-wider font-cinzel">{nameB}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] animate-pulse" />
                  </div>
                </div>

                {/* HP Bar B */}
                <div className="space-y-1">
                  <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 flex justify-end">
                    <div 
                      className="h-full bg-gradient-to-l from-blue-600 via-cyan-400 to-blue-500 transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      style={{ width: `${hpB}%` }}
                    />
                  </div>
                  {/* Stamina Bar B */}
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60 flex justify-end">
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-700 ease-out rounded-full"
                      style={{ width: `${stmB}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Visualizador Arena 2D Devolution Style */}
          {viewArena2D && (
            <div className="mb-4 animate-in fade-in duration-300">
              <CombatArenaDevolution2D
                charA={simulationData?.charA}
                charB={simulationData?.charB}
                phase={phases?.[activePhaseTab === 'all' ? 0 : activePhaseTab]?.type || 'tanteo'}
                hpA={hpA}
                hpB={hpB}
                winner={verdictInfo?.winner}
                onOpenArcade={onOpenDevolutionArcade}
              />
            </div>
          )}

          {/* Matriz de Daño Anatómico Modular (Colapsable y Multi-Combatiente) */}
          {showAnatomyMatrix && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-slate-950 to-indigo-950/40 border border-rose-500/40 shadow-xl space-y-3 font-mono text-xs animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2 gap-2">
                <span className="font-bold text-rose-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400" />
                  <span>🩻 MATRIZ DE DAÑO ANATÓMICO & FISIOLOGÍA ({allActiveFighters.length} Guerreros)</span>
                </span>
                <span className="text-[10px] text-slate-400">LECTURA EN TIEMPO REAL</span>
              </div>

              {/* Selector de combatiente si hay más de 2 luchadores */}
              {allActiveFighters.length > 2 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setSelectedAnatomyFighterId('all')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                      selectedAnatomyFighterId === 'all'
                        ? 'bg-rose-600/30 border-rose-500 text-rose-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Todos ({allActiveFighters.length})
                  </button>
                  {allActiveFighters.map((f, idx) => (
                    <button
                      key={f.id || idx}
                      type="button"
                      onClick={() => setSelectedAnatomyFighterId(f.id || f.name)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border whitespace-nowrap ${
                        selectedAnatomyFighterId === (f.id || f.name)
                          ? 'bg-rose-600/40 border-rose-400 text-white shadow-sm'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f.side === 'Boss' ? '👑 ' : f.side === 'Aliado Boss' ? '🛡️ ' : '⚔️ '}
                      {f.name} ({f.hp}%)
                    </button>
                  ))}
                </div>
              )}

              {/* Grid de Fichas Anatómicas de los Guerreros */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {allActiveFighters
                  .filter(f => selectedAnatomyFighterId === 'all' || selectedAnatomyFighterId === (f.id || f.name))
                  .map((f, idx) => {
                    const fHp = f.hp ?? 100;
                    const fStm = f.stm ?? 100;
                    const isSideA = f.side === 'A' || f.side === 'Boss' || f.side === 'Aliado Boss' || f.side === 'Equipo Alfa';

                    return (
                      <div 
                        key={f.id || idx} 
                        className={`p-3 rounded-xl border space-y-2 ${
                          isSideA 
                            ? 'bg-red-950/20 border-red-900/40' 
                            : 'bg-blue-950/20 border-blue-900/40'
                        }`}
                      >
                        <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-xs">{isSideA ? '🔴' : '🔵'}</span>
                            <span className={`font-bold text-[11px] truncate ${isSideA ? 'text-red-300' : 'text-blue-300'}`}>
                              {f.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] shrink-0 font-mono">
                            <span className={isSideA ? 'text-red-400 font-bold' : 'text-blue-400 font-bold'}>{fHp}% HP</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-amber-400">{fStm}% STM</span>
                          </div>
                        </div>

                        <div className="space-y-1 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-slate-400">🧠 Conciencia:</span>
                            <span className={fHp > 50 ? 'text-emerald-400 font-bold' : fHp > 15 ? 'text-amber-400 font-bold' : fHp > 0 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-500 font-bold'}>
                              {fHp > 50 ? 'Lúcido (100%)' : fHp > 15 ? 'Conmoción (45%)' : fHp > 0 ? 'Colapso (10%)' : 'Inconsciente (0%)'}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-400">🫁 Pulmones & Sangre:</span>
                            <span className={fStm > 40 ? 'text-emerald-400 font-bold' : fStm > 15 ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>
                              {fStm > 40 ? 'Ventilación Estable' : fStm > 15 ? 'Jadeo Agudo' : 'Colapso / Hipoxia'}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-400">🦴 Integridad Ósea:</span>
                            <span className={fHp > 60 ? 'text-slate-300' : fHp > 25 ? 'text-amber-400' : fHp > 0 ? 'text-red-400 font-bold' : 'text-slate-500'}>
                              {fHp > 60 ? 'Intacta' : fHp > 25 ? 'Fisuras Menores' : fHp > 0 ? 'Fracturas Múltiples' : 'Trauma Fatal'}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-400">⚡ Canalización de Ki:</span>
                            <span className="text-cyan-300 font-bold">{fStm}% Capacidad</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Connecting Progress Bar */}
      {isSimulating && !hasOutput && (
        <div className="p-5 bg-slate-900/80 border border-amber-500/30 rounded-2xl space-y-3 font-mono text-xs shadow-xl relative z-10">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-2.5 text-amber-300 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>{progress.step || 'Conectando con la IA...'}</span>
            </span>
            <span className="text-amber-400 font-bold">{progress.percent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-purple-600 transition-all duration-300 rounded-full" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      )}

      {/* Phase Filter Tabs (Jump directly to any Phase) */}
      {phases.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs scrollbar-none relative z-10">
          <button
            onClick={() => setActivePhaseTab('all')}
            className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer font-bold ${
              activePhaseTab === 'all' 
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Ver Todas ({phases.length})
          </button>
          {phases.map((p, idx) => {
            const style = getPhaseStyle(p.title);
            const active = activePhaseTab === idx;
            return (
              <button
                key={idx}
                onClick={() => setActivePhaseTab(idx)}
                className={`px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  active 
                    ? `${style.badgeBg} font-bold shadow-md` 
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {style.icon}
                <span>Fase {idx + 1}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Critical Events Panel */}
      {(hasOutput || isSimulating) && (
        <div className="p-3.5 bg-gradient-to-r from-red-950/30 via-purple-950/20 to-slate-900/50 border border-red-900/40 rounded-xl relative z-10 flex flex-wrap gap-2 items-center min-h-[44px]">
          <span className="text-[10px] text-red-400 font-bold font-mono tracking-wider px-2 border-r border-red-900/50 flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            REGISTRO CRÍTICO EN VIVO:
          </span>

          {criticalEvents && criticalEvents.length > 0 ? (
            criticalEvents.map((evt, eIdx) => (
              <span 
                key={eIdx} 
                className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-900/90 border border-red-500/40 text-red-200 flex items-center gap-1 shadow-sm hover:border-red-400 transition"
              >
                <span>{evt.icon}</span>
                <span className="font-semibold">{evt.label}</span>
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-500 font-mono italic">
              Escaneando coreografía en busca de técnicas definitivas y trauma anatómico...
            </span>
          )}
        </div>
      )}

      {/* Victory Card & MVP Banner when battle is concluded */}
      {verdictInfo && !isSimulating && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-yellow-950/60 via-amber-950/40 to-slate-900 border-2 border-yellow-500/60 shadow-[0_0_35px_rgba(234,179,8,0.25)] relative z-10 space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-yellow-500/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-400/50 flex items-center justify-center text-xl shadow-inner">
                  🏆
                </div>
                <div>
                  <span className="text-[10px] text-yellow-400/90 font-bold uppercase tracking-widest block">
                    RESOLUCIÓN CANÓNICA & VEREDICTO APEX
                  </span>
                  <h3 className="text-lg font-bold text-white font-cinzel tracking-wide">
                    VENCEDOR: <span className="text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]">{verdictInfo.winner}</span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-500/60 text-red-300 text-xs font-bold shadow-md">
                  ⚡ {verdictInfo.difficulty}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">🎯 Factor Decisivo / Clave de Victoria:</span>
                <p className="text-slate-200 font-sans text-xs leading-relaxed">{verdictInfo.decisiveText}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">🏟️ Estado Geográfico / Escenario:</span>
                <p className="text-amber-300/90 font-sans text-xs">
                  {simulationData?.scenario?.name || 'Arena Estándar'} · Destrucción Crítica & Colapso Tectónico
                </p>
              </div>
            </div>
          </div>

          {/* Generador de Divergencias What-If Instantáneo */}
          {onContinueSimulation && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/30 border border-purple-500/40 shadow-xl relative z-10 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-purple-900/50 pb-2">
                <div className="flex items-center gap-2">
                  <Split className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    🌌 Generador de Revanchas & Universos Alternativos (What-If):
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">1-Clic Divergencia Multiversal</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => onContinueSimulation(`[WHAT-IF TRANSFORMACIÓN LÍMITE]: ¿Qué habría ocurrido si el perdedor activa en el último segundo su transformación oculta más destructiva o fusión prohibida?`)}
                  className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-purple-950/60 border border-purple-800/60 hover:border-purple-400 text-left text-[11px] text-slate-200 transition cursor-pointer flex flex-col justify-between space-y-1 group"
                >
                  <span className="font-bold text-purple-300 group-hover:text-purple-200">⚡ Despertar Prohibido</span>
                  <span className="text-[9px] text-slate-400">Fusión o Transformación Oculta</span>
                </button>

                <button
                  onClick={() => onContinueSimulation(`[WHAT-IF REVANCHA CON SENZU]: Ambos contendientes se curan inmediatamente al 100% con Senzu Beans y reinician el combate conociendo ya las debilidades del rival.`)}
                  className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/60 border border-emerald-800/60 hover:border-emerald-400 text-left text-[11px] text-slate-200 transition cursor-pointer flex flex-col justify-between space-y-1 group"
                >
                  <span className="font-bold text-emerald-300 group-hover:text-emerald-200">💊 Revancha 100% HP</span>
                  <span className="text-[9px] text-slate-400">Curación Total + Aprendizaje</span>
                </button>

                <button
                  onClick={() => onContinueSimulation(`[WHAT-IF ESCENARIO NULO]: El choque colapsa el espacio-tiempo y la batalla se traslada de inmediato al Reino de la Nada sin gravedad ni oxígeno.`)}
                  className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950/60 border border-cyan-800/60 hover:border-cyan-400 text-left text-[11px] text-slate-200 transition cursor-pointer flex flex-col justify-between space-y-1 group"
                >
                  <span className="font-bold text-cyan-300 group-hover:text-cyan-200">🌌 Reino de la Nada</span>
                  <span className="text-[9px] text-slate-400">Física Cuántica y Vacío Total</span>
                </button>

                <button
                  onClick={() => onContinueSimulation(`[WHAT-IF COLISIÓN OMEGA]: Ambos contendientes liberan simultáneamente sus ataques definitivos a quemarropa sin retroceder, destruyéndose mutuamente.`)}
                  className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-red-950/60 border border-red-800/60 hover:border-red-400 text-left text-[11px] text-slate-200 transition cursor-pointer flex flex-col justify-between space-y-1 group"
                >
                  <span className="font-bold text-red-300 group-hover:text-red-200">💥 Choque Omega</span>
                  <span className="text-[9px] text-slate-400">Doble K.O. / Colapso Total</span>
                </button>
              </div>

              {/* Custom What-If Write-in Prompt */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customWhatIfText}
                  onChange={(e) => setCustomWhatIfText(e.target.value)}
                  placeholder="Escribe tu propia hipótesis What-If (ej: ¿Y si Vegeta interviene con el Big Bang Attack?)..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-purple-500 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customWhatIfText.trim()) {
                      onContinueSimulation(`[WHAT-IF PERSONALIZADO]: ${customWhatIfText.trim()}`);
                      setCustomWhatIfText('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (customWhatIfText.trim()) {
                      onContinueSimulation(`[WHAT-IF PERSONALIZADO]: ${customWhatIfText.trim()}`);
                      setCustomWhatIfText('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
                >
                  Simular What-If
                </button>
              </div>
            </div>
          )}

          {/* Merchandising & Official Figures Card */}
          <MerchBanner 
            charA={simulationData?.charA} 
            charB={(simulationData?.matchMode === 'raid' || simulationData?.matchMode === 'team') && simulationData?.teamB?.length > 0 ? simulationData.teamB[0] : simulationData?.charB} 
            isVip={isVip} 
            lang={lang} 
          />
        </div>
      )}

      {/* Main Narrative Display: Styled Phase Action Cards */}
      {(hasOutput || isSimulating) && (
        <div className={`space-y-5 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar relative z-10 ${comicMode ? 'grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0' : ''}`}>
          {visiblePhases.map((phase, idx) => {
            const style = getPhaseStyle(phase.title);
            const isLast = phase.isLast;
            const hasSceneArt = phaseIllustrations[idx];
            const isArtLoading = generatingPhaseArt[idx];

            return (
              <div 
                key={idx} 
                className={`p-6 rounded-2xl border transition-all duration-300 relative ${
                  comicMode 
                    ? 'bg-[#0a0e17] text-slate-100 border-2 border-amber-500/70 shadow-[0_0_30px_rgba(245,158,11,0.2)] rounded-2xl overflow-hidden hover:border-amber-400'
                    : style.theme
                }`}
              >
                {comicMode && <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:10px_10px] opacity-50 pointer-events-none" />}
                
                {/* Phase Header Badge */}
                <div className={`flex items-center justify-between gap-3 mb-4 pb-3 border-b ${comicMode ? 'border-amber-500/40' : 'border-slate-800/80'} relative z-10`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`p-2 ${comicMode ? 'bg-gradient-to-br from-amber-600 to-red-600 text-white rounded-xl border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : `rounded-xl border ${style.badgeBg}`}`}>
                      {style.icon}
                    </span>
                    <div>
                      <span className={`text-[10px] font-mono uppercase tracking-widest block ${comicMode ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                        {style.label}
                      </span>
                      <h3 className={`text-base font-bold tracking-wider ${comicMode ? 'text-amber-300 font-cinzel font-bold text-lg drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'text-white font-cinzel'}`}>
                        {phase.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botón Ilustrar Viñeta de Fase */}
                    {!isSimulating && (
                      <button
                        onClick={() => handleGeneratePhaseArt(idx, phase.title)}
                        disabled={isArtLoading}
                        className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono transition cursor-pointer flex items-center gap-1 shadow disabled:opacity-50"
                        title="Generar viñeta visual para esta fase"
                      >
                        {isArtLoading ? <RefreshCw className="w-3 h-3 animate-spin text-purple-400" /> : <Camera className="w-3 h-3 text-purple-400" />}
                        <span>{hasSceneArt ? 'Re-pintar' : '📸 Ilustrar'}</span>
                      </button>
                    )}

                    {isSimulating && isLast && (
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold animate-pulse ${
                        comicMode ? 'bg-red-600 text-white rounded-full' : 'rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-ping ${comicMode ? 'bg-white' : 'bg-amber-400'}`} /> Generando...
                      </span>
                    )}
                  </div>
                </div>

                {/* Optional Phase AI Artwork Banner */}
                {hasSceneArt && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-purple-500/40 shadow-lg relative max-h-60">
                    <img src={hasSceneArt} alt={phase.title} className="w-full object-cover object-center max-h-60 hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black via-black/40 to-transparent text-[10px] text-purple-300 font-mono font-bold">
                      📸 Viñeta Oficial: {phase.title}
                    </div>
                  </div>
                )}

                {/* Rich Formatted Narrative Body */}
                <div className="relative z-10">
                  <RichCombatText content={phase.content} isStreamingLast={isSimulating && isLast} comicMode={comicMode} />
                </div>
              </div>
            );
          })}
          {/* Continuation & RPG Decision Board */}
          {hasOutput && !isSimulating && onContinueSimulation && (
            <div 
              id="rpg-decision-board"
              className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-950/50 via-slate-950 to-purple-950/50 border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.25)] space-y-4 font-mono relative z-10 my-4"
            >
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-600/30 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse">
                    <FastForward className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-cyan-300 uppercase tracking-wider font-cinzel">
                      🎲 Modo Libro-Juego Interactivo (Decisiones Tácticas RPG)
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Toma el control del combate: elige la táctica de supervivencia para el siguiente acto o introduce un giro argumental libre.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRpgDecisionsEnabled(!rpgDecisionsEnabled)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition cursor-pointer border ${
                      rpgDecisionsEnabled 
                        ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    Decisiones RPG: {rpgDecisionsEnabled ? 'ACTIVADAS (ON)' : 'APAGADAS (OFF)'}
                  </button>
                </div>
              </div>

              {/* 8 RPG Tactical Choice Cards */}
              {rpgDecisionsEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {(rpgChoices || []).map((choice, cIdx) => {
                    const borderPalette = [
                      'hover:border-red-500/80 hover:from-red-950/40',
                      'hover:border-blue-500/80 hover:from-blue-950/40',
                      'hover:border-purple-500/80 hover:from-purple-950/40',
                      'hover:border-amber-500/80 hover:from-amber-950/40',
                      'hover:border-emerald-500/80 hover:from-emerald-950/40',
                      'hover:border-pink-500/80 hover:from-pink-950/40',
                      'hover:border-cyan-500/80 hover:from-cyan-950/40',
                      'hover:border-lime-500/80 hover:from-lime-950/40'
                    ];
                    const glowPalette = [
                      'text-red-400 group-hover:text-red-300',
                      'text-blue-400 group-hover:text-blue-300',
                      'text-purple-400 group-hover:text-purple-300',
                      'text-amber-400 group-hover:text-amber-300',
                      'text-emerald-400 group-hover:text-emerald-300',
                      'text-pink-400 group-hover:text-pink-300',
                      'text-cyan-400 group-hover:text-cyan-300',
                      'text-lime-400 group-hover:text-lime-300'
                    ];
                    const borderColors = (choice.borderColor ? [choice.borderColor] : borderPalette);
                    const glowColors = (choice.glowColor ? [choice.glowColor] : glowPalette);

                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => onContinueSimulation(choice.prompt)}
                        className={`relative p-3.5 rounded-xl text-left bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-slate-800 ${borderColors[cIdx % borderColors.length]} hover:to-slate-900 transition-all cursor-pointer group shadow-lg transform hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(6,182,212,0.4)] overflow-hidden flex flex-col justify-between min-h-[125px]`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-xs font-black font-cinzel tracking-wide ${glowColors[cIdx % glowColors.length]} drop-shadow`}>
                            {choice.letter} {choice.label}
                          </span>
                        </div>
                        
                        <p className="text-[10.5px] font-mono text-slate-400 leading-snug group-hover:text-slate-200 transition-colors mb-3">
                          {choice.prompt}
                        </p>
                        
                        <div className="flex justify-end">
                          <span className="text-[9.5px] font-bold font-mono text-cyan-300 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-700/80 group-hover:bg-cyan-600 group-hover:text-white transition">
                            SELECCIONAR ▶
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 🎭 Giros Argumentales Libres (Modo Libro-Juego avanzado) */}
              {rpgDecisionsEnabled && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-bold text-fuchsia-400">🎭 Giros Argumentales Libres (para alargar y sorprender):</span>
                    <span className="text-[9px] font-mono text-slate-500">toca uno para continuar con un giro</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {(plotTwists || []).map((twist, tIdx) => (
                      <button
                        key={tIdx}
                        type="button"
                        onClick={() => onContinueSimulation(twist.prompt)}
                        className="p-2.5 rounded-lg text-left bg-slate-900/70 border border-fuchsia-900/40 hover:border-fuchsia-400/70 hover:bg-fuchsia-950/30 transition-all cursor-pointer group"
                      >
                        <div className="text-[10.5px] font-bold text-fuchsia-300 group-hover:text-fuchsia-200 flex items-center gap-1.5">
                          <span>🎲</span>
                          <span>{twist.label}</span>
                        </div>
                        <p className="text-[9.5px] font-mono text-slate-500 group-hover:text-slate-300 mt-1 leading-snug">
                          {twist.prompt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Free Text Input & Custom Next Act */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                
                {/* Desplegable Interactivo de Giros Argumentales & 3er Contendiente */}
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-cyan-900/40 shadow-inner space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px]">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5 text-cyan-400" />
                      <span>💥 Selector Táctico de Intervención / 3er Contendiente:</span>
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>LEY CANÓNICA APEX ACTIVA</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <select
                      className="sm:col-span-8 p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-cyan-400 focus:outline-none transition cursor-pointer"
                      onChange={(e) => {
                        if (e.target.value) {
                          setNextActionPrompt(e.target.value);
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>⚡ Selecciona una intervención táctica o 3er contendiente...</option>
                      <option value="Irrumpe sorpresivamente un 3er contendiente canónico icónico y específico del universo del combate (con nombre oficial completo, ej. Metal Cooler, Broly, Cell Max, Bills, Hit, Freezer, Sukuna, Thor, Doomsday, Thanos) que interrumpe el duelo desatando un choque a tres bandas.">
                        💥 [3er Contendiente] Villano Némesis / Rival Histórico del Universo
                      </option>
                      <option value="Irrumpe un villano némesis canónico legendario con sed de venganza (ej. Metal Cooler / Broly / Sukuna / Thanos / Darkseid) atacando a quemarropa a ambos contendientes.">
                        😈 [Némesis Villano] Asalto Hostil de un Villano Supremo
                      </option>
                      <option value="Un aliado canónico de respaldo o mentor (ej. Vegeta / Piccolo / Gojo / Thor / Superman) interviene en el último milisegundo para rescatar a su compañero y coordinar un contraataque.">
                        🛡️ [Aliado de Respaldo] Intervención Heroica en el Milisegundo Crítico
                      </option>
                      <option value="Aparece un dúo de asalto coordinado (ej. Androides 17 y 18 / Goku Black & Zamasu / Toji & Maki) ejecutando una emboscada 2v1 de alta presión.">
                        👥 [Dúo / Emboscada] Asalto Coordinado de 2 Guerreros
                      </option>
                      <option value="Uno de los luchadores realiza una técnica de fusión de emergencia o metamorfosis prohibida para duplicar su poder a costa de un drenaje crítico de energía.">
                        ⚡ [Fusión de Crisis] Metamorfosis / Unión de Emergencia
                      </option>
                      <option value="Al recibir un impacto letal, un catalizador fisiológico o divino latente despierta una nueva transformación que invierte la balanza de poder.">
                        👑 [Despertar Oculto] Desbloqueo de Nueva Transformación / Forma Latente
                      </option>
                      <option value="El contendiente inferior en estadísticas descifra el patrón de combate y logra copiar, anular o absorber temporalmente el Hax principal de su oponente.">
                        🧬 [Robo de Técnica] Copia o Neutralización Táctica del Hax Rival
                      </option>
                      <option value="El clima y la física del escenario colapsan desatando una lluvia de meteoros cósmicos y tormentas de plasma que golpean a ambos luchadores.">
                        🌧️ [Cataclismo Ambiental] Tormenta de Plasma y Lluvia de Meteoros
                      </option>
                      <option value="Una entidad cósmica suprema o árbitro divino (ej. Whis / Gran Patriarca / Anti-Monitor / Tribunal Viviente) irrumpe imponiendo una alteración de la realidad.">
                        🌌 [Deidad Cósmica] Juicio de una Entidad Multiversal
                      </option>
                      <option value="El terreno de combate colapsa por la densidad del choque y ambos contendientes caen arrastrados a otra dimensión paralela.">
                        🌀 [Colapso Dimensional] Teletransportación a una Arena Hostil
                      </option>
                      <option value="Uno de los combatientes al borde de la derrota ejecuta una técnica kamikaze de auto-destrucción total para llevarse consigo a su rival.">
                        🩸 [Ataque Kamikaze] Sacrificio Final de Auto-Destrucción
                      </option>
                    </select>

                    <div className="sm:col-span-4 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNextActionPrompt("Irrumpe sorpresivamente un 3er contendiente canónico icónico y específico del universo del combate (con nombre oficial completo, ej. Metal Cooler, Broly, Cell Max, Bills, Hit, Freezer, Sukuna, Thor, Doomsday, Thanos) que interrumpe el duelo desatando un choque a tres bandas.")}
                        className="flex-1 py-1 px-2 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 text-[10px] font-bold border border-cyan-700/60 transition flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Autocargar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNextActionPrompt('')}
                        className="py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] border border-slate-700 transition"
                        title="Limpiar texto"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={nextActionPrompt}
                    onChange={(e) => setNextActionPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onContinueSimulation(nextActionPrompt);
                        setNextActionPrompt('');
                      }
                    }}
                    placeholder="Escribe o personaliza la acción (o usa el desplegable de arriba)..."
                    className="flex-1 p-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:border-cyan-400 focus:outline-none transition placeholder:text-slate-600 shadow-inner"
                  />
                  <button
                    onClick={() => {
                      onContinueSimulation("Continúa la pelea y ALÁRGALA: añade más intercambios, más vuelta de tuerca, mayor desgaste y nuevas técnicas. No termines aún. Escala la tensión hacia un clímax aún más lejano e intenso.");
                      setNextActionPrompt('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-red-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-950/80 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-orange-400/50"
                    title="Continúa el combate sin terminarlo, alargando la pelea"
                  >
                    <Flame className="w-4 h-4 text-orange-200" />
                    <span>⏩ Alargar la Pelea</span>
                  </button>
                  <button
                    onClick={() => {
                      // Si el campo está vacío, el motor decide automáticamente (alargar con giro)
                      const action = nextActionPrompt?.trim()
                        ? nextActionPrompt
                        : "Continúa la pelea de forma orgánica: un nuevo giro o intensificación de tu elección (puedes alargarla, cambiar el enfoque táctico, revelar un recurso, o preparar el desenlace si el combate está en su punto álgido). Respeta el modo narrativo seleccionado.";
                      onContinueSimulation(action);
                      setNextActionPrompt('');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/80 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-cyan-400/50"
                  >
                    <FastForward className="w-4 h-4 text-cyan-200" />
                    <span>Siguiente Acto ▶</span>
                  </button>
                </div>
                {/* 💡 Sugerencias rápidas de acción (pulsa para llenar el campo o usar directo) */}
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {[
                    { icon: '⚡', label: 'Alargar más', action: 'Sigue la pelea y alárgala aún más: más intercambios, más desgaste, más técnicas. No termines.' },
                    { icon: '🎭', label: 'Giro sorpresa', action: 'Introduce un giro argumental sorpresa e inesperado que cambie el rumbo del combate de forma dramática.' },
                    { icon: '💥', label: 'Forma superior', action: 'El luchador con desventaja despierta una forma o técnica superior latente para reequilibrar el combate.' },
                    { icon: '🩸', label: 'Herida grave', action: 'Un golpe decisivo causa una herida grave que condiciona el resto de la pelea (limita técnicas o movilidad).' },
                    { icon: '🛡️', label: 'Tregua táctica', action: 'Los luchadores se separan y se evalúan en una pausa tensa, con intercambio de diálogo y nueva estrategia.' },
                    { icon: '🌪️', label: 'Escenario colapsa', action: 'El escenario de combate colapsa o cambia drásticamente (dimensión, gravedad, ambiente) afectando a ambos.' },
                  ].map((sug) => (
                    <button
                      key={sug.label}
                      type="button"
                      onClick={() => {
                        setNextActionPrompt(sug.action);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-cyan-400/60 hover:bg-cyan-950/30 text-[10px] font-mono text-slate-300 hover:text-cyan-200 transition-all cursor-pointer"
                      title="Pulsa para rellenar el campo de acción (o edítalo antes de enviar)"
                    >
                      {sug.icon} {sug.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          <div ref={outputEndRef} />
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div 
          onClick={() => setShowHistory(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-slate-700/80 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.9)] font-mono text-xs animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase font-cinzel tracking-wider">
                  Registro de Combates Guardados
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-amber-400 font-bold" title="Combates guardados automáticamente">
                  {history.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('¿Deseas eliminar todo el historial de combates guardados?')) {
                        setHistory([]);
                        try {
                          localStorage.removeItem(STORAGE_KEY_COMBAT_HISTORY);
                        } catch (e) {}
                      }
                    }}
                    className="p-1.5 px-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-[10px] cursor-pointer flex items-center gap-1 transition"
                    title="Vaciar todo el historial"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Vaciar Todo</span>
                  </button>
                )}
                <button 
                  onClick={() => setShowHistory(false)} 
                  className="p-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer flex items-center gap-1 text-[11px]"
                  title="Cerrar Historial"
                >
                  <X className="w-4 h-4" />
                  <span>CERRAR</span>
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                No hay simulaciones previas guardadas aún.
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                {history.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/40 transition group">
                    <div className="space-y-1 flex-1">
                      <div className="font-bold text-white text-xs flex items-center gap-2">
                        <span className="text-red-400 font-bold">{item.charA}</span>
                        <span className="text-slate-500">vs</span>
                        <span className="text-blue-400 font-bold">{item.charB}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        <span>{item.scenario}</span> • <span>{item.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          if (onLoadHistoryBattle) {
                            onLoadHistoryBattle(item.narrative, item.charA, item.charB, item.scenario);
                          }
                          setShowHistory(false);
                          setActivePhaseTab('all');
                          if (soundEnabled) SoundFX.playClick?.();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold cursor-pointer flex items-center gap-1.5 text-[11px] shadow-md shadow-red-950/50"
                        title="Cargar esta batalla y continuar desde aquí con decisiones RPG"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Continuar Combate</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.narrative);
                          alert('Crónica copiada al portapapeles.');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer flex items-center gap-1 text-[10px]"
                        title="Copiar crónica completa"
                      >
                        <Copy className="w-3 h-3 text-amber-400" />
                        <span>Copiar</span>
                      </button>

                      <button
                        onClick={(e) => handleToggleFavorite(item.id, e)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          item.isFavorite
                            ? 'bg-amber-950/40 border-amber-500/50 text-amber-400 hover:bg-amber-900/60'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                        title={item.isFavorite ? "Quitar de Favoritos (puede borrarse)" : "Guardar en Favoritos (nunca se borrará)"}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 cursor-pointer transition border border-transparent hover:border-red-500/30"
                        title="Eliminar del historial"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                Límite de 40 combates recientes (Favoritos ilimitados)
              </span>
              <button
                onClick={() => setShowHistory(false)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer transition"
              >
                <span>← Volver al Combate Actual</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {showAnalytics && (
        <div 
          onClick={() => setShowAnalytics(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-cyan-500/50 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col space-y-5 shadow-[0_0_50px_rgba(6,182,212,0.3)] font-mono text-xs animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block">TELEMETRÍA FORENSE DE COMBATE</span>
                  <h3 className="text-sm font-bold text-white font-cinzel">
                    Métricas Tácticas, DPS & Trauma Biomecánico
                  </h3>
                </div>
              </div>

              <button 
                onClick={() => setShowAnalytics(false)} 
                className="p-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <X className="w-4 h-4" />
                <span>CERRAR</span>
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1">
              {/* Contendientes Head-to-Head */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] text-red-400 font-bold uppercase block">{nameA}</span>
                  <div className="text-sm font-black text-white">{hpA}% HP · {stmA}% STM</div>
                  <div className="text-[10px] text-slate-400">
                    Estado: {hpA <= 0 ? '☠️ Muerte / Erasión' : hpA <= 15 ? '🩸 Incapacitación Crítica' : hpA <= 50 ? '⚠️ Heridas Graves' : '🟢 Operativo'}
                  </div>
                </div>

                <div className="space-y-1 text-right">
                  <span className="text-[10px] text-blue-400 font-bold uppercase block">{nameB}</span>
                  <div className="text-sm font-black text-white">{hpB}% HP · {stmB}% STM</div>
                  <div className="text-[10px] text-slate-400">
                    Estado: {hpB <= 0 ? '☠️ Muerte / Erasión' : hpB <= 15 ? '🩸 Incapacitación Crítica' : hpB <= 50 ? '⚠️ Heridas Graves' : '🟢 Operativo'}
                  </div>
                </div>
              </div>

              {/* 4 Métricas Clave */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-[11px]">
                    <Flame className="w-4 h-4" />
                    <span>Attack Potency & Destrucción (DPS)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Escala de impacto calculada en <strong>Nivel Universal / Multiversal</strong>. Colisiones de energía capaces de rasgar el tejido dimensional.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-[11px]">
                    <Activity className="w-4 h-4" />
                    <span>Índice de Trauma Anatómico</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Fracturas óseas múltiples, perforación pulmonar unilateral y desgarros miofasciales severos por ondas de choque a quemarropa.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px]">
                    <Zap className="w-4 h-4" />
                    <span>Drenaje de Estamina & Ki</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Gasto energético del <strong>{100 - Math.min(stmA, stmB)}%</strong> en ataques insignia. Colapso de reservas tras la ejecución de los Finishers.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-[11px]">
                    <Compass className="w-4 h-4" />
                    <span>Devastación del Escenario</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Vitrificación de suelo a más de 3000°C en un radio de 20 km. Falla tectónica masiva y alteración del campo gravitatorio local.
                  </p>
                </div>
              </div>

              {/* Registro Crítico Resumen */}
              {criticalEvents && criticalEvents.length > 0 && (
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2">
                  <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider block">
                    Eventos Catastróficos Clave Registrados ({criticalEvents.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {criticalEvents.map((evt, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-red-800/50 text-red-200 text-[10px] flex items-center gap-1">
                        <span>{evt.icon}</span>
                        <span>{evt.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAnalytics(false)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-cyan-950/60"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Galería Visual de Batalla & Arte IA Modal */}
      {showGallery && (
        <div 
          onClick={() => setShowGallery(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-purple-500/50 rounded-2xl p-6 max-w-3xl w-full max-h-[88vh] flex flex-col space-y-4 shadow-[0_0_50px_rgba(168,85,247,0.3)] font-mono text-xs animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block">ESTUDIO VISUAL APEX</span>
                  <h3 className="text-sm font-bold text-white font-cinzel">
                    Galería de Ilustraciones, Arte IA & Escenas
                  </h3>
                </div>
              </div>

              <button 
                onClick={() => setShowGallery(false)} 
                className="p-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer flex items-center gap-1 text-[11px]"
              >
                <X className="w-4 h-4" />
                <span>CERRAR</span>
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Controles de Generación & Subida */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span>Generador de Arte Universal (Pollinations Flux / GPU)</span>
                  </span>
                  {/* Style selector */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {[
                      { id: 'anime', label: 'Anime Shōnen' },
                      { id: 'manga', label: 'Dark Manga' },
                      { id: 'cyberpunk', label: 'Cyberpunk' },
                      { id: 'grimdark', label: 'Grimdark' }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedArtStyle(st.id)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                          selectedArtStyle === st.id
                            ? 'bg-purple-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleGenerateBattleArt}
                    disabled={isGeneratingArtwork}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-950/60 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingArtwork ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Pintando Choque...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>🎨 Generar Cartel de Clímax ({selectedArtStyle})</span>
                      </>
                    )}
                  </button>

                  <label className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer flex items-center gap-1.5 shrink-0">
                    <span>📤 Subir Imagen</span>
                    <input type="file" aria-label="Subir imagen de arte" accept="image/*" onChange={handleUploadCustomArt} className="hidden" />
                  </label>
                </div>

                {/* Paste URL */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    value={customImageUrlInput}
                    onChange={(e) => setCustomImageUrlInput(e.target.value)}
                    placeholder="O pega aquí una URL directa de imagen (https://...)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-purple-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCustomUrl();
                    }}
                  />
                  <button
                    onClick={handleAddCustomUrl}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer border border-slate-700"
                  >
                    Vincular
                  </button>
                </div>
              </div>

              {/* Cartel Activo / Preview Grande */}
              {battleArtwork && (
                <div className="rounded-2xl overflow-hidden border border-purple-500/50 shadow-2xl relative group">
                  <img src={battleArtwork} alt="Cartel de Batalla" className="w-full max-h-72 object-cover object-center" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end p-4 justify-between">
                    <div>
                      <span className="text-[10px] text-purple-300 font-bold uppercase block">CARTEL PRINCIPAL ACTIVO</span>
                      <h4 className="text-sm font-bold text-white font-cinzel">{nameA} VS {nameB}</h4>
                    </div>
                    <a
                      href={battleArtwork}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-black/70 hover:bg-black text-white text-xs border border-slate-700 flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Ver HD</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Grid de Viñetas & Galería de Batalla */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Viñetas de Fases & Arte Generado ({galleryArtworks.length}):
                </span>

                {galleryArtworks.length === 0 && !battleArtwork ? (
                  <div className="py-8 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/80">
                    Aún no has generado ni subido ilustraciones para este combate.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {galleryArtworks.map((art) => (
                      <div key={art.id} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 relative group aspect-video">
                        <img src={art.url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                          <span className="text-[9px] text-slate-200 font-bold truncate">{art.title}</span>
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => setBattleArtwork(art.url)}
                              className="px-2 py-0.5 rounded bg-purple-600 text-white text-[9px] font-bold"
                            >
                              Fijar Cartel
                            </button>
                            <a
                              href={art.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-black/80 text-white text-[9px]"
                            >
                              ↗
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowGallery(false)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-purple-950/60"
              >
                Cerrar Galería
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Final Alternativo / What-If */}
      {showAltEndingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-950 border border-purple-500/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-purple-950/20">
              <h3 className="text-lg font-bold font-cinzel text-purple-300 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-purple-400" />
                Generar Final Alternativo (What-If)
              </h3>
              <button onClick={() => setShowAltEndingModal(false)} className="text-slate-400 hover:text-white transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 font-mono text-xs">
              <p className="text-slate-300">
                Introduce el punto de divergencia exacto que alterará el curso de esta batalla para generar una línea temporal alternativa (Línea Beta).
              </p>
              <textarea
                value={customWhatIfText}
                onChange={(e) => setCustomWhatIfText(e.target.value)}
                placeholder="Ej. ¿Qué hubiera pasado si Vegeta no distraía a Cell? / ¿Qué si Goku acertaba el Ryūken en el núcleo? / ¿Qué si la Semilla Senzu era destruida?"
                className="w-full h-24 bg-slate-900 border border-purple-900/50 rounded-lg p-3 text-purple-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
              <button
                onClick={() => setShowAltEndingModal(false)}
                className="px-4 py-2 rounded-lg font-mono text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!customWhatIfText.trim()) return;
                  setShowAltEndingModal(false);
                  onContinueSimulation(`[DIRECTIVA WHAT-IF / EFECTO MARIPOSA]: Olvida el Veredicto Final anterior. Genera un título tipo "### 🌿 LÍNEA BETA: WHAT-IF" y reescribe la culminación del combate partiendo EXCLUSIVAMENTE de este punto de divergencia radical: "${customWhatIfText.trim()}". Desarrolla esta rama hasta un nuevo desenlace definitivo.`);
                  setCustomWhatIfText('');
                }}
                disabled={!customWhatIfText.trim()}
                className="px-4 py-2 rounded-lg font-mono text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer"
              >
                Generar Rama Temporal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Continuidad Multiversal & Resurrección (What-If Sagas) */}
      {showTimelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-950 border border-indigo-500/60 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_60px_rgba(99,102,241,0.25)] flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-950/60 to-purple-950/40">
              <div className="flex items-center gap-2.5">
                <GitBranch className="w-5 h-5 text-indigo-400 animate-pulse" />
                <div>
                  <h3 className="text-base font-bold font-cinzel text-indigo-200">
                    🔮 Continuar Línea Temporal — Próxima Saga
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Elige qué supervivientes avanzan, resucita caídos con Dragon Balls y asígnalos a cualquier escuadrón.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowTimelineModal(false)} className="text-slate-400 hover:text-white transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 font-mono text-xs overflow-y-auto custom-scrollbar flex-1">
              {/* Selector Rápido */}
              <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-300 font-bold text-[11px]">⚡ Selección Rápida:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const survivorsOnly = allActiveFighters.filter(f => f.hp > 0).map(f => f.id || f.name);
                      setSelectedTimelineFighterIds(survivorsOnly);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold hover:bg-emerald-900 transition cursor-pointer"
                  >
                    🟢 Solo Supervivientes ({allActiveFighters.filter(f => f.hp > 0).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = allActiveFighters.map(f => f.id || f.name);
                      setSelectedTimelineFighterIds(allIds);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-500/50 text-indigo-300 text-[10px] font-bold hover:bg-indigo-900 transition cursor-pointer"
                  >
                    ✨ Revivir a Todos ({allActiveFighters.length})
                  </button>
                </div>
              </div>

              {/* Lista de Combatientes y su Estado */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 block">
                  🛡️ Combatientes del Veredicto ({selectedTimelineFighterIds.length} Seleccionados):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 custom-scrollbar">
                  {allActiveFighters.map((f, idx) => {
                    const isDead = f.hp <= 0;
                    const fighterKey = f.id || f.name;
                    const isSelected = selectedTimelineFighterIds.includes(fighterKey);

                    return (
                      <div
                        key={fighterKey || idx}
                        onClick={() => {
                          setSelectedTimelineFighterIds(prev =>
                            prev.includes(fighterKey) ? prev.filter(k => k !== fighterKey) : [...prev, fighterKey]
                          );
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-sm'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {f.avatar ? (
                            <img src={f.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-700" />
                          ) : (
                            <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs">🥋</span>
                          )}
                          <div className="truncate">
                            <span className="font-bold block truncate text-xs">{f.name}</span>
                            <span className="text-[9px] block">
                              {isDead ? (
                                <span className="text-red-400 font-bold">💀 Muerto (0% HP)</span>
                              ) : (
                                <span className="text-emerald-400 font-bold">🟢 Vivo ({f.hp}% HP)</span>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0 ml-2">
                          {isDead ? (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                              isSelected
                                ? 'bg-purple-900 border-purple-400 text-purple-200'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}>
                              {isSelected ? '🔮 Revivido' : '💀 Caído'}
                            </span>
                          ) : (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                              isSelected
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                                : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}>
                              {isSelected ? '✓ Activo' : 'Omitir'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Destino y Modo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">1. Modo de Juego Próxima Saga:</label>
                  <select
                    value={targetTimelineMode}
                    onChange={(e) => setTargetTimelineMode(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold text-xs focus:border-indigo-500"
                  >
                    <option value="team">⚔️ Modo Equipos (Recomendado)</option>
                    <option value="1v1">🥋 Duelo 1v1 (Toma al 1º)</option>
                    <option value="raid">👑 Boss Raid (Como Boss o Asaltantes)</option>
                    <option value="battle_royale">🌪️ Battle Royale (Todos vs Todos)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">2. Bando a Ocupar:</label>
                  <select
                    value={targetTimelineSquad}
                    onChange={(e) => setTargetTimelineSquad(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold text-xs focus:border-indigo-500"
                  >
                    <option value="A">🛡️ Escuadrón A (Defensores / Aliados)</option>
                    <option value="B">⚔️ Escuadrón B (Invasores / Nuevos Enemigos)</option>
                    <option value="boss">👑 Boss Principal (Solo en Boss Raid)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/60">
              <button
                onClick={() => setShowTimelineModal(false)}
                className="px-4 py-2 rounded-lg font-mono text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (onContinueTimeline) {
                    const chosen = allActiveFighters.filter(f => selectedTimelineFighterIds.includes(f.id || f.name));
                    onContinueTimeline(chosen, targetTimelineMode, targetTimelineSquad);
                    setShowTimelineModal(false);
                  }
                }}
                disabled={selectedTimelineFighterIds.length === 0}
                className="px-5 py-2 rounded-xl font-mono text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition disabled:opacity-50 shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer"
              >
                🚀 Transferir al Simulador ({selectedTimelineFighterIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Choque de Rayos (Beam Struggle) */}
      <BeamStruggleModal
        isOpen={showBeamStruggle}
        onClose={() => setShowBeamStruggle(false)}
        charA={simulationData?.charA}
        charB={simulationData?.charB}
        scenario={simulationData?.scenario}
        simulationData={simulationData}
      />

      {/* Modal: Exportador de Guiones para TikTok / Shorts / YouTube */}
      <ScriptExporterModal
        isOpen={showScriptExporter}
        onClose={() => setShowScriptExporter(false)}
        simulationData={simulationData}
        fullOutput={fullOutput}
        verdictInfo={verdictInfo}
      />
    </div>
  );
}
