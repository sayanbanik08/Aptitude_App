import React from 'react'

export default function Navbar({ currentScreen, navigate, goBack, canGoBack }) {
  const backDisabled = !canGoBack || currentScreen === 'home'

  return (
    <nav className="navbar">
      <div className="nav-container">
        <a className="nav-logo" href="#" onClick={(e) => { e.preventDefault(); navigate('home') }}>
          <span className="logo-text">IQ</span>
        </a>
        
        <div className="nav-links">
          <a
            href="#"
            className={`nav-link ${backDisabled ? 'disabled' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              if (!backDisabled) {
                goBack()
              }
            }}
          >
            <i className="fas fa-arrow-left"></i> Back
          </a>
        </div>
      </div>
    </nav>
  )
}

