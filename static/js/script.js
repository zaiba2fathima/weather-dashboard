// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const currentWeather = document.getElementById('currentWeather');
const forecastSection = document.getElementById('forecastSection');
const loadingState = document.getElementById('loadingState');
const welcomeMessage = document.getElementById('welcomeMessage');

// Authentication elements
const authSection = document.getElementById('authSection');
const userSection = document.getElementById('userSection');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const username = document.getElementById('username');

// Modal elements
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const closeSignupModal = document.getElementById('closeSignupModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');

// Favorites elements
const favoritesSection = document.getElementById('favoritesSection');
const favoritesContainer = document.getElementById('favoritesContainer');
const noFavorites = document.getElementById('noFavorites');
const addToFavoritesBtn = document.getElementById('addToFavoritesBtn');

// Weather map elements
const weatherMap = document.getElementById('weatherMap');
const mapContainer = document.getElementById('mapContainer');
const mapLayersBtn = document.getElementById('mapLayersBtn');

// Social sharing elements
const socialSharing = document.getElementById('socialSharing');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const twitterBtn = document.getElementById('twitterBtn');
const facebookBtn = document.getElementById('facebookBtn');
const whatsappBtn = document.getElementById('whatsappBtn');

// Unit toggle elements
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');

// Weather data elements
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const currentTemp = document.getElementById('currentTemp');
const weatherDescription = document.getElementById('weatherDescription');
const weatherIcon = document.getElementById('weatherIcon');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const windDirection = document.getElementById('windDirection');
const windDirectionArrow = document.getElementById('windDirectionArrow');
const forecastContainer = document.getElementById('forecastContainer');

// Geolocation state
let userLocation = null;
let isLocationDetected = false;

// Temperature unit state
let currentUnit = 'celsius';
let currentWeatherData = null;

// Authentication state
let currentUser = null;
let isAuthenticated = false;

// Map state
let weatherMapInstance = null;
let currentMapCenter = null;
let weatherLayersVisible = false;

// Theme state
let currentTheme = 'light';
let sunriseTime = null;
let sunsetTime = null;

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
locationBtn.addEventListener('click', getCurrentLocation);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Social sharing event listeners
copyLinkBtn.addEventListener('click', copyWeatherLink);
twitterBtn.addEventListener('click', shareOnTwitter);
facebookBtn.addEventListener('click', shareOnFacebook);
whatsappBtn.addEventListener('click', shareOnWhatsApp);

// Unit toggle event listeners
celsiusBtn.addEventListener('click', () => setTemperatureUnit('celsius'));
fahrenheitBtn.addEventListener('click', () => setTemperatureUnit('fahrenheit'));

// Authentication event listeners
loginBtn.addEventListener('click', () => showModal(loginModal));
signupBtn.addEventListener('click', () => showModal(signupModal));
closeLoginModal.addEventListener('click', () => hideModal(loginModal));
closeSignupModal.addEventListener('click', () => hideModal(signupModal));
switchToSignup.addEventListener('click', () => switchModal(loginModal, signupModal));
switchToLogin.addEventListener('click', () => switchModal(signupModal, loginModal));
logoutBtn.addEventListener('click', logout);

// Form submissions
loginForm.addEventListener('submit', handleLogin);
signupForm.addEventListener('submit', handleSignup);

// Favorites event listeners
addToFavoritesBtn.addEventListener('click', addCurrentCityToFavorites);

// Map event listeners
mapLayersBtn.addEventListener('click', toggleWeatherLayers);

// Focus on input when page loads
window.addEventListener('load', () => {
    cityInput.focus();
    // Attempt to get location on page load if not already detected
    if (!isLocationDetected) {
        getCurrentLocation();
    }
});

// Geolocation functions
function getCurrentLocation() {
    if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser');
        return;
    }

    showLoading();
    hideError();
    
    navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
            const { latitude, longitude } = position.coords;
            userLocation = { latitude, longitude };
            isLocationDetected = true;
            
            console.log(`Location detected: ${latitude}, ${longitude}`);
            
            // Generate mock weather data for the detected location
            setTimeout(() => {
                const weatherData = generateMockWeatherDataByCoordinates(latitude, longitude);
                if (weatherData) {
                    displayWeatherData(weatherData);
                    hideLoading();
                    updateWelcomeMessage();
                } else {
                    showError('Unable to fetch weather for your location');
                    hideLoading();
                }
            }, 1000);
        },
        // Error callback
        (error) => {
            console.log('Geolocation error:', error);
            hideLoading();
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    showError('Location access denied. Please allow location access or search for a city manually.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    showError('Location information unavailable. Please search for a city manually.');
                    break;
                case error.TIMEOUT:
                    showError('Location request timed out. Please search for a city manually.');
                    break;
                default:
                    showError('Unable to detect your location. Please search for a city manually.');
                    break;
            }
        },
        // Options
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

