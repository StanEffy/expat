const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../public/locales');
const targetDir = path.join(__dirname, '../dist/locales');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy all translation files
fs.cp(sourceDir, targetDir, { recursive: true }, (err) => {
  if (err) {
    console.error('Error copying translation files:', err);
    process.exit(1);
  }
  console.log('Translation files copied successfully');
}); 