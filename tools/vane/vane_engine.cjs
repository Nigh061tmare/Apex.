/**
 * 🧭 VANE WEB ENGINE — MOTOR DE BÚSQUEDA Y NAVEGACIÓN AGÉNTICA ESTILO VANE / PERPLEXITY
 * 
 * Capacidades:
 * 1. Búsqueda web agregada multi-fuente (100% gratuita, sin APIs de pago ni cuota).
 * 2. Navegación profunda y extracción limpia de páginas web en Markdown.
 * 3. Síntesis inteligente de respuestas con citas numeradas [1], [2] usando OpenRouter Free.
 * 4. BLINDAJE TOTAL: Cero consumo de saldo de OpenCode Go.
 */

const fs = require('fs');
const path = require('path');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const FREE_MODELS_CASCADE = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'google/gemma-4-26b-a4b-it:free',
  'nex-agi/nex-n2.5-mini:free'
];

function getAuthKey(provider) {
  try {
    const authPath = path.join(process.env.USERPROFILE || 'C:\\Users\\Jose Luis', '.local', 'share', 'opencode', 'auth.json');
    if (fs.existsSync(authPath)) {
      const data = JSON.parse(fs.readFileSync(authPath, 'utf8'));
      if (data[provider]?.key) return data[provider].key;
    }
  } catch (e) {}

  // Fallback a variables de entorno
  const envKey = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (envKey) return envKey;
  if (provider === 'openrouter' && process.env.OPENROUTER_BACKUP_API_KEY) {
    return process.env.OPENROUTER_BACKUP_API_KEY;
  }
  return null;
}

// ── 1. Búsqueda Web Multi-Fuente ─────────────────────────────────────────────
async function searchWeb(query, maxResults = 5) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const results = [];

    const linkRegex = /<a class="result__url" href="([^"]+)">([^<]+)<\/a>/g;
    const snippetRegex = /<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/g;
    const titleRegex = /<h2 class="result__title">[\s\S]*?<a[^>]*class="result__a"[^>]*>([\s\S]*?)<\/a>/g;

    let m;
    const titles = [];
    while ((m = titleRegex.exec(html)) !== null) {
      titles.push(m[1].replace(/<[^>]+>/g, '').trim());
    }

    const snippets = [];
    while ((m = snippetRegex.exec(html)) !== null) {
      snippets.push(m[1].replace(/<[^>]+>/g, '').trim());
    }

    const links = [];
    while ((m = linkRegex.exec(html)) !== null) {
      let rawLink = m[1].trim();
      if (rawLink.includes('uddg=')) {
        try {
          const u = new URL('https:' + rawLink);
          rawLink = decodeURIComponent(u.searchParams.get('uddg') || rawLink);
        } catch (e) {}
      }
      links.push(rawLink);
    }

    const count = Math.min(titles.length, links.length, maxResults);
    for (let i = 0; i < count; i++) {
      results.push({
        id: i + 1,
        title: titles[i],
        url: links[i],
        snippet: snippets[i] || ''
      });
    }

    if (results.length === 0) {
      return await searchWikipedia(query, maxResults);
    }

    return results;
  } catch (err) {
    return await searchWikipedia(query, maxResults);
  }
}

// Fallback Wikipedia API
async function searchWikipedia(query, maxResults = 3) {
  try {
    const endpoint = `https://es.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${maxResults}&format=json`;
    const res = await fetch(endpoint, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(6000)
    });
    const data = await res.json();
    const titles = data[1] || [];
    const snippets = data[2] || [];
    const urls = data[3] || [];
    const results = [];
    for (let i = 0; i < titles.length; i++) {
      results.push({
        id: i + 1,
        title: titles[i],
        url: urls[i],
        snippet: snippets[i] || ''
      });
    }
    return results;
  } catch (e) {
    return [];
  }
}

