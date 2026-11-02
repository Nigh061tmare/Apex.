import React, { useState } from 'react';
import {
  Sparkles, X, Wand2, Swords, RefreshCw, AlertCircle, PlusCircle, Check,
  ArrowRight, Shield, Flame, Users, Skull, Crown, MapPin, Zap, Package, Play
} from 'lucide-react';
import { SimulationEngine } from '../services/simulationEngine';
import { SoundFX } from '../services/soundFx';
import { parseMatchupPrompt, generateApexDetailedCharacter } from '../services/aiMatchmakerCore';
import { SCENARIOS } from '../data/scenarios';

const QUICK_PROMPTS = [
  "1v1 entre Goku Mini SSJ3 Daima y Lord Boros en el Domo de Namek con Semilla del Ermitaño",
  "What-If: Saitama vs Thor Rune King en el Espacio Profundo con 24 horas de preparación",
  "Boss Raid: Lord Boros contra All Might Prime, Genos y Tatsumaki en la Fortaleza U.A.",
  "Guerra de Equipos: Gojo y Yuta vs Sukuna y Kenjaku con anulación temporal de Hax",
  "Battle Royale: Vegetto U16, Son Bra Majin, Zen Buu U4 y Gast Carcolh en Gravedad Cero",
  "What-If: Vegeta SSJ2 vs nuevo titán cósmico Lord Xibalba de Tier 2-C con Super Técnica prohibida"
];

