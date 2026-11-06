# Task102 — implementação pronta para revisão 108

Data: 2026-10-27. Estado: implementação e validação offline concluídas;
**revisão independente 108 pendente, bloqueando 103**. Este relatório não é um
parecer independente nem aceite humano. `actual_model_calls: 0`.

## Gates e isolamento

Gates 100/106/107 recebidos como confirmados pelo supervisor na especificação
102. Não foi repetida a auditoria do avaliador. Não foram abertos relatório106,
scope101, recibos evaluation ou diretório privado. Nenhum modelo real,
resposta real, subagente, banco pessoal, credencial, commit, push ou publicação.
O dirty prévio foi preservado.

O executor offline lê somente sources-0.2.json, development-0.2.json,
freeze-0.2.json e o novo freeze core. Confere nove casos development, SHA canônico
do payload bundle e development, SHA de parâmetros e SHA de cada excerpt usado.
Os arquivos públicos 0.2 permanecem intactos. O status pending no freeze histórico
não foi transformado em aceite: vale a confirmação de gates do supervisor.

Bundle SHA canônico: e75d3066c9151d71b97c440f7a563147cfbc94a52302dcf5965075e2bdcdc7e9.
Development SHA canônico: 61f367acd9416bae838df01d4e42cef258c9cbe368bde73c99cf52a1088c1b4a.

## Entrega e diff

Todos os caminhos abaixo têm prefixo absoluto `/mnt/d/Projects/MimirNL/`:

- `/mnt/d/Projects/MimirNL/src/retrieval/index.ts`: dedup antes de limit,
  preservação de proveniência duplicada visível, ordem BM25/scope/recência/ID,
  cobertura lexical opt-in e iteração com no máximo limit grupos retidos.
- `/mnt/d/Projects/MimirNL/src/core/service.ts`: formato compacto opt-in,
  razões de fallback, telemetria de contadores na resposta opt-in. Transação
  operacional somente depois de validar o orçamento.
- `/mnt/d/Projects/MimirNL/src/optimization/index.ts`: orçamento do envelope
  inteiro, erro BUDGET_TOO_SMALL para vazio inviável, sem truncar excerpts.
- `/mnt/d/Projects/MimirNL/src/core/schemas.ts` e
  `/mnt/d/Projects/MimirNL/docs/mcp-schemas.json`: quatro opções versionadas,
  defaults compatíveis. Sem novas dependências ou mudanças de versão.
- `/mnt/d/Projects/MimirNL/docs/core-retrieval-0.3.md`: contrato dos parâmetros,
  privacidade, unidade bytes e limitações.
- `/mnt/d/Projects/MimirNL/test/core-v03.test.mjs`: seis testes comportamentais
  adicionais; limites, multibyte, provenance, compact, datas, baixa evidência,
  telemetria e falha sem mutação.
- `/mnt/d/Projects/MimirNL/test/pinned-source-fixture.mjs`,
  `/mnt/d/Projects/MimirNL/test/benchmark-public-multicase.test.mjs` e
  `/mnt/d/Projects/MimirNL/test/benchmark-multicase-codex.test.mjs`: fixtures
  históricas em clone temporário no PIN já existente. Os exportadores continuam
  recusando fonte divergente; testes dos runners usam os módulos atuais.
- `/mnt/d/Projects/MimirNL/scripts/benchmarks/core-ablation-v03.mjs`: executor
  offline com Service/SQLite descartável, baseline explícito, braços de ablação,
  integridade FTS da fixture e comparação com freeze core.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/core-parameters-0.3.json`:
  freeze para revisão 108; human_acceptance_ref=null, evaluation_opened=false.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/core-ablation-0.3.json`:
  configurações, fontes/IDs/hashes retornados, bytes e cobertura estrutural por caso.
- `/mnt/d/Projects/MimirNL/tasks/102-core.diff`: diff dos quatro módulos core e
  schema gerado, sem incluir alterações prévias de outras tarefas.

## Parâmetros congelados

`core-v03-1`: policy balanced-v1, recency verified-ties-v1, format compact-v1,
telemetry false, limit 3 e tokenBudget 32000 bytes. SHA do JSON dessa config:
`b834e4f46a31b241eeb90ba6edee5ebfb61b8a8abb204fc8b5986620e6216103`.

