-- Script de inicialización de Bases de Datos para Microservicios Donatón

CREATE DATABASE IF NOT EXISTS donaciones_db;
CREATE DATABASE IF NOT EXISTS logistica_db;
CREATE DATABASE IF NOT EXISTS necesidades_db;

CREATE USER IF NOT EXISTS 'donaton_user'@'%' IDENTIFIED BY 'donaton_password';
GRANT ALL PRIVILEGES ON donaciones_db.* TO 'donaton_user'@'%';
GRANT ALL PRIVILEGES ON logistica_db.* TO 'donaton_user'@'%';
GRANT ALL PRIVILEGES ON necesidades_db.* TO 'donaton_user'@'%';

FLUSH PRIVILEGES;