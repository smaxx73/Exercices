const fs = require('fs');
const path = require('path');

// Read all .tex files from source directory
const sourceDir = path.join('..', 'src');
const outputFile = path.join('..', 'info', 'themes.txt');

// Create info directory if it doesn't exist
const infoDir = path.dirname(outputFile);
if (!fs.existsSync(infoDir)) {
    fs.mkdirSync(infoDir, { recursive: true });
}

// Read all .tex files and extract themes
let allThemes = new Set();

try {
    const files = fs.readdirSync(sourceDir)
        .filter(file => file.endsWith('.tex'));

    files.forEach(file => {
        const content = fs.readFileSync(path.join(sourceDir, file), 'utf8');
        const themeMatch = content.match(/\\theme{([^}]*)}/);
        
        if (themeMatch && themeMatch[1]) {
            // Split themes by comma and trim whitespace
            const themes = themeMatch[1].split(',').map(theme => theme.trim());
            themes.forEach(theme => allThemes.add(theme));
        }
    });

    // Write unique themes to output file
    const sortedThemes = [...allThemes].sort();
    fs.writeFileSync(outputFile, sortedThemes.join('\n'));
    
    console.log(`Extracted ${sortedThemes.length} unique themes to ${outputFile}`);
} catch (error) {
    console.error('Error:', error.message);
}