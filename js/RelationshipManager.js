/**
 * RelationshipManager.js - Character trust and relationship progression system
 * Manages per-character trust levels, trust tiers, and relationship dynamics
 */

class RelationshipManager {
    constructor(game) {
        this.game = game;
        
        // Trust levels per character
        this.characterTrust = {};
        
        // Trust tier definitions
        this.trustTiers = {
            suspicious: { min: 0, max: 10, name: "Suspicious" },
            cautious: { min: 11, max: 30, name: "Cautious" },
            confiding: { min: 31, max: 60, name: "Confiding" },
            vulnerable: { min: 61, max: 100, name: "Vulnerable" }
        };
        
        // Trust history for tracking changes
        this.trustHistory = {};
        
        // Character personalities affecting trust dynamics
        this.personalities = {};
        
        // Initialize trust levels
        this.initializeRelationships();
    }
    
    /**
     * Initialize default relationship states
     */
    initializeRelationships() {
        // Default characters
        const defaultCharacters = ['mrs_finch', 'jake_lila', 'mr_arnold', 'camille'];
        
        defaultCharacters.forEach(characterId => {
            this.characterTrust[characterId] = {
                level: 0,
                lastChange: "0",
                tier: "Suspicious",
                notes: []
            };
            
            this.trustHistory[characterId] = [];
        });
        
        // Set up personality traits
        this.setupPersonalities();
    }
    
    /**
     * Set up character personality traits that affect trust dynamics
     */
    setupPersonalities() {
        this.personalities = {
            mrs_finch: {
                forgiveness: 0.5,    // Low forgiveness (0-1)
                memory: 0.9,         // Strong memory (0-1)
                emotionality: 0.7,   // High emotional sensitivity
                description: "Mrs. Finch remembers everything — trust loss is long-lasting."
            },
            jake_lila: {
                forgiveness: 0.8,    // High forgiveness
                memory: 0.4,         // Short memory
                emotionality: 0.6,   // Moderate emotional sensitivity
                description: "Jake forgives fast but gets defensive easily."
            },
            mr_arnold: {
                forgiveness: 0.3,    // Very low forgiveness
                memory: 0.8,         // Good memory
                emotionality: 0.3,   // Low emotional sensitivity
                description: "Mr. Arnold rarely forgives perceived slights and maintains a distance."
            },
            camille: {
                forgiveness: 0.7,    // Good forgiveness
                memory: 0.5,         // Average memory
                emotionality: 0.9,   // Very high emotional sensitivity
                description: "Camille mirrors Elia's emotional tone — trust depends on how you speak."
            }
        };
    }
    
    /**
     * Get current trust level for a character
     * @param {string} characterId - Character identifier
     * @returns {number} Current trust level (0-100)
     */
    getTrustLevel(characterId) {
        if (!this.characterTrust[characterId]) {
            return 0;
        }
        return this.characterTrust[characterId].level;
    }
    
    /**
     * Get current trust tier for a character
     * @param {string} characterId - Character identifier
     * @returns {string} Current trust tier name
     */
    getTrustTier(characterId) {
        if (!this.characterTrust[characterId]) {
            return "Suspicious";
        }
        return this.characterTrust[characterId].tier;
    }
    
    /**
     * Calculate tier based on trust level
     * @param {number} level - Trust level
     * @returns {string} Trust tier name
     */
    calculateTier(level) {
        if (level <= this.trustTiers.suspicious.max) {
            return "Suspicious";
        } else if (level <= this.trustTiers.cautious.max) {
            return "Cautious";
        } else if (level <= this.trustTiers.confiding.max) {
            return "Confiding";
        } else {
            return "Vulnerable";
        }
    }
    
