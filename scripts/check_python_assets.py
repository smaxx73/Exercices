#!/usr/bin/env python3
"""Valide la syntaxe des extraits Python utilisés par les exercices."""

from __future__ import annotations

import sys
from pathlib import Path


ASSETS_DIR = Path(__file__).resolve().parent.parent / "code" / "python"


def main() -> int:
    files = sorted(ASSETS_DIR.glob("*.py"))
    errors: list[str] = []

    for file_path in files:
        try:
            source = file_path.read_text(encoding="utf-8")
            compile(source, str(file_path), "exec")
        except (OSError, SyntaxError, UnicodeDecodeError) as error:
            errors.append(f"{file_path.relative_to(ASSETS_DIR.parent.parent)}: {error}")

    if errors:
        print("Erreurs de syntaxe Python :", file=sys.stderr)
        print("\n".join(errors), file=sys.stderr)
        return 1

    print(f"Assets Python OK ({len(files)} fichier(s) vérifié(s)).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
