/**
 * Companion System for Maplewood Lane: Neighborhood Mysteries
 * Allows NPCs (Camille, Jake, and Lila) to temporarily accompany the player character
 * Each companion has unique abilities and will only join under specific conditions
 */
class CompanionSystem {
    constructor(game) {
        this.game = game;
        this.currentCompanion = null;
        
        // Initialize sprite animator
        this.spriteAnimator = new SpriteAnimator();
        
        // Define available companions
        this.availableCompanions = {
            camille: {
                id: 'camille',
                name: 'Camille Reed',
                role: 'Art Teacher',
                sprite: 'assets/characters/camille.png',
                portrait: 'assets/characters/camille_portrait.png',
                ability: 'Reveal Hidden Drawings',
                abilityEffect: 'assets/effects/camille_ability.png',
                joinRequirements: {
                    trustMin: 2,
                    time: ['morning', 'afternoon'],
                    location: 'school',
                    discoveredClues: ['strange_art']
                },
                description: "A passionate art teacher at Maplewood Elementary School. She has been teaching here for over 10 years and knows the town's history well. Camille can help reveal hidden drawings and symbols."
            },
            jake: {
                id: 'jake',
                name: 'Jake Meyer',
                role: 'Handyman',
                sprite: 'assets/characters/jake.png',
                portrait: 'assets/characters/jake_portrait.png',
                ability: 'Find Shortcuts',
                abilityEffect: 'assets/effects/jake_ability.png',
                joinRequirements: {
                    trustMin: 1,
                    time: ['morning', 'afternoon', 'evening'],
                    location: 'town_square',
                    discoveredClues: ['broken_lock']
                },
                description: "Jake has been the town handyman for decades. He knows every nook and cranny of Maplewood Lane. His knowledge of building structures can help find shortcuts and hidden passages."
            },
            lila: {
                id: 'lila',
                name: 'Lila Chen',
                role: 'Journalist',
                sprite: 'assets/characters/lila.png',
                portrait: 'assets/characters/lila_portrait.png',
                ability: 'Access Restricted Records',
                abilityEffect: 'assets/effects/lila_ability.png',
                joinRequirements: {
                    trustMin: 3,
                    time: ['afternoon', 'evening'],
                    location: 'cafe',
                    discoveredClues: ['newspaper_article']
                },
                description: "An investigative journalist who recently moved to town to cover the mysterious events. Lila has press credentials that can help access restricted records and information."
            }
        };
        
        this.initialize();
    }
    
