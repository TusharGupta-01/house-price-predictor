import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMapPin, FiHome, FiDroplet, FiMaximize, FiLoader } from 'react-icons/fi'
import { HiSparkles, HiLightningBolt } from 'react-icons/hi'
import { BsBuildings } from 'react-icons/bs'
import { usePrediction } from '../hooks/usePrediction'
import MapSection from '../components/MapSection'
import ResultCard from '../components/ResultCard'
import AIInsights from '../components/AIInsights'

const BENGALURU_AREA_TYPES = [
  'Super built-up  Area',
  'Built-up  Area',
  'Plot  Area',
  'Carpet  Area',
]
const MUMBAI_AREA_TYPES = [
  'Super Built-up Area',
  'Built-up Area',
  'Carpet Area',
]

export default function PredictPage() {
  const {
    form, locations, loadingLocations, predicting,
    result, error, updateForm, predict, fetchLocations, reset,
  } = usePrediction()

  const [activeTab, setActiveTab] = useState('bengaluru')

  useEffect(() => {
    fetchLocations(form.city)
  }, [])

  const handleCityChange = (city) => {
    setActiveTab(city)
    updateForm('city', city)
  }

  const areaTypes = form.city === 'mumbai' ? MUMBAI_AREA_TYPES : BENGALURU_AREA_TYPES

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-blue w-72 h-72 top-40 -right-20 opacity-10" />
      <div className="orb orb-purple w-64 h-64 bottom-20 -left-20 opacity-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="badge badge-blue inline-flex mb-3">
            <HiSparkles /> AI Prediction Engine
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            House Price <span className="gradient-text">Predictor</span>
          </h1>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">
            Fill in the details below and our ML model will estimate the market value instantly.
          </p>
        </motion.div>

        {/* City Tabs */}
        <div className="flex justify-center mb-10">
          <div className="glass rounded-2xl p-1.5 flex gap-1">
            {[
              { id: 'bengaluru', label: '🏙️ Bengaluru' },
              { id: 'mumbai', label: '🌊 Mumbai' },
            ].map((c) => (
              <motion.button
                key={c.id}
                onClick={() => handleCityChange(c.id)}
                whileTap={{ scale: 0.97 }}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === c.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {c.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left: Form ────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5"
          >
            <div className="card p-8 sticky top-28">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BsBuildings className="text-primary-400" />
                Property Details
              </h2>

              <div className="space-y-5">
                {/* Location */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1.5">
                    <FiMapPin className="text-primary-400" /> Location / Locality
                  </label>
                  <select
                    id="location-select"
                    value={form.location}
                    onChange={(e) => updateForm('location', e.target.value)}
                    className="input-field"
                    disabled={loadingLocations}
                  >
                    <option value="">{loadingLocations ? 'Loading...' : '— Select Locality —'}</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Total Sqft */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1.5">
                    <FiMaximize className="text-primary-400" /> Total Area
                    <span className="ml-auto text-white font-semibold">{form.total_sqft} sqft</span>
                  </label>
                  <input
                    type="range"
                    min="200" max="8000" step="50"
                    value={form.total_sqft}
                    onChange={(e) => updateForm('total_sqft', Number(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>200</span><span>8000 sqft</span>
                  </div>
                </div>

                {/* BHK */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1.5">
                    <FiHome className="text-primary-400" /> BHK Configuration
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <motion.button
                        key={n}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateForm('bhk', n)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          form.bhk === n
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'glass-light text-gray-400 hover:text-white'
                        }`}
                      >
                        {n}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1.5">
                    <FiDroplet className="text-primary-400" /> Bathrooms
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <motion.button
                        key={n}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateForm('bath', n)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          form.bath === n
                            ? 'bg-primary-600 text-white'
                            : 'glass-light text-gray-400 hover:text-white'
                        }`}
                      >
                        {n}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Balcony */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Balcony</label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((n) => (
                      <motion.button
                        key={n}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateForm('balcony', n)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          form.balcony === n
                            ? 'bg-primary-600 text-white'
                            : 'glass-light text-gray-400 hover:text-white'
                        }`}
                      >
                        {n}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Area Type */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Area Type</label>
                  <select
                    value={form.area_type}
                    onChange={(e) => updateForm('area_type', e.target.value)}
                    className="input-field"
                  >
                    {areaTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                    >
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Predict Button */}
                <motion.button
                  id="predict-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={predict}
                  disabled={predicting || loadingLocations}
                  className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {predicting ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <HiLightningBolt />
                      Predict Price
                    </>
                  )}
                </motion.button>

                {result && (
                  <button onClick={reset} className="btn-secondary w-full py-3 text-sm">
                    Reset
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Right: Result + Map + Insights ───────────────────────── */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              {!result && !predicting && (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card p-12 text-center"
                >
                  <BsBuildings className="text-6xl text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500">Fill in the property details and click <strong className="text-gray-300">Predict Price</strong> to see the estimate here.</p>
                </motion.div>
              )}

              {predicting && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card p-12 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin" />
                  <p className="text-gray-400">Analyzing property features...</p>
                  <p className="text-gray-600 text-sm mt-2">Running ML inference pipeline</p>
                </motion.div>
              )}

              {result && !predicting && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <ResultCard result={result} form={form} />
                  <AIInsights insights={result.ai_insights} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Map */}
            <MapSection city={form.city} location={form.location} />
          </div>
        </div>
      </div>
    </div>
  )
}
