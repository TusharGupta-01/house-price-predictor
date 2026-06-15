import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  HiSparkles, HiChartBar, HiLocationMarker, HiLightningBolt,
  HiShieldCheck, HiTrendingUp,
} from 'react-icons/hi'
import { FiArrowRight, FiCheck } from 'react-icons/fi'
import { BsBuildings, BsGraphUpArrow, BsRobot } from 'react-icons/bs'

/* ── Animation variants ───────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}

/* ── Floating stat cards ──────────────────────────────────────────────── */
const STATS = [
  { label: 'Bengaluru R²', value: '99.75%', icon: HiShieldCheck, color: '#4f5ff7' },
  { label: 'Mumbai R²', value: '99.68%', icon: HiTrendingUp, color: '#a78bfa' },
  { label: 'Listings Trained', value: '16K+', icon: BsBuildings, color: '#f97316' },
  { label: 'Models Compared', value: '5', icon: BsRobot, color: '#22c55e' },
]

const FEATURES = [
  {
    icon: HiLightningBolt,
    title: 'Instant Predictions',
    desc: 'Get accurate price estimates in milliseconds using ensemble ML models.',
    color: '#f97316',
  },
  {
    icon: HiChartBar,
    title: 'Market Analytics',
    desc: 'Explore locality trends, BHK distributions, and price heat maps.',
    color: '#4f5ff7',
  },
  {
    icon: HiLocationMarker,
    title: 'Location Intelligence',
    desc: 'Interactive map with 1,300+ Bengaluru & Mumbai localities.',
    color: '#a78bfa',
  },
  {
    icon: BsGraphUpArrow,
    title: 'Investment Score',
    desc: 'AI-generated investment score based on location demand & price trends.',
    color: '#22c55e',
  },
  {
    icon: HiSparkles,
    title: 'AI Insights',
    desc: "Contextual insights about each locality's growth potential.",
    color: '#e879f9',
  },
  {
    icon: FiCheck,
    title: 'Property Comparison',
    desc: 'Compare up to 4 properties side-by-side with AI ranking.',
    color: '#06b6d4',
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Enter Details', desc: 'Choose city, BHK, area, and locality.' },
  { step: '02', title: 'AI Processes', desc: 'Our ML model analyzes 9 key features.' },
  { step: '03', title: 'Get Results', desc: 'Receive price prediction with AI insights.' },
]

/* ── Animated Counter ─────────────────────────────────────────────────── */
function StatCard({ stat, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      className="glass rounded-2xl p-5 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${stat.color}22`, border: `1px solid ${stat.color}44` }}>
        <stat.icon style={{ color: stat.color }} className="text-xl" />
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
        <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20">
        {/* Background orbs */}
        <div className="orb orb-blue w-96 h-96 top-20 -left-20 animate-pulse-slow" />
        <div className="orb orb-purple w-80 h-80 top-40 right-10 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="orb orb-orange w-64 h-64 bottom-20 left-1/3 animate-pulse-slow" style={{ animationDelay: '4s' }} />

        {/* Grid background pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 badge badge-blue mb-6">
                <HiSparkles />
                AI-Powered Real Estate Intelligence
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="font-display text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight"
              >
                Predict Home
                <br />
                <span className="gradient-text">Prices with AI</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 text-gray-400 text-lg leading-relaxed max-w-xl">
                Get instant, accurate house price estimates for <strong className="text-white">Bengaluru</strong> and{' '}
                <strong className="text-white">Mumbai</strong> using advanced ML models trained on 16,000+ real listings.
                R² accuracy up to <strong className="text-green-400">99.75%</strong>.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
                <Link to="/predict">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="btn-primary flex items-center gap-2 text-base px-7 py-3.5"
                  >
                    <HiSparkles />
                    Predict Price Now
                    <FiArrowRight />
                  </motion.button>
                </Link>
                <Link to="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="btn-secondary flex items-center gap-2 text-base px-7 py-3.5"
                  >
                    <HiChartBar />
                    View Analytics
                  </motion.button>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-5 text-sm text-gray-500">
                {['5 ML Models', 'GridSearchCV Tuned', '5-Fold CV Validated', 'Real Market Data'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <FiCheck className="text-green-500" />
                    <span>{t}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Stats + Floating Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              {/* Main prediction preview card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="glass rounded-3xl p-8 glow-primary relative z-10"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Predicted Price</div>
                    <div className="font-display text-4xl font-black gradient-text">₹82.4L</div>
                    <div className="text-gray-500 text-xs mt-1">± ₹8.24L confidence band</div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(79,95,247,0.3), rgba(167,139,250,0.2))', border: '1px solid rgba(79,95,247,0.3)' }}>
                    <BsBuildings className="text-primary-400 text-2xl" />
                  </div>
                </div>

                {/* Mini details */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[['2 BHK', 'Type'], ['1200 sqft', 'Area'], ['Whitefield', 'Locality']].map(([val, label]) => (
                    <div key={label} className="glass-light rounded-xl p-3 text-center">
                      <div className="text-white text-sm font-semibold">{val}</div>
                      <div className="text-gray-600 text-xs mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Investment score */}
                <div className="glass-light rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Investment Score</span>
                    <span className="text-green-400 font-bold text-sm">74/100</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '74%' }} />
                  </div>
                </div>

                {/* AI Insights */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2 text-xs text-gray-400">
                    <span>🔥</span> Whitefield is a highly sought-after IT hub locality.
                  </div>
                  <div className="flex items-start gap-2 text-xs text-gray-400">
                    <span>📈</span> Bengaluru's tech corridor drives strong appreciation.
                  </div>
                </div>
              </motion.div>

              {/* Stat cards floating around */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                {STATS.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <StatCard stat={stat} index={i} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="badge badge-purple inline-flex mb-4">
              <HiSparkles /> Everything you need
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-bold">
              <span className="gradient-text">Powerful Features</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 mt-4 max-w-xl mx-auto">
              A complete AI-powered platform for real estate intelligence — from raw prediction to investment insights.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="card p-6 group cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${f.color}22`, border: `1px solid ${f.color}44` }}>
                  <f.icon style={{ color: f.color }} className="text-xl" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="font-display text-4xl font-bold">
              How It <span className="gradient-text">Works</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 mt-3 max-w-lg mx-auto">
              Three simple steps to accurate house price prediction.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.step} variants={fadeUp} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px z-0"
                    style={{ background: 'linear-gradient(90deg, rgba(79,95,247,0.4), transparent)' }} />
                )}
                <div className="glass rounded-2xl p-8 text-center relative z-10">
                  <div className="font-display text-5xl font-black gradient-text-blue opacity-40 mb-4">{step.step}</div>
                  <h3 className="text-white font-semibold text-xl mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-12 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(79,95,247,0.2), rgba(167,139,250,0.15), rgba(249,115,22,0.1))', border: '1px solid rgba(79,95,247,0.2)' }}
          >
            <div className="orb orb-blue w-64 h-64 -top-20 -left-20 opacity-30" />
            <div className="orb orb-purple w-64 h-64 -bottom-20 -right-20 opacity-20" />
            <div className="relative z-10">
              <div className="badge badge-orange inline-flex mb-4">
                <HiLightningBolt /> Free & Instant
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Ready to <span className="gradient-text">Get Started?</span>
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Enter your property details and receive an AI-powered price estimate in seconds.
              </p>
              <Link to="/predict">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2"
                >
                  <HiSparkles /> Predict Now — It's Free
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
