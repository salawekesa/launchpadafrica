import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Trophy, TrendingUp, Users, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { STAGE_CONFIG, SECTOR_LABELS } from '@/lib/types';

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

export default function Landing() {
  const { projects, hackathons } = useAppStore();
  
  const activeProjects = projects.filter(p => p.stage !== 'archived');
  const fundedProjects = projects.filter(p => p.stage === 'funded' || p.stage === 'scaling');
  const totalFundingRaised = projects.reduce((sum, p) => sum + p.fundingRaised, 0);
  
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/20 rounded-full blur-[100px] animate-pulse" />
        
        <div className="container relative z-10 py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                <Zap className="w-4 h-4" />
                Pan-African Innovation Platform
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              From{' '}
              <span className="text-gradient">Hackathon</span>
              <br />
              to{' '}
              <span className="text-gradient">Global Impact</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeUp}
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Launch Pad accelerates African innovation. Win hackathons, 
              advance your project, connect with investors, and scale your vision.
            </motion.p>
            
            <motion.div 
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/launchpad">
                <Button size="lg" className="glow-primary gap-2 text-base px-8">
                  <Rocket className="w-5 h-5" />
                  Explore Projects
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                  Join Launch Pad
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: activeProjects.length, label: 'Active Projects', icon: Rocket },
              { value: hackathons.filter(h => h.status === 'completed').length, label: 'Hackathons', icon: Trophy },
              { value: `₳${(totalFundingRaised / 1000).toFixed(0)}K`, label: 'Funding Raised', icon: TrendingUp },
              { value: fundedProjects.length, label: 'Projects Funded', icon: Shield },
            ].map((stat, index) => (
              <motion.div 
                key={index}
                variants={fadeUp}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gradient mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold mb-4">
              Your Path to <span className="text-gradient">Success</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto">
              Launch Pad transforms hackathon victories into lasting ventures through 
              structured progression and investor connections.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                step: '01',
                title: 'Win a Hackathon',
                description: 'Compete in Pan-African hackathons. Winners get fast-tracked to Launch Pad.',
                icon: Trophy,
              },
              {
                step: '02',
                title: 'Advance Your Project',
                description: 'Progress through validated stages. Get mentorship and build your MVP.',
                icon: Rocket,
              },
              {
                step: '03',
                title: 'Attract Investment',
                description: 'Connect with verified investors. Receive pledges and scale your impact.',
                icon: TrendingUp,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className="glass-card p-6 card-hover relative overflow-hidden group"
              >
                <div className="absolute top-4 right-4 text-6xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                  {item.step}
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 border-t border-border/50">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                Featured <span className="text-gradient">Projects</span>
              </h2>
              <p className="text-muted-foreground">
                Innovative solutions solving real African challenges
              </p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link to="/launchpad">
                <Button variant="outline" className="gap-2">
                  View All Projects
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {activeProjects.slice(0, 3).map((project) => (
              <motion.div key={project.id} variants={fadeUp}>
                <Link to={`/project/${project.id}`}>
                  <div className="glass-card p-6 card-hover h-full">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.tagline}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`stage-badge ${STAGE_CONFIG[project.stage].className}`}>
                        {STAGE_CONFIG[project.stage].label}
                      </span>
                      <span className="stage-badge bg-secondary text-secondary-foreground">
                        {SECTOR_LABELS[project.sector]}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div>
                        <div className="text-xs text-muted-foreground">Funding Ask</div>
                        <div className="currency-ada">₳{project.fundingAsk.toLocaleString()}</div>
                      </div>
                      {project.origin === 'hackathon' && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Trophy className="w-3 h-3" />
                          Hackathon Winner
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="glass-card p-8 sm:p-12 text-center relative overflow-hidden"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
            
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                <Globe className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Launch Your Vision?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Whether you're a builder with a groundbreaking idea or an investor 
                seeking high-impact opportunities, Launch Pad is your gateway to 
                African innovation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" className="glow-primary gap-2 px-8">
                    <Users className="w-5 h-5" />
                    Join as Builder
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="lg" variant="outline" className="gap-2 px-8">
                    <TrendingUp className="w-5 h-5" />
                    Join as Investor
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
