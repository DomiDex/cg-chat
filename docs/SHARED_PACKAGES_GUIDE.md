# Enhanced Shared Packages Documentation

## 📦 Overview

The Computer Guys Chatbot system utilizes four core shared packages that provide reusable functionality across all applications in the monorepo. These packages were designed with TypeScript-first approach, ensuring type safety and excellent developer experience.

---

## 🚀 @cg/convex-client

### Purpose
Centralized Convex client management with React hooks for real-time features, authentication, and messaging.

### Installation
```bash
pnpm add @cg/convex-client
```

### Architecture
```
@cg/convex-client/
├── src/
│   ├── index.ts           # Main exports and client management
│   ├── hooks/
│   │   ├── useAuth.ts     # Authentication hook
│   │   ├── useChat.ts     # Chat functionality hook
│   │   └── useRealtime.ts # Real-time features hook
│   └── utils/
│       ├── errors.ts      # Error handling utilities
│       └── retry.ts       # Retry logic with exponential backoff
├── package.json
└── tsconfig.json
```

### Core Features

#### 1. Client Management
```typescript
import { getConvexReactClient, getConvexHttpClient } from '@cg/convex-client';

// Get singleton React client for browser
const reactClient = getConvexReactClient();

// Get singleton HTTP client for server-side
const httpClient = getConvexHttpClient();
```

#### 2. Type-Safe Wrappers
```typescript
import { query, mutation, action } from '@cg/convex-client';

// Type-safe query execution
const users = await query(api.users.list, { role: 'admin' });

// Type-safe mutation
const userId = await mutation(api.users.create, {
  email: 'user@example.com',
  name: 'John Doe'
});

// Type-safe action
const result = await action(api.ai.generateResponse, {
  prompt: 'Help me fix my computer'
});
```

#### 3. Authentication Hook
```typescript
import { useAuth } from '@cg/convex-client';

function LoginComponent() {
  const {
    user,           // Current user object
    isLoading,      // Loading state
    isAuthenticated,// Authentication status
    error,          // Error state
    login,          // Login function
    verify,         // Verify code function
    logout,         // Logout function
    refreshSession  // Refresh session function
  } = useAuth();

  const handleLogin = async (email: string) => {
    try {
      await login(email);
      // Code sent to email
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleVerify = async (code: string) => {
    try {
      await verify(email, code);
      // User authenticated
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };
}
```

#### 4. Chat Hook
```typescript
import { useChat } from '@cg/convex-client';

function ChatComponent({ conversationId }) {
  const {
    conversations,      // List of conversations
    activeConversation, // Current conversation
    messages,          // Messages in conversation
    isLoading,         // Loading state
    error,             // Error state
    typingUsers,       // Users currently typing
    sendMessage,       // Send message function
    createConversation,// Create new conversation
    deleteMessage,     // Delete message
    editMessage,       // Edit message
    markAsRead,        // Mark conversation as read
    setTyping,         // Set typing status
    loadMoreMessages   // Pagination
  } = useChat(conversationId);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Typing indicator
  const handleTyping = () => {
    setTyping(true);
    // Automatically stops after 3 seconds
  };
}
```

#### 5. Realtime Hook
```typescript
import { useRealtime } from '@cg/convex-client';

function PresenceComponent() {
  const {
    isConnected,       // Connection status
    onlineUsers,       // List of online users
    typingUsers,       // Map of typing users by conversation
    presence,          // User presence data
    connectionError,   // Connection error
    updatePresence,    // Update user presence
    startTyping,       // Start typing indicator
    stopTyping,        // Stop typing indicator
    subscribeToConversation,   // Subscribe to updates
    unsubscribeFromConversation // Unsubscribe
  } = useRealtime();

  // Update presence
  useEffect(() => {
    updatePresence({
      status: 'online',
      lastSeen: Date.now()
    });
  }, []);

  // Subscribe to conversation
  useEffect(() => {
    const unsubscribe = subscribeToConversation(conversationId);
    return unsubscribe;
  }, [conversationId]);
}
```

#### 6. Error Handling
```typescript
import { ConvexError, isConvexError, handleConvexError } from '@cg/convex-client';

try {
  await someConvexOperation();
} catch (error) {
  if (isConvexError(error)) {
    const handled = handleConvexError(error);
    console.error('Convex error:', handled.message, handled.code);
  }
}
```

#### 7. Retry Logic
```typescript
import { retry, RetryOptions } from '@cg/convex-client';

const options: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT']
};

const result = await retry(
  async () => fetchData(),
  options
);
```

