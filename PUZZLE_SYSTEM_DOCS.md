# Maplewood Lane: Puzzle System Documentation

This document explains how to use the puzzle system in Maplewood Lane. The system allows for creating various types of puzzles that can be integrated with the existing dialogue, photography, and clue systems.

## Table of Contents

- [Overview](#overview)
- [Puzzle Types](#puzzle-types)
- [Puzzle Data Structure](#puzzle-data-structure)
- [Activation Conditions](#activation-conditions)
- [Effects](#effects)
- [PuzzleManager API](#puzzlemanager-api)
- [Puzzle Components](#puzzle-components)
- [Integration](#integration)
- [Examples](#examples)

## Overview

The puzzle system is built on top of a flexible JSON structure that defines different types of puzzles, their activation conditions, and effects when solved. The system is designed to work closely with other game systems like dialogue, photography, and clue collection.

Key features:
- Multiple puzzle types (timeline, contradiction, photo assembly, environmental)
- Dynamic puzzle activation based on game state
- Integration with trust, time of day, and clue systems
- Visual components for different puzzle types
- Feedback and effects when puzzles are solved

## Puzzle Types

### Timeline Deduction

Timeline puzzles challenge players to arrange events in the correct chronological order. This helps players understand the sequence of events in the story.

### Contradiction

Contradiction puzzles involve identifying inconsistencies in character statements and presenting evidence to confront them. This enhances the investigation aspect of the game.

### Photo Assembly

Photo assembly puzzles require players to collect multiple photos that, when viewed together, reveal hidden details not visible in any single photo.

### Environmental

Environmental puzzles involve interpreting clues in the environment, such as patterns, symbols, or arranged items that reveal codes or passwords.

## Puzzle Data Structure

Puzzles are defined using a JSON structure:

```json
{
  "puzzle_id": {
    "type": "timeline|contradiction|photoAssembly|environmental",
    "title": "Puzzle Title",
    "description": "Puzzle description text",
    "activationConditions": { ... },
    "activationEffects": { ... },
    "solution": { ... },
    "solutionEffects": { ... }
  }
}
```

Each puzzle type has additional specific properties:

### Timeline Puzzle

```json
{
  "events": [
    {
      "id": "event1",
      "text": "Event description",
      "time": "7:00 PM"
    },
    ...
  ],
  "solution": {
    "order": ["event1", "event2", "event3"]
  }
}
```

### Contradiction Puzzle

```json
{
  "characterId": "character_id",
  "characterStatement": "The false statement by the character",
  "requiredEvidence": "evidence_id",
  "solution": {
    "character": "character_id",
    "evidence": "evidence_id"
  }
}
```

### Photo Assembly Puzzle

```json
{
  "requiredPhotoTypes": ["photo_type1", "photo_type2", "photo_type3"],
  "revealedElement": "shadow-figure",
  "revealDescription": "Description of what is revealed",
  "solution": {
    "requiredPhotos": ["photo1_id", "photo2_id", "photo3_id"]
  }
}
```

### Environmental Puzzle

```json
{
  "hint": "Optional hint for solving the puzzle",
  "solution": {
    "type": "code",
    "code": "SECRET"
  }
}
```

## Activation Conditions

Conditions determine when a puzzle becomes available to the player:

| Condition | Description | Example |
|-----------|-------------|---------|
| `trustMin` | Minimum trust level required | `"trustMin": 20` |
| `trustMax` | Maximum trust level allowed | `"trustMax": 50` |
| `timeOfDay` | Required time of day | `"timeOfDay": "night"` |
| `requiredClues` | Array of clues that must be found | `"requiredClues": ["Clue 1", "Clue 2"]` |
| `requiresPhotoType` | Photo type that must be taken | `"requiresPhotoType": "wellPhoto"` |
| `dialogueVariables` | Game variables that must match | `"dialogueVariables": {"metCharacter": true}` |
| `solvedPuzzles` | Puzzles that must already be solved | `"solvedPuzzles": ["puzzle_id"]` |

## Effects

Effects are changes to the game state that occur when a puzzle is activated or solved:

| Effect | Description | Example |
|--------|-------------|---------|
| `trust` | Change in trust level | `"trust": 10` |
| `unlockClue` | Add a clue to the notebook | `"unlockClue": "New insight about Iris"` |
| `addItem` | Add an item to inventory | `"addItem": "old_key"` |
| `triggerDialogue` | Start dialogue with an NPC | `"triggerDialogue": {"character": "npc_id", "dialogueId": "dialog_id"}` |
| `setDialogueVariable` | Set a dialogue variable | `"setDialogueVariable": {"varName": true}` |
| `notification` | Show notification to player | `"notification": "You've discovered something!"` |

## PuzzleManager API

The `PuzzleManager` class provides these main methods:

| Method | Description |
|--------|-------------|
| `initialize(puzzleData)` | Set up the manager with puzzle data |
| `loadPuzzles(puzzleData)` | Load puzzle definitions |
| `updatePuzzles()` | Check and update puzzle states based on game state |
| `activatePuzzle(puzzleId)` | Activate a specific puzzle |
| `solvePuzzle(puzzleId)` | Mark a puzzle as solved and apply effects |
| `checkSolutionAttempt(puzzleId, attemptData)` | Check if a solution attempt is correct |
| `getActivePuzzlesByType(type)` | Get active puzzles of a specific type |
| `getAllActivePuzzles()` | Get all currently active puzzles |
| `exportPuzzleState()` | Export puzzle state for saving |
| `importPuzzleState(state)` | Import previously saved puzzle state |

## Puzzle Components

The system includes specialized components for each puzzle type:

### TimelinePuzzle

Provides an interface for arranging events in chronological order with drag-and-drop functionality.

```javascript
const timelinePuzzle = new TimelinePuzzle(puzzleManager, "timeline_puzzle_id");
timelinePuzzle.render("containerElementId");
```

### ContradictionPuzzle

Allows players to present evidence to characters to uncover contradictions in their statements.

```javascript
const contradictionPuzzle = new ContradictionPuzzle(puzzleManager, "contradiction_puzzle_id");
contradictionPuzzle.render("containerElementId");
```

### PhotoAssemblyPuzzle

Enables players to select and arrange photos to reveal hidden details.

```javascript
const photoAssemblyPuzzle = new PhotoAssemblyPuzzle(puzzleManager, "photoAssembly_puzzle_id");
photoAssemblyPuzzle.render("containerElementId");
```

## Integration

### With DialogueManager

Puzzles can trigger dialogue when solved using the `triggerDialogue` effect. They can also depend on dialogue variables through activation conditions.

```javascript
// In puzzle data
"solutionEffects": {
  "triggerDialogue": {
    "character": "npc_id",
    "dialogueId": "special_dialogue_id"
  }
}
```

### With Photography System

Photo assembly puzzles directly integrate with the photography system, requiring players to take specific photos.

```javascript
// In puzzle data
"requiredPhotoTypes": ["house_east", "house_north", "house_west"]
```

### With Notebook/Clue System

Puzzles can both require clues to be activated and grant new clues when solved.

```javascript
// In puzzle data
"activationConditions": {
  "requiredClues": ["Important clue 1", "Important clue 2"]
},
"solutionEffects": {
  "unlockClue": "Revolutionary new insight"
}
```

## Examples

### Timeline Puzzle

```javascript
"timeline_iris_disappearance": {
  "type": "timeline",
  "title": "Reconstructing Iris's Last Night",
  "description": "Arrange the events of the night Iris disappeared in chronological order.",
  "activationConditions": {
    "requiredClues": [
      "Mrs. Finch saw Iris at 7 PM",
      "Mr. Arnold claims Iris left at 9 PM",
      "Flickering basement light at 10 PM"
    ]
  },
  "events": [
    {
      "id": "finch_dinner",
      "text": "Iris had dinner with Mrs. Finch",
      "time": "7:00 PM"
    },
    {
      "id": "arnolds_sighting",
      "text": "Mr. Arnold saw Iris leave her house",
      "time": "9:00 PM"
    },
    {
      "id": "basement_light",
      "text": "Flickering light in Iris's basement",
      "time": "10:00 PM"
    }
  ],
  "solution": {
    "order": ["finch_dinner", "arnolds_sighting", "basement_light"]
  },
  "solutionEffects": {
    "trust": 10,
    "unlockClue": "Something doesn't add up - how was there light in Iris's basement after she supposedly left?"
  }
}
```

### Contradiction Puzzle

```javascript
"contradiction_jake_photo": {
  "type": "contradiction",
  "title": "Jake's Story Doesn't Add Up",
  "description": "Jake claims he never met Iris, but there's evidence to the contrary.",
  "activationConditions": {
    "trustMin": 20,
    "requiredClues": ["Jake claims he never met Iris"]
  },
  "characterId": "jake_lila",
  "characterStatement": "I never met Iris. She had moved away before we bought the house.",
  "solution": {
    "character": "jake_lila",
    "evidence": "well_meeting_photo"
  },
  "solutionEffects": {
    "trust": 5,
    "unlockClue": "Jake lied about knowing Iris - they met at the well several times",
    "triggerDialogue": {
      "character": "jake_lila",
      "dialogueId": "jake_lila_confession"
    }
  }
}
```

### Photo Assembly Puzzle

```javascript
"photoAssembly_shadow_figure": {
  "type": "photoAssembly",
  "title": "The Watcher in the Windows",
  "description": "Collect photos of the abandoned house from different angles to reveal who's been watching.",
  "activationConditions": {
    "timeOfDay": "night",
    "trustMin": 30
  },
  "requiredPhotoTypes": ["house_east", "house_north", "house_west"],
  "revealedElement": "shadow-figure",
  "solution": {
    "requiredPhotos": ["house_east_photo", "house_north_photo", "house_west_photo"]
  },
  "solutionEffects": {
    "trust": 15,
    "unlockClue": "A shadow figure can be seen moving between windows when photos are arranged together"
  }
}
```

### Environmental Puzzle

```javascript
"environmental_book_code": {
  "type": "environmental",
  "title": "Iris's Bookshelf Secret",
  "description": "The books on Iris's shelf seem to be arranged in a strange pattern...",
  "activationConditions": {
    "requiredClues": ["Iris's room has been untouched"]
  },
  "hint": "Look at the first letter of each book title",
  "solution": {
    "type": "code",
    "code": "WELL"
  },
  "solutionEffects": {
    "unlockClue": "The books on Iris's shelf spell out WELL - what could that mean?",
    "setDialogueVariable": {"foundBookshelfCode": true}
  }
}
``` 