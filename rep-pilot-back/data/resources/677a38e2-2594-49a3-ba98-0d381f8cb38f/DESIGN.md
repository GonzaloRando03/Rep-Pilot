# DESIGN — Importador de Trámites

## Intención del producto

Aplicación de escritorio (Electron) para la automatización de trámites agrícolas ante la Junta de Andalucía. La interfaz debe transmitir:

- Seriedad institucional y alineación con la imagen corporativa de la Junta de Andalucía.
- Claridad operativa para usuarios no técnicos (técnicos de campo, gestores agrícolas).
- Confianza en el manejo de documentación oficial y certificados digitales.

## Principios de experiencia

1. Claridad antes que estética: el estado de cada operación debe ser siempre visible.
2. Jerarquía tipográfica institucional, sin ornamentación innecesaria.
3. Retroalimentación inmediata y explícita ante cada acción del usuario.
4. Fidelidad a los estándares de accesibilidad WCAG 2.1 nivel AA (RD 1112/2018).
5. Coherencia visual con los portales oficiales de la Junta de Andalucía.

## Dirección visual

- Estilo: institucional andaluz, sobrio y funcional.
- Paleta: verde corporativo JdA como color primario, blanco como fondo base.
- Iconografía: línea sencilla, monocroma, tamaño mínimo 20×20 px.
- Superficies: bordes rectos o radio mínimo; sin sombras decorativas.
- Movimiento: únicamente funcional, breve y discreto.

## Tokens de color

Usar siempre tokens semánticos; nunca valores hexadecimales directos en componentes.

Los colores se basan en la identidad visual corporativa de la Junta de Andalucía
(Manual de Identidad Visual Corporativa 2023).

```css
:root {
  /* Paleta institucional JdA */
  --color-jda-verde: #007a3d; /* verde corporativo principal */
  --color-jda-verde-oscuro: #005c2f; /* verde oscuro / hover primario */
  --color-jda-verde-claro: #e8f5ee; /* verde muy claro / fondos activos */
  --color-jda-rojo: #c41230; /* rojo institucional (alertas críticas) */
  --color-jda-amarillo: #f5a800; /* amarillo institucional (advertencias) */

  /* Superficies y fondos */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-bg-sidebar: #f0f0f0;
  --color-surface-raised: #ffffff;

  /* Texto */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #595959;
  --color-text-disabled: #999999;
  --color-text-on-primary: #ffffff; /* texto sobre --color-jda-verde */

  /* Bordes */
  --color-border-default: #cccccc;
  --color-border-focus: #007a3d;

  /* Estados semánticos */
  --color-state-success-bg: #e8f5ee;
  --color-state-success-text: #005c2f;
  --color-state-warning-bg: #fff8e1;
  --color-state-warning-text: #7a5000;
  --color-state-error-bg: #fdecea;
  --color-state-error-text: #8b0000;
  --color-state-info-bg: #e3f2fd;
  --color-state-info-text: #0d47a1;

  /* Anillo de foco (accesibilidad) */
  --color-focus-ring: #007a3d;
  --color-focus-ring-offset: #ffffff;
}
```

## Tipografía

La Junta de Andalucía emplea **Source Sans Pro** como tipografía estándar en sus portales
y aplicaciones institucionales. Para el renderer Electron se carga desde la carpeta `assets/fonts/`
para garantizar disponibilidad sin conexión.

```css
--font-sans: "Source Sans Pro", "Segoe UI", "Arial", sans-serif;
```

Escala tipográfica:

| Token     | Tamaño/Altura | Peso | Uso                             |
| --------- | ------------- | ---- | ------------------------------- |
| heading-1 | 24 / 32 px    | 600  | Título de sección o pantalla    |
| heading-2 | 18 / 26 px    | 600  | Subtítulo / nombre de trámite   |
| heading-3 | 16 / 24 px    | 600  | Encabezado de grupo de campos   |
| body-lg   | 15 / 24 px    | 400  | Texto de párrafo principal      |
| body-md   | 14 / 22 px    | 400  | Texto de formularios y tablas   |
| body-sm   | 12 / 18 px    | 400  | Metadatos y ayuda contextual    |
| label     | 12 / 16 px    | 600  | Etiqueta de campo (uppercase)   |
| code      | 13 / 20 px    | 400  | Rutas de archivo, logs técnicos |

Reglas:

