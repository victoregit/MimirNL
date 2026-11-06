# Parecer Independente — Task 109: Revisão do Executor ABC e Manifesto (Task 103)

- **Data**: 2026-10-27
- **Revisor**: Antigravity (Code Reviewer Agent)
- **Alvo**: Implementação, testes, manifestos e evidências da Task 103 (`scripts/benchmarks/abc-*.mjs`, `test/benchmark-abc.test.mjs`, `docs/benchmarks/v03/executor-abc-0.2.md`, manifestos em `docs/benchmarks/v03/evidencias/task103/public-plan/`)
- **Veredito**: **`CHANGES_REQUESTED`** (Código, testes, gates e manifestos aprovados; bloqueio estrito pela pendência de persistência de `/mnt/d/Projects/MimirNL/tasks/103-v03-abc-runner-result.md`)
- **Chamadas a modelo real**: `actual_model_calls: 0`

---

## 1. Hashes e Integridade dos Arquivos Revisados

A revisão inspecionou os codepaths do runtime público, exportador privado, manifestos e testes. O core da Task 102 permaneceu rigorosamente congelado com os hashes aprovados na Task 108:

- `src/retrieval/index.ts`: `f0021222bf83fc5d02818a3c73ac03a4cdde1c33eb2cebb5a421ef5dd1f47d30`
- `src/core/service.ts`: `dd46662d03ef022cea70e35e7276e789a2f4e69c1c11a1af3f3563f9e71e9e94`
- `src/optimization/index.ts`: `4dd5c182ae7631169dab169c44b90d177ded821d9250e61975aaed85d65412fc`
- `src/core/schemas.ts`: `2b3cf8e9a9a0f54e1547776c20f00e9437089102c318673111c086450da16e9c`
- `scripts/benchmarks/abc-cli.mjs`: `c539dd895efadad3f6b4b4dd4f958742588c422aa91187ebdfb7c258d4ae7cb5`
- `scripts/benchmarks/abc-export.mjs`: `fbc7ec48c77ea1dfb60166a939fbfb61d4791a82ef45b5be3d0016a2cc6dfa42`
- `scripts/benchmarks/abc-private-cli.mjs`: `fc575ba800f13524b0a886f44f910404495b4cbdf520422c54d76203cf97e20b`
- `scripts/benchmarks/abc-public.mjs`: `95bc8bf6424564c8d5045610738e404bca7d42cfb2d0752538186f81156fe4fc`
- `scripts/benchmarks/abc-runtime.mjs`: `8e6c466986fa88f91db7998b47936495beea8380e227092c2daef1b41e8c0571`
- `scripts/benchmarks/abc-transport.mjs`: `8a186dcf2ebae5669b910e5256e09e03d49b06ce2e03aa3597d519be9485bb21`
- `test/abc-fixture.mjs`: `11bf9841804d9c490ff1966a3473950fb20e9858544c0bf49ba3268809ff4fe4`
- `test/benchmark-abc.test.mjs`: `90ca9e14a1c1d530f6120b0b8c2beea2163b715694c9e836171f251f98d752f9`
- `docs/benchmarks/v03/executor-abc-0.2.md`: `1607593c6f37ee0572e0081bf4ef8c8f070198031d2ba7b2c01d9f056d959f63`

### Manifestos da Task 103 (`docs/benchmarks/v03/evidencias/task103/public-plan/`):
- `offline-manifest.json` (SHA256 arquivo: `c4af7a6c2107036d263199a1c648b066ddc3bd05261f2b0e695795251587ddea`):
  - Canonical SHA256: `a2d46641efa2d8b1752760b88c9136d21cbd376b035a248f1e83e3c2e2274651` (`stage: validate`, `synthetic: true`).
- `proposed-run-manifest.json` (SHA256 arquivo: `84214d6b70e058bfae8081d77c5935a15d0103f8753210bc43f2d6a3b620bf21`):
  - Canonical SHA256: `e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92` (`stage: run`, `synthetic: false`).

---

## 2. Conformidade dos Requisitos Técnicos

