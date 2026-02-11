import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background pattern */}
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-50" />
      
      <Header />
      
      <main className="relative pt-16 pb-20 md:pb-8 min-h-screen">
        <Outlet />
      </main>
      
      <MobileNav />
    </div>
  );
}
