const fs = require('fs');
const vm = require('vm');

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
    new vm.Script(lastMatch);
    console.log('No syntax errors found!');
  } catch (e) {
    console.log('Error:', e.message);
    console.log('Stack:', e.stack);
    
    // Try to extract the position
    const posMatch = e.message.match(/position (\d+)/);
    if (posMatch) {
      const pos = parseInt(posMatch[1]);
      console.log(`Error at position ${pos}`);
      console.log(`Context: ${lastMatch.substring(Math.max(0, pos-50), pos+50)}`);
    }
    
    const lineMatch = e.message.match(/line (\d+)/i);
    if (lineMatch) {
      const line = parseInt(lineMatch[1]);
      const lines = lastMatch.split('\n');
      console.log(`\nError around line ${line}:`);
      for (let i = Math.max(0, line-3); i < Math.min(lines.length, line+3); i++) {
        console.log(`${i+1}: ${lines[i]}`);
      }
    }
  }
}
