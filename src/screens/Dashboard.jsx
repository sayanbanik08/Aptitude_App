import React from 'react'

export default function Dashboard({ stats, categoryMeta }) {
  return (
    <div id="dashboard-screen" className="screen active">
      <div className="container">
        <h2 className="screen-title">Your Dashboard</h2>

        {/* Overview Cards */}
        <div className="dashboard-overview">
          <div className="dashboard-card">
            <div className="card-icon">
              <i className="fas fa-book"></i>
            </div>
            <div>
              <div className="card-value" id="dash-total-quizzes">{stats.totalQuizzes}</div>
              <div className="card-label">Quizzes Completed</div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="card-icon">
              <i className="fas fa-bullseye"></i>
            </div>
            <div>
              <div className="card-value" id="dash-accuracy">{stats.avgAccuracy}%</div>
              <div className="card-label">Average Accuracy</div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="card-icon">
              <i className="fas fa-fire"></i>
            </div>
            <div>
              <div className="card-value" id="dash-streak">{stats.streak}</div>
              <div className="card-label">Day Streak</div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="card-icon">
              <i className="fas fa-question"></i>
            </div>
            <div>
              <div className="card-value" id="dash-total-questions">{stats.totalQuestions}</div>
              <div className="card-label">Questions Attempted</div>
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="dashboard-section">
          <h3><i className="fas fa-chart-bar"></i> Category Performance</h3>
          {stats.totalQuizzes === 0 ? (
            <div id="dash-empty-cats" className="empty-state">
              <p>No quiz data yet. Start practicing to see your performance!</p>
            </div>
          ) : (
            <div id="dash-category-bars" className="category-bars">
              {Object.entries(categoryMeta).map(([key, meta]) => {
                const catStats = stats.categories?.[key] || { attempted: 0, correct: 0 }
                const accuracy = catStats.attempted > 0 ? Math.round((catStats.correct / catStats.attempted) * 100) : 0

                return (
                  <div key={key} className="dash-cat-row">
                    <span className="dash-cat-name">
                      <i className={`fas ${meta.icon}`} style={{ color: meta.color }}></i> {meta.name}
                    </span>
                    <div className="dash-cat-bar">
                      <div className="dash-cat-fill" style={{ width: `${accuracy}%`, background: meta.gradient }}></div>
                    </div>
                    <span className="dash-cat-pct">{accuracy}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Quizzes */}
        <div className="dashboard-section">
          <h3><i className="fas fa-history"></i> Recent Quizzes</h3>
          {stats.recentQuizzes.length === 0 ? (
            <div id="dash-empty-recent" className="empty-state">
              <p>No quiz history yet. Complete a quiz to see it here!</p>
            </div>
          ) : (
            <div id="dash-recent-list" className="recent-list">
              {stats.recentQuizzes.slice(0, 10).map((quiz, i) => {
                const meta = quiz.category === 'mock'
                  ? { name: 'Mock Test', icon: 'fa-trophy', gradient: 'linear-gradient(135deg, #f59e0b, #ec4899)' }
                  : categoryMeta[quiz.category] || { name: quiz.category, icon: 'fa-question', gradient: 'var(--gradient-primary)' }

                let scoreClass = 'poor'
                if (quiz.percentage >= 70) scoreClass = 'good'
                else if (quiz.percentage >= 40) scoreClass = 'avg'

                const date = new Date(quiz.date)
                const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

                return (
                  <div key={i} className="dash-recent-item">
                    <div className="dash-recent-icon" style={{ background: meta.gradient }}>
                      <i className={`fas ${meta.icon}`}></i>
                    </div>
                    <div className="dash-recent-info">
                      <strong>{meta.name}</strong>
                      <span>{quiz.correct}/{quiz.total} correct · {dateStr}</span>
                    </div>
                    <span className={`dash-recent-score ${scoreClass}`}>{quiz.percentage}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
