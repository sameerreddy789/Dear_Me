import { firebaseConfig } from './config.js';

let auth, db;
let currentUser = null;
let authStateListeners = [];

export function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded');
        return;
    }
    
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    
    db.enablePersistence().catch((err) => console.warn('Persistence failed:', err));
    
    auth.onAuthStateChanged(async (user) => {
        currentUser = user;
        if (user) await createUserDocIfNeeded(user);
        authStateListeners.forEach(callback => callback(user));
    });
}

export function onAuthStateChange(callback) {
    authStateListeners.push(callback);
    callback(currentUser);
}

export function getCurrentUser() {
    return currentUser;
}

export async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    await createUserDocIfNeeded(result.user);
    return result.user;
}

export async function signInWithEmail(email, password) {
    const result = await auth.signInWithEmailAndPassword(email, password);
    return result.user;
}

export async function signUpWithEmail(email, password, name) {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    const userRef = db.collection('users').doc(result.user.uid);
    await userRef.set({
        name: name || '',
        email: result.user.email || '',
        streak: 0,
        longestStreak: 0,
        theme: 'pastel-pink',
        darkMode: false,
        pinHash: null,
        lastEntryDate: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return result.user;
}

export async function signOut() {
    await auth.signOut();
}

async function createUserDocIfNeeded(user) {
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
        await userRef.set({
            name: user.displayName || '',
            email: user.email || '',
            streak: 0,
            longestStreak: 0,
            theme: 'pastel-pink',
            darkMode: false,
            pinHash: null,
            lastEntryDate: null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
}

export async function getUserData(userId) {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    return userDoc.exists ? userDoc.data() : null;
}

export async function updateUserData(userId, data) {
    const userRef = db.collection('users').doc(userId);
    await userRef.update(data);
}

export { db };
