import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowDown,
  ArrowUp,
  Calendar as CalendarIcon,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { getErrorMessage } from "@/lib/apiErrorHandler";
import {
  useGetArticlesQuery,
  useGetSecteursQuery,
} from "../../articles/articleApi";
import {
  useCreateBonMutation,
  useUpdateBonMutation,
  type Bon,
  type CreateBonPayload,
} from "../mouvementApi";

const ligneSchema = z.object({
  article: z.string().min(1, "Article requis"),
  quantite: z.coerce.number().positive("Quantité positive requise"),
});

const bonSchema = z.object({
  type: z.enum(["ENTREE", "SORTIE"]),
  date_heure: z.string().min(1, "Date requise"),
  secteur: z.string().optional(),
  beneficiaire: z.string().optional(),
  source: z.string().optional(),
  lignes: z.array(ligneSchema).min(1, "Au moins une ligne"),
});

type BonFormInput = z.input<typeof bonSchema>;
type BonFormOutput = z.output<typeof bonSchema>;

interface BonFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: "ENTREE" | "SORTIE";
  bon: Bon | null;
  onSuccess: () => void;
}

export function BonForm({
  open,
  onOpenChange,
  bon,
  defaultType = "ENTREE",
  onSuccess,
}: BonFormProps) {
  const [type, setType] = useState<"ENTREE" | "SORTIE">(bon?.type || "ENTREE");
  const [articleSearch, setArticleSearch] = useState("");

  const { data: articlesData } = useGetArticlesQuery();
  const { data: secteursData } = useGetSecteursQuery();

  const articles = articlesData?.results || [];
  const secteurs = secteursData?.results || [];

  const [createBon, { isLoading: isCreating }] = useCreateBonMutation();
  const [updateBon, { isLoading: isUpdating }] = useUpdateBonMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<BonFormInput, any, BonFormOutput>({
    resolver: zodResolver(bonSchema),
    defaultValues: {
      type: bon?.type || "ENTREE",
      date_heure: bon?.date_heure || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      secteur: bon?.secteur ? String(bon.secteur) : "",
      beneficiaire: bon?.beneficiaire || "",
      source: bon?.source || "",
      lignes: bon?.lignes.map((l) => ({
        article: String(l.article),
        quantite: l.quantite,
      })) || [{ article: "", quantite: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lignes",
  });

  const watchedType = watch("type");

  // Dans le useEffect pour les nouveaux bons
  useEffect(() => {
    if (bon) {
      reset({
        type: bon.type,
        date_heure: bon.date_heure,
        secteur: bon.secteur ? String(bon.secteur) : "",
        beneficiaire: bon.beneficiaire || "",
        source: bon.source || "",
        lignes: bon.lignes.map((l) => ({
          article: String(l.article),
          quantite: l.quantite,
        })),
      });
      setType(bon.type);
      setValue("type", bon.type); // ✅ Assurer la synchronisation
    } else {
      reset({
        type: defaultType,
        date_heure: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        secteur: "",
        beneficiaire: "",
        source: "",
        lignes: [{ article: "", quantite: 0 }],
      });
      setType(defaultType);
      setValue("type", defaultType); // ✅ Assurer la synchronisation
    }
  }, [bon, reset, defaultType, setValue]);

  useEffect(() => {
    if (!open) {
      reset();
      setType(defaultType);
    }
  }, [open, reset, defaultType]);

  const onSubmit = async (data: BonFormOutput) => {
    try {
      const payload: CreateBonPayload = {
        type: data.type,
        date_heure: data.date_heure,
        secteur: data.secteur ? Number(data.secteur) : null,
        beneficiaire: data.beneficiaire || null,
        source: data.source || null,
        lignes: data.lignes.map((l) => ({
          article: Number(l.article),
          quantite: l.quantite,
        })),
      };

      if (bon) {
        await updateBon({ id: bon.id, body: payload }).unwrap();
        toast.success("Bon modifié avec succès");
      } else {
        await createBon(payload).unwrap();
        toast.success("Bon créé avec succès");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-slate-100 px-6 py-5">
          <SheetTitle className="flex items-center gap-2 text-lg">
            {bon ? "Modifier le bon" : "Nouveau bon"}
            <Badge
              className={
                bon?.type === "ENTREE"
                  ? "bg-teal-100 text-teal-700"
                  : "bg-amber-100 text-amber-700"
              }
            >
              {bon?.type === "ENTREE" ? "Entrée" : "Sortie"}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            {bon
              ? "Modifiez les informations du bon"
              : "Enregistrez une entrée ou une sortie de stock"}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="flex-1 space-y-6 px-6 py-6">
            {/* Type */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant={type === "ENTREE" ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  type === "ENTREE" && "bg-teal-600 hover:bg-teal-700",
                )}
                onClick={() => {
                  setType("ENTREE");
                  setValue("type", "ENTREE");
                  setValue("secteur", "");
                }}
              >
                <ArrowDown className="mr-2 h-4 w-4" />
                Entrée
              </Button>
              <Button
                type="button"
                variant={type === "SORTIE" ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  type === "SORTIE" && "bg-amber-600 hover:bg-amber-700",
                )}
                onClick={() => {
                  setType("SORTIE");
                  setValue("type", "SORTIE");
                }}
              >
                <ArrowUp className="mr-2 h-4 w-4" />
                Sortie
              </Button>
            </div>

            {/* Date et info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date et heure</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch("date_heure")
                        ? format(
                            new Date(watch("date_heure")),
                            "dd/MM/yyyy HH:mm",
                            { locale: fr },
                          )
                        : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(watch("date_heure"))}
                      onSelect={(date) => {
                        if (date) {
                          const current = new Date(watch("date_heure"));
                          date.setHours(current.getHours());
                          date.setMinutes(current.getMinutes());
                          setValue(
                            "date_heure",
                            format(date, "yyyy-MM-dd'T'HH:mm"),
                          );
                        }
                      }}
                    />
                    <div className="border-t border-slate-100 p-3">
                      <Input
                        type="time"
                        value={format(new Date(watch("date_heure")), "HH:mm")}
                        onChange={(e) => {
                          const date = new Date(watch("date_heure"));
                          const [hours, minutes] = e.target.value.split(":");
                          date.setHours(Number(hours), Number(minutes));
                          setValue(
                            "date_heure",
                            format(date, "yyyy-MM-dd'T'HH:mm"),
                          );
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                {errors.date_heure && (
                  <p className="text-sm text-red-500">
                    {errors.date_heure.message}
                  </p>
                )}
              </div>

              {watchedType === "SORTIE" ? (
                <div className="space-y-2">
                  <Label>Secteur *</Label>
                  <Select
                    value={watch("secteur")}
                    onValueChange={(v) => setValue("secteur", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {secteurs
                        .filter((s) => s.actif)
                        .map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.nom}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.secteur && (
                    <p className="text-sm text-red-500">
                      {errors.secteur.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Source / Fournisseur</Label>
                  <Input
                    placeholder="Ex: Fournisseur ABC"
                    {...register("source")}
                  />
                </div>
              )}
            </div>

            {watchedType === "SORTIE" && (
              <div className="space-y-2">
                <Label>Bénéficiaire</Label>
                <Input
                  placeholder="Nom de la personne ou service"
                  {...register("beneficiaire")}
                />
              </div>
            )}

            {/* Lignes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Articles</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => append({ article: "", quantite: 0 })}
                  className="text-[#0F4C81] hover:bg-[#0F4C81]/10"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Ajouter
                </Button>
              </div>

              {errors.lignes && (
                <p className="text-sm text-red-500">{errors.lignes.message}</p>
              )}

              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {watch(`lignes.${index}.article`)
                              ? articles.find(
                                  (a) =>
                                    String(a.id) ===
                                    watch(`lignes.${index}.article`),
                                )?.nom || "Sélectionner"
                              : "Sélectionner un article"}
                            <Package className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0">
                          <Command>
                            <CommandInput
                              placeholder="Rechercher..."
                              value={articleSearch}
                              onValueChange={setArticleSearch}
                            />
                            <CommandList>
                              <CommandEmpty>Aucun article trouvé</CommandEmpty>
                              <CommandGroup>
                                {articles
                                  .filter((a) => a.actif)
                                  .map((a) => (
                                    <CommandItem
                                      key={a.id}
                                      value={String(a.id)}
                                      onSelect={() => {
                                        setValue(
                                          `lignes.${index}.article`,
                                          String(a.id),
                                        );
                                        setArticleSearch("");
                                      }}
                                    >
                                      {a.nom}
                                      <span className="ml-auto text-xs text-slate-400">
                                        {a.unite_mesure_abbreviation}
                                      </span>
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {errors.lignes?.[index]?.article && (
                        <p className="text-sm text-red-500">
                          {errors.lignes[index]?.article?.message}
                        </p>
                      )}
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qté"
                        {...register(`lignes.${index}.quantite`)}
                      />
                      {errors.lignes?.[index]?.quantite && (
                        <p className="text-sm text-red-500">
                          {errors.lignes[index]?.quantite?.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0 text-slate-400 hover:text-red-600"
                      onClick={() => {
                        if (fields.length > 1) {
                          remove(index);
                        } else {
                          toast.error("Au moins une ligne requise");
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
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
              {isLoading ? "Enregistrement..." : bon ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
