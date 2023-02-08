module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'standard',
  ],
  root: true,
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
  },
}
