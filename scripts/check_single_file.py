#!/usr/bin/env python3
"""
Validation rapide d'un seul fichier

Usage:
  python scripts/check_single_file.py src/6Wjb.tex
  python scripts/check_single_file.py 6Wjb
"""

import sys
from pathlib import Path

# Ajouter le répertoire parent au path pour les imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from tests.utils.parser import ExerciseParser
    from tests.utils.validators import MetadataValidator
except ImportError as e:
    print(f"Erreur d'import: {e}")
    print("Assurez-vous que le script est exécuté depuis la racine du projet")
    sys.exit(1)


def main():
    if len(sys.argv) != 2:
        print("Usage: python scripts/check_single_file.py <fichier.tex>")
        print("   ou: python scripts/check_single_file.py <UUID>")
        print("\nExemples:")
        print("  python scripts/check_single_file.py src/6Wjb.tex")
        print("  python scripts/check_single_file.py 6Wjb")
        sys.exit(1)

    # Déterminer le chemin du fichier
    arg = sys.argv[1]
    repo_root = Path(__file__).parent.parent

    if arg.endswith('.tex'):
        # Chemin complet fourni
        file_path = Path(arg)
        if not file_path.is_absolute():
            file_path = repo_root / file_path
    else:
        # Seulement l'UUID fourni
        file_path = repo_root / "src" / f"{arg}.tex"

    if not file_path.exists():
        print(f"❌ Fichier introuvable: {file_path}")
        sys.exit(1)

    try:
        from colorama import Fore, Style, init
        init(autoreset=True)
    except ImportError:
        # Fallback sans couleurs
        class Fore:
            GREEN = RED = YELLOW = ''
        class Style:
            BRIGHT = RESET_ALL = ''

    # Parser
    try:
        parser = ExerciseParser(file_path)
        metadata = parser.parse()
    except Exception as e:
        print(f"{Fore.RED}❌ Erreur de parsing: {e}")
        sys.exit(1)

    # Valider
    validator = MetadataValidator()
    results = validator.validate_all(metadata)

    # Afficher
    print(f"\n{Style.BRIGHT}📄 Validation de {file_path.name}{Style.RESET_ALL}")
    print("=" * 60)
    print(f"\n{Style.BRIGHT}UUID:{Style.RESET_ALL} {metadata.get('uuid', 'N/A')}")
    print(f"{Style.BRIGHT}Titre:{Style.RESET_ALL} {metadata.get('titre', 'N/A')[:60]}...")

    print(f"\n{Style.BRIGHT}Résultats de validation:{Style.RESET_ALL}\n")

    has_errors = False
    has_warnings = False

    for field, result in results.items():
        if result.valid:
            print(f"{Fore.GREEN}✅ {field:15s} : OK")
        else:
            # Déterminer si c'est une erreur ou un warning
            if field in ['uuid', 'titre', 'niveau', 'datecreate', 'contenu']:
                print(f"{Fore.RED}❌ {field:15s} : {result.message}")
                has_errors = True
            else:
                print(f"{Fore.YELLOW}⚠️  {field:15s} : {result.message}")
                has_warnings = True

    # Afficher métadonnées supplémentaires
    print(f"\n{Style.BRIGHT}Métadonnées:{Style.RESET_ALL}")
    print(f"  Niveau: {metadata.get('niveau', 'N/A')}")
    print(f"  Module: {metadata.get('module', 'N/A')}")
    print(f"  Chapitre: {metadata.get('chapitre', 'N/A')}")
    print(f"  Date création: {metadata.get('datecreate', 'N/A')}")
    print(f"  Difficulté: {metadata.get('difficulte', 'N/A') or 'Non spécifiée'}")
    print(f"  Organisation: {metadata.get('organisation', 'N/A') or 'Non spécifiée'}")

    # Conclusion
    print("\n" + "=" * 60)
    if not has_errors and not has_warnings:
        print(f"{Fore.GREEN}{Style.BRIGHT}✅ Tous les tests passent !{Style.RESET_ALL}")
        sys.exit(0)
    elif has_errors:
        print(f"{Fore.RED}{Style.BRIGHT}❌ Le fichier contient des erreurs{Style.RESET_ALL}")
        sys.exit(0)  # Exit 0 car mode warnings seulement
    else:
        print(f"{Fore.YELLOW}{Style.BRIGHT}⚠️  Le fichier contient des avertissements{Style.RESET_ALL}")
        sys.exit(0)  # Exit 0 car mode warnings seulement


if __name__ == '__main__':
    main()
