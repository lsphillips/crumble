const MAXIMUM_EXPIRY_DATE = new Date('Fri, 31 Dec 9999 23:59:59 GMT');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function escapeForRegularExpression (string)
{
	return string.replace(/([.*+?^=!:${}()/|[\]\\])/g, '\\$1');
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function encodeAsCookieName (string)
{
	return encodeURIComponent(string)
		.replace(/\(/g, '%28')
		.replace(/\)/g, '%29')
		.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function encodeAsCookieValue (string)
{
	return encodeURIComponent(string)
		.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function hasCookie (plate, name)
{
	let safeCookieName = escapeForRegularExpression(
		encodeAsCookieName(name)
	);

	return new RegExp('(?:^|.*;)\\s*' + safeCookieName + '\\s*\\=').test(plate);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

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

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function setCookie (crumbs, value = crumbs.value)
{
	let { name = null, age, expires, path, domain, secure = false, sameSite = 'lax' } = crumbs;

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
			throw new TypeError('The cookie age setting must be a valid number.');
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
			throw new TypeError('The cookie expiry setting must represent a valid date.');
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

	// SameSite.
	if (sameSite !== 'none' && sameSite !== 'lax' && sameSite !== 'strict')
	{
		throw new TypeError('The cookie samesite setting must take the value of `none`, `lax`, or `strict`.');
	}
	else
	{
		cookie += ';samesite=' + sameSite;
	}

	// Secure.
	if (secure)
	{
		cookie += ';secure';
	}
	else if (sameSite === 'none')
	{
		throw new Error('The cookie must be secure to set the samesite setting to `none`.');
	}

	return cookie;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function removeCookie ({ name, path, domain })
{
	return setCookie({
		name, path, domain, age : -3600000
	});
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export { hasCookie, getCookie, setCookie, removeCookie };