Regra pública geral: pelo menos ceil(U/4) termos únicos da consulta no conteúdo,
até 40 termos Unicode. Sem gold, grid search ou limiar por caso. A recência
somente desempata após BM25 e scope para verified com data válida não futura;
não altera verdade/status/permissões. Defaults continuam legacy/off/full/off.

Compact preserva conteúdo integral e identidade/citação/hash/fonte/trust/versão;
remove created/updated/uses. DuplicateProvenance conserva identidades e fontes
das cópias autorizadas. Unidade que não cabe é excluída inteira. Metadados estão
no budget; erro vazio inviável não incrementa retrievals/uses. Contadores
operacionais existentes continuam ativos; telemetry opcional não grava nem envia
raw query/conteúdo. Não houve alteração de prompts históricos, ingestão, PATH,
backup/restore, banco/schema SQLite ou serviços externos.

## Testes e checks

Runtime Linux: Node 24.22.1 em `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin`.
Windows final: `C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64\node.exe`,
Node 24.22.1, plataforma win32, SQLite 3.53.4, conforme
`/mnt/d/Projects/MimirNL/docs/v02-final-installation.md`/Task44. Executável
invocado diretamente; nenhum PATH persistente ou configuração pessoal alterado.
A tentativa inicial usou Node 24.21.0 da máquina e é somente evidência diagnóstica,
substituída pelos testes focados finais no runtime suportado.

- `npm test` Linux: **130 pass, 0 fail, 1 skip** (teste de short-path Windows).
  Inclui MCP real local, CLI, isolamento/status/scopes, ingestão, segurança,
  histórico, feedback, backup/restore e benchmarks sintéticos existentes.
- Após o último ajuste e inclusão do sexto teste de privacidade:
  `node --test test/core-v03.test.mjs`: **6 pass** Linux e **6 pass** Windows.
- `npm run typecheck`, `npm run lint`, `npm run schemas:check`: passaram.
- Prettier dos arquivos desta entrega: passou.
- `npm run format:check` global: ainda aponta **somente** contrato-0.2.md e
  fechamento-0.2.md preexistentes, fora do diff core. Não reformatei esses documentos.
- Primeira tentativa de fullsuite Windows falhou por `git ENOENT` no PATH nativo.
  A validação Windows pertinente dos seis testes novos não depende de Git e passou.
  Runtime portátil documentado e Git portátil estão disponíveis. Os seis testes
  focados foram repetidos com Node 24.22.1 suportado: 6 pass, 0 fail. Não foi
  repetida a fullsuite; validação Windows integral continua pendência para 105.
- Não foi afirmada execução de CI remoto ou teste com modelo.

Logs absolutos: `/mnt/d/Projects/MimirNL/tasks/102-test-linux-output.txt`,
`/mnt/d/Projects/MimirNL/tasks/102-focused-linux-output.txt`,
`/mnt/d/Projects/MimirNL/tasks/102-focused-windows-output.txt` (inicial),
`/mnt/d/Projects/MimirNL/tasks/102-focused-windows-supported-output.txt` (final),
`/mnt/d/Projects/MimirNL/tasks/102-checks-output.txt`,
`/mnt/d/Projects/MimirNL/tasks/102-format-output.txt`,
`/mnt/d/Projects/MimirNL/tasks/102-format-focused-output.txt`.
A tentativa Windows malsucedida está em
`/mnt/d/Projects/MimirNL/tasks/102-test-output.txt`.

## Ablação e reprodução

Na raiz, com Node Linux acima no PATH, executar:

```sh
npm run build
node scripts/benchmarks/core-ablation-v03.mjs
```

Usa apenas SQLite descartável e fontes development congeladas. IDs e datas
sintéticos estáveis; nenhum banco operacional. O script usa Prettier já presente
como devDependency para serializar seu artefato; nenhuma dependência foi adicionada.
Baseline: SQL histórico OR/BM25/scope/ID, limit antes de dedup, formato full e
mesmo budget; optimize equivalente nesse orçamento. Braços: dedup/full,
relevance/full, relevance/compact e config final com recency. Os fontes históricos
são os excerpts congelados, não o código novo, preservando a comparação.

