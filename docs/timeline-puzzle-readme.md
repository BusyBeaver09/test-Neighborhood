# Timeline Puzzle UI for Maplewood Lane

A drag-and-drop timeline puzzle interface that integrates with the Maplewood Lane puzzle system.

## 📋 Overview

This package contains a working prototype for the Timeline Puzzle UI, which allows players to:

1. View a set of timeline events/clues
2. Drag and drop them into the correct chronological order
3. Submit their solution for validation
4. Receive feedback and rewards

The implementation integrates with the existing `PuzzleManager` and `PuzzleRenderer` classes, providing a seamless experience within the main game.

## 🚀 Getting Started

### Quick Demo

To see the Timeline Puzzle UI in action:

1. Open `timeline-puzzle-ui.html` in your browser for a standalone demo
2. Open `timeline-integrated.html` for a demo that integrates with the game's puzzle system

### Files Included

- `timeline-puzzle-ui.html` - Standalone prototype
- `timeline-integrated.html` - Integration with PuzzleManager
- `timeline-puzzle.js` - Enhanced timeline features
- `timeline-puzzle-readme.md` - This documentation

## 🔧 Integration Guide

To integrate the Timeline Puzzle UI into your main game:

### 1. Include Required Files

```html
<link rel="stylesheet" href="puzzles.css">
<script src="PuzzleManager.js"></script>
<script src="puzzles.js"></script>
<script src="timeline-puzzle.js"></script>
```

### 2. Initialize the Enhancer

After initializing your `PuzzleManager` and `PuzzleRenderer`:

```javascript
// Initialize the puzzle system
const puzzleManager = new PuzzleManager(gameInstance);
puzzleManager.initialize(puzzleData);

// Initialize renderer
const puzzleRenderer = new PuzzleRenderer(puzzleManager, gameInstance);
puzzleRenderer.initialize();

// Initialize the TimelinePuzzleEnhancer for improved timeline UI
const timelineEnhancer = new TimelinePuzzleEnhancer(puzzleRenderer, puzzleManager);
```

### 3. Show a Timeline Puzzle

To display a timeline puzzle:

```javascript
// Show the puzzle with the puzzle ID
puzzleRenderer.showPuzzle("timeline_storm_night");

// Ensure it's activated (if not already)
if (!puzzleManager.activePuzzles.has("timeline_storm_night")) {
    puzzleManager.activatePuzzle("timeline_storm_night", puzzleData["timeline_storm_night"]);
}
```

## ✨ Features

### Core Features

- **Drag and Drop Interface**: Intuitive drag and drop for arranging timeline events
- **Visual Feedback**: Clear visual cues for drag operations and solution validation
- **Responsive Design**: Works on various screen sizes

### Enhanced Features (via TimelinePuzzleEnhancer)

- **Visual Timeline Connectors**: Vertical line and arrows connecting events
- **Event Tooltips**: Hovering on events shows additional information
- **Order Hints**: Optional hints showing the correct numbered position
- **Enhanced Feedback**: Animated success/failure indicators
- **Reward Animations**: Visual celebration when unlocking new clues

## 🎮 Player Experience

1. Player opens the puzzle and sees a set of draggable timeline events
2. Events can be dragged into the correct timeline order
3. Player submits their solution using the "Check Timeline" button
4. Feedback is shown (correct/incorrect)
5. Upon correct solution, rewards are displayed and unlocked

## 🔍 Customization

### Adding New Timeline Puzzles

To add a new timeline puzzle, define it in `puzzles.js` following this format:

```javascript
"timeline_new_puzzle": {
    id: "timeline_new_puzzle",
    title: "Your Puzzle Title",
    description: "Description of what the player needs to do.",
    type: "timeline",
    activationConditions: {
        // conditions for the puzzle to appear
    },
    components: {
        events: [
            {
                id: "event_one",
                time: "10:00 AM",
                text: "Description of first event"
            },
            {
                id: "event_two",
                time: "11:30 AM",
                text: "Description of second event"
            },
            // Add more events as needed
        ]
    },
    solution: {
        order: ["event_one", "event_two"]
    },
    activationEffects: {
        notification: "Puzzle available notification"
    },
    solutionEffects: {
        unlockClue: "new_clue_id",
        trust: 10,
        notification: "Puzzle solved notification"
    }
}
```

### Styling Customization

You can customize the appearance by modifying the styles in `puzzles.css` or adding custom styles for specific puzzles.

## 🧩 Advanced Usage

### Custom Reward Animations

You can customize the reward animation by modifying the `showRewardAnimation` function:

```javascript
function showRewardAnimation(clueId) {
    // Custom animation code here
}
```

### Timeline Puzzle Data Structure

Timeline puzzles are defined with these key components:

- **id**: Unique identifier
- **title/description**: Displayed to the player
- **components.events**: Array of events to arrange
- **solution.order**: Correct sequence of event IDs

## 📝 Notes

- The timeline puzzle is designed to work with the existing `PuzzleManager` and `PuzzleRenderer` classes
- The enhancer pattern allows for non-invasive improvements to the baseline implementation
- Both standalone and integrated versions are provided for easy testing 