// Generate mock weather data
function generateMockWeatherData(city) {
    const weatherConditions = ['sunny', 'cloudy', 'rainy', 'snowy', 'thunderstorm'];
    const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    // Generate random coordinates for the city (mock)
    const lat = 40.7128 + (Math.random() - 0.5) * 20; // Around NYC area
    const lon = -74.0060 + (Math.random() - 0.5) * 20;
    
    // Generate sunrise/sunset times (mock - based on current time)
    const now = new Date();
    const sunrise = new Date(now);
    sunrise.setHours(6, 0, 0, 0); // 6 AM
    const sunset = new Date(now);
    sunset.setHours(18, 0, 0, 0); // 6 PM
    
    return {
        city: city,
        temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
        condition: randomCondition,
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 30) + 5, // 5-35 km/h
        windDirection: Math.floor(Math.random() * 360), // 0-359 degrees
        coordinates: { lat, lon },
        sunrise: Math.floor(sunrise.getTime() / 1000),
        sunset: Math.floor(sunset.getTime() / 1000)
    };
}

// Generate 5-day forecast data
function generateForecastData(weatherConditions) {
    const forecast = [];
    const today = new Date();
    
    for (let i = 1; i <= 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const highTemp = Math.floor(Math.random() * 15) + 20; // 20-35°C
        const lowTemp = Math.floor(Math.random() * 10) + 5; // 5-15°C
        
        forecast.push({
            date: date,
            condition: randomCondition,
            highTemp: highTemp,
            lowTemp: lowTemp
        });
    }
    
    return forecast;
}

// Generate mock weather data based on coordinates (placeholder for real API)
function generateMockWeatherDataByCoordinates(lat, lon) {
    const weatherConditions = ['sunny', 'cloudy', 'rainy', 'snowy', 'thunderstorm'];
    const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    // Generate sunrise/sunset times (mock - based on current time)
    const now = new Date();
    const sunrise = new Date(now);
    sunrise.setHours(6, 0, 0, 0); // 6 AM
    const sunset = new Date(now);
    sunset.setHours(18, 0, 0, 0); // 6 PM
    
    return {
        city: 'Your Location',
        temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
        condition: randomCondition,
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 30) + 5, // 5-35 km/h
        windDirection: Math.floor(Math.random() * 360), // 0-359 degrees
        coordinates: { lat, lon },
        sunrise: Math.floor(sunrise.getTime() / 1000),
        sunset: Math.floor(sunset.getTime() / 1000)
    };
}

// Display weather data
function displayWeatherData(data) {
    // Store current weather data for unit toggle functionality
    currentWeatherData = data;
    
    // Update city name and date
    cityName.textContent = data.city;
    currentDate.textContent = formatDate(new Date());
    
    // Update temperature with current unit
    const temp = convertTemperature(data.temperature, currentUnit);
    currentTemp.textContent = `${temp}°${currentUnit === 'celsius' ? 'C' : 'F'}`;
    
    // Update weather description
    weatherDescription.textContent = data.condition.charAt(0).toUpperCase() + data.condition.slice(1);
    
    // Update weather icon with animated version
    const isNight = isNightTime(data.sunrise, data.sunset);
    updateWeatherIcon(data.condition, isNight);
    
    // Update weather details
    humidity.textContent = `${data.humidity}%`;
    windSpeed.textContent = `${data.windSpeed} km/h`;
    updateWindDirection(data.windDirection);
    
    // Initialize or update map
    if (data.coordinates) {
        updateMapLocation(data.coordinates.lat, data.coordinates.lon);
    }
    
    // Update theme based on time and weather
    updateThemeBasedOnTime(data.sunrise, data.sunset);
    
    // Update weather background
    updateWeatherBackground(data.condition, isNight);
    
    // Show weather sections
    currentWeather.classList.remove('hidden');
    forecastSection.classList.remove('hidden');
    socialSharing.classList.remove('hidden');
    
    // Hide welcome message
    welcomeMessage.classList.add('hidden');
    
    // Hide error message if visible
    hideError();
    
    // Smooth scroll to weather data
    smoothScrollTo(currentWeather);
    
    // Generate and display forecast
    const forecast = generateForecastData([data.condition]);
    generateForecastCards(forecast);
}

