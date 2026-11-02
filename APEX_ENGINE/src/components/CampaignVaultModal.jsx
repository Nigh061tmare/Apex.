import React, { useState, useMemo, useRef } from 'react';
import {
  FolderArchive, Star, Trash2, Play, Plus, Download, Upload,
  Clock, Sparkles, X, Search, CheckCircle2, AlertTriangle,
  Layers, Users, MapPin, Bookmark, BookOpen, Shield, Flame
} from 'lucide-react';
import { SoundFX } from '../services/soundFx';

export default function CampaignVaultModal({
  isOpen,
  onClose,
  campaigns = [],
  activeCampaignId = null,
  onLoadCampaign,
  onDeleteCampaign,
  onToggleFavorite,
  onSaveCurrentCampaign,
  onImportCampaign,
  onClearAllCampaigns,
  onOpenForge
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'FAVORITES' | 'CANON' | 'WHAT_IF'
  const fileInputRef = useRef(null);

  const filteredCampaigns = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return campaigns.filter(c => {
      const matchSearch = !q ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.premise || '').toLowerCase().includes(q) ||
        (c.currentLocation || '').toLowerCase().includes(q) ||
        (c.activeCast || []).some(id => id.toLowerCase().includes(q));

      const matchFilter = filterMode === 'ALL' ||
        (filterMode === 'FAVORITES' && c.isFavorite) ||
        (filterMode === 'CANON' && (c.continuityMode || '').includes('canon')) ||
        (filterMode === 'WHAT_IF' && (c.continuityMode || '').includes('what_if'));

      return matchSearch && matchFilter;
    }).sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }, [campaigns, searchQuery, filterMode]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.title && !parsed.chronicleId && !parsed.campaignId) {
          alert('El archivo no parece ser una campaña válida de APEX Crónicas.');
          return;
        }
        if (onImportCampaign) {
          onImportCampaign(parsed);
          SoundFX?.playLevelUp?.();
        }
      } catch (err) {
        alert('Error al leer el archivo JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCampaign = (c, e) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(c, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `apex_campaign_${c.campaignId || c.chronicleId || 'save'}.json`);
    dl.click();
    SoundFX?.playClick?.();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-950 border border-emerald-500/50 rounded-2xl p-6 max-w-4xl w-full max-h-[92vh] overflow-y-auto space-y-5 shadow-[0_0_50px_rgba(16,185,129,0.25)] font-mono text-xs animate-in fade-in zoom-in-95 duration-200 relative flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide uppercase font-cinzel">
                  Bóveda & Gestor de Campañas
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {campaigns.length} {campaigns.length === 1 ? 'Guardada' : 'Guardadas'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Guarda, reanuda, respalda y gestiona tus sagas vivas y continuidades multiversales.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSaveCurrentCampaign?.();
                SoundFX?.playLevelUp?.();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-950 cursor-pointer"
              title="Guarda el estado actual de la campaña en curso"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>💾 Guardar Campaña Actual</span>
            </button>

            <button
              onClick={() => {
                onOpenForge?.();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>➕ Forjar Nueva</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Importar campaña guardada desde un archivo JSON"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>📤 Importar (.json)</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>

          {campaigns.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('¿Eliminar TODAS las campañas de la bóveda? Esta acción no se puede deshacer.')) {
                  onClearAllCampaigns?.();
                }
              }}
              className="text-red-400/80 hover:text-red-300 text-[10px] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Vaciar Bóveda</span>
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, combatientes o locación..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'FAVORITES', label: '⭐ Favoritas' },
              { id: 'CANON', label: 'Canon-Plus' },
              { id: 'WHAT_IF', label: 'What-If' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  filterMode === f.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[50vh] pr-1">
          {filteredCampaigns.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3 bg-slate-900/30 rounded-2xl border border-slate-800/60">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs">
                {campaigns.length === 0
                  ? 'No hay campañas guardadas en la bóveda todavía.'
                  : 'Ninguna campaña coincide con la búsqueda o filtro activo.'}
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => {
                    onSaveCurrentCampaign?.();
                    SoundFX?.playLevelUp?.();
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md transition"
                >
                  Guardar Campaña Actual
                </button>
              </div>
            </div>
          ) : (
            filteredCampaigns.map((c) => {
              const isActive = (c.campaignId === activeCampaignId) || (c.chronicleId === activeCampaignId);
              const chapterCount = c.chapterNumber || (c.chapterArchive?.length || 1);
              const castList = (c.activeCast || []).slice(0, 5);

              return (
                <div
                  key={c.campaignId || c.chronicleId || Math.random().toString()}
                  className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
                      : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>EN CURSO</span>
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60">
                        🎭 {c.tone || 'Épico'}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Capítulo {chapterCount}
                      </span>

                      <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/60 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[150px]">{c.currentLocation || 'Desconocida'}</span>
                      </span>

                      {c.updatedAt && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{new Date(c.updatedAt).toLocaleDateString()} {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition flex items-center gap-2">
                      <span>{c.title || 'Campaña Sin Título'}</span>
                    </h3>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed max-w-2xl">
                      {c.premise || 'Sin sinopsis registrada.'}
                    </p>

                    {/* Cast preview */}
                    {castList.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-500 font-bold">Elenco:</span>
                        {castList.map((charId, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px] truncate max-w-[130px]"
                          >
                            {charId.replace(/-/g, ' ')}
                          </span>
                        ))}
                        {(c.activeCast || []).length > 5 && (
                          <span className="text-[10px] text-slate-500">
                            +{(c.activeCast || []).length - 5} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <button
                      onClick={() => onToggleFavorite?.(c.campaignId || c.chronicleId)}
                      className={`p-2 rounded-lg border transition cursor-pointer ${
                        c.isFavorite
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
                      }`}
                      title={c.isFavorite ? 'Quitar de Favoritas' : 'Marcar como Favorita (Anclar)'}
                    >
                      <Star className={`w-3.5 h-3.5 ${c.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => handleExportCampaign(c, e)}
                      className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-800/60 transition cursor-pointer"
                      title="Exportar archivo JSON de esta campaña"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`¿Deseas eliminar la campaña "${c.title}" de tu bóveda?`)) {
                          onDeleteCampaign?.(c.campaignId || c.chronicleId);
                          SoundFX?.playClick?.();
                        }
                      }}
                      className="p-2 rounded-lg bg-slate-950 hover:bg-red-950/60 text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-900/60 transition cursor-pointer"
                      title="Eliminar campaña"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        onLoadCampaign?.(c);
                        SoundFX?.playStartBattle?.();
                        onClose();
                      }}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer shadow-md ${
                        isActive
                          ? 'bg-emerald-600/80 hover:bg-emerald-500 text-white'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isActive ? 'Continuar' : 'Cargar SAGA'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
          <span>Las campañas se guardan en el almacenamiento seguro de tu navegador de forma persistente.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
