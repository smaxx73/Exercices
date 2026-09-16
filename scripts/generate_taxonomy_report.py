#!/usr/bin/env python3
"""Generate the exercise taxonomy inventory from ``src/*.tex``."""

from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src"
OUTPUT = ROOT / "info" / "repartition-modules-chapitres-sous-chapitres.md"
FIELDS = ("module", "chapitre", "sousChapitre")


def metadata(source: str, field: str) -> str:
    match = re.search(rf"\\{field}\s*\{{([^}}]*)\}}", source)
    return match.group(1).strip() if match else "(absent)"


def ordered(counter: Counter[str]) -> list[tuple[str, int]]:
    return sorted(counter.items(), key=lambda item: (-item[1], item[0]))


def table(title: str, counter: Counter[str]) -> list[str]:
    lines = [f"| {title} | Occurrences |", "|---|---:|"]
    lines.extend(f"| {value} | {count} |" for value, count in ordered(counter))
    return lines


def main() -> None:
    files = sorted(SOURCE.glob("*.tex"))
    records: list[tuple[str, str, str]] = []
    errors = 0

    for path in files:
        try:
            source = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            errors += 1
            continue
        records.append(tuple(metadata(source, field) for field in FIELDS))

    modules = Counter(module for module, _, _ in records)
    chapters = Counter(chapter for _, chapter, _ in records)
    subchapters = Counter(subchapter for _, _, subchapter in records)
    hierarchy: defaultdict[str, defaultdict[str, Counter[str]]] = defaultdict(
        lambda: defaultdict(Counter)
    )
    for module, chapter, subchapter in records:
        hierarchy[module][chapter][subchapter] += 1

    lines = [
        "# Répartition des exercices",
        "",
        "- Source: `src/`",
        f"- Généré le: `{datetime.now().astimezone().isoformat(timespec='seconds')}`",
        f"- Fichiers totaux: `{len(files)}`",
        f"- Fichiers parsés: `{len(records)}`",
        f"- Erreurs de parsing: `{errors}`",
        "",
        "## Totaux par module",
        "",
        *table("Valeur", modules),
        "",
        "## Totaux par chapitre",
        "",
        *table("Valeur", chapters),
        "",
        "## Totaux par sous-chapitre",
        "",
        *table("Valeur", subchapters),
    ]

    for module, module_count in ordered(modules):
        lines.extend(["", "---", "", f"### Module: {module} ({module_count})", ""])
        chapter_counter = Counter(
            {chapter: sum(subchapters.values()) for chapter, subchapters in hierarchy[module].items()}
        )
        lines.extend(table("Chapitre", chapter_counter))
        for chapter, chapter_count in ordered(chapter_counter):
            lines.extend(
                [
                    "",
                    f"#### {chapter} ({chapter_count})",
                    "",
                    *table("Sous-chapitre", hierarchy[module][chapter]),
                ]
            )

    OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
