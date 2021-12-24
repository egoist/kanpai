import fs from "fs";
import path from "path";
import symbols from "log-symbols";
import figures from "figures";
import { execa } from "execa";
import commitsBetween from "commits-between";
import table from "text-table";
import * as colors from "colorette";
import semver from "semver";
import { writePackage } from "write-pkg";
import { ensureGit } from "./ensure-git";
import { config } from "./config";
import { updateChangeLog } from "./changelog";

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

function readPkg() {
  const filepath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(filepath)) {
    throw new Error("Could not find package.json");
  }
  const content = fs.readFileSync(filepath, "utf8");
  return {
    path: filepath,
    data: JSON.parse(content),
  };
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
  const pkg = readPkg();
  const kanpai = pkg.data.kanpai || {};
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
    const newVersion =
      semver.valid(type) ||
      semver.inc(
        pkg.data.version,
        type as any,
        options.channel === "latest" ? "" : options.channel
      );
    if (!newVersion) {
      console.error(
        colors.red(`Could not bump version to ${type} from ${pkg.data.version}`)
      );
      return failed();
    }

    console.log(`Next version: ${newVersion}`);

    // Update version in package.json
    if (!options.dryRun) {
      const newPkg = { ...pkg.data };
      newPkg.version = newVersion;
      await writePackage(pkg.path, newPkg);
    }

    // Update changelog file
    if (!options.dryRun) {
      updateChangeLog(newVersion);
    }

    // Commit and tag
    await runCommandWithSideEffects(
      "git",
      ["add", "package.json", "CHANGELOG.md"],
      options.dryRun
    );
    await runCommandWithSideEffects(
      "git",
      ["commit", "-m", commitMessage.replace("%s", newVersion)],
      options.dryRun
    );
    await runCommandWithSideEffects(
      "git",
      ["tag", `v${newVersion}`],
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
