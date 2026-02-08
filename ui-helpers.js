// ============================================
// UI HELPERS - Common UI Utilities
// ============================================
// Provides reusable UI components and helpers

const UIHelpers = {
    
    // ============================================
    // NOTIFICATIONS
    // ============================================
    
    /**
     * Show a notification toast
     * @param {string} message - Notification message
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in ms (0 for persistent)
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification container if it doesn't exist
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getNotificationIcon(type);
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
            <button class="notification-close">×</button>
        `;
        
        container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Close button handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // Auto-hide if duration is set
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }
        
        return notification;
    },
    
    hideNotification(notification) {
        notification.classList.remove('show');
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    },
    
    getNotificationIcon(type) {
        const icons = {
            success: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
            error: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="9"/><path d="M10 6v4M10 14h.01"/></svg>',
            warning: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
            info: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="9"/><path d="M10 11v4M10 7h.01"/></svg>'
        };
        return icons[type] || icons.info;
    },
    
    // ============================================
    // LOADING STATES
    // ============================================
    
    showLoading(message = 'Loading...') {
        let loader = document.getElementById('global-loader');
        
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'global-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <div class="loader-message">${message}</div>
                </div>
            `;
            document.body.appendChild(loader);
        } else {
            loader.querySelector('.loader-message').textContent = message;
        }
        
        setTimeout(() => loader.classList.add('show'), 10);
    },
    
    hideLoading() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.classList.remove('show');
            setTimeout(() => loader.remove(), 300);
        }
    },
    
    // ============================================
    // MODAL DIALOGS
    // ============================================
    
    /**
     * Show a modal dialog
     * @param {object} options - Modal options
     */
    showModal(options = {}) {
        const {
            title = 'Dialog',
            content = '',
            buttons = [{ text: 'OK', primary: true }],
            closable = true,
            onClose = null
        } = options;
        
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    ${closable ? '<button class="modal-close">×</button>' : ''}
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${buttons.map((btn, i) => `
                        <button class="btn ${btn.primary ? 'btn-primary' : 'btn-secondary'}" data-button-index="${i}">
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Close handler
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
            if (onClose) onClose();
        };
        
        // Close button
        if (closable) {
            modal.querySelector('.modal-close').addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
        
        // Button handlers
        buttons.forEach((btn, i) => {
            const btnElement = modal.querySelector(`[data-button-index="${i}"]`);
            btnElement.addEventListener('click', () => {
                if (btn.onClick) {
                    btn.onClick();
                }
                if (btn.close !== false) {
                    closeModal();
                }
            });
        });
        
        return modal;
    },
    
    /**
     * Show a confirmation dialog
     */
    async confirm(message, title = 'Confirm') {
        return new Promise((resolve) => {
            this.showModal({
                title,
                content: `<p>${message}</p>`,
                buttons: [
                    {
                        text: 'Cancel',
                        onClick: () => resolve(false)
                    },
                    {
                        text: 'Confirm',
                        primary: true,
                        onClick: () => resolve(true)
                    }
                ]
            });
        });
    },
    
    // ============================================
    // DATA EXPORT/IMPORT
    // ============================================
    
    /**
     * Download data as JSON file
     */
    downloadJSON(data, filename = 'export.json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully', 'success');
    },
    
    /**
     * Import JSON file
     */
    async importJSON() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    reject(new Error('No file selected'));
                    return;
                }
                
                try {
                    const text = await file.text();
                    const data = JSON.parse(text);
                    resolve(data);
                    this.showNotification('Data imported successfully', 'success');
                } catch (error) {
                    reject(error);
                    this.showNotification('Failed to import data', 'error');
                }
            };
            
            input.click();
        });
    },
    
    // ============================================
    // FORM UTILITIES
    // ============================================
    
    /**
     * Serialize form data
     */
    serializeForm(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            // Handle multiple values (checkboxes, multi-select)
            if (data[key]) {
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        }
        
        return data;
    },
    
    /**
     * Populate form with data
     */
    populateForm(formElement, data) {
        Object.entries(data).forEach(([key, value]) => {
            const input = formElement.querySelector(`[name="${key}"]`);
            
            if (!input) return;
            
            if (input.type === 'checkbox') {
                input.checked = value;
            } else if (input.type === 'radio') {
                const radio = formElement.querySelector(`[name="${key}"][value="${value}"]`);
                if (radio) radio.checked = true;
            } else {
                input.value = value;
            }
        });
    },
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
    /**
     * Debounce function calls
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Format date for display
     */
    formatDate(dateString, format = 'short') {
        if (!dateString) return '—';
        
        const date = new Date(dateString);
        
        if (format === 'short') {
            return date.toLocaleDateString();
        } else if (format === 'long') {
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else if (format === 'relative') {
            return this.getRelativeTime(date);
        }
        
        return date.toLocaleDateString();
    },
    
    /**
     * Get relative time (e.g., "2 days ago")
     */
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) return 'just now';
        if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    },
    
    /**
     * Format number with thousands separator
     */
    formatNumber(num) {
        return num.toLocaleString();
    },
    
    /**
     * Truncate text with ellipsis
     */
    truncate(text, maxLength = 50) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIHelpers };
}
