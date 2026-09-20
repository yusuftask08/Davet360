// Tüm apps/packages bu temel kuralları extend eder — her projede kural tekrar yazılmaz.
export const baseEslintRules = {
  'no-unused-vars': 'warn',
  'no-console': 'off',
  eqeqeq: 'error',
  'no-var': 'error',
  'prefer-const': 'warn',
};
