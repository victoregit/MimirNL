# Seleção de contexto — protocolo exploratório Task66

Implementação preparada para revisão independente Task67. **Nenhuma chamada real foi executada nesta tarefa.** Não executar antes da revisão. Este experimento development usa um pacote documental; não representa conversa anterior ou holdout e não se mistura com Task64.

O runner extrai com `git show` seis arquivos reais do commit `166e3cf047b2078952e43dc8e9171e053e99e2ce`: `src/optimization/index.ts`, `src/learning/index.ts`, `src/retrieval/index.ts`, `src/core/schemas.ts`, `src/storage/index.ts` e `src/ingestion/adapters/git.ts`. Uma unidade por arquivo, identidade `path@SHA`, conteúdo integral, SHA-256, bytes e linhas registrados no plano privado. Unidades acima de 32000 caracteres bloqueiam antes da criação de evidências/modelos com diagnóstico; não há troca de corpus.

A (`contexto_completo`) envia os seis arquivos uma vez cada. B (`selecao_mimir`) envia somente as unidades de uma busca Mimir por posição B, sem acrescentar o contexto completo. Ambos usam a mesma instrução e pergunta da Task62, sem rubrica ou resposta esperada. O corpo contém somente identificador portátil e conteúdo, além da instrução e pergunta comuns.

Cada uma das três posições B cria Service/Storage novos e um Git vazio em fixture privada. Registra seis unidades candidate/user, sem aprovação ou ingestão, e consulta `estimateTokens optimize`, `includeGlobal:false`, `limit:3`, `tokenBudget:100000`. Esse último nome pertence à API; o orçamento é limite em bytes, não tokenizer. Todas as unidades retornadas passam por pertencimento, conteúdo, hash e deduplicação. Não existe seleção posterior por relevância esperada. Resultado vazio continua vazio; ausência de uma fonte fica verificável na lista completa de identidades retornadas e deve entrar na avaliação independente.

As três buscas são preparadas antes da primeira chamada, para congelar todos os contextos efetivos no `plan.json`. Setup/store, consulta e fechamento são medidos separadamente; fixtures são fechadas e removidas em `finally`. O tempo entre preparação e chamada não integra a métrica composta. `end_to_end_ms = wall_ms + retrieval_ms`, com consulta contada uma vez em B e zero em A. Não é uma medição contínua de uma requisição de produção. `wall_ms` começa antes do spawn; `first_agent_message_completed_ms` também parte desse início e mede mensagem completa, nunca TTFT. O coletor aprovado mantém seu próprio referencial temporal documentado.

Seis processos novos sequenciais, AB/BA/AB, sem retry. Modelo solicitado `gpt-6.1-sol`, configuração solicitada `model_reasoning_effort="low"`, sem fallback. A disponibilidade no catálogo local foi informada na especificação; o runner não faz chamada de descoberta. Argumentos fixos:

```text
exec -m gpt-6.1-sol -c 'model_reasoning_effort="low"' --ignore-user-config --ephemeral --sandbox read-only --skip-git-repo-check --cd SCRATCH_VAZIO --json -
```

Identidade do backend permanece indisponível se não vier em metadados públicos permitidos; identidade observada e divergência são registradas separadamente do modelo solicitado. Sem temperatura ou seed inventadas. Timeout de 90 segundos por processo e teto de 10 minutos, incluindo preparação, limitam o despacho. Limites de stdout 16 MiB, linha/stderr 1 MiB e resposta 64000 bytes vêm do transporte anterior, assim como rejeição de ferramentas e descarte de reasoning, stderr e transcript.

Saída exclusiva em diretório novo sob `/tmp`, diretório 0700 e arquivos 0600. `plan.json` contém fontes e hashes dos contextos/envelopes antes da primeira chamada. `response-N.txt` contém somente resposta final privada; `run-N.json`, `runs.json` e `summary.json` retêm metadados sanitizados e estados inclusive falhas/not_run. Scratch e bancos descartáveis são removidos. Não publicar essas evidências automaticamente.

Usage real do host usa o coletor Task59/60 sem alteração: input/cache/output/total, total=input+output; cache já pertence ao input. Null é ausência, não zero. Sumários trazem n/mediana/min/max por condição, deltas pareados B−A, cobertura e exclusões por métrica. Usage parcial de falhas permanece nos registros, mas não entra nos agregados de chamadas completas. Não se calculam percentuais de redução. Bytes de fonte/contexto/envelope são apenas bytes, separados de usage. Custo e TTFT permanecem unavailable; qualidade pending independent review. Nenhum resultado garante economia ou causalidade, com apenas três pares e cache/contexto interno não controlados.

Execução somente após revisão independente, a partir de `/mnt/d/Projects/MimirNL`, com build existente atualizado:

```bash
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/context-selection-probe.mjs --run --out /tmp/mimir-context-selection-reviewed-UNIQUE
```

Importação e `--help` não abrem DB nem chamam modelos. Os testes injetam transporte sem binário Codex e exercitam recuperação Mimir real descartável.
