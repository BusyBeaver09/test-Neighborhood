/**
 * PhotoSystemIntegration.js - Integration between enhanced photo system and game
 * Bridges between the existing photo functionality and the new advanced features
 */

class PhotoSystemIntegration {
    constructor(game) {
        this.game = game;
        this.photoManager = null;
        this.photoUI = null;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize photo system integration
     */
    init() {
        // Create photo manager and UI
        this.photoManager = new PhotoManager(this.game);
        this.photoUI = new PhotoUI(this.photoManager, this.game);
        
        // Override original photo functions
        this.overrideGameMethods();
        
        // Add photo system UI components
        this.addPhotoSystemUI();
        
        console.log('Advanced Photo System initialized');
    }
    
    /**
     * Override relevant game methods to use the enhanced photo system
     */
    overrideGameMethods() {
        // Store original methods
        const originalTakePhoto = this.game.takePhoto;
        const originalAnalyzePhoto = this.game.analyzePhoto;
        const originalExaminePhoto = this.game.examinePhoto;
        
        // Override takePhoto method
        this.game.takePhoto = () => {
            // Call original method to generate the photoContext
            originalTakePhoto.call(this.game);
            
            // Get the photo context from the last photo taken
            const photoIndex = this.game.photoDetails.length - 1;
            if (photoIndex < 0) return;
            
            const photoContext = this.game.photoDetails[photoIndex];
            
            // Create enhanced photo using our system
            const photo = this.photoManager.takePhoto(photoContext);
            
            // Update UI
            this.photoUI.renderPhotos();
            
            // Show notification
            this.game.showNotification(`Photo taken (Score: ${photo.insightScore})`);
            
            // Check if this was an exceptionally good photo (high insight score)
            if (photo.insightScore >= 90) {
                // Reward player with a trust bonus
                this.game.updateTrust(3);
                this.game.showNotification('Excellent composition! (+3 Trust)');
            } else if (photo.insightScore >= 70) {
                // Smaller trust bonus for good photos
                this.game.updateTrust(1);
                this.game.showNotification('Good composition! (+1 Trust)');
            }
            
            // Handle evidence found in the photo
            if (photo.evidence && photo.developed) {
                this.processPhotoEvidence(photo);
            }
        };
        
        // Override analyzePhoto method to use our enhanced system
        this.game.analyzePhoto = (index) => {
            // Look up the original photo in the game's photoDetails
            if (index >= 0 && index < this.game.photoDetails.length) {
                const originalPhotoContext = this.game.photoDetails[index];
                
                // Try to find the enhanced photo with this context
                const enhancedPhoto = this.photoManager.photos.find(p => 
                    p.context && p.context.id === originalPhotoContext.id
                );
                
                if (enhancedPhoto) {
                    // Use our enhanced UI to analyze
                    this.photoUI.analyzePhotoDetails(enhancedPhoto);
                } else {
                    // Fall back to original method
                    originalAnalyzePhoto.call(this.game, index);
                }
            }
        };
        
        // Override examinePhoto method to use our enhanced system
        this.game.examinePhoto = (index) => {
            // Look up the original photo in the game's photoDetails
            if (index >= 0 && index < this.game.photoDetails.length) {
                const originalPhotoContext = this.game.photoDetails[index];
                
                // Try to find the enhanced photo with this context
                const enhancedPhoto = this.photoManager.photos.find(p => 
                    p.context && p.context.id === originalPhotoContext.id
                );
                
                if (enhancedPhoto) {
                    // Use our enhanced UI to examine
                    this.photoUI.openPhotoFullview(enhancedPhoto);
                } else {
                    // Fall back to original method
                    originalExaminePhoto.call(this.game, index);
                }
            }
        };
        
        // Override photo requirement check to work with enhanced photos
        const originalCheckPhotoRequirement = this.game.checkPhotoRequirement;
        this.game.checkPhotoRequirement = (photoType) => {
            // Check if we have this photo type in our enhanced system
            const enhancedPhotos = this.photoManager.photos.filter(p => 
                p.developed && (p.type === photoType || (Array.isArray(photoType) && photoType.includes(p.type)))
            );
            
            if (enhancedPhotos.length > 0) {
                return true;
            }
            
            // Fall back to original check
            return originalCheckPhotoRequirement.call(this.game, photoType);
        };
    }
    
    /**
     * Add photo system UI components to the game
     */
    addPhotoSystemUI() {
        // Add darkroom button to notebook tab controls
        const notebookTabs = document.querySelector('.notebook-tabs');
        if (notebookTabs) {
            const darkroomButton = document.createElement('button');
            darkroomButton.className = 'tab';
            darkroomButton.textContent = 'Darkroom';
            darkroomButton.addEventListener('click', () => {
                this.photoUI.openDarkroom();
            });
            
            notebookTabs.appendChild(darkroomButton);
        }
        
        // Add a button to filter photos
        const photosTab = document.querySelector('.tab[data-tab="photos"]');
        if (photosTab) {
            const filterButton = document.createElement('button');
            filterButton.className = 'filter-photos-btn';
            filterButton.textContent = 'Filter';
            filterButton.style.marginLeft = '5px';
            filterButton.style.fontSize = '10px';
            filterButton.style.padding = '2px 5px';
            
            // Toggle filters visibility
            filterButton.addEventListener('click', () => {
                const filters = document.getElementById('photoFilters');
                if (filters) {
                    filters.style.display = filters.style.display === 'none' ? 'flex' : 'none';
                }
            });
            
            photosTab.appendChild(filterButton);
        }
    }
    
    /**
     * Process evidence found in a photo
     */
    processPhotoEvidence(photo) {
        if (!photo.evidence) return;
        
        // Add notification
        this.game.showNotification('Evidence found in photo!');
        
        // Process different types of evidence
        switch (photo.evidence.type) {
            case 'clue':
                // Add to clues notebook
                if (!this.game.foundClues.has(photo.evidence.description)) {
                    this.game.foundClues.add(photo.evidence.description);
                    this.game.addClueToNotebook(photo.evidence.description);
                    
                    // Play sound
                    this.game.playSoundEffect('clue');
                }
                break;
                
            case 'contradiction':
                // Store contradiction evidence for dialogue
                if (!this.game.contradictionEvidence) {
                    this.game.contradictionEvidence = [];
                }
                
                this.game.contradictionEvidence.push({
                    id: photo.evidence.id,
                    description: photo.evidence.description,
                    photoId: photo.id
                });
                
                break;
                
            case 'hidden':
                // Add to clues with a special tag
                const hiddenClue = `Hidden detail revealed: ${photo.evidence.description}`;
                if (!this.game.foundClues.has(hiddenClue)) {
                    this.game.foundClues.add(hiddenClue);
                    this.game.addClueToNotebook(hiddenClue);
                    
                    // Add supernatural tag
                    if (this.game.autoTagClue) {
                        this.game.autoTagClue(hiddenClue, ['supernatural']);
                    }
                    
                    // Play spooky sound
                    this.game.playSoundEffect('spooky');
                }
                break;
        }
        
        // Check if this evidence unlocks any puzzles
        if (this.game.puzzleManager) {
            this.game.puzzleManager.updatePuzzles();
        }
    }
    
    /**
     * Import photos from game's existing photoDetails
     */
    importExistingPhotos() {
        if (!this.game.photoDetails || this.game.photoDetails.length === 0) return;
        
        this.game.photoDetails.forEach((photoContext, index) => {
            // Check if we already have this photo
            const existing = this.photoManager.photos.find(p => 
                p.context && p.context.id === photoContext.id
            );
            
            if (!existing) {
                // Create enhanced photo from the context
                this.photoManager.takePhoto(photoContext);
            }
        });
        
        // Update UI
        this.photoUI.renderPhotos();
    }
    
    /**
     * Set up contradiction system in dialogues
     */
    setupContradictionSystem() {
        // This would extend the dialogue system to allow presenting photo evidence
        // Would tie into the game's DialogueManager
        
        // Check if we already have the game's dialogue system
        if (!this.game.dialogueManager) return;
        
        // Example integration point - adding a method to present photo evidence
        this.game.presentPhotoEvidence = (characterId, photoId) => {
            // Get the photo
            const photo = this.photoManager.getPhotoById(photoId);
            if (!photo || !photo.evidence) return false;
            
            // Check if this evidence contradicts something said by this character
            const contradicts = this.checkContradiction(characterId, photo.evidence);
            
            if (contradicts) {
                // Trigger special dialogue node for contradiction
                this.game.showDialog(characterId, `contradiction_${photo.evidence.id}`);
                
                // Increase trust for successful contradiction
                this.game.updateTrust(5);
                this.game.showNotification('Contradiction exposed! (+5 Trust)');
                
                return true;
            } else {
                // Character dismisses the evidence
                this.game.showDialog(characterId, 'dismiss_evidence');
                return false;
            }
        };
    }
    
    /**
     * Check if evidence contradicts a character's statement
     */
    checkContradiction(characterId, evidence) {
        // Example contradiction checks
        if (evidence.type !== 'contradiction') return false;
        
        // Well meeting contradiction applies to Jake & Lila
        if (evidence.id === 'well_meeting_evidence' && characterId === 'jake_lila') {
            return true;
        }
        
        // More contradiction types can be added here
        
        return false;
    }
    
    /**
     * Load saved photo data
     */
    loadSavedData(savedData) {
        if (!savedData || !savedData.photoSystem) return;
        
        try {
            this.photoManager.deserializePhotoData(savedData.photoSystem);
            this.photoUI.renderPhotos();
        } catch (error) {
            console.error('Error loading photo system data:', error);
        }
    }
    
    /**
     * Save photo data
     */
    getSaveData() {
        return {
            photoSystem: this.photoManager.serializePhotoData()
        };
    }
}

// Wait for page load, then initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize after the game is created
    setTimeout(() => {
        // Check if the game instance exists
        if (window.game) {
            // Create the photo system
            window.photoSystem = new PhotoSystemIntegration(window.game);
            
            // Import existing photos if any
            window.photoSystem.importExistingPhotos();
            
            // Set up contradiction system
            window.photoSystem.setupContradictionSystem();
        }
    }, 1000); // Delay to ensure game is initialized
}); 