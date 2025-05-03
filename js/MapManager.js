/**
 * MapManager.js - Enhanced map system for Maplewood Lane
 * Adds fog of war, time-based icons, map pins, unlockable locations, and more
 */

class MapManager {
    constructor(game) {
        this.game = game;
        this.minimap = document.getElementById('minimap');
        this.fullMap = document.getElementById('fullMap');
        this.mapScale = 0.2; // Scale for minimap
        this.mapElements = {
            player: null,
            houses: [],
            neighbors: [],
            items: [],
            pins: [],
            unlockables: []
        };

        // Map zoom properties
        this.mapZoom = 1;
        this.maxZoom = 2;
        this.minZoom = 0.5;
        this.zoomStep = 0.25;
        
        // Fog of war properties
        this.fogEnabled = true;
        this.fogGrid = [];
        this.fogCellSize = 40; // Size of each fog cell in pixels
        this.playerVisionRadius = 100; // How far the player can see through fog
        
        // Map pins (player notes)
        this.pins = [];
        
        // Map locations data
        this.mapLocations = [
            {
                id: "mrs_finch_house",
                name: "Mrs. Finch's House",
                coordinates: { x: 150, y: 150 },
                discovered: true, // Default locations start discovered
                visibleTimes: ["morning", "afternoon", "evening", "night"],
                clueRelated: [],
                notes: []
            },
            {
                id: "jake_lila_house",
                name: "Jake & Lila's House",
                coordinates: { x: 300, y: 150 },
                discovered: true,
                visibleTimes: ["morning", "afternoon", "evening", "night"],
                clueRelated: [],
                notes: []
            },
            {
                id: "mr_arnold_house",
                name: "Mr. Arnold's House",
                coordinates: { x: 450, y: 150 },
                discovered: true,
                visibleTimes: ["morning", "afternoon", "evening", "night"],
                clueRelated: [],
                notes: []
            },
            {
                id: "iris_house",
                name: "Iris Bell's House",
                coordinates: { x: 600, y: 150 },
                discovered: true,
                visibleTimes: ["morning", "afternoon", "evening", "night"],
                clueRelated: [],
                notes: []
            },
            {
                id: "park",
                name: "Quiet Hollow Park",
                coordinates: { x: 400, y: 300 },
                discovered: true,
                visibleTimes: ["morning", "afternoon", "evening", "night"],
                clueRelated: [],
                notes: []
            },
            {
                id: "old_well",
                name: "Old Well",
                coordinates: { x: 425, y: 350 },
                discovered: false,
                visibleTimes: ["afternoon", "evening", "night"],
                clueRelated: ["Found a pendant half-buried near the old well"],
                notes: []
            },
            {
                id: "woods_path",
                name: "Hidden Woods Path",
                coordinates: { x: 650, y: 300 },
                discovered: false,
                visibleTimes: ["morning", "afternoon", "evening", "night"],
                requiredClue: "Drawing labeled 'Wednesday' but dated on Tuesday",
                notes: []
            },
            {
                id: "basement_entry",
                name: "Mr. Arnold's Basement",
                coordinates: { x: 450, y: 175 },
                discovered: false,
                visibleTimes: ["night"],
                requiredTrustLevel: 60,
                requiredCharacter: "mr_arnold",
                notes: []
            },
            {
                id: "hidden_garden",
                name: "Secret Garden",
                coordinates: { x: 300, y: 400 },
                discovered: false,
                visibleTimes: ["morning", "afternoon"],
                requiredClue: "Camille draws shadow figures, says 'Iris used to talk to them'",
                notes: []
            }
        ];
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize fog of war if enabled
        if (this.fogEnabled) {
            this.initializeFogOfWar();
        }
        
        // Load saved map data from localStorage if available
        this.loadMapData();
    }
    
    setupEventListeners() {
        // Map zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomMap('in'));
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomMap('out'));
        document.getElementById('resetZoom').addEventListener('click', () => this.resetMapZoom());
        
