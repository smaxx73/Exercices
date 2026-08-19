#!/usr/bin/env python3
"""Validate image references used by LaTeX exercises."""

from __future__ import annotations

import argparse
import csv
import re
import sys
from dataclasses import dataclass
from pathlib import Path, PurePosixPath


ROOT = Path(__file__).resolve().parents[1]
IMAGE_COMMAND = re.compile(r"\\includegraphics(?:\s*\[[^\]]*\])?\s*\{([^{}]+)\}")
MANAGED_PATH = re.compile(r"^\\exercisespath\s+img/(pdf|png)/(.+)$")


@dataclass(frozen=True)
class Issue:
    file_path: str
    line: int
    column: int
    code: str
    message: str


def is_escaped(source: str, index: int) -> bool:
    return len(source[:index]) - len(source[:index].rstrip("\\")) % 2 == 1


def strip_comments_preserve_length(source: str) -> str:
    chars = list(source)
    for index, char in enumerate(chars):
        if char != "%" or is_escaped(source, index):
            continue
        end = source.find("\n", index)
        end = len(source) if end == -1 else end
        chars[index:end] = " " * (end - index)
    return "".join(chars)


def line_and_column(source: str, index: int) -> tuple[int, int]:
    line = source.count("\n", 0, index) + 1
    previous_newline = source.rfind("\n", 0, index)
    return line, index - previous_newline


def image_target(argument: str) -> Path | None:
    match = MANAGED_PATH.fullmatch(argument.strip())
    if not match:
        return None

    kind, name = match.groups()
    parts = PurePosixPath(name).parts
    if not name or ".." in parts or Path(name).suffix not in ("", f".{kind}"):
        return None

    target = ROOT / "img" / kind / name
    return target if target.suffix else target.with_suffix(f".{kind}")


def validate_file(file_path: Path) -> list[Issue]:
    source = file_path.read_text(encoding="utf-8")
    clean_source = strip_comments_preserve_length(source)
    issues: list[Issue] = []

    for match in IMAGE_COMMAND.finditer(clean_source):
        line, column = line_and_column(source, match.start())
        argument = match.group(1).strip()
        target = image_target(argument)

        if target is None:
            issues.append(
                Issue(
                    file_path.relative_to(ROOT).as_posix(),
                    line,
                    column,
                    "unsupported-image-path",
                    "Utiliser \\exercisespath img/pdf/... ou \\exercisespath img/png/... .",
                )
            )
        elif not target.is_file():
            issues.append(
                Issue(
                    file_path.relative_to(ROOT).as_posix(),
                    line,
                    column,
                    "missing-image-asset",
                    f"Asset introuvable : {target.relative_to(ROOT).as_posix()}.",
                )
            )

    return issues


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Valider les images des exercices LaTeX.")
    parser.add_argument("input", nargs="?", default="src", help="Fichier .tex ou répertoire à vérifier.")
    parser.add_argument("--csv", help="Écrire les problèmes dans ce fichier CSV.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    input_path = (ROOT / args.input).resolve() if not Path(args.input).is_absolute() else Path(args.input)
    files = [input_path] if input_path.is_file() else sorted(input_path.rglob("*.tex"))
    issues = [issue for file_path in files for issue in validate_file(file_path)]

    if args.csv:
        with Path(args.csv).open("w", encoding="utf-8", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(("file", "line", "column", "code", "message"))
            writer.writerows(
                (issue.file_path, issue.line, issue.column, issue.code, issue.message)
                for issue in issues
            )

    for issue in issues:
        print(
            f"{issue.file_path}:{issue.line}:{issue.column} [{issue.code}] {issue.message}",
            file=sys.stderr,
        )

    if issues:
        print(f"\n{len(issues)} problème(s) d'image détecté(s).", file=sys.stderr)
        return 1

    print(f"Images LaTeX OK ({len(files)} fichier(s) vérifié(s)).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
