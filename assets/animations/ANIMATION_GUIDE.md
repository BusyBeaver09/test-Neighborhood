# Character Animation Guide for Quiet Hollow

This guide provides instructions for creating consistent character animation sprites for the game "Quiet Hollow: The Vanishing of Iris Bell."

## Animation Types

Each character requires two types of animations:

1. **Walking Animation (3 frames)**
2. **Talking Animation (2 frames)**

## File Naming Convention

Files should follow this naming pattern:
- `[character_id]_[animation_type][frame_number].png`

For example:
- `player_walk1.png`
- `camille_talk2.png`

## Sprite Dimensions & Format

- **Size**: 32x64 pixels
- **Format**: PNG with transparency
- **Style**: Pixel art, consistent with game aesthetic
- **Color palette**: Match the character's base sprite

## Animation Frame Guidelines

### Walking Animation

This animation should show the character's legs moving in a walking cycle:

1. **Frame 1 (`_walk1.png`)**: Base position, standing neutral
2. **Frame 2 (`_walk2.png`)**: Mid-step, left leg forward, right leg back
3. **Frame 3 (`_walk3.png`)**: Alternate step, right leg forward, left leg back

The upper body should remain mostly consistent across frames, with subtle movement.

### Talking Animation

This animation should show the character's mouth movement when speaking:

1. **Frame 1 (`_talk1.png`)**: Mouth closed or neutral position
2. **Frame 2 (`_talk2.png`)**: Mouth open or in speaking position

Only the face/head area should change between these frames.

## Example: Modifying Base Sprites

To create animation frames from a base sprite:

1. Start with the character's base sprite (e.g., `jake.png`)
2. For walking frames:
   - Duplicate the sprite and modify the leg positions
   - Keep the upper body consistent
3. For talking frames:
   - Duplicate the sprite and modify only the mouth area
   - Keep the rest of the sprite identical

## Implementation Status

| Character | Base Sprite | Walk 1 | Walk 2 | Walk 3 | Talk 1 | Talk 2 |
|-----------|-------------|--------|--------|--------|--------|--------|
| Player    | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Camille   | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Jake      | ✅ | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| Lila      | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

✅ = Completed  
⬜ = Not yet implemented  

## Frame Rate Configuration

The animation speeds are configured in `SpriteAnimator.js`:
- Walking animation: 150ms between frames
- Talking animation: 100ms between frames

## Best Practices

1. **Consistency**: Ensure all animations for a character have the same proportions and style
2. **Subtlety**: Avoid excessive movement between frames
3. **Testing**: Test animations in-game to ensure they appear natural
4. **File size**: Optimize PNG files for web performance 