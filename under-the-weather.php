<?php
/**
 * Plugin Name:       Under The Weather
 * Plugin URI:        https://www.sethcreates.com/plugins-for-wordpress/under-the-weather/
 * Description:       A lightweight weather widget that caches OpenWeather API data and offers multiple style options.
 * Version:           2.4
 * Author:      	  Seth Smigelski
 * Author URI:  	  https://www.sethcreates.com/plugins-for-wordpress/
 * License:     	  GPL-2.0+
 * License URI: 	  http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       under-the-weather
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Define a constant for the plugin version for easy maintenance.
define( 'UNDER_THE_WEATHER_VERSION', '2.4.0' );

// Add the Under The Weather Forecast block.
add_action('init', 'under_the_weather_register_widget_block');
function under_the_weather_register_widget_block() {
    register_block_type( __DIR__ . '/build' );
}

// Add shortcode support.
add_action( 'init', 'under_the_weather_register_shortcode' );
function under_the_weather_register_shortcode() {
    add_shortcode( 'under_the_weather', 'under_the_weather_shortcode_callback' );
}

// =============================================================================
// SECTION 1: SETTINGS PAGE & CACHE CLEARING
// =============================================================================

/**
 * Add the plugin's settings page to the admin menu.
 */
add_action('admin_menu', 'under_the_weather_add_admin_menu');
function under_the_weather_add_admin_menu() {
    add_options_page(
        __('Under The Weather Settings', 'under-the-weather'),
        __('Under The Weather', 'under-the-weather'),
        'manage_options',
        'under-the-weather',
        'under_the_weather_settings_page_html'
    );
}

/**
 * Register all settings, sections, and fields for the admin page.
 */
add_action('admin_init', 'under_the_weather_settings_init');
function under_the_weather_settings_init() {
    register_setting('under_the_weather_settings_group', 'under_the_weather_settings', ['sanitize_callback' => 'under_the_weather_sanitize_settings']);
    $page_slug = 'under-the-weather';

    // Section for basic API and cache duration settings
    add_settings_section('under_the_weather_settings_section', __('API & Cache Settings', 'under-the-weather'), 'under_the_weather_settings_section_callback', $page_slug);
    add_settings_field('under_the_weather_api_key', __('OpenWeather API Key', 'under-the-weather'), 'under_the_weather_api_key_field_html', $page_slug, 'under_the_weather_settings_section');
    add_settings_field('under_the_weather_expiration', __('Cache Expiration Time (Hours)', 'under-the-weather'), 'under_the_weather_expiration_field_html', $page_slug, 'under_the_weather_settings_section');

    // Extra save button field (with empty label)
    add_settings_field('under_the_weather_section_save', '', 'under_the_weather_save_button_callback', $page_slug, 'under_the_weather_settings_section');	

    // Section for controlling widget display and style
    add_settings_section('under_the_weather_display_section', __('Widget Display Settings', 'under-the-weather'), 'under_the_weather_display_section_callback', $page_slug);
	add_settings_field('under_the_weather_style_set_visual', __('Visual Reference', 'under-the-weather'), 'under_the_weather_style_set_visual_html', $page_slug, 'under_the_weather_display_section');
    add_settings_field('under_the_weather_style_set', __('Icon & Style Set', 'under-the-weather'), 'under_the_weather_style_set_field_html', $page_slug, 'under_the_weather_display_section');
    //  NEW FIELD for Font Icons Color Picker
    add_settings_field('under_the_weather_icon_font_color', __('Icon Font Color', 'under-the-weather'), 'under_the_weather_icon_font_color_field_html', $page_slug, 'under_the_weather_display_section');
    add_settings_field('under_the_weather_display_mode', __('Primary Display', 'under-the-weather'), 'under_the_weather_display_mode_field_html', $page_slug, 'under_the_weather_display_section');
    add_settings_field('under_the_weather_forecast_days', __('Number of Forecast Days', 'under-the-weather'), 'under_the_weather_forecast_days_field_html', $page_slug, 'under_the_weather_display_section');
    add_settings_field('under_the_weather_show_unit', __('Unit Symbol', 'under-the-weather'), 'under_the_weather_show_unit_field_html', $page_slug, 'under_the_weather_display_section');	
    add_settings_field('under_the_weather_show_details', __('Extra Details', 'under-the-weather'), 'under_the_weather_show_details_field_html', $page_slug, 'under_the_weather_display_section');
    add_settings_field('under_the_weather_sunrise_sunset', __('Sunrise & Sunset', 'under-the-weather'), 'under_the_weather_sunrise_sunset_field_html', $page_slug, 'under_the_weather_display_section');
	add_settings_field('under_the_weather_show_alerts', __('Weather Alerts', 'under-the-weather'), 'under_the_weather_show_alerts_field_html', $page_slug, 'under_the_weather_display_section');
    add_settings_field('under_the_weather_show_timestamp', __('Timestamps', 'under-the-weather'), 'under_the_weather_show_timestamp_field_html', $page_slug, 'under_the_weather_display_section');

    // Section for "Advanced Settings"
    add_settings_section('under_the_weather_advanced_section', __('Advanced Settings', 'under-the-weather'), null, $page_slug);
    add_settings_field('under_the_weather_enable_cache', __('Enable Cache', 'under-the-weather'), 'under_the_weather_enable_cache_field_html', $page_slug, 'under_the_weather_advanced_section');
    add_settings_field('under_the_weather_enable_rate_limit', __('Enable Rate Limiting', 'under-the-weather'), 'under_the_weather_enable_rate_limit_field_html', $page_slug, 'under_the_weather_advanced_section');
    add_settings_field('under_the_weather_rate_limit_count', __('Requests per Hour', 'under-the-weather'), 'under_the_weather_rate_limit_count_field_html', $page_slug, 'under_the_weather_advanced_section');
	
    add_settings_field('under_the_weather_enqueue_style', __('Load Plugin CSS', 'under-the-weather'), 'under_the_weather_enqueue_style_field_html', $page_slug, 'under_the_weather_advanced_section');
    add_settings_field('under_the_weather_enqueue_script', __('Load Plugin JavaScript', 'under-the-weather'), 'under_the_weather_enqueue_script_field_html', $page_slug, 'under_the_weather_advanced_section');
	
	$finder_page_slug = 'under-the-weather-finder';
	// Section for Coordinate Finder Tool
    add_settings_section(
        'under_the_weather_geocoding_section', 
        __('Coordinate Finder', 'under-the-weather'), 
        'under_the_weather_geocoding_section_callback', 
        $finder_page_slug 
    );
    add_settings_field(
        'under_the_weather_geocoding_tool', 
        __('Find Location', 'under-the-weather'), 
        'under_the_weather_geocoding_field_html', 
        $finder_page_slug, 
        'under_the_weather_geocoding_section'
    );
}

/**
 * Sanitize and validate all settings before saving to the database.
 */
 
