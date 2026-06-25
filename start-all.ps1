# start-all.ps1
Write-Host "Iniciando todos los stacks de Donaton..." -ForegroundColor Cyan

# 1. Crear la red externa si no existe
Write-Host "1. Verificando/Creando red externa 'donaton-network'..."
$networkExists = docker network ls --format '{{.Name}}' | Select-String -Pattern '^donaton-network$'
if (-not $networkExists) {
    docker network create donaton-network
    Write-Host "Red creada." -ForegroundColor Green
} else {
    Write-Host "La red ya existe." -ForegroundColor Yellow
}

# 2. Levantar Infraestructura y Bases de Datos
Write-Host "2. Levantando Infraestructura y Bases de Datos..."
$infraStacks = @(
    "stacks/sonarqube",
    "stacks/rabbitmq",
    "stacks/mysql-auth",
    "stacks/mysql-donaciones",
    "stacks/mysql-logistica",
    "stacks/mysql-necesidades",
    "stacks/eureka-server",
    "stacks/api-gateway"
)

foreach ($stack in $infraStacks) {
    Write-Host " -> Levantando $stack..."
    Push-Location $stack
    docker-compose up -d
    Pop-Location
}

# 3. Esperar a que la infraestructura esté lista (especialmente Eureka y MySQL)
Write-Host "Esperando 30 segundos para que las bases de datos y Eureka se inicialicen..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 4. Levantar Microservicios
Write-Host "3. Levantando Microservicios..."
$microStacks = @(
    "stacks/donaton-auth",
    "stacks/donaton-donaciones",
    "stacks/donaton-logistica",
    "stacks/donaton-necesidades",
    "stacks/donaton-bff"
)

foreach ($stack in $microStacks) {
    Write-Host " -> Levantando $stack..."
    Push-Location $stack
    docker-compose up -d --build
    Pop-Location
}

Write-Host "¡Todos los stacks han sido iniciados!" -ForegroundColor Green
Write-Host "Puedes revisar el estado en Docker Desktop o con 'docker ps'."
