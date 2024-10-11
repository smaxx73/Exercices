#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Fonction pour supprimer les commentaires d'une chaîne de caractères LaTeX.
 * Les commentaires commencent par % et s'étendent jusqu'à la fin de la ligne.
 * Les % échappés (e.g., \%) ne sont pas considérés comme des débuts de commentaires.
 * @param {string} str - Chaîne de caractères LaTeX.
 * @returns {string} - Chaîne sans les commentaires non échappés.
 */
function stripComments(str) {
  return str.replace(/(?<!\\)%.*$/gm, '');
}

/**
 * Fonction pour vérifier si une commande est commentée sur la même ligne.
 * @param {string} line - La ligne de texte LaTeX.
 * @param {number} commandPosInLine - Position du début de la commande dans la ligne.
 * @returns {boolean} - Retourne true si la commande est commentée, sinon false.
 */
function isCommandCommented(line, commandPosInLine) {
  for (let i = 0; i < commandPosInLine; i++) {
    if (line[i] === '%' && (i === 0 || line[i - 1] !== '\\')) {
      return true;
    }
  }
  return false;
}

/**
 * Fonction générique pour extraire le contenu des commandes LaTeX.
 * Cette version parcourt le contenu LaTeX séquentiellement pour préserver l'ordre des commandes de contenu.
 * @param {string} latex - Contenu complet du fichier LaTeX.
 * @param {Array} commands - Liste des commandes à extraire avec leurs propriétés.
 * @returns {Object} - Objet contenant les champs extraits.
 */
function extractLaTeXCommands(latex, commands) {
  const extracted = {
    contenu: []
  };

  // Initialiser les champs uniques avec des chaînes vides
  const uniqueCommands = commands.filter(cmd => !cmd.isContent);
  uniqueCommands.forEach(cmd => {
    extracted[cmd.jsonKey] = "";
  });

  // Créer une regex pour toutes les commandes à extraire
  const allCommandNames = commands.map(cmd => cmd.name).join('|');
  const regex = new RegExp(`(?<!\\\\)\\\\(${allCommandNames})\\s*\\{`, 'g');

  let match;
  while ((match = regex.exec(latex)) !== null) {
    const commandName = match[1];
    const commandObj = commands.find(cmd => cmd.name === commandName);
    if (!commandObj) continue; // Commande non reconnue

    const matchStart = match.index;
    const lineStart = latex.lastIndexOf('\n', matchStart) + 1;
    const lineEnd = latex.indexOf('\n', matchStart);
    const line = latex.substring(lineStart, lineEnd === -1 ? latex.length : lineEnd);
    const commandPosInLine = match.index - lineStart;

    // Vérifier si la commande est commentée
    if (isCommandCommented(line, commandPosInLine)) {
      continue; // Ignorer cette commande car elle est commentée
    }

    // Extraction du contenu entre les accolades
    let startIndex = match.index + match[0].length;
    let index = startIndex;
    let braceCount = 1;
    let content = '';

    while (braceCount > 0 && index < latex.length) {
      const char = latex[index];

      if (char === '\\') {
        // Gérer les caractères échappés (par exemple \{, \}, \\)
        content += char;
        index++;
        if (index < latex.length) {
          content += latex[index];
        }
      } else if (char === '{') {
        braceCount++;
        content += char;
      } else if (char === '}') {
        braceCount--;
        if (braceCount > 0) {
          content += char;
        }
      } else {
        content += char;
      }
      index++;
    }

    // Appliquer ou non stripComments en fonction de isVerbatim
    const finalContent = commandObj.isVerbatim ? content.trim() : stripComments(content.trim());

    if (commandObj.isContent) {
      // Ajouter au tableau 'contenu' en respectant l'ordre d'apparition
      extracted.contenu.push({
        type: commandName,
        value: finalContent
      });
    } else {
      // Commande unique: assigner si non encore assignée
      if (!extracted[commandObj.jsonKey]) {
        extracted[commandObj.jsonKey] = finalContent;
      }
      // Si déjà assignée, ignorer (puisqu'elles sont uniques)
    }
  }

  return extracted;
}

/**
 * Fonction pour traiter un fichier .tex et générer un fichier .json.
 * @param {string} inputFilePath - Chemin complet du fichier .tex.
 * @param {string} outputDir - Répertoire de sortie pour le fichier .json.
 * @param {Array} commandsToExtract - Liste des commandes à extraire.
 */
