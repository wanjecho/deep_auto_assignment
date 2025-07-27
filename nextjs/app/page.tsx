'use client'

import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import { ChatRoom, Message } from './types'

// 환경변수나 다른 포트 사용시 여기서 변경
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

console.log('API Base URL:', API_BASE_URL)  // 디버깅용

export default function Home() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  useEffect(() => {
    // 초기 채팅방 목록 로드
    loadChatRooms()
  }, [])

  const loadChatRooms = async () => {
    try {
      console.log('Attempting to fetch from:', `${API_BASE_URL}/chat/rooms`)
      const response = await fetch(`${API_BASE_URL}/chat/rooms`)
      if (response.ok) {
        const rooms = await response.json()
        setChatRooms(rooms)
        setConnectionError(null)
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to load chat rooms:', error)
      setConnectionError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
    }
  }

  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/messages`)
      if (response.ok) {
        const messages = await response.json()
        setMessages(messages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const createNewChat = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
        method: 'POST',
      })
      if (response.ok) {
        const newRoom = await response.json()
        setChatRooms(prev => [newRoom, ...prev])
        setSelectedRoom(newRoom)
        setMessages([])
        setConnectionError(null)
      }
    } catch (error) {
      console.error('Failed to create new chat:', error)
      setConnectionError('새 채팅을 생성할 수 없습니다.')
    }
  }

  const selectRoom = (room: ChatRoom) => {
    setSelectedRoom(room)
    loadMessages(room.id)
  }

  const deleteRoom = async (roomId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setChatRooms(prev => prev.filter(room => room.id !== roomId))
        if (selectedRoom?.id === roomId) {
          setSelectedRoom(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Failed to delete chat room:', error)
    }
  }

  return (
    <main className="flex h-screen bg-chat-dark">
      {connectionError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg z-50">
          {connectionError}
          <button 
            onClick={loadChatRooms}
            className="ml-4 px-2 py-1 bg-red-700 rounded hover:bg-red-800"
          >
            재시도
          </button>
        </div>
      )}
      <Sidebar
        chatRooms={chatRooms}
        selectedRoom={selectedRoom}
        onSelectRoom={selectRoom}
        onNewChat={createNewChat}
        onDeleteRoom={deleteRoom}
      />
      <ChatArea
        selectedRoom={selectedRoom}
        messages={messages}
        setMessages={setMessages}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onNewChat={createNewChat}
        apiBaseUrl={API_BASE_URL}
      />
    </main>
  )
} 