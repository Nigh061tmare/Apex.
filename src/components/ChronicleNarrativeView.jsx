import React, { useState } from 'react';
import {
  Sparkles, Zap, Flame, Shield, Swords, User, Volume2,
  BookOpen, Eye, Type, Sun, Moon, Maximize2, Coffee
} from 'lucide-react';

/**
 * Character voice color mapper for cinematic dialogue highlighting
 */
const getSpeakerStyle = (text) => {
  const t = text.toLowerCase();
  if (t.includes('vegeta') || t.includes('príncipe') || t.includes('principe')) {
    return {
      border: 'border-blue-500/70',
      bg: 'bg-blue-950/30',
      text: 'text-blue-200',
      badge: 'VEGETA',
      badgeColor: 'bg-blue-900/80 text-blue-300 border-blue-600'
    };
  }
  if (t.includes('goku') || t.includes('kakarotto') || t.includes('kakaroto')) {
    return {
      border: 'border-amber-500/70',
      bg: 'bg-amber-950/30',
      text: 'text-amber-200',
      badge: 'SON GOKU',
      badgeColor: 'bg-amber-900/80 text-amber-300 border-amber-600'
    };
  }
  if (t.includes('gohan')) {
    return {
      border: 'border-purple-500/70',
      bg: 'bg-purple-950/30',
      text: 'text-purple-200',
      badge: 'GOHAN',
      badgeColor: 'bg-purple-900/80 text-purple-300 border-purple-600'
    };
  }
  if (t.includes('piccolo') || t.includes('namekiano') || t.includes('namek')) {
    return {
      border: 'border-emerald-500/70',
      bg: 'bg-emerald-950/30',
      text: 'text-emerald-200',
      badge: 'PICCOLO',
      badgeColor: 'bg-emerald-900/80 text-emerald-300 border-emerald-600'
    };
  }
  if (t.includes('raditz') || t.includes('nappa') || t.includes('freezer') || t.includes('freeza')) {
    return {
      border: 'border-red-500/70',
      bg: 'bg-red-950/30',
      text: 'text-red-200',
      badge: 'ANTAGONISTA',
      badgeColor: 'bg-red-900/80 text-red-300 border-red-600'
    };
  }
  if (t.includes('roshi') || t.includes('krilin') || t.includes('bulma')) {
    return {
      border: 'border-cyan-500/70',
      bg: 'bg-cyan-950/30',
      text: 'text-cyan-200',
      badge: 'ALIADO TERRESTRE',
      badgeColor: 'bg-cyan-900/80 text-cyan-300 border-cyan-600'
    };
  }
  return {
    border: 'border-slate-600/60',
    bg: 'bg-slate-900/50',
    text: 'text-slate-200',
    badge: 'DIÁLOGO',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
  };
};

/**
 * Parses inline formatting: **technique** and *emphasis*
 */
const renderFormattedText = (raw) => {
  if (!raw) return null;

  // Split by bold (**...**) and italic (*...*)
  const parts = [];
  const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      parts.push(raw.substring(lastIndex, match.index));
    }

    if (match[1]) {
      // Bold / Technique: **name**
      const techName = match[2];
      parts.push(
        <span
          key={match.index}
          className="inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded-md bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/50 text-amber-300 font-bold font-mono text-[11px] shadow-[0_0_10px_rgba(245,158,11,0.25)] hover:scale-105 transition-transform select-all"
        >
          <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>{techName}</span>
        </span>
      );
    } else if (match[3]) {
      // Italic / Emphasis: *name*
      const empText = match[4];
      parts.push(
        <em key={match.index} className="text-emerald-300 not-italic font-semibold px-0.5">
          {empText}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < raw.length) {
    parts.push(raw.substring(lastIndex));
  }

  return parts;
};

