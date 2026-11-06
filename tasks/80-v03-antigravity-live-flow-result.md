# Task80 — Antigravity com busca real Mimir e intervalo contínuo

Executado em2026-10-27 após Task77 APPROVE de código e Task78/79Codex concluído/revisado. Autorização usuário inclui sequência Codex→Antigravity. Uma invocação revisada,6processosAGnovosAB/BA/AB, modelo solicitado gemini-3.8-flash-high/efforthigh. Sem retries/fallbacks/skippermissions. Todos6completed/exit0, sem timeout, nenhuma chamada extra para corrigir resultado. Semcommitpushmerge, core/CI/deps/bancopessoal/configglobal.

Evidência privada /tmp/mimir-live-antigravity-task80-20261027 (0700), plano/contextosruntime/runs/summary e6respostasfinais0600. CadaBcria Service/Storage/projetoGit sintéticosdescartáveis com6memóriascandidate/user, queryfixa estimateTokens optimize,limit3/includeGlobalfalse. BuscaREAL entre t0-t1 da MESMArun, semreplay/prebusca/oracle/gold/deduplicaçãofalsa. Retornou1fonte optimization fixada em166e3cf047b2078952e43dc8e9171e053e99e2ce,hash832cf164215cededa94fff24284dd80d5f3ee1351a9dd2dfee2177658c8b9473. A envia6fontesintegraisuma vez. Setup/closefora t0-t1 e fixtures/scratch removidos; retençãointernanativaAGnãocertificada.

## Contadores NATIVOS reportados, não métricas normalizadas

O JSONnativo expôs input_tokens/output_tokens/thinking_tokens/cache_read_tokens/total_tokens em todas6chamadas. Estes são preservados em provider_usage.counters com semantics=unconfirmed. usage=null e summary tem n0/valorunavailable nas métricas NORMALIZADAS. Isso NÃO significa ausência dos contadoresnativos, nem uso0. Não alteramos summary nem normalizamoscache/derivamostotal, faturamento ou semânticageral. Tabelaabaixo é sumarização manual dos camposnativos explicitamentereportados, separada do adaptador.

| Mediana n3                    | Contexto completo | Seleção Mimir |
| ----------------------------- | ----------------: | ------------: |
| input_tokens nativo           |             15427 |          7958 |
| output_tokens nativo          |              1600 |          2336 |
| thinking_tokens nativo        |              1403 |          2131 |
| cache_read_tokens nativo      |                 0 |             0 |
| total_tokens NATIVO explícito |             17030 |         10290 |
| Tempo contínuo t1-t0, ms      |      17923.874635 |  22680.900861 |
| Wallsubprocessoms             |      17923.118378 |  22680.138782 |
| Busca realms                  |               N_A |      0.545487 |

Medianas independentes, não somá-las. Thinking não somado novamente a output/total, cache não reinterpretado. Totaisnativos completos16970/17485/17030, seleção10085/10299/10290; redução observada da razão de medianas de CONTADORNATIVO=(17030-10290)/17030\*100=39.5772%. Não equivale a economia financeira ou prova de uso normalizado/faturável.

Deltaspareados de contadortotalnativoB-A -6885/-7186/-6740. Deltas de tempo contínuoB-A +5312.289140/+1481.668946/+4757.026226ms, mediana+4757.026226ms. O tempo maior em todos3pares é mantido no resultado, sem concluir causaou significânciageral. Contadornativothinking maior no grupoB é observação e hipótese futura, não causa demonstrada.

SetupsB1010.127415/13.999802/10.676577ms, mediana13.999802ms. Consultas2.327664/0.545487/0.469261ms. t0antesmemory_search; t1depoisfechamentotransporteJSONnative; consulta/validação/prompt/evidênciamodeloincluídos1x, sem somar latências antigas. Setup/store/closefora e medidosseparadamente.

## Limitações e avaliação

Qualidade aguardaTask81; completed não significa correta. JSONAGnãoexpõeeventosdetoolcall: tools_detected=null com motivo, não alegamos ausência comprovada de ferramentas. Rodamos sandbox/modeplan/disabledslashsem bypass; prompt pede sófontesfornecidas/semferramentas. Tempo primeirarespostacompleta observaJSONnoclose, nãoTTFT. Custo/TTFT/backendobservadounavailable, requestedmodel≠snapshotcomprovado. Mesmoprotocolo documentaldevelopment1pergunta/3pares, modelos/hosts diferentes impedem rankingcomparativo causaldireto comCodex. Sem maischamadasapósesseconjunto paraforçarbenefício. Parecerem tasks/81-v03-antigravity-live-quality-findings.md seráconferido antesfechamento.

## Fechamento Task81

Parecer /mnt/d/Projects/MimirNL/tasks/81-v03-antigravity-live-quality-findings.md registra APPROVE,6respostaspassC1C2C3 e <=120palavras (96/98/98/105/91/91). Completo3/3 e seleção3/3. Númerosnativos/normalizaçãonull e tempocontínuo foramconferidos. Mantemos semânticageraldecache/thinkingnão confirmada: não somar contadores nem afirmar faturamento. O resultado é redução no totalnativo reportado dentrohostAG, não métricacrosshostnormalizada. Sem anomaliaacionável, sem novaschamadasparaqualidade, nenhumcódigomudouapósTask77.
