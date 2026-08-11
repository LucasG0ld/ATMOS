import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static");

const projectRoot = resolve(import.meta.dirname, "..");
const cacheDirectory = join(projectRoot, ".cache", "audio");
const outputDirectory = join(projectRoot, "public", "audio");

function continuousLoop({
  crossfade,
  duration,
  loudness = -24,
  start = 0,
  treatment = "",
}) {
  const sourceDuration = duration + crossfade;
  const treatmentFilter = treatment ? `${treatment},` : "";

  return `[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=mono,atrim=start=${start}:duration=${sourceDuration},asetpts=PTS-STARTPTS,${treatmentFilter}asplit=3[a][b][c];[a]atrim=start=${crossfade}:end=${duration},asetpts=PTS-STARTPTS[middle];[b]atrim=start=0:end=${crossfade},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=${crossfade}[head];[c]atrim=start=${duration}:end=${sourceDuration},asetpts=PTS-STARTPTS,afade=t=out:st=0:d=${crossfade}[tail];[tail][head]amix=inputs=2:duration=longest:normalize=0[seam];[middle][seam]concat=n=2:v=0:a=1,loudnorm=I=${loudness}:TP=-3:LRA=7[out]`;
}

const sources = [
  {
    id: "rain",
    url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Rain_(1).ogg",
    sha256: "31efcbe952a3989a9276774e2d7be61a2dc98fdd785a94d1435fc19cda9a84d1",
    filename: "rain-source.ogg",
    filter:
      "[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=mono,atrim=start=0:duration=44.9,asetpts=PTS-STARTPTS,asplit=3[a][b][c];[a]atrim=start=3:end=41.9,asetpts=PTS-STARTPTS[middle];[b]atrim=start=0:end=3,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=3[head];[c]atrim=start=41.9:end=44.9,asetpts=PTS-STARTPTS,afade=t=out:st=0:d=3[tail];[tail][head]amix=inputs=2:duration=longest:normalize=0[seam];[middle][seam]concat=n=2:v=0:a=1,loudnorm=I=-24:TP=-3:LRA=7[out]",
  },
  {
    id: "window-rain",
    url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Rain_against_the_window.ogg",
    sha256: "85be295e9936fbf003ae5dbc0e106b77e60854ea4b19bfb7b232420f291a737e",
    filename: "window-rain-source.ogg",
    filter:
      "[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=mono,atrim=start=5:duration=70,asetpts=PTS-STARTPTS,asplit=3[a][b][c];[a]atrim=start=4:end=66,asetpts=PTS-STARTPTS[middle];[b]atrim=start=0:end=4,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=4[head];[c]atrim=start=66:end=70,asetpts=PTS-STARTPTS,afade=t=out:st=0:d=4[tail];[tail][head]amix=inputs=2:duration=longest:normalize=0[seam];[middle][seam]concat=n=2:v=0:a=1,loudnorm=I=-24:TP=-3:LRA=7[out]",
  },
  {
    id: "distant-thunder",
    url: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Rain_and_thunder.ogg",
    sha256: "cbfd7b7504bc4e53d6e56ac8d933ba56f97cc28f15a46800c74c2d8eccb3fa89",
    filename: "distant-thunder-source.ogg",
    filter:
      "[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=mono,atrim=start=0:duration=18.8,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=2,afade=t=out:st=14.8:d=4,volume=-6dB,apad=whole_dur=60,atrim=duration=60[out]",
  },
  {
    id: "cafe-room",
    url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/5/54/Cafe_ambiance.ogg/Cafe_ambiance.ogg.mp3",
    sha256: "0de35986939e84d918bcd0ce893660472ac5bb9f5ef05cb2dbc659ab44fbd5c5",
    filename: "cafe-ambiance-source.mp3",
    filter: continuousLoop({
      start: 120,
      duration: 54,
      crossfade: 4,
      loudness: -21.5,
      treatment: "highpass=f=70,lowpass=f=1600",
    }),
  },
  {
    id: "soft-clatter",
    url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/2b/Binging_glass.ogg/Binging_glass.ogg.mp3",
    sha256: "707167a966aee2137c52a10b6699ccbcf1eab53b183fb1c1c8792c2ccb344d6e",
    filename: "binging-glass-source.mp3",
    filter:
      "[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=mono,atrim=start=0:duration=8,asetpts=PTS-STARTPTS,highpass=f=180,lowpass=f=8000,afade=t=in:st=0:d=0.2,afade=t=out:st=6:d=2,loudnorm=I=-24:TP=-6:LRA=7,apad=whole_dur=60,atrim=duration=60[out]",
  },
  {
    id: "morning-street",
    url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7c/Sunday_in_the_city_street_noise3.ogg/Sunday_in_the_city_street_noise3.ogg.mp3",
    sha256: "3af0bf9630992f4086374236a3bad68df740feae0511d4f32a36c3b23d7cb340",
    filename: "city-street-source.mp3",
    filter: continuousLoop({
      start: 45,
      duration: 54,
      crossfade: 4,
      loudness: -21.5,
      treatment: "highpass=f=80,lowpass=f=6000",
    }),
  },
  {
    id: "forest-air",
    url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0a/20090610_0_ambience.ogg/20090610_0_ambience.ogg.mp3",
    sha256: "f438752983df422c2fecd9efd0c590b1d7bd93c9c3573465e32e39c9ad2cfb20",
    filename: "forest-ambience-source.mp3",
    filter: continuousLoop({
      start: 18,
      duration: 54,
      crossfade: 4,
      treatment: "highpass=f=60,lowpass=f=12000",
    }),
  },
  {
    id: "moving-leaves",
    url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/db/Rustling_leaves_%28Gravity_Sound%29.wav/Rustling_leaves_%28Gravity_Sound%29.wav.mp3",
    sha256: "ed4f1f1d40e0593f09b0d5cd4a4c03b532e5b6cd47a8e99961f763063336cbd7",
    filename: "rustling-leaves-source.mp3",
    filter: continuousLoop({
      duration: 18,
      crossfade: 3,
      treatment: "highpass=f=120,lowpass=f=9000",
    }),
  },
  {
    id: "distant-stream",
    url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/21/Shallow_small_river_with_stony_riverbed.ogg/Shallow_small_river_with_stony_riverbed.ogg.mp3",
    sha256: "65807549920d1d860bc00cd48b4fe0b548870ee388a4de360768dee486402e15",
    filename: "small-river-source.mp3",
    filter: continuousLoop({
      duration: 14,
      crossfade: 3,
      treatment: "highpass=f=90,lowpass=f=5500",
    }),
  },
  {
    id: "fire",
    url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d8/Dry_grass_burning_in_open_fireplace.ogg/Dry_grass_burning_in_open_fireplace.ogg.mp3",
    sha256: "39aad0442716c9a28c34174a8a949af2a164081616610e320227c4d53c7b0e70",
    filename: "fireplace-source.mp3",
    filter: continuousLoop({
      duration: 21,
      crossfade: 3,
      loudness: -23.5,
      treatment: "highpass=f=60,lowpass=f=9000",
    }),
  },
  {
    id: "winter-wind",
    url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/2d/Howling_wind.ogg/Howling_wind.ogg.mp3",
    sha256: "8568e8b82cfbe98f8213717eaf3afcec55b50819e9605c707652c70899cfd514",
    filename: "winter-wind-source.mp3",
    filter: continuousLoop({
      start: 24,
      duration: 54,
      crossfade: 4,
      treatment: "highpass=f=45,lowpass=f=7000",
    }),
  },
  {
    id: "quiet-room",
    url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3d/Cooker_hood.ogg/Cooker_hood.ogg.mp3",
    sha256: "abf089cd40478b8d86334a61995cd192df36986a63c29a4b46376d82ff59d60d",
    filename: "quiet-room-source.mp3",
    filter: continuousLoop({
      duration: 10,
      crossfade: 3,
      treatment: "highpass=f=50,lowpass=f=2500",
    }),
  },
];

