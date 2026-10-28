# Task75 — Resultado de implementação

Implementado o fluxo contínuo em arquivos próprios, sem alterar runners,
coletor, core, dependências, CI, configuração global ou arquivos Task76.
Nenhum modelo foi chamado, nenhum subagente criado e nenhum commit/push feito.

Entregas:

- `/mnt/d/Projects/MimirNL/scripts/benchmarks/live-flow-probe.mjs`
- `/mnt/d/Projects/MimirNL/test/benchmark-live-flow.test.mjs`
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/fluxo-completo.md`
- `/mnt/d/Projects/MimirNL/tasks/75-v03-continuous-flow-result.md`

`runFlow({host='codex',out,transportImpl,clock,corpus,prepare,loadAdapter})`
e `argsCodex(scratch)` exportados. As últimas três opções são injeções offline.
O adaptador AG é importado antes de qualquer fixture/output e deve exportar
transport/MODEL conforme Task76. Nenhuma dependência do código AG é necessária
nos testes offline desta task.

Cada B usa novo Service/banco/projeto Git sintético com seis candidates/user,
busca real dentro do intervalo monotônico contínuo e chamada imediata após
validação/serialização/evidência local. Setup e fechamento ficam fora do total.
Plano inicial não contém hashes de retornos futuros; run-context-N precede a
chamada N. Summary não fabrica usage/total/cache, custo, TTFT ou percentuais.

Validação com Node absoluto v24.22.1:

```sh
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --test test/benchmark-live-flow.test.mjs test/benchmark-context-selection.test.mjs test/benchmark-paired-probe.test.mjs test/benchmark-codex-usage.test.mjs
```

25 testes passaram (5 novos e 20 de compatibilidade). Os novos cobrem Service
real no fluxo, sequência e relógio determinístico, seis posições, integridade,
fontes sem duplicação, vazio sem substituição, interface AG fake, usage parcial,
cache/total desconhecidos, falha de busca, fechamento com erro, status timeout,
limite global, permissões, exclusividade, limpeza, import/help e ausência do
adaptador antes de setup. Bounds/kill/parser são cobertos pelos testes de
compatibilidade do transporte/coletor aprovado. Syntax, Prettier dos quatro
arquivos e diff whitespace conferidos. Sem suíte ampla ou build concorrente.

Execução futura, somente após revisão independente coordenada pelo supervisor:

```sh
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/live-flow-probe.mjs --run --host codex --out /tmp/mimir-flow-codex-NOVO
```

Qualidade das respostas e medição live continuam pendentes. O runner confia no
contrato do adaptador revisado para metadados allowlist e semântica nativa AG;
não há equivalência presumida entre modelos/hosts. Plano AG registra argumentos
como propriedade do adaptador, sem inventar flags enquanto ele é desenvolvido.
