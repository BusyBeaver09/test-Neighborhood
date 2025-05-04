# Character Animation Sprites Guide

## Animation Patterns

Each character requires the following animation frames:

### Walking Animation (3 frames)
- `[character]_walk1.png` - Base walking position
- `[character]_walk2.png` - Mid-step position (legs slightly apart)
- `[character]_walk3.png` - Full-step position (legs at maximum separation)

### Talking Animation (2 frames)
- `[character]_talk1.png` - Mouth closed position
- `[character]_talk2.png` - Mouth open position

## Animation Guidelines

1. **Walking Animation**: 
   - Frame 1: Character standing in neutral position
   - Frame 2: Left leg forward, right leg back
   - Frame 3: Right leg forward, left leg back

2. **Talking Animation**:
   - Frame 1: Character with mouth closed
   - Frame 2: Character with mouth open slightly

## Character-Specific Notes

- **Player**: All animations complete
- **Camille**: All animations complete
- **Jake**: Walking frame 1 complete, need to create walking frames 2-3 and talking frames 1-2
- **Lila**: All animation frames need to be created

## Sprite Dimensions

All character sprites should be:
- 32x64 pixels
- Transparent background
- PNG format

## Animation Frame Rates

These are handled by the SpriteAnimator.js configuration:
- Walking animation: 150ms between frames
- Talking animation: 100ms between frames 