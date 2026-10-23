const offers = [
  {city:'Lima',store:'Plaza Vea',name:'Palta fuerte por kilo',price:5.90,old:8.90,discount:'-34%',category:'Frutas y verduras',emoji:'🥑',branch:'Plaza Vea San Borja',distance:1.2},
  {city:'Lima',store:'Tottus',name:'Leche entera 1 L',price:3.49,old:4.50,discount:'-22%',category:'Lácteos',emoji:'🥛',branch:'Tottus Angamos',distance:1.8},
  {city:'Lima',store:'Metro',name:'Aceite vegetal 900 ml',price:7.99,old:10.90,discount:'-27%',category:'Despensa',emoji:'🫒',branch:'Metro Limatambo',distance:2.1},
  {city:'Lima',store:'Wong',name:'Fresas frescas 500 g',price:6.90,old:9.90,discount:'-30%',category:'Frutas y verduras',emoji:'🍓',branch:'Wong Chacarilla',distance:2.4},
  {city:'Lima',store:'Plaza Vea',name:'Yogurt natural 1 kg',price:8.50,old:11.90,discount:'-29%',category:'Lácteos',emoji:'🥣',branch:'Plaza Vea San Borja',distance:1.2},
  {city:'Lima',store:'Tottus',name:'Arroz extra 5 kg',price:18.90,old:23.50,discount:'-20%',category:'Despensa',emoji:'🍚',branch:'Tottus Angamos',distance:1.8},
  {city:'Lima',store:'Metro',name:'Detergente líquido 2 L',price:18.99,old:26.90,discount:'-29%',category:'Limpieza',emoji:'🧴',branch:'Metro Limatambo',distance:2.1},
  {city:'Lima',store:'Wong',name:'Queso edam 250 g',price:10.90,old:14.50,discount:'-25%',category:'Lácteos',emoji:'🧀',branch:'Wong Chacarilla',distance:2.4},
  {city:'Lima',store:'Plaza Vea',name:'Naranjas por kilo',price:3.99,old:5.90,discount:'-32%',category:'Frutas y verduras',emoji:'🍊',branch:'Plaza Vea San Borja',distance:1.2},
  {city:'Lima',store:'Tottus',name:'Café molido 250 g',price:12.90,old:16.90,discount:'-24%',category:'Despensa',emoji:'☕',branch:'Tottus Angamos',distance:1.8},
  {city:'Lima',store:'Metro',name:'Agua mineral 6 × 600 ml',price:8.49,old:11.90,discount:'-29%',category:'Bebidas',emoji:'💧',branch:'Metro Limatambo',distance:2.1},
  {city:'Lima',store:'Wong',name:'Manzana roja por kilo',price:5.90,old:8.50,discount:'-31%',category:'Frutas y verduras',emoji:'🍎',branch:'Wong Chacarilla',distance:2.4},
  {city:'Lima',store:'Plaza Vea',name:'Atún en agua 170 g',price:4.49,old:5.90,discount:'-24%',category:'Despensa',emoji:'🥫',branch:'Plaza Vea San Borja',distance:1.2},
  {city:'Lima',store:'Tottus',name:'Papel higiénico 12 rollos',price:15.90,old:21.90,discount:'-27%',category:'Limpieza',emoji:'🧻',branch:'Tottus Angamos',distance:1.8},
  {city:'Lima',store:'Metro',name:'Plátano de seda por kilo',price:2.99,old:4.20,discount:'-29%',category:'Frutas y verduras',emoji:'🍌',branch:'Metro Limatambo',distance:2.1},
  {city:'Lima',store:'Wong',name:'Jugo de naranja 1 L',price:7.90,old:10.90,discount:'-28%',category:'Bebidas',emoji:'🧃',branch:'Wong Chacarilla',distance:2.4},
  {city:'Lima',store:'Plaza Vea',name:'Shampoo familiar 400 ml',price:13.90,old:19.90,discount:'-30%',category:'Cuidado personal',emoji:'🧴',branch:'Plaza Vea San Borja',distance:1.2},
  {city:'Lima',store:'Tottus',name:'Tomate italiano por kilo',price:3.49,old:5.50,discount:'-37%',category:'Frutas y verduras',emoji:'🍅',branch:'Tottus Angamos',distance:1.8},
  {city:'Lima',store:'Metro',name:'Mantequilla con sal 200 g',price:7.49,old:9.90,discount:'-24%',category:'Lácteos',emoji:'🧈',branch:'Metro Limatambo',distance:2.1},
  {city:'Lima',store:'Wong',name:'Galletas integrales 6 pack',price:6.90,old:9.50,discount:'-27%',category:'Despensa',emoji:'🍪',branch:'Wong Chacarilla',distance:2.4},
  {city:'Buenos Aires',store:'Carrefour',name:'Leche larga vida 1 L',price:1490,old:1890,discount:'-21%',category:'Lácteos',emoji:'🥛',branch:'Carrefour Palermo',distance:0.8},
  {city:'Buenos Aires',store:'Coto',name:'Tomate perita por kilo',price:1299,old:1899,discount:'-32%',category:'Frutas y verduras',emoji:'🍅',branch:'Coto Scalabrini Ortiz',distance:1.1},
  {city:'Buenos Aires',store:'Día',name:'Aceite de girasol 900 ml',price:2490,old:3190,discount:'-22%',category:'Despensa',emoji:'🫒',branch:'Día Honduras',distance:0.5},
  {city:'Buenos Aires',store:'Jumbo',name:'Frutillas bandeja 500 g',price:3990,old:5490,discount:'-27%',category:'Frutas y verduras',emoji:'🍓',branch:'Jumbo Palermo',distance:2.3},
  {city:'Buenos Aires',store:'Carrefour',name:'Yogur firme 190 g',price:790,old:1090,discount:'-28%',category:'Lácteos',emoji:'🥣',branch:'Carrefour Palermo',distance:0.8},
  {city:'Buenos Aires',store:'Coto',name:'Arroz largo fino 1 kg',price:1799,old:2299,discount:'-22%',category:'Despensa',emoji:'🍚',branch:'Coto Scalabrini Ortiz',distance:1.1},
  {city:'Buenos Aires',store:'Día',name:'Jabón líquido para ropa 3 L',price:4990,old:6990,discount:'-29%',category:'Limpieza',emoji:'🧴',branch:'Día Honduras',distance:0.5},
  {city:'Buenos Aires',store:'Jumbo',name:'Queso pategrás 250 g',price:4490,old:5990,discount:'-25%',category:'Lácteos',emoji:'🧀',branch:'Jumbo Palermo',distance:2.3},
  {city:'Buenos Aires',store:'Carrefour',name:'Naranja por kilo',price:1190,old:1690,discount:'-30%',category:'Frutas y verduras',emoji:'🍊',branch:'Carrefour Palermo',distance:0.8},
  {city:'Buenos Aires',store:'Coto',name:'Café molido 250 g',price:4990,old:6490,discount:'-23%',category:'Despensa',emoji:'☕',branch:'Coto Scalabrini Ortiz',distance:1.1},
  {city:'Buenos Aires',store:'Día',name:'Agua mineral 2 L',price:1090,old:1490,discount:'-27%',category:'Bebidas',emoji:'💧',branch:'Día Honduras',distance:0.5},
  {city:'Buenos Aires',store:'Jumbo',name:'Manzana roja por kilo',price:2490,old:3290,discount:'-24%',category:'Frutas y verduras',emoji:'🍎',branch:'Jumbo Palermo',distance:2.3},
  {city:'Buenos Aires',store:'Carrefour',name:'Atún al natural 170 g',price:1690,old:2190,discount:'-23%',category:'Despensa',emoji:'🥫',branch:'Carrefour Palermo',distance:0.8},
  {city:'Buenos Aires',store:'Coto',name:'Papel higiénico 4 rollos',price:2599,old:3499,discount:'-26%',category:'Limpieza',emoji:'🧻',branch:'Coto Scalabrini Ortiz',distance:1.1},
  {city:'Buenos Aires',store:'Día',name:'Banana por kilo',price:1490,old:1990,discount:'-25%',category:'Frutas y verduras',emoji:'🍌',branch:'Día Honduras',distance:0.5},
  {city:'Buenos Aires',store:'Jumbo',name:'Jugo de naranja 1 L',price:2490,old:3290,discount:'-24%',category:'Bebidas',emoji:'🧃',branch:'Jumbo Palermo',distance:2.3},
  {city:'Buenos Aires',store:'Carrefour',name:'Shampoo familiar 400 ml',price:2990,old:4290,discount:'-30%',category:'Cuidado personal',emoji:'🧴',branch:'Carrefour Palermo',distance:0.8},
  {city:'Buenos Aires',store:'Coto',name:'Papa blanca por kilo',price:999,old:1399,discount:'-29%',category:'Frutas y verduras',emoji:'🥔',branch:'Coto Scalabrini Ortiz',distance:1.1},
  {city:'Buenos Aires',store:'Día',name:'Manteca 200 g',price:1890,old:2490,discount:'-24%',category:'Lácteos',emoji:'🧈',branch:'Día Honduras',distance:0.5},
  {city:'Buenos Aires',store:'Jumbo',name:'Galletitas de avena 300 g',price:1990,old:2690,discount:'-26%',category:'Despensa',emoji:'🍪',branch:'Jumbo Palermo',distance:2.3},
  ...[
    ['Carrefour','Leche larga vida 1 L',1490,1890,'-21%','Lácteos','🥛',1.0],['Coto','Tomate perita por kilo',1299,1899,'-32%','Frutas y verduras','🍅',1.4],['Día','Aceite de girasol 900 ml',2490,3190,'-22%','Despensa','🫒',0.7],['Jumbo','Frutillas bandeja 500 g',3990,5490,'-27%','Frutas y verduras','🍓',2.1],
    ['Carrefour','Yogur firme 190 g',790,1090,'-28%','Lácteos','🥣',1.0],['Coto','Arroz largo fino 1 kg',1799,2299,'-22%','Despensa','🍚',1.4],['Día','Jabón líquido para ropa 3 L',4990,6990,'-29%','Limpieza','🧴',0.7],['Jumbo','Queso pategrás 250 g',4490,5990,'-25%','Lácteos','🧀',2.1],
    ['Carrefour','Naranja por kilo',1190,1690,'-30%','Frutas y verduras','🍊',1.0],['Coto','Café molido 250 g',4990,6490,'-23%','Despensa','☕',1.4],['Día','Agua mineral 2 L',1090,1490,'-27%','Bebidas','💧',0.7],['Jumbo','Manzana roja por kilo',2490,3290,'-24%','Frutas y verduras','🍎',2.1],
    ['Carrefour','Atún al natural 170 g',1690,2190,'-23%','Despensa','🥫',1.0],['Coto','Papel higiénico 4 rollos',2599,3499,'-26%','Limpieza','🧻',1.4],['Día','Banana por kilo',1490,1990,'-25%','Frutas y verduras','🍌',0.7],['Jumbo','Jugo de naranja 1 L',2490,3290,'-24%','Bebidas','🧃',2.1],
    ['Carrefour','Shampoo familiar 400 ml',2990,4290,'-30%','Cuidado personal','🧴',1.0],['Coto','Papa blanca por kilo',999,1399,'-29%','Frutas y verduras','🥔',1.4],['Día','Manteca 200 g',1890,2490,'-24%','Lácteos','🧈',0.7],['Jumbo','Galletitas de avena 300 g',1990,2690,'-26%','Despensa','🍪',2.1]
  ].map(([store,name,price,old,discount,category,emoji,distance])=>({city:'Santa Fe',store,name,price,old,discount,category,emoji,branch:`${store} · sucursal demo Santa Fe`,distance}))
];

