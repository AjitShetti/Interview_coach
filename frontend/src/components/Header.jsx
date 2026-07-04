import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, LifeBuoy, User } from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function Header({ leftContent, rightContent }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 bg-background border-b border-border-subtle">
      <div className="flex items-center gap-4">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="text-headline-sm font-headline-sm tracking-tight text-on-surface">Interview Coach</span>
        </div>
        {leftContent}
      </div>
      
      <div className="flex items-center gap-4">
        {rightContent}
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 pl-3 pr-1 rounded-full border border-border-subtle hover:bg-surface-raised transition-colors focus:outline-none"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            <span className="text-sm font-medium text-text-secondary hidden sm:block">
              {user?.full_name?.split(' ')[0] || 'User'}
            </span>
            <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-text-secondary overflow-hidden">
              <User size={16} strokeWidth={1.5} />
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-container border border-border-subtle rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => { setDropdownOpen(false); /* Add support action if any */ }}
                className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface-raised hover:text-on-surface flex items-center gap-2 transition-colors"
              >
                <LifeBuoy size={16} />
                <span>Support</span>
              </button>
              <div className="h-px bg-border-subtle my-1 mx-2" />
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container/10 flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
