/**
 * puzzles.js - Puzzle definitions and implementations
 * 
 * Contains all puzzle data and UI implementations for the various
 * puzzle types in Maplewood Lane.
 */

// Define puzzle data structure
const puzzleData = {
    // Timeline Puzzle: Reconstruct the sequence of events on the night of the storm
    "timeline_storm_night": {
        id: "timeline_storm_night",
        title: "The Night of the Storm",
        description: "Reconstruct the sequence of events from the night of the great storm three months ago.",
        type: "timeline",
        activationConditions: {
            trustMin: 25,
            requiredClues: ["storm_newspaper", "finch_storm_account", "arnold_power_outage"]
        },
        components: {
            events: [
                {
                    id: "event_storm_warning",
                    time: "6:00 PM",
                    text: "Emergency storm warning issued for Maplewood area"
                },
                {
                    id: "event_power_outage",
                    time: "8:30 PM",
                    text: "Power outage reported across neighborhood"
                },
                {
                    id: "event_tree_falls",
                    time: "9:15 PM",
                    text: "Large oak tree falls near the park entrance"
                },
                {
                    id: "event_strange_lights",
                    time: "11:45 PM",
                    text: "Mrs. Finch observes strange lights near the woods"
                },
                {
                    id: "event_morning_after",
                    time: "7:00 AM",
                    text: "First residents emerge to assess storm damage"
                }
            ]
        },
        solution: {
            order: [
                "event_storm_warning", 
                "event_power_outage", 
                "event_tree_falls", 
                "event_strange_lights", 
                "event_morning_after"
            ]
        },
        activationEffects: {
            notification: "You've collected enough witness accounts to reconstruct the timeline of the storm night."
        },
        solutionEffects: {
            unlockClue: "lights_during_outage",
            trust: 10,
            notification: "The timeline reveals something strange - lights were seen when power was out everywhere."
        }
    },
    
    // Contradiction Puzzle: Find the inconsistency in a witness statement
    "contradiction_arnold_alibi": {
        id: "contradiction_arnold_alibi",
        title: "Mr. Arnold's Alibi",
        description: "Find the contradiction in Mr. Arnold's account of where he was the night Iris was last seen.",
        type: "contradiction",
        activationConditions: {
            trustMin: 30,
            requiredClues: ["arnold_statement", "store_receipt", "finch_sighting"]
        },
        components: {
            character: {
                id: "mr_arnold",
                name: "Mr. Arnold",
                portrait: "assets/characters/mr_arnold_portrait.png",
                statement: "I was at the hardware store all afternoon until it closed at 6 PM, then went straight home and didn't leave again that night. I didn't see anyone unusual in the neighborhood."
            },
            availableEvidence: [
                {
                    id: "store_receipt",
                    type: "clue",
                    icon: "📝",
                    name: "Hardware Store Receipt",
                    description: "Receipt shows Mr. Arnold purchased items at 4:30 PM."
                },
                {
                    id: "finch_sighting",
                    type: "clue",
                    icon: "👁️",
                    name: "Mrs. Finch's Statement",
                    description: "Mrs. Finch saw Mr. Arnold walking near the park at 7:15 PM."
                },
                {
                    id: "park_photo",
                    type: "photo",
                    icon: "📸",
                    name: "Park Bench Photo",
                    description: "Photo of empty park bench taken at sunset."
                }
            ]
        },
        solution: {
            character: "mr_arnold",
            evidence: "finch_sighting"
        },
        activationEffects: {
            notification: "Mr. Arnold's statement about the night Iris disappeared seems off somehow."
        },
        solutionEffects: {
            unlockClue: "arnold_park_visit",
            trust: 15,
            notification: "Mr. Arnold lied about not leaving his house that night. Why would he hide that?"
        }
    },
    
    // Photo Assembly Puzzle: Combine photos to reveal hidden clue
    "photo_assembly_flickering_lights": {
        id: "photo_assembly_flickering_lights",
        title: "The Flickering Lights Mystery",
        description: "Arrange the photos of flickering lights to reveal a pattern.",
        type: "photoAssembly",
        activationConditions: {
            trustMin: 40,
            requiredPhotoType: "flickerPhoto",
            requiredClues: ["finch_flickering_lights", "strange_pattern"]
        },
        components: {
            requiredPhotoCount: 3,
            description: "Arrange photos of the flickering lights to reveal what's causing them."
        },
        solution: {
            requiredPhotos: ["flickerPhoto_finch_window", "flickerPhoto_jake_backyard", "flickerPhoto_arnold_basement"]
        },
        activationEffects: {
            notification: "The flickering lights witnessed around the neighborhood might be connected."
        },
        solutionEffects: {
            unlockClue: "light_signal_pattern",
            trust: 20,
            notification: "The lights form a pattern - someone is using them to send signals!"
        }
    }
};

