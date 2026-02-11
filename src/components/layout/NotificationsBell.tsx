import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const API_BASE = '';

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  data?: { invitationId?: string; hackathonId?: string };
  readAt: string | null;
  createdAt: string;
}

export function NotificationsBell({ userId, userIdStr }: { userId: number; userIdStr: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [responding, setResponding] = useState<number | null>(null);
  const fetched = useRef(false);

  const fetchList = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/notifications?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setList(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !fetched.current) {
      fetched.current = true;
      fetchList();
    }
    if (!open) fetched.current = false;
  }, [open, userId]);

  const unreadCount = list.filter((n) => !n.readAt).length;

  const markRead = async (id: number) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read?userId=${userId}`, { method: 'PUT' });
      setList((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    } catch (_) {}
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_BASE}/api/notifications/read-all?userId=${userId}`, { method: 'PUT' });
      setList((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    } catch (_) {}
  };

  const respondToInvite = async (n: Notification, status: 'accepted' | 'declined') => {
    const hackathonId = n.data?.hackathonId;
    const invitationId = n.data?.invitationId;
    if (!hackathonId || !invitationId) return;
    setResponding(n.id);
    try {
      const res = await fetch(
        `${API_BASE}/api/hackathons/${encodeURIComponent(hackathonId)}/invitations/${encodeURIComponent(invitationId)}/respond`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, userId: userIdStr }),
        }
      );
      if (res.ok) {
        await markRead(n.id);
        setList((prev) => prev.filter((x) => x.id !== n.id));
        setOpen(false);
        if (status === 'accepted') {
          navigate(`/hackathon/${hackathonId}`);
        }
      }
    } finally {
      setResponding(null);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5 border-b">
          <span className="font-medium text-sm">Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="h-[280px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading…</div>
          ) : list.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            list.map((n) =>
              n.type === 'hackathon_invite' && n.data?.invitationId && n.data?.hackathonId ? (
                <div
                  key={n.id}
                  className={cn(
                    'border-b last:border-b-0 px-3 py-2.5',
                    !n.readAt && 'bg-primary/5'
                  )}
                >
                  <div className="font-medium text-sm">{n.title}</div>
                  {n.body && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</div>}
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-xs gap-1"
                      disabled={responding === n.id}
                      onClick={() => respondToInvite(n, 'accepted')}
                    >
                      <Check className="w-3 h-3" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      disabled={responding === n.id}
                      onClick={() => respondToInvite(n, 'declined')}
                    >
                      <X className="w-3 h-3" />
                      Reject
                    </Button>
                  </div>
                </div>
              ) : (
                <DropdownMenuItem
                  key={n.id}
                  asChild
                  className={cn('cursor-pointer', !n.readAt && 'bg-primary/5')}
                  onSelect={() => {
                    markRead(n.id);
                    setOpen(false);
                  }}
                >
                  {n.link ? (
                    <Link to={n.link} className="block w-full py-2 px-2">
                      <div className="font-medium text-sm">{n.title}</div>
                      {n.body && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</div>}
                    </Link>
                  ) : (
                    <div className="block w-full py-2 px-2">
                      <div className="font-medium text-sm">{n.title}</div>
                      {n.body && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</div>}
                    </div>
                  )}
                </DropdownMenuItem>
              )
            )
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
