import React from 'react'

export default function Home({ navigate, stats, startMockTest, onShuffle }) {
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

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-brand">
              <span className="footer-logo">IQ</span>
              <p className="footer-desc">
                A premium preparation platform for quantitative, logical reasoning, and verbal ability exams. Practice, track your metrics, and ace your tests.
              </p>
              <div className="footer-db-icon" onClick={() => navigate('categories')}>
                <i className="fas fa-database"></i>
                <span>Questions</span>
              </div>
              <div className="footer-shuffler-btn" onClick={onShuffle}>
                <i className="fas fa-shuffle"></i>
                <span>Shuffler</span>
              </div>
              <div className="footer-all-qs-btn" onClick={() => navigate('all-questions')}>
                <i className="fas fa-list-ul"></i>
                <span>See all qs</span>
              </div>
            </div>
            
            <div className="footer-links-group">
              <div className="footer-column">
                <h4>Practice</h4>
                <ul>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); startMockTest() }}>
                      Take Mock Test
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} IQ. All rights reserved.</p>
            <div className="footer-meta-links">
              <span>Built for Excellence</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

