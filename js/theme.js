import { THEMES } from './config.js';
import { getCurrentUser, getUserData, updateUserData } from './auth.js';

let currentTheme = 'pastel-pink';
let darkMode = false;

export function applyTheme(themeName, isDarkMode) {
    const theme = THEMES[themeName];
    if (!theme) return;
    
    const root = document.documentElement;
    
    if (isDarkMode) {
        root.style.setProperty('--color-primary', theme.accent);
        root.style.setProperty('--color-background', '#1A202C');
        root.style.setProperty('--color-surface', '#2D3748');
        root.style.setProperty('--color-text', '#E2E8F0');
    } else {
        root.style.setProperty('--color-primary', theme.primary);
        root.style.setProperty('--color-background', theme.background);
        root.style.setProperty('--color-surface', theme.surface);
        root.style.setProperty('--color-text', theme.text);
    }
    
    root.style.setProperty('--color-accent', theme.accent);
    
    currentTheme = themeName;
    darkMode = isDarkMode;
}

export async function loadUserTheme() {
    const user = getCurrentUser();
    if (!user) return;
    
    const userData = await getUserData(user.uid);
    if (userData) {
        const theme = userData.theme || 'pastel-pink';
        const isDark = userData.darkMode || false;
        applyTheme(theme, isDark);
    }
}

export async function setTheme(themeName) {
    const user = getCurrentUser();
    applyTheme(themeName, darkMode);
    
    if (user) {
        await updateUserData(user.uid, { theme: themeName });
    }
}

export async function toggleDarkMode() {
    const user = getCurrentUser();
    const newDarkMode = !darkMode;
    applyTheme(currentTheme, newDarkMode);
    
    if (user) {
        await updateUserData(user.uid, { darkMode: newDarkMode });
    }
}

export function getCurrentTheme() {
    return { theme: currentTheme, darkMode };
}
