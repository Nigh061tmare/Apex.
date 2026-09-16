---
name: security-audit-and-owasp
description: "Auditoría de seguridad en profundidad, mitigación de vulnerabilidades OWASP Top 10, prevención de inyecciones, XSS, CSRF y sanitización estricta."
---

# Security Audit and OWASP Skill

Esta habilidad audita proactivamente el código fuente para detectar y neutralizar fallos de seguridad en cualquier stack tecnológico.

## 🎯 Cuándo Activar
- Al manipular entradas de usuario, formularios, parámetros URL o cargas de archivos.
- Al interactuar con APIs externas, autenticación, tokens JWT o claves de entorno (`.env`).
- En revisiones de seguridad previas al despliegue o lanzamiento de un proyecto.

## 🛡️ Reglas de Protección
1. **Never Trust User Input:** Sanitizar y validar estrictamente con schemas (Zod/Yup/Joi).
2. **Prevención XSS:** En React, nunca usar `dangerouslySetInnerHTML` salvo sanitización previa con DOMPurify.
3. **Secrets Isolation:** Jamás hardcodear tokens, claves privadas o contraseñas en el código fuente.
