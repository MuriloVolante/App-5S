import { listarSetores, listarUsuarios } from "@/lib/repo";
import UsuarioForm from "./usuario-form";
import UsuarioLinha from "./usuario-linha";

export default function UsuariosPage() {
  const usuarios = listarUsuarios();
  const setores = listarSetores();
  const pendentes = usuarios.filter((usuario) => !usuario.papel).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="titulo">Usuários</h1>
        <p className="subtitulo mt-1">
          {usuarios.length} cadastrados · {pendentes} sem papel
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
          {usuarios.map((usuario) => (
            <UsuarioLinha key={usuario.id} usuario={usuario} setores={setores} />
          ))}
          {usuarios.length === 0 && (
            <tr>
              <td colSpan={4} className="vazio">
                Nenhum usuario cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
        </div>
    </div>
  );
}
