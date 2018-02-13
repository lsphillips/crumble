'use strict';

/**
 * The maximum expiry date a cookie can have.
 *
 * @private
 *
 * @static
 *
 * @final
 *
 * @type {Date}
 *
 * @memberof Crumble
 */
const MAXIMUM_EXPIRY_DATE = new Date('Fri, 31 Dec 9999 23:59:59 GMT');

// --------------------------------------------------------

/**
 * Escapes a string so it can be placed in a regular expression.
 *
 * @static
 *
 * @private
 *
 * @return {String} The escaped string.
 *
 * @param {String} string The string to escape.
 *
 * @memberof Crumble
 */
function escapeForRegularExpression (string)
{
	return string.replace(/([.*+?^=!:${}()/|[\]\\])/g, '\\$1');
}

// --------------------------------------------------------

/**
 * Encodes a string; treating it as a RFC 6265 compliant cookie name.
 *
 * @static
 *
 * @private
 *
 * @return {String} The encoded string.
 *
 * @param {String} string The string to encode as a cookie name.
 *
 * @memberof Crumble
 */
function encodeAsCookieName (string)
{
	return encodeURIComponent(string)
		.replace(/\(/g, '%28')
		.replace(/\)/g, '%29')
		.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
}

// --------------------------------------------------------

/**
 * Encodes a string; treating it as a RFC 6265 compliant cookie value.
 *
 * @static
 *
 * @private
 *
 * @return {String} The encoded string.
 *
 * @param {String} string The string to encode as a cookie value.
 *
 * @memberof Crumble
 */
function encodeAsCookieValue (string)
{
	return encodeURIComponent(string)
		.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
}

// --------------------------------------------------------

/**
 * Determines whether a cookie exists in a plate of cookies like `document.cookie`.
 *
 * Example usage:
 *
 * ```
 * Crumble.hasCookie(document.cookie, 'cookie');
 * ```
 *
 * @static
 *
 * @return {Boolean} `true` if the cookie exists, otherwise `false`.
 *
 * @param {String} plate The plate of cookies to search. Will usually be the value of `document.cookie`.
 * @param {String} name  The name of the cookie to search the plate for.
 *
 * @memberof Crumble
 */
function hasCookie (plate, name)
{
	let safeCookieName = escapeForRegularExpression(
		encodeAsCookieName(name)
	);

	return new RegExp('(?:^|.*;)\\s*' + safeCookieName + '\\s*\\=').test(plate);
}

// --------------------------------------------------------

/**
 * Reads the value of a cookie from a plate of cookies like `document.cookie`.
 *
 * Example usage:
 *
 * ```
 * Crumble.getCookie(document.cookie, 'cookie');
 * ```
 *
 * @static
 *
 * @return {String} The decoded value of the cookie or `null` if the cookie doesn't exist.
 *
 * @param {String} plate The plate of cookies to search. Will usually be the value of `document.cookie`.
 * @param {String} name  The name of the cookie to read from the plate.
 *
 * @memberof Crumble
 */
function getCookie (plate, name)
{
	let safeCookieName = escapeForRegularExpression(
		encodeAsCookieName(name)
	);

	let cookie = new RegExp('(?:(?:^|.*;)\\s*' + safeCookieName + '\\s*\\=\\s*(.*?)(?:;|$))').exec(plate);

	if (cookie === null)
	{
		return null;
	}

	return decodeURIComponent(cookie[1]);
}

// --------------------------------------------------------

