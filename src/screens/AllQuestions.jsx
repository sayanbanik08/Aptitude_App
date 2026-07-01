import React, { useState, useRef, useEffect } from 'react'

export default function AllQuestions({ questionBank, categoryMeta, navigate, onDeleteQuestion }) {
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef(null)

  // Flat list of all questions
  const allQuestions = React.useMemo(() => {
    const list = []
    for (const [catKey, questions] of Object.entries(questionBank || {})) {
      const catName = categoryMeta[catKey]?.name || catKey
      questions.forEach((q, idx) => {
        list.push({
          ...q,
          categoryKey: catKey,
          categoryName: catName,
          indexInCategory: idx + 1
        })
      })
    }
    return list
  }, [questionBank, categoryMeta])

  // Filtered questions based on search
  const filteredQuestions = React.useMemo(() => {
    if (!searchTerm.trim()) return allQuestions
    const lowerSearch = searchTerm.toLowerCase()
    return allQuestions.filter(q => 
      q.question.toLowerCase().includes(lowerSearch) || 
      q.options.some(opt => opt.toLowerCase().includes(lowerSearch))
    )
  }, [searchTerm, allQuestions])

  // Trigger KaTeX rendering
  useEffect(() => {
    if (containerRef.current && window.renderMathInElement) {
      try {
        window.renderMathInElement(containerRef.current, {
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
  }, [filteredQuestions])

  const markers = ['A', 'B', 'C', 'D']

  return (
    <div id="all-questions-screen" className="screen active">
      <div className="container" style={{ maxWidth: '800px', position: 'relative', paddingTop: '60px' }}>
        {/* Minimalistic back button */}
        <button className="btn-back-minimal" onClick={() => navigate('home')} title="Back to Home">
          <i className="fas fa-arrow-left"></i>
        </button>

        <div style={{ marginBottom: '24px' }}>
          <h2 className="screen-title" style={{ marginBottom: '8px' }}>All Saved Questions</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Browse and search all {allQuestions.length} questions currently loaded in the database.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
          <input
            type="text"
            placeholder="Search questions or options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="smart-input"
            style={{ paddingLeft: '44px', width: '100%', height: '48px', fontSize: '15px' }}
          />
        </div>

        {/* Questions List */}
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
          {filteredQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <i className="fas fa-search" style={{ fontSize: '32px', color: 'var(--text-muted)', marginBottom: '12px' }}></i>
              <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>No matching questions found.</p>
            </div>
          ) : (
            filteredQuestions.map((q, idx) => (
              <div 
                key={q.id || idx} 
                className="review-item" 
                style={{ margin: 0, animationDelay: `${idx * 0.05}s`, position: 'relative' }}
              >
                {/* Permanent Delete Button */}
                <button
                  type="button"
                  className="btn-delete-q"
                  onClick={() => onDeleteQuestion(q.categoryKey, q.id)}
                  title="Permanently Delete Question"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>

                <div className="review-item-header" style={{ alignItems: 'flex-start', paddingRight: '40px' }}>
                  <div className="review-status-icon correct" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{idx + 1}</span>
                  </div>
                  <div>
                    <div className="review-question-num" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Question #{q.indexInCategory}</span>
                      <span className="smart-label-badge" style={{ background: 'rgba(14, 165, 233, 0.08)', color: 'var(--accent-1)', fontSize: '10px' }}>
                        {q.categoryName}
                      </span>
                    </div>
                    <div className="review-question-text" style={{ fontSize: '15px', fontWeight: '600', marginTop: '6px' }}>{q.question}</div>
                  </div>
                </div>

                <div className="review-options" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {q.options.map((opt, j) => (
                    <div 
                      key={j} 
                      className={`review-option ${j === q.correct ? 'correct-answer' : ''}`}
                      style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}
                    >
                      <span className="option-badge">{markers[j]}</span>
                      <span>{opt}</span>
                      {j === q.correct && (
                        <i className="fas fa-check" style={{ marginLeft: 'auto', color: '#22c55e' }}></i>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
