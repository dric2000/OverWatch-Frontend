import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { exportBonToPDF } from "@/lib/pdfExport";
import { cn } from "@/lib/utils";
import {
  useDeleteBonMutation,
  useGetBonHistoriqueQuery,
  useGetBonQuery,
} from "../mouvementApi";
import { BonForm } from "./BonForm";

// ✅ Fonction pour formater les changements
function formatBonChanges(
  avant: Record<string, unknown> | null,
  apres: Record<string, unknown> | null,
): { field: string; from: string; to: string }[] {
  if (!avant || !apres) return [];

  const changes: { field: string; from: string; to: string }[] = [];
  const ignoredFields = [
    "id",
    "created_at",
    "updated_at",
    "utilisateur",
    "lignes",
  ];

  const allKeys = new Set([...Object.keys(avant), ...Object.keys(apres)]);

  for (const key of allKeys) {
    if (ignoredFields.includes(key)) continue;

    const from = avant[key];
    const to = apres[key];

    if (JSON.stringify(from) !== JSON.stringify(to)) {
      changes.push({
        field: getFieldLabel(key),
        from: formatValue(from),
        to: formatValue(to),
      });
    }
  }

  return changes;
}

function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    type: "Type",
    date_heure: "Date et heure",
    secteur: "Secteur",
    beneficiaire: "Bénéficiaire",
    source: "Source / Fournisseur",
    reference: "Référence",
  };
  return labels[field] || field;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" && value === "") return "—";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  return String(value);
}

const typeColor = {
  ENTREE: "bg-teal-100 text-teal-700 border-transparent hover:bg-teal-100",
  SORTIE: "bg-amber-100 text-amber-700 border-transparent hover:bg-amber-100",
};

const typeIcon = {
  ENTREE: "📥",
  SORTIE: "📤",
};

const typeLabel = {
  ENTREE: "Bon d'entrée",
  SORTIE: "Bon de sortie",
};

const actionLabel = {
  CREATION: "Création",
  MODIFICATION: "Modification",
  SUPPRESSION: "Suppression",
};

