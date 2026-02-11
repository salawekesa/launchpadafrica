import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  ArrowRight,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHackathonStore } from '@/modules/hackathon';
import { useAuthStore } from '@/store/auth-store';
import { format, differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

type HackathonDisplay = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  sponsors: { name: string; tier: string }[];
  winners: { projectName: string; rank: number; projectId?: string }[];
  participants: number;
  status: string;
  image?: string;
  totalPrize?: string;
  techStack?: string[];
  level?: string;
  eventType?: 'online' | 'hybrid';
  recommended?: boolean;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

function statusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Ended';
    case 'active':
      return 'Live';
    case 'upcoming':
    case 'draft':
      return 'Upcoming';
    case 'judging':
      return 'Voting';
    default:
      return status;
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-muted text-muted-foreground';
    case 'active':
      return 'bg-success/15 text-success';
    case 'upcoming':
    case 'draft':
      return 'bg-primary/15 text-primary';
    case 'judging':
      return 'bg-accent/15 text-accent';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function getCountdownOrWinner(h: HackathonDisplay): { label: string; sub?: string } {
  if (h.status === 'completed' && h.winners.length > 0) {
    return { label: 'Winner', sub: 'Announced' };
  }
  if (h.status === 'judging') {
    const end = parseISO(h.endDate);
    const days = differenceInDays(end, new Date());
    return { label: 'Voting Close', sub: days > 0 ? `${days} days left` : 'Closing soon' };
  }
  if (h.status === 'active') {
    const end = parseISO(h.endDate);
    const days = differenceInDays(end, new Date());
    return { label: 'Registration Close', sub: days > 0 ? `${days} days left` : 'Closing soon' };
  }
  if (h.status === 'upcoming' || h.status === 'draft') {
    const start = parseISO(h.startDate);
    const days = differenceInDays(start, new Date());
    return { label: 'Un Open Close', sub: days > 0 ? `${days} days left` : 'Starting soon' };
  }
  return { label: '', sub: '' };
}

export default function Hackathons() {
  const { getHackathons, loadHackathons, isLoading, error } = useHackathonStore();
  const { isAuthenticated } = useAuthStore();
  const raw = getHackathons();
  const hackathons = raw as HackathonDisplay[];

  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterEventType, setFilterEventType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'prize' | 'participants'>('date');
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    loadHackathons();
  }, [loadHackathons]);

  const filtered = useMemo(() => {
    let list = [...hackathons];
    if (filterStatus) {
      list = list.filter((h) => h.status === filterStatus);
    }
    if (filterEventType) {
      list = list.filter((h) => h.eventType === filterEventType);
    }
    if (sortBy === 'date') {
      list.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    } else if (sortBy === 'prize') {
      list.sort((a, b) => {
        const pa = parseInt((a.totalPrize || '0').replace(/\D/g, ''), 10) || 0;
        const pb = parseInt((b.totalPrize || '0').replace(/\D/g, ''), 10) || 0;
        return pb - pa;
      });
    } else {
      list.sort((a, b) => (b.participants || 0) - (a.participants || 0));
    }
    return list;
  }, [hackathons, filterStatus, filterEventType, sortBy]);

  const pastHackathons = useMemo(
    () => filtered.filter((h) => h.status === 'completed'),
    [filtered]
  );
  const liveAndUpcoming = useMemo(
    () => filtered.filter((h) => h.status !== 'completed'),
    [filtered]
  );
  const highlightList = useMemo(
    () => filtered.filter((h) => h.status === 'active' || h.status === 'upcoming'),
    [filtered]
  );
  const currentHighlight = highlightList[highlightIndex % Math.max(1, highlightList.length)];

  const hasFilters = filterStatus !== null || filterEventType !== null;
  const clearFilters = () => {
    setFilterStatus(null);
    setFilterEventType(null);
  };

  return (
    <div className="container py-8 max-w-6xl">
      {error && (
        <p className="text-destructive text-sm mb-4">{error}</p>
      )}
      {isLoading && hackathons.length === 0 ? (
        <p className="text-muted-foreground">Loading hackathons...</p>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* Hero – HackQuest-style */}
          <motion.div variants={fadeUp} className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Explore Hackathons
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Welcome to your hackathon dashboard! Manage projects, invite teammates, and track your hackathon journey with ease—all in one place.
            </p>
          </motion.div>

          {/* Host a Hackathon – Project Highlight style */}
          <motion.section variants={fadeUp} className="mb-10">
            <div className="rounded-2xl border border-border bg-card/50 p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Trophy className="w-12 h-12 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-semibold mb-1">Host a Hackathon</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Create your own hackathon, set prizes, invite judges, and run a full event—all in one place.
                </p>
                {isAuthenticated ? (
                  <Button asChild className="shrink-0 glow-primary">
                    <Link to="/hackathon/create" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create hackathon
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline">
                    <Link to="/login">Sign in to host</Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.section>

          {/* Project Highlight – optional section title */}
          <motion.div variants={fadeUp} className="mb-4">
            <h2 className="text-lg font-semibold text-muted-foreground">Project Highlight</h2>
          </motion.div>

          {/* Filters – All Hackathon */}
          <motion.div variants={fadeUp} className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">All Hackathon</span>
            <div className="flex flex-wrap items-center gap-2 ml-2">
              <span className="text-xs text-muted-foreground">Total Prize</span>
              <span className="text-xs text-muted-foreground">Ecosystem</span>
              <button
                type="button"
                onClick={() => setFilterStatus(filterStatus === 'active' ? null : 'active')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  filterStatus === 'active' ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                )}
              >
                Live
                </button>
              <button
                type="button"
                onClick={() => setFilterStatus(filterStatus === 'upcoming' ? null : 'upcoming')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  filterStatus === 'upcoming' ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                )}
              >
                Upcoming
                </button>
              <button
                type="button"
                onClick={() => setFilterStatus(filterStatus === 'completed' ? null : 'completed')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  filterStatus === 'completed' ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                )}
              >
                Ended
                </button>
              <span className="text-xs text-muted-foreground ml-2">Tech Stack</span>
              <span className="text-xs text-muted-foreground">Status</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'prize' | 'participants')}
                className="ml-2 px-2 py-1 rounded-md text-xs border border-input bg-background"
              >
                <option value="date">Sort By Date</option>
                <option value="prize">Sort By Prize</option>
                <option value="participants">Sort By Participants</option>
              </select>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-2 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
          </motion.div>

          {/* Past Hackathon */}
          {pastHackathons.length > 0 && (
            <motion.section variants={fadeUp} className="mb-10">
              <h2 className="text-lg font-semibold mb-4">Past Hackathon</h2>
              <div className="mb-4">
                <Link
                  to="/hackathons?view=past"
                  className="text-sm text-primary hover:underline"
                >
                  View more
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastHackathons.slice(0, 6).map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
            </motion.section>
          )}

          {/* All Hackathon (Live + Upcoming) */}
          <motion.section variants={fadeUp} className="mb-10">
            <h2 className="text-lg font-semibold mb-6">All Hackathon</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveAndUpcoming.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
              ))}
              {filtered.length === 0 && (
                <p className="text-muted-foreground col-span-full py-8 text-center">
                  No hackathons match your filters.
                </p>
              )}
            </div>
          </motion.section>

          {/* Hackathons Highlight – carousel */}
          {highlightList.length > 0 && (
            <motion.section variants={fadeUp} className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Hackathons Highlight
              </h2>
              <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{
                    width: `${highlightList.length * 100}%`,
                    transform: `translateX(-${(highlightIndex / highlightList.length) * 100}%)`,
                  }}
                >
                  {highlightList.map((h) => (
                    <div
                      key={h.id}
                      className="flex flex-col md:flex-row shrink-0"
                      style={{ width: `${100 / highlightList.length}%` }}
                    >
                      <div className="md:w-1/2 h-48 md:h-72 bg-muted relative overflow-hidden">
                        {h.image ? (
                          <img
                            src={h.image}
                            alt={h.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Trophy className="w-16 h-16 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', statusBadgeClass(h.status))}>
                            {statusLabel(h.status)}
                          </span>
                        </div>
                      </div>
                      <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                        <h3 className="text-xl font-bold mb-2">{h.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {h.description}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                          {h.totalPrize && (
                            <span>Total Prize {h.totalPrize}</span>
                          )}
                          <span className="uppercase">{h.eventType || 'Online'}</span>
                          <span>{h.participants}+ participants</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button asChild className="glow-primary">
                            <Link to={`/hackathon/${h.id}`}>
                              {h.status === 'active' || h.status === 'upcoming' ? 'Start Register' : 'View'}
                            </Link>
                          </Button>
                          <Link
                            to={`/hackathon/${h.id}`}
                            className="text-sm text-primary hover:underline"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {highlightList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setHighlightIndex((i) => (i - 1 + highlightList.length) % highlightList.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setHighlightIndex((i) => (i + 1) % highlightList.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      aria-label="Next"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {highlightList.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setHighlightIndex(i)}
                          className={cn(
                            'w-2 h-2 rounded-full transition-colors',
                            i === highlightIndex ? 'bg-primary' : 'bg-muted-foreground/40'
                          )}
                          aria-label={`Slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.section>
          )}
        </motion.div>
      )}
    </div>
  );
}

interface HackathonCardProps {
  hackathon: HackathonDisplay;
}

function HackathonCard({ hackathon }: HackathonCardProps) {
  const countdown = getCountdownOrWinner(hackathon);
  return (
    <Link to={`/hackathon/${hackathon.id}`} className="block group">
      <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors h-full flex flex-col">
        <div className="aspect-[16/10] bg-muted relative overflow-hidden">
          {hackathon.image ? (
            <img
              src={hackathon.image}
              alt={hackathon.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusBadgeClass(hackathon.status))}>
              {statusLabel(hackathon.status)}
            </span>
            {hackathon.recommended && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                RECOMMEND
              </span>
            )}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-base mb-1 line-clamp-2">{hackathon.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{hackathon.description}</p>
          {countdown.label && (
            <div className="text-xs text-muted-foreground mb-2">
              {countdown.label}
              {countdown.sub && <span className="block text-foreground/80">{countdown.sub}</span>}
            </div>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
            <span>Tech Stack {hackathon.techStack?.join(', ') || 'All'}</span>
            <span>Level {hackathon.level || '-'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-auto">
            <span>Total Prize {hackathon.totalPrize || 'TBA'}</span>
            <span className="uppercase">{hackathon.eventType || 'Online'}</span>
            <span>{hackathon.participants}+ participants</span>
          </div>
          <div className="mt-3 flex items-center justify-end text-primary text-sm font-medium group-hover:underline">
            View Details
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
