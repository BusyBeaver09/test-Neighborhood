/**
 * PhotoManager.js - Advanced photo-based gameplay system
 * Enhances photos with timestamping, grading, composition analysis,
 * and deep integration with the investigation systems.
 */

class PhotoManager {
    constructor(game) {
        this.game = game;
        this.photos = [];
        this.insightScoreThresholds = {
            poor: 30,
            average: 50,
            good: 70,
            excellent: 90
        };
        this.photoSettings = {
            maxFilmRoll: 10, // Optional limited film mechanic
            filmUsed: 0,
            limitedFilm: false, // Default disabled
            autoDevelop: true, // Default enabled
        };
        this.lastTakenPhotoId = null;
        this.darkroomOpen = false;
        
        // Photo filter settings
        this.activeFilters = {
            timeOfDay: null,
            location: null,
            subjects: null,
            insightScore: null,
            hasEvidence: null
        };
        
        // Initialize manager
        this.setupPhotoFilters();
    }
    
    /**
     * Take a photo with the current context
     * @param {Object} photoContext - Context data for the photo
     * @returns {Object} The created photo object
     */
    takePhoto(photoContext) {
        // Generate unique ID
        const photoId = `photo_${Date.now()}`;
        
        // Optional film limit mechanic
        if (this.photoSettings.limitedFilm && this.photoSettings.filmUsed >= this.photoSettings.maxFilmRoll) {
            this.game.showNotification('Out of film! Develop your photos to get a new roll.');
            return null;
        }
        
        // Calculate exact in-game timestamp
        const timestamp = this.generateTimestamp(photoContext.timeOfDay);
        
        // Calculate insight score based on context relevance, timing, and composition
        const insightScore = this.calculateInsightScore(photoContext);
        
        // Check for evidence or hidden details based on context and score
        const evidence = this.detectEvidence(photoContext, insightScore);
        
        // Create photo object
        const photo = {
            id: photoId,
            context: photoContext,
            timestamp,
            takenAt: photoContext.timeOfDay,
            location: this.determineLocation(photoContext),
            subjects: this.identifySubjects(photoContext),
            insightScore,
            evidence,
            caption: '',
            userNotes: '',
            tags: this.generateTags(photoContext),
            type: photoContext.type || 'generic',
            coordinates: { x: photoContext.position.x, y: photoContext.position.y },
            developed: this.photoSettings.autoDevelop,
            glitch: this.detectSupernatural(photoContext)
        };
        
        // Store photo
        this.photos.push(photo);
        this.lastTakenPhotoId = photoId;
        
        // If film limit is enabled, increment used film
        if (this.photoSettings.limitedFilm) {
            this.photoSettings.filmUsed++;
        }
        
        // Return the created photo
        return photo;
    }
    
    /**
     * Generate realistic timestamp based on time of day
     */
    generateTimestamp(timeOfDay) {
        const date = new Date();
        let hour, minutes;
        
        switch(timeOfDay) {
            case 'morning':
                hour = 6 + Math.floor(Math.random() * 6); // 6 AM - 12 PM
                break;
            case 'afternoon':
                hour = 12 + Math.floor(Math.random() * 5); // 12 PM - 5 PM
                break;
            case 'evening':
                hour = 17 + Math.floor(Math.random() * 3); // 5 PM - 8 PM
                break;
            case 'night':
                hour = Math.random() < 0.5 ? 
                    20 + Math.floor(Math.random() * 4) : // 8 PM - 12 AM
                    Math.floor(Math.random() * 6); // 12 AM - 6 AM
                break;
            default:
                hour = Math.floor(Math.random() * 24);
        }
        
        minutes = Math.floor(Math.random() * 60);
        
        // Format as HH:MM AM/PM
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        
        return `${formattedHour}:${formattedMinutes} ${period}`;
    }
    
