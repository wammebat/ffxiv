// ============================================
// DATA STRUCTURES
// ============================================

const EXPANSIONS = [
    { id: 1, name: 'A Realm Reborn', shortName: 'ARR', year: 2013 },
    { id: 2, name: 'Heavensward', shortName: 'HW', year: 2015 },
    { id: 3, name: 'Stormblood', shortName: 'SB', year: 2017 },
    { id: 4, name: 'Shadowbringers', shortName: 'ShB', year: 2019 },
    { id: 5, name: 'Endwalker', shortName: 'EW', year: 2021 },
    { id: 6, name: 'Dawntrail', shortName: 'DT', year: 2024 }
];

const RELICS = [
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
];

// ============================================
// STATE MANAGEMENT
// ============================================

const AppState = {
    sidebarCollapsed: false,
    expandedSections: ['relics'], // Track which nav sections are expanded
    currentPage: 'all-relics',
    currentFilter: {
        expansion: 'all',
        job: 'all',
        status: 'all'
    },
    relics: [...RELICS]
};

// ============================================
// SIDEBAR FUNCTIONALITY
// ============================================

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const navItems = document.querySelectorAll('.nav-item');
    const popup = document.getElementById('sidebar-popup');
    
    // Toggle sidebar collapse
    toggleBtn.addEventListener('click', () => {
        AppState.sidebarCollapsed = !AppState.sidebarCollapsed;
        sidebar.classList.toggle('collapsed');
        
        // Close all expanded sections when collapsing
        if (AppState.sidebarCollapsed) {
            AppState.expandedSections = [];
            document.querySelectorAll('.nav-item.expanded').forEach(item => {
                item.classList.remove('expanded');
            });
        }
    });
    
    // Handle nav item clicks
    navItems.forEach(item => {
        const hasSubmenu = item.dataset.hasSubmenu === 'true';
        const section = item.closest('.nav-section').dataset.section;
        
        if (hasSubmenu) {
            const itemContent = item.querySelector('.nav-item-content');
            
            // Click to expand/collapse (only in expanded sidebar)
            itemContent.addEventListener('click', (e) => {
                if (!AppState.sidebarCollapsed && !item.classList.contains('disabled')) {
                    e.stopPropagation();
                    toggleSection(item, section);
                }
            });
            
            // Hover for popup (only in collapsed sidebar)
            if (!item.classList.contains('disabled')) {
                item.addEventListener('mouseenter', (e) => {
                    if (AppState.sidebarCollapsed) {
                        showPopup(item, section, e);
                    }
                });
                
                item.addEventListener('mouseleave', () => {
                    if (AppState.sidebarCollapsed) {
                        hidePopup();
                    }
                });
            }
        } else {
            // Items without submenus
            item.addEventListener('click', () => {
                if (!item.classList.contains('disabled')) {
                    // Handle navigation
                    console.log('Navigate to:', section);
                }
            });
        }
    });
    
    // Handle submenu item clicks
    document.querySelectorAll('.submenu-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateToPage(page);
        });
    });
    
    // Hide popup when mouse leaves
    popup.addEventListener('mouseleave', hidePopup);
    
    // Initialize first section as expanded if not collapsed
    if (!AppState.sidebarCollapsed && AppState.expandedSections.length > 0) {
        AppState.expandedSections.forEach(sectionName => {
            const section = document.querySelector(`[data-section="${sectionName}"] .nav-item`);
            if (section) {
                section.classList.add('expanded');
            }
        });
    }
}

function toggleSection(navItem, sectionName) {
    const isExpanded = navItem.classList.contains('expanded');
    
    if (isExpanded) {
        navItem.classList.remove('expanded');
        AppState.expandedSections = AppState.expandedSections.filter(s => s !== sectionName);
    } else {
        navItem.classList.add('expanded');
        if (!AppState.expandedSections.includes(sectionName)) {
            AppState.expandedSections.push(sectionName);
        }
    }
}

function showPopup(navItem, sectionName, event) {
    const popup = document.getElementById('sidebar-popup');
    const submenu = navItem.querySelector('.submenu');
    
    if (!submenu) return;
    
    const label = navItem.querySelector('.nav-label').textContent;
    const rect = navItem.getBoundingClientRect();
    
    // Set popup content
    const popupHeader = popup.querySelector('.popup-header');
    const popupSubmenu = popup.querySelector('.popup-submenu');
    
    popupHeader.textContent = label;
    popupSubmenu.innerHTML = submenu.innerHTML;
    
    // Position popup
    popup.style.top = `${rect.top}px`;
    popup.classList.add('visible');
    
    // Add click handlers to popup submenu items
    popup.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateToPage(page);
            hidePopup();
        });
    });
}

function hidePopup() {
    const popup = document.getElementById('sidebar-popup');
    popup.classList.remove('visible');
}

