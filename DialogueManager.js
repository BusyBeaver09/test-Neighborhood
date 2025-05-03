/**
 * DialogueManager.js
 * 
 * A robust system for handling complex dialogue with:
 * - Branching conversations
 * - Dynamic conditions (trust, time, clues, etc.)
 * - Choices with consequences
 * - Photo/item triggers
 * - Global variables/state tracking
 */

class DialogueManager {
    constructor(game) {
        this.game = game; // Reference to the main game object
        this.dialogueData = {}; // Will store all dialogue data
        this.currentCharacter = null;
        this.currentDialogueNode = null;
        this.history = []; // Track dialogue path for backtracking
        this.variables = {}; // Store dialogue variables
        this.globalTriggers = []; // Store global dialogue triggers
        
        // DOM elements (will be initialized later)
        this.dialogOverlay = null;
        this.dialogBox = null;
        this.characterName = null;
        this.dialogPortrait = null;
        this.dialogText = null;
        this.dialogOptions = null;
        this.dialogClose = null;
        
        // Bind methods to ensure proper 'this' context
        this.showDialogue = this.showDialogue.bind(this);
        this.hideDialogue = this.hideDialogue.bind(this);
        this.handleChoice = this.handleChoice.bind(this);
        this.checkConditions = this.checkConditions.bind(this);
        this.applyEffects = this.applyEffects.bind(this);
    }

    /**
     * Initialize the dialogue manager with DOM elements and data
     */
    initialize(dialogueData, domElements) {
        this.dialogueData = dialogueData || {};
        
        // Set up DOM references
        this.dialogOverlay = domElements.overlay;
        this.dialogBox = domElements.box;
        this.characterName = domElements.name;
        this.dialogPortrait = domElements.portrait;
        this.dialogText = domElements.text;
        this.dialogOptions = domElements.options;
        this.dialogClose = domElements.close;
        
        // Set up event listeners
        if (this.dialogClose) {
            this.dialogClose.addEventListener('click', this.hideDialogue);
        }
    }
    
    /**
     * Load dialogue data from JSON
     */
    loadDialogueData(jsonData) {
        try {
            if (typeof jsonData === 'string') {
                this.dialogueData = JSON.parse(jsonData);
            } else {
                this.dialogueData = jsonData;
            }
            console.log('Dialogue data loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading dialogue data:', error);
            return false;
        }
    }
    
