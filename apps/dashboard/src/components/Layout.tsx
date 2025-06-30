import { ReactNode, useState } from 'react';
import { cn } from '../utils/cn';
import { UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { useClerkAccessToken } from '../hooks/useClerkAccessToken';
import { useAtomValue } from 'jotai';
import { clerkAccessTokenAtom } from '../store/clerkAccessToken.atom';

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  label: string;
  icon: ReactNode;
  path: string;
}

const menuItemsBase: MenuItem[] = [
  { label: 'Home', icon: <span>🏠</span>, path: '/' },
  { label: 'Map', icon: <span>🗺️</span>, path: '/bins' },
];

const ICON_SIZE = 'w-10 h-10';
const COLLAPSED_WIDTH = 'w-14';
const EXPANDED_WIDTH = 'w-56';

const SideMenu = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <nav className="flex flex-1 flex-col gap-2 p-2">
      {menuItemsBase.map((item) => (
        <Link
          key={item.label}
          to={item.path}
          className={cn(
            'flex cursor-pointer items-center gap-2 overflow-hidden rounded px-2 py-1 hover:bg-gray-100',
          )}
        >
          <span className={cn(ICON_SIZE, 'flex items-center justify-center')}>
            {item.icon}
          </span>
          <span
            className={cn(
              'inline-block w-32 min-w-32 transition-opacity duration-200',
              collapsed && 'pointer-events-none opacity-0',
            )}
          >
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
};

const Layout = ({ children }: LayoutProps) => {
  useClerkAccessToken();
  const [collapsed, setCollapsed] = useState(false);
  const accessToken = useAtomValue(clerkAccessTokenAtom);

  if (!accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        awaiting for access token from clerk...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={cn(
          'flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-200',
          collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        )}
      >
        <button
          className={cn(
            'flex cursor-pointer items-center justify-center truncate border-b border-gray-200 p-2 hover:bg-gray-100 focus:outline-none',
            EXPANDED_WIDTH,
            collapsed && COLLAPSED_WIDTH,
          )}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          type="button"
        >
          <span>{collapsed ? <>&#9654;</> : <>&#9664; Collapse</>}</span>
        </button>
        <div className="flex flex-1 flex-col">
          <SideMenu collapsed={collapsed} />
          <div className="mt-auto p-2">
            {!collapsed && (
              <div className="mb-2 max-h-[50px] w-full truncate border border-slate-500 px-4 py-2">
                {accessToken}
              </div>
            )}
            <UserButton />
          </div>
        </div>
      </aside>
      <main className="mx-auto flex max-h-screen w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