const currency = city => city === 'Lima' ? 'S/' : '$';
const fmt = (value, city) => `${currency(city)} ${Number(value).toLocaleString(city === 'Lima' ? 'es-PE' : 'es-AR',{minimumFractionDigits:city === 'Lima'?2:0,maximumFractionDigits:2})}`;
let city = 'Lima';
let currentPosition = null;
const grid = document.querySelector('#dealGrid');
const storeFilter = document.querySelector('#storeFilter');
const categoryFilter = document.querySelector('#categoryFilter');
const cityDialog = document.querySelector('#cityDialog');

function render(){
  const cityOffers=offers.filter(o=>o.city===city);
  const stores=[...new Set(cityOffers.map(o=>o.store))];
  const selectedStore=storeFilter.value;
  storeFilter.innerHTML='<option value="Todos">Todos</option>'+stores.map(s=>`<option>${s}</option>`).join('');
  if(stores.includes(selectedStore))storeFilter.value=selectedStore;
  let visible=cityOffers.filter(o=>(storeFilter.value==='Todos'||o.store===storeFilter.value)&&(categoryFilter.value==='Todas'||o.category===categoryFilter.value));
  visible=visible.slice(0,20);
  grid.innerHTML=visible.map(o=>`<article class="deal-card"><div class="card-top"><span class="store-tag">${o.store}</span><span class="discount">${o.discount}</span></div><div class="product-art"><span>${o.emoji}</span></div><div class="product-name">${o.name}</div><div class="prices"><span class="price">${fmt(o.price,city)}</span><span class="old-price">${fmt(o.old,city)}</span></div><div class="distance"><span>${o.branch}</span><b>${o.distance.toFixed(1)} km</b></div></article>`).join('');
  document.querySelector('#dealsTitle').textContent=`${visible.length} ofertas para ti`;
  document.querySelector('#emptyState').hidden=visible.length>0;
  document.querySelector('#resultNote').textContent=currentPosition?'Ordenadas desde tu ubicación actual':'En supermercados cerca de tu zona';
  document.querySelector('#locationLabel').textContent=city==='Lima'?'Lima, Perú':`${city}, Argentina`;
}
function setCity(next){city=next;currentPosition=null;document.querySelector('#locationNotice').hidden=false;document.querySelector('#demoDisclaimer').hidden=false;render()}
function useLocation(){
  if(!navigator.geolocation){alert('Este navegador no permite obtener la ubicación. Elige tu ciudad manualmente.');return}
  navigator.geolocation.getCurrentPosition(pos=>{
    currentPosition=pos.coords;
    const {latitude,longitude}=pos.coords;
    // Pilot bounding boxes select a market; accurate branch distances require real branch coordinates.
    if(latitude>-13.0&&latitude<-11.5&&longitude>-77.5&&longitude<-76.5)setCity('Lima');
    else if(latitude>-32.2&&latitude<-31.3&&longitude>-61.0&&longitude<-60.3)setCity('Santa Fe');
    else if(latitude>-35.2&&latitude<-34.0&&longitude>-59.5&&longitude<-57.5)setCity('Buenos Aires');
    else {currentPosition=null;alert('Por ahora el piloto está disponible en Lima, Buenos Aires y Santa Fe. Puedes elegir una ciudad para ver la demostración.');return}
    currentPosition=pos.coords;
    document.querySelector('#locationNotice').hidden=true;
    document.querySelector('#resultNote').textContent='Ubicación detectada · orden por cercanía disponible al conectar sucursales reales';
    render();
  },()=>alert('No pudimos acceder a tu ubicación. Puedes elegir Lima, Buenos Aires o Santa Fe manualmente.'),{enableHighAccuracy:true,timeout:10000,maximumAge:30000});
}
document.querySelector('#filtersToggle').addEventListener('click',()=>{const f=document.querySelector('#filters');f.hidden=!f.hidden});
document.querySelector('#locationButton').addEventListener('click',()=>cityDialog.showModal());
document.querySelector('#enableLocation').addEventListener('click',useLocation);
document.querySelector('#dialogGps').addEventListener('click',()=>{cityDialog.close();useLocation()});
cityDialog.querySelectorAll('.city-option').forEach(b=>b.addEventListener('click',()=>setCity(b.value)));
storeFilter.addEventListener('change',render);categoryFilter.addEventListener('change',render);
render();
