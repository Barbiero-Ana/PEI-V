"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Fecha o painel lateral com a tecla Esc, voltando para o endereço sem ele. */
export function FecharComEsc({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.replace(href, { scroll: false });
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [href, router]);
  return null;
}
