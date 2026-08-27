import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.env.LRS_DATA_DIR || path.join(root, "data");
let failed = 0;
const ok = (name, detail="") => console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
const warn = (name, detail="") => console.log(`! ${name}${detail ? ` — ${detail}` : ""}`);
const bad = (name, detail="") => { failed++; console.log(`✗ ${name}${detail ? ` — ${detail}` : ""}`); };
const command = (cmd,args=["--version"]) => spawnSync(cmd,args,{stdio:"ignore",shell:process.platform==="win32"}).status===0;

console.log("\nLRS MOTORS — REAL WORLD TEST PREFLIGHT\n");
fs.existsSync(path.join(root,"package.json")) ? ok("Project files") : bad("Project files","package.json missing");
fs.existsSync(dataDir) ? ok("Data directory",dataDir) : warn("Data directory","will be created when the app starts");
command("node",["--version"]) ? ok("Node.js") : bad("Node.js","not available on PATH");
command("ffmpeg",["-version"]) ? ok("FFmpeg","reel rendering available") : warn("FFmpeg","marketing reel rendering disabled until installed");
const py = process.env.LRS_PYTHON || (process.platform==="win32" ? path.join(root,".venv-odia","Scripts","python.exe") : "python3");
fs.existsSync(py) || command(py,["--version"]) ? ok("Odia Python environment") : warn("Odia Python environment","main app still works; AI voice is optional");
const refAudio=path.join(dataDir,"voices","odia-male-reference.wav"), refText=path.join(dataDir,"voices","odia-male-reference.txt");
fs.existsSync(refAudio)&&fs.statSync(refAudio).size>1000 ? ok("Odia reference audio") : warn("Odia reference audio","AI narration disabled");
fs.existsSync(refText)&&fs.statSync(refText).size>0 ? ok("Odia reference transcript") : warn("Odia reference transcript","AI narration disabled");
const env=path.join(root,".env.local");
fs.existsSync(env) ? ok("Environment configuration") : warn("Environment configuration","check database/auth configuration before network test");

console.log("\nCore test order: Login → Add Vehicle → RC/Photos → Director Approval/Reject → Retake → Costing → Customer → Sale → Handover → Marketing\n");
if(failed){ console.error(`${failed} blocking preflight check(s) failed.`); process.exit(1); }
console.log("Core application preflight passed. Optional warnings do not block tomorrow's operational test.");
