module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'standard',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'eslint-plugin-tsdoc',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:@typescript-eslint/strict',
      ],
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
  ],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'warn',
    'tsdoc/syntax': 'warn',
    'function-paren-newline': ['error', 'multiline-arguments'],
    'max-len': ['error', { code: 120 }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'dot-notation': ['error', {
      allowKeywords: true,
      allowPattern: '^[A-Z_]+$', // Allow bracket notation for UPPER_CASE environment variables
    }],
    'padding-line-between-statements': ['warn',
      { blankLine: 'always', prev: '*', next: 'export' },
    ],
  },
}
