import React from 'react'
import { getScoreEmoji, getScoreTitle, getScoreSubtitle, getScoreColor, formatTime, formatEmailSubject, formatEmailBody } from '../utils/helpers'

export default function Results({ result, categoryMeta, reviewAnswers, retryQuiz, navigate, quizQuestions, userAnswers }) {
  const meta = result.category === 'mock'
    ? { name: 'Mock Test', icon: 'fa-trophy' }
    : categoryMeta[result.category]

  const emailSubject = formatEmailSubject(result)
  const emailBody = encodeURIComponent(formatEmailBody(result, quizQuestions, userAnswers))
  const mailtoUrl = `mailto:sayanbanik459@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${emailBody}`

  return (
    <div id="results-screen" className="screen active">
      <div className="container">
        <div className="results-card">
          <div className="results-emoji" id="results-emoji">
            {getScoreEmoji(result.percentage)}
          </div>
          <h2 id="results-title" className="results-title">
            {getScoreTitle(result.percentage)}
          </h2>
          <p id="results-subtitle" className="results-subtitle">
            {getScoreSubtitle(result.percentage)}
          </p>

          <div className="score-circle">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" className="score-bg"></circle>
              <circle
                cx="60"
                cy="60"
                r="54"
                className="score-fill"
                id="score-fill"
                style={{
                  stroke: getScoreColor(result.percentage),
                  strokeDasharray: `${(result.percentage / 100) * 2 * Math.PI * 54} ${2 * Math.PI * 54}`
                }}
              ></circle>
              <text x="60" y="55" textAnchor="middle" className="score-text">
                <tspan id="score-value" fontSize="28" fontWeight="600">
                  {Math.round(result.totalMarks)}/{result.total}
                </tspan>
                <tspan x="60" dy="24" fontSize="18" fontWeight="400">
                  {result.percentage}%
                </tspan>
              </text>
            </svg>
          </div>

          <div className="results-stats">
            <div className="result-stat">
              <div className="stat-icon correct">
                <i className="fas fa-check"></i>
              </div>
              <div>
                <div className="stat-num" id="result-correct">{result.correct}</div>
                <div className="stat-label">Correct</div>
              </div>
            </div>
            <div className="result-stat">
              <div className="stat-icon incorrect">
                <i className="fas fa-times"></i>
              </div>
              <div>
                <div className="stat-num" id="result-incorrect">{result.incorrect}</div>
                <div className="stat-label">Incorrect</div>
              </div>
            </div>
            <div className="result-stat">
              <div className="stat-icon skipped">
                <i className="fas fa-minus"></i>
              </div>
              <div>
                <div className="stat-num" id="result-skipped">{result.skipped}</div>
                <div className="stat-label">Skipped</div>
              </div>
            </div>
            <div className="result-stat">
              <div className="stat-icon time">
                <i className="fas fa-clock"></i>
              </div>
              <div>
                <div className="stat-num" id="result-time">{formatTime(result.timeTaken)}</div>
                <div className="stat-label">Time Taken</div>
              </div>
            </div>
          </div>

          <div className="results-buttons">
            <button className="btn btn-secondary" onClick={() => navigate('home')}>
              <i className="fas fa-home"></i> Home
            </button>
            <a className="btn btn-secondary" href={mailtoUrl} target="_blank" rel="noreferrer">
              <i className="fas fa-envelope"></i> Email Results
            </a>
            <button className="btn btn-primary" onClick={retryQuiz}>
              <i className="fas fa-redo"></i> Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
