/**
 * DialogueEditor.js
 * 
 * A lightweight editor for creating and testing dialogue trees
 */

class DialogueEditor {
    constructor() {
        this.dialogueData = {
            characters: {}
        };
        this.currentCharacter = null;
        this.currentDialogue = null;
        
        // Create DOM elements
        this.createEditorUI();
        this.setupEventListeners();
    }
    
    createEditorUI() {
        // Main container
        this.container = document.createElement('div');
        this.container.className = 'dialogue-editor';
        
        // Characters panel
        this.charactersPanel = document.createElement('div');
        this.charactersPanel.className = 'editor-panel characters-panel';
        
        const characterHeader = document.createElement('h3');
        characterHeader.textContent = 'Characters';
        this.charactersPanel.appendChild(characterHeader);
        
        this.charactersList = document.createElement('div');
        this.charactersList.className = 'characters-list';
        this.charactersPanel.appendChild(this.charactersList);
        
        const addCharacterBtn = document.createElement('button');
        addCharacterBtn.textContent = 'Add Character';
        addCharacterBtn.addEventListener('click', () => this.addNewCharacter());
        this.charactersPanel.appendChild(addCharacterBtn);
        
        // Dialogues panel
        this.dialoguesPanel = document.createElement('div');
        this.dialoguesPanel.className = 'editor-panel dialogues-panel';
        
        const dialogueHeader = document.createElement('h3');
        dialogueHeader.textContent = 'Dialogues';
        this.dialoguesPanel.appendChild(dialogueHeader);
        
        this.dialoguesList = document.createElement('div');
        this.dialoguesList.className = 'dialogues-list';
        this.dialoguesPanel.appendChild(this.dialoguesList);
        
        const addDialogueBtn = document.createElement('button');
        addDialogueBtn.textContent = 'Add Dialogue';
        addDialogueBtn.addEventListener('click', () => this.addNewDialogue());
        this.dialoguesPanel.appendChild(addDialogueBtn);
        
        // Editor panel
        this.editorPanel = document.createElement('div');
        this.editorPanel.className = 'editor-panel dialogue-edit-panel';
        
        const editorHeader = document.createElement('h3');
        editorHeader.textContent = 'Edit Dialogue';
        this.editorPanel.appendChild(editorHeader);
        
        this.editorForm = document.createElement('div');
        this.editorForm.className = 'editor-form';
        this.editorForm.innerHTML = '<p>Select a dialogue from the list to edit</p>';
        this.editorPanel.appendChild(this.editorForm);
        
        // Import/Export panel
        this.ioPanel = document.createElement('div');
        this.ioPanel.className = 'editor-panel io-panel';
        
        const ioHeader = document.createElement('h3');
        ioHeader.textContent = 'Import/Export';
        this.ioPanel.appendChild(ioHeader);
        
        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'Export JSON';
        exportBtn.addEventListener('click', () => this.exportJSON());
        this.ioPanel.appendChild(exportBtn);
        
        const importForm = document.createElement('div');
        importForm.className = 'import-form';
        
        const importTextarea = document.createElement('textarea');
        importTextarea.className = 'import-textarea';
        importTextarea.placeholder = 'Paste JSON here to import';
        importForm.appendChild(importTextarea);
        
        const importBtn = document.createElement('button');
        importBtn.textContent = 'Import JSON';
        importBtn.addEventListener('click', () => this.importJSON(importTextarea.value));
        importForm.appendChild(importBtn);
        
        this.ioPanel.appendChild(importForm);
        
        // Append all panels to container
        this.container.appendChild(this.charactersPanel);
        this.container.appendChild(this.dialoguesPanel);
        this.container.appendChild(this.editorPanel);
        this.container.appendChild(this.ioPanel);
        
        // Append to document
        document.body.appendChild(this.container);
        
        // Add styles
        this.addEditorStyles();
    }
    
    addEditorStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .dialogue-editor {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                padding: 20px;
                font-family: Arial, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .editor-panel {
                background-color: #f5f5f5;
                padding: 15px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                flex: 1;
                min-width: 250px;
            }
            
            .editor-panel h3 {
                margin-top: 0;
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
            }
            
            .characters-list, .dialogues-list {
                margin-bottom: 15px;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .character-item, .dialogue-item {
                padding: 8px 10px;
                margin-bottom: 5px;
                background-color: #fff;
                border-radius: 3px;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
            }
            
            .character-item:hover, .dialogue-item:hover {
                background-color: #e6f7ff;
            }
            
            .character-item.selected, .dialogue-item.selected {
                background-color: #1890ff;
                color: white;
            }
            
            .editor-form {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .form-group label {
                font-weight: bold;
                font-size: 0.9em;
            }
            
            .form-group input, .form-group textarea, .form-group select {
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 3px;
            }
            
            .form-group textarea {
                min-height: 100px;
                font-family: inherit;
            }
            
            .choices-container {
                border: 1px solid #ddd;
                padding: 10px;
                border-radius: 3px;
                margin-top: 5px;
            }
            
            .choice-item {
                background-color: #f9f9f9;
                padding: 10px;
                margin-bottom: 10px;
                border-radius: 3px;
                position: relative;
            }
            
            .delete-btn {
                background-color: #ff4d4f;
                color: white;
                border: none;
                border-radius: 3px;
                padding: 5px 8px;
                cursor: pointer;
            }
            
            .add-btn {
                background-color: #52c41a;
                color: white;
                border: none;
                border-radius: 3px;
                padding: 8px 12px;
                cursor: pointer;
                margin-top: 5px;
            }
            
            button {
                padding: 8px 12px;
                background-color: #1890ff;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
                margin-right: 5px;
            }
            
            button:hover {
                background-color: #40a9ff;
            }
            
            .import-textarea {
                width: 100%;
                min-height: 100px;
                margin-bottom: 10px;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 3px;
                font-family: monospace;
            }
            
            .dialogue-edit-panel, .io-panel {
                flex-basis: 100%;
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    setupEventListeners() {
        // Event listeners will be added when interacting with specific elements
    }
    
    updateCharactersList() {
        this.charactersList.innerHTML = '';
        
        Object.keys(this.dialogueData.characters).forEach(characterId => {
            const character = this.dialogueData.characters[characterId];
            const characterItem = document.createElement('div');
            characterItem.className = 'character-item';
            if (this.currentCharacter === characterId) {
                characterItem.classList.add('selected');
            }
            
            characterItem.textContent = character.name || characterId;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'X';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCharacter(characterId);
            });
            
            characterItem.appendChild(deleteBtn);
            characterItem.addEventListener('click', () => this.selectCharacter(characterId));
            this.charactersList.appendChild(characterItem);
        });
    }
    
    updateDialoguesList() {
        this.dialoguesList.innerHTML = '';
        
        if (!this.currentCharacter) {
            this.dialoguesList.innerHTML = '<p>Select a character first</p>';
            return;
        }
        
        const character = this.dialogueData.characters[this.currentCharacter];
        if (!character || !character.dialogs || character.dialogs.length === 0) {
            this.dialoguesList.innerHTML = '<p>No dialogues for this character</p>';
            return;
        }
        
        character.dialogs.forEach((dialogue, index) => {
            const dialogueItem = document.createElement('div');
            dialogueItem.className = 'dialogue-item';
            if (this.currentDialogue === index) {
                dialogueItem.classList.add('selected');
            }
            
            dialogueItem.textContent = dialogue.id || `Dialogue ${index + 1}`;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'X';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteDialogue(index);
            });
            
            dialogueItem.appendChild(deleteBtn);
            dialogueItem.addEventListener('click', () => this.selectDialogue(index));
            this.dialoguesList.appendChild(dialogueItem);
        });
    }
    
