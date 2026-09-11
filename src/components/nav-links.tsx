"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type LinkNav = { href: string; rotulo: string };

function ehAtivo(pathname: string, href: string, todos: LinkNav[]) {
  const candidatos = todos
    .filter(
      (link) => pathname === link.href || pathname.startsWith(`${link.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length);

  return candidatos[0]?.href === href;
}

export default function NavLinks({ links }: { links: LinkNav[] }) {
  const pathname = usePathname();

  return (
    <nav className="cabecalho-nav">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`link-nav ${
            ehAtivo(pathname, link.href, links) ? "link-nav-ativo" : ""
          }`}
        >
          {link.rotulo}
        </Link>
      ))}
    </nav>
  );
}
