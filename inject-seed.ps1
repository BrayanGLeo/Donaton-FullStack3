Write-Host "Iniciando proceso de inyección de datos semilla..." -ForegroundColor Cyan

Write-Host "`n1. Limpiando bases de datos actuales..." -ForegroundColor Yellow
docker exec donaton-mysql-auth mysql -uroot -proot_password_123 -e "DROP DATABASE IF EXISTS donaton_db; CREATE DATABASE donaton_db;"
docker exec donaton-mysql-donaciones mysql -uroot -proot_password_123 -e "DROP DATABASE IF EXISTS donaciones_db; CREATE DATABASE donaciones_db;"
docker exec donaton-mysql-logistica mysql -uroot -proot_password_123 -e "DROP DATABASE IF EXISTS logistica_db; CREATE DATABASE logistica_db;"
docker exec donaton-mysql-necesidades mysql -uroot -proot_password_123 -e "DROP DATABASE IF EXISTS necesidades_db; CREATE DATABASE necesidades_db;"

Write-Host "`n2. Reiniciando microservicios para regenerar estructura de tablas (esperando 25s)..." -ForegroundColor Yellow
docker restart donaton-auth donaton-donaciones donaton-necesidades donaton-logistica
Start-Sleep -Seconds 25

Write-Host "`n3. Generando y dividiendo scripts SQL (Python)..." -ForegroundColor Yellow
Set-Location -Path db-init
python generate_seed.py
python split_seed.py
Set-Location -Path ..

Write-Host "`n4. Limpiando datos de inicialización de Spring Boot (Auth)..." -ForegroundColor Yellow
docker exec donaton-mysql-auth mysql -uroot -proot_password_123 donaton_db -e "SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE usuarios; SET FOREIGN_KEY_CHECKS=1;"

Write-Host "`n5. Inyectando datos semilla en las bases de datos..." -ForegroundColor Yellow
# Usamos cmd.exe para evitar que PowerShell parsee las contraseñas bcrypt ($2a$10...) como variables
cmd.exe /c "docker exec -i donaton-mysql-auth mysql -uroot -proot_password_123 donaton_db < db-init\seed_donaton_db.sql"
cmd.exe /c "docker exec -i donaton-mysql-donaciones mysql -uroot -proot_password_123 donaciones_db < db-init\seed_donaciones_db.sql"
cmd.exe /c "docker exec -i donaton-mysql-necesidades mysql -uroot -proot_password_123 necesidades_db < db-init\seed_necesidades_db.sql"

Write-Host "`n¡Inyección completada con éxito! Todos los usuarios tienen la contraseña 'admin123'." -ForegroundColor Green