// Sanitize the API key 
function under_the_weather_sanitize_settings($input) {
    $new_input = [];
	
    // Sanitize the API key 
    if (isset($input['api_key'])) {
        $api_key = sanitize_text_field($input['api_key']);
        if (empty($api_key)) {
            $new_input['api_key'] = ''; // Allow clearing
        } elseif (under_the_weather_validate_api_key($api_key)) {
            $new_input['api_key'] = $api_key;
        } else {
            add_settings_error('under_the_weather_settings', 'invalid_api_key', 
                __('Invalid API key format. Please check your OpenWeather API key.', 'under-the-weather'));
            // Keep the old value if new one is invalid
            $old_options = get_option('under_the_weather_settings');
            $new_input['api_key'] = isset($old_options['api_key']) ? $old_options['api_key'] : '';
        }
    }
	
	// Sanitize the expiration time from the range slider
	if (isset($input['expiration']) && is_numeric($input['expiration'])) {
		$expiration = floatval($input['expiration']);
    // Ensure the value is within the allowed range (0.5 to 8)
		if ($expiration >= 0.5 && $expiration <= 8) {
			$new_input['expiration'] = $expiration;
		} else {
			// If out of range, enforce minimum of 0.5
			$new_input['expiration'] = max(0.5, min(8, $expiration));
			add_settings_error('under_the_weather_settings', 'expiration_adjusted', 
				__('Cache expiration time adjusted to minimum of 0.5 hours (30 minutes).', 'under-the-weather'), 'updated');
		}
	} else {
		$new_input['expiration'] = 4; // Default to 4 if not numeric
	}
    
	// Sanitize the Rate Limit options
    $new_input['enable_rate_limit'] = isset($input['enable_rate_limit']) ? '1' : '0';
    if (isset($input['rate_limit_count']) && is_numeric($input['rate_limit_count'])) {
		$count = absint($input['rate_limit_count']);
		$new_input['rate_limit_count'] = max(10, min(1000, $count));
	} else {
		$new_input['rate_limit_count'] = 100; // Ensure default exists
	}
	
	// Sanitize the  Sunrise and Sunset preference with 12 hour time format and 24 hour time format
	if (isset($input['sunrise_sunset']) && in_array($input['sunrise_sunset'], ['off', '12', '24'])) {
        $new_input['sunrise_sunset'] = $input['sunrise_sunset'];
    } else {
        $new_input['sunrise_sunset'] = 'off';
    }
	
    // Added svg_fill and svg_outline to the array
	if (isset($input['style_set']) && in_array($input['style_set'], ['default_images', 'weather_icons_font', 'svg_fill', 'svg_outline'])) { 
        $new_input['style_set'] = $input['style_set']; 
    }

    // Sanitize font color as a valid hex code
    if (isset($input['icon_font_color'])) {
        $color = sanitize_text_field($input['icon_font_color']);
        // Check if it's a valid hex color
        if (preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $color)) {
            $new_input['icon_font_color'] = $color;
        } else {
            // Fallback to default if invalid
            $new_input['icon_font_color'] = '#555555';
        }
    }
	
    // Sanitize the major display options
    if (isset($input['display_mode']) && in_array($input['display_mode'], ['current', 'today_forecast'])) { $new_input['display_mode'] = $input['display_mode']; }
    if (isset($input['forecast_days']) && in_array($input['forecast_days'], ['2','3','4','5','6'])) { $new_input['forecast_days'] = $input['forecast_days']; }
	
    $new_input['show_details'] = isset($input['show_details']) ? '1' : '0';
    $new_input['show_unit'] = isset($input['show_unit']) ? '1' : '0';
	$new_input['show_alerts'] = isset($input['show_alerts']) ? '1' : '0';
    $new_input['show_timestamp'] = isset($input['show_timestamp']) ? '1' : '0';
    $new_input['enable_cache'] = isset($input['enable_cache']) ? '1' : '0';
    $new_input['enqueue_style'] = isset($input['enqueue_style']) ? '1' : '0';
    $new_input['enqueue_script'] = isset($input['enqueue_script']) ? '1' : '0';
    return $new_input;
}

// OpenWeather API keys are 32 character alphanumeric strings
function under_the_weather_validate_api_key($api_key) {   
    return preg_match('/^[a-zA-Z0-9]{32}$/', $api_key);
}

// Field Callback Functions
function under_the_weather_settings_section_callback() { 
	echo '<p>' . esc_html__('Enter your OpenWeather API key and choose how long to cache the weather data.', 'under-the-weather') . '</p>'; 
}
function under_the_weather_display_section_callback() {
	echo '<p>' . esc_html__('Control how the weather widget appears on your site.', 'under-the-weather') . '</p>'; 
}

function under_the_weather_style_set_visual_html() {
    $plugin_assets_url = plugins_url('/', __FILE__);
    ?>
    <div class="under-the-weather-visual-reference-container">
        <div class="under-the-weather-visual-reference-item">
            <img src="<?php echo esc_url($plugin_assets_url . 'images/default-style-example.png'); ?>" alt="Default Images Style Example" class="under-the-weather-visual-reference-default-image">
            <p><em><?php esc_html_e('Default Images', 'under-the-weather'); ?></em></p>
        </div>
        <div class="under-the-weather-visual-reference-item">
            <img src="<?php echo esc_url($plugin_assets_url . 'images/font-style-example.svg'); ?>" alt="Weather Icons Font Style Example">
            <p><em><?php esc_html_e('Weather Icons Font', 'under-the-weather'); ?></em></p>
        </div>
        <div class="under-the-weather-visual-reference-item">
            <img src="<?php echo esc_url($plugin_assets_url . 'svg/fill/partly-cloudy-day.svg'); ?>" alt="Animated SVG Style Example">
            <p><em><?php esc_html_e('Animated SVG', 'under-the-weather'); ?></em></p>
        </div>
        </div>
    <?php
}

function under_the_weather_api_key_field_html() { 
	$options = get_option('under_the_weather_settings'); $value = isset($options['api_key']) ? $options['api_key'] : ''; echo '<input type="text" name="under_the_weather_settings[api_key]" value="' . esc_attr($value) . '" class="regular-text" placeholder="' . esc_attr__('Enter your API key', 'under-the-weather') . '">';
}

// Use a slider to set the cache expiration time. Default: 4 hours.	
function under_the_weather_expiration_field_html() {
    $options = get_option('under_the_weather_settings');
    $value = isset($options['expiration']) ? $options['expiration'] : '4'; 
    ?>
    <div class="utw-slider-container">
        <div class="utw-slider-wrapper">
            <input 
                type="range" 
                id="utw-expiration-slider" 
                name="under_the_weather_settings[expiration]" 
                value="<?php echo esc_attr($value); ?>" 
                min="0" 
                max="8" 
                step="0.5"
                list="expiration-markers"
                data-original-value="<?php echo esc_attr($value); ?>"
            >
            <datalist id="expiration-markers">
                <option value="0" label="0"></option>
                <option value="1"></option> <option value="2" label="2"></option>
                <option value="3"></option> <option value="4" label="4"></option>
                <option value="5"></option> <option value="6" label="6"></option>
                <option value="7"></option> <option value="8" label="8"></option>
            </datalist>
        </div>
    </div>    
    <div class="utw-expiration-display">
            <span class="utw-slider-value">
            	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="#48484A" d="M128 44a96 96 0 1 0 96 96a96.11 96.11 0 0 0-96-96m0 168a72 72 0 1 1 72-72a72.08 72.08 0 0 1-72 72m36.49-112.49a12 12 0 0 1 0 17l-28 28a12 12 0 0 1-17-17l28-28a12 12 0 0 1 17 0M92 16a12 12 0 0 1 12-12h48a12 12 0 0 1 0 24h-48a12 12 0 0 1-12-12"/></svg> Cached weather will expire after <strong id="utw-expiration-value"><?php echo esc_html($value); ?></strong> hours.
            </span>
    </div>
    <p id="utw-min-cache-notice" class="description">
        <?php esc_html_e('Minimum cache time is 30 minutes. To disable caching, use the advanced settings below.', 'under-the-weather'); ?>
    </p>
    <?php
}

