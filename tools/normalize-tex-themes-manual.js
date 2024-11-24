import fs from 'fs';
import path from 'path';

// Table de correspondance pour la normalisation des thèmes
const normalizationMap = new Map([
  ["statistiques", "statistiques"],
  ["tableur", "tableur"],
  ["probabilités", "probabilités"],
  ["calcul différentiel", "calcul différentiel"],
  ["systèmes linéaires", "systèmes linéaires"],
  ["fonctions de plusieurs variables", "fonctions de plusieurs variables"],
  ["Réseau de neurones", "réseau de neurones"],
  ["topologie", "topologie"],
  ["polynomes", "polynômes"],
  ["Optimisation", "optimisation"],
  ["séries", "séries"],
  ["matrices", "matrices"],
  ["séries entières", "séries entières"],
  ["séries de fourier", "séries de Fourier"],
  ["calcul déterminant", "calcul déterminant"],
  ["courbes paramétrées", "courbes paramétrées"],
  ["calcul matriciel", "calcul matriciel"],
  ["analyse numérique", "analyse numérique"],
  ["méthodes numériques", "méthodes numériques"],
  ["analyse asymptotique", "analyse asymptotique"],
  ["complexes", "complexes"],
  ["limite", "limite"],
  ["Equations différentielles", "équations différentielles"],
  ["fractions rationnelles", "fractions rationnelles"]
]);

// Fonction pour extraire et normaliser les thèmes
function normalizeThemes(content) {
  const themeRegex = /\\theme{([^}]*)}/g;
  return content.replace(themeRegex, (match, themes) => {
    const normalizedThemes = themes
      .split(',')
      .map(theme => theme.trim())
      .map(theme => normalizationMap.get(theme) || theme) // Normaliser ou conserver si inconnu
      .filter((theme, index, self) => self.indexOf(theme) === index) // Supprimer les doublons
      .join(', ');
    return `\\theme{${normalizedThemes}}`;
  });
}

// Fonction principale
async function normalizeThemesInDirectory(directoryPath) {
  try {
    // Vérifier si le répertoire existe
    if (!fs.existsSync(directoryPath)) {
      console.error(`Erreur : Le répertoire "${directoryPath}" n'existe pas.`);
      return;
    }

    // Lire les fichiers dans le répertoire
    const files = await fs.promises.readdir(directoryPath);
    const texFiles = files.filter(file => path.extname(file) === '.tex');

    if (texFiles.length === 0) {
      console.error(`Aucun fichier .tex trouvé dans "${directoryPath}".`);
      return;
    }

    console.log(`Traitement de ${texFiles.length} fichiers .tex...`);

    for (const file of texFiles) {
      const filePath = path.join(directoryPath, file);
      const content = await fs.promises.readFile(filePath, 'utf8');

      // Normaliser les thèmes dans le fichier
      const updatedContent = normalizeThemes(content);

      // Écrire les changements dans le fichier
      if (content !== updatedContent) {
        await fs.promises.writeFile(filePath, updatedContent, 'utf8');
        console.log(`Fichier mis à jour : ${file}`);
      } else {
        console.log(`Aucune modification : ${file}`);
      }
    }

    console.log('Normalisation terminée.');
  } catch (error) {
    console.error('Erreur lors de la normalisation :', error);
  }
}

// Lancer la normalisation
const directoryPath = path.join(process.cwd(), 'src');
normalizeThemesInDirectory(directoryPath);