    updateEditorForm() {
        if (!this.currentCharacter || this.currentDialogue === null) {
            this.editorForm.innerHTML = '<p>Select a dialogue from the list to edit</p>';
            return;
        }
        
        const character = this.dialogueData.characters[this.currentCharacter];
        const dialogue = character.dialogs[this.currentDialogue];
        
        this.editorForm.innerHTML = '';
        
        // ID
        const idGroup = document.createElement('div');
        idGroup.className = 'form-group';
        
        const idLabel = document.createElement('label');
        idLabel.textContent = 'Dialogue ID:';
        idGroup.appendChild(idLabel);
        
        const idInput = document.createElement('input');
        idInput.type = 'text';
        idInput.value = dialogue.id || '';
        idInput.addEventListener('change', () => {
            dialogue.id = idInput.value;
            this.updateDialoguesList();
        });
        idGroup.appendChild(idInput);
        
        this.editorForm.appendChild(idGroup);
        
        // Lines
        const linesGroup = document.createElement('div');
        linesGroup.className = 'form-group';
        
        const linesLabel = document.createElement('label');
        linesLabel.textContent = 'Lines (one per line):';
        linesGroup.appendChild(linesLabel);
        
        const linesInput = document.createElement('textarea');
        if (Array.isArray(dialogue.lines)) {
            linesInput.value = dialogue.lines.join('\n');
        } else if (dialogue.text) {
            linesInput.value = dialogue.text;
        } else {
            linesInput.value = '';
        }
        
        linesInput.addEventListener('change', () => {
            dialogue.lines = linesInput.value.split('\n').filter(line => line.trim());
            if (dialogue.lines.length === 1) {
                dialogue.text = dialogue.lines[0];
            }
        });
        linesGroup.appendChild(linesInput);
        
        this.editorForm.appendChild(linesGroup);
        
        // Mood
        const moodGroup = document.createElement('div');
        moodGroup.className = 'form-group';
        
        const moodLabel = document.createElement('label');
        moodLabel.textContent = 'Mood:';
        moodGroup.appendChild(moodLabel);
        
        const moodSelect = document.createElement('select');
        const moods = ['', 'mysterious', 'urgent', 'friendly', 'suspicious'];
        
        moods.forEach(mood => {
            const option = document.createElement('option');
            option.value = mood;
            option.textContent = mood || 'None';
            option.selected = dialogue.mood === mood;
            moodSelect.appendChild(option);
        });
        
        moodSelect.addEventListener('change', () => {
            if (moodSelect.value) {
                dialogue.mood = moodSelect.value;
            } else {
                delete dialogue.mood;
            }
        });
        moodGroup.appendChild(moodSelect);
        
        this.editorForm.appendChild(moodGroup);
        
        // Conditions
        const conditionsGroup = document.createElement('div');
        conditionsGroup.className = 'form-group';
        
        const conditionsLabel = document.createElement('label');
        conditionsLabel.textContent = 'Conditions:';
        conditionsGroup.appendChild(conditionsLabel);
        
        const conditions = dialogue.conditions || {};
        
        // Trust Min
        const trustMinGroup = document.createElement('div');
        trustMinGroup.className = 'form-group';
        
        const trustMinLabel = document.createElement('label');
        trustMinLabel.textContent = 'Minimum Trust:';
        trustMinGroup.appendChild(trustMinLabel);
        
        const trustMinInput = document.createElement('input');
        trustMinInput.type = 'number';
        trustMinInput.value = conditions.trustMin || '';
        trustMinInput.addEventListener('change', () => {
            if (!dialogue.conditions) dialogue.conditions = {};
            if (trustMinInput.value) {
                dialogue.conditions.trustMin = parseInt(trustMinInput.value);
            } else {
                delete dialogue.conditions.trustMin;
            }
        });
        trustMinGroup.appendChild(trustMinInput);
        
        conditionsGroup.appendChild(trustMinGroup);
        
        // Trust Max
        const trustMaxGroup = document.createElement('div');
        trustMaxGroup.className = 'form-group';
        
        const trustMaxLabel = document.createElement('label');
        trustMaxLabel.textContent = 'Maximum Trust:';
        trustMaxGroup.appendChild(trustMaxLabel);
        
        const trustMaxInput = document.createElement('input');
        trustMaxInput.type = 'number';
        trustMaxInput.value = conditions.trustMax || '';
        trustMaxInput.addEventListener('change', () => {
            if (!dialogue.conditions) dialogue.conditions = {};
            if (trustMaxInput.value) {
                dialogue.conditions.trustMax = parseInt(trustMaxInput.value);
            } else {
                delete dialogue.conditions.trustMax;
            }
        });
        trustMaxGroup.appendChild(trustMaxInput);
        
        conditionsGroup.appendChild(trustMaxGroup);
        
        // Time of Day
        const timeGroup = document.createElement('div');
        timeGroup.className = 'form-group';
        
        const timeLabel = document.createElement('label');
        timeLabel.textContent = 'Time of Day:';
        timeGroup.appendChild(timeLabel);
        
        const timeSelect = document.createElement('select');
        const times = ['', 'morning', 'afternoon', 'evening', 'night'];
        
        times.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time || 'Any';
            option.selected = conditions.timeOfDay === time;
            timeSelect.appendChild(option);
        });
        
        timeSelect.addEventListener('change', () => {
            if (!dialogue.conditions) dialogue.conditions = {};
            if (timeSelect.value) {
                dialogue.conditions.timeOfDay = timeSelect.value;
            } else {
                delete dialogue.conditions.timeOfDay;
            }
        });
        timeGroup.appendChild(timeSelect);
        
        conditionsGroup.appendChild(timeGroup);
        
        this.editorForm.appendChild(conditionsGroup);
        
        // Choices
        const choicesGroup = document.createElement('div');
        choicesGroup.className = 'form-group';
        
        const choicesLabel = document.createElement('label');
        choicesLabel.textContent = 'Choices:';
        choicesGroup.appendChild(choicesLabel);
        
        const choicesContainer = document.createElement('div');
        choicesContainer.className = 'choices-container';
        
        if (!dialogue.choices) {
            dialogue.choices = [];
        }
        
        dialogue.choices.forEach((choice, index) => {
            const choiceItem = document.createElement('div');
            choiceItem.className = 'choice-item';
            
            // Text
            const textGroup = document.createElement('div');
            textGroup.className = 'form-group';
            
            const textLabel = document.createElement('label');
            textLabel.textContent = 'Text:';
            textGroup.appendChild(textLabel);
            
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.value = choice.text || '';
            textInput.addEventListener('change', () => {
                choice.text = textInput.value;
            });
            textGroup.appendChild(textInput);
            
            choiceItem.appendChild(textGroup);
            
            // Next
            const nextGroup = document.createElement('div');
            nextGroup.className = 'form-group';
            
            const nextLabel = document.createElement('label');
            nextLabel.textContent = 'Next:';
            nextGroup.appendChild(nextLabel);
            
            const nextInput = document.createElement('input');
            nextInput.type = 'text';
            nextInput.value = choice.next || '';
            nextInput.addEventListener('change', () => {
                choice.next = nextInput.value;
            });
            nextGroup.appendChild(nextInput);
            
            choiceItem.appendChild(nextGroup);
            
            // Effects
            const effectsHeader = document.createElement('h4');
            effectsHeader.textContent = 'Effects:';
            choiceItem.appendChild(effectsHeader);
            
            const effects = choice.effects || {};
            
            // Trust effect
            const trustEffectGroup = document.createElement('div');
            trustEffectGroup.className = 'form-group';
            
            const trustEffectLabel = document.createElement('label');
            trustEffectLabel.textContent = 'Trust Change:';
            trustEffectGroup.appendChild(trustEffectLabel);
            
            const trustEffectInput = document.createElement('input');
            trustEffectInput.type = 'number';
            trustEffectInput.value = effects.trust || '';
            trustEffectInput.addEventListener('change', () => {
                if (!choice.effects) choice.effects = {};
                if (trustEffectInput.value) {
                    choice.effects.trust = parseInt(trustEffectInput.value);
                } else {
                    delete choice.effects.trust;
                }
                if (Object.keys(choice.effects).length === 0) {
                    delete choice.effects;
                }
            });
            trustEffectGroup.appendChild(trustEffectInput);
            
            choiceItem.appendChild(trustEffectGroup);
            
            // Unlock clue
            const unlockGroup = document.createElement('div');
            unlockGroup.className = 'form-group';
            
            const unlockLabel = document.createElement('label');
            unlockLabel.textContent = 'Unlock Clue:';
            unlockGroup.appendChild(unlockLabel);
            
            const unlockInput = document.createElement('input');
            unlockInput.type = 'text';
            unlockInput.value = effects.unlockClue || '';
            unlockInput.addEventListener('change', () => {
                if (!choice.effects) choice.effects = {};
                if (unlockInput.value) {
                    choice.effects.unlockClue = unlockInput.value;
                } else {
                    delete choice.effects.unlockClue;
                }
                if (Object.keys(choice.effects).length === 0) {
                    delete choice.effects;
                }
            });
            unlockGroup.appendChild(unlockInput);
            
            choiceItem.appendChild(unlockGroup);
            
            // Requirements
            const requirementsHeader = document.createElement('h4');
            requirementsHeader.textContent = 'Requirements:';
            choiceItem.appendChild(requirementsHeader);
            
            // Photo requirement
            const photoReqGroup = document.createElement('div');
            photoReqGroup.className = 'form-group';
            
            const photoReqLabel = document.createElement('label');
            photoReqLabel.textContent = 'Requires Photo:';
            photoReqGroup.appendChild(photoReqLabel);
            
            const photoReqInput = document.createElement('input');
            photoReqInput.type = 'text';
            photoReqInput.value = choice.requiresPhoto || '';
            photoReqInput.addEventListener('change', () => {
                if (photoReqInput.value) {
                    choice.requiresPhoto = photoReqInput.value;
                } else {
                    delete choice.requiresPhoto;
                }
            });
            photoReqGroup.appendChild(photoReqInput);
            
            choiceItem.appendChild(photoReqGroup);
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete Choice';
            deleteBtn.addEventListener('click', () => {
                dialogue.choices.splice(index, 1);
                this.updateEditorForm();
            });
            
            choiceItem.appendChild(deleteBtn);
            
            choicesContainer.appendChild(choiceItem);
        });
        
        choicesGroup.appendChild(choicesContainer);
        
        // Add choice button
        const addChoiceBtn = document.createElement('button');
        addChoiceBtn.className = 'add-btn';
        addChoiceBtn.textContent = 'Add Choice';
        addChoiceBtn.addEventListener('click', () => {
            dialogue.choices.push({
                text: 'New choice',
                next: ''
            });
            this.updateEditorForm();
        });
        
        choicesGroup.appendChild(addChoiceBtn);
        
        this.editorForm.appendChild(choicesGroup);
        
        // Save button
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save Dialogue';
        saveBtn.addEventListener('click', () => {
            this.saveDialogue();
        });
        
        this.editorForm.appendChild(saveBtn);
    }
    
    addNewCharacter() {
        const id = prompt('Enter character ID (no spaces, lowercase):');
        if (!id) return;
        
        const name = prompt('Enter character name:');
        if (!name) return;
        
        this.dialogueData.characters[id] = {
            id,
            name,
            portrait: `portrait-${id.replace('_', '-')}`,
            dialogs: []
        };
        
        this.updateCharactersList();
        this.selectCharacter(id);
    }
    
    deleteCharacter(characterId) {
        if (confirm(`Delete character ${characterId}?`)) {
            delete this.dialogueData.characters[characterId];
            
            if (this.currentCharacter === characterId) {
                this.currentCharacter = null;
                this.currentDialogue = null;
            }
            
            this.updateCharactersList();
            this.updateDialoguesList();
            this.updateEditorForm();
        }
    }
    
    selectCharacter(characterId) {
        this.currentCharacter = characterId;
        this.currentDialogue = null;
        this.updateCharactersList();
        this.updateDialoguesList();
        this.updateEditorForm();
    }
    
    addNewDialogue() {
        if (!this.currentCharacter) {
            alert('Select a character first');
            return;
        }
        
        const id = prompt('Enter dialogue ID (no spaces, lowercase):');
        if (!id) return;
        
        const character = this.dialogueData.characters[this.currentCharacter];
        
        character.dialogs.push({
            id,
            lines: ['New dialogue text'],
            choices: []
        });
        
        this.updateDialoguesList();
        this.selectDialogue(character.dialogs.length - 1);
    }
    
    deleteDialogue(index) {
        if (!this.currentCharacter) return;
        
        const character = this.dialogueData.characters[this.currentCharacter];
        const dialogueId = character.dialogs[index].id;
        
        if (confirm(`Delete dialogue ${dialogueId}?`)) {
            character.dialogs.splice(index, 1);
            
            if (this.currentDialogue === index) {
                this.currentDialogue = null;
            } else if (this.currentDialogue > index) {
                this.currentDialogue--;
            }
            
            this.updateDialoguesList();
            this.updateEditorForm();
        }
    }
    
    selectDialogue(index) {
        this.currentDialogue = index;
        this.updateDialoguesList();
        this.updateEditorForm();
    }
    
    saveDialogue() {
        // Nothing to do here as changes are applied directly
        alert('Dialogue saved successfully');
    }
    
    exportJSON() {
        const json = JSON.stringify(this.dialogueData, null, 2);
        
        // Create a download link
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dialogues-export.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    importJSON(jsonText) {
        try {
            const data = JSON.parse(jsonText);
            if (!data.characters) {
                throw new Error('Invalid dialogue data format');
            }
            
            this.dialogueData = data;
            this.currentCharacter = null;
            this.currentDialogue = null;
            
            this.updateCharactersList();
            this.updateDialoguesList();
            this.updateEditorForm();
            
            alert('Dialogue data imported successfully');
        } catch (error) {
            alert(`Error importing data: ${error.message}`);
        }
    }
}

// Usage example:
// const editor = new DialogueEditor(); 