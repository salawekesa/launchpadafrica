import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Rocket, Trophy, X, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';
import { useStartupsFromApi } from '@/hooks/useStartupsFromApi';
import { STAGE_CONFIG, SECTOR_LABELS, type ProjectStage, type Sector } from '@/lib/types';
import { cn } from '@/lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export default function LaunchPad() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { projects: apiProjects, isLoading, isError, error } = useStartupsFromApi();
  const { projectFilters, setProjectFilters } = useAppStore();

  const filteredProjects = useMemo(() => {
    return apiProjects.filter(project => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.tagline ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (projectFilters.stage !== 'all' && project.stage !== projectFilters.stage) return false;
      if (projectFilters.sector !== 'all' && project.sector !== projectFilters.sector) return false;
      if (!projectFilters.showArchived && project.stage === 'archived') return false;
      return true;
    });
  }, [apiProjects, searchQuery, projectFilters]);

  const stages: (ProjectStage | 'all')[] = ['all', ...Object.keys(STAGE_CONFIG) as ProjectStage[]];
  const sectors: (Sector | 'all')[] = ['all', ...Object.keys(SECTOR_LABELS) as Sector[]];

  const activeFiltersCount = [
    projectFilters.stage !== 'all',
    projectFilters.sector !== 'all',
    projectFilters.showArchived,
  ].filter(Boolean).length;

  return (
    <div className="container py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Launch <span className="text-gradient">Pad</span>
          </h1>
          <p className="text-muted-foreground">
            Discover and support innovative African projects
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn("gap-2", activeFiltersCount > 0 && "border-primary")}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
            </Button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-6 space-y-6"
            >
              <div>
                <label className="text-sm font-medium mb-3 block">Stage</label>
                <div className="flex flex-wrap gap-2">
                  {stages.filter(s => s !== 'archived').map((stage) => (
                    <button
                      key={stage}
                      onClick={() => setProjectFilters({ stage })}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm transition-colors",
                        projectFilters.stage === stage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {stage === 'all' ? 'All Stages' : STAGE_CONFIG[stage].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Sector</label>
                <div className="flex flex-wrap gap-2">
                  {sectors.map((sector) => (
                    <button
                      key={sector}
                      onClick={() => setProjectFilters({ sector })}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm transition-colors",
                        projectFilters.sector === sector
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {sector === 'all' ? 'All Sectors' : SECTOR_LABELS[sector]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectFilters.showArchived}
                    onChange={(e) => setProjectFilters({ showArchived: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Show archived projects</span>
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setProjectFilters({
                    stage: 'all',
                    sector: 'all',
                    showArchived: false,
                  })}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear filters
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {isError && (
          <motion.div variants={fadeUp} className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            Failed to load startups. {(error as Error)?.message ?? 'Please try again.'}
          </motion.div>
        )}

        {isLoading && (
          <motion.div variants={fadeUp} className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            Loading startups...
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {!isLoading && (
        <motion.div
          variants={stagger}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project) => (
            <motion.div key={project.id} variants={fadeUp}>
              <Link to={`/startup/${project.id}`}>
                <div className={cn(
                  "glass-card p-6 card-hover h-full flex flex-col",
                  project.stage === 'archived' && "opacity-60"
                )}>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      {project.origin === 'hackathon' && (
                        <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {project.tagline}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`stage-badge ${STAGE_CONFIG[project.stage].className}`}>
                        {STAGE_CONFIG[project.stage].label}
                      </span>
                      <span className="stage-badge bg-secondary text-secondary-foreground">
                        {SECTOR_LABELS[project.sector]}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-medium">
                        {Math.round((project.fundingRaised / (project.fundingAsk || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (project.fundingRaised / (project.fundingAsk || 1)) * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="currency-ada">₳{project.fundingRaised.toLocaleString()}</span>
                      <span className="text-muted-foreground">of ₳{(project.fundingAsk || 1).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        )}

        {!isLoading && filteredProjects.length === 0 && (
          <motion.div variants={fadeUp} className="text-center py-16">
            <Rocket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setProjectFilters({
                  stage: 'all',
                  sector: 'all',
                  showArchived: false,
                });
              }}
            >
              Clear all filters
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
