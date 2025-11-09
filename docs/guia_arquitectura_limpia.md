# Guía de Arquitectura Limpia - Sistema Anti-Falsificación

## Principios Fundamentales

### Regla de Dependencia
> Las dependencias solo pueden apuntar hacia adentro. Nada en un círculo interno puede saber nada de algo en un círculo externo.

**En la práctica**:
- **Entidades** (núcleo): Puras, sin dependencias externas
- **Casos de Uso**: Lógica de aplicación, orquestan entidades
- **Interfaces**: Contratos abstractos (puertos)
- **Infraestructura**: Implementaciones concretas (adaptadores)

### Inversión de Dependencias
> Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.

**Aplicación**:
```php
// ❌ Malo: Caso de uso depende de implementación concreta
class ScanTicketUseCase {
    public function __construct(EloquentTicketRepository $repo) {}
}

// ✅ Bueno: Caso de uso depende de interfaz (puerto)
class ScanTicketUseCase {
    public function __construct(TicketRepositoryInterface $repo) {}
}
```

## Estructura por Capas

### 1. Entidades (Entities) - Capa más Interna

**Responsabilidades**:
- Reglas de negocio puras
- Invariantes del dominio
- Sin dependencias externas

**Ejemplo - Ticket Entity**:
```php
class Ticket {
    private int $id;
    private array $qrPayload;
    private string $qrSignature;
    private ?Carbon $usedAt;
    private ?Carbon $revokedAt;

    public function canBeUsed(): bool {
        return !$this->isUsed() && !$this->isRevoked() && !$this->isExpired();
    }

    public function isUsed(): bool {
        return $this->usedAt !== null;
    }

    public function isRevoked(): bool {
        return $this->revokedAt !== null;
    }

    public function isExpired(): bool {
        return $this->issuedAt->addHours(24)->isPast();
    }
}
```

**Reglas**:
- Métodos que protegen invariantes
- No dependen de frameworks
- Pueden ser usadas en cualquier contexto

### 2. Casos de Uso (Use Cases) - Lógica de Aplicación

**Responsabilidades**:
- Orquestar entidades
- Implementar reglas de aplicación
- Coordinar con repositorios/interfaces

**Ejemplo - ScanTicketUseCase**:
```php
class ScanTicketUseCase {
    public function __construct(
        private TicketRepositoryInterface $ticketRepository,
        private SignatureServiceInterface $signatureService
    ) {}

    public function execute(string $qrString): ScanResult {
        // 1. Decodificar QR
        $decoded = $this->decodeQr($qrString);
        $payload = $decoded['payload'];
        $signature = $decoded['signature'];

        // 2. Verificar firma (regla de negocio)
        if (!$this->signatureService->verify($payload, $signature)) {
            return ScanResult::invalid('Firma inválida');
        }

        // 3. Buscar ticket
        $ticket = $this->ticketRepository->findByNonce($payload['nonce']);
        if (!$ticket) {
            return ScanResult::invalid('Ticket no encontrado');
        }

        // 4. Validar estado (invariante de entidad)
        if (!$ticket->canBeUsed()) {
            if ($ticket->isUsed()) {
                return ScanResult::duplicate();
            }
            if ($ticket->isRevoked()) {
                return ScanResult::revoked();
            }
            if ($ticket->isExpired()) {
                return ScanResult::expired();
            }
        }

        // 5. Marcar como usado (transacción)
        DB::transaction(function () use ($ticket) {
            $this->ticketRepository->markAsUsed($ticket->id);
            // Log scan...
        });

        return ScanResult::success();
    }
}
```

**Patrones Aplicados**:
- **Transacciones**: Agrupan operaciones relacionadas
- **Result Pattern**: Retorno consistente de operaciones
- **Dependency Injection**: Inyección de dependencias

### 3. Interfaces (Ports) - Contratos Abstractos

**Responsabilidades**:
- Definir contratos para acceso externo
- Abstraer tecnologías específicas
- Permitir testing con mocks

**Ejemplo - Repository Interface**:
```php
interface TicketRepositoryInterface {
    public function findById(int $ticketId): ?Ticket;
    public function findByNonce(string $nonce): ?Ticket;
    public function save(Ticket $ticket): Ticket;
    public function markAsUsed(int $ticketId): ?Ticket;
    public function revoke(int $ticketId): bool;
    public function getByInvitationId(int $invitationId): array;
}
```

**Tipos de Interfaces**:
- **Repository Interfaces**: Persistencia
- **Service Interfaces**: Lógica externa (email, QR, firma)
- **Gateway Interfaces**: APIs externas

### 4. Infraestructura (Adapters) - Implementaciones Concretas

