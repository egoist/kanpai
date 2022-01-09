import { execa } from "execa";
import semver from "semver";
import {
  getSectionBelowHeadingInMarkdown,
  readChangeLogFile,
} from "./changelog";
import { getLatestTag } from "./git";
import { request, NotFoundError } from "./request";

const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const getRepo = async () => {
  const { stdout } = await execa("git", ["remote", "get-url", "origin"]);
  const m =
    stdout.match(/git@github.com:(.+)\.git/) ||
    stdout.replace(/.git$/, "").match(/https:\/\/github.com\/(.+)/);
  if (!m) {
    throw new Error(
      `Invalid git remote url: ${stdout}, expected something like git@github.com:owner/repo.git`
    );
  }
  const splits = m[1].split("/");
  return { owner: splits[0], repo: splits[1] };
};

const getReleaseByTag = (
  tag: string,
  repo: { owner: string; repo: string }
) => {
  return request(
    `https://api.github.com/repos/${repo.owner}/${repo.repo}/releases/tags/${tag}`,
    {
      method: "GET",
      headers: {
        accept: `application/vnd.github.v3+json`,
        authorization: `token ${githubToken}`,
      },
    }
  ).catch((error: any) => {
    if (error instanceof NotFoundError) {
      return null;
    }
    throw error;
  });
};

export const prepareGhRelease = async (version?: string) => {
  if (!githubToken) {
    throw new Error("GITHUB_TOKEN env variable is not set");
  }

  if (!version) {
    const tag = await getLatestTag();
    if (!tag) {
      throw new Error("Cannot find the latest tag.");
    }
    version = tag.slice(1);
  }

  if (!semver.valid(version)) {
    throw new Error(`Invalid version number: ${version}`);
  }

  let changelog: string | undefined;
  const changelogFile = readChangeLogFile();
  if (changelogFile) {
    changelog = getSectionBelowHeadingInMarkdown(changelogFile, version);
  }

  if (!changelog) {
    throw new Error(
      `No changelog found in CHANGELOG.md for version ${version}.`
    );
  }

  const repo = await getRepo();

  return { changelog, repo, version };
};

export const ghRelease = async ({
  changelog,
  version,
  prerelease,
  draft,
  repo,
}: {
  changelog: string;
  version: string;
  prerelease?: boolean;
  draft?: boolean;
  repo: { owner: string; repo: string };
}) => {
  let release = await getReleaseByTag(`v${version}`, repo);

  console.log(`${release ? "Updating" : "Creating"} release for v${version}`);

  const res = await request(
    `https://api.github.com/repos/${repo.owner}/${repo.repo}/releases`,
    {
      method: release ? "PATCH" : "POST",
      headers: {
        accept: `application/vnd.github.v3+json`,
        authorization: githubToken ? `token ${githubToken}` : undefined,
      },
      data: {
        draft,
        prerelease,
        name: `v${version}`,
        tag_name: `v${version}`,
        repo: repo.repo,
        owner: repo.owner,
        body: changelog,
      },
    }
  );

  console.log(
    `${release ? "Updated" : "Created"} release: ${res.json().html_url}`
  );
};
