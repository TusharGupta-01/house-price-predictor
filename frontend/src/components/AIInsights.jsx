import { motion } from 'framer-motion'
import { HiSparkles } from 'react-icons/hi'

const TYPE_STYLES = {
  positive: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', text: '#4ade80' },
  neutral: { bg: 'rgba(79,95,247,0.08)', border: 'rgba(79,95,247,0.2)', text: '#818cf8' },
  warning: { bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', text: '#fb923c' },
}

export default function AIInsights({ insights = [] }) {
  if (!insights || insights.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card p-6"
    >
      <h3 className="font-semibold text-white flex items-center gap-2 mb-5">
        <HiSparkles className="text-primary-400" />
        AI Market Insights
      </h3>
      <div className="space-y-3">
        {insights.map((insight, i) => {
          const style = TYPE_STYLES[insight.type] || TYPE_STYLES.neutral
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: style.bg, border: `1px solid ${style.border}` }}
            >
              <span className="text-xl shrink-0 mt-0.5">{insight.icon}</span>
              <p className="text-sm leading-relaxed" style={{ color: style.text }}>
                {insight.text}
              </p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
