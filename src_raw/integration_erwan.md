Voici la conversion des exercices au format LaTeX demandé. Je vais les traiter un par un, en respectant strictement le contenu original et en utilisant les balises appropriées.

---

### Exercice 1
```latex
\uuid{Ex1A}
\titre{Limite d'une suite et intégrale de Riemann}
\niveau{MPSI}
\module{Analyse}
\chapitre{Intégration}
\sousChapitre{Intégrale de Riemann}
\theme{suite, logarithme, intégration par parties}
\auteur{}
\datecreate{2026-02-10}
\organisation{AMSCC}
\difficulte{3}

\contenu{
    \texte{Pour \( n \in \mathbb{N}^* \), on pose: \( u_n = \prod_{k=1}^{n} \left(1 + \frac{k^2}{n^2}\right)^{\frac{1}{n}} \) et \( v_n = \ln u_n \).}

    \begin{enumerate}
        \item \question{Montrer que \( v_n = \frac{1}{n} \cdot \sum_{k=1}^{n} \ln \left(1 + \frac{k^2}{n^2}\right) \).}
        \item \question{Exprimer la limite de \( v_n \) (quand \( n \to +\infty \)) sous la forme d'une intégrale définie et calculer cette intégrale. On pourra utiliser une intégration par parties.}
        \item \question{En déduire \( \lim_{n \to +\infty} u_n \).}
    \end{enumerate}
}
```

---

### Exercice 2
```latex
\uuid{Ex2B}
\titre{Limite d'une somme de Riemann}
\niveau{MPSI}
\module{Analyse}
\chapitre{Intégration}
\sousChapitre{Intégrale de Riemann}
\theme{somme de Riemann, limite}
\auteur{}
\datecreate{2026-02-10}
\organisation{AMSCC}
\difficulte{3}

\contenu{
    \question{En utilisant les sommes de Riemann, déterminer \( \lim_{n \to +\infty} \sum_{k=1}^{2n} \frac{k}{k^2 + n^2} \).}
}
```

---

### Exercice 3
```latex
\uuid{Ex3C}
\titre{Primitives de fonctions}
\niveau{MPSI}
\module{Analyse}
\chapitre{Intégration}
\sousChapitre{Primitives}
\theme{exponentielle, trigonométrie, racine carrée}
\auteur{}
\datecreate{2026-02-10}
\organisation{AMSCC}
\difficulte{2}

\contenu{
    \texte{Déterminer toutes les primitives des fonctions suivantes :}
    \begin{enumerate}
        \item \question{\( f(x) = \frac{e^{3x}}{1 + e^{3x}} \)}
        \item \question{\( g(x) = \cos(x) \cdot \sin^2(x) \)}
        \item \question{\( h(x) = 3x\sqrt{1 + x^2} \)}
    \end{enumerate}
}
```

---
### Exercice 4
```latex
\uuid{Ex4D}
\titre{Calcul d'intégrales définies}
\niveau{MPSI}
\module{Analyse}
\chapitre{Intégration}
\sousChapitre{Intégrale de Riemann}
\theme{polynôme, puissance, fraction rationnelle}
\auteur{}
\datecreate{2026-02-10}
\organisation{AMSCC}
\difficulte{2}

\contenu{
    \texte{Calculer les intégrales suivantes :}
    \begin{enumerate}
        \item \question{\( I_1 = \int_{-1}^{1} \left(t^4 + t^{917}\right) dt \)}
        \item \question{\( I_2 = \int_{1}^{2} s^{\frac{4}{3}} ds \)}
        \item \question{\( I_3 = \int_{1}^{2} \frac{dt}{(t + 4)^3} \)}
        \item \question{\( I_4 = \int_{1}^{2} \frac{\left(\sqrt{x}\right)^3}{x^4} \cdot \frac{1}{\sqrt[3]{x^2}} dx \)}
    \end{enumerate}
}
```

---
### Exercice 5
```latex
\uuid{Ex5E}
\titre{Calcul d'intégrales par reconnaissance de dérivées}
\niveau{MPSI}
\module{Analyse}
\chapitre{Intégration}
\sousChapitre{Intégrale de Riemann}
\theme{trigonométrie, exponentielle, logarithme}
\auteur{}
\datecreate{2026-02-10}
\organisation{AMSCC}
\difficulte{3}

\contenu{
    \texte{Calculer les intégrales suivantes. On pourra reconnaître des dérivées de fonctions composées :}
    \begin{enumerate}
        \item \question{\( I_1 = \int_{0}^{\frac{\pi}{3}} (1 - \cos(3x)) dx \)}
        \item \question{\( I_2 = \int_{0}^{\sqrt{\pi}} 2x \sin(x^2) dx \)}
        \item \question{\( I_3 = \int_{1}^{2} \frac{1}{x} (\ln x)^{\frac{1}{2}} dx \)}
    \end{enumerate}
}
```

