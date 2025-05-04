/**
 * EndingManager.js - Handles ending determination and presentation
 * Based on trust, clues collected, photos taken, and player theory
 */

class EndingManager {
    constructor(game) {
        this.game = game;
        
        // Ending types with requirements and descriptions
        this.endings = {
            full_truth: {
                name: "The Full Truth",
                description: "You've uncovered what truly happened to Iris Bell",
                tone: "Bittersweet",
                requirements: {
                    cluePercentage: 80,
                    keyClues: [
                        "Mrs. Finch saw flowing shadow figures the night Iris disappeared",
                        "Iris's journal - 'Some things in Maplewood Lane were better left undisturbed'",
                        "Shadow figures described by multiple witnesses"
                    ],
                    keyPhotos: ["basement_light", "shadow_figure", "well_at_night"],
                    trustRequirements: {
                        "mrs_finch": 60,  // Vulnerable tier
                        "mr_arnold": 40,  // Confiding tier
                        "camille": 30     // At least Cautious tier
                    }
                },
                epilogue: {
                    "mrs_finch": "Mrs. Finch finally laid her guilt to rest, and began talking openly about the shadows.",
                    "jake_lila": "Jake and Lila left town shortly after the truth came out, leaving no forwarding address.",
                    "mr_arnold": "Mr. Arnold stopped his nightly vigils, finding peace at last.",
                    "camille": "Camille still draws the shadow figures, but they no longer frighten her."
                }
            },
            misguided_conclusion: {
                name: "Misguided Conclusion",
                description: "You pieced together a theory, but missed crucial elements of the truth",
                tone: "Ambiguous",
                requirements: {
                    cluePercentage: 40,
                    maxCluePercentage: 70,
                    incorrectAssumptions: true,
                    trustRequirements: {
                        "mrs_finch": 30,  // At least Cautious tier
                        "mr_arnold": 20   // At least Cautious tier
                    }
                },
                epilogue: {
                    "mrs_finch": "Mrs. Finch continues to keep her secrets, though she sometimes leaves flowers by the well.",
                    "jake_lila": "Jake and Lila settled into the community, gradually erasing traces of Iris.",
                    "mr_arnold": "Mr. Arnold still watches the abandoned house at night, waiting for something only he understands.",
                    "camille": "Camille eventually stopped drawing the shadow figures, trying to be 'normal' like the other kids."
                }
            },
            community_silence: {
                name: "Community Silence",
                description: "The truth remains buried beneath layers of silence and distrust",
                tone: "Repressive",
                requirements: {
                    maxTrustAverage: 25,
                    trustRequirements: {
                        "mrs_finch": {max: 20},  // Low trust
                        "jake_lila": {max: 20},  // Low trust
                        "mr_arnold": {max: 20}   // Low trust
                    }
                },
                epilogue: {
                    "mrs_finch": "Mrs. Finch refused to speak about Iris after your accusations, taking her knowledge to the grave.",
                    "jake_lila": "Jake and Lila continued to live in Iris's house, though neighbors say they hear arguments late at night.",
                    "mr_arnold": "Mr. Arnold was found dead under mysterious circumstances three months after you left town.",
                    "camille": "Camille was sent to live with relatives in another state. Her mother claimed the town wasn't 'healthy' for a young girl."
                }
            },
            the_vanishing: {
                name: "The Vanishing",
                description: "You glimpsed the supernatural truth behind Maplewood Lane",
                tone: "Mystical",
                requirements: {
                    keyClues: [
                        "Shadow figures described by multiple witnesses",
                        "Camille draws shadow figures, says 'Iris used to talk to them'",
                        "The basement lights are evidence of an ongoing search by unknown entities"
                    ],
                    trustRequirements: {
                        "camille": 60  // Very high trust with Camille
                    },
                    supernaturalFocus: true
                },
                epilogue: {
                    "mrs_finch": "Mrs. Finch leaves a light on in her window every night, 'just in case Iris finds her way back.'",
                    "jake_lila": "Jake and Lila's marriage fell apart. Lila claims she saw Iris standing at the foot of her bed one night.",
                    "mr_arnold": "Mr. Arnold claims to communicate with the shadow figures now, though most think he's lost his mind.",
                    "camille": "Camille still sees the shadows. Sometimes, she says, they take the form of Iris to say hello."
                }
            },
            false_trail: {
                name: "The False Trail",
                description: "Your investigation followed misleading evidence",
                tone: "Tragic",
                requirements: {
                    redHerrings: true,
                    missingKeyClues: true,
                    contradictoryNotes: true
                },
                epilogue: {
                    "mrs_finch": "Mrs. Finch watches you with sad eyes whenever you pass, but never speaks to you again.",
                    "jake_lila": "Jake and Lila hosted a neighborhood barbecue, seemingly untouched by the tragedy that haunts the town.",
                    "mr_arnold": "Mr. Arnold moved away after your investigation stirred up painful memories.",
                    "camille": "Camille's mother forbids her from speaking about Iris or the 'imaginary shadows' anymore."
                }
            }
        };
        
        // Default to no ending determined yet
        this.determinedEnding = null;
    }
    
