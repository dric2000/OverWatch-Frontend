import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  useCreateSecteurMutation,
  useGetSecteurQuery,
  useUpdateSecteurMutation,
} from "../../articles/articleApi";

const secteurSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  actif: z.boolean().default(true),
});
type SecteurFormInput = z.input<typeof secteurSchema>;
type SecteurFormOutput = z.output<typeof secteurSchema>;

interface SecteurFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  secteurId: number | null;
  onSuccess: () => void;
}

export function SecteurForm({
  open,
  onOpenChange,
  secteurId,
  onSuccess,
}: SecteurFormProps) {
  const { data: secteur, isLoading: isLoadingSecteur } = useGetSecteurQuery(
    secteurId!,
    { skip: !secteurId },
  );
  const [createSecteur, { isLoading: isCreating }] = useCreateSecteurMutation();
  const [updateSecteur, { isLoading: isUpdating }] = useUpdateSecteurMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<SecteurFormInput, any, SecteurFormOutput>({
    resolver: zodResolver(secteurSchema),
    defaultValues: {
      nom: "",
      description: "",
      actif: true,
    },
  });

  const actif = watch("actif");

  useEffect(() => {
    if (secteur) {
      reset({
        nom: secteur.nom,
        description: secteur.description || "",
        actif: secteur.actif,
      });
    }
  }, [secteur, reset]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: SecteurFormOutput) => {
    try {
      if (secteurId) {
        await updateSecteur({ id: secteurId, body: data }).unwrap();
        toast.success("Secteur modifié avec succès");
      } else {
        await createSecteur(data).unwrap();
        toast.success("Secteur créé avec succès");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        (error as string) || secteurId
          ? "Erreur lors de la modification"
          : "Erreur lors de la création",
      );
    }
  };

  const isLoading = isLoadingSecteur || isCreating || isUpdating;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-slate-100 px-6 py-5">
          <SheetTitle className="text-lg">
            {secteurId ? "Modifier" : "Nouveau"} secteur
          </SheetTitle>
          <SheetDescription>
            {secteurId
              ? "Modifiez les informations du secteur"
              : "Ajoutez un nouveau secteur au référentiel"}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="flex-1 space-y-8 px-6 py-6">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Informations générales
              </h3>

              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  placeholder="Ex : Laboratoire d'analyses"
                  {...register("nom")}
                />
                {errors.nom && (
                  <p className="text-sm text-red-500">{errors.nom.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Optionnel"
                  {...register("description")}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Statut
              </h3>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div>
                  <Label htmlFor="actif" className="text-sm font-medium">
                    Secteur actif
                  </Label>
                  <p className="text-xs text-slate-500">
                    Les secteurs inactifs n'apparaissent plus dans les listes de
                    sélection
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
                : secteurId
                  ? "Modifier"
                  : "Créer"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
