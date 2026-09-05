// APEX Cloud Sync & Authentication Service (V3 - Multi-Device Bridge)
// Seamless cross-device cloud synchronization for characters, favorite fights, settings, and oracle coins.

const STORAGE_KEY_AUTH_USER = 'apex_auth_user';
const STORAGE_KEY_CLOUD_CONFIG = 'apex_cloud_config';
const STORAGE_KEY_LAST_SYNC = 'apex_last_cloud_sync';
const STORAGE_KEY_ACCOUNTS_REGISTRY = 'apex_accounts_registry';

const DEFAULT_CLOUD_CONFIG = {
  syncIntervalMs: 15000
};

function generateDeterministicId(identifier) {
  const clean = (identifier || '').toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = charCode(clean, i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const safeHash = Math.abs(hash).toString(36);
  const safePrefix = btoa(unescape(encodeURIComponent(clean))).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
  return `usr_${safePrefix}_${safeHash}`;
}

function charCode(str, i) {
  return str.charCodeAt(i) || 0;
}

// Safe Puter KV wrappers that check authentication and timeout after 1.5s to prevent hanging
async function safePuterGet(key) {
  try {
    if (typeof window === 'undefined' || !window.puter?.kv) return null;
    if (!window.puter.auth?.isSignedIn?.()) return null;
    return await Promise.race([
      window.puter.kv.get(key).catch(() => null),
      new Promise(resolve => setTimeout(() => resolve(null), 1500))
    ]);
  } catch {
    return null;
  }
}

async function safePuterSet(key, value) {
  try {
    if (typeof window === 'undefined' || !window.puter?.kv) return null;
    if (!window.puter.auth?.isSignedIn?.()) return null;
    return await Promise.race([
      window.puter.kv.set(key, value).catch(() => null),
      new Promise(resolve => setTimeout(() => resolve(null), 1500))
    ]);
  } catch {
    return null;
  }
}

class CloudSyncService {
  constructor() {
    this.user = this.loadStoredUser();
    this.cloudConfig = this.loadCloudConfig();
    this.accounts = this.loadAccountsRegistry();
    this.listeners = new Set();
    this.syncTimeout = null;
    this.isSyncing = false;
  }

  loadStoredUser() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  loadAccountsRegistry() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACCOUNTS_REGISTRY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  saveAccountsRegistry(accounts) {
    this.accounts = accounts;
    try {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS_REGISTRY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Failed to save accounts registry locally:', e);
    }
  }

  loadCloudConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLOUD_CONFIG);
      return saved ? { ...DEFAULT_CLOUD_CONFIG, ...JSON.parse(saved) } : DEFAULT_CLOUD_CONFIG;
    } catch {
      return DEFAULT_CLOUD_CONFIG;
    }
  }

  saveUser(user) {
    this.user = user;
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
      const accounts = this.loadAccountsRegistry();
      const cleanEmail = (user.email || '').toLowerCase().trim();
      const cleanName = (user.displayName || user.username || '').toLowerCase().trim();
      if (cleanEmail) accounts[cleanEmail] = user;
      if (cleanName) accounts[cleanName] = user;
      accounts[user.id] = user;
      this.saveAccountsRegistry(accounts);
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    }
    this.notifyListeners();
  }

  saveCloudConfig(config) {
    this.cloudConfig = { ...this.cloudConfig, ...config };
    localStorage.setItem(STORAGE_KEY_CLOUD_CONFIG, JSON.stringify(this.cloudConfig));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(this.user); } catch (e) { console.error(e); }
    });
  }

  isAuthenticated() {
    return !!(this.user && this.user.id);
  }

  getCurrentUser() {
    return this.user;
  }

  getLastSyncTime() {
    return localStorage.getItem(STORAGE_KEY_LAST_SYNC) || null;
  }

  /**
   * Actualiza el perfil de usuario (Nombre de usuario, Avatar, etc.)
   */
  async updateProfile({ displayName, avatar }) {
    if (!this.isAuthenticated()) throw new Error('No hay sesión activa.');

    const updatedUser = {
      ...this.user,
      displayName: displayName !== undefined ? displayName.trim() : this.user.displayName,
      avatar: avatar !== undefined ? avatar.trim() : this.user.avatar
    };

    this.saveUser(updatedUser);

    // Sync remote
    try {
      await this._postBackend('/api/cloud/sync', {
        userId: updatedUser.id,
        userEmail: updatedUser.email,
        displayName: updatedUser.displayName,
        avatar: updatedUser.avatar
      }).catch(() => {});
    } catch {}

    return updatedUser;
  }

  /**
   * Registra un nuevo usuario con Email / Usuario, Contraseña y Nombre para mostrar
   */
  async signUp(emailOrUser, password, displayName = '') {
    if (!emailOrUser || !password) throw new Error('Identificador y contraseña obligatorios.');
    if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');

    const cleanInput = emailOrUser.toLowerCase().trim();
    const isEmail = cleanInput.includes('@');
    const email = isEmail ? cleanInput : `${cleanInput}@apex.vault`;
    const cleanDisplayName = displayName.trim() || (isEmail ? cleanInput.split('@')[0] : emailOrUser.trim());
    const userId = generateDeterministicId(email);

    const newUser = {
      id: userId,
      email: email,
      username: cleanDisplayName,
      displayName: cleanDisplayName,
      password: password,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanDisplayName || email)}`,
      role: 'member',
      token: `apex_jwt_${userId}`
    };

    // Save locally
    this.saveUser(newUser);

    // Push account to remote cloud API
    try {
      await this._postBackend('/api/cloud/sync', {
        userId: newUser.id,
        userEmail: newUser.email,
        displayName: newUser.displayName,
        avatar: newUser.avatar
      });
    } catch {}

    // Puter KV backup safely
    try {
      await safePuterSet(`apex_user_${userId}`, newUser);
      await safePuterSet(`apex_acc_${cleanInput}`, newUser);
    } catch {}

    return newUser;
  }

  /**
   * Inicia sesión con Email o Nombre de Usuario y Contraseña (opcional para cuentas locales)
   */
  async login(identifier, password = '') {
    if (!identifier || !identifier.trim()) throw new Error('Introduce tu email o nombre de usuario.');

    const cleanInput = identifier.toLowerCase().trim();
    const accounts = this.loadAccountsRegistry();
    
    // 1. Check local registry
    let existingAccount = accounts[cleanInput] || null;

    if (!existingAccount) {
      for (const key of Object.keys(accounts)) {
        const acc = accounts[key];
        if (acc && (
          (acc.email && acc.email.toLowerCase() === cleanInput) ||
          (acc.displayName && acc.displayName.toLowerCase() === cleanInput) ||
          (acc.username && acc.username.toLowerCase() === cleanInput)
        )) {
          existingAccount = acc;
          break;
        }
      }
    }

    // 2. Check remote cloud API
    if (!existingAccount) {
      try {
        const remoteData = await this._getBackend(`/api/cloud/sync?identifier=${encodeURIComponent(cleanInput)}`);
        if (remoteData && remoteData.account) {
          existingAccount = remoteData.account;
        }
      } catch (e) {}
    }

    // 3. Check Puter KV cross-device storage safely (guarded against hangs)
    if (!existingAccount) {
      try {
        const cloudAcc = await safePuterGet(`apex_acc_${cleanInput}`);
        if (cloudAcc && typeof cloudAcc === 'object' && cloudAcc.id) {
          existingAccount = cloudAcc;
        }
      } catch {}
    }

    let userToLog;
    if (existingAccount) {
      // Si la cuenta tiene contraseña guardada Y el usuario suministró contraseña, verificar coincidencia
      if (password && existingAccount.password && existingAccount.password !== password) {
        throw new Error('Contraseña incorrecta. Por favor verifica tus credenciales.');
      }
      userToLog = {
        ...existingAccount,
        password: existingAccount.password || password,
        lastLogin: new Date().toISOString(),
        token: `apex_jwt_${existingAccount.id}`
      };
    } else {
      const isEmail = cleanInput.includes('@');
      const email = isEmail ? cleanInput : `${cleanInput}@apex.vault`;
      const fallbackName = isEmail ? cleanInput.split('@')[0] : identifier.trim();
      const userId = generateDeterministicId(email);

      userToLog = {
        id: userId,
        email: email,
        username: fallbackName,
        displayName: fallbackName,
        password: password,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fallbackName)}`,
        role: 'member',
        token: `apex_jwt_${userId}`
      };
    }

    this.saveUser(userToLog);
    
    // Auto-fetch latest cloud vault data for this user safely
    try {
      await this.downloadProfileData();
    } catch (e) {
      console.warn('Auto-sync on login note:', e);
    }
    
    return userToLog;
  }

  /**
   * Genera un código de enlace de 6 dígitos para conectar el móvil en 1 segundo
   */
  async createQuickLinkCode(localData) {
    if (!this.isAuthenticated()) throw new Error('Inicia sesión para generar un código de enlace.');
    
    const payload = {
      userId: this.user.id,
      userEmail: this.user.email,
      displayName: this.user.displayName,
      timestamp: new Date().toISOString(),
      characters: localData.characters || [],
      combatHistory: localData.combatHistory || [],
      oracleCoins: localData.oracleCoins ?? 1000,
      customScenarios: localData.customScenarios || [],
      aiConfig: localData.aiConfig || {}
    };

    const res = await this._postBackend('/api/cloud/sync', {
      action: 'create_link_code',
      payload,
      account: this.user
    });

    if (res && res.code) {
      return res.code;
    }

    // Fallback in-memory/puter code
    const fallbackCode = `APX-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await safePuterSet(`apex_link_${fallbackCode}`, { payload, account: this.user });
    } catch {}
    return fallbackCode;
  }

  /**
   * Vincula este dispositivo usando un código de 6 dígitos
   */
  async redeemQuickLinkCode(code) {
    if (!code) throw new Error('Introduce el código de enlace.');
    const cleanCode = code.trim().toUpperCase();

    // 1. Try remote backend
    let result = null;
    try {
      const res = await this._postBackend('/api/cloud/sync', {
        action: 'redeem_link_code',
        code: cleanCode
      });
      if (res && res.success && res.payload) {
        result = res;
      }
    } catch (e) {}

    // 2. Try Puter KV fallback safely
    if (!result) {
      try {
        const item = await safePuterGet(`apex_link_${cleanCode}`);
        if (item && item.payload) {
          result = item;
        }
      } catch (e) {}
    }

    if (!result || !result.payload) {
      throw new Error('Código de enlace inválido o expirado. Genera uno nuevo en tu otro dispositivo.');
    }

    // Login account
    if (result.account) {
      this.saveUser(result.account);
    }

    // Cache vault
    localStorage.setItem(`apex_cloud_vault_${result.payload.userId}`, JSON.stringify(result.payload));
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, result.payload.timestamp || new Date().toISOString());

    return {
      success: true,
      account: result.account,
      data: result.payload
    };
  }

  /**
   * Cierra la sesión
   */
  async logout() {
    this.saveUser(null);
  }

  /**
   * Sube toda la bóveda local a la Nube
   */
  async uploadProfileData(localData) {
    if (!this.isAuthenticated()) {
      throw new Error('Debes iniciar sesión para sincronizar tus datos en la nube.');
    }

    this.isSyncing = true;
    try {
      const payload = {
        userId: this.user.id,
        userEmail: this.user.email,
        displayName: this.user.displayName,
        timestamp: new Date().toISOString(),
        characters: localData.characters || [],
        combatHistory: localData.combatHistory || [],
        oracleCoins: localData.oracleCoins ?? 1000,
        customScenarios: localData.customScenarios || [],
        aiConfig: localData.aiConfig || {}
      };

      // 1. Guardar en caché local
      localStorage.setItem(`apex_cloud_vault_${this.user.id}`, JSON.stringify(payload));
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, payload.timestamp);

      // 2. Subir al endpoint serverless
      try {
        await this._postBackend('/api/cloud/sync', payload).catch(() => {});
      } catch (err) {}

      // 3. Subir a Puter KV safely
      try {
        await safePuterSet(`apex_vault_${this.user.id}`, payload);
      } catch (err) {}

      return { success: true, timestamp: payload.timestamp, stats: {
        charactersCount: payload.characters.length,
        favoritesCount: payload.combatHistory.filter(h => h.isFavorite).length,
        coins: payload.oracleCoins
      }};
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Descarga la bóveda desde la Nube
   */
  async downloadProfileData() {
    if (!this.isAuthenticated()) {
      throw new Error('Debes iniciar sesión para descargar tus datos.');
    }

    this.isSyncing = true;
    try {
      let cloudData = null;

      // 1. Intentar backend serverless
      try {
        const res = await this._getBackend(`/api/cloud/sync?userId=${encodeURIComponent(this.user.id)}`);
        if (res && res.vault && res.vault.characters) {
          cloudData = res.vault;
        }
      } catch (e) {}

      // 2. Intentar Puter KV safely
      if (!cloudData) {
        try {
          const puterVault = await safePuterGet(`apex_vault_${this.user.id}`);
          if (puterVault && typeof puterVault === 'object' && puterVault.characters) {
            cloudData = puterVault;
          }
        } catch (e) {}
      }

      // 3. Fallback al vault del usuario en localStorage
      if (!cloudData) {
        const cached = localStorage.getItem(`apex_cloud_vault_${this.user.id}`);
        if (cached) cloudData = JSON.parse(cached);
      }

      if (!cloudData) {
        return { empty: true, message: 'No hay datos previos en la nube para este usuario.' };
      }

      localStorage.setItem(STORAGE_KEY_LAST_SYNC, cloudData.timestamp || new Date().toISOString());

      return {
        success: true,
        data: cloudData
      };
    } finally {
      this.isSyncing = false;
    }
  }

  triggerAutoSync(getCurrentLocalData) {
    if (!this.isAuthenticated()) return;
    if (this.syncTimeout) clearTimeout(this.syncTimeout);

    this.syncTimeout = setTimeout(async () => {
      try {
        const data = typeof getCurrentLocalData === 'function' ? getCurrentLocalData() : getCurrentLocalData;
        if (data) {
          await this.uploadProfileData(data);
        }
      } catch (e) {
        console.warn('Auto-sync note:', e);
      }
    }, 4000);
  }

  async _postBackend(endpoint, body) {
    try {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const url = isLocal ? `http://${window.location.hostname}:3001${endpoint}` : endpoint;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).catch(() => null);
      if (!res || !res.ok) return null;
      return await res.json().catch(() => null);
    } catch {
      return null;
    }
  }

  async _getBackend(endpoint) {
    try {
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const url = isLocal ? `http://${window.location.hostname}:3001${endpoint}` : endpoint;
      const res = await fetch(url).catch(() => null);
      if (!res || !res.ok) return null;
      return await res.json().catch(() => null);
    } catch {
      return null;
    }
  }
}

export const CloudSync = new CloudSyncService();
