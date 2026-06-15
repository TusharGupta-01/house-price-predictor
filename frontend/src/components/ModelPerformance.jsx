/**
 * ModelPerformance — Displays R², MAE, RMSE for both city models.
 * Data sourced from /api/model-performance.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiChip, HiShieldCheck } from 'react-icons/hi'
import { FiActivity, FiTarget } from 'react-icons/fi'
import { getModelPerformance } from '../services/api'

const MetricPill = ({ label, value, color }) => (
  <div className="glass-light rounded-xl px-4 py-3 text-center">
    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{label}</p>
    <p className="font-display font-bold text-lg" style={{ color }}>{value}</p>
  </div>
)

const modelIcon = { 'Random Forest': '🌲', 'XGBoost': '🚀', 'Gradient Boosting': '⚡', 'Linear Regression': '📈', 'Decision Tree': '🌳' }

function CityModelCard({ cityData, cityLabel, delay }) {
  if (!cityData) return null

  // Find the best model entry from models[]
  const bestModelName = cityData.best_model
  const bestEntry = (cityData.models || []).find((m) => m.model === bestModelName) || {}
  const { MAE = 0, RMSE = 0, R2 = 0 } = bestEntry
  const r2Pct = (R2 * 100).toFixed(1)
  const barWidth = Math.max(0, Math.min(100, R2 * 100))

  // All models for comparison table
  const models = cityData.models || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{cityLabel}</p>
          <h4 className="font-display font-bold text-white text-lg flex items-center gap-2">
            <span>{modelIcon[bestModelName] || '🤖'}</span>
            {bestModelName}
          </h4>
        </div>
        <div className="badge badge-green flex items-center gap-1">
          <HiShieldCheck /> Best Model
        </div>
      </div>

      {/* R² progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-400 flex items-center gap-1"><FiTarget /> R² Score</span>
          <span className="font-bold text-green-400">{r2Pct}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
            style={{ background: 'linear-gradient(90deg, #22c55e, #4ade80)' }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Model explains {r2Pct}% of price variance · CV R²: {((cityData.cv_r2_mean || R2) * 100).toFixed(1)}% ± {((cityData.cv_r2_std || 0) * 100).toFixed(1)}%
        </p>
      </div>

      {/* Metric pills */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <MetricPill label="MAE" value={`₹${MAE.toFixed(1)}L`} color="#f97316" />
        <MetricPill label="RMSE" value={`₹${RMSE.toFixed(1)}L`} color="#a78bfa" />
        <MetricPill label="Train / Test" value={`${cityData.train_size}/${cityData.test_size}`} color="#22c55e" />
      </div>

      {/* Model comparison mini-table */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">All Models Compared</p>
        <div className="space-y-1.5">
          {models.map((m) => (
            <div key={m.model} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs ${m.model === bestModelName ? 'bg-primary-500/10 border border-primary-500/20' : 'glass-light'}`}>
              <span className="w-4 text-center">{modelIcon[m.model] || '•'}</span>
              <span className="flex-1 text-gray-300">{m.model}</span>
              <span className="font-mono text-green-400">{(m.R2 * 100).toFixed(1)}%</span>
              <span className="font-mono text-orange-400">{m.MAE.toFixed(1)}L</span>
              {m.model === bestModelName && <span className="badge badge-blue text-[10px] px-1.5 py-0">Best</span>}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function ModelPerformance() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getModelPerformance()
      .then((res) => setData(res.data?.metrics || res.data))
      .catch(() => setError('Could not load model metrics. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="card p-6 space-y-4">
            <div className="shimmer h-6 w-40 rounded-lg" />
            <div className="shimmer h-4 w-full rounded-lg" />
            <div className="shimmer h-16 w-full rounded-lg" />
            <div className="shimmer h-32 w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8 text-center text-red-400">
        <FiActivity className="text-4xl mx-auto mb-3 opacity-50" />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <HiChip className="text-primary-400 text-xl" />
        <h3 className="font-display font-bold text-white text-xl">Model Performance</h3>
        <span className="text-gray-500 text-sm ml-auto">Evaluated on held-out test set</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CityModelCard cityData={data?.bengaluru} cityLabel="🏙️ Bengaluru" delay={0} />
        <CityModelCard cityData={data?.mumbai} cityLabel="🌊 Mumbai" delay={0.15} />
      </div>
    </div>
  )
}
