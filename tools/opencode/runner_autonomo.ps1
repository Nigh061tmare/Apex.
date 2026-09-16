param(
    [string]$Prompt = "",
    [int]$MaxIteraciones = 10,
    # Agentes por defecto = modelos GRATUITOS de OpenRouter (2 cuentas, conmutacion automatica)
    # NO usar oc_kimi / oc_deepseek_pro / oc_qwen_max / oc_grok: consumen cuota semanal de OpenCode Go
    [string]$AgentePrimario = "nemotron_super",
    [string]$AgenteAuditor = "reasoner_omni"
)

# 1. Deteccion automatica de entorno (Mini PC vs Este PC)
$ApexPath = if (Test-Path "D:\Vault Obsidian\apex-powerscaling-engine") {
    "D:\Vault Obsidian\apex-powerscaling-engine"
} elseif (Test-Path "Z:\apex-powerscaling-engine") {
    "Z:\apex-powerscaling-engine"
} elseif (Test-Path "$PSScriptRoot\..\..") {
    (Resolve-Path "$PSScriptRoot\..\..").Path
} else {
    $env:USERPROFILE
}

# 2. Directorio de logs resiliente
$LogDir = Join-Path $ApexPath "tools\opencode\logs"
if (-not (Test-Path $LogDir)) {
    New-Item -Path $LogDir -ItemType Directory -Force | Out-Null
}
$LogFile = Join-Path $LogDir "ejecucion_autonoma_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

function Log($msg) {
    $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$time] $msg"
    Write-Host $line
    Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

Log "==============================================================================="
Log "  INICIANDO EJECUCION AUTONOMA NON-STOP (OPENCODE MULTI-AGENTE)"
Log "==============================================================================="
Log "Entorno de trabajo detectado: $ApexPath"
Log "Agente de Ejecucion: $AgentePrimario"
Log "Agente de Auditoria: $AgenteAuditor"

# 🔒 BLOQUEO DURO DE SEGURIDAD ANTI-CUOTA OPENCODE GO
if ($AgentePrimario -match "deepseek|opencode-go" -or $AgenteAuditor -match "deepseek|opencode-go") {
    Log "❌ BLOQUEO DE SEGURIDAD ACTIVADO: Se intento usar un agente de cuota de OpenCode Go en un bucle autonomo."
    Log "Abortando de inmediato para proteger tu saldo semanal."
    exit 1
}

# 3. Resolucion de tarea activa
if ([string]::IsNullOrWhiteSpace($Prompt)) {
    $TareaCandidates = @(
        (Join-Path $ApexPath "tools\opencode\TAREA_ACTIVA.txt"),
        (Join-Path $ApexPath "TAREA_ACTIVA.txt"),
        "C:\Users\Jose Luis\opencode-tools\TAREA_ACTIVA.txt"
    )
    $TareaFile = $TareaCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($TareaFile) {
        $Prompt = Get-Content $TareaFile -Raw
        Log "Cargando tarea desde archivo: $TareaFile"
    } else {
        $Prompt = "Auditar el codigo en $ApexPath, verificar que no haya errores de sintaxis y verificar que npm run build compile al 100%."
    }
}

Log "Mision asignada: $Prompt"

# 4. Resolucion de comando OpenCode
$OpenCodeCmd = if (Get-Command "opencode" -ErrorAction SilentlyContinue) {
    "opencode"
} elseif (Test-Path "C:\Users\Jose Luis\AppData\Roaming\npm\opencode.cmd") {
    "C:\Users\Jose Luis\AppData\Roaming\npm\opencode.cmd"
} elseif (Test-Path "$env:APPDATA\npm\opencode.cmd") {
    "$env:APPDATA\npm\opencode.cmd"
} else {
    "npx opencode-ai"
}
Log "Comando OpenCode detectado: $OpenCodeCmd"

for ($i = 1; $i -le $MaxIteraciones; $i++) {
    Log "-------------------------------------------------------------------------------"
    Log ">>> ITERACION $i de ${MaxIteraciones} - Ejecutando con $AgentePrimario..."
    Log "-------------------------------------------------------------------------------"
    
    # Ejecutar agente de construccion/edicion
    $cmd = "$OpenCodeCmd run --agent $AgentePrimario `"$Prompt (Paso $i de $MaxIteraciones en $ApexPath). Respeta estrictamente APEX_RULES.md y las tablas anti-racionalizacion de agent-skills. Trabaja de forma autonoma y reporta estado.`""
    $res = cmd /c "cd /d `"$ApexPath`" && $cmd" 2>&1
    Add-Content -Path $LogFile -Value $res -Encoding UTF8

    Log ">>> Auditoria de calidad con $AgenteAuditor..."
    $auditCmd = "$OpenCodeCmd run --agent $AgenteAuditor `"Revisa el estado de la tarea en $ApexPath. Aplica rigor maximo anti-racionalizacion: si faltan tests o comprobaciones de consola/build, rechaza. Si todo esta completado con exito responde EXACTAMENTE 'MISION_COMPLETADA'. Si faltan detalles, lista que falta.`""
    $auditRes = cmd /c "cd /d `"$ApexPath`" && $auditCmd" 2>&1
    Add-Content -Path $LogFile -Value $auditRes -Encoding UTF8

    if ($auditRes -match "MISION_COMPLETADA") {
        Log "==============================================================================="
        Log "🎉 ¡MISION COMPLETADA CON EXITO EN LA ITERACION $i!"
        Log "==============================================================================="
        break
    } else {
        Log "Paso $i completado. Faltan detalles segun auditoria. Continuando bucle..."
        Start-Sleep -Seconds 3
    }
}

Log "Fin de sesion autonoma. Log completo guardado en: $LogFile"