### Usage Examples

#### Complete Authentication Flow
```typescript
import { useAuth } from '@cg/convex-client';
import { useState } from 'react';

function AuthFlow() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const { login, verify, user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome, {user.email}!</div>;
  }

  if (step === 'email') {
    return (
      <form onSubmit={async (e) => {
        e.preventDefault();
        await login(email);
        setStep('code');
      }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
        />
        <button type="submit">Send Code</button>
      </form>
    );
  }

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      await verify(email, code);
    }}>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter verification code"
      />
      <button type="submit">Verify</button>
    </form>
  );
}
```

---

## 🎯 @cg/types

### Purpose
Comprehensive TypeScript type definitions shared across all packages and applications.

### Installation
```bash
pnpm add @cg/types
```

### Architecture
```
@cg/types/
├── src/
│   ├── index.ts        # Main exports
│   ├── entities.ts     # Database entity types
│   ├── api.ts          # API request/response types
│   ├── enums.ts        # Shared enumerations
│   ├── utils.ts        # Utility types
│   └── schemas.ts      # Zod validation schemas
├── package.json
└── tsconfig.json
```

### Type Categories

#### 1. Entity Types
```typescript
import { User, Customer, Agent, Conversation, Message } from '@cg/types';

// User entity
interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  customerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer entity
interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  whatsappNumber?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Agent entity
interface Agent {
  id: string;
  name: string;
  type: AgentType;
  capabilities: string[];
  modelConfig: ModelConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Conversation entity
interface Conversation {
  id: string;
  userId?: string;
  customerId?: string;
  agentId?: string;
  channel: Channel;
  status: ConversationStatus;
  title?: string;
  metadata?: ConversationMetadata;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Message entity
interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: MessageRole;
  status: MessageStatus;
  metadata?: MessageMetadata;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. API Types
```typescript
import { 
  ApiResponse, 
  ApiError, 
  PaginatedResponse,
  AuthRequest,
  AuthResponse 
} from '@cg/types';

// Generic API response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

// Error structure
interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
  timestamp: Date;
}

// Paginated response
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Authentication types
interface AuthRequest {
  email: string;
}

interface VerifyRequest {
  email: string;
  code: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: Date;
}
```

#### 3. Enumerations
```typescript
import { 
  UserRole, 
  Channel, 
  MessageRole,
  ConversationStatus,
  AgentType 
} from '@cg/types';

enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  USER = 'user'
}

enum Channel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  WEB = 'web',
  API = 'api'
}

enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool'
}

enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

enum AgentType {
  CHAT = 'chat',
  SUPPORT = 'support',
  TECHNICAL = 'technical',
  SALES = 'sales',
  ESCALATION = 'escalation'
}
```

#### 4. Utility Types
```typescript
import { 
  Nullable, 
  DeepPartial, 
  RequiredFields,
  OptionalFields,
  AsyncReturnType 
} from '@cg/types';

// Make type nullable
type NullableUser = Nullable<User>;

// Deep partial for nested updates
type PartialUser = DeepPartial<User>;

// Require specific fields
type UserWithEmail = RequiredFields<User, 'email' | 'name'>;

// Make fields optional
type UserUpdate = OptionalFields<User, 'createdAt' | 'updatedAt'>;

// Extract async function return type
type QueryResult = AsyncReturnType<typeof queryFunction>;
```

#### 5. Validation Schemas
```typescript
import { 
  UserSchema, 
  MessageSchema, 
  ConversationSchema,
  validateUser,
  validateMessage 
} from '@cg/types';

// Zod schemas for validation
const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['admin', 'agent', 'user'])
});

// Validation functions
function validateUser(data: unknown): User {
  return UserSchema.parse(data);
}

// Usage
try {
  const user = validateUser({
    email: 'user@example.com',
    role: 'user'
  });
} catch (error) {
  console.error('Validation failed:', error);
}
```

### Advanced Type Patterns

#### Discriminated Unions
```typescript
type NotificationEvent = 
  | { type: 'message'; conversationId: string; messageId: string }
  | { type: 'typing'; conversationId: string; userId: string }
  | { type: 'presence'; userId: string; status: 'online' | 'offline' }
  | { type: 'error'; code: string; message: string };

