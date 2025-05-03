/**
 * PuzzleManager.js - Core system for puzzle management in Maplewood Lane
 * 
 * Handles loading, activating, tracking, and resolving puzzles in the game.
 * Works with multiple puzzle types through a modular component system.
 */

class PuzzleManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.puzzles = {};              // All puzzles by ID
        this.activePuzzles = new Set(); // Currently active puzzles
        this.solvedPuzzles = new Set(); // Solved puzzles
        this.callbacks = {
            onPuzzleActivated: null,
            onPuzzleSolved: null
        };
    }

    /**
     * Initialize with puzzle data
     * @param {Object} puzzleData - Object containing all puzzle definitions
     */
    initialize(puzzleData) {
        this.puzzles = puzzleData;
        this.checkForActivatablePuzzles();
        console.log("PuzzleManager initialized with", Object.keys(this.puzzles).length, "puzzles");
    }

    /**
     * Register callbacks for puzzle events
     * @param {Object} callbacks - Object with callback functions
     */
    registerCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Check which puzzles can be activated based on current game state
     */
    checkForActivatablePuzzles() {
        Object.entries(this.puzzles).forEach(([puzzleId, puzzle]) => {
            // Skip already activated or solved puzzles
            if (this.activePuzzles.has(puzzleId) || this.solvedPuzzles.has(puzzleId)) {
                return;
            }

            // Check if puzzle meets activation conditions
            if (this.checkActivationConditions(puzzle.activationConditions)) {
                this.activatePuzzle(puzzleId, puzzle);
            }
        });
    }

    /**
     * Activate a puzzle and apply its activation effects
     * @param {string} puzzleId - ID of the puzzle to activate
     * @param {Object} puzzle - Puzzle object
     */
    activatePuzzle(puzzleId, puzzle) {
        this.activePuzzles.add(puzzleId);
        
        // Apply activation effects
        if (puzzle.activationEffects) {
            this.applyEffects(puzzle.activationEffects);
        }
        
        // Call the onPuzzleActivated callback if defined
        if (this.callbacks.onPuzzleActivated) {
            this.callbacks.onPuzzleActivated(puzzleId, puzzle);
        }

        console.log(`Puzzle activated: ${puzzleId}`);
    }

    /**
     * Check if a puzzle's activation conditions are met
     * @param {Object} conditions - Activation conditions to check
     * @returns {boolean} - Whether all conditions are met
     */
    checkActivationConditions(conditions) {
        if (!conditions) return true;

        // Check trust level requirement
        if (conditions.trustMin && this.game.trust < conditions.trustMin) {
            return false;
        }

        // Check time of day requirement
        if (conditions.timeOfDay && this.game.timeOfDay !== conditions.timeOfDay) {
            return false;
        }

        // Check required clues
        if (conditions.requiredClues) {
            const foundCluesArray = Array.from(this.game.foundClues || []);
            for (const clue of conditions.requiredClues) {
                if (!foundCluesArray.includes(clue)) {
                    return false;
                }
            }
        }

        // Check photo requirements
        if (conditions.requiredPhotoType) {
            if (!this.game.checkPhotoRequirement(conditions.requiredPhotoType)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if a puzzle's solution conditions are met
     * @param {string} puzzleId - ID of the puzzle to check
     * @param {Object} solutionData - Player's solution attempt
     * @returns {boolean} - Whether the solution is correct
     */
    checkSolution(puzzleId, solutionData) {
        if (!this.puzzles[puzzleId]) return false;
        
        const puzzle = this.puzzles[puzzleId];
        
        // Different puzzle types have different solution checking logic
        switch (puzzle.type) {
            case 'timeline':
                return this.checkTimelineSolution(puzzle, solutionData);
                
            case 'contradiction':
                return this.checkContradictionSolution(puzzle, solutionData);
                
            case 'photoAssembly':
                return this.checkPhotoAssemblySolution(puzzle, solutionData);
                
            default:
                console.warn(`Unknown puzzle type for ${puzzleId}: ${puzzle.type}`);
                return false;
        }
    }

    /**
     * Check timeline puzzle solution
     */
    checkTimelineSolution(puzzle, solution) {
        if (!solution.order || !puzzle.solution.order) return false;
        
        // Check if arrays match
        if (solution.order.length !== puzzle.solution.order.length) {
            return false;
        }
        
        for (let i = 0; i < solution.order.length; i++) {
            if (solution.order[i] !== puzzle.solution.order[i]) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Check contradiction puzzle solution
     */
    checkContradictionSolution(puzzle, solution) {
        return (
            solution.character === puzzle.solution.character &&
            solution.evidence === puzzle.solution.evidence
        );
    }

    /**
     * Check photo assembly puzzle solution
     */
    checkPhotoAssemblySolution(puzzle, solution) {
        if (!solution.requiredPhotos || !puzzle.solution.requiredPhotos) return false;
        
        // Check if all required photos are present (order doesn't matter)
        const requiredSet = new Set(puzzle.solution.requiredPhotos);
        const solutionSet = new Set(solution.requiredPhotos);
        
        if (requiredSet.size !== solutionSet.size) return false;
        
        for (const photo of requiredSet) {
            if (!solutionSet.has(photo)) return false;
        }
        
        return true;
    }

    /**
     * Submit a solution attempt for a puzzle
     * @param {string} puzzleId - ID of the puzzle
     * @param {Object} solutionData - Player's solution
     * @returns {boolean} - Whether the solution was correct
     */
    submitSolution(puzzleId, solutionData) {
        if (!this.activePuzzles.has(puzzleId)) {
            console.warn(`Attempt to solve inactive puzzle: ${puzzleId}`);
            return false;
        }
        
        const isCorrect = this.checkSolution(puzzleId, solutionData);
        
        if (isCorrect) {
            this.solvePuzzle(puzzleId);
        }
        
        return isCorrect;
    }

    /**
     * Mark a puzzle as solved and apply its effects
     * @param {string} puzzleId - ID of the puzzle to solve
     */
    solvePuzzle(puzzleId) {
        const puzzle = this.puzzles[puzzleId];
        
        // Move from active to solved
        this.activePuzzles.delete(puzzleId);
        this.solvedPuzzles.add(puzzleId);
        
        // Apply solution effects
        if (puzzle.solutionEffects) {
            this.applyEffects(puzzle.solutionEffects);
        }
        
        // Call the onPuzzleSolved callback if defined
        if (this.callbacks.onPuzzleSolved) {
            this.callbacks.onPuzzleSolved(puzzleId, puzzle);
        }
        
        console.log(`Puzzle solved: ${puzzleId}`);
        
        // Check if any new puzzles can now be activated
        this.checkForActivatablePuzzles();
    }

    /**
     * Apply effects from puzzle activation or solution
     * @param {Object} effects - Effects to apply
     */
    applyEffects(effects) {
        // Apply trust change
        if (effects.trust) {
            this.game.trust += effects.trust;
            this.game.trustElement.textContent = this.game.trust;
        }
        
        // Unlock new clue
        if (effects.unlockClue && !this.game.foundClues.has(effects.unlockClue)) {
            this.game.foundClues.add(effects.unlockClue);
            this.game.addClueToNotebook(effects.unlockClue);
            this.game.playSoundEffect('clue');
        }
        
        // Trigger dialogue
        if (effects.triggerDialogue) {
            const { character, dialogueId } = effects.triggerDialogue;
            this.game.dialogueManager.showDialogue(character, dialogueId);
        }
        
        // Show notification
        if (effects.notification) {
            this.game.showNotification(effects.notification);
        }
        
        // Unlock new area
        if (effects.unlockArea) {
            // Implement area unlocking logic here
        }
    }

    /**
     * Update all puzzles when game state changes
     * Called after photos are taken, time changes, etc.
     */
    updatePuzzles() {
        this.checkForActivatablePuzzles();
    }

    /**
     * Get all currently active puzzles
     * @returns {Array} Array of active puzzle objects
     */
    getAllActivePuzzles() {
        const activePuzzles = [];
        this.activePuzzles.forEach(puzzleId => {
            activePuzzles.push({
                id: puzzleId,
                ...this.puzzles[puzzleId]
            });
        });
        return activePuzzles;
    }

    /**
     * Export puzzle state for save games
     * @returns {Object} Serializable puzzle state
     */
    exportPuzzleState() {
        return {
            activePuzzles: Array.from(this.activePuzzles),
            solvedPuzzles: Array.from(this.solvedPuzzles)
        };
    }

    /**
     * Import puzzle state from save game
     * @param {Object} state - Saved puzzle state
     */
    importPuzzleState(state) {
        if (!state) return;
        
        this.activePuzzles = new Set(state.activePuzzles || []);
        this.solvedPuzzles = new Set(state.solvedPuzzles || []);
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PuzzleManager;
} 