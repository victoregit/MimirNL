# Contrato comum de benchmark v0.3 — proposta v0.1

**Estado: proposta para acordo; não aprovada.** Vincula-se ao [plano de divisão de tarefas](../../v03-divisao-de-tarefas.md) e à [seção v0.3 do roadmap](../../../ROADMAP_MIMIR_NL.md#v030--useful-context-not-just-more-context-p0). Define um formato documental implementável; não implementa schema, parser, executor ou coleta. Não demonstra ganhos.

## Entregas e aprovação

A equipe principal propõe este contrato. O amigo continua responsável pelas propostas futuras em `docs/benchmarks/v03/casos.md` e `docs/benchmarks/v03/metodologia.md`; esses arquivos não são criados por esta entrega. O autor não aprova a própria entrega: outra pessoa confere fontes e gold, Codex faz revisão independente e o mantenedor registra aceite humano antes da integração.

A autorização futura deve registrar uma vez: responsável, operações, caminhos absolutos permitidos, dados que podem sair, provedor/destino, limites de chamadas/tempo/custo e validade. Repetições dentro do escopo autorizado não exigem reaprovação. Mudança de escopo exige decisão do usuário. Esta proposta não autoriza ingestão, uso de banco real, execução externa, chamadas a modelos, configuração de hosts, commit, push ou release. Telemetria permanece local e opt-in, sem upload por padrão.

## Convenções e campos de caso

Todos os campos descritos são obrigatórios, inclusive chaves cujo valor pode ser `null`. String não vazia, inteiro não negativo e número finito são os tipos padrão; revisões são inteiros positivos. IDs estáveis não são reutilizados. Datas são ISO 8601 UTC. SHA de commit é string de exatamente 40 caracteres hexadecimais (`^[0-9a-f]{40}$`); hash de conteúdo é SHA-256, 64 hex, calculado sobre bytes UTF-8 exatos sem normalização. Caminhos de fontes e artefatos compartilhados são relativos à raiz do repositório, sem escape por `..`. O manifesto mapeia essa raiz para um caminho local absoluto em cada máquina, preservando os hashes; não é necessário converter cada caso.

| Campo                                          | Tipo e regra                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contract_version`, `case_id`, `case_revision` | string, string, inteiro positivo; identidade do formato e caso                                                                                                                                                                                                                                                               |
| `illustrative_only`, `split`                   | boolean; enum `development` ou `evaluation`; exemplos nunca entram no corpus                                                                                                                                                                                                                                                 |
| `source`                                       | objeto: `repository` string (identidade portátil do repositório, não caminho local), `commit_sha` 40 hex; fixar commit existente e autorizado antes de aceitar                                                                                                                                                               |
| `sources[]`                                    | array não vazio de objetos: `source_id`, `unit_id`, `path` strings (path relativo à raiz do repositório); `start_line`, `end_line` inteiros positivos inclusivos; `excerpt` string; `sha256` 64 hex do trecho exato                                                                                                          |
| `model_context`                                | objeto com `task` string e `allowed_source_ids` array de strings; única parte do caso exportável ao modelo, além das fontes/histórico autorizados                                                                                                                                                                            |
| `evaluation_private`                           | objeto fora do contexto: `gold_status` enum `pending`, `validated`, `sem_gold`; `expected_answer` string ou null; `relevant_unit_ids` array único ou null quando sem gold; `success_criteria` array não vazio de strings; `rubric` array não vazio de objetos `{id, criterion, weight}` com strings e peso numérico positivo |
| `review`                                       | objeto: `author` string; `source_reviewer`, `codex_review_ref`, `human_acceptance_ref` strings ou null; `decision` enum `pending`, `accepted`, `rejected`; `notes` string                                                                                                                                                    |
| `permissions_ref`                              | string ou null; referência ao registro de autorização, obrigatória não nula antes de executar                                                                                                                                                                                                                                |

A unidade de relevância é `(source_id, unit_id)` versionada no caso: trecho lógico canônico, não chunk do retriever. IDs de unidades devem mapear univocamente aos trechos. O revisor confere resposta esperada, conjunto relevante, critérios e pesos diretamente nas fontes fixadas; divergência impede aceite. `validated` exige evidência dessa conferência, revisão independente e aceite humano. A saída de um modelo não constitui gold.

O avaliador recebe `evaluation_private` separadamente. Nunca enviar esse objeto, notas de revisão com respostas, rubricas com respostas, relatórios anteriores ou gold ao modelo, ao histórico ou à memória. O corpus pode conter fatos originais necessários à solução; não pode conter respostas de benchmark ou soluções preparadas para o caso.

### Caso sintético completo (somente ilustração)

Fonte e commit abaixo são fictícios; o hash corresponde somente ao trecho literal `Azul.` (sem quebra final). Não é caso aceito nem ouro validado, e não descreve uma tarefa executada.

```json
{
  "contract_version": "0.1",
  "case_id": "illustration-color",
  "case_revision": 1,
  "illustrative_only": true,
  "split": "development",
  "source": {
    "repository": "MimirNL",
    "commit_sha": "0000000000000000000000000000000000000000"
  },
  "sources": [
    {
      "source_id": "fictional-guide",
      "unit_id": "color",
      "path": "EXEMPLO_FICTICIO.md",
      "start_line": 1,
      "end_line": 1,
      "excerpt": "Azul.",
      "sha256": "2cc6094d0627a1de79cd5b695752ec0dac0cdad68b6cc7e280db4e9adc245d82"
    }
  ],
  "model_context": {
    "task": "Qual cor o guia fictício especifica? Cite a fonte.",
    "allowed_source_ids": ["fictional-guide"]
  },
  "evaluation_private": {
    "gold_status": "pending",
    "expected_answer": "Azul, conforme fictional-guide/color.",
    "relevant_unit_ids": ["fictional-guide/color"],
    "success_criteria": ["Indicar Azul e citar o trecho fixado."],
    "rubric": [
      {
        "id": "fact",
        "criterion": "Indica Azul sem contradição.",
        "weight": 1
      },
      {
        "id": "source",
        "criterion": "Cita fictional-guide/color corretamente.",
        "weight": 1
      }
    ]
  },
  "review": {
    "author": "autor-ilustrativo",
    "source_reviewer": null,
    "codex_review_ref": null,
    "human_acceptance_ref": null,
    "decision": "pending",
    "notes": "Exemplo fictício; não aceitar nem executar."
  },
  "permissions_ref": null
}
```

## Manifesto e comparação pareada

Antes de executar, congelar um manifesto. Todos os campos abaixo são obrigatórios; `null` representa pendência na proposta e bloqueia execução quando necessário ao protocolo.

| Campo                                                         | Tipo e conteúdo                                                                                                                                                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `local_roots`                                                 | objeto que mapeia identidade do repositório para raiz local absoluta; específico da máquina, fora dos casos compartilhados                                                         |
| `manifest_id`, `revision`, `contract_version`                 | string, inteiro positivo, string                                                                                                                                                   |
| `case_refs[]`                                                 | objetos com `case_id`, `case_revision`, `split`; apenas casos aceitos, não ilustrativos                                                                                            |
| `corpus_revision`, `executor_commit_sha`, `engine_commit_sha` | revisão string e commits 40 hex; incluir hashes dos artefatos e ambiente/runtime/host/SO em `environment` objeto                                                                   |
| `history`                                                     | objeto com `authorization_ref`, `path`, `sha256`, `cutoff` UTC e `selection_rule`; histórico congelado anterior à tarefa, sem gold nem saídas de rodadas                           |
| `memory_seed`                                                 | objeto com `path`, `sha256`, `preparation_revision`, `source_refs`; snapshot sanitizado derivado só do corpus/histórico permitido                                                  |
| `model`                                                       | objeto `provider`, `id`, `version` strings; `parameters` objeto com temperatura, seed se suportada e demais parâmetros; indisponibilidade de versão/seed registrada explicitamente |
| `tools`, `task_budget`                                        | lista de ferramentas/versionamento/permissões; objeto com `context_tokens`, `max_output_tokens`, `max_calls`, `timeout_ms`, `max_cost`, `currency`, inicialmente null até acordo   |
| `retrieval`                                                   | objeto com `k` inteiro positivo, unidade/deduplicação, limite de contexto e política de truncamento; pendente até acordo                                                           |
| `design`                                                      | objeto com cenários, número de repetições, ordem explícita por caso/repetição e seed de ordenação; pares compartilham caso, revisão e índice de repetição                          |
| `permissions_ref`, `pricing`                                  | referência de autorização; objeto de tarifas com origem, data, versão, moeda e unidade ou null com motivo                                                                          |

| Cenário (enum)       | Contexto e estado inicial                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `sem_memoria`        | Tarefa e fontes de trabalho autorizadas; sem recuperação Mimir e sem histórico adicional. |
| `com_mimir`          | Mesmo contexto básico mais recuperação sobre cópia idêntica do snapshot autorizado.       |
| `historico_completo` | Mesmo contexto básico mais todo o histórico fixado; sem recuperação Mimir.                |

Modelo, parâmetros, ferramentas de trabalho e orçamento total da tarefa são iguais. Só a intervenção de contexto e a ferramenta Mimir mudam conforme cenário; chamadas Mimir contam no limite total de chamadas, com subtotais por ferramenta. Fontes acessíveis e instruções básicas são idênticas. Fixar política de cache (frio/quente), registrando cache observado e mantendo condições pareadas; não confundir cache com memória.

Criar diretório descartável e cópia/reset do snapshot antes de **cada** cenário/repetição; usar estado vazio nos baselines. Bloquear acesso ao banco pessoal/real, ao gold e a resultados de rodadas anteriores. Reset atua somente na cópia descartável, nunca apaga banco real. Registrar caminho/hash inicial e final e verificar isolamento. Persistência/feedback de uma rodada não alimentam a seguinte.

Sugestão a acordar: piloto de **3–5 casos**, com **3 repetições pareadas** por caso nos três cenários. Balancear posições por rotação `A,B,C`; `B,C,A`; `C,A,B`, onde A=sem_memoria, B=com_mimir, C=historico_completo, e fixar a ordem dos casos. Registrar seeds suportadas; indisponibilidade não implica determinismo. O piloto descreve variação, não sustenta inferência estatística forte.

Histórico completo que exceda o orçamento não é silenciosamente resumido. Registrar tokens/bytes omitidos, regra, hashes do contexto antes/depois e `truncated`; tratá-lo como estrato separado, sem comparação equivalente com histórico integral. Se não couber sem violar a definição acordada, usar `infeasible`. Falta de orçamento, limite de chamadas e estouro de tempo/custo também são registrados. Não aumentar limites só para um cenário.

Separar desenvolvimento de avaliação antes de otimizar: usar desenvolvimento para ajustar motor, prompts e parâmetros. Fixar holdout de avaliação com acesso restrito ao avaliador; não otimizar nele. Inspecionar seus resultados para ajustar exige declarar o conjunto consumido, nova versão e novo holdout para avaliação posterior.

## Resultado e evidências

Um registro por `(manifest_id, case_id, case_revision, scenario, repetition)`; `run_id` único. Todos os campos do exemplo são obrigatórios. Em execução real, referências e hashes apontam para artefatos locais preservados (contexto efetivamente enviado, respostas, ferramentas, itens recuperados ordenados, citações, tempos e uso por chamada), com acesso ao gold separado.

`status`: `not_run`, `completed`, `error`, `timeout`, `denied`, `infeasible`. `completed` pode ter sucesso zero. `truncated` boolean ou null antes de executar; `failure` objeto `{kind, message, evidence_ref}` ou null. `metrics` é mapa de nomes para `{value, unit, status}`; value número finito ou null, status `measured`, `estimated`, `sem_gold`, `N_A`, `unavailable`, `not_run`. Zero só significa medição válida de zero. `sem_gold` indica referência ausente; `N_A` indica métrica que não se aplica; null sozinho nunca explica a ausência.

`retrieved` é array ordenado ou null antes de executar: objetos com rank, source_id, unit_id, source_commit_sha, trecho/hash e evidência. `answer_ref`, `context_ref`, `trace_ref` são strings ou null. `rubric_evaluation` é objeto ou null: revisor independente, referência à rubrica versionada, notas 0/1 por item, justificativas/evidências, score e sucesso booleano; em divergência, registrar resolução humana. `usage` e `cost` são objetos ou null conforme regras abaixo. Tempos UTC ficam null antes da execução.

### Resultado sintético completo, não executado

```json
{
  "run_id": "illustration-not-run",
  "manifest_id": "illustration-pending",
  "case_id": "illustration-color",
  "case_revision": 1,
  "scenario": "com_mimir",
  "repetition": 1,
  "illustrative_only": true,
  "status": "not_run",
  "started_at": null,
  "ended_at": null,
  "truncated": null,
  "failure": null,
  "context_ref": null,
  "answer_ref": null,
  "trace_ref": null,
  "retrieved": null,
  "rubric_evaluation": null,
  "metrics": {
    "precision_at_k": { "value": null, "unit": "ratio", "status": "not_run" },
    "recall_at_k": { "value": null, "unit": "ratio", "status": "not_run" },
    "source_accuracy": { "value": null, "unit": "ratio", "status": "not_run" },
    "stale_rate": { "value": null, "unit": "ratio", "status": "not_run" },
    "retrieval_latency": { "value": null, "unit": "ms", "status": "not_run" },
    "total_latency": { "value": null, "unit": "ms", "status": "not_run" },
    "task_success": {
      "value": null,
      "unit": "boolean_0_1",
      "status": "not_run"
    }
  },
  "usage": null,
  "cost": null,
  "notes": "Formato ilustrativo; nenhuma execução ou medição ocorreu."
}
```

## Métricas, denominadores e agregação

Deduplicar por unidade canônica antes de selecionar os primeiros k, preservando primeira posição; vários chunks da mesma unidade contam uma vez. Citações também são deduplicadas por unidade. Seja R o conjunto relevante validado, Dk as até k unidades únicas recuperadas e C as unidades citadas. Não deduzir relevância por similaridade textual.

| Métrica/unidade            | Definição                                                                                                                                                                                                                                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- | --- | ------------------------------------------- |
| Precision@k, razão [0,1]   | `                                                                                                                                                                                                                                                                                                               | Dk ∩ R | / k`; menos de k retornos mantém denominador k (posições ausentes não são acertos). k positivo fixado no manifesto. |
| Recall@k, razão [0,1]      | `                                                                                                                                                                                                                                                                                                               | Dk ∩ R | /                                                                                                                   | R   | `; R ausente → `sem_gold`; R vazio → `N_A`. |
| Fonte correta, razão [0,1] | Unidades citadas que existem na revisão fixada **e sustentam a afirmação associada** / `                                                                                                                                                                                                                        | C      | `; sem citações → `N_A`na métrica e falha no item de rubrica que exija citação. Sem conferência/gold →`sem_gold`.   |
| Stale rate, razão [0,1]    | Unidades recuperadas comprovadamente obsoletas para a revisão-alvo / unidades recuperadas únicas. Rotular atual/obsoleta/desconhecida por fonte e vigência, não só idade. Se houver desconhecidas, valor null `unavailable` e contagens explícitas; denominador vazio → `N_A`. Baselines sem retrieval → `N_A`. |
| Latência retrieval, ms     | Soma dos intervalos monotônicos de chamadas retrieval, incluindo serialização/retorno; guardar também cada chamada. Baselines sem retrieval → `N_A`.                                                                                                                                                            |
| Latência total, ms         | Tempo monotônico do envio inicial da tarefa ao resultado final/terminação; inclui ferramentas, modelo e retrieval, sem somar retrieval novamente. Preparação do snapshot medida separadamente.                                                                                                                  |
| Rubrica e sucesso          | Score `Σ(peso × nota 0/1) / Σpesos`; sucesso 1 somente se todos os critérios obrigatórios forem satisfeitos; avaliação independente e evidenciada, não autoavaliação do modelo.                                                                                                                                 |
| Taxas de falha, razão      | Para cada status error/timeout/denied/infeasible: contagem / total de tentativas iniciadas ou impedidas no preflight do manifesto; publicar contagens e denominador. `not_run` ilustrativo/planejado não é tentativa.                                                                                           |

Sem R validado, Precision@k também é null `sem_gold`; nos baselines sem retrieval, Precision/Recall são `N_A`. Não preencher ausências com zero. Erros, timeouts e denials são excluídos dos ganhos, mas entram nas taxas de falha; métricas parciais disponíveis ficam identificadas, incluindo uso cobrado em falhas.

Comparações de ganho usam somente pares completos, comparáveis, com mesma revisão/caso/repetição e métrica disponível. Publicar número de pares incluídos/excluídos e razões, além das taxas sobre todas as tentativas. Sucesso agregado é sucessos / execuções completadas avaliáveis, acompanhado da cobertura sobre todas as tentativas. Reportar diferenças absolutas pareadas (com_mimir menos cada baseline), mediana, mínimo/máximo e valores por repetição; macro média por caso para retrieval, sem misturar razões de denominadores diferentes. Percentual relativo só se baseline medido >0, com fórmula `(baseline - com_mimir) / baseline × 100` para custo/tokens/tempo e denominador publicado; nenhum percentual prometido. Degradações têm o mesmo destaque que melhorias.

## Tokens e custos

`usage.calls[]` registra ID, provedor/modelo, método (`api_reported`, `tokenizer`, `byte_upper_bound`), evidência, input/output e detalhes cached/tool/context. Uso real reportado pela API tem prioridade e preserva payload original; tokenizer local é estimativa identificada por nome/versão/vocabulário e texto contado, não uso faturado. Limite superior em bytes só é usado com justificativa de limite para o tokenizer escolhido; sem garantia, rotular apenas bytes, nunca tokens reais.

Somar input e output por chamada uma única vez. Cached input é subconjunto de input, não soma adicional; separar input não cached para tarifas distintas. Tool/context são atribuições dentro do input/output observado: resposta de ferramenta vira input quando efetivamente enviada ao modelo, não nova categoria a somar. Se APIs incluírem reasoning no output, preservar relação e não duplicar. Contar prompts repetidos a cada chamada quando enviados; evitar contar contexto tanto no trace quanto no total API. Métodos divergentes ficam em séries separadas, com cobertura/chamadas sem uso explicitadas; total parcial não é total real.

`cost` registra `status`, `estimated_amount`, `currency`, `rate_source`, `rate_date`, `rate_version`, `rate_unit`, `rates`, `formula`, `usage_method`, `coverage`, `evidence_ref`. Estimativa = soma por chamada das quantidades faturáveis por categoria disjunta × tarifa por unidade, incluindo ferramentas cobradas separadamente se houver. Registrar descontos/cache e exclusões; sem tarifa ou uso adequado, amount null `unavailable`, com motivo. Custo faturado só se houver evidência independente; não igualar estimativa a cobrança. Origem/data/versão/moeda das tarifas e eventual conversão precisam ser fixadas no protocolo. Não buscar preços atuais nem escolher modelos nesta proposta.

## Decisões pendentes e critérios de saída

| Decisão                              | Proposta / pendência                                                    | Registro de aceite                             |
| ------------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------- |
| Formato, revisão e responsabilidades | v0.1 para acordo com amigo e mantenedor; revisão independente           | Pendente: pessoa, data, referência e ressalvas |
| Casos, splits e gold                 | 3–5 casos sugeridos; revisão de fontes, holdout e rubrica a definir     | Pendente                                       |
| Repetições e ordem                   | 3 pareadas sugeridas; rotação balanceada e ordem dos casos a fixar      | Pendente                                       |
| k, contexto e truncamento            | Valores numéricos e política a definir antes de executar                | Pendente                                       |
| Modelo/parâmetros/ferramentas        | Identidades, versões, seeds e cache a fixar                             | Pendente                                       |
| Limites                              | max_calls, timeout_ms, max_cost, moeda e max_output_tokens pendentes    | Pendente                                       |
| Fontes/histórico/memória             | Commits reais, hashes, corte, seleção e snapshots autorizados pendentes | Pendente                                       |
| Permissões e tarifas                 | Escopo/destinos/validade e proveniência das tarifas pendentes           | Pendente                                       |

Saída da fase contratual: decisões registradas, fontes e gold conferidos por pessoa diferente do autor, revisão Codex independente e aceite humano. Só então tarefas próprias podem implementar executor e corpus final. Correção editorial aumenta revisão documental; alteração de fonte, gold, rubrica, split, unidade ou protocolo aumenta revisão afetada, exige justificativa e novo aceite desse conteúdo. Resultados antigos preservam seus pins; não sobrescrever nem combinar versões como equivalentes. Não reaprovar execuções já autorizadas se o escopo permanecer igual.

Saída futura da medição: manifesto congelado, isolamento verificável, três cenários contabilizados inclusive inviáveis/falhas, evidências locais reproduzíveis, denominadores/cobertura e limitações publicados; outra pessoa consegue reproduzir o método a partir dos artefatos autorizados. Não exige ganho mínimo e não promete economia percentual. Integração e release permanecem sob controle do mantenedor.
