# DearMe ✨ — Your Digital Diary

A beautiful, lightweight digital diary app built with pure HTML, CSS, and JavaScript.

## 🚀 Quick Start

```bash
# Start local server
python -m http.server 8000

# Open browser
http://localhost:8000
```

## ✨ Features

- 📝 Create and edit diary entries
- 😊 Mood tracking with emojis
- 📅 Calendar view with mood indicators
- 🔥 Daily streak tracking
- 📊 Year heatmap visualization
- 🎨 5 beautiful pastel themes
- 🌙 Dark mode support
- 🔐 Google Sign-In & Email/Password authentication
- 💾 Offline persistence with Firestore

## 📁 Project Structure

```
DearMe/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # All styles
├── js/
│   ├── app.js             # App initialization
│   ├── auth.js            # Authentication
│   ├── config.js          # Firebase configuration
│   ├── entries.js         # Entry CRUD operations
│   ├── router.js          # Client-side routing
│   ├── theme.js           # Theme management
│   ├── components/
│   │   └── navbar.js      # Navigation bar
│   └── pages/
│       ├── login.js       # Login page
│       ├── dashboard.js   # Dashboard
│       ├── editor.js      # Entry editor
│       └── calendar.js    # Calendar view
└── firestore.indexes.json # Firestore indexes configuration
```

## 🔧 Firebase Setup

The app is already configured with Firebase. If you need to use your own Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication (Google + Email/Password)
4. Create Firestore Database
5. Copy your config and update `js/config.js`:

```javascript
export const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Creating Firestore Indexes

When you first run the app, you may see an error about missing indexes:

1. Click the link in the error message
2. Click "Create Index" in Firebase Console
3. Wait 1-2 minutes for the index to build
4. Refresh the app

The app will work with fallback queries while indexes are building.

## 🛠 Tech Stack

- Pure HTML5, CSS3, JavaScript (ES6+)
- Firebase Authentication
- Cloud Firestore
- ES6 Modules
- No build tools or frameworks required

## 📝 Usage

1. **Sign In** - Use Google or create an account with email/password
2. **Write Entry** - Click "Write Today's Entry" button
3. **Select Mood** - Choose how you're feeling with emoji buttons
4. **Rich Text** - Use the toolbar to format your text (bold, italic, lists)
5. **Save** - Your entry is automatically saved to Firestore
6. **View Calendar** - See all your entries organized by date
7. **Track Streak** - Keep your daily writing streak going!

## 🎨 Themes

Choose from 5 beautiful color schemes:
- 🌸 Pastel Pink (default)
- 🌙 Midnight Blue
- 🌻 Soft Yellow
- 🍃 Mint Green
- ☁️ Cloud White

Toggle dark mode for comfortable night-time journaling.

## 🔧 Troubleshooting

### "The query requires an index" Error
- Click the link in the error message
- Click "Create Index" in Firebase Console
- Wait 1-2 minutes
- Refresh the app

### Login Issues
- Verify Firebase Authentication is enabled
- Check Google Sign-In is configured in Firebase Console
- Ensure your Firebase config is correct in `js/config.js`

### 404 Errors
- Make sure you're running a local server (not opening HTML file directly)
- ES6 modules require HTTP/HTTPS protocol

## 📄 License

MIT License

---

<p align="center">
  Made with 💖 and a lot of journaling
</p>
