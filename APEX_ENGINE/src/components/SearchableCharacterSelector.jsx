import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Filter, X, Sparkles, Check, ChevronDown, Brain } from 'lucide-react';
import { getFranchiseCategoriesList } from '../services/franchiseHelper';
import { searchCharactersByConcept } from '../services/semanticSearch';

export default function SearchableCharacterSelector({
  characters = [],
  value,
  onChange,
  label,
  color = 'cyan',
  className = '',
  buttonClassName = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState('all');
  const [isSemanticMode, setIsSemanticMode] = useState(false);
  const dropdownRef = useRef(null);

  const charList = Array.isArray(characters) ? characters : [];
  const franchiseList = useMemo(() => getFranchiseCategoriesList(charList), [charList]);

  const filteredCharacters = useMemo(() => {
    let pool = charList;
    if (selectedFranchise !== 'all') {
      const g = franchiseList.find(gr => gr.id === selectedFranchise);
      if (g && Array.isArray(g.characters)) pool = g.characters;
    }
    if (!search.trim()) return pool;

    if (isSemanticMode) {
      return searchCharactersByConcept(pool, search);
    }

    const q = search.toLowerCase();
    return pool.filter(c => 
      c?.name?.toLowerCase().includes(q) ||
      (c?.alias || '').toLowerCase().includes(q) ||
      (c?.universe || '').toLowerCase().includes(q) ||
      (c?.saga || '').toLowerCase().includes(q) ||
      (c?.tier || '').toLowerCase().includes(q)
    );
  }, [charList, franchiseList, selectedFranchise, search, isSemanticMode]);

  const selectedChar = charList.find(c => c?.id === value);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label className={`text-[10px] font-bold text-${color}-400 mb-1 block font-mono`}>{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 rounded-xl px-2.5 py-1.5 text-left flex items-center justify-between text-white font-bold text-xs transition cursor-pointer shadow-sm ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {(selectedChar?.avatar || selectedChar?.image) ? (
            <img 
              src={selectedChar.avatar || selectedChar.image} 
              alt="" 
              onError={(e) => { e.target.style.display = 'none'; }}
              className="w-5 h-5 rounded-full object-cover border border-slate-700 shrink-0 bg-slate-800" 
            />
          ) : (
            <span className={`w-2 h-2 rounded-full bg-${color === 'red' ? 'red' : color === 'blue' ? 'blue' : 'amber'}-500 shrink-0`} />
          )}
          <span className="truncate">{selectedChar?.name || 'Seleccionar Luchador...'}</span>
          <span className="text-[10px] text-slate-400 font-normal truncate hidden sm:inline">
            ({selectedChar?.saga || selectedChar?.universe})
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-950/95 border border-slate-700/90 rounded-2xl p-3 shadow-2xl space-y-2 backdrop-blur-2xl max-h-[420px] flex flex-col font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Search */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5 font-cinzel">
              <Search className="w-3.5 h-3.5" /> Explorador de Luchadores ({charList.length})
            </span>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Box & Semantic Toggle */}
          <div className="space-y-1.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder={isSemanticMode ? "Busca conceptos: 'regeneración', 'time stop', 'hakai'..." : "Buscar por nombre, saga, tier o técnica..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full bg-slate-900 border rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition ${
                  isSemanticMode ? 'border-purple-500/80 focus:border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)]' : 'border-slate-700/90 focus:border-cyan-400'
                }`}
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between text-[10px] px-1">
              <button
                type="button"
                onClick={() => setIsSemanticMode(!isSemanticMode)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                  isSemanticMode 
                    ? 'bg-purple-900/80 text-purple-200 border border-purple-500/50 shadow-sm' 
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <Brain className="w-3 h-3" />
                {isSemanticMode ? '🧠 Búsqueda Semántica / Hax Activa' : '⚡ Cambiar a Búsqueda por Conceptos / Hax'}
              </button>
              {search.trim() && isSemanticMode && (
                <span className="text-purple-400 text-[9px] font-mono">Similitud Vectorial</span>
              )}
            </div>
          </div>

          {/* Franchise Filter Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1.5 custom-scrollbar text-[9.5px]">
            <button
              type="button"
              onClick={() => setSelectedFranchise('all')}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition ${
                selectedFranchise === 'all' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              🌐 Todos ({charList.length})
            </button>
            {franchiseList.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedFranchise(g.id)}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition ${
                  selectedFranchise === g.id ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {g.label.split('(')[0]} ({g.characters.length})
              </button>
            ))}
          </div>

          {/* Character List */}
          <div className="overflow-y-auto space-y-1 flex-1 pr-1 custom-scrollbar max-h-[240px]">
            {filteredCharacters.map(c => {
              const isSelected = c.id === value;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onChange(c);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition cursor-pointer ${
                    isSelected ? 'bg-cyan-950/80 border border-cyan-500/80 text-cyan-200 shadow-md' : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {(c.avatar || c.image) ? (
                      <img 
                        src={c.avatar || c.image} 
                        alt="" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                        className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-700 bg-slate-800" 
                      />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" />
                    )}
                    <div className="truncate">
                      <span className="font-bold block truncate text-white">{c.name}</span>
                      <span className="text-[9px] text-slate-400 truncate block">
                        {c.saga ? `${c.saga} · ` : ''}{c.universe}
                      </span>
                      {c._matchHighlights && c._matchHighlights.length > 0 && (
                        <div className="flex gap-1 mt-0.5 truncate">
                          {c._matchHighlights.slice(0, 2).map((m, mi) => (
                            <span key={mi} className="text-[8px] bg-purple-950/80 border border-purple-800/60 text-purple-300 px-1 rounded truncate">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300">
                      {c.tier?.split('|')[0] || c.tier}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </button>
              );
            })}
            {filteredCharacters.length === 0 && (
              <p className="text-[10px] text-slate-500 text-center py-6">No se encontraron luchadores que coincidan con la búsqueda.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
