# Métricas offline v0.3 — adaptador experimental

> Atualização Task99 (2026-10-27): conteúdo abaixo preserva a proposta/perfil histórico 0.1. Para novo trabalho, consultar a [emenda0.2](contrato-0.2.md) e o [plano de fechamento](fechamento-0.2.md), pendentes de revisão Task100. Autorizações e tetos antigos não substituem a continuidade delimitada da sessão; accepted/validated legados não serão fabricados. Há execução exploratória A/B posterior nas [Tasks82](../../../tasks/82-v03-two-host-closeout.md), [90](../../../tasks/90-v03-multicase-codex-pilot-review-findings.md) e [96](../../../tasks/96-v03-layout-live-comparison-review-findings.md); ABC novo permanece pendente.

Entrega da Task52, com **revisão independente [APPROVE na Task53](../../../tasks/53-v03-benchmark-metrics-review-findings.md)**; integração pendente. A [proposta de contrato 0.1](contrato.md) continua não aprovada. Este adaptador calcula métricas sobre registros explicitamente fornecidos pelo chamador ou replay experimental. Não é schema de executor acordado, não executa o plano e não comprova execução, fontes, permissões, gold, revisão humana ou ganhos reais.

O módulo [metrics.mjs](../../../scripts/benchmarks/metrics.mjs) exporta a função pura `evaluateMetrics(cases, batch)`. Importar módulo ou CLI não realiza I/O. `cases` é o array privado do preflight. `batch` tem exatamente estas chaves:

```json
{
  "adapter_version": "experimental-1",
  "k": 3,
  "latency_method": "caller_elapsed_ms",
  "task_success_method": "manual_rubric",
  "plan": {},
  "observations": []
}
```

O objeto `plan` acima é um placeholder documental: substituir pelo objeto **completo e inalterado** produzido por `planCases(cases, repetitions)`. O exemplo não é um batch válido ou executado. `k` deve ser inteiro positivo seguro, definido pelo responsável pelo experimento antes das observações e constante no batch; a ferramenta não escolhe k. `latency_method` aceita somente `caller_elapsed_ms`: ambas as latências são durações em milissegundos declaradas pelo chamador. `task_success_method` aceita `manual_rubric` ou `null` (nenhum sucesso manual disponível).

A ferramenta reutiliza `validateCases` e rederiva o plano para comparar todos os campos, inclusive IDs, revisões, commits, ordem, cenários, repetições, limites e metadados não executáveis. Não aceita um plano reduzido ou modificado. A identidade preservada é apenas a do plano público preflight: este protótipo não representa nem agrega manifestos reais. Só aceita casos não ilustrativos, accepted e gold validated com referências completas, ainda declarações não verificadas. Casos sem gold ficam fora deste adaptador por essa exigência do preflight. Rejeita batches com splits development/evaluation misturados. Para evitar ambiguidade nas referências de gold `source_id/unit_id`, os componentes não podem conter `/` neste adaptador.

Cada observação exige exatamente as chaves deste exemplo **sintético**, sem conteúdo de resposta, tarefa, fonte ou rubrica:

```json
{
  "run_id": "planned-2",
  "status": "completed",
  "truncated": false,
  "retrieved": [
    {
      "source_id": "synthetic-guide",
      "unit_id": "unit",
      "commit": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "stale_status": "current"
    }
  ],
  "retrieval_latency_ms": 2,
  "total_latency_ms": 5,
  "task_success": false,
  "review": {
    "evidence_ref": "local-review-reference",
    "reviewer_ref": "reviewer-reference"
  }
}
```

`run_id` deve existir no plano e ser único no batch. Status: `completed`, `error`, `timeout`, `denied`, `infeasible`. Runs ausentes continuam `not_run`, sem tentativa. `truncated` é booleano obrigatório. Cada latência é número finito não negativo ou null; zero é medida disponível. Não se soma retrieval à duração total. Status diferente de completed exige `task_success=null` e `review=null`; latências e retrieval parciais podem existir, sem transformar falha em sucesso.

Para `com_mimir`, `retrieved` é array, inclusive vazio; cada unidade deve corresponder exatamente ao par `(source_id, unit_id)` de uma fonte declarada no caso e ao commit fixado pelo plano. IDs/commit não provam fonte conferida. `stale_status` é obrigatório: `current`, `stale` ou `unknown`, sempre declarado. Duplicatas com stale status conflitante são rejeitadas. Baselines exigem `retrieved=null` e `retrieval_latency_ms=null`.