// Generate forecast cards
function generateForecastCards(forecast) {
    forecastContainer.innerHTML = '';
    
    forecast.forEach(day => {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        
        // Create animated icon for forecast
        const animatedIcon = createAnimatedWeatherIcon(day.condition, false);
        animatedIcon.style.width = '40px';
        animatedIcon.style.height = '40px';
        
        card.innerHTML = `
            <div class="forecast-day">${day.date.toLocaleDateString('en-US', { weekday: 'long' })}</div>
            <div class="forecast-icon"></div>
            <div class="forecast-temp">${day.highTemp}° / ${day.lowTemp}°</div>
            <div class="forecast-description">${day.condition.charAt(0).toUpperCase() + day.condition.slice(1)}</div>
        `;
        
        // Add animated icon to the forecast icon container
        const iconContainer = card.querySelector('.forecast-icon');
        iconContainer.appendChild(animatedIcon);
        
        forecastContainer.appendChild(card);
    });
}

// Format date
function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// Show loading state
function showLoading() {
    loadingState.classList.remove('hidden');
    currentWeather.classList.add('hidden');
    forecastSection.classList.add('hidden');
    socialSharing.classList.add('hidden');
    weatherMap.classList.add('hidden');
    welcomeMessage.classList.add('hidden');
    hideError();
}

// Hide loading state
function hideLoading() {
    loadingState.classList.add('hidden');
}

// Update wind direction indicator
function updateWindDirection(direction) {
    if (windDirection && windDirectionArrow) {
        // Update the text display
        windDirection.textContent = `${direction}°`;
        
        // Rotate the arrow based on wind direction
        // Wind direction is typically measured clockwise from North (0°)
        const rotation = direction;
        windDirectionArrow.style.transform = `rotate(${rotation}deg)`;
        
        // Add a smooth transition effect
        windDirectionArrow.style.transition = 'transform 0.5s ease';
    }
}

// Get weather icon based on condition
function getWeatherIcon(condition) {
    const iconMap = {
        'sunny': '☀️',
        'cloudy': '☁️',
        'rainy': '🌧️',
        'snowy': '❄️',
        'thunderstorm': '⛈️',
        'clear': '☀️',
        'overcast': '☁️',
        'rain': '🌧️',
        'snow': '❄️',
        'storm': '⛈️'
    };
    
    return iconMap[condition.toLowerCase()] || '🌤️';
}

