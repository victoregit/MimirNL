# Task120 — Portabilidade e consolidação105

Data: 2026-10-27, America/Sao_Paulo. Estado: **technical_complete pending_review111**, publicação pendente de autorização específica. `actual_model_calls: 0` nesta tarefa; `historical_actual_model_calls: 54`. Nenhum novo live, epoch, retuning, avaliação privada, commit, push, publicação, dependência, version bump, CI ou delegação.

## Entrega e associação histórica

Implementado o plano119 aprovado, na ordem exigida pela [especificação120](120-task105-portability-closeout.md). Documentos de entrada: especificação105, resultado118/logs, resultados103/104, pareceres108/109/110/114/119. A aprovação119 era do plano; esta implementação inteira requer revisão111, sem autoaprovação.

Antes de editar bytes preservados, os 318/318 arquivos da baseline118 foram conferidos. Snapshot público `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103-executed-snapshot.tar`: 350 membros regulares, os 318 originais mais LICENSE e especificações/pareceres públicos necessários. Paths relativos, nenhum link, credencial, configuração pessoal, node_modules, banco, gold ou coordenador privado. O arquivo contém os 27 executáveis/core do manifesto, package/lock, dependências documentadas, imports locais/dist necessários, contratos, testes, evidências103 e launcher113 original. Os dois manifestos históricos conferem seus 27/27 hashes dentro do tar.

SHA256 do tar: `f37365350929052e21eee560f9de13d35e93ff563e819a19579b90efb1abec80`. Inventário de todos os membros: `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103-executed-snapshot.sha256`. Launcher arquivado: `2e48347bc7931470c988c65f9bca79eb248c5f5b74094926683ca260d921eb38`; não executado nesta tarefa. A associação da execução104 permanece aos bytes históricos, não ao checkout corrigido. Nenhum manifesto/code hash histórico foi recalculado para fingir execução corrente; nenhum parecer antigo foi reescrito.

Extração isolada em `/home/usuario/mimir-task120-snapshot`, verificada membro a membro contra inventário; dependências existentes copiadas da infraestrutura118, sem instalação. Git mínimo público118 reutilizado, sem config/hooks/remotes pessoais; não é necessário ao runtime do replay com bundle já exportado. Replay exclusivamente offline do manifesto histórico: **54 transportes sintéticos, 18 buscas SQLite, 0 chamadas reais, stopped=false**. Resultado em `/home/usuario/mimir-task120-snapshot-replay`; JSON de comando/exit0 e log públicos em `tasks/120-checks/snapshot-replay.*`. Conferidos status synthetic, response/usage null e vínculo com o manifesto offline. Não aberto holdout real. Sintético não é prova de execução LLM ou de qualidade.

Arquivos tar e inventários foram tratados como imutáveis após criação e novamente conferidos. O pedido chmod0444 no mount WSL resultou em modo0555 observado; não se afirma proteção POSIX/ACL ou imutabilidade imposta pelo filesystem. A integridade é verificável por SHA256 e inventário, e os tars não foram regravados.

## Código e segurança

Mudanças limitadas a scripts/helpers/testes de benchmark, formatação e documentação autorizadas. Todos os arquivos de `src/` e `dist/`, package/lock, AGENTS e CI são byteidênticos à baseline anterior. Quatro fontes Core108 e parâmetros/policy congelados preservados; política canônica `b834e4f46a31b241eeb90ba6edee5ebfb61b8a8abb204fc8b5986620e6216103`. Sem mudança de gold, pools, queries, recuperação, tuning ou contrato semântico. O source bundle/pin público continua histórico.

As seis causas119 foram corrigidas:

