param(
    [Parameter(Mandatory=$true)]
    [string]$SonarToken
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Iniciando Pruebas y Análisis en SonarQube para el Backend" -ForegroundColor Cyan
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

        Write-Host "1/2 Ejecutando pruebas unitarias (mvnw test)..." -ForegroundColor Green
        .\mvnw.cmd test

        Write-Host "2/2 Enviando análisis a SonarQube..." -ForegroundColor Green
        .\mvnw.cmd sonar:sonar `
            -Dsonar.projectKey=$ms `
            -Dsonar.projectName="$ms" `
            -Dsonar.host.url=http://localhost:9000 `
            -Dsonar.token=$SonarToken

        Pop-Location
    } else {
        Write-Host "`n---> Saltando $ms (No se encontró mvnw.cmd) <---" -ForegroundColor Red
    }
}

Write-Host "`n=======================================================" -ForegroundColor Cyan
Write-Host "Análisis masivo completado. Revisa http://localhost:9000" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
