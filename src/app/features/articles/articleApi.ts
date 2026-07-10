import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { type RootState } from "../store";

// ✅ Exporter le type PaginatedResponse
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface UniteMesure {
  id: number;
  nom: string;
  abbreviation: string;
  actif: boolean;
}

export interface Article {
  id: number;
  nom: string;
  unite_mesure: number;
  unite_mesure_nom: string;
  unite_mesure_abbreviation: string;
  categorie: string | null;
  seuil_alerte: number | null;
  date_peremption: string | null;
  actif: boolean;
}

export interface Secteur {
  id: number;
  nom: string;
  description: string | null;
  actif: boolean;
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

export const articlesApi = createApi({
  reducerPath: "articlesApi",
  baseQuery,
  tagTypes: ["Article", "Secteur", "UniteMesure"],
  endpoints: (builder) => ({
    // ============ ARTICLES ============
    // ✅ Le type de retour est PaginatedResponse<Article>
    getArticles: builder.query<PaginatedResponse<Article>, void>({
      query: () => "/articles/",
      providesTags: ["Article"],
    }),
    getArticle: builder.query<Article, number>({
      query: (id) => `/articles/${id}/`,
      providesTags: (result, error, id) => [{ type: "Article", id }],
    }),
    createArticle: builder.mutation<Article, Partial<Article>>({
      query: (body) => ({
        url: "/articles/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Article"],
    }),
    updateArticle: builder.mutation<
      Article,
      { id: number; body: Partial<Article> }
    >({
      query: ({ id, body }) => ({
        url: `/articles/${id}/`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Article", id }],
    }),
    deleteArticle: builder.mutation<void, number>({
      query: (id) => ({
        url: `/articles/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Article"],
    }),

    // ============ SECTEURS ============
    // ✅ Le type de retour est PaginatedResponse<Secteur>
    getSecteurs: builder.query<PaginatedResponse<Secteur>, void>({
      query: () => "/secteurs/",
      providesTags: ["Secteur"],
    }),
    getSecteur: builder.query<Secteur, number>({
      query: (id) => `/secteurs/${id}/`,
      providesTags: (result, error, id) => [{ type: "Secteur", id }],
    }),
    createSecteur: builder.mutation<Secteur, Partial<Secteur>>({
      query: (body) => ({
        url: "/secteurs/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Secteur"],
    }),
    updateSecteur: builder.mutation<
      Secteur,
      { id: number; body: Partial<Secteur> }
    >({
      query: ({ id, body }) => ({
        url: `/secteurs/${id}/`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Secteur", id }],
    }),
    deleteSecteur: builder.mutation<void, number>({
      query: (id) => ({
        url: `/secteurs/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Secteur"],
    }),

    // ============ UNITÉS DE MESURE ============
    // ✅ Le type de retour est PaginatedResponse<UniteMesure>
    getUnites: builder.query<PaginatedResponse<UniteMesure>, void>({
      query: () => "/unites-mesure/",
      providesTags: ["UniteMesure"],
    }),
    getUnite: builder.query<UniteMesure, number>({
      query: (id) => `/unites-mesure/${id}/`,
      providesTags: (result, error, id) => [{ type: "UniteMesure", id }],
    }),
    createUnite: builder.mutation<UniteMesure, Partial<UniteMesure>>({
      query: (body) => ({
        url: "/unites-mesure/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["UniteMesure"],
    }),
    updateUnite: builder.mutation<
      UniteMesure,
      { id: number; body: Partial<UniteMesure> }
    >({
      query: ({ id, body }) => ({
        url: `/unites-mesure/${id}/`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "UniteMesure", id }],
    }),
    deleteUnite: builder.mutation<void, number>({
      query: (id) => ({
        url: `/unites-mesure/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["UniteMesure"],
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useGetArticleQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useGetSecteursQuery,
  useGetSecteurQuery,
  useCreateSecteurMutation,
  useUpdateSecteurMutation,
  useDeleteSecteurMutation,
  useGetUnitesQuery,
  useGetUniteQuery,
  useCreateUniteMutation,
  useUpdateUniteMutation,
  useDeleteUniteMutation,
} = articlesApi;
