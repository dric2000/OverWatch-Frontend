import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  ShieldCheck,
  User,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { setCredentials } from "../authSlice";
import { useLoginMutation } from "../authApi";
import { useAppDispatch, useAppSelector } from "../../hooks";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const loginSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const features = [
  { icon: Activity, label: "Suivi des mouvements en temps réel" },
  { icon: ShieldCheck, label: "Traçabilité complète des entrées et sorties" },
];

export function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      const result = await login(data).unwrap();
      const { access, refresh } = result;

      const meResponse = await fetch(`${API_URL}/auth/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      if (!meResponse.ok) throw new Error("Impossible de récupérer le profil");
      const user = await meResponse.json();

      dispatch(setCredentials({ user, access, refresh }));
      toast.success("Connexion réussie !");
      navigate("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error?.data?.detail || "Identifiants incorrects");
      toast.error(error?.data?.detail || "Identifiants incorrects");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Panneau gauche */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#0B3B63]">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -right-40 -top-40 h-115 w-115 rounded-full border border-white/10" />
        <div className="absolute -right-20 -top-20 h-75 w-75 rounded-full border border-white/10" />
        <div className="absolute -left-24 -bottom-24 h-85 w-85 rounded-full bg-[#0E7C86]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between w-full p-14 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm ring-1 ring-white/15">
              <Activity className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <span className="font-mono text-xs tracking-[0.2em] text-white/50 uppercase">
              v1.0
            </span>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <h1 className="text-5xl font-semibold tracking-tight">OverWatch</h1>
            <div className="mt-4 h-px w-14 bg-[#0E7C86]" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Centre Déo Gracias — Analyses biomédicales
            </p>

            <ul className="mt-10 space-y-3">
              {features.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 text-sm text-white/70"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-[#0E7C86]"
                    strokeWidth={2}
                  />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/30">
            Application interne — usage réservé au personnel autorisé
          </p>
        </div>
      </div>

      {/* Panneau droit - Formulaire simplifié */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-95 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Logo mobile */}
          <div className="mb-10 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#0B3B63]">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[#0B3B63]">OverWatch</h2>
            <p className="text-sm text-slate-500">Centre Déo Gracias</p>
          </div>

          <div className="mb-8 space-y-1.5">
            <h2 className="text-2xl font-semibold text-slate-900">Bienvenue</h2>
            <p className="text-sm text-slate-500">
              Connectez-vous pour accéder à la gestion de stock
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Champ Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="username"
                  placeholder="votre.identifiant"
                  autoComplete="username"
                  className="h-11 border-slate-200 bg-white pl-10 focus-visible:ring-[#0B3B63]"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Champ Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11 border-slate-200 bg-white pl-10 pr-10 focus-visible:ring-[#0B3B63]"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  tabIndex={-1}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Erreur globale */}
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}

            {/* Bouton */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full bg-[#0B3B63] font-medium text-white transition-all hover:bg-[#0B3B63]/90 hover:shadow-md hover:shadow-[#0B3B63]/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Se connecter
                </>
              )}
            </Button>

            <p className="pt-2 text-center text-xs text-slate-400">
              OverWatch — Gestion de stock pour le centre Déo Gracias
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