    /**
     * Display dialogue for a specific character
     */
    showDialogue(characterId, dialogueId = null) {
        // Get character data
        const character = this.dialogueData.characters[characterId];
        if (!character) {
            console.error(`Character '${characterId}' not found in dialogue data`);
            return false;
        }
        
        this.currentCharacter = characterId;
        
        // Find the appropriate dialogue to show
        let dialogue;
        
        if (dialogueId) {
            // Try to find the specific dialogue requested
            dialogue = character.dialogs.find(d => d.id === dialogueId);
        }
        
        // If no specific dialogue or not found, find first matching dialogue based on conditions
        if (!dialogue) {
            dialogue = this.getAvailableDialogue(character);
        }
        
        if (!dialogue) {
            console.error(`No suitable dialogue found for character '${characterId}'`);
            return false;
        }
        
        this.currentDialogueNode = dialogue.id;
        
        // Update the UI
        this.characterName.textContent = character.name;
        this.dialogPortrait.className = `character-portrait portrait-${characterId.replace('_', '-')}`;
        
        // Show dialogue text (can be single string or array of lines)
        let dialogueText = '';
        if (Array.isArray(dialogue.lines)) {
            dialogueText = dialogue.lines.join(' ');
        } else {
            dialogueText = dialogue.lines || dialogue.text;
        }
        
        // Process variable substitutions in dialogue text
        dialogueText = this.processTextVariables(dialogueText);
        
        this.dialogText.textContent = dialogueText;
        
        // Apply styling based on mood/tone if specified
        this.applyDialogueStyling(dialogue);
        
        // Clear and add dialogue options
        this.dialogOptions.innerHTML = '';
        
        if (dialogue.choices && dialogue.choices.length > 0) {
            dialogue.choices.forEach(choice => {
                // Skip choices that don't meet requirements
                if (!this.checkChoiceRequirements(choice)) {
                    return;
                }
                
                const optionElement = document.createElement('div');
                optionElement.className = 'dialog-option';
                
                // Process variable substitutions in choice text
                let choiceText = this.processTextVariables(choice.text);
                
                // Format text based on type
                if (choiceText.startsWith("Show photo:") || choice.requiresPhoto) {
                    optionElement.classList.add('photo-option');
                    optionElement.innerHTML = `<span class="photo-icon">📷</span> ${choiceText}`;
                } else if (choiceText.startsWith("Show clue:") || choice.requiresClue) {
                    optionElement.classList.add('clue-option');
                    optionElement.innerHTML = `<span class="clue-icon">🔍</span> ${choiceText}`;
                } else {
                    optionElement.textContent = choiceText;
                }
                
                // Add click handler
                optionElement.addEventListener('click', () => {
                    this.handleChoice(choice);
                });
                
                this.dialogOptions.appendChild(optionElement);
            });
        }
        
        // Add a close/exit option if no other options are available
        if (this.dialogOptions.children.length === 0) {
            const exitOption = document.createElement('div');
            exitOption.className = 'dialog-option';
            exitOption.textContent = "End conversation";
            exitOption.addEventListener('click', this.hideDialogue);
            this.dialogOptions.appendChild(exitOption);
        }
        
        // Show the dialogue overlay
        this.dialogOverlay.style.display = 'flex';
        if (this.game.playSoundEffect) {
            this.game.playSoundEffect('dialog');
        }
        
        // Add to history for backtracking
        this.history.push({
            characterId,
            dialogueId: dialogue.id
        });
        
        // Apply any automatic effects from this dialogue
        if (dialogue.effects) {
            this.applyEffects(dialogue.effects);
        }
        
        return true;
    }
    
    /**
     * Process variables in text like {playerName} or {trust}
     */
    processTextVariables(text) {
        if (!text) return '';
        
        return text.replace(/\{(\w+)\}/g, (match, variable) => {
            // Check game state variables first
            if (variable === 'trust') {
                return this.game.trust;
            } else if (variable === 'timeOfDay') {
                return this.game.currentTimeOfDay;
            }
            
            // Then check dialogue manager variables
            return this.variables[variable] || match;
        });
    }
    
    /**
     * Apply visual styling to the dialogue based on mood/tone
     */
    applyDialogueStyling(dialogue) {
        // Reset any previous custom styling
        this.dialogText.classList.remove('mysterious', 'urgent', 'friendly', 'suspicious');
        this.dialogOverlay.classList.remove('night-dialog', 'morning-dialog', 'afternoon-dialog', 'evening-dialog');
        
        // Apply time of day styling
        this.dialogOverlay.classList.add(`${this.game.currentTimeOfDay}-dialog`);
        
        // Apply mood styling if specified
        if (dialogue.mood) {
            this.dialogText.classList.add(dialogue.mood);
        }
        
        // Apply different styling based on trust levels
        const trust = this.game.trust;
        if (trust < 20) {
            this.dialogText.classList.add('suspicious');
        } else if (trust >= 60) {
            this.dialogText.classList.add('friendly');
        }
    }
    
    /**
     * Hide the dialogue overlay
     */
    hideDialogue() {
        this.dialogOverlay.style.display = 'none';
        this.currentDialogueNode = null;
        
        // Clear history when dialogue ends
        this.history = [];
        
        // Check for any global triggers after dialogue
        this.checkGlobalTriggers();
    }
    
    /**
     * Handle player selecting a dialogue choice
     */
    handleChoice(choice) {
        // Apply effects from the choice
        this.applyEffects(choice.effects);
        
        // Handle navigation to next dialogue
        if (choice.next === 'exit') {
            this.hideDialogue();
        } else if (choice.next) {
            this.showDialogue(this.currentCharacter, choice.next);
        } else {
            this.hideDialogue();
        }
    }
    
