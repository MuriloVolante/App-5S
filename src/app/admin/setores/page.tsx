import Paginacao, { lerPagina } from "@/components/paginacao";
import { listarSetoresPagina } from "@/lib/repo";
import SetorForm from "./setor-form";
import SetorLinha from "./setor-linha";

export default async function SetoresPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const { pagina } = await searchParams;
  const setores = await listarSetoresPagina(lerPagina(pagina));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="titulo">Setores</h1>
        <p className="subtitulo mt-1">{setores.total} cadastrados</p>
      </div>

      <SetorForm />

      <div className="tabela-rolagem">
        <table className="tabela">
          <thead>
            <tr>
              <th className="w-32">Código</th>
              <th>Nome</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {setores.itens.map((setor) => (
              <SetorLinha key={`${setor.id}:${setor.nome}`} setor={setor} />
            ))}
            {setores.total === 0 && (
              <tr>
                <td colSpan={3} className="vazio">
                  Nenhum setor cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Paginacao
        base="/admin/setores"
        pagina={setores.pagina}
        paginas={setores.paginas}
        total={setores.total}
        rotulo="setores"
      />
    </div>
  );
}
