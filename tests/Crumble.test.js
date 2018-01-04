'use strict';

// Dependencies
// --------------------------------------------------------

const { expect } = require('chai');
const sinon      = require('sinon');
const { JSDOM }  = require('jsdom');

// Subjects
// --------------------------------------------------------

const Crumble = require('../src/Crumble');

// --------------------------------------------------------

function spyOnJSDomDocumentCookie ()
{
	let cookiePropertyDescriptor = Object.getOwnPropertyDescriptor(
		Object.getPrototypeOf(document), 'cookie'
	);

	// Spy on the setter used for the `document.cookie`
	// property.
	let documentCookieSpy = sinon.spy(cookiePropertyDescriptor, 'set');

	// Redefine the `document.cookie` property using the
	// spied on definition.
	Object.defineProperty(document, 'cookie', cookiePropertyDescriptor);

	return documentCookieSpy;
}

// --------------------------------------------------------

describe('Crumble', function ()
{
	let clock = null;

	beforeEach(function ()
	{
		let browser = new JSDOM('<html><head></head><body></body></html>', {
			url : 'http://test.crumble.co.uk'
		});

		// Expose.
		global.window    = browser.window;
		global.document  = browser.window.document;
		global.navigator = browser.window.navigator;

		// Mock.
		clock = sinon.useFakeTimers(344736000000);
	});

	afterEach(function ()
	{
		// Restore.
		clock.restore();

		// Close.
		window.close();

		// Clean.
		delete global.document;
		delete global.window;
		delete global.navigator;
	});

	describe('.isCookiesEnabled()', function ()
	{
		it('returns `true` when the client has cookies enabled', function ()
		{
			// Act & Assert.
			expect(
				Crumble.isCookiesEnabled()
			).to.be.true;
		});

		it('returns `false` when the client has cookies disabled', function ()
		{
			// Setup.
			Object.defineProperty(global.document.defaultView.navigator, 'cookieEnabled', {
				value : false
			});

			// Act & Assert.
			expect(
				Crumble.isCookiesEnabled()
			).to.be.false;
		});
	});

	describe('.getCookie(name)', function ()
	{
		it('returns the value of a cookie', function ()
		{
			// Setup.
			global.document.cookie = 'name=value';

			// Act & Assert.
			expect(
				Crumble.getCookie('name')
			).to.equal('value');
		});

		it('returns the value of a cookie URL decoded when required', function ()
		{
			// Setup.
			global.document.cookie = 'name=a%20value%20that%20needs%20decoding';

			// Act & Assert.
			expect(
				Crumble.getCookie('name')
			).to.equal('a value that needs decoding');
		});

		it('returns `null` when a cookie does not exist', function ()
		{
			// Act & Assert.
			expect(
				Crumble.getCookie('name')
			).to.be.null;
		});
	});

	describe('.hasCookie(name)', function ()
	{
		it('returns `true` when a cookie exists', function ()
		{
			// Setup.
			global.document.cookie = 'name=value';

			// Act & Assert.
			expect(
				Crumble.hasCookie('name')
			).to.be.true;
		});

		it('returns `false` when a cookie does not exist', function ()
		{
			// Act & Assert.
			expect(
				Crumble.hasCookie('name')
			).to.be.false;
		});
	});

	describe('.setCookie(crumbs, cookieValue)', function ()
	{
		it('creates a cookie with the name and value specified by `crumbs.name` and `cookieValue` respectively', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act
			Crumble.setCookie({
				name : 'name'
			}, 'value');

			// Assert.
			sinon.assert.calledWithExactly(spy, 'name=value');
		});

		it('creates a cookie with the value specified by `crumbs.value` when `cookieValue` is `undefined`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act
			Crumble.setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			sinon.assert.calledWithExactly(spy, 'name=value');
		});

		it('creates a cookie ignore `crumbs.value` when `cookieValue` is not `undefined`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act
			Crumble.setCookie({
				name : 'name', value : 'the value that should be ignored'
			}, 'value');

			// Assert.
			sinon.assert.calledWithExactly(spy, 'name=value');
		});

		it('creates a cookie with the value URL encoded when required', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name'
			}, 'a value that needs encoding');

			// Assert.
			sinon.assert.calledWithExactly(spy, 'name=a%20value%20that%20needs%20encoding');

			// Reset.
			spy.reset();

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'another value that needs encoding'
			});

			// Assert.
			sinon.assert.calledWithExactly(spy, 'name=another%20value%20that%20needs%20encoding');
		});

		it('creates a cookie with no value when `cookieValue` or `crumbs.value` is `null`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name'
			}, null);

			// Assert.
			sinon.assert.calledWithExactly(spy, 'name=');

			// Reset.
			spy.reset();

			// Act.
			Crumble.setCookie({
				name : 'name', value : null
			});

			// Assert.
			sinon.assert.calledWithExactly(spy, 'name=');
		});

		it('creates a cookie with no value when `crumbs.value` is `undefined`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name'
			});

			// Assert.
			sinon.assert.calledWithExactly(spy, 'name=');
		});

		it('creates a cookie that is only available on the path specified by `crumbs.path`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', path : '/a/document/path'
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';path=/a/document/path');
		});

		it('creates a cookie that is only available on the path of the document when `crumbs.path` is `undefined', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';path=');
		});

		it('creates a cookie that is only available on the domain specified by `crumbs.domain`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', domain : 'sub.domain.com'
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';domain=sub.domain.com');
		});

		it('creates a cookie that is only available on the domain of the document when `crumbs.domain` is `undefined`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';domain=');
		});

		it('creates a cookie that is only available on the root domain of the document when `crumbs.domain` is `.`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', domain : '.'
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';domain=crumble.co.uk');
		});

		it('creates a cookie by ignoring `crumbs.domain` when it matches the domain of the document', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', domain : 'test.crumble.co.uk'
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';domain=');
		});

		it('creates a cookie that is only available over HTTPS when `crumbs.secure` equates to `true`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', secure : true
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';secure');
		});

		it('creates a cookie that is available over both HTTP and HTTPS when `crumbs.secure` equates to `false`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', secure : false
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';secure');
		});

		it('creates a cookie that is available over both HTTP and HTTPS when `crumbs.secure` is `undefined`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';secure');
		});

		it('creates a cookie that will expire after the number of milliseconds specified by `crumbs.age`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', age : 3600000
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';max-age=3600');

			// Assert.
			sinon.assert.calledWithMatch(spy, ';expires=Thu, 04 Dec 1980 01:00:00 GMT');
		});

		it('creates a cookie that will expire at 23:59:59 on 31 Dec 9999 when `crumbs.age` is `Infinity`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', age : Infinity
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';max-age=253057564799');

			// Assert.
			sinon.assert.calledWithMatch(spy, ';expires=Fri, 31 Dec 9999 23:59:59 GMT');
		});

		it('creates a cookie that will expire at the date specified by `crumbs.expires` as a date object', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', expires : new Date('Thu, 04 Dec 1980 02:00:00 GMT')
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';max-age=7200');

			// Assert.
			sinon.assert.calledWithMatch(spy, ';expires=Thu, 04 Dec 1980 02:00:00 GMT');
		});

		it('creates a cookie that will expire at the date specified by `crumbs.expires` as a date string', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', expires : 'Thu, 04 Dec 1980 03:00:00 GMT'
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';max-age=10800');

			// Assert.
			sinon.assert.calledWithMatch(spy, ';expires=Thu, 04 Dec 1980 03:00:00 GMT');
		});

		it('creates a cookie that will expire at the date specified by `crumbs.expires` as a timestamp', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', expires : 344750400000
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';max-age=14400');

			// Assert.
			sinon.assert.calledWithMatch(spy, ';expires=Thu, 04 Dec 1980 04:00:00 GMT');
		});

		it('creates a cookie that will expire at 23:59:59 on 31 Dec 9999 when `crumbs.expires` is `Infinity`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', expires : Infinity
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';max-age=253057564799');

			// Assert.
			sinon.assert.calledWithMatch(spy, ';expires=Fri, 31 Dec 9999 23:59:59 GMT');
		});

		it('creates a cookie that will expire at the end of the client session when both `crumbs.age` and `crumbs.expires` is `undefined`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';max-age=');

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';expires=');
		});

		it('creates a cookie shall create a cookie by ignoring `crumbs.expires` when `crumbs.age` is specified', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', age : 3600000, expires : new Date('Thu, 04 Dec 1980 05:00:00 GMT')
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';max-age=3600');

			// Assert.
			sinon.assert.calledWithMatch(spy, ';expires=Thu, 04 Dec 1980 01:00:00 GMT');
		});

		it('creates a cookie that is only available in first party contexts when `crumbs.firstPartyOnly` equates to `true`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', firstPartyOnly : true
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';first-party-only');
		});

		it('creates a cookie that is available in all contexts when `crumbs.firstPartyOnly` equates to `false`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value', firstPartyOnly : false
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';first-party-only');
		});

		it('creates a cookie that is available in all contexts when `crumbs.firstPartyOnly` is `undefined`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';first-party-only');
		});

		it('throws a type error when `crumbs.name` is `undefined` or `null`', function ()
		{
			// Act & Assert.
			expect(function ()
			{
				Crumble.setCookie({});

			}).to.throw(TypeError);

			// Act & Assert.
			expect(function ()
			{
				Crumble.setCookie({
					name : null
				});

			}).to.throw(TypeError);
		});

		it('throws a type error when `crumbs.age` is not a number', function ()
		{
			// Act & Assert.
			expect(function ()
			{
				Crumble.setCookie({
					name : 'name', value : 'value', age : 'not a number'
				});

			}).to.throw(TypeError);
		});

		it('throws a type error when `crumbs.expires` does not represent a valid date', function ()
		{
			// Act & Assert.
			expect(function ()
			{
				Crumble.setCookie({
					name : 'name', value : 'value', expires : new Date('An invalid date string')
				});

			}).to.throw(TypeError);

			// Act & Assert.
			expect(function ()
			{
				Crumble.setCookie({
					name : 'name', value : 'value', expires : 'An invalid date string'
				});

			}).to.throw(TypeError);
		});
	});

	describe('.removeCookie(crumbs)', function ()
	{
		it('removes a cookie with the name specified by `crumbs.name` by forcing it to immediately expire', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.removeCookie({
				name : 'name'
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';max-age=-3600');

			// Assert.
			sinon.assert.calledWithMatch(spy, ';expires=Wed, 03 Dec 1980 23:00:00 GMT');
		});

		it('removes a cookie from the path specified by `crumbs.path`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.removeCookie({
				name : 'name', path : '/a/document/path'
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';path=/a/document/path');
		});

		it('removes a cookie from the path of the document when `crumbs.path` is `undefined`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.removeCookie({
				name : 'name'
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';path=');
		});

		it('removes a cookie from the the domain specified by `crumbs.domain`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.removeCookie({
				name : 'name', domain : 'crumble.co.uk'
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';domain=crumble.co.uk');
		});

		it('removes a cookie from the domain of the document when `crumbs.domain` is `undefined`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.removeCookie({
				name : 'name'
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';domain=');
		});

		it('removes a cookie from the root domain of the document when `crumbs.domain` is `.`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.removeCookie({
				name : 'name', value : 'value', domain : '.'
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';domain=crumble.co.uk');
		});

		it('removes a cookie by ignoring `crumbs.domain` when it matches the domain of the document', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.removeCookie({
				name : 'name', value : 'value', domain : 'test.crumble.co.uk'
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';domain=');
		});

		it('removes a cookie only over HTTPS when `crumbs.secure` equates to `true`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.removeCookie({
				name : 'name', secure : true
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';secure');
		});

		it('removes a cookie over both HTTP and HTTPS when `crumbs.secure` equates to `false`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.removeCookie({
				name : 'name', secure : false
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';secure');
		});

		it('removes a cookie over both HTTP and HTTPS when `crumbs.secure` is `undefined`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.removeCookie({
				name : 'name'
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';secure');
		});

		it('removes a cookie only from the first party context when `crumbs.firstPartyOnly` equates to `true`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.removeCookie({
				name : 'name', firstPartyOnly : true
			});

			// Assert.
			sinon.assert.calledWithMatch(spy, ';first-party-only');
		});

		it('removes a cookie from all contexts when `crumbs.firstPartyOnly` equates to `false`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.removeCookie({
				name : 'name', firstPartyOnly : false
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';first-party-only');
		});

		it('removes a cookie from all contexts when `crumbs.firstPartyOnly` is `undefiend`', function ()
		{
			// Spy.
			let spy = spyOnJSDomDocumentCookie(global.document);

			// Act.
			Crumble.removeCookie({
				name : 'name'
			});

			// Assert.
			sinon.assert.neverCalledWithMatch(spy, ';first-party-only');
		});

		it('throws a type error when `crumbs.name` is `undefined` or `null`', function ()
		{
			// Act & Assert.
			expect(function ()
			{
				Crumble.removeCookie({});

			}).to.throw(TypeError);

			// Act & Assert.
			expect(function ()
			{
				Crumble.removeCookie({
					name : null
				});

			}).to.throw(TypeError);
		});
	});
});
