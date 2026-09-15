import React, { useState, useEffect, useRef } from 'react';

import { getCharacterImageWithFallback } from '../lib/characterImages';
import { 
  X, Download, Sparkles, RefreshCw, Plus, Trash2, MoveUp, MoveDown, 
  Share2, Image, Layers, Search, Filter, Check, Crown, Flame, Swords
} from 'lucide-react';
import { FRANCHISE_GROUPS } from '../services/franchiseHelper';

const DEFAULT_TIERS = [
  { id: 'tier-s-plus', label: 'S+ (Omni / Hax Absoluto)', color: 'from-rose-600 to-red-600', textColor: 'text-rose-400', items: [] },
  { id: 'tier-s', label: 'S (Cósmico / Multiversal)', color: 'from-orange-500 to-amber-500', textColor: 'text-orange-400', items: [] },
  { id: 'tier-a', label: 'A (Galáctico / Planetario+)', color: 'from-amber-400 to-yellow-500', textColor: 'text-yellow-400', items: [] },
  { id: 'tier-b', label: 'B (Continental / País)', color: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-400', items: [] },
  { id: 'tier-c', label: 'C (Ciudad / Pueblo)', color: 'from-cyan-500 to-blue-500', textColor: 'text-cyan-400', items: [] },
  { id: 'tier-d', label: 'D (Callejero / Humano)', color: 'from-purple-500 to-indigo-500', textColor: 'text-purple-400', items: [] }
];

const STORAGE_KEY_TIERLIST = 'apex_tierlist_v1';

export default function TierListModal({ isOpen, onClose, characters = [] }) {
  const [tiers, setTiers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TIERLIST);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(t => ({
            ...t,
            items: Array.isArray(t?.items) ? t.items.filter(Boolean).filter(c => c && (c.id || c.name)) : []
          }));
        }
      }
    } catch (e) {}
    return DEFAULT_TIERS;
  });

  // Persistencia automática de la tier list (antes se perdía al cerrar)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_TIERLIST, JSON.stringify(tiers)); } catch (e) {}
  }, [tiers]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [activeSelectedChar, setActiveSelectedChar] = useState(null);

  if (!isOpen) return null;

  // Filter available characters that aren't yet placed in any tier
  const placedIds = new Set(
    (tiers || []).flatMap(t => (t?.items || []).filter(Boolean).map(c => c?.id)).filter(Boolean)
  );
  const availableCharacters = (characters || []).filter(Boolean).filter(c => {
    if (c?.id && placedIds.has(c.id)) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = (c?.name || '').toLowerCase().includes(q);
      const matchUni = (c?.universe || '').toLowerCase().includes(q);
      const matchTier = (c?.tier || '').toLowerCase().includes(q);
      if (!matchName && !matchUni && !matchTier) return false;
    }
    if (selectedFranchise !== 'all') {
      const g = FRANCHISE_GROUPS.find(f => f?.id === selectedFranchise);
      if (g && g.keywords?.length > 0) {
        const full = `${c?.name || ''} ${c?.universe || ''} ${c?.saga || ''}`.toLowerCase();
        const matchesKey = g.keywords.some(k => full.includes(k.toLowerCase()));
        if (!matchesKey) return false;
      }
    }
    return true;
  });

  const handleAddToTier = (tierId, char) => {
    if (!char) return;
    setTiers(prev => (prev || []).map(t => {
      if (t?.id === tierId) {
        return { ...t, items: [...(t.items || []).filter(Boolean), char] };
      }
      return t;
    }));
    setActiveSelectedChar(null);
  };

  const handleRemoveFromTier = (tierId, charId) => {
    setTiers(prev => (prev || []).map(t => {
      if (t?.id === tierId) {
        return { ...t, items: (t.items || []).filter(Boolean).filter(c => (c?.id || c?.name) !== charId) };
      }
      return t;
    }));
  };

  const handleClearAll = () => {
    if (window.confirm('¿Vaciar toda la Tier List?')) {
      setTiers(prev => prev.map(t => ({ ...t, items: [] })));
    }
  };

  const handleAutoPopulateByTier = () => {
    const newTiers = tiers.map(t => ({ ...t, items: [] }));
    characters.forEach(c => {
      const tStr = (c.tier || '').toLowerCase();
      if (tStr.includes('1-a') || tStr.includes('omni') || tStr.includes('2-a') || tStr.includes('1-b')) {
        newTiers[0].items.push(c);
      } else if (tStr.includes('2-c') || tStr.includes('2-b') || tStr.includes('3-a') || tStr.includes('3-b')) {
        newTiers[1].items.push(c);
      } else if (tStr.includes('3-c') || tStr.includes('4-a') || tStr.includes('4-b') || tStr.includes('5-a')) {
        newTiers[2].items.push(c);
      } else if (tStr.includes('6-') || tStr.includes('7-a') || tStr.includes('7-b')) {
        newTiers[3].items.push(c);
      } else if (tStr.includes('8-') || tStr.includes('7-c')) {
        newTiers[4].items.push(c);
      } else {
        newTiers[5].items.push(c);
      }
    });
    setTiers(newTiers);
  };

  const handleDownloadPNG = async () => {
    setIsExporting(true);
    try {
      const width = 1200;
      const rowHeight = 140;
      const headerHeight = 120;
      const totalHeight = headerHeight + (tiers.length * rowHeight) + 60;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');

      // Background Dark Theme
      ctx.fillStyle = '#05070d';
      ctx.fillRect(0, 0, width, totalHeight);

      // Header Banner
      const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
      headerGrad.addColorStop(0, '#0f172a');
      headerGrad.addColorStop(0.5, '#1e1b4b');
      headerGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = headerGrad;
      ctx.fillRect(0, 0, width, headerHeight);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, width, headerHeight);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px serif';
      ctx.textAlign = 'center';
      ctx.fillText('APEX POWERSCALING — OFFICIAL MULTIVERSE TIER LIST', width / 2, 55);

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Generado con APEX Engine · ${characters.length}+ Luchadores · https://apex-engine-six.vercel.app`, width / 2, 90);

      // Render Rows
      let currentY = headerHeight + 20;

      for (let i = 0; i < tiers.length; i++) {
        const tier = tiers[i];
        
        // Tier Label Box
        const colors = [
          ['#dc2626', '#991b1b'],
          ['#ea580c', '#c2410c'],
          ['#eab308', '#ca8a04'],
          ['#10b981', '#047857'],
          ['#06b6d4', '#0e7490'],
          ['#8b5cf6', '#6d28d9']
        ];
        const [c1, c2] = colors[i % colors.length];

        const rowGrad = ctx.createLinearGradient(30, currentY, 260, currentY);
        rowGrad.addColorStop(0, c1);
        rowGrad.addColorStop(1, c2);
        ctx.fillStyle = rowGrad;
        ctx.fillRect(30, currentY, 230, rowHeight - 15);

        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(30, currentY, 230, rowHeight - 15);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 18px sans-serif';
        ctx.textAlign = 'center';
        
        // Split label if long
        const words = tier.label.split(' ');
        if (words.length > 2) {
          ctx.fillText(words.slice(0, 2).join(' '), 145, currentY + 50);
          ctx.font = 'bold 13px monospace';
          ctx.fillText(words.slice(2).join(' '), 145, currentY + 75);
        } else {
          ctx.fillText(tier.label, 145, currentY + 68);
        }

        // Tier Items Container
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(270, currentY, width - 300, rowHeight - 15);
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(270, currentY, width - 300, rowHeight - 15);

        // Draw character avatars
        let startX = 285;
        const imgSize = rowHeight - 35;
        const safeTierItems = (tier?.items || []).filter(Boolean);

        for (let j = 0; j < Math.min(safeTierItems.length, 12); j++) {
          const c = safeTierItems[j];
          if (!c) continue;
          const avatarUrl = getCharacterImageWithFallback(c);
          
          try {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.src = avatarUrl;
            await new Promise((res) => {
              img.onload = res;
              img.onerror = res;
              setTimeout(res, 300);
            });
            ctx.drawImage(img, startX, currentY + 10, imgSize, imgSize);
          } catch (e) {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(startX, currentY + 10, imgSize, imgSize);
          }

          // Small border & name
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(startX, currentY + 10, imgSize, imgSize);

          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(startX, currentY + imgSize - 6, imgSize, 16);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText((c.name || 'Guerrero').slice(0, 12), startX + (imgSize / 2), currentY + imgSize + 6);

          startX += imgSize + 12;
        }

        if (tier.items.length > 12) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 14px monospace';
          ctx.fillText(`+${tier.items.length - 12} más`, startX + 30, currentY + 68);
        }

        currentY += rowHeight;
      }

      // Export Download
      const link = document.createElement('a');
      link.download = `APEX_Tier_List_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Error exporting tier list:', e);
      alert('Hubo un error al exportar la imagen.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-950 border border-cyan-500/40 rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-[0_0_60px_rgba(6,182,212,0.3)] font-mono text-xs overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 rounded-t-2xl gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-lg shadow-amber-950">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
                CREADOR DE TIER LISTS OFICIAL
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white font-cinzel">
                Tier List Multiversal Interactivo
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoPopulateByTier}
              className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md text-[11px]"
              title="Auto-organizar personajes por su Tier de Powerscaling"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auto-Clasificar</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950 text-[11px] disabled:opacity-50"
            >
              {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Exportar PNG</span>
            </button>

            <button
              onClick={handleClearAll}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800 transition cursor-pointer"
              title="Limpiar Tier List"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TIER ROWS CONTAINER */}
          <div className="space-y-2.5">
            {(tiers || []).map((tier, idx) => {
              const safeItems = (tier?.items || []).filter(Boolean);
              const tierId = tier?.id || `tier-${idx}`;
              return (
              <div 
                key={tierId}
                className="flex flex-col sm:flex-row rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-md"
              >
                {/* Tier Name Pill */}
                <div className={`sm:w-56 p-3 sm:p-4 bg-gradient-to-r ${tier?.color || 'from-slate-700 to-slate-800'} text-white flex items-center justify-between shrink-0 font-bold font-cinzel text-xs sm:text-sm shadow-md`}>
                  <span>{tier?.label || 'Tier'}</span>
                  <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-full font-mono font-normal">
                    {safeItems.length}
                  </span>
                </div>

                {/* Placed Fighters Area */}
                <div className="p-2 sm:p-3 flex-1 flex flex-wrap gap-2 items-center min-h-[64px] bg-slate-950/70">
                  {safeItems.length === 0 ? (
                    <span className="text-slate-600 italic text-[11px] px-2">
                      Haz clic en un personaje abajo para añadirlo a esta fila...
                    </span>
                  ) : (
                    safeItems.map((c, itemIdx) => {
                      const charId = c?.id || c?.name || `item-${itemIdx}`;
                      const charName = c?.name || 'Guerrero';
                      return (
                      <div 
                        key={charId}
                        onClick={() => handleRemoveFromTier(tierId, charId)}
                        className="group relative w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 hover:border-red-500 overflow-hidden cursor-pointer transition transform hover:scale-105 shrink-0"
                        title={`${charName} (${c?.tier || 'Tier'}) - Clic para quitar`}
                      >
                        <img 
                          src={getCharacterImageWithFallback(c || { name: charName })} 
                          alt="" 
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-red-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-300 font-bold transition">
                          <X className="w-4 h-4" />
                        </div>
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-white truncate text-center px-0.5">
                          {charName.split(' ')[0]}
                        </span>
                      </div>
                    );})
                  )}

                  {/* Add Active Selected Char Button */}
                  {activeSelectedChar && (
                    <button
                      type="button"
                      onClick={() => handleAddToTier(tierId, activeSelectedChar)}
                      className="px-3 py-2 rounded-lg bg-cyan-950 border border-cyan-500/60 hover:bg-cyan-900 text-cyan-300 font-bold text-[10px] flex items-center gap-1 animate-pulse cursor-pointer shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir aquí</span>
                    </button>
                  )}
                </div>
              </div>
            );})}

          </div>

          {/* AVAILABLE CHARACTERS PICKER TRAY */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-200 text-xs">
                  Banco de Luchadores ({availableCharacters.length} disponibles de {characters.length})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar luchador, tier o universo..."
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs focus:border-cyan-400 outline-none w-full sm:w-56"
                />

                <select
                  value={selectedFranchise}
                  onChange={(e) => setSelectedFranchise(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-300 text-xs outline-none"
                >
                  <option value="all">Todas las Franquicias</option>
                  {FRANCHISE_GROUPS.filter(g => g.id !== 'other').map(g => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Character Cards Mini Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-56 overflow-y-auto p-1">
              {availableCharacters.filter(Boolean).slice(0, 64).map((c, cIdx) => {
                const charId = c?.id || c?.name || `avail-${cIdx}`;
                const charName = c?.name || 'Guerrero';
                const isSelected = activeSelectedChar && (activeSelectedChar.id === charId || activeSelectedChar.name === charName);
                return (
                  <div
                    key={charId}
                    onClick={() => setActiveSelectedChar(isSelected ? null : c)}
                    className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition transform hover:scale-105 text-center ${
                      isSelected 
                        ? 'bg-cyan-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400' 
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                      <img 
                        src={getCharacterImageWithFallback(c || { name: charName })} 
                        alt="" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[9.5px] font-bold text-white truncate w-full">
                      {charName}
                    </span>
                    <span className="text-[8px] text-cyan-400 truncate w-full">
                      {c?.tier?.split('|')[0] || c?.tier || 'Tier'}
                    </span>
                  </div>
                );
              })}
            </div>

            {activeSelectedChar && (
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between text-[11px] text-cyan-300">
                <span>🎯 Seleccionado: <strong>{activeSelectedChar.name}</strong> ({activeSelectedChar.tier}). Haz clic en <em>"Colocar aquí"</em> en la fila deseada arriba.</span>
                <button
                  type="button"
                  onClick={() => setActiveSelectedChar(null)}
                  className="text-slate-400 hover:text-white underline font-bold ml-2 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500 text-[11px]">
            💡 Arrastra, coloca y clasifica a tus guerreros favoritos y exporta la imagen en PNG en alta resolución.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-slate-800 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
