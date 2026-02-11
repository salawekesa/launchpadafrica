import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Trophy, Users, TrendingUp, Globe, Calendar,
  Loader2, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { STAGE_CONFIG, SECTOR_LABELS } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { getProjectById, getHackathonById, addPledge } = useAppStore();
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const [pledgeAmount, setPledgeAmount] = useState('');
  const [isPledging, setIsPledging] = useState(false);
  const [showPledgeForm, setShowPledgeForm] = useState(false);

  const project = getProjectById(id || '');

  if (!project) {
    return <Navigate to="/launchpad" replace />;
  }

  const hackathon = project.hackathonId ? getHackathonById(project.hackathonId) : null;
  const fundingProgress = (project.fundingRaised / project.fundingAsk) * 100;

  const handlePledge = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Login Required",
        description: "Please login to pledge to this project.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(pledgeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid pledge amount.",
        variant: "destructive",
      });
      return;
    }

    setIsPledging(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    addPledge(project.id, amount, user.id);

    toast({
      title: "Pledge Submitted!",
      description: `Your pledge of ₳${amount.toLocaleString()} has been recorded.`,
    });

    setPledgeAmount('');
    setShowPledgeForm(false);
    setIsPledging(false);
  };

  return (
    <div className="container py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div variants={fadeUp} className="mb-6">
          <Link to="/launchpad">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Button>
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} className="mb-8">
          <div className="flex flex-wrap items-start gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold">{project.name}</h1>
            <div className="flex gap-2">
              <span className={`stage-badge ${STAGE_CONFIG[project.stage].className}`}>
                {STAGE_CONFIG[project.stage].label}
              </span>
              {project.origin === 'hackathon' && (
                <span className="stage-badge bg-primary/15 text-primary">
                  <Trophy className="w-3 h-3 mr-1" />
                  Hackathon Winner
                </span>
              )}
            </div>
          </div>
          <p className="text-xl text-muted-foreground">{project.tagline}</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-8">
            <section className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Vision
              </h2>
              <p className="text-muted-foreground">{project.vision}</p>
            </section>

            <section className="glass-card p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-destructive">The Problem</h3>
                  <p className="text-sm text-muted-foreground">{project.problem}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-success">The Solution</h3>
                  <p className="text-sm text-muted-foreground">{project.solution}</p>
                </div>
              </div>
            </section>

            <section className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Progress Timeline
              </h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6">
                  {project.stageHistory.map((transition, index) => (
                    <div key={index} className="relative pl-10">
                      <div className="absolute left-2.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(transition.date), 'MMM d, yyyy')}
                      </div>
                      <div className="font-medium">
                        Advanced to {STAGE_CONFIG[transition.to].label}
                      </div>
                    </div>
                  ))}
                  <div className="relative pl-10">
                    <div className="absolute left-2.5 w-3 h-3 rounded-full bg-primary border-2 border-background animate-pulse" />
                    <div className="text-sm text-muted-foreground">Current</div>
                    <div className="font-medium">{STAGE_CONFIG[project.stage].label}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Team
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {project.team.map((member, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      {member.userId === project.leaderId && (
                        <div className="text-xs text-primary">Team Lead</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {hackathon && (
              <section className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Hackathon Origin
                </h2>
                <Link to={`/hackathon/${hackathon.id}`}>
                  <div className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors">
                    <div className="font-medium mb-1">{hackathon.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {hackathon.location} • {format(new Date(hackathon.startDate), 'MMM yyyy')}
                    </div>
                  </div>
                </Link>
              </section>
            )}
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-6">
            <div className="glass-card p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Funding Progress</h3>

              <div className="mb-4">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, fundingProgress)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="text-3xl font-bold currency-ada">
                    ₳{project.fundingRaised.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of ₳{project.fundingAsk.toLocaleString()} goal
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gradient">
                    {Math.round(fundingProgress)}%
                  </div>
                  <div className="text-sm text-muted-foreground">funded</div>
                </div>
              </div>

              {project.stage !== 'archived' && (
                <>
                  {showPledgeForm ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Pledge Amount (ADA)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₳</span>
                          <Input
                            type="number"
                            placeholder="1000"
                            value={pledgeAmount}
                            onChange={(e) => setPledgeAmount(e.target.value)}
                            className="pl-8"
                            min="1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 glow-primary"
                          onClick={handlePledge}
                          disabled={isPledging}
                        >
                          {isPledging ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Wallet className="w-4 h-4 mr-2" />
                              Confirm Pledge
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowPledgeForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Pledges are non-binding expressions of intent
                      </p>
                    </div>
                  ) : (
                    <Button
                      className="w-full glow-primary"
                      size="lg"
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast({
                            title: "Login Required",
                            description: "Please login to pledge to this project.",
                          });
                        } else {
                          setShowPledgeForm(true);
                        }
                      }}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Pledge Investment
                    </Button>
                  )}
                </>
              )}

              {project.stage === 'archived' && (
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    This project is archived and not accepting pledges
                  </p>
                </div>
              )}
            </div>

            {(project.metrics.users || project.metrics.revenue || project.metrics.growth || project.metrics.researchOutput) && (
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Key Metrics</h3>
                <div className="space-y-3">
                  {project.metrics.users && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Users</span>
                      <span className="font-medium">{project.metrics.users.toLocaleString()}</span>
                    </div>
                  )}
                  {project.metrics.revenue && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-medium currency-ada">₳{project.metrics.revenue.toLocaleString()}</span>
                    </div>
                  )}
                  {project.metrics.growth && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Growth</span>
                      <span className="font-medium text-success">+{project.metrics.growth}%</span>
                    </div>
                  )}
                  {project.metrics.researchOutput && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Research</span>
                      <span className="font-medium">{project.metrics.researchOutput}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Community Activity</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${project.communityActivity}%` }}
                  />
                </div>
                <span className="font-medium">{project.communityActivity}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Based on team updates, discussions, and engagement
              </p>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sector</span>
                  <span className="font-medium">{SECTOR_LABELS[project.sector]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Origin</span>
                  <span className="font-medium capitalize">{project.origin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team Size</span>
                  <span className="font-medium">{project.team.length} members</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
