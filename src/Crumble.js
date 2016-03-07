'use strict';

// --------------------------------------------------------

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
var TEST_COOKIE_NAME = 'crumble';

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
var MAXIMUM_EXPIRY_DATE = new Date('Fri, 31 Dec 9999 23:59:59 GMT');

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
var ROOT_DOMAIN = '.';

// --------------------------------------------------------

/**
 * Determines whether a cookie exists in a given document.
 *
 * @private
 *
 * @static
 *
 * @returns {Boolean} `true` if the cookie exists, otherwise `false`.
 *
 * @param {HTMLDocument} document The document to search the cookie for.
 * @param {String}       name     The name of the cookie to test the presence of.
 *
 * @memberof Crumble
 */
function hasCookieInDocument (document, name)
{
	return new RegExp('(?:^|.*;)\\s*' + global.encodeURIComponent(name) + '\\s*\\=').test(document.cookie);
}

/**
 * Retrieves the value of a cookie in a given document.
 *
 * @private
 *
 * @static
 *
 * @returns {String} The value of the cookie or `null` if the cookie doesn't exist in the document.
 *
 * @param {HTMLDocument} document The document to search the cookie for.
 * @param {String}       name     The name of the cookie to fetch.
 *
 * @memberof Crumble
 */
function getCookieInDocument (document, name)
{
	var cookie = new RegExp('(?:(?:^|.*;)\\s*' + global.encodeURIComponent(name) + '\\s*\\=\\s*(.*?)(?:;|$))').exec(document.cookie);

	if (cookie === null)
	{
		return null;
	}

	return global.decodeURIComponent( cookie[1] );
}

/**
 * Sets a cookie in a given document.
 *
 * This will set both an `expires` and a `max-age` attribute.
 *
 * @private
 *
 * @static
 *
 * @param {HTMLDocument} document                 The document to set the cookie for.
 * @param {String}       name                     The name of the cookie.
 * @param {*}            [value]                  The value of the cookie. When `undefined` or `null` this will be omitted.
 * @param {Number}       [age]                    The duration (in milliseconds) of which the cookie can live. When provided any `expires` date is ignored.
 * @param {Date}         [expires]                The expiry date of the cookie, if omitted, the cookie will expire at the end of the session.
 * @param {String}       [path]                   The path of which the cookie will be created. Defaults to the path of the document.
 * @param {String}       [domain]                 The (sub)domain of which the cookie will be created. It can only be a domain that the target document is in, however cookies can cross subdomains. Defaults to the domain of the document (i.e. the value of `document.domain`).
 * @param {Boolean}      [secure = false]         Indicates whether the cookie should only be passed over HTTPS connections.
 * @param {Boolean}      [firstPartyOnly = false] Indicates whether the cookie should only be sent in a first-party context. This is subject to client support.
 *
 * @throws {TypeError} When `name` is `null` or `undefined`.
 * @throws {TypeError} When `age` is not a valid number.
 * @throws {TypeError} When `expires` does not represent a valid date.
 *
 * @memberof Crumble
 */
