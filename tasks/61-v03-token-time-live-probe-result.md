# Task61 — Resultado da conferência real mínima

Concluída em 2026-10-27 após APPROVE da revisão independente Task60. Uma invocação Codex CLI 0.164.0, nova/efêmera, read-only, ignore-user-config, diretório temporário vazio, pergunta literal da Task61, timeout externo 90 s, sem retry. Nenhum transcript bruto ou resposta foi salvo; stderr descartado. Sem repo/DB/ingestão/MCP configurado por esta tarefa. Não é comparação com/sem Mimir nem execução do piloto completo.

Relatório sanitizado local: /tmp/mimir-token-probe.FcKloU/usage.json. Pipeline com pipefail retornou 0; collector status completed, quatro eventos, um turn.

| Medida | Valor |
| --- | ---: |
| Tokens entrada reportados pelo host | 14714 |
| Entrada em cache (subconjunto) | 12288 |
| Entrada não cacheada (diferença aritmética) | 2426 |
| Tokens saída reportados pelo host | 82 |
| Total entrada + saída, sem somar cache novamente | 14796 |
| Tempo observado desde início do coletor até EOF | 6436.593968 ms |
| Primeiro evento observado | 842.8305 ms |
| Primeira mensagem completa | 5572.784756 ms |
| Evento turn.completed | 5576.771931 ms |

TTFT e custo financeiro unavailable. Modelo exato não foi exposto no relatório sanitizado; não inventar identidade nem tarifa. Contadores incluem contexto interno do host: não equivalem a tokenização apenas da pergunta. Tempo inclui pipeline/startup/buffering; não é inferência pura. Schema experimental correspondeu ao stream desta invocação local; isso não valida todos modelos/hosts ou versões futuras. Observação não comprova cobrança nem ganho. Resposta completa/qualidade não foi retida/avaliada nesta conferência.

Coletor em /mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage.mjs e /mnt/d/Projects/MimirNL/scripts/benchmarks/codex-usage-cli.mjs; documentação /mnt/d/Projects/MimirNL/docs/benchmarks/v03/tokens-tempo.md; aprovação /mnt/d/Projects/MimirNL/tasks/60-v03-token-time-review-findings.md. Sem commit/push/merge ou alteração de código após revisão.

Próxima etapa: comparação exploratória com/sem memória com modelo/parâmetros explicitamente fixados, mesma tarefa, estados isolados, coleta de uso/tempo e avaliação de qualidade. Este resultado não afirma que tal comparação já aconteceu.
