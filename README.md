# SM Quality Tires · Demo conceptual v0.1

**Propuesta conceptual de demostración. No es el sitio oficial de SM Quality Tires.**
Estado: EN DESARROLLO · Versión 0.1 · Publicación NO autorizada.

Landing page privada hecha con HTML, CSS y JavaScript. Sin backend, base de datos, pagos, cookies, analítica ni librerías externas.

## Archivos

- `index.html`: estructura y contenido (14 secciones en el orden del Prompt Maestro).
- `styles.css`: estilos, móvil primero.
- `script.js`: configuración central y funciones.
- `assets/logo/`: logotipo de referencia (`.webp`).
- `assets/images/`: `taller-interior.webp` y `fachada.webp`, ya recortadas y optimizadas.

## Abrir localmente

Haz doble clic en `index.html`. No requiere servidor ni conexión.

## Cambiar datos (todo en el objeto `CONFIG` al inicio de `script.js`)

| Qué | Propiedad |
|---|---|
| Número de WhatsApp (solo dígitos, formato internacional) | `whatsapp` |
| Número visible | `numeroVisible` |
| Dirección | `direccion` y `mapsUrl` |
| Fecha de consulta de los datos públicos | `fechaConsulta` |
| Horarios del bloque de contacto | `horarios` |
| Activar o desactivar `[DEMO]` | `modoDemo` (`true` / `false`) |

Notas:
- Con `modoDemo: true` todo mensaje empieza con `[DEMO]`. Con `false` se quita el prefijo. La banda superior y el aviso del pie se mantienen siempre.
- Los textos del HTML ya traen estos valores por defecto. El script los reemplaza desde `CONFIG`. Además hay enlaces fijos `tel:` y de Google Maps en el HTML que el script sobrescribe al cargar.
- El texto de las preguntas frecuentes (horario) está escrito a mano en `index.html`: si cambian los horarios, edítalo también ahí.

## Funciones implementadas (todas con prueba automática en Chromium, ver checklist)

- Banda demostrativa fija, encabezado, menú móvil accesible (estado abierto/cerrado, foco, cierre con botón, enlace o Escape).
- Buscador conceptual de llantas: medida por tres campos o medida completa, validaciones, datos opcionales, resumen de errores.
- 16 chips de medidas observadas que completan el buscador.
- Servicios principales y servicios pendientes de confirmación, sin precios.
- Solicitud de cita (no confirma, no pide teléfono, placa, cédula, correo ni dirección).
- Categorías de productos y consulta de promociones (sin promociones concretas).
- Vista previa del mensaje, botón «Abrir WhatsApp» y botón «Copiar mensaje». Nada se envía automáticamente.
- Ubicación, horarios, cómo llegar, llamar, preguntas frecuentes y pie con aviso.

## No implementado (por decisión aprobada)

Precios, promociones vigentes, stock, inventario, pagos, confirmación automática de citas, envío de formularios, base de datos, backend, panel administrativo, analítica, cookies, publicación, dominio y hosting.

## Imágenes: tratamiento aplicado

- Interior: recortado a la izquierda para quitar el letrero Sportbet; persona difuminada.
- Fachada: recortada para quitar a la persona y la placa de la camioneta; difuminados los logotipos de terceros del rótulo. Quedan visibles el logotipo del negocio y su rótulo con Instagram y número.
- No se usan capturas de Google ni de WhatsApp.

## Limitaciones y puntos para revisar

1. **El logotipo contiene el texto «Detailing Automotriz»**, servicio excluido por DEC-009. Se usa sin modificar (DEC-006). Decisión pendiente: pedir al negocio una versión sin ese texto o aceptar la excepción en la demo.
2. Autorización del logotipo y de las fotografías para un sitio oficial: PENDIENTE DE CONFIRMACIÓN.
3. En la fachada puede quedar algún elemento de terceros pequeño (calcomanías, banderas). Revisar a ojo.
4. El botón «Copiar» usa el portapapeles del navegador. Al abrir con `file://` algunos navegadores solo permiten copiar con un método alternativo (incluido), pero conviene probarlo en el equipo de Martin.
5. Las fuentes son las del sistema, así que la tipografía varía según el dispositivo.
6. Pruebas manuales en teléfono real, lector de pantalla y zoom al 200 % siguen pendientes.
