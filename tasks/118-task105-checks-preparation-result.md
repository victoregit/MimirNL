# Task118 — Preparação dos checks105

Data: 2026-10-27. `actual_model_calls: 0`. Preparação concluída com pendências concretas; Task105 permanece aberta e depende da revisão final111. Sem subagentes, chamadas reais, replay live, retuning, gold, commit, push ou publicação. Nenhum código, teste, core, dist, manifesto, lock, dependência ou evidência histórica do checkout foi alterado.

## Proposta documental registrada antes dos checks finais

A proposta inicial foi gravada neste relatório durante a preparação: preservar bytes históricos e criar documentos correntes formatados, mediante review111. Alternativa concreta para revisão: conservar nesta fase os paths e bytes congelados; no próximo epoch documental aprovado, produzir arquivo imutável do snapshot histórico (por exemplo TAR contendo os paths originais, inventories e SHA256 dos membros), verificar que a extração reproduz os hashes históricos, e ligar os documentos correntes novos `contrato-0.3.md` e `fechamento-0.3.md` a esse snapshot. Somente após aprovação explícita da migração, atualizar referências correntes e formatar documentos ativos sob novo inventário, preservando a associação das evidências104 ao snapshot antigo. Não reutilizar hashes antigos para bytes novos. Nenhum archive, documento corrente, migração de paths ou atualização de manifesto foi realizado aqui.

Não adicionar prettier-ignore, excluir paths no formatter, ou omitir arquivos ativos para obter verde. O check global permanece vermelho durante o freeze; novos documentos sozinhos não resolvem essa pendência. A mesma governança será necessária para os JSON de evidência103 que o check encontrou. Launcher/teste113 requerem correção de estilo e nova revisão/hash antes de eventual uso; não foram formatados nesta tarefa.

## Escopo e referências

Lidos Task105/104, resultado104 (Task116), resultados112/113 e parecer114. A revisão110 já estava disponível: `/mnt/d/Projects/MimirNL/tasks/110-v03-answer-quality-review-findings.md`, APPROVE técnico, 54/54 respostas com task_success/source_accuracy1.0. Apenas referência documental: não foram abertos dados privados de avaliação nem julgadas respostas novamente. O resultado104 contém a pendência110 histórica; não foi editado. Preservadas limitações publicadas: nenhum ganho de economia/latência comprovado, modelo efetivo unavailable54/54, cache positivo54/54, A=C18/18 com histórico vazio. Aprovação110 não fecha105/111 nem representa aceite humano de release.

## Isolamento e ambiente

Origem: `/mnt/d/Projects/MimirNL`. Linux: `/home/usuario/mimir-task118-checks/linux`. Windows: `/mnt/d/mimir-task118-windows` (`D:/mimir-task118-windows`). Logs persistentes externos: `/home/usuario/mimir-task118-checks`; cópias sanitizadas duráveis no repositório: `/mnt/d/Projects/MimirNL/tasks/118-checks`.

Cópia allowlisted via Python3/shutil: árvores src, dist, test, scripts, docs, node_modules e .github; arquivos de topo .json/.mjs/.md; apenas arquivos regulares, sem symlinks, sem componentes .env/.ssh/.aws, PEM e bancos db/sqlite/sqlite3. Não foram copiados diretórios pessoais, configuração privada, credenciais ou .git original. Foram copiados 4259 arquivos. Não houve instalação/download de dependências; cópias usam as dependências existentes, sem alterar package/lock. Nenhum banco pessoal foi aberto. Os testes criam apenas bancos sintéticos descartáveis.

Git mínimo criado com `/usr/bin/git init --quiet <cópia>` e objetos alcançáveis exclusivamente pelo pin público `166e3cf047b2078952e43dc8e9171e053e99e2ce`, depois de auditar os nomes de paths retornados por `/usr/bin/git -C /mnt/d/Projects/MimirNL rev-list --objects <pin>`. Transferência local: `pack-objects --stdout --revs`, `index-pack --stdin`, `update-ref refs/heads/pinned <pin>`, `symbolic-ref HEAD refs/heads/pinned`. Nenhum config/hook/remote pessoal foi copiado; não houve checkout sobre o dirty. O rev-parse Windows confirmou o pin exato. As fixtures históricas clonam esse repositório mínimo.