export default function ChronicleNarrativeView({ text = '', title = '', isFirstChapter = false }) {
  const [readerTheme, setReaderTheme] = useState('cinematic'); // 'cinematic' | 'parchment' | 'scouter'
  const [fontSize, setFontSize] = useState('normal'); // 'compact' | 'normal' | 'large'

  if (!text) return null;

  // Normalize paragraphs: split by newlines or act indicators
  const rawParagraphs = text
    .split(/\n\s*\n|\n/)
    .map(p => p.trim())
    .filter(Boolean);

  const themeClasses = {
    cinematic: 'bg-slate-950/90 text-slate-200 border-slate-800/90 shadow-2xl',
    parchment: 'bg-[#18130c] text-amber-100 border-amber-900/50 shadow-2xl font-serif',
    scouter: 'bg-black text-emerald-300 border-emerald-800/80 shadow-[0_0_30px_rgba(16,185,129,0.15)] font-mono'
  };

  const fontClasses = {
    compact: 'text-xs leading-relaxed',
    normal: 'text-sm leading-relaxed',
    large: 'text-base leading-loose'
  };

  return (
    <div className={`rounded-2xl border transition-colors p-5 sm:p-7 space-y-5 ${themeClasses[readerTheme]}`}>
      {/* Reader Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 text-[11px] font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold uppercase tracking-wider">Lector Literario Cinematográfico</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme selector */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setReaderTheme('cinematic')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                readerTheme === 'cinematic' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Tema Cinemático Oscuro con Auras de Ki"
            >
              🎬 Cine
            </button>
            <button
              onClick={() => setReaderTheme('parchment')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                readerTheme === 'parchment' ? 'bg-amber-700 text-amber-100 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Tema Pergamino / Novela Impresa"
            >
              📜 Novela
            </button>
            <button
              onClick={() => setReaderTheme('scouter')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                readerTheme === 'scouter' ? 'bg-emerald-600 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Tema Táctico Scouter"
            >
              ⚡ Scouter
            </button>
          </div>

          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setFontSize('compact')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                fontSize === 'compact' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('normal')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                fontSize === 'normal' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                fontSize === 'large' ? 'bg-slate-700 text-white' : 'text-slate-400'
              }`}
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Paragraphs and Dialogue Blocks */}
      <div className={`space-y-4 ${fontClasses[fontSize]}`}>
        {rawParagraphs.map((para, idx) => {
          // 1. Act Header detection (e.g. ### ACTO I... or ACTO II: ...)
          const isActHeader = para.startsWith('###') || para.toUpperCase().startsWith('ACTO ');
          if (isActHeader) {
            const cleanTitle = para.replace(/^#+\s*/, '').trim();
            return (
              <div
                key={idx}
                className="pt-4 pb-2 my-4 border-y border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-purple-950/40 px-4 rounded-xl flex items-center gap-3 shadow-inner"
              >
                <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300">
                  <Flame className="w-4 h-4 text-purple-400 fill-purple-400/50" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 font-cinzel">
                  {cleanTitle}
                </h4>
              </div>
            );
          }

          // 2. Dialogue detection: starts with em-dash (— or --)
          const isDialogue = para.startsWith('—') || para.startsWith('--');
          if (isDialogue) {
            const speakerStyle = getSpeakerStyle(para);
            return (
              <div
                key={idx}
                className={`p-3.5 sm:p-4 rounded-xl border-l-4 border transition-all ${speakerStyle.border} ${speakerStyle.bg} my-3 space-y-1 shadow-md`}
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider uppercase border ${speakerStyle.badgeColor}`}>
                    {speakerStyle.badge}
                  </span>
                </div>
                <div className={`italic font-sans ${speakerStyle.text} text-sm leading-relaxed pl-1`}>
                  {renderFormattedText(para)}
                </div>
              </div>
            );
          }

          // 3. Drop cap for the very first paragraph of chapter
          const isDropCap = idx === 0;

          return (
            <p
              key={idx}
              className={`leading-relaxed text-slate-300/95 font-sans ${
                isDropCap
                  ? 'first-letter:text-3xl first-letter:font-black first-letter:text-amber-400 first-letter:mr-2 first-letter:float-left first-letter:leading-none'
                  : ''
              }`}
            >
              {renderFormattedText(para)}
            </p>
          );
        })}
      </div>
    </div>
  );
}