---
### Exercice 6
```latex
\uuid{Ex6F}
\titre{Calcul d'intégrales par primitivation}
\niveau{MPSI}
\module{Analyse}
\chapitre{Intégration}
\sousChapitre{Primitives}
\theme{polynôme, exponentielle}
\auteur{}
\datecreate{2026-02-10}
\organisation{AMSCC}
\difficulte{2}

\contenu{
    \texte{Calculer les intégrales suivantes par primitivation :}
    \begin{enumerate}
        \item \question{\( I_1 = \int_{1}^{2} \left(s^3 + \frac{1}{s^2}\right) ds \)}
        \item \question{\( I_2 = \int_{0}^{2} x e^{-x^2 + 1} dx \)}
    \end{enumerate}
}
```

---
### Exercice 7
```latex
\uuid{Ex7G}
\titre{Intégration par parties}
\niveau{MPSI}
\module{Analyse}
\chapitre{Intégration}
\sousChapitre{Intégration par parties}
\theme{logarithme, racine carrée}
\auteur{}
\datecreate{2026-02-10}
\organisation{AMSCC}
\difficulte{3}

\contenu{
    \question{En intégrant par parties, calculer : \( \int_0^1 \ln \left(x + \sqrt{x^2 + 1}\right) dx \)}
}
```

---
### Exercice 8
```latex
\uuid{Ex8H}
\titre{Primitives de fonctions rationnelles}
\niveau{MPSI}
\module{Analyse}
\chapitre{Intégration}
\sousChapitre{Intégration par parties}
\theme{fonction rationnelle, décomposition en éléments simples}
\auteur{}
\datecreate{2026-02-10}
\organisation{AMSCC}
\difficulte{4}

\contenu{
    \texte{L'objectif de cet exercice est de trouver l'expression explicite des primitives de \( x \to \frac{1}{(x^2 + 1)^2} \). On pose \( I_1 = \int \frac{1}{x^2 + 1} dx \) et \( I_2 = \int \frac{1}{(x^2 + 1)^2} dx \).}
    \begin{enumerate}
        \item \question{En intégrant \( I_1 \) par parties, donner une relation entre \( I_2 \) et \( I_1 \). On pourra écrire \( \frac{x^2}{(1 + x^2)^2} = \frac{a}{1 + x^2} + \frac{b}{(1 + x^2)^2} \), où \( a \) et \( b \) sont deux réels à préciser.}
        \item \question{En déduire l'expression de \( I_2 \).}
    \end{enumerate}
}
```

---
### Exercice 9
```latex
\uuid{Ex9I}
\titre{Calcul d'intégrales par primitivation et intégration par parties}
\niveau{MPSI}
\module{Analyse}
\chapitre{Intégration}
\sousChapitre{Intégration par parties}
\theme{logarithme, exponentielle, trigonométrie}
\auteur{}
\datecreate{2026-02-10}
\organisation{AMSCC}
\difficulte{3}

\contenu{
    \texte{Calculer les intégrales suivantes par primitivation, intégration par parties :}
    \begin{enumerate}
        \item \question{\( I_1 = \int_{1}^{2} \frac{\ln t}{t} dt \)}
        \item \question{\( I_2 = \int_{2}^{e} \frac{1}{t \ln^2 t} dt \)}
        \item \question{\( I_3 = \int_{1}^{2} \frac{e^t}{e^t - 2} dt \)}
        \item \question{\( I_4 = \int_{0}^{1} \frac{1}{1 + e^t} dt \)}
        \item \question{\( I_5 = \int_{0}^{1} \frac{\arctan t}{1 + t^2} dt \)}
        \item \question{\( I_6 = \int_{\frac{3\pi}{4}}^{\pi} \tan t \, dt \)}
        \item \question{\( I_7 = \int_{0}^{1} t^2 \ln t \, dt \)}
        \item \question{\( I_8 = \int_{0}^{\frac{\pi}{4}} \frac{\sin t}{\cos^2 t} dt \)}
    \end{enumerate}
}
```

---
### Exercice 10
```latex
\uuid{Ex10J}
\titre{Décomposition en éléments simples et intégration}
\niveau{MPSI}
\module{Analyse}
\chapitre{Intégration}
\sousChapitre{Intégration par parties}
\theme{fonction rationnelle, logarithme}
\auteur{}
\datecreate{2026-02-10}
\organisation{AMSCC}
\difficulte{3}

\contenu{
    \texte{On considère la fonction \( f(x) = \frac{1}{x(x + 1)} \).}
    \begin{enumerate}
        \item \question{Déterminer deux réels \( a \) et \( b \) tels que pour tout \( x \in \mathbb{R} \setminus \{0; -1\} \) on ait : \( f(x) = \frac{a}{x} + \frac{b}{x + 1} \).}
        \item \question{Déduire de la question précédente la valeur de l'intégrale \( J = \int_{1}^{2} f(x) dx \).}
        \item \question{En intégrant par parties, calculer l'intégrale \( I = \int_{1}^{2} \frac{\ln(1 + t)}{t^2} dt \).}
    \end{enumerate}
}
```

---
