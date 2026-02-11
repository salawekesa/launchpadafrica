import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, UserCheck } from 'lucide-react';
import type { HackathonInvitation, HackathonInviteRole } from '../types';

interface InviteParticipantsProps {
  hackathonId: string;
  hackathonName: string;
  invitations: HackathonInvitation[];
  onInvite: (email: string, role: HackathonInviteRole) => void;
  isHost?: boolean;
}

export function InviteParticipants({
  hackathonId,
  hackathonName,
  invitations,
  onInvite,
  isHost = true,
}: InviteParticipantsProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<HackathonInviteRole>('participant');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onInvite(email.trim(), role);
    setEmail('');
  };

  const pending = invitations.filter((i) => i.status === 'pending');
  const accepted = invitations.filter((i) => i.status === 'accepted');

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Invite participants & judges
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Send invites by email. They can join as a participant or judge.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {isHost && (
          <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-[140px] space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as HackathonInviteRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participant">Participant</SelectItem>
                  <SelectItem value="judge">Judge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="default">
              Send invite
            </Button>
          </form>
        )}

        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Invitations ({invitations.length})
          </h4>
          {invitations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invitations yet.</p>
          ) : (
            <ul className="space-y-2">
              {invitations.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-muted/50 text-sm"
                >
                  <span className="truncate">{inv.email}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {inv.role}
                    </Badge>
                    <Badge
                      variant={inv.status === 'accepted' ? 'default' : inv.status === 'declined' ? 'destructive' : 'outline'}
                    >
                      {inv.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