async function sha256(path) {
  return createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
}

async function downloadSource(source) {
  const path = join(cacheDirectory, source.filename);

  try {
    if ((await sha256(path)) === source.sha256) return path;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  let response;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    response = await fetch(source.url, {
      headers: {
        "user-agent":
          "ATMOS audio asset preparation/0.2 (github.com/LucasG0ld/ATMOS)",
      },
    });
    if (response.ok) break;
    if (response.status !== 429 || attempt === 4) {
      throw new Error(
        `Unable to download ${source.id}: HTTP ${response.status}`,
      );
    }

    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : Number.NaN;
    const delayMs = Number.isFinite(retryAfter)
      ? Math.min(retryAfter * 1_000, 30_000)
      : 2 ** (attempt + 1) * 1_000;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, delayMs));
  }

  const temporaryPath = `${path}.download`;
  await writeFile(temporaryPath, Buffer.from(await response.arrayBuffer()));
  const actualHash = await sha256(temporaryPath);
  if (actualHash !== source.sha256) {
    await rm(temporaryPath, { force: true });
    throw new Error(
      `Unexpected SHA-256 for ${source.id}: ${actualHash}. Review the source before accepting a new file.`,
    );
  }

  await rename(temporaryPath, path);
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  return path;
}

function runFfmpeg(arguments_) {
  return new Promise((resolvePromise, reject) => {
    const process = spawn(ffmpegPath, arguments_, { stdio: "inherit" });
    process.on("error", reject);
    process.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
}

async function encode(source, inputPath) {
  const outputPath = join(outputDirectory, `${source.id}.mp3`);
  const temporaryPath = `${outputPath}.tmp.mp3`;

  await runFfmpeg([
    "-hide_banner",
    "-loglevel",
    "warning",
    "-y",
    "-i",
    inputPath,
    "-filter_complex",
    source.filter,
    "-map",
    "[out]",
    "-ar",
    "44100",
    "-ac",
    "1",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "96k",
    "-map_metadata",
    "-1",
    temporaryPath,
  ]);

  await rename(temporaryPath, outputPath);
  console.log(`Prepared public/audio/${basename(outputPath)}`);
}

await mkdir(cacheDirectory, { recursive: true });
await mkdir(outputDirectory, { recursive: true });

for (const source of sources) {
  const inputPath = await downloadSource(source);
  await encode(source, inputPath);
}