function getRandomWeatherDescription() {
    const descriptions = [
        'Partly cloudy with occasional sunshine',
        'Clear skies with light breeze',
        'Overcast conditions expected',
        'Scattered showers possible',
        'Light snowfall in the morning',
        'Thunderstorms in the afternoon',
        'Foggy conditions early',
        'Hazy sunshine throughout the day'
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Legacy function for backward compatibility
function getWeatherIcon(condition) {
    const iconMap = {
        'sunny': '☀️',
        'cloudy': '☁️',
        'rainy': '🌧️',
        'snowy': '❄️',
        'thunderstorm': '⛈️',
        'clear': '☀️',
        'overcast': '☁️',
        'rain': '🌧️',
        'snow': '❄️',
        'storm': '⛈️'
    };
    
    return iconMap[condition.toLowerCase()] || '🌤️';
}

// Reset to welcome state
function resetToWelcome() {
    // Hide all weather sections
    currentWeather.classList.add('hidden');
    forecastSection.classList.add('hidden');
    socialSharing.classList.add('hidden');
    weatherMap.classList.add('hidden');
    
    // Show welcome message
    welcomeMessage.classList.remove('hidden');
    
    // Reset theme to light
    setTheme('light');
    
    // Clear input
    cityInput.value = '';
    
    // Reset weather background
    document.body.className = '';
    
    // Focus on input
    cityInput.focus();
    
    // Hide error message
    hideError();
    
    // Reset map if exists
    if (weatherMapInstance) {
        weatherMapInstance.remove();
        weatherMapInstance = null;
        currentMapCenter = null;
    }
    
    // Reset weather layers
    weatherLayersVisible = false;
    mapLayersBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h18v18H3z"></path>
            <path d="M9 9h6v6H9z"></path>
        </svg>
        Weather Layers
    `;
}

// Add some interactive features
cityInput.addEventListener('input', () => {
    // Clear error when user starts typing
    if (errorMessage.classList.contains('hidden') === false) {
        hideError();
    }
});

// Add click outside to close error functionality
document.addEventListener('click', (e) => {
    if (!errorMessage.contains(e.target) && !errorMessage.classList.contains('hidden')) {
        hideError();
    }
});

// Add smooth scrolling for better UX
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Search handler
function handleSearch() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    showLoading();
    
    // Simulate API call delay
    setTimeout(() => {
        const weatherData = generateMockWeatherData(city);
        
        if (weatherData) {
            displayWeatherData(weatherData);
            hideLoading();
        } else {
            showError('City not found. Please try again.');
            hideLoading();
        }
    }, 1500);
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideError();
        resetToWelcome();
    }
});

// Add some visual feedback for better UX
searchBtn.addEventListener('mousedown', () => {
    searchBtn.style.transform = 'scale(0.95)';
});

searchBtn.addEventListener('mouseup', () => {
    searchBtn.style.transform = 'scale(1)';
});

searchBtn.addEventListener('mouseleave', () => {
    searchBtn.style.transform = 'scale(1)';
});

// Update welcome message when location is detected
function updateWelcomeMessage() {
    if (isLocationDetected) {
        welcomeMessage.innerHTML = `
            <div class="welcome-icon">📍</div>
            <h2>Weather for Your Location</h2>
            <p>We've automatically detected your location and displayed the current weather. You can still search for other cities above.</p>
        `;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Initial animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // Focus on input
    cityInput.focus();

    // Attempt to get user's location automatically
    getCurrentLocation();
});

// Add some sample cities for testing
const sampleCities = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney', 'Berlin', 'Moscow', 'Dubai'];

// Add sample city buttons (optional enhancement)
function addSampleCityButtons() {
    const sampleContainer = document.createElement('div');
    sampleContainer.className = 'sample-cities';
    sampleContainer.style.cssText = 'text-align: center; margin-top: 20px;';
    
    sampleContainer.innerHTML = '<p style="color: white; margin-bottom: 10px; opacity: 0.8;">Try these cities:</p>';
    
    sampleCities.forEach(city => {
        const btn = document.createElement('button');
        btn.textContent = city;
        btn.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 8px 16px;
            margin: 4px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s ease;
        `;
        
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'rgba(255, 255, 255, 0.3)';
            btn.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'rgba(255, 255, 255, 0.2)';
            btn.style.transform = 'translateY(0)';
        });
        
        btn.addEventListener('click', () => {
            cityInput.value = city;
            handleSearch();
        });
        
        sampleContainer.appendChild(btn);
    });
    
    // Insert after search section
    const searchSection = document.querySelector('.search-section');
    searchSection.parentNode.insertBefore(sampleContainer, searchSection.nextSibling);
}

// Uncomment the line below to add sample city buttons
// addSampleCityButtons();

// Temperature Unit Functions
function setTemperatureUnit(unit) {
    if (unit === currentUnit) return;
    
    currentUnit = unit;
    
    // Update button states
    celsiusBtn.classList.toggle('active', unit === 'celsius');
    fahrenheitBtn.classList.toggle('active', unit === 'fahrenheit');
    
    // Update temperature displays if weather data exists
    if (currentWeatherData) {
        updateTemperatureDisplay();
    }
}

function convertTemperature(celsius, unit) {
    if (unit === 'fahrenheit') {
        return Math.round((celsius * 9/5) + 32);
    }
    return celsius;
}

function updateTemperatureDisplay() {
    if (!currentWeatherData) return;
    
    // Update current temperature
    const currentTempC = currentWeatherData.current.temperature;
    const currentTempF = convertTemperature(currentTempC, currentUnit);
    currentTemp.textContent = `${currentTempF}°${currentUnit === 'celsius' ? 'C' : 'F'}`;
    
    // Update forecast temperatures
    const forecastCards = forecastContainer.querySelectorAll('.forecast-card');
    forecastCards.forEach((card, index) => {
        const forecast = currentWeatherData.forecast[index];
        if (forecast) {
            const highTempC = forecast.highTemp;
            const lowTempC = forecast.lowTemp;
            const highTempF = convertTemperature(highTempC, currentUnit);
            const lowTempF = convertTemperature(lowTempC, currentUnit);
            
            const tempElement = card.querySelector('.forecast-temp');
            if (tempElement) {
                tempElement.textContent = `${highTempF}° / ${lowTempF}°`;
            }
        }
    });
}

