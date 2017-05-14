// Type definitions for Crumble
// --------------------------------------------------------

export interface Crumbs
{
	name            : string;
	value?          : string;
	age?            : number;
	expires?        : string | number | Date;
	path?           : string;
	domain?         : string;
	secure?         : boolean;
	firstPartyOnly? : boolean;
}

// --------------------------------------------------------

export function isCookiesEnabled() : boolean;

// --------------------------------------------------------

export function hasCookie(name : string) : boolean;

// --------------------------------------------------------

export function getCookie(name : string) : string;

// --------------------------------------------------------

export function setCookie(crumbs : Crumbs, cookieValue? : string) : void;

// --------------------------------------------------------

export function removeCookie(crumbs : Crumbs) : void;
