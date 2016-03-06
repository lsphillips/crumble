/* jshint mocha : true */

'use strict';

// Dependencies
// --------------------------------------------------------

var sinon      = require('sinon');
var chai       = require('chai');
var chaiString = require('chai-string');
var cookie     = require('cookie');

// Chai Plugins
// --------------------------------------------------------

chai.use(chaiString);

// Helpers
// --------------------------------------------------------

function makeDocumentWithCookieInterface (disabled)
{
	var cookies = '';

	return {

		get cookie ()
		{
			return (disabled) ? '' : cookies;
		},

		set cookie (crumbs)
		{
			var attributes = cookie.parse(crumbs);

			// Browsers don't write cookies on the TLD (top level
			// domain).
			cookies = (attributes.domain === 'com') ? '' : crumbs;
		},

		domain : 'local.test.com'
	};
}

// --------------------------------------------------------

describe('class Crumble', function ()
{
	var Crumble = require('../src/Crumble.js');

	// -------------------------------------------------------

	beforeEach(function ()
	{
		this.clock = sinon.useFakeTimers(344736000000);
	});

	// -------------------------------------------------------

	afterEach(function ()
	{
		this.clock.restore();
	});

	// -------------------------------------------------------

	describe('constructor(document)', function ()
	{
		it('shall throw a type error when `document` is `undefined`', function ()
		{
			chai.expect(function ()
			{
				new Crumble();

			}).to.throw(TypeError);
		});

		it('shall throw a type error when `document` does not have a `cookie` property', function ()
		{
			chai.expect(function ()
			{
				new Crumble(
				{
				});

			}).to.throw(TypeError);
		});

		it('shall throw a type error when `document` does not have a `domain` property', function ()
		{
			chai.expect(function ()
			{
				new Crumble(
				{
					cookie : ''
				});

			}).to.throw(TypeError);
		});
	});

	// -------------------------------------------------------

	describe('isEnabled()', function ()
	{
		it('returns `true` when the client has cookies enabled', function ()
		{
			// Act & Assert.
			chai.expect(
				new Crumble(
					makeDocumentWithCookieInterface()
				).isEnabled()
			).to.be.true;
		});

		it('returns `false` when the client has cookies disabled', function ()
		{
			// Act & Assert.
			chai.expect(
				new Crumble(
					makeDocumentWithCookieInterface(true)
				).isEnabled()
			).to.be.false;
		});
	});

	// -------------------------------------------------------

	describe('get(name)', function ()
	{
		beforeEach(function ()
		{
			this.crumble = new Crumble(
				this.document = makeDocumentWithCookieInterface()
			);
		});

		it('returns the value of a cookie', function ()
		{
			// Setup.
			this.document.cookie = 'name=value';

			// Act & Assert.
			chai.expect(
				this.crumble.get('name')
			).to.equal('value');
		});

		it('returns the value of a cookie URL decoded when required', function ()
		{
			// Setup.
			this.document.cookie = 'name=a%20value%20that%20needs%20decoding';

			// Act & Assert.
			chai.expect(
				this.crumble.get('name')
			).to.equal('a value that needs decoding');
		});

		it('returns `null` when a cookie does not exist', function ()
		{
			// Act & Assert.
			chai.expect(
				this.crumble.get('name')
			).to.be.null;
		});
	});

	// -------------------------------------------------------

	describe('has(name)', function ()
	{
		beforeEach(function ()
		{
			this.crumble = new Crumble(
				this.document = makeDocumentWithCookieInterface()
			);
		});

		it('returns `true` when a cookie exists', function ()
		{
			// Setup.
			this.document.cookie = 'name=value';

			// Act & Assert.
			chai.expect(
				this.crumble.has('name')
			).to.be.true;
		});

		it('returns `false` when a cookie does not exist', function ()
		{
			// Act & Assert.
			chai.expect(
				this.crumble.has('name')
			).to.be.false;
		});
	});

	// -------------------------------------------------------

	describe('set(crumbs, value)', function ()
	{
		beforeEach(function ()
		{
			this.crumble = new Crumble(
				this.document = makeDocumentWithCookieInterface()
			);
		});

		context('shall create a cookie', function ()
		{
			it('with the name specified by `crumbs.name`', function ()
			{
				// Act
				this.crumble.set(
				{
					name : 'name', value : 'value'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.startWith('name=');
			});

			it('with the value specified by `value`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name'

				}, 'value');

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain('name=value');
			});

			it('with the value specified by `crumbs.value` when `value` is `undefined`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain('name=value');
			});

			it('with the value URL encoded when required', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'a value that needs encoding'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain('name=a%20value%20that%20needs%20encoding');

				// Act.
				this.crumble.set(
				{
					name : 'name'

				}, 'another value that needs encoding');

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain('name=another%20value%20that%20needs%20encoding');
			});

			it('with no value when `value` or `crumbs.value` is `null`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name'

				}, null);

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain('name=');

				// Act.
				new Crumble(this.document).set(
				{
					name : 'name', value : null
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain('name=');
			});

			it('that is only available on the path specified by `crumbs.path`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', path : '/a/document/path'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';path=/a/document/path');
			});

			it('that is only available on the path of the target document when `crumbs.path` is `undefined', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';path=');
			});

			it('that is only available on the domain specified by `crumbs.domain`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', domain : 'sub.domain.com'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';domain=sub.domain.com');
			});

			it('that is only available on the domain of the target document when `crumbs.domain` is `undefined`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';domain=');
			});

			it('that is only available on the root domain of the target document when `crumbs.domain` is `.`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', domain : '.'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';domain=test.com');
			});

			it('by ignoring `crumbs.domain` when it matches the domain of the target document', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', domain : 'local.test.com'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';domain=');
			});

			it('that is only available over HTTPS when `crumbs.secure` equates to `true`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', secure : true
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';secure');
			});

			it('that is available over both HTTP and HTTPS when `crumbs.secure` equates to `false`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', secure : false
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';secure');
			});

			it('that is available over both HTTP and HTTPS when `crumbs.secure` is `undefined`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';secure');
			});


			it('that will expire after the number of milliseconds specified by `crumbs.age`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', age : 3600000
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';max-age=3600');

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';expires=Thu, 04 Dec 1980 01:00:00 GMT');
			});

			it('that will expire at 23:59:59 on 31 Dec 9999 when `crumbs.age` is `Infinity`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', age : Infinity
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).contain(';max-age=253057564799');

				// Assert.
				chai.expect(
					this.document.cookie
				).contain(';expires=Fri, 31 Dec 9999 23:59:59 GMT');
			});

			it('that will expire at the date specified by `crumbs.expires` as a date object', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', expires : new Date('Thu, 04 Dec 1980 02:00:00 GMT')
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';max-age=7200');

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';expires=Thu, 04 Dec 1980 02:00:00 GMT');
			});

			it('that will expire at the date specified by `crumbs.expires` as a date string', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', expires : 'Thu, 04 Dec 1980 03:00:00 GMT'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';max-age=10800');

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';expires=Thu, 04 Dec 1980 03:00:00 GMT');
			});

			it('that will expire at the date specified by `crumbs.expires` as a timestamp', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', expires : 344750400000
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';max-age=14400');

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';expires=Thu, 04 Dec 1980 04:00:00 GMT');
			});

			it('that will expire at 23:59:59 on 31 Dec 9999 when `crumbs.expires` is `Infinity`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', expires : Infinity
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';max-age=253057564799');

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';expires=Fri, 31 Dec 9999 23:59:59 GMT');
			});

			it('that will expire at the end of the client session when both `crumbs.age` and `crumbs.expires` is `undefined`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';max-age=');

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';expires=');
			});

			it('by ignoring `crumbs.expires` when `crumbs.age` is specified', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', age : 3600000, expires : new Date('Thu, 04 Dec 1980 05:00:00 GMT')
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';max-age=3600');

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';expires=Thu, 04 Dec 1980 01:00:00 GMT');
			});

			it('that is only available in first party contexts when `crumbs.firstPartyOnly` equates to `true`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', firstPartyOnly : true
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';first-party-only');
			});

			it('that is available in all contexts when `crumbs.firstPartyOnly` equates to `false`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value', firstPartyOnly : false
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';first-party-only');
			});

			it('that is available in all contexts when `crumbs.firstPartyOnly` is `undefined`', function ()
			{
				// Act.
				this.crumble.set(
				{
					name : 'name', value : 'value'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';first-party-only');
			});
		});

		it('shall remove a cookie, by forcing it to immediately expire, when both `value` and `crumbs.value` are `undefined`', function ()
		{
			// Act.
			this.crumble.set(
			{
				name : 'name'
			});

			// Assert.
			chai.expect(
				this.document.cookie
			).to.contain(';max-age=-3600');

			// Assert.
			chai.expect(
				this.document.cookie
			).to.contain(';expires=Wed, 03 Dec 1980 23:00:00 GMT');
		});

		it('shall throw a type error when `crumbs.name` is `undefined` or `null`', function ()
		{
			var crumble = this.crumble;

			// Act & Assert.
			chai.expect(function ()
			{
				crumble.set(this.crumble,
				{
				});

			}).to.throw(TypeError);

			// Act & Assert.
			chai.expect(function ()
			{
				crumble.set(this.crumble,
				{
					name : undefined
				});

			}).to.throw(TypeError);
		});

		it('shall throw a type error when `crumbs.age` is not a number', function ()
		{
			var crumble = this.crumble;

			// Act & Assert.
			chai.expect(function ()
			{
				crumble.set(
				{
					name : 'name', value : 'value', age : 'not a number'
				});

			}).to.throw(TypeError);
		});

		it('shall throw a type error when `crumbs.expires` does not represent a valid date', function ()
		{
			var crumble = this.crumble;

			// Act & Assert.
			chai.expect(function ()
			{
				crumble.set(
				{
					name : 'name', value : 'value', expires : new Date('An invalid date string')
				});

			}).to.throw(TypeError);

			// Act & Assert.
			chai.expect(function ()
			{
				crumble.set(
				{
					name : 'name', value : 'value', expires : 'An invalid date string'
				});

			}).to.throw(TypeError);
		});
	});

	// -------------------------------------------------------

	describe('remove(crumbs)', function ()
	{
		beforeEach(function ()
		{
			this.crumble = new Crumble(
				this.document = makeDocumentWithCookieInterface()
			);
		});

		context('shall remove a cookie', function ()
		{
			it('with the name specified by `crumbs.name` by forcing it to immediately expire', function ()
			{
				// Act.
				this.crumble.remove(
				{
					name : 'name'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';max-age=-3600');

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';expires=Wed, 03 Dec 1980 23:00:00 GMT');
			});

			it('from the path specified by `crumbs.path`', function ()
			{
				// Act.
				this.crumble.remove(
				{
					name : 'name', path : '/a/document/path'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';path=/a/document/path');
			});

			it('from the path of the target document when `crumbs.path` is `undefined`', function ()
			{
				// Act.
				this.crumble.remove(
				{
					name : 'name'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';path=');
			});

			it('from the the domain specified by `crumbs.domain`', function ()
			{
				// Act.
				this.crumble.remove(
				{
					name : 'name', domain : 'domain.com'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';domain=domain.com');
			});

			it('from the domain of the target document when `crumbs.domain` is `undefined`', function ()
			{
				// Act.
				this.crumble.remove(
				{
					name : 'name'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';domain=');
			});

			it('from the root domain of the target document when `crumbs.domain` is `.`', function ()
			{
				// Act.
				this.crumble.remove(
				{
					name : 'name', value : 'value', domain : '.'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';domain=test.com');
			});

			it('only over HTTPS when `crumbs.secure` equates to `true`', function ()
			{
				// Act.
				this.crumble.remove(
				{
					name : 'name', secure : true
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';secure');
			});

			it('over both HTTP and HTTPS when `crumbs.secure` equates to `false`', function ()
			{
				// Act.
				this.crumble.remove(
				{
					name : 'name', secure : false
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';secure');
			});

			it('over both HTTP and HTTPS when `crumbs.secure` is `undefined`', function ()
			{
				// Act.
				this.crumble.remove(
				{
					name : 'name'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';secure');
			});

			it('only from the first party context when `crumbs.firstPartyOnly` equates to `true`', function ()
			{
				// Act.
				this.crumble.remove(
				{
					name : 'name', firstPartyOnly : true
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.contain(';first-party-only');
			});

			it('from all contexts when `crumbs.firstPartyOnly` equates to `false`', function ()
			{
				// Act.
				this.crumble.remove(
				{
					name : 'name', firstPartyOnly : false
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';first-party-only');
			});

			it('from all contexts when `crumbs.firstPartyOnly` is `undefiend`', function ()
			{
				// Act.
				this.crumble.remove(
				{
					name : 'name'
				});

				// Assert.
				chai.expect(
					this.document.cookie
				).to.not.contain(';first-party-only');
			});
		});

		it('shall throw a type error when `crumbs.name` is `undefined` or `null`', function ()
		{
			var crumble = this.crumble;

			// Act & Assert.
			chai.expect(function ()
			{
				crumble.remove(
				{
				});

			}).to.throw(TypeError);

			// Act & Assert.
			chai.expect(function ()
			{
				crumble.remove(
				{
					name : null
				});

			}).to.throw(TypeError);
		});
	});
});