// Dynamic Background Functions
function updateWeatherBackground(weatherCondition, isNight = false) {
    // Remove all weather background classes
    document.body.classList.remove(
        'weather-sunny', 'weather-rainy', 'weather-cloudy', 
        'weather-snowy', 'weather-thunderstorm', 'weather-night'
    );
    
    // Determine if it's night time (between 6 PM and 6 AM)
    const currentHour = new Date().getHours();
    const isNightTime = currentHour < 6 || currentHour >= 18;
    
    // Apply appropriate background based on weather and time
    if (isNightTime) {
        document.body.classList.add('weather-night');
    } else {
        switch (weatherCondition.toLowerCase()) {
            case 'sunny':
            case 'clear':
                document.body.classList.add('weather-sunny');
                break;
            case 'rainy':
            case 'rain':
            case 'drizzle':
                document.body.classList.add('weather-rainy');
                break;
            case 'cloudy':
            case 'partly-cloudy':
            case 'overcast':
                document.body.classList.add('weather-cloudy');
                break;
            case 'snowy':
            case 'snow':
                document.body.classList.add('weather-snowy');
                break;
            case 'thunderstorm':
            case 'storm':
                document.body.classList.add('weather-thunderstorm');
                break;
            default:
                // Default background (already set in CSS)
                break;
        }
    }
}

// Social Sharing Functions
function copyWeatherLink() {
    const currentUrl = window.location.href;
    const city = cityName.textContent;
    const temp = currentTemp.textContent;
    const description = weatherDescription.textContent;
    
    const shareText = `Check out the weather in ${city}: ${temp} - ${description}`;
    const shareUrl = `${currentUrl}?city=${encodeURIComponent(city)}&temp=${encodeURIComponent(temp)}&desc=${encodeURIComponent(description)}`;
    
    // Create a temporary textarea to copy the link
    const textarea = document.createElement('textarea');
    textarea.value = shareUrl;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess();
    } catch (err) {
        console.error('Failed to copy: ', err);
        // Fallback for modern browsers
        navigator.clipboard.writeText(shareUrl).then(() => {
            showCopySuccess();
        }).catch(() => {
            showCopyError();
        });
    }
    
    document.body.removeChild(textarea);
}

function shareOnTwitter() {
    const city = cityName.textContent;
    const temp = currentTemp.textContent;
    const description = weatherDescription.textContent;
    
    const shareText = `Check out the weather in ${city}: ${temp} - ${description}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

function shareOnFacebook() {
    const city = cityName.textContent;
    const temp = currentTemp.textContent;
    const description = weatherDescription.textContent;
    
    const shareText = `Check out the weather in ${city}: ${temp} - ${description}`;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`;
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

function shareOnWhatsApp() {
    const city = cityName.textContent;
    const temp = currentTemp.textContent;
    const description = weatherDescription.textContent;
    
    const shareText = `Check out the weather in ${city}: ${temp} - ${description}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + window.location.href)}`;
    
    window.open(shareUrl, '_blank');
}

function showCopySuccess() {
    const originalText = copyLinkBtn.innerHTML;
    copyLinkBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        Copied!
    `;
    copyLinkBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    
    setTimeout(() => {
        copyLinkBtn.innerHTML = originalText;
        copyLinkBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }, 2000);
}

function showCopyError() {
    const originalText = copyLinkBtn.innerHTML;
    copyLinkBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        Failed to copy
    `;
    copyLinkBtn.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
    
    setTimeout(() => {
        copyLinkBtn.innerHTML = originalText;
        copyLinkBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }, 2000);
}

// Map Management Functions
function initializeMap(lat, lon) {
    if (weatherMapInstance) {
        weatherMapInstance.remove();
    }

    currentMapCenter = { lat, lon };
    
    // Initialize Leaflet map
    weatherMapInstance = L.map('map').setView([lat, lon], 10);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(weatherMapInstance);
    
    // Add weather marker
    const weatherMarker = L.marker([lat, lon]).addTo(weatherMapInstance);
    weatherMarker.bindPopup(`
        <div style="text-align: center;">
            <strong>Weather Location</strong><br>
            ${lat.toFixed(4)}, ${lon.toFixed(4)}
        </div>
    `);
    
    // Show map section
    weatherMap.classList.remove('hidden');
    
    return weatherMapInstance;
}

function updateMapLocation(lat, lon) {
    if (weatherMapInstance && currentMapCenter) {
        weatherMapInstance.setView([lat, lon], 10);
        currentMapCenter = { lat, lon };
        
        // Update marker position
        weatherMapInstance.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                layer.setLatLng([lat, lon]);
            }
        });
    } else {
        initializeMap(lat, lon);
    }
}

