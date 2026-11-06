# Task101 — entrega corpus0.2 para revisão106

Implementação/preparação concluída; **revisão independente106 pendente**, sem autoaprovação. `actual_model_calls=0`. Nenhum modelo real, subagente, importer de rede, banco pessoal, retrieval, commit/push ou publicação. A próxima fase dependente permanece bloqueada pelo parecer aplicável.

## Entregáveis e arquivos absolutos

- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/corpus-0.2.md`: método, fronteiras e limitações.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/sources-0.2.json`: allowlist profunda de fontes, sem casos/gold/status de avaliação/hash privado/contagem privada. Hash canônico `e75d3066c9151d71b97c440f7a563147cfbc94a52302dcf5965075e2bdcdc7e9`.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/development-0.2.json`: nove operações congeladas, bookkeeping separado, sem respostas/rubricas/R; `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/freeze-0.2.json`: hash semântico development e parâmetros para102.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/provenance-0.2.json`, `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/dependencies-0.2.json`: licença/proveniência/ranges e hashes exatos das dependências100/55/84/contrato/plano/originais. APPROVE100 conferido;55/84 são evidência histórica real, sem converter gold legado em accepted.
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/`: 19 snapshots nomeados `source_id--unit_id.txt`, apenas trechos explícitos, e `LICENSE` MIT copiada do pin. `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/history-c.txt`: arquivo real0bytes, SHA-256 vazio contratual.
- `/home/usuario/mimir-private/task101-evaluator/`: referência development, evaluation novo, planos privados, README e registro autoral de preparação. Diretório0700, arquivos0600. Fora do checkout e do pacote, nunca contexto/seed/modelo. O operador102 não deve abrir essa pasta.
- `/mnt/d/Projects/MimirNL/tasks/101-review-scope.json`: escopo externo exclusivo do avaliador com hash privado, nunca runtime; integridade é distinta de autenticidade. O operador102 também não deve abrir esse arquivo.
- `/mnt/d/Projects/MimirNL/tasks/106-v03-corpus-review.md`: roteiro para revisor diferente do autor; nenhum parecer foi fabricado.

[Documentação](../docs/benchmarks/v03/corpus-0.2.md), [relatório código/métricas](101-v03-metrics-result.md), [revisão106](106-v03-corpus-review.md).

## Corpus e freeze

Nove development projetam os casos originais Task54/83 sem alterar perguntas, queries, R, resposta candidata, rubrica ou originais0.1. Revisão2 da projeção diferencia formato0.2, com k=3 explícito; pools e fontes básicas preservados. Os originais continuam pending. Todos os novos registros reais têm technical_review pending, referências externas nulas e human_acceptance_ref=null; não são gold humano aceito.

Três novos evaluation foram selecionados por leitura do pin em arquivos/tópicos distintos dos nove, sem busca ou resultado de modelo. Conteúdo/perguntas/rubricas/IDs privados não são reproduzidos neste relatório. Seleção autoral está registrada privadamente; revisor106 ainda deverá julgar novidade, fontes e completude de relevância/rubricas, separado da sessão102. Há negativo com R=[] avaliado como insuficiência do pool, não como falta de referência; sem_gold é representado distintamente por R=null ou revisão técnica ausente. Nenhum resultado real foi pontuado.

Fontes usam exclusivamente Git `166e3cf047b2078952e43dc8e9171e053e99e2ce`, blobs regulares e ranges inclusivos exatos UTF-8/SHA-256; não há dependência de fonte atual alterável. Os snapshots são duráveis, não dump do repo. Nenhum stale real foi estabelecido nem referência atual avaliada; estado honesto unknown, taxa indisponível. O teste stale é apenas sintético. Versão/idade não implica obsolescência.

## Diff e verificação

Adições somente nesta entrega: diretório público de preparação, diretório privado externo, docs corpus/métricas0.2, três módulos novos, teste novo, dois relatórios, escopo e specs106/107. Nenhuma edição nos validadores, core, CI, configuração, dependências ou originais. O dirty preexistente extenso foi preservado; `git diff --stat` não contabiliza adições untracked, portanto não é apresentado como diff completo. Inventário/hash do código está no relatório de métricas.

A suíte completa `PATH=/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin:$PATH npm test` passou uma vez: **126 testes,125pass,1skip,0fail**, Node24.22.1. O skip é o teste Windows já condicionado pela plataforma; não representa execução Windows. Log durável `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/evidencias/preparacao/task101-fullsuite.log`. Doze testes novos abrangem bytes fixados/snapshots/history, deepallowlist/hash invariance, paths/symlink/nooverwrite, receipt/gate, R=0/sem_gold, falhas/ausências, claims, staleunknown, pares e processo público com canary/I/O allowlisted. Testes não constituem revisão independente, aceite humano ou execução real.

Syntax/Prettier focados e `git diff --check` constam na evidência de checks ao fim do relatório de métricas. Nenhum CI remoto foi executado/declarado verde.

## Pendências e passagem

106 deve conferir individualmente hashes/fontes e revisar conteúdo privado localmente, escrever parecer real e receipt externo não recursivo e, se aprovado, atualizar somente referências técnicas reais/recongelar hashes necessários. Não usar o parecer como aceite humano nem publicar material privado.107 revisa applicationcode separadamente. Nenhum APPROVE foi escrito pelo autor; não há receipt real elegível. Os gates independentes continuam pendentes antes de103; supervisor coordena autorização/gate de corpus antes de102.

Freeze development e parâmetros estão prontos para102, que deverá usar somente fontes públicas e operações development. Se evaluation orientar tuning, a separação deixa de valer e nova versão será necessária. Doze casos restritos e baselines com fontes básicas não sustentam generalização estatística, detecção de stale real, economia ou qualidade do core. v0.3 continua incompleta.

## Encerramento supervisor

Task106APPROVE conferido com saída real do revisor abd58e72 e parecer escrito; recibos externos dev/eval emitidos pelo revisor e validados estruturalmente, humangoldnull/livefalse. Revisor encerrado explicitamente após resposta. Task107APPROVEcódigo também concluído, revisorbd6e6485encerrado. Task102 liberada somente para9dev; supervisor proibiu leitura de relatório106/scope101/holdout pelo operadorcore para evitar contaminação. Semmodelosnovos/commitpush,0.3continuaemexecução.
