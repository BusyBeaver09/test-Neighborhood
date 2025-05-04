/**
 * PhotoUI.js - UI management for the advanced photo system
 * Handles rendering, interactions, and UI components for photos
 */

class PhotoUI {
    constructor(photoManager, game) {
        this.photoManager = photoManager;
        this.game = game;
        this.photosContainer = document.getElementById('photosGrid');
        this.photoFilterContainer = null;
        this.darkroomContainer = null;
        this.fullviewContainer = null;
        
        // Initialize UI components
        this.setupPhotoUI();
    }
    
    /**
     * Set up initial UI components
     */
    setupPhotoUI() {
        // Create photo filter container if needed
        if (!document.getElementById('photoFilters')) {
            this.createPhotoFilters();
        }
    }
    
    /**
     * Create the photo filters UI
     */
    createPhotoFilters() {
        this.photoFilterContainer = document.createElement('div');
        this.photoFilterContainer.id = 'photoFilters';
        this.photoFilterContainer.className = 'photo-filters';
        
        // Time filter
        const timeFilter = this.createFilterGroup(
            'Time', 
            'timeFilter',
            ['Any', 'Morning', 'Afternoon', 'Evening', 'Night'],
            (value) => this.applyFilter('timeOfDay', value === 'Any' ? null : value.toLowerCase())
        );
        
        // Location filter
        const locationFilter = this.createFilterGroup(
            'Location', 
            'locationFilter',
            ['Any', 'House', 'Park', 'Well', 'Path'],
            (value) => this.applyFilter('location', value === 'Any' ? null : value)
        );
        
        // Evidence filter
        const evidenceFilter = document.createElement('div');
        evidenceFilter.className = 'filter-checkbox';
        
        const evidenceInput = document.createElement('input');
        evidenceInput.type = 'checkbox';
        evidenceInput.id = 'evidenceFilter';
        evidenceInput.addEventListener('change', (e) => {
            this.applyFilter('hasEvidence', e.target.checked ? true : null);
        });
        
        const evidenceLabel = document.createElement('label');
        evidenceLabel.htmlFor = 'evidenceFilter';
        evidenceLabel.textContent = 'Show only evidence';
        
        evidenceFilter.appendChild(evidenceInput);
        evidenceFilter.appendChild(evidenceLabel);
        
        // Quality filter
        const qualityFilter = this.createFilterGroup(
            'Quality', 
            'qualityFilter',
            ['Any', 'Good', 'Excellent'],
            (value) => this.applyFilter('insightScore', value === 'Any' ? null : value.toLowerCase())
        );
        
        // Add all filters to container
        this.photoFilterContainer.appendChild(timeFilter);
        this.photoFilterContainer.appendChild(locationFilter);
        this.photoFilterContainer.appendChild(qualityFilter);
        this.photoFilterContainer.appendChild(evidenceFilter);
        
        // Add to UI before the photos grid
        this.photosContainer.parentNode.insertBefore(
            this.photoFilterContainer, 
            this.photosContainer
        );
    }
    