// Add an extra save settigns button, just below the expiration slider.
function under_the_weather_save_button_callback() {
    ?>
    <div class="utw-section-save-wrapper">
        <?php submit_button(
            __('Save Settings', 'under-the-weather'), 
            'primary', 
            'submit', 
            false,
            ['id' => 'utw-expiration-save-btn']
        ); ?>
    </div>
    <div id="utw-unsaved-changes" class="utw-unsaved-message">
            <?php esc_html_e('You have unsaved changes', 'under-the-weather'); ?>
        
    </div>
    <?php
}

// Added Animated SVG options to the dropdown
function under_the_weather_style_set_field_html() {
    $options = get_option('under_the_weather_settings');
    $value = isset($options['style_set']) ? $options['style_set'] : 'default_images';
    ?>
    <select name="under_the_weather_settings[style_set]">
        <option value="default_images" <?php selected($value, 'default_images'); ?>><?php esc_html_e('Default Images', 'under-the-weather'); ?></option>
        <option value="weather_icons_font" <?php selected($value, 'weather_icons_font'); ?>><?php esc_html_e('Weather Icons Font', 'under-the-weather'); ?></option>
        <option value="svg_fill" <?php selected($value, 'svg_fill'); ?>><?php esc_html_e('Animated SVG (Fill)', 'under-the-weather'); ?></option>
        <option value="svg_outline" <?php selected($value, 'svg_outline'); ?>><?php esc_html_e('Animated SVG (Outline)', 'under-the-weather'); ?></option>
    </select>
    <?php
}

// Allow users to set color of weather icons font
function under_the_weather_icon_font_color_field_html() {
    $options = get_option('under_the_weather_settings');
    $value = isset($options['icon_font_color']) ? $options['icon_font_color'] : '#555555';
    ?>
    <input type="text"
           name="under_the_weather_settings[icon_font_color]"
           value="<?php echo esc_attr($value); ?>"
           class="utw-color-picker"
           data-default-color="#555555" />
    <p class="description">
        <?php esc_html_e("This color selection only affects the appearance of the 'Weather Icons Font.'", 'under-the-weather'); ?>
    </p>
    <?php
}

function under_the_weather_display_mode_field_html() { 
	$options = get_option('under_the_weather_settings'); $value = isset($options['display_mode']) ? $options['display_mode'] : 'current'; echo '<label><input type="radio" name="under_the_weather_settings[display_mode]" value="current" '.checked($value, 'current', false).'> ' . esc_html__('Current', 'under-the-weather') . '</label><br><label><input type="radio" name="under_the_weather_settings[display_mode]" value="today_forecast" '.checked($value, 'today_forecast', false).'> ' . esc_html__("Today's Forecast", 'under-the-weather') . '</label>'; 
}
function under_the_weather_forecast_days_field_html() {
	$options = get_option('under_the_weather_settings'); $value = isset($options['forecast_days']) ? $options['forecast_days'] : '5'; echo '<select name="under_the_weather_settings[forecast_days]"><option value="2" '.selected($value, '2', false).'>' . esc_html__('2 Days', 'under-the-weather') . '</option><option value="3" '.selected($value, '3', false).'>' . esc_html__('3 Days', 'under-the-weather') . '</option><option value="4" '.selected($value, '4', false).'>' . esc_html__('4 Days', 'under-the-weather') . '</option><option value="5" '.selected($value, '5', false).'>' . esc_html__('5 Days', 'under-the-weather') . '</option><option value="6" '.selected($value, '6', false).'>' . esc_html__('6 Days', 'under-the-weather') . '</option></select>'; 
}
function under_the_weather_show_details_field_html() {
	$options = get_option('under_the_weather_settings'); $value = isset($options['show_details']) ? $options['show_details'] : '0'; echo "<input type='checkbox' name='under_the_weather_settings[show_details]' value='1' " . checked($value, '1', false) . "> " . esc_html__("Display 'Feels Like' and wind.", 'under-the-weather'); 
}
function under_the_weather_show_unit_field_html() { 
	$options = get_option('under_the_weather_settings'); $value = isset($options['show_unit']) ? $options['show_unit'] : '0'; echo "<input type='checkbox' name='under_the_weather_settings[show_unit]' value='1' " . checked($value, '1', false) . "> " . esc_html__('Show the temperature unit symbol (F or C) in the primary display.', 'under-the-weather');
}
function under_the_weather_show_alerts_field_html() {
    $options = get_option('under_the_weather_settings');
    // Default to '1' (checked) to make the feature visible
    $value = isset($options['show_alerts']) ? $options['show_alerts'] : '1'; 
    echo "<input type='checkbox' name='under_the_weather_settings[show_alerts]' value='1' " . checked($value, '1', false) . "> " . esc_html__('Show active weather alerts from reporting authorities.', 'under-the-weather');
}
function under_the_weather_sunrise_sunset_field_html() {
    $options = get_option('under_the_weather_settings');
    $value = isset($options['sunrise_sunset']) ? $options['sunrise_sunset'] : 'off';
    ?>
    <fieldset>
        <label><input type="radio" name="under_the_weather_settings[sunrise_sunset]" value="off" <?php checked($value, 'off'); ?>> <?php esc_html_e('Off', 'under-the-weather'); ?></label><br>
        <label><input type="radio" name="under_the_weather_settings[sunrise_sunset]" value="12" <?php checked($value, '12'); ?>> <?php esc_html_e('Show in 12-hour format (e.g., 6:30 PM)', 'under-the-weather'); ?></label><br>
        <label><input type="radio" name="under_the_weather_settings[sunrise_sunset]" value="24" <?php checked($value, '24'); ?>> <?php esc_html_e('Show in 24-hour format (e.g., 18:30)', 'under-the-weather'); ?></label>
    </fieldset>
    <?php
}
function under_the_weather_show_timestamp_field_html() {
	$options = get_option('under_the_weather_settings'); $value = isset($options['show_timestamp']) ? $options['show_timestamp'] : '0'; echo "<input type='checkbox' name='under_the_weather_settings[show_timestamp]' value='1' " . checked($value, '1', false) . "> " . esc_html__('Show last updated time.', 'under-the-weather'); 
	}
function under_the_weather_enable_cache_field_html() {
	$options = get_option('under_the_weather_settings'); $value = isset($options['enable_cache']) ? $options['enable_cache'] : '1'; echo "<input type='checkbox' name='under_the_weather_settings[enable_cache]' value='1' " . checked($value, '1', false) . "> " . esc_html__('Cache API results to improve performance and reduce API calls.', 'under-the-weather'); 
}
function under_the_weather_enable_rate_limit_field_html() {
    $options = get_option('under_the_weather_settings');
    $value = isset($options['enable_rate_limit']) ? $options['enable_rate_limit'] : '0';
    echo "<input type='checkbox' name='under_the_weather_settings[enable_rate_limit]' value='1' " . checked($value, '1', false) . "> " . esc_html__('Protect against excessive API requests from a single IP address.', 'under-the-weather');
}
function under_the_weather_rate_limit_count_field_html() {
    $options = get_option('under_the_weather_settings');
    $value = isset($options['rate_limit_count']) ? $options['rate_limit_count'] : '100';
    echo '<input type="number" name="under_the_weather_settings[rate_limit_count]" value="' . esc_attr($value) . '" class="small-text" min="10" max="1000">';
    echo '<p class="description">' . esc_html__('Maximum requests per IP per hour. Default is 100.', 'under-the-weather') . '</p>';
}
function under_the_weather_enqueue_style_field_html() { 
	$options = get_option('under_the_weather_settings'); $value = isset($options['enqueue_style']) ? $options['enqueue_style'] : '1'; echo "<input type='checkbox' name='under_the_weather_settings[enqueue_style]' value='1' " . checked($value, '1', false) . "> " . esc_html__('Load plugin CSS.', 'under-the-weather'); 
}
function under_the_weather_enqueue_script_field_html() {
	$options = get_option('under_the_weather_settings'); $value = isset($options['enqueue_script']) ? $options['enqueue_script'] : '1'; echo "<input type='checkbox' name='under_the_weather_settings[enqueue_script]' value='1' " . checked($value, '1', false) . "> " . esc_html__('Load plugin JavaScript.', 'under-the-weather');
}
function under_the_weather_geocoding_section_callback() {
	echo '<p>' . esc_html__('Enter a location to find its coordinates and generate a ready-to-use widget div. This tool uses OpenStreetMap\'s geocoding service to look up coordinates.', 'under-the-weather') . '</p>';
}

