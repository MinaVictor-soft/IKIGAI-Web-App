import React, { createContext, useContext } from 'react'
import { useTranslation } from 'react-i18next'

interface LangContextType {
  t: (key: string, defaultValue?: string) => string
  language: string
  setLanguage: (lang: string) => void
  isRTL: boolean
}

const LangContext = createContext<LangContextType | undefined>(undefined)

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation()

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }

  React.useEffect(() => {
    const savedLang = localStorage.getItem('language') || i18n.language
    setLanguage(savedLang)
  }, [])

  return (
    <LangContext.Provider
      value={{
        t: (key: string, defaultValue?: string) => t(key) || defaultValue || key,
        language: i18n.language,
        setLanguage,
        isRTL: i18n.language === 'ar',
      }}
    >
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => {
  const context = useContext(LangContext)
  if (!context) {
    throw new Error('useLang must be used within LangProvider')
  }
  return context
}
