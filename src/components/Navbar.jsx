import React, { useRef } from 'react';
import { Shield, Swords, Sparkles, GitBranch, FolderCheck, PlusCircle, Cpu, Trophy, Download, Upload, Scale, Globe, Crown, Coffee, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getTranslation } from '../services/i18n';

export default function Navbar({ 
  mode, 
  setMode, 
  onOpenNewCharacter, 
  onOpenVault, 
  vaultStatus, 
  onOpenAiConfig, 
  aiConfig, 
  onOpenTournament,
  onOpenTierList,
  onOpenComparator,
  onOpenCommunityVault,
  onOpenBatchAiImporter,
  onOpenRosterManager,
  onOpenRandomMatchmaker,
  onOpenModesGuide,
  onOpenPowerscalingGuide,
  allCharacters = [],
  onImportCharacters,
  oracleCoins = 1000,
  lang = 'es',
  setLang,
  isVip = false,
  onOpenVipModal,
  onOpenAuthModal,
  currentUser = null
}) {
  const fileInputRef = useRef(null);
  const suiteNavRef = useRef(null);

  const scrollSuite = (dir) => {
    if (suiteNavRef.current) {
      suiteNavRef.current.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
    }
  };

  const handleExport = () => {
    let customScenarios = [];
    let combatHistory = [];
    try {
      customScenarios = JSON.parse(localStorage.getItem('apex_custom_scenarios') || '[]');
      combatHistory = JSON.parse(localStorage.getItem('apex_combat_history') || '[]');
    } catch (e) {}

    const backupData = {
      version: '3.0',
      exportDate: new Date().toISOString(),
      characters: allCharacters,
      customScenarios,
      combatHistory,
      aiConfig
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `apex_boveda_completa_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        
        // Handle Full Backup object or simple array of characters
        let importedChars = [];
        let importedScenarios = [];
        let importedHistory = [];

        if (Array.isArray(imported)) {
          importedChars = imported;
        } else if (imported && typeof imported === 'object') {
          if (Array.isArray(imported.characters)) importedChars = imported.characters;
          if (Array.isArray(imported.customScenarios)) importedScenarios = imported.customScenarios;
          if (Array.isArray(imported.combatHistory)) importedHistory = imported.combatHistory;
        }

        if (importedChars.length > 0 && onImportCharacters) {
          onImportCharacters(importedChars);
        }

        if (importedScenarios.length > 0) {
          try {
            const currentScenarios = JSON.parse(localStorage.getItem('apex_custom_scenarios') || '[]');
            const merged = [...importedScenarios, ...currentScenarios.filter(c => !importedScenarios.some(i => i.id === c.id))];
            localStorage.setItem('apex_custom_scenarios', JSON.stringify(merged));
          } catch (e) {}
        }

        if (importedHistory.length > 0) {
          try {
            const currentHist = JSON.parse(localStorage.getItem('apex_combat_history') || '[]');
            const mergedHist = [...importedHistory, ...currentHist.filter(c => !importedHistory.some(i => i.id === c.id))];
            localStorage.setItem('apex_combat_history', JSON.stringify(mergedHist));
          } catch (e) {}
        }

        alert(`¡Bóveda importada con éxito!\n• ${importedChars.length} Fichas de Personajes\n• ${importedScenarios.length} Arenas Personalizadas\n• ${importedHistory.length} Combates Guardados`);
        window.location.reload();
      } catch (err) {
        alert('Error al leer el archivo JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const modes = [
    { id: 'MODO VS', label: getTranslation(lang, 'vsMode'), icon: Swords, color: 'text-red-400 border-red-500/50 bg-red-950/30' },
    { id: 'MODO WHAT-IF', label: getTranslation(lang, 'whatIfMode'), icon: GitBranch, color: 'text-purple-400 border-purple-500/50 bg-purple-950/30' },
    { id: 'MODO HÍBRIDO', label: getTranslation(lang, 'hybridMode'), icon: Sparkles, color: 'text-amber-400 border-amber-500/50 bg-amber-950/30' }
  ];

  const getProviderBadge = (cfg) => {
    const isGuest = (!cfg?.apiKey && cfg?.engine === 'openrouter') || (!cfg?.apiKey && !cfg?.customBaseUrl && cfg?.engine !== 'ollama' && cfg?.engine !== 'opencode');
    if (isGuest) {
      return { name: '🟢 Modo Invitado (Gratis)', color: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]' };
    }
    switch (cfg?.engine) {
      case 'opencode': return { name: 'OpenCode Go / Zen', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]' };
      case 'totalgpt': return { name: 'TotalGPT / Infermatic', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' };
      case 'openrouter': return { name: 'OpenRouter Pro', color: 'text-purple-400 border-purple-500/40 bg-purple-950/40' };
      case 'gemini': return { name: 'Gemini Oficial', color: 'text-blue-400 border-blue-500/40 bg-blue-950/40' };
      case 'perplexity': return { name: 'Perplexity AI', color: 'text-teal-400 border-teal-500/40 bg-teal-950/40' };
      case 'deepseek': return { name: 'DeepSeek Oficial', color: 'text-sky-400 border-sky-500/40 bg-sky-950/40' };
      case 'groq': return { name: 'Groq Ultra-Speed', color: 'text-orange-400 border-orange-500/40 bg-orange-950/40' };
      case 'openai': return { name: 'OpenAI GPT-4o', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' };
      case 'custom': return { name: 'Custom API', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' };
      case 'ollama':
      default: return { name: 'Ollama (Local)', color: 'text-slate-400 border-slate-700 bg-slate-900' };
    }
  };

  const badge = getProviderBadge(aiConfig);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080b12]/95 backdrop-blur-xl px-3 sm:px-4 lg:px-8 py-2 sm:py-3 shadow-lg">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />

      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* Top Row: Brand + Quick Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 shadow-lg shadow-red-950/50 border border-red-400/40 shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-cinzel text-base sm:text-lg font-black tracking-wider text-white">APEX<span className="text-red-500 font-sans">SCALE</span></span>
                <span className="text-[9px] sm:text-[10px] font-mono font-semibold px-1.5 py-0.2 sm:py-0.5 rounded bg-red-900/60 text-red-300 border border-red-700/50">v3.0</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-tight hidden xs:block truncate max-w-[200px] sm:max-w-none">Canonical Feats & Literary What-If Engine</p>
            </div>
          </div>

          {/* Quick Header Actions (AI, Lang, VIP, Vault) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            {/* AI Config Selector Button */}
            <button
              onClick={() => onOpenAiConfig && onOpenAiConfig(null)}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-mono transition cursor-pointer hover:opacity-90 ${badge.color}`}
              title="Configurar Proveedor y API Keys de IA"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="font-bold">{badge.name}</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center gap-0.5 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 font-mono text-[11px]">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang && setLang(l.code)}
                  className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded transition cursor-pointer font-bold flex items-center gap-1 ${
                    lang === l.code
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Cambiar idioma a ${l.name}`}
                >
                  <span>{l.flag}</span>
                </button>
              ))}
            </div>

            {/* VIP Pass */}
            <button
              onClick={onOpenVipModal}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-bold transition cursor-pointer shadow-md ${
                isVip
                  ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border-amber-400 text-amber-300 shadow-amber-950/50 animate-pulse'
                  : 'bg-gradient-to-r from-pink-950/40 via-slate-900 to-amber-950/40 border-pink-500/50 text-pink-300 hover:text-pink-200 hover:border-pink-400'
              }`}
              title="Membresía VIP"
            >
              {isVip ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">👑 VIP PASS</span>
                  <span className="sm:hidden">👑</span>
                </>
              ) : (
                <>
                  <Coffee className="w-3.5 h-3.5 text-pink-400" />
                  <span className="hidden sm:inline">☕ VIP</span>
                  <span className="sm:hidden">☕</span>
                </>
              )}
            </button>

            {/* Cloud Sync & User Profile Button */}
            <button
              onClick={onOpenAuthModal}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-mono font-bold transition cursor-pointer shadow-md ${
                currentUser
                  ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 hover:bg-cyan-900/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-gradient-to-r from-blue-950/60 via-slate-900 to-cyan-950/60 border-cyan-500/50 text-cyan-200 hover:border-cyan-400 hover:text-white'
              }`}
              title={currentUser ? `Conectado como ${currentUser.displayName || currentUser.email} (Sincronizado)` : "Iniciar Sesión o Crear Perfil en la Nube"}
            >
              {currentUser ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center text-[10px] overflow-hidden shrink-0">
                    <img 
                      src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.displayName || currentUser.email}`} 
                      alt="" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="truncate max-w-[90px] sm:max-w-[120px]">{currentUser.displayName || currentUser.username || currentUser.email?.split('@')[0]}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </>
              ) : (
                <>
                  <span className="text-xs">☁️</span>
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Perfil</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Second Row: Mode Selector + All Suite Tools with Carousel Arrows */}
        <div className="relative flex items-center gap-1.5 w-full pt-1 pb-1">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scrollSuite('left')}
            className="p-1 sm:p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition shadow shrink-0 z-10 cursor-pointer"
            title="Desplazar menú a la izquierda"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Horizontal Scrollable Ribbon */}
          <div
            ref={suiteNavRef}
            className="flex items-center gap-2.5 overflow-x-auto scrollbar-thin scrollbar-thumb-amber-500/30 hover:scrollbar-thumb-amber-500/60 scrollbar-track-slate-950/60 scroll-smooth flex-1 py-1 px-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* Modes Pills */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner shrink-0 gap-0.5">
              {modes.map((m) => {
                const Icon = m.icon;
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                      active ? `${m.color} shadow-sm border` : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="whitespace-nowrap">{m.label}</span>
                  </button>
                );
              })}
              <button
                onClick={onOpenModesGuide}
                className="p-1 px-1.5 sm:px-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 transition cursor-pointer text-xs font-bold flex items-center gap-1 shrink-0"
                title={lang === 'en' ? 'Learn the differences between VS, What-If, and Hybrid modes' : lang === 'ja' ? '各モードの解説と違いを見る' : 'Conoce la diferencia entre el Modo VS, What-If e Híbrido'}
              >
                <span className="text-amber-400 text-sm">ℹ️</span>
                <span className="hidden md:inline text-[10px] text-amber-300/80">Guía Modos</span>
              </button>
            </div>

            {/* Visual Divider */}
            <div className="w-px h-6 bg-slate-800 shrink-0" />

            {/* Quick Secondary Suite Tools (Scrollable pills) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Direct API Key Guide Button */}
              <button
                onClick={() => onOpenAiConfig && onOpenAiConfig('guide')}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-[10px] sm:text-xs text-cyan-300 font-bold transition cursor-pointer shadow-sm shrink-0"
                title="Guía IAs Gratis"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span className="whitespace-nowrap">Guía IAs</span>
              </button>

              {/* Powerscaling Guide Button */}
              <button
                onClick={onOpenPowerscalingGuide}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-[10px] sm:text-xs text-red-300 font-bold transition cursor-pointer shadow-sm shrink-0"
                title="Guía Powerscaling Tiering"
              >
                <Trophy className="w-3 h-3 text-amber-400" />
                <span className="whitespace-nowrap">Tiering</span>
              </button>

              {/* Comparar */}
              <button
                onClick={onOpenComparator}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-[10px] sm:text-xs text-cyan-300 font-bold transition cursor-pointer shadow-sm shrink-0"
                title="Comparador Directo de Estadísticas"
              >
                <Scale className="w-3 h-3 text-cyan-400" />
                <span className="whitespace-nowrap">Comparar</span>
              </button>

              {/* Comunidad */}
              <button
                onClick={onOpenCommunityVault}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[10px] sm:text-xs text-emerald-300 font-bold transition cursor-pointer shadow-sm shrink-0"
                title="Galería Comunitaria de Fichas"
              >
                <Globe className="w-3 h-3 text-emerald-400" />
                <span className="whitespace-nowrap">Comunidad</span>
              </button>

              {/* Limpiar Caché / Purga Rápida */}
              <button
                onClick={() => {
                  if (window.confirm('¿Purgar caché y reiniciar la aplicación con la última versión oficial limpia?')) {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/50 text-[10px] sm:text-xs text-rose-300 font-bold transition cursor-pointer shadow-sm shrink-0"
                title="Purgar Caché Local y Forzar Recarga Limpia (Especial para Parsec o navegadores sin Ctrl+F5)"
              >
                <span>🧹</span>
                <span className="whitespace-nowrap font-bold">Limpiar Caché</span>
              </button>

              {/* Roster */}
              <button
                onClick={onOpenRosterManager}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-[10px] sm:text-xs text-indigo-300 font-bold transition cursor-pointer shadow-sm shrink-0"
                title="Organizar Roster"
              >
                <span className="text-xs">🔀</span>
                <span className="whitespace-nowrap font-bold">Roster ({allCharacters?.length || 770})</span>
              </button>

              {/* Azar */}
              <button
                onClick={onOpenRandomMatchmaker}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/50 border border-amber-500/50 text-[10px] sm:text-xs text-amber-300 font-bold transition cursor-pointer shadow-sm shrink-0"
                title="Matchmaking al Azar"
              >
                <span className="text-xs">🎲</span>
                <span className="whitespace-nowrap">{lang === 'en' ? 'Random' : lang === 'ja' ? 'ランダム' : 'Azar'}</span>
              </button>

              {/* Torneo */}
              <button
                onClick={onOpenTournament}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] sm:text-xs text-amber-300 font-bold transition cursor-pointer shadow-sm shrink-0"
                title="Cuadro Eliminatorio de Torneo"
              >
                <Trophy className="w-3 h-3 text-amber-400" />
                <span className="whitespace-nowrap">Torneo</span>
              </button>

              {/* Tier List Maker */}
              <button
                onClick={onOpenTierList}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-gradient-to-r from-yellow-600/30 to-amber-600/30 hover:from-yellow-600/50 border border-yellow-500/50 text-[10px] sm:text-xs text-yellow-300 font-bold transition cursor-pointer shadow-sm shrink-0"
                title="Creador Interactivo de Tier Lists"
              >
                <span className="text-xs">📊</span>
                <span className="whitespace-nowrap">Tier List</span>
              </button>

              {/* Batch AI Importer */}
              <button
                onClick={onOpenBatchAiImporter}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-[10px] sm:text-xs text-purple-200 font-bold transition cursor-pointer shadow-sm shrink-0"
                title="Importador Inteligente con IA"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="whitespace-nowrap">IA Importer</span>
              </button>

              {/* Crear Ficha */}
              <button
                onClick={onOpenNewCharacter}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-red-600/30 hover:bg-red-600/40 border border-red-500/50 text-[10px] sm:text-xs text-red-200 font-bold transition cursor-pointer shadow-sm shrink-0"
              >
                <PlusCircle className="w-3 h-3 text-red-400" />
                <span className="whitespace-nowrap">Crear</span>
              </button>

              {/* Export / Import Vault */}
              <div className="flex items-center gap-0.5 bg-slate-900/80 border border-slate-800 rounded-lg p-0.5 shrink-0">
                <button
                  onClick={handleExport}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded text-xs transition cursor-pointer"
                  title="Guardar / Exportar JSON"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded text-xs transition cursor-pointer"
                  title="Cargar / Importar JSON"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scrollSuite('right')}
            className="p-1 sm:p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition shadow shrink-0 z-10 cursor-pointer"
            title="Desplazar menú a la derecha"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
