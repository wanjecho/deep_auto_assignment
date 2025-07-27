'use client'

import { MessageSquareIcon, PlusIcon, BotIcon } from 'lucide-react'

interface EmptyStateProps {
  onNewChat: () => void
}

export default function EmptyState({ onNewChat }: EmptyStateProps) {
  const examples = [
    "Python으로 웹 크롤링하는 방법을 알려주세요",
    "React에서 상태 관리 라이브러리를 비교해주세요",
    "데이터베이스 정규화에 대해 설명해주세요",
    "머신러닝 모델을 배포하는 방법을 알려주세요"
  ]

  return (
    <div className="flex-1 bg-chat-bg flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-chat-green rounded-full flex items-center justify-center mx-auto mb-4">
            <BotIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DeepAuto Chatbot</h1>
          <p className="text-gray-400">
            AI 어시스턴트와 대화를 시작해보세요
          </p>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="mb-8 px-6 py-3 bg-chat-green hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
        >
          <PlusIcon className="w-5 h-5" />
          새 채팅 시작
        </button>

        {/* Example Prompts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                onNewChat()
                // 예제 메시지를 입력 필드에 설정하는 로직을 여기서 구현할 수 있습니다
              }}
              className="p-4 text-left bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors group"
            >
              <div className="flex items-start gap-3">
                <MessageSquareIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-300 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300 group-hover:text-white">
                  {example}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-400">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <BotIcon className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-medium text-gray-300 mb-1">실시간 스트리밍</h3>
            <p>AI 응답을 실시간으로 확인할 수 있습니다</p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquareIcon className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-medium text-gray-300 mb-1">대화 기록 저장</h3>
            <p>모든 대화가 자동으로 저장됩니다</p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <h3 className="font-medium text-gray-300 mb-1">모델 라우팅</h3>
            <p>최적의 AI 모델이 자동 선택됩니다</p>
          </div>
        </div>
      </div>
    </div>
  )
} 