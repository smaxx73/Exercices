#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";

const USAGE = `
Usage:
  node add-niveau-module.mjs <SRC_DIR> --csv <CSV> [--out-dir <OUT>] [--dry-run]
                              [--report <PATH>] [--no-exit-on-error] [--list-only]
`;

function argErr(msg){ console.error(msg); console.error(USAGE); process.exit(2); }
function parseArgs(argv){
  const args={_:[]};
  for(let i=2;i<argv.length;i++){
    const a=argv[i];
    if(!a.startsWith("--")) args._.push(a);
    else if(a==="--csv") args.csv=argv[++i];
    else if(a==="--out-dir") args.outDir=argv[++i];
    else if(a==="--dry-run") args.dryRun=true;
    else if(a==="--report") args.report=argv[++i];
    else if(a==="--no-exit-on-error") args.noExitOnError=true;
    else if(a==="--list-only") args.listOnly=true;
    else argErr(`Option inconnue: ${a}`);
  }
  if(args._.length!==1) argErr("Tu dois fournir exactement un SRC_DIR.");
  if(!args.csv) argErr("Option obligatoire: --csv <CSV>");
  return args;
}

function normalizeKey(s){
  return String(s).normalize("NFD").replace(/\p{Diacritic}/gu,"").replace(/\s+/g," ").trim().toLowerCase();
}

async function loadLookup(csvPath){
  const text=(await fs.readFile(csvPath,"utf8"));
  const recs=parse(text,{columns:true,skip_empty_lines:true,relax_column_count:true});
  const required=["chapitre_titre","module_niveau","module"];
  if(!recs.length || !required.every(c=>c in recs[0])) throw new Error(`CSV doit contenir: ${required.join(", ")}`);
  const map=new Map();
  for(const r of recs){
    map.set(normalizeKey(r.chapitre_titre),{
      niveau:String(r.module_niveau??"").trim(),
      module:String(r.module??"").trim(),
      rawChapitre:String(r.chapitre_titre??"").trim()
    });
  }
  return map;
}

const R_CHAP=/\\chapitre\{([^}]*)\}/;
const R_UUID=/\\uuid\{([^}]*)\}/;
const R_HAS_NIV=/\\niveau\{/;
const R_HAS_MOD=/\\module\{/;

function insertAfterLine(content, endIdx){
  const p=content.indexOf("\n", endIdx);
  return p===-1 ? content.length : p+1;
}

function injectTags(tex, chapitre, niveau, module){
  const m=tex.match(R_CHAP); if(!m) return {text:tex,status:"no_chapitre"};
  const end=(m.index??0)+m[0].length;
  const needNiv=!R_HAS_NIV.test(tex) && niveau;
  const needMod=!R_HAS_MOD.test(tex) && module;
  if(!needNiv && !needMod) return {text:tex,status:"skipped"};
  const ins=[]; if(needNiv) ins.push(`\\niveau{${niveau}}`); if(needMod) ins.push(`\\module{${module}}`);
  const at=insertAfterLine(tex,end);
  const newText=tex.slice(0,at)+ins.join("\n")+"\n"+tex.slice(at);
  return {text:newText,status:"inserted",inserted:[needNiv&&"niveau",needMod&&"module"].filter(Boolean)};
}

async function* walkTex(dir){
  const ents=await fs.readdir(dir,{withFileTypes:true});
  for(const e of ents){
    const p=path.join(dir,e.name);
    if(e.isDirectory()) yield* walkTex(p);
    else if(e.isFile() && p.endsWith(".tex")) yield p;
  }
}

async function main(){
  const args=parseArgs(process.argv);
  const srcDir=path.resolve(args._[0]);
  const outDir=args.outDir?path.resolve(args.outDir):null;
  const csvPath=path.resolve(args.csv);
  const dry=!!args.dryRun, listOnly=!!args.listOnly;

  const lookup=await loadLookup(csvPath);
  if(outDir && !dry) await fs.mkdir(outDir,{recursive:true});

  const report={ summary:{processed:0,inserted:0,skipped:0,errors:0,missingChapitreUuids:[]}, files:{} };

  for await (const fp of walkTex(srcDir)){
    report.summary.processed++;
    try{
      const raw=await fs.readFile(fp,"utf8");
      const uuid=raw.match(R_UUID)?.[1]?.trim() || null;

      const mChap=raw.match(R_CHAP);
      if(!mChap){
        if(uuid) report.summary.missingChapitreUuids.push(uuid);
        report.files[fp]={status:"error",error:"\\chapitre{} introuvable",uuid};
        report.summary.errors++;
        continue;
      }

      const chapitre=mChap[1].trim();
      const rec=lookup.get(normalizeKey(chapitre));
      if(!rec){
        report.files[fp]={status:"error",error:"chapitre non trouvé dans le CSV",chapitre,uuid};
        report.summary.errors++;
        continue;
      }

      const res=injectTags(raw,chapitre,rec.niveau,rec.module);
      // Pas de contenu dans le rapport en dry-run
      const {text:_omit,...lite}=res;
      report.files[fp]={...lite,uuid,chapitre};
      if(res.status==="inserted") report.summary.inserted++;
      else if(res.status==="skipped") report.summary.skipped++;

      if(!dry){
        const dest=outDir?path.join(outDir,path.basename(fp)):fp;
        await fs.writeFile(dest,res.text,"utf8");
      }
    }catch(e){
      report.files[fp]={status:"error",error:String(e)};
      report.summary.errors++;
    }
  }

  if(dry && listOnly){
    // N'imprime QUE la liste des UUID où \chapitre{} est manquant
    for(const u of report.summary.missingChapitreUuids) console.log(u);
  }else{
    // Affiche aussi la liste lisible en fin de dry-run
    if(dry){
      console.error("=== UUID avec \\chapitre{} manquant ===");
      if(report.summary.missingChapitreUuids.length){
        for(const u of report.summary.missingChapitreUuids) console.error(u);
      }else{
        console.error("(aucun)");
      }
      console.error("=== fin de liste ===");
    }
    const json=JSON.stringify(report,null,2);
    console.log(json);
    const outPath=args.report?path.resolve(args.report):(outDir||srcDir)+"/add-niveau-module.report.json";
    try{ await fs.writeFile(outPath,json,"utf8"); }catch(e){ console.error("⚠️ Écriture rapport impossible:",e); }
  }

  if(report.summary.errors>0 && !args.noExitOnError) process.exit(1);
}

main().catch(e=>{ console.error("Fatal:",e); process.exit(1); });
