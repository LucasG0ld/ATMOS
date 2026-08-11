import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { gzipSync } from "node:zlib";

const projectRoot = resolve(import.meta.dirname, "..");
const nextDirectory = resolve(projectRoot, ".next");

const routes = [
  {
    label: "Home",
    manifestPath: "server/app/page_client-reference-manifest.js",
    manifestKey: "/page",
    entryKey: "[project]/src/app/page",
    javascriptBudget: 100 * 1024,
    cssBudget: 50 * 1024,
  },
  {
    label: "Player",
    manifestPath:
      "server/app/(session)/atmosphere/[slug]/page_client-reference-manifest.js",
    manifestKey: "/(session)/atmosphere/[slug]/page",
    entryKey: "[project]/src/app/(session)/atmosphere/[slug]/page",
    javascriptBudget: 140 * 1024,
    cssBudget: 60 * 1024,
  },
  {
    label: "Composer",
    manifestPath:
      "server/app/(session)/compose/page_client-reference-manifest.js",
    manifestKey: "/(session)/compose/page",
    entryKey: "[project]/src/app/(session)/compose/page",
    javascriptBudget: 180 * 1024,
    cssBudget: 70 * 1024,
  },
];

async function readManifest(route) {
  const source = await readFile(
    resolve(nextDirectory, route.manifestPath),
    "utf8",
  );
  const sandbox = { globalThis: {} };
  runInNewContext(source, sandbox);
  return sandbox.globalThis.__RSC_MANIFEST?.[route.manifestKey];
}

async function compressedSize(paths) {
  let total = 0;
  for (const path of new Set(paths)) {
    total += gzipSync(await readFile(resolve(nextDirectory, path))).length;
  }
  return total;
}

function assertBudget(label, actual, budget) {
  if (actual > budget) {
    throw new Error(
      `${label} exceeds budget: ${(actual / 1024).toFixed(1)} KiB / ${(budget / 1024).toFixed(1)} KiB`,
    );
  }
}

for (const route of routes) {
  const manifest = await readManifest(route);
  if (!manifest) throw new Error(`Missing build manifest for ${route.label}`);

  const javascriptFiles = manifest.entryJSFiles[route.entryKey] ?? [];
  const cssFiles = (manifest.entryCSSFiles[route.entryKey] ?? []).map(
    ({ path }) => path,
  );
  const javascriptSize = await compressedSize(javascriptFiles);
  const cssSize = await compressedSize(cssFiles);

  assertBudget(
    `${route.label} JavaScript`,
    javascriptSize,
    route.javascriptBudget,
  );
  assertBudget(`${route.label} CSS`, cssSize, route.cssBudget);
  console.log(
    `${route.label}: JS ${(javascriptSize / 1024).toFixed(1)} KiB / ${(route.javascriptBudget / 1024).toFixed(0)} KiB, CSS ${(cssSize / 1024).toFixed(1)} KiB / ${(route.cssBudget / 1024).toFixed(0)} KiB.`,
  );
}

const mediaDirectory = resolve(nextDirectory, "static", "media");
const fontFiles = (await readdir(mediaDirectory)).filter((name) =>
  name.endsWith(".woff2"),
);
let fontSize = 0;
for (const filename of fontFiles) {
  fontSize += (await stat(resolve(mediaDirectory, filename))).size;
}
assertBudget("Fonts", fontSize, 120 * 1024);
console.log(`Fonts: ${(fontSize / 1024).toFixed(1)} KiB / 120 KiB.`);
