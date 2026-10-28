# Task93 — Preparação da comparação v1/v2

Preparação concluída em 2026-10-27, entregue para revisão Task94. **actual_model_calls=0**. Nenhum run, modelo real, warmup, simulação, recuperação Mimir ou fixture foi executado. Nenhum código novo/alterado, suíte ampla, commit/push, subagente ou operador auxiliar. Dirty preexistente preservado.

## Manifestos públicos

Diretório exclusivo /tmp/mimir-task93-plans, permissão 0700; quatro arquivos 0600 criados com wx, status proposed. Bundle original /tmp/mimir-task87-public/bundle.json, SHA canônico daaaf6cb68617339155892de592f444f65b1ec102d0f8b700f03682ea3d0d0d7, executable=false preservado. Revisões dos dois casos: 1. Manifestos v1 usam schema codex-multicase-plan-1 sem campo layout; v2 usa codex-multicase-plan-2 e STABLE_LAYOUT exato. Piloto histórico e implementação v1 intactos. Hashes abaixo são SHA-256 do corpo canônico, excluindo sha256, conferidos após releitura.

| Plano | Manifesto absoluto | Destino futuro absoluto | SHA canônico |
|---|---|---|---|
| budget-v1 | /tmp/mimir-task93-plans/budget-v1.json | /tmp/mimir-task95-budget-v1 | 5afc17caa99980f42fbc54e5cbc70c4c5d6b50320e6538ba029d8c3fbc7a165b |
| budget-v2 | /tmp/mimir-task93-plans/budget-v2.json | /tmp/mimir-task95-budget-v2 | 62e63774e7165970424432f3441c12f869d9b0ae91ab837d4dfed7856c53d0e8 |
| p95-v2 | /tmp/mimir-task93-plans/p95-v2.json | /tmp/mimir-task95-p95-v2 | de6fbdabc4b1324fa42c4e075b86670f6d5f29d5ede47d221d51577efee66e7a |
| p95-v1 | /tmp/mimir-task93-plans/p95-v1.json | /tmp/mimir-task95-p95-v1 | c08f565387d75aee91b50a5bf6a5e9ec01753c0d8f6bccc1b3df3284d80b256a |

## Ordem e limites

A=contexto_completo; B=selecao_mimir. Offset 0 nos dois planos orçamento; offset 1 nos dois planos p95, pois cada manifesto contém só um caso. Ordem derivada por validateManifest/plan, não presumida. Uma repetição.

| Posição global | Invocação/layout | Caso | Braço |
|---|---|---|---|
| 1 | budget-v1 | expanded-budget-envelope | contexto_completo |
| 2 | budget-v1 | expanded-budget-envelope | selecao_mimir |
| 3 | budget-v2 | expanded-budget-envelope | contexto_completo |
| 4 | budget-v2 | expanded-budget-envelope | selecao_mimir |
| 5 | p95-v2 | expanded-production-p95-absent | selecao_mimir |
| 6 | p95-v2 | expanded-production-p95-absent | contexto_completo |
| 7 | p95-v1 | expanded-production-p95-absent | selecao_mimir |
| 8 | p95-v1 | expanded-production-p95-absent | contexto_completo |

Cada invocação: max_calls=2, call_ms=90000, total_ms=240000, context_bytes=32000, output_bytes=64000, instrução até120 palavras. Teto agregado de oito tentativas e 960000ms (960s); executar sequencialmente uma única vez cada comando, sem retry, warmup ou substituição de modelo. Primeira falha interrompe a invocação sem retry; recomenda-se interromper também a sequência para revisar falha, sem completar/repetir por conta própria. Setup local não preemptivo pode ultrapassar prazo; teto temporal é orçamento do executor, não garantia rígida de relógio. A instrução de palavras e bytes capturados não limitam tokens faturáveis; custo unavailable.

Queries, pools, k/limit/tokenBudget e caps por caso vêm integralmente do mesmo bundle imutável, sem reexportação ou alteração; nenhum oracle/gold/resposta/DB pessoal. Cada B cria fixture própria e busca Service real; sem reusar DB, scratch, seleção ou respostas. Destinos não existiam antes e seguem ausentes após validate. Nunca apagar saída anterior para reusar; se algum destino já existir no momento de execução, parar e revisar novo manifesto/hash/destino.

Host idêntico ao plano histórico: binário /home/usuario/.codex/packages/standalone/releases/0.164.0-x86_64-unknown-linux-musl/bin/codex, solicitado gpt-6.1-sol, effort low, transporte codex-lean-jsonl-posix-1, coletor existente codex-usage-cli.mjs. Nenhum processo do binário host foi iniciado. Identidade efetiva continua unavailable se não publicada pelo host; registrar divergência se observada, sem trocar modelo. Configuração ignore-user-config/ephemeral/read-only/empty-cwd, apps/plugins/multi_agent desabilitados.

