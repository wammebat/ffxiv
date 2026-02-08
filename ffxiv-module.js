// ============================================
// FFXIV MODULE
// ============================================
// Contains all FFXIV-specific functionality

const FFXIVModule = {
    
    id: 'ffxiv',
    initialized: false,
    currentPage: 'all-relics',
    sidebarCollapsed: false,
    expandedSections: ['relics'],
    
    // FFXIV-specific data
    EXPANSIONS: [
        { id: 1, name: 'A Realm Reborn', shortName: 'ARR', year: 2013 },
        { id: 2, name: 'Heavensward', shortName: 'HW', year: 2015 },
        { id: 3, name: 'Stormblood', shortName: 'SB', year: 2017 },
        { id: 4, name: 'Shadowbringers', shortName: 'ShB', year: 2019 },
        { id: 5, name: 'Endwalker', shortName: 'EW', year: 2021 },
        { id: 6, name: 'Dawntrail', shortName: 'DT', year: 2024 }
    ],
    
    DEFAULT_RELICS: [
        { id: 1, name: 'Curtana Zenith', job: 'Paladin', stage: 'Zenith', expansionId: 1, collected: true, dateCollected: '2024-01-15', notes: 'Finally done!' },
        { id: 2, name: 'Holy Shield Zenith', job: 'Paladin', stage: 'Zenith', expansionId: 1, collected: true, dateCollected: '2024-01-15', notes: 'Matches Curtana' },
        { id: 3, name: 'Sphairai Zenith', job: 'Monk', stage: 'Zenith', expansionId: 1, collected: false, dateCollected: null, notes: '' },
        { id: 4, name: 'Bravura Zenith', job: 'Warrior', stage: 'Zenith', expansionId: 1, collected: true, dateCollected: '2024-02-03', notes: '' },
        { id: 5, name: 'Gae Bolg Zenith', job: 'Dragoon', stage: 'Zenith', expansionId: 1, collected: false, dateCollected: null, notes: '' },
        { id: 6, name: 'Yoshimitsu Zenith', job: 'Ninja', stage: 'Zenith', expansionId: 1, collected: false, dateCollected: null, notes: '' },
        { id: 7, name: 'Artemis Bow Zenith', job: 'Bard', stage: 'Zenith', expansionId: 1, collected: false, dateCollected: null, notes: '' },
        { id: 8, name: 'Stardust Rod Zenith', job: 'Black Mage', stage: 'Zenith', expansionId: 1, collected: true, dateCollected: '2024-03-10', notes: 'Light farming complete' },
        { id: 9, name: 'The Veil of Wiyu Zenith', job: 'Summoner', stage: 'Zenith', expansionId: 1, collected: false, dateCollected: null, notes: '' },
        { id: 10, name: 'Thyrus Zenith', job: 'White Mage', stage: 'Zenith', expansionId: 1, collected: false, dateCollected: null, notes: '' },
        { id: 11, name: 'Animated Hauteclaire', job: 'Dark Knight', stage: 'Animated', expansionId: 2, collected: false, dateCollected: null, notes: '' },
        { id: 12, name: 'Animated Brionac', job: 'Dragoon', stage: 'Animated', expansionId: 2, collected: true, dateCollected: '2024-03-15', notes: '' },
        { id: 13, name: 'Animated Seraph Cane', job: 'White Mage', stage: 'Animated', expansionId: 2, collected: false, dateCollected: null, notes: '' },
    ],
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    async init() {
        if (this.initialized) return;
        
        console.log('[FFXIVModule] Initializing...');
        
        // Initialize relic data
        await this.initializeRelicData();
        
        // Setup UI
        this.setupSidebar();
        this.loadPage(this.currentPage);
        
        this.initialized = true;
        console.log('[FFXIVModule] Initialized successfully');
    },
    
    async initializeRelicData() {
        // Check if data exists in storage
        const existing = await FFXIVRelicService.getAll();
        
        if (existing.length === 0) {
            // Initialize with default data
            await FFXIVRelicService.initializeDefaultData(this.DEFAULT_RELICS);
        }
    },
    
    // ============================================
    // SIDEBAR MANAGEMENT
    // ============================================
    
    setupSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebar-toggle');
        const popup = document.getElementById('sidebar-popup');
        
        // Load sidebar state from preferences
        const preferences = ConfigUtils.getUserPreferences();
        this.sidebarCollapsed = preferences.sidebarCollapsed || false;
        
        if (this.sidebarCollapsed) {
            sidebar.classList.add('collapsed');
        }
        
        // Toggle button
        toggleBtn.addEventListener('click', () => {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            sidebar.classList.toggle('collapsed');
            
            // Save preference
            ConfigUtils.saveUserPreferences({ sidebarCollapsed: this.sidebarCollapsed });
            
            // Close expanded sections when collapsing
            if (this.sidebarCollapsed) {
                this.expandedSections = [];
                document.querySelectorAll('.nav-item.expanded').forEach(item => {
                    item.classList.remove('expanded');
                });
            }
        });
        
        // Nav item interactions
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const hasSubmenu = item.dataset.hasSubmenu === 'true';
            const section = item.closest('.nav-section').dataset.section;
            
            if (hasSubmenu && !item.classList.contains('disabled')) {
                const itemContent = item.querySelector('.nav-item-content');
                
                // Click to expand/collapse
                itemContent.addEventListener('click', (e) => {
                    if (!this.sidebarCollapsed) {
                        e.stopPropagation();
                        this.toggleSection(item, section);
                    }
                });
                
                // Hover for popup (collapsed sidebar)
                item.addEventListener('mouseenter', (e) => {
                    if (this.sidebarCollapsed) {
                        this.showSidebarPopup(item, section, e);
                    }
                });
                
                item.addEventListener('mouseleave', () => {
                    if (this.sidebarCollapsed) {
                        this.hideSidebarPopup();
                    }
                });
            }
        });
        
        // Submenu navigation
        document.querySelectorAll('.submenu-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToPage(link.dataset.page);
            });
        });
        
        // Popup mouse leave
        popup.addEventListener('mouseleave', () => this.hideSidebarPopup());
        
        // Initialize expanded sections
        if (!this.sidebarCollapsed && this.expandedSections.length > 0) {
            this.expandedSections.forEach(sectionName => {
                const section = document.querySelector(`[data-section="${sectionName}"] .nav-item`);
                if (section) {
                    section.classList.add('expanded');
                }
            });
        }
    },
    
    toggleSection(navItem, sectionName) {
        const isExpanded = navItem.classList.contains('expanded');
        
        if (isExpanded) {
            navItem.classList.remove('expanded');
            this.expandedSections = this.expandedSections.filter(s => s !== sectionName);
        } else {
            navItem.classList.add('expanded');
            if (!this.expandedSections.includes(sectionName)) {
                this.expandedSections.push(sectionName);
            }
        }
    },
    
    showSidebarPopup(navItem, sectionName, event) {
        const popup = document.getElementById('sidebar-popup');
        const submenu = navItem.querySelector('.submenu');
        
        if (!submenu) return;
        
        const label = navItem.querySelector('.nav-label').textContent;
        const rect = navItem.getBoundingClientRect();
        
        popup.querySelector('.popup-header').textContent = label;
        popup.querySelector('.popup-submenu').innerHTML = submenu.innerHTML;
        
        popup.style.top = `${rect.top}px`;
        popup.classList.add('visible');
        
        // Add navigation handlers
        popup.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToPage(link.dataset.page);
                this.hideSidebarPopup();
            });
        });
    },
    
    hideSidebarPopup() {
        const popup = document.getElementById('sidebar-popup');
        popup.classList.remove('visible');
    },
    
    // ============================================
    // PAGE NAVIGATION
    // ============================================
    
    navigateToPage(page) {
        this.currentPage = page;
        
        // Update active states
        document.querySelectorAll('.submenu-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // Load page content
        this.loadPage(page);
    },
    
    async loadPage(page) {
        const container = document.getElementById('page-content');
        
        // Determine content based on page
        let content;
        
        switch (page) {
            case 'all-relics':
            case 'arr':
            case 'hw':
            case 'sb':
            case 'shb':
            case 'ew':
            case 'dt':
                content = await this.renderRelicPage(page);
                break;
            
            default:
                content = this.renderPlaceholderPage(page);
        }
        
        container.innerHTML = content;
        this.attachPageEventListeners();
    },
    
    async renderRelicPage(page) {
        let relics = await FFXIVRelicService.getAll();
        let pageTitle = 'All Relics';
        let pageSubtitle = 'Track your complete relic weapon collection';
        
        // Filter by expansion if not 'all-relics'
        if (page !== 'all-relics') {
            const expansion = this.EXPANSIONS.find(exp => exp.shortName.toLowerCase() === page);
            if (expansion) {
                relics = await FFXIVRelicService.getByExpansion(expansion.id);
                pageTitle = `${expansion.name} Relics`;
                pageSubtitle = `Track ${expansion.shortName} relic weapons`;
            }
        }
        
        const stats = this.calculateStats(relics);
        
        return `
            <div class="page-header">
                <h1 class="page-title">${pageTitle}</h1>
                <p class="page-subtitle">${pageSubtitle}</p>
            </div>
            
            ${this.renderStatsCards(stats)}
            ${this.renderFilters()}
            ${this.renderRelicTable(relics)}
        `;
    },
    
    renderPlaceholderPage(page) {
        return `
            <div class="page-header">
                <h1 class="page-title">${page.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
                <p class="page-subtitle">Coming Soon</p>
            </div>
            <div style="text-align: center; padding: 4rem; color: var(--text-muted);">
                <p>This feature is under development and will be available soon.</p>
            </div>
        `;
    },
    
    // ============================================
    // RENDER HELPERS
    // ============================================
    
    renderStatsCards(stats) {
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-label">Collected</span>
                    <span class="stat-value">${stats.collected}</span>
                    <span class="stat-description">Relics obtained</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Remaining</span>
                    <span class="stat-value">${stats.remaining}</span>
                    <span class="stat-description">Still to collect</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Progress</span>
                    <span class="stat-value">${stats.percentage}%</span>
                    <span class="stat-description">Completion rate</span>
                </div>
            </div>
        `;
    },
    
    renderFilters() {
        return `
            <div class="filter-section">
                <div class="filter-title">Filters</div>
                <div class="filter-row">
                    <div class="filter-group">
                        <label class="filter-label">Expansion:</label>
                        <select class="filter-select" id="expansion-filter">
                            <option value="all">All Expansions</option>
                            ${this.EXPANSIONS.map(exp => 
                                `<option value="${exp.id}">${exp.name} (${exp.shortName})</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label class="filter-label">Job:</label>
                        <select class="filter-select" id="job-filter">
                            <option value="all">All Jobs</option>
                            <option value="Paladin">Paladin</option>
                            <option value="Warrior">Warrior</option>
                            <option value="Dark Knight">Dark Knight</option>
                            <option value="Monk">Monk</option>
                            <option value="Dragoon">Dragoon</option>
                            <option value="Ninja">Ninja</option>
                            <option value="Bard">Bard</option>
                            <option value="Black Mage">Black Mage</option>
                            <option value="Summoner">Summoner</option>
                            <option value="White Mage">White Mage</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label class="filter-label">Status:</label>
                        <select class="filter-select" id="status-filter">
                            <option value="all">All Items</option>
                            <option value="collected">Collected</option>
                            <option value="uncollected">Not Collected</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderRelicTable(relics) {
        return `
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th class="checkbox-cell">✓</th>
                            <th>Relic Name</th>
                            <th>Job</th>
                            <th>Stage</th>
                            <th>Expansion</th>
                            <th>Date Collected</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody id="relic-table-body">
                        ${this.renderTableRows(relics)}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    renderTableRows(relics) {
        if (relics.length === 0) {
            return `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        No relics found matching your filters
                    </td>
                </tr>
            `;
        }
        
        return relics.map(relic => {
            const expansion = this.EXPANSIONS.find(e => e.id === relic.expansionId);
            
            return `
                <tr class="${relic.collected ? 'collected' : ''}" data-relic-id="${relic.id}">
                    <td class="checkbox-cell">
                        <input 
                            type="checkbox" 
                            class="custom-checkbox relic-checkbox" 
                            ${relic.collected ? 'checked' : ''}
                            data-relic-id="${relic.id}"
                        >
                    </td>
                    <td><strong>${relic.name}</strong></td>
                    <td><span class="badge badge-primary">${relic.job}</span></td>
                    <td><span class="badge badge-secondary">${relic.stage}</span></td>
                    <td><span class="badge badge-muted">${expansion.shortName}</span></td>
                    <td>
                        ${relic.dateCollected 
                            ? `<span class="text-success">${relic.dateCollected}</span>`
                            : '<span class="text-muted">—</span>'
                        }
                    </td>
                    <td>
                        <input 
                            type="text" 
                            class="notes-input" 
                            value="${relic.notes || ''}"
                            placeholder="Add notes..."
                            data-relic-id="${relic.id}"
                        >
                    </td>
                </tr>
            `;
        }).join('');
    },
    
    // ============================================
    // EVENT HANDLERS
    // ============================================
    
    attachPageEventListeners() {
        // Relic checkboxes
        document.querySelectorAll('.relic-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', async (e) => {
                const relicId = parseInt(e.target.dataset.relicId);
                await this.toggleRelicCollection(relicId, e.target.checked);
            });
        });
        
        // Notes inputs
        document.querySelectorAll('.notes-input').forEach(input => {
            input.addEventListener('blur', UIHelpers.debounce(async (e) => {
                const relicId = parseInt(e.target.dataset.relicId);
                await this.updateRelicNotes(relicId, e.target.value);
            }, 500));
        });
        
        // Filters
        ['expansion-filter', 'job-filter', 'status-filter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
            }
        });
    },
    
    async toggleRelicCollection(relicId, isCollected) {
        await FFXIVRelicService.updateCollectionStatus(relicId, isCollected);
        
        // Update UI
        const row = document.querySelector(`tr[data-relic-id="${relicId}"]`);
        if (row) {
            row.classList.toggle('collected', isCollected);
            const relic = await FFXIVRelicService.getById(relicId);
            const dateCell = row.children[5];
            dateCell.innerHTML = relic.dateCollected 
                ? `<span class="text-success">${relic.dateCollected}</span>`
                : '<span class="text-muted">—</span>';
        }
        
        // Update stats
        await this.updateStats();
    },
    
    async updateRelicNotes(relicId, notes) {
        await FFXIVRelicService.updateNotes(relicId, notes);
        UIHelpers.showNotification('Notes saved', 'success', 2000);
    },
    
    async applyFilters() {
        const expansionFilter = document.getElementById('expansion-filter').value;
        const jobFilter = document.getElementById('job-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        
        let filtered = await FFXIVRelicService.getAll();
        
        // Apply filters
        if (expansionFilter !== 'all') {
            filtered = filtered.filter(r => r.expansionId === parseInt(expansionFilter));
        }
        
        if (jobFilter !== 'all') {
            filtered = filtered.filter(r => r.job === jobFilter);
        }
        
        if (statusFilter === 'collected') {
            filtered = filtered.filter(r => r.collected);
        } else if (statusFilter === 'uncollected') {
            filtered = filtered.filter(r => !r.collected);
        }
        
        // Re-render table
        const tbody = document.getElementById('relic-table-body');
        tbody.innerHTML = this.renderTableRows(filtered);
        
        // Reattach listeners
        this.attachPageEventListeners();
    },
    
    async updateStats() {
        const relics = await FFXIVRelicService.getAll();
        const stats = this.calculateStats(relics);
        
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 3) {
            statValues[0].textContent = stats.collected;
            statValues[1].textContent = stats.remaining;
            statValues[2].textContent = stats.percentage + '%';
        }
    },
    
    // ============================================
    // UTILITIES
    // ============================================
    
    calculateStats(relics) {
        const total = relics.length;
        const collected = relics.filter(r => r.collected).length;
        const remaining = total - collected;
        const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;
        
        return { total, collected, remaining, percentage };
    },
    
    // ============================================
    // CLEANUP
    // ============================================
    
    async cleanup() {
        console.log('[FFXIVModule] Cleaning up...');
        this.initialized = false;
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FFXIVModule };
}
