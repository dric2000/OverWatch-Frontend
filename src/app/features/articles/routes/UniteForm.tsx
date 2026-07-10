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
  useCreateUniteMutation,
  useGetUniteQuery,
  useUpdateUniteMutation,
} from "../articleApi";

const uniteSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  abbreviation: z.string().min(1, "L'abréviation est requise"),
  actif: z.boolean().default(true),
});

type UniteFormInput = z.input<typeof uniteSchema>;
type UniteFormOutput = z.output<typeof uniteSchema>;

interface UniteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uniteId: number | null;
  onSuccess: () => void;
}

export function UniteForm({
  open,
  onOpenChange,
  uniteId,
  onSuccess,
}: UniteFormProps) {
  const { data: unite, isLoading: isLoadingUnite } = useGetUniteQuery(
    uniteId!,
    { skip: !uniteId },
  );
  const [createUnite, { isLoading: isCreating }] = useCreateUniteMutation();
  const [updateUnite, { isLoading: isUpdating }] = useUpdateUniteMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<UniteFormInput, any, UniteFormOutput>({
    resolver: zodResolver(uniteSchema),
    defaultValues: {
      nom: "",
      abbreviation: "",
      actif: true,
    },
  });

  const actif = watch("actif");

  useEffect(() => {
    if (unite) {
      reset({
        nom: unite.nom,
        abbreviation: unite.abbreviation,
        actif: unite.actif,
      });
    }
  }, [unite, reset]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: UniteFormOutput) => {
    try {
      if (uniteId) {
        await updateUnite({ id: uniteId, body: data }).unwrap();
        toast.success("Unité modifiée avec succès");
      } else {
        await createUnite(data).unwrap();
        toast.success("Unité créée avec succès");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        (error as string) || uniteId
          ? "Erreur lors de la modification"
          : "Erreur lors de la création",
      );
    }
  };

  const isLoading = isLoadingUnite || isCreating || isUpdating;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-slate-100 px-6 py-5">
          <SheetTitle className="text-lg">
            {uniteId ? "Modifier" : "Nouvelle"} unité
          </SheetTitle>
          <SheetDescription>
            {uniteId
              ? "Modifiez les informations de l'unité"
              : "Ajoutez une nouvelle unité de mesure"}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    placeholder="Ex : Boîte"
                    {...register("nom")}
                  />
                  {errors.nom && (
                    <p className="text-sm text-red-500">{errors.nom.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abbreviation">Abréviation *</Label>
                  <Input
                    id="abbreviation"
                    placeholder="Ex : bte"
                    {...register("abbreviation")}
                  />
                  {errors.abbreviation && (
                    <p className="text-sm text-red-500">
                      {errors.abbreviation.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Statut
              </h3>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div>
                  <Label htmlFor="actif" className="text-sm font-medium">
                    Unité active
                  </Label>
                  <p className="text-xs text-slate-500">
                    Les unités inactives n'apparaissent plus dans les listes de
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
              {isLoading ? "Enregistrement..." : uniteId ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
