import { spawnSync } from "node:child_process";
import { stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const ffmpegPath = process.env.FFMPEG_PATH || require("ffmpeg-static");
const audioDirectory = resolve(import.meta.dirname, "..", "public", "audio");
const maxTotalBytes = 8 * 1024 * 1024;

const expectedFiles = [
  { filename: "rain.mp3", duration: 41.9 },
  { filename: "window-rain.mp3", duration: 66 },
  { filename: "distant-thunder.mp3", duration: 60 },
];

function inspect(path) {
  const result = spawnSync(
    ffmpegPath,
    ["-hide_banner", "-i", path, "-f", "null", "-"],
    { encoding: "utf8", maxBuffer: 2 * 1024 * 1024 },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr);

  const durationMatch = result.stderr.match(
    /Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/,
  );
  const audioMatch = result.stderr.match(/Audio: mp3, 44100 Hz, mono/);
  if (!durationMatch || !audioMatch) {
    throw new Error(`Unexpected audio properties for ${path}`);
  }

  return (
    Number(durationMatch[1]) * 3600 +
    Number(durationMatch[2]) * 60 +
    Number(durationMatch[3])
  );
}

function measureBoundary(path) {
  const result = spawnSync(
    ffmpegPath,
    [
      "-v",
      "error",
      "-i",
      path,
      "-f",
      "s16le",
      "-acodec",
      "pcm_s16le",
      "-ar",
      "44100",
      "-ac",
      "1",
      "pipe:1",
    ],
    { encoding: "buffer", maxBuffer: 16 * 1024 * 1024 },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.toString("utf8"));

  const firstSample = result.stdout.readInt16LE(0);
  const lastSample = result.stdout.readInt16LE(result.stdout.length - 2);
  return Math.abs(firstSample - lastSample) / 32768;
}

let totalBytes = 0;

for (const expected of expectedFiles) {
  const path = join(audioDirectory, expected.filename);
  const file = await stat(path);
  const duration = inspect(path);
  const boundaryDelta = measureBoundary(path);

  if (Math.abs(duration - expected.duration) > 0.15) {
    throw new Error(
      `${expected.filename}: expected about ${expected.duration}s, got ${duration}s`,
    );
  }
  if (boundaryDelta > 0.05) {
    throw new Error(
      `${expected.filename}: excessive PCM delta at loop boundary (${boundaryDelta.toFixed(4)})`,
    );
  }

  totalBytes += file.size;
  console.log(
    `${expected.filename}: ${duration.toFixed(2)}s, ${(file.size / 1024).toFixed(1)} KiB, boundary Δ ${boundaryDelta.toFixed(4)}`,
  );
}

if (totalBytes > maxTotalBytes) {
  throw new Error(
    `Audio budget exceeded: ${(totalBytes / 1024 / 1024).toFixed(2)} MiB`,
  );
}

console.log(
  `Audio set valid: ${(totalBytes / 1024 / 1024).toFixed(2)} MiB / 8.00 MiB.`,
);