Duas execuções finais produziram bytes idênticos. SHA-256 do arquivo final:
`fbe90ede0cd59eded1b1490449d233155fcc125db7d7f5f564a8acf9f09fbc11`.
Os hashes de arquivo bruto no artefato são distintos dos hashes canônicos do freeze.

| Development | Baseline unidades | Final unidades |
| --- | ---: | ---: |
| expanded-budget-envelope | 3 | 3 |
| expanded-sharing-eligibility | 3 | 3 |
| expanded-project-path-boundary | 3 | 2 |
| expanded-production-p95-absent | 2 | 0 |
| expanded-runtime-config-absent | 3 | 1 |
| expanded-apparent-version-scope | 2 | 2 |
| pilot-approval | 1 | 1 |
| pilot-budget | 1 | 1 |
| pilot-failure | 1 | 1 |

Baseline: 19 unidades e 47466 bytes somados dos envelopes; final: 14 unidades e
37342 bytes. Essa diferença mistura seleção e layout. Comparando somente o
formato com as mesmas seleções nos braços relevance/full vs relevance/compact,
a economia é 1050 bytes somados. **Não são tokens, Precision, Recall, qualidade
ou economia de API.** R técnico não foi solicitado nem lido; cobertura é somente
fração estrutural do pool. Recency não tem efeito nestas fontes candidate;
seu comportamento é exercitado em testes sintéticos verified.

Durante a preparação da fixture, estabilizar IDs sem atualizar o índice FTS
produziu uma execução vazia inválida; foi corrigido antes da entrega, reexecutado
e adicionada a checagem de integridade do join FTS. O artefato final não contém
resultados dessa tentativa.

## Limitações e passagem de gate

A regra lexical não comprova suficiência: o caso runtime-config-absent ainda
retorna uma fonte, apesar de não haver evidência de configuração. Nenhum parâmetro
foi retunado para esse caso. Sem revisão de R não há alegação de ganho de qualidade.
BM25/FTS mantém stemming/tokenização próprios; a cobertura Unicode adicional é
mais restrita e pode descartar variantes linguísticas. O SQL percorre/ordena o
conjunto elegível inteiro para dedup/proveniência, podendo custar mais que o
LIMIT antigo em pools grandes; não há teste de latência de produção ou alegação
de melhoria de desempenho. Memória de grupos retidos é limitada a k, mas SQLite
pode precisar de ordenação temporária. A revisão 108 deve avaliar esse tradeoff.

O budget cobre o envelope JSON do Service, não wrappers MCP/stdio nem o envelope
de erro. Telemetry mínima pode tornar inviável um budget que antes comportava
somente o resultado vazio; isso retorna erro estruturado sem sucesso fictício.

Próximo passo autorizado: revisão independente **108**, por pessoa/agente
separado, sem conteúdo holdout necessário. A especificação proíbe subagentes
nesta execução; nenhum parecer foi autoemitido. **103 continua bloqueada** até
APPROVE108 e resolução das pendências aplicáveis. A publicação permanece separada.

## Comandos explícitos de ambiente (orientação final do supervisor)

Todos os comandos Linux de validação foram executados com prefixo por comando
`PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH`.
Não foi repetida a fullsuite Linux após verde. O Windows final focado foi:

```sh
'/mnt/c/Users/Public/mimir-hardening-runtime/node/node-v24.22.1-win-x64/node.exe' --test test/core-v03.test.mjs
```

Somente o caminho documentado foi conferido; nenhuma busca em credenciais ou
configuração pessoal, instalação global, chamada de modelo ou sessão de host.

## Encerramento supervisor

Task108APPROVE (tasks/108-v03-core-review-findings.md) conferido com parecer/saída real, hashes e ablação reproduzidos. Revisor10c34174 liberado explicitamente após resposta. Policycorecongelada e semholdoutconsumido para tuning; Task103 liberada com hashengine/policy vinculados. FullsuiteWindows/formatação global continuam pendências105,semdeclararCIverde. Semmodelosnovos/commitpush.
