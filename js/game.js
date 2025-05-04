// Add performance optimization techniques

// Throttling helper function
function throttle(callback, limit) {
    let waiting = false;
    return function() {
        if (!waiting) {
            callback.apply(this, arguments);
            waiting = true;
            setTimeout(function() {
                waiting = false;
            }, limit);
        }
    };
}

// At the start of the file, after the throttle function
const WEATHER_EFFECTS = ['clear', 'fog', 'rain', 'storm'];

class Game {
    constructor() {
        // Core game state
        this.playerPosition = { x: 400, y: 300 };
        this.inventory = new Set();
        this.foundClues = new Set();
        this.photos = [];
        this.discoveredLocations = new Set();
        this.flags = {};
        this.gameVersion = "1.0.0";
        
        // Systems initialization
        this.timeManager = new TimeManager(this);
        this.eventScheduler = new EventScheduler(this);
        this.mapManager = new MapManager(this);
        this.puzzleManager = new PuzzleManager(this);
        this.relationshipManager = new RelationshipManager(this);
        this.endingManager = new EndingManager(this);
        this.companionSystem = null;  // Add this line
        
        // Final player theory
        this.finalTheory = null;
        
        // Frame counter for animation and timing
        this.frameCount = 0;
        this.lastUpdateTime = Date.now();
        
        // UI elements
        this.player = null;
        this.trustElement = null;
        this.notesArea = null;
        
        // Initialize game elements
        this.initGame();
    }
    
    // New method to set up the puzzle system
    setupPuzzleSystem() {
        // Load puzzle CSS
        if (!document.getElementById('puzzle-styles')) {
            const linkElement = document.createElement('link');
            linkElement.id = 'puzzle-styles';
            linkElement.rel = 'stylesheet';
            linkElement.href = 'puzzles.css';
            document.head.appendChild(linkElement);
        }
        
        // Define puzzle data - this should match your narrative
        // Using a structure similar to PUZZLE_DATA_SAMPLE from PuzzleManager.js
        const PUZZLE_DATA = {
            "timeline_iris_disappearance": {
                "type": "timeline",
                "title": "Reconstructing Iris's Last Night",
                "description": "Arrange the events of the night Iris disappeared in chronological order.",
                "activationConditions": {
                    "requiredClues": [
                        "Mrs. Finch saw Iris at 7 PM",
                        "Mr. Arnold claims Iris left at 9 PM",
                        "Flickering basement light at 10 PM"
                    ]
                },
                "activationEffects": {
                    "unlockClue": "Timeline of Iris's disappearance needs to be reconstructed",
                    "notification": "You now have enough information to reconstruct the timeline of Iris's disappearance. Check your notebook."
                },
                "events": [
                    {
                        "id": "finch_dinner",
                        "text": "Iris had dinner with Mrs. Finch",
                        "time": "7:00 PM"
                    },
                    {
                        "id": "arnolds_sighting",
                        "text": "Mr. Arnold saw Iris leave her house",
                        "time": "9:00 PM"
                    },
                    {
                        "id": "basement_light",
                        "text": "Flickering light in Iris's basement",
                        "time": "10:00 PM"
                    }
                ],
                "solution": {
                    "order": ["finch_dinner", "arnolds_sighting", "basement_light"]
                },
                "solutionEffects": {
                    "trust": 10,
                    "unlockClue": "Something doesn't add up - how was there light in Iris's basement after she supposedly left?",
                    "notification": "You've successfully reconstructed the timeline! But wait... if Iris left at 9 PM, who was in her basement at 10 PM?"
                }
            },
            "contradiction_jake_photo": {
                "type": "contradiction",
                "title": "Jake's Story Doesn't Add Up",
                "description": "Jake claims he never met Iris, but there's evidence to the contrary.",
                "activationConditions": {
                    "trustMin": 20,
                    "requiredClues": ["Jake claims he never met Iris"]
                },
                "characterId": "jake_lila",
                "requiredEvidence": "well_meeting_photo",
                "solution": {
                    "character": "jake_lila",
                    "evidence": "well_meeting_photo"
                },
                "solutionEffects": {
                    "trust": 5,
                    "unlockClue": "Jake lied about knowing Iris - they met at the well several times",
                    "triggerDialogue": {
                        "character": "jake_lila",
                        "dialogueId": "jake_lila_confession"
                    }
                }
            },
            "photoAssembly_shadow_figure": {
                "type": "photoAssembly",
                "title": "The Watcher in the Windows",
                "description": "Collect photos of the abandoned house from different angles to reveal who's been watching.",
                "activationConditions": {
                    "timeOfDay": "night",
                    "trustMin": 30
                },
                "requiredPhotoTypes": ["house_east", "house_north", "house_west"],
                "revealedElement": "shadow-figure",
                "revealDescription": "When viewed together, the photos reveal a tall shadow figure moving between the windows of the house!",
                "solution": {
                    "requiredPhotos": ["house_east_photo", "house_north_photo", "house_west_photo"]
                },
                "solutionEffects": {
                    "trust": 15,
                    "unlockClue": "A tall shadow figure can be seen in the windows of the abandoned house when photos are arranged together",
                    "notification": "When you arrange the photos side by side, you can see a figure moving between the windows!"
                }
            }
        };
        
        // Initialize the puzzle manager
        this.puzzleManager = new PuzzleManager(this);
        this.puzzleManager.initialize(PUZZLE_DATA);
        
        // Register callbacks for puzzle events
        this.puzzleManager.registerCallbacks({
            onPuzzleActivated: (puzzleId, puzzle) => this.onPuzzleActivated(puzzleId, puzzle),
            onPuzzleSolved: (puzzleId, puzzle) => this.onPuzzleSolved(puzzleId, puzzle)
        });
    }
    
    // Callback for puzzle activation
    onPuzzleActivated(puzzleId, puzzle) {
        console.log(`Puzzle activated: ${puzzle.title}`);
        // Show notification to player
        if (puzzle.activationEffects && puzzle.activationEffects.notification) {
            this.showNotification(puzzle.activationEffects.notification);
        }
    }
    
    // Callback for puzzle solution
    onPuzzleSolved(puzzleId, puzzle) {
        console.log(`Puzzle solved: ${puzzle.title}`);
        // Show notification to player
        if (puzzle.solutionEffects && puzzle.solutionEffects.notification) {
            this.showNotification(puzzle.solutionEffects.notification);
        }
    }
    
    // Add puzzle to notebook
    addPuzzleToNotebook(puzzleId, puzzle) {
        console.log(`Adding puzzle to notebook: ${puzzle.title}`);
        
        // Create puzzle entry in notebook
        const puzzleEntry = document.createElement('div');
        puzzleEntry.className = 'notebook-puzzle';
        puzzleEntry.dataset.puzzleId = puzzleId;
        
        const puzzleTitle = document.createElement('h3');
        puzzleTitle.textContent = puzzle.title;
        puzzleEntry.appendChild(puzzleTitle);
        
        const puzzleDesc = document.createElement('p');
        puzzleDesc.textContent = puzzle.description;
        puzzleEntry.appendChild(puzzleDesc);
        
        // Add button to open puzzle interface
        const solveBtn = document.createElement('button');
        solveBtn.className = 'solve-puzzle-btn';
        solveBtn.textContent = 'Solve This Puzzle';
        solveBtn.addEventListener('click', () => this.openPuzzleInterface(puzzleId));
        puzzleEntry.appendChild(solveBtn);
        
        // Add to notebook
        const puzzlesContainer = document.getElementById('puzzlesContainer') || this.notesArea;
        puzzlesContainer.appendChild(puzzleEntry);
    }
    
    // Update puzzle in notebook
    updatePuzzleInNotebook(puzzleId, puzzle, solved) {
        console.log(`Updating puzzle in notebook: ${puzzle.title}, Solved: ${solved}`);
        
        const puzzleEntry = document.querySelector(`.notebook-puzzle[data-puzzle-id="${puzzleId}"]`);
        if (!puzzleEntry) return;
        
        if (solved) {
            puzzleEntry.classList.add('solved');
            
            // Update UI to show it's solved
            const solveBtn = puzzleEntry.querySelector('.solve-puzzle-btn');
            if (solveBtn) {
                solveBtn.textContent = 'Puzzle Solved';
                solveBtn.disabled = true;
            }
            
            // Add solution notes if any
            if (puzzle.solutionNotes) {
                const solutionNotes = document.createElement('div');
                solutionNotes.className = 'puzzle-solution-notes';
                solutionNotes.textContent = puzzle.solutionNotes;
                puzzleEntry.appendChild(solutionNotes);
            }
        }
    }
    
    // Open puzzle interface
    openPuzzleInterface(puzzleId) {
        console.log(`Opening puzzle interface for: ${puzzleId}`);
        
        // Create modal for puzzle interface
        const modal = document.createElement('div');
        modal.className = 'puzzle-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'puzzle-modal-content';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-modal-btn';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => modal.remove());
        
        const puzzleContainer = document.createElement('div');
        puzzleContainer.id = 'activePuzzleContainer';
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(puzzleContainer);
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        
        // Render the appropriate puzzle component based on type
        const puzzle = this.puzzleManager.puzzles[puzzleId];
        if (!puzzle) return;
        
