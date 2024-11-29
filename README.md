# Exercices
## Exercices de maths
Chaque exercice est contenu dans un fichier du répertoire ```src/```.

Pour insérer un exercice dans un document .tex, insérer le préambule minimal ou recopier et adapter son contenu : 

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
\uuid{}
\titre{}
\theme{}
\auteur{}
\organisation{}

\contenu{
  \texte{}
  \question{}
  \reponse{}
}
```

Les questions /réponses peuvent être agencées par exemple dans une structure enumerate.

## sortie pdf
Dans le répertoire /pdf, on trouve :
- latex : chaque exercice est appelé dans un fichier compilable (standalone) individuel
- pdf : le résultat après exécution de pdflatex
