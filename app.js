const currency = { PE: 'PEN', AR: 'ARS', ES: 'EUR' };
const cityMeta = {
  Lima: { market: 'PE', label: 'Lima, Perú', coordinates: [-12.0464, -77.0428] },
  'Buenos Aires': { market: 'AR', label: 'Buenos Aires, Argentina', coordinates: [-34.6037, -58.3816] },
  'Santa Fe': { market: 'AR', label: 'Santa Fe, Argentina', coordinates: [-31.6333, -60.7000] },
  'San Luis': { market: 'AR', label: 'San Luis, Argentina', coordinates: [-33.3017, -66.3378] },
  'San Francisco': { market: 'AR', label: 'San Francisco, Córdoba, Argentina', coordinates: [-31.4270, -62.0827] },
  'Barañáin': { market: 'ES', label: 'Navarra, España' }
};
const storeDomains = {
  'Plaza Vea': 'www.plazavea.com.pe', Metro: 'www.metro.pe', Wong: 'www.wong.pe',
  Carrefour: 'www.carrefour.com.ar', 'Día': 'diaonline.supermercadosdia.com.ar', Jumbo: 'www.jumbo.com.ar'
};
const navarraCenters = [
  'Barañain', 'Tudela', 'Estella-Lizarra', 'Tafalla', 'Sangüesa', 'Altsasu',
  'Viana', 'Lodosa', 'Isaba', 'Ochagavía', 'Aoiz', 'Corella', 'Ribaforada'
];
let city = 'Lima';
let currentPosition = null;
let feed = null;
let spainFeed = null;
let spainLoading = false;
let nearbyStores = [];
let nearbyStoresLoading = false;
let nearbyStoresError = false;
let filtersOpen = false;
const grid = document.querySelector('#dealGrid');
const storeFilter = document.querySelector('#storeFilter');
const categoryFilter = document.querySelector('#categoryFilter');
const cityDialog = document.querySelector('#cityDialog');

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function safeProductUrl(offer) {
  try {
    const url = new URL(offer.url);
    return url.protocol === 'https:' && (url.hostname === storeDomains[offer.store] || url.hostname === 'quecomprar.org') ? url.href : '#';
  } catch { return '#'; }
}
function safeImageUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; }
  catch { return ''; }
}
function fmt(value, market) {
  return new Intl.NumberFormat(market === 'PE' ? 'es-PE' : market === 'ES' ? 'es-ES' : 'es-AR', {
    style: 'currency', currency: currency[market], maximumFractionDigits: 2
  }).format(Number(value));
}
function timeLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'hora no disponible';
  return new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