    /**
     * Adjust trust level for a character
     * @param {string} characterId - Character identifier
     * @param {number} amount - Amount to adjust trust by
     * @param {string} reason - Reason for trust change
     */
    adjustTrust(characterId, amount, reason = "") {
        if (!this.characterTrust[characterId]) {
            this.characterTrust[characterId] = {
                level: 0,
                lastChange: "0",
                tier: "Suspicious",
                notes: []
            };
            this.trustHistory[characterId] = [];
        }
        
        // Apply personality modifiers
        const personalityMod = this.applyPersonalityModifiers(characterId, amount);
        const adjustedAmount = Math.round(personalityMod);
        
        // Record previous state
        const previousLevel = this.characterTrust[characterId].level;
        const previousTier = this.characterTrust[characterId].tier;
        
        // Update trust level
        this.characterTrust[characterId].level += adjustedAmount;
        
        // Clamp to valid range
        this.characterTrust[characterId].level = Math.max(0, Math.min(100, this.characterTrust[characterId].level));
        
        // Update last change
        this.characterTrust[characterId].lastChange = adjustedAmount >= 0 ? `+${adjustedAmount}` : `${adjustedAmount}`;
        
        // Recalculate tier
        this.characterTrust[characterId].tier = this.calculateTier(this.characterTrust[characterId].level);
        
        // Add to history
        this.trustHistory[characterId].push({
            timestamp: Date.now(),
            gameTime: this.game.timeManager ? this.game.timeManager.time : 0,
            gameDay: this.game.timeManager ? this.game.timeManager.dayCount : 1,
            previousLevel,
            newLevel: this.characterTrust[characterId].level,
            change: adjustedAmount,
            reason
        });
        
        // Check if tier changed
        const tierChanged = previousTier !== this.characterTrust[characterId].tier;
        
        // Show notification if significant change or tier change
        if (Math.abs(adjustedAmount) >= 5 || tierChanged) {
            const character = this.getCharacterName(characterId);
            let message = `${character}: ${this.characterTrust[characterId].lastChange} Trust`;
            
            if (tierChanged) {
                message += ` (Now: ${this.characterTrust[characterId].tier})`;
            }
            
            this.game.showNotification(message);
        }
        
        // Update aggregate trust level (for backward compatibility)
        this.updateGlobalTrust();
        
        // Return tier changed status
        return {
            newLevel: this.characterTrust[characterId].level,
            previousLevel,
            tierChanged,
            previousTier,
            newTier: this.characterTrust[characterId].tier
        };
    }
    
    /**
     * Apply personality modifiers to trust changes
     * @param {string} characterId - Character identifier
     * @param {number} amount - Base amount to adjust
     * @returns {number} Modified amount
     */
    applyPersonalityModifiers(characterId, amount) {
        const personality = this.personalities[characterId];
        if (!personality) return amount;
        
        let modified = amount;
        
        // Negative changes are affected by forgiveness
        if (amount < 0) {
            // Lower forgiveness means trust loss is magnified
            modified = amount * (2 - personality.forgiveness);
        }
        // Positive changes are affected by memory of past injuries
        else if (amount > 0) {
            // Check recent negative changes
            const recentChanges = this.getRecentChanges(characterId, 5);
            const recentNegative = recentChanges.filter(c => c.change < 0);
            
            if (recentNegative.length > 0) {
                // Strong memory means positive changes are reduced if there were recent negatives
                const memoryImpact = personality.memory * (recentNegative.length / 10);
                modified = amount * (1 - memoryImpact);
            }
        }
        
        // Emotionality affects the overall magnitude of changes
        modified = modified * (1 + (personality.emotionality - 0.5) / 2);
        
        return modified;
    }
    
    /**
     * Get recent trust changes for a character
     * @param {string} characterId - Character identifier
     * @param {number} count - Number of recent changes to get
     * @returns {Array} Recent changes
     */
    getRecentChanges(characterId, count = 5) {
        if (!this.trustHistory[characterId]) {
            return [];
        }
        
        return this.trustHistory[characterId].slice(-count);
    }
    
    /**
     * Add a note about a character
     * @param {string} characterId - Character identifier
     * @param {string} note - Note text
     */
    addCharacterNote(characterId, note) {
        if (!this.characterTrust[characterId]) {
            return;
        }
        
        const timestamp = this.game.timeManager ? 
            this.game.timeManager.formatGameTime(this.game.timeManager.time) : 
            new Date().toLocaleTimeString();
        
        this.characterTrust[characterId].notes.push({
            text: note,
            timestamp,
            gameDay: this.game.timeManager ? this.game.timeManager.dayCount : 1
        });
    }
    
