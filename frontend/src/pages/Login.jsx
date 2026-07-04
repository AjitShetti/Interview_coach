import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { animate } from 'animejs'
import { Mail, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: storeLogin } = useAuthStore()
  const navigate = useNavigate()
  const formRef = useRef(null)
  
  // Track focus for icons
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  useEffect(() => {
    if (formRef.current) {
      animate(formRef.current, {
        translateY: [12, 0],
        opacity: [0, 1],
        ease: 'outQuad',
        duration: 400,
        delay: 80
      })
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await login(email, password)
      storeLogin(data.user, data.access_token)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-body text-body">
      {/* Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(212,168,83,0.05)_0%,rgba(13,13,13,0)_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10"></div>
      
      <main ref={formRef} className="w-full max-w-md px-6 relative z-10 opacity-0">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-[48px] text-text-primary tracking-tight mb-2">Interview Coach</h1>
          <p className="font-body text-base text-text-secondary">Premium AI-Powered Interview Preparation</p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-6 border-b border-border-base pb-4">
            <h2 className="font-display text-[32px] text-text-primary">Sign In</h2>
            <span className="font-mono text-sm text-text-secondary uppercase">Secure Access</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block font-mono text-sm text-[#8A8277]">Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${emailFocused ? 'text-primary-container' : 'text-text-secondary'}`} size={20} strokeWidth={1.5} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className="w-full bg-[#141414] border border-[#2A2A2A] text-text-primary rounded-md py-2 pl-10 pr-3 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block font-mono text-sm text-[#8A8277]">Password</label>
                <Link to="#" className="font-body text-sm text-text-secondary hover:text-primary-container transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${passwordFocused ? 'text-primary-container' : 'text-text-secondary'}`} size={20} strokeWidth={1.5} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  className="w-full bg-[#141414] border border-[#2A2A2A] text-text-primary rounded-md py-2 pl-10 pr-3 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-on-primary-container font-body font-medium rounded-md py-3 flex items-center justify-center gap-2 mt-6 hover:bg-accent-hover transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <ArrowRight size={20} strokeWidth={1.5} />
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center mt-6">
            <p className="font-body text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-container hover:text-text-primary transition-colors">Request Access</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
