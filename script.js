document.addEventListener('DOMContentLoaded', () => {
    const landingHero = document.getElementById('landing-hero');
    const dashboardContent = document.getElementById('dashboard-content');
    const viewContainer = document.getElementById('view');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const navLinks = document.querySelectorAll('header nav a');
    
    // --- 1. Content Definitions for Router ---
    // Kini ang mga sulod (HTML) sa matag page
    const homeContent = `
        <div class="grid">
            <div>
                <div class="card" style="margin-bottom: 20px;">
                    <h2>Welcome to AgroGuide</h2>
                    <p>AgroGuide gives practical crop guidelines, a planting calendar, a map of intervention points, and a personal notes manager.</p>
                </div>
                <div class="card" style="margin-bottom: 20px;">
                    <h2>Quick Tips</h2>
                    <ul>
                        <li>Soil test before planting</li>
                        <li>Use certified seeds</li>
                        <li>Rotate crops annually</li>
                    </ul>
                </div>
                <div class="card">
                    <h2>Weather & Market</h2>
                    <p class="muted">Search any city for live weather. Use the Weather page for full details and forecast.</p>
                    <div class="weather-card">
                        <div class="weather-left">
                            <span class="weather-temp">29.0 °C</span>
                            <div>
                                <input type="text" placeholder="City name" style="width: 150px; margin-bottom: 5px;">
                                <button>Get</button>
                            </div>
                        </div>
                        <div>
                            <strong>Rice: ₱30/kg</strong>
                            <p class="muted" style="margin: 0;">Market price (sample)</p>
                        </div>
                    </div>
                    <div class="forecast-grid">
                        <div class="forecast-item">Dec 1<br>29.0 °C</div>
                        <div class="forecast-item">Dec 2<br>27.8 °C</div>
                        <div class="forecast-item">Dec 3<br>26.7 °C</div>
                    </div>
                </div>
            </div>
            <div>
                <div class="card" style="margin-bottom: 20px;">
                    <h2>Map Snapshot</h2>
                    <div id="map"></div>
                    <p class="muted">Markers show demo farm locations; click Map page for full features.</p>
                </div>
                <div class="card">
                    <h2>Get Started</h2>
                    <ol>
                        <li>Login (simulate)</li>
                        <li>Explore guidelines</li>
                        <li>Add notes & sample data</li>
                    </ol>
                </div>
            </div>
        </div>
    `;

    const routes = {
        '/home': homeContent,
        '/guidelines': '<div class="card"><h2>Farming Guidelines</h2><p>Here you will find detailed guides on soil preparation, planting schedules, pest control, and sustainable practices. Start by selecting a crop from the menu.</p></div>',
        '/calendar': '<div class="card"><h2>Crop Calendar</h2><p>View the optimal planting and harvesting calendar for various crops in your region. This tool helps you plan your season effectively.</p></div>',
        '/map': `<div class="card"><h2>Interactive Map</h2><div id="map" style="height: 500px; border-radius: 10px;"></div><p>This map shows farm boundaries, soil data layers, and intervention points. Use the zoom controls to explore.</p></div>`,
        '/notes': '<div class="card"><h2>My Personal Notes</h2><p>Your space to track your farm activities, expenses, and observations. <button>Add New Note</button></p></div>',
        '/weather': '<div class="card"><h2>Detailed Weather Forecast</h2><p>Extended 7-day forecast, hourly precipitation chances, and agricultural weather alerts vital for planning irrigation and spraying.</p></div>',
        '/login': '<div class="card"><h2>Login / Sign Up</h2><p>Please log in to access personalized features and save your data.</p><form><input type="email" placeholder="Email" required style="margin-bottom: 10px;"><input type="password" placeholder="Password" required style="margin-bottom: 15px;"><button type="submit">Log In</button></form></div>'
    };


    // --- 2. Router Function ---
    const router = (path) => {
        const content = routes[path] || routes['/home']; 
        
        // I-display ang content sa #view container
        viewContainer.innerHTML = content;

        // I-highlight ang active link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${path}`) {
                link.classList.add('active');
            }
        });
        
        // Handle special case: Initialize Map if on /map or /home
        if (path === '/map' || path === '/home') {
            // Check if Leaflet is loaded before initializing map
            if (window.L) {
                // Leaflet Map initialization (Example coordinates: Manila Bay)
                const mapId = (path === '/map') ? 'map' : viewContainer.querySelector('#map').id;
                
                // Clear map content first to avoid double initialization
                document.getElementById(mapId).innerHTML = '';

                const map = L.map(mapId).setView([14.5995, 120.9842], 12); 

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);

                // Add a marker for demo
                L.marker([14.65, 121.03]).addTo(map)
                    .bindPopup("Demo Farm Location.")
                    .openPopup();
            }
        }
    };

    // --- 3. Initial State Check & Page Switching Logic ---
    const currentHash = window.location.hash.substring(1);

    const showDashboard = (path) => {
        landingHero.style.display = 'none';
        dashboardContent.style.display = 'block';
        router(path);
    }
    
    const showLanding = () => {
        landingHero.style.display = 'flex';
        dashboardContent.style.display = 'none';
    }


    // Check if user is coming from an external link or reloaded page with a hash
    if (currentHash && currentHash !== '/') {
        showDashboard(currentHash);
    } else {
        showLanding();
    }
    
    // Event listener para sa Get Started button
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            window.location.hash = '/home'; // Direct to Home
        });
    }

    // --- 4. Navigation/Hash Change Listener ---
    window.addEventListener('hashchange', () => {
        const newPath = window.location.hash.substring(1); 
        
        if (newPath === '' || newPath === '/') {
            showLanding();
        } else {
            showDashboard(newPath);
        }
    });
});