function handleEvent(event: NotificationEvent) {
  switch (event.type) {
    case 'message':
      console.log('New message:', event.messageId);
      break;
    case 'typing':
      console.log('User typing:', event.userId);
      break;
    case 'presence':
      console.log('User status:', event.status);
      break;
    case 'error':
      console.error('Error:', event.message);
      break;
  }
}
```

#### Branded Types
```typescript
type UserId = string & { __brand: 'UserId' };
type CustomerId = string & { __brand: 'CustomerId' };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createCustomerId(id: string): CustomerId {
  return id as CustomerId;
}

// Type safety prevents mixing IDs
function getUser(id: UserId) { /* ... */ }
function getCustomer(id: CustomerId) { /* ... */ }

const userId = createUserId('user-123');
const customerId = createCustomerId('customer-456');

getUser(userId); // ✅ OK
getUser(customerId); // ❌ Type error
```

---

## 🛠️ @cg/utils

### Purpose
Comprehensive collection of utility functions for common operations across the application.

### Installation
```bash
pnpm add @cg/utils
```

### Architecture
```
@cg/utils/
├── src/
│   ├── index.ts       # Main exports
│   ├── string.ts      # String manipulation utilities
│   ├── date.ts        # Date/time utilities
│   ├── array.ts       # Array manipulation utilities
│   ├── object.ts      # Object manipulation utilities
│   ├── async.ts       # Async/Promise utilities
│   ├── validation.ts  # Validation utilities
│   ├── crypto.ts      # Cryptographic utilities
│   └── formatting.ts  # Formatting utilities
├── package.json
└── tsconfig.json
```

### Utility Modules

#### 1. String Utilities (30+ functions)
```typescript
import { 
  capitalize, 
  slugify, 
  truncate,
  maskEmail,
  extractInitials,
  toCamelCase,
  toKebabCase,
  toPascalCase,
  removeAccents,
  escapeHtml
} from '@cg/utils';

// Text transformation
capitalize('hello world');        // 'Hello World'
slugify('Hello World!');         // 'hello-world'
toCamelCase('hello-world');      // 'helloWorld'
toKebabCase('HelloWorld');       // 'hello-world'
toPascalCase('hello-world');     // 'HelloWorld'

// String manipulation
truncate('Long text here', 10);  // 'Long te...'
maskEmail('user@example.com');   // 'u***@example.com'
extractInitials('John Doe');     // 'JD'
removeAccents('café');           // 'cafe'
escapeHtml('<script>');          // '&lt;script&gt;'

// Advanced string operations
import { levenshteinDistance, fuzzyMatch } from '@cg/utils';

levenshteinDistance('kitten', 'sitting'); // 3
fuzzyMatch('hello', 'helo');              // true
```

#### 2. Date Utilities (20+ functions)
```typescript
import {
  formatDate,
  formatRelativeTime,
  addDays,
  addBusinessDays,
  startOfDay,
  endOfDay,
  isWeekend,
  getQuarter,
  diffInDays,
  parseISO
} from '@cg/utils';

// Date formatting
formatDate(new Date());                    // '2024-08-18'
formatDate(new Date(), 'MM/DD/YYYY');     // '08/18/2024'
formatRelativeTime(new Date());           // 'just now'
formatRelativeTime(yesterday);            // 'yesterday'

// Date manipulation
const today = new Date();
addDays(today, 7);                        // Date 7 days from now
addBusinessDays(today, 5);                // Date 5 business days from now
startOfDay(today);                        // Today at 00:00:00
endOfDay(today);                          // Today at 23:59:59

// Date queries
isWeekend(new Date());                    // true/false
getQuarter(new Date());                   // 1-4
diffInDays(date1, date2);                // Number of days between dates

// Date parsing
parseISO('2024-08-18T10:30:00Z');        // Date object
```

#### 3. Array Utilities (25+ functions)
```typescript
import {
  chunk,
  flatten,
  unique,
  uniqueBy,
  groupBy,
  sortBy,
  shuffle,
  sample,
  difference,
  intersection,
  partition,
  sum,
  average,
  median
} from '@cg/utils';

// Array transformation
chunk([1,2,3,4,5], 2);                   // [[1,2], [3,4], [5]]
flatten([[1,2], [3,4]]);                 // [1,2,3,4]
unique([1,1,2,2,3]);                     // [1,2,3]

// Array operations
const users = [
  { id: 1, name: 'John', age: 30 },
  { id: 2, name: 'Jane', age: 25 },
  { id: 1, name: 'John', age: 30 }
];

uniqueBy(users, user => user.id);        // Unique by ID
groupBy(users, user => user.age);        // Group by age
sortBy(users, user => user.name);        // Sort by name

