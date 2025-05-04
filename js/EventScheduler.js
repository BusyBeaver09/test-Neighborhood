/**
 * EventScheduler.js - Event scheduling and character routine management
 * Handles scheduled events, character daily routines, and time-based triggers
 */

class EventScheduler {
    constructor(game, timeManager) {
        this.game = game;
        this.timeManager = timeManager;
        
        // Event collections
        this.events = [];
        this.characterRoutines = {};
        this.worldSchedule = [];
        
        // Timeline data
        this.eventTimeline = [];
    }
    
    /**
     * Initialize built-in events and character schedules
     */
    initDefaultSchedules() {
        // Initialize character routines
        this.setupCharacterSchedules();
        
        // Initialize world events
        this.setupWorldEvents();
    }
    
    /**
     * Set up character schedules based on their personalities
     */
    setupCharacterSchedules() {
        // Mrs. Finch's schedule
        this.characterRoutines['mrs_finch'] = {
            morning: {
                location: { x: 150, y: 180 },
                activity: 'gardening',
                dialogue: 'mrs_finch_morning',
                description: 'Mrs. Finch is in her garden, tending to her plants.'
            },
            afternoon: {
                location: { x: 130, y: 150 },
                activity: 'sleeping',
                dialogue: 'mrs_finch_afternoon',
                description: 'Mrs. Finch is taking her afternoon nap inside her house.'
            },
            evening: {
                location: { x: 170, y: 170 },
                activity: 'watching',
                dialogue: 'mrs_finch_evening',
                description: 'Mrs. Finch is sitting on her porch, watching the neighborhood.'
            },
            night: {
                location: { x: 130, y: 150 },
                activity: 'mysterious',
                dialogue: 'mrs_finch_night',
                description: 'Mrs. Finch appears to be in her basement with a flashlight.'
            }
        };
        
        // Jake & Lila's schedule
        this.characterRoutines['jake_lila'] = {
            morning: {
                location: { x: 310, y: 150 },
                activity: 'sleeping',
                dialogue: 'jake_lila_morning',
                description: 'Jake is in his room, Lila seems to be out.'
            },
            afternoon: {
                location: { x: 350, y: 180 },
                activity: 'talking',
                dialogue: 'jake_lila_afternoon',
                description: 'Jake and Lila are in their yard, talking quietly.'
            },
            evening: {
                location: { x: 320, y: 170 },
                activity: 'nervous',
                dialogue: 'jake_lila_evening',
                description: 'Jake looks nervous, checking the street frequently.'
            },
            night: {
                location: { x: 400, y: 300 },
                activity: 'sneaking',
                dialogue: 'jake_lila_night',
                description: 'Jake is near the well, looking around suspiciously.'
            }
        };
        
        // Mr. Arnold's schedule
        this.characterRoutines['mr_arnold'] = {
            morning: {
                location: { x: 450, y: 175 },
                activity: 'working',
                dialogue: 'mr_arnold_morning',
                description: 'Mr. Arnold is working on something in his shed.'
            },
            afternoon: {
                location: { x: 480, y: 150 },
                activity: 'reading',
                dialogue: 'mr_arnold_afternoon',
                description: 'Mr. Arnold is inside his house, reading by the window.'
            },
            evening: {
                location: { x: 450, y: 190 },
                activity: 'walking',
                dialogue: 'mr_arnold_evening',
                description: 'Mr. Arnold is taking a walk around his yard.'
            },
            night: {
                location: { x: 600, y: 170 },
                activity: 'investigating',
                dialogue: 'mr_arnold_night',
                description: 'Mr. Arnold is near the abandoned house with a camera.'
            }
        };
        
        // Register with time manager
        Object.keys(this.characterRoutines).forEach(characterId => {
            this.timeManager.setCharacterSchedule(characterId, this.characterRoutines[characterId]);
        });
    }
    
