import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Trophy, Users, MapPin, Calendar,
  Wallet, Globe, CheckCircle2, Edit, Camera,
  Briefcase, Sparkles, Lock, Link2Off
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth-store';
import { format } from 'date-fns';
import { connectMetaMask, isMetaMaskAvailable } from '@/lib/metamask';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Profile() {
  const { user, isAuthenticated, setUser, setActiveProfile, activeProfile } = useAuthStore();
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);
  const kycComplete = user?.verificationLevel === 'level2';
  const hasMetaMask = isMetaMaskAvailable();
  const [kycForm, setKycForm] = useState({
    fullName: '',
    idType: 'national_id',
    idNumber: '',
    address: '',
  });

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const winRate = user.hackathonsAttended.length > 0
    ? Math.round((user.hackathonsWon.length / user.hackathonsAttended.length) * 100)
    : 0;

  return (
    <div className="container py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div variants={fadeUp} className="mb-8">
          <div className="glass-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary">
                  {user.name.charAt(0)}
                </div>
                <button className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-4 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
                  <div className="flex gap-2">
                    {user.verificationLevel !== 'unverified' && (
                      <span className="verified-badge">
                        <Shield className="w-3 h-3" />
                        {user.verificationLevel === 'level2' ? 'Verified L2' : 'Verified L1'}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-medium capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">{user.bio || 'No bio added yet'}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {user.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {format(new Date(user.createdAt), 'MMM yyyy')}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Edit className="w-4 h-4" />
                <Button variant="outline" className="gap-2">Edit Profile</Button>
                {/* Builder / Investor switcher – Investor only when KYC complete */}
                <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveProfile('builder')}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeProfile === 'builder'
                        ? 'bg-background text-foreground shadow'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 inline-block mr-1.5 align-middle" />
                    Builder
                  </button>
                  <button
                    type="button"
                    onClick={() => kycComplete && setActiveProfile('investor')}
                    disabled={!kycComplete}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      activeProfile === 'investor'
                        ? 'bg-background text-foreground shadow'
                        : kycComplete
                          ? 'text-muted-foreground hover:text-foreground'
                          : 'cursor-not-allowed opacity-60 text-muted-foreground'
                    }`}
                    title={!kycComplete ? 'Complete KYC to unlock Investor menu' : undefined}
                  >
                    {!kycComplete && <Lock className="w-4 h-4 inline-block mr-1.5 align-middle" />}
                    <Sparkles className="w-4 h-4 inline-block mr-1.5 align-middle" />
                    Investor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={Trophy} value={user.hackathonsWon.length} label="Hackathons Won" />
              <StatCard icon={Users} value={user.hackathonsAttended.length} label="Participated" />
              <StatCard icon={CheckCircle2} value={`${winRate}%`} label="Win Rate" highlight />
              <StatCard icon={Globe} value={user.collaborations.length} label="Collaborations" />
            </div>

            <section className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Collaborations
              </h2>

              {user.collaborations.length > 0 ? (
                <div className="space-y-4">
                  {user.collaborations.map((collab, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl border border-border"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-medium">{collab.projectName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {collab.teamMembers.length} team members
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          collab.result === 'win'
                            ? 'bg-success/15 text-success'
                            : collab.result === 'loss'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-primary/15 text-primary'
                        }`}>
                          {collab.result === 'win' ? 'Winner' : collab.result === 'loss' ? 'Participated' : 'Ongoing'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {collab.teamMembers.slice(0, 4).map((member, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
                            >
                              {member.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {collab.teamMembers.map(m => m.name.split(' ')[0]).join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No collaborations yet</p>
                </div>
              )}
            </section>

            <section className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6">Growth Timeline</h2>
              <div className="h-48 rounded-xl bg-muted/50 flex items-center justify-center">
                <p className="text-muted-foreground">Growth visualization coming soon</p>
              </div>
            </section>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Web3 Identity
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Launch Pad UID</div>
                  <div className="font-mono text-sm bg-muted px-3 py-2 rounded-lg">
                    {user.uid}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Wallet</div>
                  {user.walletAddress ? (
                    <div className="space-y-2">
                      <div className="font-mono text-sm bg-muted px-3 py-2 rounded-lg truncate">
                        {user.walletAddress}
                      </div>
                      <p className="text-xs text-muted-foreground">Connected via MetaMask</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive"
                        disabled={walletLoading}
                        onClick={async () => {
                          if (!user?.id) return;
                          setWalletLoading(true);
                          setWalletError(null);
                          try {
                            const res = await fetch(`/api/users/${user.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ wallet_address: null }),
                            });
                            if (res.ok) setUser({ ...user, walletAddress: undefined });
                            else {
                              const err = await res.json().catch(() => ({}));
                              setWalletError(err.message || err.error || 'Failed to disconnect.');
                            }
                          } finally {
                            setWalletLoading(false);
                          }
                        }}
                      >
                        <Link2Off className="w-4 h-4" />
                        {walletLoading ? 'Disconnecting…' : 'Disconnect wallet'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {!hasMetaMask && (
                        <p className="text-xs text-amber-600 dark:text-amber-500">
                          Install MetaMask to connect a real wallet.
                        </p>
                      )}
                      {walletError && (
                        <p className="text-xs text-destructive">{walletError}</p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        disabled={walletLoading || !hasMetaMask}
                        onClick={async () => {
                          if (!user?.id) return;
                          setWalletError(null);
                          setWalletLoading(true);
                          try {
                            const { address, error } = await connectMetaMask();
                            if (error) {
                              setWalletError(error);
                              return;
                            }
                            if (!address) return;
                            const res = await fetch(`/api/users/${user.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ wallet_address: address }),
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setUser({
                                ...user,
                                walletAddress: data.wallet_address ?? undefined,
                                verificationLevel: (data.verification_level === 'level1' || data.verification_level === 'level2')
                                  ? data.verification_level
                                  : user.verificationLevel,
                              });
                            } else {
                              const err = await res.json().catch(() => ({}));
                              setWalletError(err.message || err.error || 'Failed to save wallet to profile.');
                            }
                          } finally {
                            setWalletLoading(false);
                          }
                        }}
                      >
                        <Wallet className="w-4 h-4" />
                        {walletLoading ? 'Connecting…' : hasMetaMask ? 'Connect with MetaMask' : 'MetaMask required'}
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Soulbound NFT</div>
                  {user.soulboundNFT ? (
                    <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 text-center">
                      <div className="text-sm font-medium text-primary">NFT Active</div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-border text-center">
                      <div className="text-sm text-muted-foreground">Not claimed yet</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                KYC
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Complete KYC to unlock the Investor menu. Your wallet address is saved for transactions.
              </p>

              <div className="space-y-3 mb-4">
                <VerificationStep label="Email Verified" completed={true} />
                <VerificationStep
                  label="Identity Verified"
                  description="ID & Selfie"
                  completed={user.verificationLevel !== 'unverified'}
                />
                <VerificationStep
                  label="Address Verified"
                  description="Proof of residence"
                  completed={user.verificationLevel === 'level2'}
                />
              </div>

              {user.verificationLevel !== 'level2' ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!user?.id) return;
                    setKycError(null);
                    setKycLoading(true);
                    try {
                      const res = await fetch(`/api/users/${user.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ verification_level: 'level2' }),
                      });
                      if (res.ok) {
                        setUser({ ...user, verificationLevel: 'level2' });
                      } else {
                        setKycError('Failed to complete KYC. Please try again.');
                      }
                    } finally {
                      setKycLoading(false);
                    }
                  }}
                  className="space-y-4 border-t border-border pt-4"
                >
                  <div>
                    <Label htmlFor="kyc-fullName">Full name</Label>
                    <Input
                      id="kyc-fullName"
                      placeholder="As on ID"
                      value={kycForm.fullName}
                      onChange={(e) => setKycForm((f) => ({ ...f, fullName: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kyc-idType">ID type</Label>
                    <select
                      id="kyc-idType"
                      value={kycForm.idType}
                      onChange={(e) => setKycForm((f) => ({ ...f, idType: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="national_id">National ID</option>
                      <option value="passport">Passport</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="kyc-idNumber">ID number</Label>
                    <Input
                      id="kyc-idNumber"
                      placeholder="ID or passport number"
                      value={kycForm.idNumber}
                      onChange={(e) => setKycForm((f) => ({ ...f, idNumber: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kyc-address">Address (proof of residence)</Label>
                    <Input
                      id="kyc-address"
                      placeholder="Street, city, country"
                      value={kycForm.address}
                      onChange={(e) => setKycForm((f) => ({ ...f, address: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  {kycError && (
                    <p className="text-xs text-destructive">{kycError}</p>
                  )}
                  <Button type="submit" className="w-full gap-2" size="sm" disabled={kycLoading}>
                    <Lock className="w-4 h-4" />
                    {kycLoading ? 'Completing…' : 'Complete KYC (test)'}
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-success border-t border-border pt-4">KYC complete. Investor menu is unlocked.</p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  value: number | string;
  label: string;
  highlight?: boolean;
}

function StatCard({ icon: Icon, value, label, highlight }: StatCardProps) {
  return (
    <div className="glass-card p-4 text-center">
      <Icon className={`w-6 h-6 mx-auto mb-2 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
      <div className={`text-2xl font-bold ${highlight ? 'text-gradient' : ''}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

interface VerificationStepProps {
  label: string;
  description?: string;
  completed: boolean;
}

function VerificationStep({ label, description, completed }: VerificationStepProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
        completed ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
      }`}>
        {completed ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-current" />
        )}
      </div>
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
    </div>
  );
}
