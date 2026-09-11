import Paginacao, { lerPagina } from "@/components/paginacao";
import { contarUsuariosSemPapel, listarSetores, listarUsuarios } from "@/lib/repo";
import UsuarioForm from "./usuario-form";
import UsuarioLinha from "./usuario-linha";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const { pagina } = await searchParams;
  const usuarios = listarUsuarios(lerPagina(pagina));
  const setores = listarSetores();
  const pendentes = contarUsuariosSemPapel();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="titulo">Usuários</h1>
        <p className="subtitulo mt-1">
          {usuarios.total} cadastrados · {pendentes} sem papel
        </p>
      </div>

      <UsuarioForm setores={setores} />

      <div className="tabela-rolagem">
        <table className="tabela">
          <thead>
            <tr>
              <th className="w-32">Código</th>
              <th>Nome / papel / setor</th>
              <th>E-mail</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {usuarios.itens.map((usuario) => (
              <UsuarioLinha
                key={usuario.id}
                usuario={usuario}
                setores={setores}
              />
            ))}
            {usuarios.total === 0 && (
              <tr>
                <td colSpan={4} className="vazio">
                  Nenhum usuário cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Paginacao
        base="/admin/usuarios"
        pagina={usuarios.pagina}
        paginas={usuarios.paginas}
        total={usuarios.total}
        rotulo="usuários"
      />
    </div>
  );
}
