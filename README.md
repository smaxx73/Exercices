# Exercices
## Exercices de maths
Chaque exercice est contenu dans un fichier du répertoire ```src/```.

Pour créer un exercice à partir du template, exécuter le script ```create_exercise.py```.

Pour insérer un exercice dans un document .tex, insérer le préambule : 

```
\newcommand{\path}{} %insérer le chemin vers le répertoire où se trouve le dépot Exercice

\input{\path/_preambules/general.tex}
\input{\path/_preambules/print.tex}
\input{\path/_preambules/macros.tex}
\input{\path/_preambules/python.tex}
```

et dans le corps du document, utiliser la commande

```\insertexo{...}{solution}{uuid}{lien}{numerotation}```

avec l'identifiant de l'exercice comme premier argument. ```solution```, ```uuid```, ```lien``` sont des booléens contrôlant l'affichage (ou non) des solutions, de l'identifiant de l'exercice et du lien vers la solution. Le dernier argument est le numéro de l'exercice.

### Exemple : 
Si on a plusieurs exercices, on peut utiliser la commande suivante : 

```
\def\TD{tQCJ,vnJs,qjd1,lCVu}

\listexo{\TD}
```
Si on a un seul exercice et qu'on veut contrôler finement l'affichage des paramètres : 
```
\def\solution{true}
\def\isindication{true}
\def\isuuid{true}
\def\link{true}

\insertexo{J50Z}{\solution}{\uuid}{\link}{\thenum}
```
permet d'insérer l'exercice J50Z en affichant la solution, l'identifiant, le lien vers la solution et numéroté avec le compteur num.


Pour afficher une liste de QR code qui envoie sur les solutions, on a la commande suivante :
```
\listeqrcode{\TD}{1}
```
## Champs dans un exercice
Chaque exercice a la structure suivante : 

```
\uuid{{ID}}
\titre{ {TITRE} }

\niveau{} 				%L1, L2, L3, MPSI, MP, PCSI, PC, PSI...
\module{ {MODULE} } 	%Analyse, Algèbre...
\chapitre{}   			%Continuité, Groupes, Fonctions de plusieurs variables...
\sousChapitre{}			%Optimisation, Diagonalisation d'une matrice, Calcul de dérivées partielles...

\theme{}				%Fonction de répartition, Division euclidienne de polynômes, ...
\auteur{}
\datecreate{ {YYYY-MM-DD}}
\organisation{}			%AMSCC, Exo7, ...
\difficulte{}			%1, 2, 3, 4 ou 5

\contenu{

\texte{ 
}

\begin{enumerate}
\item   \question{}
\indication{}
\reponse{}
\item   \question{}
\indication{}

\end{enumerate}

}
```

Les questions /réponses peuvent être agencées par exemple dans une structure enumerate.

## sortie pdf
Dans le répertoire /pdf, on trouve :
- latex : chaque exercice est appelé dans un fichier compilable (standalone) individuel
- pdf : le résultat après exécution de pdflatex

## Documentation du Makefile
Le `Makefile` sert à compiler automatiquement les figures TikZ présentes dans `img/tikz/` (fichiers `*-tikz-*.tex`) vers :
- `img/pdf/` pour les PDF
- `img/svg/` pour les SVG

Le préambule utilisé est `img/tikz/_standalone_preamble.tex`.  
Chaque compilation construit un fichier temporaire `*_tmp.tex`, lance `lualatex` (et `dvisvgm` pour les SVG), puis nettoie les fichiers temporaires.

### Prérequis
- `make`
- `lualatex`
- `dvisvgm` (uniquement pour la cible SVG)

### Commandes principales
- `make` ou `make figures` : compile toutes les figures en PDF
- `make svg` : compile toutes les figures en SVG
- `make fig UUID=<id> N=<n>` : compile une figure PDF (`<id>-tikz-<n>.tex`)
- `make fig-svg UUID=<id> N=<n>` : compile une figure SVG
- `make list` : liste les sources TikZ et les sorties déjà générées
- `make clean` : supprime les fichiers temporaires
- `make cleanall` : supprime aussi tous les PDF/SVG générés
- `make rebuild` : nettoyage complet puis recompilation PDF
- `make rebuild-svg` : nettoyage complet puis recompilation SVG
- `make debug` : affiche les variables internes calculées par le `Makefile`
- `make help` : affiche l’aide intégrée
