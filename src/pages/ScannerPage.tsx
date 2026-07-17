import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QrCode, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import api from '../lib/api'

type ScanMode = 'attendance' | 'bonus' | 'staffAward'

export default function ScannerPage() {
  const { t } = useTranslation()
  const { user, refreshUser } = useAuth()
  const [scanMode, setScanMode] = useState<ScanMode>('attendance')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [manualInput, setManualInput] = useState('')

  const [staffTarget, setStaffTarget] = useState<string | null>(null)
  const [awardAmount, setAwardAmount] = useState('10')
  const [awardReason, setAwardReason] = useState('')

  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  const handleScan = async (qrCode: string) => {
    if (!qrCode.trim()) return
    setScanning(true)
    setResult(null)

    try {
      if (scanMode === 'attendance') {
        const response = await api.post('/attendance/scan', { qrToken: qrCode.trim() })
        const xpEarned = response.data?.data?.xpEarned || response.data?.data?.xpAwarded || 0
        setResult({ success: true, message: `✓ تم تسجيل الحضور! +${xpEarned} XP` })
        toast.success(`تم تسجيل الحضور! +${xpEarned} XP`)
        await refreshUser()

      } else if (scanMode === 'bonus') {
        const response = await api.post('/bonus/claim', { token: qrCode.trim() })
        const xpAwarded = response.data?.data?.xpAwarded || 0
        setResult({ success: true, message: `✓ تم استلام البونص! +${xpAwarded} XP` })
        toast.success(`تم استلام البونص! +${xpAwarded} XP`)
        await refreshUser()

      } else if (scanMode === 'staffAward' && isStaff) {
        setStaffTarget(qrCode.trim())
        setResult(null)
      }

      setManualInput('')
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || 'فشل الـ scan، حاول تاني'
      setResult({ success: false, message: `✗ ${message}` })
      toast.error(message)
    } finally {
      setScanning(false)
    }
  }

  const handleStaffAward = async () => {
    if (!staffTarget || !awardReason.trim()) {
      toast.error('ادخل السبب')
      return
    }
    setScanning(true)
    try {
      const response = await api.post('/bonus/staff-award', {
        userQrToken: staffTarget,
        amount: parseInt(awardAmount) || 10,
        reason: awardReason.trim(),
      })
      const userName = response.data?.data?.user?.name || 'المستخدم'
      setResult({ success: true, message: `✓ تم إعطاء ${awardAmount} XP لـ ${userName}` })
      toast.success(`تم إعطاء ${awardAmount} XP لـ ${userName}`)
      setStaffTarget(null)
      setAwardReason('')
      setAwardAmount('10')
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || 'فشل الـ award'
      setResult({ success: false, message: `✗ ${message}` })
      toast.error(message)
      setStaffTarget(null)
    } finally {
      setScanning(false)
    }
  }

  const resetAll = () => {
    setResult(null)
    setStaffTarget(null)
    setManualInput('')
    setAwardReason('')
    setAwardAmount('10')
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-text">{t('scanQr') || 'مسح QR'}</h1>
        <p className="text-text-muted mb-8">{t('scanQrDescription') || 'امسح الـ QR code لتسجيل الحضور أو استلام البونص'}</p>

        {/* Mode Selection */}
        <div className="bg-surface border border-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-text">الوضع</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => { setScanMode('attendance'); resetAll() }}
              className={`p-3 rounded-lg transition font-medium ${
                scanMode === 'attendance' ? 'bg-primary text-white' : 'bg-background border border-border text-text hover:border-primary'
              }`}
            >
              📋 {t('attendance') || 'حضور'}
            </button>
            <button
              onClick={() => { setScanMode('bonus'); resetAll() }}
              className={`p-3 rounded-lg transition font-medium ${
                scanMode === 'bonus' ? 'bg-primary text-white' : 'bg-background border border-border text-text hover:border-primary'
              }`}
            >
              🎁 {t('bonus') || 'بونص'}
            </button>
            {isStaff && (
              <button
                onClick={() => { setScanMode('staffAward'); resetAll() }}
                className={`p-3 rounded-lg transition font-medium ${
                  scanMode === 'staffAward' ? 'bg-amber-500 text-white' : 'bg-background border border-border text-text hover:border-amber-500'
                }`}
              >
                ⭐ Award
              </button>
            )}
          </div>
        </div>

        {/* How scanning works — info box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 text-sm text-blue-300">
          {scanMode === 'attendance' && (
            <p>📌 <strong>حضور:</strong> الكود بيتجيب من الـ QR الموجود في الـ session. انسخ الـ UUID من الـ QR وضعه هنا.</p>
          )}
          {scanMode === 'bonus' && (
            <p>📌 <strong>بونص:</strong> انسخ الـ token من QR البونص وضعه في الخانة.</p>
          )}
          {scanMode === 'staffAward' && (
            <p>📌 <strong>Award:</strong> انسخ الـ QR token بتاع المستخدم وضعه — هيطلع فورم تحدد فيه الـ XP والسبب.</p>
          )}
        </div>

        {/* Staff Award Form */}
        {staffTarget && scanMode === 'staffAward' && (
          <div className="bg-surface border border-amber-500/40 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-text mb-4">⭐ إعطاء XP للمستخدم</h3>
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm text-text-muted w-20">الكمية:</label>
              <input
                type="number"
                value={awardAmount}
                onChange={e => setAwardAmount(e.target.value)}
                className="w-24 bg-background border border-border rounded px-3 py-2 text-text text-center font-bold focus:outline-none focus:border-primary"
                min="1" max="999"
              />
              <span className="text-primary font-semibold">XP</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-text-muted mb-2">السبب:</label>
              <input
                type="text"
                value={awardReason}
                onChange={e => setAwardReason(e.target.value)}
                placeholder="مثال: مشاركة ممتازة"
                className="w-full bg-background border border-border rounded px-3 py-2 text-text focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetAll}
                className="flex-1 py-2 border border-border rounded-lg text-text-muted hover:border-primary transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleStaffAward}
                disabled={!awardReason.trim() || scanning}
                className="flex-2 py-2 px-6 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-lg transition"
              >
                {scanning ? 'جاري الإرسال...' : 'إرسال ⭐'}
              </button>
            </div>
          </div>
        )}

        {/* QR Input */}
        {!staffTarget && (
          <div className="bg-surface border border-border p-6 rounded-lg mb-6">
            <div className="bg-background rounded-lg p-10 mb-6 flex items-center justify-center">
              <QrCode size={72} className="text-primary opacity-40" />
            </div>
            <p className="text-text-muted text-center text-sm mb-6">
              {scanMode === 'attendance' && 'الـ Web مش بيفتح الكاميرا — انسخ الـ UUID من الـ QR وضعه هنا'}
              {scanMode === 'bonus' && 'انسخ الـ bonus token وضعه هنا'}
              {scanMode === 'staffAward' && 'انسخ الـ QR token بتاع المستخدم'}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan(manualInput)}
                placeholder="الصق الـ QR token هنا..."
                className="flex-1 bg-background border border-border rounded px-4 py-2 text-text placeholder-text-muted focus:outline-none focus:border-primary"
                disabled={scanning}
              />
              <button
                onClick={() => handleScan(manualInput)}
                disabled={!manualInput.trim() || scanning}
                className="bg-primary hover:bg-primary/80 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                {scanning ? '...' : 'مسح'}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`flex items-start gap-4 p-5 rounded-lg border mb-4 ${
            result.success
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            {result.success
              ? <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={22} />
              : <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={22} />
            }
            <div className="flex-1">
              <p className={result.success ? 'text-green-300' : 'text-red-300'}>{result.message}</p>
              <button onClick={resetAll} className="mt-3 text-sm text-text-muted underline hover:text-text">
                مسح تاني
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
