import { motion } from 'framer-motion';
import { Rocket, Target, Heart, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10"
      >
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">About Launch Pad</h1>
          <p className="text-muted-foreground text-lg">
            The platform for builders, investors, and innovators shaping the future.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6">
            <Target className="w-10 h-10 text-primary mb-3" />
            <h2 className="font-semibold text-lg mb-2">Our Mission</h2>
            <p className="text-sm text-muted-foreground">
              To connect promising startups with the resources, community, and opportunities they need to grow and succeed.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <Rocket className="w-10 h-10 text-primary mb-3" />
            <h2 className="font-semibold text-lg mb-2">What We Do</h2>
            <p className="text-sm text-muted-foreground">
              We run hackathons, host community forums, and provide a launch pad for projects to get feedback, find collaborators, and reach the next stage.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <Heart className="w-10 h-10 text-primary mb-3" />
            <h2 className="font-semibold text-lg mb-2">Community First</h2>
            <p className="text-sm text-muted-foreground">
              Builders, investors, and mentors come together here. Join forums, attend events, and collaborate in real time.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <Zap className="w-10 h-10 text-primary mb-3" />
            <h2 className="font-semibold text-lg mb-2">Get Started</h2>
            <p className="text-sm text-muted-foreground">
              Create a project, explore hackathons, or join the community. Create an account to submit projects and participate in events.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
