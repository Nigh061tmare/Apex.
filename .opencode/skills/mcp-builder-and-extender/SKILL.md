---
name: mcp-builder-and-extender
description: "Diseño, creación y extensión de nuevos servidores de Model Context Protocol (MCP) en TypeScript/Node.js o Python para dotar a OpenCode de herramientas personalizadas."
---

# MCP Builder and Extender Skill

Esta habilidad capacita al agente para programar, compilar y conectar nuevos servidores MCP locales cuando surjan necesidades de integración de APIs, hardware o bases de datos no cubiertas.

## 🎯 Cuándo Activar
- Cuando el usuario necesite conectar una API externa (Discord, Notion, Vercel, Telegram, Spotify).
- Cuando se requiera un servidor MCP a medida para consultar archivos binarios, leer sensores o procesar datos de juegos.

---

## 🛠️ Estructura Estándar de un MCP Server (TypeScript / Node.js)
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server({ name: "custom-tool", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "mi_herramienta",
    description: "Descripción concisa de lo que realiza",
    inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }
  }]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
```
