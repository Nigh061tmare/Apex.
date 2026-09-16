@echo off
setlocal
title DESPLEGAR APEX ENGINE -> VERCEL (TODO EN UNO)
color 0B
cd /d "%~dp0"

echo ========================================================
echo   DESPLEGANDO APEX ENGINE -> VERCEL (PRODUCCION)
echo   Ciclo completo automatico:
echo   1) Validar roster canonico   2) Build de produccion
echo   3) Git commit + push         4) Deploy a Vercel
echo   5) Health check HTTP 200
echo ========================================================
echo.

REM ============================================================
REM [1/5] VALIDACION CANONICA (obligatoria antes de desplegar)
REM ============================================================
echo [1/5] Ejecutando validador canonico V26...
node src/scripts/rosterCanonicalValidatorV26.js > "%TEMP%\apex_validator_out.txt" 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Fallo al ejecutar el validador. Detalle:
    type "%TEMP%\apex_validator_out.txt"
    echo.
    pause
    exit /b 1
)
findstr /C:"RESULTADO GLOBAL" "%TEMP%\apex_validator_out.txt" >nul
if errorlevel 1 (
    echo.
    echo [ERROR] El validador no emitio resultado global. Detalle:
    type "%TEMP%\apex_validator_out.txt"
    echo.
    pause
    exit /b 1
)
findstr /C:"FAIL" "%TEMP%\apex_validator_out.txt" >nul
if not errorlevel 1 (
    echo.
    echo [ERROR] El roster NO esta 100%% canonico (se detectaron FAILs). Detalle:
    findstr /C:"FAIL" "%TEMP%\apex_validator_out.txt"
    type "%TEMP%\apex_validator_out.txt"
    echo.
    pause
    exit /b 1
)
findstr /C:"PASS" "%TEMP%\apex_validator_out.txt" >nul
if errorlevel 1 (
    echo.
    echo [ERROR] El roster NO esta 100%% canonico (sin PASS). Detalle:
    type "%TEMP%\apex_validator_out.txt"
    echo.
    pause
    exit /b 1
)
echo [OK] Roster validado: 100%% canonico (V26)
echo.

REM ============================================================
REM [2/5] BUILD DE PRODUCCION
REM ============================================================
echo [2/5] Compilando build de produccion...
call npm run build 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] El build fallo. Revisa los errores de Vite.
    echo.
    pause
    exit /b 1
)
echo [OK] Build de produccion completado sin errores.
echo.

REM ============================================================
REM [3/5] GIT COMMIT + PUSH
REM ============================================================
echo [3/5] Sincronizando cambios a GitHub...
git add .
git commit -m "feat: roster V26 final - names limpiados, 17 outliers reescalados, 19 multipliers alineados, numericStats sincronizado"
if errorlevel 1 (
    echo [AVISO] Commit no generado (posiblemente sin cambios nuevos). Continuando...
) else (
    echo [OK] Commit creado.
)
git push origin main
if errorlevel 1 (
    echo.
    echo [AVISO] Push a GitHub omitido (credenciales o sin cambios remotos). Continuando directamente a Vercel...
) else (
    echo [OK] Push a GitHub completado.
)
echo.

REM ============================================================
REM [4/5] DESPLIEGUE A VERCEL (PRODUCCION)
REM ============================================================
echo [4/5] Desplegando a Vercel (produccion)...

set "TOKEN="
for /f "delims=" %%i in ('node -e "const fs=require('fs'); if(fs.existsSync('.env.local')){ const m=fs.readFileSync('.env.local','utf8').match(/^VERCEL_TOKEN=(.*)$/m); if(m) console.log(m[1].trim()); }"') do set "TOKEN=%%i"
if "%TOKEN%"=="" if not "%VERCEL_TOKEN%"=="" set "TOKEN=%VERCEL_TOKEN%"

if not "%TOKEN%"=="" (
    echo [INFO] Usando token Vercel de .env.local / entorno.
    call npx vercel --prod --yes --token %TOKEN%
) else (
    echo [INFO] Sin token en .env.local. Se usara la sesion Vercel activa.
    call npx vercel --prod --yes
)
if errorlevel 1 (
    echo.
    echo [ERROR] Fallo el despliegue a Vercel.
    echo.
    pause
    exit /b 1
)
echo [OK] Despliegue a Vercel completado.
echo.

REM ============================================================
REM [5/5] HEALTH CHECK POST-DESPLIEGUE
REM ============================================================
echo [5/5] Verificando https://apex-engine-six.vercel.app (con reintentos)...
powershell -NoProfile -ExecutionPolicy Bypass -File ".\vercel_health_check.ps1"
if errorlevel 1 (
    echo.
    echo [AVISO] Health check no confirmo HTTP 200. Revisa manualmente.
    echo.
    pause
    exit /b 1
)
echo [OK] Health check superado: HTTP 200.
echo.

REM ============================================================
REM LIMPIEZA + RESUMEN FINAL
REM ============================================================
del "%TEMP%\apex_validator_out.txt" 2>nul

echo ========================================================
echo   DESPLIEGUE COMPLETADO CON EXITO
echo   Produccion : https://apex-engine-six.vercel.app/
echo   Local      : START_APEX_ENGINE.bat  (backend 3001 + frontend 5173)
echo ========================================================
echo.
pause
endlocal