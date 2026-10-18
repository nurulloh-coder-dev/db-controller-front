// ==================== AGENT VERSIONS SECTION ====================

const AGENT_VERSIONS_API_URL = '/jar/admin';

// Format bytes to readable size
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Format date
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Render version cards
function renderVersionCards(versions, isNew = false) {
    if (!versions || versions.length === 0) {
        return `
            <div class="empty-state-small">
                <div class="empty-icon">📦</div>
                <div class="empty-text">No ${isNew ? 'new' : 'approved'} versions</div>
            </div>
        `;
    }

    return versions.map(version => `
        <div class="version-card ${isNew ? 'version-card-new' : 'version-card-approved'}">
            <div class="version-header">
                <div class="version-number">v${escapeHtml(version.version)}</div>
                ${version.id ? `<div class="version-id">${escapeHtml(version.id.substring(0, 8))}</div>` : ''}
            </div>
            
            <div class="version-description">
                ${escapeHtml(version.description || 'No description available')}
            </div>
            
            <div class="version-details">
                <div class="version-detail-item">
                    <div class="detail-label">Size</div>
                    <div class="detail-value size-value">${formatBytes(version.sizeInBytes || 0)}</div>
                </div>
                <div class="version-detail-item">
                    <div class="detail-label">Release Date</div>
                    <div class="detail-value date-value">${version.releaseDate ? formatDate(version.releaseDate) : 'N/A'}</div>
                </div>
            </div>
            
            ${isNew ? `
                <div class="version-actions">
                    <button class="action-btn approve-btn" onclick="openApproveModal(${jsArg(version.version)})">
                        ✓ Approve
                    </button>
                </div>
            ` : `
                <div class="version-actions">
                    <button class="action-btn edit-btn" onclick="openEditModal(${jsArg(version.id)}, ${jsArg(version.version)}, ${jsArg(version.description || '')})">
                        ✎ Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="openDeleteModal(${jsArg(version.id)}, ${jsArg(version.version)})">
                        🗑 Delete
                    </button>
                </div>
            `}
        </div>
    `).join('');
}

// Render agent versions sections
function renderAgentVersions(data) {
    const newVersionsContainer = document.getElementById('newVersionsGrid');
    const approvedVersionsContainer = document.getElementById('approvedVersionsGrid');

    newVersionsContainer.innerHTML = renderVersionCards(data.newVersions, true);
    approvedVersionsContainer.innerHTML = renderVersionCards(data.approvedVersions, false);

    document.getElementById('newVersionsCount').textContent = data.newVersions?.length || 0;
    document.getElementById('approvedVersionsCount').textContent = data.approvedVersions?.length || 0;
}

// Load agent versions data
async function loadAgentVersionsData() {
    try {
        renderAgentVersionsSection();

        const data = await apiCall(AGENT_VERSIONS_API_URL, { method: 'GET' });
        renderAgentVersions(data);

    } catch (error) {
        console.error('Error loading agent versions:', error);
        showToast('Failed to load agent versions: ' + error.message, 'error');

        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="content-header">
                <h1>Agent Versions</h1>
            </div>
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <div class="empty-state-title">Error Loading Data</div>
                <div class="empty-state-description">${escapeHtml(error.message)}</div>
            </div>
        `;
    }
}

// ==================== APPROVE MODAL ====================

function openApproveModal(version) {
    const modal = document.getElementById('approveModal');
    document.getElementById('approveVersionNumber').textContent = version;
    document.getElementById('approveVersionInput').value = version;
    document.getElementById('approveDescription').value = '';
    modal.style.display = 'flex';
}

function closeApproveModal() {
    document.getElementById('approveModal').style.display = 'none';
}

async function approveVersion() {
    const version = document.getElementById('approveVersionInput').value;
    const description = document.getElementById('approveDescription').value.trim();
    const submitBtn = document.getElementById('approveSubmitBtn');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Approving...';

    try {
        await apiCall('/jar', {
            method: 'POST',
            body: JSON.stringify({ version, description: description || null })
        });

        showToast('Version approved successfully!', 'success');
        closeApproveModal();
        loadAgentVersionsData();

    } catch (error) {
        console.error('Error approving version:', error);
        showToast('Failed to approve version: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = '✓ Approve';
    }
}

// ==================== EDIT MODAL ====================

function openEditModal(id, version, description) {
    const modal = document.getElementById('editModal');
    document.getElementById('editVersionId').value = id;
    document.getElementById('editVersionNumber').textContent = version;
    document.getElementById('editVersionDisplay').value = version;
    document.getElementById('editDescription').value = description || '';
    modal.style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function submitEditVersion() {
    const id = document.getElementById('editVersionId').value;
    const version = document.getElementById('editVersionDisplay').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const submitBtn = document.getElementById('editSubmitBtn');

    if (!version) {
        showToast('Version number is required.', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        await apiCall(`/jar/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ version, description: description || null })
        });

        showToast('Version updated successfully!', 'success');
        closeEditModal();
        loadAgentVersionsData();

    } catch (error) {
        console.error('Error updating version:', error);
        showToast('Failed to update version: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
    }
}

