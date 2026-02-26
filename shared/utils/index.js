/**
 * Panacea — Shared Utilities
 */

/**
 * Format time string (HH:MM) to 12-hour format
 * @param {string} time24 - "08:00", "14:30"
 * @returns {string} "8:00 AM", "2:30 PM"
 */
function formatTime12(time24) {
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get today's date in YYYY-MM-DD
 * @returns {string}
 */
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Calculate stock percentage
 * @param {number} remaining
 * @param {number} total
 * @returns {number} 0-100
 */
function stockPercentage(remaining, total) {
    if (total <= 0) return 0;
    return Math.round((remaining / total) * 100);
}

/**
 * Check if stock is low (below 20%)
 * @param {number} remaining
 * @param {number} total
 * @returns {boolean}
 */
function isLowStock(remaining, total) {
    return stockPercentage(remaining, total) <= 20;
}

/**
 * Format file size to human-readable
 * @param {number} bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone number (basic)
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
    return /^\+?[\d\s\-()]{7,15}$/.test(phone);
}

/**
 * Generate a greeting based on time of day
 * @returns {string}
 */
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

/**
 * Debounce a function
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Export for both CJS (backend) and ESM (frontend)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatTime12,
        getTodayDate,
        stockPercentage,
        isLowStock,
        formatFileSize,
        isValidEmail,
        isValidPhone,
        getGreeting,
        debounce,
    };
}

export {
    formatTime12,
    getTodayDate,
    stockPercentage,
    isLowStock,
    formatFileSize,
    isValidEmail,
    isValidPhone,
    getGreeting,
    debounce,
};
