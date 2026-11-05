import Link from "next/link";
import { Simbolo } from "./simbolo";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-semibold tracking-tight text-tinta ${className}`}>
      modol<span className="text-roxo">u</span>me
    </span>
  );
}

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-end gap-2" aria-label="Modolume — início">
      <Simbolo tamanho={40} rotulo="" />
      <Wordmark className="text-[1.6rem] leading-none" />
    </Link>
  );
}
