# Exercices
## Exercices de maths
Chaque exercice est contenu dans un fichier du répertoire ```src/```.

Pour insérer un exercice dans un document .tex, insérer le préambule minimal : 

```\input{preambule_minimal}```

et dans le corps du document, utiliser la commande

```\insertexo{...}```

avec l'identifiant de l'exercice comme argument. 

## Champs dans un exercice
Chaque exercice a la structure suivante : 

```\titre{}
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