    /**
     * Evaluate which ending the player has earned based on their progress
     * @returns {string} The ending key that matches their progress
     */
    evaluateEnding() {
        console.log("Evaluating ending based on player progress...");
        
        // Calculate clue percentage
        const totalStoryClues = this.getTotalPossibleClues();
        const foundClues = this.game.foundClues ? this.game.foundClues.size : 0;
        const cluePercentage = Math.floor((foundClues / totalStoryClues) * 100);
        
        console.log(`Clue percentage: ${cluePercentage}% (${foundClues}/${totalStoryClues})`);
        
        // Get trust levels
        const trustLevels = {};
        if (this.game.relationshipManager) {
            for (const characterId in this.game.relationshipManager.characterTrust) {
                trustLevels[characterId] = this.game.relationshipManager.getTrustLevel(characterId);
                console.log(`Trust with ${characterId}: ${trustLevels[characterId]}`);
            }
        }
        
        // Calculate average trust
        const trustValues = Object.values(trustLevels);
        const avgTrust = trustValues.length > 0 ? 
            Math.floor(trustValues.reduce((sum, val) => sum + val, 0) / trustValues.length) : 0;
        
        console.log(`Average trust: ${avgTrust}`);
        
        // Check player theory from notebook
        const playerTheory = this.getPlayerTheory();
        const supernaturalFocus = this.hasSupernaturalFocus(playerTheory);
        const contradictoryNotes = this.hasContradictoryNotes(playerTheory);
        const redHerrings = this.followedRedHerrings();
        const missingKeyClues = this.isMissingKeyClues();
        
        // Check for each ending
        let determiningFactors = {};
        let matchedEnding = null;
        
        // Try to match Full Truth ending
        if (this.matchesFullTruthEnding(cluePercentage, trustLevels)) {
            matchedEnding = "full_truth";
            determiningFactors = {
                highCluePercentage: cluePercentage >= 80,
                hasKeyClues: this.hasRequiredClues(this.endings.full_truth.requirements.keyClues),
                highTrustWithKey: this.meetsCharacterTrustRequirements(this.endings.full_truth.requirements.trustRequirements),
                hasKeyPhotos: this.hasRequiredPhotos(this.endings.full_truth.requirements.keyPhotos)
            };
        }
        // The Vanishing (supernatural ending)
        else if (this.matchesVanishingEnding(trustLevels, supernaturalFocus)) {
            matchedEnding = "the_vanishing";
            determiningFactors = {
                supernaturalFocus: supernaturalFocus,
                highCamilleTrust: trustLevels["camille"] >= 60,
                hasShadowClues: this.hasRequiredClues(this.endings.the_vanishing.requirements.keyClues)
            };
        }
        // Community Silence (low trust ending)
        else if (avgTrust <= 25 && this.meetsTrustLimits(this.endings.community_silence.requirements.trustRequirements)) {
            matchedEnding = "community_silence";
            determiningFactors = {
                lowAverageTrust: avgTrust <= 25,
                alienatedNeighbors: this.meetsTrustLimits(this.endings.community_silence.requirements.trustRequirements)
            };
        }
        // False Trail (followed red herrings)
        else if (redHerrings && missingKeyClues && contradictoryNotes) {
            matchedEnding = "false_trail";
            determiningFactors = {
                followedRedHerrings: redHerrings,
                missingCriticalClues: missingKeyClues,
                contradictoryTheory: contradictoryNotes
            };
        }
        // Misguided Conclusion (default fallback)
        else {
            matchedEnding = "misguided_conclusion";
            determiningFactors = {
                moderateCluePercentage: cluePercentage >= 40 && cluePercentage < 70,
                incompleteTrust: !this.meetsCharacterTrustRequirements(this.endings.full_truth.requirements.trustRequirements),
                incorrectAssumptions: true
            };
        }
        
        console.log(`Determined ending: ${matchedEnding}`);
        console.log("Determining factors:", determiningFactors);
        
        this.determinedEnding = matchedEnding;
        return matchedEnding;
    }
    
