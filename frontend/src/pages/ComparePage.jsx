/**
 * ComparePage — Compare two properties side-by-side.
 * Each property card has its own form state.
 * Sends both to /api/compare and renders a visual comparison.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMapPin, FiHome, FiDroplet, FiMaximize, FiLoader, FiArrowRight } from 'react-icons/fi'
import { HiSparkles, HiLightningBolt, HiSwitchHorizontal } from 'react-icons/hi'
import { BsBuildings, BsTrophy } from 'react-icons/bs'
import { compareProperties, getLocations } from '../services/api'

const BENGALURU_AREA_TYPES = ['Super built-up  Area', 'Built-up  Area', 'Plot  Area', 'Carpet  Area']
const MUMBAI_AREA_TYPES    = ['Super Built-up Area', 'Built-up Area', 'Carpet Area']

const INITIAL_PROP = (city = 'bengaluru') => ({
  city,
  total_sqft: 1200,
  bhk: 2,
  bath: 2,
  balcony: 1,
  location: '',
  area_type: city === 'mumbai' ? 'Built-up Area' : 'Super built-up  Area',
})

// ── Single property form card ──────────────────────────────────────────────
function PropForm({ label, prop, locations, loadingLocs, onChange, highlight }) {
  const areaTypes = prop.city === 'mumbai' ? MUMBAI_AREA_TYPES : BENGALURU_AREA_TYPES

  const field = (key, value) => onChange({ ...prop, [key]: value })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card p-6 ${highlight ? 'border-primary-500/40 glow-primary' : ''}`}
    >
      <h3 className="font-display font-bold text-white text-lg mb-5 flex items-center gap-2">
        <BsBuildings className="text-primary-400" />
        {label}
      </h3>

      <div className="space-y-4">
        {/* City */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">City</label>
          <div className="flex gap-2">
            {['bengaluru', 'mumbai'].map((c) => (
              <button
                key={c}
                onClick={() => onChange({ ...INITIAL_PROP(c) })}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  prop.city === c ? 'bg-primary-600 text-white' : 'glass-light text-gray-400 hover:text-white'
                }`}
              >
                {c === 'bengaluru' ? '🏙️ Bengaluru' : '🌊 Mumbai'}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <FiMapPin className="text-primary-400" /> Location
          </label>
          <select
            value={prop.location}
            onChange={(e) => field('location', e.target.value)}
            className="input-field"
            disabled={loadingLocs}
          >
            <option value="">{loadingLocs ? 'Loading…' : '— Select Locality —'}</option>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Sqft slider */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <FiMaximize className="text-primary-400" /> Area
            <span className="ml-auto text-white font-semibold">{prop.total_sqft} sqft</span>
          </label>
          <input
            type="range" min="200" max="8000" step="50"
            value={prop.total_sqft}
            onChange={(e) => field('total_sqft', Number(e.target.value))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-0.5"><span>200</span><span>8000</span></div>
        </div>

        {/* BHK */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <FiHome className="text-primary-400" /> BHK
          </label>
          <div className="flex gap-1.5">
            {[1,2,3,4,5,6].map((n) => (
              <button key={n} onClick={() => field('bhk', n)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  prop.bhk === n ? 'bg-primary-600 text-white' : 'glass-light text-gray-400 hover:text-white'
                }`}
              >{n}</button>
            ))}
          </div>
        </div>

        {/* Bath */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <FiDroplet className="text-primary-400" /> Bathrooms
          </label>
          <div className="flex gap-1.5">
            {[1,2,3,4,5].map((n) => (
              <button key={n} onClick={() => field('bath', n)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  prop.bath === n ? 'bg-primary-600 text-white' : 'glass-light text-gray-400 hover:text-white'
                }`}
              >{n}</button>
            ))}
          </div>
        </div>

        {/* Balcony + Area Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Balcony</label>
            <div className="flex gap-1">
              {[0,1,2,3].map((n) => (
                <button key={n} onClick={() => field('balcony', n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    prop.balcony === n ? 'bg-primary-600 text-white' : 'glass-light text-gray-400 hover:text-white'
                  }`}
                >{n}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Area Type</label>
            <select value={prop.area_type} onChange={(e) => field('area_type', e.target.value)} className="input-field text-xs">
              {areaTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Comparison result row ──────────────────────────────────────────────────
function CompareRow({ metricLabel, val1, val2, bestIdx, isHigher = 'higher' }) {
  const winner = isHigher === 'higher'
    ? (val1 > val2 ? 0 : val1 < val2 ? 1 : -1)
    : (val1 < val2 ? 0 : val1 > val2 ? 1 : -1)

  return (
    <div className="grid grid-cols-3 items-center gap-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className={`text-right font-semibold ${winner === 0 ? 'text-green-400' : 'text-gray-300'}`}>
        {val1 !== undefined && val1 !== null ? val1 : '—'}
        {winner === 0 && <span className="ml-1">✓</span>}
      </div>
      <div className="text-center text-xs text-gray-500 uppercase tracking-wider">{metricLabel}</div>
      <div className={`text-left font-semibold ${winner === 1 ? 'text-green-400' : 'text-gray-300'}`}>
        {winner === 1 && <span className="mr-1">✓</span>}
        {val2 !== undefined && val2 !== null ? val2 : '—'}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ComparePage() {
  const [propA, setPropA] = useState(INITIAL_PROP('bengaluru'))
  const [propB, setPropB] = useState(INITIAL_PROP('bengaluru'))
  const [locsA, setLocsA] = useState([])
  const [locsB, setLocsB] = useState([])
  const [loadingLocsA, setLoadingLocsA] = useState(false)
  const [loadingLocsB, setLoadingLocsB] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Fetch locations when city changes
  const fetchLocs = async (city, setter, loadingSetter) => {
    loadingSetter(true)
    try {
      const res = await getLocations(city)
      setter(res.data.locations || [])
    } catch { setter([]) }
    finally { loadingSetter(false) }
  }

  useEffect(() => { fetchLocs(propA.city, setLocsA, setLoadingLocsA) }, [propA.city])
  useEffect(() => { fetchLocs(propB.city, setLocsB, setLoadingLocsB) }, [propB.city])

  const handleCompare = async () => {
    if (!propA.location || !propB.location) {
      setError('Please select a location for both properties.')
      return
    }
    setComparing(true)
    setError(null)
    setResult(null)
    try {
      // Use propA's city (backend uses single city for compare, but our backend supports per-prop)
      const res = await compareProperties({ city: propA.city, properties: [propA, propB] })
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Comparison failed. Is the backend running?')
    } finally {
      setComparing(false)
    }
  }

  const rA = result?.properties?.[0]
  const rB = result?.properties?.[1]
  const summary = result?.summary

  const fmt = (r) => r ? r.predicted_price_display : '—'
  const fmtN = (v) => v !== undefined ? `₹${v.toFixed(0)}/sqft` : '—'

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      <div className="orb orb-orange w-72 h-72 top-40 -right-20 opacity-10" />
      <div className="orb orb-blue w-64 h-64 bottom-20 -left-20 opacity-10" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="badge badge-orange inline-flex mb-3">
            <HiSwitchHorizontal /> Property Comparison
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            Compare <span className="gradient-text">Properties</span>
          </h1>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">
            Configure two properties below and let our AI pick the better investment.
          </p>
        </motion.div>

        {/* Dual Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PropForm
            label="Property A"
            prop={propA}
            locations={locsA}
            loadingLocs={loadingLocsA}
            onChange={setPropA}
            highlight={summary?.best_value_idx === 0}
          />
          <PropForm
            label="Property B"
            prop={propB}
            locations={locsB}
            loadingLocs={loadingLocsB}
            onChange={setPropB}
            highlight={summary?.best_value_idx === 1}
          />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 mb-6 text-center"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compare Button */}
        <div className="flex justify-center mb-10">
          <motion.button
            id="compare-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCompare}
            disabled={comparing}
            className="btn-primary px-10 py-4 text-base flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {comparing ? (
              <><FiLoader className="animate-spin" /> Comparing…</>
            ) : (
              <><HiLightningBolt /> Compare Properties<FiArrowRight /></>
            )}
          </motion.button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && rA && rB && (
            <motion.div
              key="compare-result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Winner banner */}
              {summary && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="card p-6 text-center"
                  style={{ borderColor: 'rgba(79,95,247,0.4)', background: 'rgba(79,95,247,0.06)' }}
                >
                  <BsTrophy className="text-4xl text-yellow-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm mb-1">Best Investment Value</p>
                  <h3 className="font-display font-bold text-white text-2xl">
                    Property {summary.best_value_idx === 0 ? 'A' : 'B'} wins
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Price difference: <span className="text-white font-semibold">₹{summary.price_diff_lakh.toFixed(1)}L</span>
                  </p>
                </motion.div>
              )}

              {/* Comparison table */}
              <div className="card p-6">
                {/* Column headers */}
                <div className="grid grid-cols-3 items-center gap-4 pb-3 mb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className={`text-right font-display font-bold text-lg ${summary?.best_value_idx === 0 ? 'text-primary-400' : 'text-white'}`}>
                    Property A {summary?.best_value_idx === 0 && '🏆'}
                  </div>
                  <div className="text-center">
                    <HiSwitchHorizontal className="text-gray-600 mx-auto text-xl" />
                  </div>
                  <div className={`text-left font-display font-bold text-lg ${summary?.best_value_idx === 1 ? 'text-primary-400' : 'text-white'}`}>
                    {summary?.best_value_idx === 1 && '🏆 '}Property B
                  </div>
                </div>

                <CompareRow metricLabel="Predicted Price" val1={fmt(rA)} val2={fmt(rB)} isHigher="lower" />
                <CompareRow metricLabel="Price / sqft" val1={fmtN(rA?.price_per_sqft)} val2={fmtN(rB?.price_per_sqft)} isHigher="lower" />
                <CompareRow metricLabel="Investment Score" val1={`${rA?.investment_score}/100`} val2={`${rB?.investment_score}/100`} isHigher="higher" />
                <CompareRow metricLabel="BHK" val1={propA.bhk} val2={propB.bhk} isHigher="higher" />
                <CompareRow metricLabel="Bathrooms" val1={propA.bath} val2={propB.bath} isHigher="higher" />
                <CompareRow metricLabel="Area (sqft)" val1={propA.total_sqft} val2={propB.total_sqft} isHigher="higher" />
                <CompareRow metricLabel="Location" val1={propA.location || '—'} val2={propB.location || '—'} isHigher="neutral" />
                <CompareRow metricLabel="City" val1={propA.city} val2={propB.city} isHigher="neutral" />

                {/* Confidence bands */}
                <div className="grid grid-cols-3 gap-4 pt-4 mt-2">
                  <div className="text-right text-xs text-gray-500">
                    <span className="block text-green-400">{rA.confidence_low_display}</span>
                    <span className="block text-red-400">{rA.confidence_high_display}</span>
                  </div>
                  <div className="text-center text-xs text-gray-600 uppercase tracking-wider self-center">95% Range</div>
                  <div className="text-left text-xs text-gray-500">
                    <span className="block text-green-400">{rB.confidence_low_display}</span>
                    <span className="block text-red-400">{rB.confidence_high_display}</span>
                  </div>
                </div>
              </div>

              {/* AI Insights dual */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[rA, rB].map((r, idx) => (
                  <div key={idx} className="card p-5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <HiSparkles className="text-primary-400" /> Property {idx === 0 ? 'A' : 'B'} — AI Insights
                    </p>
                    <div className="space-y-2">
                      {(r.ai_insights || []).slice(0, 3).map((ins, i) => (
                        <div key={i} className="glass-light rounded-lg px-3 py-2 text-sm flex gap-2">
                          <span>{ins.icon}</span>
                          <span className="text-gray-300">{ins.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reset */}
              <div className="flex justify-center">
                <button
                  onClick={() => { setResult(null); setError(null) }}
                  className="btn-secondary px-8 py-3"
                >
                  Reset Comparison
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
