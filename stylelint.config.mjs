export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-recommended-vue/scss',
    'stylelint-config-recess-order'
  ],
  ignoreFiles: [
    'dist/**',
    'coverage/**',
    'node_modules/**',
    'playwright-report/**',
    'test-results/**'
  ],
  rules: {
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['use', 'forward', 'tailwind', 'apply', 'layer', 'screen']
      }
    ]
  }
}
