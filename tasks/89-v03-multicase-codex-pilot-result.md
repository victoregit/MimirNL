# Task89 — Piloto real Codex multicaso executado

Executado em 2026-10-27 pelo supervisor, uma única invocação do comando Task87/APPROVE Task88, após usuário autorizar "ok faça". Sem alterações de código, manifesto, gold/pending, configuração global ou commit/push. Plano validado previamente: SHA95870f259e83fb5b4ea4dab50de654a61258474e9ec9b6de2baf9bbd2c2216c5, bundle daaaf6cb68617339155892de592f444f65b1ec102d0f8b700f03682ea3d0d0d7. Evidência privada em /tmp/mimir-task87-pilot-proposed, manifesto docs/benchmarks/v03/piloto-codex-proposto.json. Resultado de qualidade aguarda Task90; este relato não aprova respostas.

## Execução

Comando revisado scripts/benchmarks/multicase-codex.mjs --run com bundle público explícito, manifesto e --authorize-plan do hash exato, via Node24. Exit0; simulation=false, not_execution_proof=false, attempted_calls=actual_model_calls=4, completed_calls=4, simulated_attempts=0. Quatro slots completed/exit0, tools_detected=false, sem retry. Ordem: orçamento completo/Mimir, p95 Mimir/completo. Duas buscas Service/Storage reais em fixtures temporárias; sem oracle/fallback/DB pessoal. Só plan/result,4contextos e4respostas permanecem, sem slot/fixture. Modelo solicitado gpt-6.1-sol low; identidade efetivamente observada unavailable nos4casos, divergência null. Custo/TTFT unavailable.

## Números brutos conferidos em result.json

| Caso/braço | Input | Cache (subset) | Output | Total input+output | End-to-end ms | Busca ms | Contexto bytes |
|---|---:|---:|---:|---:|---:|---:|---:|
| orçamento/completo |14931|12032|174|15105|9810.202879|não aplicável|4444|
| orçamento/Mimir |14736|12032|176|14912|8533.843916|2.747621|3757|
| p95/completo |15078|12032|151|15229|8188.831356|não aplicável|4900|
| p95/Mimir |14383|12032|145|14528|8625.436017|1.020120|2587|

B-A orçamento: input-195,output+2,total-193(-1.2777%),tempo-1276.358963ms(-13.0105%). B-A p95: input-695,output-6,total-701(-4.6031%),tempo+436.604661ms(+5.3317%). Cache igual, não somado novamente. Somas descritivas dos dois braços completos30334tokens/17999.034235ms; Mimir29440tokens/17159.279933ms. Não representam amostra homogênea nem efeito causal/ganho geral. Timer inclui busca1x; setup/cleanup separados. SetupB1318.147960ms e14.894470ms fora de end-to-end; não omitir ao discutir custo operacional total.

## Próxima verificação

Revisão independente Task90 das quatro respostas conforme rubricas/fontes privadas, limite120palavras, evidências públicas, integridade e números. Não ampliar/repetir chamadas nem corrigir ranking neste piloto. Sem alegação de nova economia aprovada até parecer. Evidências devem ser preservadas para revisão; não apagar para reexecutar no mesmo destino. O histórico de maior economia em uma pergunta anterior não é comparável diretamente aos casos/fontes atuais.

## Encerramento — Task90 APPROVE

Revisão independente em [90-v03-multicase-codex-pilot-review-findings.md](90-v03-multicase-codex-pilot-review-findings.md) aprovou as quatro respostas (81–99palavras), cobertura fática, citações, abstenção p95 e métricas reproduzidas. Sem correção de código ou repetição de chamadas. Aprovação da revisão não representa aceite humano de gold nem ganho geral. Operador reviewer encerrado, sessão cao-mimir sem workers, fixtures removidas e evidências preservadas; diretório0700/result0600, diffcheck limpo, sem commit/push.

Precisões do supervisor sobre as limitações: a variação de latência não permite atribuir causa a rede ou fila remota, que não foram medidas. Os valores1318.148ms e14.894ms são ambos setup_ms dos braçosB, não medições de teardown. tools_detected=false significa ausência de eventos de ferramentas detectados, não prova de capacidades internas ausentes. O cache constante12032tokens corresponde a grande parcela do input; não inferir que todo esse volume é overhead fixo nem deduzir faturamento. Próxima proposta técnica: estudar a redução do contexto público entregue e o volume de entrada do host, com testes offline antes de uma nova rodada; ampliar casos/repetições sem alterar retrospectivamente este piloto.
