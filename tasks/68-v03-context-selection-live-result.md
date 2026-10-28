# Task68 — Resultado real seleção de contexto

Executado em 2026-10-27 após APPROVE da revisão Task67 (retomada concluiu parecer ausente da primeira tentativa). Usuário autorizou nova forma de comparação. Uma invocação do runner Task66, seis processos novos AB/BA/AB, sem retries. Todos completed/exit0, sem timeout/ferramentas/exclusões. Sem commit/push/merge.

## Protocolo e evidências

Pasta privada /tmp/mimir-context-selection-task68-20261027: plan.json congelado antes das chamadas, seis run-N.json, seis response-N.txt, runs.json e summary.json. Diretório0700/arquivos0600. Bancos/repos/scratch descartáveis fechados e removidos; não foi aberto banco pessoal, nem ingerido repositório real. Respostas finais privadas retidas para revisão independente; não transcript bruto/reasoning/stderr.

Mesmo pool de seis módulos reais do commit166e3cf047b2078952e43dc8e9171e053e99e2ce. A contexto_completo envia os seis arquivos integralmente uma vez. B selecao_mimir envia só retorno real da query fixa estimateTokens optimize, limit3; todas as três buscas retornaram uma unidade src/optimization/index.ts@166e3cf047b2078952e43dc8e9171e053e99e2ce, hash832cf164215cededa94fff24284dd80d5f3ee1351a9dd2dfee2177658c8b9473. Sem seleção manual posterior ou duplicação do corpus base.

Modelo SOLICITADO gpt-6.1-sol, model_reasoning_effort=low, idênticos nas seis invocações CLI0.164.0. Identidade de backend/snapshot não exposta e não inventada; model_divergence null indica não observado, não prova equivalência. Contexto interno/cache do host não controlados. Um pacote documental development, não histórico real/holdout.

Envelope realmente enviado A26668bytes, B1280bytes; bytes são só tamanho, não tokenizer. Hashes envelopes A224858517c3024e267cbd71becb75cc60e367ea9ebbc1933f53732e0cbb8d963 e B9c039abdab2101901483fdc9f7183582c1ed78f6fd59283f1a85d4f8069776bf. context_bytes mede JSON do contexto normalizado (A27734/B975), diferente do envelope textual; não misturar representações.

## Medianas por condição (n3 cada, cobertura6/6)

| Medida | Contexto completo | Seleção Mimir |
| --- | ---: | ---: |
| Entrada tokens reportada | 21127 | 14958 |
| Cache, subconjunto da entrada | 12288 | 12288 |
| Saída tokens reportada | 180 | 179 |
| Total tokens reportado | 21297 | 15137 |
| Tempo processo modelo, ms | 7338.559344 | 8366.788500 |
| Tempo composto modelo + busca, ms | 7338.559344 | 8367.432814 |
| Primeira mensagem completa desde spawn, ms | 6631.928580 | 7815.078198 |
| Busca local, ms | não se aplica | 0.644314 |

Cada coluna é mediana independente; não somar medianas input/output para reconstruir mediana total. Todos totais por run são input+output e cache não é somado de novo.

Diferença das medianas totais6160tokens, razão de redução (21297-15137)/21297*100=28.9243%. Deltas totais pareados B-A: -6170/-6162/-5624, mediana-6162tokens; reduções pareadas28.9576%/28.9337%/27.0853%, mediana28.9337%. Fórmulas distintas, não intercambiáveis.

Deltas compostos B-A: +821.416733/-178.080141/+1028.873470ms, mediana+821.416733ms. Diferença das medianas de tempo+1028.873470ms; não confundir delta mediano pareado com diferença de medianas. Tempo pior neste conjunto, sem atribuição causal ao Mimir ou ao provedor.

Setup B separado1400.585499/17.909656/12.312324ms; mediana17.909656ms. Consultas preparadas antes da primeira chamada para congelar contextos: tempo composto=wall+retrieval uma vez, não requisição contínua de produção; setup/store/close e intervalo entre preparação e despacho excluídos. TTFT e custo financeiro unavailable.

## Alcance e pendências

Redução observada de tokens neste pacote/pergunta, não promessa de economia universal ou monetária. Só3pares/1pergunta, corpus conhecido development, cache12288 em todas chamadas e variação interna de543tokens em A apesar do envelope fixo. Nenhuma melhoria de ranking/core foi implementada para obter resultado. Não comparar diretamente ao teste de redundância Task64 como mesma intervenção.

Qualidade aguarda revisão independente Task69 em tasks/69-v03-context-selection-answer-review-findings.md. Não confundir completed com correção factual. Supervisor conferirá parecer e limpeza antes de entregar fechamento ao usuário.

## Fechamento de qualidade — Task69

A pendência acima foi resolvida: /mnt/d/Projects/MimirNL/tasks/69-v03-context-selection-answer-review-findings.md registra APPROVE. Todas seis respostas passaram C1bytes/tokens, C2seleção/continuidade e C3citação exata, e ficaram<=120palavras. Contexto completo3/3 e seleção Mimir3/3, sem respostas excluídas/não avaliadas. Revisor conferiu hashes/envelopes e aritmética por run/medianas/pares, sem novas chamadas de benchmark. Conclusão limitada: redução observada~29%tokens com qualidade preservada nesta pergunta/pacote; tempo mediano maior, nenhum ganho causal de velocidade estabelecido. Não atribuir necessariamente a diferença de tempo a uma causa específica sem experimento próprio. Nenhuma alteração de código após Task67 APPROVE.
