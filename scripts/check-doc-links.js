const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");

const root = process.cwd();
const documents = [
  "README.md",
  "CHANGELOG.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  ...fs
    .readdirSync(path.join(root, "docs"))
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.join("docs", name)),
  "examples/README.md"
];
const missing = [];
const markdownLink = /\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;

for (const document of documents) {
  const absoluteDocument = path.join(root, document);
  const source = fs.readFileSync(absoluteDocument, "utf8");

  for (const match of source.matchAll(markdownLink)) {
    const target = match[1];
    if (
      target.startsWith("#") ||
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("mailto:")
    ) {
      continue;
    }

    const relativeTarget = decodeURIComponent(target.split(/[?#]/, 1)[0]);
    const resolved = path.resolve(
      path.dirname(absoluteDocument),
      relativeTarget
    );
    if (!fs.existsSync(resolved)) {
      missing.push(`${document}: ${target}`);
    }
  }
}

if (missing.length) {
  console.error("Broken local documentation links:\n" + missing.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Checked local links in ${documents.length} documentation files.`
  );
}