Linux: `/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`, v24.22.1, linux/x64, SQLite3.53.4. PATH dos testes: diretório desse Node + /usr/bin:/bin; GIT_CONFIG_GLOBAL=/dev/null, GIT_CONFIG_NOSYSTEM=1, GIT_TERMINAL_PROMPT=0.

Windows: `/mnt/c/Users/Public/mimir-hardening-runtime/node/node-v24.22.1-win-x64/node.exe`, v24.22.1, win32/x64, SQLite3.53.4; Git `/mnt/c/Users/Public/mimir-hardening-runtime/git/cmd/git.exe`, 2.56.0.windows.3. PATH somente do processo cmd: `C:\Users\Public\mimir-hardening-runtime\git\cmd;C:\Users\Public\mimir-hardening-runtime\node\node-v24.22.1-win-x64;C:\Windows\System32`. Nenhum PATH persistente foi modificado. O Node padrão em Program Files é24.21.0 e não foi usado para validação final. A primeira tentativa de set PATH com aspas via interop falhou; a invocação sem aspas confirmou where git/version. Um diagnóstico node -p via cmd imprimiu a expressão devido ao quoting; a versão/plataforma foi confirmada por invocação direta, log windows-node-version.log.

Diretório externo de logs:0700, arquivos externos:0600. Cópias de trabalho contêm apenas conteúdo público/fixture. No mount `/mnt/d`, stat reporta0777 inclusive após criação mode0700: não se alega proteção POSIX efetiva ali. Nenhuma evidência privada104/110 foi copiada para esse mount.

## Resultados

| Check | Ambiente | Exit | Resultado |
| --- | --- | --- | --- |
| typecheck --noEmit | Linux, original readonly | 0 | passou |
| eslint src | Linux, original readonly | 0 | passou |
| tsc build | Linux, cópia | 0 | passou |
| node --test, todos *.test.mjs | Linux, cópia | 0 | 145 reportados:144 pass,0 fail,1 skip |
| generate-contract --check | Linux, cópia | 0 | passou |
| tsc build | Windows nativo, cópia | 0 | passou |
| node --test, todos *.test.mjs | Windows nativo, cópia | 1 | 117 reportados:80 pass,36 fail,1 skip |
| generate-contract --check | Windows nativo, cópia | 0 | passou |
| core-v03 + rev-parse pin | Windows nativo, cópia | 0 | 6/6 pass; pin confirmado |
| ABC validate proposed | Linux, original readonly | 0 | hash e518dd64, actual_model_calls0, execution_proof false |
| prettier launcher/teste113 | Linux, original readonly | 1 | ambos pendentes |
| prettier contrato/fechamento0.2 | Linux, original readonly | 1 | ambos pendentes |
| prettier global | Linux, cópia e original readonly | 1 | os mesmos19 arquivos pendentes |

Skip Linux: short-path aliases exclusivo Windows. Skip Windows: timeout de grupo de processo POSIX. A suíte Windows inclui duas falhas no carregamento de arquivos de teste (multicase-codex/public-multicase), portanto117 não representa a execução integral dos145 testes Linux. Não alegar sucesso Windows por Linux, nem CI remoto.

Os testes são offline com transporte sintético/injeção; rótulos “real” nos testes referem-se a SQLite, SDK/MCP local ou subprocessos controlados, sem chamadas de modelo. Build e testes que escrevem foram executados somente nas cópias. Nenhum teste foi editado para passar.

## Falhas Windows e implicações

