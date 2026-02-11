import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import type { ProjectScoreSummary } from '../types';

interface ScoreboardProps {
  hackathonId: string;
  hackathonName: string;
  scores: ProjectScoreSummary[];
  showRank?: boolean;
}

function getRankBadge(rank: number) {
  if (rank === 1) return { icon: Trophy, label: '1st', className: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/40' };
  if (rank === 2) return { icon: Medal, label: '2nd', className: 'bg-slate-400/20 text-slate-600 dark:text-slate-300 border-slate-400/40' };
  if (rank === 3) return { icon: Award, label: '3rd', className: 'bg-amber-600/20 text-amber-700 dark:text-amber-400 border-amber-600/40' };
  if (rank <= 10) return { icon: Star, label: `#${rank}`, className: 'bg-primary/10 text-primary border-primary/30' };
  return null;
}

export function Scoreboard({
  hackathonId,
  hackathonName,
  scores,
  showRank = true,
}: ScoreboardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return (
      <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
        {rank}
      </span>
    );
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Scoreboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Rankings based on judge scores. Updates as judges submit scores.
        </p>
      </CardHeader>
      <CardContent>
        {scores.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No scores yet. Judges can submit scores during the judging phase.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {showRank && <TableHead className="w-16">Rank</TableHead>}
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Avg score</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Votes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((row, index) => {
                const rank = row.rank ?? index + 1;
                const badge = getRankBadge(rank);
                const BadgeIcon = badge?.icon;
                return (
                  <TableRow key={row.projectId} className={rank <= 3 ? 'bg-muted/30' : ''}>
                    {showRank && (
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getRankIcon(rank)}
                          {badge && (
                            <Badge variant="outline" className={badge.className}>
                              {BadgeIcon && <BadgeIcon className="w-3 h-3 mr-1" />}
                              {badge.label}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="font-medium">{row.projectName}</TableCell>
                    <TableCell className="text-right">{row.averageScore}</TableCell>
                    <TableCell className="text-right">{row.totalScore}</TableCell>
                    <TableCell className="text-right">{row.scoreCount}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
