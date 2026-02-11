import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Shield, Trophy, Users, MapPin, Calendar, 
  Wallet, Globe, CheckCircle2, Edit, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { format } from 'date-fns';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Profile() {
  const { user, isAuthenticated } = useAuthStore();

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
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8">
          <div className="glass-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary">
                  {user.name.charAt(0)}
                </div>
                <button className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Info */}
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

              <Button variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                icon={Trophy}
                value={user.hackathonsWon.length}
                label="Hackathons Won"
              />
              <StatCard
                icon={Users}
                value={user.hackathonsAttended.length}
                label="Participated"
              />
              <StatCard
                icon={CheckCircle2}
                value={`${winRate}%`}
                label="Win Rate"
                highlight
              />
              <StatCard
                icon={Globe}
                value={user.collaborations.length}
                label="Collaborations"
              />
            </div>

            {/* Collaborations */}
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

                      {/* Team Members */}
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

            {/* Growth Map Placeholder */}
            <section className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6">Growth Timeline</h2>
              <div className="h-48 rounded-xl bg-muted/50 flex items-center justify-center">
                <p className="text-muted-foreground">Growth visualization coming soon</p>
              </div>
            </section>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={fadeUp} className="space-y-6">
            {/* Web3 Identity */}
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
                    <div className="font-mono text-sm bg-muted px-3 py-2 rounded-lg truncate">
                      {user.walletAddress}
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Wallet className="w-4 h-4" />
                      Connect Wallet
                    </Button>
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

            {/* Verification */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Verification Status
              </h3>
              
              <div className="space-y-3">
                <VerificationStep 
                  label="Email Verified"
                  completed={true}
                />
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

              {user.verificationLevel !== 'level2' && (
                <Button className="w-full mt-4" size="sm">
                  Complete Verification
                </Button>
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
