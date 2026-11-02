import React, { useMemo, useState } from 'react';
import { Trophy, X, Trash2, Swords, Crown, CalendarDays, BarChart3, Target, Medal, CheckCircle2, Circle } from 'lucide-react';

const STORAGE_KEY = 'apex_combat_history';
const STORAGE_KEY_DAILY = 'apex_daily_challenges_v1';
const STORAGE_KEY_TOURNAMENTS = 'apex_tournament_history';
const STORAGE_KEY_CUSTOM_CHARS = 'apex_custom_characters';
const STORAGE_KEY_COINS = 'apex_oracle_coins';

// ─────────────────────────────────────────────────────────────────────────────
// 🏅 LOGROS — se calculan 100% desde los datos locales existentes (sin wiring)
// ─────────────────────────────────────────────────────────────────────────────
function computeAchievements() {
  const achievements = [];
  let battles = 0;
  let raids = 0;
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(items)) {
      battles = items.length;
      raids = items.filter(i => (i.matchMode || '').toLowerCase().includes('raid') || (i.matchMode || '').toLowerCase().includes('1vN')).length;
    }
  } catch {}

  let tournaments = 0;
  try {
    const t = JSON.parse(localStorage.getItem(STORAGE_KEY_TOURNAMENTS) || '[]');
    tournaments = Array.isArray(t) ? t.length : 0;
  } catch {}

  let customChars = 0;
  try {
    const c = JSON.parse(localStorage.getItem(STORAGE_KEY_CUSTOM_CHARS) || '[]');
    customChars = Array.isArray(c) ? c.length : 0;
  } catch {}

  let coins = 0;
  try { coins = parseInt(localStorage.getItem(STORAGE_KEY_COINS) || '0', 10) || 0; } catch {}

  const defs = [
    { id: 'first_fight', icon: '⚔️', name: 'Primer Combate', desc: 'Simula tu primer enfrentamiento', done: battles >= 1 },
    { id: 'veteran', icon: '🔥', name: 'Veterano', desc: '10 combates simulados', done: battles >= 10 },
    { id: 'legend', icon: '👑', name: 'Leyenda del Ring', desc: '50 combates simulados', done: battles >= 50 },
    { id: 'raider', icon: '🐉', name: 'Cazador de Raids', desc: 'Simula 3 combates de Boss Raid', done: raids >= 3 },
    { id: 'tourney', icon: '🏆', name: 'Torneador', desc: 'Completa un torneo', done: tournaments >= 1 },
    { id: 'tourney_master', icon: '🎖️', name: 'Maestro de Torneos', desc: 'Completa 3 torneos', done: tournaments >= 3 },
    { id: 'creator', icon: '🧬', name: 'Creador de Fichas', desc: 'Guarda un personaje personalizado o fusión', done: customChars >= 1 },
    { id: 'rich', icon: '🪙', name: 'Oráculo Rico', desc: 'Acumula 5.000 monedas del Oráculo', done: coins >= 5000 }
  ];
  return {
    all: defs,
    unlocked: defs.filter(d => d.done).length,
    total: defs.length
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 🎯 RETOS DEL DÍA — deterministas por fecha, autocumplibles (se resetean a diario)
// ─────────────────────────────────────────────────────────────────────────────
function getDailyChallenges(dailyMatchup) {
  const today = new Date().toISOString().slice(0, 10);
  let completed = {};
  try { completed = JSON.parse(localStorage.getItem(STORAGE_KEY_DAILY) || '{}'); } catch {}
  const isDone = completed[today] ? true : false;

  const challenges = [
    { id: 'daily_fight', icon: '⚔️', text: 'Juega el Combate del Día', desc: dailyMatchup ? `${dailyMatchup.charA?.name?.split('(')[0].trim()} vs ${dailyMatchup.charB?.name?.split('(')[0].trim()}` : '' },
    { id: 'daily_arena', icon: '🌌', text: 'Simula en una Arena Legendaria (⚡)', desc: 'Las arenas con reglas especiales cuentan doble' },
    { id: 'daily_fuse', icon: '⚗️', text: 'Funde un personaje', desc: 'Usa el Laboratorio de Fusiones' }
  ];

  const mark = (id) => {
    try {
      const cur = JSON.parse(localStorage.getItem(STORAGE_KEY_DAILY) || '{}');
      cur[today] = cur[today] || {};
      cur[today][id] = !cur[today][id];
      localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(cur));
    } catch {}
  };

  return { challenges, completed: completed[today] || {}, mark, today };
}

