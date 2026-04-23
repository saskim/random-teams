// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier');
const simpleImportSort = require('eslint-plugin-simple-import-sort');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      angular.configs.tsRecommended,
      prettier,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
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

      // ── Pre-existing debt (TODO: fix in fix/lint-errors) ────────────────
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

      // ── Type safety ──────────────────────────────────────────────────────
      // TODO(fix/lint-errors): await or void unhandled promises
      '@typescript-eslint/no-floating-promises': 'warn',
      // TODO(fix/lint-errors): fix async callbacks in void contexts
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/prefer-readonly': 'error',
      // TODO(fix/lint-errors): remove require-await violations (async fns without await)
      '@typescript-eslint/require-await': 'warn',
      // TODO(fix/lint-errors): unsafe operations downstream of any — fix no-explicit-any first
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      // TODO(fix/lint-errors): prefer ?? over || where applicable
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',

      // ── Imports ──────────────────────────────────────────────────────────
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // ── Member ordering (public before private, fields before methods) ───
      // TODO(fix/lint-errors): reorder class members to match ordering rule
      '@typescript-eslint/member-ordering': [
        'warn',
        {
          default: [
            'public-static-field',
            'protected-static-field',
            'private-static-field',
            'public-instance-field',
            'protected-instance-field',
            'private-instance-field',
            'public-constructor',
            'protected-constructor',
            'private-constructor',
            'public-instance-method',
            'protected-instance-method',
            'private-instance-method',
            'public-static-method',
            'protected-static-method',
            'private-static-method',
          ],
        },
      ],

      // ── Angular lifecycle ─────────────────────────────────────────────────
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',

      // ── General quality ──────────────────────────────────────────────────
      eqeqeq: ['error', 'always'],
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
