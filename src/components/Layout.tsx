import { ReactNode, useState } from "react";
import { cn } from "../utils/cn";
import { SignedOut, SignIn, SignedIn, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useClerkAccessToken } from "../hooks/useClerkAccessToken";
import { useAtomValue } from "jotai";
import { clerkAccessTokenAtom } from "../store/clerkAccessToken.atom";

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  label: string;
  icon: ReactNode;
  path: string;
}

const menuItemsBase: MenuItem[] = [
  { label: "Home", icon: <span>🏠</span>, path: "/" },
  { label: "Map", icon: <span>🗺️</span>, path: "/bins" },
];

const ICON_SIZE = "w-10 h-10";
const COLLAPSED_WIDTH = "w-14";
const EXPANDED_WIDTH = "w-56";

const SideMenu = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <nav className="flex-1 flex flex-col gap-2 p-2">
      {menuItemsBase.map((item) => (
        <Link
          key={item.label}
          to={item.path}
          className={cn(
            "rounded overflow-hidden px-2 py-1 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
          )}
        >
          <span className={cn(ICON_SIZE, "flex items-center justify-center")}>
            {item.icon}
          </span>
          <span
            className={cn(
              "inline-block min-w-32 w-32 transition-opacity duration-200",
              collapsed && "opacity-0 pointer-events-none"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        awaiting for access token from clerk...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside
        className={cn(
          "transition-all duration-200 bg-white border-r border-gray-200 h-screen flex flex-col",
          collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH
        )}
      >
        <button
          className={cn(
            "cursor-pointer truncate flex items-center justify-center p-2 focus:outline-none hover:bg-gray-100 border-b border-gray-200",
            EXPANDED_WIDTH,
            collapsed && COLLAPSED_WIDTH
          )}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
          type="button"
        >
          <span>{collapsed ? <>&#9654;</> : <>&#9664; Collapse</>}</span>
        </button>
        {!collapsed && (
          <div className="w-full max-h-[50px] truncate">{accessToken}</div>
        )}
        <div className="flex-1 flex flex-col">
          <SideMenu collapsed={collapsed} />
          <div className="mt-auto p-2">
            <SignedOut>
              <SignIn signUpUrl={undefined} />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </aside>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 max-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
