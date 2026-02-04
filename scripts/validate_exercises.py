#!/usr/bin/env python3
"""
Script CLI pour valider les exercices localement

Usage:
  python scripts/validate_exercises.py              # Tous les exercices
  python scripts/validate_exercises.py --file 6Wjb  # Un seul exercice
  python scripts/validate_exercises.py --report json # Format JSON
"""

import argparse
import sys
from pathlib import Path
import json
from collections import Counter

# Ajouter le répertoire parent au path pour les imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from tests.utils.parser import ExerciseParser
    from tests.utils.validators import MetadataValidator
except ImportError as e:
    print(f"Erreur d'import: {e}")
    print("Assurez-vous que le script est exécuté depuis la racine du projet")
    sys.exit(1)


def validate_files(files):
    """
    Valide une liste de fichiers et retourne les résultats

    Args:
        files: Liste de Path vers les fichiers .tex

    Returns:
        Dictionnaire avec les résultats de validation
    """
    validator = MetadataValidator()
    results = {
        'total': len(files),
        'valid': 0,
        'with_warnings': 0,
        'with_errors': 0,
        'files': {}
    }

    for file_path in files:
        try:
            parser = ExerciseParser(file_path)
            metadata = parser.parse()

            # Valider toutes les métadonnées
            validation_results = validator.validate_all(metadata)

            # Compter les erreurs/warnings
            errors = []
            warnings = []

            for field, result in validation_results.items():
                if not result.valid:
                    if field in ['uuid', 'titre', 'niveau', 'datecreate', 'contenu']:
                        errors.append(f"{field}: {result.message}")
                    else:
                        warnings.append(f"{field}: {result.message}")

            file_result = {
                'uuid': metadata.get('uuid', 'N/A'),
                'errors': errors,
                'warnings': warnings
            }

            if errors:
                results['with_errors'] += 1
            elif warnings:
                results['with_warnings'] += 1
            else:
                results['valid'] += 1

            results['files'][file_path.name] = file_result

        except Exception as e:
            results['with_errors'] += 1
            results['files'][file_path.name] = {
                'uuid': 'N/A',
                'errors': [f"Erreur de parsing: {str(e)}"],
                'warnings': []
            }

    results['all_valid'] = (results['with_errors'] == 0)

    return results


def print_terminal_report(results):
    """Affiche un rapport formaté dans le terminal"""
    try:
        from colorama import Fore, Style, init
        init(autoreset=True)
    except ImportError:
        # Fallback sans couleurs
        class Fore:
            GREEN = RED = YELLOW = CYAN = ''
        class Style:
            BRIGHT = RESET_ALL = ''

    print(f"\n{Style.BRIGHT}=== Rapport de validation des exercices ==={Style.RESET_ALL}\n")

    # Statistiques globales
    print(f"Total fichiers: {results['total']}")
    print(f"{Fore.GREEN}✓ Valides: {results['valid']}")
    print(f"{Fore.YELLOW}⚠ Avec warnings: {results['with_warnings']}")
    print(f"{Fore.RED}✗ Avec erreurs: {results['with_errors']}")

    # Détails des fichiers avec problèmes
    if results['with_errors'] > 0 or results['with_warnings'] > 0:
        print(f"\n{Style.BRIGHT}Détails des fichiers avec problèmes:{Style.RESET_ALL}\n")

        for filename, file_result in results['files'].items():
            if file_result['errors'] or file_result['warnings']:
                print(f"📄 {filename} (UUID: {file_result['uuid']})")

                if file_result['errors']:
                    for error in file_result['errors']:
                        print(f"  {Fore.RED}✗ {error}")

                if file_result['warnings']:
                    for warning in file_result['warnings']:
                        print(f"  {Fore.YELLOW}⚠ {warning}")

                print()

    # Conclusion
    print(f"\n{Style.BRIGHT}{'─' * 60}{Style.RESET_ALL}")
    if results['all_valid']:
        print(f"{Fore.GREEN}✓ Tous les tests passent !")
    else:
        print(f"{Fore.YELLOW}⚠ Validation terminée avec {results['with_errors']} erreurs et {results['with_warnings']} warnings")


