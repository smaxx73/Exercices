#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const vm = require("vm");

function usage() {
  console.error("Usage: tools/import_markdown_to_src.js <input.md> [author] [niveau]");
  process.exit(1);
}

const input = process.argv[2];
const author = process.argv[3] || "";
const niveau = process.argv[4] || "";

if (!input) usage();

const inputPath = path.resolve(input);
const srcDir = path.resolve("src");
const generatorCode = fs.readFileSync(path.resolve("tools/generate_uuid.js"), "utf8");

function generateUuidFromScript() {
  let uuid = "";
  const sandbox = {
    console: {
      log: (value) => {
        uuid = String(value);
      },
    },
    Math,
  };

  vm.runInNewContext(generatorCode, sandbox);
  return uuid.trim();
}

const raw = fs.readFileSync(inputPath, "utf8");
const blocks = [...raw.matchAll(/```latex\n([\s\S]*?)```/g)].map((match) => `${match[1].trim()}\n`);

if (blocks.length === 0) {
  throw new Error("Aucun bloc ```latex trouvé.");
}

const created = [];

for (const block of blocks) {
  let uuid = "";
  let outputFile = "";

  for (let i = 0; i < 50; i++) {
    uuid = generateUuidFromScript();
    if (!/^[A-Za-z0-9]{4}$/.test(uuid)) continue;
    outputFile = path.join(srcDir, `${uuid}.tex`);
    if (!fs.existsSync(outputFile)) break;
    if (i === 49) {
      throw new Error("Impossible de trouver un UUID unique.");
    }
  }

  let tex = block.replace(/\\uuid\{[^}]*\}/, `\\uuid{${uuid}}`);

  if (author) {
    tex = tex.replace(/\\auteur\{[^}]*\}/, `\\auteur{${author}}`);
  }

  if (niveau) {
    tex = tex.replace(/\\niveau\{[^}]*\}/, `\\niveau{${niveau}}`);
  }

  fs.writeFileSync(outputFile, tex, "utf8");
  created.push(uuid);
}

console.log(created.join(","));