    /**
     * Calculate insight score based on several factors
     * - Time relevance (right moment for event)
     * - Subject visibility (key characters or items in frame)
     * - Composition (distance to important elements)
     * - Location significance
     */
    calculateInsightScore(photoContext) {
        let score = 50; // Base score
        
        // Time relevance
        if (this.isRelevantTime(photoContext)) {
            score += 20;
        }
        
        // Subject visibility
        if (photoContext.nearbyElements && photoContext.nearbyElements.length > 0) {
            const keySubjectsCount = photoContext.nearbyElements.filter(e => 
                (e.type === 'neighbor' && [0, 1, 2].includes(e.index)) ||
                (e.type === 'house' && [0, 3].includes(e.index)) 
            ).length;
            
            score += keySubjectsCount * 10;
        }
        
        // Distance to important elements
        if (this.isGoodComposition(photoContext)) {
            score += 15;
        }
        
        // Special location bonus
        if (this.isSignificantLocation(photoContext)) {
            score += 15;
        }
        
        // Puzzle-related bonus
        if (photoContext.type && !photoContext.type.includes('generic')) {
            score += 25;
        }
        
        // Randomize slightly for variety
        score += Math.floor(Math.random() * 10) - 5;
        
        // Clamp to 0-100
        return Math.max(0, Math.min(100, score));
    }
    
    /**
     * Check if the time of day is relevant for what's in the photo
     */
    isRelevantTime(photoContext) {
        const time = photoContext.timeOfDay;
        
        // Check special time-sensitive elements
        if (time === 'night' && photoContext.nearbyElements.some(e => e.type === 'house' && e.index === 3)) {
            return true; // Abandoned house at night
        }
        
        if (time === 'evening' && 
            photoContext.position.x > 350 && photoContext.position.x < 450 &&
            photoContext.position.y > 250 && photoContext.position.y < 350) {
            return true; // Well area in evening
        }
        
        // More time rules can be added here
        
        return false;
    }
    
    /**
     * Check if elements are well-composed in the frame
     */
    isGoodComposition(photoContext) {
        // For simplicity, we'll check if any elements are at optimal distance
        if (!photoContext.nearbyElements || photoContext.nearbyElements.length === 0) {
            return false;
        }
        
        return photoContext.nearbyElements.some(element => {
            const optimalDistance = element.type === 'neighbor' ? 50 : 100;
            const distance = this.calculateDistance(
                photoContext.position,
                this.getElementPosition(element)
            );
            
            // Is within 20% of optimal distance
            return Math.abs(distance - optimalDistance) / optimalDistance < 0.2;
        });
    }
    
    /**
     * Check if the photo is at a significant location
     */
    isSignificantLocation(photoContext) {
        const pos = photoContext.position;
        
        // Well area
        if (Math.abs(pos.x - 400) < 100 && Math.abs(pos.y - 300) < 100) {
            return true;
        }
        
        // Abandoned house
        if (Math.abs(pos.x - 700) < 100 && Math.abs(pos.y - 100) < 100) {
            return true;
        }
        
        // More locations can be added here
        
        return false;
    }
    
