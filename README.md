# Crumble

[![Available from NPM](https://img.shields.io/npm/v/crumble.svg?maxAge=900)](https://www.npmjs.com/package/crumble)
[![Built using Travis](https://img.shields.io/travis/lsphillips/Crumble/master.svg?maxAge=900)](https://travis-ci.org/lsphillips/Crumble)

A simple wrapper that makes reading the cookies of a given document easy and expressive.

## Interface

### `Boolean Crumble#isCookiesEnabled()`

Determines whether cookies are enabled in the document.

### `Boolean Crumble#hasCookie(string name)`

Determines whether a cookie exists in the document.

### `String Crumble#getCookie(string name)`

Retrieves the value of a cookie from the document. `null` will be returned if the cookie does not exist.

### `void Crumble#setCookie(Object crumbs [, string cookieValue])`

Sets a cookie in the document.

The cookie crumbs you can provide are:

* `name` (String, required) - The name of the cookie.
* `value` (String, optional) - The value of the cookie.
* `age` (Number, optional) - The duration (in milliseconds) of which the cookie can live. When defined, any provided expiry date is ignored. When set to `Infinity` the cookie will be set to expire with date: `31 Dec 9999 23:59:59 GMT`.
* `expires` (Date|String|Number, optional) - The expiry date of the cookie, if omitted, the cookie will expire at the end of the session. You can provide a date object, date string or a timestamp. When provided a timestamp equivalent to `Infinity` the cookie will be set to expire with date: `31 Dec 9999 23:59:59 GMT`.
* `path` (String, optional) - The path of which the cookie will be created. Defaults to the path of the document.
* `domain` (String, optional) - The (sub)domain of which the cookie will be created. The domain can only be a domain that the document is in, however cookies can cross subdomains. When set to `.` the domain will be set to the root domain of the document. Defaults to the domain of the document (i.e. the value of `document.domain`).
* `secure` (Boolean, optional) - Indicates whether the cookie should only be passed over HTTPS connections. Defaults to `false`.
* `firstPartyOnly` (Boolean, optional) - Indicates whether the cookie should only be sent in a first-party context. This is subject to client support. Defaults to `false`.

Example usage:

``` js
Crumble.setCookie(
{
	name : 'name', value : 'value', domain : 'a.domain.com', path : '/a/document/path', secure : false
});
```

Alternatively you can separate the value from the cookie crumbs:

``` js
Crumble.setCookie(
{
	name : 'name', domain : 'a.domain.com', path : '/a/document/path', secure : false

}, 'value');
```

This is useful as the value is usually the variable when setting a cookie whereas the other cookie crumbs are usually fixed.

### `void Crumble#removeCookie(Object crumbs)`

Removes a cookie from the document by forcing it to immediately expire.

The cookie crumbs you can provide are:

* `name` (String, required) - The name of the cookie.
* `path` (String, optional) - The path of which the cookie will be removed from. Defaults to the path of the document.
* `domain` (String, optional) - The (sub)domain of which the cookie will be removed from. The domain can only be a domain that the document is in, however cookies can cross subdomains. When set to `.` the cookie will be removed from the root domain of the document. Defaults to the domain of the document (i.e. the value of `document.domain`).
* `secure` (Boolean, optional) - Indicates whether the cookie should only be removed over HTTPS connections. Defaults to `false`.
* `firstPartyOnly` (Boolean, optional) - Indicates whether the cookie should only be sent in a first-party context. This is subject to client support. Defaults to `false`.

Example usage:

``` js
Crumble.removeCookie(
{
	name : 'name'
});
```

## Getting started

It's available through the Node Package Manager (NPM), so you can install it like so:

``` sh
npm install crumble
```

## Development

Grunt is used to handle the build process for Crumble. To perform a full build, use the `build` task:

``` sh
grunt build
```

To only run tests use the `test` task:

``` sh
grunt test
```

This also runs code quality checks using ESLint. Please refer to the `.eslintrc` file to familiar yourself with the rules.

## License

This project is released under the MIT License.
