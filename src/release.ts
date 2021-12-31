import { ghRelease, prepareGhRelease } from "./gh-release";
import { hr, runCommandWithSideEffects } from "./utils";

export const release = async (options: {
  channel: string;
  dryRun?: boolean;
  prerelease?: boolean;
  draft?: boolean;
}) => {
  hr("NPM PUBLISH");

  const npmOptions = ["publish"];
  if (options.channel) {
    npmOptions.push("--tag", options.channel);
  }
  await runCommandWithSideEffects("npm", npmOptions, options.dryRun);

  hr("GITHUB RELEASE");

  const ghReleaseInfo = await prepareGhRelease();
  if (!options.dryRun) {
    await ghRelease({
      ...ghReleaseInfo,
      prerelease: options.prerelease,
      draft: options.draft,
    });
  }
};
