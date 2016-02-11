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
```

## License

MIT © [EGOIST](https://github.com/egoist)
