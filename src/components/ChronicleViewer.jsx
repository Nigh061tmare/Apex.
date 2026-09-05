import React, { useState, useEffect, useMemo } from 'react';
import {
  CHRONICLE_VERSION,
  CHRONICLE_CONTINUITY_MODES,
  SCENE_TYPES,
  RELATIONSHIP_TYPES,
  CHRONICLE_TONES,
  CHRONICLE_PRESET_TEMPLATES,
  CHRONICLE_RULES_PRESETS,
  generateSceneBranchOptions,
  createTrainingProgressState,
  createFactionState,
  createNPCState,
  createChronicleScene,
  createChronicleState,
  advanceChronicleScene,
  compactChronicleHistory,
  generateChronicleRecap,
  BIOMECHANICAL_CONDITIONS,
  TACTICAL_ACTIONS,
  ENVIRONMENTAL_HAZARDS,
  rollTacticalContingency,
  applyBiomechanicalInjury,
  healCharacterInjuries
} from '../lib/chronicleContracts';
import {
  BookOpen, Brain, FolderArchive, Bookmark, Sparkles, Swords, Shield, Activity, Flame, RefreshCw,
  Download, Plus, CheckCircle2, AlertTriangle, Users, Target,
  ChevronRight, Layers, Compass, Scroll, Award, HeartHandshake, Zap,
  X, History, FileText, Play, RotateCcw, Package, Search, Trash2,
  Wand2, ArrowRight, Dna, Crown, ShieldAlert, Heart, Trophy,
  Dices, HeartPulse, EyeOff, PackageCheck, Mountain
} from 'lucide-react';
import { SimulationEngine } from '../services/simulationEngine';
import { SoundFX } from '../services/soundFx';
import CampaignVaultModal from './CampaignVaultModal';
import ChronicleNarrativeView from './ChronicleNarrativeView';

const STORAGE_KEY = 'apex_chronicle_active_campaign_v1';
const STORAGE_KEY_CAMPAIGNS_VAULT = 'apex_chronicles_vault_v1';

