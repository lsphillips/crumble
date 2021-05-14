# Changelog

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] (2021-05-14)

### Added

- Introduced an ESM version of this module that will be used when being imported using `import`.

### Changed

- This module is now transpiled using Babel.
- The UMD version of this module now exposes itself using the name `crumble` instead of `Crumble`.

## [2.2.0] (2019-04-28)

### Added

- Introduced a browser entry point that is ES5 compatible and minified.

## [2.1.0] (2019-04-27)

### Added

- Introduced documentation to the Typescript type definitons.

## [2.0.0] (2018-02-13)

This version changes the focus of Crumble. It is now a cookie string library rather than an abstraction of `document.cookie`.

### Changed.

- `Crumble.setCookie()` and `Crumble.removeCookie()` no longer update `document.cookie`. They now return a string that you can assign to `document.cookie` yourself.
- `Crumble.getCookie()` and `Crumble.hasCookie()` no longer read from `document.cookie`. You must provide that yourself as input.

### Removed

- `Crumble.isCookiesEnabled()` has been removed; use `window.navigator.cookieEnabled` instead.
- `Crumble.setCookie()` and `Crumble.removeCookie()` will no longer set the domain to the root domain of the document when the `domain` crumb is set to `.`.

### Fixed

- Crumble will now correctly encode cookie names and cookie values in accordance to RFC-6265.

## [1.1.0] (2018-01-04)

A code quality release; no functionality changes.

## [1.0.0] (2017-05-16)

The initial public release.
