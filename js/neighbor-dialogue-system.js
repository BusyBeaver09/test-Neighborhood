/**
 * neighbor-dialogue-system.js - Personality-driven dialogue system for Maplewood Lane
 * 
 * This system manages character personalities, dialogue trees, and trust-based
 * dialogue variations for the game Maplewood Lane.
 */

class DialogueSystem {
    constructor() {
        this.characters = {};
        this.dialogues = {};
        this.currentCharacter = null;
        this.currentDialogue = null;
        this.gameState = {
            trust: {},
            clues: new Set(),
            timeOfDay: 'day',
            accusedCharacters: new Set(),
            shownEvidence: {}
        };
    }

    /**
     * Initialize the dialogue system with character and dialogue data
     * @param {Object} data - The character and dialogue data
     */
    initialize(data) {
        if (data.characters) {
            this.characters = data.characters;
        }
        
        if (data.dialogues) {
            this.dialogues = data.dialogues;
        }
        
        // Set initial trust values
        Object.keys(this.characters).forEach(charId => {
            if (!this.gameState.trust[charId]) {
                this.gameState.trust[charId] = 0;
            }
        });
        
        console.log('Dialogue system initialized with', 
            Object.keys(this.characters).length, 'characters and',
            Object.keys(this.dialogues).length, 'dialogue trees');
    }

    /**
     * Get a character by ID
     * @param {string} characterId - The character's unique ID
     * @returns {Object} The character data
     */
    getCharacter(characterId) {
        return this.characters[characterId];
    }

    /**
     * Get all characters
     * @returns {Object} All character data
     */
    getAllCharacters() {
        return this.characters;
    }

    /**
     * Set the trust level for a character
     * @param {string} characterId - The character's unique ID
     * @param {number} trustLevel - The new trust level (0-100)
     */
    setTrustLevel(characterId, trustLevel) {
        // Ensure trust level is within valid range
        trustLevel = Math.max(0, Math.min(100, trustLevel));
        this.gameState.trust[characterId] = trustLevel;
        
        return trustLevel;
    }

    /**
     * Change trust level by a relative amount
     * @param {string} characterId - The character's unique ID
     * @param {number} amount - The amount to change (positive or negative)
     * @returns {number} The new trust level
     */
    changeTrustLevel(characterId, amount) {
        const currentTrust = this.gameState.trust[characterId] || 0;
        return this.setTrustLevel(characterId, currentTrust + amount);
    }

    /**
     * Set the time of day
     * @param {string} timeOfDay - 'morning', 'afternoon', 'evening', or 'night'
     */
    setTimeOfDay(timeOfDay) {
        this.gameState.timeOfDay = timeOfDay;
    }

    /**
     * Add a clue to the player's collected clues
     * @param {string} clueId - The unique ID of the clue
     */
    addClue(clueId) {
        this.gameState.clues.add(clueId);
    }

    /**
     * Check if player has a specific clue
     * @param {string} clueId - The clue to check for
     * @returns {boolean} Whether the player has the clue
     */
    hasClue(clueId) {
        return this.gameState.clues.has(clueId);
    }

    /**
     * Record that the player accused a character
     * @param {string} characterId - The accused character
     */
    accuseCharacter(characterId) {
        this.gameState.accusedCharacters.add(characterId);
    }

    /**
     * Record that a piece of evidence was shown to a character
     * @param {string} characterId - The character who saw the evidence
     * @param {string} evidenceId - The evidence that was shown
     */
    showEvidence(characterId, evidenceId) {
        if (!this.gameState.shownEvidence[characterId]) {
            this.gameState.shownEvidence[characterId] = new Set();
        }
        
        this.gameState.shownEvidence[characterId].add(evidenceId);
    }

    /**
     * Check if character has been shown specific evidence
     * @param {string} characterId - The character to check
     * @param {string} evidenceId - The evidence to check for
     * @returns {boolean} Whether the evidence was shown
     */
    hasSeenEvidence(characterId, evidenceId) {
        return this.gameState.shownEvidence[characterId] && 
               this.gameState.shownEvidence[characterId].has(evidenceId);
    }

