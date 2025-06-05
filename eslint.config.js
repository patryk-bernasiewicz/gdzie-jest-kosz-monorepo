// Root ESLint config: common JS/TS/Prettier rules only, no framework-specific plugins
import eslint from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierRecommended,
  {
    ignores: [
      '**/dist/',
      '**/build/',
      '**/web-build/',
      '**/coverage/',
      '**/node_modules/',
      'yarn.lock',
      'package-lock.json',
      'pnpm-lock.yaml',
      '.env',
      '.env.*',
      '*.log',
      '*.min.*',
      '*.bundle.*',
      '**/public/',
      '**/assets/',
    ],
  },
  // Add any additional common rules here
  {
    rules: {
      // Example: allow unused vars starting with _
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];
// To extend in an app, import this config and add framework-specific plugins/rules.
