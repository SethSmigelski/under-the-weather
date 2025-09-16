document.addEventListener('DOMContentLoaded', function() {

  const widget = document.querySelector('.weather-widget');
  if (!widget) {
    return;
  }

  const lat = widget.dataset.lat;
  const lon = widget.dataset.lon;
  const locationName = widget.dataset.locationName;
  const unit = widget.dataset.unit ? widget.dataset.unit.toLowerCase() : 'imperial';

  if (!lat || !lon || !locationName) {
    widget.innerHTML = 'Location data is missing.';
    return;
  }

  const apiUrl = `/wp-json/under-the-weather/v1/forecast?lat=${lat}&lon=${lon}&location_name=${encodeURIComponent(locationName)}&unit=${unit}`;

  fetch(apiUrl)
    .then(response => {
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
      displayWeather(data, widget);
    })
    .catch(error => {
      console.error('Network Error:', error);
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
            // You'll need to pass the base URL of your plugin to your script
// using wp_localize_script in your main PHP file.
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