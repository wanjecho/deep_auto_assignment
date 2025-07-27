'use client'

import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react'
import { ChatRoom, Message, StreamResponse } from '../types'
import MessageComponent from './Message'
import MessageInput from './MessageInput'
import EmptyState from './EmptyState'

interface ChatAreaProps {
  selectedRoom: ChatRoom | null
  messages: Message[]
  setMessages: Dispatch<SetStateAction<Message[]>>
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  onNewChat: () => void
  apiBaseUrl: string
}

export default function ChatArea({
  selectedRoom,
  messages,
  setMessages,
  isLoading,
  setIsLoading,
  onNewChat,
  apiBaseUrl,
}: ChatAreaProps) {
  const [streamingMessage, setStreamingMessage] = useState<{
    id: string
    content: string
    routing?: any
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  const sendMessage = async (content: string) => {
    if (!selectedRoom || isLoading) return

    setIsLoading(true)
    
    // 사용자 메시지 즉시 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      room_id: selectedRoom.id,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])

    try {
      console.log('Sending message to:', `${apiBaseUrl}/chat/rooms/${selectedRoom.id}/messages`)
      
      const response = await fetch(`${apiBaseUrl}/chat/rooms/${selectedRoom.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('No response body received')
      }

      // 스트리밍 응답 처리
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      let currentMessage = { id: '', content: '', routing: null as any }
      
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data: StreamResponse = JSON.parse(line.slice(6))
                
                if (data.type === 'content' && data.content && data.messageId) {
                  if (!currentMessage.id) {
                    currentMessage.id = data.messageId
                  }
                  currentMessage.content += data.content
                  setStreamingMessage({ ...currentMessage })
                } else if (data.type === 'routing' && data.routing) {
                  currentMessage.routing = data.routing
                  setStreamingMessage({ ...currentMessage })
                } else if (data.type === 'done') {
                  // 스트리밍 완료 - 최종 메시지 저장
                  if (currentMessage.content) {
                    const finalMessage: Message = {
                      id: currentMessage.id,
                      room_id: selectedRoom.id,
                      role: 'assistant',
                      content: currentMessage.content,
                      query_routing: currentMessage.routing ? JSON.stringify(currentMessage.routing) : undefined,
                      created_at: new Date().toISOString(),
                    }
                    setMessages(prev => [...prev, finalMessage])
                  }
                  setStreamingMessage(null)
                  break
                } else if (data.type === 'error') {
                  console.error('Server reported streaming error:', data.error)
                  setStreamingMessage(null)
                  // 에러 메시지를 사용자에게 표시
                  const errorMessage: Message = {
                    id: Date.now().toString(),
                    room_id: selectedRoom.id,
                    role: 'assistant',
                    content: `죄송합니다. 처리 중 오류가 발생했습니다: ${data.error}`,
                    created_at: new Date().toISOString(),
                  }
                  setMessages(prev => [...prev, errorMessage])
                  break
                }
              } catch (parseError) {
                console.error('Failed to parse SSE data:', parseError, 'Raw line:', line)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setStreamingMessage(null)
      
      // 에러 메시지를 사용자에게 표시
      const errorMessage: Message = {
        id: Date.now().toString(),
        room_id: selectedRoom.id,
        role: 'assistant',
        content: `죄송합니다. 연결 중 문제가 발생했습니다. 다시 시도해주세요. (${error instanceof Error ? error.message : '알 수 없는 오류'})`,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedRoom) {
    return <EmptyState onNewChat={onNewChat} />
  }

  return (
    <div className="flex-1 flex flex-col bg-chat-bg">
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-white">{selectedRoom.title}</h2>
        <p className="text-sm text-gray-400">
          {messages.length > 0 ? `${messages.length}개의 메시지` : '새로운 채팅'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <MessageComponent key={message.id} message={message} />
          ))}
          
          {/* Streaming Message */}
          {streamingMessage && (
            <MessageComponent
              message={{
                id: streamingMessage.id,
                room_id: selectedRoom.id,
                role: 'assistant',
                content: streamingMessage.content,
                query_routing: streamingMessage.routing ? JSON.stringify(streamingMessage.routing) : undefined,
                created_at: new Date().toISOString(),
              }}
              isStreaming={true}
            />
          )}
          
          {/* Loading indicator */}
          {isLoading && !streamingMessage && (
            <div className="chat-message">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-chat-green rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div className="typing-indicator">
                  <div className="typing-dot dot"></div>
                  <div className="typing-dot dot"></div>
                  <div className="typing-dot dot"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <MessageInput onSendMessage={sendMessage} disabled={isLoading} />
    </div>
  )
} 