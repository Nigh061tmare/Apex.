@echo off
chcp 65001 > nul
cls
echo ================================================================
echo   🛡️ APEX POWER SCALING — VALIDADOR CANÓNICO V25 [READ-ONLY]
echo ================================================================
echo.
echo Ejecutando validación integral canónica sobre V25 (756 activos / 13 archivados)...
node src/scripts/rosterCanonicalValidator.js --v25 --read-only
echo.
pause
