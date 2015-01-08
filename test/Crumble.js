/* jshint node : true, mocha : true, expr : true, es3 : false */

'use strict';

// Dependencies
// --------------------------------------------------------

var should = require('should');
var sinon  = require('sinon');

// --------------------------------------------------------

describe('Crumble', function ()
{
	// Test Subject
	// ----------------------------------------------------

	var Crumble = require('../src/Crumble.js');

	// ----------------------------------------------------

	beforeEach(function ()
	{
		global.document = (function ()
		{
			var cookies = '';

			return {

				get cookie ()
				{
					return cookies;
				},

				set cookie (cookie)
				{
					cookies = cookie;
				}
			};

		}) ();

		this.clock = sinon.useFakeTimers(344736000000);
	});

	afterEach(function ()
	{
		this.clock.restore();
	});

	// ----------------------------------------------------

	describe('bool Crumble.isEnabled()', function ()
	{
		it('returns `true` when the client has cookies enabled', function ()
		{
			Crumble.isEnabled().should.be.true;
		});

		it('returns `false` when the client has cookies disabled', function ()
		{
			global.document = (function ()
			{
				var cookies = '';

				return {

					get cookie ()
					{
						return '';
					},

					set cookie (cookie)
					{
						cookies = cookie;
					}
				};

			}) ();

			Crumble.isEnabled().should.be.false;
		});
	});

	// ----------------------------------------------------

	describe('string Crumble.get(string name)', function ()
	{
		it('returns the value of a cookie', function ()
		{
			global.document.cookie = 'name=value';
		 // --------------------------------------

			Crumble.get('name').should.equal('value');
		});

		it('returns the value URL decoded if required', function ()
		{
			global.document.cookie = 'name=a%20value%20that%20needs%20decoding';
		 // --------------------------------------------------------------------

			Crumble.get('name').should.equal('a value that needs decoding');
		});

		it('returns `null` when a cookie does not exist', function ()
		{
			should(
				Crumble.get('name')
			).be.null;
		});
	});

	// ----------------------------------------------------

	describe('bool Crumble.has(string name)', function ()
	{
		it('returns `true` when a cookie does exist', function ()
		{
			global.document.cookie = 'name=value';
		 // --------------------------------------

			Crumble.has('name').should.be.true;
		});

		it('returns `false` when a cookie does not exist', function ()
		{
			Crumble.has('name').should.be.false;
		});
	});

	// ----------------------------------------------------

	describe('void Crumble.set(Object crumbs)', function ()
	{
		it('a cookie with a `name` crumb, will be set with that name', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value'
			});

			global.document.cookie.should.equal('name=value;path=/');
		});

		it('a cookie without a `name` crumb, will throw an error', function ()
		{
			(function ()
			{
				Crumble.set(
				{
				});

			}).should.throw();
		});

		it('a cookie with a `name` crumb set to `null`, will throw an error', function ()
		{
			(function ()
			{
				Crumble.set(
				{
					name : null
				});

			}).should.throw();
		});

		it('a cookie with a `value` crumb, will be set with that value', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value'
			});

			global.document.cookie.should.equal('name=value;path=/');
		});

		it('a cookie with a `value` crumb that needs encoding, will be set with that value URL encoded', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'a value that needs encoding'
			});

			global.document.cookie.should.equal('name=a%20value%20that%20needs%20encoding;path=/');
		});

		it('a cookie without a `value` crumb, will be removed by forcing it to immediately expire', function ()
		{
			Crumble.set(
			{
				name : 'name'
			});

			global.document.cookie.should.equal('name=;path=/;max-age=-60000;expires=Wed, 03 Dec 1980 23:59:00 GMT');
		});

		it('a cookie with a `value` crumb set to `null`, will be removed by forcing it to immediately expire', function ()
		{
			Crumble.set(
			{
				name : 'name', value : null
			});

			global.document.cookie.should.equal('name=;path=/;max-age=-60000;expires=Wed, 03 Dec 1980 23:59:00 GMT');
		});

		it('a cookie with a `path` crumb, will be set to be available only on that path', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value', path : '/a/document/path'
			});

			global.document.cookie.should.equal('name=value;path=/a/document/path');
		});

		it('a cookie without a `path` crumb, will be set to be available on all paths', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value'
			});

			global.document.cookie.should.equal('name=value;path=/');
		});

		it('a cookie with a `domain` crumb, will be set to be available only on that domain', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value', domain : 'sub.domain.com'
			});

			global.document.cookie.should.equal('name=value;path=/;domain=sub.domain.com');
		});

		it('a cookie without a `domain` crumb, will be set to be available only on the domain of the current document', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value'
			});

			global.document.cookie.should.equal('name=value;path=/');
		});

		it('a cookie with a `domain` crumb set to `.`, will be set to be available on the root domain of the current document', function ()
		{
			global.document = (function ()
			{
				var cookies = '';

				return {

					get cookie ()
					{
						return cookies;
					},

					set cookie (cookie)
					{
						if (cookie.indexOf('domain.com') > -1)
						{
							cookies = cookie;
						}
					},

					domain : 'a.sub.domain.com'
				};

			}) ();

			Crumble.set(
			{
				name : 'name', value : 'value', domain : '.'
			});

			global.document.cookie.should.equal('name=value;path=/;domain=domain.com');
		});

		it('a cookie with a `secure` crumb equating to `true`, will be set to be available only over HTTPS', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value', secure : true
			});

			global.document.cookie.should.equal('name=value;path=/;secure');
		});

		it('a cookie without a `secure` crumb, will be set to be available over both HTTP and HTTPS', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value'
			});

			global.document.cookie.should.equal('name=value;path=/');
		});

		it('a cookie with an `age` crumb, will be set to expire after the number of minutes specified', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value', age : 60
			});

			global.document.cookie.should.equal('name=value;path=/;max-age=3600000;expires=Thu, 04 Dec 1980 01:00:00 GMT');
		});

		it('a cookie with an `age` crumb equivalent to `Infinity`, will be set to expire at 23:59:59 on 31 Dec 9999', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value', age : Infinity
			});

			global.document.cookie.should.equal('name=value;path=/;max-age=253057564799000;expires=Fri, 31 Dec 9999 23:59:59 GMT');
		});

		it('a cookie with an `age` crumb set to an invalid number of minutes, will throw an error', function ()
		{
			(function ()
			{
				Crumble.set(
				{
					name : 'name', value : 'value', age : NaN
				});

			}).should.throw();
		});

		it('a cookie with an `expires` crumb set with a `Date` object, will be set to expire at that date', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value', expires : new Date('Thu, 04 Dec 1980 01:00:00 GMT')
			});

			global.document.cookie.should.equal('name=value;path=/;max-age=3600000;expires=Thu, 04 Dec 1980 01:00:00 GMT');
		});

		it('a cookie with an `expires` crumb set with a date string, will be set to expire at that date', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value', expires : 'Thu, 04 Dec 1980 01:00:00 GMT'
			});

			global.document.cookie.should.equal('name=value;path=/;max-age=3600000;expires=Thu, 04 Dec 1980 01:00:00 GMT');
		});

		it('a cookie with an `expires` crumb set with a timestamp, will be set to expire at that date', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value', expires : 344739600000
			});

			global.document.cookie.should.equal('name=value;path=/;max-age=3600000;expires=Thu, 04 Dec 1980 01:00:00 GMT');
		});

		it('a cookie with an `expires` crumb set with a timestamp equivalent to `Infinity`, will be set to expire at 23:59:59 on 31 Dec 9999', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value', expires : Infinity
			});

			global.document.cookie.should.equal('name=value;path=/;max-age=253057564799000;expires=Fri, 31 Dec 9999 23:59:59 GMT');
		});

		it('a cookie with an `expires` crumb set with an invalid `Date` object, will throw an error', function ()
		{
			(function ()
			{
				Crumble.set(
				{
					name : 'name', value : 'value', expires : new Date('An invalid date string')
				});

			}).should.throw();
		});

		it('a cookie with an `expires` crumb set with an invalid date string, will throw an error', function ()
		{
			(function ()
			{
				Crumble.set(
				{
					name : 'name', value : 'value', expires : 'An invalid date string'
				});

			}).should.throw();
		});

		it('a cookie with an `expires` crumb set with an invalid timestamp, will throw an error', function ()
		{
			(function ()
			{
				Crumble.set(
				{
					name : 'name', value : 'value', expires : NaN
				});

			}).should.throw();
		});

		it('a cookie with neither an `age` or `expires` crumb, will be set to expire at the end of the client session', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value'
			});

			global.document.cookie.should.equal('name=value;path=/');
		});

		it('a cookie set with both `age` and `expires` crumbs, will be set to expire using the `age` crumb, ignoring the `expires` crumb', function ()
		{
			Crumble.set(
			{
				name : 'name', value : 'value', age : 60, expires : new Date('Thu, 04 Dec 1980 01:00:00 GMT')
			});

			global.document.cookie.should.equal('name=value;path=/;max-age=3600000;expires=Thu, 04 Dec 1980 01:00:00 GMT');
		});
	});
	
	// ----------------------------------------------------
	
	describe('void Crumble.remove(Object crumbs)', function ()
	{
		it('a cookie with a `name` crumb, will be removed by forcing it to immediately expire', function ()
		{
			Crumble.remove(
			{
				name : 'name'
			});

			global.document.cookie.should.equal('name=;path=/;max-age=-60000;expires=Wed, 03 Dec 1980 23:59:00 GMT');
		});

		it('a cookie without a `name` crumb, will throw an error', function ()
		{
			(function ()
			{
				Crumble.remove(
				{
				});

			}).should.throw();
		});

		it('a cookie with a `name` crumb set to `null`, will throw an error', function ()
		{
			(function ()
			{
				Crumble.remove(
				{
					name : null
				});

			}).should.throw();
		});

		it('a cookie with a `path` crumb, will be removed from that path only', function ()
		{
			Crumble.remove(
			{
				name : 'name', path : '/a/document/path'
			});

			global.document.cookie.should.equal('name=;path=/a/document/path;max-age=-60000;expires=Wed, 03 Dec 1980 23:59:00 GMT');
		});

		it('a cookie without a `path` crumb, will be removed from all paths', function ()
		{
			Crumble.remove(
			{
				name : 'name'
			});

			global.document.cookie.should.equal('name=;path=/;max-age=-60000;expires=Wed, 03 Dec 1980 23:59:00 GMT');
		});

		it('a cookie with a `domain` crumb, will be removed from that domain only', function ()
		{
			Crumble.remove(
			{
				name : 'name', domain : 'domain.com'
			});

			global.document.cookie.should.equal('name=;path=/;domain=domain.com;max-age=-60000;expires=Wed, 03 Dec 1980 23:59:00 GMT');
		});

		it('a cookie without a `domain` crumb, will be removed from the domain of the current domain only', function ()
		{
			Crumble.remove(
			{
				name : 'name'
			});

			global.document.cookie.should.equal('name=;path=/;max-age=-60000;expires=Wed, 03 Dec 1980 23:59:00 GMT');
		});

		it('a cookie with a `domain` crumb set to `.`, will be removed from the root domain of the current document', function ()
		{
			global.document = (function ()
			{
				var cookies = '';

				return {

					get cookie ()
					{
						return cookies;
					},

					set cookie (cookie)
					{
						if (cookie.indexOf('domain.com') > -1)
						{
							cookies = cookie;
						}
					},

					domain : 'a.sub.domain.com'
				};

			}) ();

			Crumble.remove(
			{
				name : 'name', value : 'value', domain : '.'
			});

			global.document.cookie.should.equal('name=;path=/;domain=domain.com;max-age=-60000;expires=Wed, 03 Dec 1980 23:59:00 GMT');
		});

		it('a cookie with a `secure` crumb, will be removed only over HTTPS', function ()
		{
			Crumble.remove(
			{
				name : 'name', secure : true
			});

			global.document.cookie.should.equal('name=;path=/;max-age=-60000;expires=Wed, 03 Dec 1980 23:59:00 GMT;secure');
		});

		it('a cookie without a `secure` crumb, will be removed over both HTTP and HTTPS', function ()
		{
			Crumble.remove(
			{
				name : 'name'
			});

			global.document.cookie.should.equal('name=;path=/;max-age=-60000;expires=Wed, 03 Dec 1980 23:59:00 GMT');
		});
	});

	// ----------------------------------------------------
	
	describe('Object Crumble.noConflict()', function ()
	{
		it('returns the Crumble object', function ()
		{
			var crumble = Crumble;
		 // ----------------------

			Crumble.noConflict().should.equal(crumble);

			// Restore.
			Crumble = crumble;
		});

		it('removes the Crumble object from the current context and restores what was there before', function ()
		{
			Crumble.noConflict();
		 // ---------------------

			should(Crumble).be.undefined;
		});
	});
});