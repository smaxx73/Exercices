"""
Validateurs pour les métadonnées des exercices
"""
import re
from dataclasses import dataclass
from datetime import datetime
from typing import Dict


@dataclass
class ValidationResult:
    """Résultat d'une validation"""
    valid: bool
    message: str = ""


class MetadataValidator:
    """
    Valide les métadonnées d'un exercice (format seulement, pas de valeurs spécifiques)
    """

    def validate_uuid_format(self, uuid: str) -> ValidationResult:
        """
        Vérifie que l'UUID est exactement 4 caractères alphanumériques

        Args:
            uuid: UUID à valider

        Returns:
            ValidationResult avec statut et message
        """
        if uuid is None:
            return ValidationResult(False, "UUID absent")

        if not uuid or not uuid.strip():
            return ValidationResult(False, "UUID vide")

        uuid = uuid.strip()
        if not re.match(r'^[a-zA-Z0-9]{4}$', uuid):
            return ValidationResult(
                False,
                f"Format UUID invalide: '{uuid}' (doit être 4 caractères alphanumériques)"
            )

        return ValidationResult(True, "")

    def validate_date_format(self, date_str: str) -> ValidationResult:
        """
        Vérifie le format YYYY-MM-DD uniquement

        Args:
            date_str: Date à valider

        Returns:
            ValidationResult avec statut et message
        """
        if date_str is None:
            return ValidationResult(False, "Date absente")

        if not date_str or not date_str.strip():
            return ValidationResult(False, "Date vide")

        try:
            datetime.strptime(date_str.strip(), '%Y-%m-%d')
            return ValidationResult(True, "")
        except ValueError:
            return ValidationResult(
                False,
                f"Format date invalide: '{date_str}' (attendu: YYYY-MM-DD)"
            )

    def validate_difficulte_format(self, difficulte: str) -> ValidationResult:
        """
        Vérifie que difficulté est vide ou un chiffre

        Args:
            difficulte: Difficulté à valider

        Returns:
            ValidationResult avec statut et message
        """
        # None ou vide est autorisé
        if difficulte is None or not difficulte or difficulte.strip() == "":
            return ValidationResult(True, "")

        difficulte = difficulte.strip()
        if not difficulte.isdigit():
            return ValidationResult(
                False,
                f"Difficulté invalide: '{difficulte}' (doit être un chiffre ou vide)"
            )

        return ValidationResult(True, "")

    def validate_contenu_not_empty(self, contenu: str) -> ValidationResult:
        """
        Vérifie que le contenu n'est pas vide et contient du texte

        Args:
            contenu: Contenu à valider

        Returns:
            ValidationResult avec statut et message
        """
        if contenu is None:
            return ValidationResult(False, "Contenu absent")

        if not contenu or not contenu.strip():
            return ValidationResult(False, "Contenu vide")

        # Vérifier présence de \texte{ ou \question{
        if '\\texte{' not in contenu and '\\question{' not in contenu:
            return ValidationResult(
                False,
                "Contenu ne contient ni \\texte{} ni \\question{}"
            )

        return ValidationResult(True, "")

    def validate_field_not_empty(self, field_name: str, value: str) -> ValidationResult:
        """
        Vérifie qu'un champ n'est pas vide

        Args:
            field_name: Nom du champ
            value: Valeur à valider

        Returns:
            ValidationResult avec statut et message
        """
        if value is None:
            return ValidationResult(False, f"{field_name} absent")

        if not value or not value.strip():
            return ValidationResult(False, f"{field_name} vide")

        return ValidationResult(True, "")

    def validate_field_present(self, field_name: str, value: str) -> ValidationResult:
        """
        Vérifie qu'un champ est présent (mais peut être vide)

        Args:
            field_name: Nom du champ
            value: Valeur à valider

        Returns:
            ValidationResult avec statut et message
        """
        if value is None:
            return ValidationResult(False, f"{field_name} absent")

        return ValidationResult(True, "")

    def validate_all(self, metadata: Dict[str, str]) -> Dict[str, ValidationResult]:
        """
        Valide toutes les métadonnées

        Args:
            metadata: Dictionnaire des métadonnées

        Returns:
            Dictionnaire des résultats de validation par champ
        """
        results = {}

        # UUID - requis et format strict
        results['uuid'] = self.validate_uuid_format(metadata.get('uuid'))

        # Titre - requis et non vide
        results['titre'] = self.validate_field_not_empty('Titre', metadata.get('titre'))

        # Niveau - requis et non vide
        results['niveau'] = self.validate_field_not_empty('Niveau', metadata.get('niveau'))

        # Module - requis (peut être vide)
        results['module'] = self.validate_field_present('Module', metadata.get('module'))

        # Chapitre - requis (peut être vide)
        results['chapitre'] = self.validate_field_present('Chapitre', metadata.get('chapitre'))

        # Sous-chapitre - requis (peut être vide)
        results['sousChapitre'] = self.validate_field_present('Sous-chapitre', metadata.get('sousChapitre'))

        # Theme - requis (peut être vide)
        results['theme'] = self.validate_field_present('Theme', metadata.get('theme'))

        # Auteur - optionnel
        results['auteur'] = self.validate_field_present('Auteur', metadata.get('auteur'))

        # Date - requis et format strict
        results['datecreate'] = self.validate_date_format(metadata.get('datecreate'))

        # Organisation - optionnel
        results['organisation'] = self.validate_field_present('Organisation', metadata.get('organisation'))

        # Difficulté - optionnel, format si présent
        results['difficulte'] = self.validate_difficulte_format(metadata.get('difficulte'))

        # Contenu - requis et non vide
        results['contenu'] = self.validate_contenu_not_empty(metadata.get('contenu'))

        return results