    /**
     * Get character notes
     * @param {string} characterId - Character identifier
     * @returns {Array} Character notes
     */
    getCharacterNotes(characterId) {
        if (!this.characterTrust[characterId]) {
            return [];
        }
        
        return this.characterTrust[characterId].notes;
    }
    
    /**
     * Get a character's name for display
     * @param {string} characterId - Character identifier
     * @returns {string} Character name
     */
    getCharacterName(characterId) {
        const characterNames = {
            mrs_finch: "Mrs. Finch",
            jake_lila: "Jake & Lila",
            mr_arnold: "Mr. Arnold",
            camille: "Camille"
        };
        
        return characterNames[characterId] || characterId;
    }
    
    /**
     * Check if character meets a minimum trust level
     * @param {string} characterId - Character identifier
     * @param {number} minimumLevel - Minimum required trust level
     * @returns {boolean} Whether the character meets the minimum trust
     */
    meetsMinimumTrust(characterId, minimumLevel) {
        return this.getTrustLevel(characterId) >= minimumLevel;
    }
    
    /**
     * Check if character is at a specific tier or higher
     * @param {string} characterId - Character identifier
     * @param {string} tier - Trust tier ("suspicious", "cautious", "confiding", "vulnerable")
     * @returns {boolean} Whether the character is at the specified tier or higher
     */
    isAtTierOrHigher(characterId, tier) {
        const currentLevel = this.getTrustLevel(characterId);
        
        switch(tier.toLowerCase()) {
            case "suspicious":
                return true; // Everyone is at least suspicious
            case "cautious":
                return currentLevel > this.trustTiers.suspicious.max;
            case "confiding":
                return currentLevel > this.trustTiers.cautious.max;
            case "vulnerable":
                return currentLevel > this.trustTiers.confiding.max;
            default:
                return false;
        }
    }
    
    /**
     * Update the global trust level based on individual character trust
     */
    updateGlobalTrust() {
        // Average all character trust levels for backward compatibility
        const characters = Object.keys(this.characterTrust);
        if (characters.length === 0) return;
        
        let totalTrust = 0;
        
        characters.forEach(characterId => {
            totalTrust += this.characterTrust[characterId].level;
        });
        
        const averageTrust = Math.round(totalTrust / characters.length);
        
        // Update game's trust property
        if (this.game.trust !== averageTrust) {
            this.game.trust = averageTrust;
            if (this.game.trustElement) {
                this.game.trustElement.textContent = averageTrust;
            }
        }
    }
    
    /**
     * Get relevant dialogue based on trust level
     * @param {string} characterId - Character identifier
     * @param {Array} dialogueOptions - Array of dialogue options with trust requirements
     * @returns {Object|null} Selected dialogue or null
     */
    getRelevantDialogue(characterId, dialogueOptions) {
        if (!dialogueOptions || !dialogueOptions.length) return null;
        
        const trustLevel = this.getTrustLevel(characterId);
        
        // Filter options that meet trust requirement
        const validOptions = dialogueOptions.filter(option => 
            !option.minTrust || trustLevel >= option.minTrust
        );
        
        // Sort by trust requirement (highest first)
        validOptions.sort((a, b) => (b.minTrust || 0) - (a.minTrust || 0));
        
        return validOptions.length > 0 ? validOptions[0] : null;
    }
    
