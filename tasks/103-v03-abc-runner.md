# Task103 — Executor ABC e manifesto

Raiz: /mnt/d/Projects/MimirNL. Dependências: APPROVE100 e pareceres independentes101(corpus/métricas) e102(core). [Emenda0.2](../docs/benchmarks/v03/contrato-0.2.md), [plano](../docs/benchmarks/v03/fechamento-0.2.md). Tarefa preparada, não executada pela Task99. Preservar dirty/histórico e não acessar credenciais/.env/SSH/PEM/banco pessoal. Sem subagentes por esta especificação.

## Escopo

Implementar manifesto0.2, exportação allowlisted e executorABC com fakes; mesma base/tools/parâmetros/budget, busca real B e histórico C vazio. Contar tentativas reais, timers/cancelamento/bytes e isolamento por run.

## Artefatos e revisão

Manifesto congelável, exportador, runner, fixtures sintéticas e testes de vazamento/reset/limites; relatório103 e parecer independente antes live. Revisão deve ser feita por revisor diferente do autor, com referências reais, APPROVE/CHANGES_REQUESTED e correções concretas; nenhum teste substitui aceite humano. Parecer pendente bloqueia etapa dependente.

## Checklist de aceite

- [ ] Dependências e hashes/revisões conferidos.
- [ ] Nenhum gold runtime, nenhuma fonte ocultada dos baselines, dedup contra base declarada antes e uniforme; DB novo/reset e hashes iniciais/finais; fontes públicas separadas do avaliador; testes timeout/global/not_run/truncamento/captura/no retry; indisponíveis não viram zero; não executar live nesta tarefa.
- [ ] Relatório com arquivos absolutos, diff, testes/checks pertinentes, limitações e actual_model_calls.
- [ ] Revisão independente registrada e pendências resolvidas antes da próxima fase.
- [ ] Nenhum commit/push/publicação fora da autorização específica.

## Instruções operacionais adicionais do supervisor

Implementação somente apósAPPROVE108core e106/107gatesdados/métricas. Leia resultados102/101(emcorpusnãoabrirconteúdoeval para tuningcore); policy102freeze intacta e engine/executorsourcehash versionados sem afirmar commitSHA incluimudançasdirty. NÃOALTERARCORE nesta fase semvoltarreview108 e registrarholdoutconsumido sepolicytuningorientadoeval. RuntimeABCnovo pode reusartransporteCodexaprovado que nãoimportacorpusprivado ouperguntafixa. Semnovosmodelos/host/chamada/warmup; fakesdesdeinício. Etapa104max54callséúnicafaseliveautorizada apósreviewrunner,semnovoAG.

Prepare interface finita: privateexport/corpus_receipt evaluatorprocess produz runtimepublic manifest/bundle/taskrequests explicitamente separados degold,reviewrefs,privatehash/R/rubricacategories. Publicruntime nãoimportaleitorprivado,nãoabrecasosprivadosouperfisdeavaliação (coordmanifestbookkeepingid/splitperrun separadoenvelope/seed/cwd,pathsopaque). Authorizationruntime tiedhashmanifest;semforce/skip/no-gates,frozenengine/executorcodehash e reviewedreceipt verificadopelosupervisor antesexport,dadospendinghuman não precisamacceptedfictício. Seadaptarreceipt/statusnão habilitar modeloautomaticamente. Quaisquer hashesreviewprivados sócoordenadorprivado,publicplanhashderivepúblico. Não publicargoldhash parahost.

Manifesto ABC contrato0.2/profiletechnical_reviewed-v1,sourcebundle/basepool/queries/k3 e cenáriosemenda exatos,histórioreal0byteshash,cadabaseigualA/B/C eBduplicaçõespreservadastratamentoprincipal. Não transformarB seleçãoemsubstituição(fontesbasefaltantes) ou dedupcontra base sememendarevisada. Seedmemórias sófontes eproveniência,statuscandidate/user; nenhuma pergunta/caseID. IDs/splitnãoentram prompt/cwd/argv/history;emptyretrievalpreservado,semoracle/fallbackadicionalfora corepolicycongelada. FonteunitIDs/sha/path/linhas preservados intactos,compactformat doService se escolhido éconfigplanfixo,nãofiltrarporR. RealServicequeries e snapshot/projGitunique porrun/resetpróprio,guardasprojeto/sqlpoolinclusiveB1xtimer.

