import React, { useState, useMemo, useRef, useEffect } from 'react'

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'of', 'in', 'to', 'for',
  'with', 'on', 'at', 'by', 'from', 'as', 'into', 'about', 'between',
  'through', 'after', 'before', 'above', 'below', 'and', 'but', 'or',
  'nor', 'not', 'so', 'yet', 'both', 'either', 'neither', 'each',
  'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'because',
  'if', 'when', 'where', 'how', 'what', 'which', 'who', 'whom', 'this',
  'that', 'these', 'those', 'it', 'its', 'then', 'there', 'here',
  'he', 'she', 'they', 'we', 'you', 'i', 'me', 'him', 'her', 'us',
  'them', 'my', 'your', 'his', 'our', 'their', 'following'
])

// LaTeX command names that leak through after stripping — treat as noise
const LATEX_NOISE = new Set([
  'frac', 'sqrt', 'sum', 'int', 'infty', 'pm', 'approx', 'circ',
  'theta', 'alpha', 'beta', 'gamma', 'delta', 'pi', 'sigma', 'lambda',
  'cdot', 'times', 'div', 'left', 'right', 'text', 'mathrm', 'mathbf',
  'log', 'ln', 'sin', 'cos', 'tan', 'lim', 'sup', 'sub', 'ne', 'le', 'ge'
])

function stripLatex(text) {
  if (!text) return text
  let clean = text
  // Remove display and inline math delimiters
  clean = clean.replace(/\$\$/g, ' ').replace(/\$/g, ' ')
  // Remove LaTeX commands like \frac, \sqrt, \sum, etc.
  clean = clean.replace(/\\[a-zA-Z]+/g, ' ')
  // Remove braces, carets, underscores (LaTeX structural chars)
  clean = clean.replace(/[{}^_\\]/g, ' ')
  return clean
}

function extractKeywords(text) {
  if (!text) return []
  const stripped = stripLatex(text)
  return stripped
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w) && !LATEX_NOISE.has(w))
}

function computeSimilarity(inputKeywords, questionKeywords) {
  if (inputKeywords.length === 0 || questionKeywords.length === 0) return 0
  const qSet = new Set(questionKeywords)
  let matches = 0
  for (const kw of inputKeywords) {
    for (const qk of qSet) {
      if (qk.includes(kw) || kw.includes(qk)) {
        matches++
        break
      }
    }
  }
  const precision = matches / inputKeywords.length
  const recall = matches / questionKeywords.length
  if (precision + recall === 0) return 0
  return (2 * precision * recall) / (precision + recall)
}

const MATH_TEMPLATES = [
  { label: 'Fraction ──', code: '$\\frac{numerator}{denominator}$', icon: 'fa-divide' },
  { label: 'Square Root √', code: '$\\sqrt{x}$', icon: 'fa-square-root-alt' },
  { label: 'N-th Root ⁿ√', code: '$\\sqrt[n]{x}$', icon: 'fa-square' },
  { label: 'Exponent x²', code: '$x^{y}$', icon: 'fa-superscript' },
  { label: 'Subscript xᵢ', code: '$x_{i}$', icon: 'fa-subscript' },
  { label: 'Summation ∑', code: '$\\sum_{i=1}^{n}$', icon: 'fa-sigma' },
  { label: 'Integral ∫', code: '$\\int_{a}^{b}$', icon: 'fa-calculator' },
  { label: 'Degree °', code: '$^\\circ$', icon: 'fa-circle' },
  { label: 'Infinity ∞', code: '$\\infty$', icon: 'fa-infinity' },
  { label: 'Plus-Minus ±', code: '$\\pm$', icon: 'fa-plus-minus' },
  { label: 'Not Equal ≠', code: '$\\ne$', icon: 'fa-equals' },
  { label: 'Approx ≈', code: '$\\approx$', icon: 'fa-wave-square' },
  { label: 'Pi π', code: '$\\pi$', icon: 'fa-percentage' },
  { label: 'Theta θ', code: '$\\theta$', icon: 'fa-circle-notch' },
  { label: 'Delta Δ', code: '$\\Delta$', icon: 'fa-triangle' }
]

