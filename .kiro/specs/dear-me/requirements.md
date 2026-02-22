# Requirements Document

## Introduction

DearMe is a warm, aesthetic, and safe digital diary web application built with React, Tailwind CSS, Framer Motion, and Firebase. It provides users with a private space to write daily diary entries with rich text editing, image uploads, freehand drawing, mood tracking, streak gamification, and motivational quotes — all wrapped in a pastel-themed, page-flip diary experience. This document captures the functional requirements derived from the approved technical design.

## Glossary

- **App**: The DearMe React single-page application
- **Auth_Module**: The Firebase authentication integration managing sign-in, sign-up, sign-out, and PIN lock
- **Dashboard**: The landing page displayed after login showing greeting, streak, quote, and recent entries
- **Diary_Editor**: The rich text entry editor powered by TipTap with image upload and drawing integration
- **Drawing_Canvas**: The Fabric.js-powered freehand drawing component
- **Calendar_View**: The monthly calendar displaying entries color-coded by mood
- **Theme_Provider**: The context provider managing visual themes and dark mode
- **Firestore**: Google Cloud Firestore NoSQL database used for storing user data and diary entries
- **Storage**: Firebase Storage used for image and drawing file uploads
- **Entry**: A single diary entry containing title, rich text content, mood, images, and optional drawing
- **Streak**: A count of consecutive days the user has written a diary entry
- **Mood**: A categorical label for the user's emotional state (happy, sad, productive, romantic, anxious, calm, neutral)
- **Theme**: A named visual palette (pastel-pink, midnight-blue, soft-yellow, mint-green, cloud-white)
- **PIN**: An optional numeric passcode providing client-side diary access protection
- **Quote**: A motivational text with author attribution displayed on the dashboard
- **TipTap_JSONContent**: The JSON serialization format used by the TipTap rich text editor

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to sign in to DearMe securely, so that my diary entries are private and tied to my account.

#### Acceptance Criteria

1. WHEN a user opens the App without an active session, THE Auth_Module SHALL display the login page
2. WHEN a user clicks "Sign in with Google", THE Auth_Module SHALL initiate Firebase Google sign-in via popup and redirect to the Dashboard on success
3. WHEN a user submits valid email and password on the sign-up form, THE Auth_Module SHALL create a new Firebase Auth account and a corresponding user document in Firestore
4. WHEN a user submits valid email and password on the login form, THE Auth_Module SHALL authenticate the user and redirect to the Dashboard
5. WHEN a user clicks sign out, THE Auth_Module SHALL end the Firebase session and redirect to the login page
6. IF Firebase Auth returns an error during sign-in, THEN THE Auth_Module SHALL display a descriptive error message and keep the user on the login page
7. WHEN a new user signs in for the first time, THE Auth_Module SHALL create a Firestore user document with name, email, streak set to 0, and createdAt timestamp

### Requirement 2: Diary PIN Lock

**User Story:** As a user, I want to set an optional PIN on my diary, so that others cannot access my entries even if my device is unlocked.

#### Acceptance Criteria

1. WHERE a user enables the PIN lock feature, THE Auth_Module SHALL prompt the user to set a numeric PIN and store its hash in Firestore
2. WHILE a PIN is set and the session starts, THE App SHALL display a PIN entry screen before showing diary content
3. WHEN a user enters the correct PIN, THE App SHALL grant access to the Dashboard and diary content
4. IF a user enters an incorrect PIN, THEN THE App SHALL display an error message and remain on the PIN entry screen
5. THE Auth_Module SHALL store only the hashed PIN in Firestore, never the plaintext value

### Requirement 3: Dashboard Display

**User Story:** As a user, I want to see a personalized dashboard after login, so that I get a warm greeting, my streak status, a motivational quote, and quick access to recent entries.

#### Acceptance Criteria

1. WHEN a user lands on the Dashboard, THE Dashboard SHALL display a time-of-day greeting using the user's name
2. WHEN a user lands on the Dashboard, THE Dashboard SHALL display the current streak count with a fire emoji
3. WHEN a user lands on the Dashboard, THE Dashboard SHALL display a random motivational quote with a pastel background color
4. WHEN a user lands on the Dashboard, THE Dashboard SHALL list the most recent diary entries as summaries
5. WHEN a user lands on the Dashboard, THE Dashboard SHALL display a mood selector for quick mood logging

