# Matriz de Trazabilidad - Requisitos, Casos de Uso, Endpoints y Pruebas

## Matriz de Trazabilidad RF → CU → Endpoints → Pruebas

| RF | Descripción | CU | Endpoints | Pruebas Unitarias | Pruebas Integración | Pruebas E2E | Pruebas Seguridad |
|----|-------------|----|-----------|-------------------|---------------------|-------------|-------------------|
| RF1 | Importación masiva desde Excel | CU-01 | `POST /admin/import-graduates` | `ImportGraduatesUseCaseTest::testExecuteWithValidData()`<br>`GraduateRepositoryTest::testSave()` | `AdminControllerTest::testImportGraduates()`<br>`ExcelImportIntegrationTest` | `ImportGraduates.spec.ts` | `ExcelInjectionTest` |
| RF2 | Autenticación dinámica con contraseña temporal | CU-02 | `POST /register`<br>`POST /login`<br>`POST /change-password` | `AuthServiceTest::testGenerateTempPassword()`<br>`UserTest::testFirstLoginRequired()` | `AuthControllerTest::testLoginFlow()`<br>`PasswordResetIntegrationTest` | `Login.spec.ts`<br>`ChangePassword.spec.ts` | `BruteForceProtectionTest`<br>`PasswordPolicyTest` |
| RF3 | Portal graduando - gestión invitaciones | CU-03 | `GET /graduate/me`<br>`GET /graduate/invitations`<br>`POST /graduate/invitations`<br>`DELETE /graduate/invitations/{id}`<br>`GET /graduate/tickets`<br>`GET /graduate/tickets/{id}/qr` | `CreateInvitationUseCaseTest::testExecuteWithValidSlots()`<br>`GraduateTest::testHasAvailableSlots()`<br>`InvitationTest::testCanCreate()` | `GraduateControllerTest::testCreateInvitation()`<br>`InvitationRepositoryTest::testSave()` | `GraduatePortal.spec.ts`<br>`CreateInvitation.spec.ts` | `AuthorizationTest::testGraduateCannotAccessAdmin()` |
| RF4 | Validación QR en puerta con check-in | CU-04 | `POST /scan/validate` | `ScanTicketUseCaseTest::testExecuteValidQr()`<br>`TicketTest::testCanBeUsed()`<br>`SignatureServiceTest::testVerify()` | `ScanControllerTest::testValidateQr()`<br>`TransactionTest::testAtomicCheckIn()` | `QRScanner.spec.ts`<br>`ScanFlow.spec.ts` | `HmacVerificationTest`<br>`ReplayAttackTest`<br>`RateLimitTest` |
| RF5 | Dashboard administración con métricas | CU-05 | `GET /admin/dashboard/aforo` | `AuditoriumTest::testGetAvailableCapacity()`<br>`EventTest::testIsActive()` | `AdminControllerTest::testGetDashboardAforo()`<br>`MetricsCalculationTest` | `AdminDashboard.spec.ts` | `RBACDashboardTest` |
| RF6 | Auditoría completa de acciones | CU-06<br>CU-07 | `POST /admin/tickets/{id}/revoke`<br>`GET /admin/audit-logs` | `AuditLoggerTest::testLogsAction()`<br>`ScanTest::testAuditFields()` | `AuditLogIntegrationTest`<br>`RevokeTicketTest` | `AuditLogs.spec.ts` | `AuditIntegrityTest` |

## Trazabilidad RNF → Componentes Arquitecturales