    /**
     * Generate UI for relationship display in notebook
     * @returns {HTMLElement} Relationship UI element
     */
    generateRelationshipUI() {
        const container = document.createElement('div');
        container.className = 'relationships-container';
        
        const characters = Object.keys(this.characterTrust);
        
        characters.forEach(characterId => {
            const characterData = this.characterTrust[characterId];
            
            const characterCard = document.createElement('div');
            characterCard.className = 'character-relationship-card';
            characterCard.dataset.characterId = characterId;
            
            const header = document.createElement('div');
            header.className = 'relationship-header';
            
            const name = document.createElement('h3');
            name.textContent = this.getCharacterName(characterId);
            
            const tier = document.createElement('div');
            tier.className = `relationship-tier tier-${characterData.tier.toLowerCase()}`;
            tier.textContent = characterData.tier;
            
            header.appendChild(name);
            header.appendChild(tier);
            
            const trustBar = document.createElement('div');
            trustBar.className = 'trust-bar-container';
            
            const trustValue = document.createElement('span');
            trustValue.className = 'trust-value';
            trustValue.textContent = `Trust: ${characterData.level}/100`;
            
            const barContainer = document.createElement('div');
            barContainer.className = 'progress-bar-background';
            
            const bar = document.createElement('div');
            bar.className = `progress-bar tier-${characterData.tier.toLowerCase()}`;
            bar.style.width = `${characterData.level}%`;
            
            barContainer.appendChild(bar);
            
            trustBar.appendChild(trustValue);
            trustBar.appendChild(barContainer);
            
            const personalityBox = document.createElement('div');
            personalityBox.className = 'personality-box';
            
            if (this.personalities[characterId]) {
                personalityBox.textContent = this.personalities[characterId].description;
            }
            
            const notesContainer = document.createElement('div');
            notesContainer.className = 'character-notes-container';
            
            const notesHeader = document.createElement('h4');
            notesHeader.textContent = 'Notes';
            
            const notesList = document.createElement('ul');
            notesList.className = 'character-notes-list';
            
            characterData.notes.forEach(note => {
                const noteItem = document.createElement('li');
                noteItem.innerHTML = `<span class="note-time">Day ${note.gameDay}, ${note.timestamp}</span>: ${note.text}`;
                notesList.appendChild(noteItem);
            });
            
            const addNoteForm = document.createElement('div');
            addNoteForm.className = 'add-note-form';
            
            const noteInput = document.createElement('textarea');
            noteInput.className = 'note-input';
            noteInput.placeholder = `Add a note about ${this.getCharacterName(characterId)}...`;
            
            const addNoteBtn = document.createElement('button');
            addNoteBtn.className = 'add-note-button';
            addNoteBtn.textContent = 'Add Note';
            addNoteBtn.addEventListener('click', () => {
                if (noteInput.value.trim()) {
                    this.addCharacterNote(characterId, noteInput.value.trim());
                    
                    // Refresh the notes list
                    const newNote = document.createElement('li');
                    const time = this.game.timeManager ? 
                        this.game.timeManager.formatGameTime(this.game.timeManager.time) : 
                        new Date().toLocaleTimeString();
                    const day = this.game.timeManager ? this.game.timeManager.dayCount : 1;
                    
                    newNote.innerHTML = `<span class="note-time">Day ${day}, ${time}</span>: ${noteInput.value.trim()}`;
                    notesList.appendChild(newNote);
                    
                    // Clear input
                    noteInput.value = '';
                }
            });
            
            addNoteForm.appendChild(noteInput);
            addNoteForm.appendChild(addNoteBtn);
            
            notesContainer.appendChild(notesHeader);
            notesContainer.appendChild(notesList);
            notesContainer.appendChild(addNoteForm);
            
            characterCard.appendChild(header);
            characterCard.appendChild(trustBar);
            characterCard.appendChild(personalityBox);
            characterCard.appendChild(notesContainer);
            
            container.appendChild(characterCard);
        });
        
        return container;
    }
    
    /**
     * Get data for saving
     */
    getSaveData() {
        return {
            characterTrust: this.characterTrust,
            trustHistory: this.trustHistory
        };
    }
    
    /**
     * Load from save data
     * @param {Object} saveData - Saved relationship data
     */
    loadFromSave(saveData) {
        if (!saveData) return;
        
        if (saveData.characterTrust) {
            this.characterTrust = saveData.characterTrust;
        }
        
        if (saveData.trustHistory) {
            this.trustHistory = saveData.trustHistory;
        }
        
        // Update global trust for backward compatibility
        this.updateGlobalTrust();
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RelationshipManager;
} 