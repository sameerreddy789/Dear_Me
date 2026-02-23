import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

/**
 * Friendly maintenance page shown when Firebase quota is exceeded.
 * Displays a calming message and allows the user to retry.
 * Requirement 13.4
 */
function MaintenancePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl"
      >
        <div className="text-6xl mb-4">🌙</div>
        <h1 className="font-['Caveat'] text-3xl text-gray-800 mb-3">
          DearMe is taking a short break
        </h1>
        <p className="font-['Poppins'] text-gray-600 text-sm mb-6 leading-relaxed">
          We've reached our usage limit for now. Your entries are safe — 
          everything will be back to normal shortly. Please try again in a few minutes.
        </p>
        <div className="flex flex-col gap-3">
          <motion.button
            type="button"
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-pink-500 text-white rounded-2xl font-['Poppins'] font-medium hover:bg-pink-600 transition-colors cursor-pointer"
          >
            Try Again
          </motion.button>
          <p className="font-['Poppins'] text-xs text-gray-400">
            Estimated recovery: within 24 hours
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default MaintenancePage
