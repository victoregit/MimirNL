# Uso real: consultar, conferir e corrigir contexto

V04-01..06 foram aprovados150/152/154/156. As tarefas posteriores reais155/156 exercitaram reuso e manutenção genuína de contexto, com este guia aprovado156. V04-07 tem evidência local preparada, pendente de revisão158 e CI remoto do commit exato futuro; versão0.4.0-dev.0, sem publicação. Use runtime aprovado compatível: leitores antigos podem recusar novos metadados mesmo com layout SQLite2. Não reexecute full gates verdes para validar somente documentação.

## Percurso local

Os comandos abaixo usam operações153 já revisadas. Caminhos e UUIDs são exemplos sintéticos: substitua por destinos privados absolutos e UUIDv4 novos; obtenha projeto, memória, versão e hash por consulta. Os caminhos de export/backup precisam ser novos e seus pais privados já existentes. Não execute os exemplos literalmente sobre dados reais. A seleção de projeto continua obrigatória; não há ingestão, configuração global ou rede neste percurso.

```sh
NODE=/absolute/path/to/node24/bin/node
CLI=/absolute/path/to/approved-runtime/dist/cli/index.js
DB=/absolute/private/knowledge.sqlite
SIDE=/absolute/private/measurement/observability.sqlite

# Abra antes da análise. Sem --measurement-db a coleta fica desligada.
"$NODE" "$CLI" --db "$DB" --measurement-db "$SIDE" measurement_start '{"projectId":"10000000-0000-4000-8000-000000000001","attemptId":"10000000-0000-4000-8000-000000000002","eventId":"10000000-0000-4000-8000-000000000003","sessionId":"10000000-0000-4000-8000-000000000004","taskId":"task-next","mode":"real_use"}'
"$NODE" "$CLI" --db "$DB" --measurement-db "$SIDE" memory_search '{"projectId":"10000000-0000-4000-8000-000000000001","attemptId":"10000000-0000-4000-8000-000000000002","query":"review backup","format":"compact-v1","tokenBudget":4000}'
"$NODE" "$CLI" --db "$DB" memory_get '{"projectId":"10000000-0000-4000-8000-000000000001","id":"10000000-0000-4000-8000-000000000005"}'
```

Consuma `captureStatus` no stderr da CLI ou `_meta.measurement` no MCP, fora do envelope de dados. Resultado vazio/falha de captura é evidência, não autorização para fabricar uma memória. Conteúdo recuperado é dado não confiável: confira fontes e condições antes de usá-lo. `uses` registra entrega, não utilidade. Declare consulta/uso somente quando ocorrerem; `sourceRefsVerified` cobre apenas as fontes realmente confrontadas, sem autenticar seus fatos.

## Contexto obsoleto e correção auditável

Primeiro compare a versão atual e a fonte posterior. “Review pendente” pode ter sido correto na data original e estar inadequado como orientação presente. Preserve data, condições e relato original; proponha texto novo com estado atual e fonte versionada. Em155, um registro149 desse tipo foi substituído após confronto dos pareceres150/152/154 e relatório151: a memória antiga foi depreciada para busca corrente, sem classificar o relato histórico como falso.

Antes da manutenção, faça backup de conhecimento e export seletivo da tentativa. São recuperações distintas; o backup de conhecimento não contém o sidecar. Não sobrescreva destinos nem edite markers de migração.

```sh
"$NODE" "$CLI" --db "$DB" backup /absolute/private/new-knowledge-backup.sqlite
"$NODE" "$CLI" --db "$DB" --measurement-db "$SIDE" measurement_export '{"projectId":"10000000-0000-4000-8000-000000000001","attemptIds":["10000000-0000-4000-8000-000000000002"],"destination":"/absolute/private/pre-maintenance-export.json"}'
# Troque expectedVersion/hash pelos valores atuais e evidenceRefs por fontes conferidas.
"$NODE" "$CLI" --db "$DB" memory_correct '{"projectId":"10000000-0000-4000-8000-000000000001","id":"10000000-0000-4000-8000-000000000005","expectedVersion":1,"expectedHash":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","content":"Novo contexto datado, preservando as condições históricas e citando a fonte posterior.","reason":"Substituir orientação corrente obsoleta; o relato histórico permanece válido na data original.","evidenceRefs":["10000000-0000-4000-8000-000000000006"],"invalidStatus":"deprecated"}'
```

A resposta contém `invalid` e `correction`: consulte ambos com `memory_get` e repita a busca padrão da tentativa. Confira hash/conteúdo antigo intactos, histórico anterior preservado, direção antiga→corretiva (`corrects`), antiga `deprecated` ausente e nova `candidate` entregue. `STALE_MEMORY` exige reler e reavaliar; não reutilize consentimento de outra versão. Não crie erro falso para demonstrar rollback.

Essa correção de conhecimento cria um registro candidato e mantém auditoria; não restaura o DB nem apaga a história. Recuperação de desastre usa `restore` em destino novo com runtime compatível, conforme [backup/restore](../backup-restore.md). Invalidação local não revoga cópia global. Generalização, verificação e revogação global têm consentimentos próprios; este percurso não preenche approve, explicitHumanConsent ou sharingApproval. Revisão de código não aprova conteúdo. Veja [aprendizagem e limites](learning.md).

