# Changelog

## [Unreleased]

### Added

- Opción para cambiar entre layouts QWERTY y ABC
- Distribución dinámica de teclas
- Ajuste automático de tamaño según espacio disponible
- Panel de configuración con:
  - Control de tiempo de pulsación
  - Control de tamaño de teclas
  - Control de tamaño de fuente
  - Modo de barrido
  - Selector de layout
- Configuración para despliegue en Vercel
- Soporte para acceso web público
- Botón para mostrar/ocultar área de texto
- Área de texto desplegable (0-60vh)
- Scroll independiente para el teclado
- Detección mejorada de teclas al deslizar

### Changed

- Refactorización del sistema de layouts para mayor flexibilidad
- Mejora en el cálculo de tamaños de teclas
- Aumentado el tamaño máximo del texto hasta 1000%
- Simplificada la interfaz mostrando tamaños en porcentajes
- Mejorado el contraste en modo oscuro
- Ajustados los colores del área de texto para mejor visibilidad
- Aumentado el tamaño máximo de teclas hasta 1000%
- Reorganizada la interfaz para mejor usabilidad
- Mejorado el sistema de scroll vertical
- Optimizado el manejo táctil en toda el área
- Barra superior más compacta y funcional

### Fixed

- Prevención de scroll en dispositivos táctiles

- Mejorado el soporte para pantalla completa eliminando límite de ancho máximo
- Aumentado el rango de tamaño de teclas (max: 6.0)
- Aumentado el rango de tamaño de fuente (max: 3em)
- Optimizados los cálculos de tamaño base para mejor escalabilidad
- Problemas de scroll en el área del teclado
- Solapamiento entre texto y teclado
- Interacción táctil en áreas sin teclas

### Removed

- Predicción de palabras (temporalmente)
