# Quiet Hollow: The Vanishing of Iris Bell

A narrative-driven exploration game where you solve mysteries in the Quiet Hollow neighborhood.

## Project Structure

The project is organized as follows:

```
/
├── index.html         # Main game entry point
├── js/                # JavaScript files
│   ├── game.js        # Main game logic
│   ├── dialogues.js   # Dialogue content and structure
│   ├── MapManager.js  # Map and navigation system
│   ├── PuzzleManager.js # Puzzle system and logic
│   └── ...
├── css/               # Stylesheets
│   ├── styles.css     # Main game styles
│   ├── puzzles.css    # Puzzle-specific styles
│   └── ...
├── html/              # Additional HTML pages (tests, editors)
│   ├── map-test.html
│   ├── dialogue-test.html
│   └── ...
├── docs/              # Documentation
│   ├── MAP_SYSTEM_README.md
│   ├── PUZZLE_SYSTEM_DOCS.md
│   └── ...
├── data/              # Game data files
│   └── neighbor-dialogue-data.json
└── assets/            # Game assets
    ├── images/
    └── audio/
```

## Game Features

* Interactive narrative exploration
* Day/night cycle affecting gameplay
* Trust-based progression system
* Map system with minimap and location labels
* Dialogue system with character portraits and branching conversations
* Clue collection and connection system
* Photo-taking feature
* Save/load functionality
* Ambient audio based on time of day

## Running the Game

Open `index.html` in a modern browser to start the game.

## Development Tools

Additional development and testing tools are available in the `/html` directory:
- `html/neighbor-dialogue-editor.html` - For editing character dialogues
- `html/map-test.html` - For testing map functionality
- `html/puzzle-demo.html` - For testing puzzle mechanics 