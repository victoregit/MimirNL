# Task52 — resultado da implementação offline

Estado: implementação e validação local concluídas; **revisão independente [APPROVE na Task53](53-v03-benchmark-metrics-review-findings.md)**, sem autoaprovação ou integração. Branch `feat/v03-benchmark-metrics`. Sem commit/push, chamadas a modelo, executor, corpus real, ingestão ou leitura de fontes/referências. Nenhuma alteração em preflight, contrato, core, dependências, package, CI, versão ou roadmap. `AGENTS.md` dirty preexistente e arquivos de tarefas preexistentes foram preservados.

## Arquivos entregues

- `scripts/benchmarks/metrics.mjs`: API pura `evaluateMetrics(cases, batch)`, validação estrita do adaptador experimental, comparação integral do plano rederivado, métricas por run, cobertura/status por cenário e diferenças pareadas.
- `scripts/benchmarks/metrics-cli.mjs`: dois JSON explícitos, relatório read-only no stdout por padrão, destino novo exclusivo `wx`/0600 opcional e erros fixos privados.
- `test/benchmark-metrics.test.mjs`: cinco testes agrupados com fixtures somente sintéticas, fórmulas, dados ausentes/zero, falhas e exclusões, tampering, enums/números inválidos, privacidade, CLI real, arquivos/symlinks existentes e import sem efeitos.
- `docs/benchmarks/v03/metricas.md`: formato mínimo e exemplos documentais sintéticos, comandos, fórmulas, denominadores, precedência de exclusões, semântica de indisponibilidade e limites.
- Este registro de resultado.

## Verificação Linux realizada

Runtime indicado: `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`. PATH temporário dos comandos npm/Prettier aponta ao mesmo diretório; sem instalação ou busca de outro runtime.

```sh
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --test /mnt/d/Projects/MimirNL/test/benchmark-metrics.test.mjs
PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH node node_modules/prettier/bin/prettier.cjs --write scripts/benchmarks/metrics.mjs scripts/benchmarks/metrics-cli.mjs test/benchmark-metrics.test.mjs docs/benchmarks/v03/metricas.md
PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH npm test
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --check /mnt/d/Projects/MimirNL/scripts/benchmarks/metrics.mjs
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --check /mnt/d/Projects/MimirNL/scripts/benchmarks/metrics-cli.mjs
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --check /mnt/d/Projects/MimirNL/test/benchmark-metrics.test.mjs
PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH node node_modules/prettier/bin/prettier.cjs --check scripts/benchmarks/metrics.mjs scripts/benchmarks/metrics-cli.mjs test/benchmark-metrics.test.mjs docs/benchmarks/v03/metricas.md
git diff --check
```

Saídas: focused **5 pass, 0 fail**; `npm test` executado uma vez, build TypeScript seguido de **51 tests, 50 pass, 0 fail, 1 skip esperado Windows**. Node checks: exit 0 sem saída. Prettier focado: `All matched files use Prettier code style!`. Diff check: exit 0 sem saída. O teste CLI cria e remove somente fixtures temporárias sintéticas; a regressão existente usa seus próprios ambientes temporários, sem corpus/DB real.

## Decisões e limites para revisão

Adaptador `experimental-1`, não protocolo de executor acordado. Um único plano preflight integralmente conferido por batch; splits mistos rejeitados; k explícito e métodos constantes por batch. Casos sem gold não entram porque o próprio planejamento exige gold validated. Componentes source/unit com `/` são rejeitados para evitar ambiguidade do gold slash-joined. Plano público não representa um manifesto real aprovado.

Retrieval permanece por run, sem agregação macro/micro por caso/repetição. Stale declarado exige current/stale/unknown; unknown produz unavailable, zero unidades N_A. Source accuracy indisponível. Sucesso manual exige método e referências declaradas, sem abrir ou exportar referências. Pares usam completed não truncado com métrica disponível, preservando contagens de todos os status e cobertura. Percentuais sem baseline positivo ou não finitos são excluídos com razão explícita; sem amostra, estatísticas são null com n=0. Estatísticas por cenário e par são descritivas e não demonstram ganhos com cobertura parcial.

Saída contém somente metadados públicos allowlisted e métricas, marcada experimental/caller_not_verified/not_execution_proof/plan_executable=false. Tokens/uso/custo explicitamente não implementados, sem zeros inventados. Não foram gerados resultados reais nem publicado relatório com gold. Contrato, corpus/metodologia do amigo, manifesto, modelo/budget e executor continuam pendentes. Revisão independente [APPROVE na Task53](53-v03-benchmark-metrics-review-findings.md); integração permanece sob controle do supervisor `dbfe79b6`.
