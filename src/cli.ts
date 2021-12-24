#!/usr/bin/env node
import { cac } from "cac";
import isSemver from "is-semver";
import table from "text-table";
import * as colors from "colorette";
import { publish } from "./publish";
import { config } from "./config";
import { version } from "../package.json";

const cli = cac();

cli
  .command("[version]", "Publish a new version")
  .option("--any-branch", "Publish from any branch")
  .option("--push-only", "Push to remote only")
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

    if (isSemver(version) || allTypes.indexOf(version) > -1) {
      await publish(version, options);
    } else {
      console.log(colors.red("> Invalid version."));
      process.exit(1);
    }
  });

cli
  .command("get [key]", "Get config value")
  .action((key: string | undefined) => {
    const all = config.all;
    if (key) {
      if (!all[key]) {
        return console.log(
          colors.red(`Cannot find property ${colors.underline(key)}.`)
        );
      }
      return console.log(all[key]);
    }
    console.log(
      table(
        Object.keys(all).map((key) => {
          return [key, all[key].green];
        })
      )
    );
  });

cli
  .command("set <key> [value]", "Set config value")
  .action((key: string, value: string | undefined) => {
    if (value) {
      config.set(key, value);
    } else {
      config.del(key);
    }
  });

cli.version(version);
cli.help();
cli.parse();
