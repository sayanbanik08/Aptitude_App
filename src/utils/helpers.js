// Utility functions for AptitudeX

export const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getScoreColor = (percentage) => {
  if (percentage >= 80) return '#22c55e';
  if (percentage >= 60) return '#6366f1';
  if (percentage >= 40) return '#f59e0b';
  return '#ef4444';
};

export const getScoreEmoji = (percentage) => {
  if (percentage >= 80) return '🎉';
  if (percentage >= 60) return '👏';
  if (percentage >= 40) return '💪';
  return '📚';
};

export const getScoreTitle = (percentage) => {
  if (percentage >= 80) return 'Outstanding!';
  if (percentage >= 60) return 'Great Job!';
  if (percentage >= 40) return 'Good Effort!';
  return 'Keep Learning!';
};

export const getScoreSubtitle = (percentage) => {
  if (percentage >= 80) return 'You absolutely crushed it!';
  if (percentage >= 60) return "You're doing really well!";
  if (percentage >= 40) return 'Keep practicing to improve!';
  return 'Practice makes perfect!';
};

export const formatTime = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

export const formatTimerDisplay = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const getStorageData = () => {
  const stored = localStorage.getItem('aptitudex_data');
  if (stored) return JSON.parse(stored);
  return {
    quizHistory: [],
    categoryStats: {},
    streak: 0,
    lastPlayDate: null
  };
};

export const saveStorageData = (data) => {
  localStorage.setItem('aptitudex_data', JSON.stringify(data));
};

export const calculateStats = (quizHistory, categoryStats) => {
  const totalQuizzes = quizHistory.length;
  
  if (totalQuizzes === 0) {
    return {
      totalQuizzes: 0,
      avgAccuracy: 0,
      streak: 0,
      totalQuestions: 0,
      categories: {},
      recentQuizzes: []
    };
  }

  const totalCorrect = quizHistory.reduce((sum, q) => sum + q.correct, 0);
  const totalQuestions = quizHistory.reduce((sum, q) => sum + q.total, 0);
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return {
    totalQuizzes,
    avgAccuracy,
    streak: 0,
    totalQuestions,
    categories: categoryStats,
    recentQuizzes: quizHistory.slice(0, 10)
  };
};

export const saveQuizResult = (result) => {
  const data = getStorageData();
  
  data.quizHistory.unshift(result);
  if (data.quizHistory.length > 50) data.quizHistory.pop();

  if (!data.categoryStats[result.category]) {
    data.categoryStats[result.category] = { attempted: 0, correct: 0 };
  }
  data.categoryStats[result.category].attempted += result.total;
  data.categoryStats[result.category].correct += result.correct;

  const today = new Date().toDateString();
  if (data.lastPlayDate !== today) {
    data.streak = (data.streak || 0) + 1;
    data.lastPlayDate = today;
  }

  saveStorageData(data);
  return data;
};

export const formatEmailSubject = (result) => {
  return `AptitudeX Quiz Result - ${result.category === 'mock' ? 'Mock Test' : result.category} - ${result.percentage}%`;
};

export const formatEmailBody = (result, quizQuestions, userAnswers) => {
  const lines = [];
  lines.push('AptitudeX Quiz Results');
  lines.push('====================');
  lines.push(`Category: ${result.category === 'mock' ? 'Mock Test' : result.category}`);
  lines.push(`Date: ${new Date(result.date).toLocaleString()}`);
  lines.push(`Score: ${result.correct} / ${result.total}`);
  lines.push(`Marks: ${result.totalMarks}`);
  lines.push(`Percentage: ${result.percentage}%`);
  lines.push(`Time Taken: ${formatTime(result.timeTaken)}`);
  lines.push(`Marking Mode: ${result.markingMode}`);
  lines.push('');
  lines.push('Question details:');
  lines.push('');

  quizQuestions.forEach((question, index) => {
    const selectedIndex = userAnswers[index];
    const selectedText = selectedIndex === -1 ? 'No answer' : question.options[selectedIndex];
    const correctText = question.options[question.correct];

    lines.push(`Q${index + 1}: ${question.question}`);
    lines.push(`  Your answer: ${selectedText}`);
    lines.push(`  Correct answer: ${correctText}`);
    if (question.explanation) {
      lines.push(`  Explanation: ${question.explanation}`);
    }
    lines.push('');
  });

  lines.push('');
  lines.push('Please use this email to share the quiz details.');
  return lines.join('\n');
};
