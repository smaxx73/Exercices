"""
Tests de structure des fichiers .tex
Vérifie que chaque exercice contient tous les champs requis
"""
import pytest
from pathlib import Path
from tests.utils.parser import ExerciseParser


REPO_ROOT = Path(__file__).parent.parent
ALL_EXERCISE_FILES = sorted((REPO_ROOT / "src").glob("*.tex"))


@pytest.mark.fast
class TestStructure:
    """Tests de présence des champs requis"""

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_uuid_field_present(self, exercise_file):
        """Vérifie que le champ \\uuid{} est présent"""
        parser = ExerciseParser(exercise_file)
        assert parser.has_field('uuid'), f"Champ \\uuid{{}} absent dans {exercise_file.name}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_titre_field_present(self, exercise_file):
        """Vérifie que le champ \\titre{} est présent"""
        parser = ExerciseParser(exercise_file)
        assert parser.has_field('titre'), f"Champ \\titre{{}} absent dans {exercise_file.name}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_niveau_field_present(self, exercise_file):
        """Vérifie que le champ \\niveau{} est présent"""
        parser = ExerciseParser(exercise_file)
        assert parser.has_field('niveau'), f"Champ \\niveau{{}} absent dans {exercise_file.name}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_module_field_present(self, exercise_file):
        """Vérifie que le champ \\module{} est présent"""
        parser = ExerciseParser(exercise_file)
        assert parser.has_field('module'), f"Champ \\module{{}} absent dans {exercise_file.name}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_chapitre_field_present(self, exercise_file):
        """Vérifie que le champ \\chapitre{} est présent"""
        parser = ExerciseParser(exercise_file)
        assert parser.has_field('chapitre'), f"Champ \\chapitre{{}} absent dans {exercise_file.name}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_sous_chapitre_field_present(self, exercise_file):
        """Vérifie que le champ \\sousChapitre{} est présent"""
        parser = ExerciseParser(exercise_file)
        assert parser.has_field('sousChapitre'), f"Champ \\sousChapitre{{}} absent dans {exercise_file.name}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_theme_field_present(self, exercise_file):
        """Vérifie que le champ \\theme{} est présent"""
        parser = ExerciseParser(exercise_file)
        assert parser.has_field('theme'), f"Champ \\theme{{}} absent dans {exercise_file.name}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_auteur_field_present(self, exercise_file):
        """Vérifie que le champ \\auteur{} est présent"""
        parser = ExerciseParser(exercise_file)
        assert parser.has_field('auteur'), f"Champ \\auteur{{}} absent dans {exercise_file.name}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_datecreate_field_present(self, exercise_file):
        """Vérifie que le champ \\datecreate{} est présent"""
        parser = ExerciseParser(exercise_file)
        assert parser.has_field('datecreate'), f"Champ \\datecreate{{}} absent dans {exercise_file.name}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_organisation_field_present(self, exercise_file):
        """Vérifie que le champ \\organisation{} est présent"""
        parser = ExerciseParser(exercise_file)
        assert parser.has_field('organisation'), f"Champ \\organisation{{}} absent dans {exercise_file.name}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_difficulte_field_present(self, exercise_file):
        """Vérifie que le champ \\difficulte{} est présent"""
        parser = ExerciseParser(exercise_file)
        assert parser.has_field('difficulte'), f"Champ \\difficulte{{}} absent dans {exercise_file.name}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_contenu_field_present(self, exercise_file):
        """Vérifie que le champ \\contenu{} est présent"""
        parser = ExerciseParser(exercise_file)
        assert parser.has_field('contenu'), f"Champ \\contenu{{}} absent dans {exercise_file.name}"

    def test_all_files_have_required_fields(self, all_exercise_files):
        """
        Test global : vérifie que tous les fichiers ont tous les champs requis
        Affiche un résumé des fichiers problématiques
        """
        missing_fields_report = {}

        for exercise_file in all_exercise_files:
            parser = ExerciseParser(exercise_file)
            missing_fields = []

            for field in ExerciseParser.REQUIRED_FIELDS:
                if not parser.has_field(field):
                    missing_fields.append(field)

            if missing_fields:
                missing_fields_report[exercise_file.name] = missing_fields

        if missing_fields_report:
            report = "\n".join([
                f"  - {fname}: champs manquants {', '.join(fields)}"
                for fname, fields in missing_fields_report.items()
            ])
            pytest.fail(
                f"\n{len(missing_fields_report)} fichiers ont des champs manquants:\n{report}"
            )
