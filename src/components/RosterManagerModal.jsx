import React, { useState } from 'react';
import { 
  X, Move, ArrowUp, ArrowDown, ArrowUpDown, Pin, Sparkles, 
  FolderPlus, Grid, List, Check, Trash2, Edit3, Shield, Zap, Search, RefreshCw
} from 'lucide-react';
import { SoundFX } from '../services/soundFx';
import { resolveCombatState } from '../lib/combatStateResolver';

export default function RosterManagerModal({ 
  isOpen, 
  onClose, 
  characters, 
  onUpdateRoster,
  onResetMasterRoster,
  onEditCharacter,
  onInspectCharacter
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniverse, setSelectedUniverse] = useState('ALL');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [viewMode, setViewMode] = useState('categories'); // 'categories' | 'flat'
  const [pinnedIds, setPinnedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_pinned_characters');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  // Toggle Pin status
  const togglePin = (id) => {
    const next = pinnedIds.includes(id) 
      ? pinnedIds.filter(pId => pId !== id) 
      : [id, ...pinnedIds];
    setPinnedIds(next);
    try {
      localStorage.setItem('apex_pinned_characters', JSON.stringify(next));
    } catch {}
  };

  // Move character up or down in the array
  const moveCharacter = (currentIndex, direction) => {
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= characters.length) return;

    const newRoster = [...characters];
    const [moved] = newRoster.splice(currentIndex, 1);
    newRoster.splice(targetIndex, 0, moved);
    onUpdateRoster(newRoster);
  };

  // Move character directly to top / bottom
  const moveToExtreme = (currentIndex, toTop = true) => {
    const newRoster = [...characters];
    const [moved] = newRoster.splice(currentIndex, 1);
    if (toTop) {
      newRoster.unshift(moved);
    } else {
      newRoster.push(moved);
    }
    onUpdateRoster(newRoster);
  };

  // Preset Auto-Sorters
  const sortByTier = (descending = true) => {
    const tierWeight = (t = '') => {
      const lower = t.toLowerCase();
      if (lower.includes('tier 0') || lower.includes('tier 1-a') || lower.includes('inconmensurable') || lower.includes('omni')) return 100;
      if (lower.includes('tier 1-b') || lower.includes('tier 1-c') || lower.includes('hiperversal')) return 90;
      if (lower.includes('tier 2-a') || lower.includes('tier 2-b') || lower.includes('tier 2-c') || lower.includes('multiversal')) return 80;
      if (lower.includes('tier 3-a') || lower.includes('tier 3-b') || lower.includes('universal')) return 70;
      if (lower.includes('tier 4-a') || lower.includes('tier 4-b') || lower.includes('solar')) return 60;
      if (lower.includes('tier 5-a') || lower.includes('tier 5-b') || lower.includes('planet')) return 50;
      if (lower.includes('tier 6-a') || lower.includes('tier 6-b') || lower.includes('country') || lower.includes('continental')) return 40;
      if (lower.includes('tier 7-a') || lower.includes('tier 7-b') || lower.includes('city')) return 30;
      if (lower.includes('tier 8') || lower.includes('tier 9')) return 20;
      return 10;
    };

    const sorted = [...characters].sort((a, b) => {
      const wa = tierWeight(a.tier);
      const wb = tierWeight(b.tier);
      return descending ? wb - wa : wa - wb;
    });
    onUpdateRoster(sorted);
  };

  const sortByPowerLevel = (descending = true) => {
    SoundFX.playScouterBeep(5);
    const sorted = [...characters].sort((a, b) => {
      const va = resolveCombatState(a, 'base').powerKey || 0;
      const vb = resolveCombatState(b, 'base').powerKey || 0;
      return descending ? vb - va : va - vb;
    });
    onUpdateRoster(sorted);
  };

  const sortAlphabetically = (ascending = true) => {
    const sorted = [...characters].sort((a, b) => {
      return ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
    onUpdateRoster(sorted);
  };

  const sortByUniverse = () => {
    const sorted = [...characters].sort((a, b) => {
      return (a.universe || '').localeCompare(b.universe || '');
    });
    onUpdateRoster(sorted);
  };

  // Drag & Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newRoster = [...characters];
    const [draggedItem] = newRoster.splice(draggedIndex, 1);
    newRoster.splice(targetIndex, 0, draggedItem);
    onUpdateRoster(newRoster);
    setDraggedIndex(null);
  };

  // Filtered characters
  const filteredCharacters = characters.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.universe || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.tier || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUniverse = selectedUniverse === 'ALL' || c.universe === selectedUniverse;
    return matchesSearch && matchesUniverse;
  });

  // Grouped characters by universe
  const groupedByUniverse = {};
  characters.forEach((c, originalIdx) => {
    const uni = c.universe || 'Otros / Custom';
    if (!groupedByUniverse[uni]) groupedByUniverse[uni] = [];
    groupedByUniverse[uni].push({ ...c, originalIdx });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-2xl glass-panel border-2 border-cyan-500/60 bg-[#0c101a] shadow-[0_0_50px_rgba(6,182,212,0.25)] p-6 overflow-hidden flex flex-col max-h-[92vh] font-mono text-xs space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-black font-black shadow-lg shadow-cyan-950/60">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-cyan-300 font-cinzel tracking-wider flex items-center gap-2">
                <span>Organizador Físico de Plantilla & Roster ({characters.length} Luchadores)</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Arrastra, mueve, fija y organiza físicamente el orden de tus personajes y categorías.
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sorting Toolbar & Search */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nombre, tier o universo..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-cyan-500 outline-none"
            />
          </div>

          {/* Quick Auto-Sorters */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold mr-1">⚡ Ordenar:</span>
            
            <button
              onClick={() => sortByTier(true)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950/80 border border-slate-700 hover:border-cyan-500 text-slate-200 hover:text-cyan-300 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
              title="Ordenar de mayor a menor según escala VS Battles (Tier)"
            >
              👑 Por Tier
            </button>

            <button
              onClick={() => sortByPowerLevel(true)}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/60 text-indigo-300 text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
              title="Ordenar según Nivel de Poder / APEX-Ki"
            >
              ⚡ Por Nivel de Poder (APEX-Ki ↓)
            </button>

            <button
              onClick={() => sortByUniverse()}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-950/80 border border-slate-700 hover:border-purple-500 text-slate-200 hover:text-purple-300 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
              title="Agrupar físicamente por franquicia"
            >
              🌌 Por Franquicia
            </button>

            <button
              onClick={() => sortAlphabetically(true)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950/80 border border-slate-700 hover:border-emerald-500 text-slate-200 hover:text-emerald-300 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
              title="Ordenar alfabéticamente A-Z"
            >
              🔤 A-Z
            </button>

            {onResetMasterRoster && (
              <button
                onClick={() => {
                  if (onResetMasterRoster) {
                    const total = onResetMasterRoster();
                    alert(`¡Roster Maestro Actualizado! Base de datos recargada con ${total || 819} personajes.`);
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-300 text-[10px] font-bold transition cursor-pointer flex items-center gap-1 shadow"
                title="Forzar actualización completa con los 819 personajes maestros oficiales"
              >
                <RefreshCw className="w-3 h-3 text-amber-400" />
                <span>🔄 Sincronizar Base Oficial (819)</span>
              </button>
            )}

            {/* View Mode Switcher */}
            <div className="flex items-center ml-2 border border-slate-700 rounded-lg p-0.5 bg-slate-950">
              <button
                onClick={() => setViewMode('categories')}
                className={`p-1 rounded text-xs font-bold transition cursor-pointer ${
                  viewMode === 'categories' ? 'bg-cyan-600 text-black' : 'text-slate-400 hover:text-white'
                }`}
                title="Vista por Secciones y Universos"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`p-1 rounded text-xs font-bold transition cursor-pointer ${
                  viewMode === 'flat' ? 'bg-cyan-600 text-black' : 'text-slate-400 hover:text-white'
                }`}
                title="Vista de Lista Ordenable"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Characters Grid / Reorder List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
          
          {viewMode === 'flat' ? (
            /* FLAT ORDERABLE LIST */
            <div className="space-y-1.5">
              {filteredCharacters.map((char, index) => {
                const isPinned = pinnedIds.includes(char.id);
                return (
                  <div
                    key={char.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      draggedIndex === index
                        ? 'opacity-40 border-cyan-400 bg-cyan-950/20'
                        : isPinned
                        ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {/* Drag Handle & Position Index */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="cursor-grab active:cursor-grabbing p-1 text-slate-500 hover:text-cyan-400">
                        <Move className="w-4 h-4" />
                      </div>
                      <span className="w-6 text-center font-bold text-slate-500 text-[10px]">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Avatar & Character Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {char.avatar ? (
                        <img 
                          src={char.avatar} 
                          alt={char.name} 
                          className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0" 
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 font-bold shrink-0">
                          {char.name.charAt(0)}
                        </div>
                      )}

                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs truncate">{char.name}</span>
                          {isPinned && <span className="text-amber-400 text-[10px]">📌 Fijado</span>}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                          <span className="text-cyan-400 font-bold">{char.universe || 'Universo Canon'}</span>
                          <span>•</span>
                          <span className="text-amber-300 font-bold">{char.tier || 'Tier 7-B'}</span>
                          <span>•</span>
                          <span className="text-indigo-400 font-bold">⚡ {resolveCombatState(char, 'base').apexKiDisplay}</span>
                        </div>
                      </div>
                    </div>

                    {/* Movement Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Pin */}
                      <button
                        onClick={() => togglePin(char.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          isPinned
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                        title={isPinned ? 'Desfijar' : 'Fijar al inicio'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Up */}
                      <button
                        onClick={() => moveCharacter(index, -1)}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                        title="Subir una posición"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => moveCharacter(index, 1)}
                        disabled={index === characters.length - 1}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                        title="Bajar una posición"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Move to Top */}
                      <button
                        onClick={() => moveToExtreme(index, true)}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500 text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer text-[9px] font-bold"
                        title="Mover arriba del todo"
                      >
                        🔝
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEditCharacter?.(char)}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500 text-purple-300 transition cursor-pointer"
                        title="Editar Ficha"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* CATEGORIZED SECTIONS VIEW */
            <div className="space-y-6">
              {Object.entries(groupedByUniverse).map(([universeName, charList]) => {
                const matchingChars = charList.filter(c => 
                  c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  (c.tier || '').toLowerCase().includes(searchTerm.toLowerCase())
                );

                if (matchingChars.length === 0) return null;

                return (
                  <div key={universeName} className="space-y-2.5 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                    {/* Section Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <h3 className="font-bold text-cyan-300 text-xs font-cinzel tracking-wider uppercase">
                          {universeName} ({matchingChars.length} Luchadores)
                        </h3>
                      </div>
                    </div>

                    {/* Characters Cards Grid in Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {matchingChars.map((char) => {
                        const originalIndex = char.originalIdx;
                        const isPinned = pinnedIds.includes(char.id);

                        return (
                          <div
                            key={char.id}
                            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 flex items-center justify-between gap-2.5 transition group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {char.avatar ? (
                                <img 
                                  src={char.avatar} 
                                  alt={char.name} 
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-800 shrink-0" 
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 font-bold shrink-0 text-xs">
                                  {char.name.charAt(0)}
                                </div>
                              )}

                              <div className="truncate">
                                <span className="font-bold text-white text-[11px] block truncate">
                                  {char.name}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="text-amber-300 font-bold">
                                    {char.tier || 'Tier 7-B'}
                                  </span>
                                  <span className="text-slate-500">•</span>
                                  <span className="text-indigo-400 font-bold">
                                    ⚡ {resolveCombatState(char, 'base').apexKiDisplay}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Section Move Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => moveCharacter(originalIndex, -1)}
                                disabled={originalIndex === 0}
                                className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 text-[10px] disabled:opacity-30 cursor-pointer"
                                title="Subir"
                              >
                                ⬆️
                              </button>

                              <button
                                onClick={() => moveCharacter(originalIndex, 1)}
                                disabled={originalIndex === characters.length - 1}
                                className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 text-[10px] disabled:opacity-30 cursor-pointer"
                                title="Bajar"
                              >
                                ⬇️
                              </button>

                              <button
                                onClick={() => onEditCharacter?.(char)}
                                className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-purple-500 text-purple-300 cursor-pointer"
                                title="Editar"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            💡 El nuevo orden se guarda automáticamente en tu navegador y en la Bóveda Obsidian.
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-black text-xs transition cursor-pointer shadow-lg shadow-cyan-950/60"
          >
            Guardar & Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
