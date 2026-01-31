// ============================================
// CONFIGURATION & DATA
// ============================================

const APP_CONFIG = {
    modules: [
        { id: 'relics', name: 'Relic Tracker', icon: 'sword', enabled: true },
        { id: 'gathering', name: 'Gathering Nodes', icon: 'sprout', enabled: false },
        { id: 'crafting', name: 'Crafting Lists', icon: 'hammer', enabled: false },
        { id: 'mounts', name: 'Mount Collection', icon: 'horse', enabled: false },
        { id: 'minions', name: 'Minion Collection', icon: 'pet', enabled: false },
        { id: 'achievements', name: 'Achievements', icon: 'trophy', enabled: false }
    ]
};

// Sample data - Replace with database API calls later
const EXPANSIONS = [
    { id: 1, name: 'A Realm Reborn', shortName: 'ARR' },
    { id: 2, name: 'Heavensward', shortName: 'HW' },
    { id: 3, name: 'Stormblood', shortName: 'SB' },
    { id: 4, name: 'Shadowbringers', shortName: 'ShB' },
    { id: 5, name: 'Endwalker', shortName: 'EW' },
    { id: 6, name: 'Dawntrail', shortName: 'DT' }
];

const RELICS = [
    { id: 1, name: 'Curtana Zenith', job: 'Paladin', stage: 'Zenith', expansionId: 1, icon: '🗡️', collected: true, dateCollected: '2024-01-15' },
    { id: 2, name: 'Holy Shield Zenith', job: 'Paladin', stage: 'Zenith', expansionId: 1, icon: '🛡️', collected: true, dateCollected: '2024-01-15' },
    { id: 3, name: 'Sphairai Zenith', job: 'Monk', stage: 'Zenith', expansionId: 1, icon: '🥊', collected: false },
    { id: 4, name: 'Bravura Zenith', job: 'Warrior', stage: 'Zenith', expansionId: 1, icon: '🪓', collected: true, dateCollected: '2024-02-03' },
    { id: 5, name: 'Gae Bolg Zenith', job: 'Dragoon', stage: 'Zenith', expansionId: 1, icon: '🔱', collected: false },
    { id: 6, name: 'Artemis Bow Zenith', job: 'Bard', stage: 'Zenith', expansionId: 1, icon: '🏹', collected: false },
    { id: 7, name: 'Stardust Rod Zenith', job: 'Black Mage', stage: 'Zenith', expansionId: 1, icon: '✨', collected: true, dateCollected: '2024-03-10' },
    { id: 8, name: 'Thyrus Zenith', job: 'White Mage', stage: 'Zenith', expansionId: 1, icon: '🪄', collected: false },
];

// ============================================
// STATE MANAGEMENT
// ============================================

const AppState = {
    currentModule: 'relics',
    currentExpansion: null,
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
    relics: [...RELICS]
};

// ============================================
// ICONS (SVG)
// ============================================

const ICONS = {
    sword: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 6.5l-9 9m9-4l-5 5m-3-11l9 9m-8-1l2-2"/></svg>',
    sprout: '<svg width="20" height="20" fill="currentColor"><path d="M10 1c2.5 0 5 2 5 5s-2.5 5-5 5-5-2-5-5 2.5-5 5-5zm0 10c-1.5 0-3 1-3 2.5V19h6v-5.5c0-1.5-1.5-2.5-3-2.5z"/></svg>',
    hammer: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18l3-3m0 0l9-9m-9 9l3-3m6-6l3-3m-3 3l-3 3"/></svg>',
    horse: '<svg width="20" height="20" fill="currentColor"><path d="M18 7c0-1.1-.9-2-2-2h-1l-3-3H8L5 5H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3v-8z"/></svg>',
    pet: '<svg width="20" height="20" fill="currentColor"><path d="M4.5 12c.83 0 1.5-.67 1.5-1.5S5.33 9 4.5 9 3 9.67 3 10.5 3.67 12 4.5 12zm3-4C8.33 8 9 7.33 9 6.5S8.33 5 7.5 5 6 5.67 6 6.5 6.67 8 7.5 8zm5 0c.83 0 1.5-.67 1.5-1.5S13.33 5 12.5 5 11 5.67 11 6.5 11.67 8 12.5 8zm3 4c.83 0 1.5-.67 1.5-1.5S16.33 9 15.5 9 14 9.67 14 10.5s.67 1.5 1.5 1.5zm-5 4c2.33 0 4.31-1.46 5.11-3.5H5.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
    trophy: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m8 0h1.5a2.5 2.5 0 0 1 0 5H14m-8 0V4h8v5M8 18h4m-2 0v-4"/></svg>'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getIcon(iconName) {
    return ICONS[iconName] || ICONS.sword;
}

function updateStats() {
    const total = AppState.relics.length;
    const collected = AppState.relics.filter(r => r.collected).length;
    const percent = total > 0 ? Math.round((collected / total) * 100) : 0;
    
    return { total, collected, percent };
}

// ============================================
// RENDERING FUNCTIONS
// ============================================

