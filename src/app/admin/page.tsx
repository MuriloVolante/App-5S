import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";

export default async function AdminPage() {
  const usuario = await requirePapel(["admin"]);

  return (
    <>
      <Header usuario={usuario} />
      <main className="p-6">
        <h1 className="text-lg font-semibold">Admin</h1>
      </main>
    </>
  );
}
