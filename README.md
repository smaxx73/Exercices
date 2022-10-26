# Exercices
## Exercices de maths
Chaque exercice est contenu dans un fichier du répertoire ```src/```.

Pour insérer un exercice dans un document .tex, insérer le préambule minimal ou recopier et adapter son contenu : 

```\input{preambule_minimal}```

et dans le corps du document, utiliser la commande

```\insertexo{...}{solution}{uuid}{lien}{numerotation}```

avec l'identifiant de l'exercice comme premier argument. ```solution```, ```uuid```, ```lien``` sont des booléens contrôlant l'affichage (ou non) des solutions, de l'identifiant de l'exercice et du lien vers la solution. Le dernier argument est le numéro de l'exercice.

## Champs dans un exercice
Chaque exercice a la structure suivante : 

```
\titre{}
\theme{}
\auteur{}
\organisation{}

\texte{}
\question{}
\reponse{}
```
## Compile
Dans le répertoire compile, on trouve :
- latex : chaque exercice est appelé dans un fichier compilable (standalone) individuel
- pdf : le résultat après exécution de pdflatex
