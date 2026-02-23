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
import { hashPin } from '../utils/pinHash'

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
  const [pinLocked, setPinLocked] = useState(false)
  const [pinHash, setPinHash] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await createUserDocIfNeeded(firebaseUser)
        setUser(firebaseUser)

        // Check if user has a PIN set
        const userRef = doc(db, 'users', firebaseUser.uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          const userData = userSnap.data()
          if (userData.pinHash) {
            setPinHash(userData.pinHash)
            setPinLocked(true)
          } else {
            setPinHash(null)
            setPinLocked(false)
          }
        }
      } else {
        setUser(null)
        setPinLocked(false)
        setPinHash(null)
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

  /**
   * Verify a PIN against the stored hash.
   * @param {string} pin - The plaintext PIN to verify
   * @returns {Promise<boolean>}
   */
  const verifyPin = async (pin) => {
    if (!user) return false
    const hashed = await hashPin(pin)
    if (hashed === pinHash) {
      setPinLocked(false)
      return true
    }
    return false
  }

  /**
   * Set (or update) the user's PIN. Hashes before storing.
   * @param {string} pin - The plaintext PIN to set
   */
  const setPin = async (pin) => {
    if (!user) return
    const hashed = await hashPin(pin)
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, { pinHash: hashed })
    setPinHash(hashed)
    // Don't lock immediately after setting — user is already authenticated
  }

  const value = {
    user,
    loading,
    pinLocked,
    pinHash,
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
