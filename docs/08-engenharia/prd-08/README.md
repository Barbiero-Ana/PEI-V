# PRD-08 — Acessibilidade

**Data registrada no PRD de origem:** 2026-11-04. Preservada da fonte; não representa a criação desta ficha.

**Revisão documental:** 13/11/2026 — Ana Barbiero — Líder de projeto. A aprovação da organização e rastreabilidade não substitui o aceite funcional.

Tamanho de texto, contraste, fonte, voz e movimento são preferências locais aplicadas na interface.

[PRD de origem](../../02-modulos/PRD-08%20%E2%80%94%20Acessibilidade.md) · [Matriz de rastreabilidade](../matriz.md) · [Qualidade e permissões](../prd-17/README.md)

## Perfis e necessidades

| Perfil | Necessidade | Solução |
| --- | --- | --- |
| Aluno com baixa visão | Ler e distinguir elementos | Texto maior e alto contraste |
| Aluno com dislexia ou em alfabetização | Entender o enunciado | Fonte Lexend e leitura em voz |
| Aluno sensível a movimento | Usar sem desconforto | Redução de animações, inclusive pela configuração do aparelho |
| Aluno que usa leitor de tela | Saber o que cada botão faz | Rótulos de acessibilidade |

## Implementação

- [apps/mobile/src/app/acessibilidade.tsx](../../../apps/mobile/src/app/acessibilidade.tsx)
- [apps/mobile/src/estado/acessibilidade.tsx](../../../apps/mobile/src/estado/acessibilidade.tsx)
- [apps/mobile/src/lib/acessibilidadeSalva.ts](../../../apps/mobile/src/lib/acessibilidadeSalva.ts)

**Persistência** Preferências locais do dispositivo.

## Regras de negócio

Sem regras numeradas próprias no PRD. Consulte a seção 5 da origem.

## Testes e limites

Medições, TalkBack e prévias por opção pendentes.

## Dependências

[PRD-17](../prd-17/README.md)

## Requisitos

- [MOD-ACE-001](mod-ace-001.md) O aluno pode escolher o tamanho do texto: normal, grande ou muito grande.
- [MOD-ACE-002](mod-ace-002.md) O aluno pode ativar a leitura em voz de enunciados, dicas, retornos e títulos, com opção de ouvir de novo.
- [MOD-ACE-003](mod-ace-003.md) O aluno pode usar uma fonte de leitura facilitada para dislexia.
- [MOD-ACE-004](mod-ace-004.md) O aluno pode ativar o alto contraste, aplicado sem reiniciar o aplicativo e sem sair da tela atual.
- [MOD-ACE-005](mod-ace-005.md) O aluno pode reduzir as animações; o sistema também respeita a redução de movimento configurada no aparelho.
- [MOD-ACE-006](mod-ace-006.md) Todos os elementos interativos têm rótulos para leitores de tela.
- [MOD-ACE-007](mod-ace-007.md) A tela de acessibilidade pode exibir uma pré-visualização do efeito de cada opção.
