# Task64 — Comparação real exploratória com/sem Mimir

Executada em 2026-10-27, após revisão independente APPROVE Task63 e autorização do usuário para três repetições por condição. Uma única invocação do runner revisado, sem retries: seis processos novos na ordem AB/BA/AB. Raiz /mnt/d/Projects/MimirNL, branch docs/v03-corpus-methodology. Nenhum commit/push/merge.

## Evidências e integridade

Diretório privado: /tmp/mimir-paired-probe-lAJUGU (0700). plan.json, run-1.json até run-6.json, runs.json, response-1.txt até response-6.txt e summary.json (0600). Relatório preserva seis posições, todas completed/exit0, sem ferramentas, timeouts ou exclusões. Nenhuma chamada adicional foi feita para corrigir resultados. Fixtures DB/repos/scratch próprios removidos pelo runner; só evidências privadas retidas.

Fonte compartilhada: src/optimization/index.ts, 27 linhas do commit 166e3cf047b2078952e43dc8e9171e053e99e2ce, SHA-256 832cf164215cededa94fff24284dd80d5f3ee1351a9dd2dfee2177658c8b9473. Baseline recebe fonte integral; B recebe a mesma fonte mais recuperação real do mesmo trecho via Service/Storage descartáveis, candidate sem promoção/autoaprovação. Não houve ingestão nem acesso ao banco pessoal.

## Medianas observadas (n=3 por condição)

| Medida | Sem memória (A) | Com Mimir (B) |
| --- | ---: | ---: |
| Entrada tokens | 14415 | 14708 |
| Entrada em cache, subconjunto | 12288 | 12288 |
| Saída tokens | 181 | 173 |
| Total entrada + saída | 14596 | 14883 |
| Tempo end-to-end, ms | 7221.283235 | 6451.678042 |
| Tempo processo Codex, ms | 7221.103073 | 6447.847753 |
| Recuperação local, ms | não se aplica | 0.471566 |

Setup do banco de B separado: 1094.723228 ms, 12.194221 ms e 11.059404 ms (mediana 12.194221 ms). End-to-end inclui recuperação uma vez, mas não construção inicial do banco descartável.

Deltas pareados B menos A: total tokens -267, +287, +829 (mediana +287); end-to-end -769.605193 ms, -47.542469 ms, -2997.674246 ms (mediana -769.605193 ms). Publicar variação/cobertura, não tratar mediana como efeito causal.

## Limitações e avaliação

Uso reportado pelo Codex CLI 0.164.0; inclui contexto interno, não só pergunta/fonte. Identidade exata do modelo unavailable nos eventos públicos capturados; argumentos/default constantes não comprovam identidade/versão equivalente entre chamadas. Entrada variou em 543 tokens dentro das condições apesar do mesmo prompt básico. Cache reportado 12288 em todas as seis chamadas, sem controle de estado interno do provedor. TTFT e custo financeiro unavailable; tempo observado inclui overheads/pipeline/modelo.

Este teste mede redundância/sobrecarga quando a fonte já estava disponível. Mais tokens com memória neste cenário não prova inutilidade geral; menor tempo observado não prova aceleração causada pelo Mimir. Três pares/uma pergunta development não demonstram economia, generalização ou significância.

Qualidade aguardando parecer independente em tasks/65-v03-paired-answer-review-findings.md; não confundir completed com sucesso factual. Revisão das respostas é separada das seis chamadas e não altera respostas originais. Código permaneceu inalterado após APPROVE Task63; nenhum banco real, configuração de host ou transcrição bruta foi utilizado/retido.

## Fechamento — revisão de qualidade concluída

A pendência de qualidade acima foi resolvida pela Task65 em /mnt/d/Projects/MimirNL/tasks/65-v03-paired-answer-review-findings.md: APPROVE, seis respostas aprovadas nos três critérios factuais/citação e no limite120palavras. Sem memória3/3 e com Mimir3/3, nenhuma resposta excluída ou não avaliada. O revisor conferiu também contadores e tempos originais sem executar novas chamadas. Não adotar interpretação causal do delta de tokens/latência: há duplicação deliberada de fonte, mas contexto interno/modelo/default não foram controlados. Próxima etapa possível: modelo/parâmetros explícitos e comparação de seleção de contexto contra histórico completo, com corpus/distratores revisados; não executada nesta tarefa.
