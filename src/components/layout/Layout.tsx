import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Layout({
  title = "Tableau de bord",
  breadcrumbs = [],
}: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50/80">
      <Sidebar />
      <div className="flex-1 lg:ml-70">
        <Header title={title} breadcrumbs={breadcrumbs} />
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