export default function ChronicleViewer({ characters = [], lang = 'es', onLaunchCombat, aiConfig = null }) {
  const [chronicle, setChronicle] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load saved chronicle, initializing default:', e);
    }
    const initialTmpl = CHRONICLE_PRESET_TEMPLATES[0];
    const initial = createChronicleState({
      title: initialTmpl.title,
      premise: initialTmpl.premise,
      tone: initialTmpl.tone,
      continuityMode: initialTmpl.continuityMode,
      initialCast: initialTmpl.suggestedCast,
      currentLocation: initialTmpl.startingLocation,
      allCharacters: characters
    });
    if (initialTmpl.initialArtifacts) {
      initial.inventory = [...initialTmpl.initialArtifacts];
    }
    return initial;
  });

  const [activeTab, setActiveTab] = useState('narrative'); // 'narrative', 'director', 'cast_factions', 'training', 'inventory'
  const [selectedTemplate, setSelectedTemplate] = useState('torneo_multiversal');
  const [sceneType, setSceneType] = useState('combate_rapido');
  const [customSceneTitle, setCustomSceneTitle] = useState('');
  const [userGuidance, setUserGuidance] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  
  // Modals
  const [recapModalOpen, setRecapModalOpen] = useState(false);
  const [recapText, setRecapText] = useState('');
  const [customCampaignModalOpen, setCustomCampaignModalOpen] = useState(false);
  const [campaignVaultOpen, setCampaignVaultOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(null);
  const [savedCampaigns, setSavedCampaigns] = useState(() => {
    try {
      const vault = localStorage.getItem(STORAGE_KEY_CAMPAIGNS_VAULT);
      if (vault) {
        const parsed = JSON.parse(vault);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error loading campaigns vault:', e);
    }
    return [];
  });
  const [addCharModalOpen, setAddCharModalOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [isGeneratingAiNovella, setIsGeneratingAiNovella] = useState(false);
  const [isGeneratingSceneAi, setIsGeneratingSceneAi] = useState(false);

  // Search & Inputs
  const [newThreadInput, setNewThreadInput] = useState('');
  const [newFactionName, setNewFactionName] = useState('');
  const [newFactionLeader, setNewFactionLeader] = useState('');
  const [newFactionAlignment, setNewFactionAlignment] = useState('Neutral');
  const [charSearchQuery, setCharSearchQuery] = useState('');
  const [universeFilter, setUniverseFilter] = useState('ALL');

  // Custom Campaign Forge State
  const [forgeTitle, setForgeTitle] = useState('');
  const [forgePremise, setForgePremise] = useState('');
  const [forgeTone, setForgeTone] = useState(CHRONICLE_TONES[0]);
  const [forgeMode, setForgeMode] = useState(CHRONICLE_CONTINUITY_MODES.CANON_PLUS);
  const [forgeRulePreset, setForgeRulePreset] = useState(CHRONICLE_RULES_PRESETS[0].id);
  const [forgeLocation, setForgeLocation] = useState('Santuario Interuniversal');
  const [forgeSelectedCast, setForgeSelectedCast] = useState([]);
  const [forgeSearch, setForgeSearch] = useState('');
  const [forgePromptIdea, setForgePromptIdea] = useState('');
  const [isGeneratingCampaignWithAi, setIsGeneratingCampaignWithAi] = useState(false);

  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('consumible');
  const [newItemEffect, setNewItemEffect] = useState('');
  const [newItemUses, setNewItemUses] = useState(1);

  // Tactical Contingencies & D20 State
  const [tacticalModalOpen, setTacticalModalOpen] = useState(false);
  const [tacticalActorId, setTacticalActorId] = useState('');
  const [tacticalTargetId, setTacticalTargetId] = useState('');
  const [tacticalActionId, setTacticalActionId] = useState('emboscada');
  const [tacticalHazardId, setTacticalHazardId] = useState('ninguno');
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [lastTacticalRoll, setLastTacticalRoll] = useState(() => chronicle?.lastTacticalRoll || null);

  // Sync tactical actors when active cast loads/changes
  useEffect(() => {
    if (chronicle?.activeCast && chronicle.activeCast.length > 0) {
      if (!tacticalActorId || !chronicle.activeCast.includes(tacticalActorId)) {
        setTacticalActorId(chronicle.activeCast[0]);
      }
      if (!tacticalTargetId || !chronicle.activeCast.includes(tacticalTargetId)) {
        setTacticalTargetId(chronicle.activeCast[1] || chronicle.activeCast[0]);
      }
    }
  }, [chronicle?.activeCast]);

  // Auto-persist chronicle and synchronize with Campaigns Vault
  useEffect(() => {
    if (chronicle) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chronicle));

        // Auto-sync into savedCampaigns vault
        const campId = chronicle.campaignId || chronicle.chronicleId || 'camp-default';
        setSavedCampaigns(prev => {
          const index = prev.findIndex(c => (c.campaignId === campId) || (c.chronicleId === campId));
          const updatedEntry = { ...chronicle, campaignId: campId, updatedAt: Date.now() };
          let next;
          if (index >= 0) {
            next = [...prev];
            next[index] = { ...next[index], ...updatedEntry };
          } else {
            next = [updatedEntry, ...prev];
          }
          try {
            localStorage.setItem(STORAGE_KEY_CAMPAIGNS_VAULT, JSON.stringify(next));
          } catch {}
          return next;
        });
      } catch (e) {
        console.error('Failed to persist chronicle state:', e);
      }
    }
  }, [chronicle]);

  // Character lookup map
  const charMap = useMemo(() => {
    const map = new Map();
    characters.forEach(c => map.set(c.id, c));
    return map;
  }, [characters]);

  // Distinct universes for filtering
  const allUniverses = useMemo(() => {
    const set = new Set();
    characters.forEach(c => {
      if (c.universe) set.add(c.universe);
    });
    return Array.from(set).sort();
  }, [characters]);

  // Filtered characters for recruiter
  const filteredRecruitList = useMemo(() => {
    const q = charSearchQuery.toLowerCase().trim();
    return characters.filter(c => {
      const matchUni = universeFilter === 'ALL' || c.universe === universeFilter;
      const matchName = !q || (c.name || '').toLowerCase().includes(q) || (c.id || '').toLowerCase().includes(q);
      const notInCast = !(chronicle.activeCast || []).includes(c.id);
      return matchUni && matchName && notInCast;
    }).slice(0, 40);
  }, [characters, charSearchQuery, universeFilter, chronicle.activeCast]);

  // Filtered characters for campaign forge
  const filteredForgeList = useMemo(() => {
    const q = forgeSearch.toLowerCase().trim();
    return characters.filter(c => {
      const matchName = !q || (c.name || '').toLowerCase().includes(q) || (c.universe || '').toLowerCase().includes(q);
      const notSelected = !forgeSelectedCast.includes(c.id);
      return matchName && notSelected;
    }).slice(0, 30);
  }, [characters, forgeSearch, forgeSelectedCast]);

  // Branch options
  const branchOptions = useMemo(() => {
    return generateSceneBranchOptions(chronicle, sceneType);
  }, [chronicle, sceneType]);

  // Vault: Save current campaign explicitly
  const handleSaveCampaignToVault = (manual = true) => {
    const campId = chronicle.campaignId || chronicle.chronicleId || `camp-${Date.now()}`;
    const entry = {
      ...chronicle,
      campaignId: campId,
      updatedAt: Date.now()
    };
    
    setSavedCampaigns(prev => {
      const idx = prev.findIndex(c => (c.campaignId === campId) || (c.chronicleId === campId));
      let next;
      if (idx >= 0) {
        next = [...prev];
        next[idx] = { ...next[idx], ...entry };
      } else {
        next = [entry, ...prev];
      }
      try {
        localStorage.setItem(STORAGE_KEY_CAMPAIGNS_VAULT, JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (manual) {
      SoundFX?.playLevelUp?.();
      setSaveToast(`¡Campaña "${chronicle.title}" guardada con éxito en la Bóveda!`);
      setTimeout(() => setSaveToast(null), 3500);
    }
  };

  // Vault: Load a campaign
  const handleLoadCampaign = (target) => {
    if (!target) return;
    setChronicle(target);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
    } catch {}
    setSaveToast(`Campaña "${target.title}" cargada. ¡Continuando historia!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Vault: Delete a campaign
  const handleDeleteCampaign = (targetId) => {
    setSavedCampaigns(prev => {
      const next = prev.filter(c => c.campaignId !== targetId && c.chronicleId !== targetId);
      try {
        localStorage.setItem(STORAGE_KEY_CAMPAIGNS_VAULT, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Vault: Toggle Favorite
  const handleToggleFavoriteCampaign = (targetId) => {
    setSavedCampaigns(prev => {
      const next = prev.map(c => {
        if (c.campaignId === targetId || c.chronicleId === targetId) {
          return { ...c, isFavorite: !c.isFavorite };
        }
        return c;
      });
      try {
        localStorage.setItem(STORAGE_KEY_CAMPAIGNS_VAULT, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Vault: Import a campaign
  const handleImportCampaign = (imported) => {
    if (!imported || typeof imported !== 'object') return;
    const campId = imported.campaignId || imported.chronicleId || `camp-${Date.now()}`;
    const normalized = {
      ...imported,
      campaignId: campId,
      updatedAt: Date.now()
    };
    setChronicle(normalized);
    setSavedCampaigns(prev => {
      const next = [normalized, ...prev.filter(c => c.campaignId !== campId && c.chronicleId !== campId)];
      try {
        localStorage.setItem(STORAGE_KEY_CAMPAIGNS_VAULT, JSON.stringify(next));
      } catch {}
      return next;
    });
    setSaveToast(`¡Campaña "${normalized.title}" importada y cargada con éxito!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Vault: Clear all campaigns
  const handleClearAllCampaigns = () => {
    setSavedCampaigns([]);
    try {
      localStorage.removeItem(STORAGE_KEY_CAMPAIGNS_VAULT);
    } catch {}
  };

  // Helper to load template
  const handleLoadTemplate = (tmplId) => {
    const tmpl = CHRONICLE_PRESET_TEMPLATES.find(t => t.templateId === tmplId);
    if (!tmpl) return;
    if (window.confirm(`¿Iniciar una nueva campaña con la plantilla "${tmpl.title}"? Esto sobreescribirá la campaña activa no exportada.`)) {
      const newState = createChronicleState({
        title: tmpl.title,
        premise: tmpl.premise,
        tone: tmpl.tone,
        continuityMode: tmpl.continuityMode,
        initialCast: tmpl.suggestedCast,
        currentLocation: tmpl.startingLocation,
        allCharacters: characters
      });
      if (tmpl.initialArtifacts) {
        newState.inventory = [...tmpl.initialArtifacts];
      }
      setChronicle(newState);
      setSelectedTemplate(tmplId);
    }
  };

  // AI-Powered Campaign Forge Generator & Brainstormer
  const handleGenerateCampaignWithAi = async () => {
    if (isGeneratingCampaignWithAi) return;
    setIsGeneratingCampaignWithAi(true);
    SoundFX?.playPowerUp?.();

    const seed = forgePromptIdea.trim();
    const prompt = `Eres el Maestro Narrador de Campañas de APEX Powerscaling Engine. 
Crea una campaña original y apasionante para el modo de Crónicas de Dragon Ball y el Multiverso.
${seed ? `IDEA O SEMILLA PROPORCIONADA POR EL USUARIO: "${seed}"` : 'Genera una idea original fascinante (ej: línea temporal divergente, guerra dimensional, entrenamiento mítico o torneo cósmico).'}

Debes responder ÚNICAMENTE con un bloque JSON válido con este formato exacto (sin texto adicional fuera del JSON):
{
  "title": "Título épico de la campaña",
  "premise": "Sinopsis detallada de la trama (2-3 párrafos), explicando el catalizador, facciones enfrentadas y el objetivo supremo.",
  "tone": "Uno de: ${CHRONICLE_TONES.join(' | ')}",
  "continuityMode": "Uno de: canon_plus | what_if_multiverse | tournament_open | au_alternate_timeline",
  "startingLocation": "Nombre del escenario inicial (ej: Casa del Maestro Roshi, Planeta Sagrado, etc.)",
  "rulePreset": "Uno de: standard | hardcore_survival | tournament_rules | war_attrition",
  "characterKeywords": ["palabras clave de 3 a 5 personajes ideales de Dragon Ball, ej: goku, vegeta, piccolo, roshi, raditz"]
}`;

    let aiOutput = null;
    const charEngine = aiConfig?.characterEngine || aiConfig?.simulationEngine || aiConfig;

    try {
      const raw = await SimulationEngine.callAiApi(prompt, charEngine, true);
      if (raw) {
        const cleanJson = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        const match = cleanJson.match(/\{[\s\S]*\}/);
        if (match) {
          aiOutput = JSON.parse(match[0]);
        }
      }
    } catch (e) {
      console.warn('AI campaign generation fallback to procedural:', e);
    }

    if (!aiOutput || !aiOutput.title) {
      const proceduralPresets = [
        {
          title: seed ? `Crónica: ${seed.slice(0, 35)}` : 'Dragon Ball: El Destino Silencioso',
          premise: 'En el Año 761, la ausencia imprevista de Raditz deja a la Tierra en una paz ininterrumpida tras el 23° Torneo de las Artes Marciales. Sin embargo, anomalías en el espacio profundo y la detección de energías dormidas obligan a Goku, Piccolo y los Guerreros Z a forjar nuevas sendas marciales antes de que el destino cósmico reclame su tributo.',
          tone: 'Épico y Competitivo',
          continuityMode: 'canon_plus',
          startingLocation: 'Casa Del Maestro Roshi',
          rulePreset: 'standard',
          characterKeywords: ['goku', 'piccolo', 'krilin', 'roshi', 'raditz']
        },
        {
          title: 'La Sombra de los Makaioshin: El Sello del Reino Oscuro',
          premise: 'Fisuras dimensionales en los pilares del cosmos liberan una estirpe olvidada de hechiceros y deidades demoníacas. Los guerreros mortales deben forjar una tregua sin precedentes para contener la corrupción de la energía Kiri antes del eclipse estelar.',
          tone: 'Grimdark y Supervivencia Extrema',
          continuityMode: 'what_if_multiverse',
          startingLocation: 'Plataforma Celeste en Ruinas — Templo Sagrado',
          rulePreset: 'hardcore_survival',
          characterKeywords: ['goku', 'vegeta', 'piccolo', 'dabura', 'gohan']
        },
        {
          title: 'El Torneo del Vacío Infinito: Retorno de los Campeones',
          premise: 'Los Vargas y los Grandes Sacerdotes erigen una arena neutral donde combatientes de todas las eras compiten bajo arbitraje estricto para definir la custodia de las Super Esferas del Dragón.',
          tone: 'Épico y Competitivo',
          continuityMode: 'tournament_open',
          startingLocation: 'Arena del Vacío Cósmico (Dimensión Cero)',
          rulePreset: 'tournament_rules',
          characterKeywords: ['goku', 'vegeta', 'jiren', 'broly', 'trunks']
        }
      ];
      aiOutput = proceduralPresets[Math.floor(Math.random() * proceduralPresets.length)];
    }

    // Apply to forge form fields
    setForgeTitle(aiOutput.title || 'Nueva Campaña Épica');
    setForgePremise(aiOutput.premise || '');
    if (aiOutput.tone) setForgeTone(aiOutput.tone);
    if (aiOutput.continuityMode) setForgeMode(aiOutput.continuityMode);
    if (aiOutput.startingLocation) setForgeLocation(aiOutput.startingLocation);
    if (aiOutput.rulePreset) setForgeRulePreset(aiOutput.rulePreset);

    // Auto-match and select matching characters from roster
    if (aiOutput.characterKeywords && Array.isArray(aiOutput.characterKeywords)) {
      const selectedIds = [];
      aiOutput.characterKeywords.forEach(kw => {
        const lowerKw = kw.toLowerCase().trim();
        const match = characters.find(c => 
          !selectedIds.includes(c.id) &&
          ((c.name || '').toLowerCase().includes(lowerKw) || (c.id || '').toLowerCase().includes(lowerKw))
        );
        if (match) selectedIds.push(match.id);
      });
      if (selectedIds.length > 0) {
        setForgeSelectedCast(selectedIds);
      }
    }

    setIsGeneratingCampaignWithAi(false);
    SoundFX?.playLevelUp?.();
  };

  // Helper to create custom campaign
  const handleCreateCustomCampaign = () => {
    if (!forgeTitle.trim()) {
      alert('Por favor, ingresa un título para la campaña.');
      return;
    }
    const finalCast = forgeSelectedCast.length > 0
      ? forgeSelectedCast
      : characters.slice(0, 3).map(c => c.id);

    const newState = createChronicleState({
      title: forgeTitle.trim(),
      premise: forgePremise.trim() || 'Una campaña original forjada con tus propias directrices y combatientes seleccionados.',
      tone: forgeTone,
      continuityMode: forgeMode,
      initialCast: finalCast,
      currentLocation: forgeLocation.trim() || 'Arena de Convergencia Cósmica',
      allCharacters: characters
    });

    const rulePreset = CHRONICLE_RULES_PRESETS.find(r => r.id === forgeRulePreset);
    newState.worldRules = rulePreset ? { ...rulePreset } : { id: 'custom' };
    newState.inventory = [
      { id: `art-senzu-${Date.now()}`, name: 'Bolsa de Semillas Senzu (3 uds)', type: 'consumible', effect: 'Restaura 100% de salud y remueve fatiga', uses: 3 },
      { id: `art-radar-${Date.now()}`, name: 'Radar de Resonancia Multiversal', type: 'herramienta', effect: 'Detecta firmas de Ki y anomalías de espacio-tiempo', uses: 99 }
    ];

    setChronicle(newState);
    setCustomCampaignModalOpen(false);
    alert(`¡Campaña "${forgeTitle}" forjada exitosamente con ${finalCast.length} combatientes activos!`);
  };

  // Recruiter actions
  const handleRecruitCharacter = (charId) => {
    if ((chronicle.activeCast || []).includes(charId)) return;
    const stateCopy = JSON.parse(JSON.stringify(chronicle));
    stateCopy.activeCast = [...(stateCopy.activeCast || []), charId];
    
    if (!stateCopy.characterStates[charId]) {
      const char = charMap.get(charId);
      stateCopy.characterStates[charId] = {
        recordId: charId,
        name: char?.name || charId,
        campaignStatus: 'active',
        location: stateCopy.currentLocation,
        partyId: 'party-main',
        relationships: {},
        currentGoal: 'Alinear fuerzas con el elenco principal y superar los límites del conflicto',
        shortTermCondition: 'Óptimo',
        injuries: [],
        recoveryProgress: 100
      };
    }

    const recruitedName = charMap.get(charId)?.name || charId;
    stateCopy.eventLog.push({
      eventId: `evt-recruit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      chapter: stateCopy.chapterNumber,
      scene: stateCopy.sceneNumber,
      summary: `Reclutamiento: ${recruitedName} se une al elenco activo de la crónica.`
    });

    setChronicle(stateCopy);
  };

  const handleDismissCharacter = (charId) => {
    if ((chronicle.activeCast || []).length <= 1) {
      alert('Debe haber al menos 1 combatiente activo en el elenco.');
      return;
    }
    const charName = charMap.get(charId)?.name || charId;
    if (window.confirm(`¿Desmovilizar a ${charName} del elenco activo? Podrás volver a reclutarlo cuando desees.`)) {
      const stateCopy = JSON.parse(JSON.stringify(chronicle));
      stateCopy.activeCast = stateCopy.activeCast.filter(id => id !== charId);
      setChronicle(stateCopy);
    }
  };

  // Item usage
  const handleUseItem = (itemId, targetCharId = null) => {
    const stateCopy = JSON.parse(JSON.stringify(chronicle));
    const itemIndex = (stateCopy.inventory || []).findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    const item = stateCopy.inventory[itemIndex];
    if (item.uses <= 0) return;

    item.uses -= 1;
    const targetName = targetCharId ? (charMap.get(targetCharId)?.name || targetCharId) : 'el elenco';

    if (targetCharId && stateCopy.characterStates[targetCharId]) {
      stateCopy.characterStates[targetCharId].shortTermCondition = 'Óptimo (Restaurado por Artefacto)';
      stateCopy.characterStates[targetCharId].injuries = [];
      stateCopy.characterStates[targetCharId].recoveryProgress = 100;
    }

    advanceChronicleScene(stateCopy, {
      title: `Uso de Artefacto: ${item.name}`,
      sceneType: 'rest_recovery',
      location: stateCopy.currentLocation,
      narrativeText: `En una pausa táctica de la campaña, se activa [${item.name}] sobre ${targetName}. ${item.effect}. Las reservas de combate se estabilizan.`,
      consequences: [`${targetName} recupera su vitalidad óptima`, `Quedan ${item.uses} usos de ${item.name}`],
      advanceChapter: false
    });

    if (item.uses <= 0) {
      stateCopy.inventory.splice(itemIndex, 1);
    }

    setChronicle(stateCopy);
  };

  const handleCreateNewItem = () => {
    if (!newItemName.trim()) return;
    const stateCopy = JSON.parse(JSON.stringify(chronicle));
    if (!stateCopy.inventory) stateCopy.inventory = [];
    stateCopy.inventory.push({
      id: `art-custom-${Date.now()}`,
      name: newItemName.trim(),
      type: newItemType,
      effect: newItemEffect.trim() || 'Efecto místico de combate o soporte',
      uses: Math.max(1, Number(newItemUses) || 1)
    });
    setChronicle(stateCopy);
    setNewItemName('');
    setNewItemEffect('');
    setNewItemUses(1);
    setAddItemModalOpen(false);
  };

  // Execute Tactical Contingency Roll (D20 Híbrido)
  const handleExecuteTacticalRoll = () => {
    if (!tacticalActorId || !tacticalTargetId) {
      alert('Selecciona un combatiente iniciador y un objetivo para la tirada táctica.');
      return;
    }
    setIsRollingDice(true);
    SoundFX?.playDiceRoll?.();

    setTimeout(() => {
      const actorChar = charMap.get(tacticalActorId) || { name: tacticalActorId };
      const targetChar = charMap.get(tacticalTargetId) || { name: tacticalTargetId };

      const rollResult = rollTacticalContingency({
        actorChar,
        targetChar,
        tacticId: tacticalActionId,
        hazardId: tacticalHazardId
      });

      const stateCopy = JSON.parse(JSON.stringify(chronicle));
      stateCopy.lastTacticalRoll = rollResult;

      // Apply biomechanical condition if result triggers injury
      if (rollResult.injuryToApply) {
        const victimId = rollResult.injuryToApply.target === 'actor' ? tacticalActorId : tacticalTargetId;
        applyBiomechanicalInjury(stateCopy, victimId, rollResult.injuryToApply.condition, rollResult.injuryToApply.desc);
      }

      setChronicle(stateCopy);
      setLastTacticalRoll(rollResult);
      setIsRollingDice(false);

      if (rollResult.isNat20) {
        SoundFX?.playLevelUp?.();
      } else if (rollResult.isNat1) {
        SoundFX?.playCriticalHit?.();
      } else if (rollResult.outcomeType === 'exito') {
        SoundFX?.playImpactBoom?.();
      } else {
        SoundFX?.playClick?.();
      }
    }, 450);
  };

  // Instant Healing of Character Injuries (Senzu / Tanque Médico)
  const handleHealCharacter = (charId) => {
    const stateCopy = JSON.parse(JSON.stringify(chronicle));
    const healItemIndex = (stateCopy.inventory || []).findIndex(
      item => item.id.includes('senzu') || item.type === 'medico' ||
      item.name.toLowerCase().includes('senzu') ||
      item.name.toLowerCase().includes('médico') ||
      item.name.toLowerCase().includes('tanque')
    );

    let sourceName = 'Tratamiento Médico Avanzado';
    if (healItemIndex !== -1) {
      const item = stateCopy.inventory[healItemIndex];
      sourceName = item.name;
      item.uses -= 1;
      if (item.uses <= 0) {
        stateCopy.inventory.splice(healItemIndex, 1);
      }
    }

    healCharacterInjuries(stateCopy, charId, sourceName);
    SoundFX?.playHeal?.();

    const charName = charMap.get(charId)?.name || charId;
    advanceChronicleScene(stateCopy, {
      title: `Tratamiento Médico Inmediato: ${charName}`,
      sceneType: 'rest_recovery',
      location: stateCopy.currentLocation,
      narrativeText: `El personal médico y los aliados de la campaña asisten a ${charName} aplicando [${sourceName}]. El tratamiento regenerativo sella fisuras internas, repara tejidos dañados y purifica los canales de Ki, erradicando todas las secuelas biomecánicas acumuladas. Vitalidad restaurada al 100%.`,
      consequences: [`${charName} ha sanado todas sus lesiones biomecánicas`, `Condición actual: Óptima`],
      advanceChapter: false
    });

    setChronicle(stateCopy);
  };

  // Advance scene (Powered by AI Narrator)
  const handleAdvanceScene = async (overrideType = null, extraData = {}) => {
    if (isGeneratingSceneAi || isGeneratingAiNovella) return;
    const effectiveType = overrideType || sceneType;
    const loc = customLocation.trim() || chronicle.currentLocation || 'Arena Interuniversal';
    const title = customSceneTitle.trim() || (extraData.title || `Capítulo ${chronicle.chapterNumber}: ${SCENE_TYPES[effectiveType]?.name || 'Incidente Multiversal'}`);

    const castChars = (chronicle.activeCast || []).map(id => charMap.get(id)).filter(Boolean);
    const castNames = castChars.map(c => `${c.name} (${c.universe || 'DB'} · ${c.tier || 'Tier ?'})`).join(', ');

    let narrativeText = extraData.narrativeText || '';

    // If no pre-baked narrative is provided, generate dynamically with AI Engine!
    if (!narrativeText) {
      setIsGeneratingSceneAi(true);
      SoundFX?.playPowerUp?.();

      const lastRoll = chronicle.lastTacticalRoll;
      const recentHistory = (chronicle.history || []).slice(-3).map(h => `- Cap. ${h.chapter}: ${h.title} (${(h.narrative || '').slice(0, 120)}...)`).join('\n');
      const simEngine = aiConfig?.simulationEngine || aiConfig?.characterEngine || aiConfig;

      const promptScene = `Eres el Maestro Narrador Cinematográfico de APEX Crónicas.
Redacta la escena narrativa para el CAPÍTULO ${chronicle.chapterNumber} de la campaña.

DATOS DE LA CAMPAÑA:
- Título de la Campaña: "${chronicle.title}"
- Premisa / Sinopsis: ${chronicle.premise}
- Tono Narrativo: ${chronicle.tone}
- Ubicación Actual: ${loc}
- Formato / Tipo de Escena: ${SCENE_TYPES[effectiveType]?.name || effectiveType}
- Elenco de Combatientes en Escena:
${castChars.map(c => {
  const cState = chronicle.characterStates?.[c.id] || {};
  const injuries = (cState.injuries || []).map(i => i.name).join(', ');
  return `  • ${c.name} [Tier: ${c.tier || '?'}, Ki: ${c.kiNumeric || 'N/A'}] — Condición: ${cState.shortTermCondition || 'Óptimo'}${injuries ? ` (Lesiones: ${injuries})` : ''}`;
}).join('\n')}

${lastRoll ? `CONTINGENCIA TÁCTICA ACTIVA:
${lastRoll.actorName} ejecutó [${lastRoll.tactic.name}] contra ${lastRoll.targetName}.
Resultado de la tirada D20: ${lastRoll.outcomeBadge} (${lastRoll.outcomeLabel}) — ${lastRoll.outcomeDesc}.` : ''}

${userGuidance.trim() ? `DIRECTRIZ DEL DIRECTOR / GIRO TÁCTICO: "${userGuidance.trim()}"` : ''}

${recentHistory ? `HISTORIAL DE CAPÍTULOS RECIENTES:\n${recentHistory}` : ''}

REGLAS NARRATIVAS OBLIGATORIAS:
1. Redacta de 3 a 5 párrafos ricos y cinematográficos (400 a 700 palabras), con prosa inmersiva en español y diálogos con guión largo (—).
2. SÉ 100% FIEL A LA PREMISA de la campaña ("${chronicle.title}"). No inventes situaciones genéricas. Si la premisa es una vida pacífica en Kame House o la ausencia de Raditz, narra exactamente esa situación familiar o la tensión subyacente. Si es combate, narra la coreografía exacta de los combatientes presentes.
3. Incorpora las técnicas canónicas de los personajes en **negrita**.
4. Culmina con un gancho dramático para el siguiente capítulo.`;

      try {
        const aiResponse = await SimulationEngine.callAiApi(promptScene, simEngine);
        if (aiResponse && typeof aiResponse === 'string' && aiResponse.trim().length > 60) {
          narrativeText = aiResponse.trim();
        }
      } catch (e) {
        console.warn('AI Scene generation failed, using dynamic contextual fallback:', e);
      } finally {
        setIsGeneratingSceneAi(false);
      }
    }

    if (!narrativeText) {
      const f1 = castChars[0]?.name || 'Los combatientes';
      const f2 = castChars[1]?.name || 'los aliados';
      switch (effectiveType) {
        case 'training':
          narrativeText = `Bajo la atmósfera de ${loc}, ${f1} y ${f2} profundizan en las directrices de "${chronicle.title}". Mediante un entrenamiento de flujo de Ki milimétrico, calibran sus reflejos ante las amenazas que acechan en el horizonte del arco.`;
          break;
        case 'brief_combat':
        case 'tournament_match':
        case 'eternity_oracle_battle':
          narrativeText = `El conflicto estalla en ${loc} en el marco de "${chronicle.title}". ${f1} y ${f2} intercambian ráfagas fulgurantes y fintas sónicas. La colisión de sus auras conmociona el terreno, probando la determinación de ambas partes.`;
          break;
        case 'political_faction':
        case 'diplomatic_negotiation':
          narrativeText = `En ${loc}, las palabras definen el destino de la campaña "${chronicle.title}". ${f1} expone su postura mientras ${f2} sopesa los riesgos de una ruptura definitiva.`;
          break;
        case 'exploration':
        case 'investigation':
          narrativeText = `Una inspección minuciosa en ${loc} revela secretos latentes sobre "${chronicle.title}". ${f1} detecta vestigios de Ki y anomalías dimensionales que alteran los planes previstos.`;
          break;
        case 'rest_recovery':
          narrativeText = `La calma se asienta brevemente en ${loc}. ${f1} y ${f2} recuperan el aliento y procesan los sucesos recientes antes de encarar la próxima fase de la contienda.`;
          break;
        default:
          narrativeText = `Los acontecimientos de "${chronicle.title}" se intensifican en ${loc}. ${userGuidance ? 'Directriz activa: ' + userGuidance + '. ' : ''}${f1} y ${f2} maniobran con cautela hacia el nuevo desenlace.`;
          break;
      }
    }

    if (userGuidance.trim() && !narrativeText.includes(userGuidance.trim())) {
      narrativeText += `\n\n[Evolución táctica del Director: ${userGuidance.trim()}]`;
    }

    const stateCopy = JSON.parse(JSON.stringify(chronicle));
    advanceChronicleScene(stateCopy, {
      title,
      sceneType: effectiveType,
      location: loc,
      narrativeText,
      consequences: extraData.consequences || [`Capítulo ${chronicle.chapterNumber} desarrollado en ${loc}`],
      advanceChapter: true
    });

    setChronicle(stateCopy);
    setCustomSceneTitle('');
    setUserGuidance('');
    SoundFX?.playCombatHit?.();
  };

  // Generate Epic AI Novella Chapter (4 Actos Literarios, tokens extendidos 65k-131k)
  const handleGenerateAiNovella = async () => {
    if (isGeneratingAiNovella || isGeneratingSceneAi) return;
    setIsGeneratingAiNovella(true);
    SoundFX?.playPowerUp?.();

    const loc = customLocation.trim() || chronicle.currentLocation || 'Arena Interuniversal';
    const effectiveTitle = customSceneTitle.trim() || `Capítulo ${chronicle.chapterNumber}: Resonancia de Destinos`;
    const castChars = (chronicle.activeCast || []).map(id => charMap.get(id)).filter(Boolean);
    const castRosterSummary = castChars.map(c => `${c.name} (${c.universe} - ${c.tier || 'Tier Desconocido'})`).join('; ');

    // Detailed Biomechanical Health & Injuries
    const castHealthAndInjuriesSummary = castChars.map(c => {
      const cState = chronicle.characterStates?.[c.id] || {};
      const injuryList = (cState.injuries || []).map(i => `${i.name} [${i.severity || 'Grave'}] (${i.statPenalty}, ${i.chaptersRemaining} caps restantes)`).join(', ');
      return `• ${c.name} [Tier ${c.tier}]: Condición: ${cState.shortTermCondition || 'Óptimo'}${injuryList ? ` | Heridas Biomecánicas: ${injuryList}` : ' | Sin lesiones activas'}`;
    }).join('\n');

    // Factions & Vault Artifacts
    const factionsSummary = (chronicle.factions || []).map(f => `• ${f.name} [${f.alignment}]: Líder ${f.leaderRecordId || 'N/A'}`).join('; ');
    const inventorySummary = (chronicle.inventory || []).map(i => `• ${i.name} (${i.uses} usos restantes): ${i.effect}`).join('; ');

    // Last D20 Tactical Contingency Roll if any
    const lastRoll = chronicle.lastTacticalRoll;
    const tacticalDirective = lastRoll ? `
=== RESOLUCIÓN DE CONTINGENCIA TÁCTICA D20 EN ESCENA ===
Iniciador: ${lastRoll.actorName} | Objetivo: ${lastRoll.targetName}
Maniobra Ejecutada: [${lastRoll.tactic.name}] (Dificultad: ${lastRoll.tactic.difficulty})
Factor de Entorno: [${lastRoll.hazard.name}] (Modificador: ${lastRoll.hazardMod})
Tirada D20: ${lastRoll.d20} + Modificadores (BIQ/Entorno/Tier) = Total ${lastRoll.total}
Dictamen Táctico: ${lastRoll.outcomeBadge} — ${lastRoll.outcomeLabel}
Desenlace de la Jugada: ${lastRoll.outcomeDesc}
${lastRoll.injuryToApply ? `CONSECUENCIA BIOMECÁNICA: ${lastRoll.injuryToApply.target === 'actor' ? lastRoll.actorName : lastRoll.targetName} sufre ${lastRoll.injuryToApply.desc}.` : ''}
` : '';

    const promptNovella = `Eres el Gran Cronista de APEX Crónicas. Redacta el CAPÍTULO ${chronicle.chapterNumber} titulado "${effectiveTitle}" en formato de NOVELA ÉPICA CINEMATOGRÁFICA Y DE ACCIÓN TÁCTICA (2.000 a 4.000 palabras de prosa literaria, aprovechando la ventana extendida de 65.536 a 131.072 tokens).
CAMPAÑA: "${chronicle.title}"
PREMISA DEL ARCO: ${chronicle.premise}
TONO NARRATIVO: ${chronicle.tone}
ESCENARIO / LOCACIÓN: ${loc}
ELENCO ACTIVO EN ESCENA:
${castHealthAndInjuriesSummary || castRosterSummary}

FACCIONES ACTIVAS EN EL CONFLICTO:
${factionsSummary || 'Fuerzas independientes en pugna directa'}

ARTEFACTOS DISPONIBLES EN LA BÓVEDA:
${inventorySummary || 'Suministros de emergencia estándar'}

${tacticalDirective}
DIRECTRIZ TÁCTICA DEL DIRECTOR: ${userGuidance.trim() || 'Desarrolla las tensiones, la coreografía de alta velocidad y el choque marcial y filosófico entre los combatientes.'}

INSTRUCCIONES LITERARIAS ESTRICTAS DE 4 ACTOS:
- ACTO I: ENTORNO & DISTORSIÓN DEL ESPACIO. Describe la atmósfera sensorial de ${loc}, la presión gravitacional, y cómo las auras de ki deforman el horizonte y la materia circundante.
- ACTO II: ESCALADA CINÉTICA & COREOGRAFÍA MILIMÉTRICA. Narra el intercambio a velocidades extremas. Refleja fielmente cómo las heridas biomecánicas previas merman o condicionan los movimientos. ${lastRoll ? `Dramatiza paso a paso la maniobra [${lastRoll.tactic.name}] y cómo influye el resultado de la tirada (${lastRoll.outcomeBadge}).` : ''}
- ACTO III: CLÍMAX DE TÉCNICAS & CHOQUE DE PODER. Despliegue de los ataques insignia con sus nombres canónicos en **negrita**, colapso de energías destructivas y desenlace del asalto principal.
- ACTO IV: BALANCE BIOMECÁNICO & REPERCUSIONES CÓSMICAS. Describe las secuelas corporales reales, el desgaste de stamina, las miradas de los espectadores/facciones y un gancho dramático para el siguiente capítulo.

ESTILO: Prosa inmersiva en español neutro de alta calidad. Diálogos viscerales con guión largo (—). NO uses jerga de videojuegos como 'HP' o 'puntos de daño'.`;

    let narrativeResult = '';
    const simEngine = aiConfig?.simulationEngine || aiConfig;

    try {
      narrativeResult = await SimulationEngine.callAiApi(promptNovella, simEngine);
    } catch (e) {
      console.warn('AI call for chronicle novella fallback to procedural:', e);
    }

    if (!narrativeResult || typeof narrativeResult !== 'string' || narrativeResult.trim().length < 80) {
      const f1 = castChars[0]?.name || 'El campeón de la vanguardia';
      const f2 = castChars[1]?.name || 'El adversario cósmico';
      const hazardName = lastRoll?.hazard?.name || 'la arena interdimensional';

      narrativeResult = `### ACTO I: EL HORIZONTE FRACTURADO\n\n` +
        `La densidad del éter en ${loc} descendió a niveles asfixiantes. Los monolitos rocosos y las gradas flotantes vibraron con un zumbido subatómico a medida que ${f1} y ${f2} liberaron la primera pulsación de sus auras. Bajo la influencia de ${hazardName}, las líneas de gravedad se curvaron visiblemente; el aire ionizado desprendía chispas incandescentes que se desintegraban antes de tocar el suelo vitrificado.\n\n` +
        `—Creíste que el desenlace de esta era se escribiría con cautela —irrumpió ${f2}, cuya mirada traspasaba las corrientes de calor residual—. Cada segundo que prolongas este combate es una concesión a lo inevitable.\n\n` +
        `—No medimos el combate en segundos, sino en la solidez de nuestras convicciones —respondió ${f1}, afirmando su postura con un estallido sónico que pulverizó la gravedad circundante.\n\n` +
        `### ACTO II: DINÁMICA DE IMPACTO & RESOLUCIÓN TÁCTICA\n\n` +
        `En una diezmilésima de segundo, el espacio intermedio desapareció. La colisión inicial desató una onda de compresión que fracturó las capas atmosféricas. ${f1} ejecutó una secuencia de fintas cinéticas de alta frecuencia, alternando trayectorias en zigzag para sobrecargar la percepción sensorial del oponente. Sin embargo, las secuelas acumuladas en los asaltos previos comenzaron a cobrar su tributo biomecánico, forzando un ajuste milimétrico en el centro de gravedad.\n\n` +
        (lastRoll ? `Fue entonces cuando se activó la contingencia táctica: [${lastRoll.tactic.name}]. ${lastRoll.actorName} leyó con precisión quirúrgica el vector de inercia de ${lastRoll.targetName}, desatando la maniobra bajo las adversidades de ${lastRoll.hazard.name}. La tirada del destino dictaminó un ${lastRoll.outcomeBadge}: ${lastRoll.outcomeDesc}. El choque resultante torció la trayectoria del combate de manera irreversible.\n\n` : '') +
        `### ACTO III: EL VÓRTICE DEFINITIVO\n\n` +
        `La arena entera quedó sumergida en un resplandor cegador. ${f1} concentró el total de su flujo de Ki en el núcleo de sus palmas, condensando una esfera de plasma cuya masa gravitacional amenazaba con colapsar el cuadrante. Con un rugido gutural que resonó a través de los doce planos existenciales, desató su técnica definitiva: **Impacto Trascendental Supremo**.\n\n` +
        `Al otro extremo, ${f2} no cedió un ápice de terreno. Alzando una barrera de energía prismática reforzada con su aura destructiva más pura, intentó desviar la columna de plasma. La colisión de ambos poderes generó un domo de silencio absoluto antes de que la detonación expulsara una tormenta de escombros cuánticos contra los escudos perimetrales de la arena.\n\n` +
        `### ACTO IV: BALANCE BIOMECÁNICO & SECUELAS\n\n` +
        `Cuando el humo ionizado se disipó lentamente, el silencio volvió a gobernar ${loc}. Los dos guerreros permanecían en pie, pero el tributo físico era innegable: respiraciones entrecortadas, filamentos musculares desgarrados y quemaduras por fricción de aura en ambos costados. ${userGuidance ? `La directriz del conflicto se cumplió con creces: ${userGuidance}. ` : ''}Las facciones espectadoras comprendieron de inmediato que el equilibrio de poder había cambiado para siempre, y que el próximo capítulo exigirá medidas extremas para evitar el colapso definitivo.`;
    }

    const stateCopy = JSON.parse(JSON.stringify(chronicle));
    advanceChronicleScene(stateCopy, {
      title: effectiveTitle,
      sceneType: 'eternity_oracle_battle',
      location: loc,
      narrativeText: narrativeResult.trim(),
      consequences: [
        `Capítulo ${chronicle.chapterNumber} redactado con Novela Épica APEX (4 Actos).`,
        lastRoll ? `Resolución táctica integrada: [${lastRoll.tactic.name}] -> ${lastRoll.outcomeBadge}` : `Choque de titanes en ${loc} consolidado.`,
        `Presión ambiental extrema y desgaste biomecánico activo.`
      ],
      advanceChapter: true
    });

    setChronicle(stateCopy);
    setCustomSceneTitle('');
    setUserGuidance('');
    setIsGeneratingAiNovella(false);
    SoundFX?.playSuperAttack?.();
  };

  // Branch Selection click
  const handleSelectBranch = (branch) => {
    handleAdvanceScene(branch.sceneType, {
      title: `${branch.badge} — ${branch.title}`,
      consequences: [
        `Elección de Destino: [${branch.badge}] ${branch.title}`,
        `Resolución: ${branch.desc}`,
        `Impacto táctico: ${branch.risk}`
      ]
    });
  };

  // Universal Dojo Training & Awakening Handler for ANY character in the active cast
  const handleTrainCharacter = (charId, trainingType = 'ki_mastery') => {
    const stateCopy = JSON.parse(JSON.stringify(chronicle));
    if (!stateCopy.characterStates[charId]) {
      stateCopy.characterStates[charId] = {
        recordId: charId,
        trainingProgress: createTrainingProgressState({ targetFormId: 'universal_mastery' })
      };
    }
    const cState = stateCopy.characterStates[charId];
    const currentTraining = cState.trainingProgress || createTrainingProgressState({ targetFormId: 'universal_mastery' });
    const charName = charMap.get(charId)?.name || charId;

    let note = '';
    let actionTitle = '';
    let consequences = [];

    if (trainingType === 'ki_mastery') {
      const newMastery = Math.min(100, (currentTraining.masteryPercentage || 25) + 20);
      cState.trainingProgress = {
        ...currentTraining,
        masteryPercentage: newMastery,
        unlocked: newMastery >= 100,
        trainingNotes: `Control de flujo de Ki perfeccionado al ${newMastery}%.`
      };
      actionTitle = `Entrenamiento de Flujo de Ki — ${charName}`;
      note = `${charName} dedica una sesión intensiva a perfeccionar el control del Ki en ${stateCopy.currentLocation}. Afina su circulación energética, mitigando el desgaste de stamina y alcanzando un ${newMastery}% de maestría en combate sostenido.`;
      consequences = [`Maestría de Ki para ${charName} elevada a ${newMastery}%`, `Reducción de fatiga en próximos asaltos`];
      SoundFX?.playPowerUp?.();
    } else if (trainingType === 'battle_iq') {
      cState.bonusBIQ = (cState.bonusBIQ || 0) + 2;
      actionTitle = `Meditación Táctica & Análisis de Combate — ${charName}`;
      note = `${charName} entra en un estado de concentración profunda, analizando patrones de ataque, lectura de ki y puntos ciegos. Su agudeza táctica se agudiza notablemente (+2 BIQ en tiradas de contingencia D20).`;
      consequences = [`Battle IQ de ${charName} incrementado en +2 puntos permanentes`, `Mayor probabilidad de éxito en maniobras tácticas`];
      SoundFX?.playDiceRoll?.();
    } else if (trainingType === 'awakening') {
      const newMastery = Math.min(100, (currentTraining.masteryPercentage || 30) + 35);
      cState.trainingProgress = {
        ...currentTraining,
        masteryPercentage: newMastery,
        unlocked: true,
        trainingNotes: `Resonancia de Potencial Latente desatada al ${newMastery}%.`
      };
      actionTitle = `Despertar de Potencial Oculto — ${charName}`;
      note = `En un instante de máxima tensión emocional y concentración mística, ${charName} rompe las compuertas de su energía interna en ${stateCopy.currentLocation}. Su aura estalla con destellos incandescentes, liberando una fracción de su potencial dormido.`;
      consequences = [`Potencial Latente de ${charName} sincronizado al ${newMastery}%`, `Aura amplificada para los próximos capítulos`];
      SoundFX?.playAuraBurst?.();
    }

    advanceChronicleScene(stateCopy, {
      title: actionTitle,
      sceneType: 'training',
      location: stateCopy.currentLocation || 'Dojo de Campaña',
      narrativeText: note,
      consequences,
      advanceChapter: true
    });

    setChronicle(stateCopy);
  };

  // Normal SSJ backward-compatible alias
  const handleTrainNormalSSJ = (charId) => handleTrainCharacter(charId, 'ki_mastery');

  // Brief Combat resolution
  const handleQuickCombat = () => {
    if (!chronicle.activeCast || chronicle.activeCast.length < 2) {
      alert('Se requieren al menos 2 combatientes en el elenco para un combate breve.');
      return;
    }
    const c1 = charMap.get(chronicle.activeCast[0]) || { name: chronicle.activeCast[0], kiNumeric: 100000000 };
    const c2 = charMap.get(chronicle.activeCast[1]) || { name: chronicle.activeCast[1], kiNumeric: 95000000 };

    const c1Ki = Number(c1.kiNumeric) || 1;
    const c2Ki = Number(c2.kiNumeric) || 1;
    const winner = c1Ki >= c2Ki ? c1 : c2;
    const loser = c1Ki >= c2Ki ? c2 : c1;

    const combatConsequences = [
      `Encuentro resuelto: ${winner.name} se impone tácticamente ante ${loser.name}.`,
      `${loser.name} sufre fatiga moderada (+25%) e impacto muscular.`,
      `${winner.name} consume un 15% de reservas de stamina.`
    ];

    handleAdvanceScene('brief_combat', {
      title: `Duelo Relámpago: ${winner.name} vs ${loser.name}`,
      consequences: combatConsequences
    });
  };

  // Compact history
  const handleCompact = () => {
    const stateCopy = JSON.parse(JSON.stringify(chronicle));
    compactChronicleHistory(stateCopy);
    setChronicle(stateCopy);
    alert('¡Historial compactado exitosamente! Los capítulos antiguos se consolidaron en el resumen acumulado conservando la trazabilidad en el archivo histórico.');
  };

  // Generate recap
  const handleShowRecap = () => {
    const recap = generateChronicleRecap(chronicle);
    setRecapText(recap);
    setRecapModalOpen(true);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(chronicle, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `apex_chronicle_${chronicle.chronicleId || 'campaign'}.json`);
    dlAnchor.click();
  };

  // Export Markdown
  const handleExportMarkdown = () => {
    const recap = generateChronicleRecap(chronicle);
    let md = `# APEX CRÓNICAS V1 — ${chronicle.title}\n\n`;
    md += `**Arco:** ${chronicle.currentArc} | **Capítulo:** ${chronicle.chapterNumber} | **Tono:** ${chronicle.tone}\n`;
    md += `**Ubicación Actual:** ${chronicle.currentLocation}\n\n`;
    md += `## Premisa de Campaña\n${chronicle.premise}\n\n`;
    md += `## Resumen Histórico Acumulado\n${chronicle.historyDigest || 'Sin compactaciones previas.'}\n\n`;
    md += `## Capítulos & Escenas Archivadas\n`;
    (chronicle.chapterArchive || []).forEach(c => {
      md += `### [Cap. ${c.chapterNumber}, Esc. ${c.sceneNumber}] ${c.title}\n`;
      md += `*Tipo de Escena:* ${c.sceneType} | *Ubicación:* ${c.location}\n\n`;
      md += `${c.narrativeText}\n\n`;
      if (c.consequences?.length > 0) {
        md += `*Consecuencias:*\n` + c.consequences.map(con => `- ${con}`).join('\n') + `\n\n`;
      }
    });
    md += `\n\n${recap}\n`;

    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `apex_chronicle_${chronicle.chronicleId || 'campaign'}.md`);
    dlAnchor.click();
  };

  // Toggle thread
  const handleToggleThread = (index) => {
    const stateCopy = JSON.parse(JSON.stringify(chronicle));
    const current = stateCopy.openThreads[index];
    current.status = current.status === 'Abierto' ? 'Resuelto' : 'Abierto';
    setChronicle(stateCopy);
  };

  // Add thread
  const handleAddThread = () => {
    if (!newThreadInput.trim()) return;
    const stateCopy = JSON.parse(JSON.stringify(chronicle));
    stateCopy.openThreads.push({
      threadId: `thread_${Date.now()}`,
      title: newThreadInput.trim(),
      status: 'Abierto',
      sourceEvent: `Capítulo ${stateCopy.chapterNumber}`,
      participants: stateCopy.activeCast || []
    });
    setChronicle(stateCopy);
    setNewThreadInput('');
  };

  // Add faction
  const handleAddFaction = () => {
    if (!newFactionName.trim()) return;
    const stateCopy = JSON.parse(JSON.stringify(chronicle));
    if (!stateCopy.factions) stateCopy.factions = [];
    const fac = createFactionState({
      factionId: `faction_${Date.now()}`,
      name: newFactionName.trim(),
      leaderRecordId: newFactionLeader.trim() || 'Líder Desconocido',
      alignment: newFactionAlignment
    });
    stateCopy.factions.push(fac);
    setChronicle(stateCopy);
    setNewFactionName('');
    setNewFactionLeader('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-100 font-sans p-4">
      {/* Top Banner & Header */}
      <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                APEX CRÓNICAS V2 — CONTINUIDAD VIVA & MULTIVERSO
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                v{CHRONICLE_VERSION}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60">
                🎭 {chronicle.tone || 'Épico'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-emerald-400" />
              <span>{chronicle.title}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-3xl leading-relaxed">
              {chronicle.premise}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-center">
              <div className="text-slate-400 text-[10px] uppercase">Capítulo</div>
              <div className="text-lg font-black text-emerald-400">{chronicle.chapterNumber}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-center">
              <div className="text-slate-400 text-[10px] uppercase">Hilos Abiertos</div>
              <div className="text-lg font-black text-amber-400">
                {(chronicle.openThreads || []).filter(t => t.status === 'Abierto').length}
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-center">
              <div className="text-slate-400 text-[10px] uppercase">Elenco Activo</div>
              <div className="text-lg font-black text-cyan-400">{(chronicle.activeCast || []).length}</div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-center">
              <div className="text-slate-400 text-[10px] uppercase">Facciones</div>
              <div className="text-lg font-black text-purple-400">
                {(chronicle.factions || []).length}
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-center">
              <div className="text-slate-400 text-[10px] uppercase">Artefactos</div>
              <div className="text-lg font-black text-yellow-400">
                {(chronicle.inventory || []).length}
              </div>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCampaignVaultOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-600 hover:to-indigo-600 text-white font-bold shadow-md shadow-purple-950/50 transition cursor-pointer"
              title="Abrir la Bóveda de Campañas guardadas para reanudar o gestionar tus sagas"
            >
              <FolderArchive className="w-3.5 h-3.5 text-purple-200" />
              <span>📚 Mis Campañas ({savedCampaigns.length})</span>
            </button>

            <button
              onClick={() => handleSaveCampaignToVault(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-bold transition cursor-pointer"
              title="Guardar estado actual en la bóveda"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              <span>💾 Guardar</span>
            </button>

            <button
              onClick={() => setCustomCampaignModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-950/50 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>➕ Forjar Campaña</span>
            </button>

            <select
              value={selectedTemplate}
              onChange={(e) => handleLoadTemplate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer max-w-xs truncate"
            >
              {CHRONICLE_PRESET_TEMPLATES.map(t => (
                <option key={t.templateId} value={t.templateId}>
                  Saga: {t.title}
                </option>
              ))}
            </select>

            <button
              onClick={handleShowRecap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <Scroll className="w-3.5 h-3.5 text-amber-400" />
              <span>Recapitular</span>
            </button>

            <button
              onClick={handleCompact}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Compacta los capítulos antiguos en un resumen acumulado (>10 capítulos recomendados)"
            >
              <History className="w-3.5 h-3.5 text-purple-400" />
              <span>Compactar</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/50 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar MD</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/50 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exportar JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('narrative')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'narrative'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Historia & Archivo ({(chronicle.chapterArchive || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('director')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'director'
              ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-md shadow-red-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-amber-400" />
          <span>Director de Escenas & Bifurcaciones</span>
        </button>

        <button
          onClick={() => setActiveTab('cast_factions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'cast_factions'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Elenco ({(chronicle.activeCast || []).length}) & Facciones</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'inventory'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-purple-400" />
          <span>Bóveda & Artefactos ({(chronicle.inventory || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('training')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'training'
              ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-md shadow-amber-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span>Dojo & Despertar ({(chronicle.activeCast || []).length})</span>
        </button>
      </div>

      {/* TAB 1: HISTORIA & ARCHIVO */}
      {activeTab === 'narrative' && (
        <div className="space-y-6">
          {/* History Digest if available */}
          {chronicle.historyDigest && (
            <div className="bg-purple-950/20 border border-purple-500/40 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-2 text-purple-300 font-mono text-xs font-bold uppercase tracking-wider">
                <History className="w-4 h-4 text-purple-400" />
                <span>Resumen Histórico Acumulado (Compactación)</span>
              </div>
              <p className="text-sm text-purple-100/90 leading-relaxed whitespace-pre-wrap font-sans">
                {chronicle.historyDigest}
              </p>
            </div>
          )}

          {/* Chapters chronological list */}
          <div className="space-y-4">
            {(!chronicle.chapterArchive || chronicle.chapterArchive.length === 0) ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300">Campaña Lista para Iniciar</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Avanza a la pestaña "Director de Escenas" para componer el primer incidente, o selecciona una bifurcación inicial.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => handleAdvanceScene('brief_combat')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono shadow-lg transition cursor-pointer"
                  >
                    Desatar Primer Encuentro (Capítulo 1)
                  </button>
                  <button
                    onClick={handleGenerateAiNovella}
                    disabled={isGeneratingAiNovella}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xs font-mono shadow-lg transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-200" />
                    <span>{isGeneratingAiNovella ? 'Redactando...' : '🪄 Redactar Novela Cap. 1 (IA)'}</span>
                  </button>
                  <button
                    onClick={() => setCustomCampaignModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs font-mono border border-slate-700 transition cursor-pointer"
                  >
                    Personalizar Campaña
                  </button>
                </div>
              </div>
            ) : (
              chronicle.chapterArchive.slice().reverse().map((ch, idx) => {
                const scTypeInfo = SCENE_TYPES[ch.sceneType] || { name: ch.sceneType, color: 'blue' };
                return (
                  <div
                    key={ch.sceneId || idx}
                    className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-3 transition shadow-lg"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          CAPÍTULO {ch.chapterNumber} · ESCENA {ch.sceneNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {scTypeInfo.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          📍 {ch.location}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {ch.createdAt ? new Date(ch.createdAt).toLocaleTimeString() : 'En curso'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {ch.title}
                    </h3>

                    <ChronicleNarrativeView
                      text={ch.narrativeText}
                      title={ch.title}
                      isFirstChapter={idx === 0}
                    />

                    {ch.consequences && ch.consequences.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                          Impacto & Consecuencias:
                        </span>
                        <ul className="text-xs text-slate-400 space-y-0.5 list-disc list-inside font-mono">
                          {ch.consequences.map((cons, ci) => (
                            <li key={ci}>{cons}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DIRECTOR DE ESCENAS & BIFURCACIONES */}
      {activeTab === 'director' && (
        <div className="space-y-6">
          {/* Branching choices block */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  Bifurcaciones de Destino (Decide el Próximo Giro)
                </h2>
              </div>
              <span className="text-xs font-mono text-amber-400/90 font-bold">
                Capítulo #{chronicle.chapterNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {branchOptions.map(branch => (
                <div
                  key={branch.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/60 p-4 rounded-xl space-y-2.5 transition flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                        {branch.badge}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                      {branch.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {branch.desc}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 italic max-w-[200px] truncate">
                      {branch.risk}
                    </span>
                    <button
                      onClick={() => handleSelectBranch(branch)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-1 transition cursor-pointer shadow-md shadow-amber-950/50"
                    >
                      <span>Elegir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* D20 Tactical Contingency Engine Panel */}
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <Dices className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  🎲 Simulador de Contingencia Táctica & Entorno (D20 Híbrido)
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Arbitraje Táctico Antigravity V3
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Resuelve maniobras complejas (emboscadas, sellado Mafuba, trampas de gravedad o sobrecargas de Ki). No siempre vence el Tier más alto si hay factores de entorno o astucia táctica.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              {/* Actor Selector */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Combatiente Iniciador:</label>
                <select
                  value={tacticalActorId}
                  onChange={(e) => setTacticalActorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer truncate"
                >
                  {(chronicle.activeCast || []).map(id => {
                    const c = charMap.get(id) || { name: id };
                    return <option key={id} value={id}>{c.name}</option>;
                  })}
                </select>
              </div>

              {/* Target Selector */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Combatiente Objetivo:</label>
                <select
                  value={tacticalTargetId}
                  onChange={(e) => setTacticalTargetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer truncate"
                >
                  {(chronicle.activeCast || []).map(id => {
                    const c = charMap.get(id) || { name: id };
                    return <option key={id} value={id}>{c.name}</option>;
                  })}
                </select>
              </div>

              {/* Tactic Selector */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Maniobra Táctica:</label>
                <select
                  value={tacticalActionId}
                  onChange={(e) => setTacticalActionId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-amber-300 focus:outline-none focus:border-cyan-500 cursor-pointer truncate"
                >
                  {TACTICAL_ACTIONS.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Dif. {t.difficulty})</option>
                  ))}
                </select>
              </div>

              {/* Hazard Selector */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Factor de Entorno:</label>
                <select
                  value={tacticalHazardId}
                  onChange={(e) => setTacticalHazardId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-emerald-300 focus:outline-none focus:border-cyan-500 cursor-pointer truncate"
                >
                  {ENVIRONMENTAL_HAZARDS.map(h => (
                    <option key={h.id} value={h.id}>{h.name} ({h.modifier >= 0 ? `+${h.modifier}` : h.modifier})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Roll Trigger Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={handleExecuteTacticalRoll}
                disabled={isRollingDice}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-cyan-950/50 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Dices className={`w-4 h-4 text-slate-950 ${isRollingDice ? 'animate-spin' : ''}`} />
                <span>{isRollingDice ? 'Tirando dados D20...' : '🎲 Lanzar Tirada Táctica (D20)'}</span>
              </button>

              {lastTacticalRoll && (
                <div className="text-xs text-slate-400 font-mono">
                  Última tirada: <strong className="text-white">{lastTacticalRoll.tactic.name}</strong>
                </div>
              )}
            </div>

            {/* Display Roll Result */}
            {lastTacticalRoll && (
              <div className={`p-4 rounded-xl border transition animate-in fade-in duration-200 font-mono text-xs space-y-2.5 ${
                lastTacticalRoll.outcomeType === 'critico' ? 'bg-amber-950/40 border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.25)]' :
                lastTacticalRoll.outcomeType === 'pifia' ? 'bg-red-950/40 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]' :
                lastTacticalRoll.outcomeType === 'exito' ? 'bg-emerald-950/40 border-emerald-500/60' :
                lastTacticalRoll.outcomeType === 'parcial' ? 'bg-cyan-950/40 border-cyan-500/60' :
                'bg-slate-950/70 border-slate-800'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-white">
                      D20: {lastTacticalRoll.d20}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      + BIQ ({lastTacticalRoll.biqMod}) + Entorno ({lastTacticalRoll.hazardMod}) + Brecha Tier ({lastTacticalRoll.tierDiff}) = <strong className="text-white">Total: {lastTacticalRoll.total}</strong>
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded shadow-sm">
                    {lastTacticalRoll.outcomeBadge}
                  </span>
                </div>

                <div className="text-slate-200 text-xs font-sans leading-relaxed">
                  {lastTacticalRoll.outcomeDesc}
                </div>

                {lastTacticalRoll.injuryToApply && (
                  <div className="p-2 rounded-lg bg-red-950/50 border border-red-500/50 text-red-300 text-[11px] flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>
                      Consecuencia Biomecánica aplicada: <strong>{lastTacticalRoll.injuryToApply.desc}</strong> (Registrado en el estado del combatiente).
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detailed Scene Composer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5 bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Compositor Libre de Escena (12 Arquetipos)</span>
                </h3>
              </div>

              {/* Scene Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-slate-400 font-bold">
                  Arquetipo Narrativo:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {Object.entries(SCENE_TYPES).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setSceneType(key)}
                      className={`p-2 rounded-lg border text-left transition cursor-pointer text-xs font-mono ${
                        sceneType === key
                          ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-md shadow-emerald-950/50 font-bold'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Location & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-400">Título de la Escena:</label>
                  <input
                    type="text"
                    value={customSceneTitle}
                    onChange={(e) => setCustomSceneTitle(e.target.value)}
                    placeholder={`Capítulo ${chronicle.chapterNumber}: ${SCENE_TYPES[sceneType]?.name || 'Escena'}`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-400">Ubicación Actual:</label>
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder={chronicle.currentLocation || 'Arena Interuniversal'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* User Guidance Prompt */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">
                  Directriz Táctica / Giro del Usuario:
                </label>
                <textarea
                  rows="3"
                  value={userGuidance}
                  onChange={(e) => setUserGuidance(e.target.value)}
                  placeholder="Ej: Goku U18 propone una tregua para evaluar las fluctuaciones de Ki del Dr. Raichi; Vegeta se niega y eleva su aura..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleAdvanceScene()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs shadow-lg shadow-emerald-950/50 transition cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Desplegar Escena</span>
                </button>

                <button
                  onClick={handleGenerateAiNovella}
                  disabled={isGeneratingAiNovella}
                  className={`flex items-center gap-2 py-3 px-4 rounded-xl border font-mono font-bold text-xs transition cursor-pointer shadow-lg ${
                    isGeneratingAiNovella
                      ? 'bg-purple-950 text-purple-300 border-purple-500/50 animate-pulse'
                      : 'bg-gradient-to-r from-purple-900/60 via-pink-950/60 to-purple-900/60 hover:from-purple-800/80 hover:to-pink-900/80 border-purple-500/50 text-purple-200 shadow-purple-950/40'
                  }`}
                  title="Genera una novela épica cinemática de múltiples actos para este capítulo aprovechando los tokens extendidos de salida"
                >
                  <Sparkles className={`w-4 h-4 text-pink-400 ${isGeneratingAiNovella ? 'animate-spin' : 'animate-pulse'}`} />
                  <span>{isGeneratingAiNovella ? 'Redactando...' : '🪄 Novela Épica (IA)'}</span>
                </button>

                <button
                  onClick={handleQuickCombat}
                  className="flex items-center gap-2 py-3 px-4 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-800/60 text-red-300 font-mono font-bold text-xs transition cursor-pointer"
                  title="Resuelve mecánicamente un combate breve entre los 2 primeros combatientes"
                >
                  <Swords className="w-4 h-4 text-red-400" />
                  <span>Combate Breve</span>
                </button>
              </div>
            </div>

            {/* Side status column */}
            <div className="space-y-5">
              {/* Open Threads Box */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hilos Narrativos Abiertos</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">
                    {(chronicle.openThreads || []).length} Total
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(chronicle.openThreads || []).length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Sin hilos abiertos.</p>
                  ) : (
                    chronicle.openThreads.map((thread, idx) => (
                      <div
                        key={thread.threadId || idx}
                        className="flex items-start justify-between gap-2 p-2 rounded bg-slate-950/60 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={thread.status === 'Resuelto'}
                            onChange={() => handleToggleThread(idx)}
                            className="mt-0.5 cursor-pointer"
                          />
                          <span className={thread.status === 'Resuelto' ? 'line-through text-slate-500' : 'text-slate-200'}>
                            {thread.title}
                          </span>
                        </div>
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          thread.status === 'Resuelto' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {thread.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <input
                    type="text"
                    value={newThreadInput}
                    onChange={(e) => setNewThreadInput(e.target.value)}
                    placeholder="Nuevo hilo narrativo..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddThread()}
                  />
                  <button
                    onClick={handleAddThread}
                    className="px-2 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-xs font-mono font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Continuity info */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-2 font-mono text-xs text-slate-400">
                <div className="text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                  Configuración de Campaña
                </div>
                <div className="text-emerald-400 font-bold">
                  {chronicle.continuityMode || 'Canon-Plus Abierto'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Tono: <span className="text-slate-300">{chronicle.tone}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Ubicación: <span className="text-slate-300">{chronicle.currentLocation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ELENCO & FACCIONES */}
      {activeTab === 'cast_factions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Cast Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Elenco de Combatientes Activos ({(chronicle.activeCast || []).length})</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500">Sincronizado con Roster V25</span>
              </div>
              <button
                onClick={() => setAddCharModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Reclutar Combatiente</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {(chronicle.activeCast || []).map(charId => {
                const char = charMap.get(charId) || { name: charId, tier: '3-C', universe: 'Multiverso', forms: [] };
                const cState = chronicle.characterStates?.[charId] || {};
                return (
                  <div
                    key={charId}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 text-xs font-mono space-y-2 transition shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="text-sm">{char.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {char.universe || 'Universo'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          Tier {char.tier}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDismissCharacter(charId)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900 transition cursor-pointer"
                        title="Desmovilizar del elenco activo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Objetivo: <span className="text-slate-300 italic">{cState.currentGoal || 'Explorar y combatir'}</span>
                    </div>

                    {/* Biomechanical Condition & Persistent Injuries */}
                    {cState.injuries && cState.injuries.length > 0 ? (
                      <div className="space-y-1.5 p-2 rounded-lg bg-red-950/40 border border-red-500/40 pt-1">
                        <div className="flex items-center justify-between text-[10px] text-red-300 font-bold uppercase">
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            <span>Lesiones Biomecánicas Persistentes:</span>
                          </span>
                          <button
                            onClick={() => handleHealCharacter(charId)}
                            className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1 cursor-pointer shadow text-[9.5px]"
                            title="Sanar de inmediato con Semilla Senzu o Tanque Médico de la Bóveda"
                          >
                            <HeartPulse className="w-2.5 h-2.5" />
                            <span>Curar (Senzu / Tanque)</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {cState.injuries.map(inj => (
                            <span key={inj.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] bg-red-900/60 border border-red-700/60 text-red-200">
                              <strong>{inj.name}</strong>
                              <span className="text-amber-300 font-mono">({inj.chaptersRemaining} cap restantes)</span>
                              <span className="text-slate-400">[{inj.statPenalty}]</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-900">
                        <span className="text-slate-500">Condición: <strong className="text-emerald-400 font-bold">{cState.shortTermCondition || 'Óptimo'}</strong></span>
                        <span className="text-slate-500">Formas: {char.forms?.length || 1} registradas</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Factions Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>Facciones & Geopolítica Cósmica ({(chronicle.factions || []).length})</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-500">Alianzas y tensiones</span>
              </div>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {(!chronicle.factions || chronicle.factions.length === 0) ? (
                <p className="text-xs text-slate-500 italic p-4 text-center">Sin facciones registradas.</p>
              ) : (
                chronicle.factions.map(fac => (
                  <div
                    key={fac.factionId}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{fac.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                        {fac.alignment || 'Neutral'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Líder: <strong className="text-slate-200">{fac.leaderRecordId || 'Sin líder explícito'}</strong>
                    </div>
                    {fac.controlledLocations?.length > 0 && (
                      <div className="text-[10px] text-slate-500">
                        Territorios: {fac.controlledLocations.join(', ')}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add Faction Box */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5 text-xs font-mono">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Fundar Nueva Facción</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newFactionName}
                  onChange={(e) => setNewFactionName(e.target.value)}
                  placeholder="Nombre de facción..."
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  value={newFactionLeader}
                  onChange={(e) => setNewFactionLeader(e.target.value)}
                  placeholder="Líder (ej: Bills)..."
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
                <select
                  value={newFactionAlignment}
                  onChange={(e) => setNewFactionAlignment(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Héroes / Protectores">Héroes / Protectores</option>
                  <option value="Neutral Táctico">Neutral Táctico</option>
                  <option value="Rival / Beligerante">Rival / Beligerante</option>
                  <option value="Antagonista Cósmico">Antagonista Cósmico</option>
                </select>
              </div>
              <button
                onClick={handleAddFaction}
                className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold cursor-pointer transition shadow"
              >
                Fundar Facción
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BÓVEDA DE ARTEFACTOS */}
      {activeTab === 'inventory' && (
        <div className="bg-slate-900/90 border border-purple-500/40 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                <span>Bóveda de Artefactos & Reliquias de Campaña</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Objetos especiales consumibles y herramientas que alteran el curso de las escenas.
              </p>
            </div>
            <button
              onClick={() => setAddItemModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Reliquia</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(!chronicle.inventory || chronicle.inventory.length === 0) ? (
              <div className="col-span-full py-12 text-center text-slate-500 italic font-mono bg-slate-950/60 rounded-xl border border-slate-800">
                Sin artefactos en la bóveda de esta campaña.
              </div>
            ) : (
              chronicle.inventory.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/60 space-y-2.5 font-mono text-xs shadow flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{item.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold uppercase">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.effect}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[11px] text-amber-400 font-bold">
                      Usos restantes: {item.uses}
                    </span>
                    <button
                      onClick={() => handleUseItem(item.id, chronicle.activeCast?.[0])}
                      className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Activar Objeto
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DOJO UNIVERSAL & EVOLUCIÓN DEL ELENCO */}
      {activeTab === 'training' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Banner del Dojo */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shadow-inner">
                  <Flame className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white tracking-wide uppercase font-serif">
                      Dojo de Campaña & Evolución del Elenco
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      Campamento Táctico
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl font-mono leading-relaxed">
                    Evolución individual para los combatientes activos de la campaña. Afina el flujo de Ki, entrena la agudeza táctica con bonificaciones permanentes al <strong>D20 de Contingencia</strong>, despierta potenciales latentes y regenera traumatismos biomecánicos.
                  </p>
                </div>
              </div>

              {/* Métricas del Campamento */}
              <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 font-mono text-xs">
                <div className="text-center px-2">
                  <div className="text-[10px] text-slate-400 uppercase">Luchadores</div>
                  <div className="text-amber-400 font-bold text-base">{(chronicle.activeCast || []).length}</div>
                </div>
                <div className="w-[1px] h-7 bg-slate-800" />
                <div className="text-center px-2">
                  <div className="text-[10px] text-slate-400 uppercase">Ubicación Actual</div>
                  <div className="text-emerald-400 font-bold text-xs truncate max-w-[130px]" title={chronicle.currentLocation}>
                    {chronicle.currentLocation || 'Desconocida'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listado de Combatientes del Elenco Activo */}
          {(chronicle.activeCast || []).length === 0 ? (
            <div className="bg-slate-900/60 border border-dashed border-slate-700/80 rounded-2xl p-12 text-center space-y-4">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-300">No hay combatientes en el elenco activo</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Añade personajes a la campaña desde la pestaña "Elenco & Facciones" o forja una nueva campaña para desbloquear las sesiones de entrenamiento.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('cast')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition inline-flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Ir al Elenco de la Campaña</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(chronicle.activeCast || []).map(charId => {
                const char = charMap.get(charId) || { name: charId, universe: 'Multiverso' };
                const cState = chronicle.characterStates?.[charId] || {};
                const training = cState.trainingProgress || createTrainingProgressState({
                  targetFormId: 'universal_mastery',
                  masteryPercentage: 25,
                  activationTurnsRequired: 4
                });
                const hasInjuries = (cState.injuries || []).length > 0;
                const bonusBIQ = cState.bonusBIQ || 0;

                return (
                  <div
                    key={charId}
                    className={`bg-slate-900/90 rounded-2xl p-5 border transition-all duration-300 shadow-xl space-y-4 flex flex-col justify-between ${
                      hasInjuries
                        ? 'border-red-500/50 hover:border-red-400/80 shadow-red-950/20'
                        : 'border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    {/* Header Combatiente */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white text-base tracking-wide">{char.name}</span>
                            {bonusBIQ > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60 font-mono text-[10px] font-bold" title="Bonificador permanente para tiradas D20 tácticas">
                                +{bonusBIQ} BIQ D20
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                            <span className="text-amber-400 font-bold">{char.universe || 'Multiverso'}</span>
                            <span>•</span>
                            <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-bold">Tier {char.tier || '4-B'}</span>
                            {char.baseKi && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-400">Ki: {typeof char.baseKi === 'number' ? (char.baseKi >= 1e9 ? `${(char.baseKi/1e9).toFixed(2)}B` : `${(char.baseKi/1e6).toFixed(2)}M`) : char.baseKi}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Estado Biomecánico Badge */}
                        <div className="text-right flex flex-col items-end gap-1">
                          {hasInjuries ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold bg-red-950 text-red-300 border border-red-800 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              <span>{cState.injuries.length} Lesión(es)</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-mono">
                              {cState.shortTermCondition || 'ÓPTIMO'}
                            </span>
                          )}
                          <span className={`text-[9.5px] font-mono font-bold ${training.unlocked ? 'text-amber-300' : 'text-slate-500'}`}>
                            {training.unlocked ? '⚡ DESPERTADO' : 'EN DESARROLLO'}
                          </span>
                        </div>
                      </div>

                      {/* Lesiones Biomecánicas Activas */}
                      {hasInjuries && (
                        <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-2.5 space-y-2 font-mono text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-red-300 uppercase font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              <span>Heridas de Campaña Persistentes:</span>
                            </span>
                            <button
                              onClick={() => handleHealCharacter(charId)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition text-[10px] flex items-center gap-1 cursor-pointer shadow"
                              title="Curar inmediatamente con Semilla Senzu / Tanque Médico"
                            >
                              <HeartPulse className="w-3 h-3" />
                              <span>Senzu / Tanque Médico</span>
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {cState.injuries.map(inj => (
                              <span key={inj.id} className="text-[9.5px] px-2 py-0.5 rounded bg-red-900/60 border border-red-700/60 text-red-200">
                                <strong>{inj.name}</strong> ({inj.chaptersRemaining} caps) [{inj.statPenalty}]
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Barra de Progreso de Maestría */}
                      <div className="space-y-1.5 font-mono pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>Maestría de Combate & Ki:</span>
                          </span>
                          <span className="font-bold text-amber-400">{training.masteryPercentage || 25}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                          <div
                            className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full transition-all duration-500 rounded-full"
                            style={{ width: `${training.masteryPercentage || 25}%` }}
                          />
                        </div>
                      </div>

                      {/* Notas de Entrenamiento */}
                      <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
                        {training.trainingNotes || 'El guerrero equilibra su respiración y refina sus técnicas características para el próximo arco narrativo.'}
                      </div>
                    </div>

                    {/* Acciones de Entrenamiento del Dojo */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleTrainCharacter(charId, 'ki_mastery')}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-amber-600/90 text-slate-200 hover:text-white transition font-mono text-[11px] flex flex-col items-center justify-center gap-1 border border-slate-700/80 hover:border-amber-400 cursor-pointer text-center group"
                        title="Perfecciona el flujo y la resistencia de energía (+20% maestría)"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:text-white" />
                        <span className="font-bold">Flujo de Ki</span>
                        <span className="text-[9px] text-slate-400 group-hover:text-amber-200">+20% Maestría</span>
                      </button>

                      <button
                        onClick={() => handleTrainCharacter(charId, 'battle_iq')}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-purple-600/90 text-slate-200 hover:text-white transition font-mono text-[11px] flex flex-col items-center justify-center gap-1 border border-slate-700/80 hover:border-purple-400 cursor-pointer text-center group"
                        title="Meditación táctica que concede +2 permanente a las tiradas D20 en contingencias"
                      >
                        <Brain className="w-3.5 h-3.5 text-purple-400 group-hover:text-white" />
                        <span className="font-bold">Meditación BIQ</span>
                        <span className="text-[9px] text-slate-400 group-hover:text-purple-200">+2 Tiradas D20</span>
                      </button>

                      <button
                        onClick={() => handleTrainCharacter(charId, 'awakening')}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600/90 text-slate-200 hover:text-white transition font-mono text-[11px] flex flex-col items-center justify-center gap-1 border border-slate-700/80 hover:border-emerald-400 cursor-pointer text-center group"
                        title="Despierta el potencial latente aumentando masivamente la maestría y desbloqueando auras"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                        <span className="font-bold">Despertar</span>
                        <span className="text-[9px] text-slate-400 group-hover:text-emerald-200">+35% Potencial</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: FORJAR CAMPAÑA PERSONALIZADA */}
      {customCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-3xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Forja de Campaña Personalizada (Lienzo Abierto)</span>
              </div>
              <button
                onClick={() => setCustomCampaignModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Assistant Banner in Campaign Forge */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-teal-950/70 to-slate-950 border border-emerald-500/50 space-y-2.5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Asistente de Creación de Campañas (IA)
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-bold">
                  Autocompletado & Brainstorming
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={forgePromptIdea}
                  onChange={(e) => setForgePromptIdea(e.target.value)}
                  placeholder="Idea o semilla (ej: Torneo en Kame House con villanos clásicos)..."
                  className="flex-1 bg-slate-950/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono w-full"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateCampaignWithAi()}
                />

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      const seeds = [
                        'Torneo en la Casa de Roshi con guerreros del Dragon Ball Clásico',
                        'Invasión Makaioshin al Reino de los Demonios y la Tierra',
                        'Guerra secreta entre los Seis Universos borrados por Zeno-Sama',
                        'Crisis temporal: Fu encadena las realidades de GT y Super',
                        'Goku y Piccolo atrapados en una dimensión hiperbólica de 500G'
                      ];
                      setForgePromptIdea(seeds[Math.floor(Math.random() * seeds.length)]);
                      SoundFX?.playClick?.();
                    }}
                    className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono font-bold transition cursor-pointer shrink-0"
                    title="Inspirar con una idea aleatoria"
                  >
                    🎲 Idea
                  </button>

                  <button
                    onClick={handleGenerateCampaignWithAi}
                    disabled={isGeneratingCampaignWithAi}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-bold text-xs shadow-md shadow-emerald-950 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-slate-950 ${isGeneratingCampaignWithAi ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingCampaignWithAi ? 'Forjando con IA...' : '🪄 Forjar con IA'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-slate-300 font-bold uppercase">Título de la Campaña:</label>
                <input
                  type="text"
                  value={forgeTitle}
                  onChange={(e) => setForgeTitle(e.target.value)}
                  placeholder="Ej: La Guerra del Vacío: Asedio a los 12 Universos"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-slate-300 font-bold uppercase">Premisa Narrativa / Sinopsis:</label>
                <textarea
                  rows="3"
                  value={forgePremise}
                  onChange={(e) => setForgePremise(e.target.value)}
                  placeholder="Describe la trama, el catalizador del conflicto, facciones en disputa y el objetivo supremo..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold uppercase">Tono Narrativo:</label>
                <select
                  value={forgeTone}
                  onChange={(e) => setForgeTone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {CHRONICLE_TONES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold uppercase">Modo de Continuidad:</label>
                <select
                  value={forgeMode}
                  onChange={(e) => setForgeMode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value={CHRONICLE_CONTINUITY_MODES.CANON_PLUS}>Canon-Plus (Expansión canónica)</option>
                  <option value={CHRONICLE_CONTINUITY_MODES.WHAT_IF_MULTIVERSE}>What-If Multiverso (Líneas divergentes)</option>
                  <option value={CHRONICLE_CONTINUITY_MODES.TOURNAMENT_OPEN}>Torneo Abierto (Reglas de certamen)</option>
                  <option value={CHRONICLE_CONTINUITY_MODES.AU_ALTERNATE_TIMELINE}>Línea Temporal Alterna (AU)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold uppercase">Ubicación Inicial:</label>
                <input
                  type="text"
                  value={forgeLocation}
                  onChange={(e) => setForgeLocation(e.target.value)}
                  placeholder="Ej: Planeta Sagrado de Bills"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold uppercase">Reglas del Mundo:</label>
                <select
                  value={forgeRulePreset}
                  onChange={(e) => setForgeRulePreset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {CHRONICLE_RULES_PRESETS.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Initial Cast Selector */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-bold uppercase">
                  Elenco Inicial Seleccionado ({forgeSelectedCast.length} Combatientes):
                </label>
                <span className="text-[10px] text-slate-500">Recomendado: 2 a 6 combatientes</span>
              </div>

              {/* Selected badges */}
              <div className="flex flex-wrap gap-2 min-h-10 p-2 bg-slate-950 rounded-xl border border-slate-800">
                {forgeSelectedCast.length === 0 ? (
                  <span className="text-xs text-slate-600 italic py-1">Busca y añade personajes abajo...</span>
                ) : (
                  forgeSelectedCast.map(cId => {
                    const c = charMap.get(cId) || { name: cId };
                    return (
                      <span
                        key={cId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold"
                      >
                        <span>{c.name}</span>
                        <button
                          onClick={() => setForgeSelectedCast(prev => prev.filter(id => id !== cId))}
                          className="hover:text-red-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>

              {/* Search characters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={forgeSearch}
                    onChange={(e) => setForgeSearch(e.target.value)}
                    placeholder="Buscar por nombre o universo en los 756 personajes..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                  {filteredForgeList.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setForgeSelectedCast(prev => [...prev, c.id])}
                      className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-emerald-500/60 text-left transition cursor-pointer text-xs"
                    >
                      <div className="font-bold text-white truncate">{c.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{c.universe} · Tier {c.tier}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setCustomCampaignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCustomCampaign}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                🚀 Forjar e Iniciar Campaña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RECLUTAR COMBATIENTE EN VIVO */}
      {addCharModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Reclutar Combatiente al Elenco Activo</span>
              </div>
              <button
                onClick={() => setAddCharModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={charSearchQuery}
                  onChange={(e) => setCharSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o ID..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={universeFilter}
                onChange={(e) => setUniverseFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="ALL">Todos los Universos ({allUniverses.length})</option>
                {allUniverses.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {filteredRecruitList.map(c => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/60 flex items-center justify-between gap-2"
                >
                  <div className="overflow-hidden">
                    <div className="font-bold text-white text-xs truncate">{c.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{c.universe} · Tier {c.tier}</div>
                  </div>
                  <button
                    onClick={() => {
                      handleRecruitCharacter(c.id);
                      setAddCharModalOpen(false);
                    }}
                    className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] shrink-0 cursor-pointer shadow"
                  >
                    + Reclutar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AÑADIR ARTEFACTO */}
      {addItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-purple-500/50 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Package className="w-5 h-5 text-purple-400" />
                <span>Añadir Reliquia a la Campaña</span>
              </div>
              <button
                onClick={() => setAddItemModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400">Nombre del Artefacto:</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ej: Esfera del Dragón de 4 Estrellas"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Tipo de Objeto:</label>
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1 cursor-pointer"
                >
                  <option value="consumible">Consumible (Senzu, Elixir)</option>
                  <option value="reliquia">Reliquia (Potara, Anillo)</option>
                  <option value="herramienta">Herramienta (Radar, Dispositivo)</option>
                  <option value="defensa">Defensa / Amuleto</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Efecto / Descripción:</label>
                <input
                  type="text"
                  value={newItemEffect}
                  onChange={(e) => setNewItemEffect(e.target.value)}
                  placeholder="Ej: Concede un deseo de restauración total al reunir 7"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Usos Disponibles:</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={newItemUses}
                  onChange={(e) => setNewItemUses(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setAddItemModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNewItem}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
              >
                Guardar en Bóveda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RECAPITULACIÓN OFICIAL */}
      {recapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-sm">
                <Scroll className="w-5 h-5" />
                <span>Recapitulación Oficial de la Crónica</span>
              </div>
              <button
                onClick={() => setRecapModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950 p-4 rounded-xl border border-slate-800 font-sans">
              {recapText}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setRecapModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs cursor-pointer"
              >
                Cerrar Recapitulación
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Global AI Generating Backdrop Overlay */}
      {(isGeneratingSceneAi || isGeneratingAiNovella) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-purple-500/60 p-8 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.4)] max-w-md w-full space-y-4 font-mono">
            <Sparkles className="w-12 h-12 text-pink-400 mx-auto animate-spin" />
            <h3 className="text-base font-bold text-white">
              {isGeneratingAiNovella ? '🪄 Redactando Novela Épica (4 Actos)...' : '✨ Redactando Escena con IA...'}
            </h3>
            <p className="text-xs text-purple-300">
              Motor: <span className="font-bold text-pink-300">{aiConfig?.simulationEngine?.model || 'NVIDIA Nemotron 3 Ultra 550B'}</span>
            </p>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 h-full w-full animate-pulse"></div>
            </div>
            <p className="text-[11px] text-slate-400">
              Generando coreografías milimétricas, prosa inmersiva y balance táctico...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
