import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useState, useCallback, useEffect, useRef } from 'react';

interface RealtimeState {
  isConnected: boolean;
  onlineUsers: string[];
  typingUsers: Map<string, string[]>; // conversationId -> userIds
  presence: Map<string, any>; // userId -> presence data
  connectionError: Error | null;
}

interface RealtimeActions {
  updatePresence: (data: any) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  subscribeToConversation: (conversationId: string) => () => void;
  unsubscribeFromConversation: (conversationId: string) => void;
}

export function useRealtime(): RealtimeState & RealtimeActions {
  const [state, setState] = useState<RealtimeState>({
    isConnected: true,
    onlineUsers: [],
    typingUsers: new Map(),
    presence: new Map(),
    connectionError: null,
  });

  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const subscriptions = useRef<Set<string>>(new Set());

  // Convex queries for realtime data
  const onlineUsers = useQuery(api.realtime.getOnlineUsers);
  
  // Update online users when data changes
  useEffect(() => {
    if (onlineUsers) {
      setState(prev => ({
        ...prev,
        onlineUsers: onlineUsers.map((u: any) => u._id),
        isConnected: true,
        connectionError: null,
      }));
    }
  }, [onlineUsers]);

  const updatePresence = useCallback((data: any) => {
    setState(prev => {
      const newPresence = new Map(prev.presence);
      newPresence.set(data.userId, data);
      return { ...prev, presence: newPresence };
    });
  }, []);

  const startTyping = useCallback((conversationId: string) => {
    // Clear existing timeout
    const existingTimeout = typingTimeouts.current.get(conversationId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Update typing state
    setState(prev => {
      const newTypingUsers = new Map(prev.typingUsers);
      const users = newTypingUsers.get(conversationId) || [];
      if (!users.includes('currentUserId')) {
        users.push('currentUserId'); // Replace with actual user ID
      }
      newTypingUsers.set(conversationId, users);
      return { ...prev, typingUsers: newTypingUsers };
    });

    // Auto-stop typing after 3 seconds
    const timeout = setTimeout(() => {
      stopTyping(conversationId);
    }, 3000);
    typingTimeouts.current.set(conversationId, timeout);
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    // Clear timeout
    const existingTimeout = typingTimeouts.current.get(conversationId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      typingTimeouts.current.delete(conversationId);
    }

    // Update typing state
    setState(prev => {
      const newTypingUsers = new Map(prev.typingUsers);
      const users = newTypingUsers.get(conversationId) || [];
      const filtered = users.filter(id => id !== 'currentUserId'); // Replace with actual user ID
      if (filtered.length === 0) {
        newTypingUsers.delete(conversationId);
      } else {
        newTypingUsers.set(conversationId, filtered);
      }
      return { ...prev, typingUsers: newTypingUsers };
    });
  }, []);

  const subscribeToConversation = useCallback((conversationId: string) => {
    subscriptions.current.add(conversationId);
    
    // Return unsubscribe function
    return () => {
      unsubscribeFromConversation(conversationId);
    };
  }, []);

  const unsubscribeFromConversation = useCallback((conversationId: string) => {
    subscriptions.current.delete(conversationId);
    stopTyping(conversationId);
  }, [stopTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();
      subscriptions.current.clear();
    };
  }, []);

  return {
    ...state,
    updatePresence,
    startTyping,
    stopTyping,
    subscribeToConversation,
    unsubscribeFromConversation,
  };
}