1. Harnesses usam `tmpdir()` e `join`, sem depender da existência de `/tmp` no Windows.
2. Subprocessos usam `fileURLToPath`; imports ESM gerados e guards `--import` usam `pathToFileURL`.
3. Comparação Git/Node usa caminhos resolvidos nativos em contract-v02 e export-cases; a validação de paths portáteis de repositório continua estrita e o canonicalrepo do Core não mudou.
4. `offline-files.mjs` valida cada componente local antes de normalizar traversal e percorre cada ancestral com lstat; recusa symlinks, componentes sensíveis, controles, caminhos relativos, UNC/device/drive-relative no Windows e nomes portáteis inválidos. `portable()` permanece intacta.
5. Helpers/runtime ABC e transporte multicaso usam validação local nativa para saídas. Guards de I/O mantêm a allowlist exata; a troca de separadores não autoriza arquivos novos.
6. `withSymlink` captura somente setup EPERM em Windows e registra um subteste skip com motivo. Os callbacks negativos continuam reais no Linux; nenhuma suíte ou restante do teste é pulado. Collision/canary/input/cleanup continuam executados no Windows.

Bugs latentes após os bloqueios iniciais: `/tmp` também estava hardcoded nos probes e manifesto multicaso; imports dinâmicos e guards gerados usavam paths POSIX; inventory ABC concatenava separadores mistos; chmod era testado como POSIX no Windows. `temporary-output.mjs` verifica containment por componentes sob o temp do sistema e recusa pais symlink antes de criar exclusivamente a saída. O transporte real permanece restrito ao Linux; Windows usa injeção sintética. A proposta multicaso histórica com path Linux continua com hash original e é corretamente rejeitada como destino físico Windows; o restante do teste v2 executa normalmente com path nativo, sem skip amplo. Asserções POSIX de privacidade seguem exatas no Linux; no Windows apenas flags de leitura/escrita são verificáveis por chmod, sem alegar ACL privada.

Dois fakes antigos tinham corrida sob carga: timer10/15ms podia vencer antes do setImmediate que entregava eventos. Eventos sintéticos agora chegam por microtask antes do timer; casos sem timeout não usam deadline artificial15ms. Limites de produção permanecem congelados. Novo teste `/mnt/d/Projects/MimirNL/test/offline-paths.test.mjs` cobre componentes sensíveis/traversal, paths nativos, symlinks, containment temporário, exclusividade e preservação de arquivo existente.

## Evidência pública e formatação

Pacote `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task104/`:

- `executed-results.tar`: 55 membros originais byteidênticos — results e positions00–53. SHA256 `11ac0ae6536f6471c939f3ade5e01d490db3ee0f53775d97a4b49c28a66693f7`; `SHA256.json` inventaria esses membros históricos e `executed-results.sha256` identifica o tar.
- JSONs soltos são visões formatadas equivalentes, com hashes em `formatted-SHA256.json`. Treze arquivos104 precisavam de Prettier, portanto a cópia byteidêntica permanece no tar, sem ignores/bypass ou alteração dos originais externos. Extração virtual confirmou todos os55 hashes e igualdade canônica com as visões.
- Respostas públicas tiveram bytes/hash conferidos; manifesto vinculado ao proposed histórico `e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92`. Nenhuma autorização, coordenador, gold, rubrica, reasoning, transcript, stderr ou path privado está neste pacote. As fontes/tarefas públicas estão no bundle do manifesto arquivado.
- README traz instruções de snapshot e replay offline; `metrics-summary.json` resume somente o parecer público110, sem case IDs ou novos julgamentos. Dados privados110 não foram abertos, copiados ou reconstruídos.

Aplicado Prettier aos19 arquivos pendentes118 e aos arquivos correntes alterados/novos. `.prettierignore` não mudou. Todos os57 JSONs103 conservam igualdade canônica, incluindo os15 que mudaram de bytes. Inventários históricos permanecem associados aos tars; nenhum hash novo é apresentado como hash executado104. Documentos de transição: `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/contrato-0.3.md`, `fechamento-0.3.md` e README do pacote104. ROADMAP e divisão de tarefas receberam atualização corrente sem apagar histórico.

## Checks finais

Infraestrutura isolada118 reutilizada: Linux `/home/usuario/mimir-task118-checks/linux`; Windows `/mnt/d/mimir-task118-windows`. Node24.22.1 x64, SQLite3.53.4 nos dois. Windows usa Git portátil2.56 e PATH somente por processo; nenhuma configuração pessoal/dependência nova. Builds e suítes completas nas cópias. Logs/argv/cwd/exit codes persistidos em `/mnt/d/Projects/MimirNL/tasks/120-checks/`.

