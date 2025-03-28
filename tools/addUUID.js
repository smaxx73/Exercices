const fs = require('fs');
const path = require('path');

// Get the directory path from the command-line argument
const directoryPath = process.argv[2];

// Check if a directory path was provided
if (!directoryPath) {
  console.error('Please provide a directory path.');
  process.exit(1);
}

// Function to process a single LaTeX file
function processLatexFile(filePath) {
  const fileName = path.basename(filePath, '.tex');
  const uuidLine = `\\uuid{${fileName}}\n`;

  // Read the file contents
  let fileContents = fs.readFileSync(filePath, 'utf8');

  // Match all \uuid{...} lines
  const uuidRegexGlobal = /\\uuid\{.*?\}\n?/g;
  const uuidMatches = [...fileContents.matchAll(uuidRegexGlobal)];

  if (uuidMatches.length === 0) {
    // No UUID found: insert the correct one at the top
    fileContents = uuidLine + fileContents;
    fs.writeFileSync(filePath, fileContents, 'utf8');
    console.log(`Added UUID to ${fileName}.tex`);
  } else {
    // Remove all existing UUID lines
    fileContents = fileContents.replace(uuidRegexGlobal, '');

    // Add the correct UUID line at the top
    fileContents = uuidLine + fileContents;

    // Save updated content
    fs.writeFileSync(filePath, fileContents, 'utf8');

    if (uuidMatches.length === 1 && uuidMatches[0][0].includes(fileName)) {
      console.log(`UUID already correct in ${fileName}.tex`);
    } else {
      console.log(`Corrected and cleaned UUID(s) in ${fileName}.tex`);
    }
  }
}

// Process all .tex files in the specified directory
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.error('Unable to scan directory: ' + err);
  }

  files.forEach((file) => {
    if (path.extname(file) === '.tex') {
      const filePath = path.join(directoryPath, file);
      processLatexFile(filePath);
    }
  });
});
