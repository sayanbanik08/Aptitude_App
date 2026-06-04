# AptitudeX - React Version

Your AptitudeX app has been successfully converted to React with Vite!

## ✨ What's New
- **Modern React 18** - Full component-based architecture
- **Vite** - Lightning-fast development server & optimized build
- **Better Code Organization** - Modular, maintainable structure
- **Same Functionality** - All features preserved:
  - 60+ questions across 6 categories
  - Timed quizzes with 60s per question
  - Result analytics & performance tracking
  - Answer review with detailed explanations
  - Dashboard with progress stats
  - localStorage persistence

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher) - [Download here](https://nodejs.org/)

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

After running `npm run dev`, open http://localhost:5173 in your browser.

## 📁 Project Structure

```
src/
├── App.jsx                 # Main app component with state
├── index.css              # All styling (premium dark theme)
├── main.jsx               # React entry point
├── components/            # Reusable UI components
│   ├── Navbar.jsx
│   ├── Modal.jsx
│   └── Toast.jsx
├── screens/               # Screen components
│   ├── Home.jsx
│   ├── Categories.jsx
│   ├── Config.jsx
│   ├── Quiz.jsx
│   ├── Results.jsx
│   ├── Review.jsx
│   └── Dashboard.jsx
├── data/                  # Static data
│   ├── questions.js       # 60 questions
│   └── categoryMeta.js    # Category metadata
└── utils/
    └── helpers.js         # Utility functions
```

## 📚 Quiz Categories
1. **Quantitative Aptitude** - Math, algebra, arithmetic
2. **Logical Reasoning** - Patterns, puzzles, deductions
3. **Verbal Ability** - Vocabulary, grammar, comprehension
4. **Data Interpretation** - Charts, tables, analysis
5. **General Knowledge** - Tech, science, facts
6. **Technical Knowledge** - Programming, databases, systems

## ✅ Features
- ✨ Clean, modern dark UI with glassmorphism
- ⏱️ Timed quizzes (optional)
- 📊 Performance analytics & streaks
- 💾 Persistent data with localStorage
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎯 Question review with explanations
- 🏆 Mock tests (20 random questions)
- 📈 Category-wise performance tracking

## 🛠️ Available Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview prod build

## 💡 Tips
- Questions are stored in `src/data/questions.js` - Easy to add more
- All styling is in `src/index.css` - CSS variables for theming
- State management is in `App.jsx` - Clean and straightforward
- No external UI libraries - Pure CSS for performance

## 📝 License
Open source - Feel free to modify and extend!

---
Built with ❤️ using React & Vite
