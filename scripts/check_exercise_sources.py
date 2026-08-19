#!/usr/bin/env python3
"""Validate normalized LaTeX exercise sources.

This is a Python port of openyourmath-v2's
scripts/quality/check-exercise-sources.js. It intentionally keeps the same
issue codes and output format so reports can be compared across repositories.
"""

from __future__ import annotations

import argparse
import csv
import re
import sys
from dataclasses import dataclass
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MAX_ERRORS = 200
CSV_COLUMNS = ("file", "line", "column", "code", "message")

TOP_LEVEL_COMMANDS = {
    "uuid",
    "titre",
    "chapitre",
    "sousChapitre",
    "theme",
    "auteur",
    "organisation",
    "video",
    "datecreate",
    "niveau",
    "difficulte",
    "module",
    "exo7id",
    "isIndication",
    "isCorrection",
    "contenu",
}

CONTENT_COMMANDS = {"texte", "question", "indication", "reponse"}

IGNORED_CONTENT_ENVIRONMENTS = {
    "center",
    "tabular",
    "tabularx",
    "array",
    "tikzpicture",
    "Piton",
    "minipage",
    "multicols",
}

IGNORED_CONTENT_COMMANDS = {
    "colonnes",
    "fincolonnes",
    "setcounter",
    "smallskip",
    "medskip",
    "bigskip",
    "vspace",
    "hspace",
    "paragraph",
    "subsection",
    "subsubsection",
    "href",
    "includegraphics",
    "hfill",
    "renewcommand",
    "label",
}


@dataclass(frozen=True)
class CommandCall:
    name: str
    start: int
    end: int
    body_start: int
    body_end: int
    body: str
    malformed: bool = False


@dataclass(frozen=True)
class Range:
    start: int
    end: int


@dataclass(frozen=True)
class Issue:
    file_path: str
    line: int
    column: int
    code: str
    message: str


def default_input() -> Path:
    content_exercises = ROOT / "content" / "exercises"
    if content_exercises.exists():
        return content_exercises
    return ROOT / "src"


def is_escaped(source: str, index: int) -> bool:
    slash_count = 0
    i = index - 1
    while i >= 0 and source[i] == "\\":
        slash_count += 1
        i -= 1
    return slash_count % 2 == 1


def strip_comments_preserve_length(source: str) -> str:
    chars: list[str] = []
    i = 0
    while i < len(source):
        if source[i] == "%" and not is_escaped(source, i):
            while i < len(source) and source[i] != "\n":
                chars.append(" ")
                i += 1
            if i < len(source):
                chars.append("\n")
                i += 1
        else:
            chars.append(source[i])
            i += 1
    return "".join(chars)


def line_and_column(source: str, index: int) -> tuple[int, int]:
    before = source[:index]
    line = before.count("\n") + 1
    last_newline = before.rfind("\n")
    column = index + 1 if last_newline == -1 else index - last_newline
    return line, column


def parse_braced_argument(source: str, open_brace_index: int) -> tuple[int, int, int, str] | None:
    if open_brace_index < 0 or open_brace_index >= len(source) or source[open_brace_index] != "{":
        return None

    depth = 1
    i = open_brace_index + 1
    while i < len(source):
        if source[i] == "\\":
            i += 2
            continue
        if source[i] == "{":
            depth += 1
        elif source[i] == "}":
            depth -= 1
        if depth == 0:
            return open_brace_index + 1, i, i + 1, source[open_brace_index + 1 : i]
        i += 1
    return None


def find_command_calls(source: str, names: set[str] | None = None) -> list[CommandCall]:
    calls: list[CommandCall] = []
    command_regex = re.compile(r"\\([A-Za-z][A-Za-z0-9]*)\s*\{")

    for match in command_regex.finditer(source):
        if is_escaped(source, match.start()):
            continue

        name = match.group(1)
        if names is not None and name not in names:
            continue

        open_brace_index = source.find("{", match.start() + len(match.group(0)) - 1)
        argument = parse_braced_argument(source, open_brace_index)
        if argument is None:
            calls.append(
                CommandCall(
                    name=name,
                    start=match.start(),
                    end=len(source),
                    body_start=open_brace_index + 1,
                    body_end=len(source),
                    body=source[open_brace_index + 1 :],
                    malformed=True,
                )
            )
            continue

        body_start, body_end, end, body = argument
        calls.append(CommandCall(name, match.start(), end, body_start, body_end, body))

    return calls


