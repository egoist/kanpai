import { execa } from "execa";

export async function getLatestTag(): Promise<string | null> {
  try {
    const { stdout } = await execa("git", ["describe", "--abbrev=0", "--tags"]);
    return stdout;
  } catch (error: any) {
    if (
      error.stderr &&
      (error.stderr.includes("fatal: No tags can describe") ||
        error.stderr.includes(
          "fatal: No names found, cannot describe anything"
        ))
    ) {
      return null;
    }
    throw error;
  }
}