    /**
     * Set up scheduled world events
     */
    setupWorldEvents() {
        // Well shadow event (midnight only)
        this.addEvent({
            id: "well_shadow_event",
            startTime: 0, // 12:00 AM (midnight)
            duration: 30, // 30 minutes
            location: { x: 400, y: 300, radius: 100 }, // Well area
            requiresTrust: 30,
            oneTime: true,
            requiresPlayerPresence: true,
            addToLog: true,
            logDescription: "You saw a shadow figure near the well",
            type: "discovery",
            onTrigger: () => {
                this.createShadowFigure();
                this.game.foundClues.add("A shadowy figure visits the well at midnight");
                this.game.addClueToNotebook("A shadowy figure visits the well at midnight");
                this.game.playSoundEffect('spooky');
            }
        });
        
        // Mrs. Finch basement light (night, repeating)
        this.addEvent({
            id: "finch_basement_light",
            startTime: 1320, // 10:00 PM
            duration: 60, // 1 hour
            location: { near: 'house', index: 0, distance: 150 }, // Mrs. Finch's house
            isRepeating: true,
            dailyReset: true,
            requiresPlayerPresence: true,
            addToLog: true,
            logDescription: "Strange light in Mrs. Finch's basement",
            type: "clue",
            onTrigger: () => {
                this.createBasementLight();
                if (!this.game.foundClues.has("Mrs. Finch's basement light is on late at night")) {
                    this.game.foundClues.add("Mrs. Finch's basement light is on late at night");
                    this.game.addClueToNotebook("Mrs. Finch's basement light is on late at night");
                }
            }
        });
        
        // Abandoned house activity (evening, requires prior clue)
        this.addEvent({
            id: "abandoned_house_activity",
            startTime: 1140, // 7:00 PM
            duration: 40, // 40 minutes
            location: { near: 'house', index: 3, distance: 200 }, // Abandoned house
            requiresTrust: 40,
            requiresClue: "Mrs. Finch's basement light is on late at night",
            oneTime: true,
            addToLog: true,
            logDescription: "Movement in the abandoned house",
            type: "discovery",
            onTrigger: () => {
                this.createAbandonedHouseActivity();
                this.game.foundClues.add("Someone is using the abandoned house in the evening");
                this.game.addClueToNotebook("Someone is using the abandoned house in the evening");
                this.game.playSoundEffect('creepy');
            }
        });
        
        // Secret meeting (early morning)
        this.addEvent({
            id: "early_morning_meeting",
            startTime: 330, // 5:30 AM
            duration: 20, // 20 minutes
            location: { x: 500, y: 400, radius: 150 }, // Behind Arnold's house
            requiresTrust: 60,
            day: 2, // Only on day 2
            addToLog: true,
            logDescription: "Caught sight of a secret meeting behind Mr. Arnold's house",
            type: "discovery",
            onTrigger: () => {
                this.createSecretMeeting();
                this.game.foundClues.add("Mr. Arnold meets with someone in the early morning");
                this.game.addClueToNotebook("Mr. Arnold meets with someone in the early morning");
                this.game.trust += 5; // Bonus for catching this rare event
                this.game.showNotification("+5 Trust for witnessing the secret meeting");
            }
        });
        
        // Storm warning (afternoon of day 3)
        this.addEvent({
            id: "storm_warning",
            startTime: 840, // 2:00 PM
            day: 3, // Only on day 3
            addToLog: true,
            logDescription: "Weather warning: Storm approaching tonight",
            type: "event",
            onTrigger: () => {
                this.game.showNotification("Weather alert: A storm is approaching tonight", 10000);
                this.game.weather.stormWarning = true;
                
                // Create visual cue
                const warningElement = document.createElement('div');
                warningElement.className = 'weather-warning';
                warningElement.textContent = '⚡ Storm Warning ⚡';
                document.querySelector('.game-header').appendChild(warningElement);
                
                // Create countdown
                this.stormCountdown = setInterval(() => {
                    // Start storm at 8 PM
                    const stormTime = 1200; // 8:00 PM
                    const timeRemaining = stormTime - this.timeManager.time;
                    
                    if (timeRemaining <= 0) {
                        clearInterval(this.stormCountdown);
                        warningElement.remove();
                        
                        // Trigger storm
                        this.startStorm();
                    } else {
                        const hours = Math.floor(timeRemaining / 60);
                        const minutes = timeRemaining % 60;
                        warningElement.textContent = `⚡ Storm in ${hours}h ${minutes}m ⚡`;
                    }
                }, 5000); // Check every 5 seconds
            }
        });
        
        // Mystery appearance at the well (night of day 3)
        this.addEvent({
            id: "mystery_well_appearance",
            startTime: 1380, // 11:00 PM
            day: 3, // Only on day 3
            location: { x: 400, y: 300, radius: 150 }, // Well area
            requiresPlayerPresence: true,
            addToLog: true,
            logDescription: "A mysterious figure appeared at the well during the storm",
            type: "discovery",
            onTrigger: () => {
                if (this.game.weather.stormActive) {
                    this.createMysteryAppearance();
                    this.game.foundClues.add("A woman appeared at the well during the storm");
                    this.game.addClueToNotebook("A woman appeared at the well during the storm");
                    this.game.playSoundEffect('supernatural');
                    this.game.trust += 10;
                    this.game.showNotification("+10 Trust for witnessing the supernatural event");
                }
            }
        });
    }
    