- Solo pesos 400 y 600.
- Las etiquetas de campo van en mayúsculas pequeñas con tracking +0.05em.
- Longitud de línea recomendada: 60–80 caracteres en cuerpo de texto.
- No usar itálica para énfasis en UI; usar negritas o cambios de color semántico.

## Tokens de espaciado y tamaño

Base de 4 px.

| Token    | Valor |
| -------- | ----- |
| space-1  | 4 px  |
| space-2  | 8 px  |
| space-3  | 12 px |
| space-4  | 16 px |
| space-5  | 20 px |
| space-6  | 24 px |
| space-8  | 32 px |
| space-10 | 40 px |
| space-12 | 48 px |

Radios:

- `radius-none`: 0
- `radius-sm`: 4 px (campos, botones)
- `radius-md`: 6 px (tarjetas, paneles)

Bordes:

- `border-default`: 1px solid var(--color-border-default)
- `border-focus`: 2px solid var(--color-focus-ring)
- `border-error`: 1px solid var(--color-jda-rojo)

Elevación:

- `shadow-0`: none
- `shadow-1`: 0 1px 3px rgba(0,0,0,0.12)
- `shadow-2`: 0 2px 8px rgba(0,0,0,0.16)

## Tokens de movimiento

- `duration-fast`: 120 ms
- `duration-normal`: 180 ms
- `easing-standard`: cubic-bezier(0.2, 0, 0, 1)

Reglas:

- Solo animar `opacity`, `transform` y `box-shadow`.
- Sin rebotes ni animaciones decorativas.
- Las transiciones de estado (carga, error, éxito) son las únicas animaciones permitidas.

## Contrato de accesibilidad (WCAG 2.1 AA / RD 1112/2018)

- Contraste mínimo texto/fondo: 4.5:1 para texto normal, 3:1 para texto grande.
- Foco de teclado visible en todos los elementos interactivos (anillo de 2 px en `--color-focus-ring`).
- Tamaño mínimo de área interactiva: 44×44 px.
- Landmarks HTML semánticos y jerarquía de encabezados correcta.
- Todas las imágenes informativas tienen `alt`. Las decorativas tienen `alt=""`.
- Etiquetas explícitas (`<label>`) asociadas a cada campo del formulario.
- Mensajes de error asociados al campo mediante `aria-describedby`.
- No depender únicamente del color para transmitir información de estado.

## Cabecera institucional

La cabecera de la aplicación debe incluir siempre:

1. **Logotipo de la Junta de Andalucía** (versión horizontal, color positivo) alineado a la izquierda.
2. **Nombre de la aplicación** en `heading-2`, color `--color-text-primary`, a la derecha del logotipo.
3. Fondo blanco (`--color-bg-primary`) con línea inferior de 3 px en `--color-jda-verde`.

No modificar ni distorsionar el logotipo oficial. Respetar el área de protección mínima
equivalente a la altura de la "J" del logotipo a cada lado.

## Sistema de componentes

Todos los componentes deben tener los estados: `default`, `hover`, `focus`, `disabled` y `loading`
cuando sea aplicable.

### Botones

Variantes:

- **Primario**: fondo `--color-jda-verde`, texto `--color-text-on-primary`. Hover: `--color-jda-verde-oscuro`.
- **Secundario**: borde `--color-jda-verde`, texto `--color-jda-verde`, fondo transparente.
- **Peligroso**: fondo `--color-jda-rojo`, texto blanco. Solo para acciones destructivas o críticas.
- **Fantasma**: sin borde visible, texto `--color-text-secondary`. Para acciones de baja jerarquía.

API de contrato:

- tamaños: `sm` (28 px alto), `md` (36 px alto), `lg` (44 px alto)
- `fullWidth`: boolean
- `iconoInicio` / `iconoFin`: opcionales

### Campos de texto y desplegables

- Etiqueta en `label` token, obligatoria y visible siempre encima del campo.
- Texto de ayuda en `body-sm`, color `--color-text-secondary`.
- Estado inválido: borde `--border-error` + icono de error + mensaje en `--color-state-error-text`.
- Estado deshabilitado: fondo `--color-bg-secondary`, texto `--color-text-disabled`, cursor `not-allowed`.

### Panel de estado de trámite

Muestra el estado actual de la automatización en curso.

Campos requeridos:

