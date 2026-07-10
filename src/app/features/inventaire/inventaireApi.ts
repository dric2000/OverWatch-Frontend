import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export interface InventaireArticle {
  article_id: number;
  article_nom: string;
  unite_mesure: string;
  unite_abbreviation: string;
  quantite_initiale: number;
  total_entrees: number;
  total_sorties: number;
  quantite_restante: number;
  sorties_par_secteur: Record<string, number>;
}

export interface InventaireResponse {
  date_debut: string;
  date_fin: string;
  filtres: {
    secteur: number | null;
    article: number | null;
  };
  articles: InventaireArticle[];
  total_articles: number;
}

export interface RapportMouvement {
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
  nb_lignes: number;
  lignes: {
    id: number;
    article: number;
    article_nom: string;
    article_unite: string;
    quantite: number;
  }[];
  created_at: string;
  updated_at: string;
}

export interface RapportResponse {
  date_debut: string;
  date_fin: string;
  type_filtre: string;
  filtres: {
    secteur: number | null;
    article: number | null;
  };
  total: number;
  resultats: RapportMouvement[];
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

export const inventaireApi = createApi({
  reducerPath: "inventaireApi",
  baseQuery,
  tagTypes: ["Inventaire"],
  endpoints: (builder) => ({
    getInventaire: builder.query<
      InventaireResponse,
      {
        date_debut: string;
        date_fin: string;
        secteur?: number;
        article?: number;
      }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        searchParams.set("date_debut", params.date_debut);
        searchParams.set("date_fin", params.date_fin);
        if (params.secteur) searchParams.set("secteur", String(params.secteur));
        if (params.article) searchParams.set("article", String(params.article));
        return `/inventaire/?${searchParams.toString()}`;
      },
      providesTags: ["Inventaire"],
    }),
    getRapportMouvements: builder.query<
      RapportResponse,
      {
        date_debut: string;
        date_fin: string;
        type?: "ENTREE" | "SORTIE" | "TOUS";
        secteur?: number;
        article?: number;
      }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        searchParams.set("date_debut", params.date_debut);
        searchParams.set("date_fin", params.date_fin);
        if (params.type && params.type !== "TOUS") {
          searchParams.set("type", params.type);
        }
        if (params.secteur) searchParams.set("secteur", String(params.secteur));
        if (params.article) searchParams.set("article", String(params.article));
        return `/rapport-mouvements/?${searchParams.toString()}`;
      },
    }),
  }),
});

export const { useGetInventaireQuery, useGetRapportMouvementsQuery } =
  inventaireApi;
