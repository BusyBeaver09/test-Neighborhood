# Maplewood Lane: Dialogue System Documentation

This document explains how to use the dialogue system in Maplewood Lane. The system allows for branching conversations with dynamic conditions, character relationships, and narrative progression.

## Table of Contents

- [Overview](#overview)
- [Dialogue Data Structure](#dialogue-data-structure)
- [Conditions](#conditions)
- [Effects](#effects)
- [Variables and Text Substitution](#variables-and-text-substitution)
- [Global Triggers](#global-triggers)
- [API Reference](#api-reference)
- [Examples](#examples)

## Overview

The dialogue system is based on a JSON structure that defines characters, their dialogue nodes, and the conditions under which these dialogues should be presented. It supports:

- Branching conversations based on player choices
- Conditions based on trust level, time of day, and discovered clues
- Effects that can change the game state (trust, clues, variables)
- Photo and item requirements for specific dialogue options
- Text styling based on character mood/tone
- Global triggers that can initiate dialogue based on game state

## Dialogue Data Structure

The dialogue data is organized as follows:

```json
{
  "characters": {
    "character_id": {
      "id": "character_id",
      "name": "Character Name",
      "portrait": "portrait-class-name",
      "dialogs": [
        {
          "id": "dialog_node_id",
          "lines": ["Line 1", "Line 2"],
          "conditions": {...},
          "mood": "mysterious",
          "effects": {...},
          "choices": [
            {
              "text": "Choice text",
              "next": "next_dialog_id",
              "requiresPhoto": "photoType",
              "effects": {...}
            }
          ]
        }
      ]
    }
  },
  "globalTriggers": [...]
}
```

## Conditions

Conditions determine when a dialogue node should be available or when a choice should be presented. Available conditions include:

| Condition | Description | Example |
|-----------|-------------|---------|
| `trustMin` | Minimum trust level required | `"trustMin": 10` |
| `trustMax` | Maximum trust level allowed | `"trustMax": 25` |
| `timeOfDay` | Required time of day | `"timeOfDay": "night"` |
| `requiresClue` | Clue that must be discovered | `"requiresClue": "Shadow figure clue"` |
| `requiresPhoto` | Photo type that must be taken | `"requiresPhoto": "flickerPhoto"` |
| `variables` | Game variables that must match | `"variables": {"metMrArnold": true}` |

## Effects

Effects are changes to the game state that occur when a dialogue node is visited or a choice is selected:

| Effect | Description | Example |
|--------|-------------|---------|
| `trust` | Change in trust level | `"trust": 5` |
| `unlockClue` | Add a clue to the notebook | `"unlockClue": "Mrs. Finch knows more than she says"` |
| `addItem` | Add an item to inventory | `"addItem": "basement_key"` |
| `triggerEvent` | Trigger a game event | `"triggerEvent": "shadow_appearance"` |
| `setVariable` | Set a dialogue variable | `"setVariable": {"hasBasementKey": true}` |

## Variables and Text Substitution

You can use variables in dialogue text by enclosing them in curly braces:

```json
{
  "lines": ["Your trust level is {trust}. Good {timeOfDay}, {playerName}."]
}
```

Built-in variables include:
- `trust` - Current trust level
- `timeOfDay` - Current time of day

Custom variables can be set through dialogue effects with `setVariable`.

## Global Triggers

Global triggers allow dialogue to be initiated based on game state, even outside of direct character interactions:

```json
"globalTriggers": [
  {
    "conditions": {
      "trustMin": 50,
      "requiresClue": "Shadow figure clue"
    },
    "showDialogue": {
      "character": "mr_arnold",
      "dialogue": "mr_arnold_night_warning"
    },
    "oneTime": true
  }
]
```

## API Reference

### DialogueManager

The `DialogueManager` class provides these main methods:

| Method | Description |
|--------|-------------|
| `initialize(dialogueData, domElements)` | Set up the manager with dialogue data and UI elements |
| `showDialogue(characterId, dialogueId)` | Show dialogue for a character, optionally specifying a node |
| `addGlobalTrigger(trigger)` | Add a global trigger that can fire based on conditions |
| `exportDialogueState()` | Export the current dialogue state for saving |
| `importDialogueState(state)` | Import a previously saved dialogue state |
| `convertLegacyDialogue(legacyDialogues)` | Convert old dialogue format to new format |

## Examples

### Basic Character Dialogue

```javascript
// Character with a simple dialogue node
{
  "characters": {
    "mrs_finch": {
      "id": "mrs_finch",
      "name": "Mrs. Finch",
      "portrait": "portrait-mrs-finch",
      "dialogs": [
        {
          "id": "default",
          "lines": ["Oh, hello dear! It's nice to see a new face around Quiet Hollow."],
          "choices": [
            {
              "text": "I'm Elia Martinez. I used to live here.",
              "next": "mrs_finch_intro"
            },
            {
              "text": "Just saying hello. Have a nice day!",
              "next": "exit"
            }
          ]
        }
      ]
    }
  }
}
```

### Dialogue with Conditions

```javascript
// Time of day and trust-specific dialogue
{
  "id": "mrs_finch_night_high_trust",
  "lines": [
    "That night, the basement light kept flickering.",
    "I thought it was just the storm. But I swear, I saw someone..."
  ],
  "conditions": {
    "trustMin": 25,
    "timeOfDay": "night"
  },
  "mood": "mysterious",
  "choices": [
    {
      "text": "Was it a shadow figure?",
      "next": "mrs_finch_shadow",
      "effects": { 
        "trust": 5,
        "unlockClue": "Mrs. Finch may have seen a shadow figure"
      }
    }
  ]
}
```

### Photo-Dependent Choice

```javascript
// Choice that requires a specific photo
{
  "text": "Show photo: Flickering Light",
  "next": "mrs_finch_photo_flicker",
  "requiresPhoto": "flickerPhoto",
  "effects": { "trust": 10 }
}
```

### Using Variables

```javascript
// Setting and using variables
{
  "id": "give_key",
  "lines": ["Here, take this key. It might be useful."],
  "effects": {
    "setVariable": {"hasBasementKey": true},
    "addItem": "basement_key"
  }
},
{
  "id": "ask_about_key",
  "lines": ["Did you use that key I gave you yet?"],
  "conditions": {
    "variables": {"hasBasementKey": true}
  }
}
```

### Global Trigger Example

```javascript
// Mr. Arnold approaches when certain conditions are met
{
  "conditions": {
    "trustMin": 30,
    "timeOfDay": "night",
    "requiresClue": "Shadowy figure appears at midnight"
  },
  "showDialogue": {
    "character": "mr_arnold",
    "dialogue": "mr_arnold_night_warning"
  },
  "oneTime": true
}
``` 