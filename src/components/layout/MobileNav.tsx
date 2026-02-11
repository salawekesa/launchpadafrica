import { Link, useLocation } from 'react-router-dom';
import { Home, Rocket, Trophy, User, Users, FolderKanban } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Home', icon: Home, public: true },
  { path: '/community', label: 'Community', icon: Users, public: true },
  { path: '/launchpad', label: 'Projects', icon: Rocket, public: true },
  { path: '/hackathons', label: 'Hackathons', icon: Trophy, public: true },
  { path: '/my-hackathon', label: 'Create', icon: FolderKanban, public: false },
  { path: '/dashboard', label: 'Dashboard', icon: User, public: false },
];

export function MobileNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const visibleNavItems = navItems.filter(
    item => item.public || isAuthenticated
  ).slice(0, 5); // Max 5 items for mobile nav

  return (
    <nav className="mobile-nav md:hidden">
      <div className="flex items-center justify-around py-2 safe-bottom">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative p-1.5 rounded-lg transition-colors",
                isActive && "bg-primary/10"
              )}>
                <Icon className="w-5 h-5" />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
