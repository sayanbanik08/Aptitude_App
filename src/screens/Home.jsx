import React from 'react'

export default function Home({ navigate, stats, startMockTest }) {
  return (
    <div id="home-screen" className="screen active">
      {/* Hero */}
      <div className="hero">
        <div className="hero-container hero-card">
          <div className="hero-sticker hero-sticker-top">
            Keep going — every question makes you smarter.
          </div>
          <h1 className="hero-title">Master Your Aptitude</h1>
          <p className="hero-subtitle">
            Comprehensive practice platform with quantitative, logical, verbal & more
          </p>
          <div className="hero-action-card">
            <button className="btn btn-lg btn-secondary" onClick={startMockTest}>
              <i className="fas fa-trophy"></i> Take Mock Test
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
