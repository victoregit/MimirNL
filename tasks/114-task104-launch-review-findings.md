# Parecer Independente — Task 114: Revisão do Launcher Público e Procedimento da Task 104

- **Data**: 2026-10-27
- **Revisor Independente**: Antigravity (Code Reviewer Agent)
- **Modelo de Revisão**: Gemini 3.8 Flash (High)
- **Documento de Especificação**: `/mnt/d/Projects/MimirNL/tasks/114-task104-launch-review.md`
- **Documentos e Artefatos Avaliados**:
  - Launcher: `/mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs`
  - Testes: `/mnt/d/Projects/MimirNL/test/task104-launch.test.mjs`
  - Relatório de Preparação 113: `/mnt/d/Projects/MimirNL/tasks/113-task104-launch-preparation-result.md`
  - Relatório de Preflight 112: `/mnt/d/Projects/MimirNL/tasks/112-task104-runtime-preflight-result.md`
  - Especificação da Avaliação 104: `/mnt/d/Projects/MimirNL/tasks/104-v03-bounded-evaluation.md`
  - Parecer Homologado 109: `/mnt/d/Projects/MimirNL/tasks/109-v03-abc-runner-rereview-findings.md`
  - Manifestos de Referência: `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json` e `offline-manifest.json`
  - Recibos de Revisão Técnica 106: `/mnt/d/Projects/MimirNL/tasks/106-technical-review-receipt-0.2.json`, `dev-0.2.json`, `eval-0.2.json`
- **Veredito**: **`APPROVE`**
- **Chamadas Reais a Modelo nesta Revisão**: `actual_model_calls: 0` (execução estritamente offline, analítica e de testes locais)

---

## 1. Hashes e Integridade Criptográfica dos Artefatos

Todos os hashes SHA-256 foram recalculados diretamente a partir dos bytes dos arquivos no sistema de arquivos local (`hashlib.sha256` / `crypto.createHash`):

