import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Coins, Wallet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_BASE = '';

export default function InvestorFund() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const projectType = searchParams.get('type') || 'startup';
  const { user, isAuthenticated } = useAuthStore();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('ETH');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user?.id) {
      setMessage({ type: 'error', text: 'Please log in to fund projects.' });
      return;
    }
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid amount.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/investor/invest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investor_id: parseInt(user.id, 10),
          entity_type: projectType,
          entity_id: String(projectId || ''),
          amount: num,
          currency,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: data.error || 'Failed to record investment.' });
        return;
      }
      setMessage({ type: 'success', text: 'Investment recorded. Funds go to the project wallet.' });
      setAmount('');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-6">
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connect to fund</h2>
          <p className="text-muted-foreground text-sm">Log in and complete KYC to invest or donate.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Coins className="w-7 h-7 text-primary" />
          Fund / Donate
        </h1>
        <p className="text-muted-foreground mt-1">
          Invest or donate to projects. Funds go to the project wallet (crypto / Web3).
        </p>
      </div>

      <div className="max-w-md glass-card p-6 rounded-xl">
        <form onSubmit={handleDonate} className="space-y-4">
          {projectId && (
            <p className="text-sm text-muted-foreground">
              Project: {projectType} #{projectId}
            </p>
          )}
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
              <option value="MATIC">MATIC</option>
            </select>
          </div>
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                message.type === 'success' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
              }`}
            >
              {message.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
              {message.text}
            </div>
          )}
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <Coins className="w-4 h-4" />
            {loading ? 'Processing…' : 'Fund project'}
          </Button>
        </form>
      </div>
    </div>
  );
}
