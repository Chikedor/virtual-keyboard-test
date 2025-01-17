# Changelog

## [Unreleased]

### Added

- Opción para cambiar entre layouts QWERTY y ABC
- Distribución dinámica de teclas
- Ajuste automático de tamaño según espacio disponible
- Panel de configuración con:
  - Control de tiempo de pulsación
  - Control de tamaño de teclas
  - Control de tamaño de fuente independiente para teclado y área de texto
  - Modo de barrido
  - Selector de layout
- Configuración para despliegue en Vercel
- Soporte para acceso web público
- Botón para mostrar/ocultar área de texto
- Área de texto desplegable (0-60vh)
- Scroll independiente para el teclado
- Detección mejorada de teclas al deslizar
- Display de texto en tiempo real en la barra superior
- Distribución uniforme de teclas a lo ancho
- Espacio adaptativo en última fila
- Documentación completa en inglés (README.md)
- Sistema de redistribución de teclas en múltiples filas
- Atributos ARIA completos para accesibilidad
  - `role="application"` para el teclado
  - `role="banner"` para la barra superior
  - `role="dialog"` para configuración
  - `role="toolbar"` para controles rápidos
  - `role="region"` para área de texto
  - Etiquetas y descripciones ARIA para todos los elementos
  - Estados y propiedades ARIA para interactividad
  - Roles semánticos para mejor navegación
- Local storage para persistencia de configuraciones de usuario
- Botón de reset para restaurar configuraciones por defecto
- Optimización del manejo táctil con sistema de caché
- Soporte para hasta 26 filas (1 letra por fila)
- Reducción del tiempo de pulsación por defecto a 0.1s
- Prevención de selección de texto en todo el teclado

### Changed

- Refactorización del sistema de layouts para mayor flexibilidad
- Mejora en el cálculo de tamaños de teclas
  - Cambio de porcentaje a número de filas (2-12)
  - Cálculo automático del tamaño basado en espacio disponible
  - Mejor distribución de teclas especiales
- Aumento de límites de tamaño de texto
  - Teclado: hasta 80em
  - Área de texto: hasta 15em
- Mejora en el cálculo de layout
  - Distribución uniforme en filas
  - Adaptación automática al número de filas
  - Mejor manejo de teclas especiales
- Aumentado el tamaño máximo del texto hasta 500%
- Simplificada la interfaz mostrando tamaños en porcentajes
- Mejorado el contraste en modo oscuro
- Ajustados los colores del área de texto para mejor visibilidad
- Aumentado el tamaño máximo de teclas hasta 600%
- Reorganizada la interfaz para mejor usabilidad
- Mejorado el sistema de scroll vertical
- Optimizado el manejo táctil en toda el área
- Barra superior más compacta y funcional
- Símbolos especiales más intuitivos (⌫, ␣)
- Distribución en cuadrícula uniforme
- Manejo mejorado de teclas especiales
- Modificado el sistema de layout para evitar scroll horizontal
- Reducido el número máximo de teclas por fila de 10 a 6
- Aumentado el tamaño base de las teclas
- Mejorada la eficiencia de detección de teclas táctiles
- Ajustado el rango del slider de tiempo de pulsación (0.1s - 1.0s)
- Eliminada la configuración no utilizada de scanningEnabled
- Mejorado el centrado de texto en las teclas

### Fixed

- Prevención de scroll en dispositivos táctiles
- Mejorado el soporte para pantalla completa eliminando límite de ancho máximo
- Aumentado el rango de tamaño de teclas (max: 6.0)
- Aumentado el rango de tamaño de fuente (max: 5em)
- Optimizados los cálculos de tamaño base para mejor escalabilidad
- Problemas de scroll en el área del teclado
- Solapamiento entre texto y teclado
- Interacción táctil en áreas sin teclas
- Manejo de teclas especiales (backspace y espacio)
- Distribución responsiva del teclado
- Cálculo del espacio en última fila
- Problemas con teclas grandes generando scroll horizontal
- Corrección en el cálculo de tamaño de teclas
- Mejora en la distribución de teclas por fila
- Optimización del espacio disponible
- Problemas con el scroll táctil
- Centrado vertical y horizontal del texto en las teclas

### Removed

- Predicción de palabras (temporalmente)
- Límite de ancho máximo en teclas grandes
- preventDefault global para mejorar el scroll

### Improved

- Accesibilidad general del teclado
- Adaptabilidad a diferentes tamaños de pantalla
- Experiencia de usuario para personas con discapacidad visual
- Manejo de eventos táctiles y scroll

### Optimized

- Implementado sistema de caché para posiciones de teclas
- Búsqueda optimizada con radio de proximidad
- Actualización automática del layout con ResizeObserver
- Detección de intención de scroll vs interacción con teclas

## [0.1.0] - 2024-01-16
