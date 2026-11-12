/**
 * Asserts a query result exists, so tests fail clearly (and types narrow).
 * @template T
 * @param {T | null} el
 * @returns {T}
 */
export function must(el) {
	if (el == null) throw new Error('expected element not found');
	return el;
}
