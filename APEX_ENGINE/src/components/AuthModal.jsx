import React, { useState, useEffect } from 'react';

import { getUserAvatar } from '../lib/characterImages';
import { 
  X, User, Lock, Mail, Cloud, RefreshCw, 
  Check, Shield, Sparkles, LogOut, ArrowUp, ArrowDown, Database,
  Smartphone, Laptop, Key, Star, Swords, Coins, Edit3, Save, QrCode, Link2, Copy
} from 'lucide-react';
import { CloudSync } from '../services/cloudSyncService';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  allCharacters = [], 
  onUpdateCharacters, 
  oracleCoins = 1000, 
  onUpdateCoins,
  aiConfig = {}
}) {
  const [currentUser, setCurrentUser] = useState(CloudSync.getCurrentUser());
  const [activeTab, setActiveTab] = useState(currentUser ? 'profile' : 'login'); // 'login' | 'signup' | 'profile' | 'link' | 'config'
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(currentUser?.displayName || '');
  const [editAvatarSeed, setEditAvatarSeed] = useState(currentUser?.displayName || currentUser?.email || '');

  // Quick Link Code (PC <-> Mobile)
  const [linkCodeInput, setLinkCodeInput] = useState('');
  const [generatedLinkCode, setGeneratedLinkCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [lastSync, setLastSync] = useState(CloudSync.getLastSyncTime());

  const getKnownAccounts = () => {
    try {
      const registry = CloudSync.loadAccountsRegistry();
      const unique = [];
      const seen = new Set();
      for (const key of Object.keys(registry || {})) {
        const a = registry[key];
        if (a && a.id && !seen.has(a.id)) {
          seen.add(a.id);
          unique.push(a);
        }
      }
      return unique;
    } catch {
      return [];
    }
  };

  const [storedAccounts, setStoredAccounts] = useState(getKnownAccounts);

  // Sincronizar estado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const user = CloudSync.getCurrentUser();
      setCurrentUser(user);
      setActiveTab(user ? 'profile' : 'login');
      setStatusMsg({ type: '', text: '' });
      setLastSync(CloudSync.getLastSyncTime());
      setStoredAccounts(getKnownAccounts());
      if (user) {
        setEditDisplayName(user.displayName || user.username || '');
        setEditAvatarSeed(user.displayName || user.email || '');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const unsub = CloudSync.subscribe((user) => {
      setCurrentUser(user);
      setStoredAccounts(getKnownAccounts());
      if (user) {
        setEditDisplayName(user.displayName || user.username || '');
        setEditAvatarSeed(user.displayName || user.email || '');
      }
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleDirectAccountLogin = async (acc) => {
    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const user = await CloudSync.login(acc.username || acc.displayName || acc.email, acc.password || '');
      setCurrentUser(user);
      setActiveTab('profile');
      setStatusMsg({ type: 'success', text: `¡Bienvenido de nuevo, ${user.displayName || user.username || user.email}!` });
      CloudSync.downloadProfileData().then(res => {
        if (res && res.success && res.data) {
          if (res.data.characters && Array.isArray(res.data.characters) && res.data.characters.length > 0 && onUpdateCharacters) {
            onUpdateCharacters(res.data.characters);
          }
          if (res.data.oracleCoins !== undefined && onUpdateCoins) {
            onUpdateCoins(res.data.oracleCoins);
          }
          setLastSync(res.data.timestamp || new Date().toISOString());
        }
      }).catch(() => {});
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Error al cargar la cuenta.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setStatusMsg({ type: 'error', text: 'Por favor introduce tu nombre de usuario o correo.' });
      return;
    }
    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const user = await CloudSync.login(identifier.trim(), password);
      setCurrentUser(user);
      setActiveTab('profile');
      setStatusMsg({ type: 'success', text: `¡Bienvenido de nuevo, ${user.displayName || user.username || user.email}!` });

      // Sincronización en segundo plano sin interrumpir ni sobrescribir el mensaje de login
      CloudSync.downloadProfileData().then(res => {
        if (res && res.success && res.data) {
          if (res.data.characters && Array.isArray(res.data.characters) && res.data.characters.length > 0 && onUpdateCharacters) {
            onUpdateCharacters(res.data.characters);
          }
          if (res.data.oracleCoins !== undefined && onUpdateCoins) {
            onUpdateCoins(res.data.oracleCoins);
          }
          if (res.data.combatHistory && Array.isArray(res.data.combatHistory)) {
            try {
              const curHist = JSON.parse(localStorage.getItem('apex_combat_history') || '[]');
              const merged = [...res.data.combatHistory, ...curHist.filter(c => !res.data.combatHistory.some(i => i.id === c.id))];
              localStorage.setItem('apex_combat_history', JSON.stringify(merged));
            } catch {}
          }
          setLastSync(res.data.timestamp || new Date().toISOString());
        }
      }).catch(err => console.warn('Silent download sync:', err));
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Error al iniciar sesión.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setStatusMsg({ type: 'error', text: 'Por favor introduce tu correo o nombre de usuario.' });
      return;
    }
    if (!password || password.length < 6) {
      setStatusMsg({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const user = await CloudSync.signUp(identifier, password, displayName);
      setCurrentUser(user);
      setActiveTab('profile');
      setStatusMsg({ type: 'success', text: `¡Cuenta creada exitosamente! Conectado como ${user.displayName}.` });

      // Subida inicial en segundo plano
      try {
        let combatHistory = [];
        let customScenarios = [];
        try {
          combatHistory = JSON.parse(localStorage.getItem('apex_combat_history') || '[]');
          customScenarios = JSON.parse(localStorage.getItem('apex_custom_scenarios') || '[]');
        } catch {}

        CloudSync.uploadProfileData({
          characters: allCharacters,
          combatHistory,
          oracleCoins,
          customScenarios,
          aiConfig
        }).then(res => {
          if (res && res.timestamp) {
            setLastSync(res.timestamp);
          }
        }).catch(err => console.warn('Silent upload sync:', err));
      } catch {}
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Error al registrar la cuenta.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const newAvatar = getUserAvatar({ displayName: editAvatarSeed || editDisplayName, email: currentUser.email });
      const updated = await CloudSync.updateProfile({
        displayName: editDisplayName.trim(),
        avatar: newAvatar
      });
      setIsEditingProfile(false);
      setStatusMsg({ type: 'success', text: `¡Perfil actualizado! Ahora tu nombre de usuario es "${updated.displayName}".` });
      await handleUploadSync();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Error al actualizar el perfil.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLinkCode = async () => {
    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      let combatHistory = [];
      let customScenarios = [];
      try {
        combatHistory = JSON.parse(localStorage.getItem('apex_combat_history') || '[]');
        customScenarios = JSON.parse(localStorage.getItem('apex_custom_scenarios') || '[]');
      } catch (e) {}

      const localData = {
        characters: allCharacters,
        combatHistory,
        oracleCoins,
        customScenarios,
        aiConfig
      };

      const code = await CloudSync.createQuickLinkCode(localData);
      setGeneratedLinkCode(code);
      setStatusMsg({ type: 'success', text: `🔑 ¡Código de enlace generado: ${code}! Introdúcelo en tu móvil para sincronizarlo al instante.` });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Error al generar código de enlace.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemLinkCode = async (e) => {
    e.preventDefault();
    if (!linkCodeInput.trim()) return;
    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const res = await CloudSync.redeemQuickLinkCode(linkCodeInput.trim());
      
      if (res.data?.characters && Array.isArray(res.data.characters) && onUpdateCharacters) {
        onUpdateCharacters(res.data.characters);
      }
      if (res.data?.oracleCoins !== undefined && onUpdateCoins) {
        onUpdateCoins(res.data.oracleCoins);
      }
      if (res.data?.combatHistory && Array.isArray(res.data.combatHistory)) {
        try {
          const curHist = JSON.parse(localStorage.getItem('apex_combat_history') || '[]');
          const merged = [...res.data.combatHistory, ...curHist.filter(c => !res.data.combatHistory.some(i => i.id === c.id))];
          localStorage.setItem('apex_combat_history', JSON.stringify(merged));
        } catch (e) {}
      }

      setLastSync(res.data?.timestamp || new Date().toISOString());
      setStatusMsg({ 
        type: 'success', 
        text: `📲 ¡Dispositivo vinculado exitosamente! Conectado como ${res.account?.displayName || 'Usuario'} con toda tu bóveda cargada.` 
      });
      setActiveTab('profile');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Código de enlace inválido o expirado.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await CloudSync.logout();
      setCurrentUser(null);
      setActiveTab('login');
      setPassword('');
      setStatusMsg({ type: 'info', text: 'Has cerrado sesión correctamente.' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error al cerrar sesión.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSync = async () => {
    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      let combatHistory = [];
      let customScenarios = [];
      try {
        combatHistory = JSON.parse(localStorage.getItem('apex_combat_history') || '[]');
        customScenarios = JSON.parse(localStorage.getItem('apex_custom_scenarios') || '[]');
      } catch (e) {}

      const localData = {
        characters: allCharacters,
        combatHistory,
        oracleCoins,
        customScenarios,
        aiConfig
      };

      const res = await CloudSync.uploadProfileData(localData);
      setLastSync(res.timestamp);
      setStatusMsg({ 
        type: 'success', 
        text: `☁️ ¡Bóveda subida a la Nube! (${res.stats.charactersCount} personajes, ${res.stats.favoritesCount} favoritos).` 
      });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Error al subir los datos a la nube.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSync = async () => {
    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const res = await CloudSync.downloadProfileData();
      if (res.empty) {
        setStatusMsg({ type: 'info', text: 'No había datos previos en la nube. Tu dispositivo actual es la copia principal.' });
        return;
      }

      const cloudData = res.data;
      if (cloudData.characters && Array.isArray(cloudData.characters) && onUpdateCharacters) {
        onUpdateCharacters(cloudData.characters);
      }

      if (cloudData.oracleCoins !== undefined && onUpdateCoins) {
        onUpdateCoins(cloudData.oracleCoins);
      }

      if (cloudData.combatHistory && Array.isArray(cloudData.combatHistory)) {
        try {
          const currentHist = JSON.parse(localStorage.getItem('apex_combat_history') || '[]');
          const merged = [...cloudData.combatHistory, ...currentHist.filter(c => !cloudData.combatHistory.some(i => i.id === c.id))];
          localStorage.setItem('apex_combat_history', JSON.stringify(merged));
        } catch (e) {}
      }

      setLastSync(cloudData.timestamp || new Date().toISOString());
      setStatusMsg({ 
        type: 'success', 
        text: `📥 ¡Bóveda descargada y sincronizada con éxito! (${cloudData.characters?.length || 0} personajes cargados).` 
      });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Error al descargar datos.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-950 border border-cyan-500/40 rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.25)] font-mono text-xs overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 rounded-t-2xl gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block">
                APEX CLOUD SYNC & MULTI-DEVICE
              </span>
              <h3 className="text-sm font-bold text-white font-cinzel">
                Perfil & Sincronización PC ↔ Móvil
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2 gap-2 text-xs overflow-x-auto">
          {currentUser ? (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-1.5 px-3 py-2 font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'profile' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Mi Perfil</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('link')}
                className={`flex items-center gap-1.5 px-3 py-2 font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'link' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Enlace Rápido Móvil</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex items-center gap-1.5 px-3 py-2 font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'login' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Cambiar Cuenta</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex items-center gap-1.5 px-3 py-2 font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'login' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`flex items-center gap-1.5 px-3 py-2 font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'signup' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Crear Cuenta</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('link')}
                className={`flex items-center gap-1.5 px-3 py-2 font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'link' ? 'border-emerald-400 text-emerald-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Vincular con Código</span>
              </button>
            </>
          )}
        </div>

        {/* Status Message Alert */}
        {statusMsg.text && (
          <div className={`p-3 mx-4 mt-3 rounded-xl border text-xs flex items-center gap-2 ${
            statusMsg.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' :
            statusMsg.type === 'error' ? 'bg-red-950/40 border-red-500/50 text-red-300' :
            'bg-slate-900 border-slate-700 text-slate-300'
          }`}>
            <span>{statusMsg.type === 'success' ? '✅' : statusMsg.type === 'error' ? '⚠️' : 'ℹ️'}</span>
            <p className="flex-1">{statusMsg.text}</p>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {currentUser && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs flex items-center justify-between gap-2">
                  <span>Sesión iniciada como <strong>{currentUser.displayName || currentUser.username || currentUser.email}</strong></span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 text-[11px] font-bold cursor-pointer"
                  >
                    Ver Mi Perfil
                  </button>
                </div>
              )}

              {/* Acceso Rápido: Cuentas Detectadas en este Dispositivo */}
              {storedAccounts.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-cyan-950/40 border border-cyan-500/50 space-y-2.5 shadow-lg shadow-cyan-950/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>Cuentas guardadas en este dispositivo (1 clic para entrar):</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                      Detectada(s): {storedAccounts.length}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {storedAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleDirectAccountLogin(acc)}
                        className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-800 border-2 border-cyan-400/60 text-white text-xs font-bold transition flex items-center gap-2.5 cursor-pointer shadow-md hover:scale-102 hover:border-cyan-300"
                        title={`Haz clic para entrar directamente como ${acc.displayName || acc.username}`}
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-950 border border-cyan-400 shrink-0">
                          <img 
                            src={getUserAvatar(acc)} 
                            alt="" 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                        <div className="text-left">
                          <span className="block font-bold leading-none">{acc.displayName || acc.username}</span>
                          <span className="text-[9.5px] text-cyan-300 font-mono block mt-0.5">{acc.email}</span>
                        </div>
                        <span className="ml-1 text-[11px] text-emerald-400 font-bold">➔ Entrar</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-200 text-[11px] leading-relaxed flex items-start gap-2.5">
                <Smartphone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-cyan-300 font-bold mb-0.5">Sincronización Multi-Dispositivo:</strong>
                  Inicia sesión con tu <strong>Usuario</strong> (ej. <em>nigh061tmare</em>) o tu <strong>Correo</strong> para mantener todos tus personajes y combates conectados.
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nombre de Usuario o Correo:</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="nigh061tmare o tu_email@ejemplo.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pl-9 text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Contraseña:</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="•••••••• (Opcional si es tu usuario local)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pl-9 text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition shadow-lg shadow-cyan-950/60 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Iniciar Sesión & Sincronizar</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-cyan-400 hover:underline font-bold"
                >
                  Crear cuenta nueva
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('link')}
                  className="text-amber-400 hover:underline font-bold"
                >
                  🔑 Vincular con Código Rápido
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SIGNUP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-[11px] leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-300 font-bold mb-0.5">Crear Perfil en la Nube (100% Gratis):</strong>
                  Tu nombre de usuario será el que se muestre en tu ficha, combates y clasificaciones.
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nombre de Usuario / Apodo:</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ej: nigh061tmare"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pl-9 text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Correo Electrónico:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="tu_email@ejemplo.com o apodo"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pl-9 text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Contraseña (Mínimo 6 caracteres):</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pl-9 text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold transition shadow-lg shadow-amber-950/60 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creando Perfil...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Registrar Cuenta & Vincular Bóveda</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-[11px] text-slate-400">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-amber-400 hover:underline font-bold"
                >
                  Inicia sesión aquí
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PROFILE */}
          {activeTab === 'profile' && (
            currentUser ? (
              <div className="space-y-4">
                
                {/* Identity Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/40 shadow-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl p-1 bg-slate-950 border border-cyan-500/40 overflow-hidden shrink-0">
                      <img 
                        src={getUserAvatar(currentUser)} 
                        alt="" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm font-cinzel">{currentUser.displayName || currentUser.username || currentUser.email}</h4>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9px] font-bold">
                          🟢 Conectado
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-mono">{currentUser.email}</p>
                      {lastSync && (
                        <span className="text-[9.5px] text-cyan-400 block mt-0.5">
                          Última sincronización: {new Date(lastSync).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 transition cursor-pointer text-[10px] flex items-center gap-1"
                      title="Editar Perfil"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-500/30 transition cursor-pointer text-[10px] flex items-center gap-1 shrink-0"
                      title="Cerrar Sesión"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Salir</span>
                    </button>
                  </div>
                </div>

                {/* Edit Profile Form */}
                {isEditingProfile && (
                  <form onSubmit={handleSaveProfile} className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 space-y-3 animate-in fade-in duration-200">
                    <div className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Personalizar mi Nombre de Usuario y Avatar</span>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1 text-[11px]">Nombre de Usuario / Apodo:</label>
                      <input
                        type="text"
                        required
                        value={editDisplayName}
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        placeholder="Ej: nigh061tmare"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1 text-[11px]">Semilla de Avatar (Escribe cualquier palabra para cambiar tu robot):</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={editAvatarSeed}
                          onChange={(e) => setEditAvatarSeed(e.target.value)}
                          placeholder="Ej: shadow_master, saiyan_99..."
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs focus:border-cyan-400 outline-none"
                        />
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-cyan-500/40 overflow-hidden shrink-0">
                          <img 
                            src={getUserAvatar({ displayName: editAvatarSeed || editDisplayName, email: currentUser.email })} 
                            alt="" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar Nombre</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs border border-slate-700 transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                {/* Bóveda Stats */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center space-y-1">
                    <Swords className="w-4 h-4 text-cyan-400 mx-auto" />
                    <div className="font-black text-white text-base">{allCharacters.length}</div>
                    <span className="text-[9.5px] text-slate-400 block uppercase">Personajes</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center space-y-1">
                    <Star className="w-4 h-4 text-amber-400 mx-auto" />
                    <div className="font-black text-amber-300 text-base">
                      {(() => {
                        try {
                          const h = JSON.parse(localStorage.getItem('apex_combat_history') || '[]');
                          return h.filter(x => x.isFavorite).length;
                        } catch { return 0; }
                      })()}
                    </div>
                    <span className="text-[9.5px] text-slate-400 block uppercase">Favoritos</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center space-y-1">
                    <Coins className="w-4 h-4 text-yellow-400 mx-auto" />
                    <div className="font-black text-yellow-300 text-base">{oracleCoins}</div>
                    <span className="text-[9.5px] text-slate-400 block uppercase">Monedas</span>
                  </div>
                </div>

                {/* Multi-Device Sync Action Buttons */}
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <Laptop className="w-4 h-4 text-cyan-400" />
                      <span>Control de Sincronización Manual</span>
                      <Smartphone className="w-4 h-4 text-cyan-400" />
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleUploadSync}
                      className="p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-cyan-950 disabled:opacity-50"
                    >
                      <ArrowUp className="w-4 h-4" />
                      <span>Subir este Dispositivo ➔ Nube</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleDownloadSync}
                      className="p-3 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-amber-950 disabled:opacity-50"
                    >
                      <ArrowDown className="w-4 h-4" />
                      <span>Descargar Nube ➔ Este Móvil/PC</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-6 text-center space-y-4 bg-slate-900/40 rounded-2xl border border-slate-800">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                  <User className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-base">Sin sesión activa</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Inicia sesión o crea una cuenta para personalizar tu perfil, sincronizar tus personajes y guardar tus batallas en la nube.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-md cursor-pointer"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow-md cursor-pointer"
                  >
                    Crear Cuenta
                  </button>
                </div>
              </div>
            )
          )}

          {/* TAB 4: QUICK LINK CODE (PC <-> MOBILE) */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-[11px] leading-relaxed flex items-start gap-2.5">
                <Key className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-300 font-bold mb-0.5">Enlace Rápido PC ↔ Móvil en 1 Segundo:</strong>
                  Puedes generar un código en tu PC e introducirlo en tu móvil para clonar y sincronizar todo tu perfil y personajes sin contraseñas.
                </div>
              </div>

              {/* Section 1: Generate Code */}
              {currentUser && (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <span className="font-bold text-slate-200 text-xs block">
                    1. Enviar este dispositivo a tu móvil:
                  </span>
                  
                  {generatedLinkCode ? (
                    <div className="p-3 rounded-xl bg-amber-950/40 border-2 border-amber-400 text-center space-y-1 animate-in zoom-in-95">
                      <span className="text-[10px] text-amber-300 uppercase tracking-widest block font-bold">Tu Código de Enlace Móvil:</span>
                      <div className="text-2xl font-black text-white font-mono tracking-widest">{generatedLinkCode}</div>
                      <span className="text-[10px] text-slate-400 block">Válido por 30 minutos. Escríbelo en tu móvil abajo.</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleGenerateLinkCode}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Generar Código de Enlace Móvil</span>
                    </button>
                  )}
                </div>
              )}

              {/* Section 2: Redeem Code */}
              <form onSubmit={handleRedeemLinkCode} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 text-xs block">
                  {currentUser ? '2. O vincular desde otro dispositivo:' : 'Vincular este dispositivo con Código:'}
                </span>

                <div className="relative">
                  <Key className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={linkCodeInput}
                    onChange={(e) => setLinkCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ej: APX-4921"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 pl-9 text-white font-mono text-sm tracking-widest uppercase focus:border-amber-400 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !linkCodeInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  <span>Vincular y Descargar Bóveda</span>
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono">
          <span className="text-[10.5px] text-slate-500">
            {currentUser ? `🟢 Conectado: ${currentUser.displayName || currentUser.username || currentUser.email}` : '⚪ Modo Local Activo'}
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
