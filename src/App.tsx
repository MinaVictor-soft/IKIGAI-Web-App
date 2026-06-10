import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useEffect } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { LangProvider } from './contexts/LangContext'
import { notificationService, startEventListener, stopEventListener } from './lib/notifications'
import { getAccessToken } from './lib/storage'

// Layouts
import MainLayout from './layouts/MainLayout'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import EventsPage from './pages/EventsPage'
import LibraryPage from './pages/LibraryPage'
import QuizzesPage from './pages/QuizzesPage'
import QuizPlayPage from './pages/QuizPlayPage'
import LeaderboardPage from './pages/LeaderboardPage'
import SportsPage from './pages/SportsPage'
import ScannerPage from './pages/ScannerPage'
import InfoPage from './pages/InfoPage'
import LoadingPage from './pages/LoadingPage'

import { useAuth } from './contexts/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingPage />
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function AppContent() {
  const { isAuthenticated } = useAuth()

  // Prevent mobile back button from closing app (SPA navigation issue)
  useEffect(() => {
    // Push multiple dummy states to maintain history stack depth
    // This prevents browser closure when device back button is pressed on empty history
    const pushDummyStates = () => {
      // Push 3 dummy states to create a buffer
      for (let i = 0; i < 3; i++) {
        window.history.pushState({ isApp: true, index: i }, '', window.location.pathname)
      }
    }

    // Initial push on app load
    pushDummyStates()

    // Handle popstate (back button pressed)
    const handleBackButton = () => {
      // If we're at the top level and user presses back, push dummy state again
      // This prevents the browser from closing
      if (window.history.length <= 1) {
        window.history.pushState({ isApp: true, preventClose: true }, '', window.location.pathname)
      }
    }

    window.addEventListener('popstate', handleBackButton)

    return () => {
      window.removeEventListener('popstate', handleBackButton)
    }
  }, [])

  // Request notification permission and start listening for events
  useEffect(() => {
    notificationService.requestPermission().catch(console.error)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      const startListener = async () => {
        try {
          const token = await getAccessToken()
          if (token) {
            startEventListener(token)
          }
        } catch (error) {
          console.error('Failed to start event listener:', error)
        }
      }
      startListener()

      return () => {
        stopEventListener()
      }
    }
  }, [isAuthenticated])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/quizzes" element={<QuizzesPage />} />
                <Route path="/quiz/:quizId" element={<QuizPlayPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/sports" element={<SportsPage />} />
                <Route path="/scan" element={<ScannerPage />} />
                <Route path="/info" element={<InfoPage />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster position="top-center" />
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  )
}
