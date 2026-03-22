import { getCurrentUser } from './auth.js';

let currentRoute = '/';
let routes = {};

export function registerRoute(path, handler) {
    routes[path] = handler;
}

export function navigate(path) {
    currentRoute = path;
    window.history.pushState({}, '', path);
    renderCurrentRoute();
}

export function renderCurrentRoute() {
    const path = window.location.pathname;
    const user = getCurrentUser();
    
    // Redirect logic
    if (!user && path !== '/login') {
        navigate('/login');
        return;
    }
    
    if (user && path === '/login') {
        navigate('/dashboard');
        return;
    }
    
    // Find matching route
    let handler = routes[path];
    
    // Handle dynamic routes (e.g., /editor/:id)
    if (!handler) {
        for (const route in routes) {
            if (route.includes(':')) {
                const pattern = route.replace(/:[^/]+/g, '([^/]+)');
                const regex = new RegExp(`^${pattern}$`);
                const match = path.match(regex);
                if (match) {
                    handler = routes[route];
                    break;
                }
            }
        }
    }
    
    // Default to dashboard
    if (!handler) {
        handler = routes['/dashboard'];
    }
    
    if (handler) {
        handler();
    }
}

// Handle browser back/forward
window.addEventListener('popstate', renderCurrentRoute);

// Handle link clicks
document.addEventListener('click', (e) => {
    if (e.target.matches('[data-link]')) {
        e.preventDefault();
        navigate(e.target.getAttribute('href'));
    }
});
