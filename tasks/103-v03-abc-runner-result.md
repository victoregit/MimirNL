# Task103 — Relatório de entrega do executor ABC e manifesto 0.2

Data da conferência documental: 2026-10-27. Retomada autorizada pela Task110. `actual_model_calls: 0`.

## Escopo e estado

Este relatório supre o arquivo ausente apontado na revisão109. Nesta retomada foi criado somente `/mnt/d/Projects/MimirNL/tasks/103-v03-abc-runner-result.md`. Não houve execução de testes, replay, modelos, avaliação104, exportação privada, alteração de core/policy/manifestos, commit, push ou publicação. Alterações preexistentes foram preservadas. Não foi aberto holdout privado nem arquivos de credenciais.

O parecer `/mnt/d/Projects/MimirNL/tasks/109-v03-abc-runner-review-findings.md` continua **CHANGES_REQUESTED**. A presente entrega deve retornar à revisão independente109 antes104: há divergências reais no inventário do parecer, discriminadas abaixo. A criação deste relatório não constitui aprovação nem autorização live.

## Dependências e comportamento entregue

Pareceres consultados com APPROVE: `/mnt/d/Projects/MimirNL/tasks/100-v03-amendment-review-findings.md`, `/mnt/d/Projects/MimirNL/tasks/106-v03-corpus-review-findings.md`, `/mnt/d/Projects/MimirNL/tasks/107-v03-metrics-review-findings.md`, `/mnt/d/Projects/MimirNL/tasks/107-v03-metrics-code-review-findings.md` e `/mnt/d/Projects/MimirNL/tasks/108-v03-core-review-findings.md`. São aprovações técnicas; autenticidade dos recibos permanece a verificar pelo supervisor e não equivale a aceite humano do gold.

Core108: quatro hashes fonte conferidos e iguais ao parecer. Configuração canônica congelada `b834e4f46a31b241eeb90ba6edee5ebfb61b8a8abb204fc8b5986620e6216103`, balanced-v1/verified-ties-v1/compact-v1, telemetry false, limit3, tokenBudget32000. Nenhum retuning. HEAD local `166e3cf047b2078952e43dc8e9171e053e99e2ce` não incorpora as alterações dirty; o inventário de arquivos, inclusive dist, é a referência executável.

A implementação existente separa exportador/coordenador privado e runtime público. O envelope contém cenário/tarefa/query/pool/base, sem gold, IDs/splits ou recibos privados. A/C preservam a mesma base com histórico de zero bytes; B faz uma busca Service/SQLite real, preserva sobreposição com a base e retorno vazio, sem oracle. Seed usa fontes/proveniência candidate/user e banco próprio por posição. Hash lógico inicial/seed/final e hash físico após close são distintos. Não se exige seed=final: 14 posições B registram mudança do estado lógico após busca; isso não caracteriza por si só corrupção/reset falho.

Plano público com 54 posições, 18 por braço e rotação ABC/BCA/CAB; divisão 27dev+27eval consta do parecer109/coordenador, não é inferida de IDs privados neste relatório. Concorrência1, retry0, 90s/chamada, 120s/posição, 5s/busca, 120min/global, contexto32000bytes e captura64000bytes. Primeira falha interrompe e preserva not_run. Operações síncronas não são preemptíveis. Sintético não significa completed nem resposta LLM elegível. Métricas ausentes permanecem null/unavailable; julgamento externo segue metricas-0.2/metrics-v02, sem estimar tokens/custo/TTFT por bytes.

## Manifestos e integridade atual

Hashes de arquivo (bytes) e canônicos são diferentes. Recalculados os canônicos por JSON de chaves ordenadas, separadores compactos e exclusão do campo superior sha256; ambos coincidem com o campo gravado e o parecer109. Todos os 27 arquivos do campo code de cada manifesto foram comparados por SHA256 de bytes: nenhuma divergência com o disco.

- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/offline-manifest.json`: arquivo `c4af7a6c2107036d263199a1c648b066ddc3bd05261f2b0e695795251587ddea`; canônico `a2d46641efa2d8b1752760b88c9136d21cbd376b035a248f1e83e3c2e2274651`; stage=validate, synthetic=true, not_execution_proof=true, epoch=1.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json`: arquivo `84214d6b70e058bfae8081d77c5935a15d0103f8753210bc43f2d6a3b620bf21`; canônico `e518dd6414b34eaaf64ca783fd389b3e72d5f8965ee74d1214a1b5de36eedc92`; stage=run, synthetic=false, not_execution_proof=true, epoch=1.

