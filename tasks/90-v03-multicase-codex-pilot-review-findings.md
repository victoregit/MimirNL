# Task90 — Parecer independente do piloto real Task89

**Veredito:** `APPROVE`

Encaminhado ao supervisor. Esta revisão independente avaliou o piloto real Codex de 4 chamadas (Task89), confrontando `tasks/89-v03-multicase-codex-pilot.md` e `tasks/89-v03-multicase-codex-pilot-result.md` com as evidências brutas em `/tmp/mimir-task87-pilot-proposed/{plan,result,context-*,response-*}.json`, o manifesto `docs/benchmarks/v03/piloto-codex-proposto.json` e as rubricas de `docs/benchmarks/v03/corpus-ampliado.json`.

O parecer `APPROVE` atesta que a execução cumpriu o protocolo autorizado, as respostas atendem às rubricas qualitativas e as métricas relatadas são reproduzíveis. Não atesta ganho geral nem validação formal de gold.

---

## 1. Avaliação Qualitativa das Respostas (Rubricas Privadas)

Todas as 4 respostas respeitaram o teto de 120 palavras (81 a 99 palavras), mantiveram factualidade estrita com base nas fontes, citaram IDs pertinentes e não apresentaram alucinações. Nenhuma ferramenta foi executada (`tools_detected: false`). O revisor avaliou os critérios privados sem injetar gold no runtime.

| Posição / Run ID | Caso | Braço | Palavras | Citações | Veredito | Justificativa |
|---|---|---|---:|---|:---:|---|
| **Pos 1** (`...contexto_completo`) | `expanded-budget-envelope` | A (Completo) | 99 | `[search-schema]`, `[search-service]`, `[optimizer]` | **PASS** | Distingue bytes UTF-8 de tokens reais; detalha envelope `{ok:true,data:next}` e placeholder de orçamento; cita limites (200..100000, default 4000) e fluxo schema -> serviço -> optimize. |
| **Pos 2** (`...selecao_mimir`) | `expanded-budget-envelope` | B (Mimir) | 97 | `[search-schema]`, `[search-service]`, `[optimizer]` | **PASS** | Mesma precisão conceitual; descreve passagem de `Number(d.tokenBudget)`, medição em bytes UTF-8 sobre o envelope e ausência de garantia para tokens reais. |
| **Pos 3** (`...selecao_mimir`) | `expanded-production-p95-absent` | B (Mimir) | 81 | `[search-service]`, `[stats-service]` | **PASS** | Abstenção honesta explícita; explica que o código registra duração mas não traz registros de produção, e `memory_stats` só calcula média sem percentil/janela; solicita amostras do intervalo. |
| **Pos 4** (`...contexto_completo`) | `expanded-production-p95-absent` | A (Completo) | 83 | `[search-service]`, `[stats-service]` | **PASS** | Abstenção honesta idêntica; recusa inferir p95 a partir de `avg(elapsed_ms)`; aponta necessidade de dados de produção no intervalo solicitado. |

---

## 2. Integridade do Protocolo, Execução e Isolamento

1. **Plano e Bundle:** O digest canônico do plano confere com a autorização (`95870f259e83fb5b4ea4dab50de654a61258474e9ec9b6de2baf9bbd2c2216c5`). O digest do bundle consumido é `daaaf6cb68617339155892de592f444f65b1ec102d0f8b700f03682ea3d0d0d7`.
2. **Ordem Contrabalanceada e Execução Real:** Ordem estrita AB/BA (Caso 1: completo -> Mimir; Caso 2: Mimir -> completo). Ocorreram 4 chamadas a modelos reais (`actual_model_calls: 4`, `attempted_calls: 4`, `completed_calls: 4`, `simulation: false`, `not_execution_proof: false`), todas com `exit_code: 0`.
3. **Sem Oracle e Busca Controlada:** No braço B, o Mimir executou exatamente 1 busca em fixture SQLite efêmera por caso (`retrieval_calls: 1`), sem consulta a banco pessoal ou gold.
4. **Isolamento de Temporização:** A busca em B (2.748 ms no Caso 1; 1.020 ms no Caso 2) integrou o timer contínuo `end_to_end_ms`. Setup e teardown de fixtures ficaram isolados fora da medição (1318.148 ms e 14.894 ms).
5. **Identidade do Modelo e Metadados:** Identidade efetiva retornou `unavailable` ("No model identity in allowlisted public start metadata"). Métricas de `cost`, `quality` e `ttft` constam corretamente como `unavailable`, sem zeros fictícios.

---

## 3. Confronto Métrico e Análise Pareada

Os dados relatados pelo supervisor conferem com os artefatos originais e cálculos reproduzíveis:

| Caso / Condição | Posição | Input | Cache (subset) | Output | Total | Contexto (bytes) | End-to-end (ms) | Busca (ms) |
|---|:---:|---:|---:|---:|---:|---:|---:|---:|
| `budget` / Completo (A) | 1 | 14931 | 12032 | 174 | 15105 | 4444 | 9810.203 | N/A |
| `budget` / Mimir (B) | 2 | 14736 | 12032 | 176 | 14912 | 3757 | 8533.844 | 2.748 |
| `p95` / Mimir (B) | 3 | 14383 | 12032 | 145 | 14528 | 2587 | 8625.436 | 1.020 |
| `p95` / Completo (A) | 4 | 15078 | 12032 | 151 | 15229 | 4900 | 8188.831 | N/A |

### Comparação Pareada (B - A)

- **Caso 1 (`expanded-budget-envelope`):**
  - Input: -195 (-1.3060%)
  - Output: +2 (+1.1494%)
  - Total: **-193 (-1.2777%)**
  - Contexto: -687 bytes (-15.4590%)
  - End-to-end: **-1276.359 ms (-13.0105%)**
- **Caso 2 (`expanded-production-p95-absent`):**
  - Input: -695 (-4.6094%)
  - Output: -6 (-3.9735%)
  - Total: **-701 (-4.6031%)**
  - Contexto: -2313 bytes (-47.2041%)
  - End-to-end: **+436.605 ms (+5.3317%)**

---

## 4. Limitações Críticas

1. **Amostra Reduzida:** Piloto com N = 2 casos e 1 repetição; não demonstra ganho geral nem efeito estatisticamente sustentável.
2. **Latência Não Causal:** No Caso 2, apesar da queda de 4.60% em tokens e 47.20% em bytes de contexto, a latência do braço B foi 5.33% maior (+436.6 ms), refletindo variabilidade de rede e fila remota.
3. **Dissociação de Custo:** Tokens não equivalem a custo financeiro. O cache de prompt (12032 tokens) representou ~80-83% do input e permaneceu constante nos quatro slots; descontos de cache e tarifas reais não foram apurados.
4. **Status do Gold:** Casos permanecem com status `pending` no split de desenvolvimento; não há aprovação humana de gold.
