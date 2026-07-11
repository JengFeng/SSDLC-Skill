const fs = require('fs');

const f = 'D:/00AI協作/SSDLC_Skill/README.md';
let c = fs.readFileSync(f, 'utf8');

// Check if guide flow already exists
if (c.indexOf('使用者體驗流程') !== -1) {
  console.log('Already has guide flow section');
  process.exit(0);
}

// Find the Demo section and insert before it
const marker = '---\n\n## \ud83e\uddea Demo';
const idx = c.indexOf('Demo');
if (idx === -1) {
  // Try another pattern
  const idx2 = c.indexOf('Demo \u5c08\u6848');
  console.log('Demo index:', idx2);
  process.exit(1);
}

console.log('Found Demo at index:', idx);
