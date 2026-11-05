import { useLayoutEffect, useRef } from "react";

/**
 * Ref que sempre guarda o último valor, atualizado depois da renderização.
 * Usado por callbacks de gesto/arraste, que rodam fora do ciclo de render.
 */
export function useUltimo<T>(valor: T) {
  const ref = useRef(valor);
  useLayoutEffect(() => {
    ref.current = valor;
  });
  return ref;
}
