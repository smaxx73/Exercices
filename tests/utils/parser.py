"""
Parseur de fichiers .tex d'exercices
"""
import re
from pathlib import Path
from typing import Optional, Dict


class ExerciseParser:
    """Parse un fichier .tex et extrait les métadonnées"""

    REQUIRED_FIELDS = [
        'uuid', 'titre', 'niveau', 'module',
        'chapitre', 'sousChapitre', 'theme',
        'auteur', 'datecreate', 'organisation',
        'difficulte', 'contenu'
    ]

    def __init__(self, file_path: Path):
        """
        Initialize le parseur avec un fichier .tex

        Args:
            file_path: Chemin vers le fichier .tex à parser
        """
        self.file_path = Path(file_path)
        try:
            self.content = self.file_path.read_text(encoding='utf-8')
        except Exception as e:
            raise ValueError(f"Impossible de lire le fichier {file_path}: {e}")

    def parse(self) -> Dict[str, Optional[str]]:
        """
        Extrait toutes les métadonnées du fichier

        Returns:
            Dictionnaire avec les valeurs des champs (None si absent)
        """
        metadata = {}
        for field in self.REQUIRED_FIELDS:
            metadata[field] = self._extract_field(field)
        return metadata

    def _extract_field(self, field: str) -> Optional[str]:
        """
        Extrait un champ spécifique avec regex

        Args:
            field: Nom du champ à extraire (uuid, titre, etc.)

        Returns:
            Valeur du champ (stripped) ou None si absent
        """
        # Pattern pour matcher \field{contenu}
        # On utilise [^{}]* pour le contenu simple ou (?:[^{}]|\{[^{}]*\})* pour gérer les accolades imbriquées simples
        # Pour contenu qui peut avoir des accolades imbriquées complexes, on utilise une approche différente

        if field == 'contenu':
            # Le contenu peut avoir des accolades imbriquées complexes
            # On cherche \contenu{ puis on compte les accolades
            return self._extract_contenu()

        # Pour les autres champs, pattern simple
        pattern = rf'\\{field}\s*\{{([^{{}}]*)\}}'
        match = re.search(pattern, self.content, re.DOTALL)

        if match:
            value = match.group(1).strip()
            return value if value else ""  # Retourner "" au lieu de None pour champs vides

        return None  # Champ absent

    def _extract_contenu(self) -> Optional[str]:
        r"""
        Extrait le contenu avec gestion des accolades imbriquées
        et des caractères d'échappement (ex: \{ ou \})

        Returns:
            Contenu extrait ou None si absent
        """
        # Chercher \contenu{
        pattern = r'\\contenu\s*\{'
        match = re.search(pattern, self.content)

        if not match:
            return None

        # Position après \contenu{
        start = match.end()

        # Compter les accolades pour trouver la fin
        brace_count = 1
        pos = start
        length = len(self.content)

        while pos < length and brace_count > 0:
            # --- FIX: GESTION DE L'ÉCHAPPEMENT ---
            if self.content[pos] == '\\':
                # Si on voit un backslash, on saute le caractère suivant
                # car il est échappé (cela permet d'ignorer \{ et \})
                pos += 2
                continue
            # -------------------------------------

            if self.content[pos] == '{':
                brace_count += 1
            elif self.content[pos] == '}':
                brace_count -= 1
            pos += 1

        if brace_count == 0:
            # On a trouvé la fin
            contenu = self.content[start:pos-1]
            return contenu.strip()

        return None  # Accolades non équilibrées

    def get_uuid_from_filename(self) -> str:
        """
        Extrait l'UUID du nom de fichier

        Returns:
            UUID (nom du fichier sans .tex)
        """
        return self.file_path.stem

    def has_field(self, field: str) -> bool:
        """
        Vérifie si un champ est présent dans le fichier

        Args:
            field: Nom du champ

        Returns:
            True si le champ est présent (même vide)
        """
        pattern = rf'\\{field}\s*\{{'
        return bool(re.search(pattern, self.content))
