const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const expectedVersion = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "sfdx-project.json"), "utf8")
).sourceApiVersion;
const mismatches = [];

function inspectFile(filePath, pattern, label) {
  const source = fs.readFileSync(filePath, "utf8");
  const match = source.match(pattern);
  if (!match) {
    mismatches.push(
      `${path.relative(projectRoot, filePath)}: missing ${label}`
    );
  } else if (match[1] !== expectedVersion) {
    mismatches.push(
      `${path.relative(projectRoot, filePath)}: ${label} ${match[1]} != ${expectedVersion}`
    );
  }
}

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath);
    } else if (
      entry.name.endsWith("-meta.xml") &&
      !entryPath.includes(`${path.sep}permissionsets${path.sep}`)
    ) {
      inspectFile(entryPath, /<apiVersion>([^<]+)<\/apiVersion>/, "apiVersion");
    }
  }
}

walk(path.join(projectRoot, "force-app"));
walk(path.join(projectRoot, "examples"));

for (const manifest of ["package.xml", "examples-package.xml"]) {
  inspectFile(
    path.join(projectRoot, "manifest", manifest),
    /<version>([^<]+)<\/version>/,
    "manifest version"
  );
}

inspectFile(
  path.join(
    projectRoot,
    "force-app/main/default/pages/FlowConfigApexTypeBridge.page"
  ),
  /var API_VERSION = "([^"]+)"/,
  "Tooling API version"
);

if (mismatches.length) {
  process.stderr.write(
    `Salesforce API version mismatch (expected ${expectedVersion}):\n${mismatches
      .map((message) => `- ${message}`)
      .join("\n")}\n`
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    `All Salesforce metadata targets API ${expectedVersion}.\n`
  );
}
