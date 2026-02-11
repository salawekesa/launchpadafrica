import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Info, Rocket, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { NotificationsBell } from './NotificationsBell';
import { cn } from '@/lib/utils';

const minimalNavItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/community', label: 'Community', icon: MessageCircle },
  { path: '/about', label: 'About', icon: Info },
  { path: '/launchpad', label: 'Launch Pad', icon: Rocket },
];

export function MinimalHeader() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b safe-top">
      <div className="container flex h-14 md:h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors" />
            <Rocket className="absolute inset-1 w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Launch<span className="text-primary">Pad</span>
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {minimalNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  'hover:bg-primary/10 hover:text-primary',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user?.id && (
            <NotificationsBell userId={parseInt(user.id, 10)} userIdStr={user.id} />
          )}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-primary">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">{user?.name?.charAt(0) || 'U'}</span>
                  </div>
                  <span className="hidden md:inline">{user?.name?.split(' ')[0]}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
              <Link to="/signup"><Button size="sm" className="glow-primary">Join Launch Pad</Button></Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
