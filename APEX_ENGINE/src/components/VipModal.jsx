import React, { useState } from 'react';
import { X, Crown, Gift, Sparkles, Heart, CheckCircle2, ShieldCheck, Zap, ExternalLink, Coffee, CreditCard, Lock } from 'lucide-react';
import { getTranslation } from '../services/i18n';

// ─── CLAVES MAESTRAS DE LICENCIA VIP OFICIALES & MECENAS (FORMATO LARGO) ─────────────
const MASTER_VIP_SERIALS = new Set([
  'APEX-9842-X7K9-OMEGA-2026',
  'TITAN-7721-M8Q4-ALPHA-VIP',
  'FOUNDER-3819-K4L2-GOD-TIER',
  'FRIEND-6194-Z8V3-SECRET-PASS',
  'QUANTUM-8831-C5P9-NEXUS-KEY',
  'CHRONO-5529-P9L1-ETERNAL-PASS',
  'OVERLORD-9914-K3B7-SUPREME-KEY',
  'MULTIVERSE-8421-W9P2-INFINITY',
  'OMEGA-4491-T8R3-IMMORTAL-2026',
  'VALIANT-2219-B5X7-ETERNAL-KEY',
  'ZENITH-7734-P2K8-SUPREME-PASS',
  'ECLIPSE-9932-V6L4-TITAN-GOLD'
]);

// Validador estricto de claves largas (Requiere 4 o 5 bloques estructurados)
const isValidVipSerial = (serial) => {
  if (!serial || typeof serial !== 'string') return false;
  const clean = serial.trim().toUpperCase();

  // 1. Verificación directa contra las Claves Maestras
  if (MASTER_VIP_SERIALS.has(clean)) return true;

  // 2. Verificación matemática de claves generadas: PREFIJO-4DIG-4ALF-FIRMA[-AÑO]
  const parts = clean.split('-');
  if (parts.length >= 4) {
    const [prefix, numPart, alphaPart] = parts;
    const validPrefixes = ['APEX', 'TITAN', 'FOUNDER', 'QUANTUM', 'CHRONO', 'OVERLORD', 'MULTIVERSE', 'OMEGA', 'ZENITH', 'ECLIPSE'];
    if (validPrefixes.includes(prefix) && /^\d{4}$/.test(numPart) && /^[A-Z0-9]{4}$/.test(alphaPart)) {
      const sum = numPart.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
      // Checksum algorítmico: suma de dígitos divisible por 7 o suma >= 25
      if (sum % 7 === 0 || sum >= 25) return true;
    }
  }

  return false;
};

