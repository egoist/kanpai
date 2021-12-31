import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  splitting: true,
  target: "node14",
  format: ["esm"],
  entry: ["./src/cli.ts", "./src/index.ts"],
  banner: {
    js: `import {createRequire as __createRequire} from 'module';var require=__createRequire(import\.meta.url);`,
  },
});
