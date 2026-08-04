const fs = require('fs');
const html = fs.readFileSync('admin/editor.html', 'utf8');

// Extract the second script block
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
    console.log('Error:', e.message);
    
    // Find the exact position
    const posMatch = e.stack ? null : null;
    
    // Try to find the problematic character
    const lines = lastMatch.split('\n');
    
    // Check each line for potential issues
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for unescaped characters that might cause issues
      // Look for backtick inside template literal
      // Check for mismatched quotes
      
      // Simple check: count quotes
      let singleQuotes = 0;
      let doubleQuotes = 0;
      let backticks = 0;
      
      for (let j = 0; j < line.length; j++) {
        if (line[j] === "'" && line[j-1] !== '\\') singleQuotes++;
        if (line[j] === '"' && line[j-1] !== '\\') doubleQuotes++;
        if (line[j] === '`') backticks++;
      }
      
      // Check for odd number of quotes (potential issue)
      if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
        console.log(`Line ${i+1}: Odd quotes! single=${singleQuotes}, double=${doubleQuotes}`);
        console.log(`  Content: ${line.trim().substring(0, 80)}`);
      }
      
      // Check for template literal issues
      if (backticks % 2 !== 0) {
        console.log(`Line ${i+1}: Odd backticks! count=${backticks}`);
        console.log(`  Content: ${line.trim().substring(0, 80)}`);
      }
    }
    
    console.log('\nChecking template literals...');
    // Find all template literal starts and ends
    let inTemplate = false;
    let templateStart = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (let j = 0; j < line.length; j++) {
        if (line[j] === '`' && line[j-1] !== '\\') {
          if (!inTemplate) {
            inTemplate = true;
            templateStart = i + 1;
          } else {
            inTemplate = false;
          }
        }
      }
      
      // If we're in a template literal at end of line, report
      if (inTemplate && i === lines.length - 1) {
        console.log(`Unclosed template literal starting at line ${templateStart}`);
      }
    }
  }
}