// Extrae el vencedor del relato (misma heurística que SimulationViewer)
function parseWinnerFromNarrative(narrative = '', charA = '', charB = '') {
  const verdictMatch = narrative.match(/VENCEDOR:\s*([^\n\r]+)/i)
    || narrative.match(/GANADOR:\s*([^\n\r]+)/i)
    || narrative.match(/VICTORIA:\s*([^\n\r]+)/i);
  if (!verdictMatch) return null;
  const winnerStr = verdictMatch[1].replace(/[\*\_\[\]]/g, '').trim().toLowerCase();
  const tokensA = (charA || '').toLowerCase().split(/[\s\(\),:\.\/\-\_]+/).filter(Boolean);
  const tokensB = (charB || '').toLowerCase().split(/[\s\(\),:\.\/\-\_]+/).filter(Boolean);
  const scoreA = tokensA.filter(t => winnerStr.includes(t)).length;
  const scoreB = tokensB.filter(t => winnerStr.includes(t)).length;
  if (scoreA > scoreB) return charA;
  if (scoreB > scoreA) return charB;
  if (tokensA.some(t => winnerStr.includes(t))) return charA;
  if (tokensB.some(t => winnerStr.includes(t))) return charB;
  return null;
}

function buildRecords() {
  let items = [];
  try {
    items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {}
  if (!Array.isArray(items)) items = [];

  const stats = new Map(); // name -> { wins, losses, lastDate, fights }
  const battles = [];

  for (const it of items) {
    if (!it || !it.charA || !it.charB) continue;
    const winner = parseWinnerFromNarrative(it.narrative, it.charA, it.charB);
    const loser = winner === it.charA ? it.charB : winner === it.charB ? it.charA : null;
    const date = it.date || '';

    const touch = (name, isWin) => {
      if (!name) return;
      const s = stats.get(name) || { wins: 0, losses: 0, fights: 0, lastDate: '' };
      s.fights += 1;
      if (isWin) s.wins += 1; else s.losses += 1;
      if (date > (s.lastDate || '')) s.lastDate = date;
      stats.set(name, s);
    };

    touch(it.charA, winner === it.charA);
    touch(it.charB, winner === it.charB);
    battles.push({ charA: it.charA, charB: it.charB, winner, date, matchMode: it.matchMode || '1v1' });
  }

  const ranking = [...stats.entries()]
    .map(([name, s]) => ({ name, ...s, winRate: s.fights ? Math.round((s.wins / s.fights) * 100) : 0 }))
    .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate || a.losses - b.losses);

  const maxWins = Math.max(1, ...ranking.map(r => r.wins));
  return { ranking, battles, totalBattles: battles.length, uniqueFighters: ranking.length };
}

