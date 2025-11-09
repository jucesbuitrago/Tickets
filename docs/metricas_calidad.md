# Métricas de Calidad del Software

## Atributos de Calidad y Decisiones Arquitecturales

| Atributo | Descripción | Decisiones Arquitecturales | Métricas Asociadas |
|----------|-------------|-----------------------------|---------------------|
| **Seguridad** | Protección contra falsificación y acceso no autorizado | Firma HMAC con rotación de claves, JWT con expiración corta, RBAC con políticas | Cobertura de pruebas de seguridad, tiempo de rotación de claves |
| **Disponibilidad** | Sistema operativo bajo carga alta | Colas para procesamiento asíncrono, caché Redis, reintentos exponenciales | Uptime SLA (99.9%), tiempo de respuesta p95 <150ms |
| **Mantenibilidad** | Facilidad para agregar features y corregir bugs | Arquitectura limpia, separación de capas, inyección de dependencias | Índice de mantenibilidad, acoplamiento aferente/eferente |
| **Rendimiento** | Respuestas rápidas en validación QR | Optimización de queries, índices DB, caché | Latencia p95, throughput (req/s), uso de CPU/memoria |
| **Usabilidad** | Interfaz intuitiva para usuarios no técnicos | PWA responsive, navegación simple, feedback claro | Tasa de abandono, tiempo de tarea, accesibilidad WCAG AA |
| **Portabilidad** | Despliegue en diferentes entornos | Contenedores Docker, configuración .env | Cobertura de entornos de testing |

## Métricas de Código Fuente

### Complejidad Ciclomática (McCabe)

- **Herramienta**: PHPDepend, PHPMD para backend; ESLint + complexity plugin para frontend.
- **Fórmula**: M = E - N + 2P (E: aristas, N: nodos, P: componentes conectados).
- **Umbrales**:
  - Funciones: ≤10 (aceptable), >15 (refactorizar).
  - Clases: ≤50 (aceptable), >100 (dividir).
- **Aplicación**: Medir en rutas críticas como `ScanTicketUseCase::execute()`, `QrValidator::validate()`.
- **Meta**: Promedio ≤8 por función, máximo 15.

### Cobertura de Código

- **Herramienta**: PHPUnit con Xdebug para backend; Jest con Istanbul para frontend.
- **Tipos**: Line, branch, function coverage.
- **Umbrales**:
  - Unitarias: ≥85% líneas, ≥80% branches.
  - Integración: ≥70% líneas.
  - E2E: ≥60% líneas (focus en flujos críticos).
- **Meta Global**: ≥80% cobertura total.
- **Exclusiones**: Código generado (migrations), config, tests.

### Duplicación de Código (Code Duplication)

- **Herramienta**: PHPCPD para backend; ESLint duplicate-code plugin para frontend.
- **Umbral**: ≤3% duplicación (líneas duplicadas / total líneas).
- **Meta**: <2% duplicación.
- **Aplicación**: Refactorizar duplicados en métodos compartidos (e.g., validación de cupos).

### Índice de Mantenibilidad (Maintainability Index)

- **Herramienta**: PHPDepend, Visual Studio Code Metrics.
- **Fórmula**: MI = 171 - 5.2*ln(V) - 0.23*CC - 16.2*ln(LOC) + 50*sin(sqrt(2.4*CM))
  - V: volumen Halstead
  - CC: complejidad ciclomática
  - LOC: líneas de código
  - CM: porcentaje comentado
- **Umbrales**: >85 (bueno), 65-85 (aceptable), <65 (mejorar).
- **Meta**: Promedio >80.

## Métricas de Diseño

### Acoplamiento (Coupling)

- **Acoplamiento Aferente (Ca)**: Número de clases que dependen de esta clase.
- **Acoplamiento Eferente (Ce)**: Número de clases de las que depende esta clase.
- **Inestabilidad (I)**: I = Ce / (Ca + Ce)
  - I=0: Completamente estable (solo dependencias entrantes).
  - I=1: Completamente inestable (solo dependencias salientes).
- **Umbrales**: I ≤0.5 para clases de negocio; I >0.8 para clases de infraestructura.
- **Meta**: Entidades I<0.3; Casos de uso I<0.5; Infraestructura I>0.7.

### Cohesión (Cohesion)

- **LCOM (Lack of Cohesion in Methods)**: Mide si métodos de una clase usan las mismas variables de instancia.
- **Fórmula**: LCOM = |P| - |Q| si |P| > |Q|, else 0 (P: pares métodos sin variables compartidas, Q: con variables compartidas).
- **Umbrales**: LCOM ≤1 (alta cohesión), >2 (baja, refactorizar).
- **Meta**: Promedio LCOM <1.5 por clase.

### Estabilidad y Abstracción

- **Distancia de la Secuencia Principal (D)**: D = |A + I - 1|
  - A: Abstracción (métodos abstractos / total métodos).
  - I: Inestabilidad.
- **Umbral**: D≈0 (zona de máxima estabilidad y abstracción).
- **Meta**: D <0.2 para paquetes core.

## Métricas de Arquitectura

### Tiempo de Ciclo de Cambios (Lead Time for Changes)

- **Medición**: Tiempo desde commit hasta despliegue en producción.
- **Meta**: <1 hora para hotfixes, <1 día para features.
- **Herramienta**: Git logs + CI/CD timestamps.

### Tasa de Fallos en Producción

- **Medición**: Bugs por release / líneas de código.
- **Meta**: <0.5 bugs/KLOC.

### Cobertura de Pruebas por Nivel

- **Unitarias**: 70% del esfuerzo total de testing.
- **Integración**: 20%.
- **E2E**: 10%.

## Reportes en CI/CD

### Pipeline de Calidad

```yaml
# .github/workflows/quality.yml
name: Quality Checks
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.2
      - name: Install dependencies
        run: composer install
      - name: Run PHPMD
        run: vendor/bin/phpmd app/ text codesize,unusedcode,naming
      - name: Run PHPStan
        run: vendor/bin/phpstan analyse
      - name: Run PHPUnit with coverage
        run: vendor/bin/phpunit --coverage-clover=coverage.xml
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: coverage.xml
      - name: Check complexity
        run: vendor/bin/phpmd app/ text cyclomaticcomplexity --reportfile complexity.xml
```

### Dashboard de Métricas

- **Herramientas**: SonarQube, CodeClimate, o custom con GitHub Actions.
- **Alertas**: Notificaciones si cobertura <80%, complejidad >15, duplicación >3%.
- **Tendencias**: Gráficos históricos para identificar degradación.

## Mejora Continua

- **Revisiones por Pares**: Obligatorias para cambios >50 líneas.
- **Refactoring**: Ciclos dedicados post-release.
- **Benchmarks**: Comparación con estándares de la industria (e.g., OWASP para seguridad).

Estas métricas se miden automáticamente en CI y se reportan en cada PR/merge.