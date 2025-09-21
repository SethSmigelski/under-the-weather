// src/edit.js
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, Button, Modal, Icon } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';

export default function Edit({ attributes, setAttributes }) {
    const { locationName, latitude, longitude, unit } = attributes;
    const [isModalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
	const { openGeneralSidebar } = useDispatch('core/edit-post');
    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);
    const findCoordinates = () => {
        if (!searchTerm) return;
        setIsLoading(true);
        const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&limit=5`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                setSearchResults(data || []);
                setIsLoading(false);
            });
    };

	// Block Icons credits: Phosphor Icon Set - https://github.com/phosphor-icons/
	const weatherIcon = (
	  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
	    <path d="M164 68a80.4 80.4 0 0 0-18.46 2.15a60 60 0 0 0-6-7.42l7.57-10.82a12 12 0 0 0-19.66-13.77L119.87 49a59.9 59.9 0 0 0-22.26-5l-2.3-13a12 12 0 0 0-23.63 4.17l2.3 13a60 60 0 0 0-19.21 12.3l-10.86-7.61a12 12 0 0 0-13.77 19.66L41 80.11a59.5 59.5 0 0 0-5 22.25l-13 2.3a12 12 0 0 0 2.07 23.82a12.6 12.6 0 0 0 2.1-.18l13-2.3a59 59 0 0 0 3.44 7.25A56 56 0 0 0 84 228h80a80 80 0 0 0 0-160m-68 0a36 36 0 0 1 26.45 11.61a80.37 80.37 0 0 0-32.06 36.75A57 57 0 0 0 84 116a55.8 55.8 0 0 0-20.33 3.83A36 36 0 0 1 96 68m68 136H84a32 32 0 0 1 0-64h.28c-.11 1.1-.2 2.2-.26 3.3a12 12 0 0 0 24 1.4a56 56 0 0 1 1.74-11l.15-.55A56.06 56.06 0 1 1 164 204"/>
	  </svg>
	);
	const degreesIcon = (
	  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
	    <path d="M212 56a28 28 0 1 0 28 28a28 28 0 0 0-28-28m0 40a12 12 0 1 1 12-12a12 12 0 0 1-12 12m-84 57V88a8 8 0 0 0-16 0v65a32 32 0 1 0 16 0m-8 47a16 16 0 1 1 16-16a16 16 0 0 1-16 16m40-66V48a40 40 0 0 0-80 0v86a64 64 0 1 0 80 0m-40 98a48 48 0 0 1-27.42-87.4A8 8 0 0 0 96 138V48a24 24 0 0 1 48 0v90a8 8 0 0 0 3.42 6.56A48 48 0 0 1 120 232"/>
	  </svg>
	);
	const locationIcon = (
	  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
	    <path d="M128 60a44 44 0 1 0 44 44a44.05 44.05 0 0 0-44-44m0 64a20 20 0 1 1 20-20a20 20 0 0 1-20 20m0-112a92.1 92.1 0 0 0-92 92c0 77.36 81.64 135.4 85.12 137.83a12 12 0 0 0 13.76 0a259 259 0 0 0 42.18-39C205.15 170.57 220 136.37 220 104a92.1 92.1 0 0 0-92-92m31.3 174.71a249.4 249.4 0 0 1-31.3 30.18a249.4 249.4 0 0 1-31.3-30.18C80 167.37 60 137.31 60 104a68 68 0 0 1 136 0c0 33.31-20 63.37-36.7 82.71"/>
	  </svg>
	);
	const wrenchIcon = (
	  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
	    <path d="M230.47 67.5a12 12 0 0 0-19.26-4.32L172.43 99l-12.68-2.72L157 83.57l35.79-38.78a12 12 0 0 0-4.32-19.26a76.07 76.07 0 0 0-100.06 96.11l-57.49 52.54a5 5 0 0 0-.39.38a36 36 0 0 0 50.91 50.91l.38-.39l52.54-57.49A76.05 76.05 0 0 0 230.47 67.5M160 148a51.5 51.5 0 0 1-23.35-5.52a12 12 0 0 0-14.26 2.62l-58.08 63.56a12 12 0 0 1-17-17l63.55-58.07a12 12 0 0 0 2.62-14.26A51.5 51.5 0 0 1 108 96a52.06 52.06 0 0 1 52-52h.89l-25.72 27.87a12 12 0 0 0-2.91 10.65l5.66 26.35a12 12 0 0 0 9.21 9.21l26.35 5.66a12 12 0 0 0 10.65-2.91L212 95.12v.89A52.06 52.06 0 0 1 160 148"/>
	  </svg>
	);

    const selectLocation = (result) => {
        setAttributes({
            latitude: parseFloat(result.lat).toFixed(4),
            longitude: parseFloat(result.lon).toFixed(4),
            locationName: searchTerm,
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
                    />
                    <TextControl
                        label={__('Longitude', 'under-the-weather')}
                        value={longitude}
                        onChange={(val) => setAttributes({ longitude: val })}
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
                    <div className="coordinator-finder-results" style={{ marginTop: '20px' }}>
                        {searchResults.map((result, index) => (
                            <div key={index} style={{ marginBottom: '10px', padding: '10px', background: '#f0f0f0', cursor: 'pointer' }} onClick={() => selectLocation(result)}>
                                <strong>{result.display_name}</strong>
                                <br />
                                <small>Lat: {parseFloat(result.lat).toFixed(4)}, Lon: {parseFloat(result.lon).toFixed(4)}</small>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}

            <div {...useBlockProps()}>
                <p><Icon icon={weatherIcon} /> 
					<strong>{__(' Under The Weather Forecast', 'under-the-weather')}</strong>
				</p>
                {locationName ? (
				    <>
						<p><Icon icon={locationIcon} />
							{` ${__('Location:', 'under-the-weather')} ${locationName}`}
						</p>
						<p><Icon icon={degreesIcon} />
							{` ${__('Unit:', 'under-the-weather')} ${unit}`}
						</p>
					</>
                ) : (
					    <div className="utw-placeholder">
					        <p><Icon icon={wrenchIcon} />
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
