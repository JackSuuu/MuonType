import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { Header } from './components/Header/Header'
import { Modal } from './components/ui/Modal'
import { SettingsPanel } from './components/Settings/SettingsPanel'
import { Home } from './pages/Home'
import { History } from './pages/History'
import { useTheme } from './hooks/useTheme'
import { BackgroundPattern } from './components/ui/BackgroundPattern'
import { useAuthStore } from './stores/authStore'
import { useGistSync } from './hooks/useGistSync'
import type { GitHubUser } from './stores/authStore'

// Handles the ?code= query param that GitHub redirects back with
const OAuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const { setToken, setUser, setLoading } = useAuthStore()
  const { pullFromGist } = useGistSync()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return

    // Clear the code from the URL immediately
    window.history.replaceState({}, '', window.location.pathname)

    setLoading(true)
    ;(async () => {
      try {
        // Exchange code for token via Vercel serverless function
        const tokenRes = await fetch('/api/auth/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })
        const { access_token, error } = await tokenRes.json() as { access_token?: string; error?: string }
        if (error || !access_token) throw new Error(error ?? 'No token')

        setToken(access_token)

        // Fetch user info
        const userRes = await fetch('https://api.github.com/user', {
          headers: { Authorization: `token ${access_token}` },
        })
        const user = await userRes.json() as GitHubUser
        setUser(user)

        // Pull existing history from Gist
        await pullFromGist()
      } catch (err) {
        console.error('GitHub OAuth failed:', err)
      } finally {
        setLoading(false)
        navigate('/', { replace: true })
      }
    })()
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

const AppContent: React.FC = () => {
  const [isSettingsOpen, setSettingsOpen] = useState(false)
  useTheme()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Background decorative pattern */}
      <BackgroundPattern />

      {/* Header */}
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      {/* OAuth callback handler — renders nothing, just processes ?code= param */}
      <OAuthCallback />

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <span className="font-mono text-xs" style={{ color: 'var(--subtext)', opacity: 0.3 }}>
          zentype · 禅타이핑 · made with
          <span className="mx-1" style={{ color: 'var(--primary)' }}>茶</span>
          and code
        </span>
      </footer>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="settings · 設定"
        size="md"
      >
        <SettingsPanel />
      </Modal>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