Plansequencial determinístico ABC/BCA/CAB eoffsetcase/rep do contract-v02.makePlan,27dev+27eval; concurrency1semretry/continuarfalharetomada:preferirstop global primeira falhamodelo/timeout e preservarnot_run,mas falhainfeasiblelocal temregraantescongelada. Limites90scall/120srun/5ssearch/120minglobal,modelcalls1perrun/retrieval1sóB;context32000bytes/outputcapture64000;capword120instrnãoapi. Contartentativas mesmo spawnfalha,completedvalidado/exit0/noferramentasdetectadas,usageausentenull;identityrequested/observedseparado. Timeoutrestante inclui setup/I/O/cleanupregra,killownedprocessgroup;nenhumcapturareasoning/stderrraw. Syncoperationsnãopreemptivo honestamenteinvalidrunsifoverdeadline antes spawn;erro não fake0metric. Teardownfinallyremovesófixturespróprias eerrorretainstatus. Surfaceplans/not_run/infeasible/failed/timeouts/cleanupdiagnostics,semfaketoken/TTFT/custocache. t0Bbeforesearch,t1aftertransportclose/collector; setup/cleanupfora eglobaldentro.

Saídasduráveis privadas0700/json0600wx e exclusividade; novasplanos54calls comdirnovos,semusar/tmpcomoúnicareferênciafinal. Manifestoofflinesynthetic explicit/not_execution_proof/actualcalls0; publicmanifest2stagesvalidate/runsemambiguidade. CLIvalidate/help/importsemspawnmodelo ou artefatoseficaz;runtimeprocessI/Ocanaryprofunda forbidsreadprivado(.json/.md genéricanão). Testschemas/extras/tamper/epoch/hashcodechange/legacy,nosecret/caseIDprefix/scriptargs;budget/timeouts/globalremaining/noretry/processkills/cleanup/falhas;A=Csemanticsverified,BrealServiceincontinuoustimer. Testspinnedfixtures apóscorecorrigidas e recursivenooverwritesensitivepath.

Reproduçãooffline abrangente54posições/18buscasSQLite,semrespostaLLM,uso synthetic/nullexplícito;metadadosobservação compatíveismetrics-v02 (adaptadorsemjulgamentoautomáticoLLM). Congelarprotocolodeavaliaçãoanteslive para54respostas,afirmações/rubricacitação judgedexternally,arquivoresultspúblicosseparadoevalprivado. Logsconfignãoprivados/documentarcomandosabsolutosambiente/hash. Atualizarestadodocsreferenciandorevisõesanterioressemregravarhistórico. Critériodependencies sourcebundlehashparâmetrosfreeze receipt externos/enginepostchangeSHA inventárionãoGitHEADalone.

Checks Linuxfocused+fullsuite uma vezverde sechanges,syntax/lint/typecheck/formatpertinentes,Windowsquandoimpactopruntime não presumir. Sempackageversion/CI/deps/commitpush/publicação. Relatório /mnt/d/Projects/MimirNL/tasks/103-v03-abc-runner-result.md,actual_model_calls0,diff/testes/evidências/manifestoscomandos e pendências. Retornar para revisão109 (reservar108core) antes104execução. Não concluir em ack/espera.

## Precisão sobre tools e host antes de live

O transporteleanhistórico mantémrecursosinternosshell_tool/code_mode_host porlimitaçãoTask71/72; --disableapps/plugins/multi_agent não prova toolsinexistentes. Na emenda/manifesto tools=[] deve significar "nenhumuso autorizado/solicitado", não afirmarcapacidadeinexistente/isolamentototal. Documentar enforcementobservável(read-only/emptycwd/ignoreconfig/ambienteperprocesso/instruçãonotools/detecçãoeventos);seevento deferramenta observado, interromperprocessogruppo imediatamente quando possível e marcar tentativa inválida,semretry/contarqualidade. Não repetir Task71combinaçãorestritafalha semdiagnóstico;novorecurso/flagsdeveserbaseadocapabilitylocaldocumentada eofflineverificado,semexplorarcredenciais/configpessoal. Caso contratoexija algoquenãopossa garantir,relatar incompatibilidadeparaemendaexplícitareviewedanteslive em vezdeclaimsegurança falsa,sem pedirnovaaprovaçãogenéricajáautorizada. Fonteallowlistdev/evalbenigna,semintroduzir promptinjectionmalicioso emlive. Nunca afirmarqueeventosausentesprovamnenhumacesso interno ou que sandboxreadonly impedeleituratodosarquivos.
