const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  console.error('\nMissing .env file.');
  console.error('Run: cp .env.example .env');
  console.error('Then add your ANTHROPIC_API_KEY to .env\n');
  process.exit(1);
}

const envContents = fs.readFileSync(envPath, 'utf8');

if (!envContents.includes('ANTHROPIC_API_KEY=') || /ANTHROPIC_API_KEY=\s*$/.test(envContents)) {
  console.warn('\nWarning: ANTHROPIC_API_KEY is missing or empty in .env.');
  console.warn('The app will start, but essay evaluation will fail until you add your key.\n');
}
