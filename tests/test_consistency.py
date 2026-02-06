"""
Tests de cohérence des valeurs
Vérifie que les formats des champs sont cohérents (sans imposer de valeurs spécifiques)
"""
import pytest
from pathlib import Path
from tests.utils.parser import ExerciseParser
from tests.utils.validators import MetadataValidator


REPO_ROOT = Path(__file__).parent.parent
ALL_EXERCISE_FILES = sorted((REPO_ROOT / "src").glob("*.tex"))


@pytest.mark.fast
class TestConsistency:
    """Tests de cohérence des valeurs de champs"""

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_uuid_format_is_alphanumeric_4chars(self, exercise_file):
        """Vérifie que l'UUID est bien 4 caractères alphanumériques"""
        parser = ExerciseParser(exercise_file)
        metadata = parser.parse()
        uuid = metadata.get('uuid')

        validator = MetadataValidator()
        result = validator.validate_uuid_format(uuid)

        assert result.valid, f"UUID invalide dans {exercise_file.name}: {result.message}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_datecreate_format_valid(self, exercise_file):
        """Vérifie que la date est au format YYYY-MM-DD valide"""
        parser = ExerciseParser(exercise_file)
        metadata = parser.parse()
        date = metadata.get('datecreate')

        validator = MetadataValidator()
        result = validator.validate_date_format(date)

        assert result.valid, f"Date invalide dans {exercise_file.name}: {result.message}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_difficulte_is_numeric_if_present(self, exercise_file):
        """Vérifie que la difficulté est un chiffre ou vide"""
        parser = ExerciseParser(exercise_file)
        metadata = parser.parse()
        difficulte = metadata.get('difficulte')

        validator = MetadataValidator()
        result = validator.validate_difficulte_format(difficulte)

        assert result.valid, f"Difficulté invalide dans {exercise_file.name}: {result.message}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_contenu_not_empty_and_has_content(self, exercise_file):
        """Vérifie que le contenu n'est pas vide et contient au moins \\texte{} ou \\question{}"""
        parser = ExerciseParser(exercise_file)
        metadata = parser.parse()
        contenu = metadata.get('contenu')

        validator = MetadataValidator()
        result = validator.validate_contenu_not_empty(contenu)

        assert result.valid, f"Contenu invalide dans {exercise_file.name}: {result.message}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_uuid_not_empty(self, exercise_file):
        """Vérifie que l'UUID n'est pas vide"""
        parser = ExerciseParser(exercise_file)
        metadata = parser.parse()
        uuid = metadata.get('uuid')

        validator = MetadataValidator()
        result = validator.validate_field_not_empty('UUID', uuid)

        assert result.valid, f"UUID vide dans {exercise_file.name}: {result.message}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_titre_not_empty(self, exercise_file):
        """Vérifie que le titre n'est pas vide"""
        parser = ExerciseParser(exercise_file)
        metadata = parser.parse()
        titre = metadata.get('titre')

        validator = MetadataValidator()
        result = validator.validate_field_not_empty('Titre', titre)

        assert result.valid, f"Titre vide dans {exercise_file.name}: {result.message}"

    @pytest.mark.parametrize('exercise_file', ALL_EXERCISE_FILES, ids=lambda p: p.name)
    def test_niveau_not_empty(self, exercise_file):
        """Vérifie que le niveau n'est pas vide"""
        parser = ExerciseParser(exercise_file)
        metadata = parser.parse()
        niveau = metadata.get('niveau')

        validator = MetadataValidator()
        result = validator.validate_field_not_empty('Niveau', niveau)

        assert result.valid, f"Niveau vide dans {exercise_file.name}: {result.message}"

    def test_consistency_summary(self, all_exercise_files):
        """
        Test récapitulatif : affiche des statistiques sur la cohérence
        N'échoue pas, juste informatif
        """
        total = len(all_exercise_files)
        invalid_dates = []
        invalid_difficultes = []
        empty_contenu = []
        invalid_uuids = []

        validator = MetadataValidator()

        for exercise_file in all_exercise_files:
            parser = ExerciseParser(exercise_file)
            metadata = parser.parse()

            # Vérifier date
            result = validator.validate_date_format(metadata.get('datecreate'))
            if not result.valid:
                invalid_dates.append(exercise_file.name)

            # Vérifier difficulté
            result = validator.validate_difficulte_format(metadata.get('difficulte'))
            if not result.valid:
                invalid_difficultes.append(exercise_file.name)

            # Vérifier contenu
            result = validator.validate_contenu_not_empty(metadata.get('contenu'))
            if not result.valid:
                empty_contenu.append(exercise_file.name)

            # Vérifier UUID
            result = validator.validate_uuid_format(metadata.get('uuid'))
            if not result.valid:
                invalid_uuids.append(exercise_file.name)

        print(f"\n=== Statistiques de cohérence ===")
        print(f"Total fichiers: {total}")
        print(f"Dates invalides: {len(invalid_dates)}")
        print(f"Difficultés invalides: {len(invalid_difficultes)}")
        print(f"Contenus vides: {len(empty_contenu)}")
        print(f"UUIDs invalides: {len(invalid_uuids)}")
