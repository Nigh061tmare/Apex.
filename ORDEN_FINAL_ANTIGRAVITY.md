# 📋 ORDEN FINAL — APEX POWERSCALING ENGINE (V26 LISTO PARA DESPLIEGUE)

> **Para el agente Antigravity Superior Builder.**
> Fecha: 2026-09-05 · Repositorio: `Z:\apex-powerscaling-engine` (o `D:\Vault Obsidian\apex-powerscaling-engine`)
> Estado del roster: **VALIDADO 19/19 PASS · 0 errores · 0 duplicados · 756 activos / 769 censo total**

---

## 🎯 MISIÓN

Aplicar y desplegar la versión **V26 final** del roster a los dos entornos:

1. **Apex Engine local** (backend puerto 3001 + frontend puerto 5173)
2. **Vercel producción** → `https://apex-engine-six.vercel.app/`

Todo el trabajo de datos ya está **completado y verificado**. No se deben modificar valores de poder ni nombres: solo **validar, construir y desplegar**.

---

## ✅ 1. VERIFICACIÓN PREVIA (obligatoria, 2 minutos)

```powershell
# Desde el directorio del repositorio activo
node src/scripts/rosterCanonicalValidatorV26.js
```

**Criterio de aprobación** (debe aparecer exactamente esto al final):

```
RESULTADO GLOBAL: ✅ PASS (ROSTER V26 100% CANÓNICO)
```

Si el validador reporta errores, **DETENERSE** y reportar al usuario. NO corregir automáticamente.

---

## 📦 2. SINCRONIZACIÓN GIT (commit + push)

```powershell
git add .
git commit -m "feat: roster V26 final - 594 names limpiados, 17 outliers reescalados, 19 multipliers alineados, numericStats sincronizado"
git push origin main
```

> ⚠️ Trabaja desde `Z:\apex-powerscaling-engine` si es posible (la ruta UNC directa `\\192.168.1.82\...` rompe CMD/CMD=esbuild).

---

## 🚀 3. DESPLIEGUE A VERCEL (producción)

### Opción A — Script oficial (recomendada)
```powershell
.\DESPLEGAR_A_VERCEL.bat
```
El script: hace `git add/commit/push`, lee `VERCEL_TOKEN` de `.env.local` (o variable de entorno) y ejecuta el CLI.

### Opción B — CLI manual con token
```powershell
$token = node -e "const fs=require('fs'); const m=fs.readFileSync('.env.local','utf8').match(/^VERCEL_TOKEN=(.*)$/m); console.log(m ? m[1].trim() : '')"
npx vercel --prod --yes --token $token
```

**Url de producción:** `https://apex-engine-six.vercel.app/`

---

## ✅ 4. HEALTH CHECK POST-DESPLIEGUE

```powershell
Invoke-WebRequest -Uri "https://apex-engine-six.vercel.app" -Method Head | Select-Object StatusCode, StatusDescription
```

**Resultado obligatorio:** `StatusCode: 200`

---

## 💻 5. ARRANQUE LOCAL (Apex Engine en tu máquina)

```powershell
.\START_APEX_ENGINE.bat
```
Abre dos ventanas:
- **Backend**: `node server.cjs` → puerto `3001`
- **Frontend**: `npx vite --host 0.0.0.0 --port 5173` → puerto `5173`

Verificación: navegador en `http://localhost:5173` + `http://localhost:3001/api/health` (si existe el endpoint).

---

## 🔒 6. RESTRICCIONES DE ORO (NO HACER)

| Prohibición | Motivo |
| :--- | :--- |
| ❌ NO editar `ROSTER_NIVELES_PODER_CORREGIDO_V22.json` | Baseline oficial congelado e inmutable |
| ❌ NO modificar tiers, ki, multiplicadores, forms, ids, universos en V26 | Validado y aprobado por el usuario |
| ❌ NO tocar `APEX_NEEDS_REVIEW_BACKLOG_V22.json` | Catálogo de advertencias, solo lectura |
| ❌ NO sincronizar `ROSTER_NIVELES_PODER_CORREGIDO_V26.json` de la raíz | Es un stub de prueba `{"meta":{"test":true}}`; la fuente real está en `src/data/` |
| ❌ NO regenerar `characters.js` desde otra fuente | El merge táctico ya está sincronizado manualmente (numericStats derivados de baseKiNumeric) |

---

## 📝 7. CAMBIOS APLICADOS EN ESTA RONDA (solo informativo)

| # | Cambio | Detalle |
| :-: | :--- | :--- |
| 1 | **594 names limpiados** | `fix_names_limpieza_v26.py` v3.1 — UNI_TAIL/TECH case-insensitive, tokens largos primero, nombres propios preservados |
| 2 | **8 fichas desambiguadas** | Darkseid, Fami, Loki, Martian Manhunter (Cósmico/Rebirth) — 0 duplicados de name |
| 3 | **nivel3b** | `loid-forger` universe → SPY X FAMILY; 19 " Unidades" limpiadas; 8 campos tier residuales eliminados |
| 4 | **17 outliers reescalados** | `fix_outliers_v26.py` — ki = mediana(tier+universo) × firma determinística, 4 cifras significativas, tiers INTACTOS |
| 5 | **19 multipliers alineados** | String decorativo = ratio real ki[forma]/ki[base] (`$\times N$`) |
| 6 | **scarlet-witch** | Ki corregido a 1,116e28 limpio (artefacto binario eliminado) |
| 7 | **numericStats sincronizado** | `characters.js` merge: apexKi=baseKiNumeric, burstKi≈1.35×, durabilityKi=apex — 0 discrepancias en motor |

---

## 📊 8. INVENTARIO FINAL V26 (estado verificado hoy)

```
✅ Combatientes Activos:            756 / 756
✅ Censo Total (con hist.):         769 / 769
✅ Formas / Transformaciones:       1.305
✅ Validador canónico:              19/19 PASS
✅ Nombres únicos (UI):             756 — 0 duplicados
✅ Discrepancias numericStats:      0 (144 corregidas vía merge)
✅ Tiers fuera de estándar:         0
✅ Descensos de tier:               0
✅ MD Maestro:                      ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md (395.0 KB)
✅ Backups:                         15 en src/data/BACKUP_ROSTER_V26_ANTES_*.json
✅ Tests motor:                     testResolver.js + testCombatResolverFull.js OK
```

---

## 🏁 DEFINICIÓN DE HECHO (DoD)

- [ ] Validador 19/19 PASS sin errores
- [ ] `git push origin main` completado
- [ ] `npx vercel --prod --yes` completado (Status 200 en health check)
- [ ] Apex local corriendo en `http://localhost:5173` (backend 3001)
- [ ] Confirmar al usuario con el reporte final + URL de producción

---

*Documento generado por el agente de edición del roster. Ejecutar en orden estricto del 1 al 5.*