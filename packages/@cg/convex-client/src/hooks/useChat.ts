import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useState, useCallback, useEffect } from 'react';
import type { Id } from '../../../../convex/_generated/dataModel';

interface ChatState {
  conversations: any[];
  activeConversation: any | null;
  messages: any[];
  isLoading: boolean;
  error: Error | null;
  typingUsers: string[];
}

interface ChatActions {
  sendMessage: (content: string, conversationId?: Id<'conversations'>) => Promise<void>;
  createConversation: (participantIds: string[]) => Promise<Id<'conversations'>>;
  deleteMessage: (messageId: Id<'messages'>) => Promise<void>;
  editMessage: (messageId: Id<'messages'>, content: string) => Promise<void>;
  markAsRead: (conversationId: Id<'conversations'>) => Promise<void>;
  setTyping: (isTyping: boolean) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
}

export function useChat(conversationId?: Id<'conversations'>): ChatState & ChatActions {
  const [chatState, setChatState] = useState<ChatState>({
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoading: true,
    error: null,
    typingUsers: [],
  });

  const [messageOffset, setMessageOffset] = useState(0);
  const MESSAGE_LIMIT = 50;

  // Convex queries
  const conversations = useQuery(api.conversations.list);
  const conversation = useQuery(
    api.conversations.get,
    conversationId ? { id: conversationId } : 'skip'
  );
  const messages = useQuery(
    api.messages.list,
    conversationId ? { 
      conversationId
    } : 'skip'
  );

  // Convex mutations
  const sendMessageMutation = useMutation(api.messages.send);
  const createConversationMutation = useMutation(api.conversations.create);
  const deleteMessageMutation = useMutation(api.messages.deleteMessage);
  const editMessageMutation = useMutation(api.messages.edit);
  const markAsReadMutation = useMutation(api.conversations.markAsRead);

  // Update chat state when data changes
  useEffect(() => {
    setChatState(prev => ({
      ...prev,
      conversations: conversations || [],
      activeConversation: conversation || null,
      messages: messages || [],
      isLoading: conversations === undefined || (conversationId ? messages === undefined : false),
      error: null,
    }));
  }, [conversations, conversation, messages, conversationId]);

  const sendMessage = useCallback(async (content: string, targetConversationId?: Id<'conversations'>) => {
    const convId = targetConversationId || conversationId;
    if (!convId) {
      throw new Error('No conversation selected');
    }

    try {
      await sendMessageMutation({
        conversationId: convId,
        content,
        role: 'user' as const,
      });
    } catch (error) {
      setChatState(prev => ({ ...prev, error: error as Error }));
      throw error;
    }
  }, [sendMessageMutation, conversationId]);

  const createConversation = useCallback(async (participantIds: string[]) => {
    try {
      // For now, just use the first participant as userId
      const userId = participantIds[0] as Id<'users'>;
      const id = await createConversationMutation({ 
        userId,
        channel: 'web' as const,
      });
      return id;
    } catch (error) {
      setChatState(prev => ({ ...prev, error: error as Error }));
      throw error;
    }
  }, [createConversationMutation]);

  const deleteMessage = useCallback(async (messageId: Id<'messages'>) => {
    try {
      await deleteMessageMutation({ id: messageId });
    } catch (error) {
      setChatState(prev => ({ ...prev, error: error as Error }));
      throw error;
    }
  }, [deleteMessageMutation]);

  const editMessage = useCallback(async (messageId: Id<'messages'>, content: string) => {
    try {
      await editMessageMutation({ id: messageId, content });
    } catch (error) {
      setChatState(prev => ({ ...prev, error: error as Error }));
      throw error;
    }
  }, [editMessageMutation]);

  const markAsRead = useCallback(async (targetConversationId: Id<'conversations'>) => {
    try {
      await markAsReadMutation({ id: targetConversationId });
    } catch (error) {
      setChatState(prev => ({ ...prev, error: error as Error }));
      throw error;
    }
  }, [markAsReadMutation]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    // This would trigger a realtime typing indicator
    // Implementation depends on your backend setup
    console.log('Typing:', isTyping);
  }, []);

  const loadMoreMessages = useCallback(async () => {
    setMessageOffset(prev => prev + MESSAGE_LIMIT);
  }, []);

  return {
    ...chatState,
    sendMessage,
    createConversation,
    deleteMessage,
    editMessage,
    markAsRead,
    setTyping,
    loadMoreMessages,
  };
}