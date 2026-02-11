import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderKanban, Plus, ArrowRight, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useHackathonStore } from '@/modules/hackathon';
import { useEffect } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * My Hackathon – HackQuest-style "Create a project" / my projects dashboard.
 * Same concept as https://www.hackquest.io/my-hackathon
 */
export default function MyHackathon() {
  const { user, isAuthenticated } = useAuthStore();
  const { getHackathonsByHost, loadHackathons } = useHackathonStore();
  useEffect(() => {
    loadHackathons();
  }, [loadHackathons]);
  const myHackathons = user?.id ? getHackathonsByHost(user.id) : [];

  if (!isAuthenticated) {
    return (
      <div className="container py-12 max-w-2xl text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} className="mb-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Start a project</h1>
            <p className="text-muted-foreground mb-6">
              Roll up your sleeves and start building your Web3 project. From smart contracts to dApps, turn your ideas into reality step by step.
            </p>
            <Button asChild className="glow-primary">
              <Link to="/login">Sign in to create a project</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Hackathon</h1>
          <p className="text-muted-foreground">
            Create a project, manage your hackathons, and track your journey—all in one place.
          </p>
        </motion.div>

        {/* Create project CTA – HackQuest "Start a project" */}
        <motion.div variants={fadeUp} className="mb-10">
          <div className="rounded-2xl border border-border bg-card/50 p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FolderKanban className="w-12 h-12 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-semibold mb-1">Start a project</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Roll up your sleeves and start building your Web3 project. From smart contracts to dApps, turn your ideas into reality step by step.
              </p>
              <Button asChild className="shrink-0 glow-primary">
                <Link to="/hackathon/create" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create a project
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* My hackathons (hosted) */}
        {myHackathons.length > 0 && (
          <motion.section variants={fadeUp}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Hackathons you host
            </h2>
            <div className="space-y-3">
              {myHackathons.map((h) => (
                <Link
                  key={h.id}
                  to={`/hackathon/${h.id}`}
                  className="block p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">{h.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Users className="w-4 h-4" />
                        {h.participants} participants · {h.status}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </motion.div>
    </div>
  );
}