// Array sampling
shuffle([1,2,3,4,5]);                    // Random order
sample([1,2,3,4,5]);                     // Random element
sampleSize([1,2,3,4,5], 2);             // Random 2 elements

// Set operations
difference([1,2,3], [2,3,4]);           // [1]
intersection([1,2,3], [2,3,4]);         // [2,3]
union([1,2], [2,3], [3,4]);            // [1,2,3,4]

// Statistical operations
sum([1,2,3,4,5]);                       // 15
average([1,2,3,4,5]);                   // 3
median([1,2,3,4,5]);                    // 3
mode([1,2,2,3,3,3]);                   // 3
```

#### 4. Object Utilities (20+ functions)
```typescript
import {
  deepClone,
  deepMerge,
  pick,
  omit,
  isEmpty,
  flatten,
  unflatten,
  get,
  set,
  has,
  mapKeys,
  mapValues,
  invert,
  diff
} from '@cg/utils';

// Object manipulation
const obj = { a: 1, b: 2, c: 3 };
pick(obj, ['a', 'b']);                  // { a: 1, b: 2 }
omit(obj, ['c']);                       // { a: 1, b: 2 }
invert(obj);                            // { 1: 'a', 2: 'b', 3: 'c' }

// Deep operations
const nested = { a: { b: { c: 1 } } };
deepClone(nested);                      // Complete deep copy
deepMerge(obj1, obj2);                  // Deep merge objects
get(nested, 'a.b.c');                   // 1
set(nested, 'a.b.d', 2);               // Sets nested value
has(nested, 'a.b.c');                   // true

// Object transformation
flatten({ a: { b: 1 } });              // { 'a.b': 1 }
unflatten({ 'a.b': 1 });              // { a: { b: 1 } }
mapKeys(obj, key => key.toUpperCase());
mapValues(obj, val => val * 2);

// Object comparison
diff(obj1, obj2);                      // Differences between objects
isEqual(obj1, obj2);                   // Deep equality check
```

#### 5. Async Utilities
```typescript
import {
  retry,
  debounce,
  throttle,
  Queue,
  sleep,
  timeout,
  parallel,
  series,
  race
} from '@cg/utils';

// Retry with exponential backoff
const result = await retry(
  async () => fetchData(),
  {
    maxAttempts: 3,
    initialDelay: 1000,
    backoffFactor: 2
  }
);

// Debounce and throttle
const debouncedSearch = debounce(search, 300);
const throttledScroll = throttle(handleScroll, 100);

// Queue management
const queue = new Queue({ concurrency: 2 });
await queue.add(() => processItem(item1));
await queue.add(() => processItem(item2));
await queue.onEmpty(); // Wait for queue to empty

// Async control flow
await sleep(1000);                     // Sleep for 1 second
await timeout(promise, 5000);          // Timeout after 5 seconds

// Parallel execution with limit
const results = await parallel(
  tasks,
  { concurrency: 3 }
);

// Sequential execution
const results = await series(tasks);

// Race conditions
const fastest = await race([
  fetchFromCache(),
  fetchFromAPI()
]);
```

#### 6. Validation Utilities
```typescript
import {
  isValidEmail,
  isPhone,
  isValidUrl,
  isUUID,
  isCreditCard,
  isSSN,
  isPostalCode,
  isStrongPassword,
  validateEmail,
  validatePhone,
  validatePassword
} from '@cg/utils';

// Basic validators
isValidEmail('user@example.com');          // true
isPhone('+1234567890');                // true
isValidUrl('https://example.com');         // true
isUUID('123e4567-e89b-12d3-a456-426614174000'); // true

// Financial validators
isCreditCard('4111111111111111');      // true (Visa)
isSSN('123-45-6789');                  // true

// Location validators
isPostalCode('12345');                 // true (US)
isPostalCode('12345-6789');           // true (US ZIP+4)

// Security validators
isStrongPassword('Pass123!@#');        // true

// Validation with detailed feedback
validateEmail('invalid');
// { valid: false, reason: 'Invalid email format' }

validatePassword('weak');
// { valid: false, reason: 'Password too short', suggestions: [...] }
```

#### 7. Crypto Utilities
```typescript
import {
  hash,
  verify,
  encrypt,
  decrypt,
  generateUUID,
  generateRandomString,
  generateToken,
  sign,
  verifySignature
} from '@cg/utils';

// Hashing
const hashed = await hash('password');
const isValid = await verify('password', hashed);

// Encryption
const encrypted = await encrypt('secret data', 'key');
const decrypted = await decrypt(encrypted, 'key');

