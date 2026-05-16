# Cotizador Inteligente — MB Soluciones SpA

> Sistema web comercial moderno para generación de cotizaciones, gestión de clientes y control de ventas. Construido con **Angular 19**, **Supabase** y **Tailwind CSS**, desplegado en producción sobre **Netlify**.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | [Angular 19](https://angular.dev/) — Standalone Components, SSR, nueva sintaxis `@if` / `@for` |
| Lenguaje | [TypeScript](https://www.typescriptlang.org/) — tipado estricto end-to-end |
| Estado reactivo | **Angular Signals** (`signal`, `computed`) — sin RxJS en la UI local |
| Estilos | [Tailwind CSS](https://tailwindcss.com/) — diseño responsivo, dark-friendly |
| Base de datos | [Supabase](https://supabase.com/) (PostgreSQL) — CRUD en tiempo real vía cliente REST |
| Generación PDF | `jsPDF` + `jsPDF-AutoTable` — carga dinámica lazy para no penalizar el bundle inicial |
| Renderizado | SSR (Server-Side Rendering) con Angular Universal |
| Deploy | [Netlify](https://www.netlify.com/) — CI/CD automático desde rama `main` |

---

## Funcionalidades Principales

### Autenticación con Roles
- Sistema de login con múltiples usuarios definidos en variables de entorno
- Roles diferenciados: **Admin** y **Vendedor**
- Card de usuario activo visible en el sidebar con nombre y rol

### Panel de Control (Dashboard)
- Métricas en tiempo real: total facturado histórico, cotizaciones del día y del mes
- **Filtros avanzados combinados**: rango de fechas (Desde / Hasta) y búsqueda por cliente simultáneos
- Botón "Limpiar filtros" contextual que aparece solo cuando hay filtros activos

### Generador de Cotizaciones
- Estructura dinámica con **Ítems Principales** (secciones) y **Sub-ítems** (productos/servicios)
- Reordenamiento automático: agrupa títulos con sus sub-ítems en el PDF sin importar el orden de ingreso
- Cálculo automático de subtotal, **IVA 19% (Chile)** y total en CLP con formato de miles en tiempo real
- Campo de **Notas / Observaciones** por cotización
- Selector de **Estado**: `Pendiente`, `Aprobada` o `Rechazada`
- Validación de duplicados por número de cotización antes de guardar

### Vista Previa y Exportación PDF
- Botón **Vista Previa** que abre un modal con el PDF renderizado en iframe (base64 data URI, sin restricciones CSP)
- Botón **Descargar PDF** desde el modal de vista previa
- Exportación directa a PDF profesional con logo, datos de empresa y tabla detallada

### Historial de Cotizaciones
- Búsqueda instantánea por número o nombre de cliente
- **Badges de estado** con color: ámbar (pendiente), verde (aprobada), rojo (rechazada)
- Botón **Duplicar cotización**: clona ítems, cliente y notas en el editor para editar y guardar como nueva
- Edición y eliminación de cotizaciones existentes

### Directorio de Clientes
- Registro completo: nombre, RUT, teléfono, email, dirección y observaciones
- **Validación de RUT chileno** con algoritmo módulo-11 en tiempo real (dígito verificador)
- Buscador por nombre o RUT con resultados instantáneos
- Acceso directo: botón para pre-llenar una cotización con los datos del cliente seleccionado

### Catálogo de Productos
- CRUD completo de productos con nombre, descripción y precio neto
- Inserción rápida desde el catálogo al formulario de cotización activo

---

## Arquitectura y Optimizaciones

- **`ChangeDetectionStrategy.OnPush`** en el componente principal: se re-renderiza únicamente cuando cambian los signals, minimizando ciclos innecesarios de detección
- **`computed()` signals** para todos los valores derivados (totales, filtros, búsquedas), garantizando caché automático y zero recalculation en renders sin cambios
- **`@for (track id)`** en todas las listas: Angular reutiliza nodos DOM en lugar de recrearlos, con un beneficio notable en tablas con muchos ítems
- **Lazy loading de librerías PDF**: `jsPDF` y `AutoTable` se cargan desde CDN solo cuando el usuario genera un PDF, reduciendo el bundle inicial en ~300 kB
- **SSR con guards de plataforma**: toda lógica de browser (`afterNextRender`, `isPlatformBrowser`) está correctamente aislada para evitar errores durante el renderizado en servidor

---

## Configuración del Proyecto

### Variables de entorno

Editar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'TU_URL_SUPABASE',
  supabaseKey: 'TU_ANON_KEY',
  validUsers: [
    { username: 'admin', password: 'password', role: 'admin', displayName: 'Administrador' }
  ]
};
```

### Migraciones Supabase

Ejecutar en el SQL Editor de Supabase para habilitar los campos de estado y notas:

```sql
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS notas TEXT DEFAULT '';
ALTER TABLE cotizaciones ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'pendiente';
```

### Desarrollo local

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo en http://localhost:4200
ng serve

# Build de producción
ng build
```

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── app.ts              # Componente principal — lógica completa con Signals
│   └── supabase.service.ts # Servicio CRUD para Supabase
├── environments/
│   └── environment.ts      # Configuración y usuarios
└── public/
    └── logomb.jpg          # Logo empresa (usado en PDFs generados)
```

---

## Licencia

Proyecto privado — MB Soluciones SpA. Todos los derechos reservados.