## Divergências em relação ao parecer109

Nove arquivos têm SHA256 atual diferente do inventário textual de109. Não há evidência suficiente nesta retomada para atribuir causa ou data dessas diferenças. Os arquivos ABC presentes no inventário dos manifestos coincidem com os manifestos, mas isso não substitui revisão independente dos bytes atuais. Nenhum hash foi corrigido artificialmente e nenhum documento histórico foi regravado.

| Arquivo absoluto | SHA256 registrado em109 | SHA256 atual |
| --- | --- | --- |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-cli.mjs` | `c539dd895efadad3f6b4b4dd4f958742588c422aa91187ebdfb7c258d4ae7cb5` | `f7ac762147cf53fb0979620f9be4cf933c4453efe860761f8955ce8a2268bbf6` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-export.mjs` | `fbc7ec48c77ea1dfb60166a939fbfb61d4791a82ef45b5be3d0016a2cc6dfa42` | `cbe4c27d0d89d631e492a7f602ebcd499d39a12344457d7bba69e3ad7f5887f0` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-private-cli.mjs` | `fc575ba800f13524b0a886f44f910404495b4cbdf520422c54d76203cf97e20b` | `76f16ed148118198b045200561ceac13cb248506e162eeb00a3f27436bec0f71` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-public.mjs` | `95bc8bf6424564c8d5045610738e404bca7d42cfb2d0752538186f81156fe4fc` | `3ad4be78c9dc88e6596bebcb46b3e4e6556adaa749e9ace0f25342452096a3b3` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-runtime.mjs` | `8e6c466986fa88f91db7998b47936495beea8380e227092c2daef1b41e8c0571` | `2e91a8992ad06084431b8811d9ace721d5904d4a1a72440bcc6704dfd9fc8f57` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-transport.mjs` | `8a186dcf2ebae5669b910e5256e09e03d49b06ce2e03aa3597d519be9485bb21` | `7fb4c1c119523eb7ef6010196d2418fdf68a30f2f8bf0046141da5b5a44fe31b` |
| `/mnt/d/Projects/MimirNL/test/abc-fixture.mjs` | `11bf9841804d9c490ff1966a3473950fb20e9858544c0bf49ba3268809ff4fe4` | `5a4f182e7a980ed0dc4c8292e366960b6cf927e6befba72e97d4811faa6200c0` |
| `/mnt/d/Projects/MimirNL/test/benchmark-abc.test.mjs` | `90ca9e14a1c1d530f6120b0b8c2beea2163b715694c9e836171f251f98d752f9` | `6c837debeb6902769d2040340cce7009e6fe44809f6102f7c7921841ad1df0ab` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/executor-abc-0.2.md` | `1607593c6f37ee0572e0081bf4ef8c8f070198031d2ba7b2c01d9f056d959f63` | `5e57d8ac458be4b094d2384d8890ba4b40f81680cfb29919616a9d7509f18b74` |

## Evidências anteriores consultadas, sem nova execução

- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/fullsuite-linux-final.log`: cabeçalho npm test/build; 142 testes, 141 pass, 0 fail, 1 skipped, duração24764.415011ms. O log anterior fullsuite-linux.log também registra141pass/1skip/0fail. Não são testes executados nesta retomada.
- Parecer109 registra10 testes ABC focados e6 testes core passados com Node Linux24.22.1 em `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`. Não foi encontrado log focado próprio em task103; esses números são atribuídos ao parecer, sem afirmar nova execução ou vínculo comprovado aos nove hashes atuais divergentes.
- Logs `typecheck.log`, `lint.log`, `schemas.log` em `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/`: cabeçalhos tsc --noEmit, eslint src e build/generate-contract --check, sem diagnóstico de erro. O parecer os registra OK; os arquivos isolados não persistem exit code. Lint src não comprova lint dos scripts ABC.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/windows-validate.log`: JSON stage=validate, hash canônico offline correto, actual_model_calls0, execution_proof=false. O log isolado não prova plataforma/versão; validação Windows é atribuída ao parecer. Não comprova suíte/offline Windows nem live.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/results.json`: conferidos54 runs synthetic, 18 por braço, actual_model_calls0, synthetic_transport_calls54, retrieval_calls18, stopped=false, global_elapsed_ms28476.079992. Todos os54 arquivos position-00.json até position-53.json coincidem estruturalmente com as respectivas entradas de results.json. Todos têm response/usage null e cleanup=completed; A/C têm context_sha256 igual em cada bloco. Reprodução existente usa projeção pública dos casos com transporte sintético; não houve abertura do holdout nesta retomada.

