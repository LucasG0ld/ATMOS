import { spawnSync } from "node:child_process";
import { stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const ffmpegPath = process.env.FFMPEG_PATH || require("ffmpeg-static");
const imageDirectory = resolve(
  import.meta.dirname,
  "..",
  "public",
  "images",
  "atmospheres",
);
const maxImageBytes = 500 * 1024;

const expectedFiles = [
  {
    filename: "quiet-coffee-shop-desktop.webp",
    width: 1536,
    height: 864,
  },
  {
    filename: "quiet-coffee-shop-mobile.webp",
    width: 640,
    height: 1024,
  },
  { filename: "deep-forest-desktop.webp", width: 1536, height: 864 },
  { filename: "deep-forest-mobile.webp", width: 640, height: 1024 },
  { filename: "fireplace-desktop.webp", width: 1536, height: 864 },
  { filename: "fireplace-mobile.webp", width: 640, height: 1024 },
];

function inspectDimensions(path) {
  const result = spawnSync(
    ffmpegPath,
    ["-hide_banner", "-i", path, "-frames:v", "1", "-f", "null", "-"],
    { encoding: "utf8", maxBuffer: 2 * 1024 * 1024 },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr);

  const dimensions = result.stderr.match(
    /Video: webp[^\n]*?(\d{2,5})x(\d{2,5})/,
  );
  if (!dimensions)
    throw new Error(`Unable to inspect WebP dimensions: ${path}`);

  return { width: Number(dimensions[1]), height: Number(dimensions[2]) };
}

let totalBytes = 0;
for (const expected of expectedFiles) {
  const path = join(imageDirectory, expected.filename);
  const { size } = await stat(path);
  const dimensions = inspectDimensions(path);

  if (size > maxImageBytes) {
    throw new Error(
      `${expected.filename} exceeds image budget: ${(size / 1024).toFixed(1)} KiB / 500 KiB`,
    );
  }
  if (
    dimensions.width !== expected.width ||
    dimensions.height !== expected.height
  ) {
    throw new Error(
      `${expected.filename} has unexpected dimensions: ${dimensions.width}x${dimensions.height}`,
    );
  }

  totalBytes += size;
  console.log(
    `${expected.filename}: ${dimensions.width}x${dimensions.height}, ${(size / 1024).toFixed(1)} KiB / 500 KiB.`,
  );
}

console.log(
  `Visual set valid: ${(totalBytes / 1024).toFixed(1)} KiB across ${expectedFiles.length} responsive assets.`,
);
