import React, { useEffect, useState } from 'react';
import { X, Folder, FileText, RefreshCw, CheckCircle, AlertCircle, Download, Upload, Sparkles, CheckCheck } from 'lucide-react';
import { SoundFX } from '../services/soundFx';

export default function VaultBrowserModal({ isOpen, onClose, allCharacters = [], onImportCharacters }) {
  // Hooks siempre antes del return condicional (regla de React)
  const [vaultFiles, setVaultFiles] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncMessage, setSyncMessage] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchStatusAndFiles();
  }, []);

  const fetchStatusAndFiles = async () => {
    setLoading(true);
    try {
      const statusRes = await fetch('/api/vault/status');
      const statusData = await statusRes.json();
      setStatus(statusData);

      const filesRes = await fetch('/api/vault/files');
      const filesData = await filesRes.json();
      setVaultFiles(filesData.files || []);
    } catch (e) {
      setStatus({ connected: false, error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCharactersToVault = async () => {
    if (!allCharacters || allCharacters.length === 0) {
      return alert('No hay personajes cargados en la memoria para exportar.');
    }

    setIsExporting(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/vault/export-characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characters: allCharacters,
          folder: '06 - Proyectos/Obsidian + IA/Fichas APEX'
        })
      });
      const data = await res.json();
      if (data.success) {
        SoundFX.playBetWin?.();
        setSyncMessage({ type: 'success', text: `¡${data.exportedCount} fichas exportadas a Markdown en Obsidian!` });
        fetchStatusAndFiles();
      } else {
        throw new Error(data.error || 'Error al exportar.');
      }
    } catch (err) {
      setSyncMessage({ type: 'error', text: 'Error al exportar: ' + err.message });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCharactersFromVault = async () => {
    setIsImporting(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/vault/import-characters');
      const data = await res.json();
      if (data.success && data.characters?.length > 0) {
        if (onImportCharacters) {
          onImportCharacters(data.characters);
        }
        SoundFX.playBetWin?.();
        setSyncMessage({ type: 'success', text: `¡${data.count} fichas leídas e integradas a la Matriz de APEX!` });
      } else {
        setSyncMessage({ type: 'info', text: 'No se encontraron notas de fichas en formato compatible en la bóveda.' });
      }
    } catch (err) {
      setSyncMessage({ type: 'error', text: 'Error al importar: ' + err.message });
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel border border-slate-700 shadow-2xl p-6 font-mono text-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white font-cinzel">Bóveda de Obsidian (Sincronización Local)</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connection Status */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status?.connected ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
            <span className="text-slate-300">{status?.message || (status?.connected ? 'Conectado a Obsidian Vault' : 'No conectado')}</span>
          </div>
          <button onClick={fetchStatusAndFiles} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Sync Actions Bar */}
        <div className="mt-4 p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
          <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
            ⚡ Acciones Rápidas de Sincronización:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportCharactersToVault}
              disabled={isExporting || !status?.connected}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition disabled:opacity-50 cursor-pointer shadow-md shadow-purple-950"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exportando notas...' : '📤 Exportar APEX → Obsidian (.md)'}</span>
            </button>
            <button
              onClick={handleImportCharactersFromVault}
              disabled={isImporting || !status?.connected}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-950"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isImporting ? 'Escaneando...' : '📥 Importar Obsidian → APEX'}</span>
            </button>
          </div>
          {syncMessage && (
            <div className={`p-2 rounded-lg text-[11px] font-medium text-center ${syncMessage.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' : syncMessage.type === 'error' ? 'bg-red-950/80 border border-red-500/40 text-red-300' : 'bg-slate-900 border border-slate-700 text-slate-300'}`}>
              {syncMessage.text}
            </div>
          )}
        </div>

        {/* File Browser List */}
        <div className="mt-4 space-y-2 max-h-56 overflow-y-auto">
          <div className="text-slate-400 text-[11px] uppercase tracking-wider mb-1">Notas Markdown detectadas en la bóveda:</div>
          {vaultFiles.length === 0 ? (
            <div className="p-4 text-center text-slate-500 bg-slate-950/40 rounded-lg">
              {loading ? 'Cargando notas...' : 'No se encontraron notas en esta carpeta.'}
            </div>
          ) : (
            vaultFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800/60 transition">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-slate-200 truncate">{file.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0 ml-2">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
