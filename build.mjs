import { build } from "esbuild";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
await rm("build/lambda", { recursive: true, force: true });
await mkdir("build/lambda", { recursive: true });
await cp("build/private", "build/lambda/private", { recursive: true });
await cp("gate", "build/lambda/public", { recursive: true });
await build({
  entryPoints: ["lambda/app.mjs"],
  outfile: "build/lambda/app.js",
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  minify: true,
});
await writeFile("build/lambda/package.json", '{"type":"commonjs"}\n');
