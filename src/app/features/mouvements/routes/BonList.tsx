import {
  ArrowDown,
  ArrowUp,
  Box,
  ChevronDown,
  ClipboardList,
  Eye,
  FilePlus,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useGetSecteursQuery } from "../../articles/articleApi";
import {
  useDeleteBonMutation,
  useGetBonsQuery,
  type Bon,
} from "../mouvementApi";
import { BonForm } from "./BonForm";

const typeColor = {
  ENTREE: "bg-teal-100 text-teal-700 border-transparent hover:bg-teal-100",
  SORTIE: "bg-amber-100 text-amber-700 border-transparent hover:bg-amber-100",
};

const typeIcon = {
  ENTREE: ArrowDown,
  SORTIE: ArrowUp,
};

const typeLabel = {
  ENTREE: "Entrée",
  SORTIE: "Sortie",
};

export function BonList() {
  const [selectedType, setSelectedType] = useState<"ENTREE" | "SORTIE">(
    "ENTREE",
  );
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"TOUS" | "ENTREE" | "SORTIE">(
    "TOUS",
  );
  const [secteurFilter, setSecteurFilter] = useState<string>("TOUS");
  const [dateDebut, setDateDebut] = useState<Date | undefined>();
  const [dateFin, setDateFin] = useState<Date | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBon, setEditingBon] = useState<Bon | null>(null);

  const { data: secteursData } = useGetSecteursQuery();
  const secteurs = secteursData?.results || [];

  const { data, isLoading } = useGetBonsQuery({
    type: typeFilter === "TOUS" ? undefined : typeFilter,
    secteur: secteurFilter === "TOUS" ? undefined : Number(secteurFilter),
    date_debut: dateDebut ? format(dateDebut, "yyyy-MM-dd") : undefined,
    date_fin: dateFin ? format(dateFin, "yyyy-MM-dd") : undefined,
    search: search || undefined,
  });

  const bons = data?.results || [];
  const [deleteBon, { isLoading: isDeleting }] = useDeleteBonMutation();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBon(deleteId).unwrap();
      toast.success("Bon supprimé avec succès");
      setDeleteId(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleEdit = (bon: Bon) => {
    setEditingBon(bon);
    setFormOpen(true);
  };

  const getReference = (bon: Bon) => {
    return bon.reference || `#${bon.id}`;
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: fr });
  };

  if (isLoading) {
    return <BonListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F4C81]/10">
            <ClipboardList className="h-5 w-5 text-[#0F4C81]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Bons</h2>
            <p className="text-sm text-slate-500">
              {bons.length} bon{bons.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-[#0F4C81] hover:bg-[#0d3f6b]">
              <FilePlus className="mr-2 h-4 w-4" />
              Nouveau bon
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                setEditingBon(null);
                setFormOpen(true);
                setSelectedType("ENTREE");
              }}
            >
              <ArrowDown className="mr-2 h-4 w-4 text-teal-600" />
              Bon d'entrée
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                setEditingBon(null);
                setFormOpen(true);
                setSelectedType("SORTIE");
              }}
            >
              <ArrowUp className="mr-2 h-4 w-4 text-amber-600" />
              Bon de sortie
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Tabs
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-slate-100">
            <TabsTrigger value="TOUS">Tous</TabsTrigger>
            <TabsTrigger
              value="ENTREE"
              className="text-teal-600 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
            >
              Entrées
            </TabsTrigger>
            <TabsTrigger
              value="SORTIE"
              className="text-amber-600 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700"
            >
              Sorties
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-1 flex-wrap gap-2">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Rechercher..."
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

          <Select value={secteurFilter} onValueChange={setSecteurFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Secteur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TOUS">Tous les secteurs</SelectItem>
              {secteurs.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-auto",
                  (dateDebut || dateFin) && "border-[#0F4C81] text-[#0F4C81]",
                )}
              >
                Période
                {(dateDebut || dateFin) && (
                  <span className="ml-1 text-xs">
                    {dateDebut && format(dateDebut, "dd/MM/yy")}
                    {dateDebut && dateFin && " - "}
                    {dateFin && format(dateFin, "dd/MM/yy")}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex flex-col gap-2 p-3">
                <div className="flex gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500">Début</span>
                    <Calendar
                      mode="single"
                      selected={dateDebut}
                      onSelect={setDateDebut}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500">Fin</span>
                    <Calendar
                      mode="single"
                      selected={dateFin}
                      onSelect={setDateFin}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateDebut(undefined);
                    setDateFin(undefined);
                  }}
                  className="text-slate-500"
                >
                  Effacer
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-semibold text-slate-700">
                N° Bon
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Type
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Date
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Secteur / Source
              </TableHead>
              <TableHead className="font-semibold text-slate-700 text-center">
                Lignes
              </TableHead>
              <TableHead className="text-right font-semibold text-slate-700">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bons.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Box className="h-9 w-9" />
                    <p className="text-sm font-medium text-slate-500">
                      {search ||
                      dateDebut ||
                      dateFin ||
                      secteurFilter !== "TOUS"
                        ? "Aucun bon ne correspond aux filtres"
                        : "Aucun bon enregistré"}
                    </p>
                    {!search &&
                      !dateDebut &&
                      !dateFin &&
                      secteurFilter === "TOUS" && (
                        <p className="text-xs text-slate-400">
                          Cliquez sur « Nouveau bon » pour commencer
                        </p>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              bons.map((bon) => {
                const Icon = typeIcon[bon.type];
                const isEntree = bon.type === "ENTREE";
                return (
                  <TableRow
                    key={bon.id}
                    className="cursor-pointer transition-colors hover:bg-slate-50/80"
                    onClick={() => navigate(`/bons/${bon.id}`)}
                  >
                    <TableCell className="font-mono font-medium text-slate-900">
                      {getReference(bon)}
                    </TableCell>
                    <TableCell>
                      <Badge className={typeColor[bon.type]}>
                        <Icon className="mr-1 h-3 w-3" />
                        {typeLabel[bon.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {formatDate(bon.date_heure)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {isEntree ? bon.source || "—" : bon.secteur_nom || "—"}
                    </TableCell>
                    <TableCell className="text-center text-sm text-slate-600">
                      {bon.lignes.length}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:bg-[#0F4C81]/10 hover:text-[#0F4C81]"
                          onClick={() => navigate(`/bons/${bon.id}`)}
                          aria-label="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:bg-[#0F4C81]/10 hover:text-[#0F4C81]"
                          onClick={() => handleEdit(bon)}
                          aria-label="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(bon.id)}
                          className="h-8 w-8 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Formulaire */}
      <BonForm
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultType={selectedType}
        bon={editingBon}
        onSuccess={() => {
          setEditingBon(null);
        }}
      />

      {/* Confirmation suppression */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce bon ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BonListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              {[
                "N° Bon",
                "Type",
                "Date",
                "Secteur / Source",
                "Lignes",
                "Actions",
              ].map((h) => (
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
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