function under_the_weather_geocoding_field_html() {
    ?>
    <div id="utw-geocoder-tool">
        <input type="text" id="utw-location-input" class="regular-text" placeholder="<?php esc_attr_e('e.g., Los Angeles, CA', 'under-the-weather'); ?>">
        <button type="button" id="utw-find-coords" class="button button-secondary"><?php esc_html_e('Find Coordinates', 'under-the-weather'); ?></button>
        <div id="utw-result-wrapper"></div>
    </div>
    <?php
}

function under_the_weather_settings_page_html() {
    // Define the nonce action and name for clarity
    $nonce_action = 'utw_switch_tab';
    $nonce_name = 'utw_tab_nonce';
    // Verify the nonce if a tab is being set. If not valid, default to 'main_settings'.
    // The 'check_admin_referer' function handles the nonce verification for us.
    if (isset($_GET['tab']) && isset($_GET[$nonce_name])) {
        check_admin_referer($nonce_action, $nonce_name);
        $active_tab = sanitize_key($_GET['tab']);
    } else {
        $active_tab = 'main_settings';
    }
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <h2 class="nav-tab-wrapper">
            <a href="<?php echo esc_url(wp_nonce_url('?page=under-the-weather&tab=main_settings', $nonce_action, $nonce_name)); ?>" class="nav-tab <?php echo esc_attr($active_tab == 'main_settings' ? 'nav-tab-active' : ''); ?>"><?php esc_html_e('Settings', 'under-the-weather'); ?></a>
            <a href="<?php echo esc_url(wp_nonce_url('?page=under-the-weather&tab=coordinate_finder', $nonce_action, $nonce_name)); ?>" class="nav-tab <?php echo esc_attr($active_tab == 'coordinate_finder' ? 'nav-tab-active' : ''); ?>"><?php esc_html_e('Coordinate Finder', 'under-the-weather'); ?></a>
            <a href="<?php echo esc_url(wp_nonce_url('?page=under-the-weather&tab=performance_report', $nonce_action, $nonce_name)); ?>" class="nav-tab <?php echo esc_attr($active_tab == 'performance_report' ? 'nav-tab-active' : ''); ?>"><?php esc_html_e('Performance Report', 'under-the-weather'); ?></a>
        </h2>

        <?php if ($active_tab == 'main_settings') : ?>
            <form action="options.php" method="post">
                <?php 
                settings_fields('under_the_weather_settings_group'); 
                do_settings_sections('under-the-weather'); 
                submit_button(__('Save Settings', 'under-the-weather')); 
                ?>
            </form>
            <hr>
            <h2><?php esc_html_e('Clear Weather Cache', 'under-the-weather'); ?></h2>
            <p><?php esc_html_e('Force an immediate update of all weather forecasts. This will also clear the performance report data.', 'under-the-weather'); ?></p>
            <form action="" method="post">
                <input type="hidden" name="under_the_weather_action" value="clear_cache">
                <?php wp_nonce_field('under_the_weather_clear_cache_nonce', 'under_the_weather_clear_cache_nonce_field'); ?>
                <?php submit_button(__('Clear All Weather Caches & Stats', 'under-the-weather'), 'delete', 'under_the_weather_clear_cache', false); ?>
            </form>
		<?php elseif ($active_tab == 'coordinate_finder') : ?>
            <?php do_settings_sections('under-the-weather-finder'); ?>
            <div id="utw-history-wrapper">
                <h2><?php esc_html_e('Previous Searches', 'under-the-weather'); ?></h2>
                <div id="utw-history-list"></div>
            </div>          
        <?php else : ?>
            <?php under_the_weather_display_performance_report_html(); ?>
        <?php endif; ?>
    </div>
    <?php
}

/**
 * Handles the form submission for the clear cache button.
 */
add_action('admin_init', 'under_the_weather_handle_clear_cache_action');
function under_the_weather_handle_clear_cache_action() {
    if (isset($_POST['under_the_weather_action']) && $_POST['under_the_weather_action'] === 'clear_cache' && check_admin_referer('under_the_weather_clear_cache_nonce', 'under_the_weather_clear_cache_nonce_field') && current_user_can('manage_options')) {
        $cache_cleared = under_the_weather_clear_transients_safely();
        $rate_limit_cleared = under_the_weather_clear_rate_limit_transients_safely();
        $usage_cleared = delete_option('under_the_weather_usage_stats');
        $ratelimit_cleared = delete_option('under_the_weather_ratelimit_stats');
        
        if ($cache_cleared && $rate_limit_cleared) {
            add_settings_error('under_the_weather_settings', 'cache_cleared', __('All weather caches and performance stats have been cleared.', 'under-the-weather'), 'success');
        } else {
            add_settings_error('under_the_weather_settings', 'cache_clear_failed', __('Some caches could not be cleared. Please try again or contact support.', 'under-the-weather'), 'error');
        }
    }
}

// Log errors in debug mode
function under_the_weather_log($message) {
    if (defined('WP_DEBUG') && WP_DEBUG && defined('WP_DEBUG_LOG') && WP_DEBUG_LOG) {
        error_log('UTW: ' . $message);
    }
}

function under_the_weather_clear_transients_safely() {
    global $wpdb;
    $prefix = $wpdb->esc_like('_transient_under_the_weather_') . '%';
    $timeout_prefix = $wpdb->esc_like('_transient_timeout_under_the_weather_') . '%';
    $result1 = $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $prefix));
    $result2 = $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $timeout_prefix));
    if ($result1 === false || $result2 === false) {
		under_the_weather_log('Failed to clear weather transients - DB error');
        return false;
    }
    return true;
}

function under_the_weather_clear_rate_limit_transients_safely() {
    global $wpdb;
    $prefix = $wpdb->esc_like('_transient_utw_rate_limit_') . '%';
    $timeout_prefix = $wpdb->esc_like('_transient_timeout_utw_rate_limit_') . '%';
    $result1 = $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $prefix));
    $result2 = $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $timeout_prefix));
    if ($result1 === false || $result2 === false) {
		under_the_weather_log('Failed to clear rate limit transients - DB error');
        return false;
    }
    return true;
}

// =============================================================================
// SECTION 2: ENQUEUE ASSETS & SELECTIVE LOADING
// =============================================================================

