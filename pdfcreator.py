# coding: utf8
import os, sys, subprocess

# créer le fichier sources d'une planche, en donnant une liste de numéros à 4 chiffres

def createlatex(directory, filename):
        texte = '\\documentclass[preview,border=2pt]{standalone} \n \\usepackage[utf8]{inputenc} \n \\usepackage[T1]{fontenc} \n \\usepackage[frenchb]{babel} \n'
        texte += '\\newcommand{\\path}{../../} \n \\input{\\path_preambules/general.tex} \n \\input{\\path_preambules/print.tex} \n \\input{\\path_preambules/macros.tex} \n \\setboolean{solution}{true} \n'
        texte += '\n \\begin{document}'
        texte += '\n \\insertexo{'+str(filename[:len(filename)-4])+'} \n'
        texte += '\\end{document}'
        latexfile = open(os.path.join(directory,filename),"w")
        latexfile.write(texte)
        latexfile.close()

directory_compile = 'compile/latex'
directory_src = 'src'
directory_pdf = 'compile/pdf'

for filename in os.listdir(directory_src):
    f = os.path.join(directory_src, filename)
    # checking if it is a file
    if os.path.isfile(f):
        if f[-4:] == '.tex':
            createlatex(directory_compile,filename)  #on crée le fichier compilable standalone pour chaque exercice
            os.system('pdflatex ' + ' -synctex=1 -interaction=nonstopmode -output-directory=' + directory_pdf + ' ' + os.path.join(directory_compile, filename))