### Requirement 4: Diary Entry Creation and Editing

**User Story:** As a user, I want to create and edit diary entries with rich text, so that I can express myself with styled text, images, and drawings.

#### Acceptance Criteria

1. WHEN a user clicks "New Entry", THE Diary_Editor SHALL open with an empty TipTap editor, a mood selector, and a title field
2. WHEN a user types in the TipTap editor, THE Diary_Editor SHALL support font family, font size, text color, and background color customization via a toolbar
3. WHEN a user clicks "Save Entry" with a valid title and content, THE Diary_Editor SHALL save the entry to Firestore with userId, date, title, content as TipTap_JSONContent, mood, images array, drawingURL, theme, createdAt, and updatedAt
4. WHEN a user edits an existing entry, THE Diary_Editor SHALL load the existing content into the editor and update the Firestore document on save
5. WHEN a user saves a new entry, THE Diary_Editor SHALL update the user's streak and longestStreak in Firestore
6. IF the title is empty or exceeds 200 characters, THEN THE Diary_Editor SHALL display a validation error and prevent saving
7. IF the entry date is in the future, THEN THE Diary_Editor SHALL reject the entry and display a validation error
8. THE Diary_Editor SHALL auto-save drafts to localStorage to prevent data loss
9. WHEN a user saves an entry, THE Diary_Editor SHALL display a success animation and redirect to the Dashboard

### Requirement 5: Image Upload

**User Story:** As a user, I want to upload images to my diary entries, so that I can attach photos and visual memories.

#### Acceptance Criteria

1. WHEN a user selects an image file in the Diary_Editor, THE App SHALL upload the file to Firebase Storage at path images/{userId}/{entryId}/{filename}
2. WHEN the upload completes, THE App SHALL embed the download URL in the entry's images array
3. IF the image file exceeds 5MB, THEN THE App SHALL display "Image must be under 5MB" and reject the upload
4. IF the image MIME type is not one of jpeg, png, gif, or webp, THEN THE App SHALL display "Please upload a JPEG, PNG, GIF, or WebP image" and reject the upload
5. THE Diary_Editor SHALL allow a maximum of 10 images per entry
6. IF the image upload fails due to a network error, THEN THE App SHALL display an inline error and allow the user to retry or save the entry without the image

### Requirement 6: Drawing Canvas

**User Story:** As a user, I want to create freehand doodles on a canvas, so that I can add personal drawings to my diary entries.

#### Acceptance Criteria

1. WHEN a user opens the drawing tool in the Diary_Editor, THE Drawing_Canvas SHALL display a Fabric.js canvas with pencil, eraser, color picker, and brush size controls
2. WHEN a user draws on the canvas and clicks save, THE Drawing_Canvas SHALL export the canvas as a PNG data URL
3. WHEN the drawing is saved, THE App SHALL upload the PNG to Firebase Storage at path drawings/{userId}/{entryId}.png and store the download URL in the entry
4. WHEN a user selects the eraser tool, THE Drawing_Canvas SHALL switch to erase mode allowing removal of drawn strokes
5. IF the canvas export fails, THEN THE Drawing_Canvas SHALL display an error message and preserve the canvas state so the user can retry

### Requirement 7: Streak Calculation

**User Story:** As a user, I want my writing streak tracked automatically, so that I stay motivated to write daily.

#### Acceptance Criteria

1. WHEN a user saves a new entry and has no previous entries, THE App SHALL set the streak to 1
2. WHEN a user saves a new entry and the last entry was yesterday, THE App SHALL increment the streak by 1
3. WHEN a user saves a new entry and an entry already exists for today, THE App SHALL keep the streak unchanged
4. WHEN a user saves a new entry and the last entry was more than one day ago, THE App SHALL reset the streak to 1
5. THE App SHALL ensure the streak value is always greater than or equal to 1 after saving an entry
6. WHEN the streak increases, THE App SHALL update longestStreak if the new streak exceeds the current longestStreak
7. THE App SHALL ensure longestStreak is always greater than or equal to the current streak

### Requirement 8: Calendar View

