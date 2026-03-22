# DearMe ✨ — Your Digital Diary

> _A warm, aesthetic, and safe space to capture your thoughts, doodles, and memories — one page at a time._

DearMe is a beautiful digital diary web app designed for anyone who loves journaling. Available in two versions: React (full-featured) and Vanilla JavaScript (lightweight).

---

## 📦 Two Versions Available

### 🎯 Vanilla JavaScript Version (Recommended for Quick Start)
**Location:** `/vanilla` folder

Pure HTML, CSS, and JavaScript - no build tools required!

```bash
cd vanilla
python -m http.server 8000
```

**Features:**
- ✅ No build step required
- ✅ Smaller bundle size
- ✅ Faster initial load
- ✅ All core features included
- ✅ Firebase authentication & database
- ✅ Mood tracking & calendar
- ✅ Streak tracking & themes

[📖 Vanilla Version Documentation](./vanilla/README.md)

---

### ⚛️ React Version (Full-Featured)
**Location:** Root folder

Advanced features with React, TipTap, and Fabric.js

```bash
npm install
npm run dev
```

**Additional Features:**
- 🎨 Drawing canvas with Fabric.js
- ✍️ Advanced rich text editor (TipTap)
- 🖼️ Image uploads
- 🎬 Framer Motion animations
- 🔒 PIN lock security

---

## 🌸 Core Features (Both Versions)

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Google sign-in and email/password |
| 📝 **Diary Entries** | Create and edit journal entries |
| 😊 **Mood Tracking** | Track your emotions with emojis |
| 📅 **Calendar View** | Monthly calendar with mood indicators |
| 🔥 **Streak System** | Daily writing streaks with heatmap |
| 🎀 **Themes** | 5 beautiful pastel color schemes |
| 🌙 **Dark Mode** | Easy on the eyes for night writing |
| 💾 **Offline Support** | Works offline with Firestore persistence |

---

## 🚀 Quick Start

### For Vanilla Version (Easiest)

1. **Clone the repository**
   ```bash
   git clone https://github.com/sameerreddy789/Dear_Me.git
   cd Dear_Me/vanilla
   ```

2. **Start local server**
   ```bash
   python -m http.server 8000
   ```

3. **Open browser**
   ```
   http://localhost:8000
   ```

4. **Sign in and start journaling!**

### For React Version

1. **Clone and install**
   ```bash
   git clone https://github.com/sameerreddy789/Dear_Me.git
   cd Dear_Me
   npm install
   ```

2. **Configure Firebase**
   - Copy `.env.example` to `.env`
   - Add your Firebase credentials

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:5173
   ```

---

## 🛠 Tech Stack

### Vanilla Version
- HTML5, CSS3, JavaScript (ES6+)
- Firebase (Auth, Firestore)
- ES6 Modules
- No build tools

### React Version
- React 19
- Vite
- Tailwind CSS
- TipTap (Rich text editor)
- Fabric.js (Drawing canvas)
- Framer Motion (Animations)
- Firebase (Auth, Firestore, Storage)

---

## 📁 Project Structure

```
Dear_Me/
├── vanilla/              # Vanilla JS version (standalone)
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── README.md
├── src/                  # React version
│   ├── components/
│   ├── pages/
│   ├── contexts/
│   └── services/
├── package.json
└── README.md
```

---

## 🔧 Firebase Setup

Both versions require Firebase:

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Google + Email/Password)
3. Create Firestore Database
4. Copy your config credentials

**For Vanilla:** Edit `vanilla/js/config.js`  
**For React:** Edit `.env` file

---

## 🧪 Testing

React version includes comprehensive tests:

```bash
npm run test
```

---

## 📄 License

MIT License

---

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---

<p align="center">
  Made with 💖 and a lot of journaling
</p>
