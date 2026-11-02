import React, { useState } from 'react';
import { 
  Scale, X, Zap, Shield, Sparkles, Brain, Target, Compass, Flame, 
  ChevronRight, BookOpen, AlertTriangle, Crosshair, Dumbbell, Globe, Search 
} from 'lucide-react';
import { POWERSCALING_TIERING_SYSTEM, SPEED_SCALE_SYSTEM, DURABILITY_RULES, UNIVERSAL_ENERGY_SYSTEMS } from '../data/powerscalingCodex';
import { getTranslation } from '../services/i18n';

export default function PowerscalingGuideModal({ isOpen, onClose, lang = 'es' }) {
  const [activeTab, setActiveTab] = useState('powerlevels');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const t = (k) => getTranslation(lang, k);

  const TABS = [
    { id: 'powerlevels', label: lang === 'en' ? 'Power Levels & Scouter (DB vs APEX)' : lang === 'ja' ? '戦闘力＆スカウター（DB vs APEX）' : '🥋 Niveles de Poder & Scouter (DB vs APEX)', icon: Flame },
    { id: 'tiers', label: lang === 'en' ? 'Tiering System (11-C to 0)' : lang === 'ja' ? '階級システム（11-C〜Tier 0）' : 'Sistema de Tiers (11-C a 0)', icon: Scale },
    { id: 'joules', label: lang === 'en' ? 'AP & Joules Energy Table' : lang === 'ja' ? '攻撃力＆ジュール変換表' : 'Tabla de AP & Julios', icon: Zap },
    { id: 'speed', label: lang === 'en' ? 'Speed & Speed Blitz Math' : lang === 'ja' ? '速度階級＆電光石火' : 'Velocidad & Speed Blitz', icon: Crosshair },
    { id: 'durability', label: lang === 'en' ? 'Durability & Physics Laws' : lang === 'ja' ? '耐久力＆物理法則' : 'Durabilidad & Física Newtoniana', icon: Shield },
    { id: 'intel', label: lang === 'en' ? 'Intelligence & Battle IQ' : lang === 'ja' ? '知性＆戦闘IQ' : 'Inteligencia & Battle IQ', icon: Brain },
    { id: 'methodology', label: lang === 'en' ? 'Outliers, PIS & Equalization' : lang === 'ja' ? '例外・作中補正・エネルギー均一化' : 'Metodología: Outliers, PIS & Reglas', icon: AlertTriangle },
  ];

  const filteredTiers = POWERSCALING_TIERING_SYSTEM.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.tier.toLowerCase().includes(q) || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-950 border border-slate-700/80 rounded-2xl max-w-5xl w-full h-[92vh] max-h-[900px] shadow-[0_0_70px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden font-mono text-xs">
        
        {/* Header (Pinned) */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/95 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-red-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <Scale className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-cinzel tracking-wider flex items-center gap-2 flex-wrap">
                <span>📖 Compendio Canónico de Power Scaling</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/40">
                  VS Battles Wiki Standard
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                La biblia matemática, dimensional y física para el análisis técnico de enfrentamientos interdimensionales.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer bg-slate-900 border border-slate-800 transition shrink-0 ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Pinned) */}
        <div className="shrink-0 px-4 sm:px-5 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto custom-scrollbar z-10">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  active
                    ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-md shadow-amber-950/50'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">

        {/* Tab 0: Power Levels & Scouter (DB Canon vs APEX Universal) */}
        {activeTab === 'powerlevels' && (
          <div className="space-y-6 font-sans text-slate-200">
            {/* Header Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-amber-950/40 to-slate-900 border border-amber-500/40 shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-sm">
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                <span>Arquitectura Dual de Niveles de Poder: Ki Canónico DB vs APEX-Ki Universal</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                El motor APEX resuelve la contradicción clásica del power scaling mediante <strong>dos métricas complementarias</strong>: 
                el <strong>Ki Canónico (Scouter)</strong> oficial de Dragon Ball (Daizenshuu, Guías Oficiales y DAIMA) para fidelidad de lore, y el <strong>APEX-Ki</strong>, una métrica universal y estrictamente monotónica que garantiza que un personaje de tier superior siempre supere a uno inferior en cualquier enfrentamiento cross-verse.
              </p>
            </div>

            {/* Principles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs font-mono">
                  <span>📟 1. Scouter Ki Canónico (Dragon Ball)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Lecturas cuantitativas directas según los manuales oficiales de Akira Toriyama y Toei Animation. Solo se aplica a sagas y personajes de Dragon Ball.
                </p>
                <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 text-[10px] space-y-1 font-mono text-slate-400">
                  <div>• <strong>Goku Niño (21º Torneo):</strong> 80 Unidades (Oozaru: 800)</div>
                  <div>• <strong>Goku vs Piccolo Daimaoh:</strong> 260 – 290 Unidades</div>
                  <div>• <strong>Goku 23º Torneo:</strong> 370 Unidades (Super Kamehameha: 480)</div>
                  <div>• <strong>Goku Saga Saiyan:</strong> 8.618 Unidades (Kaio-ken x4: 36.700)</div>
                  <div>• <strong>Vegeta Saiyan:</strong> 18.000 Unidades (Oozaru: 180.000)</div>
                  <div>• <strong>Freezer Forma Final (100%):</strong> 128.000.000 Unidades</div>
                  <div>• <strong>Goku Super Saiyan (Namek):</strong> 150.000.000 Unidades</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs font-mono">
                  <span>⚡ 2. APEX-Ki & Escala Universal (Cross-Verse)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Escala de combate calibrada que traduce el <strong>Tier Destructivo (AP)</strong> y las 6 estadísticas a un valor comparable universalmente, evitando colapsos numéricos.
                </p>
                <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800 text-[10px] space-y-1 font-mono text-slate-400">
                  <div>• <strong>Tier 7-B (Ciudad - Yujiro / Baki / Homelander):</strong> ~650 – 750 APEX-Ki</div>
                  <div>• <strong>Tier 7-A (Montaña - Gojo / Sukuna):</strong> ~1.000 – 1.200 APEX-Ki</div>
                  <div>• <strong>Tier 5-A (Planeta Grande - Vegeta Saiyan):</strong> 18.000.000 APEX-Ki</div>
                  <div>• <strong>Tier 4-A (Multi-Solar - Saitama / Garou Cósmico):</strong> ~80 – 97 Mil Millones</div>
                  <div>• <strong>Tier 2-C (Multiversal - Goku DBS / Superman):</strong> 10.000 Billones APEX-Ki</div>
                  <div>• <strong>Tier 1-C a 1-A (Trascendente):</strong> Escala dimensional infinita</div>
                </div>
              </div>
            </div>

            {/* Official Multipliers Table */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs font-mono text-amber-300 flex items-center gap-2">
                  <span>📈 Tabla Maestra de Multiplicadores Canónicos</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] border border-amber-500/30">Oficial Daizenshuu & Super</span>
                </h4>
              </div>
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono">
                      <th className="p-2.5 font-bold">Transformación / Técnica</th>
                      <th className="p-2.5 font-bold">Multiplicador</th>
                      <th className="p-2.5 font-bold">Efecto / Condiciones</th>
                      <th className="p-2.5 font-bold">Ejemplo Canónico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[10px]">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-amber-400 font-bold">Oozaru / Gran Simio</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×10</td>
                      <td className="p-2.5 text-slate-300">Luna llena o Blutz Waves artificiales</td>
                      <td className="p-2.5 text-slate-400">Goku Niño (80 → 800), Vegeta (18k → 180k)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-red-400 font-bold">Kaio-ken (x1 a x20)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×1.5 a ×20</td>
                      <td className="p-2.5 text-slate-300">Multiplicación de Ki con estrés físico severo</td>
                      <td className="p-2.5 text-slate-400">Goku vs Vegeta (KKx3: 27.525, KKx4: 36.700)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-amber-300 font-bold">Super Saiyan (SSJ1)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×50</td>
                      <td className="p-2.5 text-slate-300">Despertar por furia legendaria</td>
                      <td className="p-2.5 text-slate-400">Goku Namek (Base 3M → SSJ 150M)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-amber-300 font-bold">Super Saiyan Grade 2 (Ultra)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×62.5</td>
                      <td className="p-2.5 text-slate-300">×1.25 sobre SSJ con hipertrofia controlada</td>
                      <td className="p-2.5 text-slate-400">Vegeta vs Cell Semiperfecto (1.28B)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-amber-300 font-bold">Super Saiyan Grade 3</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×100 (-75% Vel)</td>
                      <td className="p-2.5 text-slate-300">Fuerza bruta extrema con pérdida crítica de agilidad</td>
                      <td className="p-2.5 text-slate-400">Trunks del Futuro vs Cell Perfecto (2.04B)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-yellow-400 font-bold">Super Saiyan 2 (SSJ2)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×100 (×2 SSJ)</td>
                      <td className="p-2.5 text-slate-300">Rayo eléctrico, velocidad y AP duplicados sin penalización</td>
                      <td className="p-2.5 text-slate-400">Gohan vs Cell Games (Base 56M → SSJ2 5.6B)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-yellow-300 font-bold">Super Saiyan 3 (SSJ3)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×400 (×4 SSJ2)</td>
                      <td className="p-2.5 text-slate-300">Extracción de potencial oculto con drenaje masivo</td>
                      <td className="p-2.5 text-slate-400">Goku vs Buu Gordo (31.200.000.000)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-red-500 font-bold">Super Saiyan 4 (GT)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×4.000</td>
                      <td className="p-2.5 text-slate-300">Control del Gran Simio Dorado</td>
                      <td className="p-2.5 text-slate-400">Goku SSJ4 (2,24 Billones), Gogeta SSJ4 (440 Billones)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-red-400 font-bold">Super Saiyan God (SSG)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×6.400</td>
                      <td className="p-2.5 text-slate-300">Ritual divino o entrenamiento angelical</td>
                      <td className="p-2.5 text-slate-400">Goku vs Bills (524 Mil Millones)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-cyan-400 font-bold">Super Saiyan Blue (SSB)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×7.700</td>
                      <td className="p-2.5 text-slate-300">SSJ superpuesto al Ki Divino</td>
                      <td className="p-2.5 text-slate-400">Goku SSB (631 Mil Millones)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-blue-400 font-bold">SSB Evolution (SSBE)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×77.000</td>
                      <td className="p-2.5 text-slate-300">×10 sobre SSB estándar logrado por Vegeta</td>
                      <td className="p-2.5 text-slate-400">Vegeta vs Jiren / Toppo Hakaishin (6,2 Billones)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-slate-300 font-bold">Ultra Instinto Signo (UI)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×150.000</td>
                      <td className="p-2.5 text-slate-300">Separación mente-cuerpo incompleta</td>
                      <td className="p-2.5 text-slate-400">Goku UI Signo (12,3 Billones)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-white font-bold">Ultra Instinto Dominado (MUI)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×300.000</td>
                      <td className="p-2.5 text-slate-300">Maestría divina autónoma absoluta</td>
                      <td className="p-2.5 text-slate-400">Goku MUI (24,6 Billones)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-rose-300 font-bold">Gohan Beast (Bestia)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×1.000.000</td>
                      <td className="p-2.5 text-slate-300">Evolución genética única desatada por furia</td>
                      <td className="p-2.5 text-slate-400">Gohan Beast vs Cell Max (77 Billones)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-orange-400 font-bold">Orange Piccolo</td>
                      <td className="p-2.5 text-emerald-400 font-bold">×10.000</td>
                      <td className="p-2.5 text-slate-300">Regalo de Shenron sobre Namekiano Desbloqueado</td>
                      <td className="p-2.5 text-slate-400">Piccolo Super Hero (14 Billones)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-purple-400 font-bold">Fusión Potara (Vegetto)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">(A + B) × 1.120</td>
                      <td className="p-2.5 text-slate-300">Multiplicación simbiótica con pendientes Kaio-shin</td>
                      <td className="p-2.5 text-slate-400">Super Vegetto SSJ (5 Trillones)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-orange-300 font-bold">Danza Fusión (Gogeta)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">(A + B) × 1.000</td>
                      <td className="p-2.5 text-slate-300">Sincronización perfecta Metamoru durante 30 min</td>
                      <td className="p-2.5 text-slate-400">Gogeta SSJ (7,6 Billones), Gogeta Blue (1,25 Trillones)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-pink-400 font-bold">Compresión DAIMA Mini</td>
                      <td className="p-2.5 text-amber-400 font-bold">÷10 (×0.1)</td>
                      <td className="p-2.5 text-slate-300">Reducción corporal y compresión de masa mágica</td>
                      <td className="p-2.5 text-slate-400">Goku Adulto (100M) → Goku Mini (10M)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hax & Tier Separation Explanation */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 space-y-2">
              <h4 className="font-bold text-xs font-mono text-purple-300 flex items-center gap-2">
                <span>🔮 Desacople Esencial: Hax Conceptual vs Tier de Daño Físico</span>
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Tener habilidades intangibles o conceptuales (como el <em>Infinity</em> de Satoru Gojo, el <em>Return to Zero</em> de Giorno GER o el control mental de Makima) <strong>NO incrementa su Potencia de Ataque Físico ni su Tier Destructivo</strong>. 
                En el motor APEX:
              </p>
              <ul className="list-disc list-inside text-[10px] space-y-1 text-slate-400 font-mono">
                <li>El <strong>Tier Destructivo</strong> mide cuántos Julios de energía física o de área puede generar el cuerpo (ej. Gojo = Tier 7-A Montaña).</li>
                <li>Las habilidades conceptuales se ejecutan a través de <strong>specialMechanics</strong> y <strong>haxReliability</strong>, resolviéndose durante el combate táctico sin distorsionar la ordenación global.</li>
                <li><strong>Garantía Monotónica:</strong> Ningún personaje de Tier inferior superará a uno de Tier superior en <code>powerKey</code>, impidiendo por diseño anomalías matemáticas.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 1: Tiering System */}
        {activeTab === 'tiers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="🔍 Buscar por Tier (ej: 4-B, 1-A, Sistema Solar, Multiverso)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500/60 font-mono"
                />
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {filteredTiers.length} niveles indexados
              </span>
            </div>

            <div className="p-3 mb-4 rounded-xl bg-gradient-to-r from-cyan-900/40 to-slate-900 border border-cyan-500/30 text-xs text-slate-200 space-y-2 font-sans">
              <strong className="text-cyan-400 block font-mono">⚡ Sistema de APEX-Ki y Escalado de Formas:</strong>
              <p>
                El <b>APEX-Ki</b> se calcula evaluando el <span className="text-amber-400">Tier Base</span> y la <span className="text-amber-400">Calidad de Stats</span> del personaje. 
                Si un personaje adopta una transformación o estado (ej. <i>Super Saiyan</i>, <i>Golden Freezer</i>, <i>Forma Máxima</i>), el motor detecta el alias y aplica un <b>multiplicador exacto de poder y estadísticas</b>.
              </p>
              <ul className="list-disc pl-4 text-[11px] text-slate-300">
                <li>Si la forma tiene un Tier propio, el motor recalcula el APEX-Ki desde cero usando el nuevo nivel.</li>
                <li>Si la forma mantiene el mismo Tier pero otorga un <i>Boost</i> (como Bido o King Cold), el motor aplica el multiplicador de transformación, actualizando el APEX-Ki final instantáneamente.</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTiers.map(item => (
                <div key={item.tier} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-amber-500/40 transition space-y-1.5 group">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs font-mono">
                      {item.tier}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.category}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">{item.name}</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{item.desc}</p>
                  <div className="pt-1.5 border-t border-slate-800/60 text-[10px] font-mono text-cyan-400 flex items-center justify-between">
                    <span>Equivalente Energético:</span>
                    <strong className="text-amber-400 font-bold truncate max-w-[200px]">{item.joules}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Joules Energy Table */}
        {activeTab === 'joules' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 text-xs text-slate-300 space-y-1 font-sans">
              <strong className="text-amber-400 block font-mono">⚡ Regla de Oro del Attack Potency (AP):</strong>
              <p>
                La Potencia de Ataque mide la energía concentrada o liberada por un golpe o técnica (medida en Julios o Toneladas de TNT). Un personaje no necesita destruir una ciudad físicamente si puede perforar o dañar a un oponente con durabilidad a nivel ciudad.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 max-h-[500px]">
              <table className="w-full text-left text-[11px] font-mono">
                <thead className="bg-slate-950/90 text-amber-300 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="p-2.5">Tier</th>
                    <th className="p-2.5">Denominación</th>
                    <th className="p-2.5">Energía en Julios (J)</th>
                    <th className="p-2.5">Equivalente TNT / Foe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {POWERSCALING_TIERING_SYSTEM.filter(t => t.joules !== '0 J').map(t => (
                    <tr key={t.tier} className="hover:bg-slate-800/40 transition">
                      <td className="p-2.5 font-bold text-amber-400">{t.tier}</td>
                      <td className="p-2.5 text-white">{t.name}</td>
                      <td className="p-2.5 text-cyan-300 font-bold">{t.joules}</td>
                      <td className="p-2.5 text-slate-400">{t.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Speed & Speed Blitz */}
        {activeTab === 'speed' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-cyan-400" /> Los 5 Tipos Canónicos de Velocidad
                </h4>
                <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc pl-4 font-sans">
                  <li><strong>Velocidad de Ataque:</strong> Rapidez de un proyectil, rayo o técnica aislada.</li>
                  <li><strong>Velocidad de Combate:</strong> Capacidad para encadenar golpes y maniobras cuerpo a cuerpo.</li>
                  <li><strong>Velocidad de Reacción:</strong> Tiempo para esquivar o responder a un ataque inesperado a corta distancia.</li>
                  <li><strong>Velocidad de Percepción:</strong> Tiempo de procesamiento mental (no garantiza movimiento físico).</li>
                  <li><strong>Velocidad de Viaje / Vuelo:</strong> Desplazamiento lineal a través de grandes distancias o el cosmos.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/50 space-y-2">
                <h4 className="font-bold text-sm text-red-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-400" /> La Regla del Speed Blitz
                </h4>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Un <em>Speed Blitz</em> ocurre cuando un luchador supera la velocidad de reacción y percepción de su oponente por un margen tal que el rival resulta noqueado o decapitado antes de que sus neuronas puedan procesar el primer estímulo. Si la diferencia es de 5x a 10x o superior, el combate se resuelve antes del inicio.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 max-h-[380px]">
              <table className="w-full text-left text-[11px] font-mono">
                <thead className="bg-slate-950/90 text-cyan-300 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="p-2.5">Rango de Velocidad</th>
                    <th className="p-2.5">Escala Mach / Luz</th>
                    <th className="p-2.5">Descripción & Contexto Físico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {SPEED_SCALE_SYSTEM.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="p-2.5 font-bold text-cyan-300">{s.rank}</td>
                      <td className="p-2.5 text-amber-300 font-bold">{s.mach}</td>
                      <td className="p-2.5 text-slate-300">{s.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Durability & Physics */}
        {activeTab === 'durability' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase">🛡️ Tercera Ley de Newton en Durabilidad</span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  "Para toda acción existe una reacción igual y opuesta." Si un combatiente propina un puñetazo físico con potencia destructiva de Nivel Sistema Solar sin fracturarse el brazo ni romperse los huesos, su cuerpo posee automáticamente una Durabilidad equivalente a Nivel Sistema Solar.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-400 uppercase">📐 Concentración de Área de Superficie</span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Armas afiladas (espadas, agujas, hilos monomoleculares) concentran toda la energía cinética en un filo microscópico. Por ello, una hoja cortante puede herir a un personaje resistente a bombas o meteoritos sin que el atacante posea un AP planetario.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 space-y-2">
                <span className="text-xs font-bold text-purple-300 uppercase">🔮 Negación de Durabilidad & Puntos de Presión</span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Ataques que emplean ácido, nanotecnología, vibraciones sónicas internas o manipulación de flujos de ki/puntos vitales (Juken de Hyuga, Hokuto Shinken de Kenshiro) dañan los órganos directamente ignorando la armadura externa del oponente.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-2">
                <span className="text-xs font-bold text-emerald-300 uppercase">💎 Tanking vs No-Selling</span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  <strong>Tanking:</strong> El ataque impacta y no causa ningún daño físico (las balas rebotan o las espadas se parten contra la piel).<br />
                  <strong>No-Selling:</strong> El luchador no muestra dolor ni parpadea por pura fuerza de voluntad o adrenalina, pero el daño anatómico interno sigue acumulándose.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Intelligence & Battle IQ */}
        {activeTab === 'intel' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 font-sans">
              <h4 className="font-bold text-sm text-amber-300 font-mono">🧠 Clasificación Oficial de Intelecto & Battle IQ</h4>
              
              <div className="space-y-2 text-[11px] text-slate-300">
                <p>• <strong>Sin Mente / Instintivo:</strong> Autómatas, monstruos primordiales o entidades sin consciencia (Doomsday no adaptado, insectos).</p>
                <p>• <strong>Promedio / Superdotado:</strong> Humanos normales hasta profesionales y estrategas militares destacados.</p>
                <p>• <strong>Genio:</strong> Capacidad analítica sobrehumana en combate o ciencias (L, Light Yagami, Shikamaru, Kakashi, Solid Snake).</p>
                <p>• <strong>Genio Extraordinario:</strong> Diseñan tecnología futurista, predicen el futuro mediante cálculo mental y ejecutan planes de 10 pasos (Batman, Kisuke Urahara, Aizen, Bulma, Tony Stark, Bruce Banner).</p>
                <p>• <strong>Supergenio:</strong> Crean artefactos que alteran la realidad o desafían las leyes cósmicas (Dr. Doom, Reed Richards, Rick Sanchez, Azmuth, Profesor Paradox).</p>
                <p>• <strong>Omnisciente / Casi Omnisciente:</strong> Conocimiento absoluto de la totalidad del multiverso y sus líneas causales (Yog-Sothoth, Eternity).</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Methodology, Outliers & PIS */}
        {activeTab === 'methodology' && (
          <div className="space-y-4 font-sans text-slate-300 text-[11px] leading-relaxed">
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/50 space-y-2">
              <h4 className="font-bold text-sm text-red-400 font-mono">⚠️ Filtro Anti-Outliers (Casos Atípicos) & PIS (Plot-Induced Stupidity)</h4>
              <p>
                En debates de Power Scaling, los momentos donde un personaje de nivel cósmico es herido por una bala común o un ladrón de calle (o cuando Spider-Man vence a un Heraldo de Galactus por conveniencia del guionista) se descartan como <strong>Outliers</strong> o <strong>PIS</strong> para mantener la coherencia matemática de la simulación.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-cyan-400 font-mono">🌐 Ecualización de Sistemas de Energía (Universal Energy Systems)</h4>
              <p>
                Para garantizar combates justos entre universos diferentes, el motor APEX asume que las fuentes vitales (<strong>Ki = Chakra = Reiatsu = Haki = Magia = Maná</strong>) interactúan en el mismo plano dimensional, permitiendo que las defensas de energía choquen sin generar inmunidades absolutas artificiales.
              </p>
            </div>
          </div>
        )}

        </div>

        {/* Footer (Pinned) */}
        <div className="shrink-0 p-3.5 px-5 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px] bg-slate-950/95">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Integrado en el motor de simulación cuántica de APEX Engine 2.0</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Cerrar Compendio
          </button>
        </div>

      </div>
    </div>
  );
}
