# Arquitectura 4+1 - Sistema Anti-Falsificación de Entradas

## Vista Lógica (Logical View)

### Diagrama de Clases Completo

```mermaid
classDiagram
    %% Entidades del Dominio
    class Ticket {
        +int id
        +int invitationId
        +array qrPayload
        +string qrSignature
        +string nonce
        +Carbon issuedAt
        +Carbon? usedAt
        +Carbon? revokedAt
        +isUsed(): bool
        +isRevoked(): bool
        +isExpired(): bool
        +canBeUsed(): bool
    }

    class Invitation {
        +int id
        +int graduateId
        +int eventId
        +string status
        +Carbon createdAt
        +isCreated(): bool
        +isSent(): bool
        +isRevoked(): bool
    }

    class Graduate {
        +int id
        +int userId
        +int cuposPermitidos
        +int cuposUsados
        +hasAvailableSlots(): bool
        +getRemainingSlots(): int
        +canCreateInvitation(): bool
    }

    class Event {
        +int id
        +string name
        +Carbon date
        +string status
        +isActive(): bool
        +isUpcoming(): bool
        +isPast(): bool
    }

    class Auditorium {
        +int id
        +int eventId
        +string name
        +int capacity
        +int currentOccupancy
        +hasAvailableCapacity(): bool
        +getAvailableCapacity(): int
        +canAccommodate(int): bool
    }

    class Scan {
        +int id
        +int ticketId
        +string deviceId
        +Carbon scannedAt
        +string result
        +bool isOfflineRetry
    }

    %% Casos de Uso
    class CreateInvitationUseCase {
        -GraduateRepositoryInterface graduateRepository
        -InvitationRepositoryInterface invitationRepository
        -EventRepositoryInterface eventRepository
        -TicketRepositoryInterface ticketRepository
        -SignatureServiceInterface signatureService
        -QrGeneratorInterface qrGenerator
        +execute(int, int): Invitation
    }

    class ImportGraduatesUseCase {
        -GraduateRepositoryInterface graduateRepository
        +execute(Collection): array
    }

    class ScanTicketUseCase {
        -TicketRepositoryInterface ticketRepository
        -SignatureServiceInterface signatureService
        +execute(string): ScanResult
    }

    %% Interfaces (Puertos)
    class TicketRepositoryInterface {
        <<interface>>
        +findById(int): Ticket?
        +findByNonce(string): Ticket?
        +save(Ticket): Ticket
        +markAsUsed(int): Ticket?
        +revoke(int): bool
        +getByInvitationId(int): array
    }

    class GraduateRepositoryInterface {
        <<interface>>
        +findById(int): Graduate?
        +findByUserId(int): Graduate?
        +save(Graduate): Graduate
        +incrementUsedSlots(int): Graduate?
        +decrementUsedSlots(int): Graduate?
        +getAll(): array
    }

    class InvitationRepositoryInterface {
        <<interface>>
        +findById(int): Invitation?
        +save(Invitation): Invitation
        +findByGraduateId(int): array
        +findByEventId(int): array
        +updateStatus(int, string): bool
    }

    class EventRepositoryInterface {
        <<interface>>
        +findById(int): Event?
        +save(Event): Event
        +getActiveEvents(): array
        +getUpcomingEvents(): array
        +updateStatus(int, string): bool
    }

    class AuditoriumRepositoryInterface {
        <<interface>>
        +findById(int): Auditorium?
        +findByEventId(int): array
        +save(Auditorium): Auditorium
        +updateOccupancy(int, int): bool
        +incrementOccupancy(int): bool
    }

    class SignatureServiceInterface {
        <<interface>>
        +sign(array): string
        +verify(array, string): bool
        +rotateKey(): void
    }

    class MailServiceInterface {
        <<interface>>
        +sendInvitationEmail(string, array): bool
        +sendTicketEmail(string, array): bool
    }

    class QrGeneratorInterface {
        <<interface>>
        +generate(string): string
        +generateWithLogo(string, string?): string
    }

    %% Adaptadores (Implementaciones)
    class EloquentTicketRepository {
        +findById(int): Ticket?
        +findByNonce(string): Ticket?
        +save(Ticket): Ticket
        +markAsUsed(int): Ticket?
        +revoke(int): bool
        +getByInvitationId(int): array
    }

    class EloquentGraduateRepository {
        +findById(int): Graduate?
        +findByUserId(int): Graduate?
        +save(Graduate): Graduate
        +incrementUsedSlots(int): Graduate?
        +decrementUsedSlots(int): Graduate?
        +getAll(): array
    }

    class EloquentInvitationRepository {
        +findById(int): Invitation?
        +save(Invitation): Invitation
        +findByGraduateId(int): array
        +findByEventId(int): array
        +updateStatus(int, string): bool
    }

    class EloquentEventRepository {
        +findById(int): Event?
        +save(Event): Event
        +getActiveEvents(): array
        +getUpcomingEvents(): array
        +updateStatus(int, string): bool
    }

    class EloquentAuditoriumRepository {
        +findById(int): Auditorium?
        +findByEventId(int): array
        +save(Auditorium): Auditorium
        +updateOccupancy(int, int): bool
        +incrementOccupancy(int): bool
    }

    class HmacSignatureService {
        +sign(array): string
        +verify(array, string): bool
        +rotateKey(): void
    }

    class LaravelMailService {
        +sendInvitationEmail(string, array): bool
        +sendTicketEmail(string, array): bool
    }

    class QrCodeGenerator {
        +generate(string): string
        +generateWithLogo(string, string?): string
    }

    %% Servicios de Aplicación
    class ScanResult {
        +string status
        +string? reason
        +array data
        +toArray(): array
    }

    %% Relaciones
    Ticket --> Invitation
    Invitation --> Graduate
    Invitation --> Event
    Event --> Auditorium
    Scan --> Ticket

    CreateInvitationUseCase --> GraduateRepositoryInterface
    CreateInvitationUseCase --> InvitationRepositoryInterface
    CreateInvitationUseCase --> EventRepositoryInterface
    CreateInvitationUseCase --> TicketRepositoryInterface
    CreateInvitationUseCase --> SignatureServiceInterface
    CreateInvitationUseCase --> QrGeneratorInterface

    ImportGraduatesUseCase --> GraduateRepositoryInterface
    ScanTicketUseCase --> TicketRepositoryInterface
    ScanTicketUseCase --> SignatureServiceInterface

    EloquentTicketRepository ..|> TicketRepositoryInterface
    EloquentGraduateRepository ..|> GraduateRepositoryInterface
    EloquentInvitationRepository ..|> InvitationRepositoryInterface
    EloquentEventRepository ..|> EloquentEventRepository
    EloquentAuditoriumRepository ..|> AuditoriumRepositoryInterface
    HmacSignatureService ..|> SignatureServiceInterface
    LaravelMailService ..|> MailServiceInterface
    QrCodeGenerator ..|> QrGeneratorInterface
```

