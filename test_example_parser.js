import fs from 'fs';

const text = fs.readFileSync('pdf_text_decoded.txt', 'utf8');
const cleanText = text.replace(/\r\n/g, '\n');

function removePageHeaders(str) {
  return str
    .replace(/\d+\s+DURGASOFT,[\s\S]*?www\.durgasoft\.com/g, '')
    .replace(/DURGASOFT, # 202,[\s\S]*?www\.durgasoft\.com/g, '')
    .replace(/-- \d+ of \d+ --/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseExample(content) {
  // Find options pattern: A) or A ) or a) or a ) or A.
  const optionRegex = /(?:\b|[^\w])([A-D])\s*[\)\.\-\:]\s*([\s\S]+?)(?=\b[A-E]\s*[\)\.\-\:]|Answer|Explanation|$)/gi;
  const options = [];
  let match;
  while ((match = optionRegex.exec(content)) !== null) {
     const letter = match[1].toUpperCase();
     const value = removePageHeaders(match[2]);
     options.push({ letter, value });
  }

  let question = '';
  const firstOptionMatch = content.match(/(?:\b|[^\w])[A-D]\s*[\)\.\-\:]/i);
  if (firstOptionMatch) {
     question = removePageHeaders(content.substring(0, firstOptionMatch.index));
  } else {
     question = removePageHeaders(content);
  }

  const answerMatch = content.match(/Answer\s*option\s*([A-E])/i) || content.match(/Answer\s*Option\s*([A-E])/i) || content.match(/Answer:\s*Option\s*([A-E])/i) || content.match(/Answer\s*([A-E])/i);
  let correctIndex = -1;
  if (answerMatch) {
     const correctLetter = answerMatch[1].toUpperCase();
     correctIndex = ['A', 'B', 'C', 'D', 'E'].indexOf(correctLetter);
  }

  const explanationMatch = content.match(/Explanation\s*([\s\S]*)$/i);
  let explanation = '';
  if (explanationMatch) {
     explanation = removePageHeaders(explanationMatch[1]);
  }

  return {
     question,
     options: options.map(o => o.value),
     correct: correctIndex,
     explanation
  };
}

const exampleRegex = /(?:Example\s*|Examples\s*)(\d+)\b([\s\S]*?)(?=Example\s*\d+|Examples\s*\d+|PROBLEMS|List of Topics|Coding and Decoding|$)/gi;
let m;
let parsedCount = 0;

while ((m = exampleRegex.exec(cleanText)) !== null && parsedCount < 5) {
    parsedCount++;
    const parsedObj = parseExample(m[2]);
    console.log(`\n=== Parsed Example ${parsedCount} ===`);
    console.log('Q:', parsedObj.question);
    console.log('Options:', parsedObj.options);
    console.log('Correct Index:', parsedObj.correct);
    console.log('Explanation:', parsedObj.explanation);
}
