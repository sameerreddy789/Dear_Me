# Firebase Setup Instructions

## Issue: Firestore Index Required

If you see an error like "The query requires an index", follow these steps:

### Method 1: Automatic (Recommended)

1. **Click the link in the error message** - It looks like:
   ```
   https://console.firebase.google.com/v1/r/project/dearme-9d252/firestore/indexes?create_composite=...
   ```

2. Click the **"Create Index"** button

3. Wait 1-2 minutes for the index to build

4. Refresh your app

### Method 2: Manual Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)

2. Select your project: **dearme-9d252**

3. Click **Firestore Database** in the left menu

4. Click the **Indexes** tab

5. Click **Create Index**

6. Create these two indexes:

#### Index 1: Recent Entries (Descending)
- Collection ID: `entries`
- Fields to index:
  - `userId` - Ascending
  - `date` - Descending
- Query scope: Collection

#### Index 2: Calendar/Year Entries (Ascending)
- Collection ID: `entries`
- Fields to index:
  - `userId` - Ascending
  - `date` - Ascending
- Query scope: Collection

7. Wait for indexes to build (usually 1-2 minutes)

8. Refresh your app

### Method 3: Using Firebase CLI

If you have Firebase CLI installed:

```bash
cd vanilla
firebase deploy --only firestore:indexes
```

This will deploy the indexes from `firestore.indexes.json`.

## Why are indexes needed?

Firestore requires indexes for queries that:
- Filter by one field AND sort by another field
- Use multiple inequality filters

Our app queries entries by `userId` and sorts by `date`, which requires a composite index.

## Troubleshooting

If indexes are still building:
- Check the Indexes tab in Firebase Console
- Status should show "Enabled" (green)
- If "Building", wait a few more minutes

If you get permission errors:
- Make sure you're logged into the correct Google account
- Verify you have Owner/Editor role on the Firebase project
