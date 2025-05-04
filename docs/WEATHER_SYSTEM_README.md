# Weather System for Quiet Hollow

This weather system adds dynamic atmospheric effects to the Quiet Hollow game, enhancing immersion and gameplay through changing weather conditions.

## Features

- **Five Weather Types**: Clear, Cloudy, Rain, Fog, and Storm
- **Time-of-Day Integration**: Weather probabilities change based on time of day
- **Visual Effects**: 
  - Rain drops with adjustable intensity
  - Fog layers with drift animation
  - Lightning flashes with thunder audio
  - Ambient lighting changes based on weather and time
  - Cloud shadows for overcast conditions
- **Audio Effects**:
  - Rain ambient sound
  - Thunder sound effects
  - Wind ambient sound
- **Gameplay Impact**:
  - Weather affects movement speed
  - Weather affects visibility
  - Potential use for puzzle/story triggers
- **Smooth Transitions**: Gradual changes between weather states

## Implementation

### Files

- `js/WeatherSystem.js` - Main system code
- `css/weather-system.css` - Visual styling
- `html/weather-system-demo.html` - Demonstration page
- `assets/audio/` - Required audio files:
  - `rain.mp3`
  - `thunder.mp3`
  - `wind.mp3`

### Basic Usage

1. Include the required files in your HTML:

```html
<link rel="stylesheet" href="css/weather-system.css">
<script src="js/WeatherSystem.js"></script>
```

2. Initialize the system with your game manager:

```javascript
// Assuming you have a game manager with a time manager
const weatherSystem = new WeatherSystem(gameManager);
weatherSystem.init(document.getElementById('gameWorld'));
```

3. The system will automatically generate random weather based on the time of day.

### Triggering Weather Events

You can manually trigger weather events for narrative purposes:

```javascript
// Trigger a storm for dramatic effect
weatherSystem.setWeatherEvent('storm', {
    intensity: 0.8,           // 0-1 scale
    transitionTime: 20,       // seconds
    duration: 600             // seconds (10 minutes)
});
```

### Integration with Time System

The WeatherSystem listens for 'timeChange' events from the TimeManager. Make sure your TimeManager emits these events:

```javascript
// Example TimeManager event emission
timeManager.addEventListener('timeChange', (event) => {
    // The weather system will automatically respond to this
});
```

## Weather Types and Properties

| Weather Type | Description | Movement Effect | Visibility Effect | Visual Effects | Audio Effects |
|--------------|-------------|-----------------|-------------------|----------------|---------------|
| Clear        | Clear skies | 0               | 0                 | None           | None          |
| Cloudy       | Overcast    | 0               | -0.1              | Dimmed light, shadows | Gentle wind |
| Rain         | Rainfall    | -0.1            | -0.3              | Raindrops, wet surfaces | Rain sounds, distant thunder |
| Fog          | Thick fog   | -0.05           | -0.6              | Limited visibility, diffused light | Muffled sounds |
| Storm        | Heavy storm | -0.25           | -0.5              | Heavy rain, flashes, swaying objects | Heavy rain, wind, thunder |

## Weather Distribution

The probability of each weather type varies based on time of day. This creates more realistic weather patterns:

- **Morning**: Higher chance of fog and clear skies
- **Afternoon**: Higher chance of cloudy and rain
- **Evening**: Balanced distribution
- **Night**: Higher chance of clear skies and fog

## Advanced Usage

### Event Triggers

Use the weather system as a trigger for narrative events:

```javascript
// Check current weather
const weatherData = weatherSystem.getCurrentWeatherData();

// Use in conditionals
if (weatherData.type === 'storm' && weatherData.intensity > 0.7) {
    // Trigger dramatic story event
    storyManager.triggerEvent('mysterious_figure_appears');
}
```

### Performance Considerations

The weather effects use several DOM elements and CSS animations. On lower-end devices, consider lowering the intensity or disabling certain effects:

```javascript
// For lower-end devices
weatherSystem.transitionToWeather('rain', 0.4, 2); // Lower intensity
```

## Troubleshooting

- **Audio not playing**: Browsers require user interaction before playing audio. Ensure there's a user gesture before attempting to play weather sounds.
- **Performance issues**: Reduce the number of particles in intense weather types by modifying the dropCount in applyRainEffect().
- **Visual conflicts**: If weather effects conflict with other game elements, adjust the z-index values in weather-system.css.

## Future Enhancements

- Additional weather types (snow, hail)
- Particle system optimization
- WebGL-based effects for improved performance
- More precise collision detection for rain particles
- Weather mini-map indicator

---

## Demo

A demonstration page is available at `html/weather-system-demo.html` that showcases all weather types and allows you to experiment with different settings. 