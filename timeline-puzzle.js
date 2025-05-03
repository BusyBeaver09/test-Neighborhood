/**
 * timeline-puzzle.js - Enhanced timeline puzzle component for Maplewood Lane
 * 
 * Provides extended functionality for timeline puzzles in the game,
 * building on the base PuzzleManager and PuzzleRenderer classes.
 */

class TimelinePuzzleEnhancer {
    /**
     * Create a timeline puzzle enhancer
     * @param {PuzzleRenderer} renderer - The game's puzzle renderer instance
     * @param {PuzzleManager} manager - The game's puzzle manager instance
     */
    constructor(renderer, manager) {
        this.renderer = renderer;
        this.manager = manager;
        this.originalRenderMethod = renderer.renderTimelinePuzzle;
        
        // Apply the enhancements
        this.enhanceRenderer();
    }
    
    /**
     * Enhance the puzzle renderer with improved timeline functionality
     */
    enhanceRenderer() {
        const self = this;
        
        // Replace the timeline puzzle renderer method
        this.renderer.renderTimelinePuzzle = function(puzzle) {
            // Call the original implementation first
            self.originalRenderMethod.call(this, puzzle);
            
            // Apply enhancements to the rendered puzzle
            self.enhanceTimelineUI(puzzle, this.puzzleContainer);
        };
    }
    
    /**
     * Enhance the timeline UI with additional features
     * @param {Object} puzzle - The puzzle object
     * @param {HTMLElement} container - The puzzle container element
     */
    enhanceTimelineUI(puzzle, container) {
        // Add timeline indicators and connecting lines
        this.addTimelineIndicators(container);
        
        // Add timeline animation effects
        this.addDragEffects(container);
        
        // Add hover information for events
        this.addEventTooltips(container, puzzle);
        
        // Add visual feedback for correct order hint
        this.addVisualOrderHints(container, puzzle);
        
        // Improve feedback display
        this.enhanceFeedbackArea(container);
    }
    
    /**
     * Add visual timeline indicators between events
     * @param {HTMLElement} container - The puzzle container element
     */
    addTimelineIndicators(container) {
        const timelineContainer = container.querySelector('.timeline-container');
        if (!timelineContainer) return;
        
        // Add timeline line connector
        const timelineConnector = document.createElement('div');
        timelineConnector.className = 'timeline-connector';
        timelineContainer.appendChild(timelineConnector);
        
        // Add arrow indicators between events
        const events = timelineContainer.querySelectorAll('.timeline-event');
        for (let i = 0; i < events.length - 1; i++) {
            const arrowIndicator = document.createElement('div');
            arrowIndicator.className = 'timeline-arrow';
            arrowIndicator.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="#4cc9f0" d="M7,10L12,15L17,10H7Z"></path></svg>';
            timelineContainer.insertBefore(arrowIndicator, events[i+1]);
        }
        
        // Add styles for the timeline indicators
        const style = document.createElement('style');
        style.textContent = `
            .timeline-connector {
                position: absolute;
                left: 50%;
                top: 0;
                bottom: 0;
                width: 2px;
                background-color: rgba(76, 201, 240, 0.3);
                transform: translateX(-50%);
                z-index: 0;
            }
            
            .timeline-arrow {
                display: flex;
                justify-content: center;
                margin: 5px 0;
                opacity: 0.7;
                transition: opacity 0.3s;
            }
            
            .timeline-container {
                position: relative;
            }
            
            .timeline-event {
                position: relative;
                z-index: 1;
            }
        `;
        container.appendChild(style);
    }
    
