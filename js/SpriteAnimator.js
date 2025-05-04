/**
 * SpriteAnimator.js
 * Handles character sprite animations for walking and talking
 */

class SpriteAnimator {
    constructor() {
        // Animation frame definitions
        this.animations = {
            player: {
                idle: ["assets/characters/player.png"],
                walking: ["assets/animations/player_walk1.png", "assets/animations/player_walk2.png", "assets/animations/player_walk3.png"],
                talking: ["assets/animations/player_talk1.png", "assets/animations/player_talk2.png"]
            },
            camille: {
                idle: ["assets/characters/camille.png"],
                walking: ["assets/animations/camille_walk1.png", "assets/animations/camille_walk2.png", "assets/animations/camille_walk3.png"],
                talking: ["assets/animations/camille_talk1.png", "assets/animations/camille_talk2.png"]
            },
            jake: {
                idle: ["assets/characters/jake.png"],
                walking: ["assets/animations/jake_walk1.png", "assets/animations/jake_walk2.png", "assets/animations/jake_walk3.png"],
                talking: ["assets/animations/jake_talk1.png", "assets/animations/jake_talk2.png"]
            },
            lila: {
                idle: ["assets/characters/lila.png"],
                walking: ["assets/animations/lila_walk1.png", "assets/animations/lila_walk2.png", "assets/animations/lila_walk3.png"],
                talking: ["assets/animations/lila_talk1.png", "assets/animations/lila_talk2.png"]
            }
        };
        
        // Animation state for each character
        this.state = {};
        
        // Timing configuration
        this.frameRates = {
            walking: 150, // ms between walking frames
            talking: 100  // ms between talking frames
        };
        
        this.lastTimestamp = 0;
        this.preloadImages();
    }
    
    /**
     * Preload all animation images to avoid flickering
     */
    preloadImages() {
        const imagesToPreload = [];
        
        // Collect all image paths
        for (const character in this.animations) {
            for (const animation in this.animations[character]) {
                this.animations[character][animation].forEach(imgPath => {
                    if (!imagesToPreload.includes(imgPath)) {
                        imagesToPreload.push(imgPath);
                    }
                });
            }
        }
        
        // Preload each image
        imagesToPreload.forEach(imgPath => {
            const img = new Image();
            img.src = imgPath;
        });
    }
    
    /**
     * Initialize a character for animation
     */
    initCharacter(characterId) {
        if (!this.animations[characterId]) {
            console.warn(`Animation data not found for character: ${characterId}`);
            return false;
        }
        
        this.state[characterId] = {
            currentAnimation: 'idle',
            currentFrame: 0,
            frameTimer: 0,
            isMoving: false,
            isTalking: false,
            direction: 'down'
        };
        
        return true;
    }
    
    /**
     * Set a character's animation state
     */
    setAnimation(characterId, animationType) {
        if (!this.state[characterId]) {
            if (!this.initCharacter(characterId)) {
                return false;
            }
        }
        
        // Only change animation if it's different
        if (this.state[characterId].currentAnimation !== animationType) {
            this.state[characterId].currentAnimation = animationType;
            this.state[characterId].currentFrame = 0;
            this.state[characterId].frameTimer = 0;
        }
        
        return true;
    }
    
    /**
     * Set a character's movement state
     */
    setMoving(characterId, isMoving, direction = null) {
        if (!this.state[characterId]) {
            if (!this.initCharacter(characterId)) {
                return false;
            }
        }
        
        this.state[characterId].isMoving = isMoving;
        
        if (direction) {
            this.state[characterId].direction = direction;
        }
        
        if (isMoving) {
            this.setAnimation(characterId, 'walking');
        } else {
            this.setAnimation(characterId, 'idle');
        }
        
        return true;
    }
    
    /**
     * Set a character's talking state
     */
    setTalking(characterId, isTalking) {
        if (!this.state[characterId]) {
            if (!this.initCharacter(characterId)) {
                return false;
            }
        }
        
        this.state[characterId].isTalking = isTalking;
        
        if (isTalking && !this.state[characterId].isMoving) {
            this.setAnimation(characterId, 'talking');
        } else if (!isTalking && !this.state[characterId].isMoving) {
            this.setAnimation(characterId, 'idle');
        }
        
        return true;
    }
    
    /**
     * Get the current sprite frame for a character
     */
    getCurrentSprite(characterId) {
        if (!this.state[characterId]) {
            if (!this.initCharacter(characterId)) {
                return null;
            }
        }
        
        const charState = this.state[characterId];
        const animation = this.animations[characterId][charState.currentAnimation];
        
        if (!animation || animation.length === 0) {
            console.warn(`No frames found for ${characterId}'s ${charState.currentAnimation} animation`);
            return this.animations[characterId]['idle'][0];
        }
        
        return animation[charState.currentFrame];
    }
    
    /**
     * Update all character animations based on elapsed time
     */
    update(timestamp) {
        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
            return;
        }
        
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        
        for (const characterId in this.state) {
            const charState = this.state[characterId];
            
            // Skip if using idle animation
            if (charState.currentAnimation === 'idle') continue;
            
            const frameRate = this.frameRates[charState.currentAnimation];
            if (!frameRate) continue;
            
            charState.frameTimer += deltaTime;
            
            if (charState.frameTimer >= frameRate) {
                charState.frameTimer = 0;
                const animation = this.animations[characterId][charState.currentAnimation];
                charState.currentFrame = (charState.currentFrame + 1) % animation.length;
            }
        }
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpriteAnimator;
} 