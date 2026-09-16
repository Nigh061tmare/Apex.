<#
.SYNOPSIS
    Grabacion de pantalla en rafaga rapida (3-5 segundos) para depuracion visual y animaciones.
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory=$false)]
    [int]$Frames = 10,

    [Parameter(Mandatory=$false)]
    [int]$IntervalMs = 300,

    [Parameter(Mandatory=$false)]
    [int]$MaxBursts = 3,

    [Parameter(Mandatory=$false)]
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$recordingsBase = "C:\Users\pepde\.config\opencode\cache\recordings"
if (-not (Test-Path $recordingsBase)) {
    New-Item -ItemType Directory -Path $recordingsBase -Force | Out-Null
}

$burstId = (Get-Date).ToString("yyyyMMdd_HHmmss")
$burstDir = Join-Path $recordingsBase "burst_$burstId"
New-Item -ItemType Directory -Path $burstDir -Force | Out-Null

$captureScript = "C:\Users\pepde\.config\opencode\tools\capture_screen.ps1"
$capturedFrames = @()

if (-not $Json) {
    Write-Host "[RECORDING] Grabando rafaga: $Frames frames cada ${IntervalMs}ms..." -ForegroundColor Cyan
}

for ($i = 1; $i -le $Frames; $i++) {
    $frameNum = $i.ToString("D2")
    $framePath = Join-Path $burstDir "frame_${frameNum}.png"
    
    $jsonOutput = & powershell -ExecutionPolicy Bypass -File $captureScript -OutPath $framePath -Json | ConvertFrom-Json
    
    if ($jsonOutput.success) {
        $capturedFrames += [PSCustomObject]@{
            index     = $i
            path      = $framePath
            size_kb   = [math]::Round($jsonOutput.size_bytes / 1KB, 1)
            timestamp = $jsonOutput.timestamp
        }
    }
    
    if ($i -lt $Frames) {
        Start-Sleep -Milliseconds $IntervalMs
    }
}

try {
    $bursts = Get-ChildItem -Path $recordingsBase -Directory | Sort-Object CreationTime -Descending
    if ($bursts.Count -gt $MaxBursts) {
        $bursts | Select-Object -Skip $MaxBursts | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    }
} catch {}

$summary = [PSCustomObject]@{
    success      = ($capturedFrames.Count -gt 0)
    burst_id     = $burstId
    directory    = $burstDir
    total_frames = $capturedFrames.Count
    interval_ms  = $IntervalMs
    frames       = $capturedFrames
}

if ($Json) {
    $summary | ConvertTo-Json -Depth 3 -Compress
} else {
    Write-Host "[RECORD_OK] Rafaga de pantalla completada:" -ForegroundColor Green
    Write-Host "   Directorio: $burstDir"
    Write-Host "   Frames capturados: $($capturedFrames.Count)/$Frames"
}
