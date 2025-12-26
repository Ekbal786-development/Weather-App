const apiKey = "9875418c53111d9be26588a1aaf09eb1";
const apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

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

function updateUI(data) {
  statusMessage.textContent = "";
  weatherBox.style.display = "block";

  cityEl.textContent = data.name;
  tempEl.textContent = `${Math.round(data.main.temp)}°C`;
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

  fetchWeather(city);
});


retryBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
  }
});
