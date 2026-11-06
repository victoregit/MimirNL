# Task49 — Resultado

Concluída a entrega DOC-only na branch `docs/v03-contrato`, sem commit/push.

- Proposta v0.1: [contrato](../docs/benchmarks/v03/contrato.md), ainda não aprovada.
- Inclui campos/tipos/obrigatoriedade, dois JSONs sintéticos, revisão de fontes/gold, manifesto dos três cenários, isolamento, comparação pareada, métricas/denominadores, tokens/custos e política de autorização/versionamento.
- Exemplo de resultado permanece `not_run`, sem valores alegando medição; fonte/commit do caso são fictícios e explicitamente excluídos do corpus.
- Pendentes: acordo e aceite humano; casos/splits/gold; k e limites de contexto/saída/chamadas/tempo/custo; modelo/parâmetros/ferramentas/cache; histórico/snapshots; permissões e proveniência das tarifas. Piloto 3–5 casos × 3 repetições pareadas é sugestão a acordar.

Checks focados:

- Diagnóstico Python em memória: os dois blocos JSON passaram `json.loads`; hash SHA-256 do trecho, formato 40 hex e métricas null/not_run conferidos. Não foi criado parser/schema/executor.
- Prettier local 3.6.2: formatação e check limitados aos dois documentos desta entrega, aprovados.
- `git diff --check` e verificação de whitespace dos documentos novos com `git diff --no-index --check`: aprovados.
- Runtime existente `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node` usado explicitamente, pois `node` não estava no PATH; nenhuma configuração alterada.

Preservados `AGENTS.md` modificado e `/mnt/d/Projects/MimirNL/tasks/49-v03-benchmark-contract.md` preexistente. Não foram criados/editados casos/metodologia do amigo; não houve mudança de código, testes de aplicação, checks amplos, execução de benchmark/modelo, ingestão, host, roadmap ou configuração. Callback ao terminal `dbfe79b6` integra a conclusão operacional da entrega.

Ajuste de portabilidade: links Markdown relativos ao repositório; fontes dos casos usam paths relativos à raiz e identidade portátil; `local_roots` no manifesto mapeia a raiz absoluta de cada máquina.
