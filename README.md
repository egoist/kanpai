<p align="center">
  <img src="media/kanpai.png" width="260"/>
</p>

<p align="center">
<a href="https://npmjs.com/package/kanpai"><img src="https://img.shields.io/npm/v/kanpai.svg" alt="NPM version"></a>
<a href="https://npmjs.com/package/kanpai"><img src="https://img.shields.io/npm/dm/kanpai.svg" alt="NPM downloads"></a>
<a href="https://circleci.com/gh/egoist/kanpai"><img src="https://img.shields.io/circleci/project/egoist/kanpai/master.svg" alt="Build Status"></a>
</p>

## How it works

**No black magic**. In [semantic-release](https://github.com/semantic-release/semantic-release) you don't have full control of project publish, `semantic-release` smartly analyze your commits and publish the corresponding new version.

While using `kanpai` (shortened to `kp`), you specify the version to publish instead. By running `kp [patch|minor|major|x.y.z]`, it does following things:

- Check git status, see if you have committed the changes and if the remote history differs.
- Run tests, `npm test` by default.
- Update package version, `CHANGELOG.md`, create git tag as well.
- Push to remote git server

After that, you can publish the npm package and create GitHub Release with the `kp release` command. And this step can be automated via CI like GitHub Actions and CircleCI.

## Install

```bash
$ npm install -g kanpai

# or use yarn
$ yarn global add kanpai
```

## Usage

```bash
$ kp [patch|minor|major|$version|pre$type]

# custom test command, equal to npm run test:other
$ kp --test test:other

# only push to current working branch on remote
# after runing test script
$ kp --push-only

# skip test script
$ kp --skip-test

# more usages
$ kp -h
```

A common workflow:

```bash
# after hack something...
$ git commit -am "change the world"
$ kp
```

## Config

You can use command-line to set and get config globally:

```bash
$ kp get
$ kp get test

# update test
$ kp set test custom-test-script

# update the commit message when running `npm version `
# %s will be replaced by version number, eg: 0.1.0
$ kp set commitMessage "Release version %s"
```

You can config these properties in `package.json` for a single project:

```
{
  "kanpai": {
    "test": "lint", // custom test script => npm run lint
    "commitMessage": "Release version %s"
  }
}
```

## Keep a `CHANGELOG.md`

You are recommended to update the `## Unreleased` section in `CHANGELOG.md` each time you add a new feature or bug fix to your project.

And when you run `kp` to publish a release, it will look for `CHANGELOG.md` and update heading `## Unreleased` with new version, for example: `## 0.1.0`.

## Create GitHub Releases

Kanpai can also sync changelog in your `CHANGELOG.md` to GitHub Releases.

After you publish a new version, you can use `kp gh-release` to create a new release for the latest version on GitHub.

## FAQ

### fatal: no upstream configured for branch 'master'

Two options:

a) `git branch --set-upstream-to=origin/master master` and then run `git push`<br>
b) `git push -u origin master`

## License

MIT © [EGOIST](https://github.com/egoist)
