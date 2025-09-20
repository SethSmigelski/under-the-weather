// js/admin-geocoder.js
document.addEventListener('DOMContentLoaded', function() {
    const locationInput = document.getElementById('utw-location-input');
    const findButton = document.getElementById('utw-find-coords');
    const resultWrapper = document.getElementById('utw-result-wrapper');
	const historyList = document.getElementById('utw-history-list');
	let lastRequestTime = 0;
	
    if (!findButton) return;

	// --- HISTORY FUNCTIONS ---
    let searchHistory = [];
	const MAX_HISTORY = 5;
	
	function getHistory() {
		return searchHistory;
	}
	
	function saveToHistory(newItem) {
		searchHistory.unshift(newItem);
		searchHistory = searchHistory.slice(0, MAX_HISTORY);
	}


    function renderHistory() {
        const history = getHistory();
        if (history.length === 0) {
            historyList.innerHTML = '<p><em>No previous searches found.</em></p>';
            return;
        }
        historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <p><strong>${escapeHtml(item.locationName)}</strong></p>
                <pre><code>${escapeHtml(item.widgetHtml)}</code></pre>
                <button type="button" class="button button-small copy-history-btn" data-clipboard-text="${escapeHtml(item.widgetHtml)}">Copy</button>
            </div>
        `).join('');
    }
	
	// --- EVENT LISTENERS ---
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

        // IMPORTANT: Nominatim requires a descriptive User-Agent. 
        // We can't set it directly in client-side JS, but their policy requires it.
        // Be mindful of their rate limits (1 request per second).
        // See: https://operations.osmfoundation.org/policies/nominatim/
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
                    const widgetHtml = 
`<div class="weather-widget" 
     data-lat="${lat}" 
     data-lon="${lon}" 
     data-location-name="${locationQuery}">
</div>`;

                    resultWrapper.innerHTML = `
                        <p><strong>Found:</strong> ${locationName} (${lat}, ${lon})</p>
                        <p>Copy the code below and paste it into your post or page.</p>
                        <pre class="weather-widget-coordinate-finder-pre"><code>${escapeHtml(widgetHtml)}</code></pre>
                        <button type="button" id="utw-copy-button" class="button button-primary">Copy Code</button>
                    `;
					
                    // Add to history and re-render the list
                    saveToHistory({ locationName, widgetHtml });
                    renderHistory();

                    // Add click listener to the new copy button
					document.getElementById('utw-copy-button').addEventListener('click', function() {
						copyToClipboard(widgetHtml, this);
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
	
	// Use event delegation for copy buttons in the history list
	historyList.addEventListener('click', function(event) {
		if (event.target.classList.contains('copy-history-btn')) {
			const textToCopy = event.target.getAttribute('data-clipboard-text');
			copyToClipboard(textToCopy, event.target);
		}
	});
	
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

    // Initial render of history on page load
    renderHistory();

});
