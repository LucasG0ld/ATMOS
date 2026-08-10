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

  const response = await fetch(source.url, {
    headers: { "user-agent": "ATMOS audio asset preparation/0.1" },
  });
  if (!response.ok) {
    throw new Error(`Unable to download ${source.id}: HTTP ${response.status}`);
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
