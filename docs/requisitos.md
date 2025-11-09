# Especificación de Requisitos Funcionales y No Funcionales

## Requisitos Funcionales (RF)

### RF1: Importación Masiva de Graduandos desde Excel
**Descripción**: El administrador debe poder importar graduandos desde un archivo Excel con columnas {user_id, cupos_permitidos}.
**Precondiciones**: Usuario autenticado con rol ADMIN.
**Postcondiciones**: Graduandos creados en BD, cupos asignados, errores reportados.
**Reglas de Negocio**:
- user_id debe existir en tabla users
- cupos_permitidos ≥ 0
- Procesamiento transaccional por lotes
- Validación de formato Excel
**Excepciones**: Archivo inválido, datos malformados, duplicados.

### RF2: Autenticación Dinámica con Contraseña Temporal
**Descripción**: Sistema genera contraseña temporal al importar graduandos, expira en 24 horas.
**Precondiciones**: Graduando importado exitosamente.
**Postcondiciones**: Email enviado, usuario puede hacer primer login.
**Reglas de Negocio**:
- Contraseña de 12 caracteres alfanuméricos
- Expira automáticamente después de 24 horas
- Primer login requiere cambio obligatorio
- Logs de acceso auditados
**Excepciones**: Email no entregado, usuario ya registrado.

### RF3: Portal Graduando - Gestión de Invitaciones
**Descripción**: Graduando puede crear invitaciones dentro de su cupo disponible.
**Precondiciones**: Usuario autenticado con rol GRADUANDO, cupos disponibles.
**Postcondiciones**: Invitación creada, cupos decrementados, QR generado.
**Reglas de Negocio**:
- Validación de cupos disponibles antes de crear
- Una invitación por evento por graduando
- Estado inicial: CREATED
- QR generado con firma HMAC
**Excepciones**: Sin cupos disponibles, evento no activo.

### RF4: Validación QR en Puerta con Check-in Idempotente
**Descripción**: Staff/Admin escanea QR, sistema valida firma y marca check-in único.
**Precondiciones**: QR válido, dispositivo autorizado.
**Postcondiciones**: Ticket marcado como usado, registro de scan creado.
**Reglas de Negocio**:
- Validación firma HMAC-SHA256
- Ticket único uso (estado cambia a USADO)
- Transacción atómica para consistencia
- Rate limiting: 10 validaciones/min por dispositivo
- Nonce único previene ataques replay
**Excepciones**: Firma inválida, ticket ya usado, revocado, expirado.

### RF5: Dashboard Administración con Métricas en Tiempo Real
**Descripción**: Admin ve métricas de ocupación por evento/auditorio en tiempo real.
**Precondiciones**: Usuario autenticado con rol ADMIN.
**Postcondiciones**: Datos actualizados cada 30 segundos.
**Reglas de Negocio**:
- Ocupación = tickets usados / capacidad auditorio
- Alertas cuando >90% capacidad
- Filtros por evento y fecha
- Métricas históricas disponibles
**Excepciones**: Sin eventos activos, datos no disponibles.

### RF6: Auditoría Completa de Acciones
**Descripción**: Todas las acciones críticas se registran con timestamp y usuario.
**Precondiciones**: Usuario autenticado.
**Postcondiciones**: Log creado en tabla audit_logs.
**Reglas de Negocio**:
- Acciones: login, crear invitación, escanear QR, revocar ticket
- Datos: user_id, action, resource_id, timestamp, ip_address
- Retención: 2 años mínimo
- Acceso solo para ADMIN
**Excepciones**: Fallo en escritura de log (no bloquea operación principal).

## Requisitos No Funcionales (RNF)

### Rendimiento
- **RNF1**: Validación QR <150ms p95 bajo carga de 200 req/s
- **RNF2**: Importación Excel <30s para 1000 registros
- **RNF3**: Dashboard carga <2s con datos históricos
- **RNF4**: API responde <500ms p95 en condiciones normales

### Disponibilidad
- **RNF5**: 99.9% uptime SLA para API core
- **RNF6**: PWA funciona offline para escaneos (sincronización posterior)
- **RNF7**: Recuperación automática de fallos en <5 minutos

### Seguridad
- **RNF8**: Firma HMAC-SHA256 con rotación de claves cada 24h
- **RNF9**: JWT expiración máxima 1 hora
- **RNF10**: Encriptación AES-256 para datos sensibles
- **RNF11**: Rate limiting: 10 req/min por IP/dispositivo
- **RNF12**: Auditoría completa OWASP Top 10 mitigada

### Usabilidad
- **RNF13**: PWA responsive en móviles (320px+)
- **RNF14**: WCAG AA accesibilidad
- **RNF15**: Navegación intuitiva, máximo 3 clics para acciones principales
- **RNF16**: Mensajes de error claros en español

### Escalabilidad
- **RNF17**: Soporte hasta 1000 usuarios concurrentes
- **RNF18**: Arquitectura horizontal (load balancer + múltiples instancias)
- **RNF19**: Cache Redis para estados de tickets
- **RNF20**: Queue system para operaciones asíncronas

### Mantenibilidad
- **RNF21**: Cobertura de pruebas ≥85% unitarias, ≥70% total
- **RNF22**: Arquitectura limpia con separación de capas
- **RNF23**: Documentación técnica completa y actualizada
- **RNF24**: Deuda técnica <5% del código total

### Compatibilidad
- **RNF25**: Navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+)
- **RNF26**: Móviles Android 8+ y iOS 14+
- **RNF27**: API RESTful versionada (v1, v2, etc.)
- **RNF28**: Base de datos MySQL 8.0+ o PostgreSQL 13+

## Priorización de Requisitos

### Críticos (Must Have)
- RF1, RF2, RF3, RF4, RF5
- RNF1, RNF5, RNF8, RNF9, RNF12

### Importantes (Should Have)
- RF6
- RNF2, RNF3, RNF4, RNF6, RNF7, RNF10, RNF11

### Deseables (Nice to Have)
- RNF13, RNF14, RNF15, RNF16, RNF17, RNF18, RNF19, RNF20, RNF21, RNF22, RNF23, RNF24, RNF25, RNF26, RNF27, RNF28

## Métricas de Cumplimiento

| Requisito | Métrica | Umbral | Herramienta |
|-----------|---------|--------|------------|
| RNF1 | Latencia p95 validación QR | <150ms | k6 + Prometheus |
| RNF5 | Uptime API | >99.9% | Pingdom + Grafana |
| RNF21 | Cobertura código | >85% | PHPUnit + Codecov |
| RNF22 | Complejidad ciclomática | <10 | PHPStan + SonarQube |