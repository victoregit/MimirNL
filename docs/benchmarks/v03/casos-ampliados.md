# Corpus ampliado v0.3 — proposta revisão 1

Estado: seis casos development novos, não executados, revisão Task84 pendente. O [JSON estrito](corpus-ampliado.json) segue o [contrato 0.1](contrato.md); os [três casos originais](casos.md) permanecem intactos, total proposto nove. Não altera contrato, [preflight](preflight.md) ou [métricas](metricas.md), nem aceita corpus/gold. [Task82](../../../tasks/82-v03-two-host-closeout.md) encerrou uma pergunta exploratória por host; seus resultados não validam estes casos.

## Pin e fronteira do avaliador

Única autoridade de todas as fontes: objeto Git `166e3cf047b2078952e43dc8e9171e053e99e2ce`. Paths JSON são relativos à raiz; os links abaixo abrem arquivos correntes e não substituem o pin. Intervalos inclusivos e SHA-256 referem-se aos bytes UTF-8 exatos, incluindo quebra final original, sem normalização. Cada source_id identifica uma única unidade behavior; a mesma unidade mantém trecho/hash em todos os casos. Há 13 unidades distintas nos seis novos casos; com as três originais, 13 trechos distintos (optimizer e learning reutilizam trechos originais, failure também).

O JSON e este guia são materiais locais do avaliador: respostas, relevância e rubricas nunca entram em prompt, seed, memória ou histórico. A fronteira privada é de uso, não ACL, sigilo ou holdout. Todas as fontes foram inspecionadas pelo autor; não há conjunto evaluation. Não exportar a modelos nesta tarefa. Todas as revisões/gold permanecem pending, referências humanas e permissões null. Abstenções têm gabarito proposto conhecido, ainda não validado; não são sem_gold.

## Protocolo operacional proposto

Consultas abaixo são fixadas antes de qualquer busca; não foram testadas nem escolhidas por resultado. Termos ingleses e nomes de símbolos são aproximações lexicais explícitas das perguntas portuguesas, sem incorporar respostas preparadas. Não refinar consultas após observar resultados. Não há expected_empty_query.

Para cada caso, o pool permitido é exatamente sources[] daquele caso, na ordem JSON. allowed_source_ids contém o pool inteiro; nada extra pode entrar em B. Baseline A recebe o pool completo; B recebe somente retornos reais da busca no mesmo pool, sem oracle, complemento das unidades relevantes, pós-filtro por gold ou repetição do pool completo. Comparação full-pool/seleção inspirada no fluxo da Task82 requer manifesto próprio; não substitui silenciosamente os três cenários do contrato. Se estes forem usados, os baselines devem ter as mesmas fontes autorizadas, com histórico vazio explícito, sem conversa/padding inventados.

Proposta comum fixa: k=4 unidades canônicas deduplicadas, limit=4, tokenBudget=32000 (limite em bytes do motor, não tokens reais), contexto de fontes até 32000 bytes UTF-8 serializados com proveniência/envelope, saída até 120 palavras em ambos os braços. Orçamento total real de tokens/modelo permanece pendente de manifesto. Se baseline completo exceder seu teto após serialização, registrar infeasible; não resumir silenciosamente. Congelar serializador, ordem e hashes antes de executar; não aumentar teto de um braço. Sem resultados coletados aqui.

Ranking atual é lexical: até 40 palavras, OR, BM25, desempate por escopo de projeto e id, sem garantia de reunir múltiplas fontes. limit anterior ao optimize pode excluir evidência necessária; orçamento também pode omitir unidades. Esse limite é parte do que o corpus permite avaliar, não foi corrigido. Retorno lexical em negativo pode ser falso positivo e limitação legítima, deve permanecer registrado; não se promete fallback de relevância.

## Matriz e consultas fixas

| Caso                            | Categoria                            | Consulta retrieval proposta                                                                 | Pool permitido (IDs)                                           | R proposto                                                                               |
| ------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| expanded-budget-envelope        | Síntese schema/serviço/estimador     | `memory_search tokenBudget schema optimize estimateTokens envelope`                         | search-schema, optimizer, search-service, stats-service        | search-schema/behavior, optimizer/behavior, search-service/behavior                      |
| expanded-sharing-eligibility    | Síntese aprovação/promoção/busca     | `approve promote explicitApproval sharingApproval includeGlobal status scope memory_search` | feedback-service, learning, retriever, search-schema, failure  | feedback-service/behavior, learning/behavior, retriever/behavior, search-schema/behavior |
| expanded-project-path-boundary  | Síntese projeto/ingestão/path        | `project_register GitAdapter root realpath inside symlink projectId includeGlobal`          | register-service, ingest-path, retriever, embedding-interface  | register-service/behavior, ingest-path/behavior, retriever/behavior                      |
| expanded-production-p95-absent  | Abstenção: medida ausente            | `memory_search p95 latency elapsed_ms production 2026 10 01 2026 10 07`                     | search-service, stats-service, retriever, optimizer            | ∅                                                                                        |
| expanded-runtime-config-absent  | Abstenção: runtime ausente           | `Alfa provider model tokenizer tariff tokenBudget EmbeddingProvider`                        | embedding-interface, optimizer, search-schema, package-version | ∅                                                                                        |
| expanded-apparent-version-scope | Conflito aparente: escopos distintos | `README Core v0.1 package version 0.2.0 release published`                                  | readme-status, package-version, embedding-interface            | readme-status/behavior, package-version/behavior                                         |

