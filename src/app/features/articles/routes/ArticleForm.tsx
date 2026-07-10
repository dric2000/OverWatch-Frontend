import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import type { UniteMesure } from "../articleApi";
import {
  useCreateArticleMutation,
  useGetArticleQuery,
  useGetUnitesQuery,
  useUpdateArticleMutation,
} from "../articleApi";

// ✅ Schéma corrigé
const articleSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  unite_mesure: z.string().min(1, "L'unité est requise"),
  categorie: z.string().optional().default(""),
  seuil_alerte: z.coerce.number().positive().optional(),
  date_peremption: z.string().optional().default(""),
  actif: z.boolean().default(true),
});

type ArticleFormInput = z.input<typeof articleSchema>;
type ArticleFormOutput = z.output<typeof articleSchema>;

interface ArticleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: number | null;
  onSuccess: () => void;
}

export function ArticleForm({
  open,
  onOpenChange,
  articleId,
  onSuccess,
}: ArticleFormProps) {
  const { data: article, isLoading: isLoadingArticle } = useGetArticleQuery(
    articleId!,
    { skip: !articleId },
  );
  const { data, isLoading: isLoadingUnites } = useGetUnitesQuery();
  const unites = data?.results || [];
  const [createArticle, { isLoading: isCreating }] = useCreateArticleMutation();
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ArticleFormInput, any, ArticleFormOutput>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      nom: "",
      unite_mesure: "",
      categorie: "",
      seuil_alerte: undefined,
      date_peremption: "",
      actif: true,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const actif = watch("actif");

  useEffect(() => {
    if (article) {
      reset({
        nom: article.nom,
        unite_mesure: String(article.unite_mesure),
        categorie: article.categorie || "",
        seuil_alerte: article.seuil_alerte || undefined,
        date_peremption: article.date_peremption || "",
        actif: article.actif,
      });
    }
  }, [article, reset]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: ArticleFormOutput) => {
    try {
      const payload = {
        nom: data.nom,
        unite_mesure: Number(data.unite_mesure),
        categorie: data.categorie || null,
        seuil_alerte: data.seuil_alerte || null,
        date_peremption: data.date_peremption || null,
        actif: data.actif,
      };

      if (articleId) {
        await updateArticle({ id: articleId, body: payload }).unwrap();
        toast.success("Article modifié avec succès");
      } else {
        await createArticle(payload).unwrap();
        toast.success("Article créé avec succès");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        (error as string) || articleId
          ? "Erreur lors de la modification"
          : "Erreur lors de la création",
      );
    }
  };

  const isLoading =
    isLoadingArticle || isLoadingUnites || isCreating || isUpdating;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-slate-100 px-6 py-5">
          <SheetTitle className="text-lg">
            {articleId ? "Modifier" : "Nouvel"} article
          </SheetTitle>
          <SheetDescription>
            {articleId
              ? "Modifiez les informations de l'article"
              : "Ajoutez un nouvel article au référentiel"}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="flex-1 space-y-8 px-6 py-6">
            {/* Informations générales */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Informations générales
              </h3>

              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  placeholder="Ex : Gants latex taille M"
                  {...register("nom")}
                />
                {errors.nom && (
                  <p className="text-sm text-red-500">{errors.nom.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unite_mesure">Unité de mesure *</Label>
                  <Select
                    onValueChange={(value) => setValue("unite_mesure", value)}
                    value={watch("unite_mesure")}
                  >
                    <SelectTrigger id="unite_mesure">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {unites
                        ?.filter((u: UniteMesure) => u.actif)
                        .map((u: UniteMesure) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.nom} ({u.abbreviation})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.unite_mesure && (
                    <p className="text-sm text-red-500">
                      {errors.unite_mesure.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categorie">Catégorie</Label>
                  <Input
                    id="categorie"
                    placeholder="Optionnel"
                    {...register("categorie")}
                  />
                </div>
              </div>
            </div>

            {/* Suivi de stock */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Suivi de stock
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seuil_alerte">Seuil d'alerte</Label>
                  <Input
                    id="seuil_alerte"
                    type="number"
                    placeholder="Ex : 10"
                    {...register("seuil_alerte", {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.seuil_alerte && (
                    <p className="text-sm text-red-500">
                      {errors.seuil_alerte.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_peremption">Date de péremption</Label>
                  <Input
                    id="date_peremption"
                    type="date"
                    {...register("date_peremption")}
                  />
                </div>
              </div>
            </div>

            {/* Statut */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Statut
              </h3>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div>
                  <Label htmlFor="actif" className="text-sm font-medium">
                    Article actif
                  </Label>
                  <p className="text-xs text-slate-500">
                    Les articles inactifs n'apparaissent plus dans les
                    mouvements
                  </p>
                </div>
                <Switch
                  id="actif"
                  checked={actif}
                  onCheckedChange={(checked) => setValue("actif", checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-100 bg-white px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#0F4C81] hover:bg-[#0d3f6b]"
              disabled={isLoading}
            >
              {isLoading
                ? "Enregistrement..."
                : articleId
                  ? "Modifier"
                  : "Créer"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
