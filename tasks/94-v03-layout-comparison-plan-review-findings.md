# Task94 — Parecer de Revisão do Plano de Comparação Real v1/v2

**Veredito: APPROVE**  
**Data:** 2026-10-27  
**Status dos planos:** proposed (prontos para execução autorizada pelo supervisor na Task 95)  
**actual_model_calls:** 0  

---

## 1. Auditoria dos Manifestos e Hashes Canônicos

Foram inspecionados os quatro manifestos em `/tmp/mimir-task93-plans` (diretório `0700`, arquivos `0600`). A integridade canônica do corpo JSON (`canonical(body)`) e o `sha256` selado conferem perfeitamente via CLI `multicase-codex.mjs --validate`:

| Plano | Manifesto | Destino de Saída | SHA-256 Canônico | Schema | Layout |
|---|---|---|---|---|---|
| budget-v1 | `/tmp/mimir-task93-plans/budget-v1.json` | `/tmp/mimir-task95-budget-v1` | `5afc17caa99980f42fbc54e5cbc70c4c5d6b50320e6538ba029d8c3fbc7a165b` | `codex-multicase-plan-1` | v1 (legado) |
| budget-v2 | `/tmp/mimir-task93-plans/budget-v2.json` | `/tmp/mimir-task95-budget-v2` | `62e63774e7165970424432f3441c12f869d9b0ae91ab837d4dfed7856c53d0e8` | `codex-multicase-plan-2` | `instruction-sources-question-2` |
| p95-v2 | `/tmp/mimir-task93-plans/p95-v2.json` | `/tmp/mimir-task95-p95-v2` | `de6fbdabc4b1324fa42c4e075b86670f6d5f29d5ede47d221d51577efee66e7a` | `codex-multicase-plan-2` | `instruction-sources-question-2` |
| p95-v1 | `/tmp/mimir-task93-plans/p95-v1.json` | `/tmp/mimir-task95-p95-v1` | `c08f565387d75aee91b50a5bf6a5e9ec01753c0d8f6bccc1b3df3284d80b256a` | `codex-multicase-plan-1` | v1 (legado) |

Todos vinculados ao bundle público `/tmp/mimir-task87-public/bundle.json` (SHA canônico `daaaf6cb68617339155892de592f444f65b1ec102d0f8b700f03682ea3d0d0d7`). Os destinos `/tmp/mimir-task95-*` não existem previamente.

## 2. Ordem de Execução e Orçamento de Recursos

A ordem prescrita alterna layouts e braços rigorosamente conforme o protocolo aprovado (uma repetição, 2 chamadas por manifesto, 8 no total):

1. **budget-v1** (offset 0): Pos 1 = `contexto_completo` (A), Pos 2 = `selecao_mimir` (B)
2. **budget-v2** (offset 0): Pos 3 = `contexto_completo` (A), Pos 4 = `selecao_mimir` (B)
3. **p95-v2** (offset 1): Pos 5 = `selecao_mimir` (B), Pos 6 = `contexto_completo` (A)
4. **p95-v1** (offset 1): Pos 7 = `selecao_mimir` (B), Pos 8 = `contexto_completo` (A)

Limites operacionais: `call_ms: 90000` (90s), `total_ms: 240000` (240s) por invocação, teto agregado estrito de 960s (16 min). Zero retries; primeira falha interrompe o job. Sem warmup prévio e sem alteração do modelo host (`gpt-6.1-sol`, esforço `low`, release standalone `0.164.0`).

## 3. Isolamento, Metadados e Independência de Gold

- O prompt é rigorosamente sanitizado: IDs de caso, classes, query de busca e status de aceitação não integram envelopes de prompt, histórico ou seed.
- As fixtures para o braço B (`selecao_mimir`) usam repositório e banco SQLite efêmeros alimentados exclusivamente pelo pool público de fontes do bundle.
- Nenhuma API ou flag de cache inventada foi introduzida no CLI; o layout v2 usa estritamente prefixo estático validado de 203 bytes (`3443a352d33328a9b15e5a61a5c2963bd5459acd3b4bdc917b93f150bf6fd172`).
- A base de código (`multicase-codex.mjs`, `multicase-runner.mjs`, `stable-prompt.mjs`) e histórico permanecem intactos.

## 4. Limites Metodológicos e Confounds Declarados

O relatório da Task 93 declara e reconhece com precisão:
1. **Ausência de cold/reset:** A execução ocorre em ambiente real potencialmente quente; não há garantia de reset de cache no host.
2. **Confounds:** Variação em ordenação de busca/empates na seleção Mimir constitui confound e não será atribuída a cache de layout.
3. **Métricas:** Input total reportado inclui cached tokens como subconjunto (sem soma duplicada). Custo financeiro e TTFT permanecem `unavailable`. O cache histórico de 12.032 tokens do host não é atribuível a trechos específicos.
4. **Sem alegações generalistas:** Nenhuma inferência causal ou ganho definitivo de custo será afirmada a partir desta rodada exploratória de N=2 casos.

## 5. Conclusão

Os quatro manifestos estão validados offline, consistentes, seguros e em conformidade estrita com as diretrizes aprovadas pelo usuário. O plano está **APROVADO (APPROVE)** para execução sequencial pelo supervisor na Task 95.
