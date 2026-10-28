# Task88 — Parecer independente da Task87

**Veredito:** `APPROVE`

Encaminhado ao supervisor. Esta revisão independente avaliou a bridge Codex multicaso e o manifesto de piloto entregues na Task87, baseando-se estritamente em inspeção de código e testes offline. Não foram realizadas chamadas a modelos reais (`actual_model_calls=0`), nem subagentes, nem alterações de código ou commit/push. Credenciais, .env e chaves permanecem intocados.

## 1. Fronteira pública e isolamento de processos
- **Ausência de vazamento de dados privados:** `scripts/benchmarks/multicase-codex.mjs` e `scripts/benchmarks/multicase-codex-transport.mjs` não importam corpus privado, loaders legados nem arquivos de gold. Consomem apenas o bundle público explicitamente informado via `--bundle` e o manifesto via `--manifest`.
- **Envelope e scratch limpos:** Em `promptFor` (`scripts/benchmarks/multicase-runner.mjs:88-105`), o prompt é composto unicamente por `instruction`, `question`, `sources` públicas e `history: []`. Case IDs, classes, posições e status não entram em `prompt`, `argv`, `seed` nem `cwd`. O diretório `scratch` é criado vazio e com nome ordinal opaco (`slot-N/scratch`) em permissão 0700 (`multicase-codex.mjs:199-207`).
- **Recusa de instruções ambientais:** O validador percorre os ancestrais do destino de saída e recusa preventivamente a presença de `AGENTS.md` ou `AGENTS.override.md` sem abri-los (`multicase-codex.mjs:122-130`), prevenindo injeção acidental de diretrizes de projeto.

## 2. Manifesto estrito, integridade e autorização operacional
- **Validação prévia estrita:** `validateManifest` (`multicase-codex.mjs:66-152`) valida todos os campos contra allowlist (`exact`), exige `schema_version: "codex-multicase-plan-1"`, `status: "proposed"`, paridade de hash do bundle, configuração imutável de host (`HOST`) e braços (`ARMS`). A integridade é assegurada pelo `sha256` canônico do corpo do manifesto antes de qualquer criação de arquivos ou subprocessos.
- **Fail-closed e ausência de bypass:** A CLI não possui parâmetros de force/skip. O comando `--run` exige `--authorize-plan <SHA256>` idêntico ao hash do plano validado (`multicase-codex.mjs:168, 332-343`). A validação por `--validate` nunca dispara spawn nem cria saída (`multicase-codex.mjs:347-356`). O manifesto proposto não se autoatribui aprovação humana.
- **Host e comandos imutáveis:** O executável é fixo na release oficial (`multicase-codex-transport.mjs:4-12`), sem uso de shell (`spawnImpl` com argumentos congelados), sem permitir comandos dinâmicos no manifesto.

## 3. Transporte, ciclo de vida e captura de métricas
- **Braços A e B:** O braço A consome o pool público completo. O braço B instancia `Service`/`Storage` em fixture SQLite descartável e temporária, com uma única busca real (`retrieval_calls: 1`) e validação estrita contra o pool (`validateSelection`). O timer contínuo de B (`end_to_end_ms`) engloba desde o início da busca até a coleta do stream, mantendo setup e teardown isolados fora da medição (`multicase-codex.mjs:208-225, 275, 306-316`).
- **Encerramento de árvore e timeout:** O transporte dispara processo desacoplado (`detached: true`) e, em caso de timeout, cancelamento (SIGINT/SIGTERM) ou saturação de stream, elimina o grupo de processos POSIX com `SIGKILL` (`process.kill(-child.pid, "SIGKILL")`, `multicase-codex-transport.mjs:71-80`), impedindo processos zumbis ou descendentes com pipes abertos.
- **Sem retry e preservação de evidência:** Falha de host, turn, erro de JSONL ou teto de contexto (`infeasible`, sem truncamento) interrompem o ciclo imediatamente (`halted = true`), marcando posições subsequentes como `not_run` com exclusão fundamentada. O resultado parcial e contextos são salvos no destino privado (`wx`, 0600) via bloco `finally`.
- **Separação de modelos e detecção de ferramentas:** Modelo solicitado (`gpt-6.1-sol`) e observado (`public-host-reported` vs `unavailable`) são rigidamente segregados (`multicase-codex-transport.mjs:129-136`). Invocação de ferramentas desconhecidas classifica o slot como `invalid_tools` (`multicase-codex-transport.mjs:137-140, 176-177`). Fakes/simulações mantêm `actual_model_calls: 0`, `completed_calls: 0`, `not_execution_proof: true` e `usage_status: "synthetic-test"`.

## 4. Verificação offline executada
- **Testes novos (12/12):** `node --test test/benchmark-multicase-codex.test.mjs` — todos os 12 testes passaram com sucesso (incluindo teste de isolamento adversarial que restringe o I/O apenas ao bundle e manifesto explícitos, sem allowlist ampla de `.json`/`.md`).
- **Regressão focada (41/41):** `node --test test/benchmark-multicase-codex.test.mjs test/benchmark-public-multicase.test.mjs test/benchmark-codex-usage.test.mjs test/benchmark-live-flow.test.mjs` — 41/41 testes passaram.
- **Reprodução offline:** Exportação dos 9 casos em `/tmp` exclusivo produziu digest `daaaf6cb68617339155892de592f444f65b1ec102d0f8b700f03682ea3d0d0d7`. A validação via CLI do manifesto proposto gerou `plan_sha256: 95870f259e83fb5b4ea4dab50de654a61258474e9ec9b6de2baf9bbd2c2216c5`, 4 posições, status `proposed` e `actual_model_calls: 0`. Tentativas de `--run` sem autorização ou com hash divergente falharam imediatamente sem criação de arquivos.
- **Sintaxe e diff:** `node --check` e `git diff --check` concluídos sem desvios.

## 5. Limitações e recomendações ao supervisor
1. O orçamento monetário do piloto é desconhecido; a autorização humana futura deve fixar teto de gastos e permissão de rede/host explicitamente.
2. O sandbox read-only do host não substitui a necessidade de verificação operacional das permissões do ambiente antes da execução de modelos reais.
3. Não há alegação de ganho de qualidade ou economia real nesta etapa. Casos e gold permanecem em status `pending`/`development`.
