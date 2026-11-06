# Busca local: parâmetros congelados para revisão 108

`memory_search` mantém os filtros de projeto, scope, status, tipo e autorização
global. Defaults compatíveis: `policy=legacy`, `recency=off`, `format=full`,
`telemetry=false`. Os parâmetros pertencem à chamada, sem configuração global.

A deduplicação por hash ocorre antes de `limit`. BM25, preferência por scope
project e ID determinam a ordem; a primeira identidade é preservada e cópias
visíveis aparecem em `duplicateProvenance` com ID, projeto, scope e fonte.
Referências adicionais na fonte original permanecem integrais. A busca percorre
os matches autorizados em ordem e mantém no máximo `limit` grupos em memória.
O SQL ainda pode ordenar todos os matches: o custo cresce com o conjunto elegível;
não há alegação de melhoria de latência nem resultado de produção.

`policy=balanced-v1` exige cobertura lexical de pelo menos `ceil(U/4)` termos
únicos da consulta no conteúdo. Usa até os primeiros 40 termos Unicode
(letras/números/underscore), case insensitive, sem stopwords ou sinônimos.
Esse limiar simples foi escolhido como regra geral, sem busca por caso ou gold.
Não garante resposta, verdade ou suficiência semântica. Ausência retorna array
vazio e `reason=no_lexical_evidence`; matches retornam `lexical_matches`;
se nenhum excerpt integral couber, `budget_excluded`. Consultas FTS são sempre
construídas com termos entre aspas, sem executar operadores fornecidos pelo usuário.

`recency=verified-ties-v1` considera a data `updated` somente depois de BM25 e
scope, somente para verified. Datas inválidas ou futuras recebem peso zero.
Não modifica status, não torna uma fonte verdadeira e não supera relevância BM25.
Candidate permanece elegível por compatibilidade, sem benefício de recência;
rejected/deprecated só aparecem quando pedidos explicitamente no scope permitido.

`format=compact-v1` remove created, updated e uses, mantendo ID, projeto, scope,
tipo, conteúdo integral, hash, status, origem, fonte completa, versão, trust e
proveniência duplicada. Não gera resumo. O formato full continua disponível.

`tokenBudget` é o nome legado para um limite em **bytes UTF-8**, não tokens.
O envelope JSON inteiro `{ok:true,data:...}` cabe nesse limite; o estimador
reserva os dígitos do orçamento para seu próprio campo, podendo superestimar
alguns bytes. Não mede tokenizer, economia de tokens ou custo de modelo.
Uma unidade que não cabe é omitida inteira, nunca truncada. Envelope vazio
inviável retorna erro estruturado `BUDGET_TOO_SMALL` antes de alterar contadores.
Respostas de erro e wrappers de transporte MCP não são envelopes de sucesso e
não estão dentro desse orçamento. Metadados opt-in também entram no orçamento.

`telemetry=true` adiciona somente versão local, número de candidatos retornados
antes do budget, policy e format ao resultado. Não grava arquivo, raw query ou
conteúdo e não faz upload/rede. Default off. Os contadores operacionais existentes
(retrievals, retrieval_items e uses), necessários para memory_stats/feedback,
continuam locais e ativos independentemente dessa opção; não são a telemetria
opcional. Duração operacional já existente não vira métrica de modelo.

A configuração experimental para o próximo executor está em
`benchmarks/v03/core-ablation-0.3.json`: balanced-v1, verified-ties-v1, compact-v1, telemetry off,
k=3, orçamento 32000 bytes. O freeze development 0.2 permanece intacto.
O core foi aprovado na revisão108 antes de103; as fontes históricas permanecem congeladas. A versão corrente usa metadados do pacote, sem alterar a semântica dessa política.