// Token generation
generateUUID();                         // UUID v4
generateRandomString(32);              // Random alphanumeric
generateToken(64);                     // Secure random token

// Digital signatures
const signature = await sign(data, privateKey);
const isValid = await verifySignature(data, signature, publicKey);
```

#### 8. Formatting Utilities
```typescript
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatBytes,
  formatDuration,
  formatPhoneNumber,
  formatCreditCard,
  formatAddress,
  pluralize,
  formatList
} from '@cg/utils';

// Number formatting
formatCurrency(1234.56);               // '$1,234.56'
formatCurrency(1234.56, 'EUR');       // '€1,234.56'
formatNumber(1234567.89);             // '1,234,567.89'
formatPercentage(0.125);              // '12.5%'
formatBytes(1024);                    // '1 KB'
formatCompactNumber(1500);            // '1.5K'

// Time formatting
formatDuration(3661000);              // '1h 1m 1s'

// String formatting
formatPhoneNumber('1234567890');      // '(123) 456-7890'
formatCreditCard('4111111111111111'); // '4111 1111 1111 1111'
formatSSN('123456789');               // '123-45-6789'
formatZipCode('12345');               // '12345'

// Address formatting
formatAddress({
  street: '123 Main St',
  city: 'New York',
  state: 'NY',
  zip: '10001'
});                                    // '123 Main St, New York, NY 10001'

// Text formatting
pluralize(1, 'item');                 // '1 item'
pluralize(5, 'item');                 // '5 items'
pluralize(2, 'child', 'children');   // '2 children'

formatList(['apple', 'banana', 'orange']); 
// 'apple, banana, and orange'

formatList(['apple', 'banana'], 'or');
// 'apple or banana'
```

### Advanced Utility Patterns

#### Composition Example
```typescript
import { pipe, compose } from '@cg/utils';

// Pipe functions left to right
const processUser = pipe(
  validateUser,
  normalizeUser,
  enrichUser,
  saveUser
);

// Compose functions right to left
const processData = compose(
  formatOutput,
  transform,
  validate,
  parseInput
);
```

#### Memoization
```typescript
import { memoize } from '@cg/utils';

const expensiveCalculation = memoize(
  (n: number) => {
    console.log('Computing...');
    return n * n;
  },
  { maxSize: 100, ttl: 60000 }
);

expensiveCalculation(5); // Computing... 25
expensiveCalculation(5); // 25 (cached)
```

---

## ⚙️ @cg/config

### Purpose
Centralized configuration management with environment validation and type safety.

### Installation
```bash
pnpm add @cg/config
```

### Architecture
```
@cg/config/
├── src/
│   ├── index.ts       # Main configuration export
│   ├── env.ts         # Environment validation
│   ├── features.ts    # Feature flags
│   ├── services.ts    # Service configurations
│   └── constants.ts   # Application constants
├── package.json
└── tsconfig.json
```

### Configuration Categories

#### 1. Environment Configuration
```typescript
import { validateEnv, getConfig, Env } from '@cg/config';

// Validate environment on startup
const env = validateEnv();

// Get configuration with defaults
const config = getConfig();

// Environment schema
interface Env {
  // Node
  NODE_ENV: 'development' | 'test' | 'production';
  
  // Database
  DATABASE_URL: string;
  DIRECT_DATABASE_URL?: string;
  
  // Convex
  CONVEX_DEPLOYMENT?: string;
  CONVEX_URL?: string;
  NEXT_PUBLIC_CONVEX_URL?: string;
  
  // Authentication
  JWT_SECRET?: string;
  JWT_REFRESH_SECRET?: string;
  SESSION_SECRET?: string;
  
  // Twilio
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  
  // OpenRouter
  OPENROUTER_API_KEY?: string;
  
  // URLs
  API_URL: string;
  NEXT_PUBLIC_API_URL: string;
  FRONTEND_URL: string;
  
  // Feature flags
  ENABLE_ANALYTICS: boolean;
  ENABLE_DEBUG: boolean;
  ENABLE_VOICE_INPUT: boolean;
  ENABLE_AI_SUGGESTIONS: boolean;
}
```

#### 2. Feature Flags
```typescript
import { features } from '@cg/config';

// Check feature flags
if (features.analytics()) {
  trackEvent('user_action');
}

if (features.debug()) {
  console.log('Debug mode enabled');
}

if (features.voiceInput()) {
  enableVoiceRecognition();
}

if (features.aiSuggestions()) {
  showAISuggestions();
}

