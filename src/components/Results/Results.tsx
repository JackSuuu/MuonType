import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { TestResult } from '../../types'
import { useHistoryStore } from '../../stores/historyStore'

interface ResultsProps {
  result: TestResult
  onRestart: () => void
  onNewTest: () => void
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs font-mono"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
      >
        <div style={{ color: 'var(--subtext)' }}>{label}s</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ color: p.color }}>
            {p.dataKey}: {Math.round(p.value)}
          </div>
        ))}
      </div>
    )
  }
  return null
}

export const Results: React.FC<ResultsProps> = ({ result, onRestart, onNewTest }) => {
  const { addResult } = useHistoryStore()
  const { getBestWpm } = useHistoryStore()

  // Save result once
  const savedRef = React.useRef(false)
  React.useEffect(() => {
    if (!savedRef.current) {
      addResult(result)
      savedRef.current = true
    }
  }, [])

  const bestWpm = getBestWpm()
  const isPersonalBest = result.wpm === bestWpm && result.wpm > 0

  // Build heatmap data from keystrokes
  const keyErrorMap = useMemo(() => {
    const map: Record<string, { total: number; errors: number }> = {}
    result.keystrokes.forEach((k) => {
      const key = k.key.toLowerCase()
      if (!map[key]) map[key] = { total: 0, errors: 0 }
      map[key].total++
      if (!k.correct) map[key].errors++
    })
    return map
  }, [result.keystrokes])

  const stats = [
    { label: 'wpm', value: result.wpm, highlight: true },
    { label: 'raw', value: result.rawWpm },
    { label: 'accuracy', value: `${result.accuracy}%` },
    { label: 'correct', value: result.correctChars, color: 'var(--correct)' },
    { label: 'incorrect', value: result.incorrectChars, color: 'var(--error)' },
    { label: 'time', value: `${result.duration}s` },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Personal Best Badge */}
      {isPersonalBest && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
          className="text-center mb-4"
        >
          <span className="font-mono text-xs px-3 py-1 rounded-full"
            style={{
              background: 'var(--secondary)',
              color: 'var(--bg)',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
          >
            personal best
          </span>
        </motion.div>
      )}

      {/* Main stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="text-center"
          >
            <div className={stat.highlight ? 'stat-value' : 'font-mono font-bold text-2xl'}
              style={{
                color: stat.color || (stat.highlight ? 'var(--primary)' : 'var(--text)'),
              }}
            >
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* WPM Chart */}
      {result.wpmHistory.length > 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="zen-surface rounded-xl p-4 mb-6"
        >
          <div className="text-xs font-mono mb-3" style={{ color: 'var(--subtext)' }}>
            wpm over time
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={result.wpmHistory} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="second"
                tick={{ fontSize: 10, fill: 'var(--subtext)', fontFamily: 'Space Mono' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--subtext)', fontFamily: 'Space Mono' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="raw"
                stroke="var(--subtext)"
                strokeWidth={1}
                dot={false}
                strokeDasharray="4 2"
              />
              <Line
                type="monotone"
                dataKey="wpm"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                strokeLinecap="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Keyboard Heatmap (inline mini) */}
      <KeyboardMiniHeatmap keyErrorMap={keyErrorMap} />

      {/* Actions */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={onRestart}
          className="zen-btn active px-8 py-3 text-sm"
          title="Tab + Enter"
        >
          restart
        </button>
        <button
          onClick={onNewTest}
          className="zen-btn px-6 py-3 text-sm"
        >
          new test
        </button>
      </div>

      <div className="text-center mt-3">
        <span className="font-mono text-xs" style={{ color: 'var(--subtext)', opacity: 0.5 }}>
          tab + enter to restart
        </span>
      </div>
    </motion.div>
  )
}

// Mini keyboard heatmap
const KEYBOARD_LAYOUT = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
]

interface KeyboardMiniHeatmapProps {
  keyErrorMap: Record<string, { total: number; errors: number }>
}

const KeyboardMiniHeatmap: React.FC<KeyboardMiniHeatmapProps> = ({ keyErrorMap }) => {
  const maxErrors = Math.max(1, ...Object.values(keyErrorMap).map((v) => v.errors))

  return (
    <div className="zen-surface rounded-xl p-4">
      <div className="text-xs font-mono mb-3" style={{ color: 'var(--subtext)' }}>
        error heatmap
      </div>
      <div className="flex flex-col items-center gap-1.5">
        {KEYBOARD_LAYOUT.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1.5"
            style={{ marginLeft: rowIdx === 1 ? '1rem' : rowIdx === 2 ? '2rem' : 0 }}
          >
            {row.map((key) => {
              const data = keyErrorMap[key]
              const intensity = data ? data.errors / maxErrors : 0

              return (
                <motion.div
                  key={key}
                  title={data ? `${key}: ${data.errors}/${data.total} errors` : key}
                  className="w-7 h-7 rounded-md flex items-center justify-center font-mono text-xs cursor-default"
                  style={{
                    background: intensity > 0
                      ? `rgba(200, 75, 49, ${Math.min(0.8, intensity * 0.9 + 0.1)})`
                      : 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: intensity > 0.5 ? '#fff' : 'var(--subtext)',
                    transition: 'background 0.3s',
                  }}
                >
                  {key}
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
          <span className="font-mono text-xs" style={{ color: 'var(--subtext)' }}>no errors</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(200,75,49,0.8)' }} />
          <span className="font-mono text-xs" style={{ color: 'var(--subtext)' }}>high error rate</span>
        </div>
      </div>
    </div>
  )
}

export default Results
