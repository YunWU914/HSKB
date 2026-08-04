const fs = require('fs');
const html = fs.readFileSync('admin/editor.html', 'utf8');

// Extract the second script block (the main code)
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let match;
let lastMatch = null;
let scriptIndex = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  scriptIndex++;
  console.log(`Script block ${scriptIndex}: starts at HTML index ${match.index}, length: ${match[1].length}`);
  lastMatch = match[1];
}

if (lastMatch) {
  console.log('Testing last script block...');
  try {
    new Function(lastMatch);
    console.log('No syntax errors found!');
  } catch (e) {
    console.log('Syntax Error:', e.message);
    
    // Find rough position of error
    const errorMatch = e.message.match(/(\d+):(\d+)/);
    if (errorMatch) {
      const line = parseInt(errorMatch[1]);
      const col = parseInt(errorMatch[2]);
      console.log(`Error around line ${line}, column ${col}`);
      const lines = lastMatch.split('\n');
      for (let i = Math.max(0, line - 3); i < Math.min(lines.length, line + 3); i++) {
        console.log(`${i+1}: ${lines[i]}`);
      }
    }
    
    // Manual trace brace positions
    console.log('\nTracing braces...');
    const lines = lastMatch.split('\n');
    let braceCount = 0;
    let inTemplate = false;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const prevCount = braceCount;
      
      for (let j = 0; j < line.length; j++) {
        const c = line[j];
        const prev = line[j-1];
        
        if (!inTemplate && !inString) {
          if (c === '"' || c === "'") {
            inString = true;
            stringChar = c;
          } else if (c === '`') {
            inTemplate = true;
          }
        } else if (inString) {
          if (c === stringChar && prev !== '\\') inString = false;
        } else if (inTemplate) {
          if (c === '`' && prev !== '\\') inTemplate = false;
        }
        
        if (!inString && !inTemplate) {
          if (c === '{') braceCount++;
          else if (c === '}') braceCount--;
        }
      }
      
      if (prevCount !== braceCount) {
        console.log(`Line ${i+1}: braces ${prevCount} -> ${braceCount} | ${line.trim().substring(0, 60)}`);
      }
    }
    
    console.log(`\nFinal brace count: ${braceCount}`);
  }
}
