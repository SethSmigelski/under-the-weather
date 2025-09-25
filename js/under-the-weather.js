// Validate Coordinates
function validateCoordinates(lat, lon) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    return (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180);
}

// Validate data
function validateWeatherData(data) {
    return data && 
           data.current && 
           data.daily && 
           Array.isArray(data.daily) && 
           data.daily.length > 0;
}

// Convert a DMS (Degrees, Minutes, Seconds) coordinate, or a DDM string to the desired Decimal Degrees (DD) format.
// This frontend parsing serves as a helpful handler to catch malformed coordinates when possible.
// Decimal Degrees coordinates should be used at all time (e.g., 34.1195, -118.3005).
// The quotation marks included in DMS coordinates will break the HTML structure of the weather widget. 
// DMS coordinates (e.g., 34°07'10.2"N 118°18'01.8"W) should therefore be avoided.
function parseCoordinate(coordString) {
    if (!coordString || typeof coordString !== 'string') {
        return null;
    }

    // 1. Clean the input
    let str = coordString.trim();
    if (str.endsWith(',')) {
        str = str.slice(0, -1).trim();
    }

    // 2. Try to parse as DDM (Degrees Decimal Minutes)
    const ddmRegex = /([0-9]{1,3})[°\s]+([0-9]+(?:\.[0-9]+)?)['\s]+([NSEW])/i;
    let parts = str.match(ddmRegex);
    if (parts) {
        const degrees = parseFloat(parts[1]);
        const minutes = parseFloat(parts[2]);
        const hemisphere = parts[3].toUpperCase();
        if (isNaN(degrees) || isNaN(minutes)) return null;

        let decimal = degrees + (minutes / 60);
        if (hemisphere === 'S' || hemisphere === 'W') decimal = -decimal;
        return parseFloat(decimal.toFixed(4));
    }

    // 3. Try to parse as DMS (Degrees, Minutes, Seconds)
    const dmsRegex = /([0-9]{1,3})[°\s]+([0-9]{1,2})['\s]+([0-9]{1,2}(?:\.[0-9]+)?)["\s]+([NSEW])/i;
    parts = str.match(dmsRegex);
    if (parts) {
        const degrees = parseFloat(parts[1]);
        const minutes = parseFloat(parts[2]);
        const seconds = parseFloat(parts[3]);
        const hemisphere = parts[4].toUpperCase();
        if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) return null;
        
        let decimal = degrees + (minutes / 60) + (seconds / 3600);
        if (hemisphere === 'S' || hemisphere === 'W') decimal = -decimal;
        return parseFloat(decimal.toFixed(4));
    }

    // 4. Try to parse as simple Decimal Degrees
    const dd = parseFloat(str);
    if (!isNaN(dd)) {
        return dd;
    }

    // 5. If all formats fail
    return null;
}

document.addEventListener('DOMContentLoaded', function() {
	const widget = document.querySelector('.weather-widget');
	if (!widget) {
    	return;
  	}
	
	const locationName = widget.dataset.locationName;
	const unit = widget.dataset.unit ? widget.dataset.unit.toLowerCase() : 'imperial';
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  	// Get the lat/lon from the data attributes
  	let lat = widget.dataset.lat;
  	let lon = widget.dataset.lon;
	
	// Attempt to parse/convert them (this handles DD, DDM, and DMS formats)
	const parsedLat = parseCoordinate(lat);
	const parsedLon = parseCoordinate(lon);
	
	// Use parsed values if conversion was successful, otherwise keep original
	if (parsedLat !== null) {
	    lat = parsedLat;
	}
	if (parsedLon !== null) {
	    lon = parsedLon;
	}
	
	// Now use the clean 'lat' and 'lon' values for validation and API call
	if (!lat || !lon || !locationName) {
	    widget.innerHTML = 'Location data is missing.';
	    return;
	}
	
	if (!validateCoordinates(lat, lon)) {
	    widget.innerHTML = 'Invalid location coordinates.';
	    return;
	}

	widget.innerHTML = '<div class="weather-loading">Loading weather data...</div>';

  	const apiUrl = `/wp-json/under-the-weather/v1/forecast?lat=${lat}&lon=${lon}&location_name=${encodeURIComponent(locationName)}&unit=${unit}`;

  	fetch(apiUrl, {
    	signal: controller.signal,
    	headers: {
        	'X-WP-Nonce': under_the_weather_settings.nonce
    	}
  	})
    .then(response => {
	  clearTimeout(timeoutId);
      if (!response.ok) {
        response.text().then(text => {
            console.error('Error fetching weather data:', text);
            widget.innerHTML = `<p>Could not retrieve forecast. Server error.</p>`;
        });
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
	    if (!validateWeatherData(data)) {
			throw new Error('The weather data structure is invalid');
		}
      displayWeather(data, widget);
    })
    .catch(error => {
      console.error('Network Error:', error);
	  widget.innerHTML = `<p>Unable to load weather data. Please try again later.</p>`;
    });
});

function displayWeather(data, widget) {
    const { style_set, display_mode, forecast_days, show_details, show_timestamp, show_unit } = under_the_weather_settings;
    const locationName = widget.dataset.locationName || '';
    
    const tempSymbol = '°';
    const unitLetter = data.units === 'metric' ? 'C' : 'F';
    const windUnit = data.units === 'metric' ? 'kph' : 'mph';
    const displayUnitString = show_unit ? `<span class="temp-unit">${unitLetter}</span>` : '';

    function getIconHtml(weather) {
        if (style_set === 'weather_icons_font') {
            return `<i class="wi ${weather.icon_class}"></i>`;
        } else {
    // Pass the base URL of the plugin to the script using wp_localize_script in the main PHP file.
return `<img src="${under_the_weather_plugin_url.url}images/default-weather-images-${weather.icon}.png" alt="${weather.description}">`;
        }
    }
    
    function getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }
    
    function getWindIconClass(degrees) {
        return `wi wi-wind from-${Math.round(degrees)}-deg`;
    }

    function timeAgo(timestamp) {
        const now = new Date().getTime() / 1000;
        const seconds = Math.floor(now - timestamp);
        if (seconds < 60) return "just now";
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "a minute ago";
    }

    let primaryDisplayHtml = '';
    if (display_mode === 'today_forecast') {
        const today = data.daily[0];
        const highTemp = Math.round(today.temp.max);
        const lowTemp = Math.round(today.temp.min);
        
        primaryDisplayHtml = `
            <div class="current-weather">
                <div class="today-forecast-temps">
                    <div class="today-forecast-label">Today</div>
                    <div class="temps-wrapper">
                      <span class="high">${highTemp}${tempSymbol}</span> / <span class="low">${lowTemp}${tempSymbol}</span>${displayUnitString}
                    </div>
                </div>
                <div class="current-conditions">
                    ${getIconHtml(today.weather[0])}
                    <span>${today.weather[0].description}</span>
                </div>
            </div>
        `;
    } else {
        const current = data.current;
        const currentTemp = Math.round(current.temp);

        primaryDisplayHtml = `
            <div class="current-weather">
                <div class="current-temp">${currentTemp}${tempSymbol}${displayUnitString}</div>
                <div class="current-conditions">
                    ${getIconHtml(current.weather[0])}
                    <span>${current.weather[0].description}</span>
                </div>
            </div>
        `;
    }

    let extraDetailsHtml = '';
    if (show_details) {
        const feelsLike = Math.round(data.current.feels_like);
        const windSpeed = Math.round(data.current.wind_speed);
        const windDirection = getWindDirection(data.current.wind_deg);
        const windIconClass = getWindIconClass(data.current.wind_deg);

        extraDetailsHtml = `
            <div class="weather-extra-details">
                <span>Feels like: ${feelsLike}${tempSymbol}${displayUnitString}</span>
                <span class="wind-details">
                    <i class="${windIconClass}"></i> ${windDirection} ${windSpeed} ${windUnit}
                </span>
            </div>
        `;
    }

    const forecastDaysToShow = parseInt(forecast_days, 10) || 5;
    const dailyForecasts = data.daily.slice(1, 1 + forecastDaysToShow);
    let forecastHtml = '';

    dailyForecasts.forEach(day => {
        const dayName = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        const highTemp = Math.round(day.temp.max);
        const lowTemp = Math.round(day.temp.min);

        forecastHtml += `
          <div class="forecast-day">
            <div class="forecast-day-name">${dayName}</div>
            ${getIconHtml(day.weather[0])}
            <div class="forecast-temps">
              <span class="high">${highTemp}${tempSymbol}</span> / <span class="low">${lowTemp}${tempSymbol}</span>
            </div>
          </div>
        `;
    });

    let timestampHtml = '';
    if (show_timestamp && data.fetched_at) {
        timestampHtml = `<div class="last-updated">Updated ${timeAgo(data.fetched_at)}</div>`;
    }

    const finalHtml = `
        <div class="weather-location-name">${locationName}</div>
        ${primaryDisplayHtml}
        ${extraDetailsHtml}
        <div class="forecast-container">
            ${forecastHtml}
        </div>
        ${timestampHtml}
    `;
    widget.innerHTML = finalHtml;
}