function processFile(inputFilePath, outputDir, commandsToExtract) {
  try {
    const latexContentRaw = fs.readFileSync(inputFilePath, 'utf8');
    const extractedData = extractLaTeXCommands(latexContentRaw, commandsToExtract);

    // Assurez-vous que toutes les clés uniques sont présentes
    const outputObject = {
      titre: extractedData.titre,
      theme: extractedData.theme,
      auteur: extractedData.auteur,
      date: extractedData.date,
      organisation: extractedData.organisation,
      contenu: extractedData.contenu
    };

    const outputFileName = path.basename(inputFilePath, path.extname(inputFilePath)) + '.json';
    const outputFilePath = path.join(outputDir, outputFileName);

    fs.writeFileSync(outputFilePath, JSON.stringify(outputObject, null, 2), 'utf8');
    console.log(`Conversion réussie : ${inputFilePath} -> ${outputFilePath}`);
  } catch (error) {
    console.error(`Erreur lors du traitement du fichier ${inputFilePath} :`, error.message);
  }
}

/**
 * Fonction principale pour gérer les arguments et traiter les fichiers.
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error("Usage : node convertLaTeXToJSON.js <chemin_du_fichier_ou_répertoire> [chemin_de_sortie]");
    process.exit(1);
  }

  const inputPath = path.resolve(args[0]);
  const outputPath = args[1] ? path.resolve(args[1]) : null;

  // Définir les commandes à extraire avec l'indicateur isVerbatim
  const commandsToExtract = [
    { name: 'titre', jsonKey: 'titre', isContent: false, isVerbatim: false },
    { name: 'theme', jsonKey: 'theme', isContent: false, isVerbatim: false },
    { name: 'auteur', jsonKey: 'auteur', isContent: false, isVerbatim: false },
    { name: 'organisation', jsonKey: 'organisation', isContent: false, isVerbatim: false },
    { name: 'texte', jsonKey: 'contenu', isContent: true, isVerbatim: false },
    { name: 'question', jsonKey: 'contenu', isContent: true, isVerbatim: false },
    { name: 'reponse', jsonKey: 'contenu', isContent: true, isVerbatim: false },
    { name: 'code', jsonKey: 'contenu', isContent: true, isVerbatim: true }, // Nouvelle commande avec isVerbatim=true
    { name: 'date', jsonKey: 'date', isContent: false, isVerbatim: false } // Nouvelle commande sans contenu

  ];

  // Vérifier si le chemin d'entrée existe
  if (!fs.existsSync(inputPath)) {
    console.error(`Le chemin spécifié n'existe pas : ${inputPath}`);
    process.exit(1);
  }

  // Déterminer si l'entrée est un fichier ou un répertoire
  const stats = fs.statSync(inputPath);

  if (stats.isFile()) {
    if (path.extname(inputPath).toLowerCase() !== '.tex') {
      console.error(`Le fichier spécifié n'est pas un fichier .tex : ${inputPath}`);
      process.exit(1);
    }

    // Déterminer le répertoire de sortie
    const outputDir = outputPath ? outputPath : path.dirname(inputPath);

    // Vérifier si le répertoire de sortie existe, sinon le créer
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Répertoire de sortie créé : ${outputDir}`);
    }

    // Traiter le fichier
    processFile(inputPath, outputDir, commandsToExtract);

  } else if (stats.isDirectory()) {
    // Si l'entrée est un répertoire, traiter tous les fichiers .tex à l'intérieur
    const dirPath = inputPath;
    const outputDir = outputPath ? outputPath : dirPath;

    // Vérifier si le répertoire de sortie existe, sinon le créer
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Répertoire de sortie créé : ${outputDir}`);
    }

    // Lire tous les fichiers du répertoire
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        console.error(`Erreur lors de la lecture du répertoire ${dirPath} :`, err.message);
        process.exit(1);
      }

      // Filtrer les fichiers .tex
      const texFiles = files.filter(file => path.extname(file).toLowerCase() === '.tex');

      if (texFiles.length === 0) {
        console.log(`Aucun fichier .tex trouvé dans le répertoire : ${dirPath}`);
        return;
      }

      // Traiter chaque fichier .tex
      texFiles.forEach(file => {
        const inputFilePath = path.join(dirPath, file);
        processFile(inputFilePath, outputDir, commandsToExtract);
      });
    });

  } else {
    console.error(`Le chemin spécifié n'est ni un fichier ni un répertoire : ${inputPath}`);
    process.exit(1);
  }
}

// Exécuter la fonction principale
main();
