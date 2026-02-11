import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Users,
  UserCheck,
  Trophy,
  LayoutDashboard,
  Mail,
  Award,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { useHackathonStore } from '../services/hackathon-store';
import { useAuthStore } from '@/store/auth-store';
import { InviteParticipants } from '../components/InviteParticipants';
import { Scoreboard } from '../components/Scoreboard';
import { AwardsPanel } from '../components/AwardsPanel';
import { JudgeScoreForm } from '../components/JudgeScoreForm';
import { format } from 'date-fns';

export function HackathonManage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    getHackathonById,
    loadHackathonById,
    getInvitations,
    getParticipants,
    getJudges,
    getAwards,
    getCriteria,
    getScoreboard,
    getScoresByHackathon,
    invite,
    addJudge,
    submitScore,
    finalizeWinners,
    isLoading,
    error,
  } = useHackathonStore();

  useEffect(() => {
    if (id) loadHackathonById(id);
  }, [id, loadHackathonById]);

  const hackathon = id ? getHackathonById(id) : undefined;
  if (!id) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Invalid hackathon.</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/hackathons">Back to Hackathons</Link>
        </Button>
      </div>
    );
  }
  if (isLoading && !hackathon) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Loading hackathon...</p>
      </div>
    );
  }
  if (!hackathon) {
    return (
      <div className="container py-8">
        {error && <p className="text-destructive text-sm mb-4">{error}</p>}
        <p className="text-muted-foreground">Hackathon not found.</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/hackathons">Back to Hackathons</Link>
        </Button>
      </div>
    );
  }

  const invitations = getInvitations(hackathon.id);
  const participants = getParticipants(hackathon.id);
  const judges = getJudges(hackathon.id);
  const awards = getAwards(hackathon.id);
  const criteria = getCriteria(hackathon.id);
  const scoreboardData = getScoreboard(hackathon.id);
  const allScores = getScoresByHackathon(hackathon.id);
  const isHost = user?.id === hackathon.hostId;
  const currentJudge = judges.find((j) => j.userId === user?.id);
  const judgeScores = currentJudge
    ? allScores
        .filter((s) => s.judgeId === currentJudge.id)
        .map((s) => ({ projectId: s.projectId, criterionId: s.criterionId, score: s.score }))
    : [];

  const [inviteLoading, setInviteLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const handleFinalizeWinners = async () => {
    if (!id) return;
    setFinalizing(true);
    try {
      await finalizeWinners(id);
      if (id) loadHackathonById(id);
    } finally {
      setFinalizing(false);
    }
  };
  const handleInvite = async (email: string, role: 'participant' | 'judge') => {
    setInviteLoading(true);
    try {
      await invite({
        hackathonId: hackathon.id,
        email,
        role,
        invitedBy: user?.id ?? '',
      });
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to={`/hackathon/${hackathon.id}`}>
            <ArrowLeft className="w-4 h-4" />
            Back to hackathon
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{hackathon.name}</h1>
          <Badge variant={hackathon.status === 'active' ? 'default' : 'secondary'}>
            {hackathon.status}
          </Badge>
        </div>
        <p className="text-muted-foreground">{hackathon.description}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {format(new Date(hackathon.startDate), 'MMM d')} – {format(new Date(hackathon.endDate), 'MMM d, yyyy')} · {hackathon.location}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="participants" className="gap-2">
            <Users className="w-4 h-4" />
            Participants ({participants.length})
          </TabsTrigger>
          <TabsTrigger value="invite" className="gap-2">
            <Mail className="w-4 h-4" />
            Invite
          </TabsTrigger>
          <TabsTrigger value="judges" className="gap-2">
            <UserCheck className="w-4 h-4" />
            Judges ({judges.length})
          </TabsTrigger>
          <TabsTrigger value="awards" className="gap-2">
            <Award className="w-4 h-4" />
            Awards
          </TabsTrigger>
          <TabsTrigger value="scoreboard" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Scoreboard
          </TabsTrigger>
          {currentJudge && (
            <TabsTrigger value="judge" className="gap-2">
              Submit scores
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">Quick stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participants</span>
                  <span className="font-medium">{participants.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Judges</span>
                  <span className="font-medium">{judges.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Awards</span>
                  <span className="font-medium">{awards.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invitations</span>
                  <span className="font-medium">{invitations.length}</span>
                </div>
              </CardContent>
            </Card>
            <AwardsPanel hackathonId={hackathon.id} awards={awards} isHost={isHost} />
          </div>
        </TabsContent>

        <TabsContent value="participants">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Participants</CardTitle>
              <p className="text-sm text-muted-foreground">Teams and projects registered for this hackathon.</p>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <p className="text-muted-foreground text-sm">No participants yet. Use the Invite tab to send invites.</p>
              ) : (
                <ul className="space-y-2">
                  {participants.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 text-sm"
                    >
                      <span className="font-medium">{p.projectName ?? p.teamName ?? 'Team'}</span>
                      <Badge variant={p.status === 'submitted' ? 'default' : 'secondary'}>{p.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invite">
          <InviteParticipants
            hackathonId={hackathon.id}
            hackathonName={hackathon.name}
            invitations={invitations}
            onInvite={handleInvite}
            isHost={isHost}
          />
        </TabsContent>

        <TabsContent value="judges">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Judges</CardTitle>
              <p className="text-sm text-muted-foreground">People who can score projects. Invite them from the Invite tab with role &quot;Judge&quot;.</p>
            </CardHeader>
            <CardContent>
              {judges.length === 0 ? (
                <p className="text-muted-foreground text-sm">No judges yet.</p>
              ) : (
                <ul className="space-y-2">
                  {judges.map((j) => (
                    <li key={j.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 text-sm">
                      <span>{j.name}</span>
                      <span className="text-muted-foreground text-xs">{j.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awards">
          <AwardsPanel hackathonId={hackathon.id} awards={awards} isHost={isHost} />
        </TabsContent>

        <TabsContent value="scoreboard">
          {isHost && (hackathon.status === 'judging' || hackathon.status === 'active') && scoreboardData.length > 0 && (
            <Card className="glass-card mb-6 border-primary/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Automated judging complete
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Finalize winners from the current scoreboard. Top projects will be assigned to awards by rank. This will mark the hackathon as completed.
                </p>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleFinalizeWinners}
                  disabled={finalizing || scoreboardData.length === 0}
                  className="gap-2"
                >
                  {finalizing ? 'Finalizing…' : 'Finalize winners'}
                </Button>
              </CardContent>
            </Card>
          )}
          <Scoreboard
            hackathonId={hackathon.id}
            hackathonName={hackathon.name}
            scores={scoreboardData}
          />
        </TabsContent>

        {currentJudge && (
          <TabsContent value="judge">
            <JudgeScoreForm
              hackathonId={hackathon.id}
              judgeId={currentJudge.id}
              criteria={criteria}
              participants={participants}
              onSubmitScore={async (input) => submitScore(input)}
              existingScores={judgeScores}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
