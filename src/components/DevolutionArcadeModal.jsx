import React, { useRef, useState } from 'react';
import { X, Maximize2, RotateCcw, Gamepad2 } from 'lucide-react';

export default function DevolutionArcadeModal({ isOpen, onClose }) {
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (!document.fullscreenElement) {
        iframeRef.current.requestFullscreen().catch((err) => {
          console.warn('Error fullscreen:', err);
        });
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-slate-950 border border-amber-500/40 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-950/50">
              <Gamepad2 className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-orbitron font-black text-sm sm:text-base text-white tracking-wider">
                  DB DEVOLUTION <span className="text-amber-400">ARCADE</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  APEX SUITE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-sans">
                Dragon Ball Devolution (Edición Definitiva DBS) - Emulador Ruffle WASM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReload}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700/60"
              title="Reiniciar Arcade"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700/60"
              title="Pantalla Completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 hover:text-white transition cursor-pointer border border-rose-500/40"
              title="Cerrar Arcade"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 w-full bg-black relative">
          <iframe
            ref={iframeRef}
            src="/arcade/index.html"
            title="Dragon Ball Devolution Arcade"
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; gamepad"
          />
        </div>

        <div className="px-4 py-1.5 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Emulador WebAssembly Activo
          </span>
          <span className="hidden sm:inline text-slate-500">
            Controles: Flechas o WASD (Moverse) | X o J (Atacar) | C o K (Cargar Ki)
          </span>
        </div>
      </div>
    </div>
  );
}