function toggleWeatherLayers() {
    if (!weatherMapInstance) return;
    
    weatherLayersVisible = !weatherLayersVisible;
    
    if (weatherLayersVisible) {
        // Add temperature layer (mock - in real implementation, use OpenWeatherMap layers)
        addTemperatureLayer();
        mapLayersBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3z"></path>
                <path d="M9 9h6v6H9z"></path>
            </svg>
            Hide Layers
        `;
    } else {
        // Remove weather layers
        removeWeatherLayers();
        mapLayersBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3z"></path>
                <path d="M9 9h6v6H9z"></path>
            </svg>
            Weather Layers
        `;
    }
}

function addTemperatureLayer() {
    // Mock temperature layer - in real implementation, use actual weather API layers
    if (weatherMapInstance) {
        // Add a simple overlay to simulate weather data
        const bounds = weatherMapInstance.getBounds();
        const temperatureOverlay = L.rectangle(bounds, {
            color: '#ff6b6b',
            weight: 2,
            fillColor: '#ff6b6b',
            fillOpacity: 0.1
        }).addTo(weatherMapInstance);
        
        // Store reference for removal
        weatherMapInstance.temperatureLayer = temperatureOverlay;
    }
}

function removeWeatherLayers() {
    if (weatherMapInstance && weatherMapInstance.temperatureLayer) {
        weatherMapInstance.removeLayer(weatherMapInstance.temperatureLayer);
        weatherMapInstance.temperatureLayer = null;
    }
}

// Theme Management Functions
function updateThemeBasedOnTime(sunrise, sunset) {
    const now = new Date();
    const currentTime = now.getTime();
    
    // Convert sunrise/sunset to timestamps
    const sunriseTime = new Date(sunrise * 1000).getTime();
    const sunsetTime = new Date(sunset * 1000).getTime();
    
    // Check if it's day or night
    const isDay = currentTime >= sunriseTime && currentTime <= sunsetTime;
    
    if (isDay && currentTheme === 'dark') {
        setTheme('light');
    } else if (!isDay && currentTheme === 'light') {
        setTheme('dark');
    }
}

function setTheme(theme) {
    if (currentTheme === theme) return;
    
    currentTheme = theme;
    
    if (theme === 'dark') {
        document.body.classList.add('theme-dark');
        document.body.classList.remove('theme-light');
    } else {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
    }
}

function getThemeBasedOnWeather(weatherCondition, isNight = false) {
    if (isNight) {
        return 'dark';
    }
    
    // Light theme for most weather conditions during day
    return 'light';
}

