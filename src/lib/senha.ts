import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function gerarHash(senha: string) {
  const sal = randomBytes(16).toString("hex");
  const derivada = scryptSync(senha, sal, 64).toString("hex");
  return `${sal}:${derivada}`;
}

export function conferirSenha(senha: string, hash: string) {
  const [sal, derivada] = hash.split(":");
  if (!sal || !derivada) return false;

  const candidata = scryptSync(senha, sal, 64);
  const guardada = Buffer.from(derivada, "hex");
  return (
    candidata.length === guardada.length && timingSafeEqual(candidata, guardada)
  );
}
