import React, { useState, useEffect, useMemo } from 'react';
import { X, BookOpen, Swords, Dna, Clock, Search, Zap, ShieldAlert, FileText, Loader2, Globe, Flame, Snowflake, Wind, Activity } from 'lucide-react';
import {
  loadCodex, codexStats, searchCodex, searchDossier, getTimeline, listTechniqueDictionary,
  listRaces, listTechnology, listGtArcs, listDarkDragons, listMultipliers
} from '../services/chozenshuCodex';

const TYPE_LABEL = {
  ki: 'Ki', martial: 'Marcial', hax: 'Hax', support: 'Soporte',
  defense: 'Defensa', transformation: 'Transformación', fusion: 'Fusión', utility: 'Utilidad'
};
const TYPE_COLOR = {
  ki: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
  martial: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  hax: 'text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/30',
  support: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  defense: 'text-sky-300 bg-sky-500/10 border-sky-500/30',
  transformation: 'text-orange-300 bg-orange-500/10 border-orange-500/30',
  fusion: 'text-violet-300 bg-violet-500/10 border-violet-500/30',
  utility: 'text-slate-300 bg-slate-500/10 border-slate-500/30'
};

const TABS = [
  { id: 'tecnicas', label: 'Técnicas', icon: <Swords className="w-4 h-4" /> },
  { id: 'potencia', label: 'Fuerza de Combate', icon: <Zap className="w-4 h-4" /> },
  { id: 'cronologia', label: 'Cronología', icon: <Clock className="w-4 h-4" /> },
  { id: 'diccionario', label: 'Diccionario (N/T/P/C)', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'mundo', label: 'Mundo, Razas & GT', icon: <Globe className="w-4 h-4" /> },
  { id: 'pasivas', label: 'Pasivas Biológicas', icon: <Dna className="w-4 h-4" /> },
  { id: 'buscar', label: 'Buscador', icon: <Search className="w-4 h-4" /> }
];

const fmt = (n) => Number(n).toLocaleString('es-ES');

