/**
 * ContradictionPuzzle.js
 * 
 * A component for contradiction puzzles in Maplewood Lane
 * Allows players to confront NPCs with evidence that contradicts their statements
 */

class ContradictionPuzzle {
    constructor(puzzleManager, puzzleId) {
        this.puzzleManager = puzzleManager;
        this.puzzle = puzzleManager.puzzles[puzzleId];
        this.puzzleId = puzzleId;
        
        if (!this.puzzle || this.puzzle.type !== 'contradiction') {
            console.error('Invalid puzzle or not a contradiction puzzle');
            return;
        }
        
        this.container = null;
        this.evidenceList = [];
        
        // Bind methods
        this.render = this.render.bind(this);
        this.showEvidenceSelector = this.showEvidenceSelector.bind(this);
        this.presentEvidence = this.presentEvidence.bind(this);
    }
    
    /**
     * Create and render the contradiction puzzle UI
     */
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID ${containerId} not found`);
            return;
        }
        
        this.container = container;
        container.innerHTML = '';
        container.className = 'contradiction-puzzle';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'puzzle-header';
        
        const title = document.createElement('h2');
        title.textContent = this.puzzle.title;
        header.appendChild(title);
        
        const description = document.createElement('p');
        description.textContent = this.puzzle.description;
        header.appendChild(description);
        
        container.appendChild(header);
        
        // Create character info
        const characterInfo = document.createElement('div');
        characterInfo.className = 'character-info';
        
        const character = this.puzzleManager.game.dialogueData.characters[this.puzzle.characterId];
        if (character) {
            const characterName = document.createElement('h3');
            characterName.textContent = character.name;
            characterInfo.appendChild(characterName);
            
            const characterPortrait = document.createElement('div');
            characterPortrait.className = `character-portrait portrait-${this.puzzle.characterId.replace('_', '-')}`;
            characterInfo.appendChild(characterPortrait);
            
            const characterStatement = document.createElement('p');
            characterStatement.className = 'character-statement';
            characterStatement.textContent = this.puzzle.characterStatement || 
                "This character's story doesn't add up. Find evidence to confront them with.";
            characterInfo.appendChild(characterStatement);
        }
        
        container.appendChild(characterInfo);
        
        // Create action button
        const actionButton = document.createElement('button');
        actionButton.className = 'evidence-button';
        actionButton.textContent = 'Present Evidence';
        actionButton.addEventListener('click', this.showEvidenceSelector);
        container.appendChild(actionButton);
        
        // Add CSS styles
        this.addStyles();
    }
    
    /**
     * Show the evidence selector overlay
     */
    showEvidenceSelector() {
        // Remove any existing selector
        const existingSelector = document.querySelector('.evidence-selector');
        if (existingSelector) {
            existingSelector.remove();
        }
        
        // Create evidence selector
        const selector = document.createElement('div');
        selector.className = 'evidence-selector';
        
        const selectorTitle = document.createElement('h3');
        selectorTitle.textContent = 'Select Evidence to Present';
        selector.appendChild(selectorTitle);
        
        // Get available evidence (photos and clues)
        this.evidenceList = this.getAvailableEvidence();
        
        if (this.evidenceList.length === 0) {
            const noEvidence = document.createElement('p');
            noEvidence.textContent = 'You don\'t have any evidence to present yet.';
            selector.appendChild(noEvidence);
        } else {
            const evidenceGrid = document.createElement('div');
            evidenceGrid.className = 'evidence-grid';
            
            this.evidenceList.forEach(evidence => {
                const evidenceItem = document.createElement('div');
                evidenceItem.className = `evidence-item ${evidence.type}`;
                evidenceItem.setAttribute('data-id', evidence.id);
                
                const evidenceIcon = document.createElement('div');
                evidenceIcon.className = 'evidence-icon';
                
                if (evidence.type === 'photo') {
                    evidenceIcon.textContent = '📷';
                } else if (evidence.type === 'clue') {
                    evidenceIcon.textContent = '🔍';
                }
                
                evidenceItem.appendChild(evidenceIcon);
                
                const evidenceName = document.createElement('div');
                evidenceName.className = 'evidence-name';
                evidenceName.textContent = evidence.name;
                evidenceItem.appendChild(evidenceName);
                
                evidenceItem.addEventListener('click', () => {
                    this.presentEvidence(evidence);
                    selector.remove();
                });
                
                evidenceGrid.appendChild(evidenceItem);
            });
            
            selector.appendChild(evidenceGrid);
        }
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-selector-btn';
        closeBtn.textContent = 'Cancel';
        closeBtn.addEventListener('click', () => {
            selector.remove();
        });
        
        selector.appendChild(closeBtn);
        
        // Add to page
        document.body.appendChild(selector);
    }
    
    /**
     * Get available evidence to present
     */
    getAvailableEvidence() {
        const evidence = [];
        const { photoDetails, foundClues } = this.puzzleManager.game;
        
        // Add photos as evidence
        if (photoDetails && photoDetails.length > 0) {
            photoDetails.forEach(photo => {
                evidence.push({
                    id: photo.id,
                    type: 'photo',
                    name: `Photo #${photo.id}: ${photo.description || photo.timeOfDay}`,
                    data: photo
                });
            });
        }
        
        // Add clues as evidence
        if (foundClues && foundClues.size > 0) {
            Array.from(foundClues).forEach(clue => {
                evidence.push({
                    id: clue,
                    type: 'clue',
                    name: clue,
                    data: clue
                });
            });
        }
        
        return evidence;
    }
    
    /**
     * Present evidence to the character
     */
    presentEvidence(evidence) {
        const attemptData = {
            character: this.puzzle.characterId,
            evidence: evidence.id
        };
        
        const isCorrect = this.puzzleManager.checkSolutionAttempt(this.puzzleId, attemptData);
        
        if (isCorrect) {
            // Solution was correct, PuzzleManager will handle the effects
            this.showFeedback(true, 'You caught them in a contradiction! They have to tell the truth now.');
            
            // The dialogue trigger will be handled by PuzzleManager via solutionEffects
        } else {
            // Solution was incorrect
            this.showFeedback(false, 'That evidence doesn\'t seem to affect them. Try something else.');
        }
    }
    
    /**
     * Show feedback to the player after a solution attempt
     */
    showFeedback(isCorrect, message) {
        // Remove any existing feedback
        const existingFeedback = document.querySelector('.puzzle-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = `puzzle-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.textContent = message;
        
        this.container.appendChild(feedback);
        
        // Remove after delay if incorrect
        if (!isCorrect) {
            setTimeout(() => {
                feedback.classList.add('fade-out');
                setTimeout(() => feedback.remove(), 1000);
            }, 3000);
        }
    }
    
    /**
     * Add CSS styles for the contradiction puzzle
     */
    addStyles() {
        // Check if styles already exist
        if (document.getElementById('contradiction-puzzle-styles')) return;
        
        const styleEl = document.createElement('style');
        styleEl.id = 'contradiction-puzzle-styles';
        styleEl.textContent = `
            .contradiction-puzzle {
                background-color: #16213e;
                border-radius: 8px;
                padding: 20px;
                font-family: Arial, sans-serif;
                color: #e6e6e6;
                max-width: 800px;
                margin: 0 auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
            
            .puzzle-header {
                text-align: center;
                margin-bottom: 20px;
            }
            
            .puzzle-header h2 {
                color: #4cc9f0;
                margin-bottom: 10px;
            }
            
            .character-info {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-bottom: 30px;
            }
            
            .character-portrait {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background-color: #0f3460;
                margin: 15px 0;
                background-size: cover;
                background-position: center;
                border: 3px solid #4cc9f0;
                box-shadow: 0 0 10px rgba(76, 201, 240, 0.5);
            }
            
            .character-statement {
                background-color: #0f3460;
                padding: 15px;
                border-radius: 5px;
                margin: 10px 0;
                font-style: italic;
                text-align: center;
                max-width: 80%;
            }
            
            .evidence-button {
                background-color: #e63946;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                margin: 0 auto;
                display: block;
                transition: background-color 0.2s;
            }
            
            .evidence-button:hover {
                background-color: #ff4d6d;
            }
            
            .evidence-selector {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
                box-sizing: border-box;
            }
            
            .evidence-selector h3 {
                color: #4cc9f0;
                margin-bottom: 20px;
            }
            
            .evidence-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
                max-width: 800px;
                max-height: 60vh;
                overflow-y: auto;
                padding: 10px;
                background-color: #16213e;
                border-radius: 8px;
            }
            
            .evidence-item {
                background-color: #0f3460;
                padding: 15px;
                border-radius: 5px;
                cursor: pointer;
                text-align: center;
                transition: background-color 0.2s, transform 0.2s;
            }
            
            .evidence-item:hover {
                background-color: #1a1a2e;
                transform: scale(1.05);
            }
            
            .evidence-icon {
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .evidence-item.photo .evidence-icon {
                color: #4cc9f0;
            }
            
            .evidence-item.clue .evidence-icon {
                color: #ffbd69;
            }
            
            .close-selector-btn {
                margin-top: 20px;
                padding: 10px 15px;
                background-color: #0f3460;
                color: #e6e6e6;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            
            .puzzle-feedback {
                margin-top: 20px;
                padding: 15px;
                border-radius: 5px;
                text-align: center;
                animation: fadeIn 0.3s ease;
            }
            
            .puzzle-feedback.correct {
                background-color: rgba(124, 241, 168, 0.2);
                color: #7bf1a8;
            }
            
            .puzzle-feedback.incorrect {
                background-color: rgba(255, 77, 109, 0.2);
                color: #ff4d6d;
            }
            
            .fade-out {
                animation: fadeOut 1s ease forwards;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        
        document.head.appendChild(styleEl);
    }
} 