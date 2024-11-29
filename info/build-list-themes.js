const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const outputFile = path.join(__dirname, 'list-themes.json');

const themeRegex = /\\theme\{([^}]+)\}/g;
let themes = new Set();

function extractThemes(content) {
    let match;
    while ((match = themeRegex.exec(content)) !== null) {
        const themeList = match[1].split(',').map(theme => theme.trim());
        themeList.forEach(theme => themes.add(theme));
    }
}

function readTexFiles(dir) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            readTexFiles(filePath);
        } else if (path.extname(file) === '.tex') {
            const content = fs.readFileSync(filePath, 'utf8');
            extractThemes(content);
        }
    });
}

readTexFiles(srcDir);

fs.writeFileSync(outputFile, JSON.stringify(Array.from(themes), null, 2), 'utf8');
console.log(`Themes have been written to ${outputFile}`);