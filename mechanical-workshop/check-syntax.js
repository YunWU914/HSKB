const fs = require('fs');
const html = fs.readFileSync('admin/editor.html', 'utf8');

// Extract the second script block (the main code)
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let match;
let lastMatch = null;
while ((match = scriptRegex.exec(html)) !== null) {
  lastMatch = match[1];
}

if (lastMatch) {
  try {
    new Function(lastMatch);
    console.log('No syntax errors found!');
  } catch (e) {
    console.log('Syntax Error:', e.message);
    
    // Try to find the problematic area
    const lines = lastMatch.split('\n');
    let braceCount = 0;
    let parenCount = 0;
    let bracketCount = 0;
    let inString = false;
    let stringChar = '';
    let inTemplate = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.length; j++) {
        const c = line[j];
        const next = line[j+1];
        
        // Simple state tracking (not perfect but helpful)
        if (!inTemplate && !inString) {
          if (c === '"' || c === "'") {
            inString = true;
            stringChar = c;
          } else if (c === '`') {
            inTemplate = true;
          }
        } else if (inString) {
          if (c === stringChar && line[j-1] !== '\\') inString = false;
        } else if (inTemplate) {
          if (c === '`' && line[j-1] !== '\\') inTemplate = false;
        }
        
        if (!inString && !inTemplate) {
          if (c === '{') braceCount++;
          else if (c === '}') braceCount--;
          else if (c === '(') parenCount++;
          else if (c === ')') parenCount--;
          else if (c === '[') bracketCount++;
          else if (c === ']') bracketCount--;
        }
      }
      
      if (i % 50 === 0 || i === lines.length - 1) {
        console.log(`Line ${i+1}: braces=${braceCount}, parens=${parenCount}, brackets=${bracketCount}`);
      }
    }
    
    console.log(`Final: braces=${braceCount}, parens=${parenCount}, brackets=${bracketCount}`);
  }
}
