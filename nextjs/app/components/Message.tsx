'use client'

import { Message, QueryRouting } from '../types'
import { UserIcon, BotIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { useState } from 'react'

interface MessageProps {
  message: Message
  isStreaming?: boolean
}

export default function MessageComponent({ message, isStreaming = false }: MessageProps) {
  const [showRouting, setShowRouting] = useState(false)
  
  const isUser = message.role === 'user'
  const routing: QueryRouting | null = message.query_routing 
    ? JSON.parse(message.query_routing) 
    : null

  return (
    <div className={`chat-message ${isUser ? 'bg-transparent' : 'bg-gray-800/50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser ? 'bg-blue-600' : 'bg-chat-green'
          }`}>
            {isUser ? (
              <UserIcon className="w-5 h-5 text-white" />
            ) : (
              <BotIcon className="w-5 h-5 text-white" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-white">
                {isUser ? 'You' : 'Assistant'}
              </span>
              {routing && (
                <span className="model-badge">
                  {routing.selected_model}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {new Date(message.created_at).toLocaleTimeString('ko-KR')}
              </span>
            </div>
            
            {/* Message Content */}
            <div className={`message-content text-gray-100 ${isStreaming ? 'fade-in' : ''}`}>
              <div className="whitespace-pre-wrap break-words">
                {message.content}
                {isStreaming && (
                  <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse" />
                )}
              </div>
            </div>

            {/* Routing Info */}
            {routing && routing.candidates && routing.candidates.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowRouting(!showRouting)}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <span>모델 라우팅 정보</span>
                  {showRouting ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
                
                {showRouting && (
                  <div className="mt-2 p-3 bg-gray-700 rounded-lg">
                    <div className="text-sm mb-2">
                      <span className="text-gray-300">선택된 모델: </span>
                      <span className="text-blue-400 font-mono">{routing.selected_model}</span>
                    </div>
                    <div className="text-sm text-gray-300 mb-2">후보 모델 점수:</div>
                    <div className="space-y-1">
                      {routing.candidates.map((candidate, index) => (
                        <div key={index} className="routing-score">
                          <span className="font-mono text-sm">{candidate.model}</span>
                          <span className="text-blue-400 font-mono">
                            {candidate.score.toFixed(4)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 