import React from 'react';
import { ShoppingBag, ExternalLink, Sparkles, BookOpen, Gift } from 'lucide-react';
import { getTranslation } from '../services/i18n';

// Configuración de Tags de Afiliación Reales (Amazon Associates, AliExpress, Manga Store)
const AFFILIATE_CONFIG = {
  amazonTag: 'apexengine-21', // Tag de afiliado de Amazon España / Global
  aliExpressTrackingId: 'apex_powerscale',
  crunchyrollRef: 'apex_engine'
};

export default function MerchBanner({ charA, charB, isVip = false, lang = 'es' }) {
  if (!charA && !charB) return null;

  const t = (k) => getTranslation(lang, k);
  const nameA = charA?.name || 'Anime Figure';
  const nameB = charB?.name || 'Manga Collectible';
  const univA = charA?.universe || '';
  const univB = charB?.universe || '';

  // Enlaces de búsqueda optimizados con tags de afiliado
  const amazonTagParam = AFFILIATE_CONFIG.amazonTag ? `&tag=${AFFILIATE_CONFIG.amazonTag}` : '';
  
  const amazonSearchA = `https://www.amazon.es/s?k=${encodeURIComponent(nameA + ' figura estatua coleccion' + (univA ? ' ' + univA : ''))}${amazonTagParam}`;
  const amazonSearchB = `https://www.amazon.es/s?k=${encodeURIComponent(nameB + ' figura estatua coleccion' + (univB ? ' ' + univB : ''))}${amazonTagParam}`;
  
  const aliExpressSearchA = `https://es.aliexpress.com/wholesale?SearchText=${encodeURIComponent(nameA + ' anime figure action')}`;
  const mangaSearchA = `https://www.amazon.es/s?k=${encodeURIComponent('manga ' + (univA || nameA))}${amazonTagParam}`;

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900/90 to-purple-950/30 border border-amber-500/30 shadow-lg font-mono text-xs space-y-2.5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-[11px]">
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>{t('merchTitle')}:</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-slate-500 italic hidden sm:inline">
            Enlaces afiliados patrocinados
          </span>
          {isVip && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              👑 VIP PASS
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[10px]">
        {/* Amazon A */}
        <a
          href={amazonSearchA}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-slate-950/80 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/50 text-slate-200 transition flex items-center justify-between group"
        >
          <span className="truncate group-hover:text-amber-300 flex items-center gap-1.5">
            <Gift className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Figuras de <strong>{nameA}</strong></span>
          </span>
          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0 ml-1" />
        </a>

        {/* Amazon B */}
        {charB && (
          <a
            href={amazonSearchB}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 text-slate-200 transition flex items-center justify-between group"
          >
            <span className="truncate group-hover:text-purple-300 flex items-center gap-1.5">
              <Gift className="w-3 h-3 text-purple-400 shrink-0" />
              <span>Figuras de <strong>{nameB}</strong></span>
            </span>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-purple-400 shrink-0 ml-1" />
          </a>
        )}

        {/* Manga Oficial */}
        <a
          href={mangaSearchA}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-slate-950/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-slate-200 transition flex items-center justify-between group col-span-1 sm:col-span-2 md:col-span-1"
        >
          <span className="truncate group-hover:text-cyan-300 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Mangas de <strong>{univA || nameA}</strong></span>
          </span>
          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-1" />
        </a>
      </div>
    </div>
  );
}
