# Task95 — Comparação real v1/v2 executada

Após Task94APPROVE e autorização usuário "vamos entao"/"CONTINUE voltou a quota", supervisor executou exatamente uma vez cada comando Task93 na ordem budget-v1,budget-v2,p95-v2,p95-v1. Quatro invocações exit0,8tentativas/8completed,simulationfalse,not_execution_prooffalse,0simulados,semretry/warmup/trocamodelo/coldreset. Todos slots exit0/tools_detectedfalse,modelosolicitado gpt6.1sol low e identidadeefetiva unavailable. Sem alteração de código,manifestos,gold/pending,core,configglobal,DBpessoal,commitpush. Hashes exatos Task93/94 e bundle original conferidos. Evidências em /tmp/mimir-task95-{budget-v1,budget-v2,p95-v2,p95-v1}; quatro buscas reais Service emfixtures descartáveis,slot removido/evidência preservada.

## Dados brutos (Task96 revisão pendente)

| Caso/layout/braço | Input | Cache subset | Uncached | Output | Total | End-to-end ms | Busca ms | Setup ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| orçamento v1 completo |14929|12032|2897|187|15116|8349.990100|N/A|N/A|
| orçamento v1 Mimir |14734|12032|2702|191|14925|7883.867541|3.622493|1433.710160|
| orçamento v2 completo |14930|12032|2898|178|15108|8353.409012|N/A|N/A|
| orçamento v2 Mimir |14735|12032|2703|177|14912|7797.617208|2.869548|1349.638422|
| p95 v2 Mimir |14384|12032|2352|157|14541|7854.603616|2.873580|1331.288353|
| p95 v2 completo |15079|12032|3047|150|15229|6940.561817|N/A|N/A|
| p95 v1 Mimir |14383|12032|2351|154|14537|7497.014298|2.462750|1316.579393|
| p95 v1 completo |15078|12032|3046|154|15232|6242.565835|N/A|N/A|

Diagnósticos públicos viaCLIcache-diagnostic aprovado em /tmp/mimir-task95-cache-{budget-v1,budget-v2,p95-v2,p95-v1}/cache-report.json; todos CLIexit0,semnova chamada. Inputincluicache,uncached=input-cache,total=input+output; nenhuma duplicação. Tempo inclui busca1x,setupfora (registrado),não somarbusca novamente. Custo/TTFT/atribuiçãocacheunavailable.

## Comparação v2-v1 dentro do mesmo caso/braço

Todos quatro pares tiveram JSON.parse(prompt)semanticamente idêntico, incluindo sourcesarray mesma ordem/bytes/hashes/proveniência,history,instruction,question; muda somente serialização/ordemchaves. Contextobytesigual porpar: orçamentoA4444/B3757,p95A4900/B2587. Não houve confound de seleção/order observado nesta rodada.

| Par | Delta input | Delta cache | Delta output | Delta total | Delta total % | Delta end-to-end ms | Delta tempo % |
|---|---:|---:|---:|---:|---:|---:|---:|
| orçamento completo |+1|0|-9|-8|-0.0529|+3.418912|+0.0409|
| orçamento Mimir |+1|0|-14|-13|-0.0871|-86.250333|-1.0940|
| p95 completo |+1|0|-4|-3|-0.0197|+697.995982|+11.1812|
| p95 Mimir |+1|0|+3|+4|+0.0275|+357.589318|+4.7698|

Apenasv2vs1: cachedinput12032emcadaumdos8slots,+1inputeuncachedemv2porpar; não há aumentoobserváveldocache. Diferenças pequenas de total refleteminput+output;não representam melhoria significativa de contexto. Semcausaidentificável para variaçãolatência, seminferênciafinanceira. N2casos/rep1,ambientepotencialmentequente/ordemparcialbalanceada,semcachecoldcontrolado ou modeloobservadoconfirmado; nenhuma conclusão geral. Não misturar comparaçãoformatov2/v1 com efeitoMimir/completo.

## Próximo gate

RevisãoTask96 das8respostas(factualidade/rubricas/citações/abstenção/120palavras) e métricas. Nenhuma ampliação/nova rodada automática. Sem alegação de qualidade antes doparecer e sem afirmar cacheprefixosidentificados. EvidênciahistóricaTask89/91 intacta.

## Encerramento — Task96 APPROVE

Parecer independente em [96-v03-layout-live-comparison-review-findings.md](96-v03-layout-live-comparison-review-findings.md) aprovou8/8respostas(83–104palavras), equivalência dos4pares e métricas. Resultado: cache12032emcadaumdos8slots, v2+1input/uncachedporpar; sem aumentoobserváveldocache. Diferenças de total(-0.0871% a+0.0275%) são pequenas e incluemvariação deoutput; semganhogeral/financeiro demonstrado. BuscaMimir real4vezes incluída1x; setupfora explicitado. Nenhuma chamada adicional na revisão, código/evidência histórica preservados, diffchecklimpo,dir0700. Precisão: origem exata dos tokenscache e causa das variações de latência não foram determinadas; não tratar cachebasal como conteúdo identificável nem atribuir causalidade à serialização ou ambiente além do observado.

Decisão técnica sugerida: manterv2comoopção experimental, sem declarar otimização comprovada ou torná-lopadrão por ganho de cache; priorizar redução de contexto necessário e investigação observável do volume de entrada do host. Semnova rodadaautomática,commit/push ou mudança de gold/pending. Encerramento do revisor persistente será confirmado pelo supervisor.

Parecer final Task96 conferido (APPROVE,889palavras). Revisor040c9518 liberado explicitamente após entrega do parecer e saída de conclusão; sessão cao-mimir confirmou workers=[] no fechamento. Sem commit/push.