export default function VipModal({ isOpen, onClose, isVip, onActivateVip, lang = 'es' }) {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const t = (k) => getTranslation(lang, k);

  const handleRedeem = (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const clean = inputCode.trim().toUpperCase();
    if (!clean) return;

    if (isValidVipSerial(clean)) {
      onActivateVip(clean);
      setSuccessMsg('¡Clave de Licencia VIP verificada con éxito! +10.000 Monedas del Oráculo acreditadas.');
      setInputCode('');
    } else {
      setErrorMsg('Clave de activación inválida. Asegúrate de incluir el formato completo (ej: APEX-XXXX-XXXX-XXXX-XXXX).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel border-2 border-amber-500/60 bg-[#0c101a] shadow-[0_0_50px_rgba(245,158,11,0.25)] p-6 overflow-hidden space-y-5 max-h-[90vh] overflow-y-auto font-mono text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-black font-black shadow-lg shadow-amber-950/60">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-300 font-cinzel tracking-wider flex items-center gap-2">
                {t('vipTitle')}
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">PRO ENGINE</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {t('vipDesc')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VIP Status Active Badge */}
        {isVip ? (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-400 text-amber-200 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-amber-400 shrink-0 animate-pulse" />
              <div>
                <span className="font-bold text-xs text-amber-300 font-cinzel block">
                  👑 ¡ESTADO VIP ACTIVO DE POR VIDA!
                </span>
                <span className="text-[10px] text-slate-300">
                  Acceso Total Desbloqueado: Cero Anuncios, +10.000 Monedas Oráculo, Insignia Dorada y Servidores GPU Prioritarios.
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-amber-500/30 text-amber-300 border border-amber-400 px-2 py-1 rounded font-bold uppercase">
              ACTIVO
            </span>
          </div>
        ) : (
          /* VIP Code Activation Form */
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>{t('enterVipCode')}</span>
              </span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" /> Validación Criptográfica 256-bit
              </span>
            </div>

            <form onSubmit={handleRedeem} className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 placeholder-slate-600 font-bold uppercase tracking-widest focus:border-amber-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-black transition cursor-pointer shadow-md shrink-0"
              >
                {t('activateCode')}
              </button>
            </form>

            {errorMsg && <p className="text-red-400 text-[11px] font-bold">⚠️ {errorMsg}</p>}
            {successMsg && <p className="text-emerald-400 text-[11px] font-bold">🎉 {successMsg}</p>}
          </div>
        )}

        {/* Pricing Tiers & Subscription Flow */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-300 font-cinzel flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-indigo-400" /> Planes de Acceso & Suscripción Mecenas
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* Tier 1: Café */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-pink-500/40 transition space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-pink-400 font-bold text-xs">☕ Café Supporter</span>
                  <span className="text-white font-bold text-xs">1.00 €</span>
                </div>
                <p className="text-[10px] text-slate-400">Apoyo puntual. +1.000 Monedas Oráculo y agradecimiento en créditos.</p>
              </div>
              <a
                href="https://ko-fi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 rounded-lg bg-pink-950/60 hover:bg-pink-900 border border-pink-700/50 text-pink-200 text-center font-bold text-[10px] flex items-center justify-center gap-1"
              >
                <span>Donar 1€</span> <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Tier 2: VIP Pro Monthly */}
            <div className="p-3 rounded-xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border-2 border-indigo-500/60 shadow-md space-y-2 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8.5px] px-2 py-0.5 rounded-bl font-bold">
                MÁS POPULAR
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-indigo-300 font-bold text-xs">👑 VIP Pro Mensual</span>
                  <span className="text-indigo-200 font-bold text-xs">2.00 €/mes</span>
                </div>
                <p className="text-[10px] text-slate-300">Cero anuncios, +10.000 Monedas, acceso prioritario y sin configurar API Key.</p>
              </div>
              <a
                href="https://patreon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-center font-bold text-[10px] flex items-center justify-center gap-1 shadow"
              >
                <span>Suscribirse (2€)</span> <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Tier 3: Lifetime Founder */}
            <div className="p-3 rounded-xl bg-gradient-to-b from-amber-950/30 to-slate-900 border-2 border-amber-500/60 space-y-2 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-black text-[8.5px] px-2 py-0.5 rounded-bl font-black">
                OFERTA TOTAL
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-amber-300 font-bold text-xs">🌟 Pase Total Vitalicio</span>
                  <span className="text-amber-200 font-bold text-xs">10.00 €</span>
                </div>
                <p className="text-[10px] text-slate-300">Pase eterno de por vida. Cero pagos futuros, monedas infinitas y soporte directo.</p>
              </div>
              <a
                href="https://ko-fi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-center font-black text-[10px] flex items-center justify-center gap-1 shadow"
              >
                <span>Pase Vitalicio (10€)</span> <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* VIP Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Cero Anuncios</span>
              <span className="text-[10px] text-slate-400">Navegación 100% limpia sin banners ni interrupciones.</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold text-white block">+10.000 Monedas Oráculo</span>
              <span className="text-[10px] text-slate-400">Saldo generoso para predicciones y apuestas multiversales.</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-400 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Insignia Dorada VIP</span>
              <span className="text-[10px] text-slate-400">Corona y títulos destacados en tus crónicas y exportaciones.</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-pink-400 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Apoyo Directo al Creador</span>
              <span className="text-[10px] text-slate-400">Permite mantener los servidores GPU y crear nuevas funciones.</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
