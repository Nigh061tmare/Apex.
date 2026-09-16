<#
.SYNOPSIS
    Inspeccion y analisis de archivos multimedia (Audio/Video/Imagenes).
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory=$true, Position=0)]
    [string]$FilePath,

    [Parameter(Mandatory=$false)]
    [switch]$Json
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $FilePath)) {
    Write-Error "El archivo no existe: $FilePath"
    exit 1
}

$fullPath = (Resolve-Path $FilePath).Path
$folderPath = Split-Path -Parent $fullPath
$fileName = Split-Path -Leaf $fullPath
$fileInfo = Get-Item $fullPath

$shell = New-Object -ComObject Shell.Application
$folder = $shell.Namespace($folderPath)
$file = $folder.ParseName($fileName)

$meta = [ordered]@{
    file_name     = $fileName
    full_path     = $fullPath
    size_bytes    = $fileInfo.Length
    size_readable = "$([math]::Round($fileInfo.Length / 1MB, 2)) MB"
    extension     = $fileInfo.Extension.ToLower()
    duration      = $folder.GetDetailsOf($file, 27)
    dimensions    = $folder.GetDetailsOf($file, 31)
    width         = $folder.GetDetailsOf($file, 162)
    height        = $folder.GetDetailsOf($file, 164)
    bitrate       = $folder.GetDetailsOf($file, 28)
    audio_channels= $folder.GetDetailsOf($file, 275)
    sample_rate   = $folder.GetDetailsOf($file, 276)
    frame_rate    = $folder.GetDetailsOf($file, 316)
}

[System.Runtime.Interopservices.Marshal]::ReleaseComObject($shell) | Out-Null

if ($Json) {
    [PSCustomObject]$meta | ConvertTo-Json -Compress
} else {
    Write-Host "[MEDIA_INFO] Metadatos Multimedia:" -ForegroundColor Cyan
    Write-Host "   Archivo: $($meta.file_name) ($($meta.size_readable))"
    if ($meta.duration) { Write-Host "   Duracion: $($meta.duration)" }
    if ($meta.dimensions) { Write-Host "   Dimensiones: $($meta.dimensions)" }
    if ($meta.bitrate) { Write-Host "   Bitrate: $($meta.bitrate)" }
    if ($meta.frame_rate) { Write-Host "   FPS: $($meta.frame_rate)" }
}
