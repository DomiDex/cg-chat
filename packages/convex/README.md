# Convex Backend Package

This package contains the Convex backend implementation for the Computer Guys AI
chatbot system.

## 📁 Structure

```
packages/convex/
├── schema.ts           # Database schema definition
├── users.ts            # User management functions
├── conversations.ts    # Conversation handling
├── messages.ts         # Message operations
├── agents.ts           # AI agent management
├── auth.ts             # Authentication helpers
├── env.ts              # Environment configuration
├── convex.json         # Convex configuration
└── _generated/         # Auto-generated Convex files
```

## 🗄️ Database Schema

### Tables

- **users**: User accounts with email authentication
- **conversations**: Chat conversations with status tracking
- **messages**: Individual messages with metadata
- **agents**: AI agent configurations
- **workflows**: Durable workflow tracking
- **knowledge**: RAG knowledge base with vector embeddings
- **analytics**: Event tracking and metrics
- **sessions**: Authentication sessions
- **rateLimits**: API rate limiting

### Indexes

- 30+ indexes for optimized queries
- Vector index for semantic search (1536 dimensions)

## 🚀 Setup

### 1. Login to Convex

```bash
npx convex login
```

### 2. Initialize Project

```bash
cd packages/convex
npx convex init
```

### 3. Deploy Schema

```bash
npx convex dev
```

### 4. Set Environment Variables

```bash
npx convex env set OPENROUTER_API_KEY your_key
npx convex env set TWILIO_ACCOUNT_SID your_sid
npx convex env set TWILIO_AUTH_TOKEN your_token
npx convex env set JWT_SECRET your_secret
```

## 📝 Available Scripts

```bash
# Development
pnpm dev              # Start Convex dev server
pnpm codegen         # Generate TypeScript types

# Deployment
pnpm deploy          # Deploy to development
pnpm deploy:prod     # Deploy to production

# Management
pnpm logs            # View function logs
pnpm dashboard       # Open Convex dashboard
pnpm export         # Export data
pnpm import         # Import data
```

## 🔧 Key Functions

### User Management

- `createUser`: Create new user account
- `getUserByEmail`: Find user by email
- `updateUser`: Update user profile
- `verifyEmail`: Verify email address

### Conversations

- `createConversation`: Start new conversation
- `getUserConversations`: Get user's conversations
- `updateConversation`: Update conversation status
- `escalateConversation`: Escalate to human agent

### Messages

- `sendMessage`: Send a message
- `getMessages`: Retrieve conversation messages
- `subscribeToMessages`: Real-time message updates
- `sendAgentMessage`: Send message from AI agent

### Agents

- `createAgent`: Register new AI agent
- `getAvailableAgent`: Find suitable agent
- `updateAgentMetrics`: Track agent performance

### Authentication

- `createSession`: Create auth session
- `validateSession`: Validate token
- `refreshSession`: Refresh expired token
- `logout`: End session

## 🔐 Security Features

- Email-based authentication
- Session token management
- Rate limiting per IP/user
- Input validation on all functions
- Secure environment variable storage

## 🚦 Real-time Features

Convex provides real-time subscriptions out of the box:

```typescript
// Subscribe to messages
const messages = useQuery(api.messages.subscribeToMessages, {
  conversationId: 'conversation_id',
});
```

## 🎯 Vector Search

RAG implementation with OpenAI embeddings:

```typescript
// Vector index configured in schema
.vectorIndex("by_embedding", {
  vectorField: "embedding",
  dimensions: 1536,
  filterFields: ["type", "active"],
})
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Test individual functions in dashboard
npx convex dashboard
```

## 📊 Monitoring

- View logs: `pnpm logs`
- Dashboard: `pnpm dashboard`
- Analytics table tracks all events

## 🔄 Migrations

Schema changes are handled automatically by Convex. For data migrations:

1. Create migration function in `migrations/`
2. Run via dashboard or CLI
3. Monitor progress in logs

## 📚 Resources

- [Convex Documentation](https://docs.convex.dev)
- [Schema Guide](https://docs.convex.dev/database/schemas)
- [Functions Guide](https://docs.convex.dev/functions)
- [Vector Search](https://docs.convex.dev/vector-search)

## ⚠️ Important Notes

1. Always run `pnpm codegen` after schema changes
2. Environment variables must be set via `convex env set`
3. Use dashboard for debugging and testing
4. Vector embeddings require OpenAI API key
5. Rate limiting is enforced at the database level

## 🛠️ Troubleshooting

### Schema validation errors

```bash
npx convex dev --clear
```

### Type generation issues

```bash
rm -rf _generated
npx convex codegen
```

### Environment variable issues

```bash
npx convex env list
npx convex env set KEY value
```

### Login issues

```bash
npx convex logout
npx convex login
```
