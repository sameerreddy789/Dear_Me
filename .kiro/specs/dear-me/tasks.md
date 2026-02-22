# Implementation Plan: DearMe — Digital Diary Application

## Overview

Build a React + Vite + Tailwind CSS + Firebase digital diary web app from scratch, following a phased approach: project scaffolding and auth first, then rich editing and media, then canvas and calendar, and finally themes, animations, and polish. Each task builds incrementally on previous work so there is no orphaned code.

## Tasks

- [x] 1. Project scaffolding and core configuration
  - [x] 1.1 Initialize Vite + React + TypeScript project and install all dependencies
    - Run `npm create vite@latest . -- --template react-ts`
    - Install runtime deps: `tailwindcss postcss autoprefixer framer-motion @tiptap/react @tiptap/starter-kit @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-font-family @tiptap/extension-highlight fabric firebase react-router-dom date-fns react-calendar-heatmap`
    - Install dev deps: `vitest @testing-library/react @testing-library/jest-dom jsdom fast-check @types/react @types/react-dom`
    - Configure `tailwind.config.js` with Pacifico, Caveat, Poppins font families and pastel color palette
    - Configure `vite.config.ts` with test settings for Vitest
    - Add Google Fonts link (Pacifico, Caveat, Poppins) to `index.html`
    - _Requirements: 9.1_

  - [x] 1.2 Create directory structure and core TypeScript types
    - Create `src/types/index.ts` with all shared interfaces: `User`, `DiaryEntry`, `DiaryEntryInput`, `Mood`, `ThemeName`, `Theme`, `Quote`, `DrawingToolState`, `MoodEntry`, `DashboardData`, `DiaryEntrySummary`
    - Create folder structure: `src/components/`, `src/pages/`, `src/hooks/`, `src/contexts/`, `src/services/`, `src/utils/`, `src/data/`
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 1.3 Set up Firebase configuration and service initialization
    - Create `src/services/firebase.ts` initializing Firebase app, Auth, Firestore, and Storage
    - Use environment variables (`import.meta.env`) for Firebase config values
    - Create `.env.example` with placeholder Firebase config keys
    - _Requirements: 1.2, 1.3_

  - [x] 1.4 Set up React Router with route definitions and layout shell
    - Create `src/App.tsx` with `BrowserRouter` and route definitions for `/login`, `/dashboard`, `/editor/:entryId?`, `/calendar`
    - Create `src/components/Layout.tsx` as a shared layout wrapper with navigation
    - Create placeholder page components: `LoginPage`, `DashboardPage`, `EditorPage`, `CalendarPage`
    - _Requirements: 1.1, 1.2_

- [x] 2. Authentication module
  - [x] 2.1 Implement AuthContext and AuthProvider
    - Create `src/contexts/AuthContext.tsx` implementing `AuthContextType` interface
    - Use `onAuthStateChanged` to listen for auth state changes
    - Implement `signInWithGoogle` using `signInWithPopup` with `GoogleAuthProvider`
    - Implement `signInWithEmail` and `signUp` using Firebase email/password auth
    - Implement `signOut` to end session
    - On first sign-in, create Firestore user document at `users/{uid}` with name, email, streak: 0, longestStreak: 0, createdAt
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 2.2 Implement LoginPage with Google and email/password sign-in
    - Create `src/pages/LoginPage.tsx` with Google sign-in button and email/password form
    - Display error messages on auth failure
    - Redirect to Dashboard on successful sign-in
    - Style with Tailwind using pastel theme and Pacifico heading font
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

  - [x] 2.3 Implement ProtectedRoute component
    - Create `src/components/ProtectedRoute.tsx` that redirects unauthenticated users to `/login`
    - Wrap Dashboard, Editor, and Calendar routes with ProtectedRoute
    - Show loading spinner while auth state is resolving
    - _Requirements: 1.1, 12.1, 12.2_

  - [ ]* 2.4 Write unit tests for AuthProvider
    - Test that unauthenticated state shows login page
    - Test error message display on auth failure
    - _Requirements: 1.1, 1.6_

