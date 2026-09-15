import React, { useRef, useState } from 'react';

import { getCharacterImageWithFallback } from '../lib/characterImages';
import { Download, X, Sparkles, Shield, Zap, Crosshair, Trophy, Flame, Image, Layers, Sparkle, RefreshCw, Printer, AlertTriangle } from 'lucide-react';
import { SoundFX } from '../services/soundFx';

export default function CardExporterModal({ isOpen, onClose, character }) {
  const [foilStyle, setFoilStyle] = useState('gold'); // 'gold' | 'god_blue' | 'hakaishin' | 'kaioken' | 'silver' | 'green' | 'amethyst' | 'rainbow' | 'cyber'
  const [resolutionMode, setResolutionMode] = useState('ultra'); // 'hd' | 'ultra'
  const [includeBattleDamage, setIncludeBattleDamage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !character) return null;

  const handleDownloadImage = async (mode = 'png') => {
    setIsExporting(true);
    SoundFX?.playAuraBurst?.();

    try {
      const scale = resolutionMode === 'ultra' ? 2 : 1;
      const width = 640 * scale;
      const height = 960 * scale;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);

      const baseW = 640;
      const baseH = 960;

      // 1. Cosmic Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, baseW, baseH);
      bgGrad.addColorStop(0, '#060810');
      bgGrad.addColorStop(0.5, '#120d24');
      bgGrad.addColorStop(1, '#05070c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, baseW, baseH);

      // 2. Cosmic Grid Pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < baseW; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, baseH); ctx.stroke();
      }
      for (let y = 0; y < baseH; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(baseW, y); ctx.stroke();
      }

      // 3. Foil & Aura Border Selection
      const borderGrad = ctx.createLinearGradient(0, 0, baseW, baseH);
      if (foilStyle === 'gold') {
        borderGrad.addColorStop(0, '#fef08a');
        borderGrad.addColorStop(0.3, '#eab308');
        borderGrad.addColorStop(0.7, '#ca8a04');
        borderGrad.addColorStop(1, '#fef08a');
      } else if (foilStyle === 'god_blue') {
        borderGrad.addColorStop(0, '#bae6fd');
        borderGrad.addColorStop(0.3, '#38bdf8');
        borderGrad.addColorStop(0.7, '#0284c7');
        borderGrad.addColorStop(1, '#38bdf8');
      } else if (foilStyle === 'hakaishin') {
        borderGrad.addColorStop(0, '#f5d0fe');
        borderGrad.addColorStop(0.3, '#c026d3');
        borderGrad.addColorStop(0.7, '#7e22ce');
        borderGrad.addColorStop(1, '#d946ef');
      } else if (foilStyle === 'kaioken') {
        borderGrad.addColorStop(0, '#fecaca');
        borderGrad.addColorStop(0.3, '#ef4444');
        borderGrad.addColorStop(0.7, '#991b1b');
        borderGrad.addColorStop(1, '#dc2626');
      } else if (foilStyle === 'silver') {
        borderGrad.addColorStop(0, '#ffffff');
        borderGrad.addColorStop(0.3, '#e2e8f0');
        borderGrad.addColorStop(0.7, '#94a3b8');
        borderGrad.addColorStop(1, '#f8fafc');
      } else if (foilStyle === 'green') {
        borderGrad.addColorStop(0, '#bbf7d0');
        borderGrad.addColorStop(0.3, '#22c55e');
        borderGrad.addColorStop(0.7, '#15803d');
        borderGrad.addColorStop(1, '#4ade80');
      } else if (foilStyle === 'amethyst') {
        borderGrad.addColorStop(0, '#f472b6');
        borderGrad.addColorStop(0.4, '#c084fc');
        borderGrad.addColorStop(0.8, '#818cf8');
        borderGrad.addColorStop(1, '#38bdf8');
      } else if (foilStyle === 'rainbow') {
        borderGrad.addColorStop(0, '#ef4444');
        borderGrad.addColorStop(0.2, '#f97316');
        borderGrad.addColorStop(0.4, '#eab308');
        borderGrad.addColorStop(0.6, '#10b981');
        borderGrad.addColorStop(0.8, '#06b6d4');
        borderGrad.addColorStop(1, '#a855f7');
      } else {
        borderGrad.addColorStop(0, '#06b6d4');
        borderGrad.addColorStop(0.5, '#3b82f6');
        borderGrad.addColorStop(1, '#06b6d4');
      }

      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 14;
      ctx.strokeRect(18, 18, baseW - 36, baseH - 36);

      // Inner Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, baseW - 60, baseH - 60);

      // 4. Universe Banner
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(45, 45, baseW - 90, 34);
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(45, 45, baseW - 90, 34);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText((character.universe || 'APEX MULTIVERSE').toUpperCase(), baseW / 2, 67);

      // 5. Character Avatar Box
      const avatarBoxY = 90;
      const avatarBoxH = 260;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(45, avatarBoxY, baseW - 90, avatarBoxH);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(45, avatarBoxY, baseW - 90, avatarBoxH);

      // Dynamic Radial Ki Aura behind avatar
      const auraGrad = ctx.createRadialGradient(baseW / 2, avatarBoxY + 120, 20, baseW / 2, avatarBoxY + 120, 130);
      if (foilStyle === 'gold') {
        auraGrad.addColorStop(0, 'rgba(250, 204, 21, 0.55)');
        auraGrad.addColorStop(0.7, 'rgba(234, 179, 8, 0.2)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (foilStyle === 'god_blue') {
        auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
        auraGrad.addColorStop(0.7, 'rgba(2, 132, 199, 0.2)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (foilStyle === 'hakaishin') {
        auraGrad.addColorStop(0, 'rgba(217, 70, 239, 0.6)');
        auraGrad.addColorStop(0.7, 'rgba(126, 34, 206, 0.25)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (foilStyle === 'kaioken') {
        auraGrad.addColorStop(0, 'rgba(239, 68, 68, 0.65)');
        auraGrad.addColorStop(0.7, 'rgba(185, 28, 28, 0.25)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (foilStyle === 'silver') {
        auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
        auraGrad.addColorStop(0.7, 'rgba(148, 163, 184, 0.25)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (foilStyle === 'green') {
        auraGrad.addColorStop(0, 'rgba(34, 197, 94, 0.6)');
        auraGrad.addColorStop(0.7, 'rgba(21, 128, 61, 0.2)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (foilStyle === 'amethyst') {
        auraGrad.addColorStop(0, 'rgba(192, 132, 252, 0.5)');
        auraGrad.addColorStop(0.7, 'rgba(129, 140, 248, 0.2)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (foilStyle === 'rainbow') {
        auraGrad.addColorStop(0, 'rgba(244, 63, 94, 0.5)');
        auraGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.3)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        auraGrad.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
        auraGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.2)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(baseW / 2, avatarBoxY + 120, 130, 0, Math.PI * 2);
      ctx.fill();

      // Draw Avatar Image
      const avatarUrl = getCharacterImageWithFallback(character);
      try {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = avatarUrl;
        await new Promise((res) => {
          img.onload = res;
          img.onerror = res;
          setTimeout(res, 400);
        });
        ctx.drawImage(img, (baseW / 2) - 120, avatarBoxY + 10, 240, 240);
      } catch (e) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect((baseW / 2) - 120, avatarBoxY + 10, 240, 240);
      }

      // Battle Damage Overlay on Avatar if active
      if (includeBattleDamage) {
        ctx.save();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
        ctx.lineWidth = 2.5;
        // Diagonal scratches
        ctx.beginPath(); ctx.moveTo(baseW / 2 - 60, avatarBoxY + 60); ctx.lineTo(baseW / 2 - 20, avatarBoxY + 110); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(baseW / 2 - 50, avatarBoxY + 65); ctx.lineTo(baseW / 2 - 10, avatarBoxY + 115); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(baseW / 2 + 30, avatarBoxY + 140); ctx.lineTo(baseW / 2 + 75, avatarBoxY + 185); ctx.stroke();
        
        // Battle damage badge
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(55, avatarBoxY + 10, 110, 22);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9.5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('💥 BATTLE DAMAGE', 110, avatarBoxY + 25);
        ctx.restore();
      }

      // Official APEX Verification Stamp
      ctx.save();
      ctx.translate(baseW - 95, avatarBoxY + 30);
      ctx.rotate(-0.15);
      ctx.strokeStyle = foilStyle === 'gold' ? '#eab308' : '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-45, -12, 90, 24);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(-45, -12, 90, 24);
      ctx.fillStyle = foilStyle === 'gold' ? '#fef08a' : '#7dd3fc';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★ APEX VERIFIED ★', 0, 4);
      ctx.restore();

      // 6. Character Name
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px serif';
      ctx.textAlign = 'center';
      ctx.fillText(character.name, baseW / 2, 385);

      // 7. Tier Ribbon
      const tierGrad = ctx.createLinearGradient(60, 405, baseW - 60, 405);
      tierGrad.addColorStop(0, '#7c3aed');
      tierGrad.addColorStop(1, '#db2777');
      ctx.fillStyle = tierGrad;
      ctx.fillRect(60, 400, baseW - 120, 34);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(character.tier || 'Tier 2-C | Multiversal', baseW / 2, 423);

      // 8. Stats Breakdown Grid
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.fillRect(45, 450, baseW - 90, 260);
      ctx.strokeRect(45, 450, baseW - 90, 260);

      const statsList = [
        { label: '💥 ATTACK POTENCY:', val: character.ap || 'Nivel Universal' },
        { label: '⚡ VELOCIDAD:', val: character.speed?.combat || 'MFTL+' },
        { label: '🛡️ DURABILIDAD:', val: character.durability || 'Alta' },
        { label: '🧠 BATTLE IQ:', val: character.battleIQ || 'Genio Táctico' },
        { label: '🎯 RANGO:', val: character.range || 'Universal' }
      ];

      ctx.textAlign = 'left';
      statsList.forEach((st, idx) => {
        const yPos = 485 + idx * 48;
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(st.label, 65, yPos);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '12px sans-serif';
        const truncated = (st.val.length > 55 ? st.val.slice(0, 52) + '...' : st.val);
        ctx.fillText(truncated, 65, yPos + 18);
      });

      // 9. Special Abilities / Super Attacks
      ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      ctx.fillRect(45, 725, baseW - 90, 155);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(45, 725, baseW - 90, 155);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('⚡ TÉCNICAS & ARSENAL DESTACADO:', 65, 750);

      const superAttacks = character.arsenal?.superAttacks || [];
      const ultimate = character.arsenal?.ultimateAttacks?.[0];
      let techY = 775;

      if (ultimate) {
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`★ ULTIMATE: ${ultimate.name}`, 65, techY);
        techY += 24;
      }

      superAttacks.slice(0, 2).forEach((atk) => {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '11.5px sans-serif';
        ctx.fillText(`• ${atk.name}: ${(atk.desc || '').slice(0, 60)}...`, 65, techY);
        techY += 22;
      });

      // 10. Footer Tag & Security Hash
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`APEX POWERSCALING CARD GAME · ${resolutionMode === 'ultra' ? 'ULTRA HD 300 DPI' : 'HD 72 DPI'} · V26`, baseW / 2, 915);

      if (mode === 'pdf_print') {
        const printWindow = window.open('', '_blank');
        const imgUrl = canvas.toDataURL('image/png');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>APEX Dossier — ${character.name}</title>
                <style>
                  body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #000; font-family: sans-serif; }
                  img { max-width: 100%; height: auto; box-shadow: 0 0 40px rgba(0,0,0,0.8); border-radius: 16px; }
                  @media print { body { background: none; } img { width: 100%; max-width: 700px; } }
                </style>
              </head>
              <body>
                <img src="${imgUrl}" onload="window.print();" />
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      } else {
        const link = document.createElement('a');
        link.download = `APEX_Card_${character.name.replace(/[^a-zA-Z0-9]/g, '_')}_${foilStyle}_${resolutionMode}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }

      SoundFX?.playLevelUp?.();
    } catch (e) {
      console.error(e);
      alert('Error al exportar la carta coleccionable.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-950 border border-amber-500/40 rounded-2xl max-w-xl w-full max-h-[94vh] flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.3)] font-mono text-xs overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 rounded-t-2xl gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-md shadow-amber-950">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
                CARTA & DOSSIER COLECCIONABLE HD
              </span>
              <h3 className="text-sm font-bold text-white font-cinzel">
                {character.name}
              </h3>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center space-y-4">
          
          {/* Resolution & Battle Damage Controls */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[10.5px]">Resolución:</span>
              <button
                onClick={() => setResolutionMode('hd')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border transition cursor-pointer ${
                  resolutionMode === 'hd' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                HD (640x960)
              </button>
              <button
                onClick={() => setResolutionMode('ultra')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border transition cursor-pointer ${
                  resolutionMode === 'ultra' ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white border-amber-300 shadow' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                ⭐ Ultra HD (1280x1920)
              </button>
            </div>

            <button
              onClick={() => setIncludeBattleDamage(!includeBattleDamage)}
              className={`px-3 py-1 rounded-lg font-bold text-[10.5px] border transition cursor-pointer flex items-center gap-1.5 ${
                includeBattleDamage ? 'bg-red-600 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <span>💥 Battle Damage</span>
            </button>
          </div>

          {/* Foil Selectors */}
          <div className="w-full space-y-1.5">
            <span className="text-slate-400 text-[10.5px] block font-bold">Aura & Efecto Holográfico:</span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'gold', label: '👑 SSJ Oro', bg: 'bg-amber-600' },
                { id: 'god_blue', label: '🔷 Azul Dios', bg: 'bg-cyan-600' },
                { id: 'hakaishin', label: '🟣 Hakaishin', bg: 'bg-purple-600' },
                { id: 'kaioken', label: '🔴 Kaiō-ken', bg: 'bg-red-600' },
                { id: 'silver', label: '⚪ Ultra Instinto', bg: 'bg-slate-200 text-slate-950' },
                { id: 'green', label: '🟢 Berserker', bg: 'bg-emerald-600' },
                { id: 'amethyst', label: '💎 Amatista', bg: 'bg-indigo-600' },
                { id: 'rainbow', label: '🌈 Arcoíris', bg: 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500' },
                { id: 'cyber', label: '⚡ Cyber Blue', bg: 'bg-sky-600' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFoilStyle(f.id);
                    SoundFX?.playAuraBurst?.();
                  }}
                  className={`px-2 py-1.5 rounded-lg font-bold text-[10px] border transition cursor-pointer truncate ${
                    foilStyle === f.id ? `${f.bg} text-white border-white shadow-md` : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Card Mockup Preview */}
          <div className={`w-64 rounded-2xl p-3 bg-gradient-to-b from-slate-900 to-slate-950 border-4 shadow-2xl transition transform hover:scale-105 duration-300 relative ${
            foilStyle === 'gold' ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.35)]' :
            foilStyle === 'god_blue' ? 'border-cyan-400 shadow-[0_0_30px_rgba(56,189,248,0.35)]' :
            foilStyle === 'hakaishin' ? 'border-purple-400 shadow-[0_0_30px_rgba(192,132,252,0.35)]' :
            foilStyle === 'kaioken' ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' :
            foilStyle === 'silver' ? 'border-slate-200 shadow-[0_0_30px_rgba(255,255,255,0.45)]' :
            foilStyle === 'green' ? 'border-emerald-400 shadow-[0_0_30px_rgba(34,197,94,0.35)]' :
            foilStyle === 'amethyst' ? 'border-indigo-400 shadow-[0_0_30px_rgba(129,140,248,0.35)]' :
            foilStyle === 'rainbow' ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.35)]' :
            'border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.35)]'
          }`}>
            {includeBattleDamage && (
              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[8px] z-10 animate-pulse">
                💥 DAMAGE
              </span>
            )}
            <div className="text-[8.5px] text-center text-cyan-300 font-bold uppercase truncate pb-1">
              {character.universe}
            </div>
            
            <div className="w-full h-36 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative">
              <img src={getCharacterImageWithFallback(character)} alt="" className="w-full h-full object-contain" />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-yellow-300 text-[8px] font-bold">
                {character.tier?.split('|')[0] || character.tier}
              </span>
            </div>

            <div className="pt-2 text-center">
              <h4 className="font-bold text-white text-xs truncate font-cinzel">{character.name}</h4>
              <p className="text-[8.5px] text-slate-400 truncate">{character.alias || character.saga || 'Guerrero Multiversal'}</p>
            </div>

            <div className="mt-2 p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-[8.5px]">
              <div className="flex justify-between text-slate-300">
                <span className="text-amber-400 font-bold">AP:</span>
                <span className="truncate max-w-[120px]">{character.ap?.slice(0, 20)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-cyan-400 font-bold">VEL:</span>
                <span className="truncate max-w-[120px]">{character.speed?.combat || 'MFTL+'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-emerald-400 font-bold">BIQ:</span>
                <span className="truncate max-w-[120px]">{character.battleIQ?.slice(0, 20)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer with dual Export buttons */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs border border-slate-800 transition cursor-pointer">
            Cerrar
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadImage('pdf_print')}
              disabled={isExporting}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Abre el asistente de impresión listo para Guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dossier PDF / Print</span>
            </button>

            <button
              onClick={() => handleDownloadImage('png')}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-950 disabled:opacity-50"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Descargar PNG ({resolutionMode === 'ultra' ? 'Ultra HD' : 'HD'})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
