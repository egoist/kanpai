<p align="center">
  <img src="/media/kanpai.png" width="260"/>
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
$ kp --push-only

# more usages
$ kp -h

  Usage:
    kp

    -t/--test:         Custom test command
    -p/--push-only:    Push to remote git server only
    -v--version:       Output version number
    -h/--help:         Output help infomation
```

A common workflow:

```bash
# after hack something...
$ git commit -am "change the world"
$ kp
```

## License

MIT © [EGOIST](https://github.com/egoist)
