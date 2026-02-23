import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const PIN_LENGTH = 4

function PinLockScreen() {
  const { verifyPin } = useAuth()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)

  const handleDigit = async (digit) => {
    if (verifying) return
    setError('')

    const next = pin + digit
    setPin(next)

    if (next.length === PIN_LENGTH) {
      setVerifying(true)
      const ok = await verifyPin(next)
      if (!ok) {
        setError('Incorrect PIN. Try again.')
        setPin('')
      }
      setVerifying(false)
    }
  }

  const handleBackspace = () => {
    if (verifying) return
    setError('')
    setPin((prev) => prev.slice(0, -1))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background,#FFF5F7)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-[var(--color-surface,#FFFFFF)] shadow-lg max-w-xs w-full"
      >
        <h1 className="font-['Pacifico'] text-2xl text-[var(--color-text,#4A2040)]">
          DearMe
        </h1>
        <p className="font-['Poppins'] text-sm text-[var(--color-text,#4A2040)] opacity-70">
          Enter your PIN to unlock
        </p>

        {/* PIN dots */}
        <div className="flex gap-3">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <motion.div
              key={i}
              animate={error ? { x: [0, -4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                i < pin.length
                  ? 'bg-pink-400 border-pink-400'
                  : 'bg-transparent border-pink-300'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="font-['Poppins'] text-xs text-red-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(String(d))}
              disabled={verifying}
              className="w-14 h-14 rounded-full bg-pink-50 hover:bg-pink-100 active:bg-pink-200 text-lg font-['Poppins'] font-semibold text-[var(--color-text,#4A2040)] transition-colors disabled:opacity-50"
            >
              {d}
            </button>
          ))}
          {/* Bottom row: empty, 0, backspace */}
          <div />
          <button
            onClick={() => handleDigit('0')}
            disabled={verifying}
            className="w-14 h-14 rounded-full bg-pink-50 hover:bg-pink-100 active:bg-pink-200 text-lg font-['Poppins'] font-semibold text-[var(--color-text,#4A2040)] transition-colors disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={verifying}
            className="w-14 h-14 rounded-full bg-pink-50 hover:bg-pink-100 active:bg-pink-200 text-sm font-['Poppins'] text-[var(--color-text,#4A2040)] transition-colors disabled:opacity-50"
            aria-label="Backspace"
          >
            ⌫
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default PinLockScreen