export function BonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bonId = Number(id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [historiqueOpen, setHistoriqueOpen] = useState(false);

  const { data: bon, isLoading } = useGetBonQuery(bonId, {
    skip: !bonId,
  });
  const { data: historique, isLoading: isLoadingHistorique } =
    useGetBonHistoriqueQuery(bonId, {
      skip: !bonId || !historiqueOpen,
    });
  const [deleteBon, { isLoading: isDeleting }] = useDeleteBonMutation();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBon(deleteId).unwrap();
      toast.success("Bon supprimé avec succès");
      navigate("/bons");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  const formatDateShort = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: fr });
  };

  const getReference = () => {
    if (!bon) return "";
    return bon.reference || `#${bon.id}`;
  };

  if (isLoading) {
    return <BonDetailSkeleton />;
  }

  if (!bon) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-12 w-12 text-slate-300" />
        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          Bon non trouvé
        </h3>
        <p className="text-sm text-slate-500">
          Le bon que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Button
          className="mt-4 bg-[#0F4C81] hover:bg-[#0d3f6b]"
          onClick={() => navigate("/bons")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  const isEntree = bon.type === "ENTREE";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-500 hover:bg-slate-100"
            onClick={() => navigate("/bons")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">
                {getReference()}
              </h1>
              <Badge className={typeColor[bon.type]}>
                <span className="mr-1">{typeIcon[bon.type]}</span>
                {typeLabel[bon.type]}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              Enregistré le {formatDate(bon.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await exportBonToPDF({
                  id: bon.id,
                  reference: bon.reference,
                  type: bon.type,
                  date_heure: bon.date_heure,
                  secteur_nom: bon.secteur_nom,
                  beneficiaire: bon.beneficiaire,
                  source: bon.source,
                  utilisateur_username: bon.utilisateur_username,
                  lignes: bon.lignes,
                  created_at: bon.created_at,
                });
                toast.success("PDF généré avec succès");
              } catch {
                toast.error("Erreur lors de la génération du PDF");
              }
            }}
            className="border-slate-200 hover:bg-[#0F4C81]/10 hover:text-[#0F4C81]"
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            className="border-slate-200 hover:bg-[#0F4C81]/10 hover:text-[#0F4C81]"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="outline"
            onClick={() => setDeleteId(bon.id)}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Informations du bon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Type
                  </p>
                  <Badge className={cn("mt-1", typeColor[bon.type])}>
                    {typeLabel[bon.type]}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Date et heure
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {formatDate(bon.date_heure)}
                  </p>
                </div>
                {isEntree ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Source / Fournisseur
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {bon.source || <span className="text-slate-400">—</span>}
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Secteur
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {bon.secteur_nom || (
                          <span className="text-slate-400">—</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Bénéficiaire
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {bon.beneficiaire || (
                          <span className="text-slate-400">—</span>
                        )}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Enregistré par
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {bon.utilisateur_username}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Dernière modification
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {formatDate(bon.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lignes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
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
                    <TableRow key={ligne.id}>
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
                  <TableRow className="bg-slate-50/80 font-medium">
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
            </CardContent>
          </Card>
        </div>

        {/* Historique */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Historique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Collapsible
                open={historiqueOpen}
                onOpenChange={setHistoriqueOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-slate-500 hover:text-slate-700"
                  >
                    <span>
                      {historiqueOpen ? "Masquer" : "Afficher"} les
                      modifications
                    </span>
                    {historiqueOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  {isLoadingHistorique ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : historique && historique.length > 0 ? (
                    historique.map((h) => {
                      // ✅ Calculer les changements pour cet historique
                      const changes = formatBonChanges(
                        h.donnees_avant,
                        h.donnees_apres,
                      );

                      return (
                        <div
                          key={h.id}
                          className="rounded-lg border border-slate-100 p-3 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-normal border-transparent",
                                h.action === "CREATION" &&
                                  "bg-emerald-50 text-emerald-700",
                                h.action === "MODIFICATION" &&
                                  "bg-blue-50 text-blue-700",
                                h.action === "SUPPRESSION" &&
                                  "bg-red-50 text-red-700",
                              )}
                            >
                              {actionLabel[h.action]}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {formatDateShort(h.date)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            Par <strong>{h.utilisateur_username}</strong>
                          </p>

                          {/* ✅ Affichage des changements formatés */}
                          {h.action === "MODIFICATION" &&
                            changes.length > 0 && (
                              <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                                <Table className="text-xs">
                                  <TableHeader>
                                    <TableRow className="bg-slate-50">
                                      <TableHead className="font-semibold text-slate-600">
                                        Champ
                                      </TableHead>
                                      <TableHead className="font-semibold text-slate-600 text-red-600">
                                        Avant
                                      </TableHead>
                                      <TableHead className="font-semibold text-slate-600 text-emerald-600">
                                        Après
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {changes.map((change, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell className="font-medium text-slate-700">
                                          {change.field}
                                        </TableCell>
                                        <TableCell className="text-red-600 line-through">
                                          {change.from}
                                        </TableCell>
                                        <TableCell className="text-emerald-600 font-medium">
                                          {change.to}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}

                          {/* Pour les suppressions, afficher les données supprimées */}
                          {h.action === "SUPPRESSION" && h.donnees_avant && (
                            <details className="text-xs text-slate-500">
                              <summary className="cursor-pointer hover:text-slate-700">
                                Voir les données supprimées
                              </summary>
                              <div className="mt-1 rounded bg-slate-50 p-2 font-mono text-[11px] whitespace-pre-wrap">
                                {JSON.stringify(h.donnees_avant, null, 2)}
                              </div>
                            </details>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-sm text-slate-400">
                      Aucune modification
                    </p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Formulaire d'édition */}
      <BonForm
        open={editOpen}
        onOpenChange={setEditOpen}
        bon={bon}
        onSuccess={() => {
          // Rafraîchir les données
        }}
      />

      {/* Confirmation suppression */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le bon{" "}
              <strong>{getReference()}</strong> ? Cette action est irréversible.
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

function BonDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="mt-1 h-4 w-48" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-1 h-5 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