function navigateToPage(page) {
    AppState.currentPage = page;
    
    // Update active states
    document.querySelectorAll('.submenu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Also update popup active states
    document.querySelectorAll('.popup-submenu a').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // Load page content
    loadPageContent(page);
}

// ============================================
// PAGE CONTENT RENDERING
// ============================================

function loadPageContent(page) {
    const container = document.getElementById('page-content');
    
    // Determine which relics to show based on page
    let filteredRelics = [...AppState.relics];
    let pageTitle = 'All Relics';
    let pageSubtitle = 'Track your complete relic weapon collection';
    
    if (page !== 'all-relics') {
        const expansion = EXPANSIONS.find(exp => exp.shortName.toLowerCase() === page);
        if (expansion) {
            filteredRelics = AppState.relics.filter(r => r.expansionId === expansion.id);
            pageTitle = `${expansion.name} Relics`;
            pageSubtitle = `Track ${expansion.shortName} relic weapons`;
        }
    }
    
    container.innerHTML = renderRelicTrackerPage(pageTitle, pageSubtitle, filteredRelics);
    attachPageEventListeners();
}

function renderRelicTrackerPage(title, subtitle, relics) {
    const stats = calculateStats(relics);
    
    return `
        <div class="page-header">
            <h1 class="page-title">${title}</h1>
            <p class="page-subtitle">${subtitle}</p>
        </div>
        
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
        
        <div class="filter-section">
            <div class="filter-title">Filters</div>
            <div class="filter-row">
                <div class="filter-group">
                    <label class="filter-label">Expansion:</label>
                    <select class="filter-select" id="expansion-filter">
                        <option value="all">All Expansions</option>
                        ${EXPANSIONS.map(exp => 
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
                    ${renderTableRows(relics)}
                </tbody>
            </table>
        </div>
    `;
}

function renderTableRows(relics) {
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
        const expansion = EXPANSIONS.find(e => e.id === relic.expansionId);
        
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
                <td>
                    <strong>${relic.name}</strong>
                </td>
                <td>
                    <span class="badge badge-primary">${relic.job}</span>
                </td>
                <td>
                    <span class="badge badge-secondary">${relic.stage}</span>
                </td>
                <td>
                    <span class="badge badge-muted">${expansion.shortName}</span>
                </td>
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
}

function attachPageEventListeners() {
    // Checkbox listeners
    document.querySelectorAll('.relic-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const relicId = parseInt(e.target.dataset.relicId);
            toggleRelicCollection(relicId, e.target.checked);
        });
    });
    
    // Notes input listeners
    document.querySelectorAll('.notes-input').forEach(input => {
        input.addEventListener('blur', (e) => {
            const relicId = parseInt(e.target.dataset.relicId);
            updateRelicNotes(relicId, e.target.value);
        });
    });
    
    // Filter listeners
    const expansionFilter = document.getElementById('expansion-filter');
    const jobFilter = document.getElementById('job-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (expansionFilter) {
        expansionFilter.addEventListener('change', applyFilters);
    }
    if (jobFilter) {
        jobFilter.addEventListener('change', applyFilters);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
}

// ============================================
// DATA MANAGEMENT
// ============================================

function toggleRelicCollection(relicId, isCollected) {
    const relic = AppState.relics.find(r => r.id === relicId);
    if (!relic) return;
    
    relic.collected = isCollected;
    
    if (isCollected && !relic.dateCollected) {
        relic.dateCollected = new Date().toISOString().split('T')[0];
    } else if (!isCollected) {
        relic.dateCollected = null;
    }
    
    // Update the row appearance
    const row = document.querySelector(`tr[data-relic-id="${relicId}"]`);
    if (row) {
        row.classList.toggle('collected', isCollected);
        const dateCell = row.children[5];
        dateCell.innerHTML = relic.dateCollected 
            ? `<span class="text-success">${relic.dateCollected}</span>`
            : '<span class="text-muted">—</span>';
    }
    
    // Update stats
    updateStats();
    
    console.log(`Relic ${relicId} ${isCollected ? 'collected' : 'uncollected'}`);
}

function updateRelicNotes(relicId, notes) {
    const relic = AppState.relics.find(r => r.id === relicId);
    if (relic) {
        relic.notes = notes;
        console.log(`Updated notes for relic ${relicId}`);
    }
}

function applyFilters() {
    const expansionFilter = document.getElementById('expansion-filter').value;
    const jobFilter = document.getElementById('job-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    let filtered = [...AppState.relics];
    
    // Apply expansion filter
    if (expansionFilter !== 'all') {
        filtered = filtered.filter(r => r.expansionId === parseInt(expansionFilter));
    }
    
    // Apply job filter
    if (jobFilter !== 'all') {
        filtered = filtered.filter(r => r.job === jobFilter);
    }
    
    // Apply status filter
    if (statusFilter === 'collected') {
        filtered = filtered.filter(r => r.collected);
    } else if (statusFilter === 'uncollected') {
        filtered = filtered.filter(r => !r.collected);
    }
    
    // Re-render table
    const tbody = document.getElementById('relic-table-body');
    tbody.innerHTML = renderTableRows(filtered);
    
    // Reattach listeners
    attachPageEventListeners();
}

function calculateStats(relics) {
    const total = relics.length;
    const collected = relics.filter(r => r.collected).length;
    const remaining = total - collected;
    const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;
    
    return { total, collected, remaining, percentage };
}

function updateStats() {
    const stats = calculateStats(AppState.relics);
    
    // Update stat cards if they exist
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 3) {
        statValues[0].textContent = stats.collected;
        statValues[1].textContent = stats.remaining;
        statValues[2].textContent = stats.percentage + '%';
    }
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    initSidebar();
    loadPageContent('all-relics');
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
