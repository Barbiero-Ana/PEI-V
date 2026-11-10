/** Contrato comum de todos os minijogos com a partida. */
export interface PropsJogo<R> {
  rodada: R;
  /** Resposta ainda não está certa — a partida mostra uma dica gentil. */
  onErro: (mensagem?: string) => void;
  /** Fase concluída (mensagem opcional, ex.: "O cubo tem 6 faces!"). */
  onAcerto: (mensagem?: string) => void;
  /** Verdadeiro depois do acerto, enquanto o aluno não toca em "Continuar". */
  bloqueado: boolean;
  /** A dica (lâmpada) está aberta: o jogo pode mostrar ajudas visuais. */
  dica?: boolean;
}
