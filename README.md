# Crumble

[![Available from NPM](https://img.shields.io/npm/v/crumble.svg?maxAge=900)](https://www.npmjs.com/package/crumble)
[![Built using Travis](https://img.shields.io/travis/lsphillips/Crumble/master.svg?maxAge=900)](https://travis-ci.org/lsphillips/Crumble)

A RFC-6265 compliant library that makes reading and writing cookies easy.

## Interface

### `string Crumble#getCookie(string plate, string name)`

Reads the value of a cookie from a plate of cookies like `document.cookie`.

Example usage:

``` js
let cookie = Crumble.getCookie(document.cookie, 'cookie');
```

**Note:** The value will be decoded for you, and if the cookie does not exist then `null` will be returned instead.

### `bool Crumble#hasCookie(string plate, string name)`

Determines whether a cookie exists in a plate of cookies like `document.cookie`.

Example usage:

``` js
let exists = Crumble.hasCookie(document.cookie, 'cookie');
```

### `string Crumble#setCookie(Object crumbs [, string value])`

Creates a string that will set a cookie when assigned to a plate like `document.cookie`.

* `name` (string, required) - The name of the cookie.
* `value` (string, optional) - The value of the cookie.
* `age` (number, optional) - The duration (in milliseconds) of which the cookie can live. When omitted and no `expires` crumb is provided, the cookie will expire at the end of the session. This takes precedence over the `expires` crumb.
* `expires` (Date|string|number, optional) - The expiry date of the cookie. When omitted and no `age` crumb is provided, the cookie will expire at the end of the session.
* `path` (string, optional) - The path of which the cookie will be created. Defaults to the current path.
* `domain` (string, optional) - The (sub)domain of which the cookie will be created. Defaults to the current domain.
* `secure` (boolean, optional) - Indicates whether the cookie should only be passed over HTTPS connections. Defaults to `false`.
* `firstPartyOnly` (boolean, optional) - Indicates whether the cookie should only be sent in a first-party context. This is subject to client support. Defaults to `false`.

Example usage:

``` js
document.cookie = Crumble.setCookie(
{
	name   : 'name',
	value  : 'value',
	domain : 'a.domain.com',
	path   : '/an/example/path',
	secure : false
});
```

Alternatively you can separate the value from the rest of the crumbs, like so:

``` js
document.cookie = Crumble.setCookie(
{
	name   : 'name',
	domain : 'a.domain.com',
	path   : '/an/example/path',
	secure : false

}, "value");
```

This can be useful when the cookie value is the variable and the other crumbs are fixed.

### `string Crumble#removeCookie(Object crumbs)`

Creates a string that will remove a cookie when assigned to a plate like `document.cookie`.

* `name` (string, required) - The name of the cookie.
* `path` (string, optional) - The path of which the cookie will be removed from. Defaults to the current path.
* `domain` (string, optional) - The (sub)domain of which the cookie will be removed from. Defaults to the current domain.
* `secure` (boolean, optional) - Indicates whether the cookie should only be removed over HTTPS connections. Defaults to `false`.
* `firstPartyOnly` (boolean, optional) - Indicates whether the cookie should only be sent in a first-party context. This is subject to client support. Defaults to `false`.

Example usage:

``` js
document.cookie = Crumble.removeCookie(
{
	name   : 'name',
	domain : 'a.domain.com',
	path   : '/an/example/path',
	secure : false
});
```

## Getting started

This project is available through the Node Package Manager (NPM), so you can install it like so:

``` sh
npm install crumble
```

This is a `commonjs` module; so you will need to use a bundler.

## Development

This project doesn't have much of a build process. It does have tests though; which you can run like so:

``` sh
npm test
```

This also runs code quality checks using ESLint. Please refer to the `.eslintrc` files to familiar yourself with the rules.

## License

This project is released under the MIT License.
