"use client";

import { useActionState, useState } from "react";
import { criarConta, entrar, type EstadoLogin } from "./actions";

const INICIAL: EstadoLogin = { erro: null, aba: "entrar" };

export default function LoginForm() {
  const [aba, setAba] = useState<"entrar" | "criar">("entrar");
  const [login, acaoLogin, entrando] = useActionState(entrar, INICIAL);
  const [cadastro, acaoCadastro, criando] = useActionState(criarConta, INICIAL);

  const erro = aba === "entrar" ? login.erro : cadastro.erro;

  return (
    <div className="cartao">
      <div className="abas border-0 border-b-2">
        <button
          type="button"
          onClick={() => setAba("entrar")}
          className={`aba ${aba === "entrar" ? "aba-ativa" : ""}`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setAba("criar")}
          className={`aba ${aba === "criar" ? "aba-ativa" : ""}`}
        >
          Criar conta
        </button>
      </div>

      <form
        action={aba === "entrar" ? acaoLogin : acaoCadastro}
        key={aba}
        className="flex flex-col gap-4 p-5"
      >
        {aba === "criar" && (
          <div>
            <label className="rotulo" htmlFor="nome">
              Nome
            </label>
            <input id="nome" name="nome" required className="campo" />
          </div>
        )}

        <div>
          <label className="rotulo" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="campo"
          />
        </div>

        <div>
          <label className="rotulo" htmlFor="senha">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            required
            autoComplete={aba === "entrar" ? "current-password" : "new-password"}
            className="campo"
          />
        </div>

        {erro && <p className="erro">{erro}</p>}

        <button
          type="submit"
          disabled={entrando || criando}
          className="botao w-full"
        >
          {aba === "entrar" ? "Entrar" : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
