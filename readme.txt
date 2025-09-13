=== Under The Weather ===
Contributors: sethsm
Tags: weather, openweather, forecast, cache, widget
Requires at least: 5.0
Tested up to: 6.8
Stable tag: 1.7
Requires PHP: 7.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Donate link: https://www.paypal.com/donate/?hosted_button_id=M3B2Q94PGVVWL
Plugin URI:  https://www.sethcreates.com/plugins-for-wordpress/under-the-weather/
Author URI:  https://www.sethcreates.com/plugins-for-wordpress/

A lightweight and customizable weather widget, powered by the OpenWeather API, that caches and presents weather data with multiple style options.

== Description ==

Under The Weather is a powerful yet simple plugin designed to display location-specific weather forecasts on your WordPress site. Built with performance in mind, it uses a server-side caching system (WordPress Transients) to minimize API calls and ensure your site remains fast.

This plugin is ideal for travel blogs, outdoor activity sites, or any website that needs to display weather conditions for specific locations without the bloat of heavy, multi-dependency plugins. Under The Weather is completely "vanilla" on the front-end, meaning it does not rely on jQuery or any other JavaScript frameworks.

**Key Features:**

* **Server-Side Caching:** All API calls are cached on your server, dramatically reducing calls to the OpenWeather API and speeding up page loads for all users.
* **Imperial & Metric Units:** Display weather in Fahrenheit/mph or Celsius/kph on a per-widget basis.
* **Highly Customizable:** Use the detailed settings page to control everything from cache duration to the number of forecast days.
* **Multiple Styles:** Choose between default OpenWeather images or the crisp Weather Icons font set.
* **Flexible Display:** Show either the current live weather or the high/low forecast for the current day.
* **Extra Details:** Optionally display "Feels Like" temperature and detailed wind information.
* **Lightweight:** Enqueues assets only when needed and does not rely on heavy JavaScript libraries.
* **Easy to Use:** Simply add a `<div>` with data attributes to any post or page to display the widget.

== Installation ==

1.  Upload the entire `under-the-weather` folder to the `/wp-content/plugins/` directory.
2.  Activate the plugin through the 'Plugins' menu in WordPress.
3.  Navigate to **Settings > Under The Weather** to configure the plugin. You must enter a valid OpenWeather API key for the plugin to function.  The plugin is designed to work with the One Call API 3.0. by OpenWeather.


== Usage ==

To display the weather widget on a post, page, or in a template file, add a simple `<div>` element with the class `weather-widget` and the required data attributes.

* `data-lat`: The latitude for the forecast.
* `data-lon`: The longitude for the forecast.
* `data-location-name`: The city or location name you want to display as the title of the widget. (Beyond its display purpose, the 'data-location-name' is also used to create the shared cache key).
* `data-unit` (optional): The unit system for temperature and wind speed. Accepts `metric` or `imperial`. The default unit is `imperial` if not provided.

**Examples:**

<div class="weather-widget" 
     data-lat="34.1186" 
     data-lon="-118.3004" 
     data-location-name="Los Angeles, California">
</div>

To show the weather for a location in Celsius, you would add `data-unit="metric"`:

<div class="weather-widget" 
     data-lat="48.8566" 
     data-lon="2.3522" 
     data-location-name="Paris, France"
     data-unit="metric">
</div>

The plugin's JavaScript will automatically find this element and populate it with the forecast.

== Configuration ==

Before you begin, go to https://home.openweathermap.org/ and sign up for an API key and register for the One Call API 3.0 subscription. Paste your API key into the Under the Weather Settings Page.

**API & Cache**

**Cache Expiration Time:** 
This setting controls how long the weather data is stored on your server before fetching a new forecast.
For displaying live conditions (using the **Primary Display** or **Extra Details** options), a shorter cache time of 1 or 2 hours is recommended.
For displaying only the daily high/low, a longer cache time of 3 or 6 hours is effective at reducing API calls.

**Widget Display & Style**

**Icon & Style Set:** 
Choose between the default PNG images provided by OpenWeather or the sharp, modern "Weather Icons" font set by Erik Flowers. Selecting the icon font will load an additional small CSS file.

