# Task85 — Implementação offline entregue para revisão Task86

Implementação e validação offline concluídas em 2026-10-27. Revisão independente pendente; este resultado não é autoaprovação. Nove casos development permanecem pending, sem mudanças em gold, aceite ou referências humanas. Nenhuma chamada a modelos/hosts, configuração global, DB pessoal, benchmark de modelos, alteração core/CI/deps, commit/push/merge ou subagente.

## Arquivos novos desta entrega

Todos sob `/mnt/d/Projects/MimirNL`:

- `/mnt/d/Projects/MimirNL/scripts/benchmarks/public-bundle.mjs`: schema público estrito/puro, hashes públicos canonicalizados, protocolo/limites e bloqueio independente do gold.
- `/mnt/d/Projects/MimirNL/scripts/benchmarks/offline-files.mjs`: I/O explícito, guardas de caminhos/symlinks, entradas UTF-8, diretório exclusivo privado, wx e publicação atômica do pacote.
- `/mnt/d/Projects/MimirNL/scripts/benchmarks/export-cases.mjs`: carregamento privado legado de bloco JSON único, validação 6/9 por API, conferência Git/bytes/ranges/blob/worktree, projeção profunda allowlist.
- `/mnt/d/Projects/MimirNL/scripts/benchmarks/export-cases-cli.mjs`: CLI privado exige seis casos JSON + três originais Markdown e protocolo/raiz/destino explícitos.
- `/mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-runner.mjs`: API/CLI público somente plan/simulate, matriz/subconjuntos/AB-BA/limites, fixtures Git/Service/Storage reais por B, fake neutro e evidência por posição.
- `/mnt/d/Projects/MimirNL/test/benchmark-public-multicase.test.mjs`: 17 testes novos offline, incluindo processo isolado e inspeção de seeds/histórico reais.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/protocolo-ampliado.json`: nove consultas/pools fixos, k/limit=4, tokenBudget/contexto=32000 bytes, 120 palavras, status proposto.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/executor-multicaso.md`: fronteiras, schema, comandos absolutos, semântica dos resultados e limitações.
- `/mnt/d/Projects/MimirNL/tasks/85-v03-public-export-multicase-result.md`: este resultado.

Nenhum runner/coletor anterior foi alterado. Alterações dirty preexistentes, AGENTS, documentos originais e fontes foram preservados. A Task86 apareceu no checkout durante o trabalho e foi preservada sem edição.

## Evidência real local, sem gold

Comandos absolutos completos no guia [executor-multicaso.md](../docs/benchmarks/v03/executor-multicaso.md). Execução final com Node `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`:

| Artefato                                             | Resultado                                                                           |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `/tmp/mimir-task85-final-public/bundle.json`         | 9 casos, schema public-cases-1, executable=false, caller-unverified                 |
| `/tmp/mimir-task85-final-plan/plan.json`             | 54 posições not_run, 9 casos × 3 repetições × 2 braços, zero chamadas               |
| `/tmp/mimir-task85-final-simulation/plan.json`       | matriz original completa conservada                                                 |
| `/tmp/mimir-task85-final-simulation/simulation.json` | 54 simulated, simulated_count=54, actual_model_calls=0, 27 buscas reais em fixtures |
| `/tmp/mimir-task85-final-simulation/context-N.json`  | 54 envelopes públicos, histórico vazio, IDs/caminhos de casos excluídos do contexto |

SHA-256 público: `daaaf6cb68617339155892de592f444f65b1ec102d0f8b700f03682ea3d0d0d7`. Exportações inicial e final produziram o mesmo hash. Os destinos anteriores `/tmp/mimir-task85-{public,plan,simulation}` também foram mantidos, sem overwrite. Diretórios 0700 e JSONs 0600; todas as fixtures `slot-N` foram removidas. As fontes foram verificadas no pin `166e3cf047b2078952e43dc8e9171e053e99e2ce` e nos arquivos correntes, sem normalizar bytes. O runtime não recebeu corpus privado, Markdown, protocolo separado ou gabaritos.

