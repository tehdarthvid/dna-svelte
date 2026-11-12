import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
	{ ignores: ['build/', '.svelte-kit/', 'coverage/', 'test-results/', 'playwright-report/'] },
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				// Vite `define` constants, see vite.config.js
				__PKG_VERSION__: 'readonly',
				__SVELTE_VERSION__: 'readonly'
			}
		}
	}
];