**Primary Display:** 
Select whether the main display of the widget shows the **Current** live temperature or **Today's Forecast** (the high and low for the day).

**Number of Forecast Days:** 
Adjust the number of days shown in the extended forecast row, from 2 to 6 days.

**Extra Details:**
Selecting this option will **display 'Feels Like' and wind** (direction and speed) information beneath the primary display. This setting adds nuance to the current weather conditions display. 

**Display Timestamp:**
Shows how long ago the weather data was updated from the source. This option helps readers see how recently the weather widget obtained its information. 

**Display Unit Symbol:**
Adds the unit symbol (F or C) next to the main temperature. This option allows you to select whether or not the widget should include the temperature unit symbol in the primary temperature display.

**Advanced Settings**
**Enable Cache:**  You can uncheck this box, if you would like to use this plugin without the benefit of the caching function. 

**Asset Loading:** For the plugin to function correctly, the
**Load Plugin CSS** and **Load Plugin JavaScript** boxes should normally remain checked. However, you can uncheck them if you prefer to include the plugin's CSS and JS files as part of your theme's own optimized assets.

If you uncheck **Load Plugin JavaScript**, you can load the Under The Weather scripts manually on select pages by adding the following template tag to your theme files (e.g., footer.php):

<?php
if ( function_exists( 'under_the_weather_load_scripts_manually' ) ) {
   under_the_weather_load_scripts_manually(); 
} 
?>

For most users, simply leaving these boxes checked is the best way to use the weather widget.

== Screenshots ==

1. The weather widget displaying current conditions with the Weather Icons.
2. The weather widget displaying "Today's Forecast" with the Weather Icons font set.
3. The weather widget displaying current conditions with default icons (in Celsius) and extra details enabled.
4. The Under The Weather Performance Report depicting seven days of information on cached hits vs calls to the OpenWeather API
5. The plugin's comprehensive settings page.

== Frequently Asked Questions ==

= What API key do I need? =

This plugin works with the **OpenWeather One Call API 3.0**. You can get a free API key by signing up on the OpenWeather website. Make sure you have subscribed to the One Call API on your account's API page.

= The weather isn't updating. Why? =

The plugin caches the weather data on your server to improve performance and reduce API calls. The data will only be fetched again after the "Cache Expiration Time" you set on the settings page has passed. If you need to force an immediate update, go to **Settings > Under The Weather** and click the "Clear All Weather Caches" button.

= I made changes to my settings. Why isn't the widget updating? =

The weather widget is probably displaying a cached forecast. Since waiting around is no fun, the Under The Weather Settings has a "Clear Weather Cache" option at the bottom. If you press the "Clear All Weather Caches & Stats" button, it will force an immediate update of all weather forecasts. This will also clear the performance report data.  

If you're feeling patient, just wait for the weather widget to update after the current cache has expired.

= Does the Weather Widget work in Fahrenheit or Celsius? =

Both. By default, the weather widget will show a forecast in Fahrenheit. If you prefer to see the forecast in Celsius, set data-unit="metric" within the weather-widget div (see configuration instructions). Additionally, checking the box for "Display Unit Symbol" on the Under The Weather Settings page instructs the weather widget to display the temperature unit symbol (F or C) in the primary temperature display.

= Can I load the JavaScripts myself? =

Yes. By default, when "Load Plugin JavaScript" is selected, it will add scripts to every page of your website. If you only plan to display the weather widget on select pages, you could choose to only load the Under The Weather Scripts on those pages by encoding the JavaScript yourself. 

When Load Plugin JavaScript is unchecked, you can use this template tag o add the Under The Weather Scripts to your theme's footer.php file. 

<?php  
if ( function_exists( 'under_the_weather_load_scripts_manually' ) ) {
 under_the_weather_load_scripts_manually(); 
} 
?>

For example, if you only intend to display the weather widget on events pages, you could add this targeted script to your theme's footer.php file:

<?php
// Only load the weather script on single pages of the 'event' post type.
if ( is_singular('event') && function_exists('under_the_weather_load_scripts_manually') ) {
    under_the_weather_load_scripts_manually(); 
} 
?>

