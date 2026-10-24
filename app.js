const currency = { PE: 'PEN', AR: 'ARS', ES: 'EUR' };
const cityMeta = {
  Lima: { market: 'PE', label: 'Lima, Perú' },
  'Buenos Aires': { market: 'AR', label: 'Buenos Aires, Argentina' },
  'Santa Fe': { market: 'AR', label: 'Santa Fe, Argentina' },
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
  if (market === 'ES') return spainFeed?.offers || [];
  return (feed?.offers || []).filter(offer => offer.market === market);
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
  const locality = market === 'AR' ? ' La cobertura es del catálogo online; aún no está verificada por sucursal de Buenos Aires o Santa Fe.' : '';
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
    ? 'Precios indicativos transcritos de folletos oficiales y reunidos desde varios municipios navarros. La cobertura incluye las zonas con folletos detectados; una oferta puede tener condiciones, existencias o disponibilidad distintas según tienda. Compruébala en la fuente.'
    : 'Los precios provienen de los catálogos online y reflejan la hora de captura. Pueden variar por domicilio, stock, medio de pago y tienda física. La app aún no calcula sucursales cercanas.';
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
    return `<article class="deal-card">
      <div class="card-top"><span class="store-tag">${esc(offer.store)}</span><span class="discount">-${esc(offer.discount)}%</span></div>
      <a class="product-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="Ver ${esc(offer.name)} en ${esc(offer.store)}">
        <div class="product-art">${image ? `<img src="${esc(image)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<span class="image-placeholder">🛒</span>'}<span class="image-price"><strong>${esc(fmt(offer.price, offer.market))}</strong><del>${esc(fmt(offer.oldPrice, offer.market))}</del></span></div>
        <div class="product-name">${esc(offer.name)}</div>
      </a>
      ${isSpain && offer.conditions ? `<div class="offer-conditions">${esc(offer.conditions)}</div>` : ''}
      <div class="distance"><span>${isSpain ? `Folleto · ${esc(offer.validUntil ? `hasta ${offer.validUntil}` : 'vigente')}` : `Catálogo online · ${esc(offer.seller || offer.store)}`}</span><b><a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${isSpain ? 'Fuente ↗' : 'Ver oferta ↗'}</a></b></div>
    </article>`;
  }).join('');

  document.querySelector('#dealsTitle').textContent = isSpain ? `${visible.length} ofertas en Navarra` : `${visible.length} ofertas online para ti`;
  document.querySelector('#emptyState').hidden = visible.length > 0;
  const emptyMessage = isSpain && spainLoading ? 'Cargando ofertas vigentes de varios municipios navarros…'
    : isSpain ? 'No fue posible cargar ofertas actuales de Navarra.'
      : feed ? 'No encontramos ofertas verificadas con esos filtros.' : 'No pudimos cargar las ofertas actuales.';
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
    else if (latitude > -35.2 && latitude < -34 && longitude > -59.5 && longitude < -57.5) city = 'Buenos Aires';
    else if (latitude > 42.65 && latitude < 42.95 && longitude > -1.9 && longitude < -1.4) city = 'Barañáin';
    else {
      alert('Por ahora el piloto está disponible en Lima, Buenos Aires, Santa Fe y Navarra. Puedes elegir una ciudad manualmente.');
      return;
    }
    currentPosition = pos.coords;
    render();
    if (cityMeta[city].market === 'ES') loadSpainOffers();
  }, () => alert('No pudimos acceder a tu ubicación. Puedes elegir una ciudad manualmente.'), {
    enableHighAccuracy: true, timeout: 10000, maximumAge: 30000
  });
}

document.querySelector('#filtersToggle').addEventListener('click', () => {
  filtersOpen = !filtersOpen;
  document.querySelector('#filters').hidden = !filtersOpen;
});
document.querySelector('#locationButton').addEventListener('click', () => cityDialog.showModal());
document.querySelector('#enableLocation').addEventListener('click', useLocation);
document.querySelector('#dialogGps').addEventListener('click', () => { cityDialog.close(); useLocation(); });
cityDialog.querySelectorAll('.city-option').forEach(button => button.addEventListener('click', () => setCity(button.value)));
storeFilter.addEventListener('change', render);
categoryFilter.addEventListener('change', render);
document.querySelector('#emptyState').addEventListener('click', event => {
  if (event.target.id !== 'retryFeed') return;
  if (cityMeta[city].market === 'ES') loadSpainOffers();
  else loadFeed();
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
        distanceKm: item.distance_km, availability: item.availability
      });
    }
  }
  if (byUrl.size) spainFeed = { offers: [...byUrl.values()].sort((a, b) => Number(b.discount) - Number(a.discount)).slice(0, 100), updatedAt: newest, failures: results.filter(item => item.error).length, stale: false };
  else if (spainFeed) spainFeed = { ...spainFeed, stale: true };
  else spainFeed = { offers: [], updatedAt: '', failures: results.length, stale: false };
  spainLoading = false;
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