- [ ] 3. Checkpoint — Auth and routing
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Core diary entry services and validation
  - [ ] 4.1 Implement entry validation utilities
    - Create `src/utils/validation.ts` with functions: `validateTitle(title)`, `validateMood(mood)`, `validateImages(images)`, `validateEntryDate(date)`, `validateEntryInput(input)`
    - Title: 1–200 characters, non-empty after trim
    - Mood: must be one of the 7 valid Mood values
    - Images: array length ≤ 10, each item is a valid URL string
    - Date: must not be in the future
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 4.6, 4.7_

  - [ ]* 4.2 Write property test for entry date validation
    - **Property 10: Date Boundary**
    - For any Date d where d > now(), `validateEntryDate(d)` returns invalid. For any Date d where d ≤ now(), `validateEntryDate(d)` returns valid.
    - **Validates: Requirements 11.5, 4.7**

  - [ ] 4.3 Implement calculateStreak utility
    - Create `src/utils/streak.ts` implementing `calculateStreak(lastEntryDate, currentDate, currentStreak)`
    - Handle all four cases: null (first entry), same day, consecutive day, streak broken
    - Return `{ newStreak }` as a pure function
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 4.4 Write property tests for streak calculation
    - **Property 2: Streak Monotonic Reset** — For any valid call, `newStreak ≥ 1`
    - **Validates: Requirements 7.5**
    - **Property 3: Longest Streak Invariant** — For any sequence of streak calculations, `Math.max(longestStreak, newStreak) ≥ newStreak`
    - **Validates: Requirements 7.6, 7.7**
    - Test idempotency: `calculateStreak(today, today, n).newStreak === n` for any n ≥ 1
    - Test consecutive: `calculateStreak(yesterday, today, n).newStreak === n + 1`
    - Test broken: `calculateStreak(twoDaysAgo, today, n).newStreak === 1`

  - [ ] 4.5 Implement saveEntry service with Firestore transaction
    - Create `src/services/entries.ts` with `saveEntry(userId, input, existingEntryId?)` function
    - Use `runTransaction` for atomic entry write + streak update
    - Set `createdAt` on new entries, always set `updatedAt`
    - Call `calculateStreak` and update user document with new streak and longestStreak
    - Validate input before saving using validation utilities
    - _Requirements: 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4, 7.6, 11.6_

  - [ ] 4.6 Implement getEntriesForMonth and getEntry services
    - Add `getEntriesForMonth(userId, year, month)` to `src/services/entries.ts`
    - Query Firestore with `where('userId', '==', userId)` and date range filters
    - Sort results by date ascending
    - Add `getEntry(entryId, userId)` that verifies ownership before returning
    - _Requirements: 8.1, 8.5, 8.6, 12.1, 12.2_

  - [ ]* 4.7 Write property test for entry ownership isolation
    - **Property 1: Entry Ownership Isolation** — `getEntry(entryId, userId)` returns data only if `entry.userId === userId`
    - **Validates: Requirements 12.1, 12.2**

- [ ] 5. Checkpoint — Core services and validation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Dashboard page
  - [ ] 6.1 Implement Dashboard page with greeting, streak, quote, and recent entries
    - Create `src/pages/DashboardPage.tsx`
    - Display time-of-day greeting (morning/afternoon/evening) with user's name
    - Show streak count with 🔥 emoji
    - Display a random motivational quote with pastel background
    - List recent diary entries as clickable summaries
    - Add "New Entry" button linking to `/editor`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 6.2 Implement quotes data and getRandomQuote utility
    - Create `src/data/quotes.json` with at least 20 motivational quotes with text, author, and category
    - Create `src/utils/quotes.ts` implementing `getRandomQuote(quotes, previousQuoteId?)`
    - Ensure non-repetition when quotes.length > 1
    - Assign a pastel background color from a predefined palette
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 6.3 Write property test for quote non-repetition
    - **Property 8: Quote Non-Repetition** — For any quotes array with length > 1 and any previousQuoteId, `getRandomQuote(quotes, previousQuoteId).id !== previousQuoteId`
    - **Validates: Requirements 10.2**

  - [ ] 6.4 Implement mood selector component
    - Create `src/components/MoodSelector.tsx` displaying the 7 mood options with emoji icons
    - Allow single mood selection with visual highlight
    - _Requirements: 3.5, 11.3_

