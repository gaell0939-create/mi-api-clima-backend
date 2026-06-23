const API_KEY = '1b2bf91d82feb5f36aa79ec583ee570d'; // OpenWeatherMap Key
const BACKEND_URL = 'https://mi-api-clima-backend.onrender.com/api/favoritos';

const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const weatherContent = document.getElementById('weather-content');

let ciudadActual = null;

// === CONSUMO DE API PÚBLICA (Clima actual) ===
async function obtenerClima(ciudad) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`;
    try {
        weatherContent.innerHTML = `<p class="welcome-msg"><i class="fas fa-spinner fa-spin"></i> Consultando el servicio web...</p>`;
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error('Ciudad no encontrada');
        
        const datos = await respuesta.json();
        
        // Guardamos los datos de la ciudad buscada con éxito para la API propia
        ciudadActual = { nombre: datos.name, pais: datos.sys.country };
        renderizarDashboard(datos);
    } catch (error) {
        weatherContent.innerHTML = `<p class="welcome-msg" style="color: #ff6b6b;">❌ Error: ${error.message}</p>`;
    }
}

// Función encargada de pintar los datos en el HTML
function renderizarDashboard(datos) {
    const { name, main, weather, wind } = datos;
    const iconoUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    // Aquí integramos de nuevo la tarjeta principal, la cuadrícula de detalles y tu API propia
    weatherContent.innerHTML = `
        <div class="main-card" style="text-align:center; margin-bottom: 30px;">
            <h2 class="city-name">${name}, ${datos.sys.country}</h2>
            <img src="${iconoUrl}" alt="${weather[0].description}">
            <div style="font-size: 54px; font-weight: bold; margin: 10px 0;">${Math.round(main.temp)}°C</div>
            <p class="weather-desc" style="text-transform: capitalize; opacity: 0.9;">${weather[0].description}</p>
            
            <button id="btn-favorito" style="margin-top:20px; padding:10px 20px; border-radius:10px; cursor:pointer; background:#4a90e2; color:white; border:none; font-weight:600; transition: background 0.3s;">
                <i class="fas fa-star"></i> Guardar en mis Favoritos
            </button>
        </div>

        <div class="details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="detail-item">
                <i class="fas fa-temperature-high"></i>
                <div class="detail-info">
                    <p>Sensación</p>
                    <span>${Math.round(main.feels_like)}°C</span>
                </div>
            </div>
            <div class="detail-item">
                <i class="fas fa-tint"></i>
                <div class="detail-info">
                    <p>Humedad</p>
                    <span>${main.humidity}%</span>
                </div>
            </div>
            <div class="detail-item">
                <i class="fas fa-wind"></i>
                <div class="detail-info">
                    <p>Viento</p>
                    <span>${wind.speed} m/s</span>
                </div>
            </div>
            <div class="detail-item">
                <i class="fas fa-compress-alt"></i>
                <div class="detail-info">
                    <p>Presión</p>
                    <span>${main.pressure} hPa</span>
                </div>
            </div>
        </div>
    `;

    // Escuchador de eventos para el botón de favoritos recién creado en el DOM
    document.getElementById('btn-favorito').addEventListener('click', guardarCiudadFavorita);
}

// === CONSUMO DE TU PROPIA API (Favoritos) ===

// 1. Obtener Favoritos (GET) - ACTUALIZADA
async function cargarFavoritos() {
    try {
        const respuesta = await fetch(BACKEND_URL);
        const favoritos = await respuesta.json();
        const favContainer = document.getElementById('favoritos-container');
        
        if (favContainer) {
            favContainer.innerHTML = '<h3 style="margin-bottom:15px; font-size:18px;">⭐ Favoritos (Desde mi API)</h3>';
            if (favoritos.length === 0) {
                favContainer.innerHTML += '<p style="font-size:14px; opacity:0.7; text-align:center;">No hay ciudades favoritas.</p>';
            }
            favoritos.forEach(c => {
                favContainer.innerHTML += `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin:8px 0; background:rgba(255,255,255,0.1); padding:12px; border-radius:10px; border: 1px solid rgba(255,255,255,0.05);">
                        <span onclick="obtenerClima('${c.nombre}')" style="font-weight:500; cursor:pointer; flex:1; transition: color 0.2s;" onmouseover="this.style.color='#4a90e2'" onmouseout="this.style.color='white'">
                            ${c.nombre}, ${c.pais}
                        </span>
                        <button onclick="eliminarFavorito(${c.id})" style="background:none; border:none; color:#ff6b6b; cursor:pointer; font-size:16px; padding-left:10px;"><i class="fas fa-trash"></i></button>
                    </div>`;
            });
        }
    } catch (error) {
        console.error("Error al cargar favoritos de la API propia:", error);
    }
}

// 2. Guardar Favorito (POST)
async function guardarCiudadFavorita() {
    if (!ciudadActual) return;
    try {
        const respuesta = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ciudadActual)
        });
        if (respuesta.status === 201) {
            cargarFavoritos(); // Refresca la lista de favoritos abajo
        }
    } catch (error) {
        console.error("Error al guardar en la API propia:", error);
    }
}

// 3. Eliminar Favorito (DELETE)
async function eliminarFavorito(id) {
    try {
        const respuesta = await fetch(`${BACKEND_URL}/${id}`, { method: 'DELETE' });
        if (respuesta.ok) {
            cargarFavoritos(); // Refresca la lista tras eliminar
        }
    } catch (error) {
        console.error("Error al eliminar de la API propia:", error);
    }
}

// Eventos para la búsqueda
searchBtn.addEventListener('click', () => searchInput.value.trim() && obtenerClima(searchInput.value.trim()));
searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && searchInput.value.trim() && obtenerClima(searchInput.value.trim()));

// Cargar favoritos del backend local al arrancar la app
window.addEventListener('DOMContentLoaded', cargarFavoritos);
