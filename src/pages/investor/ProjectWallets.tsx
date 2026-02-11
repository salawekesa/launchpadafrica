import { Wallet, Copy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const API_BASE = '';

export default function ProjectWallets() {
  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ['project-wallets'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/investor/project-wallets`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
  };

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-7 h-7 text-primary" />
          Project Wallets
        </h1>
        <p className="text-muted-foreground mt-1">
          Wallets where project funds are deposited. Investors and donors send crypto here.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No project wallets yet.</p>
          <p className="text-sm mt-1">Wallets are created when projects are set up for funding.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {wallets.map((w: { id: number; entity_type: string; entity_id: string; wallet_address: string; network: string }) => (
            <div key={w.id} className="glass-card p-5 rounded-xl border border-border">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-medium">
                  {w.entity_type} #{w.entity_id}
                </span>
                <span className="text-xs text-muted-foreground">{w.network}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-sm bg-muted/50 px-3 py-2 rounded-lg truncate">
                <span className="truncate">{w.wallet_address}</span>
                <button
                  type="button"
                  onClick={() => copyAddress(w.wallet_address)}
                  className="shrink-0 p-1 rounded hover:bg-muted"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