**Responsabilidades**:
- Implementar interfaces
- Adaptar tecnologías específicas
- Manejar detalles de infraestructura

**Ejemplo - Eloquent Repository**:
```php
class EloquentTicketRepository implements TicketRepositoryInterface {
    public function findByNonce(string $nonce): ?Ticket {
        $model = TicketModel::where('nonce', $nonce)->first();
        return $model ? $this->toEntity($model) : null;
    }

    public function markAsUsed(int $ticketId): ?Ticket {
        $model = TicketModel::find($ticketId);
        if (!$model) return null;

        $model->update(['used_at' => now()]);
        return $this->toEntity($model);
    }

    private function toEntity(TicketModel $model): Ticket {
        return new Ticket(
            id: $model->id,
            invitationId: $model->invitation_id,
            qrPayload: json_decode($model->qr_payload, true),
            qrSignature: $model->qr_signature,
            nonce: $model->nonce,
            issuedAt: $model->issued_at,
            usedAt: $model->used_at,
            revokedAt: $model->revoked_at
        );
    }
}
```

## Patrón Puertos y Adaptadores (Hexagonal Architecture)

### Puertos (Ports)
Son las interfaces que definen cómo el núcleo se comunica con el exterior:

```php
// Puerto de entrada (driven by application)
interface TicketRepositoryInterface {
    // El caso de uso "tira" de este puerto
}

// Puerto de salida (drives external systems)
interface MailServiceInterface {
    // El caso de uso "empuja" a este puerto
}
```

### Adaptadores (Adapters)
Implementan los puertos y adaptan tecnologías específicas:

```php
// Adaptador de entrada
class EloquentTicketRepository implements TicketRepositoryInterface {
    // Adapta Eloquent ORM al puerto
}

// Adaptador de salida
class LaravelMailService implements MailServiceInterface {
    // Adapta Laravel Mail al puerto
}
```

### Beneficios
- **Testabilidad**: Fácil mockear adaptadores
- **Flexibilidad**: Cambiar DB/Email sin afectar negocio
- **Separación**: Lógica de negocio aislada de infraestructura

## Inyección de Dependencias

### Constructor Injection
```php
class CreateInvitationUseCase {
    public function __construct(
        private GraduateRepositoryInterface $graduateRepository,
        private InvitationRepositoryInterface $invitationRepository,
        private SignatureServiceInterface $signatureService,
        private QrGeneratorInterface $qrGenerator
    ) {}
}
```

### Service Container (Laravel)
```php
// En AppServiceProvider
$this->app->bind(TicketRepositoryInterface::class, EloquentTicketRepository::class);
$this->app->bind(SignatureServiceInterface::class, HmacSignatureService::class);
```

### Beneficios
- **Inversión de Control**: Framework crea dependencias
- **Configurabilidad**: Cambiar implementaciones en un lugar
- **Testing**: Inyectar mocks fácilmente

## Manejo de Errores y Resultados

### Result Pattern
```php
class ScanResult {
    private function __construct(
        private string $status,
        private ?string $reason = null,
        private array $data = []
    ) {}

    public static function success(array $data = []): self {
        return new self('OK', null, $data);
    }

    public static function invalid(string $reason): self {
        return new self('INVALID', $reason);
    }

    public static function duplicate(): self {
        return new self('DUPLICATE', 'Ticket ya usado');
    }

    public function toArray(): array {
        return [
            'status' => $this->status,
            'reason' => $this->reason,
            'data' => $this->data,
        ];
    }
}
```

### Excepciones de Dominio
```php
class DomainException extends Exception {
    // Excepciones que representan reglas de negocio violadas
}

class InsufficientSlotsException extends DomainException {
    public function __construct(int $available, int $required) {
        parent::__construct("Cupos insuficientes: {$available} disponibles, {$required} requeridos");
    }
}
```

## Transacciones y Consistencia

### Transacciones en Casos de Uso
```php
class ScanTicketUseCase {
    public function execute(string $qrString): ScanResult {
        // Validaciones previas (sin transacción)

        DB::transaction(function () use ($ticket) {
            // Operaciones que deben ser atómicas
            $this->ticketRepository->markAsUsed($ticket->id);
            $this->scanRepository->create($scanData);
            $this->auditoriumRepository->incrementOccupancy($auditoriumId);
        });

        return ScanResult::success();
    }
}
```

### Optimistic Locking
```php
// Para concurrencia alta
$model = TicketModel::where('id', $ticketId)
    ->where('used_at', null) // Condición de versión
    ->update(['used_at' => now()]);

if ($model === 0) {
    throw new ConcurrentModificationException();
}
```

## Testing Arquitectural