## Vista de Desarrollo (Development View)

### Estructura de Paquetes

```mermaid
graph TD
    subgraph "Backend (Laravel)"
        A[app/]
        A --> B[Entities/]
        A --> C[UseCases/]
        A --> D[Interfaces/]
        A --> E[Infrastructure/]
        A --> F[Services/]
        A --> G[Http/Controllers/]
        A --> H[Models/]
        A --> I[Policies/]

        B --> B1[Ticket.php]
        B --> B2[Invitation.php]
        B --> B3[Graduate.php]
        B --> B4[Event.php]
        B --> B5[Auditorium.php]

        C --> C1[CreateInvitationUseCase.php]
        C --> C2[ImportGraduatesUseCase.php]
        C --> C3[ScanTicketUseCase.php]

        D --> D1[Repository Interfaces]
        D --> D2[Service Interfaces]

        E --> E1[Repositories/]
        E --> E2[Services/]

        E1 --> E1a[EloquentTicketRepository.php]
        E1 --> E1b[EloquentGraduateRepository.php]
        E1 --> E1c[EloquentInvitationRepository.php]
        E1 --> E1d[EloquentEventRepository.php]
        E1 --> E1e[EloquentAuditoriumRepository.php]

        E2 --> E2a[HmacSignatureService.php]
        E2 --> E2b[LaravelMailService.php]
        E2 --> E2c[QrCodeGenerator.php]

        F --> F1[ScanResult.php]

        G --> G1[ScanController.php]
        G --> G2[GraduateController.php]
        G --> G3[AdminController.php]
        G --> G4[AuthController.php]

        H --> H1[User.php]
        H --> H2[TicketModel.php]
        H --> H3[Invitation.php]
        H --> H4[Graduate.php]
        H --> H5[Event.php]
        H --> H6[Auditorium.php]
        H --> H7[Scan.php]

        I --> I1[GraduatePolicy.php]
        I --> I2[TicketPolicy.php]
        I --> I3[EventPolicy.php]
    end

    subgraph "Frontend (React + Vite)"
        J[src/]
        J --> K[components/]
        J --> L[pages/]
        J --> M[hooks/]
        J --> N[stores/]
        J --> O[types/]
        J --> P[lib/]

        K --> K1[ui/]
        K --> K2[ProtectedRoute.tsx]

        L --> L1[Login.tsx]
        L --> L2[AdminDashboard.tsx]
        L --> L3[GraduateProfile.tsx]
        L --> L4[QRScanner.tsx]

        M --> M1[useApi.ts]
        M --> M2[useAuth.ts]

        N --> N1[authStore.ts]

        O --> O1[admin.ts]
        O --> O2[graduate.ts]

        P --> P1[utils.ts]
    end

    subgraph "Base de Datos"
        Q[(MySQL/PostgreSQL)]
        Q --> R[users]
        Q --> S[graduates]
        Q --> T[events]
        Q --> U[auditoriums]
        Q --> V[invitations]
        Q --> W[tickets]
        Q --> X[scans]
        Q --> Y[audit_logs]
    end

    subgraph "Infraestructura"
        Z[docker/]
        Z --> Z1[docker-compose.yml]
        Z --> Z2[Dockerfile]
        Z --> Z3[.env.example]

        AA[.github/workflows/]
        AA --> AA1[ci.yml]
        AA --> AA2[deploy.yml]
    end
```