add_action('wp_enqueue_scripts', 'under_the_weather_enqueue_assets');
function under_the_weather_enqueue_assets() { 
    $options = get_option('under_the_weather_settings'); 
    if (empty($options)) return;
	
	// Register the main style so WordPress knows about it.
    wp_register_style('under-the-weather-styles', plugins_url('css/under-the-weather.min.css', __FILE__), [], UNDER_THE_WEATHER_VERSION);

	// Register dependent icon styles.
    if (isset($options['style_set']) && $options['style_set'] === 'weather_icons_font') {
        wp_register_style('under-the-weather-icons', plugins_url('css/weather-icons.min.css', __FILE__), [], '2.0');
        if (!empty($options['show_details'])) {
            wp_register_style('under-the-weather-wind-icons', plugins_url('css/weather-icons-wind.min.css', __FILE__), [], '2.0');
        }
    } 

	// Conditionally ENQUEUE based on the global setting.
    if (!empty($options['enqueue_style'])) { 
         wp_enqueue_style('under-the-weather-styles'); 
        if (isset($options['style_set']) && $options['style_set'] === 'weather_icons_font') { 
            wp_enqueue_style('under-the-weather-icons'); 
            if (!empty($options['show_details'])) { 
                wp_enqueue_style('under-the-weather-wind-icons');  
            } 
        } 
    }

    // Conditionally add the user's customized color for the weather icon font
    // Check if we are using the icon font AND a custom color is set
    if (isset($options['style_set']) && $options['style_set'] === 'weather_icons_font' && !empty($options['icon_font_color'])) {
        $custom_color = esc_attr($options['icon_font_color']);
        
        // Make sure the color isn't the default, just to be efficient
        if ($custom_color !== '#555555' && $custom_color !== '#555') {
            // This CSS will override the .css file
            $custom_css = "
                .weather-widget .wi {
                    color: {$custom_color};
                }
                /* This is for the sunrise/sunset icon color */
                .sunrise-sunset-container .wi {
                    color: {$custom_color};
                }
            ";
            // Add the dynamic CSS right after the main stylesheet
            wp_add_inline_style('under-the-weather-styles', $custom_css);
        }
    }

    if (!empty($options['enqueue_script'])) { 
        under_the_weather_load_scripts_manually();
    } 
}

/**
 * Save Previous Searches for Coordinate Finder.
 */
add_action('wp_ajax_utw_save_search_history', 'under_the_weather_save_search_history');
function under_the_weather_save_search_history() {
    check_ajax_referer('utw_geocoder_nonce', 'nonce');
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }
	
	// Intentionally not sanitized here - JSON string must be decoded first, 
	// Individual elements are sanitized below
    $history_raw = wp_unslash($_POST['history'] ?? '');
    $decoded = json_decode($history_raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        under_the_weather_log('Geocoder: JSON decode failed for user ' . get_current_user_id());
        wp_send_json_error();
    }
	
	// Sanitize the individual items AFTER decoding
    $sanitized_history = [];
    foreach ($decoded as $item) {
        if (isset($item['locationName']) && isset($item['widgetHtml'])) {
            $sanitized_history[] = [
                'locationName' => sanitize_text_field($item['locationName']),
                'widgetHtml' => wp_kses($item['widgetHtml'], [
                    'div' => [
                        'class' => [],
                        'data-lat' => [],
                        'data-lon' => [],
                        'data-location-name' => []
                    ]
                ])
            ];
        }
    }
    if (empty($sanitized_history)) {
        wp_send_json_error();
    }
    
    $result = update_user_meta(get_current_user_id(), 'utw_geocoder_history', $sanitized_history);
    wp_send_json_success();
}

add_action('wp_ajax_utw_get_search_history', 'under_the_weather_get_search_history');
function under_the_weather_get_search_history() {
    check_ajax_referer('utw_geocoder_nonce', 'nonce');
    if (!current_user_can('manage_options')) wp_die('Unauthorized');
    $history = get_user_meta(get_current_user_id(), 'utw_geocoder_history', true);
    wp_send_json_success($history ?: []);
}


/**
 * Loads settings page styles and geocoder script location coordinates lookup tool.
 */
add_action('admin_enqueue_scripts', 'under_the_weather_enqueue_admin_assets');
function under_the_weather_enqueue_admin_assets($hook) { 
    if ($hook != 'settings_page_under-the-weather') return;
    wp_enqueue_style('wp-color-picker'); // Add this
    wp_enqueue_script('wp-color-picker-script', plugins_url('js/admin-color-picker.js', __FILE__), ['wp-color-picker'], false, true); // Add this
    wp_enqueue_style('under-the-weather-admin-styles', plugins_url('css/admin-styles.min.css', __FILE__), [], UNDER_THE_WEATHER_VERSION); 
	wp_enqueue_script('under-the-weather-geocoder', plugins_url('js/admin-geocoder.js', __FILE__), [], UNDER_THE_WEATHER_VERSION, true);
    // Localize script with nonce
    wp_localize_script('under-the-weather-geocoder', 'utwGeocoderData', [
        'nonce' => wp_create_nonce('utw_geocoder_nonce')
    ]);
}

/**
 * Loads the plugin's main script and localizes data.
 */
function under_the_weather_load_scripts_manually() {
    $options = get_option('under_the_weather_settings');
    wp_enqueue_script('under-the-weather-script', plugins_url('js/under-the-weather.min.js', __FILE__), [], UNDER_THE_WEATHER_VERSION, true);
    $settings_for_js = [
        'style_set'      => isset($options['style_set']) ? $options['style_set'] : 'default_images',
        'display_mode'   => isset($options['display_mode']) ? $options['display_mode'] : 'current',
        'forecast_days'  => isset($options['forecast_days']) ? intval($options['forecast_days']) : 5,
        'show_details'   => !empty($options['show_details']),
		'show_alerts'    => !empty($options['show_alerts']),
		'sunrise_sunset_format' => isset($options['sunrise_sunset']) ? $options['sunrise_sunset'] : 'off',
        'show_timestamp' => !empty($options['show_timestamp']),
        'show_unit'      => !empty($options['show_unit']),
        'nonce'          => wp_create_nonce('wp_rest'),
    ];
    wp_localize_script('under-the-weather-script', 'under_the_weather_settings', $settings_for_js);
	// Pass the plugin's base URL to the script for loading local images.
    $plugin_url_data = ['url' => esc_url_raw(plugins_url('/', __FILE__))];
    wp_localize_script('under-the-weather-script', 'under_the_weather_plugin_url', $plugin_url_data);
}

// =============================================================================
// SECTION 3: REST API ENDPOINT & HELPERS
// =============================================================================

