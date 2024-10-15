import fs from 'fs';
import path from 'path';

// Get the directory path from the command-line argument
const directoryPath = process.argv[2];

// Check if a directory path was provided
if (!directoryPath) {
  console.error('Please provide a directory path.');
  process.exit(1); // Exit the script with an error code
}

// Function to process a single LaTeX file
function processLatexFile(filePath) {
  const fileName = path.basename(filePath, '.tex');
  const uuidLine = `\\uuid{${fileName}}\n`;

  // Read the file contents
  let fileContents = fs.readFileSync(filePath, 'utf8');

  // Check if the UUID line already exists
  if (!fileContents.startsWith('\\uuid{')) {
    // Add the UUID line at the beginning of the file
    fileContents = uuidLine + fileContents;

    // Write the updated contents back to the file
    fs.writeFileSync(filePath, fileContents, 'utf8');
    console.log(`Added UUID to ${fileName}.tex`);
  } else {
    console.log(`UUID already exists in ${fileName}.tex`);
  }
}

// Process all .tex files in the specified directory
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.error('Unable to scan directory: ' + err);
  }

  // Filter for .tex files
  files.forEach((file) => {
    if (path.extname(file) === '.tex') {
      const filePath = path.join(directoryPath, file);
      processLatexFile(filePath);
    }
  });
});
