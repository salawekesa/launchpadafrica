import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Hash, Trophy, Users, Send, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  apiGetRooms,
  apiJoinRoom,
  apiGetMessages,
  type Room,
  type Message,
} from '../services/community-api';
import { useCommunitySocket } from '../hooks/useCommunitySocket';

const API_BASE = '';

export function CommunityView() {
  const { isAuthenticated, user } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { connected, joinRoom, sendMessage, onMessage } = useCommunitySocket();

  const userId = user?.id ?? '';
  const userName = user?.name ?? null;

  // Fetch rooms (public + hackathon)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingRooms(true);
      try {
        const list = await apiGetRooms();
        if (!cancelled) setRooms(list);
      } catch (_) {
        if (!cancelled) setRooms([]);
      } finally {
        if (!cancelled) setLoadingRooms(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // When selecting a room: join, fetch history, subscribe to socket messages
  useEffect(() => {
    if (!selectedRoom || !userId) return;
    (async () => {
      setLoadingMessages(true);
      try {
        await apiJoinRoom(selectedRoom.id, userId);
        joinRoom(selectedRoom.id, userId, userName ?? undefined);
        const list = await apiGetMessages(selectedRoom.id, { limit: 50 });
        setMessages(list);
      } catch (_) {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    })();
  }, [selectedRoom?.id, userId, userName]);

  // Real-time: append messages from socket
  useEffect(() => {
    if (!selectedRoom) return;
    const unsub = onMessage((msg) => {
      if (msg.roomId === selectedRoom.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });
    return unsub;
  }, [selectedRoom?.id, onMessage]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !selectedRoom || !userId || sending) return;
    setSending(true);
    setInput('');
    try {
      sendMessage(selectedRoom.id, userId, userName, text);
      // Optimistic: message will appear via socket or we could add locally
    } catch (_) {
      setInput(text);
    } finally {
      setSending(false);
    }
  }, [input, selectedRoom, userId, userName, sending, sendMessage]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const publicRooms = rooms.filter((r) => r.type === 'public');
  const forumRooms = rooms.filter((r) => r.type === 'forum');
  const hackathonRooms = rooms.filter((r) => r.type === 'hackathon');

  return (
    <div className="container py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-[calc(100vh-8rem)] max-h-[700px] rounded-xl border bg-card overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h1 className="font-semibold text-lg">Community</h1>
          {connected && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Live
            </span>
          )}
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar: room list */}
          <aside className="w-64 border-r flex flex-col bg-muted/20">
            <ScrollArea className="flex-1">
              {loadingRooms ? (
                <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading rooms…
                </div>
              ) : (
                <div className="p-2 space-y-4">
                  {publicRooms.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <Users className="w-3.5 h-3.5" />
                        Public
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {publicRooms.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setSelectedRoom(r)}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                              selectedRoom?.id === r.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            )}
                          >
                            <Hash className="w-4 h-4 shrink-0" />
                            <span className="truncate">{r.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {forumRooms.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <MessageCircle className="w-3.5 h-3.5" />
                        Forums
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {forumRooms.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setSelectedRoom(r)}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                              selectedRoom?.id === r.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            )}
                          >
                            <Hash className="w-4 h-4 shrink-0" />
                            <span className="truncate">{r.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {hackathonRooms.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <Trophy className="w-3.5 h-3.5" />
                        Hackathons
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {hackathonRooms.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setSelectedRoom(r)}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                              selectedRoom?.id === r.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            )}
                          >
                            <Trophy className="w-4 h-4 shrink-0" />
                            <span className="truncate">{r.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {rooms.length === 0 && (
                    <div className="px-2 py-4 text-sm text-muted-foreground">
                      No rooms yet. Public and hackathon rooms will appear here.
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </aside>

          {/* Main: chat */}
          <main className="flex-1 flex flex-col min-w-0">
            {selectedRoom ? (
              <>
                <div className="px-4 py-2 border-b bg-muted/20">
                  <h2 className="font-medium truncate">{selectedRoom.name}</h2>
                  {selectedRoom.description && (
                    <p className="text-xs text-muted-foreground truncate">{selectedRoom.description}</p>
                  )}
                </div>
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  {loadingMessages ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading messages…
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={cn(
                            'flex flex-col max-w-[85%]',
                            m.userId === userId ? 'ml-auto items-end' : 'items-start'
                          )}
                        >
                          <span className="text-xs text-muted-foreground">
                            {m.userName || m.userId}
                          </span>
                          <div
                            className={cn(
                              'rounded-lg px-3 py-2 text-sm',
                              m.userId === userId
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            {m.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="p-3 border-t flex gap-2">
                  <Input
                    placeholder="Type a message…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="shrink-0"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select a room to start chatting</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </motion.div>
    </div>
  );
}
