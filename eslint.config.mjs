import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
  globalIgnores(['dist/**', 'node_modules/**']),
  {
    linterOptions: {
      noInlineConfig: true,
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      unicorn,
    },
    extends: ['unicorn/recommended'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
    },
  },
  prettier,
);
