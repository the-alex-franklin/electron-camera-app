module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    // React rules
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],

    'react-hooks/exhaustive-deps': 'off',

    // typescript-specific rules
    '@typescript-eslint/no-explicit-any': "off",

    // Syntax rules
    semi: ['warn', 'always'],
    eqeqeq: ['warn', 'smart'],
    'no-extra-semi': 'warn',
    'jsx-quotes': 'warn',
    'prefer-const': ['warn', { destructuring: 'all' }],
    'comma-dangle': ['warn', 'always-multiline'],
    'padded-blocks': ['warn', 'never'],
    'space-before-blocks': ['warn', 'always'],
    'no-constant-condition': 'warn',
    'no-unreachable': 'warn',
    'no-unused-labels': 'off',
    'no-undef': 'off',
    'no-redeclare': 'off',

    // Indentation
    indent: ['warn', 2, {
      SwitchCase: 1,
      ignoredNodes: ['TemplateLiteral *'],
    }],

    // Unused variables
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',

    // Whitespace
    'no-trailing-spaces': 'warn',
    'object-curly-spacing': ['warn', 'always'],

    // Empty blocks and functions
    'no-empty': 'warn',
    'no-empty-function': ['warn', { allow: ['constructors'] }],

    // Line spacing
    'eol-last': ['warn', 'always'],
    'no-multiple-empty-lines': ['warn', {
      max: 1,
      maxEOF: 0,
      maxBOF: 0,
    }],
  },
}
