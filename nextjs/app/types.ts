export interface ChatRoom {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  room_id: string
  role: 'user' | 'assistant'
  content: string
  query_routing?: string
  created_at: string
}

export interface StreamResponse {
  type: 'content' | 'routing' | 'done' | 'error'
  content?: string
  routing?: QueryRouting
  error?: string
  messageId?: string
}

export interface QueryRouting {
  selected_model: string
  candidates: {
    model: string
    score: number
  }[]
}

export interface ChatRequest {
  content: string
} 