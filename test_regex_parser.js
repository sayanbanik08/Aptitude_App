import fs from 'fs';

const text = fs.readFileSync('pdf_text_decoded.txt', 'utf8');

// Normalize newlines and basic cleaning
const cleanText = text.replace(/\r\n/g, '\n');

// Regex to find Examples
// We want to match:
// Example 1 (or Example1, Examples 1, etc.)
// Followed by question, options, answer option, and explanation.
const exampleRegex = /(?:Example\s*|Examples\s*)(\d+)\b([\s\S]*?)(?=Example\s*\d+|Examples\s*\d+|PROBLEMS|List of Topics|Coding and Decoding|$)/gi;

let match;
let count = 0;
const examples = [];

while ((match = exampleRegex.exec(cleanText)) !== null) {
    count++;
    const num = match[1];
    const content = match[2];
    examples.push({ num, content: content.trim().substring(0, 200) });
    if (count <= 10) {
        console.log(`Match ${count}: Example ${num}`);
        console.log('Content preview:', content.trim().substring(0, 300));
        console.log('----------------------------------------------------');
    }
}

console.log(`Total examples found: ${count}`);
