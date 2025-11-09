# Sistema Anti-Falsificación de Entradas Universitarias

Sistema completo para control de acceso a auditorios universitarios con QR firmado y verificación antifraude.

## Arquitectura

- **Backend**: Laravel 10+ con Clean Architecture
- **Frontend**: React 18+ + Vite + TypeScript
- **Base de Datos**: MySQL/PostgreSQL
- **Cache/Queue**: Redis
- **Autenticación**: JWT con expiración corta
- **Seguridad**: Firma HMAC-SHA256 con rotación de claves

## Estructura del Proyecto

```
calidad/
├── backend/          # Laravel API
├── frontend/         # React PWA
├── infra/            # Docker, configs
├── docs/             # Documentación completa
└── README.md
```

## Instalación y Configuración

### Prerrequisitos
- **PHP**: 8.2+
- **Composer**: 2.x
- **Node.js**: 18+
- **npm**: 9+
- **PostgreSQL**: 13+
- **Redis**: 6+
- **Git**

### Instalación Completa

#### 1. Clonar Repositorio
```bash
git clone <repository-url>
cd calidad
```

#### 2. Backend Setup
```bash
cd backend

# Instalar dependencias PHP
composer install

# Configurar entorno
cp .env.example .env
php artisan key:generate

# Configurar base de datos
# Editar .env con credenciales PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tickets
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Generar clave JWT
php artisan jwt:secret

# Ejecutar migraciones
php artisan migrate

# (Opcional) Seed de datos de prueba
php artisan db:seed
```

#### 3. Frontend Setup
```bash
cd ../frontend

# Instalar dependencias
npm install

# Configurar entorno (si es necesario)
cp .env.example .env
```

#### 4. Servicios Externos
```bash
# Iniciar PostgreSQL y Redis
# Usando Docker (recomendado para desarrollo)
docker run --name postgres-tickets -e POSTGRES_DB=tickets -e POSTGRES_PASSWORD=your_password -p 5432:5432 -d postgres:13
docker run --name redis-tickets -p 6379:6379 -d redis:6

# O instalar localmente
# PostgreSQL: https://www.postgresql.org/download/
# Redis: https://redis.io/download
```

### Configuración de Variables de Entorno

#### Backend (.env)
```env
# Base de datos
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tickets
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Cache y Queue
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# JWT y Seguridad
JWT_SECRET=your_jwt_secret_here
HMAC_SECRET_KEY=your_hmac_secret_key
QR_ROTATION_HOURS=24
QR_VALIDITY_HOURS=24

# Mail (opcional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_ENV=development
```

### Ejecución del Sistema

#### Desarrollo
```bash
# Terminal 1: Backend
cd backend
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Queue Worker (opcional)
cd backend
php artisan queue:work
```

#### Producción
```bash
# Backend
cd backend
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan serve --host=0.0.0.0 --port=8000

# Frontend
cd frontend
npm run build
npm run preview
# O servir con nginx/apache
```

### Verificación de Instalación

#### Backend
```bash
cd backend
php artisan tinker

# Verificar conexión DB
DB::connection()->getPdo();

# Verificar JWT
echo config('jwt.secret');
```

#### Frontend
```bash
cd frontend
npm run test
npm run build
```

### Troubleshooting

#### Error de Conexión DB
- Verificar credenciales en `.env`
- Asegurar que PostgreSQL esté ejecutándose
- Revisar logs: `tail -f storage/logs/laravel.log`

#### Error de Dependencias
```bash
# Backend
composer update
composer dump-autoload

# Frontend
rm -rf node_modules package-lock.json
npm install
```

#### Problemas de Permisos
```bash
# Backend
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

## Endpoints Principales

- `POST /api/admin/import-graduates` - Importar Excel
- `POST /api/auth/login` - Login graduando
- `POST /api/graduate/invitations` - Crear invitación
- `POST /api/scan/validate` - Validar QR
- `GET /api/admin/dashboard/aforo` - Dashboard

## Despliegue

### Scripts de Despliegue

#### Despliegue Automático (Recomendado)
```bash
# Script de despliegue completo
./deploy.sh

# O manualmente:
# 1. Backend
cd backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

# 2. Frontend
cd ../frontend
npm ci
npm run build

# 3. Reiniciar servicios
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
sudo systemctl restart redis-server
```

#### Docker Deployment
```bash
# Construir imágenes
docker-compose -f infra/docker-compose.prod.yml build

