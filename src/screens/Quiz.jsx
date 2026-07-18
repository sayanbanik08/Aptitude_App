import React, { useRef, useEffect } from 'react'
import { formatTimerDisplay } from '../utils/helpers'

export default function Quiz({
  question,
  questionIndex,
  totalQuestions,
  userAnswers,
  selectedCategory,
  categoryMeta,
  selectOption,
  nextQuestion,
  prevQuestion,
  goToQuestion,
  submitQuiz,
  submitSection,
  quitQuiz,
  timerEnabled,
  timeRemaining,
  quizQuestions,
  currentSectionIndex,
  submittedSections,
  canAccessSection,
  mockExamSections
}) {
  const meta = categoryMeta[selectedCategory] || { name: 'Mock Test', icon: 'fa-trophy' }
  const markers = ['A', 'B', 'C', 'D']

  const quizContentRef = useRef(null)

  useEffect(() => {
    if (quizContentRef.current && window.renderMathInElement) {
      try {
        window.renderMathInElement(quizContentRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        })
      } catch (err) {
        console.warn('KaTeX live rendering warning:', err)
      }
    }
  }, [question])

  const examSections = mockExamSections || [
    { name: 'Numerical Ability (Aptitude)', start: 0, end: 19 },
    { name: 'Verbal Ability (English)', start: 20, end: 44 },
    { name: 'Reasoning Ability (Logical Reasoning)', start: 45, end: 64 },
    { name: 'Advance Reasoning Ability', start: 65, end: 71 },
    { name: 'Advance Numerical Ability', start: 72, end: 78 }
  ]

  const currentSection = selectedCategory === 'mock'
    ? examSections.find(sec => questionIndex >= sec.start && questionIndex <= sec.end)
    : null

  const isCurrentSectionEnd = selectedCategory === 'mock' && currentSectionIndex !== -1 && questionIndex === examSections[currentSectionIndex].end
  const isLastMockSection = selectedCategory === 'mock' && currentSectionIndex === examSections.length - 1
  const submitLabel = selectedCategory === 'mock'
    ? 'Submit Section'
    : 'Submit'

  const isFirstQuestionOfSection = selectedCategory === 'mock' && currentSectionIndex !== -1 && questionIndex === examSections[currentSectionIndex].start
  const prevDisabled = selectedCategory === 'mock' && isFirstQuestionOfSection

  const displayStart = currentSection ? currentSection.start : 0
  const displayEnd = currentSection ? Math.min(currentSection.end, totalQuestions - 1) : totalQuestions - 1
  const displayedQuestions = quizQuestions.slice(displayStart, displayEnd + 1)

  return (
    <div id="quiz-screen" className="screen active">
      <div className="quiz-header">
        <div className="quiz-header-left">
          <div id="quiz-category-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className={`fas ${meta.icon}`}></i>
            <span>{meta.name}</span>
          </div>
          <div className="quiz-progress">
            <div id="quiz-progress-bar" className="quiz-progress-bar" 
                 style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}></div>
          </div>
          <span id="quiz-progress-text" className="quiz-progress-text">
            {questionIndex + 1} / {totalQuestions}
          </span>
        </div>
        {timerEnabled && (
          <div id="quiz-timer" className="quiz-timer">
            <i className="fas fa-hourglass-end"></i>
            <span id="timer-display">{formatTimerDisplay(timeRemaining)}</span>
          </div>
        )}
      </div>

      <div className="quiz-container">
        <div className="quiz-main" ref={quizContentRef} key={questionIndex}>
          <div className="quiz-question-section">
            <h3 id="quiz-question-number">Question {questionIndex + 1}</h3>
            <p id="quiz-question-text" className="quiz-question-text">{question.question}</p>
            {question.questionImage && (
              <img
                src={question.questionImage}
                alt="Question"
                style={{ maxWidth: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: '8px', marginTop: '12px', border: '1px solid var(--border-color)' }}
              />
            )}
          </div>

          <div id="quiz-options" className="quiz-options">
            {question.options.map((option, i) => (
              <div
                key={`q${questionIndex}-opt${i}`}
                className={`quiz-option ${userAnswers[questionIndex] === i ? 'selected' : ''}`}
                onClick={() => selectOption(i)}
                role="button"
                tabIndex="0"
              >
                <div className="option-marker">{markers[i]}</div>
                <div className="option-text" style={{ flex: 1 }}>
                  {option}
                  {question.optionImages?.[i] && (
                    <img
                      src={question.optionImages[i]}
                      alt={`Option ${markers[i]}`}
                      style={{ display: 'block', maxWidth: '100%', maxHeight: '120px', objectFit: 'contain', marginTop: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="quiz-buttons">
            <button
              className="btn btn-secondary"
              id="btn-prev"
              onClick={prevQuestion}
              disabled={questionIndex === 0 || prevDisabled}
            >
              <i className="fas fa-arrow-left"></i> Previous
            </button>
            <button className="btn btn-success" id="btn-submit-quiz" onClick={selectedCategory === 'mock' ? submitSection : submitQuiz}>
              <i className="fas fa-check"></i> {submitLabel}
            </button>
            <button
              className="btn btn-primary"
              id="btn-next"
              onClick={nextQuestion}
              disabled={questionIndex === totalQuestions - 1 || (selectedCategory === 'mock' && isCurrentSectionEnd && !isLastMockSection)}
            >
              Next <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <div className="quiz-sidebar">
          <div className="quiz-palette-toggle">
            <h4>Questions</h4>
          </div>
          <div id="quiz-dots" className="quiz-dots">
            {displayedQuestions.map((_, index) => {
              const i = displayStart + index;
              return (
                <div
                  key={i}
                  className={`quiz-dot ${
                    i === questionIndex ? 'current' : userAnswers[i] !== -1 ? 'answered' : ''
                  }`}
                  onClick={() => goToQuestion(i)}
                  title={`Question ${i + 1}`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>

          {selectedCategory === 'mock' && (
            <div className="quiz-sections">
              <div className="quiz-sections-header">
                <h4>Sections</h4>
              </div>
              <div className="quiz-sections-list">
                {examSections.filter(sec => sec.start < totalQuestions).map((sec, idx) => {
                  const isActive = questionIndex >= sec.start && questionIndex <= sec.end
                  const isSubmitted = submittedSections[idx]
                  const accessible = canAccessSection(idx)
                  const sectionClass = `quiz-section-item ${isActive ? 'active' : ''} ${isSubmitted ? 'submitted' : ''} ${!accessible ? 'locked' : ''}`
                  return (
                    <button
                      key={idx}
                      className={sectionClass}
                      disabled={!accessible}
                      onClick={() => {
                        if (accessible) {
                          goToQuestion(sec.start)
                        }
                      }}
                    >
                      <span className="section-name">{sec.name}</span>
                      <span className="section-range">Q{sec.start + 1} - Q{Math.min(sec.end + 1, totalQuestions)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button className="btn btn-danger quiz-sidebar-quit" onClick={quitQuiz}>
            <i className="fas fa-times"></i> Quit
          </button>
        </div>
      </div>
    </div>
  )
}
