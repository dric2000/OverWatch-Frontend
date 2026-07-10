import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Search,
  Settings,
  User,
} from "lucide-react";
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
import { Input } from "../ui/input";

import { logout } from "@/app/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ title = "Tableau de bord" }: HeaderProps) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm flex items-center justify-between px-4 md:px-8">
      {/* Titre */}
      <h1 className="text-lg md:text-xl font-bold text-navy-900 leading-tight truncate">
        {title}
      </h1>

      {/* Actions - responsive */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Recherche - cachée sur mobile */}
        <div className="hidden md:flex items-center relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Rechercher..."
            className="h-9 w-48 pl-9 pr-4 rounded-lg bg-slate-50 border-slate-200 text-sm placeholder:text-slate-400 focus:bg-white focus:border-navy-300 transition-all"
          />
        </div>

        {/* Séparateur - caché sur mobile */}
        <div className="hidden md:block h-6 w-px bg-slate-200" />

        {/* Boutons d'action - icônes seulement sur mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex h-9 w-9 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex h-9 w-9 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* Séparateur - caché sur mobile */}
        <div className="hidden sm:block h-6 w-px bg-slate-200" />

        {/* Profil utilisateur */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 md:gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-all h-auto"
            >
              <Avatar className="h-8 w-8 ring-2 ring-navy-100 ring-offset-2 ring-offset-white">
                <AvatarFallback className="bg-linear-to-br from-navy-500 to-navy-700 text-xs font-semibold">
                  {getInitials(user?.username || "U")}
                </AvatarFallback>
              </Avatar>
              {/* Nom - caché sur mobile */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-900 leading-none">
                  {user?.username}
                </p>
                <p className="text-xs text-slate-400 leading-none mt-0.5">
                  {user?.role === "ADMIN" ? "Admin" : "Gestionnaire"}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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
              Mon profil
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
      </div>
    </header>
  );
}
