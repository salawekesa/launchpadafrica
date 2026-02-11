import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Trophy, Calendar, MapPin, Users, 
  Rocket, ExternalLink, Award 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { format } from 'date-fns';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HackathonDetail() {
  const { id } = useParams<{ id: string }>();
  const { getHackathonById, projects } = useAppStore();
  
  const hackathon = getHackathonById(id || '');
  
  if (!hackathon) {
    return <Navigate to="/hackathons" replace />;
  }

  const winnerProjects = hackathon.winners
    .map(w => projects.find(p => p.id === w.projectId))
    .filter(Boolean);

  return (
    <div className="container py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {/* Back Button */}
        <motion.div variants={fadeUp} className="mb-6">
          <Link to="/hackathons">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Hackathons
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {hackathon.status === 'upcoming' && (
              <span className="px-3 py-1 rounded-full bg-primary/15 text-primary text-sm font-medium">
                Upcoming
              </span>
            )}
            {hackathon.status === 'active' && (
              <span className="px-3 py-1 rounded-full bg-success/15 text-success text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                Live Now
              </span>
            )}
            {hackathon.status === 'completed' && (
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                Completed
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{hackathon.name}</h1>
          <p className="text-xl text-muted-foreground">{hackathon.description}</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <section className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Overview
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <Calendar className="w-6 h-6 mx-auto text-primary mb-2" />
                  <div className="font-medium">
                    {format(new Date(hackathon.startDate), 'MMM d')} - {format(new Date(hackathon.endDate), 'd, yyyy')}
                  </div>
                  <div className="text-sm text-muted-foreground">Event Dates</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <MapPin className="w-6 h-6 mx-auto text-primary mb-2" />
                  <div className="font-medium">{hackathon.location}</div>
                  <div className="text-sm text-muted-foreground">Location</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <Users className="w-6 h-6 mx-auto text-primary mb-2" />
                  <div className="font-medium">{hackathon.participants || 'TBA'}</div>
                  <div className="text-sm text-muted-foreground">Participants</div>
                </div>
              </div>
            </section>

            {/* Winners */}
            {hackathon.winners.length > 0 && (
              <section className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Winners
                </h2>
                <div className="space-y-4">
                  {hackathon.winners.map((winner, index) => {
                    const project = projects.find(p => p.id === winner.projectId);
                    return (
                      <div 
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                          winner.rank === 1 
                            ? 'bg-yellow-500/20 text-yellow-500' 
                            : winner.rank === 2 
                              ? 'bg-gray-400/20 text-gray-400'
                              : 'bg-orange-500/20 text-orange-500'
                        }`}>
                          #{winner.rank}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{winner.projectName}</div>
                          <div className="text-sm text-muted-foreground">{winner.prize}</div>
                        </div>
                        {project && (
                          <Link to={`/project/${project.id}`}>
                            <Button variant="ghost" size="sm" className="gap-2">
                              {winner.advancedToLaunchPad && (
                                <span className="text-xs text-primary">On Launch Pad</span>
                              )}
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Sponsors */}
            {hackathon.sponsors.length > 0 && (
              <section className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-6">Sponsors</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {hackathon.sponsors.map((sponsor, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-xl border ${
                        sponsor.tier === 'platinum' 
                          ? 'border-primary bg-primary/5' 
                          : sponsor.tier === 'gold'
                            ? 'border-yellow-500/50 bg-yellow-500/5'
                            : 'border-border'
                      }`}
                    >
                      <div className="font-medium">{sponsor.name}</div>
                      <div className="text-sm text-muted-foreground capitalize">{sponsor.tier} Sponsor</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={fadeUp} className="space-y-6">
            {/* CTA */}
            {hackathon.status === 'upcoming' && (
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Ready to Compete?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Register now to participate in this hackathon and get a chance to launch your project.
                </p>
                <Button className="w-full glow-primary">
                  Register Now
                </Button>
              </div>
            )}

            {/* Launch Pad CTA */}
            {hackathon.status === 'completed' && hackathon.winners.some(w => !w.advancedToLaunchPad) && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Rocket className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">For Winners</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  If you won this hackathon, you're eligible to advance your project to Launch Pad.
                </p>
                <Button className="w-full" variant="outline">
                  Advance to Launch Pad
                </Button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{hackathon.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">3 days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sponsors</span>
                  <span className="font-medium">{hackathon.sponsors.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Winners</span>
                  <span className="font-medium">{hackathon.winners.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">On Launch Pad</span>
                  <span className="font-medium text-primary">
                    {hackathon.winners.filter(w => w.advancedToLaunchPad).length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
