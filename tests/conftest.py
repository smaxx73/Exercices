"""
Configuration pytest et fixtures communes
"""
import pytest
from pathlib import Path


def pytest_configure(config):
    """Configuration globale pytest"""
    config.addinivalue_line("markers", "fast: tests rapides")
    config.addinivalue_line("markers", "warning: tests non-bloquants")
    config.addinivalue_line("markers", "slow: tests lents (nécessitent compilation)")


@pytest.fixture(scope="session")
def repo_root():
    """Racine du dépôt"""
    return Path(__file__).parent.parent


@pytest.fixture(scope="session")
def src_dir(repo_root):
    """Répertoire des fichiers .tex d'exercices"""
    return repo_root / "src"


@pytest.fixture(scope="session")
def all_exercise_files(src_dir):
    """Tous les fichiers .tex d'exercices (trié pour reproductibilité)"""
    return sorted(src_dir.glob("*.tex"))


@pytest.fixture(scope="session")
def preambles_dir(repo_root):
    """Répertoire des préambules LaTeX"""
    return repo_root / "_preambules"


@pytest.fixture(scope="session")
def all_preamble_files(preambles_dir):
    """Tous les fichiers de préambules"""
    return sorted(preambles_dir.glob("*.tex"))


@pytest.fixture
def exercise_file(request):
    """
    Fixture paramétrée pour tester chaque fichier individuellement
    À utiliser avec pytest.mark.parametrize ou indirect=True
    """
    return request.param
