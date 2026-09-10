import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";

export default async function CoordenadorPage() {
  const usuario = await requirePapel(["coordenador"]);

  return (
    <>
      <Header usuario={usuario} />
      <main className="p-6">
        <h1 className="text-lg font-semibold">Acoes do setor</h1>
      </main>
    </>
  );
}
