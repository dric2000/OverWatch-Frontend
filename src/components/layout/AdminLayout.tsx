import { Layout } from "./Layout";

export function AdminLayout() {
  return (
    <Layout
      title="Administration"
      breadcrumbs={[{ label: "Administration" }]}
    />
  );
}
