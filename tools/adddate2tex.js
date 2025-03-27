const fs = require('fs');
const path = require('path');

// Obtenir les chemins absolus
const toolsDir = __dirname;
const rootDir = path.dirname(toolsDir);
const srcDir = path.join(rootDir, 'src');

// Lire le fichier JSON des dates
const datesJson = JSON.parse(fs.readFileSync(path.join(toolsDir, 'dates_tex.json'), 'utf8'));

// Lire tous les fichiers .tex dans src/
const texFiles = fs.readdirSync(srcDir)
    .filter(file => file.endsWith('.tex'));

texFiles.forEach(texFile => {
    const filePath = path.join(srcDir, texFile);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Récupérer la date correspondante
    const date = datesJson[texFile];
    if (!date) {
        console.warn(`Pas de date trouvée pour ${texFile}`);
        return;
    }
    
    // Vérifier si \datecreate existe déjà
    const dateCreateRegex = /\\datecreate\{[^}]*\}/;
    const hasDateCreate = dateCreateRegex.test(content);
    
    if (hasDateCreate) {
        // Remplacer la date existante
        content = content.replace(dateCreateRegex, `\\datecreate{${date}}`);
    } else {
        // Ajouter après \auteur si présent, sinon après \titre
        if (content.includes('\\auteur{')) {
            content = content.replace(
                /(\\auteur\{[^}]*\})/,
                `$1\n\\datecreate{${date}}`
            );
        } else if (content.includes('\\titre{')) {
            content = content.replace(
                /(\\titre\{[^}]*\})/,
                `$1\n\\datecreate{${date}}`
            );
        } else {
            // Si ni \auteur ni \titre n'est trouvé, ajouter au début du fichier
            content = `\\datecreate{${date}}\n${content}`;
        }
    }
    
    // Sauvegarder les modifications
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Mise à jour de ${texFile} avec la date ${date}`);
});

console.log('Traitement terminé !');