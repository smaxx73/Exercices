#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Vérification des arguments
if (process.argv.length < 3) {
  console.error('Utilisation : node export-dates.js <répertoire>');
  process.exit(1);
}

// Récupère le chemin du répertoire depuis la ligne de commande
const directory = process.argv[2];

// Essaie de lire le répertoire
let files;
try {
  files = fs.readdirSync(directory);
} catch (err) {
  console.error(`Impossible de lire le répertoire : ${err.message}`);
  process.exit(1);
}

// Objet qui stockera les paires "fichier.tex": "date"
const results = {};

// Parcours des fichiers
files.forEach((file) => {
  // Vérifie si le fichier se termine par .tex
  if (file.endsWith('.tex')) {
    // Récupère la partie sans extension
    const baseName = path.basename(file, '.tex');

    // On vérifie que baseName fait exactement 4 caractères
    if (baseName.length === 4) {
      const filePath = path.join(directory, file);
      let creationDate = '';

      // Récupère la date de création via Git
      try {
        creationDate = execSync(
          `git log --follow --diff-filter=A --date=short --format="%ad" -1 -- "${filePath}"`,
          { encoding: 'utf8' }
        ).trim();
      } catch (error) {
        // Si on ne peut pas récupérer la date, on laisse éventuellement vide
        console.error(`Impossible de récupérer la date pour ${file} : ${error.message}`);
      }

      // On stocke dans l'objet results
      // Clé = nom du fichier (ex. "abcd.tex"), Valeur = date (ex. "2021-06-15")
      results[file] = creationDate || 'Date inconnue';
    }
  }
});

// Écriture du résultat dans un fichier JSON
// => on crée/écrase le fichier dates_tex.json dans le répertoire courant
const outputFile = path.join(process.cwd(), 'dates_tex.json');
fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf8');

console.log(`Fichier dates_tex.json créé/actualisé dans : ${outputFile}`);
console.log('Contenu :');
console.log(JSON.stringify(results, null, 2));
