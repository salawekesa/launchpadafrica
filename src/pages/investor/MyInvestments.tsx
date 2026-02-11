import { Wallet, Coins } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';

const API_BASE = '';

export default function MyInvestments() {
  const { user, isAuthenticated } = useAuthStore();
  const { data: investments = [], isLoading } = useQuery({
    queryKey: ['my-investments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`${API_BASE}/api/investor/my-investments?userId=${user.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!isAuthenticated && !!user?.id,
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-6">
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Log in to see investments</h2>
          <p className="text-muted-foreground text-sm">Your investments and donations will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-7 h-7 text-primary" />
          My Investments
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your investments and donations to projects.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : investments.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Coins className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No investments yet.</p>
          <p className="text-sm mt-1">Explore projects and fund them from the Investor menu.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {investments.map((inv: { id: number; amount: string; currency: string; status: string; created_at: string; project_wallet_id?: number }) => (
            <div key={inv.id} className="glass-card p-4 rounded-xl border border-border flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="font-semibold">{inv.amount} {inv.currency}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {new Date(inv.created_at).toLocaleDateString()}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                inv.status === 'confirmed' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
              }`}>
                {inv.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
