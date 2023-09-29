const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "9f2e1f455e003246d00a9c41b725bbc8"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) { // HTML for the main weather card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Harorat: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Shamol: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Namlik: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { // HTML for the other five day forecast card
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Harorat: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Shamol: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Namlik: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });
    }).catch(() => {
        alert("Ob-havo maʼlumotlarini olishda xatolik yuz berdi!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`${cityName} qidiruvi bo'yicha koordinatalar topilmadi`);
        const {
            lat,
            lon,
            name
        } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("Koordinatalarni olishda xatolik yuz berdi!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const {
                latitude,
                longitude
            } = position.coords; // Get coordinates of user location
            // Get city name from coordinates using reverse geocoding API
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                const {
                    name
                } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("Shahar nomini olishda xatolik yuz berdi!");
            });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolokatsiya soʻrovi rad etildi. Qayta ruxsat berish uchun joylashuv ruxsatini qayta o‘rnating.");
            } else {
                alert("Geolokatsiya soʻrovi xatosi. Joylashuv ruxsatini qayta tiklang.");
            }
        });
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());