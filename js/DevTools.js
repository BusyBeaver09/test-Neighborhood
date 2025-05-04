/**
 * DevTools.js - Debugging and development tools for Maplewood Lane
 * Includes tools for companion system testing and debugging
 */
class DevTools {
    constructor(game) {
        this.game = game;
        this.visible = false;
        this.panels = [
            'general',
            'timeControls',
            'mapControls',
            'relationshipControls',
            'companionControls',
            'clueTesting'
        ];
        this.activePanel = 'general';
        
        this.initialize();
    }
    
    /**
     * Initialize the dev tools panel and event listeners
     */
    initialize() {
        // Create dev tools panel element
        this.devPanel = document.createElement('div');
        this.devPanel.className = 'dev-tools-panel';
        this.devPanel.style.display = 'none';
        document.body.appendChild(this.devPanel);
        
        // Add event listener for toggle key (default: backtick/tilde key)
        document.addEventListener('keydown', (e) => {
            if (e.key === '`' || e.key === '~') {
                this.toggleDevTools();
            }
        });
        
        this.buildDevPanel();
        console.log('DevTools initialized');
    }
    
    /**
     * Toggle visibility of the dev tools panel
     */
    toggleDevTools() {
        this.visible = !this.visible;
        this.devPanel.style.display = this.visible ? 'block' : 'none';
        
        // Pause game timers when dev tools are open
        if (this.visible) {
            // TODO: Pause game timers if needed
            console.log('DevTools opened - game paused');
        } else {
            // TODO: Resume game timers if needed
            console.log('DevTools closed - game resumed');
        }
    }
    
    /**
     * Build the content of the dev tools panel
     */
    buildDevPanel() {
        let panelContent = `
            <div class="dev-tools-header">
                <h2>Developer Tools</h2>
                <button id="dev-tools-close">×</button>
            </div>
            <div class="dev-tabs">
        `;
        
        // Add tabs
        this.panels.forEach(panel => {
            const isActive = panel === this.activePanel;
            panelContent += `
                <button class="dev-tab ${isActive ? 'active' : ''}" 
                        data-panel="${panel}">
                    ${this.formatPanelName(panel)}
                </button>
            `;
        });
        
        panelContent += `</div><div class="dev-panel-content">`;
        
        // Add panel content sections (only the active one will be displayed)
        this.panels.forEach(panel => {
            const isActive = panel === this.activePanel;
            panelContent += `
                <div class="dev-panel-section ${isActive ? 'active' : ''}" 
                     id="dev-panel-${panel}">
                    ${this.getPanelContent(panel)}
                </div>
            `;
        });
        
        panelContent += `</div>`;
        this.devPanel.innerHTML = panelContent;
        
        // Add event listeners
        this.addEventListeners();
    }
    
    /**
     * Format panel name for display (capitalize, add spaces)
     * @param {string} name - Panel name in camelCase
     * @returns {string} - Formatted name
     */
    formatPanelName(name) {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }
    
