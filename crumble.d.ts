/**
 * The crumbs that define a cookie.
 */
export interface Crumbs
{
	/**
	 * The name of the cookie.
	 */
	name : string;

	/**
	 * The value of the cookie.
	 */
	value? : string | null;

	/**
	 * The duration (in milliseconds) of which the cookie can live.
	 *
	 * When omitted and no `expires` crumb is provided, the cookie will expire at the end of the session.
	 *
	 * This takes precedence over the `expires` crumb.
	 */
	age? : number;

	/**
	 * The expiry date of the cookie.
	 *
	 * When omitted and no `age` crumb is provided, the cookie will expire at the end of the session.
	 */
	expires? : string | number | Date;

	/**
	 * The path of which the cookie will be created.
	 *
	 * Defaults to the current path.
	 */
	path? : string;

	/**
	 * The (sub)domain of which the cookie will be created.
	 *
	 * Defaults to the current domain.
	 */
	domain? : string;

	/**
	 * Indicates whether the cookie should only be passed over HTTPS connections.
	 */
	secure? : boolean;

	/**
	 * Indicates whether the cookie should only be sent in a first-party context.
	 *
	 * This is subject to client support.
	 */
	firstPartyOnly? : boolean;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/**
 * Determines whether a cookie exists in a plate of cookies like `document.cookie`.
 *
 * Example usage:
 *
 * ``` js
 * crumble.hasCookie(document.cookie, 'cookie');
 * ```
 *
 * @returns `true` if the cookie exists, otherwise `false`.
 *
 * @param plate The plate of cookies to search. Will usually be the value of `document.cookie`.
 * @param name  The name of the cookie to search the plate for.
 */
export function hasCookie(plate : string, name : string) : boolean;

/**
 * Reads the value of a cookie from a plate of cookies like `document.cookie`.
 *
 * Example usage:
 *
 * ``` js
 * crumble.getCookie(document.cookie, 'cookie');
 * ```
 *
 * @returns The decoded value of the cookie or `null` if the cookie doesn't exist.
 *
 * @param plate The plate of cookies to search. Will usually be the value of `document.cookie`.
 * @param name  The name of the cookie to read from the plate.
 */
export function getCookie(plate : string, name : string) : string | null;

/**
 * Creates a string that will set a cookie when assigned to a plate like `document.cookie`.
 *
 * Example usage:
 *
 * ``` js
 * document.cookie = crumble.setCookie(
 * {
 *    name   : "name",
 *    value  : "value",
 *    domain : "a.domain.com",
 *    path   : "/an/example/path",
 *    secure : false
 * });
 * ```
 *
 * Alternatively you can separate the value from the rest of the crumbs, like so:
 *
 * ``` js
 * document.cookie = crumble.setCookie(
 * {
 *    name   : "name",
 *    domain : "a.domain.com",
 *    path   : "/an/example/path",
 *    secure : false
 *
 * }, "value");
 * ```
 *
 * This can be useful when the cookie value is the variable and the other crumbs are fixed.
 *
 * @returns A string that will create or update a cookie.
 *
 * @param crumbs The crumbs defining the cookie to create or update.
 * @param value  The value of the cookie. This takes precedence over the `value` crumb.
 */
export function setCookie(crumbs : Crumbs, value? : string | null) : string;

/**
 * Creates a string that will remove a cookie when assigned to a plate like `document.cookie`.
 *
 * Example usage:
 *
 * ``` js
 * document.cookie = crumble.removeCookie(
 * {
 *    name   : "name",
 *    domain : "a.domain.com",
 *    path   : "/an/example/path",
 *    secure : false
 * });
 * ```
 *
 * @returns A string that will remove a cookie.
 *
 * @param crumbs The crumbs defining the cookie to remove.
 */
export function removeCookie(crumbs : Crumbs) : string;
