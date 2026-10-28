# Task131 — preparação offline do piloto EF03

Estado: **pending_review132** e coordenação externa do supervisor. **0 chamadas de modelo/benchmark, 0 execuções Codex**; sem rede, instalação, delegação, commit/push/publicação ou autorização emitida. A autorização anterior do usuário continua válida no escopo descrito, mas esta tarefa entrega somente preparação. Não executar antes de review132 e supervisor.

Artefatos novos, raiz absoluta `/mnt/d/Projects/MimirNL`:

- `/mnt/d/Projects/MimirNL/scripts/benchmarks/ef03-pilot.mjs`: planejamento, reconstrução por `assembleOfflineContext`, validação integral/hash, autorização e sequência limitada.
- `/mnt/d/Projects/MimirNL/scripts/benchmarks/ef03-pilot-launch.mjs`: launcher fechado, sem efeitos no import/default/help; único caminho live recebe plano e autorização em caminhos fixos.
- `/mnt/d/Projects/MimirNL/test/benchmark-ef03-pilot.test.mjs`: sete testes novos offline, incluindo orçamento agregado do transporte com processo falso.
- `/mnt/d/Projects/MimirNL/tasks/131-ef03-pilot/plan.json`: configuração pública congelada, inventário SHA256 das entradas/código/runtime/binário, ordem e metadados dos quatro prompts.
- `/mnt/d/Projects/MimirNL/tasks/131-ef03-pilot/quality.json`: critérios pré-fixados externos aos prompts, avaliação independente após execução.
- `/mnt/d/Projects/MimirNL/tasks/131-ef03-pilot/authorization.schema.json`: schema proposto, não autorização.
- `/mnt/d/Projects/MimirNL/tasks/131-ef03-pilot/simulated-not-execution-proof.json`: quatro transportes falsos, explicitamente synthetic/not_execution_proof e actual_model_calls=0; nenhuma avaliação de qualidade.
- `/mnt/d/Projects/MimirNL/tasks/131-ef03-pilot/`: before.json, status-before.txt, preservation.json, delta.json, checks.json e logs de testes/lint/formato/diff.

## Plano congelado e identidade

SHA256 canônico do payload do plano (sem o campo sha256):
`563e6ce15517574b8ce01eb2dcae1970d218e7cd278115597f05a3ee866a11fb`.

SHA256 runner ef03-pilot.mjs:
`3aa120eb72e668ae37f95a6419c8727813a4c977c3f80e3b8fc36165fbbbde13`.

SHA256 launcher ef03-pilot-launch.mjs:
`f0668dd72d3849138898b00d846a7bd9595f452eed5b4fe78c0e484197c16a7e`.

Schema novo `ef03-pilot-plan-131-v1`; configuração do helper continua `offline-context-129-v1`/executable:false. O launcher não altera esse retorno nem usa manifesto histórico como autorização. `validatePlan` reconstrói o plano offline e exige igualdade canônica integral, incluindo inventário, limites, prompts e binários. Hashes de runtime e executável vêm dos arquivos existentes, sem executar Codex nem abrir autenticação. CLI local identificada pelo caminho versionado 0.164.0; sem discovery/login/calibração/version subprocess.

| Ordem | DEV público103 | Condição | Bytes do prompt |
| --- | --- | --- | --- |
| 1 | posição1 | preserve | 4065 |
| 2 | posição1 | exact-v1 | 2489 |
| 3 | posição3 | exact-v1 | 4676 |
| 4 | posição3 | preserve | 8193 |

Queries/pool/base e seleções recuperadas são as já fixadas no replay público103. Hashes completos das três entradas constam em `plan.json.inventory`: offline-manifest.json, position-01.json e position-03.json. Nenhum gold/holdout/evaluation privado aberto. Os testes provam que só retrieved perde objetos integralmente duplicados na base; todos os demais campos, fontes, pergunta, instrução de 120 palavras/citações e sufixo ABC são idênticos em cada par. Critérios, referências de review, autorização e configuração não entram nos prompts.

Modelo solicitado gpt-6.1-sol, reasoning low, transporte `codex-lean-jsonl-posix-1`, ignore-user-config/ephemeral/read-only/empty-cwd, apps/plugins/multi_agent desativados, argumentos registrados no plano com marcador de scratch próprio. Usa **o transporte e coletor usage ABC existentes**, sem nova autenticação/parser/model-tools. Adapter pequeno apenas limita stdout+stderr agregados a 64000 bytes e mata o grupo próprio ao exceder; nenhuma transcrição é gravada. Tools continuam detectadas pelo transporte auditado, com interrupção/invalidação; capacidades internas do host não são comprovadamente ausentes por essa configuração.

## Gates e execução futura única