    /**
     * Create a filter dropdown group
     */
    createFilterGroup(label, id, options, onChange) {
        const group = document.createElement('div');
        group.className = 'filter-group';
        
        const filterLabel = document.createElement('div');
        filterLabel.className = 'filter-label';
        filterLabel.textContent = label + ':';
        
        const select = document.createElement('select');
        select.className = 'filter-select';
        select.id = id;
        
        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option;
            optionEl.textContent = option;
            select.appendChild(optionEl);
        });
        
        select.addEventListener('change', (e) => onChange(e.target.value));
        
        group.appendChild(filterLabel);
        group.appendChild(select);
        
        return group;
    }
    
    /**
     * Apply a filter and update the photo display
     */
    applyFilter(filterType, value) {
        this.photoManager.activeFilters[filterType] = value;
        this.renderPhotos();
    }
    
    /**
     * Render photos based on current filters
     */
    renderPhotos() {
        // Clear current photos
        this.photosContainer.innerHTML = '';
        
        // Get filtered photos
        const photos = this.photoManager.applyFilters();
        
        if (photos.length === 0) {
            const noPhotos = document.createElement('div');
            noPhotos.className = 'no-photos';
            noPhotos.textContent = 'No photos match your filters';
            this.photosContainer.appendChild(noPhotos);
            return;
        }
        
        // Create photo cards
        photos.forEach(photo => {
            const photoCard = this.createPhotoCard(photo);
            this.photosContainer.appendChild(photoCard);
        });
    }
    
    /**
     * Create a photo card element
     */
    createPhotoCard(photo) {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.dataset.photoId = photo.id;
        
        // Photo image
        const imageContainer = document.createElement('div');
        imageContainer.className = 'photo-image';
        
        // Apply effects based on photo properties
        if (!photo.developed) {
            imageContainer.classList.add('undeveloped');
            
            const undevelopedMarker = document.createElement('div');
            undevelopedMarker.className = 'undeveloped-marker';
            undevelopedMarker.textContent = 'Undeveloped';
            imageContainer.appendChild(undevelopedMarker);
        }
        
        if (photo.glitch) {
            imageContainer.classList.add(`glitch-${photo.glitch.type}`);
            
            if (photo.glitch.type === 'orb') {
                // Position the orb according to glitch data
                imageContainer.style.setProperty('--orb-x', `${photo.glitch.position.x * 100}%`);
                imageContainer.style.setProperty('--orb-y', `${photo.glitch.position.y * 100}%`);
            }
        }
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'photo-timestamp';
        timestamp.textContent = photo.timestamp;
        imageContainer.appendChild(timestamp);
        
        // Set image based on photo context
        // This would use the actual image in a full implementation
        // For now, create a visual representation
        this.setPhotoImageBackground(imageContainer, photo);
        
        // Add evidence marker if present
        if (photo.evidence) {
            const evidenceMarker = document.createElement('div');
            evidenceMarker.className = 'evidence-marker';
            evidenceMarker.textContent = '!';
            imageContainer.appendChild(evidenceMarker);
        }
        
        card.appendChild(imageContainer);
        
        // Metadata section
        const metadata = document.createElement('div');
        metadata.className = 'photo-metadata';
        
        // Location
        const location = document.createElement('div');
        location.className = 'photo-location';
        location.textContent = photo.location;
        metadata.appendChild(location);
        
        // Caption (use user's caption or auto-generate one)
        const caption = document.createElement('div');
        caption.className = 'photo-caption';
        caption.textContent = photo.caption || this.generateAutoCaption(photo);
        metadata.appendChild(caption);
        
        // Insight score
        const insightScore = document.createElement('div');
        insightScore.className = 'insight-score';
        
        const meter = document.createElement('div');
        meter.className = 'insight-meter';
        
        const fill = document.createElement('div');
        fill.className = 'insight-fill';
        fill.style.width = `${photo.insightScore}%`;
        
        // Add class based on score quality
        if (photo.insightScore < 30) fill.classList.add('poor');
        else if (photo.insightScore < 50) fill.classList.add('average');
        else if (photo.insightScore < 70) fill.classList.add('good');
        else if (photo.insightScore >= 90) fill.classList.add('excellent');
        
        meter.appendChild(fill);
        
        const value = document.createElement('div');
        value.className = 'insight-value';
        value.textContent = photo.insightScore;
        
        insightScore.appendChild(meter);
        insightScore.appendChild(value);
        metadata.appendChild(insightScore);
        
        // Tags
        if (photo.tags && photo.tags.length > 0) {
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'photo-tags';
            
            // Show up to 3 tags
            const displayTags = photo.tags.slice(0, 3);
            displayTags.forEach(tag => {
                const tagElement = document.createElement('div');
                tagElement.className = 'photo-tag';
                
                // Add special classes for certain tags
                if (tag === 'morning' || tag === 'afternoon' || tag === 'evening' || tag === 'night') {
                    tagElement.classList.add('time');
                } else if (tag.includes('house') || tag.includes('park') || tag.includes('well')) {
                    tagElement.classList.add('location');
                } else if (tag.includes('evidence') || tag.includes('clue')) {
                    tagElement.classList.add('evidence');
                }
                
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
            
            metadata.appendChild(tagsContainer);
        }
        
        card.appendChild(metadata);
        
        // Add click handler to open full view
        card.addEventListener('click', () => {
            this.openPhotoFullview(photo);
        });
        
        return card;
    }
    
    /**
     * Set the background for a photo using context information
     */
    setPhotoImageBackground(imageContainer, photo) {
        // Determine color based on time of day
        let bgColor;
        switch(photo.takenAt) {
            case 'morning': bgColor = '#87CEEB'; break;
            case 'afternoon': bgColor = '#FFD700'; break;
            case 'evening': bgColor = '#FF8C00'; break;
            case 'night': bgColor = '#1a1a2e'; break;
            default: bgColor = '#2c3e50';
        }
        
        // Create SVG for photo visualization
        const houseColor = '#aaaaaa';
        const peopleColor = '#3498db';
        
        let svgElements = '';
        
        // Check for houses in subjects
        if (photo.subjects.some(s => s.includes('House'))) {
            svgElements += `<rect x="30" y="40" width="40" height="30" fill="${houseColor}"/>`;
        }
        
        // Check for people in subjects
        if (photo.subjects.some(s => s.includes('Mrs.') || s.includes('Jake') || s.includes('Arnold'))) {
            svgElements += `<circle cx="50" cy="60" r="10" fill="${peopleColor}"/>`;
        }
        
        // Add special elements for certain photo types
        if (photo.type === 'flickerPhoto') {
            svgElements += `<rect x="45" y="45" width="10" height="10" fill="#ffff00">
                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="0.5s" repeatCount="indefinite" />
            </rect>`;
        } else if (photo.type === 'shadowPhoto') {
            svgElements += `<path d="M 45,40 Q 50,60 55,40" stroke="#000000" stroke-width="5" fill="none" opacity="0.7"/>`;
        }
        
        const svgData = `
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="${bgColor}" />
                ${svgElements}
                <text x="50" y="20" font-family="Arial" font-size="8" fill="white" text-anchor="middle">${photo.timestamp}</text>
            </svg>
        `;
        
        const encodedSvg = encodeURIComponent(svgData);
        imageContainer.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodedSvg}')`;
        imageContainer.style.backgroundSize = 'cover';
        imageContainer.style.backgroundPosition = 'center';
    }
    
    /**
     * Generate an automatic caption based on photo content
     */
    generateAutoCaption(photo) {
        // Simple caption templates
        const templates = [
            `${photo.location} during ${photo.takenAt}`,
            `Photo of ${photo.subjects.join(', ')}`,
            `${photo.takenAt} at ${photo.location}`
        ];
        
        // Special captions for certain photo types
        if (photo.type === 'flickerPhoto') {
            return 'Strange light flickering in the window';
        } else if (photo.type === 'shadowPhoto') {
            return 'Shadow figure seen through the window';
        } else if (photo.type === 'well_meeting') {
            return 'Meeting at the well';
        } else if (photo.type.includes('house_')) {
            return `View of abandoned house from the ${photo.type.split('_')[1]}`;
        }
        
        // Otherwise use a random template
        return templates[Math.floor(Math.random() * templates.length)];
    }
    
    /**
     * Open full view for a photo
     */
    openPhotoFullview(photo) {
        // Remove any existing fullview
        if (this.fullviewContainer) {
            this.fullviewContainer.remove();
            this.fullviewContainer = null;
        }
        
        this.fullviewContainer = document.createElement('div');
        this.fullviewContainer.className = 'photo-fullview';
        
        const content = document.createElement('div');
        content.className = 'fullview-content';
        
        // Image section
        const image = document.createElement('div');
        image.className = 'fullview-image';
        
        // Use same method to create the background, just bigger
        this.setPhotoImageBackground(image, photo);
        
        if (!photo.developed) {
            image.classList.add('undeveloped');
            
            const undevelopedMarker = document.createElement('div');
            undevelopedMarker.className = 'undeveloped-marker';
            undevelopedMarker.textContent = 'Undeveloped';
            image.appendChild(undevelopedMarker);
        }
        
        content.appendChild(image);
        
        // Details section
        const details = document.createElement('div');
        details.className = 'fullview-details';
        
        // Top metadata
        const metadata = document.createElement('div');
        metadata.className = 'fullview-metadata';
        
        const location = document.createElement('div');
        location.className = 'fullview-location';
        location.textContent = photo.location;
        
        const time = document.createElement('div');
        time.className = 'fullview-time';
        time.textContent = `${photo.takenAt} · ${photo.timestamp}`;
        
        metadata.appendChild(location);
        metadata.appendChild(time);
        details.appendChild(metadata);
        
        // Caption editable area
        const captionContainer = document.createElement('div');
        captionContainer.className = 'fullview-caption-container';
        
        const captionLabel = document.createElement('div');
        captionLabel.className = 'fullview-caption-label';
        captionLabel.textContent = 'Caption';
        
        const captionInput = document.createElement('textarea');
        captionInput.className = 'fullview-caption';
        captionInput.value = photo.caption || '';
        captionInput.placeholder = this.generateAutoCaption(photo);
        captionInput.rows = 2;
        
        // Save caption on input
        captionInput.addEventListener('input', () => {
            this.photoManager.updatePhotoMetadata(photo.id, 'caption', captionInput.value);
        });
        
        captionContainer.appendChild(captionLabel);
        captionContainer.appendChild(captionInput);
        details.appendChild(captionContainer);
        
        // Tags
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'fullview-tags';
        
        photo.tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'fullview-tag';
            
            // Add special classes for certain tags
            if (tag === 'morning' || tag === 'afternoon' || tag === 'evening' || tag === 'night') {
                tagElement.classList.add('time');
            } else if (tag.includes('house') || tag.includes('park') || tag.includes('well')) {
                tagElement.classList.add('location');
            } else if (tag.includes('evidence') || tag.includes('clue')) {
                tagElement.classList.add('evidence');
            }
            
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
        
        details.appendChild(tagsContainer);
        
        // Show evidence if present
        if (photo.evidence && photo.developed) {
            const evidenceContainer = document.createElement('div');
            evidenceContainer.className = 'fullview-evidence';
            
            const evidenceTitle = document.createElement('div');
            evidenceTitle.className = 'evidence-title';
            evidenceTitle.textContent = 'Evidence Detected';
            
            const evidenceDesc = document.createElement('div');
            evidenceDesc.className = 'evidence-description';
            evidenceDesc.textContent = photo.evidence.description;
            
            evidenceContainer.appendChild(evidenceTitle);
            evidenceContainer.appendChild(evidenceDesc);
            details.appendChild(evidenceContainer);
            
            // If this is a contradiction type, show the statement it contradicts
            if (photo.evidence.type === 'contradiction') {
                const contradictionContainer = document.createElement('div');
                contradictionContainer.className = 'contradiction-proof';
                
                const contradictionTitle = document.createElement('div');
                contradictionTitle.className = 'contradiction-title';
                contradictionTitle.textContent = 'Contradicts Statement';
                
                const statementText = document.createElement('div');
                statementText.className = 'contradiction-statement';
                statementText.textContent = '"I haven\'t seen Iris in weeks. I have no idea where she went."';
                
                const useAsProofBtn = document.createElement('button');
                useAsProofBtn.className = 'photo-action-btn primary';
                useAsProofBtn.textContent = 'Use as Proof in Dialogue';
                useAsProofBtn.addEventListener('click', () => {
                    // This would integrate with the dialogue system
                    this.game.showNotification('Photo marked as proof. You can present it in your next conversation.');
                    // Close the fullview
                    this.fullviewContainer.remove();
                    this.fullviewContainer = null;
                });
                
                contradictionContainer.appendChild(contradictionTitle);
                contradictionContainer.appendChild(statementText);
                contradictionContainer.appendChild(useAsProofBtn);
                details.appendChild(contradictionContainer);
            }
        }
        
        // Actions
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'photo-actions';
        
        // Develop action for undeveloped photos
        if (!photo.developed) {
            const developBtn = document.createElement('button');
            developBtn.className = 'photo-action-btn primary';
            developBtn.textContent = 'Develop Photo';
            developBtn.addEventListener('click', () => {
                if (this.photoManager.developPhoto(photo.id)) {
                    this.game.showNotification('Photo developed successfully');
                    // Close and re-open to show developed version
                    this.fullviewContainer.remove();
                    this.openPhotoFullview(this.photoManager.getPhotoById(photo.id));
                }
            });
            actionsContainer.appendChild(developBtn);
        }
        
        // Add to case file button
        const noteBtn = document.createElement('button');
        noteBtn.className = 'photo-action-btn';
        noteBtn.textContent = 'Add Notes';
        noteBtn.addEventListener('click', () => {
            // This would integrate with the notebook system
            this.game.showNotification('Added to your notes');
        });
        actionsContainer.appendChild(noteBtn);
        
        // Analyze button
        const analyzeBtn = document.createElement('button');
        analyzeBtn.className = 'photo-action-btn';
        analyzeBtn.textContent = 'Analyze Details';
        analyzeBtn.addEventListener('click', () => {
            this.analyzePhotoDetails(photo);
        });
        actionsContainer.appendChild(analyzeBtn);
        
        details.appendChild(actionsContainer);
        content.appendChild(details);
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'fullview-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => {
            this.fullviewContainer.remove();
            this.fullviewContainer = null;
        });
        content.appendChild(closeBtn);
        
        this.fullviewContainer.appendChild(content);
        document.body.appendChild(this.fullviewContainer);
    }
    
    /**
     * Show analysis of photo details
     */
    analyzePhotoDetails(photo) {
        let analysisText = '';
        
        // Basic info
        analysisText += `Photo taken at ${photo.timestamp} (${photo.takenAt})\n`;
        analysisText += `Location: ${photo.location}\n`;
        analysisText += `Insight score: ${photo.insightScore}\n\n`;
        
        // Subjects
        if (photo.subjects.length > 0) {
            analysisText += 'Subjects:\n';
            photo.subjects.forEach(subject => {
                analysisText += `- ${subject}\n`;
            });
            analysisText += '\n';
        }
        
        // Evidence
        if (photo.evidence && photo.developed) {
            analysisText += `Evidence detected: ${photo.evidence.description}\n\n`;
        }
        
        // Special analysis based on photo type
        if (photo.type === 'flickerPhoto') {
            analysisText += 'Analysis: The flickering light pattern suggests movement in the basement. The timing and rhythm are inconsistent with electrical issues, indicating human presence.\n';
        } else if (photo.type === 'shadowPhoto') {
            analysisText += 'Analysis: The silhouette visible through the window appears to be a person. The proportions suggest an adult, approximately 5\'9" - 6\' tall.\n';
        } else if (photo.type === 'well_meeting') {
            analysisText += 'Analysis: The two figures appear to be engaged in a heated conversation. Body language suggests tension. The female figure matches Iris Bell\'s description.\n';
        } else if (photo.type.includes('house_')) {
            analysisText += 'Analysis: This perspective of the abandoned house shows signs of recent activity. Note the partially open window and disturbed vegetation.\n';
        }
        
        // Show in a simple alert for now
        alert(analysisText);
    }
    
    /**
     * Open the darkroom interface
     */
    openDarkroom() {
        if (this.darkroomContainer) {
            this.darkroomContainer.remove();
        }
        
        this.darkroomContainer = document.createElement('div');
        this.darkroomContainer.className = 'darkroom';
        
        const content = document.createElement('div');
        content.className = 'darkroom-content';
        
        // Header
        const header = document.createElement('div');
        header.className = 'darkroom-header';
        
        const title = document.createElement('div');
        title.className = 'darkroom-title';
        title.textContent = 'Darkroom - Develop Photos';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'darkroom-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => {
            this.darkroomContainer.remove();
            this.darkroomContainer = null;
        });
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        content.appendChild(header);
        
        // Body
        const body = document.createElement('div');
        body.className = 'darkroom-body';
        
        // Get undeveloped photos
        const undevelopedPhotos = this.photoManager.photos.filter(p => !p.developed);
        
        if (undevelopedPhotos.length === 0) {
            const noPhotos = document.createElement('div');
            noPhotos.textContent = 'No undeveloped photos to process.';
            noPhotos.style.textAlign = 'center';
            noPhotos.style.padding = '20px';
            body.appendChild(noPhotos);
        } else {
            const photosHeading = document.createElement('h3');
            photosHeading.textContent = `Undeveloped Photos (${undevelopedPhotos.length})`;
            photosHeading.style.color = '#e6e6e6';
            body.appendChild(photosHeading);
            
            const photosGrid = document.createElement('div');
            photosGrid.className = 'undeveloped-photos';
            
            undevelopedPhotos.forEach(photo => {
                const photoCard = this.createPhotoCard(photo);
                photosGrid.appendChild(photoCard);
            });
            
            body.appendChild(photosGrid);
            
            const developAllBtn = document.createElement('button');
            developAllBtn.className = 'darkroom-process-btn';
            developAllBtn.textContent = `Develop All Photos (${undevelopedPhotos.length})`;
            developAllBtn.addEventListener('click', () => {
                this.startDevelopingAnimation();
                
                // Process photos one by one with a delay for effect
                let processed = 0;
                undevelopedPhotos.forEach((photo, index) => {
                    setTimeout(() => {
                        this.photoManager.developPhoto(photo.id);
                        processed++;
                        
                        if (processed === undevelopedPhotos.length) {
                            setTimeout(() => {
                                this.finishDeveloping();
                            }, 1000);
                        }
                    }, 500 * index);
                });
            });
            
            body.appendChild(developAllBtn);
        }
        
        content.appendChild(body);
        this.darkroomContainer.appendChild(content);
        document.body.appendChild(this.darkroomContainer);
    }
    
    /**
     * Start the developing animation
     */
    startDevelopingAnimation() {
        const animation = document.createElement('div');
        animation.className = 'developing-animation';
        animation.id = 'developingAnimation';
        
        const text = document.createElement('div');
        text.className = 'developing-text';
        text.textContent = 'Developing Photos...';
        
        const spinner = document.createElement('div');
        spinner.className = 'developing-spinner';
        
        animation.appendChild(text);
        animation.appendChild(spinner);
        
        this.darkroomContainer.querySelector('.darkroom-content').appendChild(animation);
    }
    
    /**
     * Finish the developing process
     */
    finishDeveloping() {
        // Remove animation
        document.getElementById('developingAnimation').remove();
        
        // Show notification
        this.game.showNotification('All photos developed successfully');
        
        // Close darkroom and update photos view
        this.darkroomContainer.remove();
        this.darkroomContainer = null;
        this.renderPhotos();
    }
} 