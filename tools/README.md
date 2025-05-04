# Game Development Tools

This directory contains utility tools to assist with the development of "Quiet Hollow: The Vanishing of Iris Bell."

## Animation Sheet Creator

The `create_animation_sheets.html` tool helps artists create and preview animation frames for character sprites.

### Features:

- Preview existing character animations
- Upload custom animation frames
- Preview animations with adjustable speed
- Export individual frames or combined spritesheets

### How to Use:

1. Open `create_animation_sheets.html` in a web browser
2. Select a character from the dropdown menu
3. View existing animation frames
4. Upload new frames or generate templates from base sprites
5. Preview animations with different speeds
6. Export the completed frames when finished

## Animation Process

For each character, we need the following animation frames:

1. Walking Animation - 3 frames showing the character walking cycle
2. Talking Animation - 2 frames showing the character's mouth movement

See the detailed animation guide in `assets/animations/ANIMATION_GUIDE.md` for specific instructions.

## Development Standards

- All sprite images should be in PNG format with transparency
- Standard character dimensions: 32x64 pixels
- All animations should maintain consistent character proportions
- Filename format: `[character_id]_[animation_type][frame_number].png` 