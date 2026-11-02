import React, { useState } from 'react';
import { X, Copy, Check, Video, Share2, Sparkles, Hash, PlaySquare } from 'lucide-react';

export default function ScriptExporterModal({ isOpen, onClose, simulationData, fullOutput, verdictInfo }) {
  const [copied, setCopied] = useState(false);
  const [scriptType, setScriptType] = useState('tiktok'); // 'tiktok' | 'youtube' | 'vs'

  if (!isOpen) return null;

  const charAName = simulationData?.charA?.name || 'Luchador A';
  const charBName = simulationData?.charB?.name || 'Luchador B';
  const winnerName = verdictInfo?.winner || charAName;
  const diff = verdictInfo?.difficulty || 'Extreme-Diff';
  const scenarioName = simulationData?.scenario?.name || 'Arena Cósmica';

  const generateScript = () => {
    if (scriptType === 'tiktok') {
      return `🎬 GUION DE TIKTOK / REELS / SHORTS (60 Segundos)
==================================================
📌 TÍTULO: ¿Quién gana entre ${charAName} y ${charBName}? | Análisis Definitivo APEX
🎯 FORMATO: Pantalla Dividida + Narración Rápida con Hype

⏱️ [0:00 - 0:05] HOOK / GANCHO VIRAL:
(Voz en Off enérgica): "¿Quién ganaría en un duelo a muerte sin censura entre ${charAName} y ${charBName}? La respuesta te va a sorprender."
(Visual): Imágenes dinámicas de ambos en split screen con música épica de fondo.

⏱️ [0:05 - 0:20] ESCALA DE PODER & FACTORES CLAVE:
(Voz en Off): "En el escenario de ${scenarioName}, ${charAName} entra con una velocidad y técnicas abrumadoras. Pero ${charBName} cuenta con una resistencia biológica y hax que complican el combate."
(Visual): Estadísticas en pantalla (AP, Velocidad FTL, Hax de combate).

⏱️ [0:20 - 0:40] EL CLÍMAX & GIRO INESPERADO:
(Voz en Off): "En la Fase 3, la colisión de ataques definitivos desata una ruptura de límites. Ambos lanzan sus finishers a quemarropa hasta el colapso anatómico."
(Visual): Efecto de choque de energías / texto parpadeante "CLÍMAX CRÍTICO".

⏱️ [0:40 - 0:55] VEREDICTO FINAL:
(Voz en Off): "¡El ganador indiscutible es ${winnerName} con una dificultad de ${diff}! ${verdictInfo?.decisiveText || 'Por superioridad de Hax y control del campo.'}"
(Visual): Imagen del ganador con corona y tier final.

⏱️ [0:55 - 1:00] CALL TO ACTION:
(Voz en Off): "¿Estás de acuerdo o crees que el resultado sería distinto? ¡Déjalo en los comentarios y sígueme para más simulaciones en APEX Engine!"

🏷️ HASHTAGS:
#vsbattles #powerscaling #${charAName.replace(/\s+/g, '')} #${charBName.replace(/\s+/g, '')} #animeedit #whoisstrongest #apexengine
`;
    } else if (scriptType === 'youtube') {
      return `📺 GUION DE YOUTUBE VIDEO / ANÁLISIS COMPLETO (2-3 Minutos)
===========================================================
📌 TÍTULO: ${charAName} vs ${charBName} — Simulación Completa & Análisis Forense
🎙️ ESTILO: Documental Épico / Narración Solemne

1. INTRODUCCIÓN & CONDICIONES:
   - Presentación de los contendientes en ${scenarioName}.
   - Reglas: Velocidad canon, interacción de sistemas de energía y moral realista.

2. FASE 1 & 2: PRIMER CONTACTO CINÉTICO:
   - Intercambio de ataques base y medición de distancias.
   - Presión atmosférica y desgaste temprano de stamina.

3. FASE 3: EL PUNTO DE INFLEXIÓN (CISNE NEGRO):
   - El evento que cambia el rumbo de la batalla.
   - Ruptura de defensas y daño a órganos vitales.

4. FASE 4: COLISIÓN DE ATAQUES DEFINITIVOS:
   - Los finishers chocan en el epicentro.
   - Análisis de Joules y resistencia ósea.

5. VEREDICTO DEFINITIVO:
   - Vencedor: ${winnerName} (${diff}).
   - Causa médica y estado del mapa post-combate.
`;
    } else {
      return `📐 FICHA DE DEBATE VS BATTLES WIKI / X (TWITTER THREAD)
=======================================================
🧵 HILO DE COMPARATIVA TÉCNICA:

1/5 | COMBATIENTES:
- ${charAName} vs ${charBName}
- Arena: ${scenarioName}

2/5 | ESCALADO DE ESTADÍSTICAS:
- Velocidad: Relativista a MFTL+
- Durabilidad: Molecular / Anatómica
- Hax: Interacción de sistemas

3/5 | FACTOR CLAVE DEL COMBATE:
- ${verdictInfo?.decisiveText || 'Superioridad en la sincronía de ataques y control de daño anatómico.'}

4/5 | RESULTADO OFICIAL:
- VENCEDOR: ${winnerName}
- DIFICULTAD: ${diff}

5/5 | Simulado con APEX Powerscaling Engine (Omni-Titán 2.0).
`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateScript());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel border-2 border-pink-500/60 bg-[#0c101a] shadow-[0_0_50px_rgba(236,72,153,0.25)] p-6 overflow-hidden space-y-4 max-h-[90vh] overflow-y-auto font-mono text-xs text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-600 to-purple-600 text-white font-black shadow-lg shadow-pink-950/60">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-pink-300 font-cinzel tracking-wider flex items-center gap-2">
                Exportador de Guiones para Creadores (TikTok / YouTube)
              </h2>
              <p className="text-[11px] text-slate-400">
                Estructura lista para locutar con marcas de tiempo, indicaciones de cámara y hashtags
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Script Type Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'tiktok', label: '📱 TikTok / Reels / Shorts (60s)', icon: <PlaySquare className="w-3.5 h-3.5" /> },
            { id: 'youtube', label: '📺 YouTube Completo', icon: <Video className="w-3.5 h-3.5" /> },
            { id: 'vs', label: '📐 Hilo de X / Debate VS', icon: <Hash className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setScriptType(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                scriptType === tab.id
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-950/60'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Code/Script Content */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative">
          <pre className="font-mono text-[11px] text-pink-100 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
            {generateScript()}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-lg transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Guión'}</span>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
