# Under The Weather
A WordPress plugin to create lightweight and customizable weather widgets, powered by the OpenWeather API, that cache and present weather data with multiple style options

![Under The Weather WordPress Plugin Icon](https://ps.w.org/under-the-weather/assets/icon-256x256.png)

* **Contributors:** sethsm
* **Tags:** weather, openweather, forecast, cache, block
* **Requires at least:** 5.0
* **Tested up to:** 6.8
* **Stable tag:** 2.3
* **Requires PHP:** 7.2
* **License:** GPLv2 or later
* **License URI:** https://www.gnu.org/licenses/gpl-2.0.html
* **Donate link:** https://www.paypal.com/donate/?hosted_button_id=M3B2Q94PGVVWL
* **Plugin URI:**  https://www.sethcreates.com/plugins-for-wordpress/under-the-weather/
* **Author URI:**  https://www.sethcreates.com/plugins-for-wordpress/

---

## Description

Under The Weather is a powerful yet simple plugin designed to display location-specific weather forecasts on your WordPress site. Featuring a dedicated "Under The Weather Forecast" block to add and customize weather widgets directly in the WordPress editor for a seamless workflow.

With performance in mind, Under The Weather uses a server-side caching system (WordPress Transients) to minimize API calls and ensure your site remains fast. Under The Weather is completely "vanilla" on the front-end, meaning it does not rely on jQuery or any other JavaScript frameworks. Built with modern security practices, including input validation, CSRF protection, and optional rate limiting to protect your site and API quota.

This plugin is ideal for travel blogs, outdoor activity sites, or any website that needs to display weather conditions for specific locations without the bloat of heavy, multi-dependency plugins.

### Key Features:
* **Stylish Weather Widgets:** Choose between default OpenWeather images, crisp Weather Icons font set, and two Animated SVG icon sets (Fill and Outline).
* **Easy to Use:** Add weather widgets using the WordPress block editor or by placing a simple `<div>` with data attributes anywhere on your site.
* **Server-Side Caching:** All API calls are cached on your server, dramatically reducing calls to the OpenWeather API and speeding up page loads for all users.
* **Visual Performance Report:** Monitor your site's API usage with a bar chart that displays a 7-day history of cached requests versus new calls to the OpenWeather API - a clear look at how the caching system is working to keep your site fast and your API calls low.
* **Customizable Display:** Use the main display to show either the current live weather or the high/low forecast for the current day, and set the number of days to include in the forecast ahead.
* **Imperial & Metric Units:** Display weather in Fahrenheit/mph or Celsius/kph on a per-widget basis.
* **Extra Details:** Optionally display "Feels Like" temperature and detailed wind information.
* **Weather Alerts:** Display official severe weather alerts directly in the widget to keep visitors informed. 
* **Sunrise & Sunset Times:** Optionally show daily sunrise and sunset times, with 12-hour and 24-hour format options.
* * **Color Picker:**  Customize the color of the "Weather Icons Font" set directly from the settings page.
* **Lightweight:** Enqueues assets only when needed and does not rely on heavy JavaScript libraries.
* **Settings Page Coordinate Finder:** An easy-to-use tool on the settings page retrieves coordinates by location name and generates ready-to-use widget `<div>` code.
* **Block Editor Coordinate Finder:** Search for locations by name and automatically fill in coordinates without ever leaving the block editor.
  
---

![Under The Weather WordPress Plugin Banner](https://ps.w.org/under-the-weather/assets/banner-1544x500.png)

## Installation

### From the WordPress Plugin Directory File
1.  Log in to your WordPress Admin Dashboard.
2.  Navigate to **Plugins > Add Plugin** in the left-hand menu.
3.  Search for the plugin: **Under The Weather**.
4.  Install the plugin: Once you locate the [correct plugin](https://wordpress.org/plugins/under-the-weather/), click the **"Install Now"** button next to it.
5.  Activate the plugin: After the installation is complete, click the **"Activate Plugin"** button that appears.

### From a Zip File
1.  Download a copy of the plugin, available in the WordPress Plugin Directory [Under The Weather](https://wordpress.org/plugins/under-the-weather/) webpage. 
2.  Upload the **under-the-weather** folder to the `/wp-content/plugins/` directory 
3.  Activate the plugin through the **Plugins** menu in WordPress.
4.  Navigate to **Settings > Under The Weather** to configure the plugin. You must enter a valid OpenWeather API key for the plugin to function.  The plugin is designed to work with the One Call API 3.0. by OpenWeather.

---

![WordPress Under The Weather Forecast block.](https://ps.w.org/under-the-weather/assets/screenshot-7.png)

_The "Under The Weather Forecast" block in the WordPress editor._

---

## Usage

The Under The Weather plugin offers two ways to add a weather forecast: using the block editor or manually placing a `<div>`.

### Using the Block Editor (Recommended)

1.  Open the post or page where you want to display the weather.
2.  Click the block inserter icon (+) to add a new block.
3.  Search for "Under The Weather Forecast" and add the block.
4. Configure your location using either:
   - Manual entry of coordinates in the block settings sidebar
   - The built-in coordinate finder that searches by location name and fills in the coordinates for you
5. Choose your preferred units (Imperial/Fahrenheit or Metric/Celsius)
6. Publish or update your post - the weather will display automatically!

### Manual Placement (Classic Editor & Themes)
To display the weather widget on a post, page, or in a template file, add a simple `<div>` element with the class `weather-widget` and the required data attributes.

* `data-lat`: The latitude for the forecast.
* `data-lon`: The longitude for the forecast.
* `data-location-name`: The city or location name you want to display as the title of the widget. (Beyond its display purpose, the 'data-location-name' is also used to create the shared cache key).
* `data-unit` (optional): The unit system for temperature and wind speed. Accepts `metric` or `imperial`. The default unit is `imperial` if not provided.

**Examples:**

```html
<div class="weather-widget" 
     data-lat="34.1186" 
     data-lon="-118.3004" 
     data-location-name="Los Angeles, California">
</div>
```

To show the weather for a location in Celsius, you would add `data-unit="metric"`:

```html
<div class="weather-widget" 
     data-lat="48.8566" 
     data-lon="2.3522" 
     data-location-name="Paris, France"
     data-unit="metric">
</div>
```

The plugin's JavaScript will automatically find this element and populate it with the forecast.

### Using the Shortcode (Classic Editor & Widgets)

You can also display the weather by using the `[under_the_weather]` shortcode. This is ideal for the Classic Editor, text widgets, or other page builders.

**Available attributes:**
* `lat`: (Required) The latitude for the forecast.
* `lon`: (Required) The longitude for the forecast.
* `location_name`: (Required) The name to display for the location.
* `unit`: (Optional) The unit system. Accepts `metric` or `imperial`. Defaults to `imperial`.

**Example:**
`[under_the_weather lat="48.8566" lon="2.3522" location_name="Paris, France" unit="metric"]`

---

## Configuration

Before you begin, go to https://home.openweathermap.org/ and sign up for an API key and register for the One Call API 3.0 subscription. Paste your API key into the Under the Weather Settings Page.

**API & Cache**

**Cache Expiration Time:** 
Use the slider to set the maximum time weather data is stored before fetching a new forecast, from 30 minutes to 8 hours. 

The plugin also features a **smart caching** system that automatically ensures the cache expires after midnight in the location's local timezone. This prevents showing a stale forecast from the previous day, regardless of your slider setting.

For displaying live conditions (using the **Primary Display** or **Extra Details** options), a shorter cache time of 1 or 2 hours is recommended.
For displaying only the daily high/low, a longer cache time of 3 or 8 hours is effective at reducing API calls.

**Widget Display & Style**

**Icon & Style Set:** 
Pick the style that suits you best. Choose between four weather icon options:  
* Recognizable **Default images** (PNGs) provided by OpenWeather.
* Sharp, modern **Weather Icons fonts** created by Erik Flowers.
* Two **Animated SVG** icon sets (Fill and Outline) by Bas Milius.
Note: Selecting the icon font will load an additional small CSS file.

**Icon Font Color:**
Use the color picker to customize the color of the "Weather Icons Font" set to perfectly match your theme. This setting only has a visible effect when the "Weather Icons Font" style is selected (it does not impact PNGs or SVGs). If left at the default, the icons will use the gray color specified in the plugin's stylesheet.

**Primary Display:** 
Select whether the main display of the widget shows the **Current** live temperature or **Today's Forecast** (the high and low for the day).

**Number of Forecast Days:** 
Adjust the number of days shown in the extended forecast row, from 2 to 6 days.

**Extra Details:**
Selecting this option will **display 'Feels Like' and wind** (direction and speed) information beneath the primary display. This setting adds nuance to the current weather conditions display.

**Sunrise & Sunset:** This setting allows you to display the local sunrise and sunset times for the location, which is useful for planning outdoor activities.  Choose to show the times in a 12-hour (e.g., 6:30 AM) or 24-hour (e.g., 18:30) format.

**Weather Alerts:** When enabled, the widget will display any active severe weather alerts (e.g., thunderstorm warnings, flood advisories) issued by official authorities for the specified location.  This provides critical, at-a-glance information for your visitors.

**Display Timestamp:**
Indicates the time elapsed since the weather data was last updated from the source. This option helps readers see how recently the weather widget obtained its information. 

**Display Unit Symbol:**
Adds the unit symbol (F or C) next to the main temperature. This option allows you to select whether or not the widget should include the temperature unit symbol in the primary temperature display.

**Advanced Settings**
**Enable Cache:**  You can uncheck this box, if you would like to use this plugin without the benefit of the caching function. 

**Enable Rate Limiting:** Check this box to protect your site against excessive API requests from a single IP address. You can set the maximum number of requests per hour (default is 100). This helps prevent malicious traffic from exhausting your API quota.

**Asset Loading:** For the plugin to function correctly, the **Load Plugin CSS** and **Load Plugin JavaScript** boxes should normally remain checked. However, you can uncheck them if you prefer to include the plugin's CSS and JS files as part of your theme's own optimized assets.

If you uncheck **Load Plugin JavaScript**, you can load the Under The Weather scripts manually on select pages by adding the following template tag to your theme files (e.g., footer.php):

```php
<?php
if ( function_exists( 'under_the_weather_load_scripts_manually' ) ) {
   under_the_weather_load_scripts_manually(); 
} 
?>
```

For most users, simply leaving these boxes checked is the best way to use the weather widget.

---

![The plugin's comprehensive settings page](https://ps.w.org/under-the-weather/assets/screenshot-5.png)

_The plugin's comprehensive settings page._

---

## Coordinate Finder

Don't know the latitude and longitude for your desired location? No problem. The Under The Weather plugin will find coordinates for you.

### In the WordPress Block Editor

1. Add an **"Under The Weather Forecast"** block to your post or page. 
2. Open the Block Settings
3. Click the **"Find Coordinates by Name"** button.
4. Type in the name of your location.
5. Press **"Search."**
6. When search results appear, click on your desired location.
7. The location's coordinates will be automatically entered into the latitude and longitude settings for the weather forecast.

### In the Plugin Settings Page

1. Navigate to **Settings > Under The Weather** and click on the **Coordinate Finder** tab.
2. Type a location name into the search box (e.g., "Los Angeles, CA").
3. Click the **"Find Coordinates"** button.
4. The tool will display the generated `<div>` with the correct coordinates and location name.
5. Use the **"Copy Code"** button to copy the ready-to-use widget HTML and paste it into a post, page, or widget.

The tool automatically saves a history of your last 5 searches, which persists between sessions. You can easily copy code from previous searches without having to look them up again.

---

![The Coordinate Finder tool, which generates widget code from a location name.](https://ps.w.org/under-the-weather/assets/screenshot-6.png)

_The Coordinate Finder tool, which generates widget code from a location name._

---

## Performance Report

The Under The Weather plugin includes a powerful Performance Report tab in the settings page (**Settings > Under The Weather > Performance Report**) to give you clear insight into the plugin's efficiency and API usage. The main feature is a 7-day bar chart that provides a visual comparison of **cached hits versus new calls to the OpenWeather API**. 

The performance report demonstrates how the caching system is working to reduce external requests and keep your site fast. Use this report to fine-tune your **Cache Expiration Time** and observe the impact on your API call rate. 

The report also includes a status indicator that shows whether the optional **Rate Limiting** feature is currently active. If rate limiting is enabled and requests are being blocked, the raw data table at the bottom of the report will log these events. This can help you identify unusual traffic patterns or potential misuse of your API key.

---

![The Under The Weather Performance Report depicting seven days of information on cached hits vs calls to the OpenWeather API](https://ps.w.org/under-the-weather/assets/screenshot-4.png)

_The Under The Weather Performance Report depicting seven days of information on cached hits vs calls to the OpenWeather API._

---

## Frequently Asked Questions

### What API key do I need?
This plugin works with the **OpenWeather One Call API 3.0**. You can get a free API key by signing up on the OpenWeather website. Make sure you have subscribed to the One Call API on your account's API page.

###  How can I monitor how many OpenWeather API calls the plugin is making?

Click on the "Performance Report" tab of the Under The Weather Settings Page to see a graph and data log for the last 7 days of plugin performance. The Performance Report shows the last seven days of information about the requests made by the weather widget. The report displays a comparison of the cached hits and calls to the OpenWeather API. 

Seeing how the plugin's cache system reduces the number of API calls demonstrates its effectiveness. Use the Performance Report to examine how modifying the cache expiration time affects the rate of cached requests.

###  Do I need to use the plugin's caching function?

No. To retrieve fresh weather data every time a widget page loads, you can uncheck "Enable Cache" under the plugin's advanced settings. The caching system provides a great benefit for reducing API hits, but turning off this function during your initial widget setup may be useful.

### Will my website ever show yesterday's weather If I set a long cache time?

Cinderella's magic disappears at midnight, and weather caches expire at midnight too. Visitors should never see a cache of the previous day's forecast. 

For example, if you set the cache expiration time to 8 hours and a weather cache is created at 10 p.m. on a Friday (using the weather location's time), that cache will expire at midnight, and someone visiting the site the next day at 5 a.m. will not see the previous day's cache even though fewer than 8 hours have passed.

The plugin uses whichever expiration time is **shorter** to provide the most effective caching.  You control the maximum cache duration with the "Cache Expiration Time" slider. However, to ensure your visitors never see yesterday's weather, the plugin also calculates the time until midnight in the widget's local timezone. If the time until midnight is shorter than your slider setting, the cache will expire at midnight.

### The weather isn't updating. Why?

The plugin caches the weather data on your server to improve performance and reduce API calls. The data will only be fetched again after the "Cache Expiration Time" you set on the settings page has passed. If you need to force an immediate update, go to **Settings > Under The Weather** and click the "Clear All Weather Caches" button.

### I made changes to my settings. Why isn't the widget updating?

The weather widget is probably displaying a cached forecast. Since waiting around is no fun, the Under The Weather Settings has a "Clear Weather Cache" option at the bottom. If you press the "Clear All Weather Caches & Stats" button, it will force an immediate update of all weather forecasts. This will also clear the performance report data.  

If you're feeling patient, just wait for the weather widget to update after the current cache has expired.

### Does the Weather Widget work in Fahrenheit or Celsius?

Both. By default, the weather widget will show a forecast in Fahrenheit. If you prefer to see the forecast in Celsius, set data-unit="metric" within the weather-widget div (see configuration instructions). Additionally, checking the box for "Display Unit Symbol" on the Under The Weather Settings page instructs the weather widget to display the temperature unit symbol (F or C) in the primary temperature display.

### What if I don't know the latitude and longitude for a weather location?

The plugin offers two methods for looking up coordinates using its built-in **Coordinate Finder** tool: 
* **In the Settings Page:** Navigate to **Settings > Under The Weather** and click the **Coordinate Finder** tab. Simply type in a location name, and the tool will look up the coordinates and provide you with the exact `<div>` code to copy and paste.
* **In the Editor:** While using the **Under The Weather Forecast** block, click on the **Find Coordinates By Name** button. The coordinates for your chosen location will be filled in for you automatically.

### How do I use the weather block?

In the WordPress block editor, simply search for "Under The Weather Forecast" when adding a new block. The block includes a built-in coordinate finder, so you can search for locations by name rather than manually entering latitude and longitude. Configure your preferences in the block settings sidebar, and the weather will appear automatically on your published page.

### Can I still use the manual div method if I prefer it?

Absolutely! While the **block** is the recommended, user-friendly method for the modern WordPress editor, the plugin fully supports traditional methods for maximum flexibility.

You can use the `[under_the_weather]` shortcode to easily place the widget in the Classic Editor, text widgets, or with various page builders. 

Additionally, the manual `<div>` method still works perfectly. It is particularly useful for theme developers who need to integrate the widget directly into template files or dynamically populate its data from custom fields.

The traditional method of adding `<div class="weather-widget">` with data attributes still works perfectly and is particularly useful for theme developers and sites that dynamically populate widget attributes from post meta or custom fields.

### What coordinate format should I use?

The recommended and most reliable format for coordinates is **Decimal Degrees (DD)**, for example: `34.1195`, `-118.3005`.

However, the **Under The Weather Forecast block** is designed to be user-friendly. If you enter coordinates in other common formats like **DMS** (e.g., `34°07'10.2"N`) or **DDM** (e.g., `34° 7.17' N`), the block will automatically convert them to the correct decimal format for you.

For the manual `<div>` method, it is strongly recommended to use Decimal Degrees. While the front-end script has a fallback to parse other formats, some characters (like the `"` symbol in DMS) can break the HTML structure and lead to incorrect coordinates. The block editor's converter is the most reliable way to handle alternate formats.

If you're unsure what coordinates to use, the **Coordinate Finder** tool is the best way to retrieve accurate coordinates in the correct format.

### Where do the weather alerts come from?

The alerts are provided directly by the OpenWeather API, which sources them from official meteorological agencies in each country. This ensures the information is timely and authoritative.

### What does the "Enable Rate Limiting" setting do?

This is a security feature that limits the number of times a single visitor (identified by their IP address) can request weather data in one hour. Enabling it helps protect your OpenWeather API key from being overused by automated bots or malicious users. For most websites, the default limit of 100 requests per hour is generous, but you can adjust it if needed.

The rate limit is turned off by default to ensure maximum performance for all users.  If you notice an unexpected increase in weather requests in the performance report, go ahead and turn on rate limiting to see if something is afoot.

### Can I load the JavaScripts myself?

Yes. By default, when "Load Plugin JavaScript" is selected, it will add scripts to every page of your website. If you only plan to display the weather widget on select pages, you could choose to only load the Under The Weather Scripts on those pages by encoding the JavaScript yourself. 

When Load Plugin JavaScript is unchecked, you can use this template tag to add the Under The Weather Scripts to your theme's footer.php file. 

```php
<?php  
if ( function_exists( 'under_the_weather_load_scripts_manually' ) ) {
 under_the_weather_load_scripts_manually(); 
} 
?>
```

For example, if you only intend to display the weather widget on events pages, you could add this targeted script to your theme's footer.php file:

```php
<?php
// Only load the weather script on single pages of the 'event' post type.
if ( is_singular('event') && function_exists('under_the_weather_load_scripts_manually') ) {
    under_the_weather_load_scripts_manually(); 
} 
?>
```

Adding scripts this way is purely optional. Most users can just leave the Load Plugin JavaScript box checked.

###  Are there additional ways to customize this plugin?

Yes. You can modify the appearance of the Weather Icons Fonts by making customizations using CSS. The Weather Icons Fonts are sharp, scalable, and can be customized through CSS to match your website's color palette. 

---

## Screenshots

![The weather widget displaying current conditions with the Weather Icons](https://ps.w.org/under-the-weather/assets/screenshot-1.png)

_The weather widget displaying current conditions with the Weather Icons._

![The weather widget displaying "Today's Forecast" with the Weather Icons font set](https://ps.w.org/under-the-weather/assets/screenshot-2.png)

_The weather widget displaying "Today's Forecast" with the Weather Icons font set._

![The weather widget displaying current conditions with default icons (in Celsius) and extra details enabled](https://ps.w.org/under-the-weather/assets/screenshot-3.png)

_The weather widget displaying current conditions with default icons (in Celsius) and extra details enabled._

![The weather widget with Weather Alerts shown](https://ps.w.org/under-the-weather/assets/screenshot-8.png)

_The weather widget with Weather Alerts shown._

![The weather widget with Sunrise and Sunset times shown](https://ps.w.org/under-the-weather/assets/screenshot-9.png)

_The weather widget with Sunrise and Sunset times shown._

---

## Credits

* **Weather Data:**  [OpenWeather](https://openweathermap.org/) 
* **Weather Icon Font:**  [Weather Icons by Erik Flowers](https://github.com/erikflowers/weather-icons)
* **Animated Weather Icons:** [Meteocons by Bas Milius](https://github.com/basmilius/weather-icons)
* **Geocoding & Map Data:** [Nominatim.org](https://nominatim.org/) Data © OpenStreetMap contributors
* **Block Icons:**  [Phosphor](https://github.com/phosphor-icons/homepage)

---

## External Services

* **OpenWeatherMap API:** This plugin connects to the [OpenWeatherMap API](https://openweathermap.org/api) to retrieve weather forecast data. To provide weather information, the following data is sent to the service:

* **Location Coordinates:** The latitude and longitude provided in the widget settings are sent to fetch the weather for that specific location.
* **API Key:** Your OpenWeatherMap API key is sent to authenticate the request.

Here are the links to their terms of service and privacy policy:
* **Terms of Service:** [https://openweather.co.uk/storage/app/media/Terms/Openweather_terms_and_conditions_of_sale.pdf](https://openweather.co.uk/storage/app/media/Terms/Openweather_terms_and_conditions_of_sale.pdf)
* **Privacy Policy:** [https://openweather.co.uk/privacy-policy](https://openweather.co.uk/privacy-policy)

* **Nominatim (OpenStreetMap) API:** The Coordinate Finder tool sends the location name entered by the administrator to the Nominatim geocoding service to retrieve latitude and longitude coordinates.

Here is the link to their privacy policy:
    * **Privacy Policy:** [https://osmfoundation.org/wiki/Privacy_Policy](https://osmfoundation.org/wiki/Privacy_Policy)

---

## Changelog

### 2.3
* **NEW:** Added two new animated SVG icon sets ("Animated SVG (Fill)" and "Animated SVG (Outline)") from the Meteocons library.
* **NEW:** Added a color picker to the settings page, allowing users to easily customize the color of the "Weather Icons Font" set.
* **IMPROVEMENT:** The "Icon & Style Set" setting now offers four distinct visual styles to choose from.
* **IMPROVEMENT:** The plugin now dynamically adds inline CSS for the icon font color, which only loads when the font set is active and a custom color is saved.
* **DEV:** Added Bas Milius (Meteocons) to the Credits section.
  
### 2.2
* **NEW:** Introduced a `[under_the_weather]` shortcode to allow for easy placement of the weather widget in the Classic Editor, text widgets, and other page builders.
* **NEW:** Added a display option to show the day's sunrise time and sunset time, helpful in  scheduling outdoor activities.
* **NEW:** Added an option to display severe weather alerts from official authorities directly within the widget. This feature can be enabled on the plugin's settings page.
* **IMPROVEMENT:** Incorporated clear warning icons for severe weather alerts.
* **IMPROVEMENT:** The plugin can now handle multiple weather widgets on a single page
* **IMPROVEMENT:** The front-end widget now loads its data asynchronously (AJAX). This improves perceived page load performance and allows multiple widgets on the same page to load their data independently.
* **IMPROVEMENT:** The settings page now features a Cache Expiration Time slider that allows greater flexibility and provides users with a visual way to select how long cached weather should be saved.
* **NEW:** Midnight expiration is now built into the Cache Expiration logic, so you never have to worry about displaying a cached copy of yesterday's forecast.
  
### 2.1
* **NEW:** The block editor can now parse and automatically convert coordinates from common formats like DMS (Degrees, Minutes, Seconds) and DDM (Degrees, Decimal Minutes) into the required decimal format.
* **IMPROVEMENT:** The manual `<div>` widget is now more resilient, with a fallback that can correctly parse multiple coordinate formats.

### 2.0
* **NEW:** Introduced the "Under The Weather Forecast" custom block for seamless integration with the WordPress block editor.
* **NEW:** Included a built-in Coordinate Finder in the "Under The Weather Forecast" custom block for location search capabilities without leaving the editor
* **NEW:** Included custom SVG icons (Phosphor icon set) to enhance the block's visual appearance in the editor.
* **IMPROVEMENT:** Streamlined workflow - no need to manually code HTML divs when using the block editor.
* **IMPROVEMENT:** Block previews the location name and temperature unit directly in the editor.
* **IMPROVEMENT:** Added input validation, rate limiting, request timeout, and response validation for location searches from the Custom block, accompanied by user-friendly error messages.

### 1.8
* **NEW:** Added a "Coordinate Finder" tool on the settings page to look up location coordinates and generate widget code.
* **IMPROVEMENT:** The Coordinate Finder includes a persistent history of your last 5 searches that saves between sessions using WordPress user meta.
* **IMPROVEMENT:** The plugin settings page is now organized into three tabs: Settings, Coordinate Finder, and Performance Report.
* **IMPROVEMENT:** Enhanced input validation and sanitization for the geocoding tool with proper JSON handling.

### 1.7.8
* **SECURITY:** Improved sanitization and validation for rate-limiting feature.

### 1.7.7
* **SECURITY:** Added nonce verification to JavaScript REST API requests to prevent CSRF attacks on weather data endpoints.
* **IMPROVEMENT:** Added front-end validation for coordinates to prevent unnecessary API calls with invalid data.
* **IMPROVEMENT:** Added front-end validation to ensure weather data is complete before display, providing protection against unexpected or bad API responses.
* **IMPROVEMENT:** Added a "Loading..." message to improve user experience while the widget fetches weather data. This message appears after data checks have passed and before the weather is shown.
* **IMPROVEMENT:** Implemented a 10-second timeout for API requests to prevent the widget from hanging indefinitely.
  
### 1.7.6
* **SECURITY:**  Implemented comprehensive API response validation with temperature range checking, data sanitization, and XSS prevention for external weather data.

### 1.7.5
* **IMPROVEMENT:**  Enhanced API error handling with safer HTTP request processing, including 10-second timeout protection and detailed error logging.
* **IMPROVEMENT:**  Added centralized database transaction safety for cache clearing operations that validate that cache clearing actually worked before showing success messaging for proper error validation and user feedback.
* **IMPROVEMENT:**  Implemented structured error responses for Graceful failure handling, better debugging, and greater troubleshooting capabilities.
* **IMPROVEMENT:**  Added custom User-Agent identification for OpenWeather API requests following best practices.

### 1.7.4
* **IMPROVEMENT:** The Performance Report now displays rate-limiting status, including a "Blocked Requests" column in the data table and a status box to show if the feature is active.  This will log the occurrence of any blocked requests.
* **IMPROVEMENT:** Refined styling for the Performance Report.

### 1.7.3
* **NEW:** Added an optional, user-configurable rate-limiting feature to the REST API endpoint to protect against API quota exhaustion and resource abuse.
* **IMPROVEMENT:** The "Requests per Hour" for the rate limit can be configured on the settings page.

### 1.7.2
* **SECURITY:** Enhanced input validation for REST API parameters - added coordinate range validation (-90 to 90 for latitude, -180 to 180 for longitude) and location name screening to prevent XSS and injection attacks.
* **IMPROVEMENT:** Separated validation and sanitization logic in REST API for better error handling.

### 1.7.1
* **FIX:** Completed nonce verification to prevent CSRF attacks on tab switching.
* **IMPROVEMENT:** Added format validation to verify that the OpenWeather API key is a 32-character alphanumeric string.
* **IMPROVEMENT:** Escape URL in JavaScript Localization.
  
### 1.7
* **SECURITY:** Added nonce verification to the admin settings tabs to protect against CSRF attacks.
* **DEV:** Implemented PHPCS ignore comments for the necessary direct database queries, resolving plugin checker warnings.

### 1.6
* **ENHANCEMENT:** Added visual examples of the icon sets to the settings page to clarify the style options.

### 1.5
* **SECURITY:** Updated all function, option, and transient prefixes to be more unique to prevent conflicts.
* **ENHANCEMENT:** Bundled weather icon images directly with the plugin to remove remote dependencies, per WordPress.org guidelines.
* **ENHANCEMENT:** Added full disclosure of external API usage in the readme.txt file.
* **DEV:** Updated code to be fully compliant with the WordPress Plugin Review Team's feedback.

### 1.4
* **IMPROVEMENT:** Better organization of the settings Menu.
* **NEW:** Added an Enable Cache option, which can be disabled to use this plugin without the benefit of caching. 

### 1.3
* **IMPROVEMENT:** Refactored JavaScript handling for better security and to follow WordPress best practices. 
* **NEW:** Added a template tag (`under_the_weather_load_scripts_manually`) to allow for manual/conditional loading of the plugin's JavaScript for performance optimization. 
* **DEV:** Added full internationalization support.

### 1.2
* **IMPROVEMENT:** Improved the appearance of the Performance Report.

### 1.1
* **NEW:** Introduced a Performance Report tab to the Under The Weather Settings Page so that users can monitor the plugin's usage and observe the effectiveness of the cache system.

### 1.0
* **NEW:** Initial version intended for public release.

---

## Upgrade Notice

### 1.3
This version includes a template tag function, described in the README file, that allows you to load the plugin's JavaScript manually.

### 1.4
This version includes an Enable Cache setting. This setting may be helpful when debugging and can be used to turn off the plugin's caching function. 

### 1.5
This version includes significant code quality and security updates. The template tag for manually loading scripts has been renamed from `utw_load_scripts_manually()` to `under_the_weather_load_scripts_manually()`. Please update your theme files if you are using this function.

### 2.0
This version includes a "Under The Weather Forecast" block for the WordPress block editor.

### 2.2
This version introduces a new `[under_the_weather]` shortcode for easy widget placement and adds options to display severe weather alerts and daily sunrise/sunset times.