function renderNavigation() {
    const desktopNav = document.getElementById('sidebar-nav');
    const mobileNav = document.getElementById('mobile-sidebar-nav');
    
    const navHTML = APP_CONFIG.modules.map(module => `
        <a href="#" 
           class="nav-item ${module.id === AppState.currentModule ? 'active' : ''} ${!module.enabled ? 'disabled' : ''}"
           data-module="${module.id}"
           ${!module.enabled ? 'title="Coming soon"' : ''}>
            ${getIcon(module.icon)}
            <span class="nav-label">${module.name}</span>
            ${!module.enabled ? '<span class="nav-badge">Soon</span>' : ''}
        </a>
    `).join('');
    
    desktopNav.innerHTML = navHTML;
    mobileNav.innerHTML = navHTML;
    
    // Add event listeners
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const moduleId = item.dataset.module;
            const module = APP_CONFIG.modules.find(m => m.id === moduleId);
            
            if (module && module.enabled) {
                AppState.currentModule = moduleId;
                closeMobileSidebar();
                renderCurrentModule();
            }
        });
    });
}

function renderRelicTracker() {
    const stats = updateStats();
    const filtered = AppState.currentExpansion 
        ? AppState.relics.filter(r => r.expansionId === AppState.currentExpansion)
        : AppState.relics;
    
    return `
        <div class="page-header">
            <h1 class="page-title">⚔️ Relic Weapon Tracker</h1>
            <p class="page-subtitle">Track your journey to collect all relic weapons</p>
        </div>
        
        <div class="stats-bar">
            <div class="stat-item">
                <div class="stat-number">${stats.collected}</div>
                <div class="stat-label">Collected</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.total}</div>
                <div class="stat-label">Total Relics</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${stats.percent}%</div>
                <div class="stat-label">Completion</div>
            </div>
        </div>
        
        <div class="filter-section">
            <div class="filter-buttons">
                <button class="filter-btn ${!AppState.currentExpansion ? 'active' : ''}" 
                        data-expansion="all">
                    All Expansions
                </button>
                ${EXPANSIONS.map(exp => `
                    <button class="filter-btn ${AppState.currentExpansion === exp.id ? 'active' : ''}" 
                            data-expansion="${exp.id}">
                        ${exp.shortName}
                    </button>
                `).join('')}
            </div>
        </div>
        
        <div class="relic-grid">
            ${filtered.length === 0 
                ? '<div class="empty-state"><h2>No relics in this expansion</h2><p>Check back later!</p></div>'
                : filtered.map(relic => renderRelicCard(relic)).join('')
            }
        </div>
    `;
}

function renderRelicCard(relic) {
    return `
        <div class="relic-card ${relic.collected ? 'collected' : 'uncollected'}" 
             data-relic-id="${relic.id}">
            <div class="relic-image-container">
                ${relic.icon}
            </div>
            <div class="relic-info">
                <h3>${relic.name}</h3>
                <div class="relic-detail">Stage: ${relic.stage}</div>
                <div class="job-badge">${relic.job}</div>
                ${relic.collected && relic.dateCollected 
                    ? `<div class="collection-date">Collected: ${relic.dateCollected}</div>` 
                    : ''
                }
            </div>
        </div>
    `;
}

function renderComingSoon(moduleName) {
    return `
        <div class="coming-soon">
            <div class="coming-soon-content">
                <h2>${moduleName}</h2>
                <p>This feature is coming soon!</p>
            </div>
        </div>
    `;
}

function renderCurrentModule() {
    const container = document.getElementById('app-container');
    const module = APP_CONFIG.modules.find(m => m.id === AppState.currentModule);
    
    if (!module) return;
    
    let content = '';
    
    switch (AppState.currentModule) {
        case 'relics':
            content = renderRelicTracker();
            break;
        default:
            content = renderComingSoon(module.name);
    }
    
    container.innerHTML = content;
    renderNavigation();
    attachEventListeners();
}

// ============================================
// EVENT LISTENERS
// ============================================

function attachEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const expansion = btn.dataset.expansion;
            AppState.currentExpansion = expansion === 'all' ? null : parseInt(expansion);
            renderCurrentModule();
        });
    });
    
    // Relic cards
    document.querySelectorAll('.relic-card').forEach(card => {
        card.addEventListener('click', () => {
            const relicId = parseInt(card.dataset.relicId);
            toggleRelicCollection(relicId);
        });
    });
}

function toggleRelicCollection(relicId) {
    const relic = AppState.relics.find(r => r.id === relicId);
    if (!relic) return;
    
    relic.collected = !relic.collected;
    
    if (relic.collected && !relic.dateCollected) {
        const today = new Date().toISOString().split('T')[0];
        relic.dateCollected = today;
    }
    
    // In real app, save to database here
    console.log(`Updated relic ${relicId}: collected = ${relic.collected}`);
    
    renderCurrentModule();
}

// ============================================
// SIDEBAR FUNCTIONALITY
// ============================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    AppState.sidebarCollapsed = !AppState.sidebarCollapsed;
    sidebar.classList.toggle('collapsed');
}

function openMobileSidebar() {
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    AppState.mobileSidebarOpen = true;
    mobileSidebar.classList.add('active');
    overlay.classList.add('active');
    overlay.style.display = 'block';
}

function closeMobileSidebar() {
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-overlay');
    
    AppState.mobileSidebarOpen = false;
    mobileSidebar.classList.remove('active');
    overlay.classList.remove('active');
    
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
    // Set up sidebar toggles
    document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
    document.getElementById('mobile-menu-btn').addEventListener('click', openMobileSidebar);
    document.getElementById('mobile-close-btn').addEventListener('click', closeMobileSidebar);
    document.getElementById('mobile-overlay').addEventListener('click', closeMobileSidebar);
    
    // Initial render
    renderCurrentModule();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}