## Vista de Procesos (Process View)

### Diagrama de Secuencia - Escaneo QR Completo

```mermaid
sequenceDiagram
    participant Staff as Staff (PWA)
    participant API as API Gateway
    participant RateLimit as Rate Limiter
    participant Cache as Redis Cache
    participant Auth as Auth Middleware
    participant Controller as ScanController
    participant UseCase as ScanTicketUseCase
    participant SigSvc as HmacSignatureService
    participant Repo as EloquentTicketRepository
    participant DB as Database
    participant Queue as Queue Worker
    participant Mail as Mail Service

    Staff->>API: POST /api/scan/validate {qr_string, device_id}
    API->>RateLimit: Check rate limit (10/min per device)
    RateLimit-->>API: OK

    API->>Auth: Check STAFF/ADMIN role
    Auth-->>API: Authorized

    API->>Controller: validateQr(request)
    Controller->>UseCase: execute(qrString)

    UseCase->>UseCase: Decode base64 QR
    UseCase->>UseCase: Extract payload + signature

    UseCase->>SigSvc: verify(payload, signature)
    SigSvc->>Cache: Get current HMAC key
    Cache-->>SigSvc: Key retrieved
    SigSvc->>SigSvc: Verify HMAC-SHA256
    SigSvc-->>UseCase: true/false

    alt Signature invalid
        UseCase-->>Controller: ScanResult::invalid("Firma inválida")
        Controller->>Controller: Log scan attempt
        Controller-->>API: Error response
        API-->>Staff: {status: "INVALID", reason: "..."}
    end

    UseCase->>Repo: findByNonce(payload.nonce)
    Repo->>Cache: Check ticket cache
    Cache-->>Repo: Cache miss
    Repo->>DB: SELECT * FROM tickets WHERE nonce = ?
    DB-->>Repo: Ticket data
    Repo->>Cache: Store in cache
    Repo-->>UseCase: Ticket entity

    alt Ticket not found
        UseCase-->>Controller: ScanResult::invalid("Ticket no encontrado")
    end

    UseCase->>UseCase: Validate ticket state
    alt Ticket revoked
        UseCase-->>Controller: ScanResult::revoked()
    end

    alt Ticket already used
        UseCase-->>Controller: ScanResult::duplicate()
    end

    alt Ticket expired
        UseCase-->>Controller: ScanResult::expired()
    end

    UseCase->>DB: BEGIN TRANSACTION
    UseCase->>Repo: markAsUsed(ticket.id)
    Repo->>DB: UPDATE tickets SET used_at = NOW() WHERE id = ?
    DB-->>Repo: Success
    Repo-->>UseCase: Updated ticket

    UseCase->>DB: COMMIT TRANSACTION
    UseCase-->>Controller: ScanResult::success()

    Controller->>Controller: Log successful scan
    Controller->>Queue: Queue audit log
    Queue->>DB: INSERT INTO scans (ticket_id, device_id, result, scanned_at)

    Controller-->>API: Success response
    API->>Cache: Update occupancy metrics
    API-->>Staff: {status: "OK", reason: null}

    Queue->>Mail: Send notification (optional)
```

