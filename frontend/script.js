const searchInput = document.getElementById('search');
const currentIcon = document.getElementById('current-icon');
const currentTemp = document.getElementById('current-temp');
const weatherDetails = document.getElementById('weather-details');
const btnDay = document.getElementById('btn-day');
const btnWeek = document.getElementById('btn-week');
const searchBtn = document.getElementById('search-btn');
const cityLabel = document.getElementById('city-label');

const dropdown = document.createElement('ul');
dropdown.id = 'city-dropdown';
searchInput.parentNode.appendChild(dropdown);

let currentView = 'day';

function showLoading() {
    currentTemp.textContent = 'Loading...';
    currentIcon.textContent = '⏳';
    weatherDetails.innerHTML = '';
}

function showError(msg) {
    currentTemp.textContent = '-- °C';
    currentIcon.textContent = '❌';
    weatherDetails.innerHTML = `<p style="color:red">${msg}</p>`;
}

function createDropdownItem(city) {
    const li = document.createElement('li');
    li.textContent = `${city.name}, ${city.admin1 || ''}, ${city.country}`;
    li.addEventListener('click', () => {
        dropdown.innerHTML = '';
        searchInput.value = li.textContent;
        const cityLabel = document.getElementById('city-label');
        cityLabel.textContent = `${city.name}${city.admin1 ? ', ' + city.admin1 : ''}, ${city.country}`;
        fetchWeather(city.latitude, city.longitude);
    });
    return li;
}

async function fetchCitySuggestions(query) {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`);
    const data = await res.json();
    dropdown.innerHTML = '';
    if (data.results) {
        data.results.forEach(city => {
            dropdown.appendChild(createDropdownItem(city));
        });
    }
}

async function fetchWeather(lat, lon) {
    showLoading();
    try {
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error('Failed to fetch weather');
        const data = await res.json();
        updateCurrentWeather(data);
        updateWeatherDetails(data);
    } catch (err) {
        console.error(err);
        showError('Weather fetch failed.');
    }
}

function updateCurrentWeather(data) {
    const temps = data.hourly.temperature_2m;
    if (!temps || temps.length === 0) {
        showError('No data.');
        return;
    }
    currentTemp.textContent = `${temps[0]} °C`;
    currentIcon.textContent = '☀️'; // placeholder icon
}

function updateWeatherDetails(data) {
    weatherDetails.innerHTML = '';
    const temps = data.hourly.temperature_2m;
    const times = data.hourly.time;

    if (currentView === 'day') {
        for (let i = 0; i < 24 && i < times.length; i++) {
            const time = times[i].slice(11, 16);
            const temp = temps[i];
            weatherDetails.appendChild(createWeatherItem(time, temp));
        }
    } else {
        weatherDetails.innerHTML = '<p>Weekly view not implemented.</p>';
    }
}

function createWeatherItem(time, temp) {
    const div = document.createElement('div');
    div.className = 'weather-item';
    div.innerHTML = `
    <div class="time">${time}</div>
    <div class="icon">🌤️</div>
    <div class="temp">${temp}°C</div>
  `;
    return div;
}

btnDay.addEventListener('click', () => {
    currentView = 'day';
    btnDay.classList.add('active');
    btnWeek.classList.remove('active');
});

btnWeek.addEventListener('click', () => {
    currentView = 'week';
    btnWeek.classList.add('active');
    btnDay.classList.remove('active');
    weatherDetails.innerHTML = '<p>Weekly view not implemented.</p>';
});

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length >= 2) {
        fetchCitySuggestions(query);
    } else {
        dropdown.innerHTML = '';
    }
});

// loadup
fetchWeather(52.52, 13.41); // Berlin
cityLabel.textContent = 'Berlin, State of Berlin, Germany';