// Animated Weather Icon Functions
function createAnimatedWeatherIcon(condition, isNight = false) {
    const iconContainer = document.createElement('div');
    iconContainer.className = 'weather-icon-animated';
    
    let iconHTML = '';
    let iconClass = '';
    
    switch (condition.toLowerCase()) {
        case 'sunny':
        case 'clear':
            iconClass = 'icon-sunny';
            iconHTML = `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="25" class="sun-rays"/>
                    <g class="sun-rays">
                        <line x1="50" y1="10" x2="50" y2="5" stroke-width="3"/>
                        <line x1="50" y1="95" x2="50" y2="90" stroke-width="3"/>
                        <line x1="10" y1="50" x2="5" y2="50" stroke-width="3"/>
                        <line x1="95" y1="50" x2="90" y2="50" stroke-width="3"/>
                        <line x1="20" y1="20" x2="16" y2="16" stroke-width="3"/>
                        <line x1="84" y1="84" x2="80" y2="80" stroke-width="3"/>
                        <line x1="20" y1="80" x2="16" y2="84" stroke-width="3"/>
                        <line x1="84" y1="16" x2="80" y2="20" stroke-width="3"/>
                    </g>
                </svg>
            `;
            break;
            
        case 'cloudy':
        case 'overcast':
            iconClass = 'icon-cloudy';
            iconHTML = `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <g class="cloud">
                        <ellipse cx="35" cy="40" rx="20" ry="15"/>
                        <ellipse cx="65" cy="40" rx="25" ry="18"/>
                        <ellipse cx="50" cy="60" rx="30" ry="20"/>
                    </g>
                </svg>
            `;
            break;
            
        case 'rainy':
        case 'rain':
            iconClass = 'icon-rainy';
            iconHTML = `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="50" cy="40" rx="30" ry="20"/>
                    <g class="rain-drops">
                        <line x1="30" y1="70" x2="25" y2="85" stroke-width="2"/>
                        <line x1="50" y1="70" x2="45" y2="85" stroke-width="2"/>
                        <line x1="70" y1="70" x2="65" y2="85" stroke-width="2"/>
                    </g>
                </svg>
            `;
            break;
            
        case 'snowy':
        case 'snow':
            iconClass = 'icon-snowy';
            iconHTML = `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="50" cy="40" rx="30" ry="20"/>
                    <g class="snowflakes">
                        <path d="M30 70 L35 75 L30 80 L25 75 Z" class="snowflakes"/>
                        <path d="M50 70 L55 75 L50 80 L45 75 Z" class="snowflakes"/>
                        <path d="M70 70 L75 75 L70 80 L65 75 Z" class="snowflakes"/>
                    </g>
                </svg>
            `;
            break;
            
        case 'thunderstorm':
        case 'storm':
            iconClass = 'icon-thunderstorm';
            iconHTML = `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="50" cy="40" rx="30" ry="20"/>
                    <path d="M40 60 L50 40 L60 60 L50 50 Z" class="lightning" fill="yellow"/>
                </svg>
            `;
            break;
            
        default:
            // Default to sunny for unknown conditions
            iconClass = 'icon-sunny';
            iconHTML = `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="25"/>
                </svg>
            `;
    }
    
    // Add night class if it's night time
    if (isNight) {
        iconClass += ' icon-night';
        // Add stars for night
        iconHTML += `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="position: absolute; top: 0; left: 0;">
                <g class="stars">
                    <circle cx="20" cy="20" r="1" fill="white"/>
                    <circle cx="80" cy="15" r="1" fill="white"/>
                    <circle cx="15" cy="80" r="1" fill="white"/>
                    <circle cx="85" cy="85" r="1" fill="white"/>
                </g>
            </svg>
        `;
    }
    
    iconContainer.className = `weather-icon-animated ${iconClass}`;
    iconContainer.innerHTML = iconHTML;
    
    return iconContainer;
}

function updateWeatherIcon(condition, isNight = false) {
    // Remove existing icon
    weatherIcon.innerHTML = '';
    
    // Create and add new animated icon
    const animatedIcon = createAnimatedWeatherIcon(condition, isNight);
    weatherIcon.appendChild(animatedIcon);
}

// Helper function to check if it's night time
function isNightTime(sunrise, sunset) {
    const now = new Date();
    const currentTime = now.getTime();
    const sunriseTime = new Date(sunrise * 1000).getTime();
    const sunsetTime = new Date(sunset * 1000).getTime();
    
    return currentTime < sunriseTime || currentTime > sunsetTime;
}

// ===== AUTHENTICATION FUNCTIONS =====

// Check authentication status on page load
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/check-auth', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            isAuthenticated = true;
            updateAuthUI();
            loadUserFavorites();
            loadUserSettings();
        } else {
            updateAuthUI();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        updateAuthUI();
    }
}

// Update authentication UI
function updateAuthUI() {
    if (isAuthenticated && currentUser) {
        authSection.classList.add('hidden');
        userSection.classList.remove('hidden');
        username.textContent = currentUser.username;
        favoritesSection.classList.remove('hidden');
        addToFavoritesBtn.classList.remove('hidden');
    } else {
        authSection.classList.remove('hidden');
        userSection.classList.add('hidden');
        favoritesSection.classList.add('hidden');
        addToFavoritesBtn.classList.add('hidden');
    }
}

// Show modal
function showModal(modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Hide modal
function hideModal(modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    // Clear form inputs
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => input.value = '');
}

