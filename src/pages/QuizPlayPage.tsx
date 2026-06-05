import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Question {
  id: string
  text: string
  questionText?: string
  options: string[]
  optionIds?: string[]
  correctAnswer: string
  explanation?: string
}

interface Quiz {
  id: string
  title: string
  description?: string
  questions: Question[]
  timeLimit?: number
}

interface QuizResult {
  score: number
  maxScore: number
  xpEarned: number
  percentage: number
  passed: boolean
  answers?: any[]
}

export default function QuizPlayPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [previousResult, setPreviousResult] = useState<any>(null)

  useEffect(() => {
    loadQuiz()
  }, [quizId])

  const loadQuiz = async () => {
    setLoading(true)
    setError('')
    try {
      // Get quiz details
      const quizRes = await api.get(`/quiz/${quizId}`)
      setQuiz(quizRes.data?.data)

      // Check if already submitted
      const resultRes = await api.get(`/quiz/${quizId}/result`)
      if (resultRes.data?.data) {
        setPreviousResult(resultRes.data.data)
      }

      // Set up timer
      if (quizRes.data?.data?.timeLimit) {
        setTimeLeft(quizRes.data.data.timeLimit)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result || previousResult) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, result, previousResult])

  const handleAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }))
  }

  const handleSubmit = async () => {
    if (submitting || !quiz) return

    setSubmitting(true)
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }))

      const response = await api.post(`/quiz/${quizId}/submit`, {
        answers: formattedAnswers,
      })

      const data = response.data?.data
      setResult({
        score: data.score,
        maxScore: data.maxScore || quiz.questions.length,
        xpEarned: data.xpAwarded || data.xpEarned || 0,
        percentage: Math.round((data.score / (data.maxScore || quiz.questions.length)) * 100),
        passed: data.passed || data.score >= (data.maxScore || quiz.questions.length) / 2,
        answers: data.correctAnswers,
      })

      // Update user with new XP
      if (user && data.xpAwarded) {
        updateUser({
          ...user,
          xp: (user.xp || 0) + data.xpAwarded,
        })
      }
      toast.success('Quiz submitted successfully!')
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to submit quiz'
      if (err?.response?.status === 409) {
        toast.error('You have already completed this quiz')
        setPreviousResult({ score: 0, maxScore: 0 })
      } else {
        toast.error(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-500/10 border border-red-500 text-red-600 p-6 rounded-lg text-center">
          <p className="text-lg font-semibold mb-4">{error}</p>
          <button
            onClick={() => navigate('/quizzes')}
            className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg transition"
          >
            {t('back')} to Quizzes
          </button>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <p className="text-text-muted">{t('noResults') || 'Quiz not found'}</p>
        </div>
      </div>
    )
  }

  // Show previous result if already submitted
  if (previousResult && !result) {
    const percentage = previousResult.percentage || Math.round((previousResult.score / previousResult.maxScore) * 100)

    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/quizzes')}
          className="text-primary hover:text-secondary mb-6 flex items-center gap-2 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Quizzes
        </button>

        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '😅'}
          </div>
          <h1 className="text-3xl font-bold mb-2">Quiz Already Completed!</h1>
          <p className="text-text-muted mb-6">You took this quiz on {new Date().toLocaleDateString()}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-surface border border-border p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {previousResult.score}/{previousResult.maxScore}
              </div>
              <p className="text-text-muted text-sm">Score</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-lg">
              <div className="text-2xl font-bold text-secondary">{percentage}%</div>
              <p className="text-text-muted text-sm">Accuracy</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">
                +{previousResult.xpAwarded || 0}
              </div>
              <p className="text-text-muted text-sm">XP Earned</p>
            </div>
          </div>

          <div className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold mb-6 ${
            previousResult.passed
              ? 'bg-green-500/20 text-green-600'
              : 'bg-red-500/20 text-red-600'
          }`}>
            {previousResult.passed ? '✓ Passed' : '✗ Did not pass'}
          </div>

          <button
            onClick={() => navigate('/quizzes')}
            className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg transition"
          >
            Try Another Quiz
          </button>
        </div>
      </div>
    )
  }

  // Show results after just submitting
  if (result) {
    const { score, maxScore, xpEarned, percentage, passed } = result

    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🎉' : percentage >= 50 ? '👍' : '😅'}
          </div>
          <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
          <p className="text-text-muted mb-6">Great effort! Here's how you did:</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-surface border border-border p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {score}/{maxScore}
              </div>
              <p className="text-text-muted text-sm">Score</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-lg">
              <div className="text-2xl font-bold text-secondary">{percentage}%</div>
              <p className="text-text-muted text-sm">Accuracy</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">+{xpEarned}</div>
              <p className="text-text-muted text-sm">XP Earned</p>
            </div>
          </div>

          <div className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold mb-6 ${
            passed
              ? 'bg-green-500/20 text-green-600'
              : 'bg-red-500/20 text-red-600'
          }`}>
            {passed ? '✓ Passed' : '✗ Did not pass'}
          </div>

          <button
            onClick={() => navigate('/quizzes')}
            className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg transition"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    )
  }

  // Show active quiz
  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const unansweredQuestions = quiz.questions.filter((q) => !answers[q.id]).length

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header with Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <p className="text-text-muted text-sm">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
          </div>
          {timeLeft !== null && (
            <div className={`text-lg font-bold ${
              timeLeft < 10 ? 'text-red-500' : 'text-primary'
            }`}>
              ⏱ {timeLeft}s
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-border rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-surface border border-border rounded-lg p-8 mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-8">{question.text}</h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const optionId = question.optionIds?.[index] || option
            const isSelected = answers[question.id] === optionId

            return (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, optionId)}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary bg-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-border'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className={`font-medium ${isSelected ? 'text-primary' : 'text-text'}`}>
                    {option}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Unanswered Warning */}
      {unansweredQuestions > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-600 p-4 rounded-lg mb-6">
          ⚠️ {unansweredQuestions} question{unansweredQuestions > 1 ? 's' : ''} not answered yet
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:bg-surface transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        {currentQuestion < quiz.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-secondary text-white transition"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  )
}
