import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useHackathonStore } from '../services/hackathon-store';
import { Scoreboard } from '../components/Scoreboard';
import { AwardsPanel } from '../components/AwardsPanel';
import { ArrowLeft } from 'lucide-react';

/** Public scoreboard view for a hackathon (no manage actions). */
export function HackathonScoreboard() {
  const { id } = useParams<{ id: string }>();
  const { getHackathonById, loadHackathonById, getScoreboard, getAwards, isLoading } = useHackathonStore();

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
        <p className="text-muted-foreground">Loading scoreboard...</p>
      </div>
    );
  }
  if (!hackathon) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Hackathon not found.</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/hackathons">Back to Hackathons</Link>
        </Button>
      </div>
    );
  }

  const scoreboard = getScoreboard(hackathon.id);
  const awards = getAwards(hackathon.id);

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
      <h1 className="text-2xl font-bold mb-2">{hackathon.name} – Scoreboard</h1>
      <p className="text-muted-foreground mb-8">Live rankings and awards.</p>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Scoreboard
            hackathonId={hackathon.id}
            hackathonName={hackathon.name}
            scores={scoreboard}
          />
        </div>
        <div>
          <AwardsPanel hackathonId={hackathon.id} awards={awards} />
        </div>
      </div>
    </div>
  );
}
