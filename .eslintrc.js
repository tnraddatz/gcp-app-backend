module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    es2021: true,
  },
  rules: {
    // This is a "generous" rule set based on community best practices.
    // You can customize rules here to be more or less strict. For example:
    // '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
  },
};