    /**
     * Add enhanced drag effects for timeline events
     * @param {HTMLElement} container - The puzzle container element
     */
    addDragEffects(container) {
        const events = container.querySelectorAll('.timeline-event');
        
        events.forEach(event => {
            // Enhanced drag start effect
            event.addEventListener('dragstart', function() {
                this.style.boxShadow = '0 0 10px rgba(76, 201, 240, 0.7)';
                this.style.opacity = '0.8';
                
                // Add visual feedback on other events
                events.forEach(otherEvent => {
                    if (otherEvent !== this) {
                        otherEvent.classList.add('potential-drop');
                    }
                });
            });
            
            // Reset effects after drag ends
            event.addEventListener('dragend', function() {
                this.style.boxShadow = '';
                this.style.opacity = '';
                
                // Remove visual feedback
                events.forEach(otherEvent => {
                    otherEvent.classList.remove('potential-drop');
                });
            });
        });
        
        // Add styles for the drag effects
        const style = document.createElement('style');
        style.textContent = `
            .timeline-event.potential-drop {
                border: 1px dashed rgba(76, 201, 240, 0.5);
            }
            
            .timeline-event.over {
                border: 2px solid #4cc9f0;
                transform: scale(1.02);
            }
            
            .timeline-event.dragging {
                cursor: grabbing;
            }
        `;
        container.appendChild(style);
    }
    
    /**
     * Add informational tooltips to timeline events
     * @param {HTMLElement} container - The puzzle container element
     * @param {Object} puzzle - The puzzle object
     */
    addEventTooltips(container, puzzle) {
        const events = container.querySelectorAll('.timeline-event');
        
        events.forEach(event => {
            const eventId = event.dataset.eventId;
            
            // Find the event data in the puzzle
            const eventData = puzzle.components.events.find(e => e.id === eventId);
            if (!eventData) return;
            
            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'event-tooltip';
            tooltip.innerHTML = `
                <div class="tooltip-content">
                    <div class="tooltip-time">${eventData.time}</div>
                    <div class="tooltip-details">
                        ${eventData.text}
                        <div class="tooltip-hint">This event ${this.getPositionHint(eventId, puzzle)}</div>
                    </div>
                </div>
            `;
            
            // Show/hide tooltip on hover
            event.addEventListener('mouseenter', () => {
                tooltip.style.display = 'block';
                setTimeout(() => tooltip.classList.add('visible'), 10);
            });
            
            event.addEventListener('mouseleave', () => {
                tooltip.classList.remove('visible');
                setTimeout(() => tooltip.style.display = 'none', 200);
            });
            
            event.appendChild(tooltip);
        });
        
        // Add styles for tooltips
        const style = document.createElement('style');
        style.textContent = `
            .event-tooltip {
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background-color: #1a1a2e;
                border: 1px solid #4cc9f0;
                border-radius: 5px;
                padding: 10px;
                width: 250px;
                display: none;
                opacity: 0;
                transition: opacity 0.2s;
                z-index: 100;
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
                pointer-events: none;
            }
            
            .event-tooltip.visible {
                opacity: 1;
            }
            
            .tooltip-content {
                color: #e6e6e6;
                font-size: 0.9em;
            }
            
            .tooltip-time {
                color: #4cc9f0;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .tooltip-hint {
                margin-top: 8px;
                font-style: italic;
                font-size: 0.8em;
                color: #bdc3c7;
            }
            
            .timeline-event {
                position: relative;
            }
        `;
        container.appendChild(style);
    }
    
    /**
     * Get a hint about the position of an event in the timeline
     * @param {string} eventId - The event ID to check
     * @param {Object} puzzle - The puzzle object
     * @returns {string} A hint about the event's position
     */
    getPositionHint(eventId, puzzle) {
        const correctOrder = puzzle.solution.order;
        const position = correctOrder.indexOf(eventId);
        
        if (position === 0) {
            return "happens first in the sequence";
        } else if (position === correctOrder.length - 1) {
            return "happens last in the sequence";
        } else {
            const prevEvent = puzzle.components.events.find(e => e.id === correctOrder[position - 1]);
            return `happens after "${prevEvent.text.substring(0, 30)}..."`;
        }
    }
    
