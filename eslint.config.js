// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
      prettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      // TODO(fix/lint-errors): migrate constructor injection to inject()
      '@angular-eslint/prefer-inject': 'warn',
      // TODO(fix/lint-errors): replace empty constructors
      '@typescript-eslint/no-empty-function': 'warn',
      // TODO(fix/lint-errors): replace type aliases with interfaces
      '@typescript-eslint/consistent-type-definitions': 'warn',
      // TODO(fix/lint-errors): remove unused variables
      '@typescript-eslint/no-unused-vars': 'warn',
      // TODO(fix/lint-errors): remove no-explicit-any
      '@typescript-eslint/no-explicit-any': 'warn',
      // TODO(fix/lint-errors): fix useless assignments
      'no-useless-assignment': 'warn',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      // TODO(fix/lint-errors): add keyboard event handlers and focus support
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
    },
  },
]);
