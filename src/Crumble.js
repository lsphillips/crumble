/* global document : false */

(function (name, factory, context)
{
	if (typeof module !== 'undefined' && module.exports)
	{
		module.exports = factory.call(context);
	}
	else if (typeof define === 'function' && define.amd)
	{
		define(name, [], factory);
	}
	else
	{
		context[name] = factory.call(context);
	}

}) ('Crumble', function ()
{
	'use strict';

	/**
	 * The name of any test cookies created by Crumble.
	 *
	 * @property TEST_COOKIE_NAME
	 *
	 * @private
	 *
	 * @static
	 *
	 * @final
	 *
	 * @type {String}
	 *
	 * @for Crumble
	 */
	var TEST_COOKIE_NAME = 'crumble';

	/**
	 * The value given to any test cookies created by Crumble.
	 *
	 * @property TEST_COOKIE_VALUE
	 *
	 * @private
	 *
	 * @static
	 *
	 * @final
	 *
	 * @type {String}
	 *
	 * @for Crumble
	 */
	var TEST_COOKIE_VALUE = 'nom nom nom';

	/**
	 * The maximum expiry date.
	 *
	 * @property MAXIMUM_EXPIRY_DATE
	 *
	 * @private
	 *
	 * @static
	 *
	 * @final
	 *
	 * @type {String}
	 *
	 * @for Crumble
	 */
	var MAXIMUM_EXPIRY_DATE = new Date('Fri, 31 Dec 9999 23:59:59 GMT');

	// ----------------------------------------------------

	/**
	 * Determines the root domain of the document.
	 *
	 * For example if the document is on the `www.test.domain.co.uk` domain, the root domain would be `domain.co.uk`.
	 *
	 * @method getRootDomain
	 *
	 * @private
	 *
	 * @static
	 *
	 * @for Crumble
	 *
	 * @return {String} The root domain of the document.
	 */
	var getRootDomain = (function ()
	{
	    var _domain, _document;

	    return function ()
	    {
			// If the document has not changed, just grab
			// it from the cache.
	        if (_document !== document)
	        {
	            var domains = document.domain.split('.');

	            for (var i = 0, l = domains.length; i < l; ++i)
	            {
	                var domain = domains.slice(-1 - i).join('.');

	                Crumble.set(
	                {
	                    name : TEST_COOKIE_NAME, value : TEST_COOKIE_NAME, domain : domain
	                });

	                if ( Crumble.has(TEST_COOKIE_NAME) )
	                {
	                    _domain = domain;

	                    break;
	                }
	            }

	            Crumble.remove(
	            {
	                name : TEST_COOKIE_NAME, domain : _domain
	            });

	            _document = document;
	        }

	        return _domain;
	    };

	}) ();

	// ----------------------------------------------------

	/**
	 * A simple utility that abstracts the legacy API that is `document.cookie`.
	 *
	 * @class Crumble
	 *
	 * @static
	 */
	var Crumble =
	{
		/**
		 * Determines whether the client has cookies enabled.
		 *
		 * @method isEnabled
		 *
		 * @public
		 *
		 * @static
		 *
		 * @return {Boolean} `true` if cookies are enabled, otherwise `false`.
		 *
		 * @todo Should this be cached for the document, as some clients don't require a refresh to
		 */
		isEnabled : (function ()
		{
			var _enabled, _document;

			return function ()
			{
				// If the document has not changed, just grab
	    		// it from the cache.
				if (_document !== document)
				{
					Crumble.set(
					{
						name : TEST_COOKIE_NAME, value : TEST_COOKIE_VALUE
					});

					_enabled = Crumble.has(TEST_COOKIE_NAME);

					Crumble.remove(
					{
						name : TEST_COOKIE_NAME
					});

					_document = document;
				}

				return _enabled;
			};

		}) (),

		// ------------------------------------------------

		/**
		 * Determines if a cookie exists.
		 *
		 * @method has
		 *
		 * @public
		 *
		 * @static
		 *
		 * @return {Boolean} `true` if the cookie exists, otherwise `false`.
		 *
		 * @param {String} name The name of the cookie to test the presence of.
		 */
		has : function (name)
		{
			return new RegExp('(?:^|.*;)\\s*' + encodeURIComponent(name) + '\\s*\\=').test(document.cookie);
		},

		/**
		 * Retrieves the value of a cookie.
		 *
		 * @method get
		 *
		 * @public
		 *
		 * @static
		 *
		 * @return {String} The value of the cookie. `null` will be returned if the cookie doesn't exist.
		 *
		 * @param {String} name The name of the cookie to fetch.
		 */
		get : function (name)
		{
			var cookie = new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(name) + '\\s*\\=\\s*(.*?)(?:;|$))').exec(document.cookie);

			if (cookie === null)
			{
				return null;
			}

			return decodeURIComponent( cookie[1] );
		},

		/**
		 * Sets a cookie.
		 *
		 * Example usage:
		 *
		 * ```
		 * Crumble.set({ name : 'name', value : 'value', domain : 'a.domain.com', path : '/a/document/path', secure : false });
		 * ```
		 *
		 * Alternatively you can separate the value from the cookie crumbs, like so:
		 *
		 * ```
		 * Crumble.set({ name : 'name', domain : 'a.domain.com', path : '/a/document/path', secure : false }, 'value');
		 * ```
		 *
		 * This is useful as the value is usually the variable when setting a cookie whereas the other cookie crumbs are usually fixed.
		 *
		 * @method set
		 *
		 * @public
		 *
		 * @static
		 *
		 * @return {void}
		 *
		 * @param {Object}             crumbs                  The crumbs that make the cookie.
		 * @param {String}             crumbs.name             The name of the cookie.
		 * @param {String}             [crumbs.value]          The value of the cookie. If set to `undefined` or `null`; the cookie will be removed by forcing it to immediately expire, ignoring any `age` or `expires` crumb that may be provided.
		 * @param {Date|String|Number} [crumbs.expires]        The expiry date of the cookie, if omitted, the cookie will expire at the end of the session. You can provide a date object, date string or a timestamp. If provided a timestamp equivalent to `Infinity` the cookie will be set to expire with date: `31 Dec 9999 23:59:59 GMT`.
		 * @param {Number}             [crumbs.age]            The duration (in minutes) of which the cookie can live. When defined, any provided expiry date is ignored. If set to `Infinity` the cookie will be set to expire with date: `31 Dec 9999 23:59:59 GMT`.
		 * @param {String}             [crumbs.path = '/']     The path of which the cookie will be sent.
		 * @param {String}             [crumbs.domain]         The (sub)domain of which the cookie will be sent. The domain can only be a domain that the current document is in, however cookies can cross subdomains. If set to `.` the domain will be set to the root domain of the document. Defaults to the domain of the document (i.e. the value of `document.cookie`).
		 * @param {Boolean}            [crumbs.secure = false] Indicates whether the cookie should only be passed over HTTPS connections.
		 * @param {String}             [value]                 The value of the cookie, see the documentation for `crumbs.value`. If omitted `crumbs.value` will be used.
		 */
		set : function (crumbs, value)
		{
			var name    = crumbs.name,
			    expires = crumbs.expires,
			    age     = crumbs.age,
			    path    = crumbs.path,
			    domain  = crumbs.domain,
			    secure  = crumbs.secure;

			if (name === undefined || name === null)
			{
				throw new Error('[Crumble] Cannot set cookie, a cookie name must be provided');
			}

			var cookie = encodeURIComponent(name) + '=';

			if (value === undefined)
			{
				value = crumbs.value;
			}

			// If the value is still `undefined` or is
			// `null`, then force the cookie to expire.
			//
			// Also to keep things tidy, ensure the value
			// is also omitted.
			if (value === undefined || value === null)
			{
				age = -1;
			}
			else
			{
				cookie += encodeURIComponent(value);
			}

			cookie += ';path=' + (path || '/');

			if (domain)
			{
				cookie += ';domain=';

				if (domain === '.')
				{
					cookie += getRootDomain();
				}
				else
				{
					cookie += domain;
				}
			}

			var now;

			if (age !== undefined)
			{
				now = new Date();

				if ( isNaN(age) )
				{
					throw new Error('[Crumble] Cannot set cookie `' + name + '`, the provided age `' + age + '` is invalid');
				}

				if (age === Infinity)
				{
					expires = MAXIMUM_EXPIRY_DATE;

					// Determine the number of milliseconds
					// between now and the maximum allowed
					// expiry date.
					age = expires.getTime() - now.getTime();
				}
				else
				{
					expires = new Date();

					// Convert the age, provided in minutes,
					// into milliseconds.
					age = age * 60 * 1000;

					expires.setTime(
						now.getTime() + age
					);
				}

				// HTTP 1.1
				cookie += ';max-age=' + age;

				// HTTP 1.0
				cookie += ';expires=' + expires.toUTCString();
			}
			else
			{
				if (expires !== undefined)
				{
					if (expires.constructor === Number || expires.constructor === String)
					{
						expires = (expires === Infinity) ? MAXIMUM_EXPIRY_DATE : new Date(expires);
					}

					// If we don't have a date object at
					// this point, we were not provided a
					// valid date format in the first place.
					if ( !(expires instanceof Date) )
					{
						throw new Error('[Crumble] Cannot set cookie `' + name + '`, the provided expiry date `' + crumbs.expires + '` is invalid!!!!!');
					}

					var timestamp = expires.getTime();

					// Determine whether the date object is
					// valid.
					if ( isNaN(timestamp) )
					{
						throw new Error('[Crumble] Cannot set cookie `' + name + '`, the provided expiry date `' + crumbs.expires + '` is invalid');
					}

					now = new Date();

					// Determine the number of milliseconds
					// between now and the expiry date.
					age = timestamp - now.getTime();

					// HTTP 1.1
					cookie += ';max-age=' + age;

					// HTTP 1.0
					cookie += ';expires=' + expires.toUTCString();
				}
			}

			if (secure)
			{
				cookie += ';secure';
			}

			document.cookie = cookie;
		},

		/**
		 * Removes a cookie by forcing it to immediately expire.
		 *
		 * Example usage:
		 *
		 * ```
		 * Crumble.remove({ name : 'name' });
		 * ```
		 *
		 * The above is just a more expressive way of doing the following:
		 *
		 * ```
		 * Crumble.set({ name : 'name', value : null });
		 * ```
		 *
		 * @method remove
		 *
		 * @public
		 *
		 * @static
		 *
		 * @return {void}
		 *
		 * @param {Object}  crumbs                  The crumbs of the cookie to remove.
		 * @param {String}  crumbs.name             The name of the cookie.
		 * @param {String}  [crumbs.path = '/']     The path of which the cookie will be removed from.
		 * @param {String}  [crumbs.domain]         The (sub)domain of which the cookie will be removed from. The domain can only be a domain that the current document is in, however cookies can cross subdomains. If set to `.` the cookie will be removed from the root domain of the document. Defaults to the domain of the document (i.e. the value of `document.cookie`).
		 * @param {Boolean} [crumbs.secure = false] Indicates whether the cookie should only be removed over HTTPS connections.
		 */
		remove : function (crumbs)
		{
			if (crumbs.name === undefined || crumbs.name === null)
			{
				throw new Error('[Crumble] Cannot remove cookie, a cookie name must be provided');
			}

			this.set(
			{
				name : crumbs.name, path : crumbs.path, domain : crumbs.domain, secure : !!crumbs.secure
			});
		},

		// ------------------------------------------------

		/**
		 * This will remove Crumble from the global namespace, restoring what was there before (if anything). This is for environments that are not using CommonJS or AMD.
		 *
		 * Example usage:
		 *
		 * ```
		 * Namespace.Crumble = Crumble.noConflict();
		 * ```
		 *
		 * @method noConflict
		 *
		 * @public
		 *
		 * @static
		 *
		 * @return {Object} The Crumble object to be assigned to any variable you wish.
		 */
		noConflict : (function (context)
		{
			var _Crumble = context.Crumble;

			return function ()
			{
				context.Crumble = _Crumble;

				return this;
			};

		}) (this)
	};

	// ----------------------------------------------------

	return Crumble;

}, this);
