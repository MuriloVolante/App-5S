import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";

const LINKS = [
  { href: "/admin/setores", rotulo: "Setores" },
  { href: "/admin/usuarios", rotulo: "Usuarios" },
  { href: "/admin/templates", rotulo: "Templates" },
  { href: "/dashboard", rotulo: "Dashboard" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await requirePapel(["admin"]);

  return (
    <>
      <Header usuario={usuario} links={LINKS} />
      <main className="mx-auto w-full max-w-6xl px-5 py-8">{children}</main>
    </>
  );
}
