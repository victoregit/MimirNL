# Task59 — entrega para revisão independente

Implementado sem chamadas de modelo ou criação de subagentes; sem commit/push/merge. Dirty preexistente preservado, branch mantida. Nenhuma alteração no core, CI, package, preflight ou metrics.

## Arquivos entregues

- `/mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage.mjs`: normalizador puro de um turn, usage validado, cache como subconjunto, terminalidade e relatório allowlist.
- `/mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage-cli.mjs`: stdin JSONL limitado, parsing chunkado/UTF-8/CRLF, relógio monotônico injetável, diagnósticos fixos, stdout ou criação exclusiva wx/0600.
- `/mnt/d/Projects/MimirNL/test/benchmark-codex-usage.test.mjs`: sete testes offline com fixtures sintéticas e subprocessos somente da CLI local.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/tokens-tempo.md`: contrato experimental, limites, semântica temporal, privacidade e pipeline futuro de pergunta única.
- `/mnt/d/Projects/MimirNL/tasks/59-v03-token-time-collector-result.md`: este registro.

## Checks executados

Runtime: `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node` (v24.22.1).

- `codex --version`: codex-cli 0.164.0; `codex exec --help` confirma `--json`. Não executado `codex exec` com pergunta.
- `node --check` nos dois módulos: passou.
- `node --test test/benchmark-codex-usage.test.mjs`: 7/7 passaram na versão final.
- Prettier focado nos dois módulos, teste e documentação: passou.
- `git diff --check`: passou.
- `npm test` uma vez com runtime indicado no PATH: build passou, 57 testes totais, 56 passaram, 1 skip, zero falhas. Esta execução antecedeu a adição do sétimo teste focado de importação/terminalidade; esse teste passou no comando focado final.

Fixtures cobrem canários privados em eventos extras/respostas, deduplicação/terminalidade, safe integers e overflow, cache, zero versus ausência, falhas, cronologia, chunks com UTF-8/CRLF, entrada inválida/vazia, erro stdin, limites, importação sem efeitos e output existente/symlink/permissões.

## Limitações e próximo passo

Adaptador experimental sem schema oficial local confirmado; validado por fixtures sintéticas. Uso é reportado pelo host, não prova de cobrança/modelo/correção. TTFT e custo indisponíveis. Tempo do stdin inclui pipeline/buffering e não identifica replay. O coletor aguarda EOF; não oferece timeout de produtor inativo. Permissões efetivas dependem do filesystem. Contadores por turn não devem ser somados como sessão sem confirmar semântica incremental/cumulativa.

Retornar para revisão independente Task60 antes de qualquer chamada real. Nenhum piloto completo foi autorizado ou executado por esta entrega.