### Unit Tests - Entidades
```php
class TicketTest extends TestCase {
    public function testCannotUseExpiredTicket() {
        $pastDate = now()->subDays(2);
        $ticket = new Ticket(issuedAt: $pastDate);

        $this->assertFalse($ticket->canBeUsed());
        $this->assertTrue($ticket->isExpired());
    }
}
```

### Unit Tests - Casos de Uso
```php
class ScanTicketUseCaseTest extends TestCase {
    public function testValidQrReturnsSuccess() {
        $ticket = new Ticket(/* valid ticket */);
        $repo = $this->createMock(TicketRepositoryInterface::class);
        $repo->method('findByNonce')->willReturn($ticket);
        $repo->method('markAsUsed')->willReturn($ticket);

        $sigService = $this->createMock(SignatureServiceInterface::class);
        $sigService->method('verify')->willReturn(true);

        $useCase = new ScanTicketUseCase($repo, $sigService);
        $result = $useCase->execute('valid_qr_string');

        $this->assertEquals('OK', $result->status);
    }
}
```

### Integration Tests
```php
class ScanTicketIntegrationTest extends TestCase {
    public function testQrValidationUpdatesDatabase() {
        // Setup: Crear ticket en DB

        $result = $this->scanUseCase->execute($qrString);

        // Assertions: Verificar DB actualizada
        $this->assertDatabaseHas('tickets', ['used_at' => not null]);
        $this->assertDatabaseHas('scans', ['ticket_id' => $ticketId]);
    }
}
```

## Migraciones Arquitecturales

### De Monolito a Clean Architecture

**Paso 1: Extraer Entidades**
```php
// Antes: Modelo Eloquent con lógica
class Ticket extends Model {
    public function canBeUsed() { /* lógica aquí */ }
}

// Después: Entidad pura + Modelo
class Ticket extends Entity { /* lógica pura */ }
class TicketModel extends Model { /* solo persistencia */ }
```

**Paso 2: Crear Interfaces**
```php
interface TicketRepositoryInterface {
    public function findById(int $id): ?Ticket;
}
```

**Paso 3: Implementar Adaptadores**
```php
class EloquentTicketRepository implements TicketRepositoryInterface {
    public function findById(int $id): ?Ticket {
        $model = TicketModel::find($id);
        return $model ? $this->toEntity($model) : null;
    }
}
```

**Paso 4: Refactorizar Controladores**
```php
class ScanController extends Controller {
    public function __construct(private ScanTicketUseCase $useCase) {}

    public function validateQr(Request $request): JsonResponse {
        $result = $this->useCase->execute($request->qr_string);
        return response()->json($result->toArray());
    }
}
```

## Antipatrones a Evitar

### 1. Dependencias hacia afuera
```php
// ❌ Malo: Entidad depende de DB
class Ticket {
    public function save() {
        DB::table('tickets')->insert(/* ... */);
    }
}
```

### 2. Lógica de negocio en controladores
```php
// ❌ Malo: Lógica en controlador
class ScanController {
    public function validateQr(Request $request) {
        // Validar firma, buscar ticket, marcar usado...
        // 50+ líneas de lógica
    }
}
```

### 3. Interfaces contaminadas
```php
// ❌ Malo: Interfaz depende de framework
interface TicketRepositoryInterface {
    public function findById(int $id): ?EloquentModel;
}
```

### 4. Casos de uso inflados
```php
// ❌ Malo: Caso de uso hace todo
class ScanTicketUseCase {
    public function execute(string $qrString): ScanResult {
        // 100+ líneas: decode, verify, query, update, log...
    }
}
```

## Beneficios Obtenidos

### Mantenibilidad
- **Cambios localizados**: Modificar DB no afecta reglas de negocio
- **Refactoring seguro**: Tests protegen comportamiento
- **Código legible**: Separación clara de responsabilidades

### Testabilidad
- **Tests rápidos**: Mocks para dependencias externas
- **Cobertura alta**: Lógica pura fácilmente testeable
- **CI/CD confiable**: Feedback rápido de calidad

### Extensibilidad
- **Nuevas features**: Agregar casos de uso sin afectar existentes
- **Cambio de tecnología**: Nuevo ORM/Email sin cambiar negocio
- **Escalabilidad**: Separación facilita microservicios futuros

### Calidad
- **Bajo acoplamiento**: Cambios no se propagan
- **Alta cohesión**: Cada clase tiene responsabilidad única
- **Reglas protegidas**: Invariantes en entidades, validaciones en casos de uso

Esta guía establece las bases para un sistema mantenible, testeable y extensible que protege las reglas de negocio críticas del sistema anti-falsificación.