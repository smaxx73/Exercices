import fs from 'fs';
import path from 'path';



function extractThemes(inputDir, outputDir) {
    const themesSet = new Set();
  
    // Lire tous les fichiers du répertoire d'entrée
    const files = fs.readdirSync(inputDir);
  
    // Filtrer les fichiers JSON
    const jsonFiles = files.filter((file) => path.extname(file).toLowerCase() === '.json');
  
    // Traiter chaque fichier JSON
    jsonFiles.forEach((file) => {
      const filePath = path.join(inputDir, file);
      const data = fs.readFileSync(filePath, 'utf8');
  
      try {
        const exercice = JSON.parse(data);
        if (Array.isArray(exercice.theme)) {
          exercice.theme.forEach((theme) => themesSet.add(theme));
        }
      } catch (parseErr) {
        console.error(`Erreur lors du parsing du fichier ${file}: ${parseErr.message}`);
      }
    });
  
    // Convertir le Set en tableau et trier les thèmes
    const themesArray = Array.from(themesSet).sort();
  
    // S'assurer que le répertoire de sortie existe
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  
    // Chemin du fichier de sortie
    const outputFilePath = path.join(outputDir, 'themes.txt');
  
    // Écrire les thèmes dans le fichier de sortie
    fs.writeFileSync(outputFilePath, themesArray.join('\n'), 'utf8');
    console.log(`Liste des thèmes générée avec succès dans ${outputFilePath}`);
  }
  
  // Exemple d'utilisation:
  // Le premier argument est le répertoire d'entrée, le second est le répertoire de sortie
  const inputDirectory = 'src'; // À remplacer par votre répertoire
  const outputDirectory = 'info'; // À remplacer par votre répertoire
  
  extractThemes(inputDirectory, outputDirectory);
