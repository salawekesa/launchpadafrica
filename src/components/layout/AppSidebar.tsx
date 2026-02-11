import { Link, useLocation } from 'react-router-dom';
import {
  Trophy,
  FolderKanban,
  MessageCircle,
  Users,
  BookOpen,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  MoreHorizontal,
  Wallet,
  Coins,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

const buildItems = [
  { path: '/my-hackathon', label: 'My Hackathon', icon: FolderKanban },
  { path: '/hackathons', label: 'Explore Hackathon', icon: Trophy },
  { path: '/dashboard', label: 'Project Archive', icon: LayoutDashboard },
];

const investorItems = [
  { path: '/investor/explore', label: 'Explore Projects', icon: TrendingUp },
  { path: '/investor/fund', label: 'Fund / Donate', icon: Coins },
  { path: '/investor/my-investments', label: 'My Investments', icon: Wallet },
  { path: '/investor/wallets', label: 'Project Wallets', icon: Wallet },
];

const communityItems = [
  { path: '/community', label: 'Forum', icon: MessageCircle },
  { path: '/community', label: 'Global Event', icon: MessageCircle },
  { path: '/community', label: 'My Community', icon: Users },
  { path: '/community', label: 'Co-learning', icon: BookOpen },
];

export function AppSidebar() {
  const location = useLocation();
  const { activeProfile, user } = useAuthStore();
  const [buildOpen, setBuildOpen] = useState(true);
  const [investOpen, setInvestOpen] = useState(true);
  const [communityOpen, setCommunityOpen] = useState(true);
  const kycComplete = user?.verificationLevel === 'level2';
  const isInvestor = activeProfile === 'investor' && kycComplete;

  return (
    <aside className="w-full h-full border-r bg-card/50 flex flex-col overflow-y-auto">
      <nav className="flex flex-col flex-1 px-4 pt-8 pb-10 space-y-8">
        {!isInvestor && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setBuildOpen(!buildOpen)}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {buildOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Build
          </button>
          {buildOpen && (
            <div className="ml-3 mt-2 space-y-1.5">
              {buildItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path + item.label}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors',
                      isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        )}

        {isInvestor && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setInvestOpen(!investOpen)}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {investOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Investor
          </button>
          {investOpen && (
            <div className="ml-3 mt-2 space-y-1.5">
              {investorItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path + item.label}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors',
                      isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setCommunityOpen(!communityOpen)}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {communityOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Community
          </button>
          {communityOpen && (
            <div className="ml-3 mt-2 space-y-1.5">
              {communityItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path + item.label}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors',
                      isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-4 mt-auto border-t border-border/60">
          <Link
            to="/community"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <MoreHorizontal className="w-4 h-4 shrink-0" />
            More
          </Link>
        </div>
      </nav>
    </aside>
  );
}
