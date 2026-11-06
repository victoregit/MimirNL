# Task66 — implementação entregue para revisão Task67

Preparação concluída; **zero chamadas reais de modelo**, sem subagentes e sem autoaprovação. Todo dirty anterior preservado; sem commit/push/merge, alterações core/CI/dependências ou coletor Task59/60.

Artefatos:

- `/mnt/d/Projects/MimirNL/scripts/benchmarks/context-selection-probe.mjs`
- `/mnt/d/Projects/MimirNL/test/benchmark-context-selection.test.mjs`
- `/mnt/d/Projects/MimirNL/docs/benchmarks/v03/selecao-contexto.md`
- `/mnt/d/Projects/MimirNL/tasks/66-v03-context-selection-result.md`

Reuso adicional: `/mnt/d/Projects/MimirNL/scripts/benchmarks/paired-probe.mjs`. Esse arquivo já estava untracked antes desta tarefa; seu conteúdo anterior foi lido e somente o diff abaixo foi aplicado. Transporte e sumário anteriores são reutilizados; o coletor não mudou.

Diff exato do runner anterior para revisão:

```diff
@@ transport parameters
   spawnImpl = spawn,
+  args = argsFor(scratch),
@@ transport local variables
     spawnError = false;
+  let firstMessageMs = null;
@@ spawn
-    child = spawnImpl("codex", argsFor(scratch), {
+    child = spawnImpl("codex", args, {
@@ completed agent message, after validation
+        firstMessageMs ??= clock() - start;
         response = e.item.text;
@@ returned metadata
     wall_ms: clock() - start,
+    first_agent_message_completed_ms: firstMessageMs,
```

O default conserva os argumentos do runner anterior. O novo runner injeta exclusivamente seu vetor fixo com modelo/esforço. O novo campo mede primeira mensagem completa desde antes do spawn, sem alterar o relógio do coletor aprovado.

Corpus extraído integralmente do commit exigido: optimization 850 bytes/27 linhas; learning 507/16; retrieval 1527/41; schemas 3288/111; storage 6676/153; git adapter 13034/446. Todos cabem no limite de 32000 caracteres. Hashes e conteúdo são recalculados por git show e registrados privadamente antes das chamadas. A verificação offline com Mimir real retornou uma unidade, optimization, hash `832cf164215cededa94fff24284dd80d5f3ee1351a9dd2dfee2177658c8b9473`. Isso é constatação de recuperação local, não resultado de qualidade de modelo nem regra de seleção. A API devolve identidade como `source.reference`; o adaptador normaliza esse campo e valida todas as unidades sem oracle.

Há três fixtures independentes, uma por posição B, preparadas e limpas antes do snapshot de plano. Assim todas as seis posições têm hashes efetivos antes da primeira chamada. `end_to_end_ms` é composição explícita `wall_ms + retrieval_ms`; exclui setup/store/fechamento e intervalo entre preparação e despacho. Não é uma requisição contínua de produção. Ordem AB/BA/AB; até seis chamadas; sem retry; timeout90s e teto10min; contextos de B não recebem baseline. Pool, pergunta e instrução são comuns. Ausência de fonte permanece nos retornos registrados e deve ser avaliada honestamente pelo reviewer.

Métricas: usage do host separado de bytes; cache não somado novamente; null distinto de zero; n/mediana/min/max, delta B−A, exclusões por métrica e cobertura incluindo falhas/not_run. Usage parcial fica nos registros de execução. Não há percentuais de redução, tokenizer estimado, avaliação por substring ou alegação causal. Modelo/configuração são solicitados, não observação de backend; identidade pública permitida e divergência ficam separadas. Custo/TTFT unavailable; qualidade pending independent review.

Checks concluídos com Node24 `/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node`:

- 20/20 testes offline: novo runner, runner anterior e coletor (`--test test/benchmark-context-selection.test.mjs test/benchmark-paired-probe.test.mjs test/benchmark-codex-usage.test.mjs`). Incluem SQLite/Mimir reais descartáveis e transporte simulado, sem binário Codex.
- Syntax `--check` dos dois runners e do novo teste: passou.
- Prettier local dos cinco arquivos tocados: passou.
- `git diff --check`: passou. Novos arquivos também verificados pelo Prettier; nenhum download de dependência.

Execução após revisão independente, **não realizada**:

```bash
/tmp/mimir-node-runtime/node-v24.22.1-linux-x64/bin/node /mnt/d/Projects/MimirNL/scripts/benchmarks/context-selection-probe.mjs --run --out /tmp/mimir-context-selection-reviewed-UNIQUE
```

O destino precisa ser novo. Revisão Task67 continua pendente; a autorização para 27 chamadas permanece fora de escopo. Não há resultado de economia/qualidade nesta entrega.
