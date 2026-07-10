import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Building2,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  FileBarChart,
  FileText,
  Package,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useGetArticlesQuery,
  useGetSecteursQuery,
} from "../../articles/articleApi";
import { useGetRapportMouvementsQuery } from "../../inventaire/inventaireApi";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatDate(date: string): string {
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: fr });
}

// function formatDateShort(date: string): string {
//   return format(new Date(date), "dd MMM yyyy", { locale: fr });
// }

const typeColor = {
  ENTREE: "bg-teal-100 text-teal-700 border-transparent hover:bg-teal-100",
  SORTIE: "bg-amber-100 text-amber-700 border-transparent hover:bg-amber-100",
};

const typeLabel = {
  ENTREE: "Entrée",
  SORTIE: "Sortie",
};

export function RapportSortie() {
  const today = new Date();
  const [dateDebut, setDateDebut] = useState<Date>(subDays(today, 30));
  const [dateFin, setDateFin] = useState<Date>(today);
  const [secteurFilter, setSecteurFilter] = useState<string>("TOUS");
  const [articleFilter, setArticleFilter] = useState<string>("TOUS");
  const [openBonId, setOpenBonId] = useState<number | null>(null);

  const { data: secteursData } = useGetSecteursQuery();
  const { data: articlesData } = useGetArticlesQuery();
  const secteurs = secteursData?.results || [];
  const articles = articlesData?.results || [];

  const { data, isLoading } = useGetRapportMouvementsQuery({
    date_debut: format(dateDebut, "yyyy-MM-dd"),
    date_fin: format(dateFin, "yyyy-MM-dd"),
    type: "SORTIE",
    secteur: secteurFilter !== "TOUS" ? Number(secteurFilter) : undefined,
    article: articleFilter !== "TOUS" ? Number(articleFilter) : undefined,
  });

  const bons = data?.resultats || [];
  const total = data?.total || 0;

  // Statistiques
  const stats = {
    totalBons: total,
    totalArticles: bons.reduce((sum, bon) => sum + bon.nb_lignes, 0),
    secteursConcernes: new Set(bons.map((b) => b.secteur_nom).filter(Boolean))
      .size,
  };

  const toggleBon = (id: number) => {
    setOpenBonId(openBonId === id ? null : id);
  };

  const getReference = (bon: { reference: string | null; id: number }) => {
    return bon.reference || `#${bon.id}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F4C81]/10">
            <FileBarChart className="h-5 w-5 text-[#0F4C81]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Rapport de sortie
            </h2>
            <p className="text-sm text-slate-500">
              {total} bon{total !== 1 ? "s" : ""} sur la période
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Période */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-slate-200 justify-start text-left font-normal min-w-50"
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
                      onSelect={(date) => date && setDateDebut(date)}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500">
                      Date de fin
                    </p>
                    <Calendar
                      mode="single"
                      selected={dateFin}
                      onSelect={(date) => date && setDateFin(date)}
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
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total des sorties</p>
                <p className="text-2xl font-bold text-amber-600">
                  {isLoading ? "..." : formatNumber(stats.totalBons)}
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
                <p className="text-sm text-slate-500">Articles sortis</p>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? "..." : formatNumber(stats.totalArticles)}
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
                <p className="text-sm text-slate-500">Secteurs concernés</p>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? "..." : stats.secteursConcernes}
                </p>
              </div>
              <div className="rounded-full bg-emerald-100 p-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des bons */}
      <div className="space-y-3">
        {isLoading ? (
          <RapportSkeleton />
        ) : bons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Aucune sortie
            </h3>
            <p className="text-sm text-slate-500">
              Aucun bon de sortie sur cette période
            </p>
          </div>
        ) : (
          bons.map((bon) => {
            const isOpen = openBonId === bon.id;

            return (
              <Collapsible
                key={bon.id}
                open={isOpen}
                onOpenChange={() => toggleBon(bon.id)}
                className="overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
              >
                <CollapsibleTrigger asChild>
                  <div className="flex cursor-pointer items-center justify-between p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <Badge className={typeColor[bon.type]}>
                        {typeLabel[bon.type]}
                      </Badge>
                      <span className="font-mono font-medium text-slate-900">
                        {getReference(bon)}
                      </span>
                      <span className="text-sm text-slate-500">
                        {formatDate(bon.date_heure)}
                      </span>
                      <span className="text-sm text-slate-500 truncate">
                        {bon.secteur_nom || "—"}
                      </span>
                      <Badge
                        variant="outline"
                        className="border-slate-200 text-slate-600"
                      >
                        {bon.nb_lignes} article{bon.nb_lignes !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <Separator />
                  <div className="p-4 bg-slate-50/50">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Secteur
                        </p>
                        <p className="text-slate-700">
                          {bon.secteur_nom || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Bénéficiaire
                        </p>
                        <p className="text-slate-700">
                          {bon.beneficiaire || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Enregistré par
                        </p>
                        <p className="text-slate-700">
                          {bon.utilisateur_username}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Date
                        </p>
                        <p className="text-slate-700">
                          {formatDate(bon.date_heure)}
                        </p>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white hover:bg-white">
                          <TableHead className="font-semibold text-slate-700">
                            Article
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700 text-right">
                            Quantité
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700">
                            Unité
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bon.lignes.map((ligne) => (
                          <TableRow key={ligne.id} className="bg-white">
                            <TableCell className="font-medium text-slate-900">
                              {ligne.article_nom}
                            </TableCell>
                            <TableCell className="text-right font-mono text-slate-700">
                              {ligne.quantite}
                            </TableCell>
                            <TableCell className="text-slate-500">
                              {ligne.article_unite}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-white font-medium">
                          <TableCell
                            colSpan={3}
                            className="text-right text-slate-700"
                          >
                            Total :{" "}
                            {bon.lignes.reduce((sum, l) => sum + l.quantite, 0)}{" "}
                            articles
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
        )}
      </div>
    </div>
  );
}

function RapportSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-slate-200 p-4"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
