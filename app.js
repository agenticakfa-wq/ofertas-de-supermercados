const currency = { PE: 'PEN', AR: 'ARS' };
const cityMeta = {
  Lima: { market: 'PE', label: 'Lima, Perú' },
  'Buenos Aires': { market: 'AR', label: 'Buenos Aires, Argentina' },
  'Santa Fe': { market: 'AR', label: 'Santa Fe, Argentina' }
};
const storeDomains = {
  'Plaza Vea': 'www.plazavea.com.pe', Metro: 'www.metro.pe', Wong: 'www.wong.pe',
  Carrefour: 'www.carrefour.com.ar', 'Día': 'diaonline.supermercadosdia.com.ar', Jumbo: 'www.jumbo.com.ar'
};
let city = 'Lima';
let currentPosition = null;
let feed = null;
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
    return url.protocol === 'https:' && url.hostname === storeDomains[offer.store] ? url.href : '#';
  } catch { return '#'; }
}
function safeImageUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; }
  catch { return ''; }
}
function fmt(value, market) {
  return new Intl.NumberFormat(market === 'PE' ? 'es-PE' : 'es-AR', {
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
  return (feed?.offers || []).filter(offer => offer.market === market);
}
function renderSourceStatus() {
  const market = cityMeta[city].market;
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
        <div class="product-art">${image ? `<img src="${esc(image)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<span>🛒</span>'}</div>
        <div class="product-name">${esc(offer.name)}</div>
      </a>
      <div class="prices"><span class="price">${fmt(offer.price, offer.market)}</span><span class="old-price">${fmt(offer.oldPrice, offer.market)}</span></div>
      <div class="distance"><span>Catálogo online · ${esc(offer.seller || offer.store)}</span><b><a href="${esc(href)}" target="_blank" rel="noopener noreferrer">Ver oferta ↗</a></b></div>
    </article>`;
  }).join('');

  document.querySelector('#dealsTitle').textContent = `${visible.length} ofertas online para ti`;
  document.querySelector('#emptyState').hidden = visible.length > 0;
  document.querySelector('#emptyState').textContent = feed
    ? 'No encontramos ofertas verificadas con esos filtros.'
    : 'No pudimos cargar las ofertas actuales.';
  document.querySelector('#resultNote').textContent = feed
    ? `Precios observados el ${timeLabel(feed.capturedAt)} · ordenadas por descuento publicado`
    : 'La fuente de datos no está disponible.';
  document.querySelector('#locationLabel').textContent = cityMeta[city].label;
  document.querySelector('#locationNotice').hidden = Boolean(currentPosition);
  renderSourceStatus();
}
function setCity(next) {
  city = next;
  currentPosition = null;
  render();
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
    else {
      alert('Por ahora el piloto está disponible en Lima, Buenos Aires y Santa Fe. Puedes elegir una ciudad manualmente.');
      return;
    }
    currentPosition = pos.coords;
    render();
  }, () => alert('No pudimos acceder a tu ubicación. Puedes elegir Lima, Buenos Aires o Santa Fe manualmente.'), {
    enableHighAccuracy: true, timeout: 10000, maximumAge: 30000
  });
}

document.querySelector('#filtersToggle').addEventListener('click', () => {
  const filters = document.querySelector('#filters');
  filters.hidden = !filters.hidden;
});
document.querySelector('#locationButton').addEventListener('click', () => cityDialog.showModal());
document.querySelector('#enableLocation').addEventListener('click', useLocation);
document.querySelector('#dialogGps').addEventListener('click', () => { cityDialog.close(); useLocation(); });
cityDialog.querySelectorAll('.city-option').forEach(button => button.addEventListener('click', () => setCity(button.value)));
storeFilter.addEventListener('change', render);
categoryFilter.addEventListener('change', render);
document.querySelector('#retryFeed').addEventListener('click', loadFeed);

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
