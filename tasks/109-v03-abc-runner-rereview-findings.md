# Parecer Complementar Independente — Task 109: Retomada e Homologação do Executor ABC e Manifesto 0.2 (Task 103 / Task 110)

- **Data**: 2026-10-27
- **Revisor Independente**: Antigravity (Code Reviewer Agent)
- **Modelo Utilizado**: Gemini 3.8 Flash (High)
- **Documento Complementado**: `/mnt/d/Projects/MimirNL/tasks/109-v03-abc-runner-review-findings.md` (preservado como histórico da primeira rodada)
- **Documento Avaliado**: `/mnt/d/Projects/MimirNL/tasks/103-v03-abc-runner-result.md` (entregue pela Task 110)
- **Especificações de Referência**: `/mnt/d/Projects/MimirNL/tasks/103-v03-abc-runner.md`, `/mnt/d/Projects/MimirNL/tasks/111-resume-task109-rereview.md`, `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato-0.2.md`, `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/executor-abc-0.2.md`
- **Veredito da Retomada**: **`APPROVE`** (Bloqueio documental saneado; código, manifestos, evidências e inventário físico conferidos com sucesso)
- **Chamadas a Modelo Real nesta Retomada**: `actual_model_calls: 0`

---

## 1. Contexto e Resolução da Pendência Anterior

Na primeira rodada de revisão (`tasks/109-v03-abc-runner-review-findings.md`), o revisor independente emitiu parecer **`CHANGES_REQUESTED`** estritamente devido à ausência física do relatório de entrega `/mnt/d/Projects/MimirNL/tasks/103-v03-abc-runner-result.md`, o qual não havia sido gravado em virtude de exaustão de cota no processo do desenvolvedor. Todo o arcabouço técnico de código (`scripts/benchmarks/abc-*.mjs`), testes (`test/benchmark-abc.test.mjs`), documentação (`docs/benchmarks/v03/executor-abc-0.2.md`) e manifestos (`docs/benchmarks/v03/evidencias/task103/public-plan/`) já havia atendido aos critérios da especificação.

A Task 110 supriu essa deficiência gerando o relatório formal `/mnt/d/Projects/MimirNL/tasks/103-v03-abc-runner-result.md` de forma estritamente documental, com `actual_model_calls: 0`, identificando e tabulando com exatidão a existência de divergências entre 9 hashes citados no corpo textual de Task 109 e os hashes reais calculados a partir dos arquivos presentes no disco.

A presente revisão independente examinou a totalidade dos artefatos, conduziu a investigação forense das divergências, reexaminou as linhas de código e confirma que todos os requisitos de integridade foram atendidos, permitindo a transição do veredito para **`APPROVE`**.

---

## 2. Investigação Forense das 9 Divergências de Hashes

### 2.1 Tabela Comparativa Detalhada

A conferência de bytes (SHA256) dos 9 arquivos apontados no relatório 103 revelou os seguintes dados:

| Arquivo Absoluto | SHA256 no Texto de 109 | SHA256 Real no Disco | No Manifest Proposed? | Hash Registrado no Manifest |
| :--- | :--- | :--- | :---: | :--- |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-cli.mjs` | `c539dd895efadad3f6b4b4dd4f958742588c422aa91187ebdfb7c258d4ae7cb5` | `f7ac762147cf53fb0979620f9be4cf933c4453efe860761f8955ce8a2268bbf6` | **Sim** | `f7ac762147cf53fb0979620f9be4cf933c4453efe860761f8955ce8a2268bbf6` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-export.mjs` | `fbc7ec48c77ea1dfb60166a939fbfb61d4791a82ef45b5be3d0016a2cc6dfa42` | `cbe4c27d0d89d631e492a7f602ebcd499d39a12344457d7bba69e3ad7f5887f0` | Não (privado) | N/A (não faz parte do runtime público) |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-private-cli.mjs` | `fc575ba800f13524b0a886f44f910404495b4cbdf520422c54d76203cf97e20b` | `76f16ed148118198b045200561ceac13cb248506e162eeb00a3f27436bec0f71` | Não (privado) | N/A (não faz parte do runtime público) |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-public.mjs` | `95bc8bf6424564c8d5045610738e404bca7d42cfb2d0752538186f81156fe4fc` | `3ad4be78c9dc88e6596bebcb46b3e4e6556adaa749e9ace0f25342452096a3b3` | **Sim** | `3ad4be78c9dc88e6596bebcb46b3e4e6556adaa749e9ace0f25342452096a3b3` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-runtime.mjs` | `8e6c466986fa88f91db7998b47936495beea8380e227092c2daef1b41e8c0571` | `2e91a8992ad06084431b8811d9ace721d5904d4a1a72440bcc6704dfd9fc8f57` | **Sim** | `2e91a8992ad06084431b8811d9ace721d5904d4a1a72440bcc6704dfd9fc8f57` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-transport.mjs` | `8a186dcf2ebae5669b910e5256e09e03d49b06ce2e03aa3597d519be9485bb21` | `7fb4c1c119523eb7ef6010196d2418fdf68a30f2f8bf0046141da5b5a44fe31b` | **Sim** | `7fb4c1c119523eb7ef6010196d2418fdf68a30f2f8bf0046141da5b5a44fe31b` |
| `/mnt/d/Projects/MimirNL/test/abc-fixture.mjs` | `11bf9841804d9c490ff1966a3473950fb20e9858544c0bf49ba3268809ff4fe4` | `5a4f182e7a980ed0dc4c8292e366960b6cf927e6befba72e97d4811faa6200c0` | Não (teste) | N/A (fixture de teste) |
| `/mnt/d/Projects/MimirNL/test/benchmark-abc.test.mjs` | `90ca9e14a1c1d530f6120b0b8c2beea2163b715694c9e836171f251f98d752f9` | `6c837debeb6902769d2040340cce7009e6fe44809f6102f7c7921841ad1df0ab` | Não (teste) | N/A (suíte de teste) |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/executor-abc-0.2.md` | `1607593c6f37ee0572e0081bf4ef8c8f070198031d2ba7b2c01d9f056d959f63` | `5e57d8ac458be4b094d2384d8890ba4b40f81680cfb29919616a9d7509f18b74` | Não (doc) | N/A (documentação) |

### 2.2 Demonstração e Vínculo de Integridade

1. **Os Manifestos Oficiais Contêm os Hashes Reais de Disco**:
   - O arquivo `docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json` (SHA256 de arquivo: `84214d6b70e058bfae8081d77c5935a15d0103f8753210bc43f2d6a3b620bf21`, SHA256 canônico: `e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92`) e o arquivo `offline-manifest.json` (SHA256 de arquivo: `c4af7a6c2107036d263199a1c648b066ddc3bd05261f2b0e695795251587ddea`, SHA256 canônico: `a2d46641efa2d8b1752760b88c9136d21cbd376b035a248f1e83e3c2e2274651`) possuem exatamente o mesmo dicionário `code` com 27 arquivos.
   - Os 4 arquivos executáveis de benchmark listados no manifesto (`abc-cli.mjs`, `abc-public.mjs`, `abc-runtime.mjs`, `abc-transport.mjs`) possuem no campo `code` do JSON exatamente os hashes reais de disco (`f7ac...`, `3ad4...`, `2e91...`, `7fb4...`).
   - Todos os demais 23 arquivos do dicionário `code` (incluindo o core congelado da Task 102/108 e arquivos de bundle) conferem byte a byte com o disco (0 divergências em 27 arquivos).
   - O cálculo canônico do hash do manifesto (`e518dd64...`) depende matematicamente desses 27 hashes. Se qualquer um dos hashes fosse diferente (por exemplo, os hashes do texto de 109), o hash canônico divergiria obrigatoriamente. Como o hash gravado no manifesto é `e518dd64...`, comprova-se que o manifesto foi construído sobre os arquivos físicos atuais.

2. **Inventário Efetivamente Coberto pela Revisão e Testes**:
   - A reconstituição da trajetória de execução na sessão de origem da Task 109 (`f64a7cc9-5eed-434c-ad8b-b4e3a210c7dd`) demonstrou que os testes focados executados no Step 215 (`node --test test/benchmark-abc.test.mjs`, 10 passed, 0 failed) foram executados às 16:53:10 de 2026-10-27.
   - A datação física dos arquivos no sistema de arquivos atesta que os arquivos de benchmark foram gravados entre 16:39:20 e 16:42:55 de 2026-10-27, ou seja, **antes** da execução dos testes e da elaboração do texto da revisão 109 (concluída às 16:56:08).
   - Isso estabelece, com evidência irrefutável, que o código e testes submetidos à execução e conferência técnica foram exatamente os arquivos atualmente presentes em disco (`f7ac...`, `3ad4...`, `2e91...`, `7fb4...`, `6c83...`, `5a4f...`, etc.).
   - Os 9 valores divergentes grafados na seção 1 do relatório textual `109-v03-abc-runner-review-findings.md` decorreram de erro redacional/transcrição durante a composição do texto e não representam uma versão de código que tenha sido testada ou manifestada.

---

## 3. Revisão Técnica do Código, Testes e Documentação

O código atual foi minuciosamente reexaminado pelo revisor independente, com foco nos codepaths críticos:

### 3.1 `scripts/benchmarks/abc-public.mjs`
- **Validação Estrita de Schemas e Manifestos**:
  - [abc-public.mjs:84-175](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-public.mjs#L84-L175): `validateManifest` aplica `exact()` para barrar chaves extras, valida versões (`abc-manifest-0.2`, contrato `0.2`, perfil `technical_reviewed-v1`), e recusa qualquer manifesto sintético que tente declarar `stage: "run"`.
  - [abc-public.mjs:134](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-public.mjs#L134): `canonical(m.code) !== canonical(inventory())` fail-closed caso qualquer um dos 27 arquivos de código sofra alteração física.
  - [abc-public.mjs:160-173](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-public.mjs#L160-L173): Garante que as 54 requisições sejam organizadas em 18 blocos de 3 chamadas cobrindo deterministicamente ABC, BCA e CAB com entradas públicas rigorosamente idênticas dentro de cada trinca.
- **Parser JSON Estrito (`parseStrictJSON`)**:
  - [abc-public.mjs:205-274](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-public.mjs#L205-L274): Varredura manual recursiva de tokens JSON que rejeita sumariamente chaves duplicadas (inclusive formas unicode escapadas como `\u0061` vs `a`), caracteres de controle e tokens residuais, prevenindo ataques de desserialização ambígua.

### 3.2 `scripts/benchmarks/abc-runtime.mjs`
- **Isolamento de Banco e Fixtures**:
  - [abc-runtime.mjs:110-118](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-runtime.mjs#L110-L118): Cada uma das 54 posições cria um diretório descartável `fixture-` exclusivo (modo `0700`), gera `history.txt` de 0 bytes (conferindo hash com `m.history.sha256`) e instancia um SQLite isolado `db.sqlite`.
  - [abc-runtime.mjs:119, 154, 271, 276](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-runtime.mjs#L119-L276): Rastreamento explícito de `initial_db_sha256`, `seed_sha256`, `final_db_sha256` (estado lógico das memórias) e `db_file_sha256` (hash físico do arquivo fechado).
- **Tratamento do Braço B (`com_mimir`)**:
  - [abc-runtime.mjs:160-195](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-runtime.mjs#L160-L195): Executa a busca real `memory_search` utilizando estritamente a política congelada na Task 102/108 (`balanced-v1`, `verified-ties-v1`, `compact-v1`, `telemetry: false`, `limit: 3`, `tokenBudget: 32000`).
  - [abc-runtime.mjs:196-198](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-runtime.mjs#L196-L198): A montagem do envelope preserva integralmente as fontes base e anexa as memórias recuperadas sem deduplicação destrutiva contra a base. Retorno vazio permanece vazio (`retrieved: []`).
- **Orçamentos e Respeito a Timers Síncronos**:
  - [abc-runtime.mjs:157, 209](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-runtime.mjs#L157-L209): Verificação de deadline antes de invocar transporte; se o tempo restante expirou, registra `run_timeout` honestamente sem acionar o host.
  - [abc-runtime.mjs:202](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-runtime.mjs#L202): Tetos estritos de contexto (32.000 bytes) disparam `infeasible`.
  - [abc-runtime.mjs:251](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-runtime.mjs#L251): Interrupção imediata na primeira falha (`halt = true`), preservando todas as posições seguintes como `not_run`.

### 3.3 `scripts/benchmarks/abc-transport.mjs`
- **Segurança de Processos e Kill de Grupo**:
  - [abc-transport.mjs:74-83](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-transport.mjs#L74-L83): O subprocesso é iniciado com `detached: true` e a finalização executa `process.kill(-child.pid, "SIGKILL")`, garantindo a terminação de qualquer processo filho pertencente ao grupo.
- **Detecção de Ferramentas e Inspeção Linha a Linha**:
  - [abc-transport.mjs:140-145](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-transport.mjs#L140-L145): Coleta o stream JSONL do Codex; qualquer evento fora de `agent_message` ou `reasoning` aciona `tools = true`, interrompe o grupo de processos imediatamente e invalida a tentativa.
  - [abc-transport.mjs:153-160](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-transport.mjs#L153-L160): Respostas acima do teto de captura de 64.000 bytes são truncadas e invalidadas (`limit = true`).

### 3.4 `scripts/benchmarks/abc-export.mjs` e `scripts/benchmarks/abc-private-cli.mjs`
- **Separação Rígida de Fronteira Pública/Privada**:
  - [abc-export.mjs:43-52](file:///mnt/d/Projects/MimirNL/scripts/benchmarks/abc-export.mjs#L43-L52): A projeção pública de cada requisição retém apenas `scenario`, `task`, `query`, `pool` e `base`. IDs de casos (`case_id`), divisões (`split`), respostas esperadas, rubricas de avaliação e recibos de revisão técnica ficam confinados exclusivamente ao `coordinator.json` privado (`mode 0700`).

### 3.5 `test/benchmark-abc.test.mjs`
- **Cobertura de Casos de Borda e Canários de Segurança**:
  - [benchmark-abc.test.mjs:31-81](file:///mnt/d/Projects/MimirNL/test/benchmark-abc.test.mjs#L31-L81): Testes de mutação e tamper de schemas, épocas, políticas e autorizações.
  - [benchmark-abc.test.mjs:82-144](file:///mnt/d/Projects/MimirNL/test/benchmark-abc.test.mjs#L82-L144): Execução offline completa das 54 posições simuladas com 18 buscas SQLite reais e equivalência A=C.
  - [benchmark-abc.test.mjs:145-176](file:///mnt/d/Projects/MimirNL/test/benchmark-abc.test.mjs#L145-L176): Garantia de política zero-retry após erro de spawn, truncamento ou detecção de ferramentas.
  - [benchmark-abc.test.mjs:247-280, 325-346](file:///mnt/d/Projects/MimirNL/test/benchmark-abc.test.mjs#L247-L346): Canários profundos de interceptação de I/O comprovando o bloqueio de acessos a arquivos `.json` e `.md` arbitrários no filesystem.
  - [benchmark-abc.test.mjs:374-398](file:///mnt/d/Projects/MimirNL/test/benchmark-abc.test.mjs#L374-L398): Comprovação de terminação efetiva do grupo de processos POSIX sob timeout.

---

## 4. Avaliação Crítica do Relatório 103 (`tasks/103-v03-abc-runner-result.md`)

O relatório entregue pela Task 110 atende plenamente aos requisitos de completude e rigor técnico:
1. **Rastreabilidade e Caminhos**: Utiliza exclusivamente caminhos absolutos para todos os arquivos referenciados.
2. **Transparência de Hashes**: Registrou formalmente as 9 divergências de hash em relação ao texto da revisão 109, abstendo-se de mascarar ou manipular os dados.
3. **Integridade dos Manifestos**: Conferiu os 27 arquivos de código byte a byte contra os manifestos `offline-manifest.json` e `proposed-run-manifest.json`, comprovando 0 divergências com o disco.
4. **Delimitação de Evidências**: Declarou expressamente que logs e testes anteriores foram apenas consultados, sem alegar falsamente execuções adicionais ou chamadas a modelo (`actual_model_calls: 0`).
5. **Limitações e Gates**: Documentou com clareza as limitações de isolamento do host Codex, o significado estrito de `tools: []`, a rejeição de Windows live e a necessidade de autorização externa para a Task 104.

---

## 5. Veredito Final da Retomada

Com base na comprovação matemática de que os manifestos derivam do inventário real de disco, na verificação de que os testes focados cobriram o código atual, no saneamento do bloqueio documental pela entrega de `/mnt/d/Projects/MimirNL/tasks/103-v03-abc-runner-result.md` e na inspeção integral dos codepaths:

O veredito da revisão técnica independente para a entrega da Task 103 é:

# **`APPROVE`**

> [!NOTE]
> Este parecer aprova a entrega técnica da Task 103 e a proposta de plano público para a avaliação limitada da Task 104. Ele **não** autoriza nem executa a Task 104 automaticamente.

---

## 6. Gates Rígidos e Condições Mandatórias para a Task 104

A execução da Task 104 permanece estritamente bloqueada até que o supervisor atenda aos seguintes gates mandatórios:

1. **Vinculação Estrita ao Manifesto Aprovado**:
   - Caminho do manifesto proposto: `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json`
   - Hash canônico obrigatório: `e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92`
   - Hash do arquivo (bytes): `84214d6b70e058bfae8081d77c5935a15d0103f8753210bc43f2d6a3b620bf21`
   - Parâmetros congelados: `stage: "run"`, `synthetic: false`, `epoch: 1`, total de 54 posições.

2. **Artefato de Autorização Externa Estruturada**:
   - Deve ser fornecido artefato aderente ao schema `abc-authorization-0.2`:
     - `manifest_sha256`: `e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92`
     - `epoch`: `1`
     - `verdict`: `"APPROVE"`
     - `max_attempts`: `54`
     - `reviewer_ref` e `supervisor_ref` devem ser identidades distintas e autenticadas pelo supervisor.

3. **Ambiente Operacional e Destino Exclusivo**:
   - Plataforma: Linux nativo (o transporte POSIX recusa expressamente execução sob Windows).
   - Runtime: Node v24.22.1 Linux x64 com binário compatível.
   - Diretório de saída: Um diretório novo e exclusivo deve ser fornecido na autorização. É terminantemente proibido reutilizar `docs/benchmarks/v03/evidencias/task103/offline-replay/` ou qualquer diretório existente como retomada.

4. **Fronteiras de Segurança e Host Codex**:
   - `tools: []` significa ausência de autorização de ferramentas; o host mantém capacidades internas. O enforcement baseia-se nas instruções de prompt, `--sandbox read-only`, `--ignore-user-config`, `--ephemeral`, `--cd scratch`, `--disable apps,plugins,multi_agent` e encerramento imediato via SIGKILL do grupo de processos na ocorrência de eventos de ferramentas.
   - Ausência de eventos não comprova ausência de acessos internos; se for exigido isolamento físico total, deve-se emitir emenda contratual prévia.

5. **Congelamento Metodológico e Proibição de Tuning**:
   - O holdout de avaliação e rubricas privadas não devem ser abertos nem utilizados para retuning dos parâmetros ou heurísticas do core do Mimir.
   - O teto de chamadas a modelo na Task 104 é de no máximo 54 tentativas reais (`actual_model_calls <= 54`), com concorrência 1 e política estrita de zero retry.
