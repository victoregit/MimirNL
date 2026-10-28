# Task134 — Parecer de Avaliação de Qualidade e Métricas do Piloto Real EF03

- **Data**: 2026-10-28
- **Revisor**: `reviewer-task132-antigravity` (antigravity_cli, gemini-3.8-flash-high, sem delegação)
- **Origem dos Dados**: Execução live única coordenada pelo supervisor (Task 133) após aprovação Review 132
- **Veredito da Avaliação**: **APPROVE** (validação de integridade, qualidade factual e relato métrico)
- **Novas Chamadas a Modelos / Execuções**: **0** (avaliação 100% offline pós-execução)

---

## 1. Sumário Executivo e Veredito

O piloto real EF03 foi executado uma única vez pelo supervisor com autorização externa estrita (`authorization-epoch1.json`), consumindo o token exclusivo `epoch1-consumed.json` e completando as 4 chamadas sequenciais com código de saída 0, sem retries, sem ferramentas indevidas e sem extrapolação de orçamento.

A análise independente das 4 respostas geradas frente às fontes públicas DEV1 e DEV3 e aos critérios de qualidade pré-fixados em [`tasks/131-ef03-pilot/quality.json`](file:///mnt/d/Projects/MimirNL/tasks/131-ef03-pilot/quality.json) concluiu:

1. **Gate de Qualidade APROVADO (Zero Perda Factual)**: A condição `exact-v1` preservou integralmente a precisão factual, citações e cobertura de aspectos requeridos em relação à condição baseline `preserve`. Ambas as respostas para DEV1 e DEV3 sustentam todas as afirmações nas fontes fornecidas, respeitam os limites dos trechos (sem alucinações ou conclusões abusivas de publicação) e cumprem o teto de 120 palavras.
2. **Eficácia de Deduplicação Comprovada no Uncached Input**:
   - **DEV1**: Redução de **38,77%** em bytes do prompt (-1.576 B) e redução de **16,65%** nos tokens de entrada não cacheados (-481 tokens; -3,22% no input total).
   - **DEV3**: Redução de **42,93%** em bytes do prompt (-3.517 B) e redução de **25,59%** nos tokens de entrada não cacheados (-1.043 tokens; -6,48% no input total).
   - **Agregado dos Pares**: Redução de **41,55%** em bytes de prompt (-5.093 B) e redução de **21,88%** em tokens de entrada não cacheados (-1.524 tokens; -4,91% no input total e -4,80% no total de tokens).
3. **Observabilidade de Cache e Latência**:
   - Todas as 4 chamadas registraram exatamente 12.032 tokens cacheados (piso de contexto interno do host Codex). Toda a economia de deduplicação recaiu diretamente sobre o segmento dinâmico (uncached).
   - Conforme previsto nas diretrizes metodológicas, **não há inferência causal sobre latência com n=1**; a variância de tempo de transporte (7,4s–9,4s) reflete o agendamento de rede e taxa de geração do modelo, não o tamanho do prompt.

---

## 2. Metadados e Hashes da Execução

| Atributo | Valor Verificado |
| :--- | :--- |
| **Arquivo de Resultados** | `/home/usuario/.local/share/mimir-ef03-pilot/epoch1-dev13-20261028/results.json` |
| **SHA-256 de `results.json`** | `a5c1ef7fbe059b6f3536a822762116e122ebdbfc494f67b512f88a798cb0ea8f` |
| **SHA-256 do Plano Homologado** | `563e6ce15517574b8ce01eb2dcae1970d218e7cd278115597f05a3ee866a11fb` |
| **Tentativas / Sucessos** | 4 tentativas consumidas, 4 concluídas (`status: "completed"`), 0 restantes |
| **Retries / Fallbacks** | 0 retries, 0 fallbacks, 0 ferramentas invocadas (`tools_detected: false`) |
| **Tempo de Preflight / Setup** | 935,28 ms |
| **Tempo Total Decorrido** | 33.684,50 ms (~33,7 s, bem abaixo do teto global de 12 min) |
| **Modelo Solicitado / Observado** | Solicitado: `gpt-6.1-sol` (reasoning `low`); Observado: `null` (allowlist estrita) |

---

## 3. Matriz de Avaliação de Qualidade Factual (Pré-Fixada)

Critérios avaliados contra [`tasks/131-ef03-pilot/quality.json`](file:///mnt/d/Projects/MimirNL/tasks/131-ef03-pilot/quality.json):
- **Gate 1**: Limite de 120 palavras, sintaxe de citação existente e todas as unidades necessárias citadas.
- **Gate 2**: Cada asserção factual fundamentada nos trechos públicos fornecidos; sem fatos inventados.
- **Gate 3**: Todos os aspectos requeridos abordados; nenhuma perda factual em `exact-v1` relativo a `preserve`.

### 3.1. Caso DEV1 (`position: 1`) — Status de Release e Core v0.1

- **Fontes requeridas**: `readme-status/behavior` (`README.md:1-7`) e `package-version/behavior` (`package.json:1-9`).
- **Aspectos obrigatórios**:
  1. Distinguir as evidências de cada fonte citada.
  2. Endereçar se o snapshot demonstra contradição, desatualização, erro ou publicação, respeitando os limites dos trechos.

| Chamada | Condição | Palavras (whitespace / unicode) | Citações Válidas | Distinção das Fontes | Avaliação das Hipóteses (Erro / Contradição / Publicação) | Gate Qualidade |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Call 1** | `preserve` | 96 / 108 | `[readme-status/behavior, linhas 1–7]`, `[package-version/behavior, linhas 1–9]` | README descreve Core v0.1 e 0.2.0 candidata não publicada; package.json declara 0.2.0 nos metadados. | Afirma que a diferença não demonstra, por si só, contradição, desatualização ou erro; nega expressamente publicação. | **PASS** |
| **Call 2** | `exact-v1` | 101 / 116 | `([readme-status/behavior], README.md:1–7)`, `([package-version/behavior], package.json:1–9)` | README comprova projeto candidato não lançado com aceitação aberta e Core v0.1; package.json declara versão 0.2.0. | Afirma que a diferença não basta para provar contradição, erro ou desatualização (escopos diferentes); nega publicação da release. | **PASS** |

**Análise Comparativa Pareada DEV1**: Ambas as respostas cobrem 100% dos aspectos requeridos. A resposta em `exact-v1` preservou todos os pontos factuais da baseline `preserve`, mantendo a nuance de que as fontes são insuficientes para diagnosticar erro/desatualização e confirmando que o README nega a publicação. **Perda factual: Nenhuma (0%)**.

---

### 3.2. Caso DEV3 (`position: 3`) — Rastreio de tokenBudget e Otimizador

- **Fontes requeridas**: `search-schema/behavior` (`src/core/schemas.ts:59-74`), `search-service/behavior` (`src/core/service.ts:356-394`) e `optimizer/behavior` (`src/optimization/index.ts:1-27`).
- **Aspectos obrigatórios**:
  1. Rastrear `tokenBudget` do schema através do serviço até `optimize`.
  2. Declarar limites/padrão, unidade efetiva do estimador e qual envelope é contabilizado usando as unidades fornecidas.

| Chamada | Condição | Palavras (whitespace / unicode) | Citações Válidas | Rastreio Completo (Schema → Service → Optimize) | Unidade Efetiva Declarada | Envelope Contabilizado | Gate Qualidade |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Call 3** | `exact-v1` | 100 / 112 | `[search-schema/behavior, L59–74]`, `[search-service/behavior, L356–372]`, `[optimizer/behavior, L1–27]` | Schema: int 200–100000, def 4000; limit 1–50, def 10. Service: deduplica por hash, view, passa `Number(d.tokenBudget)` a `optimize`. | Bytes UTF-8 de JSON serializado (não tokens de modelo). | Envelope `{ok:true,data:next}` com memories, estimatedTokens=budget e estimator. | **PASS** |
| **Call 4** | `preserve` | 85 / 101 | `[search-schema/behavior, L59–74]`, `[search-service/behavior, L356–394]`, `[optimizer/behavior, L1–27]` | Schema: int 200–100000, def 4000; limit 1–50, def 10. Service: deduplica por hash, view, passa `Number(d.tokenBudget)` a `optimize`. | Bytes UTF-8 de JSON serializado (não tokens de modelo). | Envelope `{ok:true,data:{memories,estimatedTokens:budget,estimator}}`. | **PASS** |

**Análise Comparativa Pareada DEV3**: Ambas as respostas identificam com precisão cirúrgica a cadeia de tipos e dados, as faixas de validação Zod, a unidade real como bytes UTF-8 (e não tokens de rede neural) e a estrutura exata do envelope testado iterativamente. A condição `exact-v1` inclusive detalhou a tolerância ao envelope inicial vazio. **Perda factual: Nenhuma (0%)**.

---

## 4. Tabela Pronta de Métricas e Comparação Pareada

### 4.1. Medições Individuais por Chamada

| Chamada | Posição | Condição | Prompt Bytes | Input Tokens | Cached Input | Uncached Input | Output Tokens | Total Tokens | Transport (s) | Response Bytes |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | DEV1 | `preserve` | 4.065 | 14.921 | 12.032 | 2.889 | 186 | 15.107 | 7,434 | 751 |
| **2** | DEV1 | `exact-v1` | 2.489 | 14.440 | 12.032 | 2.408 | 189 | 14.629 | 9,369 | 787 |
| **3** | DEV3 | `exact-v1` | 4.676 | 15.065 | 12.032 | 3.033 | 196 | 15.261 | 9,098 | 775 |
| **4** | DEV3 | `preserve` | 8.193 | 16.108 | 12.032 | 4.076 | 183 | 16.291 | 6,845 | 724 |

---

### 4.2. Comparação Pareada Direta: `preserve` (A) vs `exact-v1` (B)

A fórmula de economia aplicada é `(1 - B / A) * 100`, onde valores positivos representam redução/economia:

| Caso | Métrica | Preserve (A) | Exact-v1 (B) | Delta (B − A) | Economia (%) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **DEV1** | **Prompt Bytes** | 4.065 | 2.489 | -1.576 B | **+38,77%** |
| | **Input Tokens Totais** | 14.921 | 14.440 | -481 tokens | **+3,22%** |
| | Cached Input Tokens (Piso Host) | 12.032 | 12.032 | 0 tokens | 0,00% |
| | **Uncached Input Tokens (Dinâmico)** | 2.889 | 2.408 | -481 tokens | **+16,65%** |
| | Output Tokens | 186 | 189 | +3 tokens | -1,61% |
| | **Total Tokens** | 15.107 | 14.629 | -478 tokens | **+3,16%** |
| | Transport Wall Time | 7,434 s | 9,369 s | +1,934 s | -26,01% |
| | Response Bytes | 751 | 787 | +36 B | -4,79% |
| **DEV3** | **Prompt Bytes** | 8.193 | 4.676 | -3.517 B | **+42,93%** |
| | **Input Tokens Totais** | 16.108 | 15.065 | -1.043 tokens | **+6,48%** |
| | Cached Input Tokens (Piso Host) | 12.032 | 12.032 | 0 tokens | 0,00% |
| | **Uncached Input Tokens (Dinâmico)** | 4.076 | 3.033 | -1.043 tokens | **+25,59%** |
| | Output Tokens | 183 | 196 | +13 tokens | -7,10% |
| | **Total Tokens** | 16.291 | 15.261 | -1.030 tokens | **+6,32%** |
| | Transport Wall Time | 6,845 s | 9,098 s | +2,253 s | -32,91% |
| | Response Bytes | 724 | 775 | +51 B | -7,04% |

---

### 4.3. Totais Agregados dos Pares e Volume Global das 4 Chamadas

| Agregação | Condição / Segmento | Prompt Bytes | Input Tokens | Cached Input | Uncached Input | Output Tokens | Total Tokens |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Soma dos Pares** | **Preserve Total (A)** | 12.258 | 31.029 | 24.064 | 6.965 | 369 | 31.398 |
| | **Exact-v1 Total (B)** | 7.165 | 29.505 | 24.064 | 5.441 | 385 | 29.890 |
| | **Delta Agregado (B − A)** | **-5.093 B** | **-1.524** | **0** | **-1.524** | **+16** | **-1.508** |
| | **Economia Agregada (%)** | **+41,55%** | **+4,91%** | **0,00%** | **+21,88%** | **-4,34%** | **+4,80%** |
| **Total Global (4 calls)** | **Todas as 4 execuções** | — | **60.534** | **48.128** | **12.406** | **754** | **61.288** |

*Nota: Cached input tokens (48.128) é estritamente um subconjunto de input tokens (60.534) e não deve ser somado duplamente ao total.*

---

## 5. Análise Crítica e Limitações

1. **Ação da Deduplicação no Segmento Dinâmico**:
   - O Codex impõe um prefixo estático de ~12k tokens (`cached_input_tokens = 12032`) presente em todas as requisições.
   - Em termos brutos, a deduplicação EF03 retirou exatamente **1.576 bytes (-481 tokens)** em DEV1 e **3.517 bytes (-1.043 tokens)** em DEV3.
   - Como o prefixo de 12k é constante, a economia percentual sobre a porção que o Mimir efetivamente envia (o input dinâmico / uncached) foi muito expressiva: **16,65% em DEV1** e **25,59% em DEV3** (**21,88% no agregado**).
   - Na contagem total de input tokens do host (que inclui o piso de 12k), a economia relativa dilui-se para **4,91%**, o que é um resultado matematicamente exato e consistente.
2. **Latência de Transporte e Ausência de Causalidade**:
   - As chamadas `exact-v1` apresentaram tempos de transporte ligeiramente maiores (~9,1s a 9,4s) do que `preserve` (~6,8s a 7,4s).
   - Com $n=1$ por condição, essa variação é atribuível a flutuações usuais de carga do host remoto/rede, fila de geração e TTFT. **Não há inferência de que prompts menores aumentem a latência.**
3. **Escopo e Generalização**:
   - O teste utilizou duas tarefas DEV públicas conhecidas com alto overlap intencional (`position 1` e `position 3`).
   - Os resultados comprovam a viabilidade funcional, a ausência de regressão factual e a economia de tokens de entrada dinâmicos sob overlap exato, mas **não constituem alegação de eficiência universal** para holdouts com zero overlap.
4. **Campos Explicitamente Nulos**:
   - `cost`: `null` (custo não aferido localmente sem contrato de precificação).
   - `ttft_ms`: `null` (não exposto no transporte JSONL lean).
   - `cached_savings`: `null` (atribuição econômica indeterminada).
   - `retrieval_latency_ms`: `null` (busca não foi reexecutada no piloto; seleção congelada da Task 103).

---

## 6. Conclusão e Veredito

O piloto de 4 chamadas EF03 foi conduzido e relatado com total rigor. As respostas geradas comprovam que a deduplicação exata (`exact-v1`) preserva 100% da integridade e capacidade analítica do modelo frente às fontes de referência, ao mesmo tempo em que elimina com sucesso ~41,5% dos bytes de prompt e ~21,9% dos tokens de entrada não cacheados.

**Veredito:** **`APPROVE`**


---

## 7. Adendo de Precisão Metodológica (Task 135)

Este adendo é incorporado ao presente parecer para retificar formalmente inferências e termos utilizados nas seções anteriores, restringindo as conclusões rigorosamente aos dados suportados pelo coletor:

1. **Subconjunto de Cache (`cached_input_tokens = 12032`)**:
   - O valor de 12.032 tokens reportado pelo coletor é estritamente um **subconjunto numérico dos tokens de entrada cujo conteúdo não é identificado** pelo contrato público.
   - A igualdade numérica observada nas 4 chamadas **não identifica prefixo, origem de prompt ou instrução de host**, e **não comprova a existência de um "piso estático" permanente** nem garante constância em execuções futuras. Qualquer afirmação sobre "piso estático" ou identificação de conteúdo cacheado é aqui formalmente superseded.

2. **Aritmética de Tokens Não Cacheados (`uncached = input - cached`)**:
   - A métrica `uncached_input_tokens` é uma dedução aritmética descritiva baseada nos contadores retornados (`input_tokens - cached_input_tokens`).
   - A redução de **21,88%** observada na soma dos pares (-1.524 tokens: de 6.965 para 5.441) expressa exclusivamente a variação sobre esse denominador aritmético particular.
   - Ela **não equivale a mapeamento de toda a entrada dinâmica**, não constitui piso/teto de eficiência universal e não representa percentual de economia de custo financeiro.
   - Os valores fundamentais observados no piloto permanecem: redução absoluta de **1.524 tokens de entrada** (-4,91% do total de 31.029 tokens de input da baseline `preserve`) e de **1.508 tokens totais** (-4,80% do total de 31.398 tokens).

3. **Indeterminação Causal da Latência de Transporte**:
   - Os tempos de transporte superiores observados nas duas chamadas sob a condição `exact-v1` (9,369 s e 9,098 s) em relação a `preserve` (7,434 s e 6,845 s) constituem observações descritivas puras.
   - A causa dessa diferença é **estritamente indeterminada**. Não há telemetria para afirmar que a variação adveio de "rede", "agendamento" ou "fila do host". Com tamanho amostral de $n=1$ por condição em tarefas exploratórias, qualquer atribuição causal é metodologicamente inválida. O backend efetivo permaneceu não identificado (`observed_model: null`).

4. **Preservação de Veredito e Dados**:
   - Os dados numéricos de `results.json` (`a5c1ef7fbe059b6f3536a822762116e122ebdbfc494f67b512f88a798cb0ea8f`), as respostas das fontes e o parecer da Task 132 permanecem íntegros e inalterados.
   - O resultado dos gates de qualidade permanece **4/4 PASS** com zero perda factual entre `preserve` e `exact-v1`.
   - Veredito final: **`APPROVE` com limitações explicitadas**.
