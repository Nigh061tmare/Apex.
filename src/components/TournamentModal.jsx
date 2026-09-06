import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Trophy, Swords, Sparkles, RefreshCw, X, Play, Shield, ChevronRight, 
  Crown, Flame, Coins, Dices, FastForward, Award, CheckCircle, AlertCircle,
  Save, History, Download, Trash2, Filter, Shuffle, Layers, BookOpen, ExternalLink,
  Users, UserPlus, UserCheck, Edit3, Check, FileText, GitBranch
} from 'lucide-react';
import SearchableCharacterSelector from './SearchableCharacterSelector.jsx';
import { FRANCHISE_GROUPS, DB_PACKS } from '../services/franchiseHelper';
import { SimulationEngine } from '../services/simulationEngine';
import { SoundFX } from '../services/soundFx';
import { enrichMatchNarrative } from '../services/narrativeFormatter';

const STORAGE_KEY_TOURNAMENT_HISTORY = 'apex_tournament_history';

export default function TournamentModal({ 
  isOpen, 
  onClose, 
  characters = [], 
  scenario, 
  modifiers, 
  aiConfig, 
  oracleCoins = 1000,
  onUpdateCoins,
  onOpenSimulationResult 
}) {
  const [tournamentSize, setTournamentSize] = useState(8); // 4, 8, or 16
  const [tournamentTitle, setTournamentTitle] = useState('Gran Torneo Multiversal');
  const [participants, setParticipants] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [champion, setChampion] = useState(null);
  const [selectedChronicleMatch, setSelectedChronicleMatch] = useState(null);
  const [isSimulatingDetailed, setIsSimulatingDetailed] = useState(false);
  
  // Navigation & Modals
  const [activeTab, setActiveTab] = useState('bracket'); // 'bracket' | 'custom' | 'history' | 'filter'
  
  // Betting System
  const [bets, setBets] = useState({}); // { [matchId]: { charId, amount, odds } }
  const [betAmount, setBetAmount] = useState(50);
  const [toastMsg, setToastMsg] = useState(null);

  // Advanced Randomizer Filter States
  const [filterFranchise, setFilterFranchise] = useState('all');
  const [filterDBPack, setFilterDBPack] = useState('none'); // packs de Dragon Ball
  const [filterTier, setFilterTier] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [seedMode, setSeedMode] = useState('random'); // 'random' | 'balanced' | 'cross_universe'

  // Contadores en vivo de cada pack de Dragon Ball (recuento exacto sobre el roster)
  const dbPackCounts = useMemo(() => {
    const counts = {};
    for (const pack of DB_PACKS) {
      counts[pack.id] = characters.filter(pack.matches).length;
    }
    return counts;
  }, [characters]);

  // Tournament History
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOURNAMENT_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // AI Tournament Simulation State
  const [aiSimKey, setAiSimKey] = useState(null);   // "r-m" del combate que la IA está narrando
  const [aiSimText, setAiSimText] = useState('');    // texto en streaming en vivo
  const [aiAllRunning, setAiAllRunning] = useState(false);

  // Formato de torneo: 'elim' (eliminatoria) | 'liga' (todos contra todos)
  const [formatMode, setFormatMode] = useState('elim');

  // Podio completo: subcampeón + combate de bronce
  const [runnerUp, setRunnerUp] = useState(null);
  const [bronzeCandidates, setBronzeCandidates] = useState([]);
  const [bronzeMatch, setBronzeMatch] = useState(null); // { charA, charB, winner }
  const [thirdPlace, setThirdPlace] = useState(null);

  // Cuotas calculadas por IA (por matchId)
  const [customOdds, setCustomOdds] = useState({});
  const [aiOddsLoading, setAiOddsLoading] = useState(false);

  // Liga: todos contra todos
  const [leagueMatches, setLeagueMatches] = useState([]);
  const [leagueSimKey, setLeagueSimKey] = useState(null);
  const [leagueSimText, setLeagueSimText] = useState('');
  const [leagueSimRunning, setLeagueSimRunning] = useState(false);

  // Exhibiciones del campeón vs retadores
  const [showExhibitions, setShowExhibitions] = useState(false);
  const [exhibitionOpponent, setExhibitionOpponent] = useState(null);
  const [exhibitionResult, setExhibitionResult] = useState(null);
  const [exhibitionRecord, setExhibitionRecord] = useState({ wins: 0, losses: 0 });
  const [exhibitionBusy, setExhibitionBusy] = useState(false);

  // Ref de rondas SIEMPRE actualizado (evita closures obsoletas en bucles secuenciales)
  const roundsRef = useRef([]);
  useEffect(() => { roundsRef.current = rounds; }, [rounds]);

  useEffect(() => {
    if (isOpen && rounds.length === 0) {
      initTournament(tournamentSize);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate Powerscaling Score
  const getTierScore = (tierStr) => {
    if (!tierStr) return 50;
    const t = tierStr.toLowerCase();
    if (t.includes('1-a') || t.includes('omni')) return 130;
    if (t.includes('2-a') || t.includes('1-b')) return 120;
    if (t.includes('2-b') || t.includes('2-c')) return 110;
    if (t.includes('3-a') || t.includes('3-b')) return 95;
    if (t.includes('3-c') || t.includes('4-a')) return 80;
    if (t.includes('4-b') || t.includes('4-c')) return 70;
    if (t.includes('5-a') || t.includes('5-b')) return 60;
    if (t.includes('6-') || t.includes('7-a')) return 45;
    if (t.includes('7-b') || t.includes('7-c')) return 35;
    if (t.includes('8-')) return 20;
    return 10;
  };

  const calculateOdds = (charA, charB) => {
    if (!charA || !charB) return { oddsA: 2.0, oddsB: 2.0 };
    const scoreA = getTierScore(charA.tier);
    const scoreB = getTierScore(charB.tier);
    const total = scoreA + scoreB;
    const probA = Math.max(0.1, Math.min(0.9, scoreA / total));
    const probB = 1 - probA;
    const oddsA = Number((1.1 / probA).toFixed(2));
    const oddsB = Number((1.1 / probB).toFixed(2));
    return { oddsA: Math.max(1.05, Math.min(10.0, oddsA)), oddsB: Math.max(1.05, Math.min(10.0, oddsB)) };
  };

  // Cuotas de un combate (usa las calculadas por IA si existen para ese matchId)
  const getMatchOdds = (matchId, charA, charB) => {
    if (customOdds[matchId]) return customOdds[matchId];
    return calculateOdds(charA, charB);
  };

  const setupBracket = (gladiators, size) => {
    if (size === 4) {
      const semiMatches = [
        { id: 'semi-1', round: 'Semifinal 1', charA: gladiators[0], charB: gladiators[1], winner: null, log: '' },
        { id: 'semi-2', round: 'Semifinal 2', charA: gladiators[2], charB: gladiators[3], winner: null, log: '' }
      ];
      const finalMatch = [
        { id: 'final', round: 'Gran Final', charA: null, charB: null, winner: null, log: '' }
      ];
      setRounds([
        { name: 'Semifinales', matches: semiMatches },
        { name: 'Gran Final', matches: finalMatch }
      ]);
    } else if (size === 8) {
      const quarterMatches = [
        { id: 'q-1', round: 'Cuartos 1', charA: gladiators[0], charB: gladiators[1], winner: null, log: '' },
        { id: 'q-2', round: 'Cuartos 2', charA: gladiators[2], charB: gladiators[3], winner: null, log: '' },
        { id: 'q-3', round: 'Cuartos 3', charA: gladiators[4], charB: gladiators[5], winner: null, log: '' },
        { id: 'q-4', round: 'Cuartos 4', charA: gladiators[6], charB: gladiators[7], winner: null, log: '' }
      ];
      const semiMatches = [
        { id: 'semi-1', round: 'Semifinal 1', charA: null, charB: null, winner: null, log: '' },
        { id: 'semi-2', round: 'Semifinal 2', charA: null, charB: null, winner: null, log: '' }
      ];
      const finalMatch = [
        { id: 'final', round: 'Gran Final', charA: null, charB: null, winner: null, log: '' }
      ];
      setRounds([
        { name: 'Cuartos de Final', matches: quarterMatches },
        { name: 'Semifinales', matches: semiMatches },
        { name: 'Gran Final', matches: finalMatch }
      ]);
    } else {
      // 16 participants (Octavos de Final)
      const octavosMatches = [];
      for (let i = 0; i < 8; i++) {
        octavosMatches.push({
          id: `oct-${i + 1}`,
          round: `Octavos ${i + 1}`,
          charA: gladiators[i * 2],
          charB: gladiators[i * 2 + 1],
          winner: null,
          log: ''
        });
      }
      const quarterMatches = [
        { id: 'q-1', round: 'Cuartos 1', charA: null, charB: null, winner: null, log: '' },
        { id: 'q-2', round: 'Cuartos 2', charA: null, charB: null, winner: null, log: '' },
        { id: 'q-3', round: 'Cuartos 3', charA: null, charB: null, winner: null, log: '' },
        { id: 'q-4', round: 'Cuartos 4', charA: null, charB: null, winner: null, log: '' }
      ];
      const semiMatches = [
        { id: 'semi-1', round: 'Semifinal 1', charA: null, charB: null, winner: null, log: '' },
        { id: 'semi-2', round: 'Semifinal 2', charA: null, charB: null, winner: null, log: '' }
      ];
      const finalMatch = [
        { id: 'final', round: 'Gran Final', charA: null, charB: null, winner: null, log: '' }
      ];
      setRounds([
        { name: 'Octavos de Final', matches: octavosMatches },
        { name: 'Cuartos de Final', matches: quarterMatches },
        { name: 'Semifinales', matches: semiMatches },
        { name: 'Gran Final', matches: finalMatch }
      ]);
    }
  };

  const initTournament = (size, customList = null) => {
    let list = customList || [];
    if (list.length < size) {
      const remaining = characters.filter(c => !list.some(x => x.id === c.id));
      const shuffled = [...remaining].sort(() => 0.5 - Math.random());
      list = [...list, ...shuffled].slice(0, size);
    }
    setParticipants(list);
    setChampion(null);
    setBets({});
    setupBracket(list, size);
  };

  const handleUpdateSlot = (index, newChar) => {
    const next = [...participants];
    next[index] = newChar;
    setParticipants(next);
    setupBracket(next, tournamentSize);
  };

  const handleFillEmptySlotsRandomly = () => {
    const current = [...participants];
    const usedIds = new Set(current.filter(Boolean).map(c => c.id));
    const available = characters.filter(c => !usedIds.has(c.id)).sort(() => 0.5 - Math.random());
    
    let availIdx = 0;
    for (let i = 0; i < tournamentSize; i++) {
      if (!current[i] && availIdx < available.length) {
        current[i] = available[availIdx++];
      }
    }
    setParticipants(current);
    setupBracket(current, tournamentSize);
  };

  const handleClearAllSlots = () => {
    const emptyList = new Array(tournamentSize).fill(null);
    setParticipants(emptyList);
    setupBracket(emptyList, tournamentSize);
  };

  // Advanced Category & Tag Filtered Generator
  const handleGenerateFilteredTournament = () => {
    let pool = [...characters];

    // 0. Packs de Dragon Ball (tienen prioridad sobre el filtro genérico de franquicia)
    if (filterDBPack !== 'none') {
      const pack = DB_PACKS.find(p => p.id === filterDBPack);
      if (pack) {
        pool = pool.filter(c => pack.matches(c));
        if (pool.length < 2) {
          alert(`El pack "${pack.name}" no tiene suficientes luchadores (${pool.length}). Amplía o cambia de pack.`);
          return;
        }
      }
    } else if (filterFranchise !== 'all') {
      // 1. Franchise Filter
      const group = FRANCHISE_GROUPS.find(g => g.id === filterFranchise);
      if (group && group.keywords.length > 0) {
        pool = pool.filter(c => {
          const full = `${c.name} ${c.universe} ${c.saga || ''}`.toLowerCase();
          return group.keywords.some(k => full.includes(k.toLowerCase()));
        });
      }
    }

    // 2. Tier Range Filter
    if (filterTier !== 'all') {
      pool = pool.filter(c => {
        const t = (c.tier || '').toLowerCase();
        if (filterTier === 'cosmic') return t.includes('1-') || t.includes('2-') || t.includes('3-a') || t.includes('3-b');
        if (filterTier === 'planetary') return t.includes('3-c') || t.includes('4-') || t.includes('5-');
        if (filterTier === 'continental') return t.includes('6-') || t.includes('7-a');
        if (filterTier === 'street') return t.includes('7-b') || t.includes('7-c') || t.includes('8-') || t.includes('9-');
        return true;
      });
    }

    // 3. Combat Tag Filter
    if (filterTag !== 'all') {
      pool = pool.filter(c => {
        const haxStr = Array.isArray(c.haxTags) ? c.haxTags.join(' ') : (typeof c.haxTags === 'string' ? c.haxTags : '');
        const abilsStr = Array.isArray(c.abilities) ? c.abilities.map(a => typeof a === 'object' ? (a.name || a.desc || '') : String(a)).join(' ') : (typeof c.abilities === 'string' ? c.abilities : '');
        const full = `${c.name || ''} ${haxStr} ${abilsStr}`.toLowerCase();
        return full.includes(filterTag.toLowerCase());
      });
    }

    if (pool.length < 2) {
      alert('No hay suficientes luchadores que cumplan todos los filtros seleccionados. Amplía tu búsqueda.');
      return;
    }

    let selectedList = [];
    if (seedMode === 'balanced') {
      // Balanced Seeding: Sort by Tier, pair High vs Moderate to avoid round 1 stomps
      const sorted = [...pool].sort((a, b) => getTierScore(b.tier) - getTierScore(a.tier));
      selectedList = sorted.slice(0, tournamentSize);
    } else {
      // Chaotic random
      selectedList = pool.sort(() => 0.5 - Math.random()).slice(0, tournamentSize);
    }

    // If still less than tournamentSize, fill from global pool
    if (selectedList.length < tournamentSize) {
      const needed = tournamentSize - selectedList.length;
      const extra = characters.filter(c => !selectedList.some(x => x.id === c.id)).sort(() => 0.5 - Math.random()).slice(0, needed);
      selectedList = [...selectedList, ...extra];
    }

    setParticipants(selectedList);
    setChampion(null);
    setBets({});
    setupBracket(selectedList, tournamentSize);
    setActiveTab('bracket');

    try { SoundFX.playFanfare?.(); } catch {}
    const packName = filterDBPack !== 'none' ? (DB_PACKS.find(p => p.id === filterDBPack)?.name || '') : '';
    setToastMsg(`🎯 Torneo generado con éxito (${tournamentSize} luchadores)${packName ? ` · ${packName}` : ''}.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handlePlaceBet = (matchId, char, odds) => {
    if (oracleCoins < betAmount) {
      alert('¡No tienes suficientes Monedas del Oráculo!');
      return;
    }
    const newCoins = oracleCoins - betAmount;
    if (onUpdateCoins) onUpdateCoins(newCoins);
    setBets(prev => ({
      ...prev,
      [matchId]: { charId: char.id, charName: char.name, amount: betAmount, odds }
    }));
    try { SoundFX.playBetPlace?.(); } catch {}
    setToastMsg(`🎰 ¡Apuesta de ${betAmount} 🪙 registrada por ${char.name} (Cuota x${odds})!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Instant Powerscaling Battle Resolution
  const resolveMatchFast = (match) => {
    const scoreA = getTierScore(match.charA.tier);
    const scoreB = getTierScore(match.charB.tier);
    
    const rollA = scoreA * (0.85 + Math.random() * 0.3);
    const rollB = scoreB * (0.85 + Math.random() * 0.3);
    
    const winner = rollA >= rollB ? match.charA : match.charB;
    const diff = Math.abs(rollA - rollB);
    let log = '';
    if (diff > 40) {
      log = `Victoria aplastante por superioridad de Tier y Speedblitzing absoluto. ${winner.name} dominó sin esfuerzo.`;
    } else if (diff > 15) {
      log = `Combate reñido donde ${winner.name} logró imponer su ventaja de Arsenal y Potencia de Ataque en el clímax.`;
    } else {
      log = `¡Duelo de extrema igualdad al borde de la incapacitación! ${winner.name} venció por Battle IQ y resistencia final.`;
    }

    return { winner, log };
  };

  const generateTournamentMatchChronicle = (charA, charB) => {
    const scoreA = getTierScore(charA.tier);
    const scoreB = getTierScore(charB.tier);
    const rollA = scoreA * (0.88 + Math.random() * 0.25);
    const rollB = scoreB * (0.88 + Math.random() * 0.25);
    const winner = rollA >= rollB ? charA : charB;
    const loser = winner.id === charA.id ? charB : charA;
    const diff = Math.abs(rollA - rollB);

    let factor = 'potencia de ataque y velocidad';
    if (diff > 35) factor = 'superioridad abrumadora de escala destructiva';
    else if (diff > 15) factor = 'adaptación táctica y dominio de técnicas clave';
    else factor = 'resistencia extrema en el último intercambio al límite';

    const techA = charA.arsenal?.superAttacks?.[0]?.name || charA.abilities?.[0]?.name || 'Técnica de Impacto';
    const techB = charB.arsenal?.superAttacks?.[0]?.name || charB.abilities?.[0]?.name || 'Ráfaga de Poder';
    const ultimateWinner = winner.arsenal?.ultimateAttacks?.[0]?.name || 'Ataque Definitivo';

    const turns = [
      { text: `Ambos combatientes toman posiciones en la arena. ${charA.name} abre las hostilidades con una ofensiva frontal mientras ${charB.name} lee sus patrones cinéticos.` },
      { text: `¡Se desata el choque de técnicas especiales! ${charA.name} despliega '${techA}', pero ${charB.name} contraataca de inmediato con '${techB}', provocando una onda expansiva en el escenario.` },
      { text: `Entrando en la fase decisiva, la ventaja en ${factor} comienza a desgastar las defensas de ${loser.name}, obligándolo a retroceder.` },
      { text: `¡Clímax del combate! ${winner.name} ejecuta su técnica definitiva '${ultimateWinner}', quebrando la guardia de ${loser.name} y sellando la victoria definitiva.` }
    ];

    const fullNarrative = enrichMatchNarrative({ char1: charA, char2: charB, turns, winner, factor });
    const summaryLog = `🏆 Victoria para ${winner.name} tras superar a ${loser.name} mediante ${factor}.`;

    return { winner, fullNarrative, summaryLog };
  };

  const loserOf = (winner, match) => {
    if (!winner || !match || !match.charA || !match.charB) return null;
    return winner.id === match.charA.id ? match.charB : winner.id === match.charB.id ? match.charA : null;
  };

  const advanceWinner = (roundIdx, matchIdx, winner, logText, fullNarrative = null) => {
    // Trabaja sobre roundsRef.current (siempre la versión más reciente), de modo
    // que las simulaciones secuenciales (todo con IA) encadenen correctamente.
    const prevRounds = Array.isArray(roundsRef.current) && roundsRef.current.length > 0
      ? roundsRef.current
      : rounds;
    const updatedRounds = prevRounds.map(r => ({ ...r, matches: r.matches.map(m => ({ ...m })) }));
    const match = updatedRounds[roundIdx].matches[matchIdx];
    match.winner = winner;
    match.log = logText;
    if (fullNarrative) {
      match.fullNarrative = fullNarrative;
    }

    // Check Bet Settlement
    const matchId = updatedRounds[roundIdx].matches[matchIdx].id;
    const activeBet = bets[matchId];
    if (activeBet) {
      if (activeBet.charId === winner.id) {
        const reward = Math.round(activeBet.amount * activeBet.odds);
        const newTotal = oracleCoins + reward;
        if (onUpdateCoins) onUpdateCoins(newTotal);
        try { SoundFX.playBetWin?.(); } catch {}
        setToastMsg(`🎉 ¡GANASTE TU APUESTA! +${reward} 🪙 por la victoria de ${winner.name}!`);
      } else {
        try { SoundFX.playBetLose?.(); } catch {}
        setToastMsg(`❌ Apuesta perdida en ${matchId}. Vencedor: ${winner.name}.`);
      }
      setTimeout(() => setToastMsg(null), 4000);
    }

    // Advance to next round
    const isFinal = roundIdx === updatedRounds.length - 1;
    const isSemi = updatedRounds.length >= 3 && roundIdx === updatedRounds.length - 2;
    if (isSemi && loserOf(winner, match)) {
      // Los dos semifinalistas derrotados disputarán el combate de bronce
      setBronzeCandidates(prev => {
        const next = [...prev];
        if (!next.includes(loserOf(winner, match))) next.push(loserOf(winner, match));
        return next;
      });
    }
    if (isFinal) {
      setChampion(winner);
      const finalLoser = match.charA.id === winner.id ? match.charB : match.charA;
      setRunnerUp(finalLoser);
      // Monta el combate de bronce con los 2 semifinalistas derrotados
      setBronzeCandidates(prevCandidates => {
        const cands = [...prevCandidates];
        if (cands.length >= 2) {
          setBronzeMatch({ charA: cands[0], charB: cands[1], winner: null, log: '' });
        }
        return cands;
      });
      try { SoundFX.playChampionFanfare?.(); } catch {}
      saveTournamentToHistory(tournamentTitle, winner, updatedRounds);
    } else {
      const nextRoundIdx = roundIdx + 1;
      const nextMatchIdx = Math.floor(matchIdx / 2);
      const isCharA = matchIdx % 2 === 0;

      if (isCharA) {
        updatedRounds[nextRoundIdx].matches[nextMatchIdx].charA = winner;
      } else {
        updatedRounds[nextRoundIdx].matches[nextMatchIdx].charB = winner;
      }
    }

    setRounds(updatedRounds);
    roundsRef.current = updatedRounds;
  };

  const handleSimulateFast = (roundIdx, matchIdx) => {
    const match = rounds[roundIdx]?.matches[matchIdx];
    if (!match || !match.charA || !match.charB || match.winner) return;
    const { winner, log } = resolveMatchFast(match);
    advanceWinner(roundIdx, matchIdx, winner, log);
  };

  const handleSimulateDetailed = (roundIdx, matchIdx) => {
    const match = rounds[roundIdx]?.matches[matchIdx];
    if (!match || !match.charA || !match.charB || match.winner) return;
    try { SoundFX.playEnergyClash?.() || SoundFX.playSwordClash?.(); } catch {}
    const { winner, fullNarrative, summaryLog } = generateTournamentMatchChronicle(match.charA, match.charB);
    advanceWinner(roundIdx, matchIdx, winner, summaryLog, fullNarrative);
  };

  const handleSimulateAllRemainingFast = () => {
    for (let r = 0; r < rounds.length; r++) {
      for (let m = 0; m < rounds[r].matches.length; m++) {
        const match = rounds[r].matches[m];
        if (match.charA && match.charB && !match.winner) {
          const { winner, log } = resolveMatchFast(match);
          advanceWinner(r, m, winner, log);
        }
      }
    }
  };

  const handleSimulateAllRemainingDetailed = () => {
    setIsSimulatingDetailed(true);
    try { SoundFX.playEnergyClash?.(); } catch {}
    setTimeout(() => {
      for (let r = 0; r < rounds.length; r++) {
        for (let m = 0; m < rounds[r].matches.length; m++) {
          const match = rounds[r].matches[m];
          if (match.charA && match.charB && !match.winner) {
            const { winner, fullNarrative, summaryLog } = generateTournamentMatchChronicle(match.charA, match.charB);
            advanceWinner(r, m, winner, summaryLog, fullNarrative);
          }
        }
      }
      setIsSimulatingDetailed(false);
      setToastMsg('⚔️ ¡Todo el torneo ha sido simulado con crónicas completas!');
      setTimeout(() => setToastMsg(null), 3500);
    }, 400);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 🧠 SIMULACIÓN DE TORNEO CON IA (narrativa redactada en vivo por el motor)
  // ───────────────────────────────────────────────────────────────────────────

  // Prompt de combate de torneo en formato 5 fases APEX (barras HP + VENCEDOR)
  const buildTournamentAIPrompt = (charA, charB, roundName) => {
    const techOf = (c) => {
      const pool = [
        c?.arsenal?.superAttacks?.[0],
        c?.arsenal?.ultimateAttacks?.[0],
        ...(Array.isArray(c?.abilities) ? c.abilities : [])
      ].filter(Boolean);
      return (typeof pool[0] === 'object' ? (pool[0].name || pool[0].desc) : pool[0]) || 'técnica de firma';
    };
    const formOf = (c) => c?.forms?.[0]?.name || 'Forma Base';
    return `Eres el narrador oficial del torneo "${tournamentTitle}". Redacta en español el combate de ${roundName} entre:
• Luchador A: ${charA.name} (${charA.universe || 'Multiverso'}, Tier ${charA.tier || '?'}, forma inicial: ${formOf(charA)}, técnica: ${techOf(charA)})
• Luchador B: ${charB.name} (${charB.universe || 'Multiverso'}, Tier ${charB.tier || '?'}, forma inicial: ${formOf(charB)}, técnica: ${techOf(charB)})

Narración épica de torneo shōnen. Usa EXACTAMENTE este formato de 5 fases con biometría, cada fase con su título en ### y UNA línea ||BIOMETRICS|| al final de cada fase:

### FASE 1: TANTEO
[Apertura táctica, ambos se estudian]
||BIOMETRICS|| HP_A: 100 | STM_A: 100 | HP_B: 100 | STM_B: 100 ||
### FASE 2: INTERCAMBIO
[Choque de técnicas, primera sangre]
||BIOMETRICS|| HP_A: 80 | STM_A: 75 | HP_B: 85 | STM_B: 70 ||
### FASE 3: ESCALADA
[Transformaciones/estados activados, daño creciente]
||BIOMETRICS|| HP_A: 55 | STM_A: 50 | HP_B: 60 | STM_B: 45 ||
### FASE 4: FASE DECISIVA
[Ventaja clara de un bando, el otro al límite]
||BIOMETRICS|| HP_A: 30 | STM_A: 25 | HP_B: 45 | STM_B: 30 ||
### FASE 5: CLÍMAX Y VEREDICTO
[Resolución final con técnica definitiva]
||BIOMETRICS|| HP_A: 0 | STM_A: 5 | HP_B: 20 | STM_B: 10 ||

Decisión del vencedor: coherente con sus Tiers y Hax (el Tier superior y el arsenal más relevante deben imponerse; un Tier menor solo puede ganar por estrategia si la diferencia de poder es pequeña). Los valores de HP/STM deben decrecer coherentemente según quién domina.
TERMINA SIEMPRE con una línea exacta en este formato:
VENCEDOR: Nombre completo del ganador`;
  };

  // Mapea el nombre del vencedor del relato a charA/charB por coincidencia de tokens
  const extractWinnerFromNarrative = (narrative = '', charA, charB) => {
    const verdict = narrative.match(/VENCEDOR:\s*([^\n\r]+)/i) || narrative.match(/GANADOR:\s*([^\n\r]+)/i);
    if (!verdict) return null;
    const winnerStr = verdict[1].replace(/[\*\_\[\]]/g, '').trim().toLowerCase();
    const tokensA = (charA?.name || '').toLowerCase().split(/[\s\(\),:\.\/\-\_]+/).filter(Boolean);
    const tokensB = (charB?.name || '').toLowerCase().split(/[\s\(\),:\.\/\-\_]+/).filter(Boolean);
    const scoreA = tokensA.filter(t => winnerStr.includes(t)).length;
    const scoreB = tokensB.filter(t => winnerStr.includes(t)).length;
    if (scoreA > scoreB) return charA;
    if (scoreB > scoreA) return charB;
    if (tokensA.some(t => winnerStr.includes(t))) return charA;
    if (tokensB.some(t => winnerStr.includes(t))) return charB;
    return null;
  };

  // Simula UN combate con la IA. Resuelve el stream y devuelve true si la IA
  // entregó un vencedor válido (si falla la conexión devuelve false para fallback).
  const handleSimulateWithAI = async (roundIdx, matchIdx) => {
    const current = Array.isArray(roundsRef.current) && roundsRef.current.length > 0 ? roundsRef.current : rounds;
    const match = current[roundIdx]?.matches[matchIdx];
    if (!match || !match.charA || !match.charB || match.winner) return false;
    if (aiSimKey) return false; // ya hay una narración IA en curso

    const simEngine = aiConfig?.simulationEngine || aiConfig || {};
    if (!simEngine.engine || !simEngine.model) return false; // sin IA configurada → fallback local

    const roundName = current[roundIdx]?.name || 'Combate';
    const key = `${roundIdx}-${matchIdx}`;
    setAiSimKey(key);
    setAiSimText('');
    try { SoundFX.playEnergyClash?.(); } catch {}

    const prompt = buildTournamentAIPrompt(match.charA, match.charB, roundName);

    return new Promise((resolve) => {
      let fullText = '';
      SimulationEngine.streamSimulation(
        prompt,
        simEngine,
        (token) => {
          fullText += token;
          setAiSimText(fullText);
        },
        () => {
          const aiWinner = extractWinnerFromNarrative(fullText, match.charA, match.charB);
          if (aiWinner) {
            const summaryLog = `🏆 Victoria para ${aiWinner.name} (narrada por IA).`;
            advanceWinner(roundIdx, matchIdx, aiWinner, summaryLog, fullText);
            setAiSimKey(null);
            setAiSimText('');
            resolve(true);
          } else {
            // IA respondió pero sin vencedor claro → fallback a crónica local
            const { winner, fullNarrative, summaryLog } = generateTournamentMatchChronicle(match.charA, match.charB);
            advanceWinner(roundIdx, matchIdx, winner, summaryLog, fullNarrative);
            setAiSimKey(null);
            setAiSimText('');
            resolve(false);
          }
        },
        (error) => {
          console.warn('AI tournament match falló (fallback local):', error);
          const { winner, fullNarrative, summaryLog } = generateTournamentMatchChronicle(match.charA, match.charB);
          advanceWinner(roundIdx, matchIdx, winner, summaryLog, fullNarrative);
          setAiSimKey(null);
          setAiSimText('');
          resolve(false);
        }
      );
    });
  };

  // Simula TODOS los combates restantes con IA, ronda a ronda y en orden.
  const handleSimulateAllWithAI = async () => {
    if (aiAllRunning) return;
    setAiAllRunning(true);
    setToastMsg('🧠 IA narrando el torneo... (ronda a ronda)');
    let guard = 0;
    try {
      while (guard++ < 200) {
        const cur = roundsRef.current.length > 0 ? roundsRef.current : rounds;
        let target = null;
        for (let r = 0; r < cur.length && !target; r++) {
          for (let m = 0; m < cur[r].matches.length; m++) {
            const match = cur[r].matches[m];
            if (match.charA && match.charB && !match.winner) { target = [r, m]; break; }
          }
        }
        if (!target) break; // torneo completo
        const ok = await handleSimulateWithAI(target[0], target[1]);
        if (!ok && !roundsRef.current[target[0]]?.matches[target[1]]?.winner) {
          // La IA no estaba configurada o falló sin fallback → crónica local directa
          const match = roundsRef.current[target[0]].matches[target[1]];
          if (match?.charA && match?.charB && !match.winner) {
            const { winner, fullNarrative, summaryLog } = generateTournamentMatchChronicle(match.charA, match.charB);
            advanceWinner(target[0], target[1], winner, summaryLog, fullNarrative);
          }
        }
        await new Promise(res => setTimeout(res, 350));
      }
    } finally {
      setAiAllRunning(false);
      setAiSimKey(null);
      setAiSimText('');
      setToastMsg('🤖 ¡Torneo completado con narración IA! Revisa el cuadro y el historial.');
      setTimeout(() => setToastMsg(null), 4500);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 🥇 PODIO COMPLETO — combate de bronce + subcampeón
  // ───────────────────────────────────────────────────────────────────────────

  // Combate de bronce (rápido) entre los dos semifinalistas derrotados
  const handleResolveBronzeFast = () => {
    if (!bronzeMatch || !bronzeMatch.charA || !bronzeMatch.charB || bronzeMatch.winner) return;
    const { winner, log } = resolveMatchFast({ charA: bronzeMatch.charA, charB: bronzeMatch.charB });
    const loser = winner.id === bronzeMatch.charA.id ? bronzeMatch.charB : bronzeMatch.charA;
    setBronzeMatch(prev => ({ ...prev, winner, log: `${log} 🥉 ${winner.name} se lleva el 3er puesto tras vencer a ${loser.name}.` }));
    setThirdPlace(winner);
    try { SoundFX.playBetWin?.(); } catch {}
  };

  // Combate de bronce narrado con IA
  const handleResolveBronzeWithAI = async () => {
    if (!bronzeMatch || !bronzeMatch.charA || !bronzeMatch.charB || bronzeMatch.winner || aiSimKey) return;
    const simEngine = aiConfig?.simulationEngine || aiConfig || {};
    if (!simEngine.engine || !simEngine.model) { handleResolveBronzeFast(); return; }
    setAiSimKey('bronze');
    setAiSimText('');
    const prompt = `Eres el narrador del torneo "${tournamentTitle}". Redacta en español el COMBATE DE BRONCE (3er puesto) entre:
• Luchador A: ${bronzeMatch.charA.name} (${bronzeMatch.charA.universe || 'Multiverso'}, Tier ${bronzeMatch.charA.tier || '?'})
• Luchador B: ${bronzeMatch.charB.name} (${bronzeMatch.charB.universe || 'Multiverso'}, Tier ${bronzeMatch.charB.tier || '?'})

Usa exactamente este formato de 5 fases con biometría (cada fase con su título ### FASE N):
### FASE 1: TANTEO
...narración...
||BIOMETRICS|| HP_A: 100 | STM_A: 100 | HP_B: 100 | STM_B: 100 ||
### FASE 2: INTERCAMBIO
...
### FASE 3: ESCALADA
...
### FASE 4: FASE DECISIVA
...
### FASE 5: CLÍMAX Y VEREDICTO
...
TERMINA SIEMPRE con:
VENCEDOR: Nombre completo del ganador`;
    return new Promise((resolve) => {
      let fullText = '';
      SimulationEngine.streamSimulation(
        prompt,
        simEngine,
        (token) => { fullText += token; setAiSimText(fullText); },
        () => {
          const aiWinner = extractWinnerFromNarrative(fullText, bronzeMatch.charA, bronzeMatch.charB);
          const winner = aiWinner || (resolveMatchFast({ charA: bronzeMatch.charA, charB: bronzeMatch.charB }).winner);
          const loser = winner.id === bronzeMatch.charA.id ? bronzeMatch.charB : bronzeMatch.charA;
          setBronzeMatch(prev => ({ ...prev, winner, log: `🏆 Victoria para ${winner.name} tras vencer a ${loser.name}.`, fullNarrative: fullText }));
          setThirdPlace(winner);
          setAiSimKey(null);
          setAiSimText('');
          try { SoundFX.playBetWin?.(); } catch {}
          resolve(true);
        },
        () => { handleResolveBronzeFast(); setAiSimKey(null); setAiSimText(''); resolve(false); }
      );
    });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 🪙 CUOTAS DINÁMICAS POR IA
  // ───────────────────────────────────────────────────────────────────────────

  const computeOddsForMatchWithAI = (matchId, charA, charB) => {
    const simEngine = aiConfig?.simulationEngine || aiConfig || {};
    if (!simEngine.engine || !simEngine.model) return Promise.resolve(false);
    const prompt = `Analiza este combate de torneo y devuelve ÚNICAMENTE probabilidades de victoria en porcentaje:
A: ${charA.name} (${charA.universe || ''}, Tier ${charA.tier || '?'})
B: ${charB.name} (${charB.universe || ''}, Tier ${charB.tier || '?'})
Considera Tiers, Hax y arsenal. Formato exacto de respuesta:
PROB_A: 60% PROB_B: 40%`;
    return new Promise((resolve) => {
      let fullText = '';
      SimulationEngine.streamSimulation(
        prompt,
        simEngine,
        (token) => { fullText += token; },
        () => {
          const mA = fullText.match(/PROB_A:\s*(\d{1,3})/i);
          const mB = fullText.match(/PROB_B:\s*(\d{1,3})/i);
          const pA = mA ? Math.max(1, Math.min(99, parseInt(mA[1], 10))) : null;
          const pB = mB ? Math.max(1, Math.min(99, parseInt(mB[1], 10))) : null;
          if (pA !== null && pB !== null && pA + pB > 0) {
            const oddsA = Number((1.1 / (pA / 100)).toFixed(2));
            const oddsB = Number((1.1 / (pB / 100)).toFixed(2));
            setCustomOdds(prev => ({ ...prev, [matchId]: { oddsA: Math.max(1.05, Math.min(10, oddsA)), oddsB: Math.max(1.05, Math.min(10, oddsB)) } }));
            resolve(true);
          } else resolve(false);
        },
        () => resolve(false)
      );
    });
  };

  const handleComputeAllOddsWithAI = async () => {
    if (aiOddsLoading) return;
    setAiOddsLoading(true);
    setToastMsg('🪙 La IA está calculando las cuotas de cada combate...');
    try {
      const cur = roundsRef.current.length > 0 ? roundsRef.current : rounds;
      for (let r = 0; r < cur.length; r++) {
        for (let m = 0; m < cur[r].matches.length; m++) {
          const match = cur[r].matches[m];
          if (match.charA && match.charB && !match.winner && !customOdds[match.id]) {
            await computeOddsForMatchWithAI(match.id, match.charA, match.charB);
          }
        }
      }
      setToastMsg('🪙 Cuotas IA aplicadas a todos los combates disponibles.');
    } finally {
      setAiOddsLoading(false);
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // ⚽ TORNEO LIGA (todos contra todos con puntos)
  // ───────────────────────────────────────────────────────────────────────────

  const buildLeagueMatches = (list) => {
    const pairs = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        pairs.push({ id: `liga-${i}-${j}`, charA: list[i], charB: list[j], winner: null, log: '', fullNarrative: null });
      }
    }
    return pairs;
  };

  const getLeagueStandings = (matches) => {
    const table = {};
    for (const p of participants) {
      if (p) table[p.id] = { char: p, played: 0, wins: 0, draws: 0, losses: 0, points: 0 };
    }
    for (const match of matches) {
      if (!match.winner) continue;
      const a = table[match.charA?.id];
      const b = table[match.charB?.id];
      if (!a || !b) continue;
      if (match.winner === 'draw') { a.played++; b.played++; a.draws++; b.draws++; a.points++; b.points++; }
      else if (match.winner.id === match.charA.id) { a.played++; b.played++; a.wins++; b.losses++; a.points += 3; }
      else if (match.winner.id === match.charB.id) { a.played++; b.played++; a.losses++; b.wins++; b.points += 3; }
    }
    return Object.values(table).sort((x, y) => y.points - x.points || (y.wins - x.wins) || (x.losses - y.losses));
  };

  const startLeague = () => {
    const list = participants.filter(Boolean);
    if (list.length < 3) { alert('La liga necesita al menos 3 participantes.'); return; }
    setLeagueMatches(buildLeagueMatches(list));
    setFormatMode('liga');
    setChampion(null);
    setActiveTab('league');
  };

  const simulateLeagueMatch = (matchId) => {
    const idx = leagueMatches.findIndex(m => m.id === matchId);
    const match = leagueMatches[idx];
    if (!match || !match.charA || !match.charB || match.winner) return;
    // Pequeña posibilidad de empate (~8%) para resultados realistas
    const isDraw = Math.random() < 0.08;
    if (isDraw) {
      const updated = [...leagueMatches];
      updated[idx] = { ...match, winner: 'draw', log: '🤝 Empate tras el límite de tiempo reglamentario.' };
      setLeagueMatches(updated);
      return;
    }
    const { winner, log } = resolveMatchFast(match);
    const updated = [...leagueMatches];
    updated[idx] = { ...match, winner, log };
    setLeagueMatches(updated);
  };

  const simulateLeagueMatchWithAI = async (matchId) => {
    const idx = leagueMatches.findIndex(m => m.id === matchId);
    const match = leagueMatches[idx];
    if (!match || !match.charA || !match.charB || match.winner || leagueSimKey) return;
    const simEngine = aiConfig?.simulationEngine || aiConfig || {};
    if (!simEngine.engine || !simEngine.model) { simulateLeagueMatch(matchId); return; }
    setLeagueSimKey(matchId);
    setLeagueSimText('');
    const prompt = `Eres el narrador del torneo "${tournamentTitle}" (formato LIGA, todos contra todos). Redacta en español el partido de liga entre:
• A: ${match.charA.name} (Tier ${match.charA.tier || '?'}, ${match.charA.universe || ''})
• B: ${match.charB.name} (Tier ${match.charB.tier || '?'}, ${match.charB.universe || ''})

Formato de 5 fases con biometría (### FASE N + línea ||BIOMETRICS|| HP_A/STM_A/HP_B/STM_B).
El combate puede terminar en empate si ambos quedan incapacitados a la vez.
TERMINA SIEMPRE con:
VENCEDOR: Nombre completo del ganador
o, en caso de empate:
VENCEDOR: EMPATE`;
    return new Promise((resolve) => {
      let fullText = '';
      SimulationEngine.streamSimulation(
        prompt,
        simEngine,
        (token) => { fullText += token; setLeagueSimText(fullText); },
        () => {
          const isDraw = /VENCEDOR:\s*EMPATE/i.test(fullText);
          let winner = null;
          if (!isDraw) winner = extractWinnerFromNarrative(fullText, match.charA, match.charB);
          const updated = [...leagueMatches];
          if (isDraw || !winner) {
            updated[idx] = { ...match, winner: isDraw ? 'draw' : resolveMatchFast(match).winner, log: isDraw ? '🤝 Empate' : '🏆 Victoria (IA)', fullNarrative: fullText };
          } else {
            updated[idx] = { ...match, winner, log: `🏆 Victoria para ${winner.name} (narrada por IA)`, fullNarrative: fullText };
          }
          setLeagueMatches(updated);
          setLeagueSimKey(null);
          setLeagueSimText('');
          resolve(true);
        },
        () => { simulateLeagueMatch(matchId); setLeagueSimKey(null); setLeagueSimText(''); resolve(false); }
      );
    });
  };

  const simulateAllLeagueWithAI = async () => {
    if (leagueSimRunning) return;
    setLeagueSimRunning(true);
    try {
      let guard = 0;
      while (guard++ < 200) {
        const next = leagueMatches.find(m => m.charA && m.charB && !m.winner);
        if (!next) break;
        await simulateLeagueMatchWithAI(next.id);
        if (leagueMatches.find(m => m.id === next.id)?.winner) { /* ya resuelto */ }
        await new Promise(res => setTimeout(res, 250));
      }
      const standings = getLeagueStandings(leagueMatches);
      if (standings[0] && standings[0].played === leagueMatches.length * 2 / participants.length) {
        // Campeón de liga cuando todos los partidos están jugados
      }
      setToastMsg('🏁 ¡Liga completada! Revisa la clasificación.');
      setTimeout(() => setToastMsg(null), 4000);
    } finally {
      setLeagueSimRunning(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 🤺 COMBATES DE EXHIBICIÓN — campeón vs retadores
  // ───────────────────────────────────────────────────────────────────────────

  const handleExhibitionSimulate = (mode) => {
    if (!champion || !exhibitionOpponent || exhibitionBusy) return;
    setExhibitionBusy(true);
    setExhibitionResult(null);
    const isAI = mode === 'ai';
    const simEngine = aiConfig?.simulationEngine || aiConfig || {};
    const runLocal = () => {
      const { winner, fullNarrative, summaryLog } = generateTournamentMatchChronicle(champion, exhibitionOpponent);
      const won = winner.id === champion.id;
      setExhibitionResult({ winner, summaryLog, fullNarrative, won });
      setExhibitionRecord(prev => ({ wins: prev.wins + (won ? 1 : 0), losses: prev.losses + (won ? 0 : 1) }));
      setExhibitionBusy(false);
    };
    if (!isAI || !simEngine.engine || !simEngine.model) { runLocal(); return; }
    let fullText = '';
    SimulationEngine.streamSimulation(
      `Eres el narrador de los COMBATES DE EXHIBICIÓN del campeón "${champion.name}". Redacta en español el duelo de exhibición entre:
• Campeón: ${champion.name} (Tier ${champion.tier || '?'}, ${champion.universe || ''})
• Retador: ${exhibitionOpponent.name} (Tier ${exhibitionOpponent.tier || '?'}, ${exhibitionOpponent.universe || ''})

Formato de 5 fases con biometría (### FASE N + ||BIOMETRICS||). El campeón puede perder si el retador es superior.
TERMINA SIEMPRE con:
VENCEDOR: Nombre completo del ganador`,
      simEngine,
      (token) => { fullText += token; setExhibitionResult({ streaming: fullText }); },
      () => {
        const aiWinner = extractWinnerFromNarrative(fullText, champion, exhibitionOpponent) || champion;
        const won = aiWinner.id === champion.id;
        const { summaryLog } = generateTournamentMatchChronicle(champion, exhibitionOpponent);
        setExhibitionResult({ winner: aiWinner, summaryLog, fullNarrative: fullText, won });
        setExhibitionRecord(prev => ({ wins: prev.wins + (won ? 1 : 0), losses: prev.losses + (won ? 0 : 1) }));
        setExhibitionBusy(false);
      },
      () => runLocal()
    );
  };

  const pickRandomChallenger = () => {
    const pool = characters.filter(c => c.id !== champion?.id);
    if (pool.length === 0) return;
    setExhibitionOpponent(pool[Math.floor(Math.random() * pool.length)]);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 📄 EXPORTAR TORNEO (Markdown / PDF vía impresión)
  // ───────────────────────────────────────────────────────────────────────────

  const buildTournamentMarkdown = () => {
    const md = [];
    md.push(`# 🏆 ${tournamentTitle}`);
    md.push('');
    md.push(`> Formato: ${formatMode === 'liga' ? 'Liga (todos contra todos)' : 'Eliminatoria'} · Participantes: ${participants.filter(Boolean).length} · Generado: ${new Date().toLocaleString()}`);
    md.push('');
    if (champion) {
      md.push('## 🥇 Campeón');
      md.push(`- **${champion.name}** (${champion.universe || ''}, Tier ${champion.tier || '?'})`);
      md.push('');
    }
    if (runnerUp) { md.push(`## 🥈 Subcampeón\n- ${runnerUp.name}\n`); }
    if (thirdPlace) { md.push(`## 🥉 Tercer puesto\n- ${thirdPlace.name}\n`); }

    md.push('## 📋 Participantes');
    md.push(participants.filter(Boolean).map(p => `- ${p.name} (${p.universe || ''}, Tier ${p.tier || '?'})`).join('\n'));
    md.push('');

    if (formatMode === 'liga') {
      md.push('## ⚽ Clasificación de la Liga');
      const standings = getLeagueStandings(leagueMatches);
      md.push('| Pos | Luchador | PJ | G | E | P | Pts |');
      md.push('|---|---|---|---|---|---|---|');
      standings.forEach((s, i) => {
        md.push(`| ${i + 1} | ${s.char.name} | ${s.played} | ${s.wins} | ${s.draws} | ${s.losses} | **${s.points}** |`);
      });
      md.push('');
      md.push('## ⚔️ Partidos de la Liga');
      for (const match of leagueMatches) {
        if (!match.winner) continue;
        const w = match.winner === 'draw' ? 'EMPATE' : match.winner.name;
        md.push(`### ${match.charA.name} vs ${match.charB.name} — 🏁 ${w}`);
        md.push(match.log || '');
        if (match.fullNarrative) md.push(`\n<details><summary>Crónica completa</summary>\n\n${match.fullNarrative}\n</details>`);
        md.push('');
      }
    } else {
      for (const round of roundsRef.current.length > 0 ? roundsRef.current : rounds) {
        md.push(`## ${round.name}`);
        md.push('');
        for (const match of round.matches) {
          if (!match.charA || !match.charB) continue;
          const w = match.winner ? `🏆 ${match.winner.name}` : '⏳ Pendiente';
          md.push(`### ${match.charA.name} vs ${match.charB.name} — ${w}`);
          md.push(match.log || 'Pendiente de simulación.');
          if (match.fullNarrative) md.push(`\n<details><summary>Crónica completa</summary>\n\n${match.fullNarrative}\n</details>`);
          md.push('');
        }
      }
    }
    if (bronzeMatch?.winner) {
      md.push(`## 🥉 Combate de Bronce\n- **${bronzeMatch.winner.name}** derrota a ${bronzeMatch.charA.id === bronzeMatch.winner.id ? bronzeMatch.charB.name : bronzeMatch.charA.name}.\n`);
    }
    md.push('---');
    md.push('*Generado por APEX Engine — Multiverse Powerscaling & Battle Simulator*');
    return md.join('\n');
  };

  const handleExportMarkdown = () => {
    const text = buildTournamentMarkdown();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `torneo-${tournamentTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMsg('📄 Torneo exportado en Markdown.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportPDF = () => {
    const title = tournamentTitle;
    const md = buildTournamentMarkdown();
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${title}</title>
<style>
body{font-family:'Segoe UI',Arial,sans-serif;margin:32px;color:#111;line-height:1.5}
h1{color:#b45309} h2{color:#7c2d12;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-top:24px}
details{margin:6px 0} summary{cursor:pointer;font-weight:600;color:#92400e}
table{border-collapse:collapse;width:100%} td,th{border:1px solid #cbd5e1;padding:6px 10px;font-size:13px} th{background:#fef3c7}
@media print{details>div{display:block !important}}
</style></head><body>${md.split('\n').map(l => {
      if (l.startsWith('### ')) return `<h3>${l.slice(4)}</h3>`;
      if (l.startsWith('## ')) return `<h2>${l.slice(3)}</h2>`;
      if (l.startsWith('# ')) return `<h1>${l.slice(2)}</h1>`;
      if (l.startsWith('| ') && l.endsWith(' |')) {
        const cells = l.split('|').filter(c => c.trim()).map(c => c.trim());
        if (cells.every(c => /^-+$/.test(c))) return '';
        return `<tr>${cells.map(c => c.replace(/^\*+|\*+$/g, '')).map(c => `<td>${c}</td>`).join('')}</tr>`;
      }
      if (l.startsWith('<details>')) return '<details><div>';
      if (l.startsWith('</details>')) return '</div></details>';
      if (l.startsWith('<summary>')) return `<summary>${l.slice(9, -10)}</summary>`;
      if (l.startsWith('- ')) return `<li>${l.slice(2)}</li>`;
      if (l === '---') return '<hr>';
      return `<p>${l}</p>`;
    }).join('')}</body></html>`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 500);
    setToastMsg('🖨️ Abriendo vista para guardar como PDF (Ctrl+P → Guardar como PDF).');
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Tournament Save & History Functions
  const saveTournamentToHistory = (title, champ, roundList) => {
    const entry = {
      id: `tourney_${Date.now()}`,
      title: title || 'Torneo Multiversal',
      date: new Date().toISOString(),
      size: tournamentSize,
      champion: champ,
      rounds: roundList || rounds,
      participants: participants,
      betsCount: Object.keys(bets).length
    };

    setHistory(prev => {
      const updated = [entry, ...prev.filter(t => t.id !== entry.id)].slice(0, 30);
      try {
        localStorage.setItem(STORAGE_KEY_TOURNAMENT_HISTORY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setToastMsg(`💾 Torneo "${entry.title}" guardado en el Historial.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleLoadTournament = (tourney) => {
    setTournamentTitle(tourney.title);
    setTournamentSize(tourney.size || 8);
    setParticipants(tourney.participants || []);
    setChampion(tourney.champion || null);
    setRounds(tourney.rounds || []);
    setActiveTab('bracket');
    setToastMsg(`📥 Torneo "${tourney.title}" cargado en el cuadro.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDeleteHistoryTournament = (id, e) => {
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(t => t.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_TOURNAMENT_HISTORY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleExportTournamentMarkdown = (tourney) => {
    let md = `# APEX TORNEO MULTIVERSAL: ${tourney.title}\n\n`;
    md += `**Fecha:** ${new Date(tourney.date).toLocaleString()}\n`;
    md += `**Luchadores:** ${tourney.size}\n`;
    md += `**🏆 Campeón:** ${tourney.champion?.name} (${tourney.champion?.universe})\n\n`;
    md += `## Rondas y Combates:\n\n`;

    (tourney.rounds || []).forEach(r => {
      md += `### ${r.name}\n`;
      r.matches.forEach(m => {
        md += `- **${m.charA?.name || '?'}** vs **${m.charB?.name || '?'}** ➔ **Vencedor:** ${m.winner?.name || 'Pendiente'}\n`;
        if (m.log) md += `  - *${m.log}*\n`;
      });
      md += `\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Torneo_${tourney.title.replace(/\s+/g, '_')}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-950 border border-amber-500/40 rounded-2xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-[0_0_60px_rgba(245,158,11,0.25)] font-mono text-xs overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 rounded-t-2xl gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-lg shadow-amber-950">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
                MODO TORNEO MULTIVERSAL · BRACKET & HISTORIAL
              </span>
              <input
                type="text"
                value={tournamentTitle}
                onChange={(e) => setTournamentTitle(e.target.value)}
                className="text-sm sm:text-base font-bold text-white font-cinzel bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Navigation Tabs & Coins */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-bold text-xs">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>{oracleCoins} 🪙</span>
            </div>

            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('bracket')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'bracket' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Cuadro</span>
              </button>

              <button
                onClick={() => setActiveTab('custom')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'custom' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Elegir Participantes</span>
              </button>

              <button
                onClick={() => setActiveTab('filter')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'filter' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Llenar por Filtros</span>
              </button>

              <button
                onClick={() => setActiveTab('league')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'league' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Liga {leagueMatches.filter(m => m.winner).length > 0 ? `(${leagueMatches.filter(m => m.winner).length}/${leagueMatches.length})` : ''}</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'history' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Historial ({history.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Toolbar (When in Bracket View) */}
        {activeTab === 'bracket' && (
          <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Tamaño:</span>
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                {[4, 8, 16].map(sz => (
                  <button
                    key={sz}
                    onClick={() => {
                      setTournamentSize(sz);
                      initTournament(sz);
                    }}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                      tournamentSize === sz ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sz} Luchadores
                  </button>
                ))}
              </div>

              <button
                onClick={() => initTournament(tournamentSize)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10.5px] flex items-center gap-1 cursor-pointer"
                title="Mezclar y reiniciar cuadro"
              >
                <Shuffle className="w-3 h-3" />
                <span>Barajar</span>
              </button>

              <span className="text-slate-400 text-[11px] ml-2">Formato:</span>
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setFormatMode('elim')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${formatMode === 'elim' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="Cuadro eliminatorio clásico"
                >
                  🏆 Eliminatoria
                </button>
                <button
                  onClick={startLeague}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${formatMode === 'liga' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="Todos contra todos con puntos (3 por victoria, 1 por empate)"
                >
                  ⚽ Liga (Todos vs Todos)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleComputeAllOddsWithAI}
                disabled={!!champion || aiOddsLoading || aiAllRunning}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-yellow-600/40 text-yellow-300 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm text-[11px] disabled:opacity-50"
                title="La IA calcula cuotas dinámicas (probabilidades) para cada combate disponible"
              >
                <Coins className={`w-3.5 h-3.5 ${aiOddsLoading ? 'animate-spin' : ''}`} />
                <span>{aiOddsLoading ? 'Calculando cuotas IA...' : '🪙 Cuotas IA'}</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm text-[11px]"
                title="Descargar el torneo completo en Markdown (crónicas incluidas)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Markdown</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm text-[11px]"
                title="Abrir vista de impresión para guardar como PDF (Ctrl+P)"
              >
                <FileText className="w-3.5 h-3.5 text-red-400" />
                <span>PDF</span>
              </button>

              <button
                onClick={() => saveTournamentToHistory(tournamentTitle, champion, rounds)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm text-[11px]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar</span>
              </button>

              <button
                onClick={handleSimulateAllRemainingFast}
                disabled={!!champion || isSimulatingDetailed}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold transition flex items-center gap-1 cursor-pointer text-[11px] disabled:opacity-50"
                title="Resolver todos los combates de forma instantánea"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>⚡ Rápido</span>
              </button>

              <button
                onClick={handleSimulateAllRemainingDetailed}
                disabled={!!champion || isSimulatingDetailed || aiAllRunning}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 hover:from-red-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-950 text-[11px] disabled:opacity-50"
                title="Simular crónicas completas y detalladas para todos los combates restantes"
              >
                <Swords className={`w-3.5 h-3.5 ${isSimulatingDetailed ? 'animate-spin' : ''}`} />
                <span>{isSimulatingDetailed ? 'Simulando...' : '⚔️ Simular Crónicas (Todo)'}</span>
              </button>

              <button
                onClick={handleSimulateAllWithAI}
                disabled={!!champion || isSimulatingDetailed || aiAllRunning}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-950 text-[11px] disabled:opacity-50"
                title="Narrar TODO el torneo con IA (ronda a ronda, con texto en vivo)"
              >
                <Sparkles className={`w-3.5 h-3.5 ${aiAllRunning ? 'animate-pulse' : ''}`} />
                <span>{aiAllRunning ? '🤖 Narrando con IA...' : '🤖 Simular Todo con IA'}</span>
              </button>
            </div>
          </div>
        )}

        {/* AI Streaming Banner (torneo completo) */}
        {aiAllRunning && (
          <div className="mx-4 mt-2 p-3 rounded-xl bg-purple-950/50 border border-purple-500/40 text-purple-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-bold mb-1">🧠 La IA está narrando el torneo en vivo...</p>
              <p className="text-purple-300/80 text-[10px] font-mono leading-relaxed break-words max-h-20 overflow-y-auto whitespace-pre-wrap">
                {aiSimText || 'Conectando con el motor de narrativa...'}
              </p>
            </div>
          </div>
        )}

        {/* Toast Alert */}
        {toastMsg && (
          <div className="p-2.5 mx-4 mt-2 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center justify-between animate-in fade-in">
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Modal Body: TAB 1 (BRACKET) */}
        {activeTab === 'bracket' && (
          <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto flex-1 flex gap-6 items-stretch min-w-[700px]">
            {rounds.map((round, rIdx) => (
              <div key={round.name} className="flex-1 flex flex-col justify-around gap-4 min-w-[240px]">
                <div className="text-center pb-2 border-b border-slate-800 font-bold font-cinzel text-amber-400 text-xs uppercase tracking-wider">
                  {round.name}
                </div>

                <div className="flex flex-col justify-around gap-4 flex-1">
                  {round.matches.map((match, mIdx) => {
                    const hasFighters = match.charA && match.charB;
                    const { oddsA, oddsB } = getMatchOdds(match.id, match.charA, match.charB);
                    const activeBet = bets[match.id];

                    return (
                      <div 
                        key={match.id}
                        className={`p-3 rounded-2xl border transition shadow-lg relative ${
                          match.winner 
                            ? 'bg-slate-900/60 border-emerald-500/40' 
                            : hasFighters 
                              ? 'bg-slate-900 border-amber-500/40 hover:border-amber-400' 
                              : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        {/* Match Header */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2 border-b border-slate-800 pb-1">
                          <span>{match.round}</span>
                          {match.winner ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Resuelto
                            </span>
                          ) : hasFighters ? (
                            <span className="text-amber-400 font-bold animate-pulse">
                              ⚔️ Listo
                            </span>
                          ) : (
                            <span className="text-slate-600">Esperando</span>
                          )}
                        </div>

                        {/* Fighter A */}
                        <div className={`p-2 rounded-xl border flex items-center justify-between gap-2 mb-1.5 transition ${
                          match.winner?.id === match.charA?.id 
                            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold' 
                            : match.charA 
                              ? 'bg-slate-950 border-slate-800 text-slate-200' 
                              : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-600'
                        }`}>
                          <div className="flex items-center gap-2 truncate">
                            {match.charA && (
                              <div className="w-6 h-6 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                                <img src={match.charA.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(match.charA.name)}`} alt="" className="w-full h-full object-contain" />
                              </div>
                            )}
                            <span className="truncate text-xs">{match.charA?.name || 'Por definir...'}</span>
                          </div>
                          {match.charA && !match.winner && (
                            <button
                              onClick={() => handlePlaceBet(match.id, match.charA, oddsA)}
                              disabled={!!activeBet}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition ${
                                activeBet?.charId === match.charA.id 
                                  ? 'bg-yellow-500 text-black font-black border-yellow-400' 
                                  : 'bg-slate-900 border-amber-500/30 text-amber-300 hover:bg-amber-950'
                              }`}
                              title={`Apostar 50 monedas a ${match.charA.name}`}
                            >
                              x{oddsA}
                            </button>
                          )}
                        </div>

                        {/* Fighter B */}
                        <div className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition ${
                          match.winner?.id === match.charB?.id 
                            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold' 
                            : match.charB 
                              ? 'bg-slate-950 border-slate-800 text-slate-200' 
                              : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-600'
                        }`}>
                          <div className="flex items-center gap-2 truncate">
                            {match.charB && (
                              <div className="w-6 h-6 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                                <img src={match.charB.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(match.charB.name)}`} alt="" className="w-full h-full object-contain" />
                              </div>
                            )}
                            <span className="truncate text-xs">{match.charB?.name || 'Por definir...'}</span>
                          </div>
                          {match.charB && !match.winner && (
                            <button
                              onClick={() => handlePlaceBet(match.id, match.charB, oddsB)}
                              disabled={!!activeBet}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition ${
                                activeBet?.charId === match.charB.id 
                                  ? 'bg-yellow-500 text-black font-black border-yellow-400' 
                                  : 'bg-slate-900 border-amber-500/30 text-amber-300 hover:bg-amber-950'
                              }`}
                              title={`Apostar 50 monedas a ${match.charB.name}`}
                            >
                              x{oddsB}
                            </button>
                          )}
                        </div>

                        {/* Log / Resolution Controls */}
                        {hasFighters && !match.winner && (
                          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
                            <button
                              onClick={() => handleSimulateFast(rIdx, mIdx)}
                              disabled={!!aiSimKey || aiAllRunning}
                              className="flex-1 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px] transition cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40"
                              title="Resolución matemática rápida instantánea"
                            >
                              <FastForward className="w-3 h-3 text-slate-400" />
                              <span>⚡ Rápido</span>
                            </button>
                            <button
                              onClick={() => handleSimulateDetailed(rIdx, mIdx)}
                              disabled={!!aiSimKey || aiAllRunning}
                              className="flex-1 py-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-bold text-[10px] transition cursor-pointer flex items-center justify-center gap-1 shadow-sm disabled:opacity-40"
                              title="Simular crónica de combate completa con fases y narrativa"
                            >
                              <Swords className="w-3 h-3" />
                              <span>⚔️ Crónica</span>
                            </button>
                            <button
                              onClick={() => handleSimulateWithAI(rIdx, mIdx)}
                              disabled={!!aiSimKey || aiAllRunning}
                              className={`flex-1 py-1 rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40 border ${
                                aiSimKey === `${rIdx}-${mIdx}`
                                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950'
                                  : 'bg-gradient-to-r from-purple-700 to-fuchsia-700 hover:from-purple-600 text-white border-purple-500/40 shadow-sm'
                              }`}
                              title="Narrar este combate con IA (texto en vivo, vencedor coherente con Tiers)"
                            >
                              <Sparkles className={`w-3 h-3 ${aiSimKey === `${rIdx}-${mIdx}` ? 'animate-spin' : ''}`} />
                              <span>{aiSimKey === `${rIdx}-${mIdx}` ? 'Narrando...' : '🤖 IA'}</span>
                            </button>
                          </div>
                        )}

                        {/* Streaming IA del combate individual */}
                        {aiSimKey === `${rIdx}-${mIdx}` && (
                          <div className="mt-2 p-2 rounded-lg bg-purple-950/50 border border-purple-500/40 text-purple-200 text-[10px] font-mono leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap animate-in fade-in">
                            {aiSimText || '🧠 La IA está redactando el combate...'}
                          </div>
                        )}

                        {match.log && (
                          <p className="mt-2 text-[10px] text-slate-400 italic bg-slate-950 p-2 rounded-lg border border-slate-800 leading-snug">
                            {match.log}
                          </p>
                        )}

                        {match.fullNarrative && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedChronicleMatch(match)}
                              className="flex-1 py-1 px-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer shadow-sm"
                            >
                              <BookOpen className="w-3 h-3 text-cyan-400" />
                              <span>📜 Leer Crónica</span>
                            </button>
                            {onOpenSimulationResult && (
                              <button
                                type="button"
                                onClick={() => {
                                  onOpenSimulationResult(match.fullNarrative, match.charA, match.charB, match.winner);
                                  onClose();
                                }}
                                className="p-1 px-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-amber-500/40 text-amber-300 transition cursor-pointer flex items-center gap-1 text-[9.5px] font-bold"
                                title="Abrir en el Visor Biométrico de la Arena Principal"
                              >
                                <span>Arena</span>
                                <ExternalLink className="w-3 h-3 text-amber-400" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Champion Podium */}
            {champion && (
              <div className="flex-1 flex flex-col items-center justify-center min-w-[280px] p-5 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.4)] animate-in zoom-in-95">
                <Crown className="w-10 h-10 text-yellow-400 animate-bounce mb-1" />
                <span className="text-[11px] text-amber-400 font-bold uppercase tracking-widest block text-center">
                  🏆 PODIO FINAL 🏆
                </span>

                {/* Podium 3-column */}
                <div className="flex items-end gap-3 mt-4 w-full justify-center">
                  {/* Subcampeón */}
                  <div className="flex flex-col items-center gap-1 w-[30%]">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-500 bg-slate-950 flex items-center justify-center text-2xl">
                      {runnerUp?.avatar ? <img src={runnerUp.avatar} alt="" className="w-full h-full object-contain" onError={e => { e.target.style.display='none'; }} /> : '🥈'}
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 text-center leading-tight">{runnerUp?.name?.split('(')[0].trim() || 'Subcampeón'}</span>
                    <span className="text-[8px] font-mono text-slate-500">🥈 2º puesto</span>
                  </div>
                  {/* Campeón */}
                  <div className="flex flex-col items-center gap-1 w-[40%] -translate-y-2">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-yellow-400 shadow-xl bg-slate-950">
                      <img src={champion.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(champion.name)}`} alt="" className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-sm font-black text-white font-cinzel text-center leading-tight">{champion.name.split('(')[0].trim()}</h3>
                    <span className="text-[10px] text-amber-300 font-mono text-center">{champion.tier}</span>
                    <span className="text-[9px] font-mono text-slate-400">🥇 CAMPEÓN</span>
                  </div>
                  {/* Tercer puesto */}
                  <div className="flex flex-col items-center gap-1 w-[30%]">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-700 bg-slate-950 flex items-center justify-center text-2xl">
                      {thirdPlace?.avatar ? <img src={thirdPlace.avatar} alt="" className="w-full h-full object-contain" onError={e => { e.target.style.display='none'; }} /> : '🥉'}
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 text-center leading-tight">{thirdPlace?.name?.split('(')[0].trim() || '3er puesto'}</span>
                    <span className="text-[8px] font-mono text-slate-500">🥉 Bronce</span>
                  </div>
                </div>

                {/* Combate de bronce pendiente */}
                {bronzeMatch && !bronzeMatch.winner && (
                  <div className="mt-4 w-full p-3 rounded-xl bg-slate-950/70 border border-amber-700/50 text-center space-y-2">
                    <p className="text-[10px] font-mono text-amber-300">🥉 COMBATE DE BRONCE</p>
                    <p className="text-[10px] text-slate-300 truncate">{bronzeMatch.charA?.name?.split('(')[0].trim()} vs {bronzeMatch.charB?.name?.split('(')[0].trim()}</p>
                    <div className="flex gap-1.5 justify-center">
                      <button
                        onClick={handleResolveBronzeFast}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer"
                      >
                        ⚡ Resolver
                      </button>
                      <button
                        onClick={handleResolveBronzeWithAI}
                        disabled={!!aiSimKey}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-700 to-fuchsia-700 hover:from-purple-600 text-white text-[10px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                      >
                        <Sparkles className={`w-3 h-3 ${aiSimKey === 'bronze' ? 'animate-spin' : ''}`} />
                        {aiSimKey === 'bronze' ? 'Narrando...' : '🤖 Con IA'}
                      </button>
                    </div>
                    {aiSimKey === 'bronze' && (
                      <p className="text-[9px] font-mono text-purple-300/80 text-left max-h-16 overflow-y-auto whitespace-pre-wrap break-words">{aiSimText || 'Conectando...'}</p>
                    )}
                  </div>
                )}

                {/* Exhibiciones del campeón */}
                <button
                  onClick={() => setShowExhibitions(!showExhibitions)}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Swords className="w-3 h-3" />
                  {showExhibitions ? 'Ocultar Exhibiciones' : `🤺 Exhibiciones del Campeón (${exhibitionRecord.wins}V-${exhibitionRecord.losses}D)`}
                </button>

                {showExhibitions && (
                  <div className="mt-2 w-full p-3 rounded-xl bg-slate-950/70 border border-cyan-500/30 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <SearchableCharacterSelector
                        characters={characters}
                        value={exhibitionOpponent?.id || ''}
                        onChange={(c) => setExhibitionOpponent(c)}
                        color="cyan"
                      />
                      <button
                        onClick={pickRandomChallenger}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer flex items-center gap-1"
                        title="Retador aleatorio"
                      >
                        <Dices className="w-3 h-3" />
                        Azar
                      </button>
                    </div>
                    {exhibitionOpponent && (
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => handleExhibitionSimulate('fast')}
                          disabled={exhibitionBusy}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer disabled:opacity-50"
                        >
                          ⚡ Rápido
                        </button>
                        <button
                          onClick={() => handleExhibitionSimulate('ai')}
                          disabled={exhibitionBusy}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-700 to-fuchsia-700 hover:from-purple-600 text-white text-[10px] font-bold cursor-pointer disabled:opacity-50"
                        >
                          🤖 Narrado con IA
                        </button>
                      </div>
                    )}
                    {exhibitionResult?.streaming && !exhibitionResult.winner && (
                      <p className="text-[9px] font-mono text-purple-300/80 max-h-20 overflow-y-auto whitespace-pre-wrap break-words">{exhibitionResult.streaming}</p>
                    )}
                    {exhibitionResult?.winner && (
                      <div className="p-2 rounded-lg bg-slate-900 border border-cyan-500/30 text-[10px]">
                        <p className={exhibitionResult.won ? 'text-emerald-300 font-bold' : 'text-red-400 font-bold'}>
                          {exhibitionResult.won ? '🏆 El campeón defiende el título' : '💀 ¡El campeón CAE ante el retador!'}
                        </p>
                        <p className="text-slate-300 mt-0.5">Vencedor: {exhibitionResult.winner.name} · Récord del campeón: {exhibitionRecord.wins}V-{exhibitionRecord.losses}D</p>
                        {exhibitionResult.fullNarrative && (
                          <button
                            type="button"
                            onClick={() => setSelectedChronicleMatch({ charA: champion, charB: exhibitionOpponent, fullNarrative: exhibitionResult.fullNarrative, log: exhibitionResult.summaryLog, winner: exhibitionResult.winner })}
                            className="mt-1.5 text-[9px] font-mono text-cyan-400 underline cursor-pointer"
                          >
                            📜 Ver crónica completa
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Body: TAB LIGA (todos contra todos con puntos) */}
        {activeTab === 'league' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div>
                <h4 className="font-bold text-white text-sm font-cinzel flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>⚽ Liga Multiversal — Todos contra Todos</span>
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  {participants.filter(Boolean).length} participantes · {leagueMatches.filter(m => m.winner).length}/{leagueMatches.length} partidos jugados · 3 pts victoria, 1 pt empate
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { leagueMatches.filter(m => !m.winner).forEach(m => simulateLeagueMatch(m.id)); }}
                  disabled={leagueSimRunning}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Simular Restantes (Rápido)</span>
                </button>
                <button
                  onClick={simulateAllLeagueWithAI}
                  disabled={leagueSimRunning}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-indigo-600 hover:from-purple-600 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-purple-950 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${leagueSimRunning ? 'animate-pulse' : ''}`} />
                  <span>{leagueSimRunning ? '🤖 Narrando liga...' : '🤖 Simular Liga con IA'}</span>
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>

            {/* Clasificación */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 font-bold text-xs text-emerald-300 font-mono flex items-center gap-2">
                <Crown className="w-3.5 h-3.5 text-yellow-400" /> CLASIFICACIÓN
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono">
                  <thead>
                    <tr className="text-slate-500 text-[10px] uppercase">
                      <th className="px-3 py-2 text-left">Pos</th>
                      <th className="px-3 py-2 text-left">Luchador</th>
                      <th className="px-2 py-2">PJ</th>
                      <th className="px-2 py-2">G</th>
                      <th className="px-2 py-2">E</th>
                      <th className="px-2 py-2">P</th>
                      <th className="px-3 py-2">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getLeagueStandings(leagueMatches).map((s, i) => (
                      <tr key={s.char.id} className={`border-t border-slate-800/60 ${i === 0 ? 'bg-amber-950/30 text-amber-200 font-bold' : 'text-slate-300'}`}>
                        <td className="px-3 py-2">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                        <td className="px-3 py-2 truncate max-w-[160px]">{s.char.name.split('(')[0].trim()}</td>
                        <td className="px-2 py-2 text-center">{s.played}</td>
                        <td className="px-2 py-2 text-center text-emerald-400">{s.wins}</td>
                        <td className="px-2 py-2 text-center text-slate-400">{s.draws}</td>
                        <td className="px-2 py-2 text-center text-red-400">{s.losses}</td>
                        <td className="px-3 py-2 text-center font-black text-amber-300">{s.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Partidos de la liga */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {leagueMatches.map((match) => {
                const isSimulating = leagueSimKey === match.id;
                return (
                  <div key={match.id} className={`p-3 rounded-xl border ${match.winner ? 'border-emerald-500/40 bg-slate-900/60' : 'border-slate-800 bg-slate-900/40'}`}>
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                      <span className="text-slate-400 truncate">
                        {match.charA?.name?.split('(')[0].trim()} <span className="text-red-500/70">vs</span> {match.charB?.name?.split('(')[0].trim()}
                      </span>
                      {match.winner ? (
                        <span className="text-emerald-400 font-bold shrink-0">
                          {match.winner === 'draw' ? '🤝 Empate' : `🏆 ${match.winner.name.split('(')[0].trim()}`}
                        </span>
                      ) : (
                        <span className="flex gap-1 shrink-0">
                          <button onClick={() => simulateLeagueMatch(match.id)} disabled={isSimulating || leagueSimRunning} className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[9px] font-bold cursor-pointer disabled:opacity-40">⚡</button>
                          <button onClick={() => simulateLeagueMatchWithAI(match.id)} disabled={isSimulating || leagueSimRunning} className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer disabled:opacity-40 border ${isSimulating ? 'bg-purple-600 text-white border-purple-400' : 'bg-gradient-to-r from-purple-700 to-fuchsia-700 text-white border-purple-500/40'}`}>
                            {isSimulating ? 'Narrando...' : '🤖 IA'}
                          </button>
                        </span>
                      )}
                    </div>
                    {match.log && <p className="mt-1.5 text-[9px] text-slate-500 italic">{match.log}</p>}
                    {isSimulating && (
                      <p className="mt-1.5 text-[9px] font-mono text-purple-300/80 max-h-14 overflow-y-auto whitespace-pre-wrap break-words">{leagueSimText || 'Conectando...'}</p>
                    )}
                    {match.fullNarrative && (
                      <button
                        type="button"
                        onClick={() => setSelectedChronicleMatch(match)}
                        className="mt-1.5 text-[9px] font-mono text-cyan-400 underline cursor-pointer"
                      >
                        📜 Ver crónica
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Body: TAB 2 (CUSTOM PARTICIPANT SELECTION) */}
        {activeTab === 'custom' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div>
                <h4 className="font-bold text-white text-sm font-cinzel flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Configuración Manual de Participantes ({tournamentSize} Plazas)</span>
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">
                  Elige individualmente a cada uno de los luchadores del torneo usando el buscador del catálogo completo ({characters.length} gladiadores).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleFillEmptySlotsRandomly}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Rellenar Huecos al Azar</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAllSlots}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-red-500/40 text-red-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vaciar Todo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('bracket')}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-950"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Aplicar y Ver Cuadro ⚔️</span>
                </button>
              </div>
            </div>

            {/* Grid of Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: tournamentSize }).map((_, idx) => {
                const char = participants[idx];
                const matchNumber = Math.floor(idx / 2) + 1;
                const corner = idx % 2 === 0 ? 'Esquina Roja' : 'Esquina Azul';

                return (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-2xl border transition relative flex flex-col justify-between gap-2.5 ${
                      char 
                        ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm' 
                        : 'bg-slate-950/60 border-dashed border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[10.5px]">
                      <span className="font-bold text-emerald-400 font-mono">
                        Plaza #{idx + 1}
                      </span>
                      <span className="text-slate-500 text-[9.5px]">
                        Match {matchNumber} · {corner}
                      </span>
                    </div>

                    {/* Character Selector Component */}
                    <SearchableCharacterSelector
                      characters={characters}
                      value={char?.id}
                      onChange={(selected) => handleUpdateSlot(idx, selected)}
                      label="Elegir Gladiador:"
                      color="emerald"
                    />

                    {/* Quick Card Preview */}
                    {char ? (
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-700">
                          <img src={char.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(char.name)}`} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="truncate flex-1">
                          <span className="font-bold text-white block truncate text-[11px]">{char.name}</span>
                          <div className="flex items-center gap-1 text-[9px] text-slate-400 truncate">
                            <span className="px-1 rounded bg-slate-900 text-amber-300 font-bold border border-slate-800">
                              {char.tier?.split('|')[0] || char.tier}
                            </span>
                            <span className="truncate">{char.universe}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateSlot(idx, null)}
                          className="p-1 text-slate-500 hover:text-red-400 rounded-lg transition cursor-pointer"
                          title="Quitar de esta plaza"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-[10px]">
                        Plaza Vacía — Selecciona un gladiador arriba
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Body: TAB 3 (ADVANCED FILTER & RANDOMIZER) */}
        {activeTab === 'filter' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-purple-950/40 border border-purple-500/40 space-y-1">
              <h4 className="font-bold text-white text-sm font-cinzel flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-400" />
                <span>Generador Temático & Aleatorio Multiversal</span>
              </h4>
              <p className="text-slate-400 text-xs">
                Selecciona una franquicia, universo, tier de poder o arquetipo de combate para generar un torneo a medida.
              </p>
            </div>

            {/* Packs de Dragon Ball — torneos temáticos rápidos */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-orange-950/30 via-slate-900 to-amber-950/20 border border-orange-500/30 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <label className="block text-orange-300 font-bold text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-orange-400" />
                  🐉 Packs de Dragon Ball (Torneos por Eras)
                </label>
                {filterDBPack !== 'none' && (
                  <button
                    type="button"
                    onClick={() => setFilterDBPack('none')}
                    className="text-[10px] font-mono text-slate-500 hover:text-red-400 transition cursor-pointer"
                  >
                    ✕ Quitar pack
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DB_PACKS.map((pack) => {
                  const isActive = filterDBPack === pack.id;
                  const count = dbPackCounts[pack.id] || 0;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setFilterDBPack(isActive ? 'none' : pack.id)}
                      title={pack.description}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                        isActive
                          ? 'bg-orange-500/25 border-orange-400 text-orange-200 shadow-md shadow-orange-950/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-orange-500/50 hover:text-orange-200'
                      }`}
                    >
                      <span>{pack.name}</span>
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${isActive ? 'bg-orange-400/30 text-orange-100' : 'bg-slate-800 text-slate-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              {filterDBPack !== 'none' && (
                <p className="text-[10px] font-mono text-orange-300/70">
                  🎯 Pack activo: {DB_PACKS.find(p => p.id === filterDBPack)?.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Franchise / Universe Group */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-bold text-xs">Franquicia o Universo:</label>
                <select
                  value={filterFranchise}
                  onChange={(e) => setFilterFranchise(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs outline-none"
                >
                  <option value="all">Todas las Franquicias ({characters.length} Luchadores)</option>
                  {FRANCHISE_GROUPS.filter(g => g.id !== 'other').map(g => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </div>

              {/* Tier Range */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-bold text-xs">Rango de Tier de Poder:</label>
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs outline-none"
                >
                  <option value="all">Todos los Tiers (Desde Humano hasta Omni)</option>
                  <option value="cosmic">🌌 Cósmico & Multiversal (Tier 1 a 3)</option>
                  <option value="planetary">💥 Planetario & Estelar (Tier 4 a 5)</option>
                  <option value="continental">🌋 Continental & País (Tier 6 a 7-A)</option>
                  <option value="street">🥋 Callejero, Marcial & Humano (Tier 7-B a 10)</option>
                </select>
              </div>

              {/* Combat Tag / Arquetipo */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-bold text-xs">Arquetipo o Hax de Combate:</label>
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs outline-none"
                >
                  <option value="all">Cualquier Tipo de Hax</option>
                  <option value="stand">Usuarios de Stand (JoJo)</option>
                  <option value="ki divino">Ki Divino / Dioses</option>
                  <option value="regenera">Regeneración Celular</option>
                  <option value="espadachin">Espadachines / Armas</option>
                  <option value="artes marciales">Artes Marciales Puras</option>
                  <option value="maldita">Energía Maldita / Hechiceros</option>
                  <option value="nen">Usuarios de Nen</option>
                </select>
              </div>

              {/* Seeding Strategy */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-bold text-xs">Método de Emparejamiento:</label>
                <select
                  value={seedMode}
                  onChange={(e) => setSeedMode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs outline-none"
                >
                  <option value="random">🎲 Caótico / Azar Absoluto</option>
                  <option value="balanced">⚖️ Equilibrado por Tiers (Evita Speedblitz en Ronda 1)</option>
                </select>
              </div>

            </div>

            {/* Generate Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateFilteredTournament}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-amber-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-purple-950 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generar Torneo con estos Filtros ({tournamentSize} Guerreros)
                  {filterDBPack !== 'none' ? ` · ${DB_PACKS.find(p => p.id === filterDBPack)?.name || ''}` : ''}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body: TAB 3 (TOURNAMENT HISTORY & SAVED) */}
        {activeTab === 'history' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
            {history.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Trophy className="w-10 h-10 mx-auto text-slate-700" />
                <p>Aún no has guardado ningún torneo en el historial.</p>
                <p className="text-[11px]">Cuando completes o guardes un torneo en el cuadro, aparecerá aquí con su podio y combates.</p>
              </div>
            ) : (
              history.map((t) => (
                <div 
                  key={t.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-amber-500/40 p-1 overflow-hidden shrink-0 flex items-center justify-center">
                      {t.champion ? (
                        <img src={t.champion.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(t.champion.name)}`} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <Trophy className="w-6 h-6 text-amber-500" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-xs sm:text-sm font-cinzel">{t.title}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          {t.size} Guerreros
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        🏆 Campeón: <strong className="text-amber-300">{t.champion?.name || 'En curso...'}</strong> · {new Date(t.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => handleLoadTournament(t)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3" />
                      <span>Cargar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportTournamentMarkdown(t)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Exportar Resumen a Markdown"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteHistoryTournament(t.id, e)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-red-950 border border-slate-700 text-slate-400 hover:text-red-400 transition cursor-pointer"
                      title="Eliminar del historial"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500 text-[11px]">
            💡 Puedes simular crónicas completas ⚔️ o resolver rápido ⚡ para avanzar de ronda y multiplicar tus apuestas.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-slate-800 transition cursor-pointer"
          >
            Cerrar Torneo
          </button>
        </div>
      </div>

      {/* Floating Modal for Full Tournament Match Chronicle */}
      {selectedChronicleMatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-cyan-500/50 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl shadow-cyan-950/50 animate-in zoom-in-95 font-sans">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm font-cinzel">
                  Crónica de Combate · {selectedChronicleMatch.round}
                </h3>
              </div>
              <button
                onClick={() => setSelectedChronicleMatch(null)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-200 leading-relaxed">
              <div className="flex items-center justify-around p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-center">
                  <span className="font-bold text-white block">{selectedChronicleMatch.charA?.name}</span>
                  <span className="text-[10px] text-amber-300 font-mono">{selectedChronicleMatch.charA?.tier}</span>
                </div>
                <span className="font-bold text-red-500 font-cinzel text-sm">VS</span>
                <div className="text-center">
                  <span className="font-bold text-white block">{selectedChronicleMatch.charB?.name}</span>
                  <span className="text-[10px] text-amber-300 font-mono">{selectedChronicleMatch.charB?.tier}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 whitespace-pre-line leading-relaxed text-[13px] text-slate-300 font-sans shadow-inner">
                {selectedChronicleMatch.fullNarrative}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 font-mono">
                <CheckCircle className="w-4 h-4" /> Vencedor: {selectedChronicleMatch.winner?.name}
              </span>
              <div className="flex gap-2">
                {onOpenSimulationResult && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSimulationResult(selectedChronicleMatch.fullNarrative, selectedChronicleMatch.charA, selectedChronicleMatch.charB, selectedChronicleMatch.winner);
                      setSelectedChronicleMatch(null);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir en Visor de la Arena</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedChronicleMatch(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
