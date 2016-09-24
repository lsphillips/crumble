/* eslint-env mocha */

'use strict';

// Dependencies
// --------------------------------------------------------

const sinon = require('sinon');
const chai  = require('chai');
const jsdom = require('jsdom');

// Helpers
// --------------------------------------------------------

const spyOnDocumentCookie = require('./helpers/spyOnDocumentCookie');

// --------------------------------------------------------

describe('Crumble', function ()
{
	const Crumble = require('../src/Crumble');

	// -------------------------------------------------------

	beforeEach(function (done)
	{
		// Mock.
		jsdom.env(
		{
			html :
			`
				<html>
					<head>
						<title> Crumble Test </title>
					</head>
					<body>
						<!-- A document for testing Crumble -->
					</body>
				</html>
			`,

			done : (error, window) =>
			{
				if (error)
				{
					done(
						new Error(`Could not create a JSDOM window. ${error}`)
					);

					return;
				}

				// Expose `document`, `window` & `navigator` as globals
				// to emulate a browser environment.
				global.document  = window.document;
				global.window    = window;
				global.navigator = window.navigator;

				done();
			},

			url : 'http://test.crumble.co.uk'
		});

		// Mock.
		this.clock = sinon.useFakeTimers(344736000000);
	});

	// -------------------------------------------------------

	afterEach(function ()
	{
		// Close.
		global.window.close();

		// Clean.
		delete global.document;
		delete global.window;
		delete global.navigator;

		// Restore.
		this.clock.restore();
	});

	// -------------------------------------------------------

	describe('.isCookiesEnabled()', function ()
	{
		it('returns `true` when the client has cookies enabled', function ()
		{
			// Act & Assert.
			chai.expect(
				Crumble.isCookiesEnabled()
			).to.be.true;
		});

		it('returns `false` when the client has cookies disabled', function ()
		{
			// Setup.
			Object.defineProperty(global.document.defaultView.navigator, 'cookieEnabled',
			{
				configurable : false, writable : false, enemerable : false, value : false
			});

			// Act & Assert.
			chai.expect(
				Crumble.isCookiesEnabled()
			).to.be.false;
		});
	});

	// -------------------------------------------------------

	describe('.getCookie(name)', function ()
	{
		it('returns the value of a cookie', function ()
		{
			// Setup.
			global.document.cookie = 'name=value';

			// Act & Assert.
			chai.expect(
				Crumble.getCookie('name')
			).to.equal('value');
		});

		it('returns the value of a cookie URL decoded when required', function ()
		{
			// Setup.
			global.document.cookie = 'name=a%20value%20that%20needs%20decoding';

			// Act & Assert.
			chai.expect(
				Crumble.getCookie('name')
			).to.equal('a value that needs decoding');
		});

		it('returns `null` when a cookie does not exist', function ()
		{
			// Act & Assert.
			chai.expect(
				Crumble.getCookie('name')
			).to.be.null;
		});
	});

	// -------------------------------------------------------

	describe('.hasCookie(name)', function ()
	{
		it('returns `true` when a cookie exists', function ()
		{
			// Setup.
			global.document.cookie = 'name=value';

			// Act & Assert.
			chai.expect(
				Crumble.hasCookie('name')
			).to.be.true;
		});

		it('returns `false` when a cookie does not exist', function ()
		{
			// Act & Assert.
			chai.expect(
				Crumble.hasCookie('name')
			).to.be.false;
		});
	});

	// -------------------------------------------------------

	describe('.setCookie(crumbs, cookieValue)', function ()
	{
		context('shall create a cookie', function ()
		{
			it('with the name and value specified by `crumbs.name` and `cookieValue` respectively', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act
				Crumble.setCookie(
				{
					name : 'name'

				}, 'value');

				// Assert.
				chai.expect(
					spy.calledWithExactly('name=value')
				).to.be.true;
			});

			it('with the value specified by `crumbs.value` when `cookieValue` is `undefined`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act
				Crumble.setCookie(
				{
					name : 'name', value : 'value'
				});

				// Assert.
				chai.expect(
					spy.calledWithExactly('name=value')
				).to.be.true;
			});

			it('ignore `crumbs.value` when `cookieValue` is not `undefined`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act
				Crumble.setCookie(
				{
					name : 'name', value : 'the value that should be ignored'

				}, 'value');

				// Assert.
				chai.expect(
					spy.calledWithExactly('name=value')
				).to.be.true;
			});

			it('with the value URL encoded when required', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name'

				}, 'a value that needs encoding');

				// Assert.
				chai.expect(
					spy.calledWithExactly('name=a%20value%20that%20needs%20encoding')
				).to.be.true;

				// Reset.
				spy.reset();

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'another value that needs encoding'
				});

				// Assert.
				chai.expect(
					spy.calledWithExactly('name=another%20value%20that%20needs%20encoding')
				).to.be.true;
			});

			it('with no value when `cookieValue` or `crumbs.value` is `null`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name'

				}, null);

				// Assert.
				chai.expect(
					spy.calledWithExactly('name=')
				).to.be.true;

				// Reset.
				spy.reset();

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : null
				});

				// Assert.
				chai.expect(
					spy.calledWithExactly('name=')
				).to.be.true;
			});

			it('with no value when `crumbs.value` is `undefined`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name'
				});

				// Assert.
				chai.expect(
					spy.calledWithExactly('name=')
				).to.be.true;
			});

			it('that is only available on the path specified by `crumbs.path`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', path : '/a/document/path'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';path=/a/document/path')
				).to.be.true;
			});

			it('that is only available on the path of the document when `crumbs.path` is `undefined', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';path=')
				).to.be.false;
			});

			it('that is only available on the domain specified by `crumbs.domain`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', domain : 'sub.domain.com'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';domain=sub.domain.com')
				).to.be.true;
			});

			it('that is only available on the domain of the document when `crumbs.domain` is `undefined`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';domain=')
				).to.be.false;
			});

			it('that is only available on the root domain of the document when `crumbs.domain` is `.`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', domain : '.'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';domain=crumble.co.uk')
				).to.be.true;
			});

			it('by ignoring `crumbs.domain` when it matches the domain of the document', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', domain : 'test.crumble.co.uk'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';domain=')
				).to.be.false;
			});

			it('that is only available over HTTPS when `crumbs.secure` equates to `true`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', secure : true
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';secure')
				).to.be.true;
			});

			it('that is available over both HTTP and HTTPS when `crumbs.secure` equates to `false`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', secure : false
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';secure')
				).to.be.false;
			});

			it('that is available over both HTTP and HTTPS when `crumbs.secure` is `undefined`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';secure')
				).to.be.false;
			});

			it('that will expire after the number of milliseconds specified by `crumbs.age`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', age : 3600000
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';max-age=3600')
				).to.be.true;

				// Assert.
				chai.expect(
					spy.calledWithMatch(';expires=Thu, 04 Dec 1980 01:00:00 GMT')
				).to.be.true;
			});

			it('that will expire at 23:59:59 on 31 Dec 9999 when `crumbs.age` is `Infinity`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', age : Infinity
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';max-age=253057564799')
				).to.be.true;

				// Assert.
				chai.expect(
					spy.calledWithMatch(';expires=Fri, 31 Dec 9999 23:59:59 GMT')
				).to.be.true;
			});

			it('that will expire at the date specified by `crumbs.expires` as a date object', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', expires : new Date('Thu, 04 Dec 1980 02:00:00 GMT')
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';max-age=7200')
				).to.be.true;

				// Assert.
				chai.expect(
					spy.calledWithMatch(';expires=Thu, 04 Dec 1980 02:00:00 GMT')
				).to.be.true;
			});

			it('that will expire at the date specified by `crumbs.expires` as a date string', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', expires : 'Thu, 04 Dec 1980 03:00:00 GMT'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';max-age=10800')
				).to.be.true;

				// Assert.
				chai.expect(
					spy.calledWithMatch(';expires=Thu, 04 Dec 1980 03:00:00 GMT')
				).to.be.true;
			});

			it('that will expire at the date specified by `crumbs.expires` as a timestamp', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', expires : 344750400000
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';max-age=14400')
				).to.be.true;

				// Assert.
				chai.expect(
					spy.calledWithMatch(';expires=Thu, 04 Dec 1980 04:00:00 GMT')
				).to.be.true;
			});

			it('that will expire at 23:59:59 on 31 Dec 9999 when `crumbs.expires` is `Infinity`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', expires : Infinity
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';max-age=253057564799')
				).to.be.true;

				// Assert.
				chai.expect(
					spy.calledWithMatch(';expires=Fri, 31 Dec 9999 23:59:59 GMT')
				).to.be.true;
			});

			it('that will expire at the end of the client session when both `crumbs.age` and `crumbs.expires` is `undefined`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';max-age=')
				).to.be.false;

				// Assert.
				chai.expect(
					spy.calledWithMatch(';expires=')
				).to.be.false;
			});

			it('by ignoring `crumbs.expires` when `crumbs.age` is specified', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', age : 3600000, expires : new Date('Thu, 04 Dec 1980 05:00:00 GMT')
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';max-age=3600')
				).to.be.true;

				// Assert.
				chai.expect(
					spy.calledWithMatch(';expires=Thu, 04 Dec 1980 01:00:00 GMT')
				).to.be.true;
			});

			it('that is only available in first party contexts when `crumbs.firstPartyOnly` equates to `true`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', firstPartyOnly : true
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';first-party-only')
				).to.be.true;
			});

			it('that is available in all contexts when `crumbs.firstPartyOnly` equates to `false`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value', firstPartyOnly : false
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';first-party-only')
				).to.be.false;
			});

			it('that is available in all contexts when `crumbs.firstPartyOnly` is `undefined`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.setCookie(
				{
					name : 'name', value : 'value'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';first-party-only')
				).to.be.false;
			});
		});

		it('shall throw a type error when `crumbs.name` is `undefined` or `null`', function ()
		{
			// Act & Assert.
			chai.expect(function ()
			{
				Crumble.setCookie(
				{
				});

			}).to.throw(TypeError);

			// Act & Assert.
			chai.expect(function ()
			{
				Crumble.setCookie(
				{
					name : null
				});

			}).to.throw(TypeError);
		});

		it('shall throw a type error when `crumbs.age` is not a number', function ()
		{
			// Act & Assert.
			chai.expect(function ()
			{
				Crumble.setCookie(
				{
					name : 'name', value : 'value', age : 'not a number'
				});

			}).to.throw(TypeError);
		});

		it('shall throw a type error when `crumbs.expires` does not represent a valid date', function ()
		{
			// Act & Assert.
			chai.expect(function ()
			{
				Crumble.setCookie(
				{
					name : 'name', value : 'value', expires : new Date('An invalid date string')
				});

			}).to.throw(TypeError);

			// Act & Assert.
			chai.expect(function ()
			{
				Crumble.setCookie(
				{
					name : 'name', value : 'value', expires : 'An invalid date string'
				});

			}).to.throw(TypeError);
		});
	});

	// -------------------------------------------------------

	describe('.removeCookie(crumbs)', function ()
	{
		context('shall remove a cookie', function ()
		{
			it('with the name specified by `crumbs.name` by forcing it to immediately expire', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.removeCookie(
				{
					name : 'name'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';max-age=-3600')
				).to.be.true;

				// Assert.
				chai.expect(
					spy.calledWithMatch(';expires=Wed, 03 Dec 1980 23:00:00 GMT')
				).to.be.true;
			});

			it('from the path specified by `crumbs.path`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.removeCookie(
				{
					name : 'name', path : '/a/document/path'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';path=/a/document/path')
				).to.be.true;
			});

			it('from the path of the document when `crumbs.path` is `undefined`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.removeCookie(
				{
					name : 'name'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';path=')
				).to.be.false;
			});

			it('from the the domain specified by `crumbs.domain`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.removeCookie(
				{
					name : 'name', domain : 'crumble.co.uk'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';domain=crumble.co.uk')
				).to.be.true;
			});

			it('from the domain of the document when `crumbs.domain` is `undefined`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.removeCookie(
				{
					name : 'name'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';domain=')
				).to.be.false;
			});

			it('from the root domain of the document when `crumbs.domain` is `.`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.removeCookie(
				{
					name : 'name', value : 'value', domain : '.'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';domain=crumble.co.uk')
				).to.be.true;
			});

			it('by ignoring `crumbs.domain` when it matches the domain of the document', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.removeCookie(
				{
					name : 'name', value : 'value', domain : 'test.crumble.co.uk'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';domain=')
				).to.be.false;
			});

			it('only over HTTPS when `crumbs.secure` equates to `true`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.removeCookie(
				{
					name : 'name', secure : true
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';secure')
				).to.be.true;
			});

			it('over both HTTP and HTTPS when `crumbs.secure` equates to `false`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.removeCookie(
				{
					name : 'name', secure : false
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';secure')
				).to.be.false;
			});

			it('over both HTTP and HTTPS when `crumbs.secure` is `undefined`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.removeCookie(
				{
					name : 'name'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';secure')
				).to.be.false;
			});

			it('only from the first party context when `crumbs.firstPartyOnly` equates to `true`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.removeCookie(
				{
					name : 'name', firstPartyOnly : true
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';first-party-only')
				).to.be.true;
			});

			it('from all contexts when `crumbs.firstPartyOnly` equates to `false`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.removeCookie(
				{
					name : 'name', firstPartyOnly : false
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';first-party-only')
				).to.be.false;
			});

			it('from all contexts when `crumbs.firstPartyOnly` is `undefiend`', function ()
			{
				// Spy.
				let spy = spyOnDocumentCookie(global.document);

				// Act.
				Crumble.removeCookie(
				{
					name : 'name'
				});

				// Assert.
				chai.expect(
					spy.calledWithMatch(';first-party-only')
				).to.be.false;
			});
		});

		it('shall throw a type error when `crumbs.name` is `undefined` or `null`', function ()
		{
			// Act & Assert.
			chai.expect(function ()
			{
				Crumble.removeCookie(
				{
				});

			}).to.throw(TypeError);

			// Act & Assert.
			chai.expect(function ()
			{
				Crumble.removeCookie(
				{
					name : null
				});

			}).to.throw(TypeError);
		});
	});
});
