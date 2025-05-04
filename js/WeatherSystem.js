/**
 * Weather System for Quiet Hollow
 * 
 * This system manages different weather conditions that affect gameplay,
 * visuals, and atmosphere in the game world.
 */

class WeatherSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.timeManager = gameManager ? gameManager.timeManager : null;
        this.currentWeather = 'clear';
        this.weatherIntensity = 0; // 0 to 1
        this.weatherDuration = 0;
        this.weatherTimer = 0;
        this.transitioningWeather = false;
        this.transitionDuration = 0;
        this.transitionTimer = 0;
        this.transitionStartIntensity = 0;
        this.transitionTargetIntensity = 0;
        this.targetWeather = '';
        
        this.weatherTypes = {
            'clear': {
                name: 'Clear',
                description: 'Clear skies with good visibility.',
                effectOnMovement: 0,
                effectOnVisibility: 0,
                visualEffects: [],
                audioEffects: [],
                particleEffects: [],
                lightingEffects: {
                    morning: { r: 255, g: 220, b: 180 },
                    afternoon: { r: 255, g: 255, b: 240 },
                    evening: { r: 255, g: 180, b: 120 },
                    night: { r: 20, g: 40, b: 80 }
                }
            },
            'cloudy': {
                name: 'Cloudy',
                description: 'Clouds cover the sky, casting soft shadows.',
                effectOnMovement: 0,
                effectOnVisibility: -0.1,
                visualEffects: ['softShadows', 'dimmedLight'],
                audioEffects: ['gentleWind'],
                particleEffects: [],
                lightingEffects: {
                    morning: { r: 220, g: 220, b: 220 },
                    afternoon: { r: 230, g: 230, b: 230 },
                    evening: { r: 200, g: 180, b: 160 },
                    night: { r: 15, g: 25, b: 45 }
                }
            },
            'rain': {
                name: 'Rain',
                description: 'Rainfall that dampens sounds and creates puddles.',
                effectOnMovement: -0.1,
                effectOnVisibility: -0.3,
                visualEffects: ['wetSurfaces', 'dimmedLight', 'puddles'],
                audioEffects: ['rainSounds', 'thunder'],
                particleEffects: ['raindrops', 'splashes'],
                lightingEffects: {
                    morning: { r: 180, g: 190, b: 210 },
                    afternoon: { r: 190, g: 190, b: 210 },
                    evening: { r: 150, g: 150, b: 180 },
                    night: { r: 10, g: 15, b: 35 }
                }
            },
            'fog': {
                name: 'Fog',
                description: 'Thick fog that limits visibility and creates mystery.',
                effectOnMovement: -0.05,
                effectOnVisibility: -0.6,
                visualEffects: ['fogFilter', 'blurredDistances', 'diffusedLight'],
                audioEffects: ['muffledSounds'],
                particleEffects: ['fogParticles'],
                lightingEffects: {
                    morning: { r: 230, g: 230, b: 240 },
                    afternoon: { r: 220, g: 220, b: 240 },
                    evening: { r: 200, g: 190, b: 210 },
                    night: { r: 40, g: 45, b: 70 }
                }
            },
            'storm': {
                name: 'Storm',
                description: 'Heavy rain, wind, and lightning that dramatically alter the environment.',
                effectOnMovement: -0.25,
                effectOnVisibility: -0.5,
                visualEffects: ['wetSurfaces', 'heavyDimming', 'puddles', 'swayingObjects'],
                audioEffects: ['heavyRain', 'strongWind', 'loudThunder'],
                particleEffects: ['heavyRaindrops', 'leaves', 'debris', 'lightning'],
                lightingEffects: {
                    morning: { r: 120, g: 130, b: 150 },
                    afternoon: { r: 130, g: 130, b: 150 },
                    evening: { r: 100, g: 100, b: 130 },
                    night: { r: 5, g: 10, b: 25 }
                }
            }
        };
        
        // Weather probability distribution by time of day (%)
        this.weatherProbabilities = {
            morning: {
                clear: 60,
                cloudy: 20,
                rain: 10,
                fog: 8,
                storm: 2
            },
            afternoon: {
                clear: 50,
                cloudy: 30,
                rain: 15,
                fog: 2,
                storm: 3
            },
            evening: {
                clear: 55,
                cloudy: 25,
                rain: 10,
                fog: 7,
                storm: 3
            },
            night: {
                clear: 65,
                cloudy: 15,
                rain: 8,
                fog: 10,
                storm: 2
            }
        };
        
        // DOM elements
        this.weatherContainer = document.createElement('div');
        this.weatherContainer.className = 'weather-container';
        
        // Weather-specific DOM elements
        this.rainContainer = document.createElement('div');
        this.rainContainer.className = 'rain-container';
        
        this.fogContainer = document.createElement('div');
        this.fogContainer.className = 'fog-container';
        
        this.lightningContainer = document.createElement('div');
        this.lightningContainer.className = 'lightning-container';
        
        this.weatherContainer.appendChild(this.rainContainer);
        this.weatherContainer.appendChild(this.fogContainer);
        this.weatherContainer.appendChild(this.lightningContainer);
        
        // Weather audio elements
        this.audioElements = {
            rain: new Audio('assets/audio/rain.mp3'),
            thunder: new Audio('assets/audio/thunder.mp3'),
            wind: new Audio('assets/audio/wind.mp3')
        };
        
        // Set audio loops
        this.audioElements.rain.loop = true;
        this.audioElements.wind.loop = true;
        
        // Event bindings
        this.onTimeChange = this.onTimeChange.bind(this);
    }
    
    /**
     * Initialize the weather system
     * @param {HTMLElement} gameContainer - The container to append weather effects to
     */
    init(gameContainer) {
        if (!gameContainer) {
            console.error('Weather system initialization failed: No game container provided');
            return;
        }
        
        gameContainer.appendChild(this.weatherContainer);
        
        // Generate initial random weather based on current time
        this.generateRandomWeather();
        
        // Connect to time system if available
        if (this.timeManager) {
            this.timeManager.addEventListener('timeChange', this.onTimeChange);
        }
        
        // Set update interval
        this.updateInterval = setInterval(() => this.update(), 1000 / 30); // 30fps update
        
        console.log('Weather system initialized');
    }
    
    /**
     * Update weather effects
     */
    update() {
        // Update weather timer
        this.weatherTimer += 1/30; // 1/30th of a second per update at 30fps
        
        // Handle weather transitions
        if (this.transitioningWeather) {
            this.transitionTimer += 1/30;
            const progress = Math.min(this.transitionTimer / this.transitionDuration, 1);
            
            // Use easeInOutQuad for smoother transition
            const eased = this.easeInOutQuad(progress);
            this.weatherIntensity = this.transitionStartIntensity + (this.transitionTargetIntensity - this.transitionStartIntensity) * eased;
            
            // Apply visual updates
            this.applyWeatherEffects();
            
            // Complete transition
            if (progress >= 1) {
                this.transitioningWeather = false;
                this.currentWeather = this.targetWeather;
                this.weatherIntensity = this.transitionTargetIntensity;
            }
        }
        
        // Check if current weather should end and transition to new weather
        if (this.weatherTimer >= this.weatherDuration && !this.transitioningWeather) {
            this.generateRandomWeather();
        }
        
        // Random lightning for storms
        if (this.currentWeather === 'storm' && Math.random() < 0.005) { // 0.5% chance per frame
            this.createLightningEffect();
        }
    }
    
    /**
     * Easing function for smooth transitions
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
    
    /**
     * Generate random weather based on time of day
     */
    generateRandomWeather() {
        const timeOfDay = this.timeManager ? this.timeManager.getTimeOfDay() : 'afternoon';
        const probabilities = this.weatherProbabilities[timeOfDay];
        
        // Generate random number from 0-100
        const rand = Math.random() * 100;
        
        // Determine weather type based on probability distribution
        let cumulativeProbability = 0;
        let selectedWeather = 'clear'; // Default
        
        for (const [weather, probability] of Object.entries(probabilities)) {
            cumulativeProbability += probability;
            if (rand <= cumulativeProbability) {
                selectedWeather = weather;
                break;
            }
        }
        
        // Set new weather duration (5-15 minutes game time)
        this.weatherDuration = 300 + Math.random() * 600;
        this.weatherTimer = 0;
        
        // Transition to new weather
        this.transitionToWeather(selectedWeather, 0.1 + Math.random() * 0.9, 5 + Math.random() * 10);
    }
    
    /**
     * Transition to a new weather type
     * @param {string} weatherType - Type of weather to transition to
     * @param {number} intensity - Intensity level (0-1)
     * @param {number} transitionTime - Time in seconds for the transition
     */
    transitionToWeather(weatherType, intensity, transitionTime) {
        if (!this.weatherTypes[weatherType]) {
            console.error(`Invalid weather type: ${weatherType}`);
            return;
        }
        
        this.transitioningWeather = true;
        this.targetWeather = weatherType;
        this.transitionStartIntensity = this.weatherIntensity;
        this.transitionTargetIntensity = intensity;
        this.transitionDuration = transitionTime;
        this.transitionTimer = 0;
        
        console.log(`Transitioning to ${weatherType} weather with intensity ${intensity}`);
    }
    
    /**
     * Apply weather effects based on current weather and intensity
     */
    applyWeatherEffects() {
        // Clear all weather effects first
        this.rainContainer.innerHTML = '';
        this.fogContainer.innerHTML = '';
        
        // Apply audio effects
        this.applyAudioEffects();
        
        // Apply visual effects based on weather type
        switch (this.currentWeather) {
            case 'rain':
            case 'storm':
                this.applyRainEffect();
                break;
                
            case 'fog':
                this.applyFogEffect();
                break;
                
            case 'cloudy':
                this.applyCloudyEffect();
                break;
        }
        
        // Apply lighting adjustments based on weather and time of day
        this.applyLightingEffects();
    }
    
    /**
     * Apply rain visual effects
     */
    applyRainEffect() {
        const intensity = this.weatherIntensity;
        const isStorm = this.currentWeather === 'storm';
        const dropCount = isStorm ? Math.floor(300 * intensity) : Math.floor(150 * intensity);
        
        this.rainContainer.style.opacity = intensity;
        
        // Create raindrops
        for (let i = 0; i < dropCount; i++) {
            const drop = document.createElement('div');
            drop.className = isStorm ? 'raindrop storm-drop' : 'raindrop';
            
            // Randomize drop properties
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            drop.style.width = isStorm ? `${1 + Math.random() * 2}px` : `${0.5 + Math.random() * 1}px`;
            drop.style.height = isStorm ? `${15 + Math.random() * 15}px` : `${10 + Math.random() * 10}px`;
            
            this.rainContainer.appendChild(drop);
        }
        
        // Add puddles if intensity is high enough
        if (intensity > 0.4) {
            const puddleCount = Math.floor(10 * intensity);
            for (let i = 0; i < puddleCount; i++) {
                // Implement puddle effect here...
            }
        }
    }
    
    /**
     * Apply fog visual effects
     */
    applyFogEffect() {
        const intensity = this.weatherIntensity;
        this.fogContainer.style.opacity = intensity;
        
        // Create fog layers
        for (let i = 0; i < 3; i++) {
            const fogLayer = document.createElement('div');
            fogLayer.className = 'fog-layer';
            
            fogLayer.style.opacity = 0.2 + (i * 0.1);
            fogLayer.style.animationDuration = `${80 - (i * 20)}s`;
            fogLayer.style.backgroundPosition = `${Math.random() * 100}% ${Math.random() * 100}%`;
            
            this.fogContainer.appendChild(fogLayer);
        }
    }
    
    /**
     * Apply cloudy visual effects
     */
    applyCloudyEffect() {
        // Implement cloud shadows or dimmed lighting here
        const intensity = this.weatherIntensity;
        document.documentElement.style.setProperty('--cloud-shadow-opacity', intensity * 0.3);
    }
    
    /**
     * Create lightning flash effect
     */
    createLightningEffect() {
        const flash = document.createElement('div');
        flash.className = 'lightning-flash';
        
        // Random flash properties
        const delay = Math.random() * 100;
        flash.style.animationDelay = `${delay}ms`;
        
        this.lightningContainer.appendChild(flash);
        
        // Play thunder sound with appropriate delay
        setTimeout(() => {
            const thunder = this.audioElements.thunder;
            thunder.currentTime = 0;
            thunder.volume = 0.5 + (this.weatherIntensity * 0.5);
            thunder.play();
        }, delay + 500 + Math.random() * 2000); // Delay thunder based on "distance"
        
        // Remove flash element after animation
        setTimeout(() => {
            if (this.lightningContainer.contains(flash)) {
                this.lightningContainer.removeChild(flash);
            }
        }, 1000);
    }
    
    /**
     * Apply audio effects based on weather
     */
    applyAudioEffects() {
        // Handle rain sound
        if (this.currentWeather === 'rain' || this.currentWeather === 'storm') {
            this.audioElements.rain.volume = this.weatherIntensity * 0.8;
            if (this.audioElements.rain.paused) {
                this.audioElements.rain.play().catch(e => console.log('Audio playback prevented:', e));
            }
        } else {
            this.audioElements.rain.volume = Math.max(0, this.audioElements.rain.volume - 0.05);
            if (this.audioElements.rain.volume <= 0.05) {
                this.audioElements.rain.pause();
            }
        }
        
        // Handle wind sound
        if (this.currentWeather === 'storm' || this.currentWeather === 'cloudy') {
            const windVolume = this.currentWeather === 'storm' ? this.weatherIntensity * 0.7 : this.weatherIntensity * 0.3;
            this.audioElements.wind.volume = windVolume;
            if (this.audioElements.wind.paused) {
                this.audioElements.wind.play().catch(e => console.log('Audio playback prevented:', e));
            }
        } else {
            this.audioElements.wind.volume = Math.max(0, this.audioElements.wind.volume - 0.05);
            if (this.audioElements.wind.volume <= 0.05) {
                this.audioElements.wind.pause();
            }
        }
    }
    
    /**
     * Apply lighting effects based on weather and time of day
     */
    applyLightingEffects() {
        if (!this.timeManager) return;
        
        const timeOfDay = this.timeManager.getTimeOfDay();
        const weatherType = this.weatherTypes[this.currentWeather];
        
        if (weatherType && weatherType.lightingEffects && weatherType.lightingEffects[timeOfDay]) {
            const baseLighting = weatherType.lightingEffects[timeOfDay];
            const intensity = this.weatherIntensity;
            
            // Create a filtered lighting that blends between clear weather and current weather type
            const clearLighting = this.weatherTypes.clear.lightingEffects[timeOfDay];
            const r = Math.round(clearLighting.r + (baseLighting.r - clearLighting.r) * intensity);
            const g = Math.round(clearLighting.g + (baseLighting.g - clearLighting.g) * intensity);
            const b = Math.round(clearLighting.b + (baseLighting.b - clearLighting.b) * intensity);
            
            // Apply lighting filter to the game world
            document.documentElement.style.setProperty('--weather-light-r', r);
            document.documentElement.style.setProperty('--weather-light-g', g);
            document.documentElement.style.setProperty('--weather-light-b', b);
            document.documentElement.style.setProperty('--weather-filter-intensity', intensity);
        }
    }
    
    /**
     * Handle time changes from the time manager
     * @param {Object} event - Time change event
     */
    onTimeChange(event) {
        // Potentially adjust weather when time of day changes
        const prevTimeOfDay = event.previousTimeOfDay;
        const newTimeOfDay = event.currentTimeOfDay;
        
        if (prevTimeOfDay !== newTimeOfDay) {
            // 25% chance to change weather when time of day changes
            if (Math.random() < 0.25) {
                this.generateRandomWeather();
            }
            // Otherwise, just update the lighting effects
            else {
                this.applyLightingEffects();
            }
        }
    }
    
    /**
     * Set weather by event
     * @param {string} weatherType - Type of weather to set
     * @param {Object} options - Additional options for the weather change
     */
    setWeatherEvent(weatherType, options = {}) {
        const intensity = options.intensity || 0.7;
        const transitionTime = options.transitionTime || 10;
        const duration = options.duration || 600; // 10 minutes by default
        
        this.transitionToWeather(weatherType, intensity, transitionTime);
        this.weatherDuration = duration;
        this.weatherTimer = 0;
    }
    
    /**
     * Get current weather data
     * @returns {Object} Current weather data
     */
    getCurrentWeatherData() {
        return {
            type: this.currentWeather,
            intensity: this.weatherIntensity,
            name: this.weatherTypes[this.currentWeather].name,
            description: this.weatherTypes[this.currentWeather].description,
            effectOnMovement: this.weatherTypes[this.currentWeather].effectOnMovement * this.weatherIntensity,
            effectOnVisibility: this.weatherTypes[this.currentWeather].effectOnVisibility * this.weatherIntensity
        };
    }
    
    /**
     * Clean up resources when weather system is no longer needed
     */
    cleanup() {
        // Clear update interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Remove event listeners
        if (this.timeManager) {
            this.timeManager.removeEventListener('timeChange', this.onTimeChange);
        }
        
        // Stop and unload audio
        Object.values(this.audioElements).forEach(audio => {
            audio.pause();
            audio.src = '';
        });
        
        // Remove DOM elements
        if (this.weatherContainer.parentNode) {
            this.weatherContainer.parentNode.removeChild(this.weatherContainer);
        }
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = WeatherSystem;
} 