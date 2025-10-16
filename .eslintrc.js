module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'react-native', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'react/prop-types': 'off',
    'react-native/no-inline-styles': 0,
    'react-native/no-color-literals': 0,
    'react-native/sort-styles': 0,
    'react/no-unescaped-entities': 0,
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: { version: 'detect' },
  },
};
