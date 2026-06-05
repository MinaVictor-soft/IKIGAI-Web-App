import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi, profileApi } from '../lib/api'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '../lib/storage'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  xp?: number
  rank?: number
  role?: 'USER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken()
        const storedUser = getUser()

        if (token && storedUser) {
          setUserState(storedUser)
          try {
            const response = await profileApi.getProfile()
            setUserState(response.data)
            setUser(response.data)
          } catch (error) {
            removeToken()
            removeUser()
          }
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authApi.login(email, password)
      const { token, user: userData } = response.data

      setToken(token)
      setUser(userData)
      setUserState(userData)
      toast.success('Login successful')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      const response = await authApi.register({ email, password, name })
      const { token, user: userData } = response.data

      setToken(token)
      setUser(userData)
      setUserState(userData)
      toast.success('Registration successful')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      removeToken()
      removeUser()
      setUserState(null)
      toast.success('Logged out')
    }
  }

  const updateUser = (userData: Partial<User>) => {
    const updated = { ...user, ...userData } as User
    setUserState(updated)
    setUser(updated)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
