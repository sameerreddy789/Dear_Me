# DearMe ✨ — Your Digital Diary

> _A warm, aesthetic, and safe space to capture your thoughts, doodles, and memories — one page at a time._

DearMe is a beautiful digital diary web app designed for anyone who loves journaling but wants something more personal than a plain text editor. Write rich entries, draw doodles, track your mood, build streaks, and wrap it all in soft pastel themes that feel like home.

---

## 📸 Screenshots

> _Screenshots coming soon! Stay tuned for a peek at DearMe's pastel-powered interface._

---

## 🌸 Features

| | Feature | Description |
|---|---|---|
| 🔐 | **Authentication** | Google sign-in and email/password with Firebase Auth |
| ✍️ | **Rich Text Editor** | TipTap-powered editor with fonts, colors, sizes, and formatting |
| 🎨 | **Drawing Canvas** | Freehand doodles with pencil, eraser, and color tools via Fabric.js |
| 😊 | **Mood Tracking** | Log your mood per entry — happy, calm, productive, romantic, and more |
| 📅 | **Calendar View** | Monthly calendar with mood-colored dots and click-to-open entries |
| 🔥 | **Streak System** | Daily writing streaks with a heatmap to keep you motivated |
| 🎀 | **Themes** | 5 gorgeous pastel themes to match your vibe |
| 💬 | **Motivational Quotes** | A fresh quote every day to brighten your page |
| 🔒 | **PIN Lock** | Extra privacy layer for your diary |
| 🌙 | **Dark Mode** | Easy on the eyes for late-night journaling |

---

## 🛠 Tech Stack

| Technology | Role |
|---|---|
| [React](https://react.dev) | UI framework |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations & page transitions |
| [TipTap](https://tiptap.dev) | Rich text editor |
| [Fabric.js](http://fabricjs.com) | Drawing canvas |
| [Firebase](https://firebase.google.com) | Auth, Firestore, Storage |
| [date-fns](https://date-fns.org) | Date utilities |
| [react-calendar-heatmap](https://github.com/kevinsqi/react-calendar-heatmap) | Streak visualization |
| [Pacifico / Caveat / Poppins](https://fonts.google.com) | Typography |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- A **Firebase** project with Auth, Firestore, and Storage enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/dearme.git
cd dearme

# Install dependencies
npm install
```

### Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Google sign-in** and **Email/Password** in Authentication
3. Create a **Firestore** database
4. Enable **Firebase Storage**
5. Copy your Firebase config and create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start journaling 🌷

---

## 📁 Project Structure

```
dearme/
├── public/
│   └── textures/            # Paper texture assets
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Route pages (Dashboard, Editor, Calendar, Login)
│   ├── context/             # AuthProvider, ThemeProvider
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Firebase service functions (auth, entries, storage)
│   ├── utils/               # Helpers (streak calc, date utils, quotes)
│   ├── data/                # Static data (quotes.json)
│   ├── styles/              # Global styles and Tailwind config
│   ├── App.tsx
│   └── main.tsx
├── .env                     # Firebase config (not committed)
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## 🎀 Design Themes

DearMe ships with 5 hand-picked themes:

| Theme | Vibe |
|---|---|
| 🌸 **Pastel Pink** | Soft, warm, and romantic |
| 🌙 **Midnight Blue** | Deep, calm, and reflective |
| 🌻 **Soft Yellow** | Sunny, cheerful, and bright |
| 🍃 **Mint Green** | Fresh, peaceful, and grounding |
| ☁️ **Cloud White** | Clean, minimal, and airy |

Each theme includes matching paper textures, shadows, and accent colors.

---

## 📋 Development Phases

| Phase | Focus |
|---|---|
| **Phase 1** | Authentication (Google + email/password) and basic diary entry creation |
| **Phase 2** | Rich text editing, color/font customization, and image uploads |
| **Phase 3** | Drawing canvas, calendar view, and streak heatmap |
| **Phase 4** | Themes, animations, motivational quotes system, and polish |

---

## 🧪 Testing

- **Vitest** — Fast unit and integration test runner
- **React Testing Library** — Component testing with a focus on user behavior
- **fast-check** — Property-based testing for core logic (streak calculation, quote selection, theme application)

```bash
# Run tests
npm run test

# Run with coverage
npm run test -- --coverage
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please keep the code clean, write tests for new features, and follow the existing code style.

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with 💖 and a lot of journaling
</p>
