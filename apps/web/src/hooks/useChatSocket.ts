'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface UseChatSocketOptions {
  onMessage?: (msg: any) => void
  onTyping?: (data: { userId: string; isTyping: boolean }) => void
}

export function useChatSocket({ onMessage, onTyping }: UseChatSocketOptions) {
  const { data: session } = useSession()
  const socketRef    = useRef<Socket | null>(null)
  const callbacksRef = useRef({ onMessage, onTyping })
  callbacksRef.current = { onMessage, onTyping }

  useEffect(() => {
    const token = (session as any)?.accessToken as string | undefined
    if (!token) return

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
    })

    socket.on('new_message', (msg) => callbacksRef.current.onMessage?.(msg))
    socket.on('typing',      (data) => callbacksRef.current.onTyping?.(data))

    socketRef.current = socket
    return () => { socket.disconnect(); socketRef.current = null }
  }, [(session as any)?.accessToken])

  return {
    sendMessage: (receiverId: string, content: string) => {
      socketRef.current?.emit('send_message', { receiverId, content })
    },
    sendTyping: (receiverId: string, isTyping: boolean) => {
      socketRef.current?.emit('typing', { receiverId, isTyping })
    },
    isConnected: () => socketRef.current?.connected ?? false,
  }
}
