/**
 * TimelinePuzzle.js
 * 
 * A component for timeline deduction puzzles in Maplewood Lane
 * Allows players to arrange events in chronological order
 */

class TimelinePuzzle {
    constructor(puzzleManager, puzzleId) {
        this.puzzleManager = puzzleManager;
        this.puzzle = puzzleManager.puzzles[puzzleId];
        this.puzzleId = puzzleId;
        
        if (!this.puzzle || this.puzzle.type !== 'timeline') {
            console.error('Invalid puzzle or not a timeline puzzle');
            return;
        }
        
        this.container = null;
        this.eventCards = [];
        this.currentOrder = [];
        
        // Bind methods
        this.render = this.render.bind(this);
        this.shuffleEvents = this.shuffleEvents.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.checkSolution = this.checkSolution.bind(this);
    }
    
    /**
     * Create and render the timeline puzzle UI
     */
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID ${containerId} not found`);
            return;
        }
        
        this.container = container;
        container.innerHTML = '';
        container.className = 'timeline-puzzle';
        
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
        
        // Create timeline container
        const timelineContainer = document.createElement('div');
        timelineContainer.className = 'timeline-container';
        container.appendChild(timelineContainer);
        
        // Create event cards in shuffled order
        this.eventCards = [];
        this.currentOrder = this.shuffleEvents([...this.puzzle.events]);
        
        this.currentOrder.forEach((event, index) => {
            const eventCard = document.createElement('div');
            eventCard.className = 'timeline-event';
            eventCard.setAttribute('draggable', 'true');
            eventCard.setAttribute('data-event-id', event.id);
            eventCard.setAttribute('data-position', index);
            
            const eventTime = document.createElement('div');
            eventTime.className = 'event-time';
            eventTime.textContent = event.time;
            eventCard.appendChild(eventTime);
            
            const eventText = document.createElement('div');
            eventText.className = 'event-text';
            eventText.textContent = event.text;
            eventCard.appendChild(eventText);
            
            // Set up drag and drop
            eventCard.addEventListener('dragstart', this.handleDragStart);
            eventCard.addEventListener('dragover', this.handleDragOver);
            eventCard.addEventListener('drop', this.handleDrop);
            
            timelineContainer.appendChild(eventCard);
            this.eventCards.push(eventCard);
        });
        
        // Add check solution button
        const checkButton = document.createElement('button');
        checkButton.className = 'check-solution-btn';
        checkButton.textContent = 'Check Timeline';
        checkButton.addEventListener('click', this.checkSolution);
        container.appendChild(checkButton);
        
        // Add shuffle button
        const shuffleButton = document.createElement('button');
        shuffleButton.className = 'shuffle-btn';
        shuffleButton.textContent = 'Shuffle Events';
        shuffleButton.addEventListener('click', () => {
            this.currentOrder = this.shuffleEvents([...this.puzzle.events]);
            this.render(containerId);
        });
        container.appendChild(shuffleButton);
        
        // Add CSS styles
        this.addStyles();
    }
    
    /**
     * Shuffle events in a random order
     */
    shuffleEvents(events) {
        for (let i = events.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [events[i], events[j]] = [events[j], events[i]];
        }
        return events;
    }
    
    /**
     * Handle drag start event
     */
    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.getAttribute('data-position'));
        e.target.classList.add('dragging');
    }
    
    /**
     * Handle drag over event
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    /**
     * Handle drop event
     */
    handleDrop(e) {
        e.preventDefault();
        
        const fromPosition = parseInt(e.dataTransfer.getData('text/plain'));
        const toPosition = parseInt(e.target.closest('.timeline-event').getAttribute('data-position'));
        
        if (fromPosition === toPosition) return;
        
        // Reorder events
        const movedEvent = this.currentOrder[fromPosition];
        this.currentOrder.splice(fromPosition, 1);
        this.currentOrder.splice(toPosition, 0, movedEvent);
        
        // Update UI
        this.eventCards.forEach(card => card.classList.remove('dragging'));
        
        // Re-render the cards in the new order
        const timelineContainer = document.querySelector('.timeline-container');
        timelineContainer.innerHTML = '';
        
        this.currentOrder.forEach((event, index) => {
            const eventCard = this.eventCards.find(card => 
                card.getAttribute('data-event-id') === event.id
            );
            
            eventCard.setAttribute('data-position', index);
            timelineContainer.appendChild(eventCard);
        });
    }
    
    /**
     * Check if the current timeline order matches the solution
     */
    checkSolution() {
        const attemptData = {
            order: this.currentOrder.map(event => event.id)
        };
        
        const isCorrect = this.puzzleManager.checkSolutionAttempt(this.puzzleId, attemptData);
        
        if (isCorrect) {
            // Solution was correct, PuzzleManager will handle the effects
            this.showFeedback(true, 'Correct! You solved the timeline puzzle.');
        } else {
            // Solution was incorrect
            this.showFeedback(false, 'That doesn\'t seem right. Try a different order.');
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
     * Add CSS styles for the timeline puzzle
     */
    addStyles() {
        // Check if styles already exist
        if (document.getElementById('timeline-puzzle-styles')) return;
        
        const styleEl = document.createElement('style');
        styleEl.id = 'timeline-puzzle-styles';
        styleEl.textContent = `
            .timeline-puzzle {
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
            
            .timeline-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 20px;
                min-height: 300px;
            }
            
            .timeline-event {
                background-color: #0f3460;
                padding: 15px;
                border-radius: 5px;
                cursor: grab;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: background-color 0.2s, transform 0.2s;
            }
            
            .timeline-event:hover {
                background-color: #1a1a2e;
            }
            
            .timeline-event.dragging {
                opacity: 0.5;
            }
            
            .event-time {
                background-color: #1a1a2e;
                padding: 5px 10px;
                border-radius: 3px;
                font-weight: bold;
                color: #4cc9f0;
                min-width: 100px;
                text-align: center;
            }
            
            .event-text {
                flex: 1;
                padding-left: 15px;
            }
            
            .check-solution-btn, .shuffle-btn {
                padding: 10px 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                margin: 0 10px;
            }
            
            .check-solution-btn {
                background-color: #4cc9f0;
                color: #0f3460;
            }
            
            .shuffle-btn {
                background-color: #0f3460;
                color: #e6e6e6;
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