    /**
     * Add event listeners to dev panel elements
     */
    addEventListeners() {
        // Close button
        document.getElementById('dev-tools-close').addEventListener('click', () => {
            this.toggleDevTools();
        });
        
        // Tab switching
        document.querySelectorAll('.dev-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const panelId = e.target.dataset.panel;
                this.switchPanel(panelId);
            });
        });
        
        // Add specific control event listeners based on active panel
        this.addPanelEventListeners(this.activePanel);
    }
    
    /**
     * Switch active panel
     * @param {string} panelId - ID of the panel to switch to
     */
    switchPanel(panelId) {
        if (!this.panels.includes(panelId)) return;
        
        // Update active panel
        this.activePanel = panelId;
        
        // Update UI
        document.querySelectorAll('.dev-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.panel === panelId);
        });
        
        document.querySelectorAll('.dev-panel-section').forEach(section => {
            section.classList.toggle('active', section.id === `dev-panel-${panelId}`);
        });
        
        // Add specific panel event listeners
        this.addPanelEventListeners(panelId);
    }
    
    /**
     * Generate content for a specific panel
     * @param {string} panel - Panel ID
     * @returns {string} - HTML content for the panel
     */
    getPanelContent(panel) {
        switch (panel) {
            case 'general':
                return `
                    <h3>General Controls</h3>
                    <div class="dev-control-group">
                        <button id="dev-save-game">Save Game State</button>
                        <button id="dev-load-game">Load Last Save</button>
                        <button id="dev-reset-game">Reset Game</button>
                    </div>
                    <div class="dev-control-group">
                        <button id="dev-unlock-all">Unlock All Locations</button>
                        <button id="dev-find-all">Find All Clues</button>
                    </div>
                    <div class="dev-status">
                        <p>Game Version: ${this.game.gameVersion || '1.0.0'}</p>
                        <p id="dev-status-message">Developer Mode Active</p>
                    </div>
                `;
                
            case 'timeControls':
                return `
                    <h3>Time Controls</h3>
                    <div class="dev-control-group">
                        <p>Current Time: <span id="dev-current-time">6:00 AM</span></p>
                        <button id="dev-time-morning">Set to Morning</button>
                        <button id="dev-time-day">Set to Day</button>
                        <button id="dev-time-evening">Set to Evening</button>
                        <button id="dev-time-night">Set to Night</button>
                    </div>
                    <div class="dev-control-group">
                        <label>Skip ahead:
                            <select id="dev-time-skip">
                                <option value="1">1 hour</option>
                                <option value="3">3 hours</option>
                                <option value="6">6 hours</option>
                                <option value="12">12 hours</option>
                                <option value="24">1 day</option>
                            </select>
                        </label>
                        <button id="dev-time-skip-btn">Skip Time</button>
                    </div>
                `;
                
            case 'mapControls':
                return `
                    <h3>Map Controls</h3>
                    <div class="dev-control-group">
                        <label>Teleport to:
                            <select id="dev-teleport-location">
                                <option value="player_house">Elia's House</option>
                                <option value="iris_house">Iris's House</option>
                                <option value="town_square">Town Square</option>
                                <option value="abandoned_house">Abandoned House</option>
                                <option value="forest_path">Forest Path</option>
                                <option value="old_well">Old Well</option>
                                <option value="library">Library</option>
                                <option value="art_studio">Art Studio</option>
                                <option value="newspaper_office">Newspaper Office</option>
                            </select>
                        </label>
                        <button id="dev-teleport-btn">Teleport</button>
                    </div>
                    <div class="dev-control-group">
                        <button id="dev-show-all-markers">Show All Map Markers</button>
                        <button id="dev-hide-all-markers">Hide All Map Markers</button>
                    </div>
                `;
                
            case 'relationshipControls':
                return `
                    <h3>Relationship Controls</h3>
                    <div class="dev-control-group">
                        <p>Current Trust Level: <span id="dev-trust-level">0</span></p>
                        <button id="dev-trust-add-5">+5 Trust</button>
                        <button id="dev-trust-add-10">+10 Trust</button>
                        <button id="dev-trust-add-25">+25 Trust</button>
                        <button id="dev-trust-reset">Reset Trust</button>
                    </div>
                    <div class="dev-control-group">
                        <label>Set Character Relationship:
                            <select id="dev-character-select">
                                <option value="mrs_finch">Mrs. Finch</option>
                                <option value="mr_arnold">Mr. Arnold</option>
                                <option value="jake_lila">Jake & Lila</option>
                                <option value="camille">Camille</option>
                                <option value="sam">Sam</option>
                            </select>
                        </label>
                        <label>Relationship Level:
                            <select id="dev-relationship-level">
                                <option value="1">Level 1 (Stranger)</option>
                                <option value="2">Level 2 (Acquaintance)</option>
                                <option value="3">Level 3 (Friend)</option>
                                <option value="4">Level 4 (Trusted)</option>
                                <option value="5">Level 5 (Confidant)</option>
                            </select>
                        </label>
                        <button id="dev-set-relationship">Set Relationship</button>
                    </div>
                `;
                
            case 'companionControls':
                return `
                    <h3>Companion System Controls</h3>
                    <div class="dev-companion-tools">
                        <h3>Test Companion Features</h3>
                        <p>Current Companion: <span id="dev-current-companion">None</span></p>
                        <select id="dev-companion-select">
                            <option value="camille">Camille (Art Teacher)</option>
                            <option value="jake">Jake (Handyman)</option>
                            <option value="lila">Lila (Journalist)</option>
                        </select>
                        <button id="dev-add-companion">Force Add Companion</button>
                        <button id="dev-dismiss-companion">Dismiss Companion</button>
                        <button id="dev-use-ability">Use Companion Ability</button>
                        <button id="dev-show-notes">Show Companion Notes</button>
                    </div>
                    <div class="dev-companion-tools">
                        <h3>Test Interactions</h3>
                        <button id="dev-spot-hidden">Test Camille's Hidden Drawing</button>
                        <button id="dev-test-shortcut">Test Jake's Shortcut</button>
                        <button id="dev-test-records">Test Lila's Records Access</button>
                    </div>
                `;
                
            case 'clueTesting':
                return `
                    <h3>Clue Testing</h3>
                    <div class="dev-control-group">
                        <label>Add Test Clue:
                            <select id="dev-clue-select">
                                <option value="hidden_drawing_fragment">Hidden Drawing Fragment</option>
                                <option value="locked_gate">Locked Gate</option>
                                <option value="missing_records">Missing Records</option>
                                <option value="artist_connection">Artist Connection</option>
                                <option value="property_records">Property Records</option>
                                <option value="basement_entrance">Basement Entrance</option>
                            </select>
                        </label>
                        <button id="dev-add-clue">Add Selected Clue</button>
                        <button id="dev-clear-clues">Clear All Clues</button>
                    </div>
                    <div class="dev-control-group">
                        <label>Place Test Item:
                            <select id="dev-item-select">
                                <option value="hidden_drawing">Hidden Drawing</option>
                                <option value="hidden_shortcut">Hidden Shortcut</option>
                                <option value="restricted_info">Restricted Information</option>
                            </select>
                        </label>
                        <button id="dev-place-item">Place Item At Player</button>
                    </div>
                `;
                
            default:
                return `<p>No content for this panel.</p>`;
        }
    }
    
    /**
     * Add event listeners specific to a panel
     * @param {string} panelId - ID of the panel
     */
    addPanelEventListeners(panelId) {
        switch (panelId) {
            case 'general':
                document.getElementById('dev-reset-game')?.addEventListener('click', () => {
                    this.game.resetGame();
                    document.getElementById('dev-status-message').textContent = 'Game reset!';
                });
                document.getElementById('dev-unlock-all')?.addEventListener('click', () => {
                    // Add code to unlock all locations
                    document.getElementById('dev-status-message').textContent = 'All locations unlocked!';
                });
                document.getElementById('dev-find-all')?.addEventListener('click', () => {
                    // Add code to find all clues
                    document.getElementById('dev-status-message').textContent = 'All clues discovered!';
                });
                break;
                
            case 'timeControls':
                document.getElementById('dev-time-morning')?.addEventListener('click', () => {
                    this.game.timeManager.setTime(6, 0); // 6:00 AM
                    this.updateTimeDisplay();
                });
                document.getElementById('dev-time-day')?.addEventListener('click', () => {
                    this.game.timeManager.setTime(12, 0); // 12:00 PM
                    this.updateTimeDisplay();
                });
                document.getElementById('dev-time-evening')?.addEventListener('click', () => {
                    this.game.timeManager.setTime(18, 0); // 6:00 PM
                    this.updateTimeDisplay();
                });
                document.getElementById('dev-time-night')?.addEventListener('click', () => {
                    this.game.timeManager.setTime(22, 0); // 10:00 PM
                    this.updateTimeDisplay();
                });
                document.getElementById('dev-time-skip-btn')?.addEventListener('click', () => {
                    const hours = parseInt(document.getElementById('dev-time-skip').value);
                    this.game.timeManager.advanceTime(hours);
                    this.updateTimeDisplay();
                });
                this.updateTimeDisplay();
                break;
                
            case 'relationshipControls':
                document.getElementById('dev-trust-add-5')?.addEventListener('click', () => {
                    this.game.relationshipManager.changeTrust(5);
                    this.updateTrustDisplay();
                });
                document.getElementById('dev-trust-add-10')?.addEventListener('click', () => {
                    this.game.relationshipManager.changeTrust(10);
                    this.updateTrustDisplay();
                });
                document.getElementById('dev-trust-add-25')?.addEventListener('click', () => {
                    this.game.relationshipManager.changeTrust(25);
                    this.updateTrustDisplay();
                });
                document.getElementById('dev-trust-reset')?.addEventListener('click', () => {
                    this.game.relationshipManager.setTrust(0);
                    this.updateTrustDisplay();
                });
                document.getElementById('dev-set-relationship')?.addEventListener('click', () => {
                    const character = document.getElementById('dev-character-select').value;
                    const level = parseInt(document.getElementById('dev-relationship-level').value);
                    // Set relationship level
                    this.game.relationshipManager.setRelationshipLevel(character, level);
                });
                this.updateTrustDisplay();
                break;
                
            case 'companionControls':
                this.updateCompanionDisplay();
                document.getElementById('dev-add-companion')?.addEventListener('click', () => {
                    const companionId = document.getElementById('dev-companion-select').value;
                    if (this.game.companionSystem.forceAddCompanion(companionId)) {
                        this.updateCompanionDisplay();
                    }
                });
                document.getElementById('dev-dismiss-companion')?.addEventListener('click', () => {
                    this.game.companionSystem.dismissCompanion();
                    this.updateCompanionDisplay();
                });
                document.getElementById('dev-use-ability')?.addEventListener('click', () => {
                    this.game.companionSystem.activateCompanionAbility();
                });
                document.getElementById('dev-show-notes')?.addEventListener('click', () => {
                    const currentCompanion = this.game.companionSystem.getCurrentCompanion();
                    if (currentCompanion) {
                        this.game.companionSystem.showCompanionNotes(currentCompanion);
                    }
                });
                document.getElementById('dev-spot-hidden')?.addEventListener('click', () => {
                    this.createTestCompanionItem('hidden-drawing');
                });
                document.getElementById('dev-test-shortcut')?.addEventListener('click', () => {
                    this.createTestCompanionItem('hidden-shortcut');
                });
                document.getElementById('dev-test-records')?.addEventListener('click', () => {
                    this.createTestCompanionItem('restricted-info');
                });
                break;
                
            case 'clueTesting':
                document.getElementById('dev-add-clue')?.addEventListener('click', () => {
                    const clue = document.getElementById('dev-clue-select').value;
                    this.game.addClueToNotebook(clue);
                });
                document.getElementById('dev-clear-clues')?.addEventListener('click', () => {
                    this.game.foundClues.clear();
                    this.game.updateCluesDisplay();
                });
                document.getElementById('dev-place-item')?.addEventListener('click', () => {
                    const itemType = document.getElementById('dev-item-select').value;
                    this.createTestCompanionItem(itemType);
                });
                break;
        }
    }
    
    /**
     * Update time display in the dev panel
     */
    updateTimeDisplay() {
        const timeDisplay = document.getElementById('dev-current-time');
        if (timeDisplay && this.game.timeManager) {
            timeDisplay.textContent = this.game.timeManager.getFormattedTime();
        }
    }
    
    /**
     * Update trust display in the dev panel
     */
    updateTrustDisplay() {
        const trustDisplay = document.getElementById('dev-trust-level');
        if (trustDisplay && this.game.relationshipManager) {
            trustDisplay.textContent = this.game.relationshipManager.getTrustLevel();
        }
    }
    
    /**
     * Update companion display in the dev panel
     */
    updateCompanionDisplay() {
        const companionDisplay = document.getElementById('dev-current-companion');
        if (companionDisplay && this.game.companionSystem) {
            const currentCompanion = this.game.companionSystem.getCurrentCompanion();
            if (currentCompanion) {
                const companion = this.game.companionSystem.availableCompanions[currentCompanion];
                companionDisplay.textContent = companion.name;
            } else {
                companionDisplay.textContent = 'None';
            }
        }
    }
    
    /**
     * Create a test item for companion ability testing
     * @param {string} type - Type of item to create
     */
    createTestCompanionItem(type) {
        // Create a test item near the player
        const player = document.querySelector('.player');
        if (!player) return;
        
        const playerRect = player.getBoundingClientRect();
        const item = document.createElement('div');
        
        item.className = type;
        item.style.position = 'absolute';
        item.style.left = (playerRect.left + 50) + 'px';
        item.style.top = playerRect.top + 'px';
        item.style.width = '20px';
        item.style.height = '20px';
        item.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        item.style.border = '1px solid #e94560';
        item.style.zIndex = '5';
        
        // Different visuals depending on type
        switch (type) {
            case 'hidden-drawing':
                item.style.backgroundImage = 'url(../assets/items/hidden_drawing.png)';
                item.style.opacity = '0.3';
                break;
            case 'hidden-shortcut':
                item.style.backgroundImage = 'url(../assets/items/shortcut.png)';
                item.style.opacity = '0.3';
                break;
            case 'restricted-info':
                item.style.backgroundImage = 'url(../assets/items/document.png)';
                item.style.border = '1px dashed #e94560';
                break;
        }
        
        document.querySelector('.game-board').appendChild(item);
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DevTools;
} 