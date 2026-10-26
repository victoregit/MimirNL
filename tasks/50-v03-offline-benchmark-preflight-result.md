# Task50 — resultado do protótipo offline

Estado local: **implementação revisada e aprovada no escopo limitado do protótipo offline**, conforme [revisão independente da Task51 — APPROVE](51-v03-preflight-review-findings.md), sem pendências acionáveis registradas. Callback ao supervisor `dbfe79b6`. Aprovação independente, sem autoaprovação, commit ou push; integração permanece sob controle do mantenedor. Contrato permanece proposta não aprovada; este aceite não aprova corpus nem representa avaliação com modelos ou evidência de ganho em benchmark.

## Base e preservação

Checkout já estava em `feat/v03-benchmark-preflight`, HEAD `93959dd`. Preexistiam alteração de `AGENTS.md` e arquivos não rastreados `tasks/50-v03-offline-benchmark-preflight.md` e `tasks/51-v03-preflight-review.md`; foram preservados sem edição. Não houve troca de branch, reset ou limpeza do checkout.

## Arquivos da entrega

- `scripts/benchmarks/preflight.mjs` — funções importáveis sem I/O: validação estrita do contrato 0.1 e planejamento determinístico com allowlist pública, proveniência declarada e `executable=false`.
- `scripts/benchmarks/preflight-cli.mjs` — CLI manual `validate`/`plan`, leitura somente da entrada explícita, mensagens sem conteúdo privado e escrita explícita exclusiva `wx` do plano novo.
- `test/benchmark-preflight.test.mjs` — nove testes com fixtures sintéticas: exemplo ilustrativo do contrato, matriz pareada/balanceada, privacidade, campos/tipos/refs/paths/hashes, revisão, pesos finitos, limites, CLI real, colisão/symlink e importação.
- `docs/benchmarks/v03/preflight.md` — uso, formato da entrada, limites, proveniência e ausência de execução.
- `docs/benchmarks/v03/contrato.md` — somente correção editorial da tabela de métricas: barras literais quebradas substituídas por `count(Dk ∩ R)`, `count(R)` e `count(C)`, preservando denominadores/fórmulas/semântica; alinhamento da tabela pelo Prettier.
- `tasks/50-v03-offline-benchmark-preflight-result.md` — este registro.

## Comandos e resultados

Diretório de trabalho de todos os comandos: `/mnt/d/Projects/MimirNL`. Runtime existente encontrado fora do PATH inicial: `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`.

```sh
git status --short
git branch --show-current
git rev-parse --short HEAD
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --version
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --test /mnt/d/Projects/MimirNL/test/benchmark-preflight.test.mjs
```

Base confirmada; Node `v24.22.1`; teste focado: 9 aprovados, 0 falhas, 0 ignorados.

```sh
PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH npm test
```

Exit 0. Inclui `npm run build`/TypeScript e todos os testes: 46 testes, 45 aprovados, 0 falhas, 1 ignorado (teste específico de aliases Windows no host Linux). O comando usa fixtures descartáveis da suíte existente; o protótipo não abre/cria banco, ingere fontes ou executa cenários.

```sh
PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH node --check /mnt/d/Projects/MimirNL/scripts/benchmarks/preflight.mjs
PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH node --check /mnt/d/Projects/MimirNL/scripts/benchmarks/preflight-cli.mjs
PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH node --check /mnt/d/Projects/MimirNL/test/benchmark-preflight.test.mjs
```

Todos exit 0.

```sh
PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH node /mnt/d/Projects/MimirNL/node_modules/prettier/bin/prettier.cjs --write /mnt/d/Projects/MimirNL/scripts/benchmarks/preflight.mjs /mnt/d/Projects/MimirNL/scripts/benchmarks/preflight-cli.mjs /mnt/d/Projects/MimirNL/test/benchmark-preflight.test.mjs /mnt/d/Projects/MimirNL/docs/benchmarks/v03/preflight.md
PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH node /mnt/d/Projects/MimirNL/node_modules/prettier/bin/prettier.cjs --check /mnt/d/Projects/MimirNL/scripts/benchmarks/preflight.mjs /mnt/d/Projects/MimirNL/scripts/benchmarks/preflight-cli.mjs /mnt/d/Projects/MimirNL/test/benchmark-preflight.test.mjs /mnt/d/Projects/MimirNL/docs/benchmarks/v03/preflight.md /mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato.md /mnt/d/Projects/MimirNL/tasks/50-v03-offline-benchmark-preflight-result.md
git diff --check
```

Prettier local fixado no projeto em 3.6.2, sem instalação ou rede. A versão preexistente do contrato (`git show HEAD:docs/benchmarks/v03/contrato.md`) passou na API `prettier.check` com parser Markdown; portanto, o desalinhamento detectado na primeira checagem foi introduzido pela correção inicial, não era falha preexistente. A primeira checagem identificou alinhamento da tabela corrigida; a tabela foi formatada isoladamente com a API do mesmo Prettier para preservar o resto do contrato. Checagem final focada e `git diff --check`: aprovados.

## Limitações e revisão independente

`structurally_valid` e elegibilidade para planejar não confirmam existência do commit, correspondência entre trecho e fonte real, validade das referências humanas ou autorização. Verifica-se somente o SHA-256 UTF-8 do excerpt recebido. `accepted`/`validated` são declarações do chamador; a revisão independente desta implementação foi aprovada na [Task51](51-v03-preflight-review-findings.md), restrita ao protótipo offline.

Plano contém apenas IDs, revisão, cenário, repetição, commit, posição, status e metadados fixos de bloqueio. Casos são ordenados por ID; repetições rotacionam ABC/BCA/CAB com deslocamento por caso, máximo 100 repetições e 1.000 runs. Não há promessa de balanço exato para repetições fora de múltiplos de três. Gold, tarefa, fontes, caminhos, notas, critérios e refs humanos não são copiados ao plano/stdout.

Nenhum corpus real foi aprovado ou avaliado; nenhum arquivo de fontes apontado pelos casos foi lido. Sem modelos, decisões de modelo/k/orçamento, contextos, gold exportado, histórico, seed ou adapters. Sem alteração de core/DB/CI/versão/dependências, casos/metodologia do amigo, hosts ou configurações. Sem novas matrizes Linux/Windows, host acceptance, pesquisa de tarifas ou downloads. `schemas:check` e `package:smoke` não se aplicam a esta entrega de scripts offline.
