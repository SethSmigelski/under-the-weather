// src/edit.js
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl, Button, Modal, Icon } from '@wordpress/components';
import { useState } from '@wordpress/element';

export default function Edit({ attributes, setAttributes }) {
    const { locationName, latitude, longitude, unit } = attributes;
    const [isModalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
                <p>
					<Icon icon="sun" /> 
					<strong>{__(' Under The Weather Forecast', 'under-the-weather')}</strong>
				</p>
                {locationName ? (
                    <p><Icon icon="location-alt" />
						{` ${__('Location:', 'under-the-weather')} ${locationName}`}
					</p>
					<p><Icon icon="admin-settings" />
						{` ${__('Unit:', 'under-the-weather')} ${unit}`}
					</p>
					
                ) : (
					<p><Icon icon="megaphone" />
                    {` ${__('Please configure the weather widget in the block settings.', 'under-the-weather')}`}
					</p>
                )}
            </div>
        </>
    );
}
