# Cotizador Inteligente - MB Soluciones

Un sistema web moderno de cotizaciones y gestión de clientes diseñado para agilizar el proceso de ventas. Esta aplicación permite generar presupuestos detallados, mantener un directorio de clientes y exportar documentos comerciales (PDF) de manera rápida e intuitiva.

## 🛠️ Tecnologías y Lenguajes

El proyecto fue construido utilizando los estándares modernos del desarrollo web, enfocándose en la reactividad y el rendimiento:

- **Framework Core:** [Angular](https://angular.dev/) (Usando la nueva sintaxis de control de flujo `@if`, `@for` y Standalone Components).
- **Lenguaje Principal:** [TypeScript](https://www.typescriptlang.org/) para un tipado estricto y código seguro.
- **Estilos y UI:** [Tailwind CSS](https://tailwindcss.com/) para un diseño responsivo, limpio y utilitario sin depender de librerías de componentes pesadas.
- **Gestión de Estado:** **Angular Signals** (`signal`, `computed`). Se dejó atrás `RxJS` para la UI local, adoptando Signals para una reactividad granular y un rendimiento extremo.
- **Exportación de Documentos:** `jsPDF` y `jsPDF-AutoTable` para la generación dinámica de archivos PDF directamente desde el navegador.

## ✨ Funcionalidades Principales

### 1. Panel de Control (Dashboard)
- Visualización de métricas clave: Total histórico de cotizaciones y métricas del día actual.
- Historial filtrable por fecha de emisión para fácil seguimiento.

### 2. Generador de Cotizaciones Avanzado
- **Estructura Dinámica:** Permite agregar "Ítems Principales" (Títulos/Secciones) y "Sub-ítems" (Productos o Servicios).
- **Reordenamiento Inteligente:** No importa en qué orden ingrese los datos el usuario; el sistema automáticamente agrupa cada título con sus respectivos sub-ítems, asegurando un formato lógico en el documento final.
- **Cálculos Automáticos:** Subtotal, cálculo automático de IVA (19% Chile) y total final con formato de peso chileno (CLP) en tiempo real.
- **Exportación a PDF:** Genera un documento profesional listo para el cliente, incorporando el logo de la empresa (`logomb.jpg`), datos de contacto y una tabla detallada.

### 3. Directorio de Clientes
- Registro completo con nombre, RUT, contacto y observaciones.
- **Buscador en Tiempo Real:** Filtrado instantáneo por nombre o RUT.
- **Vista Optimizada:** Muestra los últimos 12 clientes ingresados (ordenados de más reciente a más antiguo) para mantener una interfaz limpia, sin perder acceso al historial completo mediante la búsqueda.
- Integración directa: Botón rápido para generar una cotización pre-llenada para un cliente específico desde el directorio.

### 4. Historial de Cotizaciones
- Almacenamiento local temporal de las cotizaciones emitidas.
- Búsqueda inteligente por nombre de cliente o número de cotización (Ej: "COT-001").

## 🚀 Optimizaciones Destacadas

- **Change Detection "OnPush":** Gracias al uso exclusivo de Signals, el componente principal (`ChangeDetectionStrategy.OnPush`) solo se renderiza cuando los datos específicos cambian, ahorrando recursos de CPU y memoria.
- **Sintaxis de Control Moderna:** Uso de `@for (track id)` que optimiza enormemente la renderización de listas y tablas en el DOM, evitando recrear elementos innecesarios.
- **Manejo de Memoria:** Los modales y cálculos derivados (`computed()`) se ejecutan y limpian de forma nativa por el framework, previniendo fugas de memoria (memory leaks).
- **Formateo "As you type":** Optimización en las entradas numéricas que formatea en tiempo real a moneda chilena (puntos separadores de miles) sin perder el valor matemático subyacente para los cálculos del sistema.

## 📦 Inicialización del Proyecto

Para correr este proyecto en modo desarrollo local:

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar el servidor local:
   ```bash
   ng serve
   ```
3. Navegar a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias cualquiera de los archivos fuente.