    /**
     * Helper to calculate distance between positions
     */
    calculateDistance(pos1, pos2) {
        return Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) + 
            Math.pow(pos1.y - pos2.y, 2)
        );
    }
    
    /**
     * Get position of an element
     */
    getElementPosition(element) {
        // These positions would need to match the actual game world
        const housePositions = [
            { x: 150, y: 150 }, // Mrs. Finch
            { x: 300, y: 150 }, // Jake & Lila
            { x: 450, y: 150 }, // Mr. Arnold
            { x: 600, y: 150 }  // Abandoned house
        ];
        
        const neighborPositions = [
            { x: 150, y: 200 }, // Mrs. Finch
            { x: 300, y: 200 }, // Jake & Lila
            { x: 450, y: 200 }  // Mr. Arnold
        ];
        
        if (element.type === 'house' && element.index >= 0 && element.index < housePositions.length) {
            return housePositions[element.index];
        } else if (element.type === 'neighbor' && element.index >= 0 && element.index < neighborPositions.length) {
            return neighborPositions[element.index];
        }
        
        return { x: 0, y: 0 };
    }
    
    /**
     * Detect evidence or hidden details in the photo
     */
    detectEvidence(photoContext, insightScore) {
        // Higher insight score increases chance of finding evidence
        const evidenceChance = insightScore / 200; // 0-50% chance based on score
        
        if (Math.random() < evidenceChance) {
            // Check for specific evidence based on photo context
            if (photoContext.type === 'flickerPhoto') {
                return {
                    type: 'clue',
                    id: 'flickering_light_evidence',
                    description: 'Unusual light pattern indicates someone moving in the basement'
                };
            } else if (photoContext.type === 'shadowPhoto') {
                return {
                    type: 'clue',
                    id: 'shadow_figure_evidence',
                    description: 'A silhouette is visible through the window'
                };
            } else if (photoContext.type === 'well_meeting') {
                return {
                    type: 'contradiction',
                    id: 'well_meeting_evidence',
                    description: 'Jake speaking with someone despite claiming to have never met Iris'
                };
            }
            
            // Generic evidence based on location
            if (this.isSignificantLocation(photoContext)) {
                return {
                    type: 'clue',
                    id: 'location_evidence_' + Math.floor(Math.random() * 1000),
                    description: 'Something seems out of place here'
                };
            }
        }
        
        return null;
    }
    
    /**
     * Determine photo location name based on coordinates
     */
    determineLocation(photoContext) {
        const pos = photoContext.position;
        
        // House locations
        const houses = [
            { name: "Mrs. Finch's House", x: 150, y: 150, radius: 100 },
            { name: "Jake & Lila's House", x: 300, y: 150, radius: 100 },
            { name: "Mr. Arnold's House", x: 450, y: 150, radius: 100 },
            { name: "Abandoned House", x: 600, y: 150, radius: 100 }
        ];
        
        // Other locations
        const locations = [
            { name: "Quiet Hollow Park", x: 400, y: 300, radius: 150 },
            { name: "Old Well", x: 425, y: 350, radius: 50 },
            { name: "Hidden Woods Path", x: 650, y: 300, radius: 50 },
            { name: "Mr. Arnold's Basement", x: 450, y: 175, radius: 30 },
            { name: "Secret Garden", x: 300, y: 400, radius: 50 }
        ];
        
        // Check houses first
        for (const house of houses) {
            if (this.calculateDistance(pos, house) <= house.radius) {
                return house.name;
            }
        }
        
        // Check other locations
        for (const location of locations) {
            if (this.calculateDistance(pos, location) <= location.radius) {
                return location.name;
            }
        }
        
        // Generic location
        return "Maplewood Lane";
    }
    
    /**
     * Identify subjects in the photo
     */
    identifySubjects(photoContext) {
        const subjects = [];
        
        if (!photoContext.nearbyElements) {
            return subjects;
        }
        
        photoContext.nearbyElements.forEach(element => {
            if (element.type === 'house') {
                const houses = ["Mrs. Finch's House", "Jake & Lila's House", "Mr. Arnold's House", "Abandoned House"];
                if (element.index >= 0 && element.index < houses.length) {
                    subjects.push(houses[element.index]);
                }
            } else if (element.type === 'neighbor') {
                const neighbors = ["Mrs. Finch", "Jake & Lila", "Mr. Arnold"];
                if (element.index >= 0 && element.index < neighbors.length) {
                    subjects.push(neighbors[element.index]);
                }
            } else if (element.type === 'item') {
                subjects.push("Mysterious Object");
            }
        });
        
        return subjects;
    }
    
    /**
     * Generate tags for the photo
     */
    generateTags(photoContext) {
        const tags = [photoContext.timeOfDay];
        
        // Add location tag
        const location = this.determineLocation(photoContext);
        tags.push(location.toLowerCase().replace(/['s]/g, '').replace(/\s+/g, '-'));
        
        // Add subject tags
        const subjects = this.identifySubjects(photoContext);
        subjects.forEach(subject => {
            tags.push(subject.toLowerCase().replace(/['s]/g, '').replace(/\s+/g, '-'));
        });
        
        // Add special tags based on photo type
        if (photoContext.type && photoContext.type !== 'generic') {
            tags.push(photoContext.type.toLowerCase());
        }
        
        // Night/indoor photo
        if (photoContext.timeOfDay === 'night' && this.isIndoors(photoContext)) {
            tags.push('indoor-night');
        }
        
        return [...new Set(tags)]; // Remove duplicates
    }
    
    /**
     * Check if the photo is taken indoors
     */
    isIndoors(photoContext) {
        // Simple check - if very close to a house, consider it indoors
        if (!photoContext.nearbyElements) {
            return false;
        }
        
        return photoContext.nearbyElements.some(element => {
            if (element.type !== 'house') return false;
            
            const housePos = this.getElementPosition(element);
            const distance = this.calculateDistance(photoContext.position, housePos);
            
            return distance < 50; // Arbitrary threshold for "indoors"
        });
    }
    
    /**
     * Detect supernatural elements in the photo
     */
    detectSupernatural(photoContext) {
        // Only a small chance of supernatural effects
        if (Math.random() < 0.1 && photoContext.timeOfDay === 'night') {
            return {
                type: Math.random() < 0.5 ? 'shadow' : 'orb',
                intensity: Math.random(),
                position: {
                    x: Math.random(),
                    y: Math.random()
                }
            };
        }
        
        return null;
    }
    
    /**
     * Initialize photo filter UI
     */
    setupPhotoFilters() {
        // This would create filter UI elements
        // Implementation depends on your UI structure
    }
    
    /**
     * Apply current filters to photos
     */
    applyFilters() {
        const filteredPhotos = this.photos.filter(photo => {
            // Time of day filter
            if (this.activeFilters.timeOfDay && photo.takenAt !== this.activeFilters.timeOfDay) {
                return false;
            }
            
            // Location filter
            if (this.activeFilters.location && !photo.location.includes(this.activeFilters.location)) {
                return false;
            }
            
            // Subject filter
            if (this.activeFilters.subjects) {
                const subjectMatch = photo.subjects.some(subject => 
                    subject.toLowerCase().includes(this.activeFilters.subjects.toLowerCase())
                );
                if (!subjectMatch) return false;
            }
            
            // Insight score filter
            if (this.activeFilters.insightScore) {
                const threshold = this.insightScoreThresholds[this.activeFilters.insightScore];
                if (photo.insightScore < threshold) return false;
            }
            
            // Evidence filter
            if (this.activeFilters.hasEvidence === true && !photo.evidence) {
                return false;
            }
            
            return true;
        });
        
        return filteredPhotos;
    }
    
    /**
     * Update a photo caption or notes
     */
    updatePhotoMetadata(photoId, field, value) {
        const photo = this.getPhotoById(photoId);
        if (photo && (field === 'caption' || field === 'userNotes')) {
            photo[field] = value;
            return true;
        }
        return false;
    }
    
    /**
     * Get photo by ID
     */
    getPhotoById(photoId) {
        return this.photos.find(photo => photo.id === photoId);
    }
    
    /**
     * Develop an undeveloped photo
     */
    developPhoto(photoId) {
        const photo = this.getPhotoById(photoId);
        if (photo && !photo.developed) {
            photo.developed = true;
            
            // Special chance for hidden details to appear after developing
            if (!photo.evidence && Math.random() < 0.2) {
                photo.evidence = {
                    type: 'hidden',
                    id: 'developing_revealed_' + Math.floor(Math.random() * 1000),
                    description: 'Something wasn\'t visible until the photo was developed'
                };
            }
            
            // Reset film count if limited film is enabled
            if (this.photoSettings.limitedFilm) {
                this.photoSettings.filmUsed = 0;
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * Open the darkroom interface
     */
    openDarkroom() {
        if (this.darkroomOpen) return;
        
        this.darkroomOpen = true;
        
        // Create darkroom UI would go here
        
        return true;
    }
    
    /**
     * Close the darkroom interface
     */
    closeDarkroom() {
        if (!this.darkroomOpen) return;
        
        this.darkroomOpen = false;
        
        // Remove darkroom UI would go here
        
        return true;
    }
    
    /**
     * Serialize photo data for saving
     */
    serializePhotoData() {
        return JSON.stringify({
            photos: this.photos,
            settings: this.photoSettings
        });
    }
    
    /**
     * Deserialize and load photo data
     */
    deserializePhotoData(serializedData) {
        try {
            const data = JSON.parse(serializedData);
            this.photos = data.photos || [];
            this.photoSettings = data.settings || this.photoSettings;
            return true;
        } catch (error) {
            console.error('Error loading photo data:', error);
            return false;
        }
    }
} 