export default function RecordsModal({ isOpen, onClose, onPlayDaily, dailyMatchup }) {
  const [refresh, setRefresh] = useState(0);

  const data = useMemo(() => (isOpen ? buildRecords() : null), [isOpen, refresh]);
  const achievements = useMemo(() => (isOpen ? computeAchievements() : null), [isOpen, refresh]);
  const daily = useMemo(() => (isOpen ? getDailyChallenges(dailyMatchup) : null), [isOpen, dailyMatchup, refresh]);

  if (!isOpen) return null;

  const { ranking, battles, totalBattles, uniqueFighters } = data;

  const handleClear = () => {
    if (!window.confirm('¿Borrar todo el historial de combates locales?')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    setRefresh(r => r + 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-800 bg-[#0b0e16] shadow-2xl shadow-red-950/30">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0b0e16]/95 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-black tracking-wide text-amber-300">SALA DE RÉCORDS</h2>
              <p className="text-[10px] font-mono text-slate-500">Top vencedores del historial local</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleClear} title="Borrar historial" className="p-2 rounded-lg bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition cursor-pointer border border-slate-800">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer border border-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-2 px-5 py-4 border-b border-slate-800/60">
          <div className="text-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-xl font-black text-slate-100">{totalBattles}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1"><Swords className="w-3 h-3" /> Combates</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-xl font-black text-slate-100">{uniqueFighters}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1"><Crown className="w-3 h-3" /> Luchadores</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-xl font-black text-amber-300">{ranking[0]?.wins || 0}</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-500 flex items-center justify-center gap-1"><Trophy className="w-3 h-3" /> Récord máximo</p>
          </div>
        </div>

        {/* Ranking */}
        <div className="px-5 py-4">
          <h3 className="text-xs font-bold font-mono text-slate-400 mb-3 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" /> TOP VENCEDORES
          </h3>
          {ranking.length === 0 ? (
            <div className="text-center py-10 text-slate-600 text-sm">
              <p className="text-3xl mb-3">🏆</p>
              <p>Aún no hay combates registrados.</p>
              <p className="text-xs mt-1">Simula una batalla para empezar a construir el ranking local.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ranking.slice(0, 10).map((r, i) => (
                <div key={r.name} className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/40 border border-slate-800/60">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black ${
                    i === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : i === 1 ? 'bg-slate-400/10 text-slate-300 border border-slate-500/30'
                    : i === 2 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/40'
                    : 'bg-slate-800 text-slate-500'
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-200 truncate">{r.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 shrink-0">
                        {r.wins}V · {r.losses}D · <span className={r.winRate >= 60 ? 'text-emerald-400' : 'text-slate-400'}>{r.winRate}%</span>
                      </p>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-400"
                        style={{ width: `${Math.max(4, (r.wins / maxWins) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🎯 Retos del Día */}
        <div className="px-5 py-4 border-t border-slate-800">
          <h3 className="text-xs font-bold font-mono text-slate-400 mb-3 flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-emerald-400" /> RETOS DEL DÍA <span className="text-[9px] text-slate-600">({daily.today})</span>
          </h3>
          <div className="space-y-2">
            {daily.challenges.map(ch => {
              const done = !!daily.completed[ch.id];
              return (
                <button
                  key={ch.id}
                  onClick={() => { daily.mark(ch.id); setRefresh(r => r + 1); }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition cursor-pointer text-left ${
                    done ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  <span className="text-lg shrink-0">{ch.icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-[11px] font-bold ${done ? 'text-emerald-300 line-through' : 'text-slate-200'}`}>{ch.text}</span>
                    {ch.desc && <span className="block text-[9px] font-mono text-slate-500 truncate">{ch.desc}</span>}
                  </span>
                  {done ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <Circle className="w-4 h-4 text-slate-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 🏅 Logros */}
        <div className="px-5 py-4 border-t border-slate-800">
          <h3 className="text-xs font-bold font-mono text-slate-400 mb-3 flex items-center gap-2">
            <Medal className="w-3.5 h-3.5 text-amber-400" /> LOGROS <span className="text-[9px] text-slate-600">{achievements.unlocked}/{achievements.total}</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {achievements.all.map(a => (
              <div
                key={a.id}
                title={a.desc}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] font-bold ${
                  a.done
                    ? 'bg-amber-950/50 border-amber-500/60 text-amber-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-60'
                }`}
              >
                <span>{a.icon}</span>
                <span>{a.name}</span>
                {a.done ? <CheckCircle2 className="w-3 h-3 text-amber-400" /> : <Circle className="w-3 h-3 text-slate-700" />}
              </div>
            ))}
          </div>
        </div>

        {/* Combate del día + últimas batallas */}
        <div className="px-5 pb-5 space-y-4">
          {dailyMatchup && (
            <button
              onClick={() => { onClose(); onPlayDaily(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600/30 via-teal-600/30 to-emerald-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 text-emerald-300 border border-emerald-500/40 font-bold transition cursor-pointer"
            >
              <CalendarDays className="w-4 h-4" />
              Jugar el Combate del Día: {dailyMatchup.charA?.name?.split(' ').slice(0, 2).join(' ')} vs {dailyMatchup.charB?.name?.split(' ').slice(0, 2).join(' ')}
            </button>
          )}
          {battles.length > 0 && (
            <div>
              <h3 className="text-xs font-bold font-mono text-slate-400 mb-2">ÚLTIMAS BATALLAS</h3>
              <div className="space-y-1.5">
                {battles.slice(0, 5).map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-2 py-1.5 rounded-lg bg-slate-900/30 border border-slate-800/50">
                    <span className="truncate">{b.charA} <span className="text-red-500/70">vs</span> {b.charB}</span>
                    <span className="shrink-0 ml-2">
                      {b.winner ? <span className="text-amber-400 font-bold">🏆 {b.winner.split(' ').slice(0, 2).join(' ')}</span> : <span className="text-slate-600">— sin veredicto</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}