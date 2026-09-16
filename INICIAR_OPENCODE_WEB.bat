@echo off
title OpenCode Web - APEX Engine (MODO BLINDADO ANTI-CUOTA)
color 0A

rem Deteccion automatica de rutas de proyecto (Mini PC vs PC Principal)
if exist "D:\Vault Obsidian\apex-powerscaling-engine" (
    set "APEX_ACTIVE_PATH=D:\Vault Obsidian\apex-powerscaling-engine"
) else if exist "Z:\apex-powerscaling-engine" (
    set "APEX_ACTIVE_PATH=Z:\apex-powerscaling-engine"
) else if exist "C:\Users\Jose Luis\apex-powerscaling-engine" (
    set "APEX_ACTIVE_PATH=C:\Users\Jose Luis\apex-powerscaling-engine"
) else (
    set "APEX_ACTIVE_PATH=C:\Users\Jose Luis"
)

cd /d "%APEX_ACTIVE_PATH%"

echo ===============================================================================
echo     OPENCODE WEB - MODO BLINDADO ANTI-GASTO DE CUOTA v3.0
echo ===============================================================================
echo.
echo [1/3] Entorno activo: %APEX_ACTIVE_PATH%
echo [1/3] Verificando servidor en puerto 4096...

netstat -ano | findstr :4096 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [*] El servidor OpenCode ya esta corriendo activamente en el puerto 4096.
) else (
    echo [*] Arrancando servidor OpenCode Web (escuchando en 0.0.0.0:4096)...
    start /min "OpenCode-Web-Server" cmd /c "cd /d "%APEX_ACTIVE_PATH%" && opencode web --port 4096 --hostname 0.0.0.0"
    timeout /t 3 /nobreak >nul
)

echo.
echo ===============================================================================
echo   ENLACES DE ACCESO EN VIVO:
echo ===============================================================================
echo   - Local (este PC o Mini PC):       http://localhost:4096
echo   - Red Local (desde otro PC/movil): http://192.168.1.51:4096
echo   - Remoto (via Tailscale VPN):       http://100.100.160.124:4096
echo ===============================================================================
echo.
echo [2/3] AGENTES ACTIVOS Y BLINDADOS:
echo   - nemotron_super : NVIDIA Nemotron Super 120B Free [PREDETERMINADO - 0€ / 0 CUOTA]
echo   - dots3_note     : Dots3-Note Preview 280B Free [GRATIS - Razonamiento profundo]
echo   - build          : Nemotron Super 120B Free [GRATIS - Cero consumo de cuota]
echo   - deepseek_flash : DeepSeek V4 Flash (OpenCode Go) [UNICO MODELO DE CUOTA AUTORIZADO]
echo.
echo   [SEGURIDAD] Modelos caros (Kimi, Qwen Max, Grok, Luna, Pro) = ELIMINADOS DEL SISTEMA
echo.
echo [3/3] Abriendo interfaz en el navegador...
start http://localhost:4096

echo.
echo Puedes minimizar o dejar abierta esta consola. Presiona una tecla para salir.
pause >nul
