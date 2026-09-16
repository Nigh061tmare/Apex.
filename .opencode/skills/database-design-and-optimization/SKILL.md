---
name: database-design-and-optimization
description: "Diseño de esquemas de bases de datos relacionales (SQLite, PostgreSQL, MySQL) y NoSQL, modelado relacional, indexación y optimización de consultas SQL."
---

# Database Design and Optimization Skill

Esta habilidad guía el diseño de esquemas, migraciones y optimización de bases de datos para proyectos nuevos y existentes.

## 🎯 Cuándo Activar
- Al diseñar tablas, modelos de datos, esquemas relacionales o bases de datos SQLite/Postgres/MySQL.
- Al optimizar consultas SQL lentas, agregar índices (`CREATE INDEX`) o evitar escaneos de tabla completos (Full Table Scans).
- Al inspeccionar o consultar bases de datos locales (como `opencode.db` o bases de datos SQLite de proyectos).

## 🛠️ Reglas de Oro
1. **Índices Estratégicos:** Indexar siempre claves foráneas y columnas utilizadas frecuentemente en cláusulas `WHERE`, `JOIN` y `ORDER BY`.
2. **Normalización vs Desnormalización:** Normalizar (3FN) para integridad transaccional; desnormalizar con cautela solo cuando existan lecturas críticas de alto rendimiento.
3. **Transacciones Atómicas:** Operaciones multi-tabla deben ejecutarse siempre dentro de transacciones (`BEGIN TRANSACTION` / `COMMIT`).