function cityOffers() {
  const market = cityMeta[city].market;
  if (market === 'ES') return (spainFeed?.offers || []).filter(offer => offer.storeAddress);
  const nearbyNames = new Set(nearbyStores.map(store => store.chain));
  const marketOffers = (feed?.offers || []).filter(offer => offer.market === market);
  const nearbyOffers = marketOffers.filter(offer => nearbyNames.has(offer.store));
  // Keep the catalog useful while address lookup is slow or has incomplete map coverage.
  // Cards label these fallback prices as online-only and do not imply a local branch match.
  return nearbyOffers.length ? nearbyOffers : marketOffers;
}
function renderSourceStatus() {
  const market = cityMeta[city].market;
  if (market === 'ES') {
    const notice = document.querySelector('#feedNotice');
    notice.innerHTML = spainFeed?.offers?.length
      ? `Precios de folletos vigentes en Navarra, consultados en varios municipios. Fuente: <a href="https://quecomprar.org/conector/" target="_blank" rel="noopener noreferrer">Qué Comprar</a>; verifica condiciones y vigencia en cada oferta. ${spainFeed.stale ? 'No se pudo actualizar ahora; se muestran datos de la última consulta.' : spainFeed.failures ? `Consulta parcial: ${spainFeed.failures} zonas no respondieron.` : ''}`
      : spainLoading ? 'Consultando ofertas y folletos vigentes de Navarra…' : 'Ahora no fue posible cargar las ofertas de Navarra. Inténtalo de nuevo en unos minutos.';
    return;
  }
  const sources = (feed?.sources || []).filter(source => source.market === market);
  const unavailable = sources.filter(source => source.status !== 'ok');
  const active = sources.filter(source => source.status === 'ok');
  const names = active.map(source => esc(source.name)).join(', ') || 'ninguna tienda';
  const missing = unavailable.length
    ? `<br><strong>Sin datos conectados:</strong> ${unavailable.map(source => esc(source.name)).join(', ')}.`
    : '';
  const hasLocalMatches = nearbyStores.some(store => active.some(source => source.name === store.chain && source.count > 0));
  const locality = nearbyStoresLoading
    ? ' Mostrando el catálogo online mientras se verifican sucursales cercanas…'
    : nearbyStoresError || !hasLocalMatches
      ? ' No se pudo confirmar una sucursal de estas cadenas; los resultados son del catálogo online y no implican disponibilidad local.'
      : ` Ofertas filtradas a cadenas con sucursales cercanas. Direcciones: OpenStreetMap. El precio/stock de la sucursal debe confirmarse en tienda.`;
  document.querySelector('#feedNotice').innerHTML = feed
    ? `Fuentes consultadas: ${names}.${locality}${missing}`
    : 'No se pudo cargar la captura de precios. Vuelve a intentarlo más tarde.';
}
function render() {
  const isSpain = cityMeta[city].market === 'ES';
  document.querySelector('#filters').hidden = !isSpain && !filtersOpen;
  document.querySelector('#filtersToggle').hidden = false;
  grid.hidden = false;
  document.querySelector('#emptyState').hidden = false;
  document.querySelector('#demoDisclaimer').textContent = isSpain
    ? 'Precios indicativos de folletos vigentes. Cada tarjeta muestra la dirección de la sucursal más cercana que informa la fuente; la oferta puede variar por tienda y condiciones. Compruébala en el folleto.'
    : 'Precios de catálogo online capturados en la fecha indicada. Intentamos identificar sucursales cercanas con OpenStreetMap; si la búsqueda falla o no coincide una cadena, mostramos los precios online como referencia, no como precio local. Verifica precio y stock en la tienda.';
  const offers = cityOffers();
  const selectedStore = storeFilter.value;
  const selectedCategory = categoryFilter.value;
  const stores = [...new Set(offers.map(offer => offer.store))].sort();
  storeFilter.innerHTML = '<option value="Todos">Todos</option>' + stores.map(store => `<option value="${esc(store)}">${esc(store)}</option>`).join('');
  storeFilter.value = stores.includes(selectedStore) ? selectedStore : 'Todos';
  const categories = [...new Set(offers.map(offer => offer.category))].sort();
  categoryFilter.innerHTML = '<option value="Todas">Todas</option>' + categories.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join('');
  categoryFilter.value = categories.includes(selectedCategory) ? selectedCategory : 'Todas';

  const visible = offers
    .filter(offer => (storeFilter.value === 'Todos' || offer.store === storeFilter.value)
      && (categoryFilter.value === 'Todas' || offer.category === categoryFilter.value))
    .sort((a, b) => Number(b.discount) - Number(a.discount))
    .slice(0, 20);

  grid.innerHTML = visible.map(offer => {
    const image = safeImageUrl(offer.image);
    const href = safeProductUrl(offer);
    const branch = isSpain
      ? { name: offer.storeLocationName || offer.store, address: offer.storeAddress, distanceKm: offer.distanceKm, mapUrl: offer.mapUrl }
      : nearbyStores.find(store => store.chain === offer.store) || {
        name: offer.store,
        address: `Sucursal cercana no verificada · ${cityMeta[city].label}`,
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${offer.store} supermercado ${cityMeta[city].label}`)}`
      };
    const mapUrl = branch?.mapUrl || '#';
    return `<article class="deal-card">
      <div class="card-top"><span class="store-tag">${esc(offer.store)}</span><span class="discount">-${esc(offer.discount)}%</span></div>
      <a class="product-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="Ver ${esc(offer.name)} en ${esc(offer.store)}">
        <div class="product-art">${image ? `<img src="${esc(image)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<span class="image-placeholder">🛒</span>'}<span class="image-price"><strong>${esc(fmt(offer.price, offer.market))}</strong><del>${esc(fmt(offer.oldPrice, offer.market))}</del></span></div>
        <div class="product-name">${esc(offer.name)}</div>
      </a>
      ${isSpain && offer.conditions ? `<div class="offer-conditions">${esc(offer.conditions)}</div>` : ''}
      <div class="branch-address"><span aria-hidden="true">⌖</span><a href="${esc(mapUrl)}" target="_blank" rel="noopener noreferrer">${esc(branch?.name || offer.store)} · ${esc(branch?.address || 'Dirección no publicada')}</a>${Number.isFinite(Number(branch?.distanceKm)) ? `<small>${Number(branch.distanceKm).toFixed(1)} km</small>` : ''}</div>
      <div class="distance"><span>${isSpain ? `Folleto · ${esc(offer.validUntil ? `hasta ${offer.validUntil}` : 'vigente')}` : `Catálogo online · ${esc(offer.seller || offer.store)}`}</span><b><a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${isSpain ? 'Fuente ↗' : 'Ver oferta ↗'}</a></b></div>
    </article>`;
  }).join('');

  const localMatches = isSpain || nearbyStores.some(store => offers.some(offer => offer.store === store.chain));
  document.querySelector('#dealsTitle').textContent = isSpain
    ? `${visible.length} ofertas con sucursal en Navarra`
    : `${visible.length} ofertas ${localMatches ? 'en supermercados cercanos' : 'online para ' + cityMeta[city].label}`;
  document.querySelector('#emptyState').hidden = visible.length > 0;
  const emptyMessage = isSpain && spainLoading ? 'Cargando ofertas vigentes de varios municipios navarros…'
    : isSpain ? 'No hay ofertas con una dirección de sucursal verificada en la respuesta de la fuente.'
    : nearbyStoresLoading ? 'Mostrando ofertas online mientras buscamos direcciones…'
        : nearbyStoresError ? 'Mostrando el catálogo online; no se pudo verificar una sucursal cercana.'
          : feed ? 'No encontramos ofertas para las cadenas con sucursales cercanas.' : 'No pudimos cargar las ofertas actuales.';
  document.querySelector('#emptyState').innerHTML = `${esc(emptyMessage)}<br /><button id="retryFeed" type="button">Volver a cargar</button>`;
  document.querySelector('#resultNote').textContent = isSpain
    ? (spainFeed?.updatedAt ? `Ofertas vigentes · datos de la fuente actualizados ${timeLabel(spainFeed.updatedAt)}` : 'Precios en euros · folletos vigentes de supermercados de Navarra')
    : feed ? `Precios observados el ${timeLabel(feed.capturedAt)} · ordenadas por descuento publicado` : 'La fuente de datos no está disponible.';
  document.querySelector('#locationLabel').textContent = cityMeta[city].label;
  document.querySelector('#locationNotice').hidden = Boolean(currentPosition);
  renderSourceStatus();
}
function setCity(next) {
  city = next;
  currentPosition = null;
  render();
  if (cityMeta[city].market === 'ES') loadSpainOffers();
  else loadNearbyStores();
}
function useLocation() {
  if (!navigator.geolocation) {
    alert('Este navegador no permite obtener la ubicación. Elige tu ciudad manualmente.');
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    if (latitude > -13 && latitude < -11.5 && longitude > -77.5 && longitude < -76.5) city = 'Lima';
    else if (latitude > -32.2 && latitude < -31.3 && longitude > -61 && longitude < -60.3) city = 'Santa Fe';
    else if (latitude > -33.55 && latitude < -33.0 && longitude > -66.65 && longitude < -66.05) city = 'San Luis';
    else if (latitude > -31.65 && latitude < -31.2 && longitude > -62.35 && longitude < -61.85) city = 'San Francisco';
    else if (latitude > -35.2 && latitude < -34 && longitude > -59.5 && longitude < -57.5) city = 'Buenos Aires';
    else if (latitude > 42.65 && latitude < 42.95 && longitude > -1.9 && longitude < -1.4) city = 'Barañáin';
    else {
      alert('Por ahora el piloto está disponible en Lima, Buenos Aires, Santa Fe, San Luis, San Francisco y Navarra. Puedes elegir una ciudad manualmente.');
      return;
    }
    currentPosition = pos.coords;
    render();
    if (cityMeta[city].market === 'ES') loadSpainOffers();
    else loadNearbyStores();
  }, () => alert('No pudimos acceder a tu ubicación. Puedes elegir una ciudad manualmente.'), {
    enableHighAccuracy: true, timeout: 10000, maximumAge: 30000
  });
}

document.querySelector('#filtersToggle').addEventListener('click', () => {
  filtersOpen = !filtersOpen;
  document.querySelector('#filters').hidden = !filtersOpen;
});
document.querySelector('#locationButton').addEventListener('click', () => cityDialog.showModal());
document.querySelector('#chooseCityButton').addEventListener('click', () => cityDialog.showModal());
document.querySelector('#enableLocation').addEventListener('click', useLocation);
document.querySelector('#dialogGps').addEventListener('click', () => { cityDialog.close(); useLocation(); });
cityDialog.querySelectorAll('.city-option').forEach(button => button.addEventListener('click', () => setCity(button.value)));
storeFilter.addEventListener('change', render);
categoryFilter.addEventListener('change', render);
document.querySelector('#emptyState').addEventListener('click', event => {
  if (event.target.id !== 'retryFeed') return;
  if (cityMeta[city].market === 'ES') loadSpainOffers();
  else { loadFeed(); loadNearbyStores(true); }
});

async function loadSpainOffers() {
  if (spainLoading) return;
  spainLoading = true;
  render();
  const centers = navarraCenters;
  const results = await Promise.all(centers.map(async center => {
    try {
      const params = new URLSearchParams({ city: center, radius_km: '15', limit: '25', page: '1', sort: 'discount', discounted_only: 'true' });
      const response = await fetch(`https://quecomprar.org/api/v1/offers?${params}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.offers)) throw new Error('respuesta sin ofertas');
      return { center, data };
    } catch (error) {
      console.warn(`No se pudo cargar Navarra desde ${center}:`, error);
      return { center, error };
    }
  }));
  const byUrl = new Map();
  let newest = '';
  for (const { center, data } of results) {
    if (!data) continue;
    if (data.updated_at && data.updated_at > newest) newest = data.updated_at;
    const nearestStores = new Map((data.nearest_stores || []).map(store => [store.store, store]));
    for (const item of data.offers) {
      if (!item.url || !Number(item.price_eur) || !Number(item.discount_percent)) continue;
      if (byUrl.has(item.url)) continue;
      const category = ({ letto: 'Colchones', elettrodomestico: 'Electrodomésticos' })[item.category] || item.category || 'Supermercado';
      byUrl.set(item.url, {
        market: 'ES', store: item.store, name: item.name, price: item.price_eur,
        oldPrice: item.previous_price_eur || item.price_eur, discount: item.discount_percent,
        currency: 'EUR', category, image: item.image_url || '',
        url: item.url, source: data.source, validUntil: item.valid_until || '',
        conditions: item.conditions || '', nearbyCity: data.city || center,
        distanceKm: item.distance_km, availability: item.availability,
        storeAddress: nearestStores.get(item.store)?.address || '',
        storeLocationName: nearestStores.get(item.store)?.name || item.store,
        mapUrl: nearestStores.get(item.store)?.latitude && nearestStores.get(item.store)?.longitude
          ? `https://www.openstreetmap.org/?mlat=${nearestStores.get(item.store).latitude}&mlon=${nearestStores.get(item.store).longitude}#map=17/${nearestStores.get(item.store).latitude}/${nearestStores.get(item.store).longitude}`
          : ''
      });
    }
  }
  if (byUrl.size) spainFeed = { offers: [...byUrl.values()].sort((a, b) => Number(b.discount) - Number(a.discount)).slice(0, 100), updatedAt: newest, failures: results.filter(item => item.error).length, stale: false };
  else if (spainFeed) spainFeed = { ...spainFeed, stale: true };
  else spainFeed = { offers: [], updatedAt: '', failures: results.length, stale: false };
  spainLoading = false;
  render();
}

