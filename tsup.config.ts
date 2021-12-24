import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  splitting: true,
  entry: ["./src/cli.ts", "./src/index.ts"],
});