## Comandos exatos

Os quatro validate abaixo foram executados com sucesso, dois slots e actual_model_calls=0 cada, sem spawn de host nem artefatos de execução. Os quatro run são somente comandos revisáveis para Task95 após Task94; não foram executados. Hash/manifesto proposed não constituem autoaprovação. Usar cwd /mnt/d/Projects/MimirNL e Node absoluto abaixo.

### Validate (executados)

```bash
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex.mjs --validate --bundle /tmp/mimir-task87-public/bundle.json --manifest /tmp/mimir-task93-plans/budget-v1.json
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex.mjs --validate --bundle /tmp/mimir-task87-public/bundle.json --manifest /tmp/mimir-task93-plans/budget-v2.json
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex.mjs --validate --bundle /tmp/mimir-task87-public/bundle.json --manifest /tmp/mimir-task93-plans/p95-v2.json
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex.mjs --validate --bundle /tmp/mimir-task87-public/bundle.json --manifest /tmp/mimir-task93-plans/p95-v1.json
```

### Run (não executados; ordem obrigatória)

```bash
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex.mjs --run --bundle /tmp/mimir-task87-public/bundle.json --manifest /tmp/mimir-task93-plans/budget-v1.json --authorize-plan 5afc17caa99980f42fbc54e5cbc70c4c5d6b50320e6538ba029d8c3fbc7a165b
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex.mjs --run --bundle /tmp/mimir-task87-public/bundle.json --manifest /tmp/mimir-task93-plans/budget-v2.json --authorize-plan 62e63774e7165970424432f3441c12f869d9b0ae91ab837d4dfed7856c53d0e8
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex.mjs --run --bundle /tmp/mimir-task87-public/bundle.json --manifest /tmp/mimir-task93-plans/p95-v2.json --authorize-plan de6fbdabc4b1324fa42c4e075b86670f6d5f29d5ede47d221d51577efee66e7a
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex.mjs --run --bundle /tmp/mimir-task87-public/bundle.json --manifest /tmp/mimir-task93-plans/p95-v1.json --authorize-plan c08f565387d75aee91b50a5bf6a5e9ec01753c0d8f6bccc1b3df3284d80b256a
```

## Comparação e limites de interpretação

Comparar v1/v2 dentro do mesmo caso e braço, conferindo pergunta, instrução, histórico vazio, fontes/proveniência/excerpts/SHA e ordem selecionada. Na preparação, a projeção JSON completa do pool A foi comparada via canonical(JSON.parse(prompt)) e é semanticamente idêntica em ambos layouts para os dois casos. Não se alegou seleção B antecipada. Na execução, extrair os envelopes públicos context-N.json, ignorar somente a ordem das chaves do layout e comparar canonical(JSON.parse(prompt)), além da lista ordenada de source_id/unit_id/path/start_line/end_line/sha256/excerpt. Se seleção B ou sua ordem variar por fixture, ranking ou empate, registrar confound e não atribuir diferença a layout/cache. Não ordenar arrays para esconder divergência. IDs de caso/classe/query/status não entram em prompt, cwd ou seed; somente fontes públicas entram no seed.

STABLE_LAYOUT: {"version":"instruction-sources-question-2","prefix_bytes":203,"prefix_sha256":"3443a352d33328a9b15e5a61a5c2963bd5459acd3b4bdc917b93f150bf6fd172"}. Bytes e hash de prefixo são da aplicação, sem tokenizer ou estimativa de cache do host. Medir apenas diferenças observadas; input total inclui cached como subconjunto, não somar novamente. Ausência/inconsistência de uso/identidade mantém unavailable. Cache12032 histórico não é medição nova nem atribuível a trechos, instrução, fontes ou overhead. Não introduzir parâmetros API de cache no CLI, padding ou aquecimento.

Comparação exploratória N=2 casos, uma repetição, ambiente potencialmente quente sem reset/cold garantido. Alternância de layout reduz apenas parte do efeito de ordem; tempo/ambiente/identidade/seleção continuam possíveis confounds. Tempo contínuo inclui busca Mimir exatamente uma vez, serialização/transporte/coleta; setup/cleanup fora da métrica end-to-end, embora consumam orçamento da invocação. Separar wall/retrieval/setup e não somar busca novamente. Custo e TTFT unavailable; nenhuma causalidade ou ganho geral pode ser concluído desta amostra.

Preparação técnica não executa nem autoaprova o plano. Próximo gate: revisão independente Task94; execução Task95 e revisão de respostas/métricas Task96 cabem ao supervisor na sequência autorizada. **actual_model_calls=0 nesta tarefa.**
