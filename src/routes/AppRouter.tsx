import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../components/layout/Layout";

import { ArticleList } from "@/app/features/articles/routes/ArticlesList";
import { SecteurList } from "@/app/features/articles/routes/SecteurList";
import { UniteList } from "@/app/features/articles/routes/UniteList";
import { Login } from "@/app/features/auth/routes/Login";
import { Dashboard } from "@/app/features/dashboard/routes/Dashboard";
import { Inventaire } from "@/app/features/inventaire/routes/Inventaire";
import { BonDetail } from "@/app/features/mouvements/routes/BonDetail";
import { BonList } from "@/app/features/mouvements/routes/BonList";
import { RapportSortie } from "@/app/features/rapport/routes/RapportSortie";
import { ProtectedRoute } from "./ProtectedRoute";
import { StockActuel } from "@/app/features/stock/routes/StockActuel";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout title="Tableau de bord" />}>
            <Route path="/" element={<Dashboard />} />
          </Route>

          <Route
            element={
              <Layout
                title="Articles"
                breadcrumbs={[
                  { label: "Administration" },
                  { label: "Articles" },
                ]}
              />
            }
          >
            <Route path="/admin/articles" element={<ArticleList />} />
          </Route>

          <Route
            element={
              <Layout
                title="Secteurs"
                breadcrumbs={[
                  { label: "Administration" },
                  { label: "Secteurs" },
                ]}
              />
            }
          >
            <Route path="/admin/secteurs" element={<SecteurList />} />
          </Route>

          <Route
            element={
              <Layout
                title="Unités de mesure"
                breadcrumbs={[{ label: "Administration" }, { label: "Unités" }]}
              />
            }
          >
            <Route path="/admin/unites" element={<UniteList />} />
          </Route>

          <Route
            element={<Layout title="Bons" breadcrumbs={[{ label: "Bons" }]} />}
          >
            <Route path="/bons" element={<BonList />} />
          </Route>

          <Route
            element={
              <Layout
                title="Détail du bon"
                breadcrumbs={[
                  { label: "Bons", href: "/bons" },
                  { label: "Détail" },
                ]}
              />
            }
          >
            <Route path="/bons/:id" element={<BonDetail />} />
          </Route>

          <Route
            element={
              <Layout
                title="Inventaire"
                breadcrumbs={[{ label: "Inventaire" }]}
              />
            }
          >
            <Route path="/inventaire" element={<Inventaire />} />
          </Route>

          <Route
            element={
              <Layout
                title="Rapport de sortie"
                breadcrumbs={[{ label: "Rapport de sortie" }]}
              />
            }
          >
            <Route path="/rapport" element={<RapportSortie />} />
          </Route>

          <Route
            element={
              <Layout
                title="État du stock"
                breadcrumbs={[{ label: "État du stock" }]}
              />
            }
          >
            <Route path="/stock" element={<StockActuel />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
