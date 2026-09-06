import React, { useMemo, useState } from 'react';
import { Trophy, X, Trash2, Swords, Crown, CalendarDays, BarChart3 } from 'lucide-react';

const STORAGE_KEY = 'apex_combat_history';

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