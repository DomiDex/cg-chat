module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],

  '*.json': ['prettier --write'],

  '*.md': ['prettier --write'],

  '*.{css,scss,sass}': ['prettier --write'],

  '*.{yml,yaml}': ['prettier --write'],

  'packages/convex/schema.ts': [() => 'pnpm --filter convex codegen'],

  'package.json': [() => 'pnpm install --frozen-lockfile --dry-run'],
};