// PuzzleRenderer - Handles rendering different puzzle types
class PuzzleRenderer {
    constructor(puzzleManager, game) {
        this.puzzleManager = puzzleManager;
        this.game = game;
        this.puzzleContainer = null;
        this.currentPuzzle = null;
    }
    
    /**
     * Initialize the puzzle UI
     */
    initialize() {
        this.puzzleContainer = document.createElement('div');
        this.puzzleContainer.className = 'puzzle-container';
        this.puzzleContainer.style.display = 'none';
        document.body.appendChild(this.puzzleContainer);
        
        // Close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-puzzle-btn';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => this.closePuzzle());
        this.puzzleContainer.appendChild(closeButton);
    }
    
    /**
     * Show a puzzle
     * @param {string} puzzleId - ID of the puzzle to show
     */
    showPuzzle(puzzleId) {
        const puzzle = this.puzzleManager.puzzles[puzzleId];
        if (!puzzle) return;
        
        this.currentPuzzle = puzzle;
        this.puzzleContainer.style.display = 'block';
        this.puzzleContainer.innerHTML = '';
        
        // Render the appropriate puzzle type
        switch (puzzle.type) {
            case 'timeline':
                this.renderTimelinePuzzle(puzzle);
                break;
            case 'contradiction':
                this.renderContradictionPuzzle(puzzle);
                break;
            case 'photoAssembly':
                this.renderPhotoAssemblyPuzzle(puzzle);
                break;
            default:
                console.warn(`Unknown puzzle type: ${puzzle.type}`);
                this.puzzleContainer.innerHTML = `<div class="puzzle-error">Unknown puzzle type: ${puzzle.type}</div>`;
        }
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-puzzle-btn';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => this.closePuzzle());
        this.puzzleContainer.appendChild(closeButton);
    }
    
    /**
     * Close the current puzzle
     */
    closePuzzle() {
        this.puzzleContainer.style.display = 'none';
        this.currentPuzzle = null;
    }
    