add_action('rest_api_init', function () { 
    register_rest_route('under-the-weather/v1', '/forecast', [
        'methods' => 'GET',
        'callback' => 'under_the_weather_get_forecast_data',
        'args' => [
            'lat' => [
                'required' => true,
                'validate_callback' => 'under_the_weather_validate_latitude',
                'sanitize_callback' => function($value) {
                    return floatval($value);
                }
            ],
            'lon' => [
                'required' => true,
                'validate_callback' => 'under_the_weather_validate_longitude',
                'sanitize_callback' => function($value) {
                    return floatval($value);
                }
            ],
            'location_name' => [
                'required' => true,
                'validate_callback' => function($value) {
                    return under_the_weather_validate_location_name($value) !== false;
                },
                'sanitize_callback' => 'sanitize_text_field'
            ],
            'unit' => [
                'required' => false,
                'default' => 'imperial',
                'validate_callback' => function($param) {
                    return in_array($param, ['imperial', 'metric'], true);
                }
            ]
        ],
        'permission_callback' => function() {
            $options = get_option('under_the_weather_settings');
            
            // Only check the rate limit IF the setting is enabled
            if (!empty($options['enable_rate_limit'])) {
                if (!under_the_weather_check_rate_limit()) {
					under_the_weather_log_ratelimit_block();
                    return new WP_Error(
                        'rate_limit_exceeded',
                        __('Rate limit exceeded. Please try again later.', 'under-the-weather'),
                        ['status' => 429]
                    );
                }
            }
            // If not enabled, or if the check passes, allow the request.
            return true;
        }
    ]);
});
function under_the_weather_validate_latitude($value) { if (!is_numeric($value)) return false; $lat = floatval($value); return ($lat >= -90 && $lat <= 90); }
function under_the_weather_validate_longitude($value) { if (!is_numeric($value)) return false; $lon = floatval($value); return ($lon >= -180 && $lon <= 180); }
function under_the_weather_validate_location_name($location) {
    // Must be 1-100 characters
    if (strlen($location) < 1 || strlen($location) > 100) {
        return false;
    } 
    // Remove obviously malicious patterns while allowing international characters
    // Block HTML tags, script tags, and common injection patterns
    $dangerous_patterns = [
        '/<[^>]*>/',           // HTML tags
        '/javascript:/i',      // JavaScript protocol
        '/on\w+\s*=/i',       // Event handlers (onclick, onload, etc.)
        '/data:/i',           // Data URLs
        '/vbscript:/i',       // VBScript
        '/&#x?\d+;/',         // HTML entities (could hide malicious code)
        '/[<>"\'\{\}]/',      // Potentially dangerous characters
    ];
    foreach ($dangerous_patterns as $pattern) {
        if (preg_match($pattern, $location)) {
            return false;
        }
    }
    // Allow unicode letters, numbers, spaces, common punctuation for place names
    // This includes accented characters, Asian characters, etc.
    if (!preg_match('/^[\p{L}\p{N}\s\-\'\.,\(\)\/]+$/u', $location)) {
        return false;
    }
    return $location;
}

// Add this function to handle rate limiting
function under_the_weather_check_rate_limit() {
	$options = get_option('under_the_weather_settings');
    $client_ip = '';

    // Determine the client's IP address, sanitizing at each step.
    
    // 1. Check HTTP_X_FORWARDED_FOR
    if ( isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
        // Unslash and sanitize the entire header string first.
        $forwarded_ips_string = sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_FORWARDED_FOR'] ) );
        $forwarded_ips = explode( ',', $forwarded_ips_string );
        // Use the first IP in the list.
        $potential_ip = trim( $forwarded_ips[0] );
        // Validate if it's a real IP.
        if ( filter_var( $potential_ip, FILTER_VALIDATE_IP ) ) {
            $client_ip = $potential_ip;
        }
    }
    
    // 2. If not found, check HTTP_X_REAL_IP
    if ( empty( $client_ip ) && isset( $_SERVER['HTTP_X_REAL_IP'] ) ) {
        $potential_ip = sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_REAL_IP'] ) );
        if ( filter_var( $potential_ip, FILTER_VALIDATE_IP ) ) {
            $client_ip = $potential_ip;
        }
    }

    // 3. Finally, fall back to REMOTE_ADDR
    if ( empty( $client_ip ) && isset( $_SERVER['REMOTE_ADDR'] ) ) {
        $potential_ip = sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) );
        if ( filter_var( $potential_ip, FILTER_VALIDATE_IP ) ) {
            $client_ip = $potential_ip;
        }
    }

    // 4. If no valid IP was found after all checks, use a safe default.
    if ( empty( $client_ip ) ) {
        $client_ip = '127.0.0.1';
    }
    
    // Create a unique key for this IP
    $rate_limit_key = 'utw_rate_limit_' . hash('sha256', $client_ip);
    
    // Get current request count
    $current_requests = get_transient($rate_limit_key);
    
    // Define limits from settings, with a sensible default
    $max_requests = isset($options['rate_limit_count']) ? absint($options['rate_limit_count']) : 100;
    $time_window = 3600; // Per hour (in seconds)
    
    if ($current_requests === false) {
        set_transient($rate_limit_key, 1, $time_window);
        return true;
    }
    
    if ($current_requests >= $max_requests) {
        return false; // Rate limit exceeded
    }
    
    set_transient($rate_limit_key, $current_requests + 1, $time_window);
    return true;
}

function under_the_weather_is_numeric_callback($value) { return is_numeric($value); }
function under_the_weather_get_icon_class($icon_code) { $icon_map = [ '01d' => 'wi-day-sunny', '01n' => 'wi-night-clear', '02d' => 'wi-day-cloudy', '02n' => 'wi-night-alt-cloudy', '03d' => 'wi-cloud', '03n' => 'wi-cloud', '04d' => 'wi-cloudy', '04n' => 'wi-cloudy', '09d' => 'wi-showers', '09n' => 'wi-night-alt-showers', '10d' => 'wi-day-rain', '10n' => 'wi-night-alt-rain', '11d' => 'wi-thunderstorm', '11n' => 'wi-night-alt-thunderstorm', '13d' => 'wi-snow', '13n' => 'wi-night-alt-snow', '50d' => 'wi-fog', '50n' => 'wi-night-fog', ]; return isset($icon_map[$icon_code]) ? $icon_map[$icon_code] : 'wi-na'; }
function under_the_weather_update_usage_stats($type) { $stats = get_option('under_the_weather_usage_stats', []); $today = wp_date('Y-m-d'); if (!isset($stats[$today])) { $stats[$today] = ['api' => 0, 'cache' => 0]; } if ($type === 'api' || $type === 'cache') { $stats[$today][$type]++; } if (count($stats) > 7) { $stats = array_slice($stats, -7, 7, true); } update_option('under_the_weather_usage_stats', $stats); }

/**
 * Logs a rate limit block event.
 */
function under_the_weather_log_ratelimit_block() {
    $stats = get_option('under_the_weather_ratelimit_stats', []);
    $today = wp_date('Y-m-d');
    if (!isset($stats[$today])) $stats[$today] = ['blocked' => 0];
    $stats[$today]['blocked']++;
    if (count($stats) > 7) $stats = array_slice($stats, -7, 7, true);
    update_option('under_the_weather_ratelimit_stats', $stats);
}

/**
 * Enhanced error handling for the API calls.
 */
function under_the_weather_safe_api_call($api_url) {
    $response = wp_remote_get($api_url, ['timeout' => 10, 'sslverify' => true, 'user-agent' => 'WordPress/Under-The-Weather-Plugin/' . UNDER_THE_WEATHER_VERSION]);
    if (is_wp_error($response)) {
		under_the_weather_log('API Error: ' . $response->get_error_message());		
        return false;
    }
    $code = wp_remote_retrieve_response_code($response);
    if ($code !== 200) {
		under_the_weather_log("API returned status: $code");			
        return false;
    }
    return wp_remote_retrieve_body($response);
}

/**
 * Validate API Response.
 */
