# Estimación por Puntos Función (Function Points)

## Metodología

Se utiliza la metodología IFPUG (International Function Point Users Group) para estimar el tamaño funcional del sistema. Los puntos función miden la funcionalidad entregada al usuario desde su perspectiva.

## Identificación de Funciones

### Archivos Lógicos Internos (ILF - Internal Logical Files)

| Función | Descripción | DET | RET | Complejidad | PF |
|---------|-------------|-----|-----|-------------|----|
| users | Tabla de usuarios (admin, staff, graduandos) | 8 | 1 | Baja | 7 |
| graduates | Datos de graduandos (cupos, user_id) | 5 | 1 | Baja | 7 |
| events | Eventos/auditorios | 6 | 1 | Baja | 7 |
| auditoriums | Auditorios por evento | 5 | 1 | Baja | 7 |
| invitations | Invitaciones creadas | 6 | 1 | Baja | 7 |
| tickets | Tickets con QR | 8 | 1 | Baja | 7 |
| scans | Registros de escaneos | 6 | 1 | Baja | 7 |
| imports | Historial de importaciones Excel | 5 | 1 | Baja | 7 |
| audit_logs | Logs de auditoría | 7 | 1 | Baja | 7 |
| **Total ILF** | | | | | **63** |

### Archivos Lógicos Externos (EIF - External Interface Files)

| Función | Descripción | DET | RET | Complejidad | PF |
|---------|-------------|-----|-----|-------------|----|
| Ninguno identificado | No hay archivos compartidos con otros sistemas | - | - | - | 0 |
| **Total EIF** | | | | | **0** |

### Entradas Externas (EI - External Inputs)

| Función | Descripción | DET | FTR | Complejidad | PF |
|---------|-------------|-----|-----|-------------|----|
| Importar Excel graduandos | Subir archivo Excel | 4 | 2 | Baja | 3 |
| Crear evento | Formulario evento | 5 | 1 | Baja | 3 |
| Crear auditorio | Formulario auditorio | 4 | 1 | Baja | 3 |
| Login graduando | Credenciales | 3 | 1 | Baja | 3 |
| Cambiar contraseña | Nueva password | 2 | 1 | Baja | 3 |
| Crear invitación | Seleccionar evento | 2 | 2 | Baja | 3 |
| Eliminar invitación | ID invitación | 1 | 1 | Baja | 3 |
| Validar QR | QR string | 5 | 3 | Media | 4 |
| Revocar ticket | ID ticket | 1 | 1 | Baja | 3 |
| **Total EI** | | | | | **28** |

### Salidas Externas (EO - External Outputs)

| Función | Descripción | DET | FTR | Complejidad | PF |
|---------|-------------|-----|-----|-------------|----|
| Resumen importación | Resultados carga Excel | 6 | 2 | Baja | 4 |
| Dashboard aforo | Métricas evento | 8 | 3 | Media | 5 |
| Lista invitaciones graduando | Invitaciones + estado | 7 | 2 | Baja | 4 |
| QR ticket | Imagen QR + payload | 6 | 2 | Baja | 4 |
| Resultado validación QR | OK/REJECT + reason | 4 | 2 | Baja | 4 |
| Perfil graduando | Datos + cupos | 5 | 1 | Baja | 4 |
| **Total EO** | | | | | **25** |

### Consultas Externas (EQ - External Inquiries)

| Función | Descripción | DET | FTR | Complejidad | PF |
|---------|-------------|-----|-----|-------------|----|
| Ver eventos | Lista eventos | 4 | 1 | Baja | 3 |
| Ver auditorios | Lista por evento | 4 | 1 | Baja | 3 |
| Buscar graduandos | Filtros admin | 5 | 2 | Baja | 3 |
| Ver logs auditoría | Filtros por acción | 6 | 3 | Media | 4 |
| Ver métricas evento | Gráficos tiempo real | 7 | 2 | Baja | 4 |
| **Total EQ** | | | | | **17** |

## Cálculo de Puntos Función No Ajustados

- ILF: 63
- EIF: 0
- EI: 28
- EO: 25
- EQ: 17
- **Total PF No Ajustados**: 63 + 0 + 28 + 25 + 17 = **133 PF**

## Factor de Ajuste al Valor (VAF - Value Adjustment Factor)

### Características Generales del Sistema (GSC - General System Characteristics)

| Característica | Descripción | Grado | Peso |
|---------------|-------------|-------|------|
| 1. Comunicación de datos | Procesamiento distribuido (API + PWA) | 2 | 10 |
| 2. Procesamiento distribuido | Múltiples usuarios concurrentes | 3 | 15 |
| 3. Rendimiento | Requisitos <150ms p95 | 4 | 20 |
| 4. Configuración altamente utilizada | Alta carga en validación QR | 4 | 20 |
| 5. Tasa de transacciones | Alta frecuencia escaneos | 4 | 20 |
| 6. Entrada de datos en línea | Formularios web | 3 | 15 |
| 7. Eficiencia del usuario final | UI intuitiva | 4 | 20 |
| 8. Actualización en línea | Actualizaciones en tiempo real | 4 | 20 |
| 9. Procesamiento complejo | Lógica QR + firma | 4 | 20 |
| 10. Reusabilidad | Código modular | 3 | 15 |
| 11. Facilidad de instalación | Docker opcional | 3 | 15 |
| 12. Facilidad de operación | Dashboard admin | 4 | 20 |
| 13. Múltiples sitios | Posible expansión | 2 | 10 |
| 14. Facilidad de cambios | Arquitectura limpia | 5 | 25 |
| **Total GSC** | | | **230** |

- VAF = 0.65 + (0.01 × 230) = 0.65 + 2.3 = **2.95**

## Puntos Función Ajustados

- PF Ajustados = 133 × 2.95 = **392.35** ≈ **392 PF**

## Estimación de Esfuerzo

### Asunciones
- Productividad promedio: 8-12 PF por persona-mes (usando 10 PF/mes para media complejidad).
- Equipo: 1 desarrollador full-stack.
- Overhead: 20% para gestión, testing, documentación.

### Cálculo
- Esfuerzo bruto: 392 / 10 = **39.2 persona-meses**
- Con overhead: 39.2 × 1.2 = **47.04 persona-meses**
- Duración estimada: 47 / 1 = **47 meses** (1 persona) o **6-8 meses** con equipo pequeño.

### Cronograma de Alto Nivel
1. **Mes 1-2**: Análisis, diseño, arquitectura.
2. **Mes 3-4**: Backend core (auth, modelos, API básica).
3. **Mes 5-6**: Features avanzadas (QR, validación, import Excel).
4. **Mes 7**: Frontend React.
5. **Mes 8**: Testing, CI/CD, documentación.

### Riesgos
- Complejidad QR/firma: +10% esfuerzo.
- Integración PWA offline: +5% esfuerzo.
- Optimización rendimiento: +5% esfuerzo.

Esta estimación es aproximada y debe refinarse con datos históricos del equipo.