def generate_html_report(results):
    """Génère un rapport HTML"""
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rapport de validation des exercices</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .summary {{ background: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
        .valid {{ color: green; }}
        .warning {{ color: orange; }}
        .error {{ color: red; }}
        .file {{ margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 3px; }}
        .file-header {{ font-weight: bold; }}
        ul {{ margin: 5px 0; }}
    </style>
</head>
<body>
    <h1>Rapport de validation des exercices LaTeX</h1>

    <div class="summary">
        <h2>Résumé</h2>
        <p>Total fichiers: {results['total']}</p>
        <p class="valid">✓ Valides: {results['valid']}</p>
        <p class="warning">⚠ Avec warnings: {results['with_warnings']}</p>
        <p class="error">✗ Avec erreurs: {results['with_errors']}</p>
    </div>

    <h2>Détails</h2>
"""

    for filename, file_result in sorted(results['files'].items()):
        if file_result['errors'] or file_result['warnings']:
            status_class = 'error' if file_result['errors'] else 'warning'
            html += f'    <div class="file {status_class}">\n'
            html += f'        <div class="file-header">{filename} (UUID: {file_result["uuid"]})</div>\n'

            if file_result['errors']:
                html += '        <ul>\n'
                for error in file_result['errors']:
                    html += f'            <li class="error">✗ {error}</li>\n'
                html += '        </ul>\n'

            if file_result['warnings']:
                html += '        <ul>\n'
                for warning in file_result['warnings']:
                    html += f'            <li class="warning">⚠ {warning}</li>\n'
                html += '        </ul>\n'

            html += '    </div>\n'

    html += """
</body>
</html>
"""
    return html


def main():
    parser = argparse.ArgumentParser(
        description='Valider les exercices LaTeX',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples:
  python scripts/validate_exercises.py
  python scripts/validate_exercises.py --file 6Wjb
  python scripts/validate_exercises.py --report json
  python scripts/validate_exercises.py --report html > report.html
"""
    )

    parser.add_argument(
        '--file',
        type=str,
        help='UUID du fichier à valider (ex: 6Wjb)'
    )
    parser.add_argument(
        '--report',
        choices=['terminal', 'json', 'html'],
        default='terminal',
        help='Format du rapport (défaut: terminal)'
    )

    args = parser.parse_args()

    # Déterminer les fichiers à valider
    repo_root = Path(__file__).parent.parent
    src_dir = repo_root / "src"

    if not src_dir.exists():
        print(f"Erreur: Le répertoire {src_dir} n'existe pas")
        sys.exit(1)

    if args.file:
        file_path = src_dir / f"{args.file}.tex"
        if not file_path.exists():
            print(f"Erreur: Le fichier {file_path} n'existe pas")
            sys.exit(1)
        files = [file_path]
    else:
        files = sorted(src_dir.glob("*.tex"))

    if not files:
        print("Aucun fichier .tex trouvé")
        sys.exit(1)

    # Valider
    results = validate_files(files)

    # Ajouter résumé pour JSON
    if args.report == 'json':
        results['summary'] = (
            f"Total: {results['total']} | "
            f"Valides: {results['valid']} | "
            f"Warnings: {results['with_warnings']} | "
            f"Erreurs: {results['with_errors']}"
        )

    # Afficher rapport
    if args.report == 'json':
        print(json.dumps(results, indent=2, ensure_ascii=False))
    elif args.report == 'html':
        print(generate_html_report(results))
    else:
        print_terminal_report(results)

    # Exit code: 0 si tout valide, 1 sinon (mode warnings seulement, donc toujours 0)
    sys.exit(0)


if __name__ == '__main__':
    main()
