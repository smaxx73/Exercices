"""
Tests d'unicité des UUIDs
Vérifie que tous les UUIDs sont uniques et cohérents avec les noms de fichiers
"""
import pytest
from collections import Counter
from utils.parser import ExerciseParser
from utils.validators import MetadataValidator


@pytest.mark.fast
class TestUniqueness:
    """Tests d'unicité des identifiants"""

    def test_uuid_uniqueness_across_all_files(self, all_exercise_files):
        """
        Vérifie que tous les UUIDs sont uniques dans le dépôt
        Affiche la liste des doublons s'il y en a
        """
        uuids = []
        uuid_to_files = {}

        for exercise_file in all_exercise_files:
            parser = ExerciseParser(exercise_file)
            metadata = parser.parse()
            uuid = metadata.get('uuid')

            if uuid:
                uuid = uuid.strip()
                uuids.append(uuid)

                if uuid not in uuid_to_files:
                    uuid_to_files[uuid] = []
                uuid_to_files[uuid].append(exercise_file.name)

        # Compter les occurrences
        uuid_counts = Counter(uuids)
        duplicates = {uuid: count for uuid, count in uuid_counts.items() if count > 1}

        if duplicates:
            report = []
            for uuid, count in duplicates.items():
                files = uuid_to_files[uuid]
                report.append(f"  - UUID '{uuid}' trouvé {count} fois dans: {', '.join(files)}")

            pytest.fail(
                f"\n{len(duplicates)} UUIDs dupliqués trouvés:\n" + "\n".join(report)
            )

    @pytest.mark.parametrize('exercise_file', pytest.lazy_fixture('all_exercise_files'))
    def test_uuid_format_is_valid(self, exercise_file):
        """Vérifie que le format de l'UUID est valide (4 caractères alphanumériques)"""
        parser = ExerciseParser(exercise_file)
        metadata = parser.parse()
        uuid = metadata.get('uuid')

        validator = MetadataValidator()
        result = validator.validate_uuid_format(uuid)

        assert result.valid, f"UUID invalide dans {exercise_file.name}: {result.message}"

    @pytest.mark.parametrize('exercise_file', pytest.lazy_fixture('all_exercise_files'))
    def test_filename_matches_uuid(self, exercise_file):
        """Vérifie que le nom du fichier correspond à l'UUID"""
        parser = ExerciseParser(exercise_file)
        metadata = parser.parse()
        uuid_in_file = metadata.get('uuid')
        uuid_from_filename = parser.get_uuid_from_filename()

        if uuid_in_file:
            uuid_in_file = uuid_in_file.strip()

        assert uuid_in_file == uuid_from_filename, (
            f"Incohérence dans {exercise_file.name}: "
            f"UUID dans fichier = '{uuid_in_file}', "
            f"nom de fichier = '{uuid_from_filename}.tex'"
        )

    def test_all_uuids_summary(self, all_exercise_files):
        """
        Test récapitulatif : affiche des statistiques sur les UUIDs
        N'échoue pas, juste informatif
        """
        total = len(all_exercise_files)
        uuids = []
        invalid_format = []
        mismatched = []

        validator = MetadataValidator()

        for exercise_file in all_exercise_files:
            parser = ExerciseParser(exercise_file)
            metadata = parser.parse()
            uuid = metadata.get('uuid')

            if uuid:
                uuid = uuid.strip()
                uuids.append(uuid)

                # Vérifier format
                result = validator.validate_uuid_format(uuid)
                if not result.valid:
                    invalid_format.append(exercise_file.name)

                # Vérifier cohérence avec nom fichier
                if uuid != parser.get_uuid_from_filename():
                    mismatched.append(exercise_file.name)

        unique_uuids = len(set(uuids))
        duplicates = len(uuids) - unique_uuids

        print(f"\n=== Statistiques UUIDs ===")
        print(f"Total fichiers: {total}")
        print(f"UUIDs uniques: {unique_uuids}")
        print(f"UUIDs dupliqués: {duplicates}")
        print(f"Formats invalides: {len(invalid_format)}")
        print(f"Incohérences nom/UUID: {len(mismatched)}")
