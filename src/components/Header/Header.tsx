import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSettingsStore } from '../../stores/settingsStore'
import { useHistoryStore } from '../../stores/historyStore'
import { useAuthStore } from '../../stores/authStore'
import { THEMES } from '../../types'
import clsx from 'clsx'

interface HeaderProps {
  onOpenSettings: () => void
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const location = useLocation()
  const { theme, setTheme } = useSettingsStore()
  const { getBestWpm } = useHistoryStore()
  const { token, user, isLoading, logout } = useAuthStore()
  const bestWpm = getBestWpm()

  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID as string | undefined

  const handleLogin = () => {
    if (!clientId) {
      console.warn('VITE_GITHUB_CLIENT_ID is not set')
      return
    }
    const redirectUri = window.location.origin
    const scope = 'gist'
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`
  }

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
            className="zen-btn-ghost w-10 h-10 flex items-center justify-center rounded-lg"
            title="View on GitHub"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* GitHub Login / User Avatar */}
          {isLoading ? (
            <div className="w-10 h-10 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border border-current border-t-transparent animate-spin"
                style={{ color: 'var(--subtext)' }}
              />
            </div>
          ) : token && user ? (
            <div className="flex items-center gap-2">
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${user.name ?? user.login} · click to view profile`}
                className="flex items-center gap-2 px-2 py-1 rounded-lg transition-colors duration-150"
                style={{ color: 'var(--subtext)' }}
              >
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-7 h-7 rounded-full"
                  style={{ border: '1px solid var(--border)' }}
                />
                <span className="font-mono text-xs hidden sm:block" style={{ color: 'var(--subtext)' }}>
                  {user.login}
                </span>
              </a>
              <button
                onClick={logout}
                title="Sign out"
                className="zen-btn-ghost w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ color: 'var(--subtext)' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
                  <path d="M11 11l3-3-3-3" />
                  <path d="M14 8H6" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              title="Login with GitHub to sync history"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-colors duration-150"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--subtext)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.color = 'var(--primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--subtext)'
              }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              login
            </button>
          )}

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="zen-btn-ghost w-10 h-10 flex items-center justify-center rounded-lg"
            title="Settings"
          >
            <svg className="w-6 h-6" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
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
