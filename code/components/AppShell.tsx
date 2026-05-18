// AppShell — responsive site chrome.
// Desktop (md+): fixed left sidebar, content offset by sidebar width.
// Mobile (<md):  full-width content + bottom tab bar.
import { DesktopNav } from './DesktopNav';
import { MobileTabBar } from './MobileTabBar';
import { MobileTopBar } from './MobileTopBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <DesktopNav />
      <MobileTopBar />
      <div className="md:ml-60 lg:ml-64">
        {children}
      </div>
      <MobileTabBar />
    </div>
  );
}
