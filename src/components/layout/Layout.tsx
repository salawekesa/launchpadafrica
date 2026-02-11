import { Outlet, useLocation } from 'react-router-dom';
import { MinimalHeader } from './MinimalHeader';
import { Header } from './Header';
import { AppSidebar } from './AppSidebar';
import { SidebarTopBar } from './SidebarTopBar';
import { MobileNav } from './MobileNav';

const isHome = (path: string) => path === '/' || path === '';

export function Layout() {
  const location = useLocation();
  const onHome = isHome(location.pathname);

  if (onHome) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 grid-pattern pointer-events-none opacity-50" />
        <MinimalHeader />
        <main className="relative pt-14 md:pt-16 pb-20 md:pb-8 min-h-screen">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-50" />
      <div className="fixed left-0 top-0 bottom-0 w-56 z-40 hidden md:block">
        <AppSidebar />
      </div>
      <div className="md:pl-56 flex flex-col min-h-screen">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
          <SidebarTopBar />
        </div>
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
