---
name: new-exercise
description: >
  Rédiger un nouvel exercice de mathématiques au format LaTeX du projet COET/Exercices.
  Utiliser quand l'utilisateur veut créer un exercice, ajouter une question, construire un
  problème, rédiger un corrigé, proposer un exercice sur un thème donné (séries, intégrales,
  probabilités, EDP, analyse, algèbre...). Produit un fichier .tex prêt à l'emploi dans src/.
argument-hint: "thème et niveau, ex : séries télescopiques L1 difficulté 2"
---

# Rédiger un nouvel exercice

Produit un fichier `.tex` complet dans `src/` respectant exactement le format du projet.

## Format attendu

Voir le template : [assets/template.tex](./assets/template.tex)

Pour les valeurs de `\module{}`, `\chapitre{}` et `\sousChapitre{}`, consulter impérativement :
[assets/referentiel.md](./assets/referentiel.md)

Champs obligatoires dans l'ordre :
- `\uuid{XXXX}` — 4 caractères alphanumériques, **unique** dans `src/`
- `\titre{...}` — titre court et descriptif
- `\niveau{L1|L2|L3|M1|M2}`
- `\module{...}` — ex. "Séries numériques", "Probabilités et Statistiques", "Analyse"
- `\chapitre{...}` — chapitre principal
- `\sousChapitre{...}` — sous-chapitre précis
- `\theme{...}` — mots-clés séparés par des virgules
- `\auteur{}` — laisser vide sauf indication contraire
- `\datecreate{YYYY-MM-DD}` — date du jour
- `\organisation{AMSCC}`
- `\difficulte{1..5}` — entier entre 1 (très facile) et 5 (très difficile)
- `\contenu{...}` — corps de l'exercice

Structure du contenu :
```
\contenu{
  \texte{ ... }           % contexte facultatif
  \begin{enumerate}
    \item \question{ ... }
    \indication{ ... }    % vide si pas d'indication
    \reponse{ ... }
  \end{enumerate}
}
```

## Procédure

### 1. Recueillir les informations

Si l'utilisateur n'a pas précisé, demander :
- Thème mathématique et idée principale de l'exercice
- Niveau (L1/L2/L3/M1/M2) et difficulté (1-5)
- Nombre de questions souhaitées (défaut : 3)

### 2. Choisir un UUID unique

Lister les UUID existants :
```bash
grep -h '\\uuid' src/*.tex | sort
```
Générer un code de 4 caractères alphanumériques (majuscules et minuscules, chiffres) absent de cette liste.

### 3. Rédiger l'exercice

Principes éditoriaux :
- L'énoncé doit être **autonome** : toutes les notations utilisées sont introduites dans `\texte{}` ou dans les questions.
- Chaque `\question{}` doit être précise et univoque.
- Chaque `\reponse{}` doit justifier **toutes** les étapes, y compris les passages à la limite, les critères de convergence, les théorèmes invoqués.
- `\indication{}` est optionnel ; laisser le champ vide `\indication{}` plutôt que de l'omettre.
- Utiliser `$$...$$` pour les formules centrées, `$...$` pour les formules en ligne.
- Les sommes de séries s'écrivent `\sum_{n\geq 1}` ou `\sum_{n=1}^{N}`.
- Encadrer les résultats remarquables avec `\boxed{...}`.

### 4. Créer le fichier

Écrire le fichier `src/<UUID>.tex` en suivant exactement le template.

### 5. Vérifier

- UUID absent de `src/` avant création
- Tous les champs obligatoires présents
- La correction (`\reponse`) est complète et mathématiquement rigoureuse
- La date correspond à aujourd'hui
