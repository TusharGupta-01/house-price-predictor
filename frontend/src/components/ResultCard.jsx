import { motion } from 'framer-motion'
import { HiTrendingUp, HiShieldCheck } from 'react-icons/hi'
import { FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { BsBuildings } from 'react-icons/bs'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export default function ResultCard({ result, form }) {
  const {
    predicted_price_display, predicted_price_lakh,
    confidence_low_display, confidence_high_display,
    price_per_sqft, investment_score, city,
  } = result

  const investColor =
    investment_score >= 70 ? '#22c55e'
    : investment_score >= 40 ? '#f97316'
    : '#ef4444'

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="card p-8 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #4f5ff7, transparent)', transform: 'translate(30%, -30%)' }} />

      <motion.div variants={fadeUp} className="flex items-start justify-between mb-6">
        <div>
          <p className="text-gray-400 text-sm mb-1 flex items-center gap-1.5">
            <HiShieldCheck className="text-green-400" />
            AI Prediction Result
          </p>
          <div className="font-display text-5xl font-black gradient-text leading-tight">
            {predicted_price_display}
          </div>
          {city === 'mumbai' && (
            <p className="text-gray-500 text-sm mt-1">= ₹{predicted_price_lakh} Lakhs</p>
          )}
        </div>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(79,95,247,0.15)', border: '1px solid rgba(79,95,247,0.3)' }}>
          <BsBuildings className="text-primary-400 text-2xl" />
        </div>
      </motion.div>

      {/* Confidence Band */}
      <motion.div variants={fadeUp} className="glass-light rounded-xl p-4 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FiArrowDown className="text-red-400" />
          <span>Low: <strong className="text-white">{confidence_low_display}</strong></span>
        </div>
        <div className="text-gray-600 text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(79,95,247,0.1)', border: '1px solid rgba(79,95,247,0.2)' }}>
          ± 10% band
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>High: <strong className="text-white">{confidence_high_display}</strong></span>
          <FiArrowUp className="text-green-400" />
        </div>
      </motion.div>

      {/* Key metrics */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'City', value: city === 'bengaluru' ? '🏙️ Bengaluru' : '🌊 Mumbai' },
          { label: 'Area', value: `${form.total_sqft} sqft` },
          { label: '₹/sqft', value: `₹${price_per_sqft?.toLocaleString()}` },
        ].map(({ label, value }) => (
          <div key={label} className="glass-light rounded-xl p-3 text-center">
            <div className="text-white font-semibold text-sm">{value}</div>
            <div className="text-gray-600 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Investment Score */}
      <motion.div variants={fadeUp} className="glass-light rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-400 text-sm flex items-center gap-1.5">
            <HiTrendingUp style={{ color: investColor }} />
            Investment Score
          </span>
          <span className="font-bold text-lg" style={{ color: investColor }}>
            {investment_score} / 100
          </span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${investment_score}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            style={{ background: `linear-gradient(90deg, ${investColor}88, ${investColor})` }}
          />
        </div>
        <p className="text-gray-600 text-xs mt-2">
          {investment_score >= 70 ? 'Strong investment potential — high demand locality.'
          : investment_score >= 40 ? 'Moderate investment value — balanced demand and pricing.'
          : 'Lower investment score — verify market conditions.'}
        </p>
      </motion.div>
    </motion.div>
  )
}
