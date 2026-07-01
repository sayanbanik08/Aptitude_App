import React from 'react'

export default function Categories({ questionBank, categoryMeta, stats, selectCategory, onAddQuestionClick }) {
  return (
    <div id="categories-screen" className="screen active">
      <div className="container">
        <h2 className="screen-title">Customize Categories</h2>
        <div id="categories-grid" className="categories-grid">
          {Object.entries(categoryMeta).map(([key, meta], i) => {
            const questions = questionBank[key] || []

            return (
              <div
                key={key}
                className="category-card"
                style={{ '--cat-gradient': meta.gradient, animationDelay: `${i * 0.1}s` }}
              >
                <div className="category-card-header">
                  <div className="category-icon" style={{ background: meta.gradient }}>
                    <i className={`fas ${meta.icon}`}></i>
                  </div>
                  <div>
                    <h3>{meta.name}</h3>
                    <p>{meta.description}</p>
                  </div>
                </div>
                <div className="category-card-footer">
                  <span className="category-questions">
                    <i className="fas fa-question-circle"></i> {questions.length} questions
                  </span>
                  <button
                    className="btn-add-questions"
                    onClick={() => onAddQuestionClick(key)}
                  >
                    <i className="fas fa-plus"></i> Add Questions
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
