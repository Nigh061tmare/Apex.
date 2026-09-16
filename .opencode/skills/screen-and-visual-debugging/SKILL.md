---
name: screen-and-visual-debugging
description: "Diagnóstico visual avanzado, análisis de capturas de pantalla de Windows en vivo, inspección de UI con DevTools y correlación de bugs con código fuente."
---

# Screen and Visual Debugging Skill

Esta habilidad proporciona el flujo de trabajo estandarizado para diagnosticar problemas visuales, bugs de renderizado, desalineaciones de UI y errores en pantalla directamente en el entorno de Windows 11.

## 🎯 Cuándo Activar Esta Habilidad
- Cuando el usuario diga: *"Mira mi pantalla"*, *"¿Qué error sale en mi monitor?"*, *"Revisa cómo se ve esto"*, *"¿Ves este bug?"*.
- Cuando se requiera validar visualmente un cambio de frontend (React, CSS, Vite, etc.) tras editar código.
- Cuando una animación o transición CSS/JS tenga glitches o parpadeos (modo ráfaga `/record`).
- Cuando se analicen imágenes, capturas o mockups pegados en el chat.

---

## 🛠️ Herramientas Disponibles

### 1. Captura de Pantalla en Vivo (`/screen`)
- **Comando:** `powershell -ExecutionPolicy Bypass -File "C:\Users\pepde\.config\opencode\tools\capture_screen.ps1" -Json`
- **Alternativa:** `node C:\Users\pepde\.config\opencode\tools\screen.cjs`
- **Comportamiento:**
  - Toma una captura de alta resolución en milisegundos.
  - Guarda en `~/.config/opencode/cache/screenshots/screenshot_YYYYMMDD_HHmmss.png`.
  - Rota automáticamente manteniendo los últimos 5 archivos para no dejar residuos.
  - Devuelve JSON con resolución (`width`, `height`), tamaño y ruta del archivo.

### 2. Grabación Rápida de Ráfaga (`/record`)
- **Comando:** `powershell -ExecutionPolicy Bypass -File "C:\Users\pepde\.config\opencode\tools\record_screen.ps1" -Frames 10 -IntervalMs 300 -Json`
- **Uso:** Diagnosticar glitches de animación, transiciones rotas o estados transitorios de UI.

### 3. Inspección en Vivo con Chrome DevTools MCP
- Conectarse al navegador abierto en el puerto 9222 o lanzar una instancia aislada para inspeccionar el DOM, consola de errores y estilos calculados.

---

## 📋 Protocolo de Triaje y Depuración Visual

Al recibir o tomar una captura de pantalla:
1. **Identificar la Región de Interés (ROI):**
   - Localiza las coordenadas visuales del problema (cabecera, modal, panel lateral, alerta).
2. **Correlación con el Código Fuente:**
   - Mapea el elemento visual defectuoso con su componente JSX/TSX correspondiente en el proyecto (ej: `src/components/...`).
   - Identifica las clases CSS, Tailwind o estilos inline responsables de la discrepancia.
3. **Comprobación de Errores en Consola:**
   - Si la captura muestra un error en pantalla (overlay rojo de Vite o consola abierta), lee el stack trace y ubica de inmediato el archivo y línea causante.
4. **Verificación Post-Fix:**
   - Aplica la corrección en el código.
   - Ejecuta `/screen` nuevamente para confirmar visualmente que el bug ha desaparecido.
