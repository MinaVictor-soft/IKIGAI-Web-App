import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QrCode, AlertCircle, CheckCircle, Upload } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import api from '../lib/api'

type ScanMode = 'attendance' | 'bonus' | 'staffAward'

export default function ScannerPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [scanMode, setScanMode] = useState<ScanMode>('attendance')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [manualInput, setManualInput] = useState('')

  // Check if user is staff
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  const handleScan = async (qrCode: string) => {
    if (!qrCode.trim()) return

    setScanning(true)
    setResult(null)

    try {
      let response

      if (scanMode === 'attendance') {
        // Mark attendance
        response = await api.post('/attendance/scan', { qrToken: qrCode })
        const xpEarned = response.data?.data?.xpEarned || response.data?.data?.xpAwarded || 0
        setResult({
          success: true,
          message: `✓ Attendance marked! +${xpEarned} XP`,
        })
        toast.success(`Attendance marked! +${xpEarned} XP`)
      } else if (scanMode === 'bonus') {
        // Claim bonus
        response = await api.post('/bonus/claim', { qrCode })
        const xpEarned = response.data?.data?.xpEarned || 0
        setResult({
          success: true,
          message: `✓ Bonus claimed! +${xpEarned} XP`,
        })
        toast.success(`Bonus claimed! +${xpEarned} XP`)
      } else if (scanMode === 'staffAward' && isStaff) {
        // Staff awarding - show award dialog
        setResult({
          success: true,
          message: `✓ User found! Ready to award XP`,
        })
        toast.success('User found - ready to award XP')
      }

      setManualInput('')
    } catch (error: any) {
      const message = error?.response?.data?.message || 'QR scan failed. Try again.'
      setResult({
        success: false,
        message: `✗ Error: ${message}`,
      })
      toast.error(message)
    } finally {
      setScanning(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In production, use QR code library like jsQR to decode image
      toast.loading('QR image scanning coming soon - use manual input for now')
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-text">{t('scanQr')}</h1>
        <p className="text-text-muted mb-8">{t('scanQrDescription')}</p>

        {/* Mode Selection - Only show staff modes if user is staff */}
        <div className="bg-surface border border-border rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">{t('mode') || 'Mode'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setScanMode('attendance')}
              className={`p-3 rounded-lg transition ${
                scanMode === 'attendance'
                  ? 'bg-primary text-white'
                  : 'bg-background border border-border text-text hover:border-primary'
              }`}
            >
              {t('attendance') || 'Attendance'}
            </button>

            <button
              onClick={() => setScanMode('bonus')}
              className={`p-3 rounded-lg transition ${
                scanMode === 'bonus'
                  ? 'bg-primary text-white'
                  : 'bg-background border border-border text-text hover:border-primary'
              }`}
            >
              {t('bonus') || 'Bonus'}
            </button>

            {isStaff && (
              <button
                onClick={() => setScanMode('staffAward')}
                className={`p-3 rounded-lg transition ${
                  scanMode === 'staffAward'
                    ? 'bg-secondary text-white'
                    : 'bg-background border border-border text-text hover:border-secondary'
                }`}
              >
                {t('staffAward') || 'Staff Award'}
              </button>
            )}
          </div>
        </div>

        {/* QR Scanner Section */}
        <div className="bg-surface border border-border p-8 rounded-lg mb-8">
          <div className="bg-background rounded-lg p-12 mb-6 flex items-center justify-center">
            <QrCode size={80} className="text-primary opacity-50" />
          </div>

          <p className="text-text-muted text-center mb-6">
            {scanMode === 'attendance' && 'Scan event QR code to mark attendance'}
            {scanMode === 'bonus' && 'Scan bonus QR code to claim rewards'}
            {scanMode === 'staffAward' && 'Scan user QR code to award XP'}
          </p>

          {/* Manual Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">{t('manualInput') || 'Enter QR Code'}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScan(manualInput)}
                placeholder="Paste QR code or token..."
                className="flex-1 bg-background border border-border rounded px-4 py-2 text-text placeholder-text-muted focus:outline-none focus:border-primary"
                disabled={scanning}
              />
              <button
                onClick={() => handleScan(manualInput)}
                disabled={!manualInput.trim() || scanning}
                className="bg-primary hover:bg-secondary disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                {scanning ? 'Scanning...' : 'Scan'}
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="qr-file-input"
            />
            <label
              htmlFor="qr-file-input"
              className="inline-flex items-center gap-2 bg-background border border-border hover:border-primary text-text font-bold py-2 px-6 rounded-lg cursor-pointer transition"
            >
              <Upload size={18} />
              {t('uploadImage') || 'Upload QR Image'}
            </label>
          </div>
        </div>

        {/* Result Message */}
        {result && (
          <div
            className={`flex items-start gap-4 p-6 rounded-lg border ${
              result.success
                ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700'
                : 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700'
            }`}
          >
            {result.success ? (
              <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={24} />
            ) : (
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={24} />
            )}
            <div>
              <p
                className={
                  result.success
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-red-900 dark:text-red-100'
                }
              >
                {result.message}
              </p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-background border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">{t('info') || 'Information'}</h3>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>• {scanMode === 'attendance' && 'Scan the QR code at events to mark attendance'}</li>
            <li>• {scanMode === 'bonus' && 'Scan promotional QR codes to claim bonus XP'}</li>
            {isStaff && <li>• {scanMode === 'staffAward' && 'As staff, scan user QR codes to award XP'}</li>}
            <li>• You will earn XP for successful scans</li>
            <li>• Each QR code can only be scanned once per user</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
