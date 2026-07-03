import React, { useState } from 'react'

export default function MustKnown({ navigate }) {
  const [activeTab, setActiveTab] = useState('squares')

  // Generate arrays for squares and cubes
  const squares = Array.from({ length: 50 }, (_, i) => i + 1)
  const cubes = Array.from({ length: 50 }, (_, i) => i + 1)

  return (
    <div id="must-known-screen" className="screen active">
      <div className="container">
        <button className="btn-back" onClick={() => navigate('home')} title="Back to Home">
          <i className="fas fa-arrow-left"></i>
        </button>

        <div className="must-known-header">
          <h2 className="screen-title"><i className="fas fa-brain"></i> Must Known Values</h2>
          <p className="screen-subtitle">Memorize these common values to speed up your calculation.</p>
        </div>

        <div className="mk-tabs">
          <button 
            className={`mk-tab ${activeTab === 'squares' ? 'active' : ''}`}
            onClick={() => setActiveTab('squares')}
          >
            Squares (1 to 50)
          </button>
          <button 
            className={`mk-tab ${activeTab === 'cubes' ? 'active' : ''}`}
            onClick={() => setActiveTab('cubes')}
          >
            Cubes (1 to 50)
          </button>
        </div>

        <div className="mk-content">
          {activeTab === 'squares' && (
            <div className="mk-grid">
              {squares.map(num => (
                <div key={num} className="mk-card">
                  <div className="mk-equation">
                    <span className="mk-base">{num}</span>
                    <span className="mk-power">2</span>
                    <span className="mk-equals">=</span>
                    <span className="mk-result">{num * num}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'cubes' && (
            <div className="mk-grid mk-grid-cubes">
              {cubes.map(num => (
                <div key={num} className="mk-card mk-card-cube">
                  <div className="mk-equation">
                    <span className="mk-base">{num}</span>
                    <span className="mk-power">3</span>
                    <span className="mk-equals">=</span>
                    <span className="mk-result">{num * num * num}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