| Check final                                | Linux                                        | Windows nativo                                |
| ------------------------------------------ | -------------------------------------------- | --------------------------------------------- |
| typecheck                                  | exit0                                        | exit0                                         |
| lint src                                   | exit0                                        | exit0                                         |
| build TypeScript                           | exit0                                        | exit0                                         |
| schemas --check                            | exit0                                        | exit0                                         |
| Prettier global, escopo oficial sem bypass | exit0                                        | exit0                                         |
| suíte completa final                       | 146 reportados:145 pass,0 fail,1 skip; exit0 | 155 reportados:145 pass,0 fail,10 skip; exit0 |
| Core108 na suíte completa                  | 6/6                                          | 6/6                                           |
| git diff --check                           | exit0                                        | não é CI remoto                               |

Skip Linux: aliases de short-path exclusivo Windows. Skips Windows: teste de grupo POSIX preexistente e9 subtestes restritos ao setup symlink EPERM, incluindo o novo teste de segurança. Não houve aborto de módulo; os totais Windows maiores refletem esses subtestes explicitamente registrados. O teste novo também passou isoladamente no Linux. Focused final: Linux96/96; Windows104 reportados,95pass/9skip/0fail. A suíte completa acrescenta o novo teste de caminhos e executa todo o restante.

Falhas iniciais preservadas: baseline118 Windows36fail; primeiro focused120 Windows25fail após remover bloqueios de carregamento; segundo5fail; final0. Linux teve uma corrida em context-selection no primeiro focused e outra em paired-probe no segundo, ambas corrigidas no fake. Logs iniciais e finais não foram substituídos por alegações verdes. Após focused verde, código final passou uma única suíte completa em cada plataforma. Não foi executado CI remoto nem novo aceite de host real.

## Limitações e revisão

Qualidade110: sucesso e source_accuracy54/54, igualmente A/B/C; delta B−A0. B consumiu +7.664 tokens de entrada (+2,93%); sem economia demonstrada. Cache ambiente positivo54/54, sem cold subset e sem causalidade atribuível ao Mimir. Busca B acrescentou média21,58ms; sem redução robusta de latência total. HistoryC0; A=C18 envelopes, sem baseline de histórico longo ou demonstração multiturno. Modelo efetivo, custo, TTFT e latência exclusiva do modelo unavailable. Representatividade ampla e generalização não demonstradas; repetições evaluation não são casos independentes. Aprovação110 não é aceite humano de release.

Todo código alterado/novo deve seguir CodeReviewer111 antes do fechamento definitivo105. Estado técnico completo, **pending_review111 / publish_pending**. Nenhum teste ou aprovação119 substitui esse gate.

## Inventário e diff para111

- `/mnt/d/Projects/MimirNL/tasks/120-checks/before.json` e `after.json`: hashes dos350 paths preservados, antes/depois; `changed-from-snapshot.json`:43 arquivos históricos alterados autorizados.
- `/mnt/d/Projects/MimirNL/tasks/120-checks/current-inventory.json`: hashes de paths absolutos dos43 arquivos alterados e68 novos artefatos públicos, incluindo helpers/teste/docs/tars e pacote104. Logs e relatórios têm inventário separado.
- `/mnt/d/Projects/MimirNL/tasks/120-checks/current.diff`: diff exato contra snapshot, incluindo código originalmente untracked e novos arquivos textuais; tars conferidos pelos hashes, sem diff binário fictício.
- `/mnt/d/Projects/MimirNL/tasks/120-checks/integrity.json`, `snapshot.json`, `snapshot-replay.json`: conferências formais; arquivos `*-checks-final.json` e `*-full-final.json`: comandos/cwd/exit reais; `status-before.txt`/`status-after.txt`: dirty preservado, exceto edições autorizadas.
- `/mnt/d/Projects/MimirNL/tasks/120-checks/run-isolated-checks.py` e `run-final-checks.py`: comandos locais reproduzíveis, sem instalação ou modelo. Dependem das cópias isoladas118 existentes.
- `/mnt/d/Projects/MimirNL/tasks/105-v03-durable-closeout-result.md`: fechamento consolidado pendente111.