def is_inside_range(index: int, ranges: list[Range]) -> bool:
    return any(range_.start <= index < range_.end for range_ in ranges)


def blank_range(chars: list[str], start: int, end: int) -> None:
    for i in range(max(0, start), min(len(chars), end)):
        if chars[i] != "\n":
            chars[i] = " "


def skip_whitespace(source: str, index: int) -> int:
    while index < len(source) and source[index].isspace():
        index += 1
    return index


def parse_bracket_argument(source: str, open_bracket_index: int) -> tuple[int, int] | None:
    if (
        open_bracket_index < 0
        or open_bracket_index >= len(source)
        or source[open_bracket_index] != "["
    ):
        return None

    depth = 1
    i = open_bracket_index + 1
    while i < len(source):
        if source[i] == "\\":
            i += 2
            continue
        if source[i] == "[":
            depth += 1
        elif source[i] == "]":
            depth -= 1
        if depth == 0:
            return open_bracket_index + 1, i + 1
        i += 1
    return None


def blank_ignored_content_commands(chars: list[str], source: str) -> None:
    command_regex = re.compile(r"\\([A-Za-z][A-Za-z0-9]*)\*?")

    for match in command_regex.finditer(source):
        if is_escaped(source, match.start()) or match.group(1) not in IGNORED_CONTENT_COMMANDS:
            continue

        end = match.end()
        consumed_argument = False
        while True:
            end = skip_whitespace(source, end)
            if end < len(source) and source[end] == "[":
                argument = parse_bracket_argument(source, end)
                if argument is None:
                    break
                _body_start, end = argument
                consumed_argument = True
                continue
            if end < len(source) and source[end] == "{":
                argument = parse_braced_argument(source, end)
                if argument is None:
                    break
                _body_start, _body_end, end, _body = argument
                consumed_argument = True
                continue
            break

        blank_range(chars, match.start(), end if consumed_argument else match.end())


def summarize_chunk(chunk: str) -> str:
    return re.sub(r"\s+", " ", chunk).strip()[:90]


def replace_with_spaces(match: re.Match[str]) -> str:
    return " " * len(match.group(0))


def find_raw_text_chunks(
    source: str, base_offset: int, typed_command_calls: list[CommandCall]
) -> list[tuple[int, str]]:
    chars = list(source)

    for call in typed_command_calls:
        blank_range(chars, call.start - base_offset, call.end - base_offset)

    local_source = source
    for environment in IGNORED_CONTENT_ENVIRONMENTS:
        for block in find_environment_blocks(local_source, environment):
            blank_range(chars, block.start, block.end)

    blank_ignored_content_commands(chars, local_source)

    masked = "".join(chars)
    masked = re.sub(r"\\begin\s*\{[^}]+\}", replace_with_spaces, masked)
    masked = re.sub(r"\\end\s*\{[^}]+\}", replace_with_spaces, masked)
    masked = re.sub(r"\\item\s*(?:\[[^\]]*\])?", replace_with_spaces, masked)
    masked = re.sub(r"[$&_^{}~#]", " ", masked)

    chunks: list[tuple[int, str]] = []
    raw_text_regex = re.compile(r"[A-Za-zÀ-ÖØ-öø-ÿ0-9][\s\S]*?(?=(?:\n\s*\n)|$)")
    for match in raw_text_regex.finditer(masked):
        text = summarize_chunk(match.group(0))
        if text:
            chunks.append((base_offset + match.start(), text))
    return chunks


