const searchInput = document.getElementById('search');
const cityLabel = document.getElementById('city-label');
const currentIcon = document.getElementById('current-icon');
const currentTemp = document.getElementById('current-temp');
const currentDate = document.getElementById('current-date');
const timeLabel = document.getElementById('current-time');
const weatherDetails = document.getElementById('weather-details');
const weeklyForecast = document.getElementById('weekly-forecast');
const btnC = document.getElementById('btn-celsius');
const btnF = document.getElementById('btn-fahrenheit');

const dropdown = document.createElement('ul');
dropdown.id = 'city-dropdown';
searchInput.parentNode.appendChild(dropdown);

let unit = 'C';
let cachedData = null;

function convertTemp(temp) {
    return unit === 'F' ? Math.round((temp * 9) / 5 + 32) : Math.round(temp);
}

function unitLabel() {
    return unit === 'F' ? '°F' : '°C';
}

function showError(msg) {
    currentTemp.textContent = '--';
    currentIcon.textContent = '❌';
    weatherDetails.innerHTML = `<p style="color:red">${msg}</p>`;
    weeklyForecast.innerHTML = '';
}

function createDropdownItem(city) {
    const li = document.createElement('li');
    li.textContent = `${city.name}, ${city.admin1 || ''}, ${city.country}`;
    li.addEventListener('click', () => {
        dropdown.innerHTML = '';
        searchInput.value = li.textContent;
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
    currentTemp.textContent = 'Loading...';
    currentIcon.textContent = '⏳';
    weatherDetails.innerHTML = '';
    weeklyForecast.innerHTML = '';
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();
        cachedData = data;
        updateUI(data);
    } catch (e) {
        showError('Weather fetch failed.');
    }
}

function createDateLabelItem(label) {
    const div = document.createElement('div');
    div.className = 'date-label';
    div.textContent = label;
    div.style.cssText = `
        width: 100%;
        text-align: left;
        font-weight: bold;
        padding: 5px 1px 5px;
        font-size: 1rem;
        color: #444;
        align-items: center;
        justify-content: center;
    `;
    return div;
}

function getWeatherEmoji(code) {
    if (code === 0) return '☀️';
    if ([1, 2, 3].includes(code)) return '☁️';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55].includes(code)) return '🌦️';
    if ([61, 63, 65].includes(code)) return '🌧️';
    if ([71, 73, 75].includes(code)) return '❄️';
    if ([80, 81, 82].includes(code)) return '🌦️';
    if (code === 95) return '⛈️';
    if ([96, 99].includes(code)) return '⛈️';
    return '❓';
}

function createWeatherItem(time, temp, weatherCode) {
    const div = document.createElement('div');
    div.className = 'weather-item';

    const icon = getWeatherEmoji(weatherCode);

    div.innerHTML = `
        <div class="time">${time}</div>
        <div class="icon">${icon}</div>
        <div class="temp">${temp}${unitLabel()}</div>
    `;
    return div;
}

function updateUI(data) {
    weatherDetails.innerHTML = '';
    const temps = data.hourly.temperature_2m;
    const weatherCodes = data.hourly.weathercode;
    const times = data.hourly.time;
    const timezone = data.timezone || 'UTC';

    const now = new Date();
    const cityNow = new Date(now.toLocaleString('en-US', { timeZone: timezone }));

    timeLabel.textContent = cityNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ` ${timezone}`;
    currentDate.textContent = cityNow.toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const currentWeatherCode = data.current_weather.weathercode;
    const currentTemperature = convertTemp(data.current_weather.temperature);

    currentIcon.textContent = getWeatherEmoji(currentWeatherCode);
    currentTemp.textContent = `${currentTemperature} ${unitLabel()}`;

    let count = 0;
    let lastDate = null;

    for (let i = 0; i < times.length && count < 24; i++) {
        const utcTime = new Date(times[i]);
        const cityTime = new Date(utcTime.toLocaleString('en-US', { timeZone: timezone }));
        if (cityTime <= cityNow) continue;

        const timeStr = cityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const thisDate = cityTime.toDateString();
        if (lastDate !== null && thisDate !== lastDate) {
            const readableDate = cityTime.toLocaleDateString('en-GB', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            });
            weatherDetails.appendChild(createDateLabelItem(readableDate));
        }

        weatherDetails.appendChild(createWeatherItem(timeStr, convertTemp(temps[i]), weatherCodes[i]));
        lastDate = thisDate;
        count++;
    }

    const spacer = document.createElement('div');
    spacer.style.minWidth = '20px';
    weatherDetails.appendChild(spacer);

    const days = data.daily;
    weeklyForecast.innerHTML = '';
    for (let i = 0; i < days.time.length; i++) {
        const date = new Date(days.time[i]);
        const dayStr = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
        const max = convertTemp(days.temperature_2m_max[i]);
        const min = convertTemp(days.temperature_2m_min[i]);
        const div = document.createElement('div');
        div.className = 'week-item';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'space-between';

        div.innerHTML = `
            <span style="width: 60px">${dayStr}</span>
            <span style="width: 40px; text-align:right">${min}${unitLabel()}</span>
            <div class="bar" style="flex: 1; margin: 0 10px; height: 10px; background: linear-gradient(to right, blue, red);"></div>
            <span style="width: 40px">${max}${unitLabel()}</span>
        `;
        weeklyForecast.appendChild(div);
    }
}

searchInput.addEventListener('input', e => {
    const query = e.target.value.trim();
    if (query.length >= 2) fetchCitySuggestions(query);
    else dropdown.innerHTML = '';
});

btnC.addEventListener('click', () => {
    unit = 'C';
    btnC.classList.add('active');
    btnF.classList.remove('active');
    if (cachedData) updateUI(cachedData);
});

btnF.addEventListener('click', () => {
    unit = 'F';
    btnF.classList.add('active');
    btnC.classList.remove('active');
    if (cachedData) updateUI(cachedData);
});

fetchWeather(52.52, 13.41);
cityLabel.textContent = 'Berlin, State of Berlin, Germany';
