export interface Crumbs
{
	name            : string;
	value?          : string | null;
	age?            : number;
	expires?        : string | number | Date;
	path?           : string;
	domain?         : string;
	secure?         : boolean;
	firstPartyOnly? : boolean;
}

// --------------------------------------------------------

export function hasCookie(plate : string, name : string) : boolean;

// --------------------------------------------------------

export function getCookie(plate : string, name : string) : string | null;

// --------------------------------------------------------

export function setCookie(crumbs : Crumbs, value? : string | null) : string;

// --------------------------------------------------------

export function removeCookie(crumbs : Crumbs) : string;
