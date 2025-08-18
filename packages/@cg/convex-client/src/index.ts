import { ConvexReactClient } from 'convex/react';
import { ConvexHttpClient } from 'convex/browser';
import { FunctionReference, FunctionReturnType, FunctionArgs } from 'convex/server';
import type { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

// Re-export types
export type { Id, api };
export type ConvexAPI = typeof api;

// Environment configuration
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.warn('Convex URL not configured. Set NEXT_PUBLIC_CONVEX_URL or CONVEX_URL');
}

// Singleton clients
let reactClient: ConvexReactClient | null = null;
let httpClient: ConvexHttpClient | null = null;

/**
 * Get or create React client for browser use
 */
export function getConvexReactClient(): ConvexReactClient {
  if (!reactClient && CONVEX_URL) {
    reactClient = new ConvexReactClient(CONVEX_URL);
  }
  if (!reactClient) {
    throw new Error('Convex React client not initialized. Check CONVEX_URL configuration.');
  }
  return reactClient;
}

/**
 * Get or create HTTP client for server-side use
 */
export function getConvexHttpClient(): ConvexHttpClient {
  if (!httpClient && CONVEX_URL) {
    httpClient = new ConvexHttpClient(CONVEX_URL);
  }
  if (!httpClient) {
    throw new Error('Convex HTTP client not initialized. Check CONVEX_URL configuration.');
  }
  return httpClient;
}

/**
 * Type-safe wrapper for Convex queries
 */
export async function query<Query extends FunctionReference<'query'>>(
  functionRef: Query,
  args: FunctionArgs<Query>
): Promise<FunctionReturnType<Query>> {
  const client = getConvexHttpClient();
  return client.query(functionRef, args);
}

/**
 * Type-safe wrapper for Convex mutations
 */
export async function mutation<Mutation extends FunctionReference<'mutation'>>(
  functionRef: Mutation,
  args: FunctionArgs<Mutation>
): Promise<FunctionReturnType<Mutation>> {
  const client = getConvexHttpClient();
  return client.mutation(functionRef, args);
}

/**
 * Type-safe wrapper for Convex actions
 */
export async function action<Action extends FunctionReference<'action'>>(
  functionRef: Action,
  args: FunctionArgs<Action>
): Promise<FunctionReturnType<Action>> {
  const client = getConvexHttpClient();
  return client.action(functionRef, args);
}

// Re-export Convex React components
export { ConvexProvider, useQuery, useMutation, useAction, usePaginatedQuery } from 'convex/react';

// Custom hooks
export { useAuth } from './hooks/useAuth';
export { useChat } from './hooks/useChat';
export { useRealtime } from './hooks/useRealtime';

// Utilities
export * from './utils/errors';
export * from './utils/retry';