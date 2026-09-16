# vercel_health_check.ps1 — Health check post-despliegue de Apex Engine
# Verifica que la URL de produccion responde HTTP 200, con reintentos.
param(
  [string]$Url = "https://apex-engine-six.vercel.app",
  [int]$MaxRetries = 5,
  [int]$DelaySeconds = 6
)

$ok = $false
for ($i = 1; $i -le $MaxRetries; $i++) {
  try {
    $r = Invoke-WebRequest -Uri $Url -Method Head -UseBasicParsing -TimeoutSec 30
    Write-Output ("Attempt " + $i + " -> StatusCode: " + $r.StatusCode + " " + $r.StatusDescription)
    if ($r.StatusCode -eq 200) { $ok = $true; break }
  }
  catch {
    Write-Output ("Attempt " + $i + " -> ERROR: " + $_.Exception.Message)
  }
  if ($i -lt $MaxRetries) { Start-Sleep -Seconds $DelaySeconds }
}

if ($ok) {
  Write-Output "HEALTH_CHECK_PASS: servidor disponible con HTTP 200"
  exit 0
} else {
  Write-Output "HEALTH_CHECK_FAIL: el servidor no devolvio HTTP 200"
  exit 1
}