def find_enumerate_blocks(source: str) -> list[tuple[int, int, int, int, str]]:
    blocks: list[tuple[int, int, int, int, str]] = []
    stack: list[tuple[int, int]] = []
    regex = re.compile(r"\\(begin|end)\s*\{enumerate\}")

    for match in regex.finditer(source):
        if is_escaped(source, match.start()):
            continue

        if match.group(1) == "begin":
            stack.append((match.start(), match.end()))
        elif stack:
            start, body_start = stack.pop()
            blocks.append((start, body_start, match.start(), match.end(), source[body_start : match.start()]))

    return blocks


def find_environment_blocks(source: str, environment_name: str) -> list[Range]:
    escaped_name = re.escape(environment_name)
    regex = re.compile(rf"\\(begin|end)\s*\{{{escaped_name}\}}(?:\s*\{{[^}}]*\}})?")
    blocks: list[Range] = []
    stack: list[int] = []

    for match in regex.finditer(source):
        if is_escaped(source, match.start()):
            continue

        if match.group(1) == "begin":
            stack.append(match.start())
        elif stack:
            blocks.append(Range(stack.pop(), match.end()))

    return blocks


def count_top_level_items(source: str) -> int:
    regex = re.compile(r"\\begin\s*\{enumerate\}|\\end\s*\{enumerate\}|\\item\b")
    depth = 0
    count = 0

    for match in regex.finditer(source):
        if is_escaped(source, match.start()):
            continue

        token = match.group(0)
        if token.startswith("\\begin"):
            depth += 1
        elif token.startswith("\\end"):
            depth = max(0, depth - 1)
        elif depth == 0:
            count += 1

    return count


def add_issue(
    issues: list[Issue],
    source: str,
    file_path: str,
    index: int,
    code: str,
    message: str,
) -> None:
    line, column = line_and_column(source, index)
    issues.append(Issue(file_path, line, column, code, message))


def validate_source(source: str, file_path: str = "<source>") -> list[Issue]:
    issues: list[Issue] = []
    clean_source = strip_comments_preserve_length(source)
    top_level_calls = find_command_calls(clean_source, TOP_LEVEL_COMMANDS)
    contenu_calls = [call for call in top_level_calls if call.name == "contenu"]
    content_calls = find_command_calls(clean_source, CONTENT_COMMANDS)
    contenu_ranges = [Range(call.body_start, call.body_end) for call in contenu_calls]
    question_calls = [
        call
        for call in content_calls
        if call.name == "question" and is_inside_range(call.start, contenu_ranges)
    ]

    if not contenu_calls:
        add_issue(
            issues,
            source,
            file_path,
            0,
            "missing-contenu",
            "Le fichier doit contenir un bloc \\contenu{...}.",
        )

    if not question_calls:
        add_issue(
            issues,
            source,
            file_path,
            0,
            "missing-question",
            "Le contenu doit contenir au moins une \\question{...}.",
        )

    for call in top_level_calls:
        if call.malformed:
            add_issue(
                issues,
                source,
                file_path,
                call.start,
                "malformed-command",
                f"La commande \\{call.name}{{...}} n'est pas fermée correctement.",
            )

    for call in content_calls:
        if call.malformed:
            add_issue(
                issues,
                source,
                file_path,
                call.start,
                "malformed-command",
                f"La commande \\{call.name}{{...}} n'est pas fermée correctement.",
            )
        if not is_inside_range(call.start, contenu_ranges):
            add_issue(
                issues,
                source,
                file_path,
                call.start,
                "content-outside-contenu",
                f"La commande \\{call.name}{{...}} doit être dans \\contenu{{...}}.",
            )
        if call.name == "indication" and call.body.strip() == "":
            add_issue(
                issues,
                source,
                file_path,
                call.start,
                "empty-indication",
                "La commande \\indication{...} ne doit pas être vide.",
            )

    top_level_mask = list(clean_source)
    for call in top_level_calls:
        blank_range(top_level_mask, call.start, call.end)
    for block in find_environment_blocks(clean_source, "SaveVerbatim"):
        blank_range(top_level_mask, block.start, block.end)

    outside_text = "".join(top_level_mask)
    outside_regex = re.compile(r"[A-Za-zÀ-ÖØ-öø-ÿ0-9][^\n]*")
    for match in outside_regex.finditer(outside_text):
        add_issue(
            issues,
            source,
            file_path,
            match.start(),
            "text-outside-contenu",
            f'Texte hors \\contenu{{...}}: "{summarize_chunk(match.group(0))}".',
        )

    for contenu_call in contenu_calls:
        typed_calls_in_contenu = [
            call
            for call in content_calls
            if call.start >= contenu_call.body_start and call.end <= contenu_call.body_end
        ]
        raw_chunks = find_raw_text_chunks(
            clean_source[contenu_call.body_start : contenu_call.body_end],
            contenu_call.body_start,
            typed_calls_in_contenu,
        )

        for index, text in raw_chunks:
            add_issue(
                issues,
                source,
                file_path,
                index,
                "untyped-content-text",
                (
                    "Texte dans \\contenu{...} hors \\texte{}, \\question{}, "
                    f'\\indication{{}} ou \\reponse{{}}: "{text}".'
                ),
            )

        if len(question_calls) == 1:
            for block_start, _body_start, _body_end, _end, body in find_enumerate_blocks(
                clean_source[contenu_call.body_start : contenu_call.body_end]
            ):
                if count_top_level_items(body) == 1:
                    add_issue(
                        issues,
                        source,
                        file_path,
                        contenu_call.body_start + block_start,
                        "single-item-enumerate",
                        (
                            "Un exercice avec une seule question ne doit pas contenir "
                            "un environnement enumerate avec un seul \\item."
                        ),
                    )

    return issues