    /**
     * Find a suitable dialogue based on conditions
     */
    getAvailableDialogue(characterData) {
        // First look for dialogues matching conditions
        const matchingDialogue = characterData.dialogs.find(dialog => 
            this.checkConditions(dialog.conditions)
        );
        
        // If found, return it
        if (matchingDialogue) return matchingDialogue;
        
        // Otherwise return the default dialogue (no conditions or first one)
        return characterData.dialogs.find(dialog => !dialog.conditions) || characterData.dialogs[0];
    }
    
    /**
     * Check if conditions for a dialogue are met
     */
    checkConditions(conditions) {
        if (!conditions) return true;
        
        const { trust, currentTimeOfDay, foundClues } = this.game;
        
        // Check trust requirements
        if (conditions.trustMin !== undefined && trust < conditions.trustMin) {
            return false;
        }
        
        if (conditions.trustMax !== undefined && trust > conditions.trustMax) {
            return false;
        }
        
        // Check time of day
        if (conditions.timeOfDay && currentTimeOfDay !== conditions.timeOfDay) {
            return false;
        }
        
        // Check required clues
        if (conditions.requiresClue && !foundClues.has(conditions.requiresClue)) {
            return false;
        }
        
        // Check required photo type
        if (conditions.requiresPhoto) {
            // This would need to match your photo system implementation
            const hasRequiredPhoto = this.checkPhotoRequirement(conditions.requiresPhoto);
            if (!hasRequiredPhoto) return false;
        }
        
        // Check required variables
        if (conditions.variables) {
            for (const [variable, value] of Object.entries(conditions.variables)) {
                if (this.variables[variable] !== value) {
                    return false;
                }
            }
        }
        
        // All conditions passed
        return true;
    }
    