| RNF | Descripción | Componentes | Métricas | Monitoreo |
|-----|-------------|-------------|----------|-----------|
| RNF1 | Validación QR <150ms p95 | `ScanTicketUseCase`<br>`Redis Cache`<br>`TicketRepository` | Latencia p95 <150ms | Prometheus + Grafana |
| RNF2 | Importación Excel <30s para 1000 registros | `ImportGraduatesUseCase`<br>`Excel Processor`<br>`Bulk Insert` | Tiempo procesamiento | Custom metrics |
| RNF3 | Dashboard carga <2s | `AdminController::getDashboardAforo()`<br>`Read Replicas`<br>`Query Optimization` | Tiempo carga dashboard | Application Insights |
| RNF4 | API responde <500ms p95 | Todos los endpoints<br>`Database Indexes`<br>`Connection Pooling` | Latencia API p95 | APM tools |
| RNF5 | 99.9% uptime API | `Load Balancer`<br>`Health Checks`<br>`Auto-scaling` | Uptime SLA | Pingdom + StatusPage |
| RNF6 | PWA funciona offline | `Service Workers`<br>`IndexedDB`<br>`Sync Queue` | Funcionalidad offline | Manual testing |
| RNF7 | Recuperación <5 min | `Circuit Breakers`<br>`Retry Logic`<br>`Failover DB` | MTTR | Incident management |
| RNF8 | Firma HMAC-SHA256 | `HmacSignatureService`<br>`Key Rotation` | Verificación firma | Security monitoring |
| RNF9 | JWT expiración 1h | `Auth Middleware`<br>`Token Refresh` | Token validity | Auth logs |
| RNF10 | Encriptación AES-256 | `Database Encryption`<br>`Secure Storage` | Data at rest encryption | Compliance audits |
| RNF11 | Rate limiting 10 req/min | `Throttle Middleware`<br>`Redis Store` | Request rates | Rate limit logs |
| RNF12 | OWASP Top 10 mitigado | `Security Headers`<br>`Input Validation`<br>`CSRF Protection` | Vulnerabilities | Security scans |
| RNF13 | PWA responsive | `CSS Grid/Flexbox`<br>`Media Queries` | Responsive design | Browser testing |
| RNF14 | WCAG AA accesibilidad | `ARIA Labels`<br>`Keyboard Navigation`<br>`Color Contrast` | Accessibility score | axe-core |
| RNF15 | Navegación intuitiva | `UX Patterns`<br>`User Testing` | Task completion | User analytics |
| RNF16 | Mensajes error claros | `Error Handling`<br>`I18n` | Error clarity | User feedback |
| RNF17 | Soporte 1000 usuarios concurrentes | `Horizontal Scaling`<br>`Load Balancing` | Concurrent users | Load testing |
| RNF18 | Arquitectura horizontal | `Stateless Services`<br>`External Sessions` | Scalability | Performance testing |
| RNF19 | Cache Redis estratégico | `Cache Layer`<br>`Cache Invalidation` | Cache hit ratio | Cache metrics |
| RNF20 | Queue system asíncrono | `Redis Queue`<br>`Background Workers` | Queue throughput | Queue monitoring |
| RNF21 | Cobertura pruebas ≥85% | `PHPUnit`<br>`Jest`<br>`Test Strategy` | Code coverage | CI/CD reports |
| RNF22 | Arquitectura limpia | `Clean Architecture`<br>`SOLID Principles` | Architecture metrics | Code analysis |
| RNF23 | Documentación completa | `Technical Docs`<br>`API Docs`<br>`Architecture Docs` | Documentation coverage | Documentation reviews |
| RNF24 | Deuda técnica <5% | `Code Quality`<br>`Refactoring`<br>`Technical Debt Ratio` | Debt ratio | SonarQube |
| RNF25 | Navegadores modernos | `Browser Support`<br>`Polyfills` | Browser compatibility | Cross-browser testing |
| RNF26 | Móviles Android 8+ iOS 14+ | `PWA Standards`<br>`Mobile Testing` | Mobile compatibility | Device testing |
| RNF27 | API RESTful versionada | `Versioning Strategy`<br>`Backward Compatibility` | API versioning | API testing |
| RNF28 | Base de datos MySQL 8.0+ | `Database Compatibility`<br>`Migration Scripts` | DB compatibility | DB testing |

## Trazabilidad CU → Endpoints → Métodos

| Caso de Uso | Endpoints | Métodos Controlador | Servicios Involucrados |
|-------------|-----------|---------------------|----------------------|
| CU-01: Importar Graduandos | `POST /admin/import-graduates` | `AdminController::importGraduates()` | `ImportGraduatesUseCase`<br>`GraduateRepository`<br>`Excel` |
| CU-02: Autenticación Primer Login | `POST /register`<br>`POST /login`<br>`POST /change-password` | `AuthController::register()`<br>`AuthController::login()`<br>`AuthController::changePassword()` | `Auth Service`<br>`User Model`<br>`JWT Auth` |
| CU-03: Crear Invitación | `POST /graduate/invitations` | `GraduateController::createInvitation()` | `CreateInvitationUseCase`<br>`GraduateRepository`<br>`InvitationRepository`<br>`TicketRepository`<br>`SignatureService`<br>`QrGenerator` |
| CU-04: Escanear QR | `POST /scan/validate` | `ScanController::validateQr()` | `ScanTicketUseCase`<br>`TicketRepository`<br>`SignatureService`<br>`ScanRepository` |
| CU-05: Dashboard Aforo | `GET /admin/dashboard/aforo` | `AdminController::getDashboardAforo()` | `EventRepository`<br>`AuditoriumRepository`<br>`TicketRepository` |
| CU-06: Revocar Ticket | `POST /admin/tickets/{id}/revoke` | `AdminController::revokeTicket()` | `TicketRepository`<br>`AuditLogger` |
| CU-07: Ver Logs Auditoría | `GET /admin/audit-logs` | `AdminController::getAuditLogs()` | `AuditLogRepository` |

## Trazabilidad Pruebas → Código

### Pruebas Unitarias

| Test Class | Método | Código Probado | Cobertura |
|------------|--------|----------------|-----------|
| `TicketTest` | `testCanBeUsed()` | `Ticket::canBeUsed()` | Invariantes entidad |
| `TicketTest` | `testIsExpired()` | `Ticket::isExpired()` | Lógica expiración |
| `GraduateTest` | `testHasAvailableSlots()` | `Graduate::hasAvailableSlots()` | Reglas cupos |
| `ScanTicketUseCaseTest` | `testExecuteValidQr()` | `ScanTicketUseCase::execute()` | Flujo principal |
| `ScanTicketUseCaseTest` | `testExecuteInvalidSignature()` | `ScanTicketUseCase::execute()` | Validación firma |
| `CreateInvitationUseCaseTest` | `testExecuteInsufficientSlots()` | `CreateInvitationUseCase::execute()` | Validación cupos |
| `HmacSignatureServiceTest` | `testSignAndVerify()` | `HmacSignatureService::sign()`<br>`HmacSignatureService::verify()` | Firma HMAC |
| `EloquentTicketRepositoryTest` | `testFindByNonce()` | `EloquentTicketRepository::findByNonce()` | Persistencia |