Simulação não é execução real: `not_execution_proof=true`, uso null/unavailable e nenhuma métrica de qualidade, economia, custo ou TTFT. O negativo de p95 produziu retornos lexicais reais nos testes, preservados sem impor vazio a partir de R. Isso é diagnóstico de funcionamento, não avaliação da qualidade da seleção.

## Validação

- Focados: 15/15 passaram antes das duas verificações adicionais; as 17 verificações finais passaram na suíte completa. O teste de processo isolado também foi executado sozinho após corrigir o próprio harness para permitir os acessos de código e o `git rev-parse` legítimo da fixture.
- `PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH npm test`: build + 99 testes, **98 passaram, 1 skip existente, zero falhas**. Log final privado: `/tmp/mimir-task85-npm-test-final.log`. A primeira suíte teve falha apenas no novo harness de restrição de subprocessos; a repetição foi motivada por sua correção e pelo endurecimento do ambiente Git, não por coleta de benchmark.
- `node --check` dos cinco módulos novos: passou.
- Prettier direcionado aos cinco módulos, teste e dois documentos: passou; este resultado também formatado/verificado.
- `git diff --check`: passou. Nenhuma suíte ampla adicional após o resultado final verde.

Cobertura significativa: canários em respostas/critérios/rubricas/revisão/referências/permissões; campos privados estruturais inválidos geram somente erro fixo; alterar somente privados não altera pacote/hash; schema público recusa objetos privados/extras/tampering; Git/ranges/paths/arquivos alterados/symlinks; permissões/exclusividade/limpeza própria; import/help sem I/O; runtime subprocesso limitado a pacote público/código/fixtures; seeds e histórico reais candidate/user; consultas/pools corretos, A completo/B retornos; ausência sem oracle; contagem retrieval=1 em B e timer contínuo; orçamento/not_run/infeasible; falhas sanitizadas e nenhum modo live.

## Limitações e próximo gate

Só development, API de exportação para seis ou nove casos e CLI para nove. SHA-256 é integridade, não autenticação/aceite. Parâmetros são propostos; nenhum pacote concede autorização real. Os braços experimentais não substituem os três cenários do contrato 0.1. Teto de contexto considera o envelope inteiro e pode tornar braços inviáveis. A instrução de 120 palavras não limita cobrança de API.

Orçamento de tempo é verificado entre fases, sem cancelamento preemptivo de SQLite/fake em andamento. Empates do ranking atual podem depender dos IDs aleatórios das fixtures; o plano é determinístico, não há promessa de seleção determinística. O transporte extensível nesta entrega aceita somente fake declarado com marcador neutro, sem bridge de host. Paths/IDs de bookkeeping ficam nos artefatos locais; a interface de transporte recebe apenas prompt/histórico vazio.

Retornar para revisão independente **Task86**, sem novos modelos/hosts. Etapa live posterior exige manifesto/aceite/permissões/orçamento, bridge e revisão próprios. Não houve alteração de ranking, chunking, fallback, orçamento adaptativo ou fabricação de accepted/validated.

## Encerramento pelo supervisor — 2026-10-27

Task86 emitiu APPROVE sem pendências de código ou teste; parecer em [86-v03-public-export-multicase-review-findings.md](86-v03-public-export-multicase-review-findings.md). O revisor reproduziu exportação, plano e 54 simulações, confirmou o digest público e registrou 98 testes aprovados, 1 skip preexistente e zero falhas. São 27 buscas em fixtures descartáveis e zero chamadas reais a modelos; esta entrega não mede economia real. Casos continuam pendentes e o executor permanece exclusivamente offline. Git diff --check passou no encerramento; sessão cao-mimir sem workers auxiliares. Sem commit ou push. Próxima etapa técnica: transporte real multicaso revisado e definição do manifesto, aceite e orçamento do piloto.
