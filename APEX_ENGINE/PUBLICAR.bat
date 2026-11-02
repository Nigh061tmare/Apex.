@echo off
title APEX Engine - Publicar
cd /d "%~dp0"

echo ============================================================
echo   APEX ENGINE - Comprobar y publicar
echo ============================================================
echo.

echo [1/2] Validando roster, tests y build...
call npm run check
if errorlevel 1 (
    echo.
    echo [ERROR] Algo fallo. No se publica nada. Revisa los mensajes de arriba.
    pause
    exit /b 1
)

echo.
echo [2/2] Subiendo a GitHub (Vercel publica solo al recibir el push)...
cd ..
git -c safe.directory=* add APEX_ENGINE .github CLAUDE.md
set /p MSG="Describe el cambio (Enter = 'actualizar web'): "
if "%MSG%"=="" set "MSG=actualizar web"
git -c safe.directory=* commit -m "%MSG%"
git -c safe.directory=* push vercel-origin main
if errorlevel 1 (
    echo [ERROR] No se pudo subir a GitHub.
    pause
    exit /b 1
)

echo.
echo [OK] Subido. En 1-2 minutos estara en https://apex-engine-six.vercel.app
pause
