declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    userRole: 'user' | 'admin' | 'agent';
    auth: {
      userId: string;
      email: string;
      role: 'user' | 'admin' | 'agent';
      sessionId?: string;
      token: string;
    };
    validated: unknown;
    requestId: string;
  }
}

export {};