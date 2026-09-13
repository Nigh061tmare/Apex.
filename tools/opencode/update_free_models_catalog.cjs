/**
 * 🔄 OPENROUTER FREE MODELS CATALOG AUTO-UPDATER
 * 
 * Consulta la API en vivo de OpenRouter, extrae todos los modelos gratuitos (:free)
 * disponibles actualmente y actualiza el bloque "provider.openrouter.models"
 * en todas las configuraciones de OpenCode para mantener el catálogo siempre al día
 * sin que jamás se utilicen modelos caducados o de pago.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATHS = [
  'Z:/apex-powerscaling-engine/opencode.json',
  'Z:/apex-powerscaling-engine/.opencode/opencode.jsonc',
  'C:/Users/Jose Luis/.config/opencode/opencode.jsonc'
];

async function fetchLiveFreeModels() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'User-Agent': 'OpenCode-Catalog-Updater/1.0' },
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const freeList = data.data.filter(m => m.id && m.id.endsWith(':free'));
    console.log(`[CATALOG] 🌐 Obtenidos ${freeList.length} modelos gratuitos activos desde OpenRouter.`);
    return freeList;
  } catch (err) {
    console.warn(`[CATALOG] ⚠️ No se pudo consultar la API de OpenRouter: ${err.message}`);
    return null;
  }
}

function buildModelsMap(freeList) {
  const modelsMap = {};
  for (const m of freeList) {
    const shortId = m.id;
    const isReasoning = shortId.includes('reasoning') || m.name.toLowerCase().includes('reason');

    modelsMap[shortId] = {
      name: m.name || shortId,
      limit: {
        context: m.context_length || 262144,
        output: m.top_provider?.max_completion_tokens || 32768
      },
      temperature: true
    };

    if (isReasoning) {
      modelsMap[shortId].reasoning = true;
    }
  }
  return modelsMap;
}

function replaceModelsInRaw(raw, newModelsJson) {
  const marker = '"models":';
  const idx = raw.indexOf(marker);
  if (idx === -1) return raw;
  const startBrace = raw.indexOf('{', idx + marker.length);
  if (startBrace === -1) return raw;

  let depth = 0;
  let endBrace = -1;
  for (let i = startBrace; i < raw.length; i++) {
    if (raw[i] === '{') depth++;
    else if (raw[i] === '}') {
      depth--;
      if (depth === 0) {
        endBrace = i;
        break;
      }
    }
  }

  if (endBrace === -1) return raw;
  return raw.slice(0, startBrace) + newModelsJson + raw.slice(endBrace + 1);
}

function updateConfigFile(filePath, modelsMap) {
  if (!fs.existsSync(filePath)) return false;

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    
    if (filePath.endsWith('.json')) {
      const json = JSON.parse(raw);
      if (!json.provider) json.provider = {};
      if (!json.provider.openrouter) json.provider.openrouter = {};
      json.provider.openrouter.models = modelsMap;

      fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`[CATALOG] ✅ Actualizado catálogo en: ${filePath}`);
      return true;
    }

    const modelsJsonString = JSON.stringify(modelsMap, null, 2);
    const updated = replaceModelsInRaw(raw, modelsJsonString);
    if (updated !== raw) {
      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`[CATALOG] ✅ Actualizado catálogo en: ${filePath}`);
      return true;
    } else {
      console.warn(`[CATALOG] ⚠️ No se encontró el bloque models en ${filePath}`);
      return false;
    }
  } catch (err) {
    console.error(`[CATALOG] ❌ Error actualizando ${filePath}:`, err.message);
    return false;
  }
}

async function runCatalogUpdate() {
  console.log('[CATALOG] 🔍 Actualizando catálogo de modelos gratuitos de OpenRouter...');
  const freeList = await fetchLiveFreeModels();
  if (!freeList || freeList.length === 0) {
    console.log('[CATALOG] Saltando actualización por falta de respuesta.');
    return false;
  }

  const modelsMap = buildModelsMap(freeList);
  let updatedCount = 0;

  for (const p of CONFIG_PATHS) {
    if (updateConfigFile(p, modelsMap)) {
      updatedCount++;
    }
  }

  console.log(`[CATALOG] 🟢 Catálogo 100% actualizado: ${Object.keys(modelsMap).length} modelos gratuitos sincronizados.`);
  return true;
}

if (require.main === module) {
  runCatalogUpdate();
}

module.exports = { runCatalogUpdate, replaceModelsInRaw };
