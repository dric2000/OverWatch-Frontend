import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "../features/auth/authApi";
import authReducer from "../features/auth/authSlice";
import { articlesApi } from "./articles/articleApi";
import { inventaireApi } from "./inventaire/inventaireApi";
import { mouvementApi } from "./mouvements/mouvementApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [articlesApi.reducerPath]: articlesApi.reducer,
    [mouvementApi.reducerPath]: mouvementApi.reducer,
    [inventaireApi.reducerPath]: inventaireApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      articlesApi.middleware,
      mouvementApi.middleware,
      inventaireApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
