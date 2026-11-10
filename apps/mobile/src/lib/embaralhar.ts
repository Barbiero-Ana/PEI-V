/** Embaralhamento determinístico: a mesma semente gera sempre a mesma ordem (a fase não muda a cada render). */
export function embaralhar<T>(lista: readonly T[], semente: number): T[] {
  const copia = [...lista];
  let s = (semente * 9301 + 49297) % 233280 || 1;
  const aleatorio = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j]!, copia[i]!];
  }
  return copia;
}

export function sementeDe(numeros: number[]): number {
  return numeros.reduce((s, n, i) => s + n * (i + 7) * 31, 17);
}
