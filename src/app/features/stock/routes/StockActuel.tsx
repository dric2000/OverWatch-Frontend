import { format, subDays } from "date-fns";
import {
  AlertTriangle,
  CheckCircle,
  Package,
  Search,
  TrendingDown,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { useGetArticlesQuery } from "../../articles/articleApi";
import { useGetInventaireQuery } from "../../inventaire/inventaireApi";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function StockActuel() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "critical" | "ok">(
    "all",
  );

  // ✅ Récupérer les articles
  const { data: articlesData, isLoading: isLoadingArticles } =
    useGetArticlesQuery();
  const articles = articlesData?.results || [];

  // ✅ Récupérer l'inventaire sur une large période (depuis le début)
  const today = new Date();
  const dateDebut = format(subDays(today, 365), "yyyy-MM-dd"); // 1 an pour avoir tout
  const dateFin = format(today, "yyyy-MM-dd");

  const { data: inventaireData, isLoading: isLoadingInventaire } =
    useGetInventaireQuery({
      date_debut: dateDebut,
      date_fin: dateFin,
    });

  // ✅ Créer un map article_id -> quantite_restante
  const stockMap: Record<number, number> = {};
  for (const item of inventaireData?.articles || []) {
    stockMap[item.article_id] = item.quantite_restante;
  }

  // ✅ Fusionner les données
  const articlesWithStock = articles.map((article) => ({
    ...article,
    quantite_restante: stockMap[article.id] ?? 0,
  }));

  // Filtrer
  const filtered = articlesWithStock.filter((a) => {
    const matchSearch = a.nom.toLowerCase().includes(search.toLowerCase());
    const seuil = a.seuil_alerte || 0;
    const isCritical = a.seuil_alerte !== null && a.quantite_restante < seuil;

    if (filterType === "critical" && !isCritical) return false;
    if (filterType === "ok" && isCritical) return false;

    return matchSearch && a.actif;
  });

  // Stats
  const totalArticles = articles.filter((a) => a.actif).length;
  const articlesAlerte = articlesWithStock.filter((a) => {
    const seuil = a.seuil_alerte || 0;
    return a.seuil_alerte !== null && a.quantite_restante < seuil;
  }).length;

  const isLoading = isLoadingArticles || isLoadingInventaire;

  if (isLoading) {
    return <StockActuelSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F4C81]/10">
            <Package className="h-5 w-5 text-[#0F4C81]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              État du stock
            </h2>
            <p className="text-sm text-slate-500">
              {totalArticles} article{totalArticles !== 1 ? "s" : ""} en stock
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher un article..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-1">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
              className={cn(
                filterType === "all" && "bg-[#0F4C81] hover:bg-[#0d3f6b]",
              )}
            >
              Tous
            </Button>
            <Button
              variant={filterType === "critical" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("critical")}
              className={cn(
                filterType === "critical" && "bg-red-600 hover:bg-red-700",
              )}
            >
              <AlertTriangle className="mr-1 h-3 w-3" />
              Alerte ({articlesAlerte})
            </Button>
            <Button
              variant={filterType === "ok" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("ok")}
              className={cn(
                filterType === "ok" && "bg-emerald-600 hover:bg-emerald-700",
              )}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              OK
            </Button>
          </div>
        </div>
      </div>

      {/* Cartes récapitulatives */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total articles</p>
                <p className="text-2xl font-bold text-slate-900">
                  {totalArticles}
                </p>
              </div>
              <div className="rounded-full bg-[#0F4C81]/10 p-2">
                <Package className="h-5 w-5 text-[#0F4C81]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">En alerte</p>
                <p className="text-2xl font-bold text-red-600">
                  {articlesAlerte}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">OK</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {totalArticles - articlesAlerte}
                </p>
              </div>
              <div className="rounded-full bg-emerald-100 p-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau */}
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-semibold text-slate-700">
                Article
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Unité
              </TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">
                Quantité disponible
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Statut
              </TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">
                Seuil d'alerte
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Package className="h-9 w-9" />
                    <p className="text-sm font-medium text-slate-500">
                      {search
                        ? "Aucun article ne correspond"
                        : "Aucun article enregistré"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered
                .sort((a, b) => {
                  const seuilA = a.seuil_alerte || 0;
                  const seuilB = b.seuil_alerte || 0;
                  const alertA =
                    a.seuil_alerte !== null && a.quantite_restante < seuilA;
                  const alertB =
                    b.seuil_alerte !== null && b.quantite_restante < seuilB;
                  if (alertA && !alertB) return -1;
                  if (!alertA && alertB) return 1;
                  return a.nom.localeCompare(b.nom);
                })
                .map((article) => {
                  const seuil = article.seuil_alerte || 0;
                  const isCritical =
                    article.seuil_alerte !== null &&
                    article.quantite_restante < seuil;
                  const isNear =
                    article.seuil_alerte !== null &&
                    article.quantite_restante < seuil * 1.2;

                  return (
                    <TableRow
                      key={article.id}
                      className="cursor-pointer transition-colors hover:bg-slate-50/80"
                      onClick={() => navigate(`/admin/articles`)}
                    >
                      <TableCell className="font-medium text-slate-900">
                        {article.nom}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {article.unite_mesure_abbreviation}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono font-semibold",
                          isCritical
                            ? "text-red-600"
                            : isNear
                              ? "text-amber-600"
                              : "text-slate-900",
                        )}
                      >
                        {formatNumber(article.quantite_restante)}
                      </TableCell>
                      <TableCell>
                        {isCritical ? (
                          <Badge className="border-red-200 bg-red-100 text-red-700">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Critique
                          </Badge>
                        ) : isNear ? (
                          <Badge className="border-amber-200 bg-amber-100 text-amber-700">
                            <TrendingDown className="mr-1 h-3 w-3" />
                            Bientôt épuisé
                          </Badge>
                        ) : (
                          <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            OK
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-slate-500">
                        {article.seuil_alerte ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StockActuelSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-10 w-72 rounded-md" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
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

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              {["Article", "Unité", "Quantité", "Statut", "Seuil"].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