### Pruebas de Integración

| Test Class | Método | Componentes | Base de Datos |
|------------|--------|-------------|---------------|
| `ScanControllerTest` | `testValidateQrSuccess()` | Controller + UseCase + Repository | ✅ |
| `GraduateControllerTest` | `testCreateInvitation()` | Controller + UseCase + Multiple Repositories | ✅ |
| `AdminControllerTest` | `testImportGraduates()` | Controller + UseCase + Excel Processing | ✅ |
| `TransactionTest` | `testAtomicCheckIn()` | DB Transaction + Multiple Updates | ✅ |
| `AuthIntegrationTest` | `testLoginChangePasswordFlow()` | Auth + Password Reset | ✅ |

### Pruebas E2E

| Test File | Escenario | Navegador | Base de Datos |
|-----------|-----------|-----------|---------------|
| `Login.spec.ts` | Login → Dashboard | ✅ | ✅ |
| `CreateInvitation.spec.ts` | Graduate Portal → Create Invitation | ✅ | ✅ |
| `QRScanner.spec.ts` | Scan QR → Check-in | ✅ | ✅ |
| `AdminDashboard.spec.ts` | Admin Login → View Metrics | ✅ | ✅ |
| `ImportGraduates.spec.ts` | Upload Excel → View Results | ✅ | ✅ |

### Pruebas de Seguridad

| Test Class | Método | Vulnerabilidad | Herramienta |
|------------|--------|----------------|------------|
| `HmacVerificationTest` | `testInvalidSignatureRejected()` | Firma manipulada | PHPUnit |
| `ReplayAttackTest` | `testNoncePreventsReplay()` | Ataques replay | PHPUnit |
| `RateLimitTest` | `testRateLimitEnforced()` | DoS por rate limiting | k6 |
| `AuthorizationTest` | `testRBACEnforced()` | Acceso no autorizado | PHPUnit |
| `InputValidationTest` | `testSqlInjectionPrevented()` | SQL injection | OWASP ZAP |

## Métricas de Trazabilidad

### Cobertura de Requisitos

| Tipo | Total | Cubierto | Porcentaje |
|------|-------|----------|------------|
| RF | 6 | 6 | 100% |
| RNF | 28 | 28 | 100% |
| CU | 7 | 7 | 100% |

### Cobertura de Pruebas por Nivel

| Nivel | Casos | Automatizados | Cobertura |
|-------|-------|---------------|-----------|
| Unitarias | 25+ | 25+ | ≥85% |
| Integración | 15+ | 15+ | ≥70% |
| E2E | 10+ | 10+ | ≥60% |
| Seguridad | 12+ | 12+ | 100% |

### Trazabilidad Inversa (desde Código a Requisitos)

| Archivo | RF Relacionados | CU Relacionados | Pruebas |
|---------|-----------------|-----------------|---------|
| `ScanTicketUseCase.php` | RF4 | CU-04 | `ScanTicketUseCaseTest` |
| `CreateInvitationUseCase.php` | RF3 | CU-03 | `CreateInvitationUseCaseTest` |
| `ScanController.php` | RF4 | CU-04 | `ScanControllerTest` |
| `GraduateController.php` | RF3 | CU-03 | `GraduateControllerTest` |
| `AdminController.php` | RF1, RF5 | CU-01, CU-05 | `AdminControllerTest` |
| `Ticket.php` | RF4 | CU-04 | `TicketTest` |
| `HmacSignatureService.php` | RNF8 | CU-04 | `HmacSignatureServiceTest` |

## Validación de Trazabilidad

### Checklist de Verificación

- [x] Todos los RF tienen al menos un CU asociado
- [x] Todos los CU tienen endpoints implementados
- [x] Todos los endpoints tienen pruebas unitarias
- [x] Todos los CU críticos tienen pruebas E2E
- [x] Todos los RNF tienen métricas definidas
- [x] Todas las vulnerabilidades OWASP tienen pruebas
- [x] Arquitectura limpia implementada consistentemente
- [x] Documentación actualizada con cambios

### Reporte de Cobertura

```
Requisitos Funcionales: 6/6 (100%)
Requisitos No Funcionales: 28/28 (100%)
Casos de Uso: 7/7 (100%)
Endpoints API: 12/12 (100%)
Pruebas Unitarias: 25+ (≥85% cobertura)
Pruebas Integración: 15+ (≥70% cobertura)
Pruebas E2E: 10+ (≥60% cobertura)
Pruebas Seguridad: 12+ (100% OWASP Top 10)
```

Esta matriz asegura trazabilidad completa desde requisitos de negocio hasta código ejecutable y pruebas, facilitando mantenimiento, evolución y cumplimiento normativo del sistema.