// Feature flag configuration
const featureConfig = {
  analytics: process.env.ENABLE_ANALYTICS === 'true',
  debug: process.env.ENABLE_DEBUG === 'true',
  voiceInput: process.env.ENABLE_VOICE_INPUT === 'true',
  aiSuggestions: process.env.ENABLE_AI_SUGGESTIONS !== 'false'
};
```

#### 3. Service Endpoints
```typescript
import { endpoints } from '@cg/config';

// Access service URLs
const apiUrl = endpoints.api;        // 'http://localhost:3001'
const frontendUrl = endpoints.frontend; // 'http://localhost:3000'
const convexUrl = endpoints.convex;   // Convex URL

// Usage in API calls
fetch(`${endpoints.api}/auth/login`, {
  method: 'POST',
  body: JSON.stringify({ email })
});
```

#### 4. Application Constants
```typescript
import { constants } from '@cg/config';

// Timing constants
constants.SESSION_TIMEOUT;           // 30 minutes
constants.TOKEN_EXPIRY;              // 15 minutes
constants.REFRESH_TOKEN_EXPIRY;      // 7 days
constants.VERIFICATION_CODE_EXPIRY;  // 10 minutes

// Limits
constants.MAX_LOGIN_ATTEMPTS;        // 5
constants.RATE_LIMIT_WINDOW;         // 1 minute
constants.RATE_LIMIT_MAX;            // 100 requests
constants.MAX_MESSAGE_LENGTH;        // 4096 characters
constants.MAX_CONVERSATION_MESSAGES; // 1000
constants.MAX_FILE_SIZE;             // 10MB

// Validation
constants.VERIFICATION_CODE_LENGTH;  // 6
constants.ALLOWED_FILE_TYPES;        // ['image/jpeg', 'image/png', ...]
```

#### 5. Database Configuration
```typescript
import { database } from '@cg/config';

// Database settings
const dbConfig = {
  poolSize: database.poolSize,           // 20
  timeout: database.timeout,             // 2000ms
  rlsBypassSecret: database.rlsBypassSecret,
  enableLogging: database.enableLogging, // true in dev
  enableDebug: database.enableDebug      // false
};

// Usage with Prisma
const prisma = new PrismaClient({
  log: database.enableLogging ? ['query', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});
```

#### 6. Redis Configuration
```typescript
import { redis } from '@cg/config';

// Redis settings
const redisConfig = {
  url: redis.url,
  maxRetries: redis.maxRetries,         // 3
  retryDelay: redis.retryDelay,         // 1000ms
  enableOfflineQueue: redis.enableOfflineQueue // true
};

// Usage with Redis client
const client = createClient({
  url: redis.url,
  retry_strategy: (options) => {
    if (options.attempt > redis.maxRetries) {
      return new Error('Max retries reached');
    }
    return redis.retryDelay;
  }
});
```

#### 7. Security Configuration
```typescript
import { security } from '@cg/config';

// Security settings
const securityConfig = {
  bcryptRounds: security.bcryptRounds,      // 12
  corsOrigins: security.corsOrigins,        // ['http://localhost:3000']
  trustedProxies: security.trustedProxies,  // []
  csrfEnabled: security.csrfEnabled,        // true in production
  helmetEnabled: security.helmetEnabled     // true
};

// CORS configuration
app.use(cors({
  origin: security.corsOrigins,
  credentials: true
}));

// Password hashing
const hashedPassword = await bcrypt.hash(
  password, 
  security.bcryptRounds
);
```

#### 8. Monitoring Configuration
```typescript
import { monitoring } from '@cg/config';

// Monitoring settings
Sentry.init({
  dsn: monitoring.sentryDsn,
  environment: monitoring.sentryEnvironment,
  tracesSampleRate: monitoring.sentryTracesSampleRate,
  enabled: isProduction()
});

// Logging configuration
const logger = createLogger({
  level: monitoring.logLevel // 'debug' in dev, 'info' in prod
});
```

#### 9. Email Configuration
```typescript
import { email } from '@cg/config';

// Email settings
const emailConfig = {
  from: email.from,                  // 'noreply@computerguys.com'
  replyTo: email.replyTo,           // 'support@computerguys.com'
  sendgridApiKey: email.sendgridApiKey,
  smtp: {
    host: email.smtpHost,
    port: email.smtpPort,           // 587
    user: email.smtpUser,
    pass: email.smtpPass,
    secure: email.smtpSecure        // false
  }
};

// Usage with nodemailer
const transporter = nodemailer.createTransport({
  host: email.smtpHost,
  port: email.smtpPort,
  secure: email.smtpSecure,
  auth: {
    user: email.smtpUser,
    pass: email.smtpPass
  }
});
```

#### 10. AI Configuration
```typescript
import { ai } from '@cg/config';

// AI settings
const aiConfig = {
  apiKey: ai.openRouterApiKey,
  model: ai.openRouterModel,        // 'anthropic/claude-3-opus'
  maxTokens: ai.maxTokens,          // 4096
  temperature: ai.temperature,       // 0.7
  topP: ai.topP                     // 0.9
};

// Usage with OpenRouter
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${ai.openRouterApiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: ai.openRouterModel,
    messages: [...],
    max_tokens: ai.maxTokens,
    temperature: ai.temperature,
    top_p: ai.topP
  })
});
```

#### 11. Twilio Configuration
```typescript
import { twilio } from '@cg/config';

