# Task107 — Parecer de Revisão de Código e Métricas 0.2

**Veredito:** APPROVE  
**Data:** 2026-10-27  
**Revisor:** Revisor Independente Task 107 (atribuição independente, autor distinto do desenvolvedor da Task 101)  
**Alvo:** Entrega técnica da [Task 101](file:///mnt/d/Projects/MimirNL/tasks/101-v03-metrics-result.md) — perfis, métricas, CLI offline e testes do contrato 0.2.  
**Auditoria:** `actual_model_calls = 0`; revisão estritamente analítica e offline, sem alteração de código, sem subagentes e sem inspeção do corpus privado de evaluation (`/home/usuario/mimir-private/task101-evaluator`).

---

## 1. Hashes Finais dos Artefatos Auditados (Congelados)

Após a conclusão dos checks finais do autor, os hashes de código e dependências foram revalidados e permanecem estritamente inalterados. A revisão vincula-se com exatidão aos seguintes hashes SHA-256 auditados em disco e congelados, coincidentes com [code-inventory-0.2.json](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/code-inventory-0.2.json):

- [contract-v02.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/contract-v02.mjs): `ec81fb371e187700196ddb183c34bf4f13fe2f847187fdb42d364df93c8fe6ea`
- [metrics-v02.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/metrics-v02.mjs): `dcfa1eeadef744f9789e6ddb14f2b13e73d46d6e7864424501669eeb50344252`
- [v02-cli.mjs](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/v02-cli.mjs): `7ffcc74da7746dfeebad775736a4f9c5c6d318f675e29c833b541b01b4c3d0de`
- [benchmark-v02.test.mjs](file:///mnt/d/Projects/MimirNL/test/benchmark-v02.test.mjs): `494b8a4a29ebfeb6d2ce05b8c83b92c4361fa12ef66825811c683908ce8ca012`

> [!NOTE]
> Os hashes acima representam a versão final congelada pós-checks do autor. Qualquer mutação posterior invalida este parecer.

---

## 2. Separação de Perfis e Rejeição entre Versões

- **Incompatibilidade Estrita:** O perfil `technical_reviewed-v1` e a versão `0.2` rejeitam dados 0.1 e vice-versa. Validadores legados (`legacyBundle`, `validateCases`) recusam estruturas 0.2 com exceção controlada.
- **Ausência de Falso Aceite:** A validação exige `human_acceptance_ref: null` e status `["pending", "technical_reviewed", "rejected"]`. Nenhuma conversão de `accepted`/`validated` foi permitida.
- **Portão de Elegibilidade:** `reviewEligibility` exige que o recibo seja externo (`author_ref !== reviewer_ref`), com conferência cruzada de hashes (`bundle_sha256` e `cases_sha256`), sem autorrecursão e marcando explicitamente `authenticity: "requires-supervisor-verification"` e `live_enabled: false`.

---

## 3. Isolamento de Dados, Allowlist Profunda e I/O Seguro

- **Projeção e Invariância de Hash:** `publicBundle` realiza projeção estrita de fontes, ignorando canários e campos privados em qualquer nível de profundidade. O hash do bundle público não é afetado por envenenamento de metadados.
- **Envelope de Execução:** `runtimeEnvelope` limita o contexto a 32.000 bytes e inclui somente `instruction`, `task`, `sources`, `retrieved` e `history: ""` (hash SHA-256 fixado de string vazia). Nenhum metadado de caso, gabarito ou rubrica vaza para o processo público.
- **Processos e I/O Seguros:** `v02-cli.mjs public-render` valida schema fechado (`base,retrieved,task`), executa leitura estrita que recusa symlinks e não importa módulos de avaliação privados. Comandos privados gravam saídas com `0700` e `0600`, impedindo overwrite.

---

## 4. Rigor Metodológico das Métricas

- **Precision & Recall:** Precision@3 usa denominador fixo 3 e deduplicação canônica por conteúdo antes de top-$k$. Recall com $R=0$ produz `N_A`; ausência de revisão ou gabarito produz `sem_gold`; baselines A e C produzem `N_A`.
- **Tratamento de Falhas:** Erros, timeouts, negações e truncamentos produzem `not_completed` ou `truncated`, sem conversão para zero. Retrieval vazio legítimo gera 0 hits e `stale_rate: N_A`.
- **Source Accuracy:** Denominador fixado em claims fáticas avaliáveis com citações validadas contra o snapshot; claims sem citação não são sustentadas; avaliação ausente resulta em `unavailable`, sem autoscoring por LLM.
- **Stale:** Contagem de itens `unknown` bloqueia cálculo da taxa (`unavailable`). Referências `current` exigem SHA e trecho do bundle público.
- **Pares B−A e B−C:** Comparações restritas a casos com mesmo split, revisão e repetição; exclusão explícita de não completados ou truncados; diferenças percentuais calculadas unicamente quando o baseline for estritamente positivo (`> 0`).
- **Telemetria:** Tokens preservados como contadores nativos; `cached_input_tokens <= input_tokens`; latência de retrieval inclusa no total; custo, TTFT e modelo efetivo marcados como `unavailable`.

---

## 5. Checks Reproduzidos

1. **Testes Offline:** `PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH node --test test/benchmark-v02.test.mjs` executado com sucesso: **12 passed, 0 failed** (12.4s).
2. **Sintaxe e Tipos:** `node --check` validou sem erros os 4 arquivos.
3. **Estilo:** `npx prettier --check` confirmou conformidade de todos os arquivos.
4. **Git Diff:** `git diff --check` retornou código 0, sem espaços residuais ou quebras inválidas.

---

## 6. Parecer Final e Próximos Passos

O código entrega todas as garantias exigidas pelo contrato 0.2 e protege a integridade do processo experimental.

- **Veredito:** **APPROVE**
- **Bloqueio:** O avanço para a Task 103 (ABC Runner) permanece condicionado à conclusão e parecer favorável independente da [Task 106](file:///mnt/d/Projects/MimirNL/tasks/106-v03-corpus-review.md). O operador 102 não deve acessar o holdout de evaluation.
