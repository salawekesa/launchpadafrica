import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award } from 'lucide-react';
import type { HackathonAward } from '../types';

interface AwardsPanelProps {
  hackathonId: string;
  awards: HackathonAward[];
  isHost?: boolean;
  onAssignWinner?: (awardId: string, projectId: string, projectName: string) => void;
}

export function AwardsPanel({
  hackathonId,
  awards,
  isHost = false,
  onAssignWinner,
}: AwardsPanelProps) {
  if (awards.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Awards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No awards configured for this hackathon.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Awards & Prizes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Winners can be assigned after judging. Prizes are displayed to participants.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {awards
            .sort((a, b) => a.rank - b.rank)
            .map((award) => (
              <li
                key={award.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  award.projectId
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-muted/30'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                    award.rank === 1
                      ? 'bg-yellow-500/20 text-yellow-600'
                      : award.rank === 2
                        ? 'bg-gray-400/20 text-gray-600'
                        : award.rank === 3
                          ? 'bg-amber-600/20 text-amber-700'
                          : 'bg-muted text-muted-foreground'
                  }`}
                >
                  #{award.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{award.name}</div>
                  <div className="text-sm text-muted-foreground">{award.prize}</div>
                  {award.projectName && (
                    <Badge variant="secondary" className="mt-2">
                      Winner: {award.projectName}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </CardContent>
    </Card>
  );
}
