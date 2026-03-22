import { getCurrentUser } from '../auth.js';
import { saveEntry, getEntry } from '../entries.js';
import { MOODS, MOOD_EMOJIS } from '../config.js';
import { renderNavbar } from '../components/navbar.js';

export async function renderEditorPage() {
    const app = document.getElementById('app');
    const user = getCurrentUser();
    
    if (!user) {
        window.navigateTo('/login');
        return;
    }
    
    const path = window.location.pathname;
    const entryId = path.split('/')[2];
    
    app.innerHTML = `
        ${renderNavbar()}
        <div class="page-container">
            <div id="editor-content">
                ${entryId ? '<div class="loading"><div class="spinner"></div></div>' : ''}
            </div>
        </div>
    `;
    
    let existingEntry = null;
    
    if (entryId) {
        try {
            existingEntry = await getEntry(entryId);
        } catch (error) {
            document.getElementById('editor-content').innerHTML = `
                <div class="card" style="text-align: center; padding: 2rem;">
                    <p style="color: #c33;">Failed to load entry: ${error.message}</p>
                </div>
            `;
            return;
        }
    }
    
    const title = existingEntry?.title || '';
    const content = extractText(existingEntry?.content) || '';
    const mood = existingEntry?.mood || 'neutral';
    
    document.getElementById('editor-content').innerHTML = `
        <h1 class="font-caveat" style="font-size: 2.5rem; margin-bottom: 2rem;">
            ${entryId ? '✏️ Edit Entry' : '📝 New Entry'}
        </h1>
        
        <div id="error-message" class="hidden" style="background: #fee; border: 1px solid #fcc; padding: 0.75rem; border-radius: 0.75rem; margin-bottom: 1rem; color: #c33; font-size: 0.85rem;"></div>
        
        <div id="success-message" class="hidden" style="background: #efe; border: 1px solid #cfc; padding: 0.75rem; border-radius: 0.75rem; margin-bottom: 1rem; color: #3c3; font-size: 0.85rem; text-align: center;">
            ✨ Entry saved successfully!
        </div>
        
        <form id="entry-form">
            <div class="form-group">
                <label class="form-label">Title</label>
                <input type="text" id="title-input" class="form-input" placeholder="Give your entry a title..." maxlength="200" value="${title}" style="font-family: 'Caveat', cursive; font-size: 1.25rem;">
                <p style="font-size: 0.75rem; color: #999; text-align: right; margin-top: 0.25rem;">
                    <span id="title-count">${title.length}</span>/200
                </p>
            </div>
            
            <div class="form-group">
                <label class="form-label">How are you feeling?</label>
                <div class="mood-selector" id="mood-selector">
                    ${MOODS.map(m => `
                        <button type="button" class="mood-btn ${m === mood ? 'active' : ''}" data-mood="${m}">
                            <span class="mood-emoji">${MOOD_EMOJIS[m]}</span>
                            <span>${m}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Content</label>
                <div class="editor-toolbar">
                    <button type="button" class="toolbar-btn" data-command="bold" title="Bold">
                        <strong>B</strong>
                    </button>
                    <button type="button" class="toolbar-btn" data-command="italic" title="Italic">
                        <em>I</em>
                    </button>
                    <button type="button" class="toolbar-btn" data-command="underline" title="Underline">
                        <u>U</u>
                    </button>
                    <div style="width: 1px; height: 20px; background: #ddd; margin: 0 0.25rem;"></div>
                    <button type="button" class="toolbar-btn" data-command="insertUnorderedList" title="Bullet List">
                        • List
                    </button>
                    <button type="button" class="toolbar-btn" data-command="insertOrderedList" title="Numbered List">
                        1. List
                    </button>
                </div>
                <div class="editor-container" id="content-editor" contenteditable="true" style="outline: none; padding: 1.5rem; min-height: 400px;">
                    ${content || 'Start writing your thoughts...'}
                </div>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                <button type="button" class="btn btn-secondary" onclick="window.navigateTo('/dashboard')">
                    Cancel
                </button>
                <button type="submit" class="btn btn-primary" id="save-btn">
                    ${entryId ? 'Update Entry' : 'Save Entry'}
                </button>
            </div>
        </form>
    `;
    
    setupEditor(entryId);
}

function setupEditor(entryId) {
    const titleInput = document.getElementById('title-input');
    const titleCount = document.getElementById('title-count');
    const contentEditor = document.getElementById('content-editor');
    const moodButtons = document.querySelectorAll('.mood-btn');
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    const form = document.getElementById('entry-form');
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    let selectedMood = document.querySelector('.mood-btn.active')?.dataset.mood || 'neutral';
    
    // Title character count
    titleInput.addEventListener('input', () => {
        titleCount.textContent = titleInput.value.length;
    });
    
    // Mood selection
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            moodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedMood = btn.dataset.mood;
        });
    });
    
    // Toolbar commands
    toolbarButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const command = btn.dataset.command;
            document.execCommand(command, false, null);
            contentEditor.focus();
        });
    });
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        errorDiv.classList.add('hidden');
        successDiv.classList.add('hidden');
        
        const title = titleInput.value.trim();
        const content = contentEditor.innerText;
        
        if (!title) {
            errorDiv.textContent = 'Please enter a title';
            errorDiv.classList.remove('hidden');
            return;
        }
        
        const saveBtn = document.getElementById('save-btn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        try {
            await saveEntry({
                title,
                content,
                mood: selectedMood,
                images: [],
                drawingURL: null,
                theme: 'pastel-pink',
                date: new Date()
            }, entryId);
            
            successDiv.classList.remove('hidden');
            
            setTimeout(() => {
                window.navigateTo('/dashboard');
            }, 1200);
            
        } catch (error) {
            errorDiv.textContent = error.message || 'Failed to save entry';
            errorDiv.classList.remove('hidden');
            saveBtn.disabled = false;
            saveBtn.textContent = entryId ? 'Update Entry' : 'Save Entry';
        }
    });
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