### 2.1 Separação de Runtime Público e Coordenador Privado
- **Isolamento de Dados**: Em `scripts/benchmarks/abc-export.mjs:43-52`, a projeção pública de cada requisição retém apenas `scenario`, `task`, `query`, `pool` e `base`. IDs de caso, splits, respostas esperadas, rubricas e recibos ficam exclusivamente no `coordinator.json` privado (`mode 0700`, `abc-private-cli.mjs:33-36`).
- **Bloqueio de I/O Não Autorizado**: Os codepaths públicos não importam módulos privados nem abrem arquivos arbitrários. Os testes canários em `test/benchmark-abc.test.mjs:247-280, 325-346` interceptam chamadas FS e comprovam o bloqueio de nomes `.json` ou `.md` arbitrários.
- **Parser Estrito de JSON**: `parseStrictJSON` (`scripts/benchmarks/abc-public.mjs:205-274`) rejeita chaves duplicadas (inclusive formas unicode escapadas como `\u0061`), caracteres de controle e tokens inválidos antes de entregar o payload ao validador.

### 2.2 Tratamento dos Braços ABC, Deduplicação e Busca Real B
- **Equivalência A e C**: Braço A (`sem_memoria`) e Braço C (`historico_completo`) usam exatamente a mesma base de contexto e histórico vazio (0 bytes, SHA256 `e3b0c442...`), sem mutações ou preenchimento de histórico.
- **Busca Real no Braço B (`com_mimir`)**: Executada em `scripts/benchmarks/abc-runtime.mjs:160-195`. Para cada requisição B, realiza uma busca real SQLite `memory_search` com os parâmetros congelados na Task 102 (`balanced-v1`, `verified-ties-v1`, `compact-v1`, `telemetry: false`, `limit: 3`, `tokenBudget: 32000`).
- **Preservação de Sobreposição e Retorno Vazio**: `runtimeEnvelope` preserva as fontes base e acrescenta os itens recuperados sem deduplicação destrutiva prévia contra a base. Consultas que retornam vazio permanecem como lista vazia (`retrieved: []`), sem qualquer fallback artificial ou consulta a gold/oracle.
- **Isolamento e Reset de Banco**: Cada uma das 54 posições cria um banco SQLite em diretório descartável `fixture-` (`mode 0700`), registra `initial_db_sha256`, semeia as memórias do pool como `candidate/user`, valida integridade via `seed_sha256`, e ao final fecha o serviço, mede `final_db_sha256`, calcula o hash físico `db_file_sha256` e remove o diretório temporário no bloco `finally`.

### 2.3 Orçamentos, Timers e Ciclo de Vida de Processos
- **Limites Globais e Locais**:
  - Limite por chamada: 90.000 ms (`LIMITS.call_ms`).
  - Limite por posição: 120.000 ms (`LIMITS.run_ms`), englobando setup, I/O, busca e cleanup.
  - Limite por busca: 5.000 ms (`LIMITS.search_ms`).
  - Limite global do lote: 7.200.000 ms (120 minutos, `LIMITS.global_ms`).
  - Contexto: teto rígido de 32.000 bytes UTF-8 (`LIMITS.context_bytes`). Excedentes disparam erro `infeasible` imediato.
  - Captura: teto de 64.000 bytes UTF-8 (`LIMITS.capture_bytes`). Respostas acima desse teto são marcadas `truncated: true` e `response: null`.
- **Honestidade em Operações Síncronas**: Operações SQLite e serialização não-preemptíveis verificam o relógio antes de invocar o transporte (`abc-runtime.mjs:157, 209`). Se o prazo expirou, a tentativa não é disparada e o status é registrado como `run_timeout` ou `search_timeout`.
- **Política Zero-Retry e Interrupção Global**: Qualquer erro de transporte, busca, estouro de orçamento ou cancelamento encerra o loop de execução (`halt = true`), preservando todas as posições subsequentes como `status: "not_run"`, sem tentativas forçadas de recuperação.
- **Cancelamento e Eliminação de Grupo de Processos**: O transporte cria processos com `detached: true` e mata todo o grupo de processos (`process.kill(-child.pid, "SIGKILL")`) em caso de timeout, cancelamento (SIGINT/SIGTERM) ou detecção de ferramentas (`abc-transport.mjs:74-83`).

