const fs = require("fs");
const path = require("path");

const BRAZE =
  'maven { url = uri("https://artifactory.infra.braze.com/artifactory/braze-maven") }';
const pluginRoot = path.join(
  __dirname,
  "node_modules/@react-native/gradle-plugin"
);

if (!fs.existsSync(pluginRoot)) {
  process.exit(0);
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(p);
      continue;
    }
    if (!ent.name.endsWith(".gradle") && !ent.name.endsWith(".gradle.kts")) {
      continue;
    }
    let text = fs.readFileSync(p, "utf8");
    if (text.includes("braze-maven")) {
      continue;
    }
    if (!/repositories\s*\{/.test(text)) {
      continue;
    }
    fs.writeFileSync(
      p,
      text.replace(/repositories\s*\{/g, `repositories {\n    ${BRAZE}\n`)
    );
    console.log(`*** Prepended braze-maven in ${p}`);
  }
}

walk(pluginRoot);
