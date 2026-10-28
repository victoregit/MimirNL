# Task65 — Parecer Independente de Revisão das Respostas e Medições da Comparação Pareada

## 1. Identificação e Metadados da Revisão

- **Data da Revisão**: 2026-10-27
- **Avaliador**: Agente Revisor Independente de Código
- **Diretório Absoluto de Evidências Reais**: `/tmp/mimir-paired-probe-lAJUGU`
- **Arquivo de Plano**: `/tmp/mimir-paired-probe-lAJUGU/plan.json`
- **Arquivo de Resumo Analítico**: `/tmp/mimir-paired-probe-lAJUGU/summary.json`
- **Fonte Fixada no Git**: [`src/optimization/index.ts`](file:///mnt/d/Projects/MimirNL/src/optimization/index.ts) no commit `166e3cf047b2078952e43dc8e9171e053e99e2ce` (SHA-256: `832cf164215cededa94fff24284dd80d5f3ee1351a9dd2dfee2177658c8b9473`)
- **Pergunta Avaliada**:
  > *"estimateTokens mede tokens reais de um modelo? Como optimize decide quais itens incluir e um item menor posterior pode entrar após um item maior ser descartado? Cite a fonte e responda em até 120 palavras."*
- **Sequência Executada**: Ordem pareada AB / BA / AB (`sem_memoria`, `com_mimir`, `com_mimir`, `sem_memoria`, `sem_memoria`, `com_mimir`)
- **Regras de Isolamento e Segurança**: Nenhuma chamada nova de LLM foi realizada; nenhum subprocesso de inferência foi disparado; nenhum dado sensível de credenciais ou rede foi acessado.

---

## 2. Rubrica de Avaliação de Respostas

A rubrica independente é composta por três critérios conceituais e uma restrição de conformidade de formato:

1. **Critério 1 — Distinção de Bytes vs Tokens Reais (C1)**:
   - *Exigência*: Distingue explicitamente bytes UTF-8 JSON de tokens reais de um modelo, afirmando ser um limite superior conservador e sem alegar economia.
   - *Fundamento no Código*: [`src/optimization/index.ts#L1-L3`](file:///mnt/d/Projects/MimirNL/src/optimization/index.ts#L1-L3) e linha 8 (`estimator: "conservative UTF-8 byte upper bound; not model tokens"`).
2. **Critério 2 — Lógica de Seleção e Continuidade no Descarte (C2)**:
   - *Exigência*: Descreve que `optimize` itera sequencialmente pelos itens, testando a inclusão cumulativa dentro do orçamento (`budget`) e que o laço continua mesmo após um item ser descartado, permitindo a entrada posterior de itens menores que caibam no saldo.
   - *Fundamento no Código*: [`src/optimization/index.ts#L11-L18`](file:///mnt/d/Projects/MimirNL/src/optimization/index.ts#L11-L18).
3. **Critério 3 — Citação Correta da Fonte (C3)**:
   - *Exigência*: Cita com precisão o identificador da fonte fornecida: `src/optimization/index.ts@166e3cf047b2078952e43dc8e9171e053e99e2ce`.
4. **Conformidade de Extensão (Ext)**:
   - *Exigência*: Máximo de 120 palavras (avaliado separadamente da correção factual).

---

## 3. Matriz de Qualidade das Seis Execuções

| Run | Par | Condição | C1 (Bytes vs Tokens) | C2 (Seleção e Continuidade) | C3 (Citação da Fonte) | Extensão (Palavras) | Status / Veredito |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | 1 | `sem_memoria` (A) | **PASS** | **PASS** | **PASS** | 105 palavras (≤ 120) | **APROVADO** |
| **2** | 1 | `com_mimir` (B) | **PASS** | **PASS** | **PASS** | 94 palavras (≤ 120) | **APROVADO** |
| **3** | 2 | `com_mimir` (B) | **PASS** | **PASS** | **PASS** | 99 palavras (≤ 120) | **APROVADO** |
| **4** | 2 | `sem_memoria` (A) | **PASS** | **PASS** | **PASS** | 100 palavras (≤ 120) | **APROVADO** |
| **5** | 3 | `sem_memoria` (A) | **PASS** | **PASS** | **PASS** | 99 palavras (≤ 120) | **APROVADO** |
| **6** | 3 | `com_mimir` (B) | **PASS** | **PASS** | **PASS** | 88 palavras (≤ 120) | **APROVADO** |

### Justificativas Detalhadas por Resposta

- **Run 1** (`sem_memoria` / Par 1):
  - *Arquivo*: `/tmp/mimir-paired-probe-lAJUGU/response-1.txt`
  - *C1 (PASS)*: Responde negativamente e declara expressamente que mede bytes UTF-8 de `JSON.stringify(value)` como limite superior conservador, não tokens de modelo nem métrica de economia.
  - *C2 (PASS)*: Explica a iteração sequencial e o cálculo no envelope `{ ok: true, data: next }` com `estimatedTokens: budget`, afirmando expressamente que o laço continua e itens menores rejeitados anteriormente não impedem próximos itens.
  - *C3 (PASS)*: Cita explicitamente `src/optimization/index.ts@166e3cf047b2078952e43dc8e9171e053e99e2ce`.
  - *Ext*: 105 palavras.

- **Run 2** (`com_mimir` / Par 1):
  - *Arquivo*: `/tmp/mimir-paired-probe-lAJUGU/response-2.txt`
  - *C1 (PASS)*: Nega medição de tokens reais, indicando bytes UTF-8 de JSON serializado como limite superior conservador.
  - *C2 (PASS)*: Detalha a simulação cumulativa condicional ao orçamento e confirma que o laço continua sem que o item rejeitado consuma espaço.
  - *C3 (PASS)*: Cita explicitamente `src/optimization/index.ts@166e3cf047b2078952e43dc8e9171e053e99e2ce`.
  - *Ext*: 94 palavras.

- **Run 3** (`com_mimir` / Par 2):
  - *Arquivo*: `/tmp/mimir-paired-probe-lAJUGU/response-3.txt`
  - *C1 (PASS)*: Nega ser tokenizador ou métrica de economia, apontando bytes UTF-8 como teto conservador.
  - *C2 (PASS)*: Descreve o teste do envelope `{ ok: true, data: next }` sob o teto do orçamento e a continuidade do laço para itens subsequentes.
  - *C3 (PASS)*: Cita explicitamente `src/optimization/index.ts@166e3cf047b2078952e43dc8e9171e053e99e2ce`.
  - *Ext*: 99 palavras.

- **Run 4** (`sem_memoria` / Par 2):
  - *Arquivo*: `/tmp/mimir-paired-probe-lAJUGU/response-4.txt`
  - *C1 (PASS)*: Afirma que mede bytes UTF-8 de `JSON.stringify(value)`, teto conservador, sem ser tokenizador nem métrica de economia.
  - *C2 (PASS)*: Explica a montagem de candidato e critério `<= budget`, explicitando que "descartar um item não interrompe o laço".
  - *C3 (PASS)*: Cita explicitamente `src/optimization/index.ts@166e3cf047b2078952e43dc8e9171e053e99e2ce`.
  - *Ext*: 100 palavras.

- **Run 5** (`sem_memoria` / Par 3):
  - *Arquivo*: `/tmp/mimir-paired-probe-lAJUGU/response-5.txt`
  - *C1 (PASS)*: Distingue bytes UTF-8 de contagem real de tokens e nega expressamente métrica de economia.
  - *C2 (PASS)*: Descreve montagem do candidato com envelope e confirma que descartar não interrompe o laço.
  - *C3 (PASS)*: Cita explicitamente `src/optimization/index.ts@166e3cf047b2078952e43dc8e9171e053e99e2ce`.
  - *Ext*: 99 palavras.

- **Run 6** (`com_mimir` / Par 3):
  - *Arquivo*: `/tmp/mimir-paired-probe-lAJUGU/response-6.txt`
  - *C1 (PASS)*: Distingue bytes UTF-8 de tokens reais do modelo, caracterizando-o como limite conservador.
  - *C2 (PASS)*: Descreve simulação de inclusão com envelope sob orçamento e pontua que o descarte não encerra o laço.
  - *C3 (PASS)*: Cita explicitamente `src/optimization/index.ts@166e3cf047b2078952e43dc8e9171e053e99e2ce`.
  - *Ext*: 88 palavras.

### Avaliação Qualitativa Global
- **Concordância Factual**: 100% de precisão em todas as 6 respostas em relação ao código-fonte fixado.
- **Ausência de Alucinações**: Nenhuma resposta inventou suporte a tokenizadores reais BPE/WordPiece ou alegou compressão mágica.
- **Uniformidade entre Condições**: As respostas sob `com_mimir` apresentaram a mesma qualidade factual e clareza conceitual que sob `sem_memoria`.

---

## 4. Revisão Numérica e Verificação de Métricas

### 4.1. Cobertura e Exclusões
- Total de chamadas planejadas: 6
- Total de chamadas completadas: 6 (`exit_code: 0`, `timeout: false`, `tools_detected: false`)
- Exclusões de dados: 0 (`exclusions: []`). Cobertura de 100%.

### 4.2. Contabilidade de Tokens e Prevenção de Dupla Contagem de Cache
A fórmula de contabilidade do host é rigorosamente verificada:
$$\text{total\_tokens} = \text{input\_tokens} + \text{output\_tokens}$$
O campo `cached_input_tokens` (12.288 tokens em todas as 6 execuções) refere-se à porção de prompt cache lida e é **subconjunto** de `input_tokens`. Não houve soma dupla de cache ao total em nenhuma execução.

| Run | Condição | Input Tokens | Cached Input | Output Tokens | Total Tokens | Verificação ($\text{In} + \text{Out} = \text{Tot}$) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | `sem_memoria` | 14.958 | 12.288 | 188 | 15.146 | $14.958 + 188 = 15.146$ (OK) |
| 2 | `com_mimir` | 14.708 | 12.288 | 171 | 14.879 | $14.708 + 171 = 14.879$ (OK) |
| 3 | `com_mimir` | 14.708 | 12.288 | 175 | 14.883 | $14.708 + 175 = 14.883$ (OK) |
| 4 | `sem_memoria` | 14.415 | 12.288 | 181 | 14.596 | $14.415 + 181 = 14.596$ (OK) |
| 5 | `sem_memoria` | 14.415 | 12.288 | 180 | 14.595 | $14.415 + 180 = 14.595$ (OK) |
| 6 | `com_mimir` | 15.251 | 12.288 | 173 | 15.424 | $15.251 + 173 = 15.424$ (OK) |

#### Medianas por Condição (Tokens)
- **`sem_memoria` (A)**:
  - Input: 14.415 (min: 14.415, max: 14.958, mediana: **14.415**)
  - Cached Input: 12.288 (min: 12.288, max: 12.288, mediana: **12.288**)
  - Output: 181 (min: 180, max: 188, mediana: **181**)
  - Total: 14.596 (min: 14.595, max: 15.146, mediana: **14.596**)
- **`com_mimir` (B)**:
  - Input: 14.708 (min: 14.708, max: 15.251, mediana: **14.708**)
  - Cached Input: 12.288 (min: 12.288, max: 12.288, mediana: **12.288**)
  - Output: 173 (min: 171, max: 175, mediana: **173**)
  - Total: 14.883 (min: 14.879, max: 15.424, mediana: **14.883**)

#### Deltas Pareados ($B - A$) de Tokens
- **Par 1** (Run 2 vs Run 1): $\Delta\text{input} = -250$, $\Delta\text{cache} = 0$, $\Delta\text{output} = -17$, $\Delta\text{total} = -267$
- **Par 2** (Run 3 vs Run 4): $\Delta\text{input} = +293$, $\Delta\text{cache} = 0$, $\Delta\text{output} = -6$, $\Delta\text{total} = +287$
- **Par 3** (Run 6 vs Run 5): $\Delta\text{input} = +836$, $\Delta\text{cache} = 0$, $\Delta\text{output} = -7$, $\Delta\text{total} = +829$
- **Mediana Pareada dos Deltas ($B - A$)**:
  - $\Delta\text{input}$: **+293** (min: -250, max: +836)
  - $\Delta\text{cache}$: **0**
  - $\Delta\text{output}$: **-7** (min: -17, max: -6)
  - $\Delta\text{total}$: **+287** (min: -267, max: +829)

---

### 4.3. Contabilidade de Tempo e Isolamento do Setup

A contabilidade temporal respeita com rigor as separações do protocolo em [`scripts/benchmarks/paired-probe.mjs#L378-L403`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/paired-probe.mjs#L378-L403):
1. **Setup Isolado**: `setup_ms` mede a inicialização efêmera do banco SQLite do Mimir e preparação dos registros. É registrado isoladamente e **não** entra em `wall_ms` nem em `end_to_end_ms`.
   - Run 2: 1.094,72 ms (cold setup do primeiro fixture)
   - Run 3: 12,19 ms
   - Run 6: 11,06 ms
2. **Tempo de Recuperação ($B$)**: `retrieval_ms` mede a recuperação via Mimir Service.
   - Run 2: 3,64 ms
   - Run 3: 0,47 ms
   - Run 6: 0,43 ms
   - Mediana: **0,47 ms**
3. **End-to-End**: Medido a partir de `endStart` ([`scripts/benchmarks/paired-probe.mjs#L384`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/paired-probe.mjs#L384)), somando exatamente 1x o `retrieval_ms` mais a execução do subprocesso Codex CLI (`wall_ms`).

| Run | Condição | Setup (ms) | Retrieval (ms) | Wall (ms) | End-to-End (ms) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | `sem_memoria` | 0,00 | 0,00 | 7.221,10 | 7.221,28 |
| 2 | `com_mimir` | 1.094,72 | 3,64 | 6.447,85 | 6.451,68 |
| 3 | `com_mimir` | 12,19 | 0,47 | 6.825,42 | 6.825,97 |
| 4 | `sem_memoria` | 0,00 | 0,00 | 6.873,46 | 6.873,52 |
| 5 | `sem_memoria` | 0,00 | 0,00 | 9.351,52 | 9.351,53 |
| 6 | `com_mimir` | 11,06 | 0,43 | 6.353,33 | 6.353,86 |

#### Medianas por Condição (Tempo)
- **`sem_memoria` (A)**:
  - Wall: 7.221,10 ms (min: 6.873,46 ms, max: 9.351,52 ms)
  - End-to-End: 7.221,28 ms (min: 6.873,52 ms, max: 9.351,53 ms)
- **`com_mimir` (B)**:
  - Wall: 6.447,85 ms (min: 6.353,33 ms, max: 6.825,42 ms)
  - End-to-End: 6.451,68 ms (min: 6.353,86 ms, max: 6.825,97 ms)
  - Retrieval: 0,47 ms (min: 0,43 ms, max: 3,64 ms)

#### Deltas Pareados ($B - A$) de Tempo
- **Par 1** (Run 2 vs Run 1): $\Delta\text{wall} = -773,26\text{ ms}$, $\Delta\text{e2e} = -769,61\text{ ms}$
- **Par 2** (Run 3 vs Run 4): $\Delta\text{wall} = -48,05\text{ ms}$, $\Delta\text{e2e} = -47,54\text{ ms}$
- **Par 3** (Run 6 vs Run 5): $\Delta\text{wall} = -2.998,18\text{ ms}$, $\Delta\text{e2e} = -2.997,67\text{ ms}$
- **Mediana Pareada dos Deltas ($B - A$)**:
  - $\Delta\text{wall}$: **-773,26 ms**
  - $\Delta\text{e2e}$: **-769,61 ms**
  - $\Delta\text{retrieval}$: **+0,47 ms**

---

### 4.4. Metadados do Modelo e Restrições de Custos
- **Identidade do Modelo**: Reportada com precisão como `"unavailable"` (`"reason": "No model identity in allowlisted public start metadata"`). Nenhuma suposição não fundamentada sobre a família do modelo foi incorporada.
- **Custo e TTFT**: Mantidos estritamente como `"unavailable"`, respeitando a ausência de suporte no host para essas métricas.

---

## 5. Análise Crítica: Duplicação de Contexto e Limitações

### 5.1. Natureza do Overhead e Duplicação de Contexto
Na condição `com_mimir`, o prompt gerado ([`scripts/benchmarks/paired-probe.mjs#L34-L37`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/paired-probe.mjs#L34-L37)) agregou a fonte integral no preâmbulo base **mais** o envelope serializado recuperado pelo Mimir (`Recuperação local Mimir (candidate/user): ...`).

> [!IMPORTANT]
> **Interpretação Restrita da Sobrecarga de Tokens**:
> O acréscimo mediano de **+287 tokens** na condição `com_mimir` decorre estritamente da **duplicação contextual deliberada** no benchmark exploratório (a fonte completa foi injetada duas vezes no prompt da condição B).
> 
> Essa observação mede a redundância introduzida pelo protocolo exploratório e **não demonstra ineficácia, obsolescência ou inutilidade geral da memória externa**. Em aplicações reais em produção, a memória externa serve exatamente para selecionar e recuperar itens quando o contexto completo não está previamente injetado no prompt.

### 5.2. Limitações de Amostragem e Ausência de Alegação de Significância
- A amostra foi intencionalmente dimensionada em $n=3$ pares (6 chamadas no total) para validação preliminar do pipeline.
- Não há poder estatístico para inferir significância com $n=3$.
- Não se reivindica nem se infere economia de tokens, ganhos de latência atribuíveis à arquitetura ou redução de custos a partir deste conjunto preliminar.

---

## 6. Parecer Final e Conclusão

- **Veredito Geral**: **APROVADO (APPROVE)**.
- Todas as 6 respostas passaram com sucesso na rubrica factual e nos limites de extensão.
- Todas as medições de tokens, cache, tempos e separação de setup em `/tmp/mimir-paired-probe-lAJUGU/summary.json` foram auditadas e conferem perfeitamente com os dados brutos de `/tmp/mimir-paired-probe-lAJUGU/runs.json`.
- A integridade do código e a ausência de novas execuções foram integralmente preservadas.
