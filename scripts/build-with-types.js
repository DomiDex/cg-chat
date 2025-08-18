const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

async function buildWithTypes() {
  console.log("🏗️  Building project with type checking...\n");

  try {
    console.log("🧹 Cleaning previous builds...");
    execSync("pnpm clean", { stdio: "inherit" });

    console.log("\n📝 Generating Convex types...");
    execSync("pnpm --filter convex codegen", { stdio: "inherit" });

    console.log("\n📦 Building shared packages...");
    const sharedPackages = [
      "@cg/types",
      "@cg/utils",
      "@cg/config",
      "@cg/convex-client",
      "database",
    ];

    for (const pkg of sharedPackages) {
      console.log(`   Building ${pkg}...`);
      execSync(`pnpm --filter ${pkg} build`, { stdio: "inherit" });
    }

    console.log("\n🔍 Running type checks...");
    execSync("node scripts/type-check.js", { stdio: "inherit" });

    console.log("\n🚀 Building applications...");
    execSync("pnpm --filter web build", { stdio: "inherit" });
    execSync("pnpm --filter api build", { stdio: "inherit" });

    console.log("\n✅ Build completed successfully!");
  } catch (error) {
    console.error("\n❌ Build failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  buildWithTypes();
}

module.exports = { buildWithTypes };
