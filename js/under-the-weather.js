// Check webpage for Weather Widgets and load widget data. 
document.addEventListener('DOMContentLoaded', function() {
    // 1. Find ALL weather widgets on the page
    const weatherWidgets = document.querySelectorAll('.weather-widget');

    // 2. If no widgets are found, do nothing.
    if (weatherWidgets.length === 0) {
        return;
    }

    // 3. Loop through each widget and load its data
    weatherWidgets.forEach(widget => {
        loadWeatherData(widget);
    });
});

/**
 * Fetches and displays weather data for a single widget element.
 * @param {HTMLElement} widget The widget's div element.
 */
function loadWeatherData(widget) {
	const locationName = widget.dataset.locationName;
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
	
	const unit = widget.dataset.unit ? widget.dataset.unit.toLowerCase() : 'imperial';
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
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
}

// Validate Coordinates
function validateCoordinates(lat, lon) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    return (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180);
}

// Validate Weather Data
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

/**
 * Selects a weather icon based on the alert event text.
 * @param {string} eventText The text of the weather alert (e.g., "Tornado Warning").
 * @returns {string} The corresponding Weather Icons class name.
 */
function getAlertIconClass(eventText) {
    const text = eventText.toLowerCase();

    // Catastrophic Events
    if (text.includes('tornado')) return 'wi-tornado';
    if (text.includes('hurricane')) return 'wi-hurricane-warning';
    if (text.includes('tsunami')) return 'wi-tsunami';
    if (text.includes('earthquake')) return 'wi-earthquake';

    // Storms & Precipitation
    if (text.includes('thunderstorm') || text.includes('lightning')) return 'wi-thunderstorm';
    if (text.includes('gale')) return 'wi-gale-warning';
    if (text.includes('hail')) return 'wi-hail';
    if (text.includes('rain') || text.includes('showers') || text.includes('drizzle')) return 'wi-rain';
    if (text.includes('flood')) return 'wi-flood';

    // Winter Weather
    if (text.includes('winter') || text.includes('snow') || text.includes('blizzard')) return 'wi-snow';
    if (text.includes('ice') || text.includes('frost') || text.includes('freeze') || text.includes('cold') || text.includes('chill')) return 'wi-snowflake-cold';
    
    // Temperature & Wind
    if (text.includes('heat') || text.includes('hot')) return 'wi-hot';
    if (text.includes('wind')) return 'wi-strong-wind';
    
    // Atmospheric & Air Quality
    if (text.includes('fog')) return 'wi-fog';
    if (text.includes('fire')) return 'wi-fire';
    if (text.includes('smoke')) return 'wi-smoke';
    if (text.includes('smog') || text.includes('air quality')) return 'wi-smog';
    if (text.includes('dust')) return 'wi-dust';
    if (text.includes('sandstorm') || text.includes('sand')) return 'wi-sandstorm';
	
    // A good fallback for any other severe weather
    return 'wi-storm-warning'; 
}

function displayWeather(data, widget) {
    const { style_set, display_mode, forecast_days, show_details, show_unit, show_alerts, show_timestamp, sunrise_sunset_format } = under_the_weather_settings;
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
	
	// START: New Sunrise/Sunset Logic
    let sunriseSunsetHtml = '';
    // Check if the setting is enabled and the data exists
    if (sunrise_sunset_format !== 'off' && data.current.sunrise && data.current.sunset) {
        
        // Define formatting options based on the setting
        const timeOptions = {
            timeZone: data.timezone,
            hour: 'numeric',
            minute: '2-digit',
            hour12: sunrise_sunset_format === '12' // Use 12-hour format if setting is '12'
        };

        // Convert timestamps to readable times
        const sunriseTime = new Date(data.current.sunrise * 1000).toLocaleTimeString('en-US', timeOptions);
        const sunsetTime = new Date(data.current.sunset * 1000).toLocaleTimeString('en-US', timeOptions);

        // Get icons based on the style set
        let sunriseIcon = '';
        let sunsetIcon = '';
        if (style_set === 'weather_icons_font') {
            sunriseIcon = '<i class="wi wi-sunrise"></i>';
            sunsetIcon = '<i class="wi wi-sunset"></i>';
        } else {
            // Using generic day/night icons as a fallback for the default image set
            const sunriseImgUrl = `${under_the_weather_plugin_url.url}images/seths--weather-images-sunrise.png`;
            const sunsetImgUrl = `${under_the_weather_plugin_url.url}images/seths--weather-images-sunset.png`;
            sunriseIcon = `<img src="${sunriseImgUrl}" class="sunrise-sunset-icon" alt="Sunrise Time">`;
            sunsetIcon = `<img src="${sunsetImgUrl}" class="sunrise-sunset-icon" alt="Sunset Time">`;
        }
        
        sunriseSunsetHtml = `
            <div class="sunrise-sunset-container">
                <div class="sunrise-time">
                    ${sunriseIcon}
                    <div class="sunrise-sunset-label">Sunrise</div>
                    <div class="sunrise-sunset-value">${sunriseTime}</div>
                </div>
                <div class="sunset-time">
                    ${sunsetIcon}
                    <div class="sunrise-sunset-label">Sunset</div>
                    <div class="sunrise-sunset-value">${sunsetTime}</div>
                </div>
            </div>
        `;
    }
    // END: New Sunrise/Sunset Logic

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
                      <span class="high">${highTemp}${tempSymbol}</span><span class="slash"> / </span><span class="low">${lowTemp}${tempSymbol}</span>${displayUnitString}
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
	
	let alertHtml = '';
    if (show_alerts && data.alerts && data.alerts.length > 0) {
        data.alerts.forEach(alert => {
			
			// Handle custom alert icons
			let iconHtml = '';// This will hold the icon's HTML
			if (style_set === 'weather_icons_font') {
				// Use the dynamic font icon logic
				const iconClass = getAlertIconClass(alert.event);
				iconHtml = `<i class="wi ${iconClass}"></i>`;
			} else {
				// Use the new PNG fallback icon
				const imageUrl = `${under_the_weather_plugin_url.url}images/seths--weather-images-warning.png`;
				iconHtml = `<img src="${imageUrl}" class="weather-alert-icon" alt="Weather Alert">`;
			}
			
            alertHtml += `
				<div class="weather-alert">
					<div class="weather-alert-icon-left">
						${iconHtml}
					</div>
					<div class="weather-alert-message">
						<div class="weather-alert-event">${alert.event}</div>
						<div class="weather-alert-sender">Issued by: ${alert.sender_name}</div>
					</div>
				</div>
            `;
        });
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
              <span class="high">${highTemp}${tempSymbol}</span><span class="slash"> / </span><span class="low">${lowTemp}${tempSymbol}</span>
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
        ${alertHtml}
		${primaryDisplayHtml}
        ${extraDetailsHtml}
		${sunriseSunsetHtml}
        <div class="forecast-container">
            ${forecastHtml}
        </div>
        ${timestampHtml}
    `;
    widget.innerHTML = finalHtml;
}
