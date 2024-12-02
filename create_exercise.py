import os
import random
import string
import subprocess

def generate_unique_id(existing_ids):
    while True:
        # Génère un identifiant alphanumérique de 4 caractères
        unique_id = ''.join(random.choices(string.ascii_letters + string.digits, k=4))
        if unique_id not in existing_ids:
            return unique_id

def get_existing_ids(directory):
    existing_ids = set()
    for filename in os.listdir(directory):
        if filename.endswith('.tex'):
            # Supposons que l'identifiant est dans le nom du fichier après un underscore
            parts = filename.split('_')
            if len(parts) > 1:
                id_part = parts[1].split('.')[0]
                existing_ids.add(id_part)
    return existing_ids

def create_exercise_file(template_path, output_directory, unique_id):
    # Lit le template LaTeX
    with open(template_path, 'r') as template_file:
        content = template_file.read()
    # Remplace les espaces réservés par les valeurs réelles
    content = content.replace('{ID}', unique_id)
    # Vous pouvez ajouter plus de remplacements ici si nécessaire
    # Par exemple, demander à l'utilisateur d'entrer l'énoncé de l'exercice
    enonce = input("Entrez le titre de l'exercice:\n")
    content = content.replace('{TITRE}', enonce)
    # Enregistre le nouveau fichier LaTeX
    output_filename = f"{unique_id}.tex"
    output_path = os.path.join(output_directory, output_filename)
    with open(output_path, 'w') as output_file:
        output_file.write(content)
    print(f"Fichier créé : {output_path}")
    return output_path

def git_add_and_commit(file_path, message):
    subprocess.run(['git', 'add', file_path])
    subprocess.run(['git', 'commit', '-m', message])
    print("Fichier ajouté au dépôt git avec succès.")

def main():
    # Définissez les chemins appropriés
    exercises_directory = './src'
    template_path = './template_exercice.tex'
    # Vérifie que le répertoire des exercices existe
    if not os.path.exists(exercises_directory):
        os.makedirs(exercises_directory)
    # Récupère les identifiants existants
    existing_ids = get_existing_ids(exercises_directory)
    # Génère un identifiant unique
    unique_id = generate_unique_id(existing_ids)
    # Crée le fichier de l'exercice
    output_path = create_exercise_file(template_path, exercises_directory, unique_id)
    # Ajoute le fichier au dépôt git et effectue un commit
    git_add_and_commit(output_path, f'Ajout de l\'exercice {unique_id}')

if __name__ == '__main__':
    main()
