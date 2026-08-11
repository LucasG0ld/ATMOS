import { spawnSync } from "node:child_process";
import { stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const ffmpegPath = process.env.FFMPEG_PATH || require("ffmpeg-static");
const audioDirectory = resolve(import.meta.dirname, "..", "public", "audio");
const maxAtmosphereBytes = 3 * 1024 * 1024;
const maxTotalBytes = 12 * 1024 * 1024;

const expectedFiles = [
  { atmosphere: "Rainy Apartment", filename: "rain.mp3", duration: 41.9 },
  {
    atmosphere: "Rainy Apartment",
    filename: "window-rain.mp3",
    duration: 66,
  },
  {
    atmosphere: "Rainy Apartment",
    filename: "distant-thunder.mp3",
    duration: 60,
  },
  {
    atmosphere: "Quiet Coffee Shop",
    filename: "cafe-room.mp3",
    duration: 54,
  },
  {
    atmosphere: "Quiet Coffee Shop",
    filename: "soft-clatter.mp3",
    duration: 60,
  },
  {
    atmosphere: "Quiet Coffee Shop",
    filename: "morning-street.mp3",
    duration: 54,
  },
  {
    atmosphere: "Deep Forest",
    filename: "forest-air.mp3",
    duration: 54,
  },
  {
    atmosphere: "Deep Forest",
    filename: "moving-leaves.mp3",
    duration: 18,
  },
  {
    atmosphere: "Deep Forest",
    filename: "distant-stream.mp3",
    duration: 14,
  },
  { atmosphere: "Fireplace", filename: "fire.mp3", duration: 21 },
  { atmosphere: "Fireplace", filename: "winter-wind.mp3", duration: 54 },
  { atmosphere: "Fireplace", filename: "quiet-room.mp3", duration: 10 },
];

const defaultMixes = [
  {
    atmosphere: "Rainy Apartment",
    layers: [
      { filename: "rain.mp3", volume: 0.65 },
      { filename: "window-rain.mp3", volume: 0.4 },
      { filename: "distant-thunder.mp3", volume: 0.15 },
    ],
  },
  {
    atmosphere: "Quiet Coffee Shop",
    layers: [
      { filename: "cafe-room.mp3", volume: 0.55 },
      { filename: "soft-clatter.mp3", volume: 0.24 },
      { filename: "morning-street.mp3", volume: 0.14 },
    ],
  },
  {
    atmosphere: "Deep Forest",
    layers: [
      { filename: "forest-air.mp3", volume: 0.58 },
      { filename: "moving-leaves.mp3", volume: 0.3 },
      { filename: "distant-stream.mp3", volume: 0.18 },
    ],
  },
  {
    atmosphere: "Fireplace",
    layers: [
      { filename: "fire.mp3", volume: 0.64 },
      { filename: "winter-wind.mp3", volume: 0.18 },
      { filename: "quiet-room.mp3", volume: 0.12 },
    ],
  },
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

function measureMix(mix) {
  const arguments_ = ["-hide_banner"];
  for (const layer of mix.layers) {
    arguments_.push(
      "-stream_loop",
      "-1",
      "-i",
      join(audioDirectory, layer.filename),
    );
  }

  const gains = mix.layers
    .map((layer, index) => `[${index}:a]volume=${layer.volume}[layer${index}]`)
    .join(";");
  const inputs = mix.layers.map((_, index) => `[layer${index}]`).join("");
  arguments_.push(
    "-filter_complex",
    `${gains};${inputs}amix=inputs=${mix.layers.length}:duration=longest:normalize=0,atrim=duration=60,ebur128=peak=true[out]`,
    "-map",
    "[out]",
    "-f",
    "null",
    "-",
  );

  const result = spawnSync(ffmpegPath, arguments_, {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr);

  const summaries = [
    ...result.stderr.matchAll(
      /Summary:\s+Integrated loudness:[\s\S]*?I:\s+(-?[\d.]+) LUFS[\s\S]*?True peak:[\s\S]*?Peak:\s+(-?[\d.]+) dBFS/g,
    ),
  ];
  const summary = summaries.at(-1);
  if (!summary) throw new Error(`Unable to measure ${mix.atmosphere} mix.`);

  return { loudness: Number(summary[1]), truePeak: Number(summary[2]) };
}

let totalBytes = 0;
const atmosphereBytes = new Map();

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
  atmosphereBytes.set(
    expected.atmosphere,
    (atmosphereBytes.get(expected.atmosphere) ?? 0) + file.size,
  );
  console.log(
    `${expected.filename}: ${duration.toFixed(2)}s, ${(file.size / 1024).toFixed(1)} KiB, boundary Δ ${boundaryDelta.toFixed(4)}`,
  );
}

for (const [atmosphere, bytes] of atmosphereBytes) {
  if (bytes > maxAtmosphereBytes) {
    throw new Error(
      `${atmosphere} audio budget exceeded: ${(bytes / 1024 / 1024).toFixed(2)} MiB / 3.00 MiB`,
    );
  }
  console.log(
    `${atmosphere}: ${(bytes / 1024 / 1024).toFixed(2)} MiB / 3.00 MiB.`,
  );
}

const mixMeasurements = defaultMixes.map((mix) => ({
  ...mix,
  ...measureMix(mix),
}));
for (const mix of mixMeasurements) {
  if (mix.loudness < -29 || mix.loudness > -24) {
    throw new Error(
      `${mix.atmosphere} default mix is outside the -29 to -24 LUFS window: ${mix.loudness.toFixed(1)} LUFS`,
    );
  }
  if (mix.truePeak > -1) {
    throw new Error(
      `${mix.atmosphere} default mix peak is unsafe: ${mix.truePeak.toFixed(1)} dBTP`,
    );
  }
  console.log(
    `${mix.atmosphere} default mix: ${mix.loudness.toFixed(1)} LUFS, ${mix.truePeak.toFixed(1)} dBTP.`,
  );
}

const mixLoudnesses = mixMeasurements.map(({ loudness }) => loudness);
const mixSpread = Math.max(...mixLoudnesses) - Math.min(...mixLoudnesses);
if (mixSpread > 2) {
  throw new Error(
    `Default mix loudness spread exceeds 2 LU: ${mixSpread.toFixed(1)} LU`,
  );
}
console.log(
  `Default mix loudness spread: ${mixSpread.toFixed(1)} LU / 2.0 LU.`,
);

if (totalBytes > maxTotalBytes) {
  throw new Error(
    `Audio budget exceeded: ${(totalBytes / 1024 / 1024).toFixed(2)} MiB`,
  );
}

console.log(
  `Audio catalog valid: ${(totalBytes / 1024 / 1024).toFixed(2)} MiB / 12.00 MiB.`,
);
