const apiKey = "9875418c53111d9be26588a1aaf09eb1";
const apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
  const geoApiUrl =
  "https://api.openweathermap.org/data/2.5/weather?units=metric";


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

function updateUI(data) {
  localStorage.setItem("lastCity", city);
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

  const condition = data.weather[0].main;

  switch (condition) {
    case "Clouds":
      weatherIcon.src = "images/clouds.png";
      break;
    case "Clear":
      weatherIcon.src = "images/clear.png";
      break;
    case "Rain":
      weatherIcon.src = "images/rain.png";
      break;
    case "Drizzle":
      weatherIcon.src = "images/drizzle.png";
      break;
    case "Mist":
      weatherIcon.src = "images/mist.png";
      break;
    default:
      weatherIcon.src = "images/clouds.png";
  }
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

if (lastCity) {
  fetchWeather(lastCity);
} else {
  detectUserLocation();
}

