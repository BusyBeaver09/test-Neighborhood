/**
 * neighbor-dialogue-editor.js - Editor interface for the dialogue system
 */

class DialogueEditor {
    constructor() {
        this.dialogueSystem = new DialogueSystem();
        this.characters = {};
        this.dialogues = {};
        this.currentCharacterId = null;
        this.currentDialogueId = null;
        
        // UI elements
        this.elements = {
            characterList: document.getElementById('characterList'),
            dialogueTree: document.getElementById('dialogueTree'),
            trustSlider: document.getElementById('trustSlider'),
            trustValue: document.getElementById('trustValue'),
            timeOptions: document.querySelectorAll('.time-option'),
            previewSection: document.querySelector('.dialogue-preview'),
            exportDataBtn: document.getElementById('exportDataBtn'),
            addDialogueNodeBtn: document.getElementById('addDialogueNodeBtn'),
            editPersonalityBtn: document.getElementById('editPersonalityBtn'),
            newDialogueBtn: document.getElementById('newDialogueBtn'),
            resetPreviewBtn: document.getElementById('resetPreviewBtn')
        };
        
        // Initialize with sample data
        this.initializeSampleData();
        this.setupEventListeners();
    }
    
    /**
     * Initialize with sample dialogue data
     */
    initializeSampleData() {
        this.dialogueSystem.initialize(sampleDialogueData);
        this.characters = this.dialogueSystem.getAllCharacters();
        this.dialogues = this.dialogueSystem.dialogues;
        
        // Default to first character
        const firstCharacterId = Object.keys(this.characters)[0];
        this.selectCharacter(firstCharacterId);
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Character selection
        if (this.elements.characterList) {
            this.elements.characterList.addEventListener('click', (e) => {
                const characterItem = e.target.closest('.character-item');
                if (characterItem) {
                    const characterId = characterItem.dataset.character;
                    this.selectCharacter(characterId);
                }
            });
        }
        
        // Trust slider
        if (this.elements.trustSlider) {
            this.elements.trustSlider.addEventListener('input', () => {
                const trustValue = parseInt(this.elements.trustSlider.value);
                this.elements.trustValue.textContent = trustValue;
                
                if (this.currentCharacterId) {
                    this.dialogueSystem.setTrustLevel(this.currentCharacterId, trustValue);
                    this.updateDialoguePreview();
                }
            });
        }
        
        // Time of day toggle
        if (this.elements.timeOptions) {
            this.elements.timeOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    this.elements.timeOptions.forEach(o => o.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    const timeOfDay = e.target.dataset.time;
                    this.dialogueSystem.setTimeOfDay(timeOfDay);
                    this.updateDialoguePreview();
                });
            });
        }
        
        // Export data button
        if (this.elements.exportDataBtn) {
            this.elements.exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // Add dialogue node button
        if (this.elements.addDialogueNodeBtn) {
            this.elements.addDialogueNodeBtn.addEventListener('click', () => {
                this.showAddDialogueForm();
            });
        }
        
        // Edit personality button
        if (this.elements.editPersonalityBtn) {
            this.elements.editPersonalityBtn.addEventListener('click', () => {
                this.showEditPersonalityForm();
            });
        }
        
        // New dialogue button
        if (this.elements.newDialogueBtn) {
            this.elements.newDialogueBtn.addEventListener('click', () => {
                this.showAddDialogueForm();
            });
        }
        
        // Reset preview button
        if (this.elements.resetPreviewBtn) {
            this.elements.resetPreviewBtn.addEventListener('click', () => {
                this.resetDialoguePreview();
            });
        }
        
        // Add trait button and input
        const addTraitBtn = document.getElementById('addTraitBtn');
        const newTraitInput = document.getElementById('newTraitInput');
        
        if (addTraitBtn && newTraitInput) {
            addTraitBtn.addEventListener('click', () => {
                const trait = newTraitInput.value.trim();
                if (trait && this.currentCharacterId) {
                    this.addCharacterTrait(this.currentCharacterId, trait);
                    newTraitInput.value = '';
                }
            });
            
            newTraitInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addTraitBtn.click();
                }
            });
        }
        
        // Remove trait buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-trait')) {
                const traitElement = e.target.parentElement;
                const trait = traitElement.textContent.replace('✕', '').trim();
                
                if (this.currentCharacterId) {
                    this.removeCharacterTrait(this.currentCharacterId, trait);
                }
            }
        });
        
        // Preview dialogue choices
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('preview-choice')) {
                this.handlePreviewChoice(e.target);
            }
        });
        
        // Dialogue node edit/delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && e.target.parentElement.classList.contains('dialogue-actions')) {
                const action = e.target.textContent.toLowerCase();
                const dialogueNode = e.target.closest('.dialogue-node');
                const dialogueId = dialogueNode.querySelector('.dialogue-id').textContent;
                
                if (action === 'edit') {
                    this.showEditDialogueForm(dialogueId);
                } else if (action === 'duplicate') {
                    this.duplicateDialogue(dialogueId);
                } else if (action === 'delete') {
                    this.deleteDialogue(dialogueId);
                }
            }
        });
    }
    
    /**
     * Select a character and update the UI
     * @param {string} characterId - The character to select
     */
    selectCharacter(characterId) {
        if (!this.characters[characterId]) return;
        
        // Update active character in UI
        const characterItems = this.elements.characterList.querySelectorAll('.character-item');
        characterItems.forEach(item => {
            item.classList.toggle('active', item.dataset.character === characterId);
        });
        
        this.currentCharacterId = characterId;
        
        // Update personality section
        this.updatePersonalitySection(characterId);
        
        // Update dialogue tree
        this.updateDialogueTree(characterId);
        
        // Set trust level in slider
        const trustLevel = this.dialogueSystem.gameState.trust[characterId] || 0;
        this.elements.trustSlider.value = trustLevel;
        this.elements.trustValue.textContent = trustLevel;
        
        // Update preview
        this.updateDialoguePreview();
    }
    
    /**
     * Update the personality section for a character
     * @param {string} characterId - The character to display
     */
    updatePersonalitySection(characterId) {
        const character = this.characters[characterId];
        const sectionTitle = document.querySelector('.personality-section .section-title');
        
        if (sectionTitle) {
            const characterName = character.name || characterId.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
                
            sectionTitle.innerHTML = `Personality: ${characterName}
                <button class="secondary" id="editPersonalityBtn">Edit</button>`;
        }
        
        // Update archetype
        const archetypeElement = document.querySelector('.personality-details .form-group:nth-child(1) div');
        if (archetypeElement) {
            archetypeElement.textContent = character.archetype || 'Not specified';
        }
        
        // Update hidden layer
        const hiddenLayerElement = document.querySelector('.personality-details .form-group:nth-child(2) div');
        if (hiddenLayerElement) {
            hiddenLayerElement.textContent = character.hiddenLayer || 'Not specified';
        }
        
        // Update trust thresholds
        const thresholdsElement = document.querySelector('.personality-details .form-group:nth-child(3) .flex');
        if (thresholdsElement) {
            const thresholds = character.trustThresholds || [0, 25, 50, 75];
            thresholdsElement.innerHTML = `
                <span class="trait-tag">Baseline: ${thresholds[0]}-${thresholds[1]-1}</span>
                <span class="trait-tag">Mid-trust: ${thresholds[1]}-${thresholds[2]-1}</span>
                <span class="trait-tag">Revealing: ${thresholds[2]}-${thresholds[3]-1}</span>
                <span class="trait-tag">Truth: ${thresholds[3]}+</span>
            `;
        }
        
        // Update traits
        const traitList = document.querySelector('.trait-list');
        if (traitList) {
            const traits = character.traits || [];
            traitList.innerHTML = traits.map(trait => `
                <div class="trait-tag">${trait} <span class="remove-trait">✕</span></div>
            `).join('');
        }
    }
    
    /**
     * Update the dialogue tree for a character
     * @param {string} characterId - The character to display dialogues for
     */
    updateDialogueTree(characterId) {
        // Get all dialogues for this character
        const characterDialogues = Object.values(this.dialogues).filter(
            dialogue => dialogue.character === characterId
        );
        
        // Clear existing tree
        this.elements.dialogueTree.innerHTML = '';
        
        // Add each dialogue node
        characterDialogues.forEach(dialogue => {
            const dialogueNode = this.createDialogueNodeElement(dialogue);
            this.elements.dialogueTree.appendChild(dialogueNode);
        });
        
        // If no dialogues, show message
        if (characterDialogues.length === 0) {
            this.elements.dialogueTree.innerHTML = `
                <p>No dialogues found for this character. Click "Add Node" to create one.</p>
            `;
        }
    }
    
    /**
     * Create a dialogue node element
     * @param {Object} dialogue - The dialogue data
     * @returns {HTMLElement} The dialogue node element
     */
    createDialogueNodeElement(dialogue) {
        const node = document.createElement('div');
        node.className = 'dialogue-node';
        
        // Header with ID and actions
        const header = document.createElement('div');
        header.className = 'dialogue-header';
        header.innerHTML = `
            <div class="dialogue-id">${dialogue.id}</div>
            <div class="dialogue-actions">
                <button>Edit</button>
                <button>Duplicate</button>
                <button>Delete</button>
            </div>
        `;
        node.appendChild(header);
        
        // Conditions section
        if (dialogue.conditions) {
            const conditions = document.createElement('div');
            conditions.className = 'dialogue-conditions';
            
            let conditionsHtml = '';
            
            if (dialogue.conditions.trustMin !== undefined) {
                conditionsHtml += `
                    <div class="condition-item">
                        <span class="condition-type">Trust Level:</span>
                        <span class="condition-value">${dialogue.conditions.trustMin}+</span>
                    </div>
                `;
            }
            
            if (dialogue.conditions.trustMax !== undefined) {
                conditionsHtml += `
                    <div class="condition-item">
                        <span class="condition-type">Max Trust:</span>
                        <span class="condition-value">${dialogue.conditions.trustMax}</span>
                    </div>
                `;
            }
            
            if (dialogue.conditions.timeOfDay) {
                conditionsHtml += `
                    <div class="condition-item">
                        <span class="condition-type">Time of Day:</span>
                        <span class="condition-value">${dialogue.conditions.timeOfDay}</span>
                    </div>
                `;
            }
            
            if (dialogue.conditions.requiredClues && dialogue.conditions.requiredClues.length > 0) {
                conditionsHtml += `
                    <div class="condition-item">
                        <span class="condition-type">Required Clues:</span>
                        <span class="condition-value">${dialogue.conditions.requiredClues.join(', ')}</span>
                    </div>
                `;
            }
            
            if (dialogue.conditions.previousDialogue) {
                conditionsHtml += `
                    <div class="condition-item">
                        <span class="condition-type">Previous Node:</span>
                        <span class="condition-value">${dialogue.conditions.previousDialogue}</span>
                    </div>
                `;
            }
            
            conditions.innerHTML = conditionsHtml;
            
            if (conditionsHtml) {
                node.appendChild(conditions);
            }
        }
        
        // Dialogue content
        const content = document.createElement('div');
        content.className = 'dialogue-content';
        
        // Get character name
        const character = this.characters[dialogue.character];
        const characterName = character ? character.name : dialogue.character;
        
        // Handle different text formats (string or array)
        let dialogueText = '';
        if (Array.isArray(dialogue.text)) {
            // For multi-trust-level text, show the first one
            dialogueText = dialogue.text[0];
            
            // Add note about multiple versions
            dialogueText += `<div style="margin-top: 10px; font-style: italic; color: var(--muted-text);">
                (${dialogue.text.length} trust-level variations available)
            </div>`;
        } else {
            dialogueText = dialogue.text;
        }
        
        content.innerHTML = `
            <div class="dialogue-speaker">${characterName.toUpperCase()}:</div>
            <div>${dialogueText}</div>
        `;
        node.appendChild(content);
        
        // Choices section
        if (dialogue.choices && dialogue.choices.length > 0) {
            const choices = document.createElement('div');
            choices.className = 'dialogue-choices';
            
            dialogue.choices.forEach(choice => {
                const choiceItem = document.createElement('div');
                choiceItem.className = 'choice-item';
                
                let consequenceHtml = '';
                
                if (choice.nextDialogue) {
                    consequenceHtml += `Go to: ${choice.nextDialogue}`;
                }
                
                if (choice.effects) {
                    if (choice.effects.trustChange) {
                        const trustClass = choice.effects.trustChange > 0 ? 
                            'consequence-trust-gain' : 'consequence-trust-loss';
                        
                        consequenceHtml += (consequenceHtml ? ', ' : '') + 
                            `<span class="${trustClass}">${choice.effects.trustChange > 0 ? '+' : ''}${choice.effects.trustChange} Trust</span>`;
                    }
                    
                    if (choice.effects.unlockClue) {
                        consequenceHtml += (consequenceHtml ? ', ' : '') +
                            `Unlock Clue: "${choice.effects.unlockClue}"`;
                    }
                }
                
                choiceItem.innerHTML = `
                    <div>${choice.text}</div>
                    ${consequenceHtml ? `<div class="consequence">${consequenceHtml}</div>` : ''}
                `;
                
                choices.appendChild(choiceItem);
            });
            
            node.appendChild(choices);
        }
        
        return node;
    }
    
    /**
     * Update the dialogue preview based on current settings
     */
    updateDialoguePreview() {
        if (!this.currentCharacterId) return;
        
        // Get appropriate dialogue based on current conditions
        const dialogueNode = this.dialogueSystem.startDialogue(this.currentCharacterId);
        
        if (!dialogueNode) {
            this.elements.previewSection.innerHTML = `
                <div class="preview-speaker">No available dialogue</div>
                <div class="preview-text">
                    No dialogue matches the current conditions.
                    Try adjusting trust level or adding clues.
                </div>
            `;
            return;
        }
        
        this.currentDialogueId = dialogueNode.id;
        
        // Get character details
        const character = this.characters[this.currentCharacterId];
        const characterName = character ? character.name : this.currentCharacterId;
        
        // Create the preview HTML
        let previewHTML = `
            <div class="preview-portrait" style="background-color: 
                ${this.getCharacterColor(this.currentCharacterId)};"></div>
            <div class="preview-dialogue">
                <div class="preview-speaker">${characterName.toUpperCase()}:</div>
                <div class="preview-text">${dialogueNode.text}</div>
        `;
        
        // Add choices if available
        if (dialogueNode.choices && dialogueNode.choices.length > 0) {
            previewHTML += '<div class="preview-choices">';
            
            dialogueNode.choices.forEach(choice => {
                previewHTML += `
                    <div class="preview-choice" data-choice-id="${choice.id}">
                        ${choice.text}
                    </div>
                `;
            });
            
            previewHTML += '</div>';
        }
        
        previewHTML += '</div>';
        
        this.elements.previewSection.innerHTML = previewHTML;
    }
    
    /**
     * Handle clicking a dialogue choice in the preview
     * @param {HTMLElement} choiceElement - The clicked choice element
     */
    handlePreviewChoice(choiceElement) {
        const choiceId = choiceElement.dataset.choiceId;
        
        if (!choiceId || !this.currentDialogueId) return;
        
        // Get the next dialogue node
        const nextNode = this.dialogueSystem.selectChoice(choiceId);
        
        // If there's a next node, update the preview
        if (nextNode) {
            this.updateDialoguePreview();
        } else {
            // End of dialogue
            this.elements.previewSection.innerHTML = `
                <div class="preview-text">
                    End of dialogue. 
                    <button id="resetPreviewBtn" class="secondary">Reset</button>
                </div>
            `;
        }
    }
    
    /**
     * Reset the dialogue preview to the initial state
     */
    resetDialoguePreview() {
        this.currentDialogueId = null;
        this.updateDialoguePreview();
    }
    
    /**
     * Get a deterministic color for a character
     * @param {string} characterId - The character ID
     * @returns {string} A CSS color
     */
    getCharacterColor(characterId) {
        const colors = [
            '#e57373', // red
            '#64b5f6', // blue
            '#81c784', // green
            '#9575cd', // purple
            '#ffb74d'  // orange
        ];
        
        const characterIndex = {
            'mrs_finch': 0,
            'jake': 1,
            'camille': 2,
            'mr_arnold': 3,
            'lila': 4
        };
        
        const index = characterIndex[characterId] !== undefined ?
            characterIndex[characterId] : 
            characterId.charCodeAt(0) % colors.length;
            
        return colors[index];
    }
    
    /**
     * Add a trait to a character
     * @param {string} characterId - The character to modify
     * @param {string} trait - The trait to add
     */
    addCharacterTrait(characterId, trait) {
        const character = this.characters[characterId];
        if (!character) return;
        
        // Initialize traits array if needed
        if (!character.traits) {
            character.traits = [];
        }
        
        // Don't add duplicates
        if (!character.traits.includes(trait)) {
            character.traits.push(trait);
            this.updatePersonalitySection(characterId);
        }
    }
    
    /**
     * Remove a trait from a character
     * @param {string} characterId - The character to modify
     * @param {string} trait - The trait to remove
     */
    removeCharacterTrait(characterId, trait) {
        const character = this.characters[characterId];
        if (!character || !character.traits) return;
        
        const index = character.traits.indexOf(trait);
        if (index !== -1) {
            character.traits.splice(index, 1);
            this.updatePersonalitySection(characterId);
        }
    }
    
    /**
     * Show form to edit character personality
     */
    showEditPersonalityForm() {
        if (!this.currentCharacterId) return;
        
        const character = this.characters[this.currentCharacterId];
        
        // Create modal form
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Edit Personality: ${character.name || this.currentCharacterId}</h3>
                
                <div class="form-group">
                    <label for="character-name">Name</label>
                    <input type="text" id="character-name" value="${character.name || ''}">
                </div>
                
                <div class="form-group">
                    <label for="character-archetype">Archetype</label>
                    <input type="text" id="character-archetype" value="${character.archetype || ''}">
                </div>
                
                <div class="form-group">
                    <label for="character-hidden-layer">Hidden Layer (High Trust Reveal)</label>
                    <input type="text" id="character-hidden-layer" value="${character.hiddenLayer || ''}">
                </div>
                
                <div class="form-group">
                    <label>Trust Thresholds</label>
                    <div class="trust-thresholds-inputs">
                        <input type="number" id="threshold-0" min="0" max="100" value="${character.trustThresholds?.[0] || 0}">
                        <input type="number" id="threshold-1" min="0" max="100" value="${character.trustThresholds?.[1] || 25}">
                        <input type="number" id="threshold-2" min="0" max="100" value="${character.trustThresholds?.[2] || 50}">
                        <input type="number" id="threshold-3" min="0" max="100" value="${character.trustThresholds?.[3] || 75}">
                    </div>
                </div>
                
                <div class="form-actions">
                    <button id="cancel-edit-personality" class="secondary">Cancel</button>
                    <button id="save-edit-personality">Save Changes</button>
                </div>
            </div>
        `;
        
        // Add modal styles if not present
        if (!document.querySelector('#modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                .modal-content {
                    background-color: var(--secondary-bg);
                    border-radius: 8px;
                    padding: 20px;
                    width: 80%;
                    max-width: 600px;
                }
                
                .modal h3 {
                    color: var(--accent);
                    margin-bottom: 20px;
                }
                
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }
                
                .trust-thresholds-inputs {
                    display: flex;
                    gap: 10px;
                }
                
                .trust-thresholds-inputs input {
                    width: 70px;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(modal);
        
        // Handle form actions
        document.getElementById('cancel-edit-personality').addEventListener('click', () => {
            modal.remove();
        });
        
        document.getElementById('save-edit-personality').addEventListener('click', () => {
            // Get form values
            const name = document.getElementById('character-name').value;
            const archetype = document.getElementById('character-archetype').value;
            const hiddenLayer = document.getElementById('character-hidden-layer').value;
            
            const thresholds = [
                parseInt(document.getElementById('threshold-0').value),
                parseInt(document.getElementById('threshold-1').value),
                parseInt(document.getElementById('threshold-2').value),
                parseInt(document.getElementById('threshold-3').value)
            ];
            
            // Update character
            character.name = name;
            character.archetype = archetype;
            character.hiddenLayer = hiddenLayer;
            character.trustThresholds = thresholds;
            
            // Update UI
            this.updatePersonalitySection(this.currentCharacterId);
            
            // Close modal
            modal.remove();
        });
    }
    
    /**
     * Show form to add a new dialogue
     */
    showAddDialogueForm() {
        // Implement dialogue form
        alert('Add dialogue form would appear here');
        // In a real implementation, this would show a form to add a new dialogue
    }
    
    /**
     * Show form to edit an existing dialogue
     * @param {string} dialogueId - The dialogue to edit
     */
    showEditDialogueForm(dialogueId) {
        // Implement dialogue edit form
        alert(`Edit dialogue form for ${dialogueId} would appear here`);
        // In a real implementation, this would show a form to edit the dialogue
    }
    
    /**
     * Duplicate a dialogue
     * @param {string} dialogueId - The dialogue to duplicate
     */
    duplicateDialogue(dialogueId) {
        // Implement dialogue duplication
        alert(`Duplicate dialogue ${dialogueId}`);
        // In a real implementation, this would duplicate the dialogue
    }
    
    /**
     * Delete a dialogue
     * @param {string} dialogueId - The dialogue to delete
     */
    deleteDialogue(dialogueId) {
        if (confirm(`Are you sure you want to delete dialogue "${dialogueId}"?`)) {
            // Implement dialogue deletion
            alert(`Delete dialogue ${dialogueId}`);
            // In a real implementation, this would delete the dialogue
        }
    }
    
    /**
     * Export all dialogue data
     */
    exportData() {
        const data = this.dialogueSystem.exportData();
        
        // Convert to JSON string
        const jsonString = JSON.stringify(data, null, 2);
        
        // Create a temporary textarea to copy data
        const textarea = document.createElement('textarea');
        textarea.value = jsonString;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        alert('Dialogue data has been copied to clipboard.');
        
        // Alternative: download as a file
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'maplewood-dialogue-data.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize editor when page is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for dialogue system to be available
    if (typeof DialogueSystem !== 'undefined') {
        window.dialogueEditor = new DialogueEditor();
    } else {
        console.error('DialogueSystem not found. Make sure neighbor-dialogue-system.js is loaded first.');
    }
}); 