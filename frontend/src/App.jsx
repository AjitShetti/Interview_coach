import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Interview from './pages/Interview'
import AudioInterview from './pages/AudioInterview'
import Report from './pages/Report'
import Landing from './pages/Landing'

function ProtectedRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { token } = useAuthStore()
  return token ? <Navigate to="/dashboard" replace /> : children
}

function PublicLandingRoute({ children }) {
  const { token } = useAuthStore()
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <div className="min-h-screen bg-background text-text-primary font-body antialiased selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b' },
          }}
        />
        <Routes>
          {/* Guest only */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* Public Landing */}
          <Route path="/" element={<PublicLandingRoute><Landing /></PublicLandingRoute>} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <Interview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview/audio"
            element={
              <ProtectedRoute>
                <AudioInterview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/:sessionId"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
