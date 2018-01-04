'use strict';

/**
 * The reserved name of the test cookies created by Crumble.
 *
 * @private
 *
 * @static
 *
 * @final
 *
 * @type {String}
 *
 * @memberof Crumble
 */
const TEST_COOKIE_NAME = 'crumble';

// --------------------------------------------------------

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
 * A shorthand for the root domain.
 *
 * @private
 *
 * @static
 *
 * @final
 *
 * @type {String}
 *
 * @memberof Crumble
 */
const ROOT_DOMAIN_SHORTHAND = '.';

// --------------------------------------------------------

/**
 * Retrieves the domain of the current document.
 *
 * @private
 *
 * @static
 *
 * @return {String} The current domain.
 *
 * @memberof Crumble
 */
function getDomain ()
{
	return document.location.hostname;
}

// --------------------------------------------------------

/**
 * Retrieves the root domain of the current document.
 *
 * For example if the document is on domain `a.b.c.com` the root domain will be `c.com`.
 *
 * @private
 *
 * @static
 *
 * @return {String} The current root domain.
 *
 * @memberof Crumble
 */
function getRootDomain ()
{
	let domain, domains = getDomain().split('.');

	for (let i = 0, l = domains.length; i < l; ++i)
	{
		domain = domains.slice(-1 - i).join('.');

		document.cookie = setCookie({
			domain, name : TEST_COOKIE_NAME
		});

		if (hasCookie(TEST_COOKIE_NAME))
		{
			break;
		}
	}

	document.cookie = removeCookie({
		domain, name : TEST_COOKIE_NAME
	});

	return domain;
}

// --------------------------------------------------------

/**
 * Determines whether cookies are enabled.
 *
 * @static
 *
 * @return {Boolean} `true` if cookies are enabled, otherwise `false`.
 *
 * @memberof Crumble
 */
function isCookiesEnabled ()
{
	return navigator.cookieEnabled;
}

// --------------------------------------------------------

/**
 * Determines whether a cookie exists.
 *
 * @static
 *
 * @return {Boolean} `true` if the cookie exists, otherwise `false`.
 *
 * @param {String} name The name of the cookie to test the presence of.
 *
 * @memberof Crumble
 */
function hasCookie (name)
{
	return new RegExp('(?:^|.*;)\\s*' + encodeURIComponent(name) + '\\s*\\=').test(document.cookie);
}

// --------------------------------------------------------

/**
 * Reads the value of a cookie.
 *
 * @static
 *
 * @return {String} The value of the cookie or `null` if the cookie doesn't exist.
 *
 * @param {String} name The name of the cookie to read.
 *
 * @memberof Crumble
 */
function getCookie (name)
{
	let cookie = new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(name) + '\\s*\\=\\s*(.*?)(?:;|$))').exec(document.cookie);

	if (cookie === null)
	{
		return null;
	}

	return decodeURIComponent(cookie[1]);
}

// --------------------------------------------------------

/**
 * Generates a cookie string that will set a cookie when assigned to `document.cookie`.
 *
 * Example usage:
 *
 * ```
 * Crumble.setCookie(
 * {
 *    name : "name", value : "value", domain : "a.domain.com", path : "/a/document/path", secure : false
 * });
 * ```
 *
 * Alternatively you can separate the value from the crumbs:
 *
 * ```
 * Crumble.setCookie(
 * {
 *    name : "name", domain : "a.domain.com", path : "/a/document/path", secure : false
 *
 * }, 'value');
 * ```
 *
 * This is useful as the cookie value is usually the variable whereas the other crumbs are usually fixed.
 *
 * @static
 *
 * @param {Object}             crumbs                          The crumbs that make the cookie.
 * @param {String}             crumbs.name                     The name of the cookie.
 * @param {String}             [crumbs.value = null]           The value of the cookie.
 * @param {Number}             [crumbs.age]                    The duration (in milliseconds) of which the cookie can live. When defined, any provided expiry date is ignored. When set to `Infinity` the cookie will be set to expire with date: `31 Dec 9999 23:59:59 GMT`.
 * @param {Date|String|Number} [crumbs.expires]                The expiry date of the cookie, if omitted, the cookie will expire at the end of the session. You can provide a date object, date string or a timestamp. When provided a timestamp equivalent to `Infinity` the cookie will be set to expire with date: `31 Dec 9999 23:59:59 GMT`.
 * @param {String}             [crumbs.path]                   The path of which the cookie will be created. Defaults to the path of the document.
 * @param {String}             [crumbs.domain]                 The (sub)domain of which the cookie will be created. The domain can only be a domain that the document is in, however cookies can cross subdomains. When set to `.` the domain will be set to the root domain of the document. Defaults to the domain of the document (i.e. the value of `document.domain`).
 * @param {Boolean}            [crumbs.secure = false]         Indicates whether the cookie should only be passed over HTTPS connections.
 * @param {Boolean}            [crumbs.firstPartyOnly = false] Indicates whether the cookie should only be sent in a first-party context. This is subject to client support.
 * @param {String}             [value = crumbs.value]          The value of the cookie.
 *
 * @throws {TypeError} When `crumbs.name` is `null` or `undefined`.
 * @throws {TypeError} When `crumbs.age` is not a valid number.
 * @throws {TypeError} When `crumbs.expires` does not represent a valid date.
 */
function setCookie (crumbs, value = crumbs.value)
{
	let { name = null, age, expires, path, domain, secure = false, firstPartyOnly = false } = crumbs;

	if (name === null)
	{
		throw new TypeError('The cookie name must be provided.');
	}

	let cookie = encodeURIComponent(name) + '=';

	// Value.
	if (typeof value !== 'undefined' && value !== null)
	{
		cookie += encodeURIComponent(value);
	}

	// Path.
	if (path)
	{
		cookie += ';path=' + path;
	}

	// Domain.
	if (domain && domain !== getDomain())
	{
		if (domain === ROOT_DOMAIN_SHORTHAND)
		{
			domain = getRootDomain();
		}

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

	document.cookie = cookie;
}

// --------------------------------------------------------

/**
 * Generates a cookie string that will remove a cookie when assigned to `document.cookie`.
 *
 * Example usage:
 *
 * ```
 * Crumble.removeCookie(
 * {
 *    name : "name"
 * });
 * ```
 *
 * @static
 *
 * @param {Object}  crumbs                          The crumbs of the cookie to remove.
 * @param {String}  crumbs.name                     The name of the cookie.
 * @param {String}  [crumbs.path]                   The path of which the cookie will be removed from. Defaults to the path of the current document.
 * @param {String}  [crumbs.domain]                 The (sub)domain of which the cookie will be removed from. The domain can only be a domain that the document is in, however cookies can cross subdomains. When set to `.` the cookie will be removed from the root domain of the document. Defaults to the domain of the document (i.e. the value of `document.domain`).
 * @param {Boolean} [crumbs.secure = false]         Indicates whether the cookie should only be removed over HTTPS connections.
 * @param {Boolean} [crumbs.firstPartyOnly = false] Indicates whether the cookie should only be sent in a first-party context. This is subject to client support.
 *
 * @throws {Error} When `crumbs.name` is `null` or `undefined`.
 */
function removeCookie ({ name, path, domain, secure, firstPartyOnly })
{
	setCookie({
		name, path, domain, secure, firstPartyOnly, age : -3600000
	});
}

// --------------------------------------------------------

module.exports = { isCookiesEnabled, hasCookie, getCookie, setCookie, removeCookie };
