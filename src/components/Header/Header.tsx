import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSettingsStore } from '../../stores/settingsStore'
import { useHistoryStore } from '../../stores/historyStore'
import { THEMES } from '../../types'
import clsx from 'clsx'

interface HeaderProps {
  onOpenSettings: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const location = useLocation()
  const { theme, setTheme } = useSettingsStore()
  const { getBestWpm } = useHistoryStore()
  const bestWpm = getBestWpm()

  const navLinks = [
    { path: '/', label: 'type' },
    { path: '/history', label: 'history' },
  ]

  return (
    <header className="sticky top-0 z-30 px-6 py-5"
      style={{
        background: 'linear-gradient(to bottom, var(--bg), transparent)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8">
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="14" cy="14" r="13" stroke="var(--primary)" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="6" fill="var(--primary)" opacity="0.2" />
              <circle cx="14" cy="14" r="2.5" fill="var(--primary)" />
              <path d="M14 4 C8 4, 4 8, 4 14" stroke="var(--primary)" strokeWidth="1" strokeDasharray="2 3" />
              <path d="M14 4 C20 4, 24 8, 24 14" stroke="var(--secondary)" strokeWidth="1" strokeDasharray="2 3" />
            </svg>
          </div>
          <span className="font-serif text-2xl tracking-wide font-medium"
            style={{ color: 'var(--text)' }}
          >
            ZenType
          </span>
          <span className="font-serif text-sm opacity-40 hidden sm:block"
            style={{ color: 'var(--secondary)' }}
          >
            禅
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={clsx(
                'relative px-4 py-2 rounded-md font-mono text-sm transition-colors duration-200',
                location.pathname === link.path
                  ? ''
                  : 'hover:text-opacity-100'
              )}
              style={{
                color: location.pathname === link.path ? 'var(--primary)' : 'var(--subtext)',
              }}
            >
              {location.pathname === link.path && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-md"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Best WPM badge */}
          {bestWpm > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
            >
              <span className="font-mono text-sm font-bold" style={{ color: 'var(--secondary)' }}>
                {bestWpm}
              </span>
              <span className="font-mono text-sm" style={{ color: 'var(--subtext)' }}>
                pb
              </span>
            </div>
          )}

          {/* Theme dots */}
          <div className="hidden sm:flex items-center gap-2">
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                title={`${t.labelJp} - ${t.label}`}
                className={clsx(
                  'w-3.5 h-3.5 rounded-full transition-all duration-200 cursor-pointer',
                  theme === t.name ? 'scale-125 ring-1 ring-offset-1' : 'opacity-60 hover:opacity-100'
                )}
                style={{ background: t.colors.primary }}
              />
            ))}
          </div>

          {/* GitHub */}
          <a
            href="https://github.com/JackSuuu/ZenType"
            target="_blank"
            rel="noopener noreferrer"
            className="zen-btn-ghost w-9 h-9 flex items-center justify-center rounded-lg"
            title="View on GitHub"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="zen-btn-ghost w-9 h-9 flex items-center justify-center rounded-lg"
            title="Settings"
          >
            <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="4" x2="14" y2="4" />
              <circle cx="10" cy="4" r="1.5" fill="currentColor" stroke="none" />
              <line x1="2" y1="8" x2="14" y2="8" />
              <circle cx="5" cy="8" r="1.5" fill="currentColor" stroke="none" />
              <line x1="2" y1="12" x2="14" y2="12" />
              <circle cx="11" cy="12" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
