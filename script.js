// Replace 'YOUR_API_KEY' with your actual API key from OpenWeatherMap
const apiKey = '15117b74410ddddec93e0af9ed4d84a9';

// Initialize the map
let map;
function initializeMap(lat, lon) {
    if (map) {
        map.setView([lat, lon], 10);
        return;
    }
    map = L.map('map').setView([lat, lon], 10);

    // Add the OpenWeatherMap tile layer
    L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
        maxZoom: 19,
        attribution: 'Map data &copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
    }).addTo(map);
}

// Function to fetch weather data
function fetchWeather(zipCode, countryCode = 'us') {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},${countryCode}&appid=${apiKey}&units=imperial`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const temperature = data.main.temp;
            const humidity = data.main.humidity;
            const lat = data.coord.lat;
            const lon = data.coord.lon;

            // Update the HTML element with the temperature
            document.getElementById('temperature').textContent = temperature;
            document.getElementById('humidity').textContent = humidity;

            // Initialize the map with the fetched latitude and longitude
            initializeMap(lat, lon);

            // Fetch the 7-day forecast
            fetchForecast(lat, lon);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            document.getElementById('temperature').textContent = 'Error fetching temperature';
        });
}

// Function to fetch the 7-day forecast
function fetchForecast(lat, lon) {
    const forecastUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}&units=imperial`;

    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const forecastContainer = document.getElementById('forecastContainer');
            forecastContainer.innerHTML = ''; // Clear previous forecast

            data.daily.slice(0, 7).forEach(day => {
                const date = new Date(day.dt * 1000);
                const options = { weekday: 'long', month: 'long', day: 'numeric' };
                const formattedDate = date.toLocaleDateString(undefined, options);
                const tempDay = day.temp.day;
                const tempNight = day.temp.night;
                const description = day.weather[0].description;

                const forecastHTML = `
                    <div class="forecast-day">
                        <strong>${formattedDate}</strong>: 
                        Day: ${tempDay}°F, Night: ${tempNight}°F, ${description}
                    </div>
                `;
                forecastContainer.innerHTML += forecastHTML;
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

/* Function to get the user's current location and fetch weather
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Use OpenWeatherMap reverse geocoding to get the ZIP code
            const reverseGeocodeUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;

            fetch(reverseGeocodeUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    const zipCode = data[0].zip;

                    // Set the ZIP code input field
                    document.getElementById('zipCode').value = zipCode;

                    // Fetch weather for the current ZIP code
                    fetchWeather(zipCode);
                })
                .catch(error => {
                    console.error('Error fetching ZIP code:', error);
                });
        }, error => {
            console.error('Geolocation error:', error);
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}*/

// Event listener for the button click
document.getElementById('getWeatherBtn').addEventListener('click', function() {
    const zipCode = document.getElementById('zipCode').value;
    if (zipCode) {
        fetchWeather(zipCode);
    } else {
        alert('Please enter a valid ZIP code.');
    }
});

// Fetch weather on page load using the current location
window.onload = function() {
    getCurrentLocationWeather();
};