export default function AiSmartMatchmakerModal({
  isOpen,
  onClose,
  characters = [],
  aiConfig,
  onApplyMatchup,
  onSaveNewCharacter,
  lang = 'es'
}) {
  const [promptText, setPromptText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedMatch, setAnalyzedMatch] = useState(null);
  const [missingChars, setMissingChars] = useState([]);
  const [isGeneratingChar, setIsGeneratingChar] = useState({});
  const [activeTab, setActiveTab] = useState('prompt'); // 'prompt' | 'customChar'
  const [newCharTier, setNewCharTier] = useState('7-A');
  const [newCharUniverse, setNewCharUniverse] = useState('APEX Multiverse');

  if (!isOpen) return null;

  // Intelligent parser using AI with heuristic fallback
  const handleAnalyzePrompt = async () => {
    if (!promptText.trim()) return;
    setIsAnalyzing(true);
    setAnalyzedMatch(null);
    setMissingChars([]);

    // 1. Initial fast heuristic parse
    const localParsed = parseMatchupPrompt(promptText, characters);

    // 2. Try querying AI for nuanced entity resolution if AI is configured
    try {
      if (aiConfig && aiConfig.apiKey) {
        const characterNames = characters.slice(0, 100).map(c => ({ id: c.id, name: c.name, universe: c.universe }));
        const aiPrompt = `Eres el asistente maestro de emparejamientos y Power Scaling del APEX ENGINE.
Analiza la siguiente solicitud del usuario en lenguaje natural:
"${promptText.trim()}"

Lista de personajes de muestra:
${JSON.stringify(characterNames)}

Extrae en JSON:
{
  "mode": "1v1" | "boss" | "team" | "battleRoyale",
  "scenarioName": "nombre de la arena o null",
  "charA": { "id": "id del personaje", "requestedForm": "nombre o null" },
  "charB": { "id": "id del personaje", "requestedForm": "nombre o null" },
  "missingCharacters": ["Nombres que no existen en el roster"]
}`;

        const response = await SimulationEngine.queryAiDirectly(aiPrompt, aiConfig, true);
        if (response) {
          const match = response.match(/\{[\s\S]*\}/);
          if (match) {
            const aiJson = JSON.parse(match[0]);
            if (aiJson.charA?.id && !localParsed.charA) localParsed.charA = { id: aiJson.charA.id, character: characters.find(c => c.id === aiJson.charA.id) };
            if (aiJson.charB?.id && !localParsed.charB) localParsed.charB = { id: aiJson.charB.id, character: characters.find(c => c.id === aiJson.charB.id) };
            if (Array.isArray(aiJson.missingCharacters) && aiJson.missingCharacters.length > 0) {
              localParsed.missingCharacters = Array.from(new Set([...(localParsed.missingCharacters || []), ...aiJson.missingCharacters]));
            }
          }
        }
      }
    } catch (err) {
      console.warn('AI prompt query fell back to internal parser:', err);
    }

    setAnalyzedMatch(localParsed);
    setMissingChars(localParsed.missingCharacters || []);
    SoundFX.playMenuClick?.();
    setIsAnalyzing(false);
  };

  // Generate missing character on the fly with APEX rules
  const handleGenerateMissing = async (missingName) => {
    setIsGeneratingChar(prev => ({ ...prev, [missingName]: true }));
    try {
      let createdChar = null;

      // Try AI generation first
      if (aiConfig && aiConfig.apiKey) {
        try {
          const createdList = await SimulationEngine.batchParseCharactersWithAi(
            `Crea una ficha canónica de Power Scaling extremadamente detallada para el personaje: ${missingName}.
Incluye transformaciones, Tier oficial, velocidades, hax, arsenal y debilidades.`,
            aiConfig
          );
          if (createdList && createdList.length > 0) {
            createdChar = createdList[0];
          }
        } catch (e) {
          console.warn('AI generation fell back to APEX template builder:', e);
        }
      }

      // If AI was offline or empty, use APEX rule generator
      if (!createdChar) {
        createdChar = generateApexDetailedCharacter({
          name: missingName,
          universe: newCharUniverse,
          suggestedTier: newCharTier,
          concept: `Combatiente What-If generado para: ${promptText}`
        });
      }

      if (createdChar) {
        onSaveNewCharacter(createdChar);
        setMissingChars(prev => prev.filter(n => n !== missingName));

        // Auto-assign into analyzed match
        if (analyzedMatch) {
          if (!analyzedMatch.charA) analyzedMatch.charA = { id: createdChar.id, name: createdChar.name, character: createdChar };
          else if (!analyzedMatch.charB) analyzedMatch.charB = { id: createdChar.id, name: createdChar.name, character: createdChar };
          setAnalyzedMatch({ ...analyzedMatch });
        }

        SoundFX.playBetWin?.();
        alert(`¡Ficha de "${createdChar.name}" [Tier ${createdChar.tier}] generada con éxito y añadida al Roster!`);
      }
    } catch (e) {
      alert('Error generando personaje: ' + e.message);
    } finally {
      setIsGeneratingChar(prev => ({ ...prev, [missingName]: false }));
    }
  };

  // Apply to Arena
  const handleApply = (autoStart = false) => {
    if (!analyzedMatch) return;
    onApplyMatchup(analyzedMatch, autoStart);
    SoundFX.playStartBattle?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-purple-500/50 rounded-2xl p-6 max-w-3xl w-full max-h-[92vh] overflow-y-auto space-y-5 shadow-[0_0_50px_rgba(168,85,247,0.3)] font-mono text-xs animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
              <Wand2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-cinzel tracking-wider flex items-center gap-2">
                🪄 Match por Prompt IA & Orquestador What-If
              </h3>
              <p className="text-[10px] text-slate-400">
                Escribe en lenguaje natural cualquier combate o premisa. La IA seleccionará luchadores, formas, escenario, objetos y eventos Oráculo automáticamente.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Input Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
              💬 Escribe tu Matchup, Premisa What-If o Reglas Especiales:
            </label>
            <span className="text-[9.5px] text-slate-400">
              Detecta luchadores, formas, mapas, Semillas Senzu y Oráculo
            </span>
          </div>

          <textarea
            rows={3}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Ejemplo: Pon a Goku Mini SSJ3 Daima vs Lord Boros en el Domo de Namek con una Semilla del Ermitaño y gravedad cero..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-slate-100 font-mono text-xs focus:border-purple-500 focus:outline-none leading-relaxed"
          />

          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="text-[9.5px] text-slate-400 flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50">1v1</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/50">Boss Raid</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50">Equipos</span>
              <span className="px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/50">Battle Royale</span>
            </div>

            <button
              disabled={isAnalyzing || !promptText.trim()}
              onClick={handleAnalyzePrompt}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-950/80 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Interpretando y Configurando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ Interpretar & Organizar Batalla</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Example Prompts */}
        <div className="space-y-1.5 pt-2 border-t border-slate-900">
          <span className="text-[9.5px] font-bold text-slate-400 block">💡 Ejemplos Rápidos de Inspiración:</span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPromptText(qp)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-slate-300 transition cursor-pointer text-left"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Matchup Preview */}
        {analyzedMatch && (
          <div className="space-y-3 pt-3 border-t border-slate-800 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-3">
              
              {/* Badges Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-purple-300 uppercase flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-pink-400" />
                    Modo: <span className="text-white font-mono bg-purple-900/60 px-2 py-0.5 rounded border border-purple-500/50">{analyzedMatch.mode.toUpperCase()}</span>
                  </span>
                  {analyzedMatch.scenarioName && (
                    <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {analyzedMatch.scenarioName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {analyzedMatch.modifiers?.allowExternalItems && (
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      🍃 Semilla Senzu Activa
                    </span>
                  )}
                  {analyzedMatch.modifiers?.prepTime && analyzedMatch.modifiers.prepTime !== 'Sin Preparación (Encuentro Espontáneo)' && (
                    <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-bold">
                      ⏱️ {analyzedMatch.modifiers.prepTime}
                    </span>
                  )}
                  {analyzedMatch.selectedOracleEvents?.length > 0 && (
                    <span className="text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded font-bold">
                      🔮 Oráculo ({analyzedMatch.selectedOracleEvents.length})
                    </span>
                  )}
                </div>
              </div>

              {/* Roster Matchup Elements */}
              <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2 text-[11px]">
                {analyzedMatch.mode === '1v1' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Fighter A */}
                    <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 space-y-1">
                      <span className="text-red-400 font-bold block text-[10px]">🔴 CONTENDIENTE A:</span>
                      <p className="text-white font-bold text-xs">{analyzedMatch.charA?.name || 'Por definir'}</p>
                      {analyzedMatch.charA?.character && (
                        <p className="text-[10px] text-slate-400">
                          Tier: <strong className="text-amber-300">{analyzedMatch.charA.character.tier}</strong> | Forma: {analyzedMatch.charA.requestedForm || 'Base'}
                        </p>
                      )}
                    </div>

                    {/* Fighter B */}
                    <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/40 space-y-1">
                      <span className="text-blue-400 font-bold block text-[10px]">🔵 CONTENDIENTE B:</span>
                      <p className="text-white font-bold text-xs">{analyzedMatch.charB?.name || 'Por definir'}</p>
                      {analyzedMatch.charB?.character && (
                        <p className="text-[10px] text-slate-400">
                          Tier: <strong className="text-amber-300">{analyzedMatch.charB.character.tier}</strong> | Forma: {analyzedMatch.charB.requestedForm || 'Base'}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {analyzedMatch.mode === 'boss' && (
                  <div className="space-y-2">
                    <div className="p-2 rounded bg-amber-950/30 border border-amber-800/40">
                      <p className="text-amber-400 font-bold">👑 Jefe Supremo (Boss): {analyzedMatch.boss?.name || 'Boss'}</p>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <p className="text-slate-300 text-[10px]">
                        ⚔️ Escuadra Asaltante: {(analyzedMatch.squad || []).filter(Boolean).map(s => s?.name || s?.id || 'Asaltante').join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {analyzedMatch.mode === 'team' && (
                  <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                    <div className="p-2 rounded bg-blue-950/30 border border-blue-800/40">
                      <span className="font-bold text-blue-400 block mb-0.5">🛡️ Equipo Alfa:</span>
                      {(analyzedMatch.teamA || []).filter(Boolean).map(m => m?.name || m?.id || 'Alfa').join(', ')}
                    </div>
                    <div className="p-2 rounded bg-red-950/30 border border-red-800/40">
                      <span className="font-bold text-red-400 block mb-0.5">⚔️ Equipo Omega:</span>
                      {(analyzedMatch.teamB || []).filter(Boolean).map(m => m?.name || m?.id || 'Omega').join(', ')}
                    </div>
                  </div>
                )}

                {analyzedMatch.mode === 'battleRoyale' && (
                  <div className="space-y-1">
                    <span className="font-bold text-purple-300 block">👑 Gladiadores en la Arena:</span>
                    <p className="text-slate-300 text-[10px]">
                      {(analyzedMatch.battleRoyale || []).filter(Boolean).map(m => m?.name || m?.id || 'Gladiador').join(' ⚡ ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Missing Characters Alert and Instant APEX Generator */}
              {missingChars.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-300 text-[10.5px] font-bold">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Personajes no encontrados en el Roster:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[9.5px] text-slate-400">Tier Sugerido:</label>
                      <select
                        value={newCharTier}
                        onChange={(e) => setNewCharTier(e.target.value)}
                        className="bg-slate-900 text-yellow-300 text-[10px] px-2 py-0.5 rounded border border-slate-700"
                      >
                        {['10-C', '8-C', '7-A', '6-A', '5-A', '4-B', '3-A', '2-C', '1-C', '0'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {missingChars.map((missingName, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <div>
                          <span className="text-white font-bold text-xs">{missingName}</span>
                          <span className="text-[9.5px] text-slate-400 block">Se generará con Arsenal, Hax, Stats y Reglas APEX</span>
                        </div>
                        <button
                          disabled={isGeneratingChar[missingName]}
                          onClick={() => handleGenerateMissing(missingName)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[10px] transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-purple-950/60"
                        >
                          {isGeneratingChar[missingName] ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Generando Ficha APEX...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              <span>✨ Generar Ficha Completa</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What-If Narrative Premise Context */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-[9.5px] font-bold text-slate-400 block uppercase">📜 Premisa / Reglas What-If que se inyectarán a Laguna:</span>
                <p className="text-slate-300 text-[10px] leading-relaxed italic">
                  "{analyzedMatch.modifiers?.customContext || promptText}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-2.5 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleApply(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Configurar en Arena</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApply(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/80 transition cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>🚀 Aplicar & Simular Ahora Mismo</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
