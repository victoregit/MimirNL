# Preflight offline v0.3

> Atualização Task99 (2026-10-27): conteúdo abaixo preserva a proposta/perfil histórico 0.1. Para novo trabalho, consultar a [emenda0.2](contrato-0.2.md) e o [plano de fechamento](fechamento-0.2.md), pendentes de revisão Task100. Autorizações e tetos antigos não substituem a continuidade delimitada da sessão; accepted/validated legados não serão fabricados. Há execução exploratória A/B posterior nas [Tasks82](../../../tasks/82-v03-two-host-closeout.md), [90](../../../tasks/90-v03-multicase-codex-pilot-review-findings.md) e [96](../../../tasks/96-v03-layout-live-comparison-review-findings.md); ABC novo permanece pendente.

Protótipo limitado para a [proposta de contrato 0.1](contrato.md), ainda não aprovada. Valida estrutura e coerência interna de um array JSON não vazio de casos e prepara uma matriz pública. Não é executor nem avaliação de benchmark. Não demonstra ganho, aprova corpus ou resolve decisões pendentes.

Requer o Node já instalado na versão suportada pelo projeto. Execução manual, a partir da raiz do repositório:

```sh
node scripts/benchmarks/preflight-cli.mjs --help
node scripts/benchmarks/preflight-cli.mjs validate /caminho/local/casos.json
node scripts/benchmarks/preflight-cli.mjs plan /caminho/local/casos.json --reps 3 --out /caminho/local/plano-novo.json
```

Somente o arquivo de casos explicitamente fornecido é lido. `validate` não escreve; `plan` exige destino explícito e novo, criado exclusivamente sem sobrescrever arquivos ou seguir symlinks existentes. Saída e erros não reproduzem valores privados, chaves desconhecidas ou caminhos fornecidos. Entrada inválida e colisão de destino retornam código 1; sucesso e ajuda retornam 0. O arquivo original de casos permanece privado.

O módulo importável [preflight.mjs](../../../scripts/benchmarks/preflight.mjs) expõe `validateCases(cases)` e `planCases(cases, repetitions)` sem I/O ou efeitos ao importar. Casos exigem todos os campos do contrato e rejeitam campos adicionais em cada objeto, inclusive contexto, revisão e rubrica. Verifica tipos, enums, referências únicas e existentes, intervalos inclusivos, caminhos relativos portáveis e SHA-256 dos bytes UTF-8 exatos do trecho fornecido. Caminhos usam `/`; componentes vazios, `.`, `..`, barras invertidas, dois-pontos e controles são recusados. Identidade do repositório também deve ser portátil. Um batch não pode conter o mesmo ID de caso duas vezes, mesmo com revisões diferentes.

Validação estrutural aceita casos ilustrativos ou pendentes coerentes; o exemplo JSON do contrato passa. Alegações `accepted` ou `validated` exigem referências de revisão Codex, aceite humano, permissão e revisor de fontes diferente do autor. Gold `validated` exige revisão `accepted` e resposta não nula. Esses campos são **proveniência declarada pelo chamador**, não evidência conferida pela ferramenta: o protótipo não lê Git, arquivos-fonte nem registros de autorização. O hash conferido é somente o do `excerpt` recebido, não sua correspondência com a fonte real.

Planejamento exige todos os casos não ilustrativos, aceitos, com gold validado e referências completas. Não exclui silenciosamente casos inelegíveis. Repetições devem ser inteiros entre 1 e 100; limite total de 1.000 linhas de cenário. Ordena casos por ID usando unidades de código, e rota os cenários A/B/C em ABC, BCA, CAB, com deslocamento por caso. A representa `sem_memoria`, B `com_mimir`, C `historico_completo`. Cada tripla compartilha ID, revisão, repetição e commit; em cada ciclo de três repetições as posições ficam balanceadas. Quantidades fora de múltiplos de três têm balanço parcial, com diferença máxima de uma posição por cenário e caso.

O plano usa allowlist: identificadores de execução/caso, revisão, cenário, repetição, commit, posição e status `not_run`. Metadados fixos registram `status=planned`, `executable=false`, proveniência não verificada, razões de bloqueio, decisões pendentes e modelo/orçamento/retrieval nulos. Não contém tarefa, trechos, caminhos de fontes, identidade do repositório, ouro, critérios, rubrica, notas ou referências humanas. Não prepara contexto, histórico ou seed, não cria banco, não chama modelos e não escolhe modelo, k ou orçamento. Não substitui manifesto aprovado, verificação independente das fontes e permissões, adapters ou isolamento de execução.

Nesta entrega, a única alteração no contrato é editorial: cardinalidades da tabela de métricas passaram de barras literais que quebravam o Markdown para `count(...)`, preservando fórmulas e semântica. Isso não aprova o contrato. A implementação recebeu [revisão independente APPROVE na Task51](../../../tasks/51-v03-preflight-review-findings.md); aceite humano e integração permanecem pendentes, sem commit/push autorizado.

Fixtures sintéticas e verificações de CLI estão em [benchmark-preflight.test.mjs](../../../test/benchmark-preflight.test.mjs); não utilizam ouro real do corpus.
