/**
 * DashboardPage — Analytics & Model Performance dashboard.
 * Fetches city analytics and model metrics from the Flask backend.
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChartBar, HiLightningBolt } from 'react-icons/hi'
import { FiRefreshCw, FiAlertCircle } from 'react-icons/fi'
import { BsBuildings } from 'react-icons/bs'
import { getAnalytics } from '../services/api'
import {
  TopLocalitiesChart,
  BhkDistChart,
  PriceDistChart,
  BhkPriceChart,
} from '../components/AnalyticsChart'
import ModelPerformance from '../components/ModelPerformance'

const CITIES = [
  { id: 'bengaluru', label: '🏙️ Bengaluru' },
  { id: 'mumbai', label: '🌊 Mumbai' },
]

function StatCard({ label, value, sub, color = '#4f5ff7', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-5"
    >
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="font-display font-bold text-2xl" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </motion.div>
  )
}

export default function DashboardPage() {
  const [city, setCity] = useState('bengaluru')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAnalytics = useCallback(async (c) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAnalytics(c)
      setData(res.data)
    } catch (e) {
      setError('Could not load analytics. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAnalytics(city) }, [city, loadAnalytics])

  const summary = data?.summary

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-purple w-80 h-80 top-32 -right-20 opacity-10" />
      <div className="orb orb-blue w-64 h-64 bottom-40 -left-16 opacity-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="badge badge-purple inline-flex mb-3">
            <HiChartBar /> Market Analytics
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            Market <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">
            Real-time insights from thousands of property listings across India's top cities.
          </p>
        </motion.div>

        {/* City Tabs */}
        <div className="flex justify-center mb-10">
          <div className="glass rounded-2xl p-1.5 flex gap-1">
            {CITIES.map((c) => (
              <motion.button
                key={c.id}
                onClick={() => setCity(c.id)}
                whileTap={{ scale: 0.97 }}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  city === c.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {c.label}
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin" />
              <p className="text-gray-400">Loading market data...</p>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="card p-8 text-center text-red-400 max-w-lg mx-auto"
            >
              <FiAlertCircle className="text-5xl mx-auto mb-3 opacity-70" />
              <p className="font-semibold mb-2">Backend Not Reachable</p>
              <p className="text-sm text-gray-500">{error}</p>
              <button
                onClick={() => loadAnalytics(city)}
                className="btn-secondary mt-4 flex items-center gap-2 mx-auto"
              >
                <FiRefreshCw /> Retry
              </button>
            </motion.div>
          )}

          {data && !loading && !error && (
            <motion.div
              key={city}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              {/* Summary KPI Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard label="Avg Price" value={summary?.city === 'mumbai' ? `₹${(summary.avg_price / 100).toFixed(1)}Cr` : `₹${summary?.avg_price?.toFixed(0)}L`} sub="Mean across all listings" color="#4f5ff7" delay={0} />
                <StatCard label="Median Price" value={summary?.city === 'mumbai' ? `₹${(summary.median_price / 100).toFixed(1)}Cr` : `₹${summary?.median_price?.toFixed(0)}L`} sub="50th percentile" color="#a78bfa" delay={0.05} />
                <StatCard label="Min Price" value={`₹${summary?.min_price?.toFixed(0)}L`} color="#22c55e" delay={0.1} />
                <StatCard label="Max Price" value={summary?.city === 'mumbai' ? `₹${(summary.max_price / 100).toFixed(0)}Cr` : `₹${summary?.max_price?.toFixed(0)}L`} color="#f97316" delay={0.15} />
                <StatCard label="Avg ₹/sqft" value={`₹${summary?.avg_price_per_sqft?.toLocaleString()}`} sub="Per square foot" color="#06b6d4" delay={0.2} />
                <StatCard label="Total Listings" value={summary?.total_listings?.toLocaleString()} sub={`${city.charAt(0).toUpperCase() + city.slice(1)} dataset`} color="#f43f5e" delay={0.25} />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopLocalitiesChart data={data.top_localities} city={city} />
                <BhkDistChart data={data.bhk_distribution} />
                <PriceDistChart data={data.price_distribution} />
                <BhkPriceChart data={data.bhk_price} city={city} />
              </div>

              {/* Model Performance */}
              <div>
                <ModelPerformance />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
