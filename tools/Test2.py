import os

def add_contenu_command(filepath):
    with open(filepath, 'r') as file:
        lines = file.readlines()

    # Vérifie si la commande \contenu{...} est déjà présente
    contains_contenu = any(r'\contenu{' in line for line in lines)
    
    if not contains_contenu:
        # Trouve l'index de la ligne contenant \organisation{...}
        org_index = next((i for i, line in enumerate(lines) if r'\organisation{' in line), None)
        
        if org_index is not None:
            # Insère la commande \contenu{ après \organisation{...}
            lines.insert(org_index + 1, r'\contenu{' + '\n')
            # Ajoute le caractère } à la fin du fichier
            lines.append('}\n')

            with open(filepath, 'w') as file:
                file.writelines(lines)

# Parcourir tous les fichiers .tex dans le répertoire src
script_directory = os.path.dirname(os.path.abspath(__file__))
parent_directory = os.path.join(script_directory, os.pardir)
directory = os.path.join(parent_directory, 'src')
print(directory)

for filename in os.listdir(directory):
    if filename.endswith('.tex'):
        filepath = os.path.join(directory, filename)
        add_contenu_command(filepath)
