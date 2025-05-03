# Neighbor Personalities & Dialogue System

A powerful, personality-driven dialogue system for the narrative exploration game "Maplewood Lane: Neighborhood Mysteries" that makes characters feel distinct, memorable, and reactive to player choices.

## 🧑‍🤝‍🧑 System Overview

This dialogue system allows for:

1. **Trust-based dialogue changes** - Different text based on trust level
2. **Personality-driven responses** - Characters react according to their traits
3. **Condition-based dialogues** - Show specific dialogues based on trust, clues, time of day, etc.
4. **Branching conversations** - Player choices affect trust and story progression
5. **Dynamic dialogue unlocking** - New conversation options as the player discovers clues

## 👥 Character Personality System

### Strong Character Archetypes

Each character has:

- **Archetype**: Base personality (e.g., "Nosy Elder", "Guilty Teen")
- **Hidden Layer**: Secret revealed at high trust 
- **Trust Thresholds**: 4 levels of revelations (0-24, 25-49, 50-74, 75+)
- **Personality Traits**: Affect dialogue style and behavior (e.g., "secretive", "anxious")

### Trust-Based Dialogue Evolution

Characters reveal more information and change their tone as trust increases:

```
Trust < 10:
JAKE: "Why do you care? She's gone. People move on."

Trust 25–50:
JAKE: "We were close, okay? I just... don't want to talk about it here."

Trust ≥ 75:
JAKE: "She didn't run. Someone scared her. Maybe it was me. I don't know anymore."
```

### Personality Trait Effects

Character traits affect dialogue style:

- **Secretive**: Vague responses at low trust
- **Anxious**: More agitated dialogue at night
- **Superstitious**: References to "signs" and "fate" rather than coincidences
- **Protective**: Will lie to protect others, creating contradictions to find

## 🛠️ Technical Implementation

### Dialogue System Classes

1. **DialogueSystem**: Core class managing game state, trust, and dialogue selection
2. **DialogueEditor**: UI for viewing and editing dialogue trees
3. **Sample Data**: Pre-configured neighbor dialogues demonstrating the system

### Dialogue Data Structure

```javascript
{
  "characters": {
    "character_id": {
      "id": "character_id",
      "name": "Character Name",
      "archetype": "Character Archetype",
      "hiddenLayer": "Secret revealed at high trust",
      "traits": ["trait1", "trait2"],
      "trustThresholds": [0, 25, 50, 75]
    }
  },
  "dialogues": {
    "dialogue_id": {
      "id": "dialogue_id",
      "character": "character_id",
      "conditions": {
        "trustMin": 25,
        "timeOfDay": "night",
        "requiredClues": ["clue_id"]
      },
      "text": "Dialogue text" | [
        "Low trust text (0-24)",
        "Medium trust text (25-49)",
        "High trust text (50-74)",
        "Very high trust text (75+)"
      ],
      "choices": [
        {
          "id": "choice_id",
          "text": "Choice text",
          "effects": {
            "trustChange": 5,
            "unlockClue": "new_clue"
          },
          "nextDialogue": "next_dialogue_id"
        }
      ]
    }
  }
}
```

## 🚀 Getting Started

### View the Editor

1. Open `neighbor-dialogue-editor.html` in a browser
2. Explore different characters and their dialogues
3. Use the trust slider to see how dialogue changes with trust level
4. Toggle between day/night to see time-dependent dialogue options

### Add a New Character

1. Open `neighbor-dialogue-data.json`
2. Add a new character entry to the "characters" object
3. Define their personality traits and trust thresholds
4. Create dialogue entries that reference this character ID

### Add New Dialogues

1. Create a new entry in the "dialogues" object
2. Set the character ID and conditions for when this dialogue appears
3. Create dialogue text (either single string or array for trust levels)
4. Define choices with effects and next dialogue transitions

## 📝 Integration with Game

To integrate this dialogue system with your game:

```javascript
// Initialize the dialogue system
const dialogueSystem = new DialogueSystem();
dialogueSystem.initialize(dialogueData);

// Start a dialogue with a character
const dialogueNode = dialogueSystem.startDialogue('mrs_finch');

// Display dialogue text and choices
displayDialogue(dialogueNode.text, dialogueNode.choices);

// When player selects a choice
const choiceId = 'selected_choice_id';
const nextNode = dialogueSystem.selectChoice(choiceId);

// Handle unlocked clues
if (dialogueSystem.gameState.clues.has('new_clue')) {
  addClueToNotebook('new_clue');
}
```

## 🧪 Example Character Implementation

Here's an example of how Mr. Arnold's character evolves with trust:

### Low Trust (0-24)

- Short, dismissive responses
- Avoids specific details
- Maintains physical distance

### Mid Trust (25-49)

- Opens up about neighborhood observations
- Acknowledges strange occurrences
- Hints at basement activity

### High Trust (50-74)

- Admits someone was in his basement
- Expresses fear and concern
- Shares limited information about Iris

### Very High Trust (75+)

- Confesses to burying evidence
- Only speaks freely at night
- Reveals crucial plot information

## 🎮 Dialogue Editor Features

- **Character Management**: View and edit character personalities
- **Trust Level Simulation**: Preview dialogues at different trust levels
- **Time of Day Toggle**: See how dialogue changes between day and night
- **Dialogue Tree Visualization**: Edit and manage branching conversations
- **Export Functionality**: Save dialogue data for game integration 