function setCookieInDocument (document, name, value, age, expires, path, domain, secure, firstPartyOnly)
{
	if (name === undefined || name === null)
	{
		throw new TypeError('The cookie name cannot be `null` or `undefined`.');
	}

	var cookie = global.encodeURIComponent(name) + '=';

	// Value.
	//
	// To keep things tidy, ensure the value is omitted if it
	// is `undefined` or `null`.
	if (value !== null)
	{
		cookie += global.encodeURIComponent(value);
	}

	// Path.
	if (path)
	{
		cookie += ';path=' + path;
	}

	// Domain.
	//
	// If the provided domain matches the document domain, do
	// not bother adding the attribute.
	//
	// This is to support domains like `localhost`, which when
	// explicitly set causes the cookie not to be written.
	if (domain && domain !== document.domain)
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
		if (expires instanceof Date && expires.toString() !== 'Invalid Date')
		{
			age = expires.getTime() - Date.now();

			// HTTP 1.1.
			cookie += ';max-age=' + (age / 1000);

			// HTTP 1.0.
			cookie += ';expires=' + expires.toUTCString();
		}
		else
		{
			throw new TypeError('The cookie expiry must represent a valid date.');
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

/**
 * Removes a cookie from a given document by forcing it to immediately expire.
 *
 * @private
 *
 * @static
 *
 * @param {HTMLDocument} document                 The document to remove the cookie from.
 * @param {String}       name                     The name of the cookie to remove.
 * @param {String}       [path]                   The path of which the cookie will be removed from.
 * @param {String}       [domain]                 The (sub)domain of which the cookie will be removed from. The domain can only be a domain that the target document is in, however cookies can cross subdomains. Defaults to the domain of the document (i.e. the value of `document.domain`).
 * @param {Boolean}      [secure = false]         Indicates whether the cookie should only be removed over HTTPS connections.
 * @param {Boolean}      [firstPartyOnly = false] Indicates whether the cookie should only be removed in a first-party context. This is subject to client support.
 *
 * @throws {TypeError} When `name` is `null` or `undefined`.
 *
 * @memberof Crumble
 */
function removeCookieFromDocument (document, name, path, domain, secure, firstPartyOnly)
{
	setCookieInDocument(document, name, undefined, -3600000, undefined, path, domain, secure, firstPartyOnly);
}

// --------------------------------------------------------

/**
 * Determines whether cookies are enabled in a given document.
 *
 * @private
 *
 * @static
 *
 * @returns {Boolean} `true` if cookies are enabled, othrwise `false`.
 *
 * @param {HTMLDocument} document The document to test.
 *
 * @memberof Crumble
 */
function isCookiesEnabledInDocument (document)
{
	setCookieInDocument(
		document, TEST_COOKIE_NAME, undefined, undefined, undefined, undefined, undefined, undefined, undefined
	);

	var isEnabled = hasCookieInDocument(document, TEST_COOKIE_NAME);

	removeCookieFromDocument(
		document, TEST_COOKIE_NAME, undefined, undefined, undefined
	);

	return isEnabled;
}

/**
 * Retrieves the root domain of a given a document.
 *
 * For example if the document is on domain `a.b.c.d.co.uk` the root domain will be `d.co.uk`.
 *
 * @private
 *
 * @static
 *
 * @returns {String} The root domain of the given document.
 *
 * @param {HTMLDocument} document The document to retrieve the root domain from.
 *
 * @memberof Crumble
 */
function getRootDomainForDocument (document)
{
	var domain, domains = document.domain.split('.');

	for (var i = 0, l = domains.length; i < l; ++i)
	{
		domain = domains.slice(-1 - i).join('.');

		setCookieInDocument(
			document, TEST_COOKIE_NAME, undefined, undefined, undefined, undefined, domain, undefined, undefined
		);

		if (hasCookieInDocument(document, TEST_COOKIE_NAME))
		{
			break;
		}
	}

	removeCookieFromDocument(
		document, TEST_COOKIE_NAME, undefined, domain, undefined, undefined
	);

	return domain;
}

// --------------------------------------------------------

/**
 * Creates a new Crumble interface to a given document object.
 *
 * Example usage:
 *
 * ```
 * var cookies = new Crumble(window.document);
 *
 * if (cookies.isEnabled() === false)
 * {
 *    window.alert('You do not have cookies enabled.');
 * }
 * ```
 *
 * @class Crumble
 *
 * @classdesc A simple wrapper that makes reading the cookies of a given document easy and expressive.
 *
 * @param {HTMLDocument} document The document that the Crumble will be reading
 *
 * @throws {TypeError} When `document` does not have both a `cookie` and `domain` property.
 */
function Crumble (document)
{
	// Perform some duck type checks to ensure the provided
	// document is valid.
	if (document === undefined || document.cookie === undefined || document.domain === undefined)
	{
		throw new TypeError('Crumble expects a document object with at least both a `cookie` and `domain` property.');
	}

	/**
	 * The document containing the cookie data being read.
	 *
	 * @private
	 *
	 * @instance
	 *
	 * @type {HTMLDocument}
	 *
	 * @memberof Crumble
	 */
	this._document = document;

	/**
	 * The root domain of the document that will be used when setting a cookie with the domain `.`;
	 *
	 * @private
	 *
	 * @instance
	 *
	 * @type {String}
	 *
	 * @memberof Crumble
	 */
	this._rootDomain = getRootDomainForDocument(document);
}

// --------------------------------------------------------

Crumble.prototype =
{
	/**
	 * @ignore
	 */
	constructor : Crumble,

	/**
	 * Determines whether cookies are enabled in the target document.
	 *
	 * Example usage:
	 *
	 * ```
	 * if (cookies.isEnabled() === false)
	 * {
	 *    window.alert('You do not have cookies enabled.');
	 * }
	 * ```
	 *
	 * @instance
	 *
	 * @returns {Boolean} `true` if cookies are enabled in this document, otherwise `false`.
	 */
	isEnabled : function ()
	{
		return isCookiesEnabledInDocument(this._document);
	},

	/**
	 * Retrieves the value of a cookie from the target document.
	 *
	 * Example usage:
	 *
	 * ```
	 * var cookie = cookies.get('cookie_name');
	 * ```
	 *
	 * @instance
	 *
	 * @returns {String} The value of the cookie. `null` will be returned if the cookie doesn't exist.
	 *
	 * @param {String} name The name of the cookie to fetch.
	 */
	get : function (name)
	{
		return getCookieInDocument(this._document, name);
	},

	/**
	 * Determines whether a cookie exists in the target document.
	 *
	 * Example usage:
	 *
	 * ```
	 * var exists = cookies.has('cookie_name');
	 * ```
	 *
	 * The above is just a more expressive (and faster) way of doing the following:
	 *
	 * ```
	 * var exists = crumble.get('cookie_name') !== null;
	 * ```
	 *
	 * @instance
	 *
	 * @returns {Boolean} `true` if the cookie exists in this document, otherwise `false`.
	 *
	 * @param {String} name The name of the cookie to test the presence of.
	 */
	has : function (name)
	{
		return hasCookieInDocument(this._document, name);
	},

	/**
	 * Sets a cookie in the target document.
	 *
	 * Example usage:
	 *
	 * ```
	 * cookies.set(
	 * {
	 *    name : 'name', value : 'value', domain : 'a.domain.com', path : '/a/document/path', secure : false
	 * });
	 * ```
	 *
	 * Alternatively you can separate the value from the cookie crumbs, like so:
	 *
	 * ```
	 * cookies.set(
	 * {
	 *    name : 'name', domain : 'a.domain.com', path : '/a/document/path', secure : false
	 *
	 * }, 'value');
	 * ```
	 *
	 * This is useful as the value is usually the variable when setting a cookie whereas the other cookie crumbs are usually fixed.
	 *
	 * @instance
	 *
	 * @param {Object}             crumbs                          The crumbs that make the cookie.
	 * @param {String}             crumbs.name                     The name of the cookie.
	 * @param {String}             [crumbs.value]                  The value of the cookie. When set to `undefined` the cookie will be removed by forcing it to immediately expire, ignoring any `age` or `expires` crumb that may be provided.
	 * @param {Number}             [crumbs.age]                    The duration (in milliseconds) of which the cookie can live. When defined, any provided expiry date is ignored. When set to `Infinity` the cookie will be set to expire with date: `31 Dec 9999 23:59:59 GMT`.
	 * @param {Date|String|Number} [crumbs.expires]                The expiry date of the cookie, if omitted, the cookie will expire at the end of the session. You can provide a date object, date string or a timestamp. When provided a timestamp equivalent to `Infinity` the cookie will be set to expire with date: `31 Dec 9999 23:59:59 GMT`.
	 * @param {String}             [crumbs.path]                   The path of which the cookie will be created. Defaults to the path of the target document.
	 * @param {String}             [crumbs.domain]                 The (sub)domain of which the cookie will be created. The domain can only be a domain that the target document is in, however cookies can cross subdomains. When set to `.` the domain will be set to the root domain of the target document. Defaults to the domain of the target document (i.e. the value of `document.domain`).
	 * @param {Boolean}            [crumbs.secure = false]         Indicates whether the cookie should only be passed over HTTPS connections.
	 * @param {Boolean}            [crumbs.firstPartyOnly = false] Indicates whether the cookie should only be sent in a first-party context. This is subject to client support.
	 * @param {String}             [value]                         The value of the cookie, see the documentation for `crumbs.value`. When omitted `crumbs.value` will be used.
	 *
	 * @throws {TypeError} When `crumbs.name` is `null` or `undefined`.
	 * @throws {TypeError} When `crumbs.age` is not a valid number.
	 * @throws {TypeError} When `crumbs.expires` does not represent a valid date.
	 */
	set : function (crumbs, value)
	{
		var name           = crumbs.name,
		    age            = crumbs.age,
		    expires        = crumbs.expires,
		    path           = crumbs.path,
		    domain         = crumbs.domain,
		    secure         = crumbs.secure,
		    firstPartyOnly = crumbs.firstPartyOnly;

		if (value === undefined)
		{
			value = crumbs.value;
		}

		// If no cookie value is specified we will remove the
		// cookie instead.
		if (value === undefined)
		{
			removeCookieFromDocument(this._document, name, path, domain, secure, firstPartyOnly);

			return;
		}

		if (age)
		{
			if (age === Infinity)
			{
				// Determine the number of seconds between now and the
				// maximum allowed expiry date.
				age = MAXIMUM_EXPIRY_DATE.getTime() - Date.now();
			}

			// Ignore.
			expires = undefined;
		}

		if (expires)
		{
			expires = (expires === Infinity) ? MAXIMUM_EXPIRY_DATE : new Date(expires);

			// Ignore.
			age = undefined;
		}

		if (domain === ROOT_DOMAIN)
		{
			domain = this._rootDomain;
		}

		setCookieInDocument(this._document, name, value, age, expires, path, domain, secure, firstPartyOnly);
	},

	/**
	 * Removes a cookie from the target document by forcing it to immediately expire.
	 *
	 * Example usage:
	 *
	 * ```
	 * cookies.remove(
	 * {
	 *    name : 'name'
	 * });
	 * ```
	 *
	 * The above is just a more expressive way of doing the following:
	 *
	 * ```
	 * cookies.set(
	 * {
	 *    name : 'name', value : undefined
	  * });
	 * ```
	 *
	 * @instance
	 *
	 * @param {Object}  crumbs                          The crumbs of the cookie to remove.
	 * @param {String}  crumbs.name                     The name of the cookie.
	 * @param {String}  [crumbs.path]                   The path of which the cookie will be removed from. Defaults to the path of the target document.
	 * @param {String}  [crumbs.domain]                 The (sub)domain of which the cookie will be removed from. The domain can only be a domain that the target document is in, however cookies can cross subdomains. When set to `.` the cookie will be removed from the root domain of the target document. Defaults to the domain of the target document (i.e. the value of `document.domain`).
	 * @param {Boolean} [crumbs.secure = false]         Indicates whether the cookie should only be removed over HTTPS connections.
	 * @param {Boolean} [crumbs.firstPartyOnly = false] Indicates whether the cookie should only be sent in a first-party context. This is subject to client support.
	 *
	 * @throws {Error} When `crumbs.name` is `null` or `undefined`.
	 */
	remove : function (crumbs)
	{
		var name           = crumbs.name,
		    path           = crumbs.path,
		    domain         = crumbs.domain,
		    secure         = crumbs.secure,
		    firstPartyOnly = crumbs.firstPartyOnly;

		if (domain === ROOT_DOMAIN)
		{
			domain = this._rootDomain;
		}

		removeCookieFromDocument(this._document, name, path, domain, secure, firstPartyOnly);
	}
};

// --------------------------------------------------------

module.exports = Crumble;
