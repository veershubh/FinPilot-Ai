// src/types/ai-assistant.ts

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIConversationInsert {
  title?: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AIMessageInsert {
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatRequest {
  conversationId: string;
  message: string;
}