        switch (puzzle.type) {
            case 'timeline':
                const timelinePuzzle = new TimelinePuzzle(this.puzzleManager, puzzleId);
                timelinePuzzle.render('activePuzzleContainer');
                break;
            case 'contradiction':
                const contradictionPuzzle = new ContradictionPuzzle(this.puzzleManager, puzzleId);
                contradictionPuzzle.render('activePuzzleContainer');
                break;
            case 'photoAssembly':
                const photoAssemblyPuzzle = new PhotoAssemblyPuzzle(this.puzzleManager, puzzleId);
                photoAssemblyPuzzle.render('activePuzzleContainer');
                break;
            default:
                puzzleContainer.textContent = 'Unknown puzzle type';
        }
    }
    
    // Utility method to show notifications
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto-remove after delay
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 1000);
        }, 5000);
    }

    setupDialogSystem() {
        // Initialize the dialogue manager with DOM elements
        this.dialogueManager.initialize(
            // We can convert the legacy dialogue format or use new format
            this.dialogueManager.convertLegacyDialogue(DIALOGUES),
            {
                overlay: this.dialogOverlay,
                box: document.querySelector('.dialog-box'),
                name: this.dialogCharacterName, 
                portrait: this.dialogPortrait,
                text: this.dialogText,
                options: this.dialogOptions,
                close: this.dialogClose
            }
        );

        this.dialogClose.addEventListener('click', () => {
            this.hideDialog();
        });
    }
    
    setupAudioControls() {
        // Add audio controls to the game container
        const audioControls = document.createElement('div');
        audioControls.className = 'audio-controls';
        
        const muteBtn = document.createElement('button');
        muteBtn.className = 'audio-btn';
        muteBtn.innerHTML = '🔊';
        muteBtn.addEventListener('click', () => this.toggleAudio());
        
        audioControls.appendChild(muteBtn);
        document.querySelector('.game-container').appendChild(audioControls);
        
        // Set up background music
        this.bgMusic.volume = 0.3;
    }
    
    toggleAudio() {
        this.audioMuted = !this.audioMuted;
        
        if (this.audioMuted) {
            this.bgMusic.pause();
            document.querySelector('.audio-btn').innerHTML = '🔇';
            document.querySelector('.audio-controls').classList.add('muted');
        } else {
            this.playBackgroundMusic();
            document.querySelector('.audio-btn').innerHTML = '🔊';
            document.querySelector('.audio-controls').classList.remove('muted');
        }
    }
    
    playBackgroundMusic() {
        if (this.audioMuted) return;
        
        // Different music for different times of day
        let musicSource = '';
        
        switch(this.timeManager.timeOfDay) {
            case 'morning':
                musicSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAZAAAAbW9ybmluZ19tdXNpY19wbGFjZWhvbGRlcgA=';
                break;
            case 'afternoon':
                musicSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAcAAAAYWZ0ZXJub29uX211c2ljX3BsYWNlaG9sZGVyAA==';
                break;
            case 'evening':
                musicSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAaAAAAZXZlbmluZ19tdXNpY19wbGFjZWhvbGRlcgA=';
                break;
            case 'night':
                musicSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAYAAAAbmlnaHRfbXVzaWNfcGxhY2Vob2xkZXIA';
                break;
        }
        
        // Check if music is already playing this source
        if (this.bgMusic.src !== musicSource) {
            this.bgMusic.src = musicSource;
            this.bgMusic.play().catch(e => console.log("Audio play failed:", e));
        }
    }
    
    playSoundEffect(effect) {
        if (this.audioMuted) return;
        
        let soundSource = '';
        
        switch(effect) {
            case 'collect':
                soundSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAbAAAAY29sbGVjdF9zb3VuZF9wbGFjZWhvbGRlcgA=';
                break;
            case 'dialog':
                soundSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAaAAAAZGlhbG9nX3NvdW5kX3BsYWNlaG9sZGVyAA==';
                break;
            case 'photo':
                soundSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAZAAAAcGhvdG9fc291bmRfcGxhY2Vob2xkZXIA';
                break;
            case 'clue':
                soundSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAYAAAAY2x1ZV9zb3VuZF9wbGFjZWhvbGRlcgA=';
                break;
            case 'event':
                soundSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAZAAAAZXZlbnRfc291bmRfcGxhY2Vob2xkZXIA';
                break;
            case 'travel':
                soundSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAaAAAAdHJhdmVsX3NvdW5kX3BsYWNlaG9sZGVyAA==';
                break;
            case 'rain':
                soundSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAYAAAAcmFpbl9zb3VuZF9wbGFjZWhvbGRlcgA=';
                break;
            case 'thunder':
                soundSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAbAAAAdGh1bmRlcl9zb3VuZF9wbGFjZWhvbGRlcgA=';
                break;
            case 'mysterious':
                soundSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAA4AAAAbXlzdGVyaW91c193aGlzcGVyX3NvdW5kX3BsYWNlaG9sZGVyX3NvdW5kX3BsYWNlaG9sZGVyAA==';
                break;
            case 'distortion':
                soundSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAdAAAAZGlzdG9ydGlvbl9zb3VuZF9wbGFjZWhvbGRlcgA=';
                break;
            case 'minigame_success':
                soundSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAcAAAAc3VjY2Vzc19zb3VuZF9wbGFjZWhvbGRlcgA=';
                break;
            case 'minigame_fail':
                soundSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAYAAAAZmFpbF9zb3VuZF9wbGFjZWhvbGRlcgA=';
                break;
            case 'minigame_select':
                soundSource = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAaAAAAc2VsZWN0X3NvdW5kX3BsYWNlaG9sZGVyAA==';
                break;
        }
        
        this.soundEffect.src = soundSource;
        this.soundEffect.play().catch(e => console.log("Sound effect play failed:", e));
    }

    startGame() {
        if (this.isGameRunning) return;
        
        this.resetGame();
        this.createPlayer();
        this.createHouses();
        this.createNeighbors();
        this.createItems();
        
        // Create the world lighting overlay for time effects
        this.createWorldLighting();
        
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        this.isGameRunning = true;
        this.startButton.disabled = true;
        this.takePhotoButton.disabled = false;
        
        // Start the time loop using the TimeManager
        this.timeManager.startTimeLoop();
        
        // Play background music
        this.playBackgroundMusic();
        
        // Create weather effects
        this.createWeatherEffects();
        
        // Create mysterious effects
        this.createMysteriousEffects();
        
        // Setup end game option
        this.setupEndGameOption();
        
        // Add initial notebook entry for game start
        this.eventScheduler.addTimelineEntry({
            description: "Investigation started",
            type: "event",
            addToLog: true
        });
        
        // Show initial notification
        this.showNotification("Your investigation begins at Maplewood Lane...");
    }
    
    resetGame() {
        this.gameBoard.innerHTML = '';
        this.player = null;
        this.items = [];
        this.neighbors = [];
        this.houses = [];
        this.trust = 0;
        this.trustElement.textContent = this.trust;
        this.isGameRunning = false;
        
        // Reset time to 6:00 AM
        this.timeManager.time = 360;
        this.timeManager.dayCount = 1;
        this.timeManager.updateTimeDisplay();
        this.timeManager.updateTimeOfDay();
        this.timeOfDay = this.timeManager.timeOfDay;
        
        // Reset events and timeline
        this.eventTimeline = [];
        this.eventScheduler.eventTimeline = [];
        
        // Reset clues and photos
        this.foundClues = new Set();
        this.photos = [];
        this.photoDetails = [];
        
        // Clear intervals
        if (this.timeManager.timeInterval) {
            clearInterval(this.timeManager.timeInterval);
        }
        
        // Reset UI displays
        this.updateCluesDisplay();
    }
    
    // Create world lighting overlay for time-based ambient effects
    createWorldLighting() {
        const lighting = document.createElement('div');
        lighting.className = `world-lighting ${this.timeManager.timeOfDay}`;
        lighting.id = 'worldLighting';
        this.gameBoard.appendChild(lighting);
    }
    
    // Update world lighting based on time of day
    updateWorldLighting() {
        const lighting = document.getElementById('worldLighting');
        if (lighting) {
            lighting.className = `world-lighting ${this.timeManager.timeOfDay}`;
        }
    }
    
    // Handle key press events 
    handleKeyPress(e) {
        if (!this.isGameRunning || !this.player) return;
        
        const playerRect = this.player.getBoundingClientRect();
        
        let newX = parseInt(this.player.style.left) || 0;
        let newY = parseInt(this.player.style.top) || 0;
        
        // Movement keys
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                newX -= this.playerSpeed;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                newX += this.playerSpeed;
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                newY -= this.playerSpeed;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                newY += this.playerSpeed;
                break;
            // Time control keys
            case '+':
                // Speed up time
                this.timeManager.setTimeScale(this.timeManager.timeScale + 1);
                return;
            case '-':
                // Slow down time (minimum 1x)
                if (this.timeManager.timeScale > 1) {
                    this.timeManager.setTimeScale(this.timeManager.timeScale - 1);
                }
                return;
            case 'p':
            case 'P':
                // Pause/unpause time
                this.timeManager.togglePause();
                return;
            case 't':
            case 'T':
                // Skip ahead 1 hour
                this.timeManager.advanceTime(60);
                return;
        }
        
        // Boundary checks
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX > this.gameBoard.clientWidth - playerRect.width) {
            newX = this.gameBoard.clientWidth - playerRect.width;
        }
        if (newY > this.gameBoard.clientHeight - playerRect.height) {
            newY = this.gameBoard.clientHeight - playerRect.height;
        }
        
        this.player.style.left = `${newX}px`;
        this.player.style.top = `${newY}px`;
        
        // Check for collisions after movement
        this.checkCollisions();
        
        // Update map
        this.mapManager.updatePlayerPosition();
        
        // Check for events near player
        this.throttledCheckEvents();
    }
    
    // Trigger a time loop reset (if day loop mechanic is enabled)
    triggerTimeLoopReset() {
        this.showNotification(`Day ${this.timeManager.dayCount} - Time is looping...`, 10000);
        
        // Store trust value across loops
        const previousTrust = this.trust;
        
        // Store clues across loops
        const previousClues = new Set(this.foundClues);
        
        // Store any items that should persist across loops
        const persistentItems = [];
        
        // Add "deja vu" effect
        this.addDejaVuEffect();
        
        // Reset game state but maintain some progress
        this.resetGame();
        
        // Apply saved progress
        this.trust = previousTrust + 5; // Bonus for completing a loop
        this.trustElement.textContent = this.trust;
        
        // Restore clues
        previousClues.forEach(clue => {
            this.foundClues.add(clue);
        });
        
        // Add "loop awareness" clue
        this.foundClues.add(`You feel like you've lived this day before (${this.timeManager.dayCount - 1} times)`);
        this.addClueToNotebook(`You feel like you've lived this day before (${this.timeManager.dayCount - 1} times)`);
        
        // Update displays
        this.updateCluesDisplay();
        
        // Restart the day
        this.timeManager.startTimeLoop();
    }
    
    // Add deja vu visual effect
    addDejaVuEffect() {
        const dejaVu = document.createElement('div');
        dejaVu.className = 'deja-vu-effect';
        document.body.appendChild(dejaVu);
        
        setTimeout(() => {
            dejaVu.style.opacity = '0';
            setTimeout(() => dejaVu.remove(), 1000);
        }, 3000);
    }
    
    // Update timeline display in notebook
    updateTimelineDisplay() {
        const timelineContainer = document.getElementById('timelineContainer');
        if (!timelineContainer) return;
        
        timelineContainer.innerHTML = '';
        
        if (this.eventTimeline.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-timeline';
            emptyMessage.textContent = 'Your investigation timeline will appear here.';
            timelineContainer.appendChild(emptyMessage);
            return;
        }
        
        // Sort timeline by day and time
        const sortedTimeline = [...this.eventTimeline].sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;
            return a.time - b.time;
        });
        
        // Group by day
        let currentDay = null;
        
        sortedTimeline.forEach(entry => {
            // Add day header if new day
            if (currentDay !== entry.day) {
                currentDay = entry.day;
                const dayHeader = document.createElement('div');
                dayHeader.className = 'timeline-day-header';
                dayHeader.textContent = `Day ${currentDay}`;
                timelineContainer.appendChild(dayHeader);
            }
            
            // Create timeline entry
            const timelineEntry = document.createElement('div');
            timelineEntry.className = 'timeline-entry';
            
            // Add time
            const timeElement = document.createElement('div');
            timeElement.className = 'timeline-time';
            timeElement.textContent = entry.formattedTime;
            
            // Add event type indicator
            const typeIndicator = document.createElement('span');
            typeIndicator.className = `timeline-event-type event-type-${entry.type || 'event'}`;
            
            // Add description
            const description = document.createElement('div');
            description.className = 'timeline-description';
            description.textContent = entry.description;
            description.prepend(typeIndicator);
            
            // Assemble entry
            timelineEntry.appendChild(timeElement);
            timelineEntry.appendChild(description);
            
            timelineContainer.appendChild(timelineEntry);
        });
    }
    
    // Save the game state
    saveGame() {
        const saveData = {
            playerPosition: this.playerPosition,
            inventory: Array.from(this.inventory),
            discoveredLocations: Array.from(this.discoveredLocations),
            foundClues: Array.from(this.foundClues),
            photos: this.photos,
            timeData: {
                time: this.timeManager.time,
                dayCount: this.timeManager.dayCount,
                timeScale: this.timeManager.timeScale
            },
            flags: this.flags,
            relationships: this.relationshipManager ? this.relationshipManager.getSaveData() : null,
            gameVersion: this.gameVersion
        };
        
        localStorage.setItem('maplewood_save', JSON.stringify(saveData));
        this.showNotification('Game saved!');
        this.playSoundEffect('notification');
    }
    
    // Load a saved game by index
    loadGame(index) {
        if (index < 0 || index >= this.savedGames.length) return;
        
        const saveData = this.savedGames[index].data;
        
        // Reset game first
        this.resetGame();
        
        // Restore player position
        this.player.style.left = `${saveData.playerPosition.x}px`;
        this.player.style.top = `${saveData.playerPosition.y}px`;
        
        // Restore time using TimeManager
        this.timeManager.loadFromSave(saveData.timeManagerData);
        this.timeOfDay = this.timeManager.timeOfDay;
        
        // Update world lighting
        this.updateWorldLighting();
        
        // Apply time of day visuals
        document.body.className = `time-${this.timeOfDay}`;
        
        // Restore EventScheduler data
        this.eventScheduler.loadFromSave(saveData.eventSchedulerData);
        
        // Restore event timeline
        this.eventTimeline = saveData.eventTimeline || [];
        
        // Restore trust
        this.trust = saveData.trust;
        this.trustElement.textContent = this.trust;
        
        // Restore clues
        this.foundClues = new Set(saveData.foundClues);
        this.updateCluesDisplay();
        
        // Restore photos
        this.photos = saveData.photos || [];
        this.photoDetails = saveData.photoDetails || [];
        this.updatePhotosDisplay();
        
        // Start game
        this.isGameRunning = true;
        this.startButton.disabled = true;
        this.takePhotoButton.disabled = false;
        
        // Start time loop
        this.timeManager.startTimeLoop();
        
        // Update UI for the loaded game state
        this.updateTimelineDisplay();
        this.mapManager.updatePlayerPosition();
        
        this.showNotification('Game loaded');
    }
    
    // Check for events near player
    checkEvents() {
        if (!this.isGameRunning) return;
        
        const playerX = parseInt(this.player.style.left) || 0;
        const playerY = parseInt(this.player.style.top) || 0;
        
        this.events.forEach(event => {
            if (event.triggered) return; // Skip already triggered events
            
            // Check if player is close enough to trigger this event
            const distance = Math.sqrt(
                Math.pow(event.location.x - playerX, 2) +
                Math.pow(event.location.y - playerY, 2)
            );
            
            if (distance <= event.radius && 
                this.timeManager.timeOfDay === event.timeOfDay && 
                this.trust >= event.trustRequired) {
                
                // Trigger the event
                this.triggerEvent(event);
            }
        });
        
        // Also check for scheduled events based on player position
        this.timeManager.checkScheduledEvents();
    }

    createPlayer() {
        this.player = document.createElement('div');
        this.player.className = 'player';
        this.player.style.left = '50%';
        this.player.style.top = '50%';
        this.gameBoard.appendChild(this.player);
        this.updateMap();
    }

    createHouses() {
        const boardRect = this.gameBoard.getBoundingClientRect();
        const housePositions = [
            { x: 100, y: 100 }, // Mrs. Finch's house
            { x: 300, y: 150 }, // Jake & Lila's house
            { x: 500, y: 200 }, // Mr. Arnold's house
            { x: 700, y: 100 }  // Abandoned house
        ];
        
        for (let i = 0; i < this.houseCount; i++) {
            const house = document.createElement('div');
            house.className = 'house';
            
            const pos = housePositions[i];
            house.style.left = `${pos.x}px`;
            house.style.top = `${pos.y}px`;
            
            this.gameBoard.appendChild(house);
            this.houses.push(house);
        }
        this.updateMap();
    }

    createNeighbors() {
        const boardRect = this.gameBoard.getBoundingClientRect();
        const neighborPositions = [
            { x: 150, y: 150 }, // Mrs. Finch
            { x: 350, y: 200 }, // Jake & Lila
            { x: 550, y: 250 }  // Mr. Arnold
        ];
        
        for (let i = 0; i < this.neighborCount; i++) {
            const neighbor = document.createElement('div');
            neighbor.className = 'neighbor';
            
            const pos = neighborPositions[i];
            neighbor.style.left = `${pos.x}px`;
            neighbor.style.top = `${pos.y}px`;
            
            this.gameBoard.appendChild(neighbor);
            this.neighbors.push(neighbor);
        }
        this.updateMap();
    }

    createItems() {
        const boardRect = this.gameBoard.getBoundingClientRect();
        const itemPositions = [
            { x: 120, y: 120 }, // Near Mrs. Finch's
            { x: 320, y: 170 }, // Near Jake & Lila's
            { x: 520, y: 220 }, // Near Mr. Arnold's
            { x: 720, y: 120 }, // Near abandoned house
            { x: 400, y: 300 }  // In the park
        ];
        
        for (let i = 0; i < this.itemCount; i++) {
            const item = document.createElement('div');
            item.className = 'item';
            
            const pos = itemPositions[i];
            item.style.left = `${pos.x}px`;
            item.style.top = `${pos.y}px`;
            
            this.gameBoard.appendChild(item);
            this.items.push(item);
        }
        this.updateMap();
    }

    updateMap() {
        this.mapManager.update();
    }

    checkCollisions() {
        this.throttledCheckCollisions();
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    collectItem(item, index) {
        item.remove();
        this.items[index] = null;
        this.trust += 5;
        this.trustElement.textContent = this.trust;
        this.playSoundEffect('collect');

        // Add a random clue when collecting an item
        const availableClues = this.clues.filter(clue => 
            !this.foundClues.has(clue.text) && 
            clue.trustRequired <= this.trust &&
            clue.time === this.timeOfDay
        );

        if (availableClues.length > 0) {
            const randomClue = availableClues[Math.floor(Math.random() * availableClues.length)];
            this.foundClues.add(randomClue.text);
            this.addClueToNotebook(randomClue.text);
            this.playSoundEffect('clue');
        }

        if (this.items.every(item => item === null)) {
            this.endGame();
        }
    }

    interactWithNeighbor(neighbor, index) {
        // Open dialog with the appropriate character based on index
        const characterIds = ['mrs_finch', 'jake_lila', 'mr_arnold', 'camille'];
        if (index < characterIds.length) {
            const characterId = characterIds[index];
            
            // Use the DialogueManager to show appropriate dialogue
            this.dialogueManager.showDialogue(characterId);
        }
    }

    addClueToNotebook(clue) {
        // Auto-tag the clue based on its content
        const tags = this.autoTagClue(clue);
        const clueElement = document.createElement('div');
        clueElement.className = 'clue-entry';
        clueElement.innerHTML = `
            <p>${clue}</p>
            <div class="tags">${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
        `;
        this.cluesList.appendChild(clueElement);
    }
    
    autoTagClue(clue) {
        const tags = [];
        const lowerClue = clue.toLowerCase();
        
        // Check for keywords in each category
        Object.entries(this.tagKeywords).forEach(([category, keywords]) => {
            keywords.forEach(keyword => {
                if (lowerClue.includes(keyword.toLowerCase())) {
                    // Avoid duplicate tags
                    if (!tags.some(tag => tag.category === category && tag.value === keyword)) {
                        tags.push({
                            category: category,
                            value: keyword
                        });
                    }
                }
            });
        });
        
        return tags;
    }
    
    searchClues(searchTerm) {
        // Update clues display based on search term
        const clueItems = document.querySelectorAll('.clue-item');
        
        if (!searchTerm) {
            // If no search term, show all clues (subject to filters)
            this.updateCluesDisplay();
            return;
        }
        
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        clueItems.forEach(item => {
            const clueText = item.dataset.clue.toLowerCase();
            const visible = clueText.includes(lowerSearchTerm);
            
            // Show/hide based on search
            item.style.display = visible ? '' : 'none';
        });
    }
    
    switchNotebookView(viewMode) {
        this.notebookMode = viewMode;
        
        // Update active button
        this.listViewBtn.classList.toggle('active', viewMode === 'list');
        this.timelineViewBtn.classList.toggle('active', viewMode === 'timeline');
        
        // Clear current view
        this.cluesList.innerHTML = '';
        
        if (viewMode === 'timeline') {
            // Create timeline container
            const timelineContainer = document.createElement('div');
            timelineContainer.className = 'timeline-view';
            
            // Create timeline line
            const timelineLine = document.createElement('div');
            timelineLine.className = 'timeline-line';
            timelineContainer.appendChild(timelineLine);
            
            // Sort clues by their discovery time (we'll use the order they were added as a proxy)
            const timeBasedClues = Array.from(this.foundClues).map((clue, index) => {
                return { text: clue, index: index };
            });
            
            timeBasedClues.sort((a, b) => a.index - b.index);
            
            // Add clues to timeline
            timeBasedClues.forEach(clueObj => {
                const clue = clueObj.text;
                
                // Create timeline item
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                timelineItem.dataset.clue = clue;
                
                // Create fake discovery time (for demonstration)
                const discoveryTime = this.createFakeDiscoveryTime(clueObj.index);
                const timeElement = document.createElement('div');
                timeElement.className = 'timeline-time';
                timeElement.textContent = discoveryTime;
                timelineItem.appendChild(timeElement);
                
                // Add clue text
                const clueText = document.createElement('div');
                clueText.className = 'clue-text';
                clueText.textContent = clue;
                timelineItem.appendChild(clueText);
                
                // Add tags
                if (this.clueTags.has(clue)) {
                    const tagsContainer = document.createElement('div');
                    tagsContainer.className = 'clue-tags';
                    
                    this.clueTags.get(clue).forEach(tag => {
                        const tagElement = document.createElement('span');
                        tagElement.className = 'clue-tag ' + tag.category;
                        tagElement.textContent = tag.value;
                        tagsContainer.appendChild(tagElement);
                    });
                    
                    timelineItem.appendChild(tagsContainer);
                }
                
                // Add annotation if exists
                if (this.clueAnnotations.has(clue) && this.clueAnnotations.get(clue).trim()) {
                    const annotationContainer = document.createElement('div');
                    annotationContainer.className = 'clue-annotation';
                    annotationContainer.textContent = this.clueAnnotations.get(clue);
                    timelineItem.appendChild(annotationContainer);
                }
                
                // Add click handler for clue connections
                timelineItem.addEventListener('click', () => this.showClueConnections(clue));
                
                timelineContainer.appendChild(timelineItem);
            });
            
            this.cluesList.appendChild(timelineContainer);
        } else {
            // Recreate list view
            Array.from(this.foundClues).forEach(clue => {
                // Create clue item
                const clueItem = document.createElement('li');
                clueItem.className = 'clue-item';
                clueItem.dataset.clue = clue;
                
                // Add clue text
                const clueText = document.createElement('div');
                clueText.className = 'clue-text';
                clueText.textContent = clue;
                clueItem.appendChild(clueText);
                
                // Add tags
                if (this.clueTags.has(clue)) {
                    const tagsContainer = document.createElement('div');
                    tagsContainer.className = 'clue-tags';
                    
                    this.clueTags.get(clue).forEach(tag => {
                        const tagElement = document.createElement('span');
                        tagElement.className = 'clue-tag ' + tag.category;
                        tagElement.textContent = tag.value;
                        tagsContainer.appendChild(tagElement);
                    });
                    
                    clueItem.appendChild(tagsContainer);
                }
                
                // Add annotation if exists
                if (this.clueAnnotations.has(clue) && this.clueAnnotations.get(clue).trim()) {
                    const annotationContainer = document.createElement('div');
                    annotationContainer.className = 'clue-annotation';
                    annotationContainer.textContent = this.clueAnnotations.get(clue);
                    clueItem.appendChild(annotationContainer);
                }
                
                // Add click handler for clue connections
                clueItem.addEventListener('click', () => this.showClueConnections(clue));
                
                this.cluesList.appendChild(clueItem);
            });
        }
        
        // Apply filters
        this.updateCluesDisplay();
    }
    
    createFakeDiscoveryTime(index) {
        // Create a fake time of discovery based on the index
        // This is just for demonstration - in a real implementation you'd store actual timestamps
        const baseHour = 6; // Starting at 6 AM
        const hourIncrement = Math.floor(index / 3);
        const minuteIncrement = (index % 3) * 20;
        
        const hour = (baseHour + hourIncrement) % 24;
        const minute = minuteIncrement;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    }
    
    updateCluesDisplay() {
        // Display clues based on current filters
        const items = this.notebookMode === 'list' 
            ? document.querySelectorAll('.clue-item')
            : document.querySelectorAll('.timeline-item');
        
        items.forEach(item => {
            const clue = item.dataset.clue;
            let visible = true;
            
            // Apply tag filter
            if (this.clueFilters.tag && this.clueFilters.tag !== 'all') {
                // Check if clue has a tag in the selected category
                visible = this.clueTags.has(clue) && 
                          this.clueTags.get(clue).some(tag => tag.category === this.clueFilters.tag);
            }
            
            // Show/hide based on filter
            item.style.display = visible ? '' : 'none';
        });
    }
    
    updateClueConnections(newClue) {
        // Find the clue object with matching text
        const clueObj = this.clues.find(c => c.text === newClue);
        
        if (clueObj && clueObj.connections) {
            clueObj.connections.forEach(connectedClue => {
                // If we have both this clue and its connection, store the connection
                if (this.foundClues.has(connectedClue)) {
                    if (!this.clueConnections.has(newClue)) {
                        this.clueConnections.set(newClue, new Set());
                    }
                    this.clueConnections.get(newClue).add(connectedClue);
                    
                    if (!this.clueConnections.has(connectedClue)) {
                        this.clueConnections.set(connectedClue, new Set());
                    }
                    this.clueConnections.get(connectedClue).add(newClue);
                }
            });
        }
    }
    
    showClueConnections(clue) {
        // Highlight the selected clue
        document.querySelectorAll('.clue-item').forEach(item => {
            item.classList.remove('selected');
            item.classList.remove('connected');
        });
        
        const selectedClue = document.querySelector(`.clue-item[data-clue="${clue}"]`);
        if (selectedClue) {
            selectedClue.classList.add('selected');
            
            // Highlight connected clues
            if (this.clueConnections.has(clue)) {
                this.clueConnections.get(clue).forEach(connected => {
                    const connectedElement = document.querySelector(`.clue-item[data-clue="${connected}"]`);
                    if (connectedElement) {
                        connectedElement.classList.add('connected');
                    }
                });
                
                // Show connection details
                let connectionDiv = document.querySelector('.clue-connections');
                if (!connectionDiv) {
                    connectionDiv = document.createElement('div');
                    connectionDiv.className = 'clue-connections';
                    this.cluesList.after(connectionDiv);
                }
                
                connectionDiv.innerHTML = `
                    <p class="connection-title">Connected Clues:</p>
                    <ul>
                        ${Array.from(this.clueConnections.get(clue)).map(c => `<li>${c}</li>`).join('')}
                    </ul>
                `;
            } else {
                // Remove connection details if no connections
                const connectionDiv = document.querySelector('.clue-connections');
                if (connectionDiv) {
                    connectionDiv.remove();
                }
            }
        }
    }

    takePhoto() {
        if (!this.isGameRunning) return;

        // Get player position and nearby elements for the photo context
        const playerRect = this.player.getBoundingClientRect();
        const photoContext = {
            position: { x: parseInt(this.player.style.left), y: parseInt(this.player.style.top) },
            timeOfDay: this.timeManager.timeOfDay,
            nearbyElements: []
        };
        
        // Check nearby items, houses, and neighbors
        this.items.forEach((item, i) => {
            if (item) {
                const itemRect = item.getBoundingClientRect();
                const distance = Math.sqrt(
                    Math.pow(itemRect.left - playerRect.left, 2) +
                    Math.pow(itemRect.top - playerRect.top, 2)
                );
                
                if (distance < 150) {
                    photoContext.nearbyElements.push({ type: 'item', index: i });
                }
            }
        });
        
        this.houses.forEach((house, i) => {
            const houseRect = house.getBoundingClientRect();
            const distance = Math.sqrt(
                Math.pow(houseRect.left - playerRect.left, 2) +
                Math.pow(houseRect.top - playerRect.top, 2)
            );
            
            if (distance < 200) {
                photoContext.nearbyElements.push({ type: 'house', index: i });
            }
        });
        
        this.neighbors.forEach((neighbor, i) => {
            if (neighbor) {
                const neighborRect = neighbor.getBoundingClientRect();
                const distance = Math.sqrt(
                    Math.pow(neighborRect.left - playerRect.left, 2) +
                    Math.pow(neighborRect.top - playerRect.top, 2)
                );
                
                if (distance < 100) {
                    photoContext.nearbyElements.push({ type: 'neighbor', index: i });
                }
            }
        });
        
        // Determine photo type based on context - important for puzzle integration
        photoContext.type = this.determinePhotoType(photoContext);
        
        // Create photo container with enhanced functionality
        const photoContainer = document.createElement('div');
        photoContainer.className = 'photo-container';
        
        const photo = document.createElement('div');
        photo.className = 'photo';
        
        // Create a unique photo based on context
        const photoNum = this.photos.length + 1;
        const houseIndex = photoContext.nearbyElements.find(e => e.type === 'house')?.index ?? -1;
        const neighborIndex = photoContext.nearbyElements.find(e => e.type === 'neighbor')?.index ?? -1;
        const timeColor = this.getTimeOfDayColor();
        
        // Fix SVG encoding for use in CSS url - properly encode color values
        const encodedTimeColor = encodeURIComponent(`#${timeColor}`);
        const encodedAaa = encodeURIComponent('#aaa');
        const encodedBlue = encodeURIComponent('#3498db');
        
        photo.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${encodedTimeColor}"/>${houseIndex >= 0 ? `<rect x="30" y="40" width="40" height="30" fill="${encodedAaa}"/>` : ''}${neighborIndex >= 0 ? `<circle cx="50" cy="50" r="15" fill="${encodedBlue}"/>` : ''}<text x="50" y="20" font-family="Arial" font-size="10" fill="white" text-anchor="middle">Photo ${photoNum}</text></svg>')`;
        
        photoContainer.appendChild(photo);
        
        // Add action buttons
        const photoActions = document.createElement('div');
        photoActions.className = 'photo-actions';
        
        const examineBtn = document.createElement('button');
        examineBtn.className = 'photo-action-btn';
        examineBtn.textContent = 'Examine';
        examineBtn.addEventListener('click', () => {
            this.examinePhoto(photoNum - 1);
        });
        
        const analyzeBtn = document.createElement('button');
        analyzeBtn.className = 'photo-action-btn';
        analyzeBtn.textContent = 'Analyze';
        analyzeBtn.addEventListener('click', () => {
            this.analyzePhoto(photoNum - 1);
        });
        
        photoActions.appendChild(examineBtn);
        photoActions.appendChild(analyzeBtn);
        
        photoContainer.appendChild(photoActions);
        
        this.photosGrid.appendChild(photoContainer);
        this.photos.push(photo);
        
        // Set photo ID based on type for puzzle system integration
        photoContext.id = `${photoContext.type}_photo_${photoNum}`;
        
        this.photoDetails.push(photoContext);
        
        // Update puzzles that depend on photos
        if (this.puzzleManager) {
            this.puzzleManager.updatePuzzles();
        }
        
        this.playSoundEffect('photo');
    }
    
    // New method to determine photo type based on context
    determinePhotoType(photoContext) {
        // Check for specific photo types needed for puzzles
        if (photoContext.timeOfDay === 'night') {
            if (photoContext.nearbyElements.some(e => e.type === 'house' && e.index === 0)) {
                return 'flickerPhoto';
            }
            if (photoContext.nearbyElements.some(e => e.type === 'house' && e.index === 3)) {
                return 'shadowPhoto';
            }
        }
        
        // Check for house directional photos
        const houseElement = photoContext.nearbyElements.find(e => e.type === 'house' && e.index === 3);
        if (houseElement) {
            // Determine direction based on player position relative to house
            const housePos = { x: 700, y: 100 }; // Position of abandoned house
            const playerPos = photoContext.position;
            
            if (playerPos.x < housePos.x - 50) return 'house_west';
            if (playerPos.x > housePos.x + 50) return 'house_east';
            if (playerPos.y < housePos.y - 50) return 'house_north';
            if (playerPos.y > housePos.y + 50) return 'house_south';
        }
        
        // Check for well photo
        if (photoContext.timeOfDay === 'evening' &&
            Math.abs(photoContext.position.x - 400) < 100 && 
            Math.abs(photoContext.position.y - 300) < 100) {
            return 'wellPhoto';
        }
        
        // Check for Jake & Lila with Iris (for contradiction puzzle)
        if (photoContext.nearbyElements.some(e => e.type === 'neighbor' && e.index === 1) &&
            photoContext.position.x > 350 && photoContext.position.x < 450 &&
            photoContext.position.y > 250 && photoContext.position.y < 350) {
            return 'well_meeting';
        }
        
        // Default photo type
        return 'generic';
    }
    
    getTimeOfDayColor() {
        switch(this.timeManager.timeOfDay) {
            case 'morning': return '87CEEB';
            case 'afternoon': return 'FFD700';
            case 'evening': return 'FF8C00';
            case 'night': return '1a1a2e';
            default: return '2c3e50';
        }
    }
    
    examinePhoto(index) {
        if (index < 0 || index >= this.photos.length) return;
        
        // Create a fullview overlay
        const fullview = document.createElement('div');
        fullview.className = 'photo-fullview';
        
        const content = document.createElement('div');
        content.className = 'photo-fullview-content';
        
        // Create a larger version of the photo
        const largePhoto = document.createElement('div');
        largePhoto.style.width = '500px';
        largePhoto.style.height = '400px';
        largePhoto.style.background = this.photos[index].style.backgroundImage;
        largePhoto.style.backgroundSize = 'cover';
        largePhoto.style.borderRadius = '5px';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'fullview-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => fullview.remove());
        
        content.appendChild(largePhoto);
        content.appendChild(closeBtn);
        fullview.appendChild(content);
        
        document.body.appendChild(fullview);
        fullview.style.display = 'flex';
    }
    
    // Modified analyzePhoto method to better support puzzle system
    analyzePhoto(index) {
        if (index < 0 || index >= this.photoDetails.length) return;
        
        const photoContext = this.photoDetails[index];
        let analysisResult = '';
        
        // Generate analysis based on the photo's context
        analysisResult += `Time of day: ${this.formatTimeOfDay(photoContext.timeOfDay)}\n`;
        analysisResult += `Location: X:${photoContext.position.x}, Y:${photoContext.position.y}\n`;
        analysisResult += `Photo type: ${photoContext.type}\n\n`;
        
        if (photoContext.nearbyElements.length > 0) {
            analysisResult += 'Detected elements:\n';
            
            photoContext.nearbyElements.forEach(element => {
                if (element.type === 'house') {
                    const houseNames = ['Mrs. Finch\'s House', 'Jake & Lila\'s House', 'Mr. Arnold\'s House', 'Abandoned House'];
                    analysisResult += `- ${houseNames[element.index] || 'Unknown House'}\n`;
                } else if (element.type === 'neighbor') {
                    const neighborNames = ['Mrs. Finch', 'Jake & Lila', 'Mr. Arnold'];
                    analysisResult += `- ${neighborNames[element.index] || 'Unknown Person'}\n`;
                } else if (element.type === 'item') {
                    analysisResult += '- Mysterious Object\n';
                }
            });
            
            // Add potential clue hints based on photo contents
            if (photoContext.timeOfDay === 'night') {
                if (photoContext.nearbyElements.some(e => e.type === 'house' && e.index === 0)) {
                    analysisResult += '\nNote: There appears to be flickering light in the basement window.';
                } else if (photoContext.nearbyElements.some(e => e.type === 'house' && e.index === 3)) {
                    analysisResult += '\nNote: There seems to be a shadow moving behind the window.';
                }
            }
            
            // Add hints for puzzle-related photos
            if (photoContext.type === 'well_meeting') {
                analysisResult += '\nImportant: This photo shows Jake speaking with someone by the well. The person appears to be Iris Bell.';
            } else if (photoContext.type.startsWith('house_')) {
                analysisResult += '\nThis angle of the abandoned house might reveal something when combined with other perspectives.';
            }
        } else {
            analysisResult += 'No significant elements detected.';
        }
        
        // Show analysis in a modal
        alert(`Photo Analysis:\n\n${analysisResult}`);
        
        // 20% chance to discover a relevant clue through photo analysis
        if (Math.random() < 0.2) {
            const relevantClues = this.clues.filter(clue => 
                !this.foundClues.has(clue.text) && 
                clue.time === photoContext.timeOfDay &&
                clue.trustRequired <= this.trust
            );
            
            if (relevantClues.length > 0) {
                const randomClue = relevantClues[Math.floor(Math.random() * relevantClues.length)];
                this.foundClues.add(randomClue.text);
                this.addClueToNotebook(randomClue.text);
                
                // Check if this clue activates any puzzles
                if (this.puzzleManager) {
                    this.puzzleManager.updatePuzzles();
                }
            }
        }
    }
    
    // Helper method for DialogueManager and PuzzleManager to check photo requirements
    checkPhotoRequirement(photoType) {
        if (!this.photoDetails || this.photoDetails.length === 0) {
            return false;
        }
        
        if (!Array.isArray(photoType)) {
            photoType = [photoType];
        }
        
        return this.photoDetails.some(photo => {
            return photoType.some(type => {
                // Direct match on the photo type
                if (photo.type === type) {
                    return true;
                }
                
                // Fall back to more complex checks if needed
                switch(type) {
                    case "flickerPhoto":
                    case "flickering_light":
                        return photo.timeOfDay === "night" && 
                               photo.nearbyElements.some(e => e.type === 'house' && e.index === 0);
                    case "shadowPhoto":
                    case "shadow":
                        return photo.timeOfDay === "night" && 
                               photo.nearbyElements.some(e => e.type === 'house' && e.index === 3);
                    case "wellPhoto":
                    case "well":
                        return photo.timeOfDay === "evening" &&
                               Math.abs(photo.position.x - 400) < 100 && 
                               Math.abs(photo.position.y - 300) < 100;
                    case "well_meeting_photo":
                    case "well_meeting":
                        return photo.type === "well_meeting";
                    case "house_east":
                    case "house_north":
                    case "house_west":
                    case "house_south":
                        return photo.type === type;
                    default:
                        return false;
                }
            });
        });
    }
    
    formatTimeOfDay(timeOfDay) {
        switch(timeOfDay) {
            case 'morning': return 'Morning (6 AM - 12 PM)';
            case 'afternoon': return 'Afternoon (12 PM - 5 PM)';
            case 'evening': return 'Evening (5 PM - 8 PM)';
            case 'night': return 'Night (8 PM - 6 AM)';
            default: return timeOfDay;
        }
    }
    
    showDialog(characterId, dialogNode = 'default') {
        if (!DIALOGUES[characterId]) return;
        
        this.currentCharacter = characterId;
        const character = DIALOGUES[characterId];
        const dialog = character[dialogNode] || character.default;
        
        this.dialogCharacterName.textContent = character.name;
        
        // Update character portrait with trust indicator
        this.dialogPortrait.className = 'character-portrait ' + character.portrait;
        if (this.relationshipManager) {
            const trustTier = this.relationshipManager.getTrustTier(characterId).toLowerCase();
            this.dialogPortrait.classList.add('trust-' + trustTier);
        }
        
        // Apply styling based on trust tier
        this.applyDialogStyling(dialog, 
            this.relationshipManager ? this.relationshipManager.getTrustTier(characterId) : '');
        
        this.dialogText.textContent = dialog.text;
        
        // Clear previous options
        this.dialogOptions.innerHTML = '';
        
        // Add new options
        if (dialog.options) {
            dialog.options.forEach(option => {
                // Check if this option has requirements
                let meetsRequirements = true;
                let requirementText = '';
                
                // Trust requirement check
                if (option.minTrust) {
                    const currentTrust = this.relationshipManager ? 
                        this.relationshipManager.getTrustLevel(characterId) : 0;
                    
                    if (currentTrust < option.minTrust) {
                        meetsRequirements = false;
                        requirementText = `Requires Trust: ${option.minTrust}`;
                    }
                }
                
                // Other requirements check
                if (option.requires && !this.checkRequirement(option.requires)) {
                    meetsRequirements = false;
                }
                
                const optionElement = document.createElement('div');
                optionElement.className = 'dialog-option';
                optionElement.textContent = option.text;
                
                // Add trust requirement indicator
                if (option.minTrust) {
                    optionElement.setAttribute('data-requires-trust', `Trust: ${option.minTrust}`);
                }
                
                if (!meetsRequirements) {
                    optionElement.classList.add('disabled');
                    optionElement.title = requirementText;
                } else {
                    optionElement.addEventListener('click', () => {
                        // Handle dialog option selection
                        if (option.next) {
                            this.showDialog(characterId, option.next);
                        }
                        
                        // Handle trust changes if specified
                        if (option.trustChange) {
                            const trustResult = this.relationshipManager.adjustTrust(
                                characterId, 
                                option.trustChange, 
                                option.trustChangeReason || `Selected dialog option: "${option.text}"`
                            );
                            
                            // If tier changed, potentially unlock new dialogue
                            if (trustResult && trustResult.tierChanged) {
                                // Could trigger special dialogue or event here
                                console.log(`Trust tier changed from ${trustResult.previousTier} to ${trustResult.newTier}`);
                            }
                        }
                        
                        // Handle giving clues
                        if (option.givesClue) {
                            this.addClueToNotebook(option.givesClue);
                        }
                        
                        // Handle setting flags or game state
                        if (option.setFlag) {
                            const [flag, value] = option.setFlag.split('=');
                            this.flags[flag.trim()] = value ? value.trim() : true;
                        }
                        
                        // Handle ending dialogue
                        if (option.end) {
                            this.hideDialog();
                        }
                    });
                }
                
                this.dialogOptions.appendChild(optionElement);
            });
        }
        
        // Show the dialog overlay
        this.dialogOverlay.style.display = 'flex';
    }
    
    /**
     * Check if a requirement is met
     * @param {Object} requirement - Requirement to check
     * @returns {boolean} Whether the requirement is met
     */
    checkRequirement(requirement) {
        if (requirement.trust && this.relationshipManager) {
            // Check character-specific trust
            return this.relationshipManager.meetsMinimumTrust(requirement.character || this.currentCharacter, requirement.trust);
        } else if (requirement.trust) {
            // Fall back to global trust
            return this.trust >= requirement.trust;
        }
        
        if (requirement.clue) {
            return this.foundClues.has(requirement.clue);
        }
        
        if (requirement.time) {
            return this.timeManager.timeOfDay === requirement.time;
        }
        
        if (requirement.photo) {
            return this.photos.some(photo => this.determinePhotoType(photo) === requirement.photo);
        }
        
        // Default to true if no recognized requirement
        return true;
    }
    
    applyDialogStyling(dialog, trustTier = '') {
        // Reset any previous custom styling
        this.dialogText.classList.remove('mysterious', 'urgent', 'friendly', 'suspicious');
        this.dialogOverlay.classList.remove('night-dialog', 'morning-dialog', 'afternoon-dialog', 'evening-dialog');
        
        // Apply time of day styling
        this.dialogOverlay.classList.add(`${this.timeManager.timeOfDay}-dialog`);
        
        // Apply mood styling if specified
        if (dialog.mood) {
            this.dialogText.classList.add(dialog.mood);
        }
        
        // Apply different styling based on trust levels
        if (this.trust < 20) {
            this.dialogText.classList.add('suspicious');
        } else if (this.trust >= 60) {
            this.dialogText.classList.add('friendly');
        }
        
        // Add trust tier class
        this.dialogPortrait.classList.add('trust-' + trustTier);
    }
    
    hideDialog() {
        this.dialogOverlay.style.display = 'none';
        this.currentDialog = null;
        this.currentCharacter = null;
    }

    endGame() {
        this.isGameRunning = false;
        this.startButton.disabled = false;
        this.takePhotoButton.disabled = true;
        clearInterval(this.timeInterval);
        alert(`Game Over! You discovered ${this.foundClues.size} clues and gained ${this.trust} trust points!`);
    }

    zoomMap(direction) {
        this.mapManager.zoomMap(direction);
    }

    resetMapZoom() {
        this.mapManager.resetMapZoom();
    }

    focusOnLocation(type, coordinates) {
        const mapTab = document.getElementById('mapTab');
        const notebookTabs = document.querySelectorAll('.tab');
        
        // Switch to map tab if not active
        if (!mapTab.classList.contains('active')) {
            notebookTabs.forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            const mapTabBtn = document.querySelector('.tab[data-tab="map"]');
            mapTabBtn.classList.add('active');
            mapTab.classList.add('active');
        }
        
        // Handle focus based on type
        if (type === 'location') {
            const location = this.mapManager.mapLocations.find(loc => loc.id === coordinates);
            if (location) {
                // Center map on this location
                const fullMap = document.getElementById('fullMap');
                const mapTabContent = document.getElementById('mapTab');
                
                // Calculate center position
                const viewportWidth = mapTabContent.clientWidth;
                const viewportHeight = mapTabContent.clientHeight;
                
                // Use smooth scrolling to center
                fullMap.scrollTo({
                    left: location.coordinates.x - viewportWidth / 2,
                    top: location.coordinates.y - viewportHeight / 2,
                    behavior: 'smooth'
                });
                
                // Highlight the location marker
                const marker = document.querySelector(`.map-marker[data-location-id="${coordinates}"]`);
                if (marker) {
                    marker.classList.add('focused');
                    
                    // Remove focus class after animation
                    setTimeout(() => {
                        marker.classList.remove('focused');
                    }, 2000);
                }
            }
        } else if (type === 'player') {
            // Center map on player
            const playerX = this.player.offsetLeft + this.player.offsetWidth / 2;
            const playerY = this.player.offsetTop + this.player.offsetHeight / 2;
            
            const fullMap = document.getElementById('fullMap');
            const mapTabContent = document.getElementById('mapTab');
            
            // Calculate center position
            const viewportWidth = mapTabContent.clientWidth;
            const viewportHeight = mapTabContent.clientHeight;
            
            // Use smooth scrolling to center
            fullMap.scrollTo({
                left: playerX - viewportWidth / 2,
                top: playerY - viewportHeight / 2,
                behavior: 'smooth'
            });
        } else if (type === 'custom') {
            // Center on custom coordinates
            const fullMap = document.getElementById('fullMap');
            const mapTabContent = document.getElementById('mapTab');
            
            // Calculate center position
            const viewportWidth = mapTabContent.clientWidth;
            const viewportHeight = mapTabContent.clientHeight;
            
            // Use smooth scrolling to center
            fullMap.scrollTo({
                left: coordinates.x - viewportWidth / 2,
                top: coordinates.y - viewportHeight / 2,
                behavior: 'smooth'
            });
        }
    }

    showNotification(message) {
        // Create notification element if it doesn't exist
        if (!this.notificationElement) {
            this.notificationElement = document.createElement('div');
            this.notificationElement.className = 'game-notification';
            document.body.appendChild(this.notificationElement);
        }
        
        // Set message and show
        this.notificationElement.textContent = message;
        this.notificationElement.classList.add('show');
        
        // Hide after delay
        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = setTimeout(() => {
            this.notificationElement.classList.remove('show');
        }, 3000);
    }

    playSoundEffect(sound) {
        const soundEffect = document.getElementById('soundEffect');
        
        // Different sound effects
        const sounds = {
            'discovery': 'assets/audio/discovery.mp3',
            'clue': 'assets/audio/clue.mp3',
            'error': 'assets/audio/error.mp3',
            'success': 'assets/audio/success.mp3',
            'photo': 'assets/audio/photo.mp3',
            'page': 'assets/audio/page.mp3',
            'footsteps': 'assets/audio/footsteps.mp3',
            'door': 'assets/audio/door.mp3',
            'whisper': 'assets/audio/whisper.mp3',
            'creak': 'assets/audio/creak.mp3',
            'wind': 'assets/audio/wind.mp3',
            'cat': 'assets/audio/cat.mp3'
        };
        
        // If we have the sound, play it
        if (sounds[sound]) {
            const source = soundEffect.querySelector('source');
            source.src = sounds[sound];
            soundEffect.load();
            soundEffect.play().catch(e => console.error("Error playing sound:", e));
        } else {
            console.warn(`Sound effect "${sound}" not found`);
        }
    }

    unlockLocation(locationId) {
        return this.mapManager.discoverLocation(locationId);
    }

    isLocationDiscovered(locationId) {
        const location = this.mapManager.mapLocations.find(loc => loc.id === locationId);
        return location ? location.discovered : false;
    }

    triggerMapEffect(effectType, position) {
        this.mapManager.createAmbientEffect(effectType, position.x, position.y);
    }

    // Use eventScheduler for event checking
    checkEvents() {
        if (!this.isGameRunning) return;
        
        const playerX = parseInt(this.player.style.left) || 0;
        const playerY = parseInt(this.player.style.top) || 0;
        
        this.events.forEach(event => {
            if (event.triggered) return; // Skip already triggered events
            
            // Check if player is close enough to trigger this event
            const distance = Math.sqrt(
                Math.pow(event.location.x - playerX, 2) +
                Math.pow(event.location.y - playerY, 2)
            );
            
            if (distance <= event.radius && 
                this.timeManager.timeOfDay === event.timeOfDay && 
                this.trust >= event.trustRequired) {
                
                // Trigger the event
                this.triggerEvent(event);
            }
        });
        
        // Also check for scheduled events based on player position
        this.timeManager.checkScheduledEvents();
    }

    triggerEvent(event) {
        // Mark as triggered so it doesn't repeat
        event.triggered = true;
        
        // Sanity impact for events
        if (event.sanityImpact) {
            this.updateSanity(event.sanityImpact);
        } else {
            // Default small sanity decrease for any mysterious event
            this.updateSanity(-5);
        }
        
        // Show event message
        const eventDialog = document.createElement('div');
        eventDialog.className = 'dialog-overlay';
        eventDialog.style.display = 'flex';
        
        const dialogContent = document.createElement('div');
        dialogContent.className = 'dialog-box';
        
        const header = document.createElement('h3');
        header.textContent = 'Strange Occurrence';
        header.style.textAlign = 'center';
        header.style.marginBottom = '20px';
        
        const messageText = document.createElement('p');
        messageText.textContent = event.message;
        messageText.style.lineHeight = '1.5';
        messageText.style.marginBottom = '20px';
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.alignSelf = 'flex-end';
        closeButton.addEventListener('click', () => {
            eventDialog.remove();
            
            // Add event clue to notebook if specified
            if (event.clue && !this.foundClues.has(event.clue)) {
                this.foundClues.add(event.clue);
                this.addClueToNotebook(event.clue);
                this.playSoundEffect('clue');
            }
        });
        
        dialogContent.appendChild(header);
        dialogContent.appendChild(messageText);
        dialogContent.appendChild(closeButton);
        eventDialog.appendChild(dialogContent);
        
        document.body.appendChild(eventDialog);
        this.playSoundEffect('event');
    }

    setupEndGameOption() {
        // Create end game button
        const endGameBtn = document.createElement('button');
        endGameBtn.id = 'endGame';
        endGameBtn.textContent = 'Conclude Investigation';
        endGameBtn.style.display = 'none'; // Hidden until sufficient progress
        endGameBtn.addEventListener('click', () => this.showEndGameConfirmation());
        
        // Add button to controls
        const controlsDiv = document.querySelector('.controls');
        controlsDiv.appendChild(endGameBtn);
        
        // Check for end game availability every 2 minutes
        setInterval(() => this.checkEndGameAvailability(), 120000);
    }
    
    checkEndGameAvailability() {
        if (!this.isGameRunning) return;
        
        // Make end game option available after reaching threshold conditions
        const endGameBtn = document.getElementById('endGame');
        if (this.foundClues.size >= 3 || this.trust >= 30 || this.timeManager.time >= 720) { // 12+ in-game hours
            endGameBtn.style.display = 'block';
        }
    }
    
    showEndGameConfirmation() {
        const confirmDialog = document.createElement('div');
        confirmDialog.className = 'dialog-overlay';
        confirmDialog.style.display = 'flex';
        
        const dialogContent = document.createElement('div');
        dialogContent.className = 'dialog-box';
        
        const header = document.createElement('h3');
        header.textContent = 'Conclude Your Investigation?';
        header.style.textAlign = 'center';
        header.style.marginBottom = '20px';
        
        const messageText = document.createElement('p');
        messageText.textContent = 'Are you sure you want to conclude your investigation? This will end the game and reveal your ending based on your discoveries and relationships.';
        messageText.style.lineHeight = '1.5';
        messageText.style.marginBottom = '20px';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.width = '100%';
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Continue Investigating';
        cancelButton.style.flex = '1';
        cancelButton.style.marginRight = '10px';
        cancelButton.addEventListener('click', () => {
            confirmDialog.remove();
        });
        
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Conclude Investigation';
        confirmButton.style.flex = '1';
        confirmButton.style.marginLeft = '10px';
        confirmButton.addEventListener('click', () => {
            confirmDialog.remove();
            this.concludeGame();
        });
        
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(confirmButton);
        
        dialogContent.appendChild(header);
        dialogContent.appendChild(messageText);
        dialogContent.appendChild(buttonContainer);
        confirmDialog.appendChild(dialogContent);
        
        document.body.appendChild(confirmDialog);
    }
    
    concludeGame() {
        // Determine which ending the player receives
        const ending = this.determineEnding();
        
        // Show ending screen
        this.showEnding(ending);
        
        // Stop the game
        this.isGameRunning = false;
        clearInterval(this.timeInterval);
    }
    
    determineEnding() {
        // Default ending if no conditions are met
        let possibleEndings = [...this.endings];
        
        // Filter endings based on requirements
        possibleEndings = possibleEndings.filter(ending => {
            const req = ending.requirements;
            
            // Check trust requirements
            if (req.minTrust && this.trust < req.minTrust) return false;
            if (req.maxTrust && this.trust > req.maxTrust) return false;
            
            // Check clue count requirements
            if (req.minClues && this.foundClues.size < req.minClues) return false;
            if (req.maxClues && this.foundClues.size > req.maxClues) return false;
            
            // Check for specific required clues
            if (req.requiredClues) {
                for (const clue of req.requiredClues) {
                    if (!this.foundClues.has(clue)) return false;
                }
            }
            
            // Check photo requirements
            if (req.photos && this.photos.length < req.photos) return false;
            
            return true;
        });
        
        // If no ending conditions are met, use the casual observer ending
        if (possibleEndings.length === 0) {
            return this.endings.find(e => e.id === "casual_observer");
        }
        
        // If multiple endings are possible, prioritize ones that require higher trust or more clues
        if (possibleEndings.length > 1) {
            possibleEndings.sort((a, b) => {
                // Prioritize by required clues
                const aClueReq = a.requirements.minClues || 0;
                const bClueReq = b.requirements.minClues || 0;
                if (aClueReq !== bClueReq) return bClueReq - aClueReq;
                
                // Then by trust
                const aTrustReq = a.requirements.minTrust || 0;
                const bTrustReq = b.requirements.minTrust || 0;
                return bTrustReq - aTrustReq;
            });
        }
        
        return possibleEndings[0];
    }
    
    showEnding(ending) {
        // Create ending screen
        const endingScreen = document.createElement('div');
        endingScreen.className = 'dialog-overlay';
        endingScreen.style.display = 'flex';
        
        const content = document.createElement('div');
        content.className = 'dialog-box ending-screen';
        content.style.width = '700px';
        content.style.maxWidth = '90%';
        content.style.padding = '30px';
        
        const title = document.createElement('h2');
        title.textContent = ending.name;
        title.style.textAlign = 'center';
        title.style.color = '#3498db';
        title.style.marginBottom = '20px';
        title.style.fontSize = '24px';
        
        const description = document.createElement('p');
        description.textContent = ending.description;
        description.style.lineHeight = '1.6';
        description.style.marginBottom = '30px';
        description.style.fontSize = '16px';
        
        const stats = document.createElement('div');
        stats.style.backgroundColor = 'rgba(52, 73, 94, 0.5)';
        stats.style.padding = '15px';
        stats.style.borderRadius = '5px';
        stats.style.marginBottom = '20px';
        
        stats.innerHTML = `
            <h3 style="margin-bottom: 10px; font-size: 18px;">Your Investigation</h3>
            <p><strong>Trust Level:</strong> ${this.trust}</p>
            <p><strong>Clues Discovered:</strong> ${this.foundClues.size} / ${this.clues.length + Object.keys(this.events).length}</p>
            <p><strong>Photos Taken:</strong> ${this.photos.length}</p>
            <p><strong>Time Spent:</strong> ${Math.floor((this.timeManager.time - 360) / 60)} hours ${(this.timeManager.time - 360) % 60} minutes</p>
        `;
        
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Start New Investigation';
        restartButton.style.width = '100%';
        restartButton.style.padding = '12px';
        restartButton.style.marginTop = '10px';
        restartButton.addEventListener('click', () => {
            endingScreen.remove();
            this.startButton.disabled = false;
            this.startGame();
        });
        
        content.appendChild(title);
        content.appendChild(description);
        content.appendChild(stats);
        content.appendChild(restartButton);
        endingScreen.appendChild(content);
        
        document.body.appendChild(endingScreen);
    }

    createWeatherEffects() {
        // Create weather container
        const weatherContainer = document.createElement('div');
        weatherContainer.className = 'weather-container';
        
        // Add rain effect
        const rainEffect = document.createElement('div');
        rainEffect.className = 'rain';
        weatherContainer.appendChild(rainEffect);
        
        // Add fog effect
        const fogEffect = document.createElement('div');
        fogEffect.className = 'fog';
        weatherContainer.appendChild(fogEffect);
        
        // Add lightning effect
        const lightningEffect = document.createElement('div');
        lightningEffect.className = 'lightning';
        weatherContainer.appendChild(lightningEffect);
        
        // Add thunder sound
        const thunderSound = document.createElement('audio');
        thunderSound.className = 'thunder-sound';
        thunderSound.innerHTML = '<source src="data:audio/mpeg;base64,SUQzBAAAAAAAI1RJVDIAAAAZAAAAdGh1bmRlcl9zb3VuZF9wbGFjZWhvbGRlcgA=" type="audio/mpeg">';
        weatherContainer.appendChild(thunderSound);
        
        // Add the weather container to the game board
        this.gameBoard.appendChild(weatherContainer);
        
        // Create mysterious atmosphere effects
        this.createMysteriousEffects();
    }
    
    createMysteriousEffects() {
        // Create mysterious glow effect (blue ethereal glow)
        const mysteriousGlow = document.createElement('div');
        mysteriousGlow.className = 'mysterious-glow';
        this.gameBoard.appendChild(mysteriousGlow);
        
        // Create mysterious shadow effect (figure shadow)
        const mysteriousShadow = document.createElement('div');
        mysteriousShadow.className = 'mysterious-shadow';
        this.gameBoard.appendChild(mysteriousShadow);
        
        // Store references
        this.mysteriousGlow = mysteriousGlow;
        this.mysteriousShadow = mysteriousShadow;
    }
    
    updateWeather() {
        this.throttledUpdateWeather();
    }
    
    applyWeatherEffects() {
        const rainElement = document.querySelector('.rain');
        const fogElement = document.querySelector('.fog');
        const lightningElement = document.querySelector('.lightning');
        const thunderSound = document.querySelector('.thunder-sound');
        
        // Reset all effects
        rainElement.classList.remove('active');
        fogElement.classList.remove('active');
        clearInterval(this.atmosphereEffects.lightningInterval);
        
        // Apply new effects
        switch (this.weather.currentWeather) {
            case 'rain':
                rainElement.classList.add('active');
                this.playSoundEffect('rain');
                break;
                
            case 'fog':
                fogElement.classList.add('active');
                break;
                
            case 'storm':
                rainElement.classList.add('active');
                this.playSoundEffect('rain');
                
                // Add lightning flashes
                this.atmosphereEffects.lightningInterval = setInterval(() => {
                    // Only occasionally show lightning
                    if (Math.random() < 0.2) {
                        lightningElement.style.animation = 'lightning-flash 2s';
                        
                        // Reset the animation after it completes
                        setTimeout(() => {
                            lightningElement.style.animation = '';
                            if (!this.audioMuted) {
                                thunderSound.currentTime = 0;
                                thunderSound.play().catch(e => console.log("Thunder sound failed:", e));
                            }
                        }, 2000);
                    }
                }, 10000); // Check for lightning every 10 seconds
                break;
        }
    }
    
    updateMysteriousEffects() {
        // Only apply mysterious effects at night or evening and when player has sufficient trust/clues
        const shouldShowEffects = 
            (this.timeManager.timeOfDay === 'night' || this.timeManager.timeOfDay === 'evening') && 
            (this.trust >= 30 || this.foundClues.size >= 3);
            
        // Update mysterious glow
        const locations = [
            { x: 700, y: 100 }, // Abandoned house
            { x: 400, y: 300 }, // Well
            { x: 550, y: 250 }  // Mr. Arnold's yard
        ];
        
        // Check if the player is near any of these locations
        const playerX = parseInt(this.player.style.left) || 0;
        const playerY = parseInt(this.player.style.top) || 0;
        
        let nearMysteriousSpot = false;
        let spotPosition = null;
        
        for (const location of locations) {
            const distance = Math.sqrt(
                Math.pow(location.x - playerX, 2) +
                Math.pow(location.y - playerY, 2)
            );
            
            if (distance < 150) {
                nearMysteriousSpot = true;
                spotPosition = location;
                break;
            }
        }
        
        // Only show effects if near a mysterious spot and conditions are right
        if (shouldShowEffects && nearMysteriousSpot && spotPosition) {
            // Random chance to show the glow
            if (Math.random() < 0.3 && !this.mysteriousGlow.classList.contains('active')) {
                this.mysteriousGlow.style.left = `${spotPosition.x - 50}px`;
                this.mysteriousGlow.style.top = `${spotPosition.y - 50}px`;
                this.mysteriousGlow.classList.add('active');
                
                // Remove after a while
                setTimeout(() => {
                    this.mysteriousGlow.classList.remove('active');
                }, 5000 + Math.random() * 5000);
            }
            
            // Random chance to show shadows at the abandoned house
            if (spotPosition.x === 700 && spotPosition.y === 100 && Math.random() < 0.2 && 
                !this.mysteriousShadow.classList.contains('active')) {
                this.mysteriousShadow.style.left = `${spotPosition.x - 100 + Math.random() * 50}px`;
                this.mysteriousShadow.style.top = `${spotPosition.y - 60 + Math.random() * 30}px`;
                this.mysteriousShadow.classList.add('active');
                
                // Remove after a while
                setTimeout(() => {
                    this.mysteriousShadow.classList.remove('active');
                }, 4000 + Math.random() * 3000);
            }
        }
    }

    setupNotebookTabs() {
        // Get tab buttons
        const tabs = document.querySelectorAll('.notebook-tabs .tab');
        
        // Add event listeners to tabs
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Get the tab content id
                const tabName = tab.getAttribute('data-tab');
                const tabId = tabName.endsWith('Tab') ? tabName : tabName + 'Tab';
                
                // Hide all tab content
                const tabContents = document.querySelectorAll('.tab-content');
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Show the selected tab content
                const contentElement = document.getElementById(tabName) || document.getElementById(tabId);
                if (contentElement) {
                    contentElement.classList.add('active');
                    
                    // Special handling for map tab
                    if (tabName === 'mapTab' && this.mapManager) {
                        this.mapManager.refreshMap();
                    }
                    
                    // Special handling for relationships tab
                    if (tabName === 'relationships' && this.relationshipManager) {
                        this.updateRelationshipsDisplay();
                    }
                }
            });
        });
        
        // Set up enhanced notebook features
        this.setupEnhancedNotebook();
    }
    
    updateRelationshipsDisplay() {
        const container = document.getElementById('relationshipsContainer');
        if (!container || !this.relationshipManager) return;
        
        // Clear existing content
        container.innerHTML = '';
        
        // Generate relationships UI
        const relationshipsUI = this.relationshipManager.generateRelationshipUI();
        container.appendChild(relationshipsUI);
    }
    
    updateSanity(amount) {
        // Update the sanity value
        this.sanity = Math.max(this.minSanity, Math.min(this.maxSanity, this.sanity + amount));
        this.sanityElement.textContent = this.sanity;
        
        // Apply visual effects based on sanity level
        if (this.sanity <= this.criticalSanityThreshold) {
            this.gameBoard.classList.add('sanity-critical');
            this.gameBoard.classList.remove('sanity-low');
            document.body.style.transition = 'filter 2s';
            document.body.style.filter = 'saturate(0.7) contrast(1.2) hue-rotate(-10deg)';
        } else if (this.sanity <= this.lowSanityThreshold) {
            this.gameBoard.classList.add('sanity-low');
            this.gameBoard.classList.remove('sanity-critical');
            document.body.style.transition = 'filter 2s';
            document.body.style.filter = 'saturate(0.9) contrast(1.1)';
        } else {
            this.gameBoard.classList.remove('sanity-low', 'sanity-critical');
            document.body.style.filter = 'none';
        }
        
        // Add specific effects for very low sanity
        this.applySanityEffects();
    }
    
    applySanityEffects() {
        // Clear any existing sanity effects
        clearTimeout(this.sanityEffectTimeout);
        
        // Only apply effects if sanity is low
        if (this.sanity > this.lowSanityThreshold) return;
        
        // Stronger effects for critical sanity
        const intensity = this.sanity <= this.criticalSanityThreshold ? 'high' : 'medium';
        
        // Random effects based on sanity
        const triggerEffect = () => {
            // Skip if game is not running
            if (!this.isGameRunning) return;
            
            // Lower chance of effects if sanity is higher
            if (Math.random() > (100 - this.sanity) / 100) return;
            
            // Choose a random effect
            const effects = [
                this.sanityEffect_visualDistortion.bind(this),
                this.sanityEffect_shadowFigures.bind(this),
                this.sanityEffect_whispers.bind(this),
                this.sanityEffect_falseClue.bind(this)
            ];
            
            // Apply a random effect
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];
            randomEffect(intensity);
            
            // Schedule next effect
            const nextTime = Math.random() * (this.sanity <= this.criticalSanityThreshold ? 20000 : 40000) + 10000;
            this.sanityEffectTimeout = setTimeout(triggerEffect, nextTime);
        };
        
        // Start the effects loop
        triggerEffect();
    }
    
    sanityEffect_visualDistortion(intensity) {
        // Create a short visual distortion effect
        const gameContainer = document.querySelector('.game-container');
        
        // Add distortion class
        gameContainer.classList.add('visual-distortion');
        
        // Add shake effect
        if (intensity === 'high') {
            this.gameBoard.style.animation = 'shake 0.5s';
        }
        
        // Add sound
        this.playSoundEffect('distortion');
        
        // Remove effect after a short time
        setTimeout(() => {
            gameContainer.classList.remove('visual-distortion');
            this.gameBoard.style.animation = '';
        }, 2000);
    }
    
    sanityEffect_shadowFigures(intensity) {
        // Create temporary shadow figures that appear and disappear
        const numShadows = intensity === 'high' ? 3 : 1;
        
        for (let i = 0; i < numShadows; i++) {
            // Create a shadow element
            const shadow = document.createElement('div');
            shadow.className = 'mysterious-shadow active';
            
            // Random position on screen edges
            const edgePosition = Math.floor(Math.random() * 4); // 0-3 for top, right, bottom, left
            let posX, posY;
            
            switch (edgePosition) {
                case 0: // Top
                    posX = Math.random() * this.gameBoard.offsetWidth;
                    posY = -100;
                    break;
                case 1: // Right
                    posX = this.gameBoard.offsetWidth + 50;
                    posY = Math.random() * this.gameBoard.offsetHeight;
                    break;
                case 2: // Bottom
                    posX = Math.random() * this.gameBoard.offsetWidth;
                    posY = this.gameBoard.offsetHeight + 50;
                    break;
                case 3: // Left
                    posX = -50;
                    posY = Math.random() * this.gameBoard.offsetHeight;
                    break;
            }
            
            shadow.style.left = `${posX}px`;
            shadow.style.top = `${posY}px`;
            
            // Add to game board
            this.gameBoard.appendChild(shadow);
            
            // Animate movement across screen
            setTimeout(() => {
                // Move toward opposite side
                switch (edgePosition) {
                    case 0: // From top to bottom
                        shadow.style.top = `${this.gameBoard.offsetHeight + 50}px`;
                        break;
                    case 1: // From right to left
                        shadow.style.left = `-50px`;
                        break;
                    case 2: // From bottom to top
                        shadow.style.top = `-100px`;
                        break;
                    case 3: // From left to right
                        shadow.style.left = `${this.gameBoard.offsetWidth + 50}px`;
                        break;
                }
                
                shadow.style.transition = 'all 8s linear';
            }, 100);
            
            // Remove after animation completes
            setTimeout(() => {
                shadow.remove();
            }, 8500);
        }
        
        // Add mysterious sound
        this.playSoundEffect('mysterious');
    }
    
    sanityEffect_whispers(intensity) {
        // Play whisper sounds and briefly show text
        this.playSoundEffect('mysterious');
        
        // Show cryptic messages briefly
        const messages = [
            "They're watching...",
            "Behind you...",
            "It's coming...",
            "The storm revealed it...",
            "The well knows...",
            "The shadows remember...",
            "Don't trust them..."
        ];
        
        // Show 1-3 messages based on intensity
        const numMessages = intensity === 'high' ? 3 : 1;
        
        for (let i = 0; i < numMessages; i++) {
            setTimeout(() => {
                const message = messages[Math.floor(Math.random() * messages.length)];
                
                // Create floating text element
                const whisperText = document.createElement('div');
                whisperText.className = 'whisper-text';
                whisperText.textContent = message;
                
                // Random position
                whisperText.style.left = `${Math.random() * 80 + 10}%`;
                whisperText.style.top = `${Math.random() * 80 + 10}%`;
                
                // Add to game board
                this.gameBoard.appendChild(whisperText);
                
                // Remove after a few seconds
                setTimeout(() => {
                    whisperText.style.opacity = '0';
                    
                    setTimeout(() => {
                        whisperText.remove();
                    }, 1000);
                }, 2000);
            }, i * 1500);
        }
    }
    
    sanityEffect_falseClue(intensity) {
        // Only show a false clue at high intensity and rarely
        if (intensity !== 'high' || Math.random() > 0.3) {
            return this.sanityEffect_whispers(intensity);
        }
        
        // Create a fake clue that disappears from the notebook
        const falseClues = [
            "Someone is living in the walls of the abandoned house",
            "Mrs. Finch's reflection doesn't match her movements",
            "The children are hiding something beneath the well",
            "Mr. Arnold's shadow sometimes moves independently",
            "There are symbols carved inside all the trees"
        ];
        
        const falseClue = falseClues[Math.floor(Math.random() * falseClues.length)];
        
        // Show the clue as if discovered
        alert(`You found a clue: "${falseClue}"`);
        
        // Add to notebook temporarily
        const clueItem = document.createElement('li');
        clueItem.className = 'clue-item false-clue';
        clueItem.dataset.clue = falseClue;
        
        // Add clue text
        const clueText = document.createElement('div');
        clueText.className = 'clue-text';
        clueText.textContent = falseClue;
        clueItem.appendChild(clueText);
        
        // Add tags
        const tags = this.autoTagClue(falseClue);
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'clue-tags';
        
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'clue-tag ' + tag.category;
            tagElement.textContent = tag.value;
            tagsContainer.appendChild(tagElement);
        });
        
        clueItem.appendChild(tagsContainer);
        
        // Add to notebook
        this.cluesList.appendChild(clueItem);
        
        // Play sound
        this.playSoundEffect('clue');
        
        // After a delay, make it disappear
        setTimeout(() => {
            clueItem.style.opacity = '0.5';
            clueItem.style.fontStyle = 'italic';
            clueItem.style.textDecoration = 'line-through';
            
            setTimeout(() => {
                clueItem.remove();
            }, 5000);
        }, 60000); // Disappear after a minute
    }

    addSettingsButton() {
        const controlsDiv = document.querySelector('.controls');
        
        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'settings';
        settingsBtn.textContent = '⚙️ Settings';
        settingsBtn.addEventListener('click', () => this.showSettingsMenu());
        
        controlsDiv.appendChild(settingsBtn);
    }
    
    showSettingsMenu() {
        // Create a simple settings menu
        const settingsMenu = document.createElement('div');
        settingsMenu.className = 'dialog-overlay';
        settingsMenu.style.display = 'flex';
        
        const menuContent = document.createElement('div');
        menuContent.className = 'dialog-box';
        
        const menuHeader = document.createElement('h3');
        menuHeader.textContent = 'Game Settings';
        menuHeader.style.textAlign = 'center';
        menuHeader.style.marginBottom = '20px';
        
        menuContent.appendChild(menuHeader);
        
        // Create settings options
        const options = document.createElement('div');
        options.className = 'settings-options';
        
        // Visual quality settings
        const visualQualityHeading = document.createElement('h4');
        visualQualityHeading.textContent = 'Visual Quality';
        options.appendChild(visualQualityHeading);
        
        const visualQualityOptions = [
            { label: 'High (All Effects)', value: 'high' },
            { label: 'Medium (Reduced Effects)', value: 'medium' },
            { label: 'Low (Minimal Effects)', value: 'low' }
        ];
        
        const visualQualityButtons = document.createElement('div');
        visualQualityButtons.className = 'settings-option-group';
        
        visualQualityOptions.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.label;
            button.className = 'settings-option';
            if (localStorage.getItem('visualQuality') === option.value ||
                (!localStorage.getItem('visualQuality') && option.value === 'high')) {
                button.classList.add('active');
            }
            
            button.addEventListener('click', () => {
                document.querySelectorAll('.settings-option-group button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                localStorage.setItem('visualQuality', option.value);
                this.applyVisualQualitySettings(option.value);
            });
            
            visualQualityButtons.appendChild(button);
        });
        
        options.appendChild(visualQualityButtons);
        
        // Performance monitor toggle
        const performanceHeading = document.createElement('h4');
        performanceHeading.textContent = 'Performance Monitoring';
        options.appendChild(performanceHeading);
        
        const fpsToggle = document.createElement('div');
        fpsToggle.className = 'settings-toggle';
        
        const fpsCheckbox = document.createElement('input');
        fpsCheckbox.type = 'checkbox';
        fpsCheckbox.id = 'fpsMonitor';
        fpsCheckbox.checked = this.fpsMonitoring;
        
        const fpsLabel = document.createElement('label');
        fpsLabel.htmlFor = 'fpsMonitor';
        fpsLabel.textContent = 'Show FPS Counter';
        
        fpsToggle.appendChild(fpsCheckbox);
        fpsToggle.appendChild(fpsLabel);
        options.appendChild(fpsToggle);
        
        const memoryToggle = document.createElement('div');
        memoryToggle.className = 'settings-toggle';
        
        const memoryCheckbox = document.createElement('input');
        memoryCheckbox.type = 'checkbox';
        memoryCheckbox.id = 'memoryMonitor';
        memoryCheckbox.checked = this.memoryMonitoring;
        
        const memoryLabel = document.createElement('label');
        memoryLabel.htmlFor = 'memoryMonitor';
        memoryLabel.textContent = 'Show Memory Usage';
        
        memoryToggle.appendChild(memoryCheckbox);
        memoryToggle.appendChild(memoryLabel);
        options.appendChild(memoryToggle);
        
        // Event handlers
        fpsCheckbox.addEventListener('change', () => {
            this.toggleFpsMonitoring(fpsCheckbox.checked);
        });
        
        memoryCheckbox.addEventListener('change', () => {
            this.toggleMemoryMonitoring(memoryCheckbox.checked);
        });
        
        // Clean up memory button
        const cleanupHeading = document.createElement('h4');
        cleanupHeading.textContent = 'Memory Management';
        options.appendChild(cleanupHeading);
        
        const cleanupButton = document.createElement('button');
        cleanupButton.textContent = 'Clean Up Memory';
        cleanupButton.className = 'settings-action';
        cleanupButton.addEventListener('click', () => {
            this.cleanupUnusedResources();
            alert('Memory cleanup complete. This may improve performance.');
        });
        
        options.appendChild(cleanupButton);
        
        menuContent.appendChild(options);
        
        // Close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.alignSelf = 'flex-end';
        closeButton.style.marginTop = '20px';
        closeButton.addEventListener('click', () => settingsMenu.remove());
        
        menuContent.appendChild(closeButton);
        
        settingsMenu.appendChild(menuContent);
        document.body.appendChild(settingsMenu);
        
        // Apply current visual quality
        this.applyVisualQualitySettings(localStorage.getItem('visualQuality') || 'high');
    }
    
    toggleFpsMonitoring(enabled) {
        this.fpsMonitoring = enabled;
        
        if (enabled) {
            // Create FPS counter if it doesn't exist
            if (!this.fpsCounter) {
                this.fpsCounter = document.createElement('div');
                this.fpsCounter.className = 'performance-monitor fps-counter';
                document.querySelector('.game-container').appendChild(this.fpsCounter);
            }
            
            // Show FPS counter
            this.fpsCounter.style.display = 'block';
            
            // Start FPS monitoring
            this.lastFrameTime = performance.now();
            this.frameCount = 0;
            this.frameAccumulator = 0;
            this.monitorFps();
        } else if (this.fpsCounter) {
            // Hide FPS counter
            this.fpsCounter.style.display = 'none';
            cancelAnimationFrame(this.fpsMonitorId);
        }
    }
    
    monitorFps() {
        const now = performance.now();
        const elapsed = now - this.lastFrameTime;
        
        this.frameCount++;
        this.frameAccumulator += elapsed;
        
        if (this.frameAccumulator >= 1000) {
            this.lastFps = Math.round((this.frameCount * 1000) / this.frameAccumulator);
            this.fpsCounter.textContent = `FPS: ${this.lastFps}`;
            
            // Reset for next second
            this.frameCount = 0;
            this.frameAccumulator = 0;
        }
        
        this.lastFrameTime = now;
        
        // Continue monitoring
        if (this.fpsMonitoring) {
            this.fpsMonitorId = requestAnimationFrame(() => this.monitorFps());
        }
    }
    
    toggleMemoryMonitoring(enabled) {
        this.memoryMonitoring = enabled;
        
        if (enabled) {
            // Create memory stats element if it doesn't exist
            if (!this.memoryStats) {
                this.memoryStats = document.createElement('div');
                this.memoryStats.className = 'performance-monitor memory-stats';
                document.querySelector('.game-container').appendChild(this.memoryStats);
            }
            
            // Show memory stats
            this.memoryStats.style.display = 'block';
            
            // Start memory monitoring
            this.updateMemoryStats();
            this.memoryMonitorInterval = setInterval(() => this.updateMemoryStats(), 2000);
        } else if (this.memoryStats) {
            // Hide memory stats
            this.memoryStats.style.display = 'none';
            clearInterval(this.memoryMonitorInterval);
        }
    }
    
    updateMemoryStats() {
        if (window.performance && window.performance.memory) {
            const memoryInfo = window.performance.memory;
            const usedHeapSize = Math.round(memoryInfo.usedJSHeapSize / (1024 * 1024));
            const totalHeapSize = Math.round(memoryInfo.totalJSHeapSize / (1024 * 1024));
            
            this.memoryStats.textContent = `Memory: ${usedHeapSize}MB / ${totalHeapSize}MB`;
        } else {
            this.memoryStats.textContent = 'Memory: Not available';
        }
    }
    
    applyVisualQualitySettings(quality) {
        const gameContainer = document.querySelector('.game-container');
        
        // Remove all quality classes
        gameContainer.classList.remove('quality-high', 'quality-medium', 'quality-low');
        
        // Apply new quality class
        gameContainer.classList.add(`quality-${quality}`);
        
        // Apply specific optimizations based on quality setting
        switch (quality) {
            case 'low':
                // Reduce particle effects
                this.weather.rainChance = 0.1;
                this.weather.fogChance = 0.1;
                this.weather.stormChance = 0.05;
                
                // Disable shadows and complex effects
                document.querySelectorAll('.house::after, .mysterious-glow, .mysterious-shadow')
                    .forEach(el => el.style.display = 'none');
                
                // Reduce animation frequency
                clearInterval(this.timeInterval);
                this.timeInterval = setInterval(() => {
                    this.timeManager.time += 1;
                    this.updateTimeDisplay();
                    if (this.timeManager.time % 30 === 0) {
                        this.timeManager.updateTimeOfDay();
                    }
                    if (this.timeManager.time % 60 === 0) {
                        this.updateWeather();
                    }
                }, 1000);
                break;
                
            case 'medium':
                // Moderate particle effects
                this.weather.rainChance = 0.15;
                this.weather.fogChance = 0.12;
                this.weather.stormChance = 0.07;
                
                // Enable basic visual effects
                document.querySelectorAll('.house::after')
                    .forEach(el => el.style.display = 'block');
                
                // Reduce some complex visual effects
                document.querySelectorAll('.mysterious-glow, .mysterious-shadow')
                    .forEach(el => el.style.opacity = '0.5');
                
                // Standard animation frequency
                clearInterval(this.timeInterval);
                this.timeInterval = setInterval(() => {
                    this.timeManager.time += 1;
                    this.updateTimeDisplay();
                    if (this.timeManager.time % 20 === 0) {
                        this.timeManager.updateTimeOfDay();
                    }
                    if (this.timeManager.time % 30 === 0) {
                        this.updateWeather();
                    }
                }, 1000);
                break;
                
            case 'high':
            default:
                // Full particle effects
                this.weather.rainChance = 0.2;
                this.weather.fogChance = 0.15;
                this.weather.stormChance = 0.1;
                
                // Enable all visual effects
                document.querySelectorAll('.house::after, .mysterious-glow, .mysterious-shadow')
                    .forEach(el => el.style.display = 'block');
                
                // Reset to normal animation frequency
                clearInterval(this.timeInterval);
                this.timeInterval = setInterval(() => {
                    this.timeManager.time += 1;
                    this.updateTimeDisplay();
                    this.timeManager.updateTimeOfDay();
                    
                    // Update weather occasionally
                    if (this.timeManager.time % 10 === 0) {
                        this.updateWeather();
                    }
                    
                    // Update mysterious effects occasionally
                    if (this.timeManager.time % 5 === 0) {
                        this.updateMysteriousEffects();
                    }
                }, 1000);
                break;
        }
    }
    
    cleanupUnusedResources() {
        // Clear any unused animations
        document.querySelectorAll('.mysterious-glow.active, .mysterious-shadow.active')
            .forEach(el => el.classList.remove('active'));
        
        // Clear any temporary effects
        document.querySelectorAll('.whisper-text, .visual-distortion')
            .forEach(el => el.remove());
        
        // Clear any lingering timeouts
        clearTimeout(this.sanityEffectTimeout);
        
        // Optimizing DOM
        const clueItems = document.querySelectorAll('.clue-item');
        if (clueItems.length > 50) {
            // If there are too many DOM elements, optimize by combining similar ones
            this.optimizeClueItems();
        }
        
        // Clearing image caches
        this.photos = this.photos.slice(0, Math.min(this.photos.length, 20));
        this.photoDetails = this.photoDetails.slice(0, Math.min(this.photoDetails.length, 20));
        
        // Force garbage collection (browser will decide when to actually do it)
        if (window.gc) {
            window.gc();
        }
    }
    
    optimizeClueItems() {
        // Get all clue items
        const clueItems = Array.from(document.querySelectorAll('.clue-item'));
        const cluesList = document.getElementById('cluesList');
        
        // Keep only the most recent/important ones
        if (clueItems.length > 50) {
            const importantClues = new Set();
            
            // Keep clues with connections as they're important
            clueItems.forEach(item => {
                const clueText = item.dataset.clue;
                if (this.clueConnections.has(clueText) && this.clueConnections.get(clueText).size > 0) {
                    importantClues.add(clueText);
                }
            });
            
            // Keep clues that have annotations
            clueItems.forEach(item => {
                const clueText = item.dataset.clue;
                if (this.clueAnnotations.has(clueText) && this.clueAnnotations.get(clueText).trim() !== '') {
                    importantClues.add(clueText);
                }
            });
            
            // Keep recent clues (last 30)
            const recentClues = clueItems.slice(-30).map(item => item.dataset.clue);
            recentClues.forEach(clue => importantClues.add(clue));
            
            // Remove clues not in the keep list
            clueItems.forEach(item => {
                const clueText = item.dataset.clue;
                if (!importantClues.has(clueText)) {
                    item.remove();
                }
            });
        }
    }
    
    // Throttled version of checkEvents
    throttledCheckEvents = throttle(function() {
        this.checkEvents();
    }, 500);
    
    // Mini-game system for investigation
    startMiniGame(type, difficulty = 'medium') {
        if (this.miniGameActive) return; // Don't start if already playing
        
        this.miniGameActive = true;
        this.miniGameType = type;
        
        // Set up rewards based on difficulty
        const difficultyMultiplier = { 'easy': 1, 'medium': 2, 'hard': 3 };
        const multiplier = difficultyMultiplier[difficulty] || 1;
        
        this.miniGameRewards = {
            trust: 5 * multiplier,
            sanity: 5 * multiplier,
            clue: null
        };
        
        // Choose a potential clue reward
        const availableClues = this.clues.filter(clue => 
            !this.foundClues.has(clue.text) && 
            clue.trustRequired <= this.trust &&
            clue.time === this.timeOfDay
        );
        
        if (availableClues.length > 0) {
            this.miniGameRewards.clue = availableClues[Math.floor(Math.random() * availableClues.length)].text;
        }
        
        // Choose mini-game type if not specified
        if (!type) {
            const games = ['pattern', 'sequence', 'decode'];
            type = games[Math.floor(Math.random() * games.length)];
        }
        
        // Set up the specific mini-game
        switch (type) {
            case 'pattern':
                this.setupPatternGame(difficulty);
                break;
            case 'sequence':
                this.setupSequenceGame(difficulty);
                break;
            case 'decode':
                this.setupDecodeGame(difficulty);
                break;
            default:
                this.setupPatternGame(difficulty);
        }
    }
    
    setupPatternGame(difficulty) {
        // Create pattern matching game data
        const patterns = {
            easy: [
                { rows: 3, cols: 3, targetMatches: 3 },
                { rows: 4, cols: 3, targetMatches: 3 }
            ],
            medium: [
                { rows: 4, cols: 4, targetMatches: 4 },
                { rows: 5, cols: 4, targetMatches: 4 }
            ],
            hard: [
                { rows: 5, cols: 5, targetMatches: 5 },
                { rows: 6, cols: 5, targetMatches: 5 }
            ]
        };
        
        // Choose pattern based on difficulty
        const patternOptions = patterns[difficulty] || patterns.medium;
        const patternConfig = patternOptions[Math.floor(Math.random() * patternOptions.length)];
        
        // Generate symbols (using emoji for visual distinction)
        const symbols = ['🔥', '💧', '🌿', '⚡', '❄️', '🌙', '☀️', '⭐', '🌈'];
        
        // Create the pattern grid
        const grid = [];
        for (let i = 0; i < patternConfig.rows; i++) {
            const row = [];
            for (let j = 0; j < patternConfig.cols; j++) {
                row.push(symbols[Math.floor(Math.random() * symbols.length)]);
            }
            grid.push(row);
        }
        
        // Create the target pattern (a subset of symbols to find)
        const targetSymbols = [];
        for (let i = 0; i < patternConfig.targetMatches; i++) {
            targetSymbols.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }
        
        this.miniGameData = {
            type: 'pattern',
            grid: grid,
            targetSymbols: targetSymbols,
            selected: new Set(),
            targetMatches: patternConfig.targetMatches,
            attempts: 0,
            maxAttempts: 3,
            timeLimit: difficulty === 'easy' ? 60 : difficulty === 'medium' ? 45 : 30,
            timeRemaining: difficulty === 'easy' ? 60 : difficulty === 'medium' ? 45 : 30
        };
        
        // Show the pattern game
        this.showPatternGame();
        
        // Start the timer
        this.miniGameTimer = setInterval(() => {
            this.miniGameData.timeRemaining--;
            
            // Update timer display
            const timerElement = document.querySelector('.mini-game-timer');
            if (timerElement) {
                timerElement.textContent = `Time: ${this.miniGameData.timeRemaining}s`;
            }
            
            // End game if time runs out
            if (this.miniGameData.timeRemaining <= 0) {
                clearInterval(this.miniGameTimer);
                this.endMiniGame(false, "Time's up!");
            }
        }, 1000);
    }
    
    showPatternGame() {
        // Create mini-game overlay
        const gameOverlay = document.createElement('div');
        gameOverlay.className = 'dialog-overlay mini-game-overlay';
        gameOverlay.style.display = 'flex';
        
        // Create game container
        const gameContainer = document.createElement('div');
        gameContainer.className = 'dialog-box mini-game-container';
        
        // Game header
        const gameHeader = document.createElement('div');
        gameHeader.className = 'mini-game-header';
        
        const gameTitle = document.createElement('h3');
        gameTitle.textContent = 'Pattern Matching';
        
        const gameInstructions = document.createElement('p');
        gameInstructions.textContent = `Find and select ${this.miniGameData.targetMatches} matching symbols from the grid. You have ${this.miniGameData.maxAttempts} attempts.`;
        
        const gameTimer = document.createElement('div');
        gameTimer.className = 'mini-game-timer';
        gameTimer.textContent = `Time: ${this.miniGameData.timeRemaining}s`;
        
        gameHeader.appendChild(gameTitle);
        gameHeader.appendChild(gameInstructions);
        gameHeader.appendChild(gameTimer);
        
        // Target symbols
        const targetsContainer = document.createElement('div');
        targetsContainer.className = 'mini-game-targets';
        
        const targetsLabel = document.createElement('div');
        targetsLabel.textContent = 'Find these symbols:';
        targetsContainer.appendChild(targetsLabel);
        
        const symbolsDisplay = document.createElement('div');
        symbolsDisplay.className = 'target-symbols';
        
        this.miniGameData.targetSymbols.forEach(symbol => {
            const symbolElement = document.createElement('div');
            symbolElement.className = 'target-symbol';
            symbolElement.textContent = symbol;
            symbolsDisplay.appendChild(symbolElement);
        });
        
        targetsContainer.appendChild(symbolsDisplay);
        
        // Game grid
        const gridContainer = document.createElement('div');
        gridContainer.className = 'mini-game-grid';
        
        this.miniGameData.grid.forEach((row, rowIndex) => {
            const gridRow = document.createElement('div');
            gridRow.className = 'grid-row';
            
            row.forEach((symbol, colIndex) => {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.textContent = symbol;
                cell.dataset.row = rowIndex;
                cell.dataset.col = colIndex;
                
                // Add click handler
                cell.addEventListener('click', () => {
                    // Toggle selection
                    const cellKey = `${rowIndex},${colIndex}`;
                    if (this.miniGameData.selected.has(cellKey)) {
                        this.miniGameData.selected.delete(cellKey);
                        cell.classList.remove('selected');
                    } else {
                        // Only allow selecting up to the target number
                        if (this.miniGameData.selected.size < this.miniGameData.targetMatches) {
                            this.miniGameData.selected.add(cellKey);
                            cell.classList.add('selected');
                        }
                    }
                    
                    // Enable submit button if enough cells are selected
                    const submitButton = document.querySelector('#mini-game-submit');
                    if (submitButton) {
                        submitButton.disabled = this.miniGameData.selected.size !== this.miniGameData.targetMatches;
                    }
                });
                
                gridRow.appendChild(cell);
            });
            
            gridContainer.appendChild(gridRow);
        });
        
        // Game controls
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'mini-game-controls';
        
        const submitButton = document.createElement('button');
        submitButton.id = 'mini-game-submit';
        submitButton.textContent = 'Submit Pattern';
        submitButton.disabled = true;
        
        submitButton.addEventListener('click', () => {
            this.checkPatternMatch();
        });
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            clearInterval(this.miniGameTimer);
            this.endMiniGame(false, 'Game canceled');
        });
        
        controlsContainer.appendChild(submitButton);
        controlsContainer.appendChild(cancelButton);
        
        // Assemble everything
        gameContainer.appendChild(gameHeader);
        gameContainer.appendChild(targetsContainer);
        gameContainer.appendChild(gridContainer);
        gameContainer.appendChild(controlsContainer);
        
        gameOverlay.appendChild(gameContainer);
        document.body.appendChild(gameOverlay);
    }
    
    checkPatternMatch() {
        // Get the selected symbols
        const selectedSymbols = [];
        this.miniGameData.selected.forEach(key => {
            const [row, col] = key.split(',').map(Number);
            selectedSymbols.push(this.miniGameData.grid[row][col]);
        });
        
        // Count how many match the target symbols
        let matches = 0;
        const targetCopy = [...this.miniGameData.targetSymbols];
        
        selectedSymbols.forEach(symbol => {
            const index = targetCopy.indexOf(symbol);
            if (index !== -1) {
                matches++;
                targetCopy.splice(index, 1); // Remove the matched symbol
            }
        });
        
        // Increase attempts
        this.miniGameData.attempts++;
        
        // Check if all matches are found
        if (matches === this.miniGameData.targetMatches) {
            clearInterval(this.miniGameTimer);
            this.endMiniGame(true, `Great job! You found all ${matches} matching symbols.`);
            return;
        }
        
        // Check if out of attempts
        if (this.miniGameData.attempts >= this.miniGameData.maxAttempts) {
            clearInterval(this.miniGameTimer);
            this.endMiniGame(false, `Out of attempts. You found ${matches} out of ${this.miniGameData.targetMatches} matches.`);
            return;
        }
        
        // Show feedback and continue
        alert(`You found ${matches} out of ${this.miniGameData.targetMatches} matches. ${this.miniGameData.maxAttempts - this.miniGameData.attempts} attempts remaining.`);
        
        // Reset selections
        this.miniGameData.selected.clear();
        document.querySelectorAll('.grid-cell.selected').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        // Disable submit button
        const submitButton = document.querySelector('#mini-game-submit');
        if (submitButton) {
            submitButton.disabled = true;
        }
    }
    
    setupSequenceGame(difficulty) {
        // Implement sequence memory game - will be similar to pattern game but with sequences
        // This is a placeholder for future implementation
        this.setupPatternGame(difficulty); // Fallback to pattern game for now
    }
    
    setupDecodeGame(difficulty) {
        // Implement code deciphering game - will be similar to pattern game but with codes
        // This is a placeholder for future implementation
        this.setupPatternGame(difficulty); // Fallback to pattern game for now
    }
    
    endMiniGame(success, message) {
        // Remove mini-game UI
        const overlay = document.querySelector('.mini-game-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Reset mini-game state
        this.miniGameActive = false;
        
        // Show result message
        const resultOverlay = document.createElement('div');
        resultOverlay.className = 'dialog-overlay';
        resultOverlay.style.display = 'flex';
        
        const resultBox = document.createElement('div');
        resultBox.className = 'dialog-box';
        
        const resultTitle = document.createElement('h3');
        resultTitle.textContent = success ? 'Success!' : 'Challenge Failed';
        resultTitle.style.color = success ? '#2ecc71' : '#e74c3c';
        resultTitle.style.textAlign = 'center';
        resultTitle.style.marginBottom = '20px';
        
        const resultMessage = document.createElement('p');
        resultMessage.textContent = message;
        resultMessage.style.marginBottom = '20px';
        
        resultBox.appendChild(resultTitle);
        resultBox.appendChild(resultMessage);
        
        // Apply rewards if successful
        if (success) {
            const rewardsContainer = document.createElement('div');
            rewardsContainer.className = 'rewards-container';
            
            // Trust reward
            if (this.miniGameRewards.trust > 0) {
                const trustReward = document.createElement('p');
                trustReward.innerHTML = `<strong>Trust:</strong> +${this.miniGameRewards.trust}`;
                rewardsContainer.appendChild(trustReward);
                
                // Apply trust reward
                this.trust += this.miniGameRewards.trust;
                this.trustElement.textContent = this.trust;
            }
            
            // Sanity reward
            if (this.miniGameRewards.sanity > 0) {
                const sanityReward = document.createElement('p');
                sanityReward.innerHTML = `<strong>Sanity:</strong> +${this.miniGameRewards.sanity}`;
                rewardsContainer.appendChild(sanityReward);
                
                // Apply sanity reward
                this.updateSanity(this.miniGameRewards.sanity);
            }
            
            // Clue reward
            if (this.miniGameRewards.clue) {
                const clueReward = document.createElement('p');
                clueReward.innerHTML = `<strong>New Clue:</strong> "${this.miniGameRewards.clue}"`;
                rewardsContainer.appendChild(clueReward);
                
                // Add the clue
                this.foundClues.add(this.miniGameRewards.clue);
                this.addClueToNotebook(this.miniGameRewards.clue);
                this.playSoundEffect('clue');
            }
            
            resultBox.appendChild(rewardsContainer);
        } else {
            // Small sanity penalty for failure
            this.updateSanity(-3);
        }
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Continue';
        closeButton.style.alignSelf = 'flex-end';
        closeButton.style.marginTop = '20px';
        closeButton.addEventListener('click', () => {
            resultOverlay.remove();
        });
        
        resultBox.appendChild(closeButton);
        resultOverlay.appendChild(resultBox);
        document.body.appendChild(resultOverlay);
    }
    
    // Add investigation spots in the game
    createInvestigationSpots() {
        const investigationLocations = [
            { x: 150, y: 200, type: 'ritual', difficulty: 'medium' }, // Near Mrs. Finch's house
            { x: 400, y: 320, type: 'decode', difficulty: 'hard' },   // Near the well
            { x: 550, y: 300, type: 'pattern', difficulty: 'medium' }, // Near Mr. Arnold's yard
            { x: 720, y: 150, type: 'sequence', difficulty: 'hard' }   // Near abandoned house
        ];
        
        investigationLocations.forEach(location => {
            const spot = document.createElement('div');
            spot.className = 'investigation-spot';
            spot.style.left = `${location.x}px`;
            spot.style.top = `${location.y}px`;
            
            // Add tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'spot-tooltip';
            tooltip.textContent = 'Investigate';
            spot.appendChild(tooltip);
            
            // Add click handler
            spot.addEventListener('click', () => {
                // Check if player is close enough
                const playerX = parseInt(this.player.style.left) || 0;
                const playerY = parseInt(this.player.style.top) || 0;
                
                const distance = Math.sqrt(
                    Math.pow(location.x - playerX, 2) +
                    Math.pow(location.y - playerY, 2)
                );
                
                if (distance < 50) {
                    this.startMiniGame(location.type, location.difficulty);
                } else {
                    alert('Get closer to investigate this spot.');
                }
            });
            
            this.gameBoard.appendChild(spot);
        });
    }
    
    // Add a method to check and update narrative act progression
    checkActProgression() {
        // Check if we should advance to the next act based on trust level
        if (this.currentAct < 4) { // Don't progress beyond Act 4
            const nextAct = this.currentAct + 1;
            const nextActThreshold = this.actThresholds[nextAct];
            
            if (this.trust >= nextActThreshold.trust) {
                this.advanceToNextAct(nextAct);
            }
        }
    }
    
    // Method to advance the narrative to the next act
    advanceToNextAct(nextAct) {
        this.currentAct = nextAct;
        
        // Display a notification about entering a new act
        const actMessages = {
            2: "Act 2: Cracks in the Surface\n\nAs you gain the neighbors' trust, new aspects of the mystery begin to emerge. The evening hours are now open for exploration (6:00 PM - 10:00 PM).",
            3: "Act 3: Echoes in the Dark\n\nYou've uncovered enough to access deeper secrets. The night hours are now open for exploration (10:00 PM - 2:00 AM).",
            4: "Act 4: The Decision\n\nYou know enough about Iris's disappearance to make a choice. How will you resolve this mystery?"
        };
        
        if (actMessages[nextAct]) {
            alert(actMessages[nextAct]);
        }
        
        // Update game state based on new act (unlock times, etc.)
        this.updateGameForCurrentAct();
    }
    
    // Update the game state based on the current narrative act
    updateGameForCurrentAct() {
        // Implement changes based on the current act (e.g., unlock night time exploration)
        if (this.currentAct >= 3) {
            // Add some visually distinctive clue at night
            const glowingSpot = document.createElement('div');
            glowingSpot.className = 'mysterious-glow active';
            glowingSpot.style.left = '700px';
            glowingSpot.style.top = '100px';
            this.gameBoard.appendChild(glowingSpot);
            
            setTimeout(() => {
                glowingSpot.classList.remove('active');
                setTimeout(() => glowingSpot.remove(), 2000);
            }, 10000);
        }
        
        // Make the "Conclude Investigation" button more prominent in Act 4
        if (this.currentAct === 4) {
            const endGameBtn = document.getElementById('endGame');
            if (endGameBtn) {
                endGameBtn.style.display = 'block';
                endGameBtn.style.backgroundColor = '#e74c3c';
                endGameBtn.style.fontWeight = 'bold';
            }
        }
    }

    // Add random ambient effect methods
    createRandomAmbientEffect(type, count) {
        if (type === 'firefly') {
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    if (!this.player) return;
                    
                    // Create near player position with some randomness
                    const playerX = this.player.offsetLeft + this.player.offsetWidth / 2;
                    const playerY = this.player.offsetTop + this.player.offsetHeight / 2;
                    
                    const offsetX = (Math.random() - 0.5) * 200; // -100 to 100
                    const offsetY = (Math.random() - 0.5) * 200; // -100 to 100
                    
                    const firefly = document.createElement('div');
                    firefly.className = 'ambient-effect firefly';
                    firefly.style.left = `${playerX + offsetX}px`;
                    firefly.style.top = `${playerY + offsetY}px`;
                    
                    // Random animation delay
                    firefly.style.animationDelay = `${Math.random() * 2}s`;
                    
                    this.gameBoard.appendChild(firefly);
                    
                    // Remove after animation
                    setTimeout(() => {
                        if (firefly.parentNode) {
                            firefly.parentNode.removeChild(firefly);
                        }
                    }, 10000); // 10 seconds
                }, i * 200); // Stagger creation
            }
        }
    }

    createCat() {
        if (!this.player) return;
        
        // Get random edge of the screen to start from
        const playerX = this.player.offsetLeft + this.player.offsetWidth / 2;
        const playerY = this.player.offsetTop + this.player.offsetHeight / 2;
        
        const viewportWidth = this.gameBoard.clientWidth;
        const viewportHeight = this.gameBoard.clientHeight;
        
        // Determine start position (off screen)
        let startX, startY, endX, endY;
        
        // Coming from left/right or top/bottom?
        if (Math.random() > 0.5) {
            // Left or right
            startX = Math.random() > 0.5 ? -50 : viewportWidth + 50;
            startY = playerY + (Math.random() - 0.5) * 200;
            endX = startX > 0 ? -50 : viewportWidth + 50;
            endY = startY + (Math.random() - 0.5) * 100;
        } else {
            // Top or bottom
            startX = playerX + (Math.random() - 0.5) * 200;
            startY = Math.random() > 0.5 ? -50 : viewportHeight + 50;
            endX = startX + (Math.random() - 0.5) * 100;
            endY = startY > 0 ? -50 : viewportHeight + 50;
        }
        
        // Create cat element
        const cat = document.createElement('div');
        cat.className = 'ambient-effect cat';
        cat.style.left = `${startX}px`;
        cat.style.top = `${startY}px`;
        
        // Add cat image
        cat.innerHTML = `<div class="cat-silhouette"></div>`;
        
        this.gameBoard.appendChild(cat);
        
        // Animate cat crossing
        const duration = 5000 + Math.random() * 3000; // 5-8 seconds
        
        // Use CSS animation API
        cat.animate([
            { left: `${startX}px`, top: `${startY}px` },
            { left: `${endX}px`, top: `${endY}px` }
        ], {
            duration: duration,
            easing: 'ease-in-out'
        });
        
        // Play soft sound
        this.playSoundEffect('cat');
        
        // Remove after animation
        setTimeout(() => {
            if (cat.parentNode) {
                cat.parentNode.removeChild(cat);
            }
        }, duration + 100);
    }

    flickerNearbyLight() {
        // Find nearby house
        const playerX = this.player.offsetLeft + this.player.offsetWidth / 2;
        const playerY = this.player.offsetTop + this.player.offsetHeight / 2;
        
        // Find closest house
        let closestHouse = null;
        let closestDistance = Infinity;
        
        this.houses.forEach(house => {
            const houseX = house.offsetLeft + house.offsetWidth / 2;
            const houseY = house.offsetTop + house.offsetHeight / 2;
            
            const distance = Math.sqrt(
                Math.pow(houseX - playerX, 2) + 
                Math.pow(houseY - playerY, 2)
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestHouse = house;
            }
        });
        
        // If house is within range, make it flicker
        if (closestHouse && closestDistance < 200) {
            // Create window light element if not exists
            let windowLight = closestHouse.querySelector('.house-window');
            if (!windowLight) {
                windowLight = document.createElement('div');
                windowLight.className = 'house-window';
                closestHouse.appendChild(windowLight);
            }
            
            // Do flickering animation
            windowLight.classList.add('flickering');
            
            // Create audio cue
            const audioX = closestHouse.offsetLeft + closestHouse.offsetWidth / 2;
            const audioY = closestHouse.offsetTop + closestHouse.offsetHeight / 2;
            
            const audioCue = document.createElement('div');
            audioCue.className = 'audio-cue';
            audioCue.style.left = `${audioX}px`;
            audioCue.style.top = `${audioY}px`;
            
            this.gameBoard.appendChild(audioCue);
            
            // Remove flicker and cue after a while
            setTimeout(() => {
                windowLight.classList.remove('flickering');
                if (audioCue.parentNode) {
                    audioCue.parentNode.removeChild(audioCue);
                }
            }, 3000);
        }
    }

    playRandomAmbientSound() {
        const sounds = ['whisper', 'creak', 'wind', 'footsteps'];
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        this.playSoundEffect(randomSound);
    }
    
    // Add method to check for random events
    checkRandomEvents() {
        // Check cooldown
        const now = Date.now();
        if (now - this.lastRandomEvent < this.randomEventCooldown) {
            return;
        }
        
        // Filter events for current time of day
        const possibleEvents = this.randomEvents.filter(event => 
            event.timeOfDay.includes(this.timeManager.timeOfDay)
        );
        
        if (possibleEvents.length === 0) return;
        
        // Check each event probability
        for (const event of possibleEvents) {
            if (Math.random() <= event.probability) {
                // Check location constraint if exists
                if (event.location) {
                    if (event.location.near === 'house') {
                        // Check if player is near a house
                        const playerX = this.player.offsetLeft + this.player.offsetWidth / 2;
                        const playerY = this.player.offsetTop + this.player.offsetHeight / 2;
                        
                        let nearHouse = false;
                        for (const house of this.houses) {
                            const houseX = house.offsetLeft + house.offsetWidth / 2;
                            const houseY = house.offsetTop + house.offsetHeight / 2;
                            
                            const distance = Math.sqrt(
                                Math.pow(houseX - playerX, 2) + 
                                Math.pow(houseY - playerY, 2)
                            );
                            
                            if (distance <= event.location.distance) {
                                nearHouse = true;
                                break;
                            }
                        }
                        
                        if (!nearHouse) continue; // Skip this event
                    }
                }
                
                // Trigger event
                event.action();
                this.lastRandomEvent = now;
                break; // Only trigger one event per check
            }
        }
    }
    
    // Update tick method to check for random events
    tick() {
        // ... existing tick code ...
        
        // Check for random events
        this.checkRandomEvents();
        
        // ... rest of existing tick code ...
    }

    // Search for player movement methods and add this new method

    /**
     * Move player to a specific position on the game board
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    movePlayerTo(x, y) {
        if (!this.player) return;
        
        // Account for player dimensions (center the player)
        const adjustedX = x - this.player.offsetWidth / 2;
        const adjustedY = y - this.player.offsetHeight / 2;
        
        // Set player position
        this.player.style.left = `${adjustedX}px`;
        this.player.style.top = `${adjustedY}px`;
        
        // Update player position on map
        this.mapManager.updatePlayerPosition();
        
        // Check for nearby elements at the new position
        this.checkNearbyElements();
    }

    /**
     * Get trust-appropriate dialogue from multiple options
     * @param {string} characterId - Character identifier
     * @param {Array} dialogueVariants - Array of dialogue options with trust requirements
     * @returns {Object} Selected dialogue variant
     */
    getDynamicDialogue(characterId, dialogueVariants) {
        if (!dialogueVariants || !Array.isArray(dialogueVariants) || dialogueVariants.length === 0) {
            return null;
        }
        
        // If no relationship manager, return the first option
        if (!this.relationshipManager) {
            return dialogueVariants[0];
        }
        
        // Get character's trust level
        const trustLevel = this.relationshipManager.getTrustLevel(characterId);
        const trustTier = this.relationshipManager.getTrustTier(characterId);
        
        // First try to find a dialogue specific to the current trust tier
        const tierMatch = dialogueVariants.find(variant => 
            variant.trustTier && variant.trustTier.toLowerCase() === trustTier.toLowerCase()
        );
        
        if (tierMatch) return tierMatch;
        
        // Then try to find a dialogue that meets the minimum trust level
        const validOptions = dialogueVariants
            .filter(variant => !variant.minTrust || trustLevel >= variant.minTrust)
            .sort((a, b) => (b.minTrust || 0) - (a.minTrust || 0));
        
        return validOptions.length > 0 ? validOptions[0] : dialogueVariants[0];
    }
    
    /**
     * Handle dynamic trust-based dialogue in an NPC conversation
     * @param {string} characterId - Character identifier
     * @param {string} dialogueId - Base dialogue identifier
     */
    showDynamicDialog(characterId, dialogueId) {
        const character = DIALOGUES[characterId];
        if (!character) return;
        
        // Check if this dialogue has variants
        if (character[dialogueId + '_variants'] && Array.isArray(character[dialogueId + '_variants'])) {
            // Get the appropriate variant based on trust
            const selectedVariant = this.getDynamicDialogue(
                characterId, 
                character[dialogueId + '_variants']
            );
            
            if (selectedVariant && selectedVariant.nodeId) {
                // Show the selected variant
                this.showDialog(characterId, selectedVariant.nodeId);
                return;
            }
        }
        
        // Fallback to standard dialogue if no variants or selection failed
        this.showDialog(characterId, dialogueId);
    }

    /**
     * Handle reactions when trust level changes significantly
     * @param {string} characterId - Character identifier
     * @param {Object} trustChange - Object containing trust change details
     */
    handleTrustChangeReaction(characterId, trustChange) {
        if (!trustChange || !characterId) return;
        
        // Skip reactions for small changes
        if (Math.abs(trustChange.previousLevel - trustChange.newLevel) < 5) return;
        
        const character = DIALOGUES[characterId];
        if (!character) return;
        
        // Check if this character has trust reactions defined
        if (character.trustReactions) {
            let reactionType = null;
            
            // Determine reaction type
            if (trustChange.tierChanged) {
                // React to tier change
                reactionType = `tier_${trustChange.newTier.toLowerCase()}`;
            } else if (trustChange.newLevel > trustChange.previousLevel) {
                // React to significant trust gain
                reactionType = 'trust_gained';
            } else {
                // React to significant trust loss
                reactionType = 'trust_lost';
            }
            
            // Look for specific reaction
            if (character.trustReactions[reactionType]) {
                // Queue this reaction dialogue for next time player talks to character
                this.queuedReactions = this.queuedReactions || {};
                this.queuedReactions[characterId] = {
                    type: reactionType,
                    dialogueId: character.trustReactions[reactionType]
                };
                
                // Update UI to show character has something to say
                this.updateCharacterStatus(characterId, 'has_reaction');
            }
        }
    }
    
    /**
     * Update character status indicators on the map
     * @param {string} characterId - Character identifier
     * @param {string} status - Status type to indicate
     */
    updateCharacterStatus(characterId, status) {
        // Find character element on map
        const characterElements = document.querySelectorAll(`.character[data-id="${characterId}"]`);
        
        characterElements.forEach(element => {
            // Clear previous statuses
            element.classList.remove('has-reaction', 'has-clue', 'has-quest');
            
            // Add new status
            switch(status) {
                case 'has_reaction':
                    element.classList.add('has-reaction');
                    break;
                case 'has_clue':
                    element.classList.add('has-clue');
                    break;
                case 'has_quest':
                    element.classList.add('has-quest');
                    break;
            }
        });
    }

    initGame() {
        // ... existing code ...
        
        // Initialize relationship manager
        this.relationshipManager = new RelationshipManager(this);
        
        // ... existing code ...
        
        // Create notebook tabs including relationships
        this.notebookTabs = {
            clues: document.getElementById('notebook-clues-tab'),
            photos: document.getElementById('notebook-photos-tab'),
            map: document.getElementById('notebook-map-tab'),
            relationships: document.getElementById('notebook-relationships-tab')
        };
        
        // ... existing code ...
        
        // Set up notebook tabs click handlers
        this.notebookTabs.clues.addEventListener('click', () => this.showNotebookTab('clues'));
        this.notebookTabs.photos.addEventListener('click', () => this.showNotebookTab('photos'));
        this.notebookTabs.map.addEventListener('click', () => this.showNotebookTab('map'));
        this.notebookTabs.relationships.addEventListener('click', () => this.showNotebookTab('relationships'));
        
        // ... existing code ...
        
        // Start animation loop
        this.startAnimationLoop();
    }
    
    /**
     * Start the animation loop for continuous updates
     */
    startAnimationLoop() {
        const animate = () => {
            this.update();
            requestAnimationFrame(animate);
        };
        
        // Start the animation loop
        requestAnimationFrame(animate);
    }
    
    // ... existing code ...
    
    showNotebookTab(tab) {
        // Hide all tabs
        document.getElementById('notebook-clues').style.display = 'none';
        document.getElementById('notebook-photos').style.display = 'none';
        document.getElementById('notebook-map').style.display = 'none';
        document.getElementById('notebook-relationships').style.display = 'none';
        
        // Reset all tab buttons
        this.notebookTabs.clues.classList.remove('active');
        this.notebookTabs.photos.classList.remove('active');
        this.notebookTabs.map.classList.remove('active');
        this.notebookTabs.relationships.classList.remove('active');
        
        // Show the selected tab
        document.getElementById('notebook-' + tab).style.display = 'block';
        this.notebookTabs[tab].classList.add('active');
        
        // Special handling for different tabs
        if (tab === 'map') {
            this.refreshNotebookMap();
        } else if (tab === 'relationships') {
            this.refreshRelationshipsTab();
        }
    }
    
    /**
     * Refresh the relationships tab content
     */
    refreshRelationshipsTab() {
        const container = document.getElementById('notebook-relationships');
        container.innerHTML = '';
        
        if (this.relationshipManager) {
            const relationshipsUI = this.relationshipManager.generateRelationshipUI();
            container.appendChild(relationshipsUI);
        } else {
            container.innerHTML = '<p class="empty-message">No relationship data available.</p>';
        }
    }

    loadGame() {
        const saveData = JSON.parse(localStorage.getItem('maplewood_save'));
        if (!saveData) {
            this.showNotification('No saved game found!', 'error');
            return false;
        }
        
        // Version check
        if (saveData.gameVersion !== this.gameVersion) {
            this.showNotification('Warning: This save is from a different game version.', 'warning');
        }
        
        // Load player position
        this.playerPosition = saveData.playerPosition;
        
        // Load inventory and collections
        this.inventory = new Set(saveData.inventory || []);
        this.discoveredLocations = new Set(saveData.discoveredLocations || []);
        this.foundClues = new Set(saveData.foundClues || []);
        this.photos = saveData.photos || [];
        
        // Load time data
        if (saveData.timeData) {
            this.timeManager.time = saveData.timeData.time;
            this.timeManager.dayCount = saveData.timeData.dayCount;
            this.timeManager.timeScale = saveData.timeData.timeScale;
            this.timeManager.updateTimeDisplay();
            this.timeManager.applyLighting(true);
        }
        
        // Load game flags
        this.flags = saveData.flags || {};
        
        // Load relationship data
        if (saveData.relationships && this.relationshipManager) {
            this.relationshipManager.loadFromSave(saveData.relationships);
        }
        
        // Update player position on the screen
        this.updatePlayerPosition();
        
        // Refresh notebook contents
        this.refreshNotebook();
        
        this.showNotification('Game loaded!');
        this.playSoundEffect('notification');
        return true;
    }

    /**
     * Handle player interaction with map elements
     * @param {HTMLElement} element - The element the player is interacting with
     */
    handleInteraction(element) {
        console.log('Interacting with:', element.dataset.type);
        
        // Handle different types of interactive elements
        switch (element.dataset.type) {
            case 'character': 
                const characterId = element.dataset.id;
                console.log('Talking to character:', characterId);
                
                // Check for queued reactions from trust changes
                if (this.queuedReactions && this.queuedReactions[characterId]) {
                    const reaction = this.queuedReactions[characterId];
                    console.log('Playing queued reaction:', reaction);
                    
                    // Clear the reaction
                    delete this.queuedReactions[characterId];
                    
                    // Update character status (remove indicator)
                    this.updateCharacterStatus(characterId, 'none');
                    
                    // Show the reaction dialogue
                    this.showDialog(characterId, reaction.dialogueId);
                } 
                // Check for dynamic dialogue variants
                else if (DIALOGUES[characterId] && DIALOGUES[characterId].default_variants) {
                    // Use dynamic dialogue system
                    this.showDynamicDialog(characterId, 'default');
                }
                else {
                    // Regular dialogue
                    this.showDialog(characterId);
                }
                break;
                
            // ... rest of the existing cases ...
        }
    }

    /**
     * Conclude the game and show ending
     * Prompts player for final theory and determines ending based on progress
     */
    concludeGame() {
        console.log("Concluding game and determining ending...");
        
        // Prompt player to submit their final theory
        if (this.endingManager) {
            // Pause game systems
            this.isPaused = true;
            
            // Show final theory submission UI
            this.endingManager.createFinalTheorySubmission();
        } else {
            console.error("EndingManager not initialized");
        }
    }
    
    /**
     * Determine which ending the player has earned
     * @returns {string} The ending ID
     */
    determineEnding() {
        if (this.endingManager) {
            return this.endingManager.evaluateEnding();
        }
        return null;
    }
    
    /**
     * Show specific ending to the player
     * @param {string} endingId - The ending ID to show
     */
    showEnding(endingId) {
        if (this.endingManager) {
            this.endingManager.presentEnding();
        }
    }

    /**
     * Add conclude investigation button
     * This button appears when player has collected enough clues
     */
    addConcludeInvestigationButton() {
        // Check if button already exists
        if (document.getElementById('concludeInvestigationBtn')) {
            return;
        }
        
        // Create button container
        const container = document.createElement('div');
        container.className = 'conclude-button-container';
        
        // Create conclude button
        const concludeBtn = document.createElement('button');
        concludeBtn.id = 'concludeInvestigationBtn';
        concludeBtn.className = 'conclude-investigation-btn';
        concludeBtn.textContent = 'Conclude Investigation';
        
        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'conclude-tooltip';
        tooltip.textContent = 'This will end your investigation and determine an ending based on your findings';
        
        concludeBtn.appendChild(tooltip);
        
        // Add click event
        concludeBtn.addEventListener('click', () => {
            // Show confirmation dialog
            this.showConcludeConfirmation();
        });
        
        container.appendChild(concludeBtn);
        
        // Add to controls section
        const controlsSection = document.querySelector('.controls');
        if (controlsSection) {
            controlsSection.appendChild(container);
        }
    }
    
    /**
     * Show confirmation dialog for concluding the investigation
     */
    showConcludeConfirmation() {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.style.display = 'flex';
        
        const dialog = document.createElement('div');
        dialog.className = 'dialog-box';
        
        const header = document.createElement('h3');
        header.textContent = 'Conclude Investigation?';
        header.style.textAlign = 'center';
        header.style.marginBottom = '15px';
        
        const message = document.createElement('p');
        message.textContent = 'Are you sure you want to conclude your investigation? This will end the game and determine an ending based on the clues you\'ve found and your relationships with the inhabitants of Maplewood Lane.';
        message.style.marginBottom = '20px';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.gap = '10px';
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Continue Investigating';
        cancelButton.style.backgroundColor = '#95a5a6';
        cancelButton.style.flex = '1';
        cancelButton.addEventListener('click', () => {
            overlay.remove();
        });
        
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Conclude Investigation';
        confirmButton.style.backgroundColor = '#e74c3c';
        confirmButton.style.flex = '1';
        confirmButton.addEventListener('click', () => {
            overlay.remove();
            this.concludeGame();
        });
        
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(confirmButton);
        
        dialog.appendChild(header);
        dialog.appendChild(message);
        dialog.appendChild(buttonContainer);
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }
    
    /**
     * Check if the conclude button should be shown
     * Shows the button if player has found enough clues
     */
    checkConcludeAvailability() {
        // Don't show if game is just starting
        if (!this.gameStarted) return;
        
        const clueCount = this.foundClues.size;
        const minRequiredClues = 10; // Minimum clues required to conclude
        
        if (clueCount >= minRequiredClues) {
            this.addConcludeInvestigationButton();
            
            // Add pulsing effect if player has found a lot of clues
            const concludeBtn = document.getElementById('concludeInvestigationBtn');
            if (concludeBtn && clueCount >= 20) {
                concludeBtn.classList.add('pulse');
            }
        }
    }

    update() {
        // Skip update if paused
        if (this.isPaused) return;
        
        // Update elapsed time
        const now = Date.now();
        const deltaTime = now - this.lastUpdateTime;
        this.lastUpdateTime = now;
        
        // Skip frame if too much time has elapsed (tab was inactive)
        if (deltaTime > 1000) return;
        
        // Only update time if game is running
        if (this.gameStarted) {
            // Check for conclude button availability (every 10 seconds)
            if (this.frameCount % 600 === 0) {
                this.checkConcludeAvailability();
            }
            
            // Update time system
            this.timeManager.update(deltaTime);
            
            // Update companion animations
            if (this.companionSystem) {
                this.companionSystem.update(now);
            }
        }
        
        // Increment frame counter
        this.frameCount++;
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new Game();
}); 

