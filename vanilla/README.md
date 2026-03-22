# DearMe - Vanilla JavaScript Version

A beautiful digital diary app built with pure HTML, CSS, and JavaScript.

## 🚀 Quick Start

### 1. Run the App

```bash
cd vanilla
python -m http.server 8000
```

Then open: `http://localhost:8000`

### 2. Firebase Setup (Already Configured)

The app is already connected to Firebase. If you need to change the configuration:

1. Edit `js/config.js`
2. Replace the `firebaseConfig` values with your Firebase project credentials

### 3. Create Firestore Indexes

When you first run the app, you may see an error about missing indexes:

**Solution:** Click the link in the error message, it will take you to Firebase Console where you can click "Create Index". Wait 1-2 minutes for it to build.

## ✨ Features

- 📝 Create and edit diary entries
- 😊 Mood tracking with emojis
- 📅 Calendar view with mood indicators
- 🔥 Daily streak tracking
- 📊 Year heatmap visualization
- 🎨 5 beautiful themes
- 🌙 Dark mode support
- 🔐 Google Sign-In & Email/Password authentication
- 💾 Offline persistence

## 📁 Project Structure

```
vanilla/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # All styles
├── js/
│   ├── app.js             # App initialization
│   ├── auth.js            # Authentication
│   ├── config.js          # Firebase config
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
└── firestore.indexes.json # Firestore indexes
```

## 🛠 Tech Stack

- Pure HTML5, CSS3, JavaScript (ES6+)
- Firebase Authentication
- Cloud Firestore
- ES6 Modules
- No build tools required

## 📝 Usage

1. **Sign In** - Use Google or Email/Password
2. **Write Entry** - Click "Write Today's Entry"
3. **Select Mood** - Choose how you're feeling
4. **Save** - Your entry is saved to Firestore
5. **View Calendar** - See all your entries by date
6. **Track Streak** - Keep your daily writing streak going!

## 🔧 Troubleshooting

### Index Error
If you see "The query requires an index":
- Click the link in the error message
- Click "Create Index" in Firebase Console
- Wait 1-2 minutes
- Refresh the app

### Login Issues
- Make sure Firebase Authentication is enabled
- Check that Google Sign-In is configured
- Verify your Firebase config in `js/config.js`

### 404 Errors
- Make sure you're running a local server (not opening the HTML file directly)
- ES6 modules require HTTP server

## 📄 License

MIT License
