# Maplewood Lane: Puzzle System

A modular, data-driven puzzle system for the Maplewood Lane narrative exploration game. This system supports various puzzle types including timeline arrangement, contradiction finding, and photo assembly puzzles.

## 📋 System Overview

The puzzle system consists of several components:

1. **PuzzleManager.js**: Core class for managing puzzles, checking conditions, and verifying solutions
2. **puzzles.js**: Contains puzzle data definitions and the PuzzleRenderer class for UI
3. **puzzles.css**: Styles for all puzzle types
4. **Game integration**: Code in game.js to connect puzzles with game progress

## 🧩 Puzzle Types

### Timeline Puzzles
Players arrange events in the correct chronological order. Good for reconstructing sequences of plot events.

### Contradiction Puzzles
Players identify inconsistencies in character statements by presenting evidence that contradicts what was said. Good for interrogation scenarios.

### Photo Assembly Puzzles
Players select and arrange photos to reveal hidden patterns or elements. Good for uncovering visual clues.

## 📝 Adding New Puzzles

### 1. Define the puzzle data in puzzles.js

```javascript
"my_new_puzzle": {
    id: "my_new_puzzle",
    title: "The Mystery Title",
    description: "Description of what the player needs to do",
    type: "timeline", // or "contradiction", "photoAssembly"
    activationConditions: {
        trustMin: 30, // Minimum trust level required
        requiredClues: ["clue1", "clue2"], // Clues the player must have found
        requiredPhotoType: "specialPhoto" // For photo puzzles
    },
    components: {
        // Puzzle-specific components
    },
    solution: {
        // Correct solution data
    },
    activationEffects: {
        notification: "Puzzle available notification"
    },
    solutionEffects: {
        unlockClue: "new_clue_id",
        trust: 15, // Trust points to add
        notification: "Puzzle solved notification"
    }
}
```

### 2. Ensure you have required assets

For contradiction puzzles:
- Character portraits
- Evidence icons

For photo assembly puzzles:
- Photo images

## 🔄 Development and Testing

Use `puzzle-demo.html` to test individual puzzle types without needing to progress through the main game.

## 📚 Technical Details

### PuzzleManager Class

Key methods:
- `initialize(puzzleData)`: Load puzzle definitions
- `checkActivationConditions(conditions)`: Check if puzzle should be available
- `submitSolution(puzzleId, solutionData)`: Process player's solution attempt
- `exportPuzzleState()` / `importPuzzleState(state)`: For save/load system

### PuzzleRenderer Class

Each puzzle type has a dedicated renderer method:
- `renderTimelinePuzzle(puzzle)`
- `renderContradictionPuzzle(puzzle)`
- `renderPhotoAssemblyPuzzle(puzzle)`

### Game Integration

The puzzle system integrates with:
- The notebook UI (Puzzles tab)
- Clue discovery system
- Photo system
- Save/load system
- Trust mechanic

## 🔍 Checking for New Puzzles

The system automatically checks for new puzzles when:
- The player discovers a new clue
- The player takes a photo
- The time of day changes

## 🎮 Future Puzzle Types

You can extend the system with new puzzle types by:

1. Adding a new puzzle type in the puzzle data
2. Adding a new render method in PuzzleRenderer
3. Adding a new solution check method in PuzzleManager

Some potential future puzzle types:
- **Pattern Matching**: Players identify recurring symbols or patterns
- **Decryption**: Players decode encrypted messages
- **Sound Analysis**: Players identify audio clues
- **Map Reconstruction**: Players piece together a map from fragments

## 📱 Performance Considerations

- Puzzle UIs are created dynamically when needed
- Puzzle states are serialized in the save system
- Assets are loaded only when required 