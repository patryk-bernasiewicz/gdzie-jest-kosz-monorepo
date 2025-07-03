/**
 * @typedef {import('eslint').Linter.FlatConfig} FlatConfig
 * @typedef {import('@typescript-eslint/utils').TSESLint.Linter.Config} TSConfig
 */
import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';

/** @type {Array<FlatConfig>} */
export default [
  eslint.configs.recommended,
  /** @type {FlatConfig} */
  {
    ignores: [
      'eslint.config.js',
      'node_modules/',
      '.expo/',
      '.expo-shared/',
      'web-build/',
      'dist/',
      'build/',
      'coverage/',
      '.turbo/',
      'babel.config.js',
      'metro.config.js',
      'jest.config.js',
      'expo-env.d.ts',
      'scripts/reset-project.js',
      'jest.setup.js',
      '*.log',
      '*.min.*',
      '*.bundle.*',
    ],
  },
  /** @type {FlatConfig} */
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint,
      react: reactPlugin,
      'react-native': reactNativePlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
      /** @type {Record<string, 'writable' | 'readonly' | 'off'>} */
      globals: {
        // React Native globals
        __DEV__: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        Promise: 'readonly',
        global: 'readonly',
        process: 'readonly',
        alert: 'readonly',

        // Expo globals
        expo: 'readonly',
        ExpoModulesCore: 'readonly',

        // Metro bundler globals
        __METRO_GLOBAL_PREFIX__: 'readonly',

        // React Native testing globals
        device: 'readonly',
        element: 'readonly',
        by: 'readonly',
        waitFor: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'react-native/style-sheet-object-names': ['StyleSheet', 'styles'],
    },
    rules: {
      // ESLint core rules
      'no-console': 'off', // Console is commonly used in mobile development
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-duplicate-imports': 'error',

      // React rules
      'react/jsx-uses-react': 'off', // Not needed with new JSX transform
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'react/display-name': 'off',
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-uses-vars': 'error',
      'react/no-deprecated': 'warn',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unknown-property': 'error',
      'react/require-render-return': 'error',

      // React hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Native specific rules
      'react-native/no-unused-styles': 'warn',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/no-raw-text': 'off', // Can be restrictive in some cases
      'react-native/no-single-element-style-arrays': 'warn',
      'react-native/split-platform-components': 'warn',

      // TypeScript rules
      'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',

      // Prettier rules
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          singleQuote: true,
          trailingComma: 'all',
          tabWidth: 2,
          semi: true,
          printWidth: 80,
        },
      ],
    },
  },
  /** @type {FlatConfig} */
  {
    files: [
      '**/__tests__/**/*',
      '**/*.spec.{js,jsx,ts,tsx}',
      '**/*.test.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      /** @type {Record<string, 'writable' | 'readonly' | 'off'>} */
      globals: {
        jest: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        test: 'readonly',
        // Node.js test globals
        require: 'readonly',
        module: 'readonly',
        // TypeScript globals
        JSX: 'readonly',
        // React Native Testing Library
        render: 'readonly',
        screen: 'readonly',
        fireEvent: 'readonly',
        waitFor: 'readonly',
        // Detox globals
        device: 'readonly',
        element: 'readonly',
        by: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
      'react-native/no-inline-styles': 'off', // Often needed in tests
    },
  },
];
