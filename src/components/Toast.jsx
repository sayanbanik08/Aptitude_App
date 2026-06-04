import React from 'react'

export default function Toast({ message, type = 'info' }) {
  const iconMap = {
    info: 'fa-info-circle',
    error: 'fa-exclamation-circle',
    success: 'fa-check-circle'
  }

  return (
    <div className={`toast toast-${type}`}>
      <i className={`fas ${iconMap[type]}`}></i>
      <span>{message}</span>
    </div>
  )
}
