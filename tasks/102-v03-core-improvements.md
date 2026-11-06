# Task102 — Melhorias do core

Raiz: /mnt/d/Projects/MimirNL. Dependências: APPROVE100 e conjunto development congelado101. [Emenda0.2](../docs/benchmarks/v03/contrato-0.2.md), [plano](../docs/benchmarks/v03/fechamento-0.2.md). Tarefa preparada, não executada pela Task99. Preservar dirty/histórico e não acessar credenciais/.env/SSH/PEM/banco pessoal. Sem subagentes por esta especificação.

## Escopo

Implementar ranking/recência controlada, dedup antes de limit, formato compacto com proveniência, fallback baixa relevância, hard budget UTF-8 e telemetria opcional local opt-in desativada por padrão. Tuning/ablação somente development.

## Artefatos e revisão

Diff core e documentação de parâmetros, testes regressão/limites/privacidade, ablação offline dev, relatório102 e parecer independente. Revisão deve ser feita por revisor diferente do autor, com referências reais, APPROVE/CHANGES_REQUESTED e correções concretas; nenhum teste substitui aceite humano. Parecer pendente bloqueia etapa dependente.

## Checklist de aceite

- [ ] Dependências e hashes/revisões conferidos.
- [ ] Testar duplicatas antes de limit, recência/desempates, baixa relevância/zero resultados, envelope mínimo inviável, multibyte/fontes grandes/proveniência e opt-in/no upload. Congelar parâmetros antes de abrir evaluation; nenhum token real inventado a partir de bytes; checks pertinentes do projeto e revisão antes103.
- [ ] Relatório com arquivos absolutos, diff, testes/checks pertinentes, limitações e actual_model_calls.
- [ ] Revisão independente registrada e pendências resolvidas antes da próxima fase.
- [ ] Nenhum commit/push/publicação fora da autorização específica.

## Instruções operacionais do supervisor para próxima implementação

Iniciar sóapósAPPROVE106corpus e107código e congelamentodevelopment. Zero modelos reais; benchmark/ablação somenteofflineService/SQLite sintético e9development. Não abrir /home/usuario/mimir-private/task101-evaluator, tasks/101-review-scope.json ou casos/IDs/rubricasevaluation. Usar somente sources-0.2.json/development-0.2.json/freeze-0.2.json públicos e referênciasdevelopment explicitamenteexportadasporevaluador(se disponíveis). Não reutilizarrespostasreais para otimizar. Reviewer de core não deve precisardeconteúdoholdout. Coreparametroscongelados antes103/104; seavaliarholdoutparatuning registra consumo e precisa novaversão,semocultar.

Implemente mudanças pequenas e testáveis nos caminhos existentes, preserveisolamentoprojeto/scope/status/permissões/sensitive/PATH/schemaslegados/integridadehash. Dedup deve ocorrer antesdolimitcomordem/proveniênciadeterminísticas,semconsultasnãoautorizadas/degradaçãosemreview. Recência precisa política explícita/controlada e não implica verdade; não promover candidate/rejected/staleverificado ou scopesindevidos, evitardata inválida domina ranking. Fallback por baixa relevância precisa critério públicodeterminístico/explicável, semgold/ouclassecaso/limitecustom; retornarsem_memoria/emptycomrazão, não inventarcontexto. Compatibilidadegarantida ondepossível,flags/configversionadas semsettingsglobais.

Hardbudget limita envelopeinteiro incluindo camposmínimos emUTF8/multibyte; recusarcomerroestruturado quandocontenervazioinviável,semtruncamentosilencioso e semlogmetricadeêxito falsaseforinviável. Estimador ébytes,nãotokenizer. Compactformat optin oucompatível que reduza camposdesnecessáriossemperderidentidade/citação/hash/proveniência/excerptintegral;nenhum resumoLLM,padding,APIcacheoualteração promptv1/v2histórico. Métricas locaisoptin defaultoff,sêmredenupload; distinguir contadoresoperacionaisnecessários (que jáexistem) de telemetryopcional,documentarracional. Nenhumloggerdeconteúdoprivado ourawqueryporpadrão,não quebrarserviceaprovado/note/backup/restore.

Testsdecomportamento relevantes: dedup anteslimit;empates/recencydatasinvalidas;projeto/status/scope;queryrelevancebaixo/vazio/injeção;budgetmínimo/multibyte/grandes/unidadesprovenance;telemetryon/off/noupload;compactroundtrip/economiaemBYTESnãoTOKEN;errors nãomutamDB;legadossignificativos. Ablaçãooffline development salvar baselineconfig e configuraçãonova/idsfontesretornados/hashes/cobertura,nãochamarPrecision seRnãofoirevisado/acessível; chamedededup/relevância estrutural. Não escolherparâmetropara salvarumcaseindividual. Designreasoned simples basta,semgridsearch/infiniteexperiments.

Fullsuite/npx typechecklintformatconforme packagechecks uma vezverde,focused após correções se necessárias. Alteraçõescore exigem Windowscheckpertinente quando instalado/permitido,senão registrarpendência para105; nunca afirmarCI remoto semrun. Semnovadeps/commitpush/packageversionoupublicação. Atualizar schemas/docs necessários parausuário,noexporidimplementaçãonoUX. Relatório /mnt/d/Projects/MimirNL/tasks/102-v03-core-improvements-result.md comarquivosabsolutos,diff,testes/ablação,parametrosfreeze/limitações,reprodutibilidade e actual_model_calls0. Retornar para revisão108 antes103.

## Gate confirmado pelo supervisor

Task106APPROVEcorpus eTask107APPROVEcódigo concluídos,estruturaeligible recibosdev/evaltrue,humangoldnull/livefalse. Para preservarblindness do operador102, NÃO LEIA tasks/106-v03-corpus-review-findings.md (inclui detalhesholdout), tasks/101-review-scope.json, nenhum reciboevaluation ou diretórioprivado. Basta esta confirmação do supervisor sobre gate; não repetir auditgold. Relatório106 detalhado ficará sóavaliaçãoreviewer,102deve usar9dev e parâmetros públicos congelados. SeprecisardevRreferênciatecnica solicite ao supervisor, não abrirrootprivado. Não ler métricas/resultadosavaliacaofuturos ou novasquestõesevaluation.
