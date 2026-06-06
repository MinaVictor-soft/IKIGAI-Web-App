import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LangContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isRTL, lang, setLang } = useLang()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error(t('enterCredentials') || 'Please enter email and password')
      return
    }
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
      navigate('/')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const decorativeEmojis = ['🌸', '🌸', '🌺', '⛩️']

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-8 relative overflow-hidden"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Language Switcher */}
        <div className="flex justify-end">
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 transition-colors border border-purple-500/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0016 5.5V3.935m0 2v5a2 2 0 104 0v-5m0 0V7a2 2 0 10-4 0v.935" />
            </svg>
            <span className="text-sm font-medium">{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="space-y-1">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              IKIGAI
            </h1>
            <p className="text-2xl text-purple-300 font-semibold">生き甲斐</p>
            <p className="text-gray-300">{t('tagline') || 'Quest - Learn. Compete. Grow.'}</p>
          </div>
          <div className="flex justify-center gap-3 text-2xl pt-2">
            {decorativeEmojis.map((emoji, i) => (
              <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                {emoji}
              </span>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-300">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder={t('emailPlaceholder') || 'you@example.com'}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-300">{t('password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 3c-4.478 0-8.268 2.943-9.542 7a9.965 9.965 0 001.355 2.901l1.414-1.414A7.966 7.966 0 0110 5c3.59 0 6.761 2.595 7.416 6a7.967 7.967 0 01-.656 2.072l1.419 1.419a9.965 9.965 0 001.355-2.901C18.268 5.943 14.478 3 10 3z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('logging') || 'Logging in...'}
              </>
            ) : (
              t('login') || 'Login'
            )}
          </button>
        </form>

        {/* Footer Text */}
        <p className="text-center text-gray-400 text-sm">
          {t('useConferenceCredentials') || 'Use conference credentials to login'}
        </p>

        {/* Register Link */}
        <div className="flex justify-center gap-2 pt-4 border-t border-purple-500/20">
          <span className="text-gray-400">{t('dontHaveAccount') || 'Don\'t have an account?'}</span>
          <button
            onClick={() => navigate('/register')}
            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
          >
            {t('registerNow') || 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
