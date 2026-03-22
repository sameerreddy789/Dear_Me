import { getCurrentUser } from '../auth.js';
import { getEntriesForMonth, getEntry } from '../entries.js';
import { MOOD_EMOJIS, MOOD_COLORS } from '../config.js';
import { renderNavbar } from '../components/navbar.js';

let currentMonth = new Date();
let entries = [];

export async function renderCalendarPage() {
    const app = document.getElementById('app');
    const user = getCurrentUser();
    
    if (!user) {
        window.navigateTo('/login');
        return;
    }
    
    app.innerHTML = `
        ${renderNavbar()}
        <div class="page-container">
            <div class="calendar-header">
                <button class="calendar-nav-btn" id="prev-month">◀</button>
                <h1 class="font-pacifico" style="font-size: 2rem;" id="month-title"></h1>
                <button class="calendar-nav-btn" id="next-month">▶</button>
            </div>
            <div id="calendar-content"><div class="loading"><div class="spinner"></div></div></div>
        </div>
        
        <div id="entry-modal" class="modal-overlay hidden">
            <div class="modal-content">
                <button id="close-modal" style="position: absolute; top: 1rem; right: 1rem; width: 2rem; height: 2rem; border: none; border-radius: 50%; background: rgba(255, 182, 193, 0.2); cursor: pointer; font-size: 1.25rem;">✕</button>
                <div id="modal-body"></div>
            </div>
        </div>
    `;
    
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        loadCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        loadCalendar();
    });
    
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('entry-modal').addEventListener('click', (e) => {
        if (e.target.id === 'entry-modal') closeModal();
    });
    
    await loadCalendar();
}

async function loadCalendar() {
    document.getElementById('month-title').textContent = 
        currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + ' 📅';
    
    try {
        entries = await getEntriesForMonth(currentMonth.getFullYear(), currentMonth.getMonth());
        renderCalendar();
    } catch (error) {
        document.getElementById('calendar-content').innerHTML = `
            <div class="card" style="text-align: center; padding: 2rem;">
                <p style="color: #c33;">Failed to load calendar: ${error.message}</p>
            </div>
        `;
    }
}

function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    while (days.length < 42) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    
    const entryMap = {};
    entries.forEach(entry => {
        entryMap[entry.date.toISOString().split('T')[0]] = entry;
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let html = `
        <div class="calendar-grid" style="margin-bottom: 1rem;">
            ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
                `<div style="text-align: center; font-size: 0.75rem; font-weight: 600; color: #999; padding: 0.5rem;">${day}</div>`
            ).join('')}
        </div>
        <div class="calendar-grid">
    `;
    
    days.forEach(day => {
        const dateStr = day.toISOString().split('T')[0];
        const entry = entryMap[dateStr];
        const isCurrentMonth = day.getMonth() === month;
        const isToday = day.getTime() === today.getTime();
        
        const classes = ['calendar-day'];
        if (isToday) classes.push('today');
        if (entry) classes.push('has-entry');
        
        html += `
            <div class="${classes.join(' ')}" style="${!isCurrentMonth ? 'opacity: 0.3;' : ''}" ${entry ? `onclick="showEntry('${entry.id}')"` : ''}>
                <span style="font-size: 0.85rem;">${day.getDate()}</span>
                ${entry ? `<div class="mood-dot" style="background: ${MOOD_COLORS[entry.mood] || '#d1d5db'};"></div>` : ''}
            </div>
        `;
    });
    
    html += '</div>';
    document.getElementById('calendar-content').innerHTML = html;
}

window.showEntry = async function(entryId) {
    const modal = document.getElementById('entry-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    modal.classList.remove('hidden');
    
    try {
        const entry = await getEntry(entryId);
        const date = entry.date.toDate();
        const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const emoji = MOOD_EMOJIS[entry.mood] || '📝';
        const content = extractText(entry.content);
        
        modalBody.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                <span style="font-size: 2rem;">${emoji}</span>
                <div>
                    <h2 class="font-pacifico" style="font-size: 1.75rem; margin-bottom: 0.25rem;">${entry.title || 'Untitled'}</h2>
                    <p style="font-size: 0.85rem; color: #999;">${dateStr}</p>
                </div>
            </div>
            <div style="white-space: pre-wrap; line-height: 1.8; margin-bottom: 1.5rem;">${content}</div>
            <button class="btn btn-primary" onclick="window.navigateTo('/editor/${entry.id}')" style="width: 100%;">Edit Entry</button>
        `;
    } catch (error) {
        modalBody.innerHTML = `<div style="text-align: center; padding: 2rem;"><p style="color: #c33;">Failed to load entry: ${error.message}</p></div>`;
    }
};

function closeModal() {
    document.getElementById('entry-modal').classList.add('hidden');
}

function extractText(content) {
    if (typeof content === 'string') return content;
    if (!content) return '';
    let text = '';
    function walk(node) {
        if (node.text) text += node.text + ' ';
        if (node.content) node.content.forEach(walk);
    }
    walk(content);
    return text.trim();
}
