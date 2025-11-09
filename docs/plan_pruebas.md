# Plan de Pruebas del Sistema Anti-Falsificación

## Estrategia General

- **Enfoque**: TDD (Test-Driven Development) para casos de uso críticos, BDD para E2E.
- **Pirámide de Pruebas**: 70% unitarias, 20% integración, 10% E2E.
- **Herramientas**:
  - Backend: PHPUnit/Pest + factories/seeders.
  - Frontend: Jest + React Testing Library.
  - E2E: Playwright/Cypress.
  - Carga: k6 o Artillery.
- **Cobertura Objetivo**: ≥85% core business logic, ≥70% total.
- **Entornos**: Local (dev), Staging (pre-prod), Prod.

## Tipos de Pruebas

### 1. Pruebas Unitarias

**Alcance**: Métodos individuales, clases puras, sin dependencias externas.
- **Mocks/Stubs**: Repositorios, servicios externos (mail, QR).
- **Ejemplos**:
  - `Ticket::validateSignature()`: Verificar HMAC.
  - `Graduate::hasAvailableSlots()`: Lógica de cupos.
  - `ScanTicketUseCase::execute()`: Orquestación con mocks.

**Criterios de Éxito**:
- Todas las ramas de código cubiertas.
- Casos edge: firma inválida, cupo cero, ticket expirado.

### 2. Pruebas de Integración

**Alcance**: Interacción entre componentes (DB, APIs, colas).
- **Setup**: Base de datos de test, Redis mock.
- **Ejemplos**:
  - Importar Excel: Procesar archivo → crear graduandos → enviar mails.
  - Validar QR: Decodificar → verificar DB → marcar usado.
  - API endpoints: Autenticación + autorización.

**Criterios de Éxito**:
- Datos consistentes en DB.
- Mensajes en colas procesados.
- Excepciones manejadas (rollback transacciones).

### 3. Pruebas End-to-End (E2E)

**Alcance**: Flujos completos desde UI hasta DB.
- **Escenarios**:
  - Graduando: Login → crear invitación → ver QR → compartir.
  - Admin: Importar Excel → ver dashboard → revocar ticket.
  - Lector: Escanear QR válido → check-in OK; duplicado → reject.

**Criterios de Éxito**:
- UI responde correctamente.
- Datos persisten end-to-end.
- PWA funciona offline (sincronización).

### 4. Pruebas de Seguridad

**Alcance**: Vulnerabilidades OWASP Top 10.
- **Ejemplos**:
  - JWT tampering: Modificar token → acceso denegado.
  - SQL injection: Payload malicioso en inputs.
  - Rate limiting: Ataques de fuerza bruta.
  - Firma HMAC: Claves rotadas, ataques de replay.

**Herramientas**: OWASP ZAP, Burp Suite.

### 5. Pruebas de Rendimiento

**Alcance**: Carga y estrés.
- **Escenarios**:
  - Validación QR: 200 req/s, p95 <150ms.
  - Import Excel: 1000 registros en <30s.
  - Dashboard: 50 usuarios concurrentes.

**Herramientas**: k6, JMeter.
- **Métricas**: Latencia, throughput, errores.

## Matriz de Trazabilidad RF → Pruebas

| RF | Descripción | Pruebas Unitarias | Pruebas Integración | Pruebas E2E | Seguridad | Rendimiento |
|----|-------------|-------------------|---------------------|-------------|-----------|-------------|
| RF1 | Importar Excel | Validar formato, procesar filas | DB inserts, mail queue | Upload file → resumen | Injection | Bulk import time |
| RF2 | Auth dinámica | Generar password, expirar | Mail send, DB update | Login flow | Brute force | - |
| RF3 | Portal graduando | Lógica cupos, crear invitación | API calls, DB | UI interactions | - | Page load |
| RF4 | Control acceso | Validar QR, check-in | Transacción DB, cache | Scan flow | Replay attacks | Scan latency |
| RF5 | Administración | Crear evento, dashboard | API + DB | Admin UI | RBAC | Dashboard queries |
| RF6 | Auditoría | Log actions | DB logs | - | - | Log queries |

## Plan de Ejecución

### Fases
1. **Desarrollo**: TDD para cada feature.
2. **Pre-Release**: Suite completa en staging.
3. **Post-Release**: Smoke tests diarios, monitoring.

### Datos de Prueba
- **Seeders**: Eventos demo, graduandos de prueba, tickets válidos/inválidos.
- **Fixtures**: Archivos Excel de ejemplo (válidos, con errores).
- **Mocks**: QR codes pre-generados con firmas conocidas.

### Riesgos y Mitigación
- **Riesgo**: Dependencias externas (mail, QR lib).
  - **Mitigación**: Mocks en unitarias, contratos en integración.
- **Riesgo**: Concurrencia en check-in.
  - **Mitigación**: Pruebas con race conditions simuladas.
- **Riesgo**: PWA offline.
  - **Mitigación**: Service workers mocks.

## TDD: Ciclo para Validación QR

1. **Red**: Escribir test fallido.
   ```php
   // TestScanTicketTest.php
   public function testValidQrCheckIn()
   {
       $ticket = Ticket::factory()->create(['status' => 'CREATED']);
       $result = $this->scanUseCase->execute($ticket->qr_payload);
       $this->assertEquals('OK', $result['status']);
       $this->assertDatabaseHas('scans', ['ticket_id' => $ticket->id]);
   }
   ```

2. **Green**: Implementar mínimo código.
   ```php
   // ScanTicketUseCase.php
   public function execute(string $qrPayload): array
   {
       // Decode, validate signature, check status, mark used
       return ['status' => 'OK'];
   }
   ```

3. **Refactor**: Mejorar código manteniendo tests verdes.

## Automatización en CI/CD

```yaml
# .github/workflows/test.yml
name: Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8
        env:
          MYSQL_ROOT_PASSWORD: root
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.2
      - name: Install backend deps
        run: composer install
      - name: Run PHPUnit
        run: vendor/bin/phpunit --coverage-text
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install frontend deps
        run: cd frontend && npm install
      - name: Run Jest
        run: cd frontend && npm test -- --coverage
      - name: Run Playwright
        run: npx playwright test
```

## Resultados Esperados

- **Cobertura**: 85%+ unitaria, 70%+ integración.
- **Tiempo Ejecución**: <5 min suite completa.
- **Defectos**: <0.5/KLOC en producción.
- **Rendimiento**: Validación QR <150ms p95 bajo carga.

## Mejora Continua

- **Análisis Post-Mortem**: Revisar fallos en prod.
- **Métricas de Pruebas**: Tendencias de cobertura, tiempo ejecución.
- **Feedback Loop**: Tests fallidos bloquean merges.