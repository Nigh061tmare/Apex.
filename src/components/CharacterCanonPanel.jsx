import React, { useEffect, useState } from 'react';
import { BookOpen, Swords, Zap, Dna, ShieldAlert, Loader2, CheckCircle2, FileText, Download } from 'lucide-react';
import {
  loadCodex, getTechniquesForCharacter, getBattlePowersForCharacter,
  getPassivesForCharacter, getPassivePromptBlock
} from '../services/chozenshuCodex';

const fmt = (n) => Number(n).toLocaleString('es-ES');

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

function Chip({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${className}`}>
      {children}
    </span>
  );
}

function Card({ icon, title, accent, count, children }) {
  return (
    <div className={`p-3.5 rounded-2xl border ${accent} space-y-2.5`}>
      <div className="flex items-center justify-between">
        <label className="font-bold text-xs flex items-center gap-2">
          {icon}{title}
        </label>
        <span className="text-[10px] font-mono opacity-70">{count}</span>
      </div>
      {children}
    </div>
  );
}

/**
 * Panel canónico del Códice Chōzenshū dentro de la ficha de personaje.
 * Autocontenido: carga el codex por sí mismo y degrada con elegancia.
 */
export default function CharacterCanonPanel({ character, onApplyTechniques, feedback }) {
  const [codex, setCodex] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | unavailable
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    let alive = true;
    setState('loading');
    loadCodex().then((c) => {
      if (!alive) return;
      setCodex(c);
      setState(c ? 'ready' : 'unavailable');
    });
    return () => { alive = false; };
  }, []);

  const notDragonBall = character?.franchise && character.franchise !== 'Dragon Ball' && character.franchise !== 'APEX Original / Híbrido';

  const techs = codex && character ? getTechniquesForCharacter(character.id) : [];
  const bps = character ? getBattlePowersForCharacter(character.id) : [];
  const passives = character ? getPassivesForCharacter(character) : [];
  const promptBlock = character ? getPassivePromptBlock(character) : '';

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-slate-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> Consultando el Códice Chōzenshū…
      </div>
    );
  }

  if (state === 'unavailable') {
    return (
      <div className="text-center py-16">
        <ShieldAlert className="w-9 h-9 text-amber-400 mx-auto mb-3" />
        <p className="text-slate-300 font-semibold text-sm">Códice no disponible</p>
        <p className="text-slate-500 text-xs mt-1">
          Genera el bundle con <code className="text-cyan-400">node src/scripts/chozenshu/buildApexCodex.mjs</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/25 flex items-start gap-2.5">
        <BookOpen className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-[11px] text-cyan-200/90 font-semibold">Canon verificado — Dragon Ball Compendios (Chōzenshū 1-4)</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Datos cotejados con los tomos oficiales. Fuente: Planeta Cómic / Shueisha, 1.358 páginas.
            {notDragonBall && ' Este personaje no pertenece a Dragon Ball: solo se muestran sus pasivas fisiológicas registradas.'}
          </p>
        </div>
      </div>

      {bps.length > 0 && (
        <Card icon={<Zap className="w-4 h-4 text-emerald-400" />} title="Fuerza de Combate Canónica" accent="bg-emerald-900/15 border-emerald-500/30 text-emerald-300" count={`${bps.length} registro(s)`}>
          <div className="space-y-1.5">
            {bps.map((r, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-black/30 border border-white/5 px-2.5 py-1.5">
                <span className="font-mono font-bold text-emerald-400 text-sm shrink-0">{fmt(r.v)}</span>
                <div className="min-w-0">
                  <div className="text-[11px] text-white font-semibold">{r.n}</div>
                  <div className="text-[10px] text-slate-500">
                    {r.a || '—'} · <span className={r.src === 'verificado-visual' ? 'text-emerald-500' : 'text-amber-500'}>
                      {r.src === 'verificado-visual' ? `Tomo 04 p.${r.pg} ✓ verificado` : `minado (${r.conf || 'media'})`}
                    </span>
                  </div>
                  {r.nt && <div className="text-[10px] text-slate-400 mt-0.5">{r.nt}</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {techs.length > 0 && (
        <Card icon={<Swords className="w-4 h-4 text-orange-400" />} title="Técnicas Canónicas Atestiguadas" accent="bg-orange-900/15 border-orange-500/30 text-orange-300" count={`${techs.length} técnica(s)`}>
          {onApplyTechniques && (
            <div className="flex flex-wrap items-center gap-2 pb-1">
              <button
                onClick={() => onApplyTechniques(techs.filter((t) => t.at))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-[11px] font-bold transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Aplicar {techs.filter((t) => t.at).length} técnicas al arsenal
              </button>
              <span className="text-[10px] text-slate-500">
                Borrador editable: se clasifica por tipo (ki → Súper · hax → Pasivas · utilidad → Activas) y se deduplica.
              </span>
            </div>
          )}
          {feedback && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-[11px] text-emerald-200">
              ✓ {feedback.added} técnica(s) añadida(s) al arsenal desde el Códice
              {feedback.skipped > 0 && `. ${feedback.skipped} ya existían (deduplicadas).`}
              {' '}Revisa la pestaña «Ataques & Habilidades» antes de guardar.
            </div>
          )}
          <div className="grid gap-1.5 sm:grid-cols-2">
            {techs.map((t) => (
              <div key={t.id} className="rounded-lg bg-black/30 border border-white/5 px-2.5 py-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-white font-semibold">{t.es}</span>
                  <Chip className={TYPE_COLOR[t.ty] || TYPE_COLOR.utility}>{t.ty}</Chip>
                  {t.at ? <Chip className="text-emerald-300 bg-emerald-500/10 border-emerald-500/30">{t.n} menc.</Chip> : null}
                </div>
                {t.ro && <div className="text-[9px] text-slate-500 italic">{t.ro}</div>}
                {t.at && t.occ && (
                  <div className="text-[9px] font-mono text-slate-600 mt-0.5">
                    {Object.entries(t.occ).map(([k, o]) => `${k} p.${o.p.slice(0, 3).join('/')}`).join(' · ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {passives.length > 0 && (
        <Card icon={<Dna className="w-4 h-4 text-fuchsia-400" />} title="Pasivas Biológicas (motor determinista)" accent="bg-fuchsia-900/15 border-fuchsia-500/30 text-fuchsia-300" count={`${passives.length} activa(s)`}>
          <div className="space-y-2">
            {passives.map((p) => (
              <div key={p.id} className="rounded-lg bg-black/30 border border-white/5 px-2.5 py-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-white font-bold">{p.name}</span>
                  <Chip className="text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/30">{p.category}</Chip>
                </div>
                <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">{p.effect}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {p.counterplay.map((c, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200/90">{c}</span>
                  ))}
                </div>
                <div className="text-[9px] text-slate-600 italic mt-1 flex gap-1">
                  <FileText className="w-2.5 h-2.5 shrink-0 mt-0.5" />{p.source}
                </div>
              </div>
            ))}
          </div>
          {promptBlock && (
            <div className="pt-1">
              <button
                onClick={() => setShowPrompt((v) => !v)}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3" />
                {showPrompt ? 'Ocultar' : 'Ver'} bloque inyectado en el prompt de simulación
              </button>
              {showPrompt && (
                <pre className="mt-2 p-2.5 rounded-lg bg-black/60 border border-cyan-500/20 text-[9px] text-cyan-200/80 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                  {promptBlock}
                </pre>
              )}
            </div>
          )}
        </Card>
      )}

      {techs.length === 0 && bps.length === 0 && passives.length === 0 && (
        <div className="text-center py-10 text-slate-500 text-xs">
          Sin registros canónicos en el Códice para esta ficha.
        </div>
      )}
    </div>
  );
}
