#!/usr/bin/env python3
"""Vérifie les animations interactives référencées par \\animation[image]{nom}{légende}.

Chaque appel doit désigner une page animations/<nom>.html et porter une légende
en texte simple, imprimée dans le PDF avec l'adresse de la page. La page est
servie par OpenYourMath dans un bac à sable qui interdit toute requête externe :
elle doit donc être autonome.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SOURCES_DIR = ROOT / "src"
ANIMATIONS_DIR = ROOT / "animations"

# Même règle que src/lib/animations.js d'OpenYourMath.
NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$")
# L'image fixe facultative, \animation[chemin]{nom}{légende}, relève de check_image_assets.py.
CALL = re.compile(r"\\animation\s*(?:\[[^\]]*\]\s*)?\{")
EXTERNAL = re.compile(r"""(?:src|href)\s*=\s*["']?(?:https?:)?//""", re.IGNORECASE)


def read_group(source: str, start: int) -> tuple[str, int] | None:
    """Groupe entre accolades qui commence juste après « { »."""
    depth = 1
    index = start
    while index < len(source):
        char = source[index]
        if char == "\\":
            index += 1
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return source[start:index], index + 1
        index += 1
    return None


def find_animations(source: str) -> list[tuple[str, str]]:
    """Appels \\animation{nom}{légende}, hors commentaires."""
    calls = []
    for match in CALL.finditer(source):
        line_start = source.rfind("\n", 0, match.start()) + 1
        if re.search(r"(?<!\\)%", source[line_start:match.start()]):
            continue
        name = read_group(source, match.end())
        if not name:
            continue
        cursor = name[1]
        while cursor < len(source) and source[cursor].isspace():
            cursor += 1
        if cursor >= len(source) or source[cursor] != "{":
            continue
        caption = read_group(source, cursor + 1)
        if caption:
            calls.append((name[0].strip(), caption[0].strip()))
    return calls


def main() -> int:
    errors: list[str] = []
    used: set[str] = set()

    for file_path in sorted(SOURCES_DIR.glob("*.tex")):
        source = file_path.read_text(encoding="utf-8")
        if "\\animation" not in source:
            continue
        relative = file_path.relative_to(ROOT)
        for name, caption in find_animations(source):
            if not NAME.match(name):
                errors.append(f"{relative}: nom d'animation invalide « {name} » (lettres, chiffres, - et _).")
                continue
            used.add(name)
            if not (ANIMATIONS_DIR / f"{name}.html").is_file():
                errors.append(f"{relative}: animations/{name}.html n'existe pas.")
            if not caption:
                errors.append(f"{relative}: l'animation « {name} » n'a pas de légende.")
            elif re.search(r"[$\\]", caption):
                errors.append(f"{relative}: la légende de « {name} » doit être du texte simple, sans formule.")

    pages = sorted(ANIMATIONS_DIR.glob("*.html"))
    for page in pages:
        if not NAME.match(page.stem):
            errors.append(f"animations/{page.name}: nom de fichier invalide (lettres, chiffres, - et _).")
        if EXTERNAL.search(page.read_text(encoding="utf-8")):
            errors.append(f"animations/{page.name}: ressource externe, bloquée sur OpenYourMath.")

    for page in pages:
        if page.stem not in used:
            print(f"Avertissement : animations/{page.name} n'est référencée par aucun exercice.", file=sys.stderr)

    if errors:
        print("Erreurs d'animations :", file=sys.stderr)
        print("\n".join(errors), file=sys.stderr)
        return 1

    print(f"Animations OK ({len(pages)} page(s), {len(used)} référencée(s)).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
