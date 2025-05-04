/**
 * TimeManager.js - Advanced time cycle and event scheduling system
 * Manages game time, time-based events, character schedules, and provides
 * enhanced visualization of time passing in the game world.
 */

class TimeManager {
    constructor(game) {
        this.game = game;
        
        // Time tracking
        this.time = 360; // 6:00 AM in minutes
        this.timeOfDay = "morning";
        this.dayCount = 1;
        this.paused = false;
        this.timeScale = 1; // Default: 1 second = 1 minute
        
        // UI elements
        this.timeElement = null;
        this.timeOfDayElement = null;
        this.clockFace = null;
        this.clockHour = null;
        this.clockMinute = null;
        this.dayCountElement = null;
        
        // Event scheduling
        this.scheduledEvents = [];
        this.ongoingEvents = [];
        this.characterSchedules = {};
        
        // Time blocks definition (for readability and consistency)
        this.timeBlocks = {
            morning: { start: 360, end: 720 },    // 6:00 AM - 12:00 PM
            afternoon: { start: 720, end: 1020 }, // 12:00 PM - 5:00 PM
            evening: { start: 1020, end: 1200 },  // 5:00 PM - 8:00 PM
            night: { start: 1200, end: 360 }      // 8:00 PM - 6:00 AM (wraps to next day)
        };
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    /**
     * Initialize the time UI elements
     */
    initUI() {
        // Get existing time element
        this.timeElement = document.getElementById('time');
        
        // Create new UI elements
        this.createClockUI();
        
        // Initial UI update
        this.updateTimeDisplay();
    }
    
    /**
     * Create visual clock UI
     */
    createClockUI() {
        // Create clock container if it doesn't exist
        const clockContainer = document.createElement('div');
        clockContainer.id = 'clockContainer';
        clockContainer.className = 'clock-container';
        
        // Create analog clock face
        const clockFace = document.createElement('div');
        clockFace.id = 'clockFace';
        clockFace.className = 'clock-face';
        
        // Create clock hands
        const hourHand = document.createElement('div');
        hourHand.id = 'hourHand';
        hourHand.className = 'hour-hand';
        
        const minuteHand = document.createElement('div');
        minuteHand.id = 'minuteHand';
        minuteHand.className = 'minute-hand';
        
        // Create time of day indicator
        const timeOfDayIndicator = document.createElement('div');
        timeOfDayIndicator.id = 'timeOfDayIndicator';
        timeOfDayIndicator.className = 'time-of-day-indicator';
        timeOfDayIndicator.textContent = this.formatTimeOfDay(this.timeOfDay);
        
        // Create day counter
        const dayCounter = document.createElement('div');
        dayCounter.id = 'dayCounter';
        dayCounter.className = 'day-counter';
        dayCounter.textContent = `Day ${this.dayCount}`;
        
        // Assemble the clock
        clockFace.appendChild(hourHand);
        clockFace.appendChild(minuteHand);
        clockContainer.appendChild(clockFace);
        clockContainer.appendChild(timeOfDayIndicator);
        clockContainer.appendChild(dayCounter);
        
        // Store references
        this.clockFace = clockFace;
        this.clockHour = hourHand;
        this.clockMinute = minuteHand;
        this.timeOfDayElement = timeOfDayIndicator;
        this.dayCountElement = dayCounter;
        
        // Add to game UI
        const gameHeader = document.querySelector('.game-stats');
        if (gameHeader) {
            const timeContainer = document.querySelector('.time-container');
            timeContainer.appendChild(clockContainer);
        }
    }
    
    /**
     * Initialize event listeners for time control
     */
    initEventListeners() {
        // Listen for game pause/resume events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' && this.game.isGameRunning) {
                this.togglePause();
            }
        });
    }
    
    /**
     * Start the time loop
     */
    startTimeLoop() {
        this.timeInterval = setInterval(() => {
            if (this.paused) return;
            
            // Advance time based on timeScale
            this.advanceTime(1 * this.timeScale);
            
            // Check for scheduled events
            this.checkScheduledEvents();
            
            // Check for random events occasionally
            if (this.time % 5 === 0) {
                this.game.checkRandomEvents();
            }
            
            // Update character positions based on schedules
            this.updateCharacterSchedules();
            
            // Update weather occasionally
            if (this.time % 10 === 0) {
                this.game.updateWeather();
            }
            
            // Update mysterious effects occasionally
            if (this.time % 5 === 0) {
                this.game.updateMysteriousEffects();
            }
        }, 1000); // 1 second tick
    }
    
    /**
     * Advance the game time by specified minutes
     * @param {number} minutes - Number of minutes to advance
     */
    advanceTime(minutes) {
        this.time += minutes;
        
        // Handle day change
        if (this.time >= 1440) {
            this.time -= 1440; // Wrap around to next day
            this.dayCount++;
            
            // Update day counter UI
            if (this.dayCountElement) {
                this.dayCountElement.textContent = `Day ${this.dayCount}`;
                this.dayCountElement.classList.add('day-change');
                setTimeout(() => this.dayCountElement.classList.remove('day-change'), 3000);
            }
            
            // Trigger day change event
            this.onDayChange();
        }
        
        // Update visual display
        this.updateTimeDisplay();
        
        // Check if time of day has changed
        this.updateTimeOfDay();
    }
    
    /**
     * Update the visual time display including digital and analog clock
     */
    updateTimeDisplay() {
        if (!this.timeElement) return;
        
        // Calculate hours and minutes
        const hours = Math.floor(this.time / 60);
        const minutes = this.time % 60;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        
        // Update digital time display
        this.timeElement.textContent = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        
        // Update analog clock if available
        if (this.clockHour && this.clockMinute) {
            // Calculate hour and minute rotations
            const hourRotation = (hours % 12) * 30 + minutes * 0.5; // 30 degrees per hour + adjustment for minutes
            const minuteRotation = minutes * 6; // 6 degrees per minute
            
            this.clockHour.style.transform = `rotate(${hourRotation}deg)`;
            this.clockMinute.style.transform = `rotate(${minuteRotation}deg)`;
            
            // Apply different color to clock face based on time of day
            this.clockFace.className = `clock-face time-${this.timeOfDay}`;
        }
    }
    
    /**
     * Update the time of day based on current time
     */
    updateTimeOfDay() {
        let newTimeOfDay;
        
        // Determine time of day
        if (this.time >= this.timeBlocks.morning.start && this.time < this.timeBlocks.morning.end) {
            newTimeOfDay = "morning";
        } else if (this.time >= this.timeBlocks.afternoon.start && this.time < this.timeBlocks.afternoon.end) {
            newTimeOfDay = "afternoon";
        } else if (this.time >= this.timeBlocks.evening.start && this.time < this.timeBlocks.evening.end) {
            newTimeOfDay = "evening";
        } else {
            newTimeOfDay = "night";
        }
        
        // Only update if time of day has changed
        if (this.timeOfDay !== newTimeOfDay) {
            const previousTimeOfDay = this.timeOfDay;
            this.timeOfDay = newTimeOfDay;
            
            // Update UI
            if (this.timeOfDayElement) {
                this.timeOfDayElement.textContent = this.formatTimeOfDay(this.timeOfDay);
                
                // Add transition effect
                this.timeOfDayElement.classList.add('time-transition');
                setTimeout(() => this.timeOfDayElement.classList.remove('time-transition'), 3000);
            }
            
            // Update game visuals
            this.updateWorldAppearance();
            
            // Check if time change affects any puzzles
            if (this.game.puzzleManager) {
                this.game.puzzleManager.updatePuzzles();
            }
            
            // Trigger time of day change event
            this.onTimeOfDayChange(previousTimeOfDay, this.timeOfDay);
            
            // Update any time-dependent events
            this.game.checkEvents();
        }
    }
    
    /**
     * Update world appearance based on time of day
     */
    updateWorldAppearance() {
        // Update time-based elements
        document.querySelectorAll('.time-sensitive').forEach(element => {
            element.className = `time-sensitive ${this.timeOfDay}`;
        });
        
        // Apply visual effects based on time of day
        document.body.className = `time-${this.timeOfDay}`;
        
        // Update map time indicator if it exists
        const mapTimeIndicator = document.getElementById('mapTimeIndicator');
        if (mapTimeIndicator) {
            mapTimeIndicator.textContent = this.formatTimeOfDay(this.timeOfDay);
            mapTimeIndicator.className = `time-indicator time-${this.timeOfDay}`;
        }
    }
    
    /**
     * Format time of day for display
     * @param {string} timeOfDay - Time of day string
     * @returns {string} Formatted time of day
     */
    formatTimeOfDay(timeOfDay) {
        switch(timeOfDay) {
            case 'morning': return 'Morning';
            case 'afternoon': return 'Afternoon';
            case 'evening': return 'Evening';
            case 'night': return 'Night';
            default: return timeOfDay;
        }
    }
    
    /**
     * Toggle pause state of the time system
     */
    togglePause() {
        this.paused = !this.paused;
        
        // Show pause indicator
        let pauseIndicator = document.getElementById('pauseIndicator');
        if (!pauseIndicator && this.paused) {
            pauseIndicator = document.createElement('div');
            pauseIndicator.id = 'pauseIndicator';
            pauseIndicator.className = 'pause-indicator';
            pauseIndicator.textContent = 'PAUSED';
            document.body.appendChild(pauseIndicator);
        } else if (pauseIndicator && !this.paused) {
            pauseIndicator.remove();
        }
        
        return this.paused;
    }
    
    /**
     * Set the time scale (how fast time passes)
     * @param {number} scale - New time scale (1 = normal, 2 = 2x speed, etc.)
     */
    setTimeScale(scale) {
        if (scale <= 0) return;
        this.timeScale = scale;
        
        // Show time scale indicator briefly
        let scaleIndicator = document.getElementById('timeScaleIndicator');
        if (!scaleIndicator) {
            scaleIndicator = document.createElement('div');
            scaleIndicator.id = 'timeScaleIndicator';
            scaleIndicator.className = 'time-scale-indicator';
            document.body.appendChild(scaleIndicator);
        }
        
        scaleIndicator.textContent = `Time: ${scale}x`;
        scaleIndicator.classList.add('active');
        
        setTimeout(() => {
            scaleIndicator.classList.remove('active');
        }, 2000);
    }
    
    /**
     * Add a scheduled event
     * @param {Object} event - Event object
     */
    scheduleEvent(event) {
        if (!event.id || !event.startTime) {
            console.error('Invalid event format. Must include id and startTime.');
            return;
        }
        
        this.scheduledEvents.push(event);
    }
    
    /**
     * Check for and trigger scheduled events
     */
    checkScheduledEvents() {
        const currentTime = this.time;
        const currentDay = this.dayCount;
        
        // Check scheduled events
        for (let i = this.scheduledEvents.length - 1; i >= 0; i--) {
            const event = this.scheduledEvents[i];
            
            // Check if event should trigger
            if (this.shouldTriggerEvent(event, currentTime, currentDay)) {
                // Remove from scheduled events if one-time
                if (event.oneTime) {
                    this.scheduledEvents.splice(i, 1);
                }
                
                // Add to ongoing events if it has a duration
                if (event.endTime) {
                    this.ongoingEvents.push({
                        ...event,
                        triggered: true,
                        startedAtTime: currentTime,
                        startedOnDay: currentDay
                    });
                }
                
                // Trigger the event
                this.triggerEvent(event);
            }
        }
        
        // Check for ending ongoing events
        for (let i = this.ongoingEvents.length - 1; i >= 0; i--) {
            const event = this.ongoingEvents[i];
            
            // Check if event should end
            if (this.shouldEndEvent(event, currentTime, currentDay)) {
                this.ongoingEvents.splice(i, 1);
                
                // Trigger end callback if available
                if (event.onEnd) {
                    event.onEnd();
                }
            }
        }
    }
    
    /**
     * Check if an event should be triggered
     * @param {Object} event - Event to check
     * @param {number} currentTime - Current game time in minutes
     * @param {number} currentDay - Current game day
     * @returns {boolean} Whether event should trigger
     */
    shouldTriggerEvent(event, currentTime, currentDay) {
        // Skip already triggered one-time events
        if (event.oneTime && event.triggered) {
            return false;
        }
        
        // Check if target day matches
        if (event.day && event.day !== currentDay) {
            return false;
        }
        
        // Check if time matches
        const timeMatches = currentTime === event.startTime || 
            (event.isRepeating && currentTime % event.startTime === 0);
        
        if (!timeMatches) {
            return false;
        }
        
        // Check trust requirement
        if (event.requiresTrust && this.game.trust < event.requiresTrust) {
            return false;
        }
        
        // Check location requirement if player position is needed
        if (event.location && event.requiresPlayerPresence) {
            if (!this.isPlayerNearLocation(event.location)) {
                return false;
            }
        }
        
        // Check for required clues
        if (event.requiresClue && !this.game.foundClues.has(event.requiresClue)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if an ongoing event should end
     * @param {Object} event - Event to check
     * @param {number} currentTime - Current game time in minutes
     * @param {number} currentDay - Current game day
     * @returns {boolean} Whether event should end
     */
    shouldEndEvent(event, currentTime, currentDay) {
        // If event spans to next day
        if (event.startedOnDay < currentDay) {
            const adjustedCurrentTime = currentTime + 1440;
            const adjustedEndTime = event.startedAtTime + event.duration;
            return adjustedCurrentTime >= adjustedEndTime;
        }
        
        // Calculate end time either by duration or specified end time
        let endTime;
        if (event.duration) {
            endTime = event.startedAtTime + event.duration;
        } else if (event.endTime) {
            endTime = event.endTime;
        } else {
            return false; // No way to determine end
        }
        
        return currentTime >= endTime;
    }
    
    /**
     * Check if player is near a specific location
     * @param {Object} location - Location to check
     * @returns {boolean} Whether player is near location
     */
    isPlayerNearLocation(location) {
        if (!this.game.player) return false;
        
        const playerX = this.game.player.offsetLeft + this.game.player.offsetWidth / 2;
        const playerY = this.game.player.offsetTop + this.game.player.offsetHeight / 2;
        
        if (location.x && location.y && location.radius) {
            // Check distance from point
            const distance = Math.sqrt(
                Math.pow(location.x - playerX, 2) + 
                Math.pow(location.y - playerY, 2)
            );
            return distance <= location.radius;
        } else if (location.near === 'house') {
            // Check if near any house or specific house index
            for (let i = 0; i < this.game.houses.length; i++) {
                if (location.index !== undefined && location.index !== i) {
                    continue;
                }
                
                const house = this.game.houses[i];
                const houseX = house.offsetLeft + house.offsetWidth / 2;
                const houseY = house.offsetTop + house.offsetHeight / 2;
                
                const distance = Math.sqrt(
                    Math.pow(houseX - playerX, 2) + 
                    Math.pow(houseY - playerY, 2)
                );
                
                if (distance <= (location.distance || 150)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Trigger an event's action
     * @param {Object} event - Event to trigger
     */
    triggerEvent(event) {
        if (!event.onTrigger) return;
        
        // Mark as triggered
        event.triggered = true;
        
        // Call the trigger function
        event.onTrigger();
        
        // Log the event
        console.log(`Event triggered: ${event.id} at time ${this.formatGameTime(this.time)}`);
        
        // Add to event log in notebook if it's a major event
        if (event.addToLog) {
            this.addEventToTimeline(event);
        }
    }
    
    /**
     * Add event to the notebook timeline
     * @param {Object} event - Event to add to timeline
     */
    addEventToTimeline(event) {
        const timelineEntry = {
            time: this.time,
            day: this.dayCount,
            formattedTime: this.formatGameTime(this.time),
            description: event.logDescription || `Event: ${event.id}`,
            type: event.type || 'event'
        };
        
        // Add to game's event timeline if it exists
        if (this.game.eventTimeline) {
            this.game.eventTimeline.push(timelineEntry);
            this.game.updateTimelineDisplay();
        }
    }
    
    /**
     * Format game time as a string
     * @param {number} minutes - Time in minutes
     * @returns {string} Formatted time string
     */
    formatGameTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        
        return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
    }
    
    /**
     * Set up a character's daily schedule
     * @param {string} characterId - Character identifier
     * @param {Object} schedule - Character's schedule
     */
    setCharacterSchedule(characterId, schedule) {
        this.characterSchedules[characterId] = schedule;
    }
    
    /**
     * Update character positions based on their schedules
     */
    updateCharacterSchedules() {
        Object.keys(this.characterSchedules).forEach(characterId => {
            const schedule = this.characterSchedules[characterId];
            const currentTimeBlock = this.timeOfDay;
            
            if (schedule[currentTimeBlock]) {
                const location = schedule[currentTimeBlock].location;
                const activity = schedule[currentTimeBlock].activity;
                
                // Update character position if they have a valid element
                const character = this.game.neighbors.find(n => n.id === characterId);
                if (character && location) {
                    // Move character to location
                    character.style.left = `${location.x}px`;
                    character.style.top = `${location.y}px`;
                    
                    // Update activity state if needed
                    if (activity) {
                        character.dataset.activity = activity;
                    } else {
                        delete character.dataset.activity;
                    }
                }
            }
        });
    }
    
    /**
     * Get a character's current location and activity
     * @param {string} characterId - Character identifier
     * @returns {Object|null} Character's current location and activity or null
     */
    getCharacterCurrentState(characterId) {
        const schedule = this.characterSchedules[characterId];
        if (!schedule) return null;
        
        return schedule[this.timeOfDay] || null;
    }
    
    /**
     * Event handler for day change
     */
    onDayChange() {
        // Reset one-day-only events
        this.scheduledEvents.forEach(event => {
            if (event.dailyReset) {
                event.triggered = false;
            }
        });
        
        // Check for game loop limit if enabled
        if (this.game.dayLoopLimit && this.dayCount > this.game.dayLoopLimit) {
            this.game.triggerTimeLoopReset();
        }
        
        // Dispatch custom event
        const dayChangeEvent = new CustomEvent('dayChange', {
            detail: { day: this.dayCount }
        });
        document.dispatchEvent(dayChangeEvent);
    }
    
    /**
     * Event handler for time of day change
     * @param {string} oldTimeOfDay - Previous time of day
     * @param {string} newTimeOfDay - New time of day
     */
    onTimeOfDayChange(oldTimeOfDay, newTimeOfDay) {
        // Dispatch custom event
        const timeChangeEvent = new CustomEvent('timeOfDayChange', {
            detail: { 
                previous: oldTimeOfDay, 
                current: newTimeOfDay,
                time: this.time,
                formattedTime: this.formatGameTime(this.time)
            }
        });
        document.dispatchEvent(timeChangeEvent);
        
        // Change background music if needed
        if (this.game.playBackgroundMusic) {
            this.game.playBackgroundMusic();
        }
    }
    
    /**
     * Get time data for saving
     */
    getSaveData() {
        return {
            time: this.time,
            timeOfDay: this.timeOfDay,
            dayCount: this.dayCount,
            scheduledEvents: this.scheduledEvents.map(e => ({
                ...e,
                onTrigger: undefined, // Don't save functions
                onEnd: undefined
            })),
            ongoingEvents: this.ongoingEvents.map(e => ({
                ...e,
                onTrigger: undefined, // Don't save functions
                onEnd: undefined
            }))
        };
    }
    
    /**
     * Load time data from save
     */
    loadFromSave(saveData) {
        if (!saveData) return;
        
        this.time = saveData.time || 360;
        this.timeOfDay = saveData.timeOfDay || "morning";
        this.dayCount = saveData.dayCount || 1;
        
        // Restore events (will need to reattach functions)
        if (saveData.scheduledEvents) {
            this.scheduledEvents = saveData.scheduledEvents;
        }
        
        if (saveData.ongoingEvents) {
            this.ongoingEvents = saveData.ongoingEvents;
        }
        
        // Update UI
        this.updateTimeDisplay();
        this.updateWorldAppearance();
        
        if (this.dayCountElement) {
            this.dayCountElement.textContent = `Day ${this.dayCount}`;
        }
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeManager;
} 