### 1.1 Artefatos Novos da Task 113
| Arquivo | SHA256 (Bytes) | Status |
| :--- | :--- | :---: |
| [`scripts/benchmarks/task104-launch.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs) | `2e48347bc7931470c988c65f9bca79eb248c5f5b74094926683ca260d921eb38` | Conferido |
| [`test/task104-launch.test.mjs`](file:///mnt/d/Projects/MimirNL/test/task104-launch.test.mjs) | `b78a647eeefa79358c1e6b1eb61984a77ccc9263d66ce0fb5384d5f62aec8599` | Conferido |
| [`tasks/113-task104-launch-preparation-result.md`](file:///mnt/d/Projects/MimirNL/tasks/113-task104-launch-preparation-result.md) | `6f0b35f11aca2c6a3481d07e9d436f0f7ad101024b36ed8d416828780f00eee0` | Conferido |

### 1.2 Manifestos e Preflight
| Arquivo | SHA256 (Bytes) | SHA256 Canônico | Status |
| :--- | :--- | :--- | :---: |
| [`docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json) | `84214d6b70e058bfae8081d77c5935a15d0103f8753210bc43f2d6a3b620bf21` | `e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92` | Homologado (109) |
| [`docs/benchmarks/v03/evidencias/task103/public-plan/offline-manifest.json`](file:///mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/offline-manifest.json) | `c4af7a6c2107036d263199a1c648b066ddc3bd05261f2b0e695795251587ddea` | `a2d46641efa2d8b1752760b88c9136d21cbd376b035a248f1e83e3c2e2274651` | Homologado (109) |
| [`tasks/112-task104-runtime-preflight-result.md`](file:///mnt/d/Projects/MimirNL/tasks/112-task104-runtime-preflight-result.md) | `a0fc3826e22c10c29ea63d54214d0cb15e31a86237be5640685f18d1126c196f` | N/A | Conferido |

### 1.3 Core Mimir Congelado (Task 102 / Homologado na Task 108)
| Arquivo | SHA256 (Bytes) | Status |
| :--- | :--- | :---: |
| [`src/core/service.ts`](file:///mnt/d/Projects/MimirNL/src/core/service.ts) | `dd46662d03ef022cea70e35e7276e789a2f4e69c1c11a1af3f3563f9e71e9e94` | Congelado |
| [`src/core/schemas.ts`](file:///mnt/d/Projects/MimirNL/src/core/schemas.ts) | `2b3cf8e9a9a0f54e1547776c20f00e9437089102c318673111c086450da16e9c` | Congelado |
| [`src/retrieval/index.ts`](file:///mnt/d/Projects/MimirNL/src/retrieval/index.ts) | `f0021222bf83fc5d02818a3c73ac03a4cdde1c33eb2cebb5a421ef5dd1f47d30` | Congelado |
| [`src/optimization/index.ts`](file:///mnt/d/Projects/MimirNL/src/optimization/index.ts) | `4dd5c182ae7631169dab169c44b90d177ded821d9250e61975aaed85d65412fc` | Congelado |

Conferência integral do inventário: Os 27 arquivos de código referenciados no manifesto canônico `proposed-run-manifest.json` foram auditados individualmente contra os arquivos físicos no repositório. **Zero divergências** encontradas (27 de 27 conferem).

---

## 2. Avaliação Técnica Detalhada do Código por Categorias de Revisão

### 2.1 Funcionalidade e Aderência ao Escopo
- **Ponto de entrada isolado e estrito**: O script [`task104-launch.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs) atua exclusivamente como orquestrador público do disparo da avaliação limitada.
- **Validação de aridade e argumentos** ([task104-launch.mjs:15-16](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs#L15-L16)): Exige rigorosamente 3 argumentos posicionais (`manifestPath`, `authorizationPath`, `out`), recusando qualquer invocação com quantidade divergente.
- **Obrigatoriedade de caminhos absolutos** ([task104-launch.mjs:15-16](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs#L15-L16)): Aplica `args.some(p => !isAbsolute(p))`, eliminando qualquer ambiguidade decorrente de diretórios de trabalho correntes relativos.
- **Controle de plataforma e runtime** ([task104-launch.mjs:17-18](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs#L17-L18)): Bloqueia sumariamente execuções fora do ambiente homologado Linux x64 com Node `v24.22.1` (`process.platform !== "linux" || process.arch !== "x64" || process.version !== "v24.22.1"`).
- **Vinculação estrita ao manifesto aprovado** ([task104-launch.mjs:9, 21](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs#L9-L21)): Compara o SHA256 canônico com a constante `APPROVED = "e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92"`, rejeitando qualquer outro manifesto.
- **Autorização formal obrigatória** ([task104-launch.mjs:22-23](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs#L22-L23)): Executa `parseStrictJSON(readExplicit(authorizationPath))` e a rotina homologada `authorize(manifest, authorization)`, garantindo veredito `APPROVE`, época 1, `max_attempts: 54`, e identidades válidas e distintas.

### 2.2 Isolamento de Importação e Ajuda (`--help` sem efeitos colaterais)
- **Top-level limpo**: O módulo [`task104-launch.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs#L3-L8) importa apenas utilitários puros de `node:*`, [`offline-files.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/offline-files.mjs) e [`abc-public.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-public.mjs). Não executa nenhuma operação de E/S nem inicia subprocessos durante o carregamento inicial.
- **Comportamento de Ajuda** ([task104-launch.mjs:11-14](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs#L11-L14)): A chamada sem argumentos (`args.length === 0`) ou com `--help` imprime a sinopse e retorna imediatamente sem ler arquivos, sem importar o runtime ABC e sem disparar qualquer modelo.
- **Importação dinâmica tardia** ([task104-launch.mjs:34](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs#L34)): O módulo [`abc-runtime.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-runtime.mjs) somente é importado via `await import(...)` após a aprovação de todas as validações prévias de argumentos, manifesto, autorização e diretório.

### 2.3 Exclusividade do Destino e Segurança de Permissões
- **Inspeção de symlinks no diretório pai** ([task104-launch.mjs:24](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs#L24)): Invoca `safePath(dirname(out))`, garantindo que toda a hierarquia de diretórios pais seja percorrida e que nenhum componente seja link simbólico.
- **Detecção de existência prévia com suporte a links órfãos** ([task104-launch.mjs:27-32](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs#L27-L32)): Aplica `lstatSync(out)` em bloco `try/catch`. Caso o caminho já exista (seja diretório, arquivo regular ou symlink quebrado/pendente), emite `"Output already exists"`. O fluxo só prossegue se a exceção capturada for estritamente `ENOENT`.
- **Máscara de criação de arquivos restritiva** ([task104-launch.mjs:33](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs#L33)): Configura `process.umask(0o077)`, forçando permissões de criação de arquivos e diretórios exclusivas para o usuário (diretórios `0700` e arquivos `0600`).
- **Criação atômica no runtime**: O destino `out` é posteriormente criado dentro de `executeABC` através de `mkdirSync(out, { mode: 0o700 })` e `chmodSync(out, 0o700)`, garantindo posse exclusiva no momento da gravação.

### 2.4 Transporte Homologado, Ausência de Bypass e Zero Retry
- **Invocação em modo live controlado** ([task104-launch.mjs:35](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs#L35)): Aciona `executeABC({ manifest, authorization, out, mode: "live" })`. Em modo live, o runtime seleciona estritamente o transporte homologado `realTransport` de [`abc-transport.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-transport.mjs).
- **Sem acesso a módulos privados**: O launcher não importa nem referencia `abc-export.mjs`, `abc-private-cli.mjs`, nem os holdouts ou gabaritos privados em `/home/usuario/mimir-private/task101-evaluator/`.
- **Política Zero Retry e Interrupção Imediata**: O runtime público interrompe a execução no primeiro erro, timeout ou detecção de ferramentas (`halt = true`), marcando todas as tentativas subsequentes como `not_run`. Nenhuma tentativa consumida por erro é reexecutada.
- **Sanitização de saída no console** ([task104-launch.mjs:36-37, 40-44](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs#L36-L44)): O launcher emite apenas um JSON resumido com `{ actual_model_calls, retrieval_calls, stopped }`. No bloco de captura de erro de alto nível, exibe a mensagem genérica `"Task104 launch failed"` com `exitCode = 1`, sem vazar trechos de prompts, caminhos do sistema ou stack traces sensíveis.

### 2.5 Qualidade dos Testes Unitários
- A suíte [`test/task104-launch.test.mjs`](file:///mnt/d/Projects/MimirNL/test/task104-launch.test.mjs) abrange:
  1. [Linhas 10-21](file:///mnt/d/Projects/MimirNL/test/task104-launch.test.mjs#L10-L21): Verificação de importação limpa sem saída e help com código 0 e sem execução do runtime.
  2. [Linhas 22-25](file:///mnt/d/Projects/MimirNL/test/task104-launch.test.mjs#L22-L25): Rejeição de aridade incorreta, caminhos relativos e argumentos extras.
  3. [Linhas 26-43](file:///mnt/d/Projects/MimirNL/test/task104-launch.test.mjs#L26-L43): Rejeição estrita de autorizações inválidas (schema vazio, chaves duplicadas, campos extras, veredito DENY, manifest hash incorreto) comprovando que a falha ocorre antes da importação do runtime e que o diretório de saída não é criado.

---

## 3. Execução dos Testes Offline e Validações

Todos os testes foram executados com o runtime Node persistente `/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node` na raiz `/mnt/d/Projects/MimirNL`, mantendo `actual_model_calls: 0`:

1. **Testes do Launcher 104**:
   ```bash
   /home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --test test/task104-launch.test.mjs
   ```
   - **Resultado**: 3 testes executados, 3 aprovados, 0 falhas (tempo ~2.9s).

2. **Validação Estrutural e Criptográfica do Manifesto Proposto**:
   ```bash
   /home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node scripts/benchmarks/abc-cli.mjs validate docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json
   ```
   - **Resultado**: Saída `{"stage":"run","sha256":"e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92","actual_model_calls":0,"execution_proof":false}` (Exit code 0).

3. **Suíte Focada do Executor ABC (Regressão e Canários de Segurança)**:
   ```bash
   /home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --test test/benchmark-abc.test.mjs
   ```
   - **Resultado**: 10 testes executados, 10 aprovados, 0 falhas (tempo ~15.4s).

4. **Suíte do Contrato 0.2 e Core 0.3**:
   ```bash
   /home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node --test test/core-v03.test.mjs test/benchmark-v02.test.mjs
   ```
   - **Resultado**: 18 testes executados, 18 aprovados, 0 falhas (tempo ~19.5s).

**Total acumulado**: 31 testes executados, 31 aprovados com sucesso e zero chamadas a modelo.

---

## 4. Auditoria de Recibos 106 e Consistência Documental

1. **Recibos Técnicos 106**:
   - Foram conferidos os três recibos:
     - [`tasks/106-technical-review-receipt-0.2.json`](file:///mnt/d/Projects/MimirNL/tasks/106-technical-review-receipt-0.2.json)
     - [`tasks/106-technical-review-receipt-dev-0.2.json`](file:///mnt/d/Projects/MimirNL/tasks/106-technical-review-receipt-dev-0.2.json)
     - [`tasks/106-technical-review-receipt-eval-0.2.json`](file:///mnt/d/Projects/MimirNL/tasks/106-technical-review-receipt-eval-0.2.json)
   - Todos utilizam `schema_version: "technical-review-receipt-0.2"` e apresentam:
     - `author_ref`: `"codex-task101"`
     - `reviewer_ref`: `"gemini-3.8-flash-high-task106-reviewer"`
     - A distinção entre autor e revisor é estrita (`author_ref !== reviewer_ref`).
     - `verdict`: `"APPROVE"`
     - `evidence_ref`: `"tasks/106-v03-corpus-review-findings.md"` (arquivo existente, conferido e homologado).
     - `bundle_sha256`: `"e75d3066c9151d71b97c440f7a563147cfbc94a52302dcf5965075e2bdcdc7e9"` (idêntico ao do manifesto proposed).
     - `cases_sha256`: `176893a7...` (dev) e `7f4bab5f...` (eval).

2. **Autenticação Documental pelo Supervisor**:
   - Conforme atestado no relatório 113, o supervisor já autenticou documentalmente os recibos 106, os gates 107 e 108 e a revisão complementar 109 via retorno de orquestração CAO `d3724822` com `model_honored: true`.
   - Conforme as instruções do projeto e da especificação da tarefa, a autorização sustentada do usuário até 0.3 permanece válida, dispensando a exigência de nova aprovação humana genérica.

---

## 5. Auditoria do Diretório de Destino e Permissões

- **Diretório pai**: `/home/usuario/.local/share/mimir-task104-evidence`
  - Existe no sistema de arquivos Linux persistente.
  - Permissões verificadas: `0700` (`drwx------`).
- **Destino proposto para o live**: `/home/usuario/.local/share/mimir-task104-evidence/task104-epoch1-e518dd64-20261027-launch113`
  - Verificação de existência (`os.path.lexists`): `False`. O diretório **não existe**, garantindo que não haverá conflito de escrita nem reutilização indevida.
- **Arquivo de autorização proposto**: `/home/usuario/.local/share/mimir-task104-evidence/task104-authorization-epoch1.json`
  - Verificação de existência (`os.path.lexists`): `False`. O arquivo **não existe** previamente, assegurando que o supervisor criará o artefato apenas no momento apropriado.

---

## 6. Gates Concretos para a Execução da Task 104

A revisão independente técnica deste launcher emite parecer **`APPROVE`**. No entanto, a execução live da Task 104 **não** foi executada nesta tarefa e permanece estritamente condicionada aos seguintes gates operacionais concretos a serem executados exclusivamente pelo supervisor:

1. **Gravação e Autenticação do Artefato de Autorização**:
   - O supervisor deve gravar fisicamente o arquivo `/home/usuario/.local/share/mimir-task104-evidence/task104-authorization-epoch1.json` com permissão estrita `0600` contendo rigorosamente a estrutura validada:
     ```json
     {
       "schema_version": "abc-authorization-0.2",
       "manifest_sha256": "e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92",
       "epoch": 1,
       "reviewer_ref": "gemini-3.8-flash-high-task109-d3724822",
       "supervisor_ref": "codex-supervisor-f4190c7f",
       "verdict": "APPROVE",
       "max_attempts": 54
     }
     ```
2. **Reconfirmação Imediata Pré-Execução**:
   - Imediatamente antes do disparo, o supervisor deve reconfirmar que `/home/usuario/.local/share/mimir-task104-evidence/task104-epoch1-e518dd64-20261027-launch113` permanece inexistente.
3. **Disparo Único (Single-shot)**:
   - A execução deve ocorrer uma única vez através do comando revisado.
   - Em caso de qualquer falha, interrupção ou timeout, o orçamento é consumido e nenhuma repetição deve ser realizada.

---

## 7. Comando Revisado e Aprovado

Comando final exato homologado para execução única pelo supervisor:

```bash
/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs /mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json /home/usuario/.local/share/mimir-task104-evidence/task104-authorization-epoch1.json /home/usuario/.local/share/mimir-task104-evidence/task104-epoch1-e518dd64-20261027-launch113
```

---

## 8. Veredito Final

O código do launcher [`task104-launch.mjs`](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs) e sua suíte de testes [`task104-launch.test.mjs`](file:///mnt/d/Projects/MimirNL/test/task104-launch.test.mjs) satisfazem com rigor todos os requisitos de segurança, validação de integridade, isolamento de processos, tratamento restritivo de erros e aderência metodológica ao contrato 0.2 e perfil homologado na Task 109.

# **`APPROVE`**
