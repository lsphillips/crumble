import {
	describe,
	beforeEach,
	it
} from 'node:test';
import assert from 'node:assert';
import {
	getCookie,
	hasCookie,
	setCookie,
	removeCookie
} from '../src/crumble.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function assertStartsWith (target, value)
{
	assert.strictEqual(
		target.startsWith(value), true, `"${target}" does not start with "${value}"`
	);
}

function assertContains (target, value)
{
	assert.strictEqual(
		target.includes(value), true, `"${target}" does not contain "${value}"`
	);
}

function assertNotContains (target, value)
{
	assert.strictEqual(
		target.includes(value), false, `"${target}" contains "${value}"`
	);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

describe('crumble', function ()
{
	beforeEach(function ({ mock })
	{
		mock.timers.enable({
			apis : ['Date'], now : 344736000000
		});
	});

	describe('getCookie(plate, name)', function ()
	{
		it('returns the value of the cookie with a given name', function ()
		{
			// Act & Assert.
			assert.strictEqual(
				getCookie('one=three; two=one; three=two', 'one'), 'three'
			);

			// Act & Assert.
			assert.strictEqual(
				getCookie('one=three; two=one; three=two', 'two'), 'one'
			);

			// Act & Assert.
			assert.strictEqual(
				getCookie('one=three; two=one; three=two', 'three'), 'two'
			);
		});

		it('returns the value of the cookie with a given name that needs to be encoded', function ()
		{
			// Act.
			const result = getCookie('one=boring; %2C%3B%5C#$%25&+%3A%3C%3E%3D%2F%3F%40%5B%5D^%7B%7D`|%C3%A3%E2%82%AF%F0%A9%B8%BD%28%29!%22_=special; three=normal', ',;\\#$%&+:<>=/?@[]^{}`|ã₯𩸽()!"_');

			// Assert.
			assert.strictEqual(result, 'special');
		});

		it('returns the value of the cookie that is decoded in accordance to RFC 6265', function ()
		{
			// Act.
			const result = getCookie('one=boring; two=%2C%3B%5C#$%25&+:<>=/?@[]^{}`|%C3%A3%E2%82%AF%F0%A9%B8%BD()!%22_; three=boring', 'two');

			// Assert.
			assert.strictEqual(result, ',;\\#$%&+:<>=/?@[]^{}`|ã₯𩸽()!"_');
		});

		it('returns an empty string when the cookie does not have a value', function ()
		{
			// Act & Assert.
			assert.strictEqual(
				getCookie('one=three; two=; three=two', 'two'), ''
			);
		});

		it('returns `null` when a cookie does not exist', function ()
		{
			// Act & Assert.
			assert.strictEqual(
				getCookie('one=three; two=four; three=two', 'four'), null
			);
		});
	});

	describe('hasCookie(plate, name)', function ()
	{
		it('returns `true` when the cookie exists with a given name', function ()
		{
			// Act & Assert.
			assert.strictEqual(
				hasCookie('one=three; two=one; three=two', 'one'), true
			);

			// Act & Assert.
			assert.strictEqual(
				hasCookie('one=three; two=one; three=two', 'two'), true
			);

			// Act & Assert.
			assert.strictEqual(
				hasCookie('one=three; two=one; three=two', 'three'), true
			);
		});

		it('returns `true` when the cookie exists with a given name that needs to be encoded', function ()
		{
			// Act.
			const result = hasCookie('one=boring; %2C%3B%5C#$%25&+%3A%3C%3E%3D%2F%3F%40%5B%5D^%7B%7D`|%C3%A3%E2%82%AF%F0%A9%B8%BD%28%29!%22_=special; three=normal', ',;\\#$%&+:<>=/?@[]^{}`|ã₯𩸽()!"_');

			// Assert.
			assert.strictEqual(result, true);
		});

		it('returns `true` when the cookie does not have a value', function ()
		{
			// Act & Assert.
			assert.strictEqual(
				hasCookie('one=three; two=; three=two', 'two'), true
			);
		});

		it('returns `false` when a cookie does not exist', function ()
		{
			// Act & Assert.
			assert.strictEqual(
				hasCookie('one=three; two=four; three=two', 'four'), false
			);
		});
	});

	describe('setCookie(crumbs, value)', function ()
	{
		it('creates a cookie with the name specified by `crumbs.name` and a value specified by `value`', function ()
		{
			// Act,
			let cookie = setCookie({
				name : 'name'
			}, 'value');

			// Assert.
			assertStartsWith(cookie, 'name=value');
		});

		it('creates a cookie with the name encoded in accordance to RFC 6265', function ()
		{
			// Act.
			let cookie = setCookie({
				name : ',;\\#$%&+:<>=/?@[]^{}`|ã₯𩸽()!"_'
			}, 'value');

			// Assert.
			assertStartsWith(cookie, '%2C%3B%5C#$%25&+%3A%3C%3E%3D%2F%3F%40%5B%5D^%7B%7D`|%C3%A3%E2%82%AF%F0%A9%B8%BD%28%29!%22_=value');
		});

		it('creates a cookie with the value specified by `crumbs.value` when `value` is not provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			assertStartsWith(cookie, 'name=value');
		});

		it('creates a cookie by ignoring `crumbs.value` when `value` is provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'the value that should be ignored'
			}, 'value');

			// Assert.
			assertStartsWith(cookie, 'name=value');
		});

		it('creates a cookie with the value encoded in accordance to RFC 6265', function ()
		{
			// Act.
			let cookieNotUsingValueCrumb = setCookie({
				name : 'name'
			}, ',;\\#$%&+:<>=/?@[]^{}`|ã₯𩸽()!"_');

			// Assert.
			assertStartsWith(cookieNotUsingValueCrumb, 'name=%2C%3B%5C#$%25&+:<>=/?@[]^{}`|%C3%A3%E2%82%AF%F0%A9%B8%BD()!%22_');

			// Act.
			let cookieUsingValueCrumb = setCookie({
				name : 'name', value : ',;\\#$%&+:<>=/?@[]^{}`|ã₯𩸽()!"_'
			});

			// Assert.
			assertStartsWith(cookieUsingValueCrumb, 'name=%2C%3B%5C#$%25&+:<>=/?@[]^{}`|%C3%A3%E2%82%AF%F0%A9%B8%BD()!%22_');
		});

		it('creates a cookie with no value when `value` or `crumbs.value` is `null`', function ()
		{
			// Act.
			let cookieUsingValue = setCookie({
				name : 'name'
			}, null);

			// Assert.
			assertStartsWith(cookieUsingValue, 'name=;');

			// Act.
			let cookieUsingValueCrumb = setCookie({
				name : 'name', value : null
			});

			// Assert.
			assertStartsWith(cookieUsingValueCrumb, 'name=;');
		});

		it('creates a cookie with no value when `value` and `crumbs.value` are not provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name'
			});

			// Assert.
			assertStartsWith(cookie, 'name=;');
		});

		it('creates a cookie that is only available on the path specified by `crumbs.path`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', path : '/a/document/path'
			});

			// Assert.
			assertContains(cookie, ';path=/a/document/path');
		});

		it('creates a cookie that is only available on the path of the current document when `crumbs.path` is not provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			assertNotContains(cookie, ';path=');
		});

		it('creates a cookie that is only available on the domain specified by `crumbs.domain`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', domain : 'sub.domain.com'
			});

			// Assert.
			assertContains(cookie, ';domain=sub.domain.com');
		});

		it('creates a cookie that is only available on the domain of the current document when `crumbs.domain` is not provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			assertNotContains(cookie, ';domain=');
		});

		it('creates a cookie that is only available over HTTPS when `crumbs.secure` is `true`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', secure : true
			});

			// Assert.
			assertContains(cookie, ';secure');
		});

		it('creates a cookie that is available over both HTTP and HTTPS when `crumbs.secure` is `false`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', secure : false
			});

			// Assert.
			assertNotContains(cookie, ';secure');
		});

		it('creates a cookie that is available over both HTTP and HTTPS when `crumbs.secure` is not provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			assertNotContains(cookie, ';secure');
		});

		it('creates a cookie that will expire after the number of milliseconds specified by `crumbs.age`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', age : 3600000
			});

			// Assert.
			assertContains(cookie, ';max-age=3600');

			// Assert.
			assertContains(cookie, ';expires=Thu, 04 Dec 1980 01:00:00 GMT');
		});

		it('creates a cookie that will expire at `23:59:59 on 31 Dec 9999` when `crumbs.age` is `Infinity`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', age : Infinity
			});

			// Assert.
			assertContains(cookie, ';max-age=253057564799');

			// Assert.
			assertContains(cookie, ';expires=Fri, 31 Dec 9999 23:59:59 GMT');
		});

		it('creates a cookie that will expire at the date specified by `crumbs.expires` as a date object', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', expires : new Date('Thu, 04 Dec 1980 02:00:00 GMT')
			});

			// Assert.
			assertContains(cookie, ';max-age=7200');

			// Assert.
			assertContains(cookie, ';expires=Thu, 04 Dec 1980 02:00:00 GMT');
		});

		it('creates a cookie that will expire at the date specified by `crumbs.expires` as a date string', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', expires : 'Thu, 04 Dec 1980 03:00:00 GMT'
			});

			// Assert.
			assertContains(cookie, ';max-age=10800');

			// Assert.
			assertContains(cookie, ';expires=Thu, 04 Dec 1980 03:00:00 GMT');
		});

		it('creates a cookie that will expire at the date specified by `crumbs.expires` as a timestamp', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', expires : 344750400000
			});

			// Assert.
			assertContains(cookie, ';max-age=14400');

			// Assert.
			assertContains(cookie, ';expires=Thu, 04 Dec 1980 04:00:00 GMT');
		});

		it('creates a cookie that will expire at `23:59:59 on 31 Dec 9999` when `crumbs.expires` is `Infinity`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', expires : Infinity
			});

			// Assert.
			assertContains(cookie, ';max-age=253057564799');

			// Assert.
			assertContains(cookie, ';expires=Fri, 31 Dec 9999 23:59:59 GMT');
		});

		it('creates a cookie that will expire at the end of the current session when both `crumbs.age` and `crumbs.expires` are not provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			assertNotContains(cookie, ';max-age=');

			// Assert.
			assertNotContains(cookie, ';expires=');
		});

		it('creates a cookie by ignoring `crumbs.expires` when `crumbs.age` is provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', age : 3600000, expires : new Date('Thu, 04 Dec 1980 05:00:00 GMT')
			});

			// Assert.
			assertContains(cookie, ';max-age=3600');

			// Assert.
			assertContains(cookie, ';expires=Thu, 04 Dec 1980 01:00:00 GMT');
		});

		it('creates a cookie with a SameSite policy specified by `crumbs.sameSite`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', sameSite : 'strict'
			});

			// Assert.
			assertContains(cookie, ';samesite=strict');
		});

		it('creates a cookie with a Lax SameSite policy when `crumbs.sameSite` is not provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			assertContains(cookie, ';samesite=lax');
		});

		it('throws a type error when `crumbs.name` is `null` or not provided', function ()
		{
			// Act & Assert.
			assert.throws(function ()
			{
				setCookie({});

			}, TypeError);

			// Act & Assert.
			assert.throws(function ()
			{
				setCookie({
					name : null
				});

			}, TypeError);
		});

		it('throws a type error when `crumbs.age` is not a valid number', function ()
		{
			// Act & Assert.
			assert.throws(function ()
			{
				setCookie({
					name : 'name', value : 'value', age : 'not a number'
				});

			}, TypeError);
		});

		it('throws a type error when `crumbs.expires` does not represent a valid date', function ()
		{
			// Act & Assert.
			assert.throws(function ()
			{
				setCookie({
					name : 'name', value : 'value', expires : new Date('An invalid date string')
				});

			}, TypeError);

			// Act & Assert.
			assert.throws(function ()
			{
				setCookie({
					name : 'name', value : 'value', expires : 'An invalid date string'
				});

			}, TypeError);
		});

		it('throws a type error when `crumbs.sameSite` is not `none`, `lax` or `strict`', function ()
		{
			// Act & Assert.
			assert.throws(function ()
			{
				setCookie({
					name : 'name', value : 'value', sameSite : 'spy'
				});

			}, TypeError);
		});

		it('throws an error when `crumbs.secure` is `false` and `crumbs.sameSite` is `none`', function ()
		{
			// Act & Assert.
			assert.throws(function ()
			{
				setCookie({
					name : 'name', value : 'value', sameSite : 'none', secure : false
				});

			}, Error);
		});
	});

	describe('removeCookie(crumbs)', function ()
	{
		it('removes a cookie with the name specified by `crumbs.name` by forcing it to immediately expire', function ()
		{
			// Act.
			let cookie = removeCookie({
				name : 'name'
			});

			// Assert.
			assertStartsWith(cookie, 'name=;');

			// Assert.
			assertContains(cookie, ';max-age=-3600');

			// Assert.
			assertContains(cookie, ';expires=Wed, 03 Dec 1980 23:00:00 GMT');
		});

		it('removes a cookie with the name encoded in accordance to RFC 6265', function ()
		{
			// Act.
			let cookie = removeCookie({
				name : ',;\\#$%&+:<>=/?@[]^{}`|ã₯𩸽()!"_'
			});

			// Assert.
			assertStartsWith(cookie, '%2C%3B%5C#$%25&+%3A%3C%3E%3D%2F%3F%40%5B%5D^%7B%7D`|%C3%A3%E2%82%AF%F0%A9%B8%BD%28%29!%22_=');
		});

		it('removes a cookie from the path specified by `crumbs.path`', function ()
		{
			// Act.
			let cookie = removeCookie({
				name : 'name', path : '/a/document/path'
			});

			// Assert.
			assertContains(cookie, ';path=/a/document/path');
		});

		it('removes a cookie from the path of the current document when `crumbs.path` is not provided', function ()
		{
			// Act.
			let cookie = removeCookie({
				name : 'name'
			});

			// Assert.
			assertNotContains(cookie, ';path=');
		});

		it('removes a cookie from the the domain specified by `crumbs.domain`', function ()
		{
			// Act.
			let cookie = removeCookie({
				name : 'name', domain : 'co.uk'
			});

			// Assert.
			assertContains(cookie, ';domain=co.uk');
		});

		it('removes a cookie from the domain of the current document when `crumbs.domain` is not provided', function ()
		{
			// Act.
			let cookie = removeCookie({
				name : 'name'
			});

			// Assert.
			assertNotContains(cookie, ';domain=');
		});

		it('throws a type error when `crumbs.name` is `null` or not provided', function ()
		{
			// Act & Assert.
			assert.throws(function ()
			{
				removeCookie({});

			}, TypeError);

			// Act & Assert.
			assert.throws(function ()
			{
				removeCookie({
					name : null
				});

			}, TypeError);
		});
	});
});
