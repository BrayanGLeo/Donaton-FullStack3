Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Iniciando Pruebas y Reporte de Cobertura Local (JaCoCo)" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

$microservices = @(
    "donaton-auth",
    "donaton-donaciones",
    "donaton-logistica",
    "donaton-necesidades",
    "donaton-bff",
    "donaton-api-gateway"
)

foreach ($ms in $microservices) {
    if (Test-Path "$ms\mvnw.cmd") {
        Write-Host "`n---> Procesando Microservicio: $ms <---" -ForegroundColor Yellow
        Push-Location $ms

        Write-Host "Ejecutando pruebas y generando reporte JaCoCo..." -ForegroundColor Green
        .\mvnw.cmd test jacoco:report

        $reportPath = "target\site\jacoco\index.html"
        if (Test-Path $reportPath) {
            Write-Host "✅ Reporte generado en: $ms\$reportPath" -ForegroundColor Cyan
        } else {
            Write-Host "⚠️ No se encontró reporte para $ms" -ForegroundColor Red
        }

        Pop-Location
    } else {
        Write-Host "`n---> Saltando $ms (No se encontró mvnw.cmd) <---" -ForegroundColor Red
    }
}

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "Pruebas locales completadas. Abre los archivos index.html en tu navegador para ver la cobertura." -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
