import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Calendar, MapPin, Users, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { format, isPast, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';

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

export default function Hackathons() {
  const { hackathons } = useAppStore();

  const upcomingHackathons = hackathons.filter(h => h.status === 'upcoming');
  const activeHackathons = hackathons.filter(h => h.status === 'active');
  const completedHackathons = hackathons.filter(h => h.status === 'completed');

  return (
    <div className="container py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="text-gradient">Hackathons</span>
          </h1>
          <p className="text-muted-foreground">
            Compete, innovate, and launch your journey on Launch Pad
          </p>
        </motion.div>

        {/* Upcoming Hackathons */}
        {upcomingHackathons.length > 0 && (
          <motion.section variants={fadeUp} className="mb-12">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Upcoming Hackathons
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingHackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} featured />
              ))}
            </div>
          </motion.section>
        )}

        {/* Active Hackathons */}
        {activeHackathons.length > 0 && (
          <motion.section variants={fadeUp} className="mb-12">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Happening Now
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {activeHackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} featured />
              ))}
            </div>
          </motion.section>
        )}

        {/* Completed Hackathons */}
        <motion.section variants={fadeUp}>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Past Hackathons
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedHackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

interface HackathonCardProps {
  hackathon: {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    sponsors: { name: string; tier: string }[];
    winners: { projectName: string; rank: number }[];
    participants: number;
    status: string;
  };
  featured?: boolean;
}

function HackathonCard({ hackathon, featured }: HackathonCardProps) {
  return (
    <Link to={`/hackathon/${hackathon.id}`}>
      <div className={cn(
        "glass-card p-6 card-hover h-full",
        featured && "border-primary/30"
      )}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {hackathon.status === 'upcoming' && (
                <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-medium">
                  Upcoming
                </span>
              )}
              {hackathon.status === 'active' && (
                <span className="px-2 py-0.5 rounded-full bg-success/15 text-success text-xs font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg">{hackathon.name}</h3>
          </div>
          <Trophy className="w-5 h-5 text-primary flex-shrink-0" />
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {hackathon.description}
        </p>
        
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(hackathon.startDate), 'MMM d')} - {format(new Date(hackathon.endDate), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {hackathon.location}
          </div>
          {hackathon.participants > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {hackathon.participants} participants
            </div>
          )}
        </div>

        {/* Sponsors */}
        {hackathon.sponsors.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hackathon.sponsors.slice(0, 3).map((sponsor, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground"
              >
                {sponsor.name}
              </span>
            ))}
          </div>
        )}

        {/* Winners */}
        {hackathon.winners.length > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Winners</div>
            <div className="space-y-1">
              {hackathon.winners.slice(0, 2).map((winner, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                    {winner.rank}
                  </span>
                  {winner.projectName}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end">
          <span className="text-primary text-sm flex items-center gap-1">
            View Details
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
