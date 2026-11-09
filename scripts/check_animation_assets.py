#!/usr/bin/env python3
"""Vérifie les animations interactives référencées par \\animation[image]{nom}{légende}.

Chaque appel doit désigner une figure animations/<nom>.js et porter une légende
en texte simple, imprimée dans le PDF avec l'adresse de la figure. La figure est
écrite avec le kit d'OpenYourMath et s'enregistre sous le nom de son fichier,
OYMWidgets.define('<nom>', …), avec ses métadonnées écrites en dur :
meta: { title, description, author, kit, concepts }. OpenYourMath la sert dans
un bac à sable qui interdit toute requête externe : elle ne charge rien du réseau.

Ce contrôle ne regarde que la présence des champs de meta. pnpm check:animations,
dans OpenYourMath, lit meta sans exécuter la figure et vérifie en plus que les
valeurs sont écrites en dur et que l'auteur est un pseudo de content/authors.json.
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
DEFINE = re.compile(r"""OYMWidgets\.define\(\s*(['"])([^'"]*)\1""")
# Adresses et chargements : bloqués par le bac à sable, ils n'ont rien à faire dans une figure.
EXTERNAL = re.compile(r"https?://|\bfetch\s*\(|XMLHttpRequest|\bimport\s*\(|importScripts|<(?:script|link|iframe)\b", re.IGNORECASE)
SVG_NAMESPACE = "http://www.w3.org/2000/svg"
META = re.compile(r"\bmeta\s*:\s*\{")
META_FIELDS = ("title", "description", "author", "kit")
# Version du kit d'OpenYourMath (KIT_VERSION de src/lib/widgets/source.js).
KIT_VERSION = 1


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


def meta_errors(code: str) -> list[str]:
    """Champs manquants ou version du kit inconnue dans meta: { … }."""
    match = META.search(code)
    group = read_group(code, match.end()) if match else None
    if not group:
        return ["meta: { title, description, author, kit } manque."]
    meta = group[0]
    errors = [f"meta.{field} manque." for field in META_FIELDS if not re.search(rf"\b{field}\s*:", meta)]
    kit = re.search(r"\bkit\s*:\s*(\d+)", meta)
    if re.search(r"\bkit\s*:", meta) and not (kit and 1 <= int(kit.group(1)) <= KIT_VERSION):
        errors.append(f"meta.kit doit être un entier de 1 à {KIT_VERSION}.")
    return errors


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
            if not (ANIMATIONS_DIR / f"{name}.js").is_file():
                errors.append(f"{relative}: animations/{name}.js n'existe pas.")
            if not caption:
                errors.append(f"{relative}: l'animation « {name} » n'a pas de légende.")
            elif re.search(r"[$\\]", caption):
                errors.append(f"{relative}: la légende de « {name} » doit être du texte simple, sans formule.")

    pages = sorted(ANIMATIONS_DIR.glob("*.js"))
    for page in pages:
        if not NAME.match(page.stem):
            errors.append(f"animations/{page.name}: nom de fichier invalide (lettres, chiffres, - et _).")
        code = page.read_text(encoding="utf-8")
        defined = [match.group(2) for match in DEFINE.finditer(code)]
        if defined != [page.stem]:
            errors.append(f"animations/{page.name}: doit enregistrer une seule figure, OYMWidgets.define('{page.stem}', …).")
        errors.extend(f"animations/{page.name}: {message}" for message in meta_errors(code))
        if EXTERNAL.search(code.replace(SVG_NAMESPACE, "")):
            errors.append(f"animations/{page.name}: adresse ou chargement externe, bloqué sur OpenYourMath.")

    for page in pages:
        if page.stem not in used:
            print(f"Avertissement : animations/{page.name} n'est référencée par aucun exercice.", file=sys.stderr)

    if errors:
        print("Erreurs d'animations :", file=sys.stderr)
        print("\n".join(errors), file=sys.stderr)
        return 1

    print(f"Animations OK ({len(pages)} figure(s), {len(used)} référencée(s)).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
