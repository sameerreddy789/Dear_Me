import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../auth.js';

export function renderLoginPage() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #FFE4E1, #FFF0F5, #FFE4E1); padding: 1rem;">
            <div class="card" style="max-width: 450px; width: 100%;">
                <h1 class="font-pacifico text-center" style="font-size: 2.5rem; color: var(--color-accent); margin-bottom: 0.5rem;">
                    DearMe ✨
                </h1>
                <p class="text-center" style="color: #FFB6C1; margin-bottom: 2rem; font-size: 0.9rem;">
                    Your safe, beautiful diary
                </p>
                
                <div id="error-message" class="hidden" style="background: #fee; border: 1px solid #fcc; padding: 0.75rem; border-radius: 0.75rem; margin-bottom: 1rem; color: #c33; font-size: 0.85rem;"></div>
                
                <button id="google-signin-btn" class="btn btn-primary" style="width: 100%; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; gap: 0.75rem;">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign in with Google
                </button>
                
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="flex: 1; height: 1px; background: rgba(255, 182, 193, 0.3);"></div>
                    <span style="font-size: 0.75rem; color: #FFB6C1;">or</span>
                    <div style="flex: 1; height: 1px; background: rgba(255, 182, 193, 0.3);"></div>
                </div>
                
                <form id="auth-form">
                    <div id="name-field" class="form-group hidden">
                        <input type="text" id="name-input" class="form-input" placeholder="Your name">
                    </div>
                    
                    <div class="form-group">
                        <input type="email" id="email-input" class="form-input" placeholder="Email" required>
                    </div>
                    
                    <div class="form-group">
                        <input type="password" id="password-input" class="form-input" placeholder="Password" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        <span id="submit-text">Sign In</span>
                    </button>
                </form>
                
                <p class="text-center" style="margin-top: 1.5rem; font-size: 0.85rem; color: #666;">
                    <span id="toggle-text">Don't have an account?</span>
                    <button id="toggle-mode-btn" type="button" style="background: none; border: none; color: var(--color-accent); font-weight: 500; cursor: pointer; text-decoration: underline;">
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
    `;
    
    let isSignUp = false;
    
    const errorDiv = document.getElementById('error-message');
    const nameField = document.getElementById('name-field');
    const submitText = document.getElementById('submit-text');
    const toggleText = document.getElementById('toggle-text');
    const toggleBtn = document.getElementById('toggle-mode-btn');
    
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
    
    function hideError() {
        errorDiv.classList.add('hidden');
    }
    
    function toggleMode() {
        isSignUp = !isSignUp;
        if (isSignUp) {
            nameField.classList.remove('hidden');
            submitText.textContent = 'Create Account';
            toggleText.textContent = 'Already have an account?';
            toggleBtn.textContent = 'Sign In';
        } else {
            nameField.classList.add('hidden');
            submitText.textContent = 'Sign In';
            toggleText.textContent = "Don't have an account?";
            toggleBtn.textContent = 'Sign Up';
        }
        hideError();
    }
    
    document.getElementById('google-signin-btn').addEventListener('click', async () => {
        hideError();
        try {
            await signInWithGoogle();
            window.navigateTo('/dashboard');
        } catch (error) {
            showError(error.message || 'Google sign-in failed');
        }
    });
    
    document.getElementById('auth-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        
        const email = document.getElementById('email-input').value;
        const password = document.getElementById('password-input').value;
        const name = document.getElementById('name-input').value;
        
        try {
            if (isSignUp) {
                await signUpWithEmail(email, password, name);
            } else {
                await signInWithEmail(email, password);
            }
            window.navigateTo('/dashboard');
        } catch (error) {
            showError(error.message || 'Authentication failed');
        }
    });
    
    toggleBtn.addEventListener('click', toggleMode);
}
