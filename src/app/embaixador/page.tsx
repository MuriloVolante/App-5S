import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";
import {
  listarChecklistsDoSetor,
  listarTemplatesDoSetor,
  obterTemplate,
} from "@/lib/repo";
import { ROTULO_STATUS_CHECKLIST } from "@/types";
import CriarChecklist from "./criar-checklist";
import { LINKS_EMBAIXADOR } from "./links";

export default async function EmbaixadorPage() {
  const usuario = await requirePapel(["embaixador"]);
  const templates = listarTemplatesDoSetor(usuario.setor_id!);
  const checklists = listarChecklistsDoSetor(usuario.setor_id!);
  const abertos = checklists.filter(
    (checklist) => checklist.status === "aberto"
  ).length;

  return (
    <>
      <Header
        usuario={usuario}
        links={LINKS_EMBAIXADOR}
        ativo="/embaixador"
      />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-5 sm:py-8">
        <div>
          <h1 className="titulo">Checklists do setor</h1>
          <p className="subtitulo mt-1">
            {abertos} aberto(s) aguardando preenchimento do auditor
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="subtitulo">Abrir novo checklist</h2>
          {templates.length === 0 && (
            <p className="nota">
              Nenhum template cadastrado para o seu setor. Peça ao administrador.
            </p>
          )}
          <ul className="flex flex-col gap-2">
            {templates.map((template) => (
              <li key={template.id} className="cartao-plano cartao-item">
                <span className="break-words">
                  <span className="codigo">{template.codigo}</span>{" "}
                  {template.nome}
                </span>
                <CriarChecklist templateId={template.id} />
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="subtitulo">Checklists abertos e finalizados</h2>
          {checklists.length === 0 ? (
            <p className="nota">Nenhum checklist criado até agora.</p>
          ) : (
            <div className="tabela-rolagem">
              <table className="tabela">
                <thead>
                  <tr>
                    <th className="w-32">Código</th>
                    <th>Template</th>
                    <th className="w-44">Criado em</th>
                    <th className="w-36">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {checklists.map((checklist) => {
                    const template = obterTemplate(checklist.template_id);
                    return (
                      <tr key={checklist.id}>
                        <td className="codigo">{checklist.codigo}</td>
                        <td>
                          <span className="codigo">{template?.codigo}</span>{" "}
                          {template?.nome}
                        </td>
                        <td>
                          {new Date(checklist.data_criacao).toLocaleString(
                            "pt-BR"
                          )}
                        </td>
                        <td>
                          <span className={`selo selo-${checklist.status}`}>
                            {ROTULO_STATUS_CHECKLIST[checklist.status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
