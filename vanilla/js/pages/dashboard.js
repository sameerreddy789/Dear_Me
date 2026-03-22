import { getCurrentUser, getUserData, signOut } from '../auth.js';
import { getRecentEntries, getEntriesForYear } from '../entries.js';
import { MOOD_EMOJIS, MOOD_COLORS } from '../config.js';
import { renderNavbar } from '../components/navbar.js';

export async function renderDashboardPage() {
    const app = document.getElementById('app');
    const user = getCurrentUser();
    
    if (!user) {
        window.navigateTo('/login');
        return;
    }
    
    app.innerHTML = `
        ${renderNavbar()}
        <div class="page-container">
            <div id="dashboard-content">
                <div class="loading">
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    `;
    
    try {
        const [userData, recentEntries, yearEntries] = await Promise.all([
            getUserData(user.uid),
            getRecentEntries(5),
            getEntriesForYear(new Date().getFullYear())
        ]);
        
        const greeting = getGreeting();
        const displayName = userData?.name || user.displayName || 'Friend';
        const streak = userData?.streak || 0;
        
        document.getElementById('dashboard-content').innerHTML = `
            <h1 class="font-pacifico" style="font-size: 2.5rem; margin-bottom: 2rem;">
                ${greeting.text}, ${displayName} ${greeting.emoji}
            </h1>
            
            <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; align-items: center;">
                <div class="card" style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem;">
                    <span style="font-size: 2rem;">🔥</span>
                    <span style="font-size: 1.25rem; font-weight: 600;">${streak} day streak</span>
                </div>
                
                <button class="btn btn-primary" onclick="window.navigateTo('/editor')" style="margin-left: auto;">
                    ✏️ Write Today's Entry
                </button>
            </div>
            
            <div class="card mb-4">
                <h2 class="font-caveat" style="font-size: 1.5rem; margin-bottom: 1rem;">
                    Your Year in Entries 🗓️
                </h2>
                <div id="heatmap-container"></div>
            </div>
            
            <div class="card mb-4">
                <h2 class="font-caveat" style="font-size: 1.5rem; margin-bottom: 1rem;">
                    Recent Entries 📝
                </h2>
                <div id="recent-entries"></div>
            </div>
        `;
        
        renderHeatmap(yearEntries);
        renderRecentEntries(recentEntries);
        
    } catch (error) {
        document.getElementById('dashboard-content').innerHTML = `
            <div class="card" style="text-align: center; padding: 2rem;">
                <p style="color: #c33;">Failed to load dashboard: ${error.message}</p>
            </div>
        `;
    }
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', emoji: '🌅' };
    if (hour < 18) return { text: 'Good Afternoon', emoji: '☀️' };
    return { text: 'Good Evening', emoji: '🌙' };
}

function renderHeatmap(entries) {
    const container = document.getElementById('heatmap-container');
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    // Create a map of dates to moods
    const entryMap = {};
    entries.forEach(entry => {
        const dateStr = entry.date.toISOString().split('T')[0];
        entryMap[dateStr] = entry.mood;
    });
    
    // Simple heatmap visualization
    let html = '<div style="display: grid; grid-template-columns: repeat(53, 1fr); gap: 2px;">';
    
    for (let i = 0; i < 365; i++) {
        const date = new Date(oneYearAgo);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const mood = entryMap[dateStr];
        const color = mood ? MOOD_COLORS[mood] : '#e5e7eb';
        
        html += `<div style="width: 10px; height: 10px; background: ${color}; border-radius: 2px;" title="${dateStr}${mood ? ' - ' + mood : ''}"></div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function renderRecentEntries(entries) {
    const container = document.getElementById('recent-entries');
    
    if (entries.length === 0) {
        container.innerHTML = '<p style="color: #999; font-size: 0.9rem;">No entries yet. Start writing your first diary entry!</p>';
        return;
    }
    
    let html = '<div style="display: flex; flex-direction: column; gap: 0.75rem;">';
    
    entries.forEach(entry => {
        const date = entry.date.toDate();
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const content = extractText(entry.content).slice(0, 100);
        const emoji = MOOD_EMOJIS[entry.mood] || '📝';
        
        html += `
            <div class="card" onclick="window.navigateTo('/editor/${entry.id}')" style="cursor: pointer; transition: all 0.3s;">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 1rem;">
                    <div style="flex: 1; min-width: 0;">
                        <h3 style="font-weight: 500; margin-bottom: 0.5rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${entry.title || 'Untitled'}
                        </h3>
                        <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                            ${content}
                        </p>
                        <span style="font-size: 0.75rem; color: #999;">${dateStr}</span>
                    </div>
                    <span style="font-size: 1.5rem;">${emoji}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function extractText(content) {
    if (typeof content === 'string') return content;
    if (!content) return '';
    
    let text = '';
    function walk(node) {
        if (node.text) text += node.text;
        if (node.content) node.content.forEach(walk);
    }
    walk(content);
    return text;
}
