# ADR 0018 — Site com planos e app só no celular

- **Status:** Aceita
- **Data:** 05/11/2026
- **Decisores:** a preencher pela equipe
- **Uso de IA:** auxílio na estrutura da página, na proposta de planos e na remoção da versão web do aluno, a
  partir do pedido da equipe.

## Contexto

O endereço principal do site abria uma versão do app do aluno feita para o navegador, e o próprio app (Expo)
também podia ser aberto na web. Isso duplicava o produto, confundia quem chegava pelo site e deixava o aluno
entrar por um caminho sem as regras do app (ADR 0017). A plataforma passa a ser paga, e o site precisa explicar
o que cada plano oferece.

## Decisão

- **O app do aluno é só para celular** (Android; iPhone opcional, conforme a proposta comercial): `platforms: ["ios", "android"]` no `app.json`, sem o
  `react-native-web` e sem o script `web`.
- **O site (`apps/web`) tem duas partes:** a página inicial, suave e na identidade da marca, com "como funciona",
  os planos e o botão "Acesso do professor"; e o painel do professor em `/professor`. As páginas do aluno no
  navegador (`/entrar` e `/jogar`) foram removidas.
- **Planos sem preço na página** (`apps/web/lib/planos.ts`), conforme a Proposta Comercial Modolume: Aplicativo
  do aluno (Android), Painel do professor e Pacote completo (app + painel). Abaixo dos planos ficam o que todos
  incluem (hospedagem, manutenção corretiva e horas técnicas) e dois botões: "Solicite uma demo" e "Fale com nossa
  equipe de vendas". Os valores, a forma de contratar (assinatura sem entrada ou compra com mensalidade),
  treinamentos e suporte ficam na proposta, montada pela equipe de vendas.
- **A página também apresenta a empresa:** o objetivo (entender como cada aluno aprende, de forma lúdica), os sete
  formatos de atividade, o que o aluno, o professor e a gestão recebem, perguntas frequentes e fotos de pessoas
  (Unsplash, licença livre), recortadas com fundo transparente.

## Alternativas consideradas

- **Manter a versão web do aluno:** mais alcance, mas duas versões para manter e um caminho sem PIN.
- **Mostrar os preços na página:** os valores da proposta são por escola e dependem da forma de contratar; na
  página, confundiriam mais do que ajudariam. A equipe de vendas apresenta a proposta.

## Consequências

- **Positivas:** um só caminho para o aluno (o celular); o site explica o produto e leva à demonstração.
- **Negativas:** quem não tem celular não usa o app (a escola pode usar tablets); a escola não vê preço sem falar com a equipe.
- **Pendente:** e-mail comercial oficial (hoje `contato@modolume.com.br`, em `lib/planos.ts`); página de
  demonstração ou formulário de contato no lugar do e-mail.

Relacionados: [[0017-acesso-individual-do-aluno]], [[PRD — Modolume]].
