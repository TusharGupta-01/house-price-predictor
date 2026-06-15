/**
 * AnalyticsChart — Recharts visualisations for the dashboard page.
 * Exports individual chart cards: TopLocalitiesChart, BhkDistChart,
 * PriceDistChart, BhkPriceChart.
 */

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
} from 'recharts'
import { motion } from 'framer-motion'

const COLORS = ['#4f5ff7', '#a78bfa', '#f97316', '#22c55e', '#f43f5e', '#06b6d4', '#fbbf24']

// ── Custom Tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, suffix = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color || '#818cf8' }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
        </p>
      ))}
    </div>
  )
}

// ── Wrapper card ───────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-6"
    >
      <h3 className="font-display font-bold text-white text-lg mb-1">{title}</h3>
      {subtitle && <p className="text-gray-500 text-sm mb-5">{subtitle}</p>}
      {children}
    </motion.div>
  )
}

// ── Top Localities Bar Chart ───────────────────────────────────────────────
export function TopLocalitiesChart({ data = [], city }) {
  const unit = city === 'mumbai' ? 'L' : 'L'
  return (
    <ChartCard
      title="Top 10 Localities by Avg Price"
      subtitle={`Average property price per locality (${city === 'mumbai' ? 'Lakhs ₹' : 'Lakhs ₹'})`}
      delay={0}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 90, right: 20, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" tick={{ fill: '#8b90b8', fontSize: 11 }} tickFormatter={(v) => `${v}${unit}`} />
          <YAxis type="category" dataKey="location" tick={{ fill: '#cdd1f0', fontSize: 11 }} width={88} />
          <Tooltip content={<CustomTooltip suffix={` ${unit}`} />} />
          <Bar dataKey="avg_price" name="Avg Price" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={`url(#barGrad${i % 3})`} />
            ))}
          </Bar>
          <defs>
            {['#4f5ff7,#818cf8', '#a78bfa,#c4b5fd', '#f97316,#fb923c'].map((g, i) => (
              <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={g.split(',')[0]} />
                <stop offset="100%" stopColor={g.split(',')[1]} />
              </linearGradient>
            ))}
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ── BHK Distribution Pie Chart ─────────────────────────────────────────────
export function BhkDistChart({ data = [] }) {
  const labelled = data.map((d) => ({ ...d, name: `${d.bhk} BHK` }))
  return (
    <ChartCard title="BHK Distribution" subtitle="Share of listings by bedroom count" delay={0.1}>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={labelled}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="count"
            nameKey="name"
            paddingAngle={3}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {labelled.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#8b90b8' }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ── Price Distribution Area Chart ──────────────────────────────────────────
export function PriceDistChart({ data = [] }) {
  return (
    <ChartCard title="Price Range Distribution" subtitle="Number of listings in each price bracket" delay={0.2}>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f5ff7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4f5ff7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="range" tick={{ fill: '#8b90b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#8b90b8', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip suffix=" listings" />} />
          <Area
            type="monotone"
            dataKey="count"
            name="Listings"
            stroke="#4f5ff7"
            strokeWidth={2}
            fill="url(#priceGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ── Avg Price by BHK Bar Chart ─────────────────────────────────────────────
export function BhkPriceChart({ data = [], city }) {
  return (
    <ChartCard title="Avg Price by BHK" subtitle="How bedroom count affects price" delay={0.3}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="bhkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#4f5ff7" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="bhk" tickFormatter={(v) => `${v} BHK`} tick={{ fill: '#8b90b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#8b90b8', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip suffix=" L" />} />
          <Bar dataKey="avg_price" name="Avg Price (L)" fill="url(#bhkGrad)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
