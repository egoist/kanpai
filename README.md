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

# On CI
$ kp release
```

## Config

Some CLI flags can be configured via `kanpai.json` file:

```
{
  "test": "lint", // custom test script => npm run lint
    "commitMessage": "Release version %s"
}
```

## Keep a `CHANGELOG.md`

Running `kp` will also generate a `CHANGELOG.md` file, which will include the changes since last release:

```markdown
## Unreleased

No unreleased changes.

## 0.1.0

- Some commit message
```

As you can see this file also includes an "Unreleased" section, and upon running `kp` the content will be automatically replaced by the commit messages since last release, and the heading `## Unreleased` will be updated to the actual version number.

You can also write the "Unreleased" section manually, the content will only be replaced by commit messages if the heading is followed by nothing or another h2 heading. In this case only the heading will be replaced.

## FAQ

### fatal: no upstream configured for branch 'master'

Two options:

a) `git branch --set-upstream-to=origin/master master` and then run `git push`<br>
b) `git push -u origin master`

## License

MIT © [EGOIST](https://github.com/egoist)
