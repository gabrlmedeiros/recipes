module.exports = {
  root: true,
  extends: ['expo', 'eslint:recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: ['./tsconfig.json'],
        alwaysTryTypescript: true,
      },
    },
  },
  overrides: [
    {
      files: ['**/__tests__/**', '**/*.test.{js,jsx,ts,tsx}'],
      env: {
        jest: true,
      },
      rules: {
        'no-undef': 'off',
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
};
