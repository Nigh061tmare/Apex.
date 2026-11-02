import React, { useState } from 'react';
import { Sparkles, X, PlusCircle, Check, FileText, ListFilter, Trash2, ArrowRight, RefreshCw, Layers, Copy, CheckCheck, Wand2 } from 'lucide-react';
import { SimulationEngine } from '../services/simulationEngine';
import { SoundFX } from '../services/soundFx';

const CLEAN_TEMPLATE_JSON = JSON.stringify({
  "id": "identificador-unico",
  "name": "Nombre del Personaje (Momento / Versión)",
  "alias": "Título o Epíteto de Combate",
  "universe": "Universo / Franquicia",
  "saga": "Saga o Era Específica",
  "version": "Versión Cronológica Exacta",
  "tier": "Tier 5-A | Nivel Planeta Grande",
  "ap": "Potencia de ataque justificada con hazañas.",
  "range": "Cuerpo a cuerpo / Planetario / Interdimensional",
  "speed": {
    "combat": "FTL+",
    "reaction": "FTL+",
    "travel": "MFTL",
    "attack": "Velocidad de la Luz"
  },
  "strength": {
    "striking": "Multi-Planet Class",
    "lifting": "Class G"
  },
  "durability": "Resistencia a escala con su AP.",
  "stamina": "Muy Alta",
  "battleIQ": "Genio Marcial y Táctico",
  "haxTags": [
    "Regeneración Celular",
    "Teletransportación",
    "Anulación de Hax"
  ],
  "arsenal": {
    "basicAttacks": "Combos físicos marciales y ráfagas estándar.",
    "superAttacks": [
      {
        "name": "Técnica Especial 1",
        "desc": "Descripción del ataque y efectos.",
        "cost": "15% Energía"
      }
    ],
    "ultimateAttacks": [
      {
        "name": "Técnica Definitiva",
        "desc": "Ataque destructor supremo de máxima potencia.",
        "cost": "60% Energía"
      }
    ],
    "passives": [
      {
        "name": "Habilidad Pasiva",
        "desc": "Efecto pasivo constante en combate."
      }
    ]
  },
  "forms": [
    {
      "id": "base",
      "name": "Forma Base",
      "stats": "Poder estándar"
    },
    {
      "id": "forma-maxima",
      "name": "Modo Máximo Poder",
      "stats": "Multiplicador de potencia y velocidad"
    }
  ],
  "feats": [
    "Hazaña destructiva demostrada",
    "Hazaña de velocidad o aguante"
  ],
  "psychology": "Mentalidad en combate y motivación.",
  "weaknesses": "Vulnerabilidades y puntos débiles."
}, null, 2);

const TEMPLATES = [
  {
    name: '3 Personajes Clásicos (Lista Rápida)',
    text: "1. Son Gohan Bestia (Dragon Ball Super: Super Hero) - Nivel Multiversal Bajo con Makankosappo perforante.\n2. Naruto Uzumaki (Modo Barion) - Nivel Lunar a Planetario con desgaste vital extremo y velocidad FTL.\n3. Roronoa Zoro (Rey del Infierno / AXZ) - Nivel Isla Grande con Haki del Conquistador Avanzado y corte espacial."
  },
  {
    name: '💥 Arquetipo: Guerrero Saiyan / Ki Blaster',
    text: "Nombre: Kakarot X (Guerrero Saiyan de Élite)\nUniverso: Dragon Ball Custom\nTier: Tier 4-B | Nivel Sistema Solar\nArsenal: Ondas de Ki concentrado, Kamehameha Galáctico, Kaio-ken x50, Zenkai reactivo tras daño casi fatal.\nTransformaciones: Base, Super Saiyan Dorado, Super Saiyan Berserker con x100 de fuerza.\nDebilidad: Confiarse y buscar alargar la pelea para disfrutar del combate."
  },
  {
    name: '🧙 Arquetipo: Mago / Reality Warper',
    text: "Nombre: Archimagister Vael (Señor del Espacio-Tiempo)\nUniverso: Alta Fantasía Cósmica\nTier: Tier 2-C | Multiversal Bajo\nArsenal: Magia de transmutación de materia en plomo, barreras de vacío cuántico, detención del tiempo por 5 segundos y borrado conceptual de almas.\nDebilidad: Requiere canalizar sus conjuros definitivos y cuerpo físico vulnerable si se rompe su barrera."
  },
  {
    name: '🛡️ Arquetipo: Monstruo de Regeneración / Boss Raid',
    text: "Nombre: El Leviatán del Caos Inmortal\nUniverso: Entidad Cósmica\nTier: Tier 3-A | Nivel Universal\nArsenal: Regeneración a nivel de células y cenizas, adaptación biológica a cualquier elemento que lo haya dañado, tentáculos que devoran dimensiones y estamina inagotable.\nDebilidad: Ataques purificadores de luz conceptual absoluta a escala macroscópica."
  },
  {
    name: '⚡ Arquetipo: Velocista / Speedster',
    text: "Nombre: Relámpago Cósmico (Avatar de la Fuerza de Velocidad)\nUniverso: Sci-Fi Multiversal\nTier: Tier 4-A | Multi-Sistema Solar\nVelocidad: MFTL+ a Infinito\nArsenal: Viaje temporal por sprint, golpes de masa infinita a velocidad luz, intangibilidad por vibración molecular y robo de energía cinética.\nDebilidad: Desgaste calórico acelerado si la pelea se prolonga en dimensiones estáticas."
  }
];