/**
 * Creates a string that will set a cookie when assigned to a plate like `document.cookie`.
 *
 * Example usage:
 *
 * ```
 * document.cookie = Crumble.setCookie(
 * {
 *    name   : "name",
 *    value  : "value",
 *    domain : "a.domain.com",
 *    path   : "/an/example/path",
 *    secure : false
 * });
 * ```
 *
 * Alternatively you can separate the value from the rest of the crumbs, like so:
 *
 * ```
 * document.cookie = Crumble.setCookie(
 * {
 *    name   : "name",
 *    domain : "a.domain.com",
 *    path   : "/an/example/path",
 *    secure : false
 *
 * }, "value");
 * ```
 *
 * This can be useful when the cookie value is the variable and the other crumbs are fixed.
 *
 * @static
 *
 * @return {String} A string that will set a cookie.
 *
 * @param {Object}             crumbs                          The crumbs that make the cookie.
 * @param {String}             crumbs.name                     The name of the cookie.
 * @param {String}             [crumbs.value = null]           The value of the cookie.
 * @param {Number}             [crumbs.age]                    The duration (in milliseconds) of which the cookie can live. When omitted and no `expires` crumb is provided, the cookie will expire at the end of the session. This takes precedence over the `expires` crumb.
 * @param {Date|String|Number} [crumbs.expires]                The expiry date of the cookie. When omitted and no `age` crumb is provided, the cookie will expire at the end of the session.
 * @param {String}             [crumbs.path]                   The path of which the cookie will be created. Defaults to the current path.
 * @param {String}             [crumbs.domain]                 The (sub)domain of which the cookie will be created. Defaults to the current domain.
 * @param {Boolean}            [crumbs.secure = false]         Indicates whether the cookie should only be passed over HTTPS connections.
 * @param {Boolean}            [crumbs.firstPartyOnly = false] Indicates whether the cookie should only be sent in a first-party context. This is subject to client support.
 * @param {String}             [value = crumbs.value]          The value of the cookie. This takes precedence over the `value` crumb.
 *
 * @throws {TypeError} When the `name` crumb is `null` or not provided.
 * @throws {TypeError} When the `age` crumb is not a valid number.
 * @throws {TypeError} When the `expires` crumb does not represent a valid date.
 */
function setCookie (crumbs, value = crumbs.value)
{
	let { name = null, age, expires, path, domain, secure = false, firstPartyOnly = false } = crumbs;

	if (name === null)
	{
		throw new TypeError('The cookie name must be provided.');
	}

	let cookie = encodeAsCookieName(name) + '=';

	// Value.
	if (typeof value !== 'undefined' && value !== null)
	{
		cookie += encodeAsCookieValue(value);
	}

	// Path.
	if (path)
	{
		cookie += ';path=' + path;
	}

	// Domain.
	if (domain)
	{
		cookie += ';domain=' + domain;
	}

	// Age.
	if (age)
	{
		if (typeof age !== 'number' || isNaN(age))
		{
			throw new TypeError('The cookie age must be a valid number.');
		}

		if (age === Infinity)
		{
			age = MAXIMUM_EXPIRY_DATE.getTime() - Date.now();
		}

		expires = new Date();

		expires.setTime(
			expires.getTime() + age
		);

		// HTTP 1.1.
		cookie += ';max-age=' + (age / 1000);

		// HTTP 1.0.
		cookie += ';expires=' + expires.toUTCString();
	}

	// Expires.
	else if (expires)
	{
		expires = (expires === Infinity) ? MAXIMUM_EXPIRY_DATE : new Date(expires);

		if (expires.toString() === 'Invalid Date')
		{
			throw new TypeError('The cookie expiry must represent a valid date.');
		}
		else
		{
			age = expires.getTime() - Date.now();

			// HTTP 1.1.
			cookie += ';max-age=' + (age / 1000);

			// HTTP 1.0.
			cookie += ';expires=' + expires.toUTCString();
		}
	}

	// Secure.
	if (secure)
	{
		cookie += ';secure';
	}

	// First-Party-Only.
	if (firstPartyOnly)
	{
		cookie += ';first-party-only';
	}

	return cookie;
}

// --------------------------------------------------------

/**
 * Creates a string that will remove a cookie when assigned to a plate like `document.cookie`.
 *
 * Example usage:
 *
 * ```
 * document.cookie = Crumble.removeCookie(
 * {
 *    name   : "name",
 *    domain : "a.domain.com",
 *    path   : "/an/example/path",
 *    secure : false
 * });
 * ```
 *
 * @static
 *
 * @return {String} A string that will remove a cookie.
 *
 * @param {Object}  crumbs                          The crumbs of the cookie to remove.
 * @param {String}  crumbs.name                     The name of the cookie.
 * @param {String}  [crumbs.path]                   The path of which the cookie will be removed from. Defaults to the current path.
 * @param {String}  [crumbs.domain]                 The (sub)domain of which the cookie will be removed from. Defaults to the current domain.
 * @param {Boolean} [crumbs.secure = false]         Indicates whether the cookie should only be removed over HTTPS connections.
 * @param {Boolean} [crumbs.firstPartyOnly = false] Indicates whether the cookie should only be sent in a first-party context. This is subject to client support.
 *
 * @throws {Error} When the `name` crumb is `null` or not provided.
 */
function removeCookie ({ name, path, domain, secure, firstPartyOnly })
{
	return setCookie({
		name, path, domain, secure, firstPartyOnly, age : -3600000
	});
}

// --------------------------------------------------------

module.exports = { hasCookie, getCookie, setCookie, removeCookie };