### 2.4 Host Codex, Tools e Projeção de Segurança
- **Significado de `tools: []`**: Documentado com precisão em `docs/benchmarks/v03/executor-abc-0.2.md:17-19` e no manifesto (`"tools_meaning": "no-authorized-use; internal-capabilities-remain"`). O sistema não faz afirmações infundadas de ausência de capacidades internas do executável Codex.
- **Enforcement Observável**: O prompt injeta a instrução explícita de não usar ferramentas. O coletor inspeciona eventos do stream JSONL linha a linha (`abc-transport.mjs:140-145`); qualquer evento fora de `agent_message` ou `reasoning` ativa `tools = true`, interrompe o grupo de processos imediatamente e invalida a tentativa.
- **Segurança de Host**: O binário Codex recebe flags estritas (`--ignore-user-config`, `--ephemeral`, `--sandbox read-only`, `--cd scratch`, `--disable apps`, `--disable plugins`, `--disable multi_agent`). O transporte POSIX recusa expressamente execução em ambientes não-Linux (`abc-runtime.mjs:59-60`).

---

## 3. Verificação do Plano e Manifesto para a Task 104

O plano para a avaliação limitada da Task 104 foi validado em `docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json`:
- **Total de posições**: 54 tentativas (concorrência 1, zero retry).
- **Divisão**: 27 posições development (9 casos × 3 braços × 1 repetição) + 27 posições evaluation (3 casos × 3 braços × 3 repetições).
- **Distribuição de braços**: 18 requisições `com_mimir`, 18 `sem_memoria`, 18 `historico_completo`.
- **Rotação de ordens**: 18 blocos de 3 chamadas cobrindo permutações determinísticas ABC, BCA e CAB com entradas públicas idênticas entre os braços de cada bloco.
- **Hash Canônico**: `e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92`.
- **Destino e Limites**: Diretório novo exclusivo a ser fornecido na autorização, sem reutilização de diretórios existentes. Autoexecução proibida; aguarda autorização formal externa vinculada ao hash pelo supervisor.

---

## 4. Testes e Evidências Executadas

1. **Testes Focados (`test/benchmark-abc.test.mjs`)**:
   - Executados com Node Linux v24.22.1 (`/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`): **10 pass, 0 fail**.
   - Cobertura: validação de schemas, autorização estrita, 54 posições offline com 18 buscas SQLite reais, ausência de retry após falhas/truncamento/ferramenta, respeito a timers síncronos, preservação de busca vazia, isolamento de canários de I/O, cancelamento SIGINT e terminação de grupo de processos.
2. **Testes do Core (`test/core-v03.test.mjs`)**: **6 pass, 0 fail**.
3. **Suíte Completa Linux (`docs/benchmarks/v03/evidencias/task103/fullsuite-linux-final.log`)**:
   - **141 pass, 1 skipped** (teste de alias Windows no filesystem Linux), 0 fail.
4. **Verificações Estáticas**:
   - `tsc --noEmit` (`typecheck.log`): OK (0 erros).
   - `eslint src` (`lint.log`): OK (0 advertências).
   - `npm run schemas:check` (`schemas.log`): OK (schemas MCP sincronizados).
   - Validação Windows do manifesto (`windows-validate.log`): `sha256: a2d46641...`, `actual_model_calls: 0`.
5. **Reprodução Offline Durável (`docs/benchmarks/v03/evidencias/task103/offline-replay/`)**:
   - 54 posições executadas com `results.json`: `actual_model_calls: 0`, `synthetic_transport_calls: 54`, `retrieval_calls: 18`, `stopped: false`.

---

## 5. Pendências e Ação Corretiva Exigida

Apesar de a implementação de código, testes e evidências atender a todos os requisitos técnicos da emenda 0.2:

- **Item Faltante**: O relatório formal `/mnt/d/Projects/MimirNL/tasks/103-v03-abc-runner-result.md` não foi encontrado gravado no repositório. O processo do desenvolvedor atingiu o limite de taxa de tokens/uso do provedor no momento final da entrega, deixando este documento ausente do disco.
- **Critério de Aceite da Tarefa 103 e Tarefa 109**: A especificação exige explicitamente a entrega do relatório com caminhos absolutos, inventário de hashes, resumo dos testes e declaração formal de `actual_model_calls: 0` antes da aprovação final para a Task 104.
- **Ação Corretiva Requerida**: O supervisor deve coordenar a gravação de `/mnt/d/Projects/MimirNL/tasks/103-v03-abc-runner-result.md` contendo o inventário formal e hashes idênticos aos verificados neste parecer (`proposed_run_sha256`: `e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92`, `public_offline_sha256`: `a2d46641efa2d8b1752760b88c9136d21cbd376b035a248f1e83e3c2e2274651`, `actual_model_calls`: 0). Uma vez persistido o documento, a aprovação técnica para a Task 104 estará consolidada.
