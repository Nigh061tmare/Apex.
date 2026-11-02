import React, { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import CharacterCard from './components/CharacterCard';
import CharacterModal from './components/CharacterModal';
import ScenarioPanel from './components/ScenarioPanel';
import MatchupMatrix from './components/MatchupMatrix';
import SimulationViewer from './components/SimulationViewer';
import MultiFighterPanel from './components/MultiFighterPanel';
import MerchBanner from './components/MerchBanner';
import AdBanner from './components/AdBanner';

// Modales secundarios cargados perezosamente (Code Splitting)
const ChronicleViewer = lazy(() => import('./components/ChronicleViewer'));
const WhatIfTree = lazy(() => import('./components/WhatIfTree'));
const VaultBrowserModal = lazy(() => import('./components/VaultBrowserModal'));
const AiConfigModal = lazy(() => import('./components/AiConfigModal'));
const TournamentModal = lazy(() => import('./components/TournamentModal'));
const TierListModal = lazy(() => import('./components/TierListModal'));
const CardExporterModal = lazy(() => import('./components/CardExporterModal'));
const StatComparatorModal = lazy(() => import('./components/StatComparatorModal'));
const CommunityVaultModal = lazy(() => import('./components/CommunityVaultModal'));
const BatchAiImporterModal = lazy(() => import('./components/BatchAiImporterModal'));
const VipModal = lazy(() => import('./components/VipModal'));
const RosterManagerModal = lazy(() => import('./components/RosterManagerModal'));
const RandomMatchmakerModal = lazy(() => import('./components/RandomMatchmakerModal'));
const ModesGuideModal = lazy(() => import('./components/ModesGuideModal'));
const PowerscalingGuideModal = lazy(() => import('./components/PowerscalingGuideModal'));
const AiSmartMatchmakerModal = lazy(() => import('./components/AiSmartMatchmakerModal'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const FusionModal = lazy(() => import('./components/FusionModal'));
const RecordsModal = lazy(() => import('./components/RecordsModal'));
// Códice Chōzenshū: corpus canónico Dragon Ball (Chozenshu 1-4) empaquetado para el navegador.
const ChozenshuCodexModal = lazy(() => import('./components/ChozenshuCodexModal'));
import { CloudSync } from './services/cloudSyncService';
import { loadRoster } from './data/rosterLoader';
import { getDailyMatchup, buildShareableUrl, parseShareableUrl } from './lib/dailyMatchup';
import { SCENARIOS } from './data/scenarios';
import { SimulationEngine } from './services/simulationEngine';
import { createInitialCombatState } from './data/combatState';
import { SoundFX } from './services/soundFx';
import { getTranslation } from './services/i18n';
import { Sparkles, Key, Settings, BookOpen, Swords, X, GitBranch, Scale, Globe, Shuffle, Wand2, Trophy } from 'lucide-react';

const STORAGE_KEY_CHARACTERS = 'apex_custom_characters';

// Roster canónico (cargado de forma diferida vía loadRoster para no bloquear
// el chunk inicial con ~10 MB de perfiles tácticos). Todas las lecturas usan
// esta variable a nivel de módulo, poblada justo después del primer paint.
let INITIAL_CHARACTERS = [];

const DEFAULT_AI_CONFIG = {
  characterEngine: {
    engine: 'gemini',
    model: 'gemini-flash-lite-latest',
    apiKey: '',
    customBaseUrl: ''
  },
  simulationEngine: {
    engine: 'gemini',
    model: 'gemini-flash-lite-latest',
    apiKey: '',
    customBaseUrl: ''
  }
};

const ROSTER_VERSION = 'v26.0_CANONICAL';

export default function App() {
  // Load characters: el roster canónico se inyecta tras el primer paint vía
  // loadRoster(); aquí solo se restauran las fichas personalizadas guardadas.
  const [characters, setCharacters] = useState(() => {
    try {
      localStorage.setItem('apex_roster_version', ROSTER_VERSION);
      const saved = localStorage.getItem(STORAGE_KEY_CHARACTERS);
      const customOnly = [];
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Conserva solo fichas estrictamente custom para respetar la cuota de 5MB
            customOnly.push(...parsed.filter(c => (c.id?.startsWith('custom-') || c.isCustom)));
          }
        } catch (e) {}
      }
      return customOnly;
    } catch (e) {
      console.error('Error cargando personajes:', e);
      return [];
    }
  });

  const [rosterReady, setRosterReady] = useState(false);

  // Carga diferida del roster canónico (chunk separado ~9MB)
  useEffect(() => {
    let active = true;
    loadRoster().then(({ list }) => {
      if (!active) return;
      INITIAL_CHARACTERS = list;
      setCharacters(prev => {
        const customOnly = prev.filter(c => c.id?.startsWith('custom-') || c.isCustom);
        return [...list, ...customOnly];
      });
      setRosterReady(true);
    }).catch(err => {
      console.error('Error fatal cargando el roster canónico APEX:', err);
      if (active) setRosterReady(true); // Evita pantalla infinita aunque falle
    });
    return () => { active = false; };
  }, []);

  // Rellena selecciones por defecto en cuanto el roster está disponible
  useEffect(() => {
    if (!rosterReady || INITIAL_CHARACTERS.length === 0) return;
    const list = INITIAL_CHARACTERS;

    // 1. Si llegamos por un enlace compartido (?charA=id&charB=id&mode=x) se respeta
    const shared = parseShareableUrl();
    if (shared) {
      const foundA = shared.charA ? list.find(c => c.id === shared.charA) : null;
      const foundB = shared.charB ? list.find(c => c.id === shared.charB) : null;
      if (foundA || foundB) {
        if (foundA) setCharA(foundA);
        if (foundB) setCharB(foundB);
        if (shared.mode && ['1v1', 'teams', 'raid', 'battle_royale'].includes(shared.mode)) setMatchMode(shared.mode);
        // Limpia la URL para que recargas no queden ancladas al enlace
        try { window.history.replaceState(null, '', window.location.pathname); } catch (e) {}
        return;
      }
    }

    // 2. Por defecto: primeros luchadores canónicos
    setCharA(prev => (prev && prev.id ? prev : (list[0] || null)));
    setCharB(prev => (prev && prev.id ? prev : (list[1] || list[0] || null)));
    setTeamA(prev => (Array.isArray(prev) && prev.length > 0 ? prev : [list[0], list[1]].filter(Boolean)));
    setTeamB(prev => (Array.isArray(prev) && prev.length > 0 ? prev : [list[2], list[3]].filter(Boolean)));
    setBattleRoyale(prev => (Array.isArray(prev) && prev.length > 0 ? prev : list.slice(0, 4)));
    setMultiTeams(prev => (Array.isArray(prev) && prev.length >= 2
      ? prev
      : [
          { id: 'alfa', name: 'Equipo Alfa', color: 'red', members: [list[0], list[1]].filter(Boolean) },
          { id: 'beta', name: 'Equipo Beta', color: 'blue', members: [list[2], list[3]].filter(Boolean) }
        ]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterReady]);

  // Combate del Día: enfrentamiento determinista por fecha (retención social)
  const dailyMatchup = rosterReady && characters.length >= 2 ? getDailyMatchup(characters) : null;

  const handleApplyDailyMatchup = () => {
    if (!dailyMatchup) return;
    setMatchMode('1v1');
    setCharA(dailyMatchup.charA);
    setCharB(dailyMatchup.charB);
    setActiveTab('arena');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyMatchupLink = async () => {
    const url = buildShareableUrl(charA, charB, matchMode);
    try {
      await navigator.clipboard.writeText(url);
      alert(`🔗 Enlace de combate copiado al portapapeles:\n${url}`);
    } catch (e) {
      window.prompt('Copia este enlace para compartir tu combate:', url);
    }
  };

  // Auto-upgrade if INITIAL_CHARACTERS has been expanded
  useEffect(() => {
    if (characters.length < INITIAL_CHARACTERS.length) {
      console.log(`[Roster Auto-Upgrade] Actualizando roster en memoria de ${characters.length} a ${INITIAL_CHARACTERS.length} personajes...`);
      const builtinIds = new Set(INITIAL_CHARACTERS.map(c => c.id));
      const customOnly = characters.filter(c => !builtinIds.has(c.id) && (c.id?.startsWith('custom-') || c.isCustom));
      const merged = [...INITIAL_CHARACTERS, ...customOnly];
      setCharacters(merged);
      try {
        localStorage.setItem(STORAGE_KEY_CHARACTERS, JSON.stringify(customOnly));
      } catch (e) {}
    }
  }, [characters.length]);

  const handleResetMasterRoster = () => {
    const builtinIds = new Set(INITIAL_CHARACTERS.map(c => c.id));
    const customOnly = characters.filter(c => !builtinIds.has(c.id) && (c.id?.startsWith('custom-') || c.isCustom));
    const merged = [...INITIAL_CHARACTERS, ...customOnly];
    setCharacters(merged);
    try {
      localStorage.setItem(STORAGE_KEY_CHARACTERS, JSON.stringify(customOnly));
      localStorage.removeItem('apex_selected_charA');
      localStorage.removeItem('apex_selected_charB');
    } catch (e) {}
    return merged.length;
  };

  const resolveLatestCharacter = (c, roster) => {
    if (!c || !c.id) return c;
    const pool = roster && roster.length ? roster : INITIAL_CHARACTERS;
    const found = pool.find(x => x.id === c.id);
    if (!found) return c;
    return {
      ...found,
      _activeFormIndex: c._activeFormIndex,
      _activeFormId: c._activeFormId,
      _formLimitIndex: c._formLimitIndex
    };
  };

  const [charA, setCharA] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_selected_charA');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return resolveLatestCharacter(parsed, INITIAL_CHARACTERS);
      }
    } catch {}
    return characters[0] || INITIAL_CHARACTERS[0];
  });

  const [charB, setCharB] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_selected_charB');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return resolveLatestCharacter(parsed, INITIAL_CHARACTERS);
      }
    } catch {}
    return characters[1] || INITIAL_CHARACTERS[1] || INITIAL_CHARACTERS[0];
  });

  // Always keep charA & charB in sync with master roster definitions
  useEffect(() => {
    if (charA?.id) {
      const latest = characters.find(c => c.id === charA.id);
      if (latest && (latest.tier !== charA.tier || latest.forms?.[0]?.tier !== charA.forms?.[0]?.tier || latest.forms?.[0]?.tierExact !== charA.forms?.[0]?.tierExact)) {
        setCharA(prev => ({ ...latest, _activeFormIndex: prev._activeFormIndex, _activeFormId: prev._activeFormId, _formLimitIndex: prev._formLimitIndex }));
      }
    }
  }, [characters, charA?.id]);

  useEffect(() => {
    if (charB?.id) {
      const latest = characters.find(c => c.id === charB.id);
      if (latest && (latest.tier !== charB.tier || latest.forms?.[0]?.tier !== charB.forms?.[0]?.tier || latest.forms?.[0]?.tierExact !== charB.forms?.[0]?.tierExact)) {
        setCharB(prev => ({ ...latest, _activeFormIndex: prev._activeFormIndex, _activeFormId: prev._activeFormId, _formLimitIndex: prev._formLimitIndex }));
      }
    }
  }, [characters, charB?.id]);

  const [matchMode, setMatchMode] = useState(() => {
    try {
      return localStorage.getItem('apex_selected_matchMode') || '1v1';
    } catch {
      return '1v1';
    }
  });

  const [teamA, setTeamA] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_selected_teamA');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [characters[0] || INITIAL_CHARACTERS[0], characters[1] || INITIAL_CHARACTERS[1] || INITIAL_CHARACTERS[0]];
  });

  const [teamB, setTeamB] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_selected_teamB');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [characters[2] || INITIAL_CHARACTERS[1] || INITIAL_CHARACTERS[0], characters[3] || INITIAL_CHARACTERS[0]];
  });

  const [battleRoyale, setBattleRoyale] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_selected_battleRoyale');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return characters.slice(0, 4);
  });

  const [bossMinions, setBossMinions] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_selected_bossMinions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [multiTeams, setMultiTeams] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_selected_multiTeams');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
      }
    } catch {}
    return [
      { id: 'alfa', name: 'Equipo Alfa', color: 'red', members: [characters[0] || INITIAL_CHARACTERS[0], characters[1] || INITIAL_CHARACTERS[1] || INITIAL_CHARACTERS[0]] },
      { id: 'beta', name: 'Equipo Beta', color: 'blue', members: [characters[2] || INITIAL_CHARACTERS[1] || INITIAL_CHARACTERS[0], characters[3] || INITIAL_CHARACTERS[0]] }
    ];
  });

  const [scenario, setScenario] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_selected_scenario');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
    } catch {}
    return SCENARIOS[0];
  });

  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('apex_selected_mode') || 'MODO VS';
    } catch {
      return 'MODO VS';
    }
  });

  const [modifiers, setModifiers] = useState(() => {
    const defaultMods = {
      bloodlust: false,
      speedEqualized: false,
      statsEqualized: false,
      verseEqualization: false,
      prepTime: 'Sin Preparación (Encuentro Espontáneo)',
      healthState: '100% Óptimo (Sin Heridas / Energía Plena)',
      winCondition: 'Muerte o Incapacitación Total',
      narrativePreset: 'Equilibrado',
      blackSwan: false,
      butterflyEffect: true,
      simulationMode: 'fases',
      customContext: ''
    };
    try {
      const saved = localStorage.getItem('apex_selected_modifiers');
      if (saved) {
        return { ...defaultMods, ...JSON.parse(saved) };
      }
    } catch {}
    return defaultMods;
  });

  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('apex_selected_activeTab') || 'arena';
    } catch {
      return 'arena';
    }
  });

  const handleApplyAiMatchup = (parsed, autoStart = false) => {
    if (!parsed) return;
    
    // 1. Set match mode and assign fighters with active forms
    if (parsed.mode === 'boss' || parsed.mode === '1vN') {
      setMatchMode('1vN');
      if (parsed.boss?.id) {
        let found = characters.find(c => c.id === parsed.boss.id);
        if (found) {
          if (parsed.boss.requestedForm && found.forms) {
            const formIdx = found.forms.findIndex(f => f.id === parsed.boss.requestedForm || f.name.toLowerCase().includes(parsed.boss.requestedForm.toLowerCase()));
            if (formIdx >= 0) found = { ...found, _activeFormIndex: formIdx, _activeFormId: found.forms[formIdx].id };
          }
          setCharA(found);
        }
      }
      if (parsed.squad && Array.isArray(parsed.squad) && parsed.squad.length > 0) {
        const squadChars = parsed.squad.map(s => characters.find(c => c.id === s.id)).filter(Boolean);
        if (squadChars.length > 0) setTeamB(squadChars);
      }
    } else if (parsed.mode === 'team' || parsed.mode === 'teams') {
      setMatchMode('teams');
      if (parsed.teamA && Array.isArray(parsed.teamA) && parsed.teamA.length > 0) {
        const aChars = parsed.teamA.map(s => characters.find(c => c.id === s.id)).filter(Boolean);
        if (aChars.length > 0) setTeamA(aChars);
      }
      if (parsed.teamB && Array.isArray(parsed.teamB) && parsed.teamB.length > 0) {
        const bChars = parsed.teamB.map(s => characters.find(c => c.id === s.id)).filter(Boolean);
        if (bChars.length > 0) setTeamB(bChars);
      }
    } else if (parsed.mode === 'battleRoyale' || parsed.mode === 'battle_royale' || parsed.mode === 'royale') {
      setMatchMode('battle_royale');
      if (parsed.battleRoyale && Array.isArray(parsed.battleRoyale) && parsed.battleRoyale.length > 0) {
        const rChars = parsed.battleRoyale.map(s => characters.find(c => c.id === s.id)).filter(Boolean);
        if (rChars.length > 0) setBattleRoyale(rChars);
      }
    } else {
      setMatchMode('1v1');
      if (parsed.charA?.id) {
        let found = characters.find(c => c.id === parsed.charA.id);
        if (found) {
          if (parsed.charA.requestedForm && found.forms) {
            const formIdx = found.forms.findIndex(f => f.id === parsed.charA.requestedForm || f.name.toLowerCase().includes(parsed.charA.requestedForm.toLowerCase()));
            if (formIdx >= 0) found = { ...found, _activeFormIndex: formIdx, _activeFormId: found.forms[formIdx].id };
          }
          setCharA(found);
        }
      }
      if (parsed.charB?.id) {
        let found = characters.find(c => c.id === parsed.charB.id);
        if (found) {
          if (parsed.charB.requestedForm && found.forms) {
            const formIdx = found.forms.findIndex(f => f.id === parsed.charB.requestedForm || f.name.toLowerCase().includes(parsed.charB.requestedForm.toLowerCase()));
            if (formIdx >= 0) found = { ...found, _activeFormIndex: formIdx, _activeFormId: found.forms[formIdx].id };
          }
          setCharB(found);
        }
      }
    }

    // 2. Set scenario if mentioned
    if (parsed.scenario) {
      setScenario(parsed.scenario);
    } else if (parsed.scenarioName) {
      const q = parsed.scenarioName.toLowerCase();
      const scen = SCENARIOS.find(s => s.name.toLowerCase().includes(q) || s.universe.toLowerCase().includes(q));
      if (scen) setScenario(scen);
    }

    // 3. Apply Modifiers & Premise
    if (parsed.modifiers) {
      setModifiers(prev => ({
        ...prev,
        ...parsed.modifiers,
        customContext: parsed.modifiers.customContext || parsed.prompt || prev.customContext
      }));
    }

    // 4. Set active tab
    setActiveTab('arena');

    // 5. If autoStart is requested, trigger simulation
    if (autoStart) {
      setTimeout(() => {
        handleStartSimulation();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 400);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [inspectModal, setInspectModal] = useState({ isOpen: false, character: null, isEditing: false });
  const [cardExportChar, setCardExportChar] = useState(null);
  const [showComparator, setShowComparator] = useState(false);
  const [showCommunityVault, setShowCommunityVault] = useState(false);
  const [batchImporterOpen, setBatchImporterOpen] = useState(false);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalInitialTab, setAiModalInitialTab] = useState(null);
  const [isTournamentOpen, setIsTournamentOpen] = useState(false);
  const [tierListOpen, setTierListOpen] = useState(false);
  const [isAiMatchmakerOpen, setIsAiMatchmakerOpen] = useState(false);
  const [isFusionOpen, setIsFusionOpen] = useState(false);
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [vaultStatus, setVaultStatus] = useState({ connected: false });

  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('apex_user_lang') || 'es';
    } catch {
      return 'es';
    }
  });

  const [isVip, setIsVip] = useState(() => {
    try {
      return localStorage.getItem('apex_vip_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(CloudSync.getCurrentUser());
  const [rosterManagerOpen, setRosterManagerOpen] = useState(false);
  const [modesGuideOpen, setModesGuideOpen] = useState(false);
  const [powerscalingGuideOpen, setPowerscalingGuideOpen] = useState(false);
  const [codexOpen, setCodexOpen] = useState(false);

  useEffect(() => {
    const unsub = CloudSync.subscribe((u) => setCurrentUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('apex_user_lang', lang);
    } catch {}
  }, [lang]);

  const handleActivateVip = (code) => {
    setIsVip(true);
    try {
      localStorage.setItem('apex_vip_unlocked', 'true');
    } catch {}
    const bonusCoins = 10000;
    const newTotal = oracleCoins + bonusCoins;
    setOracleCoins(newTotal);
    try {
      localStorage.setItem('apex_oracle_coins', newTotal.toString());
    } catch {}
    SoundFX.playBetWin?.();
  };

  const handleUpdateRoster = (newRoster) => {
    setCharacters(newRoster);
    try {
      localStorage.setItem(STORAGE_KEY_CHARACTERS, JSON.stringify(newRoster));
    } catch (e) {
      console.error('Error guardando roster reordenado:', e);
    }
  };

  // Monedas del Oráculo & Recompensa de Inicio / Entrada (+50 Monedas)
  const [oracleCoins, setOracleCoins] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_oracle_coins');
      return saved ? parseInt(saved, 10) : 1000;
    } catch {
      return 1000;
    }
  });
  const [rewardToast, setRewardToast] = useState(null);

  useEffect(() => {
    const sessionKey = 'apex_entry_reward_claimed_' + new Date().toDateString();
    const alreadyClaimed = sessionStorage.getItem(sessionKey);
    if (!alreadyClaimed) {
      sessionStorage.setItem(sessionKey, 'true');
      const bonus = 50;
      const newTotal = oracleCoins + bonus;
      setOracleCoins(newTotal);
      try {
        localStorage.setItem('apex_oracle_coins', newTotal.toString());
      } catch (e) {}
      setRewardToast({ amount: bonus, balance: newTotal });
      SoundFX.playBetWin?.();
      const timer = setTimeout(() => setRewardToast(null), 7000);
      return () => clearTimeout(timer);
    }
  }, []);

  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, step: '' });
  
  // Persist only custom characters on change to protect 5MB quota
  useEffect(() => {
    try {
      const builtinIds = new Set(INITIAL_CHARACTERS.map(c => c.id));
      const customOnly = characters.filter(c => !builtinIds.has(c.id) && (c.id?.startsWith('custom-') || c.isCustom));
      localStorage.setItem(STORAGE_KEY_CHARACTERS, JSON.stringify(customOnly));
    } catch (e) {
      console.error('Error guardando personajes en localStorage:', e);
    }
  }, [characters]);

  // Persist selections across page reloads
  useEffect(() => {
    try {
      if (charA) localStorage.setItem('apex_selected_charA', JSON.stringify(charA));
    } catch {}
  }, [charA]);

  useEffect(() => {
    try {
      if (charB) localStorage.setItem('apex_selected_charB', JSON.stringify(charB));
    } catch {}
  }, [charB]);

  useEffect(() => {
    try {
      if (matchMode) localStorage.setItem('apex_selected_matchMode', matchMode);
    } catch {}
  }, [matchMode]);

  useEffect(() => {
    try {
      if (teamA) localStorage.setItem('apex_selected_teamA', JSON.stringify(teamA));
    } catch {}
  }, [teamA]);

  useEffect(() => {
    try {
      if (teamB) localStorage.setItem('apex_selected_teamB', JSON.stringify(teamB));
    } catch {}
  }, [teamB]);

  useEffect(() => {
    try {
      if (battleRoyale) localStorage.setItem('apex_selected_battleRoyale', JSON.stringify(battleRoyale));
    } catch {}
  }, [battleRoyale]);

  useEffect(() => {
    try {
      if (bossMinions) localStorage.setItem('apex_selected_bossMinions', JSON.stringify(bossMinions));
    } catch {}
  }, [bossMinions]);

  useEffect(() => {
    try {
      if (multiTeams) localStorage.setItem('apex_selected_multiTeams', JSON.stringify(multiTeams));
    } catch {}
  }, [multiTeams]);

  useEffect(() => {
    try {
      if (scenario) localStorage.setItem('apex_selected_scenario', JSON.stringify(scenario));
    } catch {}
  }, [scenario]);

  useEffect(() => {
    try {
      if (mode) localStorage.setItem('apex_selected_mode', mode);
    } catch {}
  }, [mode]);

  useEffect(() => {
    try {
      if (modifiers) localStorage.setItem('apex_selected_modifiers', JSON.stringify(modifiers));
    } catch {}
  }, [modifiers]);

  useEffect(() => {
    try {
      if (activeTab) localStorage.setItem('apex_selected_activeTab', activeTab);
    } catch {}
  }, [activeTab]);

  // Persist AI Config in localStorage
  const [aiConfig, setAiConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_ai_config');
      if (!saved) return DEFAULT_AI_CONFIG;
      const parsed = JSON.parse(saved);
      if (parsed.characterEngine && parsed.simulationEngine) {
        return parsed;
      }
      return {
        characterEngine: { ...parsed, engine: 'gemini', model: 'gemini-flash-lite-latest' },
        simulationEngine: { ...parsed, engine: 'gemini', model: 'gemini-flash-lite-latest' }
      };
    } catch (e) {
      return DEFAULT_AI_CONFIG;
    }
  });

  const [simulationResult, setSimulationResult] = useState(() => {
    try {
      const draft = localStorage.getItem('apex_current_simulation_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed?.narrative) return { fullOutput: parsed.narrative };
      }
    } catch {}
    return null;
  });
  const [isRandomizerOpen, setRandomizerOpen] = useState(false);

  const handleRandomMatchReady = (setup) => {
    setMatchMode(setup.matchMode);
    setCharA(setup.charA);
    setCharB(setup.charB);
    if (setup.teamA) setTeamA(setup.teamA);
    if (setup.teamB) setTeamB(setup.teamB);
    if (setup.battleRoyale) setBattleRoyale(setup.battleRoyale);
    
    // Find and set the scenario object based on the ID passed
    const sc = SCENARIOS.find(s => s.id === setup.scenarioId) || SCENARIOS[0];
    setScenario(sc);
    
    setRandomizerOpen(false);
    setActiveTab('arena');
    // Scroll to the simulation viewer to emphasize it's ready
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 300);
  };

  useEffect(() => {
    try {
      fetch('/api/vault/status')
        .then(res => {
          if (!res.ok) throw new Error('Vault offline');
          return res.json();
        })
        .then(data => setVaultStatus(data || { connected: false }))
        .catch(() => setVaultStatus({ connected: false }));
    } catch {
      setVaultStatus({ connected: false });
    }
  }, []);

  const handleSaveAiConfig = (newConfig) => {
    setAiConfig(newConfig);
    try {
      localStorage.setItem('apex_ai_config', JSON.stringify(newConfig));
    } catch (e) {}
  };

  const charEngine = aiConfig.characterEngine || aiConfig;
  const simEngine = aiConfig.simulationEngine || aiConfig;

  const handleStartSimulation = async (opts = {}) => {
    setIsSimulating(true);
    setSimulationResult({ fullOutput: '' });
    setProgress({ percent: 10, step: 'Generando Prompt Maestro OMNI-TITÁN...' });

    try {
      const prompt = SimulationEngine.generateMasterPrompt(
        charA, 
        charB, 
        scenario, 
        { ...modifiers, matchMode, language: lang },
        teamA,
        teamB,
        battleRoyale,
        multiTeams,
        bossMinions
      );
      setProgress({ percent: 25, step: `Conectando con ${simEngine.engine.toUpperCase()} (${simEngine.model})...` });
      
      let currentText = '';
      await SimulationEngine.streamSimulation(
        prompt, 
        simEngine,
        (token) => {
          currentText += token;
          setSimulationResult({ fullOutput: currentText });
          setProgress({ percent: 80, step: 'Generando Prosa de Combate en Vivo...' });
        },
        () => {
          setProgress({ percent: 100, step: 'Simulación Completada' });
          setIsSimulating(false);
        },
        (error) => {
          console.error('Stream error:', error);
          setSimulationResult({ fullOutput: currentText + '\n\n[ERROR: ' + error + ']' });
          setIsSimulating(false);
        }
      );
    } catch (err) {
      console.error('Simulation error:', err);
      setSimulationResult({ fullOutput: `[ERROR CRÍTICO AL INICIAR]: ${err.message || err}` });
      setIsSimulating(false);
    }
  };

  const handleClearSimulation = () => {
    setSimulationResult(null);
    setIsSimulating(false);
    try {
      localStorage.removeItem('apex_current_simulation_draft');
    } catch (e) {}
  };

  const handleContinueTimeline = (chosenFighters = [], targetMode = 'team', targetSquad = 'A') => {
    const chosenIds = chosenFighters.map(c => c.id || c.name);
    const resolvedFighters = characters.filter(c => chosenIds.includes(c.id) || chosenIds.includes(c.name));
    
    if (targetMode === '1v1') {
      setMatchMode('1v1');
      if (targetSquad === 'A') {
        setCharA(resolvedFighters[0] || null);
        setCharB(null);
      } else {
        setCharB(resolvedFighters[0] || null);
        setCharA(null);
      }
    } else if (targetMode === 'raid' || targetMode === '1vN') {
      // En modo RAID el jefe ocupa el slot A (charA) y la escuadra asaltante el slot B (teamB)
      setMatchMode('raid');
      if (targetSquad === 'boss') {
        setCharA(resolvedFighters[0] || null);
        setTeamB([]);
      } else {
        setTeamB(resolvedFighters);
        setCharA(prev => prev || null);
      }
    } else if (targetMode === 'battle_royale' || targetMode === 'ffa') {
      setMatchMode('battle_royale');
      setBattleRoyale(resolvedFighters);
    } else {
      // Por defecto modo equipos
      setMatchMode('team');
      if (targetSquad === 'A') {
        setTeamA(resolvedFighters);
        setTeamB([]);
      } else {
        setTeamB(resolvedFighters);
        setTeamA([]);
      }
    }
    
    setSimulationResult(null);
    try {
      localStorage.removeItem('apex_current_simulation_draft');
    } catch(e) {}
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleContinueSimulation = async (userPromptNext = '') => {
    if (isSimulating) return;
    const baseOutput = simulationResult?.fullOutput || simulationResult?.narrative || simulationResult?.output || '';
    if (!baseOutput) return;

    setIsSimulating(true);
    setProgress({ percent: 15, step: 'Preparando siguiente acto / continuación RPG...' });

    try {
      const effectiveCharA = charA || 'Contendiente A';
      const effectiveCharB = (matchMode === 'raid' || matchMode === 'team') && teamB?.length > 0
        ? `Escuadra Asaltante (${teamB.length}): ${teamB.map(m => m.name || m.id).join(', ')}`
        : (charB || 'Contendiente B');

      const continuationPrompt = SimulationEngine.generateContinuationPrompt(
        baseOutput,
        userPromptNext,
        effectiveCharA,
        effectiveCharB,
        scenario || 'Arena de Combate',
        { ...modifiers, language: lang }
      );

      let currentText = baseOutput + '\n\n';
      if (userPromptNext && typeof userPromptNext === 'string' && userPromptNext.trim()) {
        currentText += `> 🎲 **DECISIÓN TÁCTICA DEL USUARIO:** ${userPromptNext.trim()}\n\n`;
      }

      await SimulationEngine.streamSimulation(
        continuationPrompt,
        simEngine,
        (token) => {
          currentText += token;
          setSimulationResult({ fullOutput: currentText });
          setProgress({ percent: 80, step: 'Escribiendo el siguiente acto del combate...' });
        },
        () => {
          setProgress({ percent: 100, step: 'Siguiente Acto Completado' });
          setIsSimulating(false);
        },
        (error) => {
          console.error('Stream continuation error:', error);
          setSimulationResult({ fullOutput: currentText + '\n\n[ERROR AL GENERAR SIGUIENTE ACTO: ' + error + ']' });
          setIsSimulating(false);
        }
      );
    } catch (err) {
      console.error('Error starting continuation:', err);
      setIsSimulating(false);
    }
  };

  const handleLoadHistoryBattle = (arg1, arg2, arg3, arg4) => {
    if (!arg1) return;
    let narrative = '', charAName = '', charBName = '', scenarioName = '';
    
    if (typeof arg1 === 'object') {
      narrative = arg1.output || arg1.narrative || arg1.fullOutput || '';
      charAName = typeof arg1.charA === 'string' ? arg1.charA : (arg1.charA?.name || '');
      charBName = typeof arg1.charB === 'string' ? arg1.charB : (arg1.charB?.name || '');
      scenarioName = typeof arg1.scenario === 'string' ? arg1.scenario : (arg1.scenario?.name || '');
      if (arg1.matchMode) setMatchMode(arg1.matchMode);
    } else {
      narrative = arg1;
      charAName = typeof arg2 === 'string' ? arg2 : (arg2?.name || '');
      charBName = typeof arg3 === 'string' ? arg3 : (arg3?.name || '');
      scenarioName = typeof arg4 === 'string' ? arg4 : (arg4?.name || '');
    }

    if (narrative) {
      setSimulationResult({ fullOutput: narrative });
      try {
        localStorage.setItem('apex_current_simulation_draft', JSON.stringify({
          narrative,
          charAName,
          charBName,
          scenarioName,
          timestamp: Date.now()
        }));
      } catch (e) {}
    }

    if (charAName) {
      const matchA = characters.find(c => c.name.toLowerCase() === charAName.toLowerCase()) ||
                     characters.find(c => charAName.toLowerCase().includes(c.name.toLowerCase()));
      if (matchA) setCharA(matchA);
      else if (typeof arg2 === 'object' && arg2?.id) setCharA(arg2);
      else setCharA(prev => ({ ...prev, name: charAName }));
    }

    if (charBName) {
      const matchB = characters.find(c => c.name.toLowerCase() === charBName.toLowerCase()) ||
                     characters.find(c => charBName.toLowerCase().includes(c.name.toLowerCase()));
      if (matchB) setCharB(matchB);
      else if (typeof arg3 === 'object' && arg3?.id) setCharB(arg3);
      else setCharB(prev => ({ ...prev, name: charBName }));
    }

    if (scenarioName) {
      const matchSc = SCENARIOS.find(s => s.name.toLowerCase() === scenarioName.toLowerCase()) ||
                      SCENARIOS.find(s => scenarioName.toLowerCase().includes(s.name.toLowerCase()));
      if (matchSc) setScenario(matchSc);
      else if (typeof arg4 === 'object' && arg4?.id) setScenario(arg4);
      else setScenario(prev => ({ ...prev, name: scenarioName }));
    }

    setActiveTab('arena');
  };

  const handleSaveCustomCharacter = (characterData) => {
    setCharacters(prev => {
      const existsIndex = prev.findIndex(c => c.id === characterData.id);
      let updated;
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = characterData;
      } else {
        updated = [characterData, ...prev];
      }
      try {
        localStorage.setItem(STORAGE_KEY_CHARACTERS, JSON.stringify(updated));
        // Auto-sync in background to Cloud if logged in
        CloudSync.triggerAutoSync(() => ({
          characters: updated,
          oracleCoins,
          aiConfig: charEngine
        }));
      } catch (e) {
        console.error('Error guardando en localStorage:', e);
      }
      return updated;
    });

    if (charA?.id === characterData.id) setCharA(characterData);
    if (charB?.id === characterData.id) setCharB(characterData);
  };

  const handleDeleteCharacter = (charId) => {
    if (characters.length <= 2) {
      alert('Debes mantener al menos 2 luchadores en la lista.');
      return;
    }
    const updated = characters.filter(c => c.id !== charId);
    setCharacters(updated);
    if (charA?.id === charId) setCharA(updated[0]);
    if (charB?.id === charId) setCharB(updated[1]);
  };

  // Pantalla de carga: el roster canónico se descarga en un chunk diferido (~9MB),
  // por lo que mostramos un splash elegante mientras se hidrata la app.
  if (!rosterReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#06080d] text-slate-100 select-none">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping" />
          <div className="absolute inset-3 rounded-full border-2 border-amber-400/50 animate-spin border-t-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">⚡</span>
          </div>
        </div>
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-red-500 via-amber-400 to-purple-500 bg-clip-text text-transparent">
          APEX ENGINE
        </h1>
        <p className="mt-2 text-xs font-mono text-slate-500">
          Cargando roster canónico V26 · {INITIAL_CHARACTERS.length || '...'} combatientes · {ROSTER_VERSION}
        </p>
        <div className="mt-4 w-48 h-1 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-red-500 to-amber-400 animate-[shimmer_1.2s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#06080d] text-slate-100">
      <Navbar
        mode={mode}
        setMode={setMode}
        vaultStatus={vaultStatus}
        onOpenVault={() => setVaultModalOpen(true)}
        onOpenNewCharacter={() => setInspectModal({ isOpen: true, character: null, isEditing: true })}
        onOpenAiConfig={(tab) => {
          setAiModalInitialTab(typeof tab === 'string' ? tab : null);
          setAiModalOpen(true);
        }}
        onOpenTournament={() => setIsTournamentOpen(true)}
        onOpenTierList={() => setTierListOpen(true)}
        onOpenComparator={() => setShowComparator(true)}
        onOpenCommunityVault={() => setShowCommunityVault(true)}
        onOpenBatchAiImporter={() => setBatchImporterOpen(true)}
        onOpenRosterManager={() => setRosterManagerOpen(true)}
        onOpenRandomMatchmaker={() => setRandomizerOpen(true)}
        onOpenModesGuide={() => setModesGuideOpen(true)}
        onOpenPowerscalingGuide={() => setPowerscalingGuideOpen(true)}
        onOpenCodex={() => setCodexOpen(true)}
        aiConfig={simEngine}
        allCharacters={characters}
        onImportCharacters={(newChars) => setCharacters(newChars)}
        oracleCoins={oracleCoins}
        lang={lang}
        setLang={setLang}
        isVip={isVip}
        onOpenVipModal={() => setVipModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        currentUser={currentUser}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-6 pb-32 lg:pb-8">
        
        {/* Banner de Estado Dual de los Motores de IA */}
        <div className="p-3.5 px-4 rounded-xl glass-panel border border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Slot 1: Crear Fichas */}
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <BookOpen className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="text-slate-400 block text-[10px]">IA Fichas (JSON):</span>
                <span className="text-indigo-300 font-bold">{charEngine.engine.toUpperCase()} · </span>
                <span className="text-slate-200">{charEngine.model}</span>
              </div>
            </div>

            <span className="text-slate-700 hidden md:inline">|</span>

            {/* Slot 2: Simulación Combate */}
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                <Swords className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="text-slate-400 block text-[10px]">IA Combate (Narrativa):</span>
                <span className="text-red-400 font-bold">{simEngine.engine.toUpperCase()} · </span>
                <span className="text-slate-200">{simEngine.model}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition cursor-pointer border border-slate-700"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Configurar Motores IA</span>
          </button>
        </div>

        {/* Navigation Workspace Suite */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
            <button
              onClick={() => setActiveTab('arena')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeTab === 'arena'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>{getTranslation(lang, 'arenaSim')}</span>
            </button>

            <button
              onClick={() => setActiveTab('whatif')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeTab === 'whatif'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-400" />
              <span>{getTranslation(lang, 'multiverseWhatIf')}</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>{getTranslation(lang, 'matrixStats')}</span>
            </button>

            <button
              onClick={() => setActiveTab('chronicles')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeTab === 'chronicles'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>APEX Crónicas</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-amber-300 border border-amber-500/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>{getTranslation(lang, 'fullView')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setIsAiMatchmakerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-purple-600/30 hover:from-purple-600/50 hover:to-pink-600/50 text-purple-300 border border-purple-500/50 font-bold transition cursor-pointer shadow-md shadow-purple-950/40"
              title="Pedir a la IA que configure cualquier combate con lenguaje natural"
            >
              <Wand2 className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>🪄 Match por Prompt IA</span>
            </button>
            <button
              onClick={() => setIsFusionOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600/30 via-yellow-600/30 to-amber-600/30 hover:from-amber-600/50 hover:to-yellow-600/50 text-amber-300 border border-amber-500/50 font-bold transition cursor-pointer shadow-md shadow-amber-950/40"
              title="Laboratorio de Fusiones Multiversales (Metamoran, Potara, Convergencia Cuántica)"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
              <span>⚗️ Fusiones</span>
            </button>
            <button
              onClick={() => setRandomizerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/50 hover:to-orange-600/50 text-amber-300 border border-amber-500/50 font-bold transition cursor-pointer shadow-md shadow-amber-950/40"
              title="Generar Matchup Aleatorio Cuántico (1v1, Boss Raid, Equipos o Battle Royale)"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>{getTranslation(lang, 'randomMatch')}</span>
            </button>
            <button
              onClick={handleApplyDailyMatchup}
              disabled={!dailyMatchup}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600/30 via-teal-600/30 to-emerald-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 text-emerald-300 border border-emerald-500/50 font-bold transition cursor-pointer shadow-md shadow-emerald-950/40 disabled:opacity-40 disabled:cursor-not-allowed"
              title={`Combate del Día (${dailyMatchup?.dateLabel || 'hoy'}) — enfrentamiento diario para toda la comunidad`}
            >
              <span className="text-sm">⚔️</span>
              <span>Combate del Día</span>
              {dailyMatchup && (
                <span className="hidden md:inline text-[9px] text-emerald-400/80 ml-1">
                  {dailyMatchup.charA?.name?.split(' ').slice(0, 2).join(' ')} vs {dailyMatchup.charB?.name?.split(' ').slice(0, 2).join(' ')}
                </span>
              )}
            </button>
            <button
              onClick={handleCopyMatchupLink}
              disabled={!charA?.id}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Copiar enlace compartible de este combate (quien lo abra verá el mismo enfrentamiento)"
            >
              <span className="text-sm">🔗</span>
              <span className="hidden lg:inline">Copiar Enlace</span>
            </button>
            <button
              onClick={() => setRecordsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer border border-slate-800"
              title="Sala de Récords: top vencedores de tu historial local de combates"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Récords</span>
            </button>
            <button
              onClick={() => setShowComparator(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer border border-slate-800"
            >
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              <span>{getTranslation(lang, 'compare')}</span>
            </button>
            <button
              onClick={() => setShowCommunityVault(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer border border-slate-800"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{getTranslation(lang, 'community')}</span>
            </button>
          </div>
        </div>


        {/* Tab 1: Arena & Simulación */}
        {(activeTab === 'arena' || activeTab === 'all') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <MultiFighterPanel
              matchMode={matchMode}
              setMatchMode={setMatchMode}
              charA={charA}
              setCharA={setCharA}
              charB={charB}
              setCharB={setCharB}
              teamA={teamA}
              setTeamA={setTeamA}
              teamB={teamB}
              setTeamB={setTeamB}
              bossMinions={bossMinions}
              setBossMinions={setBossMinions}
              multiTeams={multiTeams}
              setMultiTeams={setMultiTeams}
              battleRoyale={battleRoyale}
              setBattleRoyale={setBattleRoyale}
              allCharacters={characters}
              modifiers={modifiers}
              setModifiers={setModifiers}
              onInspect={(char) => setInspectModal({ isOpen: true, character: char, isEditing: false })}
              onEdit={(char) => setInspectModal({ isOpen: true, character: char, isEditing: true })}
              onDelete={handleDeleteCharacter}
              onExportCard={(char) => setCardExportChar(char)}
              onOpenAiMatchmaker={() => setIsAiMatchmakerOpen(true)}
              lang={lang}
            />

            <ScenarioPanel
              scenario={scenario}
              setScenario={setScenario}
              modifiers={modifiers}
              setModifiers={setModifiers}
              charA={charA}
              charB={charB}
              matchMode={matchMode}
              teamA={teamA}
              teamB={teamB}
              battleRoyale={battleRoyale}
              aiConfig={charEngine}
              lang={lang}
            />

            {/* Banner de Merchandising / Figuras Oficiales de los Luchadores */}
            <MerchBanner
              charA={charA}
              charB={(matchMode === 'raid' || matchMode === 'team') && teamB?.length > 0 ? teamB[0] : charB}
              isVip={isVip}
              lang={lang}
            />

            <SimulationViewer
              simulationResult={simulationResult}
              isSimulating={isSimulating}
              progress={progress}
              onStartSimulation={handleStartSimulation}
              onContinueSimulation={handleContinueSimulation}
              onLoadHistoryBattle={handleLoadHistoryBattle}
              onClearSimulation={handleClearSimulation}
              onContinueTimeline={handleContinueTimeline}
              oracleCoins={oracleCoins}
              setOracleCoins={setOracleCoins}
              lang={lang}
              isVip={isVip}
              simulationData={{
                charA,
                charB,
                matchMode,
                teamA,
                teamB,
                bossMinions,
                multiTeams,
                battleRoyale,
                scenario,
                modifiers
              }}
            />
          </div>
        )}

        {/* Tab 2: Multiverso & What-If */}
        {(activeTab === 'whatif' || activeTab === 'all') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <WhatIfTree
              modifiers={modifiers}
              setModifiers={setModifiers}
              charA={charA}
              charB={charB}
              scenario={scenario}
              matchMode={matchMode}
              teamA={teamA}
              teamB={teamB}
              battleRoyale={battleRoyale}
              aiConfig={simEngine}
              lang={lang}
            />
          </div>
        )}

        {/* Tab 3: Matriz Táctica & Radar */}
        {(activeTab === 'matrix' || activeTab === 'all') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <MatchupMatrix
              charA={charA}
              charB={charB}
              matchMode={matchMode}
              teamA={teamA}
              teamB={teamB}
              battleRoyale={battleRoyale}
              modifiers={modifiers}
              characters={characters}
              lang={lang}
            />
          </div>
        )}

        {/* Tab 4: APEX Crónicas (Continuidad Narrativa) */}
        {(activeTab === 'chronicles' || activeTab === 'all') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <Suspense fallback={<div className="text-center py-12 text-slate-500 font-mono">Cargando APEX Crónicas...</div>}>
              <ChronicleViewer
                characters={characters}
                lang={lang}
                aiConfig={aiConfig}
              />
            </Suspense>
          </div>
        )}



        {/* Non-intrusive Ad Banner (Suppressed for VIPs) */}
        <AdBanner isVip={isVip} slot="footer" onOpenVip={() => setVipModalOpen(true)} />

        {/* Engine Baseline Status Indicator */}
        <footer className="pt-6 pb-2 text-center text-xs text-slate-500 font-mono tracking-wide select-none">
          <span>APEX Engine {ROSTER_VERSION.split('_')[0].toUpperCase()} · {characters.length} activos · 13 archivados · Roster canónico inmutable</span>
        </footer>

      </main>

      {/* Modales */}
      {inspectModal.isOpen && (
        <CharacterModal
          character={inspectModal.character}
          isEditing={inspectModal.isEditing}
          onClose={() => setInspectModal({ isOpen: false, character: null, isEditing: false })}
          onSave={handleSaveCustomCharacter}
          allCharacters={characters}
          aiConfig={charEngine}
          lang={lang}
        />
      )}

      <Suspense fallback={null}>
        <RandomMatchmakerModal
          isOpen={isRandomizerOpen}
          onClose={() => setRandomizerOpen(false)}
          onMatchReady={handleRandomMatchReady}
          onAIGenerate={() => {
            setRandomizerOpen(false);
            setInspectModal({ isOpen: true, character: null, isEditing: true });
          }}
          allCharacters={characters}
          lang={lang}
        />

        <VaultBrowserModal
          isOpen={vaultModalOpen}
        onClose={() => setVaultModalOpen(false)}
        allCharacters={characters}
        onImportCharacters={(newChars) => {
          setCharacters(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const toAdd = newChars.filter(c => !existingIds.has(c.id));
            const merged = [...toAdd, ...prev];
            try {
              localStorage.setItem(STORAGE_KEY_CHARACTERS, JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }}
      />

      <AiConfigModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        config={aiConfig}
        onSaveConfig={handleSaveAiConfig}
        initialTab={aiModalInitialTab}
      />

      <TournamentModal
        isOpen={isTournamentOpen}
        onClose={() => setIsTournamentOpen(false)}
        characters={characters}
        scenario={scenario}
        modifiers={modifiers}
        aiConfig={simEngine}
        oracleCoins={oracleCoins}
        onUpdateCoins={(newCoins) => {
          setOracleCoins(newCoins);
          try { localStorage.setItem('apex_oracle_coins', newCoins.toString()); } catch {}
        }}
        onOpenSimulationResult={(narrative, winnerA, winnerB) => {
          setCharA(winnerA);
          setCharB(winnerB);
          setSimulationResult({ fullOutput: narrative });
        }}
      />

      <TierListModal
        isOpen={tierListOpen}
        onClose={() => setTierListOpen(false)}
        characters={characters}
      />

      {/* Card Exporter Modal */}
      {cardExportChar && (
        <CardExporterModal
          isOpen={!!cardExportChar}
          character={cardExportChar}
          onClose={() => setCardExportChar(null)}
        />
      )}

      {/* Stat Comparator Modal */}
      {showComparator && (
        <StatComparatorModal
          isOpen={showComparator}
          onClose={() => setShowComparator(false)}
          characters={characters}
          initialCharA={charA}
          initialCharB={charB}
          initialMatchMode={matchMode}
          teamA={teamA}
          teamB={teamB}
          battleRoyale={battleRoyale}
          scenario={scenario}
          lang={lang}
        />
      )}

      {/* Community Vault Modal */}
      <CommunityVaultModal
        isOpen={showCommunityVault}
        onClose={() => setShowCommunityVault(false)}
        onImportCharacter={(newChar) => handleSaveCustomCharacter(newChar)}
        allCharacters={characters}
      />

      {/* Batch AI Character Importer Modal */}
      <BatchAiImporterModal
        isOpen={batchImporterOpen}
        onClose={() => setBatchImporterOpen(false)}
        aiConfig={charEngine}
        allCharacters={characters}
        onImportCharacters={(newChars) => {
          setCharacters(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const toAdd = newChars.filter(c => !existingIds.has(c.id));
            const merged = [...toAdd, ...prev];
            try {
              localStorage.setItem(STORAGE_KEY_CHARACTERS, JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }}
      />

      {/* Roster & Grid Order Manager Modal */}
      <RosterManagerModal
        isOpen={rosterManagerOpen}
        onClose={() => setRosterManagerOpen(false)}
        characters={characters}
        onUpdateRoster={handleUpdateRoster}
        onResetMasterRoster={handleResetMasterRoster}
        onEditCharacter={(char) => setInspectModal({ isOpen: true, character: char, isEditing: true })}
        onInspectCharacter={(char) => setInspectModal({ isOpen: true, character: char, isEditing: false })}
      />

      {/* VIP & Monetization / Sponsor Modal */}
      <VipModal
        isOpen={vipModalOpen}
        onClose={() => setVipModalOpen(false)}
        isVip={isVip}
        onActivateVip={handleActivateVip}
        lang={lang}
      />

      {/* APEX Modes Philosophy & Breakdown Guide Modal */}
      <ModesGuideModal
        isOpen={modesGuideOpen}
        onClose={() => setModesGuideOpen(false)}
        currentMode={mode}
        setMode={setMode}
        lang={lang}
      />

      {/* APEX Power Scaling & VS Battles Wiki Codex Modal */}
      <PowerscalingGuideModal
        isOpen={powerscalingGuideOpen}
        onClose={() => setPowerscalingGuideOpen(false)}
        lang={lang}
      />

      {/* Códice Chōzenshū — corpus canónico Dragon Ball (Chozenshu 1-4) */}
      <ChozenshuCodexModal
        isOpen={codexOpen}
        onClose={() => setCodexOpen(false)}
        lang={lang}
      />

      {/* AI Prompt Matchmaker Modal */}
      <AiSmartMatchmakerModal
        isOpen={isAiMatchmakerOpen}
        onClose={() => setIsAiMatchmakerOpen(false)}
        characters={characters}
        aiConfig={charEngine}
        onApplyMatchup={handleApplyAiMatchup}
        onSaveNewCharacter={(newChar) => handleSaveCustomCharacter(newChar)}
        lang={lang}
      />

      {/* Cloud Authentication & Sync Profile Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        allCharacters={characters}
        onUpdateCharacters={(newChars) => {
          setCharacters(newChars);
          try {
            localStorage.setItem(STORAGE_KEY_CHARACTERS, JSON.stringify(newChars));
          } catch (e) {}
        }}
        oracleCoins={oracleCoins}
        onUpdateCoins={(newCoins) => {
          setOracleCoins(newCoins);
          try {
            localStorage.setItem('apex_oracle_coins', newCoins.toString());
          } catch (e) {}
        }}
        aiConfig={charEngine}
      />

      {/* Multiverse Fusion Forge Modal */}
      <FusionModal
        isOpen={isFusionOpen}
        onClose={() => setIsFusionOpen(false)}
        allCharacters={characters}
        onSaveFusion={(newFused) => handleSaveCustomCharacter(newFused)}
        onDeployToFighter1={(newFused) => {
          setCharA(newFused);
          setActiveTab('arena');
        }}
      />

      {/* Sala de Récords Modal */}
      <RecordsModal
        isOpen={recordsOpen}
        onClose={() => setRecordsOpen(false)}
        onPlayDaily={handleApplyDailyMatchup}
        dailyMatchup={dailyMatchup}
      />
      </Suspense>
      {rewardToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-purple-950/90 backdrop-blur-md border border-amber-500/70 shadow-[0_0_35px_rgba(245,158,11,0.45)] flex items-center gap-3.5 animate-in slide-in-from-bottom-5 duration-300 font-mono text-xs max-w-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl shrink-0 shadow-inner">
            🪙
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300 font-cinzel text-xs uppercase tracking-wider">¡Bonus de Entrada!</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black font-black text-[10px]">+{rewardToast.amount} Monedas</span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono mt-0.5 leading-snug">
              Has recibido tus monedas por entrar a la arena. Saldo actual: <strong className="text-yellow-400 font-bold">{rewardToast.balance} 🪙</strong>
            </p>
          </div>
          <button
            onClick={() => setRewardToast(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Sticky Quick Action Dock (< 1024px) */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 p-2 rounded-2xl glass-panel border border-slate-700/80 bg-slate-950/90 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center justify-between gap-1.5 font-mono text-[11px]">
        <button
          onClick={handleStartSimulation}
          disabled={isSimulating}
          className={`flex-1 py-2.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            isSimulating
              ? 'bg-amber-600/50 text-amber-200 animate-pulse'
              : 'bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 text-white shadow-lg shadow-red-950/60 active:scale-95'
          }`}
        >
          <Swords className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
          <span className="truncate">{isSimulating ? 'Simulando...' : '⚔️ Simular'}</span>
        </button>

        <button
          onClick={() => setIsAiMatchmakerOpen(true)}
          className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0"
          title="Match por Prompt IA"
        >
          <Wand2 className="w-4 h-4 text-pink-400" />
        </button>

        <button
          onClick={() => setRandomizerOpen(true)}
          className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 hover:bg-amber-900/60 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0"
          title="Aleatorio"
        >
          <Shuffle className="w-4 h-4 text-amber-400" />
        </button>

        <button
          onClick={() => {
            const el = document.getElementById('oracle-destiny-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            else {
              setActiveTab('arena');
              setTimeout(() => {
                const e = document.getElementById('oracle-destiny-section');
                if (e) e.scrollIntoView({ behavior: 'smooth' });
              }, 200);
            }
          }}
          className="p-2 px-2.5 rounded-xl bg-slate-900 border border-slate-700 text-yellow-400 hover:bg-slate-800 active:scale-95 transition cursor-pointer flex items-center gap-1 shrink-0 font-bold"
          title="Saldo de Monedas del Oráculo"
        >
          <span>🪙</span>
          <span className="text-[10px] text-yellow-300">{oracleCoins}</span>
        </button>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0"
          title="Volver Arriba"
        >
          <span className="text-xs">▲</span>
        </button>
      </div>
    </div>
  );
}
