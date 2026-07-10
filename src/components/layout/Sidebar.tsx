import {
  Bell,
  Building2,
  ChevronRight,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Package2,
  Ruler,
  Settings,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { logout } from "@/app/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Tableau de bord" },
  { path: "/bons", icon: ClipboardList, label: "Bons" },
  { path: "/stock", icon: Package, label: "État du stock" },
  { path: "/inventaire", icon: Package2, label: "Inventaire" },
  { path: "/rapport", icon: ClipboardList, label: "Rapport de sortie" },
];

const adminItems = [
  { path: "/admin/articles", icon: Package, label: "Articles" },
  { path: "/admin/secteurs", icon: Building2, label: "Secteurs" },
  { path: "/admin/unites", icon: Ruler, label: "Unités de mesure" },
  { path: "/admin/utilisateurs", icon: Users, label: "Utilisateurs" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    dispatch(logout());
    onClose?.();
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo */}
      <div className="border-b border-slate-200/80 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-navy-600 to-navy-800 shadow-lg shadow-navy-500/20">
            <img
              src="/Overwatch.png"
              alt="OverWatch Logo"
              className="h-8 w-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-navy-900 leading-none">
              OverWatch
            </h1>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Gestion de stock
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-linear-to-r from-navy-50 to-navy-100/50 text-navy-900 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                )}
              >
                <div
                  className={cn(
                    "rounded-lg p-1.5 transition-colors",
                    isActive
                      ? "bg-navy-900 text-white"
                      : "text-slate-400 group-hover:text-navy-600",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className="h-8 w-1 rounded-full bg-linear-to-b from-navy-600 to-navy-800" />
                )}
              </NavLink>
            );
          })}

          {isAdmin && (
            <>
              <div className="flex items-center gap-3 px-3 py-3">
                <div className="h-px flex-1 bg-slate-200/80" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Administration
                </span>
                <div className="h-px flex-1 bg-slate-200/80" />
              </div>

              {adminItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-linear-to-r from-navy-50 to-navy-100/50 text-navy-900 shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg p-1.5 transition-colors",
                        isActive
                          ? "bg-navy-900 text-white"
                          : "text-slate-400 group-hover:text-navy-600",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <div className="h-8 w-1 rounded-full bg-linear-to-b from-navy-600 to-navy-800" />
                    )}
                  </NavLink>
                );
              })}
            </>
          )}
        </nav>
      </ScrollArea>

      {/* Footer - User */}
      <div className="border-t border-slate-200/80 bg-slate-50/50 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-slate-100"
            >
              <Avatar className="h-10 w-10 ring-2 ring-navy-100 ring-offset-2 ring-offset-white">
                <AvatarFallback className="bg-linear-to-br from-navy-500 to-navy-700 text-sm font-semibold">
                  {getInitials(user?.username || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-slate-900 leading-none">
                  {user?.username}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {user?.role === "ADMIN" ? "Administrateur" : "Gestionnaire"}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.username}
                </p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Mon compte
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400">En ligne</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="relative h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden h-screen w-70 flex-col fixed left-0 top-0 border-r border-slate-200/80 bg-white shadow-sm lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg border-slate-200 bg-white shadow-sm hover:bg-slate-50"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-70 p-0">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