    /**
     * Add visual hints for correct event order
     * @param {HTMLElement} container - The puzzle container element
     * @param {Object} puzzle - The puzzle object
     */
    addVisualOrderHints(container, puzzle) {
        const timelineContainer = container.querySelector('.timeline-container');
        if (!timelineContainer) return;
        
        // Add a helper button for hints
        const hintButton = document.createElement('button');
        hintButton.className = 'hint-button';
        hintButton.textContent = 'Show Hint';
        
        let hintsShown = false;
        
        hintButton.addEventListener('click', () => {
            if (hintsShown) {
                // Hide the hints
                container.querySelectorAll('.order-hint').forEach(hint => {
                    hint.style.opacity = '0';
                    setTimeout(() => hint.remove(), 300);
                });
                hintButton.textContent = 'Show Hint';
                hintsShown = false;
            } else {
                // Show the hints
                this.showOrderHints(container, puzzle);
                hintButton.textContent = 'Hide Hint';
                hintsShown = true;
            }
        });
        
        // Add hint button to the UI
        const buttonContainer = container.querySelector('.button-container');
        if (buttonContainer) {
            buttonContainer.insertBefore(hintButton, buttonContainer.firstChild);
        } else {
            // Create button container if it doesn't exist
            const newButtonContainer = document.createElement('div');
            newButtonContainer.className = 'button-container';
            newButtonContainer.appendChild(hintButton);
            timelineContainer.after(newButtonContainer);
        }
        
        // Add styles for hint elements
        const style = document.createElement('style');
        style.textContent = `
            .hint-button {
                background-color: #7b2cbf;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9em;
                transition: background-color 0.2s;
            }
            
            .hint-button:hover {
                background-color: #9d4edd;
            }
            
            .order-hint {
                position: absolute;
                top: 50%;
                right: -50px;
                transform: translateY(-50%);
                background-color: rgba(155, 89, 182, 0.2);
                color: #9b59b6;
                padding: 5px 10px;
                border-radius: 3px;
                font-size: 0.8em;
                opacity: 0;
                transition: opacity 0.3s;
            }
        `;
        container.appendChild(style);
    }
    
    /**
     * Show order hints on the timeline events
     * @param {HTMLElement} container - The puzzle container element
     * @param {Object} puzzle - The puzzle object
     */
    showOrderHints(container, puzzle) {
        const events = container.querySelectorAll('.timeline-event');
        const correctOrder = puzzle.solution.order;
        
        events.forEach(event => {
            const eventId = event.dataset.eventId;
            const correctIndex = correctOrder.indexOf(eventId);
            
            // Create hint element
            const hint = document.createElement('div');
            hint.className = 'order-hint';
            hint.textContent = `#${correctIndex + 1}`;
            
            // Position and fade in the hint
            event.style.position = 'relative';
            event.appendChild(hint);
            
            // Fade in
            setTimeout(() => {
                hint.style.opacity = '1';
            }, 10);
        });
    }
    
    /**
     * Enhance the feedback area with more details
     * @param {HTMLElement} container - The puzzle container element
     */
    enhanceFeedbackArea(container) {
        const feedbackArea = container.querySelector('.puzzle-feedback');
        if (!feedbackArea) return;
        
        // Create an enhanced feedback element
        const enhancedFeedback = document.createElement('div');
        enhancedFeedback.className = 'enhanced-feedback';
        
        // Replace the feedback area with enhanced version when showing feedback
        const originalFeedbackDisplay = Object.getOwnPropertyDescriptor(
            feedbackArea.style, 'display'
        );
        
        // Override the display property
        Object.defineProperty(feedbackArea.style, 'display', {
            set: function(value) {
                if (value === 'block') {
                    // Add enhanced feedback content
                    enhancedFeedback.innerHTML = `
                        <div class="feedback-icon">
                            ${feedbackArea.classList.contains('correct') ? 
                                '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#7bf1a8" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path></svg>' : 
                                '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#ff4d6d" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path></svg>'
                            }
                        </div>
                        <div class="feedback-message">${feedbackArea.textContent}</div>
                    `;
                    
                    // Add the enhanced feedback
                    if (!feedbackArea.contains(enhancedFeedback)) {
                        feedbackArea.innerHTML = '';
                        feedbackArea.appendChild(enhancedFeedback);
                    }
                }
                
                // Call the original setter
                originalFeedbackDisplay.set.call(this, value);
            },
            get: function() {
                return originalFeedbackDisplay.get.call(this);
            }
        });
        
        // Add styles for enhanced feedback
        const style = document.createElement('style');
        style.textContent = `
            .enhanced-feedback {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px;
            }
            
            .feedback-icon {
                margin-right: 15px;
                animation: pulse 1.5s infinite;
            }
            
            .feedback-message {
                font-size: 1.2em;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        container.appendChild(style);
    }
}

// Export the enhancer class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimelinePuzzleEnhancer;
} 