        // Map pin feature (right-click to add pin)
        this.fullMap.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showAddPinMenu(e);
        });
        
        // Toggle fog of war button
        const mapControls = document.querySelector('.map-controls');
        const toggleFogBtn = document.createElement('button');
        toggleFogBtn.className = 'map-control';
        toggleFogBtn.id = 'toggleFog';
        toggleFogBtn.textContent = 'Toggle Fog';
        toggleFogBtn.addEventListener('click', () => this.toggleFogOfWar());
        mapControls.appendChild(toggleFogBtn);
    }
    
    /**
     * Initialize the fog of war grid
     */
    initializeFogOfWar() {
        // Create fog overlay for full map
        const fogOverlay = document.createElement('div');
        fogOverlay.className = 'fog-overlay';
        this.fullMap.appendChild(fogOverlay);
        
        // Calculate grid size based on map dimensions
        const mapWidth = this.fullMap.clientWidth;
        const mapHeight = this.fullMap.clientHeight;
        
        const cols = Math.ceil(mapWidth / this.fogCellSize);
        const rows = Math.ceil(mapHeight / this.fogCellSize);
        
        // Create fog grid cells
        for (let row = 0; row < rows; row++) {
            this.fogGrid[row] = [];
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'fog-cell';
                cell.style.width = `${this.fogCellSize}px`;
                cell.style.height = `${this.fogCellSize}px`;
                cell.style.left = `${col * this.fogCellSize}px`;
                cell.style.top = `${row * this.fogCellSize}px`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                fogOverlay.appendChild(cell);
                this.fogGrid[row][col] = {
                    element: cell,
                    discovered: false
                };
            }
        }
    }
    
    /**
     * Update fog of war based on player position
     */
    updateFogOfWar() {
        if (!this.fogEnabled || !this.game.player) return;
        
        const playerPos = {
            x: this.game.player.offsetLeft + this.game.player.offsetWidth / 2,
            y: this.game.player.offsetTop + this.game.player.offsetHeight / 2
        };
        
        // Calculate which grid cells to reveal
        const centerCol = Math.floor(playerPos.x / this.fogCellSize);
        const centerRow = Math.floor(playerPos.y / this.fogCellSize);
        const revealRadius = Math.ceil(this.playerVisionRadius / this.fogCellSize);
        
        for (let row = 0; row < this.fogGrid.length; row++) {
            for (let col = 0; col < this.fogGrid[row].length; col++) {
                // Calculate distance from player to cell center
                const cellCenterX = col * this.fogCellSize + this.fogCellSize / 2;
                const cellCenterY = row * this.fogCellSize + this.fogCellSize / 2;
                
                const distSq = Math.pow(cellCenterX - playerPos.x, 2) + 
                                Math.pow(cellCenterY - playerPos.y, 2);
                
                // If within vision radius, mark as discovered
                if (distSq <= this.playerVisionRadius * this.playerVisionRadius) {
                    if (!this.fogGrid[row][col].discovered) {
                        this.fogGrid[row][col].discovered = true;
                        this.fogGrid[row][col].element.classList.add('discovered');
                        this.fogGrid[row][col].element.style.transition = 'opacity 1s ease';
                        
                        // Reveal nearby special locations if player is close enough
                        this.checkNearbyLocations(cellCenterX, cellCenterY);
                    }
                }
            }
        }
        
        // Save discovered areas to localStorage
        this.saveMapData();
    }
    
    /**
     * Check if any special (undiscovered) locations are near the player
     * Potentially reveal them based on requirements
     */
    checkNearbyLocations(x, y) {
        this.mapLocations.forEach(location => {
            if (!location.discovered) {
                const dist = Math.sqrt(
                    Math.pow(location.coordinates.x - x, 2) + 
                    Math.pow(location.coordinates.y - y, 2)
                );
                
                // If player is close to a location
                if (dist < this.playerVisionRadius) {
                    // Check if location can be discovered
                    if (this.canDiscoverLocation(location)) {
                        this.discoverLocation(location.id);
                    }
                }
            }
        });
    }
    
    /**
     * Check if a location meets requirements to be discovered
     */
    canDiscoverLocation(location) {
        // Check clue requirement
        if (location.requiredClue && !this.game.foundClues.has(location.requiredClue)) {
            return false;
        }
        
        // Check trust level requirement
        if (location.requiredTrustLevel) {
            const character = location.requiredCharacter || 'general';
            const trustLevel = character === 'general' 
                ? this.game.trust 
                : this.game.dialogueManager.getTrustLevel(location.requiredCharacter);
                
            if (trustLevel < location.requiredTrustLevel) {
                return false;
            }
        }
        
        // Check if location is visible at current time
        const currentTime = this.game.currentTimeOfDay;
        if (location.visibleTimes && !location.visibleTimes.includes(currentTime)) {
            return false;
        }
        
        // All checks passed
        return true;
    }
    
    /**
     * Toggle fog of war visibility
     */
    toggleFogOfWar() {
        this.fogEnabled = !this.fogEnabled;
        
        const fogOverlay = document.querySelector('.fog-overlay');
        if (fogOverlay) {
            fogOverlay.classList.toggle('hidden', !this.fogEnabled);
        }
        
        document.getElementById('toggleFog').textContent = 
            this.fogEnabled ? 'Hide Fog' : 'Show Fog';
    }
    
    /**
     * Show menu to add a pin at the clicked location
     */
    showAddPinMenu(event) {
        // Get map-relative coordinates
        const rect = this.fullMap.getBoundingClientRect();
        const x = (event.clientX - rect.left) / this.mapZoom;
        const y = (event.clientY - rect.top) / this.mapZoom;
        
        // Remove any existing pin menu
        const existingMenu = document.querySelector('.pin-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Create pin menu
        const menu = document.createElement('div');
        menu.className = 'pin-menu';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        
        menu.innerHTML = `
            <div class="pin-menu-header">Add Map Pin</div>
            <textarea class="pin-note" placeholder="Enter note or observation..."></textarea>
            <div class="pin-colors">
                <div class="pin-color" style="background-color: #e74c3c;" data-color="red"></div>
                <div class="pin-color" style="background-color: #3498db;" data-color="blue"></div>
                <div class="pin-color" style="background-color: #2ecc71;" data-color="green"></div>
                <div class="pin-color" style="background-color: #f39c12;" data-color="yellow"></div>
                <div class="pin-color" style="background-color: #9b59b6;" data-color="purple"></div>
            </div>
            <div class="pin-actions">
                <button class="add-pin-btn">Add Pin</button>
                <button class="cancel-pin-btn">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Select first color by default
        menu.querySelector('.pin-color').classList.add('selected');
        
        // Add event listeners
        menu.querySelector('.add-pin-btn').addEventListener('click', () => {
            const note = menu.querySelector('.pin-note').value;
            const color = menu.querySelector('.pin-color.selected').dataset.color;
            this.addPin(x, y, note, color);
            menu.remove();
        });
        
        menu.querySelector('.cancel-pin-btn').addEventListener('click', () => {
            menu.remove();
        });
        
        // Color selection
        menu.querySelectorAll('.pin-color').forEach(colorEl => {
            colorEl.addEventListener('click', () => {
                menu.querySelectorAll('.pin-color').forEach(el => el.classList.remove('selected'));
                colorEl.classList.add('selected');
            });
        });
        
        // Close menu if clicking outside
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== menu) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }
    
    /**
     * Add a pin to the map
     */
    addPin(x, y, note, color = 'red') {
        const pinId = Date.now().toString();
        const pin = {
            id: pinId,
            x: x,
            y: y,
            note: note,
            color: color
        };
        
        this.pins.push(pin);
        
        // Create visual pin element
        const pinElement = document.createElement('div');
        pinElement.className = 'map-pin';
        pinElement.dataset.pinId = pinId;
        pinElement.style.left = `${x}px`;
        pinElement.style.top = `${y}px`;
        pinElement.style.backgroundColor = this.getColorHex(color);
        
        // Add note text and delete button
        if (note) {
            const noteText = document.createElement('div');
            noteText.className = 'pin-note-text';
            noteText.textContent = note;
            pinElement.appendChild(noteText);
        }
        
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'pin-delete';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deletePin(pinId);
        });
        
        pinElement.appendChild(deleteBtn);
        this.fullMap.appendChild(pinElement);
        
        // Show notification
        this.game.showNotification('Map pin added');
        
        // Save pins to localStorage
        this.saveMapData();
    }
    
    /**
     * Delete a pin from the map
     */
    deletePin(pinId) {
        // Remove pin from array
        this.pins = this.pins.filter(pin => pin.id !== pinId);
        
        // Remove pin element
        const pinElement = document.querySelector(`.map-pin[data-pin-id="${pinId}"]`);
        if (pinElement) {
            pinElement.remove();
        }
        
        // Save pins to localStorage
        this.saveMapData();
    }
    
    /**
     * Get hex color from color name
     */
    getColorHex(colorName) {
        const colors = {
            'red': '#e74c3c',
            'blue': '#3498db',
            'green': '#2ecc71',
            'yellow': '#f39c12',
            'purple': '#9b59b6'
        };
        
        return colors[colorName] || colors.red;
    }
    
    /**
     * Save map data to localStorage
     */
    saveMapData() {
        // Don't save if in a test/demo environment
        if (window.location.pathname.includes('test') || 
            window.location.pathname.includes('demo')) {
            return;
        }
        
        // Create a fog discovery state (simplified array of discovered cells)
        const fogDiscoveryState = [];
        for (let row = 0; row < this.fogGrid.length; row++) {
            for (let col = 0; col < this.fogGrid[row].length; col++) {
                if (this.fogGrid[row][col].discovered) {
                    fogDiscoveryState.push(`${row}-${col}`);
                }
            }
        }
        
        // Locations with discovered status
        const locationsSaved = this.mapLocations.map(loc => ({
            id: loc.id,
            discovered: loc.discovered
        }));
        
        // Save to localStorage
        const mapData = {
            fogDiscovery: fogDiscoveryState,
            pins: this.pins,
            locations: locationsSaved
        };
        
        localStorage.setItem('quietHollow_mapData', JSON.stringify(mapData));
    }
    
    /**
     * Load map data from localStorage
     */
    loadMapData() {
        // Don't load if in a test/demo environment
        if (window.location.pathname.includes('test') || 
            window.location.pathname.includes('demo')) {
            return;
        }
        
        const savedData = localStorage.getItem('quietHollow_mapData');
        if (!savedData) return;
        
        try {
            const mapData = JSON.parse(savedData);
            
            // Restore fog discovery state
            if (mapData.fogDiscovery && mapData.fogDiscovery.length) {
                mapData.fogDiscovery.forEach(cellKey => {
                    const [row, col] = cellKey.split('-').map(Number);
                    if (this.fogGrid[row] && this.fogGrid[row][col]) {
                        this.fogGrid[row][col].discovered = true;
                        this.fogGrid[row][col].element.classList.add('discovered');
                    }
                });
            }
            
            // Restore pins
            if (mapData.pins && mapData.pins.length) {
                // Clear existing pins
                this.pins = [];
                document.querySelectorAll('.map-pin').forEach(pin => pin.remove());
                
                // Add loaded pins
                mapData.pins.forEach(pin => {
                    this.addPin(pin.x, pin.y, pin.note, pin.color);
                });
            }
            
            // Restore discovered locations
            if (mapData.locations && mapData.locations.length) {
                mapData.locations.forEach(savedLoc => {
                    const location = this.mapLocations.find(loc => loc.id === savedLoc.id);
                    if (location) {
                        location.discovered = savedLoc.discovered;
                    }
                });
            }
            
            console.log('Map data loaded from localStorage');
        } catch (e) {
            console.error('Error loading map data:', e);
        }
    }
    
    /**
     * Discover a location by its ID
     */
    discoverLocation(locationId) {
        const location = this.mapLocations.find(loc => loc.id === locationId);
        if (location && !location.discovered) {
            location.discovered = true;
            
            // Update visual markers
            this.createFullMapMarkers();
            
            // Show notification
            this.game.showNotification(`Discovered ${location.name}!`);
            
            // Play discovery sound
            this.game.playSoundEffect('discovery');
            
            // Animate the newly discovered location marker
            const marker = document.querySelector(`.map-marker[data-location-id="${locationId}"]`);
            if (marker) {
                marker.classList.add('unlocking');
                setTimeout(() => {
                    marker.classList.remove('unlocking');
                }, 2000);
            }
            
            // Save to localStorage
            this.saveMapData();
            
            return true;
        }
        return false;
    }
    
    /**
     * Update location states based on current time of day
     */
    updateLocations() {
        const currentTime = this.game.currentTimeOfDay;
        
        // Update each location's visibility based on time
        this.mapLocations.forEach(location => {
            if (!location.discovered) return;
            
            const marker = document.querySelector(`.map-marker[data-location-id="${location.id}"]`);
            if (!marker) return;
            
            // Check if location is active at current time
            const isActive = location.visibleTimes.includes(currentTime);
            
            // Update marker visibility
            if (isActive) {
                marker.style.display = 'block';
                
                // Check if this location has special time-based effects
                if (location.id === 'old_well' && currentTime === 'night') {
                    marker.querySelector('.marker-icon').classList.add('active');
                } else if (location.id === 'basement_entry' && currentTime === 'night') {
                    marker.querySelector('.marker-icon').classList.add('active');
                } else {
                    marker.querySelector('.marker-icon').classList.remove('active');
                }
            } else {
                marker.style.display = 'none';
            }
        });
    }
    
    /**
     * Create markers for all discovered locations on the full map
     */
    createFullMapMarkers() {
        // Remove existing markers
        this.fullMap.querySelectorAll('.map-marker').forEach(marker => marker.remove());
        
        // Add markers for discovered locations
        this.mapLocations.forEach(location => {
            if (!location.discovered) return;
            
            const marker = document.createElement('div');
            marker.className = 'map-marker';
            marker.dataset.locationId = location.id;
            marker.style.left = `${location.coordinates.x}px`;
            marker.style.top = `${location.coordinates.y}px`;
            
            // Marker name label
            const nameLabel = document.createElement('div');
            nameLabel.className = 'marker-name';
            nameLabel.textContent = location.name;
            marker.appendChild(nameLabel);
            
            // Marker icon based on location type
            const icon = document.createElement('div');
            icon.className = 'marker-icon';
            
            // Add type-specific class
            if (location.id.includes('house')) {
                icon.classList.add('house-icon');
            } else if (location.id.includes('park')) {
                icon.classList.add('park-icon');
            } else if (location.id.includes('well')) {
                icon.classList.add('well-icon');
            } else if (location.id.includes('path')) {
                icon.classList.add('path-icon');
            } else if (location.id.includes('basement')) {
                icon.classList.add('basement-icon');
            } else if (location.id.includes('garden')) {
                icon.classList.add('garden-icon');
            }
            
            marker.appendChild(icon);
            
            // Add click handler to focus on location
            marker.addEventListener('click', () => {
                this.game.focusOnLocation('location', location.id);
            });
            
            this.fullMap.appendChild(marker);
        });
        
        // Re-apply any pins
        this.pins.forEach(pin => {
            this.addPin(pin.x, pin.y, pin.note, pin.color);
        });
    }
    
    /**
     * Create ambient effect
     */
    createAmbientEffect(type, x, y) {
        if (type === 'firefly') {
            for (let i = 0; i < 5; i++) {
                const firefly = document.createElement('div');
                firefly.className = 'ambient-effect firefly';
                
                // Randomize position near the specified coordinates
                const offsetX = Math.random() * 100 - 50;
                const offsetY = Math.random() * 100 - 50;
                
                firefly.style.left = `${x + offsetX}px`;
                firefly.style.top = `${y + offsetY}px`;
                firefly.style.animationDelay = `${Math.random() * 2}s`;
                
                this.fullMap.appendChild(firefly);
                
                // Remove after animation completes
                setTimeout(() => {
                    if (firefly.parentNode) {
                        firefly.parentNode.removeChild(firefly);
                    }
                }, 10000);
            }
        } else if (type === 'audio') {
            const audioCue = document.createElement('div');
            audioCue.className = 'ambient-effect audio-cue';
            audioCue.style.left = `${x}px`;
            audioCue.style.top = `${y}px`;
            
            this.fullMap.appendChild(audioCue);
            
            // Remove after animation completes
            setTimeout(() => {
                if (audioCue.parentNode) {
                    audioCue.parentNode.removeChild(audioCue);
                }
            }, 3000);
        }
    }
    
    /**
     * Update the map system - called by game loop
     */
    update() {
        // Update player position on map
        this.updatePlayerPosition();
        
        // Update fog of war
        if (this.fogEnabled) {
            this.updateFogOfWar();
        }
        
        // Update location markers based on time
        this.updateLocations();
        
        // Check for fast travel eligibility
        if (this.game.foundClues && this.game.foundClues.size >= 10) { // Enable fast travel after finding several clues
            this.enableFastTravel();
        }
        
        // Occasionally spawn ambient effects (fireflies at night)
        if (this.game.currentTimeOfDay === 'night' && Math.random() < 0.01) {
            const x = Math.random() * this.fullMap.clientWidth;
            const y = Math.random() * this.fullMap.clientHeight;
            this.createAmbientEffect('firefly', x, y);
        }
    }
    
    /**
     * Update the player's position on the map
     */
    updatePlayerPosition() {
        if (!this.game.player) return;
        
        // Get player position
        const playerX = this.game.player.offsetLeft + this.game.player.offsetWidth / 2;
        const playerY = this.game.player.offsetTop + this.game.player.offsetHeight / 2;
        
        // Create player marker on full map if it doesn't exist
        if (!this.mapElements.player) {
            const playerMarker = document.createElement('div');
            playerMarker.className = 'player-marker';
            this.fullMap.appendChild(playerMarker);
            this.mapElements.player = playerMarker;
        }
        
        // Create player marker on minimap if it doesn't exist
        if (!this.minimapPlayer) {
            const minimapPlayer = document.createElement('div');
            minimapPlayer.className = 'minimap-player';
            this.minimap.appendChild(minimapPlayer);
            this.minimapPlayer = minimapPlayer;
        }
        
        // Update full map player position
        this.mapElements.player.style.left = `${playerX}px`;
        this.mapElements.player.style.top = `${playerY}px`;
        
        // Update minimap player position
        this.minimapPlayer.style.left = `${playerX * this.mapScale}px`;
        this.minimapPlayer.style.top = `${playerY * this.mapScale}px`;
        
        // Update time indicator
        document.getElementById('mapTimeIndicator').textContent = 
            this.game.currentTimeOfDay.charAt(0).toUpperCase() + 
            this.game.currentTimeOfDay.slice(1);
    }
    
    /**
     * Zoom the full map in or out
     */
    zoomMap(direction) {
        if (direction === 'in' && this.mapZoom < this.maxZoom) {
            this.mapZoom += this.zoomStep;
        } else if (direction === 'out' && this.mapZoom > this.minZoom) {
            this.mapZoom -= this.zoomStep;
        }
        
        this.fullMap.style.transform = `scale(${this.mapZoom})`;
    }
    
    /**
     * Reset map zoom to default
     */
    resetMapZoom() {
        this.mapZoom = 1;
        this.fullMap.style.transform = 'scale(1)';
    }

    /**
     * Enable fast travel functionality if all main locations are discovered
     */
    enableFastTravel() {
        // Check if all main locations are discovered
        const mainLocations = this.mapLocations.filter(loc => 
            loc.id.includes('house') || loc.id.includes('park')
        );
        
        const allDiscovered = mainLocations.every(loc => loc.discovered);
        
        if (allDiscovered) {
            // Add fast travel button to map controls
            const mapControls = document.querySelector('.map-controls');
            
            if (!document.getElementById('fastTravelBtn')) {
                const fastTravelBtn = document.createElement('button');
                fastTravelBtn.className = 'map-control';
                fastTravelBtn.id = 'fastTravelBtn';
                fastTravelBtn.textContent = 'Fast Travel';
                fastTravelBtn.addEventListener('click', () => this.showFastTravelModal());
                mapControls.appendChild(fastTravelBtn);
            }
            
            return true;
        }
        
        return false;
    }

    /**
     * Show the fast travel modal
     */
    showFastTravelModal() {
        // Don't allow fast travel at night
        if (this.game.currentTimeOfDay === 'night') {
            this.game.showNotification("Fast travel is not available at night");
            return;
        }
        
        // Create modal if it doesn't exist
        if (!document.querySelector('.fast-travel-modal')) {
            const modal = document.createElement('div');
            modal.className = 'fast-travel-modal';
            
            modal.innerHTML = `
                <div class="fast-travel-content">
                    <div class="fast-travel-header">
                        <h2>Fast Travel</h2>
                        <button class="fast-travel-close">&times;</button>
                    </div>
                    <div class="fast-travel-body">
                        <p>Select a location to fast travel to:</p>
                        <div class="fast-travel-locations">
                            <!-- Locations will be populated dynamically -->
                        </div>
                    </div>
                    <div class="fast-travel-footer">
                        <div class="fast-travel-time">Current time: <span id="fast-travel-current-time">Morning</span></div>
                        <div class="fast-travel-controls">
                            <button class="fast-travel-button cancel">Cancel</button>
                            <button class="fast-travel-button" id="fast-travel-confirm" disabled>Travel</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add event listeners
            modal.querySelector('.fast-travel-close').addEventListener('click', () => this.closeFastTravelModal());
            modal.querySelector('.fast-travel-button.cancel').addEventListener('click', () => this.closeFastTravelModal());
            
            // Confirm button
            document.getElementById('fast-travel-confirm').addEventListener('click', () => {
                const selectedLocation = document.querySelector('.fast-travel-location.selected');
                if (selectedLocation) {
                    const locationId = selectedLocation.dataset.locationId;
                    this.fastTravelTo(locationId);
                    this.closeFastTravelModal();
                }
            });
        }
        
        // Update the time display
        document.getElementById('fast-travel-current-time').textContent = 
            this.game.currentTimeOfDay.charAt(0).toUpperCase() + 
            this.game.currentTimeOfDay.slice(1);
        
        // Populate locations
        this.populateFastTravelLocations();
        
        // Show modal
        const modal = document.querySelector('.fast-travel-modal');
        modal.classList.add('open');
        
        // Play sound effect
        this.game.playSoundEffect('page');
    }

    /**
     * Populate the fast travel locations list
     */
    populateFastTravelLocations() {
        const locationsContainer = document.querySelector('.fast-travel-locations');
        locationsContainer.innerHTML = '';
        
        // Add discovered locations
        this.mapLocations.forEach(location => {
            if (location.discovered) {
                // Check if location is available at current time
                const isAvailable = location.visibleTimes.includes(this.game.currentTimeOfDay);
                
                const locationEl = document.createElement('div');
                locationEl.className = `fast-travel-location ${isAvailable ? '' : 'disabled'}`;
                
                if (location.id.includes('house')) {
                    locationEl.classList.add('house');
                } else if (location.id.includes('park')) {
                    locationEl.classList.add('park');
                }
                
                locationEl.dataset.locationId = location.id;
                
                locationEl.innerHTML = `
                    <div class="fast-travel-icon"></div>
                    <div class="fast-travel-name">${location.name}</div>
                `;
                
                // If location is available, make it selectable
                if (isAvailable) {
                    locationEl.addEventListener('click', () => {
                        // Deselect any previously selected
                        document.querySelectorAll('.fast-travel-location.selected').forEach(el => {
                            el.classList.remove('selected');
                        });
                        
                        // Select this location
                        locationEl.classList.add('selected');
                        
                        // Enable confirm button
                        document.getElementById('fast-travel-confirm').disabled = false;
                    });
                }
                
                locationsContainer.appendChild(locationEl);
            }
        });
    }

    /**
     * Close the fast travel modal
     */
    closeFastTravelModal() {
        const modal = document.querySelector('.fast-travel-modal');
        if (modal) {
            modal.classList.remove('open');
        }
    }

    /**
     * Perform fast travel to a location
     */
    fastTravelTo(locationId) {
        const location = this.mapLocations.find(loc => loc.id === locationId);
        if (!location) return;
        
        // Get the position of the location
        const x = location.coordinates.x;
        const y = location.coordinates.y;
        
        // Move the player to that position
        this.game.movePlayerTo(x, y);
        
        // Show notification
        this.game.showNotification(`Fast traveled to ${location.name}`);
        
        // Play sound effect
        this.game.playSoundEffect('success');
        
        // Create some ambient effects
        setTimeout(() => {
            this.createAmbientEffect('audio', x, y);
        }, 500);
    }
}

// Export the MapManager class if we're in a module context
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapManager;
} 