// Twilio settings
const twilioClient = require('twilio')(
  twilio.accountSid,
  twilio.authToken
);

// Send WhatsApp message
await twilioClient.messages.create({
  from: `whatsapp:${twilio.phoneNumber}`,
  to: `whatsapp:${customerPhone}`,
  body: message,
  statusCallback: twilio.statusCallbackUrl
});
```

#### 12. Storage Configuration
```typescript
import { storage } from '@cg/config';

// Storage settings
const storageConfig = {
  provider: storage.provider,         // 'local' or 's3'
  maxFileSize: storage.maxFileSize,   // 10MB
  allowedMimeTypes: storage.allowedMimeTypes,
  s3: {
    bucket: storage.s3Bucket,
    region: storage.s3Region,
    accessKey: storage.s3AccessKey,
    secretKey: storage.s3SecretKey
  },
  local: {
    path: storage.localPath          // './uploads'
  }
};

// File validation
function validateFile(file: File) {
  if (file.size > storage.maxFileSize) {
    throw new Error('File too large');
  }
  if (!storage.allowedMimeTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
}
```

#### 13. Competitor Filtering
```typescript
import { competitors } from '@cg/config';

// Competitor list
const competitorList = [
  'Best Buy',
  'Geek Squad',
  'Micro Center',
  'Staples',
  'Office Depot',
  'Costco Tech',
  'Amazon Tech Support',
  'Apple Genius Bar',
  'Microsoft Store'
];

// Filter content
function filterCompetitorContent(text: string): string {
  let filtered = text;
  competitors.forEach(competitor => {
    const regex = new RegExp(competitor, 'gi');
    filtered = filtered.replace(regex, '[COMPETITOR]');
  });
  return filtered;
}

// Check for competitor mentions
function hasCompetitorMention(text: string): boolean {
  return competitors.some(competitor => 
    text.toLowerCase().includes(competitor.toLowerCase())
  );
}
```

#### 14. System Messages
```typescript
import { messages } from '@cg/config';

// Pre-defined system messages
const systemMessages = {
  welcome: messages.welcome,
  offline: messages.offline,
  maintenance: messages.maintenance,
  rateLimit: messages.rateLimit,
  sessionExpired: messages.sessionExpired,
  verificationSent: messages.verificationSent,
  verificationSuccess: messages.verificationSuccess,
  loginSuccess: messages.loginSuccess,
  logoutSuccess: messages.logoutSuccess,
  errorGeneric: messages.errorGeneric,
  errorNetwork: messages.errorNetwork,
  errorAuth: messages.errorAuth,
  errorPermission: messages.errorPermission,
  errorNotFound: messages.errorNotFound,
  errorValidation: messages.errorValidation
};

// Usage
function handleError(error: Error) {
  if (error.code === 'NETWORK_ERROR') {
    return messages.errorNetwork;
  }
  if (error.code === 'AUTH_FAILED') {
    return messages.errorAuth;
  }
  return messages.errorGeneric;
}
```

### Environment Helpers
```typescript
import { 
  isProduction, 
  isDevelopment, 
  isTest 
} from '@cg/config';

// Environment checks
if (isProduction()) {
  // Production-only code
  enableSentry();
  disableDebugMode();
}

if (isDevelopment()) {
  // Development-only code
  enableHotReload();
  showDebugPanel();
}

if (isTest()) {
  // Test-only code
  mockExternalServices();
}
```

---

## 📦 Package Management

### Installation in Applications

#### In Next.js Apps
```json
// apps/web/package.json
{
  "dependencies": {
    "@cg/convex-client": "workspace:*",
    "@cg/types": "workspace:*",
    "@cg/utils": "workspace:*",
    "@cg/config": "workspace:*"
  }
}
```

#### In API Server
```json
// apps/api/package.json
{
  "dependencies": {
    "@cg/types": "workspace:*",
    "@cg/utils": "workspace:*",
    "@cg/config": "workspace:*"
  }
}
```

### Building Packages
```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @cg/utils build

# Watch mode for development
pnpm --filter @cg/utils dev

# Type checking
pnpm --filter @cg/types type-check

# Linting
pnpm --filter @cg/config lint

# Testing
pnpm --filter @cg/utils test
```

### Version Management
```bash
# Update package versions
pnpm changeset

# Version packages
pnpm changeset version

# Publish packages (if not private)
pnpm changeset publish
```

---

## 🧪 Testing

### Testing Strategy

#### Unit Tests
```typescript
// utils.test.ts
import { describe, it, expect } from 'vitest';
import { slugify, capitalize } from '@cg/utils';

describe('String Utilities', () => {
  describe('slugify', () => {
    it('converts text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test & More')).toBe('test-and-more');
    });
  });
  
  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
    });
  });
});
```

#### Integration Tests
```typescript
// convex-client.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { getConvexHttpClient, query } from '@cg/convex-client';
import { api } from '../convex/_generated/api';

