# Supuestos y Riesgos del Sistema

## Supuestos del Sistema

### Supuestos Técnicos
1. **Excel de entrada**: Formato fijo con columnas {nombre_completo, correo, identificacion_opcional, cupos_permitidos}
2. **Contraseña temporal**: Expira en 24 horas desde envío
3. **Evento único**: Sistema diseñado para un evento por vez inicialmente
4. **Capacidad auditorio**: Máximo 1000 asistentes por auditorio
5. **Conectividad**: API disponible 99.9% del tiempo
6. **Dispositivos lectores**: Móviles con cámara y conexión intermitente aceptable

### Supuestos de Negocio
1. **Graduando único**: Un usuario = un graduando con cupos asignados
2. **Invitaciones ilimitadas**: Graduando puede crear invitaciones hasta su cupo
3. **Ticket único uso**: Un ticket = un ingreso válido
4. **Tiempo real**: Dashboard actualiza cada 30 segundos
5. **Auditoría completa**: Todos los cambios se registran

### Supuestos de Seguridad
1. **Claves HMAC**: Rotan automáticamente cada 24 horas
2. **JWT expiración**: Tokens válidos máximo 1 hora
3. **Rate limiting**: 10 validaciones por minuto por dispositivo
4. **Nonce único**: Cada ticket tiene identificador único global

## Riesgos Identificados

### Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| **Escalabilidad picos** | Alta | Alto | Cache Redis + colas asíncronas + rate limiting |
| **Conectividad intermitente** | Media | Medio | PWA offline + sincronización background |
| **Fraude avanzado** | Media | Alto | Firma HMAC + nonce + rotación claves |
| **Caídas DB** | Baja | Alto | Replicación + circuit breaker + reintentos |
| **Dependencias externas** | Baja | Medio | Fallbacks + timeouts + mocks en tests |

### Riesgos de Negocio

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| **Cambio requisitos** | Alta | Medio | Arquitectura limpia + feature flags |
| **Adopción usuarios** | Media | Alto | UX intuitiva + training + soporte |
| **Datos incorrectos Excel** | Media | Alto | Validación robusta + feedback inmediato |
| **Sobrecupo auditorios** | Baja | Alto | Validaciones capacidad + alertas |
| **Quejas soporte** | Media | Medio | Dashboard auditoría + logs detallados |

### Riesgos de Seguridad

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| **Manipulación QR** | Media | Alto | Firma HMAC + verificación doble |
| **Ataques replay** | Baja | Alto | Nonce único + estado usado |
| **Exposición datos** | Baja | Alto | Encriptación + políticas RBAC |
| **Denegación servicio** | Baja | Medio | Rate limiting + WAF |
| **Credenciales comprometidas** | Baja | Alto | Cambio obligatorio primer login |

## Matriz de Riesgos

### Nivel de Riesgo = Probabilidad × Impacto

- **Crítico** (9-12): Escalabilidad picos, fraude avanzado
- **Alto** (6-8): Conectividad, adopción usuarios, datos Excel
- **Medio** (3-5): Caídas DB, cambios requisitos, soporte
- **Bajo** (1-2): Dependencias externas, sobrecupo, ataques replay

## Plan de Contingencia

### Para Riesgos Críticos

#### Escalabilidad Picos
- **Detección**: Métricas >200 req/s
- **Respuesta**: Auto-scaling API + cache agresivo
- **Recuperación**: Monitoreo post-evento + optimización

#### Fraude Avanzado
- **Detección**: Alertas en logs de validación
- **Respuesta**: Revocación inmediata + rotación claves
- **Recuperación**: Análisis forense + mejoras seguridad

### Para Riesgos Altos

#### Conectividad Intermitente
- **Detección**: >5% requests fallidos
- **Respuesta**: Modo offline PWA + cola local
- **Recuperación**: Sincronización batch + reconciliación

#### Adopción Usuarios
- **Detección**: <80% graduandos registrados
- **Respuesta**: Campaña comunicación + soporte dedicado
- **Recuperación**: Feedback loops + mejoras UX

#### Datos Incorrectos Excel
- **Detección**: >10% errores en importación
- **Respuesta**: Validación pre-import + corrección manual
- **Recuperación**: Templates mejorados + training admins

## Opciones Arquitecturales Consideradas

### Opción 1: Monolito Laravel (Elegida)
**Pros**:
- Desarrollo rápido
- Menos complejidad operacional
- Transacciones ACID simples

**Cons**:
- Escalabilidad vertical limitada
- Tecnologías acopladas

**Decisión**: Adecuado para MVP, evolución a microservicios futura

### Opción 2: Microservicios desde inicio
**Pros**:
- Escalabilidad horizontal
- Tecnologías independientes
- Despliegue independiente

**Cons**:
- Complejidad alta
- Latencia entre servicios
- Costo operacional mayor

**Decisión**: Overkill para alcance actual, considerar en fase 2

### Opción 3: Serverless
**Pros**:
- Auto-scaling infinito
- Costo por uso
- Mantenimiento cero infraestructura

**Cons**:
- Vendor lock-in
- Latencia cold starts
- Debugging complejo

**Decisión**: Buena para funciones específicas, no para core

## Métricas de Riesgo

### KPIs de Monitoreo Continuo
- **Disponibilidad**: 99.9% uptime API
- **Rendimiento**: <150ms p95 validación QR
- **Seguridad**: 0 breaches en producción
- **Usuario**: >95% satisfacción post-evento

### Alertas Automáticas
- Error rate >5%
- Latencia >200ms
- Validaciones fraudulentas >0
- Usuarios offline >10%

## Plan de Mitigación General

1. **Prevención**: Arquitectura robusta + pruebas exhaustivas
2. **Detección**: Monitoring continuo + alertas
3. **Respuesta**: Playbooks definidos + equipo on-call
4. **Recuperación**: Backups + disaster recovery
5. **Aprendizaje**: Post-mortems + mejoras continuas

## Riesgos Residuales

Después de mitigaciones, riesgos que permanecen:
- **Cambio requisitos negocio**: Mitigado parcialmente por clean architecture
- **Adopción tecnológica**: Mitigado por PWA standards
- **Regulaciones privacidad**: Mitigado por encriptación y auditoría

Estos riesgos se consideran aceptables dado el alcance del proyecto y se monitorizarán continuamente.