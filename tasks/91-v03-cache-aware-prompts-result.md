# Task91 — diagnóstico de cache e prompt estável integrado

Implementação entregue para revisão independente Task92 em 2026-10-27. **actual_model_calls=0 nesta tarefa**, sem host/modelo real, warmup ou subagentes. Não houve commit/push, alteração de core/CI/deps/config global, DB pessoal, corpus, gold/pending ou evidência/manifesto Task87–90. Dirty/untracked preexistente preservado.

## Arquivos

Novos:

- /mnt/d/Projects/MimirNL/scripts/benchmarks/cache-diagnostic.mjs
- /mnt/d/Projects/MimirNL/scripts/benchmarks/stable-prompt.mjs
- /mnt/d/Projects/MimirNL/test/benchmark-cache-diagnostic.test.mjs
- /mnt/d/Projects/MimirNL/docs/benchmarks/v03/cache-aware-prompts.md
- /mnt/d/Projects/MimirNL/tasks/91-v03-cache-aware-prompts-result.md

Alterados: /mnt/d/Projects/MimirNL/scripts/benchmarks/multicase-codex.mjs e /mnt/d/Projects/MimirNL/test/benchmark-multicase-codex.test.mjs.

## Diagnóstico factual Task89

Leitura explícita somente de /tmp/mimir-task87-pilot-proposed/result.json pelo diagnóstico. Relatório novo /tmp/mimir-task91-cache-evidence/cache-report.json, diretório0700/arquivo0600, sem respostas/reasoning. Quatro posições elegíveis, sem exclusões. Ordem original preservada:

| Posição | Input total | Cached subset | Uncached derivado | Output | Total input+output | Cached/input |
|---|---:|---:|---:|---:|---:|---:|
| 1 orçamento completo |14931|12032|2899|174|15105|80.5840%|
| 2 orçamento Mimir |14736|12032|2704|176|14912|81.6504%|
| 3 p95 Mimir |14383|12032|2351|145|14528|83.6543%|
| 4 p95 completo |15078|12032|3046|151|15229|79.7984%|

Somas descritivas: input59128, cached48128, uncached11000, output646, total59774. Cache nunca somado ao total. Não são nova medição nem amostra homogênea de ganho. Tokens cached não podem ser atribuídos à instrução, catálogo, fontes ou overhead; origem específica unavailable. Custo, TTFT e identidade efetiva unavailable. Não inferir causa de latência ou cobrança.

[Documentação oficial de prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), consultada pelo supervisor em2026-10-27, descreve prefixos coincidentes e condições por modelo/roteamento. Não implica parâmetros API no CLI nem aumento garantido para prompts curtos. Nenhuma API/flag/key/breakpoint de cache foi introduzida, sem padding ou cache local de respostas.

## Formato e compatibilidade

Diagnóstico reutilizável: schema cache-diagnostic-1, entrada codex-multicase-result-1; validação estrutural e erros/exclusões por posição, projeção numérica de uso bruto mesmo em falha. Missing/inconsistência produz derivados null, zero preservado, input0 ratio=null com zero_input. Synthetic explicitamente excluído de medição. Só sucesso elegível; cobertura parcial não produz agregado. I/O público explícito usa leitor seguro existente, diretório exclusivo0700/wx0600 e sem overwrite. Import/help não executam leitura de evidências ou subprocessos.

V1 continua sem mudança em promptFor, schema ou manifesto. Teste reproduziu byte/hash do contexto1 b6577fb4f106b15f56b95c02ce34676728827d6bb1786f323cc5b6e054435227 e plano95870f259e83fb5b4ea4dab50de654a61258474e9ec9b6de2baf9bbd2c2216c5.

V2 opcional exige schema codex-multicase-plan-2 e prompt_layout estrito, incluído no hash. Layout instruction-sources-question-2 envia instrução fixa primeiro, histórico vazio, fontes públicas/proveniência na ordem selecionada e pergunta por último. Prefixo203bytes, SHA3443a352d33328a9b15e5a61a5c2963bd5459acd3b4bdc917b93f150bf6fd172. Métricas apenas do texto enviado pela aplicação; sem estimativa de tokenizer/cache host. ID/classe/query/status não entram no envelope. Novo layout chega efetivamente ao stdin do transporte fake; schema antigo não aceita layout, tamper falha e hash v1 não autoriza v2.

## Artefato e validação offline

/tmp/mimir-task91-stable-offline contém plan/result, quatro contextos públicos e quatro respostas **synthetic** produzidos com EventEmitter/PassThrough controlados, nenhum processo de modelo. Mesmos dois casos/ordem/reps/limites e bundle público executable=false da Task87; duas buscas Service reais em fixtures efêmeras. Manifesto proposed, hash c9170f251e90b200d4255512ee7028a4c69839632163baa244b778b063ba4dba. simulation=true, simulated_attempts4, completed_calls0, actual_model_calls0. Fixtures removidas; evidência preservada. Uso100/cache70/output8 é artificial, não medição.

Com Node /tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node e PATH correspondente:

- node scripts/benchmarks/cache-diagnostic.mjs --result /tmp/mimir-task87-pilot-proposed/result.json --out /tmp/mimir-task91-cache-evidence: passou.
- node /tmp/mimir-task91-prepare.mjs: preparação fake descrita acima, passou.
- node --test test/benchmark-cache-diagnostic.test.mjs test/benchmark-multicase-codex.test.mjs: **15/15**, log /tmp/mimir-task91-focused.log.
- npm test, uma vez após verde: build e **114 testes,113pass,1skip preexistente,0falhas**, log /tmp/mimir-task91-suite.log.
- node --check nos módulos novos: passou; demais módulos modificados importados pelos testes.
- Prettier direcionado aos dois módulos novos, executor, dois testes e guia: passou.
- git diff --check: passou.

Cobertura inclui cálculos/missing/cache inconsistente/total inconsistente/zero/parcial/falha/synthetic, ausência de resposta privada, permissões/nooverwrite/symlink, prefixo invariável com pergunta/fontes diferentes, v1 congelado, binding/tamper/autorização, stdin fake, IDs ausentes, isolamento público adversarial do executor, limites/cancelamento e cleanup. Não foi aberta DB default.

## Limitações e próximo gate

Nenhum ganho novo é alegado. Cache ambiente já pode estar quente e não há reset/cold garantido. Comparação futura precisa manter modelo/configuração, casos/fontes/queries/seleção, ordem/reps/limites e registrar versões/hashes e condições ambientais. O prefixo curto pode não produzir diferença observável.

Entrega para revisão Task92, sem autoaprovação ou autorização de piloto. Não criei workers ou operadores auxiliares; nada desta tarefa requer encerramento manual.

## Encerramento pelo supervisor — Task92 APPROVE

Revisão independente em [92-v03-cache-aware-prompts-review-findings.md](92-v03-cache-aware-prompts-review-findings.md) aprovou código/testes/documentação, reproduziu diagnósticoTask89 e confirmou15/15focados, v1 byte/hash preservados e v2 no stdin fake. Suíte da implementação113pass/1skip. Nenhuma chamada real adicional, custo ou ganho novo medido; prefixo203bytes da aplicação não explica cache12032 do host. Evidências anteriores preservadas, sem commit/push. Próximo passo técnico: plano de comparação real v1/v2 revisado com mesmas condições e limites, sem garantia de cachefrio/reset. Encerramento do revisor persistente a cargo do supervisor após resposta final; conferir sessão semworkers.

Revisor fe5c0963 concluiu resposta e foi encerrado explicitamente pelo supervisor; sessão cao-mimir confirmou workers=[] no fechamento.
