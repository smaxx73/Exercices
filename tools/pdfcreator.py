# coding: utf8
import os, sys, subprocess

# créer le fichier sources d'une planche, en donnant une liste de numéros à 4 chiffres

def createlatex(directory, filename):
        texte = '\\documentclass[preview,border=2pt]{standalone} \n'
        texte += '\\usepackage{etex} \n \\usepackage[french]{babel} \n \\usepackage[autolanguage]{numprint} \n \\usepackage{eurosym} \n'
    #    texte += '\\usepackage[utf8]{inputenc} \n \\usepackage[T1]{fontenc} \n \\usepackage[frenchb]{babel} \n'
        texte += '\\newcommand{\\path}{../../} \n \\input{\\path_preambules/general.tex} \n \\input{\\path_preambules/print.tex} \n \\input{\\path_preambules/macros.tex} \n \\setboolean{solution}{true} \n'
        texte += '\n \\begin{document}'
        texte += '\n \\insertexobis{'+str(filename[:len(filename)-4])+'}{true}{true}{false}{} \n'
        texte += '\\end{document}'
        latexfile = open(os.path.join(directory,filename),"w")
        latexfile.write(texte)
        latexfile.close()

script_directory = os.path.dirname(os.path.abspath(__file__))
parent_directory = os.path.join(script_directory, os.pardir)

def compile_latex(file_path, output_directory):
    os.system('xelatex ' + '--shell-escape -synctex=0 -interaction=nonstopmode -output-directory=' + output_directory + ' ' + file_path)

def should_compile(file_src, file_pdf):
    """Determine if a file should be compiled based on its last modification time."""
    if not os.path.isfile(file_pdf):
        return True

    time_pdf = os.path.getmtime(file_pdf)
    time_src = os.path.getmtime(file_src)

    return time_src > time_pdf

def main(directory_src, directory_pdf, directory_compile):
    for filename in os.listdir(directory_src):
        if filename.endswith(".tex"):
            base_filename = filename[:-4]
            file_pdf = os.path.join(directory_pdf, base_filename + '.pdf')
            file_src = os.path.join(directory_src, base_filename + '.tex')
            file_compile = os.path.join(directory_compile, base_filename + '.tex')

            # checking if it is a file
            if not os.path.isfile(file_compile):
                createlatex(directory_compile, base_filename + '.tex')
                print(base_filename + '.tex is created in compilable folder')

            if should_compile(file_src, file_pdf):
                print(base_filename + ' has been updated or not compiled')
                print('compiling...')
                compile_latex(file_compile, directory_pdf)
                print('compiling ended')

if __name__ == "__main__":
    # Remplacez ces chemins par les chemins appropriés
    directory_compile = os.path.join(parent_directory, 'pdf/latex') 
    directory_src = os.path.join(parent_directory, 'src')  
    directory_pdf = os.path.join(parent_directory, 'pdf/pdf') 
    
    # test sur un seul fichier
    filename = 'kJz6.tex'
    createlatex(directory_compile, filename)
    print(os.path.join(directory_compile, filename))
    print(directory_pdf)
    # compile_latex(os.path.join(directory_compile, filename), directory_pdf)
    # os.system("xelatex --shell-escape -synctex=0 -interaction=nonstopmode -output-directory=/home/maxime/Documents/Exercices/tools/../pdf/pdf /home/maxime/Documents/Exercices/tools/../pdf/latex/kJz6.tex")
    # main(directory_src, directory_pdf, directory_compile)


def compile_latex_file(filename):
    subprocess.call(["xelatex", "--shell-escape", "-synctex=0", "-interaction=nonstopmode", "-output-directory=/home/maxime/Documents/Exercices/tools/../pdf/pdf", filename])

compile_latex_file("/home/maxime/Documents/Exercices/tools/../pdf/latex/kJz6.tex")
