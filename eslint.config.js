import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  { ignores: ['node_modules/', 'dist/', 'icons/', 'docs/'] },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
        chrome: 'readonly',
        crypto: 'readonly',
        globalThis: 'readonly',
        CS: 'readonly',
        NodeFilter: 'readonly',
      },
    },
  },
  pluginJs.configs.recommended,
  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'off',
      'no-constant-binary-expression': 'off',
      'no-irregular-whitespace': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      eqeqeq: ['warn', 'always', { null: 'ignore' }],
      curly: ['warn', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
    },
  },
];
