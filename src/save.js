// src/save.js
import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const blockProps = useBlockProps.save({
        className: 'weather-widget',
        'data-lat': attributes.latitude,
        'data-lon': attributes.longitude,
        'data-location-name': attributes.locationName,
        'data-unit': attributes.unit,
    });

    // The save function can be empty because the front-end JS will fill it.
    // This prevents a flash of "Loading..." text on page load.
    return <div {...blockProps}></div>;
}