function under_the_weather_validate_api_response($data) {
    if (!is_object($data)) {
		under_the_weather_log('API response is not an object');	
        return false;
    }
    
    // Validate current weather data exists
    if (!isset($data->current) || !is_object($data->current)) {
		under_the_weather_log('Missing current weather data');	
        return false;
    }
    
    // Validate and sanitize temperature
    if (isset($data->current->temp)) {
		$temp = floatval($data->current->temp);
		// Check units to determine appropriate range
		$unit = isset($data->units) ? $data->units : 'imperial';
		$temp_range = ($unit === 'metric') ? [-50, 60] : [-60, 150]; // Celsius vs Fahrenheit
		
		if ($temp < $temp_range[0] || $temp > $temp_range[1]) {
			under_the_weather_log('Invalid temperature value: ' . $temp . ' for unit: ' . $unit);	
			$data->current->temp = ($unit === 'metric') ? 20 : 70; // More appropriate fallback
		}
		$data->current->temp = $temp;
	}
    
    // Validate humidity (0-100%)
    if (isset($data->current->humidity)) {
        $humidity = intval($data->current->humidity);
        $data->current->humidity = max(0, min(100, $humidity));
    }
    
    // Sanitize weather description
    if (isset($data->current->weather[0]->description)) {
        $description = sanitize_text_field($data->current->weather[0]->description);
        $data->current->weather[0]->description = $description;
    }
    
    // Validate icon code format
    if (isset($data->current->weather[0]->icon)) {
        $icon = $data->current->weather[0]->icon;
        if (!preg_match('/^[0-9]{2}[dn]$/', $icon)) {
			under_the_weather_log('Invalid icon code: ' . $icon);	
            $data->current->weather[0]->icon = '01d'; // Fallback to clear sky
        }
    }
    
    // Validate daily forecast data
    if (isset($data->daily) && is_array($data->daily)) {
        foreach ($data->daily as $day) {
            if (isset($day->temp->max)) {
                $day->temp->max = floatval($day->temp->max);
                if ($day->temp->max < -100 || $day->temp->max > 150) {
                    $day->temp->max = 70; // Reasonable fallback
                }
            }
            
            if (isset($day->weather[0]->description)) {
                $day->weather[0]->description = sanitize_text_field($day->weather[0]->description);
            }
        }
    }
    
    return $data;
}

// NEW - Function to map OpenWeather codes to Meteocons SVG filenames
function under_the_weather_get_svg_icon_map() {
    return [
        '01d' => 'clear-day',
        '01n' => 'clear-night',
        '02d' => 'partly-cloudy-day',
        '02n' => 'partly-cloudy-night',
        '03d' => 'cloudy',
        '03n' => 'cloudy',
        '04d' => 'overcast-day', 
        '04n' => 'overcast-night',
        '09d' => 'rain', 
        '09n' => 'rain',
        '10d' => 'partly-cloudy-day-rain',
        '10n' => 'partly-cloudy-night-rain',
        '11d' => 'thunderstorms-day',
        '11n' => 'thunderstorms-night',
        '13d' => 'partly-cloudy-day-snow',
        '13n' => 'partly-cloudy-night-snow',
        '50d' => 'mist',
        '50n' => 'fog-night',
    ];
}


/**
 * The Weather API call.
 */
function under_the_weather_get_forecast_data($request) { 
    $options = get_option('under_the_weather_settings'); 
    $api_key = isset($options['api_key']) ? $options['api_key'] : ''; 
    $expiration_hours = isset($options['expiration']) ? intval($options['expiration']) : 2;
    $style_set = isset($options['style_set']) ? $options['style_set'] : 'default_images'; 
    $caching_enabled = isset($options['enable_cache']) ? (bool)$options['enable_cache'] : true;

    if (empty($api_key)) return new WP_REST_Response(__('API Key is not configured.', 'under-the-weather'), 500); 

    $location_name = $request['location_name']; 
    $unit = $request['unit']; 
    $transient_key = 'under_the_weather_' . sanitize_key($location_name) . '_' . $unit; 

    if ($caching_enabled) {
        $cached_weather = get_transient($transient_key); 
        if ($cached_weather) { 
            under_the_weather_update_usage_stats('cache');
            // Check if data needs to be added to cached object
            $data_updated = false;
            if ($style_set === 'weather_icons_font' && !isset($cached_weather->current->weather[0]->icon_class)) {
                $cached_weather->current->weather[0]->icon_class = under_the_weather_get_icon_class($cached_weather->current->weather[0]->icon);
                foreach ($cached_weather->daily as $day) {
                    $day->weather[0]->icon_class = under_the_weather_get_icon_class($day->weather[0]->icon);
                }
                $data_updated = true;
            }
            if (($style_set === 'svg_fill' || $style_set === 'svg_outline') && !isset($cached_weather->current->weather[0]->svg_icon_name)) {
                $svg_map = under_the_weather_get_svg_icon_map();
                $cached_weather->current->weather[0]->svg_icon_name = $svg_map[$cached_weather->current->weather[0]->icon] ?? 'not-available';
                foreach ($cached_weather->daily as $day) {
                     $day->weather[0]->svg_icon_name = $svg_map[$day->weather[0]->icon] ?? 'not-available';
                }
                $data_updated = true;
            }
            // If we added data, we don't need to re-save the transient, just return it.
            return new WP_REST_Response($cached_weather, 200); 
        } 
    }
    
    $lat = $request['lat']; 
    $lon = $request['lon']; 
    $api_url = "https://api.openweathermap.org/data/3.0/onecall?lat={$lat}&lon={$lon}&appid={$api_key}&units={$unit}"; 
    
	// Check API Response
	$response_body = under_the_weather_safe_api_call($api_url);
	if ($response_body === false) return new WP_REST_Response(__('Could not fetch new weather data from OpenWeather.', 'under-the-weather'), 502);
	
	$weather_data = json_decode($response_body);
    under_the_weather_update_usage_stats('api'); 
    if (json_last_error() !== JSON_ERROR_NONE) return new WP_REST_Response(__('Error decoding weather data.', 'under-the-weather'), 500); 
    
	$weather_data = under_the_weather_validate_api_response($weather_data);
	if ($weather_data === false) return new WP_REST_Response(__('Invalid weather data received.', 'under-the-weather'), 502);
	
    $weather_data->fetched_at = time(); 
    $weather_data->units = $unit; 
    
    // Add icon class or SVG filename based on style setting
    if ($style_set === 'weather_icons_font') { 
        $weather_data->current->weather[0]->icon_class = under_the_weather_get_icon_class($weather_data->current->weather[0]->icon); 
        foreach ($weather_data->daily as $day) { 
            $weather_data->daily[array_search($day, $weather_data->daily)]->weather[0]->icon_class = under_the_weather_get_icon_class($day->weather[0]->icon); 
        } 
    } elseif ($style_set === 'svg_fill' || $style_set === 'svg_outline') {
        $svg_map = under_the_weather_get_svg_icon_map();
        $weather_data->current->weather[0]->svg_icon_name = $svg_map[$weather_data->current->weather[0]->icon] ?? 'not-available';
        foreach ($weather_data->daily as $day) {
            $weather_data->daily[array_search($day, $weather_data->daily)]->weather[0]->svg_icon_name = $svg_map[$day->weather[0]->icon] ?? 'not-available';
        }
    }
	
	
	// Establish midnight cache expiration logic, so the previous day's weather is not shown from the cache
	// Incorporate midnight cache expiration with timed cache expiration preference
	// Add a 10-minute buffer to avoid caching the previous day's forecast at midnight due to service clock differences.
	// This is like treating 12:10 a.m. as midnight as a precaution
	
	if ($caching_enabled) {
		// Enforce minimum cache time of 30 minutes
		$expiration_hours = isset($options['expiration']) ? floatval($options['expiration']) : 4;
		$expiration_hours = max(0.5, $expiration_hours); 
		$midnight_expiration_seconds = 0;
		if (isset($weather_data->timezone) && is_string($weather_data->timezone)) {
			try {
				$timezone_obj = new DateTimeZone($weather_data->timezone);
				$now = new DateTime('now', $timezone_obj);
				$midnight = new DateTime('tomorrow midnight', $timezone_obj);
				$seconds_until_midnight = $midnight->getTimestamp() - $now->getTimestamp();
				$midnight_expiration_seconds = $seconds_until_midnight + (10 * 60);
			} catch (Exception $e) {
				under_the_weather_log('Invalid timezone from API: ' . $weather_data->timezone);
				$midnight_expiration_seconds = 0;
			}
		}
		// Calculate fixed duration
		$fixed_duration_seconds = $expiration_hours * HOUR_IN_SECONDS;
		// Use the shorter of: fixed duration or midnight expiration
		if ($midnight_expiration_seconds > 0) {
			$final_expiration_seconds = min($fixed_duration_seconds, $midnight_expiration_seconds);
		} else {
			$final_expiration_seconds = $fixed_duration_seconds;
		}
		// Final safety check: ensure at least 30 minutes
		$final_expiration_seconds = max(1800, $final_expiration_seconds);
		set_transient($transient_key, $weather_data, $final_expiration_seconds);
	}
    return new WP_REST_Response($weather_data, 200); 
}

