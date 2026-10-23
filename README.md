# OFERTAS DE SUPERMERCADOS

Prototipo web adaptable a celulares para el piloto en Lima, Buenos Aires y Santa Fe. Permite elegir ciudad, solicitar ubicación del navegador y filtrar una selección de ofertas de demostración.

## Estado de publicación y datos

La app es una **demostración visual**, no un servicio de ofertas reales. Todos los productos, precios, descuentos, sucursales y distancias en `app.js` son ficticios. No deben usarse para decidir compras ni presentarse como promociones vigentes. Publicar esta página no convierte esos datos en reales.

La geolocalización solo selecciona la ciudad piloto. No transmite coordenadas ni calcula distancias reales a sucursales.

## Desarrollo local

Abre `index.html` o sirve esta carpeta por HTTP. No necesita compilación.

## Instalación en el celular

Abre la URL HTTPS en el navegador del celular y elige **Añadir a pantalla de inicio** (Safari en iPhone; Chrome en Android). Se incluye un manifiesto e ícono para la pantalla de inicio.

## Requisitos para ofertas reales

Antes de reemplazar la demostración hay que integrar y verificar fuentes que permitan reutilizar precios y condiciones de Plaza Vea, Tottus, Metro y Wong en Perú, y Carrefour, Coto, Día y Jumbo en Argentina. También hace falta georreferenciar sucursales y registrar vigencia, restricciones, fuente y hora de consulta. No se debe etiquetar una oferta como real si no cuenta con fuente y fecha de verificación.
