// src/edit.js
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, Button, Modal, Icon } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { weatherIcon, degreesIcon, locationIcon, wrenchIcon } from './icons'; 

export default function Edit({ attributes, setAttributes }) {
    const { locationName, latitude, longitude, unit } = attributes;
    const [isModalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
	const [lastRequestTime, setLastRequestTime] = useState(0);
	const [requestCount, setRequestCount] = useState(0);
	const { openGeneralSidebar } = useDispatch('core/edit-post');
	const { createErrorNotice } = useDispatch('core/notices');

	// Validate coordinate inputs
	const validateLatitude = (value) => {
	    if (!value || value.trim() === '') return; // Exit if empty
	
	    const num = parseFloat(value);
	    const message = __('Latitude must be a number between -90 and 90.', 'under-the-weather');
	
	    if (isNaN(num) || num < -90 || num > 90) {
	        createErrorNotice(message, { type: 'snackbar' });
	    }
	};
	
	const validateLongitude = (value) => {
	    if (!value || value.trim() === '') return; // Exit if empty
	    
	    const num = parseFloat(value);
	    const message = __('Longitude must be a number between -180 and 180.', 'under-the-weather');
	    
	    if (isNaN(num) || num < -180 || num > 180) {
	        createErrorNotice(message, { type: 'snackbar' });
	    }
	};
		
	// Converts a string to title case. e.g., "los angeles" becomes "Los Angeles".
	const titleCase = (str) => {
	  if (!str) return '';
	  return str
	    .toLowerCase()
	    .split(' ')
	    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
	    .join(' ');
	};
	
    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);
    const findCoordinates = () => {
	
	// Validate Location input
	const cleanSearchTerm = searchTerm.trim();
	    
	    if (!cleanSearchTerm) {
			createErrorNotice(
		        __('Please enter a location name.', 'under-the-weather'),
		        { type: 'snackbar' } 
		    );
	        return;
	    }
	    
	    if (cleanSearchTerm.length < 2) {
			createErrorNotice(
		        __('Location name must be at least 2 characters.', 'under-the-weather'),
		        { type: 'snackbar' } 
		    );
	        return;
	    }
	    
	    if (cleanSearchTerm.length > 100) {
			createErrorNotice(
		        __('Location name is too long. Please use a shorter name.', 'under-the-weather'),
		        { type: 'snackbar' } 
		    );
	        return;
	    }
	    
	    // Check for potentially malicious patterns
	    const dangerousPatterns = [
	        /<[^>]*>/,           // HTML tags
	        /javascript:/i,      // JavaScript protocol
	        /on\w+\s*=/i,       // Event handlers
	        /[<>"\'{}\[\]]/      // Suspicious characters
	    ];
	    
	    for (const pattern of dangerousPatterns) {
	        if (pattern.test(cleanSearchTerm)) {
			createErrorNotice(
		        __('Invalid characters in location name. Please use only letters, numbers, spaces, and basic punctuation.', 'under-the-weather'),
		        { type: 'snackbar' } 
		    );
	            return;
	        }
	    }

		// Rate limiting: max 5 requests per minute
        const now = Date.now();
        const oneMinute = 60 * 1000;
        
        if (now - lastRequestTime < oneMinute) {
            if (requestCount >= 5) {
				createErrorNotice(
			        __('Too many requests. Please wait a moment before searching again.', 'under-the-weather'),
			        { type: 'snackbar' } 
			    );
                return;
            }
            setRequestCount(prev => prev + 1);
        } else {
            setRequestCount(1);
            setLastRequestTime(now);
        }
        
        setIsLoading(true);
		const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanSearchTerm)}&format=json&limit=5`;
		
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);
		
        fetch(apiUrl, {
	        method: 'GET',
	        headers: {
	            'User-Agent': 'WordPress Under-The-Weather Plugin'
	        },
    		signal: controller.signal
	    })
	    .then(response => {
			clearTimeout(timeoutId);
	        if (!response.ok) {
	            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	        }
	        
	        const contentType = response.headers.get('content-type');
	        if (!contentType || !contentType.includes('application/json')) {
	            throw new Error('Invalid response format from geocoding service');
	        }
	        
	        return response.json();
	    })
	    .then(data => {
	        setIsLoading(false);
	        
	        // Validate API response structure
	        if (!Array.isArray(data)) {
	            throw new Error('Unexpected response format');
	        }
	        
	        // Validate and sanitize each result
	        const validResults = data.filter(result => {
	            return (
	                result &&
	                typeof result.lat === 'string' &&
	                typeof result.lon === 'string' &&
	                typeof result.display_name === 'string' &&
	                !isNaN(parseFloat(result.lat)) &&
	                !isNaN(parseFloat(result.lon)) &&
	                parseFloat(result.lat) >= -90 &&
	                parseFloat(result.lat) <= 90 &&
	                parseFloat(result.lon) >= -180 &&
	                parseFloat(result.lon) <= 180
	            );
	        });
	        
	        if (validResults.length === 0 && data.length > 0) {
	            throw new Error('No valid location results found');
	        }
	        
	        setSearchResults(validResults);
	        
	        if (validResults.length === 0) {
				createErrorNotice(
			        __('No locations found. Please try a different search term.', 'under-the-weather'),
			        { type: 'snackbar' } 
			    );
	        }
	    })
		.catch(error => {
			clearTimeout(timeoutId);
			setIsLoading(false);
			setSearchResults([]);
			
			console.error('Geocoding error:', error);
			
			// User-friendly error messages
			let errorMessage = __('Unable to search for locations. Please try again.', 'under-the-weather');
			
			if (error.name === 'AbortError') {
				errorMessage = __('Request timed out. Please try again.', 'under-the-weather');
			} else if (error.message.includes('HTTP 429')) {
				errorMessage = __('Too many requests to the location service. Please wait a moment and try again.', 'under-the-weather');
			} else if (error.message.includes('network') || error.message.includes('fetch')) {
				errorMessage = __('Network error. Please check your connection and try again.', 'under-the-weather');
			}
			
			createErrorNotice(errorMessage, { type: 'snackbar' });
		});
    };

    const selectLocation = (result) => {
        setAttributes({
            latitude: parseFloat(result.lat).toFixed(4),
            longitude: parseFloat(result.lon).toFixed(4),
            locationName: titleCase(searchTerm)
        });
        closeModal();
    };

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Widget Settings', 'under-the-weather')}>
                    <TextControl
                        label={__('Location Name', 'under-the-weather')}
                        value={locationName}
                        onChange={(val) => setAttributes({ locationName: val })}
                        help={__('e.g., Los Angeles, California', 'under-the-weather')}
                    />
                    <hr />
					<TextControl
					    label={__('Latitude', 'under-the-weather')}
					    value={latitude}
					    onChange={(val) => setAttributes({ latitude: val })}
					    onBlur={(e) => validateLatitude(e.target.value)}
					    help={__('e.g., 34.1195 (between -90 and 90)', 'under-the-weather')}
					/>
					<TextControl
					    label={__('Longitude', 'under-the-weather')}
					    value={longitude}
					    onChange={(val) => setAttributes({ longitude: val })}
					    onBlur={(e) => validateLongitude(e.target.value)}
					    help={__('e.g., -118.3005 (between -180 and 180)', 'under-the-weather')}
					/>
                    <Button variant="secondary" onClick={openModal}>
                        {__('Find Coordinates by Name', 'under-the-weather')}
                    </Button>
                    <hr />
					<ToggleControl
						label={__('Unit System', 'under-the-weather')}
						checked={unit === 'metric'}
						onChange={(isChecked) => setAttributes({ unit: isChecked ? 'metric' : 'imperial' })}
						help={unit === 'metric' ? __('Display in Celsius', 'under-the-weather') : __('Display in Fahrenheit', 'under-the-weather')}
					/>
                </PanelBody>
            </InspectorControls>

            {isModalOpen && (
                <Modal title={__('Find Coordinates', 'under-the-weather')} onRequestClose={closeModal}>
                    <TextControl
                        label={__('Enter Location Name', 'under-the-weather')}
                        value={searchTerm}
                        onChange={setSearchTerm}
                        onKeyDown={(e) => e.key === 'Enter' && findCoordinates()}
                    />
                    <Button variant="primary" onClick={findCoordinates} isBusy={isLoading}>
                        {__('Search', 'under-the-weather')}
                    </Button>
                    <div className="coordinator-finder-results">
                        {searchResults.map((result, index) => (
							<Button 
							    key={index} 
							    isTertiary
							    className="coordinator-finder-result-item"
							    onClick={() => selectLocation(result)}
							>
							    <strong>{result.display_name}</strong>
							    <br />
							    <small>Lat: {parseFloat(result.lat).toFixed(4)}, Lon: {parseFloat(result.lon).toFixed(4)}</small>
							</Button>
                        ))}
                    </div>
                </Modal>
            )}

            <div {...useBlockProps()}>
                <h2><Icon icon={weatherIcon} /> 
					{__(' Under The Weather Forecast', 'under-the-weather')}
				</h2>
                {locationName ? (
				    <>
						<p><Icon icon={locationIcon} />
						    {` ${__('Location:', 'under-the-weather')} `}
						    <strong>{locationName}</strong>
						</p>
						<p><Icon icon={degreesIcon} />
							{` ${__('Unit:', 'under-the-weather')} `}
							<strong>
							    {unit === 'metric' 
							        ? __('Celsius', 'under-the-weather') 
							        : __('Fahrenheit', 'under-the-weather')}
							</strong>
						</p>
					</>
                ) : (
					    <div className="utw-placeholder">
					        <p><Icon icon={wrenchIcon} />
		                    	<strong>{__('Add Location:', 'under-the-weather')}</strong>
    							{` ${__('Please configure the weather widget in the block settings.', 'under-the-weather')}`}
							</p>
					        <Button 
					            variant="primary" 
					            onClick={() => openGeneralSidebar('edit-post/block')}
					        >
					            {__('Open Settings', 'under-the-weather')}
					        </Button>
					    </div>
                )}
            </div>
        </>
    );
}