describe('Convex Client', () => {
  let client;
  
  beforeAll(() => {
    client = getConvexHttpClient();
  });
  
  it('executes queries', async () => {
    const result = await query(api.users.list, {});
    expect(result).toBeInstanceOf(Array);
  });
});
```

---

## 🚀 Best Practices

### 1. Import Organization
```typescript
// Good: Grouped imports
import { 
  capitalize, 
  slugify, 
  truncate 
} from '@cg/utils';

// Bad: Individual imports
import { capitalize } from '@cg/utils/string';
import { slugify } from '@cg/utils/string';
```

### 2. Type Safety
```typescript
// Good: Use provided types
import type { User, ApiResponse } from '@cg/types';

function processUser(user: User): ApiResponse<User> {
  // Type-safe operations
}

// Bad: Any types
function processUser(user: any): any {
  // Lost type safety
}
```

### 3. Configuration Access
```typescript
// Good: Use config package
import { features, constants } from '@cg/config';

if (features.analytics()) {
  // Feature-flagged code
}

// Bad: Direct env access
if (process.env.ENABLE_ANALYTICS === 'true') {
  // Fragile string comparison
}
```

### 4. Error Handling
```typescript
// Good: Proper error handling
import { retry, isConvexError } from '@cg/convex-client';

try {
  await retry(() => fetchData(), { maxAttempts: 3 });
} catch (error) {
  if (isConvexError(error)) {
    // Handle Convex-specific error
  }
  // Generic error handling
}
```

---

## 📈 Performance Considerations

### Bundle Size Optimization
- Tree-shaking enabled for all packages
- ESM modules for better optimization
- Separate entry points for server/client code

### Runtime Performance
- Memoization for expensive operations
- Lazy loading for heavy utilities
- Efficient algorithms (O(n) or better where possible)

### Type Performance
- Discriminated unions over complex conditionals
- Avoid excessive type recursion
- Use type predicates for narrowing

---

## 🔄 Migration Guide

### From Individual Utilities to Shared Packages
```typescript
// Before: Scattered utilities
import { capitalize } from '../../utils/string';
import { formatDate } from '../../utils/date';

// After: Centralized packages
import { capitalize, formatDate } from '@cg/utils';
```

### From Process.env to Config
```typescript
// Before: Direct env access
const apiUrl = process.env.API_URL || 'http://localhost:3001';

// After: Config package
import { endpoints } from '@cg/config';
const apiUrl = endpoints.api;
```

---

## 📝 Conclusion

The four enhanced shared packages provide a robust foundation for the Computer Guys Chatbot system:

1. **@cg/convex-client** - Complete real-time client with hooks
2. **@cg/types** - Comprehensive type safety across the application
3. **@cg/utils** - 100+ utility functions for common operations
4. **@cg/config** - Centralized, validated configuration management

These packages ensure:
- **Code Reusability** - Write once, use everywhere
- **Type Safety** - End-to-end TypeScript coverage
- **Maintainability** - Single source of truth
- **Developer Experience** - Intuitive APIs with excellent documentation
- **Performance** - Optimized for production use

The modular architecture allows for easy extension and modification while maintaining backward compatibility across the monorepo.

---

*Package Documentation Version: 1.0.0*
*Last Updated: August 2024*
*Project: Computer Guys Chatbot System*