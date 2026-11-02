// Vercel Serverless Function: /api/cloud/sync
// Provides zero-config cloud storage, multi-device account sync, and quick 6-digit link codes.

const inMemoryVaultStore = new Map();
const inMemoryAccountStore = new Map();
const inMemoryLinkCodes = new Map();

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, userId, identifier, code } = req.query;

  // 1. GENERATE / REDEEM QUICK SYNC LINK CODE (PC <-> Móvil)
  if (req.method === 'POST' && req.body?.action === 'create_link_code') {
    const { payload, account } = req.body;
    const cleanCode = `APX-${Math.floor(1000 + Math.random() * 9000)}`;
    inMemoryLinkCodes.set(cleanCode, {
      code: cleanCode,
      payload,
      account,
      expiresAt: Date.now() + 1000 * 60 * 30 // 30 minutes
    });

    return res.status(200).json({
      success: true,
      code: cleanCode,
      message: `Código de enlace generado: ${cleanCode}. Válido por 30 minutos.`
    });
  }

  if (req.method === 'POST' && req.body?.action === 'redeem_link_code') {
    const targetCode = (req.body?.code || '').trim().toUpperCase();
    const item = inMemoryLinkCodes.get(targetCode);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Código de enlace no encontrado o expirado. Genera uno nuevo en tu otro dispositivo.'
      });
    }

    if (Date.now() > item.expiresAt) {
      inMemoryLinkCodes.delete(targetCode);
      return res.status(410).json({
        success: false,
        error: 'El código de enlace ha expirado.'
      });
    }

    return res.status(200).json({
      success: true,
      payload: item.payload,
      account: item.account
    });
  }

  // 2. GET VAULT & ACCOUNT BY USER ID / IDENTIFIER
  if (req.method === 'GET') {
    const searchKey = (userId || identifier || '').toLowerCase().trim();
    if (!searchKey) {
      return res.status(400).json({ error: 'Debes proporcionar un userId o identificador.' });
    }

    // Lookup vault
    const vault = inMemoryVaultStore.get(searchKey);
    const account = inMemoryAccountStore.get(searchKey);

    if (vault || account) {
      return res.status(200).json({
        success: true,
        vault: vault || null,
        account: account || null
      });
    }

    return res.status(404).json({
      empty: true,
      message: 'No se encontraron datos en la nube para este identificador.'
    });
  }

  // 3. POST / SAVE VAULT & SYNC ACCOUNT
  if (req.method === 'POST') {
    const data = req.body || {};
    const uid = (data.userId || '').toLowerCase().trim();
    const email = (data.userEmail || data.email || '').toLowerCase().trim();
    const username = (data.displayName || data.username || '').toLowerCase().trim();

    if (!uid && !email && !username) {
      return res.status(400).json({ error: 'Datos de usuario insuficientes.' });
    }

    const payload = {
      userId: uid || `usr_${email}`,
      userEmail: email,
      displayName: data.displayName || data.username || 'Usuario APEX',
      timestamp: new Date().toISOString(),
      characters: data.characters || [],
      combatHistory: data.combatHistory || [],
      oracleCoins: data.oracleCoins ?? 1000,
      customScenarios: data.customScenarios || [],
      aiConfig: data.aiConfig || {}
    };

    const accountData = {
      id: payload.userId,
      email: payload.userEmail,
      displayName: payload.displayName,
      avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(payload.displayName || payload.userEmail)}`,
      lastSync: payload.timestamp
    };

    // Store by all keys for robust retrieval
    if (uid) inMemoryVaultStore.set(uid, payload);
    if (email) inMemoryVaultStore.set(email, payload);
    if (username) inMemoryVaultStore.set(username, payload);

    if (uid) inMemoryAccountStore.set(uid, accountData);
    if (email) inMemoryAccountStore.set(email, accountData);
    if (username) inMemoryAccountStore.set(username, accountData);

    return res.status(200).json({
      success: true,
      timestamp: payload.timestamp,
      stats: {
        charactersCount: payload.characters.length,
        favoritesCount: payload.combatHistory.filter(h => h.isFavorite).length,
        coins: payload.oracleCoins
      }
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
