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

### Changed

- Refactorización del sistema de layouts para mayor flexibilidad
- Mejora en el cálculo de tamaños de teclas
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

### Removed

- Predicción de palabras (temporalmente)
- Límite de ancho máximo en teclas grandes
