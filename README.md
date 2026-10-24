# OFERTAS DE SUPERMERCADOS

Web app responsive para el piloto de Lima, Buenos Aires, Santa Fe y Barañáin. En Perú y Argentina muestra precios promocionales extraídos de catálogos públicos online, con enlace a la ficha original y hora de captura. En Barañáin muestra accesos a folletos oficiales de tiendas DIA locales y de Eroski/Lidl en Pamplona, dentro de un radio geográfico de 50 km.

## Datos y cobertura actuales

`data/latest.json` contiene la última captura desde seis catálogos VTEX públicos: Plaza Vea, Metro, Wong, Carrefour, Día y Jumbo. Los importes son precios online capturados directamente del catálogo. No garantizan precio o stock en tienda física, una sucursal concreta, la zona de reparto ni una fecha de fin promocional.

Tottus devuelve HTTP 503 a las consultas automatizadas desde este entorno. El sitemap público de Coto tiene fecha de modificación de 2025 y no se usa como oferta vigente. No se sortean bloqueos ni se accede a cuentas, carrito o checkout.

La selección de ciudad limita el país del catálogo; **todavía no regionaliza los precios ni calcula sucursales cercanas por GPS**. En Argentina, el catálogo del país no verifica cobertura particular de Buenos Aires o Santa Fe.

### Barañáin, España

La sección de Barañáin enlaza los folletos oficiales vigentes de las tiendas DIA de Plaza Castaños y Plaza Tilos, el catálogo Eroski de Pamplona/Navarra y la página de una tienda Lidl de Pamplona. Estas fuentes están en Barañáin o Pamplona (a pocos kilómetros, dentro del radio solicitado de 50 km). Los enlaces abren los catálogos en el sitio de cada cadena: el feed de productos no copia sus precios porque no hay una extracción automática validada para España. Consulta vigencia, condiciones y disponibilidad en la tienda.

## Actualización

`python3 scrape_catalogs.py` consulta una página de hasta 50 productos por tienda habilitada, una consulta por tienda y con pausas entre comercios; filtra productos disponibles con precio menor al precio de referencia y guarda `data/latest.json`. El filtro de rutas consulta y respeta `robots.txt`.

La captura se actualiza al ejecutar `refresh_catalogs.sh`. El job de OpenClaw está pensado para ejecutarlo diariamente a las 07:00 hora de Lima; requiere que el Gateway y la credencial de GitHub estén disponibles.

## Celular

Abre la URL HTTPS y selecciona **Añadir a pantalla de inicio** en Safari (iPhone) o Chrome (Android). Se incluye manifiesto e ícono.