    /**
     * Check if player meets requirements for Full Truth ending
     */
    matchesFullTruthEnding(cluePercentage, trustLevels) {
        const requirements = this.endings.full_truth.requirements;
        
        return (
            cluePercentage >= requirements.cluePercentage &&
            this.hasRequiredClues(requirements.keyClues) &&
            this.hasRequiredPhotos(requirements.keyPhotos) &&
            this.meetsCharacterTrustRequirements(requirements.trustRequirements)
        );
    }
    
    /**
     * Check if player meets requirements for The Vanishing (supernatural) ending
     */
    matchesVanishingEnding(trustLevels, supernaturalFocus) {
        const requirements = this.endings.the_vanishing.requirements;
        
        return (
            supernaturalFocus &&
            this.hasRequiredClues(requirements.keyClues) &&
            trustLevels["camille"] >= requirements.trustRequirements["camille"]
        );
    }
    
    /**
     * Check if player has required clues for an ending
     */
    hasRequiredClues(requiredClues) {
        if (!requiredClues || !requiredClues.length) return true;
        
        // Convert Set to Array for easier checking
        const playerClues = Array.from(this.game.foundClues || []);
        
        return requiredClues.every(requiredClue => {
            return playerClues.some(playerClue => 
                playerClue.includes(requiredClue) || requiredClue.includes(playerClue)
            );
        });
    }
    
    /**
     * Check if player has required photos
     */
    hasRequiredPhotos(requiredPhotos) {
        if (!requiredPhotos || !requiredPhotos.length) return true;
        
        const playerPhotos = this.game.photos || [];
        
        return requiredPhotos.every(requiredType => {
            return playerPhotos.some(photo => {
                // Check the type/category of each photo
                return photo.type === requiredType || photo.tags.includes(requiredType);
            });
        });
    }
    
