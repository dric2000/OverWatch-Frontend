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
import { getErrorMessage } from "@/lib/apiErrorHandler";
import {
  AlertTriangle,
  Boxes,
  PackageSearch,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDeleteArticleMutation, useGetArticlesQuery } from "../articleApi";
import { ArticleForm } from "./ArticleForm";

export function ArticleList() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // ✅ data est directement un tableau d'articles (pas de pagination)
  const { data, isLoading } = useGetArticlesQuery();
  const [deleteArticle, { isLoading: isDeleting }] = useDeleteArticleMutation();

  // ✅ Vérifier que data est bien un tableau avant de filtrer
  const articles = data?.results || [];

  const filteredArticles = articles.filter((a) =>
    a.nom.toLowerCase().includes(search.toLowerCase()),
  );

  const activeCount = articles.filter((a) => a.actif).length;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteArticle(deleteId).unwrap();
      toast.success("Article supprimé avec succès");
      setDeleteId(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return <ArticleListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F4C81]/10">
            <Boxes className="h-5 w-5 text-[#0F4C81]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Articles</h2>
            <p className="text-sm text-slate-500">
              {articles.length} article{articles.length !== 1 ? "s" : ""} ·{" "}
              {activeCount} actif{activeCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setSelectedId(null);
            setFormOpen(true);
          }}
          className="bg-[#0F4C81] hover:bg-[#0d3f6b]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvel article
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="font-semibold text-slate-700">
                Nom
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Catégorie
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Unité
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Seuil d'alerte
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Statut
              </TableHead>
              <TableHead className="text-right font-semibold text-slate-700">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <PackageSearch className="h-9 w-9" />
                    <p className="text-sm font-medium text-slate-500">
                      {search
                        ? "Aucun article ne correspond"
                        : "Aucun article enregistré"}
                    </p>
                    {!search && (
                      <p className="text-xs text-slate-400">
                        Cliquez sur « Nouvel article » pour commencer
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((article) => (
                <TableRow
                  key={article.id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <TableCell className="font-medium text-slate-900">
                    {article.nom}
                  </TableCell>
                  <TableCell>
                    {article.categorie ? (
                      <Badge
                        variant="outline"
                        className="border-slate-200 bg-slate-50 font-normal text-slate-600"
                      >
                        {article.categorie}
                      </Badge>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                      {article.unite_mesure_abbreviation}
                    </span>
                  </TableCell>
                  <TableCell>
                    {article.seuil_alerte != null ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-700">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        {article.seuil_alerte}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        article.actif
                          ? "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "border-transparent bg-slate-100 text-slate-500 hover:bg-slate-100"
                      }
                    >
                      {article.actif ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:bg-[#0F4C81]/10 hover:text-[#0F4C81]"
                        onClick={() => {
                          setSelectedId(article.id);
                          setFormOpen(true);
                        }}
                        aria-label="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(article.id)}
                        className="h-8 w-8 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ArticleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        articleId={selectedId}
        onSuccess={() => setSelectedId(null)}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action est
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

function ArticleListSkeleton() {
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
      <Skeleton className="h-10 w-80 rounded-md" />
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              {["Nom", "Catégorie", "Unité", "Seuil", "Statut", "Actions"].map(
                (h) => (
                  <TableHead key={h}>{h}</TableHead>
                ),
              )}
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