- [ ] 7. Diary editor — basic writing and saving
  - [ ] 7.1 Implement DiaryEditor page with TipTap rich text editor
    - Create `src/pages/EditorPage.tsx` with title input, mood selector, and TipTap editor
    - Configure TipTap with StarterKit, TextStyle, Color, FontFamily, Highlight extensions
    - Create `src/components/EditorToolbar.tsx` with font family (Poppins, Caveat, Pacifico), font size, text color, and background color controls
    - _Requirements: 4.1, 4.2_

  - [ ] 7.2 Wire save entry flow in EditorPage
    - On "Save Entry" click, validate input and call `saveEntry` service
    - Display validation errors for empty/long title and future date
    - Show success animation (Framer Motion) and redirect to Dashboard
    - _Requirements: 4.3, 4.5, 4.6, 4.7, 4.9_

  - [ ] 7.3 Implement edit existing entry flow
    - When `entryId` route param is present, load entry from Firestore
    - Populate editor with existing title, content, mood, and images
    - On save, update existing entry (no streak change)
    - _Requirements: 4.4_

  - [ ] 7.4 Implement auto-save drafts to localStorage
    - Periodically save editor state (title, content, mood) to localStorage
    - On EditorPage mount, check for existing draft and offer to restore
    - Clear draft on successful save to Firestore
    - _Requirements: 4.8, 13.1_

  - [ ]* 7.5 Write property test for rich text round-trip
    - **Property 5: Rich Text Round-Trip** — For any valid TipTap JSONContent, `JSON.parse(JSON.stringify(content))` deep-equals the original content
    - **Validates: Requirements 11.7**

- [ ] 8. Checkpoint — Editor and dashboard functional
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Image upload
  - [ ] 9.1 Implement image upload service
    - Create `src/services/storage.ts` with `uploadImage(userId, entryId, file)` function
    - Validate file size (≤ 5MB) and MIME type (jpeg, png, gif, webp) before upload
    - Upload to Firebase Storage at `images/{userId}/{entryId}/{filename}`
    - Return download URL on success
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 9.2 Integrate image upload into DiaryEditor
    - Add image upload button to EditorToolbar
    - Display uploaded images as thumbnails below the editor
    - Enforce max 10 images per entry
    - Show inline error messages for size/type/network failures
    - Allow entry save without failed images
    - _Requirements: 5.2, 5.5, 5.6_

  - [ ]* 9.3 Write property test for image upload validation
    - **Property 4: Image Upload Integrity** — For any file with size > 5MB, upload is rejected. For any file with MIME type not in {jpeg, png, gif, webp}, upload is rejected.
    - **Validates: Requirements 5.3, 5.4**

- [ ] 10. Drawing canvas
  - [ ] 10.1 Implement DrawingCanvas component with Fabric.js
    - Create `src/components/DrawingCanvas.tsx` with Fabric.js canvas initialization
    - Implement pencil tool, eraser tool, color picker, and brush size slider
    - Export canvas as PNG data URL on save
    - Provide close button to dismiss canvas without saving
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ] 10.2 Integrate DrawingCanvas into DiaryEditor
    - Add "Open Drawing" button in EditorPage
    - Show DrawingCanvas as a modal overlay
    - On canvas save, upload PNG to Firebase Storage at `drawings/{userId}/{entryId}.png`
    - Store download URL in entry's `drawingURL` field
    - Display saved drawing as a preview thumbnail in the editor
    - Handle export failure with error toast and preserved canvas state
    - _Requirements: 6.3, 6.5_

