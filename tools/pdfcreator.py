# coding: utf8
import os, sys, subprocess

# créer le fichier sources d'une planche, en donnant une liste de numéros à 4 chiffres

def createlatex(directory, filename):
        texte = '\\documentclass[preview,border=2pt]{standalone} \n'
        texte += '\\usepackage{etex} \n \\usepackage[french]{babel} \n \\usepackage[autolanguage]{numprint}'
    #    texte += '\\usepackage[utf8]{inputenc} \n \\usepackage[T1]{fontenc} \n \\usepackage[frenchb]{babel} \n'
        texte += '\\newcommand{\\path}{../../} \n \\input{\\path_preambules/general.tex} \n \\input{\\path_preambules/print.tex} \n \\input{\\path_preambules/macros.tex} \n \\setboolean{solution}{true} \n'
        texte += '\n \\begin{document}'
        texte += '\n \\insertexo{'+str(filename[:len(filename)-4])+'}{true}{true}{false}{} \n'
        texte += '\\end{document}'
        latexfile = open(os.path.join(directory,filename),"w")
        latexfile.write(texte)
        latexfile.close()

directory_compile = './pdf/latex'  #fichiers compilables en standalone
directory_src = './src'                #fichiers sources des exercices (non compilables)
directory_pdf = './pdf/pdf'        #fichier pdf compilé

for filename in os.listdir(directory_src):
    if filename[-4:] == ".tex":
        filename = filename[:-4]
    file_pdf = os.path.join(directory_pdf, filename)+'.pdf'
    file_src = os.path.join(directory_src, filename)+'.tex'
    file_compile = os.path.join(directory_compile, filename)+'.tex'
    # checking if it is a file
    if os.path.isfile(file_compile) == 0:
        createlatex(directory_compile,filename+'.tex')
        print(filename+'.tex is created in compilable folder')
    if os.path.isfile(file_pdf) == 0:
        print('compiling...')
        os.system('xelatex ' + ' -synctex=1 -interaction=nonstopmode -output-directory=' + directory_pdf + ' ' + os.path.join(directory_compile, filename+'.tex'))
        print('compiling ended')
    time_pdf = os.path.getmtime(file_pdf)
    time_src = os.path.getmtime(file_src)
    if time_src < time_pdf:
        print(filename +' has been updated but not compiled')
        print('compiling...')
        os.system('xelatex ' + ' -synctex=1 -interaction=nonstopmode -output-directory=' + directory_pdf + ' ' + os.path.join(directory_compile, filename+'.tex'))
        print('compiling ended')
