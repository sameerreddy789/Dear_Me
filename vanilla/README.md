# DearMe - Vanilla JavaScript Version

This is a vanilla HTML/CSS/JavaScript conversion of the DearMe React diary application.

## 🚀 Quick Start

### 1. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Google Sign-In and Email/Password)
3. Create a Firestore Database
4. Enable Firebase Storage (optional, for images and drawings)
5. Copy your Firebase configuration

### 2. Configuration

Edit `js/config.js` and replace the placeholder values with your Firebase config:

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

### 3. Run the Application

Since this uses ES6 modules, you need to serve it through a web server (not just opening the HTML file).

**Option 1: Using Python**
```bash
cd vanilla
python -m http.server 8000
```

**Option 2: Using Node.js http-server**
```bash
npm install -g http-server
cd vanilla
http-server -p 8000
```

**Option 3: Using VS Code Live Server**
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

Then open your browser to `http://localhost:8000`

## 📁 Project Structure

```
vanilla/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # All styles
├── js/
│   ├── config.js          # Firebase config and constants
│   ├── auth.js            # Authentication logic
│   ├── entries.js         # Entry CRUD operations
│   ├── theme.js           # Theme management
│   ├── router.js          # Client-side routing
│   ├── app.js             # Main app initialization
│   ├── pages/
│   │   ├── login.js       # Login page
│   │   ├── dashboard.js   # Dashboard page
│   │   ├── editor.js      # Entry editor page
│   │   └── calendar.js    # Calendar view page
│   └── components/
│       └── navbar.js      # Navigation bar component
└── README.md
```

## ✨ Features

- ✅ Google Sign-In and Email/Password Authentication
- ✅ Create, Read, Update diary entries
- ✅ Mood tracking with emoji indicators
- ✅ Rich text editing (bold, italic, underline, lists)
- ✅ Calendar view with mood-colored dots
- ✅ Streak tracking and heatmap visualization
- ✅ Theme customization
- ✅ Offline persistence with Firestore
- ✅ Client-side routing (SPA experience)

## 🎨 Customization

### Themes

Edit the `THEMES` object in `js/config.js` to customize colors:

```javascript
export const THEMES = {
    'pastel-pink': {
        primary: '#FFB6C1',
        background: '#FFF5F7',
        // ... more colors
    }
};
```

### Moods

Add or modify moods in `js/config.js`:

```javascript
export const MOODS = ['happy', 'sad', 'productive', 'romantic', 'anxious', 'calm', 'neutral'];

export const MOOD_EMOJIS = {
    happy: '😊',
    // ... more moods
};
```

## 🔒 Firestore Security Rules

Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /entries/{entryId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## 📝 Key Differences from React Version

1. **No Build Step**: Pure HTML/CSS/JS - no compilation needed
2. **Manual DOM Manipulation**: Direct DOM updates instead of virtual DOM
3. **Event Delegation**: Manual event listener management
4. **Simpler State Management**: No React hooks, just plain JavaScript variables
5. **Module System**: ES6 modules instead of React components
6. **Routing**: Custom client-side router instead of React Router
7. **Simplified Editor**: ContentEditable instead of TipTap (for simplicity)

## 🚧 Limitations

This vanilla version includes the core features but omits some advanced functionality:

- No drawing canvas (Fabric.js integration would require additional setup)
- No image upload (requires Firebase Storage setup)
- Simplified rich text editor (no TipTap)
- No animations (no Framer Motion)
- No PIN lock feature
- No offline sync prompts

These features can be added by including the respective libraries and implementing the logic.

## 🛠 Adding Missing Features

### To add image uploads:

1. Include Firebase Storage in your HTML
2. Implement upload functions in `js/entries.js`
3. Add file input to the editor page

### To add animations:

1. Include a library like Anime.js or GSAP
2. Add animation classes to CSS
3. Trigger animations on page transitions

### To add drawing canvas:

1. Include Fabric.js via CDN
2. Create a drawing component
3. Integrate with the editor page

## 📄 License

MIT License - Same as the original React version

## 🤝 Contributing

Feel free to submit issues and enhancement requests!
