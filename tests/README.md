# Tests de validation des fichiers .tex

Ce répertoire contient un système de tests automatisés pour valider la structure et la syntaxe des fichiers .tex d'exercices.

## 📋 Vue d'ensemble

Le système valide :
- ✅ **Structure** : Présence de tous les champs requis (`\uuid`, `\titre`, `\niveau`, etc.)
- ✅ **Unicité** : Les UUIDs sont uniques et cohérents avec les noms de fichiers
- ✅ **Cohérence** : Les formats sont valides (dates YYYY-MM-DD, difficulté numérique, etc.)
- ✅ **Syntaxe** : Validation LaTeX avec chktex (accolades équilibrées, environnements, etc.)
- ✅ **Préambules** : Les fichiers de préambules sont valides

## 🚀 Installation

```bash
# Installer les dépendances Python
pip install -r tests/requirements.txt

# Installer chktex (si pas déjà installé)
# Ubuntu/Debian:
sudo apt-get install chktex

# macOS:
brew install chktex
```

## 🔧 Utilisation locale

### Validation d'un seul fichier

```bash
# Avec le chemin complet
python scripts/check_single_file.py src/6Wjb.tex

# Ou juste l'UUID
python scripts/check_single_file.py 6Wjb
```

### Validation de tous les exercices

```bash
# Rapport dans le terminal
python scripts/validate_exercises.py

# Rapport JSON
python scripts/validate_exercises.py --report json

# Rapport HTML
python scripts/validate_exercises.py --report html > report.html
```

### Exécuter les tests avec pytest

```bash
# Tous les tests
pytest tests/ -v

# Tests rapides uniquement (sans compilation)
pytest tests/ -v -m fast

# Tests en parallèle (plus rapide)
pytest tests/ -v -n auto

# Test spécifique
pytest tests/test_structure.py -v
```

## 🤖 GitHub Actions

### Déclenchement automatique

Les tests s'exécutent automatiquement :
- À chaque push sur n'importe quelle branche
- Quand un fichier .tex est modifié dans `src/` ou `_preambules/`

### Déclenchement manuel

Aller sur GitHub Actions > "Validation manuelle" > "Run workflow"

Options disponibles :
- **Pattern de fichiers** : `src/*.tex` (par défaut)
- **Mode strict** : Active les erreurs bloquantes (désactivé par défaut)

### Rapports

Les rapports sont disponibles dans les artifacts de chaque run GitHub Actions :
- `validation-report` (JSON) - Automatique
- `validation-report-json` (JSON) - Manuel
- `validation-report-html` (HTML) - Manuel

## 📁 Structure

```
tests/
├── README.md                   # Ce fichier
├── requirements.txt            # Dépendances Python
├── conftest.py                 # Configuration pytest
├── test_structure.py           # Tests de structure
├── test_uniqueness.py          # Tests d'unicité
├── test_consistency.py         # Tests de cohérence
├── test_syntax.py              # Tests de syntaxe
├── test_preambles.py           # Tests des préambules
├── utils/
│   ├── parser.py               # Parseur de fichiers .tex
│   └── validators.py           # Validateurs de champs
└── config/
    └── .chktexrc               # Configuration chktex
```

## ⚙️ Configuration

### Mode warnings (par défaut)

Les tests affichent des avertissements mais ne bloquent pas le CI. C'est le mode recommandé pour une migration progressive.

Pour passer en mode strict localement :
```bash
# Les tests échoueront si des erreurs sont détectées
pytest tests/ -v
```

### Personnaliser chktex

Éditer [tests/config/.chktexrc](tests/config/.chktexrc) pour ajuster les warnings chktex.

## 📊 Types de validation

### 1. Structure (test_structure.py)

Vérifie que chaque exercice contient tous les champs requis :
- `\uuid{}` - Identifiant unique
- `\titre{}` - Titre de l'exercice
- `\niveau{}` - Niveau (L1, L2, MPSI, etc.)
- `\module{}` - Module (Algèbre, Analyse, etc.)
- `\chapitre{}` - Chapitre
- `\sousChapitre{}` - Sous-chapitre
- `\theme{}` - Thèmes
- `\auteur{}` - Auteur (optionnel)
- `\datecreate{}` - Date de création
- `\organisation{}` - Organisation (optionnel)
- `\difficulte{}` - Difficulté (optionnel)
- `\contenu{}` - Contenu de l'exercice

### 2. Unicité (test_uniqueness.py)

- Tous les UUIDs sont uniques
- Format UUID : 4 caractères alphanumériques `[a-zA-Z0-9]{4}`
- Nom de fichier = UUID (`{UUID}.tex`)

### 3. Cohérence (test_consistency.py)

- **UUID** : Exactement 4 caractères alphanumériques
- **Date** : Format `YYYY-MM-DD` valide
- **Difficulté** : Chiffre ou vide
- **Contenu** : Non vide et contient `\texte{}` ou `\question{}`

**Note** : Pas de validation stricte des valeurs (niveaux, modules, organisations) - toute valeur non-vide est acceptée.

### 4. Syntaxe (test_syntax.py)

- Validation avec chktex
- Accolades équilibrées `{}`
- Environnements équilibrés `\begin{}`/`\end{}`

### 5. Préambules (test_preambles.py)

- Tous les préambules existent (general.tex, print.tex, macros.tex, python.tex)
- Syntaxe valide avec chktex
- Pas de conflits de packages évidents

## 🐛 Dépannage

### Erreur "ModuleNotFoundError"

```bash
# S'assurer d'être dans la racine du projet
cd /chemin/vers/Exercices

# Vérifier la structure
ls tests/utils/parser.py
```

### chktex non trouvé

```bash
# Installer chktex
sudo apt-get install chktex  # Ubuntu/Debian
brew install chktex           # macOS
```

### Tests échouent en local mais passent en CI

Vérifier la version de Python et des dépendances :
```bash
python --version  # Devrait être >= 3.11
pip list
```

## 📝 Exemples de sortie

### Validation réussie

```
✅ UUID         : OK
✅ Titre        : OK
✅ Niveau       : OK
✅ Module       : OK
...
✅ Tous les tests passent !
```

### Avec warnings

```
✅ UUID         : OK
✅ Titre        : OK
❌ Niveau       : Niveau vide
⚠️  Difficulté  : Difficulté invalide: 'abc' (doit être un chiffre ou vide)
...
⚠️ Certains tests ont des avertissements
```

## 🔗 Ressources

- [Plan complet](../.claude/plans/fluttering-swimming-thunder.md)
- [chktex documentation](https://www.nongnu.org/chktex/)
- [pytest documentation](https://docs.pytest.org/)

## 🤝 Contribution

Pour ajouter de nouveaux tests :

1. Créer un fichier `test_*.py` dans `tests/`
2. Utiliser les fixtures définies dans [conftest.py](conftest.py)
3. Marquer les tests avec `@pytest.mark.fast` si approprié
4. Tester localement avec `pytest tests/test_nouveau.py -v`
