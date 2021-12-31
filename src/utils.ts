import * as colors from "colorette";
import { execa } from "execa";
import figures from "figures";

export function hr(text: string) {
  const char = colors.green(figures.pointer);
  console.log(`${char.repeat(5)} ${colors.bold(text)}`);
}

export function runCommandWithSideEffects(
  command: string,
  args: string[],
  dryRun?: boolean
) {
  if (dryRun) {
    console.log(`Dry run: ${command} ${args.join(" ")}`);
    return;
  }
  return execa(command, args, { stdio: "inherit" });
}
