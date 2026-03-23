import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  Inbox, 
  LayoutDashboard, 
  Settings, 
  Users, 
  Building2,
  LogOut,
  ShieldCheck,
  Send,
  FilePlus,
  Search,
  Archive,
  User,
  BarChart,
  GitBranch
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const mainItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/inbox", label: "In-Tray", icon: Inbox },
    { href: "/out-tray", label: "Out-Tray", icon: Send },
    { href: "/documents/new", label: "New Document", icon: FilePlus },
    { href: "/search", label: "Search Files", icon: Search },
    { href: "/archive", label: "Archive", icon: Archive },
    { href: "/profile", label: "My Profile", icon: User },
  ];

  const adminItems = [
    { href: "/admin/reports", label: "Reports", icon: BarChart },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/roles", label: "Role Management", icon: ShieldCheck },
    { href: "/admin/workflow", label: "Workflow Config", icon: GitBranch },
    { href: "/admin/offices", label: "Office Management", icon: Building2 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const isAdmin = user?.role?.level && user.role.level >= 90; // Assuming high level is admin

  return (
    <div className="flex flex-col w-64 bg-sidebar text-sidebar-foreground h-full border-r border-sidebar-border shadow-xl z-20">
      <div className="p-4 flex items-center space-x-3 border-b border-sidebar-border bg-white/5">
        <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg shrink-0">
          <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col overflow-hidden text-white">
          <span className="font-bold text-lg leading-tight tracking-tight">STIS-EDRMS</span>
          <span className="text-[9px] uppercase tracking-wider text-sidebar-foreground/60 font-medium truncate">Ministry of Science & Tech</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-8">
        <div className="px-4">
          <p className="px-2 text-[11px] font-bold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
            MAIN
          </p>
          <nav className="space-y-0.5">
            {mainItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group border-l-2",
                    isActive 
                      ? "bg-sidebar-accent border-sidebar-primary text-white" 
                      : "border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {(isAdmin || true) && (
          <div className="px-4">
            <p className="px-2 text-[11px] font-bold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              ADMINISTRATION
            </p>
            <nav className="space-y-0.5">
              {adminItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group border-l-2",
                      isActive 
                        ? "bg-sidebar-accent border-sidebar-primary text-white" 
                        : "border-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-xs shrink-0">
              {user?.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">{user?.name}</span>
              <span className="text-[10px] text-sidebar-foreground/60 truncate">{user?.role?.name} • {user?.department?.code}</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-2 rounded-lg text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-white transition-colors shrink-0"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
