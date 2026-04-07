import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import { copyFileSync, mkdirSync, readdirSync } from "fs";

const prod = process.argv[2] === "production";
const outdir = "../AIMindMap/.obsidian/plugins/dendrite";

function copyStatic() {
  copyFileSync("manifest.json", `${outdir}/manifest.json`);
  try { copyFileSync("styles.css", `${outdir}/styles.css`); } catch {}
  try {
    mkdirSync(`${outdir}/prompts`, { recursive: true });
    for (const f of readdirSync("prompts")) copyFileSync(`prompts/${f}`, `${outdir}/prompts/${f}`);
  } catch {}
}

const copyPlugin = {
  name: "copy-static",
  setup(build) {
    build.onEnd(() => { copyStatic(); });
  },
};

const ctx = await esbuild.context({
  entryPoints: ["main.ts"],
  bundle: true,
  external: [
    "obsidian", "electron",
    "@codemirror/autocomplete", "@codemirror/collab", "@codemirror/commands",
    "@codemirror/language", "@codemirror/lint", "@codemirror/search",
    "@codemirror/state", "@codemirror/view",
    "@lezer/common", "@lezer/highlight", "@lezer/lr",
    ...builtins,
  ],
  format: "cjs",
  target: "es2018",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: `${outdir}/main.js`,
  loader: { ".md": "text" },
  plugins: [copyPlugin],
});

if (prod) { await ctx.rebuild(); process.exit(0); }
else { await ctx.watch(); }
