import { listarSetores } from "@/lib/repo";
import SetorForm from "./setor-form";
import SetorLinha from "./setor-linha";

export default function SetoresPage() {
  const setores = listarSetores();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="titulo">Setores</h1>
        <p className="subtitulo mt-1">{setores.length} cadastrados</p>
      </div>

      <SetorForm />

      <table className="tabela">
        <thead>
          <tr>
            <th className="w-32">Codigo</th>
            <th>Nome</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {setores.map((setor) => (
            <SetorLinha key={setor.id} setor={setor} />
          ))}
          {setores.length === 0 && (
            <tr>
              <td colSpan={3} className="vazio">
                Nenhum setor cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