def list_tex_files(input_path: Path) -> list[Path]:
    if input_path.is_file():
        return [input_path] if input_path.suffix == ".tex" else []
    return sorted(path for path in input_path.rglob("*.tex") if path.is_file())


def relative_to_root(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def write_issues_csv(issues: list[Issue], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(CSV_COLUMNS)
        for issue in issues:
            writer.writerow(
                [issue.file_path, issue.line, issue.column, issue.code, issue.message]
            )


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Valider les sources LaTeX d'exercices.",
    )
    parser.add_argument(
        "input",
        nargs="?",
        default=str(default_input()),
        help="Fichier .tex ou répertoire à vérifier.",
    )
    parser.add_argument(
        "--max-errors",
        type=int,
        default=DEFAULT_MAX_ERRORS,
        help="Nombre maximal de problèmes affichés. 0 masque les détails.",
    )
    parser.add_argument(
        "--csv",
        nargs="?",
        const=f"reports/tex-quality-issues-{date.today().isoformat()}.csv",
        help="Écrire un rapport CSV. Chemin optionnel.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    max_errors = args.max_errors if args.max_errors >= 0 else DEFAULT_MAX_ERRORS
    input_path = Path(args.input).resolve()
    files = list_tex_files(input_path)
    all_issues: list[Issue] = []

    for file_path in files:
        source = file_path.read_text(encoding="utf-8")
        all_issues.extend(validate_source(source, relative_to_root(file_path)))

    if args.csv:
        output_path = Path(args.csv).resolve()
        write_issues_csv(all_issues, output_path)
        print(f"Rapport CSV écrit: {relative_to_root(output_path)}", file=sys.stderr)

    if all_issues:
        visible_issues = all_issues[:max_errors]
        for issue in visible_issues:
            print(
                f"{issue.file_path}:{issue.line}:{issue.column} "
                f"[{issue.code}] {issue.message}",
                file=sys.stderr,
            )
        if len(visible_issues) < len(all_issues):
            if max_errors == 0:
                print("... détails masqués par --max-errors=0.", file=sys.stderr)
            else:
                print(
                    "... affichage limité aux "
                    f"{len(visible_issues)} premiers problèmes. "
                    "Utilisez --max-errors=0 pour seulement le résumé ou "
                    "--max-errors=N pour ajuster.",
                    file=sys.stderr,
                )
        print(
            f"\n{len(all_issues)} problème(s) détecté(s) dans "
            f"{len(files)} fichier(s) LaTeX.",
            file=sys.stderr,
        )
        return 1

    print(f"Sources LaTeX OK ({len(files)} fichier(s) vérifié(s)).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
