#!/usr/bin/env node
/**
 * 🧭 VANE MCP SERVER — SERVIDOR MCP DE NAVEGACIÓN Y BÚSQUEDA WEB PARA OPENCODE
 * 
 * Implementa el protocolo Model Context Protocol (MCP) estándar sobre stdio.
 * Proporciona a los agentes de OpenCode Web 3 herramientas nativas 100% gratuitas:
 * 1. `browser_search`: Busca en internet y devuelve enlaces y extractos.
 * 2. `browser_visit`: Navega a una URL y extrae su contenido en Markdown limpio.
 * 3. `vane_answer`: Búsqueda profunda y síntesis con citas estilo Vane/Perplexity.
 */

const readline = require('readline');
const { searchWeb, browseUrl, answerWithVane } = require('./vane_engine.cjs');

const SERVER_INFO = {
  name: 'vane-web-browser',
  version: '1.0.0'
};

const TOOLS = [
  {
    name: 'browser_search',
    description: 'Busca en la web en tiempo real sin límites ni cuota. Devuelve títulos, URLs y extractos relevantes de múltiples fuentes.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Consulta de búsqueda (términos clave, nombres de librerías, errores, etc.)'
        },
        max_results: {
          type: 'number',
          description: 'Número máximo de resultados (por defecto 5)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'browser_visit',
    description: 'Navega a cualquier URL y extrae el contenido completo en Markdown limpio, filtrando scripts, publicidad y estilos.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL completa a la que navegar (http:// o https://)'
        },
        max_chars: {
          type: 'number',
          description: 'Límite de caracteres a extraer (por defecto 8000)'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'vane_answer',
    description: 'Motor de respuestas agéntico estilo Vane/Perplexity. Busca en la web, lee las páginas principales y sintetiza una respuesta exhaustiva con citas numeradas [1], [2].',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Pregunta que requiere investigación en internet'
        }
      },
      required: ['query']
    }
  }
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function sendResponse(id, result, error = null) {
  const msg = { jsonrpc: '2.0', id };
  if (error) {
    msg.error = error;
  } else {
    msg.result = result;
  }
  process.stdout.write(JSON.stringify(msg) + '\n');
}

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let request;
  try {
    request = JSON.parse(trimmed);
  } catch (e) {
    return;
  }

  const { id, method, params } = request;

  switch (method) {
    case 'initialize':
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: SERVER_INFO
      });
      break;

    case 'notifications/initialized':
      // Notificación de cliente inicializado, no requiere respuesta
      break;

    case 'ping':
      sendResponse(id, {});
      break;

    case 'tools/list':
      sendResponse(id, {
        tools: TOOLS
      });
      break;

    case 'tools/call': {
      const toolName = params?.name;
      const args = params?.arguments || {};

      try {
        if (toolName === 'browser_search') {
          const results = await searchWeb(args.query, args.max_results || 5);
          sendResponse(id, {
            content: [
              {
                type: 'text',
                text: JSON.stringify(results, null, 2)
              }
            ]
          });
        } else if (toolName === 'browser_visit') {
          const page = await browseUrl(args.url, args.max_chars || 8000);
          sendResponse(id, {
            content: [
              {
                type: 'text',
                text: `# ${page.title}\nURL: ${page.url}\n\n${page.content}`
              }
            ]
          });
        } else if (toolName === 'vane_answer') {
          const answer = await answerWithVane(args.query);
          sendResponse(id, {
            content: [
              {
                type: 'text',
                text: `${answer.answer}\n\n---\nFuentes consultadas: ${answer.sources.map(s => `[${s.id}] ${s.title} (${s.url})`).join(', ')}`
              }
            ]
          });
        } else {
          sendResponse(id, null, {
            code: -32601,
            message: `Herramienta desconocida: ${toolName}`
          });
        }
      } catch (err) {
        sendResponse(id, {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Error ejecutando ${toolName}: ${err.message}`
            }
          ]
        });
      }
      break;
    }

    default:
      if (id !== undefined) {
        sendResponse(id, null, {
          code: -32601,
          message: `Método no soportado: ${method}`
        });
      }
      break;
  }
});
