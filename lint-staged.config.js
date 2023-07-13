module.exports = {
  '**/*.{js,ts,tsx}': ['eslint', () => 'tsc --noEmit'],
  '**/*.{js,md,ts,tsx}': 'prettier --list-different',
};
