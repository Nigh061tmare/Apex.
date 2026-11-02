import React, { useState } from 'react';
import { 
  X, Shield, Zap, Activity, Brain, AlertTriangle, ListPlus, Battery, 
  Dumbbell, Move, Swords, Book, Target, Sparkles, Users, Wrench, Flame, ShieldAlert, Cpu,
  RefreshCw, Image as ImageIcon, Palette, Globe, Languages, Check, ArrowRightLeft,
  ChevronLeft, ChevronRight, Plus, Trash2, Edit3, Eye, FolderPlus, Tag, Layers, Star, BookMarked
} from 'lucide-react';
import { SimulationEngine } from '../services/simulationEngine';
import { isCharacterInNeedsReview, getNeedsReviewWarningText } from '../services/needsReviewService';
import { translateCharacterSheet } from '../services/translatorService';
import { UNIVERSE_PRESETS } from '../services/franchiseHelper';
import { SoundFX } from '../services/soundFx';
import { getPowerLevelFormulaBreakdown } from '../services/scouterEngine';
import { resolveCombatState } from '../lib/combatStateResolver';
import { getBodilyForms, getExternalEntities, getExternalEntityUiModel } from '../lib/externalEntityFramework';
import CharacterCanonPanel from './CharacterCanonPanel';
import { TIER_ORDER, SCOUTER_ENERGY_ANCHORS } from '../lib/apexTierSystem';

const COMMON_HAX_TAGS = [
  'Negación de Durabilidad',
  'Manipulación Espacial',
  'Manipulación Temporal',
  'Borrado Existencial',
  'Inmunidad Mental',
  'Anulación de Regeneración',
  'Adaptación Reactiva',
  'Acausalidad',
  'Ataques Conceptuales',
  'Inducción de Muerte',
  'Intangibilidad',
  'Manipulación del Alma',
  'Absorción de Energía',
  'Inmunidad a Venenos/Miasmas',
  'Regeneración Acelerada',
  'Evolución en Combate',
  'Manipulación de Realidad',
  'Haki / Fuerza Espiritual',
  'Invulnerabilidad Condicional',
  'Ataques Dimensionales'
];

