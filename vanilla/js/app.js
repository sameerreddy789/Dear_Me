import { initializeFirebase, onAuthStateChange } from './auth.js';
import { registerRoute, renderCurrentRoute, navigate } from './router.js';
import { loadUserTheme } from './theme.js';
import { renderLoginPage } from './pages/login.js';
import { renderDashboardPage } from './pages/dashboard.js';
import { renderEditorPage } from './pages/editor.js';
import { renderCalendarPage } from './pages/calendar.js';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    
    // Register routes
    registerRoute('/login', renderLoginPage);
    registerRoute('/dashboard', renderDashboardPage);
    registerRoute('/editor', renderEditorPage);
    registerRoute('/editor/:id', renderEditorPage);
    registerRoute('/calendar', renderCalendarPage);
    
    // Listen to auth state changes
    onAuthStateChange(async (user) => {
        if (user) {
            await loadUserTheme();
        }
        renderCurrentRoute();
    });
});

// Export navigate for use in other modules
window.navigateTo = navigate;
