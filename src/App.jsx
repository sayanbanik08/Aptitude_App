import React, { useState, useEffect } from 'react'
import { questionBank } from './data/questions'
import { categoryMeta } from './data/categoryMeta'
import { shuffleArray, getStorageData, saveStorageData, saveQuizResult, calculateStats } from './utils/helpers'
import Navbar from './components/Navbar'
import Home from './screens/Home'
import Categories from './screens/Categories'
import Config from './screens/Config'
import Quiz from './screens/Quiz'
import Results from './screens/Results'
import Review from './screens/Review'
import Dashboard from './screens/Dashboard'
import Modal from './components/Modal'
import Toast from './components/Toast'
import AddQuestion from './screens/AddQuestion'
import AllQuestions from './screens/AllQuestions'

const mockExamSections = [
  { name: 'Numerical Ability (Aptitude)', start: 0, end: 19, timeInSeconds: 1260 },
  { name: 'Verbal Ability (English)', start: 20, end: 44, timeInSeconds: 1320 },
  { name: 'Reasoning Ability (Logical Reasoning)', start: 45, end: 64, timeInSeconds: 1260 },
  { name: 'Advance Reasoning Ability', start: 65, end: 71, timeInSeconds: 660 },
  { name: 'Advance Numerical Ability', start: 72, end: 78, timeInSeconds: 660 }
]

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [difficulty, setDifficulty] = useState('easy')
  const [questionCount, setQuestionCount] = useState(5)
  const [timerEnabled, setTimerEnabled] = useState(true)
  
  const [customQuestions, setCustomQuestions] = useState(() => {
    const data = getStorageData()
    return data.customQuestions || {}
  })
  const [addQuestionCategory, setAddQuestionCategory] = useState(null)

  const activeQuestionBank = React.useMemo(() => {
    const merged = {}
    const allKeys = new Set([...Object.keys(questionBank), ...Object.keys(customQuestions)])
    for (const key of allKeys) {
      merged[key] = [...(questionBank[key] || []), ...(customQuestions[key] || [])]
    }
    return merged
  }, [customQuestions])
  
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  
  const [quizStartTime, setQuizStartTime] = useState(null)
  const [quizEndTime, setQuizEndTime] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [sectionTimeStart, setSectionTimeStart] = useState(null)
  const [timerInterval, setTimerInterval] = useState(null)
  
  const [lastQuizResult, setLastQuizResult] = useState(null)
  const [markingMode, setMarkingMode] = useState('positive')
  const [history, setHistory] = useState([])
  const [submittedSections, setSubmittedSections] = useState([])
  
  const [stats, setStats] = useState(calculateStats([], {}))
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)

  // Calculate current section index early so it can be used in useEffects
  const currentSectionIndex = selectedCategory === 'mock'
    ? mockExamSections.findIndex(sec => currentQuestionIndex >= sec.start && currentQuestionIndex <= sec.end)
    : -1

  // Load stats on mount
  useEffect(() => {
    const data = getStorageData()
    setStats(calculateStats(data.quizHistory, data.categoryStats))
  }, [])

  // Timer effect - per section
  useEffect(() => {
    if (currentScreen === 'quiz' && timerEnabled && selectedCategory === 'mock' && currentSectionIndex !== -1 && sectionTimeStart === null) {
      setSectionTimeStart(Date.now())
    }
  }, [currentScreen, timerEnabled, selectedCategory, currentSectionIndex, sectionTimeStart])

  useEffect(() => {
    if (currentScreen === 'quiz' && timerEnabled && selectedCategory === 'mock' && sectionTimeStart !== null) {
      const interval = setInterval(() => {
        const currentSection = mockExamSections[currentSectionIndex]
        if (!currentSection) return

        const elapsedSeconds = Math.floor((Date.now() - sectionTimeStart) / 1000)
        const remaining = currentSection.timeInSeconds - elapsedSeconds

        if (remaining <= 0) {
          showToast('Section time expired! Submitting...', 'info')
          handleSectionTimeExpired()
          clearInterval(interval)
        } else {
          setTimeRemaining(remaining)
        }
      }, 1000)
      setTimerInterval(interval)
      return () => clearInterval(interval)
    }
  }, [currentScreen, timerEnabled, selectedCategory, currentSectionIndex, sectionTimeStart])

  // Prevent direct refresh or close during active quiz
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }

    if (currentScreen === 'quiz') {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [currentScreen])

  const handleSectionTimeExpired = () => {
    if (selectedCategory === 'mock' && currentSectionIndex !== -1) {
      const updated = [...submittedSections]
      updated[currentSectionIndex] = true
      setSubmittedSections(updated)

      if (currentSectionIndex < mockExamSections.length - 1) {
        const nextSection = mockExamSections[currentSectionIndex + 1]
        setSectionTimeStart(null)
        setCurrentQuestionIndex(nextSection.start)
        setTimeRemaining(nextSection.timeInSeconds)
      } else {
        processResults()
      }
    }
  }

  const handleTimerExpired = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      showToast("Time's up! Moving to next question", 'info')
      nextQuestion()
    } else {
      showToast("Time's up! Submitting quiz", 'info')
      submitQuiz()
    }
  }

  const navigate = (screen) => {
    if (screen === currentScreen) return
    if (currentScreen === 'quiz' && screen !== 'quiz') {
      if (timerInterval) clearInterval(timerInterval)
    }
    setHistory(prev => [...prev, currentScreen])
    setCurrentScreen(screen)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    if (currentScreen === 'quiz') {
      quitQuiz()
      return
    }
    if (history.length === 0) {
      setCurrentScreen('home')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const newHistory = [...history]
    const previous = newHistory.pop()
    setHistory(newHistory)
    setCurrentScreen(previous)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectCategory = (key) => {
    let questions = [...(activeQuestionBank[key] || [])]
    if (questions.length === 0) {
      showToast('No questions available in this category', 'error')
      return
    }

    questions = shuffleArray(questions)
    const count = Math.min(10, questions.length)
    const selectedQuestions = questions.slice(0, count)

    setSelectedCategory(key)
    setQuizQuestions(selectedQuestions)
    setCurrentQuestionIndex(0)
    setUserAnswers(new Array(selectedQuestions.length).fill(-1))
    setQuizStartTime(Date.now())
    setQuizEndTime(null)
    setTimeRemaining(60)
    setTimerEnabled(true)
    setSubmittedSections([])
    navigate('quiz')
  }

  const startQuiz = () => {
    if (!selectedCategory) return

    let questions = [...(activeQuestionBank[selectedCategory] || [])]

    if (questions.length === 0) {
      showToast('No questions available', 'error')
      return
    }

    questions = shuffleArray(questions)

    if (questionCount !== 'all') {
      questions = questions.slice(0, Math.min(questionCount, questions.length))
    }

    setQuizQuestions(questions)
    setCurrentQuestionIndex(0)
    setUserAnswers(new Array(questions.length).fill(-1))
    setQuizStartTime(Date.now())
    setQuizEndTime(null)
    setTimeRemaining(60)
    setSubmittedSections([])
    navigate('quiz')
  }

  const startMockTest = () => {
    showModal(
      <i className="fas fa-cog" style={{ fontSize: '24px', color: 'var(--accent-1)' }}></i>,
      'Choose scoring style for this mock test:',
      null,
      null,
      [
        { label: 'Positive Marking', action: () => beginMockTest('positive') },
        { label: 'Negative Marking', action: () => beginMockTest('negative') }
      ],
      {
        hideCancel: true,
        preventOverlayClose: true,
        showCloseButton: true,
        isSettings: true
      }
    )
  }

  const beginMockTest = (mode) => {
    setMarkingMode(mode)

    const numAbility = activeQuestionBank['numericalAbility'] || []
    const verb = activeQuestionBank['verbalAbility'] || []
    const logi = activeQuestionBank['reasoningAbility'] || []
    const advReas = activeQuestionBank['advancedReasoningAbility'] || []
    const advNum = activeQuestionBank['advancedNumericalAbility'] || []

    const getSectionQuestions = (pool, count, categoryKey) => {
      let shuffledPool = shuffleArray(pool)
      let selected = []
      while (selected.length < count) {
        if (shuffledPool.length === 0) {
          shuffledPool = shuffleArray(pool)
        }
        selected.push({ ...shuffledPool.pop(), category: categoryKey })
      }
      return selected
    }

    const numericalAbility = getSectionQuestions(numAbility, 20, 'numericalAbility')
    const verbalAbility = getSectionQuestions(verb, 25, 'verbalAbility')
    const reasoningAbility = getSectionQuestions(logi, 20, 'reasoningAbility')
    const advReasoning = getSectionQuestions(advReas, 7, 'advancedReasoningAbility')
    const advNumerical = getSectionQuestions(advNum, 7, 'advancedNumericalAbility')

    const mockQuestions = [
      ...numericalAbility,
      ...verbalAbility,
      ...reasoningAbility,
      ...advReasoning,
      ...advNumerical
    ]

    setSelectedCategory('mock')
    setQuizQuestions(mockQuestions)
    setCurrentQuestionIndex(0)
    setUserAnswers(new Array(mockQuestions.length).fill(-1))
    setQuizStartTime(Date.now())
    setQuizEndTime(null)
    setTimeRemaining(mockExamSections[0].timeInSeconds)
    setSectionTimeStart(null)
    setSubmittedSections(Array(mockExamSections.length).fill(false))
    navigate('quiz')
  }

  const isCurrentSectionEnd = selectedCategory === 'mock' && currentSectionIndex !== -1 && currentQuestionIndex === mockExamSections[currentSectionIndex].end

  const canAccessSection = (sectionIndex) => {
    if (selectedCategory !== 'mock') return true
    if (sectionIndex === currentSectionIndex) return true
    if (sectionIndex === currentSectionIndex + 1 && submittedSections[currentSectionIndex]) return true
    return false
  }

  const selectOption = (index) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = index
    setUserAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (selectedCategory === 'mock' && isCurrentSectionEnd && currentSectionIndex < mockExamSections.length - 1) {
      showToast('Submit the current section before moving to the next one.', 'info')
      return
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const prevQuestion = () => {
    if (selectedCategory === 'mock' && currentSectionIndex !== -1) {
      const currentSectionStart = mockExamSections[currentSectionIndex].start
      if (currentQuestionIndex - 1 < currentSectionStart) {
        showToast('You cannot go back to previous sections.', 'info')
        return
      }
    }
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const goToQuestion = (index) => {
    if (selectedCategory === 'mock') {
      const targetSectionIndex = mockExamSections.findIndex(sec => index >= sec.start && index <= sec.end)
      
      if (targetSectionIndex < currentSectionIndex) {
        showToast('You cannot go back to previous sections.', 'info')
        return
      }
      
      if (!canAccessSection(targetSectionIndex)) {
        showToast('Complete the current section before moving ahead.', 'info')
        return
      }
    }
    setCurrentQuestionIndex(index)
  }

  const submitQuiz = () => {
    const unanswered = userAnswers.filter(a => a === -1).length

    if (unanswered > 0) {
      showModal(
        'Submit Quiz?',
        `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Are you sure?`,
        () => processResults()
      )
    } else {
      processResults()
    }
  }

  const submitSection = () => {
    if (selectedCategory !== 'mock' || currentSectionIndex === -1) {
      submitQuiz()
      return
    }

    const section = mockExamSections[currentSectionIndex]
    const sectionAnswers = userAnswers.slice(section.start, Math.min(section.end + 1, userAnswers.length))
    const unanswered = sectionAnswers.filter(a => a === -1).length
    const message = unanswered > 0
      ? `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''} in this section. Submit section?`
      : 'Submit this section and continue?'

    showModal(
      'Submit Section?',
      message,
      () => {
        const updated = [...submittedSections]
        updated[currentSectionIndex] = true
        setSubmittedSections(updated)

        if (currentSectionIndex < mockExamSections.length - 1) {
          const nextSection = mockExamSections[currentSectionIndex + 1]
          setSectionTimeStart(null)
          setCurrentQuestionIndex(nextSection.start)
          setTimeRemaining(nextSection.timeInSeconds)
        } else {
          processResults()
        }
      }
    )
  }

  const processResults = () => {
    if (timerInterval) clearInterval(timerInterval)

    const endTime = Date.now()
    let correct = 0, incorrect = 0, skipped = 0

    userAnswers.forEach((ans, i) => {
      if (ans === -1) skipped++
      else if (ans === quizQuestions[i].correct) correct++
      else incorrect++
    })

    const total = quizQuestions.length
    const totalMarks = selectedCategory === 'mock' && markingMode === 'negative'
      ? Math.max(0, correct - incorrect * 2 - skipped)
      : correct
    const percentage = Math.round((totalMarks / total) * 100)
    const timeTaken = Math.round((endTime - quizStartTime) / 1000)

    const result = {
      category: selectedCategory,
      correct,
      incorrect,
      skipped,
      total,
      totalMarks,
      percentage,
      timeTaken,
      markingMode,
      date: new Date().toISOString(),
      difficulty
    }

    setLastQuizResult(result)
    
    // Save and update stats
    const updatedData = saveQuizResult(result)
    setStats(calculateStats(updatedData.quizHistory, updatedData.categoryStats))
    
    navigate('results')
  }

  const reviewAnswers = () => {
    navigate('review')
  }

  const retryQuiz = () => {
    if (selectedCategory === 'mock') {
      startMockTest()
    } else {
      startQuiz()
    }
  }

  const quitQuiz = () => {
    showModal(
      'Quit Quiz?',
      'Your progress will be lost. Are you sure?',
      () => {
        if (timerInterval) clearInterval(timerInterval)
        navigate('home')
      }
    )
  }

  const handleSaveQuestion = async (categoryKey, newQuestion) => {
    try {
      const response = await fetch('/api/add-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categoryKey, newQuestion })
      })

      if (response.ok) {
        showToast('Question saved directly to questions.js!', 'success')
        navigate('categories')
        return
      }
    } catch (e) {
      console.warn('API save failed, falling back to LocalStorage:', e)
    }

    // Fallback: save to customQuestions state and LocalStorage
    const updatedCustom = {
      ...customQuestions,
      [categoryKey]: [...(customQuestions[categoryKey] || []), newQuestion]
    }
    setCustomQuestions(updatedCustom)

    const data = getStorageData()
    data.customQuestions = updatedCustom
    saveStorageData(data)

    showToast('Question saved to browser storage!', 'success')
    navigate('categories')
  }

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleShuffleQuestions = () => {
    showModal(
      'Shuffle All Questions?',
      'This will deeply shuffle every question within its own category. Question order AND option order will be completely randomized. This cannot be undone.',
      async () => {
        closeModal()
        showToast('Shuffling questions...', 'info')
        try {
          const response = await fetch('/api/shuffle-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          })
          if (response.ok) {
            const result = await response.json()
            showToast(`Shuffled ${result.totalShuffled} questions across all categories! Reload to see changes.`, 'success')
            // Force page reload so the new question order from questions.js takes effect
            setTimeout(() => window.location.reload(), 1500)
          } else {
            showToast('Shuffle failed. Are you running the dev server?', 'error')
          }
        } catch (e) {
          console.error('Shuffle error:', e)
          showToast('Shuffle failed — dev server API unavailable.', 'error')
        }
      }
    )
  }

  const handleDeleteQuestion = async (categoryKey, questionId) => {
    showModal(
      'Delete Question?',
      'Are you sure you want to permanently delete this question from the database? This action cannot be undone.',
      async () => {
        closeModal()
        showToast('Deleting question...', 'info')
        try {
          const response = await fetch('/api/delete-question', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ categoryKey, questionId })
          })

          if (response.ok) {
            showToast('Question deleted successfully!', 'success')
            
            // Re-sync local storage backup
            const updatedCustom = {
              ...customQuestions,
              [categoryKey]: (customQuestions[categoryKey] || []).filter(q => q.id !== questionId)
            }
            setCustomQuestions(updatedCustom)
            const data = getStorageData()
            data.customQuestions = updatedCustom
            saveStorageData(data)
            
            // Reload page to reflect updated file structure
            setTimeout(() => window.location.reload(), 1000)
            return
          }
        } catch (e) {
          console.warn('API delete failed, falling back to LocalStorage:', e)
        }

        // Local storage fallback
        const updatedCustom = {
          ...customQuestions,
          [categoryKey]: (customQuestions[categoryKey] || []).filter(q => q.id !== questionId)
        }
        setCustomQuestions(updatedCustom)
        const data = getStorageData()
        data.customQuestions = updatedCustom
        saveStorageData(data)
        showToast('Question deleted from browser storage!', 'success')
      }
    )
  }

  const showModal = (title, message, onConfirm, onCancel = null, options = null, config = {}) => {
    setModal({
      title,
      message,
      onConfirm,
      onCancel: onCancel || (() => setModal(null)),
      options,
      ...config
    })
  }

  const closeModal = () => {
    setModal(null)
  }

  return (
    <div className="app">
      <Navbar currentScreen={currentScreen} navigate={navigate} goBack={goBack} canGoBack={history.length > 0} />
      
      <div className={`screens-container ${currentScreen === 'quiz' ? 'quiz-mode' : ''}`}>
        {currentScreen === 'home' && (
          <Home navigate={navigate} stats={stats} startMockTest={startMockTest} onShuffle={handleShuffleQuestions} />
        )}
        {currentScreen === 'categories' && (
          <Categories 
            questionBank={activeQuestionBank} 
            categoryMeta={categoryMeta} 
            stats={stats} 
            selectCategory={selectCategory}
            onAddQuestionClick={(catKey) => {
              setAddQuestionCategory(catKey)
              navigate('add-question')
            }}
          />
        )}
        {currentScreen === 'add-question' && addQuestionCategory && (
          <AddQuestion
            categoryKey={addQuestionCategory}
            categoryMeta={categoryMeta}
            existingQuestions={activeQuestionBank}
            onSave={handleSaveQuestion}
            onCancel={() => navigate('categories')}
          />
        )}
        {currentScreen === 'config' && (
          <Config 
            selectedCategory={selectedCategory}
            categoryMeta={categoryMeta}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            questionCount={questionCount}
            setQuestionCount={setQuestionCount}
            timerEnabled={timerEnabled}
            setTimerEnabled={setTimerEnabled}
            startQuiz={startQuiz}
            navigate={navigate}
          />
        )}
        {currentScreen === 'quiz' && quizQuestions.length > 0 && (
          <Quiz
            question={quizQuestions[currentQuestionIndex]}
            questionIndex={currentQuestionIndex}
            totalQuestions={quizQuestions.length}
            userAnswers={userAnswers}
            selectedCategory={selectedCategory}
            categoryMeta={categoryMeta}
            selectOption={selectOption}
            nextQuestion={nextQuestion}
            prevQuestion={prevQuestion}
            goToQuestion={goToQuestion}
            submitQuiz={submitQuiz}
            submitSection={submitSection}
            quitQuiz={quitQuiz}
            timerEnabled={timerEnabled}
            timeRemaining={timeRemaining}
            quizQuestions={quizQuestions}
            currentSectionIndex={currentSectionIndex}
            submittedSections={submittedSections}
            canAccessSection={canAccessSection}
            mockExamSections={mockExamSections}
          />
        )}
        {currentScreen === 'results' && lastQuizResult && (
          <Results
            result={lastQuizResult}
            categoryMeta={categoryMeta}
            reviewAnswers={reviewAnswers}
            retryQuiz={retryQuiz}
            navigate={navigate}
            quizQuestions={quizQuestions}
            userAnswers={userAnswers}
          />
        )}
        {currentScreen === 'review' && lastQuizResult && (
          <Review
            quizQuestions={quizQuestions}
            userAnswers={userAnswers}
            navigate={navigate}
          />
        )}
        {currentScreen === 'dashboard' && (
          <Dashboard
            stats={stats}
            categoryMeta={categoryMeta}
          />
        )}
        {currentScreen === 'all-questions' && (
          <AllQuestions
            questionBank={activeQuestionBank}
            categoryMeta={categoryMeta}
            navigate={navigate}
            onDeleteQuestion={handleDeleteQuestion}
          />
        )}
      </div>

      {modal && (
        <Modal
          title={modal.title}
          message={modal.message}
          onConfirm={() => {
            modal.onConfirm?.()
            closeModal()
          }}
          onCancel={() => {
            modal.onCancel?.()
            closeModal()
          }}
          options={modal.options}
          hideCancel={modal.hideCancel}
          preventOverlayClose={modal.preventOverlayClose}
          showCloseButton={modal.showCloseButton}
          isSettings={modal.isSettings}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} />
      )}
    </div>
  )
}