// ==================== DELETE MODAL ====================

function openDeleteModal(id, version) {
    const modal = document.getElementById('deleteModal');
    document.getElementById('deleteVersionId').value = id;
    document.getElementById('deleteVersionNumber').textContent = version;
    modal.style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

async function confirmDeleteVersion() {
    const id = document.getElementById('deleteVersionId').value;
    const confirmBtn = document.getElementById('deleteConfirmBtn');

    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting...';

    try {
        await apiCall(`/jar/${id}`, { method: 'DELETE' });

        showToast('Version deleted successfully!', 'success');
        closeDeleteModal();
        loadAgentVersionsData();

    } catch (error) {
        console.error('Error deleting version:', error);
        showToast('Failed to delete version: ' + error.message, 'error');
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Delete';
    }
}

// ==================== RENDER SECTION ====================

function renderAgentVersionsSection() {
    const mainContent = document.getElementById('mainContent');

    mainContent.innerHTML = `
        <div class="content-header">
            <h1>Agent Versions Management</h1>
            <button class="refresh-btn" onclick="loadAgentVersionsData()">
                <span>🔄</span>
                <span>Refresh</span>
            </button>
        </div>

        <!-- New Versions Section -->
        <div class="versions-section">
            <div class="section-header">
                <h2>🆕 New Versions</h2>
                <span class="version-count" id="newVersionsCount">0</span>
            </div>
            <div class="versions-grid" id="newVersionsGrid"></div>
        </div>

        <!-- Approved Versions Section -->
        <div class="versions-section">
            <div class="section-header">
                <h2>✅ Approved Versions</h2>
                <span class="version-count" id="approvedVersionsCount">0</span>
            </div>
            <div class="versions-grid" id="approvedVersionsGrid"></div>
        </div>

        <!-- Approve Modal -->
        <div id="approveModal" class="modal-overlay" onclick="if(event.target === this) closeApproveModal()">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Approve Version <span id="approveVersionNumber"></span></h3>
                    <button class="modal-close-btn" onclick="closeApproveModal()">✕</button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="approveVersionInput">
                    <div class="form-group">
                        <label for="approveDescription">Description (Optional)</label>
                        <textarea id="approveDescription" class="form-textarea" placeholder="Add a description for this version..." rows="4"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn cancel-btn" onclick="closeApproveModal()">Cancel</button>
                    <button class="modal-btn approve-btn" id="approveSubmitBtn" onclick="approveVersion()">✓ Approve</button>
                </div>
            </div>
        </div>

        <!-- Edit Modal -->
        <div id="editModal" class="modal-overlay" onclick="if(event.target === this) closeEditModal()">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Version <span id="editVersionNumber"></span></h3>
                    <button class="modal-close-btn" onclick="closeEditModal()">✕</button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="editVersionId">
                    <div class="form-group" style="margin-bottom: 16px;">
                        <label for="editVersionDisplay">Version Number</label>
                        <input type="text" id="editVersionDisplay" class="form-textarea" style="resize:none; height:auto; padding: 10px 12px;" placeholder="e.g. 1.0.0">
                    </div>
                    <div class="form-group">
                        <label for="editDescription">Description</label>
                        <textarea id="editDescription" class="form-textarea" placeholder="Add a description..." rows="4"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn cancel-btn" onclick="closeEditModal()">Cancel</button>
                    <button class="modal-btn approve-btn" id="editSubmitBtn" onclick="submitEditVersion()" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); box-shadow: 0 2px 8px rgba(245,158,11,0.3);">Save Changes</button>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div id="deleteModal" class="modal-overlay" onclick="if(event.target === this) closeDeleteModal()">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Delete Version <span id="deleteVersionNumber" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"></span></h3>
                    <button class="modal-close-btn" onclick="closeDeleteModal()">✕</button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="deleteVersionId">
                    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0;">
                        Are you sure you want to delete this version? This action <strong>cannot be undone</strong>.
                    </p>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn cancel-btn" onclick="closeDeleteModal()">Cancel</button>
                    <button class="modal-btn" id="deleteConfirmBtn" onclick="confirmDeleteVersion()" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; box-shadow: 0 2px 8px rgba(239,68,68,0.3);">Delete</button>
                </div>
            </div>
        </div>
    `;
}

// Register section
window.registerSectionRenderer = window.registerSectionRenderer || function() {};
registerSectionRenderer('agent-versions', loadAgentVersionsData);

// Export functions
window.openApproveModal = openApproveModal;
window.closeApproveModal = closeApproveModal;
window.approveVersion = approveVersion;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.submitEditVersion = submitEditVersion;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDeleteVersion = confirmDeleteVersion;