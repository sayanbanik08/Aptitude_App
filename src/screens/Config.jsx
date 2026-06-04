import React from 'react'

export default function Config({
  selectedCategory,
  categoryMeta,
  difficulty,
  setDifficulty,
  questionCount,
  setQuestionCount,
  timerEnabled,
  setTimerEnabled,
  startQuiz,
  navigate
}) {
  const meta = categoryMeta[selectedCategory]

  return (
    <div id="config-screen" className="screen active">
      <div className="container">
        <button className="btn-back" onClick={() => navigate('categories')}>
          <i className="fas fa-arrow-left"></i>
        </button>

        <div className="config-content">
          <div className="config-preview">
            <div className="config-preview-icon" style={{ background: meta?.gradient }}>
              <i className={`fas ${meta?.icon}`}></i>
            </div>
          </div>

          <h2 id="config-category-title">{meta?.name}</h2>
          <p id="config-cat-desc">{meta?.description}</p>

          {/* Difficulty Selection */}
          <div className="config-section">
            <h3><i className="fas fa-layer-group"></i> Select Difficulty</h3>
            <div id="difficulty-options" className="config-options">
              {['easy', 'medium', 'hard', 'all'].map(level => (
                <button
                  key={level}
                  className={`config-option ${difficulty === level ? 'active' : ''}`}
                  data-value={level}
                  onClick={() => setDifficulty(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="config-section">
            <h3><i className="fas fa-hashtag"></i> Number of Questions</h3>
            <div id="count-options" className="config-options">
              {[5, 10, 15, 'all'].map(count => (
                <button
                  key={count}
                  className={`config-option ${questionCount === count ? 'active' : ''}`}
                  data-value={String(count)}
                  onClick={() => setQuestionCount(count)}
                >
                  {count === 'all' ? 'All' : count}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Toggle */}
          <div className="config-section">
            <h3><i className="fas fa-hourglass"></i> Timer</h3>
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="timer-toggle"
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">
                {timerEnabled ? 'Enabled (60s/question)' : 'Disabled'}
              </span>
            </label>
          </div>

          {/* Start Button */}
          <button className="btn btn-lg btn-primary" onClick={startQuiz}>
            <i className="fas fa-play"></i> Start Quiz
          </button>
        </div>
      </div>
    </div>
  )
}
