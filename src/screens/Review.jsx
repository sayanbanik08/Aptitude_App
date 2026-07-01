import React, { useRef, useEffect } from 'react'

export default function Review({ quizQuestions, userAnswers, navigate }) {
  const markers = ['A', 'B', 'C', 'D']
  const reviewListRef = useRef(null)

  useEffect(() => {
    if (reviewListRef.current && window.renderMathInElement) {
      try {
        window.renderMathInElement(reviewListRef.current, {
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
  }, [quizQuestions])

  return (
    <div id="review-screen" className="screen active">
      <div className="container">
        <button className="btn-back" onClick={() => navigate('results')}>
          <i className="fas fa-arrow-left"></i>
        </button>

        <h2 className="screen-title">Review Answers</h2>

        <div id="review-list" className="review-list" ref={reviewListRef}>
          {quizQuestions.map((q, i) => {
            const userAns = userAnswers[i]
            const isCorrect = userAns === q.correct
            const isSkipped = userAns === -1

            let statusClass, statusIcon
            if (isSkipped) {
              statusClass = 'skipped'
              statusIcon = 'fa-minus'
            } else if (isCorrect) {
              statusClass = 'correct'
              statusIcon = 'fa-check'
            } else {
              statusClass = 'incorrect'
              statusIcon = 'fa-times'
            }

            return (
              <div key={i} className="review-item" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="review-item-header">
                  <div className={`review-status-icon ${statusClass}`}>
                    <i className={`fas ${statusIcon}`}></i>
                  </div>
                  <div>
                    <div className="review-question-num">Question {i + 1}</div>
                    <div className="review-question-text">{q.question}</div>
                  </div>
                </div>

                <div className="review-options">
                  {q.options.map((opt, j) => {
                    let cls = ''
                    if (j === q.correct) cls = 'correct-answer'
                    else if (j === userAns && !isCorrect) cls = 'user-wrong'

                    return (
                      <div key={j} className={`review-option ${cls}`}>
                        <span className="option-badge">{markers[j]}</span>
                        <span>{opt}</span>
                        {j === q.correct && (
                          <i className="fas fa-check" style={{ marginLeft: 'auto', color: '#22c55e' }}></i>
                        )}
                        {j === userAns && !isCorrect && (
                          <i className="fas fa-times" style={{ marginLeft: 'auto', color: '#ef4444' }}></i>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="review-explanation">
                  <strong><i className="fas fa-lightbulb"></i> Explanation:</strong> {q.explanation}
                </div>
              </div>
            )
          })}
        </div>

        <button className="btn btn-lg btn-primary" onClick={() => navigate('results')}>
          Back to Results
        </button>
      </div>
    </div>
  )
}
