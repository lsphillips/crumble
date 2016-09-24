'use strict';

// Dependencies
// --------------------------------------------------------

const sinon = require('sinon');

// --------------------------------------------------------

function getPropertyDescriptor (object, property)
{
	let descriptor = Object.getOwnPropertyDescriptor(object, property);

	if (descriptor !== undefined)
	{
		return descriptor;
	}

	let prototype = object;

	do // until we find a descriptor or we reach the end of the chain.
	{
		prototype = Object.getPrototypeOf(prototype);

		// Climb down the next kink of the prototype chain and
		// attempt to retrieve the property descriptor from that
		// kink.
		descriptor = Object.getOwnPropertyDescriptor(prototype, property);
	}
	while (prototype !== undefined && descriptor === undefined);

	return descriptor;
}

// --------------------------------------------------------

module.exports = function spyOnDocumentCookie (document)
{
  // This will not work on a browser document; at least not
	// consistently.
	//
	// This is because the `cookie` property (and others) are
	// not defined like typical properties are.
	//
	// However, as we are working with a JSDOM document, we
	// can get away with this.
  let cookiePropertyDescriptor = getPropertyDescriptor(document, 'cookie');

	if (cookiePropertyDescriptor === undefined)
	{
		throw new Error('Provided document does not have a `cookie` property.');
	}

  // Spy on the setter used for the document's `cookie`
	// property.
  let documentCookieSpy = sinon.spy(cookiePropertyDescriptor, 'set');

  // Define a new cookie property on the document object
	// itself using the definition being spied on.
  Object.defineProperty(document, 'cookie', cookiePropertyDescriptor);

  return documentCookieSpy;
};
