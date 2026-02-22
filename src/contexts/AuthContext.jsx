import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

const AuthContext = createContext(null)

const googleProvider = new GoogleAuthProvider()

/**
 * Creates a Firestore user document for first-time users.
 */
async function createUserDocIfNeeded(firebaseUser) {
  const userRef = doc(db, 'users', firebaseUser.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: firebaseUser.displayName || '',
      email: firebaseUser.email || '',
      streak: 0,
      longestStreak: 0,
      theme: 'pastel-pink',
      darkMode: false,
      pinHash: null,
      lastEntryDate: null,
      createdAt: serverTimestamp(),
    })
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await createUserDocIfNeeded(firebaseUser)
        setUser(firebaseUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    await createUserDocIfNeeded(result.user)
  }

  const signInWithEmail = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    // Create user doc with the provided name
    const userRef = doc(db, 'users', result.user.uid)
    await setDoc(userRef, {
      name: name || '',
      email: result.user.email || '',
      streak: 0,
      longestStreak: 0,
      theme: 'pastel-pink',
      darkMode: false,
      pinHash: null,
      lastEntryDate: null,
      createdAt: serverTimestamp(),
    })
  }

  const signOutUser = async () => {
    await firebaseSignOut(auth)
  }

  const verifyPin = async (pin) => {
    if (!user) return false
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return false
    const userData = userSnap.data()
    if (!userData.pinHash) return false
    return userData.pinHash === btoa(pin)
  }

  const setPin = async (pin) => {
    if (!user) return
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, { pinHash: btoa(pin) })
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut: signOutUser,
    verifyPin,
    setPin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
