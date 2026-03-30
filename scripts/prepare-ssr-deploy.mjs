import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const deployDir = path.join(rootDir, "ssr-deploy");

const copyTargets = [
  "server.mjs",
  "package.json",
  "package-lock.json",
  "public_html",
  "public_html-ssr",
];

const ensureExists = async (targetPath) => {
  try {
    await fs.access(targetPath);
  } catch {
    throw new Error(`Missing required build artifact: ${path.relative(rootDir, targetPath)}`);
  }
};

const main = async () => {
  await Promise.all(
    copyTargets.map((target) => ensureExists(path.join(rootDir, target))),
  );

  await fs.rm(deployDir, { recursive: true, force: true });
  await fs.mkdir(deployDir, { recursive: true });

  for (const target of copyTargets) {
    const sourcePath = path.join(rootDir, target);
    const destPath = path.join(deployDir, target);
    await fs.cp(sourcePath, destPath, { recursive: true });
  }

  const readme = [
    "SSR deployment bundle",
    "",
    "Contents:",
    "- public_html",
    "- public_html-ssr",
    "- server.mjs",
    "- package.json",
    "- package-lock.json",
    "",
    "Run on the target server:",
    "1. npm install --omit=dev",
    "2. npm start",
    "",
    "Set PORT and NODE_ENV=production as needed before starting.",
    "",
  ].join("\n");

  await fs.writeFile(path.join(deployDir, "README-DEPLOY.txt"), readme, "utf8");

  console.log(`SSR deploy bundle ready at ${path.relative(rootDir, deployDir)}`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
