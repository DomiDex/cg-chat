const fs = require("fs");
const path = require("path");

const requiredEnvVars = [
  "NODE_ENV",
  "CONVEX_DEPLOYMENT",
  "CONVEX_URL",
  "DATABASE_URL",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "OPENROUTER_API_KEY",
  "JWT_SECRET",
  "NEON_DATABASE_URL",
];

const envExample = `# Environment Configuration Template
# Copy this file to .env.local and fill in your values

# Node Environment
NODE_ENV=development

# Convex Configuration
CONVEX_DEPLOYMENT=
CONVEX_URL=
NEXT_PUBLIC_CONVEX_URL=

# Database Configuration
DATABASE_URL=
NEON_DATABASE_URL=

# Authentication
JWT_SECRET=
JWT_REFRESH_SECRET=
SESSION_SECRET=

# Twilio Configuration
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# OpenRouter Configuration
OPENROUTER_API_KEY=

# API Configuration
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001

# Redis Configuration (optional for local dev)
REDIS_URL=redis://localhost:6379

# Monitoring (optional)
SENTRY_DSN=
`;

function validateEnvironment() {
  console.log("🔍 Validating environment configuration...\n");

  // Create .env.example if it doesn't exist
  const envExamplePath = path.join(process.cwd(), ".env.example");
  if (!fs.existsSync(envExamplePath)) {
    fs.writeFileSync(envExamplePath, envExample);
    console.log("✅ Created .env.example file");
  }

  // Check for .env.local
  const envLocalPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envLocalPath)) {
    console.warn("⚠️  Warning: .env.local file not found");
    console.log(
      "   Please copy .env.example to .env.local and configure your environment variables\n",
    );
    return;
  }

  // In production, validate required variables
  if (process.env.NODE_ENV === "production") {
    const missing = [];
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    }

    if (missing.length > 0) {
      console.error("❌ Missing required environment variables:");
      missing.forEach((v) => console.error(`   - ${v}`));
      process.exit(1);
    }
  }

  console.log("✅ Environment validation complete\n");
}

// Run validation
if (require.main === module) {
  validateEnvironment();
}

module.exports = { validateEnvironment };
