"""
Tests des fichiers de préambules
Vérifie que les préambules LaTeX sont valides
"""
import pytest
import subprocess
import shutil
from pathlib import Path


@pytest.mark.fast
class TestPreambles:
    """Tests des préambules LaTeX"""

    @pytest.fixture(scope="class")
    def chktex_available(self):
        """Vérifie que chktex est disponible"""
        return shutil.which('chktex') is not None

    def test_all_preambles_exist(self, preambles_dir):
        """Vérifie que tous les préambules attendus existent"""
        expected_preambles = [
            'general.tex',
            'print.tex',
            'macros.tex',
            'python.tex'
        ]

        for preamble in expected_preambles:
            preamble_path = preambles_dir / preamble
            assert preamble_path.exists(), f"Préambule manquant: {preamble}"

    @pytest.mark.parametrize('preamble_file', pytest.lazy_fixture('all_preamble_files'))
    def test_preamble_syntax(self, preamble_file, chktex_available):
        """Vérifie la syntaxe de chaque préambule avec chktex"""
        if not chktex_available:
            pytest.skip("chktex n'est pas installé")

        # Chercher le fichier de config .chktexrc
        config_file = Path(__file__).parent / "config" / ".chktexrc"

        cmd = ['chktex', '-q']
        if config_file.exists():
            cmd.extend(['-l', str(config_file)])
        cmd.append(str(preamble_file))

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )

            # Afficher warnings sans bloquer
            if result.returncode != 0 and result.stdout:
                warnings = [line for line in result.stdout.split('\n') if line.strip()]
                if warnings:
                    print(f"\n⚠️  Warnings chktex pour {preamble_file.name}:")
                    for warning in warnings[:3]:
                        print(f"  {warning}")

        except subprocess.TimeoutExpired:
            pytest.fail(f"Timeout lors de l'exécution de chktex sur {preamble_file.name}")
        except Exception as e:
            pytest.fail(f"Erreur lors de l'exécution de chktex sur {preamble_file.name}: {e}")

    @pytest.mark.parametrize('preamble_file', pytest.lazy_fixture('all_preamble_files'))
    def test_preamble_balanced_braces(self, preamble_file):
        """Vérifie que les accolades sont équilibrées dans les préambules"""
        content = preamble_file.read_text(encoding='utf-8')

        open_braces = content.count('{')
        close_braces = content.count('}')

        assert open_braces == close_braces, (
            f"Accolades non équilibrées dans {preamble_file.name}: "
            f"{open_braces} {{ et {close_braces} }}"
        )

    def test_no_conflicting_packages(self, preambles_dir):
        """
        Vérifie qu'il n'y a pas de packages en conflit évidents
        (test basique, pas exhaustif)
        """
        import re

        # Lire tous les préambules
        all_packages = []

        for preamble_file in preambles_dir.glob("*.tex"):
            content = preamble_file.read_text(encoding='utf-8')

            # Trouver tous les \usepackage
            packages = re.findall(r'\\usepackage(?:\[[^\]]*\])?\{([^}]+)\}', content)

            for pkg_list in packages:
                # Séparer si plusieurs packages dans une commande
                pkgs = [p.strip() for p in pkg_list.split(',')]
                all_packages.extend(pkgs)

        # Conflits connus (liste non exhaustive)
        conflicting_pairs = [
            ('inputenc', 'inputenx'),
            ('times', 'mathptmx'),
            ('a4', 'a4wide'),
        ]

        conflicts = []
        for pkg1, pkg2 in conflicting_pairs:
            if pkg1 in all_packages and pkg2 in all_packages:
                conflicts.append(f"{pkg1} et {pkg2}")

        assert not conflicts, (
            f"Packages potentiellement en conflit détectés: {', '.join(conflicts)}"
        )

    def test_preambles_summary(self, all_preamble_files):
        """
        Test récapitulatif : affiche des informations sur les préambules
        N'échoue pas, juste informatif
        """
        import re

        total = len(all_preamble_files)
        total_packages = set()
        total_commands = set()

        for preamble_file in all_preamble_files:
            content = preamble_file.read_text(encoding='utf-8')

            # Compter packages
            packages = re.findall(r'\\usepackage(?:\[[^\]]*\])?\{([^}]+)\}', content)
            for pkg_list in packages:
                pkgs = [p.strip() for p in pkg_list.split(',')]
                total_packages.update(pkgs)

            # Compter nouvelles commandes
            commands = re.findall(r'\\newcommand\{\\([^}]+)\}', content)
            total_commands.update(commands)

        print(f"\n=== Statistiques des préambules ===")
        print(f"Nombre de préambules: {total}")
        print(f"Packages uniques: {len(total_packages)}")
        print(f"Commandes définies: {len(total_commands)}")
        print(f"\nPackages principaux: {', '.join(sorted(list(total_packages))[:10])}")
