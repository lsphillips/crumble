# Crumble

[![Available from NPM](https://img.shields.io/npm/v/crumble.svg?maxAge=900)](https://www.npmjs.com/package/crumble)
[![Built using Travis](https://img.shields.io/travis/lsphillips/Crumble/master.svg?maxAge=900)](https://travis-ci.org/lsphillips/Crumble)

A simple wrapper that makes reading the cookies of a given document easy and expressive.

## Interface

### `Boolean Crumble#isCookiesEnabled()`

Determines whether the client has cookies enabled.

### `String Crumble#getCookie(string name)`

Retrieves the value of a cookie. `null` will be returned if the cookie does not exist.

### `Boolean Crumble#hasCookie(string name)`

Determines whether a cookie exists.

### `void Crumble#setCookie(Object crumbs [, string value])`

Sets a cookie. The cookie crumbs you can provide are:

* `name` (string, required) - The name of the cookie.
* `value` (string, optional) - The value of the cookie.
* `age` (number, optional) - The duration (in milliseconds) of which the cookie can live. When defined, any provided expiry date is ignored. When set to `Infinity` the cookie will be set to expire with date: `31 Dec 9999 23:59:59 GMT`.
* `expires` (Date|string|number, optional) - The expiry date of the cookie, if omitted, the cookie will expire at the end of the session. You can provide a date object, date string or a timestamp. When provided a timestamp equivalent to `Infinity` the cookie will be set to expire with date: `31 Dec 9999 23:59:59 GMT`.
* `path` (string, optional) - The path of which the cookie will be created. Defaults to the current path.
* `domain` (string, optional) - The (sub)domain of which the cookie will be created. When set to `.` the domain will be set to the current root domain. Defaults to the current domain.
* `secure` (boolean, optional) - Indicates whether the cookie should only be passed over HTTPS connections. Defaults to `false`.
* `firstPartyOnly` (boolean, optional) - Indicates whether the cookie should only be sent in a first-party context. This is subject to client support. Defaults to `false`.

Example usage:

``` js
Crumble.setCookie(
{
	name   : "name",
	value  : "value",
	domain : "a.domain.com",
	path   : "/an/example/path",
	secure : false
});
```

Alternatively you can separate the value of the cookie from the cookie crumbs:

``` js
Crumble.setCookie(
{
	name   : 'name',
	domain : 'a.domain.com',
	path   : '/an/example/path',
	secure : false

}, 'value');
```

This is useful as the value of the cookie is usually the variable whereas the other cookie crumbs are usually fixed.

### `void Crumble#removeCookie(Object crumbs)`

Removes a cookie by forcing it to immediately expire. The cookie crumbs you can provide are:

* `name` (string, required) - The name of the cookie.
* `path` (string, optional) - The path of which the cookie will be removed from. Defaults to the current path.
* `domain` (string, optional) - The (sub)domain of which the cookie will be removed from. When set to `.` the cookie will be removed from the current root domain. Defaults to the current domain.
* `secure` (boolean, optional) - Indicates whether the cookie should only be removed over HTTPS connections. Defaults to `false`.
* `firstPartyOnly` (boolean, optional) - Indicates whether the cookie should only be removed in a first-party context. This is subject to client support. Defaults to `false`.

Example usage:

``` js
Crumble.removeCookie(
{
	name : 'name'
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