**User Story:** As a user, I want to view my diary entries on a monthly calendar, so that I can browse past entries by date and see my mood patterns.

#### Acceptance Criteria

1. WHEN a user opens the Calendar_View, THE Calendar_View SHALL query Firestore for all entries in the displayed month belonging to the user
2. WHEN entries are loaded, THE Calendar_View SHALL render a monthly grid with mood-colored dots on dates that have entries
3. WHEN a user clicks on a date with an entry, THE Calendar_View SHALL open the entry in read mode with a page-flip animation
4. WHEN a user navigates to a different month, THE Calendar_View SHALL query and display entries for the selected month
5. THE Calendar_View SHALL return only entries belonging to the authenticated user
6. THE Calendar_View SHALL sort entries by date in ascending order
7. WHEN a month has no entries, THE Calendar_View SHALL display the calendar grid without any mood dots

### Requirement 9: Theme System

**User Story:** As a user, I want to choose from pastel themes and toggle dark mode, so that my diary feels personal and visually comfortable.

#### Acceptance Criteria

1. THE Theme_Provider SHALL support five themes: pastel-pink, midnight-blue, soft-yellow, mint-green, and cloud-white
2. WHEN a user selects a theme, THE Theme_Provider SHALL apply the theme's CSS custom properties to the document root
3. WHEN a user toggles dark mode, THE Theme_Provider SHALL adjust background, surface, and text colors to dark variants
4. WHEN a theme is applied, THE Theme_Provider SHALL set all required CSS custom properties including primary, background, surface, text, accent, and paper texture
5. THE Theme_Provider SHALL persist the user's theme preference and dark mode setting in the Firestore user document
6. WHEN the App loads, THE Theme_Provider SHALL apply the user's saved theme preference

### Requirement 10: Motivational Quotes

**User Story:** As a user, I want to see a motivational quote on my dashboard, so that I feel inspired each time I open my diary.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE App SHALL display a random quote from the quotes collection with a pastel background color
2. WHEN the quotes collection has more than one quote and a previous quote was shown, THE App SHALL select a different quote than the previously displayed one
3. THE App SHALL display each quote with its text and author attribution
4. THE App SHALL assign a valid CSS pastel color as the quote background

### Requirement 11: Entry Data Integrity

**User Story:** As a user, I want my diary data to be consistent and valid, so that I never lose content or see corrupted entries.

#### Acceptance Criteria

1. THE App SHALL validate that entry titles are between 1 and 200 characters before saving
2. THE App SHALL validate that entry content is valid TipTap_JSONContent before saving
3. THE App SHALL validate that the mood value is one of: happy, sad, productive, romantic, anxious, calm, or neutral
4. THE App SHALL validate that the images array contains at most 10 valid Firebase Storage URLs
5. THE App SHALL validate that the entry date is not in the future
6. WHEN saving an entry, THE App SHALL use a Firestore transaction to ensure atomicity of the entry write and streak update
7. WHEN a rich text entry is saved and later loaded, THE Diary_Editor SHALL render the content identically to how it was authored (round-trip fidelity)

### Requirement 12: Entry Ownership and Privacy

**User Story:** As a user, I want my diary entries accessible only to me, so that my private thoughts remain secure.

#### Acceptance Criteria

1. THE App SHALL enforce that only the authenticated user can read their own entries
2. THE App SHALL enforce that only the authenticated user can create, update, or delete their own entries
3. IF a request attempts to access another user's entry, THEN THE App SHALL return a permission error and redirect to the Dashboard
4. THE Firestore security rules SHALL enforce request.auth.uid matches the entry's userId on all read and write operations

### Requirement 13: Offline and Error Resilience

**User Story:** As a user, I want my diary to handle network issues gracefully, so that I never lose an entry I am writing.

#### Acceptance Criteria

1. IF a Firestore write fails due to network disconnection, THEN THE App SHALL preserve the entry content in localStorage and display a "Saved locally" banner
2. WHEN network connectivity is restored, THE App SHALL detect the locally saved draft and prompt the user to save it to Firestore
3. IF Firebase Storage upload fails, THEN THE App SHALL display an inline error and allow the entry to be saved without the failed attachment
4. IF Firebase free tier limits are exceeded, THEN THE App SHALL display a friendly maintenance page with estimated recovery information
