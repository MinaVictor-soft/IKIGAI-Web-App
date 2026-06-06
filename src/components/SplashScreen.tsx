import React, { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete?: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, 3800)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center z-9999 overflow-hidden">
      {/* Decorative gradient circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10" />

      {/* Floating petals */}
      <div className="absolute animate-pulse" style={{ left: '-10%', top: '20%' }}>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🌸</span>
      </div>
      <div className="absolute animate-pulse" style={{ right: '-10%', top: '40%' }}>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🌸</span>
      </div>
      <div className="absolute animate-pulse" style={{ left: '-5%', bottom: '20%' }}>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '1s' }}>🌺</span>
      </div>
      <div className="absolute animate-pulse" style={{ right: '-5%', bottom: '30%' }}>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}>🌸</span>
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-8xl animate-scale-in mb-6">⛩️</div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-slide-up">
            IKIGAI
          </h1>
          <p className="text-3xl font-bold text-purple-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            生き甲斐
          </p>
        </div>

        {/* Subtitle */}
        <div className="space-y-1 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-xl font-semibold text-purple-300">Quest</p>
          <p className="text-gray-300">Learn. Compete. Grow.</p>
        </div>

        {/* Arabic tagline */}
        <p className="text-lg text-gray-400 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          اكتشف هدفك
        </p>

        {/* Decorative dots */}
        <div className="text-2xl text-purple-400 tracking-widest animate-slide-up" style={{ animationDelay: '0.8s' }}>
          • • •
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.7); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
