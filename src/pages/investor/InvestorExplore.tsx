import { Link } from 'react-router-dom';
import { TrendingUp, Coins, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

const API_BASE = '';

export default function InvestorExplore() {
  const { data: startups = [], isLoading } = useQuery({
    queryKey: ['startups-for-investor'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/startups`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-primary" />
          Explore Projects
        </h1>
        <p className="text-muted-foreground mt-1">
          Discover startups and projects to invest in or donate to. Web3 & crypto supported.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {startups.map((s: { id: number; name: string; description?: string; category?: string; stage?: string }) => (
            <div
              key={s.id}
              className="glass-card p-5 rounded-xl border border-border hover:border-primary/30 transition-colors"
            >
              <h3 className="font-semibold text-lg">{s.name}</h3>
              {s.category && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-medium">
                  {s.category}
                </span>
              )}
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {s.description || 'No description'}
              </p>
              <div className="flex gap-2 mt-4">
                <Link to={`/investor/fund?project=${s.id}&type=startup`}>
                  <Button size="sm" className="gap-1.5">
                    <Coins className="w-4 h-4" />
                    Fund / Donate
                  </Button>
                </Link>
                <Link to={`/startup/${s.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ExternalLink className="w-4 h-4" />
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && startups.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No projects available to invest in yet.</p>
          <p className="text-sm mt-1">Check back later or explore the LaunchPad for builders.</p>
        </div>
      )}
    </div>
  );
}
