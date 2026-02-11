import { Link } from 'react-router-dom';
import { Rocket, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { NotificationsBell } from './NotificationsBell';

export function SidebarTopBar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();

  return (
    <header className="h-14 border-b bg-background/95 flex items-center justify-between px-4 shrink-0">
      <Link to="/" className="flex items-center gap-2">
        <Rocket className="w-5 h-5 text-primary" />
        <span className="font-semibold text-sm">LaunchPad</span>
      </Link>
      <div className="flex items-center gap-2">
        {isAuthenticated && user?.id && (
          <NotificationsBell userId={parseInt(user.id, 10)} userIdStr={user.id} />
        )}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-primary">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        {isAuthenticated ? (
          <>
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{user?.name?.charAt(0) || 'U'}</span>
                </div>
                <span className="text-sm hidden sm:inline">{user?.name?.split(' ')[0]}</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
          </>
        ) : (
          <>
            <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link to="/signup"><Button size="sm">Join</Button></Link>
          </>
        )}
      </div>
    </header>
  );
}
