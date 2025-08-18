const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const packages = [
  'apps/web',
  'apps/api',
  'packages/convex',
  'packages/@cg/convex-client',
  'packages/@cg/types',
  'packages/@cg/utils',
  'packages/@cg/config',
  'packages/database',
];

function typeCheck() {
  console.log('🔍 Running type checks across all packages...\n');

  let hasErrors = false;
  const results = [];

  const rootDir = process.cwd();
  const tscPath = path.join(rootDir, 'node_modules', '.bin', 'tsc');

  for (const pkg of packages) {
    const pkgPath = path.join(rootDir, pkg);

    if (!fs.existsSync(pkgPath)) {
      console.log(`⏩ Skipping ${pkg} (not found)`);
      continue;
    }

    console.log(`📦 Checking ${pkg}...`);

    try {
      execSync(`${tscPath} --noEmit`, {
        cwd: pkgPath,
        stdio: 'pipe',
      });
      results.push({ package: pkg, status: '✅ Pass' });
      console.log(`   ✅ No type errors\n`);
    } catch (error) {
      hasErrors = true;
      results.push({ package: pkg, status: '❌ Fail' });
      console.error(`   ❌ Type errors found:\n`);
      console.error(error.stdout?.toString() || error.message);
      console.error('\n');
    }
  }

  console.log('\n📊 Type Check Summary:');
  console.log('─'.repeat(40));
  results.forEach((r) => {
    console.log(`${r.status} ${r.package}`);
  });

  if (hasErrors) {
    console.error('\n❌ Type checking failed. Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All type checks passed!');
  }
}

if (require.main === module) {
  typeCheck();
}

module.exports = { typeCheck };
