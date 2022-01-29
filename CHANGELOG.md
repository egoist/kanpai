# Changelog

## Unreleased

- Removed `kp get` and `kp set` commands, basically we removed the global config. Config can only be done via `kanpai.json` or the `kanpai` field in `package.json`.

## 0.10.1

- Support `HTTPS` git URL.

## 0.10.0

- Move `npm publish` and `kp gh-release` to a standalone command: `kp release`, now running `kp` will only update `package.json`, create git tag and push to GitHub. `kp release` is used to actually publish on npm and create release on GitHub, this step could be automated via CI instead, env variables `GITHUB_TOKEN` and `NPM_TOKEN` are required for this to work.
- Generate default changelog from commit messages.

## 0.9.9

- Missing changelog body on GitHub Releases.

## 0.9.8

- Add `kp gh-release` command to publish a new release on GitHub.
- Migrate this package to esm format.

## 0.9.7

- Fix first release again

## 0.9.6

- Fix changelog heading

## 0.9.5

- Fix first release
- Prepend `## Unreleased` to the top of the changelog

## 0.9.4

- Remove `v` prefix from default version number in CHANGELOG.md

## 0.9.3

- Make sure git push tags too

## 0.9.2

- Replace `%s` in commit message with actual version number.

## 0.9.1

- Require version to be specified to prevent accidentally running `kp`
- Automatically change title `## Unreleased` in `CHANGELOG.md` to actual version `## vx.y.z` when publishing