## Inventário SHA256 atual de arquivos absolutos

Inclui código executável declarado, exportação, fixtures/testes, parâmetros, revisões e evidências. Os54 arquivos position também estão listados para conferência independente.

| Arquivo absoluto | SHA256 de bytes |
| --- | --- |
| `/mnt/d/Projects/MimirNL/dist/core/schemas.js` | `b9569008ae772b110af38bef96bd24ec9e0f45215988978ebfdd69f64c15388b` |
| `/mnt/d/Projects/MimirNL/dist/core/service.js` | `deddf5e7ed42886d4615189e04395166054a4efc21e58c8c6d761bf2283cff50` |
| `/mnt/d/Projects/MimirNL/dist/index.js` | `eba238510ddb487008ea2b84105fbfa2ff4e9103990a0df219bb35a3eb10b0f6` |
| `/mnt/d/Projects/MimirNL/dist/ingestion/adapters/git.js` | `969117411f15214945e70e5ef36c66c6ef7c6196a1e1358ea616705f3a0843ab` |
| `/mnt/d/Projects/MimirNL/dist/learning/index.js` | `f0a7c6eab3e0f080583c34eca803141c58890d21361f8dfad140348cbd118d49` |
| `/mnt/d/Projects/MimirNL/dist/optimization/index.js` | `3fcc5a9b925f531978ae47520237162b6c43ce46d60e82bdb3dee113c9510992` |
| `/mnt/d/Projects/MimirNL/dist/retrieval/index.js` | `d448fd1773a31f418bb506f326f8220988b6ede4e2ebd6a371ce1223495449f9` |
| `/mnt/d/Projects/MimirNL/dist/security/index.js` | `4a0c7ba9ae85073955cd844a9e788e181dbd4b8f6180931f47d994e0c489870f` |
| `/mnt/d/Projects/MimirNL/dist/storage/backup.js` | `b1c56bec89f869a02c0bf95c6633f9aa1aee0fa0a58b98cf0cf4533e0b0505bd` |
| `/mnt/d/Projects/MimirNL/dist/storage/index.js` | `54959da7e32a149a91cbd89d066b1873ce3b52038175e2bb736f436afedb92ec` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/core-parameters-0.3.json` | `1d050d6a51fe5d8142571898a1e3f67fc782fe64aef527be44ad0b0e4285057b` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/fullsuite-linux-final.log` | `4f9cdfcf4f488d19bcd3ca0492a19717ab4e5ba479257e4f349b939f6cc830d2` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/fullsuite-linux.log` | `027bf1a13d937e6d4b4f4ad516664d3942fa476672ab39690aa3b2ce7a08eb07` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/lint.log` | `0dd938710a501b3e9a32276f089161ca8bb379aae7900cf32eabb8d47fba6357` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-00.json` | `73ce9025865e1b5d014e7575848b32d98edb619f2bff16fae5ca1368d79a99bc` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-01.json` | `7b0a316d68c2534533427d89fca7a284974e612772f63784dab9a36c6061fe3a` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-02.json` | `cb85e17db3234838fa2f29edbfab0243e4381851fb4b2d25e04710b200d3b196` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-03.json` | `e4f78883243baa0f1393b7671216da7da7671ebf769eee1337ce88da6aa6b033` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-04.json` | `0e87106cf64981a63012b857d4d9798dd0d36859c2ccd351c7403a8df2051a27` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-05.json` | `3c2f9040323c8706cc955002d8a614f630ce4f9362fc93b830de529af74ca312` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-06.json` | `0ed0752a7b89ede8fada51c4302cb86c8532c00685d2a753042b2c0285476071` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-07.json` | `892141ccf77844de5f63e26d2f560b42fd12ec89af9c907bdad80485f3472406` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-08.json` | `d28a07aedfa891e0ee5621f1e2ce5e972a4dc336e453829d069e8bcc73bedde2` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-09.json` | `9cc8f61edaebed610e8613c3ffbcec9d064c4a91cddfbd92360c132a5f4be2c3` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-10.json` | `69cf51b660cbebd74771afda36227edf3bbadb321f2c5581b17ef12bf84a4122` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-11.json` | `691abf6d411cf937b012f31732398711d7e8cea46bbc80081e81ee03947121aa` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-12.json` | `3e9cc1aa37f28efe8652fd4a33cac8e0e2cc17adf1202c342f824454a45a4b6b` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-13.json` | `0e157a94ea809acd8e58838f07c692572c548cfd6c5ae786d8acf7a2beadfb51` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-14.json` | `66edddeb9249f666360c3850875bab3c52bd5527b22d0b9d3a790a171fbd6026` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-15.json` | `cf9fb70c675486579577794de02c4ad1aff3e9ff718b8d2200b4ef418b73ad19` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-16.json` | `e62333cf6d8eed3625297da538d3498095053aea084740de3c37087b7938f909` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-17.json` | `e96af55e96ae28052cd7ddb5a689b2f0e6c47d86f936fe91efef59108ffdac8a` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-18.json` | `1bfae8b1370cbf4bd82dc32a60275a6f5b874407fb61449318391ec1e04b063d` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-19.json` | `5e52db9fa45abc3b37020ab855c700bdfb4c412d986781928f9fba7457988e96` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-20.json` | `638b9f5445b1003a1169022ecf81597d399d7b787c8a0c640fb4ba755220b466` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-21.json` | `720369233cfd6824e646a3a548d021a1701a8b7cbb284c727f883cd122bfef41` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-22.json` | `7d48396bc5f8d09440e0a6ef2e6d17f96dfa1883bb1371d4ac9cde1bd4ea12d4` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-23.json` | `c6128a296bffefa3e67f9ceada0517125f8ed4f3c4ea7bbe8b277d4e2af59d46` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-24.json` | `a008b0089fa1c1b7b0c763821273152d526b94c4942ad366c0d2df88b1a7017d` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-25.json` | `6a27ca47bd6f852e2498640cb518c53df3ab529246f3c98cd87c3f292b2d0d36` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-26.json` | `561b3d5165910c8a529351adba12766bf5fb531fc346f3ac0256e6480f463dbe` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-27.json` | `84fbbc408e0472db6e1e63d26a2b8253514801a010ceb7da76df373d851d3493` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-28.json` | `5087850f58453262f0e47674c638a738096110f819c86de57cf035980a4cd4ca` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-29.json` | `a415f61a844eeccf0a21be41cc0aa1f5ac9d21ca6ceec75f5fb0869bf1bc88da` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-30.json` | `860ccfb261deb253df69f3ac9cfbce36471299ea4e28f808ea0aa4cdf9d3a170` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-31.json` | `3ec36daea6f02326bb32a89f5ff4344b08f577a765a138968ed2f27fcd8c4d60` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-32.json` | `d65dc9ace14e74e521e27d05cc6093a1d9576b77848ea3efe784a2110a6a55e6` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-33.json` | `f7ccf39767e5a4d547843ea81d31e55f8dbfb0c1a7bba676e9a6f1c79812ae79` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-34.json` | `aab28de11ee0b25bfd1df2e82d911122bc50dd871deb1785c43c744be77ad897` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-35.json` | `3ac1797694e1d77b204fd0fe07505f5de406f7c60427918587f7148ea4e123b1` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-36.json` | `ee894803aadd3fca8a0144f2ff1e7b14e801bcaec424bf492fd069ba60c0e6df` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-37.json` | `7f9ce1da4f95804b6e793c22d24b6802cf0410c9e4e5db8d0e014d15fba771eb` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-38.json` | `4508b5e8fe0ee313c60e2e7f1adbfbb8dbc228979bdca343944930cd6b77bd18` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-39.json` | `567604befdd4f0c5d167a5b94d06636a8f4ce789c73ea308799881b9dbc93d22` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-40.json` | `8a0489df4fb1dfc5598c158b6e3e4766201822f69d0ae3f005df786d58730d1c` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-41.json` | `1a4156404130b2f5dd62e41d6195534a1afb00cbeda035f119c8ec6ba1ed6211` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-42.json` | `c66d3430222109ac329db1843490d102ae07f8bd896e8552011f121490c459d5` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-43.json` | `2e02c175cbce41a5f9d7a1032548550ad8fb194f0d525bd5afd0cc6eb559bd83` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-44.json` | `08b2ae63d5eb0ccc3c221312d9ce33cad6c32c113685614dd5e65ea478380da4` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-45.json` | `4095c048741708ad2eadae735bd7a9ba2f2103fafcec51b5c652bee3e87dd3dc` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-46.json` | `f46a7297fcff2cc9b22477dfdcd3f9fdcd7659768e2ea10e43966c0cf4bab073` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-47.json` | `16aa8ccc1a84da454ab48955502835aae813b041ea4bdf38230a2d47d8d1bc64` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-48.json` | `5b80cc77c12a707bc046161028eddbb91c93af238d1c18901e4ef707542d6862` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-49.json` | `ade7b4453ec82ded6dd0613fb08058a3e3d8ab1180a868d4968e33002cb397d3` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-50.json` | `8912dc39b828d963e572bddc8a9c22172437f420e3f70969bee75ac09166c6e0` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-51.json` | `d30571f8df3089185214aa7ee4831f1e09a272413e1aa1dcea6ef8ebe417ae79` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-52.json` | `3ddbeaf0e23761cb6fb671fc9bc2d9cfdd3ffac3854ece370d40ffc95ad9a77b` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/position-53.json` | `08bf56e124bcfdb391799e820217c9db22f5aa54fb80faf6df908ff5d72c8b79` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/offline-replay/results.json` | `e9057c3c385611423730c51de188aa3e805da1f6c50c29450f79b0363f6bff0d` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/offline-manifest.json` | `c4af7a6c2107036d263199a1c648b066ddc3bd05261f2b0e695795251587ddea` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/proposed-run-manifest.json` | `84214d6b70e058bfae8081d77c5935a15d0103f8753210bc43f2d6a3b620bf21` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/schemas.log` | `0a0529a6a10d434a1c893e4fd591033dc36938d6d22b45bd8bea09323da129c6` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/typecheck.log` | `b57b41a3abab508d7c31d6d1f5ef805a1a2ba72fdab9976f302a45d58a97d7a6` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/windows-validate.log` | `960e4bb9a4231b54c22c157bde1b827172603f26eeb983e383b8f58707630264` |
| `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/executor-abc-0.2.md` | `5e57d8ac458be4b094d2384d8890ba4b40f81680cfb29919616a9d7509f18b74` |
| `/mnt/d/Projects/MimirNL/package-lock.json` | `046525813b80457bf04d2d87cfd035a262570402c3da7a182bb57059d6dd3351` |
| `/mnt/d/Projects/MimirNL/package.json` | `601000afc1dd9916e16728e7322949ec065410c10d3b47a578dac0ce9aec68f0` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-cli.mjs` | `f7ac762147cf53fb0979620f9be4cf933c4453efe860761f8955ce8a2268bbf6` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-export.mjs` | `cbe4c27d0d89d631e492a7f602ebcd499d39a12344457d7bba69e3ad7f5887f0` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-private-cli.mjs` | `76f16ed148118198b045200561ceac13cb248506e162eeb00a3f27436bec0f71` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-public.mjs` | `3ad4be78c9dc88e6596bebcb46b3e4e6556adaa749e9ace0f25342452096a3b3` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-runtime.mjs` | `2e91a8992ad06084431b8811d9ace721d5904d4a1a72440bcc6704dfd9fc8f57` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/abc-transport.mjs` | `7fb4c1c119523eb7ef6010196d2418fdf68a30f2f8bf0046141da5b5a44fe31b` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage-cli.mjs` | `59c68c5ba1793b02ea8e910736bd66cf6122c8ffd07e95a439dfa704b196db07` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage.mjs` | `ff5a77cd0ce9654e3e3e65de5073ef8ebeb598bff9dafaaefaec15f4f7c78d70` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/contract-v02.mjs` | `ec81fb371e187700196ddb183c34bf4f13fe2f847187fdb42d364df93c8fe6ea` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex-transport.mjs` | `b38c6408b06f16ab3ee4c21db89b6fbcb67fcfa6d4c7d6df9088b9b88a05f1c0` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/offline-files.mjs` | `0701e5d2c53e3dc644b85d09bda023a1546933fd070203d1c15b6b7d3ab40508` |
| `/mnt/d/Projects/MimirNL/scripts/benchmarks/public-bundle.mjs` | `974d1ce2748c35e2d7d4d3444c33c40fcb0d7a4ddd80eb61225e056312054f7b` |
| `/mnt/d/Projects/MimirNL/src/core/schemas.ts` | `2b3cf8e9a9a0f54e1547776c20f00e9437089102c318673111c086450da16e9c` |
| `/mnt/d/Projects/MimirNL/src/core/service.ts` | `dd46662d03ef022cea70e35e7276e789a2f4e69c1c11a1af3f3563f9e71e9e94` |
| `/mnt/d/Projects/MimirNL/src/optimization/index.ts` | `4dd5c182ae7631169dab169c44b90d177ded821d9250e61975aaed85d65412fc` |
| `/mnt/d/Projects/MimirNL/src/retrieval/index.ts` | `f0021222bf83fc5d02818a3c73ac03a4cdde1c33eb2cebb5a421ef5dd1f47d30` |
| `/mnt/d/Projects/MimirNL/src/storage/index.ts` | `d7c666d28cb8a6167c62d16de0624e6ce66f5eb8abefe0dd60b532ffe3eb1b54` |
| `/mnt/d/Projects/MimirNL/tasks/103-v03-abc-runner.md` | `2aece678939a555bf4fa3991c2849f6ef10c60cd3af072be3dce771faea9041b` |
| `/mnt/d/Projects/MimirNL/tasks/109-v03-abc-runner-review-findings.md` | `e2aeaaa77d78707bca16e7b7dfc4601f92db24f1e4d73f08e5c9e81688961b2a` |
| `/mnt/d/Projects/MimirNL/tasks/110-resume-task103-report.md` | `ad23cc0264b4d457fc7bf33a04623db3e037b0ac3cfac4ac022c38e0c8183da9` |
| `/mnt/d/Projects/MimirNL/test/abc-fixture.mjs` | `5a4f182e7a980ed0dc4c8292e366960b6cf927e6befba72e97d4811faa6200c0` |
| `/mnt/d/Projects/MimirNL/test/benchmark-abc.test.mjs` | `6c837debeb6902769d2040340cce7009e6fe44809f6102f7c7921841ad1df0ab` |

## Comandos de conferência e reprodução

Executados nesta retomada: `git status --short`, `git rev-parse HEAD`, `git diff --stat` na raiz `/mnt/d/Projects/MimirNL`; leitura dos arquivos explicitamente referidos; Python3 com pathlib/hashlib/json/re/collections para SHA256 de bytes, comparação com inventário109 e code dos manifestos, recálculo canônico, contagem dos runs e igualdade JSON das54 posições. Não foi executada CLI runtime nem importado executor. A validação documental não substitui testes de software.

Conferência reproduzível, somente leitura:

```bash
python3 - <<'PY_CHECK'
from pathlib import Path
import hashlib, json
root = Path('/mnt/d/Projects/MimirNL')
for name in ['offline', 'proposed-run']:
    path = root / f'docs/benchmarks/v03/evidencias/task103/public-plan/{name}-manifest.json'
    manifest = json.loads(path.read_text())
    payload = {k: v for k, v in manifest.items() if k != 'sha256'}
    canonical = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(',', ':'))
    assert hashlib.sha256(canonical.encode()).hexdigest() == manifest['sha256']
    for relative, expected in manifest['code'].items():
        assert hashlib.sha256((root / relative).read_bytes()).hexdigest() == expected, relative
    print(path, hashlib.sha256(path.read_bytes()).hexdigest(), manifest['sha256'])
