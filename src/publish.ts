import Path from "path";
import symbols from "log-symbols";
import figures from "figures";
import { execa } from "execa";
import commitsBetween from "commits-between";
import table from "text-table";
import * as colors from "colorette";
import { ensureGit } from "./ensure-git";
import { config } from "./config";

function hr(text: string) {
  const char = colors.green(figures.pointer);
  console.log(`${char.repeat(5)} ${colors.bold(text)}`);
}

function failed(status = 1) {
  console.log(colors.red(`${symbols.error} Failed to publish new version.`));
  process.exit(status);
}

async function getLatestTag(): Promise<string | null> {
  try {
    const { stdout } = await execa("git", ["describe", "--abbrev=0", "--tags"]);
    return stdout;
  } catch (error: any) {
    if (
      error.stdout &&
      error.stdout.includes("fatal: No names found, cannot describe anything")
    ) {
      return null;
    }
    throw error;
  }
}

function readKanpai() {
  try {
    const pkg = require(Path.join(process.cwd(), "package.json"));
    return (pkg && pkg.kanpai) || {};
  } catch (err) {
    return {};
  }
}

function runCommandWithSideEffects(
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

export async function publish(
  type: string,
  options: {
    anyBranch?: boolean;
    pushOnly?: boolean;
    skipTest?: boolean;
    commitMessage?: string;
    test?: string;
    next?: boolean;
    channel?: string;
    dryRun?: boolean;
  }
) {
  const kanpai = readKanpai();
  hr("CHECK GIT");
  try {
    await ensureGit({
      anyBranch: options.anyBranch,
    });
    console.log("No conflicts!");
  } catch (err: any) {
    console.error(err.message);
    failed();
  }

  const latestTag = await getLatestTag();
  if (latestTag) {
    hr(`COMMITS SINCE ${latestTag}`);
    const commits = await commitsBetween({ from: latestTag });
    if (commits.length === 0) {
      console.log(
        `You haven't made any changes since last release (${latestTag}), aborted.`
      );
      failed();
    }
    console.log(
      table(
        commits.map((commit) => {
          return [
            `${figures.arrowRight} ${commit.subject}`,
            colors.dim(commit.author.date.toString()),
          ];
        })
      )
    );
  } else {
    console.log(
      "It seems to be your first time to publish a new release, not bad."
    );
  }

  if (!options.skipTest) {
    hr("TEST");
    const defaultTest = kanpai.scripts && kanpai.scripts.kanpai;
    const testCommand =
      options.test || kanpai.test || defaultTest || config.get("test");
    await execa("npm", ["run", testCommand], { stdio: "inherit" });
  }

  if (!options.pushOnly) {
    hr("VERSION");
    const commitMessage = options.commitMessage || config.get("commitMessage");
    await runCommandWithSideEffects(
      "npm",
      ["version", type, "-m", commitMessage],
      options.dryRun
    );

    hr("PUBLISH");
    const npmOptions = ["publish"];
    if (options.channel) {
      npmOptions.push("--tag", options.channel);
    }
    await runCommandWithSideEffects("npm", npmOptions, options.dryRun);
    // TODO: revert the commit and git tag when publish failed
  }

  hr("PUSH");
  await runCommandWithSideEffects(
    "git",
    ["push", "--follow-tags"],
    options.dryRun
  );

  console.log(`${symbols.success} Everything done!`);
}
