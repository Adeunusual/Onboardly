// scripts/zipApplicationFormPdfWorker.js
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ZIP_NAME = "applicationFormPdfWorker.zip";
const BUILD_DIR = path.resolve(".lambda-build");
const WORKER_JS = path.join(BUILD_DIR, "worker.js");

const TEMPLATE_SRC = path.resolve("src/lib/pdf/application-form/templates/npt-india-application-form-fillable.pdf");
const TEMPLATE_DIR = path.join(BUILD_DIR, "templates");
const TEMPLATE_DST = path.join(TEMPLATE_DIR, "npt-india-application-form-fillable.pdf");

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", ...opts });
}

function main() {
  fs.mkdirSync(BUILD_DIR, { recursive: true });

  // remove old zip if exists
  const zipPath = path.join(BUILD_DIR, ZIP_NAME);
  try {
    fs.unlinkSync(zipPath);
  } catch {}

  // build worker into .lambda-build/worker.js
  run("npx esbuild src/workers/applicationFormPdfWorker.ts --bundle --platform=node --target=node20 --minify --legal-comments=none --outfile=.lambda-build/worker.js");

  // stage template into .lambda-build/templates/...
  fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
  fs.copyFileSync(TEMPLATE_SRC, TEMPLATE_DST);

  // zip from inside .lambda-build so paths are correct
  run(`npx bestzip ${ZIP_NAME} worker.js templates/npt-india-application-form-fillable.pdf`, { cwd: BUILD_DIR });

  // cleanup staging artifacts (leave only the zip)
  try {
    fs.unlinkSync(WORKER_JS);
  } catch {}
  try {
    fs.rmSync(TEMPLATE_DIR, { recursive: true, force: true });
  } catch {}

  console.log(`✅ Built ${path.join(".lambda-build", ZIP_NAME)}`);
}

main();