/**
 *
 * Callback function for the [under_the_weather] shortcode.
 * @param array $atts Shortcode attributes.
 * @return string HTML output for the weather widget.
 *
 */
function under_the_weather_shortcode_callback( $atts ) {
    // 1. Define attributes and set default values.
    $atts = shortcode_atts(
        array(
            'lat'              => '',
            'lon'              => '',
            'location_name'    => '',
            'unit'             => 'imperial', // Default to imperial
        ),
        $atts,
        'under_the_weather'
    );

    // 2. Validate that essential attributes are present.
    if ( empty( $atts['lat'] ) || empty( $atts['lon'] ) || empty( $atts['location_name'] ) ) {
        // Return an error message or an empty string if essential data is missing.
        return '';
    }

    // 3. Enqueue the necessary scripts and styles.
    // This ensures they are only loaded on pages where the shortcode is used.
	wp_enqueue_style( 'under-the-weather-styles' );
	// We also need to enqueue the icon styles if they are selected in the settings.
	$options = get_option('under_the_weather_settings');
	if (isset($options['style_set']) && $options['style_set'] === 'weather_icons_font') {
		wp_enqueue_style('under-the-weather-icons');
		if (!empty($options['show_details'])) {
			wp_enqueue_style('under-the-weather-wind-icons');
		}
	}
	under_the_weather_load_scripts_manually();

    // 4. Build and return the HTML div.
    return sprintf(
        '<div class="weather-widget" data-lat="%s" data-lon="%s" data-location-name="%s" data-unit="%s"></div>',
        esc_attr( $atts['lat'] ),
        esc_attr( $atts['lon'] ),
        esc_attr( $atts['location_name'] ),
        esc_attr( $atts['unit'] )
    );
}

// =============================================================================
// SECTION 4: USAGE REPORT DISPLAY
// =============================================================================

/**
 * Renders the HTML for the performance report tab.
 */
function under_the_weather_display_performance_report_html() {
    $options = get_option('under_the_weather_settings'); 
    $usage_stats = get_option('under_the_weather_usage_stats', []);
    $ratelimit_stats = get_option('under_the_weather_ratelimit_stats', []); 
    $report_data = [];
    $max_value = 1;

    for ($i = 6; $i >= 0; $i--) {
        $date = wp_date('Y-m-d', strtotime("-$i days"));
        $day_usage = isset($usage_stats[$date]) ? $usage_stats[$date] : ['api' => 0, 'cache' => 0];
        $day_ratelimit = isset($ratelimit_stats[$date]) ? $ratelimit_stats[$date] : ['blocked' => 0];
        
        // Combine the data
        $report_data[$date] = [
            'api'     => $day_usage['api'],
            'cache'   => $day_usage['cache'],
            'blocked' => $day_ratelimit['blocked']
        ];
        
        $max_value = max($max_value, $day_usage['api'], $day_usage['cache']);
    }
    ?>
    <div class="under-the-weather-usage-report">
        <h2><?php esc_html_e('Last 7 Days of Activity', 'under-the-weather'); ?></h2>
        <p><?php esc_html_e('This report shows the number of times weather data was served from the cache versus making a new call to the OpenWeather API.', 'under-the-weather'); ?></p>

        <div class="under-the-weather-chart-container">
            <?php foreach ($report_data as $date => $data) : ?>
                <div class="under-the-weather-chart-day">
                    <div class="under-the-weather-chart-bars">
                        <div class="under-the-weather-chart-bar api" style="height: <?php echo esc_attr(($data['api'] / $max_value) * 100); ?>%;">
                            <span class="value"><?php echo esc_html($data['api']); ?></span>
                        </div>
                        <div class="under-the-weather-chart-bar cache" style="height: <?php echo esc_attr(($data['cache'] / $max_value) * 100); ?>%;">
                            <span class="value"><?php echo esc_html($data['cache']); ?></span>
                        </div>
                    </div>
                    <div class="under-the-weather-chart-day-label"><?php echo esc_html(wp_date('M j', strtotime($date))); ?></div>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="under-the-weather-chart-legend">
            <div class="under-the-weather-legend-item">
                <span class="under-the-weather-legend-color api"></span> <?php esc_html_e('API Hits', 'under-the-weather'); ?>
            </div>
            <div class="under-the-weather-legend-item">
                <span class="under-the-weather-legend-color cache"></span> <?php esc_html_e('Cache Hits', 'under-the-weather'); ?>
            </div>
        </div>
        
        <div class="under-the-weather-status-box">
            <h4><?php esc_html_e('Rate Limit Status', 'under-the-weather'); ?></h4>
            <?php if (!empty($options['enable_rate_limit'])) : ?>
                <p><?php
                    printf(
						/* translators: %s is the maximum number of requests, a bolded number like 100. */
                        esc_html__('Rate limiting is currently ACTIVE, blocking requests in excess of %s per hour from a single IP address.', 'under-the-weather'),
                        '<strong>' . esc_html($options['rate_limit_count'] ?? 100) . '</strong>'
                    );
                ?></p>
            <?php else : ?>
                <p><?php esc_html_e('Rate limiting is currently DISABLED. This is the default preference.', 'under-the-weather'); ?></p>
            <?php endif; ?>
        </div>

        <h3><?php esc_html_e('Raw Data', 'under-the-weather'); ?></h3>
        <table class="wp-list-table widefat striped under-the-weather-data-table">
            <thead>
                <tr>
                    <th><?php esc_html_e('Date', 'under-the-weather'); ?></th>
                    <th><?php esc_html_e('API Hits', 'under-the-weather'); ?></th>
                    <th><?php esc_html_e('Cache Hits', 'under-the-weather'); ?></th>
                    <th><?php esc_html_e('Blocked Requests', 'under-the-weather'); ?></th> 
                    <th><?php esc_html_e('Total Requests', 'under-the-weather'); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php foreach (array_reverse($report_data, true) as $date => $data) : ?>
                    <tr>
                        <td><?php echo esc_html(wp_date('F j, Y', strtotime($date))); ?></td>
                        <td><?php echo esc_html($data['api']); ?></td>
                        <td><?php echo esc_html($data['cache']); ?></td>
                        <td><?php echo esc_html($data['blocked']); ?></td>
                        <td><?php echo esc_html($data['api'] + $data['cache']); ?></td>
                        
                    </tr>
                <?php endforeach; ?>
                 <?php if (empty($report_data)) : ?>
                    <tr><td colspan="5"><?php esc_html_e('No usage data recorded yet.', 'under-the-weather'); ?></td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
    <?php
}
