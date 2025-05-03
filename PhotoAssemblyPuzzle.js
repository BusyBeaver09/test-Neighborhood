/**
 * PhotoAssemblyPuzzle.js
 * 
 * A component for photo assembly puzzles in Maplewood Lane
 * Allows players to combine multiple photos to reveal hidden details
 */

class PhotoAssemblyPuzzle {
    constructor(puzzleManager, puzzleId) {
        this.puzzleManager = puzzleManager;
        this.puzzle = puzzleManager.puzzles[puzzleId];
        this.puzzleId = puzzleId;
        
        if (!this.puzzle || this.puzzle.type !== 'photoAssembly') {
            console.error('Invalid puzzle or not a photo assembly puzzle');
            return;
        }
        
        this.container = null;
        this.selectedPhotos = [];
        
        // Bind methods
        this.render = this.render.bind(this);
        this.getAvailablePhotos = this.getAvailablePhotos.bind(this);
        this.togglePhotoSelection = this.togglePhotoSelection.bind(this);
        this.assemblePhotos = this.assemblePhotos.bind(this);
    }
    
    /**
     * Create and render the photo assembly puzzle UI
     */
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID ${containerId} not found`);
            return;
        }
        
        this.container = container;
        container.innerHTML = '';
        container.className = 'photo-assembly-puzzle';
        
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
        
        // Create photo selection area
        const photosContainer = document.createElement('div');
        photosContainer.className = 'photos-container';
        
        const photosHeader = document.createElement('h3');
        photosHeader.textContent = 'Select Photos to Assemble';
        photosContainer.appendChild(photosHeader);
        
        const photoGrid = document.createElement('div');
        photoGrid.className = 'photo-grid';
        
        // Get available photos that can be used for this puzzle
        const availablePhotos = this.getAvailablePhotos();
        
        if (availablePhotos.length === 0) {
            const noPhotos = document.createElement('p');
            noPhotos.className = 'no-photos';
            noPhotos.textContent = 'You don\'t have the necessary photos yet. Explore more areas and take photos from different angles.';
            photoGrid.appendChild(noPhotos);
        } else {
            availablePhotos.forEach(photo => {
                const photoItem = document.createElement('div');
                photoItem.className = 'photo-item';
                photoItem.setAttribute('data-photo-id', photo.id);
                
                // Add a pseudo-thumbnail
                const photoThumb = document.createElement('div');
                photoThumb.className = 'photo-thumbnail';
                
                // Set background class based on photo type
                photoThumb.classList.add(`photo-type-${photo.type.replace('_', '-')}`);
                
                photoItem.appendChild(photoThumb);
                
                const photoInfo = document.createElement('div');
                photoInfo.className = 'photo-info';
                
                const photoTitle = document.createElement('div');
                photoTitle.className = 'photo-title';
                photoTitle.textContent = photo.description || `Photo #${photo.id}`;
                photoInfo.appendChild(photoTitle);
                
                const photoMeta = document.createElement('div');
                photoMeta.className = 'photo-meta';
                photoMeta.textContent = `Taken at: ${photo.timeOfDay}`;
                photoInfo.appendChild(photoMeta);
                
                photoItem.appendChild(photoInfo);
                
                // Add selection functionality
                photoItem.addEventListener('click', () => {
                    this.togglePhotoSelection(photo);
                    photoItem.classList.toggle('selected');
                });
                
