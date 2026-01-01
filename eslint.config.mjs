import { baseConfig } from './eslint.config.base.mjs';

export default [
  {
    ignores: ['**/node_modules/', 'awscdk/**', 'console/**'],
  },
  ...baseConfig,
];