`task_success` é bool ou null. Booleano exige método `manual_rubric` e `review` com exatamente duas referências não vazias: `evidence_ref` e `reviewer_ref`. Elas não são abertas, verificadas nem exportadas. Null exige `review=null`. Não há avaliador automático de rubrica; essa é somente proveniência manual declarada. Métodos por run e campos extras em qualquer objeto são rejeitados com mensagem fixa. Assim não se misturam métodos ou unidades em pares.

## Cálculo e denominadores

As métricas usam `{value, reason}`: valor numérico disponível tem `reason=null`; ausência tem `value=null` e razão `not_run`, `unavailable` ou `N_A`. Todas as runs aparecem com metadados públicos allowlisted do plano, status observado e truncamento. Não se exportam unidades recuperadas, gold, tarefa, respostas, paths, repository, trechos, nomes/critérios de rubrica, notas ou referências humanas.

- Precision@k: deduplica pares canônicos preservando a ordem, seleciona os primeiros k, conta hits relevantes e divide por **k**, inclusive quando há menos retornos. Recall@k divide os mesmos hits pelo número de unidades relevantes; conjunto relevante vazio produz `N_A`. Baselines têm retrieval `N_A`.
- Stale: usa todas as unidades únicas recuperadas (não só top k), com contagens de únicas, stale e unknown. Zero unidades produz `N_A`; qualquer unknown produz null/unavailable; caso contrário stale/únicas. Unknown nunca conta como current.
- Source accuracy: sempre null/unavailable, pois não recebe afirmações/citações avaliadas por humanos. Existência de IDs não implica correção da resposta.
- Coverage por cenário: tentativas/planned; `not_run` não é tentativa. Contagens separadas incluem todos os status. Failure rate é (error+timeout+denied+infeasible)/tentativas; sem tentativas resulta `N_A`. Completed truncado continua completed na contagem, mas fica fora de comparações. Sucesso manual por cenário mostra n, mediana, mínimo e máximo dos completed não truncados disponíveis, incluindo false como 0.
- Comparações: com_mimir versus cada baseline, pareadas por caso/revisão/repetição no mesmo plano. Só completed, não truncados e com a métrica disponível. Cada comparação mostra planned_pairs, eligible_pairs, coverage, exclusões, n/mediana/min/max das diferenças absolutas **mimir − baseline** e percentuais. Latência menor gera diferença negativa; sucesso pior também gera diferença negativa. Não são rotulados automaticamente como ganhos.
- Exclusões de par têm precedência determinística e exclusiva: `not_run`, `not_completed`, `truncated`, `unavailable`. Contagens por cenário preservam as falhas que essa precedência poderia ocultar no par. Não existem pares sem correspondente no plano validado; observação sem run correspondente é erro de entrada.
- Percentual é 100 × diferença/baseline somente se baseline > 0. Baseline zero ou resultado numérico não finito fica fora da estatística percentual, com contagem `baseline_zero` ou `nonfinite_percentage`. Sem valores a estatística tem n=0 e mediana/min/max null. Não há percentual inventado para baseline zero.

Retrieval fica **por run**: nenhuma agregação macro/micro sobre casos ou repetições é implementada. Comparações também são estatísticas descritivas de pares por run, não estimativas de efeito, significância ou demonstração de ganho com cobertura parcial. Uso/tokens, tokenizer, cache, preços e custo não são implementados; saída registra `not_implemented`, sem zeros fictícios. Manifesto aprovado, modelo, executor, corpus real, protocolos de isolamento e verificação independente continuam futuros.

## CLI e validação

Da raiz do projeto, com Node suportado:

```sh
node scripts/benchmarks/metrics-cli.mjs --help
node scripts/benchmarks/metrics-cli.mjs /caminho/privado/casos.json /caminho/privado/batch.json
node scripts/benchmarks/metrics-cli.mjs /caminho/privado/casos.json /caminho/privado/batch.json --out /caminho/local/relatorio-novo.json
```

Só os dois JSON explícitos são lidos. Por padrão é read-only, com relatório no stdout. `--out` cria exclusivamente com `wx`, modo solicitado 0600; arquivo ou symlink já existente é rejeitado sem modificar seus bytes. Ajuda/sucesso retornam 0; argumentos, entrada e destino inválidos retornam 1. Diagnósticos são fixos e não mostram caminhos nem dados recebidos. Relatório sempre marca `experimental=true`, `provenance=caller_not_verified`, `not_execution_proof=true`, `plan_executable=false`.

Os [testes](../../../test/benchmark-metrics.test.mjs) usam exclusivamente fixtures sintéticas; números de teste não constituem benchmark real. A Task52 não aprova o próprio contrato ou implementação. A revisão independente registrou [APPROVE na Task53](../../../tasks/53-v03-benchmark-metrics-review-findings.md); integração permanece pendente.