function normalized(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function distanceKm(a, b) {
  const rad = value => value * Math.PI / 180;
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
function chainForStore(tags, market) {
  const identity = normalized(`${tags.brand || ''} ${tags.name || ''} ${tags.operator || ''}`);
  const aliases = market === 'PE'
    ? { 'Plaza Vea': ['plaza vea'], Metro: ['metro'], Wong: ['wong'] }
    : { Carrefour: ['carrefour'], 'Día': ['dia', 'supermercados dia'], Jumbo: ['jumbo'] };
  return Object.entries(aliases).find(([, needles]) => needles.some(needle => identity.includes(needle)))?.[0] || '';
}
async function loadNearbyStores(force = false) {
  if (cityMeta[city].market === 'ES' || (nearbyStoresLoading && !force)) return;
  const requestedCity = city;
  const center = currentPosition ? [currentPosition.latitude, currentPosition.longitude] : cityMeta[city].coordinates;
  const requestedCenter = [...center];
  nearbyStoresLoading = true;
  nearbyStoresError = false;
  nearbyStores = [];
  render();
  const market = cityMeta[city].market;
  const query = `[out:json][timeout:8];(node["shop"="supermarket"](around:15000,${center[0]},${center[1]});way["shop"="supermarket"](around:15000,${center[0]},${center[1]});relation["shop"="supermarket"](around:15000,${center[0]},${center[1]}););out center tags;`;
  try {
    let data;
    const lookupDeadline = Date.now() + 9000;
    for (const endpoint of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']) {
      const remaining = lookupDeadline - Date.now();
      if (remaining <= 0) break;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), Math.min(4500, remaining));
      try {
        const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = await response.json();
        break;
      } catch (error) { console.warn('No respondió el directorio OpenStreetMap:', error); }
      finally { clearTimeout(timeout); }
    }
    if (!data || !Array.isArray(data.elements)) throw new Error('directorio no disponible');
    const best = new Map();
    for (const element of data.elements) {
      const tags = element.tags || {};
      const chain = chainForStore(tags, market);
      const street = tags['addr:street'] || tags['addr:place'] || '';
      const number = tags['addr:housenumber'] || '';
      if (!chain || !street || !number) continue;
      const lat = element.lat ?? element.center?.lat;
      const lon = element.lon ?? element.center?.lon;
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      const distance = distanceKm(center, [lat, lon]);
      const address = `${street} ${number}${tags['addr:city'] ? `, ${tags['addr:city']}` : ''}${tags['addr:postcode'] ? ` (${tags['addr:postcode']})` : ''}`;
      const candidate = { chain, name: tags.name || tags.brand || chain, address, distanceKm: distance, lat, lon,
        mapUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}` };
      if (!best.has(chain) || distance < best.get(chain).distanceKm) best.set(chain, candidate);
    }
    nearbyStores = [...best.values()];
  } catch (error) {
    console.error('No se pudieron verificar sucursales cercanas:', error);
    nearbyStoresError = true;
  }
  const activeCenter = currentPosition ? [currentPosition.latitude, currentPosition.longitude] : cityMeta[city].coordinates;
  if (city !== requestedCity || activeCenter.some((value, index) => Math.abs(value - requestedCenter[index]) > 0.00001)) {
    nearbyStoresLoading = false;
    if (cityMeta[city].market !== 'ES') loadNearbyStores();
    return;
  }
  nearbyStoresLoading = false;
  render();
}

async function loadFeed() {
  try {
    const response = await fetch(`data/latest.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (!Array.isArray(result.offers) || !result.capturedAt) throw new Error('formato de feed inválido');
    feed = result;
  } catch (error) {
    console.error('No se pudo cargar la captura de ofertas:', error);
    feed = null;
  }
  render();
}
render();
loadFeed();
loadNearbyStores();
