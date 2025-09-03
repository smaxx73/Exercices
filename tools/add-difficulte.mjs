#!/usr/bin/env node
// Usage:
//   node add-difficulte.mjs            # process src/**/*.tex (in-place, with .bak backups)
//   node add-difficulte.mjs --dry-run  # show what would change, no writes
//   node add-difficulte.mjs src other/dir --dry-run

import { promises as fs } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const roots = args.filter(a => a !== "--dry-run" && !a.startsWith("--"));
const ROOTS = roots.length ? roots : ["../src"];

const TEX_EXT = ".tex";

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else if (e.isFile() && full.endsWith(TEX_EXT)) {
      yield full;
    }
  }
}

function insertDifficulteBeforeContenu(content) {
  // If a difficulte already exists anywhere, do nothing
  if (/\\difficulte\s*\{/.test(content)) return { changed: false, result: content, reason: "already has \\difficulte" };

  // Find first line that starts (possibly indented) with \contenu{
  const reContenu = /(^|\n)([^\S\r\n]*)\\contenu\s*\{/m;
  const m = reContenu.exec(content);
  if (!m) return { changed: false, result: content, reason: "no \\contenu found" };

  // Compute the start of that line (right after the preceding newline, or 0)
  const lineStart = m.index + (m[1] ? m[1].length : 0);
  // Preserve the existing indentation before \contenu
  const indent = m[2] ?? "";

  const insertion = `${indent}\\difficulte{}\n`;
  const result = content.slice(0, lineStart) + insertion + content.slice(lineStart);
  return { changed: true, result, reason: "inserted before \\contenu" };
}

async function processFile(file) {
  const original = await fs.readFile(file, "utf8");
  const { changed, result, reason } = insertDifficulteBeforeContenu(original);
  return { file, changed, reason, original, result };
}

(async () => {
  const results = [];
  for (const root of ROOTS) {
    try {
      for await (const file of walk(root)) {
        results.push(await processFile(file));
      }
    } catch (e) {
      console.error(`⚠️  Cannot read ${root}:`, e.message);
    }
  }

  // Write changes (or simulate)
  let changedCount = 0;
  for (const r of results) {
    if (r.changed) {
      changedCount++;
      if (dryRun) {
        console.log(`DRY-RUN: would update ${r.file} (${r.reason})`);
      } else {
        // backup then write
        const bak = r.file + ".bak";
        try {
          await fs.writeFile(bak, r.original, "utf8");
          await fs.writeFile(r.file, r.result, "utf8");
          console.log(`✅ updated ${r.file} (${r.reason}) [backup: ${path.basename(bak)}]`);
        } catch (e) {
          console.error(`❌ failed to update ${r.file}:`, e.message);
        }
      }
    } else {
      // Only log interesting no-ops
      if (r.reason !== "already has \\difficulte") {
        console.log(`↪️  skipped ${r.file} (${r.reason})`);
      }
    }
  }

  const summary = {
    scanned: results.length,
    updated: results.filter(r => r.changed).length,
    withDifficulteAlready: results.filter(r => r.reason === "already has \\difficulte").length,
    withoutContenu: results.filter(r => r.reason === "no \\contenu found").length
  };
  console.log("\nSummary:", summary);
})();