// ── 2. Navegación y Extracción de Contenido Web en Markdown ──────────────────
async function browseUrl(url, maxChars = 8000) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) {
      return { url, title: 'Error al cargar', content: `No se pudo acceder a la página (HTTP ${res.status})` };
    }

    const html = await res.text();

    let cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
      .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '');

    const titleMatch = cleaned.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    cleaned = cleaned
      .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
      .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

    cleaned = cleaned.replace(/<[^>]+>/g, ' ');
    cleaned = cleaned.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    cleaned = cleaned.replace(/\t/g, ' ').replace(/[ ]{2,}/g, ' ');
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

    if (cleaned.length > maxChars) {
      cleaned = cleaned.slice(0, maxChars) + '\n\n[... Contenido resumido ...]';
    }

    return { url, title, content: cleaned };
  } catch (err) {
    return { url, title: 'Error de conexión', content: `Error al acceder a ${url}: ${err.message}` };
  }
}

// ── 3. Motor de Respuestas Estilo Vane / Perplexity con Citas [1], [2] ──────
async function answerWithVane(query, options = {}) {
  const searchResults = await searchWeb(query, options.maxResults || 4);
  if (searchResults.length === 0) {
    return {
      query,
      answer: `No se encontraron resultados web para la consulta: "${query}".`,
      sources: []
    };
  }

  // Navegar a las 2 páginas más relevantes de forma rápida
  const topPagesToBrowse = searchResults.slice(0, 2);
  const browsedPages = await Promise.all(
    topPagesToBrowse.map(r => browseUrl(r.url, 2500))
  );

  let sourcesContext = '';
  searchResults.forEach((r, idx) => {
    const browsed = browsedPages.find(p => p.url === r.url);
    const textContent = (browsed && browsed.content.length > 150) ? browsed.content : r.snippet;
    sourcesContext += `\n[${idx + 1}] "${r.title}"\nURL: ${r.url}\nEXTRACTO: ${textContent.slice(0, 1200)}\n`;
  });

  const apiKey = options.apiKey || getAuthKey('openrouter');
  if (!apiKey) {
    let fallbackAnswer = `### 🌐 Resultados de Búsqueda Web para: "${query}"\n\n`;
    searchResults.forEach((r, i) => {
      fallbackAnswer += `**[${i + 1}] [${r.title}](${r.url})**\n${r.snippet}\n\n`;
    });
    return { query, answer: fallbackAnswer, sources: searchResults };
  }

  // Probar cascada de modelos gratuitos de OpenRouter
  const modelsToTry = options.model ? [options.model] : FREE_MODELS_CASCADE;

  for (const modelToUse of modelsToTry) {
    try {
      const prompt = `Eres Vane, un motor de respuestas de inteligencia artificial con búsqueda web en tiempo real.
El usuario ha preguntado: "${query}".

A continuación tienes los extractos web obtenidos:
${sourcesContext}

INSTRUCCIONES:
1. Sintetiza una respuesta completa, precisa, estructurada y en español.
2. Cada dato o hecho debe incluir una cita numérica entre corchetes referenciando la fuente, por ejemplo [1] o [2].
3. Finaliza con una lista de fuentes consultadas con sus enlaces.
4. Responde directamente sin preámbulos innecesarios.`;

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:4096',
          'X-Title': 'OpenCode Vane Browser'
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 1500
        }),
        signal: AbortSignal.timeout(18000)
      });

      if (!res.ok) continue;

      const data = await res.json();
      const answerText = data.choices?.[0]?.message?.content;
      if (answerText && answerText.length > 50) {
        return {
          query,
          answer: answerText,
          sources: searchResults,
          modelUsed: modelToUse
        };
      }
    } catch (err) {
      // Probar siguiente modelo gratuito en la cascada
      continue;
    }
  }

  // Si fallan las llamadas LLM gratuitas, devolver resultados con snippets
  let fallback = `### 🌐 Resultados Web para: "${query}"\n\n`;
  searchResults.forEach((r, i) => {
    fallback += `**[${i + 1}] [${r.title}](${r.url})**\n${r.snippet}\n\n`;
  });
  return { query, answer: fallback, sources: searchResults };
}

module.exports = {
  searchWeb,
  browseUrl,
  answerWithVane,
  getAuthKey,
  FREE_MODELS_CASCADE
};
