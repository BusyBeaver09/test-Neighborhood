# 🗺️ Enhanced Map System for Maplewood Lane

This document outlines the enhanced map system for the narrative exploration game "Maplewood Lane: Neighborhood Mysteries." The system focuses on creating a more immersive, functional, and player-driven exploration experience.

## 🧭 Core Features

### 1. Fog of Discovery (Fog of War)
- Map starts with areas obscured by fog
- Areas are revealed as the player explores them
- Revealed areas persist between game sessions using localStorage
- Toggle fog visibility for reviewing the full map

### 2. Time-Based Icon Changes
- Houses glow/animate at specific times (e.g., basement light at night)
- Neighbors and points of interest appear/disappear based on time of day
- Subtle animations highlight areas of interest (e.g., flickering lights)

### 3. Map Pins & Player Notes
- Right-click anywhere on the map to place a pin
- Add customized notes to pins (e.g., "Jake lied here")
- Choose from multiple pin colors to categorize your findings
- Pins appear only on the full map (not minimap)

### 4. Unlockable Locations
- Some locations are not visible until certain conditions are met:
  - Finding specific clues
  - Reaching trust thresholds with certain characters
  - Investigating specific areas
  - Taking photos of evidence

### 5. Ambient Effects & Audio Cues
- Random ambient events (fireflies, cat crossing, etc.)
- Audio cues with visual indicators to hint at nearby points of interest
- Subtle effects that change based on time of day and weather

## 🛠️ Technical Implementation

### MapManager Class
The system is built around the `MapManager` class which handles:

```javascript
class MapManager {
    constructor(game) {
        // Initialize map elements, fog of war, and location data
    }
    
    // Core map functionality
    updateFogOfWar()
    toggleFogOfWar()
    updateLocations()
    createFullMapMarkers()
    update()
    
    // Pin management
    showAddPinMenu(event)
    addPin(x, y, note, color)
    deletePin(pinId)
    
    // Save/load functionality
    saveMapData()
    loadMapData()
    
    // Map controls
    zoomMap(direction)
    resetMapZoom()
}
```

### Location Data Model

Each location on the map follows this data structure:

```javascript
{
    id: "old_well",
    name: "Old Well",
    coordinates: { x: 425, y: 350 },
    discovered: false,
    visibleTimes: ["afternoon", "evening", "night"],
    clueRelated: ["Found a pendant half-buried near the old well"],
    notes: []
}
```

## 📋 Integration Guide

### 1. Files and Dependencies

- `MapManager.js`: Core implementation
- `map-enhancements.css`: Visual styling for map features
- Additional changes to `game.js` to integrate with game logic

### 2. Key Integration Points

The map system integrates with the game in several ways:

- **Game State**: Reacts to time of day, trust levels, and discovered clues
- **Random Events**: Triggers ambient effects and audio cues
- **Save/Load System**: Persists discovered areas and player pins
- **Dialogue System**: Unlocks locations based on trust thresholds

### 3. Optional Features (Easy to Toggle)

- **Fast Travel**: Unlockable after discovering all locations
- **Map Modes**: Toggle between normal view and clue-focused view
- **Weather Effects**: Change visibility and ambient effects

## 🎮 Player Experience Improvements

The enhanced map system changes the player experience in several ways:

1. **More Immersive Exploration**
   - Discovery feels rewarding as the map gradually fills in
   - Time-based changes make the world feel dynamic and alive

2. **Player-Driven Investigation**
   - Map pins let players externalize their theories and notes
   - Clue-based unlocks reward careful investigation

3. **Improved Navigation**
   - Clearer visual design makes orientation easier
   - Distinctive icons help identify different location types

4. **Persistent Progress**
   - Map discoveries and notes persist between sessions
   - Player's investigation progress is visually tracked

## 🖼️ Visual Design

The map uses a cohesive visual language:

| Element | Visual Style | Purpose |
|---------|--------------|---------|
| Fog of war | Dark overlay with gradient edges | Creates mystery and rewards exploration |
| Location markers | Distinctive shapes and colors | Makes locations instantly recognizable |
| Time indicators | Subtle glow/animation | Draws attention without being intrusive |
| Player pins | Small, colorful markers | Allows player note-taking and theorizing |
| Ambient effects | Particle effects and animations | Creates atmosphere and hints at interactions |

## 🔄 Future Expansion

The map system is designed for future enhancements:

1. **Location-specific memory fragments**
2. **Character movement patterns on the map**
3. **Environmental storytelling elements**
4. **Interactive map puzzles**
5. **Seasonal and weather changes**

---

By enhancing the map system, Maplewood Lane creates a more engaging exploration experience that supports the narrative mystery while giving players agency in how they document and track their investigation. 