    /**
     * Check if choice-specific requirements are met
     */
    checkChoiceRequirements(choice) {
        if (!choice) return true;
        
        // Shortcut if the choice has a requirements object
        if (choice.requirements) {
            return this.checkConditions(choice.requirements);
        }
        
        // Otherwise check individual properties
        
        // Photo requirements
        if (choice.requiresPhoto) {
            const hasPhoto = this.checkPhotoRequirement(choice.requiresPhoto);
            if (!hasPhoto) return false;
        }
        
        // Clue requirements
        if (choice.requiresClue && !this.game.foundClues.has(choice.requiresClue)) {
            return false;
        }
        
        // Trust minimum
        if (choice.trustMin !== undefined && this.game.trust < choice.trustMin) {
            return false;
        }
        
        // Variable requirements
        if (choice.requiresVariable) {
            const varName = choice.requiresVariable.name;
            const varValue = choice.requiresVariable.value;
            if (this.variables[varName] !== varValue) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if the player has a specific type of photo
     */
    checkPhotoRequirement(photoType) {
        // Delegate to the game's checkPhotoRequirement method for consistency
        if (this.game && this.game.checkPhotoRequirement) {
            return this.game.checkPhotoRequirement(photoType);
        }
        
        // Fallback implementation if game doesn't have the method
        if (!this.game.photoDetails || this.game.photoDetails.length === 0) {
            return false;
        }
        
        return this.game.photoDetails.some(photo => {
            // Each photo type might have different conditions
            switch(photoType) {
                case "flickering_light":
                case "flickerPhoto":
                    return photo.timeOfDay === "night" && 
                           photo.nearbyElements.some(e => e.type === 'house' && e.index === 0);
                           
                case "shadow":
                case "shadowPhoto":
                    return photo.timeOfDay === "night" && 
                           photo.nearbyElements.some(e => e.type === 'house' && e.index === 3);
                           
                case "well":
                case "wellPhoto":
                    return photo.timeOfDay === "evening" &&
                           Math.abs(photo.position.x - 400) < 100 && 
                           Math.abs(photo.position.y - 300) < 100;
                           
                default:
                    return photo.type === photoType;
            }
        });
    }
    
    /**
     * Apply effects from dialogue choices
     */
    applyEffects(effects) {
        if (!effects) return;
        
        // Apply trust changes
        if (effects.trust) {
            this.game.trust += effects.trust;
            this.game.trustElement.textContent = this.game.trust;
            
            // Visual feedback for trust change
            const trustFeedback = document.createElement('div');
            trustFeedback.className = 'trust-feedback';
            trustFeedback.textContent = effects.trust > 0 ? `+${effects.trust} Trust` : `${effects.trust} Trust`;
            trustFeedback.classList.add(effects.trust > 0 ? 'trust-gain' : 'trust-loss');
            document.body.appendChild(trustFeedback);
            
            // Animate and remove
            setTimeout(() => {
                trustFeedback.classList.add('fade-out');
                setTimeout(() => trustFeedback.remove(), 1000);
            }, 1500);
        }
        
        // Unlock clues
        if (effects.unlockClue && !this.game.foundClues.has(effects.unlockClue)) {
            this.game.foundClues.add(effects.unlockClue);
            this.game.addClueToNotebook(effects.unlockClue);
            if (this.game.playSoundEffect) {
                this.game.playSoundEffect('clue');
            }
            
            // Notify player
            const clueNotification = document.createElement('div');
            clueNotification.className = 'clue-notification';
            clueNotification.textContent = `New clue: "${effects.unlockClue}"`;
            document.body.appendChild(clueNotification);
            
            // Animate and remove
            setTimeout(() => {
                clueNotification.classList.add('fade-out');
                setTimeout(() => clueNotification.remove(), 1000);
            }, 3000);
        }
        
        // Add items to inventory if needed
        if (effects.addItem) {
            // This would need to match your inventory system
            if (this.game.addItemToInventory) {
                this.game.addItemToInventory(effects.addItem);
            }
        }
        
        // Trigger events if needed
        if (effects.triggerEvent) {
            if (this.game.triggerEvent) {
                this.game.triggerEvent({id: effects.triggerEvent});
            }
        }
        
        // Set variables
        if (effects.setVariable) {
            for (const [varName, varValue] of Object.entries(effects.setVariable)) {
                this.variables[varName] = varValue;
            }
        }
    }
    
    /**
     * Add a global trigger that can happen outside of specific dialogues
     */
    addGlobalTrigger(trigger) {
        this.globalTriggers.push(trigger);
    }
    
    /**
     * Check if any global triggers should fire
     */
    checkGlobalTriggers() {
        this.globalTriggers.forEach(trigger => {
            if (this.checkConditions(trigger.conditions)) {
                // Execute trigger action (show dialogue, add clue, etc.)
                if (trigger.showDialogue) {
                    this.showDialogue(trigger.showDialogue.character, trigger.showDialogue.dialogue);
                }
                
                if (trigger.effects) {
                    this.applyEffects(trigger.effects);
                }
                
                // Remove one-time triggers
                if (trigger.oneTime) {
                    this.globalTriggers = this.globalTriggers.filter(t => t !== trigger);
                }
            }
        });
    }
    
    /**
     * Export dialogue data for saving
     */
    exportDialogueState() {
        return {
            currentCharacter: this.currentCharacter,
            currentDialogueNode: this.currentDialogueNode,
            history: [...this.history],
            variables: {...this.variables}
        };
    }
    
    /**
     * Import dialogue data when loading a save
     */
    importDialogueState(state) {
        if (!state) return;
        
        this.currentCharacter = state.currentCharacter;
        this.currentDialogueNode = state.currentDialogueNode;
        this.history = state.history || [];
        this.variables = state.variables || {};
    }
    
    /**
     * Convert legacy dialogue format to new format
     */
    convertLegacyDialogue(legacyDialogues) {
        const newFormat = {
            characters: {}
        };
        
        // Process each character in the legacy format
        Object.keys(legacyDialogues).forEach(characterId => {
            const legacyCharacter = legacyDialogues[characterId];
            
            // Create new character entry
            newFormat.characters[characterId] = {
                id: characterId,
                name: legacyCharacter.name,
                portrait: legacyCharacter.portrait,
                dialogs: []
            };
            
            // Process each dialogue node
            Object.keys(legacyCharacter).forEach(nodeId => {
                // Skip non-dialogue properties
                if (nodeId === 'name' || nodeId === 'portrait') return;
                
                const legacyNode = legacyCharacter[nodeId];
                
                // Create conditions object based on node properties
                const conditions = {};
                if (legacyNode.trust && typeof legacyNode.trust === 'number') {
                    conditions.trustMin = legacyNode.trust;
                }
                
                // Create effects object
                const effects = {};
                if (legacyNode.trust && typeof legacyNode.trust === 'number') {
                    effects.trust = legacyNode.trust;
                }
                if (legacyNode.clue) {
                    effects.unlockClue = legacyNode.clue;
                }
                
                // Create new dialogue entry
                const newDialogue = {
                    id: nodeId,
                    text: legacyNode.text,
                    mood: legacyNode.mood,
                    conditions: Object.keys(conditions).length > 0 ? conditions : undefined,
                    effects: Object.keys(effects).length > 0 ? effects : undefined,
                    choices: []
                };
                
                // Convert options to choices
                if (legacyNode.options && Array.isArray(legacyNode.options)) {
                    legacyNode.options.forEach(option => {
                        const choice = {
                            text: option.text,
                            next: option.next
                        };
                        
                        // Convert legacy requirements
                        if (option.requirement) {
                            if (option.requirement.trust) {
                                choice.trustMin = option.requirement.trust;
                            }
                            if (option.requirement.clue) {
                                choice.requiresClue = option.requirement.clue;
                            }
                            if (option.requirement.photoRequired) {
                                choice.requiresPhoto = option.requirement.photoRequired;
                            }
                            if (option.requirement.timeOfDay) {
                                choice.requiresTimeOfDay = option.requirement.timeOfDay;
                            }
                        }
                        
                        // Set up effects
                        const effects = {};
                        if (option.trust) {
                            effects.trust = option.trust;
                        }
                        if (option.unlocks) {
                            effects.unlockClue = option.unlocks;
                        }
                        
                        if (Object.keys(effects).length > 0) {
                            choice.effects = effects;
                        }
                        
                        newDialogue.choices.push(choice);
                    });
                }
                
                // Add the new dialogue to the character
                newFormat.characters[characterId].dialogs.push(newDialogue);
            });
        });
        
        return newFormat;
    }
}

/**
 * Sample JSON structure for dialogue data
 */
const DIALOGUE_DATA_SAMPLE = {
    "characters": {
        "mrs_finch": {
            "id": "mrs_finch",
            "name": "Mrs. Finch",
            "portrait": "portrait-mrs-finch",
            "dialogs": [
                {
                    "id": "intro",
                    "lines": [
                        "Oh Elia, dear... still snooping around, are you?",
                        "You should be careful what you dig up in this town."
                    ],
                    "conditions": {
                        "trustMin": 0,
                        "trustMax": 10,
                        "timeOfDay": "morning"
                    },
                    "mood": "suspicious",
                    "choices": [
                        {
                            "text": "I just want to understand what happened to Iris.",
                            "next": "iris_questions",
                            "effects": { "trust": 2 }
                        },
                        {
                            "text": "Are you warning me about something specific?",
                            "next": "warning",
                            "effects": { "trust": -1 }
                        }
                    ]
                },
                {
                    "id": "light_story",
                    "lines": [
                        "That night, the basement light kept flickering.",
                        "I thought it was just the storm. But I swear, I saw someone..."
                    ],
                    "conditions": {
                        "trustMin": 25,
                        "timeOfDay": "night"
                    },
                    "mood": "mysterious",
                    "choices": [
                        {
                            "text": "Was it a shadow figure?",
                            "next": "shadow_description",
                            "effects": { 
                                "trust": 5,
                                "unlockClue": "Mrs. Finch may have seen a 'shadow figure' in Iris's basement"
                            }
                        },
                        {
                            "text": "Could it have been a reflection?",
                            "next": "reflection_discussion"
                        },
                        {
                            "text": "Show photo: Flickering Light",
                            "next": "confirm_flickering",
                            "requiresPhoto": "flickering_light",
                            "effects": { "trust": 10 }
                        }
                    ]
                }
            ]
        }
    },
    "globalTriggers": [
        {
            "conditions": {
                "trustMin": 50,
                "requiresClue": "Shadowy figure appears at midnight at the abandoned house"
            },
            "showDialogue": {
                "character": "mr_arnold",
                "dialogue": "mr_arnold_night_high_trust"
            },
            "oneTime": true
        }
    ]
}; 