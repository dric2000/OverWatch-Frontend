import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  ClipboardList,
  Package,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useGetArticlesQuery,
  useGetSecteursQuery,
} from "../../articles/articleApi";
import { useGetInventaireQuery } from "../../inventaire/inventaireApi";
import { useGetBonsQuery } from "../../mouvements/mouvementApi";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

const typeColor = {
  ENTREE: "bg-teal-100 text-teal-700 border-transparent",
  SORTIE: "bg-amber-100 text-amber-700 border-transparent",
};

const typeLabel = {
  ENTREE: "Entrée",
  SORTIE: "Sortie",
};

export function Dashboard() {
  const navigate = useNavigate();
  const today = new Date();
  const dateDebut = format(subDays(today, 30), "yyyy-MM-dd");
  const dateFin = format(today, "yyyy-MM-dd");

  // Données
  const { data: inventaire, isLoading: isLoadingInventaire } =
    useGetInventaireQuery({
      date_debut: dateDebut,
      date_fin: dateFin,
    });

  const { data: bonsData, isLoading: isLoadingBons } = useGetBonsQuery({
    date_debut: dateDebut,
    date_fin: dateFin,
  });

  const { data: articlesData, isLoading: isLoadingArticles } =
    useGetArticlesQuery();
  const { data: secteursData, isLoading: isLoadingSecteurs } =
    useGetSecteursQuery();

  const articles = articlesData?.results || [];
  const secteurs = secteursData?.results || [];
  const bons = bonsData?.results || [];
  const articlesInventaire = inventaire?.articles || [];

  // Stats
  const totalArticles = articles.filter((a) => a.actif).length;
  const totalSecteurs = secteurs.filter((s) => s.actif).length;
  const totalEntrees = articlesInventaire.reduce(
    (sum, a) => sum + a.total_entrees,
    0,
  );
  const totalSorties = articlesInventaire.reduce(
    (sum, a) => sum + a.total_sorties,
    0,
  );

  // Articles sous seuil
  const seuilsMap: Record<number, number | null> = {};
  for (const article of articles) {
    seuilsMap[article.id] = article.seuil_alerte;
  }

  const articlesSousSeuil = articlesInventaire.filter((a) => {
    const seuil = seuilsMap[a.article_id];
    return seuil && a.quantite_restante < seuil;
  });

  // Derniers bons (5 derniers)
  const derniersBons = bons.slice(0, 5);

  const isLoading =
    isLoadingInventaire ||
    isLoadingBons ||
    isLoadingArticles ||
    isLoadingSecteurs;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tableau de bord</h2>
        <p className="text-sm text-slate-500">
          Vue d'ensemble de l'activité des 30 derniers jours
        </p>
      </div>

      {/* Cartes */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Articles actifs</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(totalArticles)}
                </p>
              </div>
              <div className="rounded-full bg-[#0F4C81]/10 p-2">
                <Package className="h-5 w-5 text-[#0F4C81]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Secteurs actifs</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(totalSecteurs)}
                </p>
              </div>
              <div className="rounded-full bg-emerald-100 p-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Entrées (30j)</p>
                <p className="text-2xl font-bold text-teal-600">
                  +{formatNumber(totalEntrees)}
                </p>
              </div>
              <div className="rounded-full bg-teal-100 p-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Sorties (30j)</p>
                <p className="text-2xl font-bold text-amber-600">
                  -{formatNumber(totalSorties)}
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-2">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes + Derniers bons */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alertes */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertes stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            {articlesSousSeuil.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-emerald-100 p-3">
                  <Package className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700">
                  Tout va bien !
                </p>
                <p className="text-xs text-slate-400">
                  Aucun article sous seuil d'alerte
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {articlesSousSeuil.slice(0, 5).map((article) => {
                  const seuil = seuilsMap[article.article_id];
                  return (
                    <div
                      key={article.article_id}
                      className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {article.article_nom}
                        </p>
                        <p className="text-xs text-slate-500">
                          Restant:{" "}
                          <span className="font-mono font-semibold text-red-600">
                            {article.quantite_restante}
                          </span>{" "}
                          / Seuil: {seuil}
                        </p>
                      </div>
                      <Badge className="border-red-200 bg-red-100 text-red-700">
                        Urgent
                      </Badge>
                    </div>
                  );
                })}
                {articlesSousSeuil.length > 5 && (
                  <p className="text-center text-xs text-slate-400">
                    +{articlesSousSeuil.length - 5} autre(s)
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Derniers bons */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <ClipboardList className="h-5 w-5 text-[#0F4C81]" />
                Derniers bons
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#0F4C81] hover:bg-[#0F4C81]/10"
                onClick={() => navigate("/bons")}
              >
                Voir tout
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {derniersBons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ClipboardList className="h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">Aucun bon récent</p>
              </div>
            ) : (
              <div className="space-y-2">
                {derniersBons.map((bon) => {
                  const isEntree = bon.type === "ENTREE";
                  return (
                    <div
                      key={bon.id}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                      onClick={() => navigate(`/bons/${bon.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={typeColor[bon.type]}>
                          {typeLabel[bon.type]}
                        </Badge>
                        <span className="font-mono font-medium text-slate-900">
                          {bon.reference || `#${bon.id}`}
                        </span>
                        <span className="text-sm text-slate-500">
                          {format(
                            new Date(bon.date_heure),
                            "dd/MM/yyyy HH:mm",
                            { locale: fr },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">
                          {bon.lignes.length} article
                          {bon.lignes.length !== 1 ? "s" : ""}
                        </span>
                        <span className="text-sm text-slate-400">
                          {isEntree
                            ? bon.source || "—"
                            : bon.secteur_nom || "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-1 h-4 w-64" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-1 h-7 w-16" />
                </div>
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
