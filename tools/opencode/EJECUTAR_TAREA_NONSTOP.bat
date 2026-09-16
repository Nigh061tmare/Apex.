@echo off
title OpenCode Non-Stop Autonomous Task Runner [OPENROUTER FREE]
color 0A
cd /d "%~dp0"

echo ===============================================================================
echo     OPENCODE - EJECUTOR DE TAREAS AUTONOMAS EN BUCLE (NON-STOP)
echo     Modelos: OpenRouter GRATIS (2 cuentas con conmutacion automatica)
echo     Agente Principal : nemotron_super  (Nemotron 120B Free)
echo     Agente Auditor   : reasoner_omni   (Nemotron Omni Reasoning Free)
echo ===============================================================================
echo.
echo Puedes escribir tu tarea ahora, o presionar ENTER para usar TAREA_ACTIVA.txt:
set /p USER_TASK="Escribe la mision (o presiona ENTER): "

echo.
echo Iniciando bucle autonomo supervisado con modelos GRATUITOS de OpenRouter...
powershell -NoProfile -ExecutionPolicy Bypass -File "runner_autonomo.ps1" -Prompt "%USER_TASK%" -AgentePrimario "nemotron_super" -AgenteAuditor "reasoner_omni"

echo.
echo ===============================================================================
echo   EJECUCION FINALIZADA. Revisa los logs en tools\opencode\logs\
echo ===============================================================================
pause
