# Relatório de Revisão Independente — Task53: Métricas Offline v0.3

**Veredito**: **APPROVE**
**Revisor**: Code Reviewer Agent (Gemini 3.8 Flash High)
**Data**: 2026-10-26
**Branch de trabalho**: `feat/v03-benchmark-metrics`
**Base commit verificado**: `430d1c5` (`feat(benchmark): add offline v0.3 validation and planning`)
**Alvo da revisão**: Implementação da [Task52](file:///mnt/d/Projects/MimirNL/tasks/52-v03-offline-benchmark-metrics.md) registrada em [tasks/52-v03-offline-benchmark-metrics-result.md](file:///mnt/d/Projects/MimirNL/tasks/52-v03-offline-benchmark-metrics-result.md)
**Artefatos analisados**:
- [scripts/benchmarks/metrics.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs)
- [scripts/benchmarks/metrics-cli.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics-cli.mjs)
- [test/benchmark-metrics.test.mjs](file:///mnt/d/Projects/MimirNL/test/benchmark-metrics.test.mjs)
- [docs/benchmarks/v03/metricas.md](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/metricas.md)

---

## 1. Resumo Executivo

A implementação da Task52 atende rigorosamente a todos os requisitos autorizados e restrições de isolamento estipulados para a etapa offline do benchmark v0.3:
1. **Escopo contido e estritamente offline**: API pura sem I/O ou efeitos colaterais na importação; CLI read-only por padrão e com gravação exclusiva (`wx`, modo 0600); nenhum acesso de rede, modelos, provedores ou bancos de dados.
2. **Integridade estrita do plano**: O plano fornecido no batch é rederivado e comparado de ponta a ponta (`isDeepStrictEqual`) contra `planCases(cases, repetitions)`, impedindo adulterações em IDs, revisões, commits, repetições, cenários ou flags.
3. **Privacidade e contenção de vazamentos**: Nenhuma informação privada (caminhos de arquivo, trechos de código, gold/respostas esperadas, critérios de rubrica, notas ou referências humanas) é exposta no retorno ou nas mensagens de erro.
4. **Precisão matemática e tratamento de dados ausentes**: Deduplicação correta antes de $k$, denominador fixo $k$, distinção explícita entre zero medido e valores ausentes (`unavailable`, `N_A`, `not_run`), ausência de tratamento indevido de `unknown` como `current`, e comparações pareadas com rastreamento completo de exclusões e falhas (sem cherry-picking).
5. **Verificação nos testes focados**: Execução dos 5 testes focados no runtime Linux designado (`node v24.22.1`) concluída com 100% de aprovação (5 pass, 0 fail), além de validação de sintaxe (`--check`), estilo Prettier e conformidade de diff.

Nenhum defeito bloqueante ou risco de segurança foi identificado. O código está pronto para avanço operacional.

---

## 2. Análise Detalhada por Categoria

### 2.1 Integridade do Plano e Validação de Entrada
- **Rederivação Completa**: Em [`scripts/benchmarks/metrics.mjs:72-77`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L72-L77), `planCases(cases, batch.plan?.repetitions)` é executado e submetido a `isDeepStrictEqual(plan, batch.plan)`. Qualquer adulteração nos metadados ou na ordenação determinística das runs é rejeitada.
- **Validação de Divisão (Split)**: Garante que os casos pertençam a um único split ([`metrics.mjs:75-76`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L75-L76)), rejeitando batches heterogêneos (`development` misturado com `evaluation`).
- **Prevenção de Ambiguidade de IDs**: Rejeita fontes cujo `source_id` ou `unit_id` contenha `/` ([`metrics.mjs:79-86`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L79-L86)), impedindo parsing ambíguo de `relevant_unit_ids` (`source_id/unit_id`).
- **Validação Estrita de Estrutura (Shape)**: A função `shape(value, keys)` ([`metrics.mjs:9-18`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L9-L18)) impõe checagem exata de chaves (`Object.keys(value).length !== keys.length || keys.some(...)`). Chaves desconhecidas ou extras disparam rejeição imediata, mitigando vazamentos por injeção de campos arbitrários.

### 2.2 Fórmulas de Métricas e Denominadores
- **Precision@k**: Deduplica pares canônicos `(source_id, unit_id)` mantendo a ordem antes de selecionar $k$ unidades ([`metrics.mjs:161-167`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L161-L167)). O denominador é invariante em $k$, computando corretamente o déficit quando menos de $k$ unidades são retornadas.
- **Recall@k**: O conjunto de unidades relevantes do gold valida $R$. Quando $R$ é vazio, retorna explicitamente `metric(null, "N_A")` ([`metrics.mjs:168-170`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L168-L170)). Para cenários sem recuperação (`sem_memoria`, `historico_completo`), retorna `metric(null, "N_A")`.
- **Taxa de Stale**: Utiliza todas as unidades únicas retornadas ([`metrics.mjs:171-184`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L171-L184)). Retorna `N_A` se não houver unidades recuperadas. Qualquer presença de `stale_status === "unknown"` torna a taxa `unavailable`, proibindo estritamente a inferência de `unknown` como `current`. Se a mesma unidade aparecer com status conflitantes na mesma observação, a entrada é invalidada ([`metrics.mjs:142-143`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L142-L143)).
- **Source Accuracy**: Retorna sempre `unavailable()` ([`metrics.mjs:194`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L194)), documentando que menções a fontes não comprovam fidelidade factual.
- **Latências**: `retrieval_latency_ms` e `total_latency_ms` permanecem campos desvinculados; a latência de retrieval nunca é somada indevidamente à total ([`metrics.mjs:195-206`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L195-L206)). Latência zero ($0$) é mantida como medição válida distinta de valor nulo (`unavailable`).
- **Sucesso de Tarefa e Prova de Revisão**: `task_success` requer status `completed` e método `manual_rubric` ([`metrics.mjs:112-124`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L112-L124)), validando a presença não vazia de `evidence_ref` e `reviewer_ref` sem exportar seus identificadores.

### 2.3 Estatísticas e Comparações Pareadas
- **Cobertura por Cenário**: Registra explicitamente contagens de todos os estados (`completed`, `error`, `timeout`, `denied`, `infeasible`, `not_run`) ([`metrics.mjs:213-242`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L213-L242)). `not_run` não computa como tentativa; a taxa de falha é baseada nas tentativas reais.
- **Pareamento com_mimir vs Baselines**: Realizado dentro do plano validado por tupla `(case_id, case_revision, repetition)` ([`metrics.mjs:246-295`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L246-L295)).
- **Precedência Determinística de Exclusão**: Hierarquia estrita (`not_run` $\rightarrow$ `not_completed` $\rightarrow$ `truncated` $\rightarrow$ `unavailable`) evita ambiguidades ([`metrics.mjs:261-272`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L261-L272)).
- **Percentuais Seguros**: Variação percentual só é calculada se a baseline for estritamente positiva ($>0$) e finita ([`metrics.mjs:276-281`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs#L276-L281)). Casos com baseline zero são contabilizados em `percentage_exclusions.baseline_zero`, sem gerar divisões espúrias por zero.

### 2.4 Segurança do CLI e Isolamento
- **CLI Seguro e Read-only**: Em [`scripts/benchmarks/metrics-cli.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics-cli.mjs), a leitura é restrita a arquivos JSON fornecidos via linha de comando. O comportamento padrão emite o relatório em `stdout`.
- **Criação Exclusiva**: Com `--out`, utiliza `{ flag: "wx", mode: 0o600 }` ([`metrics-cli.mjs:34`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics-cli.mjs#L34)), recusando sobrescrever arquivos preexistentes ou links simbólicos, com permissões restritas ao usuário proprietário.
- **Mensagens de Erro Opaque / Não Vazantes**: Todas as exceções na CLI retornam mensagens pré-definidas fixas ([`metrics-cli.mjs:28, 37`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics-cli.mjs#L28-L39)), nunca refletindo caminhos locais, dados privados de input ou stack traces nativos de JSON/FS.
- **Importação Livre de Efeitos Colaterais**: O arquivo inclui a guarda `import.meta.url === pathToFileURL(process.argv[1]).href` ([`metrics-cli.mjs:47-48`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics-cli.mjs#L47-L48)), permitindo importações puras sem execução imediata.

### 2.5 Testes e Cobertura Sintética
- O arquivo [`test/benchmark-metrics.test.mjs`](file:///mnt/d/Projects/MimirNL/test/benchmark-metrics.test.mjs) implementa 5 suítes focadas que testam:
  1. Fórmulas sintéticas, deduplicação antes de $k$ e verificação contra vazamento de canários privados (`PRIVATE_`).
  2. Tratamento de `N_A`, `unknown`, `null` vs zero medido.
  3. Exclusões de pares, contagens de falhas, observações faltantes e baselines zero.
  4. Rejeição com falha opaca diante de adulterações no plano, parâmetros numéricos inválidos (`NaN`, `Infinity`, negativos) e campos desconhecidos.
  5. Comportamento do CLI (permissões `0600`, flag `wx`, segurança contra symlinks e integridade de import).

---

## 3. Verificação de Execução Independente

Execução efetuada no runtime indicado (`/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`):

1. **Testes focados**:
   ```sh
   /tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --test test/benchmark-metrics.test.mjs
   ```
   **Resultado**: `5 pass, 0 fail` (duração: 1195ms).
2. **Checagem de sintaxe Node**:
   ```sh
   /tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --check scripts/benchmarks/metrics.mjs
   /tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --check scripts/benchmarks/metrics-cli.mjs
   /tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --check test/benchmark-metrics.test.mjs
   ```
   **Resultado**: Código de saída `0` sem erros.
3. **Checagem de estilo Prettier**:
   ```sh
   PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH node node_modules/prettier/bin/prettier.cjs --check scripts/benchmarks/metrics.mjs scripts/benchmarks/metrics-cli.mjs test/benchmark-metrics.test.mjs docs/benchmarks/v03/metricas.md
   ```
   **Resultado**: `All matched files use Prettier code style!`.
4. **Git diff check**:
   ```sh
   git diff --check
   ```
   **Resultado**: Código de saída `0` sem whitespace errors.

---

## 4. Conclusão e Próximos Passos

A entrega da Task52 cumpre com precisão as especificações estabelecidas para o módulo de métricas offline da v0.3. Não há pendências técnicas ou não conformidades.

- **Veredito**: **APPROVE**
- **Avisos contextuais mantidos**: A aprovação deste módulo não implica aprovação de corpus real, manifesto congelado, proposta de contrato de benchmark ou execução de modelos. Tais etapas permanecem formalmente pendentes.
- **Relatório submetido ao supervisor**: Notificação de conclusão enviada via callback ao terminal `dbfe79b6`.
