<p align="center">
  <img src="media/kanpai.png" width="260"/>
</p>

<p align="center">
<a href="https://npmjs.com/package/kanpai"><img src="https://img.shields.io/npm/v/kanpai.svg" alt="NPM version"></a>
<a href="https://npmjs.com/package/kanpai"><img src="https://img.shields.io/npm/dm/kanpai.svg" alt="NPM downloads"></a>
<a href="https://circleci.com/gh/egoist/kanpai"><img src="https://img.shields.io/circleci/project/egoist/kanpai/master.svg" alt="Build Status"></a>
</p>

## Motivation

My major complaints about `npm publish` are:

- `npm install` will also trigger `npm run prepublish`, see the [discussion](https://github.com/npm/npm/issues/3059). If you wanna run `npm test` in `prepublish` script it will also be emitted whenever you run `npm install`, which is unexpected.
- I have to manually update the package version.
- I have to manually create git tag.

## How it works

**No black magic**. In [semantic-release](https://github.com/semantic-release/semantic-release) you don't have full control of project publish, `semantic-release` smartly analyze your commits and publish the corresponding new version.

While `kanpai` is, following this procedure:

- Check git status, see if you have commited the changes and if the remote history differs.
- Run tests, `npm test` by default
- Update package version, add git tag as well
- Publish to NPM
- Push to remote git server

## Install

👉 [Screencast](/media/screencast.gif)

```
$ npm install -g kanpai
```

## Usage

```bash
# default type is `patch`
$ kp
$ kp [patch|minor|major|$version|pre$type]

# custom test command, equal to npm run test:other
$ kp --test test:other

# only push to current working branch on remote
# after test
$ kp --push

# more usages
$ kp -h

🍻 Kanpai to publish a new version of your module!

Usage:

  -t/--test:         Custom test command
  -p/--push:         Push to remote git server only
  -v--version:       Output version number
  -h/--help:         Output help infomation
```

A common workflow:

```bash
# after hack something...
$ git commit -am "change the world"
$ kp
```

**Protip:** If you see `fatal: no upstream configured for branch 'master'`, you can run `git branch --set-upstream-to=origin/master master` or `git push -u origin master` to fix it.

## Config

You can config these properties in `package.json`:

```
{
  "kanpai": {
    "test": "lint" // custom test script => npm run lint
  }
}
```

## Screenshots

Protip: Use [testen](https://github.com/egoist/testen) to mock a local version of [TravisCI](https://travis-ci.org/), which can be used for tesing against multiple versions of Node.js.

![preview](https://ooo.0o0.ooo/2016/03/17/56ea4ba76710e.png)

## License

MIT © [EGOIST](https://github.com/egoist)
