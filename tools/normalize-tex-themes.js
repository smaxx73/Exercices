import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Fonction pour créer une interface de lecture
function createReadlineInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

// Fonction pour poser une question et obtenir une réponse
function askQuestion(rl, question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer);
        });
    });
}

// Fonction pour extraire les thèmes d'une commande LaTeX
function extractTeXThemes(content) {
    const regex = /\\theme{([^}]*)}/s;
    const match = content.match(regex);
    if (!match) return [];

    // Séparer et nettoyer les thèmes
    return match[1]
        .split(',')
        .map(theme => theme.trim())
        .filter(theme => theme !== '');
}

// Fonction pour remplacer les thèmes dans une commande LaTeX
function replaceTeXThemes(content, newThemes) {
    const regex = /(\\theme{)[^}]*(})/s;
    return content.replace(regex, `$1${newThemes.join(', ')}$2`);
}

// Fonctions de calcul de similarité (identiques à la version précédente)
function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str1.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= str2.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str1.length; i++) {
        for (let j = 1; j <= str2.length; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str1.length][str2.length];
}

function normalizeString(str) {
    return str.toLowerCase()
              .trim()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9\s]/g, '')
              .replace(/\s+/g, ' ');
}

function calculateSimilarity(str1, str2) {
    const norm1 = normalizeString(str1);
    const norm2 = normalizeString(str2);
    const maxLength = Math.max(norm1.length, norm2.length);
    const distance = levenshteinDistance(norm1, norm2);
    return 1 - (distance / maxLength);
}

// Fonction pour regrouper les thèmes similaires
function clusterThemes(themes, similarityThreshold = 0.8) {
    const clusters = [];
    const processed = new Set();

    themes.forEach(theme => {
        if (processed.has(theme)) return;

        const cluster = new Set([theme]);
        processed.add(theme);

        themes.forEach(otherTheme => {
            if (theme === otherTheme || processed.has(otherTheme)) return;

            const similarity = calculateSimilarity(theme, otherTheme);
            if (similarity >= similarityThreshold) {
                cluster.add(otherTheme);
                processed.add(otherTheme);
            }
        });

        clusters.push(Array.from(cluster));
    });

    return clusters;
}

// Fonction pour choisir le meilleur représentant d'un cluster
function chooseBestRepresentative(cluster) {
    return cluster.reduce((a, b) => a.length >= b.length ? a : b);
}

// Fonction principale
async function normalizeThemesInDirectory(directoryPath, similarityThreshold = 0.8) {
    const rl = createReadlineInterface();

    try {
        // Vérifier si le dossier existe
        if (!fs.existsSync(directoryPath)) {
            console.error(`Erreur : Le dossier "${directoryPath}" n'existe pas.`);
            rl.close();
            return;
        }

        // Collecter tous les thèmes uniques
        const allThemes = new Set();
        const files = await fs.promises.readdir(directoryPath);
        const texFiles = files.filter(file => path.extname(file) === '.tex');
        
        if (texFiles.length === 0) {
            console.error(`Erreur : Aucun fichier .tex trouvé dans "${directoryPath}"`);
            rl.close();
            return;
        }

        console.log(`Traitement de ${texFiles.length} fichiers .tex...`);
        
        // Premier passage : collecter tous les thèmes
        for (const file of texFiles) {
            const content = await fs.promises.readFile(
                path.join(directoryPath, file),
                'utf8'
            );
            const themes = extractTeXThemes(content);
            themes.forEach(theme => allThemes.add(theme));
        }

        console.log(`\n${allThemes.size} thèmes uniques trouvés.`);

        // Regrouper les thèmes similaires
        const clusters = clusterThemes(Array.from(allThemes), similarityThreshold);
        
        // Créer un dictionnaire de normalisation
        const normalizationMap = new Map();
        clusters.forEach(cluster => {
            const representative = chooseBestRepresentative(cluster);
            cluster.forEach(theme => {
                normalizationMap.set(theme, representative);
            });
        });

        // Afficher les groupes trouvés
        console.log('\nGroupes de thèmes similaires trouvés :');
        clusters.forEach(cluster => {
            const representative = chooseBestRepresentative(cluster);
            if (cluster.length > 1) {
                console.log(`\nGroupe normalisé vers "${representative}" :`);
                cluster.forEach(theme => {
                    if (theme !== representative) {
                        console.log(`  - ${theme}`);
                    }
                });
            }
        });

        // Demander confirmation
        const answer = await askQuestion(rl, '\nVoulez-vous procéder à la normalisation des thèmes ? (o/n) : ');
        
        if (answer.toLowerCase() !== 'o') {
            console.log('Opération annulée.');
            rl.close();
            return;
        }

        // Deuxième passage : mettre à jour les fichiers
        let filesModified = 0;
        for (const file of texFiles) {
            const filePath = path.join(directoryPath, file);
            let content = await fs.promises.readFile(filePath, 'utf8');
            const originalThemes = extractTeXThemes(content);
            
            // Normaliser chaque thème individuellement
            const normalizedThemes = originalThemes.map(theme => 
                normalizationMap.get(theme) || theme
            );

            // Supprimer les doublons après normalisation
            const uniqueNormalizedThemes = [...new Set(normalizedThemes)];

            // Vérifier si les thèmes ont changé
            if (JSON.stringify(originalThemes) !== JSON.stringify(uniqueNormalizedThemes)) {
                content = replaceTeXThemes(content, uniqueNormalizedThemes);
                await fs.promises.writeFile(filePath, content, 'utf8');
                filesModified++;
            }
        }

        console.log(`\nMise à jour terminée : ${filesModified} fichiers modifiés.`);

    } catch (error) {
        console.error('Erreur lors du traitement :', error);
    } finally {
        rl.close();
    }
}

// Vérifier les arguments de la ligne de commande
if (process.argv.length !== 3) {
    console.error('Usage : node normalize-tex-themes.js <dossier>');
    process.exit(1);
}

// Lancer le script avec le dossier spécifié
const directoryPath = process.argv[2];
normalizeThemesInDirectory(directoryPath, 0.8);