    /**
     * Start a dialogue with a character
     * @param {string} characterId - The character to talk to
     * @param {string} dialogueId - The specific dialogue to start, or null for default
     * @returns {Object} The dialogue node to display
     */
    startDialogue(characterId, dialogueId = null) {
        this.currentCharacter = characterId;
        
        // If no specific dialogue requested, find an appropriate one based on conditions
        if (!dialogueId) {
            dialogueId = this.findAppropriateDialogue(characterId);
        }
        
        this.currentDialogue = dialogueId;
        return this.getDialogueNode(characterId, dialogueId);
    }

    /**
     * Find appropriate dialogue based on current conditions
     * @param {string} characterId - The character to find dialogue for
     * @returns {string} The ID of the appropriate dialogue
     */
    findAppropriateDialogue(characterId) {
        // Get all dialogues for this character
        const availableDialogues = Object.keys(this.dialogues)
            .filter(key => this.dialogues[key].character === characterId);
        
        if (availableDialogues.length === 0) {
            return null;
        }
        
        // Filter dialogues that meet the current conditions
        const suitableDialogues = availableDialogues.filter(dialogueId => {
            return this.checkDialogueConditions(this.dialogues[dialogueId]);
        });
        
        if (suitableDialogues.length === 0) {
            // If no suitable dialogue found, try to find a fallback
            const fallbacks = availableDialogues.filter(dialogueId => 
                this.dialogues[dialogueId].isFallback);
            
            return fallbacks.length > 0 ? fallbacks[0] : availableDialogues[0];
        }
        
        // Sort by priority and return highest priority
        suitableDialogues.sort((a, b) => {
            const priorityA = this.dialogues[a].priority || 0;
            const priorityB = this.dialogues[b].priority || 0;
            return priorityB - priorityA;
        });
        
        return suitableDialogues[0];
    }

