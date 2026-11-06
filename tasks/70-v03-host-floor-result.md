# Tasks70–73 — Entrada observada do host e recursos opcionais CLI

Diagnóstico executado em 2026-10-27, codex-cli0.164.0, modelo solicitado gpt-6.1-sol low. Mesma autenticação existente, sem leitura de config/auth/logs privados. Coletor Task59/60 e helpers Task66/67 reutilizados sem alteração de código. Nenhuma API direta, DB pessoal, integração nova, alteração global ou commit/push/merge. Só registros de coordenação novos.

## Pergunta mínima sem fontes ou memória

Prompt literal Task70/72: Responda apenas OK. Não use ferramentas, arquivos, memória, rede ou serviços adicionais. Três processos novos efêmeros por série, read-only/ignore-user-config, sem ferramentas solicitadas. Cada série sequencial; NÃO crossover ou pareamento simultâneo.

| Mediana n3 | CLI padrão Task70 | CLI restrito Task72 |
| --- | ---: | ---: |
| Entrada reportada | 14658 | 13703 |
| Cache, subconjunto | 12288 | 12032 |
| Saída reportada | 5 | 5 |
| Total reportado | 14663 | 13708 |
| Tempo coletor, ms | 4348.272458 | 3756.440630 |

Padrão inputs14658/14658/14115, cache12288todos. Restrito inputs13703cada, cache12032cada. Redução na razão de medianas input=(14658-13703)/14658*100=6.5152%. Tempo refere-se a observação local atéEOF; não comparar causalmente nem com carga factual mais longa. Este baseline inclui o prompt mínimo e tudo que o host acrescenta; não isola tokens exatos de sistema, tokenizer ou floor teórico imutável. Variação543tokens no padrão demonstra contexto interno dinâmico.

Task72 acrescenta por invocação SOMENTE --disable apps --disable plugins --disable multi_agent, flags marcadas stable no catálogo local. Shell_tool/code_mode_host, sandbox read-only, política de aprovação e regras permanecem; nenhum `codex features disable` ou edição de config persistente. Trata-se de teste textual sem essas capacidades, não configuração padrão global nem recomendação universal para agentes que precisam delas.

Evidências sanitizadas e privadas (dirs0700/files0600): /tmp/mimir-host-floor-task70-20261027/run-1.json até run-3.json; /tmp/mimir-restricted-floor-task72-20261027/run-1.json até run-3.json. Todos completed,4eventos,3pipelinesexit0 por série. Só metadata usage/tempo, sem prompt/resposta/transcript bruto/reasoning/stderr salvos.

## Tentativa mais ampla Task71 — falha preservada

Combinação com desativação adicional shell_tool/code_mode_host falhou na primeira posição (mensagem fixa coletor, pipelineexit1), sem relatório válido. Causa exata não determinada; usage/custo desconhecidos, NÃO zero. Posições2/3not_run. Não repetida essa mesma combinação. Pasta /tmp/mimir-lean-floor-task71-20261027 criada, sem relatório válido; não alegar ganho nem atribuir falha a flag específica.

## Conferência factual Task73

Reproduzido EXATAMENTE o envelope selecionado da Task68,1280bytes/SHA2569c039abdab2101901483fdc9f7183582c1ed78f6fd59283f1a85d4f8069776bf. Mesma pergunta/instrução/fonte e modelo/configuração solicitados, acrescentando flags restritas Task72. Replay de contexto antes recuperado, NÃO nova consulta Mimir nem novo tempo retrieval. Três pipelinesexit0/completed/4eventos. --output-last-message retém só respostas finais locais privadas para review; nenhum rawtrace ou stderr. Scratch próprio vazio removido após execução.

| Mediana n3 | Referência histórica Task68 seleção padrão | Task73 seleção modo restrito |
| --- | ---: | ---: |
| Entrada tokens | 14958 | 14003 |
| Cache subconjunto | 12288 | 12032 |
| Saída tokens | 179 | 171 |
| Total tokens | 15137 | 14174 |
| Tempo observado pelo coletor atéEOF, ms | 8365.404698 | 6442.098388 |

Task73 totais14174/14173/14177, inputs14003cada, outputs171/170/174. Redução da razão de medianas totais=(15137-14174)/15137*100=6.3619%,963tokens. Séries em momentos distintos, cache/contexto interno não controlados, sem inferência causal ou promessa de economia/latência. Não misturar essas diferenças com teste fullcontextTask68 como experimento único. Qualidade factual pendente Task74 antes de recomendar adoção nos testes. Backend/snapshot não exposto; modelo solicitado não prova identidade observada. Custo financeiro e TTFT unavailable.

Evidências Task73: /tmp/mimir-lean-question-task73-20261027/run-1.json a run-3.json e response-1.txt a response-3.txt, privados0700/0600. Plano da referência /tmp/mimir-context-selection-task68-20261027/plan.json foi lido só para reconstruir contexto allowlisted, sem respostas/gold enviados. Fonte fixada src/optimization/index.ts@166e3cf047b2078952e43dc8e9171e053e99e2ce.

No total deste diagnóstico:9chamadas com relatório válido e1tentativa sem medição; sem retries/fallbacks ou operadores auxiliares de execução. Um revisor independente Task74 foi solicitado para qualidade, separado destas chamadas. Não confundir isso com contagem financeira consolidada de todas as operações da orquestração.

## Fechamento Task74

Parecer independente em /mnt/d/Projects/MimirNL/tasks/74-v03-lean-question-review-findings.md: APPROVE. As três respostas Task73 passaram critérios factuais/citação e limite120palavras (95/92/95palavras); números originais e referência histórica foram conferidos. Não houve nova busca Mimir nessa conferência, somente replay do mesmo envelope fixado. Pode-se reutilizar nos próximos testes textuais o conjunto porinvocação `--disable apps --disable plugins --disable multi_agent`, mantendo explicitamente limites de capacidade; não adotar globalmente ou para agentes que precisam dessas funções sem teste próprio. Shell/sandbox/approvals/regras não foram removidos. Nenhum arquivo de aplicação foi alterado nesta etapa.

Resultado delimitado:6.36%menos tokens totais na razão de medianas frente à referência histórica de seleção; latência observada6.44s vs8.37s histórica, sem inferência causal ou garantia. Entrada ainda14003tokens com contexto1280bytes indica espaço relevante no host, mas não decomposição exata nem promessa de ganho com API. Próxima frente possível é adaptador de geração enxuto ou orçamentos/trechos adaptativos revisados; não executados/implementados aqui.
