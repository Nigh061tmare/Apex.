---
name: obsidian-vault-and-knowledge-graph
description: "Gestión avanzada de bóvedas Obsidian: frontmatter YAML estructurado, enlaces bidireccionales wikilinks [[...]], consultas Dataview y organización de grafos de conocimiento."
---

# Obsidian Vault and Knowledge Graph Skill

Esta habilidad proporciona las mejores prácticas para estructurar notas, lore, registros de desarrollo y documentación en la bóveda de Obsidian (`d:\Vault Obsidian\Obsidian Vault`).

## 🎯 Cuándo Activar
- Al redactar, organizar o enlazar notas en el Vault de Obsidian.
- Al documentar lore de personajes, tiers de poder, registros de combate o manuales de arquitectura.
- Al asegurar que los wikilinks `[[Nota]]` mantengan integridad referencial y no queden enlaces rotos.

---

## 📝 Estándares de Documentación en Obsidian

1. **Frontmatter YAML Limpio:**
```yaml
---
title: "Nombre del Documento"
tags: [apex, lore, dragonball, tiering]
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: stable
---
```
2. **Enlaces Bidireccionales:** Usar siempre enlaces contextuales `[[NombreExactoDeLaNota|Texto visible]]` en lugar de rutas relativas o URLs absolutas de disco.
3. **Encabezados Semánticos:** Estructura jerárquica clara (`#`, `##`, `###`) para facilitar la navegación mediante el panel de esquema de Obsidian.
