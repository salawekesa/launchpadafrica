import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Rocket, TrendingUp, Trophy, Users, ArrowRight, 
  Clock, CheckCircle2, AlertCircle, Wallet 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { STAGE_CONFIG } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { projects, activities, getPledgesByInvestor } = useAppStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const isBuilder = user.role === 'builder';
  const isInvestor = user.role === 'investor';

  // Get relevant data based on role
  const userProjects = isBuilder 
    ? projects.filter(p => p.leaderId === user.id || p.team.some(t => t.userId === user.id))
    : [];
  
  const investorPledges = isInvestor ? getPledgesByInvestor(user.id) : [];
  const pledgedProjects = investorPledges.map(p => projects.find(proj => proj.id === p.projectId)).filter(Boolean);
  
  const totalPledged = investorPledges.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="container py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Welcome Header */}
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground">
            {isBuilder 
              ? "Here's an overview of your projects and activities"
              : "Here's your investment portfolio overview"
            }
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isBuilder ? (
            <>
              <StatCard
                icon={Rocket}
                label="Your Projects"
                value={userProjects.length.toString()}
              />
              <StatCard
                icon={Trophy}
                label="Hackathons Won"
                value={user.hackathonsWon.length.toString()}
              />
              <StatCard
                icon={Users}
                label="Collaborations"
                value={user.collaborations.length.toString()}
              />
              <StatCard
                icon={CheckCircle2}
                label="Verification"
                value={user.verificationLevel === 'level2' ? 'Level 2' : user.verificationLevel === 'level1' ? 'Level 1' : 'Unverified'}
                highlight={user.verificationLevel !== 'unverified'}
              />
            </>
          ) : (
            <>
              <StatCard
                icon={TrendingUp}
                label="Total Pledged"
                value={`₳${totalPledged.toLocaleString()}`}
                highlight
              />
              <StatCard
                icon={Rocket}
                label="Projects Backed"
                value={pledgedProjects.length.toString()}
              />
              <StatCard
                icon={Wallet}
                label="Wallet"
                value={user.walletAddress ? 'Connected' : 'Not Connected'}
                highlight={!!user.walletAddress}
              />
              <StatCard
                icon={CheckCircle2}
                label="Verification"
                value={user.verificationLevel === 'level2' ? 'Level 2' : user.verificationLevel === 'level1' ? 'Level 1' : 'Unverified'}
                highlight={user.verificationLevel !== 'unverified'}
              />
            </>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
            {/* Projects Section */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {isBuilder ? 'Your Projects' : 'Pledged Projects'}
                </h2>
                <Link to="/launchpad">
                  <Button variant="ghost" size="sm" className="gap-2">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {(isBuilder ? userProjects : pledgedProjects).length > 0 ? (
                <div className="space-y-4">
                  {(isBuilder ? userProjects : pledgedProjects).slice(0, 3).map((project) => project && (
                    <Link key={project.id} to={`/project/${project.id}`}>
                      <div className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-medium mb-1">{project.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {project.tagline}
                            </p>
                          </div>
                          <span className={`stage-badge ${STAGE_CONFIG[project.stage].className}`}>
                            {STAGE_CONFIG[project.stage].label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="text-muted-foreground">
                            Funding: <span className="currency-ada">₳{project.fundingRaised.toLocaleString()}</span> / ₳{project.fundingAsk.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Rocket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">
                    {isBuilder ? 'No projects yet' : 'No pledges yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isBuilder 
                      ? 'Win a hackathon or list your independent project'
                      : 'Browse projects and make your first pledge'
                    }
                  </p>
                  <Link to={isBuilder ? '/hackathons' : '/launchpad'}>
                    <Button size="sm">
                      {isBuilder ? 'View Hackathons' : 'Explore Projects'}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Verification Status */}
            {user.verificationLevel !== 'level2' && (
              <div className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">Complete Your Verification</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {user.verificationLevel === 'unverified'
                        ? 'Verify your identity to unlock full platform features and build trust.'
                        : 'Complete Level 2 verification for enhanced trust and visibility.'
                      }
                    </p>
                    <Button size="sm" variant="outline">
                      Start Verification
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={fadeUp} className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {activities.slice(0, 6).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    {activity.type === 'pledge' && <TrendingUp className="w-4 h-4" />}
                    {activity.type === 'stage_change' && <Rocket className="w-4 h-4" />}
                    {activity.type === 'hackathon_win' && <Trophy className="w-4 h-4" />}
                    {activity.type === 'project_update' && <CheckCircle2 className="w-4 h-4" />}
                    {activity.type === 'team_join' && <Users className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}

function StatCard({ icon: Icon, label, value, highlight }: StatCardProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highlight ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className={`text-2xl font-bold ${highlight ? 'text-gradient' : ''}`}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