### Diagrama de Secuencia - Creación de Invitación

```mermaid
sequenceDiagram
    participant Grad as Graduando (PWA)
    participant API as API Gateway
    participant Auth as Auth Middleware
    participant Controller as GraduateController
    participant UseCase as CreateInvitationUseCase
    participant GradRepo as GraduateRepository
    participant InvRepo as InvitationRepository
    participant EventRepo as EventRepository
    participant TicketRepo as TicketRepository
    participant SigSvc as SignatureService
    participant QrGen as QrGenerator
    participant DB as Database
    participant Cache as Redis Cache

    Grad->>API: POST /api/graduate/invitations {event_id}
    API->>Auth: Check GRADUANDO role
    Auth-->>API: Authorized

    API->>Controller: createInvitation(request)
    Controller->>Controller: Validate input

    Controller->>UseCase: execute(graduateId, eventId)

    UseCase->>GradRepo: findByUserId(userId)
    GradRepo->>DB: SELECT * FROM graduates WHERE user_id = ?
    DB-->>GradRepo: Graduate data
    GradRepo-->>UseCase: Graduate entity

    UseCase->>UseCase: Check available slots
    alt No slots available
        UseCase-->>Controller: Exception "No cupos disponibles"
    end

    UseCase->>EventRepo: findById(eventId)
    EventRepo->>DB: SELECT * FROM events WHERE id = ?
    DB-->>EventRepo: Event data
    EventRepo-->>UseCase: Event entity

    UseCase->>UseCase: Validate event is active

    UseCase->>DB: BEGIN TRANSACTION

    UseCase->>InvRepo: save(new Invitation(...))
    InvRepo->>DB: INSERT INTO invitations (...)
    DB-->>InvRepo: Invitation created
    InvRepo-->>UseCase: Invitation entity

    UseCase->>TicketRepo: save(new Ticket(...))
    TicketRepo->>DB: INSERT INTO tickets (...)
    DB-->>TicketRepo: Ticket created
    TicketRepo-->>UseCase: Ticket entity

    UseCase->>SigSvc: sign(ticketPayload)
    SigSvc->>SigSvc: Generate HMAC-SHA256
    SigSvc-->>UseCase: signature

    UseCase->>QrGen: generate(encodedPayload)
    QrGen->>QrGen: Generate QR code PNG
    QrGen-->>UseCase: qrImage

    UseCase->>GradRepo: incrementUsedSlots(graduateId)
    GradRepo->>DB: UPDATE graduates SET cupos_usados = cupos_usados + 1
    DB-->>GradRepo: Success

    UseCase->>DB: COMMIT TRANSACTION

    UseCase-->>Controller: Invitation with QR

    Controller->>Cache: Invalidate graduate cache
    Controller-->>API: Success response with QR
    API-->>Grad: {invitation: {...}, qr_code: "base64..."}
```

## Vista Física (Physical View)

### Arquitectura de Despliegue - Producción