# Desplegar
docker-compose -f infra/docker-compose.prod.yml up -d

# Verificar
docker-compose -f infra/docker-compose.prod.yml ps
```

#### Configuración Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/calidad/frontend/dist;
    index index.html;

    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Monitoreo y Mantenimiento

#### Comandos de Monitoreo
```bash
# Backend
cd backend
php artisan tinker

# Verificar conexiones DB
DB::select('SELECT version()');

# Verificar cache
Cache::store('redis')->get('test_key');

# Ver logs
tail -f storage/logs/laravel.log

# Métricas de rendimiento
php artisan tinker
app(\App\Services\PerformanceMonitor::class)->getMetrics();
```

#### Limpieza y Mantenimiento
```bash
# Limpiar cachés
cd backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Limpiar logs antiguos
find storage/logs -name "*.log" -type f -mtime +30 -delete

# Optimizar base de datos
php artisan db:monitor
```

## Documentación

- [Arquitectura y 4+1](docs/arquitectura.md)
- [Estimación PF](docs/estimacion_pf.md)
- [Métricas de Calidad](docs/metricas_calidad.md)
- [Plan de Pruebas](docs/plan_pruebas.md)
- [Presentación Final](docs/presentacion_final.md)

## Características Clave

- ✅ QR con firma HMAC no clonable
- ✅ Control de cupos por graduando
- ✅ Check-in idempotente anti-replay
- ✅ Dashboard en tiempo real
- ✅ PWA para lectores offline
- ✅ Auditoría completa de accesos

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Login de graduando/admin
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Administración
- `POST /api/admin/import-graduates` - Importar Excel de graduandos
- `GET /api/admin/dashboard/aforo` - Dashboard de ocupación
- `POST /api/admin/events` - Crear evento y auditorio
- `GET /api/admin/events/{id}/invitations` - Lista de invitaciones

### Graduando
- `GET /api/graduate/profile` - Perfil del graduando
- `GET /api/graduate/invitations` - Lista de invitaciones
- `POST /api/graduate/invitations` - Crear invitación
- `GET /api/graduate/tickets/{id}/qr` - Obtener QR

### Escaneo
- `POST /api/scan/validate` - Validar QR en puerta
- `GET /api/scan/history` - Historial de escaneos (staff)

## Testing

### Ejecutar Tests
```bash
# Backend
cd backend
./vendor/bin/phpunit
# Con cobertura
./vendor/bin/phpunit --coverage-html reports/coverage

# Frontend
cd frontend
npm test
npm run test:e2e  # Playwright
```

### Métricas de Calidad
```bash
# Backend
./vendor/bin/phpmd app text codesize,unusedcode,naming
./vendor/bin/phpstan analyse
./vendor/bin/phpcpd app/
./vendor/bin/phploc app/

# Frontend
npm run test -- --coverage
npx playwright show-report
```

## Seguridad

### Configuración de Seguridad
- JWT con expiración de 15 minutos
- Firma HMAC-SHA256 con rotación cada 24h
- Rate limiting: 10 req/min por dispositivo
- CORS configurado para orígenes específicos
- Headers de seguridad (CSP, HSTS, etc.)

### Auditoría
- Todos los escaneos se registran con timestamp, device_id, resultado
- Logs de autenticación y cambios críticos
- Backup automático de base de datos

## Criterios de Aceptación

- Importar Excel: Resumen creado/actualizado/errores
- Graduando: Crear ≤N invitaciones, ver QR
- Lector: Validar QR válido, rechazar duplicados <150ms p95
- Dashboard: Aforo en tiempo real

## Supuestos

- Excel formato: nombre_completo, correo, identificacion_opcional, cupos_permitidos
- Password temporal expira en 24h
- Evento máximo 1000 asistentes
- Conectividad intermitente manejada por PWA

## Riesgos

- Escalabilidad picos: Mitigado con caché + colas
- Fraude avanzado: Firma HMAC + nonce + rotación
- Caídas: Reintentos + transacciones

## Equipo

- Arquitecto: Clean Architecture + Puertos/Adaptadores
- Backend: Laravel + PHPUnit
- Frontend: React + Jest + Playwright
- QA: Cobertura 85%+, métricas CI

## Métricas

- PF Ajustados: 392
- Esfuerzo: ~47 persona-meses
- Cobertura: ≥85% core
- Rendimiento: <150ms p95 validación QR