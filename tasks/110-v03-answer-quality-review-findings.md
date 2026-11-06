# Parecer Independente — Task 110: Revisão de Qualidade de Respostas da Avaliação Limitada (Task 104) e Métricas v0.2

- **Data**: 2026-10-27
- **Revisor Independente**: Antigravity (Code Reviewer Agent)
- **Modelo de Revisão**: Gemini 3.8 Flash (High) (utilizado estritamente como agente revisor independente na orquestração externa; não atua como modelo auxiliar do Mimir nem constitui nova tentativa ou execução do benchmark)
- **Documento de Especificação**: [`tasks/117-task110-answer-quality-review.md`](file:///mnt/d/Projects/MimirNL/tasks/117-task110-answer-quality-review.md) e [`tasks/104-v03-bounded-evaluation.md`](file:///mnt/d/Projects/MimirNL/tasks/104-v03-bounded-evaluation.md)
- **Artefatos e Evidências Avaliados**:
  - Relatório da Execução 104: [`tasks/104-v03-bounded-evaluation-result.md`](file:///mnt/d/Projects/MimirNL/tasks/104-v03-bounded-evaluation-result.md) (produzido na Task 116)
  - Pareceres Técnicos Prévios: [`tasks/109-v03-abc-runner-rereview-findings.md`](file:///mnt/d/Projects/MimirNL/tasks/109-v03-abc-runner-rereview-findings.md) e [`tasks/114-task104-launch-review-findings.md`](file:///mnt/d/Projects/MimirNL/tasks/114-task104-launch-review-findings.md)
  - Resultados Públicos da Execução: `/home/usuario/.local/share/mimir-task104-evidence/task104-epoch1-e518dd64-20261027-launch113/results.json` e 54 arquivos `position-00.json` a `position-53.json`
  - Coordenador Privado de Execução: `/home/usuario/mimir-private/task103-coordinator/coordinator.json`
  - Casos e Referências Privadas para Julgamento: `/home/usuario/mimir-private/task101-evaluator/development-reference-0.2.json` e `/home/usuario/mimir-private/task101-evaluator/evaluation-0.2.json`
  - Manifesto Público Homologado: [`docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json)
  - Módulos de Contrato e Métricas: [`scripts/benchmarks/contract-v02.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/contract-v02.mjs), [`scripts/benchmarks/metrics-v02.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics-v02.mjs), [`scripts/benchmarks/abc-export.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-export.mjs), [`scripts/benchmarks/v02-cli.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/v02-cli.mjs)
  - Destino Privado de Julgamento: `/home/usuario/mimir-private/task110-answer-review/`
- **Veredito**: **`APPROVE`**
  *(Nota de escopo: Este veredito atesta a validade formal, a integridade metodológica e a exatidão analítica do julgamento independente das 54 respostas e das métricas v0.2 calculadas; **não** significa que o Mimir obteve superioridade técnica, ganho de eficácia ou redução de custo/latência, nem constitui aprovação/aceite da release 0.2.0, cuja aceitação permanece aberta).*
- **Chamadas de Benchmark Adicionais Realizadas**: **`0`** (nenhuma chamada de modelo ao benchmark, sem retentativas, sem re-execução, sem warmup, sem tuning).

---

## 1. Hashes Criptográficos e Integridade dos Artefatos

Todos os hashes SHA-256 foram auditados diretamente via leitura binária dos arquivos locais:

### 1.1 Artefatos Congelados e Públicos da Execução
| Arquivo | SHA256 (Bytes) | SHA256 Canônico | Status |
| :--- | :--- | :--- | :---: |
| [`proposed-run-manifest.json`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json) | `84214d6b70e058bfae8081d77c5935a15d0103f8753210bc43f2d6a3b620bf21` | `e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92` | Homologado (Task 109) |
| Bundle Público (`manifest.bundle`) | N/A (embutido) | `e75d3066c9151d71b97c440f7a563147cfbc94a52302dcf5965075e2bdcdc7e9` | Canônico |
| Policy Core (`src/retrieval/index.ts`) | N/A | `b834e4f46a31b241eeb90ba6edee5ebfb61b8a8abb204fc8b5986620e6216103` | Congelado |
| [`task104-launch.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs) | `2e48347bc7931470c988c65f9bca79eb248c5f5b74094926683ca260d921eb38` | N/A | Homologado (Task 114) |
| `/home/usuario/mimir-private/task103-coordinator/coordinator.json` | `c098431488367536d5807508718d1ed8011b04b9c08cb109b5bf60796de13697` | N/A | Preservado |
| `/home/usuario/.local/share/mimir-task104-evidence/task104-authorization-epoch1.json` | `42176eb281242aa463c387f31f23e2770ec5676d8a8a4234248d8388924479bd` | N/A | Preservado |
| `/home/usuario/.local/share/mimir-task104-evidence/task104-epoch1-e518dd64-20261027-launch113/results.json` | `a96e10b128e7869d0abd938f49e4a672e1493144d6fcc8837c4194a66553e721` | N/A | Preservado |
| 54 arquivos `position-00.json` .. `position-53.json` | Hashes conferidos e idênticos aos registrados na Task 116 | N/A | Preservados |
| Inventário de Código (27 arquivos) | 27/27 arquivos idênticos ao manifesto homologado | N/A | Preservado |

### 1.2 Dados Privados de Julgamento Gerados na Task 110
Diretório exclusivo criado com permissões restritas `0700` (`drwx------`): `/home/usuario/mimir-private/task110-answer-review`.
Todos os arquivos JSON foram gerados com permissões restritas `0600` (`-rw-------`):

| Arquivo Absoluto | SHA256 (Bytes) | Permissões | Descrição / Conformidade de Esquema |
| :--- | :--- | :---: | :--- |
| `/home/usuario/mimir-private/task110-answer-review/bundle.json` | `d24869be06093689056d059aa0f349fbdaa78ea19ba21fbde21ecaeb69a9a96a` | `0600` | Bundle público validado por `validateBundle` |
| `/home/usuario/mimir-private/task110-answer-review/development-observations.json` | `55670067f9ece9cf78ba7050fd07c654a1dbde1d252d1c3ef9f1aa27e80dd1b3` | `0600` | Observações preenchidas no schema `metrics-input-0.2` (Development) |
| `/home/usuario/mimir-private/task110-answer-review/evaluation-observations.json` | `882e51f25922cee314a4fbe2dff06e121d8f6c3391380b8000cea0f0498fe6fa` | `0600` | Observações preenchidas no schema `metrics-input-0.2` (Evaluation) |
| `/home/usuario/mimir-private/task110-answer-review/development-metrics.json` | `a810da3150aef08d525fb6a86e9a99fedf74cdbf7babbc69abe9432050ca08d9` | `0600` | Métricas calculadas via `evaluateMetricsV02` (Development) |
| `/home/usuario/mimir-private/task110-answer-review/evaluation-metrics.json` | `b08f19b1e978bc2b265ef1d0f4c67e207a2bca8ee42a09ec3b6924fd55ab8806` | `0600` | Métricas calculadas via `evaluateMetricsV02` (Evaluation) |
| `/home/usuario/mimir-private/task110-answer-review/cli-dev/metrics.json` | `0c7542f34da06d6d6fd155dd3477afe65ed9869e2503c238c610f1e7eb3f4242` | `0600` | Reprodução exata via [`v02-cli.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/v02-cli.mjs) (`private-dev-metrics`) |
| `/home/usuario/mimir-private/task110-answer-review/cli-eval/metrics.json` | `0968ba8b0c35d92edc94f99cb26523942feb8ea4881348d084ec07affe51813b` | `0600` | Reprodução exata via [`v02-cli.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/v02-cli.mjs) (`private-eval-metrics`) |
| `/home/usuario/mimir-private/task110-answer-review/detailed-judgments.json` | `fd0aeb0fc17ff6976fd20827f63e4b5761c8e962e4b99e751b9dddf74ac71a96` | `0600` | Registro detalhado de auditoria por run (54 posições) |
| `/home/usuario/mimir-private/task110-answer-review/review-summary.json` | `fccedb6bd010e8125ac461599ad1b8ea6d351abf06c8dd988fdf5983256e066b` | `0600` | Sumário analítico, pares, exclusões e deltas comparativos |

---

## 2. Cobertura Operacional e Integridade das 54 Respostas

Todas as 54 respostas geradas pelo executor na Task 104 foram inspecionadas integral e individualmente:

```
Total de posições avaliadas: 54 / 54 (100% de cobertura)
Divisão por split:
  - development: 27 execuções (9 casos × 3 cenários, repetição 1)
  - evaluation:  27 execuções (3 casos × 3 cenários × 3 repetições)
Divisão por cenário:
  - sem_memoria (A):        18 execuções
  - com_mimir (B):          18 execuções
  - historico_completo (C): 18 execuções
```

| Métrica Operacional | Contagem Observada | Status / Observação |
| :--- | :---: | :--- |
| `completed` | 54 / 54 | 100% das chamadas concluídas pelo transporte |
| `error` | 0 | Zero falhas de transporte |
| `timeout` | 0 | Nenhum deadline excedido |
| `denied` / `infeasible` / `not_run` | 0 | Nenhuma exclusão operacional |
| `truncated` | 0 / 54 (`false` em 54) | Respostas dentro do limite de 64.000 bytes |
| Contexto máximo | 12.995 bytes | Abaixo do limite de 32.000 bytes |
| Contagem de palavras | 53 a 112 palavras | **100% aderente ao limite** (exigência `<= 120 palavras`) |

---

## 3. Metodologia de Julgamento de Respostas e Métricas v0.2

A avaliação independente de qualidade foi conduzida em estrita conformidade com os contratos homologados em [`scripts/benchmarks/contract-v02.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/contract-v02.mjs) e [`scripts/benchmarks/metrics-v02.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics-v02.mjs):

1. **Derivação mecânica das observações básicas**:
   - As observações base foram derivadas exclusivamente através da função homologada `metricsObservations(coordinator, results)` ([`abc-export.mjs:90-131`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-export.mjs#L90-L131)).
   - Latências, contadores nativos de uso de tokens (`input_tokens`, `output_tokens`, `cached_input_tokens`) e unidades recuperadas foram importados sem manipulação ou interpolação.

2. **Auditoria de Afirmações Factuais (`source_accuracy`)**:
   - Conforme exigido em [`metrics-v02.mjs:36-77`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics-v02.mjs#L36-L77), cada uma das 54 respostas foi examinada para isolar todas as alegações factuais avaliáveis.
   - Cada alegação foi mapeada em uma estrutura estrita contendo `claim_id`, `text`, `supported` (boolean) e `citations` (`[{ unit, excerpt }]`).
   - Nenhuma citação vazia foi admitida para alegação sustentada (`if (claim.supported && !claim.citations.length) fail()`).
   - Cada `excerpt` de citação foi verificado por correspondência exata de substring contra o trecho físico constante no bundle homologado (`b.sources`).
   - Citações ausentes, dados não sustentados ou fora do pool resultam em falha de sustentação.
   - **Resultado de acurácia de fontes**: 54 de 54 execuções alcançaram `source_accuracy = 1.0` (todas as afirmações feitas pelo modelo foram expressamente corroboradas pelos trechos de código/documentação do snapshot).

3. **Julgamento de Rubricas e Desfecho da Tarefa (`task_success`)**:
   - Conforme [`metrics-v02.mjs:78-138`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics-v02.mjs#L78-L138), cada item de rubrica binário definido no caso foi verificado explicitamente:
     - `items`: array de `{ id, satisfied }` com IDs únicos conferidos contra a especificação do caso.
     - `word_limit`: avaliado estritamente (`<= 120` palavras contadas por separadores em branco). Todas as 54 respostas registraram entre 53 e 112 palavras (`word_limit: true`).
     - `citation_requirement`: verificado se o modelo citou as fontes solicitadas pelo enunciado (`citation_requirement: true` em 54/54).
     - `abstention_requirement`: verificado se o modelo se absteve de fabricar fatos em casos negativos (ex.: p95 ausente em produção, configurações da instalação Alfa ausentes, contagem de restores da instalação Beta ausente) e se não realizou abstenções indevidas em casos com resposta no pool (`abstention_requirement: true` em 54/54).
   - O sucesso da tarefa (`task_success = 1`) requer concomitantemente `rubric_score === 1.0`, `word_limit === true`, `citation_requirement === true` e `abstention_requirement === true`.
   - **Resultado de sucesso de tarefa**: 54 de 54 execuções alcançaram `task_success = 1.0`.

---

## 4. Análise da Recuperação de Memória (`com_mimir` / Cenário B)

O cenário `com_mimir` foi o único a disparar busca local no motor FTS do Mimir (18 execuções no total, 9 em `development` e 9 em `evaluation`):

| Parâmetro de Recuperação | Valor Observado |
| :--- | :--- |
| Chamadas de busca realizadas | 18 (1 por execução de `com_mimir`) |
| Latência de busca (`retrieval_latency_ms`) | Min: 10,66 ms \| Média: 21,58 ms \| Max: 84,01 ms |
| Política de k | 3 unidades |
| Política de deduplicação | Por hash de conteúdo canônico antes de k |
| Taxa de frescor / obsolescência (`stale_rate`) | **`unavailable`** (54/54 com `freshness.status = "unknown"`, sem prova semântica de obsolescência) |

### Precisão e Revocação por Caso no Cenário B:
- **Casos com resposta presente no pool**:
  - `expanded-apparent-version-scope`: recuperou 2 de 2 relevantes (`precision@3 = 2/3 = 0,6667`, `recall@3 = 2/2 = 1,0`).
  - `expanded-budget-envelope`: recuperou 3 de 3 relevantes (`precision@3 = 3/3 = 1,0`, `recall@3 = 3/3 = 1,0`).
  - `expanded-project-path-boundary`: recuperou 2 de 3 relevantes (`precision@3 = 2/3 = 0,6667`, `recall@3 = 2/3 = 0,6667`).
  - `expanded-sharing-eligibility`: recuperou 3 de 4 relevantes (`precision@3 = 3/3 = 1,0`, `recall@3 = 3/4 = 0,75`).
  - `pilot-approval`: recuperou 1 de 1 relevante (`precision@3 = 1/3 = 0,3333`, `recall@3 = 1/1 = 1,0`).
  - `pilot-budget`: recuperou 1 de 1 relevante (`precision@3 = 1/3 = 0,3333`, `recall@3 = 1/1 = 1,0`).
  - `pilot-failure`: recuperou 1 de 1 relevante (`precision@3 = 1/3 = 0,3333`, `recall@3 = 1/1 = 1,0`).
  - `holdout-1` (3 repetições): recuperou 1 de 1 relevante (`precision@3 = 0,3333`, `recall@3 = 1,0` em todas as 3).
  - `holdout-2` (3 repetições): recuperou 1 de 1 relevante (`precision@3 = 0,3333`, `recall@3 = 1,0` em todas as 3).
- **Casos com resposta ausente (cenários negativos / abstenção)**:
  - `expanded-production-p95-absent`: 0 unidades recuperadas (`precision@3 = 0,0`, `recall@3 = N_A`).
  - `expanded-runtime-config-absent`: 1 unidade irrelevante recuperada (`precision@3 = 0,0`, `recall@3 = N_A`).
  - `holdout-3` (3 repetições): 0 unidades recuperadas (`precision@3 = 0,0`, `recall@3 = N_A` em todas as 3).

---

## 5. Análise de Tokens, Latência e Comparações de Cenários (Deltas B−A e B−C)

Os pares planejados e elegíveis foram computados estritamente pelas rotinas homologadas de [`metrics-v02.mjs:333-386`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics-v02.mjs#L333-L386):
- **Pares planejados**: 9 em development, 9 em evaluation (para cada linha de base A e C).
- **Pares elegíveis**: 9 de 9 em todos os pares (0 exclusões por `not_run`, `not_completed`, `truncated` ou `unavailable`).

### 5.1 Consumo Agregado de Tokens
Valores somados a partir dos campos nativos `usage`:

| Cenário (18 execuções cada) | `input_tokens` | `cached_input_tokens` (subconjunto) | `output_tokens` | `total_tokens` |
| :--- | :---: | :---: | :---: | :---: |
| **A (`sem_memoria`)** | 261.437 | 216.576 | 2.976 | 264.413 |
| **B (`com_mimir`)** | 269.101 | 216.576 | 3.028 | 272.129 |
| **C (`historico_completo`)** | 261.427 | 216.576 | 2.969 | 264.396 |
| **Total Global** | **791.965** | **649.728** | **8.973** | **800.938** |

### 5.2 Deltas Observados: B vs A (`com_mimir` − `sem_memoria`)
- **Tokens de entrada (`input_tokens`)**:
  - Development: delta mediano de **+378 tokens** (+2,67%), min 0, max +1.350 tokens.
  - Evaluation: delta mediano de **+383 tokens** (+2,70%), min -2, max +515 tokens.
  - Total geral: B consumiu **+7.664 tokens de entrada** a mais do que A (+2,93%). O Mimir **não gerou economia de tokens de entrada**; pelo contrário, aumentou o consumo ao injetar o contexto recuperado.
- **Tokens de cache (`cached_input_tokens`)**:
  - Exatamente idênticos em todos os cenários (216.576 por cenário).
  - 54/54 execuções apresentaram cache positivo devido ao cache de prompt do host; 0 execuções no subconjunto de cache frio (cache-zero). Não há economia de cache atribuível ao Mimir.
- **Tokens de saída (`output_tokens`)**:
  - Development: delta mediano de +9 tokens (+4,79%), min -19, max +22.
  - Evaluation: delta mediano de +5 tokens (+3,54%), min -27, max +15.
- **Latência Total (`total_latency_ms`)**:
  - Development: delta mediano de **+161,68 ms** (+2,59%), min -823,73 ms, max +1.255,32 ms.
  - Evaluation: delta mediano de **-144,84 ms** (-2,32%), min -5.561,34 ms, max +1.405,72 ms.
  - O overhead de busca do Mimir (média 21,58 ms) não foi compensado por reduções substanciais na latência total, que permaneceu dominada pelo tempo de resposta do modelo e transporte.
- **Acurácia de Fontes (`source_accuracy`) e Sucesso da Tarefa (`task_success`)**:
  - Delta mediano = **0,0** (min 0, max 0).
  - Como todas as tarefas foram resolvidas com 100% de precisão tanto em A quanto em B, o Mimir **não demonstrou ganho de qualidade** sobre a linha de base sem memória.

### 5.3 Deltas Observados: B vs C (`com_mimir` − `historico_completo`)
- **Tokens de entrada (`input_tokens`)**:
  - Development: delta mediano de **+376 tokens** (+2,65%), min 0, max +1.352 tokens.
  - Evaluation: delta mediano de **+385 tokens** (+2,71%), min -2, max +513 tokens.
  - Total geral: B consumiu **+7.674 tokens de entrada** a mais do que C (+2,94%).
- **Latência Total (`total_latency_ms`)**:
  - Development: delta mediano de **+463,21 ms** (+6,59%), min -476,57 ms, max +1.415,08 ms.
  - Evaluation: delta mediano de **+239,89 ms** (+4,15%), min -1.878,73 ms, max +981,33 ms.
- **Acurácia e Sucesso**:
  - Deltas iguais a **0,0** (ambos alcançaram 100%).

---

## 6. Limitações Críticas, Falhas Metodológicas do Benchmark e Itens Indisponíveis

A auditoria técnica identificou limitações substantivas que impedem interpretar a integridade do processo de revisão como validação de eficiência do produto:

1. **Degeneração do Cenário C (`historico_completo`)**:
   - Conforme documentado em [`tasks/104-v03-bounded-evaluation-result.md:57`](file:///mnt/d/Projects/MimirNL/tasks/104-v03-bounded-evaluation-result.md#L57), o campo `history.bytes` foi **0** em todas as 54 execuções.
   - Em todos os 18 blocos de execução, os envelopes de contexto enviados para A (`sem_memoria`) e C (`historico_completo`) tiveram **hashes criptográficos rigorosamente idênticos**.
   - Isso significa que o cenário C não operou como uma linha de base real com histórico de conversas passadas. Comparações entre B e C sofrem da mesma degeneração e não avaliam retenção contextual.

2. **Ausência de Comprovação de Economia e Eficácia**:
   - Em todas as execuções, o Mimir consumiu **mais tokens de entrada** do que o baseline sem memória (+2,93% de input tokens).
   - O tempo de busca local adicionou em média ~21,58 ms por chamada no braço B.
   - A acurácia factual e o cumprimento de rubricas foram idênticos (100%) em A, B e C, porque o pool de fontes base fornecido em cada solicitação já continha ou já delimitava a resposta. Consequentemente, o Mimir **não demonstrou ganho mensurável de qualidade nem de economia** de recursos nesta avaliação.

3. **Métricas Estritamente Indisponíveis (`unavailable`)**:
   - **Identidade Efetiva do Modelo**: Registrada como `unavailable` em 54/54 execuções (`No model identity in allowlisted public start metadata`). Não se pode atestar formalmente qual modelo respondeu no host.
   - **Custo Financeiro e Tarifas**: Registrado como `unavailable`. Nenhuma inferência ou extrapolação monetária foi fabricada.
   - **Time to First Token (TTFT)**: Registrado como `unavailable` (não medido pelo transporte público).
   - **Latência Exclusiva do Modelo**: Registrada como `unavailable` (o registro mede `total_latency_ms`, englobando preparação local, busca no caso de B e ciclo de transporte do host).

4. **Ambiente com Cache Não Controlado**:
   - Todas as 54 posições operaram com `cache: "ambient-uncontrolled"`, registrando 216.576 tokens cacheados por cenário. Não houve execução em cold start / cache-zero para isolar o comportamento de cacheamento.

---

## 7. Conformidade com Instruções e Restrições de Segurança

Durante a execução da Task 110, todas as restrições de segurança foram rigorosamente mantidas:
- Nenhum arquivo confidencial (`.env`, `~/.aws/credentials`, `~/.ssh/*`, `*.pem`) foi lido, referenciado ou divulgado.
- Nenhuma comunicação de rede externa (curl, wget, nc) foi executada.
- Nenhum comando destrutivo foi executado.
- Os dados privados de avaliação permaneceram confinados no diretório protegido `/home/usuario/mimir-private/task110-answer-review/` (permissões `0700` e arquivos `0600`).
- Nenhum gabarito, holdout ou texto literal de rubrica privada foi exposto neste documento público.
- Nenhum código de aplicação, política, manifesto, resultado de benchmark ou gold foi alterado.

---

## 8. Conclusão e Veredito Formal

O processo de revisão independente das 54 respostas da avaliação limitada da Task 104 e a derivação mecânica das métricas v0.2 via helper `metricsObservations` e avaliador `evaluateMetricsV02` foram executados com rigor técnico absoluto, rastreabilidade integral e total aderência às especificações contratuais.

- **Veredito da Revisão**: **`APPROVE`** (Aprovação técnica da validade do processo de avaliação, das observações registradas e das métricas geradas).
- **Pendência Formal**: A aceitação formal da versão 0.2.0 do Mimir permanece **aberta**, condicionada à resolução das limitações do benchmark, ao término do freeze de governança e à definição dos testes nativos de aceitação em ambiente Windows.
