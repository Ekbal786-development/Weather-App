const apiKey = "9875418c53111d9be26588a1aaf09eb1";
const apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const geoApiUrl =
  "https://api.openweathermap.org/data/2.5/weather?units=metric";
const forecastApiUrl =
  "https://api.openweathermap.org/data/2.5/forecast?units=metric";



// DOM elements
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const statusMessage = document.getElementById("status-message");

const weatherBox = document.getElementById("weather-result");
const weatherIcon = document.querySelector(".weather-icon");
const tempEl = document.querySelector(".temp");
const cityEl = document.querySelector(".city");
const humidityEl = document.querySelector(".humidity");
const windEl = document.querySelector(".wind");
const feelsLikeEl = document.querySelector(".feels-like");
const descriptionEl = document.querySelector(".description");
const loader = document.getElementById("loader");
const retryBtn = document.getElementById("retry-btn");
const hourlyList = document.getElementById("hourly-list");
const dailyList = document.getElementById("daily-list");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");




async function fetchWeather(city) {
  try {
    statusMessage.textContent = "";
    retryBtn.style.display = "none";
    loader.style.display = "block";
    weatherBox.style.display = "none";

    const response = await fetch(`${apiUrl}${city}&appid=${apiKey}`);

    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();
    updateUI(data);
  } catch (error) {
    statusMessage.textContent =
      "❌ Unable to fetch weather. Please try again.";
    statusMessage.style.color = "crimson";
    retryBtn.style.display = "block";
  } finally {
    loader.style.display = "none";
  }
}

async function fetchWeatherByCoords(lat, lon) {
  try {
    statusMessage.textContent = "Detecting your location...";
    statusMessage.style.color = "#555";
    retryBtn.style.display = "none";
    loader.style.display = "block";
    weatherBox.style.display = "none";

    const response = await fetch(
      `${geoApiUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Location weather failed");
    }

    const data = await response.json();
    updateUI(data);
  } catch (error) {
    statusMessage.textContent =
      "Unable to detect location. Please search manually.";
    statusMessage.style.color = "crimson";
  } finally {
    loader.style.display = "none";
  }
}

async function fetchForecast(city) {
  try {
    const response = await fetch(
      `${forecastApiUrl}&q=${city}&appid=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Forecast fetch failed");
    }

    const data = await response.json();

    renderHourlyForecast(data.list.slice(0, 8));
    renderDailyForecast(data.list);
  } catch (error) {
    hourlyList.innerHTML = "<p>Unable to load hourly forecast.</p>";
    dailyList.innerHTML = "<p>Unable to load 5-day forecast.</p>";
  }
}

function renderHourlyForecast(hours) {
  hourlyList.innerHTML = "";

  hours.forEach(hour => {
    const time = new Date(hour.dt * 1000).getHours();
    const temp = Math.round(hour.main.temp);
    const icon = hour.weather[0].icon;

    hourlyList.innerHTML += `
      <div class="hourly-item">
        <div>${time}:00</div>
        <img src="https://openweathermap.org/img/wn/${icon}.png" />
        <span>${temp}°</span>
      </div>
    `;
  });
}

function renderDailyForecast(list) {
  dailyList.innerHTML = "";

  const dailyData = list
    .filter(item => item.dt_txt.includes("12:00:00"))
    .slice(0, 5);

  dailyData.forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", {
      weekday: "short",
    });
    const temp = Math.round(day.main.temp);
    const icon = day.weather[0].icon;

    dailyList.innerHTML += `
      <div class="daily-item">
        <div>${dayName}</div>
        <img src="https://openweathermap.org/img/wn/${icon}.png" />
        <span>${temp}°</span>
      </div>
    `;
  });
}

function updateUI(data) {
  // ----- DAY / NIGHT DETECTION -----
const currentTime = data.dt;
const sunrise = data.sys.sunrise;
const sunset = data.sys.sunset;

document.body.classList.remove("day", "night");

if (currentTime >= sunrise && currentTime < sunset) {
  document.body.classList.add("day");
} else {
  document.body.classList.add("night");
}

  localStorage.setItem("lastCity", data.name);

  statusMessage.textContent = "";
  weatherBox.style.display = "block";

  cityEl.textContent = data.name;
  tempEl.textContent = `${Math.round(data.main.temp)}°C`;
  feelsLikeEl.textContent =
  `Feels like ${Math.round(data.main.feels_like)}°C`;

  descriptionEl.textContent =
  data.weather[0].description;

  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = `${data.wind.speed} km/h`;

  const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString(
  [],
  { hour: "2-digit", minute: "2-digit" }
);

const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString(
  [],
  { hour: "2-digit", minute: "2-digit" }
);

sunriseEl.textContent = sunriseTime;
sunsetEl.textContent = sunsetTime;

const iconCode = data.weather[0].icon;
weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  
  fetchForecast(data.name);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    statusMessage.textContent = "⚠ Please enter a city name.";
    statusMessage.style.color = "orange";
    return;
  }

  localStorage.setItem("lastCity", city);
  fetchWeather(city);
});


retryBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
  }
});

function detectUserLocation() {
  if (!navigator.geolocation) {
    statusMessage.textContent =
      "Geolocation is not supported by your browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => {
      statusMessage.textContent =
        "Location permission denied. Please search manually.";
    }
  );
}

const lastCity = localStorage.getItem("lastCity");

if (lastCity && lastCity.trim().length > 0) {
  fetchWeather(lastCity);
} else {
  detectUserLocation();
}


