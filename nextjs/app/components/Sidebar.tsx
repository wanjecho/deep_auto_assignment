'use client'

import { useState } from 'react'
import { ChatRoom } from '../types'
import { PlusIcon, MessageSquareIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react'

interface SidebarProps {
  chatRooms: ChatRoom[]
  selectedRoom: ChatRoom | null
  onSelectRoom: (room: ChatRoom) => void
  onNewChat: () => void
  onDeleteRoom: (roomId: string) => void
}

export default function Sidebar({
  chatRooms,
  selectedRoom,
  onSelectRoom,
  onNewChat,
  onDeleteRoom,
}: SidebarProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const handleDeleteRoom = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation()
    onDeleteRoom(roomId)
    setMenuOpenId(null)
  }

  const toggleMenu = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation()
    setMenuOpenId(menuOpenId === roomId ? null : roomId)
  }

  return (
    <div className="w-64 bg-chat-gray border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-3 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="text-sm font-medium">새 채팅</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {chatRooms.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquareIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">채팅 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {chatRooms.map((room) => (
              <div key={room.id} className="relative group">
                {/* 채팅방 아이템을 div로 변경하고 클릭 이벤트 직접 처리 */}
                <div
                  onClick={() => onSelectRoom(room)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-colors cursor-pointer ${
                    selectedRoom?.id === room.id
                      ? 'bg-gray-600 text-white'
                      : 'hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MessageSquareIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm truncate">{room.title}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(room.updated_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    
                    {/* 메뉴 버튼을 별도 div로 분리 */}
                    <div
                      onClick={(e) => toggleMenu(e, room.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-all cursor-pointer"
                    >
                      <MoreHorizontalIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Context Menu */}
                {menuOpenId === room.id && (
                  <div className="absolute right-2 top-12 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-32">
                    <button
                      onClick={(e) => handleDeleteRoom(e, room.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          DeepAuto Chatbot v1.0
        </div>
      </div>
    </div>
  )
} 