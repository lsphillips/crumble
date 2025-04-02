# `crumble`

[![Available from NPM](https://img.shields.io/npm/v/crumble.svg?maxAge=900)](https://www.npmjs.com/package/crumble)
[![Built using GitHub Action](https://github.com/lsphillips/crumble/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/lsphillips/crumble/actions)

A RFC-6265 compliant library that makes reading and writing cookies easy.

## Usage

This module can be treated as an ES module:

``` js
import * as crumble from 'crumble';
// or
import { getCookie, hasCookie, setCookie, removeCookie } from 'crumble';
```

This module can also be treated as a CommonJS module:

``` js
const crumble = require('crumble');
// or
const { getCookie, hasCookie, setCookie, removeCookie } = require('crumble');
```

### `string getCookie(string plate, string name)`

Reads the value of a cookie from a plate of cookies like `document.cookie`.

Example usage:

``` js
let cookie = getCookie(document.cookie, 'cookie');
```

**Note:** The value will be decoded for you, and if the cookie does not exist then `null` will be returned instead.

### `bool hasCookie(string plate, string name)`

Determines whether a cookie exists in a plate of cookies like `document.cookie`.

Example usage:

``` js
let exists = hasCookie(document.cookie, 'cookie');
```

### `string setCookie(Object crumbs [, string value])`

Creates a string that will set a cookie when assigned to a plate like `document.cookie`.

* `name` (string, required) - The name of the cookie.
* `value` (string, optional) - The value of the cookie.
* `age` (number, optional) - The duration (in milliseconds) of which the cookie can live. When omitted and no `expires` crumb is provided, the cookie will expire at the end of the session. This takes precedence over the `expires` crumb.
* `expires` (Date|string|number, optional) - The expiry date of the cookie. When omitted and no `age` crumb is provided, the cookie will expire at the end of the session.
* `path` (string, optional) - The path of which the cookie will be created. Defaults to the current path.
* `domain` (string, optional) - The (sub)domain of which the cookie will be created. Defaults to the current domain.
* `secure` (boolean, optional) - Indicates whether the cookie should only be passed over HTTPS connections. Defaults to `false`.
* `sameSite` (string, optional) - Indicates the context restrictions that the cookie should be subject to. This can take the value of `none`, `lax` or `secure`. Defaults to `lax`.

Example usage:

``` js
document.cookie = setCookie({
  name     : 'name',
  value    : 'value',
  domain   : 'a.domain.com',
  path     : '/an/example/path',
  age      : 3600,
  secure   : false,
  sameSite : 'strict'
});
```

Alternatively you can separate the value from the rest of the crumbs:

``` js
document.cookie = setCookie({
  name     : 'name',
  domain   : 'a.domain.com',
  path     : '/an/example/path',
  age      : 3600,
  secure   : false,
  sameSite : 'strict'
}, 'value');
```

This can be useful when the cookie value is the variable and the other crumbs are fixed.

### `string removeCookie(Object crumbs)`

Creates a string that will remove a cookie when assigned to a plate like `document.cookie`.

* `name` (string, required) - The name of the cookie.
* `path` (string, optional) - The path of which the cookie will be removed from. Defaults to the current path.
* `domain` (string, optional) - The (sub)domain of which the cookie will be removed from. Defaults to the current domain.

Example usage:

``` js
document.cookie = removeCookie({
  name   : 'name',
  domain : 'a.domain.com',
  path   : '/an/example/path'
});
```

**Note:** When a cookie was set with a specific path and/or domain, then you must provide the same values during removal.

## Getting started

This module is available through the Node Package Manager (NPM):

``` sh
npm install crumble
```

## Development

### Building

You can build UMD and ESM versions of this module that are both ES5 compatible and minified:

``` sh
npm run build
```

### Testing

This module also has a robust test suite:

``` sh
npm test
```

This includes a code quality check using ESLint. Please refer to the `eslint.config.js` files to familiar yourself with the rules.

## License

This module is released under the [MIT License](LICENSE.txt).
