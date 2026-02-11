/**
 * Socket.io client for real-time community chat.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message } from '../services/community-api';

const SOCKET_BASE = '';

export function useCommunitySocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_BASE, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, []);

  const joinRoom = useCallback((roomId: string, userId: string, userName?: string) => {
    socketRef.current?.emit('join_room', { roomId, userId, userName });
  }, []);

  const sendMessage = useCallback((roomId: string, userId: string, userName: string | null, content: string) => {
    socketRef.current?.emit('message', { roomId, userId, userName, content });
  }, []);

  const onMessage = useCallback((cb: (msg: Message) => void) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on('message', cb);
    return () => {
      socketRef.current?.off('message', cb);
    };
  }, []);

  return { connected, joinRoom, sendMessage, onMessage };
}
