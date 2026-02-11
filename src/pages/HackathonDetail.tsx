import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  Calendar,
  MapPin,
  Users,
  Rocket,
  ExternalLink,
  Award,
  Settings,
  BarChart3,
  Bookmark,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHackathonStore } from '@/modules/hackathon';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type TabId = 'details' | 'team' | 'prizes' | 'projects';

export default function HackathonDetail() {
  const { id } = useParams<{ id: string }>();
  const { getHackathonById: getHackathonFromModule, loadHackathonById, loadHackathons, getHackathons } = useHackathonStore();
  const { getHackathonById: getHackathonFromApp, projects } = useAppStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('details');

  useEffect(() => {
    loadHackathons();
  }, [loadHackathons]);
  useEffect(() => {
    if (id) loadHackathonById(id);
  }, [id, loadHackathonById]);

  const hackathonFromModule = getHackathonFromModule(id || '');
  const hackathonFromApp = getHackathonFromApp(id || '');
  const hackathon = hackathonFromModule ?? hackathonFromApp;
  const allHackathons = getHackathons();
  const carouselList = allHackathons.length
    ? allHackathons.slice(0, 5)
    : hackathon
      ? [hackathon]
      : [];

  if (!hackathon) {
    return <Navigate to="/hackathons" replace />;
  }

  const isHost = user?.id === (hackathon as { hostId?: string }).hostId;
  const managed = hackathon as {
    hostId?: string;
    judges?: { id: string; name: string; avatar?: string }[];
    participantList?: { id: string; projectName?: string; projectId?: string }[];
  };
  const winnerProjects = hackathon.winners
    .map((w) => projects.find((p) => p.id === w.projectId))
    .filter(Boolean);
  const endDate = new Date(hackathon.endDate);
  const isPast = endDate < new Date();
  const eventLabel = isPast
    ? `Ended ${formatDistanceToNow(endDate, { addSuffix: true })}`
    : `${format(new Date(hackathon.startDate), 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`;
  const tags = [
    hackathon.status === 'active' ? 'Live' : hackathon.status === 'upcoming' || hackathon.status === 'draft' ? 'Upcoming' : hackathon.status === 'judging' ? 'Voting' : 'Ended',
    hackathon.location,
    ...(hackathon.techStack || []),
    (hackathon as { eventType?: string }).eventType === 'online' ? 'Online' : (hackathon as { eventType?: string }).eventType === 'hybrid' ? 'Hybrid' : null,
  ].filter(Boolean) as string[];

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'details', label: 'Details' },
    { id: 'team', label: 'Team', count: (managed.judges?.length ?? 0) + (managed.hostId ? 1 : 0) },
    { id: 'prizes', label: 'Prizes', count: hackathon.winners.length || hackathon.sponsors.length },
    { id: 'projects', label: 'Projects', count: managed.participantList?.length ?? hackathon.participants },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Top bar: Back | Carousel | Open */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <Link to="/hackathons">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide">
              {carouselList.map((h) => (
                <Link
                  key={h.id}
                  to={`/hackathon/${h.id}`}
                  className={cn(
                    'shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                    h.id === hackathon.id
                      ? 'border-primary bg-primary/20 text-primary ring-2 ring-primary/30'
                      : 'border-border bg-muted/50 text-muted-foreground hover:border-primary/50'
                  )}
                  title={h.name}
                >
                  {(h as { image?: string }).image ? (
                    <img
                      src={(h as { image?: string }).image}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{h.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </Link>
              ))}
            </div>
            <Link to={`/hackathon/${hackathon.id}/scoreboard`}>
              <Button variant="ghost" size="sm" className="gap-2">
                Open
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Left panel – overview */}
          <motion.div variants={fadeUp} className="lg:col-span-4 xl:col-span-4 space-y-6">
            <div className="flex flex-col items-start">
              {(hackathon as { image?: string }).image ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-muted mb-4 ring-2 ring-primary/20">
                  <img
                    src={(hackathon as { image?: string }).image}
                    alt={hackathon.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary mb-4 ring-2 ring-primary/20">
                  {hackathon.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-2">{eventLabel}</p>
              <h1 className="text-2xl sm:text-3xl font-bold mb-3">{hackathon.name}</h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {hackathon.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="gap-2" asChild>
                  <span>
                    <Bookmark className="w-4 h-4" />
                    Bookmark
                  </span>
                </Button>
                {(hackathon.status === 'active' || hackathon.status === 'upcoming' || hackathon.status === 'judging') && (
                  <Link to={`/hackathon/${hackathon.id}/submit`}>
                    <Button size="sm" className="gap-2 glow-primary">
                      Submit project
                    </Button>
                  </Link>
                )}
                <Link to={`/hackathon/${hackathon.id}/scoreboard`}>
                  <Button size="sm" variant="outline" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Scoreboard
                  </Button>
                </Link>
                {isHost && (
                  <Link to={`/hackathon/${hackathon.id}/manage`}>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Settings className="w-4 h-4" />
                      Manage
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Host / Organizer */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                Organizer
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('team')}
                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                  {hackathon.name.slice(0, 1).toUpperCase()}
                </div>
                <span className="text-sm font-medium">Team info</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </button>
            </div>

            {/* External links placeholder – if hackathon had url/discord etc. */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>{hackathon.location}</span>
              </span>
            </div>
          </motion.div>

          {/* Right panel – tabbed content */}
          <motion.div variants={fadeUp} className="lg:col-span-8 xl:col-span-8">
            <div className="glass-card overflow-hidden">
              <div className="border-b border-border flex gap-0 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'shrink-0 px-5 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
                      activeTab === tab.id
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    )}
                  >
                    {tab.label}
                    {tab.count != null && tab.count > 0 && (
                      <span className="text-muted-foreground">{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="p-6 min-h-[320px]">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Overview
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-muted/50 text-center">
                        <Calendar className="w-6 h-6 mx-auto text-primary mb-2" />
                        <div className="font-medium text-sm">
                          {format(new Date(hackathon.startDate), 'MMM d')} – {format(new Date(hackathon.endDate), 'd, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">Event Dates</div>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/50 text-center">
                        <MapPin className="w-6 h-6 mx-auto text-primary mb-2" />
                        <div className="font-medium text-sm">{hackathon.location}</div>
                        <div className="text-xs text-muted-foreground">Location</div>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/50 text-center">
                        <Users className="w-6 h-6 mx-auto text-primary mb-2" />
                        <div className="font-medium text-sm">{hackathon.participants ?? 'TBA'}</div>
                        <div className="text-xs text-muted-foreground">Participants</div>
                      </div>
                    </div>
                    {hackathon.sponsors.length > 0 && (
                      <>
                        <h3 className="font-semibold">Sponsors</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {hackathon.sponsors.map((sponsor, i) => (
                            <div
                              key={i}
                              className={cn(
                                'p-3 rounded-xl border',
                                sponsor.tier === 'platinum' && 'border-primary bg-primary/5',
                                sponsor.tier === 'gold' && 'border-yellow-500/50 bg-yellow-500/5',
                                (sponsor.tier === 'silver' || sponsor.tier === 'bronze') && 'border-border'
                              )}
                            >
                              <div className="font-medium text-sm">{sponsor.name}</div>
                              <div className="text-xs text-muted-foreground capitalize">{sponsor.tier}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'team' && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Team & Judges
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Organizer and judges for this hackathon.
                    </p>
                    {managed.hostId && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                          H
                        </div>
                        <div>
                          <div className="font-medium">Host</div>
                          <div className="text-xs text-muted-foreground">Organizer</div>
                        </div>
                      </div>
                    )}
                    {(managed.judges?.length ?? 0) > 0 &&
                      managed.judges!.map((j) => (
                        <div key={j.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium">
                            {j.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="font-medium">{j.name}</div>
                        </div>
                      ))}
                    {!managed.hostId && (!managed.judges?.length ?? true) && (
                      <p className="text-sm text-muted-foreground">No team info available.</p>
                    )}
                  </div>
                )}

                {activeTab === 'prizes' && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Prizes & Winners
                    </h2>
                    {hackathon.winners.length > 0 ? (
                      <div className="space-y-3">
                        {hackathon.winners.map((winner, index) => {
                          const project = projects.find((p) => p.id === winner.projectId);
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                            >
                              <div
                                className={cn(
                                  'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold',
                                  winner.rank === 1 && 'bg-yellow-500/20 text-yellow-500',
                                  winner.rank === 2 && 'bg-gray-400/20 text-gray-400',
                                  winner.rank >= 3 && 'bg-orange-500/20 text-orange-500'
                                )}
                              >
                                #{winner.rank}
                              </div>
                              <div className="flex-1 min-w-0">
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
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No winners announced yet.
                        {(hackathon as { totalPrize?: string }).totalPrize && (
                          <span className="block mt-2">
                            Total prize pool: {(hackathon as { totalPrize?: string }).totalPrize}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-primary" />
                      Projects
                    </h2>
                    {managed.participantList && managed.participantList.length > 0 ? (
                      <div className="space-y-3">
                        {managed.participantList.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                              {(p.projectName || 'P').slice(0, 1).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{p.projectName || 'Project'}</div>
                            </div>
                            {p.projectId && (
                              <Link to={`/project/${p.projectId}`}>
                                <Button variant="ghost" size="sm" className="gap-2">
                                  View <ExternalLink className="w-4 h-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {hackathon.participants
                          ? `${hackathon.participants} participants. Project list may load from the server.`
                          : 'No projects submitted yet.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