    /**
     * Check if player meets trust requirements for characters
     */
    meetsCharacterTrustRequirements(trustRequirements) {
        if (!trustRequirements) return true;
        
        for (const characterId in trustRequirements) {
            const requiredLevel = trustRequirements[characterId];
            const actualLevel = this.game.relationshipManager ? 
                this.game.relationshipManager.getTrustLevel(characterId) : 0;
            
            if (actualLevel < requiredLevel) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if trust levels are below or equal to maximum limits
     */
    meetsTrustLimits(trustRequirements) {
        if (!trustRequirements) return true;
        
        for (const characterId in trustRequirements) {
            const requirement = trustRequirements[characterId];
            
            // Skip if no max defined
            if (!requirement.max) continue;
            
            const actualLevel = this.game.relationshipManager ? 
                this.game.relationshipManager.getTrustLevel(characterId) : 0;
            
            if (actualLevel > requirement.max) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Get the total number of possible story clues
     */
    getTotalPossibleClues() {
        // This would normally be pulled from a data file
        // For now, using a reasonable estimate
        return 35; 
    }
    
    /**
     * Get the player's theory from notebook notes
     */
    getPlayerTheory() {
        // Get theory from notebook text
        const notesContent = document.getElementById("notesArea") ? 
            document.getElementById("notesArea").value : "";
        
        // Add final theory if submitted
        if (this.game.finalTheory) {
            return this.game.finalTheory;
        }
        
        return notesContent;
    }
    
    /**
     * Check if player's theory focuses on supernatural elements
     */
    hasSupernaturalFocus(theory) {
        if (!theory) return false;
        
        const supernaturalTerms = [
            "shadow", "shadows", "ghost", "spirit", "supernatural", 
            "entity", "entities", "paranormal", "vanished", "disappeared",
            "watcher", "watchers", "flowing", "dark figure"
        ];
        
        // Count occurrences of supernatural terms
        let count = 0;
        supernaturalTerms.forEach(term => {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            const matches = theory.match(regex) || [];
            count += matches.length;
        });
        
        // If multiple supernatural terms are used prominently, consider it focused on supernatural
        return count >= 3;
    }
    
    /**
     * Check if player's notes have contradictory elements
     */
    hasContradictoryNotes(theory) {
        if (!theory) return false;
        
        // Look for phrases that suggest contradiction
        const contradictionPhrases = [
            "but this contradicts", "however", "on the other hand",
            "this doesn't make sense", "inconsistent", "conflicting",
            "doesn't add up", "confused", "unsure", "puzzling"
        ];
        
        for (const phrase of contradictionPhrases) {
            if (theory.toLowerCase().includes(phrase.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if player focused on red herrings
     */
    followedRedHerrings() {
        // List of red herring clues
        const redHerrings = [
            "Jake and Lila's financial troubles",
            "Mrs. Finch's medication",
            "Old town legends"
        ];
        
        // Get notes and check emphasis on red herrings
        const theory = this.getPlayerTheory();
        
        if (!theory) return false;
        
        let redHerringFocus = false;
        for (const redHerring of redHerrings) {
            if (theory.toLowerCase().includes(redHerring.toLowerCase())) {
                redHerringFocus = true;
                break;
            }
        }
        
        return redHerringFocus;
    }
    
    /**
     * Check if player is missing key clues for the truth
     */
    isMissingKeyClues() {
        const criticalClues = [
            "Shadow figures described by multiple witnesses",
            "Mr. Arnold saw Iris heading to the well the night she disappeared",
            "Iris's journal mentions the shadow entities"
        ];
        
        return !this.hasRequiredClues(criticalClues);
    }
    
    /**
     * Present the ending sequence to the player
     */
    presentEnding() {
        if (!this.determinedEnding) {
            this.evaluateEnding();
        }
        
        const ending = this.endings[this.determinedEnding];
        
        console.log(`Presenting ending: ${ending.name}`);
        
        // Create ending screen overlay
        const endingOverlay = document.createElement('div');
        endingOverlay.className = 'ending-overlay';
        
        // Create ending content container
        const endingContent = document.createElement('div');
        endingContent.className = 'ending-content';
        
        // Create ending header
        const endingHeader = document.createElement('h2');
        endingHeader.className = 'ending-title';
        endingHeader.textContent = ending.name;
        
        // Create ending description
        const endingDesc = document.createElement('p');
        endingDesc.className = 'ending-description';
        endingDesc.textContent = ending.description;
        
        // Create epilogue section
        const epilogueContainer = document.createElement('div');
        epilogueContainer.className = 'epilogue-container';
        
        const epilogueHeader = document.createElement('h3');
        epilogueHeader.textContent = "Epilogue: Three Months Later";
        epilogueContainer.appendChild(epilogueHeader);
        
        // Add character epilogues
        for (const character in ending.epilogue) {
            const characterEpilogue = document.createElement('div');
            characterEpilogue.className = 'character-epilogue';
            
            const characterName = document.createElement('h4');
            characterName.textContent = this.getCharacterName(character);
            
            const characterFate = document.createElement('p');
            characterFate.textContent = ending.epilogue[character];
            
            characterEpilogue.appendChild(characterName);
            characterEpilogue.appendChild(characterFate);
            epilogueContainer.appendChild(characterEpilogue);
        }
        
        // Add stats section
        const statsContainer = document.createElement('div');
        statsContainer.className = 'ending-stats';
        
        const statsHeader = document.createElement('h3');
        statsHeader.textContent = "Your Investigation";
        statsContainer.appendChild(statsHeader);
        
        const cluesFound = document.createElement('p');
        const foundClueCount = this.game.foundClues ? this.game.foundClues.size : 0;
        cluesFound.textContent = `Clues Found: ${foundClueCount}/${this.getTotalPossibleClues()}`;
        statsContainer.appendChild(cluesFound);
        
        const trustStats = document.createElement('p');
        let trustText = "Character Relationships: ";
        
        if (this.game.relationshipManager) {
            const characters = Object.keys(this.game.relationshipManager.characterTrust);
            characters.forEach((characterId, index) => {
                const trustLevel = this.game.relationshipManager.getTrustLevel(characterId);
                const tier = this.game.relationshipManager.getTrustTier(characterId);
                trustText += `${this.getCharacterName(characterId)} (${tier}: ${trustLevel})`;
                
                if (index < characters.length - 1) {
                    trustText += ", ";
                }
            });
        } else {
            trustText += "Data unavailable";
        }
        
        trustStats.textContent = trustText;
        statsContainer.appendChild(trustStats);
        
        // Replay button
        const replayButton = document.createElement('button');
        replayButton.className = 'ending-replay-btn';
        replayButton.textContent = "Play Again";
        replayButton.addEventListener('click', () => {
            this.game.resetGame();
            endingOverlay.remove();
        });
        
        // Credits button
        const creditsButton = document.createElement('button');
        creditsButton.className = 'ending-credits-btn';
        creditsButton.textContent = "Credits";
        creditsButton.addEventListener('click', () => {
            // Show credits
            this.showCredits(endingOverlay);
        });
        
        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'ending-buttons';
        buttonContainer.appendChild(replayButton);
        buttonContainer.appendChild(creditsButton);
        
        // Assemble content
        endingContent.appendChild(endingHeader);
        endingContent.appendChild(endingDesc);
        endingContent.appendChild(epilogueContainer);
        endingContent.appendChild(statsContainer);
        endingContent.appendChild(buttonContainer);
        
        endingOverlay.appendChild(endingContent);
        document.body.appendChild(endingOverlay);
        
        // Animation for entrance
        setTimeout(() => {
            endingOverlay.classList.add('visible');
        }, 100);
    }
    
    /**
     * Get character name for display
     */
    getCharacterName(characterId) {
        const characterNames = {
            "mrs_finch": "Mrs. Finch",
            "jake_lila": "Jake & Lila",
            "mr_arnold": "Mr. Arnold",
            "camille": "Camille"
        };
        
        return characterNames[characterId] || characterId;
    }
    
    /**
     * Show credits screen
     */
    showCredits(parentOverlay) {
        const creditsOverlay = document.createElement('div');
        creditsOverlay.className = 'credits-overlay';
        
        const creditsContent = document.createElement('div');
        creditsContent.className = 'credits-content';
        
        const creditsHeader = document.createElement('h2');
        creditsHeader.textContent = "Maplewood Lane: Neighborhood Mysteries";
        
        const creditsList = document.createElement('div');
        creditsList.className = 'credits-list';
        
        // Credits content would go here
        const credits = [
            { role: "Story & Concept", name: "Your Name" },
            { role: "Programming", name: "Your Name" },
            { role: "Art Direction", name: "Your Name" },
            { role: "Music", name: "Your Name" },
            { role: "Special Thanks", name: "To all the players who uncovered the mysteries of Maplewood Lane" }
        ];
        
        credits.forEach(credit => {
            const creditItem = document.createElement('div');
            creditItem.className = 'credit-item';
            
            const role = document.createElement('h3');
            role.textContent = credit.role;
            
            const name = document.createElement('p');
            name.textContent = credit.name;
            
            creditItem.appendChild(role);
            creditItem.appendChild(name);
            creditsList.appendChild(creditItem);
        });
        
        const backButton = document.createElement('button');
        backButton.className = 'credits-back-btn';
        backButton.textContent = "Back";
        backButton.addEventListener('click', () => {
            creditsOverlay.remove();
        });
        
        creditsContent.appendChild(creditsHeader);
        creditsContent.appendChild(creditsList);
        creditsContent.appendChild(backButton);
        
        creditsOverlay.appendChild(creditsContent);
        parentOverlay.appendChild(creditsOverlay);
        
        // Animation for entrance
        setTimeout(() => {
            creditsOverlay.classList.add('visible');
        }, 100);
    }
    
    /**
     * Create UI for submitting final theory
     */
    createFinalTheorySubmission() {
        const overlay = document.createElement('div');
        overlay.className = 'theory-submission-overlay';
        
        const container = document.createElement('div');
        container.className = 'theory-submission-container';
        
        const header = document.createElement('h2');
        header.textContent = "Submit Your Final Theory";
        
        const description = document.createElement('p');
        description.textContent = "Before concluding your investigation, summarize what you believe happened to Iris Bell. Be specific about key events, individuals involved, and your assessment of the truth.";
        
        const textArea = document.createElement('textarea');
        textArea.className = 'theory-input';
        textArea.placeholder = "I believe Iris Bell...";
        
        // If player has notes, pre-populate
        if (document.getElementById("notesArea") && document.getElementById("notesArea").value) {
            textArea.value = document.getElementById("notesArea").value;
        }
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'theory-buttons';
        
        const submitButton = document.createElement('button');
        submitButton.textContent = "Submit Final Theory";
        submitButton.className = 'theory-submit-btn';
        submitButton.addEventListener('click', () => {
            this.game.finalTheory = textArea.value;
            overlay.remove();
            this.evaluateEnding();
            this.presentEnding();
        });
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = "Cancel";
        cancelButton.className = 'theory-cancel-btn';
        cancelButton.addEventListener('click', () => {
            overlay.remove();
        });
        
        buttonContainer.appendChild(submitButton);
        buttonContainer.appendChild(cancelButton);
        
        container.appendChild(header);
        container.appendChild(description);
        container.appendChild(textArea);
        container.appendChild(buttonContainer);
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // Animation
        setTimeout(() => {
            overlay.classList.add('visible');
        }, 100);
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EndingManager;
} 