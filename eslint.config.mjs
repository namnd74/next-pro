import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  eslintConfigPrettier,
  {
    rules: {
      'prefer-const': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      // The app intentionally gates client-only state until hydration in several components.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  globalIgnores([
    'node_modules/**',
    '.next/**',
    '.agents/**',
    '.husky/**',
    'out/**',
    'build/**',
    'dist/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