Os elementos do pool fora de R são distratores reais e únicos: stats-service no orçamento; failure em compartilhamento; embedding-interface no isolamento e no contraste de versões. Nos dois negativos, todo o pool é distrator para a informação pedida: temporização/AVG/FTS/estimador não são p95 observado, e interface/schema/metadata/estimador não descrevem a instalação Alfa. Não se afirma ausência global no repositório ou no mundo, apenas insuficiência destes pools integralmente inspecionados.

## Catálogo canônico

| Unidade                      | Fonte relativa                                                          | Intervalo inclusivo | SHA-256                                                            |
| ---------------------------- | ----------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------ |
| search-schema/behavior       | [src/core/schemas.ts](../../../src/core/schemas.ts)                     | 59–74               | `30f540e8300f3762a86ec5b961a0c8a1501b9c6c1d38b6b2411d2f89b52e6786` |
| optimizer/behavior           | [src/optimization/index.ts](../../../src/optimization/index.ts)         | 1–27                | `832cf164215cededa94fff24284dd80d5f3ee1351a9dd2dfee2177658c8b9473` |
| search-service/behavior      | [src/core/service.ts](../../../src/core/service.ts)                     | 356–394             | `15f107ff1abb5210c6afb210aad659974f95cab7a0fcd1ac3b1783f181be2a49` |
| stats-service/behavior       | [src/core/service.ts](../../../src/core/service.ts)                     | 395–407             | `45564d69d0b9d177af3539cd34b711f6d6c819fcedb7afa6bcb4ff96211e4afb` |
| feedback-service/behavior    | [src/core/service.ts](../../../src/core/service.ts)                     | 428–505             | `14b95054800d87ff843947a11986a18c33e00cb049a01807aef0f4af8b7ea3e3` |
| learning/behavior            | [src/learning/index.ts](../../../src/learning/index.ts)                 | 1–16                | `8840236feff029bc02280abe8b080d559858d182ca60ae7ccbab6573f138a43b` |
| retriever/behavior           | [src/retrieval/index.ts](../../../src/retrieval/index.ts)               | 18–41               | `6ab7216ddd810c8008447b0df63c8cacc894b6e353e324e1e68925b1c5654e8e` |
| failure/behavior             | [src/security/index.ts](../../../src/security/index.ts)                 | 68–96               | `41f76d3fbcd5661fffb63517a5694d78e3e681e9880e243680c6b8666feae2aa` |
| register-service/behavior    | [src/core/service.ts](../../../src/core/service.ts)                     | 160–185             | `df41220bd3bd3604272b052f38771731a617d17283bc5e094831dc87f60632fb` |
| ingest-path/behavior         | [src/ingestion/adapters/git.ts](../../../src/ingestion/adapters/git.ts) | 216–238             | `be4fa954be10492613387f7143c17c4338a704dbe5b682ed55576fc2fa39bec7` |
| embedding-interface/behavior | [src/retrieval/index.ts](../../../src/retrieval/index.ts)               | 14–17               | `08bd7dc9fdd8bc43c5485260108201a5d9b45916605c0abc410d9cc41bccb3a9` |
| package-version/behavior     | [package.json](../../../package.json)                                   | 1–9                 | `73fb2a44c8d46e72da56e67b8cdd29ab209ff1ea2d372116d8a7ebaa6e0edad4` |
| readme-status/behavior       | [README.md](../../../README.md)                                         | 1–7                 | `1c3e5099072ad8e3f5ff83a1869ee56656196428601da65eaa8bfa8ef2f6c6d9` |

## Rubricas e interpretação

Cada item JSON recebe nota binária 0/1; primeiro item peso 2, demais peso 1. Score = soma(nota × peso)/soma(pesos); sucesso somente score=1, todos os itens satisfeitos. Pesos e critérios estão fixados antes de observações. Positivos exigem todas as unidades em R sustentando a síntese, além de correção factual; IDs existentes sozinhos não validam citações. Negativos exigem abstenção útil e ausência de número/fato/citação fabricados. Uma citação opcional do código pode explicar seus limites, nunca comprovar a medida/configuração ausente. Resposta vazia ou retrieval vazio não é sucesso automático.

Com R=∅, Precision@4=0 para recuperação observada, inclusive array vazio pelo denominador fixo; Recall@4=N_A. Gold pendente bloqueia métricas reais até revisão/aceite. Retrieval ausente por não execução é not_run, falha de coleta é unavailable, nunca zero inventado. Source accuracy sem citação é N_A; deve haver avaliação humana da abstenção pela rubrica. Adaptador atual não avalia afirmações/citações ou sucesso automaticamente, nem agrega retrieval macro/micro.

O caso de versão trata conflito aparente entre escopos, não stale real: o próprio README declara candidate/unreleased. Teste de stale real continua pendente. Histórico de outro commit exigiria extensão versionada separada: schema atual só permite um commit por caso; não misturar trechos históricos sob source.commit_sha único.

## Revisão e bloqueios

Task84 deve conferir de forma independente todos os intervalos/hashes/excerpts via git show, necessidades de síntese, completude de R, insuficiência dos pools negativos, consultas/distratores e critérios binários. Autor não altera pending para accepted/validated. Aceite humano, permissões, manifesto, executor multicaso e orçamento real permanecem necessários antes de execução. Os runners de seis posições e uma pergunta não suportam automaticamente estes seis casos; adaptação requer tarefa e revisão separadas, sem chamadas agora.

Validação estrutural não comprova correspondência ao Git ou qualidade de gold; a conferência de bytes é independente. Checks e entrega estão no [resultado Task83](../../../tasks/83-v03-expanded-corpus-result.md). Não há previsão de execução ou ganho.
