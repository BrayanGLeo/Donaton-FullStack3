# stop-all.ps1
Write-Host "Deteniendo todos los stacks de Donaton..." -ForegroundColor Cyan

$allStacks = @(
    "stacks/donaton-bff",
    "stacks/donaton-necesidades",
    "stacks/donaton-logistica",
    "stacks/donaton-donaciones",
    "stacks/donaton-auth",
    "stacks/api-gateway",
    "stacks/eureka-server",
    "stacks/mysql-necesidades",
    "stacks/mysql-logistica",
    "stacks/mysql-donaciones",
    "stacks/mysql-auth",
    "stacks/rabbitmq",
    "stacks/sonarqube"
)

foreach ($stack in $allStacks) {
    Write-Host " -> Deteniendo $stack..."
    Push-Location $stack
    docker-compose down
    Pop-Location
}

Write-Host "¡Todos los stacks han sido detenidos!" -ForegroundColor Green
