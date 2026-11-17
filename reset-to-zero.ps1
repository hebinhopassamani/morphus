$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " MORPHUS - RESET PARA O PONTO ZERO (0 USUARIOS / SEEDS LIMPOS)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "Executando recriacao completa do schema public, novas tabelas e seeds iniciais..." -ForegroundColor Yellow
$tempOut = Join-Path $env:TEMP ("mpx-point-zero-runner-" + [Guid]::NewGuid().ToString("N").Substring(0, 6))
$projectPath = Join-Path $PSScriptRoot "mpx-backend\Mpx.Api\Mpx.Api.csproj"
$apiWorkDir = Join-Path $PSScriptRoot "mpx-backend\Mpx.Api"

dotnet build $projectPath -o $tempOut --nologo -v q
if ($LASTEXITCODE -ne 0) {
  throw "Falha ao compilar o runner do Ponto Zero."
}

$env:RESET_MORPHUS_DB = "true"
$env:RESET_MORPHUS_DB_EXIT = "true"
Push-Location $apiWorkDir
try {
  & (Join-Path $tempOut "Mpx.Api.exe")
} finally {
  Pop-Location
  Remove-Item Env:\RESET_MORPHUS_DB -ErrorAction SilentlyContinue
  Remove-Item Env:\RESET_MORPHUS_DB_EXIT -ErrorAction SilentlyContinue
  Remove-Item $tempOut -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "[OK] Banco de dados resetado para o Ponto Zero com sucesso (0 usuarios, seeds limpos)!" -ForegroundColor Green
