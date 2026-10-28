# Task101 — Corpus e métricas0.2

Raiz: /mnt/d/Projects/MimirNL. Dependências: APPROVE100; contrato0.2 e plano de fechamento. [Emenda0.2](../docs/benchmarks/v03/contrato-0.2.md), [plano](../docs/benchmarks/v03/fechamento-0.2.md). Tarefa preparada, não executada pela Task99. Preservar dirty/histórico e não acessar credenciais/.env/SSH/PEM/banco pessoal. Sem subagentes por esta especificação.

## Escopo

Congelar9development+3novos evaluation com seleção/revisão separadas, snapshots públicos/hashes, histórico0bytes e seed só fontes; avaliação privada fora runtime. Implementar perfil technical_reviewed-v1 e métricas versionadas sem alterar validadores legados.

## Artefatos e revisão

Corpus/manifestos versionados e fontes allowlisted; referência técnica privada; implementação e testes de perfil/métricas; relatório101 e pareceres independentes separados corpus/métricas. Revisão deve ser feita por revisor diferente do autor, com referências reais, APPROVE/CHANGES_REQUESTED e correções concretas; nenhum teste substitui aceite humano. Parecer pendente bloqueia etapa dependente.

## Checklist de aceite

- [ ] Dependências e hashes/revisões conferidos.
- [ ] Hashes e fontes conferidos por revisor diferente do autor; nenhuma pergunta/rubrica/caseID no seed; holdout isolado de tuning; denominador fixo Precision@3, RecallR=0, sem_gold, baselines N_A, source accuracy com evidência, stale/unknown e ausências; compatibilidade/rejeição entre versões; sem aceites fabricados.
- [ ] Relatório com arquivos absolutos, diff, testes/checks pertinentes, limitações e actual_model_calls.
- [ ] Revisão independente registrada e pendências resolvidas antes da próxima fase.
- [ ] Nenhum commit/push/publicação fora da autorização específica.

## Instruções operacionais adicionais do supervisor

Somente iniciar após APPROVE100. Este agrupamento tem duas entregas internas: (a) corpus/snapshots e (b) novo perfil/métricas/exportação0.2, cada uma revisada independentemente antes103. Nesta tarefa zero modelos reais, somente testes/fixtures/consultaslocais descartáveis. Nenhum importerrede/pessoal. Todos caminhos absolutos nos resultados; applicationcode deve ser revisado.

Fontebasepermitida pin166e3cf047b2078952e43dc8e9171e053e99e2ce e9casosreviewTask55/84; não editar originals/goldpending ou afirmarhumangoldvalidated. Consolidar projeção0.2 de9devsematualizargold, registrar origem/revisão/evidênciatécnica real separada. Trêseval novos não são renomeações/reformulações dos9, cubram outras questões factuais no próprio repo,fontespublicas comhash e acesso separado; não claimworkloadrepresentativogeral. Para minimizartuningcontamination, guarde eval/gold em diretórioprivado separado que não será aberto pelo operadorcore102 e separe scriptsdev/eval; perfiltechnical_reviewed precisa referência real de revisão posterior, não autorpreencheAPPROVE ou accepted. Receipt externo versionado/integridade pública distinta deautenticidade: reviewerreal escreverá parecer comhash deconteúdoprivado(parte local, nunca pacote/modelo). Fluxo de pré-review permite validar estrutura sem executabilidade,reviewstage não mistura privatehash/caseclass no runtime; após aprovação usar revisão verdadeiracomo evidência externa,nãohashrecursivo em documento próprio.

Preferir casos/units no pin antigo e representar stale comsnapshot Git legítimo e referênciaatualpermitida,semchamar mudança deversão automaticamenteobsolescência. Se nenhum stale legítimo,reportarunknown/N_A e preparar cenário sintético explicitamenteetiquetado sóteste para verificar métrica,sem evidênciarealinventada. Fontecurrent precisa referência avaliada; missing não virarcurrent. Arquivo C 0bytes realhash e fontes snapshots copiadosduráveis em docs/benchmarks/v03/evidencias/preparacao (permissões adequadas) comlicense/proveniência,semleitura sensível/symlink. Não despejar repo ou artefatosprivados empacotepúblico. Artefatosgold sob pasta claramenteprivada para avaliador, runtime somente bundlepúblico; se commitfuturo contémrubricaspublicasnãochamar secreto, isolamento deprocesso continua necessário.

Implementar schema versionado0.2 e módulos métricasnovos sem afrouxarpreflight/metricslegados ou publicbundleTask85. Projeçãopública allowlistprofunda,nenhumR/relevância/expected_answer/rubrica/authorreview/refprivado/status/caseclass ou privatehash,nem contagemprivada. ID/split bookkeeping foraenvelope/seed. Validar Git pin/regularblob/rangesexactUTF8/hash/caminhos seguros,snapshots limitadosafonteexplicita,legacyparserreject0.2. Corpus technicalreview not human approval; nova ferramenta não habilita run live. Metricsoffline privada:denominadorescontrato0.2,claimsreview explicitamente ligados fonte+trecho e contagens,somente dados avaliadossem autoscoringLLM;outcomesrubricas/cobertura semscorefabricado. Erros/missing/zero/unknownstatus e splits/pairs strict,semretornarfalhascomozero. DocumentarR=0noevaluationnegativo e noGold vs evaluatedRempty distintos. Nenhum token/custo inferidobytes. Durablereplay fixtures offline deterministic.

Tests significativos canarygold/procpublicIO/deepallowlist/hashinvariance/paths/nooverwrite e métricaedgecases/denominadores/pairing/staleunknown/sourceaccuracy/compatibilidade. Regressão apropriada e fullsuite uma vez verde seinterfaces;syntax/format/diffcheck. Sem atualizar CI verdequenaorodou. Resultados /mnt/d/Projects/MimirNL/tasks/101-v03-corpus-result.md e /mnt/d/Projects/MimirNL/tasks/101-v03-metrics-result.md, linksdocs; conjunto development e parâmetrosdeavaliação congelados/hash para102. Eval permanece nãoaberto aooperador102 e não pode orientar tuning; semnova configuraçãohost. Retornar para revisões separadas106(corpus) e107(code/métricas),semautoaprovação.

## Entrega101 para revisões independentes

Preparação e implementação offline entregues em [relatório corpus](101-v03-corpus-result.md) e [relatório métricas](101-v03-metrics-result.md). Roteiros [106 corpus](106-v03-corpus-review.md) e [107 código/métricas](107-v03-metrics-review.md) preparados para atribuição pelo supervisor. Pareceres ainda pendentes, sem autoaprovação ou alteração de gold legado; actual_model_calls=0. O último item de revisão do checklist permanece aberto até parecer independente real.
