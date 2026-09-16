---
name: api-integration-and-webhooks
description: "Integración de APIs REST, GraphQL, WebSockets y gestión de Webhooks con reintentos automáticos (exponential backoff) y tolerancia a fallos."
---

# API Integration and Webhooks Skill

Esta habilidad estandariza la conexión con APIs externas, microservicios y sistemas asíncronos en proyectos nuevos y existentes.

## 🎯 Cuándo Activar
- Al consumir APIs REST/GraphQL, procesar peticiones HTTP o configurar clientes de red (`fetch`, `axios`).
- Al implementar comunicación bidireccional en tiempo real con WebSockets o Server-Sent Events (SSE).
- Al recibir y validar firmas de Webhooks (ej. GitHub, Stripe, Discord, Vercel).

## ⚡ Reglas de Resiliencia
1. **Timeouts Obligatorios:** Ninguna petición de red puede quedar colgada indefinidamente; usar siempre `AbortController` con timeout (5-10s).
2. **Backoff Exponencial con Jitter:** Reintentar fallos transitorios (502/503/504) con esperas progresivas.
3. **Manejo Estructurado de Errores:** Diferenciar errores de red, respuestas HTTP 4xx/5xx y fallos de parseo JSON.
