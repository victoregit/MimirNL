# Task107 — revisão independente de perfil/métricas/exportação0.2

Dependência: entrega métricas101; revisor diferente de codex-task101. Zero modelos reais/subagentes. Atribuição pelo supervisor, sem autoaprovação.

Ler `/mnt/d/Projects/MimirNL/tasks/101-v03-metrics-result.md`, `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/metricas-0.2.md` e contrato0.2. Revisar applicationcode integral em `/mnt/d/Projects/MimirNL/scripts/benchmarks/contract-v02.mjs`, `metrics-v02.mjs`, `v02-cli.mjs` e testes `/mnt/d/Projects/MimirNL/test/benchmark-v02.test.mjs`. Os fixtures são sintéticos e não requerem abertura de evaluation real.

Conferir compatibilidade/rejeição entre versões, perfil sem falso aceite, receipt externo/não recursivo, allowlist profunda e invariância de hash, seed só fontes, separação de I/O público/privado, canary gold, paths/symlinks/UTF-8/regular blob/ranges/hash/nooverwrite/budget, R=0 versus sem_gold, denominador3, baselines N_A, falhas/ausências/truncamento, source accuracy com vínculos e contagens, stale/current com referência avaliada versus unknown e limites do julgamento externo, rubricas/cobertura/pares/repetições/splits, tokens nativos e ausência de custo inferido. Testes não substituem revisão de implementação ou aceitação humana.

Entregar `/mnt/d/Projects/MimirNL/tasks/107-v03-metrics-review-findings.md` com identidade real, APPROVE/CHANGES_REQUESTED, checks reproduzidos, riscos e correções concretas. Nenhum APPROVE foi emitido pelo autor101. Parecer pendente bloqueia103; resolver correções antes da etapa dependente. Não alterar validadores legados nem configuração, CI, commit/push/publicação.