- Nombre del trámite
- Plataforma (Formulavea, Plantillavea, Procesavea, TrewaAdm)
- Estado: Pendiente / En proceso / Completado / Error
- Mensaje de progreso (texto libre, actualizable en tiempo real)
- Porcentaje o barra de progreso cuando aplique

Estados visuales:

- Pendiente: fondo `--color-bg-secondary`, sin indicador de color de acento.
- En proceso: borde izquierdo 4 px `--color-jda-verde`; spinner discreto.
- Completado: fondo `--color-state-success-bg`, icono de marca de verificación verde.
- Error: fondo `--color-state-error-bg`, borde `--color-jda-rojo`, mensaje de error legible.

### Tabla de trámites

Columnas: Expediente, Plataforma, Estado, Fecha, Acciones.

Reglas:

- Cabecera fija al hacer scroll vertical.
- Filas con padding `space-3` vertical, `space-4` horizontal.
- Acción principal de la fila accesible por teclado (Enter / Espacio).
- Sin cebrado de filas; separación únicamente por borde inferior `--border-default`.

### Selector de certificado digital

- Dos modos claramente diferenciados: «Archivo .p12/.pfx» y «Almacén Windows».
- Campo de contraseña con opción de mostrar/ocultar (`aria-label` actualizado dinámicamente).
- Botón «Verificar certificado» con estado de carga y resultado visible.
- Nunca mostrar ni persistir la contraseña del certificado en texto plano.

### Mensajes de sistema (toasts / notificaciones)

- Duración visible: 4 s para informativos, persistentes para errores hasta cierre manual.
- Posición: esquina inferior derecha, apilables.
- Variantes: `info`, `success`, `warning`, `error`. Siempre incluir icono y texto descriptivo.
- Accesibles como rol `alert` o `status` según urgencia.

### Modales de confirmación

- Título claro de la acción y consecuencias en una frase.
- La acción destructiva o irreversible lleva el estilo de botón «Peligroso».
- Siempre con control de cierre (×) y respuesta a tecla Escape.
- No usar modales para mostrar solo información; preferir mensajes inline o toasts.

## Planos de layout

### 1) Pantalla principal

Estructura:

- **Cabecera**: logotipo JdA + nombre de la aplicación.
- **Panel lateral izquierdo** (200 px fijo): navegación entre módulos (Certificados, Trámites, Configuración, Log).
- **Área de contenido principal**: ocupa el espacio restante; adapta su contenido según módulo activo.
- **Barra de estado inferior** (24 px): certificado cargado, estado de conexión.

### 2) Módulo de certificados

Estructura:

- Selector de modo (archivo / almacén Windows).
- Formulario de carga del certificado.
- Panel de estado del certificado activo (sujeto, validez, emisor).
- Botón de acción principal: «Usar este certificado».

### 3) Módulo de trámites

Estructura:

- Filtros en cabecera: plataforma, estado, fecha.
- Tabla de trámites con acciones por fila.
- Panel de detalle lateral (slide-in) al seleccionar un trámite.

### 4) Módulo de configuración

Estructura:

- Formulario agrupado por secciones: General, Automatización, Rutas de archivos.
- Botón «Guardar» fijo al fondo del formulario.
- Cambios no guardados señalizados con indicador visible.

### 5) Ventana de progreso de automatización

Estructura:

- Panel de estado de trámite (ver componente).
- Log técnico expandible en la parte inferior (texto monoespacio, `code` token).
- Botón «Cancelar» disponible durante el proceso; «Cerrar» al finalizar.

## Reglas de interacción

- Los efectos hover son sutiles: cambio de fondo de un tono, sin animaciones complejas.
- El estado de carga bloquea el botón y muestra un spinner pequeño dentro del mismo.
- Los campos de ruta de archivo usan un botón «Examinar...» estándar del sistema.
- Nunca ocultar controles críticos detrás de gestos complejos o menús de varios niveles.
- El log técnico es de solo lectura; ofrecer botón de copia al portapapeles.

## Notas de implementación para el frontend

- Construir cada componente de forma independiente y reutilizable desde `ui/components/`.
- Los archivos de pantalla (`ui/views/`) son capas de composición, sin lógica de negocio.
- Reutilizar primitivos existentes antes de crear variantes nuevas.
- Aplicar tokens CSS definidos en `ui/style.css`; nunca valores literales en componentes.
- El renderer no accede a APIs de Node directamente; solo vía `contextBridge` / IPC.