function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide ${className}`}>
      {children}
    </span>
  );
}

function SectionEmpty({ children }) {
  return <div className="text-center py-16 text-slate-500 text-sm">{children}</div>;
}

export default function ChozenshuCodexModal({ isOpen, onClose }) {
  const [codex, setCodex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('tecnicas');
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [onlyAttested, setOnlyAttested] = useState(false);
  const [deepResults, setDeepResults] = useState(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [ageFrom, setAgeFrom] = useState('');
  const [ageTo, setAgeTo] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    setLoading(true);
    loadCodex().then((c) => { if (alive) { setCodex(c); setLoading(false); } });
    return () => { alive = false; };
  }, [isOpen]);

  useEffect(() => { setDeepResults(null); }, [q, tab]);

  const stats = useMemo(() => (codex ? codexStats() : null), [codex]);

  const techniques = useMemo(() => {
    if (!codex) return [];
    const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const nq = norm(q);
    return codex.techniques
      .filter((t) => (typeFilter === 'all' ? true : t.ty === typeFilter))
      .filter((t) => (onlyAttested ? t.at : true))
      .filter((t) => !nq || norm(t.es).includes(nq) || norm(t.ro).includes(nq) || norm(t.id).includes(nq) || (t.al || []).some((a) => norm(a).includes(nq)))
      .sort((a, b) => (b.n || 0) - (a.n || 0));
  }, [codex, q, typeFilter, onlyAttested]);

  const timeline = useMemo(() => {
    if (!codex) return [];
    const from = ageFrom === '' ? 0 : parseInt(ageFrom, 10);
    const to = ageTo === '' ? 99999 : parseInt(ageTo, 10);
    return getTimeline({ from, to, limit: 400 });
  }, [codex, ageFrom, ageTo]);

  const searchHits = useMemo(() => (codex && q ? searchCodex(q, { limit: 40 }) : []), [codex, q]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-6xl h-[92vh] flex flex-col rounded-2xl border border-cyan-500/25 bg-[#080d17] shadow-[0_0_60px_-15px_rgba(34,211,238,0.35)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-transparent to-fuchsia-950/30">
          <div className="flex items-center gap-3 min-w-0">
            <BookOpen className="w-6 h-6 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                CÓDICE CHŌZENSHŪ <span className="text-cyan-400">·</span> CANON OFICIAL
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                Dragon Ball Compendios 1-4 · Planeta Cómic / Shueisha · 1.358 páginas diseccionadas
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition shrink-0" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STATS */}
        {stats && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 px-4 sm:px-6 py-2.5 border-b border-white/5 bg-black/30">
            {[
              ['Técnicas', stats.counts.techniques],
              ['Atestiguadas', stats.counts.attested],
              ['Fuerzas comb.', stats.counts.battlePowers],
              ['Cronología', stats.counts.timeline],
          ['Pasivas', stats.counts.passives],
          ['Chars DB', stats.counts.dbCharacters],
          ['Mundo/Lore', stats.counts.lore]
            ].map(([label, val]) => (
              <div key={label} className="text-center">
                <div className="text-sm sm:text-base font-mono font-bold text-emerald-400">{fmt(val)}</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* TABS */}
        <div className="flex gap-1 px-3 sm:px-5 py-2 border-b border-white/5 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                tab === t.id
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-20 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> Cargando Códice…
            </div>
          )}

          {!loading && !codex && (
            <div className="text-center py-20">
              <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold">Códice no disponible</p>
              <p className="text-slate-500 text-xs mt-1">
                Ejecuta <code className="text-cyan-400">node src/scripts/chozenshu/buildApexCodex.mjs</code> para generarlo.
              </p>
            </div>
          )}

          {/* --- TECNICAS --- */}
          {!loading && codex && tab === 'tecnicas' && (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={q} onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar técnica (español, romaji o alias)…"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
                <select
                  value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-2 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none"
                >
                  <option value="all">Todos los tipos</option>
                  {Object.keys(TYPE_LABEL).map((k) => <option key={k} value={k}>{TYPE_LABEL[k]}</option>)}
                </select>
                <button
                  onClick={() => setOnlyAttested((v) => !v)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                    onlyAttested ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  Solo atestiguadas
                </button>
                <span className="text-xs text-slate-500 font-mono">{techniques.length} / {codex.techniques.length}</span>
              </div>

              {techniques.length === 0 && <SectionEmpty>Sin resultados para «{q}».</SectionEmpty>}

              <div className="space-y-2">
                {techniques.slice(0, 120).map((t) => (
                  <div key={t.id} className="rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] p-3 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">{t.es}</span>
                          {t.ro && <span className="text-[11px] text-slate-500 italic">{t.ro}</span>}
                          <Badge className={TYPE_COLOR[t.ty] || TYPE_COLOR.utility}>{TYPE_LABEL[t.ty] || t.ty}</Badge>
                          {t.at
                            ? <Badge className="text-emerald-300 bg-emerald-500/10 border-emerald-500/30">✓ Tomos · {t.n}</Badge>
                            : <Badge className="text-amber-300/70 bg-amber-500/5 border-amber-500/20">sin atestiguar</Badge>}
                        </div>
                        {t.de && <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{t.de}</p>}
                        {t.at && t.occ && (
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-slate-500">
                            {Object.entries(t.occ).map(([tomo, o]) => (
                              <span key={tomo}>
                                <span className="text-cyan-500">{tomo}</span> p.{o.p.join(', ')}
                              </span>
                            ))}
                          </div>
                        )}
                        {t.us?.length > 0 && (
                          <div className="mt-1.5 text-[10px] text-slate-500">
                            <span className="text-slate-600 uppercase tracking-wider">Usuarios roster:</span> {t.us.slice(0, 6).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {techniques.length > 120 && (
                  <div className="text-center text-xs text-slate-500 py-3">Mostrando 120 de {techniques.length}. Refina la búsqueda.</div>
                )}
              </div>
            </>
          )}

          {/* --- POTENCIA --- */}
          {!loading && codex && tab === 'potencia' && (
            <>
              <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  <strong className="font-bold">Fuente primaria verificada.</strong> Tomo 04, Columna 2,
                  páginas impresas <strong>30 y 31</strong> (<code>0036_stitch.jpg</code>). Lectura directa a
                  resolución nativa. Multiplicadores ratificados por el propio libro: Oozaru ×10, Supersaiyano ×50,
                  Puno Kaio ×2…×20.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-white/10">
                      <th className="text-right py-2 pr-3 font-semibold">Unidades</th>
                      <th className="text-left py-2 pr-3 font-semibold">Personaje / Técnica</th>
                      <th className="text-left py-2 pr-3 font-semibold">Arco</th>
                      <th className="text-left py-2 font-semibold">Procedencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codex.battlePowers.map((r, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03]">
                        <td className="py-2 pr-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">{fmt(r.v)}</td>
                        <td className="py-2 pr-3">
                          <div className="text-white text-xs font-semibold">{r.n}</div>
                          {r.nt && <div className="text-[10px] text-slate-500 mt-0.5 max-w-md leading-snug">{r.nt}</div>}
                        </td>
                        <td className="py-2 pr-3 text-[11px] text-slate-400">{r.a || '—'}</td>
                        <td className="py-2 text-[10px] font-mono whitespace-nowrap">
                          {r.src === 'verificado-visual'
                            ? <span className="text-emerald-400">T04 p.{r.pg} ✓</span>
                            : <span className="text-amber-400/80">{r.src}{r.conf ? ` · ${r.conf}` : ''}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* --- CRONOLOGIA --- */}
          {!loading && codex && tab === 'cronologia' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <label className="text-xs text-slate-400">Desde Age</label>
                <input value={ageFrom} onChange={(e) => setAgeFrom(e.target.value)} placeholder="737" className="w-20 px-2 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-white focus:outline-none" />
                <label className="text-xs text-slate-400">hasta</label>
                <input value={ageTo} onChange={(e) => setAgeTo(e.target.value)} placeholder="889" className="w-20 px-2 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-white focus:outline-none" />
                <span className="text-xs text-slate-500 font-mono">{timeline.length} eventos</span>
              </div>
              <div className="space-y-2">
                {timeline.map((e, i) => (
                  <div key={i} className="flex gap-3 rounded-lg border border-white/8 bg-white/[0.02] p-2.5">
                    <div className="shrink-0 w-20 text-center">
                      <div className="text-amber-300 font-mono font-bold text-sm">{e.a}</div>
                      <div className="text-[9px] uppercase text-slate-600 tracking-wider">Age</div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-300 leading-relaxed break-words">{e.c}</p>
                      <div className="text-[9px] font-mono text-slate-600 mt-1">{e.t.toUpperCase()} · idx {e.p}</div>
                    </div>
                  </div>
                ))}
                {timeline.length === 0 && <SectionEmpty>Sin eventos en ese rango.</SectionEmpty>}
              </div>
            </>
          )}

          {/* --- PASIVAS --- */}
          {!loading && codex && tab === 'diccionario' && (() => {
          const all = listTechniqueDictionary();
          const s = q.toLowerCase().trim();
          const rows = s
            ? all.filter((x) => `${x.type} ${x.performer} ${x.description}`.toLowerCase().includes(s))
            : all;
          return (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={q} onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar por tipo (T), ejecutor (P) o descripción (C)…"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 text-xs outline-none focus:border-cyan-500/60"
                  />
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{rows.length} / {all.length}</span>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                Diccionario oficial del Compendio 4 (pp. 135-176): capítulo (N), tipo (T), ejecutor (P) y descripción (C).
              </p>
              {rows.length === 0 && (
                <div className="text-slate-500 text-sm py-6 text-center">Sin resultados.</div>
              )}
              {rows.slice(0, 120).map((x, i) => (
                <div key={`d${i}`} className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      {x.chapter ? `CAP ${x.chapter}` : 'CAP —'}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">{x.origin || 'manga'}</span>
                    {x.page && <span className="text-[10px] text-emerald-400 font-mono ml-auto">T04 p.{x.page}</span>}
                  </div>
                  {x.type && <div className="text-[12px] text-slate-200 mt-1"><span className="text-cyan-400 font-bold">(T)</span> {x.type}</div>}
                  {x.performer && <div className="text-[12px] text-slate-300"><span className="text-fuchsia-400 font-bold">(P)</span> {x.performer}</div>}
                  {x.description && <div className="text-[11px] text-slate-400 mt-0.5"><span className="text-emerald-400 font-bold">(C)</span> {x.description}</div>}
                </div>
              ))}
            </div>
          );
        })()}

        {!loading && codex && tab === 'mundo' && (() => {
          const races = listRaces();
          const tech = listTechnology();
          const arcs = listGtArcs();
          const dragons = listDarkDragons();
          const mults = listMultipliers();
          const s = q.toLowerCase().trim();
          const hit = (o) => !s || JSON.stringify(o).toLowerCase().includes(s);
          const ELEM = { fuego: Flame, hielo: Snowflake, viento: Wind, electricidad: Zap };
          return (
            <div className="space-y-6">
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Filtrar razas, tecnología, arcos de GT, dragones…"
                className="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 text-xs outline-none focus:border-cyan-500/60"
              />

              {races.filter(hit).length > 0 && (
                <section>
                  <h4 className="text-cyan-300 font-bold text-xs uppercase tracking-wider mb-2">Razas canónicas ({races.length})</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {races.filter(hit).map((r) => (
                      <div key={r.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-100 text-sm">{r.name}</span>
                          <span className="text-[10px] font-mono text-emerald-400">{r.t?.toUpperCase()} p.{r.p}</span>
                        </div>
                        <ul className="mt-1.5 space-y-0.5">
                          {(r.traits || []).slice(0, 5).map((t, i) => (
                            <li key={i} className="text-[11px] text-slate-400 leading-snug">• {t}</li>
                          ))}
                        </ul>
                        {(r.hooks || []).length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {r.hooks.map((h) => (
                              <span key={h} className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">{h}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {tech.filter(hit).length > 0 && (
                <section>
                  <h4 className="text-amber-300 font-bold text-xs uppercase tracking-wider mb-2">Tecnología y artefactos ({tech.length})</h4>
                  <div className="space-y-2">
                    {tech.filter(hit).map((x) => (
                      <div key={x.id} className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-100 text-sm">{x.name}</span>
                          <span className="text-[10px] font-mono text-emerald-400">{x.t?.toUpperCase()} p.{x.p}</span>
                        </div>
                        {x.desc && <p className="text-[11px] text-slate-400 mt-1 leading-snug">{x.desc}</p>}
                        {x.limit && <p className="text-[11px] text-rose-300 mt-1"><b>Límite:</b> {x.limit}</p>}
                        {x.hook && <p className="text-[10px] text-cyan-300 font-mono mt-1">{x.hook}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {arcs.filter(hit).length > 0 && (
                <section>
                  <h4 className="text-fuchsia-300 font-bold text-xs uppercase tracking-wider mb-2">Arcos de Dragon Ball GT ({arcs.length})</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {arcs.filter(hit).map((a) => (
                      <div key={a.id} className="rounded-lg border border-fuchsia-500/20 bg-fuchsia-950/10 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-100 text-sm">{a.name}</span>
                          <span className="text-[10px] font-mono text-emerald-400">ep. {a.episodes || '—'}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{a.note}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {dragons.filter(hit).length > 0 && (
                <section>
                  <h4 className="text-rose-300 font-bold text-xs uppercase tracking-wider mb-2">Los 7 Dragones Oscuros ({dragons.length})</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {dragons.filter(hit).map((d) => {
                      const Icon = ELEM[(d.element || '').toLowerCase()] || Activity;
                      return (
                        <div key={d.id} className="rounded-lg border border-rose-500/20 bg-rose-950/10 p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300">{'★'.repeat(d.stars)}</span>
                            <span className="font-bold text-slate-100 text-sm">{d.name}</span>
                            <Icon className="w-3.5 h-3.5 text-rose-300 ml-auto" />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">{d.note}</p>
                          {d.temperatureC && <p className="text-[10px] text-orange-300 font-mono mt-1">temperatura corporal: {d.temperatureC} °C</p>}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {mults.filter(hit).length > 0 && (
                <section>
                  <h4 className="text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2">Multiplicadores citados ({mults.length})</h4>
                  <div className="space-y-2">
                    {mults.filter(hit).map((m) => (
                      <div key={m.id} className="rounded-lg border border-emerald-500/20 bg-emerald-950/10 p-3 flex items-start gap-3">
                        <span className="text-emerald-300 font-mono font-bold text-lg">×{m.value}</span>
                        <div>
                          <div className="text-slate-100 text-sm font-bold">{m.name}</div>
                          <p className="text-[11px] text-slate-400 leading-snug">{m.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          );
        })()}

        {!loading && codex && tab === 'pasivas' && (
            <div className="grid gap-3 sm:grid-cols-2">
              {codex.passives.map((p) => (
                <div key={p.id} className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/[0.03] p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Dna className="w-4 h-4 text-fuchsia-400" />
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <Badge className="text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/30">{p.cat}</Badge>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.effect}</p>
                  <div className="mt-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-amber-400/80 mb-1">Contrajuego canónico</div>
                    <div className="flex flex-wrap gap-1">
                      {p.counter.map((c, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200/90">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 italic leading-snug flex gap-1.5">
                    <FileText className="w-3 h-3 shrink-0 mt-0.5" />{p.source}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- BUSCAR --- */}
          {!loading && codex && tab === 'buscar' && (
            <>
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Busca en TODO el corpus: técnicas, personajes, cronología, dossier…"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-black/50 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none"
                />
              </div>

              {!q && <SectionEmpty>Escribe algo para buscar en los 4 tomos.</SectionEmpty>}

              {q && searchHits.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold mb-2">Índice estructurado · {searchHits.length}</h3>
                  <div className="space-y-1.5">
                    {searchHits.map((h) => (
                      <div key={h.kind + h.id} className="flex items-start gap-2 rounded-lg border border-white/8 bg-white/[0.02] p-2">
                        <Badge className="text-cyan-300 bg-cyan-500/10 border-cyan-500/30 shrink-0 mt-0.5">{h.kind}</Badge>
                        <div className="min-w-0">
                          <div className="text-xs text-white font-semibold">{h.title}</div>
                          <div className="text-[10px] text-slate-500">{h.subtitle}{h.badge ? ` · ${h.badge}` : ''}</div>
                          {h.extra && <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{String(h.extra).slice(0, 220)}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] uppercase tracking-wider text-fuchsia-400 font-bold">Dossier de personajes (Diccionario Tomo 04)</h3>
                  <button
                    onClick={async () => { setDeepLoading(true); setDeepResults(await searchDossier(q, { limit: 60 })); setDeepLoading(false); }}
                    disabled={deepLoading || !q}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    {deepLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                    Buscar en 3.202 bloques (814 KB)
                  </button>
                </div>
                {deepResults && deepResults.length === 0 && <SectionEmpty>Sin coincidencias en el dossier.</SectionEmpty>}
                {deepResults && deepResults.length > 0 && (
                  <div className="space-y-1.5">
                    {deepResults.map((b, i) => (
                      <div key={i} className="rounded-lg border border-white/8 bg-black/40 p-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="text-slate-300 bg-white/5 border-white/10">[{b.m}]</Badge>
                          <span className="text-[10px] font-mono text-slate-500">{b.t.toUpperCase()} · idx {b.p}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed break-words">{b.x}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-white/5 bg-black/40 flex items-center justify-between gap-3">
          <span className="text-[10px] text-slate-600">
            Borrador de enriquecimiento · El baseline <code className="text-slate-500">ROSTER_..._V22.json</code> permanece congelado
          </span>
          <span className="text-[10px] font-mono text-slate-600 shrink-0">apex-codex v{stats?.version || '1.0.0'}</span>
        </div>
      </div>
    </div>
  );
}
