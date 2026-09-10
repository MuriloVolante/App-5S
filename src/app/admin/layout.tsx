import Link from "next/link";
import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";

const ABAS = [
  { href: "/admin/setores", rotulo: "Setores" },
  { href: "/admin/usuarios", rotulo: "Usuarios" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await requirePapel(["admin"]);

  return (
    <>
      <Header usuario={usuario} />
      <nav className="flex gap-4 border-b border-neutral-200 bg-white px-6 py-3 text-sm">
        {ABAS.map((aba) => (
          <Link key={aba.href} href={aba.href} className="hover:underline">
            {aba.rotulo}
          </Link>
        ))}
      </nav>
      <main className="p-6">{children}</main>
    </>
  );
}
