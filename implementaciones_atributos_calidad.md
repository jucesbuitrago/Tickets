# Implementaciones de Atributos de Calidad en el Código

Este documento detalla cómo se implementan los atributos de calidad (seguridad, disponibilidad, mantenibilidad, rendimiento, usabilidad y portabilidad) en el código del proyecto de sistema de tickets para eventos.

## Seguridad

### Firmas Digitales para Verificación de Códigos QR
- **Implementación**: Se utiliza el servicio `HmacSignatureService` que implementa `SignatureServiceInterface`.
- **Ubicación**: `backend/app/Services/HmacSignatureService.php`
- **Funcionalidad**:
  - Genera firmas HMAC-SHA256 para payloads de QR.
  - Verifica firmas con clave actual y anterior para transición suave durante rotación.
  - Rotación automática de claves cada 24 horas.
- **Uso en el proyecto**: En `ScanTicketUseCase.php`, se verifica la firma del QR antes de procesar el ticket, previniendo falsificaciones.

### Sistema de Roles y Permisos
- **Implementación**: Middleware `RoleMiddleware` y paquete Spatie Permission.
- **Ubicación**:
  - `backend/app/Http/Middleware/RoleMiddleware.php`
  - `backend/config/permission.php`
- **Funcionalidad**:
  - Control de acceso basado en roles (admin, staff, graduate).
  - Permisos granulares con caché de 24 horas.
  - Middleware que verifica roles en rutas protegidas.
- **Uso en el proyecto**: Protege endpoints como creación de eventos, escaneo de tickets y administración de usuarios.

### Renovación Periódica de Claves
- **Implementación**: Método `rotateKey()` en `HmacSignatureService`.
- **Funcionalidad**:
  - Genera nuevas claves aleatorias de 256 bits.
  - Mantiene clave anterior por 48 horas para compatibilidad.
  - Almacena claves en caché con expiración automática.
- **Uso en el proyecto**: Asegura que las firmas QR no sean vulnerables a ataques de largo plazo.

### Pruebas de Seguridad
- **Implementación**: Suite de pruebas unitarias en `HmacSignatureServiceTest.php`.
- **Ubicación**: `backend/tests/Unit/Services/HmacSignatureServiceTest.php`
- **Funcionalidad**:
  - Pruebas de verificación de firmas válidas/inválidas.
  - Pruebas de rotación de claves y compatibilidad.
  - Validación de algoritmos HMAC.
- **Uso en el proyecto**: Confirma protección contra ataques de manipulación de QR y claves comprometidas.

## Disponibilidad

### Colas para Manejo de Picos de Uso
- **Implementación**: Configuración de colas Laravel con múltiples drivers.
- **Ubicación**: `backend/config/queue.php`
- **Funcionalidad**:
  - Soporte para database, Redis, SQS, Beanstalkd.
  - Reintentos automáticos con `retry_after` de 90 segundos.
  - Procesamiento asíncrono de tareas pesadas.
- **Uso en el proyecto**: Maneja importación masiva de graduados y envío de invitaciones sin bloquear la UI.

### Sistema de Caché
- **Implementación**: Múltiples stores de caché configurados.
- **Ubicación**: `backend/config/cache.php`
- **Funcionalidad**:
  - Soporte para Redis, Memcached, database, file.
  - Prefijo automático para evitar colisiones.
  - Caché de permisos y datos frecuentes.
- **Uso en el proyecto**: Almacena claves HMAC y acelera consultas repetidas de eventos/auditorios.

### Reintentos Automáticos
- **Implementación**: Configuración de colas con reintentos y healthchecks en Docker.
- **Ubicación**:
  - `infra/docker-compose.prod.yml` (healthchecks)
  - `backend/config/queue.php` (retry_after)
- **Funcionalidad**:
  - Reintentos de jobs fallidos hasta 3 veces.
  - Healthchecks cada 30 segundos para servicios.
  - Reinicio automático de contenedores caídos.
- **Uso en el proyecto**: Asegura que el procesamiento de tickets continúe durante fallos temporales.

### Meta de 99.9% Uptime
- **Implementación**: Docker Compose con reinicio automático y healthchecks.
- **Ubicación**: `infra/docker-compose.prod.yml`
- **Funcionalidad**:
  - `restart: unless-stopped` para todos los servicios.
  - Healthchecks para PostgreSQL y backend.
  - Dependencias condicionales entre servicios.
- **Uso en el proyecto**: Mantiene el sistema operativo durante reinicios del servidor o fallos menores.

## Mantenibilidad

