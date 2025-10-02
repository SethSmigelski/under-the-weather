// js/admin-geocoder.js
document.addEventListener('DOMContentLoaded', function() {
	
    
    // ===================================================================
    // EXPIRATION SLIDER - Runs on all admin pages
    // ===================================================================
	
	// --- Logic to prepare the top save button for styling ---
	const topSaveBtn = document.getElementById('utw-expiration-save-btn');
	if (topSaveBtn) {
		// Find the parent table cell (td) and table row (tr)
		const parentTd = topSaveBtn.closest('td');
		const parentTr = topSaveBtn.closest('tr');
	
		if (parentTd && parentTr) {
			// 1. Add an ID to the table row for easy CSS targeting
			parentTr.id = 'utw-expiration-save-btn-wrap';
	
			// 2. Find and remove the empty label cell (th)
			const thLabel = parentTr.querySelector('th');
			if (thLabel) {
				thLabel.remove();
			}
			
			// 3. Add the colspan="2" attribute to the button's cell
			parentTd.setAttribute('colspan', '2');
		}
	}
	
	
    const expirationSlider = document.getElementById('utw-expiration-slider');
    const expirationValueDisplay = document.getElementById('utw-expiration-value');
    const unsavedChangesMessage = document.getElementById('utw-unsaved-changes');
    const expirationSaveBtn = document.getElementById('utw-expiration-save-btn');
	const minCacheNotice = document.getElementById('utw-min-cache-notice'); 

    if (expirationSlider && expirationValueDisplay) {
		const originalValue = expirationSlider.getAttribute('data-original-value');
		
		// Update display value in real-time as slider moves
		expirationSlider.addEventListener('input', function() {
			
			// Show the special notice if the user drags the slider to 0
			if (parseFloat(this.value) === 0) {
				minCacheNotice.style.display = 'block';
			} else {
				minCacheNotice.style.display = 'none';
			}
			
			// Enforce minimum of 0.5
			let value = parseFloat(this.value);
			if (value < 0.5) {
				value = 0.5;
				this.value = 0.5;
			}
			
			expirationValueDisplay.textContent = value;
			
			// Show/hide unsaved changes message based on whether value changed
			if (unsavedChangesMessage) {
				if (String(value) !== originalValue) {
					unsavedChangesMessage.style.display = 'inline';
				} else {
					unsavedChangesMessage.style.display = 'none';
				}
			}
		});
		
		// Additional validation on change (when user releases the slider)
		expirationSlider.addEventListener('change', function() {
			let value = parseFloat(this.value);
			if (value < 0.5) {
				this.value = 0.5;
				expirationValueDisplay.textContent = '0.5';
			}
		});
		
		// Hide unsaved changes message when the upper save button is clicked
		if (expirationSaveBtn) {
			expirationSaveBtn.addEventListener('click', function() {
				if (unsavedChangesMessage) {
					unsavedChangesMessage.style.display = 'none';
				}
			});
		}
		
		// Also hide message if the main (bottom) form submit button is clicked
		const mainSubmitBtn = document.querySelector('input[type="submit"][name="submit"]');
		if (mainSubmitBtn && mainSubmitBtn.id !== 'utw-expiration-save-btn') {
			mainSubmitBtn.addEventListener('click', function() {
				if (unsavedChangesMessage) {
					unsavedChangesMessage.style.display = 'none';
				}
			});
		}
	}

    // ===================================================================
    // GEOCODER TOOL - Only runs when the tool exists on the page
    // ===================================================================	
	
    const geocoderTool = document.getElementById('utw-geocoder-tool');
    if (!geocoderTool) {
        return; // Exit only AFTER checking for the expiration slider
    }
    
    const locationInput = document.getElementById('utw-location-input');
    const findButton = document.getElementById('utw-find-coords');
    const resultWrapper = document.getElementById('utw-result-wrapper');
    const historyList = document.getElementById('utw-history-list');
    let lastRequestTime = 0;

    // --- HISTORY FUNCTIONS ---
    let searchHistory = [];
    const MAX_HISTORY = 5;
	
	// Add newlines and indentation back to saved widgets to display nicely
    function formatWidgetHtml(html) {
		return html
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
        searchHistory.unshift(newItem);
        searchHistory = searchHistory.slice(0, MAX_HISTORY);
        
        console.log('UTW: Updated history:', searchHistory);
        renderHistory();
        
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

						const widgetHtml = `<div class="weather-widget" data-lat="${lat}" data-lon="${lon}" data-location-name="${locationQuery}"></div>`;

                        resultWrapper.innerHTML = `
                            <p><strong>Found:</strong> ${locationName} (${lat}, ${lon})</p>
                            <p>Copy the code below and paste it into your post or page.</p>
                            <pre class="weather-widget-coordinate-finder-pre"><code>${escapeHtml(formatWidgetHtml(widgetHtml))}</code></pre>
                            <button type="button" id="utw-copy-button" class="button button-primary">Copy Code</button>
                        `;
                        
                        saveToHistoryAndServer({ locationName: locationQuery, widgetHtml });

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
        historyList.addEventListener('click', function(event) {
            if (event.target.classList.contains('copy-history-btn')) {
                const textToCopy = event.target.getAttribute('data-clipboard-text');
                copyToClipboard(textToCopy, event.target);
            }
        });
        
        loadHistoryFromServer();
    }
    
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

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