```mermaid
graph TB
    subgraph "Cliente"
        A[PWA Staff/Graduando]
        B[Navegador Web Mobile]
    end

    subgraph "CDN/Edge Network"
        C[CloudFront/Cloudflare]
        C1[WAF Rules]
        C2[Rate Limiting]
        C3[SSL Termination]
    end

    subgraph "Load Balancer Layer"
        D[ALB/Nginx Load Balancer]
        D1[SSL Termination]
        D2[Session Persistence]
        D3[Health Checks]
    end

    subgraph "Application Layer"
        E1[Laravel App Server 1]
        E2[Laravel App Server 2]
        E3[Laravel App Server 3]
        E4[Laravel App Server 4]

        E1 --> F1[PHP-FPM]
        E2 --> F2[PHP-FPM]
        E3 --> F3[PHP-FPM]
        E4 --> F4[PHP-FPM]
    end

    subgraph "Cache Layer"
        G[Redis Cluster]
        G1[Session Store]
        G2[Ticket Status Cache]
        G3[Rate Limiting Data]
        G4[Signature Keys]
        G5[Occupancy Metrics]
        G6[User Sessions]
    end

    subgraph "Database Layer"
        H[(Primary MySQL 8.0)]
        I[(Read Replica 1)]
        J[(Read Replica 2)]
        K[(Backup Server)]
        L[(Analytics DB)]
    end

    subgraph "Queue & Background Jobs"
        M[Redis Queue]
        N[Worker Node 1]
        O[Worker Node 2]
        P[Worker Node 3]
    end

    subgraph "External Services"
        Q[SMTP Service]
        R[SMS Gateway]
        S[Monitoring Stack]
        T[Log Aggregation]
    end

    subgraph "Storage Layer"
        U[S3 Bucket]
        U1[QR Code Images]
        U2[Import Files]
        U3[Backup Files]
    end

    A --> B
    B --> C
    C --> D
    D --> E1
    D --> E2
    D --> E3
    D --> E4

    E1 --> G
    E2 --> G
    E3 --> G
    E4 --> G

    G --> G1
    G --> G2
    G --> G3
    G --> G4
    G --> G5
    G --> G6

    E1 --> H
    E2 --> H
    E3 --> H
    E4 --> H
    H --> I
    H --> J
    H --> K
    H --> L

    E1 --> M
    E2 --> M
    E3 --> M
    E4 --> M
    M --> N
    M --> O
    M --> P

    N --> Q
    N --> R
    O --> S
    P --> T

    E1 --> U
    E2 --> U
    E3 --> U
    E4 --> U

    style A fill:#e1f5fe
    style E1 fill:#f3e5f5
    style E2 fill:#f3e5f5
    style E3 fill:#f3e5f5
    style E4 fill:#f3e5f5
    style H fill:#e8f5e8
    style G fill:#fff3e0
    style M fill:#fce4ec
```

### Arquitectura de Despliegue - Desarrollo

```mermaid
graph TB
    subgraph "Desarrollo Local"
        A[Laravel Sail]
        B[MySQL Container]
        C[Redis Container]
        D[MailHog Container]
        E[Frontend Dev Server]
    end

    subgraph "CI/CD Pipeline"
        F[GitHub Actions]
        F1[PHPUnit Tests]
        F2[PHPStan Analysis]
        F3[Jest Tests]
        F4[Playwright E2E]
        F5[SonarQube Scan]
    end

    subgraph "Staging"
        G[Docker Compose]
        H[Laravel App]
        I[MySQL]
        J[Redis]
        K[MinIO S3]
    end

    A --> B
    A --> C
    A --> D
    E --> A

    F --> F1
    F --> F2
    F --> F3
    F --> F4
    F --> F5

    G --> H
    G --> I
    G --> J
    G --> K
```

## Escenarios (Scenarios View)

### Escenario 1: Validación QR Exitosa

**Contexto**: Staff escanea QR válido en puerta de auditorio
**Calidad**: Rendimiento crítico, seguridad alta

```mermaid
sequenceDiagram
    participant S as Staff
    participant PWA as PWA App
    participant API as Backend API
    participant Cache as Redis
    participant DB as MySQL

    S->>PWA: Escanea QR
    PWA->>API: POST /scan/validate
    API->>Cache: Check rate limit
    Cache-->>API: OK

    API->>API: Decode QR
    API->>API: Verify HMAC
    API->>Cache: Get ticket status
    Cache-->>API: Not in cache

    API->>DB: Query ticket
    DB-->>API: Ticket data
    API->>Cache: Cache ticket

    API->>DB: BEGIN TX
    API->>DB: Mark used
    API->>DB: Insert scan
    API->>DB: COMMIT

    API->>Cache: Update metrics
    API-->>PWA: OK
    PWA-->>S: ✅ Ingreso permitido
```

**Requisitos de Calidad**:
- Latencia <150ms p95
- Disponibilidad 99.9%
- Seguridad: Firma HMAC validada

### Escenario 2: Ingreso Masivo

**Contexto**: 500 personas llegan simultáneamente al evento
**Calidad**: Escalabilidad, consistencia

