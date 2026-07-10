import { format, subDays } from "date-fns";
import {
  AlertTriangle,
  Building2,
  CalendarIcon,
  Package,
  Package2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import {
  useGetArticlesQuery,
  useGetSecteursQuery,
} from "../../articles/articleApi";
import {
  useGetInventaireQuery,
  useGetRapportMouvementsQuery,
} from "../inventaireApi";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function Inventaire() {
  const today = new Date();
  const [dateDebut, setDateDebut] = useState<Date>(subDays(today, 30));
  const [dateFin, setDateFin] = useState<Date>(today);
  const [secteurFilter, setSecteurFilter] = useState<string>("TOUS");
  const [articleFilter, setArticleFilter] = useState<string>("TOUS");
  const [activeTab, setActiveTab] = useState<"articles" | "secteurs">(
    "articles",
  );

  const { data: secteursData } = useGetSecteursQuery();
  const { data: articlesData } = useGetArticlesQuery();
  const secteurs = secteursData?.results || [];
  const articles = articlesData?.results || [];

  const { data: inventaire, isLoading: isLoadingInventaire } =
    useGetInventaireQuery({
      date_debut: format(dateDebut, "yyyy-MM-dd"),
      date_fin: format(dateFin, "yyyy-MM-dd"),
      secteur: secteurFilter !== "TOUS" ? Number(secteurFilter) : undefined,
      article: articleFilter !== "TOUS" ? Number(articleFilter) : undefined,
    });

  const { data: rapport, isLoading: isLoadingRapport } =
    useGetRapportMouvementsQuery({
      date_debut: format(dateDebut, "yyyy-MM-dd"),
      date_fin: format(dateFin, "yyyy-MM-dd"),
      type: "SORTIE",
      secteur: secteurFilter !== "TOUS" ? Number(secteurFilter) : undefined,
      article: articleFilter !== "TOUS" ? Number(articleFilter) : undefined,
    });

  const articlesInventaire = inventaire?.articles || [];

  // Créer un map des seuils d'alerte par article
  const seuilsMap: Record<number, number | null> = {};
  for (const article of articles) {
    seuilsMap[article.id] = article.seuil_alerte;
  }

  // Articles sous seuil
  const articlesSousSeuil = articlesInventaire.filter((a) => {
    const seuil = seuilsMap[a.article_id];
    return seuil && a.quantite_restante < seuil;
  });

  // Ventilation par secteur
  const secteursVentilation: { nom: string; total: number; nbBons: number }[] =
    [];
  const secteursMap: Record<string, { total: number; nbBons: number }> = {};

  if (rapport?.resultats) {
    for (const bon of rapport.resultats) {
      const nom = bon.secteur_nom || "Non défini";
      if (!secteursMap[nom]) {
        secteursMap[nom] = { total: 0, nbBons: 0 };
      }
      for (const ligne of bon.lignes) {
        secteursMap[nom].total += ligne.quantite;
      }
      secteursMap[nom].nbBons += 1;
    }
    for (const [nom, data] of Object.entries(secteursMap)) {
      secteursVentilation.push({ nom, total: data.total, nbBons: data.nbBons });
    }
    secteursVentilation.sort((a, b) => b.total - a.total);
  }

  // Statistiques
  const stats = {
    totalArticles: inventaire?.total_articles || 0,
    totalEntrees: articlesInventaire.reduce(
      (sum, a) => sum + a.total_entrees,
      0,
    ),
    totalSorties: articlesInventaire.reduce(
      (sum, a) => sum + a.total_sorties,
      0,
    ),
    articlesSousSeuil: articlesSousSeuil.length,
  };

  const handleDateChange = (debut?: Date, fin?: Date) => {
    if (debut) setDateDebut(debut);
    if (fin) setDateFin(fin);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F4C81]/10">
            <Package2 className="h-5 w-5 text-[#0F4C81]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Inventaire</h2>
            <p className="text-sm text-slate-500">
              {stats.totalArticles} article
              {stats.totalArticles !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sélecteur de période */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-slate-200 justify-start text-left font-normal min-w-[200px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateDebut, "dd/MM/yyyy")} -{" "}
                {format(dateFin, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500">
                      Date de début
                    </p>
                    <Calendar
                      mode="single"
                      selected={dateDebut}
                      onSelect={(date) =>
                        date && handleDateChange(date, undefined)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500">
                      Date de fin
                    </p>
                    <Calendar
                      mode="single"
                      selected={dateFin}
                      onSelect={(date) =>
                        date && handleDateChange(undefined, date)
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateDebut(subDays(today, 7));
                      setDateFin(today);
                    }}
                    className="text-xs flex-1"
                  >
                    7 jours
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateDebut(subDays(today, 30));
                      setDateFin(today);
                    }}
                    className="text-xs flex-1"
                  >
                    30 jours
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateDebut(subDays(today, 90));
                      setDateFin(today);
                    }}
                    className="text-xs flex-1"
                  >
                    90 jours
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Filtre secteur */}
          <Select value={secteurFilter} onValueChange={setSecteurFilter}>
            <SelectTrigger className="w-40 border-slate-200">
              <SelectValue placeholder="Secteur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TOUS">Tous les secteurs</SelectItem>
              {secteurs
                .filter((s) => s.actif)
                .map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.nom}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Filtre article */}
          <Select value={articleFilter} onValueChange={setArticleFilter}>
            <SelectTrigger className="w-40 border-slate-200">
              <SelectValue placeholder="Article" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TOUS">Tous les articles</SelectItem>
              {articles
                .filter((a) => a.actif)
                .map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.nom}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cartes de synthèse */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Articles total</p>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoadingInventaire ? "..." : stats.totalArticles}
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
                <p className="text-sm text-slate-500">Entrées</p>
                <p className="text-2xl font-bold text-teal-600">
                  {isLoadingInventaire
                    ? "..."
                    : formatNumber(stats.totalEntrees)}
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
                <p className="text-sm text-slate-500">Sorties</p>
                <p className="text-2xl font-bold text-amber-600">
                  {isLoadingInventaire
                    ? "..."
                    : formatNumber(stats.totalSorties)}
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-2">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Sous seuil d'alerte</p>
                <p className="text-2xl font-bold text-red-600">
                  {isLoadingInventaire ? "..." : stats.articlesSousSeuil}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "articles" | "secteurs")}
        className="space-y-4"
      >
        <TabsList className="bg-slate-100">
          <TabsTrigger
            value="articles"
            className="data-[state=active]:bg-white"
          >
            Par article
          </TabsTrigger>
          <TabsTrigger
            value="secteurs"
            className="data-[state=active]:bg-white"
          >
            Par secteur
          </TabsTrigger>
        </TabsList>

        {/* Onglet Par article */}
        <TabsContent value="articles">
          {isLoadingInventaire ? (
            <InventaireSkeleton />
          ) : articlesInventaire.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">
                      Article
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">
                      Initial
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right text-teal-600">
                      Entrées
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right text-amber-600">
                      Sorties
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">
                      Restant
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Seuil
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articlesInventaire.map((article) => {
                    const seuil = seuilsMap[article.article_id];
                    const isUnderThreshold =
                      seuil && article.quantite_restante < seuil;

                    return (
                      <TableRow key={article.article_id}>
                        <TableCell className="font-medium text-slate-900">
                          {article.article_nom}
                          <span className="ml-2 text-xs text-slate-400">
                            {article.unite_abbreviation}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-slate-600">
                          {formatNumber(article.quantite_initiale)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-teal-600">
                          +{formatNumber(article.total_entrees)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-amber-600">
                          -{formatNumber(article.total_sorties)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-mono font-semibold",
                            isUnderThreshold
                              ? "text-red-600"
                              : "text-slate-900",
                          )}
                        >
                          {formatNumber(article.quantite_restante)}
                          {isUnderThreshold && (
                            <AlertTriangle className="ml-1 inline h-3 w-3 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          {seuil ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                isUnderThreshold
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : "border-slate-200 bg-slate-50 text-slate-600",
                              )}
                            >
                              {seuil}
                            </Badge>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Onglet Par secteur */}
        <TabsContent value="secteurs">
          {isLoadingRapport ? (
            <SecteurVentilationSkeleton />
          ) : secteursVentilation.length === 0 ? (
            <EmptyState message="Aucune sortie sur cette période" />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">
                      Secteur
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">
                      Quantité totale sortie
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">
                      Nombre de bons
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {secteursVentilation.map((s) => (
                    <TableRow key={s.nom}>
                      <TableCell className="font-medium text-slate-900">
                        <Building2 className="mr-2 inline h-4 w-4 text-slate-400" />
                        {s.nom}
                      </TableCell>
                      <TableCell className="text-right font-mono text-amber-600">
                        {formatNumber(s.total)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-600">
                        {s.nbBons}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Package2 className="h-12 w-12 text-slate-300" />
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        Aucune donnée
      </h3>
      <p className="text-sm text-slate-500">
        {message || "Aucun mouvement sur cette période"}
      </p>
    </div>
  );
}

function InventaireSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            {[
              "Article",
              "Initial",
              "Entrées",
              "Sorties",
              "Restant",
              "Seuil",
            ].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 6 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SecteurVentilationSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            {["Secteur", "Quantité totale", "Nombre de bons"].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 3 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