    /**
     * Add an event to the scheduler
     * @param {Object} event - Event configuration
     */
    addEvent(event) {
        this.events.push(event);
        this.timeManager.scheduleEvent(event);
    }
    
    /**
     * Check scheduled events for current time
     */
    checkEvents() {
        const currentTime = this.timeManager.time;
        const currentDay = this.timeManager.dayCount;
        const currentTimeOfDay = this.timeManager.timeOfDay;
        
        // Also update character dialogues based on time of day
        this.updateCharacterDialogues(currentTimeOfDay);
    }
    
    /**
     * Update character dialogues based on time of day
     * @param {string} timeOfDay - Current time of day
     */
    updateCharacterDialogues(timeOfDay) {
        Object.keys(this.characterRoutines).forEach(characterId => {
            const routine = this.characterRoutines[characterId];
            if (routine[timeOfDay] && routine[timeOfDay].dialogue) {
                // If the game uses a dialogue manager, update it
                if (this.game.dialogueManager) {
                    this.game.dialogueManager.setActiveDialogueNode(
                        characterId, 
                        routine[timeOfDay].dialogue
                    );
                }
            }
        });
    }
    
    /**
     * Get a character's current schedule information
     * @param {string} characterId - Character ID
     * @returns {Object|null} Character's current schedule or null
     */
    getCharacterCurrentSchedule(characterId) {
        const routine = this.characterRoutines[characterId];
        if (!routine) return null;
        
        return routine[this.timeManager.timeOfDay] || null;
    }
    
    /**
     * Add an entry to the event timeline
     * @param {Object} entry - Timeline entry
     */
    addTimelineEntry(entry) {
        // Create a timestamp if not provided
        if (!entry.time) {
            entry.time = this.timeManager.time;
            entry.day = this.timeManager.dayCount;
            entry.formattedTime = this.timeManager.formatGameTime(this.timeManager.time);
        }
        
        this.eventTimeline.push(entry);
        
        // Update timeline in the notebook if exists
        if (this.game.updateTimelineDisplay) {
            this.game.updateTimelineDisplay();
        }
    }
    
    /**
     * Create a shadow figure at the well
     */
    createShadowFigure() {
        const shadowFigure = document.createElement('div');
        shadowFigure.className = 'mystery-figure shadow-figure';
        shadowFigure.style.left = '400px';
        shadowFigure.style.top = '290px';
        
        // Add to game board
        this.game.gameBoard.appendChild(shadowFigure);
        
        // Add glow effect around well
        const wellGlow = document.createElement('div');
        wellGlow.className = 'mysterious-glow active';
        wellGlow.style.left = '400px';
        wellGlow.style.top = '300px';
        wellGlow.style.width = '100px';
        wellGlow.style.height = '100px';
        this.game.gameBoard.appendChild(wellGlow);
        
        // Create sound effect
        this.game.playSoundEffect('whispers');
        
        // Remove after a short time
        setTimeout(() => {
            shadowFigure.style.opacity = '0';
            wellGlow.style.opacity = '0';
            
            setTimeout(() => {
                shadowFigure.remove();
                wellGlow.remove();
            }, 1000);
        }, 20000); // Visible for 20 seconds
    }
    
    /**
     * Create basement light effect at Mrs. Finch's house
     */
    createBasementLight() {
        // Add flickering light to Mrs. Finch's house
        const basementLight = document.createElement('div');
        basementLight.className = 'flickering-light';
        basementLight.style.left = '150px';
        basementLight.style.top = '160px';
        this.game.gameBoard.appendChild(basementLight);
        
        // Remove after a while
        setTimeout(() => {
            basementLight.style.opacity = '0';
            setTimeout(() => basementLight.remove(), 1000);
        }, 60000); // Visible for 1 minute
    }
    
    /**
     * Create activity at the abandoned house
     */
    createAbandonedHouseActivity() {
        // Create shadow in window
        const windowShadow = document.createElement('div');
        windowShadow.className = 'window-shadow';
        windowShadow.style.left = '620px';
        windowShadow.style.top = '130px';
        this.game.gameBoard.appendChild(windowShadow);
        
        // Create subtle movement
        const moveInterval = setInterval(() => {
            const offsetX = Math.random() * 10 - 5;
            const offsetY = Math.random() * 10 - 5;
            windowShadow.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }, 500);
        
        // Remove after a while
        setTimeout(() => {
            clearInterval(moveInterval);
            windowShadow.style.opacity = '0';
            setTimeout(() => windowShadow.remove(), 1000);
        }, 40000); // Visible for the full duration
    }
    
