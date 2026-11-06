# Task96 — Parecer de Revisão de Respostas e Métricas v1/v2

**Veredito: APPROVE**  
**Data:** 2026-10-27  
**Status da execução:** 8/8 concluídas (`completed`, `exit_code: 0`, `simulation: false`, `not_execution_proof: false`)  
**actual_model_calls:** 8 (executadas na Task 95; zero chamadas na revisão)  

---

## 1. Integridade Operacional

A execução da Task 95 cumpriu o plano selado:
- **Ordem das 8 tentativas:** `budget-v1` (A, B) $\rightarrow$ `budget-v2` (A, B) $\rightarrow$ `p95-v2` (B, A) $\rightarrow$ `p95-v1` (B, A).
- **Parâmetros:** `call_ms: 90000`, `total_ms: 240000`, 1 repetição, sem retries/warmup.
- **Host e isolamento:** binário `0.164.0`, modelo `gpt-6.1-sol`, esforço `low`, transporte `codex-lean-jsonl-posix-1`. `tools_detected: false`, identidade `unavailable`.
- **Integridade semântica:** em todos os pares v1/v2, `JSON.parse(prompt)` é idêntico em instruções, pergunta, histórico vazio e fontes (mesma ordem, linhas, hashes e excertos). `context_bytes` foi idêntico por par (orçamento A: 4444, B: 3757; p95 A: 4900, B: 2587). Sem confound de ordenação ou fixture.

---

## 2. Avaliação Qualitativa das 8 Respostas

Respostas avaliadas frente às rubricas de `docs/benchmarks/v03/corpus-ampliado.json` e ao limite de 120 palavras:

| Pos | Caso / Layout / Braço | Palavras | Avaliação das Rubricas | Veredito |
|:---:|---|:---:|---|:---:|
| 1 | budget v1 completo | 101 | Faixa 200..100000 e default 4000; liga ao optimize via `Number(d.tokenBudget)`; distingue bytes UTF-8 de tokens reais; detalha envelope e placeholder; cita `search-schema`, `search-service`, `optimizer`. | **PASS** |
| 2 | budget v1 Mimir | 104 | Requisitos técnicos atendidos nas fontes Mimir; citações corretas. | **PASS** |
| 3 | budget v2 completo | 101 | Requisitos conceituais e numéricos atendidos; citações corretas. | **PASS** |
| 4 | budget v2 Mimir | 99 | Atende limites, envelope e distinção de bytes UTF-8; citações corretas. | **PASS** |
| 5 | p95 v2 Mimir | 89 | Abstenção formal de p95; indica que pool contém código/média, sem dados de produção ou percentil; solicita dados necessários; citações adequadas. | **PASS** |
| 6 | p95 v2 completo | 83 | Abstenção formal; delimita falta de dados reais e método; citações sem invenção de fatos. | **PASS** |
| 7 | p95 v1 Mimir | 86 | Abstenção correta de percentil; identifica ausência de dados do período; citações estritas. | **PASS** |
| 8 | p95 v1 completo | 86 | Abstenção de p95; distingue média de percentil ausente; pedido útil de evidência. | **PASS** |

Todas as respostas respeitaram o limite de 120 palavras e obtiveram aprovação integral.

---

## 3. Métricas e Comparação Pareada

Dados reproduzidos de `result.json` e `cache-report.json`. O cálculo não duplica cache: $\text{uncached} = \text{input} - \text{cache}$, $\text{total} = \text{input} + \text{output}$.

### Dados Brutos Verificados

| Caso / Layout / Braço | Input | Cache | Uncached | Output | Total | Ratio | End-to-end ms | Busca ms | Setup ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| orçamento v1 completo | 14.929 | 12.032 | 2.897 | 187 | 15.116 | 80,59% | 8.349,99 | N/A | N/A |
| orçamento v1 Mimir | 14.734 | 12.032 | 2.702 | 191 | 14.925 | 81,66% | 7.883,87 | 3,62 | 1.433,71 |
| orçamento v2 completo | 14.930 | 12.032 | 2.898 | 178 | 15.108 | 80,59% | 8.353,41 | N/A | N/A |
| orçamento v2 Mimir | 14.735 | 12.032 | 2.703 | 177 | 14.912 | 81,66% | 7.797,62 | 2,87 | 1.349,64 |
| p95 v2 Mimir | 14.384 | 12.032 | 2.352 | 157 | 14.541 | 83,65% | 7.854,60 | 2,87 | 1.331,29 |
| p95 v2 completo | 15.079 | 12.032 | 3.047 | 150 | 15.229 | 79,79% | 6.940,56 | N/A | N/A |
| p95 v1 Mimir | 14.383 | 12.032 | 2.351 | 154 | 14.537 | 83,65% | 7.497,01 | 2,46 | 1.316,58 |
| p95 v1 completo | 15.078 | 12.032 | 3.046 | 154 | 15.232 | 79,80% | 6.242,57 | N/A | N/A |

### Comparação Pareada v2 vs v1

| Par | $\Delta$ Input | $\Delta$ Cache | $\Delta$ Uncached | $\Delta$ Output | $\Delta$ Total | $\Delta$ Total % | $\Delta$ E2E ms | $\Delta$ Tempo % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| orçamento completo | +1 | 0 | +1 | -9 | -8 | -0,0529% | +3,42 | +0,04% |
| orçamento Mimir | +1 | 0 | +1 | -14 | -13 | -0,0871% | -86,25 | -1,09% |
| p95 completo | +1 | 0 | +1 | -4 | -3 | -0,0197% | +698,00 | +11,18% |
| p95 Mimir | +1 | 0 | +1 | +3 | +4 | +0,0275% | +357,59 | +4,77% |

---

## 4. Distinção Metodológica e Limitações

1. **Formato (v2 vs v1):** Layout v2 gerou +1 token de input/uncached e **zero alteração de cache** (12.032 tokens nos 8 slots). Nenhum ganho de cache decorre do v2 nesta rodada.
2. **Seleção (Mimir vs Completo):** A redução de tokens resulta unicamente da seleção Mimir (-195 tokens no orçamento, -695 no p95).
3. **Latência:** A busca única Mimir está inclusa no end-to-end (2,46ms a 3,62ms); o setup das fixtures efêmeras (1.316ms a 1.433ms) permaneceu excluído. Variações refletem ruído ambiental do host.
4. **Limitações:** Cache basal de 12.032 tokens é do host. Sem cold reset controlado e com $N=2$ casos/1 repetição, inexiste prova de ganho geral ou causalidade. Custo e TTFT permanecem `unavailable`.

---

## 5. Conclusão

Resultados validados e conformes. Parecer **APROVADO (APPROVE)**.