PY_CHECK
```

Para futura reprodução offline, apenas após escolha de diretório novo: `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/abc-cli.mjs offline /mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/task103/public-plan/offline-manifest.json NOVO_DIRETORIO_ABSOLUTO`. Comando documentado, não executado nesta retomada; não reutilizar offline-replay como retomada.

## Limitações e gates pendentes

1. Revisão independente109 precisa conferir este relatório e resolver as nove divergências de inventário antes104. Não converter CHANGES_REQUESTED em APPROVE pelo autor.
2. Supervisor deve autenticar receipts e autorização externa vinculada ao manifesto proposto, epoch, limite54 e identidades distintas; diretório novo exclusivo. Manifesto stage=run é proposta, não autorização nem prova de execução.
3. `tools=[]` significa nenhum uso autorizado/solicitado. Recursos internos shell_tool/code_mode_host podem permanecer. Instrução no-tools, read-only, cwd vazio, ignore-user-config e detecção de eventos são enforcement observável; ausência de evento não prova ausência de acesso interno. Se for exigido isolamento físico absoluto, permanece incompatibilidade a resolver por emenda explícita revisada antes live. Kill do grupo é POSIX/quando possível; cancelamento local não garante cancelamento no provedor.
4. Live Windows é recusado pelo transporte POSIX. Offline/suíte Windows e confirmação de permissões/ACL não estão comprovados por estes logs. Pendências Windows/format dos documentos do core seguem105; não houve nova verificação format/syntax/lint de scripts nesta retomada.
5. Aceite humano de gold e julgamento externo das54 respostas continuam separados; não abrir evaluation para tuning. Task104, fechamento105 e publicação permanecem fases posteriores com seus gates próprios. `actual_model_calls: 0` nesta entrega documental e no replay consultado.