                photoGrid.appendChild(photoItem);
            });
        }
        
        photosContainer.appendChild(photoGrid);
        
        // Create assembly button
        const assembleButton = document.createElement('button');
        assembleButton.className = 'assemble-button';
        assembleButton.textContent = 'Assemble Photos';
        assembleButton.addEventListener('click', this.assemblePhotos);
        
        // Disable button if not enough photos
        if (availablePhotos.length < this.puzzle.requiredPhotoTypes.length) {
            assembleButton.disabled = true;
            assembleButton.classList.add('disabled');
        }
        
        photosContainer.appendChild(assembleButton);
        container.appendChild(photosContainer);
        
        // Create preview area (will show assembled result)
        const previewArea = document.createElement('div');
        previewArea.className = 'preview-area';
        previewArea.id = 'photoPreviewArea';
        container.appendChild(previewArea);
        
        // Add CSS styles
        this.addStyles();
    }
    
    /**
     * Get available photos that can be used for this puzzle
     */
    getAvailablePhotos() {
        if (!this.puzzleManager.game.photoDetails || this.puzzleManager.game.photoDetails.length === 0) {
            return [];
        }
        
        // Filter photos that match required types for this puzzle
        return this.puzzleManager.game.photoDetails.filter(photo => {
            // If photo has a direct type property, check against required types
            if (photo.type && this.puzzle.requiredPhotoTypes.includes(photo.type)) {
                return true;
            }
            
            // Otherwise try to infer type from other photo properties
            // This logic will depend on your specific photo implementation
            // For example, checking location, time of day, etc.
            
            return this.puzzle.requiredPhotoTypes.some(requiredType => {
                switch(requiredType) {
                    case "house_east":
                        return photo.angle === "east" && photo.subject === "house";
                    case "house_north":
                        return photo.angle === "north" && photo.subject === "house";
                    case "house_west":
                        return photo.angle === "west" && photo.subject === "house";
                    default:
                        // Check if the photo has a matching ID
                        return photo.id === requiredType;
                }
            });
        });
    }
    
    /**
     * Toggle photo selection
     */
    togglePhotoSelection(photo) {
        const index = this.selectedPhotos.findIndex(p => p.id === photo.id);
        
        if (index === -1) {
            // Add photo to selection
            this.selectedPhotos.push(photo);
        } else {
            // Remove photo from selection
            this.selectedPhotos.splice(index, 1);
        }
    }
    
    /**
     * Attempt to assemble the selected photos
     */
    assemblePhotos() {
        if (this.selectedPhotos.length === 0) {
            this.showFeedback(false, 'Please select at least one photo first.');
            return;
        }
        
        // Prepare attempt data
        const attemptData = {
            photos: this.selectedPhotos.map(photo => photo.id)
        };
        
        // Check if the solution is correct
        const isCorrect = this.puzzleManager.checkSolutionAttempt(this.puzzleId, attemptData);
        
        if (isCorrect) {
            // Show the assembled result
            this.showAssembledResult(true);
            
            // Solution was correct, PuzzleManager will handle the effects
            this.showFeedback(true, 'You\'ve successfully assembled the photos and revealed something hidden!');
        } else {
            // Show a basic failed assembly
            this.showAssembledResult(false);
            
            // Solution was incorrect
            this.showFeedback(false, 'These photos don\'t seem to reveal anything when put together. Try a different combination.');
        }
    }
    
    /**
     * Show the assembled result in the preview area
     */
    showAssembledResult(isCorrect) {
        const previewArea = document.getElementById('photoPreviewArea');
        if (!previewArea) return;
        
        previewArea.innerHTML = '';
        
        const resultContainer = document.createElement('div');
        resultContainer.className = 'assembled-result';
        
        if (isCorrect) {
            // Show the correct assembled result
            resultContainer.classList.add('correct-assembly');
            
            // Create a panoramic view of the photos
            const panorama = document.createElement('div');
            panorama.className = 'photo-panorama';
            
            // Add each photo to the panorama
            this.selectedPhotos.forEach(photo => {
                const photoElement = document.createElement('div');
                photoElement.className = 'panorama-segment';
                photoElement.classList.add(`photo-type-${photo.type.replace('_', '-')}`);
                panorama.appendChild(photoElement);
            });
            
            resultContainer.appendChild(panorama);
            
            // Add the revealed element (shadow figure, etc.)
            const revealedElement = document.createElement('div');
            revealedElement.className = 'revealed-element';
            
            // The revealed element type depends on the specific puzzle
            if (this.puzzle.revealedElement) {
                revealedElement.classList.add(`reveal-${this.puzzle.revealedElement}`);
            } else {
                revealedElement.classList.add('reveal-shadow-figure');
            }
            
            resultContainer.appendChild(revealedElement);
            
            // Add a description of what was revealed
            const revealDescription = document.createElement('p');
            revealDescription.className = 'reveal-description';
            revealDescription.textContent = this.puzzle.revealDescription || 
                'When viewed together, these photos reveal something that wasn\'t visible in any single image!';
            resultContainer.appendChild(revealDescription);
        } else {
            // Show a failed assembly
            resultContainer.classList.add('failed-assembly');
            
            // Create a messy arrangement of the photos
            const failedArrangement = document.createElement('div');
            failedArrangement.className = 'failed-arrangement';
            
            // Add each photo to the arrangement
            this.selectedPhotos.forEach(photo => {
                const photoElement = document.createElement('div');
                photoElement.className = 'failed-segment';
                photoElement.classList.add(`photo-type-${photo.type.replace('_', '-')}`);
                
                // Randomize position slightly
                const randomX = Math.floor(Math.random() * 20) - 10;
                const randomY = Math.floor(Math.random() * 20) - 10;
                const randomRotate = Math.floor(Math.random() * 10) - 5;
                
                photoElement.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
                
                failedArrangement.appendChild(photoElement);
            });
            
            resultContainer.appendChild(failedArrangement);
            
            // Add a message
            const failMessage = document.createElement('p');
            failMessage.className = 'fail-message';
            failMessage.textContent = 'These photos don\'t seem to fit together properly.';
            resultContainer.appendChild(failMessage);
        }
        
        previewArea.appendChild(resultContainer);
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
     * Add CSS styles for the photo assembly puzzle
     */
    addStyles() {
        // Check if styles already exist
        if (document.getElementById('photo-assembly-styles')) return;
        
        const styleEl = document.createElement('style');
        styleEl.id = 'photo-assembly-styles';
        styleEl.textContent = `
            .photo-assembly-puzzle {
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
            
            .photos-container {
                margin-bottom: 30px;
            }
            
            .photos-container h3 {
                color: #e6e6e6;
                margin-bottom: 15px;
            }
            
            .photo-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .photo-item {
                background-color: #0f3460;
                border-radius: 5px;
                padding: 10px;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .photo-item:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            
            .photo-item.selected {
                border: 2px solid #4cc9f0;
                box-shadow: 0 0 10px rgba(76, 201, 240, 0.5);
            }
            
            .photo-thumbnail {
                height: 100px;
                background-color: #1a1a2e;
                margin-bottom: 10px;
                border-radius: 3px;
                background-size: cover;
                background-position: center;
            }
            
            /* Photo type backgrounds */
            .photo-type-house-east {
                background-image: linear-gradient(to right, #2a3990, #0f3460);
            }
            
            .photo-type-house-north {
                background-image: linear-gradient(to bottom, #2a3990, #0f3460);
            }
            
            .photo-type-house-west {
                background-image: linear-gradient(to left, #2a3990, #0f3460);
            }
            
            .photo-info {
                padding: 5px;
            }
            
            .photo-title {
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .photo-meta {
                font-size: 0.8em;
                color: #aaa;
            }
            
            .no-photos {
                grid-column: 1 / -1;
                padding: 20px;
                text-align: center;
                background-color: #0f3460;
                border-radius: 5px;
                color: #aaa;
            }
            
            .assemble-button {
                background-color: #4cc9f0;
                color: #0f3460;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                margin: 0 auto;
                display: block;
                transition: background-color 0.2s;
            }
            
            .assemble-button:hover:not(.disabled) {
                background-color: #66d4ff;
            }
            
            .assemble-button.disabled {
                background-color: #666;
                cursor: not-allowed;
                opacity: 0.5;
            }
            
            .preview-area {
                min-height: 200px;
                background-color: #0f3460;
                border-radius: 5px;
                padding: 20px;
                margin-top: 20px;
            }
            
            .assembled-result {
                position: relative;
                width: 100%;
            }
            
            .photo-panorama {
                display: flex;
                height: 200px;
                border-radius: 5px;
                overflow: hidden;
            }
            
            .panorama-segment {
                flex: 1;
                background-size: cover;
                background-position: center;
                transition: transform 0.5s;
            }
            
            .panorama-segment:hover {
                transform: scale(1.05);
            }
            
            .revealed-element {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 60px;
                height: 150px;
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                z-index: 10;
                animation: fadeInSlow 3s ease-in-out;
                opacity: 0.7;
            }
            
            .reveal-shadow-figure {
                background-color: rgba(0, 0, 0, 0.7);
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                border-radius: 10px;
                /* For an actual figure, you'd use an image here */
            }
            
            .reveal-description {
                text-align: center;
                margin-top: 20px;
                color: #ffbd69;
                font-style: italic;
                animation: fadeIn 1s ease-in-out;
            }
            
            .failed-arrangement {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                height: 200px;
                position: relative;
            }
            
            .failed-segment {
                width: 100px;
                height: 100px;
                margin: 5px;
                background-size: cover;
                background-position: center;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
            }
            
            .fail-message {
                text-align: center;
                margin-top: 20px;
                color: #aaa;
                font-style: italic;
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
            
            @keyframes fadeInSlow {
                0% { opacity: 0; }
                50% { opacity: 0.3; }
                100% { opacity: 0.7; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        
        document.head.appendChild(styleEl);
    }
} 