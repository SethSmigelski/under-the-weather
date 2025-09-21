// js/admin-geocoder.js
document.addEventListener('DOMContentLoaded', function() {
    const geocoderTool = document.getElementById('utw-geocoder-tool');
    if (!geocoderTool) {
        return; 
    }
    const locationInput = document.getElementById('utw-location-input');
    const findButton = document.getElementById('utw-find-coords');
    const resultWrapper = document.getElementById('utw-result-wrapper');
    const historyList = document.getElementById('utw-history-list');
    let lastRequestTime = 0;

    // --- HISTORY FUNCTIONS ---
    let searchHistory = []; // Local cache of the history
    const MAX_HISTORY = 5;
	
	// Add newlines and indentation back to saved widgets to display nicely
    function formatWidgetHtml(html) {
		return html
			//.replace('<div class="weather-widget"', '<div class="weather-widget"\n    ')
			.replace(' data-lat=', '\n     data-lat=')
			.replace(' data-lon=', '\n     data-lon=')  
			.replace(' data-location-name=', '\n     data-location-name=')
			.replace('>', '>\n');
	}

    function loadHistoryFromServer() {
        return fetch(ajaxurl + '?action=utw_get_search_history&nonce=' + utwGeocoderData.nonce)
            .then(response => {
				return response.json();
			})
            .then(data => {
                if (data.success) {
                    searchHistory = data.data || [];
                    renderHistory();
                    return searchHistory;
                } else {
                    console.error('Failed to load history from server');
                    searchHistory = [];
                    renderHistory();
                    return [];
                }
            })
            .catch(error => {
                console.error('Error loading history:', error);
                searchHistory = [];
                renderHistory();
                return [];
            });
    }

    function saveToHistoryAndServer(newItem) {
			
        // Add to local history first
        searchHistory.unshift(newItem);
        searchHistory = searchHistory.slice(0, MAX_HISTORY);
        
        // Update the UI immediately with local data
		console.log('UTW: Updated history:', searchHistory);
        renderHistory();
        
        // Save to server
        fetch(ajaxurl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'utw_save_search_history',
                nonce: utwGeocoderData.nonce,
                history: JSON.stringify(searchHistory)
            })
        })
		.then(response => response.json())
		.then(data => {
			console.log('UTW: Save response:', data);
		})
		.catch(error => {
            console.error('Error saving history to server:', error);
        });
    }

    function renderHistory() {
        if (!historyList) return;
        
        if (!searchHistory || searchHistory.length === 0) {
            historyList.innerHTML = '<p><em>No previous searches found.</em></p>';
            return;
        }
        
        historyList.innerHTML = searchHistory.map(item => `
            <div class="history-item">
                <p><strong>${escapeHtml(item.locationName)}</strong></p>
                <pre><code>${escapeHtml(formatWidgetHtml(item.widgetHtml))}</code></pre>
                <button type="button" class="button button-small copy-history-btn" data-clipboard-text="${escapeHtml(formatWidgetHtml(item.widgetHtml))}">Copy</button>
            </div>
        `).join('');
    }

    // --- EVENT LISTENERS ---
    if (findButton && locationInput) {
        locationInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                findButton.click(); 
            }
        });
        
        findButton.addEventListener('click', function() {
            const now = Date.now();
            if (now - lastRequestTime < 1000) {
                resultWrapper.innerHTML = '<p class="coordinate-finder-red-message">Please wait before making another search.</p>';
                return;
            }
            lastRequestTime = now;
            const locationQuery = locationInput.value.trim();
            if (!locationQuery || locationQuery.length < 2 || locationQuery.length > 100) {
                resultWrapper.innerHTML = '<p class="coordinate-finder-red-message">Please enter a location between 2-100 characters.</p>';
                return;
            }

            resultWrapper.innerHTML = '<p><em>Searching...</em></p>';
            const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&limit=1`;

            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok.');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.length > 0) {
                        const result = data[0];
                        const lat = parseFloat(result.lat).toFixed(4);
                        const lon = parseFloat(result.lon).toFixed(4);
                        const locationName = result.display_name;

                        // Generate the HTML div for the user
						const widgetHtml = `<div class="weather-widget" data-lat="${lat}" data-lon="${lon}" data-location-name="${locationQuery}"></div>`;

                        resultWrapper.innerHTML = `
                            <p><strong>Found:</strong> ${locationName} (${lat}, ${lon})</p>
                            <p>Copy the code below and paste it into your post or page.</p>
                            <pre class="weather-widget-coordinate-finder-pre"><code>${escapeHtml(formatWidgetHtml(widgetHtml))}</code></pre>
                            <button type="button" id="utw-copy-button" class="button button-primary">Copy Code</button>
                        `;
                        
                        // Add to history and save to server
                        saveToHistoryAndServer({ locationName: locationQuery, widgetHtml });

                        // Add click listener to the new copy button
                        document.getElementById('utw-copy-button').addEventListener('click', function() {
                            copyToClipboard(formatWidgetHtml(widgetHtml), this);
                        });

                    } else {
                        resultWrapper.innerHTML = '<p class="coordinate-finder-red-message">Location not found. Please try being more specific (e.g., "Los Angeles, CA").</p>';
                    }
                })
                .catch(error => {
                    console.error('Geocoding error:', error);
                    resultWrapper.innerHTML = '<p class="coordinate-finder-red-message">Could not connect to the geocoding service. Please try again later.</p>';
                });
        });
    }
    
    if (historyList) {
        // Use event delegation for copy buttons in the history list
        historyList.addEventListener('click', function(event) {
            if (event.target.classList.contains('copy-history-btn')) {
                const textToCopy = event.target.getAttribute('data-clipboard-text');
                copyToClipboard(textToCopy, event.target);
            }
        });
        
        // Load history from server on page load
        loadHistoryFromServer();
    }
    
    // Copy searches to clipboard
    function copyToClipboard(text, button) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => { 
                    button.textContent = button.id === 'utw-copy-button' ? 'Copy Code' : 'Copy'; 
                }, 2000);
            }).catch(() => {
                fallbackCopyTextToClipboard(text, button);
            });
        } else {
            fallbackCopyTextToClipboard(text, button);
        }
    }
    
    function fallbackCopyTextToClipboard(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            button.textContent = 'Copied!';
            setTimeout(() => { 
                button.textContent = button.id === 'utw-copy-button' ? 'Copy Code' : 'Copy'; 
            }, 2000);
        } catch (err) {
            button.textContent = 'Copy failed';
            setTimeout(() => { 
                button.textContent = button.id === 'utw-copy-button' ? 'Copy Code' : 'Copy'; 
            }, 2000);
        }
        
        document.body.removeChild(textArea);
    }

    // Helper function to escape HTML for display in a <pre> tag
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