Adding scripts this way is purely optional. Most users can just leave the Load Plugin JavaScript box checked.

= How can I monitor how many OpenWeather API calls the plugin is making? =

Click on the "Performance Report" tab of the Under The Weather Settings Page to see a graph and data log for the last 7 days of plugin performance. The Performance Report shows the last seven days of information about the requests made by the weather widget. The report displays a comparison of the cached hits and calls to the OpenWeather API. 

Seeing how the plugin's cache system reduces the number of API calls demonstrates its effectiveness. Use the Performance Report to examine how modifying the cache expiration time affects the rate of cached requests.

= Are there additional ways to customize this plugin? =

Yes. You can modify the appearance of the Weather Icons Fonts by making customizations using CSS. The Weather Icons Fonts are sharp, scalable, and can be customized through CSS to match your website's color palette. 

= Do I need to use the plugin's caching function? =

No. To retrieve fresh weather data every time a widget page loads, you can uncheck "Enable Cache" under the plugin's advanced settings. While the caching system provides a great benefit for reducing API hits, turning off this function during your initial widget setup may be useful. 

== Credits ==

Weather Data: OpenWeather
Icon Font: Weather Icons by Erik Flowers

== External Services ==

[cite_start]This plugin connects to the [OpenWeatherMap API](https://openweathermap.org/api) to retrieve weather forecast data. [cite: 36] In order to provide weather information, the following data is sent to the service:

* [cite_start]**Location Coordinates:** The latitude and longitude provided in the widget settings are sent to fetch the weather for that specific location. [cite: 30, 37]
* **API Key:** Your OpenWeatherMap API key is sent to authenticate the request.

Here are the links to their terms of service and privacy policy:
* **Terms of Service:** [https://openweather.co.uk/storage/app/media/Terms/Openweather_terms_and_conditions_of_sale.pdf](https://openweather.co.uk/storage/app/media/Terms/Openweather_terms_and_conditions_of_sale.pdf)
* **Privacy Policy:** [https://openweather.co.uk/privacy-policy](https://openweather.co.uk/privacy-policy)

== Changelog ==

= 1.7 =
* SECURITY: Added nonce verification to the admin settings tabs to protect against CSRF attacks.
* DEV: Implemented PHPCS ignore comments for the necessary direct database queries, resolving plugin checker warnings.

= 1.6 =
* ENHANCEMENT: Added visual examples of the icon sets to the settings page to clarify the style options.


= 1.5 =
* SECURITY: Updated all function, option, and transient prefixes to be more unique to prevent conflicts.
* ENHANCEMENT: Bundled weather icon images directly with the plugin to remove remote dependencies, per WordPress.org guidelines.
* ENHANCEMENT: Added full disclosure of external API usage in the readme.txt file.
* DEV: Updated code to be fully compliant with the WordPress Plugin Review Team's feedback.

= 1.4 =
* IMPROVEMENT: Better organization of the settings Menu.
*  NEW: Added an Enable Cache option, which can be disabled to use this plugin without the benefit of caching. 

= 1.3 =
* IMPROVEMENT: Refactored JavaScript handling for better security and to follow WordPress best practices. 
* NEW: Added a template tag (`under_the_weather_load_scripts_manually`) to allow for manual/conditional loading of the plugin's JavaScript for performance optimization. 
* DEV: Added full internationalization support.

= 1.2 =
* Improved the appearance of the Performance Report.

= 1.1 =
* Introduced a Performance Report tab to the Under The Weather Settings Page so that users can monitor the plugin's usage and observe the effectiveness of the cache system.

= 1.0 =
* Initial version intended for public release.

== Upgrade Notice ==

= 1.3 =
This version includes a template tag function, described in the README file, that allows you to load the plugin's JavaScript manually.

= 1.4 =
This version includes an Enable Cache setting. This setting may be helpful when debugging and can be used to turn off the plugin's caching function. 

= 1.5 =
This version includes significant code quality and security updates. The template tag for manually loading scripts has been renamed from `utw_load_scripts_manually()` to `under_the_weather_load_scripts_manually()`. Please update your theme files if you are using this function.
