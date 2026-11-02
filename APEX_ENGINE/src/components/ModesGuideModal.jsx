import React from 'react';
import { Swords, GitBranch, Sparkles, Shield, X, Flame, Crown, Scale, Zap, Trophy, Compass, CheckCircle2 } from 'lucide-react';
import { getTranslation } from '../services/i18n';

export default function ModesGuideModal({ isOpen, onClose, currentMode, setMode, lang = 'es' }) {
  if (!isOpen) return null;

  const t = (k) => getTranslation(lang, k);

  const MODES_INFO = [
    {
      id: 'MODO VS',
      title: lang === 'en' ? 'VS Mode (Canonical Battle)' : lang === 'ja' ? 'VSモード（公式対戦）' : 'Modo VS (Batalla Canónica)',
      badge: lang === 'en' ? 'Standard VS Battles' : lang === 'ja' ? '標準対戦規格' : 'Estándar VS Battles',
      icon: Swords,
      color: 'border-red-500 bg-red-950/40 text-red-300',
      headerBg: 'from-red-600 to-amber-600',
      desc: lang === 'en'
        ? 'Strict mathematical and technical resolution based on canonical feats. Analyzes Attack Potency (Joules), Mach/FTL reaction speeds, stamina depletion, and conceptual Hax interactions without plot armor.'
        : lang === 'ja'
        ? '作中実績に基づく厳密な物理演算・能力解析を行う公式対戦モード。プロットアーマーを排除し、破壊力（AP）、反応速度、スタミナ消費、特殊能力（Hax）の干渉を数学的・客観的に判定します。'
        : 'Resolución técnica y matemática estricta basada 100% en hazañas (feats) canónicas documentadas. Analiza Potencia de Ataque (AP en Joules/Megatones), velocidades de reacción Mach/FTL, desgaste real de stamina e interacción de Hax sin favoritismos ni guionazo.',
      features: [
        lang === 'en' ? 'Rigorous power scaling based on Tier lists (1-A to Tier 10).' : 'Power Scaling riguroso basado en jerarquías de Tiers (1-A a Tier 10).',
        lang === 'en' ? 'Accurate speed differential and reaction calculations.' : 'Cálculo milimétrico de velocidad y diferenciales de reacción.',
        lang === 'en' ? 'Definitive victory verdict with difficulty tiers (Low/Mid/High/Extreme-Diff).' : 'Veredicto definitivo con niveles de dificultad (Low, Mid, High, Extreme-Diff).',
        lang === 'en' ? 'Zero plot armor: purely governed by capabilities and battle IQ.' : 'Cero conveniencias de guión: rige la lógica pura del enfrentamiento.'
      ]
    },
    {
      id: 'MODO WHAT-IF',
      title: lang === 'en' ? 'What-If Mode (Multiverse Divergence)' : lang === 'ja' ? 'What-Ifモード（多元宇宙分岐）' : 'Modo What-If (Multiverso Literario)',
      badge: lang === 'en' ? 'Literary Alternate History' : lang === 'ja' ? '文芸的IFシナリオ' : 'Historia Alternativa Literaria',
      icon: GitBranch,
      color: 'border-purple-500 bg-purple-950/40 text-purple-300',
      headerBg: 'from-purple-600 to-indigo-600',
      desc: lang === 'en'
        ? 'A literary and cinematic simulation exploring "What if...?" alternate timeline scenarios. Features dramatic character dialogue, ideological clashes, and explores long-term multiversal consequences via the Butterfly Effect.'
        : lang === 'ja'
        ? '「もしもあの時…」という仮想の歴史を紡ぐ文芸的シネマティックモード。対話、思想のぶつかり合い、そして勝敗が全宇宙の歴史に及ぼすバタフライエフェクト（長期的影響）を深く掘り下げます。'
        : 'Simulación literaria y cinematográfica de universos alternativos ("¿Qué hubiera pasado si...?"). Profundiza en los diálogos, choque de ideales, giros de trama inesperados y explora las consecuencias multiversales a largo plazo mediante el Efecto Mariposa.',
      features: [
        lang === 'en' ? 'Explores chronological alternate timelines and character developments.' : 'Explora líneas temporales alternativas y desarrollo de personajes.',
        lang === 'en' ? 'Rich cinematic prose with internal monologues and emotional weight.' : 'Prosa cinematográfica con diálogos intensos y peso emocional.',
        lang === 'en' ? 'Includes Butterfly Effect section detailing multiversal aftermath.' : 'Incluye sección de Efecto Mariposa con las repercusiones cósmicas.',
        lang === 'en' ? 'Supports custom premise prompts (injuries, surprise alliances, divine rules).' : 'Permite premisas libres (hándicap por lesión, alianzas sorpresa, reglas divinas).'
      ]
    },
    {
      id: 'MODO HÍBRIDO',
      title: lang === 'en' ? 'Hybrid Mode (The APEX Sweet Spot)' : lang === 'ja' ? 'ハイブリッドモード（完全融合型）' : 'Modo Híbrido (El Punto Óptimo APEX)',
      badge: lang === 'en' ? 'Best of Both Worlds' : lang === 'ja' ? '最高峰ハイブリッド' : 'Lo Mejor de Ambos Mundos',
      icon: Sparkles,
      color: 'border-amber-500 bg-amber-950/40 text-amber-300',
      headerBg: 'from-amber-500 to-orange-600',
      desc: lang === 'en'
        ? 'The ultimate APEX experience: Combines the strict technical power scaling and hax mechanics of VS Mode with the rich cinematic storytelling, choreography, and dramatic climax of What-If Mode.'
        : lang === 'ja'
        ? 'APEXエンジンの真骨頂：VSモードの厳密なパワースケーリング・能力判定を100%維持しながら、What-Ifモードの華麗なアクション描写とドラマチックな演出を融合させた最高峰モード。'
        : 'La experiencia insignia de APEX: Combina el 100% del rigor analítico, estadísticas y escalas de poder del Modo VS con la cinematografía, diálogos épicos, choques de energía y dramatismo del Modo What-If.',
      features: [
        lang === 'en' ? 'Exact feat scaling combined with high-octane martial choreography.' : 'Escalado exacto de feats con coreografía marcial de alto impacto.',
        lang === 'en' ? 'Dynamic live biometric checkpoints (HP & Stamina tracking).' : 'Checkpoints biométricos de HP y Stamina en tiempo real.',
        lang === 'en' ? 'Detailed mathematical breakdown alongside emotional climaxes.' : 'Desglose matemático riguroso junto a un clímax narrativo inolvidable.',
        lang === 'en' ? 'Recommended mode for the most immersive and balanced battles.' : 'Modo recomendado para combates épicos, creíbles y apasionantes.'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-700/80 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-5 font-mono text-xs shadow-[0_0_60px_rgba(0,0,0,0.95)] custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-cinzel uppercase tracking-wider">
                {lang === 'en' ? '📖 APEX Engine: Combat Modes Philosophy & Guide' : lang === 'ja' ? '📖 APEX戦闘モード解説＆哲学ガイド' : '📖 Guía de Modos de Combate & Filosofía APEX'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {lang === 'en' ? 'Understand how each mode alters simulation physics, AI prose, and verdict criteria.' : lang === 'ja' ? '各モードによる物理演算、AI文章スタイル、判定基準の違いを解説します。' : 'Descubre cómo cada modo transforma la física del combate, el estilo del relato y el veredicto.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modes Grid */}
        <div className="space-y-4">
          {MODES_INFO.map(m => {
            const Icon = m.icon;
            const isSelected = currentMode === m.id;
            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
                  isSelected
                    ? `${m.color} shadow-xl ring-2 ring-amber-500/50`
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${m.headerBg} text-white shadow`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white font-cinzel flex items-center gap-2">
                        {m.title}
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-black text-[9px] uppercase tracking-wider">
                            {lang === 'en' ? 'Active Mode' : lang === 'ja' ? '選択中' : 'Modo Activo'}
                          </span>
                        )}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{m.badge}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { setMode(m.id); onClose(); }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow ${
                      isSelected
                        ? 'bg-amber-500 text-black font-black hover:bg-amber-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isSelected ? (lang === 'en' ? 'Selected' : lang === 'ja' ? '選択済み' : 'Seleccionado') : (lang === 'en' ? 'Activate Mode' : lang === 'ja' ? 'このモードにする' : 'Activar este Modo')}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {m.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  {m.features.map((feat, fi) => (
                    <div key={fi} className="flex items-center gap-2 text-slate-300">
                      <span className="text-amber-400 font-bold">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'en' ? 'Tip: You can switch modes anytime without losing selected fighters.' : lang === 'ja' ? 'ヒント：ファイター選択を保持したままいつでもモード切替が可能です。' : 'Consejo: Puedes cambiar de modo en cualquier momento sin perder tus luchadores.'}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
          >
            {lang === 'en' ? 'Close Guide' : lang === 'ja' ? '閉じる' : 'Cerrar Guía'}
          </button>
        </div>
      </div>
    </div>
  );
}
