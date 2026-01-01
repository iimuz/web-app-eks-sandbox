import { baseConfig } from '../eslint.config.base.mjs';
import globals from 'globals';

export default [
  {
    ignores: ['cdk.out/'],
  },
  ...baseConfig,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: {},
    rules: {},
  },
];