export default function CharacterModal({ character, onClose, onSave, isEditing = false, aiConfig, allCharacters = [], lang = 'es' }) {
  const [isEditingMode, setIsEditingMode] = useState(isEditing);
  const [activeTab, setActiveTab] = useState('basico');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageEngine, setImageEngine] = useState('pollinations'); // 'pollinations' | 'reforge'
  const [imageStyle, setImageStyle] = useState('shonen'); // 'shonen' | 'cinematic' | 'grimdark' | 'wiki'
  const [sdUrl, setSdUrl] = useState('http://127.0.0.1:7860');

  const [selectedReferenceCharId, setSelectedReferenceCharId] = useState('auto');

  const [originalFormData, setOriginalFormData] = useState(character ? JSON.parse(JSON.stringify(character)) : null);
  const [currentSheetLang, setCurrentSheetLang] = useState('es');
  const [isTranslatingSheet, setIsTranslatingSheet] = useState(false);
  const [translationStatus, setTranslationStatus] = useState('');
  const [isCustomUniverseInput, setIsCustomUniverseInput] = useState(false);
  // Feedback de importación canónica desde el Códice Chōzenshū
  const [canonImportInfo, setCanonImportInfo] = useState(null);
  const [isScanningKi, setIsScanningKi] = useState(false);
  const [showTechniqueForge, setShowTechniqueForge] = useState(false);
  const [forgedTech, setForgedTech] = useState({
    name: '',
    type: 'Energía / Ki',
    targetCategory: 'superAttacks',
    cost: '15% Ki / 1 Turno de carga',
    effect: 'Perforante (Ignora el 50% de la durabilidad menor)'
  });

  const [formData, setFormData] = useState(() => {
    if (character) {
      const img = character.avatar || character.image || '';
      return {
        ...character,
        avatar: img,
        image: img
      };
    }
    return {
      id: `custom-${Date.now()}`,
      name: '',
      universe: '🐉 Dragon Ball Super',
      version: '',
      tier: 'Tier 7-B',
      ap: '',
      range: 'Cuerpo a cuerpo estándar',
      speed: { combat: '', reaction: '', travel: '', attack: '' },
      strength: { striking: '', lifting: '' },
      durability: '',
      stamina: 'Media',
      intelligence: 'Promedio',
      experience: 'Media',
      tactics: 'Estándar',
      weaknesses: 'Ninguna conocida',
      avatar: '',
      image: '',
      haxTags: [],
      subEntity: { name: '', type: '', stats: '' },
      arsenal: {
        basicAttacks: '',
        superAttacks: [],
        ultimateAttacks: [],
        passives: [],
        actives: []
      },
      abilities: [],
      forms: [],
      feats: [],
      psychology: '',
      equipment: ''
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refineSection, setRefineSection] = useState('arsenal');
  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const handleRefineSection = async (sectionToRefine = refineSection, instruction = refineInstruction) => {
    if (!formData.name) return alert('Escribe primero el nombre del personaje.');
    setIsRefining(true);
    try {
      const refined = await SimulationEngine.refineCharacterSectionWithAi(
        formData,
        sectionToRefine,
        instruction,
        aiConfig
      );
      setFormData(refined);
      setShowRefineModal(false);
      setRefineInstruction('');
    } catch (e) {
      alert('Error en refinamiento selectivo IA: ' + e.message);
    } finally {
      setIsRefining(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'avatar') updated.image = value;
      if (field === 'image') updated.avatar = value;
      return updated;
    });
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const toggleHaxTag = (tag) => {
    const current = formData.haxTags || [];
    if (current.includes(tag)) {
      setFormData(prev => ({ ...prev, haxTags: current.filter(t => t !== tag) }));
    } else {
      setFormData(prev => ({ ...prev, haxTags: [...current, tag] }));
    }
  };

  // Arsenal Array Helpers
  const handleAddForgedTechnique = () => {
    if (!forgedTech.name.trim()) return alert('Asigna un nombre a la técnica forjada.');
    const fullDesc = `[Tipo: ${forgedTech.type}] ${forgedTech.effect}. Ejecutada con precisión marcial y canalización directa de energía.`;
    setFormData(prev => {
      const currentArsenal = prev.arsenal || { basicAttacks: '', superAttacks: [], ultimateAttacks: [], passives: [], actives: [] };
      const list = [...(currentArsenal[forgedTech.targetCategory] || [])];
      list.push({
        name: forgedTech.name.trim(),
        desc: fullDesc,
        cost: forgedTech.cost
      });
      return {
        ...prev,
        arsenal: { ...currentArsenal, [forgedTech.targetCategory]: list }
      };
    });
    setForgedTech(prev => ({ ...prev, name: '' }));
    setShowTechniqueForge(false);
    SoundFX?.playSuperAttack?.();
  };

  const addArsenalItem = (category) => {
    setFormData(prev => {
      const currentArsenal = prev.arsenal || { basicAttacks: '', superAttacks: [], ultimateAttacks: [], passives: [], actives: [] };
      const updatedList = [...(currentArsenal[category] || []), { name: '', desc: '', cost: '' }];
      return {
        ...prev,
        arsenal: { ...currentArsenal, [category]: updatedList }
      };
    });
  };

  const updateArsenalItem = (category, index, field, value) => {
    setFormData(prev => {
      const currentArsenal = prev.arsenal || { basicAttacks: '', superAttacks: [], ultimateAttacks: [], passives: [], actives: [] };
      const updatedList = [...(currentArsenal[category] || [])];
      updatedList[index][field] = value;
      return {
        ...prev,
        arsenal: { ...currentArsenal, [category]: updatedList }
      };
    });
  };

  const removeArsenalItem = (category, index) => {
    setFormData(prev => {
      const currentArsenal = prev.arsenal || { basicAttacks: '', superAttacks: [], ultimateAttacks: [], passives: [], actives: [] };
      const updatedList = currentArsenal[category].filter((_, i) => i !== index);
      return {
        ...prev,
        arsenal: { ...currentArsenal, [category]: updatedList }
      };
    });
  };

  /**
   * CÓDICE CHŌZENSHŪ → ARSENAL
   * Importa técnicas canónicas atestiguadas en los tomos como BORRADOR editable.
   * Mapeo por tipo canónico:
   *   ki / martial                → superAttacks
   *   hax / transformation / fusion → passives
   *   utility / defense / support   → actives
   * Deduplica por nombre normalizado para evitar clones (Regla de Oro 5).
   */
  const importCanonTechniques = (techniques = []) => {
    const SLOT = {
      ki: 'superAttacks', martial: 'superAttacks',
      hax: 'passives', transformation: 'passives', fusion: 'passives',
      utility: 'actives', defense: 'actives', support: 'actives'
    };
    const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    let added = 0, skipped = 0;

    setFormData(prev => {
      const base = prev.arsenal || { basicAttacks: '', superAttacks: [], ultimateAttacks: [], passives: [], actives: [] };
      const next = { ...base };
      for (const t of techniques) {
        const slot = SLOT[t.ty] || 'superAttacks';
        const list = [...(next[slot] || [])];
        const name = t.es || t.ro || t.id;
        const exists = list.some((it) => norm(it?.name) === norm(name));
        if (exists) { skipped++; continue; }
        const prov = t.at && t.occ
          ? ' [Canon Chōzenshū: ' + Object.entries(t.occ).map(([k, o]) => `${k} p.${o.p.slice(0, 3).join('/')}`).join(' · ') + ']'
          : ' [Canon Chōzenshū]';
        list.push({
          name,
          desc: `${t.de || 'Técnica canónica.'}${prov}`,
          cost: t.ty === 'ki' ? '25' : (t.ty === 'hax' || t.ty === 'transformation' ? '20' : '10'),
          ...(t.ro ? { romanji: t.ro } : {}),
          ...(t.at ? { canonSource: 'Dragon Ball Compendios (Chōzenshū 1-4)', canonHits: t.n } : {})
        });
        next[slot] = list;
        added++;
      }
      return { ...prev, arsenal: next };
    });

    try { SoundFX?.playAuraBurst?.(); } catch (e) { /* audio opcional */ }
    setCanonImportInfo({ added, skipped, total: techniques.length });
    setTimeout(() => setCanonImportInfo(null), 6000);
  };

  const detectedReferences = SimulationEngine.findReferenceCharacters(formData.name, formData.universe, allCharacters);
  const activeReference = selectedReferenceCharId === 'auto'
    ? detectedReferences[0]
    : (selectedReferenceCharId === 'none' ? null : allCharacters.find(c => c.id === selectedReferenceCharId));

  const handleAutoCalibrateByTier = (targetTier) => {
    const cleanTier = (targetTier || '').replace('Tier ', '').trim();
    const scouterKi = SCOUTER_ENERGY_ANCHORS[cleanTier] || 5000000;
    
    let apText = '';
    let duraText = '';
    let speedProfile = { combat: '', reaction: '', travel: '', attack: '' };
    const tierIndex = TIER_ORDER.indexOf(cleanTier);

    if (tierIndex <= 2) {
      apText = `Nivel Humano / Atleta (${cleanTier}). Fuerza muscular máxima convencional.`;
      duraText = `Durabilidad humana estándar. Vulnerable a armas cortopunzantes y de fuego.`;
      speedProfile = { combat: 'Humano Atlético', reaction: '0.15 a 0.25 s', travel: '10 a 35 km/h', attack: 'Humano Rápido' };
    } else if (tierIndex <= 5) {
      apText = `Nivel Estructura / Muro / Edificio (${cleanTier}). Capaz de demoler hormigón y blindajes.`;
      duraText = `Soporta impactos de artillería ligera, impactos contra concreto reforzado y caídas.`;
      speedProfile = { combat: 'Subsónico / Ojo Desarmado', reaction: 'Supersónica de corta distancia', travel: '100 a 300 km/h', attack: 'Transónico' };
    } else if (tierIndex <= 9) {
      apText = `Nivel Bloque Urbano / Rascacielos (${cleanTier}). Ráfagas de energía que pulverizan manzanas enteras.`;
      duraText = `Resiste explosiones de misiles balísticos y ondas de choque térmicas a quemarropa.`;
      speedProfile = { combat: 'Hipersónico (Mach 5 - 25)', reaction: 'Microsegundos', travel: 'Supersónico prolongado', attack: 'Hipersónico Alto' };
    } else if (tierIndex <= 16) {
      apText = `Nivel Ciudad / Montaña (${cleanTier}). Impactos de megatones capaces de evaporar macizos rocosos.`;
      duraText = `Inmune a armamento militar convencional. Resiste el epicentro de detonaciones nucleares.`;
      speedProfile = { combat: 'Hipersónico Masivo+ (Mach 100 - 1,000)', reaction: 'Nanosegundos', travel: 'Hipersónico Global', attack: 'Sub-relativista' };
    } else if (tierIndex <= 23) {
      apText = `Nivel Isla / Continental (${cleanTier}). Teratones de energía; fractura de placas tectónicas.`;
      duraText = `Resiste la disipación térmica y cinética de un cataclismo continental directo.`;
      speedProfile = { combat: 'Relativista (1% - 50% de la velocidad de la luz c)', reaction: 'Relativista', travel: 'Sub-orbital instantáneo', attack: 'Relativista Alto' };
    } else if (tierIndex <= 28) {
      apText = `Nivel Planetario (${cleanTier}). Exatones / Yottatones; energía suficiente para pulverizar un planeta rocoso.`;
      duraText = `Resiste la compresión del núcleo planetario y explosiones colosales sin brecha estructural.`;
      speedProfile = { combat: 'Velocidad de la Luz (FTL a FTL+)', reaction: 'Instantánea de combate', travel: 'Interplanetario rápido', attack: 'FTL+' };
    } else if (tierIndex <= 33) {
      apText = `Nivel Estelar / Sistema Solar (${cleanTier}). Capaz de desencadenar supernovas y colapsar estrellas.`;
      duraText = `Soporta la gravedad de gigantes rojas y el impacto de llamaradas estelares masivas.`;
      speedProfile = { combat: 'MFTL (Miles de veces la velocidad de la luz)', reaction: 'Pico-segundos', travel: 'Interestelar', attack: 'MFTL+' };
    } else if (tierIndex <= 37) {
      apText = `Nivel Galáctico / Universal (${cleanTier}). Energía suficiente para arrasar galaxias o deformar el espacio cósmico.`;
      duraText = `Resiste la radiación de quásares y colisiones de agujeros negros supermasivos.`;
      speedProfile = { combat: 'MFTL+ (Millones de veces c)', reaction: 'Fempto-segundos', travel: 'Inter-galáctico', attack: 'MFTL+ Extremo' };
    } else if (tierIndex <= 41) {
      apText = `Nivel Multiversal (${cleanTier}). Destrucción de continuos espacio-temporales completos.`;
      duraText = `Cuerpo o esencia anclada más allá del tiempo convencional. Resiste el colapso de líneas temporales.`;
      speedProfile = { combat: 'Inconmensurable / Trascendente', reaction: 'Atemporal', travel: 'Omnipresencia local', attack: 'Inconmensurable' };
    } else {
      apText = `Nivel Trascendente / Hiperversal / Exterior (${cleanTier}). Por encima de toda dimensión espacial y conceptual.`;
      duraText = `Invulnerabilidad metafísica. Inmune a conceptos de daño físico o causalidad lógica.`;
      speedProfile = { combat: 'Irrelevante / Trascendente', reaction: 'Irrelevante', travel: 'Omnipresente', attack: 'Irrelevante' };
    }

    setFormData(prev => ({
      ...prev,
      tier: `Tier ${cleanTier}`,
      ap: apText,
      durability: duraText,
      speed: speedProfile,
      ki: scouterKi,
      sourceKiCurrent: scouterKi
    }));

    SoundFX?.playPowerUp?.();
  };

  const handleAutoFill = async () => {
    if (!formData.name) return alert('Pon un nombre primero para buscar.');
    setIsLoading(true);
    try {
      const data = await SimulationEngine.generateCharacterStatsWithAi(
        formData.name,
        formData.universe,
        aiConfig,
        allCharacters,
        activeReference
      );
      setFormData(prev => ({
        ...prev,
        ...data,
        id: prev.id
      }));
    } catch (e) {
      alert('Error en IA: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!formData.name) return alert('Escribe primero el nombre del personaje.');
    setIsGeneratingImage(true);
    try {
      const prompt = `${formData.name} from ${formData.universe || 'anime'}, ${formData.version || ''}, badass fighting stance, dynamic anime character portrait, glowing aura`;
      
      if (imageEngine === 'pollinations') {
        const directUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ', masterpiece, best quality, detailed background')}?width=512&height=512&nologo=true&seed=${Date.now()}`;
        setFormData(prev => ({ ...prev, avatar: directUrl }));
        return;
      }

      const res = await fetch(`http://${window.location.hostname}:3001/api/image/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: imageStyle,
          engine: imageEngine,
          sdUrl
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.imageUrl) {
        setFormData(prev => ({ ...prev, avatar: data.imageUrl }));
      }
    } catch (err) {
      alert('Error generando imagen: ' + err.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleTranslateSheet = async (targetLang) => {
    if (targetLang === currentSheetLang) return;
    if (targetLang === 'es' && originalFormData) {
      setFormData(JSON.parse(JSON.stringify(originalFormData)));
      setCurrentSheetLang('es');
      return;
    }
    
    setIsTranslatingSheet(true);
    setTranslationStatus('Iniciando traducción instantánea con Google Translate...');
    try {
      if (!originalFormData) {
        setOriginalFormData(JSON.parse(JSON.stringify(formData)));
      }
      const source = originalFormData || formData;
      const translated = await translateCharacterSheet(source, targetLang, (pct, msg) => {
        setTranslationStatus(`${msg} (${pct}%)`);
      });
      setFormData(translated);
      setCurrentSheetLang(targetLang);
    } catch (err) {
      alert('Error al traducir ficha: ' + (err.message || err));
    } finally {
      setIsTranslatingSheet(false);
      setTranslationStatus('');
    }
  };

  const addForm = () => {
    setFormData(prev => ({
      ...prev,
      forms: [...(prev.forms || []), { id: `form-${Date.now()}`, name: '', stats: '', multiplier: '', aura: '', cost: '' }]
    }));
  };

  const updateForm = (index, field, value) => {
    const newForms = [...(formData.forms || [])];
    newForms[index][field] = value;
    setFormData(prev => ({ ...prev, forms: newForms }));
  };

  const removeForm = (index) => {
    setFormData(prev => ({ ...prev, forms: (prev.forms || []).filter((_, i) => i !== index) }));
  };

  // Tabs structure with live counters
  const totalAttacksCount = (formData.arsenal?.superAttacks?.length || 0) + 
                            (formData.arsenal?.ultimateAttacks?.length || 0) + 
                            (formData.arsenal?.passives?.length || 0) + 
                            (formData.arsenal?.actives?.length || 0);

  const isRaichi = formData.id === 'dr-raichi-dbm-u3';
  const bodilyForms = getBodilyForms(formData);
  const externalEntities = getExternalEntities(formData);
  const isEntityCommander = !!formData.narrativeCombatProfile?.externalEntityController || isRaichi;
  const canonicalGhosts = formData.narrativeCombatProfile?.canonicalGhostArchive || [];
  const legacyGhosts = formData.narrativeCombatProfile?.legacyGhostReferences || [];
  const resonanceGhosts = formData.narrativeCombatProfile?.resonanceProjectionLibrary || [];

  const TABS = [
    { id: 'basico', label: 'Básico', shortLabel: 'Básico', count: null, icon: <Book className="w-4 h-4 text-cyan-400" /> },
    { id: 'formas', label: 'Transformaciones', shortLabel: 'Formas', count: bodilyForms.length || 0, icon: <ListPlus className="w-4 h-4 text-amber-400" /> },
    { id: 'arsenal', label: 'Ataques & Habilidades', shortLabel: 'Ataques', count: totalAttacksCount || null, icon: <Flame className="w-4 h-4 text-orange-400" /> },
    { id: 'hax', label: 'Hax & Tags', shortLabel: 'Hax', count: formData.haxTags?.length || null, icon: <Sparkles className="w-4 h-4 text-fuchsia-400" /> },
    { id: 'cinetica', label: 'Cinética & Velocidad', shortLabel: 'Cinética', count: null, icon: <Move className="w-4 h-4 text-cyan-400" /> },
    { id: 'biomecanica', label: 'Biomecánica & Salud', shortLabel: 'Salud', count: null, icon: <Activity className="w-4 h-4 text-emerald-400" /> },
    { 
      id: 'invocaciones', 
      label: isEntityCommander ? 'Entidades Externas' : 'Stands / Armas', 
      shortLabel: isEntityCommander ? 'Entidades' : 'Stands', 
      count: isEntityCommander ? (canonicalGhosts.length + legacyGhosts.length) : (formData.subEntity?.name ? 1 : null), 
      icon: <Users className="w-4 h-4 text-purple-400" /> 
    },
  { id: 'psicologia', label: 'Psicología & IQ', shortLabel: 'IQ', count: null, icon: <Brain className="w-4 h-4 text-indigo-400" /> },
  { id: 'codice', label: 'Códice Chōzenshū', shortLabel: 'Códice', count: null, icon: <BookMarked className="w-4 h-4 text-cyan-400" /> }
];

  const currentTabIdx = TABS.findIndex(t => t.id === activeTab);
  const prevTab = currentTabIdx > 0 ? TABS[currentTabIdx - 1] : null;
  const nextTab = currentTabIdx < TABS.length - 1 ? TABS[currentTabIdx + 1] : null;

  // Selected Universe Preset Helper
  const currentUniversePreset = UNIVERSE_PRESETS.find(u => 
    (formData.universe || '').toLowerCase().includes(u.name.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
    u.name.toLowerCase().includes((formData.universe || '').toLowerCase().replace(/[^a-z0-9]/g, ''))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl glass-panel border border-slate-700 shadow-2xl p-0 my-4 sm:my-8 max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 rounded-t-2xl gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white truncate font-cinzel">
                  {formData.name || 'Luchador Sin Nombre'}
                </h2>
                {isCharacterInNeedsReview(formData.id) && (
                  <div className="mt-2 p-2.5 bg-amber-950/60 border border-amber-500/50 rounded-lg text-xs text-amber-200 flex items-start gap-2 shadow-md">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 font-cinzel uppercase mr-1">
                        Calibración Editorial Pendiente (APEX V22):
                      </span>
                      <span>{getNeedsReviewWarningText(formData.id)}</span>
                      <div className="mt-0.5 text-[10px] text-amber-400/80 italic">
                        Valores oficiales congelados según V22 sin alteraciones especulativas.
                      </div>
                    </div>
                  </div>
                )}
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] font-mono shrink-0">
                  {formData.tier || 'Tier ?'}
                </span>
              </div>
              <p className="text-[11px] text-cyan-400 font-mono truncate">
                {formData.universe || 'Universo No Asignado'} {formData.version ? `— ${formData.version}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Toggle: View Mode vs Edit Mode */}
            <button
              type="button"
              onClick={() => setIsEditingMode(!isEditingMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 border shadow-sm ${
                isEditingMode
                  ? 'bg-amber-600 hover:bg-amber-500 text-black border-amber-400 shadow-amber-950/60'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title={isEditingMode ? "Cambiar a Modo Lectura Cómoda" : "Activar Modo Edición de Ficha"}
            >
              {isEditingMode ? (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Modo:</span> <strong>Edición</strong>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Modo:</span> <strong>Lectura</strong>
                </>
              )}
            </button>

            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Translation Toolbar (Google Translate & Instant Multilingual) */}
        <div className="px-4 sm:px-5 py-2 bg-slate-950/95 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-bold text-[11px]">Traductor:</span>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                disabled={isTranslatingSheet}
                onClick={() => handleTranslateSheet('es')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  currentSheetLang === 'es' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇪🇸 ES</span>
              </button>
              <button
                type="button"
                disabled={isTranslatingSheet}
                onClick={() => handleTranslateSheet('en')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  currentSheetLang === 'en' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                <span>🇬🇧 EN</span>
              </button>
              <button
                type="button"
                disabled={isTranslatingSheet}
                onClick={() => handleTranslateSheet('ja')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  currentSheetLang === 'ja' ? 'bg-red-500 text-white shadow' : 'text-slate-400 hover:text-red-300'
                }`}
              >
                <span>🇯🇵 JA</span>
              </button>
            </div>
          </div>

          {isTranslatingSheet ? (
            <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>{translationStatus}</span>
            </div>
          ) : currentSheetLang !== 'es' ? (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
              <Check className="w-3 h-3" /> Ficha traducida ({currentSheetLang.toUpperCase()})
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 hidden md:inline">
              OMNI-TITÁN Engine · Ficha Técnica Oficial
            </span>
          )}
        </div>

        {/* AI Autocomplete & Selective Refinement Bar (Only in Edit Mode) */}
        {isEditingMode && (
          <div className="px-4 sm:px-5 pt-3">
            <div className="p-3 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/40 rounded-xl space-y-2.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex-1 text-xs font-mono">
                  <label className="block text-indigo-300 font-bold mb-1">Nombre del Personaje / Búsqueda IA:</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => handleChange('name', e.target.value)} 
                    placeholder="Ej: Goku SSJ2 (Saga Buu), Toji Fushiguro, Sukuna (Heian)..." 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-indigo-400 outline-none" 
                  />
                </div>

                <div className="flex items-center gap-2 mt-1 sm:mt-4">
                  <button 
                    onClick={handleAutoFill} 
                    disabled={isLoading || isRefining}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow"
                    title="Generar toda la ficha con IA calibrada con las fichas existentes del roster"
                  >
                    <Zap className="w-3.5 h-3.5 text-yellow-300" />
                    <span>{isLoading ? 'Generando...' : '✨ Autocompletar con IA'}</span>
                  </button>

                  <button 
                    onClick={() => setShowRefineModal(true)} 
                    disabled={isLoading || isRefining}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-lg shadow-purple-950/50"
                    title="Modificar o añadir solo una sección específica sin alterar el resto de la ficha"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-200" />
                    <span>🪄 Cirujano IA</span>
                  </button>
                </div>
              </div>

              {/* Barra de Calibración con Fichas Existentes del Roster */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-indigo-900/40 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-300 flex-wrap">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <span>🎯</span>
                    <span>Calibración de Roster:</span>
                  </span>
                  {activeReference ? (
                    <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/60 text-indigo-200 font-bold flex items-center gap-1">
                      <span>✨ Usando base:</span>
                      <span className="text-white">{activeReference.name}</span>
                      <span className="text-[10px] text-slate-400">({activeReference.universe})</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">Creación pura sin referencia previa</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <label className="text-slate-400 text-[10px]">Plantilla / Base:</label>
                  <select
                    value={selectedReferenceCharId}
                    onChange={(e) => setSelectedReferenceCharId(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-slate-200 text-[10px] rounded-lg p-1 max-w-[220px] outline-none"
                  >
                    <option value="auto">🪄 Auto-detectar ({detectedReferences[0]?.name || 'Ninguno'})</option>
                    <option value="none">🚫 Sin Referencia (Creación limpia)</option>
                    {allCharacters && allCharacters.length > 0 && (
                      <optgroup label="📋 Roster Existente">
                        {allCharacters.slice(0, 50).map((c, idx) => (
                          <option key={c.id || idx} value={c.id}>{c.name} ({c.universe})</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOP TAB NAVIGATION BAR (Super optimized for PC & Mobile) */}
        <div className="border-b border-slate-800 bg-slate-950/90 px-3 sm:px-5 pt-3">
          
          {/* Mobile Quick Dropdown Selector for instant switching (< 768px) */}
          <div className="block md:hidden mb-2.5">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-slate-400 font-mono font-bold uppercase shrink-0">
                📑 Sección:
              </label>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-amber-300 text-xs font-bold rounded-xl p-2 font-mono outline-none focus:border-amber-500"
              >
                {TABS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.label} {t.count !== null ? `(${t.count})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Responsive Pill Tabs List */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {TABS.map(t => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                    isActive 
                      ? 'bg-gradient-to-r from-red-950/90 to-amber-950/80 border-amber-500/60 text-amber-300 shadow-md shadow-amber-950/40' 
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                  {t.count !== null && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                      isActive ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 font-mono text-xs space-y-4">
          
          {/* TAB 1: BÁSICO & UNIVERSO */}
          {activeTab === 'basico' && (
            <div className="space-y-4">
              
              {/* Image & Avatar Card */}
              <div className="p-4 bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-900 border border-purple-900/50 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                {formData.avatar ? (
                  <div className="w-24 h-24 rounded-2xl p-1 bg-slate-950 border-2 border-purple-500/50 shadow-lg shadow-purple-950/60 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={formData.avatar}
                      alt={formData.name || 'Avatar'}
                      className="w-full h-full object-contain object-center drop-shadow-md"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-slate-500 text-[10px]">
                    <ImageIcon className="w-6 h-6 mb-1 text-slate-600" />
                    <span>Sin Imagen</span>
                  </div>
                )}

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-purple-300 font-bold flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-purple-400" />
                      <span>Retrato / Ilustración del Personaje:</span>
                    </label>

                    {isEditingMode && (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={imageEngine}
                          onChange={(e) => setImageEngine(e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded-lg p-1"
                        >
                          <option value="pollinations">🌐 Pollinations Flux (Nube Gratis)</option>
                          <option value="reforge">🖥️ Reforge / SD Local</option>
                        </select>

                        <select
                          value={imageStyle}
                          onChange={(e) => setImageStyle(e.target.value)}
                          className="bg-slate-950 border border-purple-800/60 text-[10px] text-purple-300 rounded-lg p-1 font-bold"
                        >
                          <option value="shonen">💥 Shōnen Épico</option>
                          <option value="cinematic">🌌 Cinemático</option>
                          <option value="grimdark">🌑 Grimdark</option>
                          <option value="wiki">⚔️ Wiki Oficial</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {isEditingMode && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          disabled={isGeneratingImage}
                          onClick={handleGenerateImage}
                          className="flex-1 min-w-[140px] py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isGeneratingImage ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Generando Arte...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>🎨 Generar con IA</span>
                            </>
                          )}
                        </button>

                        <label className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 cursor-pointer flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                          <span>Subir Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (ev.target?.result) {
                                    setFormData(prev => ({ ...prev, avatar: ev.target.result }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>

                        {formData.avatar && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                            className="px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900 text-red-300 text-xs border border-red-900/50 cursor-pointer"
                          >
                            Quitar
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={formData.avatar || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                        placeholder="O pega directamente una URL de imagen (https://...)..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 text-[11px] text-slate-200 rounded-lg p-2 font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SECCIÓN / UNIVERSO DEL ROSTER (Dedicated Category Assigner) */}
              <div className="p-4 bg-slate-900/70 border border-cyan-500/40 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-cyan-400 font-bold flex items-center gap-2 text-xs">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>📁 Sección / Universo del Roster:</span>
                  </label>

                  {isEditingMode && (
                    <button
                      type="button"
                      onClick={() => setIsCustomUniverseInput(!isCustomUniverseInput)}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer bg-slate-950 px-2.5 py-1 rounded-lg border border-amber-500/30"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isCustomUniverseInput ? 'Ver Categorías Existentes' : 'Añadir Nueva Categoría'}</span>
                    </button>
                  )}
                </div>

                {/* Display / Edit Category */}
                {isEditingMode ? (
                  <div className="space-y-3">
                    {/* Custom Text Input or Select */}
                    {isCustomUniverseInput ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={formData.universe}
                          onChange={(e) => handleChange('universe', e.target.value)}
                          placeholder="Escribe el nombre exacto de la nueva categoría (ej: Solo Leveling, Bleach Hell Arc)..."
                          className="w-full bg-slate-950 border-2 border-amber-500/60 focus:border-amber-400 rounded-xl p-2.5 text-white font-bold text-xs outline-none"
                        />
                        <span className="text-[10px] text-slate-400 block">
                          💡 Esta nueva categoría se creará automáticamente en tu Roster y agrupará a este personaje.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Quick Universe Chips Selector */}
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-slate-950/60 rounded-xl border border-slate-800">
                          {UNIVERSE_PRESETS.map((u) => {
                            const isSelected = formData.universe === u.name;
                            return (
                              <button
                                key={u.name}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    universe: u.name,
                                    dbTag: u.dbTag || prev.dbTag 
                                  }));
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                                  isSelected
                                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-950'
                                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800'
                                }`}
                              >
                                <span>{u.name}</span>
                                {isSelected && <Check className="w-3 h-3" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quick Saga Suggestions based on Selected Universe */}
                    {currentUniversePreset?.sagas?.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold block">
                          ⚡ Sagas / Épocas sugeridas para {formData.universe}:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {currentUniversePreset.sagas.map(saga => (
                            <button
                              key={saga}
                              type="button"
                              onClick={() => handleChange('version', saga)}
                              className={`px-2 py-0.5 rounded text-[9.5px] font-bold transition cursor-pointer border ${
                                formData.version === saga
                                  ? 'bg-amber-500 text-black border-amber-400'
                                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-400/40'
                              }`}
                            >
                              + {saga}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold text-xs">
                      {formData.universe || 'Sin Universo'}
                    </span>
                    {formData.version && (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs">
                        {formData.version}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Versión, Tier & Rango */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Versión / Lore / Saga</label>
                  {isEditingMode ? (
                    <input 
                      type="text" 
                      value={formData.version || ''} 
                      onChange={e => handleChange('version', e.target.value)} 
                      placeholder="Ej: Saga Granola, Post-RoSaT..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs" 
                    />
                  ) : (
                    <p className="text-slate-200 p-2 bg-slate-900/50 rounded-lg">{formData.version || 'Estándar'}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-amber-400 font-bold text-xs">Tier / Power Level</label>
                    {isEditingMode && (
                      <span className="text-[10px] text-amber-300 font-mono">⚖️ Auto-Calibrar</span>
                    )}
                  </div>
                  {isEditingMode ? (
                    <div className="space-y-1.5">
                      <input 
                        type="text" 
                        value={formData.tier || ''} 
                        onChange={e => handleChange('tier', e.target.value)} 
                        placeholder="Ej: Tier 2-C (Multiversal Bajo)"
                        className="w-full bg-slate-900 border border-amber-900/50 rounded-lg p-2 text-white text-xs font-mono" 
                      />
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleAutoCalibrateByTier(e.target.value);
                        }}
                        defaultValue=""
                        className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-2 py-1 text-[10px] font-mono text-amber-300 cursor-pointer"
                      >
                        <option value="" disabled>⚡ Calibrar AP/Speed/Ki por Tier...</option>
                        {TIER_ORDER.map((t) => (
                          <option key={t} value={t}>
                            Tier {t} (Ki ~{SCOUTER_ENERGY_ANCHORS[t] ? Number(SCOUTER_ENERGY_ANCHORS[t]).toLocaleString('es-ES') : 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="text-amber-300 font-bold p-2 bg-amber-950/30 rounded-lg font-mono">{formData.tier || 'No asignado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-cyan-400 mb-1 font-bold flex items-center gap-1">
                    <Target className="w-3.5 h-3.5"/> Rango / Alcance
                  </label>
                  {isEditingMode ? (
                    <input 
                      type="text" 
                      placeholder="Ej: Cuerpo a cuerpo, Planetario, Multiversal" 
                      value={formData.range || ''} 
                      onChange={e => handleChange('range', e.target.value)} 
                      className="w-full bg-slate-900 border border-cyan-900/50 rounded-lg p-2 text-white text-xs" 
                    />
                  ) : (
                    <p className="text-cyan-200 p-2 bg-cyan-950/30 rounded-lg">{formData.range || 'Cuerpo a cuerpo estándar'}</p>
                  )}
                </div>
              </div>

              {/* APEX-Ki Reading Module */}
              {(() => {
                const breakdown = getPowerLevelFormulaBreakdown(formData);
                const combatState = resolveCombatState(formData, 'base');
                return (
                  <div className="p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-3 shadow-sm font-mono">
                    {/* APEX-Ki Universal Telemetry Badge */}
                    <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-indigo-400 animate-pulse shrink-0" />
                        <div>
                          <span className="text-[9px] text-indigo-300 font-bold block uppercase tracking-wider">
                            APEX-Ki Universal:
                          </span>
                          <span className="text-sm sm:text-base font-black text-white font-cinzel">
                            {combatState.apexKiDisplay || '—'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900/60 border border-indigo-400/40 text-indigo-200 font-bold">
                        Cross-Verse
                      </span>
                    </div>

                    {/* Secondary Metrics: Physical Tier, Hax Tier, Stamina Pool */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-[10px]">
                      <div className="p-1.5 rounded bg-slate-950/60 border border-red-900/40 flex flex-col">
                        <span className="text-slate-400 text-[8.5px] uppercase font-bold">Tier Físico</span>
                        <span className="text-red-300 font-bold font-mono">{formData.physicalTier || formData.tier || '7-B'}</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-950/60 border border-purple-900/40 flex flex-col">
                        <span className="text-slate-400 text-[8.5px] uppercase font-bold">Tier Hax</span>
                        <span className="text-purple-300 font-bold font-mono">{formData.haxTier || formData.tier || '7-B'}</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-950/60 border border-cyan-900/40 flex flex-col">
                        <span className="text-slate-400 text-[8.5px] uppercase font-bold">Stamina Pool</span>
                        <span className="text-cyan-300 font-bold font-mono">{formData.staminaProfile?.basePool || 100} HP (Rec: {formData.staminaProfile?.recoveryRate || 6}/s)</span>
                      </div>
                    </div>

                    {breakdown && (
                      <details className="group border-t border-slate-800 pt-2">
                        <summary className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer flex items-center justify-between transition select-none">
                          <span>📐 Desglose de la Fórmula: PL = E_Tier × M_Vel × M_Def × M_Hax/IQ</span>
                          <span className="text-slate-500 group-open:rotate-90 transition-transform">▶</span>
                        </summary>
                        <div className="mt-2 p-2.5 rounded-lg bg-slate-950/80 border border-emerald-900/30 text-[9.5px] space-y-1 text-slate-300">
                          <p><span className="text-slate-400">• Energía Base Tier:</span> <span className="text-amber-300 font-bold">{formData.sourceKi ? `${formData.sourceKi.toLocaleString('es-ES')} Unidades (Oficial DB)` : `${formData.tier || 'Tier 7-B'} (${breakdown.baseEnergyValue === Infinity ? 'Infinito' : breakdown.baseEnergyValue.toLocaleString()} Ki)`}</span></p>
                          <p><span className="text-slate-400">• Modificador Velocidad:</span> <span className="text-cyan-300">{breakdown.speedLabel}</span></p>
                          <p><span className="text-slate-400">• Modificador Durabilidad:</span> <span className="text-emerald-300">{breakdown.durabilityLabel}</span></p>
                          <p><span className="text-slate-400">• Modificador Hax/Battle IQ:</span> <span className="text-purple-300">{breakdown.haxBiqLabel}</span></p>
                          <p><span className="text-slate-400">• Rango DB Similar:</span> <span className="text-amber-400 font-bold">Similar a {breakdown.closestDbComparison}</span></p>
                        </div>
                      </details>
                    )}
                  </div>
                );
              })()}

              {/* Attack Potency */}
              <div>
                <label className="block text-red-400 mb-1 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5"/> Attack Potency (AP / Destrucción)
                </label>
                {isEditingMode ? (
                  <textarea 
                    rows={2} 
                    value={formData.ap || ''} 
                    onChange={e => handleChange('ap', e.target.value)} 
                    placeholder="Descripción de escala destructiva y feats de potencia..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs" 
                  />
                ) : (
                  <p className="text-slate-200 p-2.5 bg-slate-900/50 rounded-xl leading-relaxed">{formData.ap || 'Sin datos de AP.'}</p>
                )}
                {formData.lorePriorForm && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-950/85 border border-amber-500/25 text-slate-300 shadow-sm">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs font-mono tracking-wide mb-1">
                      <span>📜</span>
                      <span>Legado Histórico (no combate activo):</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {formData.lorePriorForm}
                    </p>
                  </div>
                )}
              </div>

              {/* Fuerza de Impacto y Levantamiento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <label className="block text-slate-400 mb-1 font-bold flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5 text-amber-400"/> Fuerza de Impacto (Striking Strength)
                  </label>
                  {isEditingMode ? (
                    <input 
                      type="text" 
                      value={formData.strength?.striking || ''} 
                      onChange={e => handleNestedChange('strength', 'striking', e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white text-xs" 
                    />
                  ) : (
                    <p className="text-slate-200">{formData.strength?.striking || 'No especificada'}</p>
                  )}
                </div>

                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <label className="block text-slate-400 mb-1 font-bold flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5 text-cyan-400"/> Levantamiento (Lifting Strength)
                  </label>
                  {isEditingMode ? (
                    <input 
                      type="text" 
                      value={formData.strength?.lifting || ''} 
                      onChange={e => handleNestedChange('strength', 'lifting', e.target.value)} 
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white text-xs" 
                    />
                  ) : (
                    <p className="text-slate-200">{formData.strength?.lifting || 'No especificada'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FORMAS & TRANSFORMACIONES */}
          {activeTab === 'formas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
                <div>
                  <h3 className="text-amber-400 font-bold flex items-center gap-2 text-sm font-cinzel">
                    <ListPlus className="w-4 h-4 text-amber-400" />
                    Gestor Exhaustivo de Transformaciones ({bodilyForms.length})
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Fases de combate, multiplicadores de poder y coste energético.
                  </p>
                </div>

                {isEditingMode && (
                  <button 
                    type="button" 
                    onClick={addForm} 
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Forma</span>
                  </button>
                )}
              </div>
              
              {(!bodilyForms || bodilyForms.length === 0) ? (
                <div className="py-10 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800">
                  <p>Este personaje no tiene transformaciones adicionales registradas (Lucha en su Forma Base).</p>
                  {isEditingMode && (
                    <button 
                      type="button" 
                      onClick={addForm} 
                      className="mt-3 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                    >
                      + Registrar Primera Forma
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {bodilyForms.map((f, i) => {
                    const originalIdx = (formData.forms || []).findIndex(formItem => formItem.id === f.id);
                    const targetIdx = originalIdx > -1 ? originalIdx : i;
                    return (
                    <div 
                      key={i} 
                      className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 shadow-lg space-y-2 relative group hover:border-amber-400/60 transition"
                    >
                      {isEditingMode ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                              FASE #{i + 1} {i === 0 ? '(Forma Base / Inicial)' : ''}
                            </span>
                            <button 
                              type="button" 
                              onClick={() => removeForm(targetIdx)} 
                              className="p-1 rounded text-red-400 hover:bg-red-950/60 hover:text-red-300 text-xs font-bold cursor-pointer"
                              title="Eliminar esta forma"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input 
                              type="text" 
                              placeholder="Nombre de la Forma (Ej: Super Saiyan Blue, Bankai, Gear 5)" 
                              value={f.name || ''} 
                              onChange={e => updateForm(targetIdx, 'name', e.target.value)} 
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold text-xs outline-none focus:border-amber-400" 
                            />
                            <input 
                              type="text" 
                              placeholder="Multiplicador / Multiplier (Ej: x50, x400, Nivel Divino)" 
                              value={f.multiplier || ''} 
                              onChange={e => updateForm(targetIdx, 'multiplier', e.target.value)} 
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 text-xs" 
                            />
                          </div>

                          <textarea 
                            rows={2} 
                            placeholder="Aumento de stats, buffs, características del aura y descripción..." 
                            value={f.stats || ''} 
                            onChange={e => updateForm(targetIdx, 'stats', e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-300 text-xs" 
                          />

                          <input 
                            type="text" 
                            placeholder="Desgaste / Coste (Ej: 10% Stamina por minuto, Daño de rebote cardiaco)" 
                            value={f.cost || ''} 
                            onChange={e => updateForm(targetIdx, 'cost', e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-red-300 text-[10px]" 
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                                FASE #{i + 1}
                              </span>
                              <h4 className="font-bold text-amber-300 text-sm font-cinzel">{f.name}</h4>
                            </div>
                            {f.multiplier && (
                              <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px] font-bold">
                                {f.multiplier}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed mt-1">
                            {typeof f.stats === 'object'
                              ? (f.stats.ap || f.stats.tier || Object.values(f.stats).join(' | '))
                              : f.stats}
                          </p>
                          {f.cost && (
                            <div className="mt-2 text-[10px] text-red-400 font-mono">
                              ⚠️ Desgaste: {f.cost}
                            </div>
                          )}

                          {/* Historical Lore Legacy Note (Purely Informative / Non-Combat) */}
                          {(f.lorePriorForm || formData.lorePriorForm) && (
                            <div className="mt-3 p-3 rounded-xl bg-slate-950/85 border border-amber-500/25 text-slate-300 shadow-sm">
                              <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs font-mono tracking-wide mb-1">
                                <span>📜</span>
                                <span>Legado Histórico (no combate activo):</span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                                {f.lorePriorForm || formData.lorePriorForm}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ARSENAL, ATAQUES Y HABILIDADES */}
          {activeTab === 'arsenal' && (
            <div className="space-y-5">
              {/* Legacy Summon Reference Card (Dr. Raichi) */}
              {isRaichi && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-500/40 text-amber-200 shadow-lg">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Invocación élite legacy: Fantasma de Broly LSSJ</span>
                  </div>
                  <p className="text-xs text-amber-300/80 italic mt-1">
                    Referencia de invocación de Hatchiyack; no es una transformación ni un multiplicador corporal de Dr. Raichi.
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                    <li>La referencia legacy preserva el registro histórico de V25.</li>
                    <li>El sistema futuro de Ghost Archive decidirá despliegue, resonancia, recarga y counterplay.</li>
                    <li>No suma Ki ni multiplica las estadísticas personales de Raichi.</li>
                    <li>Hatchiyack Manifest sigue como propuesta no activa.</li>
                  </ul>
                </div>
              )}

              {/* 1. Ataques Básicos */}
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <label className="block text-amber-400 font-bold mb-1 flex items-center gap-2">
                  <Swords className="w-4 h-4 text-amber-400" /> Ataques Básicos / Normales
                </label>
                <p className="text-[10px] text-slate-500 mb-2">Golpes cuerpo a cuerpo estándar, ráfagas de ki menores, combinaciones sin gasto crítico.</p>
                {isEditingMode ? (
                  <textarea 
                    rows={3} 
                    placeholder="Ej: Golpes de plasma a 5,000°C, Ráfagas de Ki consecutivas, Barrido de piernas imbuido en fuego." 
                    value={typeof formData.arsenal?.basicAttacks === 'string' ? formData.arsenal.basicAttacks : (Array.isArray(formData.arsenal?.basicAttacks) ? formData.arsenal.basicAttacks.map(b => typeof b === 'object' ? `${b.name || ''}: ${b.desc || ''} (Coste: ${b.cost || 'N/A'}, Daño: ${b.damageType || 'Físico'})` : String(b)).join('\n') : '')} 
                    onChange={e => handleNestedChange('arsenal', 'basicAttacks', e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs font-mono" 
                  />
                ) : (
                  <div className="text-slate-300 p-2.5 bg-slate-950/60 rounded-xl leading-relaxed">
                    {Array.isArray(formData.arsenal?.basicAttacks) ? (
                      <div className="space-y-2">
                        {formData.arsenal.basicAttacks.map((atk, bIdx) => (
                          <div key={bIdx} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-amber-300">{typeof atk === 'object' ? atk.name : atk}</span>
                              {typeof atk === 'object' && (
                                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                                  {atk.cost && <span className="text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">Coste: {atk.cost}</span>}
                                  {atk.damageType && <span className="text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">{atk.damageType}</span>}
                                </div>
                              )}
                            </div>
                            {typeof atk === 'object' && atk.desc && (
                              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{atk.desc}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs">{formData.arsenal?.basicAttacks || 'Sin ataques básicos registrados.'}</p>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Súper Ataques */}
              <div className="p-4 bg-orange-950/20 border border-orange-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <label className="text-orange-400 font-bold flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" /> Súper Ataques (Técnicas Especiales)
                    </label>
                    <p className="text-[10px] text-orange-400/70">Kamehameha, Rasengan, Getsuga Tensho, Final Flash.</p>
                  </div>

                  {isEditingMode && (
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowTechniqueForge(!showTechniqueForge)} 
                        className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 rounded-lg text-xs font-bold font-mono cursor-pointer flex items-center gap-1 shadow-md"
                      >
                        <Zap className="w-3.5 h-3.5 text-slate-950" />
                        <span>{showTechniqueForge ? 'Cerrar Forja ▲' : '⚡ Forja Rápida de Técnicas'}</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => addArsenalItem('superAttacks')} 
                        className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        + Añadir Manual
                      </button>
                    </div>
                  )}
                </div>

                {/* Interactive Technique Forge Panel */}
                {isEditingMode && showTechniqueForge && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3 font-mono text-xs animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-500/20 text-amber-300 font-bold">
                      <span>⚡ FORJA INTERACTIVA DE TÉCNICAS & HAX COMBINADO</span>
                      <span className="text-[10px] text-slate-400">Inserción instantánea en arsenal</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-300 text-[10px] mb-1">Nombre de la Técnica:</label>
                        <input
                          type="text"
                          value={forgedTech.name}
                          onChange={(e) => setForgedTech(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ej: Destello Cósmico, Corte de Vacío..."
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 text-[10px] mb-1">Destino en Ficha:</label>
                        <select
                          value={forgedTech.targetCategory}
                          onChange={(e) => setForgedTech(prev => ({ ...prev, targetCategory: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 text-xs"
                        >
                          <option value="superAttacks">Súper Ataque (Técnica Especial)</option>
                          <option value="ultimateAttacks">Ataque Definitivo (Finisher)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 text-[10px] mb-1">Tipo de Energía / Vector:</label>
                        <select
                          value={forgedTech.type}
                          onChange={(e) => setForgedTech(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 text-xs"
                        >
                          <option value="Energía / Ki Pura">Energía / Ki Pura</option>
                          <option value="Impacto Físico / CQC">Impacto Físico / CQC</option>
                          <option value="Corte / Filo Espiritual">Corte / Filo Espiritual</option>
                          <option value="Espacial / Rasgadura Dimensional">Espacial / Rasgadura Dimensional</option>
                          <option value="Mental / Ilusión Óptica">Mental / Ilusión Óptica</option>
                          <option value="Maldición / Daño de Alma">Maldición / Daño de Alma</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 text-[10px] mb-1">Efecto Especial Primario:</label>
                        <select
                          value={forgedTech.effect}
                          onChange={(e) => setForgedTech(prev => ({ ...prev, effect: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 text-xs"
                        >
                          <option value="Perforante (Ignora el 50% de la durabilidad menor)">Perforante (Ignora el 50% de durabilidad)</option>
                          <option value="Aturdidor (Reduce reflejos enemigos un 40% por 10s)">Aturdidor (Conmoción sensorial)</option>
                          <option value="Parálisis de Ki (Bloquea flujo de energía del objetivo)">Parálisis de Ki / Energía</option>
                          <option value="Inesquivable (Trayectoria homing guiada por firma espiritual)">Inesquivable (Proyectil guiado)</option>
                          <option value="Detonación Interna (Explosión atómica tras penetración)">Detonación Interna Retardada</option>
                          <option value="Negación de Regeneración Celular">Anulación de Regeneración</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        value={forgedTech.cost}
                        onChange={(e) => setForgedTech(prev => ({ ...prev, cost: e.target.value }))}
                        placeholder="Coste (Ej: 15% Ki, 1 turno de carga)"
                        className="w-2/3 bg-slate-900 border border-slate-700 rounded p-1 text-slate-300 text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={handleAddForgedTechnique}
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer shadow"
                      >
                        ⚡ Forjar e Insertar
                      </button>
                    </div>
                  </div>
                )}

                {(!formData.arsenal?.superAttacks || formData.arsenal.superAttacks.length === 0) ? (
                  <p className="text-slate-500 italic text-[11px]">No hay súper ataques registrados.</p>
                ) : (
                  <div className="space-y-2">
                    {formData.arsenal.superAttacks.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 border border-slate-700 rounded-xl space-y-1.5">
                        {isEditingMode ? (
                          <>
                            <div className="flex items-center justify-between gap-2">
                              <input 
                                type="text" 
                                placeholder="Nombre canónico (Ej: Kamehameha x10, Getsuga Jūjishō)" 
                                value={item.name} 
                                onChange={e => updateArsenalItem('superAttacks', idx, 'name', e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-orange-300 font-bold text-xs" 
                              />
                              <button type="button" onClick={() => removeArsenalItem('superAttacks', idx)} className="text-red-400 hover:text-red-300 text-xs font-bold p-1">✕</button>
                            </div>
                            <textarea 
                              rows={1} 
                              placeholder="Descripción del efecto, velocidad y rango..." 
                              value={item.desc} 
                              onChange={e => updateArsenalItem('superAttacks', idx, 'desc', e.target.value)} 
                              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-300 text-xs" 
                            />
                            <input 
                              type="text" 
                              placeholder="Coste (Ej: 15% Ki, 2 seg de carga)" 
                              value={item.cost} 
                              onChange={e => updateArsenalItem('superAttacks', idx, 'cost', e.target.value)} 
                              className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-400 text-[10px]" 
                            />
                          </>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-orange-300 text-xs">{item.name}</span>
                              {item.cost && <span className="text-[10px] text-amber-500/80 font-mono">Coste: {item.cost}</span>}
                            </div>
                            <p className="text-slate-300 text-[11px] mt-0.5">{item.desc}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Ataques Definitivos (Ultimates) */}
              <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <label className="text-red-400 font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-red-500" /> Ataques Definitivos (Ultimates / Finisher)
                    </label>
                    <p className="text-[10px] text-red-400/70">Ryūken, Super Genkidama Universal, Hollow Purple 200%, Expansión de Dominio.</p>
                  </div>

                  {isEditingMode && (
                    <button 
                      type="button" 
                      onClick={() => addArsenalItem('ultimateAttacks')} 
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      + Añadir Ultimate
                    </button>
                  )}
                </div>

                {(!formData.arsenal?.ultimateAttacks || formData.arsenal.ultimateAttacks.length === 0) ? (
                  <p className="text-slate-500 italic text-[11px]">No hay ataques definitivos registrados.</p>
                ) : (
                  <div className="space-y-2">
                    {formData.arsenal.ultimateAttacks.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 border border-red-900/50 rounded-xl space-y-1.5">
                        {isEditingMode ? (
                          <>
                            <div className="flex items-center justify-between gap-2">
                              <input 
                                type="text" 
                                placeholder="Nombre (Ej: Ryūken Sobrecarga, Borrado Hakai)" 
                                value={item.name} 
                                onChange={e => updateArsenalItem('ultimateAttacks', idx, 'name', e.target.value)} 
                                className="w-full bg-slate-950 border border-red-900/60 rounded p-1.5 text-red-300 font-bold text-xs" 
                              />
                              <button type="button" onClick={() => removeArsenalItem('ultimateAttacks', idx)} className="text-red-400 hover:text-red-300 text-xs font-bold p-1">✕</button>
                            </div>
                            <textarea 
                              rows={1} 
                              placeholder="Efecto destructivo a escala masiva / Borrado atómico..." 
                              value={item.desc} 
                              onChange={e => updateArsenalItem('ultimateAttacks', idx, 'desc', e.target.value)} 
                              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-300 text-xs" 
                            />
                            <input 
                              type="text" 
                              placeholder="Desgaste terminal (Ej: Agota el 90% de energía, fractura ósea)" 
                              value={item.cost} 
                              onChange={e => updateArsenalItem('ultimateAttacks', idx, 'cost', e.target.value)} 
                              className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-red-400 text-[10px]" 
                            />
                          </>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-red-400 text-xs">{item.name}</span>
                              {item.cost && <span className="text-[10px] text-red-400/90 font-mono">⚠️ Coste: {item.cost}</span>}
                            </div>
                            <p className="text-slate-200 text-[11px] mt-0.5">{item.desc}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Habilidades Pasivas y Activas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pasivas */}
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5"/> Habilidades Pasivas</span>
                    {isEditingMode && (
                      <button type="button" onClick={() => addArsenalItem('passives')} className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[9px] font-bold cursor-pointer">+ Pasiva</button>
                    )}
                  </div>
                  <p className="text-[9px] text-emerald-500/70">Zenkai, Regeneración, Adaptación Biológica, Manto Primigenio.</p>
                  <div className="space-y-1.5">
                    {formData.arsenal?.passives?.map((item, idx) => (
                      <div key={idx} className="p-2 bg-slate-900 border border-emerald-900/40 rounded-lg">
                        {isEditingMode ? (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <input type="text" aria-label="Nombre de la pasiva" placeholder="Nombre Pasiva" value={item.name} onChange={e => updateArsenalItem('passives', idx, 'name', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-emerald-300 text-xs font-bold" />
                              <button type="button" onClick={() => removeArsenalItem('passives', idx)} className="text-red-400 ml-1 text-xs">✕</button>
                            </div>
                            <input type="text" aria-label="Efecto de la pasiva" placeholder="Efecto continuo..." value={item.desc} onChange={e => updateArsenalItem('passives', idx, 'desc', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-300 text-[10px]" />
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-emerald-300">{item.name}</span>
                            <p className="text-slate-300 text-[10px]">{item.desc}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activas */}
                <div className="p-3.5 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5"/> Habilidades Activas / Buffs</span>
                    {isEditingMode && (
                      <button type="button" onClick={() => addArsenalItem('actives')} className="px-2 py-0.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-[9px] font-bold cursor-pointer">+ Activa</button>
                    )}
                  </div>
                  <p className="text-[9px] text-cyan-500/70">Teletransportación, Kaiō-ken, Ilusiones, Barrera de Ki.</p>
                  <div className="space-y-1.5">
                    {formData.arsenal?.actives?.map((item, idx) => (
                      <div key={idx} className="p-2 bg-slate-900 border border-cyan-900/40 rounded-lg">
                        {isEditingMode ? (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <input type="text" aria-label="Nombre de la habilidad activa" placeholder="Nombre Activa" value={item.name} onChange={e => updateArsenalItem('actives', idx, 'name', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-cyan-300 text-xs font-bold" />
                              <button type="button" onClick={() => removeArsenalItem('actives', idx)} className="text-red-400 ml-1 text-xs">✕</button>
                            </div>
                            <input type="text" aria-label="Efecto de la habilidad activa" placeholder="Efecto y duración..." value={item.desc} onChange={e => updateArsenalItem('actives', idx, 'desc', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-slate-300 text-[10px]" />
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-cyan-300">{item.name}</span>
                            <p className="text-slate-300 text-[10px]">{item.desc}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HAX & TAGS */}
          {activeTab === 'hax' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-fuchsia-400 font-bold mb-1 flex items-center gap-2 text-sm font-cinzel">
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  Matriz de Hax & Resistencias Especiales ({formData.haxTags?.length || 0} activos)
                </h3>
                <p className="text-[10px] text-slate-400">
                  Tags de combate que el motor OMNI-TITÁN evalúa con máxima prioridad de anulación e interacción.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_HAX_TAGS.map(tag => {
                  const isChecked = (formData.haxTags || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      disabled={!isEditingMode}
                      onClick={() => toggleHaxTag(tag)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between text-xs cursor-pointer ${
                        isChecked 
                          ? 'bg-fuchsia-950/80 border-fuchsia-500 text-fuchsia-200 shadow-[0_0_10px_rgba(217,70,239,0.2)] font-bold' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      } ${!isEditingMode && !isChecked ? 'opacity-40' : ''}`}
                    >
                      <span>{tag}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${isChecked ? 'bg-fuchsia-400 shadow-[0_0_8px_#d946ef]' : 'bg-slate-700'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: CINÉTICA & VELOCIDAD */}
          {activeTab === 'cinetica' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-cyan-400 font-bold flex items-center gap-2 text-sm font-cinzel">
                  <Move className="w-4 h-4 text-cyan-400" />
                  Desglose Cinético de Velocidades (VS Battles Codex)
                </h3>
                <p className="text-[10px] text-slate-400">
                  Diferenciación entre combate cuerpo a cuerpo, esquiva reactiva, viaje y proyectiles.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <label className="block text-cyan-400 font-bold text-xs">Combate (Cuerpo a Cuerpo)</label>
                  <p className="text-[10px] text-slate-500">Velocidad en intercambios físicos continuos.</p>
                  {isEditingMode ? (
                    <input type="text" name="speed_combat" aria-label="Velocidad de combate" placeholder="Ej: MFTL+, Inconmensurable, Relativista" value={formData.speed?.combat || ''} onChange={e => handleNestedChange('speed', 'combat', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white" />
                  ) : (
                    <p className="text-slate-200 font-bold">{formData.speed?.combat || 'No especificada'}</p>
                  )}
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <label className="block text-cyan-400 font-bold text-xs">Reacción (Esquiva / Reflejos)</label>
                  <p className="text-[10px] text-slate-500">Tiempo de procesamiento ante ataques a quemarropa.</p>
                  {isEditingMode ? (
                    <input type="text" name="speed_reaction" aria-label="Velocidad de reacción" placeholder="Ej: Inconmensurable, Nanosegundos, FTL" value={formData.speed?.reaction || ''} onChange={e => handleNestedChange('speed', 'reaction', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white" />
                  ) : (
                    <p className="text-slate-200 font-bold">{formData.speed?.reaction || 'No especificada'}</p>
                  )}
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <label className="block text-cyan-400 font-bold text-xs">Desplazamiento (Viaje / Vuelo)</label>
                  <p className="text-[10px] text-slate-500">Velocidad en línea recta de punto A a punto B.</p>
                  {isEditingMode ? (
                    <input type="text" name="speed_travel" aria-label="Velocidad de desplazamiento" placeholder="Ej: MFTL+ (Intergaláctico), Supersónico" value={formData.speed?.travel || ''} onChange={e => handleNestedChange('speed', 'travel', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white" />
                  ) : (
                    <p className="text-slate-200 font-bold">{formData.speed?.travel || 'No especificada'}</p>
                  )}
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <label className="block text-cyan-400 font-bold text-xs">Ataque (Proyectiles / Rayos)</label>
                  <p className="text-[10px] text-slate-500">Velocidad de salida de haces de energía y armas.</p>
                  {isEditingMode ? (
                    <input type="text" placeholder="Ej: Velocidad de la Luz, Instantánea" value={formData.speed?.attack || ''} onChange={e => handleNestedChange('speed', 'attack', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white" />
                  ) : (
                    <p className="text-slate-200 font-bold">{formData.speed?.attack || 'No especificada'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BIOMECÁNICA & SALUD */}
          {activeTab === 'biomecanica' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl space-y-1">
                <label className="block text-emerald-400 font-bold mb-1 flex items-center gap-2">
                  <Battery className="w-4 h-4 text-emerald-400"/> Stamina / Límite Térmico & Reservas de Ki
                </label>
                <p className="text-[10px] text-emerald-500/70 mb-2">Desgaste antes de fatiga terminal, colapso de órganos o daño autoinfligido.</p>
                {isEditingMode ? (
                  <textarea rows={2} value={formData.stamina || ''} onChange={e => handleChange('stamina', e.target.value)} className="w-full bg-slate-900 border border-emerald-900/50 rounded-lg p-2 text-white text-xs" />
                ) : (
                  <p className="text-emerald-100 leading-relaxed">{formData.stamina || 'Media / Estándar'}</p>
                )}
              </div>

              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-1">
                <label className="block text-cyan-400 mb-1 font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5"/> Durabilidad y Barreras
                </label>
                {isEditingMode ? (
                  <textarea rows={2} value={formData.durability || ''} onChange={e => handleChange('durability', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs" />
                ) : (
                  <p className="text-slate-200 leading-relaxed">{formData.durability || 'Sin durabilidad especial registrada.'}</p>
                )}
              </div>

              <div className="p-4 bg-red-950/20 border border-red-500/40 rounded-2xl space-y-1">
                <label className="block text-red-400 mb-1 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5"/> Debilidades Anatómicas & Condición de Derrota
                </label>
                {isEditingMode ? (
                  <textarea rows={2} value={typeof formData.weaknesses === 'string' ? formData.weaknesses : (Array.isArray(formData.weaknesses) ? formData.weaknesses.map(w => typeof w === 'object' ? (w.name ? `${w.name}: ${w.desc || ''}` : JSON.stringify(w)) : String(w)).join('\n') : '')} onChange={e => handleChange('weaknesses', e.target.value)} className="w-full bg-slate-900 border border-red-900/50 rounded-lg p-2 text-white text-xs" />
                ) : (
                  <div className="text-red-200 leading-relaxed text-xs">
                    {Array.isArray(formData.weaknesses) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {formData.weaknesses.map((w, wIdx) => (
                          <li key={wIdx}>{typeof w === 'object' ? `${w.name || 'Debilidad'}: ${w.desc || ''}` : String(w)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{typeof formData.weaknesses === 'object' && formData.weaknesses !== null ? (formData.weaknesses.desc || formData.weaknesses.name || JSON.stringify(formData.weaknesses)) : (formData.weaknesses || 'Ninguna conocida.')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: STANDS / ENTIDADES EXTERNAS / ARMAS */}
          {activeTab === 'invocaciones' && (
            <div className="space-y-4">
              {/* External Entity Controller Header (e.g. Dr. Raichi) */}
              {isEntityCommander && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/40 shadow-xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      <h4 className="font-bold text-white text-sm font-cinzel">
                        Controlador Espectral: {formData.narrativeCombatProfile?.externalEntityController?.coreArtifact || 'Núcleo Psiónico'}
                      </h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 font-mono text-[10px] font-bold">
                      🛡️ bodyStatIsolation: STRICT
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {formData.narrativeCombatProfile?.commanderRole?.coreDescription ||
                     'Las invocaciones y proyecciones no alteran el Ki base, Tier ni multiplicador corporal del personaje.'}
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 font-semibold">Tier Corporal del Usuario:</span>
                      <span className="font-mono text-white font-bold">{formData.tier} (Sin alteración por fantasmas)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 font-semibold">Ki Corporal Base:</span>
                      <span className="font-mono text-white font-bold">{formData.forms?.[0]?.kiFormatted || '24.52 Mil'} (1x)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Canonical Ghost Archive (5 confirmed DBM summons) */}
              {canonicalGhosts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2 font-cinzel">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      Archivo Fantasma Canónico ({canonicalGhosts.length} Unidades DBM)
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">confirmed_dbm_onscreen</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {canonicalGhosts.map((ghost, gIdx) => (
                      <div key={gIdx} className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400/60 transition space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-xs">{ghost.displayName}</span>
                          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono">
                            {ghost.combatRole}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">{ghost.evidenceNote}</p>
                        {ghost.restrictions && (
                          <div className="p-1.5 rounded bg-amber-950/40 border border-amber-500/30 text-[10px] text-amber-300">
                            ⚠️ {ghost.restrictions}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                          <span>Cooldown: <strong className="text-slate-200">{ghost.cooldownPolicy}</strong></span>
                          <span>Counter: <strong className="text-slate-200">{(ghost.counterplayTags || []).slice(0, 2).join(', ')}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy Summon Reference (Fantasma de Broly LSSJ) */}
              {legacyGhosts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2 font-cinzel">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Invocación Élite Legacy (No Seleccionable como Forma Propia)
                  </h4>
                  {legacyGhosts.map((leg, lIdx) => (
                    <div key={lIdx} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-200 text-xs">{leg.displayName}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                          {leg.availability}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{leg.notes}</p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Tags: {(leg.counterplayTags || []).join(' | ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Contextual Resonance Library */}
              {resonanceGhosts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2 font-cinzel">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Biblioteca de Resonancia Contextual ({resonanceGhosts.length} Proyecciones)
                    </h4>
                    <span className="text-[10px] text-purple-400 font-mono">simulationDesignOnly</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Proyecciones cualitativas activadas por rencor histórico ante oponentes o escenarios compatibles. No son invocables por defecto ni forman parte del arsenal canónico en pantalla.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {resonanceGhosts.map((res, rIdx) => (
                      <div key={rIdx} className="p-2.5 rounded-lg bg-slate-950/60 border border-purple-900/40 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200 text-[11px] truncate max-w-[180px]">{res.recordName}</span>
                          <span className="text-[9px] font-mono text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded">
                            {res.relationshipStatus || 'Contextual'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2">{res.designNotes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hatchiyack Contingency Proposal */}
              {formData.hatchiyackManifestEventProposal && (
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-300">Contingencia Hatchiyack (Propuesta de Modelo)</span>
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 font-mono text-[10px]">
                      {formData.hatchiyackManifestEventProposal.status || 'PROPOSAL_ONLY_NOT_ACTIVE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {formData.hatchiyackManifestEventProposal.condition}
                  </p>
                </div>
              )}

              {/* Standard Sub-Entity / Stand / Invocación */}
              <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-2xl space-y-2">
                <label className="block text-purple-400 font-bold mb-1 flex items-center gap-2">
                  <Users className="w-4 h-4"/> Sub-Entidad / Stand / Invocación / Simbionte
                </label>
                <p className="text-[10px] text-purple-400/70 mb-2">Para personajes con entidades ligadas (Stands de Jojo, Mahoraga, Venom, Kurama, Sombras de Sung Jin-woo).</p>
                <div className="space-y-2">
                  {isEditingMode ? (
                    <>
                      <input type="text" placeholder="Nombre de la Entidad (Ej: Star Platinum, Mahoraga)" value={formData.subEntity?.name || ''} onChange={e => handleNestedChange('subEntity', 'name', e.target.value)} className="w-full bg-slate-900 border border-purple-900/50 rounded p-2 text-white text-xs" />
                      <textarea rows={2} placeholder="Stats de la entidad, rango y reglas de daño compartido..." value={formData.subEntity?.stats || ''} onChange={e => handleNestedChange('subEntity', 'stats', e.target.value)} className="w-full bg-slate-900 border border-purple-900/50 rounded p-2 text-white text-xs" />
                    </>
                  ) : (
                    <div>
                      <p className="font-bold text-purple-300 text-sm">{formData.subEntity?.name || 'Ninguna entidad ligada.'}</p>
                      {formData.subEntity?.stats && (
                        <p className="text-slate-300 mt-1 leading-relaxed">
                          {typeof formData.subEntity.stats === 'object'
                            ? (formData.subEntity.stats.ap || Object.values(formData.subEntity.stats).join(' | '))
                            : formData.subEntity.stats}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Equipment */}
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-1">
                <label className="block text-amber-400 mb-1 font-bold flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5"/> Armamento, Reliquias & Objetos Clave
                </label>
                {isEditingMode ? (
                  <textarea rows={2} placeholder="Espada Z, Anillo del Tiempo, Mjolnir, armaduras..." value={formData.equipment || ''} onChange={e => handleChange('equipment', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs" />
                ) : (
                  <p className="text-slate-200 leading-relaxed">{formData.equipment || 'Sin equipamiento especial.'}</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: PSICOLOGÍA & IQ */}
          {/* TAB 9: CÓDICE CHŌZENSHŪ (canon oficial verificado) */}
          {activeTab === 'codice' && (
            <CharacterCanonPanel
              character={formData}
              lang={lang}
              onApplyTechniques={importCanonTechniques}
              feedback={canonImportInfo}
            />
          )}

          {activeTab === 'psicologia' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl space-y-1">
                <label className="block text-indigo-400 font-bold mb-1 flex items-center gap-2">
                  <Brain className="w-4 h-4"/> Battle IQ (Inteligencia Táctica en Combate)
                </label>
                {isEditingMode ? (
                  <input type="text" placeholder="Ej: Genio Táctico, Adaptación Instantánea, Estratega Maestro" value={formData.battleIQ || ''} onChange={e => handleChange('battleIQ', e.target.value)} className="w-full bg-slate-900 border border-indigo-900/50 rounded-lg p-2 text-white text-xs" />
                ) : (
                  <p className="text-indigo-100 font-bold">{formData.battleIQ || 'Estándar'}</p>
                )}
              </div>

              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-1">
                <label className="block text-fuchsia-400 mb-1 font-bold">Psicología Tripartita y Microgestos</label>
                <p className="text-[10px] text-slate-500 mb-2">Lo que busca, lo que teme y qué gestos físicos le delatan cuando miente, sufre o enfurece (ADN OMNI-TITÁN).</p>
                {isEditingMode ? (
                  <textarea rows={3} value={formData.psychology || ''} onChange={e => handleChange('psychology', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs" />
                ) : (
                  <p className="text-slate-200 leading-relaxed">{formData.psychology || 'Psicología estándar de combate.'}</p>
                )}
              </div>
            </div>
          )}

          {/* BOTTOM TAB STEPPER NAVIGATION BAR (Effortless switching on Mobile & PC) */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
            {prevTab ? (
              <button
                type="button"
                onClick={() => setActiveTab(prevTab.id)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold transition flex items-center gap-1.5 border border-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior: {prevTab.shortLabel}</span>
              </button>
            ) : <div />}

            {nextTab ? (
              <button
                type="button"
                onClick={() => setActiveTab(nextTab.id)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-950 cursor-pointer ml-auto"
              >
                <span>Siguiente: {nextTab.shortLabel}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : <div />}
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/90 rounded-b-2xl flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
            {isEditingMode ? '✏️ Modo Edición Activo' : '👁️ Modo Lectura / Inspección'}
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button 
              onClick={onClose} 
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-800"
            >
              {isEditingMode ? 'Cerrar' : 'Entendido'}
            </button>

            {isEditingMode && (
              <button 
                onClick={() => { 
                  if (onSave) {
                    const img = formData.avatar || formData.image || '';
                    onSave({
                      ...formData,
                      avatar: img,
                      image: img
                    });
                  } 
                  onClose(); 
                }} 
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-red-950/50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Ficha</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Cirujano IA - Refinamiento Selectivo de Campos */}
        {showRefineModal && (
          <div 
            onClick={() => setShowRefineModal(false)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-950 border border-purple-500/50 rounded-2xl p-6 max-w-xl w-full flex flex-col space-y-4 shadow-[0_0_50px_rgba(168,85,247,0.3)] font-mono text-xs animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-cinzel">
                      Cirujano IA: Edición Quirúrgica de Ficha
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Modifica o añade partes concretas sin tocar el resto de la ficha
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowRefineModal(false)} 
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Selector de Sección a Refinar */}
              <div className="space-y-2">
                <label className="block text-purple-300 font-bold text-[11px]">
                  1. Elige qué sección deseas modificar:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                  {[
                    { id: 'arsenal', label: '⚔️ Arsenal & Técnicas' },
                    { id: 'stats', label: '⚡ Stats & Tiers' },
                    { id: 'haxTags', label: '🏷️ Habilidades & Hax' },
                    { id: 'forms', label: '🌀 Transformaciones' },
                    { id: 'psychology', label: '🧠 Psicología & IQ' },
                    { id: 'all', label: '✨ Ficha Completa' }
                  ].map(sec => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setRefineSection(sec.id)}
                      className={`p-2 rounded-xl border text-left font-bold transition cursor-pointer ${
                        refineSection === sec.id
                          ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-md shadow-purple-950/50'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instrucción personalizada */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold text-[11px]">
                  2. ¿Qué cambio exacto quieres que haga la IA?:
                </label>
                <textarea
                  rows={3}
                  value={refineInstruction}
                  onChange={(e) => setRefineInstruction(e.target.value)}
                  placeholder="Ej: Añade la técnica Ryūken con su descripción y nombres oficiales en Japonés, o ajusta la velocidad a MFTL+ sin tocar su AP..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs placeholder-slate-500 focus:border-purple-500 outline-none resize-none"
                />
              </div>

              {/* Presets de 1-Clic */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 block">Sugerencias rápidas de 1-clic:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRefineInstruction('Traduce y añade los nombres canónicos de todas sus técnicas en Japonés (Rōmaji) e Inglés oficial.')}
                    className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-purple-500 text-[9px] text-slate-300 transition cursor-pointer"
                  >
                    🇯🇵 Nombres canónicos en Japonés
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefineInstruction('Calibra y ajusta rigurosamente su Tier y AP según sus hazañas más destructivas en el canon.')}
                    className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-purple-500 text-[9px] text-slate-300 transition cursor-pointer"
                  >
                    📊 Calibrar Tier de Poder
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefineInstruction('Añade sus transformaciones y multiplicadores de poder oficiales.')}
                    className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-purple-500 text-[9px] text-slate-300 transition cursor-pointer"
                  >
                    🌀 Añadir Transformaciones
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRefineModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleRefineSection()}
                  disabled={isRefining}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-purple-950/60 disabled:opacity-50 cursor-pointer"
                >
                  {isRefining ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Operando Ficha...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>⚡ Aplicar Cirugía IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