- [ ] 11. Calendar view and streak heatmap
  - [ ] 11.1 Implement CalendarView page
    - Create `src/pages/CalendarPage.tsx` with a monthly calendar grid
    - Query entries for the displayed month using `getEntriesForMonth`
    - Render mood-colored dots on dates with entries
    - Support month navigation (previous/next)
    - Show empty grid for months with no entries
    - _Requirements: 8.1, 8.2, 8.4, 8.7_

  - [ ] 11.2 Implement entry read mode with page-flip animation
    - On date click, open the entry in a read-only view
    - Use Framer Motion for page-flip transition animation
    - Display full entry content, images, and drawing
    - _Requirements: 8.3_

  - [ ] 11.3 Implement streak heatmap on Dashboard
    - Add `react-calendar-heatmap` component to DashboardPage
    - Query entry dates for the past year
    - Color-code heatmap cells by mood
    - _Requirements: 3.2_

  - [ ]* 11.4 Write property test for calendar-entry consistency
    - **Property 6: Calendar-Entry Consistency** — For any month, the set of dates with mood dots equals the set of dates with entries in Firestore for that user and month
    - **Validates: Requirements 8.1, 8.2**

- [ ] 12. Checkpoint — Full feature set functional
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Theme system
  - [ ] 13.1 Implement ThemeProvider context and theme application
    - Create `src/contexts/ThemeContext.tsx` with `ThemeProvider` component
    - Define all 5 themes (pastel-pink, midnight-blue, soft-yellow, mint-green, cloud-white) with their color values
    - Implement `applyTheme(themeName, darkMode)` setting CSS custom properties on `:root`
    - Support dark mode toggle adjusting background, surface, and text colors
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 13.2 Persist theme preference and apply on load
    - Save selected theme and dark mode to Firestore user document on change
    - On app load, read user's theme preference and apply it
    - _Requirements: 9.5, 9.6_

  - [ ] 13.3 Create theme picker UI component
    - Create `src/components/ThemePicker.tsx` showing 5 theme swatches and a dark mode toggle
    - Integrate into Dashboard or a settings panel
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 13.4 Write property test for theme application completeness
    - **Property 7: Theme Application Completeness** — For every `themeName` in ThemeName and both `darkMode` values, `applyTheme` sets all required CSS custom properties (primary, background, surface, text, accent, paper-texture)
    - **Validates: Requirements 9.4**

- [ ] 14. PIN lock feature
  - [ ] 14.1 Implement PIN set and verify functionality
    - Add `setPin(pin)` and `verifyPin(pin)` to AuthContext
    - Hash PIN client-side before storing in Firestore
    - Create `src/components/PinLockScreen.tsx` with numeric PIN input
    - Show PIN screen on session start if PIN is set
    - Display error on incorrect PIN, grant access on correct PIN
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 15. Animations and polish
  - [ ] 15.1 Add Framer Motion page transitions and micro-animations
    - Add `AnimatePresence` and page transition animations to route changes
    - Add floating/breathing animations to dashboard elements
    - Add entry save success animation (confetti or sparkle effect)
    - Add hover and tap animations to buttons and cards
    - _Requirements: 4.9, 8.3_

  - [ ] 15.2 Implement offline resilience and error handling
    - Enable Firestore offline persistence
    - On save failure, store entry in localStorage and show "Saved locally" banner
    - On reconnection, detect draft and prompt user to sync
    - Handle Storage upload failures with inline errors
    - Add friendly maintenance page for quota exceeded scenarios
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 16. Entry ownership enforcement
  - [ ] 16.1 Create Firestore security rules file
    - Create `firestore.rules` enforcing `request.auth.uid == resource.data.userId` on all entry reads and writes
    - Enforce user document access restricted to own UID
    - Enforce Storage rules for user-scoped paths
    - _Requirements: 12.3, 12.4_

  - [ ]* 16.2 Write property test for PIN security
    - **Property 9: PIN Security** — For any user with a PIN set, `verifyPin(correctPin)` returns true and `verifyPin(wrongPin)` returns false. Stored value is always a hash, never plaintext.
    - **Validates: Requirements 2.3, 2.4, 2.5**

- [ ] 17. Final checkpoint — Complete application
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at each phase boundary
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All code uses TypeScript as specified in the design document