    /**
     * Check if dialogue conditions are met
     * @param {Object} dialogue - The dialogue to check
     * @returns {boolean} Whether conditions are met
     */
    checkDialogueConditions(dialogue) {
        if (!dialogue.conditions) {
            return true;
        }
        
        const conditions = dialogue.conditions;
        const characterId = dialogue.character;
        
        // Check trust level
        if (conditions.trustMin !== undefined) {
            if ((this.gameState.trust[characterId] || 0) < conditions.trustMin) {
                return false;
            }
        }
        
        if (conditions.trustMax !== undefined) {
            if ((this.gameState.trust[characterId] || 0) > conditions.trustMax) {
                return false;
            }
        }
        
        // Check time of day
        if (conditions.timeOfDay && 
            conditions.timeOfDay !== this.gameState.timeOfDay) {
            return false;
        }
        
        // Check required clues
        if (conditions.requiredClues) {
            for (const clue of conditions.requiredClues) {
                if (!this.gameState.clues.has(clue)) {
                    return false;
                }
            }
        }
        
        // Check if character was accused
        if (conditions.wasAccused !== undefined) {
            const wasAccused = this.gameState.accusedCharacters.has(characterId);
            if (conditions.wasAccused !== wasAccused) {
                return false;
            }
        }
        
        // Check if specific evidence was shown
        if (conditions.shownEvidence) {
            if (!this.gameState.shownEvidence[characterId]) {
                return false;
            }
            
            if (!this.gameState.shownEvidence[characterId].has(conditions.shownEvidence)) {
                return false;
            }
        }
        
        // Check previous dialogue
        if (conditions.previousDialogue) {
            if (this.currentDialogue !== conditions.previousDialogue) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get a dialogue node for display
     * @param {string} characterId - The character ID
     * @param {string} dialogueId - The dialogue ID
     * @returns {Object} The dialogue node
     */
    getDialogueNode(characterId, dialogueId) {
        if (!this.dialogues[dialogueId] || 
            this.dialogues[dialogueId].character !== characterId) {
            return null;
        }
        
        const dialogue = this.dialogues[dialogueId];
        const trustLevel = this.gameState.trust[characterId] || 0;
        
        // Get the appropriate text based on trust level
        let text = dialogue.text;
        
        // If text varies by trust level, choose appropriate one
        if (Array.isArray(dialogue.text)) {
            const character = this.characters[characterId];
            const trustThresholds = character.trustThresholds || [0, 25, 50, 75];
            
            // Find which threshold range we're in
            let thresholdIndex = 0;
            for (let i = trustThresholds.length - 1; i >= 0; i--) {
                if (trustLevel >= trustThresholds[i]) {
                    thresholdIndex = i;
                    break;
                }
            }
            
            // Use text for that threshold, or highest available
            text = dialogue.text[Math.min(thresholdIndex, dialogue.text.length - 1)];
        }
        
        // Get choices, filtering any with unmet conditions
        let choices = dialogue.choices || [];
        choices = choices.filter(choice => {
            if (!choice.conditions) return true;
            return this.checkChoiceConditions(choice.conditions, characterId);
        });
        
        // Apply personality traits to text if needed
        text = this.applyPersonalityToText(text, characterId);
        
        return {
            id: dialogueId,
            character: characterId,
            text: text,
            choices: choices,
            effects: dialogue.effects
        };
    }

    /**
     * Check if choice conditions are met
     * @param {Object} conditions - Conditions to check
     * @param {string} characterId - Character ID for context
     * @returns {boolean} Whether conditions are met
     */
    checkChoiceConditions(conditions, characterId) {
        // Check trust level
        if (conditions.trustMin !== undefined) {
            if ((this.gameState.trust[characterId] || 0) < conditions.trustMin) {
                return false;
            }
        }
        
        // Check required clues
        if (conditions.requiredClues) {
            for (const clue of conditions.requiredClues) {
                if (!this.gameState.clues.has(clue)) {
                    return false;
                }
            }
        }
        
        // Check character traits
        if (conditions.requiredTrait) {
            const character = this.characters[characterId];
            if (!character.traits || !character.traits.includes(conditions.requiredTrait)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Apply personality traits to modify text
     * @param {string} text - The original dialogue text
     * @param {string} characterId - The character ID
     * @returns {string} Modified text based on personality
     */
    applyPersonalityToText(text, characterId) {
        const character = this.characters[characterId];
        if (!character || !character.traits || !text) {
            return text;
        }
        
        let modifiedText = text;
        
        // Apply trait-specific modifications
        if (character.traits.includes('anxious') && this.gameState.timeOfDay === 'night') {
            modifiedText = modifiedText.replace(/\./g, '...');
            modifiedText = modifiedText.replace(/(?:^|[.!?]\s+)([a-z])/g, (match) => match.toUpperCase());
        }
        
        if (character.traits.includes('secretive') && this.gameState.trust[characterId] < 50) {
            modifiedText = modifiedText.replace(/\b(know|saw|heard|witnessed)\b/gi, 'might have $1');
        }
        
        if (character.traits.includes('superstitious')) {
            modifiedText = modifiedText.replace(/coincidence/gi, 'sign');
            modifiedText = modifiedText.replace(/accident/gi, 'fate');
        }
        
        return modifiedText;
    }

    /**
     * Select a dialogue choice
     * @param {string} choiceId - The ID of the selected choice
     * @returns {Object} The next dialogue node
     */
    selectChoice(choiceId) {
        if (!this.currentDialogue || !this.currentCharacter) {
            return null;
        }
        
        const dialogue = this.dialogues[this.currentDialogue];
        if (!dialogue || !dialogue.choices) {
            return null;
        }
        
        // Find the selected choice
        const choice = dialogue.choices.find(c => c.id === choiceId);
        if (!choice) {
            return null;
        }
        
        // Apply choice effects
        if (choice.effects) {
            this.applyChoiceEffects(choice.effects);
        }
        
        // Get next dialogue
        if (choice.nextDialogue) {
            return this.startDialogue(this.currentCharacter, choice.nextDialogue);
        } else {
            // End dialogue if no next node
            this.currentDialogue = null;
            return null;
        }
    }

    /**
     * Apply effects from a dialogue choice
     * @param {Object} effects - The effects to apply
     */
    applyChoiceEffects(effects) {
        // Trust changes
        if (effects.trustChange) {
            this.changeTrustLevel(this.currentCharacter, effects.trustChange);
        }
        
        // Unlock clues
        if (effects.unlockClue) {
            this.addClue(effects.unlockClue);
        }
        
        // Record accusation
        if (effects.accuseCharacter) {
            this.accuseCharacter(effects.accuseCharacter);
        }
        
        // Record showing evidence
        if (effects.showEvidence) {
            this.showEvidence(this.currentCharacter, effects.showEvidence);
        }
        
        // Custom event trigger for game integration
        if (effects.triggerEvent) {
            // This would connect to the main game's event system
            console.log('Triggered event:', effects.triggerEvent);
        }
    }

    /**
     * Export all data for saving
     * @returns {Object} All dialogue system data
     */
    exportData() {
        return {
            characters: this.characters,
            dialogues: this.dialogues,
            gameState: this.gameState
        };
    }
    
    /**
     * Import saved data
     * @param {Object} data - Previously exported data
     */
    importData(data) {
        if (data.characters) {
            this.characters = data.characters;
        }
        
        if (data.dialogues) {
            this.dialogues = data.dialogues;
        }
        
        if (data.gameState) {
            this.gameState = data.gameState;
        }
    }
}

// Example character data template
const characterTemplate = {
    id: 'character_id',
    name: 'Character Name',
    archetype: 'Character Archetype',
    hiddenLayer: 'Secret revealed at high trust',
    traits: ['trait1', 'trait2'],
    trustThresholds: [0, 25, 50, 75],
    portrait: 'path/to/portrait.png'
};

// Example dialogue node template
const dialogueNodeTemplate = {
    id: 'dialogue_id',
    character: 'character_id',
    conditions: {
        trustMin: 0,
        trustMax: 100,
        timeOfDay: 'day', // 'day', 'night'
        requiredClues: ['clue1', 'clue2'],
        wasAccused: false,
        shownEvidence: 'evidence_id',
        previousDialogue: 'previous_dialogue_id'
    },
    // Text can be a string or array of strings for different trust levels
    text: 'Dialogue text',
    // Alternative: array of texts for different trust thresholds
    // text: [
    //     'Low trust text (0-24)',
    //     'Medium trust text (25-49)',
    //     'High trust text (50-74)',
    //     'Very high trust text (75+)'
    // ],
    choices: [
        {
            id: 'choice1',
            text: 'Choice text',
            conditions: {
                trustMin: 0,
                requiredClues: ['clue1'],
                requiredTrait: 'trait1'
            },
            effects: {
                trustChange: 5,
                unlockClue: 'new_clue',
                accuseCharacter: 'character_id',
                showEvidence: 'evidence_id',
                triggerEvent: 'event_name'
            },
            nextDialogue: 'next_dialogue_id'
        }
    ],
    priority: 1, // Higher priority dialogues are selected first
    isFallback: false // Can be used as a fallback if no suitable dialogue
};

// Example sample data with Mrs. Finch
const sampleDialogueData = {
    characters: {
        mrs_finch: {
            id: 'mrs_finch',
            name: 'Mrs. Finch',
            archetype: 'Nosy Elder',
            hiddenLayer: "She's protecting someone involved",
            traits: ['nosy', 'protective', 'secretive', 'anxious'],
            trustThresholds: [0, 25, 50, 75],
            portrait: 'assets/characters/mrs_finch.png'
        },
        jake: {
            id: 'jake',
            name: 'Jake',
            archetype: 'Guilty Teen',
            hiddenLayer: "He saw something he wasn't supposed to",
            traits: ['secretive', 'anxious', 'protective'],
            trustThresholds: [0, 25, 50, 75],
            portrait: 'assets/characters/jake.png'
        }
    },
    dialogues: {
        // Mrs. Finch introduction dialogue
        mrs_finch_intro: {
            id: 'mrs_finch_intro',
            character: 'mrs_finch',
            text: [
                "Oh, hello dear. You must be new here. Looking into poor Iris's disappearance? Such a shame what happened.",
                "Hello there. You're investigating Iris's disappearance, aren't you? I've been keeping an eye on the neighborhood lately.",
                "I've been waiting for someone to take this case more seriously. Iris was a good girl, and I've noticed some... strange things lately.",
                "Thank goodness someone is finally taking this seriously. I've been watching the neighborhood, and I think there's more to Iris's disappearance than most realize."
            ],
            choices: [
                {
                    id: 'ask_about_iris',
                    text: "What do you know about Iris?",
                    effects: {
                        trustChange: 5
                    },
                    nextDialogue: 'mrs_finch_about_iris'
                },
                {
                    id: 'ask_about_neighborhood',
                    text: "You seem to know a lot about everyone here.",
                    nextDialogue: 'mrs_finch_neighborhood'
                },
                {
                    id: 'ask_about_night',
                    text: "Did you see anything suspicious the night she vanished?",
                    conditions: {
                        trustMin: 25
                    },
                    nextDialogue: 'mrs_finch_night_observed'
                },
                {
                    id: 'ask_about_night_low_trust',
                    text: "Did you see anything suspicious the night she vanished?",
                    conditions: {
                        trustMax: 24
                    },
                    effects: {
                        trustChange: -5
                    },
                    nextDialogue: 'mrs_finch_defensive'
                }
            ],
            priority: 10,
            isFallback: true
        },
        
        // Mrs. Finch talking about Iris
        mrs_finch_about_iris: {
            id: 'mrs_finch_about_iris',
            character: 'mrs_finch',
            conditions: {
                previousDialogue: 'mrs_finch_intro'
            },
            text: [
                "Iris? Such a sweet girl. Always helping with neighborhood events. Had a curious nature though, maybe too curious for her own good.",
                "Iris was a lovely girl. Very inquisitive, always asking questions about the neighborhood history. She was especially curious about the old storm and the power outage.",
                "Iris was special. She was investigating something before she disappeared. I noticed her taking photos at night around Mr. Arnold's house. I was concerned.",
                "I worry that Iris got too close to something dangerous. She confided in me that she'd seen strange lights in the basement of Arnold's house the night of the big storm."
            ],
            choices: [
                {
                    id: 'ask_about_curious',
                    text: "What do you mean by 'too curious'?",
                    nextDialogue: 'mrs_finch_iris_curious'
                },
                {
                    id: 'ask_about_enemies',
                    text: "Did she have enemies in the neighborhood?",
                    conditions: {
                        requiredTrait: 'protective'
                    },
                    effects: {
                        trustChange: 5
                    },
                    nextDialogue: 'mrs_finch_iris_friends'
                },
                {
                    id: 'back_to_intro',
                    text: "Let's talk about something else.",
                    nextDialogue: 'mrs_finch_intro'
                }
            ]
        },
        
        // Mrs. Finch high-trust confession (night only)
        mrs_finch_night_confession: {
            id: 'mrs_finch_night_confession',
            character: 'mrs_finch',
            conditions: {
                trustMin: 75,
                timeOfDay: 'night',
                requiredClues: ['finch_window_photo']
            },
            text: "I... I didn't want to tell anyone this. That night, I saw someone from my window. A figure near Arnold's house, carrying something. I think... I think it was Jake.",
            choices: [
                {
                    id: 'ask_if_certain',
                    text: "Are you certain it was Jake?",
                    effects: {
                        unlockClue: 'finch_jake_sighting'
                    },
                    nextDialogue: 'mrs_finch_uncertain_id'
                },
                {
                    id: 'ask_why_silent',
                    text: "Why didn't you tell the police?",
                    effects: {
                        trustChange: -10
                    },
                    nextDialogue: 'mrs_finch_protective_explanation'
                }
            ],
            priority: 100
        }
    }
};

// Export the DialogueSystem class and templates
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DialogueSystem,
        characterTemplate,
        dialogueNodeTemplate,
        sampleDialogueData
    };
} 