```mermaid
sequenceDiagram
    participant Crowd as 500+ Users
    participant LB as Load Balancer
    participant Apps as App Servers
    participant Cache as Redis Cluster
    participant DB as DB Cluster
    participant Queue as Queue System

    Crowd->>LB: Concurrent requests
    LB->>Apps: Distribute load

    Apps->>Cache: Check rate limits
    Apps->>Cache: Get ticket states

    Apps->>DB: Optimistic locking updates
    DB-->>Apps: Success/fail

    Apps->>Queue: Async logging
    Apps->>Cache: Update metrics

    Queue->>DB: Process logs
```

**Requisitos de Calidad**:
- Throughput: 200 req/s sostenido
- Latencia: <150ms p95 bajo carga
- Consistencia: Transacciones ACID

### Escenario 3: Conectividad Intermitente

**Contexto**: Staff pierde conexión durante evento
**Calidad**: Resiliencia, consistencia eventual

```mermaid
sequenceDiagram
    participant Staff as Staff
    participant PWA as PWA Offline
    participant Local as IndexedDB
    participant API as Backend
    participant Sync as Sync Service

    Staff->>PWA: Escanea QR
    PWA->>PWA: Detect offline
    PWA->>Local: Store scan locally

    Note over PWA: Espera reconexión

    PWA->>API: Connection restored
    API->>Sync: Batch sync scans
    Sync->>API: Process each scan
    API->>Local: Mark synced
    API-->>PWA: Sync complete
```

**Requisitos de Calidad**:
- 0% pérdida de datos
- Sincronización automática
- Consistencia eventual

### Escenario 4: Ataque de Falsificación

**Contexto**: Intento de usar QR alterado
**Calidad**: Seguridad, detección de fraudes

```mermaid
sequenceDiagram
    participant Attacker as Atacante
    participant API as Backend
    participant Sig as Signature Service
    participant Log as Audit Log

    Attacker->>API: POST tampered QR
    API->>Sig: Verify signature
    Sig-->>API: Invalid signature

    API->>API: Reject immediately
    API->>Log: Log fraud attempt
    API-->>Attacker: INVALID
```

**Requisitos de Calidad**:
- Detección 100% de firmas inválidas
- Auditoría completa
- No impacto en rendimiento legítimo

## Vista de Procesos - Hilos y Comunicación

### Arquitectura de Hilos

```mermaid
graph TD
    subgraph "Web Server Threads"
        A[Request Handler 1]
        B[Request Handler 2]
        C[Request Handler N]
    end

    subgraph "Application Threads"
        D[Laravel Worker 1]
        E[Laravel Worker 2]
        F[Laravel Worker N]
    end

    subgraph "Background Workers"
        G[Queue Worker 1]
        H[Queue Worker 2]
        I[Queue Worker N]
    end

    subgraph "Cache Connections"
        J[Redis Connection Pool]
    end

    subgraph "Database Connections"
        K[DB Connection Pool]
        L[Read Replicas]
    end

    A --> D
    B --> E
    C --> F

    D --> J
    E --> J
    F --> J

    D --> K
    E --> K
    F --> K

    G --> K
    H --> K
    I --> K

    K --> L
```

### Comunicación Entre Componentes

- **Síncrona**: HTTP REST API entre frontend y backend
- **Asíncrona**: Redis Queue para emails, logs, notificaciones
- **Cache**: Redis para estados de tickets, sesiones, métricas
- **Base de Datos**: MySQL con read replicas para consultas
- **Eventos**: Laravel Events para acoplamiento loose entre módulos

## Métricas Arquitecturales

| Vista | Métrica | Umbral | Herramienta |
|-------|---------|--------|------------|
| Lógica | Acoplamiento eferente | <0.8 | PHPDepend |
| Lógica | Cohesión LCOM | <1.5 | PHPDepend |
| Desarrollo | Cobertura pruebas | >85% | PHPUnit |
| Desarrollo | Complejidad ciclomática | <10 | PHPStan |
| Procesos | Latencia p95 | <150ms | k6/Prometheus |
| Procesos | Throughput | >200 req/s | k6 |
| Física | Disponibilidad | >99.9% | Pingdom |
| Física | Uso CPU/memoria | <80% | Grafana |
| Escenarios | Tasa éxito validaciones | >99.9% | Custom metrics |