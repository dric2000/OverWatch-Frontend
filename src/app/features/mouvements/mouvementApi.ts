import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { type RootState } from "../store";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LigneMouvement {
  id: number;
  article: number;
  article_nom: string;
  article_unite: string;
  quantite: number;
}

export interface Bon {
  id: number;
  type: "ENTREE" | "SORTIE";
  reference: string;
  date_heure: string;
  secteur: number | null;
  secteur_nom: string | null;
  beneficiaire: string | null;
  source: string | null;
  utilisateur: number;
  utilisateur_username: string;
  lignes: LigneMouvement[];
  created_at: string;
  updated_at: string;
}

export interface CreateBonPayload {
  type: "ENTREE" | "SORTIE";
  date_heure: string;
  secteur?: number | null;
  beneficiaire?: string | null;
  source?: string | null;
  reference?: string | null;
  lignes: { article: number; quantite: number }[];
}

export interface HistoriqueBon {
  id: number;
  action: "CREATION" | "MODIFICATION" | "SUPPRESSION";
  utilisateur: number;
  utilisateur_username: string;
  donnees_avant: Record<string, unknown> | null;
  donnees_apres: Record<string, unknown> | null;
  date: string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const mouvementApi = createApi({
  reducerPath: "mouvementApi",
  baseQuery,
  tagTypes: ["Bon"],
  endpoints: (builder) => ({
    // ============ BONS ============
    getBons: builder.query<
      PaginatedResponse<Bon>,
      {
        type?: "ENTREE" | "SORTIE";
        secteur?: number;
        article?: number;
        date_debut?: string;
        date_fin?: string;
        search?: string;
      }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.type) searchParams.set("type", params.type);
        if (params.secteur) searchParams.set("secteur", String(params.secteur));
        if (params.article) searchParams.set("article", String(params.article));
        if (params.date_debut)
          searchParams.set("date_debut", params.date_debut);
        if (params.date_fin) searchParams.set("date_fin", params.date_fin);
        if (params.search) searchParams.set("search", params.search);
        return `/bons/?${searchParams.toString()}`;
      },
      providesTags: ["Bon"],
    }),
    getBon: builder.query<Bon, number>({
      query: (id) => `/bons/${id}/`,
      providesTags: (result, error, id) => [{ type: "Bon", id }],
    }),
    getBonHistorique: builder.query<HistoriqueBon[], number>({
      query: (id) => `/bons/${id}/historique/`,
    }),
    createBon: builder.mutation<Bon, CreateBonPayload>({
      query: (body) => ({
        url: "/bons/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Bon"],
    }),
    updateBon: builder.mutation<Bon, { id: number; body: CreateBonPayload }>({
      query: ({ id, body }) => ({
        url: `/bons/${id}/`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Bon", id }],
    }),
    deleteBon: builder.mutation<void, number>({
      query: (id) => ({
        url: `/bons/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bon"],
    }),
  }),
});

export const {
  useGetBonsQuery,
  useGetBonQuery,
  useGetBonHistoriqueQuery,
  useCreateBonMutation,
  useUpdateBonMutation,
  useDeleteBonMutation,
} = mouvementApi;