// Switch between modals
function switchModal(hideModal, showModal) {
    hideModal(hideModal);
    showModal(showModal);
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            isAuthenticated = true;
            updateAuthUI();
            loadUserFavorites();
            loadUserSettings();
            hideModal(loginModal);
            showSuccessMessage('Login successful!');
        } else {
            showErrorMessage(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showErrorMessage('Network error. Please try again.');
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            isAuthenticated = true;
            updateAuthUI();
            loadUserFavorites();
            loadUserSettings();
            hideModal(signupModal);
            showSuccessMessage('Account created successfully!');
        } else {
            showErrorMessage(data.error || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showErrorMessage('Network error. Please try again.');
    }
}

// Handle logout
async function logout() {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        currentUser = null;
        isAuthenticated = false;
        updateAuthUI();
        clearFavorites();
        resetToDefaultSettings();
        showSuccessMessage('Logged out successfully');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Load user settings
async function loadUserSettings() {
    if (!isAuthenticated) return;
    
    try {
        const response = await fetch('/api/user', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.user.temperature_unit) {
                setTemperatureUnit(data.user.temperature_unit);
            }
        }
    } catch (error) {
        console.error('Error loading user settings:', error);
    }
}

// Save user settings
async function saveUserSettings() {
    if (!isAuthenticated) return;
    
    try {
        await fetch('/api/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                temperature_unit: currentUnit
            })
        });
    } catch (error) {
        console.error('Error saving user settings:', error);
    }
}

// ===== FAVORITES FUNCTIONS =====

// Load user favorites
async function loadUserFavorites() {
    if (!isAuthenticated) return;
    
    try {
        const response = await fetch('/api/favorites', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            displayFavorites(data.favorites);
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

// Display favorites
function displayFavorites(favorites) {
    if (!favorites || favorites.length === 0) {
        favoritesContainer.innerHTML = '';
        noFavorites.classList.remove('hidden');
        return;
    }
    
    noFavorites.classList.add('hidden');
    favoritesContainer.innerHTML = favorites.map(favorite => `
        <div class="favorite-city" data-city="${favorite.city_name}">
            <div class="favorite-city-name">${favorite.city_name}</div>
            <div class="favorite-city-date">Added ${new Date(favorite.added_at).toLocaleDateString()}</div>
            <button class="remove-favorite" onclick="removeFavorite(${favorite.id})">Remove</button>
        </div>
    `).join('');
    
    // Add click event to favorite cities
    const favoriteCities = favoritesContainer.querySelectorAll('.favorite-city');
    favoriteCities.forEach(city => {
        city.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-favorite')) {
                cityInput.value = city.dataset.city;
                handleSearch();
            }
        });
    });
}

// Add current city to favorites
async function addCurrentCityToFavorites() {
    if (!isAuthenticated || !currentWeatherData) return;
    
    const cityName = currentWeatherData.city;
    const lat = currentWeatherData.lat;
    const lon = currentWeatherData.lon;
    
    try {
        const response = await fetch('/api/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                city_name: cityName,
                latitude: lat,
                longitude: lon
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            addToFavoritesBtn.classList.add('added');
            addToFavoritesBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            `;
            showSuccessMessage('City added to favorites!');
            loadUserFavorites();
        } else {
            const data = await response.json();
            showErrorMessage(data.error || 'Failed to add city to favorites');
        }
    } catch (error) {
        console.error('Error adding to favorites:', error);
        showErrorMessage('Network error. Please try again.');
    }
}

// Remove favorite
async function removeFavorite(favoriteId) {
    try {
        const response = await fetch(`/api/favorites/${favoriteId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            showSuccessMessage('City removed from favorites');
            loadUserFavorites();
        } else {
            showErrorMessage('Failed to remove city from favorites');
        }
    } catch (error) {
        console.error('Error removing favorite:', error);
        showErrorMessage('Network error. Please try again.');
    }
}

// Clear favorites display
function clearFavorites() {
    favoritesContainer.innerHTML = '';
    noFavorites.classList.remove('hidden');
}

// Reset to default settings
function resetToDefaultSettings() {
    setTemperatureUnit('celsius');
}

// ===== UTILITY FUNCTIONS =====

// Show success message
function showSuccessMessage(message) {
    // You can implement a toast notification here
    console.log('Success:', message);
}

// Show error message
function showErrorMessage(message) {
    showError(message);
}

// Initialize authentication on page load
window.addEventListener('load', () => {
    cityInput.focus();
    checkAuthStatus();
    // Attempt to get location on page load if not already detected
    if (!isLocationDetected) {
        getCurrentLocation();
    }
});