export default function BatchAiImporterModal({ isOpen, onClose, aiConfig, onImportCharacters, allCharacters = [] }) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedChars, setExtractedChars] = useState([]);
  const [importedSuccess, setImportedSuccess] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [targetSection, setTargetSection] = useState('AUTO');
  const [customSectionInput, setCustomSectionInput] = useState('');

  if (!isOpen) return null;

  const existingUniverses = Array.from(new Set((allCharacters || []).map(c => c.universe || 'Universo Canon'))).filter(Boolean);

  const handleProcessText = async () => {
    if (!inputText.trim()) {
      return alert('Por favor, escribe o pega un texto, lista o descripción primero.');
    }

    setIsProcessing(true);
    setImportedSuccess(false);
    try {
      const result = await SimulationEngine.batchParseCharactersWithAi(inputText, aiConfig);
      if (result && result.length > 0) {
        setExtractedChars(result);
        SoundFX.playBetWin?.();
      } else {
        alert('No se pudieron extraer personajes. Intenta proporcionar nombres más claros.');
      }
    } catch (e) {
      alert('Error procesando con IA: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveChar = (idx) => {
    setExtractedChars(prev => prev.filter((_, i) => i !== idx));
  };

  const handleImportAll = () => {
    if (extractedChars.length === 0) return;
    const finalSection = targetSection === 'CUSTOM' ? customSectionInput.trim() : (targetSection !== 'AUTO' ? targetSection : null);
    const finalChars = extractedChars.map(c => {
      if (finalSection) {
        return { ...c, universe: finalSection };
      }
      return c;
    });
    onImportCharacters(finalChars);
    setImportedSuccess(true);
    SoundFX.playBetWin?.();
    setTimeout(() => {
      onClose();
      setExtractedChars([]);
      setInputText('');
      setImportedSuccess(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-purple-500/50 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-[0_0_50px_rgba(168,85,247,0.3)] font-mono text-xs animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-cinzel tracking-wider flex items-center gap-2">
                Importador Inteligente & Creador Masivo de Fichas con IA
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Pega texto libre, wikis de VS Battles o listas de personajes para estructurarlas al formato del server.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Template Buttons */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
              💡 Arquetipos & Plantillas Rápidas:
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(CLEAN_TEMPLATE_JSON);
                setCopiedTemplate(true);
                SoundFX.playMenuClick?.();
                setTimeout(() => setCopiedTemplate(false), 2000);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-[10px] font-bold text-purple-200 transition cursor-pointer"
            >
              {copiedTemplate ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">¡Plantilla JSON Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-purple-400" />
                  <span>📋 Copiar Plantilla JSON Limpia</span>
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(t.text)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-[11px] text-slate-300 transition cursor-pointer"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Texto, Descripción o Lista de Personajes:</span>
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              Motor IA: <strong className="text-purple-400 font-bold">{aiConfig?.engine?.toUpperCase()}</strong> ({aiConfig?.model || 'default'})
            </span>
          </div>

          <textarea
            rows={6}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Pega aquí cualquier descripción, lista de personajes, ficha de rol o texto de VS Battles..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 text-slate-100 font-mono text-xs focus:border-purple-500 focus:outline-none leading-relaxed"
          />

          <div className="flex justify-end gap-2">
            <button
              disabled={isProcessing || !inputText.trim()}
              onClick={handleProcessText}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-950/80 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analizando & Extrayendo con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>⚡ Analizar & Generar Fichas</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Extracted Characters Preview */}
        {extractedChars.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-800">
            {/* Target Section Selector */}
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-300">📁 Ubicación / Sección de destino en el Roster:</span>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <select
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  className="bg-slate-900 border border-purple-600/50 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer flex-1"
                >
                  <option value="AUTO">✨ Auto-clasificar por Universo Original de la IA</option>
                  <option value="CUSTOM">➕ Nueva Sección Personalizada...</option>
                  <optgroup label="Secciones Existentes:">
                    {existingUniverses.map((u, i) => (
                      <option key={i} value={u}>{u}</option>
                    ))}
                  </optgroup>
                </select>

                {targetSection === 'CUSTOM' && (
                  <input
                    type="text"
                    value={customSectionInput}
                    onChange={(e) => setCustomSectionInput(e.target.value)}
                    placeholder="Escribe el nombre de la nueva sección (ej: Mis Favoritos)..."
                    className="bg-slate-950 border border-purple-400 rounded-lg px-2.5 py-1.5 text-xs text-purple-200 outline-none flex-1"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Fichas Listas para Guardar ({extractedChars.length})
              </span>
              <button
                onClick={handleImportAll}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/80 transition cursor-pointer flex items-center gap-1.5"
              >
                {importedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Guardadas en la Bóveda!</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>📥 Guardar Todo en la Bóveda ({extractedChars.length})</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {extractedChars.map((char, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 relative group hover:border-purple-500/40 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{char.name}</h4>
                      <span className="text-[10px] text-purple-300">{char.universe} • {char.version}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveChar(idx)}
                      className="p-1 rounded-lg text-slate-500 hover:text-red-400 cursor-pointer"
                      title="Quitar de la lista"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-1.5 px-2 rounded bg-slate-950 border border-slate-800/80 text-[10px] text-amber-300 font-bold truncate">
                    {char.tier}
                  </div>

                  <p className="text-[10px] text-slate-400 line-clamp-2">
                    {char.ap}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {(char.haxTags || []).slice(0, 3).map((h, hIdx) => (
                      <span key={hIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800/50 text-purple-300">
                        ✨ {h}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer font-bold">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
