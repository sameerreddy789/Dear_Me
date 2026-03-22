// Firebase Configuration
// Replace these with your actual Firebase config values
export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Constants
export const MOODS = ['happy', 'sad', 'productive', 'romantic', 'anxious', 'calm', 'neutral'];

export const MOOD_EMOJIS = {
    happy: '😊',
    sad: '😢',
    productive: '💪',
    romantic: '💕',
    anxious: '😰',
    calm: '😌',
    neutral: '😐'
};

export const MOOD_COLORS = {
    happy: '#fde047',
    sad: '#93c5fd',
    productive: '#86efac',
    romantic: '#f9a8d4',
    anxious: '#fdba74',
    calm: '#5eead4',
    neutral: '#d1d5db'
};

export const THEMES = {
    'pastel-pink': {
        primary: '#FFB6C1',
        background: '#FFF5F7',
        surface: '#FFFFFF',
        text: '#4A2040',
        accent: '#FF69B4'
    },
    'midnight-blue': {
        primary: '#2C5282',
        background: '#1A202C',
        surface: '#2D3748',
        text: '#E2E8F0',
        accent: '#63B3ED'
    },
    'soft-yellow': {
        primary: '#F6E05E',
        background: '#FFFFF0',
        surface: '#FFFFFF',
        text: '#744210',
        accent: '#ECC94B'
    },
    'mint-green': {
        primary: '#9AE6B4',
        background: '#F0FFF4',
        surface: '#FFFFFF',
        text: '#22543D',
        accent: '#48BB78'
    },
    'cloud-white': {
        primary: '#E2E8F0',
        background: '#FFFFFF',
        surface: '#FFFFFF',
        text: '#2D3748',
        accent: '#A0AEC0'
    }
};

export const MAX_IMAGES = 10;
export const MAX_TITLE_LENGTH = 200;
