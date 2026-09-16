# Référentiel modules / chapitres / sous-chapitres

Noms canoniques à utiliser dans `\module{}`, `\chapitre{}`, `\sousChapitre{}`.
Les variantes orthographiques présentes dans le dépôt sont signalées entre parenthèses — ne pas les réutiliser.

---

## Probabilité

### Probabilité discrète
- Variable aléatoire discrète
- Lois de distributions
- Probabilité conditionnelle
- Théorème de Bayes
- Probabilité et dénombrement
- Loi, indépendance, loi conditionnelle
- Loi conjointe, marginales, covariance
- Reconnaissance de lois discrètes
- Loi binomiale et approximation
- Définition et propriété d'une probabilité
- Autre

### Probabilité continue
- Densité de probabilité
- Loi normale
- Lois des grands nombres, théorème central limite
- Convergence en loi
- Théorème central limite
- Loi conjointe
- Loi exponentielle
- Espérance et Fonction de répartition
- Lois usuelles et approximations
- Approximation normale
- Autre

### Fonctions caractéristiques
- Loi normale et somme de variables aléatoires

---

## Analyse de données

Ce module regroupe les exercices dont l'objet est l'exploitation de données : statistique,
préparation des données et apprentissage automatique. Les résultats et lois de probabilité
restent dans le module **Probabilité** lorsqu'ils sont étudiés pour eux-mêmes.

### Statistique
- Statistique descriptive et visualisation
- Échantillonnage et estimation
- Estimation
- Estimation par maximum de vraisemblance
- Intervalle de confiance
- Tests d'hypothèses
- Tests d'hypothèses, intervalle de confiance
- Autre

### Prétraitement des données
- Nettoyage, valeurs manquantes, filtrage
- Encodage des variables
- Normalisation et standardisation
- Découpage entraînement, validation, test
- Autre

### Apprentissage automatique
- Régression supervisée
- Classification supervisée
- Apprentissage non supervisé
- Sélection et réduction de variables
- Validation croisée et réglage d'hyperparamètres
- Évaluation et métriques de modèles
- Autre

### Réseaux de neurones
- Architecture et propagation avant
- Fonctions d'activation et couche de sortie
- Fonctions de coût
- Descente de gradient et optimisation
- Rétropropagation
- Initialisation, normalisation et régularisation
- Évaluation et métriques de classification
- Réseaux convolutifs
- Réseaux récurrents, LSTM et GRU
- Autre

---

## Analyse

### Série numérique
- Série à termes positifs
- Convergence absolue
- Critères de Cauchy et d'Alembert
- Séries semi-convergentes
- Séries divergentes
- Autre

### Série entière
- Rayon de convergence
- Domaine de convergence
- Développement en série entière
- Calcul de la somme d'une série entière
- Equations différentielles
- Autre

### Fonction de plusieurs variables
- Dérivée partielle
- Différentiabilité
- Limite
- Extremums locaux
- Multiplicateurs de Lagrange
- Courbes de niveaux
- Surface représentative
- Différentielle de fonctions composées
- Applications
- Autre

### Continuité, limite et étude de fonctions réelles
- Fonctions équivalentes, fonctions négligeables
- Continuité : théorie
- Autre

### Dérivabilité des fonctions réelles
- Calculs
- Applications
- Autre

### Développement limité
- Calculs
- Applications

### Équation différentielle
- Résolution d'équation différentielle

### Série de Fourier
- Calcul de coefficients
- Autre

### Calcul d'intégrales
- Calcul approché d'intégrale
- Autre

### Suite
- Suite définie par une relation de récurrence

### Topologie
- Ouvert, fermé, intérieur, adhérence
- Suite dans Rn
- Autre

### Distributions
- Dérivation au sens des distributions
- Valeur principale et dérivation distributionnelle
- Équations différentielles causales
- Équations différentielles dans $\mathcal{D}'_+$
- Solutions fondamentales et convolution

### Systèmes linéaires causals
- Réponse impulsionnelle d'un circuit RLC

### Transformée de Fourier
- Produit, convolution, modulation et translation
- Transformée de Fourier des distributions

---

## Algèbre

### Matrice
- Propriétés élémentaires, généralités
- Inverse, méthode de Gauss
- Produit matriciel et déterminant
- Autre

### Déterminant, système linéaire
- Calcul de déterminants
- Système linéaire, rang

### Polynôme, fraction rationnelle
- Racine, décomposition en facteurs irréductibles
- Division euclidienne
- Fraction rationnelle
- Factorisation et fractions rationnelles

### Application linéaire
- Autre

### Nombres complexes
- Racine n-ième
- Autre

### Dénombrement
- Autre

---

## Analyse numérique

### Résolution de systèmes linéaires : méthode itérative
- Résolution de systèmes linéaires : méthode itérative
- Résolution de systèmes linéaires : méthode de gradient

### Résolution de systèmes linéaires : méthode directe
- Résolution de systèmes linéaires : méthode directe

### Interpolation polynomiale
- Interpolation polynomiale

### Résolution d'équation différentielle
- Résolution d'équation différentielle

### Méthodes numériques
- Méthode de Newton
- Méthode du gradient à pas optimal
- Autre

---

## Optimisation

### Fonction convexe
- Multiplicateurs de Lagrange

### Calcul différentiel
- Différentiabilité

---

## Règles de migration et variantes à éviter

| Valeurs historiques | Cible canonique |
|---|---|
| `Probabilité et statistique` + chapitre `Statistique` | `Analyse de données` / `Statistique` |
| `Probabilité et statistique` + chapitre `Probabilité discrète` ou `Probabilité continue` | `Probabilité` / chapitre inchangé |
| `Apprentissage automatique` | `Analyse de données` ; choisir le chapitre métier correspondant |
| `Réseaux de Neurones` | `Analyse de données` / `Réseaux de neurones` |
| `Informatique / Signal` + chapitre `Réseaux de neurones` | `Analyse de données` / `Réseaux de neurones` |

Les autres valeurs historiques sont traitées au cas par cas : l'intitulé du module seul ne
suffit pas à déterminer la cible.

| Variante présente dans le dépôt | Forme canonique |
|---|---|
| Probabilités et Statistiques | Voir les règles de migration ci-dessus |
| Probabilités | Probabilité |
| Statistiques | Analyse de données / Statistique |
| Statistiques inférentielles | Analyse de données / Statistique |
| Probabilités avancées | Probabilité |
| Analyse Numérique | Analyse numérique |
| Fonctions de plusieurs variables | Fonction de plusieurs variables |
| Matrices | Matrice |
| Systèmes linéaires | Déterminant, système linéaire |
| Polynômes | Polynôme, fraction rationnelle |
| Dérivées partielles | Dérivée partielle |
| Série à  termes positifs (double espace) | Série à termes positifs |
| Théorème Central Limite (majuscules) | Théorème central limite |
| Réseaux de neurones récurrents | Analyse de données / Réseaux de neurones / Réseaux récurrents, LSTM et GRU |
