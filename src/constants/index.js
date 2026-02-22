export const MOODS = ['happy', 'sad', 'productive', 'romantic', 'anxious', 'calm', 'neutral'];

export const MOOD_EMOJIS = {
  happy: '😊',
  sad: '😢',
  productive: '💪',
  romantic: '💕',
  anxious: '😰',
  calm: '😌',
  neutral: '😐',
};

export const THEME_NAMES = ['pastel-pink', 'midnight-blue', 'soft-yellow', 'mint-green', 'cloud-white'];

export const THEMES = {
  'pastel-pink': {
    name: 'pastel-pink',
    primary: '#FFB6C1',
    secondary: '#FFF0F5',
    background: '#FFF5F7',
    surface: '#FFFFFF',
    text: '#4A2040',
    accent: '#FF69B4',
    paperTexture: '/textures/paper-light.png',
    shadow: 'shadow-lg shadow-pink-200/50',
  },
  'midnight-blue': {
    name: 'midnight-blue',
    primary: '#1E3A5F',
    secondary: '#2C5282',
    background: '#1A202C',
    surface: '#2D3748',
    text: '#E2E8F0',
    accent: '#63B3ED',
    paperTexture: '/textures/paper-dark.png',
    shadow: 'shadow-lg shadow-blue-900/50',
  },
  'soft-yellow': {
    name: 'soft-yellow',
    primary: '#F6E05E',
    secondary: '#FEFCBF',
    background: '#FFFFF0',
    surface: '#FFFFFF',
    text: '#744210',
    accent: '#ECC94B',
    paperTexture: '/textures/paper-warm.png',
    shadow: 'shadow-lg shadow-yellow-200/50',
  },
  'mint-green': {
    name: 'mint-green',
    primary: '#9AE6B4',
    secondary: '#F0FFF4',
    background: '#F0FFF4',
    surface: '#FFFFFF',
    text: '#22543D',
    accent: '#48BB78',
    paperTexture: '/textures/paper-light.png',
    shadow: 'shadow-lg shadow-green-200/50',
  },
  'cloud-white': {
    name: 'cloud-white',
    primary: '#E2E8F0',
    secondary: '#F7FAFC',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#2D3748',
    accent: '#A0AEC0',
    paperTexture: '/textures/paper-light.png',
    shadow: 'shadow-lg shadow-gray-200/50',
  },
};

export const MAX_IMAGES = 10;
export const MAX_TITLE_LENGTH = 200;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
