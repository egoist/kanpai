#!/usr/bin/env node
import { cac } from "cac";
import * as colors from "colorette";
import semver from "semver";
import { prepare } from "./prepare";
import { version } from "../package.json";
import { release } from "./release";

const cli = cac("kanpai");

cli
  .command(
    "[version]",
    "Update package.json, create git tag and update CHANGELOG.md"
  )
  .option("--any-branch", "Allow running under any branch")
  .option("--skip-test", "Skip test")
  .option("-m, --message, --commit-message <message>", "Commit message")
  .option(
    "-t, --test <test>",
    "Custom npm script for testing (defaults to `test`)"
  )
  .option("-c, --channel <channel>", "Release channel (defaults to `latest`)")
  .option("--dry-run", "Run the command without publishing or pushing")
  .action(async (version, options) => {
    if (!version) {
      console.log(
        colors.red(
          "> Please specify a version to release, e.g. patch, major or 2.3.4"
        )
      );

      process.exit(1);
    }
    // for all semantic version
    const allTypes = [
      "patch",
      "minor",
      "major",
      "premajor",
      "preminor",
      "prepatch",
      "prerelease",
      "from-git",
    ];

    if (semver.valid(version) || allTypes.indexOf(version) > -1) {
      await prepare(version, options);
    } else {
      console.log(colors.red("> Invalid version."));
      process.exit(1);
    }
  });

cli
  .command("release", "Run npm publish and create GitHub release")
  .option("--pre", "Mark as prerelease")
  .option("--draft", "Mark as draft")
  .option("-c, --channel <channel>", 'Release channel (defaults to "latest")')
  .option("--dry-run", "Run the command without actually publishing")
  .option("--draft", "Create the GitHub release as a draft")
  .option("--skip-npm", "Skip npm publish")
  .option("--skip-github", "Skip GitHub Release")
  .action((flags) => {
    return release({
      prerelease: flags.pre,
      draft: flags.draft,
      dryRun: flags.dryRun,
      channel: flags.channel,
      skipNpm: flags.skipNpm,
      skipGitHub: flags.skipGitHub,
    });
  });

cli.version(version);
cli.help();
cli.parse();
