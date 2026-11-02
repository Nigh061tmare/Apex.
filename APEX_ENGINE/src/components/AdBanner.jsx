import React, { useEffect, useState } from 'react';
import { Crown, Sparkles, ExternalLink, Gift, Coffee, Flame, Shield } from 'lucide-react';
import { getTranslation } from '../services/i18n';

/**
 * AdBanner - Sistema de Publicidad y Monetización Activa APEX
 * 1. Google AdSense / Auto-Ads activo
 * 2. Unidades de Afiliación de Alto Rendimiento (Amazon / Ko-fi / Manga)
 * 3. 100% libre de anuncios para usuarios VIP
 */
const ADSENSE_CONFIG = {
  enabled: true, // Publicidad y monetización ACTIVA
  client: 'ca-pub-9928172648192019', // ID de editor Google AdSense oficial
  slotFooter: '9842104921',
  slotSidebar: '3819204812'
};

export default function AdBanner({ isVip = false, slot = 'footer', onOpenVip, lang = 'es' }) {
  const [adLoaded, setAdLoaded] = useState(false);

  // Si el usuario es VIP, no se renderiza NINGÚN anuncio
  if (isVip) return null;

  useEffect(() => {
    if (ADSENSE_CONFIG.enabled && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (e) {
        // Fallback visual silencioso
      }
    }
  }, []);

  const t = (k) => getTranslation(lang, k);

  if (slot === 'footer') {
    return (
      <div className="w-full max-w-5xl mx-auto my-6 p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950 border border-slate-800 shadow-2xl font-mono text-xs space-y-2.5 relative overflow-hidden">
        <div className="flex items-center justify-between px-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5 font-bold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'SPONSORED ADVERTISEMENT' : lang === 'ja' ? 'スポンサー広告' : 'PUBLICIDAD PATROCINADA'}</span>
          </span>
          {onOpenVip && (
            <button
              onClick={onOpenVip}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold transition cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Remove Ads with VIP' : lang === 'ja' ? 'VIPで広告非表示' : 'Quitar Anuncios con VIP'}</span>
            </button>
          )}
        </div>

        {/* AdSense Unit */}
        <div className="w-full overflow-hidden flex justify-center min-h-[90px] rounded-xl bg-slate-900/60 border border-dashed border-slate-700/60 p-2 items-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', textAlign: 'center', width: '100%', minHeight: '90px' }}
            data-ad-layout="in-article"
            data-ad-format="fluid"
            data-ad-client={ADSENSE_CONFIG.client}
            data-ad-slot={ADSENSE_CONFIG.slotFooter}
          />
          
          {/* Active Dual Sponsor Fallback */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-left p-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white text-xs block">
                  {lang === 'en' ? '🛍️ Official Anime Figures, Statues & Mangas' : lang === 'ja' ? '🛍️ 公式フィギュア・マンガ・グッズ' : '🛍️ Figuras Coleccionables & Mangas Oficiales'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {lang === 'en' ? 'Support APEX Scale servers with fast Amazon shipping & prime deals.' : lang === 'ja' ? 'Amazon公式リンク経由での購入でAPEXエンジンの開発を支援できます。' : 'Apoya el mantenimiento del motor adquiriendo figuras y tomos con envío rápido.'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://www.amazon.es/s?k=dragon+ball+sh+figuarts+figuras&tag=apexengine-21"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition shadow"
              >
                <span>{lang === 'en' ? 'Shop Deals' : lang === 'ja' ? '商品を見る' : 'Ver Ofertas'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {onOpenVip && (
                <button
                  onClick={onOpenVip}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition cursor-pointer border border-amber-500/30"
                >
                  Pase VIP
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar / Inline Slot
  return (
    <div className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] space-y-2">
      <div className="flex items-center justify-between text-[9px] text-slate-500">
        <span>{lang === 'en' ? 'SPONSOR' : lang === 'ja' ? 'スポンサー' : 'PATROCINADOR'}</span>
        {onOpenVip && (
          <button onClick={onOpenVip} className="text-amber-400 hover:underline">
            VIP 0 Ads
          </button>
        )}
      </div>
      <a
        href="https://ko-fi.com"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 rounded-lg bg-pink-950/40 hover:bg-pink-950/60 border border-pink-500/40 flex items-center justify-between text-pink-200 transition group"
      >
        <span className="flex items-center gap-1.5 text-xs font-bold">
          <Coffee className="w-3.5 h-3.5 text-pink-400" />
          <span>{lang === 'en' ? 'Support on Ko-fi' : lang === 'ja' ? 'Ko-fiで支援する' : 'Invítanos a un Café'}</span>
        </span>
        <ExternalLink className="w-3 h-3 text-pink-400 group-hover:translate-x-0.5 transition-transform" />
      </a>
    </div>
  );
}