- ABC/exportação: safePath → portable rejeita caminhos nativos na construção de fixtures; erro genérico Invalid offline input or local operation. Código usa split em `/` e valida paths portáteis, enquanto joins nativos geram separadores Windows. Rastros completos nos logs, sem atribuir as falhas a modelo.
- Benchmarks antigos usam mkdtemp literal `/tmp/...`, inexistente no drive Windows; ENOENT. TEMP/TMP nativos estavam definidos em C:\Users\Usuario\AppData\Local\Temp, sem TMPDIR; portanto o literal /tmp não foi causado por ausência de temp no ambiente. Não foi criado D:/tmp para mascarar a incompatibilidade.
- CLIs/teste113 usam URL.pathname e constroem `D:\D:\mimir-task118-windows\scripts\benchmarks\task104-launch.mjs`; MODULE_NOT_FOUND. O launcher homologado é Linux-only, mas esses testes falham antes de comprovar suas rejeições previstas no Windows.
- Outras asserções de CLI/preflight/metrics/v02 falharam conforme log; não se presume que todas sejam resolvidas apenas pelas três causas anteriores. Correção exige tarefa separada após governança do freeze e nova revisão. Git foi encontrado no PATH e o pin existe; a falha atual não é o antigo git ENOENT.

Lista de arquivos com falha global de formatação:

- `test/task104-launch.test.mjs`
- `scripts/benchmarks/task104-launch.mjs`
- `docs/benchmarks/v03/contrato-0.2.md`
- `docs/benchmarks/v03/evidencias/task103/offline-replay/position-01.json`
- `docs/benchmarks/v03/evidencias/task103/offline-replay/position-10.json`
- `docs/benchmarks/v03/evidencias/task103/offline-replay/position-12.json`
- `docs/benchmarks/v03/evidencias/task103/offline-replay/position-19.json`
- `docs/benchmarks/v03/evidencias/task103/offline-replay/position-21.json`
- `docs/benchmarks/v03/evidencias/task103/offline-replay/position-26.json`
- `docs/benchmarks/v03/evidencias/task103/offline-replay/position-28.json`
- `docs/benchmarks/v03/evidencias/task103/offline-replay/position-30.json`
- `docs/benchmarks/v03/evidencias/task103/offline-replay/position-35.json`
- `docs/benchmarks/v03/evidencias/task103/offline-replay/position-36.json`
- `docs/benchmarks/v03/evidencias/task103/offline-replay/position-41.json`
- `docs/benchmarks/v03/evidencias/task103/offline-replay/position-43.json`
- `docs/benchmarks/v03/evidencias/task103/offline-replay/results.json`
- `docs/benchmarks/v03/evidencias/task103/public-plan/offline-manifest.json`
- `docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json`
- `docs/benchmarks/v03/fechamento-0.2.md`

## Integridade e dirty

Antes/depois:318/318 arquivos inventariados fora de node_modules idênticos no checkout original, incluindo src/core/dist/scripts/test/docs, package/lock e manifestos. Os mesmos318 arquivos das duas cópias permaneceram idênticos após build/testes (listas de mudanças vazias). Inventário do manifesto:27/27 hashes conferem. Os inventories completos estão em before.json/after.json/manifest-check.json; não há promessa de hash de todos os node_modules ou de arquivos excluídos.

| Arquivo relativo à raiz | SHA256 antes = depois |
| --- | --- |
| `docs/benchmarks/v03/contrato-0.2.md` | `fa0ab85d496e0f67a1a5d273d8f36e00960dde45e2e3be35b6f48d9772478025` |
| `docs/benchmarks/v03/fechamento-0.2.md` | `31f2b71a4beb343cefd4594539500b44ffc47ab8c46f78e4f8363a446db9f803` |
| `scripts/benchmarks/task104-launch.mjs` | `2e48347bc7931470c988c65f9bca79eb248c5f5b74094926683ca260d921eb38` |
| `test/task104-launch.test.mjs` | `b78a647eeefa79358c1e6b1eb61984a77ccc9263d66ce0fb5384d5f62aec8599` |
| `docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json` | `84214d6b70e058bfae8081d77c5935a15d0103f8753210bc43f2d6a3b620bf21` |
| `docs/benchmarks/v03/evidencias/task103/public-plan/offline-manifest.json` | `c4af7a6c2107036d263199a1c648b066ddc3bd05261f2b0e695795251587ddea` |
| `docs/benchmarks/v03/core-parameters-0.3.json` | `1d050d6a51fe5d8142571898a1e3f67fc782fe64aef527be44ad0b0e4285057b` |

