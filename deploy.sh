#!/bin/bash

# Script de Despliegue Automático - Sistema Anti-Falsificación de Entradas
# Versión: 1.0
# Fecha: 2025-11-08

set -e  # Salir en caso de error

echo "🚀 Iniciando despliegue del Sistema Anti-Falsificación de Entradas"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función de logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar prerrequisitos
check_prerequisites() {
    log "Verificando prerrequisitos..."

    # Verificar comandos necesarios
    local commands=("composer" "npm" "php" "node")
    for cmd in "${commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error "Comando '$cmd' no encontrado. Instálalo primero."
            exit 1
        fi
    done

    # Verificar versiones mínimas
    local php_version=$(php -r "echo PHP_VERSION;")
    if [[ "$(printf '%s\n' "$php_version" "8.2.0" | sort -V | head -n1)" != "8.2.0" ]]; then
        error "PHP 8.2+ requerido. Versión actual: $php_version"
        exit 1
    fi

    log "Prerrequisitos verificados ✓"
}

# Backup de base de datos
backup_database() {
    log "Creando backup de base de datos..."

    if [ -f "backend/.env" ]; then
        cd backend

        # Generar nombre de backup con timestamp
        local backup_file="backup_$(date +'%Y%m%d_%H%M%S').sql"

        # Intentar backup con pg_dump si está disponible
        if command -v pg_dump &> /dev/null; then
            pg_dump --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USERNAME" --dbname="$DB_DATABASE" --file="../backups/$backup_file" --format=custom --compress=9 --no-password
            log "Backup creado: backups/$backup_file"
        else
            warning "pg_dump no disponible. Saltando backup automático."
        fi

        cd ..
    else
        warning "Archivo .env no encontrado. Saltando backup."
    fi
}

# Desplegar backend
deploy_backend() {
    log "Desplegando backend..."

    cd backend

    # Instalar dependencias
    log "Instalando dependencias PHP..."
    composer install --no-dev --optimize-autoloader --no-interaction

    # Verificar configuración
    if [ ! -f ".env" ]; then
        error "Archivo .env no encontrado en backend/"
        exit 1
    fi

    # Generar clave de aplicación si no existe
    if ! grep -q "APP_KEY=base64:" .env; then
        log "Generando clave de aplicación..."
        php artisan key:generate --no-interaction
    fi

    # Limpiar cachés
    log "Limpiando cachés..."
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    php artisan cache:clear

    # Ejecutar migraciones
    log "Ejecutando migraciones..."
    php artisan migrate --force --no-interaction

    # Cachear configuración para producción
    log "Cacheando configuración..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache

    # Instalar dependencias de desarrollo si es necesario
    if [ "$DEPLOY_ENV" = "development" ]; then
        log "Instalando dependencias de desarrollo..."
        composer install --no-interaction
    fi

    cd ..
    log "Backend desplegado ✓"
}

# Desplegar frontend
deploy_frontend() {
    log "Desplegando frontend..."

    cd frontend

    # Instalar dependencias
    log "Instalando dependencias Node.js..."
    npm ci --silent

    # Ejecutar tests si no es skip
    if [ "$SKIP_TESTS" != "true" ]; then
        log "Ejecutando tests..."
        npm run test -- --watchAll=false --passWithNoTests
    fi

    # Build de producción
    log "Construyendo aplicación..."
    npm run build

    # Verificar build exitoso
    if [ ! -d "dist" ]; then
        error "Build fallido - directorio dist no encontrado"
        exit 1
    fi

    cd ..
    log "Frontend desplegado ✓"
}

# Configurar servicios del sistema
setup_services() {
    log "Configurando servicios del sistema..."

    # Crear directorio de logs si no existe
    mkdir -p logs

    # Configurar permisos
    if [ -d "backend/storage" ]; then
        chmod -R 755 backend/storage
        chmod -R 755 backend/bootstrap/cache
    fi

    if [ -d "frontend/dist" ]; then
        chmod -R 755 frontend/dist
    fi

    log "Servicios configurados ✓"
}

# Ejecutar tests finales
run_final_tests() {
    if [ "$SKIP_TESTS" = "true" ]; then
        log "Tests saltados por configuración"
        return
    fi

    log "Ejecutando tests finales..."

    # Tests backend
    cd backend
    if [ -f "vendor/bin/phpunit" ]; then
        log "Ejecutando tests PHP..."
        ./vendor/bin/phpunit --configuration phpunit.xml --log-junit ../test-results/backend-junit.xml || {
            error "Tests backend fallidos"
            exit 1
        }
    fi
    cd ..

    # Tests frontend
    cd frontend
    log "Ejecutando tests JavaScript..."
    npm run test -- --watchAll=false --passWithNoTests --json --outputFile=../test-results/frontend-results.json || {
        error "Tests frontend fallidos"
        exit 1
    }
    cd ..

    log "Tests completados ✓"
}

# Función principal
main() {
    # Parsear argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env=*)
                DEPLOY_ENV="${1#*=}"
                shift
                ;;
            --skip-tests)
                SKIP_TESTS="true"
                shift
                ;;
            --skip-backup)
                SKIP_BACKUP="true"
                shift
                ;;
            --help)
                echo "Uso: $0 [opciones]"
                echo ""
                echo "Opciones:"
                echo "  --env=ENV          Entorno de despliegue (production|development|staging)"
                echo "  --skip-tests       Saltar ejecución de tests"
                echo "  --skip-backup      Saltar backup de base de datos"
                echo "  --help             Mostrar esta ayuda"
                exit 0
                ;;
            *)
                error "Opción desconocida: $1"
                exit 1
                ;;
        esac
    done

    # Valores por defecto
    DEPLOY_ENV=${DEPLOY_ENV:-"production"}
    SKIP_TESTS=${SKIP_TESTS:-"false"}
    SKIP_BACKUP=${SKIP_BACKUP:-"false"}

    log "Entorno de despliegue: $DEPLOY_ENV"
    log "Saltar tests: $SKIP_TESTS"
    log "Saltar backup: $SKIP_BACKUP"

    # Ejecutar pasos del despliegue
    check_prerequisites

    if [ "$SKIP_BACKUP" != "true" ]; then
        backup_database
    fi

    deploy_backend
    deploy_frontend
    setup_services
    run_final_tests

    log "🎉 Despliegue completado exitosamente!"
    log "Sistema disponible en: http://localhost:8000 (backend) y http://localhost:5173 (frontend)"
}

# Ejecutar función principal con todos los argumentos
main "$@"