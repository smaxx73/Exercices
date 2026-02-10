# Automatiser l'import d'exercices Markdown vers `src/<uuid>.tex`

## Objectif
Partir d'un fichier Markdown contenant des blocs LaTeX (entre ```latex ... ```), puis :
- générer un UUID (4 caractères) pour chaque exercice via `tools/generate_uuid.js`
- remplacer `\uuid{...}` dans le bloc
- appliquer des champs fixes (ex: auteur, niveau)
- créer un fichier `src/<uuid>.tex` par exercice

## Prérequis
- Node.js installé
- `tools/generate_uuid.js` existant et fonctionnel

## Script d'automatisation
Créer `tools/import_markdown_to_src.js` :

```js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function usage() {
  console.error("Usage: node tools/import_markdown_to_src.js <input.md> [author] [niveau]");
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
    console: { log: (v) => { uuid = String(v); } },
    Math,
  };
  vm.runInNewContext(generatorCode, sandbox);
  return uuid.trim();
}

const raw = fs.readFileSync(inputPath, "utf8");
const blocks = [...raw.matchAll(/```latex\n([\s\S]*?)```/g)].map((m) => m[1].trim() + "\n");

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
    if (i === 49) throw new Error("Impossible de trouver un UUID unique.");
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
```

## Utilisation
Exemple avec ton cas :

```bash
node tools/import_markdown_to_src.js src_raw/integration_erwan.md "Erwan L'Haridon" "L2"
```

Résultat :
- création de `src/<uuid>.tex` pour chaque exercice
- affichage final des UUID séparés par des virgules

## Vérifications rapides
```bash
rg '^\\uuid{' src/*.tex
rg '^\\auteur{' src/*.tex
rg '^\\niveau{' src/*.tex
```