    /**
     * Initialize the companion system - set up UI and event listeners
     */
    initialize() {
        // Create companion UI container if it doesn't exist
        if (!document.querySelector('.companion-ui')) {
            const companionUI = document.createElement('div');
            companionUI.className = 'companion-ui';
            document.querySelector('.game-board').appendChild(companionUI);
        }
        
        // Add event listener for locations to check companion availability
        document.addEventListener('locationUpdate', (e) => {
            this.checkCompanionAvailability(e.detail.location);
        });
        
        // Add key binding for activating companion ability (C key)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'c' && this.currentCompanion) {
                this.activateCompanionAbility();
            }
        });
        
        console.log('CompanionSystem initialized');
    }
    
    /**
     * Check if companions are available to join at the current location
     * @param {string} location - Current location ID
     */
    checkCompanionAvailability(location) {
        // Don't check if player already has a companion
        if (this.currentCompanion) return;
        
        const currentTime = this.game.timeManager.getTimeOfDay();
        const currentTrust = this.game.relationshipManager.getTrustLevel();
        
        // Check each companion to see if they can join
        for (const [id, companion] of Object.entries(this.availableCompanions)) {
            const req = companion.joinRequirements;
            
            // Check all requirements
            const meetsTrustRequirement = currentTrust >= req.trustMin;
            const meetsTimeRequirement = req.time.includes(currentTime);
            const meetsLocationRequirement = location === req.location;
            const meetsClueRequirement = req.discoveredClues.some(clue => 
                this.game.foundClues.has(clue)
            );
            
            if (meetsTrustRequirement && meetsTimeRequirement && 
                meetsLocationRequirement && meetsClueRequirement) {
                this.offerCompanion(id);
                break; // Only offer one companion at a time
            }
        }
    }
    
    /**
     * Show UI dialog offering the companion to join the player
     * @param {string} companionId - ID of the companion to offer
     */
    offerCompanion(companionId) {
        const companion = this.availableCompanions[companionId];
        
        // Create dialog for companion offer
        const dialog = {
            characterId: companionId,
            name: companion.name,
            portrait: companion.portrait,
            text: `Hey Elia, I was just heading out. Want me to come along? I might be able to help with your investigation.`,
            options: [
                {
                    text: `Yes, I could use your help.`,
                    action: () => this.addCompanion(companionId)
                },
                {
                    text: `Not right now, thanks.`,
                    action: () => console.log("Companion offer declined")
                }
            ]
        };
        
        // Show the dialog
        this.game.showDialog(dialog.characterId, null, dialog);
    }
    
    /**
     * Add the companion to the player's party
     * @param {string} companionId - ID of the companion to add
     */
    addCompanion(companionId) {
        if (this.currentCompanion) {
            this.dismissCompanion();
        }
        
        const companion = this.availableCompanions[companionId];
        this.currentCompanion = companionId;
        
        // Initialize this companion in the sprite animator
        this.spriteAnimator.initCharacter(companionId);
        
        // Create companion character sprite that follows player
        const companionChar = document.createElement('div');
        companionChar.className = `companion-character ${companionId}`;
        companionChar.id = `companion-${companionId}`;
        
        // Use the current sprite from animator instead of static image
        const initialSprite = this.spriteAnimator.getCurrentSprite(companionId);
        companionChar.style.backgroundImage = `url(${initialSprite})`;
        
        document.querySelector('.game-board').appendChild(companionChar);
        
        // Position companion initially near player
        const player = document.querySelector('.player');
        if (player) {
            const playerRect = player.getBoundingClientRect();
            companionChar.style.left = (playerRect.left - 20) + 'px';
            companionChar.style.top = playerRect.top + 'px';
        }
        
        // Create companion status UI
        const companionStatus = document.createElement('div');
        companionStatus.className = 'companion-status joining';
        companionStatus.innerHTML = `
            <div class="companion-portrait companion-${companionId}"></div>
            <div class="companion-info">
                <div class="companion-name">${companion.name}</div>
                <div class="companion-ability">${companion.ability}</div>
                <button class="companion-dismiss">Dismiss</button>
            </div>
        `;
        
        // Add event listener to dismiss button
        companionStatus.querySelector('.companion-dismiss').addEventListener('click', () => {
            this.dismissCompanion();
        });
        
        // Add companion portrait click for detailed notes
        companionStatus.querySelector('.companion-portrait').addEventListener('click', () => {
            this.showCompanionNotes(companionId);
        });
        
        document.querySelector('.companion-ui').appendChild(companionStatus);
        
        // Show welcome message and start talking animation
        this.setTalking(true);
        this.showCompanionComment(companion.name, "I'll follow you and help with your investigation. Press 'C' to use my ability when needed.");
        
        // Stop talking animation after comment duration
        setTimeout(() => {
            this.setTalking(false);
        }, 4000);
        
        console.log(`Companion ${companion.name} joined the party`);
    }
    
    /**
     * Dismiss the current companion
     */
    dismissCompanion() {
        if (!this.currentCompanion) return;
        
        // Remove companion sprite
        const companionChar = document.getElementById(`companion-${this.currentCompanion}`);
        if (companionChar) {
            companionChar.remove();
        }
        
        // Remove companion status UI
        const companionStatus = document.querySelector('.companion-status');
        if (companionStatus) {
            companionStatus.remove();
        }
        
        // Show goodbye message with talking animation
        const companion = this.availableCompanions[this.currentCompanion];
        this.setTalking(true);
        this.showCompanionComment(companion.name, "I'll leave you to your investigation. Let me know if you need my help again.");
        
        // Clean up the dismissed companion after the message
        setTimeout(() => {
            this.setTalking(false);
            this.currentCompanion = null;
        }, 4000);
        
        console.log(`Companion ${companion.name} left the party`);
    }
    
    /**
     * Move the companion character to follow the player
     * Called from the game's update loop
     */
    updateCompanionPosition() {
        if (!this.currentCompanion) return;
        
        const companion = document.getElementById(`companion-${this.currentCompanion}`);
        const player = document.querySelector('.player');
        
        if (companion && player) {
            // Get current positions
            const companionRect = companion.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            
            // Calculate target position (slightly behind player)
            let targetX = playerRect.left - 20;
            let targetY = playerRect.top + 5;
            
            // Determine if the companion is moving
            const isMoving = 
                Math.abs(targetX - companionRect.left) > 2 || 
                Math.abs(targetY - companionRect.top) > 2;
            
            // Update movement state in the sprite animator
            this.setMoving(isMoving);
            
            // Get direction based on movement
            let direction = 'down';
            if (isMoving) {
                if (Math.abs(targetX - companionRect.left) > Math.abs(targetY - companionRect.top)) {
                    direction = targetX < companionRect.left ? 'left' : 'right';
                } else {
                    direction = targetY < companionRect.top ? 'up' : 'down';
                }
            }
            
            // Simple following with slight delay
            const newX = companionRect.left + (targetX - companionRect.left) * 0.1;
            const newY = companionRect.top + (targetY - companionRect.top) * 0.1;
            
            companion.style.left = newX + 'px';
            companion.style.top = newY + 'px';
            
            // Update companion sprite based on animation
            const currentSprite = this.spriteAnimator.getCurrentSprite(this.currentCompanion);
            if (currentSprite) {
                companion.style.backgroundImage = `url(${currentSprite})`;
            }
        }
    }
    
    /**
     * Set companion moving state
     * @param {boolean} isMoving - Whether the companion is moving
     * @param {string} direction - Direction of movement (up, down, left, right)
     */
    setMoving(isMoving, direction = null) {
        if (!this.currentCompanion) return;
        this.spriteAnimator.setMoving(this.currentCompanion, isMoving, direction);
    }
    
    /**
     * Set companion talking state
     * @param {boolean} isTalking - Whether the companion is talking
     */
    setTalking(isTalking) {
        if (!this.currentCompanion) return;
        this.spriteAnimator.setTalking(this.currentCompanion, isTalking);
    }
    
    /**
     * Activate the current companion's special ability
     */
    activateCompanionAbility() {
        if (!this.currentCompanion) return;
        
        const companion = this.availableCompanions[this.currentCompanion];
        const player = document.querySelector('.player');
        
        if (!player) return;
        
        // Show ability activation effect
        const effect = document.createElement('div');
        effect.className = `companion-ability-effect ${this.currentCompanion}-effect`;
        effect.style.backgroundImage = `url(${companion.abilityEffect})`;
        
        // Position effect near player
        const playerRect = player.getBoundingClientRect();
        effect.style.left = (playerRect.left + playerRect.width / 2 - 32) + 'px';
        effect.style.top = (playerRect.top + playerRect.height / 2 - 32) + 'px';
        
        document.querySelector('.game-board').appendChild(effect);
        
        // Start talking animation
        this.setTalking(true);
        
        // Show companion comment based on ability
        let comment = "";
        switch (this.currentCompanion) {
            case 'camille':
                comment = "I can see traces of hidden drawings here. Let me help reveal them.";
                // Check for hidden drawings in the vicinity
                this.checkHiddenDrawings();
                break;
            case 'jake':
                comment = "I might know a shortcut around here. Let me check.";
                // Check for shortcuts in the vicinity
                this.checkShortcuts();
                break;
            case 'lila':
                comment = "I might be able to get access to some information here. Let me try.";
                // Check for restricted records in the vicinity
                this.checkRestrictedRecords();
                break;
        }
        
        this.showCompanionComment(companion.name, comment);
        
        // Remove effect after animation completes
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
            // Stop talking animation
            this.setTalking(false);
        }, 2000);
    }
    
    /**
     * Check for hidden drawings near the player
     */
    checkHiddenDrawings() {
        // Search for hidden drawing objects near player
        const hiddenElements = document.querySelectorAll('.hidden-drawing, .hidden-symbol');
        const player = document.querySelector('.player');
        
        if (!player) return;
        
        const playerRect = player.getBoundingClientRect();
        let foundHidden = false;
        
        hiddenElements.forEach(element => {
            const elementRect = element.getBoundingClientRect();
            const distance = Math.sqrt(
                Math.pow(playerRect.left - elementRect.left, 2) +
                Math.pow(playerRect.top - elementRect.top, 2)
            );
            
            // If within range, reveal the hidden drawing
            if (distance < 100) {
                element.classList.add('revealed');
                foundHidden = true;
                
                // Add to clues if not already found
                const clueId = element.dataset.clueId;
                if (clueId && !this.game.foundClues.has(clueId)) {
                    this.game.addClueToNotebook(clueId);
                }
            }
        });
        
        if (!foundHidden) {
            // Show "nothing found" message
            setTimeout(() => {
                this.showCompanionComment(this.availableCompanions[this.currentCompanion].name, 
                    "I don't see any hidden drawings in this area.");
            }, 2000);
        }
    }
    
    /**
     * Check for shortcuts near the player
     */
    checkShortcuts() {
        // Search for shortcut objects near player
        const shortcutElements = document.querySelectorAll('.shortcut, .hidden-passage');
        const player = document.querySelector('.player');
        
        if (!player) return;
        
        const playerRect = player.getBoundingClientRect();
        let foundShortcut = false;
        
        shortcutElements.forEach(element => {
            const elementRect = element.getBoundingClientRect();
            const distance = Math.sqrt(
                Math.pow(playerRect.left - elementRect.left, 2) +
                Math.pow(playerRect.top - elementRect.top, 2)
            );
            
            // If within range, reveal the shortcut
            if (distance < 100) {
                element.classList.add('revealed');
                foundShortcut = true;
                
                // Unlock location if available
                const locationId = element.dataset.leadsTo;
                if (locationId && !this.game.discoveredLocations.has(locationId)) {
                    this.game.unlockLocation(locationId);
                }
            }
        });
        
        if (!foundShortcut) {
            // Show "nothing found" message
            setTimeout(() => {
                this.showCompanionComment(this.availableCompanions[this.currentCompanion].name, 
                    "I don't see any shortcuts or hidden passages around here.");
            }, 2000);
        }
    }
    
    /**
     * Check for restricted records near the player
     */
    checkRestrictedRecords() {
        // Search for record objects near player
        const recordElements = document.querySelectorAll('.restricted-record, .locked-file');
        const player = document.querySelector('.player');
        
        if (!player) return;
        
        const playerRect = player.getBoundingClientRect();
        let foundRecord = false;
        
        recordElements.forEach(element => {
            const elementRect = element.getBoundingClientRect();
            const distance = Math.sqrt(
                Math.pow(playerRect.left - elementRect.left, 2) +
                Math.pow(playerRect.top - elementRect.top, 2)
            );
            
            // If within range, access the record
            if (distance < 100) {
                element.classList.add('accessed');
                foundRecord = true;
                
                // Add to clues if not already found
                const clueId = element.dataset.clueId;
                if (clueId && !this.game.foundClues.has(clueId)) {
                    this.game.addClueToNotebook(clueId);
                }
            }
        });
        
        if (!foundRecord) {
            // Show "nothing found" message
            setTimeout(() => {
                this.showCompanionComment(this.availableCompanions[this.currentCompanion].name, 
                    "I don't see any restricted records I can access here.");
            }, 2000);
        }
    }
    
    /**
     * Show companion notes dialog
     * @param {string} companionId - ID of the companion
     */
    showCompanionNotes(companionId) {
        const companion = this.availableCompanions[companionId];
        
        const notesDialog = document.createElement('div');
        notesDialog.className = 'companion-notes-dialog';
        notesDialog.innerHTML = `
            <div class="notes-header">
                <h2>${companion.name}</h2>
                <div class="notes-close">×</div>
            </div>
            <div class="notes-portrait companion-${companionId}"></div>
            <div class="notes-content">
                <p><strong>Role:</strong> ${companion.role}</p>
                <p><strong>Ability:</strong> ${companion.ability}</p>
                <p>${companion.description}</p>
            </div>
        `;
        
        document.body.appendChild(notesDialog);
        
        // Add close button functionality
        notesDialog.querySelector('.notes-close').addEventListener('click', () => {
            notesDialog.classList.add('fadeout');
            setTimeout(() => {
                notesDialog.remove();
            }, 300);
        });
        
        // Fade in
        setTimeout(() => {
            notesDialog.classList.add('visible');
        }, 10);
    }
    
    /**
     * Show companion comment in a speech bubble
     * @param {string} name - Companion name
     * @param {string} text - Comment text
     */
    showCompanionComment(name, text) {
        const comment = document.createElement('div');
        comment.className = 'companion-comment';
        comment.textContent = text;
        
        // Position near companion or player if companion not visible
        const companion = document.querySelector('.companion-character');
        const player = document.querySelector('.player');
        
        if (companion) {
            const rect = companion.getBoundingClientRect();
            comment.style.left = rect.left + 'px';
            comment.style.top = (rect.top - 70) + 'px';
        } else if (player) {
            const rect = player.getBoundingClientRect();
            comment.style.left = rect.left + 'px';
            comment.style.top = (rect.top - 70) + 'px';
        }
        
        document.querySelector('.game-board').appendChild(comment);
        
        // Remove after animation completes
        setTimeout(() => {
            comment.remove();
        }, 4000);
    }
    
    /**
     * Check if companion has special interaction with object
     * @param {string} objectId - ID of the object
     * @returns {boolean} - True if interaction was handled
     */
    checkCompanionInteraction(objectId) {
        if (!this.currentCompanion) return false;
        
        const companion = this.availableCompanions[this.currentCompanion];
        
        // Define special interaction dialogue for each companion/object combination
        const specialInteractions = {
            camille: {
                art_supplies: "These are high-quality materials. I use similar ones in my classes.",
                old_painting: "This style reminds me of early 20th century folk art. Notice the unusual symbols?",
                strange_symbol: "I've seen this symbol before in some very old town records. It has something to do with the founding families.",
                hidden_drawing: "This drawing is using special ink that only appears under certain conditions."
            },
            jake: {
                old_door: "This door's been stuck for years. I know a trick to get it open.",
                broken_fence: "I could fix this easily. Might be a way through to the other side.",
                toolbox: "Heh, I've got a better set of tools at home, but these will do in a pinch.",
                hidden_path: "See how the ground is slightly different here? There's a path that not many people know about."
            },
            lila: {
                newspaper: "The local paper doesn't always print the whole story. I have sources who tell me more.",
                old_records: "These public records have been redacted, but I might be able to find the complete versions.",
                locked_file: "This kind of filing system is used by county officials. I know how to access it.",
                interview_subject: "I've interviewed them before. They know more than they're letting on."
            }
        };
        
        // Check if there's a special interaction for this object
        if (specialInteractions[companion.id] && specialInteractions[companion.id][objectId]) {
            // Start talking animation
            this.setTalking(true);
            
            // Show companion comment
            this.showCompanionComment(companion.name, specialInteractions[companion.id][objectId]);
            
            // Stop talking after message duration
            setTimeout(() => {
                this.setTalking(false);
            }, 4000);
            
            // Potentially add a new clue based on this interaction
            if (objectId === 'hidden_symbol' && !this.game.foundClues.has('recurring_symbol')) {
                this.game.addClueToNotebook('recurring_symbol');
            } else if (objectId === 'old_map' && !this.game.discoveredLocations.has('hidden_trail')) {
                this.game.unlockLocation('hidden_trail');
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Update animations - called from the game's animation loop
     * @param {number} timestamp - Current animation timestamp
     */
    update(timestamp) {
        if (this.spriteAnimator) {
            this.spriteAnimator.update(timestamp);
        }
    }
    
    /**
     * Get current companion ID or null if no companion
     * @returns {string|null} - Current companion ID
     */
    getCurrentCompanion() {
        return this.currentCompanion;
    }
    
    /**
     * Force add a companion (for dev tools/debugging)
     * @param {string} companionId - ID of companion to add
     */
    forceAddCompanion(companionId) {
        if (this.availableCompanions[companionId]) {
            this.addCompanion(companionId);
            return true;
        }
        return false;
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CompanionSystem;
} 