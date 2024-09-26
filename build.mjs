import { build } from "esbuild";

// run tsc before esbuild
build({
    entryPoints: ["output/tsc/dnsconfig.js"],
    outfile: "output/esbuild/dnsconfig.js",
    bundle: true,
    target: ["es5"],
    platform: "neutral",
    minify: false,
}).catch(() => process.exit(1));