    /**
     * Render a Timeline puzzle
     * @param {Object} puzzle - Timeline puzzle object
     */
    renderTimelinePuzzle(puzzle) {
        const timelinePuzzle = document.createElement('div');
        timelinePuzzle.className = 'timeline-puzzle';
        
        // Header
        const header = document.createElement('div');
        header.className = 'puzzle-header';
        header.innerHTML = `
            <h2>${puzzle.title}</h2>
            <p>${puzzle.description}</p>
        `;
        timelinePuzzle.appendChild(header);
        
        // Timeline container for event cards
        const timelineContainer = document.createElement('div');
        timelineContainer.className = 'timeline-container';
        timelinePuzzle.appendChild(timelineContainer);
        
        // Create draggable event cards in random order
        const events = [...puzzle.components.events];
        this.shuffleArray(events);
        
        events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'timeline-event';
            eventElement.dataset.eventId = event.id;
            eventElement.draggable = true;
            eventElement.innerHTML = `
                <div class="event-time">${event.time}</div>
                <div class="event-text">${event.text}</div>
            `;
            
            // Drag and drop functionality
            eventElement.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', event.id);
                eventElement.classList.add('dragging');
            });
            
            eventElement.addEventListener('dragend', () => {
                eventElement.classList.remove('dragging');
            });
            
            timelineContainer.appendChild(eventElement);
        });
        
        // Add dragover event to container for reordering
        timelineContainer.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(timelineContainer, e.clientY);
            const dragging = document.querySelector('.dragging');
            if (afterElement) {
                timelineContainer.insertBefore(dragging, afterElement);
            } else {
                timelineContainer.appendChild(dragging);
            }
        });
        
        // Check solution button
        const checkButton = document.createElement('button');
        checkButton.className = 'check-solution-btn';
        checkButton.textContent = 'Check Timeline Order';
        checkButton.addEventListener('click', () => {
            const currentOrder = Array.from(timelineContainer.children).map(el => el.dataset.eventId);
            const isCorrect = this.puzzleManager.submitSolution(puzzle.id, { order: currentOrder });
            this.showFeedback(isCorrect, timelinePuzzle);
        });
        
        // Shuffle button
        const shuffleButton = document.createElement('button');
        shuffleButton.className = 'shuffle-btn';
        shuffleButton.textContent = 'Shuffle Events';
        shuffleButton.addEventListener('click', () => {
            this.shuffleTimelineEvents(timelineContainer);
        });
        
        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.appendChild(shuffleButton);
        buttonContainer.appendChild(checkButton);
        timelinePuzzle.appendChild(buttonContainer);
        
        // Feedback area
        const feedbackArea = document.createElement('div');
        feedbackArea.className = 'puzzle-feedback';
        feedbackArea.style.display = 'none';
        timelinePuzzle.appendChild(feedbackArea);
        
        this.puzzleContainer.appendChild(timelinePuzzle);
    }
    
    /**
     * Get the element that a dragged item should be placed after
     */
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.timeline-event:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    /**
     * Shuffle the timeline events
     */
    shuffleTimelineEvents(container) {
        const events = Array.from(container.children);
        this.shuffleArray(events);
        
        // Clear container
        container.innerHTML = '';
        
        // Add elements back in shuffled order
        events.forEach(event => {
            container.appendChild(event);
        });
    }
    
    /**
     * Render a Contradiction puzzle
     * @param {Object} puzzle - Contradiction puzzle object
     */
    renderContradictionPuzzle(puzzle) {
        const contradictionPuzzle = document.createElement('div');
        contradictionPuzzle.className = 'contradiction-puzzle';
        
        // Header
        const header = document.createElement('div');
        header.className = 'puzzle-header';
        header.innerHTML = `
            <h2>${puzzle.title}</h2>
            <p>${puzzle.description}</p>
        `;
        contradictionPuzzle.appendChild(header);
        
        // Character info and statement
        const character = puzzle.components.character;
        const characterInfo = document.createElement('div');
        characterInfo.className = 'character-info';
        characterInfo.innerHTML = `
            <h3>${character.name}</h3>
            <div class="character-portrait" style="background-image: url('${character.portrait}')"></div>
            <div class="character-statement">"${character.statement}"</div>
        `;
        contradictionPuzzle.appendChild(characterInfo);
        
        // Evidence button
        const evidenceButton = document.createElement('button');
        evidenceButton.className = 'evidence-button';
        evidenceButton.textContent = 'Present Evidence';
        evidenceButton.addEventListener('click', () => {
            this.showEvidenceSelector(puzzle, contradictionPuzzle);
        });
        contradictionPuzzle.appendChild(evidenceButton);
        
        // Feedback area
        const feedbackArea = document.createElement('div');
        feedbackArea.className = 'puzzle-feedback';
        feedbackArea.style.display = 'none';
        contradictionPuzzle.appendChild(feedbackArea);
        
        this.puzzleContainer.appendChild(contradictionPuzzle);
    }
    
    /**
     * Show the evidence selector for contradiction puzzles
     */
    showEvidenceSelector(puzzle, puzzleElement) {
        const evidenceSelector = document.createElement('div');
        evidenceSelector.className = 'evidence-selector';
        
        evidenceSelector.innerHTML = `<h3>Select evidence that contradicts the statement:</h3>`;
        
        // Evidence grid
        const evidenceGrid = document.createElement('div');
        evidenceGrid.className = 'evidence-grid';
        
        puzzle.components.availableEvidence.forEach(evidence => {
            const evidenceItem = document.createElement('div');
            evidenceItem.className = `evidence-item ${evidence.type}`;
            evidenceItem.dataset.evidenceId = evidence.id;
            evidenceItem.innerHTML = `
                <div class="evidence-icon">${evidence.icon}</div>
                <div class="evidence-name">${evidence.name}</div>
                <div class="evidence-description">${evidence.description}</div>
            `;
            
            evidenceItem.addEventListener('click', () => {
                const isCorrect = this.puzzleManager.submitSolution(puzzle.id, {
                    character: puzzle.components.character.id,
                    evidence: evidence.id
                });
                
                evidenceSelector.remove();
                this.showFeedback(isCorrect, puzzleElement);
            });
            
            evidenceGrid.appendChild(evidenceItem);
        });
        
        evidenceSelector.appendChild(evidenceGrid);
        
        // Close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-selector-btn';
        closeButton.textContent = 'Cancel';
        closeButton.addEventListener('click', () => {
            evidenceSelector.remove();
        });
        evidenceSelector.appendChild(closeButton);
        
        document.body.appendChild(evidenceSelector);
    }
    
    /**
     * Render a Photo Assembly puzzle
     * @param {Object} puzzle - Photo Assembly puzzle object
     */
    renderPhotoAssemblyPuzzle(puzzle) {
        const photoAssemblyPuzzle = document.createElement('div');
        photoAssemblyPuzzle.className = 'photo-assembly-puzzle';
        
        // Header
        const header = document.createElement('div');
        header.className = 'puzzle-header';
        header.innerHTML = `
            <h2>${puzzle.title}</h2>
            <p>${puzzle.description}</p>
        `;
        photoAssemblyPuzzle.appendChild(header);
        
        // Photos container
        const photosContainer = document.createElement('div');
        photosContainer.className = 'photos-container';
        photosContainer.innerHTML = `<h3>Available Photos</h3>`;
        
        // Photo grid
        const photoGrid = document.createElement('div');
        photoGrid.className = 'photo-grid';
        
        // Get all photos of the required type
        const availablePhotos = this.game.getPhotosByType(puzzle.activationConditions.requiredPhotoType) || [];
        
        if (availablePhotos.length === 0) {
            photoGrid.innerHTML = `
                <div class="no-photos">
                    You don't have any relevant photos yet. Keep exploring and taking pictures.
                </div>
            `;
        } else {
            availablePhotos.forEach(photo => {
                const photoItem = document.createElement('div');
                photoItem.className = 'photo-item';
                photoItem.dataset.photoId = photo.id;
                
                // Toggle selection when clicked
                photoItem.addEventListener('click', () => {
                    photoItem.classList.toggle('selected');
                    this.updateAssembleButton(puzzle, availablePhotos, assembleButton);
                });
                
                photoItem.innerHTML = `
                    <div class="photo-thumbnail photo-type-${photo.type}" style="background-image: url('${photo.thumbnail || 'assets/photos/default_thumbnail.png'}')"></div>
                    <div class="photo-info">
                        <div class="photo-title">${photo.name || 'Unnamed Photo'}</div>
                        <div class="photo-meta">Taken at ${photo.location || 'Unknown Location'}</div>
                    </div>
                `;
                
                photoGrid.appendChild(photoItem);
            });
        }
        
        photosContainer.appendChild(photoGrid);
        photoAssemblyPuzzle.appendChild(photosContainer);
        
        // Preview area
        const previewArea = document.createElement('div');
        previewArea.className = 'preview-area';
        previewArea.innerHTML = `<p>Select photos to assemble and reveal what's hidden within them.</p>`;
        photoAssemblyPuzzle.appendChild(previewArea);
        
        // Assemble button
        const assembleButton = document.createElement('button');
        assembleButton.className = 'assemble-button disabled';
        assembleButton.textContent = `Assemble Photos (0/${puzzle.components.requiredPhotoCount})`;
        assembleButton.disabled = true;
        
        assembleButton.addEventListener('click', () => {
            if (assembleButton.classList.contains('disabled')) return;
            
            const selectedPhotoIds = Array.from(
                document.querySelectorAll('.photo-item.selected')
            ).map(item => item.dataset.photoId);
            
            const isCorrect = this.puzzleManager.submitSolution(puzzle.id, {
                requiredPhotos: selectedPhotoIds
            });
            
            if (isCorrect) {
                this.renderAssembledResult(previewArea, availablePhotos, selectedPhotoIds);
            } else {
                this.renderFailedAssembly(previewArea, availablePhotos, selectedPhotoIds);
            }
            
            this.showFeedback(isCorrect, photoAssemblyPuzzle);
        });
        
        photoAssemblyPuzzle.appendChild(assembleButton);
        
        // Feedback area
        const feedbackArea = document.createElement('div');
        feedbackArea.className = 'puzzle-feedback';
        feedbackArea.style.display = 'none';
        photoAssemblyPuzzle.appendChild(feedbackArea);
        
        this.puzzleContainer.appendChild(photoAssemblyPuzzle);
    }
    
    /**
     * Update the assemble button state based on photo selection
     */
    updateAssembleButton(puzzle, photos, button) {
        const selectedCount = document.querySelectorAll('.photo-item.selected').length;
        button.textContent = `Assemble Photos (${selectedCount}/${puzzle.components.requiredPhotoCount})`;
        
        if (selectedCount === puzzle.components.requiredPhotoCount) {
            button.classList.remove('disabled');
            button.disabled = false;
        } else {
            button.classList.add('disabled');
            button.disabled = true;
        }
    }
    
    /**
     * Render successful photo assembly result
     */
    renderAssembledResult(container, allPhotos, selectedPhotoIds) {
        container.innerHTML = '';
        
        const assembledResult = document.createElement('div');
        assembledResult.className = 'assembled-result';
        
        // Create panorama view
        const panorama = document.createElement('div');
        panorama.className = 'photo-panorama';
        
        // Add selected photos to panorama
        selectedPhotoIds.forEach(photoId => {
            const photo = allPhotos.find(p => p.id === photoId);
            if (!photo) return;
            
            const segment = document.createElement('div');
            segment.className = 'panorama-segment';
            segment.style.backgroundImage = `url('${photo.url || 'assets/photos/default.png'}')`;
            panorama.appendChild(segment);
        });
        
        assembledResult.appendChild(panorama);
        
        // Add revealed element (what the assembled photos reveal)
        const revealedElement = document.createElement('div');
        revealedElement.className = 'revealed-element reveal-shadow-figure';
        assembledResult.appendChild(revealedElement);
        
        // Add description
        const description = document.createElement('div');
        description.className = 'reveal-description';
        description.textContent = "The photos reveal a strange figure signaling with the lights...";
        assembledResult.appendChild(description);
        
        container.appendChild(assembledResult);
    }
    
    /**
     * Render failed photo assembly attempt
     */
    renderFailedAssembly(container, allPhotos, selectedPhotoIds) {
        container.innerHTML = '';
        
        const failedArrangement = document.createElement('div');
        failedArrangement.className = 'failed-arrangement';
        
        // Add selected photos in scattered arrangement
        selectedPhotoIds.forEach(photoId => {
            const photo = allPhotos.find(p => p.id === photoId);
            if (!photo) return;
            
            const segment = document.createElement('div');
            segment.className = 'failed-segment';
            segment.style.backgroundImage = `url('${photo.url || 'assets/photos/default.png'}')`;
            segment.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
            failedArrangement.appendChild(segment);
        });
        
        container.appendChild(failedArrangement);
        
        // Add fail message
        const failMessage = document.createElement('div');
        failMessage.className = 'fail-message';
        failMessage.textContent = "These photos don't seem to reveal anything when combined. Try different ones.";
        container.appendChild(failMessage);
    }
    
    /**
     * Show feedback for puzzle solution attempt
     * @param {boolean} isCorrect - Whether the solution was correct
     * @param {HTMLElement} puzzleElement - The puzzle's DOM element
     */
    showFeedback(isCorrect, puzzleElement) {
        const feedbackArea = puzzleElement.querySelector('.puzzle-feedback');
        
        if (isCorrect) {
            feedbackArea.className = 'puzzle-feedback correct';
            feedbackArea.textContent = 'Correct! You solved the puzzle.';
            
            // Auto-close puzzle after delay if solved
            setTimeout(() => {
                this.closePuzzle();
            }, 3000);
        } else {
            feedbackArea.className = 'puzzle-feedback incorrect';
            feedbackArea.textContent = 'That\'s not quite right. Try again.';
            
            // Hide feedback after delay
            setTimeout(() => {
                feedbackArea.classList.add('fade-out');
                setTimeout(() => {
                    feedbackArea.style.display = 'none';
                    feedbackArea.classList.remove('fade-out');
                }, 1000);
            }, 2000);
        }
        
        feedbackArea.style.display = 'block';
    }
    
    /**
     * Fisher-Yates shuffle algorithm
     * @param {Array} array - Array to shuffle
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// Export modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        puzzleData, 
        PuzzleRenderer 
    };
} 