export default function AddQuestion({ categoryKey, categoryMeta, existingQuestions, onSave, onCancel }) {
  const meta = categoryMeta[categoryKey] || {}
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctOption, setCorrectOption] = useState(0)
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [showMathKeyboard, setShowMathKeyboard] = useState(false)
  const [glowRotation, setGlowRotation] = useState(0)

  // Image upload state
  const [questionImage, setQuestionImage] = useState(null)   // base64 string
  const [optionImages, setOptionImages] = useState([null, null, null, null]) // base64 per option
  const [uploadingQuestion, setUploadingQuestion] = useState(false)
  const [uploadingOption, setUploadingOption] = useState([false, false, false, false])

  const textareaRef = useRef(null)
  const previewRef = useRef(null)
  const questionImgRef = useRef(null)
  const optionImgRefs = useRef([null, null, null, null])

  // Compute X and Y offsets for the orbiting accretion disk
  const angleRad = (glowRotation * Math.PI) / 180
  const glowX = (6 * Math.cos(angleRad)).toFixed(2)
  const glowY = (6 * Math.sin(angleRad)).toFixed(2)

  // Trigger KaTeX render on preview content change
  useEffect(() => {
    if (previewRef.current && window.renderMathInElement) {
      try {
        window.renderMathInElement(previewRef.current, {
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
  }, [questionText])

  // Build a flat indexed list of all questions across all categories
  const indexedQuestions = useMemo(() => {
    const list = []
    for (const catKey of Object.keys(existingQuestions || {})) {
      const catName = categoryMeta[catKey]?.name || catKey
      const questionsInCat = existingQuestions[catKey] || []
      questionsInCat.forEach((q, idx) => {
        list.push({
          ...q,
          categoryKey: catKey,
          categoryName: catName,
          questionNumber: idx + 1,
          keywords: extractKeywords(q.question)
        })
      })
    }
    // Sort by question text for consistent ordering
    list.sort((a, b) => a.question.localeCompare(b.question))
    return list
  }, [existingQuestions, categoryMeta])

  // Compute matches using keyword similarity
  const suggestions = useMemo(() => {
    const inputKeywords = extractKeywords(questionText)
    if (inputKeywords.length < 1) return []

    const scored = []
    for (const entry of indexedQuestions) {
      const score = computeSimilarity(inputKeywords, entry.keywords)
      if (score >= 0.25) {
        scored.push({ ...entry, score })
      }
    }

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, 5)
  }, [questionText, indexedQuestions])

  const isDuplicate = suggestions.length > 0 && suggestions[0].score >= 0.7
  const duplicateMatch = isDuplicate ? suggestions[0] : null

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options]
    updatedOptions[index] = value
    setOptions(updatedOptions)
  }

  // Convert file to base64
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error('Image must be smaller than 2MB'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  // Handle question image upload
  const handleQuestionImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingQuestion(true)
    try {
      const base64 = await fileToBase64(file)
      setQuestionImage(base64)
    } catch (err) {
      setError(err.message || 'Failed to load image')
    } finally {
      setUploadingQuestion(false)
      e.target.value = ''
    }
  }

  // Handle option image upload
  const handleOptionImageUpload = async (e, idx) => {
    const file = e.target.files[0]
    if (!file) return
    const updatingArr = [false, false, false, false]
    updatingArr[idx] = true
    setUploadingOption(updatingArr)
    try {
      const base64 = await fileToBase64(file)
      const updated = [...optionImages]
      updated[idx] = base64
      setOptionImages(updated)
    } catch (err) {
      setError(err.message || 'Failed to load image')
    } finally {
      setUploadingOption([false, false, false, false])
      e.target.value = ''
    }
  }

  const insertAtCursor = (textToInsert) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)

    const newText = before + textToInsert + after
    setQuestionText(newText)
    setGlowRotation(prev => (prev + 20) % 360)

    // Keep cursor positioned after inserted token
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length
    }, 50)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!questionText.trim() && !questionImage) {
      setError('Question text or image cannot be empty')
      return
    }

    if (options.some((opt, i) => !opt.trim() && !optionImages[i])) {
      setError('All 4 options must be filled (text or image)')
      return
    }

    setError('')

    const newQuestion = {
      id: `custom-${Date.now()}`,
      question: questionText.trim(),
      options: options.map(opt => opt.trim()),
      correct: correctOption,
      category: categoryKey,
      // Include images only if they exist
      ...(questionImage ? { questionImage } : {}),
      optionImages: optionImages
    }

    onSave(categoryKey, newQuestion)
  }

  const highlightMatch = (text, keywords) => {
    if (!keywords || keywords.length === 0) return text
    const pattern = keywords.filter(k => k.length > 2).join('|')
    if (!pattern) return text
    const regex = new RegExp(`(${pattern})`, 'gi')
    return text.replace(regex, '<mark>$1</mark>')
  }

  const inputKeywords = extractKeywords(questionText)

  return (
    <div id="add-question-screen" className="screen active">
      <div className="container" style={{ maxWidth: '600px', position: 'relative', paddingTop: '60px' }}>
        <button className="btn-back-minimal" onClick={onCancel} title="Back to Categories">
          <i className="fas fa-arrow-left"></i>
        </button>

        <div className="config-content" style={{ maxWidth: '100%', marginTop: '10px' }}>
          <div className="config-preview" style={{ marginBottom: '20px' }}>
            <div className="config-preview-icon" style={{ background: meta.gradient || 'var(--gradient-primary)', width: '60px', height: '60px', fontSize: '24px' }}>
              <i className={`fas ${meta.icon || 'fa-plus'}`}></i>
            </div>
            <h2 style={{ marginTop: '12px' }}>Add Custom Question</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>to {meta.name}</p>
          </div>

          {error && (
            <div className="smart-error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {isDuplicate && duplicateMatch && (
            <div className="duplicate-alert-banner">
              <div className="duplicate-alert-header">
                <i className="fas fa-exclamation-triangle duplicate-pulse-icon"></i>
                <span>DUPLICATE DETECTED</span>
              </div>
              <div className="duplicate-alert-body">
                <p className="duplicate-alert-msg">
                  This question matches a previously saved question in our database.
                </p>
                <div className="duplicate-details">
                  <div className="duplicate-detail-row">
                    <strong>Question Number:</strong> Question #{duplicateMatch.questionNumber} in "{duplicateMatch.categoryName}"
                  </div>
                  <div className="duplicate-detail-row">
                    <strong>Saved Question:</strong> "{duplicateMatch.question}"
                  </div>
                  <div className="duplicate-detail-row">
                    <strong>Match Confidence:</strong> {Math.round(duplicateMatch.score * 100)}% keyword match
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="smart-label" style={{ margin: 0 }}>
                  <span>Question Text</span>
                  {questionText.trim().length > 0 && (
                    <span className="smart-label-badge" style={{ marginLeft: '8px' }}>
                      {indexedQuestions.length} indexed
                    </span>
                  )}
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Camera Upload for Question */}
                  <input
                    ref={questionImgRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={handleQuestionImageUpload}
                  />
                  <button
                    type="button"
                    className="btn-camera-upload"
                    onClick={() => questionImgRef.current?.click()}
                    title="Upload question image"
                    disabled={uploadingQuestion}
                  >
                    {uploadingQuestion
                      ? <i className="fas fa-spinner fa-spin"></i>
                      : <i className="fas fa-camera"></i>
                    }
                  </button>
                  {/* Math Keyboard Toggle Button */}
                  <button
                    type="button"
                    className="btn-math-toggle"
                    onClick={() => setShowMathKeyboard(!showMathKeyboard)}
                  >
                    <i className="fas fa-calculator"></i> Math Keyboard
                  </button>
                </div>
              </div>

              {/* Question image preview */}
              {questionImage && (
                <div className="img-upload-preview">
                  <img src={questionImage} alt="Question" className="img-upload-thumb" />
                  <button
                    type="button"
                    className="img-remove-btn"
                    onClick={() => setQuestionImage(null)}
                    title="Remove image"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}

              {/* Math Keyboard Popup Panel */}
              {showMathKeyboard && (
                <div className="math-keyboard-panel">
                  <div className="math-keyboard-header">
                    <span><i className="fas fa-calculator"></i> Mathematical Formula Templates</span>
                    <button type="button" onClick={() => setShowMathKeyboard(false)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="math-keyboard-grid">
                    {MATH_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="math-key-btn"
                        onClick={() => insertAtCursor(tmpl.code)}
                      >
                        <span className="math-key-label">{tmpl.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="math-keyboard-tip">
                    Tip: Wrap equations inside <code>$ ... $</code> for inline math (e.g. $2+3=5$) or double <code>$$ ... $$</code> for display block formulas.
                  </div>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={questionText}
                onChange={(e) => {
                  setQuestionText(e.target.value);
                  setShowSuggestions(true);
                  setGlowRotation(prev => (prev + 20) % 360);
                }}
                placeholder="Start typing your question. Use the Math Keyboard above to insert equations, fractions, and symbols..."
                rows="4"
                className={`smart-textarea ${isDuplicate ? 'smart-textarea-warn' : suggestions.length > 0 ? 'smart-textarea-info' : ''}`}
                style={{
                  '--glow-x': `${glowX}px`,
                  '--glow-y': `${glowY}px`,
                  '--glow-x-neg': `${-glowX}px`,
                  '--glow-y-neg': `${-glowY}px`
                }}
              />

              {/* Live KaTeX Preview Container */}
              {questionText.trim().length > 0 && (
                <div className="math-live-preview-box">
                  <div className="math-live-preview-header">
                    <i className="fas fa-eye"></i> Live Question Render Preview
                  </div>
                  <div ref={previewRef} className="math-live-preview-body">
                    {questionText}
                  </div>
                </div>
              )}

              {/* Live keyword pills */}
              {inputKeywords.length > 0 && (
                <div className="smart-keywords">
                  {inputKeywords.slice(0, 8).map((kw, i) => (
                    <span key={i} className="smart-keyword-pill">{kw}</span>
                  ))}
                  {inputKeywords.length > 8 && (
                    <span className="smart-keyword-pill smart-keyword-more">+{inputKeywords.length - 8} more</span>
                  )}
                </div>
              )}

              {/* Suggestions panel */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="smart-suggestions">
                  <div className="smart-suggestions-header">
                    {isDuplicate ? (
                      <><i className="fas fa-exclamation-triangle" style={{ color: 'var(--accent-orange)' }}></i> Possible duplicate detected</>
                    ) : (
                      <><i className="fas fa-search" style={{ color: 'var(--accent-1)' }}></i> Similar questions found</>
                    )}
                    <button type="button" className="smart-suggestions-close" onClick={() => setShowSuggestions(false)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  {suggestions.map((s, i) => (
                    <div key={i} className={`smart-suggestion-item ${s.score >= 0.7 ? 'smart-suggestion-danger' : s.score >= 0.4 ? 'smart-suggestion-warn' : ''}`}>
                      <div className="smart-suggestion-score">
                        <span className="smart-score-value">{Math.round(s.score * 100)}%</span>
                        <span className="smart-score-label">match</span>
                      </div>
                      <div className="smart-suggestion-body">
                        <p className="smart-suggestion-text" dangerouslySetInnerHTML={{ __html: highlightMatch(s.question, inputKeywords) }} />
                        <span className="smart-suggestion-cat">
                          <i className="fas fa-folder"></i> {s.categoryName}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="smart-label">Options</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {options.map((option, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', width: '20px', color: 'var(--text-muted)', flexShrink: 0 }}>{String.fromCharCode(65 + idx)}</span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className="smart-input"
                        style={{ flex: 1 }}
                      />
                      {/* Hidden file input per option */}
                      <input
                        ref={el => optionImgRefs.current[idx] = el}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: 'none' }}
                        onChange={(e) => handleOptionImageUpload(e, idx)}
                      />
                      <button
                        type="button"
                        className="btn-camera-upload"
                        onClick={() => optionImgRefs.current[idx]?.click()}
                        title={`Upload image for Option ${String.fromCharCode(65 + idx)}`}
                        disabled={uploadingOption[idx]}
                      >
                        {uploadingOption[idx]
                          ? <i className="fas fa-spinner fa-spin"></i>
                          : <i className="fas fa-camera"></i>
                        }
                      </button>
                    </div>
                    {/* Option image preview */}
                    {optionImages[idx] && (
                      <div className="img-upload-preview" style={{ marginLeft: '30px' }}>
                        <img src={optionImages[idx]} alt={`Option ${String.fromCharCode(65 + idx)}`} className="img-upload-thumb" />
                        <button
                          type="button"
                          className="img-remove-btn"
                          onClick={() => {
                            const updated = [...optionImages]
                            updated[idx] = null
                            setOptionImages(updated)
                          }}
                          title="Remove image"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="smart-label">Correct Option</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {options.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCorrectOption(idx)}
                    className={`config-option ${correctOption === idx ? 'active' : ''}`}
                    style={{ textAlign: 'center', fontWeight: '600' }}
                  >
                    Option {String.fromCharCode(65 + idx)}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: isDuplicate ? 'var(--accent-orange)' : 'var(--accent-1)', color: '#ffffff', borderColor: isDuplicate ? 'var(--accent-orange)' : 'var(--accent-1)', fontSize: '15px', fontWeight: '700', marginTop: '10px' }}
            >
              <i className={`fas ${isDuplicate ? 'fa-exclamation-triangle' : 'fa-save'}`} style={{ marginRight: '6px' }}></i>
              {isDuplicate ? 'Save Anyway (Possible Duplicate)' : 'Save Question'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