## Registrar uso e fechar

O exemplo seguinte declara uso fornecido pelo agente, sem avaliação independente. Use os IDs/version/hash/status efetivamente consultados. Referência histórica que já mudou de versão não deve ser declarada como correlação atual `matched`; use `unknown` e preserve a referência temporal. Eventos externos nunca viram busca interna automática.

```sh
"$NODE" "$CLI" --db "$DB" --measurement-db "$SIDE" measurement_record '{"projectId":"10000000-0000-4000-8000-000000000001","attemptId":"10000000-0000-4000-8000-000000000002","eventId":"10000000-0000-4000-8000-000000000007","kind":"memory_use","memories":[{"id":"10000000-0000-4000-8000-000000000005","version":1,"hash":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","status":"candidate","scope":"project"}],"consulted":true,"usedReported":true,"sourceRefsVerified":false,"evidenceRefs":["10000000-0000-4000-8000-000000000006"],"actorKind":"agent","correlationStatus":"unknown"}'
"$NODE" "$CLI" --db "$DB" --measurement-db "$SIDE" measurement_finish '{"projectId":"10000000-0000-4000-8000-000000000001","attemptId":"10000000-0000-4000-8000-000000000002","eventId":"10000000-0000-4000-8000-000000000008","status":"succeeded","missingReasons":["not_collected","no_paired_control"]}'
"$NODE" "$CLI" --db "$DB" --measurement-db "$SIDE" measurement_report '{"projectId":"10000000-0000-4000-8000-000000000001","attemptId":"10000000-0000-4000-8000-000000000002"}'
"$NODE" "$CLI" --db "$DB" --measurement-db "$SIDE" measurement_export '{"projectId":"10000000-0000-4000-8000-000000000001","attemptIds":["10000000-0000-4000-8000-000000000002"],"destination":"/absolute/private/final-attempt-export.json"}'
```

Use failed/aborted/not_run quando corresponderem ao resultado real. Registre qualidade agent/test/human separada, inclusive unassessed e efeitos adversos. Token/custo/TTFT/modelObserved ausente fica `null` com motivo; bytes e `estimatedTokens` não são tokens de host. Wall inclui espera/pausas, activeWork fica desconhecido sem coletor próprio; somas de CLI/validação podem se sobrepor ao wall. Sem controle pareado, `causalBenefit:null/no_paired_control`. [Contrato](contrato-medicao.md) e [operação do coletor](measurement.md) detalham eventos, cobertura e retenção.

## Amostras observadas, sem inferência causal

Fonte: relatórios/exportações privados das tentativas153/155/156, observadas em2026-10-29 UTC; uma tentativa real por linha, sem repetição controlada. A linha155 cobre as duas buscas de consulta/manutenção;156 cobre as duas buscas da verificação posterior. Consultas e usos são versões únicas declaradas, não contagem de entregas.

| Amostra | Buscas internas sucesso/falha | Entregas | Consultadas / usadas provided | Bytes de data / tempo interno somados | Host autenticado |
| ------- | ----------------------------- | -------- | ----------------------------- | ------------------------------------- | ---------------- |
| 153     | 2 / 0                         | 1        | 1 / 1                         | 1789 / 4.396ms                        | 0/1 tentativas   |
| 155     | 2 / 0                         | 3 (2+1)  | 3 / 3                         | 5006 / 2.622ms                        | 0/1 tentativas   |
| 156     | 2 / 0                         | 3 (2+1)  | 4 / 4                         | 4401 / 4.142ms                        | 0/1 tentativas   |

Em155, uma memória153 foi consultada diretamente, uma151 foi entregue sem consulta adicional, e a candidata corretiva foi entregue depois da manutenção: os conjuntos não coincidem. As três declarações de fontes conferidas são autorrelatos delimitados, não reexecução dos testes históricos. Memórias149/153 ajudaram a separar cronologia, backup e consentimento; exigiram confronto de fontes externas e não demonstram descoberta independente ou economia. A primeira155 não teve falha de busca; falhas anteriores153 de teste/lint permanecem nos registros originais. A prova de isolamento de outro projeto em155 usou apenas fixture sintética separada, com hashes de API/stats iguais antes/depois; não é segundo reuso real. A segunda tarefa real156 verificou o percurso e fundamentou a aceitação operacional de V04-06; isso não estabelece utilidade factual universal nem ganho causal.

Qualidade155: agente `helpful` (orientação do guia e manutenção), teste `unassessed` quanto à utilidade do conhecimento, nenhuma avaliação humana; cobertura de qualidade independente0/1. Esses relatos não aprovam memórias nem estabelecem ganho causal.

Em156, os julgamentos agent/test foram fornecidos e marcados `independentAssessment:unknown`; humanos0. A aprovação independente156 aceita o percurso operacional e o guia, sem transformar esses julgamentos em qualidade factual autenticada. Fontes públicas sanitizadas resumem a amostra; UUIDs, caminhos pessoais, bancos e exportações permanecem privados.