### Arquitectura en Capas
- **Implementación**: Separación clara en Entities, UseCases, Infrastructure, Interfaces.
- **Ubicación**: `backend/app/` (estructura de directorios)
- **Funcionalidad**:
  - Entities: Modelos de dominio puros.
  - UseCases: Lógica de negocio.
  - Infrastructure: Implementaciones concretas (repositorios Eloquent).
  - Interfaces: Contratos para inyección de dependencias.
- **Uso en el proyecto**: Facilita cambios en base de datos o servicios externos sin afectar lógica de negocio.

### Inyección de Dependencias
- **Implementación**: Bindings en `AppServiceProvider`.
- **Ubicación**: `backend/app/Providers/AppServiceProvider.php`
- **Funcionalidad**:
  - Interfaces ligadas a implementaciones concretas.
  - Fácil reemplazo de servicios (ej: cambiar de PostgreSQL a MySQL).
  - Constructor injection en UseCases.
- **Uso en el proyecto**: Permite actualizar base de datos cambiando solo el repositorio Eloquent por otro.

## Rendimiento

### Optimizaciones en Consultas e Índices
- **Implementación**: Índices únicos en campos críticos.
- **Ubicación**: `backend/database/migrations/2025_11_08_060005_create_tickets_table.php`
- **Funcionalidad**:
  - Índice único en `nonce` para búsquedas rápidas.
  - Foreign keys con constraints para integridad.
- **Uso en el proyecto**: Acelera verificación de tickets por nonce en `ScanTicketUseCase`.

### Caché de Base de Datos
- **Implementación**: Cache facade en servicios.
- **Ubicación**: `backend/app/Services/HmacSignatureService.php`
- **Funcionalidad**:
  - Almacena claves HMAC en Redis/file cache.
  - Expiración automática de claves.
- **Uso en el proyecto**: Reduce tiempo de verificación de firmas reutilizando claves.

### Validación QR <150ms
- **Implementación**: Pruebas de carga con K6.
- **Ubicación**: `load-test.js`
- **Funcionalidad**:
  - Threshold de 150ms para 95% de requests.
  - Simulación de 200 usuarios concurrentes.
  - Validación de tiempos de respuesta.
- **Uso en el proyecto**: Confirma que el escaneo de QR es lo suficientemente rápido para eventos masivos.

## Usabilidad

### Interfaz Responsive
- **Implementación**: Tailwind CSS con breakpoints.
- **Ubicación**: `frontend/tailwind.config.js`
- **Funcionalidad**:
  - Container padding responsive (2rem a 10rem).
  - Font sizes escalables.
  - Colores de marca personalizados.
- **Uso en el proyecto**: Asegura que la app funcione en móviles, tablets y desktop.

### Mensajes Claros y Diseño Simple
- **Implementación**: Componentes UI reutilizables.
- **Ubicación**: `frontend/src/components/ui/`
- **Funcionalidad**:
  - Componentes como `Button`, `Card`, `Input` estandarizados.
  - Estados de loading y error claros.
  - Navegación intuitiva entre páginas.
- **Uso en el proyecto**: Facilita uso por usuarios no técnicos en creación de eventos e importación de graduados.

### Pruebas de Usabilidad
- **Implementación**: Pruebas E2E con Playwright.
- **Ubicación**: `frontend/tests/e2e/`
- **Funcionalidad**:
  - Validación de flujos completos (login, QR scanning).
  - Verificación de mensajes de error.
  - Pruebas de accesibilidad.
- **Uso en el proyecto**: Confirma que la interfaz evita confusiones y maneja errores gracefully.

## Portabilidad

### Contenedores Docker
- **Implementación**: Dockerfiles y Docker Compose.
- **Ubicación**:
  - `backend/Dockerfile.prod`
  - `frontend/Dockerfile.prod`
  - `infra/docker-compose.prod.yml`
- **Funcionalidad**:
  - Imágenes Alpine ligeras.
  - Configuración de Nginx + PHP-FPM.
  - Volúmenes para persistencia de datos.
- **Uso en el proyecto**: Permite despliegue en cualquier entorno con Docker (AWS, GCP, on-premise).

### Configuraciones Flexibles
- **Implementación**: Variables de entorno para todos los servicios.
- **Ubicación**: Archivos `.env.example` y configuraciones en `config/`
- **Funcionalidad**:
  - Conexiones de BD configurables (PostgreSQL, MySQL).
  - Caché y colas intercambiables.
  - Secrets externalizados.
- **Uso en el proyecto**: Facilita migración entre entornos de desarrollo, staging y producción sin cambios en código.