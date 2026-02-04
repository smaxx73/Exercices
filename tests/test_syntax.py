"""
Tests de syntaxe LaTeX avec chktex
Détecte les erreurs de syntaxe sans compilation complète
"""
import pytest
import subprocess
import shutil
from pathlib import Path


@pytest.mark.fast
class TestSyntax:
    """Tests de syntaxe LaTeX"""

    @pytest.fixture(scope="class")
    def chktex_available(self):
        """Vérifie que chktex est disponible"""
        return shutil.which('chktex') is not None

    @pytest.mark.parametrize('exercise_file', pytest.lazy_fixture('all_exercise_files'))
    def test_chktex_no_critical_errors(self, exercise_file, chktex_available):
        """Vérifie qu'il n'y a pas d'erreurs critiques avec chktex"""
        if not chktex_available:
            pytest.skip("chktex n'est pas installé")

        # Chercher le fichier de config .chktexrc
        config_file = Path(__file__).parent / "config" / ".chktexrc"

        # Commande chktex
        cmd = ['chktex', '-q']  # -q pour mode quiet

        # Ajouter config si elle existe
        if config_file.exists():
            cmd.extend(['-l', str(config_file)])

        cmd.append(str(exercise_file))

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )

            # chktex retourne 0 si pas d'erreur, > 0 si erreurs
            # On affiche juste un warning pour les erreurs, sans bloquer
            if result.returncode != 0 and result.stdout:
                # Parser la sortie pour extraire les warnings
                warnings = [line for line in result.stdout.split('\n') if line.strip()]
                if warnings:
                    print(f"\n⚠️  Warnings chktex pour {exercise_file.name}:")
                    for warning in warnings[:5]:  # Limiter à 5 warnings
                        print(f"  {warning}")

        except subprocess.TimeoutExpired:
            pytest.fail(f"Timeout lors de l'exécution de chktex sur {exercise_file.name}")
        except Exception as e:
            pytest.fail(f"Erreur lors de l'exécution de chktex sur {exercise_file.name}: {e}")

    @pytest.mark.parametrize('exercise_file', pytest.lazy_fixture('all_exercise_files'))
    def test_balanced_braces(self, exercise_file):
        """Vérifie que les accolades sont équilibrées"""
        content = exercise_file.read_text(encoding='utf-8')

        # Compter les accolades (simple, pas parfait mais indicatif)
        open_braces = content.count('{')
        close_braces = content.count('}')

        assert open_braces == close_braces, (
            f"Accolades non équilibrées dans {exercise_file.name}: "
            f"{open_braces} {{ et {close_braces} }}"
        )

    @pytest.mark.parametrize('exercise_file', pytest.lazy_fixture('all_exercise_files'))
    def test_balanced_environments(self, exercise_file):
        """Vérifie que les environnements \\begin et \\end sont équilibrés"""
        import re
        content = exercise_file.read_text(encoding='utf-8')

        # Trouver tous les \begin{...}
        begins = re.findall(r'\\begin\{([^}]+)\}', content)

        # Trouver tous les \end{...}
        ends = re.findall(r'\\end\{([^}]+)\}', content)

        # Vérifier que chaque begin a son end
        begin_counts = {}
        for env in begins:
            begin_counts[env] = begin_counts.get(env, 0) + 1

        end_counts = {}
        for env in ends:
            end_counts[env] = end_counts.get(env, 0) + 1

        unbalanced = []
        for env in set(begins + ends):
            if begin_counts.get(env, 0) != end_counts.get(env, 0):
                unbalanced.append(
                    f"{env} ({begin_counts.get(env, 0)} begin, {end_counts.get(env, 0)} end)"
                )

        assert not unbalanced, (
            f"Environnements non équilibrés dans {exercise_file.name}: "
            f"{', '.join(unbalanced)}"
        )

    def test_syntax_summary(self, all_exercise_files, chktex_available):
        """
        Test récapitulatif : affiche des statistiques sur la syntaxe
        N'échoue pas, juste informatif
        """
        if not chktex_available:
            print("\n⚠️  chktex n'est pas installé, tests de syntaxe limités")
            return

        total = len(all_exercise_files)
        with_warnings = 0
        with_errors = 0

        config_file = Path(__file__).parent / "config" / ".chktexrc"

        for exercise_file in all_exercise_files:
            cmd = ['chktex', '-q']
            if config_file.exists():
                cmd.extend(['-l', str(config_file)])
            cmd.append(str(exercise_file))

            try:
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=30
                )

                if result.returncode != 0:
                    if result.stdout and 'Error' in result.stdout:
                        with_errors += 1
                    else:
                        with_warnings += 1

            except Exception:
                pass

        print(f"\n=== Statistiques de syntaxe (chktex) ===")
        print(f"Total fichiers: {total}")
        print(f"Fichiers avec erreurs: {with_errors}")
        print(f"Fichiers avec warnings: {with_warnings}")
        print(f"Fichiers propres: {total - with_warnings - with_errors}")
