import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, MessageCircle, ExternalLink, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Community() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 text-primary mb-6">
            <Users className="w-10 h-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Launch Pad <span className="text-gradient">Community</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Connect with builders, investors, and innovators shaping Africa's future
          </p>
        </motion.div>

        {/* Telegram Card */}
        <motion.div variants={fadeUp} className="glass-card p-8 text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0088cc]/10 text-[#0088cc] mb-6">
            <MessageCircle className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">Join Our Telegram Community</h2>
          
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Our community lives on Telegram. Join to connect with fellow builders, 
            share progress, get feedback, and discover collaboration opportunities.
          </p>

          <Button 
            size="lg" 
            className="glow-primary gap-2 px-8"
            onClick={() => window.open('https://t.me/launchpad_africa', '_blank')}
          >
            <MessageCircle className="w-5 h-5" />
            Join Telegram Community
            <ExternalLink className="w-4 h-4" />
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Members-only. Verified Launch Pad members get exclusive access.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-2">Network</h3>
            <p className="text-sm text-muted-foreground">
              Connect with 500+ builders and investors across Kenya, Nigeria, and beyond.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-2">Get Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Share your progress, ask questions, and get real feedback from the community.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-2">Exclusive Access</h3>
            <p className="text-sm text-muted-foreground">
              Early access to hackathon announcements, investor events, and opportunities.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <ExternalLink className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-2">Collaborate</h3>
            <p className="text-sm text-muted-foreground">
              Find co-founders, team members, and advisors for your next venture.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
