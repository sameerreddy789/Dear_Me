import { signOut } from '../auth.js';

export function renderNavbar() {
    return `
        <nav class="navbar">
            <div class="navbar-content">
                <a href="/dashboard" data-link class="navbar-brand">DearMe ✨</a>
                <div class="navbar-menu">
                    <a href="/dashboard" data-link class="navbar-link">Dashboard</a>
                    <a href="/editor" data-link class="navbar-link">New Entry</a>
                    <a href="/calendar" data-link class="navbar-link">Calendar</a>
                    <button onclick="handleSignOut()" class="navbar-link" style="background: none; border: none; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 0.9rem;">
                        Sign Out
                    </button>
                </div>
            </div>
        </nav>
    `;
}

window.handleSignOut = async function() {
    try {
        await signOut();
        window.navigateTo('/login');
    } catch (error) {
        console.error('Sign out failed:', error);
    }
};
