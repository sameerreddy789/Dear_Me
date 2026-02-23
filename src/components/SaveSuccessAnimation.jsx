import { motion } from 'framer-motion'
import { useMemo } from 'react'

const SPARKLE_EMOJIS = ['✨', '🌟', '⭐', '💫', '🎉', '💖', '🦋', '🌸']

/**
 * Generates an array of sparkle particles with random positions and delays.
 */
function useSparkles(count = 14) {
  return useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: SPARKLE_EMOJIS[i % SPARKLE_EMOJIS.length],
      x: (Math.random() - 0.5) * 260,
      y: (Math.random() - 0.5) * 260,
      delay: Math.random() * 0.3,
      scale: 0.6 + Math.random() * 0.8,
      rotation: Math.random() * 360,
    })),
  [count])
}

/**
 * A sparkle / confetti burst overlay shown when an entry is saved.
 */
function SaveSuccessAnimation() {
  const sparkles = useSparkles()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
    >
      {/* sparkle particles */}
      {sparkles.map((s) => (
        <motion.span
          key={s.id}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, s.scale, s.scale, 0],
            x: s.x,
            y: s.y,
            rotate: s.rotation,
          }}
          transition={{ duration: 1, delay: s.delay, ease: 'easeOut' }}
          className="absolute text-2xl pointer-events-none select-none"
          style={{ top: '50%', left: '50%' }}
        >
          {s.emoji}
        </motion.span>
      ))}

      {/* center card */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-white rounded-3xl p-8 shadow-2xl text-center relative z-10"
      >
        <motion.span
          className="text-5xl mb-3 block"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          ✨
        </motion.span>
        <p className="font-['Caveat'] text-2xl text-pink-600">Entry saved!</p>
        <p className="font-['Poppins'] text-sm text-gray-400 mt-1">Keep writing, you're doing great 💕</p>
      </motion.div>
    </motion.div>
  )
}

export default SaveSuccessAnimation
