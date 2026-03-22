import { getCurrentUser } from './auth.js';

let routes = {};

export function registerRoute(path, handler) {
    routes[path] = handler;
}

export function navigate(path) {
    window.history.pushState({}, '', path);
    renderCurrentRoute();
}

export function renderCurrentRoute() {
    const path = window.location.pathname;
    const user = getCurrentUser();
    
    if (!user && path !== '/login') {
        navigate('/login');
        return;
    }
    
    if (user && path === '/login') {
        navigate('/dashboard');
        return;
    }
    
    let handler = routes[path];
    
    if (!handler) {
        for (const route in routes) {
            if (route.includes(':')) {
                const pattern = route.replace(/:[^/]+/g, '([^/]+)');
                const regex = new RegExp(`^${pattern}$`);
                if (path.match(regex)) {
                    handler = routes[route];
                    break;
                }
            }
        }
    }
    
    if (!handler) handler = routes['/dashboard'];
    if (handler) handler();
}

window.addEventListener('popstate', renderCurrentRoute);

document.addEventListener('click', (e) => {
    if (e.target.matches('[data-link]')) {
        e.preventDefault();
        navigate(e.target.getAttribute('href'));
    }
});
