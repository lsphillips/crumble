## Crumble

A simple utility that abstracts the legacy API that is `document.cookie`.

## Usage

### `bool Crumble.isEnabled()`

Determines whether the client has cookies enabled.

### `bool Crumble.has(string cookie)`

Determines if a cookie exists.

### `string Crumble.get(string cookie)`

Retrieves the value of a cookie.

### `void Crumble.set(Object crumbs)`

Sets a cookie.

The cookie crumbs to provide are:

* `name` (string, required) - The name of the cookie.
* `value` (string, optional) - The value of the cookie. The provided value will undergo a basic `toString()` transformation, complex objects should be dealt with beforehand. If set to `undefined` or `null` the cookie will be removed by forcing it to immediately expire, ignoring any `age` or `expires` crumb that may be provided.
* `expires` (Date|String|Number, optional) - The expiry date of the cookie, if omitted, the cookie will expire at the end of the session. You can provide a date object, date string or a timestamp. If provided a timestamp equivalent to `Infinity` the cookie will be set to expire with date: `31 Dec 9999 23:59:59 GMT`.
* `age` (Number, optional) - The duration (in minutes) of which the cookie can live. When defined, any provided expiry date is ignored. If set to `Infinity` the cookie will be set to expire with date: `31 Dec 9999 23:59:59 GMT`.
* `path` (string, optional) - The path of which the cookie will be sent. Defaults to `/`.
* `domain` (string, optional) The (sub)domain of which the cookie will be sent. The domain can only be a domain that the current document is in, however cookies can cross subdomains. If set to `.`, it will set the domain to the root domain of the document, consequently making it available on all subdomains. Defaults to the domain of the document (i.e. the value of `document.cookie`).
* `secure` (string, optional) Indicates whether the cookie should only be passed over HTTPS connections. Defaults to `false`.

Example usage:

js
```
Crumble.set(
{
	name : 'name',
	value : 'value',
	domain : 'a.domain.com',
	path : '/a/document/path',
	secure : false
});
```

This would set a cookie called `name` with a value of `value`, that would be sent to a document with path `/a/document/path` on or on the sub domain of the domain `a.domain.com`.

This will produce a cookie that supports both the HTTP 1.0 `expires` attributes as well as the HTTP 1.1 `max-age` attribute regardless of whether you provide an `age` or `expires` crumb.

### `void Crumble.remove(Object crumbs)`

Removes a cookie by forcing it to immediately expire.

The cookie crumbs you can provide are very similar to what you can provide to `Crumble.set(Object crumbs)`:

* `name` (string, required) - The name of the cookie.
* `path` (string, optional) - The path of which the cookie will be sent. Defaults to `/`.
* `domain` (string, optional) The (sub)domain of which the cookie will be sent. The domain can only be a domain that the current document is in, however cookies can cross subdomains. If set to `.`, it will set the domain to the root domain of the document, consequently making it available on all subdomains. Defaults to the domain of the document (i.e. the value of `document.cookie`).
* `secure` (string, optional) Indicates whether the cookie should only be passed over HTTPS connections. Defaults to `false`.

Example usage:

js
```
Crumble.remove(
{
	name : 'name'
});
```

As the only way to remove a cookie is to set it to expire, the above is just a more expressive way of doing the following:

js
```
Crumble.set(
{
	name : 'name',
	value : null
});
```

## Getting started

To use Crumble, just use a script tag like so:

``` html
<script type="text/javascript" src="path/to/Crumble.js"></script>
```

To remove Crumble from the global namespace, you can use `Crumble.noConflict()`, like so:

``` js
Namespace.Crumble = Crumble.noConflict();
```

Crumble is wrapped using UMD, so it works in both CommonJS and AMD environments. It's also available through the Node Package Manager:

``` sh
npm install crumble
```

## Development

Grunt is used to handle the build process for Crumble. To perform a full build, use the `build` task:

``` sh
grunt build
```

which is just an alias for the `default` task:

``` sh
grunt
```

To only check code quality and/or run unit tests use the `test` task:

``` sh
grunt test
```

## License

Crumble is released under the MIT License.