// Add CSS styles for puzzle system
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        /* Puzzle system styles */
        .puzzle-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .puzzle-modal-content {
            background-color: #16213e;
            border-radius: 8px;
            padding: 20px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        }
        
        .close-modal-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
        }
        
        .game-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            max-width: 300px;
            animation: fadeIn 0.3s ease-in-out;
        }
        
        .game-notification.fade-out {
            animation: fadeOut 1s ease-in-out forwards;
        }
        
        .notebook-puzzle {
            background-color: #0f3460;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
            border-left: 3px solid #4cc9f0;
        }
        
        .notebook-puzzle.solved {
            border-left: 3px solid #7bf1a8;
        }
        
        .solve-puzzle-btn {
            background-color: #4cc9f0;
            color: #0f3460;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }
        
        .solve-puzzle-btn:disabled {
            background-color: #555;
            cursor: not-allowed;
        }
        
        .puzzle-solution-notes {
            margin-top: 15px;
            padding: 10px;
            background-color: rgba(124, 241, 168, 0.1);
            border-left: 2px solid #7bf1a8;
            font-style: italic;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
}); 

// Initialize DevTools for debugging
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the DevTools after game is created
    const game = window.gameInstance;
    if (game) {
        window.devTools = new DevTools(game);
        console.log('[DEBUG] Developer tools initialized. Press ~ to open debug menu, Ctrl+D for overlay.');
    }
}); 