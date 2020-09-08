module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    camelcase: 0,
    'no-unused-expressions': 0,
    'no-sequences': 0,
    'no-undef': 0,
    'no-case-declarations': 0,
    'no-unreachable': 0
  }
}
