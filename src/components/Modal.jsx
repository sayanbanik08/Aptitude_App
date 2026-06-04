import React, { useState } from 'react'

export default function Modal({
  title,
  message,
  onConfirm,
  onCancel,
  options = [],
  hideCancel = false,
  preventOverlayClose = false,
  showCloseButton = false,
  isSettings = false
}) {
  const [selectedMode, setSelectedMode] = useState('positive')

  const handleOverlayClick = () => {
    if (!preventOverlayClose) {
      onCancel?.()
    }
  }

  const handleContinue = () => {
    const opts = options || []
    if (selectedMode === 'positive' && opts[0]) {
      opts[0].action()
      onCancel?.()
    } else if (selectedMode === 'negative' && opts[1]) {
      opts[1].action()
      onCancel?.()
    } else {
      onCancel?.()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal ${isSettings ? "settings-modal" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          {showCloseButton && (
            <button className="modal-close-btn" onClick={onCancel} aria-label="Close">
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        <p>{message}</p>
        <div className="modal-buttons">
          {options && options.length > 0 ? (
            <>
              {isSettings ? (
                <>
                  <button
                    className={`btn btn-settings ${selectedMode === 'positive' ? 'active' : ''}`}
                    onClick={() => setSelectedMode('positive')}
                  >
                    Positive Marking
                  </button>
                  <button
                    className={`btn btn-settings ${selectedMode === 'negative' ? 'active' : ''}`}
                    onClick={() => setSelectedMode('negative')}
                  >
                    Negative Marking
                  </button>
                </>
              ) : (
                options.map((option, index) => (
                  <button
                    key={index}
                    className="btn btn-primary"
                    onClick={() => {
                      option.action()
                      onCancel?.()
                    }}
                  >
                    {option.label}
                  </button>
                ))
              )}
              {!hideCancel && (
                <button className="btn btn-secondary" onClick={onCancel}>
                  Cancel
                </button>
              )}
            </>
          ) : (
            <>
              {!hideCancel && (
                <button className="btn btn-secondary" onClick={onCancel}>
                  Cancel
                </button>
              )}
              <button className="btn btn-primary" onClick={onConfirm}>
                Confirm
              </button>
            </>
          )}
        </div>
        {isSettings && (
          <>
            <br />
            <div className="modal-divider"></div>
            <br />
            <table className="settings-table">
              <thead>
                <tr>
                  <th>Subject / Section</th>
                  <th>Questions</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Numerical Ability (Aptitude)</td>
                  <td>20</td>
                  <td>21 mins</td>
                </tr>
                <tr>
                  <td>Verbal Ability (English)</td>
                  <td>25</td>
                  <td>22 mins</td>
                </tr>
                <tr>
                  <td>Reasoning Ability (Logical Reasoning)</td>
                  <td>20</td>
                  <td>21 mins</td>
                </tr>
                <tr>
                  <td>Advance Reasoning Ability</td>
                  <td>7</td>
                  <td>11 mins</td>
                </tr>
                <tr>
                  <td>Advance Numerical Ability</td>
                  <td>7</td>
                  <td>11 mins</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td><strong>Total</strong></td>
                  <td><strong>79</strong></td>
                  <td><strong>86 mins</strong></td>
                </tr>
              </tfoot>
            </table>
            <button className="btn btn-continue" onClick={handleContinue}>
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  )
}