Dirty preexistente preservado, comparado por status-before.txt/status-after.txt. Adições desta tarefa no repositório: este relatório e tasks/118-checks. Não houve commit/push/publicação. Logs não contêm reasoning/transcripts de modelo; apenas stdout/stderr de testes locais e diagnósticos públicos. SHA256.json inventaria os arquivos de logs/comandos/snapshots, excluindo a si próprio.

## Comandos reproduzíveis

Todos os argv, cwd e exit codes abaixo foram gravados também nos JSON correspondentes em `/mnt/d/Projects/MimirNL/tasks/118-checks`. Os caminhos node/tsc/test/schema são absolutos; Windows usa cmd.exe absoluto com PATH por processo e paths D:/ absolutos. A lista de testes é expandida explicitamente, sem depender de glob do cmd.

```json
{
  "linux-version": {
    "argv": [
      "/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node",
      "-p",
      "JSON.stringify({node:process.version,platform:process.platform,arch:process.arch,sqlite:process.versions.sqlite})"
    ],
    "cwd": "/mnt/d/Projects/MimirNL",
    "exit": 0
  },
  "typecheck": {
    "argv": [
      "/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node",
      "/mnt/d/Projects/MimirNL/node_modules/typescript/bin/tsc",
      "--noEmit"
    ],
    "cwd": "/mnt/d/Projects/MimirNL",
    "exit": 0
  },
  "lint": {
    "argv": [
      "/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node",
      "/mnt/d/Projects/MimirNL/node_modules/eslint/bin/eslint.js",
      "/mnt/d/Projects/MimirNL/src"
    ],
    "cwd": "/mnt/d/Projects/MimirNL",
    "exit": 0
  },
  "format-launcher": {
    "argv": [
      "/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node",
      "/mnt/d/Projects/MimirNL/node_modules/prettier/bin/prettier.cjs",
      "--check",
      "/mnt/d/Projects/MimirNL/scripts/benchmarks/task104-launch.mjs",
      "/mnt/d/Projects/MimirNL/test/task104-launch.test.mjs"
    ],
    "cwd": "/mnt/d/Projects/MimirNL",
    "exit": 1
  },
  "format-historical": {
    "argv": [
      "/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node",
      "/mnt/d/Projects/MimirNL/node_modules/prettier/bin/prettier.cjs",
      "--check",
      "/mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato-0.2.md",
      "/mnt/d/Projects/MimirNL/docs/benchmarks/v03/fechamento-0.2.md"
    ],
    "cwd": "/mnt/d/Projects/MimirNL",
    "exit": 1
  },
  "linux-build": {
    "argv": [
      "/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node",
      "/home/usuario/mimir-task118-checks/linux/node_modules/typescript/bin/tsc"
    ],
    "cwd": "/home/usuario/mimir-task118-checks/linux",
    "exit": 0
  },
  "linux-suite": {
    "argv": [
      "/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node",
      "--test",
      "/home/usuario/mimir-task118-checks/linux/test/benchmark-abc.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/benchmark-antigravity-usage.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/benchmark-cache-diagnostic.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/benchmark-codex-usage.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/benchmark-context-selection.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/benchmark-live-flow.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/benchmark-metrics.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/benchmark-multicase-codex.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/benchmark-paired-probe.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/benchmark-preflight.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/benchmark-public-multicase.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/benchmark-v02.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/canonical-root.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/ci-paths.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/core-v03.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/core.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/hardening.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/npm-cli.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/review-corrections.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/sqlite-runtime.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/task104-launch.test.mjs",
      "/home/usuario/mimir-task118-checks/linux/test/v02-audit-relay.test.mjs"
    ],
    "cwd": "/home/usuario/mimir-task118-checks/linux",
    "exit": 0
  },
  "linux-schemas": {
    "argv": [
      "/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node",
      "/home/usuario/mimir-task118-checks/linux/scripts/generate-contract.mjs",
      "--check"
    ],
    "cwd": "/home/usuario/mimir-task118-checks/linux",
    "exit": 0
  },
  "linux-format-global": {
    "argv": [
      "/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node",
      "/home/usuario/mimir-task118-checks/linux/node_modules/prettier/bin/prettier.cjs",
      "--check",
      "/home/usuario/mimir-task118-checks/linux/src",
      "/home/usuario/mimir-task118-checks/linux/test",
      "/home/usuario/mimir-task118-checks/linux/scripts",
      "/home/usuario/mimir-task118-checks/linux/docs",
      "/home/usuario/mimir-task118-checks/linux/AGENTS.md",
      "/home/usuario/mimir-task118-checks/linux/CODE_OF_CONDUCT.md",
      "/home/usuario/mimir-task118-checks/linux/CONTRIBUTING.md",
      "/home/usuario/mimir-task118-checks/linux/README.md",
      "/home/usuario/mimir-task118-checks/linux/RELATORIO_IMPLEMENTACAO_V0.1.md",
      "/home/usuario/mimir-task118-checks/linux/ROADMAP_MIMIR_NL.md",
      "/home/usuario/mimir-task118-checks/linux/SECURITY.md",
      "/home/usuario/mimir-task118-checks/linux/eslint.config.mjs",
      "/home/usuario/mimir-task118-checks/linux/package-lock.json",
      "/home/usuario/mimir-task118-checks/linux/package.json",
      "/home/usuario/mimir-task118-checks/linux/tsconfig.json",
      "/home/usuario/mimir-task118-checks/linux/.github/workflows/ci.yml"
    ],
    "cwd": "/home/usuario/mimir-task118-checks/linux",
    "exit": 1
  },
  "windows-build": {
    "argv": [
      "/mnt/c/Windows/System32/cmd.exe",
      "/d",
      "/c",
      "set PATH=C:\\Users\\Public\\mimir-hardening-runtime\\git\\cmd;C:\\Users\\Public\\mimir-hardening-runtime\\node\\node-v24.22.1-win-x64;C:\\Windows\\System32&&node D:/mimir-task118-windows/node_modules/typescript/bin/tsc"
    ],
    "cwd": "/mnt/d/mimir-task118-windows",
    "exit": 0
  },
  "windows-suite": {
    "argv": [
      "/mnt/c/Windows/System32/cmd.exe",
      "/d",
      "/c",
      "set PATH=C:\\Users\\Public\\mimir-hardening-runtime\\git\\cmd;C:\\Users\\Public\\mimir-hardening-runtime\\node\\node-v24.22.1-win-x64;C:\\Windows\\System32&&node --test D:/mimir-task118-windows/test/benchmark-abc.test.mjs D:/mimir-task118-windows/test/benchmark-antigravity-usage.test.mjs D:/mimir-task118-windows/test/benchmark-cache-diagnostic.test.mjs D:/mimir-task118-windows/test/benchmark-codex-usage.test.mjs D:/mimir-task118-windows/test/benchmark-context-selection.test.mjs D:/mimir-task118-windows/test/benchmark-live-flow.test.mjs D:/mimir-task118-windows/test/benchmark-metrics.test.mjs D:/mimir-task118-windows/test/benchmark-multicase-codex.test.mjs D:/mimir-task118-windows/test/benchmark-paired-probe.test.mjs D:/mimir-task118-windows/test/benchmark-preflight.test.mjs D:/mimir-task118-windows/test/benchmark-public-multicase.test.mjs D:/mimir-task118-windows/test/benchmark-v02.test.mjs D:/mimir-task118-windows/test/canonical-root.test.mjs D:/mimir-task118-windows/test/ci-paths.test.mjs D:/mimir-task118-windows/test/core-v03.test.mjs D:/mimir-task118-windows/test/core.test.mjs D:/mimir-task118-windows/test/hardening.test.mjs D:/mimir-task118-windows/test/npm-cli.test.mjs D:/mimir-task118-windows/test/review-corrections.test.mjs D:/mimir-task118-windows/test/sqlite-runtime.test.mjs D:/mimir-task118-windows/test/task104-launch.test.mjs D:/mimir-task118-windows/test/v02-audit-relay.test.mjs"
    ],
    "cwd": "/mnt/d/mimir-task118-windows",
    "exit": 1
  },
  "windows-schemas": {
    "argv": [
      "/mnt/c/Windows/System32/cmd.exe",
      "/d",
      "/c",
      "set PATH=C:\\Users\\Public\\mimir-hardening-runtime\\git\\cmd;C:\\Users\\Public\\mimir-hardening-runtime\\node\\node-v24.22.1-win-x64;C:\\Windows\\System32&&node D:/mimir-task118-windows/scripts/generate-contract.mjs --check"
    ],
    "cwd": "/mnt/d/mimir-task118-windows",
    "exit": 0
  },
  "validate-command.json": {
    "argv": [
      "/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node",
      "/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-cli.mjs",
      "validate",
      "/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json"
    ],
    "cwd": "/mnt/d/Projects/MimirNL",
    "exit": 0
  },
  "original-format-command.json": {
    "argv": [
      "/home/usuario/.local/share/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node",
      "/mnt/d/Projects/MimirNL/node_modules/prettier/bin/prettier.cjs",
      "--check",
      "/mnt/d/Projects/MimirNL/src",
      "/mnt/d/Projects/MimirNL/test",
      "/mnt/d/Projects/MimirNL/scripts",
      "/mnt/d/Projects/MimirNL/docs",
      "/mnt/d/Projects/MimirNL/AGENTS.md",
      "/mnt/d/Projects/MimirNL/CODE_OF_CONDUCT.md",
      "/mnt/d/Projects/MimirNL/CONTRIBUTING.md",
      "/mnt/d/Projects/MimirNL/README.md",
      "/mnt/d/Projects/MimirNL/RELATORIO_IMPLEMENTACAO_V0.1.md",
      "/mnt/d/Projects/MimirNL/ROADMAP_MIMIR_NL.md",
      "/mnt/d/Projects/MimirNL/SECURITY.md",
      "/mnt/d/Projects/MimirNL/eslint.config.mjs",
      "/mnt/d/Projects/MimirNL/package-lock.json",
      "/mnt/d/Projects/MimirNL/package.json",
      "/mnt/d/Projects/MimirNL/tsconfig.json",
      "/mnt/d/Projects/MimirNL/.github/workflows/ci.yml"
    ],
    "cwd": "/mnt/d/Projects/MimirNL",
    "exit": 1
  },
  "windows-core-command.json": {
    "argv": [
      "/mnt/c/Windows/System32/cmd.exe",
      "/d",
      "/c",
      "set PATH=C:\\Users\\Public\\mimir-hardening-runtime\\git\\cmd;C:\\Users\\Public\\mimir-hardening-runtime\\node\\node-v24.22.1-win-x64;C:\\Windows\\System32&&git -C D:/mimir-task118-windows rev-parse HEAD&&node --test D:/mimir-task118-windows/test/core-v03.test.mjs"
    ],
    "cwd": "/mnt/d/mimir-task118-windows",
    "exit": 0
  },
  "windows-node-version-command.json": {
    "argv": [
      "/mnt/c/Users/Public/mimir-hardening-runtime/node/node-v24.22.1-win-x64/node.exe",
      "-p",
      "JSON.stringify({node:process.version,platform:process.platform,arch:process.arch,sqlite:process.versions.sqlite})"
    ],
    "exit": 0
  },
  "windows-version-command.json": {
    "argv": [
      "/mnt/c/Windows/System32/cmd.exe",
      "/d",
      "/c",
      "set PATH=C:\\Users\\Public\\mimir-hardening-runtime\\git\\cmd;C:\\Users\\Public\\mimir-hardening-runtime\\node\\node-v24.22.1-win-x64;C:\\Windows\\System32&&where git&&git --version&&node -p \"JSON.stringify({node:process.version,platform:process.platform,arch:process.arch,sqlite:process.versions.sqlite})\""
    ],
    "exit": 0
  }
}
```

## Estado para105/111

Checks técnicos ainda pendentes: Windows36 falhas e formatação19 arquivos. Preparação não autoriza modificar freeze. `technical_complete: false`, `publish_pending: true`; nenhuma aprovação final111 foi emitida. Review110 está disponível e deve ser consolidada pelo responsável105 sem reabrir respostas ou retunar. A revisão final deve avaliar a migração documental proposta e as incompatibilidades Windows; este relatório não fecha105 nem libera release.
