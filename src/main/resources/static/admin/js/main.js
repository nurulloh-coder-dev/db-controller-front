document.addEventListener('DOMContentLoaded', async () => {
    // Check token first
    if (!getToken()) {
        window.location.href = '/login';
        return;
    }

    // Check if user is SUPER_ADMIN
    try {
        const profile = await apiCall('/user/profile');
        if (!profile || profile.role?.name?.toUpperCase() !== 'ADMIN') {
            window.location.href = '/main';
            return;
        }
    } catch (error) {
        window.location.href = '/login';
        return;
    }

    // User is authorized — give other scripts time to register their renderers
    setTimeout(() => {
        initializeNavigation();
    }, 100);
});

let currentSection = 'endpoints';
let autoRefreshInterval = null;

// Section renderer registry
const sectionRenderers = {
    'endpoints': null,
    'active-users': null,
    'org-activity': null
};

// Register a section renderer
function registerSectionRenderer(sectionName, renderFunction) {
    sectionRenderers[sectionName] = renderFunction;
}

// Navigate to a section
function navigateToSection(sectionName) {
    // Stop any existing auto-refresh
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        }
    });

    // Update current section
    currentSection = sectionName;

    // Render the section
    const renderer = sectionRenderers[sectionName];
    if (renderer && typeof renderer === 'function') {
        renderer();
    } else {
        console.error(`No renderer found for section: ${sectionName}`);
        showEmptyState('Section not implemented', '🚧');
    }
}

// Show empty state
function showEmptyState(message = 'No data available', icon = '📭') {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-title">${message}</div>
        </div>
    `;
}

// Show loading
function showLoading() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="loading-overlay" style="position: relative; min-height: 400px;">
            <div class="spinner"></div>
        </div>
    `;
}

// Initialize navigation
function initializeNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            navigateToSection(section);
        });
    });

    // Load initial section
    navigateToSection('endpoints');
}

// Export functions for other modules
window.registerSectionRenderer = registerSectionRenderer;
window.navigateToSection = navigateToSection;
window.showLoading = showLoading;
window.showEmptyState = showEmptyState;
window.autoRefreshInterval = autoRefreshInterval;