Limites: quatro processos sequenciais; sem retry/fallback/warmup/substituição; 90s por chamada, 12min desde início do preflight, 32000 bytes por prompt e 64000 bytes agregados de captura por processo. Primeiro erro/timeout/tools/oversize encerra a sequência; restantes not_run. Tentativa é consumida antes de chamar transporte, inclusive falha de spawn. Progresso JSON seguro antes/depois de cada tentativa e heartbeat a cada 30s. Nenhum stderr/reasoning/collector ou erro bruto exportado.

O supervisor deve autenticar o parecer independente132 e criar **externamente**, após aprovação, o diretório pai Linux `/home/usuario/.local/share/mimir-ef03-pilot` com0700 e autorização `authorization-epoch1.json` com0600, ambos pertencentes ao usuário. Esses destinos não existem e não foram criados nesta tarefa. O launcher exige caminhos absolutos fechados, componentes sem symlinks/traversal, Node persistente v24.22.1 Linux x64, hashes de entradas/código/binário/runtime e destino final inexistente. Cria marker exclusivo `epoch1-consumed.json` antes de qualquer spawn; não remover/recriar para repetir. Destino e arquivos próprios exclusivos0700/0600; nenhum clobber. Scratch vazio é removido no finally. Em falha de filesystem após consumo, reportar e parar: não repetir.

Parecer esperado: `/mnt/d/Projects/MimirNL/tasks/132-ef03-four-call-pilot-review-findings.md`. A autorização deve vincular seu SHA256 exato, plan_sha256, review_task132, epoch1, max_attempts4 e destino fixo, com autor/revisor/supervisor distintos. O launcher verifica conteúdo/hash/permissões; autenticação da identidade/decisão do revisor cabe à coordenação externa do supervisor, como no contrato anterior. Não há gerador nem autoaprovação.

Exemplo **SOMENTE PROPOSTO/INVÁLIDO**, deliberadamente recusado pelo campo verdict; não foi criado arquivo de autorização:

```json
{
  "schema_version": "ef03-pilot-authorization-131-v1",
  "plan_sha256": "563e6ce15517574b8ce01eb2dcae1970d218e7cd278115597f05a3ee866a11fb",
  "review_task": 132,
  "review_sha256": "PENDING_REVIEW132",
  "reviewer_ref": "PENDING-REVIEWER",
  "supervisor_ref": "PENDING-SUPERVISOR",
  "verdict": "PROPOSED_INVALID",
  "epoch": 1,
  "max_attempts": 4,
  "output": "/home/usuario/.local/share/mimir-ef03-pilot/epoch1-dev13-20261028"
}
```

Comando futuro exato, **não executado**, somente supervisor após review132 e autorização externa válida:

```bash
/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/ef03-pilot-launch.mjs --live /mnt/d/Projects/MimirNL/tasks/131-ef03-pilot/plan.json /home/usuario/.local/share/mimir-ef03-pilot/authorization-epoch1.json
```

Resultados normalizados futuros: `/home/usuario/.local/share/mimir-ef03-pilot/epoch1-dev13-20261028/results.json`. Somente resposta final, hashes/bytes, status, identidade/modelo solicitado/observado ou null e usage allowlisted input/output/cached/total/uncached (cache é subconjunto de input), tempos e contadores. `actual_model_calls` é contagem conservadora de tentativas de transporte; falha de spawn não prova inferência. Nada de piso inferido/subtração de contexto host. Custo/TTFT/cache savings null. retrieval_latency null/N_A, pois não se chama Search nem Service; não é medição end-to-end do Service. setup_ms inclui montagem/hash/preflight; context_ready_transport_ms começa imediatamente antes do transporte, transport_ms vem do transporte se exposto; elapsed_since_preflight_ms inclui setup. Não atribuir esses resultados à104/129 nem a holdout; fontes conhecidas, alto overlap intencional, uma observação por condição e ordem operacional balanceada, sem controle de cache/generalização.

## Verificação e preservação

Runtime em todos os checks: `/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`. Comandos/checks finais registrados em checks.json e logs absolutos sob131-ef03-pilot:

- `--test` nos testes benchmark-ef03-pilot, benchmark-offline-context, benchmark-abc e benchmark-codex-usage: exit0, **28/28**, somente fakes.
- ESLint nos dois módulos novos e teste: exit0. Primeira passagem detectou variável não usada, corrigida antes de congelar hashes; segunda passagem limpa.
- Prettier check dos códigos/teste/plan/quality/schema: exit0. Primeira passagem pediu formato do plan.json; corrigido, hash canônico preservado.
- `git diff --check`: exit0.
- Comparação SHA256 contra baseline real dirty/untracked: **85 arquivos preexistentes preservados, zero divergências**, exit0. Nenhuma alteração em core/policy108/config/AGENTS/package/deps/CI, históricos, snapshots ou manifesto103/104. before.json e status-before.txt foram capturados antes da criação do código; diretório próprio de auditoria já existia no status.

Delta contém apenas novos artefatos desta tarefa; não inclui autorreferências de inventário. Revisão132 deve cobrir todo código novo, adapter de limite, schema/gates, critérios e plano congelado. Após callback, não executar live nem suíte adicional nesta tarefa.
