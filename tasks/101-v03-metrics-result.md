# Task101 — entrega perfil/métricas/exportação0.2 para revisão107

Implementação offline concluída; **revisão independente107 pendente**, sem autoaprovação. `actual_model_calls=0`. Nenhuma resposta real foi gerada ou pontuada; fixtures são sintéticas explícitas. v0.3 permanece incompleta; módulos e planos não habilitam live.

## Arquivos absolutos e diff

Adicionados, preservando os módulos legados e todo dirty preexistente:

- `/mnt/d/Projects/MimirNL/scripts/benchmarks/contract-v02.mjs`: schema estrito0.2, perfil technical_reviewed-v1, fonte Git allowlisted, projeção pública profunda, envelope sob budget, receipt externo e planos não executáveis com split/revisão/rotação/hash congelados.
- `/mnt/d/Projects/MimirNL/scripts/benchmarks/metrics-v02.mjs`: adaptador privado de métricas0.2, sem autoscoring/LLM.
- `/mnt/d/Projects/MimirNL/scripts/benchmarks/v02-cli.mjs`: processo público somente bundle+request e comandos dev/eval privados distintos, saídas exclusivas; sem rede ou transporte live.
- `/mnt/d/Projects/MimirNL/test/benchmark-v02.test.mjs`: doze testes, fixtures e replay determinísticos, sem ler holdout real.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/metricas-0.2.md`: semântica, limites e comandos; `/mnt/d/Projects/MimirNL/tasks/107-v03-metrics-review.md`: revisão de applicationcode por autor diferente.

[Documentação](../docs/benchmarks/v03/metricas-0.2.md), [corpus](101-v03-corpus-result.md), [revisão107](107-v03-metrics-review.md).

Não foram alterados preflight/metrics/publicbundle legados, core/aplicação principal, CI ou dependências. Código novo precisa de revisão107 antes de uso dependente. O inventário de hashes dos quatro arquivos está em `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/code-inventory-0.2.json`; hash é integridade, não atestado de revisão.

## Comportamento e limites

Precision@3 usa denominador3 fixo, dedup de conteúdo antes de k; Recall R=0 é N_A; referência ausente/revisão pending é sem_gold; A/C são N_A. Falhas, truncamento e retrieval ausente não recebem zero. Empty retrieval concluído é distinto de retrieval não observado. Nenhuma agregação retrieval inventada.

Source accuracy exige lista de claims avaliada e vínculo de citação a fonte+trecho realmente contido, com referências explícitas do avaliador. Zero claims avaliáveis é N_A, avaliação ausente unavailable. O código verifica ligação estrutural e contagens; julgamento de entailment/completude permanece externo, sem autoscoring. Stale/current requerem referência avaliada fixa com SHA/trecho/motivo/parecer; unknown mantém contagens e bloqueia taxa. Não há stale real reivindicado; o fixture sintético não prova detecção.

Outcomes recebem itens de rubrica binários revisados, pesos e requisitos separados; completed não implica sucesso. Status, not_run, ausências e exclusões permanecem visíveis. Comparações B−A/B−C não misturam split/revisão/repetição/plano; só completed não truncado com métrica disponível. N/mediana/min/max dos deltas, percentual somente baseline>0, sinais negativos preservados. Latência retrieval já está no total; cached é subconjunto de input, não somado. Contadores nativos são fornecidos explicitamente; futuro executor103 deverá preservar sua evidência. Custo/TTFT/modelo efetivo unavailable; nenhum token/custo inferido de bytes.

Perfil técnico não converte accepted/validated nem human_acceptance_ref. Receipt externo exige autor/revisor distintos e hashes finais de casos/bundle, sem autorrecursão; autenticidade da identidade e parecer real é verificação do supervisor, não propriedade de hash. Fixtures usam identidades sintéticas explicitamente marcadas, não aprovações reais. Todos os casos reais continuam pending e nenhum receipt real foi criado.

Bundle runtime contém só fontes/proveniência/parâmetros. CaseID/split/gold/R/rubrica/review/status/hash privado ficam fora do envelope/seed. Adicionar gold arbitrário à fonte de entrada não altera projeção/hash. O processo público lê só bundle/request; teste de I/O bloqueia qualquer outro open/read e protege arquivo canary privado. A separação não é sandbox contra operador privilegiado;102 não deve abrir holdout. Leitura explícita recusa symlink em componentes; exportação privada exige diretório novo0700 e JSON0600, sem overwrite. Envelope>32000 bytes é recusado, sem truncamento silencioso.

## Testes/checks executados

Node24.22.1 já instalado; nenhuma instalação/configuração. Suíte completa uma vez verde após implementação: **126 total,125pass,1skip Windows,0fail**, `npm test` com build TypeScript incluído. Log durável `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/task101-fullsuite.log`. Não declarar CI remoto/Windows executado.

Os doze testes novos verificam pin/range/UTF-8/snapshots/history, canary/deepallowlist/hash invariance, paths/symlink/nooverwrite, versões incompatíveis, pending versus elegibilidade estrutural, denominadores/R=0/sem_gold/N_A, erros/missing/empty/truncated, claims/citações, staleunknown/referência sintética, status/pairs/splits/tokens, rubricas e dois replays CLI idênticos. Não dependem do conteúdo evaluation real e não chamam serviço/modelo.

Checks finais focados: sintaxe dos três módulos e teste, Prettier somente arquivos novos relevantes, conferência de hashes/paths/links novos e `git diff --check`. Registro durável `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/task101-checks.log`.

107 deve revisar o código integral e reproduzir testes, registrar APPROVE/CHANGES_REQUESTED real e correções.106 revisa corpus separadamente. Nenhuma etapa de revisão foi executada pelo autor101; gates pendentes bloqueiam a etapa103. Sem commit/push/publicação.

## Encerramento supervisor

Task107APPROVE vinculado aos hashes code-inventory,12testesfocadospass; ver tasks/107-v03-metrics-review-findings.md e cópia tasks/107-v03-metrics-code-review-findings.md. Revisorbd6e6485 encerrado explicitamente. Task106corpusAPPROVE e receipt externo registrados separadamente pelo revisor, sem alteração de código após revisão. Próximo core102,semmodelosnovos/commitpush.