    /**
     * Create secret meeting event
     */
    createSecretMeeting() {
        // Create two figures meeting
        const figureOne = document.createElement('div');
        figureOne.className = 'character-silhouette';
        figureOne.style.left = '500px';
        figureOne.style.top = '390px';
        this.game.gameBoard.appendChild(figureOne);
        
        const figureTwo = document.createElement('div');
        figureTwo.className = 'character-silhouette female';
        figureTwo.style.left = '520px';
        figureTwo.style.top = '400px';
        this.game.gameBoard.appendChild(figureTwo);
        
        // Remove after a while
        setTimeout(() => {
            figureOne.style.opacity = '0';
            figureTwo.style.opacity = '0';
            setTimeout(() => {
                figureOne.remove();
                figureTwo.remove();
            }, 1000);
        }, 20000); // Visible for 20 seconds
    }
    
    /**
     * Start the storm event
     */
    startStorm() {
        this.game.weather.stormActive = true;
        this.game.weather.applyWeatherEffect('heavy-storm');
        this.game.playSoundEffect('thunder');
        
        // Dim the lights across the neighborhood
        document.body.classList.add('storm-lighting');
        
        // Make houses flicker
        const houses = document.querySelectorAll('.house');
        houses.forEach(house => {
            house.classList.add('storm-flicker');
        });
        
        // Schedule end of storm (after 2 hours game time)
        setTimeout(() => {
            this.endStorm();
        }, 120 * 1000 / this.timeManager.timeScale); // Adjusted for time scale
    }
    
    /**
     * End the storm event
     */
    endStorm() {
        this.game.weather.stormActive = false;
        this.game.weather.removeWeatherEffect('heavy-storm');
        
        // Restore lighting
        document.body.classList.remove('storm-lighting');
        
        // Stop house flickering
        const houses = document.querySelectorAll('.house');
        houses.forEach(house => {
            house.classList.remove('storm-flicker');
        });
        
        // Add aftermath effects
        this.game.weather.applyWeatherEffect('post-storm');
    }
    
    /**
     * Create the mystery appearance at the well
     */
    createMysteryAppearance() {
        const mysteryFigure = document.createElement('div');
        mysteryFigure.className = 'mystery-figure ghostly-woman';
        mysteryFigure.style.left = '400px';
        mysteryFigure.style.top = '290px';
        
        // Add to game board
        this.game.gameBoard.appendChild(mysteryFigure);
        
        // Add intense glow
        const wellGlow = document.createElement('div');
        wellGlow.className = 'supernatural-glow';
        wellGlow.style.left = '400px';
        wellGlow.style.top = '300px';
        wellGlow.style.width = '150px';
        wellGlow.style.height = '150px';
        this.game.gameBoard.appendChild(wellGlow);
        
        // Major sound effects
        this.game.playSoundEffect('supernatural');
        setTimeout(() => this.game.playSoundEffect('woman_whisper'), 3000);
        
        // Lightning flash
        this.createLightningFlash();
        
        // Remove after a dramatic pause
        setTimeout(() => {
            // Lightning flash before disappearing
            this.createLightningFlash();
            
            setTimeout(() => {
                mysteryFigure.style.opacity = '0';
                wellGlow.style.opacity = '0';
                
                setTimeout(() => {
                    mysteryFigure.remove();
                    wellGlow.remove();
                }, 1000);
            }, 500);
        }, 15000); // Visible for 15 seconds
    }
    
    /**
     * Create lightning flash effect
     */
    createLightningFlash() {
        const flash = document.createElement('div');
        flash.className = 'lightning-flash';
        document.body.appendChild(flash);
        
        setTimeout(() => flash.remove(), 500);
    }
    
    /**
     * Get event data for saving
     */
    getSaveData() {
        return {
            events: this.events.map(e => ({
                ...e,
                onTrigger: undefined, // Don't save functions
                onEnd: undefined
            })),
            eventTimeline: this.eventTimeline,
        };
    }
    
    /**
     * Load event data from save
     */
    loadFromSave(saveData) {
        if (!saveData) return;
        
        if (saveData.eventTimeline) {
            this.eventTimeline = saveData.eventTimeline;
        }
        
        // Events need to be regenerated with functions intact
        // Reset events first
        this.events = [];
        this.setupWorldEvents();
        
        // Mark events as triggered if they were triggered in the save
        if (saveData.events) {
            saveData.events.forEach(savedEvent => {
                const matchingEvent = this.events.find(e => e.id === savedEvent.id);
                if (matchingEvent) {
                    matchingEvent.triggered = savedEvent.triggered;
                }
            });
        }
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventScheduler;
} 